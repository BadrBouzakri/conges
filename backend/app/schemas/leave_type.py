from typing import List, Optional
from pydantic import BaseModel

# Schéma de base pour le type de congé
class LeaveTypeBase(BaseModel):
    name: str
    requires_proof: bool = False
    description: Optional[str] = None
    default_days: float = 0

# Schéma pour la création d'un type de congé
class LeaveTypeCreate(LeaveTypeBase):
    pass

# Schéma pour la mise à jour d'un type de congé
class LeaveTypeUpdate(BaseModel):
    name: Optional[str] = None
    requires_proof: Optional[bool] = None
    description: Optional[str] = None
    default_days: Optional[float] = None

# Schéma pour la réponse de type de congé
class LeaveTypeResponse(LeaveTypeBase):
    id: int

    class Config:
        from_attributes = True