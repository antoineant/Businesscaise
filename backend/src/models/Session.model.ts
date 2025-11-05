import { query } from '../config/database';

export interface Session {
  id: string;
  game_id: string;
  session_number: number;
  day: string;
  period: 'AM' | 'PM';
  title: string;
  description: string | null;
  unlock_type: 'manual' | 'scheduled';
  scheduled_unlock_time: Date | null;
  actual_unlock_time: Date | null;
  deadline: Date | null;
  status: 'locked' | 'active' | 'completed';
  challenges: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSessionData {
  game_id: string;
  session_number: number;
  day: string;
  period: 'AM' | 'PM';
  title: string;
  description?: string;
  unlock_type?: 'manual' | 'scheduled';
  scheduled_unlock_time?: Date;
  deadline?: Date;
  challenges?: any;
}

export class SessionModel {
  /**
   * Create a new session
   */
  static async create(data: CreateSessionData): Promise<Session> {
    const result = await query(
      `INSERT INTO sessions (
        game_id, session_number, day, period, title, description,
        unlock_type, scheduled_unlock_time, deadline, challenges
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.game_id,
        data.session_number,
        data.day,
        data.period,
        data.title,
        data.description || null,
        data.unlock_type || 'manual',
        data.scheduled_unlock_time || null,
        data.deadline || null,
        data.challenges || {}
      ]
    );

    return result.rows[0];
  }

  /**
   * Create multiple sessions in bulk
   */
  static async createBulk(sessions: CreateSessionData[]): Promise<Session[]> {
    const createdSessions: Session[] = [];

    for (const sessionData of sessions) {
      const session = await this.create(sessionData);
      createdSessions.push(session);
    }

    return createdSessions;
  }

  /**
   * Find session by ID
   */
  static async findById(id: string): Promise<Session | null> {
    const result = await query(
      'SELECT * FROM sessions WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all sessions for a game
   */
  static async findByGame(gameId: string): Promise<Session[]> {
    const result = await query(
      'SELECT * FROM sessions WHERE game_id = $1 ORDER BY session_number ASC',
      [gameId]
    );

    return result.rows;
  }

  /**
   * Find current active session for a game
   */
  static async findActiveSession(gameId: string): Promise<Session | null> {
    const result = await query(
      'SELECT * FROM sessions WHERE game_id = $1 AND status = $2 LIMIT 1',
      [gameId, 'active']
    );

    return result.rows[0] || null;
  }

  /**
   * Update session
   */
  static async update(id: string, data: Partial<Session>): Promise<Session | null> {
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
      `UPDATE sessions SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Update session status
   */
  static async updateStatus(id: string, status: Session['status']): Promise<Session | null> {
    const result = await query(
      'UPDATE sessions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Unlock session (set to active)
   */
  static async unlock(id: string): Promise<Session | null> {
    const result = await query(
      `UPDATE sessions
       SET status = 'active', actual_unlock_time = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Complete session
   */
  static async complete(id: string): Promise<Session | null> {
    const result = await query(
      `UPDATE sessions
       SET status = 'completed', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete session
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM sessions WHERE id = $1',
      [id]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Get session with submission count
   */
  static async getSessionWithStats(id: string): Promise<any> {
    const result = await query(
      `SELECT
        s.*,
        COUNT(DISTINCT sub.id) as total_submissions,
        COUNT(DISTINCT sub.team_id) as teams_submitted
       FROM sessions s
       LEFT JOIN submissions sub ON s.id = sub.session_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    return result.rows[0] || null;
  }
}
