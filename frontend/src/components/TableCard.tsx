import React from "react";
import { Table } from "../services/tables";
import { Game } from "../services/games";
import { Reservation } from "../services/reservations";

interface TableCardProps {
  table: Table;
  games: Game[];
  reservations?: Reservation[];
  onReserve?: (tableId: string) => void;
  showReserveButton?: boolean;
}

export default function TableCard({
  table,
  games,
  reservations = [],
  onReserve,
  showReserveButton = true,
}: TableCardProps) {
  // Calculer le statut dynamiquement
  const getTableStatus = () => {
    // 1. Si la table nécessite une maintenance
    if (table.condition === "NEEDS_MAINTENANCE") {
      return {
        text: "Maintenance",
        color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
        canReserve: false,
      };
    }

    // 2. Vérifier si une partie est en cours sur cette table
    const hasOngoingGame = games.some(
      (game) => game.table_id === table.id && game.status === "ONGOING"
    );

    if (hasOngoingGame) {
      return {
        text: "Occupé",
        color: "text-red-400 bg-red-400/10 border-red-400/20",
        canReserve: false,
      };
    }

    // 3. Utiliser is_available
    if (table.is_available) {
      return {
        text: "Disponible",
        color: "text-green-400 bg-green-400/10 border-green-400/20",
        canReserve: true,
      };
    }

    return {
      text: "Non disponible",
      color: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      canReserve: false,
    };
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
        return "text-green-400";
      case "GOOD":
        return "text-blue-400";
      case "WORN":
        return "text-yellow-400";
      case "NEEDS_MAINTENANCE":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
        return "Excellent";
      case "GOOD":
        return "Bon";
      case "WORN":
        return "Usé";
      case "NEEDS_MAINTENANCE":
        return "Maintenance requise";
      default:
        return "Inconnu";
    }
  };

  const status = getTableStatus();

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {table.name}
          </h3>
          <p className="text-slate-400 text-sm">📍 {table.location}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}
        >
          {status.text}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Condition</span>
          <span
            className={`text-sm font-medium ${getConditionColor(
              table.condition
            )}`}
          >
            {getConditionText(table.condition)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">ID</span>
          <span className="text-slate-300 text-sm font-mono">
            {table.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Affichage des réservations futures */}
      {reservations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs font-medium text-slate-400 mb-2">
            📅 Réservations à venir
          </div>
          <div className="space-y-2">
            {reservations.slice(0, 3).map((reservation) => {
              const startDate = new Date(reservation.start_time);
              const endDate = new Date(reservation.end_time);
              return (
                <div
                  key={reservation.id}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-xs"
                >
                  <div className="text-blue-400 font-medium">
                    {startDate.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}{" "}
                    {startDate.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {endDate.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {reservation.user && (
                    <div className="text-slate-400 mt-1">
                      👤 {reservation.user.username}
                    </div>
                  )}
                </div>
              );
            })}
            {reservations.length > 3 && (
              <div className="text-xs text-slate-400 text-center">
                + {reservations.length - 3} autre(s) réservation(s)
              </div>
            )}
          </div>
        </div>
      )}

      {showReserveButton && status.canReserve && onReserve && (
        <button
          onClick={() => onReserve(table.id)}
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          Réserver
        </button>
      )}

      {!status.canReserve && status.text === "Occupé" && (
        <div className="w-full mt-4 bg-red-500/10 text-red-400 py-2 px-4 rounded-lg text-center text-sm font-medium border border-red-500/20">
          🚫 Partie en cours
        </div>
      )}

      {!status.canReserve && status.text === "Maintenance" && (
        <div className="w-full mt-4 bg-yellow-500/10 text-yellow-400 py-2 px-4 rounded-lg text-center text-sm font-medium border border-yellow-500/20">
          🔧 Maintenance requise
        </div>
      )}

      {!status.canReserve && status.text === "Non disponible" && (
        <div className="w-full mt-4 bg-slate-500/10 text-slate-400 py-2 px-4 rounded-lg text-center text-sm font-medium border border-slate-500/20">
          🚫 Non disponible
        </div>
      )}
    </div>
  );
}
