import { DepartmentMetrics, DepartmentImpact, Team, TeamSubmission } from '../types/game';

/**
 * Apply impacts to department metrics
 */
export function applyImpacts(
  currentMetrics: DepartmentMetrics,
  impacts: DepartmentImpact[]
): DepartmentMetrics {
  const newMetrics = JSON.parse(JSON.stringify(currentMetrics)) as DepartmentMetrics;

  impacts.forEach((impact) => {
    const dept = newMetrics[impact.department];
    if (dept && impact.metric in dept) {
      // @ts-ignore - dynamic metric access
      dept[impact.metric] = Math.max(0, dept[impact.metric] + impact.change);

      // Cap percentages at 100
      if (['brandAwareness', 'customerAcquisition', 'campaignEffectiveness', 'marketShare',
           'conversionRate', 'customerSatisfaction', 'innovation', 'productQuality',
           'rdBudgetEfficiency', 'profitMargin', 'investorConfidence', 'employeeMorale',
           'productivity', 'retentionRate', 'talentQuality'].includes(impact.metric)) {
        // @ts-ignore
        dept[impact.metric] = Math.min(100, dept[impact.metric]);
      }
    }
  });

  return newMetrics;
}

/**
 * Calculate overall team score based on all department metrics
 */
export function calculateTeamScore(metrics: DepartmentMetrics): number {
  let score = 0;

  // Marketing (20% weight)
  score += (metrics.marketing.brandAwareness * 0.3 +
            metrics.marketing.customerAcquisition * 0.25 +
            metrics.marketing.campaignEffectiveness * 0.25 +
            metrics.marketing.marketShare * 0.2) * 0.2;

  // Sales (25% weight)
  score += (metrics.sales.revenue * 0.01 + // Revenue in thousands, normalize
            metrics.sales.conversionRate * 1.5 +
            metrics.sales.customerSatisfaction * 0.3 +
            metrics.sales.salesGrowth * 0.5) * 0.25;

  // Research (20% weight)
  score += (metrics.research.innovation * 0.35 +
            metrics.research.productQuality * 0.35 +
            metrics.research.rdBudgetEfficiency * 0.2 +
            metrics.research.patentsFiled * 2.5) * 0.2;

  // Finance (20% weight)
  score += (metrics.finance.cashFlow * 0.01 + // Cash flow in thousands, normalize
            metrics.finance.profitMargin * 2 +
            (100 - metrics.finance.debtRatio) * 0.2 + // Lower debt is better
            metrics.finance.investorConfidence * 0.3) * 0.2;

  // HR (15% weight)
  score += (metrics.hr.employeeMorale * 0.3 +
            metrics.hr.productivity * 0.3 +
            metrics.hr.retentionRate * 0.2 +
            metrics.hr.talentQuality * 0.2) * 0.15;

  return Math.round(score);
}

/**
 * Get metric display info (color, label, unit)
 */
export function getMetricDisplay(_department: string, metric: string) {
  const displays: Record<string, { label: string; unit: string; color: string }> = {
    // Marketing
    'brandAwareness': { label: 'Brand Awareness', unit: '%', color: 'text-purple-600' },
    'customerAcquisition': { label: 'Customer Acquisition', unit: '%', color: 'text-purple-600' },
    'campaignEffectiveness': { label: 'Campaign Effectiveness', unit: '%', color: 'text-purple-600' },
    'marketShare': { label: 'Market Share', unit: '%', color: 'text-purple-600' },

    // Sales
    'revenue': { label: 'Revenue', unit: '$K', color: 'text-green-600' },
    'conversionRate': { label: 'Conversion Rate', unit: '%', color: 'text-green-600' },
    'customerSatisfaction': { label: 'Customer Satisfaction', unit: '%', color: 'text-green-600' },
    'salesGrowth': { label: 'Sales Growth', unit: '%', color: 'text-green-600' },

    // Research
    'innovation': { label: 'Innovation Score', unit: '%', color: 'text-blue-600' },
    'productQuality': { label: 'Product Quality', unit: '%', color: 'text-blue-600' },
    'rdBudgetEfficiency': { label: 'R&D Efficiency', unit: '%', color: 'text-blue-600' },
    'patentsFiled': { label: 'Patents Filed', unit: '', color: 'text-blue-600' },

    // Finance
    'cashFlow': { label: 'Cash Flow', unit: '$K', color: 'text-yellow-600' },
    'profitMargin': { label: 'Profit Margin', unit: '%', color: 'text-yellow-600' },
    'debtRatio': { label: 'Debt Ratio', unit: '%', color: 'text-yellow-600' },
    'investorConfidence': { label: 'Investor Confidence', unit: '%', color: 'text-yellow-600' },

    // HR
    'employeeMorale': { label: 'Employee Morale', unit: '%', color: 'text-indigo-600' },
    'productivity': { label: 'Productivity', unit: '%', color: 'text-indigo-600' },
    'retentionRate': { label: 'Retention Rate', unit: '%', color: 'text-indigo-600' },
    'talentQuality': { label: 'Talent Quality', unit: '%', color: 'text-indigo-600' },
  };

  return displays[metric] || { label: metric, unit: '', color: 'text-gray-600' };
}

/**
 * Get department display info
 */
export function getDepartmentDisplay(department: string) {
  const displays: Record<string, { name: string; icon: string; color: string; bgColor: string }> = {
    marketing: {
      name: 'Marketing',
      icon: '📢',
      color: 'border-purple-500',
      bgColor: 'bg-purple-50'
    },
    sales: {
      name: 'Sales',
      icon: '💰',
      color: 'border-green-500',
      bgColor: 'bg-green-50'
    },
    research: {
      name: 'Research & Development',
      icon: '🔬',
      color: 'border-blue-500',
      bgColor: 'bg-blue-50'
    },
    finance: {
      name: 'Finance',
      icon: '📊',
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    hr: {
      name: 'Human Resources',
      icon: '👥',
      color: 'border-indigo-500',
      bgColor: 'bg-indigo-50'
    },
  };

  return displays[department] || { name: department, icon: '📋', color: 'border-gray-500', bgColor: 'bg-gray-50' };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Check if team has submitted a specific sub-decision
 */
export function hasSubmitted(team: Team, subDecisionId: string): boolean {
  return team.submissions.some(sub => sub.subDecisionId === subDecisionId);
}

/**
 * Get submission for a specific sub-decision
 */
export function getSubmission(team: Team, subDecisionId: string): TeamSubmission | undefined {
  return team.submissions.find(sub => sub.subDecisionId === subDecisionId);
}

/**
 * Validate numeric input within range
 */
export function validateNumericInput(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}

/**
 * Get week progress percentage
 */
export function getWeekProgress(startDate: string, endDate: string): number {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (now < start) return 0;
  if (now > end) return 100;

  return Math.round(((now - start) / (end - start)) * 100);
}

/**
 * Generate team colors
 */
export const TEAM_COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];
