"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Swords, Trophy, Zap, Users, ArrowRight, Code2 } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            <span className="font-semibold tracking-tight">
              Battleground
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
            <Code2 className="h-3.5 w-3.5" />
            Real-time competitive coding
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Code. Compete.{" "}
            <span className="text-muted-foreground">Conquer.</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground max-w-xl mx-auto">
            Go head-to-head against other developers. Solve the same DSA problem
            in real-time. The fastest correct solution wins.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href={user ? "/lobby" : "/signup"}>
                Start a Match
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="container py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold">Real-time Duels</h3>
                <p className="text-sm text-muted-foreground">
                  Match against opponents of similar skill. Both players solve
                  the same problem simultaneously with a live timer.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold">ELO Rating</h3>
                <p className="text-sm text-muted-foreground">
                  Competitive rating system that ranks you against the world.
                  Climb from Newbie to Grandmaster.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold">Spectator Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Watch ongoing matches live. See submissions in real-time and
                  learn from top players.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          Built with Next.js, Express, and Socket.IO
        </div>
      </footer>
    </div>
  );
}
