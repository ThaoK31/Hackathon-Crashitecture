import bcrypt from 'bcryptjs';
import { sequelize, User, Table, Reservation, Game, GamePlayer } from '../models/index.js';
import { USER_ROLES, TABLE_CONDITIONS, RESERVATION_STATUS, GAME_STATUS, TEAM_COLORS, PLAYER_ROLES } from '../utils/constants.js';

// Fonction helper pour générer un nombre aléatoire
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Fonction helper pour mélanger un tableau
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Démarrage du seeding...');

    // Synchroniser la DB (créer/mettre à jour les tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée');

    // Nettoyer TOUTES les données existantes
    console.log('🧹 Nettoyage complet de la base de données...');
    await GamePlayer.destroy({ where: {}, truncate: true, cascade: true });
    await Game.destroy({ where: {}, truncate: true, cascade: true });
    await Reservation.destroy({ where: {}, truncate: true, cascade: true });
    await Table.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Base de données complètement nettoyée');

    // ===== 1. CRÉER LES UTILISATEURS =====
    console.log('\n👥 Création des utilisateurs...');
    
    const password = await bcrypt.hash('password123', 10);

    const users = await User.bulkCreate([
      {
        email: 'admin@ynov.com',
        username: 'admin',
        password_hash: password,
        role: USER_ROLES.ADMIN
      },
      {
        email: 'theo@ynov.com',
        username: 'theo',
        password_hash: password,
        role: USER_ROLES.USER
      },
      {
        email: 'antoine@ynov.com',
        username: 'antoine',
        password_hash: password,
        role: USER_ROLES.USER
      },
      {
        email: 'lucas@ynov.com',
        username: 'lucas',
        password_hash: password,
        role: USER_ROLES.USER
      },
      {
        email: 'julien@ynov.com',
        username: 'julien',
        password_hash: password,
        role: USER_ROLES.USER
      },
      {
        email: 'remi@ynov.com',
        username: 'remi',
        password_hash: password,
        role: USER_ROLES.USER
      },
      {
        email: 'louis@ynov.com',
        username: 'louis',
        password_hash: password,
        role: USER_ROLES.USER
      },
      {
        email: 'inasse@ynov.com',
        username: 'inasse',
        password_hash: password,
        role: USER_ROLES.USER
      },
      {
        email: 'mathis@ynov.com',
        username: 'mathis',
        password_hash: password,
        role: USER_ROLES.USER
      }
    ]);

    console.log(`✅ ${users.length} utilisateurs créés`);
    console.log(`   Admin : admin@ynov.com / password123`);

    // ===== 2. CRÉER LES BABYFOOTS =====
    console.log('\n⚽ Création des babyfoots...');

    const tables = await Table.bulkCreate([
      {
        name: 'Babyfoot Premium #1',
        location: 'Souk Ynov - Zone A',
        condition: TABLE_CONDITIONS.EXCELLENT,
        is_available: true
      },
      {
        name: 'Babyfoot Classic #2',
        location: 'Souk Ynov - Zone B',
        condition: TABLE_CONDITIONS.GOOD,
        is_available: true
      },
      {
        name: 'Babyfoot Vintage #3',
        location: 'Souk Ynov - Zone C',
        condition: TABLE_CONDITIONS.WORN,
        is_available: true
      },
      {
        name: 'Babyfoot Pro #4',
        location: 'Souk Ynov - Zone A',
        condition: TABLE_CONDITIONS.EXCELLENT,
        is_available: false
      },
      {
        name: 'Babyfoot Old School #5',
        location: 'Souk Ynov - Zone D',
        condition: TABLE_CONDITIONS.NEEDS_MAINTENANCE,
        is_available: false
      }
    ]);

    console.log(`✅ ${tables.length} babyfoots créés`);

    // ===== 3. CRÉER LES RÉSERVATIONS =====
    console.log('\n📅 Création des réservations...');

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservations = await Reservation.bulkCreate([
      {
        user_id: users[1].id, // theo
        table_id: tables[0].id,
        start_time: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Dans 2h
        end_time: new Date(now.getTime() + 3 * 60 * 60 * 1000), // Dans 3h
        status: RESERVATION_STATUS.ACTIVE
      },
      {
        user_id: users[2].id, // antoine
        table_id: tables[1].id,
        start_time: new Date(now.getTime() + 4 * 60 * 60 * 1000), // Dans 4h
        end_time: new Date(now.getTime() + 5 * 60 * 60 * 1000), // Dans 5h
        status: RESERVATION_STATUS.ACTIVE
      },
      {
        user_id: users[3].id, // lucas
        table_id: tables[0].id,
        start_time: new Date(tomorrow.setHours(14, 0, 0, 0)), // Demain 14h
        end_time: new Date(tomorrow.setHours(15, 0, 0, 0)), // Demain 15h
        status: RESERVATION_STATUS.ACTIVE
      },
      {
        user_id: users[4].id, // julien
        table_id: tables[1].id,
        start_time: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Il y a 2h
        end_time: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Il y a 1h
        status: RESERVATION_STATUS.COMPLETED
      }
    ]);

    console.log(`✅ ${reservations.length} réservations créées`);

    // ===== 4. CRÉER DES PARTIES EN COURS =====
    console.log('\n🎮 Création des parties en cours...');

    const game1 = await Game.create({
      table_id: tables[0].id,
      team_red_score: 3,
      team_blue_score: 2,
      status: GAME_STATUS.ONGOING,
      started_at: new Date(now.getTime() - 15 * 60 * 1000) // Il y a 15 min
    });

    await GamePlayer.bulkCreate([
      {
        game_id: game1.id,
        user_id: users[1].id, // theo
        team_color: TEAM_COLORS.RED,
        role: PLAYER_ROLES.ATTACK,
        goals: 2,
        assists: 1,
        saves: 0
      },
      {
        game_id: game1.id,
        user_id: users[2].id, // antoine
        team_color: TEAM_COLORS.RED,
        role: PLAYER_ROLES.DEFENSE,
        goals: 1,
        assists: 2,
        saves: 3
      },
      {
        game_id: game1.id,
        user_id: users[3].id, // lucas
        team_color: TEAM_COLORS.BLUE,
        role: PLAYER_ROLES.ATTACK,
        goals: 1,
        assists: 1,
        saves: 0
      },
      {
        game_id: game1.id,
        user_id: users[4].id, // julien
        team_color: TEAM_COLORS.BLUE,
        role: PLAYER_ROLES.DEFENSE,
        goals: 1,
        assists: 0,
        saves: 2
      }
    ]);

    const game2 = await Game.create({
      table_id: tables[1].id,
      team_red_score: 5,
      team_blue_score: 4,
      status: GAME_STATUS.ONGOING,
      started_at: new Date(now.getTime() - 25 * 60 * 1000) // Il y a 25 min
    });

    await GamePlayer.bulkCreate([
      {
        game_id: game2.id,
        user_id: users[5].id, // remi
        team_color: TEAM_COLORS.RED,
        role: PLAYER_ROLES.ATTACK,
        goals: 3,
        assists: 2,
        saves: 0
      },
      {
        game_id: game2.id,
        user_id: users[6].id, // louis
        team_color: TEAM_COLORS.RED,
        role: PLAYER_ROLES.DEFENSE,
        goals: 2,
        assists: 1,
        saves: 4
      },
      {
        game_id: game2.id,
        user_id: users[7].id, // inasse
        team_color: TEAM_COLORS.BLUE,
        role: PLAYER_ROLES.ATTACK,
        goals: 2,
        assists: 2,
        saves: 0
      },
      {
        game_id: game2.id,
        user_id: users[8].id, // mathis
        team_color: TEAM_COLORS.BLUE,
        role: PLAYER_ROLES.DEFENSE,
        goals: 2,
        assists: 0,
        saves: 5
      }
    ]);

    console.log(`✅ 2 parties en cours créées`);

    // ===== 5. CRÉER 90 PARTIES TERMINÉES (40 parties par utilisateur) =====
    console.log('\n🏆 Création de 90 parties terminées (40 parties/utilisateur)...');
    
    const finishedGamesCount = 90;
    const availableUsers = users.slice(1); // Exclure l'admin
    let gamesCreated = 0;

    for (let i = 0; i < finishedGamesCount; i++) {
      // Sélectionner 4 joueurs aléatoires parmi les utilisateurs disponibles
      const shuffledUsers = shuffle(availableUsers);
      const gamePlayers = shuffledUsers.slice(0, 4);

      // Générer des scores aléatoires (gagnant à 10)
      const redScore = 10;
      const blueScore = random(4, 9);

      // Calculer un timestamp dans le passé (entre 1 et 60 jours)
      const daysAgo = random(1, 60);
      const hoursOffset = random(0, 23);
      const minutesOffset = random(0, 59);
      const gameTime = new Date(now);
      gameTime.setDate(gameTime.getDate() - daysAgo);
      gameTime.setHours(hoursOffset, minutesOffset, 0, 0);

      // Durée de partie entre 20 et 60 minutes
      const gameDuration = random(20, 60);
      const endTime = new Date(gameTime.getTime() + gameDuration * 60 * 1000);

      // Créer la partie
      const game = await Game.create({
        table_id: tables[random(0, tables.length - 1)].id,
        team_red_score: redScore,
        team_blue_score: blueScore,
        status: GAME_STATUS.FINISHED,
        started_at: gameTime,
        ended_at: endTime
      });

      // Créer les joueurs avec des stats réalistes
      const redGoals = redScore;
      const blueGoals = blueScore;

      // Distribuer les goals de l'équipe rouge
      const redAttackGoals = random(Math.ceil(redGoals * 0.5), redGoals);
      const redDefenseGoals = redGoals - redAttackGoals;

      // Distribuer les goals de l'équipe bleue
      const blueAttackGoals = random(Math.ceil(blueGoals * 0.5), blueGoals);
      const blueDefenseGoals = blueGoals - blueAttackGoals;

      await GamePlayer.bulkCreate([
        {
          game_id: game.id,
          user_id: gamePlayers[0].id,
          team_color: TEAM_COLORS.RED,
          role: PLAYER_ROLES.ATTACK,
          goals: redAttackGoals,
          assists: random(0, redDefenseGoals),
          saves: 0
        },
        {
          game_id: game.id,
          user_id: gamePlayers[1].id,
          team_color: TEAM_COLORS.RED,
          role: PLAYER_ROLES.DEFENSE,
          goals: redDefenseGoals,
          assists: random(0, redAttackGoals),
          saves: random(blueGoals, blueGoals + 5)
        },
        {
          game_id: game.id,
          user_id: gamePlayers[2].id,
          team_color: TEAM_COLORS.BLUE,
          role: PLAYER_ROLES.ATTACK,
          goals: blueAttackGoals,
          assists: random(0, blueDefenseGoals),
          saves: 0
        },
        {
          game_id: game.id,
          user_id: gamePlayers[3].id,
          team_color: TEAM_COLORS.BLUE,
          role: PLAYER_ROLES.DEFENSE,
          goals: blueDefenseGoals,
          assists: random(0, blueAttackGoals),
          saves: random(redGoals, redGoals + 5)
        }
      ]);

      gamesCreated++;
      
      // Afficher la progression tous les 10 parties
      if (gamesCreated % 10 === 0) {
        console.log(`   Progression : ${gamesCreated}/${finishedGamesCount} parties créées...`);
      }
    }

    console.log(`✅ ${gamesCreated} parties terminées créées avec succès !`);

    // Compter les parties par utilisateur
    console.log('\n📊 Vérification des parties par utilisateur...');
    for (const user of availableUsers) {
      const count = await GamePlayer.count({
        where: { user_id: user.id },
        include: [{
          model: Game,
          as: 'game',
          where: { status: GAME_STATUS.FINISHED }
        }]
      });
      console.log(`   ${user.username} : ${count} parties terminées`);
    }

    // ===== RÉSUMÉ =====
    console.log('\n📊 Résumé du seeding :');
    console.log('─────────────────────────────────────');
    console.log(`👥 Utilisateurs : ${users.length}`);
    console.log(`   - Admin : admin@ynov.com / password123`);
    console.log(`   - Users : theo, antoine, lucas, julien, remi, louis, inasse, mathis`);
    console.log(`   - Tous les mots de passe : password123`);
    console.log(`\n⚽ Babyfoots : ${tables.length}`);
    console.log(`   - Disponibles : ${tables.filter(t => t.is_available).length}`);
    console.log(`   - En maintenance : ${tables.filter(t => !t.is_available).length}`);
    console.log(`\n📅 Réservations : ${reservations.length}`);
    console.log(`   - Actives : ${reservations.filter(r => r.status === RESERVATION_STATUS.ACTIVE).length}`);
    console.log(`   - Complétées : ${reservations.filter(r => r.status === RESERVATION_STATUS.COMPLETED).length}`);
    console.log(`\n🎮 Parties :`);
    console.log(`   - En cours : 2 parties`);
    console.log(`   - Terminées : ${gamesCreated} parties`);
    console.log(`   - Total joueurs dans l'historique : ${gamesCreated * 4}`);
    console.log(`   - ~40 parties par utilisateur`);
    console.log('─────────────────────────────────────');
    console.log('\n✅ Seeding terminé avec succès !');
    console.log('\n🚀 Vous pouvez maintenant tester l\'API avec ces comptes :');
    console.log('   - admin@ynov.com / password123 (ADMIN)');
    console.log('   - theo@ynov.com / password123 (USER)');
    console.log('   - antoine@ynov.com / password123 (USER)');
    console.log('   - lucas@ynov.com / password123 (USER)');
    console.log('   - julien@ynov.com / password123 (USER)');
    console.log('   - remi@ynov.com / password123 (USER)');
    console.log('   - louis@ynov.com / password123 (USER)');
    console.log('   - inasse@ynov.com / password123 (USER)');
    console.log('   - mathis@ynov.com / password123 (USER)');

    return true;
  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
    throw error;
  }
};

// Exécuter le seeding seulement si appelé directement (pas quand importé comme module)
// Détection plus robuste compatible Windows/Linux
const isRunningDirectly = () => {
  try {
    // Convertir import.meta.url en chemin de fichier
    const currentFilePath = import.meta.url.replace('file:///', '').replace(/\//g, '\\');
    // Normaliser process.argv[1] (chemin du script exécuté)
    const executedFilePath = process.argv[1].replace(/\//g, '\\');

    return currentFilePath.toLowerCase().endsWith(executedFilePath.toLowerCase());
  } catch {
    // Si la détection échoue, on assume qu'on est en import
    return false;
  }
};

if (isRunningDirectly()) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;
