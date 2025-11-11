import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionAPI } from '../services/api';
import { ArrowLeft, FileText, CheckCircle, Clock, Award } from 'lucide-react';

interface Submission {
  id: string;
  team_id: string;
  team_name: string;
  session_id: string;
  session_number: number;
  challenge_id: string;
  submission_data: any;
  file_urls?: string[];
  status: 'pending' | 'scored';
  score?: number;
  feedback?: string;
  submitted_at: string;
}

export const SubmissionsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'scored'>('all');

  useEffect(() => {
    loadSubmissions();
  }, [gameId]);

  const loadSubmissions = async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      const response = await submissionAPI.getSubmissions(gameId);
      setSubmissions(response.data.submissions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return sub.status === 'pending';
    if (filter === 'scored') return sub.status === 'scored';
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const scoredCount = submissions.filter((s) => s.status === 'scored').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-primary-600" />
              Submissions
            </h1>
            <p className="text-gray-600 mt-1">Review and score team submissions</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            filter === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({submissions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            filter === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-1" />
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('scored')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            filter === 'scored'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-1" />
          Scored ({scoredCount})
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === 'all' && 'No submissions yet'}
            {filter === 'pending' && 'No pending submissions'}
            {filter === 'scored' && 'No scored submissions'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/games/${gameId}/submissions/${submission.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {submission.team_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Session {submission.session_number}
                    </span>
                    {submission.status === 'pending' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Scored
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                    {submission.file_urls && submission.file_urls.length > 0 && (
                      <p className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {submission.file_urls.length} file(s) attached
                      </p>
                    )}
                  </div>
                </div>
                {submission.status === 'scored' && submission.score !== undefined && (
                  <div className="text-right ml-4">
                    <div className="flex items-center justify-end text-2xl font-bold text-primary-600">
                      <Award className="w-6 h-6 mr-2" />
                      {submission.score}
                    </div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
