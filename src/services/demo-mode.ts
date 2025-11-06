// Demo Mode Manager
// Controls whether the app uses real API or mock data

const DEMO_MODE_KEY = 'businesscaise_demo_mode';

export class DemoModeManager {
  private static instance: DemoModeManager;
  private isDemoMode: boolean = false;

  private constructor() {
    try {
      // Check localStorage for demo mode preference
      const stored = localStorage.getItem(DEMO_MODE_KEY);
      this.isDemoMode = stored === 'true';

      // Check URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('demo')) {
        this.isDemoMode = urlParams.get('demo') === 'true';
        this.save();
      }
    } catch (error) {
      console.error('Error initializing demo mode:', error);
      // Default to false if there's an error
      this.isDemoMode = false;
    }
  }

  static getInstance(): DemoModeManager {
    if (!DemoModeManager.instance) {
      DemoModeManager.instance = new DemoModeManager();
    }
    return DemoModeManager.instance;
  }

  isEnabled(): boolean {
    return this.isDemoMode;
  }

  enable(): void {
    this.isDemoMode = true;
    this.save();
    this.notifyChange();
  }

  disable(): void {
    this.isDemoMode = false;
    this.save();
    this.notifyChange();
  }

  toggle(): void {
    this.isDemoMode = !this.isDemoMode;
    this.save();
    this.notifyChange();
  }

  private save(): void {
    localStorage.setItem(DEMO_MODE_KEY, String(this.isDemoMode));
  }

  private notifyChange(): void {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(
      new CustomEvent('demo-mode-changed', {
        detail: { enabled: this.isDemoMode },
      })
    );
  }

  getDemoCredentials() {
    return {
      gameMaster: {
        email: 'demo-gm@businesscaise.com',
        password: 'demo123',
        name: 'Demo Game Master',
      },
      player1: {
        email: 'demo-player1@businesscaise.com',
        password: 'demo123',
        name: 'Demo Player 1',
      },
      player2: {
        email: 'demo-player2@businesscaise.com',
        password: 'demo123',
        name: 'Demo Player 2',
      },
    };
  }

  getDemoGameId(): string {
    return 'game-demo-001';
  }
}

// Export singleton instance
export const demoMode = DemoModeManager.getInstance();
