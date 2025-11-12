import { query } from '../config/database';

export interface Game {
  id: string;
  title: string;
  description: string | null;
  game_master_id: string;
  start_date: Date | null;
  end_date: Date | null;
  current_session_id: string | null;
  status: 'setup' | 'active' | 'paused' | 'completed';
  settings: any;
  // Scenario customization fields
  archetype_id: string | null;
  industry_id: string | null;
  company_name: string | null;
  product_description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGameData {
  title: string;
  description?: string;
  game_master_id: string;
  settings?: any;
  // Scenario customization fields
  archetype_id?: string;
  industry_id?: string;
  company_name?: string;
  product_description?: string;
}

export class GameModel {
  /**
   * Create a new game
   */
  static async create(data: CreateGameData): Promise<Game> {
    const result = await query(
      `INSERT INTO games (title, description, game_master_id, settings, archetype_id, industry_id, company_name, product_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.title,
        data.description || null,
        data.game_master_id,
        data.settings || {},
        data.archetype_id || null,
        data.industry_id || null,
        data.company_name || null,
        data.product_description || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Find game by ID
   */
  static async findById(id: string): Promise<Game | null> {
    const result = await query(
      'SELECT * FROM games WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all games by Game Master
   */
  static async findByGameMaster(gameMasterId: string): Promise<Game[]> {
    const result = await query(
      'SELECT * FROM games WHERE game_master_id = $1 ORDER BY created_at DESC',
      [gameMasterId]
    );

    return result.rows;
  }

  /**
   * Update game
   */
  static async update(id: string, data: Partial<Game>): Promise<Game | null> {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE games SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Update game status
   */
  static async updateStatus(id: string, status: Game['status']): Promise<Game | null> {
    const result = await query(
      'UPDATE games SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete game
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM games WHERE id = $1',
      [id]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Check if user is game master of this game
   */
  static async isGameMaster(gameId: string, userId: string): Promise<boolean> {
    const result = await query(
      'SELECT id FROM games WHERE id = $1 AND game_master_id = $2',
      [gameId, userId]
    );

    return result.rows.length > 0;
  }
}
