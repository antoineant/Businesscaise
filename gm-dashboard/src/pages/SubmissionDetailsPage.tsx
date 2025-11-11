import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionAPI } from '../services/api';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Download, Award } from 'lucide-react';

interface SubmissionDetails {
  id: string;
  team_id: string;
  team_name: string;
  session_id: string;
  session_number: number;
  session_title: string;
  challenge_id: string;
  submission_data: any;
  file_urls?: string[];
  status: 'pending' | 'scored';
  score?: number;
  feedback?: string;
  submitted_at: string;
  scored_at?: string;
}

export const SubmissionDetailsPage: React.FC = () => {
  const { gameId, submissionId } = useParams<{ gameId: string; submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scoring, setScoring] = useState(false);
  const [scoreValue, setScoreValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [scoreSuccess, setScoreSuccess] = useState(false);

  useEffect(() => {
    loadSubmissionDetails();
  }, [submissionId]);

  const loadSubmissionDetails = async () => {
    if (!submissionId) return;

    try {
      setLoading(true);
      const response = await submissionAPI.getSubmissionDetails(submissionId);
      const sub = response.data.submission;
      setSubmission(sub);

      // Pre-fill form if already scored
      if (sub.status === 'scored') {
        setScoreValue(sub.score?.toString() || '');
        setFeedbackValue(sub.feedback || '');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreError('');
    setScoreSuccess(false);

    const score = parseFloat(scoreValue);
    if (isNaN(score) || score < 0 || score > 100) {
      setScoreError('Score must be a number between 0 and 100');
      return;
    }

    try {
      setScoring(true);
      await submissionAPI.scoreSubmission(submission!.id, {
        score,
        feedback: feedbackValue.trim() || undefined,
      });

      setScoreSuccess(true);
      // Reload submission to get updated data
      await loadSubmissionDetails();

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setScoreError(err.response?.data?.message || 'Failed to score submission');
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading submission...</div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Submission not found'}</p>
        <button
          onClick={() => navigate(`/games/${gameId}/submissions`)}
          className="btn-secondary"
        >
          Back to Submissions
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/games/${gameId}/submissions`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            Submission Details
          </h1>
          <p className="text-gray-600 mt-1">
            {submission.team_name} - Session {submission.session_number}
          </p>
        </div>
        {submission.status === 'scored' && (
          <div className="text-right">
            <div className="flex items-center justify-end text-3xl font-bold text-primary-600">
              <Award className="w-8 h-8 mr-2" />
              {submission.score}
            </div>
            <div className="text-sm text-gray-500">Current Score</div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {scoreSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Submission scored successfully!
            </p>
            <p className="text-sm text-green-700 mt-1">
              The team will be notified of their score and feedback.
            </p>
          </div>
        </div>
      )}

      {/* Submission Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Submission Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Team:</span>
            <p className="font-medium text-gray-900">{submission.team_name}</p>
          </div>
          <div>
            <span className="text-gray-500">Session:</span>
            <p className="font-medium text-gray-900">
              Session {submission.session_number}: {submission.session_title}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Submitted:</span>
            <p className="font-medium text-gray-900">
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <p className="font-medium">
              {submission.status === 'pending' ? (
                <span className="inline-flex items-center text-yellow-700">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Pending Review
                </span>
              ) : (
                <span className="inline-flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Scored
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Submission Data */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Submission Content</h2>

        {/* JSON Data */}
        {submission.submission_data && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Decision Data:</h3>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(submission.submission_data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* File Attachments */}
        {submission.file_urls && submission.file_urls.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Attached Files ({submission.file_urls.length}):
            </h3>
            <div className="space-y-2">
              {submission.file_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-900">
                      {url.split('/').pop() || `File ${index + 1}`}
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-primary-600" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scoring Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {submission.status === 'scored' ? 'Update Score' : 'Score Submission'}
        </h2>

        <form onSubmit={handleScoreSubmission} className="space-y-4">
          {/* Score Input */}
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
              Score (0-100) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="score"
              min="0"
              max="100"
              step="0.01"
              value={scoreValue}
              onChange={(e) => setScoreValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter score (e.g., 85.5)"
              required
              disabled={scoring}
            />
          </div>

          {/* Feedback Input */}
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              rows={6}
              value={feedbackValue}
              onChange={(e) => setFeedbackValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Provide feedback to the team about their submission..."
              disabled={scoring}
            />
          </div>

          {/* Error Message */}
          {scoreError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-800">{scoreError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={scoring}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scoring ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Score...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                {submission.status === 'scored' ? 'Update Score' : 'Submit Score'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Previous Feedback (if scored) */}
      {submission.status === 'scored' && submission.feedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2">
          <h3 className="text-sm font-medium text-blue-900">Current Feedback:</h3>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">{submission.feedback}</p>
          {submission.scored_at && (
            <p className="text-xs text-blue-600 mt-2">
              Scored on {new Date(submission.scored_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
