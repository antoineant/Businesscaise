import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requirePlayer } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as teamController from '../controllers/team.controller';
import * as narrativeController from '../controllers/narrative.controller';

const router = Router();

// Most routes require player authentication (except join)
// Join route is public to allow teams to register

/**
 * Join game (no auth required)
 */
router.post('/join',
  [
    body('game_id').isUUID().withMessage('Game ID is required'),
    body('team_name').notEmpty().withMessage('Team name is required'),
    body('color').optional().isString(),
    body('members').optional().isArray(),
  ],
  validate,
  teamController.joinGame
);

// Apply authentication to remaining routes
router.use(authenticate);

/**
 * Get current team info
 */
router.get('/current/:teamId',
  [param('teamId').isUUID()],
  validate,
  teamController.getCurrentTeam
);

/**
 * Get dashboard data
 */
router.get('/:teamId/dashboard',
  [param('teamId').isUUID()],
  validate,
  teamController.getDashboard
);

/**
 * Get current active session
 */
router.get('/:teamId/sessions/current',
  [param('teamId').isUUID()],
  validate,
  teamController.getCurrentSession
);

/**
 * Get challenges for a session
 */
router.get('/:teamId/sessions/:sessionId/challenges',
  [
    param('teamId').isUUID(),
    param('sessionId').isUUID(),
  ],
  validate,
  teamController.getSessionChallenges
);

/**
 * Submit decision
 */
router.post('/:teamId/submit',
  [
    param('teamId').isUUID(),
    body('session_id').isUUID().withMessage('Session ID is required'),
    body('challenge_id').notEmpty().withMessage('Challenge ID is required'),
    body('submission_data').notEmpty().withMessage('Submission data is required'),
    body('file_urls').optional().isArray(),
  ],
  validate,
  teamController.submitDecision
);

/**
 * Get latest results briefing
 */
router.get('/:teamId/results/latest',
  [param('teamId').isUUID()],
  validate,
  teamController.getLatestResults
);

/**
 * Get metrics history
 */
router.get('/:teamId/history',
  [param('teamId').isUUID()],
  validate,
  teamController.getMetricsHistory
);

/**
 * Get leaderboard
 */
router.get('/:teamId/leaderboard',
  [param('teamId').isUUID()],
  validate,
  teamController.getLeaderboard
);

/**
 * Get team's pod information
 */
router.get('/:teamId/pod',
  [param('teamId').isUUID()],
  validate,
  teamController.getTeamPod
);

/**
 * Get pod leaderboard for team's pod
 */
router.get('/:teamId/pod/leaderboard',
  [param('teamId').isUUID()],
  validate,
  teamController.getPodLeaderboard
);

/**
 * Get team's category rankings
 */
router.get('/:teamId/categories',
  [param('teamId').isUUID()],
  validate,
  teamController.getTeamCategories
);

/**
 * Narrative endpoints for teams
 */
// Get narratives for team
router.get('/:teamId/narratives',
  [param('teamId').isUUID()],
  validate,
  narrativeController.getTeamNarratives
);

// Get session briefing
router.get('/:teamId/sessions/:sessionId/briefing',
  [
    param('teamId').isUUID(),
    param('sessionId').isUUID(),
  ],
  validate,
  narrativeController.getSessionBriefing
);

/**
 * AI-Powered Features (Ask the Market)
 */
// Ask the Market - Submit business question
router.post('/:teamId/market-query',
  [
    param('teamId').isUUID(),
    body('question').notEmpty().withMessage('Question is required'),
  ],
  validate,
  narrativeController.askMarket
);

// Get market query history
router.get('/:teamId/market-query/history',
  [param('teamId').isUUID()],
  validate,
  narrativeController.getMarketQueryHistory
);

export default router;
