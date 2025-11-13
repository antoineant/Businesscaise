import { Server as SocketIOServer, Socket } from 'socket.io';

// Store socket server instance for use in other modules
let socketServer: SocketIOServer | null = null;

export const initializeSocket = (io: SocketIOServer) => {
  socketServer = io;

  io.on('connection', (socket: Socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    // Join game room (for all participants)
    socket.on('join:game', (gameId: string) => {
      socket.join(`game:${gameId}`);
      socket.data.gameId = gameId;
      console.log(`Client ${socket.id} joined game: ${gameId}`);

      // Notify others in game about new participant
      socket.to(`game:${gameId}`).emit('participant:joined', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Join team room (for team members)
    socket.on('join:team', (teamId: string, teamData?: any) => {
      socket.join(`team:${teamId}`);
      socket.data.teamId = teamId;
      console.log(`Client ${socket.id} joined team: ${teamId}`);

      // Notify team members
      socket.to(`team:${teamId}`).emit('team:member_joined', {
        socketId: socket.id,
        teamData,
        timestamp: new Date().toISOString(),
      });
    });

    // Join GM room (for Game Master dashboard)
    socket.on('join:gm', (gameId: string) => {
      socket.join(`gm:${gameId}`);
      socket.data.isGM = true;
      socket.data.gameId = gameId;
      console.log(`Game Master ${socket.id} monitoring game: ${gameId}`);
    });

    // Leave rooms
    socket.on('leave:game', (gameId: string) => {
      socket.leave(`game:${gameId}`);
      console.log(`Client ${socket.id} left game: ${gameId}`);
    });

    socket.on('leave:team', (teamId: string) => {
      socket.leave(`team:${teamId}`);
      console.log(`Client ${socket.id} left team: ${teamId}`);
    });

    // Team activity updates
    socket.on('team:typing', (data: { teamId: string; memberId: string }) => {
      socket.to(`team:${data.teamId}`).emit('team:member_typing', {
        memberId: data.memberId,
        timestamp: new Date().toISOString(),
      });
    });

    // Real-time decision collaboration
    socket.on('decision:draft', (data: { teamId: string; challengeId: string; draftData: any }) => {
      socket.to(`team:${data.teamId}`).emit('decision:draft_updated', {
        challengeId: data.challengeId,
        draftData: data.draftData,
        timestamp: new Date().toISOString(),
      });
    });

    // Request current game state
    socket.on('request:game_state', (gameId: string, callback) => {
      // This would typically fetch from database, for now just acknowledge
      if (callback && typeof callback === 'function') {
        callback({ status: 'ok', gameId });
      }
    });

    // Heartbeat for connection monitoring
    socket.on('ping', (callback) => {
      if (callback && typeof callback === 'function') {
        callback({ timestamp: new Date().toISOString() });
      }
    });

    // Disconnect
    socket.on('disconnect', (reason) => {
      console.log(`✗ Client disconnected: ${socket.id} (${reason})`);

      // Notify relevant rooms
      if (socket.data.gameId) {
        socket.to(`game:${socket.data.gameId}`).emit('participant:left', {
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      }

      if (socket.data.teamId) {
        socket.to(`team:${socket.data.teamId}`).emit('team:member_left', {
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

/**
 * Get socket server instance
 */
export const getSocketServer = (): SocketIOServer => {
  if (!socketServer) {
    throw new Error('Socket server not initialized');
  }
  return socketServer;
};

/**
 * Emit events to specific rooms
 */

// Notify all teams in a game
export const emitToGame = (io: SocketIOServer, gameId: string, event: string, data: any) => {
  io.to(`game:${gameId}`).emit(event, data);
};

// Notify specific team
export const emitToTeam = (io: SocketIOServer, teamId: string, event: string, data: any) => {
  io.to(`team:${teamId}`).emit(event, data);
};

// Notify Game Master
export const emitToGM = (io: SocketIOServer, gameId: string, event: string, data: any) => {
  io.to(`gm:${gameId}`).emit(event, data);
};

/**
 * Game Event Emitters (for use in controllers)
 */

// Game status changed
export const notifyGameStatusChanged = (gameId: string, status: string, data?: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'game:status_changed', {
    status,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Session unlocked
export const notifySessionUnlocked = (gameId: string, sessionData: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'session:unlocked', {
    session: sessionData,
    timestamp: new Date().toISOString(),
  });
};

// Session completed
export const notifySessionCompleted = (gameId: string, sessionData: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'session:completed', {
    session: sessionData,
    timestamp: new Date().toISOString(),
  });
};

// Submission received (notify GM)
export const notifySubmissionReceived = (gameId: string, submissionData: any) => {
  if (!socketServer) return;
  emitToGM(socketServer, gameId, 'submission:received', {
    submission: submissionData,
    timestamp: new Date().toISOString(),
  });
};

// Submission scored (notify team)
export const notifySubmissionScored = (teamId: string, scoreData: any) => {
  if (!socketServer) return;
  emitToTeam(socketServer, teamId, 'submission:scored', {
    score: scoreData,
    timestamp: new Date().toISOString(),
  });
};

// Metrics updated (notify team)
export const notifyMetricsUpdated = (teamId: string, metricsData: any) => {
  if (!socketServer) return;
  emitToTeam(socketServer, teamId, 'metrics:updated', {
    metrics: metricsData,
    timestamp: new Date().toISOString(),
  });
};

// Leaderboard updated (notify all teams in game)
export const notifyLeaderboardUpdated = (gameId: string, leaderboardData: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'leaderboard:updated', {
    leaderboard: leaderboardData,
    timestamp: new Date().toISOString(),
  });
};

// Narrative/Event injected by GM
export const notifyEventInjected = (gameId: string, eventData: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'event:injected', {
    event: eventData,
    timestamp: new Date().toISOString(),
  });
};

// Deadline extended
export const notifyDeadlineExtended = (gameId: string, deadlineData: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'deadline:extended', {
    deadline: deadlineData,
    timestamp: new Date().toISOString(),
  });
};

// Team joined game
export const notifyTeamJoined = (gameId: string, teamData: any) => {
  if (!socketServer) return;
  emitToGM(socketServer, gameId, 'team:joined', {
    team: teamData,
    timestamp: new Date().toISOString(),
  });
};

// Narrative created (notify all teams in game)
export const notifyNarrativeCreated = (gameId: string, narrativeData: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'narrative:created', {
    narrative: narrativeData,
    timestamp: new Date().toISOString(),
  });
};

// Narrative updated (notify all teams in game)
export const notifyNarrativeUpdated = (gameId: string, narrativeData: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'narrative:updated', {
    narrative: narrativeData,
    timestamp: new Date().toISOString(),
  });
};

// Narrative deleted (notify all teams in game)
export const notifyNarrativeDeleted = (gameId: string, narrativeId: string) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'narrative:deleted', {
    narrativeId,
    timestamp: new Date().toISOString(),
  });
};

// GM Event created (notify all teams in game)
export const notifyGMEventCreated = (gameId: string, eventData: any, narrativeData?: any) => {
  if (!socketServer) return;
  emitToGame(socketServer, gameId, 'event:created', {
    event: eventData,
    narrative: narrativeData,
    timestamp: new Date().toISOString(),
  });
};

export default {
  initializeSocket,
  getSocketServer,
  emitToGame,
  emitToTeam,
  emitToGM,
  notifyGameStatusChanged,
  notifySessionUnlocked,
  notifySessionCompleted,
  notifySubmissionReceived,
  notifySubmissionScored,
  notifyMetricsUpdated,
  notifyLeaderboardUpdated,
  notifyEventInjected,
  notifyDeadlineExtended,
  notifyTeamJoined,
  notifyNarrativeCreated,
  notifyNarrativeUpdated,
  notifyNarrativeDeleted,
  notifyGMEventCreated,
};
