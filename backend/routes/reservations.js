import express from 'express';
import {
    getAllReservations,
    getMyReservations,
    createReservation,
    cancelReservation
} from '../controllers/reservationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { createReservationValidator, uuidValidator } from '../middleware/validators.js';

const router = express.Router();

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Liste toutes les réservations (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations
 *       403:
 *         description: Accès refusé
 */
router.get('/', authenticate, requireAdmin, getAllReservations);

/**
 * @swagger
 * /api/reservations/my:
 *   get:
 *     tags: [Reservations]
 *     summary: Récupérer mes réservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mes réservations
 */
router.get('/my', authenticate, getMyReservations);

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Créer une réservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - table_id
 *               - start_time
 *               - end_time
 *             properties:
 *               table_id:
 *                 type: string
 *                 format: uuid
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Réservation créée
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Créneau déjà réservé
 */
router.post('/', authenticate, createReservationValidator, createReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Annuler une réservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Réservation annulée
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 */
router.delete('/:id', authenticate, uuidValidator, cancelReservation);

export default router;

