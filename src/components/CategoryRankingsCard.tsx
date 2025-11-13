import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, DollarSign, Settings, Megaphone, Users as UsersIcon, Heart, Trophy, Loader2 } from 'lucide-react';
import { unifiedTeamAPI } from '../services/api.unified';

interface CategoryRankingsCardProps {
  teamId: string;
}

interface CategoryRanking {
  category: 'financial' | 'operations' | 'marketing' | 'hr' | 'customer_satisfaction' | 'overall';
  pod_rank: number | null;
  global_rank: number;
  score: number;
}

const CATEGORY_CONFIG = {
  financial: {
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  operations: {
    icon: Settings,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  marketing: {
    icon: Megaphone,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  hr: {
    icon: UsersIcon,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  customer_satisfaction: {
    icon: Heart,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
  },
  overall: {
    icon: Trophy,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
};

export const CategoryRankingsCard: React.FC<CategoryRankingsCardProps> = ({ teamId }) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [rankings, setRankings] = useState<CategoryRanking[]>([]);
  const [awards, setAwards] = useState<{ global_awards: string[]; pod_awards: string[] }>({
    global_awards: [],
    pod_awards: [],
  });
  const [inPod, setInPod] = useState(false);

  useEffect(() => {
    loadCategoryData();
  }, [teamId]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);

      // Load category rankings
      const data = await unifiedTeamAPI.getTeamCategories(teamId);

      if (data.enabled) {
        setEnabled(true);
        setRankings(data.rankings || []);
        setAwards(data.awards || { global_awards: [], pod_awards: [] });

        // Check if team has pod rankings
        setInPod(data.rankings.some((r: CategoryRanking) => r.pod_rank !== null));
      } else {
        setEnabled(false);
      }
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (!enabled) {
    return null; // Don't render if category awards are not enabled
  }

  const totalAwards = awards.global_awards.length + awards.pod_awards.length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-600" />
          {t('categoryRankings.title')}
        </h3>
        {totalAwards > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            {totalAwards} {totalAwards === 1 ? t('categoryRankings.award') : t('categoryRankings.awards')}
          </span>
        )}
      </div>

      {totalAwards > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Trophy className="w-4 h-4 mr-2 text-yellow-600" />
            {t('categoryRankings.yourAwards')}
          </h4>
          <div className="space-y-1 text-sm">
            {awards.global_awards.map((award, index) => (
              <div key={index} className="flex items-center text-gray-700">
                <span className="mr-2">🏆</span>
                <span className="font-medium">{award}</span>
                <span className="ml-2 text-xs text-gray-500">({t('categoryRankings.global')})</span>
              </div>
            ))}
            {awards.pod_awards.map((award, index) => (
              <div key={index} className="flex items-center text-gray-700">
                <span className="mr-2">🥇</span>
                <span className="font-medium">{award}</span>
                <span className="ml-2 text-xs text-gray-500">({t('categoryRankings.pod')})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rankings.map((ranking) => {
          const config = CATEGORY_CONFIG[ranking.category];
          const Icon = config.icon;

          return (
            <div
              key={ranking.category}
              className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <div>
                    <p className="font-semibold text-gray-900">{t(`categoryRankings.categories.${ranking.category}`)}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>
                        {t('categoryRankings.global')}: <span className="font-medium">#{ranking.global_rank}</span>
                      </span>
                      {inPod && ranking.pod_rank !== null && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>
                            {t('categoryRankings.pod')}: <span className="font-medium">#{ranking.pod_rank}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${config.color}`}>
                    {ranking.score.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          {t('categoryRankings.multiplePathsDescription')}
        </p>
      </div>
    </div>
  );
};
