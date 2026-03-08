"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMatchmaking } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RatingBadge } from "@/components/rating-badge";
import { Gamepad2, Loader2, X, Users } from "lucide-react";

export default function LobbyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { inQueue, queueStatus, matchFound, joinQueue, leaveQueue } =
    useMatchmaking();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (matchFound) {
      router.push(`/duel/${matchFound.matchId}`);
    }
  }, [matchFound, router]);

  if (loading || !user) return null;

  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Player Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Ready to Battle?</CardTitle>
            <CardDescription>
              You will be matched with an opponent of similar rating
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Rating</p>
              <RatingBadge rating={user.rating} />
            </div>
            <div className="text-sm text-muted-foreground">
              {user.wins}W · {user.losses}L · {user.draws}D
            </div>
          </CardContent>
        </Card>

        {/* Queue Status */}
        {inQueue ? (
          <Card className="border-primary/20">
            <CardContent className="py-8 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">Searching for opponent...</p>
                {queueStatus && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <Users className="inline h-3.5 w-3.5 mr-1" />
                    {queueStatus.total} in queue · ~{queueStatus.estimatedWait}s
                    wait
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={leaveQueue}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button
            size="lg"
            className="w-full h-14 text-base"
            onClick={() => joinQueue(user.rating)}
          >
            <Gamepad2 className="mr-2 h-5 w-5" />
            Find Match
          </Button>
        )}

        {/* Tips */}
        <div className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">
            Rating range expands over time if no match is found.
            <br />
            Both players will receive the same problem.
          </p>
        </div>
      </div>
    </div>
  );
}
