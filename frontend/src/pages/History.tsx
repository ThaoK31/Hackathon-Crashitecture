import React, { useState, useEffect } from "react";
import { gameService } from "../services/gameService";
import GameCard from "../components/GameCard";

interface Game {
  id: string;
  table: {
    name: string;
    location: string;
  };
  team_red_score: number;
  team_blue_score: number;
  ended_at: string;
  players: Array<{
    team_color: "RED" | "BLUE";
    role: "ATTACK" | "DEFENSE";
    goals: number;
    assists: number;
    saves: number;
    user: {
      id: string;
      username: string;
    };
  }>;
}

export default function HistoryPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "victories" | "defeats">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fonction pour calculer le statut de l'utilisateur connecté
  const getUserGameStatus = (game: Game) => {
    console.log("getUserGameStatus - currentUserId:", currentUserId);
    console.log("getUserGameStatus - game.players:", game.players);

    // Trouver le joueur correspondant à l'utilisateur connecté
    const userPlayer = game.players.find(
      (player) => player.user.id === currentUserId
    );

    console.log("getUserGameStatus - userPlayer:", userPlayer);

    if (!userPlayer) return { won: false, userScore: "0-0", team: "UNKNOWN" };

    const userTeam = userPlayer.team_color;
    const userScore =
      userTeam === "RED" ? game.team_red_score : game.team_blue_score;
    const opponentScore =
      userTeam === "RED" ? game.team_blue_score : game.team_red_score;
    const won = userScore > opponentScore;

    console.log("getUserGameStatus - result:", {
      won,
      userScore: `${userScore}-${opponentScore}`,
      team: userTeam,
    });

    return {
      won,
      userScore: `${userScore}-${opponentScore}`,
      team: userTeam,
    };
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer l'utilisateur connecté
        const userResponse = await fetch(
          "http://localhost:3000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("User data:", userData); // Debug
          setCurrentUserId(userData.data.user.id);
        }

        const response = await gameService.getHistory();
        setGames(response.data.games);
      } catch (err: any) {
        console.error("Erreur lors du chargement des parties:", err);
        setError("Erreur lors du chargement de l'historique des parties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleToggleGame = (gameId: string) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  // Filtrer les parties
  const filteredGames = games.filter((game) => {
    const userStatus = getUserGameStatus(game);
    const matchesFilter =
      filter === "all" ||
      (filter === "victories" && userStatus.won) ||
      (filter === "defeats" && !userStatus.won);

    const matchesSearch =
      searchTerm === "" ||
      game.table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.players.some((p) =>
        p.user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Erreur</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-auto">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="text-6xl hover:rotate-12 transition-transform duration-300 cursor-pointer">
              ⚽
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-slide-up">
            Historique des Parties
          </h1>
          <p
            className="text-xl text-slate-300 max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Retrouvez toutes les parties terminées avec leurs statistiques
            détaillées
          </p>
        </div>

        {/* Filtres et recherche */}
        <div
          className="mb-8 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filtres */}
            <div className="flex gap-2">
              {[
                { key: "all", label: "Toutes", icon: "📊" },
                { key: "victories", label: "Victoires", icon: "🏆" },
                { key: "defeats", label: "Défaites", icon: "💔" },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    filter === key
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  <span className="mr-2">{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par joueur ou table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-64"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div
            className="card p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-xl animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Parties Jouées
            </h3>
            <p className="text-3xl font-bold text-green-400">
              {filteredGames.length}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {filter === "all"
                ? "Total"
                : filter === "victories"
                ? "Victoires"
                : "Défaites"}
            </p>
          </div>

          <div
            className="card p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-xl animate-fade-in"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <span className="text-2xl">⚽</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Buts Marqués
            </h3>
            <p className="text-3xl font-bold text-blue-400">
              {filteredGames.reduce(
                (total, game) =>
                  total + game.team_red_score + game.team_blue_score,
                0
              )}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Moyenne:{" "}
              {filteredGames.length > 0
                ? Math.round(
                    filteredGames.reduce(
                      (total, game) =>
                        total + game.team_red_score + game.team_blue_score,
                      0
                    ) / filteredGames.length
                  )
                : 0}{" "}
              par partie
            </p>
          </div>

          <div
            className="card p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-xl animate-fade-in"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Tables Utilisées
            </h3>
            <p className="text-3xl font-bold text-purple-400">
              {new Set(filteredGames.map((game) => game.table.name)).size}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Diversité des terrains
            </p>
          </div>
        </div>

        {/* Liste des parties */}
        <div className="space-y-4">
          {filteredGames.length === 0 ? (
            <div className="card p-12 text-center animate-fade-in">
              <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                <span className="text-slate-400 text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {games.length === 0
                  ? "Aucune partie trouvée"
                  : "Aucun résultat"}
              </h3>
              <p className="text-slate-400">
                {games.length === 0
                  ? "Les parties terminées apparaîtront ici"
                  : "Essayez de modifier vos filtres ou votre recherche"}
              </p>
            </div>
          ) : (
            filteredGames.map((game, index) => (
              <div
                key={game.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GameCard
                  game={game}
                  isExpanded={expandedGameId === game.id}
                  onToggle={() => handleToggleGame(game.id)}
                  currentUserId={currentUserId}
                />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
