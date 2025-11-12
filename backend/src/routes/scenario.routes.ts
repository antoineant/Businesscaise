import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import * as scenarioController from '../controllers/scenario.controller';

const router = Router();

/**
 * Public endpoints - no authentication required
 * These are used during game setup and team join flows
 */

// Get all company archetypes
router.get('/archetypes', scenarioController.getArchetypes);

// Get all industry types
router.get('/industries', scenarioController.getIndustries);

// Get scenario preview
router.get('/preview',
  [
    query('archetype').notEmpty().withMessage('Archetype ID is required'),
    query('industry').notEmpty().withMessage('Industry ID is required'),
  ],
  validate,
  scenarioController.getScenarioPreview
);

export default router;
