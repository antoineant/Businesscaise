/**
 * Level 1 Beginner - Scoring Engine
 *
 * Implements the complete scoring algorithm including banking/debt system
 */

import {
  Level1Decision,
  Level1TeamState,
  Level1SessionResult,
  ActiveLoan,
  LoanTerm,
  LOAN_OPTIONS,
  LEVEL1_CONFIG,
  SCORING_THRESHOLDS,
  Warning,
  Feedback,
  LearningTip,
} from './level1-types';

// ========================================
// MAIN SCORING FUNCTION
// ========================================

export function processLevel1Session(
  decision: Level1Decision,
  currentState: Level1TeamState
): Level1SessionResult {
  // 1. Handle loan if taken
  const { newLoan, availableFunds } = processLoan(decision, currentState);

  // 2. Calculate spending
  const spending = calculateSpending(decision, availableFunds);

  // 3. Calculate revenue
  const revenue = calculateRevenue(spending.marketing);

  // 4. Calculate debt payment (use new loan if taken this session)
  const activeLoan = newLoan || currentState.activeLoan;
  const debtPayment = calculateDebtPayment(activeLoan);

  // 5. Calculate financial results
  const financial = calculateFinancials(revenue, spending, debtPayment, availableFunds);

  // 6. Update debt state
  const updatedLoan = updateLoan(currentState.activeLoan, newLoan);
  const totalDebt = calculateTotalDebt(updatedLoan);

  // 7. Calculate scores
  const scores = calculateScores(financial, spending, totalDebt, financial.endingCash);

  // 8. Generate warnings
  const warnings = generateWarnings(financial, updatedLoan, totalDebt);

  // 9. Generate educational feedback
  const feedback = generateFeedback(decision, financial, scores, warnings, currentState);

  // 10. Build new state
  const endingState: Level1TeamState = {
    cash: financial.endingCash,
    totalAssets: financial.endingCash, // Level 1: Assets = Cash (simplified)
    activeLoan: updatedLoan,
    totalDebt,
    sessionNumber: currentState.sessionNumber + 1,
    previousRevenue: revenue,
    previousProfit: financial.netProfit,
  };

  return {
    decision,
    startingState: currentState,
    calculations: {
      availableFunds,
      employeeSpending: spending.employees,
      productSpending: spending.products,
      marketingSpending: spending.marketing,
      cashSaved: spending.savings,
      revenue,
      operatingCosts: spending.employees + spending.products + spending.marketing,
      debtPayment,
      grossProfit: financial.grossProfit,
      netProfit: financial.netProfit,
      cashFlow: financial.cashFlow,
      endingCash: financial.endingCash,
      debtRatio: (totalDebt / endingState.totalAssets) * 100,
      paymentBurden: revenue > 0 ? (debtPayment / revenue) * 100 : 0,
    },
    scores,
    endingState,
    warnings,
    feedback,
  };
}

// ========================================
// BANKING SYSTEM
// ========================================

function processLoan(
  decision: Level1Decision,
  state: Level1TeamState
): { newLoan: ActiveLoan | null; availableFunds: number } {
  let newLoan: ActiveLoan | null = null;
  let availableFunds = state.cash;

  if (decision.loan.take && decision.loan.term && decision.loan.amount) {
    const option = LOAN_OPTIONS[decision.loan.term as Exclude<LoanTerm, 'none'>];
    const amount = Math.max(option.minAmount, Math.min(option.maxAmount, decision.loan.amount));

    const interestCost = amount * option.interestRate;
    const totalOwed = amount + interestCost;
    const monthlyPayment = totalOwed / option.sessions;

    newLoan = {
      principal: amount,
      interestRate: option.interestRate,
      totalOwed,
      monthlyPayment,
      sessionsRemaining: option.sessions,
      sessionsTaken: option.sessions,
    };

    availableFunds += amount; // Add loan to available cash
  }

  return { newLoan, availableFunds };
}

function calculateDebtPayment(loan: ActiveLoan | null): number {
  return loan && loan.sessionsRemaining > 0 ? loan.monthlyPayment : 0;
}

function updateLoan(currentLoan: ActiveLoan | null, newLoan: ActiveLoan | null): ActiveLoan | null {
  // If taking new loan, return it as-is (don't decrement in first session)
  if (newLoan) {
    return newLoan;
  }

  // If no current loan, return null
  if (!currentLoan) {
    return null;
  }

  // Reduce sessions remaining for existing loans
  const sessionsRemaining = currentLoan.sessionsRemaining - 1;

  // If paid off, return null
  if (sessionsRemaining <= 0) {
    return null;
  }

  // Update remaining sessions
  return {
    ...currentLoan,
    sessionsRemaining,
  };
}

function calculateTotalDebt(loan: ActiveLoan | null): number {
  if (!loan) return 0;
  return loan.monthlyPayment * loan.sessionsRemaining;
}

// ========================================
// SPENDING CALCULATIONS
// ========================================

function calculateSpending(
  decision: Level1Decision,
  availableFunds: number
): {
  employees: number;
  products: number;
  marketing: number;
  savings: number;
} {
  const { employees, products, marketing, savings } = decision.allocation;

  // Calculate dollar amounts from percentages
  return {
    employees: (availableFunds * employees) / 100,
    products: (availableFunds * products) / 100,
    marketing: (availableFunds * marketing) / 100,
    savings: (availableFunds * savings) / 100,
  };
}

// ========================================
// REVENUE CALCULATION
// ========================================

function calculateRevenue(marketingSpending: number): number {
  return marketingSpending * LEVEL1_CONFIG.marketingMultiplier;
}

// ========================================
// FINANCIAL CALCULATIONS
// ========================================

function calculateFinancials(
  revenue: number,
  spending: { employees: number; products: number; marketing: number; savings: number },
  debtPayment: number,
  availableFunds: number
): {
  grossProfit: number;
  netProfit: number;
  cashFlow: number;
  endingCash: number;
} {
  const operatingCosts = spending.employees + spending.products + spending.marketing;

  const grossProfit = revenue - operatingCosts;
  const netProfit = grossProfit - debtPayment;

  // Cash flow = revenue - spending - debt payment
  const cashFlow = revenue - operatingCosts - debtPayment;

  // Ending cash = available funds (with loan) - operating costs + revenue - debt payment
  // Equivalent to: unspent funds (savings) + revenue - debt payment
  const endingCash = availableFunds - operatingCosts + revenue - debtPayment;

  return {
    grossProfit,
    netProfit,
    cashFlow,
    endingCash,
  };
}

// ========================================
// SCORING CALCULATIONS
// ========================================

function calculateScores(
  financial: { endingCash: number; netProfit: number },
  spending: { employees: number; products: number },
  totalDebt: number,
  endingCash: number
): {
  cashAndProfit: number;
  debtHealth: number;
  employeeHappiness: number;
  customerSatisfaction: number;
  overall: number;
} {
  const cashAndProfit = calculateCashProfitScore(financial.endingCash);
  const debtHealth = calculateDebtHealthScore(totalDebt, endingCash);
  const employeeHappiness = calculateEmployeeScore(spending.employees);
  const customerSatisfaction = calculateCustomerScore(spending.products);

  const overall =
    cashAndProfit * LEVEL1_CONFIG.weights.cashAndProfit +
    debtHealth * LEVEL1_CONFIG.weights.debtHealth +
    employeeHappiness * LEVEL1_CONFIG.weights.employeeHappiness +
    customerSatisfaction * LEVEL1_CONFIG.weights.customerSatisfaction;

  return {
    cashAndProfit: Math.round(cashAndProfit),
    debtHealth: Math.round(debtHealth),
    employeeHappiness: Math.round(employeeHappiness),
    customerSatisfaction: Math.round(customerSatisfaction),
    overall: Math.round(overall),
  };
}

function calculateCashProfitScore(cash: number): number {
  const t = SCORING_THRESHOLDS.cashAndProfit;

  if (cash >= t.excellent) return 90 + ((cash - t.excellent) / 10000) * 10; // 90-100
  if (cash >= t.good) return 60 + ((cash - t.good) / (t.excellent - t.good)) * 30; // 60-90
  if (cash >= t.okay) return 40 + ((cash - t.okay) / (t.good - t.okay)) * 20; // 40-60
  if (cash >= 0) return (cash / t.okay) * 40; // 0-40
  return 0; // Negative cash = 0 (bankruptcy)
}

function calculateDebtHealthScore(totalDebt: number, cash: number): number {
  if (totalDebt === 0) return SCORING_THRESHOLDS.debtHealth.noDebt;

  const totalAssets = cash; // Level 1: Assets = Cash (simplified)
  const debtRatio = (totalDebt / totalAssets) * 100;

  const t = SCORING_THRESHOLDS.debtHealth;

  let score = 0;
  if (debtRatio < t.lowDebt) score = 90 + (t.lowDebt - debtRatio) / 3; // 90-100
  else if (debtRatio < t.moderateDebt) score = 70 + ((t.moderateDebt - debtRatio) / (t.moderateDebt - t.lowDebt)) * 20; // 70-90
  else if (debtRatio < t.highDebt) score = 50 + ((t.highDebt - debtRatio) / (t.highDebt - t.moderateDebt)) * 20; // 50-70
  else if (debtRatio < t.veryHighDebt) score = 30 + ((t.veryHighDebt - debtRatio) / (t.veryHighDebt - t.highDebt)) * 20; // 30-50
  else score = Math.max(0, 30 - (debtRatio - t.veryHighDebt) / 2); // 0-30

  return Math.max(0, Math.min(100, score));
}

function calculateEmployeeScore(employeeSpending: number): number {
  const t = SCORING_THRESHOLDS.employees;
  const score = t.base + (employeeSpending / 1000) * t.perThousand;
  return Math.min(100, score);
}

function calculateCustomerScore(productSpending: number): number {
  const t = SCORING_THRESHOLDS.customers;
  const score = t.base + (productSpending / 1000) * t.perThousand;
  return Math.min(100, score);
}

// ========================================
// WARNING SYSTEM
// ========================================

function generateWarnings(
  financial: { endingCash: number },
  loan: ActiveLoan | null,
  totalDebt: number
): Warning[] {
  const warnings: Warning[] = [];

  // Bankruptcy check
  if (financial.endingCash < 0) {
    warnings.push({
      level: 'bankruptcy',
      title: 'BANKRUPTCY',
      message:
        "You ran out of cash and couldn't pay your debt. Game Over. Let's restart and try a different strategy!",
      action: 'Review your spending and debt decisions. Try borrowing less or spending more carefully.',
    });
    return warnings; // Critical - return immediately
  }

  // Cash runway warnings
  if (loan && loan.sessionsRemaining > 0) {
    const sessionsOfCash = financial.endingCash / loan.monthlyPayment;

    if (sessionsOfCash < LEVEL1_CONFIG.warnings.criticalCashSessions) {
      warnings.push({
        level: 'critical',
        title: 'CRITICAL: Cannot Make Next Payment',
        message: `You only have $${financial.endingCash.toFixed(0)} but owe $${loan.monthlyPayment.toFixed(
          0
        )} next session!`,
        action: 'Urgent: Cut ALL non-essential costs and focus only on revenue generation.',
      });
    } else if (sessionsOfCash < LEVEL1_CONFIG.warnings.lowCashSessions) {
      warnings.push({
        level: 'warning',
        title: 'Low Cash Warning',
        message: `You only have ${sessionsOfCash.toFixed(1)} sessions worth of cash to make debt payments.`,
        action: 'Focus on building revenue or cutting costs to improve cash position.',
      });
    }
  }

  // Debt ratio warnings
  const totalAssets = financial.endingCash; // Level 1: Assets = Cash (simplified)
  const debtRatio = (totalDebt / totalAssets) * 100;

  if (debtRatio > 90) {
    warnings.push({
      level: 'critical',
      title: 'EXTREME Over-Leverage',
      message: `Your debt ratio is ${debtRatio.toFixed(0)}%! You owe almost as much as your total assets!`,
      action: 'This is extremely dangerous. Focus on paying down debt and building assets.',
    });
  } else if (debtRatio > 70) {
    warnings.push({
      level: 'warning',
      title: 'High Debt Risk',
      message: `Your debt ratio is ${debtRatio.toFixed(0)}% (risky zone is above 70%).`,
      action: 'Avoid taking more debt. Focus on paying down existing obligations.',
    });
  }

  // Low cash (but not bankrupt)
  if (financial.endingCash < 10000 && financial.endingCash > 0) {
    warnings.push({
      level: 'warning',
      title: 'Low Cash Reserves',
      message: `Your cash is low ($${financial.endingCash.toFixed(0)}). This limits your options.`,
      action: 'Consider saving some cash as an emergency fund next session.',
    });
  }

  return warnings;
}

// ========================================
// FEEDBACK GENERATION
// ========================================

function generateFeedback(
  decision: Level1Decision,
  financial: { endingCash: number; netProfit: number; grossProfit: number },
  scores: any,
  warnings: Warning[],
  previousState: Level1TeamState
): Feedback {
  const strengths: string[] = [];
  const concerns: string[] = [];
  const learningTips: LearningTip[] = [];

  // Analyze scores
  if (scores.cashAndProfit >= 70) strengths.push(`Strong cash position ($${financial.endingCash.toFixed(0)})`);
  else if (scores.cashAndProfit < 50) concerns.push(`Low cash reserves ($${financial.endingCash.toFixed(0)})`);

  if (scores.debtHealth >= 80) strengths.push('Healthy debt management');
  else if (scores.debtHealth < 60) concerns.push('Debt levels are concerning');

  if (scores.employeeHappiness >= 70) strengths.push('Good employee investment');
  else if (scores.employeeHappiness < 60) concerns.push('Employee investment could be higher');

  if (scores.customerSatisfaction >= 70) strengths.push('Good product quality investment');
  else if (scores.customerSatisfaction < 60) concerns.push('Product quality needs more attention');

  // Learning tips based on situation
  if (decision.loan.take) {
    learningTips.push({
      concept: 'Interest',
      explanation: `Interest is the cost of borrowing money - like rent for using the bank's money. Your ${
        decision.loan.term
      }-term loan at ${(LOAN_OPTIONS[decision.loan.term as Exclude<LoanTerm, 'none'>].interestRate * 100).toFixed(
        0
      )}% interest means you'll pay extra to borrow.`,
    });

    learningTips.push({
      concept: 'Leverage',
      explanation:
        'Leverage means using borrowed money to grow faster. It works when your revenue growth is greater than the interest cost.',
      example: financial.netProfit > 0 ? 'Your revenue covered the loan payment - good use of leverage!' : 'Your revenue didn\'t cover the loan payment - leverage didn\'t work this time.',
    });
  }

  if (previousState.activeLoan || decision.loan.take) {
    const totalAssets = financial.endingCash; // Level 1: Assets = Cash (simplified)
    const totalDebt = previousState.activeLoan ? calculateTotalDebt(previousState.activeLoan) : 0;
    const debtRatio = (totalDebt / totalAssets) * 100;

    learningTips.push({
      concept: 'Debt Ratio',
      explanation: 'Debt ratio = Total Debt / Total Assets. It shows how much you owe relative to what you own.',
      example: `Your ratio is ${debtRatio.toFixed(0)}%. Under 30% is safe, 30-50% is manageable, above 70% is risky.`,
    });
  }

  // Generate summary
  const summary =
    scores.overall >= 70
      ? `Good session! Overall score: ${scores.overall}/100. ${strengths.length > 0 ? strengths[0] : 'Keep up the balanced approach.'}`
      : scores.overall >= 50
      ? `Mixed results. Overall score: ${scores.overall}/100. Some areas need attention.`
      : `Challenging session. Overall score: ${scores.overall}/100. ${concerns.length > 0 ? concerns[0] : 'Review your strategy.'} `;

  // Next session advice
  let nextSessionAdvice = '';
  if (warnings.some((w) => w.level === 'critical')) {
    nextSessionAdvice = 'Next session: URGENT - Address cash flow problems immediately!';
  } else if (scores.debtHealth < 50) {
    nextSessionAdvice = 'Next session: Focus on paying down debt and building cash reserves.';
  } else if (scores.cashAndProfit < 50) {
    nextSessionAdvice = 'Next session: Prioritize revenue generation through marketing.';
  } else {
    nextSessionAdvice = 'Next session: Continue your balanced approach. Consider strategic investments.';
  }

  return {
    summary,
    strengths,
    concerns,
    learningTips,
    nextSessionAdvice,
  };
}

// ========================================
// HELPER: CREATE INITIAL STATE
// ========================================

export function createInitialState(): Level1TeamState {
  return {
    cash: LEVEL1_CONFIG.startingCash,
    totalAssets: LEVEL1_CONFIG.startingCash, // Level 1: Assets = Cash (simplified)
    activeLoan: null,
    totalDebt: 0,
    sessionNumber: 0,
    previousRevenue: 0,
    previousProfit: 0,
  };
}
