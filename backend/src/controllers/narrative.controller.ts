import { Request, Response } from 'express';
import { NarrativeModel } from '../models/Narrative.model';
import { GMEventModel } from '../models/GMEvent.model';
import { GameModel } from '../models/Game.model';
import { AppError, asyncHandler } from '../middleware/errorHandler.middleware';
import * as socketHandler from '../socket/socket.handler';

/**
 * GM ENDPOINTS
 */

/**
 * Create a new narrative
 * POST /api/gm/games/:gameId/narratives
 */
export const createNarrative = asyncHandler(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { type, title, content, author, session_id, target_teams, published_at } = req.body;
  const gameMasterId = req.user!.userId;

  // Verify game exists and belongs to GM
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }
  if (game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized to create narratives for this game', 403);
  }

  // Validate type
  const validTypes = ['briefing', 'news', 'email', 'alert'];
  if (!validTypes.includes(type)) {
    throw new AppError(`Invalid narrative type. Must be one of: ${validTypes.join(', ')}`, 400);
  }

  // Create narrative
  const narrative = await NarrativeModel.create({
    game_id: gameId,
    type,
    title,
    content,
    author,
    session_id,
    target_teams,
    published_at: published_at ? new Date(published_at) : undefined
  });

  // Send WebSocket notification to teams
  socketHandler.notifyNarrativeCreated(gameId, narrative);

  res.status(201).json({
    message: 'Narrative created successfully',
    narrative
  });
});

/**
 * Get narratives for a game with filters
 * GET /api/gm/games/:gameId/narratives?type=news&session_id=xxx
 */
export const getNarratives = asyncHandler(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { type, session_id } = req.query;
  const gameMasterId = req.user!.userId;

  // Verify game exists and belongs to GM
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }
  if (game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized to view narratives for this game', 403);
  }

  // Build filters
  const filters: any = {};
  if (type) filters.type = type as string;
  if (session_id) filters.session_id = session_id as string;

  // Get narratives
  const narratives = await NarrativeModel.findByGame(gameId, filters);

  // Get counts by type
  const typeCounts = {
    briefing: await NarrativeModel.countByGame(gameId, { type: 'briefing' }),
    news: await NarrativeModel.countByGame(gameId, { type: 'news' }),
    email: await NarrativeModel.countByGame(gameId, { type: 'email' }),
    alert: await NarrativeModel.countByGame(gameId, { type: 'alert' })
  };

  res.json({
    narratives,
    total: narratives.length,
    typeCounts
  });
});

/**
 * Update a narrative
 * PUT /api/gm/narratives/:id
 */
export const updateNarrative = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, author, type, session_id, target_teams, published_at } = req.body;
  const gameMasterId = req.user!.userId;

  // Find narrative
  const narrative = await NarrativeModel.findById(id);
  if (!narrative) {
    throw new AppError('Narrative not found', 404);
  }

  // Verify game belongs to GM
  const game = await GameModel.findById(narrative.game_id);
  if (!game || game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized to update this narrative', 403);
  }

  // Validate type if provided
  if (type) {
    const validTypes = ['briefing', 'news', 'email', 'alert'];
    if (!validTypes.includes(type)) {
      throw new AppError(`Invalid narrative type. Must be one of: ${validTypes.join(', ')}`, 400);
    }
  }

  // Update narrative
  const updatedNarrative = await NarrativeModel.update(id, {
    title,
    content,
    author,
    type,
    session_id,
    target_teams,
    published_at: published_at ? new Date(published_at) : undefined
  });

  // Send WebSocket notification
  socketHandler.notifyNarrativeUpdated(narrative.game_id, updatedNarrative);

  res.json({
    message: 'Narrative updated successfully',
    narrative: updatedNarrative
  });
});

/**
 * Delete a narrative
 * DELETE /api/gm/narratives/:id
 */
export const deleteNarrative = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameMasterId = req.user!.userId;

  // Find narrative
  const narrative = await NarrativeModel.findById(id);
  if (!narrative) {
    throw new AppError('Narrative not found', 404);
  }

  // Verify game belongs to GM
  const game = await GameModel.findById(narrative.game_id);
  if (!game || game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized to delete this narrative', 403);
  }

  // Delete narrative
  await NarrativeModel.delete(id);

  // Send WebSocket notification
  socketHandler.notifyNarrativeDeleted(narrative.game_id, id);

  res.json({
    message: 'Narrative deleted successfully'
  });
});

/**
 * Create a GM event
 * POST /api/gm/games/:gameId/events
 */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { event_type, title, description, impacts, target_teams, applied_at, auto_generate_narrative } = req.body;
  const gameMasterId = req.user!.userId;

  // Verify game exists and belongs to GM
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }
  if (game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized to create events for this game', 403);
  }

  // Validate impacts structure
  if (impacts && Array.isArray(impacts)) {
    const validMetrics = ['financial', 'operations', 'marketing', 'hr', 'customer_satisfaction'];
    for (const impact of impacts) {
      if (!impact.metric || !validMetrics.includes(impact.metric)) {
        throw new AppError(`Invalid metric in impacts. Must be one of: ${validMetrics.join(', ')}`, 400);
      }
      if (typeof impact.change !== 'number') {
        throw new AppError('Impact change must be a number', 400);
      }
    }
  }

  // Create event
  const event = await GMEventModel.create({
    game_id: gameId,
    event_type,
    title,
    description,
    impacts,
    target_teams,
    applied_at: applied_at ? new Date(applied_at) : undefined
  });

  // Apply impacts to teams immediately
  if (impacts && impacts.length > 0) {
    const affectedTeams = await GMEventModel.applyImpacts(event.id);
    console.log(`[EVENT] Applied impacts to ${affectedTeams.length} teams`);
  }

  // Auto-generate narrative if requested
  let narrative = null;
  if (auto_generate_narrative) {
    const impactDescription = impacts && impacts.length > 0
      ? `\n\n(This event affects: ${impacts.map((i: any) => `${i.metric} ${i.change > 0 ? '+' : ''}${i.change}`).join(', ')})`
      : '';

    narrative = await NarrativeModel.create({
      game_id: gameId,
      type: 'alert',
      title: `BREAKING: ${title}`,
      content: `${description}${impactDescription}`,
      author: 'System',
      target_teams
    });
  }

  // Send WebSocket notification
  socketHandler.notifyGMEventCreated(gameId, event, narrative || undefined);

  res.status(201).json({
    message: 'Event created successfully',
    event,
    narrative
  });
});

/**
 * Get events for a game
 * GET /api/gm/games/:gameId/events
 */
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const gameMasterId = req.user!.userId;

  // Verify game exists and belongs to GM
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }
  if (game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized to view events for this game', 403);
  }

  // Get events
  const events = await GMEventModel.findByGame(gameId);
  const totalEvents = await GMEventModel.countByGame(gameId);

  res.json({
    events,
    total: totalEvents
  });
});

/**
 * TEAM ENDPOINTS
 */

/**
 * Get narratives for a team
 * GET /api/teams/:teamId/narratives?type=news,email
 */
export const getTeamNarratives = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { type } = req.query;

  // Note: Team authorization is handled by team middleware
  // Get team to find game_id
  const teamResult = await  import('../config/database').then(db => db.query(
    'SELECT game_id FROM teams WHERE id = $1',
    [teamId]
  ));

  if (teamResult.rows.length === 0) {
    throw new AppError('Team not found', 404);
  }

  const gameId = teamResult.rows[0].game_id;

  // Build filters
  const filters: any = {};
  if (type) {
    filters.type = type as string;
  }

  // Get narratives visible to this team
  const narratives = await NarrativeModel.findByTeam(gameId, teamId, filters);

  res.json({
    narratives,
    total: narratives.length
  });
});

/**
 * Get session briefing for a team
 * GET /api/teams/:teamId/sessions/:sessionId/briefing
 */
export const getSessionBriefing = asyncHandler(async (req: Request, res: Response) => {
  const { teamId, sessionId } = req.params;

  // Get team to verify access
  const teamResult = await import('../config/database').then(db => db.query(
    'SELECT game_id FROM teams WHERE id = $1',
    [teamId]
  ));

  if (teamResult.rows.length === 0) {
    throw new AppError('Team not found', 404);
  }

  const gameId = teamResult.rows[0].game_id;

  // Get session narrative from sessions table
  const sessionResult = await import('../config/database').then(db => db.query(
    'SELECT narrative FROM sessions WHERE id = $1 AND game_id = $2',
    [sessionId, gameId]
  ));

  if (sessionResult.rows.length === 0) {
    throw new AppError('Session not found', 404);
  }

  const briefing = sessionResult.rows[0].narrative;

  // Get associated narratives for this session
  const narratives = await NarrativeModel.findByTeam(gameId, teamId, { session_id: sessionId });

  res.json({
    briefing,
    narratives
  });
});
