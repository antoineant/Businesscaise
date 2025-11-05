import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { teamAPI, Team, Session } from '../services/api.client';
import websocketService from '../services/websocket.service';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users, TrendingUp, FileText, Trophy, AlertCircle } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import DepartmentDashboard from '../components/DepartmentDashboard';
import SubmissionForm from '../components/SubmissionForm';
import { DepartmentMetrics } from '../types/game';

// Helper function to convert backend metrics to frontend DepartmentMetrics format
function convertToDepartmentMetrics(backendMetrics: any): DepartmentMetrics {
  // Backend returns: financial, hr, market_communication, operations, customer_satisfaction
  // Frontend needs: marketing, sales, research, finance, hr with nested properties

  const financial = backendMetrics.financial || 50;
  const hr = backendMetrics.hr || 50;
  const marketComm = backendMetrics.market_communication || 50;
  const operations = backendMetrics.operations || 50;
  const customerSat = backendMetrics.customer_satisfaction || 50;

  return {
    marketing: {
      brandAwareness: marketComm,
      customerAcquisition: marketComm * 0.9,
      campaignEffectiveness: marketComm,
      marketShare: marketComm * 0.8,
    },
    sales: {
      revenue: financial * 10, // Scale to thousands
      conversionRate: customerSat * 0.5,
      customerSatisfaction: customerSat,
      salesGrowth: financial * 0.6,
    },
    research: {
      innovation: operations,
      productQuality: operations * 0.9,
      rdBudgetEfficiency: operations,
      patentsFiled: Math.floor(operations / 10),
    },
    finance: {
      cashFlow: financial * 8,
      profitMargin: financial * 0.5,
      debtRatio: Math.max(0, 100 - financial),
      investorConfidence: financial,
    },
    hr: {
      employeeMorale: hr,
      productivity: hr * 0.9,
      retentionRate: hr * 0.8,
      talentQuality: hr,
    },
  };
}

export default function PlayerGame() {
  const { t } = useTranslation(['common', 'game']);
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [teamId, setTeamId] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'game' | 'leaderboard'>('dashboard');

  useEffect(() => {
    if (gameId) {
      // Check if user has a team for this game in localStorage
      const storedTeamId = localStorage.getItem(`team_${gameId}`);
      if (storedTeamId) {
        setTeamId(storedTeamId);
        loadGameData(storedTeamId);
      } else {
        setShowJoinModal(true);
        setIsLoading(false);
      }
    }
  }, [gameId]);

  useEffect(() => {
    if (teamId && gameId) {
      // Connect to WebSocket rooms
      websocketService.joinGame(gameId);
      websocketService.joinTeam(teamId);

      // Listen for real-time events
      websocketService.on('session:unlocked', handleSessionUnlocked);
      websocketService.on('submission:scored', handleSubmissionScored);
      websocketService.on('metrics:updated', handleMetricsUpdated);
      websocketService.on('leaderboard:updated', handleLeaderboardUpdated);

      return () => {
        websocketService.off('session:unlocked', handleSessionUnlocked);
        websocketService.off('submission:scored', handleSubmissionScored);
        websocketService.off('metrics:updated', handleMetricsUpdated);
        websocketService.off('leaderboard:updated', handleLeaderboardUpdated);
        websocketService.leaveGame(gameId);
        websocketService.leaveTeam(teamId);
      };
    }
  }, [teamId, gameId]);

  const loadGameData = async (tId: string) => {
    try {
      setIsLoading(true);
      const [dashboard, currentTeam, lb] = await Promise.all([
        teamAPI.getDashboard(tId),
        teamAPI.getCurrentTeam(tId),
        teamAPI.getLeaderboard(tId),
      ]);

      setDashboardData(dashboard);
      setTeam(currentTeam);
      setLeaderboard(lb);
      setCurrentSession(dashboard.current_session);
    } catch (err: any) {
      console.error('Failed to load game data:', err);
      setError('Failed to load game data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async (teamName: string, color: string, members: string[]) => {
    if (!gameId) return;

    try {
      const newTeam = await teamAPI.joinGame({
        game_id: gameId,
        team_name: teamName,
        color,
        members,
      });

      localStorage.setItem(`team_${gameId}`, newTeam.id);
      setTeamId(newTeam.id);
      setShowJoinModal(false);
      await loadGameData(newTeam.id);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to join game');
    }
  };

  // WebSocket event handlers
  const handleSessionUnlocked = (data: any) => {
    console.log('Session unlocked:', data);
    setCurrentSession(data.session);
    // Show notification
  };

  const handleSubmissionScored = (data: any) => {
    console.log('Submission scored:', data);
    if (teamId) {
      loadGameData(teamId);
    }
  };

  const handleMetricsUpdated = (data: any) => {
    console.log('Metrics updated:', data);
    if (team) {
      setTeam({ ...team, metrics: data.metrics });
    }
  };

  const handleLeaderboardUpdated = (data: any) => {
    console.log('Leaderboard updated:', data);
    setLeaderboard(data.leaderboard);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (showJoinModal) {
    return <JoinTeamModal gameId={gameId!} onJoin={handleJoinTeam} onCancel={() => navigate('/dashboard')} />;
  }

  if (!team || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{dashboardData.game.title}</h1>
                <p className="text-sm text-gray-600">Team: {team.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Your Score</div>
                <div className="text-2xl font-bold text-blue-600">
                  {team.overall_score?.toFixed(1) || '0.0'}
                </div>
              </div>
              <LanguageSelector />
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'game', label: 'Current Challenge', icon: FileText },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Company Performance</h2>
              <DepartmentDashboard metrics={convertToDepartmentMetrics(team.metrics)} />
            </div>

            {/* Current Session Info */}
            {currentSession ? (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Current Session</h3>
                <p className="text-gray-600 mb-4">
                  {currentSession.title} - {currentSession.day} {currentSession.period}
                </p>
                {currentSession.status === 'active' ? (
                  <button
                    onClick={() => setActiveTab('game')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Challenge
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    {currentSession.status === 'locked'
                      ? 'This session has not been unlocked yet'
                      : 'This session has been completed'}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No active session. Wait for your Game Master to unlock the next challenge.</p>
              </div>
            )}

            {/* Recent Submissions */}
            {dashboardData.submissions && dashboardData.submissions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Submissions</h3>
                <div className="space-y-2">
                  {dashboardData.submissions.slice(0, 5).map((submission: any) => (
                    <div
                      key={submission.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">Challenge: {submission.challenge_id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        {submission.status === 'scored' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Score: {submission.score}/100
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'game' && (
          <div className="space-y-6">
            {currentSession && currentSession.status === 'active' && gameId && teamId ? (
              <SubmissionForm
                gameId={gameId}
                teamId={teamId}
                sessionId={currentSession.id}
                challengeId={currentSession.challenges?.id || `session-${currentSession.session_number}`}
                challengeTitle={currentSession.title}
                challengeDescription={currentSession.description || 'Submit your decision for this session'}
                onSubmissionComplete={() => {
                  // Reload game data to show the new submission
                  if (teamId) {
                    loadGameData(teamId);
                  }
                }}
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Challenge</h3>
                <p className="text-gray-600">
                  Wait for your Game Master to unlock the next session.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {leaderboard.length === 0 ? (
                <div className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No scores yet. Complete challenges to see rankings!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {leaderboard.map((entry: any, index: number) => (
                    <div
                      key={entry.team_id}
                      className={`p-4 flex items-center justify-between ${
                        entry.is_current_team ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-400 w-8">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {entry.team_name}
                            {entry.is_current_team && (
                              <span className="ml-2 text-sm text-blue-600">(You)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {entry.overall_score?.toFixed(1) || '0.0'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Join Team Modal Component
function JoinTeamModal({
  gameId,
  onJoin,
  onCancel,
}: {
  gameId: string;
  onJoin: (teamName: string, color: string, members: string[]) => void;
  onCancel: () => void;
}) {
  const [teamName, setTeamName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];

  const handleAddMember = () => {
    if (memberInput.trim() && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput('');
    }
  };

  const handleRemoveMember = (member: string) => {
    setMembers(members.filter((m) => m !== member));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onJoin(teamName, color, members);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Game</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Name *</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="The Innovators"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Color</label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members (optional)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Member name"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={isLoading}
              >
                Add
              </button>
            </div>
            {members.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <span
                    key={member}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {member}
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member)}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
