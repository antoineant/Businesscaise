import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'game_master' | 'player';
}

export interface Game {
  id: string;
  title: string;
  description: string | null;
  game_master_id: string;
  start_date: string | null;
  end_date: string | null;
  current_session_id: string | null;
  status: 'setup' | 'active' | 'paused' | 'completed';
  settings: any;
  created_at: string;
  updated_at: string;
  archetype_id?: string;
  industry_id?: string;
  archetype_name?: string;
  industry_name?: string;
}

export interface Team {
  id: string;
  game_id: string;
  name: string;
  color: string;
  members: string[];
  metrics: {
    financial: number;
    hr: number;
    market_communication: number;
    operations: number;
    customer_satisfaction: number;
  };
  overall_score: number;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  level1_state?: any; // Level1TeamState from level1-types.ts
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  game_id: string;
  session_number: number;
  day: string;
  period: 'AM' | 'PM';
  title: string;
  description: string | null;
  unlock_type: 'manual' | 'scheduled';
  scheduled_unlock_time: string | null;
  actual_unlock_time: string | null;
  deadline: string | null;
  status: 'locked' | 'active' | 'completed';
  challenges: any;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  team_id: string;
  session_id: string;
  challenge_id: string;
  submission_data: any;
  file_urls: string[] | null;
  submitted_at: string;
  scored_at: string | null;
  score: number | null;
  feedback: string | null;
  status: 'pending' | 'scored' | 'rejected';
}

// Authentication API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role?: 'game_master' | 'player';
  }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;

    // Store token and user in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },
};

// Game Master API
export const gmAPI = {
  // Game management
  createGame: async (data: {
    title: string;
    description?: string;
    settings?: any;
  }): Promise<{ game: Game; sessions: Session[] }> => {
    const response = await apiClient.post('/gm/games', data);
    return response.data;
  },

  listGames: async (): Promise<Game[]> => {
    const response = await apiClient.get('/gm/games');
    return response.data.games;
  },

  getGameDetails: async (gameId: string): Promise<{
    game: Game;
    teams: Team[];
    sessions: Session[];
  }> => {
    const response = await apiClient.get(`/gm/games/${gameId}`);
    return response.data;
  },

  updateGame: async (gameId: string, data: Partial<Game>) => {
    const response = await apiClient.put(`/gm/games/${gameId}`, data);
    return response.data;
  },

  deleteGame: async (gameId: string) => {
    const response = await apiClient.delete(`/gm/games/${gameId}`);
    return response.data;
  },

  // Game control
  startGame: async (gameId: string) => {
    const response = await apiClient.post(`/gm/games/${gameId}/start`);
    return response.data;
  },

  pauseGame: async (gameId: string) => {
    const response = await apiClient.post(`/gm/games/${gameId}/pause`);
    return response.data;
  },

  resumeGame: async (gameId: string) => {
    const response = await apiClient.post(`/gm/games/${gameId}/resume`);
    return response.data;
  },

  // Session management
  listSessions: async (gameId: string): Promise<Session[]> => {
    const response = await apiClient.get(`/gm/games/${gameId}/sessions`);
    return response.data.sessions;
  },

  unlockSession: async (gameId: string, sessionId: string) => {
    const response = await apiClient.post(
      `/gm/games/${gameId}/sessions/${sessionId}/unlock`
    );
    return response.data;
  },

  updateSession: async (
    gameId: string,
    sessionId: string,
    data: Partial<Session>
  ) => {
    const response = await apiClient.put(
      `/gm/games/${gameId}/sessions/${sessionId}`,
      data
    );
    return response.data;
  },

  // Team monitoring
  listTeams: async (gameId: string): Promise<Team[]> => {
    const response = await apiClient.get(`/gm/games/${gameId}/teams`);
    return response.data.teams;
  },

  getTeamDetails: async (gameId: string, teamId: string): Promise<Team> => {
    const response = await apiClient.get(`/gm/games/${gameId}/teams/${teamId}`);
    return response.data.team;
  },

  getTeamHistory: async (gameId: string, teamId: string) => {
    const response = await apiClient.get(
      `/gm/games/${gameId}/teams/${teamId}/history`
    );
    return response.data.history;
  },

  // Submissions and scoring
  listSubmissions: async (gameId: string, status?: string): Promise<Submission[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/gm/games/${gameId}/submissions`, {
      params,
    });
    return response.data.submissions;
  },

  getSubmissionDetails: async (submissionId: string): Promise<Submission> => {
    const response = await apiClient.get(`/gm/submissions/${submissionId}`);
    return response.data.submission;
  },

  scoreSubmission: async (submissionId: string, score: number, feedback?: string) => {
    const response = await apiClient.post(`/gm/submissions/${submissionId}/score`, {
      score,
      feedback,
    });
    return response.data;
  },

  // Analytics
  getLeaderboard: async (gameId: string) => {
    const response = await apiClient.get(`/gm/games/${gameId}/leaderboard`);
    return response.data.leaderboard;
  },

  getAnalytics: async (gameId: string) => {
    const response = await apiClient.get(`/gm/games/${gameId}/analytics`);
    return response.data;
  },
};

// Team/Player API
export const teamAPI = {
  joinGame: async (data: {
    game_id: string;
    team_name: string;
    color?: string;
    members?: string[];
  }): Promise<Team> => {
    const response = await apiClient.post('/teams/join', data);
    return response.data.team;
  },

  getCurrentTeam: async (teamId: string): Promise<Team> => {
    const response = await apiClient.get(`/teams/current/${teamId}`);
    return response.data.team;
  },

  getDashboard: async (teamId: string) => {
    const response = await apiClient.get(`/teams/${teamId}/dashboard`);
    return response.data;
  },

  getCurrentSession: async (teamId: string): Promise<Session> => {
    const response = await apiClient.get(`/teams/${teamId}/sessions/current`);
    return response.data.session;
  },

  getSessionChallenges: async (teamId: string, sessionId: string) => {
    const response = await apiClient.get(
      `/teams/${teamId}/sessions/${sessionId}/challenges`
    );
    return response.data;
  },

  submitDecision: async (
    teamId: string,
    data: {
      session_id: string;
      challenge_id: string;
      submission_data: any;
      file_urls?: string[];
    }
  ) => {
    const response = await apiClient.post(`/teams/${teamId}/submit`, data);
    return response.data;
  },

  getLatestResults: async (teamId: string) => {
    const response = await apiClient.get(`/teams/${teamId}/results/latest`);
    return response.data;
  },

  getMetricsHistory: async (teamId: string) => {
    const response = await apiClient.get(`/teams/${teamId}/history`);
    return response.data.history;
  },

  getLeaderboard: async (teamId: string) => {
    const response = await apiClient.get(`/teams/${teamId}/leaderboard`);
    return response.data.leaderboard;
  },

  getTeamPod: async (teamId: string) => {
    const response = await apiClient.get(`/teams/${teamId}/pod`);
    return response.data;
  },

  getPodLeaderboard: async (teamId: string) => {
    const response = await apiClient.get(`/teams/${teamId}/pod/leaderboard`);
    return response.data;
  },

  getTeamCategories: async (teamId: string) => {
    const response = await apiClient.get(`/teams/${teamId}/categories`);
    return response.data;
  },
};

// File Upload API
export const uploadAPI = {
  uploadFiles: async (files: File[], gameId: string, teamId: string) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('game_id', gameId);
    formData.append('team_id', teamId);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.files;
  },
};

// Export the axios instance for custom requests
export default apiClient;
