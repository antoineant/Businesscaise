import { Request, Response } from 'express';
import { NarrativeModel } from '../models/Narrative.model';
import { GMEventModel } from '../models/GMEvent.model';
import { GameModel } from '../models/Game.model';
import { PerplexityUsageModel } from '../models/PerplexityUsage.model';
import { AppError, asyncHandler } from '../middleware/errorHandler.middleware';
import * as socketHandler from '../socket/socket.handler';
import perplexityService from '../services/perplexity.service';

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

/**
 * AI-POWERED ENDPOINTS (Phase 3B - Perplexity Integration)
 */

/**
 * Enhance narrative with real-world context (Reality Lens)
 * POST /api/gm/games/:gameId/narratives/enhance
 */
export const enhanceNarrative = asyncHandler(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { content, industry, archetype } = req.body;
  const gameMasterId = req.user!.userId;

  if (!perplexityService.isEnabled()) {
    throw new AppError('Perplexity AI is not configured. Please set PERPLEXITY_API_KEY.', 503);
  }

  // Verify game exists and belongs to GM
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }
  if (game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized', 403);
  }

  // Enhance narrative with AI
  const enhanced = await perplexityService.enhanceNarrative(
    content,
    industry || 'general business',
    archetype || 'company'
  );

  // Track usage
  await PerplexityUsageModel.create({
    game_id: gameId,
    query_type: 'enhance_narrative',
    query_text: content.substring(0, 500),
    response_data: enhanced,
    sources: enhanced.sources,
    credits_used: 1,
    created_by: gameMasterId,
  });

  res.json({
    message: 'Narrative enhanced successfully',
    original: enhanced.originalContent,
    enhanced: enhanced.enhancedContent,
    context: enhanced.realWorldContext,
    sources: enhanced.sources,
    suggestions: enhanced.suggestions,
  });
});

/**
 * Get event inspiration from real-world news
 * POST /api/gm/games/:gameId/events/inspiration
 */
export const getEventInspiration = asyncHandler(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { industry, eventType } = req.body;
  const gameMasterId = req.user!.userId;

  if (!perplexityService.isEnabled()) {
    throw new AppError('Perplexity AI is not configured. Please set PERPLEXITY_API_KEY.', 503);
  }

  // Verify game exists and belongs to GM
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }
  if (game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized', 403);
  }

  // Get event ideas from AI
  const ideas = await perplexityService.getEventInspiration(
    industry || 'business',
    eventType || 'market disruption'
  );

  // Track usage
  await PerplexityUsageModel.create({
    game_id: gameId,
    query_type: 'event_inspiration',
    query_text: `${industry} - ${eventType}`,
    response_data: ideas,
    sources: ideas.flatMap(i => i.sources),
    credits_used: 1,
    created_by: gameMasterId,
  });

  res.json({
    message: 'Event inspiration generated successfully',
    ideas,
    count: ideas.length,
  });
});

/**
 * Get Perplexity usage statistics for a game
 * GET /api/gm/games/:gameId/perplexity-usage
 */
export const getPerplexityUsage = asyncHandler(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const gameMasterId = req.user!.userId;

  // Verify game exists and belongs to GM
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }
  if (game.game_master_id !== gameMasterId) {
    throw new AppError('Not authorized', 403);
  }

  // Get usage statistics
  const stats = await PerplexityUsageModel.getGameStats(gameId);
  const recentUsage = await PerplexityUsageModel.findByGame(gameId, 20);

  res.json({
    stats,
    recentUsage,
    cacheStats: perplexityService.getCacheStats(),
  });
});

/**
 * Ask the Market - Student business query with rate limiting
 * POST /api/teams/:teamId/market-query
 */
export const askMarket = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { question } = req.body;
  const userId = req.user!.userId;

  if (!perplexityService.isEnabled()) {
    throw new AppError('Ask the Market feature is not available. Perplexity AI is not configured.', 503);
  }

  if (!question || question.trim().length === 0) {
    throw new AppError('Question is required', 400);
  }

  // Get team to find game_id and check limits
  const teamResult = await import('../config/database').then(db => db.query(
    'SELECT game_id FROM teams WHERE id = $1',
    [teamId]
  ));

  if (teamResult.rows.length === 0) {
    throw new AppError('Team not found', 404);
  }

  const gameId = teamResult.rows[0].game_id;

  // Check rate limit (default: 5 queries per session)
  const rateLimit = parseInt(process.env.PERPLEXITY_RATE_LIMIT || '5');
  const rateLimitCheck = await PerplexityUsageModel.checkRateLimit(teamId, rateLimit);

  if (!rateLimitCheck.allowed) {
    throw new AppError(
      `Rate limit exceeded. You've used all ${rateLimit} queries for this session. Try again in the next session.`,
      429
    );
  }

  // Get game context for better answers
  const gameResult = await import('../config/database').then(db => db.query(
    `SELECT g.*, a.name as archetype_name, i.name as industry_name
     FROM games g
     LEFT JOIN archetypes a ON g.archetype_id = a.id
     LEFT JOIN industries i ON g.industry_id = i.id
     WHERE g.id = $1`,
    [gameId]
  ));

  const game = gameResult.rows[0];
  const gameContext = game ? {
    industry: game.industry_name || 'business',
    archetype: game.archetype_name || 'company',
    sessionNumber: 1, // TODO: Get actual session number
  } : undefined;

  // Get AI answer
  const result = await perplexityService.answerBusinessQuery(question, gameContext);

  // Track usage
  await PerplexityUsageModel.create({
    game_id: gameId,
    team_id: teamId,
    query_type: 'market_query',
    query_text: question,
    response_data: result,
    sources: result.sources,
    credits_used: 1,
    created_by: userId,
  });

  res.json({
    message: 'Question answered successfully',
    question: result.question,
    answer: result.answer,
    sources: result.sources,
    relatedQuestions: result.relatedQuestions,
    confidence: result.confidence,
    rateLimit: {
      remaining: rateLimitCheck.remaining - 1,
      total: rateLimit,
    },
  });
});

/**
 * Get team's market query history
 * GET /api/teams/:teamId/market-query/history
 */
export const getMarketQueryHistory = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  // Get team's query history
  const history = await PerplexityUsageModel.getTeamHistory(teamId, 10);

  // Check current rate limit status
  const rateLimit = parseInt(process.env.PERPLEXITY_RATE_LIMIT || '5');
  const rateLimitCheck = await PerplexityUsageModel.checkRateLimit(teamId, rateLimit);

  res.json({
    history,
    rateLimit: {
      remaining: rateLimitCheck.remaining,
      total: rateLimit,
      resetIn: rateLimitCheck.resetIn,
    },
  });
});
