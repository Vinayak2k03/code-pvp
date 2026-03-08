import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import { ELO_DEFAULT_RATING } from "../config/constants";

interface SignupInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async signup({ username, email, password }: SignupInput) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      if (existing.email === email) {
        throw new AppError(409, "Email already registered");
      }
      throw new AppError(409, "Username already taken");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        rating: ELO_DEFAULT_RATING,
      },
      select: {
        id: true,
        username: true,
        email: true,
        rating: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user.id, user.username);

    return { user, token };
  }

  static async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = this.generateToken(user.id, user.username);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        rating: true,
        wins: true,
        losses: true,
        draws: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  }

  private static generateToken(userId: string, username: string): string {
    return jwt.sign({ userId, username }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }
}
