import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unifiedGmAPI as gmAPI, Game, Team, Session, Submission } from '../services/api.unified';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Users, FileText, TrendingUp, ArrowLeft, Unlock, AlertCircle, CheckCircle, XCircle, Download, Eye, X } from 'lucide-react';
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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'teams' | 'submissions'>('overview');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'scored'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [scoringModalOpen, setScoringModalOpen] = useState(false);
  const [scoreValue, setScoreValue] = useState<number>(0);
  const [feedbackValue, setFeedbackValue] = useState<string>('');

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

  const loadSubmissions = async () => {
    if (!gameId) return;

    try {
      const status = submissionFilter === 'all' ? undefined : submissionFilter;
      const data = await gmAPI.listSubmissions(gameId, status);
      setSubmissions(data);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setError('Failed to load submissions');
    }
  };

  // Load submissions when tab is active or filter changes
  useEffect(() => {
    if (activeTab === 'submissions' && gameId) {
      loadSubmissions();
    }
  }, [activeTab, submissionFilter, gameId]);

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

  const handleOpenScoringModal = async (submission: Submission) => {
    setSelectedSubmission(submission);
    setScoreValue(submission.score || 0);
    setFeedbackValue(submission.feedback || '');
    setScoringModalOpen(true);
  };

  const handleCloseScoringModal = () => {
    setScoringModalOpen(false);
    setSelectedSubmission(null);
    setScoreValue(0);
    setFeedbackValue('');
  };

  const handleSubmitScore = async () => {
    if (!selectedSubmission) return;

    try {
      await gmAPI.scoreSubmission(selectedSubmission.id, scoreValue, feedbackValue);
      handleCloseScoringModal();
      await loadSubmissions(); // Refresh the list
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to score submission');
    }
  };

  const getTeamName = (teamId: string): string => {
    const team = teams.find((t) => t.id === teamId);
    return team?.name || 'Unknown Team';
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
          <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">Submissions</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSubmissionFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    submissionFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSubmissionFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    submissionFilter === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setSubmissionFilter('scored')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    submissionFilter === 'scored'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Scored
                </button>
              </div>
            </div>

            {/* Submissions List */}
            {submissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {submissionFilter === 'all'
                    ? 'No submissions yet'
                    : `No ${submissionFilter} submissions`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {submissions.map((submission) => {
                  const teamName = getTeamName(submission.team_id);
                  const team = teams.find((t) => t.id === submission.team_id);

                  return (
                    <div
                      key={submission.id}
                      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        {/* Left side - Team info and submission details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {team && (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: team.color }}
                              >
                                {teamName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{teamName}</h3>
                              <p className="text-sm text-gray-600">
                                Challenge: {submission.challenge_id}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Submitted</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(submission.submitted_at).toLocaleString()}
                              </p>
                            </div>
                            {submission.scored_at && (
                              <div>
                                <p className="text-xs text-gray-500">Scored</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(submission.scored_at).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* File attachments */}
                          {submission.file_urls && submission.file_urls.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span>{submission.file_urls.length} file(s) attached</span>
                            </div>
                          )}

                          {/* Score and feedback (if scored) */}
                          {submission.status === 'scored' && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-green-900">
                                  Score: {submission.score}/100
                                </span>
                              </div>
                              {submission.feedback && (
                                <p className="text-sm text-gray-700">"{submission.feedback}"</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right side - Status badge and action button */}
                        <div className="flex flex-col items-end gap-3 ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              submission.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : submission.status === 'scored'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {submission.status === 'pending' && 'Pending Review'}
                            {submission.status === 'scored' && 'Scored'}
                            {submission.status === 'rejected' && 'Rejected'}
                          </span>

                          <button
                            onClick={() => handleOpenScoringModal(submission)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {submission.status === 'scored' ? (
                              <>
                                <Eye className="w-4 h-4" />
                                View/Edit
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Score
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Scoring Modal */}
      {scoringModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Score Submission</h2>
              <button
                onClick={handleCloseScoringModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Team Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Team</h3>
                <div className="flex items-center gap-3">
                  {(() => {
                    const team = teams.find((t) => t.id === selectedSubmission.team_id);
                    return team ? (
                      <>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.name.charAt(0)}
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{team.name}</span>
                      </>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">Unknown Team</span>
                    );
                  })()}
                </div>
              </div>

              {/* Submission Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Challenge ID</h3>
                  <p className="text-gray-900">{selectedSubmission.challenge_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted At</h3>
                  <p className="text-gray-900">
                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Submission Data */}
              {selectedSubmission.submission_data && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Submission Data</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedSubmission.submission_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* File Attachments */}
              {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Attached Files</h3>
                  <div className="space-y-2">
                    {selectedSubmission.file_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-600 font-medium">
                          File {index + 1} - {url.split('/').pop()}
                        </span>
                        <Download className="w-4 h-4 text-blue-600 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Score Input */}
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                  Score (0-100)
                </label>
                <input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter score"
                />
              </div>

              {/* Feedback Textarea */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={feedbackValue}
                  onChange={(e) => setFeedbackValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide feedback to the team..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseScoringModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitScore}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Submit Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
