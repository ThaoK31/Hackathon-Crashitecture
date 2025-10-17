# Hackathon - Ynov Toulouse 2025 : Babyfoot du futur - Cloud & Infrastructure

## Equipe

- Cloud & Infra 2 : Mathis Dubaille  
- Cloud & Infra 1 : NOM Prénom
- Cloud & Infra : NOM Prénom
  
Objectif général
---
Déployer une infrastructure redondante et sécurisée, afin de déployer un site web pouvant gérer la reservation et le scoring des joueurs.

Hébergement de l’application web (frontend et backend)
Base de données pour stocker les informations des babyfoots et des utilisateurs
Services de surveillance et de journalisation (Supervision)
Mise en place de la sécurité (firewalls, gestion des accès, etc.)

Simplicité de déploiement :
---
Utilisation d’outils d’automatisation (Ansible) pour déployer l’infrastructure en une seule commande.

Documentation claire pour le déploiement. (cf script)
 
Host sécurisé et protégé :
---
Déploiement du site via une stack apache2 et nginx.
-> Apache2 porte le rôle de serveur web, exposant ses services sur le port http.
-> Nginx porte le rôle de reverse proxy, il expose les services du serveur web sur le port 443 via https. le certificat ssl est autosignée. (prévoir en évolution de faire un certificat valide avec nom de domaine)
---
Base de données :
---
2 bases de données pour l'hébergement :
-> 1 base REDIS, pour actualisation en temps réel des données
-> 1 base Postgresql, pour l'hébergement des joueurs

Sauvegardes régulières et restauration des données. (faire des tests et fabriquer une documentation)

Surveillance et journalisation :
---
-> Journalisation des accès par nginx (check des logs)
-> Déployer un système de survaillance via zabbix pour monitorer les différents points :
      -> Etat des bases
      -> Taille stockage
      -> Connexion active

 Schéma Réseau :     
<img width="739" height="618" alt="image" src="https://github.com/user-attachments/assets/d8ef9a01-df3f-43d5-96af-383f8aba2033" />

Dans le cas ou nous somme plus de 2 :

Haute disponibilités :
---
-> Mise en place de haute disponibilité sur les bases de données.
-> Redondance des bases avec réplication des bases en temps réel ( Prévoir 3 Bases pour POSTGRESQL dans le corrum, 2 en réplication + 1 qui fait l le vote)
-> Possibilité d'ajouter une ip virtuel pour regrouper nos bases et facilité la gestions des chemins vers les bdds pour les dev.
-> Redondance des serveur Apaches

Sécurité : 
---
-> Ajout d'un firewall dédié type PFSENSE ( Gestion de règle et limitation des com)
-> Segmentation sur 3 Résaeux ( SERVEUR, BDD, EXPOSITION)
-> Changer les ports par défaut des protocoles
-> Création de Honeypot sur les ports les plus utilisées

Evolution possible :

-> Hébérgement sur le cloud. Gérer la migration des données vers le cloud.
-> Dimensionnement automatique de l'infra.
-> Mise en conformité des données avec l'anssi (Stockage de données personnel type adresse mail, nom, prénom) 
