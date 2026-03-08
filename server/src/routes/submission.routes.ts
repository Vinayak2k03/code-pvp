import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";

export const submissionRouter = Router();

// GET /api/submissions/:matchId
submissionRouter.get(
  "/:matchId",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submissions = await prisma.submission.findMany({
        where: { matchId: req.params.matchId },
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
          code: true,
          createdAt: true,
        },
      });

      res.json({ status: "success", data: submissions });
    } catch (error) {
      next(error);
    }
  }
);
