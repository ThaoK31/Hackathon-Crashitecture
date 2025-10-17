import React, { useState, useEffect } from "react";
import { gameService, Game } from "../../services/games";
import { userService, User } from "../../services/users";
import { tableService, Table } from "../../services/tables";
import { reservationService, Reservation } from "../../services/reservations";

export default function StatsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        gamesResponse,
        usersResponse,
        tablesResponse,
        reservationsResponse,
      ] = await Promise.all([
        gameService.getLiveGames(),
        userService.getAllUsers(),
        tableService.getTables(),
        reservationService.getAllReservations(),
      ]);

      setGames(gamesResponse.data.games);
      setUsers(usersResponse.data.users);
      setTables(tablesResponse.data.tables);
      setReservations(reservationsResponse.data.reservations);
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques:", err);
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les statistiques
  const stats = {
    games: {
      total: games.length,
      ongoing: games.filter((g) => !g.is_finished).length,
      finished: games.filter((g) => g.is_finished).length,
      totalGoals: games.reduce(
        (sum, game) => sum + game.team_red_score + game.team_blue_score,
        0
      ),
    },
    users: {
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      regularUsers: users.filter((u) => u.role === "USER").length,
    },
    tables: {
      total: tables.length,
      available: tables.filter((t) => t.status === "AVAILABLE").length,
      occupied: tables.filter((t) => t.status === "OCCUPIED").length,
      maintenance: tables.filter((t) => t.status === "MAINTENANCE").length,
    },
    reservations: {
      total: reservations.length,
      active: reservations.filter((r) => r.status === "ACTIVE").length,
      cancelled: reservations.filter((r) => r.status === "CANCELLED").length,
      completed: reservations.filter((r) => r.status === "COMPLETED").length,
    },
  };

  // Top 5 tables les plus utilisées
  const tableUsage = games.reduce((acc, game) => {
    const tableId = game.table_id;
    if (!acc[tableId]) {
      acc[tableId] = {
        table: game.table,
        count: 0,
      };
    }
    acc[tableId].count++;
    return acc;
  }, {} as Record<string, { table: any; count: number }>);

  const topTables = Object.values(tableUsage)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top 5 joueurs (par nombre de parties)
  const playerStats = games
    .flatMap((game) => game.players)
    .reduce((acc, player) => {
      const userId = player.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: player.user,
          gamesPlayed: 0,
          totalGoals: 0,
          totalAssists: 0,
          totalSaves: 0,
        };
      }
      acc[userId].gamesPlayed++;
      acc[userId].totalGoals += player.goals;
      acc[userId].totalAssists += player.assists;
      acc[userId].totalSaves += player.saves;
      return acc;
    }, {} as Record<string, { user: any; gamesPlayed: number; totalGoals: number; totalAssists: number; totalSaves: number }>);

  const topPlayers = Object.values(playerStats)
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5);

  // Répartition équipes
  const teamStats = games
    .flatMap((game) => game.players)
    .reduce((acc, player) => {
      acc[player.team_color] = (acc[player.team_color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Statistiques
              </h1>
              <p className="text-slate-400">
                Vue d'ensemble du système BabyfootHub
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Statistiques Générales */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Vue Générale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Parties */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
              <div className="text-4xl mb-2">🏓</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.games.total}
              </div>
              <div className="text-slate-300 text-sm mb-3">Parties Totales</div>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-green-400">{stats.games.ongoing}</span>
                  <span className="text-slate-400"> en cours</span>
                </div>
                <div>
                  <span className="text-blue-400">{stats.games.finished}</span>
                  <span className="text-slate-400"> terminées</span>
                </div>
              </div>
            </div>

            {/* Utilisateurs */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.users.total}
              </div>
              <div className="text-slate-300 text-sm mb-3">Utilisateurs</div>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-purple-400">{stats.users.admins}</span>
                  <span className="text-slate-400"> admins</span>
                </div>
                <div>
                  <span className="text-blue-400">
                    {stats.users.regularUsers}
                  </span>
                  <span className="text-slate-400"> users</span>
                </div>
              </div>
            </div>

            {/* Tables */}
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-6">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.tables.total}
              </div>
              <div className="text-slate-300 text-sm mb-3">Tables</div>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-green-400">
                    {stats.tables.available}
                  </span>
                  <span className="text-slate-400"> dispo</span>
                </div>
                <div>
                  <span className="text-red-400">{stats.tables.occupied}</span>
                  <span className="text-slate-400"> occupées</span>
                </div>
              </div>
            </div>

            {/* Réservations */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-6">
              <div className="text-4xl mb-2">📅</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.reservations.total}
              </div>
              <div className="text-slate-300 text-sm mb-3">Réservations</div>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-green-400">
                    {stats.reservations.active}
                  </span>
                  <span className="text-slate-400"> actives</span>
                </div>
                <div>
                  <span className="text-blue-400">
                    {stats.reservations.completed}
                  </span>
                  <span className="text-slate-400"> terminées</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Tables les plus utilisées */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Tables les Plus Utilisées
          </h2>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            {topTables.length > 0 ? (
              <div className="space-y-3">
                {topTables.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : index === 1
                            ? "bg-slate-400/20 text-slate-400"
                            : index === 2
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-slate-600/20 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {item.table?.name || "Table inconnue"}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {item.table?.location || "Localisation inconnue"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{item.count}</div>
                      <div className="text-slate-400 text-sm">parties</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Joueurs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Joueurs les Plus Actifs
          </h2>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            {topPlayers.length > 0 ? (
              <div className="space-y-3">
                {topPlayers.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : index === 1
                            ? "bg-slate-400/20 text-slate-400"
                            : index === 2
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-slate-600/20 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {player.user?.username || "Joueur inconnu"}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {player.totalGoals}⚽ {player.totalAssists}🅰️{" "}
                          {player.totalSaves}🛡️
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        {player.gamesPlayed}
                      </div>
                      <div className="text-slate-400 text-sm">parties</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Répartition Équipes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Répartition des Équipes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl mb-2">🔴</div>
                  <div className="text-slate-300 text-sm">Équipe Rouge</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-400">
                    {teamStats.RED || 0}
                  </div>
                  <div className="text-slate-400 text-sm">joueurs</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl mb-2">🔵</div>
                  <div className="text-slate-300 text-sm">Équipe Bleue</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">
                    {teamStats.BLUE || 0}
                  </div>
                  <div className="text-slate-400 text-sm">joueurs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Autres Statistiques */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Statistiques de Jeu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="text-2xl mb-2">⚽</div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.games.totalGoals}
              </div>
              <div className="text-slate-400 text-sm">Buts Marqués Total</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.games.total > 0
                  ? (stats.games.totalGoals / stats.games.total).toFixed(1)
                  : 0}
              </div>
              <div className="text-slate-400 text-sm">Moyenne Buts/Partie</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="text-2xl mb-2">🎮</div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.users.total > 0
                  ? (stats.games.total / stats.users.total).toFixed(1)
                  : 0}
              </div>
              <div className="text-slate-400 text-sm">Parties/Utilisateur</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
