import api from "./api";

export type TableCondition = "EXCELLENT" | "GOOD" | "WORN" | "NEEDS_MAINTENANCE";

export interface Table {
  id: string;
  name: string;
  location?: string;
  condition?: TableCondition;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const tablesService = {
  // GET /api/tables
  async getAllTables() {
    const res = await api.get<Table[]>("/api/tables");
    return res.data;
  },

  // GET /api/tables/:id
  async getTableById(id: string) {
    const res = await api.get<Table>(`/api/tables/${id}`);
    return res.data;
  },

  // GET /api/tables/:id/availability?start_time&end_time
  async getTableAvailability(id: string, params?: { start_time?: string; end_time?: string }) {
    const res = await api.get(`/api/tables/${id}/availability`, { params });
    return res.data; // define type if you have it
  },

  // POST /api/tables (admin, auth)
  async createTable(payload: Partial<Table>) {
    const res = await api.post<Table>("/api/tables", payload);
    return res.data;
  },

  // PUT /api/tables/:id (admin, auth)
  async updateTable(id: string, payload: Partial<Table>) {
    const res = await api.put<Table>(`/api/tables/${id}`, payload);
    return res.data;
  },

  // DELETE /api/tables/:id (admin, auth)
  async deleteTable(id: string) {
    const res = await api.delete<{ success: boolean }>(`/api/tables/${id}`);
    return res.data;
  },
};
