import { query } from '../config/database';

export interface Submission {
  id: string;
  team_id: string;
  session_id: string;
  challenge_id: string;
  submission_data: any;
  file_urls: string[] | null;
  submitted_at: Date;
  scored_at: Date | null;
  score: number | null;
  feedback: string | null;
  status: 'pending' | 'scored' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export interface CreateSubmissionData {
  team_id: string;
  session_id: string;
  challenge_id: string;
  submission_data: any;
  file_urls?: string[];
}

export class SubmissionModel {
  /**
   * Create a new submission
   */
  static async create(data: CreateSubmissionData): Promise<Submission> {
    const result = await query(
      `INSERT INTO submissions (
        team_id, session_id, challenge_id, submission_data, file_urls
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        data.team_id,
        data.session_id,
        data.challenge_id,
        JSON.stringify(data.submission_data),
        data.file_urls ? JSON.stringify(data.file_urls) : null
      ]
    );

    return result.rows[0];
  }

  /**
   * Find submission by ID
   */
  static async findById(id: string): Promise<Submission | null> {
    const result = await query(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all submissions for a team
   */
  static async findByTeam(teamId: string): Promise<Submission[]> {
    const result = await query(
      'SELECT * FROM submissions WHERE team_id = $1 ORDER BY submitted_at DESC',
      [teamId]
    );

    return result.rows;
  }

  /**
   * Find all submissions for a session
   */
  static async findBySession(sessionId: string): Promise<Submission[]> {
    const result = await query(
      'SELECT * FROM submissions WHERE session_id = $1 ORDER BY submitted_at DESC',
      [sessionId]
    );

    return result.rows;
  }

  /**
   * Find all submissions for a game (with team and session details)
   */
  static async findByGame(gameId: string): Promise<any[]> {
    const result = await query(
      `SELECT
        s.*,
        t.name as team_name,
        t.game_id,
        ses.session_number,
        ses.title as session_title
       FROM submissions s
       JOIN teams t ON s.team_id = t.id
       JOIN sessions ses ON s.session_id = ses.id
       WHERE t.game_id = $1
       ORDER BY s.submitted_at DESC`,
      [gameId]
    );

    return result.rows;
  }

  /**
   * Find submissions by status (with team and session details)
   */
  static async findByStatus(gameId: string, status: Submission['status']): Promise<any[]> {
    const result = await query(
      `SELECT
        s.*,
        t.name as team_name,
        t.game_id,
        ses.session_number,
        ses.title as session_title
       FROM submissions s
       JOIN teams t ON s.team_id = t.id
       JOIN sessions ses ON s.session_id = ses.id
       WHERE t.game_id = $1 AND s.status = $2
       ORDER BY s.submitted_at DESC`,
      [gameId, status]
    );

    return result.rows;
  }

  /**
   * Update submission
   */
  static async update(id: string, data: Partial<Submission>): Promise<Submission | null> {
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
      `UPDATE submissions SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Score submission
   */
  static async score(
    id: string,
    score: number,
    feedback?: string
  ): Promise<Submission | null> {
    const result = await query(
      `UPDATE submissions
       SET score = $1, feedback = $2, status = 'scored', scored_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [score, feedback || null, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete submission
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM submissions WHERE id = $1',
      [id]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Get submission with team and session info
   */
  static async getSubmissionWithDetails(id: string): Promise<any> {
    const result = await query(
      `SELECT
        s.*,
        t.name as team_name,
        t.game_id,
        ses.session_number,
        ses.title as session_title
       FROM submissions s
       JOIN teams t ON s.team_id = t.id
       JOIN sessions ses ON s.session_id = ses.id
       WHERE s.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Get pending submissions count for a game
   */
  static async getPendingCount(gameId: string): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count FROM submissions s
       JOIN teams t ON s.team_id = t.id
       WHERE t.game_id = $1 AND s.status = 'pending'`,
      [gameId]
    );

    return parseInt(result.rows[0].count, 10);
  }
}
