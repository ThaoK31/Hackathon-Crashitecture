import express from 'express';
import {
  getPlayerStats,
  getLeaderboard,
  getTableStats,
  getGlobalStats
} from '../controllers/statsController.js';
import { authenticate } from '../middleware/auth.js';
import { userIdValidator } from '../middleware/validators.js';

const router = express.Router();

/**
 * @swagger
 * /api/stats/players/{userId}:
 *   get:
 *     tags: [Statistics]
 *     summary: Récupérer les statistiques d'un joueur
 *     description: Retourne les statistiques complètes d'un joueur incluant le nombre de parties, victoires, défaites, ratio, buts, et préférences de jeu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du joueur
 *     responses:
 *       200:
 *         description: Statistiques du joueur récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     player:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         username:
 *                           type: string
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalGames:
 *                           type: integer
 *                           description: Nombre total de parties jouées
 *                         wins:
 *                           type: integer
 *                           description: Nombre de victoires
 *                         losses:
 *                           type: integer
 *                           description: Nombre de défaites
 *                         winLossRatio:
 *                           type: number
 *                           format: float
 *                           description: Ratio victoires/défaites
 *                         winRate:
 *                           type: string
 *                           description: Taux de victoire en pourcentage
 *                         goals:
 *                           type: integer
 *                           description: Nombre total de buts marqués
 *                         assists:
 *                           type: integer
 *                           description: Nombre total de passes décisives
 *                         saves:
 *                           type: integer
 *                           description: Nombre total de sauvegardes
 *                         preferences:
 *                           type: object
 *                           properties:
 *                             role:
 *                               type: string
 *                               enum: [ATTACK, DEFENSE]
 *                               description: Position préférée
 *                             roleDistribution:
 *                               type: object
 *                               properties:
 *                                 ATTACK:
 *                                   type: integer
 *                                 DEFENSE:
 *                                   type: integer
 *                             teamColor:
 *                               type: string
 *                               enum: [RED, BLUE]
 *                               description: Couleur d'équipe la plus jouée
 *                             teamColorDistribution:
 *                               type: object
 *                               properties:
 *                                 RED:
 *                                   type: integer
 *                                 BLUE:
 *                                   type: integer
 *       404:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Non authentifié
 */
router.get('/players/:userId', authenticate, userIdValidator, getPlayerStats);

/**
 * @swagger
 * /api/stats/leaderboard:
 *   get:
 *     tags: [Statistics]
 *     summary: Récupérer le classement général des joueurs
 *     description: Retourne le top des joueurs triés par ratio victoires/défaites et nombre de victoires
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre maximum de joueurs à retourner (par défaut 10)
 *     responses:
 *       200:
 *         description: Classement récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           player:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               username:
 *                                 type: string
 *                           stats:
 *                             type: object
 *                             properties:
 *                               totalGames:
 *                                 type: integer
 *                               wins:
 *                                 type: integer
 *                               losses:
 *                                 type: integer
 *                               winLossRatio:
 *                                 type: number
 *                                 format: float
 *                               winRate:
 *                                 type: number
 *                                 format: float
 *                               goals:
 *                                 type: integer
 *                     totalActivePlayers:
 *                       type: integer
 *                       description: Nombre total de joueurs actifs
 *       401:
 *         description: Non authentifié
 */
router.get('/leaderboard', authenticate, getLeaderboard);

/**
 * @swagger
 * /api/stats/tables:
 *   get:
 *     tags: [Statistics]
 *     summary: Récupérer les statistiques des tables de babyfoot
 *     description: Retourne les statistiques d'utilisation de chaque table avec le taux d'utilisation et le nombre de parties
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des tables récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tables:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           table:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               location:
 *                                 type: string
 *                               condition:
 *                                 type: string
 *                                 enum: [EXCELLENT, GOOD, WORN, NEEDS_MAINTENANCE]
 *                               isAvailable:
 *                                 type: boolean
 *                           statistics:
 *                             type: object
 *                             properties:
 *                               gamesPlayed:
 *                                 type: integer
 *                                 description: Nombre de parties jouées sur cette table
 *                               utilizationRate:
 *                                 type: string
 *                                 description: Taux d'utilisation en pourcentage
 *                     mostPopular:
 *                       type: object
 *                       description: Table la plus populaire
 *                       nullable: true
 *                     totalGames:
 *                       type: integer
 *                       description: Nombre total de parties
 *       401:
 *         description: Non authentifié
 */
router.get('/tables', authenticate, getTableStats);

/**
 * @swagger
 * /api/stats/global:
 *   get:
 *     tags: [Statistics]
 *     summary: Récupérer les statistiques globales de l'application
 *     description: Retourne les statistiques générales incluant le nombre total de parties, joueurs actifs, durée moyenne et plus longue partie
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques globales récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     games:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Nombre total de parties terminées
 *                         ongoing:
 *                           type: integer
 *                           description: Nombre de parties en cours
 *                         finished:
 *                           type: integer
 *                           description: Nombre de parties terminées
 *                     players:
 *                       type: object
 *                       properties:
 *                         activeCount:
 *                           type: integer
 *                           description: Nombre de joueurs actifs
 *                     duration:
 *                       type: object
 *                       properties:
 *                         average:
 *                           type: string
 *                           description: Durée moyenne des parties
 *                         longest:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             gameId:
 *                               type: string
 *                               format: uuid
 *                             duration:
 *                               type: integer
 *                               description: Durée en minutes
 *                             startedAt:
 *                               type: string
 *                               format: date-time
 *                             endedAt:
 *                               type: string
 *                               format: date-time
 *                     scoring:
 *                       type: object
 *                       properties:
 *                         totalGoals:
 *                           type: integer
 *                           description: Nombre total de buts marqués
 *                         highestScoringGame:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             gameId:
 *                               type: string
 *                               format: uuid
 *                             redScore:
 *                               type: integer
 *                             blueScore:
 *                               type: integer
 *                             totalScore:
 *                               type: integer
 *       401:
 *         description: Non authentifié
 */
router.get('/global', authenticate, getGlobalStats);

export default router;
