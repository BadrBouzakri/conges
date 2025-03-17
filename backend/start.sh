#!/bin/bash

# Attendre que la base de données soit prête
echo "Attente de la base de données..."
sleep 5

# Initialiser les données de test
python initial_data.py

# Démarrer l'application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload