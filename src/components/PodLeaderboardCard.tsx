import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { unifiedTeamAPI } from '../services/api.unified';

interface PodLeaderboardCardProps {
  teamId: string;
}

interface PodLeaderboardEntry {
  rank: number;
  team_id: string;
  team_name: string;
  overall_score: number;
  is_current_team: boolean;
}

export const PodLeaderboardCard: React.FC<PodLeaderboardCardProps> = ({ teamId }) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [inPod, setInPod] = useState(false);
  const [podInfo, setPodInfo] = useState<{ pod_id: string | null; pod_name: string | null }>({ pod_id: null, pod_name: null });
  const [leaderboard, setLeaderboard] = useState<PodLeaderboardEntry[]>([]);

  useEffect(() => {
    loadPodData();
  }, [teamId]);

  const loadPodData = async () => {
    try {
      setLoading(true);

      // Check if team is in a pod
      const podData = await unifiedTeamAPI.getTeamPod(teamId);

      if (podData.in_pod && podData.pod_id) {
        setInPod(true);
        setPodInfo({ pod_id: podData.pod_id, pod_name: podData.pod_name });

        // Load pod leaderboard
        const leaderboardData = await unifiedTeamAPI.getPodLeaderboard(teamId);
        setLeaderboard(leaderboardData.leaderboard || []);
      } else {
        setInPod(false);
      }
    } catch (error) {
      console.error('Error loading pod data:', error);
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

  if (!inPod) {
    return null; // Don't render if team is not in a pod
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Layers className="w-5 h-5 mr-2 text-indigo-600" />
          {podInfo.pod_name || t('podLeaderboard.yourPod')}
        </h3>
        <span className="text-sm text-gray-600">
          {leaderboard.length} {leaderboard.length === 1 ? t('podLeaderboard.team') : t('podLeaderboard.teams')}
        </span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          {t('podLeaderboard.podDescription')}
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">{t('podLeaderboard.noScores')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.team_id}
              className={`p-3 rounded-lg border transition-colors ${
                entry.is_current_team
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-gray-400 w-6">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {entry.team_name}
                      {entry.is_current_team && (
                        <span className="ml-2 text-sm text-indigo-600">{t('common.you')}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-lg font-bold">
                      {typeof entry.overall_score === 'number'
                        ? entry.overall_score.toFixed(1)
                        : entry.overall_score || '0.0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
