# API Backend Babyfoot - Ynov Toulouse

API REST complète pour la gestion des babyfoots, réservations et parties en temps réel.

## 🚀 Quick Start

### Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env

# Configurer les variables d'environnement
# Éditer .env avec vos paramètres PostgreSQL

# Démarrer le serveur en mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

Documentation Swagger : `http://localhost:3000/api-docs`

## 📦 Structure du Projet

```
backend/
├── config/          # Configuration DB et Swagger
├── controllers/     # Logique métier
├── middleware/      # Auth, validation, erreurs
├── models/          # Modèles Sequelize
├── routes/          # Définition des endpoints
├── utils/           # Constantes et helpers
└── index.js         # Point d'entrée
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Inscription / Connexion

```bash
# Inscription
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}

# Connexion
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

Le token JWT est retourné dans la réponse. Incluez-le dans les requêtes protégées :

```
Authorization: Bearer <votre_token>
```

## 📋 Endpoints Principaux

### Auth

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur

### Users (CRUD complet)

- `GET /api/users` - Liste (admin)
- `GET /api/users/:id` - Détails
- `PUT /api/users/:id` - Modification
- `DELETE /api/users/:id` - Suppression (admin)
- `PATCH /api/users/:id/role` - Changer rôle (admin)

### Tables (Babyfoots)

- `GET /api/tables` - Liste
- `GET /api/tables/:id` - Détails
- `GET /api/tables/:id/availability` - Vérifier disponibilité
- `POST /api/tables` - Créer (admin)
- `PUT /api/tables/:id` - Modifier (admin)
- `DELETE /api/tables/:id` - Supprimer (admin)

### Reservations

- `GET /api/reservations` - Liste (admin)
- `GET /api/reservations/my` - Mes réservations
- `POST /api/reservations` - Créer
- `DELETE /api/reservations/:id` - Annuler

### Games (Live Scoring)

- `GET /api/games/live` - Parties en cours
- `GET /api/games/:id` - Détails partie
- `POST /api/games` - Créer partie
- `PATCH /api/games/:id/score` - Update score
- `POST /api/games/:id/end` - Terminer partie

## 🗄️ Base de Données

PostgreSQL avec Sequelize ORM.

### Modèles

- **Users** : Utilisateurs et authentification
- **Tables** : Babyfoots disponibles
- **Reservations** : Système de réservation
- **Games** : Parties avec scores
- **GamePlayers** : Joueurs dans les parties

### Configuration

Éditer `.env` :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=babyfoot_db
DB_USER=postgres
DB_PASSWORD=postgres
```

Les tables sont créées automatiquement au démarrage (mode dev).

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- JWT pour authentification stateless
- Validation des inputs avec express-validator
- Rate limiting (100 req/15min)
- CORS configuré
- Codes HTTP appropriés

## 🎯 Rôles & Permissions

### USER (défaut)

- Créer des réservations
- Créer/rejoindre des parties
- Voir ses propres données
- Modifier son profil

### ADMIN

- Tous les droits USER +
- Gérer tous les utilisateurs
- Gérer les babyfoots (CRUD)
- Voir toutes les réservations
- Changer les rôles

## 📊 Exemples d'Utilisation

### Créer une Réservation

```bash
POST /api/reservations
Authorization: Bearer <token>
{
  "table_id": "uuid-du-babyfoot",
  "start_time": "2025-10-17T14:00:00Z",
  "end_time": "2025-10-17T15:00:00Z"
}
```

### Créer une Partie

```bash
POST /api/games
Authorization: Bearer <token>
{
  "table_id": "uuid-du-babyfoot",
  "players": [
    {
      "user_id": "uuid-joueur-1",
      "team_color": "RED",
      "role": "ATTACK"
    },
    {
      "user_id": "uuid-joueur-2",
      "team_color": "RED",
      "role": "DEFENSE"
    },
    {
      "user_id": "uuid-joueur-3",
      "team_color": "BLUE",
      "role": "ATTACK"
    },
    {
      "user_id": "uuid-joueur-4",
      "team_color": "BLUE",
      "role": "DEFENSE"
    }
  ]
}
```

### Mettre à Jour un Score

```bash
PATCH /api/games/:id/score
Authorization: Bearer <token>
{
  "team_red_score": 5,
  "team_blue_score": 3
}
```

## 🧪 Tests

Utiliser la documentation Swagger pour tester tous les endpoints :
`http://localhost:3000/api-docs`

## 📝 Notes Techniques

- Architecture MVC modulaire
- Gestion d'erreurs centralisée
- Logging avec Morgan
- Relations Sequelize (belongsTo, hasMany)
- Validation stricte des données
- Code propre et commenté

## 🛠️ Stack Technique

- **Framework** : Express.js 5
- **ORM** : Sequelize 6
- **Database** : PostgreSQL
- **Auth** : JWT + bcrypt
- **Validation** : express-validator
- **Documentation** : Swagger/OpenAPI
- **Logging** : Morgan
- **Security** : CORS, Rate Limiting

## 👥 Équipe

Dev FullStack Team Crashitecture :

- STOFFELBACH Théo
- LAFITTE Antoine
- REMERY Lucas

Hackathon Ynov Toulouse 2025 - Babyfoot du Futur 🏓
