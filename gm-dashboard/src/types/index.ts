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
  // Pod competition fields
  enable_pods: boolean;
  pod_size: number;
  pod_assignment_method: 'random' | 'manual' | 'balanced';
  enable_category_awards: boolean;
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
  color?: string;
  overall_score?: number | string;
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

// Scenario Customization Types
export interface Archetype {
  id: string;
  name: string;
  description: string;
  icon: string;
  starting_cash: number;
  starting_team_size: number;
  starting_metrics: {
    financial: number;
    operations: number;
    marketing: number;
    hr: number;
    customer_satisfaction: number;
    overall: number;
  };
  difficulty_modifier: number;
  narrative_template_set: string | null;
}

export interface Industry {
  id: string;
  name: string;
  description: string;
  icon: string;
  product_examples: string[];
  npc_set: string | null;
  challenge_focus: string[];
}

export interface ScenarioPreview {
  name: string;
  description: string;
  archetype: {
    id: string;
    name: string;
    icon: string;
    description: string;
    difficulty_modifier: number;
  };
  industry: {
    id: string;
    name: string;
    icon: string;
    description: string;
    product_examples: string[];
  };
  starting_conditions: {
    cash: number;
    team_size: number;
    metrics: {
      financial: number;
      operations: number;
      marketing: number;
      hr: number;
      customer_satisfaction: number;
      overall: number;
    };
  };
  focus_areas: string[];
  example_products: string[];
}

// Pod Competition Types
export interface PodInfo {
  pod_id: string;
  pod_name: string;
  teams: Team[];
  team_count: number;
  avg_score: number;
}

export interface CategoryRanking {
  category: 'financial' | 'operations' | 'marketing' | 'hr' | 'customer_satisfaction' | 'overall';
  scope: 'pod' | 'global';
  pod_id: string | null;
  team_id: string;
  team_name: string;
  score: number;
  rank: number;
}

export interface CategoryLeader {
  category: 'financial' | 'operations' | 'marketing' | 'hr' | 'customer_satisfaction' | 'overall';
  scope: 'pod' | 'global';
  pod_id: string | null;
  team_id: string;
  team_name: string;
  score: number;
}

export interface TeamCategoryRankings {
  team_id: string;
  team_name: string;
  rankings: {
    category: 'financial' | 'operations' | 'marketing' | 'hr' | 'customer_satisfaction' | 'overall';
    pod_rank: number | null;
    global_rank: number;
    score: number;
  }[];
  awards: {
    global_awards: string[];
    pod_awards: string[];
  };
}
