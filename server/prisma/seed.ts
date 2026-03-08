import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Create test users ────────────────────────────────────────

  const passwordHash = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@example.com" },
      update: {},
      create: {
        username: "alice",
        email: "alice@example.com",
        passwordHash,
        rating: 1500,
        wins: 25,
        losses: 10,
        draws: 2,
      },
    }),
    prisma.user.upsert({
      where: { email: "bob@example.com" },
      update: {},
      create: {
        username: "bob",
        email: "bob@example.com",
        passwordHash,
        rating: 1350,
        wins: 18,
        losses: 15,
        draws: 3,
      },
    }),
    prisma.user.upsert({
      where: { email: "charlie@example.com" },
      update: {},
      create: {
        username: "charlie",
        email: "charlie@example.com",
        passwordHash,
        rating: 1800,
        wins: 40,
        losses: 8,
        draws: 1,
      },
    }),
    prisma.user.upsert({
      where: { email: "diana@example.com" },
      update: {},
      create: {
        username: "diana",
        email: "diana@example.com",
        passwordHash,
        rating: 1100,
        wins: 5,
        losses: 12,
        draws: 0,
      },
    }),
    prisma.user.upsert({
      where: { email: "eve@example.com" },
      update: {},
      create: {
        username: "eve",
        email: "eve@example.com",
        passwordHash,
        rating: 2100,
        wins: 60,
        losses: 5,
        draws: 2,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ─── Create problems ──────────────────────────────────────────

  const problems = await Promise.all([
    prisma.problem.upsert({
      where: { slug: "two-sum" },
      update: {},
      create: {
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "EASY",
        tags: ["arrays", "hash-table"],
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\``,
        constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
        sampleInput: "4\n2 7 11 15\n9",
        sampleOutput: "0 1",
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
}

// Read input
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const n = parseInt(lines[0]);
const nums = lines[1].split(' ').map(Number);
const target = parseInt(lines[2]);
const result = twoSum(nums, target);
console.log(result.join(' '));`,
          python: `from typing import List

def two_sum(nums: List[int], target: int) -> List[int]:
    # Your code here
    pass

# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())
result = two_sum(nums, target)
print(*result)`,
          cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;
    auto result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
          java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`,
        },
      },
    }),
    prisma.problem.upsert({
      where: { slug: "valid-parentheses" },
      update: {},
      create: {
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        difficulty: "EASY",
        tags: ["stack", "string"],
        description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\``,
        constraints: `- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.`,
        sampleInput: "()",
        sampleOutput: "true",
        timeLimit: 1000,
        memoryLimit: 256,
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Your code here
}

const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
console.log(isValid(s));`,
          python: `def is_valid(s: str) -> bool:
    # Your code here
    pass

s = input().strip()
print(str(is_valid(s)).lower())`,
          cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    // Your code here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << endl;
    return 0;
}`,
          java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        System.out.println(isValid(s));
    }
}`,
        },
      },
    }),
    prisma.problem.upsert({
      where: { slug: "longest-substring-without-repeating" },
      update: {},
      create: {
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating",
        difficulty: "MEDIUM",
        tags: ["sliding-window", "hash-table", "string"],
        description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

**Example 1:**
\`\`\`
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
\`\`\`

**Example 2:**
\`\`\`
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
\`\`\`

**Example 3:**
\`\`\`
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
\`\`\``,
        constraints: `- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.`,
        sampleInput: "abcabcbb",
        sampleOutput: "3",
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
    // Your code here
}

const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
console.log(lengthOfLongestSubstring(s));`,
          python: `def length_of_longest_substring(s: str) -> int:
    # Your code here
    pass

s = input().strip()
print(length_of_longest_substring(s))`,
          cpp: `#include <bits/stdc++.h>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Your code here
    return 0;
}

int main() {
    string s;
    getline(cin, s);
    cout << lengthOfLongestSubstring(s) << endl;
    return 0;
}`,
          java: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        System.out.println(lengthOfLongestSubstring(s));
    }
}`,
        },
      },
    }),
    prisma.problem.upsert({
      where: { slug: "merge-k-sorted-lists" },
      update: {},
      create: {
        title: "Merge k Sorted Lists",
        slug: "merge-k-sorted-lists",
        difficulty: "HARD",
        tags: ["linked-list", "heap", "divide-and-conquer"],
        description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

For simplicity, input is given as k arrays. Output the merged sorted array.

**Example 1:**
\`\`\`
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
\`\`\`

**Example 2:**
\`\`\`
Input: lists = []
Output: []
\`\`\`

**Example 3:**
\`\`\`
Input: lists = [[]]
Output: []
\`\`\``,
        constraints: `- k == lists.length
- 0 <= k <= 10^4
- 0 <= lists[i].length <= 500
- -10^4 <= lists[i][j] <= 10^4
- lists[i] is sorted in ascending order.
- The sum of lists[i].length will not exceed 10^4.`,
        sampleInput: "3\n3 1 4 5\n3 1 3 4\n2 2 6",
        sampleOutput: "1 1 2 3 4 4 5 6",
        timeLimit: 3000,
        memoryLimit: 256,
        starterCode: {
          javascript: `/**
 * @param {number[][]} lists
 * @return {number[]}
 */
function mergeKLists(lists) {
    // Your code here
}

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const k = parseInt(lines[0]);
const lists = [];
for (let i = 1; i <= k; i++) {
    const parts = lines[i].split(' ').map(Number);
    lists.push(parts.slice(1));
}
console.log(mergeKLists(lists).join(' '));`,
          python: `from typing import List
import heapq

def merge_k_lists(lists: List[List[int]]) -> List[int]:
    # Your code here
    pass

k = int(input())
lists = []
for _ in range(k):
    parts = list(map(int, input().split()))
    lists.append(parts[1:])
result = merge_k_lists(lists)
print(*result)`,
          cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> mergeKLists(vector<vector<int>>& lists) {
    // Your code here
    return {};
}

int main() {
    int k;
    cin >> k;
    vector<vector<int>> lists(k);
    for (int i = 0; i < k; i++) {
        int n;
        cin >> n;
        lists[i].resize(n);
        for (int j = 0; j < n; j++) cin >> lists[i][j];
    }
    auto result = mergeKLists(lists);
    for (int i = 0; i < result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`,
          java: `import java.util.*;

public class Main {
    public static List<Integer> mergeKLists(List<List<Integer>> lists) {
        // Your code here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int k = sc.nextInt();
        List<List<Integer>> lists = new ArrayList<>();
        for (int i = 0; i < k; i++) {
            int n = sc.nextInt();
            List<Integer> list = new ArrayList<>();
            for (int j = 0; j < n; j++) list.add(sc.nextInt());
            lists.add(list);
        }
        List<Integer> result = mergeKLists(lists);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) sb.append(" ");
            sb.append(result.get(i));
        }
        System.out.println(sb);
    }
}`,
        },
      },
    }),
  ]);

  console.log(`✅ Created ${problems.length} problems`);

  // ─── Create test cases ────────────────────────────────────────

  // Two Sum test cases
  const twoSumProblem = problems[0];
  await prisma.testCase.createMany({
    data: [
      { problemId: twoSumProblem.id, input: "4\n2 7 11 15\n9", output: "0 1", isHidden: false, order: 1 },
      { problemId: twoSumProblem.id, input: "3\n3 2 4\n6", output: "1 2", isHidden: false, order: 2 },
      { problemId: twoSumProblem.id, input: "2\n3 3\n6", output: "0 1", isHidden: true, order: 3 },
      { problemId: twoSumProblem.id, input: "5\n1 5 3 7 2\n8", output: "1 2", isHidden: true, order: 4 },
      { problemId: twoSumProblem.id, input: "4\n-1 -2 -3 -4\n-7", output: "2 3", isHidden: true, order: 5 },
    ],
    skipDuplicates: true,
  });

  // Valid Parentheses test cases
  const validParenProblem = problems[1];
  await prisma.testCase.createMany({
    data: [
      { problemId: validParenProblem.id, input: "()", output: "true", isHidden: false, order: 1 },
      { problemId: validParenProblem.id, input: "()[]{}", output: "true", isHidden: false, order: 2 },
      { problemId: validParenProblem.id, input: "(]", output: "false", isHidden: false, order: 3 },
      { problemId: validParenProblem.id, input: "([{}])", output: "true", isHidden: true, order: 4 },
      { problemId: validParenProblem.id, input: "((()))", output: "true", isHidden: true, order: 5 },
      { problemId: validParenProblem.id, input: "}{", output: "false", isHidden: true, order: 6 },
    ],
    skipDuplicates: true,
  });

  // Longest Substring test cases
  const longestSubProblem = problems[2];
  await prisma.testCase.createMany({
    data: [
      { problemId: longestSubProblem.id, input: "abcabcbb", output: "3", isHidden: false, order: 1 },
      { problemId: longestSubProblem.id, input: "bbbbb", output: "1", isHidden: false, order: 2 },
      { problemId: longestSubProblem.id, input: "pwwkew", output: "3", isHidden: false, order: 3 },
      { problemId: longestSubProblem.id, input: "", output: "0", isHidden: true, order: 4 },
      { problemId: longestSubProblem.id, input: "abcdefg", output: "7", isHidden: true, order: 5 },
      { problemId: longestSubProblem.id, input: "aab", output: "2", isHidden: true, order: 6 },
    ],
    skipDuplicates: true,
  });

  // Merge K Sorted Lists test cases
  const mergeKProblem = problems[3];
  await prisma.testCase.createMany({
    data: [
      { problemId: mergeKProblem.id, input: "3\n3 1 4 5\n3 1 3 4\n2 2 6", output: "1 1 2 3 4 4 5 6", isHidden: false, order: 1 },
      { problemId: mergeKProblem.id, input: "0", output: "", isHidden: false, order: 2 },
      { problemId: mergeKProblem.id, input: "1\n0", output: "", isHidden: true, order: 3 },
      { problemId: mergeKProblem.id, input: "2\n5 1 2 3 4 5\n5 6 7 8 9 10", output: "1 2 3 4 5 6 7 8 9 10", isHidden: true, order: 4 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created test cases");
  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
