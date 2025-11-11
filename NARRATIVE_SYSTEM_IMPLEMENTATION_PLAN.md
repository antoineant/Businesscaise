# 📖 Narrative/Storytelling System - Implementation Plan

**Status:** Draft for Review
**Date:** November 11, 2025
**Priority:** Phase 3 - Essential for Immersive Learning Experience

---

## 🎯 Executive Summary

The Narrative System transforms the business simulation from a dry metrics game into an immersive story-driven learning experience. Students don't just make decisions—they experience the consequences through news articles, emails from stakeholders, and evolving storylines that react to their choices.

**Core Value Proposition:**
- **Engagement**: Story-driven gameplay keeps students invested
- **Context**: Real-world scenarios make learning memorable
- **Feedback**: Narrative consequences complement numerical scores
- **Immersion**: Students feel they're running a real company

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     NARRATIVE SYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Morning    │  │  News Feed   │  │   Emails     │     │
│  │  Briefings   │  │  (Timeline)  │  │  (Inbox)     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │   Narrative    │                       │
│                    │    Engine      │                       │
│                    └───────┬────────┘                       │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│  ┌──────▼────────┐  ┌─────▼──────┐  ┌───────▼──────┐     │
│  │  Templates    │  │  Characters│  │   Events      │     │
│  │  Library      │  │   (NPCs)   │  │  Triggers     │     │
│  └───────────────┘  └────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Components Breakdown

#### 1. **Morning Briefings** (Session Narratives)
- **Purpose**: Set the stage for each session with context and objectives
- **Format**: 2-3 paragraphs of story context
- **Delivery**: Displayed when team views current session
- **Example**: "Week 2 - Monday Morning: Your marketing campaign from last week has started showing results. The local newspaper is calling, and your inbox is flooded with customer inquiries..."

#### 2. **News Feed** (Dynamic Story Events)
- **Purpose**: Show how decisions impact the world
- **Format**: News articles, press releases, social media posts
- **Delivery**: Timeline view in Team Dashboard
- **Example**: "LOCAL STARTUP GAINS TRACTION - [Team Name]'s innovative approach catches investor attention after strategic marketing push"

#### 3. **Emails** (Stakeholder Communications)
- **Purpose**: Personal feedback from NPCs (investors, customers, employees)
- **Format**: Email-style messages from characters
- **Delivery**: Inbox view with unread indicators
- **Example**: "From: Sarah Chen, Lead Investor - Subject: Concerns about Q1 financials..."

#### 4. **GM Events** (Custom Story Injections)
- **Purpose**: Allow GM to inject plot twists and scenarios
- **Format**: Custom events with optional metric impacts
- **Delivery**: Appears as breaking news or urgent email
- **Example**: "BREAKING: Supply chain disruption affects all companies in sector"

---

## 📊 Database Schema (Already Created)

### Narratives Table
```sql
CREATE TABLE narratives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('briefing', 'news', 'email', 'alert')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100),  -- NPC name or "System"
    target_teams UUID[],  -- NULL = all teams, or specific team IDs
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Type Definitions:**
- `briefing`: Morning/session briefings (linked to session)
- `news`: News articles and press releases
- `email`: Messages from NPCs/stakeholders
- `alert`: System alerts and breaking news

### GM Events Table
```sql
CREATE TABLE gm_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,  -- 'market_shift', 'competitor_action', 'crisis', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    impacts JSONB DEFAULT '[]',  -- Metric impacts [{metric: 'financial', change: -5}]
    target_teams UUID[],  -- NULL = all teams
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table (Enhanced)
```sql
-- Already has narrative field
sessions (
    ...
    narrative TEXT NULL,  -- Morning briefing content
    ...
)
```

---

## 🔌 API Implementation Plan

### Backend API Endpoints

#### 1. GM Narrative Management

**Create Narrative**
```typescript
POST /api/gm/games/:id/narratives
Body: {
  type: 'briefing' | 'news' | 'email' | 'alert',
  title: string,
  content: string,
  author?: string,
  session_id?: uuid,  // For briefings
  target_teams?: uuid[]  // NULL = all teams
}
Response: { narrative: Narrative }
```

**List Narratives**
```typescript
GET /api/gm/games/:id/narratives?type=news&session_id=xxx
Response: { narratives: Narrative[] }
```

**Update Narrative**
```typescript
PUT /api/gm/narratives/:id
Body: { title?, content?, published_at? }
Response: { narrative: Narrative }
```

**Delete Narrative**
```typescript
DELETE /api/gm/narratives/:id
Response: { message: 'Narrative deleted' }
```

#### 2. GM Event Management

**Create Event**
```typescript
POST /api/gm/games/:id/events
Body: {
  event_type: string,
  title: string,
  description: string,
  impacts?: [{metric: string, change: number}],
  target_teams?: uuid[],
  auto_generate_narrative?: boolean  // Create news article automatically
}
Response: { event: GMEvent, narrative?: Narrative }
```

**List Events**
```typescript
GET /api/gm/games/:id/events
Response: { events: GMEvent[] }
```

#### 3. Team Narrative Viewing

**Get Team Narratives** (Feed View)
```typescript
GET /api/teams/:teamId/narratives?type=news,email
Response: {
  narratives: Narrative[],  // Filtered by target_teams
  unread_count: number
}
```

**Get Session Briefing**
```typescript
GET /api/teams/:teamId/sessions/:sessionId/briefing
Response: {
  briefing: string,  // From sessions.narrative
  narratives: Narrative[]  // Associated news/emails for this session
}
```

**Mark Narrative as Read**
```typescript
POST /api/teams/:teamId/narratives/:id/read
Response: { message: 'Marked as read' }
```

---

## 🎨 Frontend Components

### GM Dashboard

#### 1. **Narratives Management Page** (`NarrativesPage.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [← Back to Game]   Narratives & Story              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [📝 Create Narrative]  [📰 Create Event]          │
│                                                      │
│  Tabs: [All] [Briefings] [News] [Emails] [Alerts]  │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 📰 Market Update - Session 3                │    │
│  │ Published: Nov 11, 9:00 AM                  │    │
│  │ Teams: All | Type: News                     │    │
│  │ [Edit] [Delete]                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ ✉️  Investor Email - Sarah Chen             │    │
│  │ Published: Nov 11, 8:00 AM                  │    │
│  │ Teams: Team Alpha | Type: Email             │    │
│  │ [Edit] [Delete]                             │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Features:**
- List all narratives with filters
- Create/edit/delete narratives
- Preview how teams will see it
- Bulk actions (send to all teams)
- Template library for common scenarios

#### 2. **Create Narrative Modal** (`CreateNarrativeModal.tsx`)

```
┌─────────────────────────────────────────────────────┐
│  Create Narrative                            [✕]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Type: [v] News Article                             │
│                                                      │
│  Title: ___________________________________         │
│                                                      │
│  Author: _____________________ (e.g., Tech Daily)   │
│                                                      │
│  Content: (Rich text editor)                        │
│  ┌────────────────────────────────────────────┐    │
│  │                                             │    │
│  │ [B] [I] [Link] [Image]                     │    │
│  │                                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Target Teams:                                      │
│  ○ All Teams                                        │
│  ○ Specific Teams: [Select teams...]               │
│                                                      │
│  Linked to Session: [v] Session 3 - Wed PM         │
│                                                      │
│  [Preview] [Cancel] [Publish]                       │
└─────────────────────────────────────────────────────┘
```

#### 3. **Narrative Template Library** (`TemplateLibrary.tsx`)

**Pre-built Templates:**
- ✅ Positive investor reaction (high financial score)
- ✅ Negative press coverage (low customer satisfaction)
- ✅ Employee morale boost (good HR decisions)
- ✅ Competitor pressure (market shift event)
- ✅ Customer testimonial (positive feedback)
- ✅ Crisis scenario (GM event trigger)

#### 4. **Event Creation Modal** (`CreateEventModal.tsx`)

```
┌─────────────────────────────────────────────────────┐
│  Inject Game Event                           [✕]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Event Type: [v] Market Shift                       │
│                                                      │
│  Title: Supply Chain Disruption                     │
│                                                      │
│  Description:                                        │
│  ┌────────────────────────────────────────────┐    │
│  │ A global shortage of raw materials...      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Metric Impacts:                                    │
│  ┌────────────────────────────────────────────┐    │
│  │ Operations:        [-10] ▼                  │    │
│  │ Financial:         [-5]  ▼                  │    │
│  │ [+ Add Impact]                              │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ☑ Auto-generate news article                      │
│                                                      │
│  Target: ○ All Teams  ○ Specific Teams              │
│                                                      │
│  [Cancel] [Apply Event]                             │
└─────────────────────────────────────────────────────┘
```

### Team Player Frontend

#### 1. **News Feed Tab** (`NewsFeedTab.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Dashboard] [Current Challenge] [📰 News] [📊...]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Latest News & Updates                              │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 🔴 BREAKING NEWS                            │    │
│  │ Supply Chain Disruption Hits Sector        │    │
│  │ System Alert • Just now                     │    │
│  │                                             │    │
│  │ A global shortage of raw materials has     │    │
│  │ impacted operations across the industry...  │    │
│  │                                             │    │
│  │ Impact: Operations -10, Financial -5        │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 📰 Market Update                            │    │
│  │ Local Startups Gain Investor Attention     │    │
│  │ Tech Daily • 2 hours ago                    │    │
│  │                                             │    │
│  │ Several local companies, including your    │    │
│  │ team, have caught the eye of venture...    │    │
│  │                                             │    │
│  │ [Read More]                                 │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

#### 2. **Email Inbox Tab** (`InboxTab.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Dashboard] [Current Challenge] [News] [✉️ Inbox(3)]│
├─────────────────────────────────────────────────────┤
│                                                      │
│  Inbox                          [⚙️ Settings]       │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ ● Sarah Chen                         2h ago │    │
│  │   Lead Investor                             │    │
│  │   Concerns about Q1 financials              │    │
│  │                                             │    │
│  │   I've reviewed your latest report and...   │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │   Mark Rodriguez                    1d ago  │    │
│  │   HR Manager                                │    │
│  │   Team morale update                        │    │
│  │                                             │    │
│  │   Great news! The recent team building...   │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │   Emma Thompson                     2d ago  │    │
│  │   Customer                                  │    │
│  │   Feedback on your product                  │    │
│  │                                             │    │
│  │   I recently purchased your product and...  │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

#### 3. **Session Briefing** (Enhanced Session View)

**Current Session Card - Enhanced:**
```
┌─────────────────────────────────────────────────────┐
│  Current Session: Week 2 - Monday Morning           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📖 Morning Briefing:                               │
│                                                      │
│  Your marketing campaign from last week has started │
│  showing results. The local newspaper called for an │
│  interview, and your inbox is flooded with customer │
│  inquiries. Your investors are pleased but want to  │
│  see sustained growth. Today's challenge: How will  │
│  you allocate resources to maintain momentum while  │
│  keeping operations stable?                         │
│                                                      │
│  Deadline: Nov 13, 11:59 PM                         │
│  Status: Active                                     │
│                                                      │
│  [View Challenge]                                   │
└─────────────────────────────────────────────────────┘
```

---

## 🤖 Narrative Generation Engine

### Dynamic Content System

**Template Variables:**
```typescript
interface NarrativeContext {
  team_name: string;
  team_score: number;
  session_number: number;
  metrics: {
    financial: number;
    hr: number;
    operations: number;
    marketing: number;
    customer_sat: number;
  };
  recent_submissions: Submission[];
  rank: number;
  total_teams: number;
}
```

**Template Example:**
```typescript
const templates = {
  high_score_news: {
    title: "{{team_name}} Shows Strong Performance",
    content: `Local startup {{team_name}} continues to impress with a score of {{team_score}},
    placing them {{rank}} out of {{total_teams}} in the competitive landscape. Industry analysts
    point to their {{strongest_metric}} as a key differentiator.`,
    conditions: { team_score: { min: 70 } }
  },
  low_score_email: {
    title: "Investor Concerns",
    author: "Sarah Chen, Lead Investor",
    content: `Hi team, I've been reviewing the latest numbers and I'm concerned about our
    {{weakest_metric}} performance. Let's schedule a call to discuss how we can course-correct.`,
    conditions: { team_score: { max: 50 } }
  }
};
```

### Auto-Generation Triggers

**When to Auto-Generate:**
1. **Session Unlock**: Create morning briefing
2. **Submission Scored**: Generate feedback email from NPC
3. **Metric Threshold**: Trigger news when team crosses threshold
4. **Rank Change**: Notify about leaderboard position changes
5. **GM Event**: Create corresponding news article

**Implementation:**
```typescript
// backend/src/services/narrative.service.ts
export class NarrativeService {
  static async autoGenerateForSession(sessionId: string, gameId: string) {
    const session = await SessionModel.findById(sessionId);
    const template = templates.session_briefings[session.session_number];

    // Generate narrative from template
    const narrative = await NarrativeModel.create({
      game_id: gameId,
      session_id: sessionId,
      type: 'briefing',
      title: template.title,
      content: renderTemplate(template.content, context),
      author: 'System'
    });

    return narrative;
  }

  static async autoGenerateForScore(submission: Submission, team: Team) {
    const score = submission.score;
    const template = selectTemplate(score, team.metrics);

    const narrative = await NarrativeModel.create({
      game_id: team.game_id,
      type: 'email',
      title: renderTemplate(template.title, { team, score }),
      content: renderTemplate(template.content, { team, score }),
      author: template.author,
      target_teams: [team.id]
    });

    return narrative;
  }
}
```

---

## 📝 NPC Character System

### Character Definitions

**Core Characters:**

```typescript
interface NPC {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  personality: 'supportive' | 'critical' | 'neutral';
  email_signature: string;
}

const NPCs = {
  sarah_chen: {
    id: 'sarah_chen',
    name: 'Sarah Chen',
    role: 'Lead Investor',
    personality: 'critical',
    email_signature: 'Sarah Chen\nLead Investor\nVenture Capital Partners'
  },
  mark_rodriguez: {
    id: 'mark_rodriguez',
    name: 'Mark Rodriguez',
    role: 'HR Manager',
    personality: 'supportive',
    email_signature: 'Mark Rodriguez\nHR Manager\nYour Company'
  },
  emma_thompson: {
    id: 'emma_thompson',
    name: 'Emma Thompson',
    role: 'Key Customer',
    personality: 'neutral',
    email_signature: 'Emma Thompson\nCustomer'
  },
  alex_kim: {
    id: 'alex_kim',
    name: 'Alex Kim',
    role: 'Operations Director',
    personality: 'critical',
    email_signature: 'Alex Kim\nOperations Director'
  }
};
```

**Character Response Patterns:**
- Sarah Chen → Emails about financial performance, investment concerns
- Mark Rodriguez → Emails about team morale, HR metrics
- Emma Thompson → Emails about customer satisfaction, product feedback
- Alex Kim → Emails about operations, efficiency

---

## 🔄 Integration with Existing Systems

### 1. Scoring Integration

**When GM scores a submission:**
```typescript
// backend/src/controllers/gm.controller.ts
export const scoreSubmission = asyncHandler(async (req, res) => {
  // ... existing scoring logic ...

  // NEW: Auto-generate narrative feedback
  const narrative = await NarrativeService.autoGenerateForScore(
    submission,
    team,
    score,
    feedback
  );

  // Notify team via WebSocket
  socketHandler.notifyNarrativeReceived(team.id, narrative);

  res.json({ submission, narrative });
});
```

### 2. Session Unlock Integration

**When GM unlocks a session:**
```typescript
// backend/src/controllers/gm.controller.ts
export const unlockSession = asyncHandler(async (req, res) => {
  // ... existing unlock logic ...

  // NEW: Auto-generate morning briefing if not exists
  if (!session.narrative) {
    const briefing = await NarrativeService.generateSessionBriefing(
      session,
      gameId
    );
    await SessionModel.update(sessionId, { narrative: briefing });
  }

  res.json({ session });
});
```

### 3. WebSocket Events

**New WebSocket Events:**
```typescript
// Client subscribes to narratives
socket.on('narrative:new', (narrative) => {
  // Show notification
  // Update feed/inbox
  // Increment unread count
});

socket.on('event:triggered', (event) => {
  // Show breaking news alert
  // Apply metric impacts
  // Update dashboard
});
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// backend/src/services/narrative.service.test.ts
describe('NarrativeService', () => {
  it('should generate session briefing from template', async () => {
    const narrative = await NarrativeService.generateSessionBriefing(session, game);
    expect(narrative.type).toBe('briefing');
    expect(narrative.content).toContain(session.title);
  });

  it('should select appropriate template based on score', () => {
    const highScoreTemplate = selectTemplate(85, metrics);
    expect(highScoreTemplate.type).toBe('positive_feedback');

    const lowScoreTemplate = selectTemplate(35, metrics);
    expect(lowScoreTemplate.type).toBe('investor_concern');
  });
});
```

### E2E Tests

```typescript
// e2e/narrative-system.spec.ts
test('should display morning briefing when session is unlocked', async ({ page }) => {
  // GM unlocks session
  await unlockSession(gameId, sessionId);

  // Team views current session
  await page.goto('/game');
  await page.click('[data-testid="current-session"]');

  // Verify briefing is visible
  await expect(page.getByText(/morning briefing/i)).toBeVisible();
});

test('should show news feed with narratives', async ({ page }) => {
  // Navigate to news tab
  await page.click('[data-testid="news-tab"]');

  // Verify narratives appear
  await expect(page.getByText('Market Update')).toBeVisible();
});

test('should receive email notification when scored', async ({ page }) => {
  // GM scores submission
  await scoreSubmission(submissionId, 75, 'Good work!');

  // Team sees inbox notification
  await expect(page.getByText(/inbox.*1/i)).toBeVisible();
});
```

---

## 📅 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
**Goal:** Database models and basic API

- ✅ Database tables already exist
- ⬜ Create `NarrativeModel` (CRUD operations)
- ⬜ Create `GMEventModel` (CRUD operations)
- ⬜ Implement GM API endpoints (create, list, update, delete narratives)
- ⬜ Implement Team API endpoints (get narratives, mark as read)
- ⬜ Add WebSocket events for narrative notifications

**Deliverables:**
- Narrative CRUD API functional
- GM can create/edit/delete narratives via API
- Teams can fetch narratives via API

### Phase 2: GM Dashboard UI (Week 2)
**Goal:** GM can create and manage narratives

- ⬜ Create `NarrativesPage.tsx` (list view with filters)
- ⬜ Create `CreateNarrativeModal.tsx` (creation form)
- ⬜ Create `EditNarrativeModal.tsx` (edit form)
- ⬜ Create `CreateEventModal.tsx` (event injection)
- ⬜ Add navigation to narratives page from GameDetailsPage
- ⬜ Implement rich text editor for content
- ⬜ Add preview functionality

**Deliverables:**
- GM can create briefings, news, emails, alerts
- GM can inject events with metric impacts
- GM can target specific teams or all teams

### Phase 3: Team Player UI (Week 2-3)
**Goal:** Teams see and interact with narratives

- ⬜ Create `NewsFeedTab.tsx` (timeline view)
- ⬜ Create `InboxTab.tsx` (email inbox view)
- ⬜ Enhance current session card with briefing display
- ⬜ Add unread indicators and counts
- ⬜ Implement mark-as-read functionality
- ⬜ Add WebSocket listener for real-time updates
- ⬜ Add notification toast for new narratives

**Deliverables:**
- Teams see morning briefings in session view
- Teams browse news feed
- Teams read emails from NPCs
- Real-time notifications work

### Phase 4: Template System (Week 3)
**Goal:** Auto-generation and templates

- ⬜ Create `NarrativeService` with template engine
- ⬜ Build template library (20+ templates)
- ⬜ Implement auto-generation triggers
- ⬜ Add NPC character definitions
- ⬜ Integrate with scoring system
- ⬜ Integrate with session unlock
- ⬜ Create `TemplateLibraryModal.tsx` for GM

**Deliverables:**
- Session unlocks auto-generate briefings
- Scoring auto-generates feedback emails
- GM can use templates for quick creation
- NPCs have consistent voices

### Phase 5: Testing & Polish (Week 4)
**Goal:** Production-ready with full test coverage

- ⬜ Write unit tests for NarrativeService
- ⬜ Write E2E tests for narrative workflows
- ⬜ Test WebSocket notifications
- ⬜ Test multi-team targeting
- ⬜ Performance testing (100+ narratives)
- ⬜ UI/UX polish and animations
- ⬜ Documentation and GM training materials

**Deliverables:**
- All tests passing
- System handles scale
- GM documentation complete
- Ready for pilot school

---

## 📊 Success Metrics

**Engagement Metrics:**
- **Read Rate**: % of narratives read by teams (target: >80%)
- **Session Time**: Average time spent on news/inbox tabs (target: 5+ min/session)
- **GM Usage**: % of GMs who create custom narratives (target: >50%)

**Learning Metrics:**
- **Comprehension**: Students can explain story context (surveys)
- **Retention**: Story scenarios are remembered weeks later
- **Motivation**: Students report higher engagement vs. metrics-only

**Technical Metrics:**
- **Performance**: Narrative queries < 200ms
- **Reliability**: 99.9% narrative delivery success
- **Real-time**: WebSocket notifications < 1s latency

---

## 🚨 Risks & Mitigation

### Risk 1: Content Creation Burden
**Risk:** GMs may not have time to write narratives
**Mitigation:**
- Comprehensive template library (80% of scenarios covered)
- Auto-generation for common events
- Optional narrative system (game works without it)

### Risk 2: Storage Growth
**Risk:** Narratives accumulate over time (100+ games × 50 narratives)
**Mitigation:**
- Archive old games after completion
- Compress narrative content
- Pagination and lazy loading

### Risk 3: Complexity for Students
**Risk:** Too many narratives overwhelm students
**Mitigation:**
- Clear unread indicators
- Prioritize important messages
- Optional "digest" view (summary)

### Risk 4: Performance Impact
**Risk:** Real-time narrative updates slow down app
**Mitigation:**
- Efficient database queries (indexed properly)
- WebSocket batching for multiple updates
- Client-side caching

---

## 💡 Future Enhancements (Post-MVP)

### Advanced Features (Phase 4+)

1. **AI-Generated Narratives** (GPT Integration)
   - Auto-generate based on team performance
   - Personalized feedback from NPCs
   - Dynamic story branching

2. **Multimedia Narratives**
   - Images/photos in news articles
   - Video messages from NPCs
   - Audio briefings

3. **Student-Generated Content**
   - Teams write press releases
   - Teams respond to emails
   - Peer feedback narratives

4. **Story Analytics**
   - Track which narratives drive decisions
   - A/B test narrative approaches
   - Measure learning impact

5. **Scenario Marketplace**
   - Share narrative templates between GMs
   - Download pre-built story arcs
   - Community ratings and reviews

---

## 📚 Sample Narrative Content

### Example 1: Session Briefing (High Performance)

**Title:** Week 3 - Wednesday Morning
**Type:** Briefing

**Content:**
```
Good morning, team!

The buzz around your company continues to grow. After last week's successful product
launch, you've been featured in TechCrunch and received inquiries from three major
retailers interested in carrying your product. Your investor, Sarah Chen, sent a
congratulatory email but reminded you that sustaining this momentum requires careful
resource management.

However, not everything is perfect. Your operations team reported some bottlenecks in
fulfillment, and a few early customers have complained about shipping delays. Mark from
HR also mentioned that the team is feeling the pressure of rapid growth.

Today's challenge: How do you balance scaling up to meet demand while maintaining quality
and keeping your team healthy?
```

### Example 2: News Article (Market Event)

**Title:** Tech Industry Faces Supply Chain Shortage
**Type:** News
**Author:** Tech Industry News

**Content:**
```
SAN FRANCISCO - A global shortage of semiconductor chips is impacting tech startups
across the region. Industry analysts predict delays of 4-6 weeks for hardware
manufacturers, with some companies reporting cost increases of up to 15%.

"We're seeing unprecedented pressure on our supply chain," said one local entrepreneur
who wished to remain anonymous. "Companies that planned ahead may weather this storm,
but those caught off guard could face serious challenges."

Experts recommend diversifying suppliers and building inventory buffers where possible.

(This event affects all teams: Operations -10, Financial -5)
```

### Example 3: Email from Investor (Low Financial Score)

**Title:** Urgent: Q2 Financial Review
**Type:** Email
**Author:** Sarah Chen, Lead Investor

**Content:**
```
Hi Team,

I hope this email finds you well. I've just reviewed your Q2 financial report, and
I have to be honest - I'm concerned.

Your burn rate is higher than we discussed in our last meeting, and revenue isn't
growing fast enough to justify the spending. I understand you're investing in growth,
but we need to see a clearer path to profitability.

Can we schedule a call this week to discuss your financial strategy? I want to
understand your plan for the next quarter and how you're thinking about achieving
sustainable growth.

I believe in your team and your vision, but we need to see better financial discipline
moving forward.

Best regards,

Sarah Chen
Lead Investor
Venture Capital Partners
sarah.chen@vcpartners.com
```

### Example 4: Customer Feedback Email (High Customer Sat)

**Title:** Thank You!
**Type:** Email
**Author:** Emma Thompson, Customer

**Content:**
```
Hi there!

I just wanted to reach out and say thank you for the amazing experience with your
product. I've been a customer for a month now, and I'm blown away by the quality
and your customer service.

I actually recommended your product to three of my colleagues, and they all love it
too! We're in the education sector, and we've been looking for a solution like yours
for years.

Keep up the great work! Companies like yours give me hope for the future of our
industry.

Warmly,

Emma Thompson
Director of Innovation
Riverside School District
```

---

## ✅ Acceptance Criteria

### Must Have (MVP)
- ✅ GM can create briefings, news, emails, alerts
- ✅ GM can target all teams or specific teams
- ✅ Teams see briefings in session view
- ✅ Teams see news feed with chronological timeline
- ✅ Teams see inbox with unread counts
- ✅ Real-time WebSocket notifications work
- ✅ Auto-generation for session unlocks
- ✅ Template library with 10+ templates
- ✅ E2E tests pass (narrative workflows)

### Should Have (Nice to Have)
- ⭕ Rich text formatting in narratives
- ⭕ Image uploads for news articles
- ⭕ Email threading (replies to same topic)
- ⭕ Narrative search functionality
- ⭕ Export narratives (PDF/print)

### Could Have (Future)
- ⭕ AI-generated content (GPT integration)
- ⭕ Multimedia (video/audio)
- ⭕ Student-generated narratives
- ⭕ Story analytics dashboard

---

## 🎓 GM Training Materials

### Quick Start Guide

**Creating Your First Narrative:**

1. **Navigate to Narratives**
   - Go to Game Details page
   - Click "Narratives & Story" tab

2. **Choose a Template**
   - Click "Create Narrative"
   - Browse template library
   - Select "Investor Feedback" template

3. **Customize Content**
   - Edit title and content
   - Choose target teams (all or specific)
   - Link to session if applicable

4. **Publish**
   - Preview how teams will see it
   - Click "Publish" to send

**Best Practices:**
- ✅ Write in present tense for immersion
- ✅ Use specific details (names, numbers, dates)
- ✅ Connect narratives to student decisions
- ✅ Balance positive and negative feedback
- ✅ Keep briefings concise (2-3 paragraphs max)

---

## 📞 Support & Documentation

### For Developers
- **API Reference:** `/docs/api/narratives.md`
- **Component Library:** `/docs/components/narratives.md`
- **Database Schema:** `/docs/database/narratives.md`

### For Game Masters
- **User Guide:** `/docs/gm/narratives-guide.md`
- **Template Library:** `/docs/gm/templates.md`
- **Best Practices:** `/docs/gm/storytelling-best-practices.md`

### For Students
- **How to Read Narratives:** `/docs/student/narratives.md`
- **Understanding NPCs:** `/docs/student/characters.md`

---

## 🏁 Conclusion

The Narrative System is essential for transforming BusinessCaise from a metrics simulator into an immersive learning experience. By weaving story, character, and consequence into the gameplay, we create emotional engagement that drives deeper learning and retention.

**Ready to Proceed?**
- Database schema: ✅ Already in place
- Technical feasibility: ✅ Well-scoped
- Educational value: ✅ High impact
- Implementation plan: ✅ Detailed and phased

**Estimated Timeline:** 4 weeks to MVP
**Estimated Effort:** ~120 hours
**Priority:** High (essential for pilot school)

---

**Next Steps:**
1. Review and approve this plan
2. Create GitHub issues for Phase 1 tasks
3. Begin implementation starting with backend models
4. Weekly progress reviews and demos

**Questions? Feedback?**
Ready to discuss any aspect of this plan and make adjustments based on your input.
