import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Configuration et initialisation de Socket.io
 * @param {Object} server - Serveur HTTP Express
 * @returns {Object} Instance Socket.io configurée
 */
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware d'authentification Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        // Permettre les connexions anonymes pour certains événements publics
        socket.userId = null;
        socket.isAuthenticated = false;
        return next();
      }

      // Vérifier le token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'email', 'username', 'role']
      });

      if (!user) {
        return next(new Error('Utilisateur non trouvé'));
      }

      // Attacher les infos utilisateur au socket
      socket.userId = user.id;
      socket.userRole = user.role;
      socket.username = user.username;
      socket.isAuthenticated = true;

      next();
    } catch (error) {
      console.error('Erreur auth WebSocket:', error.message);
      // Permettre quand même la connexion en mode anonyme
      socket.userId = null;
      socket.isAuthenticated = false;
      next();
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    const userInfo = socket.isAuthenticated
      ? `${socket.username} (${socket.userId})`
      : 'Anonyme';

    console.log(`WebSocket connecté: ${userInfo} - Socket ID: ${socket.id}`);

    // Rejoindre la room globale
    socket.join('global');

    // Si authentifié, rejoindre sa room personnelle
    if (socket.isAuthenticated) {
      socket.join(`user:${socket.userId}`);

      // Si admin, rejoindre la room admin
      if (socket.userRole === 'ADMIN') {
        socket.join('admin');
      }
    }

    // Événement: Rejoindre une room de partie
    socket.on('game:join', (gameId) => {
      socket.join(`game:${gameId}`);
      console.log(`${userInfo} a rejoint la partie ${gameId}`);

      // Notifier les autres dans la room
      socket.to(`game:${gameId}`).emit('game:viewer-joined', {
        username: socket.username || 'Spectateur',
        gameId
      });
    });

    // Événement: Quitter une room de partie
    socket.on('game:leave', (gameId) => {
      socket.leave(`game:${gameId}`);
      console.log(`${userInfo} a quitté la partie ${gameId}`);

      socket.to(`game:${gameId}`).emit('game:viewer-left', {
        username: socket.username || 'Spectateur',
        gameId
      });
    });

    // Événement: Rejoindre une room de table
    socket.on('table:watch', (tableId) => {
      socket.join(`table:${tableId}`);
      console.log(`${userInfo} observe la table ${tableId}`);
    });

    // Événement: Quitter une room de table
    socket.on('table:unwatch', (tableId) => {
      socket.leave(`table:${tableId}`);
      console.log(`${userInfo} arrête d'observer la table ${tableId}`);
    });

    // Événement: S'abonner au leaderboard
    socket.on('leaderboard:subscribe', () => {
      socket.join('leaderboard');
      console.log(`${userInfo} s'abonne au leaderboard`);
    });

    // Événement: Se désabonner du leaderboard
    socket.on('leaderboard:unsubscribe', () => {
      socket.leave('leaderboard');
      console.log(`${userInfo} se désabonne du leaderboard`);
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`WebSocket déconnecté: ${userInfo}`);
    });

    // Gestion des erreurs
    socket.on('error', (error) => {
      console.error(`Erreur WebSocket pour ${userInfo}:`, error);
    });
  });

  return io;
};

/**
 * Helper pour émettre des événements depuis les controllers
 */
export const emitSocketEvent = (io, room, event, data) => {
  if (!io) {
    console.warn('Socket.io non initialisé');
    return;
  }

  io.to(room).emit(event, data);
  console.log(`Événement émis: ${event} -> room: ${room}`);
};

/**
 * Émettre à tous les clients
 */
export const broadcastEvent = (io, event, data) => {
  if (!io) {
    console.warn('Socket.io non initialisé');
    return;
  }

  io.emit(event, data);
  console.log(`Broadcast: ${event}`);
};

/**
 * Émettre à un utilisateur spécifique
 */
export const emitToUser = (io, userId, event, data) => {
  if (!io) {
    console.warn('Socket.io non initialisé');
    return;
  }

  io.to(`user:${userId}`).emit(event, data);
  console.log(`Événement envoyé à user:${userId}: ${event}`);
};

export default initializeSocket;
