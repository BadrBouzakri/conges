from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, Date, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.database import Base

class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    start_date = Column(Date, index=True)
    end_date = Column(Date, index=True)
    days_count = Column(Float)  # Nombre de jours (peut être decimal pour demi-journées)
    
    # Statut de la demande
    status = Column(String, default=LeaveStatus.PENDING)
    
    # Commentaires
    comment = Column(String, nullable=True)
    response_comment = Column(String, nullable=True)
    
    # Document justificatif
    proof_document = Column(String, nullable=True)  # Chemin vers le fichier
    
    # Dates de création et mise à jour
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relations
    employee_id = Column(Integer, ForeignKey("users.id"))
    employee = relationship("User", back_populates="leave_requests", foreign_keys=[employee_id])
    
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approver = relationship("User", back_populates="approved_requests", foreign_keys=[approver_id])
    
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"))
    leave_type = relationship("LeaveType", back_populates="leave_requests")