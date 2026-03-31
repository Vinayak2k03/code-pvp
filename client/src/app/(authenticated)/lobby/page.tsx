"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMatchmaking } from "@/hooks/use-socket";
import { Loader2, Users, Send } from "lucide-react";

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
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 font-sans text-[#0A0A0A] dark:text-white">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-[#0A0A0A] dark:text-white mb-4">MATCH LOBBY</h1>
          <p className="text-[#5F5E5E] dark:text-[#A1A1A1] max-w-xl font-medium leading-relaxed">
            Join the active matchmaking queue. High-performance logic required for current active sectors.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] p-4 flex items-center gap-4 rounded-sm">
            <p className="text-xs font-bold tracking-widest uppercase">
              {queueStatus ? `${queueStatus.total} Active in Queue` : "System online"}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
        <section className="xl:col-span-7 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#5F5E5E] dark:text-[#A1A1A1]">
              Matchmaking Queue
            </h2>
            <div className="flex gap-4 text-[10px] font-bold tracking-widest uppercase text-[#5F5E5E] dark:text-[#A1A1A1]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-[#0A0A0A] dark:bg-white"></span> Live
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="group bg-white dark:bg-[#141414] hover:bg-white transition-all duration-300 p-8 rounded-sm flex flex-col md:flex-row justify-between items-center gap-6 shadow-none border border-[#E3E2E2] dark:border-[#1C1B1B]">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-[#F4F3F3] dark:bg-[#1C1B1B]est rounded-sm text-[#0A0A0A] dark:text-white">
                    Ranked
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">
                    ELO: {user.rating} +/-
                  </span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Competitive 1v1 Duel</h3>
                <div className="flex items-center gap-6 text-xs text-[#5F5E5E] dark:text-[#A1A1A1] font-medium">
                  <span className="flex items-center gap-2">
                    Opponent matching in progress...
                  </span>
                </div>
              </div>

              {inQueue ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0A0A0A] dark:text-white mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Wait: ~{queueStatus?.estimatedWait || 5}s
                    </span>
                  </div>
                  <button
                    onClick={leaveQueue}
                    className="bg-[#FAF9F9] dark:bg-[#0A0A0A] text-[#5F5E5E] dark:text-[#A1A1A1] px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-[#E9E8E8] transition-all"
                  >
                    Abort
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => joinQueue(user.rating)}
                  className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] px-10 py-4 rounded-sm font-bold uppercase tracking-widest text-xs active:scale-[0.98] transition-all"
                >
                  Enter Queue
                </button>
              )}
            </div>

            <div className="group bg-[#FAF9F9] dark:bg-[#0A0A0A] p-8 rounded-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-[#E3E2E2] dark:border-[#1C1B1B] opacity-70 cursor-not-allowed">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-[#F4F3F3] dark:bg-[#1C1B1B] rounded-sm text-[#0A0A0A] dark:text-white">
                    Casual
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Unrated Match (Coming Soon)</h3>
                <div className="flex items-center gap-6 text-xs text-[#5F5E5E] dark:text-[#A1A1A1] font-medium">
                   <span>Practice without ELO pressure</span>
                </div>
              </div>
              <button disabled className="bg-[#F4F3F3] dark:bg-[#1C1B1B] text-[#5F5E5E] dark:text-[#A1A1A1] px-10 py-4 rounded-sm font-bold uppercase tracking-widest text-xs">
                Locked
              </button>
            </div>
          </div>
        </section>

        <section className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm flex flex-col h-[600px] overflow-hidden border border-[#E3E2E2] dark:border-[#1C1B1B]">
            <div className="p-6 bg-[#F4F3F3] dark:bg-[#1C1B1B] flex justify-between items-center border-b border-[#E3E2E2] dark:border-[#1C1B1B]">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0A0A0A] dark:text-white">Global System Logs</h2>
                <p className="text-[10px] font-medium text-[#5F5E5E] dark:text-[#A1A1A1] uppercase tracking-widest mt-1">
                  Status: Operational
                </p>
              </div>
              <span className="w-2 h-2 rounded-sm bg-on-error-container relative">
                <span className="absolute inset-0 rounded-sm bg-on-error-container animate-ping opacity-75"></span>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-sm bg-[#F4F3F3] dark:bg-[#1C1B1B]est flex items-center justify-center text-xs font-bold">SYS</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                    System <span className="text-[#5F5E5E] dark:text-[#A1A1A1] opacity-40">AUTO</span>
                  </p>
                  <p className="text-sm font-medium text-[#5F5E5E] dark:text-[#A1A1A1] leading-relaxed">
                    Welcome to the CodeClash Arena. Global matchmaking is currently online.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-sm bg-[#F4F3F3] dark:bg-[#1C1B1B]est flex items-center justify-center text-xs font-bold">BOT</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                    MatchBot <span className="text-[#5F5E5E] dark:text-[#A1A1A1] opacity-40">AUTO</span>
                  </p>
                  <p className="text-sm font-medium text-[#5F5E5E] dark:text-[#A1A1A1] leading-relaxed">
                    Peak hours detected. Estimated wait times are under 10 seconds.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#F4F3F3] dark:bg-[#1C1B1B] border-t border-[#E3E2E2] dark:border-[#1C1B1B]">
              <div className="relative">
                <input
                  className="w-full bg-white dark:bg-[#141414] border-none rounded-sm px-6 py-4 text-xs font-bold tracking-widest uppercase focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white-code placeholder:opacity-30 transition-all text-[#0A0A0A] dark:text-white"
                  placeholder="CHAT DISABLED..."
                  type="text"
                  disabled
                />
                <button disabled className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0A0A0A] dark:text-white opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
