import api from './api';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      role: string;
    };
    token: string;
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      role: string;
    };
    token: string;
  };
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export const authService = {
  // Connexion
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    
    // Sauvegarder le token et l'utilisateur
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // Déclencher un événement pour notifier l'App
      window.dispatchEvent(new CustomEvent('authChange'));
    }
    
    return response.data;
  },

  // Inscription
  register: async (
    email: string,
    username: string,
    password: string
  ): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', {
      email,
      username,
      password,
    });
    
    // Sauvegarder le token et l'utilisateur
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Récupérer le profil
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Déclencher un événement personnalisé pour notifier l'App
    window.dispatchEvent(new CustomEvent('authChange'));
    window.location.href = '/login';
  },

  // Vérifier si connecté
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Vérifier si admin
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'ADMIN';
  },
};
