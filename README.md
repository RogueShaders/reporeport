# RepoReport 🧾⚙️

RepoReport is a **CLI tool** that turns your git changes into clean, reusable artifacts:

- ✅ Generates a **daily/checkpoint report** (Markdown)
- ✅ Helps you create **better commits** (without `git commit -m "."`)
- ✅ Optional **local LLM commit suggestions** via Ollama (`--ollama`)

The goal: **ship clean checkpoints + track progress + stay consistent**.

---

## Status (current)

✅ CLI works  
✅ Writes reports (v0.1)  
✅ Local LLM mode works (`--ollama`) — prints a suggested commit command

RepoReport **never auto-commits**. It only prints a command you can copy/paste.

---

## Requirements

- **Node.js 18+**
- **Git**
- (Optional) **Ollama** for local LLM suggestions

Check versions:

```bash
node -v
npm -v
git --version
```
## Install (local dev)
```bash
git clone https://github.com/RogueShaders/reporeport.git
cd reporeport

chmod +x reporeport.js
npm link

reporeport
```
✅ You should see output confirming the CLI runs.

## Usage
 - Generate a report (default)
```bash
git add .
reporeport
```
- This writes a markdown report like:
```css
reports/YYYY-MM-DD.md
```

## Generate a report + local LLM commit suggestion
```bash
git add .
reporeport --ai
```
- RepoReport prints somthing like:
```bash
SUBJECT: chore: tighten local LLM prompt constraints
BODY: Improves commit suggestion reliability by enforcing stricter output rules.
COMMAND: git commit -m "..." -m "..."



