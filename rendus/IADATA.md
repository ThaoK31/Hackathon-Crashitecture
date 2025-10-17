# Hackathon - Ynov Toulouse 2025 : Babyfoot du futur - IA & Data

## Equipe

- IA & Data 1 : CASTELLANO Julien
- IA & Data 2 : MESON Rémi

Et si on réinventait l’expérience babyfoot à Ynov ? L’objectif de ce hackathon est de moderniser et digitaliser l’usage des babyfoots présents dans le Souk pour créer un service _next-gen_, pensé pour près de 1000 étudiants !

Que ce soit via des gadgets connectés, un système de réservation intelligent, des statistiques en temps réel ou des fonctionnalités robustes pour une utilisation massive, nous cherchons des solutions innovantes qui allient créativité et technologie.

Toutes les filières sont invitées à contribuer : Dev, Data, Infra, IoT, Systèmes embarqués… chaque idée compte pour rendre le babyfoot plus fun, plus pratique et plus connecté.

Votre mission : transformer le babyfoot classique en expérience high-tech pour Ynov !

---

> Ce fichier contient les informations spécifiques à l'IA/Data de votre projet. Il suffit d'en remplir une seule fois, même si vous êtes plusieurs IA/Data dans l'équipe.

# Requis

Ce README contient les requis fonctionnels de la partie IA Data de votre projet. Il doit compléter le README principal à la racine du projet, et servira la partie de votre note propre à votre spécialité.

Basez-vous sur les spécifications dans [SPECIFICATIONS.md](../SPECIFICATIONS.md) pour remplir ce document.

Décrivez ici les actions que vous avez menées, votre démarche, les choix techniques que vous avez faits, les difficultés rencontrées, etc. Précisez également dans quelle mesure vous avez pu collaborer avec les autres spécialités.

Autrement, il n'y a pas de format imposé, mais essayez de rester clair et concis, je ne vous demande pas de rédiger un roman, passez à l'essentiel, et épargnez-moi de longues pages générées par IA (malusée).

En conclusion, cela doit résumer votre travail en tant qu'expert.e IA Data, et vous permettre de garder un trace écrite de votre contribution au projet.

Merci de votre participation, et bon courage pour la suite du hackathon !

______________________________________________________________________________________________________________________________________________________________________________

On va repartir notre travail en 5 grandes etapes: Exploration des données, Modélisation de la BDD, Nettoyage des données, Exportation des données en BDD et Analyse des données et Visualisation. Tout les documents et supports cité dans ce .md sont consultable dans le dossier /rendus/data .


# Exploration des données

La 1ere étapes pour nous à consisté de découvrir le dataset grâce à python et notament avec la bibliothéque pandas et de repérer les colonnes exploitable et utilisable pour la finalité du projet commun.
A travers cette exploration nous avont répartie les tâches pour le futur néttoyage des données et la réalisation du MCD (Model Conceptuel de Données),
grâce a cette exploration on à pu constater un gros travail de nettoyage notament au niveau des dates et en normalisation du texte et chiffres (multiformat de valeur dans les colonnes, données manquantes, erreur de format...).

# Réalisation du MCD (1er jet)

Apres discution avec les différentes filliére, nous avons fait le choix de réaliser le MCD (schéma dans le dossier data) pour permettre a l'équipe des infras et aux devs d'avancer de leurs cotés sans être bloqués.
Les infra on pu créer la BDD + les tables et les devs ont pu s'appuyer sur le MCD pour construire leurs logique de requetage.

# Nettoyage des données

Voici l'étape la plus longue et aussi celle qui nous à posé le plus de difficulté car plus on nettoyé et on exploré plus on trouver de quoi nettoyer ! on voyait le temps passer et notre donnée toujours pas propre comme on le voulait.

On s'est séparé le travail en 2 partie , une personne qui s'occupe du nettoyage des dates et des durées et l'autre personne qui s'occupe de la normalisation des données et complétion des valeurs nuls.

Exemple de dates dans le dataset et du resultat voulu et obtenu:

Avant:          Aprés:
Feb 06st 2023   2023-02-06  
24-03-2023      2023-03-24
2025-01-13      2025-01-13
Nov 11 2025     2025-11-11
30 Sep 23       2023-09-30


Exemple de valeurs différente uniformisé par la suite dans la colonne winner:

Avant:        Aprés:
Red           red
blue          blue
NaN           blue (Gagnant récupéré grace au score bleu et rouge de la partie)
R             red
B             blue

On à encore beaucoup d'autres exemples colonne raw_rating, game_duration etc ... Toute notre démarche de nettoyage est disponible et documenté dans notre notebook dans le dossier /rendu/data.

# Exportation des données en BDD
C'est une des seule étapes que l'on à pas pu terminer par manque de temps, beaucoup de probléme de connexion à la BDD, on à quand même pu séparer notre CSV en plusieurs datafame correspondant à chacune de nos table en BDD et en exporter quelque une grâce à la bibliothéque SQLalchemy qui permet de se connecter à une BDD et d'exporeter des dataframe vers la BDD.


# Analyse des données

Une fois les données propres on s'est séparer le travail,  1 personne sur l'analyse sur notebook via python et une personne sur powerBI pour le rapport à rendre avec les quelques KPI demandés.

Avant de se lancer tête baissé dans l'analyse des données on à fixer quelques KPI qui pourrait être intéressant.
On s'est arrêté sur 3 KPI qui nous ont semblé intéressant niveau statistiques: 
- La corrélation entre le fait de marquer contre son camps et une possible défaite. La reponse est non ! on peut donc etre maladroit et avoir toute ses chance de gagner.

- le % de victoire équipe bleu et rouge par table de baby-foot, l'objectif était de faire ressortir les tables qui favoriserai un côté plus que l'autre à cause d'une barre abîmée ou qui bloque, ou par exemple un côté qui penche plus que l'autre. Résultat les babyfoot ont l'air bien entretenu car les % de victoires sur les tables sont plutot equitable !

- Le nombre de partie joué sur une saison 2024/2025, ce KPI nous à servi lors de la présentation de notre projet pour justifier l'utilité de notre solution de réservation de table.
