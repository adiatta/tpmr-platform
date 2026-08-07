"""Crée le tout premier compte admin, nécessaire pour se connecter au dashboard
la toute première fois (il n'y a volontairement pas de page d'inscription —
seul un admin déjà connecté peut créer des chauffeurs, donc il faut amorcer
avec ce script).

Usage :
    python -m scripts.seed_admin admin@tpmr.fr "MotDePasseSolide123" "Admin TPMR"
"""

import sys

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def main() -> None:
    if len(sys.argv) != 4:
        print('Usage: python -m scripts.seed_admin <email> <mot_de_passe> "<nom complet>"')
        sys.exit(1)

    email, password, full_name = sys.argv[1], sys.argv[2], sys.argv[3]
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Un compte existe déjà pour {email} — rien à faire.")
            return

        admin = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Compte admin créé : {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
