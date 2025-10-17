# Documentation API - BabyfootHub

API REST complète pour la gestion des babyfoots Ynov Toulouse.

## 🌐 Base URL

```
http://localhost:3000
```

**Documentation Interactive** : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🔐 Authentification

L'API utilise **JWT (JSON Web Tokens)** pour l'authentification.

### Obtenir un Token

#### Inscription

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

Réponse :

```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Utiliser le Token

Incluez le token dans l'header `Authorization` :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Endpoints

### Auth

| Méthode | Endpoint             | Auth | Description |
| ------- | -------------------- | ---- | ----------- |
| POST    | `/api/auth/register` | Non  | Inscription |
| POST    | `/api/auth/login`    | Non  | Connexion   |
| GET     | `/api/auth/profile`  | Oui  | Mon profil  |

### Users

| Méthode | Endpoint              | Auth | Rôle        | Description          |
| ------- | --------------------- | ---- | ----------- | -------------------- |
| GET     | `/api/users`          | Oui  | ADMIN       | Liste tous les users |
| GET     | `/api/users/:id`      | Oui  | Owner/ADMIN | Détails d'un user    |
| PUT     | `/api/users/:id`      | Oui  | Owner/ADMIN | Modifier un user     |
| DELETE  | `/api/users/:id`      | Oui  | ADMIN       | Supprimer un user    |
| PATCH   | `/api/users/:id/role` | Oui  | ADMIN       | Changer le rôle      |

### Tables (Babyfoots)

| Méthode | Endpoint                       | Auth | Rôle  | Description              |
| ------- | ------------------------------ | ---- | ----- | ------------------------ |
| GET     | `/api/tables`                  | Non  | -     | Liste tous les babyfoots |
| GET     | `/api/tables/:id`              | Non  | -     | Détails d'un babyfoot    |
| GET     | `/api/tables/:id/availability` | Non  | -     | Vérifier disponibilité   |
| POST    | `/api/tables`                  | Oui  | ADMIN | Créer un babyfoot        |
| PUT     | `/api/tables/:id`              | Oui  | ADMIN | Modifier un babyfoot     |
| DELETE  | `/api/tables/:id`              | Oui  | ADMIN | Supprimer un babyfoot    |

### Reservations

| Méthode | Endpoint                | Auth | Rôle        | Description                   |
| ------- | ----------------------- | ---- | ----------- | ----------------------------- |
| GET     | `/api/reservations`     | Oui  | ADMIN       | Liste toutes les réservations |
| GET     | `/api/reservations/my`  | Oui  | -           | Mes réservations              |
| POST    | `/api/reservations`     | Oui  | -           | Créer une réservation         |
| DELETE  | `/api/reservations/:id` | Oui  | Owner/ADMIN | Annuler une réservation       |

### Games (Live Scoring)

| Méthode | Endpoint               | Auth | Description            |
| ------- | ---------------------- | ---- | ---------------------- |
| GET     | `/api/games/live`      | Non  | Parties en cours       |
| GET     | `/api/games/:id`       | Non  | Détails d'une partie   |
| POST    | `/api/games`           | Oui  | Créer une partie       |
| PATCH   | `/api/games/:id/score` | Oui  | Mettre à jour le score |
| POST    | `/api/games/:id/end`   | Oui  | Terminer une partie    |

## 📝 Exemples Complets

### 1. Créer un Compte et Se Connecter

```bash
# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@ynov.com",
    "username": "alice",
    "password": "password123"
  }'

# Connexion (récupérer le token)
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@ynov.com",
    "password": "password123"
  }' | jq -r '.data.token')

echo $TOKEN
```

### 2. Créer un Babyfoot (Admin)

```bash
curl -X POST http://localhost:3000/api/tables \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Babyfoot #1 Souk",
    "location": "Souk Ynov Toulouse",
    "condition": "EXCELLENT"
  }'
```

### 3. Vérifier la Disponibilité

```bash
# Récupérer l'ID du babyfoot
TABLE_ID="uuid-du-babyfoot"

curl "http://localhost:3000/api/tables/$TABLE_ID/availability?start_time=2025-10-17T14:00:00Z&end_time=2025-10-17T15:00:00Z"
```

### 4. Créer une Réservation

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": "uuid-du-babyfoot",
    "start_time": "2025-10-17T14:00:00Z",
    "end_time": "2025-10-17T15:00:00Z"
  }'
```

### 5. Créer une Partie 2v2

```bash
curl -X POST http://localhost:3000/api/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": "uuid-du-babyfoot",
    "players": [
      {
        "user_id": "uuid-alice",
        "team_color": "RED",
        "role": "ATTACK"
      },
      {
        "user_id": "uuid-bob",
        "team_color": "RED",
        "role": "DEFENSE"
      },
      {
        "user_id": "uuid-charlie",
        "team_color": "BLUE",
        "role": "ATTACK"
      },
      {
        "user_id": "uuid-david",
        "team_color": "BLUE",
        "role": "DEFENSE"
      }
    ]
  }'
```

### 6. Mettre à Jour le Score

```bash
GAME_ID="uuid-de-la-partie"

curl -X PATCH "http://localhost:3000/api/games/$GAME_ID/score" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "team_red_score": 5,
    "team_blue_score": 3
  }'
```

### 7. Terminer la Partie

```bash
curl -X POST "http://localhost:3000/api/games/$GAME_ID/end" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Voir les Parties en Cours

```bash
curl http://localhost:3000/api/games/live
```

## 🎨 Codes de Réponse HTTP

| Code | Signification         | Description                        |
| ---- | --------------------- | ---------------------------------- |
| 200  | OK                    | Requête réussie                    |
| 201  | Created               | Ressource créée                    |
| 400  | Bad Request           | Erreur de validation               |
| 401  | Unauthorized          | Token manquant/invalide            |
| 403  | Forbidden             | Permissions insuffisantes          |
| 404  | Not Found             | Ressource non trouvée              |
| 409  | Conflict              | Conflit (ex: créneau déjà réservé) |
| 500  | Internal Server Error | Erreur serveur                     |

## 🔒 Permissions

### Rôles

- **USER** (défaut) : Utilisateur standard
- **ADMIN** : Administrateur

### Matrice de Permissions

| Action                               | USER | ADMIN |
| ------------------------------------ | ---- | ----- |
| Voir les babyfoots                   | ✅   | ✅    |
| Créer un babyfoot                    | ❌   | ✅    |
| Modifier un babyfoot                 | ❌   | ✅    |
| Voir tous les users                  | ❌   | ✅    |
| Modifier son profil                  | ✅   | ✅    |
| Changer les rôles                    | ❌   | ✅    |
| Créer une réservation                | ✅   | ✅    |
| Voir toutes les réservations         | ❌   | ✅    |
| Annuler sa réservation               | ✅   | ✅    |
| Annuler n'importe quelle réservation | ❌   | ✅    |
| Créer une partie                     | ✅   | ✅    |
| Modifier le score                    | ✅   | ✅    |

## 📊 Modèles de Données

### User

```json
{
  "id": "uuid",
  "email": "string",
  "username": "string",
  "role": "USER | ADMIN",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Table (Babyfoot)

```json
{
  "id": "uuid",
  "name": "string",
  "location": "string",
  "condition": "EXCELLENT | GOOD | WORN | NEEDS_MAINTENANCE",
  "is_available": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Reservation

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "table_id": "uuid",
  "start_time": "datetime",
  "end_time": "datetime",
  "status": "ACTIVE | CANCELLED | COMPLETED",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Game

```json
{
  "id": "uuid",
  "table_id": "uuid",
  "team_red_score": "integer",
  "team_blue_score": "integer",
  "status": "ONGOING | FINISHED",
  "started_at": "datetime",
  "ended_at": "datetime | null",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### GamePlayer

```json
{
  "id": "uuid",
  "game_id": "uuid",
  "user_id": "uuid",
  "team_color": "RED | BLUE",
  "role": "ATTACK | DEFENSE",
  "goals": "integer",
  "assists": "integer",
  "saves": "integer",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## 🚨 Gestion des Erreurs

Format de réponse d'erreur :

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

### Erreurs Communes

#### Email déjà utilisé

```json
{
  "success": false,
  "message": "Cette valeur existe déjà"
}
```

#### Token invalide

```json
{
  "success": false,
  "message": "Token invalide ou expiré"
}
```

#### Créneau déjà réservé

```json
{
  "success": false,
  "message": "Ce créneau est déjà réservé"
}
```

## 🔄 Rate Limiting

- **Limite** : 100 requêtes par IP toutes les 15 minutes
- **Headers de réponse** :
  - `X-RateLimit-Limit` : Limite totale
  - `X-RateLimit-Remaining` : Requêtes restantes
  - `X-RateLimit-Reset` : Timestamp de reset

## 📚 Ressources

- **Documentation Swagger** : `/api-docs`
- **Health Check** : `/health`
- **Info API** : `/`

---

**Hackathon Ynov Toulouse 2025** 🏓
