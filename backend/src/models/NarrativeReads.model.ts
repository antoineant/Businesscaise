import { query } from '../config/database';

/**
 * NarrativeReads Model
 *
 * Tracks when teams mark narratives as read
 * Supports unread count tracking and notification system
 */

export interface NarrativeRead {
  id: string;
  narrative_id: string;
  team_id: string;
  read_at: Date;
  read_by: string | null;
}

export interface CreateReadData {
  narrative_id: string;
  team_id: string;
  read_by?: string;
}

export interface UnreadCounts {
  total: number;
  byType: {
    briefing: number;
    news: number;
    email: number;
    alert: number;
  };
}

export class NarrativeReadsModel {
  /**
   * Mark a narrative as read
   */
  static async markAsRead(data: CreateReadData): Promise<boolean> {
    const queryText = `
      SELECT mark_narrative_read($1, $2, $3) as newly_marked
    `;

    const result = await query(queryText, [
      data.narrative_id,
      data.team_id,
      data.read_by || null,
    ]);

    return result.rows[0].newly_marked;
  }

  /**
   * Mark multiple narratives as read
   */
  static async markMultipleAsRead(
    narrativeIds: string[],
    teamId: string,
    readBy?: string
  ): Promise<number> {
    if (narrativeIds.length === 0) {
      return 0;
    }

    const queryText = `
      INSERT INTO narrative_reads (narrative_id, team_id, read_by)
      SELECT
        unnest($1::uuid[]) as narrative_id,
        $2::uuid as team_id,
        $3::uuid as read_by
      ON CONFLICT (narrative_id, team_id) DO NOTHING
      RETURNING id
    `;

    const result = await query(queryText, [
      narrativeIds,
      teamId,
      readBy || null,
    ]);

    return result.rowCount || 0;
  }

  /**
   * Mark all narratives as read for a team
   */
  static async markAllAsRead(
    teamId: string,
    gameId: string,
    readBy?: string
  ): Promise<number> {
    const queryText = `
      SELECT mark_all_narratives_read($1, $2, $3) as marked_count
    `;

    const result = await query(queryText, [teamId, gameId, readBy || null]);

    return parseInt(result.rows[0].marked_count);
  }

  /**
   * Check if a narrative has been read by a team
   */
  static async isRead(narrativeId: string, teamId: string): Promise<boolean> {
    const queryText = `
      SELECT EXISTS(
        SELECT 1 FROM narrative_reads
        WHERE narrative_id = $1 AND team_id = $2
      ) as is_read
    `;

    const result = await query(queryText, [narrativeId, teamId]);

    return result.rows[0].is_read;
  }

  /**
   * Get read status for multiple narratives
   */
  static async getReadStatus(
    narrativeIds: string[],
    teamId: string
  ): Promise<Map<string, boolean>> {
    if (narrativeIds.length === 0) {
      return new Map();
    }

    const queryText = `
      SELECT narrative_id, true as is_read
      FROM narrative_reads
      WHERE narrative_id = ANY($1::uuid[]) AND team_id = $2
    `;

    const result = await query(queryText, [narrativeIds, teamId]);

    const statusMap = new Map<string, boolean>();

    // Initialize all as unread
    narrativeIds.forEach(id => statusMap.set(id, false));

    // Mark read ones as true
    result.rows.forEach((row: any) => {
      statusMap.set(row.narrative_id, true);
    });

    return statusMap;
  }

  /**
   * Get unread count for a team
   */
  static async getUnreadCount(teamId: string, gameId: string): Promise<number> {
    const queryText = `
      SELECT get_team_unread_count($1, $2) as count
    `;

    const result = await query(queryText, [teamId, gameId]);

    return parseInt(result.rows[0].count);
  }

  /**
   * Get unread counts by type
   */
  static async getUnreadCountsByType(
    teamId: string,
    gameId: string
  ): Promise<UnreadCounts> {
    const queryText = `
      SELECT
        n.type,
        COUNT(*) as count
      FROM narratives n
      WHERE n.game_id = $1
      AND (n.target_teams IS NULL OR $2 = ANY(n.target_teams))
      AND NOT EXISTS (
        SELECT 1 FROM narrative_reads nr
        WHERE nr.narrative_id = n.id AND nr.team_id = $2
      )
      GROUP BY n.type
    `;

    const result = await query(queryText, [gameId, teamId]);

    const byType = {
      briefing: 0,
      news: 0,
      email: 0,
      alert: 0,
    };

    let total = 0;

    result.rows.forEach((row: any) => {
      const count = parseInt(row.count);
      byType[row.type as keyof typeof byType] = count;
      total += count;
    });

    return { total, byType };
  }

  /**
   * Get all read records for a team
   */
  static async findByTeam(
    teamId: string,
    limit: number = 50
  ): Promise<NarrativeRead[]> {
    const queryText = `
      SELECT * FROM narrative_reads
      WHERE team_id = $1
      ORDER BY read_at DESC
      LIMIT $2
    `;

    const result = await query(queryText, [teamId, limit]);

    return result.rows;
  }

  /**
   * Get all teams that have read a narrative
   */
  static async findByNarrative(narrativeId: string): Promise<NarrativeRead[]> {
    const queryText = `
      SELECT nr.*, t.name as team_name
      FROM narrative_reads nr
      JOIN teams t ON nr.team_id = t.id
      WHERE nr.narrative_id = $1
      ORDER BY nr.read_at DESC
    `;

    const result = await query(queryText, [narrativeId]);

    return result.rows;
  }

  /**
   * Get read statistics for a narrative (how many teams have read it)
   */
  static async getNarrativeReadStats(narrativeId: string): Promise<{
    totalTeams: number;
    teamsRead: number;
    readPercentage: number;
  }> {
    const queryText = `
      WITH narrative_info AS (
        SELECT
          n.game_id,
          n.target_teams
        FROM narratives n
        WHERE n.id = $1
      ),
      eligible_teams AS (
        SELECT COUNT(DISTINCT t.id) as total
        FROM teams t
        CROSS JOIN narrative_info ni
        WHERE t.game_id = ni.game_id
        AND (ni.target_teams IS NULL OR t.id = ANY(ni.target_teams))
      ),
      read_count AS (
        SELECT COUNT(*) as read
        FROM narrative_reads
        WHERE narrative_id = $1
      )
      SELECT
        COALESCE(et.total, 0) as total_teams,
        COALESCE(rc.read, 0) as teams_read,
        CASE
          WHEN COALESCE(et.total, 0) = 0 THEN 0
          ELSE ROUND((COALESCE(rc.read, 0)::numeric / et.total::numeric) * 100, 2)
        END as read_percentage
      FROM eligible_teams et
      CROSS JOIN read_count rc
    `;

    const result = await query(queryText, [narrativeId]);

    if (result.rows.length === 0) {
      return { totalTeams: 0, teamsRead: 0, readPercentage: 0 };
    }

    return {
      totalTeams: parseInt(result.rows[0].total_teams),
      teamsRead: parseInt(result.rows[0].teams_read),
      readPercentage: parseFloat(result.rows[0].read_percentage),
    };
  }

  /**
   * Delete read records for a narrative (when narrative is deleted)
   */
  static async deleteByNarrative(narrativeId: string): Promise<number> {
    const queryText = `
      DELETE FROM narrative_reads
      WHERE narrative_id = $1
    `;

    const result = await query(queryText, [narrativeId]);

    return result.rowCount || 0;
  }

  /**
   * Delete old read records (cleanup)
   */
  static async deleteOldRecords(daysOld: number = 90): Promise<number> {
    const queryText = `
      DELETE FROM narrative_reads
      WHERE read_at < NOW() - INTERVAL '${daysOld} days'
    `;

    const result = await query(queryText);

    return result.rowCount || 0;
  }
}

export default NarrativeReadsModel;
