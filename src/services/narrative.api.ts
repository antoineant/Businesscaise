import apiClient from './api.client';

/**
 * Narrative API Service
 *
 * Handles all narrative-related API calls including:
 * - Team narrative viewing
 * - Read tracking
 * - Ask the Market (AI queries)
 * - GM narrative management
 * - Reality Lens (AI narrative enhancement)
 */

// ========================================
// Types
// ========================================

export interface Narrative {
  id: string;
  game_id: string;
  session_id: string | null;
  type: 'briefing' | 'news' | 'email' | 'alert';
  title: string;
  content: string;
  author: string | null;
  target_teams: string[] | null;
  published_at: string;
  created_at: string;
  isRead?: boolean; // Added by frontend
}

export interface NarrativeWithReadStatus extends Narrative {
  isRead: boolean;
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

export interface GMEvent {
  id: string;
  game_id: string;
  event_type: string;
  title: string;
  description: string | null;
  impacts: MetricImpact[];
  target_teams: string[] | null;
  applied_at: string;
  created_at: string;
}

export interface MetricImpact {
  metric: string;
  change: number;
  reasoning?: string;
}

export interface MarketQueryResult {
  question: string;
  answer: string;
  sources: Source[];
  relatedQuestions: string[];
  confidence: 'high' | 'medium' | 'low';
  rateLimit: {
    remaining: number;
    total: number;
  };
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface MarketQueryHistory {
  id: string;
  query_type: string;
  query_text: string;
  response_data: any;
  sources: Source[];
  created_at: string;
}

export interface EnhancedNarrative {
  original: string;
  enhanced: string;
  context: string;
  sources: Source[];
  suggestions: string[];
}

export interface EventIdea {
  title: string;
  description: string;
  suggestedImpacts: MetricImpact[];
  realWorldBasis: string;
  sources: Source[];
}

export interface NarrativeReadStats {
  narrativeId: string;
  stats: {
    totalTeams: number;
    teamsRead: number;
    readPercentage: number;
  };
  readByTeams: Array<{
    teamId: string;
    teamName: string;
    readAt: string;
  }>;
}

// ========================================
// Team Narrative API
// ========================================

/**
 * Get narratives for a team
 */
export async function getTeamNarratives(
  teamId: string,
  filters?: {
    type?: string;
    includeRead?: boolean;
  }
): Promise<{
  narratives: NarrativeWithReadStatus[];
  total: number;
  unreadCount: number;
  unreadByType: UnreadCounts['byType'];
}> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.includeRead === false) params.append('includeRead', 'false');

  const { data } = await apiClient.get(
    `/teams/${teamId}/narratives?${params.toString()}`
  );
  return data;
}

/**
 * Get session briefing for a team
 */
export async function getSessionBriefing(
  teamId: string,
  sessionId: string
): Promise<{
  briefing: string;
  narratives: Narrative[];
}> {
  const { data } = await apiClient.get(
    `/teams/${teamId}/sessions/${sessionId}/briefing`
  );
  return data;
}

/**
 * Get unread count for a team
 */
export async function getUnreadCount(teamId: string): Promise<UnreadCounts> {
  const { data } = await apiClient.get(
    `/teams/${teamId}/narratives/unread-count`
  );
  return {
    total: data.unreadCount,
    byType: data.byType,
  };
}

/**
 * Mark narrative as read
 */
export async function markNarrativeAsRead(
  teamId: string,
  narrativeId: string
): Promise<{ newlyMarked: boolean }> {
  const { data } = await apiClient.post(
    `/teams/${teamId}/narratives/${narrativeId}/read`
  );
  return data;
}

/**
 * Mark multiple narratives as read
 */
export async function markMultipleAsRead(
  teamId: string,
  narrativeIds: string[]
): Promise<{ markedCount: number }> {
  const { data } = await apiClient.post(
    `/teams/${teamId}/narratives/read-batch`,
    { narrativeIds }
  );
  return data;
}

/**
 * Mark all narratives as read
 */
export async function markAllAsRead(teamId: string): Promise<{ markedCount: number }> {
  const { data } = await apiClient.post(`/teams/${teamId}/narratives/read-all`);
  return data;
}

/**
 * Get read status for narratives
 */
export async function getReadStatus(
  teamId: string,
  narrativeIds: string[]
): Promise<Record<string, boolean>> {
  const { data } = await apiClient.post(
    `/teams/${teamId}/narratives/read-status`,
    { narrativeIds }
  );
  return data.status;
}

// ========================================
// Ask the Market API (AI for Teams)
// ========================================

/**
 * Ask a business question
 */
export async function askMarket(
  teamId: string,
  question: string
): Promise<MarketQueryResult> {
  const { data } = await apiClient.post(`/teams/${teamId}/market-query`, {
    question,
  });
  return data;
}

/**
 * Get market query history for team
 */
export async function getMarketQueryHistory(
  teamId: string
): Promise<{
  history: MarketQueryHistory[];
  rateLimit: {
    remaining: number;
    total: number;
    resetIn: number;
  };
}> {
  const { data } = await apiClient.get(`/teams/${teamId}/market-query/history`);
  return data;
}

// ========================================
// GM Narrative API
// ========================================

/**
 * Create a narrative (GM only)
 */
export async function createNarrative(
  gameId: string,
  narrative: {
    type: 'briefing' | 'news' | 'email' | 'alert';
    title: string;
    content: string;
    author?: string;
    session_id?: string;
    target_teams?: string[];
    published_at?: string;
  }
): Promise<{ narrative: Narrative }> {
  const { data } = await apiClient.post(`/gm/games/${gameId}/narratives`, narrative);
  return data;
}

/**
 * Get narratives for a game (GM only)
 */
export async function getGameNarratives(
  gameId: string,
  filters?: {
    type?: string;
    session_id?: string;
  }
): Promise<{
  narratives: Narrative[];
  total: number;
  counts: Record<string, number>;
}> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.session_id) params.append('session_id', filters.session_id);

  const { data } = await apiClient.get(
    `/gm/games/${gameId}/narratives?${params.toString()}`
  );
  return data;
}

/**
 * Update a narrative (GM only)
 */
export async function updateNarrative(
  narrativeId: string,
  updates: Partial<{
    type: string;
    title: string;
    content: string;
    author: string;
    session_id: string;
    target_teams: string[];
    published_at: string;
  }>
): Promise<{ narrative: Narrative }> {
  const { data } = await apiClient.put(`/gm/narratives/${narrativeId}`, updates);
  return data;
}

/**
 * Delete a narrative (GM only)
 */
export async function deleteNarrative(narrativeId: string): Promise<void> {
  await apiClient.delete(`/gm/narratives/${narrativeId}`);
}

/**
 * Get narrative read statistics (GM only)
 */
export async function getNarrativeReadStats(
  narrativeId: string
): Promise<NarrativeReadStats> {
  const { data } = await apiClient.get(`/gm/narratives/${narrativeId}/read-stats`);
  return data;
}

// ========================================
// GM Event API
// ========================================

/**
 * Create GM event (GM only)
 */
export async function createGMEvent(
  gameId: string,
  event: {
    event_type: string;
    title: string;
    description?: string;
    impacts?: MetricImpact[];
    target_teams?: string[];
    applied_at?: string;
    auto_generate_narrative?: boolean;
  }
): Promise<{
  event: GMEvent;
  narrative?: Narrative;
  affectedTeams: string[];
}> {
  const { data } = await apiClient.post(`/gm/games/${gameId}/events`, event);
  return data;
}

/**
 * Get events for a game (GM only)
 */
export async function getGameEvents(gameId: string): Promise<{
  events: GMEvent[];
  total: number;
}> {
  const { data } = await apiClient.get(`/gm/games/${gameId}/events`);
  return data;
}

// ========================================
// Reality Lens API (AI for GMs)
// ========================================

/**
 * Enhance narrative with AI (Reality Lens)
 */
export async function enhanceNarrative(
  gameId: string,
  content: string,
  industry?: string,
  archetype?: string
): Promise<EnhancedNarrative> {
  const { data } = await apiClient.post(`/gm/games/${gameId}/narratives/enhance`, {
    content,
    industry,
    archetype,
  });
  return data;
}

/**
 * Get event inspiration from real-world news
 */
export async function getEventInspiration(
  gameId: string,
  industry?: string,
  eventType?: string
): Promise<{
  ideas: EventIdea[];
  count: number;
}> {
  const { data } = await apiClient.post(`/gm/games/${gameId}/events/inspiration`, {
    industry,
    eventType,
  });
  return data;
}

/**
 * Get Perplexity usage statistics
 */
export async function getPerplexityUsage(gameId: string): Promise<{
  stats: {
    totalQueries: number;
    queryByType: Record<string, number>;
    totalCredits: number;
    teamQueries: Record<string, number>;
  };
  recentUsage: any[];
  cacheStats: { size: number; keys: string[] };
}> {
  const { data } = await apiClient.get(`/gm/games/${gameId}/perplexity-usage`);
  return data;
}

// Export default object with all functions
export default {
  // Team APIs
  getTeamNarratives,
  getSessionBriefing,
  getUnreadCount,
  markNarrativeAsRead,
  markMultipleAsRead,
  markAllAsRead,
  getReadStatus,

  // Ask the Market
  askMarket,
  getMarketQueryHistory,

  // GM Narrative APIs
  createNarrative,
  getGameNarratives,
  updateNarrative,
  deleteNarrative,
  getNarrativeReadStats,

  // GM Event APIs
  createGMEvent,
  getGameEvents,

  // Reality Lens
  enhanceNarrative,
  getEventInspiration,
  getPerplexityUsage,
};
