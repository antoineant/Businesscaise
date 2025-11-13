# Troubleshooting Guide
## BusinessCaise Professional Edition

**Version:** 1.0
**Last Updated:** November 13, 2025
**For:** Game Masters and Technical Support

---

## Table of Contents

1. [Login & Access Issues](#login-access-issues)
2. [Team Join Problems](#team-join-problems)
3. [Dashboard & Display Issues](#dashboard-display-issues)
4. [Submission Problems](#submission-problems)
5. [Narrative Issues](#narrative-issues)
6. [Ask the Market (AI) Problems](#ask-the-market-problems)
7. [Leaderboard & Metrics Issues](#leaderboard-metrics-issues)
8. [Performance & Loading Problems](#performance-loading-problems)
9. [Browser Compatibility](#browser-compatibility)
10. [Data & Scoring Issues](#data-scoring-issues)

---

## Login & Access Issues

### Problem: "Cannot access GM Dashboard"

**Symptoms:**
- Login page doesn't load
- 404 error
- Blank page

**Solutions:**

1. **Check URL:**
   - Verify you're using correct dashboard URL
   - Common mistake: Using team player URL instead of GM URL
   - Correct format: `https://[domain]/gm` or `/gm/dashboard`

2. **Clear Browser Cache:**
   ```
   Chrome: Ctrl+Shift+Delete → Clear cached images and files
   Firefox: Ctrl+Shift+Delete → Cached Web Content
   Safari: Cmd+Option+E
   ```

3. **Try Incognito/Private Mode:**
   - Tests if browser extensions are interfering
   - Chrome: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P

4. **Check Browser Compatibility:**
   - Recommended: Chrome 90+, Firefox 88+, Safari 14+
   - Update browser to latest version

### Problem: "Invalid credentials" when logging in

**Symptoms:**
- Correct password rejected
- "Email or password incorrect"

**Solutions:**

1. **Verify Email:**
   - Check for typos
   - Ensure using email used during registration
   - Email is case-insensitive

2. **Reset Password:**
   - Use "Forgot Password" link (if available)
   - Or create new account if test environment

3. **Check Role:**
   - GM accounts and Player accounts are separate
   - Cannot log into GM dashboard with player account
   - May need to register as GM

4. **Clear Cookies:**
   - Old session cookies may interfere
   - Clear all cookies for the domain
   - Try logging in again

### Problem: "Session expired" or automatic logout

**Symptoms:**
- Logged out unexpectedly
- Need to re-login frequently

**Solutions:**

1. **JWT Token Expiration:**
   - Tokens expire after 24 hours (default)
   - Normal behavior - just log in again

2. **Keep Session Active:**
   - Don't close browser tab
   - Refresh page periodically
   - Browser may clear session storage if inactive

3. **Check "Remember Me":**
   - If available, use remember me option
   - Stores refresh token

---

## Team Join Problems

### Problem: "Team cannot join game"

**Symptoms:**
- Join link doesn't work
- "Game not found" error
- Cannot see join page

**Solutions:**

1. **Verify Join Link:**
   - Check for copy-paste errors
   - Ensure complete URL (starts with `https://`)
   - Try copying link again from GM dashboard

2. **Check Game Status:**
   - Game must be created (not deleted)
   - Game doesn't need to be started for teams to join
   - Verify game ID in GM dashboard matches link

3. **Test Join Link:**
   - Open in incognito window
   - Try to register test account
   - Verify join page loads

4. **Generate New Link:**
   - Some platforms have "refresh join link" option
   - Or manually create: `[domain]/join?gameCode=[GAME_ID]`

### Problem: "Student registered but not on team"

**Symptoms:**
- Student completed registration
- Not appearing in Teams tab
- Cannot access dashboard

**Solutions:**

1. **Check Team Selection:**
   - During registration, did they select existing team?
   - Or did they accidentally create duplicate team?
   - Check Teams tab for unexpected team names

2. **Case Sensitivity:**
   - Some systems are case-sensitive for team names
   - "Team Alpha" ≠ "team alpha"

3. **Refresh Dashboard:**
   - Both student and GM should hard refresh (Ctrl+F5)
   - Updates may take 1-2 seconds

4. **Re-register:**
   - If test environment, delete and re-register
   - Have student use exact team name from existing team

### Problem: "Duplicate teams created"

**Symptoms:**
- Multiple teams with similar names
- Teams split across duplicates

**Solutions:**

1. **Prevention:**
   - First student creates team
   - Share exact team name with teammates
   - Others select from dropdown (don't type)

2. **Merge Teams (Manual):**
   - Note: May require database access
   - Contact technical support
   - Or have students create new accounts on correct team

3. **Delete Extra Teams:**
   - If no submissions yet, delete duplicate
   - GM Dashboard → Teams → Delete

---

## Dashboard & Display Issues

### Problem: "Dashboard not loading"

**Symptoms:**
- Blank page after login
- Infinite loading spinner
- Error message

**Solutions:**

1. **Check Network:**
   - Verify internet connection
   - Test other websites
   - Check firewall/proxy settings

2. **Browser Console:**
   - Open developer tools (F12)
   - Check Console tab for errors
   - Screenshot and report errors

3. **API Connection:**
   - Backend may be down
   - Check platform status page
   - Contact technical support

4. **Clear Storage:**
   ```
   F12 → Application → Storage → Clear site data
   Or
   Settings → Privacy → Clear browsing data → All time
   ```

### Problem: "Missing or broken UI elements"

**Symptoms:**
- Buttons not visible
- Text overlapping
- Layout broken

**Solutions:**

1. **Zoom Level:**
   - Reset browser zoom to 100%
   - Ctrl+0 (Windows) or Cmd+0 (Mac)

2. **Window Size:**
   - Expand browser window
   - Minimum recommended: 1280x720
   - Try full screen

3. **Browser Extensions:**
   - Disable ad blockers
   - Disable content blockers
   - Try incognito mode

4. **CSS/JavaScript Loading:**
   - Hard refresh: Ctrl+Shift+R
   - Clear cache
   - Check network tab for failed loads

### Problem: "Real-time updates not working"

**Symptoms:**
- Leaderboard doesn't update
- New submissions don't appear
- Need to manually refresh

**Solutions:**

1. **WebSocket Connection:**
   - Check browser console for WebSocket errors
   - Some networks block WebSocket connections
   - Try different network

2. **Manual Refresh:**
   - Temporary workaround: refresh page
   - Updates should persist

3. **Check Implementation:**
   - Not all features may have real-time updates
   - Refer to feature documentation

---

## Submission Problems

### Problem: "Cannot submit decision"

**Symptoms:**
- Submit button disabled
- No response when clicking submit
- Error message on submission

**Solutions:**

1. **Session Status:**
   - Verify session is unlocked
   - Check deadline hasn't passed
   - GM: Check Sessions tab

2. **Form Validation:**
   - Check all required fields filled
   - Word count requirements met
   - File format correct (if upload)

3. **Authentication:**
   - Ensure still logged in
   - Re-login if session expired
   - Verify correct team account

4. **Browser Issues:**
   - Try different browser
   - Clear cache
   - Disable extensions

### Problem: "Submission disappeared"

**Symptoms:**
- Submitted but not showing in GM dashboard
- Confirmation message appeared
- Team claims they submitted

**Solutions:**

1. **Verify Submission:**
   - GM: Check Submissions tab (may need to refresh)
   - Filter by session
   - Search by team name

2. **Check Session:**
   - Confirm submission was for correct session
   - Not a draft in different session

3. **Database Check:**
   - Submission may be saved but not displaying
   - Contact technical support with:
     - Team name
     - Session number
     - Approximate submission time

4. **Re-submit:**
   - If truly lost and within deadline, allow re-submission
   - Document incident for technical team

### Problem: "File upload not working"

**Symptoms:**
- Cannot attach file
- Upload fails
- File too large error

**Solutions:**

1. **File Size:**
   - Check file size limit (typically 10MB)
   - Compress large files
   - Use PDF instead of large images

2. **File Format:**
   - Verify allowed formats
   - Common: .pdf, .docx, .xlsx, .pptx
   - Convert if needed

3. **Browser Permissions:**
   - Check file access permissions
   - Try different browser
   - Ensure pop-up blocker not interfering

4. **Network:**
   - Large files may timeout on slow connections
   - Try faster network
   - Upload from different location

---

## Narrative Issues

### Problem: "Narratives not appearing for teams"

**Symptoms:**
- GM created narrative
- Teams don't see it
- Inbox shows 0 narratives

**Solutions:**

1. **Target Teams:**
   - Check narrative targeting settings
   - If specific teams selected, only they see it
   - Change to "All Teams" if needed

2. **Refresh:**
   - Teams should hard refresh (Ctrl+F5)
   - May take 1-2 seconds for WebSocket delivery

3. **Check Filters:**
   - Team may have filter active (e.g., "Briefings only")
   - Click "All" filter tab

4. **Verify Creation:**
   - GM: Check Narratives tab
   - Confirm narrative was created (not draft)
   - Check created_at timestamp

### Problem: "Cannot create narrative"

**Symptoms:**
- Create button not working
- Form validation errors
- Submission fails

**Solutions:**

1. **Required Fields:**
   - Title must be filled
   - Content must be filled
   - Type must be selected

2. **Content Length:**
   - Check max length limit
   - May be 5,000-10,000 characters

3. **Permissions:**
   - Verify logged in as GM
   - Player accounts cannot create narratives

### Problem: "Read tracking not working"

**Symptoms:**
- "Unread" count doesn't decrease
- Narrative stays unread after viewing
- Read stats incorrect

**Solutions:**

1. **Mark as Read Manually:**
   - Click narrative to open
   - Should auto-mark within 1-2 seconds
   - Or use "Mark All Read" button

2. **Database Update:**
   - Check if read tracking enabled
   - May require backend fix

3. **Cache Issue:**
   - Clear browser cache
   - Refresh page

---

## Ask the Market (AI) Problems

### Problem: "AI not responding"

**Symptoms:**
- Loading spinner indefinitely
- No answer received
- Timeout error

**Solutions:**

1. **Wait Longer:**
   - Responses take 15-45 seconds
   - Don't refresh during loading
   - Be patient

2. **Check Rate Limit:**
   - May have used all 5 queries
   - Check "queries remaining" counter
   - Wait for next session

3. **API Status:**
   - Perplexity API may be down
   - Check platform status
   - Try again in few minutes

4. **Retry:**
   - If timeout, try submitting question again
   - Rephrase if same issue persists

### Problem: "Query count not resetting"

**Symptoms:**
- Still showing 0/5 queries in new session
- Cannot ask questions
- Limit seems wrong

**Solutions:**

1. **Session Definition:**
   - Queries reset per game session (not calendar day)
   - GM must unlock new session for reset
   - Check current session number

2. **Cache:**
   - Clear browser cache
   - Re-login
   - Check query history

3. **Database Issue:**
   - May require backend reset
   - Contact technical support

### Problem: "AI answers seem wrong or low quality"

**Symptoms:**
- Irrelevant responses
- Contradictory information
- Low confidence rating

**Solutions:**

1. **Question Quality:**
   - More specific questions → better answers
   - Provide context in question
   - Avoid yes/no questions

2. **Check Sources:**
   - AI provides sources - always verify
   - Low confidence = treat with skepticism
   - Use multiple queries for important topics

3. **Rephrase:**
   - Try asking differently
   - Break complex questions into parts

4. **Not an Oracle:**
   - AI provides research, not decisions
   - Students should critically evaluate
   - Part of learning experience

---

## Leaderboard & Metrics Issues

### Problem: "Metrics not updating after scoring"

**Symptoms:**
- GM scored submission
- Team metrics unchanged
- Leaderboard stale

**Solutions:**

1. **Refresh:**
   - Both GM and team hard refresh
   - May take 5-10 seconds for calculation

2. **Check Score:**
   - Verify score was actually submitted
   - Check Submissions tab for score value
   - Re-score if needed

3. **Calculation Error:**
   - Check browser console for errors
   - Note team name and submission ID
   - Contact technical support

4. **Manual Recalculation:**
   - Some platforms have "recalculate metrics" button
   - Or re-score submission to trigger update

### Problem: "Leaderboard shows wrong rankings"

**Symptoms:**
- Rankings don't match scores
- Tied teams in wrong order
- Team missing from leaderboard

**Solutions:**

1. **Sorting:**
   - Check sort order (ascending vs descending)
   - Click column headers to re-sort

2. **Filters:**
   - Check if pod filter active
   - Check if category filter active
   - Reset to "All Teams"

3. **Scores Tied:**
   - Tied teams may show in arbitrary order
   - Or sorted by team name alphabetically
   - Normal behavior

4. **Missing Team:**
   - Team may have 0 submissions (not yet ranked)
   - Check Teams tab to verify team exists

### Problem: "Pod assignments incorrect"

**Symptoms:**
- Teams in wrong pods
- Pods unbalanced (different sizes)
- Pod system not working

**Solutions:**

1. **Assignment Method:**
   - **Random:** Assignments happen when teams join
   - **Manual:** GM must assign via Manage Pods
   - Check game settings

2. **Reassign:**
   - GM Dashboard → Manage Pods
   - Manually move teams
   - Can reassign before game starts (not during)

3. **Pods Disabled:**
   - Verify pods are enabled in game settings
   - May need to recreate game with pods

---

## Performance & Loading Problems

### Problem: "Dashboard very slow"

**Symptoms:**
- Long load times (>10 seconds)
- Laggy interactions
- Delayed updates

**Solutions:**

1. **Network:**
   - Check internet speed
   - Try wired connection instead of WiFi
   - Close bandwidth-heavy applications

2. **Browser:**
   - Close unused tabs
   - Restart browser
   - Update to latest version

3. **Computer:**
   - Close unnecessary applications
   - Check CPU/memory usage
   - Restart computer

4. **Platform:**
   - Server may be overloaded
   - Check if others experiencing same
   - Contact technical support

### Problem: "Page keeps crashing"

**Symptoms:**
- Browser tab crashes
- "Aw, snap!" error (Chrome)
- Need to reload frequently

**Solutions:**

1. **Memory:**
   - Browser running out of memory
   - Close other tabs
   - Restart browser

2. **Extensions:**
   - Disable all extensions
   - Try incognito mode

3. **Browser:**
   - Try different browser
   - Update current browser
   - Clear cache

4. **Bug:**
   - Note what action causes crash
   - Take screenshot
   - Report to technical support

---

## Browser Compatibility

### Supported Browsers

**✅ Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**⚠️ Limited Support:**
- Older browser versions (may work with issues)
- Mobile browsers (responsive but desktop recommended)

**❌ Not Supported:**
- Internet Explorer (any version)
- Opera Mini
- UC Browser

### Common Browser-Specific Issues

**Chrome:**
- Issue: WebSocket connections blocked by extensions
- Solution: Disable extensions or use incognito

**Firefox:**
- Issue: Enhanced tracking protection may block features
- Solution: Add site to exceptions or use standard protection

**Safari:**
- Issue: Strict cookie policies
- Solution: Allow cross-site tracking for platform domain

**Edge:**
- Issue: Cached data from old Edge version
- Solution: Clear all browsing data

---

## Data & Scoring Issues

### Problem: "Lost game data"

**Symptoms:**
- Game disappeared
- Teams missing
- Submissions gone

**Solutions:**

1. **Check Filters:**
   - May be filtered out
   - Reset all filters

2. **Deleted Accidentally:**
   - Check if delete action was taken
   - Contact technical support immediately
   - May be recoverable from backups

3. **Wrong Account:**
   - Logged into different GM account?
   - Verify email address

### Problem: "Scoring appears incorrect"

**Symptoms:**
- Metrics changed unexpectedly
- Wrong team got points
- Calculation seems off

**Solutions:**

1. **Review Algorithm:**
   - Check GM User Guide scoring section
   - Understand how scores translate to metrics
   - May be working as designed

2. **Check All Scores:**
   - Multiple submissions affect metrics
   - Review metrics history graph
   - Identify which submission caused change

3. **Rescore:**
   - Can update any submission score
   - Metrics will recalculate
   - Document reason for change

---

## Emergency Protocols

### Platform Down During Simulation

**Immediate Actions:**
1. Verify it's not just your connection (check other sites)
2. Check platform status page (if available)
3. Notify students immediately
4. Extend deadline by outage duration + 30 minutes
5. Document incident

**Communication Template:**
```
Subject: BusinessCaise Technical Issue - Deadline Extended

Hi everyone,

The BusinessCaise platform is currently experiencing technical difficulties. We're working to resolve this as quickly as possible.

Current session deadline has been extended by [X hours].
New deadline: [TIME]

I'll send another update when the platform is back online.

Sorry for the inconvenience!
[Your Name]
```

### Data Loss or Corruption

**Actions:**
1. Don't make any changes
2. Screenshot current state
3. Contact technical support immediately
4. Don't delete anything
5. Document timeline of events

**What to provide support:**
- Game ID
- Team names affected
- Description of issue
- Screenshots
- Actions taken before issue
- Approximate time issue started

### Cannot Complete Simulation

**Contingency Plans:**

**Option 1: Manual Scoring**
- Export all submissions
- Score via spreadsheet
- Calculate final grades manually

**Option 2: Alternative Platform**
- Use Google Docs for submissions
- Manual leaderboard in spreadsheet
- Loss of platform features but can continue

**Option 3: Adjust Assessment**
- Weight completed sessions higher
- Use reflection paper instead
- Focus on learning not competition

---

## Reporting Bugs

### Information to Include

When reporting issues to technical support:

**Required:**
1. **What happened:** Clear description
2. **Expected:** What should have happened
3. **Steps to reproduce:** Exact actions taken
4. **Environment:**
   - Browser (name and version)
   - Operating system
   - Screen size

**Helpful:**
5. **Screenshots:** Visual proof
6. **Console logs:** F12 → Console tab
7. **Network logs:** F12 → Network tab
8. **Timestamp:** When did it occur
9. **Frequency:** Always? Sometimes? Once?

### Bug Report Template

```
TITLE: [Short description]

DESCRIPTION:
[Detailed explanation of what went wrong]

STEPS TO REPRODUCE:
1. [First action]
2. [Second action]
3. [Result]

EXPECTED BEHAVIOR:
[What should have happened]

ACTUAL BEHAVIOR:
[What actually happened]

ENVIRONMENT:
- Browser: Chrome 120.0.6099.109
- OS: Windows 11
- Screen: 1920x1080

SCREENSHOTS:
[Attach images]

CONSOLE ERRORS:
[Copy errors from browser console]

ADDITIONAL CONTEXT:
[Any other relevant information]
```

---

## Prevention Tips

### For Game Masters

**Before Simulation:**
- Test all features with dummy data
- Create backup scenarios
- Have contingency plans
- Brief students on what to expect

**During Simulation:**
- Save work frequently (though auto-saves should work)
- Monitor platform performance
- Respond to issues quickly
- Keep troubleshooting guide handy

**After Each Session:**
- Back up any important data (export)
- Document any issues
- Prepare next session early

### For Students

**Best Practices:**
- Draft submissions in Google Docs first (backup)
- Submit before deadline (not last minute)
- Screenshot confirmation after submitting
- Don't wait until last minute to join
- Use recommended browsers

---

## Still Need Help?

**Technical Support:**
- Email: [support email]
- Response time: 24-48 hours
- For urgent issues during pilot: [escalation contact]

**Documentation:**
- GM User Guide: [link]
- Team Player Guide: [link]
- Platform Status: [link]

**Community:**
- Faculty forum: [link]
- FAQ: [link]

---

**Remember:** Most issues have simple solutions. Check this guide first, then escalate if needed!
