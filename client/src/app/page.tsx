"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Terminal, Zap, Activity, Eye, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="antialiased selection:bg-[#0A0A0A] dark:bg-white selection:text-white dark:text-[#0A0A0A] min-h-screen flex flex-col font-sans">
      {/* TopNavBar Component */}
      <nav className="sticky top-0 w-full z-[100] bg-[#FAF9F9]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 lg:px-12 py-5 max-w-[1600px] mx-auto relative">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-2xl font-black tracking-tighter text-[#0A0A0A] dark:text-white uppercase">
              CODECLASH
            </Link>
            <div className="hidden lg:flex items-center gap-8">
              <Link href={user ? "/lobby" : "/signup"} className="text-[#444748] font-medium hover:text-[#0A0A0A] dark:text-white transition-all duration-200">
                Match
              </Link>
              <Link href="/leaderboard" className="text-[#444748] font-medium hover:text-[#0A0A0A] dark:text-white transition-all duration-200">
                Leaderboard
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-black text-white px-6 py-2 rounded-sm font-bold transition-all duration-200 active:scale-[0.98]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#444748] font-medium px-4 py-2 hover:text-[#0A0A0A] dark:text-white transition-all duration-200 active:scale-[0.98]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-black text-white px-6 py-2 rounded-sm font-bold transition-all duration-200 active:scale-[0.98]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
          <div className="bg-[#F4F3F3] h-[1px] w-full absolute bottom-0 left-0"></div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 px-6 lg:px-12 overflow-hidden bg-white dark:bg-[#141414]">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#F4F3F3] dark:bg-[#1C1B1B] border border-[#E3E2E2] dark:border-[#1C1B1B] w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-[#FF3333] opacity-75"></span>
                  <span className="relative inline-flex rounded-sm h-2 w-2 bg-[#FF3333]"></span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#5F5E5E] dark:text-[#A1A1A1]">
                  Live Matches Ongoing
                </span>
              </div>
              <h1 className="text-6xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.9] text-[#0A0A0A] dark:text-white">
                Code.<br />Compete.<br />Conquer.
              </h1>
              <p className="text-xl lg:text-2xl text-[#5F5E5E] dark:text-[#A1A1A1] max-w-xl leading-relaxed">
                The definitive arena for technical excellence. Real-time competitive coding, algorithmic duels, and global DSA rankings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link
                  href={user ? "/lobby" : "/signup"}
                  className="bg-gradient-to-br from-[#000000] to-[#1C1B1B] text-white dark:text-[#0A0A0A] px-10 py-5 rounded-sm text-lg font-bold shadow-none shadow-black/20 dark:shadow-white/20 hover:scale-[1.02] transition-transform active:scale-[0.98] text-center"
                >
                  Start a Match
                </Link>
                <Link
                  href="/leaderboard"
                  className="bg-[#F4F3F3] text-[#0A0A0A] dark:bg-[#1C1B1B] dark:text-white px-10 py-5 rounded-sm text-lg font-bold hover:bg-[#E3E2E2] dark:hover:bg-[#2A2A2A] transition-colors active:scale-[0.98] text-center"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative group hidden md:block">
              <div className="aspect-square bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm overflow-hidden relative border border-[#E3E2E2] dark:border-[#1C1B1B]">
                <img
                  alt="Advanced technical interface"
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-700"
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
                {/* Floating Data Cards */}
                <div className="absolute top-8 left-0 md:-left-8 bg-white dark:bg-[#141414] p-6 rounded-sm shadow-none border border-[#E3E2E2] dark:border-[#1C1B1B] backdrop-blur-md bg-white/90 max-w-[240px]">
                  <div className="flex items-center gap-3 mb-4">
                    <Terminal className="text-[#0A0A0A] dark:text-white w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">Active Instance</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-[#F4F3F3] dark:bg-[#1C1B1B] rounded-sm overflow-hidden">
                      <div className="h-full w-2/3 bg-[#0A0A0A] dark:bg-white"></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-[#5F5E5E] dark:text-[#A1A1A1]">
                      <span>TEST CASES</span>
                      <span>67% PASS</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-12 right-0 md:-right-4 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] p-6 rounded-sm shadow-none max-w-[200px]">
                  <span className="text-4xl font-black tracking-tighter">2400</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">ELO RATING: GRANDMASTER</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="py-24 px-6 lg:px-12 bg-[#FAF9F9] dark:bg-[#0A0A0A]">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-black tracking-tighter text-[#0A0A0A] dark:text-white mb-6">Designed for the 1%.</h2>
                <p className="text-lg text-[#5F5E5E] dark:text-[#A1A1A1]">We stripped away the clutter to focus on what matters: pure logic and execution speed.</p>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5F5E5E] dark:text-[#A1A1A1] border-b-2 border-[#0A0A0A] dark:border-white pb-2">
                Technical Specs
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="group p-10 bg-white dark:bg-[#141414] rounded-sm flex flex-col gap-12 hover:bg-white transition-colors border border-[#E3E2E2] dark:border-[#1C1B1B]">
                <div className="h-16 w-16 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm flex items-center justify-center group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors">
                  <Zap className="text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight mb-4 text-[#0A0A0A] dark:text-white">Real-time Duels</h3>
                  <p className="text-[#5F5E5E] dark:text-[#A1A1A1] leading-relaxed">Latency-free environment for 1v1 algorithmic battles. Every keystroke synchronized in sub-50ms.</p>
                </div>
                <div className="mt-auto pt-8 border-t border-[#E3E2E2] dark:border-[#1C1B1B] flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#0A0A0A] dark:text-white">Low Latency</span>
                  <ArrowRight className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
              </div>
              {/* Feature Card 2 */}
              <div className="group p-10 bg-white dark:bg-[#141414] rounded-sm flex flex-col gap-12 hover:bg-white transition-colors border border-[#E3E2E2] dark:border-[#1C1B1B]">
                <div className="h-16 w-16 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm flex items-center justify-center group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors">
                  <Activity className="text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight mb-4 text-[#0A0A0A] dark:text-white">ELO Rating</h3>
                  <p className="text-[#5F5E5E] dark:text-[#A1A1A1] leading-relaxed">Mathematical precision in ranking. Our algorithm accounts for problem difficulty and solving speed.</p>
                </div>
                <div className="mt-auto pt-8 border-t border-[#E3E2E2] dark:border-[#1C1B1B] flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#0A0A0A] dark:text-white">Global Rank</span>
                  <ArrowRight className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
              </div>
              {/* Feature Card 3 */}
              <div className="group p-10 bg-white dark:bg-[#141414] rounded-sm flex flex-col gap-12 hover:bg-white transition-colors border border-[#E3E2E2] dark:border-[#1C1B1B]">
                <div className="h-16 w-16 bg-[#FAF9F9] dark:bg-[#0A0A0A] rounded-sm flex items-center justify-center group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors">
                  <Eye className="text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight mb-4 text-[#0A0A0A] dark:text-white">Spectator Mode</h3>
                  <p className="text-[#5F5E5E] dark:text-[#A1A1A1] leading-relaxed">Watch high-stakes matches live. Analyze player strategies and time complexity in real-time.</p>
                </div>
                <div className="mt-auto pt-8 border-t border-[#E3E2E2] dark:border-[#1C1B1B] flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#0A0A0A] dark:text-white">Live Streams</span>
                  <ArrowRight className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Ticker Section */}
        <section className="bg-[#0A0A0A] dark:bg-white py-8 overflow-hidden flex gap-16">
          <div className="flex shrink-0 whitespace-nowrap gap-16 animate-marquee items-center min-w-full">
            <div className="flex items-center gap-16 text-white dark:text-[#0A0A0A] text-[11px] font-black uppercase tracking-[0.4em]">
              <span>SYSTEM ONLINE</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>12.4K ACTIVE CLASHERS</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>NEW PROBLEMSET ADDED: GRAPH THEORY</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>SYSTEM ONLINE</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>12.4K ACTIVE CLASHERS</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>NEW PROBLEMSET ADDED: GRAPH THEORY</span>
            </div>
          </div>
          <div className="flex shrink-0 whitespace-nowrap gap-16 animate-marquee items-center min-w-full" aria-hidden="true">
            <div className="flex items-center gap-16 text-white dark:text-[#0A0A0A] text-[11px] font-black uppercase tracking-[0.4em]">
              <span>SYSTEM ONLINE</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>12.4K ACTIVE CLASHERS</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>NEW PROBLEMSET ADDED: GRAPH THEORY</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>SYSTEM ONLINE</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>12.4K ACTIVE CLASHERS</span>
              <span className="h-1 w-1 bg-white dark:bg-[#0A0A0A] rounded-sm"></span>
              <span>NEW PROBLEMSET ADDED: GRAPH THEORY</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <footer className="w-full py-16 px-6 lg:px-12 bg-white dark:bg-[#141414] mt-auto border-t border-[#E3E2E2] dark:border-[#1C1B1B]">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-lg font-black text-[#0A0A0A] dark:text-white">CODECLASH</div>
            <div className="text-[#5F5E5E] text-[11px] font-medium tracking-[0.1em] uppercase">
              © 2026 CODECLASH MONOLITH. ALL LOGIC RESERVED.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="#" className="text-[#5F5E5E] text-[11px] font-medium tracking-[0.1em] uppercase hover:text-[#0A0A0A] dark:text-white transition-colors duration-300">
              Documentation
            </Link>
            <Link href="#" className="text-[#5F5E5E] text-[11px] font-medium tracking-[0.1em] uppercase hover:text-[#0A0A0A] dark:text-white transition-colors duration-300">
              Changelog
            </Link>
            <Link href="#" className="text-[#5F5E5E] text-[11px] font-medium tracking-[0.1em] uppercase hover:text-[#0A0A0A] dark:text-white transition-colors duration-300">
              Legal
            </Link>
            <Link href="#" className="text-[#5F5E5E] text-[11px] font-medium tracking-[0.1em] uppercase hover:text-[#0A0A0A] dark:text-white transition-colors duration-300">
              System Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
