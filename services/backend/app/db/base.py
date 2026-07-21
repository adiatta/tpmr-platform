from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import de tous les modèles ici pour qu'Alembic les détecte lors de l'autogénération
from app.models.user import User  # noqa: E402, F401
from app.models.driver import Driver, DriverCategory  # noqa: E402, F401
from app.models.institution import Institution  # noqa: E402, F401
from app.models.child import Child  # noqa: E402, F401
from app.models.ride import Ride  # noqa: E402, F401
from app.models.pricing import Pricing  # noqa: E402, F401
