import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { ArrowLeft, BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import type { Game } from '../types';

interface Analytics {
  game?: Game;
  analytics: {
    total_teams: number;
    completed_sessions: number;
    active_sessions: number;
    average_metrics: {
      financial: number;
      hr: number;
      market_communication: number;
      operations: number;
      customer_satisfaction: number;
    };
  };
}

export const AnalyticsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!gameId) return;

      try {
        setLoading(true);
        const response = await gameAPI.getAnalytics(gameId);
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [gameId]);

  const getMetricColor = (value: number) => {
    if (value >= 70) return 'text-green-600 bg-green-50';
    if (value >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Analytics not found'}</p>
        <button onClick={() => navigate(`/games/${gameId}`)} className="btn-secondary">
          Back to Game
        </button>
      </div>
    );
  }

  const { analytics } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/games/${gameId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          data-testid="back-button"
          aria-label="Back to game details"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-primary-600" />
            Analytics
          </h1>
          <p className="text-gray-600 mt-1">Game performance and statistics</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card" data-testid="total-teams-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teams</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.total_teams}</p>
            </div>
            <Users className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        <div className="card" data-testid="completed-sessions-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.completed_sessions}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="card" data-testid="active-sessions-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.active_sessions}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Average Metrics */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Average Team Metrics</h2>

        {analytics.total_teams === 0 ? (
          <p className="text-center text-gray-500 py-8">No teams have joined yet</p>
        ) : (
          <div className="space-y-4">
            {/* Financial */}
            <div data-testid="metric-financial">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Financial</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${getMetricColor(analytics.average_metrics.financial)}`}>
                  {analytics.average_metrics.financial.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.average_metrics.financial, 100)}%` }}
                />
              </div>
            </div>

            {/* HR */}
            <div data-testid="metric-hr">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">HR</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${getMetricColor(analytics.average_metrics.hr)}`}>
                  {analytics.average_metrics.hr.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.average_metrics.hr, 100)}%` }}
                />
              </div>
            </div>

            {/* Market Communication */}
            <div data-testid="metric-market">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Market Communication</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${getMetricColor(analytics.average_metrics.market_communication)}`}>
                  {analytics.average_metrics.market_communication.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.average_metrics.market_communication, 100)}%` }}
                />
              </div>
            </div>

            {/* Operations */}
            <div data-testid="metric-operations">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Operations</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${getMetricColor(analytics.average_metrics.operations)}`}>
                  {analytics.average_metrics.operations.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.average_metrics.operations, 100)}%` }}
                />
              </div>
            </div>

            {/* Customer Satisfaction */}
            <div data-testid="metric-customer">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${getMetricColor(analytics.average_metrics.customer_satisfaction)}`}>
                  {analytics.average_metrics.customer_satisfaction.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.average_metrics.customer_satisfaction, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Insights</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <p className="text-gray-700">
              <span className="font-semibold">{analytics.total_teams}</span> teams are competing in this game
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <p className="text-gray-700">
              <span className="font-semibold">{analytics.active_sessions}</span> sessions are currently active
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <p className="text-gray-700">
              <span className="font-semibold">{analytics.completed_sessions}</span> sessions have been completed
            </p>
          </div>
          {analytics.total_teams > 0 && (
            <div className="flex items-start space-x-2">
              <span className="text-primary-600">•</span>
              <p className="text-gray-700">
                Average team performance:{' '}
                <span className="font-semibold">
                  {Object.values(analytics.average_metrics).reduce((a, b) => a + b, 0) / 5 || 0}
                </span>
                /100
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
