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
# Organisation du travail

Nous avons structuré notre travail en **5 grandes étapes** :  
1. Exploration des données  
2. Modélisation de la BDD  
3. Nettoyage des données  
4. Exportation des données en BDD  
5. Analyse statistique des données
6. Visualisation des données

Tous les documents et supports cités dans ce `.md` sont disponibles dans le dossier `/rendus/data`.  

---

# 1. Exploration des données

La première étape a été de **découvrir le dataset** grâce à Python, notamment avec la bibliothèque **Pandas**, et d’identifier les colonnes **exploitables** pour la finalité du projet.  

Cette exploration nous a permis de :  
- répartir les tâches pour le futur **nettoyage des données**,  
- préparer la **réalisation du MCD** (Modèle Conceptuel de Données).  

Nous avons rapidement constaté qu’un **gros travail de nettoyage** serait nécessaire, notamment :  
- au niveau des **dates**,  
- pour la **normalisation du texte et des chiffres** (valeurs multiformats, données manquantes, erreurs de format…).  

---

# 2. Réalisation du MCD (1er jet)

Après discussion avec les différentes filières, nous avons décidé de réaliser un **premier MCD** (schéma disponible dans `data`).  

Objectifs :  
- permettre à l’équipe **infrastructure** et aux **devs** d’avancer sans blocage,  
- fournir une base pour la **construction de la logique de requêtage**.  

Résultat :  
- Les infra ont pu créer la **BDD** et les **tables**,  
- Les devs ont pu se baser sur le **MCD** pour construire leur logique.  

---

# 3. Nettoyage des données

Cette étape a été **la plus longue et la plus complexe** :  
> Plus on nettoyait et explorait, plus on trouvait de nouvelles données à corriger !  

Nous avons réparti le travail en **2 parties** :  
- **Dates et durées** : une personne s’en est chargée,  
- **Normalisation et complétion des valeurs nulles** : l’autre personne s’en est occupée.  

**Exemple de dates avant/après nettoyage :**  

| Avant         | Après       |
|---------------|------------|
| Feb 06st 2023 | 2023-02-06 |
| 24-03-2023    | 2023-03-24 |
| 2025-01-13    | 2025-01-13 |
| Nov 11 2025   | 2025-11-11 |
| 30 Sep 23     | 2023-09-30 |

**Exemple de valeurs uniformisées dans la colonne `winner` :**  

| Avant | Après |
|-------|-------|
| Red   | red   |
| blue  | blue  |
| NaN   | blue (gagnant récupéré grâce au score bleu et rouge de la partie) |
| R     | red   |
| B     | blue  |

> D’autres colonnes concernées : `raw_rating`, `game_duration`, etc.  
Toute notre démarche de **nettoyage** est documentée dans le notebook, disponible dans `/rendus/data`.  

---

# 4. Exportation des données en BDD

Cette étape n’a pas pu être **complètement terminée** par manque de temps et à cause de **problèmes de connexion à la BDD**.  

Actions réalisées :  
- séparation du CSV en plusieurs **DataFrame** correspondant à chaque table,  
- exportation de certaines DataFrame grâce à **SQLAlchemy** (connexion et export vers la BDD).  

---

# 5. Analyse des données

Une fois les données nettoyées, nous avons réparti le travail :  
- **Python (notebook)** : analyse des données,  
- **PowerBI** : création du rapport avec les **KPI** demandés.  

Avant l’analyse, nous avons défini **3 KPI principaux** :  

1. **Corrélation entre les buts contre son camp et une défaite**  
   - Résultat : **non corrélé**. On peut être maladroit et avoir toutes ses chances de gagner.  

2. **Pourcentage de victoires des équipes bleue et rouge par table**  
   - Objectif : identifier les tables favorisant un côté (barre abîmée, table inclinée…).  
   - Résultat : les baby-foot sont **bien entretenus**, les pourcentages de victoires sont plutôt **équilibrés**.  

3. **Nombre de parties jouées sur la saison 2024/2025**  
   - Utilité : justifier la **solution de réservation de table** lors de la présentation.

---

# 6. Visualisation des données

Pour la visualisation des données et répondre aux questions posés nous avons utilisés POWER BI (fichier fournit dans le dossier rendus/data/BI_Baby_crash.pbix) avec notre dataset néttoyé :

- Pour le top 10 des meilleurs butteur nous avons optés pour un graphique à Barre groupé où nous pouvons voir le nombre de but par jouer ainsi que le nombre de matches joués
      Top 10 : Maria Bianchi, Casey Faure, Ethan Blanc, Youssef Bernard, Mateo Thomas, Mohamed Schmidt, Mateo Silva, Ava Philippe, Taylor Bianchi et Jordan Richard (plus de détail via le screen du bi fournit avec But et matchs)
               Pour réaliser la mesure, nous avons utilisé la colonne player_canonial_name car c'était la plus pertinente car la data était propre sur le dataset fournit (la colonne game_id n'était pas unique par joueur ainsi que player_name)
- Pour le top 5 des meilleurs défenseurs en se basant sur le nombre de tir arrêtés nous avons fait de nouveau un graphique à Barre groupé :
     Top 5 : Casey Faure, Maria Bianchi, Ethan Blanc, Youssef Bernard et Mohamed Schmidt
              Mesure réaliser avec les colonnes Player_saves et player_canonical_name (pour garder la cohésion avec les autres mesures et pour le motif cité plus haut)
- et pour répondre à la question si une couleur d'équipe qui influx sur la victoire la réponse est non car l'écart et trop insignifiant pour être considéré comme plausible (0,72% d'écart entre les deux couleurs)

Screen de référence : /rendus/data/screen bi question data.png

Nos difficultés pour ces mesures ont été plutôt de bien vérifier la qualité des données en amont afin d'apporter les réponses les plus précises possibles.

Nous avons aussi ajouté quelques infos supplémentaires comme :

- Un histogramme du nombre de matches par mois par saison avec un compteur du nombre de parties joués totale et la progression de celle-ci vs N-1 (+300% sur la saison 2024/2025 vs 2023/2024) avec plus de 20000 partie joué cette année-là vs approximativement 4900 partie sur n-1
        source /rendus/data/Screen_Bi_Histo_Match_season_2023_2024.png et /rendus/data/Screen_Bi_Histo_Match_season_2024_2025.png

Nous avons aussi ajouté un top 10 des joueurs ayant marqué le plus grand nombre de buts en moyenne par match ainsi que le top 10 des meilleurs joueurs ayant marqué le plus de but en étant en position de défense.
        source /rendus/data/screen_BI_Top_10_moyenne_but_all_season.png et /rendus/data/screen_BI_Top_10_Butteur_jouant_en_defense.png


  
  
