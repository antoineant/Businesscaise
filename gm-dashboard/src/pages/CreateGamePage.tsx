import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export const CreateGamePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await gameAPI.createGame({
        title,
        description: description || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      navigate(`/games/${response.data.game.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/games')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Game</h1>
          <p className="text-gray-600 mt-1">Set up a new business simulation</p>
        </div>
      </div>

      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="label">
              Game Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g., Fall 2024 Business Simulation"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Give your game a descriptive title
            </p>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={4}
              placeholder="Describe the game objectives, context, or any special instructions for teams..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional: Provide additional context for teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="label">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: When teams can start
              </p>
            </div>

            <div>
              <label htmlFor="endDate" className="label">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
                min={startDate || undefined}
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: Deadline for completion
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 10 sessions will be automatically created (Monday-Friday, AM/PM)</li>
              <li>• Game will be created in "draft" status</li>
              <li>• You can customize sessions before starting</li>
              <li>• Teams can join once you provide them with the game details</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Create Game'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
