# RepoReport 🧾⚙️

RepoReport is a **CLI tool** that turns your git changes into clean, reusable artifacts:

- ✅ a **checkpoint / daily report** (Markdown)
- ✅ **better commit messages** (instead of `git commit -m "."`)
- ✅ optional “build in public” post drafts (later)

The goal is simple: **ship more cleanly + track progress + share updates without friction.**

---

## Status (current)
✅ CLI scaffold is working.

Right now `reporeport` runs and prints a stub message.

Next milestone (CP1):  
➡️ `reporeport` reads `git diff --staged` and writes a Markdown report into `./reports/YYYY-MM-DD.md`

---

## Features (planned roadmap)

### v0.1 — Report Generation (core)
- Read staged changes: `git diff --staged`
- Create `./reports/`
- Write `./reports/YYYY-MM-DD.md` with:
  - date/time
  - branch
  - raw staged diff

### v0.2 — Commit Suggestions
- Print 3 suggested commit messages
- Rules-based (no AI needed)

### v0.3 — AI Commit Builder (optional)
- `reporeport --ai`
- Sends the diff to an LLM to generate:
  - commit subject + body
  - copy/paste commit command
- **Never auto-commits**
- **Never auto-posts**

---

## Requirements
- Node.js **18+**
- Git installed
- Run inside a git repository

Check versions:

```bash
node -v
npm -v
git --version
