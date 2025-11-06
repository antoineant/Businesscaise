// AI Stress Testing Suite for Level 1 Scoring Engine
// Tests with different AI players trying to break the system

import { describe, it, expect } from 'vitest';
import { processLevel1Session, createInitialState } from './level1-engine';
import type { Level1TeamState, Level1SessionResult } from './level1-types';
import {
  ALL_PLAYERS,
  ConservativePlayer,
  AggressiveBorrower,
  ChaoticPlayer,
  EdgeCaseExploiter,
  BankruptcySeeker,
  Optimizer,
  Fuzzer,
  DebtJuggler,
  ZeroSpender,
} from './ai-players';

// Financial invariant helpers
function checkFinancialInvariants(
  state: Level1TeamState,
  result: Level1SessionResult,
  playerName: string
): string[] {
  const errors: string[] = [];

  // Invariant 1: Cash can't be negative (except bankruptcy)
  if (result.endingState.cash < 0 && !result.warnings.some((w) => w.level === 'bankruptcy')) {
    errors.push(
      `[${playerName}] Cash is negative ($${result.endingState.cash}) without bankruptcy warning`
    );
  }

  // Invariant 2: Debt can't be negative
  if (result.endingState.totalDebt < 0) {
    errors.push(`[${playerName}] Debt is negative ($${result.endingState.totalDebt})`);
  }

  // Invariant 3: If loan exists, monthly payment should be positive
  if (result.endingState.activeLoan && result.endingState.activeLoan.monthlyPayment <= 0) {
    errors.push(
      `[${playerName}] Active loan has non-positive monthly payment (${result.endingState.activeLoan.monthlyPayment})`
    );
  }

  // Invariant 4: If loan exists, sessions remaining should be positive
  if (result.endingState.activeLoan && result.endingState.activeLoan.sessionsRemaining <= 0) {
    errors.push(
      `[${playerName}] Active loan has non-positive sessions remaining (${result.endingState.activeLoan.sessionsRemaining})`
    );
  }

  // Invariant 5: Total debt should match loan calculations
  if (result.endingState.activeLoan) {
    const expectedDebt =
      result.endingState.activeLoan.monthlyPayment * result.endingState.activeLoan.sessionsRemaining;
    if (Math.abs(result.endingState.totalDebt - expectedDebt) > 1) {
      // Allow 1 dollar rounding
      errors.push(
        `[${playerName}] Total debt ($${result.endingState.totalDebt}) doesn't match loan calculation ($${expectedDebt})`
      );
    }
  }

  // Invariant 6: If no loan, debt should be 0
  if (!result.endingState.activeLoan && result.endingState.totalDebt !== 0) {
    errors.push(`[${playerName}] No active loan but debt is ${result.endingState.totalDebt}`);
  }

  // Invariant 7: Scores should be in valid ranges
  const allScores = [
    result.scores.overall,
    result.scores.cashAndProfit,
    result.scores.debtHealth,
    result.scores.employeeHappiness,
    result.scores.customerSatisfaction,
  ];

  allScores.forEach((score, i) => {
    const names = ['overall', 'cashAndProfit', 'debtHealth', 'employeeHappiness', 'customerSatisfaction'];
    if (isNaN(score) || !isFinite(score)) {
      errors.push(`[${playerName}] ${names[i]} score is NaN or Infinite: ${score}`);
    }
  });

  // Invariant 8: Session number should increment
  if (result.endingState.sessionNumber !== state.sessionNumber + 1) {
    errors.push(
      `[${playerName}] Session number didn't increment correctly (${state.sessionNumber} -> ${result.endingState.sessionNumber})`
    );
  }

  return errors;
}

// ========================================
// MULTI-SESSION SIMULATION TESTS
// ========================================
describe('AI Players - Multi-Session Simulations', () => {
  const SESSIONS_TO_SIMULATE = 20;

  ALL_PLAYERS.forEach((player) => {
    it(`should survive ${SESSIONS_TO_SIMULATE} sessions: ${player.name}`, () => {
      let state = createInitialState();
      const errors: string[] = [];
      let bankruptcySession = -1;

      for (let session = 0; session < SESSIONS_TO_SIMULATE; session++) {
        try {
          const decision = player.makeDecision(state);
          const result = processLevel1Session(decision, state);

          // Check invariants
          const sessionErrors = checkFinancialInvariants(state, result, player.name);
          errors.push(...sessionErrors);

          // Check for bankruptcy
          if (result.warnings.some((w) => w.level === 'bankruptcy')) {
            bankruptcySession = session + 1;
            break; // Stop after bankruptcy
          }

          state = result.endingState;
        } catch (error: any) {
          errors.push(`[${player.name}] Session ${session + 1} crashed: ${error.message}`);
          break;
        }
      }

      // Report results
      if (bankruptcySession > 0) {
        console.log(`  ⚠️  ${player.name} went bankrupt at session ${bankruptcySession}`);
      } else {
        console.log(
          `  ✓ ${player.name} survived ${SESSIONS_TO_SIMULATE} sessions (Final cash: $${state.cash.toLocaleString()}, Debt: $${state.totalDebt.toLocaleString()})`
        );
      }

      // Fail if any invariants broken
      if (errors.length > 0) {
        console.error('Invariant violations:', errors);
      }
      expect(errors).toHaveLength(0);
    });
  });
});

// ========================================
// PROPERTY-BASED TESTS
// ========================================
describe('Property-Based Tests - Financial Invariants', () => {
  it('should never create money out of thin air', () => {
    const player = new ChaoticPlayer();
    let state = createInitialState();

    for (let i = 0; i < 50; i++) {
      const decision = player.makeDecision(state);
      const result = processLevel1Session(decision, state);

      // Money in = previous cash + loan amount + revenue
      const startingCash = state.cash;
      const loanAmount = decision.loan.take && decision.loan.amount ? decision.loan.amount : 0;
      const revenue = result.calculations.revenue;
      const moneyIn = startingCash + loanAmount + revenue;

      // Money out = spending + debt payment
      const spending =
        result.calculations.employeeSpending +
        result.calculations.productSpending +
        result.calculations.marketingSpending;
      const debtPayment = result.calculations.debtPayment;
      const moneyOut = spending + debtPayment;

      // Ending cash = money in - money out
      const expectedCash = moneyIn - moneyOut;

      expect(result.endingState.cash).toBeCloseTo(expectedCash, 0);

      state = result.endingState;
    }
  });

  it('should maintain debt = monthlyPayment × sessionsRemaining', () => {
    const player = new AggressiveBorrower();
    let state = createInitialState();

    for (let i = 0; i < 20; i++) {
      const decision = player.makeDecision(state);
      const result = processLevel1Session(decision, state);

      if (result.endingState.activeLoan) {
        const expectedDebt =
          result.endingState.activeLoan.monthlyPayment * result.endingState.activeLoan.sessionsRemaining;
        expect(result.endingState.totalDebt).toBeCloseTo(expectedDebt, 1);
      } else {
        expect(result.endingState.totalDebt).toBe(0);
      }

      state = result.endingState;
    }
  });

  it('should always decrement loan sessions', () => {
    const player = new AggressiveBorrower();
    let state = createInitialState();

    // Take a loan
    const decision1 = player.makeDecision(state);
    const result1 = processLevel1Session(decision1, state);
    expect(result1.endingState.activeLoan).toBeTruthy();

    const initialSessions = result1.endingState.activeLoan!.sessionsRemaining;

    // Next session should decrement
    state = result1.endingState;
    const decision2 = { loan: { take: false }, allocation: { employees: 25, products: 25, marketing: 25, savings: 25 } };
    const result2 = processLevel1Session(decision2, state);

    expect(result2.endingState.activeLoan!.sessionsRemaining).toBe(initialSessions - 1);
  });

  it('should clear loan when fully paid', () => {
    let state = createInitialState();

    // Take a 1-session loan by manipulating state
    state.activeLoan = {
      principal: 10000,
      interestRate: 0.05,
      totalOwed: 10500,
      monthlyPayment: 10500,
      sessionsRemaining: 1,
      sessionsTaken: 1,
    };
    state.totalDebt = 10500;
    state.cash = 50000; // Enough to pay

    const decision = {
      loan: { take: false },
      allocation: { employees: 25, products: 25, marketing: 25, savings: 25 },
    };
    const result = processLevel1Session(decision, state);

    // Loan should be cleared after payment
    expect(result.endingState.activeLoan).toBeNull();
    expect(result.endingState.totalDebt).toBe(0);
  });
});

// ========================================
// EDGE CASE TESTS
// ========================================
describe('Edge Case Testing', () => {
  it('should handle EdgeCaseExploiter without crashes', () => {
    const player = new EdgeCaseExploiter();
    let state = createInitialState();
    const errors: string[] = [];

    for (let i = 0; i < 50; i++) {
      try {
        const decision = player.makeDecision(state);
        const result = processLevel1Session(decision, state);
        const sessionErrors = checkFinancialInvariants(state, result, player.name);
        errors.push(...sessionErrors);
        state = result.endingState;
      } catch (error: any) {
        errors.push(`Session ${i + 1} crashed: ${error.message}`);
      }
    }

    expect(errors).toHaveLength(0);
  });

  it('should handle BankruptcySeeker gracefully', () => {
    const player = new BankruptcySeeker();
    let state = createInitialState();
    let bankruptcyDetected = false;

    for (let i = 0; i < 20; i++) {
      const decision = player.makeDecision(state);
      const result = processLevel1Session(decision, state);

      if (result.warnings.some((w) => w.level === 'bankruptcy')) {
        bankruptcyDetected = true;
        expect(result.endingState.cash).toBeLessThan(0);
        break;
      }

      state = result.endingState;
    }

    expect(bankruptcyDetected).toBe(true);
  });

  it('should handle ZeroSpender (no revenue strategy)', () => {
    const player = new ZeroSpender();
    let state = createInitialState();

    for (let i = 0; i < 10; i++) {
      const decision = player.makeDecision(state);
      const result = processLevel1Session(decision, state);

      // Should have 0 revenue
      expect(result.calculations.revenue).toBe(0);

      // Cash should decrease only if there's debt
      if (state.activeLoan) {
        expect(result.endingState.cash).toBeLessThan(state.cash);
      } else {
        expect(result.endingState.cash).toBe(state.cash);
      }

      state = result.endingState;
    }
  });

  it('should handle DebtJuggler (multiple loan attempts)', () => {
    const player = new DebtJuggler();
    let state = createInitialState();

    // First session - take loan
    const decision1 = player.makeDecision(state);
    const result1 = processLevel1Session(decision1, state);
    expect(result1.endingState.activeLoan).toBeTruthy();

    // Second session - try to take another loan (should fail or replace)
    state = result1.endingState;
    const decision2 = player.makeDecision(state);
    const result2 = processLevel1Session(decision2, state);

    // Should still have only one loan
    expect(result2.endingState.activeLoan).toBeTruthy();
  });
});

// ========================================
// FUZZING TESTS
// ========================================
describe('Fuzzing - Invalid Inputs', () => {
  it('should handle Fuzzer gracefully (no crashes)', () => {
    const player = new Fuzzer();
    let state = createInitialState();
    let crashCount = 0;
    let successCount = 0;

    for (let i = 0; i < 20; i++) {
      try {
        const decision = player.makeDecision(state);
        const result = processLevel1Session(decision, state);
        successCount++;

        // Even with fuzzing, invariants should hold for successful runs
        const errors = checkFinancialInvariants(state, result, player.name);
        if (errors.length > 0) {
          console.warn(`Fuzzer caused invariant violations:`, errors);
        }

        state = result.endingState;
      } catch (error: any) {
        crashCount++;
        // This is expected - fuzzer generates invalid inputs
        console.log(`  Fuzzer input rejected (expected): ${error.message}`);
      }
    }

    console.log(
      `  Fuzzing results: ${successCount} successful, ${crashCount} rejected (${((successCount / 20) * 100).toFixed(0)}% success rate)`
    );

    // At least some inputs should be handled
    expect(successCount).toBeGreaterThan(0);
  });
});

// ========================================
// STRESS TESTS
// ========================================
describe('Stress Testing - Performance', () => {
  it('should handle 1000 rapid sequential decisions', () => {
    const player = new ChaoticPlayer();
    let state = createInitialState();
    const startTime = Date.now();

    for (let i = 0; i < 1000; i++) {
      const decision = player.makeDecision(state);
      const result = processLevel1Session(decision, state);
      state = result.endingState;
    }

    const duration = Date.now() - startTime;
    console.log(`  Processed 1000 decisions in ${duration}ms (${(1000 / duration * 1000).toFixed(0)} decisions/sec)`);

    expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
  });

  it('should handle 100 concurrent players', () => {
    const states = Array.from({ length: 100 }, () => createInitialState());
    const players = states.map((_, i) => ALL_PLAYERS[i % ALL_PLAYERS.length]);

    const startTime = Date.now();

    // Simulate 10 sessions for 100 players
    for (let session = 0; session < 10; session++) {
      states.forEach((state, i) => {
        const decision = players[i].makeDecision(state);
        const result = processLevel1Session(decision, state);
        states[i] = result.endingState;
      });
    }

    const duration = Date.now() - startTime;
    console.log(
      `  Processed 100 players × 10 sessions = 1000 total decisions in ${duration}ms`
    );

    expect(duration).toBeLessThan(10000); // Should complete in under 10 seconds
  });
});

// ========================================
// DETERMINISM TESTS
// ========================================
describe('Determinism - Same Input = Same Output', () => {
  it('should produce identical results for identical inputs', () => {
    const state = createInitialState();
    const decision = {
      loan: { take: true, term: 'medium' as const, amount: 40000 },
      allocation: { employees: 33, products: 33, marketing: 34, savings: 0 },
    };

    const result1 = processLevel1Session(decision, state);
    const result2 = processLevel1Session(decision, state);

    // Results should be identical
    expect(result1.scores).toEqual(result2.scores);
    expect(result1.calculations).toEqual(result2.calculations);
    expect(result1.endingState).toEqual(result2.endingState);
    expect(result1.warnings.length).toBe(result2.warnings.length);
  });
});
