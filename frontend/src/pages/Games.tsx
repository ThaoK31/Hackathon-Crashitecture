import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Game, gameService } from "../services/games";
import { Table, tableService } from "../services/tables";
import { Reservation, reservationService } from "../services/reservations";
import { User, userService } from "../services/users";
import { authService } from "../services/authService";
import CreateGameModal from "../components/CreateGameModal";

export default function GamesPage() {
  const location = useLocation();
  const [games, setGames] = useState<Game[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateGameModalOpen, setIsCreateGameModalOpen] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isUpdatingScore, setIsUpdatingScore] = useState<string | null>(null);
  const [isEndingGame, setIsEndingGame] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [preselectedTableId, setPreselectedTableId] = useState<string | undefined>(undefined);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Ouvrir le modal de création de partie si on vient d'une réservation
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsCreateGameModalOpen(true);
      // Pré-sélectionner la table si elle est fournie
      if (location.state?.selectedTableId) {
        setPreselectedTableId(location.state.selectedTableId);
      }
      // Nettoyer le state pour éviter de rouvrir le modal à chaque navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger l'utilisateur connecté
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user as User);
      }

      // Charger les données essentielles
      const [gamesResponse, tablesResponse, reservationsResponse] =
        await Promise.all([
          gameService.getLiveGames(),
          tableService.getTables(),
          reservationService.getMyReservations(),
        ]);

      setGames(gamesResponse.data.games);
      setTables(tablesResponse.data.tables);
      setMyReservations(reservationsResponse.data.reservations);

      // Charger les utilisateurs séparément (peut échouer sans bloquer le reste)
      try {
        const usersResponse = await userService.getUsers();
        console.log("Réponse users:", usersResponse);
        if (usersResponse?.data?.users) {
          setUsers(usersResponse.data.users);
          console.log(
            "Utilisateurs chargés avec succès:",
            usersResponse.data.users.length
          );
        }
      } catch (userErr: any) {
        console.error("Erreur lors du chargement des utilisateurs:", userErr);
        console.error(
          "Détails de l'erreur:",
          userErr.response?.data || userErr.message
        );

        // Solution de secours : ajouter au moins l'utilisateur connecté
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          console.log(
            "Utilisation de l'utilisateur connecté comme fallback:",
            currentUser
          );
          setUsers([
            {
              id: currentUser.id,
              username: currentUser.username,
              email: currentUser.email,
              role: currentUser.role as "USER" | "ADMIN",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
        } else {
          setUsers([]);
        }
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async (data: any) => {
    try {
      setIsCreatingGame(true);
      await gameService.createGame(data);
      setIsCreateGameModalOpen(false);
      await fetchData(); // Recharger les données
    } catch (err: any) {
      console.error("Erreur lors de la création de la partie:", err);
      setError("Erreur lors de la création de la partie");
    } finally {
      setIsCreatingGame(false);
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

      await fetchData(); // Recharger les données
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du score:", err);
      setError("Erreur lors de la mise à jour du score");
    } finally {
      setIsUpdatingScore(null);
    }
  };

  const handleEndGame = async (gameId: string) => {
    try {
      setIsEndingGame(gameId);
      await gameService.endGame(gameId);
      await fetchData(); // Recharger les données
    } catch (err: any) {
      console.error("Erreur lors de la fin de la partie:", err);
      setError("Erreur lors de la fin de la partie");
    } finally {
      setIsEndingGame(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Vérifier si l'utilisateur connecté participe à une partie
  const isUserInGame = (game: Game) => {
    if (!currentUser) return false;
    return game.players?.some((player) => player.user.id === currentUser.id);
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      searchTerm === "" ||
      game.table?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.table?.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.players?.some((player) =>
        player.user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesSearch;
  });

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Parties en Cours
              </h1>
              <p className="text-slate-400">
                Rejoignez une partie ou créez-en une nouvelle
              </p>
            </div>
            <button
              onClick={() => setIsCreateGameModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              + Nouvelle partie
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-end">
              <button
                onClick={fetchData}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des parties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGames.map((game) => {
            const userInGame = isUserInGame(game);
            return (
              <div
                key={game.id}
                className={`bg-white/5 backdrop-blur-xl border rounded-xl p-6 hover:bg-white/10 transition-all duration-300 ${
                  userInGame
                    ? "border-l-4 border-l-green-500 border-t border-r border-b border-green-500/30 shadow-lg shadow-green-500/20"
                    : "border border-white/10"
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {game.table?.name || "Table inconnue"}
                      </h3>
                      {userInGame && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                          🎮 Vous jouez
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">
                      {formatDateTime(game.created_at)}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm">
                    📍 {game.table?.location || "Localisation inconnue"}
                  </p>
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

              {/* Contrôles de score */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 text-center">
                    🔴 Équipe Rouge
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateScore(game.id, "red", false)}
                      disabled={
                        !userInGame ||
                        isUpdatingScore === game.id ||
                        game.team_red_score === 0
                      }
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        !userInGame
                          ? "Vous ne participez pas à cette partie"
                          : ""
                      }
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateScore(game.id, "red", true)}
                      disabled={!userInGame || isUpdatingScore === game.id}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        !userInGame
                          ? "Vous ne participez pas à cette partie"
                          : ""
                      }
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
                      onClick={() => handleUpdateScore(game.id, "blue", false)}
                      disabled={
                        !userInGame ||
                        isUpdatingScore === game.id ||
                        game.team_blue_score === 0
                      }
                      className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        !userInGame
                          ? "Vous ne participez pas à cette partie"
                          : ""
                      }
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateScore(game.id, "blue", true)}
                      disabled={!userInGame || isUpdatingScore === game.id}
                      className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        !userInGame
                          ? "Vous ne participez pas à cette partie"
                          : ""
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Joueurs */}
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-300 mb-2">
                  Joueurs
                </div>
                <div className="space-y-2">
                  {game.players?.map((player, index) => {
                    const isCurrentUser = currentUser && player.user.id === currentUser.id;
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between text-sm p-2 rounded-lg transition-all ${
                          isCurrentUser
                            ? "bg-green-500/10 border border-green-500/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              player.team_color === "RED"
                                ? "bg-red-400"
                                : "bg-blue-400"
                            }`}
                          ></span>
                          <span className={`font-medium ${isCurrentUser ? "text-green-400" : "text-white"}`}>
                            {player.user.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">
                              Vous
                            </span>
                          )}
                          <span className="text-slate-400">({player.role})</span>
                        </div>
                        <div className="text-slate-400">
                          {player.goals}⚽ {player.assists}🅰️ {player.saves}🛡️
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEndGame(game.id)}
                  disabled={!userInGame || isEndingGame === game.id}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  title={
                    !userInGame
                      ? "Vous ne participez pas à cette partie"
                      : ""
                  }
                >
                  {isEndingGame === game.id ? "Fin..." : "Terminer"}
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {filteredGames.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune partie en cours
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm
                ? "Aucune partie ne correspond à votre recherche"
                : "Il n'y a pas de parties en cours pour le moment"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreateGameModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300"
              >
                Créer la première partie
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de création de partie */}
      <CreateGameModal
        isOpen={isCreateGameModalOpen}
        onClose={() => {
          setIsCreateGameModalOpen(false);
          setPreselectedTableId(undefined);
        }}
        onSubmit={handleCreateGame}
        tables={tables}
        myReservations={myReservations}
        availableUsers={users}
        isLoading={isCreatingGame}
        selectedTableId={preselectedTableId}
      />
    </div>
  );
}
