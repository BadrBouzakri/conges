from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base

class LeaveType(Base):
    __tablename__ = "leave_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    requires_proof = Column(Boolean, default=False)
    description = Column(String, nullable=True)
    default_days = Column(Float, default=0)  # Jours par défaut pour ce type de congé
    
    # Relation avec les demandes de congés
    leave_requests = relationship("LeaveRequest", back_populates="leave_type")
    
    # Relation avec les soldes de congés
    leave_balances = relationship("LeaveBalance", back_populates="leave_type")