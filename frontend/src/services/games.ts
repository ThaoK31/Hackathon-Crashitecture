import api from "./api";

export interface Player {
  id: string;
  user_id: string;
  team_color: "RED" | "BLUE";
  role: "ATTACK" | "DEFENSE";
  goals: number;
  assists: number;
  saves: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

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
  ended_at?: string;
  players: Player[];
  table?: {
    id: string;
    name: string;
    location: string;
  };
}

export interface GameHistory {
  games: Game[];
  total: number;
}

export const gameService = {
  // GET /api/games/live
  async getLiveGames(): Promise<{ success: boolean; data: { games: Game[] } }> {
    const response = await api.get('/games/live');
    return response.data;
  },

  // GET /api/games/history
  async getHistory(): Promise<{ success: boolean; data: GameHistory }> {
    const response = await api.get('/games/history');
    return response.data;
  },

  // GET /api/games/:id
  async getGameById(id: string): Promise<{ success: boolean; data: { game: Game } }> {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  // POST /api/games (auth required)
  async createGame(payload: CreateGamePayload): Promise<{ success: boolean; data: { game: Game } }> {
    const response = await api.post('/games', payload);
    return response.data;
  },

  // PATCH /api/games/:id/score (auth required)
  async updateScore(id: string, data: { team_red_score?: number; team_blue_score?: number }): Promise<{ success: boolean; data: { game: Game } }> {
    const response = await api.patch(`/games/${id}/score`, data);
    return response.data;
  },

  // PATCH /api/games/:id/end (auth required)
  async endGame(id: string): Promise<{ success: boolean; data: { game: Game } }> {
    const response = await api.patch(`/games/${id}/end`);
    return response.data;
  },
};
