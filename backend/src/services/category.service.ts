import { query } from '../config/database';
import { TeamModel, Team } from '../models/Team.model';

/**
 * Category Ranking Service
 * Handles category-based team rankings for multiple success paths
 */

export type CategoryType = 'financial' | 'operations' | 'marketing' | 'hr' | 'customer_satisfaction' | 'overall';
export type ScopeType = 'pod' | 'global';

export interface CategoryRanking {
  category: CategoryType;
  scope: ScopeType;
  pod_id: string | null;
  team_id: string;
  team_name: string;
  score: number;
  rank: number;
}

export interface TeamCategoryRankings {
  team_id: string;
  team_name: string;
  rankings: {
    category: CategoryType;
    pod_rank: number | null;
    global_rank: number;
    score: number;
  }[];
}

export interface CategoryLeader {
  category: CategoryType;
  scope: ScopeType;
  pod_id: string | null;
  team_id: string;
  team_name: string;
  score: number;
}

/**
 * Calculate real-time category rankings for a game
 * Uses the database function for efficient calculation
 */
export async function calculateCategoryRankings(
  gameId: string,
  sessionId: string | null = null,
  category: CategoryType = 'overall',
  scope: ScopeType = 'global',
  podId: string | null = null
): Promise<CategoryRanking[]> {
  const result = await query(
    `SELECT * FROM calculate_category_rankings($1, $2, $3, $4, $5)`,
    [gameId, sessionId, category, scope, podId]
  );

  return result.rows.map(row => ({
    category,
    scope,
    pod_id: podId,
    team_id: row.team_id,
    team_name: row.team_name,
    score: parseFloat(row.score),
    rank: row.rank
  }));
}

/**
 * Get category leaders (top team in each category)
 * Returns leaders for both pod and global scopes
 */
export async function getCategoryLeaders(
  gameId: string,
  sessionId: string | null = null,
  podId: string | null = null
): Promise<CategoryLeader[]> {
  const categories: CategoryType[] = ['financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall'];
  const leaders: CategoryLeader[] = [];

  for (const category of categories) {
    // Get global leader
    const globalRankings = await calculateCategoryRankings(gameId, sessionId, category, 'global', null);
    if (globalRankings.length > 0) {
      const topTeam = globalRankings[0];
      leaders.push({
        category,
        scope: 'global',
        pod_id: null,
        team_id: topTeam.team_id,
        team_name: topTeam.team_name,
        score: topTeam.score
      });
    }

    // Get pod leader if podId provided
    if (podId) {
      const podRankings = await calculateCategoryRankings(gameId, sessionId, category, 'pod', podId);
      if (podRankings.length > 0) {
        const topTeam = podRankings[0];
        leaders.push({
          category,
          scope: 'pod',
          pod_id: podId,
          team_id: topTeam.team_id,
          team_name: topTeam.team_name,
          score: topTeam.score
        });
      }
    }
  }

  return leaders;
}

/**
 * Get all category rankings for a specific team
 * Shows how the team ranks in each category (both pod and global)
 */
export async function getTeamCategoryRankings(
  gameId: string,
  teamId: string,
  sessionId: string | null = null
): Promise<TeamCategoryRankings | null> {
  const team = await TeamModel.findById(teamId);

  if (!team || team.game_id !== gameId) {
    return null;
  }

  const categories: CategoryType[] = ['financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall'];
  const rankings: TeamCategoryRankings['rankings'] = [];

  for (const category of categories) {
    // Get global ranking
    const globalRankings = await calculateCategoryRankings(gameId, sessionId, category, 'global', null);
    const globalRank = globalRankings.findIndex(r => r.team_id === teamId) + 1;
    const score = globalRankings.find(r => r.team_id === teamId)?.score || 0;

    // Get pod ranking if team is in a pod
    let podRank: number | null = null;
    if (team.pod_id) {
      const podRankings = await calculateCategoryRankings(gameId, sessionId, category, 'pod', team.pod_id);
      podRank = podRankings.findIndex(r => r.team_id === teamId) + 1;
    }

    rankings.push({
      category,
      pod_rank: podRank,
      global_rank: globalRank,
      score
    });
  }

  return {
    team_id: teamId,
    team_name: team.name,
    rankings
  };
}

/**
 * Get all teams' rankings in a specific category
 * Useful for displaying category-specific leaderboards
 */
export async function getCategoryLeaderboard(
  gameId: string,
  category: CategoryType,
  scope: ScopeType = 'global',
  podId: string | null = null,
  sessionId: string | null = null
): Promise<CategoryRanking[]> {
  return await calculateCategoryRankings(gameId, sessionId, category, scope, podId);
}

/**
 * Snapshot category rankings at session end
 * Persists rankings to category_rankings table for historical tracking
 */
export async function snapshotCategoryRankings(
  gameId: string,
  sessionId: string
): Promise<number> {
  const result = await query(
    `SELECT snapshot_category_rankings($1, $2) as count`,
    [gameId, sessionId]
  );

  return parseInt(result.rows[0]?.count || '0');
}

/**
 * Get historical category rankings for a session
 * Returns persisted rankings from category_rankings table
 */
export async function getHistoricalCategoryRankings(
  gameId: string,
  sessionId: string,
  category?: CategoryType,
  scope?: ScopeType,
  podId?: string
): Promise<CategoryRanking[]> {
  let sql = `
    SELECT
      cr.category,
      cr.scope,
      cr.pod_id,
      cr.team_id,
      t.name as team_name,
      cr.score,
      cr.rank
    FROM category_rankings cr
    JOIN teams t ON t.id = cr.team_id
    WHERE cr.game_id = $1 AND cr.session_id = $2
  `;

  const params: any[] = [gameId, sessionId];
  let paramCounter = 3;

  if (category) {
    sql += ` AND cr.category = $${paramCounter}`;
    params.push(category);
    paramCounter++;
  }

  if (scope) {
    sql += ` AND cr.scope = $${paramCounter}`;
    params.push(scope);
    paramCounter++;
  }

  if (podId !== undefined) {
    sql += ` AND cr.pod_id = $${paramCounter}`;
    params.push(podId);
    paramCounter++;
  }

  sql += ' ORDER BY cr.category, cr.scope, cr.rank';

  const result = await query(sql, params);

  return result.rows.map(row => ({
    category: row.category,
    scope: row.scope,
    pod_id: row.pod_id,
    team_id: row.team_id,
    team_name: row.team_name,
    score: parseFloat(row.score),
    rank: row.rank
  }));
}

/**
 * Get category awards summary for a game
 * Shows all category leaders in a single response
 */
export async function getCategoryAwardsSummary(
  gameId: string,
  sessionId: string | null = null
): Promise<{
  global_awards: CategoryLeader[];
  pod_awards: Map<string, CategoryLeader[]>;
}> {
  // Get all global leaders
  const globalLeaders = await getCategoryLeaders(gameId, sessionId, null);
  const globalAwards = globalLeaders.filter(l => l.scope === 'global');

  // Get all pods in the game
  const teamsResult = await query(
    'SELECT DISTINCT pod_id, pod_name FROM teams WHERE game_id = $1 AND pod_id IS NOT NULL',
    [gameId]
  );

  const podAwards = new Map<string, CategoryLeader[]>();

  // Get leaders for each pod
  for (const row of teamsResult.rows) {
    const podId = row.pod_id;
    const podLeaders = await getCategoryLeaders(gameId, sessionId, podId);
    const podAwardsForPod = podLeaders.filter(l => l.scope === 'pod' && l.pod_id === podId);
    podAwards.set(podId, podAwardsForPod);
  }

  return {
    global_awards: globalAwards,
    pod_awards: podAwards
  };
}

/**
 * Check if a team is a category leader
 * Returns categories where the team is ranked #1
 */
export async function getTeamAwards(
  gameId: string,
  teamId: string,
  sessionId: string | null = null
): Promise<{
  global_awards: CategoryType[];
  pod_awards: CategoryType[];
}> {
  const team = await TeamModel.findById(teamId);

  if (!team || team.game_id !== gameId) {
    return { global_awards: [], pod_awards: [] };
  }

  const categories: CategoryType[] = ['financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall'];
  const globalAwards: CategoryType[] = [];
  const podAwards: CategoryType[] = [];

  for (const category of categories) {
    // Check global leadership
    const globalRankings = await calculateCategoryRankings(gameId, sessionId, category, 'global', null);
    if (globalRankings.length > 0 && globalRankings[0].team_id === teamId) {
      globalAwards.push(category);
    }

    // Check pod leadership
    if (team.pod_id) {
      const podRankings = await calculateCategoryRankings(gameId, sessionId, category, 'pod', team.pod_id);
      if (podRankings.length > 0 && podRankings[0].team_id === teamId) {
        podAwards.push(category);
      }
    }
  }

  return { global_awards: globalAwards, pod_awards: podAwards };
}
