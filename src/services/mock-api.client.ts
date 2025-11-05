// Mock API Client for UX Testing Mode
// Wraps the mock data store with the same interface as the real API client

import { mockDataStore } from './mock-data.service';
import type { User, Game, Team, Session, Submission } from './api.client';

// Simulate network delay for realistic UX
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Authentication API
export const mockAuthAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role?: 'game_master' | 'player';
  }) => {
    await delay();
    return mockDataStore.register({ ...data, role: data.role || 'player' });
  },

  login: async (email: string, password: string) => {
    await delay();
    return mockDataStore.login(email, password);
  },

  logout: async () => {
    await delay();
    mockDataStore.logout();
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(100);
    return mockDataStore.getCurrentUser();
  },
};

// Mock Game Master API
export const mockGmAPI = {
  createGame: async (data: { title: string; description?: string }): Promise<{ game: Game; sessions: Session[] }> => {
    await delay(500);
    return mockDataStore.createGame(data);
  },

  listGames: async (): Promise<Game[]> => {
    await delay();
    return mockDataStore.getGames();
  },

  getGameDetails: async (gameId: string): Promise<{ game: Game; teams: Team[]; sessions: Session[] }> => {
    await delay();
    return mockDataStore.getGameDetails(gameId);
  },

  startGame: async (gameId: string) => {
    await delay();
    return mockDataStore.startGame(gameId);
  },

  pauseGame: async (gameId: string) => {
    await delay();
    return mockDataStore.pauseGame(gameId);
  },

  resumeGame: async (gameId: string) => {
    await delay();
    return mockDataStore.resumeGame(gameId);
  },

  listSessions: async (gameId: string): Promise<Session[]> => {
    await delay();
    const { sessions } = mockDataStore.getGameDetails(gameId);
    return sessions;
  },

  unlockSession: async (gameId: string, sessionId: string) => {
    await delay();
    return mockDataStore.unlockSession(gameId, sessionId);
  },

  updateSession: async (gameId: string, sessionId: string, data: Partial<Session>) => {
    await delay();
    // Mock implementation
    return { session: data };
  },

  listTeams: async (gameId: string): Promise<Team[]> => {
    await delay();
    return mockDataStore.listTeams(gameId);
  },

  getTeamDetails: async (gameId: string, teamId: string): Promise<Team> => {
    await delay();
    return mockDataStore.getTeamDetails(teamId);
  },

  getTeamHistory: async (gameId: string, teamId: string) => {
    await delay();
    // Mock history data
    return { history: [] };
  },

  listSubmissions: async (gameId: string, status?: string): Promise<Submission[]> => {
    await delay();
    return mockDataStore.listSubmissions(gameId, status);
  },

  getSubmissionDetails: async (submissionId: string): Promise<Submission> => {
    await delay();
    // Find submission in store
    const allSubmissions = mockDataStore.getState().submissions;
    const submission = allSubmissions.find((s) => s.id === submissionId);
    if (!submission) throw new Error('Submission not found');
    return submission;
  },

  scoreSubmission: async (submissionId: string, score: number, feedback?: string) => {
    await delay(500);
    return mockDataStore.scoreSubmission(submissionId, score, feedback);
  },

  getLeaderboard: async (gameId: string) => {
    await delay();
    return mockDataStore.getLeaderboard(gameId);
  },

  getGameAnalytics: async (gameId: string) => {
    await delay();
    // Mock analytics
    return { analytics: {} };
  },
};

// Mock Team API
export const mockTeamAPI = {
  createTeam: async (data: {
    game_id: string;
    team_name: string;
    color?: string;
    members?: string[];
  }): Promise<Team> => {
    await delay(500);
    console.log('[mockTeamAPI] createTeam called with:', data);
    // Map team_name to name for internal storage
    const team = mockDataStore.createTeam({
      game_id: data.game_id,
      name: data.team_name,
      color: data.color || '#3B82F6',
      members: data.members || [],
    });
    console.log('[mockTeamAPI] createTeam returning team:', team.id);
    return team;
  },

  getTeamDetails: async (teamId: string): Promise<Team> => {
    await delay();
    return mockDataStore.getTeamDetails(teamId);
  },

  getDashboardData: async (teamId: string) => {
    await delay();
    console.log('[mockTeamAPI] getDashboardData called with teamId:', teamId);
    return mockDataStore.getDashboardData(teamId);
  },

  submitDecision: async (teamId: string, data: any) => {
    await delay(800);
    return mockDataStore.submitDecision(teamId, data);
  },

  getLatestResults: async (teamId: string) => {
    await delay();
    return { results: {} };
  },

  getMetricsHistory: async (teamId: string) => {
    await delay();
    return [];
  },

  getLeaderboard: async (teamId: string) => {
    await delay();
    return mockDataStore.getTeamLeaderboard(teamId);
  },
};

// Mock Upload API
export const mockUploadAPI = {
  uploadFiles: async (files: File[], gameId: string, teamId: string): Promise<string[]> => {
    await delay(1000); // Simulate longer upload time
    return mockDataStore.uploadFiles(files, gameId, teamId);
  },
};

// Mock WebSocket Service
export class MockWebSocketService {
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private connected: boolean = false;

  connect(token?: string): void {
    console.log('[Mock WebSocket] Connecting...');
    setTimeout(() => {
      this.connected = true;
      this.emit('connect', { timestamp: new Date().toISOString() });
      console.log('[Mock WebSocket] Connected');
    }, 500);
  }

  disconnect(): void {
    console.log('[Mock WebSocket] Disconnecting...');
    this.connected = false;
    this.emit('disconnect', { timestamp: new Date().toISOString() });
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  joinGame(gameId: string): void {
    console.log(`[Mock WebSocket] Joined game: ${gameId}`);
  }

  leaveGame(gameId: string): void {
    console.log(`[Mock WebSocket] Left game: ${gameId}`);
  }

  joinTeam(teamId: string): void {
    console.log(`[Mock WebSocket] Joined team: ${teamId}`);
  }

  leaveTeam(teamId: string): void {
    console.log(`[Mock WebSocket] Left team: ${teamId}`);
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Simulate real-time events (called by mock API actions)
  simulateSessionUnlocked(gameId: string, sessionData: any): void {
    setTimeout(() => {
      this.emit('session:unlocked', {
        session: sessionData,
        timestamp: new Date().toISOString(),
      });
    }, 100);
  }

  simulateSubmissionScored(teamId: string, data: any): void {
    setTimeout(() => {
      this.emit('submission:scored', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }, 100);
  }

  simulateMetricsUpdated(teamId: string, metrics: any): void {
    setTimeout(() => {
      this.emit('metrics:updated', {
        metrics,
        timestamp: new Date().toISOString(),
      });
    }, 100);
  }

  simulateLeaderboardUpdated(gameId: string, leaderboard: any): void {
    setTimeout(() => {
      this.emit('leaderboard:updated', {
        leaderboard,
        timestamp: new Date().toISOString(),
      });
    }, 100);
  }

  simulateGameStarted(gameId: string): void {
    setTimeout(() => {
      this.emit('game:started', {
        gameId,
        timestamp: new Date().toISOString(),
      });
    }, 100);
  }
}

export const mockWebSocketService = new MockWebSocketService();
