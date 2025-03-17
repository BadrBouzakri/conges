from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_current_admin_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.leave_type import LeaveTypeCreate, LeaveTypeUpdate, LeaveTypeResponse
from app.crud import (
    get_leave_type, get_leave_type_by_name, get_leave_types,
    create_leave_type, update_leave_type, delete_leave_type
)

router = APIRouter()


@router.get("/", response_model=List[LeaveTypeResponse])
def read_leave_types(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Récupérer tous les types de congés.
    """
    leave_types = get_leave_types(db, skip=skip, limit=limit)
    return leave_types


@router.post("/", response_model=LeaveTypeResponse)
def create_new_leave_type(
    *,
    db: Session = Depends(get_db),
    leave_type_in: LeaveTypeCreate,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Créer un nouveau type de congé. Accessible uniquement aux admins.
    """
    leave_type = get_leave_type_by_name(db, name=leave_type_in.name)
    if leave_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un type de congé avec ce nom existe déjà",
        )
    leave_type = create_leave_type(db, leave_type_in)
    return leave_type


@router.get("/{leave_type_id}", response_model=LeaveTypeResponse)
def read_leave_type_by_id(
    leave_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Obtenir un type de congé spécifique par son ID.
    """
    leave_type = get_leave_type(db, leave_type_id=leave_type_id)
    if not leave_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Type de congé non trouvé",
        )
    return leave_type


@router.put("/{leave_type_id}", response_model=LeaveTypeResponse)
def update_leave_type_by_id(
    *,
    db: Session = Depends(get_db),
    leave_type_id: int,
    leave_type_in: LeaveTypeUpdate,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Mettre à jour un type de congé. Accessible uniquement aux admins.
    """
    leave_type = get_leave_type(db, leave_type_id=leave_type_id)
    if not leave_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Type de congé non trouvé",
        )
    
    # Vérifier si le nouveau nom existe déjà
    if leave_type_in.name and leave_type_in.name != leave_type.name:
        existing_type = get_leave_type_by_name(db, name=leave_type_in.name)
        if existing_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un type de congé avec ce nom existe déjà",
            )
    
    leave_type = update_leave_type(db, db_obj=leave_type, obj_in=leave_type_in)
    return leave_type


@router.delete("/{leave_type_id}", response_model=LeaveTypeResponse)
def delete_leave_type_by_id(
    *,
    db: Session = Depends(get_db),
    leave_type_id: int,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Supprimer un type de congé. Accessible uniquement aux admins.
    """
    leave_type = get_leave_type(db, leave_type_id=leave_type_id)
    if not leave_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Type de congé non trouvé",
        )
    
    # Vérifier si ce type de congé est utilisé
    if leave_type.leave_requests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce type de congé est associé à des demandes et ne peut pas être supprimé",
        )
    
    leave_type = delete_leave_type(db, leave_type_id=leave_type_id)
    return leave_type