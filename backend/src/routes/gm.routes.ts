import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireGameMaster } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as gmController from '../controllers/gm.controller';
import * as narrativeController from '../controllers/narrative.controller';

const router = Router();

// All routes require GM authentication
router.use(authenticate);
router.use(requireGameMaster);

/**
 * Game Management
 */
router.post('/games',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('settings').optional().isObject(),
    // Scenario customization fields
    body('archetype_id').optional().isString(),
    body('industry_id').optional().isString(),
    body('company_name').optional().isString(),
    body('product_description').optional().isString(),
  ],
  validate,
  gmController.createGame
);

router.get('/games', gmController.listGames);

router.get('/games/:id',
  [param('id').isUUID()],
  validate,
  gmController.getGameDetails
);

router.put('/games/:id',
  [
    param('id').isUUID(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('settings').optional().isObject(),
  ],
  validate,
  gmController.updateGame
);

router.delete('/games/:id',
  [param('id').isUUID()],
  validate,
  gmController.deleteGame
);

/**
 * Game Control
 */
router.post('/games/:id/start',
  [param('id').isUUID()],
  validate,
  gmController.startGame
);

router.post('/games/:id/pause',
  [param('id').isUUID()],
  validate,
  gmController.pauseGame
);

router.post('/games/:id/resume',
  [param('id').isUUID()],
  validate,
  gmController.resumeGame
);

/**
 * Session Management
 */
router.get('/games/:id/sessions',
  [param('id').isUUID()],
  validate,
  gmController.listSessions
);

router.post('/games/:gameId/sessions/:sessionId/unlock',
  [
    param('gameId').isUUID(),
    param('sessionId').isUUID(),
  ],
  validate,
  gmController.unlockSession
);

router.put('/games/:gameId/sessions/:sessionId',
  [
    param('gameId').isUUID(),
    param('sessionId').isUUID(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('deadline').optional().isISO8601(),
    body('challenges').optional().isObject(),
  ],
  validate,
  gmController.updateSession
);

/**
 * Team Monitoring
 */
router.get('/games/:id/teams',
  [param('id').isUUID()],
  validate,
  gmController.listTeams
);

router.get('/games/:gameId/teams/:teamId',
  [
    param('gameId').isUUID(),
    param('teamId').isUUID(),
  ],
  validate,
  gmController.getTeamDetails
);

router.get('/games/:gameId/teams/:teamId/history',
  [
    param('gameId').isUUID(),
    param('teamId').isUUID(),
  ],
  validate,
  gmController.getTeamHistory
);

/**
 * Submissions & Scoring
 */
router.get('/games/:id/submissions',
  [param('id').isUUID()],
  validate,
  gmController.listSubmissions
);

router.get('/submissions/:id',
  [param('id').isUUID()],
  validate,
  gmController.getSubmissionDetails
);

router.post('/submissions/:id/score',
  [
    param('id').isUUID(),
    body('score').isNumeric().withMessage('Score is required'),
    body('feedback').optional().isString(),
  ],
  validate,
  gmController.scoreSubmission
);

/**
 * Narratives & Events
 */
// Create narrative
router.post('/games/:gameId/narratives',
  [
    param('gameId').isUUID(),
    body('type').isIn(['briefing', 'news', 'email', 'alert']).withMessage('Invalid narrative type'),
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('author').optional().isString(),
    body('session_id').optional().isUUID(),
    body('target_teams').optional().isArray(),
    body('published_at').optional().isISO8601(),
  ],
  validate,
  narrativeController.createNarrative
);

// Get narratives with filters
router.get('/games/:gameId/narratives',
  [
    param('gameId').isUUID(),
  ],
  validate,
  narrativeController.getNarratives
);

// Update narrative
router.put('/narratives/:id',
  [
    param('id').isUUID(),
    body('type').optional().isIn(['briefing', 'news', 'email', 'alert']),
    body('title').optional().isString(),
    body('content').optional().isString(),
    body('author').optional().isString(),
    body('session_id').optional().isUUID(),
    body('target_teams').optional().isArray(),
    body('published_at').optional().isISO8601(),
  ],
  validate,
  narrativeController.updateNarrative
);

// Delete narrative
router.delete('/narratives/:id',
  [param('id').isUUID()],
  validate,
  narrativeController.deleteNarrative
);

// Create GM event
router.post('/games/:gameId/events',
  [
    param('gameId').isUUID(),
    body('event_type').notEmpty().withMessage('Event type is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('impacts').optional().isArray(),
    body('target_teams').optional().isArray(),
    body('applied_at').optional().isISO8601(),
    body('auto_generate_narrative').optional().isBoolean(),
  ],
  validate,
  narrativeController.createEvent
);

// Get events for a game
router.get('/games/:gameId/events',
  [param('gameId').isUUID()],
  validate,
  narrativeController.getEvents
);

/**
 * AI-Powered Features (Reality Lens & Event Inspiration)
 */
// Enhance narrative with AI
router.post('/games/:gameId/narratives/enhance',
  [
    param('gameId').isUUID(),
    body('content').notEmpty().withMessage('Content is required'),
    body('industry').optional().isString(),
    body('archetype').optional().isString(),
  ],
  validate,
  narrativeController.enhanceNarrative
);

// Get event inspiration from real-world news
router.post('/games/:gameId/events/inspiration',
  [
    param('gameId').isUUID(),
    body('industry').optional().isString(),
    body('eventType').optional().isString(),
  ],
  validate,
  narrativeController.getEventInspiration
);

// Get Perplexity usage statistics
router.get('/games/:gameId/perplexity-usage',
  [param('gameId').isUUID()],
  validate,
  narrativeController.getPerplexityUsage
);

/**
 * Analytics & Reporting
 */
router.get('/games/:id/leaderboard',
  [param('id').isUUID()],
  validate,
  gmController.getLeaderboard
);

router.post('/games/:id/generate-briefing', async (req, res) => {
  res.json({ message: 'Generate results briefing - to be implemented' });
});

router.get('/games/:id/analytics',
  [param('id').isUUID()],
  validate,
  gmController.getAnalytics
);

router.post('/games/:id/export', async (req, res) => {
  res.json({ message: 'Export data - to be implemented' });
});

export default router;
