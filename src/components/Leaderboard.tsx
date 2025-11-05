import { Team } from '../types/game';
import { calculateTeamScore } from '../utils/gameEngine';

interface Props {
  teams: Team[];
  currentTeamId?: string;
}

export default function Leaderboard({ teams, currentTeamId }: Props) {
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
        Leaderboard
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
                    <span className="ml-2 text-sm font-normal text-primary-600">(You)</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''} • {team.submissions.length} decisions made
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{score}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          );
        })}

        {teams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No teams yet!</p>
            <p className="text-sm">Create a team to get started.</p>
          </div>
        )}
      </div>

      {/* Scoring Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 How Scoring Works</h4>
        <p className="text-sm text-blue-800 mb-2">
          Your overall score is calculated based on performance across all five departments:
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Marketing (20%): Brand awareness, customer acquisition, market share</li>
          <li>• Sales (25%): Revenue, conversion rate, customer satisfaction</li>
          <li>• Research & Development (20%): Innovation, quality, efficiency</li>
          <li>• Finance (20%): Cash flow, profit margin, investor confidence</li>
          <li>• Human Resources (15%): Morale, productivity, retention</li>
        </ul>
      </div>
    </div>
  );
}
