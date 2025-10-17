import React, { useState, useEffect } from "react";
import { Reservation, reservationService } from "../../services/reservations";

export default function ManageReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reservationService.getAllReservations();
      setReservations(response.data.reservations);
    } catch (err: any) {
      console.error("Erreur lors du chargement des réservations:", err);
      setError("Erreur lors du chargement des réservations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      setIsCancelling(id);
      await reservationService.cancelReservation(id);
      await fetchReservations(); // Recharger les données
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
        .includes(searchTerm.toLowerCase()) ||
      reservation.user?.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.user?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      dateFilter === "" ||
      new Date(reservation.start_time).toDateString() ===
        new Date(dateFilter).toDateString();

    return matchesStatus && matchesSearch && matchesDate;
  });

  // Statistiques
  const stats = {
    total: reservations.length,
    active: reservations.filter((r) => r.status === "ACTIVE").length,
    cancelled: reservations.filter((r) => r.status === "CANCELLED").length,
    completed: reservations.filter((r) => r.status === "COMPLETED").length,
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des Réservations
          </h1>
          <p className="text-slate-400">
            Administrez toutes les réservations du système
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
              {stats.active}
            </div>
            <div className="text-slate-400 text-sm">Actives</div>
          </div>
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">
              {stats.cancelled}
            </div>
            <div className="text-slate-400 text-sm">Annulées</div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">
              {stats.completed}
            </div>
            <div className="text-slate-400 text-sm">Terminées</div>
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
                placeholder="Table, utilisateur, email..."
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
                onClick={fetchReservations}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des réservations */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {reservation.user?.username || "Utilisateur inconnu"}
                        </div>
                        <div className="text-sm text-slate-400">
                          {reservation.user?.email || "Email inconnu"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {reservation.table?.name || "Table inconnue"}
                        </div>
                        <div className="text-sm text-slate-400">
                          {reservation.table?.location ||
                            "Localisation inconnue"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-white">
                          {formatDateTime(reservation.start_time)}
                        </div>
                        <div className="text-sm text-slate-400">
                          → {formatDateTime(reservation.end_time)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {getStatusText(reservation.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {reservation.status === "ACTIVE" && (
                        <button
                          onClick={() =>
                            handleCancelReservation(reservation.id)
                          }
                          disabled={isCancelling === reservation.id}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCancelling === reservation.id
                            ? "Annulation..."
                            : "Annuler"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredReservations.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune réservation
            </h3>
            <p className="text-slate-400">
              {searchTerm || statusFilter !== "all" || dateFilter
                ? "Aucune réservation ne correspond à vos filtres"
                : "Il n'y a pas de réservations dans le système"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
