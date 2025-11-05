// Core game types for the business simulation

export type Department = 'marketing' | 'sales' | 'research' | 'finance' | 'hr';

export interface DepartmentMetrics {
  marketing: {
    brandAwareness: number;      // 0-100
    customerAcquisition: number;  // rate
    campaignEffectiveness: number; // 0-100
    marketShare: number;          // 0-100
  };
  sales: {
    revenue: number;              // in thousands
    conversionRate: number;       // percentage
    customerSatisfaction: number; // 0-100
    salesGrowth: number;          // percentage
  };
  research: {
    innovation: number;           // 0-100
    productQuality: number;       // 0-100
    rdBudgetEfficiency: number;   // 0-100
    patentsFiled: number;        // count
  };
  finance: {
    cashFlow: number;             // in thousands
    profitMargin: number;         // percentage
    debtRatio: number;            // percentage
    investorConfidence: number;   // 0-100
  };
  hr: {
    employeeMorale: number;       // 0-100
    productivity: number;         // 0-100
    retentionRate: number;        // percentage
    talentQuality: number;        // 0-100
  };
}

export interface DepartmentImpact {
  department: Department;
  metric: string;
  change: number;
  description: string;
}

export interface SubDecision {
  id: string;
  title: string;
  description: string;
  type: 'numeric' | 'file-upload' | 'multiple-choice';
  options?: {
    label: string;
    value: string;
    impacts: DepartmentImpact[];
  }[];
  numericConfig?: {
    min: number;
    max: number;
    unit: string;
    impactCalculator: (value: number) => DepartmentImpact[];
  };
  fileConfig?: {
    acceptedFormats: string[];
    maxSize: number; // in MB
    scoringRubric: string;
  };
}

export interface MajorDecision {
  id: string;
  week: number;
  title: string;
  description: string;
  context: string;
  deadline: string; // ISO date string
  subDecisions: SubDecision[];
  minimumImpact: DepartmentImpact[]; // Base impacts regardless of choices
}

export interface TeamSubmission {
  teamId: string;
  decisionId: string;
  subDecisionId: string;
  timestamp: string;
  value?: number | string;
  fileData?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    base64Data: string;
  };
  adminScore?: number; // For creative submissions requiring manual review
  adminFeedback?: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  color: string;
  metrics: DepartmentMetrics;
  submissions: TeamSubmission[];
  overallScore: number;
  createdAt: string;
}

export interface GameState {
  currentWeek: number;
  teams: Team[];
  decisions: MajorDecision[];
  gameStarted: boolean;
  gameEnded: boolean;
}
