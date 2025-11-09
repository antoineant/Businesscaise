import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { ArrowLeft, Trophy, TrendingUp, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  team_id: string;
  team_name: string;
  overall_score: number | string; // API returns string, handle both
  metrics?: {
    financial: number;
    hr: number;
    market_communication: number;
    operations: number;
    customer_satisfaction: number;
  };
}

export const LeaderboardPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!gameId) return;

      try {
        setLoading(true);
        const response = await gameAPI.getLeaderboard(gameId);
        setLeaderboard(response.data.leaderboard || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [gameId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
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
            <Trophy className="w-8 h-8 mr-3 text-primary-600" />
            Leaderboard
          </h1>
          <p className="text-gray-600 mt-1">Team rankings and performance</p>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
          <p className="text-gray-600">Teams will appear here once they have scores</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="leaderboard-list">
          {leaderboard.map((entry) => (
            <div
              key={entry.team_id}
              className={`card hover:shadow-md transition-shadow cursor-pointer ${getRankColor(entry.rank)}`}
              onClick={() => navigate(`/games/${gameId}/teams/${entry.team_id}`)}
              data-testid={`leaderboard-rank-${entry.rank}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{entry.team_name}</h3>
                    <p className="text-sm text-gray-600">Rank #{entry.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600" data-testid={`score-${entry.team_id}`}>
                    {(parseFloat(String(entry.overall_score || 0))).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Overall Score</p>
                </div>
              </div>

              {/* Metrics breakdown */}
              {entry.metrics && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Financial</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.metrics.financial.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">HR</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.metrics.hr.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Market</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.metrics.market_communication.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Operations</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.metrics.operations.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Customer</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.metrics.customer_satisfaction.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
