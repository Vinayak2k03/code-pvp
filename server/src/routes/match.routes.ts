import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import { getMatchRoomService } from "../socket";

export const matchRouter = Router();

// GET /api/matches — User's match history
matchRouter.get(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { page = "1", limit = "20" } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where = {
        OR: [{ player1Id: userId }, { player2Id: userId }],
        status: "COMPLETED" as const,
      };

      const [matches, total] = await Promise.all([
        prisma.match.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { endedAt: "desc" },
          include: {
            player1: {
              select: { id: true, username: true, rating: true },
            },
            player2: {
              select: { id: true, username: true, rating: true },
            },
            problem: {
              select: { id: true, title: true, slug: true, difficulty: true },
            },
          },
        }),
        prisma.match.count({ where }),
      ]);

      res.json({
        status: "success",
        data: {
          matches: matches.map((m) => ({
            ...m,
            isWinner: m.winnerId === userId,
            opponent:
              m.player1Id === userId ? m.player2 : m.player1,
            ratingDelta:
              m.player1Id === userId
                ? m.player1RatingDelta
                : m.player2RatingDelta,
          })),
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

// GET /api/matches/live — Ongoing matches (for spectators)
matchRouter.get(
  "/live",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const matches = await prisma.match.findMany({
        where: { status: "IN_PROGRESS" },
        include: {
          player1: {
            select: { id: true, username: true, rating: true },
          },
          player2: {
            select: { id: true, username: true, rating: true },
          },
          problem: {
            select: { id: true, title: true, difficulty: true },
          },
        },
        orderBy: { startedAt: "desc" },
      });

      res.json({ status: "success", data: matches });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/matches/:id — Match detail
matchRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const match = await prisma.match.findUnique({
        where: { id: req.params.id },
        include: {
          player1: {
            select: { id: true, username: true, rating: true },
          },
          player2: {
            select: { id: true, username: true, rating: true },
          },
          problem: {
            include: {
              testCases: {
                where: { isHidden: false },
                orderBy: { order: "asc" },
              },
            },
          },
          submissions: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              userId: true,
              language: true,
              verdict: true,
              executionTime: true,
              memoryUsed: true,
              passedTestCases: true,
              totalTestCases: true,
              createdAt: true,
              code: true,
            },
          },
        },
      });

      if (!match) {
        return res
          .status(404)
          .json({ status: "error", message: "Match not found" });
      }

      res.json({ status: "success", data: match });
    } catch (error) {
      next(error);
    }
  }
);
