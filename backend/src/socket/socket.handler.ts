import { Server as SocketIOServer } from 'socket.io';

export const initializeSocket = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    // Join game room
    socket.on('join:game', (gameId: string) => {
      socket.join(`game:${gameId}`);
      console.log(`Client ${socket.id} joined game: ${gameId}`);
    });

    // Join team room
    socket.on('join:team', (teamId: string) => {
      socket.join(`team:${teamId}`);
      console.log(`Client ${socket.id} joined team: ${teamId}`);
    });

    // Join GM room
    socket.on('join:gm', (gameId: string) => {
      socket.join(`gm:${gameId}`);
      console.log(`Game Master ${socket.id} monitoring game: ${gameId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });

  return io;
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

export default { initializeSocket, emitToGame, emitToTeam, emitToGM };
