import { query } from '../config/database';

export interface Narrative {
  id: string;
  game_id: string;
  session_id: string | null;
  type: 'briefing' | 'news' | 'email' | 'alert';
  title: string;
  content: string;
  author: string | null;
  target_teams: string[] | null;  // NULL means all teams
  published_at: Date;
  created_at: Date;
}

export interface CreateNarrativeData {
  game_id: string;
  session_id?: string | null;
  type: 'briefing' | 'news' | 'email' | 'alert';
  title: string;
  content: string;
  author?: string | null;
  target_teams?: string[] | null;
  published_at?: Date;
}

export interface NarrativeFilters {
  type?: string;
  session_id?: string;
  target_team_id?: string;
}

export class NarrativeModel {
  /**
   * Create a new narrative
   */
  static async create(data: CreateNarrativeData): Promise<Narrative> {
    const result = await query(
      `INSERT INTO narratives (game_id, session_id, type, title, content, author, target_teams, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.game_id,
        data.session_id || null,
        data.type,
        data.title,
        data.content,
        data.author || null,
        data.target_teams || null,
        data.published_at || new Date()
      ]
    );

    return result.rows[0];
  }

  /**
   * Find narrative by ID
   */
  static async findById(id: string): Promise<Narrative | null> {
    const result = await query(
      'SELECT * FROM narratives WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all narratives for a game with optional filters
   */
  static async findByGame(gameId: string, filters?: NarrativeFilters): Promise<Narrative[]> {
    let queryText = 'SELECT * FROM narratives WHERE game_id = $1';
    const params: any[] = [gameId];
    let paramCounter = 2;

    // Apply filters
    if (filters?.type) {
      queryText += ` AND type = $${paramCounter}`;
      params.push(filters.type);
      paramCounter++;
    }

    if (filters?.session_id) {
      queryText += ` AND session_id = $${paramCounter}`;
      params.push(filters.session_id);
      paramCounter++;
    }

    if (filters?.target_team_id) {
      // Match narratives where target_teams is NULL (all teams) OR contains the team ID
      queryText += ` AND (target_teams IS NULL OR $${paramCounter} = ANY(target_teams))`;
      params.push(filters.target_team_id);
      paramCounter++;
    }

    queryText += ' ORDER BY published_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Find narratives by type
   */
  static async findByType(gameId: string, type: string): Promise<Narrative[]> {
    const result = await query(
      `SELECT * FROM narratives
       WHERE game_id = $1 AND type = $2
       ORDER BY published_at DESC`,
      [gameId, type]
    );

    return result.rows;
  }

  /**
   * Find narratives for a specific session
   */
  static async findBySession(sessionId: string): Promise<Narrative[]> {
    const result = await query(
      `SELECT * FROM narratives
       WHERE session_id = $1
       ORDER BY published_at DESC`,
      [sessionId]
    );

    return result.rows;
  }

  /**
   * Find narratives visible to a specific team
   * (target_teams is NULL or contains team ID)
   */
  static async findByTeam(gameId: string, teamId: string, filters?: NarrativeFilters): Promise<Narrative[]> {
    let queryText = `
      SELECT * FROM narratives
      WHERE game_id = $1
      AND (target_teams IS NULL OR $2 = ANY(target_teams))
    `;
    const params: any[] = [gameId, teamId];
    let paramCounter = 3;

    // Apply filters
    if (filters?.type) {
      queryText += ` AND type = $${paramCounter}`;
      params.push(filters.type);
      paramCounter++;
    }

    if (filters?.session_id) {
      queryText += ` AND session_id = $${paramCounter}`;
      params.push(filters.session_id);
      paramCounter++;
    }

    queryText += ' ORDER BY published_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Update narrative
   */
  static async update(id: string, data: Partial<CreateNarrativeData>): Promise<Narrative | null> {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
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
      `UPDATE narratives SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete narrative
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM narratives WHERE id = $1',
      [id]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Delete all narratives for a game
   */
  static async deleteByGame(gameId: string): Promise<number> {
    const result = await query(
      'DELETE FROM narratives WHERE game_id = $1',
      [gameId]
    );

    return result.rowCount || 0;
  }

  /**
   * Count narratives for a game
   */
  static async countByGame(gameId: string, filters?: NarrativeFilters): Promise<number> {
    let queryText = 'SELECT COUNT(*) FROM narratives WHERE game_id = $1';
    const params: any[] = [gameId];
    let paramCounter = 2;

    if (filters?.type) {
      queryText += ` AND type = $${paramCounter}`;
      params.push(filters.type);
      paramCounter++;
    }

    if (filters?.session_id) {
      queryText += ` AND session_id = $${paramCounter}`;
      params.push(filters.session_id);
      paramCounter++;
    }

    const result = await query(queryText, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get recent narratives for a game (last N)
   */
  static async getRecent(gameId: string, limit: number = 10): Promise<Narrative[]> {
    const result = await query(
      `SELECT * FROM narratives
       WHERE game_id = $1
       ORDER BY published_at DESC
       LIMIT $2`,
      [gameId, limit]
    );

    return result.rows;
  }
}
