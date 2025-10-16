import { Game, GamePlayer, Table, User } from '../models/index.js';
import { GAME_STATUS } from '../utils/constants.js';

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

    res.status(200).json({
      success: true,
      message: 'Partie terminée',
      data: { game: finishedGame }
    });
  } catch (error) {
    next(error);
  }
};

