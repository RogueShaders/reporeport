#!/usr/bin/env node

//Importing modules(built-in)
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function ollamaGenerate(prompt, model = "llama3.2:1b") {
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

    const diff = run("git diff --staged");
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
    Generate a git commit message for these staged changes.

Rules:
- SUBJECT must start with one of: feat:, fix:, chore:, docs:, refactor:, test:
- SUBJECT must be <= 72 chars
- BODY must explain WHAT changed and WHY (not repeating the subject)
- COMMAND must be copy/paste safe

Output EXACTLY this format:

SUBJECT: ...
BODY: ...
COMMAND: git commit -m "<subject>" -m "<body>"


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


