import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../config/auth';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Authentication error',
    });
  }
};

/**
 * Game Master only middleware
 * Requires authentication first
 */
export const requireGameMaster = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  if (req.user.role !== 'game_master') {
    return res.status(403).json({
      error: 'Game Master access required',
    });
  }

  next();
};

/**
 * Player only middleware
 * Requires authentication first
 */
export const requirePlayer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  if (req.user.role !== 'player') {
    return res.status(403).json({
      error: 'Player access required',
    });
  }

  next();
};
