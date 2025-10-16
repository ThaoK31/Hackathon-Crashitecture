import api from "./api";

export interface User {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
}

export const usersService = {
  // GET /api/users (admin, auth)
  async getAllUsers() {
    const res = await api.get<User[]>("/api/users");
    return res.data;
  },

  // GET /api/users/:id (owner or admin, auth)
  async getUserById(id: string) {
    const res = await api.get<User>(`/api/users/${id}`);
    return res.data;
  },

  // PUT /api/users/:id (owner or admin, auth)
  async updateUser(id: string, payload: Partial<Pick<User, "email" | "username">>) {
    const res = await api.put<User>(`/api/users/${id}`, payload);
    return res.data;
  },

  // DELETE /api/users/:id (admin, auth)
  async deleteUser(id: string) {
    const res = await api.delete<{ success: boolean }>(`/api/users/${id}`);
    return res.data;
  },

  // PATCH /api/users/:id/role (admin, auth)
  async changeUserRole(id: string, role: "USER" | "ADMIN") {
    const res = await api.patch<User>(`/api/users/${id}/role`, { role });
    return res.data;
  },
};
