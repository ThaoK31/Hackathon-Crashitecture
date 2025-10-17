import React, { useState, useEffect } from "react";
import { Table, tableService } from "../services/tables";
import {
  CreateReservationData,
  reservationService,
} from "../services/reservations";
import { Game, gameService } from "../services/games";
import TableCard from "../components/TableCard";
import ReservationModal from "../components/ReservationModal";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>();
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [tablesResponse, gamesResponse] = await Promise.all([
        tableService.getTables(),
        gameService.getLiveGames(),
      ]);

      setTables(tablesResponse.data.tables);
      setGames(gamesResponse.data.games);
    } catch (err: any) {
      console.error("Erreur lors du chargement des tables:", err);
      setError("Erreur lors du chargement des tables");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserveTable = (tableId: string) => {
    setSelectedTableId(tableId);
    setIsReservationModalOpen(true);
  };

  const handleCreateReservation = async (data: CreateReservationData) => {
    try {
      setIsCreatingReservation(true);
      await reservationService.createReservation(data);
      setIsReservationModalOpen(false);
      setSelectedTableId(undefined);
      // Optionnel: recharger les tables pour mettre à jour le statut
      await fetchTables();
    } catch (err: any) {
      console.error("Erreur lors de la création de la réservation:", err);
      setError("Erreur lors de la création de la réservation");
    } finally {
      setIsCreatingReservation(false);
    }
  };

  const filteredTables = tables.filter((table) => {
    // Calculer le statut réel de la table
    const isMaintenance = table.condition === "NEEDS_MAINTENANCE";
    const hasOngoingGame = games.some(
      (game) => game.table_id === table.id && !game.is_finished
    );
    const isAvailable = !isMaintenance && !hasOngoingGame && table.is_available;
    const isOccupied = hasOngoingGame;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && isAvailable) ||
      (statusFilter === "unavailable" &&
        !table.is_available &&
        !isMaintenance &&
        !isOccupied) ||
      (statusFilter === "occupied" && isOccupied) ||
      (statusFilter === "maintenance" && isMaintenance);

    const matchesCondition =
      conditionFilter === "all" || table.condition === conditionFilter;
    const matchesSearch =
      searchTerm === "" ||
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCondition && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Tables de Babyfoot
          </h1>
          <p className="text-slate-400">
            Réservez votre table et commencez à jouer !
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Nom ou localisation..."
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
                <option value="all">Tous</option>
                <option value="available">Disponible</option>
                <option value="occupied">Occupé</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Non disponible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Condition
              </label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Bon</option>
                <option value="WORN">Usé</option>
                <option value="NEEDS_MAINTENANCE">Maintenance requise</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchTables}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              games={games}
              onReserve={handleReserveTable}
            />
          ))}
        </div>

        {filteredTables.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune table trouvée
            </h3>
            <p className="text-slate-400">
              {searchTerm || statusFilter !== "all" || conditionFilter !== "all"
                ? "Essayez de modifier vos filtres"
                : "Aucune table disponible pour le moment"}
            </p>
          </div>
        )}
      </div>

      {/* Modal de réservation */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => {
          setIsReservationModalOpen(false);
          setSelectedTableId(undefined);
        }}
        onSubmit={handleCreateReservation}
        tables={tables.filter((t) => t.is_available)}
        selectedTableId={selectedTableId}
        isLoading={isCreatingReservation}
      />
    </div>
  );
}
