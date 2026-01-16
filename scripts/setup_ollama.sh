#!/usr/bin/env bash
set -e

echo "== RepoReport: Setting up Ollama =="

# Ensure required tools exist
if ! command -v curl >/dev/null 2>&1; then
  echo "curl missing. Install it first: sudo apt install -y curl"
  exit 1
fi

if ! command -v zstd >/dev/null 2>&1; then
  echo "zstd missing. Installing..."
  sudo apt update
  sudo apt install -y zstd
fi

# 1) Install Ollama if missing
if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama not found. Installing..."
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "Ollama already installed."
fi

# 2) Pull a small fast model (good for dev)
MODEL="qwen2.5-coder:latest"
echo "Pulling model: $MODEL"
ollama pull "$MODEL"

echo "✅ Done. Next:"
echo "   Start server:  ollama serve"
echo "   Test:          curl http://localhost:11434/api/generate -d '{\"model\":\"$MODEL\",\"prompt\":\"hi\",\"stream\":false}'"

