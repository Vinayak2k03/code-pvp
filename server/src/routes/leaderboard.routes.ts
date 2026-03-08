import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const leaderboardRouter = Router();

// GET /api/leaderboard
leaderboardRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = "1", limit = "50" } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = Math.min(parseInt(limit as string, 10), 100);
      const skip = (pageNum - 1) * limitNum;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limitNum,
          orderBy: { rating: "desc" },
          select: {
            id: true,
            username: true,
            rating: true,
            wins: true,
            losses: true,
            draws: true,
            avatarUrl: true,
          },
        }),
        prisma.user.count(),
      ]);

      const leaderboard = users.map((user, index) => ({
        rank: skip + index + 1,
        ...user,
        totalMatches: user.wins + user.losses + user.draws,
        winRate:
          user.wins + user.losses + user.draws > 0
            ? Math.round(
                (user.wins / (user.wins + user.losses + user.draws)) * 1000
              ) / 10
            : 0,
      }));

      res.json({
        status: "success",
        data: {
          leaderboard,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
