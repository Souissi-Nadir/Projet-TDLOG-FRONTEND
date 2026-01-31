# PROJET TD-LOG — Application de Gestion d'Événements avec QR Codes
Le projet est séparé en deux dépôts Git :
PROJET-TDLOG-BACKEND/ et PROJET-TDLOG-FRONTEND/
Les deux projets sont indépendants, mais le frontend a besoin que le backend soit lancé pour fonctionner.

Prérequis :
•	Python 3.10+ installé
•	requirements.txt (pip install -r requirements.txt)
•	Node.js 18+
•	npm install
un dossier .env avec ces variables d'environnement dedans : 
SUPERADMIN_EMAIL=admin@tdlog.local
SUPERADMIN_PASSWORD=changeme
SUPERADMIN_NAME=Super Admin
VITE_BACKEND_URL=http://localhost:8000  c'est l'URl du backend

### COMMANDE POUR LANCER LE BACK :
uvicorn app.main:app --reload --port 8000 --env-file .env

Le terminal doit afficher :
Uvicorn running on http://127.0.0.1:8000


### COMMANDE POUR LANCER LE FRONT :
npm run dev 

ouvrir l'url http://localhost:5173/ dans le navigateur

### Mot de passe du compte de base :
admin@tdlog.local
changeme



## 1. Présentation générale
Front : Ionic + React + TypeScript  
Back : FastAPI en Python  
Objectif : gérer les participants, générer des QR codes, les scanner depuis le front et suivre les événements pour les associations.

### Gestion des utilisateurs
- Création et administration par des comptes autorisés.
- Recherche avec autocomplétion pour retrouver rapidement un participant.

### Gestion des événements
- Création d'événements côté back-office.
- Affectation d'un participant à un événement.
- Génération d'un QR code unique représentant la place/ticket.

### Scan des QR codes
- Scannage en direct depuis l'application Ionic.
- Vérification auprès du backend : ticket valide, déjà scanné ou invalide.
- Marquage automatique pour éviter les doublons.

