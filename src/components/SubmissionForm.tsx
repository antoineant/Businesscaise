import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import FileUploadBackend from './FileUploadBackend';
import Level1Input from './Level1Input';
import Level1Results from './Level1Results';
import { unifiedTeamAPI as teamAPI } from '../services/api.unified';
import type { Team } from '../services/api.client';
import type { Level1Decision, Level1TeamState, Level1SessionResult } from '../services/scoring/level1-types';

interface SubmissionFormProps {
  gameId: string;
  teamId: string;
  sessionId: string;
  challengeId: string;
  challengeTitle?: string;
  challengeDescription?: string;
  onSubmissionComplete?: () => void;
}

export default function SubmissionForm({
  gameId,
  teamId,
  sessionId,
  challengeId,
  challengeTitle = 'Current Challenge',
  challengeDescription = 'Submit your decision for this challenge',
  onSubmissionComplete,
}: SubmissionFormProps) {
  const { t } = useTranslation('game');
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState('');
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [level1Result, setLevel1Result] = useState<Level1SessionResult | null>(null);

  // Load team data to check difficulty level
  useEffect(() => {
    async function loadTeam() {
      try {
        const teamData = await teamAPI.getCurrentTeam(teamId);
        setTeam(teamData);
      } catch (err) {
        console.error('Error loading team:', err);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, [teamId]);

  const handleFileUploadComplete = (urls: string[]) => {
    setFileUrls(urls);
    setError('');
  };

  const handleFileUploadError = (errorMsg: string) => {
    setError(errorMsg);
  };

  // Level 1 submission handler
  const handleLevel1Submit = async (decision: Level1Decision) => {
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await teamAPI.submitDecision(teamId, {
        session_id: sessionId,
        challenge_id: challengeId,
        submission_data: decision,
      });

      // Extract Level 1 result from submission
      if (response.submission.submission_data?.result) {
        setLevel1Result(response.submission.submission_data.result);
      }

      setSuccess(true);
      // DON'T call onSubmissionComplete for Level 1 - we want to show results immediately
      // without the parent reloading data which would show the next session's input form
      // onSubmissionComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate that we have either submission data or files
    if (!submissionData.trim() && fileUrls.length === 0) {
      setError(t('submission.validationError'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse submission data as JSON if possible, otherwise send as text
      let parsedData: any;
      try {
        parsedData = submissionData.trim() ? JSON.parse(submissionData) : {};
      } catch {
        // If not valid JSON, send as text
        parsedData = { text: submissionData };
      }

      await teamAPI.submitDecision(teamId, {
        session_id: sessionId,
        challenge_id: challengeId,
        submission_data: parsedData,
        file_urls: fileUrls.length > 0 ? fileUrls : undefined,
      });

      setSuccess(true);
      setSubmissionData('');
      setFileUrls([]);

      // Call the completion callback after a delay so success message is visible
      setTimeout(() => {
        onSubmissionComplete?.();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">{t('submission.loading')}</span>
        </div>
      </div>
    );
  }

  // Show Level 1 UI for beginner teams
  if (team?.difficulty_level === 'beginner' && team.level1_state) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('submission.level1Title')}</h3>
        <p className="text-gray-600 mb-6">{t('submission.level1Description')}</p>

        {/* Show results if submitted */}
        {level1Result ? (
          <div>
            <Level1Results result={level1Result} />
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-900">
                  {t('submission.decisionSubmittedScored')}
                </p>
              </div>
              <button
                onClick={() => {
                  setLevel1Result(null);
                  onSubmissionComplete?.();
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t('submission.continueNextSession')}
              </button>
            </div>
          </div>
        ) : (
          <Level1Input
            teamState={team.level1_state as Level1TeamState}
            onSubmit={handleLevel1Submit}
            isSubmitting={isSubmitting}
          />
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Show generic submission form for other difficulty levels
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{challengeTitle}</h3>
      <p className="text-gray-600 mb-6">{challengeDescription}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Submission Data Input */}
        <div>
          <label htmlFor="submission-data" className="block text-sm font-medium text-gray-700 mb-2">
            {t('submission.decisionData')}
          </label>
          <textarea
            id="submission-data"
            rows={6}
            value={submissionData}
            onChange={(e) => setSubmissionData(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder={t('submission.decisionDataPlaceholder')}
            disabled={isSubmitting || success}
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('submission.decisionDataHelp')}
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('submission.supportingDocuments')}
          </label>
          <FileUploadBackend
            gameId={gameId}
            teamId={teamId}
            maxFiles={5}
            maxSizeMB={10}
            onUploadComplete={handleFileUploadComplete}
            onUploadError={handleFileUploadError}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-green-800">
              {t('submission.decisionSubmittedSuccess')}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('submission.submitting')}
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              {t('submission.submitted')}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t('submission.submitDecision')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
