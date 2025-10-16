import { User } from '../models/index.js';

// Récupérer tous les utilisateurs (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, username } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (email) user.email = email;
    if (username) user.username = username;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer un utilisateur (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé'
    });
  } catch (error) {
    next(error);
  }
};

// Changer le rôle d'un utilisateur (admin only)
export const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Rôle mis à jour',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

