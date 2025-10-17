import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

interface NavBarProps {
  userRole?: "USER" | "ADMIN" | null;
  username?: string;
}

export default function NavBar({ userRole, username }: NavBarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  console.log("userRole", userRole);

  // NavBar pour les utilisateurs non connectés
  if (!userRole) {
    return (
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo Babynov" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-white">Babynov</h1>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  // Simuler une connexion utilisateur
                  localStorage.setItem("token", "fake-token");
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      id: "1",
                      email: "user@test.com",
                      username: "TestUser",
                      role: "user",
                    })
                  );
                  window.location.reload();
                }}
                className="btn-secondary text-sm"
              >
                Test User
              </button>
              <button
                onClick={() => {
                  // Simuler une connexion admin
                  localStorage.setItem("token", "fake-token");
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      id: "2",
                      email: "admin@test.com",
                      username: "TestAdmin",
                      role: "admin",
                    })
                  );
                  window.location.reload();
                }}
                className="btn-secondary text-sm"
              >
                Test Admin
              </button>
              <Link to="/login" className="btn-secondary text-sm">
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // NavBar pour les utilisateurs connectés (USER)
  if (userRole === "USER") {
    return (
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo Babynov" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-white">Babynov</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                to="/tables"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Tables
              </Link>
              <Link
                to="/reservations"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Mes Réservations
              </Link>
              <Link
                to="/games"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Parties
              </Link>
              <Link
                to="/history"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Historique
              </Link>

              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{username}</p>
                    <p className="text-xs text-slate-400">Utilisateur</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Déconnexion
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  // NavBar pour les administrateurs
  if (userRole === "ADMIN") {
    return (
      <header className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-red-900/20 backdrop-blur-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo Babynov" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-white">
                Babyfoot Ynov <span className="text-purple-400">Admin</span>
              </h1>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                to="/admin/tables"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Gestion Tables
              </Link>
              <Link
                to="/admin/users"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Utilisateurs
              </Link>
              <Link
                to="/admin/reservations"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Réservations
              </Link>
              <Link
                to="/admin/games"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Parties
              </Link>
              <Link
                to="/history"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Historique
              </Link>
              <Link
                to="/admin/stats"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Statistiques
              </Link>

              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-purple-500/30">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{username}</p>
                    <p className="text-xs text-purple-400 font-medium">
                      Administrateur
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-purple-400/50">
                    <span className="text-white text-xs font-medium">
                      {username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Déconnexion
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return null;
}
