"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingBadge } from "@/components/rating-badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 25;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getLeaderboard(page, perPage);
        const data = res?.data || res;
        setEntries(data.leaderboard || data.users || []);
        setTotalPages(data.pagination?.totalPages || Math.ceil((data.total || 0) / perPage));
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
    return <span className="text-xs text-muted-foreground w-4 text-center">{rank}</span>;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground text-sm">
          Top players ranked by ELO rating
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              No players found.
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem] gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground border-b">
                <span>#</span>
                <span>Player</span>
                <span className="text-right">Rating</span>
                <span className="text-right">W/L/D</span>
                <span className="text-right">Win%</span>
              </div>
              {entries.map((entry, i) => {
                const rank = (page - 1) * perPage + i + 1;
                const total = entry.wins + entry.losses + entry.draws;
                const winRate = total > 0 ? ((entry.wins / total) * 100).toFixed(0) : "0";
                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem] gap-2 items-center px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors border-b last:border-0"
                  >
                    <div className="flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {entry.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{entry.username}</span>
                    </div>
                    <div className="text-right">
                      <RatingBadge rating={entry.rating} />
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {entry.wins}/{entry.losses}/{entry.draws}
                    </div>
                    <div className="text-right text-xs">{winRate}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
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
