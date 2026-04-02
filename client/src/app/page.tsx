"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: #000000;
            color: #ffffff;
            overflow-x: hidden;
        }
        .monolith-gradient {
            background: linear-gradient(135deg, #000000 0%, #1C1B1B 100%);
        }
        .technical-grid {
            background-image: 
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
            background-size: 50px 50px;
        }
        .scanlines {
            position: relative;
        }
        .scanlines::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to bottom,
                rgba(255,255,255,0) 50%,
                rgba(255,255,255,0.02) 50%
            );
            background-size: 100% 4px;
            z-index: 10;
            pointer-events: none;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 40s linear infinite;
        }
      `}} />
      <div className="antialiased selection:bg-white selection:text-black">
        {/* Glassmorphic TopNavBar */}
        <nav className="fixed top-0 w-full z-[100] transition-all duration-300">
          <div className="glass-panel mx-auto mt-4 px-12 py-4 max-w-[95%] rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-12">
              <Link className="text-2xl font-black tracking-tighter text-white uppercase" href="/">CODECLASH</Link>
              <div className="hidden lg:flex items-center gap-8">
                <Link className="text-white/60 font-medium hover:text-white transition-all duration-200 text-sm tracking-widest uppercase" href={user ? "/lobby" : "/signup"}>Match</Link>
                <Link className="text-white/60 font-medium hover:text-white transition-all duration-200 text-sm tracking-widest uppercase" href="/leaderboard">Leaderboard</Link>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {user ? (
                <Link href="/dashboard" className="bg-white text-black px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-200 hover:bg-white/90 active:scale-[0.98]">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-white/60 font-bold text-xs uppercase tracking-widest hover:text-white transition-all duration-200">Log in</Link>
                  <Link href="/signup" className="bg-white text-black px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-200 hover:bg-white/90 active:scale-[0.98]">Sign up</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main>
          {/* Technical Monolith Hero */}
          <section className="relative min-h-screen flex items-center px-12 overflow-hidden technical-grid scanlines pt-24">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-20">
              <div className="lg:col-span-8 flex flex-col gap-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/70">Terminal Access Established // Active Node</span>
                </div>
                <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.85] text-white">
                  CODE.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/40 to-white/10">COMPETE.</span><br/>
                  CONQUER.
                </h1>
                <p className="text-xl lg:text-2xl text-white/50 max-w-2xl leading-relaxed font-light">
                  The definitive arena for technical excellence. Real-time competitive coding, algorithmic duels, and global DSA rankings in a zero-latency environment.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 mt-8 mb-16">
                  <Link href={user ? "/lobby" : "/signup"} className="bg-white text-black px-12 py-6 rounded-xl text-xl font-black uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.05] transition-all active:scale-[0.98] text-center">
                    Enter the Arena
                  </Link>
                  <Link href="/leaderboard" className="glass-panel text-white px-12 py-6 rounded-xl text-xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-[0.98] text-center">
                    View Stats
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-4 relative">
                {/* Overlapping Dynamic Elements */}
                <div className="relative group">
                  <div className="aspect-[4/5] glass-panel rounded-2xl overflow-hidden relative border border-white/20 transform rotate-3 transition-transform group-hover:rotate-0 duration-700">
                    <img alt="Abstract digital construct" className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlitkhpsdigE3GSxGEYF0X0EyQoCBIM-i2he3vOL_2fiooxz9-pV632-0NKp5SgAsy4Aw0zaDyYozAI9GnhExBygqqpjosKt9akiDrCR33NjTcGCJb1GomUxdiCticxTIziCV6arl7Cydba-sUoEFDa12dAmBwRS4Yl5uaGrVvbXd_OxR4q5StvkSS2b9m1dzvSqt7lueLC0U7KmZ1HmyVXJDplLboc4tE59tBLZGh85gSMOOSsshj6Cie6mvVTNI_JKLIByeXcA"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                    {/* Floating Glass Cards */}
                    <div className="absolute -top-6 -left-10 glass-panel p-6 rounded-xl shadow-2xl max-w-[240px] transform -rotate-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-white text-sm">terminal</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Runtime Execution</span>
                      </div>
                      <div className="space-y-3">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full w-[88%] bg-white"></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-black text-white/70">
                          <span>OPTIMIZING...</span>
                          <span>0.002ms</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-6 bg-white text-black p-8 rounded-xl shadow-2xl max-w-[220px] transform rotate-3">
                      <span className="text-5xl font-black tracking-tighter italic">2400</span>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-2 opacity-60 leading-none">RANK: GRANDMASTER</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Live Stats Ticker */}
          <section className="bg-white py-6 overflow-hidden relative z-30">
            <div className="flex whitespace-nowrap gap-24 animate-marquee items-center min-w-[200%]">
              <div className="flex items-center gap-24 text-black text-[11px] font-black uppercase tracking-[0.5em]">
                <span>SYSTEM ONLINE // 07:44 UTC</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>12,482 CLASHERS ACTIVE</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>NEW NODE: GRAPH_THEORY_V2</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>LEADERBOARD SYNC COMPLETE</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>SYSTEM ONLINE // 07:44 UTC</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>12,482 CLASHERS ACTIVE</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>NEW NODE: GRAPH_THEORY_V2</span>
              </div>
              <div className="flex items-center gap-24 text-black text-[11px] font-black uppercase tracking-[0.5em]" aria-hidden="true">
                <span>SYSTEM ONLINE // 07:44 UTC</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>12,482 CLASHERS ACTIVE</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>NEW NODE: GRAPH_THEORY_V2</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>LEADERBOARD SYNC COMPLETE</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>SYSTEM ONLINE // 07:44 UTC</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>12,482 CLASHERS ACTIVE</span>
                <span className="h-1.5 w-1.5 bg-black rounded-full"></span>
                <span>NEW NODE: GRAPH_THEORY_V2</span>
              </div>
            </div>
          </section>
          {/* Dynamic Feature Grid */}
          <section className="py-32 px-12 relative overflow-hidden bg-black">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.02] -skew-x-12 transform origin-top"></div>
            <div className="max-w-[1600px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                <div className="max-w-3xl">
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-white/30 mb-4 block">Engineered Superiority</span>
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8">FOR THE 1%.</h2>
                  <p className="text-xl text-white/40 leading-relaxed max-w-xl">We stripped away every pixel of distraction. Pure logic. Zero latency. Maximum impact.</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/20 pb-4 mb-4">Core Specifications</div>
                  <div className="flex gap-4">
                    <div className="w-12 h-1 bg-white"></div>
                    <div className="w-12 h-1 bg-white/20"></div>
                    <div className="w-12 h-1 bg-white/20"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Feature Card 1 */}
                <div className="group relative pt-12">
                  <div className="glass-panel p-12 rounded-2xl flex flex-col gap-12 transition-all duration-500 hover:bg-white/10 hover:-translate-y-4 border-white/10 hover:border-white/30">
                    <div className="h-20 w-20 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white transition-all duration-500">
                      <span className="material-symbols-outlined text-4xl text-white group-hover:text-black">bolt</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-white mb-6">Real-time Duels</h3>
                      <p className="text-white/40 leading-relaxed text-lg">Sub-50ms synchronization across our global edge network. Experience coding at the speed of thought.</p>
                    </div>
                    <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Latency Opt: Enabled</span>
                      <span className="material-symbols-outlined text-white/20 group-hover:text-white">arrow_outward</span>
                    </div>
                  </div>
                </div>
                {/* Feature Card 2 */}
                <div className="group relative">
                  <div className="glass-panel p-12 rounded-2xl flex flex-col gap-12 transition-all duration-500 hover:bg-white/10 hover:-translate-y-4 border-white/10 hover:border-white/30 bg-white/[0.05]">
                    <div className="h-20 w-20 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white transition-all duration-500">
                      <span className="material-symbols-outlined text-4xl text-white group-hover:text-black">analytics</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-white mb-6">ELO Precision</h3>
                      <p className="text-white/40 leading-relaxed text-lg">Sophisticated Bayesian ranking system that considers time complexity, code length, and edge-case coverage.</p>
                    </div>
                    <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Global Sync: Active</span>
                      <span className="material-symbols-outlined text-white/20 group-hover:text-white">arrow_outward</span>
                    </div>
                  </div>
                </div>
                {/* Feature Card 3 */}
                <div className="group relative pt-24">
                  <div className="glass-panel p-12 rounded-2xl flex flex-col gap-12 transition-all duration-500 hover:bg-white/10 hover:-translate-y-4 border-white/10 hover:border-white/30">
                    <div className="h-20 w-20 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white transition-all duration-500">
                      <span className="material-symbols-outlined text-4xl text-white group-hover:text-black">visibility</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-white mb-6">Spectator Matrix</h3>
                      <p className="text-white/40 leading-relaxed text-lg">Watch world-class players resolve complex problems in high-fidelity 4K streaming with real-time HUD overlays.</p>
                    </div>
                    <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Broadcast: Live</span>
                      <span className="material-symbols-outlined text-white/20 group-hover:text-white">arrow_outward</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Final CTA Monolith */}
          <section className="py-40 px-12 bg-black overflow-hidden relative">
            <div className="max-w-[1600px] mx-auto text-center relative z-10">
              <h2 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-12">READY TO CLASH?</h2>
              <div className="flex flex-col items-center gap-12">
                <Link href={user ? "/lobby" : "/signup"} className="bg-white text-black px-16 py-8 rounded-2xl text-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_80px_rgba(255,255,255,0.25)] hover:scale-105 transition-all active:scale-95 group">
                  Enter the Arena 
                  <span className="inline-block transform group-hover:translate-x-2 transition-transform ml-4">→</span>
                </Link>
                <p className="text-white/30 font-black uppercase tracking-[0.5em] text-xs">No distractions. Only code.</p>
              </div>
            </div>
            {/* Decorative Large Text in Background */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[20vw] font-black text-white/[0.02] leading-none select-none pointer-events-none">
              MONOLITH
            </div>
          </section>
        </main>
        {/* Tech-Heavy Footer */}
        <footer className="w-full py-24 px-12 bg-black border-t border-white/10">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
            <div className="md:col-span-6 flex flex-col gap-10">
              <div className="text-3xl font-black text-white tracking-tighter uppercase">CODECLASH</div>
              <div className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase max-w-sm leading-loose">
                Automated technical evaluation platform designed for the extreme competitive programming community.
                <br/><br/>
                © 2026 CODECLASH MONOLITH. ALL LOGIC RESERVED.
              </div>
            </div>
            <div className="md:col-span-6 grid grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="flex flex-col gap-6">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">System</div>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">Docs</Link>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">API</Link>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">Status</Link>
              </div>
              <div className="flex flex-col gap-6">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Arena</div>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">Ranking</Link>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">Legacy</Link>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">Events</Link>
              </div>
              <div className="flex flex-col gap-6">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Connect</div>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">Twitter</Link>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">Discord</Link>
                <Link className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" href="#">Github</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
