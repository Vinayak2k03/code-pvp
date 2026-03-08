import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";

export const userRouter = Router();

// GET /api/users/:id
userRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          username: true,
          rating: true,
          wins: true,
          losses: true,
          draws: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }

      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id/stats
userRouter.get(
  "/:id/stats",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          rating: true,
          wins: true,
          losses: true,
          draws: true,
        },
      });

      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }

      const totalMatches = user.wins + user.losses + user.draws;
      const winRate = totalMatches > 0 ? (user.wins / totalMatches) * 100 : 0;

      // Get rank
      const rank = await prisma.user.count({
        where: { rating: { gt: user.rating } },
      });

      // Recent matches
      const recentMatches = await prisma.match.findMany({
        where: {
          OR: [{ player1Id: userId }, { player2Id: userId }],
          status: "COMPLETED",
        },
        orderBy: { endedAt: "desc" },
        take: 10,
        include: {
          player1: { select: { id: true, username: true, rating: true } },
          player2: { select: { id: true, username: true, rating: true } },
          problem: { select: { title: true, difficulty: true } },
        },
      });

      // Rating history (last 20 matches)
      const ratingHistory = await prisma.match.findMany({
        where: {
          OR: [{ player1Id: userId }, { player2Id: userId }],
          status: "COMPLETED",
        },
        orderBy: { endedAt: "asc" },
        take: 20,
        select: {
          id: true,
          player1Id: true,
          player1Rating: true,
          player2Rating: true,
          player1RatingDelta: true,
          player2RatingDelta: true,
          endedAt: true,
        },
      });

      res.json({
        status: "success",
        data: {
          ...user,
          totalMatches,
          winRate: Math.round(winRate * 10) / 10,
          rank: rank + 1,
          recentMatches,
          ratingHistory: ratingHistory.map((m) => ({
            matchId: m.id,
            rating:
              m.player1Id === userId
                ? m.player1Rating + (m.player1RatingDelta || 0)
                : m.player2Rating + (m.player2RatingDelta || 0),
            delta:
              m.player1Id === userId
                ? m.player1RatingDelta
                : m.player2RatingDelta,
            date: m.endedAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
