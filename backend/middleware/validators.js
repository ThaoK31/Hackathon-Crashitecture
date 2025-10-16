import { body, param, validationResult } from 'express-validator';
import { USER_ROLES, TEAM_COLORS, PLAYER_ROLES } from '../utils/constants.js';

// Middleware pour vérifier les résultats de validation
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array()
    });
  }
  next();
};

// Validateurs pour l'authentification
export const registerValidator = [
  body('email').isEmail().withMessage('Email invalide'),
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  validate
];

export const loginValidator = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  validate
];

// Validateurs pour les utilisateurs
export const updateUserValidator = [
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères'),
  validate
];

export const changeRoleValidator = [
  body('role')
    .isIn([USER_ROLES.USER, USER_ROLES.ADMIN])
    .withMessage('Rôle invalide'),
  validate
];

// Validateurs pour les tables
export const createTableValidator = [
  body('name')
    .notEmpty()
    .withMessage('Nom requis')
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom doit contenir entre 1 et 100 caractères'),
  body('location').optional().isString(),
  body('condition').optional().isString(),
  validate
];

export const updateTableValidator = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom doit contenir entre 1 et 100 caractères'),
  body('location').optional().isString(),
  body('condition').optional().isString(),
  body('is_available').optional().isBoolean(),
  validate
];

// Validateurs pour les réservations
export const createReservationValidator = [
  body('table_id').isUUID().withMessage('ID de table invalide'),
  body('start_time').isISO8601().withMessage('Date de début invalide'),
  body('end_time').isISO8601().withMessage('Date de fin invalide'),
  validate
];

// Validateurs pour les jeux
export const createGameValidator = [
  body('table_id').isUUID().withMessage('ID de table invalide'),
  body('players').isArray({ min: 2, max: 4 }).withMessage('2 à 4 joueurs requis'),
  body('players.*.user_id').isUUID().withMessage('ID utilisateur invalide'),
  body('players.*.team_color')
    .isIn([TEAM_COLORS.RED, TEAM_COLORS.BLUE])
    .withMessage('Couleur d\'équipe invalide'),
  body('players.*.role')
    .isIn([PLAYER_ROLES.ATTACK, PLAYER_ROLES.DEFENSE])
    .withMessage('Rôle invalide'),
  validate
];

export const updateScoreValidator = [
  body('team_red_score')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Score rouge invalide'),
  body('team_blue_score')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Score bleu invalide'),
  validate
];

// Validateur UUID générique
export const uuidValidator = [
  param('id').isUUID().withMessage('ID invalide'),
  validate
];

