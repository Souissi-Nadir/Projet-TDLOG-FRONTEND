# PROJET TD-LOG — Application de Gestion d'Événements avec QR Codes

Front : Ionic + React + TypeScript  
Back : FastAPI en Python  
Objectif : gérer les participants, générer des QR codes, les scanner depuis le front et suivre les événements pour les associations.


## 1. Présentation générale
Ce projet propose une application complète pour accompagner les assocaitions des ponts pendant leurs événements :

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

## 2. Technologies utilisées

```
Ionic (React + TypeScript)
      ↓  HTTP / JSON
FastAPI (Python)
      ↓ ORM / SQL
SQLite
```

### Frontend : Ionic + React + TypeScript
- Composants UI Ionic (IonButton, IonInput, IonList, IonTabs…).
- React Router pour la navigation par onglets.
- TypeScript pour sécuriser la logique (participants, tickets, événements).
- Vite pour le bundling et le serveur de développement.  
- Librairies métier : `qrcode.react` pour la génération, `@zxing/browser` pour le scan, `papaparse` pour l'import CSV.
- Fonctionnement web-first (aucun binaire natif requis)
- **Code clé** : `src/api.ts` (communication HTTP et autocomplétion), `src/pages/Participants.tsx` (gestion participants), `src/pages/Scan.tsx` (lecture QR).

### Backend : FastAPI (Python)
- FastAPI expose les routes (`/users`, `/events`, `/tickets`, `/scan`).
- Documentation automatique disponible sur `/docs` (Swagger).
- Serveur ASGI : Uvicorn.


### Base de données : SQLite
- Tables pour les utilisateurs, événements, tickets générés et historique des scans.
- Migration possible vers PostgreSQL en conservant SQLAlchemy.


## 3. Fonctionnalités principales

### 3.1 Gestion des utilisateurs
- `POST /users/create` : ajout d'un utilisateur.
- `GET /users/search?query=` : autocomplétion.
- `GET /users/{id}` : fiche détaillée.

### 3.2 Gestion des événements
- `POST /events/create` : déclaration d'un événement.
- `GET /events/{id}/participants` : liste des inscrits.
- `POST /events/add_user` : inscription d'un utilisateur à un événement.

### 3.3 Génération de QR codes
- Création d'un ticket (UUID unique) quand un utilisateur rejoint un événement.
- Envoi au front, qui génère le QR Code (lib `qrcode.react`) et peut l'exporter/envoyer par mail.

### 3.4 Scan des QR codes
- Le front lit le QR, extrait le UUID/ticketId puis appelle `POST /scan { "ticketId": "..." }`.
- Le backend retourne si le ticket est valide, déjà utilisé ou invalide, avec les détails d'événement.


