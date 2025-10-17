import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { USER_ROLES } from '../utils/constants.js';

// Vérifier le token JWT
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant ou invalide'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification'
    });
  }
};

// Vérifier que l'utilisateur est admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Privilèges administrateur requis'
    });
  }
  next();
};

// Vérifier que l'utilisateur accède à ses propres données ou est admin
export const requireOwnerOrAdmin = (req, res, next) => {
  const userId = req.params.id;
  
  if (req.user.id !== userId && req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé'
    });
  }
  next();
};

