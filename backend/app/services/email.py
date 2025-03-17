import emails
from emails.template import JinjaTemplate
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.leave_request import LeaveRequest
from app.crud import get_user, get_leave_type, get_approvers


def send_email(
    email_to: str,
    subject: str,
    html_template: str,
    environment: dict = None
) -> None:
    """
    Envoyer un email.
    """
    assert email_to, "Recipient email is required"
    
    # Créer le message
    message = emails.Message(
        subject=subject,
        html=JinjaTemplate(html_template),
        mail_from=(settings.PROJECT_NAME, settings.EMAIL_FROM),
    )
    
    # Envoyer l'email
    response = message.send(
        to=email_to,
        render=environment or {},
        smtp={
            "host": settings.EMAIL_HOST,
            "port": settings.EMAIL_PORT,
            "user": settings.EMAIL_USER,
            "password": settings.EMAIL_PASSWORD,
            "tls": False,
        },
    )
    
    return response


def send_leave_request_notification(db: Session, leave_request: LeaveRequest) -> None:
    """
    Envoyer un email de notification pour une nouvelle demande de congé
    """
    employee = get_user(db, user_id=leave_request.employee_id)
    leave_type = get_leave_type(db, leave_type_id=leave_request.leave_type_id)
    approvers = get_approvers(db)
    
    # Préparer le template
    html_template = """
    <div>
        <h1>Nouvelle demande de congé</h1>
        <p>Une nouvelle demande de congé a été soumise et nécessite votre approbation :</p>
        <ul>
            <li><strong>Employé :</strong> {{ employee_name }}</li>
            <li><strong>Type de congé :</strong> {{ leave_type_name }}</li>
            <li><strong>Période :</strong> Du {{ start_date }} au {{ end_date }}</li>
            <li><strong>Nombre de jours :</strong> {{ days_count }}</li>
            <li><strong>Commentaire :</strong> {{ comment }}</li>
        </ul>
        <p>Veuillez vous connecter à l'application pour approuver ou rejeter cette demande.</p>
    </div>
    """
    
    # Préparer les données du template
    environment = {
        "employee_name": f"{employee.first_name} {employee.last_name}",
        "leave_type_name": leave_type.name,
        "start_date": leave_request.start_date.strftime("%d/%m/%Y"),
        "end_date": leave_request.end_date.strftime("%d/%m/%Y"),
        "days_count": leave_request.days_count,
        "comment": leave_request.comment or "Aucun commentaire"
    }
    
    # Envoyer un email à chaque approbateur
    for approver in approvers:
        send_email(
            email_to=approver.email,
            subject=f"Nouvelle demande de congé de {employee.first_name} {employee.last_name}",
            html_template=html_template,
            environment=environment
        )


def send_leave_approval_notification(db: Session, leave_request: LeaveRequest) -> None:
    """
    Envoyer un email de notification pour une demande approuvée ou rejetée
    """
    employee = get_user(db, user_id=leave_request.employee_id)
    leave_type = get_leave_type(db, leave_type_id=leave_request.leave_type_id)
    
    status_text = "approuvée" if leave_request.status == "approved" else "refusée"
    
    # Préparer le template
    html_template = """
    <div>
        <h1>Réponse à votre demande de congé</h1>
        <p>Votre demande de congé a été <strong>{{ status_text }}</strong> :</p>
        <ul>
            <li><strong>Type de congé :</strong> {{ leave_type_name }}</li>
            <li><strong>Période :</strong> Du {{ start_date }} au {{ end_date }}</li>
            <li><strong>Nombre de jours :</strong> {{ days_count }}</li>
        </ul>
        {% if response_comment %}
        <p><strong>Commentaire de l'approbateur :</strong> {{ response_comment }}</p>
        {% endif %}
        <p>Vous pouvez consulter votre historique de demandes sur l'application.</p>
    </div>
    """
    
    # Préparer les données du template
    environment = {
        "status_text": status_text,
        "leave_type_name": leave_type.name,
        "start_date": leave_request.start_date.strftime("%d/%m/%Y"),
        "end_date": leave_request.end_date.strftime("%d/%m/%Y"),
        "days_count": leave_request.days_count,
        "response_comment": leave_request.response_comment
    }
    
    # Envoyer l'email à l'employé
    send_email(
        email_to=employee.email,
        subject=f"Votre demande de congé a été {status_text}",
        html_template=html_template,
        environment=environment
    )