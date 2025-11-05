# Business Scoring Algorithm - Quick Reference

## 🎯 Core Philosophy

**"Every decision has consequences that ripple through your entire business"**

---

## 📊 The 5 Pillars (Weighted Score)

```
🏦 Financial Health      30%  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 HR & Workforce        25%  ━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  Operations            20%  ━━━━━━━━━━━━━━━━━━━━
📢 Marketing & Sales     15%  ━━━━━━━━━━━━━━━
😊 Customer Satisfaction 10%  ━━━━━━━━━━

Overall Score = Σ(Pillar × Weight) × Multipliers
```

---

## 🔄 Cascading Effects (The Heart of the System)

### Example: Cost-Cutting Spiral

```
Scenario: Team cuts training budget by 50%

Session 1:
  Training Budget: -50% ✅ (Immediate savings)
  Financial: +5 points ✅

Session 2:
  Employee Skills: -10 points ⚠️
  Productivity: -8 points ⚠️

Session 3:
  Product Quality: -12 points ❌
  Customer Satisfaction: -15 points ❌

Session 4:
  Revenue: -20% ❌❌
  Financial: -25 points ❌❌

Result: Short-term gain, long-term disaster!
```

### Example: Quality Investment

```
Scenario: Team invests heavily in quality control

Session 1:
  Quality Budget: +100% ✅
  Financial: -8 points ⚠️ (High costs)

Session 2:
  Product Quality: +15 points ✅
  Operations: +12 points ✅

Session 3:
  Customer Satisfaction: +20 points ✅✅
  Brand Perception: +18 points ✅

Session 4:
  Customer Retention: +25% ✅✅
  Revenue: +30% ✅✅
  Market Share: +5% ✅✅

Result: Short-term pain, long-term gain!
```

---

## ⚖️ Key Trade-offs

### 1. Speed vs Quality
```
High Speed         High Quality
  ↓                   ↓
More Output        Better Products
  ↓                   ↓
Lower Quality      Higher Costs
  ↓                   ↓
Customer Issues    Customer Loyalty
```

### 2. Growth vs Stability
```
Aggressive Growth      Conservative Growth
  ↓                       ↓
High Risk              Low Risk
  ↓                       ↓
Potential 3x ROI       Steady 1.1x ROI
OR 0.5x loss           Minimal loss risk
```

### 3. Employee Investment vs Profit
```
High HR Investment     Low HR Investment
  ↓                       ↓
Happy Employees        Unhappy Employees
  ↓                       ↓
High Productivity      Low Productivity
Long-term stable       High turnover
Higher costs           Lower costs (short-term)
```

---

## 🎲 Risk & Randomness

### Investment Risk Levels

**Low Risk (Safe)**
- 80% chance: +10% return
- 20% chance: -10% return
- Average: +6% return

**Medium Risk (Balanced)**
- 50% chance: +50% return
- 50% chance: -20% return
- Average: +15% return

**High Risk (Gamble)**
- 30% chance: +200% return
- 70% chance: -50% return
- Average: +25% return (but volatile!)

### Black Swan Events (5% per session)

```
🌪️  Supply Chain Disruption     → -20% Operations
💼 Key Employee Departure        → -15% HR, -10% Operations
🚀 Viral Marketing Success       → +30% Marketing
💣 Quality Scandal               → -40% Customer Satisfaction
🏢 Competitor Innovation         → -10% Market Share
📋 Regulatory Change             → +15% Costs
```

---

## 📈 Compound Effects

### Virtuous Cycle (Success Builds)
```
Good Decision
    ↓
Good Results (+5 points)
    ↓
3 Consecutive Good Sessions
    ↓
Momentum Bonus (+15% multiplier)
    ↓
Easier to maintain success
```

### Vicious Cycle (Problems Compound)
```
Bad Decision
    ↓
Poor Results (-10 points)
    ↓
Cascading Effects (-15 more points)
    ↓
Financial Pressure
    ↓
Forced to cut costs
    ↓
More problems
```

---

## 🎯 Scoring Tiers

```
 90-100  ⭐⭐⭐⭐⭐  Exceptional
         Market leader, everything firing on all cylinders

 80-89   ⭐⭐⭐⭐   Excellent
         Strong performer, minor optimizations needed

 70-79   ⭐⭐⭐     Good
         Solid business, some areas need attention

 60-69   ⭐⭐       Adequate
         Surviving but facing challenges

 50-59   ⭐         Struggling
         Significant issues, major changes needed

 40-49   ⚠️         Critical
         Business viability at risk

 0-39    ❌         Failing
         Bankruptcy imminent
```

---

## 🧪 Strategic Archetypes

### 1. The Balanced Builder (Safest)
- Even investment across all areas
- Steady 5-10% growth per session
- No major weaknesses
- **Best for**: Beginners, risk-averse teams

### 2. The Financial Hawk (Risky)
- Maximize profits, minimize costs
- High short-term gains
- Employee and quality issues emerge
- **Best for**: Teams that can adapt quickly

### 3. The People-First Leader (Long-term)
- Heavy HR investment
- Slow start, strong finish
- Builds loyal, productive workforce
- **Best for**: Patient, strategic teams

### 4. The Customer Fanatic (Sustainable)
- Quality and service above all
- Premium pricing, high satisfaction
- Strong brand loyalty
- **Best for**: Differentiation strategy

### 5. The Aggressive Disruptor (High Risk)
- Max growth, high risk investments
- Either dominates or crashes
- Extreme volatility
- **Best for**: Bold, adaptable teams

---

## 🔧 Implementation Priority

### Phase 1: MVP (Week 1-2)
```
✅ Core 5 metrics calculation
✅ Basic decision input → score output
✅ Simple feedback messages
✅ Test with 3 scenarios
```

### Phase 2: Cascades (Week 3)
```
✅ HR → Operations → Customer chain
✅ Financial constraints affecting other areas
✅ Time-based momentum
```

### Phase 3: Advanced (Week 4-5)
```
✅ Risk & randomness
✅ Competitive dynamics
✅ Black swan events
✅ Comprehensive feedback system
```

---

## 💡 Key Design Insights

### What Makes This Realistic:

1. **No Perfect Strategy**
   - Every approach has trade-offs
   - Context matters (market conditions, timing)

2. **Time Matters**
   - Decisions compound over multiple sessions
   - Some effects are delayed

3. **Interconnected Systems**
   - Can't optimize one area in isolation
   - Weak links matter (chain breaks at weakest point)

4. **External Factors**
   - Market conditions beyond control
   - Random events test adaptability

5. **Human Element**
   - Employee satisfaction drives everything
   - Happy workers = productive workers = happy customers

---

## 🚀 Next Steps

1. **Review** the full design document: `SCORING_ALGORITHM_DESIGN.md`
2. **Discuss** which complexity level to start with
3. **Implement** Phase 1 (core metrics)
4. **Test** with real game sessions
5. **Iterate** based on playtesting feedback

---

## 📚 Additional Resources

- Full Design Doc: `SCORING_ALGORITHM_DESIGN.md`
- Implementation Guide: (to be created)
- Test Scenarios: (to be created)
- Balance Spreadsheet: (to be created)

---

**Remember**: The goal is not just to score teams, but to teach them about real business dynamics through gameplay! 🎓
