import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as podController from '../controllers/pod.controller';

const router = Router();

/**
 * All pod endpoints require authentication
 * Game Master endpoints additionally verify GM ownership in the controller
 */

// ============================================================================
// Pod Management Endpoints (Game Master only)
// ============================================================================

/**
 * POST /api/gm/games/:gameId/pods/assign
 * Assign teams to pods using the game's configured method
 */
router.post(
  '/games/:gameId/pods/assign',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
  ],
  validate,
  podController.assignPods
);

/**
 * GET /api/gm/games/:gameId/pods
 * Get all pods for a game with team details
 */
router.get(
  '/games/:gameId/pods',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
  ],
  validate,
  podController.getGamePods
);

/**
 * GET /api/gm/games/:gameId/pods/:podId/leaderboard
 * Get leaderboard for a specific pod
 */
router.get(
  '/games/:gameId/pods/:podId/leaderboard',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    param('podId').notEmpty().withMessage('Pod ID is required'),
  ],
  validate,
  podController.getPodLeaderboard
);

/**
 * PUT /api/gm/games/:gameId/teams/:teamId/pod
 * Manually assign a team to a specific pod
 */
router.put(
  '/games/:gameId/teams/:teamId/pod',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    param('teamId').isUUID().withMessage('Invalid team ID'),
    body('pod_id').notEmpty().withMessage('Pod ID is required'),
    body('pod_name').notEmpty().withMessage('Pod name is required'),
  ],
  validate,
  podController.assignTeamToPod
);

// ============================================================================
// Category Rankings Endpoints
// ============================================================================

/**
 * GET /api/gm/games/:gameId/categories
 * Get category rankings summary (all category leaders)
 */
router.get(
  '/games/:gameId/categories',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    query('session_id').optional().isUUID().withMessage('Invalid session ID'),
  ],
  validate,
  podController.getCategoryRankings
);

/**
 * GET /api/gm/games/:gameId/categories/:category
 * Get leaderboard for a specific category
 */
router.get(
  '/games/:gameId/categories/:category',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    param('category').isIn(['financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall'])
      .withMessage('Invalid category'),
    query('scope').optional().isIn(['pod', 'global']).withMessage('Scope must be "pod" or "global"'),
    query('pod_id').optional().isString(),
    query('session_id').optional().isUUID().withMessage('Invalid session ID'),
  ],
  validate,
  podController.getCategoryLeaderboard
);

/**
 * GET /api/gm/games/:gameId/teams/:teamId/categories
 * Get all category rankings for a specific team
 */
router.get(
  '/games/:gameId/teams/:teamId/categories',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    param('teamId').isUUID().withMessage('Invalid team ID'),
    query('session_id').optional().isUUID().withMessage('Invalid session ID'),
  ],
  validate,
  podController.getTeamCategoryRankings
);

/**
 * POST /api/gm/games/:gameId/categories/snapshot
 * Snapshot category rankings at session end
 */
router.post(
  '/games/:gameId/categories/snapshot',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    body('session_id').isUUID().withMessage('Session ID is required'),
  ],
  validate,
  podController.snapshotCategoryRankings
);

/**
 * GET /api/gm/games/:gameId/sessions/:sessionId/categories
 * Get historical category rankings for a session
 */
router.get(
  '/games/:gameId/sessions/:sessionId/categories',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    query('category').optional().isIn(['financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall'])
      .withMessage('Invalid category'),
    query('scope').optional().isIn(['pod', 'global']).withMessage('Scope must be "pod" or "global"'),
    query('pod_id').optional().isString(),
  ],
  validate,
  podController.getHistoricalCategoryRankings
);

export default router;
