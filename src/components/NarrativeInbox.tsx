import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getTeamNarratives,
  markNarrativeAsRead,
  markAllAsRead,
  type NarrativeWithReadStatus,
  type UnreadCounts,
} from '../services/narrative.api';

interface NarrativeInboxProps {
  teamId: string;
  gameId: string;
}

const narrativeTypeColors = {
  briefing: 'bg-blue-100 text-blue-800 border-blue-300',
  news: 'bg-green-100 text-green-800 border-green-300',
  email: 'bg-purple-100 text-purple-800 border-purple-300',
  alert: 'bg-red-100 text-red-800 border-red-300',
};

const narrativeTypeIcons = {
  briefing: '📋',
  news: '📰',
  email: '✉️',
  alert: '🚨',
};

export default function NarrativeInbox({ teamId, gameId }: NarrativeInboxProps) {
  const { t } = useTranslation('game');
  const [narratives, setNarratives] = useState<NarrativeWithReadStatus[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    total: 0,
    byType: { briefing: 0, news: 0, email: 0, alert: 0 },
  });
  const [selectedNarrative, setSelectedNarrative] = useState<NarrativeWithReadStatus | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load narratives
  const loadNarratives = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = filterType !== 'all' ? { type: filterType } : {};
      const data = await getTeamNarratives(teamId, filters);

      setNarratives(data.narratives);
      setUnreadCounts({
        total: data.unreadCount,
        byType: data.unreadByType,
      });
    } catch (err: any) {
      console.error('Failed to load narratives:', err);
      setError(err.response?.data?.error || 'Failed to load narratives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNarratives();
  }, [teamId, filterType]);

  // Mark narrative as read when selected
  const handleSelectNarrative = async (narrative: NarrativeWithReadStatus) => {
    setSelectedNarrative(narrative);

    // Mark as read if not already
    if (!narrative.isRead) {
      try {
        await markNarrativeAsRead(teamId, narrative.id);

        // Update local state
        setNarratives((prev) =>
          prev.map((n) => (n.id === narrative.id ? { ...n, isRead: true } : n))
        );
        setUnreadCounts((prev) => ({
          total: Math.max(0, prev.total - 1),
          byType: {
            ...prev.byType,
            [narrative.type]: Math.max(0, prev.byType[narrative.type] - 1),
          },
        }));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCounts.total === 0) return;

    try {
      await markAllAsRead(teamId);

      // Update local state
      setNarratives((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCounts({
        total: 0,
        byType: { briefing: 0, news: 0, email: 0, alert: 0 },
      });
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
      setError(err.response?.data?.error || 'Failed to mark all as read');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('narrative.inbox.justNow');
    if (diffMins < 60) return t('narrative.inbox.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('narrative.inbox.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('narrative.inbox.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t('narrative.inbox.title')}</h2>
            <p className="text-blue-100 text-sm">{t('narrative.inbox.subtitle')}</p>
          </div>
          {unreadCounts.total > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              {t('narrative.inbox.markAllRead')}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1 p-2">
          {[
            { value: 'all', label: t('narrative.inbox.all'), count: unreadCounts.total },
            { value: 'briefing', label: t('narrative.inbox.briefings'), count: unreadCounts.byType.briefing },
            { value: 'news', label: t('narrative.inbox.news'), count: unreadCounts.byType.news },
            { value: 'email', label: t('narrative.inbox.emails'), count: unreadCounts.byType.email },
            { value: 'alert', label: t('narrative.inbox.alerts'), count: unreadCounts.byType.alert },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === tab.value
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">{t('narrative.inbox.error')}</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Content Area */}
      <div className="flex" style={{ height: '600px' }}>
        {/* Narrative List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {narratives.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg font-medium">{t('narrative.inbox.noNarratives')}</p>
              <p className="text-sm">{t('narrative.inbox.noNarrativesDesc')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {narratives.map((narrative) => (
                <button
                  key={narrative.id}
                  onClick={() => handleSelectNarrative(narrative)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedNarrative?.id === narrative.id ? 'bg-blue-50' : ''
                  } ${!narrative.isRead ? 'bg-blue-25' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0">
                      {narrativeTypeIcons[narrative.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            narrativeTypeColors[narrative.type]
                          }`}
                        >
                          {narrative.type}
                        </span>
                        {!narrative.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <h3
                        className={`font-semibold text-sm mb-1 truncate ${
                          !narrative.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {narrative.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {narrative.content.substring(0, 80)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(narrative.published_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Narrative Detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedNarrative ? (
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-3xl">{narrativeTypeIcons[selectedNarrative.type]}</span>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      narrativeTypeColors[selectedNarrative.type]
                    }`}
                  >
                    {selectedNarrative.type.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedNarrative.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    {new Date(selectedNarrative.published_at).toLocaleString()}
                  </span>
                  {selectedNarrative.author && <span>{t('narrative.inbox.by')} {selectedNarrative.author}</span>}
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: selectedNarrative.content }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg
                className="w-20 h-20 mb-4"
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
              <p className="text-lg font-medium">{t('narrative.inbox.selectToRead')}</p>
              <p className="text-sm">{t('narrative.inbox.selectFromList')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
