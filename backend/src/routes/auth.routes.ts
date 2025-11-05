import { Router } from 'express';
import { body } from 'express-validator';
// Controllers will be implemented in next phase
// import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user (GM or Player)
 */
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role').isIn(['game_master', 'player']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    // Placeholder - will implement controller
    res.json({ message: 'Register endpoint - to be implemented' });
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    // Placeholder - will implement controller
    res.json({ message: 'Login endpoint - to be implemented' });
  }
);

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
  // Placeholder - will implement auth middleware and controller
  res.json({ message: 'Get current user - to be implemented' });
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;
