# Playwright Testing Best Practices

## How to Avoid "Strict Mode Violations" and Write Robust Tests

### The Problem
Playwright's strict mode requires selectors to match **exactly one element**. When multiple elements match, tests fail with errors like:
```
Error: strict mode violation: getByText(/\$50,000/) resolved to 2 elements
```

### The Solution: Use Specific Selectors

#### 1. **Use `data-testid` attributes (BEST)**
Add test IDs to your components for critical test targets:

```tsx
// Component
<button data-testid="submit-decision-button">Submit</button>

// Test
await page.getByTestId('submit-decision-button').click();
```

**Why this works**: Test IDs are unique and won't change when UI text changes.

#### 2. **Use semantic selectors (GOOD)**
Prefer role-based selectors when possible:

```typescript
// Good - uses role
await page.getByRole('button', { name: /submit decision/i }).click();

// Good - uses label
await page.getByLabel(/email/i).fill('test@example.com');

// Good - uses placeholder
await page.getByPlaceholder(/search/i).fill('query');
```

#### 3. **Scope selectors to containers (GOOD)**
Use parent containers to narrow down searches:

```typescript
// Find within a specific section using test ID
const financialState = page.getByTestId('current-financial-state');
await expect(financialState.getByText('$50,000')).toBeVisible();

// Find within a section using heading + parent locator
const financialSection = page.getByRole('heading', { name: /financial summary/i }).locator('..');
await expect(financialSection.getByText(/revenue/i)).toBeVisible();
```

**Why this works**: Limits the search scope to a specific container, preventing matches in other sections.

#### 4. **Use .first() or .nth() as LAST RESORT**
Only when you can't be more specific:

```typescript
// Less ideal, but sometimes necessary
const firstHeading = page.getByText(/level 1/i).first();
```

### Examples from This Project

#### ❌ **BAD**: Generic text selector
```typescript
// Fails because $50,000 appears in multiple places
await expect(page.getByText(/\$50,000/)).toBeVisible();
```

#### ✅ **GOOD**: Using test ID
```typescript
// Only matches one specific element
await expect(page.getByTestId('starting-cash')).toHaveText('$50,000');
```

#### ❌ **BAD**: Generic text in checkbox
```typescript
await page.getByRole('checkbox', { name: /take a loan/i }).check();
// This works but could break if text changes
```

#### ✅ **BETTER**: Using test ID
```typescript
await page.getByTestId('loan-checkbox').check();
// More stable, won't break on text changes
```

### Advanced: Scoping to Sections (Critical for Results Pages)

#### The Problem with Common Terms
Financial and business terms like "Revenue", "Debt", "Profit" often appear in **multiple sections** of the same page:
- Financial Summary (the actual metric)
- Learning Tips (educational explanations)
- Warnings (alerts about performance)
- Feedback sections (strengths/concerns)

**Example from Level 1 Results:**
```
Error: strict mode violation: getByText(/revenue/i) resolved to 3 elements
```
"Revenue" appeared in:
1. Financial Summary section (the label)
2. Learning Tips section ("Understanding revenue...")
3. Feedback section ("Your revenue was...")

#### ✅ **SOLUTION**: Scope selectors to parent sections

Use the **heading + parent locator** technique:

```typescript
// ❌ BAD: Matches multiple elements
await expect(page.getByText(/revenue/i)).toBeVisible();

// ✅ GOOD: Scoped to Financial Summary section
const financialSection = page.getByRole('heading', { name: /financial summary/i }).locator('..');
await expect(financialSection.getByText(/revenue/i)).toBeVisible();
```

#### How the Scoping Technique Works

1. **Find the section heading** using semantic selector:
   ```typescript
   page.getByRole('heading', { name: /financial summary/i })
   ```

2. **Get the parent container** using `.locator('..')`:
   ```typescript
   .locator('..') // Goes up to parent element
   ```

3. **Search within that container**:
   ```typescript
   const section = page.getByRole('heading', { name: /financial summary/i }).locator('..');
   await expect(section.getByText(/revenue/i)).toBeVisible();
   ```

#### Real-World Examples from Level 1 Tests

**Example 1: Financial Metrics**
```typescript
// Get Financial Summary section
const financialSection = page.getByRole('heading', { name: /financial summary/i }).locator('..');

// Now search only within that section
await expect(financialSection.getByText(/revenue/i)).toBeVisible();
await expect(financialSection.getByText(/gross profit/i)).toBeVisible();
await expect(financialSection.getByText(/net profit/i)).toBeVisible();
await expect(financialSection.getByText(/ending cash/i)).toBeVisible();
```

**Example 2: Performance Scores**
```typescript
// Get Performance Breakdown section
const performanceSection = page.getByRole('heading', { name: /performance breakdown/i }).locator('..');

// Search only within that section
await expect(performanceSection.getByText(/cash.*profit/i)).toBeVisible();
await expect(performanceSection.getByText(/debt health/i)).toBeVisible();
await expect(performanceSection.getByText(/employee happiness/i)).toBeVisible();
```

**Example 3: Next Session State**
```typescript
// Get Next Session section
const nextSessionSection = page.getByRole('heading', { name: /next session starting position/i }).locator('..');

// Verify debt info only in this section
await expect(nextSessionSection.getByText(/total debt/i)).toBeVisible();
await expect(nextSessionSection.getByText(/\$0/)).toBeVisible();
```

#### Common Terms That Need Scoping

When testing results or dashboard pages, these terms typically appear in multiple places and should be scoped:

**Financial Terms:**
- Revenue
- Profit (Gross/Net)
- Debt
- Cash
- Balance
- Income
- Expenses

**Score/Performance Terms:**
- Score
- Health
- Satisfaction
- Happiness
- Performance
- Rating

**Status Terms:**
- Active
- Pending
- Complete
- Failed
- Warning

#### When to Use Scoping vs Test IDs

| Use Scoping | Use Test IDs |
|-------------|--------------|
| Results pages with multiple sections | Form inputs and controls |
| Dashboard with similar metrics | Navigation elements |
| Educational content with repeated terms | Action buttons |
| Feedback sections | Status indicators |

**Tip**: For results pages, combine both:
```typescript
// Section heading uses semantic selector
const resultsSection = page.getByRole('heading', { name: /results/i }).locator('..');

// Individual metrics use test IDs within the section
await expect(resultsSection.getByTestId('overall-score')).toHaveText('85');
```

### When to Add Test IDs

Add `data-testid` attributes to:
1. **Form inputs** (buttons, checkboxes, inputs)
2. **Critical displays** (scores, balances, status indicators)
3. **Navigation elements** (tabs, links, breadcrumbs)
4. **Containers with multiple children** (cards, sections, modals)

### Test ID Naming Convention

Use kebab-case and be descriptive:
- ✅ `data-testid="submit-decision-button"`
- ✅ `data-testid="starting-cash"`
- ✅ `data-testid="loan-summary"`
- ❌ `data-testid="btn1"` (not descriptive)
- ❌ `data-testid="submitButton"` (use kebab-case)

### Quick Reference

| Scenario | Selector Strategy |
|----------|------------------|
| Unique button | `getByRole('button', { name: /exact text/i })` or `getByTestId('button-name')` |
| Form input | `getByLabel(/label text/i)` or `getByTestId('input-name')` |
| Text in specific section | Scope: `page.getByRole('heading', {name: /section/i}).locator('..').getByText()` |
| Common terms (Revenue, Debt, etc.) | **Always scope to parent section** using heading + `.locator('..')` |
| Multiple similar elements | Add `data-testid` to each and select by ID |
| Dynamic content | Always use `data-testid` |
| Results/Dashboard pages | **Scope all metrics to their sections** to avoid strict mode violations |

### Additional Tips

1. **Wait for visibility** before interacting:
   ```typescript
   await expect(page.getByTestId('my-element')).toBeVisible({ timeout: 10000 });
   ```

2. **Use specific text matchers**:
   ```typescript
   // Exact match
   .toHaveText('$50,000')

   // Contains
   .toContainText('$50,000')

   // Regex
   .toHaveText(/\$50,000/)
   ```

3. **Check element count** when debugging:
   ```typescript
   const count = await page.getByText(/my text/).count();
   console.log(`Found ${count} elements`); // Helps identify duplicates
   ```

## Summary

**The Golden Rules**:

1. **For form inputs and controls**: Use `data-testid` attributes for stability
2. **For common terms on results pages**: Scope selectors to parent sections using `getByRole('heading').locator('..')`
3. **For headings and landmarks**: Use semantic `getByRole()` selectors

**Why this matters**:
- ✅ Prevents strict mode violations (selector matches exactly one element)
- ✅ More stable (won't break on content changes)
- ✅ Faster test execution (precise targeting)
- ✅ Clearer test intent (explicit about what you're testing)
- ✅ Maintainable (easy to update and debug)

**Critical insight**: Financial/business terms like "Revenue", "Debt", "Profit" appear in multiple sections (metrics, tips, feedback). **Always scope these to their parent section** to avoid strict mode violations.
