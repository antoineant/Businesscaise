import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI, podAPI } from '../services/api';
import type { PodInfo, Game } from '../types';
import { ArrowLeft, Shuffle, Users, TrendingUp, Award, Layers, Loader2 } from 'lucide-react';

export const PodManagementPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [pods, setPods] = useState<PodInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (gameId) {
      loadData();
    }
  }, [gameId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [gameRes, podsRes] = await Promise.all([
        gameAPI.getGame(gameId!),
        podAPI.getGamePods(gameId!),
      ]);

      setGame(gameRes.data.game);
      setPods(podsRes.data.pods || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pod data');
      console.error('Error loading pod data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPods = async () => {
    if (!gameId) return;

    try {
      setAssigning(true);
      setError('');
      setSuccessMessage('');

      const response = await podAPI.assignPods(gameId);
      setPods(response.data.pods || []);
      setSuccessMessage(response.data.message || 'Pods assigned successfully!');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign pods');
      console.error('Error assigning pods:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleManualAssignment = async (teamId: string, newPodId: string) => {
    if (!gameId) return;

    try {
      setError('');
      const pod = pods.find(p => p.pod_id === newPodId);
      if (!pod) return;

      await podAPI.assignTeamToPod(gameId, teamId, {
        pod_id: newPodId,
        pod_name: pod.pod_name,
      });

      // Reload pods
      await loadData();
      setSuccessMessage('Team reassigned successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reassign team');
      console.error('Error reassigning team:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Game not found
      </div>
    );
  }

  if (!game.enable_pods) {
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
            <h1 className="text-3xl font-bold text-gray-900">Pod Competition</h1>
          </div>
        </div>

        <div className="card">
          <div className="text-center py-8">
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Pod Competition Not Enabled
            </h3>
            <p className="text-gray-600 mb-6">
              This game was created without pod competition. Pods cannot be enabled after game creation.
            </p>
            <button
              onClick={() => navigate(`/games/${gameId}`)}
              className="btn-secondary"
            >
              Back to Game Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalTeams = pods.reduce((sum, pod) => sum + pod.team_count, 0);
  const avgTeamsPerPod = pods.length > 0 ? (totalTeams / pods.length).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/games/${gameId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pod Management</h1>
            <p className="text-gray-600 mt-1">{game.title}</p>
          </div>
        </div>

        <button
          onClick={handleAssignPods}
          disabled={assigning || totalTeams === 0}
          className="btn-primary inline-flex items-center"
        >
          <Shuffle className="w-5 h-5 mr-2" />
          {assigning ? 'Assigning...' : pods.length > 0 ? 'Reassign Pods' : 'Assign Pods'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pods</p>
              <p className="text-2xl font-bold text-gray-900">{pods.length}</p>
            </div>
            <Layers className="w-10 h-10 text-indigo-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">{totalTeams}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg per Pod</p>
              <p className="text-2xl font-bold text-gray-900">{avgTeamsPerPod}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pod Size</p>
              <p className="text-2xl font-bold text-gray-900">{game.pod_size || 4}</p>
            </div>
            <Award className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {pods.length === 0 && totalTeams > 0 && (
        <div className="card text-center py-12">
          <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pods Assigned Yet</h3>
          <p className="text-gray-600 mb-6">
            Click "Assign Pods" above to randomly assign teams to pods based on your configured pod size ({game.pod_size} teams).
          </p>
          <button
            onClick={handleAssignPods}
            disabled={assigning}
            className="btn-primary inline-flex items-center"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            {assigning ? 'Assigning...' : 'Assign Pods Now'}
          </button>
        </div>
      )}

      {totalTeams === 0 && (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teams Yet</h3>
          <p className="text-gray-600">
            Teams need to join the game before pods can be assigned.
          </p>
        </div>
      )}

      {/* Pod Cards */}
      {pods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pods.map((pod) => (
            <div key={pod.pod_id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{pod.pod_name}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {pod.team_count} teams
                </span>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-semibold text-gray-900">
                    {pod.avg_score.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {pod.teams.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No teams assigned</p>
                ) : (
                  pod.teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{team.name}</p>
                          <p className="text-xs text-gray-500">
                            Score: {Number(team.overall_score ?? 0).toFixed(1)}
                          </p>
                        </div>
                      </div>

                      {pods.length > 1 && (
                        <select
                          value={pod.pod_id}
                          onChange={(e) => handleManualAssignment(team.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {pods.map((p) => (
                            <option key={p.pod_id} value={p.pod_id}>
                              {p.pod_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => navigate(`/games/${gameId}/pods/${pod.pod_id}`)}
                className="mt-4 w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View Pod Leaderboard →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      {pods.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Pod Management Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use the dropdown on each team to manually reassign them to different pods</li>
            <li>• Click "Reassign Pods" to randomly redistribute all teams (useful if new teams join)</li>
            <li>• Each pod competes independently while still visible on the global leaderboard</li>
            <li>• Pod assignments can be changed at any time without affecting scores</li>
          </ul>
        </div>
      )}
    </div>
  );
};
