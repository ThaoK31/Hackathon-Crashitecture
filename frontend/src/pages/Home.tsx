import React, { useEffect, useState } from "react";
import { authService } from "../services/authService";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-auto">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1>Welcome {user?.username}</h1>
        <button onClick={handleLogout}>Logout</button>
      </main>
    </div>
  );
}
