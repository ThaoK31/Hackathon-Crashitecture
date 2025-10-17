import React, { useState } from "react";
import { Table } from "../services/tables";
import { CreateGamePayload, PlayerInput } from "../services/games";

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGamePayload) => void;
  tables: Table[];
  availableUsers: Array<{ id: string; username: string; email: string }>;
  isLoading?: boolean;
}

export default function CreateGameModal({
  isOpen,
  onClose,
  onSubmit,
  tables,
  availableUsers,
  isLoading = false,
}: CreateGameModalProps) {
  const [formData, setFormData] = useState<CreateGamePayload>({
    table_id: "",
    players: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddPlayer = () => {
    if (formData.players.length < 4) {
      setFormData((prev) => ({
        ...prev,
        players: [
          ...prev.players,
          { user_id: "", team_color: "RED", role: "ATTACK" },
        ],
      }));
    }
  };

  const handleRemovePlayer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index),
    }));
  };

  const handlePlayerChange = (
    index: number,
    field: keyof PlayerInput,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      players: prev.players.map((player, i) =>
        i === index ? { ...player, [field]: value } : player
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.table_id) {
      newErrors.table_id = "Veuillez sélectionner une table";
    }

    if (formData.players.length < 2) {
      newErrors.players = "Au moins 2 joueurs sont requis";
    }

    // Vérifier que tous les joueurs ont un user_id
    const hasEmptyPlayers = formData.players.some((player) => !player.user_id);
    if (hasEmptyPlayers) {
      newErrors.players = "Tous les joueurs doivent être sélectionnés";
    }

    // Vérifier qu'il n'y a pas de doublons
    const userIds = formData.players.map((p) => p.user_id).filter(Boolean);
    const uniqueUserIds = new Set(userIds);
    if (userIds.length !== uniqueUserIds.size) {
      newErrors.players =
        "Un joueur ne peut pas être sélectionné plusieurs fois";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      table_id: "",
      players: [],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Créer une Partie</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Joueurs ({formData.players.length}/4)
              </label>
              <button
                type="button"
                onClick={handleAddPlayer}
                disabled={formData.players.length >= 4}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Ajouter un joueur
              </button>
            </div>

            {formData.players.map((player, index) => (
              <div
                key={index}
                className="bg-slate-800/30 border border-white/10 rounded-lg p-4 mb-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-300 text-sm">
                    Joueur {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕ Supprimer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Utilisateur
                    </label>
                    <select
                      value={player.user_id}
                      onChange={(e) =>
                        handlePlayerChange(index, "user_id", e.target.value)
                      }
                      className="w-full bg-slate-700/50 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner...</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Équipe
                    </label>
                    <select
                      value={player.team_color}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "team_color",
                          e.target.value as "RED" | "BLUE"
                        )
                      }
                      className="w-full bg-slate-700/50 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="RED">🔴 Rouge</option>
                      <option value="BLUE">🔵 Bleue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Rôle
                    </label>
                    <select
                      value={player.role}
                      onChange={(e) =>
                        handlePlayerChange(
                          index,
                          "role",
                          e.target.value as "ATTACK" | "DEFENSE"
                        )
                      }
                      className="w-full bg-slate-700/50 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="ATTACK">⚡ Attaque</option>
                      <option value="DEFENSE">🛡️ Défense</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {errors.players && (
              <p className="text-red-400 text-sm mt-1">{errors.players}</p>
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
              {isLoading ? "Création..." : "Créer la partie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
