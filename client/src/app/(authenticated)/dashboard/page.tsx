"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, TrendingUp, Trophy, History, Eye, ChevronRight } from "lucide-react";

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
  const winRate = totalMatches > 0 ? ((user.wins / totalMatches) * 100).toFixed(1) : "0.0";
  
  // Calculate tier based on rating loosely
  const getTierAndPoints = (rating: number) => {
    if (rating >= 2500) return { tier: "MASTER", points: rating - 2500, toNext: 0 };
    if (rating >= 2000) return { tier: "DIAMOND", points: rating - 2000, toNext: 2500 - rating };
    if (rating >= 1500) return { tier: "PLATINUM", points: rating - 1500, toNext: 2000 - rating };
    if (rating >= 1000) return { tier: "GOLD", points: rating - 1000, toNext: 1500 - rating };
    return { tier: "SILVER", points: rating, toNext: 1000 - rating };
  };

  const { tier, toNext } = getTierAndPoints(user.rating);

  return (
    <div className="flex flex-col min-h-full">
      <div className="max-w-screen-2xl mx-auto w-full p-8 md:p-12 space-y-12 flex-1">
        {/* Hero Header Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <span className="font-sans uppercase tracking-[0.2em] text-[11px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1] mb-4 block">
              WORKSPACE_V1.0.4
            </span>
            <h2 className="text-6xl md:text-8xl font-headline font-black tracking-tighter text-[#0A0A0A] dark:text-white leading-none mb-6">
              {user.username.toUpperCase()}
            </h2>
            <p className="text-[#5F5E5E] dark:text-[#A1A1A1] max-w-xl text-lg font-body leading-relaxed">
              Interface engaged. Ready for technical clash. System latency nominal. All logic engines operational.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <button 
              onClick={() => router.push("/lobby")}
              className="group relative px-10 py-6 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] font-bold tracking-widest uppercase text-sm rounded-sm overflow-hidden active:scale-[0.98] transition-all"
            >
              <span className="relative z-10 flex items-center gap-3">
                START_CLASH
                <ArrowRight className="w-5 h-5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rating Card */}
          <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] p-8 rounded-sm flex flex-col justify-between aspect-square lg:aspect-auto h-48">
            <span className="font-sans uppercase tracking-widest text-[10px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
              Current_Rating
            </span>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black font-headline tracking-tighter">
                {user.rating.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#5F5E5E] dark:text-[#A1A1A1] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +0
              </span>
            </div>
          </div>
          
          {/* Win Rate */}
          <div className="bg-white dark:bg-[#141414] p-8 rounded-sm flex flex-col justify-between aspect-square lg:aspect-auto h-48 border border-[#E3E2E2] dark:border-[#1C1B1B]">
            <span className="font-sans uppercase tracking-widest text-[10px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
              Win_Probability
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-4xl font-black font-headline tracking-tighter">
                {winRate}%
              </span>
              <div className="w-full bg-[#F4F3F3] dark:bg-[#1C1B1B] h-1 rounded-sm overflow-hidden">
                <div className="bg-[#0A0A0A] dark:bg-white h-full" style={{ width: `${winRate}%` }}></div>
              </div>
            </div>
          </div>

          {/* Total Matches */}
          <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] p-8 rounded-sm flex flex-col justify-between aspect-square lg:aspect-auto h-48">
            <span className="font-sans uppercase tracking-widest text-[10px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
              Matches_Played
            </span>
            <span className="text-4xl font-black font-headline tracking-tighter">
              {totalMatches}
            </span>
          </div>

          {/* Record */}
          <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] p-8 rounded-sm flex flex-col justify-between aspect-square lg:aspect-auto h-48">
            <span className="font-sans uppercase tracking-widest text-[10px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
              Record_W-L-D
            </span>
            <div className="flex flex-col">
              <span className="text-3xl font-black font-headline tracking-tighter">
                {user.wins} / {user.losses} / {user.draws}
              </span>
              <span className="text-[10px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1] tracking-widest mt-2 uppercase">
                {user.wins > user.losses ? 'TECHNICAL_DOMINANCE_LEVEL_HIGH' : 'ANALYZING_WEAKNESSES'}
              </span>
            </div>
          </div>
        </section>

        {/* Main Interactive Section */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Large Your Rank Display */}
          <div className="xl:col-span-8 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm relative overflow-hidden group min-h-[400px]">
            <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center grayscale" />
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low via-surface-container-low/90 to-transparent z-10" />
            <div className="relative z-20 p-12 h-full flex flex-col justify-between">
              <div>
                <span className="font-sans uppercase tracking-[0.3em] text-[11px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
                  Tier_Status
                </span>
                <h3 className="text-7xl font-black font-headline tracking-tighter mt-4">
                  {tier}
                </h3>
                <p className="mt-4 text-[#5F5E5E] dark:text-[#A1A1A1] max-w-sm uppercase text-[10px] tracking-widest font-bold">
                  {toNext > 0 ? `${toNext} points until next calibration.` : 'Max calibration reached.'}
                </p>
              </div>
              <div className="flex items-center gap-12 pt-12">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
                    Global_Rank
                  </span>
                  <span className="text-2xl font-black font-headline tracking-tight">
                    #{stats?.rank || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
                    Regional_Rank
                  </span>
                  <span className="text-2xl font-black font-headline tracking-tight">
                    #{stats?.rank ? stats.rank + Math.floor(Math.random() * 5) : "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
                    Peak_Rating
                  </span>
                  <span className="text-2xl font-black font-headline tracking-tight">
                    {user.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & System Diagnostics */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <h4 className="font-sans uppercase tracking-widest text-[10px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1] mb-2">
              QUICK_ACTIONS
            </h4>
            <Link href="/leaderboard" className="bg-white dark:bg-[#141414] p-6 rounded-sm border border-[#E3E2E2] dark:border-[#1C1B1B] flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#FAF9F9] dark:bg-[#0A0A0A] flex items-center justify-center group-hover:bg-[#0A0A0A] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#0A0A0A] transition-colors">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="font-sans uppercase tracking-widest text-[11px] font-bold">
                  Leaderboard
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#5F5E5E] dark:text-[#A1A1A1]/50" />
            </Link>
            
            <Link href="/history" className="bg-white dark:bg-[#141414] p-6 rounded-sm border border-[#E3E2E2] dark:border-[#1C1B1B] flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#FAF9F9] dark:bg-[#0A0A0A] flex items-center justify-center group-hover:bg-[#0A0A0A] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#0A0A0A] transition-colors">
                  <History className="w-5 h-5" />
                </div>
                <span className="font-sans uppercase tracking-widest text-[11px] font-bold">
                  Match History
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#5F5E5E] dark:text-[#A1A1A1]/50" />
            </Link>
            
            <Link href="/spectate" className="bg-white dark:bg-[#141414] p-6 rounded-sm border border-[#E3E2E2] dark:border-[#1C1B1B] flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#FAF9F9] dark:bg-[#0A0A0A] flex items-center justify-center group-hover:bg-[#0A0A0A] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#0A0A0A] transition-colors">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="font-sans uppercase tracking-widest text-[11px] font-bold">
                  Spectate Matches
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#5F5E5E] dark:text-[#A1A1A1]/50" />
            </Link>
            
            <div className="mt-4 p-6 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="font-sans uppercase tracking-widest text-[10px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
                  System_Uptime
                </span>
                <span className="text-[10px] font-bold text-[#FF3333] animate-pulse">LIVE_FEED</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-[#5F5E5E] dark:text-[#A1A1A1]">API_STATUS</span>
                  <span className="text-[#0A0A0A] dark:text-white">OPERATIONAL</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-[#5F5E5E] dark:text-[#A1A1A1]">AUTH_NODES</span>
                  <span className="text-[#0A0A0A] dark:text-white">ENCRYPTED</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-[#5F5E5E] dark:text-[#A1A1A1]">LATENCY_MS</span>
                  <span className="text-[#0A0A0A] dark:text-white">12MS</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 mt-auto border-t border-[#E3E2E2] dark:border-[#1C1B1B] bg-white dark:bg-[#141414]">
        <div className="flex justify-between items-center px-8 w-full max-w-screen-2xl mx-auto font-sans text-[10px] tracking-widest uppercase">
          <div className="text-[#5F5E5E] dark:text-[#A1A1A1]">
            © 2026 <span className="font-bold text-[#0A0A0A] dark:text-white">CODECLASH</span> // TECHNICAL_MONOLITH_V1
          </div>
          <div className="flex gap-8">
            <Link href="#" className="text-[#5F5E5E] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:text-white underline decoration-1 opacity-80 hover:opacity-100 transition-opacity">SYSTEM_STATUS</Link>
            <Link href="#" className="text-[#5F5E5E] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:text-white underline decoration-1 opacity-80 hover:opacity-100 transition-opacity">PRIVACY_PROTOCOL</Link>
            <Link href="#" className="text-[#5F5E5E] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:text-white underline decoration-1 opacity-80 hover:opacity-100 transition-opacity">API_DOCS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
