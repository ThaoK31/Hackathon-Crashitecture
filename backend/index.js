import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { sequelize } from './models/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tableRoutes from './routes/tables.js';
import reservationRoutes from './routes/reservations.js';
import gameRoutes from './routes/games.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limite de 100 requêtes par IP
//   message: 'Trop de requêtes depuis cette IP, réessayez plus tard'
// });
// app.use('/api/', limiter);


// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Babyfoot API Docs'
}));


// Route principale
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Babyfoot Ynov - Hackathon 2025',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      tables: '/api/tables',
      reservations: '/api/reservations',
      games: '/api/games'
    }
  });
});


// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});


// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/games', gameRoutes);


// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);


// Initialisation de la base de données et démarrage du serveur
const startServer = async () => {
    try {
        // Tester la connexion à la DB
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données réussie');

        // Synchroniser les modèles (en dev seulement)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Modèles synchronisés');
        }

        // Démarrer le serveur
        app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
        console.log(`Documentation disponible sur http://localhost:${PORT}/api-docs`);
        console.log(`Prêt pour le hackathon !`);
        });
    } catch (error) {
        console.error('Erreur au démarrage:', error);
        process.exit(1);
    }
};

startServer();