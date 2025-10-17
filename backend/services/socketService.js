import { emitSocketEvent, broadcastEvent, emitToUser } from '../config/socket.js';

/**
 * Service centralisé pour tous les événements WebSocket
 */
class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialiser le service avec l'instance Socket.io
   */
  initialize(io) {
    this.io = io;
    console.log('SocketService initialisé');
  }

  // ==================== ÉVÉNEMENTS DE PARTIES ====================

  /**
   * Émettre une mise à jour de score
   */
  emitScoreUpdate(gameId, scoreData) {
    emitSocketEvent(this.io, `game:${gameId}`, 'game:score-updated', {
      gameId,
      redScore: scoreData.team_red_score,
      blueScore: scoreData.team_blue_score,
      timestamp: new Date().toISOString()
    });

    // Aussi notifier la room globale
    emitSocketEvent(this.io, 'global', 'game:score-updated', {
      gameId,
      redScore: scoreData.team_red_score,
      blueScore: scoreData.team_blue_score,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Émettre le démarrage d'une partie
   */
  emitGameStarted(game, table, players) {
    const gameData = {
      id: game.id,
      tableId: game.table_id,
      tableName: table.name,
      tableLocation: table.location,
      players: players.map(p => ({
        id: p.user_id,
        username: p.User?.username,
        teamColor: p.team_color,
        role: p.role
      })),
      redScore: game.team_red_score,
      blueScore: game.team_blue_score,
      startedAt: game.started_at,
      status: game.status
    };

    // Notifier la room globale
    broadcastEvent(this.io, 'game:started', gameData);

    // Notifier la room de la table
    emitSocketEvent(this.io, `table:${game.table_id}`, 'table:game-started', gameData);

    // Notifier chaque joueur individuellement
    players.forEach(player => {
      emitToUser(this.io, player.user_id, 'notification', {
        type: 'game-started',
        title: 'Partie commencée !',
        message: `Votre partie sur ${table.name} vient de commencer`,
        gameId: game.id,
        data: gameData
      });
    });
  }

  /**
   * Émettre la fin d'une partie
   */
  emitGameEnded(game, winner, players) {
    const gameEndData = {
      gameId: game.id,
      tableId: game.table_id,
      redScore: game.team_red_score,
      blueScore: game.team_blue_score,
      winner: winner,
      endedAt: game.ended_at,
      duration: this._calculateDuration(game.started_at, game.ended_at)
    };

    // Notifier la room de la partie
    emitSocketEvent(this.io, `game:${game.id}`, 'game:ended', gameEndData);

    // Notifier la room globale
    broadcastEvent(this.io, 'game:ended', gameEndData);

    // Notifier la room de la table
    emitSocketEvent(this.io, `table:${game.table_id}`, 'table:game-ended', gameEndData);

    // Notifier les joueurs
    players.forEach(player => {
      const isWinner = player.team_color === winner;
      emitToUser(this.io, player.user_id, 'notification', {
        type: isWinner ? 'game-won' : 'game-lost',
        title: isWinner ? 'Victoire !' : 'Défaite',
        message: isWinner
          ? `Bravo ! Vous avez gagné ${game.team_red_score}-${game.team_blue_score}`
          : `Dommage ! Vous avez perdu ${game.team_red_score}-${game.team_blue_score}`,
        gameId: game.id,
        data: gameEndData
      });
    });
  }

  // ==================== ÉVÉNEMENTS DE TABLES ====================

  /**
   * Émettre un changement de statut de table
   */
  emitTableStatusChanged(tableId, status, additionalData = {}) {
    const statusData = {
      tableId,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    // Notifier la room de la table
    emitSocketEvent(this.io, `table:${tableId}`, 'table:status-changed', statusData);

    // Notifier la room globale
    broadcastEvent(this.io, 'table:status-changed', statusData);
  }

  /**
   * Émettre une réservation créée
   */
  emitReservationCreated(reservation, table, user) {
    const reservationData = {
      id: reservation.id,
      tableId: reservation.table_id,
      tableName: table.name,
      userId: reservation.user_id,
      username: user.username,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
      status: reservation.status
    };

    // Notifier la room de la table
    emitSocketEvent(this.io, `table:${reservation.table_id}`, 'table:reserved', reservationData);

    // Notifier l'utilisateur
    emitToUser(this.io, reservation.user_id, 'notification', {
      type: 'reservation-confirmed',
      title: 'Réservation confirmée',
      message: `Votre réservation pour ${table.name} est confirmée`,
      reservationId: reservation.id,
      data: reservationData
    });

    // Notifier les admins
    emitSocketEvent(this.io, 'admin', 'reservation:created', reservationData);
  }

  // ==================== ÉVÉNEMENTS DE LEADERBOARD ====================

  /**
   * Émettre une mise à jour du leaderboard
   */
  emitLeaderboardUpdate(leaderboardData) {
    emitSocketEvent(this.io, 'leaderboard', 'leaderboard:updated', {
      leaderboard: leaderboardData.leaderboard || leaderboardData,
      totalActivePlayers: leaderboardData.totalActivePlayers,
      updatedAt: new Date().toISOString()
    });

    // Aussi broadcast global
    broadcastEvent(this.io, 'leaderboard:updated', {
      top5: (leaderboardData.leaderboard || leaderboardData).slice(0, 5),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Émettre un changement de rang pour un joueur
   */
  emitPlayerRankChanged(playerId, oldRank, newRank, playerData) {
    emitToUser(this.io, playerId, 'notification', {
      type: 'rank-changed',
      title: newRank < oldRank ? 'Vous montez au classement !' : 'Classement mis à jour',
      message: `Nouveau rang: #${newRank} (ancien: #${oldRank})`,
      data: {
        oldRank,
        newRank,
        ...playerData
      }
    });
  }

  // ==================== ÉVÉNEMENTS DE STATISTIQUES ====================

  /**
   * Émettre des stats globales mises à jour (pour dashboard admin)
   */
  emitGlobalStatsUpdate(stats) {
    emitSocketEvent(this.io, 'admin', 'stats:global-updated', {
      ...stats,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Émettre le nombre de spectateurs d'une partie
   */
  emitViewerCount(gameId) {
    const room = this.io.sockets.adapter.rooms.get(`game:${gameId}`);
    const viewerCount = room ? room.size : 0;

    emitSocketEvent(this.io, `game:${gameId}`, 'game:viewer-count', {
      gameId,
      count: viewerCount
    });
  }

  // ==================== HELPERS ====================

  /**
   * Calculer la durée d'une partie en minutes
   */
  _calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / 1000 / 60); // minutes
  }

  /**
   * Obtenir les utilisateurs connectés
   */
  getConnectedUsers() {
    if (!this.io) return [];

    const users = [];
    this.io.sockets.sockets.forEach((socket) => {
      if (socket.isAuthenticated) {
        users.push({
          socketId: socket.id,
          userId: socket.userId,
          username: socket.username,
          role: socket.userRole
        });
      }
    });

    return users;
  }

  /**
   * Obtenir le nombre de spectateurs par partie
   */
  getGameViewers(gameId) {
    const room = this.io.sockets.adapter.rooms.get(`game:${gameId}`);
    return room ? room.size : 0;
  }
}

// Export singleton
export default new SocketService();
