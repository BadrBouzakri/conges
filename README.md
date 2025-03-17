# Système de Gestion des Congés

Application web permettant de gérer les demandes et approbations de congés pour une petite entreprise d'environ 20 salariés.

## Fonctionnalités

### Authentification et rôles
- Connexion avec email/mot de passe
- Deux types de rôles:
  - **Employé**: Peut soumettre des demandes de congés
  - **Approbateur**: Peut approuver ou rejeter les demandes

### Types de congés
- Congés payés
- Repos compensatoire
- Congé maladie (justificatif requis)
- Congé sans solde

### Gestion des congés
- Soumission de demandes (type, dates, commentaire)
- Approbation/refus des demandes
- Notification par email
- Suivi du solde de congés

### Administration
- Gestion des employés
- Configuration des soldes de congés

## Architecture technique

### Backend
- **Framework**: FastAPI (Python)
- **Base de données**: PostgreSQL
- **Authentification**: JWT
- **Email**: Intégration via la bibliothèque emails

### Frontend
- **Framework**: React.js
- **UI**: Material-UI
- **Formulaires**: Formik + Yup
- **Routing**: React Router

### Déploiement
- **Docker**: Multi-container avec Docker Compose
- **Services**: Frontend, Backend, Base de données, Serveur Email (MailHog pour le développement)

## Installation et démarrage

### Prérequis
- Docker et Docker Compose

### Démarrage
```bash
# Cloner le dépôt
git clone <URL_DU_REPOSITORY>
cd conges

# Démarrer les conteneurs
docker-compose up -d

# Accès à l'application
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Documentation: http://localhost:8000/docs
MailHog (emails): http://localhost:8025
```

## Comptes de test

| Email               | Mot de passe  | Rôle                   |
|---------------------|---------------|------------------------|
| admin@example.com   | admin123      | Administrateur         |
| approver1@example.com | approver123  | Approbateur            |
| employee1@example.com | employee123  | Employé                |

## Développement

### Structure du backend
```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/       # Points d'entrée API
│   │   └── api.py           # Router principal
│   ├── core/                # Configuration et sécurité
│   ├── crud/                # Opérations sur la DB
│   ├── db/                  # Configuration de la DB
│   ├── models/              # Modèles SQLAlchemy
│   ├── schemas/             # Schémas Pydantic
│   ├── services/            # Services (email, etc.)
│   └── utils/               # Utilitaires
└── main.py                  # Point d'entrée de l'application
```

### Structure du frontend
```
frontend/
├── public/
└── src/
    ├── components/          # Composants réutilisables
    ├── contexts/            # Contextes React (auth, etc.)
    ├── pages/               # Pages de l'application
    ├── services/            # Services API
    └── utils/               # Utilitaires
```

## Licence

Ce projet est sous licence MIT.