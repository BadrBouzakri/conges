import logging
from sqlalchemy.orm import Session
import datetime

from app.db.database import SessionLocal
from app.core.security import get_password_hash
from app.models import User, LeaveType, LeaveStatus, LeaveRequest, LeaveBalance

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    # Créer des types de congés
    leave_types = {
        "Congés payés": {
            "requires_proof": False,
            "description": "Congés annuels payés",
            "default_days": 25
        },
        "Repos compensatoire": {
            "requires_proof": False,
            "description": "Repos pour compenser les heures supplémentaires",
            "default_days": 0
        },
        "Congé maladie": {
            "requires_proof": True,
            "description": "Absence pour raison de santé avec justificatif médical",
            "default_days": 0
        },
        "Congé sans solde": {
            "requires_proof": False,
            "description": "Congé accordé sans rémunération",
            "default_days": 0
        }
    }
    
    db_leave_types = {}
    for name, attributes in leave_types.items():
        leave_type = LeaveType(
            name=name,
            requires_proof=attributes["requires_proof"],
            description=attributes["description"],
            default_days=attributes["default_days"]
        )
        db.add(leave_type)
        db.commit()
        db.refresh(leave_type)
        db_leave_types[name] = leave_type
        logger.info(f"Type de congé créé: {name}")
    
    # Créer des utilisateurs
    users = {
        "admin@example.com": {
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "is_admin": True,
            "is_approver": True
        },
        "approver1@example.com": {
            "password": "approver123",
            "first_name": "Sophie",
            "last_name": "Martin",
            "is_admin": False,
            "is_approver": True
        },
        "approver2@example.com": {
            "password": "approver123",
            "first_name": "Thomas",
            "last_name": "Dubois",
            "is_admin": False,
            "is_approver": True
        },
        "employee1@example.com": {
            "password": "employee123",
            "first_name": "Julien",
            "last_name": "Durand",
            "is_admin": False,
            "is_approver": False
        },
        "employee2@example.com": {
            "password": "employee123",
            "first_name": "Camille",
            "last_name": "Bernard",
            "is_admin": False,
            "is_approver": False
        }
    }
    
    db_users = {}
    for email, attributes in users.items():
        user = User(
            email=email,
            hashed_password=get_password_hash(attributes["password"]),
            first_name=attributes["first_name"],
            last_name=attributes["last_name"],
            is_admin=attributes["is_admin"],
            is_approver=attributes["is_approver"],
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        db_users[email] = user
        logger.info(f"Utilisateur créé: {email}")
    
    # Créer des soldes de congés
    current_year = datetime.datetime.now().year
    
    for email, user in db_users.items():
        # Congés payés pour tous les employés
        balance = LeaveBalance(
            user_id=user.id,
            leave_type_id=db_leave_types["Congés payés"].id,
            balance=25.0,
            year=current_year
        )
        db.add(balance)
        
        # Repos compensatoire pour certains employés
        if email in ["employee1@example.com", "employee2@example.com"]:
            balance = LeaveBalance(
                user_id=user.id,
                leave_type_id=db_leave_types["Repos compensatoire"].id,
                balance=5.0,
                year=current_year
            )
            db.add(balance)
    
    db.commit()
    logger.info("Soldes de congés créés")
    
    # Créer des demandes de congés
    leave_requests = [
        {
            "employee_email": "employee1@example.com",
            "leave_type": "Congés payés",
            "start_date": datetime.date(current_year, 7, 15),
            "end_date": datetime.date(current_year, 8, 5),
            "comment": "Vacances d'été",
            "status": LeaveStatus.APPROVED,
            "approver_email": "approver1@example.com"
        },
        {
            "employee_email": "employee2@example.com",
            "leave_type": "Congés payés",
            "start_date": datetime.date(current_year, 12, 24),
            "end_date": datetime.date(current_year, 12, 31),
            "comment": "Vacances de Noël",
            "status": LeaveStatus.PENDING
        },
        {
            "employee_email": "employee1@example.com",
            "leave_type": "Congé maladie",
            "start_date": datetime.date(current_year, 3, 10),
            "end_date": datetime.date(current_year, 3, 12),
            "comment": "Grippe",
            "status": LeaveStatus.APPROVED,
            "approver_email": "approver2@example.com"
        }
    ]
    
    for request_data in leave_requests:
        employee = db_users[request_data["employee_email"]]
        leave_type = db_leave_types[request_data["leave_type"]]
        
        days_count = (request_data["end_date"] - request_data["start_date"]).days + 1
        
        leave_request = LeaveRequest(
            employee_id=employee.id,
            leave_type_id=leave_type.id,
            start_date=request_data["start_date"],
            end_date=request_data["end_date"],
            days_count=days_count,
            comment=request_data["comment"],
            status=request_data["status"]
        )
        
        if "approver_email" in request_data:
            approver = db_users[request_data["approver_email"]]
            leave_request.approver_id = approver.id
            leave_request.response_comment = "Approuvé"
            
            # Mettre à jour le solde de congés si approuvé
            if request_data["status"] == LeaveStatus.APPROVED and request_data["leave_type"] in ["Congés payés", "Repos compensatoire"]:
                balance = db.query(LeaveBalance).filter(
                    LeaveBalance.user_id == employee.id,
                    LeaveBalance.leave_type_id == leave_type.id,
                    LeaveBalance.year == current_year
                ).first()
                
                if balance:
                    balance.balance -= days_count
                    db.add(balance)
        
        db.add(leave_request)
    
    db.commit()
    logger.info("Demandes de congés créées")


def main() -> None:
    logger.info("Initialisation de la base de données")
    db = SessionLocal()
    init_db(db)
    logger.info("Base de données initialisée")


if __name__ == "__main__":
    main()