import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Perplexity AI Service
 *
 * Integrates with Perplexity API to provide:
 * - Reality Lens: Enhance narratives with real-world business context
 * - Ask the Market: Answer student business questions with sources
 * - Event Inspiration: Help GMs create scenarios from real events
 */

// ========================================
// Types & Interfaces
// ========================================

export interface SearchOptions {
  model?: 'llama-3.1-sonar-small-128k-online' | 'llama-3.1-sonar-large-128k-online' | 'llama-3.1-sonar-huge-128k-online';
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  searchDomainFilter?: string[];
  returnImages?: boolean;
  returnRelatedQuestions?: boolean;
}

export interface SearchResult {
  content: string;
  sources: Source[];
  images?: string[];
  relatedQuestions?: string[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface RealityContext {
  trends: string[];
  news: string[];
  insights: string;
  sources: Source[];
  enhancedContent?: string;
}

export interface EnhancedNarrative {
  originalContent: string;
  enhancedContent: string;
  realWorldContext: string;
  sources: Source[];
  suggestions: string[];
}

export interface MarketQueryResult {
  question: string;
  answer: string;
  sources: Source[];
  relatedQuestions: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface EventIdea {
  title: string;
  description: string;
  suggestedImpacts: MetricImpact[];
  realWorldBasis: string;
  sources: Source[];
}

export interface MetricImpact {
  metric: string;
  change: number;
  reasoning: string;
}

export interface GameContext {
  industry: string;
  archetype: string;
  sessionNumber: number;
  currentMetrics?: any;
}

// ========================================
// Cache System
// ========================================

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// ========================================
// Perplexity Service
// ========================================

export class PerplexityService {
  private client: AxiosInstance;
  private cache: SimpleCache;
  private apiKey: string;
  private baseURL: string = 'https://api.perplexity.ai';
  private defaultModel: string = 'llama-3.1-sonar-small-128k-online';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  PERPLEXITY_API_KEY not set. AI features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    this.cache = new SimpleCache();

    // Cleanup cache every hour
    setInterval(() => {
      this.cache.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return !!this.apiKey;
  }

  /**
   * Basic search with Perplexity
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    if (!this.isEnabled()) {
      throw new Error('Perplexity API key not configured');
    }

    // Check cache first
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('✓ Cache hit for search query');
      return cached;
    }

    try {
      const response = await this.client.post('/chat/completions', {
        model: options.model || this.defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful business research assistant. Provide accurate, well-sourced information.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.2,
        top_p: options.topP || 0.9,
        search_domain_filter: options.searchDomainFilter,
        return_images: options.returnImages || false,
        return_related_questions: options.returnRelatedQuestions || false,
      });

      const result: SearchResult = {
        content: response.data.choices[0].message.content,
        sources: this.extractSources(response.data),
        images: response.data.images || [],
        relatedQuestions: response.data.related_questions || [],
        usage: response.data.usage,
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error: any) {
      console.error('Perplexity API error:', error.response?.data || error.message);
      throw new Error(`Perplexity API error: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Reality Lens: Generate real-world context for narratives
   */
  async generateRealityContext(
    industry: string,
    archetype: string,
    sessionNumber: number
  ): Promise<RealityContext> {
    if (!this.isEnabled()) {
      return this.getMockRealityContext(industry);
    }

    const cacheKey = `reality:${industry}:${archetype}:${sessionNumber}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('✓ Cache hit for reality context');
      return cached;
    }

    const query = `
      What are the current business trends, challenges, and recent news in the ${industry} industry,
      particularly relevant to a ${archetype} company? Focus on:
      1. Major industry trends (last 3-6 months)
      2. Recent significant news or events
      3. Key challenges and opportunities
      4. Competitive dynamics

      Provide 3-5 specific, actionable insights that would impact business decisions.
    `.trim();

    try {
      const searchResult = await this.search(query, {
        model: 'llama-3.1-sonar-small-128k-online',
        returnRelatedQuestions: true,
      });

      // Parse the response to extract structured data
      const result: RealityContext = {
        trends: this.extractBulletPoints(searchResult.content, 'trend'),
        news: this.extractBulletPoints(searchResult.content, 'news'),
        insights: searchResult.content,
        sources: searchResult.sources,
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating reality context:', error);
      return this.getMockRealityContext(industry);
    }
  }

  /**
   * Enhance narrative with real-world context
   */
  async enhanceNarrative(
    originalContent: string,
    industry: string,
    archetype: string
  ): Promise<EnhancedNarrative> {
    if (!this.isEnabled()) {
      return this.getMockEnhancedNarrative(originalContent);
    }

    const cacheKey = `enhance:${originalContent.substring(0, 50)}:${industry}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('✓ Cache hit for enhanced narrative');
      return cached;
    }

    const query = `
      I have a business simulation narrative for a ${archetype} company in the ${industry} industry:

      "${originalContent}"

      Please enhance this narrative by:
      1. Adding 2-3 sentences of real-world context (recent trends, news, or data)
      2. Making it feel more realistic and current
      3. Keeping the original tone and structure
      4. Providing specific, verifiable information

      Return the enhanced version and explain the real-world connections you added.
    `.trim();

    try {
      const searchResult = await this.search(query, {
        model: 'llama-3.1-sonar-large-128k-online',
        maxTokens: 1500,
      });

      // Parse enhanced content and context
      const sections = this.parseEnhancementResponse(searchResult.content);

      const result: EnhancedNarrative = {
        originalContent,
        enhancedContent: sections.enhanced || originalContent,
        realWorldContext: sections.context || '',
        sources: searchResult.sources,
        suggestions: sections.suggestions || [],
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error enhancing narrative:', error);
      return this.getMockEnhancedNarrative(originalContent);
    }
  }

  /**
   * Ask the Market: Answer student business questions
   */
  async answerBusinessQuery(
    question: string,
    gameContext?: GameContext
  ): Promise<MarketQueryResult> {
    if (!this.isEnabled()) {
      return this.getMockMarketQuery(question);
    }

    const cacheKey = `query:${question}:${gameContext?.industry || 'general'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('✓ Cache hit for market query');
      return cached;
    }

    let contextPrompt = '';
    if (gameContext) {
      contextPrompt = `
        Context: This question is from a team playing a ${gameContext.archetype} company
        in the ${gameContext.industry} industry (Session ${gameContext.sessionNumber}).
      `;
    }

    const query = `
      ${contextPrompt}

      Business Question: ${question}

      Please provide:
      1. A clear, concise answer (3-5 sentences)
      2. Specific data, examples, or case studies when possible
      3. Practical insights relevant to business decision-making
      4. Key takeaways

      Focus on accuracy and cite your sources.
    `.trim();

    try {
      const searchResult = await this.search(query, {
        model: 'llama-3.1-sonar-large-128k-online',
        returnRelatedQuestions: true,
        maxTokens: 1200,
      });

      const result: MarketQueryResult = {
        question,
        answer: searchResult.content,
        sources: searchResult.sources,
        relatedQuestions: searchResult.relatedQuestions || [],
        confidence: this.assessConfidence(searchResult),
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error answering market query:', error);
      return this.getMockMarketQuery(question);
    }
  }

  /**
   * Get event inspiration for GMs
   */
  async getEventInspiration(
    industry: string,
    eventType: string
  ): Promise<EventIdea[]> {
    if (!this.isEnabled()) {
      return this.getMockEventIdeas(industry);
    }

    const cacheKey = `events:${industry}:${eventType}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('✓ Cache hit for event inspiration');
      return cached;
    }

    const query = `
      What are 3 recent real-world events in the ${industry} industry that would make
      good business simulation scenarios (type: ${eventType})?

      For each event, provide:
      1. Event title and description
      2. How it would impact different business metrics (financial, operations, marketing, HR, customer satisfaction)
      3. The challenge or decision it presents

      Focus on events from the last 6-12 months that are well-documented.
    `.trim();

    try {
      const searchResult = await this.search(query, {
        model: 'llama-3.1-sonar-large-128k-online',
        maxTokens: 2000,
      });

      const ideas = this.parseEventIdeas(searchResult.content, searchResult.sources);

      this.cache.set(cacheKey, ideas);
      return ideas;
    } catch (error) {
      console.error('Error getting event inspiration:', error);
      return this.getMockEventIdeas(industry);
    }
  }

  // ========================================
  // Helper Methods
  // ========================================

  private extractSources(apiResponse: any): Source[] {
    const citations = apiResponse.citations || [];
    return citations.map((citation: string, index: number) => ({
      title: `Source ${index + 1}`,
      url: citation,
      snippet: '',
    }));
  }

  private extractBulletPoints(content: string, keyword: string): string[] {
    // Simple extraction - look for numbered or bulleted lists
    const lines = content.split('\n');
    const points: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[\d\*\-•]\./)) {
        points.push(trimmed.replace(/^[\d\*\-•]\.\s*/, ''));
      }
    }

    return points.slice(0, 5); // Return up to 5 points
  }

  private parseEnhancementResponse(content: string): {
    enhanced: string;
    context: string;
    suggestions: string[];
  } {
    // Simple parsing - in production, use more sophisticated NLP
    const sections = content.split('\n\n');

    return {
      enhanced: sections[0] || content,
      context: sections[1] || '',
      suggestions: this.extractBulletPoints(content, 'suggestion'),
    };
  }

  private assessConfidence(result: SearchResult): 'high' | 'medium' | 'low' {
    const sourceCount = result.sources.length;
    const hasRelatedQuestions = (result.relatedQuestions?.length || 0) > 0;

    if (sourceCount >= 3 && hasRelatedQuestions) {
      return 'high';
    } else if (sourceCount >= 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private parseEventIdeas(content: string, sources: Source[]): EventIdea[] {
    // Simple parsing - split by numbered sections
    const sections = content.split(/\d+\.\s+/).filter(s => s.trim());

    return sections.slice(0, 3).map((section, index) => {
      const lines = section.split('\n').filter(l => l.trim());
      const title = lines[0] || `Event Idea ${index + 1}`;
      const description = lines.slice(1, 3).join(' ');

      return {
        title,
        description,
        suggestedImpacts: this.extractMetricImpacts(section),
        realWorldBasis: description,
        sources: sources.slice(0, 2),
      };
    });
  }

  private extractMetricImpacts(text: string): MetricImpact[] {
    // Default impacts - in production, parse from AI response
    return [
      {
        metric: 'financial',
        change: -10,
        reasoning: 'Based on market conditions',
      },
      {
        metric: 'operations',
        change: -5,
        reasoning: 'Operational disruption',
      },
    ];
  }

  // ========================================
  // Mock Data (for testing without API key)
  // ========================================

  private getMockRealityContext(industry: string): RealityContext {
    return {
      trends: [
        `${industry} market experiencing digital transformation`,
        'Increased focus on sustainability and ESG',
        'Supply chain resilience becoming critical',
      ],
      news: [
        'Major merger announced in the sector',
        'Regulatory changes affecting operations',
      ],
      insights: `The ${industry} industry is currently navigating several key trends including digital transformation, sustainability initiatives, and supply chain challenges.`,
      sources: [
        { title: 'Industry Report 2024', url: 'https://example.com/report' },
      ],
    };
  }

  private getMockEnhancedNarrative(original: string): EnhancedNarrative {
    return {
      originalContent: original,
      enhancedContent: original + ' [Real-world context would be added here with API key]',
      realWorldContext: 'Real-world context requires Perplexity API key.',
      sources: [],
      suggestions: ['Add more specific data', 'Reference recent events'],
    };
  }

  private getMockMarketQuery(question: string): MarketQueryResult {
    return {
      question,
      answer: 'This is a mock response. Configure PERPLEXITY_API_KEY to get real answers.',
      sources: [],
      relatedQuestions: [],
      confidence: 'low',
    };
  }

  private getMockEventIdeas(industry: string): EventIdea[] {
    return [
      {
        title: `Sample ${industry} Event`,
        description: 'This is a mock event idea. Configure PERPLEXITY_API_KEY for real suggestions.',
        suggestedImpacts: [
          { metric: 'financial', change: -10, reasoning: 'Market impact' },
        ],
        realWorldBasis: 'Mock event for testing',
        sources: [],
      },
    ];
  }

  // ========================================
  // Cache Management
  // ========================================

  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const perplexityService = new PerplexityService();
export default perplexityService;
