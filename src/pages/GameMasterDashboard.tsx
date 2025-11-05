import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gmAPI, Game, Team, Session } from '../services/api.client';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Users, FileText, TrendingUp, ArrowLeft, Unlock, AlertCircle } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useAuth } from '../contexts/AuthContext';

export default function GameMasterDashboard() {
  const { t } = useTranslation('common');
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'teams' | 'submissions'>('overview');

  useEffect(() => {
    if (gameId) {
      loadGameData();
    }
  }, [gameId]);

  const loadGameData = async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const data = await gmAPI.getGameDetails(gameId);
      setGame(data.game);
      setTeams(data.teams);
      setSessions(data.sessions);
    } catch (err: any) {
      console.error('Failed to load game data:', err);
      setError('Failed to load game data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!gameId) return;
    try {
      await gmAPI.startGame(gameId);
      await loadGameData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start game');
    }
  };

  const handlePauseGame = async () => {
    if (!gameId) return;
    try {
      await gmAPI.pauseGame(gameId);
      await loadGameData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to pause game');
    }
  };

  const handleResumeGame = async () => {
    if (!gameId) return;
    try {
      await gmAPI.resumeGame(gameId);
      await loadGameData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resume game');
    }
  };

  const handleUnlockSession = async (sessionId: string) => {
    if (!gameId) return;
    try {
      await gmAPI.unlockSession(gameId, sessionId);
      await loadGameData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to unlock session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'setup':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'locked':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h2>
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
                <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
                <p className="text-sm text-gray-600">{game.description || 'Game Master Dashboard'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(game.status)}`}>
                {game.status}
              </span>
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

      {/* Game Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {game.status === 'setup' && (
              <button
                onClick={handleStartGame}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                Start Game
              </button>
            )}
            {game.status === 'active' && (
              <button
                onClick={handlePauseGame}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4" />
                Pause Game
              </button>
            )}
            {game.status === 'paused' && (
              <button
                onClick={handleResumeGame}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                Resume Game
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'sessions', label: 'Sessions', icon: FileText },
              { id: 'teams', label: 'Teams', icon: Users },
              { id: 'submissions', label: 'Submissions', icon: FileText },
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Teams</p>
                  <p className="text-3xl font-bold text-gray-900">{teams.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {sessions.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {sessions.filter(s => s.status === 'completed').length}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Game Sessions</h2>
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-600">
                        {session.day} {session.period} - Session {session.session_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSessionStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      {session.status === 'locked' && (
                        <button
                          onClick={() => handleUnlockSession(session.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Unlock className="w-4 h-4" />
                          Unlock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Participating Teams</h2>
            {teams.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No teams have joined yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-600">
                          Score: {team.overall_score?.toFixed(1) || '0.0'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Submissions view coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}
