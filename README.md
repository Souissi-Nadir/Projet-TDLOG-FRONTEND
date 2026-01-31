# PROJET TD-LOG — Application de Gestion d'Événements avec QR Codes

### COMMANDE POUR LANCER LE BACK :
uvicorn app.main:app --reload --port 8000 --env-file .env

### COMMANDE POUR LANCER LE FRONT :
npm run dev 

Il faut se mettre dans l'environnement virtuel et installer les packages si nécéssaire.
VITE_BACKEND_URL=http://127.0.0.1:8000




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

