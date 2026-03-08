// Judge0 Language IDs
export const LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  cpp: 54,         // C++ (GCC 9.2.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  typescript: 74,  // TypeScript
  go: 60,          // Go
  rust: 73,        // Rust
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_MAP);

export const MATCH_DURATION = 30 * 60; // 30 minutes in seconds
export const MATCHMAKING_INTERVAL = 2000; // 2 seconds
export const MATCHMAKING_RATING_RANGE = 100; // ±100 initial range
export const MATCHMAKING_RATING_EXPAND = 50; // Expand by 50 each interval
export const MATCHMAKING_MAX_RANGE = 500; // Maximum rating range

export const ELO_K_FACTOR_DEFAULT = 32;
export const ELO_K_FACTOR_HIGH = 16;
export const ELO_HIGH_RATING_THRESHOLD = 2000;
export const ELO_DEFAULT_RATING = 1200;
