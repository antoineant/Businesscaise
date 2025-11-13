import { query } from '../config/database';

/**
 * PerplexityUsage Model
 *
 * Tracks Perplexity API usage for:
 * - Cost management
 * - Rate limiting
 * - Analytics
 * - Audit trail
 */

export interface PerplexityUsage {
  id: string;
  game_id: string;
  team_id: string | null;
  query_type: 'reality_lens' | 'market_query' | 'event_inspiration' | 'enhance_narrative';
  query_text: string;
  response_data: any;
  sources: any[];
  credits_used: number;
  created_at: Date;
  created_by: string;
}

export interface CreateUsageData {
  game_id: string;
  team_id?: string | null;
  query_type: 'reality_lens' | 'market_query' | 'event_inspiration' | 'enhance_narrative';
  query_text: string;
  response_data: any;
  sources?: any[];
  credits_used?: number;
  created_by: string;
}

export interface UsageStats {
  totalQueries: number;
  queryByType: Record<string, number>;
  totalCredits: number;
  teamQueries: Record<string, number>;
}

export class PerplexityUsageModel {
  /**
   * Create a new usage record
   */
  static async create(data: CreateUsageData): Promise<PerplexityUsage> {
    const queryText = `
      INSERT INTO perplexity_usage (
        game_id, team_id, query_type, query_text,
        response_data, sources, credits_used, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.game_id,
      data.team_id || null,
      data.query_type,
      data.query_text,
      JSON.stringify(data.response_data),
      JSON.stringify(data.sources || []),
      data.credits_used || 1,
      data.created_by,
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  /**
   * Get usage by game
   */
  static async findByGame(gameId: string, limit: number = 100): Promise<PerplexityUsage[]> {
    const queryText = `
      SELECT * FROM perplexity_usage
      WHERE game_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await query(queryText, [gameId, limit]);
    return result.rows;
  }

  /**
   * Get usage by team
   */
  static async findByTeam(teamId: string, limit: number = 50): Promise<PerplexityUsage[]> {
    const queryText = `
      SELECT * FROM perplexity_usage
      WHERE team_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await query(queryText, [teamId, limit]);
    return result.rows;
  }

  /**
   * Get usage by type
   */
  static async findByType(
    gameId: string,
    queryType: string,
    limit: number = 50
  ): Promise<PerplexityUsage[]> {
    const queryText = `
      SELECT * FROM perplexity_usage
      WHERE game_id = $1 AND query_type = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    const result = await query(queryText, [gameId, queryType, limit]);
    return result.rows;
  }

  /**
   * Count team queries in a time window (for rate limiting)
   */
  static async countTeamQueries(
    teamId: string,
    queryType: string,
    windowMinutes: number = 60
  ): Promise<number> {
    const queryText = `
      SELECT COUNT(*) as count
      FROM perplexity_usage
      WHERE team_id = $1
      AND query_type = $2
      AND created_at > NOW() - INTERVAL '${windowMinutes} minutes'
    `;

    const result = await query(queryText, [teamId, queryType]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Count team queries per session (for session-based rate limiting)
   */
  static async countTeamQueriesPerSession(
    teamId: string,
    sessionId: string
  ): Promise<number> {
    // Note: This assumes we add session_id to perplexity_usage table
    // For now, count queries in the last 4 hours (typical session length)
    const queryText = `
      SELECT COUNT(*) as count
      FROM perplexity_usage
      WHERE team_id = $1
      AND query_type = 'market_query'
      AND created_at > NOW() - INTERVAL '4 hours'
    `;

    const result = await query(queryText, [teamId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get usage statistics for a game
   */
  static async getGameStats(gameId: string): Promise<UsageStats> {
    // Total queries
    const totalResult = await query(
      'SELECT COUNT(*) as count FROM perplexity_usage WHERE game_id = $1',
      [gameId]
    );

    // Queries by type
    const typeResult = await query(
      `SELECT query_type, COUNT(*) as count
       FROM perplexity_usage
       WHERE game_id = $1
       GROUP BY query_type`,
      [gameId]
    );

    // Total credits
    const creditsResult = await query(
      'SELECT SUM(credits_used) as total FROM perplexity_usage WHERE game_id = $1',
      [gameId]
    );

    // Queries by team
    const teamResult = await query(
      `SELECT team_id, COUNT(*) as count
       FROM perplexity_usage
       WHERE game_id = $1 AND team_id IS NOT NULL
       GROUP BY team_id`,
      [gameId]
    );

    const queryByType: Record<string, number> = {};
    typeResult.rows.forEach((row: any) => {
      queryByType[row.query_type] = parseInt(row.count);
    });

    const teamQueries: Record<string, number> = {};
    teamResult.rows.forEach((row: any) => {
      teamQueries[row.team_id] = parseInt(row.count);
    });

    return {
      totalQueries: parseInt(totalResult.rows[0].count) || 0,
      queryByType,
      totalCredits: parseInt(creditsResult.rows[0].total) || 0,
      teamQueries,
    };
  }

  /**
   * Get recent queries for a team (for display in UI)
   */
  static async getTeamHistory(teamId: string, limit: number = 10): Promise<PerplexityUsage[]> {
    const queryText = `
      SELECT
        id, query_type, query_text,
        response_data, sources, created_at
      FROM perplexity_usage
      WHERE team_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await query(queryText, [teamId, limit]);
    return result.rows;
  }

  /**
   * Delete old usage records (cleanup)
   */
  static async deleteOldRecords(daysOld: number = 90): Promise<number> {
    const queryText = `
      DELETE FROM perplexity_usage
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `;

    const result = await query(queryText);
    return result.rowCount || 0;
  }

  /**
   * Check if team has exceeded rate limit
   */
  static async checkRateLimit(
    teamId: string,
    maxQueries: number = 5
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const count = await this.countTeamQueriesPerSession(teamId, 'current');

    return {
      allowed: count < maxQueries,
      remaining: Math.max(0, maxQueries - count),
      resetIn: 4 * 60 * 60, // 4 hours in seconds
    };
  }
}

export default PerplexityUsageModel;
