#!/usr/bin/env node

//Importing modules(built-in)
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function ollamaGenerate(prompt, model = "qwen2.5-coder:latest") {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system:
        "You must follow instructions exactly. Output ONLY what the user asks. No extra text.",
      prompt,
      stream: false,
      options: {
        temperature: 0,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.response;
}


function run(cmd) {
  return execSync(cmd, {encoding: "utf8"}).trim();
}

function todayISO() {
  return new Date().toISOString().slice(0,10);
}

function nowISO() {
  return new Date().toISOString();
}

async function main() {
  try {
    const inside = run("git rev-parse --is-inside-work-tree")
    if (inside !== "true") throw new Error("Not a git repo");
  } catch (err) {
    console.error("❌ RepoReport: not inside a git repository.");
    process.exit(1);
  }

    const args = process.argv.slice(2);
    const useOllama = args.includes("--ai");

    const diff = run("git diff --staged -U10");

    const files = run("git diff --staged --name-only");
    const stat  = run("git diff --staged --stat");

  if (!diff) {
    console.log("⚠️ RepoReport: no staged changes found.");
    console.log("   Stage files first: git add <files>");
    process.exit(0);
  }

    let branch = "unknown";
  try {
    branch = run("git rev-parse --abbrev-ref HEAD");
  } catch (_) {}

    const reportsDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });

    const filename = `${todayISO()}.md`;
  const filepath = path.join(reportsDir, filename);

    const report = `# RepoReport - ${todayISO()}

**Generated:** ${nowISO()}
**Branch:** ${branch}

## Staged diff
\`\`\`diff
${diff}
\`\`\`
`;

  fs.writeFileSync(filepath, report, "utf8");
  console.log("✅ RepoReport saved:", filepath);

  if (useOllama) {
  const trimmedDiff = diff.slice(0, 8000);

  const prompt = `
You are RepoReport: a git commit assistant.

TASK:
Given the changed files + diff summary, decide if the changes should be split into multiple commits.
Then output commit groups with commands.

HARD RULES:
- Output MUST be valid JSON ONLY. No markdown. No extra text.
- Use ONLY files listed in FILES CHANGED. Do NOT invent files.
- Each group must be a meaningful commit.
- If changes should NOT be split, return exactly 1 group.
- Subject MUST start with one of: feat:, fix:, chore:, docs:, refactor:, test:
- Subject must be <= 72 characters
- Subject must describe the actual change (not generic)
- Body must be ONE sentence (<= 120 characters): what changed + why it matters
- Do NOT mention: "DIFF", "below", "prompt", "rules", "feature", "generate a commit message"
- COMMAND must include BOTH -m flags

OUTPUT JSON SHAPE (exact keys):
{
  "needs_split": boolean,
  "groups": [
    {
      "name": string,
      "files": string[],
      "subject": string,
      "body": string,
      "add_command": string,
      "commit_command": string
    }
  ]
}

FILES CHANGED:
${files}

DIFF STAT:
${stat}

DIFF:
${trimmedDiff}

Now output the JSON.
`.trim();

  console.log("\n🤖 Local LLM commit suggestion:\n");
  const reply = await ollamaGenerate(prompt);
  console.log(reply);
}

}

main().catch((err) => {
  console.error("❌ RepoReport failed:", err.message);
  process.exit(1);
});


