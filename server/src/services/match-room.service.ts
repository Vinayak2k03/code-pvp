import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../config/database";
import { redis } from "../config/redis";
import { EloService } from "./elo.service";
import { Judge0Service, ExecutionResult } from "./judge0.service";
import { MATCH_DURATION } from "../config/constants";

interface MatchRoom {
  matchId: string;
  player1: { userId: string; socketId: string; ready: boolean };
  player2: { userId: string; socketId: string; ready: boolean };
  startTime: number | null;
  timer: NodeJS.Timeout | null;
}

const MATCH_ROOMS_KEY = "match:rooms";

export class MatchRoomService {
  private io: SocketIOServer;
  private rooms: Map<string, MatchRoom> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Player joins a match room
   */
  async joinRoom(
    matchId: string,
    userId: string,
    socketId: string
  ): Promise<void> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            difficulty: true,
            tags: true,
            constraints: true,
            sampleInput: true,
            sampleOutput: true,
            timeLimit: true,
            memoryLimit: true,
            starterCode: true,
          },
        },
        player1: { select: { id: true, username: true, rating: true } },
        player2: { select: { id: true, username: true, rating: true } },
      },
    });

    if (!match) return;

    let room = this.rooms.get(matchId);

    if (!room) {
      room = {
        matchId,
        player1: {
          userId: match.player1Id,
          socketId: match.player1Id === userId ? socketId : "",
          ready: false,
        },
        player2: {
          userId: match.player2Id,
          socketId: match.player2Id === userId ? socketId : "",
          ready: false,
        },
        startTime: null,
        timer: null,
      };
      this.rooms.set(matchId, room);
    }

    // Update socket ID for the player
    if (room.player1.userId === userId) {
      room.player1.socketId = socketId;
    } else if (room.player2.userId === userId) {
      room.player2.socketId = socketId;
    }

    // Join socket room
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(`match:${matchId}`);
    }

    // Emit match data to the joining player so the duel page can render
    const opponent = match.player1Id === userId ? match.player2 : match.player1;
    const endTime = match.startedAt
      ? new Date(match.startedAt).getTime() + MATCH_DURATION * 1000
      : null;

    this.io.to(socketId).emit("match:data", {
      matchId: match.id,
      status: match.status,
      started: match.status === "IN_PROGRESS",
      problem: match.problem,
      opponent: { id: opponent.id, username: opponent.username, rating: opponent.rating },
      endTime,
      duration: MATCH_DURATION,
    });
  }

  /**
   * Player signals ready
   */
  async playerReady(matchId: string, userId: string): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room) return;

    if (room.player1.userId === userId) room.player1.ready = true;
    if (room.player2.userId === userId) room.player2.ready = true;

    // Notify room
    this.io.to(`match:${matchId}`).emit("match:player-ready", { userId });

    // If both ready, start match
    if (room.player1.ready && room.player2.ready) {
      await this.startMatch(matchId);
    }
  }

  /**
   * Start the match timer
   */
  private async startMatch(matchId: string): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room || room.startTime) return;

    room.startTime = Date.now();

    await prisma.match.update({
      where: { id: matchId },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });

    const endTime = room.startTime + MATCH_DURATION * 1000;

    this.io.to(`match:${matchId}`).emit("match:start", {
      matchId,
      startTime: room.startTime,
      endTime,
      duration: MATCH_DURATION,
    });

    // Set timer for match end
    room.timer = setTimeout(async () => {
      await this.endMatchByTimeout(matchId);
    }, MATCH_DURATION * 1000);
  }

  /**
   * Handle code submission
   */
  async handleSubmission(
    matchId: string,
    userId: string,
    code: string,
    language: string
  ): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room || !room.startTime) return;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        problem: {
          include: { testCases: { orderBy: { order: "asc" } } },
        },
      },
    });

    if (!match || match.status !== "IN_PROGRESS") return;

    // Notify opponent about submission
    const opponentSocketId =
      room.player1.userId === userId
        ? room.player2.socketId
        : room.player1.socketId;

    this.io.to(opponentSocketId).emit("opponent:status", {
      status: "submitted",
      userId,
    });

    // Spectators too
    this.io.to(`spectate:${matchId}`).emit("spectator:update", {
      type: "submission",
      userId,
      language,
    });

    // Execute code against all test cases
    const result = await Judge0Service.submitBatch(
      code,
      language,
      match.problem.testCases.map((tc) => ({
        input: tc.input,
        output: tc.output,
      })),
      match.problem.timeLimit / 1000,
      match.problem.memoryLimit * 1000
    );

    // Save submission
    const submission = await prisma.submission.create({
      data: {
        matchId,
        userId,
        code,
        language,
        verdict: result.verdict,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        passedTestCases: result.passedTestCases,
        totalTestCases: result.totalTestCases,
        judge0Tokens: result.tokens,
      },
    });

    // Send result to submitter
    const submitterSocketId =
      room.player1.userId === userId
        ? room.player1.socketId
        : room.player2.socketId;

    this.io.to(submitterSocketId).emit("code:result", {
      submissionId: submission.id,
      verdict: result.verdict,
      passedTestCases: result.passedTestCases,
      totalTestCases: result.totalTestCases,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      error: result.error,
    });

    // Notify opponent
    this.io.to(opponentSocketId).emit("opponent:status", {
      status: result.verdict === "ACCEPTED" ? "solved" : "wrong-answer",
      userId,
    });

    // If accepted, end match
    if (result.verdict === "ACCEPTED") {
      await this.endMatch(matchId, userId);
    }
  }

  /**
   * Handle "Run Code" (sample test cases only)
   */
  async handleRunCode(
    matchId: string,
    userId: string,
    code: string,
    language: string
  ): Promise<void> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { problem: true },
    });

    if (!match) return;

    const result = await Judge0Service.runCode(
      code,
      language,
      match.problem.sampleInput
    );

    const room = this.rooms.get(matchId);
    if (!room) return;

    const socketId =
      room.player1.userId === userId
        ? room.player1.socketId
        : room.player2.socketId;

    this.io.to(socketId).emit("code:run-result", {
      stdout: result.stdout,
      stderr: result.stderr,
      time: result.time,
      memory: result.memory,
      expectedOutput: match.problem.sampleOutput,
    });

    // Notify opponent
    const opponentSocketId =
      room.player1.userId === userId
        ? room.player2.socketId
        : room.player1.socketId;

    this.io.to(opponentSocketId).emit("opponent:status", {
      status: "running",
      userId,
    });
  }

  /**
   * End match with a winner
   */
  private async endMatch(
    matchId: string,
    winnerId: string
  ): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room) return;

    // Clear timer
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match || match.status === "COMPLETED") return;

    const isPlayer1Winner = winnerId === match.player1Id;
    const scorePlayer1 = isPlayer1Winner ? 1 : 0;

    const { newRatingA, newRatingB, deltaA, deltaB } =
      EloService.calculateNewRatings(
        match.player1Rating,
        match.player2Rating,
        scorePlayer1
      );

    const duration = room.startTime
      ? Math.round((Date.now() - room.startTime) / 1000)
      : 0;

    // Update match
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "COMPLETED",
        result: isPlayer1Winner ? "PLAYER1_WIN" : "PLAYER2_WIN",
        winnerId,
        player1RatingDelta: deltaA,
        player2RatingDelta: deltaB,
        endedAt: new Date(),
        duration,
      },
    });

    // Update player ratings
    await prisma.user.update({
      where: { id: match.player1Id },
      data: {
        rating: newRatingA,
        wins: isPlayer1Winner ? { increment: 1 } : undefined,
        losses: !isPlayer1Winner ? { increment: 1 } : undefined,
      },
    });

    await prisma.user.update({
      where: { id: match.player2Id },
      data: {
        rating: newRatingB,
        wins: !isPlayer1Winner ? { increment: 1 } : undefined,
        losses: isPlayer1Winner ? { increment: 1 } : undefined,
      },
    });

    // Emit match end to each player with their own ratingDelta
    this.io.to(room.player1.socketId).emit("match:end", {
      matchId,
      winnerId,
      duration,
      ratingDelta: deltaA,
      newRating: newRatingA,
    });

    this.io.to(room.player2.socketId).emit("match:end", {
      matchId,
      winnerId,
      duration,
      ratingDelta: deltaB,
      newRating: newRatingB,
    });

    // Emit to spectators
    this.io.to(`spectate:${matchId}`).emit("match:end", {
      matchId,
      winnerId,
      duration,
    });

    // Cleanup
    this.rooms.delete(matchId);
  }

  /**
   * End match by timeout (draw or based on progress)
   */
  private async endMatchByTimeout(matchId: string): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room) return;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match || match.status === "COMPLETED") return;

    // Check submissions — player with more passed test cases wins
    const submissions = await prisma.submission.findMany({
      where: { matchId },
      orderBy: { passedTestCases: "desc" },
    });

    let winnerId: string | null = null;
    let result: "PLAYER1_WIN" | "PLAYER2_WIN" | "DRAW" = "DRAW";
    let scorePlayer1 = 0.5;

    if (submissions.length > 0) {
      const p1Best = submissions.find((s) => s.userId === match.player1Id);
      const p2Best = submissions.find((s) => s.userId === match.player2Id);

      const p1Score = p1Best?.passedTestCases ?? 0;
      const p2Score = p2Best?.passedTestCases ?? 0;

      if (p1Score > p2Score) {
        winnerId = match.player1Id;
        result = "PLAYER1_WIN";
        scorePlayer1 = 1;
      } else if (p2Score > p1Score) {
        winnerId = match.player2Id;
        result = "PLAYER2_WIN";
        scorePlayer1 = 0;
      }
    }

    const { newRatingA, newRatingB, deltaA, deltaB } =
      EloService.calculateNewRatings(
        match.player1Rating,
        match.player2Rating,
        scorePlayer1
      );

    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "COMPLETED",
        result,
        winnerId,
        player1RatingDelta: deltaA,
        player2RatingDelta: deltaB,
        endedAt: new Date(),
        duration: MATCH_DURATION,
      },
    });

    // Update ratings
    await prisma.user.update({
      where: { id: match.player1Id },
      data: {
        rating: newRatingA,
        wins: result === "PLAYER1_WIN" ? { increment: 1 } : undefined,
        losses: result === "PLAYER2_WIN" ? { increment: 1 } : undefined,
        draws: result === "DRAW" ? { increment: 1 } : undefined,
      },
    });

    await prisma.user.update({
      where: { id: match.player2Id },
      data: {
        rating: newRatingB,
        wins: result === "PLAYER2_WIN" ? { increment: 1 } : undefined,
        losses: result === "PLAYER1_WIN" ? { increment: 1 } : undefined,
        draws: result === "DRAW" ? { increment: 1 } : undefined,
      },
    });

    this.io.to(room.player1.socketId).emit("match:end", {
      matchId,
      winnerId,
      result,
      timeout: true,
      duration: MATCH_DURATION,
      ratingDelta: deltaA,
      newRating: newRatingA,
    });

    this.io.to(room.player2.socketId).emit("match:end", {
      matchId,
      winnerId,
      result,
      timeout: true,
      duration: MATCH_DURATION,
      ratingDelta: deltaB,
      newRating: newRatingB,
    });

    this.rooms.delete(matchId);
  }

  /**
   * Handle spectator joining
   */
  joinSpectator(matchId: string, socket: Socket): void {
    socket.join(`spectate:${matchId}`);
  }

  /**
   * Handle player disconnect
   */
  async handleDisconnect(userId: string): Promise<void> {
    // Find if the user is in any active room
    for (const [matchId, room] of this.rooms) {
      if (
        room.player1.userId === userId ||
        room.player2.userId === userId
      ) {
        const opponentId =
          room.player1.userId === userId
            ? room.player2.userId
            : room.player1.userId;

        // If match hasn't started, cancel it
        if (!room.startTime) {
          await prisma.match.update({
            where: { id: matchId },
            data: { status: "CANCELLED", result: "CANCELLED" },
          });
          this.io.to(`match:${matchId}`).emit("match:cancelled", {
            reason: "opponent_disconnected",
          });
          this.rooms.delete(matchId);
        } else {
          // Give opponent the win
          await this.endMatch(matchId, opponentId);
        }
        break;
      }
    }
  }

  /**
   * Get active match rooms (for spectator list)
   */
  getActiveRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}
