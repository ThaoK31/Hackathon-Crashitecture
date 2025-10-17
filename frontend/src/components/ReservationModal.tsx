import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import { Table } from "../services/tables";
import { CreateReservationData } from "../services/reservations";
import { reservationSchema, type ReservationFormData, DURATION_OPTIONS } from "../schemas";

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
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ReservationFormData>({
    table_id: selectedTableId || "",
    start_time: "",
    duration: 15, // 15 minutes par défaut
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDuration, setCustomDuration] = useState<number>(60);

  useEffect(() => {
    if (selectedTableId) {
      setFormData((prev) => ({ ...prev, table_id: selectedTableId }));
    }
  }, [selectedTableId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation avec Zod
    const result = reservationSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({});

    // Calculer l'heure de début et de fin
    let startDate = new Date(formData.start_time);
    const now = new Date();
    
    // Si la date de début est dans le passé, utiliser l'heure actuelle
    // Cela évite les erreurs si l'utilisateur a pris du temps à remplir le formulaire
    if (startDate < now) {
      startDate = now;
    }
    
    const endDate = new Date(startDate.getTime() + formData.duration * 60000); // Ajouter la durée en millisecondes

    const dataToSend: CreateReservationData = {
      table_id: formData.table_id,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
    };

    try {
      await onSubmit(dataToSend);
      // Rediriger vers la page Games et ouvrir le modal de création de partie avec la table sélectionnée
      navigate("/games", { state: { openCreateModal: true, selectedTableId: formData.table_id } });
    } catch (err: any) {
      // Afficher l'erreur dans le modal
      if (err.response?.status === 409) {
        setErrors({
          general: err.response?.data?.message || "Ce créneau est déjà réservé pour cette table. Veuillez choisir un autre créneau.",
        });
      } else if (err.response?.status === 400) {
        setErrors({
          general: err.response?.data?.message || "Impossible de créer la réservation. Vérifiez vos dates.",
        });
      } else {
        setErrors({
          general: err.response?.data?.message || "Une erreur est survenue lors de la création de la réservation",
        });
      }
    }
  };

  // Fonction pour réserver maintenant (remplit la date/heure de début)
  const handleReserveNow = () => {
    if (!formData.table_id) {
      setErrors({ general: "Veuillez sélectionner une table" });
      return;
    }

    setErrors({});

    // Remplir automatiquement la date et l'heure de début avec l'heure actuelle
    const now = new Date();
    setFormData((prev) => ({
      ...prev,
      start_time: formatDateForInput(now),
    }));
  };

  const handleClose = () => {
    setFormData({
      table_id: selectedTableId || "",
      start_time: "",
      duration: 15,
    });
    setErrors({});
    setIsCustomDuration(false);
    setCustomDuration(60);
    onClose();
  };

  // Fonction pour obtenir les erreurs de champ
  const getFieldError = (field: string): string | undefined => {
    return errors[field];
  };

  // Calculer l'heure de fin pour l'affichage
  const getEndTime = () => {
    if (!formData.start_time) return null;
    const startDate = new Date(formData.start_time);
    const endDate = new Date(startDate.getTime() + formData.duration * 60000);
    return endDate;
  };

  // Fonction pour convertir une date en format datetime-local sans perte de timezone
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

          {/* Sélection de la table */}
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
            {getFieldError("table_id") && (
              <p className="text-red-400 text-sm mt-1">
                {getFieldError("table_id")}
              </p>
            )}
            
            {/* Bouton "Réserver maintenant" */}
            {formData.table_id && !formData.start_time && (
              <button
                type="button"
                onClick={handleReserveNow}
                disabled={isLoading}
                className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⚡ Maintenant
              </button>
            )}
          </div>

          {/* Séparateur OU */}
          {formData.table_id && !formData.start_time && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/95 text-slate-400">OU</span>
              </div>
            </div>
          )}

          {/* Sélection de la date et heure de début */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📅 Date et heure de début
            </label>
            <DatePicker
              selected={formData.start_time ? new Date(formData.start_time) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setFormData((prev) => ({
                    ...prev,
                    start_time: formatDateForInput(date),
                  }));
                }
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              placeholderText="Sélectionner une date et heure"
              minDate={new Date()}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              wrapperClassName="w-full"
              calendarClassName="bg-slate-800 border border-white/10 rounded-lg"
            />
            {getFieldError("start_time") && (
              <p className="text-red-400 text-sm mt-1">
                {getFieldError("start_time")}
              </p>
            )}
          </div>

          {/* Sélection de la durée */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ⏱️ Durée de la réservation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, duration: option.value }));
                    setIsCustomDuration(false);
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.duration === option.value && !isCustomDuration
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCustomDuration(true);
                  setFormData((prev) => ({ ...prev, duration: customDuration }));
                }}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isCustomDuration
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-white/10"
                }`}
              >
                ⚙️ Autre
              </button>
            </div>

            {/* Champ personnalisé */}
            {isCustomDuration && (
              <div className="mt-3">
                <label className="block text-xs text-slate-400 mb-1">
                  Durée personnalisée (en minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={customDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 15;
                    setCustomDuration(value);
                    setFormData((prev) => ({ ...prev, duration: value }));
                  }}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Durée en minutes (15-180)"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Durée entre 15 minutes et 3 heures
                </p>
              </div>
            )}

            {getFieldError("duration") && (
              <p className="text-red-400 text-sm mt-1">
                {getFieldError("duration")}
              </p>
            )}
          </div>

          {/* Affichage du résumé */}
          {formData.start_time && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="text-xs text-blue-400 font-medium mb-1">
                📋 Résumé de la réservation
              </div>
              <div className="text-sm text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-400">Début :</span>{" "}
                  {new Date(formData.start_time).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
                <div>
                  <span className="text-slate-400">Fin :</span>{" "}
                  {getEndTime()?.toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
                <div>
                  <span className="text-slate-400">Durée :</span>{" "}
                  {formData.duration} minutes (
                  {formData.duration >= 60
                    ? `${Math.floor(formData.duration / 60)}h${formData.duration % 60 ? ` ${formData.duration % 60}min` : ""}`
                    : `${formData.duration}min`}
                  )
                </div>
              </div>
            </div>
          )}

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
              {isLoading ? "Création..." : "Réserver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
