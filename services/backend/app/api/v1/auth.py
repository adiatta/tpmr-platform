import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    CurrentUser,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
    UpdateProfileRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])

RESET_TOKEN_VALIDITY = timedelta(hours=1)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.execute(select(User).where(User.email == payload.email)).scalars().first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou mot de passe incorrect")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte désactivé")

    return TokenResponse(
        access_token=create_access_token(str(user.id), user.role.value),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise ValueError("wrong token type")
    except (JWTError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalide") from exc

    user = db.get(User, data["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur invalide")

    return TokenResponse(
        access_token=create_access_token(str(user.id), user.role.value),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=CurrentUser)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=CurrentUser)
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    """Permet à l'admin (ou au chauffeur) de modifier son propre nom/email
    depuis la page Profil. Le mot de passe se change via l'endpoint dédié
    ci-dessous, pas ici."""
    if payload.email and payload.email != current_user.email:
        existing = db.execute(select(User).where(User.email == payload.email)).scalars().first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cet email est déjà utilisé")
        current_user.email = payload.email
    if payload.full_name:
        current_user.full_name = payload.full_name

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Mot de passe actuel incorrect")
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Le nouveau mot de passe doit faire au moins 8 caractères"
        )
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> ForgotPasswordResponse:
    """Génère un token de réinitialisation valable 1h.

    IMPORTANT — pas d'envoi d'email configuré pour l'instant : en mode
    DEBUG (développement), le token est renvoyé directement dans la
    réponse ET affiché dans les logs du serveur, pour pouvoir tester le
    flux sans service d'email. En production (DEBUG=false), il ne faut
    JAMAIS renvoyer le token dans la réponse — il faudra brancher un vrai
    envoi d'email (ex. via SendGrid, Postmark, ou SMTP) avant la mise en
    prod, sans quoi cette fonctionnalité reste inutilisable pour de vrais
    utilisateurs.
    """
    user = db.execute(select(User).where(User.email == payload.email)).scalars().first()

    # Message identique que le compte existe ou non — évite de révéler
    # quels emails sont enregistrés (bonne pratique de sécurité standard).
    generic_message = "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."

    if not user:
        return ForgotPasswordResponse(message=generic_message)

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + RESET_TOKEN_VALIDITY
    db.commit()

    if settings.DEBUG:
        print(f"[TPMR] Token de réinitialisation pour {user.email} : {token}")
        return ForgotPasswordResponse(message=generic_message, dev_reset_token=token)

    # TODO production : envoyer un email contenant un lien du type
    # https://votre-dashboard/reset-password?token={token}
    return ForgotPasswordResponse(message=generic_message)


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> None:
    user = db.execute(select(User).where(User.reset_token == payload.token)).scalars().first()

    if not user or not user.reset_token_expires:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lien de réinitialisation invalide")

    expires_at = user.reset_token_expires
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lien de réinitialisation expiré")

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Le mot de passe doit faire au moins 8 caractères"
        )

    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
