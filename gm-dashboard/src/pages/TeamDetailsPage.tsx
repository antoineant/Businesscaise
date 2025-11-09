import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { ArrowLeft, Users, Calendar, Award } from 'lucide-react';
import type { Team } from '../types';

interface MetricsHistory {
  id: string;
  team_id: string;
  session_id: string;
  metrics: {
    financial: number;
    hr: number;
    market_communication: number;
    operations: number;
    customer_satisfaction: number;
  };
  total_score: number;
  created_at: string;
}

export const TeamDetailsPage: React.FC = () => {
  const { gameId, teamId } = useParams<{ gameId: string; teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [history, setHistory] = useState<MetricsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTeamData = async () => {
      if (!gameId || !teamId) return;

      try {
        setLoading(true);
        const [teamResponse, historyResponse] = await Promise.all([
          gameAPI.getTeamDetails(gameId, teamId),
          gameAPI.getTeamHistory(gameId, teamId),
        ]);

        setTeam(teamResponse.data.team);
        setHistory(historyResponse.data.history || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load team details');
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [gameId, teamId]);

  const getMetricColor = (value: number) => {
    if (value >= 70) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading team details...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Team not found'}</p>
        <button onClick={() => navigate(`/games/${gameId}`)} className="btn-secondary">
          Back to Game
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/games/${gameId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-primary-600" />
            {team.name}
          </h1>
          <p className="text-gray-600 mt-1">{team.members.length} members</p>
        </div>
      </div>

      {/* Team Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card" data-testid="team-score-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Score</p>
              <p className="text-4xl font-bold text-primary-600">
                {(team.total_score ?? 0).toFixed(1)}
              </p>
            </div>
            <Award className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card" data-testid="team-members-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-4xl font-bold text-gray-900">{team.members.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Current Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center" data-testid="metric-financial">
            <p className="text-sm text-gray-600 mb-2">Financial</p>
            <p className={`text-3xl font-bold ${getMetricColor(team.current_metrics.financial)}`}>
              {team.current_metrics.financial.toFixed(0)}
            </p>
          </div>
          <div className="text-center" data-testid="metric-hr">
            <p className="text-sm text-gray-600 mb-2">HR</p>
            <p className={`text-3xl font-bold ${getMetricColor(team.current_metrics.hr)}`}>
              {team.current_metrics.hr.toFixed(0)}
            </p>
          </div>
          <div className="text-center" data-testid="metric-market">
            <p className="text-sm text-gray-600 mb-2">Market</p>
            <p className={`text-3xl font-bold ${getMetricColor(team.current_metrics.market_communication)}`}>
              {team.current_metrics.market_communication.toFixed(0)}
            </p>
          </div>
          <div className="text-center" data-testid="metric-operations">
            <p className="text-sm text-gray-600 mb-2">Operations</p>
            <p className={`text-3xl font-bold ${getMetricColor(team.current_metrics.operations)}`}>
              {team.current_metrics.operations.toFixed(0)}
            </p>
          </div>
          <div className="text-center" data-testid="metric-customer">
            <p className="text-sm text-gray-600 mb-2">Customer</p>
            <p className={`text-3xl font-bold ${getMetricColor(team.current_metrics.customer_satisfaction)}`}>
              {team.current_metrics.customer_satisfaction.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Members</h2>
        <div className="space-y-2">
          {team.members.map((member, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              data-testid={`member-${index}`}
            >
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {member.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-900 font-medium">{member}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics History */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          Metrics History
        </h2>

        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No history available yet</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="p-4 bg-gray-50 rounded-lg"
                data-testid={`history-entry-${index}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    {new Date(entry.created_at).toLocaleDateString()} at{' '}
                    {new Date(entry.created_at).toLocaleTimeString()}
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {entry.total_score?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div>
                    <p className="text-gray-600">Financial</p>
                    <p className={`font-semibold ${getMetricColor(entry.metrics.financial)}`}>
                      {entry.metrics.financial.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">HR</p>
                    <p className={`font-semibold ${getMetricColor(entry.metrics.hr)}`}>
                      {entry.metrics.hr.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Market</p>
                    <p className={`font-semibold ${getMetricColor(entry.metrics.market_communication)}`}>
                      {entry.metrics.market_communication.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Operations</p>
                    <p className={`font-semibold ${getMetricColor(entry.metrics.operations)}`}>
                      {entry.metrics.operations.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className={`font-semibold ${getMetricColor(entry.metrics.customer_satisfaction)}`}>
                      {entry.metrics.customer_satisfaction.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
