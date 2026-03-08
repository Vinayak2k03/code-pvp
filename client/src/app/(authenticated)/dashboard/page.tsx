"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RatingBadge, RatingDisplay } from "@/components/rating-badge";
import { Gamepad2, Trophy, Swords, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.getUserStats(user.id).then((res) => setStats(res.data)).catch(console.error);
    }
  }, [user]);

  if (loading || !user) return null;

  const totalMatches = user.wins + user.losses + user.draws;
  const winRate = totalMatches > 0 ? Math.round((user.wins / totalMatches) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.username}
        </h1>
        <p className="text-muted-foreground">
          Ready for your next challenge?
        </p>
      </div>

      {/* Quick Action */}
      <Card>
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Start a Match</h3>
              <p className="text-sm text-muted-foreground">
                Find an opponent and compete in real-time
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/lobby">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Find Match
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RatingDisplay rating={user.rating} />
              <RatingBadge rating={user.rating} showLabel={false} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-emerald-500">{user.wins}W</span>
              {" · "}
              <span className="text-red-500">{user.losses}L</span>
              {" · "}
              <span className="text-muted-foreground">{user.draws}D</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank & Leaderboard Preview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-bold mb-1">
                #{stats?.rank || "—"}
              </div>
              <p className="text-sm text-muted-foreground">Global Ranking</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/leaderboard">
                <Trophy className="mr-2 h-4 w-4" />
                View Leaderboard
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/history">
                <Swords className="mr-2 h-4 w-4" />
                Match History
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/spectate">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Spectate Matches
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
