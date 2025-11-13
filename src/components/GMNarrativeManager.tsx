import React, { useState, useEffect } from 'react';
import {
  createNarrative,
  getGameNarratives,
  deleteNarrative,
  getNarrativeReadStats,
  type Narrative,
  type NarrativeReadStats,
} from '../services/narrative.api';

interface GMNarrativeManagerProps {
  gameId: string;
  teams?: Array<{ id: string; name: string }>;
}

const narrativeTypes = [
  { value: 'briefing', label: 'Briefing', icon: '📋' },
  { value: 'news', label: 'News', icon: '📰' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'alert', label: 'Alert', icon: '🚨' },
];

export default function GMNarrativeManager({ gameId, teams = [] }: GMNarrativeManagerProps) {
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative | null>(null);
  const [readStats, setReadStats] = useState<NarrativeReadStats | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'news' as 'briefing' | 'news' | 'email' | 'alert',
    title: '',
    content: '',
    author: '',
    targetTeams: [] as string[],
  });

  const [submitting, setSubmitting] = useState(false);

  // Load narratives
  const loadNarratives = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getGameNarratives(gameId);
      setNarratives(data.narratives);
    } catch (err: any) {
      console.error('Failed to load narratives:', err);
      setError(err.response?.data?.error || 'Failed to load narratives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNarratives();
  }, [gameId]);

  // Load read stats for selected narrative
  const loadReadStats = async (narrativeId: string) => {
    try {
      const stats = await getNarrativeReadStats(narrativeId);
      setReadStats(stats);
    } catch (err) {
      console.error('Failed to load read stats:', err);
    }
  };

  useEffect(() => {
    if (selectedNarrative) {
      loadReadStats(selectedNarrative.id);
    } else {
      setReadStats(null);
    }
  }, [selectedNarrative]);

  // Create narrative
  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      await createNarrative(gameId, {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        author: formData.author || undefined,
        target_teams: formData.targetTeams.length > 0 ? formData.targetTeams : undefined,
      });

      // Reload narratives
      await loadNarratives();

      // Reset form
      setFormData({
        type: 'news',
        title: '',
        content: '',
        author: '',
        targetTeams: [],
      });
      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Failed to create narrative:', err);
      setError(err.response?.data?.error || 'Failed to create narrative');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete narrative
  const handleDelete = async (narrativeId: string) => {
    if (!confirm('Are you sure you want to delete this narrative?')) return;

    try {
      await deleteNarrative(narrativeId);
      await loadNarratives();
      if (selectedNarrative?.id === narrativeId) {
        setSelectedNarrative(null);
      }
    } catch (err: any) {
      console.error('Failed to delete narrative:', err);
      setError(err.response?.data?.error || 'Failed to delete narrative');
    }
  };

  // Toggle team selection
  const handleToggleTeam = (teamId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetTeams: prev.targetTeams.includes(teamId)
        ? prev.targetTeams.filter((id) => id !== teamId)
        : [...prev.targetTeams, teamId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Narrative Manager</h2>
            <p className="text-indigo-100 text-sm">Create and manage game narratives</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
          >
            {showCreateForm ? '✕ Cancel' : '+ Create Narrative'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Create New Narrative</h3>

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-4 gap-2">
                {narrativeTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: type.value as any }))
                    }
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter narrative title..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter narrative content..."
                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author (optional)
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="e.g., Game Master, Market Analyst..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Target Teams */}
            {teams.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Teams (leave empty for all teams)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleToggleTeam(team.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.targetTeams.includes(team.id)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{team.name}</div>
                      {formData.targetTeams.includes(team.id) && (
                        <div className="text-xs text-indigo-600 mt-1">✓ Selected</div>
                      )}
                    </button>
                  ))}
                </div>
                {formData.targetTeams.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No teams selected - will be visible to all teams
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.title.trim() || !formData.content.trim() || submitting}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  !formData.title.trim() || !formData.content.trim() || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                }`}
              >
                {submitting ? 'Creating...' : 'Create Narrative'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Narrative List */}
      <div className="divide-y divide-gray-200">
        {narratives.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">No narratives yet</p>
            <p className="text-sm">Create your first narrative to get started</p>
          </div>
        ) : (
          narratives.map((narrative) => (
            <div
              key={narrative.id}
              className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedNarrative?.id === narrative.id ? 'bg-indigo-50' : ''
              }`}
              onClick={() => setSelectedNarrative(narrative)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {narrativeTypes.find((t) => t.value === narrative.type)?.icon}
                    </span>
                    <h3 className="font-semibold text-lg">{narrative.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                      {narrative.type}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {narrative.content}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{new Date(narrative.published_at).toLocaleString()}</span>
                    {narrative.author && <span>By {narrative.author}</span>}
                    {narrative.target_teams ? (
                      <span>
                        📍 {narrative.target_teams.length} team
                        {narrative.target_teams.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span>🌐 All teams</span>
                    )}
                  </div>

                  {/* Read Stats Preview */}
                  {selectedNarrative?.id === narrative.id && readStats && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium">
                          Read by {readStats.stats.teamsRead} of {readStats.stats.totalTeams}{' '}
                          teams
                        </span>
                        <span className="text-green-600 font-medium">
                          {readStats.stats.readPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(narrative.id);
                  }}
                  className="ml-4 text-red-600 hover:text-red-700 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
