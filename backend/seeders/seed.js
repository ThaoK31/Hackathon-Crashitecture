import bcrypt from 'bcryptjs';
import { sequelize, User, Table, Reservation, Game, GamePlayer } from '../models/index.js';
import { USER_ROLES, TABLE_CONDITIONS, RESERVATION_STATUS, GAME_STATUS, TEAM_COLORS, PLAYER_ROLES } from '../utils/constants.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Démarrage du seeding...');

    // Synchroniser la DB (créer/mettre à jour les tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée');

    // Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...');
    await GamePlayer.destroy({ where: {} });
    await Game.destroy({ where: {} });
    await Reservation.destroy({ where: {} });
    await Table.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log('✅ Données nettoyées');

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
    console.log('\n🏓 Création des babyfoots...');

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

    // ===== 5. CRÉER DES PARTIES TERMINÉES =====
    console.log('\n🏆 Création des parties terminées...');

    const game3 = await Game.create({
      table_id: tables[0].id,
      team_red_score: 10,
      team_blue_score: 8,
      status: GAME_STATUS.FINISHED,
      started_at: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Il y a 2h
      ended_at: new Date(now.getTime() - 1.5 * 60 * 60 * 1000) // Il y a 1h30
    });

    await GamePlayer.bulkCreate([
      {
        game_id: game3.id,
        user_id: users[1].id, // theo
        team_color: TEAM_COLORS.RED,
        role: PLAYER_ROLES.ATTACK,
        goals: 6,
        assists: 3,
        saves: 0
      },
      {
        game_id: game3.id,
        user_id: users[2].id, // antoine
        team_color: TEAM_COLORS.RED,
        role: PLAYER_ROLES.DEFENSE,
        goals: 4,
        assists: 5,
        saves: 8
      },
      {
        game_id: game3.id,
        user_id: users[5].id, // remi
        team_color: TEAM_COLORS.BLUE,
        role: PLAYER_ROLES.ATTACK,
        goals: 5,
        assists: 2,
        saves: 0
      },
      {
        game_id: game3.id,
        user_id: users[6].id, // louis
        team_color: TEAM_COLORS.BLUE,
        role: PLAYER_ROLES.DEFENSE,
        goals: 3,
        assists: 1,
        saves: 7
      }
    ]);

    const game4 = await Game.create({
      table_id: tables[1].id,
      team_red_score: 10,
      team_blue_score: 6,
      status: GAME_STATUS.FINISHED,
      started_at: new Date(now.getTime() - 4 * 60 * 60 * 1000), // Il y a 4h
      ended_at: new Date(now.getTime() - 3 * 60 * 60 * 1000) // Il y a 3h
    });

    await GamePlayer.bulkCreate([
      {
        game_id: game4.id,
        user_id: users[3].id, // lucas
        team_color: TEAM_COLORS.RED,
        role: PLAYER_ROLES.ATTACK,
        goals: 7,
        assists: 2,
        saves: 0
      },
      {
        game_id: game4.id,
        user_id: users[4].id, // julien
        team_color: TEAM_COLORS.RED,
        role: PLAYER_ROLES.DEFENSE,
        goals: 3,
        assists: 4,
        saves: 6
      },
      {
        game_id: game4.id,
        user_id: users[7].id, // inasse
        team_color: TEAM_COLORS.BLUE,
        role: PLAYER_ROLES.ATTACK,
        goals: 4,
        assists: 1,
        saves: 0
      },
      {
        game_id: game4.id,
        user_id: users[8].id, // mathis
        team_color: TEAM_COLORS.BLUE,
        role: PLAYER_ROLES.DEFENSE,
        goals: 2,
        assists: 2,
        saves: 9
      }
    ]);

    console.log(`✅ 2 parties terminées créées`);

    // ===== RÉSUMÉ =====
    console.log('\n📊 Résumé du seeding :');
    console.log('─────────────────────────────────────');
    console.log(`👥 Utilisateurs : ${users.length}`);
    console.log(`   - Admin : admin@ynov.com / password123`);
    console.log(`   - Users : theo, antoine, lucas, julien, remi, louis, inasse, mathis`);
    console.log(`   - Tous les mots de passe : password123`);
    console.log(`\n🏓 Babyfoots : ${tables.length}`);
    console.log(`   - Disponibles : ${tables.filter(t => t.is_available).length}`);
    console.log(`   - En maintenance : ${tables.filter(t => !t.is_available).length}`);
    console.log(`\n📅 Réservations : ${reservations.length}`);
    console.log(`   - Actives : ${reservations.filter(r => r.status === RESERVATION_STATUS.ACTIVE).length}`);
    console.log(`   - Complétées : ${reservations.filter(r => r.status === RESERVATION_STATUS.COMPLETED).length}`);
    console.log(`\n🎮 Parties :`);
    console.log(`   - En cours : 2 parties`);
    console.log(`   - Terminées : 2 parties`);
    console.log(`   - Total joueurs : 16`);
    console.log('─────────────────────────────────────');
    console.log('\n✅ Seeding terminé avec succès !');
    console.log('\n🚀 Vous pouvez maintenant tester l\'API avec ces comptes :');
    console.log('   - admin@ynov.com / password123 (ADMIN)');
    console.log('   - theo@ynov.com / password123 (USER)');
    console.log('   - antoine@ynov.com / password123 (USER)');
    console.log('   - etc...');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
    process.exit(1);
  }
};

// Exécuter le seeding
seedDatabase();

