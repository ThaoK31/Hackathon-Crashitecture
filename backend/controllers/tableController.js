import { Table, Reservation, Game } from '../models/index.js';
import { Op } from 'sequelize';
import { RESERVATION_STATUS, GAME_STATUS } from '../utils/constants.js';
import { invalidateCache } from '../middleware/cache.js';

// Récupérer toutes les tables
export const getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.findAll({
      order: [['created_at', 'DESC']]
    });


    const tablesWithGameStatus = await Promise.all(
      tables.map(async (table) => {
        const ongoingGame = await Game.findOne({
          where: {
            table_id: table.id,
            status: GAME_STATUS.ONGOING
          }
        });

        return {
          ...table.toJSON(),
          has_ongoing_game: !!ongoingGame
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { tables: tablesWithGameStatus }
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer une table par ID
export const getTableById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Babyfoot non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { table }
    });
  } catch (error) {
    next(error);
  }
};

// Créer une table (admin only)
export const createTable = async (req, res, next) => {
  try {
    const { name, location, condition } = req.body;

    const table = await Table.create({
      name,
      location,
      condition
    });

    // Invalider le cache des tables
    await invalidateCache(['tables:*']);

    res.status(201).json({
      success: true,
      message: 'Babyfoot créé avec succès',
      data: { table }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une table (admin only)
export const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, condition, is_available } = req.body;

    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Babyfoot non trouvé'
      });
    }

    if (name !== undefined) table.name = name;
    if (location !== undefined) table.location = location;
    if (condition !== undefined) table.condition = condition;
    if (is_available !== undefined) table.is_available = is_available;

    await table.save();

    // Invalider le cache des tables
    await invalidateCache(['tables:*']);

    res.status(200).json({
      success: true,
      message: 'Babyfoot mis à jour',
      data: { table }
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer une table (admin only)
export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Babyfoot non trouvé'
      });
    }

    await table.destroy();

    // Invalider le cache des tables
    await invalidateCache(['tables:*']);

    res.status(200).json({
      success: true,
      message: 'Babyfoot supprimé'
    });
  } catch (error) {
    next(error);
  }
};

// Vérifier la disponibilité d'une table
export const getTableAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.query;

    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Babyfoot non trouvé'
      });
    }

    // Vérifier si la table n'est pas disponible
    if (!table.is_available) {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          reason: 'Table marquée comme non disponible'
        }
      });
    }

    // Si des créneaux sont fournis, vérifier les conflits
    if (start_time && end_time) {
      const conflictingReservations = await Reservation.findAll({
        where: {
          table_id: id,
          status: RESERVATION_STATUS.ACTIVE,
          [Op.or]: [
            {
              start_time: {
                [Op.between]: [new Date(start_time), new Date(end_time)]
              }
            },
            {
              end_time: {
                [Op.between]: [new Date(start_time), new Date(end_time)]
              }
            },
            {
              [Op.and]: [
                { start_time: { [Op.lte]: new Date(start_time) } },
                { end_time: { [Op.gte]: new Date(end_time) } }
              ]
            }
          ]
        }
      });

      if (conflictingReservations.length > 0) {
        return res.status(200).json({
          success: true,
          data: {
            available: false,
            reason: 'Créneau déjà réservé',
            conflicting_reservations: conflictingReservations
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        available: true
      }
    });
  } catch (error) {
    next(error);
  }
};

