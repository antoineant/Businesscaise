import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  askMarket,
  getMarketQueryHistory,
  type MarketQueryResult,
  type MarketQueryHistory,
  type Source,
} from '../services/narrative.api';

interface AskTheMarketProps {
  teamId: string;
  gameId: string;
}

const confidenceColors = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800',
};

export default function AskTheMarket({ teamId, gameId }: AskTheMarketProps) {
  const { t } = useTranslation('game');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<MarketQueryResult | null>(null);
  const [history, setHistory] = useState<MarketQueryHistory[]>([]);
  const [rateLimit, setRateLimit] = useState({ remaining: 5, total: 5, resetIn: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Get confidence label with translation
  const getConfidenceLabel = (confidence: 'high' | 'medium' | 'low') => {
    const labels = {
      high: t('narrative.askMarket.highConfidence'),
      medium: t('narrative.askMarket.mediumConfidence'),
      low: t('narrative.askMarket.lowConfidence'),
    };
    return labels[confidence];
  };

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [teamId]);

  const loadHistory = async () => {
    try {
      const data = await getMarketQueryHistory(teamId);
      setHistory(data.history);
      setRateLimit(data.rateLimit);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    if (rateLimit.remaining <= 0) {
      setError(t('narrative.askMarket.limitReached'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await askMarket(teamId, question);

      setResult(data);
      setRateLimit(data.rateLimit);

      // Reload history
      await loadHistory();

      // Clear question
      setQuestion('');
    } catch (err: any) {
      console.error('Failed to ask question:', err);
      setError(
        err.response?.data?.error || t('narrative.askMarket.failedToAnswer')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleSelectRelatedQuestion = (q: string) => {
    setQuestion(q);
    setResult(null);
  };

  const handleLoadHistoryItem = (item: MarketQueryHistory) => {
    setResult({
      question: item.query_text,
      answer: item.response_data.answer || 'No answer available',
      sources: item.sources || [],
      relatedQuestions: item.response_data.relatedQuestions || [],
      confidence: item.response_data.confidence || 'medium',
      rateLimit,
    });
    setShowHistory(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('narrative.askMarket.title')}</h2>
            <p className="text-purple-100">
              {t('narrative.askMarket.subtitle')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{rateLimit.remaining}</div>
            <div className="text-sm text-purple-200">{t('narrative.askMarket.queriesRemaining')}</div>
          </div>
        </div>
      </div>

      {/* Query Input */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">💬</span>
          <label className="text-sm font-medium text-gray-700">
            {t('narrative.askMarket.askQuestion')}
          </label>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {showHistory ? t('narrative.askMarket.hideHistory') : t('narrative.askMarket.showHistory')} {t('narrative.askMarket.history', { count: history.length })}
          </button>
        </div>

        <div className="flex space-x-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('narrative.askMarket.placeholder')}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={loading || rateLimit.remaining <= 0}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || loading || rateLimit.remaining <= 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              !question.trim() || loading || rateLimit.remaining <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{t('narrative.askMarket.asking')}</span>
              </div>
            ) : (
              t('narrative.askMarket.ask')
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {rateLimit.remaining === 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            {t('narrative.askMarket.limitWarning', { total: rateLimit.total })}
          </div>
        )}
      </div>

      {/* History Sidebar */}
      {showHistory && history.length > 0 && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">{t('narrative.askMarket.recentQuestions')}</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLoadHistoryItem(item)}
                className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-gray-200"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.query_text}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Answer */}
      {result && (
        <div className="p-6">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">❓</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{t('narrative.askMarket.yourQuestion')}</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{result.question}</p>
              </div>
            </div>
          </div>

          {/* Answer */}
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{t('narrative.askMarket.answer')}</h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      confidenceColors[result.confidence]
                    }`}
                  >
                    {getConfidenceLabel(result.confidence)}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {result.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sources */}
          {result.sources.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📚</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('narrative.askMarket.sources')}</h3>
                  <div className="space-y-2">
                    {result.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-600 font-medium">#{index + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              {source.title}
                            </p>
                            <p className="text-xs text-blue-700 truncate">{source.url}</p>
                            {source.snippet && (
                              <p className="text-xs text-gray-600 mt-1">{source.snippet}</p>
                            )}
                          </div>
                          <svg
                            className="w-4 h-4 text-blue-600 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Questions */}
          {result.relatedQuestions.length > 0 && (
            <div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔍</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('narrative.askMarket.relatedQuestions')}</h3>
                  <div className="space-y-2">
                    {result.relatedQuestions.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectRelatedQuestion(q)}
                        disabled={rateLimit.remaining <= 0}
                        className={`w-full text-left p-3 rounded-lg transition-colors border ${
                          rateLimit.remaining <= 0
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
                        }`}
                      >
                        <p className="text-sm">{q}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !showHistory && (
        <div className="p-12 text-center text-gray-400">
          <svg
            className="w-20 h-20 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-500 mb-2">{t('narrative.askMarket.emptyStateTitle')}</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto" dangerouslySetInnerHTML={{
            __html: t('narrative.askMarket.emptyStateDesc', { remaining: rateLimit.remaining })
          }} />
        </div>
      )}
    </div>
  );
}
