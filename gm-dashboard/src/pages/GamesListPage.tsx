import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import type { Game } from '../types';
import { Plus, Play, Pause, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const GamesListPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await gameAPI.getGames();
      setGames(response.data.games);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleDeleteGame = async (gameId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await gameAPI.deleteGame(gameId);
      setGames(games.filter((g) => g.id !== gameId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete game');
    }
  };

  const getStatusBadge = (status: Game['status']) => {
    const badges = {
      draft: { icon: Clock, class: 'bg-gray-100 text-gray-700', label: 'Draft' },
      active: { icon: Play, class: 'bg-green-100 text-green-700', label: 'Active' },
      paused: { icon: Pause, class: 'bg-yellow-100 text-yellow-700', label: 'Paused' },
      completed: { icon: CheckCircle, class: 'bg-blue-100 text-blue-700', label: 'Completed' },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Games</h1>
          <p className="text-gray-600 mt-1">Manage your business simulation games</p>
        </div>
        <button
          onClick={() => navigate('/games/create')}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Game
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {games.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Play className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No games yet</h3>
          <p className="text-gray-600 mb-6">Create your first business simulation game to get started</p>
          <button
            onClick={() => navigate('/games/create')}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Game
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/games/${game.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{game.title}</h3>
                {getStatusBadge(game.status)}
              </div>

              {game.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{game.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                {game.start_date && (
                  <div>
                    <span className="font-medium">Start:</span>{' '}
                    {format(new Date(game.start_date), 'MMM d, yyyy')}
                  </div>
                )}
                {game.end_date && (
                  <div>
                    <span className="font-medium">End:</span>{' '}
                    {format(new Date(game.end_date), 'MMM d, yyyy')}
                  </div>
                )}
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {format(new Date(game.created_at), 'MMM d, yyyy')}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/games/${game.id}`);
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View Details →
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGame(game.id, game.title);
                  }}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete game"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
