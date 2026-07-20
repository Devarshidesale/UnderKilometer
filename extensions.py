"""
extensions.py
─────────────
Shared Flask extension singletons (created before app to avoid circular imports).
Import these into app.py to call .init_app(app), and into blueprints to use decorators.
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# In-memory storage for development.
# For production, switch to Redis:
#   storage_uri="redis://localhost:6379"
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[],          # No global default; limits are per-route
    storage_uri="memory://",
)
