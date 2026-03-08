"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/rating-badge";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Radio, Users } from "lucide-react";

interface LiveMatch {
  id: string;
  player1: { username: string; rating: number };
  player2: { username: string; rating: number };
  problem: { title: string; difficulty: string };
  startedAt: string;
  spectatorCount?: number;
}

export default function SpectatePage() {
  const router = useRouter();
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const res = await api.getLiveMatches();
      const data = res?.data || res;
      setMatches(Array.isArray(data) ? data : data.matches || []);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spectate</h1>
          <p className="text-muted-foreground text-sm">
            Watch live matches in real-time
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Radio className="h-3 w-3 text-red-500 animate-pulse" />
          {matches.length} Live
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Eye className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No live matches right now. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <Card
              key={match.id}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => router.push(`/duel/${match.id}?spectate=true`)}
            >
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={match.problem.difficulty as "EASY" | "MEDIUM" | "HARD"} />
                    <span className="text-sm font-medium">
                      {match.problem.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {match.spectatorCount ?? 0}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span>{match.player1.username}</span>
                      <RatingBadge rating={match.player1.rating} />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      VS
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>{match.player2.username}</span>
                      <RatingBadge rating={match.player2.rating} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Eye className="mr-1.5 h-3 w-3" />
                    Watch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
