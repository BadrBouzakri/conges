from typing import Any, List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_current_admin_user, get_current_approver_user
from app.db.database import get_db
from app.models.user import User
from app.models.leave_request import LeaveStatus
from app.models.leave_type import LeaveType
from app.schemas.leave_request import (
    LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestResponse,
    LeaveRequestDetailResponse, LeaveRequestApproval
)
from app.services.email import send_leave_request_notification, send_leave_approval_notification
from app.crud import (
    get_leave_request, get_leave_requests, get_leave_requests_by_employee,
    get_pending_leave_requests, create_leave_request, update_leave_request,
    process_leave_request, delete_leave_request, get_leave_requests_by_date_range,
    get_leave_type, get_user, get_user_leave_balance_by_type, adjust_leave_balance
)

router = APIRouter()


@router.get("/", response_model=List[LeaveRequestResponse])
def read_leave_requests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_approver_user),
) -> Any:
    """
    Récupérer toutes les demandes de congés. Accessible uniquement aux approbateurs.
    """
    leave_requests = get_leave_requests(db, skip=skip, limit=limit)
    return leave_requests


@router.get("/pending", response_model=List[LeaveRequestResponse])
def read_pending_leave_requests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_approver_user),
) -> Any:
    """
    Récupérer toutes les demandes de congés en attente. Accessible uniquement aux approbateurs.
    """
    leave_requests = get_pending_leave_requests(db, skip=skip, limit=limit)
    return leave_requests


@router.get("/me", response_model=List[LeaveRequestResponse])
def read_my_leave_requests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Récupérer toutes les demandes de congés de l'utilisateur connecté.
    """
    leave_requests = get_leave_requests_by_employee(db, employee_id=current_user.id, skip=skip, limit=limit)
    return leave_requests


@router.post("/", response_model=LeaveRequestResponse)
async def create_new_leave_request(
    *,
    db: Session = Depends(get_db),
    leave_request_in: LeaveRequestCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Créer une nouvelle demande de congé.
    """
    # Vérifier que le type de congé existe
    leave_type = get_leave_type(db, leave_type_id=leave_request_in.leave_type_id)
    if not leave_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Type de congé non trouvé",
        )
    
    # Vérifier le solde de congés pour les types autres que maladie et sans solde
    if leave_type.name not in ["Congé maladie", "Congé sans solde"]:
        balance = get_user_leave_balance_by_type(db, user_id=current_user.id, leave_type_id=leave_type.id)
        if not balance or balance.balance <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solde de congés insuffisant pour ce type",
            )
    
    # Créer la demande de congé
    leave_request = create_leave_request(db, leave_request_in, current_user.id)
    
    # Envoyer un email de notification aux approbateurs
    send_leave_request_notification(db, leave_request)
    
    return leave_request


@router.get("/{leave_request_id}", response_model=LeaveRequestDetailResponse)
def read_leave_request_by_id(
    leave_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Obtenir une demande de congé spécifique par son ID.
    """
    leave_request = get_leave_request(db, leave_request_id=leave_request_id)
    if not leave_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande de congé non trouvée",
        )
    
    # Vérifier les autorisations
    if (leave_request.employee_id != current_user.id and 
        not current_user.is_admin and 
        not current_user.is_approver):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas l'autorisation pour accéder à cette demande",
        )
    
    # Enrichir la réponse avec des données supplémentaires
    employee = get_user(db, user_id=leave_request.employee_id)
    leave_type = get_leave_type(db, leave_type_id=leave_request.leave_type_id)
    
    response_data = leave_request.__dict__.copy()
    response_data["employee_name"] = f"{employee.first_name} {employee.last_name}"
    response_data["leave_type_name"] = leave_type.name
    
    if leave_request.approver_id:
        approver = get_user(db, user_id=leave_request.approver_id)
        response_data["approver_name"] = f"{approver.first_name} {approver.last_name}"
    
    return LeaveRequestDetailResponse(**response_data)


@router.put("/{leave_request_id}", response_model=LeaveRequestResponse)
def update_leave_request_by_id(
    *,
    db: Session = Depends(get_db),
    leave_request_id: int,
    leave_request_in: LeaveRequestUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Mettre à jour une demande de congé. L'employé peut uniquement mettre à jour ses propres demandes en attente.
    """
    leave_request = get_leave_request(db, leave_request_id=leave_request_id)
    if not leave_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande de congé non trouvée",
        )
    
    # Vérifier que c'est bien la demande de l'employé
    if leave_request.employee_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que vos propres demandes",
        )
    
    # Vérifier que la demande est en attente
    if leave_request.status != LeaveStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seules les demandes en attente peuvent être modifiées",
        )
    
    # Vérifier le type de congé si changé
    if leave_request_in.leave_type_id and leave_request_in.leave_type_id != leave_request.leave_type_id:
        leave_type = get_leave_type(db, leave_type_id=leave_request_in.leave_type_id)
        if not leave_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Type de congé non trouvé",
            )
    
    leave_request = update_leave_request(db, db_obj=leave_request, obj_in=leave_request_in)
    return leave_request


@router.post("/{leave_request_id}/approve", response_model=LeaveRequestResponse)
def approve_leave_request(
    *,
    db: Session = Depends(get_db),
    leave_request_id: int,
    approval_in: LeaveRequestApproval,
    current_user: User = Depends(get_current_approver_user),
) -> Any:
    """
    Approuver ou rejeter une demande de congé. Accessible uniquement aux approbateurs.
    """
    leave_request = get_leave_request(db, leave_request_id=leave_request_id)
    if not leave_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande de congé non trouvée",
        )
    
    # Vérifier que la demande est en attente
    if leave_request.status != LeaveStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette demande a déjà été traitée",
        )
    
    # Traiter la demande
    leave_request = process_leave_request(db, db_obj=leave_request, obj_in=approval_in, approver_id=current_user.id)
    
    # Mettre à jour le solde de congés si approuvé et type pertinent
    if approval_in.status == LeaveStatus.APPROVED:
        leave_type = get_leave_type(db, leave_type_id=leave_request.leave_type_id)
        if leave_type.name not in ["Congé maladie", "Congé sans solde"]:
            adjust_leave_balance(
                db, 
                user_id=leave_request.employee_id, 
                leave_type_id=leave_request.leave_type_id, 
                days=-leave_request.days_count
            )
    
    # Envoyer un email de notification à l'employé
    send_leave_approval_notification(db, leave_request)
    
    return leave_request


@router.delete("/{leave_request_id}", response_model=LeaveRequestResponse)
def delete_leave_request_by_id(
    *,
    db: Session = Depends(get_db),
    leave_request_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Supprimer une demande de congé. L'employé peut uniquement supprimer ses propres demandes en attente.
    Les administrateurs peuvent supprimer n'importe quelle demande.
    """
    leave_request = get_leave_request(db, leave_request_id=leave_request_id)
    if not leave_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande de congé non trouvée",
        )
    
    # Vérifier que c'est bien la demande de l'employé ou un admin
    if leave_request.employee_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez supprimer que vos propres demandes",
        )
    
    # Vérifier que la demande est en attente (sauf pour les admins)
    if leave_request.status != LeaveStatus.PENDING and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seules les demandes en attente peuvent être supprimées",
        )
    
    leave_request = delete_leave_request(db, leave_request_id=leave_request_id)
    return leave_request


@router.get("/calendar/{year}/{month}", response_model=List[LeaveRequestResponse])
def get_leave_requests_for_calendar(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Récupérer les demandes de congés pour un mois spécifique (pour le calendrier).
    """
    # Calculer les dates de début et de fin du mois
    import calendar
    from datetime import date
    
    _, last_day = calendar.monthrange(year, month)
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)
    
    # Récupérer uniquement les demandes approuvées pour le calendrier
    leave_requests = get_leave_requests_by_date_range(
        db, 
        start_date=start_date, 
        end_date=end_date, 
        status=LeaveStatus.APPROVED
    )
    
    return leave_requests