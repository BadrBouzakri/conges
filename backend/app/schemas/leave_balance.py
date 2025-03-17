from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# Schéma de base pour le solde de congé
class LeaveBalanceBase(BaseModel):
    user_id: int
    leave_type_id: int
    balance: float
    year: int

# Schéma pour la création d'un solde de congé
class LeaveBalanceCreate(LeaveBalanceBase):
    pass

# Schéma pour la mise à jour d'un solde de congé
class LeaveBalanceUpdate(BaseModel):
    balance: Optional[float] = None
    year: Optional[int] = None

# Schéma pour la réponse de solde de congé
class LeaveBalanceResponse(LeaveBalanceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Schéma pour la réponse détaillée
class LeaveBalanceDetailResponse(LeaveBalanceResponse):
    user_name: str
    leave_type_name: str

    class Config:
        from_attributes = True