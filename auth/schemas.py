"""
auth/schemas.py
───────────────
Marshmallow 4.x-compatible schemas for request validation.
All validation happens server-side before any DB interaction.
"""
import re

from marshmallow import Schema, ValidationError, fields, validate, validates

# At least 8 chars, 1 uppercase, 1 digit, 1 special character
_PASSWORD_RE = re.compile(
    r'^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};:\'",.<>/?\\|`~]).{8,}$'
)

# Username: letters, digits, underscores only
_USERNAME_RE = re.compile(r'^[a-zA-Z0-9_]+$')


class SignupSchema(Schema):
    email        = fields.Email(required=True, validate=validate.Length(max=255))
    username     = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    password     = fields.Str(required=True, load_only=True)
    admin_secret = fields.Str(load_default=None)

    @validates('password')
    def validate_password(self, value, **kwargs):
        if not _PASSWORD_RE.match(value):
            raise ValidationError(
                'Password must be \u22658 characters and include '
                'an uppercase letter, a number, and a special character.'
            )

    @validates('username')
    def validate_username(self, value, **kwargs):
        if not _USERNAME_RE.match(value):
            raise ValidationError(
                'Username may only contain letters, numbers, and underscores.'
            )


class LoginSchema(Schema):
    email    = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class ChangePasswordSchema(Schema):
    current_password = fields.Str(required=True, load_only=True)
    new_password     = fields.Str(required=True, load_only=True)

    @validates('new_password')
    def validate_new_password(self, value, **kwargs):
        if not _PASSWORD_RE.match(value):
            raise ValidationError(
                'Password must be \u22658 characters and include '
                'an uppercase letter, a number, and a special character.'
            )
