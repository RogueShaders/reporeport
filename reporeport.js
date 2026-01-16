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
    const useOllama = args.includes("--ollama");

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
You are writing a git commit message for the code DIFF.

RULES:
- Subject must start with: feat:, fix:, chore:, docs:, refactor:, test:
- Subject must be <= 72 characters
- Subject must describe the actual code change (not generic)
- Body must be ONE sentence (<= 120 characters): what changed + why it matters
- Do NOT mention: "DIFF", "below", "prompt", "rules", "feature", "generate a commit message"
- Output must be EXACTLY 3 lines and nothing else.
- COMMAND must include BOTH -m flags.

OUTPUT FORMAT (exact):
SUBJECT: <text>
BODY: <text>
COMMAND: git commit -m "<subject>" -m "<body>"

FILES CHANGED:
${files}

DIFF STAT:
${stat}

DIFF START
${trimmedDiff}
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


