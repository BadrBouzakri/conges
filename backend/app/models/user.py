from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_approver = Column(Boolean, default=False)
    
    # Relation avec les demandes de congés (en tant que demandeur)
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    
    # Relation avec les demandes de congés (en tant qu'approbateur)
    approved_requests = relationship("LeaveRequest", back_populates="approver", foreign_keys="LeaveRequest.approver_id")
    
    # Solde des congés par type
    leave_balances = relationship("LeaveBalance", back_populates="user")