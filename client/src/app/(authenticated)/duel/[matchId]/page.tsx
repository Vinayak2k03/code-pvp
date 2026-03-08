"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMatchRoom } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { VerdictBadge } from "@/components/verdict-badge";
import { MatchTimer } from "@/components/match-timer";
import { OpponentStatus } from "@/components/opponent-status";
import {
  Play,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/30">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", monacoId: "javascript" },
  { value: "python", label: "Python", monacoId: "python" },
  { value: "cpp", label: "C++", monacoId: "cpp" },
  { value: "java", label: "Java", monacoId: "java" },
];

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
  const [activeTab, setActiveTab] = useState("problem");
  const [isReady, setIsReady] = useState(false);

  // Populate starter code when match data arrives or language changes
  useEffect(() => {
    if (matchData?.problem) {
      const starter =
        (matchData.problem.starterCode as any)?.[language] ||
        `// Write your solution here\n`;
      setCode(starter);
    }
  }, [matchData?.problem?.id, language]);

  // Clear running spinner when run result arrives
  useEffect(() => {
    if (runResult) setRunning(false);
  }, [runResult]);

  // Clear submitting spinner when submission result arrives
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
    setActiveTab("results");
    runCode(code, language);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setActiveTab("results");
    submitCode(code, language);
  };

  if (authLoading || !user) return null;

  // Match was cancelled (opponent disconnected, etc.)
  if (matchCancelled) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center space-y-4">
          <XCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Match Cancelled</h2>
          <p className="text-muted-foreground text-sm">
            {matchCancelled === "opponent_disconnected"
              ? "Your opponent disconnected."
              : "The match was cancelled."}
          </p>
          <Button onClick={() => router.push("/lobby")}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  // Loading state: socket joined but no match data yet
  if (!matchData) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">
          Connecting to match...
        </span>
      </div>
    );
  }

  // Waiting room: match exists but hasn't started yet
  if (!matchStarted && !matchEnded) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Match Found!</h2>
          <p className="text-muted-foreground">
            Opponent:{" "}
            <span className="font-medium text-foreground">
              {matchData.opponent?.username || "..."}
            </span>
          </p>
          {!isReady ? (
            <Button size="lg" onClick={handleReady}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ready
            </Button>
          ) : (
            <Badge variant="secondary" className="gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Waiting for opponent...
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Match ended overlay
  if (matchEnded && matchResult) {
    const isWin = matchResult.winnerId === user.id;
    const isDraw = !matchResult.winnerId;
    const ratingDelta = matchResult.ratingDelta;
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center space-y-4 max-w-sm">
          <div
            className={`text-4xl font-bold ${isWin ? "text-green-500" : isDraw ? "text-yellow-500" : "text-red-500"}`}
          >
            {isWin ? "You Win! 🎉" : isDraw ? "Draw" : "You Lose"}
          </div>
          {ratingDelta !== undefined && (
            <p className="text-muted-foreground">
              Rating:{" "}
              <span
                className={
                  ratingDelta >= 0
                    ? "text-green-500 font-semibold"
                    : "text-red-500 font-semibold"
                }
              >
                {ratingDelta >= 0 ? "+" : ""}
                {ratingDelta}
              </span>
            </p>
          )}
          <Button onClick={() => router.push("/lobby")}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  const problem = matchData.problem;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-3">
          {problem && (
            <>
              <h1 className="font-semibold text-sm">{problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <OpponentStatus
            status={opponentStatus}
            username={matchData.opponent?.username}
          />
          <Separator orientation="vertical" className="h-6" />
          {endTime && <MatchTimer endTime={endTime} />}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Problem & Results */}
        <div className="w-[40%] border-r flex flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <TabsList className="rounded-none border-b w-full justify-start h-10 bg-transparent px-2">
              <TabsTrigger value="problem" className="text-xs">
                Problem
              </TabsTrigger>
              <TabsTrigger value="results" className="text-xs">
                Results
                {runResult && (
                  <span className="ml-1.5 text-[10px]">
                    {runResult.stdout ? "✓" : "✗"}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="submissions" className="text-xs">
                Submissions
                {submissions.length > 0 && (
                  <span className="ml-1.5 text-[10px]">
                    ({submissions.length})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Problem Tab */}
            <TabsContent
              value="problem"
              className="flex-1 overflow-auto p-4 m-0"
            >
              {problem ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">{problem.title}</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {problem.description}
                  </div>
                  {problem.constraints && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Constraints
                      </h3>
                      <div className="whitespace-pre-wrap text-xs bg-muted/50 rounded p-2 font-mono">
                        {problem.constraints}
                      </div>
                    </div>
                  )}
                  {problem.sampleInput && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Example
                      </h3>
                      <div className="bg-muted/50 rounded-md p-3 text-xs font-mono space-y-1">
                        <div>
                          <span className="text-muted-foreground">Input: </span>
                          {problem.sampleInput}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Output:{" "}
                          </span>
                          {problem.sampleOutput}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </TabsContent>

            {/* Results Tab */}
            <TabsContent
              value="results"
              className="flex-1 overflow-auto p-4 m-0"
            >
              {running ? (
                <div className="flex items-center justify-center h-32 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Running...
                  </span>
                </div>
              ) : runResult ? (
                <div className="space-y-3 text-xs font-mono">
                  {runResult.stdout && (
                    <div>
                      <p className="text-muted-foreground font-sans text-[11px] mb-1">
                        Output
                      </p>
                      <div className="bg-muted/50 rounded p-2 whitespace-pre-wrap">
                        {runResult.stdout}
                      </div>
                    </div>
                  )}
                  {runResult.expectedOutput && (
                    <div>
                      <p className="text-muted-foreground font-sans text-[11px] mb-1">
                        Expected
                      </p>
                      <div className="bg-muted/50 rounded p-2 whitespace-pre-wrap">
                        {runResult.expectedOutput}
                      </div>
                    </div>
                  )}
                  {runResult.stderr && (
                    <div>
                      <p className="text-red-500 font-sans text-[11px] mb-1">
                        Error
                      </p>
                      <div className="bg-red-500/10 rounded p-2 whitespace-pre-wrap text-red-500">
                        {runResult.stderr}
                      </div>
                    </div>
                  )}
                  {runResult.time && (
                    <p className="text-muted-foreground font-sans text-[11px]">
                      Time: {runResult.time}s
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center mt-8">
                  Run your code to see output here.
                </p>
              )}
            </TabsContent>

            {/* Submissions Tab */}
            <TabsContent
              value="submissions"
              className="flex-1 overflow-auto p-4 m-0"
            >
              {submitting && (
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Judging...
                </div>
              )}
              {submissions.length > 0 ? (
                <div className="space-y-2">
                  {submissions.map((s: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border rounded-md p-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {s.verdict === "ACCEPTED" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <VerdictBadge verdict={s.verdict} />
                      </div>
                      <span className="text-muted-foreground">
                        {s.passedTestCases}/{s.totalTestCases} passed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center mt-8">
                  No submissions yet.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel — Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRun}
                disabled={running || submitting}
                className="h-7 text-xs"
              >
                {running ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Play className="mr-1.5 h-3 w-3" />
                )}
                Run
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={running || submitting}
                className="h-7 text-xs"
              >
                {submitting ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-3 w-3" />
                )}
                Submit
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language={
                LANGUAGES.find((l) => l.value === language)?.monacoId ||
                "javascript"
              }
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                fontSize: 13,
                lineHeight: 20,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                tabSize: 2,
                automaticLayout: true,
                wordWrap: "on",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

