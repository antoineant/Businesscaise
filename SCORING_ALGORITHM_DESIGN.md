# Business Simulation Scoring Algorithm Design

## Overview

This document outlines a realistic, multi-dimensional scoring system that simulates real business dynamics with interdependent metrics, trade-offs, and cascading effects.

---

## 1. Core Metric Categories

### A. Financial Health (Weight: 30%)

**Components:**
- **Cash Flow** (40%): Revenue - Expenses
- **Profitability** (30%): Profit margin percentage
- **Investment ROI** (20%): Returns on investments made
- **Debt Management** (10%): Debt-to-equity ratio

**Formulas:**
```javascript
cashFlow = revenue - (operatingCosts + hrCosts + marketingCosts + investmentCosts)
profitability = (revenue - totalCosts) / revenue * 100
investmentROI = (investmentGains - investmentCosts) / investmentCosts * 100
debtScore = 100 - (totalDebt / totalAssets * 100)

financialHealth = (
  cashFlow * 0.40 +
  profitability * 0.30 +
  investmentROI * 0.20 +
  debtScore * 0.10
)
```

**Thresholds:**
- Excellent (80-100): Strong cash reserves, high profitability
- Good (60-79): Positive cash flow, moderate profit
- Warning (40-59): Tight cash flow, low margins
- Critical (0-39): Negative cash flow, losses

---

### B. HR & Workforce (Weight: 25%)

**Components:**
- **Employee Satisfaction** (35%): Morale, benefits, work environment
- **Productivity** (30%): Output per employee
- **Talent Retention** (20%): Turnover rate (inverse)
- **Training Effectiveness** (15%): Skill development impact

**Formulas:**
```javascript
employeeSatisfaction = baseScore +
  (trainingBudget / employee_count * 10) +
  (workEnvironmentInvestment * 5) -
  (overtimeHours * 2) -
  (layoffs * 10)

productivity = baseProductivity * (1 + employeeSatisfaction / 100) * (1 + trainingLevel / 100)

talentRetention = 100 - (turnoverRate * 100)

trainingEffectiveness = (trainingBudget / employee_count) * employeeEngagement

hrScore = (
  employeeSatisfaction * 0.35 +
  productivity * 0.30 +
  talentRetention * 0.20 +
  trainingEffectiveness * 0.15
)
```

**Key Relationships:**
- Low satisfaction → Lower productivity, higher turnover
- High training → Better productivity, higher satisfaction
- Overwork → Short-term productivity boost, long-term burnout

---

### C. Operations (Weight: 20%)

**Components:**
- **Production Efficiency** (35%): Output vs capacity
- **Quality Control** (30%): Defect rate (inverse)
- **Inventory Management** (20%): Optimal stock levels
- **Supply Chain** (15%): Delivery reliability

**Formulas:**
```javascript
productionEfficiency = (actualOutput / maxCapacity) * 100 * qualityFactor

qualityControl = 100 - (defectRate * 100)
// Defect rate influenced by: employee productivity, quality budget, production speed

inventoryManagement = 100 - abs(optimalInventory - actualInventory) / optimalInventory * 100

supplyChain = onTimeDeliveryRate * reliabilityFactor

operationsScore = (
  productionEfficiency * 0.35 +
  qualityControl * 0.30 +
  inventoryManagement * 0.20 +
  supplyChain * 0.15
)
```

**Trade-offs:**
- High production speed → More output, but potential quality issues
- High quality investment → Better products, but higher costs
- Large inventory → No stockouts, but high holding costs

---

### D. Marketing & Sales (Weight: 15%)

**Components:**
- **Market Share** (35%): Percentage of total market
- **Brand Perception** (25%): Customer perception score
- **Customer Acquisition** (25%): New customer rate
- **Campaign Effectiveness** (15%): Marketing ROI

**Formulas:**
```javascript
marketShare = (yourRevenue / totalMarketRevenue) * 100

brandPerception = baseScore +
  (customerSatisfaction * 0.4) +
  (marketingSpend * 0.3) +
  (productQuality * 0.3) -
  (negativeReviews * 10)

customerAcquisition = newCustomers / totalCustomers * 100

campaignEffectiveness = (revenueFromCampaign - campaignCost) / campaignCost * 100

marketingScore = (
  marketShare * 0.35 +
  brandPerception * 0.25 +
  customerAcquisition * 0.25 +
  campaignEffectiveness * 0.15
)
```

**Market Dynamics:**
- Competitor actions affect your market share
- Poor quality hurts brand perception despite marketing spend
- Word-of-mouth amplifies both positive and negative experiences

---

### E. Customer Satisfaction (Weight: 10%)

**Components:**
- **Product Quality** (40%): Performance, reliability, features
- **Service Quality** (30%): Support, responsiveness
- **Customer Retention** (20%): Repeat purchase rate
- **Net Promoter Score** (10%): Recommendation likelihood

**Formulas:**
```javascript
productQuality = operationsQuality * (1 + innovationInvestment / 100)

serviceQuality = (supportStaff / customers * 1000) * employeeSatisfaction / 100

customerRetention = (returningCustomers / totalCustomers) * 100

nps = promoters - detractors

customerSatisfaction = (
  productQuality * 0.40 +
  serviceQuality * 0.30 +
  customerRetention * 0.20 +
  nps * 0.10
)
```

**Critical Chain:**
```
High Customer Satisfaction → More Retention → Higher CLV → More Revenue →
Better Financial Health → More Investment → Better Products → Virtuous Cycle
```

---

## 2. Cascading Effects System

### Primary Cascades

**A. Financial → All Others**
```javascript
if (financialHealth < 40) {
  // Crisis mode - everything suffers
  hrBudgetCut = 0.2 // 20% reduction
  operationsBudgetCut = 0.15
  marketingBudgetCut = 0.25
}
```

**B. HR → Operations**
```javascript
if (employeeSatisfaction < 50) {
  productivityPenalty = (50 - employeeSatisfaction) / 100
  qualityPenalty = productivityPenalty * 0.5

  operationsScore *= (1 - productivityPenalty)
}
```

**C. Operations → Customer Satisfaction**
```javascript
if (qualityControl < 60) {
  customerComplaintRate = (60 - qualityControl) / 10
  customerSatisfaction *= (1 - customerComplaintRate / 100)
}
```

**D. Customer Satisfaction → Revenue**
```javascript
if (customerSatisfaction < 60) {
  revenueImpact = (60 - customerSatisfaction) * 0.02 // 2% loss per point
  revenue *= (1 - revenueImpact)
}
```

### Secondary Cascades

**E. Marketing × Customer Satisfaction = Brand Value**
```javascript
brandValue = marketingScore * 0.5 + customerSatisfaction * 0.5
// High marketing with low satisfaction = wasted spend
// High satisfaction with low marketing = untapped potential
```

**F. HR × Operations = Production Quality**
```javascript
actualQuality = targetQuality * (employeeSatisfaction / 100) * (trainingLevel / 100)
// Unhappy, untrained employees produce poor quality regardless of targets
```

---

## 3. Risk & Randomness Factors

### Market Volatility
```javascript
marketCondition = baseCondition + randomFactor(-10, 10)
// Good market: +10% to all revenue
// Bad market: -10% to all revenue

revenue *= (1 + marketCondition / 100)
```

### Investment Risk
```javascript
if (riskLevel === 'high') {
  // 30% chance of 3x return, 70% chance of 0.5x return
  investmentOutcome = Math.random() < 0.3 ? 3.0 : 0.5
} else if (riskLevel === 'medium') {
  // 50% chance of 1.5x return, 50% chance of 0.8x return
  investmentOutcome = Math.random() < 0.5 ? 1.5 : 0.8
} else {
  // 'low' - 80% chance of 1.1x return, 20% chance of 0.9x return
  investmentOutcome = Math.random() < 0.8 ? 1.1 : 0.9
}
```

### Unexpected Events (Black Swans)
```javascript
// 5% chance per session of a significant event
if (Math.random() < 0.05) {
  eventType = randomChoice([
    'supply_chain_disruption',    // -20% operations
    'key_employee_departure',     // -15% HR, -10% operations
    'viral_marketing_success',    // +30% marketing
    'quality_scandal',            // -40% customer satisfaction
    'competitor_innovation',      // -10% market share
    'regulatory_change',          // +15% costs
  ])
}
```

---

## 4. Time-Based Dynamics

### Momentum & Inertia
```javascript
// Metrics don't change instantly - they have momentum
newMetric = currentMetric * 0.7 + targetMetric * 0.3
// 70% influenced by current state, 30% by new decisions
```

### Compound Growth
```javascript
// Good decisions compound over time
if (consecutiveGoodSessions >= 3) {
  bonusMultiplier = 1 + (consecutiveGoodSessions * 0.05)
  allMetrics *= bonusMultiplier
}
```

### Decay & Deterioration
```javascript
// Neglecting areas causes decay
if (areaInvestment === 0) {
  areaScore *= 0.95 // 5% decay per session
}
```

---

## 5. Competitive Dynamics

### Market Share Competition
```javascript
// Your performance relative to competitors
marketShareChange = (
  (yourScore - competitorAverageScore) / competitorAverageScore * 0.1
)
marketShare += marketShareChange
```

### Price Wars
```javascript
if (competitorPricing < yourPricing * 0.9) {
  customerLoss = (yourPricing - competitorPricing) / yourPricing * 0.2
  customerRetention *= (1 - customerLoss)
}
```

---

## 6. Overall Score Calculation

### Weighted Composite Score
```javascript
overallScore = (
  financialHealth * 0.30 +
  hrScore * 0.25 +
  operationsScore * 0.20 +
  marketingScore * 0.15 +
  customerSatisfaction * 0.10
)

// Apply multipliers
overallScore *= momentumMultiplier
overallScore *= marketConditionMultiplier
overallScore *= competitivePositionMultiplier

// Clamp to 0-100
overallScore = Math.max(0, Math.min(100, overallScore))
```

---

## 7. Scoring Tiers & Feedback

### Performance Tiers
```
90-100: Exceptional - Market leader, sustainable growth
80-89:  Excellent - Strong performance across all metrics
70-79:  Good - Solid business, room for improvement
60-69:  Adequate - Surviving but facing challenges
50-59:  Struggling - Significant issues need addressing
40-49:  Critical - Major restructuring needed
0-39:   Failing - Business viability at risk
```

### Automatic Feedback Generation
```javascript
feedback = {
  strengths: [], // Metrics above 70
  concerns: [],  // Metrics below 50
  recommendations: [], // Specific actionable advice
  warnings: [], // Critical issues (metrics below 30)
}

// Example
if (cashFlow < 0) {
  feedback.warnings.push("Negative cash flow - immediate action required")
}
if (employeeSatisfaction < 50 && productivity < 60) {
  feedback.recommendations.push("Low employee morale impacting productivity. Consider increasing training budget or improving work conditions.")
}
```

---

## 8. Implementation Strategy

### Phase 1: Core Metrics (Week 1)
- Implement 5 core metric calculations
- Basic linear relationships
- Simple weighted scoring

### Phase 2: Cascading Effects (Week 2)
- Add interdependencies
- Implement primary cascades (HR → Operations → Customer)
- Add momentum/inertia

### Phase 3: Risk & Randomness (Week 3)
- Market volatility
- Investment outcomes
- Random events

### Phase 4: Competition & Time (Week 4)
- Competitive dynamics
- Compound effects
- Decay mechanics

### Phase 5: Tuning & Balance (Week 5)
- Playtesting
- Balance adjustments
- Feedback refinement

---

## 9. Data Requirements

### Team Decision Input
```typescript
interface DecisionInput {
  financial: {
    budget_allocation: 'conservative' | 'balanced' | 'aggressive',
    investment_amount: number,
    risk_level: 'low' | 'medium' | 'high',
    cost_cutting_areas?: string[],
  },
  hr: {
    hiring_count: number,
    layoff_count?: number,
    training_budget: number,
    benefits_level: 'minimal' | 'standard' | 'premium',
    overtime_hours?: number,
  },
  operations: {
    production_target: number,
    quality_budget: number,
    efficiency_investment: number,
    inventory_strategy: 'minimal' | 'optimal' | 'buffer',
  },
  marketing: {
    marketing_budget: number,
    campaign_type: 'brand' | 'performance' | 'viral' | 'relationship',
    pricing_strategy: 'premium' | 'competitive' | 'discount',
    channels: string[],
  },
}
```

### Team State
```typescript
interface TeamState {
  // Current metrics
  metrics: {
    financial: number,
    hr: number,
    operations: number,
    marketing: number,
    customer_satisfaction: number,
  },

  // Resources
  cash: number,
  employees: number,
  productionCapacity: number,
  marketShare: number,

  // History
  sessionHistory: SessionResult[],
  consecutiveGoodSessions: number,
  consecutiveBadSessions: number,
}
```

---

## 10. Testing & Validation

### Test Scenarios

**Scenario A: Balanced Growth**
- Moderate investment across all areas
- Expected: Steady 5-10% growth per session

**Scenario B: Financial Focus**
- High financial investment, minimal HR/operations
- Expected: Short-term gains, long-term decline

**Scenario C: Employee-First**
- High HR investment, lower financial focus
- Expected: Slow initial growth, strong long-term performance

**Scenario D: Quality vs Quantity**
- High quality + low volume vs low quality + high volume
- Expected: Different customer satisfaction outcomes

**Scenario E: Market Crisis**
- Good team performance during bad market conditions
- Expected: Resilience testing

---

## 11. Balance Considerations

### Avoid These Pitfalls:

❌ **Single Dominant Strategy**
- No one approach should always win
- Trade-offs should be meaningful

❌ **Runaway Leaders**
- Implement catch-up mechanics
- Random events can shake things up

❌ **Death Spirals**
- Allow recovery from bad decisions
- Don't make early mistakes fatal

❌ **Opaque Scoring**
- Players should understand WHY they got their score
- Provide clear cause-and-effect feedback

✅ **Good Balance:**
- Multiple viable strategies
- Clear feedback loops
- Recoverable mistakes
- Strategic depth
- Realistic trade-offs

---

## 12. Future Enhancements

### Advanced Features (Post-MVP)

1. **Industry Sectors**: Different weights for tech, retail, manufacturing
2. **Global Markets**: Exchange rates, international expansion
3. **Partnerships**: Merge resources with other teams
4. **Innovation**: R&D leading to breakthrough products
5. **Sustainability**: ESG scores affecting brand perception
6. **Mergers & Acquisitions**: Buy struggling competitors
7. **Seasonal Effects**: Holiday season boosts, summer slumps
8. **Economic Cycles**: Recession, boom periods
9. **Regulatory Compliance**: Laws affecting operations
10. **Technology Disruption**: New tech making old products obsolete

---

## Summary

This scoring system provides:
- ✅ **Realism**: Based on actual business dynamics
- ✅ **Complexity**: Deep strategic decisions
- ✅ **Fairness**: Multiple paths to success
- ✅ **Clarity**: Understandable cause and effect
- ✅ **Engagement**: Meaningful choices matter
- ✅ **Scalability**: Can be expanded over time

Next step: Implement core metrics and test with sample data.
