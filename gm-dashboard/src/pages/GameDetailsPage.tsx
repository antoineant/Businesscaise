import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import type { Game, Session, Team } from '../types';
import {
  ArrowLeft,
  Play,
  Pause,
  Users,
  Calendar,
  Trophy,
  BarChart3,
  Edit,
  Unlock
} from 'lucide-react';
import { format } from 'date-fns';

export const GameDetailsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadGameData = async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      const [gameResponse, sessionsResponse, teamsResponse] = await Promise.all([
        gameAPI.getGame(gameId),
        gameAPI.getSessions(gameId),
        gameAPI.getTeams(gameId),
      ]);

      setGame(gameResponse.data.game);
      setSessions(sessionsResponse.data.sessions);
      setTeams(teamsResponse.data.teams);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGameData();
  }, [gameId]);

  const handleStartGame = async () => {
    if (!gameId) return;
    setActionLoading(true);
    try {
      await gameAPI.startGame(gameId);
      await loadGameData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start game');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseGame = async () => {
    if (!gameId) return;
    setActionLoading(true);
    try {
      await gameAPI.pauseGame(gameId);
      await loadGameData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to pause game');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeGame = async () => {
    if (!gameId) return;
    setActionLoading(true);
    try {
      await gameAPI.resumeGame(gameId);
      await loadGameData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resume game');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlockSession = async (sessionId: string) => {
    if (!gameId) return;
    setActionLoading(true);
    try {
      await gameAPI.unlockSession(gameId, sessionId);
      await loadGameData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unlock session');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Game not found'}</p>
        <button onClick={() => navigate('/games')} className="btn-secondary">
          Back to Games
        </button>
      </div>
    );
  }

  const unlockedSessions = sessions.filter((s) => s.status !== 'locked').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate('/games')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{game.title}</h1>
            {game.description && (
              <p className="text-gray-600 mt-1">{game.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Status: <span className="font-medium text-gray-900" data-testid="game-status">{game.status}</span></span>
              {game.start_date && (
                <span>Start: {format(new Date(game.start_date), 'MMM d, yyyy')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {game.status === 'setup' && (
            <button
              onClick={handleStartGame}
              disabled={actionLoading}
              className="btn-primary inline-flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </button>
          )}
          {game.status === 'active' && (
            <button
              onClick={handlePauseGame}
              disabled={actionLoading}
              className="btn-secondary inline-flex items-center"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Game
            </button>
          )}
          {game.status === 'paused' && (
            <button
              onClick={handleResumeGame}
              disabled={actionLoading}
              className="btn-primary inline-flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume Game
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card" data-testid="teams-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card" data-testid="sessions-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {unlockedSessions}/{sessions.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card cursor-pointer hover:shadow-md transition-shadow" data-testid="leaderboard-stat-card" onClick={() => navigate(`/games/${gameId}/leaderboard`)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leaderboard</p>
              <p className="text-sm font-medium text-primary-600 mt-1">View Rankings →</p>
            </div>
            <Trophy className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card cursor-pointer hover:shadow-md transition-shadow" data-testid="analytics-stat-card" onClick={() => navigate(`/games/${gameId}/analytics`)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Analytics</p>
              <p className="text-sm font-medium text-primary-600 mt-1">View Stats →</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sessions</h2>
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                session.status !== 'locked'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{session.title}</h3>
                  <p className="text-sm text-gray-600">
                    {session.day.charAt(0).toUpperCase() + session.day.slice(1)} {session.period.toUpperCase()}
                    {session.deadline && ` • Deadline: ${format(new Date(session.deadline), 'MMM d, h:mm a')}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {session.status !== 'locked' ? (
                  <span className="text-green-600 text-sm font-medium">Unlocked</span>
                ) : (
                  <button
                    onClick={() => handleUnlockSession(session.id)}
                    disabled={actionLoading}
                    className="btn-primary inline-flex items-center text-sm"
                  >
                    <Unlock className="w-4 h-4 mr-1" />
                    Unlock
                  </button>
                )}
                <button
                  onClick={() => navigate(`/games/${gameId}/sessions/${session.id}/edit`)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Edit session"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Teams</h2>
          <button
            onClick={() => navigate(`/games/${gameId}/teams`)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All Teams →
          </button>
        </div>
        {teams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No teams have joined yet</p>
        ) : (
          <div className="space-y-2">
            {teams.slice(0, 5).map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/games/${gameId}/teams/${team.id}`)}
              >
                <div>
                  <h3 className="font-medium text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600">{team.members.length} members</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{team.total_score.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
              </div>
            ))}
            {teams.length > 5 && (
              <p className="text-center text-sm text-gray-500 pt-2">
                and {teams.length - 5} more teams...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
