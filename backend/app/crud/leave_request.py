from typing import Any, Dict, Optional, Union, List
from datetime import date, datetime

from sqlalchemy.orm import Session
from sqlalchemy import desc, and_

from app.models.leave_request import LeaveRequest, LeaveStatus
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestApproval


def get_leave_request(db: Session, leave_request_id: int) -> Optional[LeaveRequest]:
    return db.query(LeaveRequest).filter(LeaveRequest.id == leave_request_id).first()


def get_leave_requests(db: Session, skip: int = 0, limit: int = 100) -> List[LeaveRequest]:
    return db.query(LeaveRequest).order_by(desc(LeaveRequest.created_at)).offset(skip).limit(limit).all()


def get_leave_requests_by_employee(db: Session, employee_id: int, skip: int = 0, limit: int = 100) -> List[LeaveRequest]:
    return db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee_id
    ).order_by(desc(LeaveRequest.created_at)).offset(skip).limit(limit).all()


def get_pending_leave_requests(db: Session, skip: int = 0, limit: int = 100) -> List[LeaveRequest]:
    return db.query(LeaveRequest).filter(
        LeaveRequest.status == LeaveStatus.PENDING
    ).order_by(desc(LeaveRequest.created_at)).offset(skip).limit(limit).all()


def calculate_days(start_date: date, end_date: date) -> float:
    # Simple calculation, can be improved to exclude weekends and holidays
    delta = end_date - start_date
    return delta.days + 1


def create_leave_request(db: Session, leave_request_in: LeaveRequestCreate, employee_id: int) -> LeaveRequest:
    days_count = calculate_days(leave_request_in.start_date, leave_request_in.end_date)
    
    db_leave_request = LeaveRequest(
        start_date=leave_request_in.start_date,
        end_date=leave_request_in.end_date,
        days_count=days_count,
        comment=leave_request_in.comment,
        employee_id=employee_id,
        leave_type_id=leave_request_in.leave_type_id,
        status=LeaveStatus.PENDING
    )
    db.add(db_leave_request)
    db.commit()
    db.refresh(db_leave_request)
    return db_leave_request


def update_leave_request(
    db: Session, *, db_obj: LeaveRequest, obj_in: Union[LeaveRequestUpdate, Dict[str, Any]]
) -> LeaveRequest:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    # Recalculate days_count if dates change
    if "start_date" in update_data or "end_date" in update_data:
        start_date = update_data.get("start_date", db_obj.start_date)
        end_date = update_data.get("end_date", db_obj.end_date)
        update_data["days_count"] = calculate_days(start_date, end_date)
    
    for field in update_data:
        if field in update_data:
            setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def process_leave_request(
    db: Session, *, db_obj: LeaveRequest, obj_in: LeaveRequestApproval, approver_id: int
) -> LeaveRequest:
    # Mettre à jour le statut et les commentaires
    db_obj.status = obj_in.status
    db_obj.response_comment = obj_in.response_comment
    db_obj.approver_id = approver_id
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_leave_request(db: Session, *, leave_request_id: int) -> Optional[LeaveRequest]:
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == leave_request_id).first()
    if leave_request:
        db.delete(leave_request)
        db.commit()
    return leave_request


def get_leave_requests_by_date_range(
    db: Session, start_date: date, end_date: date, status: Optional[str] = None
) -> List[LeaveRequest]:
    query = db.query(LeaveRequest).filter(
        and_(
            LeaveRequest.start_date <= end_date,
            LeaveRequest.end_date >= start_date
        )
    )
    
    if status:
        query = query.filter(LeaveRequest.status == status)
    
    return query.all()