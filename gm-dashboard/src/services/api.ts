import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gm_token');
      localStorage.removeItem('gm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', { ...data, role: 'game_master' }),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getCurrentUser: () => api.get('/auth/me'),
};

export const gameAPI = {
  createGame: (data: {
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }) => api.post('/gm/games', data),

  getGames: () => api.get('/gm/games'),

  getGame: (id: string) => api.get(`/gm/games/${id}`),

  updateGame: (id: string, data: Partial<{
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  }>) => api.put(`/gm/games/${id}`, data),

  deleteGame: (id: string) => api.delete(`/gm/games/${id}`),

  startGame: (id: string) => api.post(`/gm/games/${id}/start`),

  pauseGame: (id: string) => api.post(`/gm/games/${id}/pause`),

  resumeGame: (id: string) => api.post(`/gm/games/${id}/resume`),

  getSessions: (gameId: string) => api.get(`/gm/games/${gameId}/sessions`),

  unlockSession: (gameId: string, sessionId: string) =>
    api.post(`/gm/games/${gameId}/sessions/${sessionId}/unlock`),

  updateSession: (gameId: string, sessionId: string, data: {
    title?: string;
    description?: string;
    deadline?: string;
    narrative?: string;
  }) => api.put(`/gm/games/${gameId}/sessions/${sessionId}`, data),

  getTeams: (gameId: string) => api.get(`/gm/games/${gameId}/teams`),

  getTeamDetails: (gameId: string, teamId: string) =>
    api.get(`/gm/games/${gameId}/teams/${teamId}`),

  getTeamHistory: (gameId: string, teamId: string) =>
    api.get(`/gm/games/${gameId}/teams/${teamId}/history`),

  getLeaderboard: (gameId: string) => api.get(`/gm/games/${gameId}/leaderboard`),

  getAnalytics: (gameId: string) => api.get(`/gm/games/${gameId}/analytics`),
};

export const submissionAPI = {
  getSubmissions: (gameId: string) => api.get(`/gm/games/${gameId}/submissions`),

  getSubmissionDetails: (submissionId: string) => api.get(`/gm/submissions/${submissionId}`),

  scoreSubmission: (submissionId: string, data: {
    score: number;
    feedback?: string;
  }) => api.post(`/gm/submissions/${submissionId}/score`, data),
};

export default api;
