// AI Decision Players for Testing Level 1 Scoring Engine
// Different player archetypes that try to break the system

import type { Level1Decision, LoanTerm, Level1TeamState } from './level1-types';
import { LOAN_OPTIONS, LEVEL1_CONFIG } from './level1-types';

// Base AI Player interface
export interface AIPlayer {
  name: string;
  description: string;
  makeDecision(state: Level1TeamState): Level1Decision;
}

// ========================================
// CONSERVATIVE PLAYER
// Never takes loans, balanced safe allocations
// ========================================
export class ConservativePlayer implements AIPlayer {
  name = 'Conservative';
  description = 'Never takes loans, plays it safe with balanced allocations';

  makeDecision(state: Level1TeamState): Level1Decision {
    return {
      loan: { take: false },
      allocation: {
        employees: 33,
        products: 33,
        marketing: 34,
        savings: 0,
      },
    };
  }
}

// ========================================
// AGGRESSIVE BORROWER
// Always maxes out loans, high spending
// ========================================
export class AggressiveBorrower implements AIPlayer {
  name = 'Aggressive Borrower';
  description = 'Always takes maximum loans, spends aggressively';

  makeDecision(state: Level1TeamState): Level1Decision {
    // Only take new loan if no active loan
    const takeLoan = !state.activeLoan;

    return {
      loan: takeLoan
        ? {
            take: true,
            term: 'long', // Longest term for max borrowing
            amount: LOAN_OPTIONS.long.maxAmount,
          }
        : { take: false },
      allocation: {
        employees: 30,
        products: 30,
        marketing: 40, // Heavy marketing
        savings: 0,
      },
    };
  }
}

// ========================================
// CHAOTIC PLAYER
// Completely random decisions
// ========================================
export class ChaoticPlayer implements AIPlayer {
  name = 'Chaotic';
  description = 'Makes completely random decisions each session';

  makeDecision(state: Level1TeamState): Level1Decision {
    const takeLoan = Math.random() > 0.5 && !state.activeLoan;

    let loanDecision: Level1Decision['loan'];
    if (takeLoan) {
      const terms: Exclude<LoanTerm, 'none'>[] = ['short', 'medium', 'long'];
      const term = terms[Math.floor(Math.random() * terms.length)];
      const option = LOAN_OPTIONS[term];
      const amount = Math.floor(
        option.minAmount + Math.random() * (option.maxAmount - option.minAmount)
      );

      loanDecision = { take: true, term, amount };
    } else {
      loanDecision = { take: false };
    }

    // Random allocation that sums to 100
    const employees = Math.floor(Math.random() * 100);
    const products = Math.floor(Math.random() * (100 - employees));
    const marketing = Math.floor(Math.random() * (100 - employees - products));
    const savings = 100 - employees - products - marketing;

    return {
      loan: loanDecision,
      allocation: { employees, products, marketing, savings },
    };
  }
}

// ========================================
// EDGE CASE EXPLOITER
// Tries boundary values, extremes
// ========================================
export class EdgeCaseExploiter implements AIPlayer {
  name = 'Edge Case Exploiter';
  description = 'Tests boundary conditions and extreme values';
  private sessionCount = 0;

  makeDecision(state: Level1TeamState): Level1Decision {
    this.sessionCount++;
    const scenario = this.sessionCount % 10;

    switch (scenario) {
      case 0:
        // All in employees, 0 everything else
        return {
          loan: { take: false },
          allocation: { employees: 100, products: 0, marketing: 0, savings: 0 },
        };

      case 1:
        // All in marketing
        return {
          loan: { take: false },
          allocation: { employees: 0, products: 0, marketing: 100, savings: 0 },
        };

      case 2:
        // All in savings
        return {
          loan: { take: false },
          allocation: { employees: 0, products: 0, marketing: 0, savings: 100 },
        };

      case 3:
        // Minimum loan amount
        return {
          loan: !state.activeLoan
            ? { take: true, term: 'short', amount: LOAN_OPTIONS.short.minAmount }
            : { take: false },
          allocation: { employees: 25, products: 25, marketing: 25, savings: 25 },
        };

      case 4:
        // Maximum loan amount
        return {
          loan: !state.activeLoan
            ? { take: true, term: 'long', amount: LOAN_OPTIONS.long.maxAmount }
            : { take: false },
          allocation: { employees: 25, products: 25, marketing: 25, savings: 25 },
        };

      case 5:
        // Exactly 1% each category
        return {
          loan: { take: false },
          allocation: { employees: 1, products: 1, marketing: 1, savings: 97 },
        };

      case 6:
        // Equal distribution
        return {
          loan: { take: false },
          allocation: { employees: 25, products: 25, marketing: 25, savings: 25 },
        };

      case 7:
        // Medium loan, mid-range amount
        return {
          loan: !state.activeLoan
            ? { take: true, term: 'medium', amount: 50000 }
            : { take: false },
          allocation: { employees: 33, products: 33, marketing: 34, savings: 0 },
        };

      case 8:
        // Short-term max loan
        return {
          loan: !state.activeLoan
            ? { take: true, term: 'short', amount: LOAN_OPTIONS.short.maxAmount }
            : { take: false },
          allocation: { employees: 50, products: 50, marketing: 0, savings: 0 },
        };

      default:
        // Asymmetric allocation
        return {
          loan: { take: false },
          allocation: { employees: 10, products: 20, marketing: 60, savings: 10 },
        };
    }
  }
}

// ========================================
// BANKRUPTCY SEEKER
// Intentionally tries to go bankrupt
// ========================================
export class BankruptcySeeker implements AIPlayer {
  name = 'Bankruptcy Seeker';
  description = 'Intentionally makes bad decisions to test bankruptcy handling';

  makeDecision(state: Level1TeamState): Level1Decision {
    // Take maximum short-term loan if possible (high monthly payments)
    const takeLoan = !state.activeLoan && state.cash > 10000;

    return {
      loan: takeLoan
        ? { take: true, term: 'short', amount: LOAN_OPTIONS.short.maxAmount }
        : { take: false },
      allocation: {
        employees: 50, // Waste money on employees
        products: 50, // Waste money on products
        marketing: 0, // NO REVENUE - this is key to bankruptcy
        savings: 0,
      },
    };
  }
}

// ========================================
// OPTIMIZER
// Tries to maximize score using heuristics
// ========================================
export class Optimizer implements AIPlayer {
  name = 'Optimizer';
  description = 'Tries to maximize score through strategic play';

  makeDecision(state: Level1TeamState): Level1Decision {
    // Smart loan strategy: only take if we have no debt and it's a good deal
    const shouldTakeLoan = !state.activeLoan && state.cash < 70000;

    // Calculate if we can afford loan payments
    const availableFunds = shouldTakeLoan
      ? state.cash + LOAN_OPTIONS.medium.maxAmount * 0.7 // Conservative borrowing
      : state.cash;

    // Deduct expected debt payment
    const monthlyPayment = state.activeLoan?.monthlyPayment || 0;
    const usableFunds = Math.max(0, availableFunds - monthlyPayment);

    // Optimize allocation: marketing drives revenue, but need balance
    const marketingPct = usableFunds > 50000 ? 40 : 35;
    const employeesPct = 30;
    const productsPct = 25;
    const savingsPct = 100 - marketingPct - employeesPct - productsPct;

    return {
      loan: shouldTakeLoan
        ? {
            take: true,
            term: 'medium',
            amount: Math.floor(LOAN_OPTIONS.medium.maxAmount * 0.7),
          }
        : { take: false },
      allocation: {
        employees: employeesPct,
        products: productsPct,
        marketing: marketingPct,
        savings: savingsPct,
      },
    };
  }
}

// ========================================
// FUZZER
// Invalid/malformed inputs to test error handling
// ========================================
export class Fuzzer implements AIPlayer {
  name = 'Fuzzer';
  description = 'Generates invalid inputs to test error handling';
  private attemptCount = 0;

  makeDecision(state: Level1TeamState): Level1Decision {
    this.attemptCount++;
    const scenario = this.attemptCount % 8;

    switch (scenario) {
      case 0:
        // Allocation doesn't sum to 100
        return {
          loan: { take: false },
          allocation: { employees: 30, products: 30, marketing: 30, savings: 30 }, // 120%!
        } as any;

      case 1:
        // Negative values
        return {
          loan: { take: false },
          allocation: { employees: -10, products: 50, marketing: 50, savings: 10 },
        } as any;

      case 2:
        // Loan amount over limit
        return {
          loan: { take: true, term: 'short', amount: 999999999 },
          allocation: { employees: 25, products: 25, marketing: 25, savings: 25 },
        };

      case 3:
        // Loan amount under minimum
        return {
          loan: { take: true, term: 'medium', amount: 100 },
          allocation: { employees: 25, products: 25, marketing: 25, savings: 25 },
        };

      case 4:
        // Negative loan amount
        return {
          loan: { take: true, term: 'long', amount: -50000 },
          allocation: { employees: 25, products: 25, marketing: 25, savings: 25 },
        } as any;

      case 5:
        // Over 100% allocation
        return {
          loan: { take: false },
          allocation: { employees: 60, products: 60, marketing: 60, savings: 60 },
        } as any;

      case 6:
        // Decimal percentages that don't sum to 100
        return {
          loan: { take: false },
          allocation: { employees: 33.33, products: 33.33, marketing: 33.33, savings: 0.01 },
        } as any;

      default:
        // Valid fallback
        return {
          loan: { take: false },
          allocation: { employees: 25, products: 25, marketing: 25, savings: 25 },
        };
    }
  }
}

// ========================================
// DEBT JUGGLER
// Takes multiple loans in succession (testing loan replacement logic)
// ========================================
export class DebtJuggler implements AIPlayer {
  name = 'Debt Juggler';
  description = 'Tests loan replacement and refinancing edge cases';

  makeDecision(state: Level1TeamState): Level1Decision {
    // Try to take a new loan even if one exists (should be rejected/replaced)
    const terms: Exclude<LoanTerm, 'none'>[] = ['short', 'medium', 'long'];
    const term = terms[state.sessionNumber % 3];

    return {
      loan: {
        take: true, // Always try to take a loan
        term,
        amount: LOAN_OPTIONS[term].maxAmount,
      },
      allocation: {
        employees: 25,
        products: 25,
        marketing: 25,
        savings: 25,
      },
    };
  }
}

// ========================================
// ZERO SPENDER
// Tries to spend nothing
// ========================================
export class ZeroSpender implements AIPlayer {
  name = 'Zero Spender';
  description = 'Saves everything, spends nothing';

  makeDecision(state: Level1TeamState): Level1Decision {
    return {
      loan: { take: false },
      allocation: {
        employees: 0,
        products: 0,
        marketing: 0,
        savings: 100,
      },
    };
  }
}

// ========================================
// EXPORT ALL PLAYERS
// ========================================
export const ALL_PLAYERS: AIPlayer[] = [
  new ConservativePlayer(),
  new AggressiveBorrower(),
  new ChaoticPlayer(),
  new EdgeCaseExploiter(),
  new BankruptcySeeker(),
  new Optimizer(),
  new Fuzzer(),
  new DebtJuggler(),
  new ZeroSpender(),
];

export function getPlayerByName(name: string): AIPlayer | undefined {
  return ALL_PLAYERS.find((p) => p.name === name);
}
