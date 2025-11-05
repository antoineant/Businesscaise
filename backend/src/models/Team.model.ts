import { query } from '../config/database';

export interface Team {
  id: string;
  game_id: string;
  name: string;
  color: string;
  members: any[];
  metrics: any;
  overall_score: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTeamData {
  game_id: string;
  name: string;
  color: string;
  members: any[];
  metrics: any;
}

export class TeamModel {
  /**
   * Create a new team
   */
  static async create(data: CreateTeamData): Promise<Team> {
    const result = await query(
      `INSERT INTO teams (game_id, name, color, members, metrics, overall_score)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING *`,
      [data.game_id, data.name, data.color, JSON.stringify(data.members), JSON.stringify(data.metrics)]
    );

    return result.rows[0];
  }

  /**
   * Find team by ID
   */
  static async findById(id: string): Promise<Team | null> {
    const result = await query(
      'SELECT * FROM teams WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all teams in a game
   */
  static async findByGame(gameId: string): Promise<Team[]> {
    const result = await query(
      'SELECT * FROM teams WHERE game_id = $1 ORDER BY overall_score DESC',
      [gameId]
    );

    return result.rows;
  }

  /**
   * Update team metrics
   */
  static async updateMetrics(id: string, metrics: any, score: number): Promise<Team | null> {
    const result = await query(
      'UPDATE teams SET metrics = $1, overall_score = $2 WHERE id = $3 RETURNING *',
      [JSON.stringify(metrics), score, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update team
   */
  static async update(id: string, data: Partial<CreateTeamData>): Promise<Team | null> {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'created_at') {
        if (key === 'members' || key === 'metrics') {
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
      `UPDATE teams SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete team
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM teams WHERE id = $1',
      [id]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Get metrics history for a team
   */
  static async getMetricsHistory(teamId: string): Promise<any[]> {
    const result = await query(
      `SELECT * FROM metrics_history
       WHERE team_id = $1
       ORDER BY recorded_at ASC`,
      [teamId]
    );

    return result.rows;
  }
}
