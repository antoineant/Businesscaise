import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  Heart,
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import type { Level1SessionResult } from '../services/scoring/level1-types';

interface Level1ResultsProps {
  result: Level1SessionResult;
}

export default function Level1Results({ result }: Level1ResultsProps) {
  const { t } = useTranslation('game');
  const { calculations, scores, warnings, feedback, endingState } = result;

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <div className={`rounded-lg p-6 text-white ${
        scores.overall >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
        scores.overall >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
        scores.overall >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
        'bg-gradient-to-r from-red-500 to-red-600'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t('level1.overallScore')}</h2>
            <p className="text-white/90">{feedback.summary}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{Math.round(scores.overall)}</div>
            <div className="text-sm text-white/90">{t('level1.outOf100')}</div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          {warnings.map((warning, i) => (
            <div key={i} className={`rounded-lg p-4 border-l-4 ${
              warning.level === 'bankruptcy' ? 'bg-black/90 border-black text-white' :
              warning.level === 'critical' ? 'bg-red-50 border-red-500' :
              warning.level === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start gap-3">
                {warning.level === 'bankruptcy' && <XCircle className="w-6 h-6 text-white mt-0.5" />}
                {warning.level === 'critical' && <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />}
                {warning.level === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />}
                {warning.level === 'info' && <Lightbulb className="w-6 h-6 text-blue-600 mt-0.5" />}
                <div className="flex-1">
                  <h4 className={`font-bold mb-1 ${
                    warning.level === 'bankruptcy' ? 'text-white' :
                    warning.level === 'critical' ? 'text-red-900' :
                    warning.level === 'warning' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {warning.title}
                  </h4>
                  <p className={`text-sm ${
                    warning.level === 'bankruptcy' ? 'text-white/90' :
                    warning.level === 'critical' ? 'text-red-800' :
                    warning.level === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {warning.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Scores */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('level1.performanceBreakdown')}</h3>
        <div className="space-y-4">
          <ScoreBar
            icon={<DollarSign className="w-5 h-5" />}
            label={t('level1.cashAndProfit')}
            score={scores.cashAndProfit}
            color="green"
          />
          <ScoreBar
            icon={<CreditCard className="w-5 h-5" />}
            label={t('level1.debtHealth')}
            score={scores.debtHealth}
            color="blue"
          />
          <ScoreBar
            icon={<Users className="w-5 h-5" />}
            label={t('level1.employeeHappiness')}
            score={scores.employeeHappiness}
            color="purple"
          />
          <ScoreBar
            icon={<Heart className="w-5 h-5" />}
            label={t('level1.customerSatisfaction')}
            score={scores.customerSatisfaction}
            color="pink"
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('level1.financialSummary')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label={t('level1.revenue')} value={`$${calculations.revenue.toLocaleString()}`} />
          <Metric label={t('level1.grossProfit')} value={`$${calculations.grossProfit.toLocaleString()}`} />
          <Metric label={t('level1.debtPayment')} value={`$${calculations.debtPayment.toLocaleString()}`} />
          <Metric label={t('level1.netProfit')} value={`$${calculations.netProfit.toLocaleString()}`} isProfit />
          <Metric label={t('level1.endingCash')} value={`$${calculations.endingCash.toLocaleString()}`} />
          <Metric label={t('level1.totalDebt')} value={`$${endingState.totalDebt.toLocaleString()}`} />
          <Metric label={t('level1.debtRatio')} value={`${calculations.debtRatio.toFixed(1)}%`} />
          <Metric label={t('level1.cashFlow')} value={`$${calculations.cashFlow.toLocaleString()}`} isProfit />
        </div>
      </div>

      {/* Feedback Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {feedback.strengths.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-green-900">{t('level1.strengths')}</h3>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {feedback.concerns.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-900">{t('level1.areasForImprovement')}</h3>
            </div>
            <ul className="space-y-2">
              {feedback.concerns.map((concern, i) => (
                <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-red-600 mt-1">!</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Learning Tips */}
      {feedback.learningTips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">{t('level1.learningTips')}</h3>
          </div>
          <div className="space-y-4">
            {feedback.learningTips.map((tip, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-1">{tip.concept}</h4>
                <p className="text-sm text-blue-800 mb-2">{tip.explanation}</p>
                {tip.example && (
                  <p className="text-xs text-blue-600 italic">{t('level1.example')} {tip.example}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Updated State */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('level1.nextSessionStartingPosition')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t('level1.cash')}</p>
            <p className="text-xl font-bold text-gray-900">${endingState.cash.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('level1.totalDebt')}</p>
            <p className="text-xl font-bold text-gray-900">${endingState.totalDebt.toLocaleString()}</p>
          </div>
          {endingState.activeLoan && (
            <>
              <div>
                <p className="text-sm text-gray-600">{t('level1.monthlyPayment')}</p>
                <p className="text-xl font-bold text-gray-900">
                  ${endingState.activeLoan.monthlyPayment.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('level1.paymentsRemaining')}</p>
                <p className="text-xl font-bold text-gray-900">{endingState.activeLoan.sessionsRemaining}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
function ScoreBar({
  icon,
  label,
  score,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  color: string;
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };

  const bgColorClasses = {
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    pink: 'bg-pink-100',
  };

  const textColorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={textColorClasses[color as keyof typeof textColorClasses]}>{icon}</div>
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">{Math.round(score)}/100</span>
      </div>
      <div className={`h-3 rounded-full ${bgColorClasses[color as keyof typeof bgColorClasses]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  isProfit = false,
}: {
  label: string;
  value: string;
  isProfit?: boolean;
}) {
  const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
  const isNegative = isProfit && numValue < 0;
  const isPositive = isProfit && numValue > 0;

  return (
    <div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-lg font-bold ${
        isNegative ? 'text-red-600' :
        isPositive ? 'text-green-600' :
        'text-gray-900'
      }`}>
        {isNegative && <TrendingDown className="inline w-4 h-4 mr-1" />}
        {isPositive && <TrendingUp className="inline w-4 h-4 mr-1" />}
        {value}
      </p>
    </div>
  );
}
