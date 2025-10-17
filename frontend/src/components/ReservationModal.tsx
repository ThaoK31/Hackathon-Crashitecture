import React, { useState, useEffect } from "react";
import { Table } from "../services/tables";
import { CreateReservationData } from "../services/reservations";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReservationData) => Promise<void>;
  tables: Table[];
  selectedTableId?: string;
  isLoading?: boolean;
}

export default function ReservationModal({
  isOpen,
  onClose,
  onSubmit,
  tables,
  selectedTableId,
  isLoading = false,
}: ReservationModalProps) {
  const [formData, setFormData] = useState<CreateReservationData>({
    table_id: selectedTableId || "",
    start_time: "",
    end_time: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedTableId) {
      setFormData((prev) => ({ ...prev, table_id: selectedTableId }));
    }
  }, [selectedTableId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.table_id) {
      newErrors.table_id = "Veuillez sélectionner une table";
    }

    if (!formData.start_time) {
      newErrors.start_time = "Veuillez sélectionner une heure de début";
    }

    if (!formData.end_time) {
      newErrors.end_time = "Veuillez sélectionner une heure de fin";
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);

      if (end <= start) {
        newErrors.end_time = "L'heure de fin doit être après l'heure de début";
      }

      // Vérifier que la réservation est dans le futur
      if (start <= new Date()) {
        newErrors.start_time = "La réservation doit être dans le futur";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Convertir les dates au format ISO complet
    const dataToSend = {
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
    };

    try {
      await onSubmit(dataToSend);
    } catch (err: any) {
      // Afficher l'erreur dans le modal si c'est un conflit
      if (err.response?.status === 409) {
        setErrors({
          general: err.response?.data?.message || "Ce créneau est déjà réservé",
        });
      }
    }
  };

  const handleClose = () => {
    setFormData({
      table_id: selectedTableId || "",
      start_time: "",
      end_time: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Nouvelle Réservation
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Table
            </label>
            <select
              value={formData.table_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, table_id: e.target.value }))
              }
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!selectedTableId}
            >
              <option value="">Sélectionner une table</option>
              {tables
                .filter((table) => table.is_available)
                .map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} - {table.location}
                  </option>
                ))}
            </select>
            {errors.table_id && (
              <p className="text-red-400 text-sm mt-1">{errors.table_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Heure de début
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, start_time: e.target.value }))
              }
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.start_time && (
              <p className="text-red-400 text-sm mt-1">{errors.start_time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Heure de fin
            </label>
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, end_time: e.target.value }))
              }
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.end_time && (
              <p className="text-red-400 text-sm mt-1">{errors.end_time}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
