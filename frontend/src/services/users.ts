import api from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
}

export const userService = {
  // Récupérer tous les utilisateurs (admin)
  async getAllUsers(): Promise<{ success: boolean; data: { users: User[] } }> {
    const response = await api.get('/users');
    return response.data;
  },

  // Récupérer un utilisateur par ID
  async getUserById(id: string): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Mettre à jour un utilisateur
  async updateUser(id: string, data: UpdateUserData): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Supprimer un utilisateur
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Changer le rôle d'un utilisateur
  async changeUserRole(id: string, role: 'USER' | 'ADMIN'): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.post(`/users/${id}/role`, { role });
    return response.data;
  }
};