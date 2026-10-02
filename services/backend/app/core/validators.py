from app.core.validators import validate_french_phone

class DriverCreate(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str) -> str:
        return validate_french_phone(v)