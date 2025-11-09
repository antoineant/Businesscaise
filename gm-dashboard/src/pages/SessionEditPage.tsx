import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import type { Session } from '../types';

export const SessionEditPage: React.FC = () => {
  const { gameId, sessionId } = useParams<{ gameId: string; sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [narrative, setNarrative] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (!gameId || !sessionId) return;

      try {
        setLoadingSession(true);
        const response = await gameAPI.getSessions(gameId);
        const sessions = response.data.sessions;
        const currentSession = sessions.find((s: Session) => s.id === sessionId);

        if (currentSession) {
          setSession(currentSession);
          setTitle(currentSession.title);
          setDescription(currentSession.description || '');
          setNarrative(currentSession.narrative || '');

          // Format deadline for datetime-local input
          if (currentSession.deadline) {
            const date = new Date(currentSession.deadline);
            const formatted = date.toISOString().slice(0, 16);
            setDeadline(formatted);
          }
        } else {
          setError('Session not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load session');
      } finally {
        setLoadingSession(false);
      }
    };

    loadSession();
  }, [gameId, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !sessionId) return;

    setError('');
    setLoading(true);

    try {
      await gameAPI.updateSession(gameId, sessionId, {
        title,
        description: description || undefined,
        deadline: deadline || undefined,
        narrative: narrative || undefined,
      });

      navigate(`/games/${gameId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update session');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
        <button onClick={() => navigate(`/games/${gameId}`)} className="btn-secondary">
          Back to Game
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/games/${gameId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Session</h1>
          <p className="text-gray-600 mt-1">
            {session.day.charAt(0).toUpperCase() + session.day.slice(1)} {session.period.toUpperCase()} - Session #{session.session_number}
          </p>
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
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              required
              placeholder="Session title"
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
              placeholder="Brief description of this session"
            />
          </div>

          <div>
            <label htmlFor="deadline" className="label">
              Deadline
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input"
            />
            <p className="text-sm text-gray-600 mt-1">
              Optional deadline for team submissions
            </p>
          </div>

          <div>
            <label htmlFor="narrative" className="label">
              Narrative / Story Context
            </label>
            <textarea
              id="narrative"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="input"
              rows={6}
              placeholder="Story context, background information, or scenario details for this session"
            />
            <p className="text-sm text-gray-600 mt-1">
              This narrative will be shown to teams when the session is unlocked
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(`/games/${gameId}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary inline-flex items-center"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Session Info */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Session Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Session Number: {session.session_number}</li>
          <li>• Day: {session.day.charAt(0).toUpperCase() + session.day.slice(1)}</li>
          <li>• Period: {session.period.toUpperCase()}</li>
          <li>• Status: {session.status.charAt(0).toUpperCase() + session.status.slice(1)}</li>
          {session.unlocked_at && (
            <li>• Unlocked at: {new Date(session.unlocked_at).toLocaleString()}</li>
          )}
        </ul>
      </div>
    </div>
  );
};
