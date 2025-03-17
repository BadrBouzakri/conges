from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.config import settings
from app.db.database import create_tables

app = FastAPI(title="Système de Gestion des Congés", version="1.0.0")

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origines exactes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes API
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Créer les tables au démarrage si elles n'existent pas
    create_tables()

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API de gestion des congés"}