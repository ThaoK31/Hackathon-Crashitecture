# Hackathon - Ynov Toulouse 2025 : Babyfoot du futur - FullStack

## Equipe

- Dev' FullStack 1 : STOFFELBACH Théo
- Dev' FullStack 2 : LAFITTE Antoine
- Dev' FullStack 3 : REMERY Lucas

---

## Stack Technique

**Backend :**
- Node.js + Express
- PostgreSQL (via Sequelize ORM)
- Redis pour le cache
- JWT pour l'authentification
- bcryptjs pour le hashage des mots de passe
- Socket.io pour les WebSockets temps réel
- express-rate-limit pour la protection API
- Swagger pour la documentation API

**Frontend :**
- React + TypeScript
- Vite
- Tailwind CSS
- Zod pour la validation
- Axios pour les appels API
- React Router pour la navigation
- Socket.io-client pour les WebSockets
- react-datepicker pour la sélection de dates

**Infrastructure :**
- Docker + Docker Compose
- Ansible pour le déploiement
- GitHub Actions pour le CI/CD

## Fonctionnalités Implémentées

### Authentification
- Système d'inscription/connexion complet
- Gestion des rôles (utilisateur/admin)
- JWT avec refresh tokens
- Protection des routes sensibles

### Gestion des Tables
- CRUD complet pour les babyfoots
- Système de disponibilité
- Cache Redis pour optimiser les performances
- Filtrage et recherche

### Système de Réservation
- Réservation avec sélection de créneau
- Validation en temps réel des disponibilités
- Durées flexibles (15min à 3h)
- Protection contre les dates dans le passé
- Sélecteur de date moderne avec react-datepicker
- Bouton "Maintenant" pour réservation immédiate

### Gestion des Parties
- Création de parties avec 2-4 joueurs
- Attribution automatique des rôles (attaquant/défenseur)
- Système de score en temps réel
- WebSockets pour les mises à jour live
- Historique des parties

### Dashboard Admin
- Vue d'ensemble des statistiques
- Gestion des utilisateurs (lecture, modification des rôles, suppression)
- Gestion des tables (CRUD complet)
- Visualisation des réservations et parties
- Graphiques et métriques
- Export des données

### Pages Utilisateur
- Page d'accueil (landing page)
- Page des tables disponibles
- Page des parties en cours
- Page de l'historique des parties
- Page des réservations personnelles
- Navigation fluide avec React Router

### API RESTful
- Architecture REST complète
- Codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)
- Documentation Swagger
- Middleware de validation
- Gestion d'erreurs centralisée

### Sécurité
- Hashage des mots de passe avec bcryptjs
- Protection des routes sensibles avec JWT
- Rate limiting pour protéger l'API
- Validation des données côté serveur
- Gestion des CORS

### Outils de Développement
- ESLint pour la qualité du code
- TypeScript pour la sécurité des types
- Morgan pour le logging des requêtes
- Seeders pour les données de test
- Hot reload avec Vite et Nodemon

## Choix Techniques

**Zod pour la validation** : On a intégré Zod pour valider les formulaires côté client et serveur. Ça garantit la cohérence des données et améliore l'UX avec des messages d'erreur clairs.

**Redis pour le cache** : On a utilisé Redis pour cacher les listes de tables et optimiser les performances. Ça réduit la charge sur la base de données.

**WebSockets (Socket.io)** : Pour les parties en cours, on a implémenté des WebSockets avec Socket.io pour mettre à jour les scores en temps réel. C'est plus fluide qu'un polling et ça permet une meilleure expérience utilisateur.

**Docker** : Tout est containerisé pour faciliter le déploiement et la collaboration entre les membres de l'équipe.

**TypeScript** : On a utilisé TypeScript côté frontend pour avoir une meilleure sécurité des types et réduire les erreurs à l'exécution.

**Sequelize ORM** : On a utilisé Sequelize pour simplifier les requêtes SQL et faciliter la gestion de la base de données.

**React Router** : On a utilisé React Router pour gérer la navigation entre les pages et créer une SPA (Single Page Application).

## Difficultés Rencontrées

**Intégration de la base de données Data** : On a beaucoup collaboré avec l'équipe Data/IA sur la structure de la base de données. On avait bien avancé le développement, mais au final on n'a pas eu assez de temps après avoir reçu la base de données finale pour adapter complètement notre code. On n'a pas totalement migré vers leur BDD, à cause de nombreuses régressions.

**Gestion des réservations** : On a dû améliorer l'UX du système de réservation pour rendre l'interface plus intuitive et fluide. (disponibilités des tables)

**WebSockets** : La mise en place des WebSockets a pris du temps, surtout pour gérer les déconnexions et les reconnexions automatiques.

**Validation des formulaires** : On a dû refactoriser plusieurs fois pour avoir une validation cohérente entre le front et le back.

**Gestion des conflits de réservation** : Au début, on avait des problèmes avec les conflits de réservation en temps réel. On a résolu ça en implémentant une validation côté serveur et en gérant les erreurs 409 (Conflict).

**Export des statistiques** : On a rencontré des difficultés pour exporter les statistiques et rapports pour les admins. On a résolu ça en créant des endpoints spécifiques pour les exports.

## Collaboration avec les Autres Spécialités

**Infra** : On a travaillé avec l'équipe Infra pour déployer l'application avec Docker et Ansible. On les a aidés à résoudre les problèmes de build Docker et à configurer les bases de données PostgreSQL et Redis. Ils ont mis en place l'infrastructure avec Apache2, Nginx et un pipeline GitHub Actions.

**Data** : On a beaucoup collaboré avec l'équipe Data/IA. On a travaillé ensemble à l'élaboration du MCD (Modèle Conceptuel de Données) en apportant notre vision technique et fonctionnelle de l'application. Ils ont nettoyé le dataset et fait des analyses statistiques (Top 10 buteurs, Top 5 défenseurs, corrélation couleur/victoire). Ils ont rencontré des problèmes de connexion à la BDD pour l'export final des données.

**IoT/Embedded** : Pas d'IoT

## Points à Améliorer

- Tests unitaires et d'intégration pour garantir la qualité du code
- Gestion des notifications (email, push) pour informer les utilisateurs
- Système de tournois (intercampus, championnat, etc.)
- Optimisation des requêtes SQL et mise en place d'index
- Système de classement et rating des joueurs

## Conclusion

On a réussi à créer une application complète et fonctionnelle avec les fonctionnalités essentielles. Le code est structuré, documenté et maintenable. On a aussi pu collaborer efficacement avec les autres équipes pour intégrer leurs fonctionnalités.
