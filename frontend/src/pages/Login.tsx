import React, { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(email, password);
      console.log("Login success:", response);
      onLoginSuccess?.();
      navigate("/");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Erreur de connexion au serveur";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si déjà connecté
  const isAlreadyLoggedIn = authService.isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 animate-bounce-gentle">
            <img src="/logo.png" alt="Logo Babynov" className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Babynov
          </h1>
          <p className="text-slate-300 text-lg">
            Connectez-vous pour réserver un babyfoot
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 animate-slide-up">
          {isAlreadyLoggedIn && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-green-400">✅</span>
              <div>
                <p className="text-green-300 font-medium">
                  Vous êtes déjà connecté !
                </p>
                <p className="text-green-400 text-sm">
                  Vous pouvez vous déconnecter ou continuer vers l'accueil.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                <span className="text-red-400">⚠️</span>
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@ynov.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="input-field"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-200"
                >
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="input-field"
              />
            </div>

            {/* Test Account Hint */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
                <span>💡</span>
                <span>Compte test : admin@ynov.com / password123</span>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-300 cursor-pointer"
              >
                Se souvenir de moi
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                "Se connecter"
              )}
            </button>

            {/* Already logged in actions */}
            {isAlreadyLoggedIn && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="btn-secondary flex-1"
                >
                  Aller à l'accueil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    authService.logout();
                  }}
                  className="btn-secondary flex-1"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <span className="text-slate-400 text-sm">
              Pas encore de compte ?{" "}
            </span>
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Hackathon Ynov Toulouse 2025 - Team Crashitecture ⚽
        </p>
      </div>
    </div>
  );
}
