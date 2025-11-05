import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockTeamAPI, mockAuthAPI, mockGmAPI } from './mock-api.client';

describe('Mock API Client', () => {
  describe('mockAuthAPI', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await mockAuthAPI.login('demo-gm@businesscaise.com', 'demo123');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('demo-gm@businesscaise.com');
      expect(result.token).toContain('mock-token');
    });

    it('should reject invalid credentials', async () => {
      await expect(
        mockAuthAPI.login('invalid@email.com', 'wrong')
      ).rejects.toThrow();
    });
  });

  describe('mockTeamAPI', () => {
    it('should accept team_name parameter and map to name', async () => {
      // This tests the bug fix - API should accept team_name (not name)
      const teamData = {
        game_id: 'game-demo-001',
        team_name: 'Test Squad', // Using team_name (frontend format)
        color: '#FF0000',
        members: ['Player 1'],
      };

      const team = await mockTeamAPI.createTeam(teamData);

      expect(team).toBeDefined();
      expect(team.name).toBe('Test Squad'); // Should be stored as 'name' internally
      expect(team.color).toBe('#FF0000');
      expect(team.game_id).toBe('game-demo-001');
    });

    it('should use default color if not provided', async () => {
      const team = await mockTeamAPI.createTeam({
        game_id: 'game-demo-001',
        team_name: 'Blue Team',
      });

      expect(team.color).toBe('#3B82F6'); // Default blue
    });

    it('should use empty members array if not provided', async () => {
      const team = await mockTeamAPI.createTeam({
        game_id: 'game-demo-001',
        team_name: 'Solo Team',
      });

      expect(team.members).toEqual([]);
    });

    it('should retrieve dashboard data for team', async () => {
      // Create a team first
      const team = await mockTeamAPI.createTeam({
        game_id: 'game-demo-001',
        team_name: 'Dashboard Test Team',
        color: '#00FF00',
      });

      // Get dashboard data
      const dashboard = await mockTeamAPI.getDashboardData(team.id);

      expect(dashboard.team).toBeDefined();
      expect(dashboard.team.id).toBe(team.id);
      expect(dashboard.game).toBeDefined();
      expect(dashboard.game.id).toBe('game-demo-001');
      expect(dashboard.current_session).toBeDefined();
      expect(dashboard.sessions).toBeInstanceOf(Array);
      expect(dashboard.submissions).toBeInstanceOf(Array);
      expect(dashboard.metrics_history).toBeInstanceOf(Array);
    });

    it('should get team details', async () => {
      const team = await mockTeamAPI.createTeam({
        game_id: 'game-demo-001',
        team_name: 'Details Test Team',
      });

      const details = await mockTeamAPI.getTeamDetails(team.id);

      expect(details).toBeDefined();
      expect(details.id).toBe(team.id);
      expect(details.name).toBe('Details Test Team');
    });

    it('should throw error for non-existent team', async () => {
      await expect(
        mockTeamAPI.getTeamDetails('team-nonexistent')
      ).rejects.toThrow('Team not found');
    });
  });

  describe('mockGmAPI', () => {
    it('should get list of games', async () => {
      const games = await mockGmAPI.listGames();

      expect(games).toBeInstanceOf(Array);
      expect(games.length).toBeGreaterThan(0);
      expect(games[0].id).toBe('game-demo-001');
    });

    it('should create a new game', async () => {
      const gameData = {
        title: 'New Integration Test Game',
        description: 'Test description',
      };

      const result = await mockGmAPI.createGame(gameData);

      expect(result).toBeDefined();
      expect(result.game).toBeDefined();
      expect(result.game.title).toBe('New Integration Test Game');
      expect(result.game.status).toBe('setup'); // Games start in 'setup' status
      expect(result.sessions).toBeInstanceOf(Array);
    });

    it('should get game details', async () => {
      const result = await mockGmAPI.getGameDetails('game-demo-001');

      expect(result).toBeDefined();
      expect(result.game).toBeDefined();
      expect(result.game.id).toBe('game-demo-001');
      expect(result.game.title).toContain('Demo Business Simulation');
      expect(result.teams).toBeInstanceOf(Array);
      expect(result.sessions).toBeInstanceOf(Array);
    });

    it('should get leaderboard for game', async () => {
      const result = await mockGmAPI.getLeaderboard('game-demo-001');

      expect(result.leaderboard).toBeInstanceOf(Array);
      // Should have pre-loaded demo teams
      expect(result.leaderboard.length).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete full player join and dashboard flow', async () => {
      // 1. Create a team (player joins game)
      const team = await mockTeamAPI.createTeam({
        game_id: 'game-demo-001',
        team_name: 'E2E Test Team',
        color: '#FF00FF',
        members: ['Alice', 'Bob'],
      });

      expect(team.id).toBeDefined();

      // 2. Get dashboard data immediately after creation
      const dashboard = await mockTeamAPI.getDashboardData(team.id);

      expect(dashboard.team.id).toBe(team.id);
      expect(dashboard.game.title).toContain('Demo Business Simulation');

      // 3. Get team details
      const details = await mockTeamAPI.getTeamDetails(team.id);

      expect(details.name).toBe('E2E Test Team');
      expect(details.members).toEqual(['Alice', 'Bob']);

      // 4. Get leaderboard
      const leaderboard = await mockTeamAPI.getLeaderboard(team.id);

      expect(leaderboard.leaderboard).toBeInstanceOf(Array);
      expect(leaderboard.leaderboard.some((t: any) => t.id === team.id)).toBe(true);
    });

    it('should handle localStorage team ID scenario', async () => {
      // Simulate: User creates team, saves ID to localStorage, refreshes page
      // On refresh, MockDataStore resets but localStorage still has the ID

      // 1. Create team
      const team = await mockTeamAPI.createTeam({
        game_id: 'game-demo-001',
        team_name: 'Storage Test Team',
      });

      const teamId = team.id;

      // 2. Simulate finding the team (should work)
      const foundTeam = await mockTeamAPI.getTeamDetails(teamId);
      expect(foundTeam.id).toBe(teamId);

      // 3. Simulate trying to find a stale ID (from previous session)
      // This should throw error which PlayerGame.tsx will catch
      await expect(
        mockTeamAPI.getTeamDetails('team-stale-12345')
      ).rejects.toThrow('Team not found');
    });
  });
});
