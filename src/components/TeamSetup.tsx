import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Team } from '../types/game';
import { initialMetrics } from '../data/gameData';
import { TEAM_COLORS } from '../utils/gameEngine';

interface Props {
  teams: Team[];
  onCreateTeam: (team: Team) => void;
  onSelectTeam: (teamId: string) => void;
  currentTeamId?: string;
}

export default function TeamSetup({ teams, onCreateTeam, onSelectTeam, currentTeamId }: Props) {
  const { t } = useTranslation('common');
  const [showForm, setShowForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) return;

    const memberList = members
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamName,
      members: memberList,
      color: TEAM_COLORS[teams.length % TEAM_COLORS.length],
      metrics: JSON.parse(JSON.stringify(initialMetrics)),
      submissions: [],
      overallScore: 0,
      createdAt: new Date().toISOString(),
    };

    onCreateTeam(newTeam);
    setTeamName('');
    setMembers('');
    setShowForm(false);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('teamSetup.title')}</h2>

      {/* Existing Teams */}
      {teams.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">{t('teamSetup.selectYour')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  currentTeamId === team.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <h4 className="font-bold text-gray-800">{team.name}</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {team.members.length} {team.members.length !== 1 ? t('teamSetup.members_plural') : t('teamSetup.members')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('teamSetup.score')}: {team.overallScore}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create New Team */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary w-full"
        >
          + {t('buttons.createTeam')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('teamSetup.teamName')} {t('teamSetup.required')}
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('teamSetup.teamNamePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('teamSetup.teamMembers')}
            </label>
            <textarea
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('teamSetup.teamMembersPlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              {t('buttons.create')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary flex-1"
            >
              {t('buttons.cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
