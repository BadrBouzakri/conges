from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    balance = Column(Float, default=0)  # Solde actuel
    year = Column(Integer, index=True)  # Année concernée
    
    # Dates de création et mise à jour
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relations
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="leave_balances")
    
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"))
    leave_type = relationship("LeaveType", back_populates="leave_balances")