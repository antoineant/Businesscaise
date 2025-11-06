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
// Find within a specific section
const financialState = page.getByTestId('current-financial-state');
await expect(financialState.getByText('$50,000')).toBeVisible();
```

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
| Text in specific section | Scope with parent: `parent.getByText()` or use `getByTestId()` |
| Multiple similar elements | Add `data-testid` to each and select by ID |
| Dynamic content | Always use `data-testid` |

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

**The golden rule**: When a selector could match multiple elements, use `data-testid` instead of text-based selectors. This makes tests:
- ✅ More stable (won't break on text changes)
- ✅ Faster (direct ID lookup)
- ✅ Clearer (explicit intent)
- ✅ Maintainable (easy to update)
