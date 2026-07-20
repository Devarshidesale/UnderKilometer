"""
middleware/decorators.py
─────────────────────────
Reusable route decorators for role-based access control (RBAC).

Usage
─────
    from middleware.decorators import admin_required

    @app.route('/api/admin/something')
    @jwt_required()        ← always first
    @admin_required        ← then role check
    def my_admin_route():
        ...
"""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt


def admin_required(fn):
    """
    Decorator that blocks access unless the JWT 'role' claim is 'admin'.
    Must be applied AFTER @jwt_required() so get_jwt() has a token to inspect.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def active_user_required(fn):
    """
    Blocks access if the JWT contains is_active=False.
    Useful as an extra guard on sensitive endpoints.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if not claims.get('is_active', True):
            return jsonify({'error': 'Account is deactivated'}), 403
        return fn(*args, **kwargs)
    return wrapper
