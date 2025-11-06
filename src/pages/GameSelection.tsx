import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { unifiedGmAPI as gmAPI, unifiedTeamAPI as teamAPI, Game } from '../services/api.unified';
import { useTranslation } from 'react-i18next';
import { Plus, Users, Clock, Play, AlertCircle } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { demoMode } from '../services/demo-mode';

export default function GameSelection() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gameCode, setGameCode] = useState('');

  // Auto-navigate demo mode players to the demo game
  useEffect(() => {
    if (user?.role === 'player' && demoMode.isEnabled()) {
      const demoGameId = 'game-demo-001';
      const teamId = 'team-demo-001';

      // Store team ID for demo player
      localStorage.setItem(`team_${demoGameId}`, teamId);
      navigate(`/game/${demoGameId}`, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setIsLoading(true);
      if (user?.role === 'game_master') {
        const gamesList = await gmAPI.listGames();
        setGames(gamesList);
      }
    } catch (err: any) {
      console.error('Failed to load games:', err);
      setError('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleGameClick = (gameId: string) => {
    if (user?.role === 'game_master') {
      navigate(`/gm/game/${gameId}`);
    } else {
      navigate(`/game/${gameId}`);
    }
  };

  const handleJoinGame = () => {
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    setError('');
    // Navigate to the game page with the entered game code
    navigate(`/game/${gameCode.trim()}`);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'setup':
        return '⚙️';
      case 'active':
        return '▶️';
      case 'paused':
        return '⏸️';
      case 'completed':
        return '✅';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BusinessCaise</h1>
              <p className="text-sm text-gray-600 mt-1">
                {user?.role === 'game_master' ? 'Game Master Dashboard' : 'Player Dashboard'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector />
              <div className="text-right border-r pr-4">
                <div className="text-sm text-gray-600">Welcome</div>
                <div className="font-semibold text-gray-900">{user?.name}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Game Master View */}
        {user?.role === 'game_master' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Games</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Create New Game
              </button>
            </div>

            {games.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Games Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first game to get started with BusinessCaise.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Create Your First Game
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleGameClick(game.id)}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{game.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                        {getStatusIcon(game.status)} {game.status}
                      </span>
                    </div>

                    {game.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {game.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(game.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Player View */}
        {user?.role === 'player' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <Play className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Play?</h3>
              <p className="text-gray-600 mb-6">
                Your Game Master will provide you with a game code to join a session.
              </p>
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                  placeholder="Enter game code (e.g., game-demo-001)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleJoinGame}
                  disabled={!gameCode.trim()}
                  className="w-full mt-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Join Game
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Game Modal */}
      {showCreateModal && <CreateGameModal onClose={() => setShowCreateModal(false)} onSuccess={loadGames} />}
    </div>
  );
}

// Create Game Modal Component
function CreateGameModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await gmAPI.createGame({ title, description });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Game</h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Spring 2024 Business Challenge"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Week-long intensive business simulation..."
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              {isLoading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
