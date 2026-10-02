"""Point d'enregistrement centralisé de tous les modèles SQLAlchemy.

À importer (pour son effet de bord — enregistrer les classes dans
Base.metadata) depuis :
- alembic/env.py, pour que l'autogénération détecte toutes les tables
- app/main.py, pour garantir que toutes les relations entre modèles
  (Driver.category, Ride.driver, etc.) sont résolues avant la première
  requête

Ce fichier importe les modèles APRÈS que app/db/base.py soit déjà
complètement chargé (db/base.py ne référence plus aucun modèle) — plus de
risque d'import circulaire, contrairement à l'ancienne organisation où
db/base.py lui-même importait les modèles.
"""

from app.models.user import User, UserRole  # noqa: F401
from app.models.driver import Driver, DriverCategory  # noqa: F401
from app.models.institution import Institution  # noqa: F401
from app.models.child import Child  # noqa: F401
from app.models.ride import Ride, RideStatus  # noqa: F401
from app.models.pricing import Pricing  # noqa: F401
from app.models.message import Message, SenderRole  # noqa: F401
from app.models.invoice import Invoice, InvoiceLine, InvoiceStatus  # noqa: F401
from app.models.incident import Incident