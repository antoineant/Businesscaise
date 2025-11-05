import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireGameMaster } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as gmController from '../controllers/gm.controller';

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
router.post('/games/:id/narratives', async (req, res) => {
  res.json({ message: 'Create narrative - to be implemented' });
});

router.get('/games/:id/narratives', async (req, res) => {
  res.json({ message: 'List narratives - to be implemented' });
});

router.post('/games/:id/events', async (req, res) => {
  res.json({ message: 'Inject custom event - to be implemented' });
});

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
