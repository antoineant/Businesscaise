/**
 * Level 1 Beginner - Data Structures
 *
 * Teaching: Basic business + Banking/Debt fundamentals
 */

// ========================================
// LOAN TYPES
// ========================================

export type LoanTerm = 'short' | 'medium' | 'long' | 'none';

export interface LoanOption {
  term: LoanTerm;
  sessions: number;
  interestRate: number; // As decimal (0.05 = 5%)
  minAmount: number;
  maxAmount: number;
  description: string;
}

export const LOAN_OPTIONS: Record<Exclude<LoanTerm, 'none'>, LoanOption> = {
  short: {
    term: 'short',
    sessions: 6,
    interestRate: 0.05,
    minAmount: 10000,
    maxAmount: 50000,
    description: 'Short-term (6 sessions, 5% interest)',
  },
  medium: {
    term: 'medium',
    sessions: 12,
    interestRate: 0.08,
    minAmount: 10000,
    maxAmount: 75000,
    description: 'Medium-term (12 sessions, 8% interest)',
  },
  long: {
    term: 'long',
    sessions: 24,
    interestRate: 0.12,
    minAmount: 10000,
    maxAmount: 100000,
    description: 'Long-term (24 sessions, 12% interest)',
  },
};

// ========================================
// LOAN STATE
// ========================================

export interface ActiveLoan {
  principal: number; // Original amount borrowed
  interestRate: number; // Interest rate as decimal
  totalOwed: number; // Principal + interest
  monthlyPayment: number; // Payment per session
  sessionsRemaining: number; // Sessions left to pay
  sessionsTaken: number; // Original term length
}

// ========================================
// STUDENT DECISION INPUT
// ========================================

export interface Level1Decision {
  // Banking decision
  loan: {
    take: boolean;
    term?: LoanTerm; // If taking loan
    amount?: number; // If taking loan
  };

  // Budget allocation (must sum to 100%)
  allocation: {
    employees: number; // Percentage (0-100)
    products: number; // Percentage (0-100)
    marketing: number; // Percentage (0-100)
    savings: number; // Percentage (0-100)
  };
}

// ========================================
// TEAM FINANCIAL STATE
// ========================================

export interface Level1TeamState {
  // Current financials
  cash: number;
  totalAssets: number; // Level 1: Assets = Cash (simplified)

  // Debt state
  activeLoan: ActiveLoan | null;
  totalDebt: number; // Remaining principal + interest

  // History
  sessionNumber: number;
  previousRevenue: number;
  previousProfit: number;
}

// ========================================
// SESSION RESULTS
// ========================================

export interface Level1SessionResult {
  // Input echo
  decision: Level1Decision;
  startingState: Level1TeamState;

  // Calculations
  calculations: {
    // Available funds
    availableFunds: number; // Starting cash + new loan

    // Spending breakdown
    employeeSpending: number;
    productSpending: number;
    marketingSpending: number;
    cashSaved: number;

    // Revenue
    revenue: number; // Based on marketing

    // Costs
    operatingCosts: number; // Employee + product + marketing
    debtPayment: number; // Monthly loan payment

    // Net results
    grossProfit: number; // Revenue - operating costs
    netProfit: number; // Revenue - operating costs - debt payment
    cashFlow: number; // Change in cash
    endingCash: number; // New cash balance

    // Debt metrics
    debtRatio: number; // Debt / Assets (percentage)
    paymentBurden: number; // Payment / Revenue (percentage)
  };

  // KPI Scores
  scores: {
    cashAndProfit: number; // 0-100
    debtHealth: number; // 0-100
    employeeHappiness: number; // 0-100
    customerSatisfaction: number; // 0-100
    overall: number; // Weighted average
  };

  // New state
  endingState: Level1TeamState;

  // Warnings & alerts
  warnings: Warning[];

  // Educational feedback
  feedback: Feedback;
}

// ========================================
// WARNINGS
// ========================================

export type WarningLevel = 'info' | 'warning' | 'critical' | 'bankruptcy';

export interface Warning {
  level: WarningLevel;
  title: string;
  message: string;
  action?: string; // Suggested action
}

// ========================================
// EDUCATIONAL FEEDBACK
// ========================================

export interface Feedback {
  summary: string;
  strengths: string[];
  concerns: string[];
  learningTips: LearningTip[];
  nextSessionAdvice: string;
}

export interface LearningTip {
  concept: string; // e.g., "Interest", "Leverage", "Debt Ratio"
  explanation: string;
  example?: string;
}

// ========================================
// SCORING THRESHOLDS
// ========================================

export const SCORING_THRESHOLDS = {
  cashAndProfit: {
    excellent: 30000, // Cash above this = 80-100 score
    good: 15000, // Cash above this = 60-79 score
    okay: 5000, // Cash above this = 40-59 score
    // Below 5000 = 0-39 score
  },

  debtHealth: {
    noDebt: 100, // No debt = perfect score
    lowDebt: 30, // Debt ratio < 30% = 90-100
    moderateDebt: 50, // Debt ratio < 50% = 70-89
    highDebt: 70, // Debt ratio < 70% = 50-69
    veryHighDebt: 90, // Debt ratio < 90% = 30-49
    // Above 90% = 0-29 (crisis)

    paymentBurden: 40, // Payment/Revenue > 40% = penalty
  },

  employees: {
    base: 50,
    perThousand: 1, // +1 point per $1000 spent
  },

  customers: {
    base: 40,
    perThousand: 1.5, // +1.5 points per $1000 spent
  },
};

// ========================================
// CONFIGURATION
// ========================================

export const LEVEL1_CONFIG = {
  // Starting conditions
  startingCash: 50000,
  creditLimit: 100000,

  // Revenue multiplier
  marketingMultiplier: 2.5, // Revenue = marketing spend * 2.5

  // Scoring weights
  weights: {
    cashAndProfit: 0.30,
    debtHealth: 0.25,
    employeeHappiness: 0.25,
    customerSatisfaction: 0.20,
  },

  // Warning thresholds
  warnings: {
    lowCashSessions: 3, // Warn when < 3 sessions of payments left
    criticalCashSessions: 1, // Critical when < 1 session of payments left
  },
};
