import { query } from '../config/database';

export interface GMEvent {
  id: string;
  game_id: string;
  event_type: string;
  title: string;
  description: string | null;
  impacts: MetricImpact[];
  target_teams: string[] | null;  // NULL means all teams
  applied_at: Date;
  created_at: Date;
}

export interface MetricImpact {
  metric: string;  // 'financial', 'operations', 'marketing', 'hr', 'customer_satisfaction'
  change: number;  // Positive or negative value
}

export interface CreateGMEventData {
  game_id: string;
  event_type: string;
  title: string;
  description?: string | null;
  impacts?: MetricImpact[];
  target_teams?: string[] | null;
  applied_at?: Date;
}

export class GMEventModel {
  /**
   * Create a new GM event
   */
  static async create(data: CreateGMEventData): Promise<GMEvent> {
    const result = await query(
      `INSERT INTO gm_events (game_id, event_type, title, description, impacts, target_teams, applied_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.game_id,
        data.event_type,
        data.title,
        data.description || null,
        JSON.stringify(data.impacts || []),
        data.target_teams || null,
        data.applied_at || new Date()
      ]
    );

    return result.rows[0];
  }

  /**
   * Find event by ID
   */
  static async findById(id: string): Promise<GMEvent | null> {
    const result = await query(
      'SELECT * FROM gm_events WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all events for a game
   */
  static async findByGame(gameId: string): Promise<GMEvent[]> {
    const result = await query(
      `SELECT * FROM gm_events
       WHERE game_id = $1
       ORDER BY applied_at DESC`,
      [gameId]
    );

    return result.rows;
  }

  /**
   * Find events by type
   */
  static async findByType(gameId: string, eventType: string): Promise<GMEvent[]> {
    const result = await query(
      `SELECT * FROM gm_events
       WHERE game_id = $1 AND event_type = $2
       ORDER BY applied_at DESC`,
      [gameId, eventType]
    );

    return result.rows;
  }

  /**
   * Find events affecting a specific team
   */
  static async findByTeam(gameId: string, teamId: string): Promise<GMEvent[]> {
    const result = await query(
      `SELECT * FROM gm_events
       WHERE game_id = $1
       AND (target_teams IS NULL OR $2 = ANY(target_teams))
       ORDER BY applied_at DESC`,
      [gameId, teamId]
    );

    return result.rows;
  }

  /**
   * Update event
   */
  static async update(id: string, data: Partial<CreateGMEventData>): Promise<GMEvent | null> {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        // Special handling for impacts (JSONB)
        if (key === 'impacts') {
          fields.push(`${key} = $${paramCounter}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCounter}`);
          values.push(value);
        }
        paramCounter++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE gm_events SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete event
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM gm_events WHERE id = $1',
      [id]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Delete all events for a game
   */
  static async deleteByGame(gameId: string): Promise<number> {
    const result = await query(
      'DELETE FROM gm_events WHERE game_id = $1',
      [gameId]
    );

    return result.rowCount || 0;
  }

  /**
   * Apply event impacts to teams
   * Returns array of team IDs that were affected
   */
  static async applyImpacts(eventId: string): Promise<string[]> {
    const event = await this.findById(eventId);
    if (!event || !event.impacts || event.impacts.length === 0) {
      return [];
    }

    // Get target teams
    const teamsResult = event.target_teams
      ? await query(
          `SELECT id, financial, operations, marketing, hr, customer_satisfaction
           FROM teams
           WHERE id = ANY($1)`,
          [event.target_teams]
        )
      : await query(
          `SELECT id, financial, operations, marketing, hr, customer_satisfaction
           FROM teams
           WHERE game_id = (SELECT game_id FROM gm_events WHERE id = $1)`,
          [eventId]
        );

    const affectedTeams: string[] = [];

    // Apply impacts to each team
    for (const team of teamsResult.rows) {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      for (const impact of event.impacts) {
        const currentValue = team[impact.metric] || 0;
        const newValue = Math.max(0, Math.min(100, currentValue + impact.change)); // Clamp 0-100

        updates.push(`${impact.metric} = $${paramCounter}`);
        values.push(newValue);
        paramCounter++;
      }

      if (updates.length > 0) {
        values.push(team.id);
        await query(
          `UPDATE teams SET ${updates.join(', ')} WHERE id = $${paramCounter}`,
          values
        );

        affectedTeams.push(team.id);
      }
    }

    return affectedTeams;
  }

  /**
   * Count events for a game
   */
  static async countByGame(gameId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) FROM gm_events WHERE game_id = $1',
      [gameId]
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Get recent events for a game (last N)
   */
  static async getRecent(gameId: string, limit: number = 10): Promise<GMEvent[]> {
    const result = await query(
      `SELECT * FROM gm_events
       WHERE game_id = $1
       ORDER BY applied_at DESC
       LIMIT $2`,
      [gameId, limit]
    );

    return result.rows;
  }
}
