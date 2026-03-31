"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Terminal, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(username, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-screen flex flex-col font-body">
      <div className="fixed top-0 left-0 w-full h-1.5 bg-[#F4F3F3] dark:bg-[#1C1B1B] z-50">
        <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/3"></div>
      </div>
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] space-y-12">
          <header className="text-center space-y-4">
            <div className="inline-block">
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none font-headline">CODECLASH</h1>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5F5E5E] dark:text-[#A1A1A1]">Technical_Monolith</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5F5E5E] dark:text-[#A1A1A1]">V1.0.4</span>
              </div>
            </div>
          </header>
          
          <div className="bg-white dark:bg-[#141414] p-10 shadow-[32px_32px_64px_-12px_rgba(95,94,94,0.06)] border border-[#E3E2E2] dark:border-[#1C1B1B] rounded-none">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">System Registration</h2>
                <p className="text-sm text-[#5F5E5E] dark:text-[#A1A1A1]">Create an Operator profile to enter the Arena.</p>
              </div>

              {error && (
                <div className="bg-[#FF3333]/10 border border-[#FF3333]/20 p-3 text-xs text-[#FF3333] font-mono rounded-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button type="button" className="w-full h-12 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center gap-3 hover:opacity-80 active:scale-[0.98] transition-all duration-200">
                  <Terminal className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest font-headline">Sign up with GitHub</span>
                </button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/10 dark:border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="bg-white dark:bg-[#141414] px-4 text-[#5F5E5E] dark:text-[#A1A1A1]">Manual Registration</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] block ml-1">Username</label>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-11 bg-[#FAF9F9] dark:bg-[#0A0A0A] border-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white placeholder:text-black/50 dark:text-white/50 text-sm px-4 rounded-none font-mono" 
                      placeholder="codewizard" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] block ml-1">Operator_ID (Email)</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 bg-[#FAF9F9] dark:bg-[#0A0A0A] border-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white placeholder:text-black/50 dark:text-white/50 text-sm px-4 rounded-none font-mono" 
                      placeholder="username@pvp.io" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] block ml-1">Security_Token (Password)</label>
                    <input 
                      type="password" 
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 bg-[#FAF9F9] dark:bg-[#0A0A0A] border-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white placeholder:text-black/50 dark:text-white/50 text-sm px-4 rounded-none font-mono tracking-widest" 
                      placeholder="••••••••" 
                    />
                    <p className="text-[10px] text-[#5F5E5E] dark:text-[#A1A1A1]/70 mt-1 ml-1 uppercase tracking-widest">MINIMUM 8 CHARACTERS</p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 bg-[#F4F3F3] text-[#0A0A0A] dark:bg-[#1C1B1B] dark:text-white flex items-center justify-center gap-2 hover:bg-[#F4F3F3] dark:bg-[#1C1B1B]est active:scale-[0.98] transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span className="text-xs font-bold uppercase tracking-widest font-headline">Register Profile</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#E3E2E2] dark:border-[#1C1B1B] flex justify-center items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1] mr-2">Already registered?</span>
                <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] dark:text-white hover:text-[#0A0A0A] dark:text-white-fixed transition-colors">
                  Sign in
                </Link>
              </div>
            </form>
          </div>

          <footer className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/40">
              © 2026 CODECLASH // Technical_Monolith_V1
            </p>
          </footer>
        </div>
      </main>

      <div className="fixed bottom-12 right-12 hidden lg:block opacity-10 select-none pointer-events-none">
        <span className="text-[12rem] font-black tracking-tighter text-[#0A0A0A] dark:text-white leading-none font-headline">PVP</span>
      </div>
      <div className="fixed top-12 left-12 space-y-1 hidden xl:block">
        <div className="w-8 h-0.5 bg-[#0A0A0A] dark:bg-white"></div>
        <div className="w-4 h-0.5 bg-[#0A0A0A] dark:bg-white"></div>
        <div className="w-12 h-0.5 bg-[#0A0A0A] dark:bg-white"></div>
      </div>
    </div>
  );
}
