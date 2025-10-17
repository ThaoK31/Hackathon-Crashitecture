import React, { useState, useEffect } from "react";
import { Table, CreateTableData, UpdateTableData } from "../services/tables";
import { tableSchema, type TableFormData } from "../schemas";

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTableData | UpdateTableData) => void;
  table?: Table | null;
  isLoading?: boolean;
}

export default function TableFormModal({
  isOpen,
  onClose,
  onSubmit,
  table,
  isLoading = false,
}: TableFormModalProps) {
  const [formData, setFormData] = useState<TableFormData>({
    name: "",
    location: "",
    condition: "GOOD",
    is_available: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (table) {
      setFormData({
        name: table.name,
        location: table.location,
        condition: table.condition,
        is_available: table.is_available,
      });
    } else {
      setFormData({
        name: "",
        location: "",
        condition: "GOOD",
        is_available: true,
      });
    }
  }, [table]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation avec Zod
    const result = tableSchema.safeParse(formData);

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
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      location: "",
      condition: "GOOD",
      is_available: true,
    });
    setErrors({});
    onClose();
  };

  // Fonction pour obtenir les erreurs de champ
  const getFieldError = (field: string): string | undefined => {
    return errors[field];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {table ? "Modifier la table" : "Nouvelle table"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Table 1"
            />
            {getFieldError("name") && (
              <p className="text-red-400 text-sm mt-1">
                {getFieldError("name")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Localisation
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Salle A, Niveau 1"
            />
            {getFieldError("location") && (
              <p className="text-red-400 text-sm mt-1">
                {getFieldError("location")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Condition
            </label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  condition: e.target.value as any,
                }))
              }
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Bon</option>
              <option value="WORN">Usé</option>
              <option value="NEEDS_MAINTENANCE">Maintenance requise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Disponibilité
            </label>
            <select
              value={formData.is_available ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_available: e.target.value === "true",
                }))
              }
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Disponible</option>
              <option value="false">Non disponible</option>
            </select>
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
              {isLoading ? "Enregistrement..." : table ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
