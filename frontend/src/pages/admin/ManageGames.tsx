import React, { useState, useEffect } from "react";
import { Game, gameService } from "../../services/games";

export default function ManageGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEndingGame, setIsEndingGame] = useState<string | null>(null);
  const [isUpdatingScore, setIsUpdatingScore] = useState<string | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await gameService.getLiveGames();
      setGames(response.data.games);
    } catch (err: any) {
      console.error("Erreur lors du chargement des parties:", err);
      setError("Erreur lors du chargement des parties");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndGame = async (gameId: string) => {
    try {
      setIsEndingGame(gameId);
      await gameService.endGame(gameId);
      await fetchGames(); // Recharger les données
    } catch (err: any) {
      console.error("Erreur lors de la fin de la partie:", err);
      setError("Erreur lors de la fin de la partie");
    } finally {
      setIsEndingGame(null);
    }
  };

  const handleUpdateScore = async (
    gameId: string,
    team: "red" | "blue",
    increment: boolean
  ) => {
    try {
      setIsUpdatingScore(gameId);
      const game = games.find((g) => g.id === gameId);
      if (!game) return;

      const newRedScore =
        team === "red"
          ? increment
            ? game.team_red_score + 1
            : Math.max(0, game.team_red_score - 1)
          : game.team_red_score;

      const newBlueScore =
        team === "blue"
          ? increment
            ? game.team_blue_score + 1
            : Math.max(0, game.team_blue_score - 1)
          : game.team_blue_score;

      await gameService.updateScore(gameId, {
        team_red_score: newRedScore,
        team_blue_score: newBlueScore,
      });

      await fetchGames(); // Recharger les données
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du score:", err);
      setError("Erreur lors de la mise à jour du score");
    } finally {
      setIsUpdatingScore(null);
    }
  };

  const getStatusColor = (isFinished: boolean) => {
    return isFinished
      ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
      : "text-green-400 bg-green-400/10 border-green-400/20";
  };

  const getStatusText = (isFinished: boolean) => {
    return isFinished ? "Terminée" : "En cours";
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredGames = games.filter((game) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "ongoing" && !game.is_finished) ||
      (statusFilter === "finished" && game.is_finished);

    const matchesSearch =
      searchTerm === "" ||
      game.table?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.table?.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.players.some((player) =>
        player.user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDate =
      dateFilter === "" ||
      new Date(game.created_at).toDateString() ===
        new Date(dateFilter).toDateString();

    return matchesStatus && matchesSearch && matchesDate;
  });

  // Statistiques
  const stats = {
    total: games.length,
    ongoing: games.filter((g) => !g.is_finished).length,
    finished: games.filter((g) => g.is_finished).length,
    totalGoals: games.reduce(
      (sum, game) => sum + game.team_red_score + game.team_blue_score,
      0
    ),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des parties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des Parties
          </h1>
          <p className="text-slate-400">
            Administrez toutes les parties du système
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-slate-400 text-sm">Total</div>
          </div>
          <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {stats.ongoing}
            </div>
            <div className="text-slate-400 text-sm">En cours</div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">
              {stats.finished}
            </div>
            <div className="text-slate-400 text-sm">Terminées</div>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">
              {stats.totalGoals}
            </div>
            <div className="text-slate-400 text-sm">Buts marqués</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Table, localisation ou joueur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes</option>
                <option value="ongoing">En cours</option>
                <option value="finished">Terminées</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchGames}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des parties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {game.table?.name || "Table inconnue"}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    📍 {game.table?.location || "Localisation inconnue"}
                  </p>
                  <p className="text-slate-400 text-sm">
                    🕐 {formatDateTime(game.created_at)}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    game.is_finished
                  )}`}
                >
                  {getStatusText(game.is_finished)}
                </div>
              </div>

              {/* Score */}
              <div className="bg-slate-800/30 border border-white/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {game.team_red_score}
                    </div>
                    <div className="text-xs text-slate-400">🔴 Rouge</div>
                  </div>

                  <div className="text-slate-400 text-lg">VS</div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {game.team_blue_score}
                    </div>
                    <div className="text-xs text-slate-400">🔵 Bleue</div>
                  </div>
                </div>
              </div>

              {/* Contrôles de score (admin) */}
              {!game.is_finished && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-400 text-center">
                      🔴 Équipe Rouge
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateScore(game.id, "red", false)}
                        disabled={
                          isUpdatingScore === game.id ||
                          game.team_red_score === 0
                        }
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleUpdateScore(game.id, "red", true)}
                        disabled={isUpdatingScore === game.id}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-slate-400 text-center">
                      🔵 Équipe Bleue
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdateScore(game.id, "blue", false)
                        }
                        disabled={
                          isUpdatingScore === game.id ||
                          game.team_blue_score === 0
                        }
                        className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleUpdateScore(game.id, "blue", true)}
                        disabled={isUpdatingScore === game.id}
                        className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Joueurs */}
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-300 mb-2">
                  Joueurs
                </div>
                <div className="space-y-2">
                  {game.players.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            player.team_color === "RED"
                              ? "bg-red-400"
                              : "bg-blue-400"
                          }`}
                        ></span>
                        <span className="text-white">
                          {player.user.username}
                        </span>
                        <span className="text-slate-400">({player.role})</span>
                      </div>
                      <div className="text-slate-400">
                        {player.goals}⚽ {player.assists}🅰️ {player.saves}🛡️
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!game.is_finished && (
                  <button
                    onClick={() => handleEndGame(game.id)}
                    disabled={isEndingGame === game.id}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEndingGame === game.id ? "Fin..." : "Terminer"}
                  </button>
                )}

                {game.is_finished && game.ended_at && (
                  <div className="flex-1 text-center text-slate-400 text-sm py-2">
                    Terminée le {formatDateTime(game.ended_at)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune partie
            </h3>
            <p className="text-slate-400">
              {searchTerm || statusFilter !== "all" || dateFilter
                ? "Aucune partie ne correspond à vos filtres"
                : "Il n'y a pas de parties dans le système"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
