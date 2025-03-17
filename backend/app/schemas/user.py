from typing import List, Optional
from pydantic import BaseModel, EmailStr

# Schéma de base pour l'utilisateur
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False
    is_approver: Optional[bool] = False

# Schéma pour la création d'un utilisateur
class UserCreate(UserBase):
    password: str

# Schéma pour la mise à jour d'un utilisateur
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    is_approver: Optional[bool] = None

# Schéma pour la réponse utilisateur
class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True