from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session

from app.models.leave_type import LeaveType
from app.schemas.leave_type import LeaveTypeCreate, LeaveTypeUpdate


def get_leave_type(db: Session, leave_type_id: int) -> Optional[LeaveType]:
    return db.query(LeaveType).filter(LeaveType.id == leave_type_id).first()


def get_leave_type_by_name(db: Session, name: str) -> Optional[LeaveType]:
    return db.query(LeaveType).filter(LeaveType.name == name).first()


def get_leave_types(db: Session, skip: int = 0, limit: int = 100) -> List[LeaveType]:
    return db.query(LeaveType).offset(skip).limit(limit).all()


def create_leave_type(db: Session, leave_type_in: LeaveTypeCreate) -> LeaveType:
    db_leave_type = LeaveType(
        name=leave_type_in.name,
        requires_proof=leave_type_in.requires_proof,
        description=leave_type_in.description,
        default_days=leave_type_in.default_days
    )
    db.add(db_leave_type)
    db.commit()
    db.refresh(db_leave_type)
    return db_leave_type


def update_leave_type(
    db: Session, *, db_obj: LeaveType, obj_in: Union[LeaveTypeUpdate, Dict[str, Any]]
) -> LeaveType:
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


def delete_leave_type(db: Session, *, leave_type_id: int) -> Optional[LeaveType]:
    leave_type = db.query(LeaveType).filter(LeaveType.id == leave_type_id).first()
    if leave_type:
        db.delete(leave_type)
        db.commit()
    return leave_type