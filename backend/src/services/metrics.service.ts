/**
 * Metrics Calculation Service
 *
 * Handles all business logic for calculating team metrics based on decisions
 * and game events. Uses weighted scoring across multiple dimensions.
 */

export interface TeamMetrics {
  financial: number;
  hr: number;
  market_communication: number;
  operations: number;
  customer_satisfaction: number;
}

export interface MetricsImpact {
  financial?: number;
  hr?: number;
  market_communication?: number;
  operations?: number;
  customer_satisfaction?: number;
}

export interface ScoringWeights {
  financial: number;
  hr: number;
  market_communication: number;
}

// Default scoring weights (must sum to 1.0)
export const DEFAULT_WEIGHTS: ScoringWeights = {
  financial: 0.4,
  hr: 0.3,
  market_communication: 0.3,
};

// Default starting metrics (50 = neutral)
export const DEFAULT_METRICS: TeamMetrics = {
  financial: 50,
  hr: 50,
  market_communication: 50,
  operations: 50,
  customer_satisfaction: 50,
};

/**
 * Calculate overall score from metrics using weighted formula
 */
export const calculateOverallScore = (
  metrics: TeamMetrics,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number => {
  const score =
    metrics.financial * weights.financial +
    metrics.hr * weights.hr +
    metrics.market_communication * weights.market_communication;

  // Round to 2 decimal places
  return Math.round(score * 100) / 100;
};

/**
 * Apply impact to metrics
 */
export const applyMetricsImpact = (
  currentMetrics: TeamMetrics,
  impact: MetricsImpact
): TeamMetrics => {
  const newMetrics: TeamMetrics = { ...currentMetrics };

  // Apply each impact, clamping between 0 and 100
  Object.keys(impact).forEach((key) => {
    const metricKey = key as keyof TeamMetrics;
    if (impact[metricKey] !== undefined) {
      newMetrics[metricKey] = Math.max(
        0,
        Math.min(100, newMetrics[metricKey] + impact[metricKey]!)
      );
    }
  });

  return newMetrics;
};

/**
 * Calculate metrics impact from a scored submission
 *
 * Score is expected to be 0-100
 * Impact scales with distance from 50 (neutral)
 */
export const calculateSubmissionImpact = (
  score: number,
  challengeType: string
): MetricsImpact => {
  // Normalize score to impact factor (-5 to +5)
  const impactFactor = ((score - 50) / 10);

  // Different challenge types affect different metrics
  switch (challengeType) {
    case 'marketing':
      return {
        market_communication: impactFactor * 1.5,
        customer_satisfaction: impactFactor * 0.8,
        financial: impactFactor * 0.5,
      };

    case 'finance':
      return {
        financial: impactFactor * 1.5,
        operations: impactFactor * 0.7,
      };

    case 'hr':
      return {
        hr: impactFactor * 1.5,
        operations: impactFactor * 0.6,
        financial: impactFactor * 0.3,
      };

    case 'operations':
      return {
        operations: impactFactor * 1.5,
        customer_satisfaction: impactFactor * 0.8,
        financial: impactFactor * 0.5,
      };

    case 'sales':
      return {
        financial: impactFactor * 1.2,
        market_communication: impactFactor * 0.7,
        customer_satisfaction: impactFactor * 0.8,
      };

    case 'strategy':
      // Strategy decisions affect all areas
      return {
        financial: impactFactor * 0.8,
        hr: impactFactor * 0.6,
        market_communication: impactFactor * 0.6,
        operations: impactFactor * 0.7,
        customer_satisfaction: impactFactor * 0.5,
      };

    default:
      // Balanced impact for unknown types
      return {
        financial: impactFactor * 0.5,
        hr: impactFactor * 0.5,
        market_communication: impactFactor * 0.5,
        operations: impactFactor * 0.5,
        customer_satisfaction: impactFactor * 0.5,
      };
  }
};

/**
 * Calculate metrics decay over time (simulates business challenges)
 * Call this periodically or when sessions complete
 */
export const applyMetricsDecay = (
  currentMetrics: TeamMetrics,
  decayRate: number = 0.5
): TeamMetrics => {
  const newMetrics: TeamMetrics = { ...currentMetrics };

  // Metrics naturally drift toward 50 (neutral) if not maintained
  Object.keys(newMetrics).forEach((key) => {
    const metricKey = key as keyof TeamMetrics;
    const current = newMetrics[metricKey];

    if (current > 50) {
      newMetrics[metricKey] = Math.max(50, current - decayRate);
    } else if (current < 50) {
      newMetrics[metricKey] = Math.min(50, current + decayRate);
    }
  });

  return newMetrics;
};

/**
 * Calculate bonus/penalty based on submission timing
 */
export const calculateTimingBonus = (
  submittedAt: Date,
  deadline: Date
): number => {
  const timeRemaining = deadline.getTime() - submittedAt.getTime();
  const totalTime = 24 * 60 * 60 * 1000; // 24 hours in ms

  if (timeRemaining < 0) {
    // Late submission penalty
    return -5;
  }

  if (timeRemaining > totalTime * 0.5) {
    // Early submission bonus
    return 2;
  }

  // On-time submission
  return 0;
};

/**
 * Calculate rank movement based on score change
 */
export const calculateRankChange = (
  oldRank: number,
  newRank: number
): { change: number; direction: 'up' | 'down' | 'same' } => {
  const change = oldRank - newRank; // Positive = moved up

  return {
    change: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
  };
};

/**
 * Generate metrics summary for display
 */
export const generateMetricsSummary = (
  metrics: TeamMetrics,
  overallScore: number
): any => {
  // Categorize each metric
  const categorize = (value: number): string => {
    if (value >= 80) return 'excellent';
    if (value >= 65) return 'good';
    if (value >= 50) return 'average';
    if (value >= 35) return 'poor';
    return 'critical';
  };

  return {
    overall_score: overallScore,
    overall_category: categorize(overallScore),
    metrics: {
      financial: {
        value: metrics.financial,
        category: categorize(metrics.financial),
      },
      hr: {
        value: metrics.hr,
        category: categorize(metrics.hr),
      },
      market_communication: {
        value: metrics.market_communication,
        category: categorize(metrics.market_communication),
      },
      operations: {
        value: metrics.operations,
        category: categorize(metrics.operations),
      },
      customer_satisfaction: {
        value: metrics.customer_satisfaction,
        category: categorize(metrics.customer_satisfaction),
      },
    },
    strongest_area: Object.keys(metrics).reduce((a, b) =>
      metrics[a as keyof TeamMetrics] > metrics[b as keyof TeamMetrics] ? a : b
    ),
    weakest_area: Object.keys(metrics).reduce((a, b) =>
      metrics[a as keyof TeamMetrics] < metrics[b as keyof TeamMetrics] ? a : b
    ),
  };
};

/**
 * Validate metrics are within acceptable range
 */
export const validateMetrics = (metrics: TeamMetrics): boolean => {
  return Object.values(metrics).every((value) => value >= 0 && value <= 100);
};

export default {
  DEFAULT_WEIGHTS,
  DEFAULT_METRICS,
  calculateOverallScore,
  applyMetricsImpact,
  calculateSubmissionImpact,
  applyMetricsDecay,
  calculateTimingBonus,
  calculateRankChange,
  generateMetricsSummary,
  validateMetrics,
};
