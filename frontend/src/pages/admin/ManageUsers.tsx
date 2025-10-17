import React, { useState, useEffect } from "react";
import { User, userService } from "../../services/users";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Confirm dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    username: string | null;
  }>({
    isOpen: false,
    userId: null,
    username: null,
  });
  const [roleDialog, setRoleDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    username: string | null;
    newRole: "USER" | "ADMIN" | null;
  }>({
    isOpen: false,
    userId: null,
    username: null,
    newRole: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getAllUsers();
      setUsers(response.data.users);
    } catch (err: any) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;

    try {
      setIsDeleting(true);
      await userService.deleteUser(deleteDialog.userId);
      setDeleteDialog({ isOpen: false, userId: null, username: null });
      await fetchUsers();
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeRole = async () => {
    if (!roleDialog.userId || !roleDialog.newRole) return;

    try {
      setIsChangingRole(true);
      await userService.changeUserRole(roleDialog.userId, roleDialog.newRole);
      setRoleDialog({
        isOpen: false,
        userId: null,
        username: null,
        newRole: null,
      });
      await fetchUsers();
    } catch (err: any) {
      console.error("Erreur lors du changement de rôle:", err);
      setError("Erreur lors du changement de rôle");
    } finally {
      setIsChangingRole(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSearch =
      searchTerm === "" ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesSearch;
  });

  // Statistiques
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    users: users.filter((u) => u.role === "USER").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-400">
            Administrez tous les utilisateurs du système
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-slate-400 text-sm">Total Utilisateurs</div>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">
              {stats.admins}
            </div>
            <div className="text-slate-400 text-sm">Administrateurs</div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">
              {stats.users}
            </div>
            <div className="text-slate-400 text-sm">Utilisateurs</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Username ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="USER">Utilisateurs</option>
                <option value="ADMIN">Administrateurs</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchUsers}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-white">
                          {user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                          user.role === "ADMIN"
                            ? "text-purple-400 bg-purple-400/10 border-purple-400/20"
                            : "text-blue-400 bg-blue-400/10 border-blue-400/20"
                        }`}
                      >
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setRoleDialog({
                              isOpen: true,
                              userId: user.id,
                              username: user.username,
                              newRole: user.role === "ADMIN" ? "USER" : "ADMIN",
                            })
                          }
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {user.role === "ADMIN" ? "👤 → User" : "👑 → Admin"}
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              userId: user.id,
                              username: user.username,
                            })
                          }
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun utilisateur
            </h3>
            <p className="text-slate-400">
              {searchTerm || roleFilter !== "all"
                ? "Aucun utilisateur ne correspond à vos filtres"
                : "Il n'y a pas d'utilisateurs dans le système"}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${deleteDialog.username}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteUser}
        onCancel={() =>
          setDeleteDialog({ isOpen: false, userId: null, username: null })
        }
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Confirm Role Change Dialog */}
      <ConfirmDialog
        isOpen={roleDialog.isOpen}
        title="Changer le rôle"
        message={`Êtes-vous sûr de vouloir changer le rôle de "${roleDialog.username}" en ${roleDialog.newRole} ?`}
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={handleChangeRole}
        onCancel={() =>
          setRoleDialog({
            isOpen: false,
            userId: null,
            username: null,
            newRole: null,
          })
        }
        isLoading={isChangingRole}
        variant="warning"
      />
    </div>
  );
}
