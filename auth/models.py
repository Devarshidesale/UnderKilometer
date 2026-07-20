"""
auth/models.py
──────────────
SQLAlchemy ORM models for the auth system.
Uses a dedicated Base so the existing raw-SQL engine is not disturbed.
Tables are auto-created in app.py via Base.metadata.create_all(engine).
"""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey,
    Index, Integer, String,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


# ─────────────────────────────────────────
# users
# ─────────────────────────────────────────
class User(Base):
    __tablename__ = 'users'

    id              = Column(Integer, primary_key=True, autoincrement=True)
    email           = Column(String(255), nullable=False, unique=True)
    username        = Column(String(100), nullable=False, unique=True)
    password_hash   = Column(String(255), nullable=False)
    role            = Column(Enum('user', 'admin'), nullable=False, default='user')
    is_active       = Column(Boolean, nullable=False, default=True)
    is_verified     = Column(Boolean, nullable=False, default=False)
    created_at      = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at      = Column(DateTime, nullable=False,
                             default=lambda: datetime.now(timezone.utc),
                             onupdate=lambda: datetime.now(timezone.utc))
    last_login      = Column(DateTime, nullable=True)
    failed_attempts = Column(Integer, nullable=False, default=0)
    locked_until    = Column(DateTime, nullable=True)

    refresh_tokens = relationship(
        'RefreshToken', back_populates='user', cascade='all, delete-orphan'
    )

    def to_dict(self):
        return {
            'id':         self.id,
            'email':      self.email,
            'username':   self.username,
            'role':       self.role,
            'is_active':  self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }


# ─────────────────────────────────────────
# refresh_tokens
# ─────────────────────────────────────────
class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'

    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token_hash  = Column(String(255), nullable=False, unique=True)
    expires_at  = Column(DateTime, nullable=False)
    revoked     = Column(Boolean, nullable=False, default=False)
    created_at  = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    user = relationship('User', back_populates='refresh_tokens')

    __table_args__ = (
        Index('idx_rt_token_hash', 'token_hash'),
        Index('idx_rt_user_id',   'user_id'),
    )
