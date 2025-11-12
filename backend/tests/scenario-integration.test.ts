/**
 * Scenario Integration Tests
 * Tests scenario-aware team initialization with different archetypes
 */

import { query } from '../src/config/database';
import { GameModel } from '../src/models/Game.model';
import { TeamModel } from '../src/models/Team.model';
import { ArchetypeModel } from '../src/models/Archetype.model';

describe('Scenario Integration Tests', () => {
  let gameId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user for game creation
    const userResult = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['scenario-test@test.com', 'dummy-hash', 'Scenario Tester', 'game_master']
    );
    testUserId = userResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  afterEach(async () => {
    // Clean up test games after each test
    if (gameId) {
      await query('DELETE FROM games WHERE id = $1', [gameId]);
    }
  });

  describe('Team Initialization with Archetypes', () => {
    test('should initialize team with startup archetype metrics', async () => {
      // Create game with startup archetype
      const game = await GameModel.create({
        title: 'Startup Scenario Test',
        game_master_id: testUserId,
        archetype_id: 'startup',
        industry_id: 'saas',
      });
      gameId = game.id;

      // Fetch archetype to know expected metrics
      const archetype = await ArchetypeModel.findById('startup');
      expect(archetype).toBeTruthy();
      expect(archetype!.name).toBe('Startup');

      // Set game to setup status
      await GameModel.updateStatus(gameId, 'setup');

      // Create a team
      const team = await TeamModel.create({
        game_id: gameId,
        name: 'Test Startup Team',
        color: '#3B82F6',
        members: ['Alice', 'Bob'],
        metrics: {
          financial: archetype!.starting_metrics.financial,
          hr: archetype!.starting_metrics.hr,
          market_communication: archetype!.starting_metrics.marketing,
          operations: archetype!.starting_metrics.operations,
          customer_satisfaction: archetype!.starting_metrics.customer_satisfaction,
        },
      });

      // Verify metrics match archetype starting metrics
      expect(team.metrics.financial).toBe(archetype!.starting_metrics.financial);
      expect(team.metrics.hr).toBe(archetype!.starting_metrics.hr);
      expect(team.metrics.market_communication).toBe(archetype!.starting_metrics.marketing);
      expect(team.metrics.operations).toBe(archetype!.starting_metrics.operations);
      expect(team.metrics.customer_satisfaction).toBe(archetype!.starting_metrics.customer_satisfaction);

      // Cleanup
      await query('DELETE FROM teams WHERE id = $1', [team.id]);
    });

    test('should initialize team with turnaround archetype metrics', async () => {
      // Create game with turnaround archetype
      const game = await GameModel.create({
        title: 'Turnaround Scenario Test',
        game_master_id: testUserId,
        archetype_id: 'turnaround',
        industry_id: 'ecommerce',
      });
      gameId = game.id;

      // Fetch archetype
      const archetype = await ArchetypeModel.findById('turnaround');
      expect(archetype).toBeTruthy();
      expect(archetype!.name).toBe('Turnaround');

      // Set game to setup status
      await GameModel.updateStatus(gameId, 'setup');

      // Create a team
      const team = await TeamModel.create({
        game_id: gameId,
        name: 'Test Turnaround Team',
        color: '#EF4444',
        members: ['Charlie', 'Dana'],
        metrics: {
          financial: archetype!.starting_metrics.financial,
          hr: archetype!.starting_metrics.hr,
          market_communication: archetype!.starting_metrics.marketing,
          operations: archetype!.starting_metrics.operations,
          customer_satisfaction: archetype!.starting_metrics.customer_satisfaction,
        },
      });

      // Turnaround should have lower starting metrics (challenging start)
      expect(team.metrics.financial).toBeLessThan(50);
      expect(team.metrics.operations).toBeLessThan(50);

      // Cleanup
      await query('DELETE FROM teams WHERE id = $1', [team.id]);
    });

    test('should initialize team with scale-up archetype metrics', async () => {
      // Create game with scale_up archetype
      const game = await GameModel.create({
        title: 'Scale-Up Scenario Test',
        game_master_id: testUserId,
        archetype_id: 'scale_up',
        industry_id: 'services',
      });
      gameId = game.id;

      // Fetch archetype
      const archetype = await ArchetypeModel.findById('scale_up');
      expect(archetype).toBeTruthy();
      expect(archetype!.name).toBe('Scale-Up');

      // Set game to setup status
      await GameModel.updateStatus(gameId, 'setup');

      // Create a team
      const team = await TeamModel.create({
        game_id: gameId,
        name: 'Test Scale-Up Team',
        color: '#10B981',
        members: ['Eve', 'Frank'],
        metrics: {
          financial: archetype!.starting_metrics.financial,
          hr: archetype!.starting_metrics.hr,
          market_communication: archetype!.starting_metrics.marketing,
          operations: archetype!.starting_metrics.operations,
          customer_satisfaction: archetype!.starting_metrics.customer_satisfaction,
        },
      });

      // Scale-up should have higher starting metrics
      expect(team.metrics.financial).toBeGreaterThan(50);
      expect(team.metrics.operations).toBeGreaterThan(50);

      // Cleanup
      await query('DELETE FROM teams WHERE id = $1', [team.id]);
    });

    test('should use default metrics when no archetype is specified', async () => {
      // Create game without archetype
      const game = await GameModel.create({
        title: 'No Scenario Test',
        game_master_id: testUserId,
      });
      gameId = game.id;

      // Set game to setup status
      await GameModel.updateStatus(gameId, 'setup');

      // Create a team
      const team = await TeamModel.create({
        game_id: gameId,
        name: 'Test Default Team',
        color: '#8B5CF6',
        members: ['George', 'Helen'],
        metrics: {
          financial: 50,
          hr: 50,
          market_communication: 50,
          operations: 50,
          customer_satisfaction: 50,
        },
      });

      // Should have default 50s
      expect(team.metrics.financial).toBe(50);
      expect(team.metrics.hr).toBe(50);
      expect(team.metrics.market_communication).toBe(50);
      expect(team.metrics.operations).toBe(50);
      expect(team.metrics.customer_satisfaction).toBe(50);

      // Cleanup
      await query('DELETE FROM teams WHERE id = $1', [team.id]);
    });

    test('should handle invalid archetype_id gracefully', async () => {
      // Create game with invalid archetype
      const game = await GameModel.create({
        title: 'Invalid Archetype Test',
        game_master_id: testUserId,
        archetype_id: 'nonexistent',
        industry_id: 'saas',
      });
      gameId = game.id;

      // Set game to setup status
      await GameModel.updateStatus(gameId, 'setup');

      // Create a team - should fall back to defaults
      const team = await TeamModel.create({
        game_id: gameId,
        name: 'Test Fallback Team',
        color: '#F59E0B',
        members: ['Ivan', 'Julia'],
        metrics: {
          financial: 50,
          hr: 50,
          market_communication: 50,
          operations: 50,
          customer_satisfaction: 50,
        },
      });

      // Should have default 50s as fallback
      expect(team.metrics.financial).toBe(50);
      expect(team.metrics.hr).toBe(50);

      // Cleanup
      await query('DELETE FROM teams WHERE id = $1', [team.id]);
    });
  });

  describe('All Archetypes Available', () => {
    test('should have all 5 archetypes in database', async () => {
      const archetypes = await ArchetypeModel.findAll();

      expect(archetypes.length).toBeGreaterThanOrEqual(5);

      const archetypeIds = archetypes.map(a => a.id);
      expect(archetypeIds).toContain('startup');
      expect(archetypeIds).toContain('product_launch');
      expect(archetypeIds).toContain('turnaround');
      expect(archetypeIds).toContain('scale_up');
      expect(archetypeIds).toContain('innovation');
    });

    test('all archetypes should have valid starting metrics', async () => {
      const archetypes = await ArchetypeModel.findAll();

      for (const archetype of archetypes) {
        // All metrics should be between 0 and 100
        expect(archetype.starting_metrics.financial).toBeGreaterThanOrEqual(0);
        expect(archetype.starting_metrics.financial).toBeLessThanOrEqual(100);

        expect(archetype.starting_metrics.operations).toBeGreaterThanOrEqual(0);
        expect(archetype.starting_metrics.operations).toBeLessThanOrEqual(100);

        expect(archetype.starting_metrics.marketing).toBeGreaterThanOrEqual(0);
        expect(archetype.starting_metrics.marketing).toBeLessThanOrEqual(100);

        expect(archetype.starting_metrics.hr).toBeGreaterThanOrEqual(0);
        expect(archetype.starting_metrics.hr).toBeLessThanOrEqual(100);

        expect(archetype.starting_metrics.customer_satisfaction).toBeGreaterThanOrEqual(0);
        expect(archetype.starting_metrics.customer_satisfaction).toBeLessThanOrEqual(100);

        // Starting cash should be positive
        expect(archetype.starting_cash).toBeGreaterThan(0);
      }
    });
  });
});
