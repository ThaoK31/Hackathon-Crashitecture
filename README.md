<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="left"><h1>Hackathon - Ynov Toulouse 2025</h1></td>
<td align="right"><img src="ressources/logo.png" alt="Hackathon Ynov Toulouse 2025" width="100"/></td>
</tr>
</table>

> Ce repository contient les ressources ainsi que le code source développé lors du hackathon Ynov Toulouse 2025.



## Equipe

- Dev' FullStack 1 : STOFFELBACH Théo 
- Dev' FullStack 2 : LAFITTE Antoine
- Dev' FullStack 3 : REMERY Lucas
- Cloud & Infrastructure 1 : LOUCIF Inasse
- Cloud & Infrastructure 2 : DUBAILLE Mathis
- Cloud & Infrastructure 3 :  SELLIER Louis
- IA & Data 1 : CASTELLANO Julien
- IA & Data 2 : MESON Rémi (Porte parole)


## Table des matières

- [Equipe](#equipe)
- [Table des matières](#table-des-matières)
- [Contenu du projet](#contenu-du-projet)
- [Fonctionnalités clés](#fonctionnalités-clés)
- [Technologies utilisées](#technologies-utilisées)
    - [IA \& Data:](#ia--data)
    - [Infrastructure :](#infrastructure-)
    - [Développement:](#développement)
- [Architecture](#architecture)
- [Documentation Détaillée](#documentation-détaillée)
- [Guide de déploiement](#guide-de-déploiement)
  - [Prérequis](#prérequis)
  - [Commande unique pour déployer](#commande-unique-pour-déployer)
  - [Ce que fait cette commande :](#ce-que-fait-cette-commande-)
  - [Références](#références)
- [Etat des lieux](#etat-des-lieux)

## Contenu du projet

Babynov est un espace utilisateur complet qui offre plusieurs fonctionnalités clés pour améliorer l'expérience des joueurs.
Il permet tout d'abord la réservation simple et sécurisée des babyfoots, facilitant la gestion des créneaux et la coordination entre les joueurs. 
Ensuite, chaque utilisateur bénéficie d'un profil personnalisé où il peut consulter ses statistiques détaillées des parties jouées, lui donnant un aperçu clair de ses performances et de sa progression dans le jeu. Enfin, Babynov offre un accès en temps réel aux scores des parties en cours, permettant à tous les joueurs et spectateurs de suivre les défis et les résultats en direct, rendant l'expérience plus dynamique et engageante. 
Ces fonctionnalités combinées font de Babynov une plateforme interactive et conviviale dédiée aux amateurs de babyfoot.

## Fonctionnalités clés

- **Réservation intelligente** : Sélection de créneaux avec bouton "Maintenant" pour réservation immédiate, durées flexibles (15min à 3h)
- **Gestion des parties** : Création de parties avec 2-4 joueurs, attribution automatique des rôles, scores en temps réel via WebSockets
- **Dashboard administrateur** : Gestion des utilisateurs, tables, réservations et statistiques
- **Authentification sécurisée** : JWT avec gestion des rôles (utilisateur/admin)
- **Interface moderne** : React + TypeScript avec Tailwind CSS et validation Zod

## Technologies utilisées

#### IA & Data:
- Python : Langage que l'on maitrise le mieux mais aussi le plus utilisé pour la Data Science et l'exploration de données, notamment grâce à ses bibliothèques comme Pandas.

- Pandas : Bibliothèque indispensable pour manipuler des données tabulaires. Le format DataFrame et ses nombreuses méthodes nous ont permis de nettoyer, transformer et gérer efficacement les valeurs manquantes.

- Jupyter Notebook : Un environnement parfait pour l’analyse exploratoire. Son interface par cellules nous a permis d’itérer rapidement sur nos traitements tout en documentant clairement notre démarche, rendant notre travail facile à suivre.

- Power BI : Outil de Data Visualisation. Nous l'avons choisi pour la restitution finale de nos analyses. Sa capacité à créer rapidement des dashboards interactifs et percutants en fait la solution idéale.
#### Infrastructure :
- **Docker** : Nous avons choisi Docker car il permet de containeriser chaque composant (backend, frontend, bases de données) dans des environnements isolés. Cela simplifie le déploiement et garantit la cohérence sur différents serveurs.

- **Docker Compose** : Cet outil est indispensable pour gérer plusieurs containers en même temps. Docker Compose nous permet de définir et de lancer toute la stack Babynov en un seul fichier, avec une simple commande.

- **Ansible** : Nous utilisons Ansible pour automatiser complètement le déploiement et la configuration. Son approche déclarative via les playbooks facilite la répétabilité et la maintenance des déploiements.

- **GitHub Actions** : Nous avons intégré GitHub Actions pour l’automatisation CI/CD. À chaque commit, un workflow déclenche Ansible afin de déployer automatiquement la dernière version, assurant ainsi un déploiement rapide et fiable.

- **Redis** : Choisi pour sa rapidité et sa capacité à gérer les données en temps réel. Redis est idéal pour actualiser instantanément les informations comme les scores et états des babyfoots, garantissant une expérience fluide pour les joueurs.

- **PostgreSQL** : Base de données relationnelle robuste et puissante. Nous avons opté pour PostgreSQL pour stocker toutes les données persistantes, notamment les profils des joueurs, les réservations, et les historiques de parties avec une fiabilité et une cohérence garanties.

#### Développement:
- **React + TypeScript** : Nous avons choisi React pour sa modularité et sa facilité à construire des interfaces utilisateur dynamiques et performantes. TypeScript apporte une sécurité des types qui réduit les erreurs à l'exécution et facilite la maintenance du code.

- **Vite** : Vite a été retenu comme outil de build frontend pour sa rapidité exceptionnelle grâce à son système de compilation à chaud optimisé. Cela améliore considérablement le temps de développement et le feedback instantané lors du coding.

- **Tailwind CSS** : Framework CSS utilitaire qui permet de créer rapidement des interfaces modernes et cohérentes sans écrire de CSS personnalisé.

- **Zod** : Bibliothèque de validation de schémas qui garantit la cohérence des données entre le frontend et le backend, avec des messages d'erreur clairs pour l'utilisateur.

- **Node.js + Express** : Utilisé côté serveur, Node.js offre un environnement performant, asynchrone et léger. Express facilite la création d'API REST robustes et modulaires.

- **Socket.io** : Bibliothèque pour les WebSockets qui permet la mise à jour en temps réel des scores et des parties en cours, offrant une expérience utilisateur fluide et réactive.

- **Sequelize** : ORM pour PostgreSQL qui simplifie les requêtes SQL et facilite la gestion de la base de données.

- **JWT** : Authentification sécurisée avec tokens JWT pour protéger les routes sensibles et gérer les sessions utilisateurs.


## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            UTILISATEURS                              │
│                    (Étudiants, Administrateurs)                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Pages    │  │ Composants│  │  Modals  │  │ Services │            │
│  │ (Home,   │  │ (Button,  │  │(Reservation,│ │ (API,   │            │
│  │ Tables,  │  │ Input,    │  │ Game,    │  │ Auth)    │            │
│  │ Games)   │  │ Card)     │  │ Table)   │  │          │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Routes      │  │ Controllers  │  │ Middleware   │              │
│  │  (REST API)  │  │  (Logique)   │  │ (Auth,       │              │
│  │              │  │              │  │  Validation) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              WebSocket (Socket.io)                            │  │
│  │         Mise à jour temps réel des scores                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────┬──────────────────────────────┬─────────────────────────┘
             │                              │
             │ Sequelize ORM                │
             ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   PostgreSQL Database    │    │      Redis Cache         │
│  ┌────────────────────┐  │    │  ┌────────────────────┐  │
│  │ Users              │  │    │  │ Tables Cache       │  │
│  │ Tables             │  │    │  │ Session Data       │  │
│  │ Reservations       │  │    │  │ WebSocket State    │  │
│  │ Games              │  │    │  └────────────────────┘  │
│  │ GamePlayers        │  │    └──────────────────────────┘
│  └────────────────────┘  │
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE (Docker)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Frontend    │  │  Backend     │  │  PostgreSQL  │              │
│  │  Container   │  │  Container   │  │  Container   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐                                                    │
│  │  Redis       │                                                    │
│  │  Container   │                                                    │
│  └──────────────┘                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Documentation Détaillée

Pour plus de détails sur le travail de chaque équipe :

- **[Documentation FullStack](./rendus/FULLSTACK.md)** - Détails techniques et fonctionnalités implémentées par l'équipe FullStack
- **[Documentation Infrastructure](./rendus/INFRA.md)** - Architecture, déploiement et sécurité
- **[Documentation IA & Data](./rendus/IADATA.md)** - Analyse des données et statistiques
- **[Documentation IoT/Systèmes Embarqués](./rendus/IOT_SYSEMB.md)** - Capteurs et automatisation

## Guide de déploiement

Ce guide explique comment déployer automatiquement l'application Babynov en utilisant Ansible et Docker, en une seule commande presque, sur une machine Linux Debian/Ubuntu.

### Prérequis

- Machine Linux (Debian/Ubuntu) avec accès SSH.
- Docker & Docker Compose installés (sinon Ansible s’en charge).
- Clé SSH configurée pour permettre la connexion sans mot de passe.
- Le dépôt contient le playbook Ansible `deploy.yml` et tous les fichiers nécessaires (backend, frontend, docker-compose.yml, scripts SQL).

### Commande unique pour déployer 
ansible-playbook -i inventory.ini deploy.yml -u ubuntu --private-key ~/.ssh/id_rsa

### Ce que fait cette commande :

- Connexion à la machine distante via SSH.
- Copie de tous les fichiers (code, configuration, docker-compose).
- Installation automatique de Docker et Docker Compose si nécessaires.
- Démarrage et mise à jour des containers Docker (backend, frontend, Postgres, Redis).
- Initialisation de la base de données PostgreSQL.
- Redémarrage des services backend pour appliquer les nouvelles versions.

---

### Références

- [Ansible Documentation](https://docs.ansible.com)
- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)


## Etat des lieux

> Section d'honnêteté, décrivez ce qui n'a pas été fait, ce qui aurait pu être amélioré, les limitations de votre solution actuelle. Montrez que vous avez une vision critique de votre travail, de ce qui a été accompli durant ces deux demi-journées.

L’une des parties qui n’a pas pu être finalisée à temps est la base de données. Une grande réflexion restait à mener côté data, notamment pour normaliser les ID entre les différentes tables avant de pouvoir exporter les données. Nous avons également rencontré des problèmes de connexion liés à l’infrastructure. Aussi, les besoins ont évolué tout au long du développement, rendant cette partie encore plus complexe à stabiliser.

Avec le recul, la base de données était le point central reliant l’ensemble de l’équipe. Il aurait sans doute fallu se concerter dès le lancement du projet afin d’identifier collectivement les besoins, les contraintes et les incertitudes de chacun autour de ce sujet.

Malgré ce petit manque d’organisation et de vision à long terme, l’équipe a su avancer, en veillant à ce que chacun puisse progresser de son côté tout en maintenant une bonne humeur.
