// Middleware de gestion d'erreurs centralisé
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreurs de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Erreurs de contraintes uniques
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Cette valeur existe déjà',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Erreurs de clés étrangères
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide'
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur'
  });
};

// Middleware pour les routes non trouvées
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
};

