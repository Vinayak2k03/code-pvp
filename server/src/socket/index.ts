import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { MatchmakingService } from "../services/matchmaking.service";
import { MatchRoomService } from "../services/match-room.service";
import { AuthPayload } from "../middleware/auth";

let matchmaking: MatchmakingService;
let matchRoom: MatchRoomService;

export function getMatchRoomService(): MatchRoomService {
  return matchRoom;
}

export function setupSocketHandlers(io: SocketIOServer): void {
  matchmaking = new MatchmakingService(io);
  matchRoom = new MatchRoomService(io);

  // Start matchmaking loop
  matchmaking.start();

  // Socket auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user as AuthPayload;
    console.log(`🔌 ${user.username} connected (${socket.id})`);

    // Track user's socket
    socket.join(`user:${user.userId}`);

    // ─── Queue Events ─────────────────────────────────────────

    socket.on("queue:join", async (data) => {
      try {
        await matchmaking.addToQueue({
          userId: user.userId,
          username: user.username,
          rating: data.rating || 1200,
          socketId: socket.id,
          joinedAt: Date.now(),
        });
        console.log(`📥 ${user.username} joined queue`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join queue" });
      }
    });

    socket.on("queue:leave", async () => {
      try {
        await matchmaking.removeFromQueue(user.userId);
        socket.emit("queue:left");
        console.log(`📤 ${user.username} left queue`);
      } catch (error) {
        socket.emit("error", { message: "Failed to leave queue" });
      }
    });

    // ─── Match Events ─────────────────────────────────────────

    socket.on("match:join", async (data: { matchId: string }) => {
      try {
        await matchRoom.joinRoom(data.matchId, user.userId, socket.id);
      } catch (error) {
        socket.emit("error", { message: "Failed to join match" });
      }
    });

    socket.on("match:ready", async (data: { matchId: string }) => {
      try {
        await matchRoom.playerReady(data.matchId, user.userId);
      } catch (error) {
        socket.emit("error", { message: "Failed to ready up" });
      }
    });

    // ─── Code Events ──────────────────────────────────────────

    socket.on(
      "code:run",
      async (data: { matchId: string; code: string; language: string }) => {
        try {
          await matchRoom.handleRunCode(
            data.matchId,
            user.userId,
            data.code,
            data.language
          );
        } catch (error) {
          socket.emit("error", { message: "Failed to run code" });
        }
      }
    );

    socket.on(
      "code:submit",
      async (data: { matchId: string; code: string; language: string }) => {
        try {
          await matchRoom.handleSubmission(
            data.matchId,
            user.userId,
            data.code,
            data.language
          );
        } catch (error) {
          console.error("[code:submit] Error:", error);
          socket.emit("error", {
            message:
              error instanceof Error ? error.message : "Failed to submit code",
          });
        }
      }
    );

    // ─── Typing Status ───────────────────────────────────────

    socket.on(
      "typing:status",
      (data: { matchId: string; status: string }) => {
        socket.to(`match:${data.matchId}`).emit("opponent:status", {
          status: data.status || "idle",
          userId: user.userId,
        });
      }
    );

    // ─── Spectator Events ─────────────────────────────────────

    socket.on("spectator:join", (data: { matchId: string }) => {
      matchRoom.joinSpectator(data.matchId, socket);
      socket.emit("spectator:joined", { matchId: data.matchId });
    });

    socket.on("spectator:leave", (data: { matchId: string }) => {
      socket.leave(`spectate:${data.matchId}`);
    });

    // ─── Disconnect ───────────────────────────────────────────

    socket.on("disconnect", async () => {
      console.log(`🔌 ${user.username} disconnected`);
      await matchmaking.removeFromQueue(user.userId);
      await matchRoom.handleDisconnect(user.userId);
    });
  });
}
