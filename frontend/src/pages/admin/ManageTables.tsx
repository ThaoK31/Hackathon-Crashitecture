import React, { useState, useEffect } from "react";
import {
  Table,
  tableService,
  CreateTableData,
  UpdateTableData,
} from "../../services/tables";
import { Game, gameService } from "../../services/games";
import TableFormModal from "../../components/TableFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function ManageTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    tableId: string | null;
    tableName: string | null;
  }>({
    isOpen: false,
    tableId: null,
    tableName: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleCreateTable = () => {
    setEditingTable(null);
    setIsFormModalOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setIsFormModalOpen(true);
  };

  const handleSubmitTable = async (data: CreateTableData | UpdateTableData) => {
    try {
      setIsSaving(true);
      if (editingTable) {
        await tableService.updateTable(
          editingTable.id,
          data as UpdateTableData
        );
      } else {
        await tableService.createTable(data as CreateTableData);
      }
      setIsFormModalOpen(false);
      setEditingTable(null);
      await fetchTables();
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError("Erreur lors de l'enregistrement de la table");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!deleteDialog.tableId) return;

    try {
      setIsDeleting(true);
      await tableService.deleteTable(deleteDialog.tableId);
      setDeleteDialog({ isOpen: false, tableId: null, tableName: null });
      await fetchTables();
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de la table");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable
      ? "text-green-400 bg-green-400/10 border-green-400/20"
      : "text-red-400 bg-red-400/10 border-red-400/20";
  };

  const getStatusText = (isAvailable: boolean) => {
    return isAvailable ? "Disponible" : "Non disponible";
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

  // Statistiques dynamiques
  const stats = {
    total: tables.length,
    available: tables.filter((t) => {
      const hasGame = games.some((g) => g.table_id === t.id && !g.is_finished);
      return !hasGame && t.is_available && t.condition !== "NEEDS_MAINTENANCE";
    }).length,
    occupied: games
      .filter((g) => !g.is_finished)
      .map((g) => g.table_id)
      .filter((v, i, a) => a.indexOf(v) === i).length,
    maintenance: tables.filter((t) => t.condition === "NEEDS_MAINTENANCE")
      .length,
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestion des Tables
              </h1>
              <p className="text-slate-400">
                Administrez toutes les tables de babyfoot
              </p>
            </div>
            <button
              onClick={handleCreateTable}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              + Nouvelle table
            </button>
          </div>
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
            <div className="text-slate-400 text-sm">Total Tables</div>
          </div>
          <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {stats.available}
            </div>
            <div className="text-slate-400 text-sm">Disponibles</div>
          </div>
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">
              {stats.occupied}
            </div>
            <div className="text-slate-400 text-sm">Occupées</div>
          </div>
          <div className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.maintenance}
            </div>
            <div className="text-slate-400 text-sm">Maintenance</div>
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
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTables.map((table) => {
                  // Calculer le statut pour cette table
                  const isMaintenance = table.condition === "NEEDS_MAINTENANCE";
                  const hasOngoingGame = games.some(
                    (game) => game.table_id === table.id && !game.is_finished
                  );

                  let tableStatus;
                  if (isMaintenance) {
                    tableStatus = {
                      text: "Maintenance",
                      color:
                        "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
                    };
                  } else if (hasOngoingGame) {
                    tableStatus = {
                      text: "Occupé",
                      color: "text-red-400 bg-red-400/10 border-red-400/20",
                    };
                  } else if (table.is_available) {
                    tableStatus = {
                      text: "Disponible",
                      color:
                        "text-green-400 bg-green-400/10 border-green-400/20",
                    };
                  } else {
                    tableStatus = {
                      text: "Non disponible",
                      color:
                        "text-slate-400 bg-slate-400/10 border-slate-400/20",
                    };
                  }

                  return (
                    <tr key={table.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {table.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          {table.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${tableStatus.color}`}
                        >
                          {tableStatus.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${getConditionColor(
                            table.condition
                          )}`}
                        >
                          {getConditionText(table.condition)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTable(table)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                tableId: table.id,
                                tableName: table.name,
                              })
                            }
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredTables.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune table
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || statusFilter !== "all" || conditionFilter !== "all"
                ? "Aucune table ne correspond à vos filtres"
                : "Il n'y a pas de tables dans le système"}
            </p>
            {!searchTerm &&
              statusFilter === "all" &&
              conditionFilter === "all" && (
                <button
                  onClick={handleCreateTable}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300"
                >
                  Créer la première table
                </button>
              )}
          </div>
        )}
      </div>

      {/* Table Form Modal */}
      <TableFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTable(null);
        }}
        onSubmit={handleSubmitTable}
        table={editingTable}
        isLoading={isSaving}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Supprimer la table"
        message={`Êtes-vous sûr de vouloir supprimer la table "${deleteDialog.tableName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteTable}
        onCancel={() =>
          setDeleteDialog({ isOpen: false, tableId: null, tableName: null })
        }
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
