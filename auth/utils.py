"""
auth/utils.py
─────────────
Security helpers: password hashing, refresh-token generation & hashing.
"""
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt

# bcrypt work factor — 12 is the recommended minimum for 2024+
_BCRYPT_ROUNDS = 12

# 64-byte raw refresh token → 512 bits of entropy
_REFRESH_TOKEN_BYTES = 64


# ── Password helpers ─────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*.  Safe to store in DB."""
    return bcrypt.hashpw(
        plain.encode('utf-8'),
        bcrypt.gensalt(rounds=_BCRYPT_ROUNDS),
    ).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time comparison — prevents timing attacks."""
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


# ── Refresh token helpers ────────────────────────────────────────────────────

def generate_refresh_token() -> str:
    """
    Generate a cryptographically-secure URL-safe opaque token.
    This is the *raw* value sent to the client via HttpOnly cookie.
    Never store this value in the database.
    """
    return secrets.token_urlsafe(_REFRESH_TOKEN_BYTES)


def hash_refresh_token(token: str) -> str:
    """
    SHA-256 hash of the raw token — this is what we store in the DB.
    Even if the DB is compromised, raw tokens cannot be recovered.
    """
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def refresh_token_expiry() -> datetime:
    """Returns the absolute expiry datetime for a new refresh token."""
    seconds = int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES', 604800))
    return datetime.now(timezone.utc) + timedelta(seconds=seconds)
