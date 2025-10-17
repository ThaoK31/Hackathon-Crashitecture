import React, { useState, useEffect } from "react";
import { Reservation, reservationService } from "../services/reservations";
import { Table, tableService } from "../services/tables";
import ReservationModal from "../components/ReservationModal";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [reservationsResponse, tablesResponse] = await Promise.all([
        reservationService.getMyReservations(),
        tableService.getTables(),
      ]);

      setReservations(reservationsResponse.data.reservations);
      setTables(tablesResponse.data.tables);
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReservation = async (data: any) => {
    try {
      setIsCreatingReservation(true);
      setError(null);
      await reservationService.createReservation(data);
      setIsReservationModalOpen(false);
      await fetchData(); // Recharger les données
    } catch (err: any) {
      console.error("Erreur lors de la création de la réservation:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Erreur lors de la création de la réservation";
      setError(errorMessage);
      throw err; // Propager l'erreur au modal
    } finally {
      setIsCreatingReservation(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      setIsCancelling(id);
      await reservationService.cancelReservation(id);
      await fetchData(); // Recharger les données
    } catch (err: any) {
      console.error("Erreur lors de l'annulation de la réservation:", err);
      setError("Erreur lors de l'annulation de la réservation");
    } finally {
      setIsCancelling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "CANCELLED":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "COMPLETED":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "CANCELLED":
        return "Annulée";
      case "COMPLETED":
        return "Terminée";
      default:
        return "Inconnu";
    }
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

  const filteredReservations = reservations.filter((reservation) => {
    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      reservation.table?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.table?.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des réservations...</p>
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
                Mes Réservations
              </h1>
              <p className="text-slate-400">Gérez vos réservations de tables</p>
            </div>
            <button
              onClick={() => setIsReservationModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              + Nouvelle réservation
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Nom de table ou localisation..."
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
                <option value="ACTIVE">Active</option>
                <option value="CANCELLED">Annulée</option>
                <option value="COMPLETED">Terminée</option>
              </select>
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

        {/* Liste des réservations */}
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {reservation.table?.name || "Table inconnue"}
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {getStatusText(reservation.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">📍 Localisation:</span>
                      <p className="text-white">
                        {reservation.table?.location || "Inconnue"}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400">🕐 Début:</span>
                      <p className="text-white">
                        {formatDateTime(reservation.start_time)}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400">🕐 Fin:</span>
                      <p className="text-white">
                        {formatDateTime(reservation.end_time)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {reservation.status === "ACTIVE" && (
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      disabled={isCancelling === reservation.id}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCancelling === reservation.id
                        ? "Annulation..."
                        : "Annuler"}
                    </button>
                  )}

                  <div className="text-right text-xs text-slate-400">
                    <p>Créée le {formatDateTime(reservation.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReservations.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune réservation
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Aucune réservation ne correspond à vos filtres"
                : "Vous n'avez pas encore de réservations"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={() => setIsReservationModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300"
              >
                Créer ma première réservation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de réservation */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onSubmit={handleCreateReservation}
        tables={tables}
        isLoading={isCreatingReservation}
      />
    </div>
  );
}
