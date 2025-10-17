import { Game, GamePlayer, Table, User, Reservation } from '../models/index.js';
import { GAME_STATUS, RESERVATION_STATUS } from '../utils/constants.js';
import { invalidateCache } from '../middleware/cache.js';
import socketService from '../services/socketService.js';
import { Op } from 'sequelize';

// Récupérer toutes les parties en cours
export const getLiveGames = async (req, res, next) => {
  try {
    const games = await Game.findAll({
      where: { status: GAME_STATUS.ONGOING },
      include: [
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'name', 'location']
        },
        {
          model: GamePlayer,
          as: 'players',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ],
      order: [['started_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { games }
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer une partie par ID
export const getGameById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const game = await Game.findByPk(id, {
      include: [
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'name', 'location']
        },
        {
          model: GamePlayer,
          as: 'players',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Partie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: { game }
    });
  } catch (error) {
    next(error);
  }
};

// Créer une nouvelle partie
export const createGame = async (req, res, next) => {
  try {
    const { table_id, players } = req.body;
    const userId = req.user.id; // ID de l'utilisateur qui crée la partie

    // Vérifier que la table existe
    const table = await Table.findByPk(table_id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Babyfoot non trouvé'
      });
    }

    // Vérifier que la table est disponible
    if (!table.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Ce babyfoot n\'est pas disponible'
      });
    }

    // Vérifier qu'il n'y a pas déjà une partie en cours sur cette table
    const ongoingGame = await Game.findOne({
      where: {
        table_id,
        status: GAME_STATUS.ONGOING
      }
    });

    if (ongoingGame) {
      return res.status(409).json({
        success: false,
        message: 'Une partie est déjà en cours sur ce babyfoot'
      });
    }

    // Vérifier que l'utilisateur a une réservation active sur cette table
    const activeReservation = await Reservation.findOne({
      where: {
        user_id: userId,
        table_id: table_id,
        status: RESERVATION_STATUS.ACTIVE,
        start_time: {
          [Op.lte]: new Date() // La réservation a commencé
        },
        end_time: {
          [Op.gte]: new Date() // La réservation n'est pas encore terminée
        }
      }
    });

    if (!activeReservation) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez avoir une réservation active sur cette table pour créer une partie'
      });
    }

    // Créer la partie
    const game = await Game.create({ table_id });

    // Créer les joueurs
    const gamePlayers = await Promise.all(
      players.map(player =>
        GamePlayer.create({
          game_id: game.id,
          user_id: player.user_id,
          team_color: player.team_color,
          role: player.role
        })
      )
    );

    // Récupérer la partie avec toutes les relations
    const createdGame = await Game.findByPk(game.id, {
      include: [
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'name', 'location']
        },
        {
          model: GamePlayer,
          as: 'players',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });

    // Invalider le cache des parties
    await invalidateCache(['games:*']);

    // WEBSOCKET: Émettre le démarrage de la partie
    socketService.emitGameStarted(createdGame, table, createdGame.players);

    // WEBSOCKET: Mettre à jour le statut de la table
    socketService.emitTableStatusChanged(table_id, 'IN_USE', {
      gameId: createdGame.id,
      tableName: table.name
    });

    res.status(201).json({
      success: true,
      message: 'Partie créée avec succès',
      data: { game: createdGame }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le score d'une partie
export const updateGameScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { team_red_score, team_blue_score } = req.body;

    const game = await Game.findByPk(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Partie non trouvée'
      });
    }

    // Vérifier que la partie est en cours
    if (game.status !== GAME_STATUS.ONGOING) {
      return res.status(400).json({
        success: false,
        message: 'Cette partie est terminée'
      });
    }

    // Mettre à jour les scores
    if (team_red_score !== undefined) {
      game.team_red_score = team_red_score;
    }
    if (team_blue_score !== undefined) {
      game.team_blue_score = team_blue_score;
    }

    await game.save();

    // Récupérer la partie mise à jour avec les relations
    const updatedGame = await Game.findByPk(id, {
      include: [
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'name', 'location']
        },
        {
          model: GamePlayer,
          as: 'players',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });

    // Invalider le cache des parties
    await invalidateCache(['games:*']);

    // WEBSOCKET: Émettre la mise à jour du score en temps réel
    socketService.emitScoreUpdate(id, {
      team_red_score: updatedGame.team_red_score,
      team_blue_score: updatedGame.team_blue_score
    });

    res.status(200).json({
      success: true,
      message: 'Score mis à jour',
      data: { game: updatedGame }
    });
  } catch (error) {
    next(error);
  }
};

// Terminer une partie
export const endGame = async (req, res, next) => {
  try {
    const { id } = req.params;

    const game = await Game.findByPk(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Partie non trouvée'
      });
    }

    // Vérifier que la partie est en cours
    if (game.status !== GAME_STATUS.ONGOING) {
      return res.status(400).json({
        success: false,
        message: 'Cette partie est déjà terminée'
      });
    }

    game.status = GAME_STATUS.FINISHED;
    game.ended_at = new Date();
    await game.save();

    // Récupérer la partie terminée avec les relations
    const finishedGame = await Game.findByPk(id, {
      include: [
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'name', 'location']
        },
        {
          model: GamePlayer,
          as: 'players',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });

    // Déterminer le gagnant
    const winner = finishedGame.team_red_score > finishedGame.team_blue_score ? 'RED' : 'BLUE';

    // Invalider le cache des parties
    await invalidateCache(['games:*']);

    // WEBSOCKET: Émettre la fin de la partie
    socketService.emitGameEnded(finishedGame, winner, finishedGame.players);

    // WEBSOCKET: Mettre à jour le statut de la table (disponible)
    socketService.emitTableStatusChanged(finishedGame.table_id, 'AVAILABLE', {
      tableName: finishedGame.table.name
    });

    // WEBSOCKET: Mettre à jour le leaderboard après la partie
    // On le fait de manière asynchrone pour ne pas ralentir la réponse
    updateLeaderboardAfterGame().catch(err =>
      console.error('Erreur mise à jour leaderboard:', err)
    );

    res.status(200).json({
      success: true,
      message: 'Partie terminée',
      data: {
        game: finishedGame,
        winner
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer l'historique des parties d'un utilisateur
export const getGameHistory = async (req, res, next) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur authentifié

    // Trouver toutes les parties où l'utilisateur a participé
    const gamePlayers = await GamePlayer.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Game,
          as: 'game',
          where: { status: GAME_STATUS.FINISHED },
          include: [
            {
              model: Table,
              as: 'table',
              attributes: ['id', 'name', 'location']
            },
            {
              model: GamePlayer,
              as: 'players',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username']
                }
              ]
            }
          ]
        }
      ],
      order: [[{ model: Game, as: 'game' }, 'ended_at', 'DESC']]
    });

    // Extraire les parties et ajouter des infos sur le résultat pour l'utilisateur
    const games = gamePlayers.map(gp => {
      const game = gp.game;
      const userTeam = gp.team_color;
      const userScore = userTeam === 'RED' ? game.team_red_score : game.team_blue_score;
      const opponentScore = userTeam === 'RED' ? game.team_blue_score : game.team_red_score;
      const won = userScore > opponentScore;

      return {
        ...game.toJSON(),
        userStats: {
          team_color: gp.team_color,
          role: gp.role,
          goals: gp.goals,
          assists: gp.assists,
          saves: gp.saves,
          won: won,
          score: `${userScore}-${opponentScore}`
        }
      };
    });

    res.status(200).json({
      success: true,
      data: { 
        games,
        total: games.length
      }
    });
  } catch (error) {
    next(error);
  }
};



/**
 * Helper: Mettre à jour et broadcaster le leaderboard après une partie
 */
async function updateLeaderboardAfterGame() {
  try {
    // Récupérer tous les utilisateurs
    const users = await User.findAll({
      attributes: ["id", "username"]
    });

    // Calculer les stats pour chaque utilisateur
    const leaderboardPromises = users.map(async (user) => {
      const playerGames = await GamePlayer.findAll({
        where: { user_id: user.id },
        include: [
          {
            model: Game,
            as: "game",
            where: { status: GAME_STATUS.FINISHED },
            attributes: ["id", "team_red_score", "team_blue_score"]
          }
        ]
      });

      let wins = 0;
      let losses = 0;
      let totalGoals = 0;

      playerGames.forEach(participation => {
        const game = participation.game;
        const playerTeam = participation.team_color;
        const opponentTeam = playerTeam === "RED" ? "BLUE" : "RED";

        const playerScore = playerTeam === "RED" ? game.team_red_score : game.team_blue_score;
        const opponentScore = opponentTeam === "RED" ? game.team_red_score : game.team_blue_score;

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

    // Filtrer les joueurs actifs et trier
    leaderboard = leaderboard
      .filter(player => player.stats.totalGames > 0)
      .sort((a, b) => {
        if (b.stats.winLossRatio !== a.stats.winLossRatio) {
          return b.stats.winLossRatio - a.stats.winLossRatio;
        }
        return b.stats.wins - a.stats.wins;
      });

    // WEBSOCKET: Broadcaster le nouveau leaderboard
    socketService.emitLeaderboardUpdate({
      leaderboard,
      totalActivePlayers: leaderboard.length
    });

    console.log("Leaderboard mis à jour et broadcasté via WebSocket");
  } catch (error) {
    console.error("Erreur mise à jour leaderboard:", error);
    throw error;
  }
}
