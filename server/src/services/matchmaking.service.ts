import { Server as SocketIOServer } from "socket.io";
import { redis } from "../config/redis";
import { prisma } from "../config/database";
import {
  MATCHMAKING_INTERVAL,
  MATCHMAKING_RATING_RANGE,
  MATCHMAKING_RATING_EXPAND,
  MATCHMAKING_MAX_RANGE,
  MATCH_DURATION,
} from "../config/constants";

interface QueueEntry {
  userId: string;
  username: string;
  rating: number;
  socketId: string;
  joinedAt: number;
}

const QUEUE_KEY = "matchmaking:queue";
const QUEUE_DATA_KEY = "matchmaking:data";

export class MatchmakingService {
  private io: SocketIOServer;
  private interval: NodeJS.Timeout | null = null;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Start the matchmaking loop
   */
  start() {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      try {
        await this.processQueue();
      } catch (error) {
        console.error("Matchmaking error:", error);
      }
    }, MATCHMAKING_INTERVAL);

    console.log("🎮 Matchmaking service started");
  }

  /**
   * Stop the matchmaking loop
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Add player to matchmaking queue
   */
  async addToQueue(entry: QueueEntry): Promise<void> {
    // Add to sorted set (score = rating for range queries)
    await redis.zadd(QUEUE_KEY, entry.rating, entry.userId);
    // Store full data
    await redis.hset(QUEUE_DATA_KEY, entry.userId, JSON.stringify(entry));

    await this.broadcastQueueStatus();
  }

  /**
   * Remove player from matchmaking queue
   */
  async removeFromQueue(userId: string, emitUpdate = true): Promise<void> {
    await redis.zrem(QUEUE_KEY, userId);
    await redis.hdel(QUEUE_DATA_KEY, userId);

    if (emitUpdate) {
      await this.broadcastQueueStatus();
    }
  }

  /**
   * Process the matchmaking queue
   * Finds pairs of players with similar ratings
   */
  private async processQueue(): Promise<void> {
    const queueSize = await redis.zcard(QUEUE_KEY);
    if (queueSize < 2) return;

    // Get all players sorted by rating
    const playerIds = await redis.zrange(QUEUE_KEY, 0, -1);
    const players: QueueEntry[] = [];

    for (const userId of playerIds) {
      const dataStr = await redis.hget(QUEUE_DATA_KEY, userId);
      if (dataStr) {
        players.push(JSON.parse(dataStr));
      }
    }

    const matched = new Set<string>();

    for (let i = 0; i < players.length; i++) {
      if (matched.has(players[i].userId)) continue;

      const player = players[i];
      const waitTime = (Date.now() - player.joinedAt) / 1000;

      // Expand range based on wait time
      const expandedRange = Math.min(
        MATCHMAKING_MAX_RANGE,
        MATCHMAKING_RATING_RANGE +
          Math.floor(waitTime / (MATCHMAKING_INTERVAL / 1000)) *
            MATCHMAKING_RATING_EXPAND
      );

      for (let j = i + 1; j < players.length; j++) {
        if (matched.has(players[j].userId)) continue;

        const opponent = players[j];
        const opponentWaitTime = (Date.now() - opponent.joinedAt) / 1000;
        const ratingDiff = Math.abs(player.rating - opponent.rating);
        const forceMatch = waitTime >= 15 && opponentWaitTime >= 15;

        if (ratingDiff <= expandedRange || forceMatch) {
          // Match found!
          matched.add(player.userId);
          matched.add(opponent.userId);

          await this.createMatch(player, opponent);
          break;
        }
      }
    }
  }

  /**
   * Create a match between two players
   */
  private async createMatch(
    player1: QueueEntry,
    player2: QueueEntry
  ): Promise<void> {
    // Remove both from queue
    await this.removeFromQueue(player1.userId, false);
    await this.removeFromQueue(player2.userId, false);
    await this.broadcastQueueStatus();

    // Pick a random problem appropriate for their rating
    const difficulty = this.getDifficultyForRating(
      (player1.rating + player2.rating) / 2
    );

    const problems = await prisma.problem.findMany({
      where: { difficulty },
    });

    if (problems.length === 0) {
      // Fallback: get any problem
      const allProblems = await prisma.problem.findMany();
      if (allProblems.length === 0) {
        console.error("No problems in database!");
        return;
      }
      problems.push(...allProblems);
    }

    const problem = problems[Math.floor(Math.random() * problems.length)];

    // Create match in database
    const match = await prisma.match.create({
      data: {
        player1Id: player1.userId,
        player2Id: player2.userId,
        problemId: problem.id,
        player1Rating: player1.rating,
        player2Rating: player2.rating,
        status: "WAITING",
      },
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
      },
    });

    const matchData = {
      matchId: match.id,
      problem: match.problem,
      duration: MATCH_DURATION,
    };

    // Emit to both players
    this.io.to(`user:${player1.userId}`).emit("match:found", {
      ...matchData,
      opponent: {
        id: player2.userId,
        username: player2.username,
        rating: player2.rating,
      },
    });

    this.io.to(`user:${player2.userId}`).emit("match:found", {
      ...matchData,
      opponent: {
        id: player1.userId,
        username: player1.username,
        rating: player1.rating,
      },
    });

    console.log(
      `🎯 Match created: ${player1.username} (${player1.rating}) vs ${player2.username} (${player2.rating})`
    );
  }

  /**
   * Determine appropriate difficulty based on average rating
   */
  private getDifficultyForRating(
    avgRating: number
  ): "EASY" | "MEDIUM" | "HARD" {
    if (avgRating < 1400) return "EASY";
    if (avgRating < 1800) return "MEDIUM";
    return "HARD";
  }

  /**
   * Emit current queue position/size to every queued user
   */
  private async broadcastQueueStatus(): Promise<void> {
    const userIds = await redis.zrange(QUEUE_KEY, 0, -1);
    const total = userIds.length;
    const estimatedWait = Math.max(5, total * 3);

    for (let i = 0; i < userIds.length; i++) {
      this.io.to(`user:${userIds[i]}`).emit("queue:status", {
        position: i + 1,
        total,
        estimatedWait,
      });
    }
  }
}
