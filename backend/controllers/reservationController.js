import { Reservation, Table, User } from '../models/index.js';
import { Op } from 'sequelize';
import { RESERVATION_STATUS } from '../utils/constants.js';

// Récupérer toutes les réservations
export const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['start_time', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: { reservations }
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer les réservations de l'utilisateur connecté
export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['start_time', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: { reservations }
    });
  } catch (error) {
    next(error);
  }
};

// Créer une réservation
export const createReservation = async (req, res, next) => {
  try {
    const { table_id, start_time, end_time } = req.body;
    const user_id = req.user.id;

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

    // Vérifier que les dates sont cohérentes
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être après la date de début'
      });
    }

    // Vérifier qu'il n'y a pas de conflit avec d'autres réservations
    const conflictingReservations = await Reservation.findAll({
      where: {
        table_id,
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
      return res.status(409).json({
        success: false,
        message: 'Ce créneau est déjà réservé'
      });
    }

    // Créer la réservation
    const reservation = await Reservation.create({
      user_id,
      table_id,
      start_time,
      end_time
    });

    // Récupérer la réservation avec les relations
    const createdReservation = await Reservation.findByPk(reservation.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: { reservation: createdReservation }
    });
  } catch (error) {
    next(error);
  }
};

// Annuler une réservation
export const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier que l'utilisateur peut annuler cette réservation
    if (reservation.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas annuler cette réservation'
      });
    }

    // Vérifier que la réservation n'est pas déjà annulée ou terminée
    if (reservation.status !== RESERVATION_STATUS.ACTIVE) {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation ne peut pas être annulée'
      });
    }

    reservation.status = RESERVATION_STATUS.CANCELLED;
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Réservation annulée'
    });
  } catch (error) {
    next(error);
  }
};

