from typing import Any, Dict, Optional, Union, List
from datetime import date
import datetime

from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.leave_balance import LeaveBalance
from app.schemas.leave_balance import LeaveBalanceCreate, LeaveBalanceUpdate


def get_leave_balance(db: Session, leave_balance_id: int) -> Optional[LeaveBalance]:
    return db.query(LeaveBalance).filter(LeaveBalance.id == leave_balance_id).first()


def get_leave_balances(db: Session, skip: int = 0, limit: int = 100) -> List[LeaveBalance]:
    return db.query(LeaveBalance).offset(skip).limit(limit).all()


def get_user_leave_balances(db: Session, user_id: int, year: Optional[int] = None) -> List[LeaveBalance]:
    query = db.query(LeaveBalance).filter(LeaveBalance.user_id == user_id)
    
    if year:
        query = query.filter(LeaveBalance.year == year)
    else:
        # Par défaut, utiliser l'année en cours
        current_year = datetime.datetime.now().year
        query = query.filter(LeaveBalance.year == current_year)
    
    return query.all()


def get_user_leave_balance_by_type(
    db: Session, user_id: int, leave_type_id: int, year: Optional[int] = None
) -> Optional[LeaveBalance]:
    query = db.query(LeaveBalance).filter(
        and_(
            LeaveBalance.user_id == user_id,
            LeaveBalance.leave_type_id == leave_type_id
        )
    )
    
    if year:
        query = query.filter(LeaveBalance.year == year)
    else:
        # Par défaut, utiliser l'année en cours
        current_year = datetime.datetime.now().year
        query = query.filter(LeaveBalance.year == current_year)
    
    return query.first()


def create_leave_balance(db: Session, leave_balance_in: LeaveBalanceCreate) -> LeaveBalance:
    db_leave_balance = LeaveBalance(
        user_id=leave_balance_in.user_id,
        leave_type_id=leave_balance_in.leave_type_id,
        balance=leave_balance_in.balance,
        year=leave_balance_in.year
    )
    db.add(db_leave_balance)
    db.commit()
    db.refresh(db_leave_balance)
    return db_leave_balance


def update_leave_balance(
    db: Session, *, db_obj: LeaveBalance, obj_in: Union[LeaveBalanceUpdate, Dict[str, Any]]
) -> LeaveBalance:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    for field in update_data:
        if field in update_data:
            setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_leave_balance(db: Session, *, leave_balance_id: int) -> Optional[LeaveBalance]:
    leave_balance = db.query(LeaveBalance).filter(LeaveBalance.id == leave_balance_id).first()
    if leave_balance:
        db.delete(leave_balance)
        db.commit()
    return leave_balance


def adjust_leave_balance(
    db: Session, user_id: int, leave_type_id: int, days: float, year: Optional[int] = None
) -> LeaveBalance:
    if not year:
        year = datetime.datetime.now().year
        
    balance = get_user_leave_balance_by_type(db, user_id, leave_type_id, year)
    
    if not balance:
        # Créer un nouveau solde si aucun n'existe
        balance = LeaveBalance(
            user_id=user_id,
            leave_type_id=leave_type_id,
            balance=days,
            year=year
        )
        db.add(balance)
    else:
        # Ajuster le solde existant
        balance.balance += days
        
    db.commit()
    db.refresh(balance)
    return balance