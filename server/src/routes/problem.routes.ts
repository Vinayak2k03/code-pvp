import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { authenticate, optionalAuth } from "../middleware/auth";

export const problemRouter = Router();

// GET /api/problems
problemRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = "1",
        limit = "20",
        difficulty,
        tag,
        search,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (difficulty) {
        where.difficulty = (difficulty as string).toUpperCase();
      }

      if (tag) {
        where.tags = { has: tag as string };
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: "insensitive" } },
          { tags: { has: (search as string).toLowerCase() } },
        ];
      }

      const [problems, total] = await Promise.all([
        prisma.problem.findMany({
          where,
          skip,
          take: limitNum,
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            tags: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.problem.count({ where }),
      ]);

      res.json({
        status: "success",
        data: {
          problems,
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

// GET /api/problems/:id
problemRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await prisma.problem.findFirst({
        where: {
          OR: [{ id: req.params.id }, { slug: req.params.id }],
        },
        include: {
          testCases: {
            where: { isHidden: false },
            orderBy: { order: "asc" },
            select: {
              id: true,
              input: true,
              output: true,
              order: true,
            },
          },
        },
      });

      if (!problem) {
        return res
          .status(404)
          .json({ status: "error", message: "Problem not found" });
      }

      res.json({ status: "success", data: problem });
    } catch (error) {
      next(error);
    }
  }
);
