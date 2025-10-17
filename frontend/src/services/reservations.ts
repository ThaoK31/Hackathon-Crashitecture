import api from './api';

export interface Reservation {
  id: string;
  user_id: string;
  table_id: string;
  start_time: string;
  end_time: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  table?: {
    id: string;
    name: string;
    location: string;
  };
}

export interface CreateReservationData {
  table_id: string;
  start_time: string;
  end_time: string;
}

export const reservationService = {
  // Récupérer mes réservations
  async getMyReservations(): Promise<{ success: boolean; data: { reservations: Reservation[] } }> {
    const response = await api.get('/reservations/my');
    return response.data;
  },

  // Récupérer toutes les réservations (admin)
  async getAllReservations(): Promise<{ success: boolean; data: { reservations: Reservation[] } }> {
    const response = await api.get('/reservations');
    return response.data;
  },

  // Créer une réservation
  async createReservation(data: CreateReservationData): Promise<{ success: boolean; data: { reservation: Reservation } }> {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  // Annuler une réservation
  async cancelReservation(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  }
};