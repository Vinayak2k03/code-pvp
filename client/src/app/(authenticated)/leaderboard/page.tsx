"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Loader2, Search, Trophy, Medal, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const [searchTerm, setSearchTerm] = useState("");
  const perPage = 25;
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getLeaderboard(page, perPage);
        const data = res?.data || res;
        if (active) {
          setEntries(data.leaderboard || data.users || []);
          setTotalPages(data.pagination?.totalPages || Math.ceil((data.total || 0) / perPage));
        }
      } catch {
        if (active) setEntries([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [page]);

  const top3 = page === 1 ? entries.slice(0, 3) : [];
  const tableEntries = page === 1 ? entries.slice(3) : entries;

  const getTier = (rating: number) => {
    if (rating >= 2500) return "Master";
    if (rating >= 2000) return "Diamond";
    if (rating >= 1500) return "Platinum";
    if (rating >= 1000) return "Gold";
    return "Silver";
  };

  return (
    <div className="flex flex-col min-h-full max-w-screen-2xl mx-auto w-full p-6 md:p-12">
      {/* Header Section */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-sans uppercase tracking-[0.2em] text-[#5F5E5E] dark:text-[#A1A1A1] font-bold text-[10px] mb-2 block">
              GLOBAL_RANKINGS_V2.0
            </span>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-[#0A0A0A] dark:text-white leading-none">
              THE_LADDER
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] px-6 py-4 rounded-sm border border-[#E3E2E2] dark:border-[#1C1B1B]">
              <span className="block text-[10px] uppercase tracking-widest font-bold text-[#5F5E5E] dark:text-[#A1A1A1] mb-1">
                CYCLE_STATUS
              </span>
              <span className="text-2xl font-black tabular-nums">ACTIVE</span>
            </div>
            <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] px-6 py-4 rounded-sm border border-[#E3E2E2] dark:border-[#1C1B1B]">
              <button 
                onClick={() => router.push("/dashboard")}
                className="block text-[11px] uppercase tracking-widest font-bold text-[#0A0A0A] dark:text-white hover:text-[#0A0A0A] dark:text-white transition-colors"
              >
                RETURN_TO_WORKSPACE
              </button>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A0A0A] dark:text-white" />
        </div>
      ) : (
        <>
          {/* Top 3 Asymmetric Bento Grid */}
          {page === 1 && top3.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
              {/* Rank 2 */}
              {top3[1] && (
                <div className="md:col-span-3 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm p-8 flex flex-col justify-between border border-transparent hover:border-[#E3E2E2] dark:border-[#1C1B1B] transition-all">
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-4xl font-black opacity-20">02</span>
                    <Medal className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <div className="w-16 h-16 rounded-sm mb-4 bg-zinc-300 overflow-hidden grayscale border-2 border-white dark:border-[#141414] flex items-center justify-center text-xl font-black">
                      {top3[1].username.slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-1 truncate">{top3[1].username}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">
                      {getTier(top3[1].rating)} Tier
                    </p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-[#E3E2E2] dark:border-[#1C1B1B]">
                    <span className="text-2xl font-black">{top3[1].rating}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] ml-2">ELO</span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Monolith Focus) */}
              {top3[0] && (
                <div className="md:col-span-6 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] rounded-sm p-10 flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <span className="text-[180px] font-black leading-none select-none">01</span>
                  </div>
                  <div className="relative z-10 flex-grow">
                    <div className="flex items-center gap-2 mb-8">
                      <span className="bg-on-error-container w-2 h-2 rounded-sm animate-pulse"></span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">REIGNING_CHAMPION</span>
                    </div>
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-24 h-24 rounded-sm border-4 border-on-primary/20 p-1 flex-shrink-0">
                        <div className="w-full h-full rounded-sm bg-zinc-900 border border-on-primary/30 flex items-center justify-center text-4xl font-black text-white">
                          {top3[0].username.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <h2 className="text-4xl font-black tracking-tighter mb-2 truncate">{top3[0].username}</h2>
                        <div className="inline-flex items-center gap-2 bg-on-primary/10 px-3 py-1 rounded-sm">
                          <Crown className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {getTier(top3[0].rating)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 flex justify-between items-end">
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-white dark:text-[#0A0A0A]/60 font-bold mb-1">
                        CURRENT_RATING
                      </span>
                      <span className="text-5xl font-black tabular-nums tracking-tighter">
                        {top3[0].rating}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-widest text-white dark:text-[#0A0A0A]/60 font-bold mb-1">
                        WIN_RATE
                      </span>
                      <span className="text-3xl font-black tabular-nums">
                        {top3[0].wins + top3[0].losses > 0 
                          ? ((top3[0].wins / (top3[0].wins + top3[0].losses + top3[0].draws)) * 100).toFixed(1)
                          : "0"}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 3 */}
              {top3[2] && (
                <div className="md:col-span-3 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm p-8 flex flex-col justify-between border border-transparent hover:border-[#E3E2E2] dark:border-[#1C1B1B] transition-all">
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-4xl font-black opacity-20">03</span>
                    <Trophy className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <div className="w-16 h-16 rounded-sm mb-4 bg-zinc-300 overflow-hidden grayscale border-2 border-white dark:border-[#141414] flex items-center justify-center text-xl font-black">
                      {top3[2].username.slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-1 truncate">{top3[2].username}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">
                      {getTier(top3[2].rating)} Tier
                    </p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-[#E3E2E2] dark:border-[#1C1B1B]">
                    <span className="text-2xl font-black">{top3[2].rating}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] ml-2">ELO</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Search & Filter Bar */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F5E5E] dark:text-[#A1A1A1]" />
              <input 
                className="w-full bg-[#F4F3F3] dark:bg-[#1C1B1B] border-none rounded-sm pl-12 pr-4 py-4 text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-all placeholder:text-zinc-500" 
                placeholder="SEARCH_PLAYER_ID..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
              <button className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] px-6 py-4 rounded-sm text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">GLOBAL</button>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-[#141414] rounded-sm overflow-hidden border border-[#E3E2E2] dark:border-[#1C1B1B] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#FAF9F9] dark:bg-[#0A0A0A] text-[#5F5E5E] dark:text-[#A1A1A1] border-b border-[#E3E2E2] dark:border-[#1C1B1B]">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest">Competitor</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest">ELO Rating</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-center">W / L / D</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-right">Win %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {tableEntries.filter(e => e.username.toLowerCase().includes(searchTerm.toLowerCase())).map((entry, idx) => {
                    const rank = page === 1 ? idx + 4 : (page - 1) * perPage + idx + 1;
                    const totalMatches = entry.wins + entry.losses + entry.draws;
                    const winRate = totalMatches > 0 ? ((entry.wins / totalMatches) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={entry.id} className="hover:bg-[#FAF9F9] dark:bg-[#0A0A0A] transition-colors group">
                        <td className="px-8 py-6 font-black tabular-nums text-zinc-400 group-hover:text-[#0A0A0A] dark:text-white transition-colors">
                          {rank.toString().padStart(2, '0')}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm bg-[#F4F3F3] dark:bg-[#1C1B1B] overflow-hidden grayscale flex items-center justify-center font-black">
                              {entry.username.slice(0,2).toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-bold tracking-tight">{entry.username}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] bg-[#FAF9F9] dark:bg-[#141414] px-2 py-0.5 rounded-sm mt-1 inline-block">
                                {getTier(entry.rating)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-black tabular-nums">{entry.rating}</td>
                        <td className="px-8 py-6 text-center tabular-nums text-[#5F5E5E] dark:text-[#A1A1A1] font-medium">
                          {entry.wins} / {entry.losses} / {entry.draws}
                        </td>
                        <td className="px-8 py-6 text-right font-black tabular-nums">{winRate}%</td>
                      </tr>
                    );
                  })}
                  {tableEntries.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center text-[#5F5E5E] dark:text-[#A1A1A1] uppercase tracking-widest text-xs font-bold">
                        NO_COMPETITORS_FOUND
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 border-t border-[#E3E2E2] dark:border-[#1C1B1B] pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-2 px-6 py-3 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#F4F3F3] dark:bg-[#1C1B1B] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> PREV_PAGE
              </button>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5F5E5E] dark:text-[#A1A1A1]">
                PAGE {page} OF {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-2 px-6 py-3 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#F4F3F3] dark:bg-[#1C1B1B] transition-colors"
              >
                NEXT_PAGE <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
