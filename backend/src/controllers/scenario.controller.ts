import { Request, Response } from 'express';
import { ArchetypeModel, Archetype } from '../models/Archetype.model';
import { IndustryModel, Industry } from '../models/Industry.model';

/**
 * Get all company archetypes
 */
export const getArchetypes = async (req: Request, res: Response) => {
  try {
    const archetypes = await ArchetypeModel.findAll();

    res.json({
      success: true,
      archetypes
    });
  } catch (error) {
    console.error('Error fetching archetypes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch archetypes'
    });
  }
};

/**
 * Get all industry types
 */
export const getIndustries = async (req: Request, res: Response) => {
  try {
    const industries = await IndustryModel.findAll();

    res.json({
      success: true,
      industries
    });
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch industries'
    });
  }
};

/**
 * Get scenario preview
 * Combines archetype and industry data to show what the game scenario will look like
 */
export const getScenarioPreview = async (req: Request, res: Response) => {
  try {
    const { archetype: archetypeId, industry: industryId } = req.query;

    // Fetch archetype and industry
    const archetype = await ArchetypeModel.findById(archetypeId as string);
    const industry = await IndustryModel.findById(industryId as string);

    // Validate both exist
    if (!archetype) {
      return res.status(404).json({
        success: false,
        message: `Archetype '${archetypeId}' not found`
      });
    }

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: `Industry '${industryId}' not found`
      });
    }

    // Build preview response
    const preview = {
      name: `${archetype.name} - ${industry.name}`,
      description: archetype.description,
      archetype: {
        id: archetype.id,
        name: archetype.name,
        icon: archetype.icon,
        description: archetype.description,
        difficulty_modifier: archetype.difficulty_modifier
      },
      industry: {
        id: industry.id,
        name: industry.name,
        icon: industry.icon,
        description: industry.description,
        product_examples: industry.product_examples
      },
      starting_conditions: {
        cash: archetype.starting_cash,
        team_size: archetype.starting_team_size,
        metrics: archetype.starting_metrics
      },
      focus_areas: industry.challenge_focus,
      example_products: industry.product_examples
    };

    res.json({
      success: true,
      scenario: preview
    });
  } catch (error) {
    console.error('Error generating scenario preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate scenario preview'
    });
  }
};
