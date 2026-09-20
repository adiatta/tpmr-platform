"""Diagnostic approfondi, à lancer depuis services/backend (venv activé) :
    python3 debug-migrations.py
"""

import sys

print("=== 1. Quel package 'app' est réellement importé ? ===")
import app  # noqa: E402
print(f"app.__file__ = {app.__file__}")
print()

print("=== 2. Quelle DATABASE_URL est utilisée ? ===")
from app.core.config import settings  # noqa: E402
print(f"DATABASE_URL = {settings.DATABASE_URL}")
print()

print("=== 3. Import de Base et des modèles, un par un ===")
from sqlalchemy.orm import DeclarativeBase  # noqa: E402


class DebugBase(DeclarativeBase):
    pass


# On réplique ici l'import de db/base.py, mais en vérifiant l'état du
# registre après CHAQUE import pour voir lequel échoue silencieusement.
import importlib
modules_to_check = [
    "app.db.base",
]
for mod_name in modules_to_check:
    if mod_name in sys.modules:
        del sys.modules[mod_name]

from app.db.base import Base  # noqa: E402

print(f"Base.metadata (id) = {id(Base.metadata)}")
print(f"Nombre de tables enregistrées juste après l'import de app.db.base : {len(Base.metadata.tables)}")
print(f"Tables : {sorted(Base.metadata.tables.keys())}")
print()

print("=== 4. Import individuel de chaque modèle, avec le compte de tables après coup ===")
model_modules = [
    "app.models.user",
    "app.models.driver",
    "app.models.institution",
    "app.models.child",
    "app.models.ride",
    "app.models.pricing",
    "app.models.message",
    "app.models.invoice",
]
for mod_name in model_modules:
    try:
        mod = importlib.import_module(mod_name)
        print(f"  OK  {mod_name} -> Base.metadata a maintenant {len(Base.metadata.tables)} tables")
    except Exception as exc:
        print(f"  ERREUR sur {mod_name} : {type(exc).__name__}: {exc}")
print()

print("=== 5. Tables réelles en base (requête directe, sans passer par le même import chain) ===")
from sqlalchemy import create_engine, inspect  # noqa: E402
fresh_engine = create_engine(settings.DATABASE_URL)
with fresh_engine.connect() as conn:
    real_tables = inspect(conn).get_table_names()
print(f"Tables réelles : {sorted(real_tables)}")