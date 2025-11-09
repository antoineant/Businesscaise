export interface User {
  id: string;
  name: string;
  email: string;
  role: 'game_master' | 'player';
  created_at: string;
}

export interface Game {
  id: string;
  title: string;
  description?: string;
  game_master_id: string;
  status: 'setup' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  game_id: string;
  session_number: number;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  period: 'am' | 'pm';
  title: string;
  description?: string;
  deadline?: string;
  narrative?: string;
  status: 'locked' | 'active' | 'completed';
  start_time?: string;
  unlocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  game_id: string;
  name: string;
  members: string[];
  current_metrics: Metrics;
  total_score: number | string; // API may return string
  rank?: number;
  created_at: string;
  updated_at: string;
}

export interface Metrics {
  financial: number;
  hr: number;
  market_communication: number;
  operations: number;
  customer_satisfaction: number;
}

export interface MetricsHistory {
  id: string;
  team_id: string;
  session_id: string;
  metrics: Metrics;
  total_score: number;
  created_at: string;
}

export interface LeaderboardEntry {
  team_id: string;
  team_name: string;
  total_score: number;
  rank: number;
  metrics: Metrics;
}

export interface Analytics {
  total_teams: number;
  active_teams: number;
  sessions_completed: number;
  total_sessions: number;
  average_score: number;
  metrics_distribution: {
    financial: { min: number; max: number; avg: number };
    hr: { min: number; max: number; avg: number };
    market_communication: { min: number; max: number; avg: number };
    operations: { min: number; max: number; avg: number };
    customer_satisfaction: { min: number; max: number; avg: number };
  };
}

export interface GameWithDetails extends Game {
  sessions?: Session[];
  teams?: Team[];
}
