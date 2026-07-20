"""
auth/blueprint.py
──────────────────
Flask Blueprint — all /api/auth/* endpoints.

Endpoints
─────────
POST /api/auth/signup    → create user account
POST /api/auth/login     → authenticate, issue access + refresh tokens
POST /api/auth/refresh   → rotate refresh token, issue new access token
POST /api/auth/logout    → revoke refresh token server-side
GET  /api/auth/me        → return current user profile (JWT required)
POST /api/auth/change-password → update password (JWT required)
"""
import os
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from marshmallow import ValidationError
from sqlalchemy.orm import Session

from database import engine
from auth.models import RefreshToken, User
from auth.schemas import ChangePasswordSchema, LoginSchema, SignupSchema
from auth.utils import (
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    refresh_token_expiry,
    verify_password,
)
from extensions import limiter

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Schema singletons
_signup_schema          = SignupSchema()
_login_schema           = LoginSchema()
_change_password_schema = ChangePasswordSchema()

# Lockout policy
_LOCKOUT_THRESHOLD = 5   # failed attempts before lock
_LOCKOUT_MINUTES   = 15  # lock duration

# Cookie name
_REFRESH_COOKIE = 'refresh_token'

# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_tokens(user: User):
    """Issue a new JWT access token + raw refresh token for *user*."""
    additional_claims = {'role': user.role, 'username': user.username}
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims,
    )
    raw_refresh  = generate_refresh_token()
    return access_token, raw_refresh


def _set_refresh_cookie(response, raw_refresh: str):
    """Attach the refresh token as a secure HttpOnly cookie."""
    is_production = os.environ.get('FLASK_ENV', 'development') == 'production'
    response.set_cookie(
        _REFRESH_COOKIE,
        raw_refresh,
        httponly=True,
        secure=is_production,          # True in prod (HTTPS only)
        samesite='Strict',
        max_age=int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES', 604800)),
        path='/api/auth/refresh',      # Cookie scoped to the refresh route only
    )


def _store_refresh_token(session: Session, user_id: int, raw_refresh: str):
    """Persist the SHA-256 hash of the refresh token to the DB."""
    rt = RefreshToken(
        user_id    = user_id,
        token_hash = hash_refresh_token(raw_refresh),
        expires_at = refresh_token_expiry(),
    )
    session.add(rt)


# ── Routes ───────────────────────────────────────────────────────────────────

@auth_bp.route('/signup', methods=['POST'])
@limiter.limit('5 per hour')
def signup():
    """Register a new user.  Pass X-Admin-Secret header to create an admin."""
    try:
        data = _signup_schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    email    = data['email'].lower().strip()
    username = data['username'].strip()

    # Determine role
    admin_secret = request.headers.get('X-Admin-Secret', '')
    role = 'admin' if (
        admin_secret and admin_secret == os.environ.get('ADMIN_REGISTRATION_SECRET', '')
    ) else 'user'

    with Session(engine) as session:
        if session.query(User).filter(User.email == email).first():
            return jsonify({'error': 'Email already registered'}), 409
        if session.query(User).filter(User.username == username).first():
            return jsonify({'error': 'Username already taken'}), 409

        user = User(
            email         = email,
            username      = username,
            password_hash = hash_password(data['password']),
            role          = role,
            is_active     = True,
            is_verified   = True,   # auto-verify; hook up email flow later
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        return jsonify({
            'message': 'Account created successfully',
            'user':    user.to_dict(),
        }), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit('10 per minute')
def login():
    """Authenticate user, return access token + set HttpOnly refresh cookie."""
    try:
        data = _login_schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    email = data['email'].lower().strip()
    now   = datetime.now(timezone.utc)

    with Session(engine) as session:
        user = session.query(User).filter(User.email == email).first()

        # Generic error — never reveal whether the account exists
        if not user or not user.is_active:
            return jsonify({'error': 'Invalid email or password'}), 401

        # Account lockout check
        if user.locked_until:
            locked_until_aware = user.locked_until.replace(tzinfo=timezone.utc)
            if locked_until_aware > now:
                remaining = int((locked_until_aware - now).total_seconds() // 60) + 1
                return jsonify({
                    'error': f'Account locked due to too many failed attempts. '
                             f'Try again in {remaining} minute(s).'
                }), 429

        # Verify password
        if not verify_password(data['password'], user.password_hash):
            user.failed_attempts += 1
            if user.failed_attempts >= _LOCKOUT_THRESHOLD:
                user.locked_until    = now + timedelta(minutes=_LOCKOUT_MINUTES)
                user.failed_attempts = 0
                session.commit()
                return jsonify({
                    'error': f'Too many failed attempts. '
                             f'Account locked for {_LOCKOUT_MINUTES} minutes.'
                }), 429
            session.commit()
            return jsonify({'error': 'Invalid email or password'}), 401

        # ── Successful login ──────────────────────────────────────────────
        user.failed_attempts = 0
        user.locked_until    = None
        user.last_login      = now

        access_token, raw_refresh = _make_tokens(user)
        _store_refresh_token(session, user.id, raw_refresh)
        session.commit()

        user_dict = user.to_dict()

    response = make_response(jsonify({
        'access_token': access_token,
        'user':         user_dict,
    }))
    _set_refresh_cookie(response, raw_refresh)
    return response, 200


@auth_bp.route('/refresh', methods=['POST'])
@limiter.limit('30 per minute')
def refresh():
    """
    Rotate the refresh token.
    Client sends the HttpOnly cookie; receives a new access token and
    a new refresh cookie. The old refresh token is immediately revoked.
    """
    raw_refresh = request.cookies.get(_REFRESH_COOKIE)
    if not raw_refresh:
        return jsonify({'error': 'No refresh token provided'}), 401

    token_hash = hash_refresh_token(raw_refresh)
    now        = datetime.now(timezone.utc)

    with Session(engine) as session:
        rt = session.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked    == False,   # noqa: E712
        ).first()

        if not rt:
            return jsonify({'error': 'Invalid or already-used refresh token'}), 401

        # Check expiry
        expires_aware = rt.expires_at.replace(tzinfo=timezone.utc)
        if expires_aware <= now:
            rt.revoked = True
            session.commit()
            return jsonify({'error': 'Refresh token expired, please log in again'}), 401

        # Load user
        user = session.query(User).filter(
            User.id == rt.user_id, User.is_active == True   # noqa: E712
        ).first()
        if not user:
            rt.revoked = True
            session.commit()
            return jsonify({'error': 'User not found or deactivated'}), 401

        # ── Token rotation ────────────────────────────────────────────────
        rt.revoked = True   # revoke old token immediately

        new_access, new_raw_refresh = _make_tokens(user)
        _store_refresh_token(session, user.id, new_raw_refresh)
        session.commit()

    response = make_response(jsonify({'access_token': new_access}))
    _set_refresh_cookie(response, new_raw_refresh)
    return response, 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Server-side logout: revoke the refresh token so it can never be reused.
    Client should also clear the access token from memory.
    """
    raw_refresh = request.cookies.get(_REFRESH_COOKIE)
    if raw_refresh:
        token_hash = hash_refresh_token(raw_refresh)
        with Session(engine) as session:
            rt = session.query(RefreshToken).filter(
                RefreshToken.token_hash == token_hash
            ).first()
            if rt:
                rt.revoked = True
                session.commit()

    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.delete_cookie(_REFRESH_COOKIE, path='/api/auth/refresh')
    return response, 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Return the authenticated user's profile."""
    user_id = get_jwt_identity()
    with Session(engine) as session:
        user = session.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user.to_dict()), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change the current user's password (requires valid access token)."""
    try:
        data = _change_password_schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    user_id = get_jwt_identity()
    with Session(engine) as session:
        user = session.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not verify_password(data['current_password'], user.password_hash):
            return jsonify({'error': 'Current password is incorrect'}), 401

        user.password_hash = hash_password(data['new_password'])

        # Revoke all existing refresh tokens (force re-login everywhere)
        session.query(RefreshToken).filter(
            RefreshToken.user_id == user.id
        ).update({'revoked': True})

        session.commit()

    response = make_response(jsonify({'message': 'Password changed. Please log in again.'}))
    response.delete_cookie(_REFRESH_COOKIE, path='/api/auth/refresh')
    return response, 200


# ── Admin-only: list all users ───────────────────────────────────────────────

@auth_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_list_users():
    """Return all users.  Requires admin role."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    with Session(engine) as session:
        users = session.query(User).order_by(User.created_at.desc()).all()
        return jsonify([u.to_dict() for u in users]), 200


@auth_bp.route('/admin/users/<int:uid>/toggle-active', methods=['POST'])
@jwt_required()
def admin_toggle_user(uid):
    """Enable / disable a user account.  Requires admin role."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    with Session(engine) as session:
        user = session.query(User).filter(User.id == uid).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.role == 'admin':
            return jsonify({'error': 'Cannot deactivate an admin account'}), 403
        user.is_active = not user.is_active
        session.commit()
        return jsonify({'message': f'User {"activated" if user.is_active else "deactivated"}',
                        'user': user.to_dict()}), 200
