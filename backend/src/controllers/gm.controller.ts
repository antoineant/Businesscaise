import { Request, Response } from 'express';
import { GameModel } from '../models/Game.model';
import { TeamModel } from '../models/Team.model';
import { SessionModel } from '../models/Session.model';
import { SubmissionModel } from '../models/Submission.model';
import { AppError, asyncHandler } from '../middleware/errorHandler.middleware';
import * as metricsService from '../services/metrics.service';
import * as socketHandler from '../socket/socket.handler';

/**
 * Create a new game
 * POST /api/gm/games
 */
export const createGame = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, settings, archetype_id, industry_id, company_name, product_description, enable_pods, pod_size, pod_assignment_method, enable_category_awards } = req.body;
  const gameMasterId = req.user!.userId;

  // Create game with scenario fields and pod competition settings
  const game = await GameModel.create({
    title,
    description,
    game_master_id: gameMasterId,
    settings: settings || {},
    archetype_id,
    industry_id,
    company_name,
    product_description,
    enable_pods,
    pod_size,
    pod_assignment_method,
    enable_category_awards,
  });

  // Create default 10 sessions (5 days, AM/PM)
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const periods: ('am' | 'pm')[] = ['am', 'pm'];
  const defaultSessions = [];

  let sessionNumber = 1;
  for (const day of days) {
    for (const period of periods) {
      // Capitalize day name for display
      const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
      defaultSessions.push({
        game_id: game.id,
        session_number: sessionNumber,
        day,
        period,
        title: `${dayCapitalized} ${period.toUpperCase()} - Session ${sessionNumber}`,
        description: `Business challenge for ${dayCapitalized} ${period.toUpperCase()}`,
      });
      sessionNumber++;
    }
  }

  const sessions = await SessionModel.createBulk(defaultSessions);

  res.status(201).json({
    message: 'Game created successfully',
    game,
    sessions,
  });
});

/**
 * Get all games for current Game Master
 * GET /api/gm/games
 */
export const listGames = asyncHandler(async (req: Request, res: Response) => {
  const gameMasterId = req.user!.userId;

  const games = await GameModel.findByGameMaster(gameMasterId);

  res.json({
    games,
  });
});

/**
 * Get game details with teams and sessions
 * GET /api/gm/games/:id
 */
export const getGameDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this game', 403);
  }

  const game = await GameModel.findById(id);
  if (!game) {
    throw new AppError('Game not found', 404);
  }

  const teams = await TeamModel.findByGame(id);
  const sessions = await SessionModel.findByGame(id);

  res.json({
    game,
    teams,
    sessions,
  });
});

/**
 * Update game
 * PUT /api/gm/games/:id
 */
export const updateGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;
  const { title, description, settings } = req.body;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to update this game', 403);
  }

  const game = await GameModel.update(id, {
    title,
    description,
    settings,
  });

  if (!game) {
    throw new AppError('Game not found', 404);
  }

  res.json({
    message: 'Game updated successfully',
    game,
  });
});

/**
 * Delete game
 * DELETE /api/gm/games/:id
 */
export const deleteGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to delete this game', 403);
  }

  const deleted = await GameModel.delete(id);
  if (!deleted) {
    throw new AppError('Game not found', 404);
  }

  res.json({
    message: 'Game deleted successfully',
  });
});

/**
 * Start game (change status to active)
 * POST /api/gm/games/:id/start
 */
export const startGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to start this game', 403);
  }

  const game = await GameModel.updateStatus(id, 'active');
  if (!game) {
    throw new AppError('Game not found', 404);
  }

  // Notify all participants via WebSocket
  socketHandler.notifyGameStatusChanged(id, 'active', { game });

  res.json({
    message: 'Game started successfully',
    game,
  });
});

/**
 * Pause game
 * POST /api/gm/games/:id/pause
 */
export const pauseGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to pause this game', 403);
  }

  const game = await GameModel.updateStatus(id, 'paused');
  if (!game) {
    throw new AppError('Game not found', 404);
  }

  res.json({
    message: 'Game paused successfully',
    game,
  });
});

/**
 * Resume game
 * POST /api/gm/games/:id/resume
 */
export const resumeGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to resume this game', 403);
  }

  const game = await GameModel.updateStatus(id, 'active');
  if (!game) {
    throw new AppError('Game not found', 404);
  }

  res.json({
    message: 'Game resumed successfully',
    game,
  });
});

/**
 * Get all sessions for a game
 * GET /api/gm/games/:id/sessions
 */
export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this game', 403);
  }

  const sessions = await SessionModel.findByGame(id);

  res.json({
    sessions,
  });
});

/**
 * Unlock a session
 * POST /api/gm/games/:gameId/sessions/:sessionId/unlock
 */
export const unlockSession = asyncHandler(async (req: Request, res: Response) => {
  const { gameId, sessionId } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(gameId, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to unlock sessions in this game', 403);
  }

  const session = await SessionModel.unlock(sessionId);
  if (!session) {
    throw new AppError('Session not found', 404);
  }

  // Update game's current session
  await GameModel.update(gameId, { current_session_id: sessionId });

  // Notify all teams via WebSocket
  socketHandler.notifySessionUnlocked(gameId, session);

  res.json({
    message: 'Session unlocked successfully',
    session,
  });
});

/**
 * Update session
 * PUT /api/gm/games/:gameId/sessions/:sessionId
 */
export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const { gameId, sessionId } = req.params;
  const gameMasterId = req.user!.userId;
  const { title, description, deadline, narrative } = req.body;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(gameId, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to update sessions in this game', 403);
  }

  const session = await SessionModel.update(sessionId, {
    title,
    description,
    deadline,
    narrative,
  });

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  res.json({
    message: 'Session updated successfully',
    session,
  });
});

/**
 * Get all teams for a game with metrics
 * GET /api/gm/games/:id/teams
 */
export const listTeams = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this game', 403);
  }

  const teams = await TeamModel.findByGame(id);

  res.json({
    teams,
  });
});

/**
 * Get team details
 * GET /api/gm/games/:gameId/teams/:teamId
 */
export const getTeamDetails = asyncHandler(async (req: Request, res: Response) => {
  const { gameId, teamId } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(gameId, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this game', 403);
  }

  const team = await TeamModel.findById(teamId);
  if (!team || team.game_id !== gameId) {
    throw new AppError('Team not found', 404);
  }

  res.json({
    team,
  });
});

/**
 * Get team metrics history
 * GET /api/gm/games/:gameId/teams/:teamId/history
 */
export const getTeamHistory = asyncHandler(async (req: Request, res: Response) => {
  const { gameId, teamId } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(gameId, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this game', 403);
  }

  const history = await TeamModel.getMetricsHistory(teamId);

  res.json({
    history,
  });
});

/**
 * Get leaderboard for a game
 * GET /api/gm/games/:id/leaderboard
 */
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this game', 403);
  }

  const teams = await TeamModel.findByGame(id);

  // Sort by overall score
  const leaderboard = teams
    .filter(team => team.overall_score !== null)
    .sort((a, b) => {
      const scoreA = a.overall_score || 0;
      const scoreB = b.overall_score || 0;
      return scoreB - scoreA;
    })
    .map((team, index) => ({
      rank: index + 1,
      team_id: team.id,
      team_name: team.name,
      overall_score: team.overall_score,
      metrics: team.metrics,
    }));

  res.json({
    leaderboard,
  });
});

/**
 * Get analytics for a game
 * GET /api/gm/games/:id/analytics
 */
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this game', 403);
  }

  const game = await GameModel.findById(id);
  const teams = await TeamModel.findByGame(id);
  const sessions = await SessionModel.findByGame(id);

  // Calculate analytics
  const totalTeams = teams.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const activeSessions = sessions.filter(s => s.status === 'active').length;

  // Average metrics across all teams
  const avgMetrics = {
    financial: 0,
    hr: 0,
    market_communication: 0,
    operations: 0,
    customer_satisfaction: 0,
  };

  if (teams.length > 0) {
    teams.forEach(team => {
      if (team.metrics) {
        avgMetrics.financial += team.metrics.financial || 0;
        avgMetrics.hr += team.metrics.hr || 0;
        avgMetrics.market_communication += team.metrics.market_communication || 0;
        avgMetrics.operations += team.metrics.operations || 0;
        avgMetrics.customer_satisfaction += team.metrics.customer_satisfaction || 0;
      }
    });

    Object.keys(avgMetrics).forEach(key => {
      avgMetrics[key as keyof typeof avgMetrics] /= teams.length;
    });
  }

  res.json({
    game,
    analytics: {
      total_teams: totalTeams,
      completed_sessions: completedSessions,
      active_sessions: activeSessions,
      average_metrics: avgMetrics,
    },
  });
});

/**
 * Get all submissions for a game
 * GET /api/gm/games/:id/submissions
 */
export const listSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;
  const { status } = req.query;

  // Check if user is game master
  const isGM = await GameModel.isGameMaster(id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this game', 403);
  }

  let submissions;
  if (status) {
    submissions = await SubmissionModel.findByStatus(id, status as any);
  } else {
    submissions = await SubmissionModel.findByGame(id);
  }

  res.json({
    submissions,
  });
});

/**
 * Get submission details
 * GET /api/gm/submissions/:id
 */
export const getSubmissionDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  const submission = await SubmissionModel.getSubmissionWithDetails(id);
  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Check if user is game master of the game
  const isGM = await GameModel.isGameMaster(submission.game_id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to access this submission', 403);
  }

  res.json({
    submission,
  });
});

/**
 * Score a submission
 * POST /api/gm/submissions/:id/score
 */
export const scoreSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;
  const { score, feedback } = req.body;

  // Get submission details to check authorization
  const submissionDetails = await SubmissionModel.getSubmissionWithDetails(id);
  if (!submissionDetails) {
    throw new AppError('Submission not found', 404);
  }

  // Check if user is game master of the game
  const isGM = await GameModel.isGameMaster(submissionDetails.game_id, gameMasterId);
  if (!isGM) {
    throw new AppError('Not authorized to score this submission', 403);
  }

  // Score the submission
  const submission = await SubmissionModel.score(id, score, feedback);

  // Update team metrics based on score
  const team = await TeamModel.findById(submissionDetails.team_id);
  if (team) {
    const currentMetrics = team.metrics || metricsService.DEFAULT_METRICS;

    // Calculate impact based on challenge type and score
    const challengeType = submissionDetails.challenge_id?.split('-')[0] || 'general';
    const impact = metricsService.calculateSubmissionImpact(score, challengeType);

    // Apply impact to metrics
    const updatedMetrics = metricsService.applyMetricsImpact(currentMetrics, impact);

    // Calculate overall score with weighted formula
    const overallScore = metricsService.calculateOverallScore(updatedMetrics);

    // Update database
    await TeamModel.updateMetrics(team.id, updatedMetrics, overallScore);

    // Notify team via WebSocket
    socketHandler.notifySubmissionScored(team.id, {
      submission_id: id,
      score,
      feedback,
      metrics: updatedMetrics,
      overall_score: overallScore,
    });

    // Notify metrics update
    socketHandler.notifyMetricsUpdated(team.id, updatedMetrics);

    // Update leaderboard
    const allTeams = await TeamModel.findByGame(submissionDetails.game_id);
    const leaderboard = allTeams
      .filter(t => t.overall_score !== null)
      .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
      .map((t, idx) => ({
        rank: idx + 1,
        team_id: t.id,
        team_name: t.name,
        overall_score: t.overall_score,
      }));

    socketHandler.notifyLeaderboardUpdated(submissionDetails.game_id, leaderboard);
  }

  res.json({
    message: 'Submission scored successfully',
    submission,
  });
});
