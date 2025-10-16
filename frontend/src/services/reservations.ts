import api from "./api";

export interface Reservation {
  id: string;
  table_id: string; // uuid
  user_id: string;  // uuid
  start_time: string; // ISO datetime
  end_time: string;   // ISO datetime
  created_at: string;
  // add any other response fields
}

export interface CreateReservationPayload {
  table_id: string;
  start_time: string; // ISO
  end_time: string;   // ISO
}

export const reservationsService = {
  // GET /api/reservations (admin, auth)
  async getAllReservations() {
    const res = await api.get<Reservation[]>("/api/reservations");
    return res.data;
  },

  // GET /api/reservations/my (auth)
  async getMyReservations() {
    const res = await api.get<Reservation[]>("/api/reservations/my");
    return res.data;
  },

  // POST /api/reservations (auth)
  async createReservation(payload: CreateReservationPayload) {
    const res = await api.post<Reservation>("/api/reservations", payload);
    return res.data;
  },

  // DELETE /api/reservations/:id (auth)
  async cancelReservation(id: string) {
    const res = await api.delete<{ success: boolean }>(`/api/reservations/${id}`);
    return res.data;
  },
};
