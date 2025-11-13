# 🌐 Perplexity AI Integration - Technical Specification

**Feature Set:** Reality Lens + Ask the Market
**Priority:** Phase 3B - High Impact Learning Enhancement
**Estimated Effort:** 45-65 hours
**Target Completion:** Week 7-8 of Phase 3B

---

## 🎯 Overview

Two AI-powered features that connect the simulation to the real business world:

1. **Reality Lens** - Auto-enhance narratives with current business news and trends
2. **Ask the Market** - Student research assistant for real-world business questions

---

## 📊 Database Schema

### New Table: `perplexity_usage`

Tracks API usage and rate limiting:

```sql
CREATE TABLE perplexity_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NULL,  -- NULL for GM queries
    query_type VARCHAR(20) NOT NULL CHECK (query_type IN ('reality_lens', 'market_query', 'event_inspiration')),
    query_text TEXT NOT NULL,
    response_data JSONB,  -- Store full response for caching/history
    sources JSONB,  -- Array of source citations
    credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_perplexity_game ON perplexity_usage(game_id);
CREATE INDEX idx_perplexity_team ON perplexity_usage(team_id);
CREATE INDEX idx_perplexity_created ON perplexity_usage(created_at);
```

### Enhanced Table: `games`

Add AI feature settings:

```sql
ALTER TABLE games ADD COLUMN reality_lens_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE games ADD COLUMN reality_lens_frequency VARCHAR(20) DEFAULT 'session'
  CHECK (reality_lens_frequency IN ('session', 'weekly', 'manual'));
ALTER TABLE games ADD COLUMN market_query_credits INTEGER DEFAULT 3;  -- Per team per session
```

### Enhanced Table: `narratives`

Add metadata for AI-enhanced content:

```sql
ALTER TABLE narratives ADD COLUMN ai_enhanced BOOLEAN DEFAULT FALSE;
ALTER TABLE narratives ADD COLUMN ai_sources JSONB;  -- Perplexity source citations
ALTER TABLE narratives ADD COLUMN original_content TEXT;  -- Before AI enhancement
```

---

## 🔌 API Endpoints

### 1. Reality Lens Endpoints

#### Enhance Narrative with Real-World Context
```typescript
POST /api/gm/games/:gameId/enhance-narrative
Authorization: Bearer {gmToken}

Request Body:
{
  content: string,           // Original narrative text
  industry: string,          // From game scenario
  archetype: string,         // From game scenario
  sessionNumber: number,     // Current session
  type: 'briefing' | 'news' | 'email'
}

Response:
{
  enhanced_content: string,  // AI-enhanced version
  sources: Array<{
    title: string,
    url: string,
    snippet: string,
    published_date: string
  }>,
  original_content: string,
  credits_used: number
}
```

#### Get Reality Context for Session
```typescript
GET /api/gm/games/:gameId/sessions/:sessionId/reality-context
Authorization: Bearer {gmToken}

Response:
{
  industry_trends: string[],
  relevant_news: Array<{
    headline: string,
    summary: string,
    source: string,
    url: string
  }>,
  suggested_themes: string[],
  last_updated: timestamp
}
```

### 2. Ask the Market Endpoints

#### Submit Market Query (Student)
```typescript
POST /api/teams/:teamId/market-query
Authorization: Bearer {teamToken}

Request Body:
{
  question: string,          // Max 500 characters
  context?: string           // Optional game context
}

Response:
{
  question: string,
  answer: string,            // AI-synthesized response
  sources: Array<{
    title: string,
    url: string,
    relevance_score: number
  }>,
  suggested_actions: Array<{
    action: string,
    game_metric: string,      // Which metric to focus on
    rationale: string
  }>,
  credits_used: number,
  credits_remaining: number
}

Error Response (rate limited):
{
  error: "Query limit reached",
  credits_remaining: 0,
  next_refill: timestamp
}
```

#### Get Query History (Team)
```typescript
GET /api/teams/:teamId/market-queries?limit=10
Authorization: Bearer {teamToken}

Response:
{
  queries: Array<{
    id: uuid,
    question: string,
    answer: string,
    sources: Source[],
    created_at: timestamp
  }>,
  total_queries: number,
  credits_remaining: number
}
```

#### Get Usage Analytics (GM)
```typescript
GET /api/gm/games/:gameId/perplexity-usage
Authorization: Bearer {gmToken}

Response:
{
  total_queries: number,
  queries_by_team: Array<{
    team_id: uuid,
    team_name: string,
    query_count: number,
    recent_questions: string[]
  }>,
  most_common_topics: string[],
  total_credits_used: number
}
```

---

## 🏗️ Backend Architecture

### PerplexityService Class

```typescript
// backend/src/services/perplexity.service.ts

import axios from 'axios';
import NodeCache from 'node-cache';

export class PerplexityService {
  private apiKey: string;
  private baseURL = 'https://api.perplexity.ai';
  private cache: NodeCache;

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.cache = new NodeCache({ stdTTL: 86400 }); // 24-hour cache
  }

  /**
   * Search for business information
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const cacheKey = `search:${query}`;
    const cached = this.cache.get<SearchResult>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a business research assistant. Provide concise, factual information with sources.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,  // More factual, less creative
        max_tokens: options?.maxTokens || 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = {
        answer: response.data.choices[0].message.content,
        sources: response.data.citations || [],
        timestamp: new Date()
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Perplexity API Error:', error);
      throw new Error('Failed to fetch market data');
    }
  }

  /**
   * Generate reality context for a narrative
   */
  async generateRealityContext(
    industry: string,
    archetype: string,
    sessionNumber: number
  ): Promise<RealityContext> {
    const query = `What are the current business trends, challenges, and recent news
                   affecting ${archetype} companies in the ${industry} industry?
                   Focus on developments from the last 30 days. Be specific and cite sources.`;

    const result = await this.search(query, { maxTokens: 800 });

    return {
      context: result.answer,
      sources: result.sources.map(s => ({
        title: s.title,
        url: s.url,
        snippet: s.snippet || '',
        publishedDate: s.published_date
      })),
      generatedAt: new Date()
    };
  }

  /**
   * Enhance narrative with real-world context
   */
  async enhanceNarrative(
    originalContent: string,
    industry: string,
    archetype: string
  ): Promise<EnhancedNarrative> {
    const context = await this.generateRealityContext(industry, archetype, 0);

    const enhancementPrompt = `Given this game narrative:
"${originalContent}"

And these real-world business developments in ${industry}:
${context.context}

Enhance the narrative by weaving in relevant real-world context.
Maintain the original tone and structure, but add 1-2 sentences
referencing current market conditions. Keep it natural and educational.`;

    const enhanced = await this.search(enhancementPrompt, { maxTokens: 500 });

    return {
      enhancedContent: enhanced.answer,
      originalContent,
      sources: context.sources,
      aiEnhanced: true
    };
  }

  /**
   * Answer business question for students
   */
  async answerBusinessQuery(
    question: string,
    gameContext?: GameContext
  ): Promise<MarketQueryResult> {
    const contextualQuery = gameContext
      ? `Context: I'm running a ${gameContext.archetype} company in the ${gameContext.industry} industry.
         Question: ${question}

         Provide a practical answer with recent examples and cite sources.`
      : question;

    const result = await this.search(contextualQuery, { maxTokens: 1200 });

    // Parse answer to suggest in-game actions
    const suggestedActions = this.extractGameActions(result.answer, gameContext);

    return {
      question,
      answer: result.answer,
      sources: result.sources.map(s => ({
        title: s.title,
        url: s.url,
        relevanceScore: this.calculateRelevance(s, question)
      })),
      suggestedActions,
      timestamp: new Date()
    };
  }

  /**
   * Get inspiration for GM events from real news
   */
  async getEventInspiration(
    industry: string,
    eventType: string
  ): Promise<EventIdea[]> {
    const query = `Recent ${eventType} events affecting ${industry} companies.
                   Include specific examples from the last 60 days with sources.`;

    const result = await this.search(query, { maxTokens: 800 });

    // Parse result into structured event ideas
    return this.parseEventIdeas(result.answer, result.sources);
  }

  // Helper methods
  private extractGameActions(answer: string, context?: GameContext): SuggestedAction[] {
    // Simple keyword matching - can be enhanced with NLP
    const actions: SuggestedAction[] = [];

    if (answer.toLowerCase().includes('marketing') || answer.toLowerCase().includes('brand')) {
      actions.push({
        action: 'Increase marketing investment',
        gameMetric: 'marketing',
        rationale: 'Based on market research suggesting marketing focus'
      });
    }

    if (answer.toLowerCase().includes('customer') || answer.toLowerCase().includes('satisfaction')) {
      actions.push({
        action: 'Focus on customer experience',
        gameMetric: 'customer_satisfaction',
        rationale: 'Industry trends emphasize customer retention'
      });
    }

    // Add more pattern matching...

    return actions.slice(0, 3); // Top 3 suggestions
  }

  private calculateRelevance(source: any, question: string): number {
    // Simple relevance scoring - can be enhanced
    const questionWords = question.toLowerCase().split(' ');
    const sourceText = (source.title + ' ' + source.snippet).toLowerCase();

    let matches = 0;
    questionWords.forEach(word => {
      if (word.length > 3 && sourceText.includes(word)) {
        matches++;
      }
    });

    return Math.min(matches / questionWords.length, 1.0);
  }

  private parseEventIdeas(answer: string, sources: any[]): EventIdea[] {
    // Parse AI response into structured events
    // This is simplified - real implementation would use better parsing
    return [{
      title: 'Market Event',
      description: answer.substring(0, 500),
      suggestedImpacts: [
        { metric: 'operations', change: -10 }
      ],
      sources: sources.slice(0, 2)
    }];
  }
}

// TypeScript Interfaces
interface SearchOptions {
  maxTokens?: number;
  temperature?: number;
}

interface SearchResult {
  answer: string;
  sources: any[];
  timestamp: Date;
}

interface RealityContext {
  context: string;
  sources: Source[];
  generatedAt: Date;
}

interface EnhancedNarrative {
  enhancedContent: string;
  originalContent: string;
  sources: Source[];
  aiEnhanced: boolean;
}

interface MarketQueryResult {
  question: string;
  answer: string;
  sources: SourceWithRelevance[];
  suggestedActions: SuggestedAction[];
  timestamp: Date;
}

interface SuggestedAction {
  action: string;
  gameMetric: string;
  rationale: string;
}

interface Source {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

interface SourceWithRelevance extends Source {
  relevanceScore: number;
}

interface GameContext {
  archetype: string;
  industry: string;
  companyName?: string;
}

interface EventIdea {
  title: string;
  description: string;
  suggestedImpacts: Array<{metric: string, change: number}>;
  sources: Source[];
}
```

---

## 💰 Cost Management & Rate Limiting

### Pricing Tiers
```typescript
const PRICING_TIERS = {
  FREE: {
    monthlyCost: 0,
    queriesPerGame: 10,        // Only session briefings
    teamQueries: 0,
    cacheEnabled: true
  },
  PRO: {
    monthlyCost: 50,
    queriesPerGame: 50,
    teamQueries: 3,              // Per team per session
    cacheEnabled: true
  },
  ENTERPRISE: {
    monthlyCost: 200,
    queriesPerGame: Infinity,
    teamQueries: 10,
    cacheEnabled: true
  }
};
```

### Rate Limiting Implementation
```typescript
export class RateLimiter {
  async checkTeamQueryLimit(teamId: string, gameId: string): Promise<boolean> {
    const game = await GameModel.findById(gameId);
    const currentSession = await SessionModel.getCurrentSession(gameId);

    // Count queries for this team in current session
    const queryCount = await query(
      `SELECT COUNT(*) FROM perplexity_usage
       WHERE team_id = $1
       AND query_type = 'market_query'
       AND created_at >= $2`,
      [teamId, currentSession.unlocked_at]
    );

    return queryCount.rows[0].count < game.market_query_credits;
  }

  async getRemainingCredits(teamId: string, gameId: string): Promise<number> {
    // Similar logic to calculate remaining credits
  }
}
```

---

## 🎨 Frontend Components

### GM Dashboard

#### RealityLensToggle.tsx
```typescript
interface RealityLensToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onPreview: () => void;
}

export function RealityLensToggle({ enabled, onToggle, onPreview }: RealityLensToggleProps) {
  return (
    <div className="flex items-center space-x-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="toggle"
        />
        <span>🌐 Enhance with Reality Lens</span>
      </label>
      {enabled && (
        <button onClick={onPreview} className="btn-secondary">
          Preview Enhancement
        </button>
      )}
    </div>
  );
}
```

### Team Player Dashboard

#### MarketQueryPanel.tsx
```typescript
export function MarketQueryPanel({ teamId, gameId }: Props) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketQueryResult | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState(3);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/api/teams/${teamId}/market-query`, {
        question
      });

      setResult(response.data);
      setCreditsRemaining(response.data.credits_remaining);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Query limit reached. More credits available next session!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="market-query-panel">
      <div className="header">
        <h3>💡 Ask the Market</h3>
        <div className="credits">
          <span>{creditsRemaining}/5 queries remaining</span>
        </div>
      </div>

      <div className="query-input">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a business question... (e.g., What should we do when customer satisfaction is low?)"
          maxLength={500}
          rows={3}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || creditsRemaining === 0}
          className="btn-primary"
        >
          {loading ? 'Researching...' : 'Ask Market'}
        </button>
      </div>

      {result && (
        <MarketQueryResult result={result} />
      )}
    </div>
  );
}
```

---

## ✅ Success Metrics

**Engagement:**
- 60%+ of teams use "Ask the Market" at least once
- 40%+ of GMs enable Reality Lens
- Average 2-3 queries per team per game

**Learning:**
- Student surveys show increased connection to real business world
- 70%+ of students find AI features "helpful" or "very helpful"

**Technical:**
- API response time < 3 seconds (90th percentile)
- Cache hit rate > 40%
- API costs < $100/month for 10 games

---

## 🚨 Risk Mitigation

**Risk: High API Costs**
- Mitigation: Aggressive caching, rate limiting, tiered pricing

**Risk: API Downtime**
- Mitigation: Fallback to cached results, graceful degradation

**Risk: Inappropriate Content**
- Mitigation: Content filtering, GM review option, report feature

**Risk: Students Game the System**
- Mitigation: Query limits, question quality scoring, GM visibility

---

## 📚 Environment Variables

```bash
# .env
PERPLEXITY_API_KEY=your_api_key_here
PERPLEXITY_MODEL=llama-3.1-sonar-small-128k-online
PERPLEXITY_MAX_TOKENS=1200
PERPLEXITY_CACHE_TTL=86400  # 24 hours in seconds

# Optional
PERPLEXITY_TIMEOUT=10000  # 10 seconds
PERPLEXITY_RETRY_ATTEMPTS=2
```

---

**Status:** Ready for implementation - Week 5 of Phase 3B
**Dependencies:** Narrative system backend (Week 5 Days 1-3)
**Estimated Completion:** Week 7-8 with full testing
