import { Request, Response } from 'express';
import { GameModel } from '../models/Game.model';
import { TeamModel } from '../models/Team.model';
import { SessionModel } from '../models/Session.model';
import { SubmissionModel } from '../models/Submission.model';
import { AppError, asyncHandler } from '../middleware/errorHandler.middleware';
import * as socketHandler from '../socket/socket.handler';

/**
 * Join a game (create team)
 * POST /api/teams/join
 */
export const joinGame = asyncHandler(async (req: Request, res: Response) => {
  const { game_id, team_name, color, members } = req.body;

  // Check if game exists and is active
  const game = await GameModel.findById(game_id);
  if (!game) {
    throw new AppError('Game not found', 404);
  }

  if (game.status !== 'active' && game.status !== 'setup') {
    throw new AppError('Game is not accepting new teams', 400);
  }

  // Create team with default metrics
  const team = await TeamModel.create({
    game_id,
    name: team_name,
    color: color || '#3B82F6',
    members: members || [],
    metrics: {
      financial: 50,
      hr: 50,
      market_communication: 50,
      operations: 50,
      customer_satisfaction: 50,
    },
  });

  // Notify Game Master via WebSocket (non-blocking - don't let notification failures prevent join)
  try {
    socketHandler.notifyTeamJoined(game_id, team);
  } catch (err) {
    console.error('Failed to notify GM of team join:', err);
    // Continue anyway - notification failure shouldn't prevent team from joining
  }

  res.status(201).json({
    message: 'Team joined game successfully',
    team,
  });
});

/**
 * Get current team info
 * GET /api/teams/current/:teamId
 */
export const getCurrentTeam = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  res.json({
    team,
  });
});

/**
 * Get dashboard data for team
 * GET /api/teams/:teamId/dashboard
 */
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const game = await GameModel.findById(team.game_id);
  if (!game) {
    throw new AppError('Game not found', 404);
  }

  // Get current session
  let currentSession = null;
  if (game.current_session_id) {
    currentSession = await SessionModel.findById(game.current_session_id);
  }

  // Get all sessions
  const sessions = await SessionModel.findByGame(team.game_id);

  // Get team's submissions
  const submissions = await SubmissionModel.findByTeam(teamId);

  // Get metrics history
  const metricsHistory = await TeamModel.getMetricsHistory(teamId);

  res.json({
    team,
    game,
    current_session: currentSession,
    sessions,
    submissions,
    metrics_history: metricsHistory,
  });
});

/**
 * Get current active session
 * GET /api/teams/:teamId/sessions/current
 */
export const getCurrentSession = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const currentSession = await SessionModel.findActiveSession(team.game_id);
  if (!currentSession) {
    throw new AppError('No active session', 404);
  }

  res.json({
    session: currentSession,
  });
});

/**
 * Get challenges for a session
 * GET /api/teams/:teamId/sessions/:sessionId/challenges
 */
export const getSessionChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { teamId, sessionId } = req.params;

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const session = await SessionModel.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.game_id !== team.game_id) {
    throw new AppError('Session does not belong to team\'s game', 403);
  }

  if (session.status === 'locked') {
    throw new AppError('Session is locked', 403);
  }

  res.json({
    session,
  });
});

/**
 * Submit decision for a challenge
 * POST /api/teams/:teamId/submit
 */
export const submitDecision = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { session_id, challenge_id, submission_data, file_urls } = req.body;

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const session = await SessionModel.findById(session_id);
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.game_id !== team.game_id) {
    throw new AppError('Session does not belong to team\'s game', 403);
  }

  if (session.status !== 'active') {
    throw new AppError('Session is not active', 400);
  }

  // Check deadline
  if (session.deadline && new Date() > new Date(session.deadline)) {
    throw new AppError('Submission deadline has passed', 400);
  }

  // Create submission
  const submission = await SubmissionModel.create({
    team_id: teamId,
    session_id,
    challenge_id,
    submission_data,
    file_urls: file_urls || [],
  });

  // Notify Game Master via WebSocket
  socketHandler.notifySubmissionReceived(team.game_id, {
    submission_id: submission.id,
    team_id: teamId,
    team_name: team.name,
    session_id,
    challenge_id,
    submitted_at: submission.submitted_at,
  });

  res.status(201).json({
    message: 'Decision submitted successfully',
    submission,
  });
});

/**
 * Get latest results/briefing
 * GET /api/teams/:teamId/results/latest
 */
export const getLatestResults = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Get last scored submission
  const submissions = await SubmissionModel.findByTeam(teamId);
  const scoredSubmissions = submissions.filter(s => s.status === 'scored');

  if (scoredSubmissions.length === 0) {
    throw new AppError('No results available yet', 404);
  }

  const latestResult = scoredSubmissions[0]; // Already sorted by submitted_at DESC

  res.json({
    result: latestResult,
    current_metrics: team.metrics,
    overall_score: team.overall_score,
  });
});

/**
 * Get metrics history
 * GET /api/teams/:teamId/history
 */
export const getMetricsHistory = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const history = await TeamModel.getMetricsHistory(teamId);

  res.json({
    history,
  });
});

/**
 * Get leaderboard for team's game
 * GET /api/teams/:teamId/leaderboard
 */
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const teams = await TeamModel.findByGame(team.game_id);

  // Sort by overall score and create leaderboard
  const leaderboard = teams
    .filter(t => t.overall_score !== null)
    .sort((a, b) => {
      const scoreA = a.overall_score || 0;
      const scoreB = b.overall_score || 0;
      return scoreB - scoreA;
    })
    .map((t, index) => ({
      rank: index + 1,
      team_id: t.id,
      team_name: t.name,
      overall_score: t.overall_score,
      is_current_team: t.id === teamId,
    }));

  res.json({
    leaderboard,
  });
});
