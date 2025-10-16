import api from './api';

export const gameService = {
  getHistory: async () => {
    const response = await api.get('/games/history');
    return response.data;
  },

  getGameById: async (id: string) => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  }
};
