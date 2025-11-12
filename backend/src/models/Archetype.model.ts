import { query } from '../config/database';

export interface ArchetypeMetrics {
  financial: number;
  operations: number;
  marketing: number;
  hr: number;
  customer_satisfaction: number;
  overall: number;
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  starting_cash: number;
  starting_team_size: number;
  starting_metrics: ArchetypeMetrics;
  difficulty_modifier: number;
  narrative_template_set: string | null;
  created_at: Date;
}

export class ArchetypeModel {
  /**
   * Get all archetypes
   */
  static async findAll(): Promise<Archetype[]> {
    const result = await query(
      'SELECT * FROM company_archetypes ORDER BY name ASC',
      []
    );

    return result.rows;
  }

  /**
   * Find archetype by ID
   */
  static async findById(id: string): Promise<Archetype | null> {
    const result = await query(
      'SELECT * FROM company_archetypes WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if archetype exists
   */
  static async exists(id: string): Promise<boolean> {
    const result = await query(
      'SELECT id FROM company_archetypes WHERE id = $1',
      [id]
    );

    return result.rows.length > 0;
  }
}
