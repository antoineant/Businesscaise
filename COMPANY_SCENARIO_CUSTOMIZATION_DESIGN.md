# 🏢 Company Scenario Customization System - Design Document

**Status:** Design for Review
**Date:** November 11, 2025
**Priority:** High - Essential for Educational Flexibility

---

## 🎯 Problem Statement

**Current Limitation:**
The simulation is generic - all teams run the same undefined "company" with no context about:
- What industry they're in
- What product/service they're selling
- What stage their company is at
- What challenges they face

**Educational Impact:**
- Students can't relate to abstract "business"
- Scenarios don't match course focus (startup course vs. turnaround course)
- Limited real-world applicability
- Generic narratives don't resonate

**Solution:**
Allow GMs and/or teams to choose **Company Archetypes** and **Industry/Product Types** that customize:
- Starting metrics and conditions
- Challenge types and difficulty
- Narrative templates and NPCs
- Success criteria

---

## 🎨 Design Philosophy

### Three-Level Customization

```
Level 1: GAME SETTINGS (GM Choice)
  ↓ What scenarios are available in this game?

Level 2: TEAM SELECTION (Team Choice)
  ↓ Which scenario does this team want to play?

Level 3: DYNAMIC ADAPTATION (System)
  ↓ Narratives, challenges, NPCs adapt to selection
```

**Benefits:**
- **Flexibility:** GMs control what fits their course
- **Engagement:** Teams pick what interests them
- **Comparability:** GMs can limit to one scenario for fair competition
- **Scalability:** Easy to add new scenarios

---

## 🏗️ System Architecture

### Data Model

```typescript
// Company Archetype (Stage/Situation)
interface CompanyArchetype {
  id: string;
  name: string;
  description: string;
  icon: string;
  starting_metrics: Metrics;
  starting_cash: number;
  starting_team_size: number;
  difficulty_modifier: number; // 0.8 - 1.2
  narrative_template_set: string; // Which template group to use
}

// Industry/Product Type
interface IndustryType {
  id: string;
  name: string;
  description: string;
  icon: string;
  product_examples: string[];
  npc_set: string; // Which NPCs are relevant
  challenge_focus: string[]; // marketing, tech, ops, etc.
}

// Scenario = Archetype + Industry
interface CompanyScenario {
  archetype_id: string;
  industry_id: string;
  custom_name?: string; // e.g., "Sunset Coffee Co."
  custom_product?: string; // e.g., "artisan cold brew"
}

// Team Model Enhancement
interface Team {
  // ... existing fields ...
  scenario: CompanyScenario;
  company_name: string; // Custom or generated
}

// Game Model Enhancement
interface Game {
  // ... existing fields ...
  allowed_archetypes: string[]; // null = all allowed
  allowed_industries: string[]; // null = all allowed
  force_same_scenario: boolean; // All teams must use same scenario
}
```

---

## 📋 Company Archetypes

### 1. **Early-Stage Startup** 🚀

**Description:**
"You're launching a brand new company with a fresh idea, limited resources, and big dreams. Every decision matters as you fight to survive and gain traction."

**Starting Conditions:**
```typescript
{
  cash: 25000,
  team_size: 3,
  metrics: {
    financial: 40,
    operations: 45,
    marketing: 35,
    hr: 50,
    customer_satisfaction: 30
  },
  overall_score: 40
}
```

**Characteristics:**
- **Low starting metrics** (lots of room to grow)
- **Limited cash** (forces careful decisions)
- **Small team** (scaling challenges)
- **High risk/reward** (big swings in metrics)
- **Focus:** Product-market fit, customer acquisition, fundraising

**Narrative Themes:**
- Finding first customers
- Investor pitches
- Bootstrapping challenges
- Pivoting when needed

**Example NPCs:**
- Sarah Chen (Angel Investor) - critical but supportive
- Alex Kim (First Employee) - worried about stability
- Emma Thompson (Early Adopter) - excited but demanding

---

### 2. **Product Launch** 📦

**Description:**
"Your established company is launching a new product line. You have resources and experience, but also stakeholders to answer to and a reputation to maintain."

**Starting Conditions:**
```typescript
{
  cash: 100000,
  team_size: 15,
  metrics: {
    financial: 60,
    operations: 65,
    marketing: 55,
    hr: 60,
    customer_satisfaction: 58
  },
  overall_score: 60
}
```

**Characteristics:**
- **Medium starting metrics** (balanced)
- **More cash** (can invest in growth)
- **Established team** (some inertia)
- **Medium risk** (can afford some mistakes)
- **Focus:** Market positioning, cannibalization risk, brand management

**Narrative Themes:**
- Managing existing customers while attracting new ones
- Internal resistance to change
- Competitor reactions
- Channel conflicts

**Example NPCs:**
- David Park (VP Marketing) - concerned about brand dilution
- Sarah Chen (Board Member) - wants ROI metrics
- Marcus Williams (Existing Customer) - worried about priorities

---

### 3. **Turnaround / Revival** 📈

**Description:**
"You've inherited a struggling business. Morale is low, customers are leaving, and cash is tight. Can you turn it around before it's too late?"

**Starting Conditions:**
```typescript
{
  cash: 50000,
  team_size: 20,
  metrics: {
    financial: 35,
    operations: 40,
    marketing: 30,
    hr: 25,
    customer_satisfaction: 28
  },
  overall_score: 32
}
```

**Characteristics:**
- **Low starting metrics** (crisis mode)
- **Moderate cash** (burning quickly)
- **Larger team** (but disengaged)
- **High pressure** (stakeholders impatient)
- **Focus:** Cost cutting, morale boost, customer retention

**Narrative Themes:**
- Difficult decisions (layoffs, pivots)
- Regaining customer trust
- Employee morale crisis
- Investor pressure

**Example NPCs:**
- Sarah Chen (Investor) - considering pulling out
- Maria Rodriguez (Employee Rep) - team is scared
- John Mitchell (Long-time Customer) - losing faith

---

### 4. **Scale-Up / Hyper-Growth** 🌟

**Description:**
"Your startup has found product-market fit and is growing fast. Can you build systems and culture to handle explosive growth without losing your soul?"

**Starting Conditions:**
```typescript
{
  cash: 200000,
  team_size: 8,
  metrics: {
    financial: 70,
    operations: 50,
    marketing: 75,
    hr: 55,
    customer_satisfaction: 68
  },
  overall_score: 64
}
```

**Characteristics:**
- **High financial, low operations** (growing pains)
- **Lots of cash** (recent funding)
- **Small team for scale** (hiring urgently)
- **Speed vs. quality tension**
- **Focus:** Scaling operations, hiring, maintaining culture

**Narrative Themes:**
- Growing too fast
- Maintaining quality during scale
- Culture dilution
- Competition intensifying

**Example NPCs:**
- Sarah Chen (Lead VC) - wants aggressive growth
- Emma Park (Operations) - systems breaking
- Alex Rodriguez (Customer Success) - can't keep up

---

### 5. **Innovation / R&D Focus** 🔬

**Description:**
"You're in a competitive industry where innovation is everything. Balance investment in R&D with immediate business needs."

**Starting Conditions:**
```typescript
{
  cash: 150000,
  team_size: 12,
  metrics: {
    financial: 55,
    operations: 60,
    marketing: 50,
    hr: 65,
    customer_satisfaction: 52
  },
  overall_score: 56
}
```

**Characteristics:**
- **Balanced metrics**
- **Good cash** (VC-backed or profitable)
- **Skilled team** (high HR)
- **Long-term vs. short-term tension**
- **Focus:** R&D investment, IP protection, innovation culture

**Narrative Themes:**
- Breakthrough vs. incremental innovation
- Time-to-market pressure
- Competitor copying
- Talent war

**Example NPCs:**
- Dr. Lisa Wang (CTO) - pushing for bold innovation
- Mark Thompson (CFO) - wants profitability
- Competitor announcements

---

## 🏭 Industry / Product Types

### 1. **Tech SaaS** 💻

**Description:** "Cloud-based software serving businesses or consumers"

**Product Examples:**
- Project management tool
- CRM system
- Marketing automation platform
- Team collaboration app
- Analytics dashboard

**Focus Areas:**
- Customer acquisition cost (CAC)
- Monthly recurring revenue (MRR)
- Churn rate
- Product-market fit
- Technical infrastructure

**Challenges:**
- Freemium vs. paid decisions
- Feature prioritization
- Scaling infrastructure
- Competitor features

**NPCs:**
- Tech bloggers/reviewers
- Enterprise buyers (IT managers)
- Individual users
- VCs focused on SaaS metrics

---

### 2. **E-Commerce / Retail** 🛍️

**Description:** "Selling physical products online or in stores"

**Product Examples:**
- Fashion/apparel
- Consumer electronics
- Home goods
- Specialty foods
- Handcrafted items

**Focus Areas:**
- Inventory management
- Supplier relationships
- Shipping/logistics
- Customer service
- Marketing channels

**Challenges:**
- Inventory decisions
- Seasonal demand
- Returns/quality issues
- Pricing strategy

**NPCs:**
- Suppliers
- Shipping partners
- Customer reviews
- Retail buyers

---

### 3. **Food & Beverage** 🍕

**Description:** "Restaurant, cafe, food product, or beverage company"

**Product Examples:**
- Coffee shop
- Food truck
- Packaged foods
- Meal delivery
- Specialty beverages

**Focus Areas:**
- Food cost management
- Location/real estate
- Health/safety compliance
- Brand identity
- Customer experience

**Challenges:**
- Menu pricing
- Supplier quality
- Expansion decisions
- Health inspections

**NPCs:**
- Food critics
- Suppliers
- Health inspectors
- Regular customers

---

### 4. **Healthcare / Wellness** 🏥

**Description:** "Health services, medical devices, or wellness products"

**Product Examples:**
- Telemedicine platform
- Fitness app
- Medical device
- Wellness coaching
- Healthcare SaaS

**Focus Areas:**
- Regulatory compliance
- Patient/customer outcomes
- Insurance/reimbursement
- Clinical validation
- Privacy/security

**Challenges:**
- FDA/regulatory approval
- Insurance negotiations
- Clinical trials
- Privacy concerns

**NPCs:**
- Doctors/clinicians
- Patients
- Regulators
- Insurance companies

---

### 5. **Professional Services** 💼

**Description:** "Consulting, agency, or service-based business"

**Product Examples:**
- Marketing agency
- Business consulting
- Design studio
- Legal services
- Accounting firm

**Focus Areas:**
- Utilization rate
- Client retention
- Pricing models
- Talent management
- Reputation/referrals

**Challenges:**
- Project scoping
- Client demands
- Hiring specialists
- Pricing strategy

**NPCs:**
- Clients (various industries)
- Competitors
- Industry associations
- Freelancers/contractors

---

### 6. **Education / EdTech** 📚

**Description:** "Educational products, platforms, or services"

**Product Examples:**
- Online learning platform
- Educational app
- Tutoring service
- Training courses
- School management software

**Focus Areas:**
- Learning outcomes
- Student engagement
- Content quality
- Pricing/accessibility
- Instructor/creator management

**Challenges:**
- Content creation
- Student retention
- Monetization
- Quality assurance

**NPCs:**
- Students/learners
- Educators/instructors
- Parents
- School administrators

---

### 7. **Manufacturing / Hardware** 🏭

**Description:** "Physical product manufacturing or hardware devices"

**Product Examples:**
- Consumer electronics
- Industrial equipment
- IoT devices
- Furniture
- Automotive parts

**Focus Areas:**
- Supply chain
- Quality control
- Production capacity
- Distribution channels
- Warranty/support

**Challenges:**
- Manufacturing defects
- Supplier delays
- Inventory holding costs
- Capacity planning

**NPCs:**
- Suppliers
- Distributors
- Warranty claims
- Quality inspectors

---

### 8. **Custom / Open-Ended** 🎨

**Description:** "Define your own industry and product"

**Features:**
- GM or team provides custom description
- System uses generic templates
- Full flexibility
- Good for unique course scenarios

---

## 🎮 User Flows

### Flow 1: GM Creates Game (Structured Scenario)

```
1. GM: Create New Game
   ├─ Basic Info: Title, Description, Dates
   ├─ Scenario Settings:
   │  ├─ ☑ Force all teams to use same scenario
   │  ├─ Select Archetype: [v] Early-Stage Startup
   │  └─ Select Industry: [v] Tech SaaS
   └─ Create Game ✓

2. Team: Join Game
   ├─ Enter Game Code
   ├─ Team Info: Name, Members
   ├─ Scenario (Auto-assigned):
   │  └─ "Early-Stage Tech SaaS Startup"
   └─ Join ✓
```

**Use Case:** MBA course on startups - all teams should face same challenges for fair comparison.

---

### Flow 2: GM Creates Game (Flexible Scenarios)

```
1. GM: Create New Game
   ├─ Basic Info: Title, Description, Dates
   ├─ Scenario Settings:
   │  ├─ ☐ Force all teams to use same scenario
   │  ├─ Allowed Archetypes: [Select All]
   │  │  ✓ Early-Stage Startup
   │  │  ✓ Product Launch
   │  │  ✓ Turnaround
   │  │  ✓ Scale-Up
   │  │  ✓ Innovation
   │  └─ Allowed Industries: [Select All]
   │     ✓ Tech SaaS
   │     ✓ E-Commerce
   │     ✓ Food & Beverage
   │     ... (all checked)
   └─ Create Game ✓

2. Team: Join Game
   ├─ Enter Game Code
   ├─ Team Info: Name, Members
   ├─ Choose Your Scenario:
   │  ├─ Archetype: [v] Product Launch
   │  ├─ Industry: [v] E-Commerce
   │  ├─ Preview: "You're launching a new product line..."
   │  └─ Customize (Optional):
   │     ├─ Company Name: "Sunset Apparel"
   │     └─ Product: "sustainable activewear"
   └─ Join ✓
```

**Use Case:** Entrepreneurship course - students choose industries they're interested in, increases engagement.

---

### Flow 3: GM Creates Game (Limited Options)

```
1. GM: Create New Game
   ├─ Basic Info: Title, Description, Dates
   ├─ Scenario Settings:
   │  ├─ ☐ Force all teams to use same scenario
   │  ├─ Allowed Archetypes:
   │  │  ✓ Turnaround
   │  │  ✓ Product Launch (only 2 allowed)
   │  └─ Allowed Industries:
   │     ✓ Retail
   │     ✓ Food & Beverage (only 2 allowed)
   └─ Create Game ✓

2. Team: Join Game
   ├─ Choose Your Scenario:
   │  ├─ [Turnaround - Retail]
   │  ├─ [Turnaround - Food & Beverage]
   │  ├─ [Product Launch - Retail]
   │  └─ [Product Launch - Food & Beverage]
   └─ Preview each, pick one ✓
```

**Use Case:** Business strategy course focused on turnarounds and product launches in consumer markets.

---

## 🗄️ Database Schema

### New Tables

```sql
-- Company archetypes (pre-defined)
CREATE TABLE company_archetypes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    starting_cash INTEGER NOT NULL,
    starting_team_size INTEGER NOT NULL,
    starting_metrics JSONB NOT NULL,
    difficulty_modifier DECIMAL(3,2) DEFAULT 1.0,
    narrative_template_set VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Industry types (pre-defined)
CREATE TABLE industry_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    product_examples TEXT[],
    npc_set VARCHAR(50),
    challenge_focus TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Modified Tables

```sql
-- Games table: Add scenario constraints
ALTER TABLE games ADD COLUMN allowed_archetypes TEXT[];  -- NULL = all
ALTER TABLE games ADD COLUMN allowed_industries TEXT[];  -- NULL = all
ALTER TABLE games ADD COLUMN force_same_scenario BOOLEAN DEFAULT false;
ALTER TABLE games ADD COLUMN default_archetype VARCHAR(50) REFERENCES company_archetypes(id);
ALTER TABLE games ADD COLUMN default_industry VARCHAR(50) REFERENCES industry_types(id);

-- Teams table: Add scenario selection
ALTER TABLE teams ADD COLUMN archetype_id VARCHAR(50) REFERENCES company_archetypes(id);
ALTER TABLE teams ADD COLUMN industry_id VARCHAR(50) REFERENCES industry_types(id);
ALTER TABLE teams ADD COLUMN company_name VARCHAR(255);  -- Custom name
ALTER TABLE teams ADD COLUMN product_description TEXT;   -- Custom product
```

---

## 🔌 API Endpoints

### Reference Data

```typescript
// Get available archetypes
GET /api/archetypes
Response: {
  archetypes: CompanyArchetype[]
}

// Get available industries
GET /api/industries
Response: {
  industries: IndustryType[]
}

// Get scenario preview
GET /api/scenarios/preview?archetype=startup&industry=saas
Response: {
  scenario: {
    name: "Early-Stage Tech SaaS Startup",
    description: "...",
    starting_conditions: {...},
    example_challenges: [...],
    example_npcs: [...]
  }
}
```

### Game Creation (Enhanced)

```typescript
POST /api/gm/games
Body: {
  title: string,
  description: string,
  allowed_archetypes?: string[],  // NULL = all
  allowed_industries?: string[],  // NULL = all
  force_same_scenario?: boolean,
  default_archetype?: string,  // If forced
  default_industry?: string    // If forced
}
```

### Team Join (Enhanced)

```typescript
POST /api/teams/join
Body: {
  game_code: string,
  team_name: string,
  members: string[],
  // NEW: Scenario selection
  archetype_id: string,
  industry_id: string,
  company_name?: string,      // Custom company name
  product_description?: string // Custom product
}
```

### Team Dashboard (Enhanced)

```typescript
GET /api/teams/:id/dashboard
Response: {
  team: {
    ...existing fields...,
    scenario: {
      archetype: CompanyArchetype,
      industry: IndustryType,
      company_name: string,
      product_description: string
    }
  },
  metrics: {...},
  session: {...}
}
```

---

## 🎨 Frontend Components

### GM Dashboard

#### 1. Game Creation Form (Enhanced)

```tsx
// gm-dashboard/src/pages/CreateGamePage.tsx

<section>
  <h3>Scenario Settings</h3>

  <label>
    <input type="checkbox" checked={forceSameScenario} />
    All teams use the same scenario
  </label>

  {forceSameScenario ? (
    <>
      <label>Company Stage</label>
      <select value={defaultArchetype}>
        <option value="startup">Early-Stage Startup</option>
        <option value="product_launch">Product Launch</option>
        <option value="turnaround">Turnaround</option>
        <option value="scale_up">Scale-Up</option>
        <option value="innovation">Innovation</option>
      </select>

      <label>Industry</label>
      <select value={defaultIndustry}>
        <option value="saas">Tech SaaS</option>
        <option value="ecommerce">E-Commerce</option>
        <option value="food">Food & Beverage</option>
        ...
      </select>

      <ScenarioPreview
        archetype={defaultArchetype}
        industry={defaultIndustry}
      />
    </>
  ) : (
    <>
      <label>Allowed Company Stages</label>
      <CheckboxGroup
        options={archetypes}
        selected={allowedArchetypes}
        onChange={setAllowedArchetypes}
      />

      <label>Allowed Industries</label>
      <CheckboxGroup
        options={industries}
        selected={allowedIndustries}
        onChange={setAllowedIndustries}
      />
    </>
  )}
</section>
```

#### 2. Game Details Page (Show Team Scenarios)

```tsx
// gm-dashboard/src/pages/GameDetailsPage.tsx

<section className="teams-section">
  <h2>Teams</h2>

  {teams.map(team => (
    <div key={team.id} className="team-card">
      <h3>{team.name}</h3>
      <div className="scenario-badge">
        {team.archetype.icon} {team.archetype.name}
        {" - "}
        {team.industry.icon} {team.industry.name}
      </div>
      {team.company_name && (
        <p className="company-name">"{team.company_name}"</p>
      )}
      <p>Score: {team.overall_score}</p>
    </div>
  ))}
</section>
```

### Team Player Frontend

#### 1. Join Game Flow (Scenario Selection)

```tsx
// src/pages/JoinGamePage.tsx

<Step title="Choose Your Scenario">
  <p>Select the type of company you want to run:</p>

  <div className="archetype-grid">
    {allowedArchetypes.map(archetype => (
      <ArchetypeCard
        key={archetype.id}
        archetype={archetype}
        selected={selectedArchetype === archetype.id}
        onClick={() => setSelectedArchetype(archetype.id)}
      />
    ))}
  </div>

  <div className="industry-grid">
    {allowedIndustries.map(industry => (
      <IndustryCard
        key={industry.id}
        industry={industry}
        selected={selectedIndustry === industry.id}
        onClick={() => setSelectedIndustry(industry.id)}
      />
    ))}
  </div>

  <ScenarioPreview
    archetype={archetypes.find(a => a.id === selectedArchetype)}
    industry={industries.find(i => i.id === selectedIndustry)}
  />

  <h4>Customize (Optional)</h4>
  <input
    placeholder="Company Name (e.g., Sunset Coffee Co.)"
    value={companyName}
    onChange={e => setCompanyName(e.target.value)}
  />
  <input
    placeholder="Product/Service (e.g., artisan cold brew)"
    value={productDescription}
    onChange={e => setProductDescription(e.target.value)}
  />

  <button onClick={handleNext}>Continue →</button>
</Step>
```

#### 2. Dashboard (Show Scenario Context)

```tsx
// src/pages/PlayerGame.tsx

<header className="team-header">
  <h1>{team.name}</h1>
  {team.company_name && (
    <p className="company-name">"{team.company_name}"</p>
  )}
  <div className="scenario-info">
    <span className="badge">
      {team.archetype.icon} {team.archetype.name}
    </span>
    <span className="badge">
      {team.industry.icon} {team.industry.name}
    </span>
  </div>
</header>
```

---

## 🎭 Narrative Integration

### Template Customization

**Problem:** Generic narratives don't work for all scenarios

**Solution:** Template variables + conditional templates

```typescript
// Narrative template with scenario awareness
const templates = {
  high_financial_score: {
    // GENERIC (fallback)
    generic: {
      title: "Strong Financial Performance",
      content: "{{team_name}} shows impressive financial metrics..."
    },

    // SCENARIO-SPECIFIC
    startup_saas: {
      title: "{{company_name}} Secures Series A Funding",
      content: "After months of strong MRR growth, {{company_name}} has closed a $2M Series A round. Investors cite your {{product}} as having 'transformative potential in the {{industry}} space.'"
    },

    turnaround_retail: {
      title: "Turnaround Success: {{company_name}} Returns to Profitability",
      content: "For the first time in 18 months, {{company_name}} has posted a profitable quarter. Analysts credit the strategic pivot in your {{product}} line..."
    },

    product_launch_food: {
      title: "{{product}} Launch Exceeds Expectations",
      content: "{{company_name}}'s new {{product}} line sold out in the first week. Food critics are calling it 'a game-changer' and customers are demanding more..."
    }
  }
};

// Select appropriate template
function selectTemplate(event: string, team: Team): Template {
  const scenarioKey = `${team.archetype_id}_${team.industry_id}`;
  const template = templates[event][scenarioKey] || templates[event].generic;
  return template;
}
```

### NPC Customization

```typescript
// Industry-specific NPCs
const npcs = {
  saas: {
    investor: "Sarah Chen (VC Partner, focused on SaaS metrics)",
    customer: "John Mitchell (IT Director, enterprise buyer)",
    employee: "Lisa Wang (Senior Engineer)"
  },

  food: {
    investor: "Marcus Thompson (Restaurant Group Owner)",
    customer: "Emma Rodriguez (Food Blogger)",
    employee: "Chef Andre Martin"
  },

  retail: {
    investor: "David Park (Retail Investor)",
    customer: "Jessica Lee (Loyal Customer)",
    employee: "Sam Wilson (Store Manager)"
  }
};
```

---

## 📊 Metrics & Starting Conditions

### Archetype-Based Starting Metrics

```typescript
const archetypeMetrics: Record<string, Metrics> = {
  startup: {
    financial: 40,
    operations: 45,
    marketing: 35,
    hr: 50,
    customer_satisfaction: 30,
    overall: 40
  },

  product_launch: {
    financial: 60,
    operations: 65,
    marketing: 55,
    hr: 60,
    customer_satisfaction: 58,
    overall: 60
  },

  turnaround: {
    financial: 35,
    operations: 40,
    marketing: 30,
    hr: 25,
    customer_satisfaction: 28,
    overall: 32
  },

  scale_up: {
    financial: 70,
    operations: 50,
    marketing: 75,
    hr: 55,
    customer_satisfaction: 68,
    overall: 64
  },

  innovation: {
    financial: 55,
    operations: 60,
    marketing: 50,
    hr: 65,
    customer_satisfaction: 52,
    overall: 56
  }
};
```

### Industry-Based Challenge Focus

```typescript
const industryChallenges: Record<string, string[]> = {
  saas: ['customer_acquisition', 'churn', 'pricing', 'features', 'infrastructure'],
  ecommerce: ['inventory', 'shipping', 'returns', 'marketing', 'suppliers'],
  food: ['location', 'suppliers', 'menu', 'health_safety', 'branding'],
  healthcare: ['compliance', 'outcomes', 'insurance', 'privacy', 'clinical'],
  services: ['utilization', 'pricing', 'talent', 'client_retention', 'scope'],
  education: ['content', 'engagement', 'outcomes', 'pricing', 'instructors'],
  manufacturing: ['supply_chain', 'quality', 'capacity', 'distribution', 'warranty'],
  custom: ['general'] // Generic challenges
};
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('Scenario Selection', () => {
  it('should apply archetype starting metrics when team joins', async () => {
    const team = await joinTeam({
      archetype_id: 'startup',
      industry_id: 'saas'
    });

    expect(team.metrics.financial).toBe(40); // Startup defaults
    expect(team.metrics.overall_score).toBe(40);
  });

  it('should filter allowed scenarios based on game settings', async () => {
    const game = await createGame({
      allowed_archetypes: ['startup', 'product_launch'],
      allowed_industries: ['saas', 'ecommerce']
    });

    const scenarios = await getAvailableScenarios(game.id);
    expect(scenarios).toHaveLength(4); // 2×2 combinations
  });

  it('should select scenario-specific narrative template', () => {
    const team = { archetype_id: 'startup', industry_id: 'saas' };
    const template = selectTemplate('high_financial_score', team);

    expect(template.title).toContain('Series A');
  });
});
```

### E2E Tests

```typescript
test('should allow team to select scenario when joining game', async ({ page }) => {
  // GM creates game with multiple scenarios allowed
  await createGame({
    allowed_archetypes: ['startup', 'product_launch'],
    allowed_industries: ['saas', 'food']
  });

  // Team joins and selects scenario
  await page.goto('/join');
  await page.fill('input[placeholder="Game Code"]', gameCode);
  await page.click('button:has-text("Next")');

  // Scenario selection screen
  await expect(page.getByText('Choose Your Scenario')).toBeVisible();

  // Select startup + SaaS
  await page.click('[data-archetype="startup"]');
  await page.click('[data-industry="saas"]');

  // Preview shows
  await expect(page.getByText(/Early-Stage Tech SaaS Startup/)).toBeVisible();

  // Customize
  await page.fill('input[placeholder="Company Name"]', 'CloudFlow');
  await page.fill('input[placeholder="Product/Service"]', 'team collaboration tool');

  // Join
  await page.click('button:has-text("Join Game")');

  // Dashboard shows scenario
  await expect(page.getByText('CloudFlow')).toBeVisible();
  await expect(page.getByText(/Early-Stage Startup/)).toBeVisible();
});
```

---

## 📅 Implementation Plan

### Phase 1: Data Model & Backend (Week 1)

**Tasks:**
- ✅ Database schema already has basics
- ⬜ Create migration to add scenario columns to `games` and `teams`
- ⬜ Create `company_archetypes` and `industry_types` tables
- ⬜ Seed initial archetype and industry data (8+ each)
- ⬜ Create `ArchetypeModel` and `IndustryModel`
- ⬜ Update `GameModel.create()` to accept scenario settings
- ⬜ Update `TeamModel.create()` to accept scenario selection
- ⬜ Create API endpoints for reference data (`/api/archetypes`, `/api/industries`)
- ⬜ Update game creation endpoint
- ⬜ Update team join endpoint

**Deliverables:**
- API supports scenario selection
- Database stores scenario data
- Seed data includes 5 archetypes, 8 industries

### Phase 2: GM Dashboard UI (Week 2)

**Tasks:**
- ⬜ Update `CreateGamePage.tsx` with scenario settings
- ⬜ Create `ScenarioSettingsSection.tsx` component
- ⬜ Create `ArchetypeSelector.tsx` component
- ⬜ Create `IndustrySelector.tsx` component
- ⬜ Create `ScenarioPreview.tsx` component
- ⬜ Update `GameDetailsPage.tsx` to show team scenarios
- ⬜ Update `TeamsTable.tsx` to show scenario badges
- ⬜ Add scenario filter to team list

**Deliverables:**
- GM can configure scenarios when creating game
- GM can see which scenarios teams chose
- Preview system works

### Phase 3: Team Player UI (Week 2-3)

**Tasks:**
- ⬜ Update `JoinGamePage.tsx` with scenario selection step
- ⬜ Create `ScenarioSelectionStep.tsx` component
- ⬜ Create `ArchetypeCard.tsx` component
- ⬜ Create `IndustryCard.tsx` component
- ⬜ Create `ScenarioCustomization.tsx` component
- ⬜ Update `PlayerGame.tsx` to show scenario context
- ⬜ Update dashboard header with company name/badges
- ⬜ Update session cards to use scenario-specific language

**Deliverables:**
- Teams can select scenarios during join
- Dashboard shows scenario context
- Company name appears throughout interface

### Phase 4: Narrative Integration (Week 3)

**Tasks:**
- ⬜ Create scenario-specific narrative templates (20+ templates × 5 scenarios = 100 templates)
- ⬜ Update `NarrativeService` to use scenario context
- ⬜ Create industry-specific NPC definitions
- ⬜ Update template selection logic
- ⬜ Update morning briefings to be scenario-aware
- ⬜ Create scenario-specific email templates
- ⬜ Test narrative generation across all scenarios

**Deliverables:**
- Narratives adapt to scenario
- NPCs are industry-appropriate
- All combinations tested

### Phase 5: Testing & Polish (Week 4)

**Tasks:**
- ⬜ Write unit tests for scenario logic
- ⬜ Write E2E tests for scenario selection
- ⬜ Test all archetype × industry combinations
- ⬜ Test forced scenario mode
- ⬜ Test flexible scenario mode
- ⬜ UI/UX polish
- ⬜ Documentation for GMs
- ⬜ Student-facing scenario descriptions

**Deliverables:**
- All tests passing
- Documentation complete
- Ready for pilot

---

## 🎓 GM Training & Documentation

### Quick Start Guide

**"How to Choose Scenarios for Your Course"**

**Option 1: Everyone Plays the Same**
- ✅ Best for: Fair comparison, standardized learning
- Use when: You want to compare teams directly
- Example: "All teams run early-stage SaaS startups"

**Option 2: Limited Choices**
- ✅ Best for: Focused learning with some variety
- Use when: Course has specific themes (e.g., turnarounds)
- Example: "Choose between retail or restaurant turnaround"

**Option 3: Full Flexibility**
- ✅ Best for: Student engagement, entrepreneurship courses
- Use when: Personal interest drives learning
- Example: "Pick any industry you're passionate about"

---

## 💡 Future Enhancements

### Advanced Features (Post-MVP)

1. **Custom Archetypes**
   - GMs create their own archetypes
   - Save and reuse across games
   - Share with other GMs

2. **Scenario Marketplace**
   - Browse community-created scenarios
   - Download popular combinations
   - Rate and review

3. **Dynamic Difficulty**
   - Scenarios adapt based on performance
   - Struggling teams get easier challenges
   - High performers face harder scenarios

4. **Scenario Analytics**
   - Which scenarios are most engaging?
   - Which lead to best learning outcomes?
   - Optimize scenario balance

5. **Multi-Company Games**
   - Teams compete as different companies
   - Scenario affects competitive dynamics
   - Industry-specific leaderboards

---

## ✅ Success Criteria

**Must Have (MVP):**
- ✅ 5+ company archetypes
- ✅ 8+ industry types
- ✅ GM can force one scenario or allow choice
- ✅ Teams can select from allowed scenarios
- ✅ Starting metrics vary by archetype
- ✅ Narratives adapt to scenario
- ✅ Company name appears in UI
- ✅ E2E tests pass

**Should Have:**
- ⭕ Custom company/product names
- ⭕ Scenario preview before selection
- ⭕ Scenario-specific NPCs
- ⭕ Industry-specific challenges

**Could Have:**
- ⭕ Custom archetype creation
- ⭕ Scenario analytics
- ⭕ AI-generated scenario suggestions

---

## 🏁 Conclusion

The Scenario Customization System solves a critical limitation of the current simulation: **lack of context and relatability**.

**Benefits:**
- 📈 **Higher engagement** - students pick industries they care about
- 🎯 **Better learning** - scenarios match course objectives
- 🌍 **More realistic** - specific industries have specific challenges
- 🎨 **Flexibility** - works for startup courses AND corporate strategy courses

**Next Steps:**
1. Review and approve this design
2. Decide on MVP scope (all features or subset?)
3. Create implementation tasks
4. Begin Phase 1 (backend infrastructure)

**Estimated Effort:** ~100 hours over 4 weeks

---

**Questions for Discussion:**

1. **Archetype Balance:** Should all archetypes have same difficulty or vary?
2. **Narrative Workload:** How many scenario-specific templates are essential vs. nice-to-have?
3. **Team Comparison:** If teams pick different scenarios, how do we compare them fairly on leaderboard?
4. **Industry Coverage:** Are these 8 industries sufficient or should we add more?
5. **Custom Scenarios:** Should MVP include custom scenario creation or wait for Phase 2?

Ready to discuss and refine this design!
