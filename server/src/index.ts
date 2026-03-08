import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { problemRouter } from "./routes/problem.routes";
import { matchRouter } from "./routes/match.routes";
import { leaderboardRouter } from "./routes/leaderboard.routes";
import { userRouter } from "./routes/user.routes";
import { submissionRouter } from "./routes/submission.routes";
import { setupSocketHandlers } from "./socket";
import { errorHandler } from "./middleware/error-handler";

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Middleware ──────────────────────────────────────────────────

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// ─── Health Check ───────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ─────────────────────────────────────────────────

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/problems", problemRouter);
app.use("/api/matches", matchRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/submissions", submissionRouter);

// ─── Error Handler ──────────────────────────────────────────────

app.use(errorHandler);

// ─── Socket.IO ──────────────────────────────────────────────────

setupSocketHandlers(io);

// ─── Start Server ───────────────────────────────────────────────

server.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📡 WebSocket ready`);
});

export { io };
