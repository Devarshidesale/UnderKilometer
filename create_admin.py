"""
create_admin.py
───────────────
One-time CLI script to bootstrap the first admin account.
Run this directly on the server — never expose admin creation via a public API alone.

Usage
─────
    python create_admin.py --email admin@example.com --username admin --password "Str0ng!Pass"

The script will:
  1. Connect to the database using DATABASE_URL_STRING from .env
  2. Create the users table if it doesn't already exist
  3. Insert the admin user with a bcrypt-hashed password
  4. Refuse to run if that email already exists
"""
import argparse
import sys

from dotenv import load_dotenv

load_dotenv()

from database import engine          # noqa: E402 (needs dotenv first)
from auth.models import Base, User   # noqa: E402
from auth.utils import hash_password # noqa: E402
from sqlalchemy.orm import Session   # noqa: E402


def main():
    parser = argparse.ArgumentParser(description='Bootstrap an admin user')
    parser.add_argument('--email',    required=True,  help='Admin email address')
    parser.add_argument('--username', required=True,  help='Admin username')
    parser.add_argument('--password', required=True,  help='Strong password')
    args = parser.parse_args()

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        if session.query(User).filter(User.email == args.email.lower()).first():
            print(f'✗ An account with email "{args.email}" already exists.')
            sys.exit(1)

        if session.query(User).filter(User.username == args.username).first():
            print(f'✗ Username "{args.username}" is already taken.')
            sys.exit(1)

        admin = User(
            email         = args.email.lower().strip(),
            username      = args.username.strip(),
            password_hash = hash_password(args.password),
            role          = 'admin',
            is_active     = True,
            is_verified   = True,
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)
        print(f'✓ Admin account created: {admin.email} (id={admin.id})')


if __name__ == '__main__':
    main()
