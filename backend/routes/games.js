import express from 'express';
import {
    getLiveGames,
    getGameById,
    createGame,
    updateGameScore,
    endGame,
    getGameHistory
} from '../controllers/gameController.js';
import { authenticate } from '../middleware/auth.js';
import {
    createGameValidator,
    updateScoreValidator,
    uuidValidator
} from '../middleware/validators.js';
import {
    cacheLiveGames,
    cacheGame
} from '../middleware/cache.js';

const router = express.Router();

/**
 * @swagger
 * /api/games/history:
 *   get:
 *     tags: [Games]
 *     summary: Récupérer l'historique des parties de l'utilisateur authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des parties terminées de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     games:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 */
router.get('/history', authenticate, getGameHistory);

/**
 * @swagger
 * /api/games/live:
 *   get:
 *     tags: [Games]
 *     summary: Récupérer toutes les parties en cours
 *     responses:
 *       200:
 *         description: Liste des parties en cours
 */
router.get('/live', cacheLiveGames, getLiveGames);

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     tags: [Games]
 *     summary: Récupérer une partie par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de la partie
 *       404:
 *         description: Partie non trouvée
 */
router.get('/:id', uuidValidator, cacheGame, getGameById);

/**
 * @swagger
 * /api/games:
 *   post:
 *     tags: [Games]
 *     summary: Créer une nouvelle partie
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
 *               - players
 *             properties:
 *               table_id:
 *                 type: string
 *                 format: uuid
 *               players:
 *                 type: array
 *                 minItems: 2
 *                 maxItems: 4
 *                 items:
 *                   type: object
 *                   required:
 *                     - user_id
 *                     - team_color
 *                     - role
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     team_color:
 *                       type: string
 *                       enum: [RED, BLUE]
 *                     role:
 *                       type: string
 *                       enum: [ATTACK, DEFENSE]
 *     responses:
 *       201:
 *         description: Partie créée
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Une partie est déjà en cours sur ce babyfoot
 */
router.post('/', authenticate, createGameValidator, createGame);

/**
 * @swagger
 * /api/games/{id}/score:
 *   patch:
 *     tags: [Games]
 *     summary: Mettre à jour le score d'une partie
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
 *               team_red_score:
 *                 type: integer
 *                 minimum: 0
 *               team_blue_score:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Score mis à jour
 *       400:
 *         description: Partie terminée
 *       404:
 *         description: Partie non trouvée
 */
router.patch(
  '/:id/score',
  authenticate,
  uuidValidator,
  updateScoreValidator,
  updateGameScore
);

/**
 * @swagger
 * /api/games/{id}/end:
 *   post:
 *     tags: [Games]
 *     summary: Terminer une partie
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
 *         description: Partie terminée
 *       400:
 *         description: Partie déjà terminée
 *       404:
 *         description: Partie non trouvée
 */
router.post('/:id/end', authenticate, uuidValidator, endGame);

export default router;

