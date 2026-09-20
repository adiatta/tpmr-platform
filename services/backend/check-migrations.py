"""Compare les tables déclarées dans les modèles SQLAlchemy (Base.metadata)
à celles réellement présentes dans la base PostgreSQL — repère en une seule
fois toute table manquante, plutôt que de tomber dessus une par une au fil
des pages testées.

Usage (depuis services/backend, venv activé) :
    python3 check-migrations.py
"""

from app.db.base import Base
from app.db.session import engine
from sqlalchemy import inspect

expected = set(Base.metadata.tables.keys())
actual = set(inspect(engine).get_table_names())

missing = expected - actual
extra = actual - expected - {"alembic_version"}

print(f"Tables attendues (modèles) : {sorted(expected)}")
print(f"Tables réelles (base)      : {sorted(actual)}")
print()

if missing:
    print(f"❌ MANQUANTES EN BASE : {sorted(missing)}")
    print("   → lancez : alembic revision --autogenerate -m \"sync missing tables\" && alembic upgrade head")
else:
    print("✅ Toutes les tables attendues sont présentes en base.")

if extra:
    print(f"ℹ️  Tables en base mais absentes des modèles (probablement obsolètes) : {sorted(extra)}")