import api from "./api";

export interface PlayerInput {
  user_id: string;          // uuid
  team_color: "RED" | "BLUE";
  role: "ATTACK" | "DEFENSE";
}

export interface CreateGamePayload {
  table_id: string;         // uuid
  players: PlayerInput[];   // 2 to 4 players
}

export interface Game {
  id: string;
  table_id: string;
  team_red_score: number;
  team_blue_score: number;
  is_finished: boolean;
  created_at: string;
  updated_at: string;
  // add other fields your backend returns
}

export const gamesService = {
  // GET /api/games/live
  async getLiveGames() {
    const res = await api.get<Game[]>("/api/games/live");
    return res.data;
  },

  // GET /api/games/:id
  async getGameById(id: string) {
    const res = await api.get<Game>(`/api/games/${id}`);
    return res.data;
  },

  // POST /api/games (auth required)
  async createGame(payload: CreateGamePayload) {
    const res = await api.post<Game>("/api/games", payload);
    return res.data;
  },

  // PATCH /api/games/:id/score (auth required)
  async updateGameScore(id: string, data: { team_red_score?: number; team_blue_score?: number }) {
    const res = await api.patch<Game>(`/api/games/${id}/score`, data);
    return res.data;
  },

  // POST /api/games/:id/end (auth required)
  async endGame(id: string) {
    const res = await api.post<Game>(`/api/games/${id}/end`);
    return res.data;
  },
};
