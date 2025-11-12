# 🚀 Phase 3 Implementation Plan - Integrated Approach

**Start Date:** November 12, 2025
**Target Completion:** January 7, 2026 (8 weeks)
**Total Effort:** ~275-317 hours

---

## 📋 Overview

**Three Major Systems:**
1. **Company Scenario Customization** (85-107 hours) - Context-aware simulation
2. **Pod Competition & Category Awards** (70-90 hours) - Scalable competition
3. **Narrative/Storytelling System** (120 hours) - Immersive experience

**Integration Points:**
- Narratives are scenario-aware (SaaS vs. restaurant vs. healthcare)
- Narratives are pod-aware (pod rivalries, category achievements)
- Category awards align with scenario metrics
- All three systems enhance each other

---

## 🎯 Implementation Strategy

### Phased Parallel Approach

```
Week 1-2: Foundation (Scenarios + Pods Backend)
├─ Scenario database & API
├─ Pod database & API
└─ Both can be developed in parallel

Week 3-4: User Interfaces (GM + Team)
├─ GM: Scenario selection + Pod management
├─ Team: Scenario display + Pod leaderboards
└─ Frontend for both systems

Week 5-6: Narrative System
├─ Narrative engine (integrates scenarios + pods)
├─ Template system with variables
└─ NPC system

Week 7-8: Integration & Testing
├─ Scenario + Pod + Narrative integration
├─ E2E tests for all workflows
└─ Polish & documentation
```

**Why This Order:**
1. **Scenarios first** - Provides context for narratives
2. **Pods in parallel** - Independent system, can develop alongside scenarios
3. **Narratives last** - Needs both scenario and pod context to work effectively
4. **Testing throughout** - Write tests as we build

---

## 📅 Detailed Timeline

### Week 1: Backend Foundation (Nov 12-18) ✅ COMPLETED

#### Days 1-2: Scenario System Database & Models ✅
- [x] Create database migration
  - [x] `company_archetypes` table
  - [x] `industry_types` table
  - [x] Add columns to `games` table (archetype_id, industry_id, company_name, product_description)
- [x] Seed data for archetypes and industries
  - [x] 5 archetypes with starting metrics
  - [x] 8 industry types with examples
- [x] Create models
  - [x] `ArchetypeModel.ts`
  - [x] `IndustryModel.ts`
- [x] Update `GameModel.ts` to include scenario fields

**Deliverables:** ✅ Database schema complete, seed data loaded

#### Days 3-4: Scenario System API Endpoints ✅
- [x] Reference data endpoints
  - [x] `GET /api/scenarios/archetypes` - List all archetypes
  - [x] `GET /api/scenarios/industries` - List all industries
  - [x] `GET /api/scenarios/preview` - Preview scenario combination
- [x] Update game creation
  - [x] Modify `POST /api/gm/games` to accept scenario fields
  - [x] Validation for required scenario fields
- [x] Update game info endpoints
  - [x] Add scenario data to game responses
- [ ] Update team join logic (TODO: Week 3)
  - [ ] Initialize team with archetype starting metrics
  - [ ] Apply archetype starting cash

**Deliverables:** ✅ Scenario API endpoints functional

#### Days 5-7: Pod System Database & API ✅
- [x] Create database migration
  - [x] `category_rankings` table
  - [x] Optional `pods` table
  - [x] Add columns to `games` table (enable_pods, pod_size, pod_assignment_method, enable_category_awards)
  - [x] Add columns to `teams` table (pod_id, pod_name)
- [x] Create pod assignment logic
  - [x] Random assignment algorithm
  - [x] Manual assignment support
  - [x] Validation (pod size, team count)
- [x] Create category ranking service
  - [x] Calculate rankings by category (financial, operations, marketing, hr, customer, overall)
  - [x] Calculate rankings by scope (pod, global)
  - [x] Snapshot rankings at session end
- [x] Build pod management API endpoints (9 endpoints total)
  - [x] `POST /api/gm/games/:gameId/pods/assign` - Assign pods
  - [x] `GET /api/gm/games/:gameId/pods` - List all pods
  - [x] `GET /api/gm/games/:gameId/pods/:podId/leaderboard` - Pod leaderboard
  - [x] `PUT /api/gm/games/:gameId/teams/:teamId/pod` - Manual assignment
- [x] Build category ranking API endpoints
  - [x] `GET /api/gm/games/:gameId/categories` - Category leaders summary
  - [x] `GET /api/gm/games/:gameId/categories/:category` - Category leaderboard
  - [x] `GET /api/gm/games/:gameId/teams/:teamId/categories` - Team category rankings
  - [x] `POST /api/gm/games/:gameId/categories/snapshot` - Snapshot rankings
  - [x] `GET /api/gm/games/:gameId/sessions/:sessionId/categories` - Historical rankings
- [x] Update team leaderboard endpoints
  - [x] `GET /api/teams/:teamId/pod` - Team's pod info
  - [x] `GET /api/teams/:teamId/pod/leaderboard` - Pod leaderboard
  - [x] `GET /api/teams/:teamId/categories` - Team category rankings

**Deliverables:** ✅ Pod system API complete, category calculations working

**Week 1 Tests:**
- [ ] Unit tests for archetype/industry models (TODO: Week 7-8)
- [ ] Unit tests for scenario preview logic (TODO: Week 7-8)
- [ ] Unit tests for team initialization with archetype metrics (TODO: Week 7-8)
- [ ] Unit tests for pod assignment algorithms (TODO: Week 7-8)
- [ ] Unit tests for category ranking calculations (TODO: Week 7-8)
- [ ] Integration tests for API endpoints (TODO: Week 7-8)

**Estimated Time:** 35-40 hours
**Actual Time:** Week 1 completed

---

### Week 2: GM Dashboard UI - Scenarios & Pods (Nov 19-25) 🚀 In Progress

#### Days 1-3: Scenario Selection Interface ✅ COMPLETED
- [x] Update `CreateGamePage.tsx`
  - [x] Add scenario settings section
  - [x] Archetype selection grid (5 archetypes with interactive cards)
  - [x] Industry selection grid (8 industries with interactive cards)
  - [x] Integrated scenario preview component
  - [x] Optional company name input
  - [x] Optional product description input
  - [x] Pod competition configuration section
  - [x] Category awards configuration section
- [x] Create `ScenarioSelector.tsx` component (comprehensive)
  - [x] Display archetype details with icons
  - [x] Display industry details with icons
  - [x] Show starting conditions (cash, team size, difficulty)
  - [x] Show focus areas
  - [x] Show example products
  - [x] Real-time preview updates
  - [x] Beautiful gradient UI with responsive grid layout
- [ ] Update `GameDetailsPage.tsx` (TODO: Days 4-7)
  - [ ] Display game scenario in header/banner
  - [ ] Show archetype and industry badges
  - [ ] Display company name if set
- [x] Update `api.ts` service
  - [x] Add scenarioAPI with getArchetypes, getIndustries, getPreview
  - [x] Add podAPI with 9 pod management endpoints
  - [x] Update game creation to include scenario fields
  - [x] Update game creation to include pod fields
- [x] Update types/index.ts
  - [x] Add Archetype, Industry, ScenarioPreview interfaces
  - [x] Add PodInfo, CategoryRanking, CategoryLeader, TeamCategoryRankings interfaces
- [x] Styling
  - [x] Scenario badges (with icons 🚀💰📦🔄📈💡)
  - [x] Preview card design with gradient backgrounds
  - [x] Responsive grid layout (mobile + desktop)
  - [x] Visual hierarchy with sections
  - [x] Interactive hover states

**Deliverables:** ✅ GM can select and preview scenarios during game creation with full pod configuration

#### Days 4-7: Pod Management Interface
- [ ] Update `CreateGamePage.tsx`
  - [ ] Add pod competition settings section
  - [ ] Enable pods checkbox
  - [ ] Pod size selector (3-6 teams)
  - [ ] Pod assignment method selector
  - [ ] Enable category awards checkbox
- [ ] Create `PodManagementPage.tsx`
  - [ ] Display all pods with teams
  - [ ] Show pod statistics (avg score, team count)
  - [ ] Random assignment button
  - [ ] Manual team reassignment (drag-drop or dropdown)
  - [ ] Add new custom pod functionality
- [ ] Update `GameDetailsPage.tsx`
  - [ ] Add "Manage Pods" button (if pods enabled)
  - [ ] Display pod summary statistics
  - [ ] Add category leaders section
- [ ] Create `CategoryLeaderboard.tsx` component
  - [ ] Tab navigation (Pod A, Pod B, Global)
  - [ ] Display 6 categories with icons
  - [ ] Show top 3 for each category
  - [ ] Highlight leader with badge
- [ ] Update routing in `App.tsx`
  - [ ] Add `/games/:gameId/pods` route
- [ ] Update `api.ts` service
  - [ ] Add pod management functions
  - [ ] Add category ranking fetch functions
- [ ] Styling
  - [ ] Pod cards with team lists
  - [ ] Category icons and badges (🥇🥈🥉)
  - [ ] Leaderboard tables

**Deliverables:** GM can manage pods and view category leaders

**Week 2 Tests:**
- [ ] Component tests for ScenarioPreview
- [ ] Component tests for PodManagementPage
- [ ] Component tests for CategoryLeaderboard
- [ ] E2E test: GM creates game with scenario
- [ ] E2E test: GM creates game with pods enabled
- [ ] E2E test: GM assigns teams to pods randomly

**Estimated Time:** 30-35 hours

---

### Week 3: Team Player UI - Scenarios & Pods (Nov 26 - Dec 2)

#### Days 1-3: Scenario Display
- [ ] Create public game info endpoint (if not exists)
  - [ ] `GET /api/games/info/:code` - Returns game with scenario details
- [ ] Update `JoinGamePage.tsx`
  - [ ] Fetch game info after entering code
  - [ ] Display scenario information (read-only)
  - [ ] Show archetype and industry badges
  - [ ] Show company name and product description
  - [ ] Display starting conditions preview
- [ ] Update `PlayerGame.tsx` (team dashboard)
  - [ ] Add scenario context to header
  - [ ] Display company name prominently
  - [ ] Show archetype and industry badges
  - [ ] Optional: Scenario description tooltip
- [ ] Update team API service
  - [ ] Add game info fetch function
- [ ] Styling
  - [ ] Scenario info card on join page
  - [ ] Header badges for dashboard
  - [ ] Responsive design

**Deliverables:** Teams see scenario when joining and in dashboard

#### Days 4-7: Pod Leaderboards & Category Rankings
- [ ] Update `PlayerGame.tsx` leaderboard section
  - [ ] Add tab navigation (Pod / Global / Categories)
  - [ ] Set "Pod" as default tab
- [ ] Create `PodLeaderboard.tsx` component
  - [ ] Display pod name
  - [ ] Show team's rank in pod
  - [ ] List all teams in pod (4 teams)
  - [ ] Highlight current team
  - [ ] Show rank badges (🥇🥈🥉)
- [ ] Create `GlobalLeaderboard.tsx` component
  - [ ] Display total team count
  - [ ] Show team's global rank
  - [ ] List all teams with pod names
  - [ ] Highlight current team
- [ ] Create `CategoryRankings.tsx` component
  - [ ] Display 6 categories with icons
  - [ ] Show pod rankings for each category
  - [ ] Show global rankings (top 3 finishes only)
  - [ ] Display rank badges (🥇🥈🥉) for 1st-3rd place
  - [ ] Show category scores
- [ ] Update team API service
  - [ ] Add pod leaderboard fetch
  - [ ] Add global leaderboard fetch
  - [ ] Add category rankings fetch
- [ ] Styling
  - [ ] Tab navigation design
  - [ ] Leaderboard tables (pod vs. global)
  - [ ] Category achievement cards
  - [ ] Badge colors and animations

**Deliverables:** Teams see pod competition, global view, and category rankings

**Week 3 Tests:**
- [ ] Component tests for scenario display components
- [ ] Component tests for PodLeaderboard
- [ ] Component tests for CategoryRankings
- [ ] E2E test: Team joins game and sees scenario
- [ ] E2E test: Team views pod leaderboard
- [ ] E2E test: Team views category rankings
- [ ] E2E test: Complete flow (GM creates with scenario+pods, team joins, submits, views rankings)

**Estimated Time:** 25-30 hours

---

### Week 4: Scenario & Pod Integration Testing (Dec 3-9)

#### Days 1-3: Backend Integration
- [ ] Test scenario initialization with team metrics
  - [ ] Verify all 5 archetypes apply correct starting metrics
  - [ ] Verify starting cash matches archetype
  - [ ] Test edge cases (missing fields, invalid IDs)
- [ ] Test pod assignment with scenarios
  - [ ] Random assignment across different game sizes
  - [ ] Manual assignment validation
  - [ ] Verify pods work with scenario games
- [ ] Test category rankings
  - [ ] Calculate rankings after decisions submitted
  - [ ] Verify pod-scoped vs. global-scoped rankings
  - [ ] Test snapshot functionality
- [ ] Performance testing
  - [ ] Test with 40+ teams
  - [ ] Verify leaderboard query performance
  - [ ] Optimize slow queries if needed

**Deliverables:** Backend fully tested and optimized

#### Days 4-7: End-to-End Integration Tests
- [ ] E2E test: Complete game flow with scenarios
  - [ ] GM creates game with startup+SaaS scenario
  - [ ] 4 teams join
  - [ ] GM starts game
  - [ ] Teams submit decisions
  - [ ] Verify metrics match archetype expectations
  - [ ] Verify scenario appears in UI throughout
- [ ] E2E test: Complete game flow with pods
  - [ ] GM creates game with 8 teams and pods enabled
  - [ ] GM assigns teams to 2 pods randomly
  - [ ] Teams submit decisions
  - [ ] Verify pod leaderboards correct
  - [ ] Verify global leaderboard correct
  - [ ] Verify category rankings calculated
- [ ] E2E test: Combined scenarios + pods
  - [ ] GM creates turnaround+retail game with pods
  - [ ] Verify starting metrics match archetype
  - [ ] Verify pod competition works
  - [ ] Verify category awards work
- [ ] Cross-browser testing
  - [ ] Chrome, Firefox, Safari
  - [ ] Mobile responsiveness

**Deliverables:** All E2E tests passing, systems integrated

**Week 4 Tests:**
- [ ] Full regression test suite
- [ ] Integration test suite (scenarios + pods)
- [ ] Performance benchmarks
- [ ] Browser compatibility tests

**Estimated Time:** 25-30 hours

---

### Week 5-6: Narrative System (Dec 10-23)

#### Week 5 Days 1-4: Narrative Backend
- [ ] Create narrative service
  - [ ] Template selection logic
  - [ ] Variable substitution engine ({{team_name}}, {{company_name}}, {{product}}, etc.)
  - [ ] Scenario-aware template selection
  - [ ] Pod-aware template selection
- [ ] Create narrative templates
  - [ ] 10 generic templates (fallback)
  - [ ] 25 scenario-specific templates (5 archetypes × 5 events)
  - [ ] 15 pod-aware templates (rivalries, achievements)
  - [ ] 10 category achievement templates
- [ ] Create NPC system
  - [ ] Industry-specific NPC definitions (SaaS, food, retail, etc.)
  - [ ] NPC personality traits
  - [ ] NPC interaction templates
- [ ] Build narrative API endpoints
  - [ ] `GET /api/teams/:teamId/narratives` - Get team narratives
  - [ ] `GET /api/teams/:teamId/narratives/morning-briefing` - Today's briefing
  - [ ] `GET /api/teams/:teamId/narratives/news` - News feed
  - [ ] `GET /api/teams/:teamId/narratives/emails` - Email inbox
  - [ ] `POST /api/gm/games/:gameId/narratives/event` - GM triggers custom event
- [ ] Narrative generation triggers
  - [ ] Auto-generate morning briefing on session unlock
  - [ ] Generate news items on decision submission
  - [ ] Generate category achievement notifications
  - [ ] Generate pod rivalry narratives

**Deliverables:** Narrative engine working, templates created

#### Week 5 Days 5-7: Narrative Frontend (Team Player)
- [ ] Update `PlayerGame.tsx`
  - [ ] Add "News" or "Briefings" tab/section
  - [ ] Add notification badge for new narratives
- [ ] Create `MorningBriefing.tsx` component
  - [ ] Display today's briefing
  - [ ] Show pod standings
  - [ ] Show category achievements
  - [ ] Scenario-specific content
- [ ] Create `NewsFeed.tsx` component
  - [ ] List news items (newest first)
  - [ ] Filter by type (company, pod, achievement)
  - [ ] Display with appropriate icons
  - [ ] Mark as read functionality
- [ ] Create `EmailInbox.tsx` component
  - [ ] List emails from NPCs
  - [ ] Display sender (NPC character)
  - [ ] Show email content
  - [ ] Reply functionality (optional/future)
- [ ] Update team API service
  - [ ] Add narrative fetch functions

**Deliverables:** Teams see narratives in their dashboard

#### Week 6 Days 1-4: Narrative Frontend (GM Dashboard)
- [ ] Update `GameDetailsPage.tsx`
  - [ ] Add "Narratives" section
  - [ ] Show recent narratives generated
- [ ] Create `GMEventCreator.tsx` component
  - [ ] Form to create custom narrative
  - [ ] Target selection (all teams, specific pod, specific team)
  - [ ] Event type selector (crisis, opportunity, milestone)
  - [ ] Rich text editor for content
  - [ ] Preview before sending
- [ ] Create `NarrativeHistory.tsx` component
  - [ ] List all narratives generated for game
  - [ ] Filter by type, team, pod
  - [ ] View narrative details
- [ ] Update GM API service
  - [ ] Add GM event creation function

**Deliverables:** GM can create custom narratives and view history

#### Week 6 Days 5-7: Narrative Testing & Polish
- [ ] Unit tests for template engine
  - [ ] Variable substitution
  - [ ] Template selection logic
  - [ ] Scenario-aware selection
  - [ ] Pod-aware selection
- [ ] E2E tests for narratives
  - [ ] Morning briefing generated on session start
  - [ ] News feed updates on decisions
  - [ ] Category achievement notifications
  - [ ] GM custom events delivered
- [ ] Content review
  - [ ] Proofread all templates
  - [ ] Test all scenario combinations
  - [ ] Verify tone and style consistency
- [ ] Performance optimization
  - [ ] Cache templates
  - [ ] Optimize narrative generation queries

**Deliverables:** Narrative system fully functional and tested

**Estimated Time:** 45-50 hours

---

### Week 7: Full System Integration (Dec 24-30)

#### Days 1-4: Integration & Polish
- [ ] Test all three systems together
  - [ ] Scenario + Pod + Narrative integration
  - [ ] Verify narratives use scenario context
  - [ ] Verify narratives use pod context
  - [ ] Verify category achievements trigger narratives
- [ ] UI/UX refinements
  - [ ] Consistent styling across all new features
  - [ ] Responsive design verification
  - [ ] Loading states and error handling
  - [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Performance optimization
  - [ ] Database query optimization
  - [ ] Frontend bundle size optimization
  - [ ] API response time improvements
- [ ] Bug fixes
  - [ ] Address any issues found in testing
  - [ ] Edge case handling

**Deliverables:** Fully integrated system, polished UI

#### Days 5-7: Comprehensive Testing
- [ ] Full regression test suite
  - [ ] Re-run all existing E2E tests (82 tests)
  - [ ] Ensure no regressions from new features
- [ ] New E2E test scenarios
  - [ ] Large class simulation (40 teams, 10 pods)
  - [ ] Multiple scenario types (startup, turnaround, etc.)
  - [ ] Category award workflows
  - [ ] Narrative generation at scale
- [ ] Load testing
  - [ ] Simulate multiple concurrent games
  - [ ] Test with 100+ teams across multiple games
  - [ ] Verify WebSocket performance
- [ ] Security testing
  - [ ] SQL injection prevention
  - [ ] XSS prevention
  - [ ] Authorization checks on all new endpoints

**Deliverables:** All tests passing, system stable

**Estimated Time:** 30-35 hours

---

### Week 8: Documentation & Deployment Prep (Dec 31 - Jan 7)

#### Days 1-3: Documentation
- [ ] Update API documentation
  - [ ] Document all new endpoints
  - [ ] Add request/response examples
  - [ ] Update Swagger/OpenAPI spec (if using)
- [ ] GM User Guide
  - [ ] How to choose scenarios
  - [ ] How to use pod competition
  - [ ] How to create custom narratives
  - [ ] Best practices for large classes
- [ ] Team User Guide
  - [ ] Understanding scenarios
  - [ ] How pod competition works
  - [ ] How to track category rankings
  - [ ] Reading narratives and briefings
- [ ] Technical documentation
  - [ ] Database schema updates
  - [ ] Migration guide from Phase 2 to Phase 3
  - [ ] Deployment guide
  - [ ] Environment variables

**Deliverables:** Complete documentation

#### Days 4-7: Deployment Preparation
- [ ] Database migrations
  - [ ] Test migrations on staging
  - [ ] Write rollback scripts
  - [ ] Seed production data (archetypes, industries)
- [ ] Environment setup
  - [ ] Production environment variables
  - [ ] Database backups configured
  - [ ] Monitoring setup (error tracking, performance)
- [ ] Deployment dry run
  - [ ] Deploy to staging environment
  - [ ] Full smoke test on staging
  - [ ] Performance test on staging
- [ ] Training materials
  - [ ] Video tutorials (optional)
  - [ ] Quick start guide
  - [ ] FAQ document
- [ ] Final review
  - [ ] Code review of all changes
  - [ ] Security audit
  - [ ] Performance benchmarks

**Deliverables:** Ready for production deployment

**Estimated Time:** 25-30 hours

---

## 📊 Total Effort Summary

| System | Hours | Weeks |
|--------|-------|-------|
| Scenario Customization | 85-107 | 2-3 |
| Pod Competition | 70-90 | 2-3 |
| Narrative System | 120 | 2 |
| Integration & Testing | 30-35 | 1 |
| Documentation & Deployment | 25-30 | 1 |
| **TOTAL** | **330-382** | **8** |

**With 40-45 hours/week:** 8 weeks
**With 30-35 hours/week:** 10-11 weeks
**With team of 2:** 4-5 weeks

---

## ✅ Success Criteria

### Must Have (MVP)
- ✅ GM can select company archetype and industry when creating game
- ✅ Teams initialize with archetype-specific starting metrics
- ✅ GM can enable pod competition (optional)
- ✅ GM can assign teams to pods (random or manual)
- ✅ Teams see pod leaderboard as primary view
- ✅ Teams can view global leaderboard
- ✅ 6 category rankings calculated automatically
- ✅ Teams see their category achievements
- ✅ Morning briefings reference scenario and pod standings
- ✅ News feed includes pod rivalries and category achievements
- ✅ All 82 existing E2E tests still pass
- ✅ 20+ new E2E tests for Phase 3 features pass

### Should Have
- ⭕ Scenario-specific narrative templates (50+ templates)
- ⭕ Industry-specific NPCs
- ⭕ GM can create custom narrative events
- ⭕ Historical category rankings tracked
- ⭕ Pod performance analytics

### Could Have (Future)
- ⭕ Custom archetype creation
- ⭕ Balanced pod assignment algorithm
- ⭕ Dynamic pod promotion/relegation
- ⭕ AI-generated narratives

---

## 🚨 Risks & Mitigation

### Risk 1: Scope Creep
**Mitigation:** Stick to MVP features, track "Could Have" for Phase 4

### Risk 2: Integration Complexity
**Mitigation:** Weekly integration tests, continuous deployment to staging

### Risk 3: Performance with Large Data
**Mitigation:** Load testing early (Week 4), optimize queries proactively

### Risk 4: Narrative Quality
**Mitigation:** Content review in Week 6, iterate on templates

### Risk 5: Testing Time Underestimated
**Mitigation:** Write tests alongside features, not at end

---

## 📞 Weekly Checkpoints

### Week 1 Checkpoint
- [ ] Database migrations complete
- [ ] Scenario API functional
- [ ] Pod API functional
- [ ] Unit tests passing

### Week 2 Checkpoint
- [ ] GM can create games with scenarios
- [ ] GM can create games with pods
- [ ] UI responsive and styled

### Week 3 Checkpoint
- [ ] Teams see scenarios when joining
- [ ] Teams see pod leaderboards
- [ ] Teams see category rankings

### Week 4 Checkpoint
- [ ] All integration tests passing
- [ ] No regressions in existing features
- [ ] Performance benchmarks met

### Week 5-6 Checkpoint
- [ ] Narrative engine functional
- [ ] Templates created and tested
- [ ] UI integrated with narratives

### Week 7 Checkpoint
- [ ] Full system integration complete
- [ ] All E2E tests passing
- [ ] UI polished

### Week 8 Checkpoint
- [ ] Documentation complete
- [ ] Ready for deployment
- [ ] Training materials available

---

## 🎯 Next Actions (Starting Now)

### Immediate (Today)
1. ✅ Create this implementation plan
2. **Create database migration for scenarios**
3. **Create seed data for archetypes and industries**
4. **Create ArchetypeModel and IndustryModel**

### This Week (Week 1)
- Complete scenario backend
- Complete pod backend
- Write initial tests

### This Month (Weeks 1-4)
- Complete scenario and pod systems fully
- Frontend interfaces for both
- Full integration testing

---

**Let's get started! 🚀**
