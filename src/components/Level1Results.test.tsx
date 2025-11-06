// UI Tests for Level1Results Component
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Level1Results from './Level1Results';
import { processLevel1Session, createInitialState } from '../services/scoring/level1-engine';
import type { Level1SessionResult } from '../services/scoring/level1-types';

describe('Level1Results Component', () => {
  // Helper to create a sample result
  function createSampleResult(overrides?: Partial<Level1SessionResult>): Level1SessionResult {
    const decision = {
      loan: { take: true, term: 'medium' as const, amount: 40000 },
      allocation: { employees: 33, products: 33, marketing: 34, savings: 0 },
    };
    const state = createInitialState();
    return { ...processLevel1Session(decision, state), ...overrides };
  }

  // ========================================
  // RENDERING TESTS
  // ========================================
  describe('Rendering', () => {
    it('should render overall score header', () => {
      const result = createSampleResult();
      render(<Level1Results result={result} />);

      expect(screen.getByText('Overall Score')).toBeInTheDocument();
      expect(screen.getByText('/ 100')).toBeInTheDocument();
    });

    it('should render feedback summary', () => {
      const result = createSampleResult();
      render(<Level1Results result={result} />);

      expect(screen.getByText(result.feedback.summary)).toBeInTheDocument();
    });

    it('should render performance breakdown', () => {
      const result = createSampleResult();
      render(<Level1Results result={result} />);

      expect(screen.getByText('Performance Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Cash & Profit')).toBeInTheDocument();
      expect(screen.getByText('Debt Health')).toBeInTheDocument();
      expect(screen.getByText('Employee Happiness')).toBeInTheDocument();
      expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
    });

    it('should render financial summary', () => {
      const result = createSampleResult();
      render(<Level1Results result={result} />);

      expect(screen.getByText('Financial Summary')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Gross Profit')).toBeInTheDocument();
      expect(screen.getByText('Net Profit')).toBeInTheDocument();
      expect(screen.getByText('Ending Cash')).toBeInTheDocument();
    });

    it('should render next session starting position', () => {
      const result = createSampleResult();
      render(<Level1Results result={result} />);

      expect(screen.getByText('Next Session Starting Position')).toBeInTheDocument();
    });
  });

  // ========================================
  // SCORE DISPLAY TESTS
  // ========================================
  describe('Score Display', () => {
    it('should show green header for excellent score (>=80)', () => {
      const result = createSampleResult({
        scores: {
          overall: 85,
          cashAndProfit: 90,
          debtHealth: 80,
          employeeHappiness: 85,
          customerSatisfaction: 85,
        },
      } as any);

      render(<Level1Results result={result} />);

      const header = screen.getByText('Overall Score').closest('div');
      expect(header).toHaveClass('bg-gradient-to-r', 'from-green-500', 'to-green-600');
    });

    it('should show blue header for good score (60-79)', () => {
      const result = createSampleResult({
        scores: {
          overall: 65,
          cashAndProfit: 70,
          debtHealth: 60,
          employeeHappiness: 65,
          customerSatisfaction: 65,
        },
      } as any);

      render(<Level1Results result={result} />);

      const header = screen.getByText('Overall Score').closest('div');
      expect(header).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-blue-600');
    });

    it('should show yellow header for mediocre score (40-59)', () => {
      const result = createSampleResult({
        scores: {
          overall: 50,
          cashAndProfit: 45,
          debtHealth: 50,
          employeeHappiness: 55,
          customerSatisfaction: 50,
        },
      } as any);

      render(<Level1Results result={result} />);

      const header = screen.getByText('Overall Score').closest('div');
      expect(header).toHaveClass('bg-gradient-to-r', 'from-yellow-500', 'to-yellow-600');
    });

    it('should show red header for poor score (<40)', () => {
      const result = createSampleResult({
        scores: {
          overall: 30,
          cashAndProfit: 25,
          debtHealth: 30,
          employeeHappiness: 35,
          customerSatisfaction: 30,
        },
      } as any);

      render(<Level1Results result={result} />);

      const header = screen.getByText('Overall Score').closest('div');
      expect(header).toHaveClass('bg-gradient-to-r', 'from-red-500', 'to-red-600');
    });

    it('should display score values correctly', () => {
      const result = createSampleResult({
        scores: {
          overall: 92.5,
          cashAndProfit: 95.3,
          debtHealth: 88.7,
          employeeHappiness: 90.1,
          customerSatisfaction: 93.9,
        },
      } as any);

      render(<Level1Results result={result} />);

      // Overall score should be rounded
      expect(screen.getByText('93')).toBeInTheDocument(); // Rounded overall
    });
  });

  // ========================================
  // WARNING DISPLAY TESTS
  // ========================================
  describe('Warning Display', () => {
    it('should render bankruptcy warning correctly', () => {
      const result = createSampleResult();
      result.warnings = [
        {
          level: 'bankruptcy',
          title: 'BANKRUPTCY',
          message: 'You ran out of cash!',
        },
      ];

      render(<Level1Results result={result} />);

      expect(screen.getByText('BANKRUPTCY')).toBeInTheDocument();
      expect(screen.getByText('You ran out of cash!')).toBeInTheDocument();
    });

    it('should render critical warning with red styling', () => {
      const result = createSampleResult();
      result.warnings = [
        {
          level: 'critical',
          title: 'Critical Issue',
          message: 'This is critical',
        },
      ];

      render(<Level1Results result={result} />);

      const warningDiv = screen.getByText('Critical Issue').closest('div');
      expect(warningDiv).toHaveClass('bg-red-50', 'border-red-500');
    });

    it('should render warning with yellow styling', () => {
      const result = createSampleResult();
      result.warnings = [
        {
          level: 'warning',
          title: 'Warning',
          message: 'This is a warning',
        },
      ];

      render(<Level1Results result={result} />);

      const warningDiv = screen.getByText('Warning').closest('div');
      expect(warningDiv).toHaveClass('bg-yellow-50', 'border-yellow-500');
    });

    it('should render info with blue styling', () => {
      const result = createSampleResult();
      result.warnings = [
        {
          level: 'info',
          title: 'Information',
          message: 'This is info',
        },
      ];

      render(<Level1Results result={result} />);

      const warningDiv = screen.getByText('Information').closest('div');
      expect(warningDiv).toHaveClass('bg-blue-50', 'border-blue-500');
    });

    it('should render multiple warnings', () => {
      const result = createSampleResult();
      result.warnings = [
        { level: 'warning', title: 'Warning 1', message: 'First warning' },
        { level: 'critical', title: 'Warning 2', message: 'Second warning' },
      ];

      render(<Level1Results result={result} />);

      expect(screen.getByText('Warning 1')).toBeInTheDocument();
      expect(screen.getByText('Warning 2')).toBeInTheDocument();
    });

    it('should not render warnings section if no warnings', () => {
      const result = createSampleResult();
      result.warnings = [];

      render(<Level1Results result={result} />);

      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });
  });

  // ========================================
  // FEEDBACK TESTS
  // ========================================
  describe('Feedback Display', () => {
    it('should render strengths section', () => {
      const result = createSampleResult();
      result.feedback.strengths = ['Good cash management', 'Strong revenue'];

      render(<Level1Results result={result} />);

      expect(screen.getByText('Strengths')).toBeInTheDocument();
      expect(screen.getByText('Good cash management')).toBeInTheDocument();
      expect(screen.getByText('Strong revenue')).toBeInTheDocument();
    });

    it('should render concerns section', () => {
      const result = createSampleResult();
      result.feedback.concerns = ['High debt levels', 'Low cash runway'];

      render(<Level1Results result={result} />);

      expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
      expect(screen.getByText('High debt levels')).toBeInTheDocument();
      expect(screen.getByText('Low cash runway')).toBeInTheDocument();
    });

    it('should render learning tips', () => {
      const result = createSampleResult();
      result.feedback.learningTips = [
        {
          concept: 'Interest',
          explanation: 'Interest is the cost of borrowing',
          example: 'Your 8% loan costs $3200',
        },
      ];

      render(<Level1Results result={result} />);

      expect(screen.getByText('Learning Tips')).toBeInTheDocument();
      expect(screen.getByText('Interest')).toBeInTheDocument();
      expect(screen.getByText('Interest is the cost of borrowing')).toBeInTheDocument();
      expect(screen.getByText(/Your 8% loan costs \$3200/)).toBeInTheDocument();
    });

    it('should not render feedback sections if empty', () => {
      const result = createSampleResult();
      result.feedback.strengths = [];
      result.feedback.concerns = [];

      render(<Level1Results result={result} />);

      expect(screen.queryByText('Strengths')).not.toBeInTheDocument();
      expect(screen.queryByText('Areas for Improvement')).not.toBeInTheDocument();
    });
  });

  // ========================================
  // FINANCIAL METRICS TESTS
  // ========================================
  describe('Financial Metrics Display', () => {
    it('should display positive profit in green', () => {
      const result = createSampleResult();
      // Net profit is positive
      result.calculations.netProfit = 5000;

      render(<Level1Results result={result} />);

      const netProfitValue = screen.getByText(/\$5,000/).closest('p');
      expect(netProfitValue).toHaveClass('text-green-600');
    });

    it('should display negative profit in red', () => {
      const result = createSampleResult();
      result.calculations.netProfit = -5000;

      render(<Level1Results result={result} />);

      const netProfitValue = screen.getByText(/\$-5,000/).closest('p');
      expect(netProfitValue).toHaveClass('text-red-600');
    });

    it('should display all key metrics', () => {
      const result = createSampleResult();

      render(<Level1Results result={result} />);

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Gross Profit')).toBeInTheDocument();
      expect(screen.getByText('Debt Payment')).toBeInTheDocument();
      expect(screen.getByText('Net Profit')).toBeInTheDocument();
      expect(screen.getByText('Ending Cash')).toBeInTheDocument();
      expect(screen.getByText('Total Debt')).toBeInTheDocument();
      expect(screen.getByText('Debt Ratio')).toBeInTheDocument();
      expect(screen.getByText('Cash Flow')).toBeInTheDocument();
    });

    it('should format currency correctly', () => {
      const result = createSampleResult();
      result.calculations.revenue = 123456.78;

      render(<Level1Results result={result} />);

      expect(screen.getByText(/\$123,456/)).toBeInTheDocument();
    });

    it('should format percentages correctly', () => {
      const result = createSampleResult();
      result.calculations.debtRatio = 59.3456;

      render(<Level1Results result={result} />);

      expect(screen.getByText(/59\.3%/)).toBeInTheDocument();
    });
  });

  // ========================================
  // LOAN STATE DISPLAY TESTS
  // ========================================
  describe('Loan State Display', () => {
    it('should display loan details when loan exists', () => {
      const result = createSampleResult();
      // Result should have active loan from the sample decision

      render(<Level1Results result={result} />);

      expect(screen.getByText('Monthly Payment')).toBeInTheDocument();
      expect(screen.getByText('Payments Remaining')).toBeInTheDocument();
    });

    it('should not display loan details when no loan', () => {
      const decision = {
        loan: { take: false },
        allocation: { employees: 33, products: 33, marketing: 34, savings: 0 },
      };
      const state = createInitialState();
      const result = processLevel1Session(decision, state);

      render(<Level1Results result={result} />);

      // Should only show Cash and Total Debt in next session section
      const nextSessionSection = screen.getByText('Next Session Starting Position').closest('div');
      expect(nextSessionSection).not.toHaveTextContent('Monthly Payment');
    });
  });

  // ========================================
  // ACCESSIBILITY TESTS
  // ========================================
  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const result = createSampleResult();
      render(<Level1Results result={result} />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have semantic color-coded feedback', () => {
      const result = createSampleResult();
      result.feedback.strengths = ['Good work'];
      result.feedback.concerns = ['Needs improvement'];

      render(<Level1Results result={result} />);

      const strengthsSection = screen.getByText('Strengths').closest('div');
      expect(strengthsSection).toHaveClass('bg-green-50');

      const concernsSection = screen.getByText('Areas for Improvement').closest('div');
      expect(concernsSection).toHaveClass('bg-red-50');
    });

    it('should use icons for visual feedback', () => {
      const result = createSampleResult();
      result.feedback.strengths = ['Good'];
      result.warnings = [{ level: 'warning', title: 'Warn', message: 'Warning' }];

      render(<Level1Results result={result} />);

      // Icons should be rendered via lucide-react
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // EDGE CASE TESTS
  // ========================================
  describe('Edge Cases', () => {
    it('should handle scores over 100', () => {
      const result = createSampleResult({
        scores: {
          overall: 105,
          cashAndProfit: 120,
          debtHealth: 100,
          employeeHappiness: 95,
          customerSatisfaction: 110,
        },
      } as any);

      render(<Level1Results result={result} />);

      // Should still render without errors
      expect(screen.getByText('105')).toBeInTheDocument();
    });

    it('should handle negative scores', () => {
      const result = createSampleResult({
        scores: {
          overall: -5,
          cashAndProfit: -10,
          debtHealth: 0,
          employeeHappiness: 20,
          customerSatisfaction: 15,
        },
      } as any);

      render(<Level1Results result={result} />);

      // Should still render without errors
      expect(screen.getByText(/-5/)).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const result = createSampleResult();
      result.calculations.endingCash = 9999999.99;

      render(<Level1Results result={result} />);

      expect(screen.getByText(/\$9,999,999/)).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      const result = createSampleResult();
      result.calculations.revenue = 0;
      result.calculations.debtPayment = 0;
      result.endingState.totalDebt = 0;

      render(<Level1Results result={result} />);

      const zeroValues = screen.getAllByText(/\$0/);
      expect(zeroValues.length).toBeGreaterThan(0);
    });
  });
});
