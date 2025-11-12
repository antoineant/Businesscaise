# 🏢 Company Scenario Customization System - Design Document

**Status:** Design for Review
**Date:** November 12, 2025
**Priority:** High - Essential for Educational Flexibility
**Control Model:** GM-Controlled (like traditional RPG)

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
Allow GMs to choose **Company Archetypes** and **Industry/Product Types** that customize:
- Starting metrics and conditions
- Challenge types and difficulty
- Narrative templates and NPCs
- Success criteria

---

## 🎨 Design Philosophy

### GM-Controlled Scenario System

```
GM DECIDES EVERYTHING (Game Settings)
  ↓ Sets company archetype for the game
  ↓ Sets industry type for the game
  ↓ Defines the world teams play in
  ↓ Like a DM creating the adventure in D&D

SYSTEM ADAPTS (Dynamic)
  ↓ Narratives, challenges, NPCs adapt to GM's scenario
  ↓ All teams experience the same scenario
```

**Key Principle:** The GM is the Game Master who orchestrates the entire simulation. Teams play within the world the GM creates, just like players in a tabletop RPG.

**Benefits:**
- **GM Authority:** Full control over scenario and difficulty
- **Consistency:** All teams face identical conditions for fair comparison
- **Simplicity:** No team-level customization complexity
- **Flexibility:** GM creates different games for different course needs
- **Focus:** Teams focus on strategy, not scenario selection

**Use Cases:**
- **Startup Course:** GM creates "Early-Stage SaaS Startup" game
- **Turnaround Course:** GM creates "Struggling Retail Turnaround" game
- **Product Launch Course:** GM creates "Established Company Launching New Product" game
- **Multi-Scenario Course:** GM runs multiple games with different scenarios

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

// Game Model Enhancement
interface Game {
  // ... existing fields ...
  archetype_id: string;  // GM-selected archetype
  industry_id: string;   // GM-selected industry
  company_name?: string; // Optional: GM-defined company name
  product_name?: string; // Optional: GM-defined product
}

// Teams inherit scenario from game
interface Team {
  // ... existing fields ...
  // NO scenario fields - they inherit from game
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
- GM provides custom description
- System uses generic templates
- Full flexibility
- Good for unique course scenarios

---

## 🎮 User Flows

### Flow 1: GM Creates Game with Scenario

```
1. GM: Create New Game
   ├─ Basic Info: Title, Description, Dates
   ├─ Scenario Settings:
   │  ├─ Select Company Archetype: [v] Early-Stage Startup
   │  ├─ Select Industry: [v] Tech SaaS
   │  ├─ Preview: Shows starting metrics, challenges, NPCs
   │  └─ Optional Customization:
   │     ├─ Company Name: "CloudFlow"
   │     └─ Product Name: "team collaboration tool"
   └─ Create Game ✓

2. Team: Join Game
   ├─ Enter Game Code
   ├─ Team Info: Name, Members
   ├─ Scenario Display (Read-Only):
   │  └─ "You're running an Early-Stage Tech SaaS Startup"
   │  └─ Shows company context, starting conditions
   └─ Join ✓

3. All Teams:
   └─ Play in the same scenario
   └─ Fair comparison possible
```

**Use Case:** MBA startup course - all teams face same SaaS startup challenges.

---

### Flow 2: GM Creates Multiple Games for Different Scenarios

```
1. GM: Create Game 1
   ├─ Title: "Startup Challenge - SaaS"
   ├─ Scenario: Early-Stage Startup + Tech SaaS
   └─ Students interested in startups join this game

2. GM: Create Game 2
   ├─ Title: "Turnaround Challenge - Retail"
   ├─ Scenario: Turnaround + E-Commerce
   └─ Students interested in turnarounds join this game

3. GM: Create Game 3
   ├─ Title: "Product Launch - Food"
   ├─ Scenario: Product Launch + Food & Beverage
   └─ Students interested in food industry join this game
```

**Use Case:** Entrepreneurship course with multiple sections, each focused on different scenarios.

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
-- Games table: Add GM-selected scenario
ALTER TABLE games ADD COLUMN archetype_id VARCHAR(50) REFERENCES company_archetypes(id);
ALTER TABLE games ADD COLUMN industry_id VARCHAR(50) REFERENCES industry_types(id);
ALTER TABLE games ADD COLUMN company_name VARCHAR(255);     -- Optional: GM-defined
ALTER TABLE games ADD COLUMN product_description TEXT;      -- Optional: GM-defined

-- Teams table: NO changes needed
-- Teams inherit scenario from their game
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
  start_date: string,
  end_date: string,
  // NEW: Scenario selection
  archetype_id: string,  // REQUIRED
  industry_id: string,   // REQUIRED
  company_name?: string,      // Optional custom name
  product_description?: string // Optional custom product
}

Response: {
  game: {
    id: string,
    ...existing fields...,
    scenario: {
      archetype: CompanyArchetype,
      industry: IndustryType,
      company_name: string,
      product_description: string
    }
  }
}
```

### Team Join (Unchanged)

```typescript
POST /api/teams/join
Body: {
  game_code: string,
  team_name: string,
  members: string[]
  // NO scenario selection - teams inherit from game
}
```

### Team Dashboard (Enhanced)

```typescript
GET /api/teams/:id/dashboard
Response: {
  team: {
    ...existing fields...
  },
  game: {
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

### Starting Metrics (New Logic)

```typescript
// When team joins, initialize with archetype's starting metrics
POST /api/teams/join (internal logic)
1. Get game.archetype_id
2. Load archetype starting metrics
3. Initialize team with those metrics
4. Apply archetype.starting_cash
```

---

## 🎨 Frontend Components

### GM Dashboard

#### 1. Game Creation Form (Enhanced)

**File:** `gm-dashboard/src/pages/CreateGamePage.tsx`

```tsx
<form onSubmit={handleCreateGame}>
  {/* Existing fields */}
  <input label="Game Title" {...} />
  <textarea label="Description" {...} />
  <input type="date" label="Start Date" {...} />
  <input type="date" label="End Date" {...} />

  {/* NEW: Scenario Settings */}
  <section className="scenario-settings">
    <h3>Scenario Settings</h3>
    <p>Define what type of company teams will be running</p>

    <label>Company Stage</label>
    <select
      value={archetypeId}
      onChange={e => setArchetypeId(e.target.value)}
      required
    >
      <option value="">Select archetype...</option>
      <option value="startup">🚀 Early-Stage Startup</option>
      <option value="product_launch">📦 Product Launch</option>
      <option value="turnaround">📈 Turnaround / Revival</option>
      <option value="scale_up">🌟 Scale-Up</option>
      <option value="innovation">🔬 Innovation Focus</option>
    </select>

    <label>Industry</label>
    <select
      value={industryId}
      onChange={e => setIndustryId(e.target.value)}
      required
    >
      <option value="">Select industry...</option>
      <option value="saas">💻 Tech SaaS</option>
      <option value="ecommerce">🛍️ E-Commerce / Retail</option>
      <option value="food">🍕 Food & Beverage</option>
      <option value="healthcare">🏥 Healthcare / Wellness</option>
      <option value="services">💼 Professional Services</option>
      <option value="education">📚 Education / EdTech</option>
      <option value="manufacturing">🏭 Manufacturing / Hardware</option>
      <option value="custom">🎨 Custom / Open-Ended</option>
    </select>

    {archetypeId && industryId && (
      <ScenarioPreview
        archetypeId={archetypeId}
        industryId={industryId}
      />
    )}

    <h4>Customize (Optional)</h4>
    <input
      label="Company Name"
      placeholder="e.g., CloudFlow, Sunset Coffee, etc."
      value={companyName}
      onChange={e => setCompanyName(e.target.value)}
    />
    <input
      label="Product/Service"
      placeholder="e.g., team collaboration tool, artisan coffee"
      value={productDescription}
      onChange={e => setProductDescription(e.target.value)}
    />
  </section>

  <button type="submit">Create Game</button>
</form>
```

#### 2. Scenario Preview Component

**File:** `gm-dashboard/src/components/ScenarioPreview.tsx`

```tsx
interface ScenarioPreviewProps {
  archetypeId: string;
  industryId: string;
}

export function ScenarioPreview({ archetypeId, industryId }: ScenarioPreviewProps) {
  const { data: preview } = useQuery(
    ['scenario-preview', archetypeId, industryId],
    () => api.get(`/scenarios/preview?archetype=${archetypeId}&industry=${industryId}`)
  );

  if (!preview) return null;

  return (
    <div className="scenario-preview card">
      <h4>{preview.name}</h4>
      <p>{preview.description}</p>

      <div className="starting-conditions">
        <h5>Starting Conditions</h5>
        <ul>
          <li>Cash: ${preview.starting_cash.toLocaleString()}</li>
          <li>Team Size: {preview.starting_team_size} employees</li>
          <li>Overall Score: {preview.starting_metrics.overall}</li>
        </ul>
      </div>

      <div className="challenges">
        <h5>Focus Areas</h5>
        <ul>
          {preview.focus_areas.map((area: string) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

#### 3. Game Details Page (Show Scenario)

**File:** `gm-dashboard/src/pages/GameDetailsPage.tsx`

```tsx
<section className="game-scenario">
  <h2>Scenario</h2>
  <div className="scenario-card">
    <div className="scenario-header">
      <span className="badge">
        {game.scenario.archetype.icon} {game.scenario.archetype.name}
      </span>
      <span className="badge">
        {game.scenario.industry.icon} {game.scenario.industry.name}
      </span>
    </div>
    {game.company_name && (
      <p className="company-name">Company: "{game.company_name}"</p>
    )}
    {game.product_description && (
      <p className="product">Product: {game.product_description}</p>
    )}
    <p className="description">{game.scenario.archetype.description}</p>
  </div>
</section>

<section className="teams-section">
  <h2>Teams</h2>
  <p className="info">All teams are playing in the same scenario</p>

  {teams.map(team => (
    <div key={team.id} className="team-card">
      <h3>{team.name}</h3>
      <p>Score: {team.overall_score}</p>
      <p>Members: {team.members.length}</p>
    </div>
  ))}
</section>
```

### Team Player Frontend

#### 1. Join Game Flow (Show Scenario)

**File:** `src/pages/JoinGamePage.tsx`

```tsx
// After entering game code, fetch game details
const { data: gameInfo } = useQuery(['game-info', gameCode], () =>
  api.get(`/games/info/${gameCode}`)
);

<Step title="Join Game">
  <div className="game-info">
    <h2>{gameInfo.title}</h2>
    <p>{gameInfo.description}</p>

    {/* Show scenario (read-only) */}
    <div className="scenario-info card">
      <h3>Your Company Scenario</h3>
      <div className="badges">
        <span className="badge">
          {gameInfo.scenario.archetype.icon} {gameInfo.scenario.archetype.name}
        </span>
        <span className="badge">
          {gameInfo.scenario.industry.icon} {gameInfo.scenario.industry.name}
        </span>
      </div>
      {gameInfo.company_name && (
        <p className="company-name">Company: "{gameInfo.company_name}"</p>
      )}
      <p className="description">{gameInfo.scenario.archetype.description}</p>

      <div className="starting-conditions">
        <h4>You'll start with:</h4>
        <ul>
          <li>Cash: ${gameInfo.scenario.archetype.starting_cash.toLocaleString()}</li>
          <li>Team Size: {gameInfo.scenario.archetype.starting_team_size} employees</li>
          <li>Overall Score: {gameInfo.scenario.archetype.starting_metrics.overall}</li>
        </ul>
      </div>
    </div>

    {/* Team registration */}
    <input label="Team Name" {...} />
    <button>Join Game</button>
  </div>
</Step>
```

#### 2. Dashboard (Show Scenario Context)

**File:** `src/pages/PlayerGame.tsx`

```tsx
<header className="team-header">
  <h1>{team.name}</h1>

  {/* Show scenario context */}
  <div className="scenario-context">
    {game.company_name ? (
      <p className="company-name">"{game.company_name}"</p>
    ) : (
      <p className="company-type">
        {game.scenario.archetype.name} - {game.scenario.industry.name}
      </p>
    )}
    {game.product_description && (
      <p className="product-description">{game.product_description}</p>
    )}
  </div>

  <div className="scenario-badges">
    <span className="badge" title={game.scenario.archetype.description}>
      {game.scenario.archetype.icon} {game.scenario.archetype.name}
    </span>
    <span className="badge">
      {game.scenario.industry.icon} {game.scenario.industry.name}
    </span>
  </div>
</header>
```

---

## 🎭 Narrative Integration

### Template Customization

**Problem:** Generic narratives don't work for all scenarios

**Solution:** Scenario-aware template selection with variable substitution

```typescript
// Narrative template with scenario awareness
const templates = {
  high_financial_score: {
    // GENERIC (fallback)
    generic: {
      title: "Strong Financial Performance",
      content: "Your company shows impressive financial metrics this quarter..."
    },

    // SCENARIO-SPECIFIC (archetype_industry)
    startup_saas: {
      title: "Series A Funding Secured",
      content: "After months of strong MRR growth, {{company_name}} has closed a $2M Series A round. Investors cite your {{product}} as having 'transformative potential in the SaaS space.'"
    },

    turnaround_ecommerce: {
      title: "Turnaround Success: Return to Profitability",
      content: "For the first time in 18 months, {{company_name}} has posted a profitable quarter. Analysts credit the strategic pivot in your {{product}} offerings..."
    },

    product_launch_food: {
      title: "{{product}} Launch Exceeds Expectations",
      content: "The new {{product}} line sold out in the first week. Food critics are calling it 'a game-changer' and customers are demanding more..."
    }
  },

  low_customer_satisfaction: {
    generic: {
      title: "Customer Complaints Rising",
      content: "Customer satisfaction has dropped significantly..."
    },

    startup_saas: {
      title: "Churn Alert: Customers Canceling",
      content: "Your {{product}} is experiencing higher-than-expected churn. Users complain about bugs and missing features..."
    },

    turnaround_ecommerce: {
      title: "Reviews Turning Negative",
      content: "{{company_name}}'s online reviews have taken a turn for the worse. Customers cite shipping delays and quality issues with {{product}}..."
    }
  }
};

// Template selection logic
function selectTemplate(event: string, game: Game): Template {
  const scenarioKey = `${game.archetype_id}_${game.industry_id}`;
  const template = templates[event][scenarioKey] || templates[event].generic;

  // Variable substitution
  return {
    title: substituteVars(template.title, game),
    content: substituteVars(template.content, game)
  };
}

function substituteVars(text: string, game: Game): string {
  return text
    .replace(/\{\{company_name\}\}/g, game.company_name || 'Your company')
    .replace(/\{\{product\}\}/g, game.product_description || 'your product');
}
```

### NPC Customization

```typescript
// Industry-specific NPCs
const npcs = {
  saas: {
    investor: {
      name: "Sarah Chen",
      role: "VC Partner",
      focus: "SaaS metrics (MRR, CAC, churn)"
    },
    customer: {
      name: "John Mitchell",
      role: "IT Director",
      focus: "Enterprise buyer, security concerns"
    },
    employee: {
      name: "Lisa Wang",
      role: "Senior Engineer",
      focus: "Technical infrastructure, scaling"
    }
  },

  food: {
    investor: {
      name: "Marcus Thompson",
      role: "Restaurant Group Owner",
      focus: "Location, margins, expansion"
    },
    customer: {
      name: "Emma Rodriguez",
      role: "Food Blogger",
      focus: "Quality, experience, authenticity"
    },
    employee: {
      name: "Chef Andre Martin",
      role: "Head Chef",
      focus: "Menu, quality, suppliers"
    }
  },

  ecommerce: {
    investor: {
      name: "David Park",
      role: "Retail Investor",
      focus: "Inventory turns, margins, growth"
    },
    customer: {
      name: "Jessica Lee",
      role: "Loyal Customer",
      focus: "Shipping, returns, product quality"
    },
    employee: {
      name: "Sam Wilson",
      role: "Operations Manager",
      focus: "Logistics, inventory, fulfillment"
    }
  }
};

// Select NPCs based on game industry
function getNPCs(game: Game) {
  return npcs[game.industry_id] || npcs.generic;
}
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
describe('Scenario System', () => {
  it('should initialize team with archetype starting metrics', async () => {
    const game = await createGame({
      archetype_id: 'startup',
      industry_id: 'saas'
    });

    const team = await joinGame(game.game_code, {
      team_name: 'Test Team',
      members: ['alice@test.com']
    });

    expect(team.metrics.financial).toBe(40); // Startup defaults
    expect(team.metrics.overall_score).toBe(40);
    expect(team.cash).toBe(25000);
  });

  it('should select scenario-specific narrative template', () => {
    const game = {
      archetype_id: 'startup',
      industry_id: 'saas',
      company_name: 'CloudFlow',
      product_description: 'collaboration tool'
    };

    const template = selectTemplate('high_financial_score', game);

    expect(template.title).toContain('Series A');
    expect(template.content).toContain('CloudFlow');
    expect(template.content).toContain('collaboration tool');
  });

  it('should use generic template as fallback', () => {
    const game = {
      archetype_id: 'custom',
      industry_id: 'custom'
    };

    const template = selectTemplate('high_financial_score', game);

    expect(template.title).toBe('Strong Financial Performance');
  });
});
```

### E2E Tests

```typescript
test('GM creates game with scenario and team joins', async ({ page }) => {
  // GM creates game
  await page.goto('http://localhost:3002/games/create');
  await page.getByLabel(/game title/i).fill('Startup Challenge');
  await page.getByLabel(/description/i).fill('SaaS startup simulation');
  await page.getByLabel(/start.*date/i).fill('2025-12-01');
  await page.getByLabel(/end.*date/i).fill('2025-12-15');

  // Select scenario
  await page.getByLabel(/company stage/i).selectOption('startup');
  await page.getByLabel(/industry/i).selectOption('saas');

  // Optional customization
  await page.getByLabel(/company name/i).fill('CloudFlow');
  await page.getByLabel(/product/i).fill('team collaboration tool');

  // Preview should show
  await expect(page.getByText(/Early-Stage Tech SaaS Startup/i)).toBeVisible();

  await page.getByRole('button', { name: /create game/i }).click();

  // Extract game code
  const gameCode = await page.locator('[data-testid="game-code"]').textContent();

  // Team joins game
  const teamPage = await browser.newPage();
  await teamPage.goto('http://localhost:5173/join');
  await teamPage.getByPlaceholder(/game code/i).fill(gameCode);
  await teamPage.getByRole('button', { name: /next/i }).click();

  // Should see scenario info (read-only)
  await expect(teamPage.getByText(/Early-Stage Startup/i)).toBeVisible();
  await expect(teamPage.getByText(/Tech SaaS/i)).toBeVisible();
  await expect(teamPage.getByText(/CloudFlow/i)).toBeVisible();

  // Join
  await teamPage.getByLabel(/team name/i).fill('Team Alpha');
  await teamPage.getByRole('button', { name: /join game/i }).click();

  // Dashboard should show scenario
  await expect(teamPage.getByText(/CloudFlow/i)).toBeVisible();
  await expect(teamPage.getByText(/Early-Stage Startup/i)).toBeVisible();
});
```

---

## 📅 Implementation Plan

### Phase 1: Data Model & Backend (Week 1)

**Tasks:**
- ⬜ Create migration to add scenario columns to `games` table
- ⬜ Create `company_archetypes` and `industry_types` tables
- ⬜ Seed initial archetype and industry data (5 archetypes, 8 industries)
- ⬜ Create `ArchetypeModel` and `IndustryModel`
- ⬜ Update `GameModel.create()` to accept scenario settings
- ⬜ Update `TeamModel.create()` to initialize with archetype metrics
- ⬜ Create API endpoints for reference data (`GET /api/archetypes`, `GET /api/industries`)
- ⬜ Create scenario preview endpoint (`GET /api/scenarios/preview`)
- ⬜ Update game creation endpoint to accept archetype/industry
- ⬜ Update game info endpoint to return scenario details

**Deliverables:**
- API supports scenario selection
- Database stores scenario data
- Teams initialize with archetype metrics
- 5 archetypes, 8 industries seeded

**Estimated Time:** 15-20 hours

---

### Phase 2: GM Dashboard UI (Week 2)

**Tasks:**
- ⬜ Update `CreateGamePage.tsx` with scenario settings section
- ⬜ Create `ScenarioPreview.tsx` component
- ⬜ Add archetype and industry dropdown selectors
- ⬜ Add optional company name and product fields
- ⬜ Fetch and display scenario preview
- ⬜ Update `GameDetailsPage.tsx` to show game scenario
- ⬜ Add scenario badges/cards to game details
- ⬜ Style scenario components

**Deliverables:**
- GM can select scenario when creating game
- Preview shows starting conditions and focus areas
- Game details page shows scenario
- All styling complete

**Estimated Time:** 15-20 hours

---

### Phase 3: Team Player UI (Week 2-3)

**Tasks:**
- ⬜ Create `GET /api/games/info/:code` endpoint (public)
- ⬜ Update `JoinGamePage.tsx` to fetch and show game scenario
- ⬜ Display scenario info (read-only) during join flow
- ⬜ Show starting conditions to teams
- ⬜ Update `PlayerGame.tsx` dashboard header with scenario context
- ⬜ Add company name / scenario badges to header
- ⬜ Update metrics display to show archetype-appropriate language
- ⬜ Style all scenario UI elements

**Deliverables:**
- Teams see scenario when joining
- Dashboard shows scenario context
- Company name appears in header
- All styling complete

**Estimated Time:** 12-15 hours

---

### Phase 4: Narrative Integration (Week 3)

**Tasks:**
- ⬜ Create 25 scenario-specific narrative templates (5 archetypes × 5 common events)
- ⬜ Create 24 industry-specific narrative templates (8 industries × 3 common events)
- ⬜ Update `NarrativeService` to use scenario-aware template selection
- ⬜ Implement variable substitution ({{company_name}}, {{product}})
- ⬜ Create industry-specific NPC definitions
- ⬜ Update morning briefings to be scenario-aware
- ⬜ Update email/news templates to be scenario-aware
- ⬜ Test all combinations (5 archetypes × 8 industries = 40 combinations)

**Deliverables:**
- Narratives adapt to archetype and industry
- NPCs are industry-appropriate
- Variable substitution works
- Generic fallbacks in place

**Estimated Time:** 25-30 hours

---

### Phase 5: Testing & Polish (Week 4)

**Tasks:**
- ⬜ Write unit tests for scenario selection logic
- ⬜ Write unit tests for metrics initialization
- ⬜ Write unit tests for narrative template selection
- ⬜ Write E2E test for GM creating game with scenario
- ⬜ Write E2E test for team joining and seeing scenario
- ⬜ Test 10+ archetype/industry combinations end-to-end
- ⬜ UI/UX polish and refinements
- ⬜ Write GM documentation (how to choose scenarios)
- ⬜ Write student-facing scenario descriptions
- ⬜ Performance testing

**Deliverables:**
- All tests passing
- Documentation complete
- UI polished
- Ready for production

**Estimated Time:** 18-22 hours

---

## 🎓 GM Training & Documentation

### Quick Start Guide

**"How to Choose a Scenario for Your Game"**

**Step 1: Choose Company Archetype (Stage/Situation)**
- **Early-Stage Startup** → Teaching entrepreneurship, product-market fit
- **Product Launch** → Teaching product management, go-to-market strategy
- **Turnaround** → Teaching business strategy, crisis management
- **Scale-Up** → Teaching operations, scaling, org design
- **Innovation** → Teaching R&D management, innovation strategy

**Step 2: Choose Industry**
- **Tech SaaS** → Software, subscriptions, SaaS metrics
- **E-Commerce** → Retail, inventory, logistics
- **Food & Beverage** → Restaurants, food products, hospitality
- **Healthcare** → Medical services, wellness, compliance
- **Professional Services** → Consulting, agencies, B2B services
- **Education** → EdTech, learning platforms, training
- **Manufacturing** → Physical products, supply chain, production
- **Custom** → Define your own

**Step 3: Customize (Optional)**
- Give the company a name (e.g., "CloudFlow")
- Define the specific product/service (e.g., "team collaboration tool")
- This makes narratives more immersive

**Examples:**
- **Startup Course:** Early-Stage Startup + Tech SaaS = "Build the next unicorn"
- **Strategy Course:** Turnaround + E-Commerce = "Save a failing retail business"
- **Product Management:** Product Launch + Food & Beverage = "Launch new menu items"
- **Operations:** Scale-Up + Manufacturing = "Manage explosive growth in production"

---

## 💡 Future Enhancements (Post-MVP)

### Phase 2 Ideas

1. **Custom Archetypes**
   - GMs create their own archetypes
   - Save and reuse across games
   - Share with other GMs via export/import

2. **Scenario Library**
   - Pre-built scenario packages
   - "Restaurant Turnaround Pack"
   - "Tech Startup Bundle"
   - Download and use instantly

3. **AI-Generated Scenarios**
   - Describe your course in plain English
   - AI suggests appropriate archetype/industry
   - AI generates custom company name and product

4. **Scenario Analytics**
   - Which scenarios lead to best engagement?
   - Which archetypes are most challenging?
   - Learning outcome correlation

5. **Multiple Games, Same Course**
   - GM creates 3 different scenario games
   - Students choose which to join
   - Cross-scenario leaderboards with normalization

---

## ✅ Success Criteria

**Must Have (MVP):**
- ✅ 5 company archetypes defined
- ✅ 8 industry types defined
- ✅ GM selects archetype + industry when creating game
- ✅ Teams inherit scenario from game (no selection)
- ✅ Starting metrics vary by archetype
- ✅ Scenario appears in team dashboard
- ✅ Database schema supports scenarios
- ✅ API endpoints complete
- ✅ Unit tests pass
- ✅ E2E tests pass

**Should Have:**
- ⭕ Optional company name and product customization
- ⭕ Scenario preview during game creation
- ⭕ 25+ scenario-specific narrative templates
- ⭕ Industry-specific NPCs
- ⭕ GM documentation

**Could Have (Future):**
- ⭕ Custom archetype creation
- ⭕ Scenario analytics
- ⭕ AI-generated scenarios
- ⭕ Scenario library/marketplace

---

## 🏁 Conclusion

The Scenario Customization System transforms the simulation from generic to contextual, solving a critical limitation.

**Key Changes from Original Design:**
- ✅ **GM controls everything** (like a traditional RPG)
- ✅ **No team selection** (simpler, fairer comparison)
- ✅ **All teams in a game face same scenario**
- ✅ **GM can create multiple games for variety**

**Benefits:**
- 📈 **Higher engagement** - real industry context
- 🎯 **Better learning** - scenarios match course objectives
- 🌍 **More realistic** - specific industries have specific challenges
- 🎨 **Flexibility** - different games for different scenarios
- ⚖️ **Fair comparison** - all teams on level playing field

**Next Steps:**
1. Review and approve this design
2. Prioritize features (full MVP or subset?)
3. Create detailed implementation tasks
4. Begin Phase 1 (backend infrastructure)

**Estimated Effort:** ~85-107 hours over 4 weeks

---

**Questions for Discussion:**

1. **Archetype Balance:** Should turnaround be harder than startup (lower starting metrics = more challenging)?
2. **Narrative Workload:** Focus on 5-10 key templates initially, or build full 25-50 template set?
3. **Industry Coverage:** Are 8 industries sufficient or add more (hospitality, real estate, etc.)?
4. **Customization:** Is optional company name/product essential for MVP or Phase 2?
5. **Multiple Games:** Should we build UI to help GMs manage multiple scenario games in one course?

Ready to begin implementation!
