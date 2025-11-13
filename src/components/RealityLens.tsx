import React, { useState } from 'react';
import {
  enhanceNarrative,
  getEventInspiration,
  type EnhancedNarrative,
  type EventIdea,
  type Source,
} from '../services/narrative.api';

interface RealityLensProps {
  gameId: string;
  industry?: string;
  archetype?: string;
  onNarrativeCreated?: (content: string) => void;
  onEventCreated?: (event: Partial<EventIdea>) => void;
}

export default function RealityLens({
  gameId,
  industry = 'business',
  archetype = 'company',
  onNarrativeCreated,
  onEventCreated,
}: RealityLensProps) {
  const [activeTab, setActiveTab] = useState<'enhance' | 'events'>('enhance');

  // Enhance Narrative State
  const [narrativeContent, setNarrativeContent] = useState('');
  const [enhancedResult, setEnhancedResult] = useState<EnhancedNarrative | null>(null);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  // Event Inspiration State
  const [eventType, setEventType] = useState('market disruption');
  const [eventIdeas, setEventIdeas] = useState<EventIdea[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Enhance narrative with AI
  const handleEnhance = async () => {
    if (!narrativeContent.trim() || enhanceLoading) return;

    try {
      setEnhanceLoading(true);
      setEnhanceError(null);

      const result = await enhanceNarrative(gameId, narrativeContent, industry, archetype);

      setEnhancedResult(result);
    } catch (err: any) {
      console.error('Failed to enhance narrative:', err);
      setEnhanceError(
        err.response?.data?.error ||
          'Failed to enhance narrative. Make sure Perplexity API is configured.'
      );
    } finally {
      setEnhanceLoading(false);
    }
  };

  // Get event inspiration
  const handleGetEventIdeas = async () => {
    if (eventsLoading) return;

    try {
      setEventsLoading(true);
      setEventsError(null);

      const result = await getEventInspiration(gameId, industry, eventType);

      setEventIdeas(result.ideas);
    } catch (err: any) {
      console.error('Failed to get event ideas:', err);
      setEventsError(
        err.response?.data?.error ||
          'Failed to get event ideas. Make sure Perplexity API is configured.'
      );
    } finally {
      setEventsLoading(false);
    }
  };

  const handleUseEnhanced = () => {
    if (enhancedResult && onNarrativeCreated) {
      onNarrativeCreated(enhancedResult.enhanced);
    }
  };

  const handleUseEventIdea = (idea: EventIdea) => {
    if (onEventCreated) {
      onEventCreated({
        title: idea.title,
        description: idea.description,
        suggestedImpacts: idea.suggestedImpacts,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🔮</span>
          <div>
            <h2 className="text-2xl font-bold">Reality Lens</h2>
            <p className="text-indigo-100 text-sm">
              Enhance narratives with real-world business context using AI
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setActiveTab('enhance')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'enhance'
                ? 'bg-white text-indigo-600 shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✨ Enhance Narrative
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-white text-indigo-600 shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💡 Event Inspiration
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'enhance' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Narrative Content
              </label>
              <textarea
                value={narrativeContent}
                onChange={(e) => setNarrativeContent(e.target.value)}
                placeholder="Paste or write your narrative here. The AI will enhance it with real-world business context, trends, and data..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={enhanceLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Be specific about the business situation or challenge
              </p>
            </div>

            <button
              onClick={handleEnhance}
              disabled={!narrativeContent.trim() || enhanceLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                !narrativeContent.trim() || enhanceLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {enhanceLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enhancing with AI...</span>
                </div>
              ) : (
                '✨ Enhance with Reality Lens'
              )}
            </button>

            {enhanceError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {enhanceError}
              </div>
            )}

            {enhancedResult && (
              <div className="space-y-4">
                {/* Enhanced Content */}
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-900">✅ Enhanced Narrative</h3>
                    <button
                      onClick={handleUseEnhanced}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                    >
                      Use This Version
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {enhancedResult.enhanced}
                    </p>
                  </div>
                </div>

                {/* Real-World Context */}
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📊 Real-World Context Added</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {enhancedResult.context}
                  </p>
                </div>

                {/* Sources */}
                {enhancedResult.sources.length > 0 && (
                  <div className="border border-gray-200 bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">📚 Sources</h3>
                    <div className="space-y-2">
                      {enhancedResult.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-sm"
                        >
                          <span className="text-indigo-600 font-medium">
                            [{index + 1}] {source.title}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {enhancedResult.suggestions.length > 0 && (
                  <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">💡 Suggestions</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {enhancedResult.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                disabled={eventsLoading}
              >
                <option value="market disruption">Market Disruption</option>
                <option value="supply chain">Supply Chain Event</option>
                <option value="competitive threat">Competitive Threat</option>
                <option value="regulatory change">Regulatory Change</option>
                <option value="economic shift">Economic Shift</option>
                <option value="technology innovation">Technology Innovation</option>
                <option value="crisis management">Crisis Management</option>
              </select>
            </div>

            <button
              onClick={handleGetEventIdeas}
              disabled={eventsLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                eventsLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {eventsLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Getting Ideas from Real News...</span>
                </div>
              ) : (
                '💡 Get Event Ideas from Real News'
              )}
            </button>

            {eventsError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {eventsError}
              </div>
            )}

            {eventIdeas.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Event Ideas from Real-World News
                </h3>
                {eventIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">
                          {index + 1}. {idea.title}
                        </h4>
                        <p className="text-gray-700 text-sm mb-3">{idea.description}</p>
                      </div>
                      <button
                        onClick={() => handleUseEventIdea(idea)}
                        className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm whitespace-nowrap"
                      >
                        Use This Event
                      </button>
                    </div>

                    {/* Suggested Impacts */}
                    {idea.suggestedImpacts.length > 0 && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Suggested Metric Impacts:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {idea.suggestedImpacts.map((impact, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded ${
                                impact.change >= 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {impact.metric}: {impact.change > 0 ? '+' : ''}
                              {impact.change}
                              {impact.reasoning && ` (${impact.reasoning})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {idea.sources.length > 0 && (
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Sources:</p>
                        <div className="space-y-1">
                          {idea.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              {source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        <strong>Real-World Basis:</strong> {idea.realWorldBasis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-start space-x-2 text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-medium mb-1">How Reality Lens Works</p>
            <p>
              Reality Lens uses AI to enhance your narratives with real-world business context,
              trends, and data from recent news. It helps make your scenarios more realistic and
              educational by connecting them to actual market conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
