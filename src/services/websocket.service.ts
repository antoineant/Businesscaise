import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export type WebSocketEventHandler = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  /**
   * Connect to the WebSocket server
   */
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupDefaultListeners();
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Join a game room
   */
  joinGame(gameId: string): void {
    this.emit('join:game', gameId);
  }

  /**
   * Leave a game room
   */
  leaveGame(gameId: string): void {
    this.emit('leave:game', gameId);
  }

  /**
   * Join a team room
   */
  joinTeam(teamId: string, teamData?: any): void {
    this.emit('join:team', teamId, teamData);
  }

  /**
   * Leave a team room
   */
  leaveTeam(teamId: string): void {
    this.emit('leave:team', teamId);
  }

  /**
   * Join GM monitoring room
   */
  joinGM(gameId: string): void {
    this.emit('join:gm', gameId);
  }

  /**
   * Emit typing indicator
   */
  emitTyping(teamId: string, memberId: string): void {
    this.emit('team:typing', { teamId, memberId });
  }

  /**
   * Emit draft decision update
   */
  emitDraft(teamId: string, challengeId: string, draftData: any): void {
    this.emit('decision:draft', { teamId, challengeId, draftData });
  }

  /**
   * Send heartbeat ping
   */
  ping(callback?: (response: any) => void): void {
    if (callback) {
      this.emit('ping', null, callback);
    } else {
      this.emit('ping');
    }
  }

  /**
   * Subscribe to an event
   */
  on(event: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Register with socket.io
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }

    // Unregister from socket.io
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Emit an event to the server
   */
  private emit(event: string, data?: any, callback?: Function): void {
    if (this.socket?.connected) {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  /**
   * Setup default event listeners
   */
  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✓ WebSocket connected');
      this.reconnectAttempts = 0;
      this.notifyHandlers('connection:established', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('✗ WebSocket disconnected:', reason);
      this.notifyHandlers('connection:lost', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.notifyHandlers('connection:error', { error, attempts: this.reconnectAttempts });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✓ WebSocket reconnected after', attemptNumber, 'attempts');
      this.notifyHandlers('connection:reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('✗ WebSocket reconnection failed');
      this.notifyHandlers('connection:failed', {});
    });

    // Register all existing event handlers
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket!.on(event, handler);
      });
    });
  }

  /**
   * Notify all handlers for an event
   */
  private notifyHandlers(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;

// Event type definitions for TypeScript
export interface GameStatusChangedEvent {
  status: string;
  game: any;
  timestamp: string;
}

export interface SessionUnlockedEvent {
  session: any;
  timestamp: string;
}

export interface SessionCompletedEvent {
  session: any;
  timestamp: string;
}

export interface SubmissionReceivedEvent {
  submission_id: string;
  team_id: string;
  team_name: string;
  session_id: string;
  challenge_id: string;
  submitted_at: string;
  timestamp: string;
}

export interface SubmissionScoredEvent {
  submission_id: string;
  score: number;
  feedback: string;
  metrics: any;
  overall_score: number;
  timestamp: string;
}

export interface MetricsUpdatedEvent {
  metrics: {
    financial: number;
    hr: number;
    market_communication: number;
    operations: number;
    customer_satisfaction: number;
  };
  timestamp: string;
}

export interface LeaderboardUpdatedEvent {
  leaderboard: Array<{
    rank: number;
    team_id: string;
    team_name: string;
    overall_score: number;
  }>;
  timestamp: string;
}

export interface EventInjectedEvent {
  event: any;
  timestamp: string;
}

export interface DeadlineExtendedEvent {
  deadline: any;
  timestamp: string;
}

export interface TeamJoinedEvent {
  team: any;
  timestamp: string;
}

export interface ParticipantJoinedEvent {
  socketId: string;
  timestamp: string;
}

export interface TeamMemberJoinedEvent {
  socketId: string;
  teamData: any;
  timestamp: string;
}

export interface TeamMemberTypingEvent {
  memberId: string;
  timestamp: string;
}

export interface DecisionDraftUpdatedEvent {
  challengeId: string;
  draftData: any;
  timestamp: string;
}
