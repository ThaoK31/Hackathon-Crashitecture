import express from 'express';
import {
    getAllTables,
    getTableById,
    createTable,
    updateTable,
    deleteTable,
    getTableAvailability
} from '../controllers/tableController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
    createTableValidator,
    updateTableValidator,
    uuidValidator
} from '../middleware/validators.js';

const router = express.Router();

/**
 * @swagger
 * /api/tables:
 *   get:
 *     tags: [Tables]
 *     summary: Liste tous les babyfoots
 *     responses:
 *       200:
 *         description: Liste des babyfoots
 */
router.get('/', getAllTables);

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     tags: [Tables]
 *     summary: Récupérer un babyfoot par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails du babyfoot
 *       404:
 *         description: Babyfoot non trouvé
 */
router.get('/:id', uuidValidator, getTableById);

/**
 * @swagger
 * /api/tables/{id}/availability:
 *   get:
 *     tags: [Tables]
 *     summary: Vérifier la disponibilité d'un babyfoot
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Informations de disponibilité
 *       404:
 *         description: Babyfoot non trouvé
 */
router.get('/:id/availability', uuidValidator, getTableAvailability);

/**
 * @swagger
 * /api/tables:
 *   post:
 *     tags: [Tables]
 *     summary: Créer un babyfoot (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [EXCELLENT, GOOD, WORN, NEEDS_MAINTENANCE]
 *     responses:
 *       201:
 *         description: Babyfoot créé
 *       403:
 *         description: Accès refusé
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  createTableValidator,
  createTable
);

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     tags: [Tables]
 *     summary: Mettre à jour un babyfoot (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               condition:
 *                 type: string
 *               is_available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Babyfoot mis à jour
 *       404:
 *         description: Babyfoot non trouvé
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  uuidValidator,
  updateTableValidator,
  updateTable
);

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     tags: [Tables]
 *     summary: Supprimer un babyfoot (admin only)
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
 *         description: Babyfoot supprimé
 *       404:
 *         description: Babyfoot non trouvé
 */
router.delete('/:id', authenticate, requireAdmin, uuidValidator, deleteTable);

export default router;

