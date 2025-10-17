import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from './services/authService';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import HistoryPage from './pages/History';
import TablesPage from './pages/Tables';
import ReservationsPage from './pages/Reservations';
import GamesPage from './pages/Games';
import ManageTablesPage from './pages/admin/ManageTables';
import ManageUsersPage from './pages/admin/ManageUsers';
import ManageReservationsPage from './pages/admin/ManageReservations';
import ManageGamesPage from './pages/admin/ManageGames';
import StatsPage from './pages/admin/Stats';
import NavBar from './components/NavBar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      console.log('Auth check:', { authenticated, currentUser });
      setIsAuthenticated(authenticated);
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();

    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);
    
    // Écouter les changements de localStorage depuis la même fenêtre
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      if (key === 'token' || key === 'user') {
        setTimeout(checkAuth, 100); // Petit délai pour s'assurer que les données sont sauvegardées
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App h-screen w-screen flex flex-col overflow-hidden">
        <NavBar 
          userRole={isAuthenticated ? (user?.role || 'user') : null} 
          username={user?.username}
        />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route 
              path="/login" 
              element={<LoginPage onLoginSuccess={() => {
                const currentUser = authService.getCurrentUser();
                console.log('Login success, user:', currentUser);
                setIsAuthenticated(true);
                setUser(currentUser);
              }} />}
            />
            <Route 
              path="/" 
              element={<HomePage />}
            />
            <Route 
              path="/history" 
              element={<HistoryPage />}
            />
            <Route 
              path="/tables" 
              element={<TablesPage />}
            />
            <Route 
              path="/reservations" 
              element={<ReservationsPage />}
            />
            <Route 
              path="/games" 
              element={<GamesPage />}
            />
            <Route 
              path="/admin/tables" 
              element={<ManageTablesPage />}
            />
            <Route 
              path="/admin/users" 
              element={<ManageUsersPage />}
            />
            <Route 
              path="/admin/reservations" 
              element={<ManageReservationsPage />}
            />
            <Route 
              path="/admin/games" 
              element={<ManageGamesPage />}
            />
            <Route 
              path="/admin/stats" 
              element={<StatsPage />}
            />
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
