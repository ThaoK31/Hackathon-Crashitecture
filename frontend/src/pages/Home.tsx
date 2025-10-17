import React, { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { tableService, Table } from "../services/tables";
import { reservationService, Reservation } from "../services/reservations";
import { gameService, Game } from "../services/games";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<Table[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [tablesRes, reservationsRes, gamesRes] = await Promise.all([
        tableService.getTables(),
        reservationService.getMyReservations(),
        gameService.getLiveGames(),
      ]);

      setTables(tablesRes.data.tables);
      setMyReservations(
        reservationsRes.data.reservations
          .filter((r) => r.status === "ACTIVE")
          .slice(0, 3)
      );
      setRecentGames(gamesRes.data.games.slice(0, 5));
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableTables = tables.filter((t) => t.is_available).length;
  const activeReservations = myReservations.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bienvenue sur Babynov,{" "}
            <span className="text-blue-400">{user?.username}</span> 👋
          </h1>
          <p className="text-slate-300 text-lg">
            Prêt pour une partie de babyfoot ? Consultez les tables disponibles
            et réservez votre créneau !
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🎯</div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {availableTables}/{tables.length}
                </div>
                <div className="text-sm text-slate-400">Tables disponibles</div>
              </div>
            </div>
            <button
              onClick={() => navigate("/tables")}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              Voir les tables
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📅</div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {activeReservations}
                </div>
                <div className="text-sm text-slate-400">
                  Réservations actives
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/reservations")}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              Mes réservations
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🏆</div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {recentGames.length}
                </div>
                <div className="text-sm text-slate-400">Parties en cours</div>
              </div>
            </div>
            <button
              onClick={() => navigate("/games")}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              Voir les parties
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Mes prochaines réservations */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                📅 Prochaines réservations
              </h2>
            </div>

            {myReservations.length > 0 ? (
              <div className="space-y-4">
                {myReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-slate-800/50 border border-white/10 rounded-lg p-4 hover:bg-slate-800/70 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold mb-1">
                          {reservation.table?.name}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          📍 {reservation.table?.location}
                        </p>
                        <p className="text-slate-400 text-sm">
                          🕐{" "}
                          {new Date(reservation.start_time).toLocaleString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-green-400/10 border border-green-400/20 text-green-400 rounded-full text-xs font-medium">
                        Active
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate("/reservations")}
                  className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Voir toutes mes réservations →
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📅</div>
                <p className="text-slate-400 mb-4">
                  Vous n'avez pas de réservations actives
                </p>
                <button
                  onClick={() => navigate("/reservations")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300"
                >
                  Créer une réservation
                </button>
              </div>
            )}
          </div>

          {/* Parties en cours */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                🏆 Parties en cours
              </h2>
            </div>

            {recentGames.length > 0 ? (
              <div className="space-y-4">
                {recentGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-slate-800/50 border border-white/10 rounded-lg p-4 hover:bg-slate-800/70 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-1">
                            <span className="text-red-400 font-bold">
                              {game.team_red_score}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">Rouge</span>
                        </div>
                        <span className="text-slate-500 font-bold">vs</span>
                        <div className="text-center">
                          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mb-1">
                            <span className="text-blue-400 font-bold">
                              {game.team_blue_score}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">Bleue</span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          game.status === "FINISHED"
                            ? "bg-blue-400/10 border border-blue-400/20 text-blue-400"
                            : "bg-green-400/10 border border-green-400/20 text-green-400"
                        }`}
                      >
                        {game.status === "FINISHED" ? "Terminée" : "En cours"}
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs">
                      {new Date(game.started_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                ))}
                <button
                  onClick={() => navigate("/games")}
                  className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Voir toutes les parties →
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🏆</div>
                <p className="text-slate-400 mb-4">Aucune partie en cours</p>
                <button
                  onClick={() => navigate("/games")}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300"
                >
                  Démarrer une partie
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à jouer ? 🎮
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Consultez les tables disponibles, réservez votre créneau et
            lancez-vous dans une partie de babyfoot endiablée !
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/tables")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              Voir les tables
            </button>
            <button
              onClick={() => navigate("/reservations")}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300"
            >
              Réserver un créneau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
