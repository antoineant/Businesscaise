// Unified API Client - Routes to real or mock API based on demo mode

import { demoMode } from './demo-mode';
import { authAPI as realAuthAPI, gmAPI as realGmAPI, teamAPI as realTeamAPI, uploadAPI as realUploadAPI } from './api.client';
import { mockAuthAPI, mockGmAPI, mockTeamAPI, mockUploadAPI } from './mock-api.client';
import websocketService from './websocket.service';
import { mockWebSocketService } from './mock-api.client';

// Export types from real API
export type { User, Game, Team, Session, Submission } from './api.client';

// Unified Auth API
export const unifiedAuthAPI = {
  register: async (data: any) => {
    return demoMode.isEnabled() ? mockAuthAPI.register(data) : realAuthAPI.register(data);
  },
  login: async (email: string, password: string) => {
    return demoMode.isEnabled() ? mockAuthAPI.login(email, password) : realAuthAPI.login(email, password);
  },
  logout: async () => {
    return demoMode.isEnabled() ? mockAuthAPI.logout() : realAuthAPI.logout();
  },
  getCurrentUser: async () => {
    return demoMode.isEnabled() ? mockAuthAPI.getCurrentUser() : realAuthAPI.getCurrentUser();
  },
};

// Unified GM API
export const unifiedGmAPI = {
  createGame: async (data: any) => {
    return demoMode.isEnabled() ? mockGmAPI.createGame(data) : realGmAPI.createGame(data);
  },
  listGames: async () => {
    return demoMode.isEnabled() ? mockGmAPI.listGames() : realGmAPI.listGames();
  },
  getGameDetails: async (gameId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.getGameDetails(gameId) : realGmAPI.getGameDetails(gameId);
  },
  startGame: async (gameId: string) => {
    const result = demoMode.isEnabled() ? await mockGmAPI.startGame(gameId) : await realGmAPI.startGame(gameId);
    if (demoMode.isEnabled()) {
      mockWebSocketService.simulateGameStarted(gameId);
    }
    return result;
  },
  pauseGame: async (gameId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.pauseGame(gameId) : realGmAPI.pauseGame(gameId);
  },
  resumeGame: async (gameId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.resumeGame(gameId) : realGmAPI.resumeGame(gameId);
  },
  listSessions: async (gameId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.listSessions(gameId) : realGmAPI.listSessions(gameId);
  },
  unlockSession: async (gameId: string, sessionId: string) => {
    const result = demoMode.isEnabled()
      ? await mockGmAPI.unlockSession(gameId, sessionId)
      : await realGmAPI.unlockSession(gameId, sessionId);

    if (demoMode.isEnabled()) {
      mockWebSocketService.simulateSessionUnlocked(gameId, result.session);
    }
    return result;
  },
  updateSession: async (gameId: string, sessionId: string, data: any) => {
    return demoMode.isEnabled()
      ? mockGmAPI.updateSession(gameId, sessionId, data)
      : realGmAPI.updateSession(gameId, sessionId, data);
  },
  listTeams: async (gameId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.listTeams(gameId) : realGmAPI.listTeams(gameId);
  },
  getTeamDetails: async (gameId: string, teamId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.getTeamDetails(gameId, teamId) : realGmAPI.getTeamDetails(gameId, teamId);
  },
  getTeamHistory: async (gameId: string, teamId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.getTeamHistory(gameId, teamId) : realGmAPI.getTeamHistory(gameId, teamId);
  },
  listSubmissions: async (gameId: string, status?: string) => {
    return demoMode.isEnabled() ? mockGmAPI.listSubmissions(gameId, status) : realGmAPI.listSubmissions(gameId, status);
  },
  getSubmissionDetails: async (submissionId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.getSubmissionDetails(submissionId) : realGmAPI.getSubmissionDetails(submissionId);
  },
  scoreSubmission: async (submissionId: string, score: number, feedback?: string) => {
    const result = demoMode.isEnabled()
      ? await mockGmAPI.scoreSubmission(submissionId, score, feedback)
      : await realGmAPI.scoreSubmission(submissionId, score, feedback);

    if (demoMode.isEnabled()) {
      const submission = result.submission;
      mockWebSocketService.simulateSubmissionScored(submission.team_id, {
        score,
        feedback,
        submissionId,
      });

      // Get updated team and leaderboard
      const team = await mockGmAPI.getTeamDetails('game-demo-001', submission.team_id);
      mockWebSocketService.simulateMetricsUpdated(submission.team_id, team.metrics);

      const leaderboard = await mockGmAPI.getLeaderboard('game-demo-001');
      mockWebSocketService.simulateLeaderboardUpdated('game-demo-001', leaderboard.leaderboard);
    }

    return result;
  },
  getLeaderboard: async (gameId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.getLeaderboard(gameId) : realGmAPI.getLeaderboard(gameId);
  },
  getAnalytics: async (gameId: string) => {
    return demoMode.isEnabled() ? mockGmAPI.getGameAnalytics(gameId) : realGmAPI.getAnalytics(gameId);
  },
};

// Unified Team API
export const unifiedTeamAPI = {
  joinGame: async (data: any) => {
    return demoMode.isEnabled() ? mockTeamAPI.createTeam(data) : realTeamAPI.joinGame(data);
  },
  getCurrentTeam: async (teamId: string) => {
    return demoMode.isEnabled() ? mockTeamAPI.getTeamDetails(teamId) : realTeamAPI.getCurrentTeam(teamId);
  },
  getDashboard: async (teamId: string) => {
    return demoMode.isEnabled() ? mockTeamAPI.getDashboardData(teamId) : realTeamAPI.getDashboard(teamId);
  },
  submitDecision: async (teamId: string, data: any) => {
    return demoMode.isEnabled() ? mockTeamAPI.submitDecision(teamId, data) : realTeamAPI.submitDecision(teamId, data);
  },
  getLatestResults: async (teamId: string) => {
    return demoMode.isEnabled() ? mockTeamAPI.getLatestResults(teamId) : realTeamAPI.getLatestResults(teamId);
  },
  getMetricsHistory: async (teamId: string) => {
    return demoMode.isEnabled() ? mockTeamAPI.getMetricsHistory(teamId) : realTeamAPI.getMetricsHistory(teamId);
  },
  getLeaderboard: async (teamId: string) => {
    return demoMode.isEnabled() ? mockTeamAPI.getLeaderboard(teamId) : realTeamAPI.getLeaderboard(teamId);
  },
};

// Unified Upload API
export const unifiedUploadAPI = {
  uploadFiles: async (files: File[], gameId: string, teamId: string) => {
    return demoMode.isEnabled() ? mockUploadAPI.uploadFiles(files, gameId, teamId) : realUploadAPI.uploadFiles(files, gameId, teamId);
  },
};

// Unified WebSocket Service
export const unifiedWebSocketService = {
  connect: (token?: string) => {
    return demoMode.isEnabled() ? mockWebSocketService.connect(token) : websocketService.connect(token);
  },
  disconnect: () => {
    return demoMode.isEnabled() ? mockWebSocketService.disconnect() : websocketService.disconnect();
  },
  on: (event: string, handler: (data: any) => void) => {
    return demoMode.isEnabled() ? mockWebSocketService.on(event, handler) : websocketService.on(event, handler);
  },
  off: (event: string, handler: (data: any) => void) => {
    return demoMode.isEnabled() ? mockWebSocketService.off(event, handler) : websocketService.off(event, handler);
  },
  joinGame: (gameId: string) => {
    return demoMode.isEnabled() ? mockWebSocketService.joinGame(gameId) : websocketService.joinGame(gameId);
  },
  leaveGame: (gameId: string) => {
    return demoMode.isEnabled() ? mockWebSocketService.leaveGame(gameId) : websocketService.leaveGame(gameId);
  },
  joinTeam: (teamId: string) => {
    return demoMode.isEnabled() ? mockWebSocketService.joinTeam(teamId) : websocketService.joinTeam(teamId);
  },
  leaveTeam: (teamId: string) => {
    return demoMode.isEnabled() ? mockWebSocketService.leaveTeam(teamId) : websocketService.leaveTeam(teamId);
  },
  isConnected: () => {
    return demoMode.isEnabled() ? mockWebSocketService.isConnected() : websocketService.isConnected();
  },
};
