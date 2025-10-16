import { Game, GamePlayer, Table, User } from '../models/index.js';
import { GAME_STATUS, TEAM_COLORS, PLAYER_ROLES } from '../utils/constants.js';
import { Op, fn, col, literal } from 'sequelize';

/**
 * Calcule les statistiques d'un joueur spécifique
 * @route GET /api/stats/players/:userId
 */
export const getPlayerStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer toutes les participations du joueur dans des parties terminées
    const playerGames = await GamePlayer.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Game,
          as: 'game',
          where: { status: GAME_STATUS.FINISHED },
          attributes: ['id', 'team_red_score', 'team_blue_score', 'started_at', 'ended_at']
        }
      ]
    });

    // Initialiser les statistiques
    let totalGames = playerGames.length;
    let wins = 0;
    let losses = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let totalSaves = 0;
    let roleCount = { ATTACK: 0, DEFENSE: 0 };
    let teamColorCount = { RED: 0, BLUE: 0 };

    // Calculer les statistiques
    playerGames.forEach(participation => {
      const game = participation.game;
      const playerTeam = participation.team_color;
      const opponentTeam = playerTeam === TEAM_COLORS.RED ? TEAM_COLORS.BLUE : TEAM_COLORS.RED;

      const playerScore = playerTeam === TEAM_COLORS.RED ? game.team_red_score : game.team_blue_score;
      const opponentScore = opponentTeam === TEAM_COLORS.RED ? game.team_red_score : game.team_blue_score;

      // Compter victoires/défaites
      if (playerScore > opponentScore) {
        wins++;
      } else if (playerScore < opponentScore) {
        losses++;
      }
      // Note: pas de gestion des égalités (draws) car non spécifié

      // Compter les buts, passes et sauvegardes
      totalGoals += participation.goals || 0;
      totalAssists += participation.assists || 0;
      totalSaves += participation.saves || 0;

      // Compter les rôles et couleurs d'équipe
      roleCount[participation.role]++;
      teamColorCount[participation.team_color]++;
    });

    // Calculer le ratio victoires/défaites
    const winLossRatio = losses > 0 ? (wins / losses).toFixed(2) : wins.toFixed(2);

    // Déterminer la position et la couleur préférées
    const preferredRole = roleCount.ATTACK >= roleCount.DEFENSE ? PLAYER_ROLES.ATTACK : PLAYER_ROLES.DEFENSE;
    const preferredTeamColor = teamColorCount.RED >= teamColorCount.BLUE ? TEAM_COLORS.RED : TEAM_COLORS.BLUE;

    // Calculer le taux de victoire
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : '0.00';

    res.status(200).json({
      success: true,
      data: {
        player: {
          id: user.id,
          username: user.username
        },
        statistics: {
          totalGames,
          wins,
          losses,
          winLossRatio: parseFloat(winLossRatio),
          winRate: `${winRate}%`,
          goals: totalGoals,
          assists: totalAssists,
          saves: totalSaves,
          preferences: {
            role: preferredRole,
            roleDistribution: roleCount,
            teamColor: preferredTeamColor,
            teamColorDistribution: teamColorCount
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère le classement général des joueurs
 * @route GET /api/stats/leaderboard
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Récupérer tous les utilisateurs
    const users = await User.findAll({
      attributes: ['id', 'username']
    });

    // Calculer les stats pour chaque utilisateur
    const leaderboardPromises = users.map(async (user) => {
      const playerGames = await GamePlayer.findAll({
        where: { user_id: user.id },
        include: [
          {
            model: Game,
            as: 'game',
            where: { status: GAME_STATUS.FINISHED },
            attributes: ['id', 'team_red_score', 'team_blue_score']
          }
        ]
      });

      let wins = 0;
      let losses = 0;
      let totalGoals = 0;

      playerGames.forEach(participation => {
        const game = participation.game;
        const playerTeam = participation.team_color;
        const opponentTeam = playerTeam === TEAM_COLORS.RED ? TEAM_COLORS.BLUE : TEAM_COLORS.RED;

        const playerScore = playerTeam === TEAM_COLORS.RED ? game.team_red_score : game.team_blue_score;
        const opponentScore = opponentTeam === TEAM_COLORS.RED ? game.team_red_score : game.team_blue_score;

        if (playerScore > opponentScore) {
          wins++;
        } else if (playerScore < opponentScore) {
          losses++;
        }

        totalGoals += participation.goals || 0;
      });

      const totalGames = playerGames.length;
      const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : 0;
      const winLossRatio = losses > 0 ? parseFloat((wins / losses).toFixed(2)) : parseFloat(wins.toFixed(2));

      return {
        player: {
          id: user.id,
          username: user.username
        },
        stats: {
          totalGames,
          wins,
          losses,
          winLossRatio,
          winRate: parseFloat(winRate),
          goals: totalGoals
        }
      };
    });

    let leaderboard = await Promise.all(leaderboardPromises);

    // Filtrer les joueurs qui ont joué au moins une partie
    leaderboard = leaderboard.filter(player => player.stats.totalGames > 0);

    // Trier par ratio victoires/défaites (décroissant), puis par victoires
    leaderboard.sort((a, b) => {
      if (b.stats.winLossRatio !== a.stats.winLossRatio) {
        return b.stats.winLossRatio - a.stats.winLossRatio;
      }
      return b.stats.wins - a.stats.wins;
    });

    // Limiter au top N
    const topPlayers = leaderboard.slice(0, limit);

    res.status(200).json({
      success: true,
      data: {
        leaderboard: topPlayers,
        totalActivePlayers: leaderboard.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les statistiques des tables de babyfoot
 * @route GET /api/stats/tables
 */
export const getTableStats = async (req, res, next) => {
  try {
    // Récupérer toutes les tables
    const tables = await Table.findAll({
      attributes: ['id', 'name', 'location', 'condition', 'is_available']
    });

    // Récupérer le nombre total de parties terminées
    const totalGamesCount = await Game.count({
      where: { status: GAME_STATUS.FINISHED }
    });

    // Calculer les stats pour chaque table
    const tableStatsPromises = tables.map(async (table) => {
      // Nombre de parties sur cette table
      const gamesCount = await Game.count({
        where: {
          table_id: table.id,
          status: GAME_STATUS.FINISHED
        }
      });

      // Calculer le taux d'utilisation (pourcentage des parties sur cette table)
      const utilizationRate = totalGamesCount > 0
        ? ((gamesCount / totalGamesCount) * 100).toFixed(2)
        : '0.00';

      return {
        table: {
          id: table.id,
          name: table.name,
          location: table.location,
          condition: table.condition,
          isAvailable: table.is_available
        },
        statistics: {
          gamesPlayed: gamesCount,
          utilizationRate: `${utilizationRate}%`
        }
      };
    });

    let tableStats = await Promise.all(tableStatsPromises);

    // Trier par nombre de parties jouées (décroissant)
    tableStats.sort((a, b) => b.statistics.gamesPlayed - a.statistics.gamesPlayed);

    // Identifier la table la plus populaire
    const mostPopularTable = tableStats.length > 0 ? tableStats[0] : null;

    res.status(200).json({
      success: true,
      data: {
        tables: tableStats,
        mostPopular: mostPopularTable,
        totalGames: totalGamesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les statistiques globales de l'application
 * @route GET /api/stats/global
 */
export const getGlobalStats = async (req, res, next) => {
  try {
    // Nombre total de parties terminées
    const totalGames = await Game.count({
      where: { status: GAME_STATUS.FINISHED }
    });

    // Nombre de parties en cours
    const ongoingGames = await Game.count({
      where: { status: GAME_STATUS.ONGOING }
    });

    // Nombre total de joueurs ayant participé à au moins une partie
    const activePlayersCount = await GamePlayer.count({
      distinct: true,
      col: 'user_id',
      include: [{
        model: Game,
        as: 'game',
        where: { status: GAME_STATUS.FINISHED },
        attributes: []
      }]
    });

    // Récupérer toutes les parties terminées avec leur durée
    const finishedGames = await Game.findAll({
      where: {
        status: GAME_STATUS.FINISHED,
        ended_at: { [Op.ne]: null }
      },
      attributes: ['id', 'started_at', 'ended_at'],
      raw: true
    });

    // Calculer les durées
    let totalDuration = 0;
    let longestGame = null;
    let longestDuration = 0;

    finishedGames.forEach(game => {
      const startTime = new Date(game.started_at).getTime();
      const endTime = new Date(game.ended_at).getTime();
      const duration = (endTime - startTime) / 1000 / 60; // durée en minutes

      totalDuration += duration;

      if (duration > longestDuration) {
        longestDuration = duration;
        longestGame = {
          gameId: game.id,
          duration: Math.round(duration), // en minutes
          startedAt: game.started_at,
          endedAt: game.ended_at
        };
      }
    });

    // Calculer la durée moyenne
    const averageDuration = finishedGames.length > 0
      ? Math.round(totalDuration / finishedGames.length)
      : 0;

    // Nombre total de buts marqués
    const totalGoals = await GamePlayer.sum('goals') || 0;

    // Score le plus élevé dans une partie
    const highestScoringGame = await Game.findOne({
      where: { status: GAME_STATUS.FINISHED },
      attributes: [
        'id',
        'team_red_score',
        'team_blue_score',
        [literal('team_red_score + team_blue_score'), 'total_score']
      ],
      order: [[literal('team_red_score + team_blue_score'), 'DESC']],
      limit: 1
    });

    res.status(200).json({
      success: true,
      data: {
        games: {
          total: totalGames,
          ongoing: ongoingGames,
          finished: totalGames
        },
        players: {
          activeCount: activePlayersCount
        },
        duration: {
          average: `${averageDuration} minutes`,
          longest: longestGame
        },
        scoring: {
          totalGoals,
          highestScoringGame: highestScoringGame ? {
            gameId: highestScoringGame.id,
            redScore: highestScoringGame.team_red_score,
            blueScore: highestScoringGame.team_blue_score,
            totalScore: highestScoringGame.team_red_score + highestScoringGame.team_blue_score
          } : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
