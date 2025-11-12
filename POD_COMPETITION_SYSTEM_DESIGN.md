# 🏆 Pod Competition & Category Awards System - Design Document

**Status:** Design for Review
**Date:** November 12, 2025
**Priority:** High - Solves Leaderboard Clustering Problem
**Control Model:** GM-Controlled with Dual Competition Dimensions

---

## 🎯 Problem Statement

**Current Limitation:**
With large classes (e.g., 32 students = 8 teams), the leaderboard becomes crowded:
- Most teams cluster in the middle (scores between 60-75)
- Difficult to differentiate performance
- Only 1 winner, many teams feel "average"
- Competitive tension is diluted across too many teams
- Hard to track rivals when competing against 7+ teams

**Educational Impact:**
- ❌ Reduced engagement (most teams in the middle)
- ❌ Unclear competitive positioning
- ❌ Only top 1-2 teams feel successful
- ❌ Difficult to identify specific strengths
- ❌ Overwhelming to track multiple competitors

**Solution:**
Implement a **dual-layer competition system**:
1. **Pod Competition** - Teams compete primarily within small pods (4 teams)
2. **Category Awards** - Multiple ways to "win" (Financial, Operations, Marketing, HR, Customer Satisfaction)
3. **Global View** - Still see overall standings for context

---

## 🎨 Design Philosophy

### Dual-Dimension Competition

```
PRIMARY COMPETITION (Focus)
├─ Pod Leaderboard (4 teams)
│  ├─ Overall score ranking
│  └─ Tight, manageable competition
│
SECONDARY COMPETITION (Recognition)
├─ Category Rankings (5 categories)
│  ├─ Financial Excellence
│  ├─ Operations Leader
│  ├─ Marketing Champion
│  ├─ Best Employer (HR)
│  └─ Customer Favorite
│
TERTIARY VIEW (Context)
└─ Global Leaderboard (all teams)
   └─ See overall standings
```

**Key Principles:**
- **GM Controls Everything** - Pod assignments, category awards toggle, pod size
- **Multiple Success Stories** - Pod winners + Category leaders = many "winners"
- **Focused Competition** - Primary attention on 3 pod rivals
- **Transparency** - Can still see all teams globally
- **Scalability** - Works for 4 teams or 40 teams

---

## 🏗️ System Architecture

### Data Model

```typescript
// Game Model Enhancement
interface Game {
  // ... existing fields ...

  // Pod Competition Settings
  enable_pods: boolean;           // Enable pod mode
  pod_size: number;               // Teams per pod (default: 4)
  pod_assignment_method: 'random' | 'manual' | 'balanced';

  // Category Awards Settings
  enable_category_awards: boolean; // Show category rankings (default: true)
}

// Team Model Enhancement
interface Team {
  // ... existing fields ...

  // Pod Assignment
  pod_id?: string;     // e.g., "pod_A", "pod_B"
  pod_name?: string;   // e.g., "Pod Alpha", "Pod Beta"
}

// Category Ranking (New)
interface CategoryRanking {
  id: string;
  game_id: string;
  session_id?: string;  // Null = current/final rankings
  category: 'financial' | 'operations' | 'marketing' | 'hr' | 'customer_satisfaction' | 'overall';
  scope: 'pod' | 'global';
  pod_id?: string;      // Required if scope = 'pod'
  team_id: string;
  score: number;        // Metric value
  rank: number;         // 1st, 2nd, 3rd, etc.
  created_at: Date;
}

// Pod Summary (Computed)
interface PodSummary {
  pod_id: string;
  pod_name: string;
  team_count: number;
  teams: Team[];
  avg_score: number;
  top_team: Team;
}
```

---

## 📊 Pod Competition System

### Pod Assignment Methods

#### 1. **Random Assignment** (Default)
```typescript
// Randomly distribute teams into pods
function assignPodsRandomly(teams: Team[], podSize: number): void {
  const shuffled = shuffle(teams);
  const podCount = Math.ceil(teams.length / podSize);

  for (let i = 0; i < podCount; i++) {
    const podTeams = shuffled.slice(i * podSize, (i + 1) * podSize);
    const podId = `pod_${String.fromCharCode(65 + i)}`; // pod_A, pod_B, ...
    const podName = `Pod ${String.fromCharCode(65 + i)}`; // Pod A, Pod B, ...

    podTeams.forEach(team => {
      team.pod_id = podId;
      team.pod_name = podName;
    });
  }
}
```

**Use Case:** Fair, unbiased assignment for most courses

#### 2. **Manual Assignment**
```typescript
// GM manually assigns teams to pods
POST /api/gm/games/:gameId/pods/assign
Body: {
  assignments: [
    { team_id: "uuid1", pod_id: "pod_A" },
    { team_id: "uuid2", pod_id: "pod_A" },
    { team_id: "uuid3", pod_id: "pod_B" },
    ...
  ]
}
```

**Use Case:** When GM wants specific groupings (e.g., by class section, student groups)

#### 3. **Balanced Assignment** (Future Enhancement)
```typescript
// Distribute teams to balance skill/experience across pods
// Based on pre-assessment scores or prior game performance
function assignPodsBalanced(teams: Team[], podSize: number): void {
  // Sort by initial assessment or predicted performance
  const sorted = teams.sort((a, b) => b.estimated_skill - a.estimated_skill);

  // Snake draft: 1,2,3,4, 4,3,2,1, 1,2,3,4...
  const podCount = Math.ceil(teams.length / podSize);
  const pods = Array(podCount).fill([]);

  let currentPod = 0;
  let direction = 1;

  sorted.forEach(team => {
    pods[currentPod].push(team);

    if (direction === 1 && currentPod === podCount - 1) {
      direction = -1;
    } else if (direction === -1 && currentPod === 0) {
      direction = 1;
    } else {
      currentPod += direction;
    }
  });

  // Assign pod IDs
  pods.forEach((podTeams, index) => {
    const podId = `pod_${String.fromCharCode(65 + index)}`;
    const podName = `Pod ${String.fromCharCode(65 + index)}`;
    podTeams.forEach(team => {
      team.pod_id = podId;
      team.pod_name = podName;
    });
  });
}
```

**Use Case:** Competitive balance when skill variation is high

---

### Pod Size Guidelines

| Total Teams | Pod Size | Pods Count | Notes |
|-------------|----------|------------|-------|
| 4-8 teams   | 4        | 1-2 pods   | Small class, minimal pods |
| 9-16 teams  | 4        | 3-4 pods   | Medium class, ideal setup |
| 17-24 teams | 4-5      | 4-5 pods   | Large class |
| 25+ teams   | 5-6      | 5+ pods    | Very large class, consider larger pods |

**Recommendation:** Keep pods at 4 teams for optimal competition

---

## 🏅 Category Awards System

### Categories

#### 1. **💰 Financial Excellence**
- **Metric:** `metrics.financial`
- **Description:** "Highest financial performance - profitability, revenue growth, cash management"
- **Scope:** Pod + Global
- **Display:** Gold coin icon 💰

#### 2. **⚙️ Operations Leader**
- **Metric:** `metrics.operations`
- **Description:** "Best operational efficiency - processes, systems, quality control"
- **Scope:** Pod + Global
- **Display:** Gear icon ⚙️

#### 3. **📣 Marketing Champion**
- **Metric:** `metrics.marketing`
- **Description:** "Top marketing performance - brand awareness, customer acquisition, campaigns"
- **Scope:** Pod + Global
- **Display:** Megaphone icon 📣

#### 4. **👥 Best Employer**
- **Metric:** `metrics.hr`
- **Description:** "Highest employee satisfaction - culture, retention, engagement"
- **Scope:** Pod + Global
- **Display:** People icon 👥

#### 5. **😊 Customer Favorite**
- **Metric:** `metrics.customer_satisfaction`
- **Description:** "Best customer satisfaction - service quality, loyalty, NPS"
- **Scope:** Pod + Global
- **Display:** Smile icon 😊

#### 6. **🏆 Overall Champion**
- **Metric:** `metrics.overall_score`
- **Description:** "Highest overall performance across all metrics"
- **Scope:** Pod + Global
- **Display:** Trophy icon 🏆

---

### Category Ranking Display

#### Team Dashboard View
```
┌─────────────────────────────────────────────────┐
│  YOUR POD - "Pod Alpha"                         │
│  ═══════════════════════════════════════════    │
│                                                  │
│  Overall Ranking:                                │
│  🥇 Team Innovators - 78                        │
│  🥈 Your Team - 72      ← You                   │
│  🥉 Team Builders - 68                          │
│  4️⃣  Team Vision - 64                            │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│  YOUR ACHIEVEMENTS:                              │
│  💰 Financial Excellence: 🥇 1st in Pod         │
│  ⚙️ Operations Leader: 3rd in Pod               │
│  📣 Marketing Champion: 2nd in Pod              │
│  👥 Best Employer: 🥇 1st in Pod                │
│  😊 Customer Favorite: 4th in Pod               │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│  GLOBAL VIEW (All 8 Teams):                      │
│  🏆 Overall: #5 of 8                            │
│  💰 Financial: #2 of 8 🥈                       │
│  👥 Best Employer: #3 of 8 🥉                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### GM Dashboard View
```
┌─────────────────────────────────────────────────┐
│  CATEGORY LEADERS                                │
│  ═══════════════════════════════════════════    │
│                                                  │
│  Pod A Leaders:                                  │
│  🏆 Overall: Team Innovators (78)               │
│  💰 Financial: Team Delta (82)                  │
│  ⚙️ Operations: Team Innovators (85)            │
│  📣 Marketing: Team Builders (79)               │
│  👥 Best Employer: Team Delta (88)              │
│  😊 Customer: Team Builders (81)                │
│                                                  │
│  Pod B Leaders:                                  │
│  🏆 Overall: Team Phoenix (84)                  │
│  💰 Financial: Team Phoenix (88)                │
│  ⚙️ Operations: Team Dragons (80)               │
│  📣 Marketing: Team Phoenix (86)                │
│  👥 Best Employer: Team Warriors (82)           │
│  😊 Customer: Team Dragons (85)                 │
│                                                  │
│  Global Leaders:                                 │
│  🏆 Overall: Team Phoenix (84)                  │
│  💰 Financial: Team Phoenix (88)                │
│  ⚙️ Operations: Team Innovators (85)            │
│  📣 Marketing: Team Phoenix (86)                │
│  👥 Best Employer: Team Delta (88)              │
│  😊 Customer: Team Dragons (85)                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### New Tables

```sql
-- Pod configuration (if we want to track pod metadata)
CREATE TABLE pods (
    id VARCHAR(50) PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category rankings snapshot
CREATE TABLE category_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,  -- 'financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall'
    scope VARCHAR(20) NOT NULL,     -- 'pod', 'global'
    pod_id VARCHAR(50),             -- Required if scope = 'pod'
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    rank INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_category CHECK (category IN ('financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall')),
    CONSTRAINT check_scope CHECK (scope IN ('pod', 'global')),
    CONSTRAINT check_pod_scope CHECK ((scope = 'pod' AND pod_id IS NOT NULL) OR (scope = 'global' AND pod_id IS NULL))
);

CREATE INDEX idx_category_rankings_game ON category_rankings(game_id);
CREATE INDEX idx_category_rankings_session ON category_rankings(session_id);
CREATE INDEX idx_category_rankings_category ON category_rankings(category, scope);
```

### Modified Tables

```sql
-- Games table: Add pod and category settings
ALTER TABLE games ADD COLUMN enable_pods BOOLEAN DEFAULT false;
ALTER TABLE games ADD COLUMN pod_size INTEGER DEFAULT 4;
ALTER TABLE games ADD COLUMN pod_assignment_method VARCHAR(20) DEFAULT 'random';
ALTER TABLE games ADD COLUMN enable_category_awards BOOLEAN DEFAULT true;

-- Teams table: Add pod assignment
ALTER TABLE teams ADD COLUMN pod_id VARCHAR(50);
ALTER TABLE teams ADD COLUMN pod_name VARCHAR(100);

-- Add constraint to validate pod settings
ALTER TABLE games ADD CONSTRAINT check_pod_size CHECK (pod_size >= 2 AND pod_size <= 10);
ALTER TABLE games ADD CONSTRAINT check_pod_method CHECK (pod_assignment_method IN ('random', 'manual', 'balanced'));
```

---

## 🔌 API Endpoints

### Game Creation (Enhanced)

```typescript
POST /api/gm/games
Body: {
  title: string,
  description: string,
  start_date: string,
  end_date: string,
  archetype_id: string,
  industry_id: string,

  // NEW: Pod competition settings
  enable_pods?: boolean,          // Default: false
  pod_size?: number,              // Default: 4
  pod_assignment_method?: 'random' | 'manual' | 'balanced',

  // NEW: Category awards
  enable_category_awards?: boolean // Default: true
}

Response: {
  game: {
    id: string,
    ...existing fields...,
    enable_pods: boolean,
    pod_size: number,
    enable_category_awards: boolean
  }
}
```

---

### Pod Management (GM)

```typescript
// Get all pods for a game
GET /api/gm/games/:gameId/pods
Response: {
  pods: [
    {
      pod_id: "pod_A",
      pod_name: "Pod Alpha",
      team_count: 4,
      teams: Team[],
      avg_score: 72.5
    },
    ...
  ]
}

// Assign teams to pods (random)
POST /api/gm/games/:gameId/pods/assign-random
Response: {
  success: true,
  pods: PodSummary[]
}

// Manually assign team to pod
PUT /api/gm/games/:gameId/teams/:teamId/pod
Body: {
  pod_id: string,
  pod_name: string
}

// Create custom pod
POST /api/gm/games/:gameId/pods
Body: {
  pod_id: string,      // e.g., "pod_custom_1"
  pod_name: string,    // e.g., "Morning Section"
  team_ids: string[]
}

// Get pod leaderboard
GET /api/gm/games/:gameId/leaderboard?scope=pod&pod_id=pod_A
Response: {
  pod: {
    pod_id: "pod_A",
    pod_name: "Pod Alpha",
    leaderboard: [
      { rank: 1, team: Team, score: 78 },
      { rank: 2, team: Team, score: 72 },
      ...
    ]
  }
}
```

---

### Category Rankings

```typescript
// Get category leaders for game
GET /api/gm/games/:gameId/category-leaders?scope=pod&pod_id=pod_A
// OR
GET /api/gm/games/:gameId/category-leaders?scope=global

Response: {
  scope: "pod",
  pod_id: "pod_A",
  categories: {
    financial: {
      category: "financial",
      leader: { team: Team, score: 85 },
      top_3: [
        { rank: 1, team: Team, score: 85 },
        { rank: 2, team: Team, score: 82 },
        { rank: 3, team: Team, score: 78 }
      ]
    },
    operations: { ... },
    marketing: { ... },
    hr: { ... },
    customer_satisfaction: { ... },
    overall: { ... }
  }
}

// Snapshot category rankings (called at session end)
POST /api/gm/games/:gameId/sessions/:sessionId/snapshot-rankings
// Captures current rankings for historical tracking
```

---

### Team Leaderboard (Enhanced)

```typescript
// Get pod leaderboard (primary view)
GET /api/teams/:teamId/leaderboard?scope=pod
Response: {
  your_pod: {
    pod_id: "pod_A",
    pod_name: "Pod Alpha",
    your_rank: 2,
    leaderboard: [
      { rank: 1, team_name: "Team Innovators", score: 78 },
      { rank: 2, team_name: "Your Team", score: 72, is_you: true },
      { rank: 3, team_name: "Team Builders", score: 68 },
      { rank: 4, team_name: "Team Vision", score: 64 }
    ]
  }
}

// Get global leaderboard (secondary view)
GET /api/teams/:teamId/leaderboard?scope=global
Response: {
  total_teams: 8,
  your_rank: 5,
  leaderboard: [
    { rank: 1, team_name: "Team Phoenix", score: 84, pod_name: "Pod Beta" },
    ...
    { rank: 5, team_name: "Your Team", score: 72, pod_name: "Pod Alpha", is_you: true },
    ...
  ]
}

// Get all category rankings for team
GET /api/teams/:teamId/category-rankings
Response: {
  team_name: "Your Team",
  overall_score: 72,

  pod_rankings: {
    pod_id: "pod_A",
    pod_name: "Pod Alpha",
    categories: [
      { category: "financial", score: 85, rank: 1, total_teams: 4, badge: "🥇" },
      { category: "operations", score: 68, rank: 3, total_teams: 4, badge: null },
      { category: "marketing", score: 75, rank: 2, total_teams: 4, badge: "🥈" },
      { category: "hr", score: 88, rank: 1, total_teams: 4, badge: "🥇" },
      { category: "customer_satisfaction", score: 64, rank: 4, total_teams: 4, badge: null },
      { category: "overall", score: 72, rank: 2, total_teams: 4, badge: "🥈" }
    ]
  },

  global_rankings: {
    total_teams: 8,
    categories: [
      { category: "financial", score: 85, rank: 2, badge: "🥈" },
      { category: "operations", score: 68, rank: 6, badge: null },
      { category: "marketing", score: 75, rank: 4, badge: null },
      { category: "hr", score: 88, rank: 3, badge: "🥉" },
      { category: "customer_satisfaction", score: 64, rank: 7, badge: null },
      { category: "overall", score: 72, rank: 5, badge: null }
    ]
  }
}
```

---

## 🎨 Frontend Components

### GM Dashboard

#### 1. Game Creation - Pod Settings

**File:** `gm-dashboard/src/pages/CreateGamePage.tsx`

```tsx
<section className="pod-settings">
  <h3>Competition Settings</h3>

  {/* Enable Pods */}
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={enablePods}
      onChange={e => setEnablePods(e.target.checked)}
    />
    <span>Enable Pod Competition (recommended for 8+ teams)</span>
  </label>

  {enablePods && (
    <>
      <label>Pod Size</label>
      <select value={podSize} onChange={e => setPodSize(Number(e.target.value))}>
        <option value={3}>3 teams per pod</option>
        <option value={4}>4 teams per pod (recommended)</option>
        <option value={5}>5 teams per pod</option>
        <option value={6}>6 teams per pod</option>
      </select>

      <label>Pod Assignment Method</label>
      <select
        value={podAssignmentMethod}
        onChange={e => setPodAssignmentMethod(e.target.value)}
      >
        <option value="random">Random (fair distribution)</option>
        <option value="manual">Manual (I'll assign teams)</option>
        <option value="balanced">Balanced (skill-based, future)</option>
      </select>

      {podAssignmentMethod === 'manual' && (
        <p className="text-sm text-gray-600">
          You'll assign teams to pods after they join
        </p>
      )}
    </>
  )}

  {/* Enable Category Awards */}
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={enableCategoryAwards}
      onChange={e => setEnableCategoryAwards(e.target.checked)}
    />
    <span>Enable Category Awards (Financial, Operations, Marketing, HR, Customer)</span>
  </label>
</section>
```

#### 2. Pod Management Page

**File:** `gm-dashboard/src/pages/PodManagementPage.tsx`

```tsx
export function PodManagementPage() {
  const { gameId } = useParams();
  const { data: pods } = useQuery(['pods', gameId], () =>
    api.get(`/gm/games/${gameId}/pods`)
  );

  return (
    <div className="pod-management">
      <header>
        <h1>Pod Management</h1>
        <button onClick={handleAssignRandom}>Assign Randomly</button>
      </header>

      <div className="pods-grid">
        {pods?.map(pod => (
          <div key={pod.pod_id} className="pod-card">
            <h3>{pod.pod_name}</h3>
            <p className="avg-score">Avg Score: {pod.avg_score}</p>

            <div className="team-list">
              {pod.teams.map(team => (
                <div key={team.id} className="team-row">
                  <span>{team.name}</span>
                  <span className="score">{team.overall_score}</span>

                  {/* Manual reassignment */}
                  <select
                    value={team.pod_id}
                    onChange={e => handleMoveToPod(team.id, e.target.value)}
                  >
                    {allPods.map(p => (
                      <option value={p.pod_id}>{p.pod_name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 3. Game Details - Category Leaders

**File:** `gm-dashboard/src/pages/GameDetailsPage.tsx`

```tsx
<section className="category-leaders">
  <h2>Category Leaders</h2>

  <Tabs>
    <Tab label="Pod A">
      <CategoryLeaderboard scope="pod" podId="pod_A" />
    </Tab>
    <Tab label="Pod B">
      <CategoryLeaderboard scope="pod" podId="pod_B" />
    </Tab>
    <Tab label="Global">
      <CategoryLeaderboard scope="global" />
    </Tab>
  </Tabs>
</section>

function CategoryLeaderboard({ scope, podId }) {
  const { data: leaders } = useQuery(
    ['category-leaders', gameId, scope, podId],
    () => api.get(`/gm/games/${gameId}/category-leaders?scope=${scope}&pod_id=${podId}`)
  );

  return (
    <div className="category-grid">
      {Object.entries(leaders.categories).map(([category, data]) => (
        <div key={category} className="category-card">
          <div className="icon">{getCategoryIcon(category)}</div>
          <h4>{getCategoryName(category)}</h4>
          <div className="leader">
            <span className="team-name">{data.leader.team.name}</span>
            <span className="score">{data.leader.score}</span>
          </div>
          <div className="top-3">
            {data.top_3.map(entry => (
              <div key={entry.rank} className="rank-row">
                <span>{getRankBadge(entry.rank)}</span>
                <span>{entry.team.name}</span>
                <span>{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### Team Player Frontend

#### 1. Dashboard - Pod Leaderboard (Primary)

**File:** `src/pages/PlayerGame.tsx`

```tsx
<section className="leaderboard-section">
  <Tabs defaultTab="pod">
    <Tab label={`Your Pod - ${podName}`} value="pod">
      <PodLeaderboard teamId={teamId} />
    </Tab>
    <Tab label="All Teams" value="global">
      <GlobalLeaderboard teamId={teamId} />
    </Tab>
    <Tab label="Category Rankings" value="categories">
      <CategoryRankings teamId={teamId} />
    </Tab>
  </Tabs>
</section>

function PodLeaderboard({ teamId }) {
  const { data } = useQuery(['leaderboard', teamId, 'pod'], () =>
    api.get(`/teams/${teamId}/leaderboard?scope=pod`)
  );

  return (
    <div className="pod-leaderboard">
      <h3>{data.your_pod.pod_name}</h3>
      <p className="your-rank">You are #{data.your_pod.your_rank} in your pod</p>

      <div className="leaderboard-list">
        {data.your_pod.leaderboard.map(entry => (
          <div
            key={entry.rank}
            className={`leaderboard-row ${entry.is_you ? 'highlight' : ''}`}
          >
            <span className="rank">{getRankBadge(entry.rank)}</span>
            <span className="team-name">
              {entry.team_name}
              {entry.is_you && <span className="badge">You</span>}
            </span>
            <span className="score">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 2. Category Rankings Display

**File:** `src/components/CategoryRankings.tsx`

```tsx
export function CategoryRankings({ teamId }) {
  const { data } = useQuery(['category-rankings', teamId], () =>
    api.get(`/teams/${teamId}/category-rankings`)
  );

  return (
    <div className="category-rankings">
      <h3>Your Achievements</h3>

      {/* Pod Rankings */}
      <div className="pod-section">
        <h4>In Your Pod ({data.pod_rankings.pod_name})</h4>
        <div className="category-grid">
          {data.pod_rankings.categories.map(cat => (
            <div key={cat.category} className="category-card">
              <div className="icon">{getCategoryIcon(cat.category)}</div>
              <div className="name">{getCategoryName(cat.category)}</div>
              <div className="rank">
                {cat.badge || `#${cat.rank}`}
                <span className="of">of {cat.total_teams}</span>
              </div>
              <div className="score">{cat.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Rankings */}
      <div className="global-section">
        <h4>Overall ({data.global_rankings.total_teams} teams)</h4>
        <div className="highlights">
          {data.global_rankings.categories
            .filter(cat => cat.rank <= 3) // Only show top 3 finishes
            .map(cat => (
              <div key={cat.category} className="highlight-badge">
                {cat.badge} {getCategoryName(cat.category)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons = {
    financial: '💰',
    operations: '⚙️',
    marketing: '📣',
    hr: '👥',
    customer_satisfaction: '😊',
    overall: '🏆'
  };
  return icons[category] || '📊';
}

function getCategoryName(category: string): string {
  const names = {
    financial: 'Financial Excellence',
    operations: 'Operations Leader',
    marketing: 'Marketing Champion',
    hr: 'Best Employer',
    customer_satisfaction: 'Customer Favorite',
    overall: 'Overall Champion'
  };
  return names[category] || category;
}

function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}
```

---

## 🎭 Narrative Integration

### Pod-Aware Narratives

**Morning Briefing with Pod Context:**
```typescript
const briefingTemplate = {
  title: "Session {{session_number}} Begins",

  content: `
Good morning, {{team_name}}!

**Your Pod Performance:**
You're currently #{{pod_rank}} of {{pod_total_teams}} in {{pod_name}}.
{{#if pod_rank === 1}}
🏆 You're leading your pod! Keep up the excellent work.
{{else if pod_rank === 2}}
🥈 You're in 2nd place, just {{points_behind}} points behind {{pod_leader}}.
{{else}}
{{pod_leader}} is currently leading with {{leader_score}} points.
{{/if}}

**Your Strengths:**
{{#each top_categories}}
- {{icon}} {{name}}: {{rank}} in your pod ({{score}})
{{/each}}

**Today's Challenge:**
{{session_description}}
  `
};
```

**News Feed with Pod Rivalries:**
```typescript
{
  type: 'pod_competition',
  title: '{{rival_team}} Makes Bold Move in {{pod_name}}',
  content: 'Your pod rival {{rival_team}} just submitted an aggressive marketing strategy. They\'re now only {{point_gap}} points behind you in the pod standings. How will you respond?',
  relevance: 'high' // Only shown to teams in same pod
}
```

**Category Achievement Notifications:**
```typescript
{
  type: 'category_achievement',
  title: '🥇 Category Leader: {{category_name}}',
  content: 'Congratulations! You\'ve taken the lead in {{category_name}} within your pod with a score of {{score}}. {{previous_leader}} held this position previously.',
  sentiment: 'positive'
}
```

---

## 📊 Metrics & Analytics

### GM Analytics Dashboard

**Pod Performance Overview:**
```typescript
interface PodAnalytics {
  pod_id: string;
  pod_name: string;
  team_count: number;

  // Aggregate metrics
  avg_score: number;
  median_score: number;
  min_score: number;
  max_score: number;
  score_variance: number;

  // Category strengths
  strongest_category: string;
  weakest_category: string;

  // Engagement
  avg_submission_count: number;
  teams_on_track: number;
}
```

**Category Distribution:**
```typescript
interface CategoryDistribution {
  category: string;

  // Score distribution across all teams
  scores: number[];
  avg: number;
  median: number;
  std_dev: number;

  // Top performers
  top_3_global: Team[];

  // Per-pod leaders
  pod_leaders: Array<{
    pod_id: string;
    pod_name: string;
    leader: Team;
    score: number;
  }>;
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('Pod Assignment', () => {
  it('should distribute teams evenly across pods', () => {
    const teams = createMockTeams(8);
    const podSize = 4;

    assignPodsRandomly(teams, podSize);

    const podA = teams.filter(t => t.pod_id === 'pod_A');
    const podB = teams.filter(t => t.pod_id === 'pod_B');

    expect(podA).toHaveLength(4);
    expect(podB).toHaveLength(4);
  });

  it('should handle uneven team counts', () => {
    const teams = createMockTeams(10);
    const podSize = 4;

    assignPodsRandomly(teams, podSize);

    // 10 teams → 3 pods (4, 4, 2)
    const pods = groupBy(teams, 'pod_id');
    expect(Object.keys(pods)).toHaveLength(3);
  });
});

describe('Category Rankings', () => {
  it('should calculate category leaders correctly', () => {
    const teams = [
      { id: '1', metrics: { financial: 85, operations: 70 } },
      { id: '2', metrics: { financial: 90, operations: 65 } },
      { id: '3', metrics: { financial: 75, operations: 80 } }
    ];

    const leader = getCategoryLeader(teams, 'financial');
    expect(leader.id).toBe('2');
    expect(leader.score).toBe(90);
  });

  it('should rank teams within pod', () => {
    const teams = createMockTeamsWithPods();
    const podA = teams.filter(t => t.pod_id === 'pod_A');

    const rankings = calculateCategoryRankings(podA, 'financial', 'pod', 'pod_A');

    expect(rankings[0].rank).toBe(1);
    expect(rankings[0].score).toBeGreaterThan(rankings[1].score);
  });
});
```

### E2E Tests

```typescript
test('GM creates game with pods and assigns teams', async ({ page }) => {
  // Create game with pods enabled
  await page.goto('/games/create');
  await page.getByLabel(/enable pod competition/i).check();
  await page.getByLabel(/pod size/i).selectOption('4');
  await page.getByLabel(/assignment method/i).selectOption('random');
  await page.getByRole('button', { name: /create game/i }).click();

  // Verify game created with pod settings
  await expect(page.getByText(/pod competition: enabled/i)).toBeVisible();

  // Teams join
  // ... (8 teams join the game)

  // GM assigns pods
  await page.goto('/games/:id/pods');
  await page.getByRole('button', { name: /assign randomly/i }).click();

  // Verify pods created
  await expect(page.getByText(/pod alpha/i)).toBeVisible();
  await expect(page.getByText(/pod beta/i)).toBeVisible();

  // Verify 4 teams per pod
  const podATeams = await page.locator('[data-pod="pod_A"] .team-row').count();
  expect(podATeams).toBe(4);
});

test('Team views pod leaderboard and category rankings', async ({ page }) => {
  // Team logs in and navigates to dashboard
  await loginAsTeam(page, teamId);

  // Pod leaderboard is default view
  await expect(page.getByText(/your pod - pod alpha/i)).toBeVisible();
  await expect(page.getByText(/you are #2 in your pod/i)).toBeVisible();

  // See 4 teams in pod
  const podTeams = await page.locator('.leaderboard-row').count();
  expect(podTeams).toBe(4);

  // Switch to category rankings
  await page.getByRole('tab', { name: /category rankings/i }).click();

  // See category achievements
  await expect(page.getByText(/💰 financial excellence/i)).toBeVisible();
  await expect(page.getByText(/🥇/i)).toBeVisible(); // 1st place badge
});
```

---

## 📅 Implementation Plan

### Phase 1: Backend Infrastructure (Week 1)

**Tasks:**
- ⬜ Create database migrations (pod columns, category_rankings table)
- ⬜ Update Game model with pod settings
- ⬜ Update Team model with pod assignment
- ⬜ Create pod assignment logic (random, manual)
- ⬜ Create category ranking calculation service
- ⬜ Build pod management API endpoints
- ⬜ Build category ranking API endpoints
- ⬜ Update leaderboard endpoints with scope filtering
- ⬜ Write unit tests for pod assignment
- ⬜ Write unit tests for category rankings

**Deliverables:**
- Database schema supports pods and categories
- API endpoints functional
- Pod assignment algorithms working
- Category calculations accurate

**Estimated Time:** 18-22 hours

---

### Phase 2: GM Dashboard UI (Week 2)

**Tasks:**
- ⬜ Update CreateGamePage with pod settings
- ⬜ Create PodManagementPage component
- ⬜ Build pod assignment interface (random/manual)
- ⬜ Create CategoryLeaderboard component
- ⬜ Add category leaders to GameDetailsPage
- ⬜ Add pod filter to existing leaderboard
- ⬜ Build pod reassignment drag-and-drop (optional)
- ⬜ Style all pod/category components

**Deliverables:**
- GM can enable/configure pods at game creation
- GM can assign teams to pods
- GM can view pod leaderboards
- GM can see category leaders

**Estimated Time:** 15-20 hours

---

### Phase 3: Team Player UI (Week 2-3)

**Tasks:**
- ⬜ Update PlayerGame dashboard with pod leaderboard
- ⬜ Create PodLeaderboard component (primary view)
- ⬜ Update GlobalLeaderboard component (secondary view)
- ⬜ Create CategoryRankings component
- ⬜ Add tab navigation (Pod / Global / Categories)
- ⬜ Build category achievement badges
- ⬜ Add pod context to team header
- ⬜ Style all components

**Deliverables:**
- Teams see pod leaderboard as default
- Teams can view global leaderboard
- Teams see category rankings
- Visual indicators for achievements

**Estimated Time:** 12-16 hours

---

### Phase 4: Narrative Integration (Week 3)

**Tasks:**
- ⬜ Update narrative templates with pod variables
- ⬜ Create pod rivalry narrative templates
- ⬜ Create category achievement notification templates
- ⬜ Update morning briefings to include pod standings
- ⬜ Add pod context to news feed items
- ⬜ Create category milestone narratives
- ⬜ Test narrative generation with pods

**Deliverables:**
- Narratives reference pod competition
- Category achievements trigger notifications
- Pod rivalries create dramatic moments

**Estimated Time:** 10-14 hours

---

### Phase 5: Testing & Polish (Week 4)

**Tasks:**
- ⬜ Write E2E tests for pod creation flow
- ⬜ Write E2E tests for pod assignment (random/manual)
- ⬜ Write E2E tests for team pod leaderboard view
- ⬜ Write E2E tests for category rankings
- ⬜ Test edge cases (odd number of teams, single pod, etc.)
- ⬜ Performance testing with 40+ teams
- ⬜ UI/UX refinements based on testing
- ⬜ GM documentation (how to use pods)
- ⬜ Student-facing help text

**Deliverables:**
- All tests passing
- Edge cases handled
- Documentation complete
- Ready for pilot

**Estimated Time:** 15-18 hours

---

## ✅ Success Criteria

**Must Have (MVP):**
- ✅ GM can enable pod competition at game creation
- ✅ GM can set pod size (default: 4)
- ✅ Random pod assignment works correctly
- ✅ Manual pod assignment available
- ✅ Teams see pod leaderboard as primary view
- ✅ Teams can view global leaderboard (secondary)
- ✅ 6 category rankings calculated (5 metrics + overall)
- ✅ Teams see their category rankings (pod + global)
- ✅ GM sees category leaders
- ✅ Narratives reference pod standings
- ✅ E2E tests pass
- ✅ Works for 4-40 teams

**Should Have:**
- ⭕ Balanced pod assignment (skill-based)
- ⭕ Pod reassignment (move team to different pod)
- ⭕ Category achievement notifications
- ⭕ Historical pod standings (session-by-session)
- ⭕ Pod vs. Pod analytics (compare pod performance)

**Could Have (Future):**
- ⭕ Dynamic pod promotion/relegation (like sports leagues)
- ⭕ Custom category definitions (GM creates categories)
- ⭕ Pod tournaments (bracket-style playoffs)
- ⭕ Inter-pod challenges (pod A vs. pod B events)

---

## 🏁 Conclusion

The **Pod Competition & Category Awards System** solves the leaderboard clustering problem while creating multiple paths to success.

**Key Benefits:**
- 🎯 **Focused Competition** - Teams track 3 rivals instead of 7+
- 🏆 **Multiple Winners** - Pod champions + Category leaders = many success stories
- 📊 **Better Differentiation** - Easier to rank 1st in a pod of 4
- 🎓 **Educational Value** - Category rankings highlight specific skill development
- ⚖️ **Fair Competition** - All teams still play the same game
- 📈 **Scalability** - Works for small (8 teams) and large (40 teams) classes

**Integration with Scenario System:**
- Pods work seamlessly with company archetypes and industries
- Category emphasis can vary by industry (SaaS = marketing focus, manufacturing = operations focus)
- Narratives adapt to both pod competition AND scenario context

**Estimated Total Effort:** 70-90 hours over 4 weeks

**Next Steps:**
1. Review and approve this design
2. Decide on MVP scope (all features or subset?)
3. Begin Phase 1 implementation (backend)
4. Coordinate with scenario customization implementation

Ready to make large classes engaging and competitive! 🚀
