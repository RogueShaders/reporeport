#!/usr/bin/env node
const { execSync } = require("child_process");

const status = execSync("git status --porcelain", { encoding: "utf8" });

if (status.trim() === "") {
  console.log("✅ Clean: no changes detected");
} else {
  console.log("⚠️ Changes detected:");
  console.log(status.trimEnd());
}