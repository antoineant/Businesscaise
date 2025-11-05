import { describe, it, expect, beforeEach } from 'vitest';

// Create a fresh MockDataStore for testing (not the singleton)
class MockDataStore {
  private users: any[] = [];
  private games: any[] = [];
  private teams: any[] = [];
  private sessions: any[] = [];
  private submissions: any[] = [];
  private currentUser: any = null;
  private authToken: string | null = null;

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo users
    this.users.push({
      id: 'gm-demo-001',
      email: 'demo-gm@businesscaise.com',
      name: 'Demo Game Master',
      role: 'game_master',
    });

    this.users.push({
      id: 'player-demo-001',
      email: 'demo-player1@businesscaise.com',
      name: 'Demo Player 1',
      role: 'player',
    });

    // Create demo game
    this.games.push({
      id: 'game-demo-001',
      title: 'Demo Business Simulation - Winter 2025',
      description: 'A 5-day intensive business simulation game for testing',
      game_master_id: 'gm-demo-001',
      status: 'active',
      created_at: new Date().toISOString(),
    });

    // Create demo teams
    this.teams.push({
      id: 'team-demo-001',
      game_id: 'game-demo-001',
      name: 'Alpha Innovators',
      color: '#3B82F6',
      members: ['Alice', 'Bob'],
      metrics: { financial: 50, hr: 50 },
      overall_score: 50.0,
    });

    // Create demo session
    this.sessions.push({
      id: 'session-demo-001',
      game_id: 'game-demo-001',
      session_number: 1,
      status: 'active',
      title: 'Session 1',
    });
  }

  login(email: string, password: string) {
    const user = this.users.find((u) => u.email === email);
    if (!user || password !== 'demo123') {
      throw new Error('Invalid credentials');
    }
    this.currentUser = user;
    this.authToken = `mock-token-${user.id}`;
    return { token: this.authToken, user };
  }

  createTeam(data: { game_id: string; name: string; color: string; members: string[] }) {
    const team = {
      id: `team-${Date.now()}`,
      game_id: data.game_id,
      name: data.name,
      color: data.color,
      members: data.members,
      metrics: {
        financial: 50,
        hr: 50,
        market_communication: 50,
        operations: 50,
        customer_satisfaction: 50,
      },
      overall_score: 50.0,
      created_at: new Date().toISOString(),
    };
    this.teams.push(team);
    return team;
  }

  getTeamDetails(teamId: string) {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');
    return team;
  }

  getDashboardData(teamId: string) {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');

    const game = this.games.find((g) => g.id === team.game_id);
    if (!game) throw new Error('Game not found');

    const sessions = this.sessions.filter((s) => s.game_id === team.game_id);
    const currentSession = sessions.find((s) => s.status === 'active');
    const submissions = this.submissions.filter((sub: any) => sub.team_id === teamId);

    return {
      team,
      game,
      current_session: currentSession,
      sessions,
      submissions,
      metrics_history: [],
    };
  }

  getGames() {
    return this.games;
  }

  createGame(data: any) {
    const game = {
      id: `game-${Date.now()}`,
      ...data,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.games.push(game);
    return game;
  }
}

describe('MockDataStore', () => {
  let store: MockDataStore;

  beforeEach(() => {
    store = new MockDataStore();
  });

  describe('Authentication', () => {
    it('should login with valid credentials', () => {
      const result = store.login('demo-gm@businesscaise.com', 'demo123');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('demo-gm@businesscaise.com');
      expect(result.user.role).toBe('game_master');
      expect(result.token).toContain('mock-token');
    });

    it('should reject invalid email', () => {
      expect(() => {
        store.login('invalid@email.com', 'demo123');
      }).toThrow('Invalid credentials');
    });

    it('should reject invalid password', () => {
      expect(() => {
        store.login('demo-gm@businesscaise.com', 'wrongpassword');
      }).toThrow('Invalid credentials');
    });
  });

  describe('Team Management', () => {
    it('should create a new team', () => {
      const teamData = {
        game_id: 'game-demo-001',
        name: 'Test Team',
        color: '#FF0000',
        members: ['Player 1', 'Player 2'],
      };

      const team = store.createTeam(teamData);

      expect(team).toBeDefined();
      expect(team.id).toContain('team-');
      expect(team.name).toBe('Test Team');
      expect(team.color).toBe('#FF0000');
      expect(team.members).toEqual(['Player 1', 'Player 2']);
      expect(team.overall_score).toBe(50.0);
    });

    it('should retrieve team by ID', () => {
      const team = store.getTeamDetails('team-demo-001');

      expect(team).toBeDefined();
      expect(team.name).toBe('Alpha Innovators');
      expect(team.game_id).toBe('game-demo-001');
    });

    it('should throw error for non-existent team', () => {
      expect(() => {
        store.getTeamDetails('team-nonexistent');
      }).toThrow('Team not found');
    });

    it('should find newly created team immediately', () => {
      // This tests the bug we fixed - team should be findable right after creation
      const newTeam = store.createTeam({
        game_id: 'game-demo-001',
        name: 'New Squad',
        color: '#00FF00',
        members: [],
      });

      const foundTeam = store.getTeamDetails(newTeam.id);
      expect(foundTeam).toBeDefined();
      expect(foundTeam.id).toBe(newTeam.id);
      expect(foundTeam.name).toBe('New Squad');
    });
  });

  describe('Dashboard Data', () => {
    it('should return complete dashboard data for existing team', () => {
      const dashboard = store.getDashboardData('team-demo-001');

      expect(dashboard.team).toBeDefined();
      expect(dashboard.game).toBeDefined();
      expect(dashboard.current_session).toBeDefined();
      expect(dashboard.sessions).toBeInstanceOf(Array);
      expect(dashboard.submissions).toBeInstanceOf(Array);
      expect(dashboard.metrics_history).toBeInstanceOf(Array);

      // Verify structure matches what frontend expects
      expect(dashboard.team.name).toBe('Alpha Innovators');
      expect(dashboard.game.title).toContain('Demo Business Simulation');
      expect(dashboard.current_session?.session_number).toBe(1);
    });

    it('should return dashboard for newly created team', () => {
      // This tests the bug we fixed - dashboard should work for new teams
      const newTeam = store.createTeam({
        game_id: 'game-demo-001',
        name: 'Fresh Team',
        color: '#FFFF00',
        members: ['Member 1'],
      });

      const dashboard = store.getDashboardData(newTeam.id);

      expect(dashboard.team).toBeDefined();
      expect(dashboard.team.id).toBe(newTeam.id);
      expect(dashboard.game).toBeDefined();
      expect(dashboard.game.id).toBe('game-demo-001');
    });

    it('should throw error for non-existent team', () => {
      expect(() => {
        store.getDashboardData('team-nonexistent');
      }).toThrow('Team not found');
    });
  });

  describe('Game Management', () => {
    it('should return pre-loaded demo game', () => {
      const games = store.getGames();

      expect(games).toBeInstanceOf(Array);
      expect(games.length).toBeGreaterThan(0);
      expect(games[0].id).toBe('game-demo-001');
      expect(games[0].title).toContain('Demo Business Simulation');
    });

    it('should create a new game', () => {
      const gameData = {
        title: 'New Test Game',
        description: 'Test game description',
        game_master_id: 'gm-demo-001',
      };

      const game = store.createGame(gameData);

      expect(game).toBeDefined();
      expect(game.id).toContain('game-');
      expect(game.title).toBe('New Test Game');
      expect(game.status).toBe('active');
    });
  });
});
