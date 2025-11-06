import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Package, Megaphone, PiggyBank, AlertCircle } from 'lucide-react';
import type { Level1Decision, LoanTerm, Level1TeamState, LOAN_OPTIONS } from '../services/scoring/level1-types';
import { LOAN_OPTIONS as LOANS, LEVEL1_CONFIG } from '../services/scoring/level1-types';

interface Level1InputProps {
  teamState: Level1TeamState;
  onSubmit: (decision: Level1Decision) => void;
  isSubmitting?: boolean;
}

export default function Level1Input({ teamState, onSubmit, isSubmitting = false }: Level1InputProps) {
  // Loan decision state
  const [takeLoan, setTakeLoan] = useState(false);
  const [loanTerm, setLoanTerm] = useState<Exclude<LoanTerm, 'none'>>('medium');
  const [loanAmount, setLoanAmount] = useState(40000);

  // Allocation state (percentages)
  const [employees, setEmployees] = useState(33);
  const [products, setProducts] = useState(33);
  const [marketing, setMarketing] = useState(34);
  const [savings, setSavings] = useState(0);

  // Validation
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-balance allocations to 100%
  useEffect(() => {
    const total = employees + products + marketing + savings;
    if (total !== 100 && total > 0) {
      // Auto-adjust savings to balance
      const newSavings = Math.max(0, 100 - employees - products - marketing);
      setSavings(newSavings);
    }
  }, [employees, products, marketing]);

  // Get loan option details
  const selectedLoan = LOANS[loanTerm];
  const totalOwed = takeLoan ? loanAmount * (1 + selectedLoan.interestRate) : 0;
  const monthlyPayment = takeLoan ? totalOwed / selectedLoan.sessions : 0;

  // Calculate available funds
  const availableFunds = teamState.cash + (takeLoan ? loanAmount : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Validate allocations
    const total = employees + products + marketing + savings;
    if (total !== 100) {
      newErrors.push(`Allocation must total 100% (currently ${total}%)`);
    }

    // Validate loan amount
    if (takeLoan && (loanAmount < selectedLoan.minAmount || loanAmount > selectedLoan.maxAmount)) {
      newErrors.push(`Loan amount must be between $${selectedLoan.minAmount.toLocaleString()} and $${selectedLoan.maxAmount.toLocaleString()}`);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    const decision: Level1Decision = {
      loan: {
        take: takeLoan,
        term: takeLoan ? loanTerm : undefined,
        amount: takeLoan ? loanAmount : undefined,
      },
      allocation: {
        employees,
        products,
        marketing,
        savings,
      },
    };

    onSubmit(decision);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current State Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="current-financial-state">
        <h3 className="font-bold text-blue-900 mb-2">Current Financial State</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-600">Cash</p>
            <p className="font-bold text-blue-900" data-testid="starting-cash">${teamState.cash.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-600">Total Debt</p>
            <p className="font-bold text-blue-900" data-testid="total-debt">${teamState.totalDebt.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-600">Session</p>
            <p className="font-bold text-blue-900" data-testid="session-number">#{teamState.sessionNumber + 1}</p>
          </div>
          {teamState.activeLoan && (
            <div>
              <p className="text-blue-600">Monthly Payment</p>
              <p className="font-bold text-blue-900" data-testid="active-loan-payment">${teamState.activeLoan.monthlyPayment.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Banking Decision */}
      <div className="bg-white border border-gray-200 rounded-lg p-6" data-testid="banking-decision">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Banking Decision</h3>
        </div>

        {/* Take Loan Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={takeLoan}
              onChange={(e) => setTakeLoan(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              data-testid="loan-checkbox"
            />
            <span className="font-medium text-gray-900">Take a loan this session?</span>
          </label>
        </div>

        {takeLoan && (
          <div className="space-y-4 pl-8 border-l-2 border-blue-200">
            {/* Loan Term Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['short', 'medium', 'long'] as const).map((term) => {
                  const option = LOANS[term];
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLoanTerm(term)}
                      disabled={isSubmitting}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        loanTerm === term
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <p className="font-bold text-gray-900 capitalize">{term}-Term</p>
                      <p className="text-xs text-gray-600">{option.sessions} sessions</p>
                      <p className="text-xs text-gray-600">{option.interestRate * 100}% interest</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loan Amount Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount: ${loanAmount.toLocaleString()}
              </label>
              <input
                type="range"
                min={selectedLoan.minAmount}
                max={selectedLoan.maxAmount}
                step={5000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                disabled={isSubmitting}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>${selectedLoan.minAmount.toLocaleString()}</span>
                <span>${selectedLoan.maxAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Loan Summary */}
            <div className="bg-gray-50 rounded p-3 space-y-1 text-sm" data-testid="loan-summary">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal:</span>
                <span className="font-medium" data-testid="loan-principal">${loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest ({selectedLoan.interestRate * 100}%):</span>
                <span className="font-medium" data-testid="loan-interest">${(loanAmount * selectedLoan.interestRate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-1">
                <span className="text-gray-900 font-medium">Total Owed:</span>
                <span className="font-bold" data-testid="loan-total-owed">${totalOwed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="font-medium" data-testid="loan-monthly-payment">${monthlyPayment.toLocaleString()} × {selectedLoan.sessions}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Budget Allocation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6" data-testid="budget-allocation">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Budget Allocation</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Available funds: <span className="font-bold" data-testid="available-funds">${availableFunds.toLocaleString()}</span>
        </p>

        <div className="space-y-4">
          {/* Employees */}
          <AllocationSlider
            icon={<Users className="w-5 h-5" />}
            label="Employees"
            value={employees}
            onChange={setEmployees}
            amount={availableFunds * (employees / 100)}
            color="blue"
            disabled={isSubmitting}
          />

          {/* Products */}
          <AllocationSlider
            icon={<Package className="w-5 h-5" />}
            label="Products & Operations"
            value={products}
            onChange={setProducts}
            amount={availableFunds * (products / 100)}
            color="green"
            disabled={isSubmitting}
          />

          {/* Marketing */}
          <AllocationSlider
            icon={<Megaphone className="w-5 h-5" />}
            label="Marketing"
            value={marketing}
            onChange={setMarketing}
            amount={availableFunds * (marketing / 100)}
            color="orange"
            disabled={isSubmitting}
          />

          {/* Savings */}
          <AllocationSlider
            icon={<PiggyBank className="w-5 h-5" />}
            label="Savings"
            value={savings}
            onChange={setSavings}
            amount={availableFunds * (savings / 100)}
            color="purple"
            disabled={isSubmitting}
            readonly
          />

          {/* Total Indicator */}
          <div className={`p-3 rounded-lg ${
            employees + products + marketing + savings === 100
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`} data-testid="total-allocation">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Allocation:</span>
              <span className={`text-lg font-bold ${
                employees + products + marketing + savings === 100 ? 'text-green-600' : 'text-red-600'
              }`} data-testid="total-allocation-percentage">
                {employees + products + marketing + savings}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-1">Please fix the following errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || employees + products + marketing + savings !== 100}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="submit-decision-button"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Decision'}
      </button>
    </form>
  );
}

// Helper component for allocation sliders
function AllocationSlider({
  icon,
  label,
  value,
  onChange,
  amount,
  color,
  disabled,
  readonly = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  amount: number;
  color: string;
  disabled?: boolean;
  readonly?: boolean;
}) {
  const colorClasses = {
    blue: 'accent-blue-600 text-blue-600',
    green: 'accent-green-600 text-green-600',
    orange: 'accent-orange-600 text-orange-600',
    purple: 'accent-purple-600 text-purple-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={colorClasses[color as keyof typeof colorClasses]}>{icon}</div>
          <label className="text-sm font-medium text-gray-900">{label}</label>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">{value}%</div>
          <div className="text-xs text-gray-600">${amount.toLocaleString()}</div>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled || readonly}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${colorClasses[color as keyof typeof colorClasses]} ${readonly ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}
