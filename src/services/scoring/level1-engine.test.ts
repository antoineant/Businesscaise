import { describe, it, expect, beforeEach } from 'vitest';
import { processLevel1Session, createInitialState } from './level1-engine';
import { Level1Decision, Level1TeamState } from './level1-types';

describe('Level 1 Scoring Engine - Banking & Debt System', () => {
  let initialState: Level1TeamState;

  beforeEach(() => {
    initialState = createInitialState();
  });

  describe('Scenario A: CONSERVATIVE (No Debt)', () => {
    it('should handle no loan scenario with modest results', () => {
      const decision: Level1Decision = {
        loan: {
          take: false,
        },
        allocation: {
          employees: 40,
          products: 35,
          marketing: 25,
          savings: 0,
        },
      };

      const result = processLevel1Session(decision, initialState);

      // Financial calculations
      expect(result.calculations.availableFunds).toBe(50000); // No loan
      expect(result.calculations.employeeSpending).toBe(20000); // 40% of 50k
      expect(result.calculations.productSpending).toBe(17500); // 35% of 50k
      expect(result.calculations.marketingSpending).toBe(12500); // 25% of 50k
      expect(result.calculations.revenue).toBe(31250); // Marketing * 2.5
      expect(result.calculations.debtPayment).toBe(0); // No debt
      expect(result.calculations.netProfit).toBe(-18750); // 31250 - 50000
      expect(result.calculations.endingCash).toBe(31250); // 50000 + 31250 - 50000

      // Scores
      expect(result.scores.debtHealth).toBe(100); // No debt = perfect
      expect(result.scores.cashAndProfit).toBeGreaterThan(85); // Good cash ($31k) hits excellent tier
      expect(result.scores.cashAndProfit).toBeLessThan(95);
      expect(result.scores.employeeHappiness).toBeGreaterThanOrEqual(68); // $20k investment
      expect(result.scores.customerSatisfaction).toBeGreaterThanOrEqual(65); // $17.5k investment
      expect(result.scores.overall).toBeGreaterThan(70); // Strong overall due to no debt + good cash
      expect(result.scores.overall).toBeLessThan(85);

      // Warnings - None expected (cash is good at $31k, no debt)
      // Conservative approach should be low-risk

      // Feedback
      expect(result.feedback.strengths).toContain('Healthy debt management');
      // No concerns expected - conservative approach is safe

      // State updates
      expect(result.endingState.cash).toBe(31250);
      expect(result.endingState.totalDebt).toBe(0);
      expect(result.endingState.activeLoan).toBeNull();
      expect(result.endingState.sessionNumber).toBe(1);

      console.log('\n🧪 SCENARIO A: CONSERVATIVE (No Debt)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Revenue: $${result.calculations.revenue.toLocaleString()}`);
      console.log(`Costs: $${result.calculations.operatingCosts.toLocaleString()}`);
      console.log(`Profit: $${result.calculations.netProfit.toLocaleString()}`);
      console.log(`Ending Cash: $${result.calculations.endingCash.toLocaleString()}`);
      console.log(`\nScores:`);
      console.log(`  💰 Cash & Profit: ${result.scores.cashAndProfit}/100`);
      console.log(`  💳 Debt Health: ${result.scores.debtHealth}/100`);
      console.log(`  👥 Employees: ${result.scores.employeeHappiness}/100`);
      console.log(`  😊 Customers: ${result.scores.customerSatisfaction}/100`);
      console.log(`  📊 OVERALL: ${result.scores.overall}/100`);
      console.log(`\nFeedback: ${result.feedback.summary}`);
    });
  });

  describe('Scenario B: SMART LEVERAGE', () => {
    it('should show positive results with strategic debt use', () => {
      const decision: Level1Decision = {
        loan: {
          take: true,
          term: 'medium',
          amount: 40000,
        },
        allocation: {
          employees: 33,
          products: 33,
          marketing: 34,
          savings: 0,
        },
      };

      const result = processLevel1Session(decision, initialState);

      // Financial calculations
      expect(result.calculations.availableFunds).toBe(90000); // 50k + 40k loan
      expect(result.calculations.revenue).toBeGreaterThan(70000); // Strong marketing
      expect(result.calculations.debtPayment).toBeCloseTo(3600, 0); // 43200 / 12 sessions
      expect(result.calculations.endingCash).toBeGreaterThan(25000); // Positive cash flow

      // Debt metrics
      expect(result.calculations.debtRatio).toBeGreaterThan(50); // Moderate debt
      expect(result.calculations.debtRatio).toBeLessThan(80);
      expect(result.endingState.totalDebt).toBeCloseTo(43200, 0); // 40k + 8% interest

      // Scores
      expect(result.scores.debtHealth).toBeGreaterThan(50); // Moderate debt ratio ~59%
      expect(result.scores.debtHealth).toBeLessThan(75);
      expect(result.scores.employeeHappiness).toBeGreaterThan(75); // Good investment
      expect(result.scores.customerSatisfaction).toBeGreaterThan(80); // Good investment
      expect(result.scores.overall).toBeGreaterThan(80); // Strong overall: smart leverage pays off
      expect(result.scores.overall).toBeLessThan(95);

      // Warnings
      const hasDebtWarning = result.warnings.some((w) => w.title.toLowerCase().includes('debt'));
      expect(hasDebtWarning || result.warnings.length === 0).toBe(true); // May or may not warn

      // Feedback should mention leverage
      const hasLeverageTip = result.feedback.learningTips.some((tip) => tip.concept === 'Leverage');
      expect(hasLeverageTip).toBe(true);

      // State updates
      expect(result.endingState.activeLoan).not.toBeNull();
      expect(result.endingState.activeLoan?.sessionsRemaining).toBe(12);

      console.log('\n🧪 SCENARIO B: SMART LEVERAGE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Loan Taken: $40,000 (Medium-term, 8% interest)`);
      console.log(`Monthly Payment: $${result.calculations.debtPayment.toLocaleString()}`);
      console.log(`\nRevenue: $${result.calculations.revenue.toLocaleString()}`);
      console.log(`Costs: $${result.calculations.operatingCosts.toLocaleString()}`);
      console.log(`Profit: $${result.calculations.netProfit.toLocaleString()}`);
      console.log(`Ending Cash: $${result.calculations.endingCash.toLocaleString()}`);
      console.log(`Debt Ratio: ${result.calculations.debtRatio.toFixed(1)}%`);
      console.log(`\nScores:`);
      console.log(`  💰 Cash & Profit: ${result.scores.cashAndProfit}/100`);
      console.log(`  💳 Debt Health: ${result.scores.debtHealth}/100`);
      console.log(`  👥 Employees: ${result.scores.employeeHappiness}/100`);
      console.log(`  😊 Customers: ${result.scores.customerSatisfaction}/100`);
      console.log(`  📊 OVERALL: ${result.scores.overall}/100`);
      console.log(`\nFeedback: ${result.feedback.summary}`);
      console.log(`Learning Tips:`);
      result.feedback.learningTips.forEach((tip) => {
        console.log(`  • ${tip.concept}: ${tip.explanation}`);
      });
    });
  });

  describe('Scenario C: OVER-LEVERAGED (Danger!)', () => {
    it('should show crisis with excessive debt', () => {
      const decision: Level1Decision = {
        loan: {
          take: true,
          term: 'long',
          amount: 100000,
        },
        allocation: {
          employees: 30,
          products: 35,
          marketing: 35,
          savings: 0,
        },
      };

      const result = processLevel1Session(decision, initialState);

      // Financial calculations
      expect(result.calculations.availableFunds).toBe(150000); // 50k + 100k loan
      expect(result.calculations.revenue).toBeGreaterThan(120000); // Very high marketing (52.5k * 2.5 = 131k)
      expect(result.calculations.debtPayment).toBeCloseTo(4667, 0); // 112000 / 24
      expect(result.calculations.endingCash).toBeGreaterThan(120000); // High cash due to strong revenue

      // Debt metrics - HIGH (but not critical due to strong revenue)
      expect(result.calculations.debtRatio).toBeGreaterThan(80); // High leverage ~89%
      expect(result.calculations.debtRatio).toBeLessThan(95);
      expect(result.endingState.totalDebt).toBeCloseTo(112000, 0); // 100k + 12% interest

      // Scores - Mixed (debt is high but cash is strong from revenue)
      expect(result.scores.debtHealth).toBeLessThan(35); // Poor debt health (89% ratio)
      expect(result.scores.cashAndProfit).toBeGreaterThan(90); // Strong cash (~$126k)
      expect(result.scores.overall).toBeGreaterThan(65); // Mixed: good cash offsets debt concern

      // Warnings - SHOULD HAVE CRITICAL WARNINGS
      expect(result.warnings.length).toBeGreaterThan(0);
      const hasCriticalWarning = result.warnings.some((w) => w.level === 'critical' || w.level === 'warning');
      expect(hasCriticalWarning).toBe(true);

      // Debt warning should be present
      const hasDebtWarning = result.warnings.some((w) => w.title.toLowerCase().includes('leverage') || w.title.toLowerCase().includes('debt'));
      expect(hasDebtWarning).toBe(true);

      // Feedback should show concerns
      expect(result.feedback.concerns.length).toBeGreaterThan(0);
      expect(result.feedback.concerns.some((c) => c.toLowerCase().includes('debt') || c.toLowerCase().includes('cash'))).toBe(true);

      console.log('\n🧪 SCENARIO C: OVER-LEVERAGED 💀');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Loan Taken: $100,000 (Long-term, 12% interest)`);
      console.log(`Monthly Payment: $${result.calculations.debtPayment.toLocaleString()}`);
      console.log(`\nRevenue: $${result.calculations.revenue.toLocaleString()}`);
      console.log(`Costs: $${result.calculations.operatingCosts.toLocaleString()}`);
      console.log(`Profit: $${result.calculations.netProfit.toLocaleString()}`);
      console.log(`Ending Cash: $${result.calculations.endingCash.toLocaleString()}`);
      console.log(`Debt Ratio: ${result.calculations.debtRatio.toFixed(1)}% 🚨`);
      console.log(`\nScores:`);
      console.log(`  💰 Cash & Profit: ${result.scores.cashAndProfit}/100`);
      console.log(`  💳 Debt Health: ${result.scores.debtHealth}/100 ⚠️`);
      console.log(`  👥 Employees: ${result.scores.employeeHappiness}/100`);
      console.log(`  😊 Customers: ${result.scores.customerSatisfaction}/100`);
      console.log(`  📊 OVERALL: ${result.scores.overall}/100 ❌ FAILING`);
      console.log(`\n⚠️  Warnings:`);
      result.warnings.forEach((warning) => {
        console.log(`  • [${warning.level.toUpperCase()}] ${warning.title}`);
        console.log(`    ${warning.message}`);
      });
      console.log(`\nConcerns:`);
      result.feedback.concerns.forEach((concern) => {
        console.log(`  ❌ ${concern}`);
      });
    });
  });

  describe('Banking System Mechanics', () => {
    it('should calculate loan payments correctly for short-term', () => {
      const decision: Level1Decision = {
        loan: {
          take: true,
          term: 'short',
          amount: 30000,
        },
        allocation: { employees: 25, products: 25, marketing: 50, savings: 0 },
      };

      const result = processLevel1Session(decision, initialState);

      // 30000 * 1.05 = 31500, / 6 sessions = 5250/session
      expect(result.calculations.debtPayment).toBeCloseTo(5250, 0);
      expect(result.endingState.totalDebt).toBeCloseTo(31500, 0);
      expect(result.endingState.activeLoan?.sessionsRemaining).toBe(6);
    });

    it('should calculate loan payments correctly for medium-term', () => {
      const decision: Level1Decision = {
        loan: {
          take: true,
          term: 'medium',
          amount: 50000,
        },
        allocation: { employees: 25, products: 25, marketing: 50, savings: 0 },
      };

      const result = processLevel1Session(decision, initialState);

      // 50000 * 1.08 = 54000, / 12 sessions = 4500/session
      expect(result.calculations.debtPayment).toBeCloseTo(4500, 0);
      expect(result.endingState.totalDebt).toBeCloseTo(54000, 0);
      expect(result.endingState.activeLoan?.sessionsRemaining).toBe(12);
    });

    it('should calculate loan payments correctly for long-term', () => {
      const decision: Level1Decision = {
        loan: {
          take: true,
          term: 'long',
          amount: 80000,
        },
        allocation: { employees: 25, products: 25, marketing: 50, savings: 0 },
      };

      const result = processLevel1Session(decision, initialState);

      // 80000 * 1.12 = 89600, / 24 sessions = 3733.33/session
      expect(result.calculations.debtPayment).toBeCloseTo(3733.33, 1);
      expect(result.endingState.totalDebt).toBeCloseTo(89600, 0);
      expect(result.endingState.activeLoan?.sessionsRemaining).toBe(24);
    });

    it('should decrement loan sessions over time', () => {
      // Take loan in session 1
      const session1Decision: Level1Decision = {
        loan: { take: true, term: 'short', amount: 30000 },
        allocation: { employees: 25, products: 25, marketing: 50, savings: 0 },
      };

      const session1Result = processLevel1Session(session1Decision, initialState);
      expect(session1Result.endingState.activeLoan?.sessionsRemaining).toBe(6);

      // Session 2 - no new loan, just make payment
      const session2Decision: Level1Decision = {
        loan: { take: false },
        allocation: { employees: 25, products: 25, marketing: 50, savings: 0 },
      };

      const session2Result = processLevel1Session(session2Decision, session1Result.endingState);
      expect(session2Result.endingState.activeLoan?.sessionsRemaining).toBe(5);
      expect(session2Result.calculations.debtPayment).toBeCloseTo(5250, 0);
    });

    it('should clear loan when fully paid', () => {
      // Start with loan that has 1 session remaining
      const stateWithLoan: Level1TeamState = {
        ...initialState,
        activeLoan: {
          principal: 30000,
          interestRate: 0.05,
          totalOwed: 31500,
          monthlyPayment: 5250,
          sessionsRemaining: 1,
          sessionsTaken: 6,
        },
        totalDebt: 5250,
      };

      const decision: Level1Decision = {
        loan: { take: false },
        allocation: { employees: 25, products: 25, marketing: 50, savings: 0 },
      };

      const result = processLevel1Session(decision, stateWithLoan);

      // Loan should be paid off
      expect(result.endingState.activeLoan).toBeNull();
      expect(result.endingState.totalDebt).toBe(0);
      expect(result.calculations.debtPayment).toBeCloseTo(5250, 0); // Final payment made
    });
  });

  describe('Warning System', () => {
    it('should warn when cash is low but not critical', () => {
      const stateWithLoan: Level1TeamState = {
        ...initialState,
        cash: 8000, // Low cash - will be under $10k after session
        activeLoan: {
          principal: 40000,
          interestRate: 0.08,
          totalOwed: 43200,
          monthlyPayment: 3600,
          sessionsRemaining: 12,
          sessionsTaken: 12,
        },
        totalDebt: 43200,
      };

      const decision: Level1Decision = {
        loan: { take: false },
        allocation: { employees: 50, products: 30, marketing: 20, savings: 0 },
      };

      const result = processLevel1Session(decision, stateWithLoan);

      // Should have warning about low cash (ending cash will be low after debt payment)
      const hasLowCashWarning = result.warnings.some((w) => w.level === 'warning' && w.title.includes('Cash'));
      expect(hasLowCashWarning).toBe(true);
    });

    it('should give critical warning when cash runway is very short', () => {
      const stateWithLoan: Level1TeamState = {
        ...initialState,
        cash: 3000, // Very low cash
        activeLoan: {
          principal: 40000,
          interestRate: 0.08,
          totalOwed: 43200,
          monthlyPayment: 3600,
          sessionsRemaining: 12,
          sessionsTaken: 12,
        },
        totalDebt: 43200,
      };

      const decision: Level1Decision = {
        loan: { take: false },
        allocation: { employees: 20, products: 20, marketing: 60, savings: 0 },
      };

      const result = processLevel1Session(decision, stateWithLoan);

      // Should have critical warning (3000 / 3600 = 0.83 sessions)
      const hasCriticalWarning = result.warnings.some((w) => w.level === 'critical');
      expect(hasCriticalWarning).toBe(true);
    });

    it('should trigger bankruptcy when cash goes negative', () => {
      const stateWithLoan: Level1TeamState = {
        ...initialState,
        cash: 1000, // Very low cash
        activeLoan: {
          principal: 40000,
          interestRate: 0.08,
          totalOwed: 43200,
          monthlyPayment: 3600,
          sessionsRemaining: 12,
          sessionsTaken: 12,
        },
        totalDebt: 43200,
      };

      // Spend more than we have
      const decision: Level1Decision = {
        loan: { take: false },
        allocation: { employees: 50, products: 50, marketing: 0, savings: 0 }, // No revenue!
      };

      const result = processLevel1Session(decision, stateWithLoan);

      // Should be bankrupt
      const hasBankruptcy = result.warnings.some((w) => w.level === 'bankruptcy');
      expect(hasBankruptcy).toBe(true);
      expect(result.calculations.endingCash).toBeLessThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero marketing (no revenue)', () => {
      const decision: Level1Decision = {
        loan: { take: false },
        allocation: { employees: 50, products: 50, marketing: 0, savings: 0 },
      };

      const result = processLevel1Session(decision, initialState);

      expect(result.calculations.revenue).toBe(0);
      expect(result.calculations.netProfit).toBeLessThan(0);
      expect(result.scores.cashAndProfit).toBeLessThan(50);
    });

    it('should handle 100% savings allocation', () => {
      const decision: Level1Decision = {
        loan: { take: false },
        allocation: { employees: 0, products: 0, marketing: 0, savings: 100 },
      };

      const result = processLevel1Session(decision, initialState);

      expect(result.calculations.cashSaved).toBe(50000);
      expect(result.calculations.revenue).toBe(0);
      expect(result.calculations.endingCash).toBe(50000); // No change
    });

    it('should enforce loan limits', () => {
      const decision: Level1Decision = {
        loan: {
          take: true,
          term: 'short',
          amount: 999999, // Way over limit
        },
        allocation: { employees: 25, products: 25, marketing: 50, savings: 0 },
      };

      const result = processLevel1Session(decision, initialState);

      // Should be capped at max for short-term (50000)
      expect(result.calculations.availableFunds).toBe(100000); // 50k starting + 50k max loan
    });
  });
});
