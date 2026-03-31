"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Loader2, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);
  const perPage = 15;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.getUserStats(user.id).then(res => setStats(res.data)).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getMatches(page, perPage);
        const data = res?.data || res;
        if (active) {
          setMatches(data.matches || []);
          setTotalPages(data.pagination?.totalPages || Math.ceil((data.total || 0) / perPage));
        }
      } catch {
        if (active) setMatches([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [page, user]);

  if (authLoading || !user) return null;

  const totalMatchesCount = user.wins + user.losses + user.draws;
  const winRateFloat = totalMatchesCount > 0 ? ((user.wins / totalMatchesCount) * 100).toFixed(1) : "0.0";

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

  const filteredMatches = matches.filter(m => 
    m.problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getOpponent(m).username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full max-w-screen-xl mx-auto w-full px-6 md:px-12 lg:px-24 pt-24 pb-20">
      {/* Page Header */}
      <header className="mb-16">
        <h1 className="text-5xl font-black tracking-tight text-[#0A0A0A] dark:text-white mb-2 uppercase">
          Match History
        </h1>
        <p className="text-[#5F5E5E] dark:text-[#A1A1A1] text-sm tracking-widest uppercase font-bold opacity-60">
          Archive / System_Logs / Match_Data
        </p>
      </header>

      {/* Stats Overview Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-1 mb-12 bg-[#F4F3F3] dark:bg-[#1C1B1B] border-2 border-[#0A0A0A] dark:border-white">
        <div className="bg-white dark:bg-[#141414] p-8 flex flex-col justify-between transition-colors hover:bg-[#FAF9F9] dark:bg-[#0A0A0A]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">
            Total Battles
          </span>
          <span className="text-4xl font-black mt-4">{totalMatchesCount}</span>
        </div>
        <div className="bg-white dark:bg-[#141414] p-8 flex flex-col justify-between transition-colors hover:bg-[#FAF9F9] dark:bg-[#0A0A0A]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">
            Win Rate
          </span>
          <span className="text-4xl font-black mt-4">{winRateFloat}%</span>
        </div>
        <div className="bg-white dark:bg-[#141414] p-8 flex flex-col justify-between transition-colors hover:bg-[#FAF9F9] dark:bg-[#0A0A0A]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">
            Global Rank
          </span>
          <span className="text-4xl font-black mt-4">#{stats?.rank || "—"}</span>
        </div>
        <div className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] p-8 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            Current Elo
          </span>
          <span className="text-4xl font-black mt-4">{user.rating}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest rounded-sm">
            All Matches
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F5E5E] dark:text-[#A1A1A1]" />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-[#FAF9F9] dark:bg-[#0A0A0A] border-0 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white text-[10px] font-bold tracking-widest placeholder:text-[#5F5E5E] dark:text-[#A1A1A1]" 
            placeholder="SEARCH RECORDS..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Match List Table */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-[#FAF9F9] dark:bg-[#0A0A0A] border-b border-[#E3E2E2] dark:border-[#1C1B1B] text-[10px] font-bold tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] uppercase">
          <div className="col-span-1">Result</div>
          <div className="col-span-4">Challenge Name</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#0A0A0A] dark:text-white" />
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-16 uppercase font-bold tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] text-sm">
            NO_MATCH_RECORDS_FOUND
          </div>
        ) : (
          filteredMatches.map(match => {
            const result = getResultForUser(match);
            const opponent = getOpponent(match);
            
            const isWin = result === "win";
            const isLoss = result === "loss";
            const isDraw = result === "draw";

            let resultChar = "—";
            if (isWin) resultChar = "W";
            if (isLoss) resultChar = "L";
            if (isDraw) resultChar = "D";

            let resultClass = "";
            if (isWin) resultClass = "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]";
            if (isLoss) resultClass = "border border-gray-300 dark:border-gray-700 text-[#5F5E5E] dark:text-[#A1A1A1]";
            if (isDraw) resultClass = "bg-[#F4F3F3] dark:bg-[#1C1B1B] text-[#0A0A0A] dark:text-white";
            if (result === "in-progress") {
              resultChar = "P";
              resultClass = "bg-[#FF3333] text-white animate-pulse";
            }

            return (
              <div 
                key={match.id}
                onClick={() => router.push(`/duel/${match.id}`)}
                className="grid grid-cols-1 md:grid-cols-12 items-center px-8 py-6 bg-white dark:bg-[#141414] hover:bg-[#FAF9F9] dark:bg-[#0A0A0A] transition-all group relative overflow-hidden cursor-pointer"
              >
                {isWin && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0A0A0A] dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
                <div className="col-span-1 mb-4 md:mb-0">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-sm text-[10px] font-black ${resultClass}`}>
                    {resultChar}
                  </span>
                </div>
                <div className="col-span-4 mb-4 md:mb-0">
                  <h3 className="font-bold tracking-tight text-lg uppercase truncate pr-4">
                    {match.problem.title.replace(/\s+/g, '_')}
                  </h3>
                  <p className="text-[10px] text-[#5F5E5E] dark:text-[#A1A1A1] uppercase tracking-widest font-medium">
                    Opponent: {opponent.username}
                  </p>
                </div>
                <div className="col-span-2 mb-4 md:mb-0">
                  <span className={`text-[10px] font-bold tracking-widest border px-3 py-1 rounded-sm uppercase
                    ${match.problem.difficulty === 'HARD' ? 'border-[#FF3333] text-[#FF3333]' : 
                      match.problem.difficulty === 'MEDIUM' ? 'border-[#0A0A0A] dark:border-white text-[#0A0A0A] dark:text-white' : 
                      'border-gray-400 dark:border-gray-600 text-[#5F5E5E] dark:text-[#A1A1A1]'}`}
                  >
                    {match.problem.difficulty}
                  </span>
                </div>
                <div className="col-span-2 mb-4 md:mb-0">
                  <span className="text-xs font-medium text-[#5F5E5E] dark:text-[#A1A1A1] uppercase tracking-tight">
                    {new Date(match.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="col-span-2 mb-4 md:mb-0">
                  <span className={`text-lg font-black uppercase ${isWin ? 'text-[#0A0A0A] dark:text-white' : isLoss ? 'text-[#5F5E5E] dark:text-[#A1A1A1]' : 'text-[#0A0A0A] dark:text-white'}`}>
                    {match.ratingDelta !== undefined ? `${match.ratingDelta > 0 ? '+' : ''}${match.ratingDelta} PTS` : '—'}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <button className="text-[#5F5E5E] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:text-white transition-colors">
                    <ExternalLink className="w-5 h-5 ml-auto" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-10 h-10 flex items-center justify-center border border-[#E3E2E2] dark:border-[#1C1B1B] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#0A0A0A] dark:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-4 text-[10px] font-bold tracking-widest uppercase text-[#5F5E5E] dark:text-[#A1A1A1]">
            {page} / {totalPages}
          </span>
          
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="w-10 h-10 flex items-center justify-center border border-[#E3E2E2] dark:border-[#1C1B1B] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#0A0A0A] dark:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
