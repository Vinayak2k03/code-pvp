"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingDelta } from "@/components/rating-badge";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Swords,
  Trophy,
  Minus,
  X,
} from "lucide-react";

interface MatchEntry {
  id: string;
  status: string;
  result: string | null;
  createdAt: string;
  problem: { title: string; difficulty: string };
  playerOne: { id: string; username: string };
  playerTwo: { id: string; username: string };
  ratingDelta?: number;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 15;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getMatches(page, perPage);
        const data = res?.data || res;
        setMatches(data.matches || []);
        setTotalPages(data.pagination?.totalPages || Math.ceil((data.total || 0) / perPage));
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, user]);

  if (authLoading || !user) return null;

  const getResultForUser = (match: MatchEntry) => {
    if (match.status !== "COMPLETED") return "in-progress";
    if ((match as any).isWinner) return "win";
    if (match.result === "DRAW") return "draw";
    if (match.result === "PLAYER1_WIN" && match.playerOne?.id === user.id) return "win";
    if (match.result === "PLAYER2_WIN" && match.playerTwo?.id === user.id) return "win";
    return "loss";
  };

  const getOpponent = (match: MatchEntry) =>
    (match as any).opponent || (match.playerOne?.id === user.id ? match.playerTwo : match.playerOne);

  const resultIcon = (r: string) => {
    if (r === "win") return <Trophy className="h-3.5 w-3.5 text-green-500" />;
    if (r === "loss") return <X className="h-3.5 w-3.5 text-red-500" />;
    if (r === "draw") return <Minus className="h-3.5 w-3.5 text-yellow-500" />;
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />;
  };

  const resultLabel = (r: string) => {
    if (r === "win") return "Won";
    if (r === "loss") return "Lost";
    if (r === "draw") return "Draw";
    return "In Progress";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Match History</h1>
        <p className="text-muted-foreground text-sm">Your past battles</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Swords className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No matches yet. Head to the lobby to start your first battle!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => {
            const result = getResultForUser(match);
            const opponent = getOpponent(match);
            return (
              <Card
                key={match.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/duel/${match.id}`)}
              >
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8">
                      {resultIcon(result)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          vs {opponent.username}
                        </span>
                        <DifficultyBadge difficulty={match.problem.difficulty as "EASY" | "MEDIUM" | "HARD"} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {match.problem.title} ·{" "}
                        {new Date(match.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        result === "win"
                          ? "default"
                          : result === "loss"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {resultLabel(result)}
                    </Badge>
                    {match.ratingDelta !== undefined && (
                      <RatingDelta delta={match.ratingDelta} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
