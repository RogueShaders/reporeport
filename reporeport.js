#!/usr/bin/env node

//Importing modules(built-in)
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(cmd) {
  return execSync(cmd, {encoding: "utf8"}).trim();
}

function todayISO() {
  return new Date().toISOString().slice(0,10);
}

function nowISO() {
  return new Date().toISOString();
}

function main() {
  try {
    const inside = run("git rev-parse --is-inside-work-tree")
    if (inside !== "true") throw new Error("Not a git repo");
  } catch (err) {
    console.error("❌ RepoReport: not inside a git repository.");
    process.exit(1);
  }
  
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
}

main();


