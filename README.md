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

- [Contexte](#contexte)
- [Equipe](#equipe)
- [Table des matières](#table-des-matières)
- [Contenu du projet](#contenu-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Architecture](#architecture)
- [Guide de déploiement](#guide-de-déploiement)
- [Etat des lieux](#etat-des-lieux)

## Contenu du projet

Babynov est un espace utilisateur complet qui offre plusieurs fonctionnalités clés pour améliorer l’expérience des joueurs.
Il permet tout d’abord la réservation simple et sécurisée des babyfoots, facilitant la gestion des créneaux et la coordination entre les joueurs. 
Ensuite, chaque utilisateur bénéficie d’un profil personnalisé où il peut consulter ses statistiques détaillées des parties jouées, lui donnant un aperçu clair de ses performances et de sa progression dans le jeu. Enfin, Babynov offre un accès en temps réel aux scores des parties en cours, permettant à tous les joueurs et spectateurs de suivre les défis et les résultats en direct, rendant l’expérience plus dynamique et engageante. 
Ces fonctionnalités combinées font de Babynov une plateforme interactive et conviviale dédiée aux amateurs de babyfoot.

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
- **React JS** : Nous avons choisi React pour sa modularité et sa facilité à construire des interfaces utilisateur dynamiques et performantes. Sa large communauté et son écosystème riche permettent un développement rapide et maintenable.

- **Vite** : Vite a été retenu comme outil de build frontend pour sa rapidité exceptionnelle grâce à son système de compilation à chaud optimisé. Cela améliore considérablement le temps de développement et le feedback instantané lors du coding.

- **Node.js** : Utilisé côté serveur, Node.js offre un environnement performant, asynchrone et léger, idéal pour gérer les requêtes HTTP et les websockets nécessaires au backend Babynov.

- **Express** : Nous utilisons Express comme framework minimaliste pour Node.js. Il facilite la création d’API REST robustes et modulaires, tout en permettant une structure claire et extensible du backend.


## Architecture

> Faite un schéma simple de l'architecture technique de votre solution. Chaque service/composant est un bloc, et les interactions entre les blocs sont des flèches. Vous pouvez utiliser des outils comme [draw.io](https://app.diagrams.net/), ou encore [Excalidraw](https://excalidraw.com/) pour créer vos schémas. C'est une vue d'ensemble, pas un détail de chaque composant. Chacun d'entre vous doit être capable d'expliquer cette architecture.

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

Le but n'est pas de faire un produit fini, mais de montrer vos compétences techniques, votre capacité à travailler en équipe, à gérer un projet, et à livrer quelque chose de fonctionnel dans un temps limité.
