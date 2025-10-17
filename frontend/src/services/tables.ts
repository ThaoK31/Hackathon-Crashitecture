import api from './api';

export interface Table {
  id: string;
  name: string;
  location: string;
  condition: 'EXCELLENT' | 'GOOD' | 'WORN' | 'NEEDS_MAINTENANCE';
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableAvailability {
  table_id: string;
  is_available: boolean;
  next_available_time?: string;
  current_game_id?: string;
}

export interface CreateTableData {
  name: string;
  location: string;
  condition: 'EXCELLENT' | 'GOOD' | 'WORN' | 'NEEDS_MAINTENANCE';
  is_available: boolean;
}

export interface UpdateTableData {
  name?: string;
  location?: string;
  condition?: 'EXCELLENT' | 'GOOD' | 'WORN' | 'NEEDS_MAINTENANCE';
  is_available?: boolean;
}

export const tableService = {
  // Récupérer toutes les tables
  async getTables(): Promise<{ success: boolean; data: { tables: Table[] } }> {
    const response = await api.get('/tables');
    return response.data;
  },

  // Récupérer une table par ID
  async getTableById(id: string): Promise<{ success: boolean; data: { table: Table } }> {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  // Récupérer la disponibilité d'une table
  async getTableAvailability(id: string): Promise<{ success: boolean; data: TableAvailability }> {
    const response = await api.get(`/tables/${id}/availability`);
    return response.data;
  },

  // Créer une nouvelle table (admin)
  async createTable(data: CreateTableData): Promise<{ success: boolean; data: { table: Table } }> {
    const response = await api.post('/tables', data);
    return response.data;
  },

  // Mettre à jour une table (admin)
  async updateTable(id: string, data: UpdateTableData): Promise<{ success: boolean; data: { table: Table } }> {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  // Supprimer une table (admin)
  async deleteTable(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  }
};