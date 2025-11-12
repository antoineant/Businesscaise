import { query } from '../config/database';

export interface Industry {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  product_examples: string[];
  npc_set: string | null;
  challenge_focus: string[];
  created_at: Date;
}

export class IndustryModel {
  /**
   * Get all industries
   */
  static async findAll(): Promise<Industry[]> {
    const result = await query(
      'SELECT * FROM industry_types ORDER BY name ASC',
      []
    );

    return result.rows;
  }

  /**
   * Find industry by ID
   */
  static async findById(id: string): Promise<Industry | null> {
    const result = await query(
      'SELECT * FROM industry_types WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if industry exists
   */
  static async exists(id: string): Promise<boolean> {
    const result = await query(
      'SELECT id FROM industry_types WHERE id = $1',
      [id]
    );

    return result.rows.length > 0;
  }
}
