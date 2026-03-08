"use client";

import { useEffect, useCallback, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";

/**
 * Hook to use the socket connection.
 * Uses useSyncExternalStore to guarantee the component re-renders
 * as soon as the socket reference becomes available or the socket
 * connects/disconnects.
 */
export function useSocket() {
  // Re-derive socket on every render so we never stale-close over null
  const socket = getSocket();
  const [connected, setConnected] = useState(socket?.connected ?? false);

  useEffect(() => {
    if (!socket) return;

    // Immediately sync in case we missed an event between render and effect
    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return { socket, connected };
}

/**
 * Hook for matchmaking queue
 */
export function useMatchmaking() {
  const { socket } = useSocket();
  const [inQueue, setInQueue] = useState(false);
  const [queueStatus, setQueueStatus] = useState<{
    position: number;
    total: number;
    estimatedWait: number;
  } | null>(null);
  const [matchFound, setMatchFound] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;

    const onQueueStatus = (data: any) => setQueueStatus(data);
    const onQueueLeft = () => {
      setInQueue(false);
      setQueueStatus(null);
    };
    const onMatchFound = (data: any) => {
      setMatchFound(data);
      setInQueue(false);
      setQueueStatus(null);
    };

    socket.on("queue:status", onQueueStatus);
    socket.on("queue:left", onQueueLeft);
    socket.on("match:found", onMatchFound);

    return () => {
      socket.off("queue:status", onQueueStatus);
      socket.off("queue:left", onQueueLeft);
      socket.off("match:found", onMatchFound);
    };
  }, [socket]);

  const joinQueue = useCallback(
    (rating: number) => {
      if (socket) {
        socket.emit("queue:join", { rating });
        setInQueue(true);
      }
    },
    [socket]
  );

  const leaveQueue = useCallback(() => {
    if (socket) {
      socket.emit("queue:leave");
      setInQueue(false);
      setQueueStatus(null);
    }
  }, [socket]);

  return { inQueue, queueStatus, matchFound, joinQueue, leaveQueue };
}

/**
 * Hook for match room
 */
export function useMatchRoom(matchId: string) {
  const { socket, connected } = useSocket();

  // Full match data: problem + opponent, set from match:found OR match:data
  const [matchData, setMatchData] = useState<any>(null);
  // Whether the match clock is running
  const [matchStarted, setMatchStarted] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  // Live opponent status
  const [opponentStatus, setOpponentStatus] = useState<string>("idle");
  // Latest submission result (code:result)
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  // Latest run result (code:run-result)
  const [runResult, setRunResult] = useState<any>(null);
  // Own submissions list
  const [submissions, setSubmissions] = useState<any[]>([]);
  // Match end
  const [matchEnded, setMatchEnded] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  // Match cancelled (opponent disconnected, etc.)
  const [matchCancelled, setMatchCancelled] = useState<string | null>(null);
  // Track whether we successfully joined
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!socket || !matchId) return;

    // Register all listeners BEFORE emitting join so we never miss the reply.

    const onMatchData = (data: any) => {
      console.log("[useMatchRoom] match:data received", data.matchId);
      setMatchData(data);
      setJoined(true);
      if (data.started && data.endTime) {
        setMatchStarted(true);
        setEndTime(data.endTime);
      }
    };

    // Also handle match:found (if still buffered from lobby)
    const onMatchFound = (data: any) => {
      if (data.matchId === matchId) {
        console.log("[useMatchRoom] match:found received", data.matchId);
        setMatchData(data);
        setJoined(true);
      }
    };

    const onPlayerReady = (_data: any) => {
      // Could track individual readiness if needed
    };

    const onMatchStart = (data: any) => {
      console.log("[useMatchRoom] match:start received");
      setMatchStarted(true);
      setEndTime(data.endTime ?? (Date.now() + data.duration * 1000));
      // Preserve existing matchData, just update status
      setMatchData((prev: any) => prev ? { ...prev, started: true, endTime: data.endTime } : prev);
    };

    const onOpponentStatus = (data: any) => {
      setOpponentStatus(data.status);
    };

    const onCodeResult = (data: any) => {
      setSubmissionResult(data);
      setSubmissions((prev) => [data, ...prev]);
    };

    const onRunResult = (data: any) => {
      setRunResult(data);
    };

    const onMatchEnd = (data: any) => {
      setMatchEnded(true);
      setMatchResult(data);
    };

    const onMatchCancelled = (data: any) => {
      setMatchCancelled(data.reason || "Match cancelled");
    };

    const onError = (data: any) => {
      console.error("[useMatchRoom] server error:", data.message);
    };

    socket.on("match:data", onMatchData);
    socket.on("match:found", onMatchFound);
    socket.on("match:player-ready", onPlayerReady);
    socket.on("match:start", onMatchStart);
    socket.on("opponent:status", onOpponentStatus);
    socket.on("code:result", onCodeResult);
    socket.on("code:run-result", onRunResult);
    socket.on("match:end", onMatchEnd);
    socket.on("match:cancelled", onMatchCancelled);
    socket.on("error", onError);

    // Now emit the join — listeners are already registered
    console.log("[useMatchRoom] emitting match:join", matchId, "socket:", socket.id);
    socket.emit("match:join", { matchId });

    return () => {
      socket.off("match:data", onMatchData);
      socket.off("match:found", onMatchFound);
      socket.off("match:player-ready", onPlayerReady);
      socket.off("match:start", onMatchStart);
      socket.off("opponent:status", onOpponentStatus);
      socket.off("code:result", onCodeResult);
      socket.off("code:run-result", onRunResult);
      socket.off("match:end", onMatchEnd);
      socket.off("match:cancelled", onMatchCancelled);
      socket.off("error", onError);
    };
  }, [socket, matchId]);

  // Safety net: if socket reconnects or we never got data, re-join.
  // This handles the case where the initial emit was lost.
  useEffect(() => {
    if (!socket || !matchId || joined) return;
    if (!connected) return;

    // Socket just connected/reconnected but we don't have match data yet — re-join
    console.log("[useMatchRoom] safety-net re-join", matchId);
    socket.emit("match:join", { matchId });
  }, [socket, matchId, connected, joined]);

  const ready = useCallback(() => {
    if (socket) socket.emit("match:ready", { matchId });
  }, [socket, matchId]);

  const runCode = useCallback(
    (code: string, language: string) => {
      if (socket) {
        setRunResult(null);
        socket.emit("code:run", { matchId, code, language });
      }
    },
    [socket, matchId]
  );

  const submitCode = useCallback(
    (code: string, language: string) => {
      if (socket) {
        setSubmissionResult(null);
        socket.emit("code:submit", { matchId, code, language });
      }
    },
    [socket, matchId]
  );

  const sendTypingStatus = useCallback(
    (status: string) => {
      if (socket) socket.emit("typing:status", { matchId, status });
    },
    [socket, matchId]
  );

  return {
    matchData,
    matchStarted,
    endTime,
    opponentStatus,
    submissionResult,
    runResult,
    submissions,
    matchEnded,
    matchResult,
    matchCancelled,
    ready,
    runCode,
    submitCode,
    sendTypingStatus,
  };
}
