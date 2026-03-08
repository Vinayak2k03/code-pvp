import { env } from "../config/env";
import { LANGUAGE_MAP } from "../config/constants";

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

// Judge0 status IDs
const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

export type Verdict =
  | "PENDING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR";

export interface ExecutionResult {
  verdict: Verdict;
  passedTestCases: number;
  totalTestCases: number;
  executionTime: number | null;
  memoryUsed: number | null;
  tokens: string[];
  error?: string;
}

export class Judge0Service {
  private static baseUrl = env.JUDGE0_API_URL;
  private static apiKey = env.JUDGE0_API_KEY;

  /**
   * Build headers — use RapidAPI headers only when an API key is provided,
   * otherwise talk directly to a local Judge0 CE instance.
   */
  private static headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      // RapidAPI / hosted Judge0
      h["X-RapidAPI-Key"] = this.apiKey;
      h["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
    }

    return h;
  }

  /**
   * Submit batch of test cases to Judge0
   */
  static async submitBatch(
    code: string,
    language: string,
    testCases: { input: string; output: string }[],
    timeLimit: number = 2,
    memoryLimit: number = 256000
  ): Promise<ExecutionResult> {
    const languageId = LANGUAGE_MAP[language];
    if (!languageId) {
      return {
        verdict: "COMPILATION_ERROR",
        passedTestCases: 0,
        totalTestCases: testCases.length,
        executionTime: null,
        memoryUsed: null,
        tokens: [],
        error: `Unsupported language: ${language}`,
      };
    }

    // Encode to base64
    const encode = (str: string) => Buffer.from(str).toString("base64");

    const submissions: Judge0Submission[] = testCases.map((tc) => ({
      source_code: encode(code),
      language_id: languageId,
      stdin: encode(tc.input),
      expected_output: encode(tc.output),
      cpu_time_limit: timeLimit,
      memory_limit: memoryLimit,
    }));

    try {
      // Create batch submission
      const batchUrl = `${this.baseUrl}/submissions/batch?base64_encoded=true`;
      console.log(`[Judge0] POST ${batchUrl} (${submissions.length} submissions)`);

      const createResponse = await fetch(batchUrl, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ submissions }),
      });

      if (!createResponse.ok) {
        const body = await createResponse.text();
        console.error(`[Judge0] Batch submit failed: ${createResponse.status} ${createResponse.statusText}`, body);
        throw new Error(`Judge0 API error: ${createResponse.status}`);
      }

      const tokens: { token: string }[] = (await createResponse.json()) as { token: string }[];
      const tokenList = tokens.map((t) => t.token);

      // Poll for results
      const results = await this.pollResults(tokenList);

      return this.evaluateResults(results, testCases.length, tokenList);
    } catch (error) {
      console.error("Judge0 submission error:", error);
      return {
        verdict: "COMPILATION_ERROR",
        passedTestCases: 0,
        totalTestCases: testCases.length,
        executionTime: null,
        memoryUsed: null,
        tokens: [],
        error: error instanceof Error ? error.message : "Execution failed",
      };
    }
  }

  /**
   * Poll Judge0 for batch results
   */
  private static async pollResults(
    tokens: string[],
    maxAttempts = 20,
    delay = 1500
  ): Promise<Judge0Result[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pollUrl = `${this.baseUrl}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true&fields=token,stdout,stderr,compile_output,message,status,time,memory`;
      const response = await fetch(pollUrl, { headers: this.headers() });

      if (!response.ok) {
        const body = await response.text();
        console.error(`[Judge0] Poll failed: ${response.status} ${response.statusText}`, body);
        throw new Error(`Judge0 poll error: ${response.status}`);
      }

      const data: { submissions: Judge0Result[] } = (await response.json()) as { submissions: Judge0Result[] };
      const allDone = data.submissions.every(
        (s) =>
          s.status.id !== STATUS.IN_QUEUE && s.status.id !== STATUS.PROCESSING
      );

      if (allDone) {
        return data.submissions;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error("Judge0 timeout: results not ready");
  }

  /**
   * Evaluate Judge0 results into a verdict
   */
  private static evaluateResults(
    results: Judge0Result[],
    totalTestCases: number,
    tokens: string[]
  ): ExecutionResult {
    let passed = 0;
    let maxTime = 0;
    let maxMemory = 0;

    for (const result of results) {
      if (result.status.id === STATUS.ACCEPTED) {
        passed++;
      } else if (result.status.id === STATUS.COMPILATION_ERROR) {
        const compileOutput = result.compile_output
          ? Buffer.from(result.compile_output, "base64").toString()
          : "Compilation failed";

        return {
          verdict: "COMPILATION_ERROR",
          passedTestCases: 0,
          totalTestCases,
          executionTime: null,
          memoryUsed: null,
          tokens,
          error: compileOutput,
        };
      }

      if (result.time) {
        maxTime = Math.max(maxTime, parseFloat(result.time) * 1000);
      }
      if (result.memory) {
        maxMemory = Math.max(maxMemory, result.memory);
      }
    }

    if (passed === totalTestCases) {
      return {
        verdict: "ACCEPTED",
        passedTestCases: passed,
        totalTestCases,
        executionTime: Math.round(maxTime),
        memoryUsed: maxMemory,
        tokens,
      };
    }

    // Determine the primary failure reason
    const failedResult = results.find((r) => r.status.id !== STATUS.ACCEPTED);
    let verdict: Verdict = "WRONG_ANSWER";

    if (failedResult) {
      if (failedResult.status.id === STATUS.TIME_LIMIT) {
        verdict = "TIME_LIMIT_EXCEEDED";
      } else if (
        failedResult.status.id >= STATUS.RUNTIME_ERROR_SIGSEGV &&
        failedResult.status.id <= STATUS.RUNTIME_ERROR_OTHER
      ) {
        verdict = "RUNTIME_ERROR";
      }
    }

    return {
      verdict,
      passedTestCases: passed,
      totalTestCases,
      executionTime: Math.round(maxTime),
      memoryUsed: maxMemory,
      tokens,
    };
  }

  /**
   * Run code against sample test cases only (for "Run Code" button)
   */
  static async runCode(
    code: string,
    language: string,
    input: string
  ): Promise<{
    stdout: string;
    stderr: string;
    time: number | null;
    memory: number | null;
    error?: string;
  }> {
    const languageId = LANGUAGE_MAP[language];
    if (!languageId) {
      return { stdout: "", stderr: `Unsupported language: ${language}`, time: null, memory: null };
    }

    const encode = (str: string) => Buffer.from(str).toString("base64");

    try {
      const runUrl = `${this.baseUrl}/submissions?base64_encoded=true&wait=true`;
      console.log(`[Judge0] POST ${runUrl} (language_id=${languageId})`);

      const response = await fetch(runUrl, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          source_code: encode(code),
          language_id: languageId,
          stdin: encode(input),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(`[Judge0] RunCode failed: ${response.status} ${response.statusText}`, body);
        throw new Error(`Judge0 API error: ${response.status}`);
      }

      const result: Judge0Result = (await response.json()) as Judge0Result;

      const stdout = result.stdout
        ? Buffer.from(result.stdout, "base64").toString()
        : "";
      const stderr = result.stderr
        ? Buffer.from(result.stderr, "base64").toString()
        : result.compile_output
          ? Buffer.from(result.compile_output, "base64").toString()
          : "";

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        time: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
        memory: result.memory,
      };
    } catch (error) {
      return {
        stdout: "",
        stderr: error instanceof Error ? error.message : "Execution failed",
        time: null,
        memory: null,
      };
    }
  }
}
