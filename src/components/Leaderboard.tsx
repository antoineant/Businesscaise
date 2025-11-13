import { useTranslation } from 'react-i18next';
import { Team } from '../types/game';
import { calculateTeamScore } from '../utils/gameEngine';

interface Props {
  teams: Team[];
  currentTeamId?: string;
}

export default function Leaderboard({ teams, currentTeamId }: Props) {
  const { t } = useTranslation(['game', 'common']);

  // Sort teams by overall score
  const sortedTeams = [...teams].sort((a, b) => {
    const scoreA = calculateTeamScore(a.metrics);
    const scoreB = calculateTeamScore(b.metrics);
    return scoreB - scoreA;
  });

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>🏆</span>
        {t('game:leaderboard.title')}
      </h2>

      <div className="space-y-3">
        {sortedTeams.map((team, index) => {
          const score = calculateTeamScore(team.metrics);
          const isCurrentTeam = team.id === currentTeamId;
          const rank = index + 1;

          return (
            <div
              key={team.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                isCurrentTeam
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:shadow'
              }`}
            >
              {/* Rank */}
              <div className="text-2xl font-bold w-12 text-center">
                {getRankEmoji(rank)}
              </div>

              {/* Team Color */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: team.color }}
              />

              {/* Team Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">
                  {team.name}
                  {isCurrentTeam && (
                    <span className="ml-2 text-sm font-normal text-primary-600">{t('common:common.you')}</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {team.members.length} {team.members.length !== 1 ? t('common:teamSetup.members_plural') : t('common:teamSetup.members')} • {team.submissions.length} {t('game:leaderboard.decisionsMode')}
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{score}</div>
                <div className="text-xs text-gray-500">{t('common:common.points')}</div>
              </div>
            </div>
          );
        })}

        {teams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">{t('game:leaderboard.noTeams')}</p>
            <p className="text-sm">{t('game:leaderboard.createTeam')}</p>
          </div>
        )}
      </div>

      {/* Scoring Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 {t('game:leaderboard.scoring.title')}</h4>
        <p className="text-sm text-blue-800 mb-2">
          {t('game:leaderboard.scoring.description')}
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• {t('game:leaderboard.scoring.marketing')}</li>
          <li>• {t('game:leaderboard.scoring.sales')}</li>
          <li>• {t('game:leaderboard.scoring.research')}</li>
          <li>• {t('game:leaderboard.scoring.finance')}</li>
          <li>• {t('game:leaderboard.scoring.hr')}</li>
        </ul>
      </div>
    </div>
  );
}
