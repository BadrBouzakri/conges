from typing import List, Optional, Union
from datetime import date, datetime
from pydantic import BaseModel, validator

from app.models.leave_request import LeaveStatus

# Schéma de base pour la demande de congé
class LeaveRequestBase(BaseModel):
    start_date: date
    end_date: date
    leave_type_id: int
    comment: Optional[str] = None
    
    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('La date de fin doit être postérieure à la date de début')
        return v

# Schéma pour la création d'une demande de congé
class LeaveRequestCreate(LeaveRequestBase):
    pass

# Schéma pour la mise à jour d'une demande de congé
class LeaveRequestUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    leave_type_id: Optional[int] = None
    comment: Optional[str] = None
    proof_document: Optional[str] = None

# Schéma pour l'approbation/rejet d'une demande
class LeaveRequestApproval(BaseModel):
    status: LeaveStatus
    response_comment: Optional[str] = None

# Schéma pour la réponse de demande de congé
class LeaveRequestResponse(LeaveRequestBase):
    id: int
    status: str
    days_count: float
    created_at: datetime
    updated_at: datetime
    employee_id: int
    approver_id: Optional[int] = None
    response_comment: Optional[str] = None
    proof_document: Optional[str] = None

    class Config:
        from_attributes = True

# Schéma pour la réponse avec détails supplémentaires
class LeaveRequestDetailResponse(LeaveRequestResponse):
    employee_name: str
    approver_name: Optional[str] = None
    leave_type_name: str

    class Config:
        from_attributes = True