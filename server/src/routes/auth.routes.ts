import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";

export const authRouter = Router();

const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/signup
authRouter.post(
  "/signup",
  validate(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
authRouter.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.login(req.body);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
authRouter.get(
  "/me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  }
);
