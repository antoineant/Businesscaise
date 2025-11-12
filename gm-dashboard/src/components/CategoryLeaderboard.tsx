import React, { useState, useEffect } from 'react';
import { podAPI } from '../services/api';
import { CategoryLeader } from '../types';
import { Trophy, DollarSign, Settings, Megaphone, Users as UsersIcon, Heart, Award, Loader2 } from 'lucide-react';

interface CategoryLeaderboardProps {
  gameId: string;
  sessionId?: string;
}

const CATEGORY_CONFIG = {
  financial: {
    name: 'Financial Excellence',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Highest financial performance'
  },
  operations: {
    name: 'Operations Leader',
    icon: Settings,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Best operational efficiency'
  },
  marketing: {
    name: 'Marketing Champion',
    icon: Megaphone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Top marketing performance'
  },
  hr: {
    name: 'Best Employer',
    icon: UsersIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Highest employee satisfaction'
  },
  customer_satisfaction: {
    name: 'Customer Favorite',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Best customer satisfaction'
  },
  overall: {
    name: 'Overall Champion',
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Highest overall score'
  }
};

export const CategoryLeaderboard: React.FC<CategoryLeaderboardProps> = ({ gameId, sessionId }) => {
  const [leaders, setLeaders] = useState<CategoryLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedScope, setSelectedScope] = useState<'global' | 'pod'>('global');

  useEffect(() => {
    loadLeaders();
  }, [gameId, sessionId]);

  const loadLeaders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await podAPI.getCategoryRankings(gameId, sessionId);
      setLeaders(response.data.global_awards || []);
    } catch (err: any) {
      setError('Failed to load category leaders');
      console.error('Error loading category leaders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No category leaders yet. Teams need to have scores to appear here.</p>
      </div>
    );
  }

  // Group leaders by category
  const leadersByCategory = leaders.reduce((acc, leader) => {
    if (!acc[leader.category]) {
      acc[leader.category] = [];
    }
    acc[leader.category].push(leader);
    return acc;
  }, {} as Record<string, CategoryLeader[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Category Awards</h3>
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => setSelectedScope('global')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedScope === 'global'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setSelectedScope('pod')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedScope === 'pod'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Pod
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(CATEGORY_CONFIG).map(([categoryKey, config]) => {
          const categoryLeaders = leadersByCategory[categoryKey] || [];
          const globalLeader = categoryLeaders.find(l => l.scope === 'global');
          const Icon = config.icon;

          if (!globalLeader) {
            return null;
          }

          return (
            <div
              key={categoryKey}
              className={`border-2 ${config.borderColor} ${config.bgColor} rounded-lg p-4`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{config.name}</h4>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                </div>
                <Trophy className={`w-6 h-6 ${config.color}`} />
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{globalLeader.team_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Score: <span className="font-medium">{globalLeader.score.toFixed(1)}</span>
                    </p>
                  </div>
                  <div className="ml-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🏆</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Award className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Multiple Paths to Success</h4>
            <p className="text-sm text-gray-700">
              Teams can excel in different areas and win category awards even if they're not the overall leader.
              This creates more engagement and recognition opportunities for all teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
