# Level 1 Beginner - WITH Banking & Debt System

## 🎓 Revised Learning Objectives

Students will learn:
- ✅ Basic business metrics (revenue, costs, profit)
- ✅ Resource allocation across priorities
- ✅ **How debt works (loans, interest, installments)**
- ✅ **When to use leverage vs when to avoid it**
- ✅ **The danger of over-borrowing**

---

## 💰 The 4 Core KPIs (Updated)

### 1. CASH & PROFIT (30% weight)
```
Current Cash: How much money you have right now
Monthly Profit: Revenue - Costs - Debt Payments
```

### 2. DEBT HEALTH (25% weight) ← NEW!
```
Total Debt: How much you owe the bank
Monthly Payment: What you must pay each session
Debt Ratio: Debt / Assets (safe zone: under 50%)
```

### 3. EMPLOYEE HAPPINESS (25% weight)
```
Training + Benefits = Happy Employees
```

### 4. CUSTOMER SATISFACTION (20% weight)
```
Quality + Service = Happy Customers
```

---

## 🏦 Banking System (Simple But Realistic)

### Starting Conditions
```
Starting Cash: $50,000
Starting Debt: $0
Credit Limit: $100,000 (max you can borrow)
```

### Loan Options (3 Choices)

**Option A: SHORT-TERM LOAN (6 sessions = 3 months)**
```
Borrow: $10,000 - $50,000
Interest Rate: 5% total
Monthly Payment: (Loan + Interest) / 6

Example:
- Borrow: $30,000
- Interest: $1,500 (5% of $30K)
- Total Owed: $31,500
- Monthly Payment: $5,250/session
- Paid off in: 6 sessions
```

**Option B: MEDIUM-TERM LOAN (12 sessions = 6 months)**
```
Borrow: $10,000 - $75,000
Interest Rate: 8% total
Monthly Payment: (Loan + Interest) / 12

Example:
- Borrow: $50,000
- Interest: $4,000 (8% of $50K)
- Total Owed: $54,000
- Monthly Payment: $4,500/session
- Paid off in: 12 sessions
```

**Option C: LONG-TERM LOAN (24 sessions = 12 months)**
```
Borrow: $10,000 - $100,000
Interest Rate: 12% total
Monthly Payment: (Loan + Interest) / 24

Example:
- Borrow: $80,000
- Interest: $9,600 (12% of $80K)
- Total Owed: $89,600
- Monthly Payment: $3,733/session
- Paid off in: 24 sessions
```

### Key Trade-off Teaching Moment:
```
Short-term: Low interest BUT high monthly payments
Long-term: High interest BUT low monthly payments

Students must choose based on cash flow needs!
```

---

## 🎮 Student Input Interface (Updated)

### Session Decision Screen

```
┌─────────────────────────────────────────────────┐
│ 💰 YOUR FINANCES - Session 1                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ Current Cash: $50,000                           │
│ Current Debt: $0                                │
│ Monthly Debt Payment: $0                        │
│                                                 │
├─────────────────────────────────────────────────┤
│ 💳 BANKING OPTIONS                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Do you want to borrow money this session?       │
│                                                 │
│ ○ No loan (Use only available cash)            │
│                                                 │
│ ○ Short-term Loan (6 sessions, 5% interest)    │
│   Amount: [Slider: $10K - $50K]                 │
│   → Monthly payment: $5,250                     │
│   💡 Good for: Quick investments, paid back fast│
│                                                 │
│ ○ Medium-term Loan (12 sessions, 8% interest)  │
│   Amount: [Slider: $10K - $75K]                 │
│   → Monthly payment: $4,500                     │
│   💡 Good for: Balanced approach                │
│                                                 │
│ ○ Long-term Loan (24 sessions, 12% interest)   │
│   Amount: [Slider: $10K - $100K]                │
│   → Monthly payment: $3,733                     │
│   ⚠️ Warning: Most expensive in total interest  │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 📊 BUDGET ALLOCATION                            │
├─────────────────────────────────────────────────┤
│                                                 │
│ Total Available: $50,000 (cash) + $0 (loan)    │
│                = $50,000                        │
│                                                 │
│ How do you want to spend it?                    │
│                                                 │
│ Employees: 40% [$20,000]                        │
│ ████████████░░░░░░░░░░░░░░░░░░                  │
│ 💡 Training, salaries, benefits                 │
│ 💡 Recommended: 30-40%                          │
│                                                 │
│ Products & Operations: 35% [$17,500]            │
│ ██████████░░░░░░░░░░░░░░░░░░░░                  │
│ 💡 Quality, production, inventory               │
│ 💡 Recommended: 30-40%                          │
│                                                 │
│ Marketing & Sales: 25% [$12,500]                │
│ ████████░░░░░░░░░░░░░░░░░░░░░░                  │
│ 💡 Advertising, customer acquisition            │
│ 💡 Recommended: 20-30%                          │
│                                                 │
│ Save Cash: 0% [$0]                              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                  │
│ 💡 Emergency fund (optional)                    │
│                                                 │
│ Total: 100% ✓                                   │
│                                                 │
│ [Preview Results] [Submit Decisions]            │
└─────────────────────────────────────────────────┘
```

---

## 📊 Scoring Formulas (Transparent)

### 1. CASH & PROFIT SCORE
```javascript
// Revenue based on marketing spend
revenue = marketingBudget * 2.5
// Example: $12,500 marketing → $31,250 revenue

// Monthly costs
operatingCosts = employeeBudget + productBudget + marketingBudget
debtPayment = currentMonthlyDebtPayment

// Cash flow
cashFlow = revenue - operatingCosts - debtPayment
newCash = currentCash + cashFlow

// Profit (what's left after everything)
monthlyProfit = revenue - operatingCosts - debtPayment

// Score calculation
if (newCash > 30000) score = 80-100  // Healthy
else if (newCash > 15000) score = 60-79  // Okay
else if (newCash > 0) score = 40-59  // Tight
else score = 0-39  // Crisis! Negative cash

CASH_PROFIT_SCORE = baseScore
```

### 2. DEBT HEALTH SCORE (NEW!)
```javascript
// Calculate debt-to-assets ratio
totalAssets = currentCash + inventory + equipment
// Simplified: totalAssets ≈ cash * 2

debtRatio = totalDebt / totalAssets * 100

// Score based on debt ratio
if (debtRatio === 0) score = 100  // No debt (safe but maybe missing opportunities)
else if (debtRatio < 30) score = 90-100  // Low debt (very healthy)
else if (debtRatio < 50) score = 70-89  // Moderate debt (manageable)
else if (debtRatio < 70) score = 50-69  // High debt (risky)
else if (debtRatio < 90) score = 30-49  // Very high debt (dangerous!)
else score = 0-29  // Over-leveraged (crisis!)

// Payment burden factor
monthlyPaymentBurden = monthlyDebtPayment / revenue * 100
if (monthlyPaymentBurden > 40) score *= 0.7  // Penalty: Payments eating all revenue!

DEBT_HEALTH_SCORE = finalScore
```

### 3. EMPLOYEE HAPPINESS SCORE
```javascript
// Simple calculation
employeeScore = (employeeBudget / 10000 * 10) + 50
// $10K → 50 points, $20K → 70 points, $30K → 80 points

// Cap at 100
EMPLOYEE_SCORE = Math.min(100, employeeScore)
```

### 4. CUSTOMER SATISFACTION SCORE
```javascript
// Based on product/quality investment
customerScore = (productBudget / 10000 * 15) + 40
// $10K → 55 points, $20K → 70 points, $30K → 85 points

CUSTOMER_SCORE = Math.min(100, customerScore)
```

### OVERALL SCORE
```javascript
OVERALL = (
  CASH_PROFIT_SCORE * 0.30 +
  DEBT_HEALTH_SCORE * 0.25 +
  EMPLOYEE_SCORE * 0.25 +
  CUSTOMER_SCORE * 0.20
)
```

---

## 🎯 Example Scenarios (Teaching Moments)

### Scenario A: CONSERVATIVE (No Debt)
```
Student Decision:
- Loan: None
- Available: $50,000
- Employees: 40% ($20,000)
- Products: 35% ($17,500)
- Marketing: 25% ($12,500)

Session 1 Results:
Revenue: $31,250 (marketing × 2.5)
Costs: $50,000 (spending)
Debt Payment: $0
Profit: -$18,750 (Loss!)
New Cash: $31,250

Scores:
💰 Cash & Profit: 45/100 (Low cash warning)
💳 Debt Health: 100/100 (Perfect! No debt)
👥 Employees: 70/100 (Good investment)
😊 Customers: 66/100 (Decent quality)

Overall: 68/100 (Okay but struggling)

📚 Learning Feedback:
"You played it safe with no debt. That's good for debt health (100 score!),
but you're running low on cash. Your revenue ($31K) didn't cover all
spending ($50K), so you lost money this session.

💡 Consider: A small loan could help you invest more in marketing
to bring in more revenue. Just be careful not to borrow too much!"
```

### Scenario B: SMART LEVERAGE
```
Student Decision:
- Loan: Medium-term $40,000 (12 sessions, 8% interest)
- Monthly Payment: $3,600
- Available: $50,000 + $40,000 = $90,000
- Employees: 33% ($30,000)
- Products: 33% ($30,000)
- Marketing: 33% ($30,000)
- Saved: 0%

Session 1 Results:
Revenue: $75,000 (marketing × 2.5)
Costs: $90,000 (spending)
Debt Payment: $3,600
Profit: -$18,600
New Cash: $31,400 ($50K + $75K revenue - $90K costs - $3.6K payment)

Total Debt: $40,000
Debt Ratio: 64% (31.4K cash * 2 = 62.8K assets, 40K/62.8K)

Scores:
💰 Cash & Profit: 50/100 (Tight cash, but manageable)
💳 Debt Health: 60/100 (Moderate-high debt, watch out!)
👥 Employees: 80/100 (Strong investment!)
😊 Customers: 85/100 (Great quality!)

Overall: 66/100 (Good strategic use of leverage)

📚 Learning Feedback:
"Smart move! You used debt to invest across the board. Your revenue
jumped to $75K because of strong marketing. However, now you have
a $3,600 monthly payment for the next 12 sessions.

💡 Good: Your revenue ($75K) CAN cover your payment ($3.6K)
⚠️ Watch: Debt ratio is 64% - getting into risky territory
💭 Strategy: Focus on growing revenue to pay down this debt

This is called LEVERAGE - using borrowed money to grow faster.
It can work great if revenue grows, but it's risky if revenue drops!"
```

### Scenario C: OVER-LEVERAGED (Danger!)
```
Student Decision:
- Loan: Long-term $100,000 (24 sessions, 12% interest)
- Monthly Payment: $4,667
- Available: $50,000 + $100,000 = $150,000
- Employees: 30% ($45,000)
- Products: 35% ($52,500)
- Marketing: 35% ($52,500)
- Saved: 0%

Session 1 Results:
Revenue: $131,250 (marketing × 2.5)
Costs: $150,000 (spending)
Debt Payment: $4,667
Profit: -$23,417
New Cash: $26,583 ($50K + $131K revenue - $150K costs - $4.7K payment)

Total Debt: $100,000
Debt Ratio: 188% (!!) (26.6K cash * 2 = 53.2K assets, 100K/53.2K)

Scores:
💰 Cash & Profit: 35/100 (Dangerously low cash!)
💳 Debt Health: 15/100 (CRITICAL! Massive over-leverage)
👥 Employees: 85/100 (Good)
😊 Customers: 94/100 (Excellent)

Overall: 48/100 (Failing! High risk of bankruptcy)

📚 Learning Feedback:
"⚠️ DANGER! You borrowed too much!

Your debt ratio is 188% - that means you owe almost 2x your
total assets. This is extremely dangerous!

Problems:
❌ Monthly payment ($4,667) is eating your revenue
❌ Your cash is very low ($26K) - only 5-6 months of payments left
❌ If revenue drops even slightly, you can't pay your debt

🚨 This is called OVER-LEVERAGING - borrowing more than you can handle.

💡 Recovery Plan:
1. CUT COSTS immediately next session
2. Focus all spending on MARKETING (need more revenue!)
3. Save every penny to build cash reserves
4. NEVER borrow this much again until revenue is much higher

Remember: Debt is a tool, but too much debt can destroy a business!"
```

---

## 📚 Pedagogical Feedback System

### After Each Session, Show:

**1. Debt Dashboard**
```
┌─────────────────────────────────────────┐
│ 💳 YOUR DEBT SITUATION                  │
├─────────────────────────────────────────┤
│                                         │
│ Total Debt: $40,000                     │
│ Monthly Payment: $3,600                 │
│ Sessions Remaining: 11                  │
│                                         │
│ Debt Ratio: 64% [████████████░░░░░░]   │
│                                         │
│ Status: ⚠️ MODERATE RISK                │
│                                         │
│ 💡 Your debt is manageable, but you    │
│    need to keep revenue strong to       │
│    make payments. Try to pay it off     │
│    early if you build up extra cash!   │
│                                         │
└─────────────────────────────────────────┘
```

**2. Cash Flow Breakdown**
```
This Session's Money Flow:
───────────────────────────

💰 Money In:
• Starting Cash: $50,000
• Revenue: $75,000
• Loan: $40,000
─────────────────
Total In: $165,000

💸 Money Out:
• Employees: -$30,000
• Products: -$30,000
• Marketing: -$30,000
• Debt Payment: -$3,600
─────────────────
Total Out: -$93,600

✅ Net Result: +$71,400
   (Started with $50K, ended with $31.4K after paying back loan principal)
```

**3. Debt Education Tips**
```
💡 WHAT YOU LEARNED THIS SESSION:

About Interest:
"You borrowed $40,000 at 8% interest. That means you'll
pay back $43,200 total ($3,200 in interest). Interest is
the cost of borrowing money - like rent for using the
bank's money."

About Leverage:
"Leverage means using borrowed money to grow faster. It
works when:
✓ Your revenue growth > interest cost
✓ You can afford monthly payments
✗ It fails when revenue drops or debt is too high"

About Debt Ratio:
"Debt ratio = Total Debt / Total Assets
• Under 30% = Very safe
• 30-50% = Manageable
• 50-70% = Risky
• Over 70% = Danger zone!

Your ratio (64%) means you should be careful about
borrowing more."
```

---

## 🎯 Strategic Teaching Moments

### Good Debt vs Bad Debt

**Good Debt Example:**
```
Borrow $30K → Invest in marketing → Revenue grows by $50K
→ Can easily pay back $30K + interest
→ Net benefit: $20K+ gain

Lesson: "Debt that generates more revenue than it costs is GOOD DEBT"
```

**Bad Debt Example:**
```
Borrow $80K → Spend on everything → Revenue only grows by $30K
→ Struggle to make $4K monthly payments → Cash runs out
→ Business fails

Lesson: "Debt that doesn't generate enough revenue is BAD DEBT"
```

### Early Repayment Option

```
If student builds up cash reserves:

"💰 You have $60,000 in cash and $20,000 remaining debt.

Would you like to PAY OFF your loan early?

Benefits:
✓ Stop paying interest (save money!)
✓ Improve debt health score
✓ Reduce monthly expenses

Drawbacks:
✗ Less cash for other investments
✗ Can't use that cash for emergencies

[Pay Off Early] [Keep Making Monthly Payments]"
```

---

## 🎮 Session Flow with Debt

### Session N: Decision Phase
1. View current cash, debt, payment obligations
2. Decide: Take new loan? (if existing debt is low)
3. Allocate budget (cash + loan) across 3 areas
4. Submit decisions

### Session N: Results Phase
1. Calculate revenue (from marketing)
2. Deduct costs (employee + product + marketing)
3. **Deduct debt payment (automatic!)**
4. Show new cash balance
5. Show debt remaining
6. Show all 4 KPI scores with feedback
7. Show learning tips about debt management

### Warning System
```
If Cash < Debt Payment × 3:
⚠️ "WARNING: You only have 3 sessions of cash left to make
   debt payments. Focus on building revenue or cutting costs!"

If Cash < Debt Payment × 1:
🚨 "CRITICAL: You may not be able to make next session's payment!
   Take immediate action!"

If Cash < 0:
💀 "BANKRUPTCY: You ran out of cash and couldn't pay your debt.
   Game Over. Let's restart and try a different strategy!"
```

---

## 📊 Level 1 Complete Scoring Table

| Metric | Weight | How Calculated | Learning Goal |
|--------|--------|----------------|---------------|
| Cash & Profit | 30% | Revenue - Costs - Debt Payment | Cash management |
| Debt Health | 25% | Debt ratio + Payment burden | Smart leverage |
| Employee Happiness | 25% | Training & benefits investment | People matter |
| Customer Satisfaction | 20% | Product quality investment | Quality matters |

**Overall Score = Weighted average, displayed as 0-100**

---

## 🎯 Expected Learning Outcomes

After completing Level 1 (with debt), students can:

✅ **Explain what debt is** and how interest works
✅ **Calculate monthly payments** and total interest cost
✅ **Identify good debt vs bad debt** situations
✅ **Understand debt ratio** and why it matters
✅ **Make informed borrowing decisions** based on revenue projections
✅ **Avoid over-leveraging** (borrowing too much)
✅ **Explain leverage** and when it's beneficial
✅ **Manage cash flow** with debt obligations
✅ **Make trade-offs** between debt, investment, and saving

---

## 💡 Why This Design Works

1. **Real but Simple**: Uses actual business concepts (debt ratio, leverage) but simplified
2. **Clear Consequences**: Over-borrowing = visible failure
3. **Safe to Experiment**: Can restart and try different strategies
4. **Teaches Math**: Interest calculations, percentages, ratios
5. **Immediate Feedback**: See debt impact right away
6. **Progressive Complexity**: Debt adds one more variable, not overwhelming
7. **Life Skill**: Understanding debt is valuable beyond business

---

## 🚀 Implementation Priority

1. ✅ Banking system (3 loan types)
2. ✅ Monthly payment calculations
3. ✅ Debt health scoring
4. ✅ Cash flow integration
5. ✅ Warning system (low cash alerts)
6. ✅ Bankruptcy detection
7. ✅ Debt education feedback
8. ✅ Early repayment option

---

**This revised Level 1 teaches fundamental business finance including debt from day one, setting a strong foundation for more complex concepts in higher levels.**

**Ready to implement this Level 1 with full banking system?**
