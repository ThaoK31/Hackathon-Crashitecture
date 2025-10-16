import React from "react";

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
      username: string;
    };
  }>;
}

interface GameCardProps {
  game: Game;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function GameCard({
  game,
  isExpanded,
  onToggle,
}: GameCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResult = () => {
    if (game.team_red_score > game.team_blue_score) {
      return {
        winner: "RED",
        score: `${game.team_red_score} - ${game.team_blue_score}`,
      };
    } else if (game.team_blue_score > game.team_red_score) {
      return {
        winner: "BLUE",
        score: `${game.team_red_score} - ${game.team_blue_score}`,
      };
    } else {
      return {
        winner: "DRAW",
        score: `${game.team_red_score} - ${game.team_blue_score}`,
      };
    }
  };

  const result = getResult();
  const isVictory = result.winner === "RED" || result.winner === "BLUE";

  const redPlayers = game.players.filter((p) => p.team_color === "RED");
  const bluePlayers = game.players.filter((p) => p.team_color === "BLUE");

  // Calculer la durée de la partie si started_at est disponible
  const getGameDuration = () => {
    // Pour l'instant, on simule une durée car started_at n'est pas dans l'interface
    return "15 min";
  };

  // Trouver le MVP (joueur avec le plus de buts)
  const getMVP = () => {
    const allPlayers = [...redPlayers, ...bluePlayers];
    return allPlayers.reduce((mvp, player) =>
      player.goals > mvp.goals ? player : mvp
    );
  };

  const mvp = getMVP();
  const maxGoals = Math.max(...game.players.map((p) => p.goals));

  return (
    <div
      className={`card cursor-pointer transition-all duration-300 hover:bg-white/15 hover:shadow-2xl active:scale-[0.99] shadow-xl ${
        result.winner === "RED"
          ? "border-l-4 border-red-500"
          : result.winner === "BLUE"
          ? "border-l-4 border-blue-500"
          : "border-l-4 border-slate-500"
      }`}
      onClick={onToggle}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🏓</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {game.table.name}
              </h3>
              <p className="text-slate-400 text-sm">
                {game.table.location} • {formatDate(game.ended_at)} •{" "}
                {getGameDuration()}
              </p>
              {result.winner !== "DRAW" && (
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`text-xs font-medium ${
                      result.winner === "RED" ? "text-red-400" : "text-blue-400"
                    }`}
                  >
                    🏆 Équipe {result.winner === "RED" ? "Rouge" : "Bleue"}{" "}
                    gagnante
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {result.score}
              </p>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isVictory
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {isVictory ? "VICTOIRE" : "DÉFAITE"}
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <svg
                className={`w-6 h-6 transition-colors duration-300 ${
                  isExpanded
                    ? "text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Vue étendue */}
      <div
        className={`overflow-hidden transition-all duration-1000 ease-in-out ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 border-t border-white/10">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-red-400">
                Équipe Rouge
              </h4>
              <span className="text-2xl font-bold text-red-400">
                {game.team_red_score}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redPlayers.map((player, index) => (
                <div
                  key={index}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-white">
                      {player.user.username}
                    </h5>
                    <span className="text-sm text-red-400 font-medium">
                      {player.role === "ATTACK" ? "Attaquant" : "Défense"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-slate-400">Buts</p>
                      <p className="text-white font-semibold">{player.goals}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Passes</p>
                      <p className="text-white font-semibold">
                        {player.assists}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Arrêts</p>
                      <p className="text-white font-semibold">{player.saves}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Séparateur stylisé */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span className="text-slate-400 text-sm font-medium">VS</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Équipe Bleue */}
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-blue-400">
                Équipe Bleue
              </h4>
              <span className="text-2xl font-bold text-blue-400">
                {game.team_blue_score}
              </span>
              <div className="ml-auto text-sm text-slate-400">
                Total: {bluePlayers.reduce((sum, p) => sum + p.goals, 0)} buts
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bluePlayers.map((player, index) => (
                <div
                  key={index}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-white">
                      {player.user.username}
                    </h5>
                    <span className="text-sm text-blue-400 font-medium">
                      {player.role === "ATTACK" ? "Attaquant" : "Défense"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-slate-400">Buts</p>
                      <p className="text-white font-semibold">{player.goals}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Passes</p>
                      <p className="text-white font-semibold">
                        {player.assists}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Arrêts</p>
                      <p className="text-white font-semibold">{player.saves}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
