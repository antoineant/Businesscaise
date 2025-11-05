// Mock Data Service for UX Testing Mode
// Simulates complete backend behavior in the frontend

import { User, Game, Team, Session, Submission } from './api.client';

// In-memory storage for demo mode
class MockDataStore {
  private users: User[] = [];
  private games: Game[] = [];
  private teams: Team[] = [];
  private sessions: Session[] = [];
  private submissions: Submission[] = [];
  private currentUser: User | null = null;
  private authToken: string | null = null;

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo Game Master user
    const gmUser: User = {
      id: 'gm-demo-001',
      email: 'demo-gm@businesscaise.com',
      name: 'Demo Game Master',
      role: 'game_master',
    };
    this.users.push(gmUser);

    // Create demo Player users
    const player1: User = {
      id: 'player-demo-001',
      email: 'demo-player1@businesscaise.com',
      name: 'Demo Player 1',
      role: 'player',
    };
    const player2: User = {
      id: 'player-demo-002',
      email: 'demo-player2@businesscaise.com',
      name: 'Demo Player 2',
      role: 'player',
    };
    this.users.push(player1, player2);

    // Create demo game
    const demoGame: Game = {
      id: 'game-demo-001',
      title: 'Demo Business Simulation - Winter 2025',
      description: 'A 5-day intensive business simulation game for testing',
      game_master_id: gmUser.id,
      start_date: new Date().toISOString(),
      end_date: null,
      current_session_id: null,
      status: 'active',
      settings: { duration: 5, sessions_per_day: 2 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.games.push(demoGame);

    // Create 10 sessions (Monday-Friday AM/PM)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods: ('AM' | 'PM')[] = ['AM', 'PM'];
    let sessionNumber = 1;

    days.forEach((day) => {
      periods.forEach((period) => {
        const session: Session = {
          id: `session-demo-${String(sessionNumber).padStart(3, '0')}`,
          game_id: demoGame.id,
          session_number: sessionNumber,
          day,
          period,
          title: `${day} ${period} - Session ${sessionNumber}`,
          description: `Business challenge for ${day} ${period}`,
          unlock_type: 'manual',
          scheduled_unlock_time: null,
          actual_unlock_time: sessionNumber === 1 ? new Date().toISOString() : null,
          deadline: null,
          status: sessionNumber === 1 ? 'active' : 'locked',
          challenges: {
            id: `challenge-${sessionNumber}`,
            title: `Challenge ${sessionNumber}`,
            description: 'Make strategic business decisions',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.sessions.push(session);
        sessionNumber++;
      });
    });

    // Create demo teams
    const alphaTeam: Team = {
      id: 'team-demo-001',
      game_id: demoGame.id,
      name: 'Alpha Innovators',
      color: '#3B82F6',
      members: ['Alice Johnson', 'Bob Smith', 'Carol Davis'],
      metrics: {
        financial: 55,
        hr: 52,
        market_communication: 58,
        operations: 50,
        customer_satisfaction: 54,
      },
      overall_score: 54.2,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const betaTeam: Team = {
      id: 'team-demo-002',
      game_id: demoGame.id,
      name: 'Beta Strategists',
      color: '#EF4444',
      members: ['David Lee', 'Emma Wilson', 'Frank Chen'],
      metrics: {
        financial: 48,
        hr: 51,
        market_communication: 49,
        operations: 52,
        customer_satisfaction: 50,
      },
      overall_score: 49.7,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const gammaTeam: Team = {
      id: 'team-demo-003',
      game_id: demoGame.id,
      name: 'Gamma Disruptors',
      color: '#10B981',
      members: ['Grace Kim', 'Henry Taylor', 'Iris Martinez'],
      metrics: {
        financial: 52,
        hr: 54,
        market_communication: 51,
        operations: 53,
        customer_satisfaction: 52,
      },
      overall_score: 52.1,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.teams.push(alphaTeam, betaTeam, gammaTeam);

    // Create demo submissions
    const submission1: Submission = {
      id: 'submission-demo-001',
      team_id: alphaTeam.id,
      session_id: this.sessions[0].id,
      challenge_id: 'challenge-1',
      submission_data: {
        decision: 'Increase marketing budget by 20%',
        reasoning: 'Market research shows high ROI potential',
        budget_allocation: { marketing: 120000, operations: 80000 },
      },
      file_urls: ['/uploads/demo/alpha/proposal.pdf', '/uploads/demo/alpha/analysis.xlsx'],
      submitted_at: new Date(Date.now() - 3600000).toISOString(),
      scored_at: new Date(Date.now() - 1800000).toISOString(),
      score: 85,
      feedback: 'Excellent analysis and supporting documents. Strong strategic thinking.',
      status: 'scored',
    };

    const submission2: Submission = {
      id: 'submission-demo-002',
      team_id: betaTeam.id,
      session_id: this.sessions[0].id,
      challenge_id: 'challenge-1',
      submission_data: {
        decision: 'Maintain current strategy',
        reasoning: 'Conservative approach for stability',
      },
      file_urls: null,
      submitted_at: new Date(Date.now() - 3000000).toISOString(),
      scored_at: null,
      score: null,
      feedback: null,
      status: 'pending',
    };

    const submission3: Submission = {
      id: 'submission-demo-003',
      team_id: gammaTeam.id,
      session_id: this.sessions[0].id,
      challenge_id: 'challenge-1',
      submission_data: {
        decision: 'Launch new product line',
        reasoning: 'Diversification strategy to capture new market segment',
        timeline: 'Q2 2025',
      },
      file_urls: ['/uploads/demo/gamma/market-research.pdf'],
      submitted_at: new Date(Date.now() - 2400000).toISOString(),
      scored_at: null,
      score: null,
      feedback: null,
      status: 'pending',
    };

    this.submissions.push(submission1, submission2, submission3);
  }

  // Authentication methods
  login(email: string, password: string): { token: string; user: User } {
    const user = this.users.find((u) => u.email === email);
    if (!user || password !== 'demo123') {
      throw new Error('Invalid credentials. Use password: demo123');
    }
    this.currentUser = user;
    this.authToken = `mock-token-${user.id}`;
    return { token: this.authToken, user };
  }

  register(data: { email: string; password: string; name: string; role: 'game_master' | 'player' }): { token: string; user: User } {
    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
    };
    this.users.push(user);
    this.currentUser = user;
    this.authToken = `mock-token-${user.id}`;
    return { token: this.authToken, user };
  }

  getCurrentUser(): User {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.authToken = null;
  }

  // Game Master methods
  createGame(data: { title: string; description?: string }): { game: Game; sessions: Session[] } {
    const game: Game = {
      id: `game-${Date.now()}`,
      title: data.title,
      description: data.description || null,
      game_master_id: this.currentUser!.id,
      start_date: null,
      end_date: null,
      current_session_id: null,
      status: 'setup',
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.games.push(game);

    // Create 10 sessions
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods: ('AM' | 'PM')[] = ['AM', 'PM'];
    const sessions: Session[] = [];
    let sessionNumber = 1;

    days.forEach((day) => {
      periods.forEach((period) => {
        const session: Session = {
          id: `session-${Date.now()}-${sessionNumber}`,
          game_id: game.id,
          session_number: sessionNumber,
          day,
          period,
          title: `${day} ${period} - Session ${sessionNumber}`,
          description: null,
          unlock_type: 'manual',
          scheduled_unlock_time: null,
          actual_unlock_time: null,
          deadline: null,
          status: 'locked',
          challenges: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        sessions.push(session);
        this.sessions.push(session);
        sessionNumber++;
      });
    });

    return { game, sessions };
  }

  getGames(): Game[] {
    return this.games.filter((g) => g.game_master_id === this.currentUser!.id);
  }

  getGameDetails(gameId: string): { game: Game; teams: Team[]; sessions: Session[] } {
    const game = this.games.find((g) => g.id === gameId);
    if (!game) throw new Error('Game not found');

    const teams = this.teams.filter((t) => t.game_id === gameId);
    const sessions = this.sessions.filter((s) => s.game_id === gameId);

    return { game, teams, sessions };
  }

  startGame(gameId: string): { game: Game } {
    const game = this.games.find((g) => g.id === gameId);
    if (!game) throw new Error('Game not found');

    game.status = 'active';
    game.start_date = new Date().toISOString();
    game.updated_at = new Date().toISOString();

    return { game };
  }

  pauseGame(gameId: string): { game: Game } {
    const game = this.games.find((g) => g.id === gameId);
    if (!game) throw new Error('Game not found');

    game.status = 'paused';
    game.updated_at = new Date().toISOString();

    return { game };
  }

  resumeGame(gameId: string): { game: Game } {
    const game = this.games.find((g) => g.id === gameId);
    if (!game) throw new Error('Game not found');

    game.status = 'active';
    game.updated_at = new Date().toISOString();

    return { game };
  }

  unlockSession(gameId: string, sessionId: string): { session: Session } {
    const session = this.sessions.find((s) => s.id === sessionId && s.game_id === gameId);
    if (!session) throw new Error('Session not found');

    session.status = 'active';
    session.actual_unlock_time = new Date().toISOString();
    session.updated_at = new Date().toISOString();

    return { session };
  }

  listTeams(gameId: string): Team[] {
    return this.teams.filter((t) => t.game_id === gameId);
  }

  listSubmissions(gameId: string, status?: string): Submission[] {
    const gameSessions = this.sessions.filter((s) => s.game_id === gameId);
    const sessionIds = gameSessions.map((s) => s.id);

    let submissions = this.submissions.filter((sub) => sessionIds.includes(sub.session_id));

    if (status) {
      submissions = submissions.filter((sub) => sub.status === status);
    }

    return submissions;
  }

  scoreSubmission(submissionId: string, score: number, feedback?: string): { submission: Submission } {
    const submission = this.submissions.find((s) => s.id === submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.score = score;
    submission.feedback = feedback || null;
    submission.status = 'scored';
    submission.scored_at = new Date().toISOString();

    // Update team metrics based on score
    const team = this.teams.find((t) => t.id === submission.team_id);
    if (team) {
      const impact = (score - 50) / 10;
      team.metrics.financial += impact * 0.5;
      team.metrics.market_communication += impact * 1.5;
      team.metrics.customer_satisfaction += impact * 0.8;

      // Recalculate overall score
      team.overall_score =
        team.metrics.financial * 0.4 +
        team.metrics.hr * 0.3 +
        team.metrics.market_communication * 0.3;

      team.updated_at = new Date().toISOString();
    }

    return { submission };
  }

  getLeaderboard(gameId: string) {
    const teams = this.teams
      .filter((t) => t.game_id === gameId)
      .sort((a, b) => b.overall_score - a.overall_score);

    return { leaderboard: teams };
  }

  // Team/Player methods
  createTeam(data: { game_id: string; name: string; color: string; members: string[] }): Team {
    const team: Team = {
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
      updated_at: new Date().toISOString(),
    };
    this.teams.push(team);
    return team;
  }

  getTeamDetails(teamId: string): Team {
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
    const submissions = this.submissions.filter((sub) => sub.team_id === teamId);

    return {
      team,
      game,
      current_session: currentSession,
      sessions,
      submissions,
      metrics_history: [],
    };
  }

  submitDecision(teamId: string, data: any): { submission: Submission } {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');

    const submission: Submission = {
      id: `submission-${Date.now()}`,
      team_id: teamId,
      session_id: data.session_id,
      challenge_id: data.challenge_id,
      submission_data: data.submission_data,
      file_urls: data.file_urls || null,
      submitted_at: new Date().toISOString(),
      scored_at: null,
      score: null,
      feedback: null,
      status: 'pending',
    };

    this.submissions.push(submission);

    return { submission };
  }

  getTeamLeaderboard(teamId: string) {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');

    const teams = this.teams
      .filter((t) => t.game_id === team.game_id)
      .sort((a, b) => b.overall_score - a.overall_score);

    return { leaderboard: teams };
  }

  // File upload simulation
  uploadFiles(files: File[], gameId: string, teamId: string): string[] {
    // Simulate file upload by creating mock URLs
    return files.map((file, index) => `/uploads/demo/${gameId}/${teamId}/${file.name}`);
  }

  // Get all data (for debugging)
  getState() {
    return {
      users: this.users,
      games: this.games,
      teams: this.teams,
      sessions: this.sessions,
      submissions: this.submissions,
      currentUser: this.currentUser,
    };
  }
}

// Singleton instance
export const mockDataStore = new MockDataStore();
