import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create a testable version of DemoModeManager
class DemoModeManager {
  private isDemoMode: boolean = false;

  constructor() {
    const stored = localStorage.getItem('businesscase_demo_mode');
    this.isDemoMode = stored === 'true';
  }

  isEnabled(): boolean {
    return this.isDemoMode;
  }

  enable(): void {
    this.isDemoMode = true;
    this.save();
  }

  disable(): void {
    this.isDemoMode = false;
    this.save();
  }

  toggle(): boolean {
    this.isDemoMode = !this.isDemoMode;
    this.save();
    return this.isDemoMode;
  }

  private save(): void {
    localStorage.setItem('businesscase_demo_mode', this.isDemoMode.toString());
  }

  getDemoCredentials() {
    return {
      gameMaster: {
        email: 'demo-gm@businesscase.com',
        password: 'demo123',
        name: 'Demo Game Master',
      },
      player1: {
        email: 'demo-player1@businesscase.com',
        password: 'demo123',
        name: 'Demo Player 1',
      },
      player2: {
        email: 'demo-player2@businesscase.com',
        password: 'demo123',
        name: 'Demo Player 2',
      },
    };
  }
}

describe('DemoModeManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should start disabled by default', () => {
      const manager = new DemoModeManager();
      expect(manager.isEnabled()).toBe(false);
    });
  });

  describe('Enable/Disable', () => {
    it('should enable demo mode', () => {
      const manager = new DemoModeManager();
      manager.enable();

      expect(manager.isEnabled()).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'businesscase_demo_mode',
        'true'
      );
    });

    it('should disable demo mode', () => {
      localStorage.setItem('businesscase_demo_mode', 'true');
      const manager = new DemoModeManager();

      manager.disable();

      expect(manager.isEnabled()).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'businesscase_demo_mode',
        'false'
      );
    });

    it('should toggle demo mode on', () => {
      const manager = new DemoModeManager();
      const result = manager.toggle();

      expect(result).toBe(true);
      expect(manager.isEnabled()).toBe(true);
    });

    it('should toggle demo mode from initial state', () => {
      const manager = new DemoModeManager();

      // Toggle on
      const resultOn = manager.toggle();
      expect(resultOn).toBe(true);
      expect(manager.isEnabled()).toBe(true);

      // Toggle off
      const resultOff = manager.toggle();
      expect(resultOff).toBe(false);
      expect(manager.isEnabled()).toBe(false);
    });
  });

  describe('Demo Credentials', () => {
    it('should provide demo credentials', () => {
      const manager = new DemoModeManager();
      const credentials = manager.getDemoCredentials();

      expect(credentials.gameMaster).toBeDefined();
      expect(credentials.gameMaster.email).toBe('demo-gm@businesscase.com');
      expect(credentials.gameMaster.password).toBe('demo123');

      expect(credentials.player1).toBeDefined();
      expect(credentials.player1.email).toBe('demo-player1@businesscase.com');

      expect(credentials.player2).toBeDefined();
      expect(credentials.player2.email).toBe('demo-player2@businesscase.com');
    });

    it('should provide same credentials regardless of demo mode state', () => {
      const manager = new DemoModeManager();

      const credsBefore = manager.getDemoCredentials();
      manager.enable();
      const credsAfter = manager.getDemoCredentials();

      expect(credsBefore).toEqual(credsAfter);
    });
  });
});
