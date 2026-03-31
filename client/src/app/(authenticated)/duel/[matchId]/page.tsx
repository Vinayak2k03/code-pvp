"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMatchRoom } from "@/hooks/use-socket";
import {
  Play,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Settings,
  Maximize,
  MemoryStick,
  Timer
} from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#FAF9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">
      <Loader2 className="h-5 w-5 animate-spin opacity-50" />
    </div>
  ),
});

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", monacoId: "javascript", ext: "js" },
  { value: "python", label: "Python", monacoId: "python", ext: "py" },
  { value: "cpp", label: "C++", monacoId: "cpp", ext: "cpp" },
  { value: "java", label: "Java", monacoId: "java", ext: "java" },
];

function CustomMatchTimer({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.floor((endTime - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <span className="text-[10px] font-bold tracking-widest uppercase">
      Live Match: {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

export default function DuelPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    matchData,
    matchStarted,
    endTime,
    opponentStatus,
    submissionResult,
    runResult,
    submissions,
    matchEnded,
    matchResult,
    matchCancelled,
    ready,
    runCode,
    submitCode,
    sendTypingStatus,
  } = useMatchRoom(matchId);

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (matchData?.problem) {
      const starter =
        (matchData.problem.starterCode as any)?.[language] ||
        `// Write your solution here\n`;
      setCode(starter);
    }
  }, [matchData?.problem?.id, language]);

  useEffect(() => {
    if (runResult) setRunning(false);
  }, [runResult]);

  useEffect(() => {
    if (submissionResult) setSubmitting(false);
  }, [submissionResult]);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      setCode(value || "");
      sendTypingStatus("typing");
    },
    [sendTypingStatus]
  );

  const handleReady = () => {
    ready();
    setIsReady(true);
  };

  const handleRun = () => {
    setRunning(true);
    runCode(code, language);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    submitCode(code, language);
  };

  if (authLoading || !user) return null;

  if (matchCancelled) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#FAF9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">
        <XCircle className="h-10 w-10 text-[#FF3333] mb-4" />
        <h2 className="text-xl font-black uppercase tracking-widest text-[#0A0A0A] dark:text-white">Match Cancelled</h2>
        <p className="text-[#5F5E5E] dark:text-[#A1A1A1] text-sm mt-2 font-mono">
          {matchCancelled === "opponent_disconnected"
            ? "ERR: OPPONENT_DISCONNECTED"
            : "ERR: MATCH_CANCELLED"}
        </p>
        <button 
          onClick={() => router.push("/lobby")}
          className="mt-8 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-all active:scale-95"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#FAF9F9] dark:bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A0A0A] dark:text-white opacity-50 mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">
          Establishing Uplink...
        </span>
      </div>
    );
  }

  if (!matchStarted && !matchEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#FAF9F9] dark:bg-[#0A0A0A]">
        <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] p-12 rounded-3xl border border-[#E3E2E2] dark:border-[#1C1B1B] shadow-none text-center flex flex-col items-center">
          <h2 className="text-3xl font-black tracking-tight uppercase">Connection Secured</h2>
          <p className="text-[#5F5E5E] dark:text-[#A1A1A1] mt-4 mb-8 font-mono text-sm">
             Target confirmed: <span className="text-[#0A0A0A] dark:text-white font-bold">{matchData.opponent?.username || "Unknown"}</span>
          </p>
          {!isReady ? (
            <button 
              onClick={handleReady}
              className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] px-10 py-4 rounded-sm text-sm font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-black/20 dark:hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5" /> Initialize
            </button>
          ) : (
             <div className="bg-[#F4F3F3] dark:bg-[#1C1B1B]est px-8 py-4 rounded-sm flex items-center gap-3 text-xs font-bold uppercase tracking-widest w-full justify-center">
              <Loader2 className="h-4 w-4 animate-spin opacity-50" />
              Awaiting Target...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (matchEnded && matchResult) {
    const isWin = matchResult.winnerId === user.id;
    const isDraw = !matchResult.winnerId;
    const ratingDelta = matchResult.ratingDelta;
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#FAF9F9] dark:bg-[#0A0A0A]">
        <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] p-12 rounded-3xl border border-[#E3E2E2] dark:border-[#1C1B1B] shadow-none text-center space-y-6 max-w-sm">
          <h2 className={`text-4xl font-black tracking-tighter uppercase ${isWin ? "text-[#0A0A0A] dark:text-white" : isDraw ? "text-[#0A0A0A] dark:text-white/70" : "text-[#FF3333]"}`}>
            {isWin ? "VICTORY" : isDraw ? "DRAW" : "DEFEAT"}
          </h2>
          {ratingDelta !== undefined && (
            <div className="bg-[#F4F3F3] dark:bg-[#1C1B1B]est p-4 rounded-sm flex items-center justify-between">
              <span className="font-bold text-[10px] uppercase tracking-widest text-[#5F5E5E] dark:text-[#A1A1A1]">Rating Delta</span>
              <span className={`font-mono text-sm font-bold ${ratingDelta >= 0 ? "text-[#0A0A0A] dark:text-white" : "text-[#FF3333]"}`}>
                {ratingDelta >= 0 ? "+" : ""}{ratingDelta}
              </span>
            </div>
          )}
          <button 
            onClick={() => router.push("/lobby")}
            className="w-full bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] px-8 py-4 rounded-sm text-xs font-black uppercase tracking-[0.1em] hover:opacity-80 transition-all active:scale-95"
          >
            Deploy Again
          </button>
        </div>
      </div>
    );
  }

  const problem = matchData.problem;
  const currentLang = LANGUAGES.find(l => l.value === language) || LANGUAGES[0];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#FAF9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white font-body selection:bg-[#0A0A0A] dark:selection:bg-white selection:text-white dark:selection:text-[#0A0A0A]">
      {/* Progress Monolith */}
      <div className="h-[1.5px] w-full bg-[#F4F3F3] dark:bg-[#1C1B1B] absolute top-0 left-0 z-[110]">
         <div className="h-full bg-[#0A0A0A] dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.3)] w-full w-[100%] transition-transform origin-left"></div>
      </div>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 bg-[#FAF9F9] dark:bg-[#0A0A0A] border-b border-[#E3E2E2] dark:border-[#1C1B1B] shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="font-headline font-black text-lg tracking-tighter uppercase">CODECLASH</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#F4F3F3] dark:bg-[#1C1B1B]est rounded-sm">
             <span className="w-2 h-2 rounded-sm bg-[#FF3333] animate-pulse"></span>
             {endTime ? <CustomMatchTimer endTime={endTime} /> : <span className="text-[10px] font-bold tracking-widest uppercase">LIVE</span>}
          </div>
        </div>
        <div className="flex items-center gap-4">
           {/* Memory & Time limitations display stubbed or mapped if exists on problem */}
           <div className="flex items-center gap-1 text-[#5F5E5E] dark:text-[#A1A1A1] text-[11px] font-bold tracking-widest uppercase">
              <MemoryStick className="w-3.5 h-3.5" />
              <span>128MB</span>
           </div>
           <div className="flex items-center gap-1 text-[#5F5E5E] dark:text-[#A1A1A1] text-[11px] font-bold tracking-widest uppercase border-l border-black/10 dark:border-white/10 pl-4">
              <Timer className="w-3.5 h-3.5" />
              <span>250ms</span>
           </div>
           
           <button 
             disabled={submitting || running}
             onClick={handleSubmit}
             className="ml-6 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
           >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit Solution
           </button>
        </div>
      </header>

      {/* Three Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Pane 1: Problem */}
        <section className="w-1/4 bg-[#FAF9F9] dark:bg-[#0A0A0A] flex flex-col border-r border-[#E3E2E2] dark:border-[#1C1B1B] overflow-y-auto custom-scrollbar shrink-0">
           <div className="p-8 space-y-6">
              <div className="space-y-2">
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#0A0A0A] dark:text-white/40">
                    Challenge {problem?.difficulty || "UNKNOWN"}
                 </span>
                 <h2 className="text-2xl font-black tracking-tight leading-tight">{problem?.title || "Loading..."}</h2>
              </div>
              <div className="prose prose-sm font-body text-[#5F5E5E] dark:text-[#A1A1A1] leading-relaxed space-y-4">
                 <div className="whitespace-pre-wrap">{problem?.description}</div>

                 {problem?.sampleInput && (
                   <div className="bg-[#FAF9F9] dark:bg-[#0A0A0A] p-4 rounded-sm border border-[#E3E2E2] dark:border-[#1C1B1B] mt-6">
                      <h4 className="text-[10px] uppercase font-black mb-2 tracking-widest text-[#0A0A0A] dark:text-white">Example</h4>
                      <div className="font-mono text-xs space-y-1">
                         <p><span className="opacity-50">Input:</span> {problem.sampleInput}</p>
                         <p><span className="opacity-50">Output:</span> {problem.sampleOutput}</p>
                      </div>
                   </div>
                 )}

                 {problem?.constraints && (
                   <div className="space-y-2 pt-4">
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[#0A0A0A] dark:text-white">Constraints</h4>
                      <div className="text-xs pl-4 space-y-1 opacity-70 whitespace-pre-wrap font-mono uppercase">
                         {problem.constraints}
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </section>

        {/* Pane 2: Editor */}
        <section className="flex-1 bg-black flex flex-col relative min-w-0">
           {/* Editor Toolbar */}
           <div className="h-10 flex items-center justify-between px-4 bg-[#0A0A0A] dark:bg-white-container border-b border-white/5 shrink-0">
              <div className="flex gap-4 items-center">
                 <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 relative">
                    <span className="w-2 h-2 rounded-sm bg-white/20"></span>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-transparent border-none outline-none focus:ring-0 text-[10px] font-bold text-white/40 tracking-widest uppercase cursor-pointer appearance-none pl-0 pr-4"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.value} value={l.value} className="bg-[#0A0A0A] dark:bg-white-container text-white">{l.label} ({l.ext})</option>
                      ))}
                    </select>
                 </div>
              </div>
              <div className="flex gap-4 items-center">
                 <button 
                   onClick={handleRun}
                   disabled={running || submitting}
                   className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2"
                 >
                   {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                   TEST RUN
                 </button>
                 <Settings className="w-4 h-4 text-white/30 cursor-pointer hover:text-white transition-colors ml-2" />
                 <Maximize className="w-4 h-4 text-white/30 cursor-pointer hover:text-white transition-colors" />
              </div>
           </div>

           {/* Monaco wrapper */}
           <div className="flex-1 relative">
             <MonacoEditor
                height="100%"
                language={currentLang.monacoId}
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  lineHeight: 22,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                  fontFamily: "'JetBrains Mono', 'Menlo', 'Cascadia Code', monospace",
                  fontLigatures: true,
                  tabSize: 4,
                  automaticLayout: true,
                  wordWrap: "on",
                }}
             />
           </div>

           {/* Output Terminal */}
           <div className="h-[30%] bg-[#0A0A0A] dark:bg-white-container p-6 border-t border-white/5 overflow-y-auto custom-scrollbar shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0">
                 <h3 className="text-[10px] uppercase font-black tracking-widest text-white/40">Output Terminal</h3>
                 <span className="text-[10px] text-white/20 font-mono tracking-tighter">
                   {running ? 'Executing...' : submitting ? 'Evaluating...' : 'Ready'}
                 </span>
              </div>
              <div className="font-mono text-xs text-white/60 space-y-2 flex-1">
                 {/* Run Result Output */}
                 {runResult ? (
                    <div className="space-y-3">
                       <p className="text-white dark:text-[#0A0A0A]-fixed-variant">&gt;&gt; Compilation: {runResult.stderr ? 'ERROR' : 'SUCCESS'}</p>
                       {runResult.stdout && (
                         <div className="p-3 bg-black/50 border border-white/10 rounded-sm">
                           <span className="text-white/40 text-[10px] block mb-1 uppercase tracking-widest">Stdout</span>
                           <span className="text-white/80 whitespace-pre-wrap">{runResult.stdout}</span>
                         </div>
                       )}
                       {runResult.stderr && (
                         <div className="p-3 bg-[#FF3333]/10 border border-[#FF3333]/20 rounded-sm">
                           <span className="text-[#FF3333]/70 text-[10px] block mb-1 uppercase tracking-widest">Stderr</span>
                           <span className="text-[#FF3333] whitespace-pre-wrap">{runResult.stderr}</span>
                         </div>
                       )}
                    </div>
                 ) : submissionResult ? (
                    <div className="space-y-3">
                       <p className="text-white dark:text-[#0A0A0A]-fixed-variant">&gt;&gt; Submission Verdict</p>
                       <div className={`p-4 border rounded-sm flex items-center justify-between ${submissionResult.verdict === 'ACCEPTED' ? 'bg-[#003311]/20 border-[#00ff55]/30' : 'bg-[#FF3333]/10 border-[#FF3333]/20'}`}>
                         <span className={`font-bold tracking-widest uppercase ${submissionResult.verdict === 'ACCEPTED' ? 'text-[#00ff55]' : 'text-[#FF3333]'}`}>
                            {submissionResult.verdict}
                         </span>
                         <span className="text-white/50">{submissionResult.passedTestCases} / {submissionResult.totalTestCases} Tests Passed</span>
                       </div>
                    </div>
                 ) : submissions.length > 0 ? (
                    // Show history
                    <div className="opacity-50">
                       <p className="text-white dark:text-[#0A0A0A]-fixed-variant mb-2">&gt;&gt; Previous Submissions</p>
                       {submissions.slice(0, 3).map((s: any, idx: number) => (
                         <p key={idx} className="mb-1 text-[11px] flex justify-between">
                            <span className={s.verdict === 'ACCEPTED' ? 'text-[#00ff55]' : 'text-[#FF3333]'}>[{s.verdict}]</span>
                            <span>{s.passedTestCases}/{s.totalTestCases} passed</span>
                         </p>
                       ))}
                    </div>
                 ) : (
                    <>
                       <p className="text-white dark:text-[#0A0A0A]-fixed-variant">&gt;&gt; Awaiting commands...</p>
                       <p className="text-white/40 italic">// Write code and hit TEST RUN or SUBMIT</p>
                    </>
                 )}
              </div>
           </div>
        </section>

        {/* Pane 3: Right (Leaderboard / Status) */}
        <section className="w-[20%] bg-[#FAF9F9] dark:bg-[#0A0A0A] flex flex-col border-l border-[#E3E2E2] dark:border-[#1C1B1B] shrink-0">
           {/* Leaderboard Section */}
           <div className="flex-1 flex flex-col p-6 overflow-hidden border-b border-[#E3E2E2] dark:border-[#1C1B1B]">
              <h3 className="text-[10px] uppercase font-black tracking-widest mb-4 flex items-center justify-between">
                 Live Status
                 <span className="flex h-2 w-2 relative">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-[#0A0A0A] dark:bg-white opacity-20"></span>
                   <span className="relative inline-flex rounded-sm h-2 w-2 bg-[#0A0A0A] dark:bg-white"></span>
                 </span>
              </h3>
              
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                 {/* Opponent Status */}
                 {matchData?.opponent && (
                   <div className="flex flex-col p-4 bg-[#F4F3F3] dark:bg-[#1C1B1B]est rounded-sm border border-[#E3E2E2] dark:border-[#1C1B1B] opacity-70 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-[#0A0A0A] dark:text-white/40 uppercase">TARGET</span>
                        <div className="flex items-center gap-1.5">
                           <span className={`w-1.5 h-1.5 rounded-sm ${
                             opponentStatus === 'typing' ? 'bg-[#0055ff]' :
                             opponentStatus === 'error' ? 'bg-[#FF3333]' :
                             'bg-gray-400'
                           }`}></span>
                           <span className="text-[9px] font-mono text-[#5F5E5E] dark:text-[#A1A1A1] uppercase">{opponentStatus || 'idle'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-sm bg-[#F4F3F3] dark:bg-[#1C1B1B] border border-[#E3E2E2] dark:border-[#1C1B1B] flex items-center justify-center font-bold font-headline">{matchData.opponent.username.substring(0, 1).toUpperCase()}</div>
                         <span className="text-[12px] font-bold tracking-tight truncate">{matchData.opponent.username}</span>
                      </div>
                   </div>
                 )}

                 {/* Current User */}
                 <div className="flex flex-col p-4 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] rounded-sm shadow-md border-l-4 border-white/20">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-white/50">LOCAL</span>
                       <span className="text-[9px] font-mono opacity-80">{submitting ? 'EVALUATING' : running ? 'COMPILING' : 'ACTIVE'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center font-bold text-white shadow-inner">{user.username.substring(0, 1).toUpperCase()}</div>
                       <span className="text-[12px] font-bold tracking-tight uppercase truncate">You</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Activity Log / Chat Stub */}
           <div className="flex-1 bg-[#FAF9F9] dark:bg-[#141414] flex flex-col p-6 overflow-hidden">
               <h3 className="text-[10px] uppercase font-black tracking-widest mb-4">Activity Log</h3>
               <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1 mb-4 flex flex-col-reverse relative">
                 <div className="space-y-4 flex flex-col-reverse opacity-70 hover:opacity-100 transition-opacity">
                    {!matchStarted && <p className="text-[10px] font-mono text-[#0A0A0A] dark:text-white bg-[#0A0A0A] dark:bg-white/5 p-2 rounded-sm block">&gt;&gt; MATCH_INIT_SEQUENCE</p>}
                    {matchStarted && <p className="text-[10px] font-mono text-[#5F5E5E] dark:text-[#A1A1A1] bg-[#F4F3F3] dark:bg-[#1C1B1B] p-2 rounded-sm block">&gt;&gt; MATCH_STARTED</p>}
                    {submissions.map((s: any, i: number) => (
                       <p key={i} className={`text-[10px] font-mono p-2 rounded-sm block ${s.verdict === 'ACCEPTED' ? 'text-[#00aa33] bg-[#00aa33]/10' : 'text-[#FF3333] bg-[#FF3333]/10'}`}>
                          &gt;&gt; SUBMISSION: {s.verdict} ({s.passedTestCases}/{s.totalTestCases})
                       </p>
                    ))}
                 </div>
               </div>
               <div className="relative">
                  <input 
                    disabled
                    className="w-full bg-[#F4F3F3] dark:bg-[#1C1B1B]est border-none rounded-sm text-[10px] px-4 py-3 placeholder:text-[#5F5E5E] dark:text-[#A1A1A1]/40 uppercase tracking-widest font-bold opacity-50 cursor-not-allowed" 
                    placeholder="COMMS_OFFLINE" 
                    type="text" 
                  />
               </div>
           </div>
        </section>
      </div>
    </div>
  );
}
