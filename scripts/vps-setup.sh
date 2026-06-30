#!/usr/bin/env bash
# Chay tren VPS (Ubuntu/Debian) lan dau: bash scripts/vps-setup.sh
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Cai Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "==> Cai Docker Compose plugin..."
  apt-get update
  apt-get install -y docker-compose-plugin
fi

mkdir -p /opt/group_1
echo "==> Docker san sang. Upload code vao /opt/group_1 roi chay:"
echo "    cd /opt/group_1"
echo "    cp .env.example .env   # sua gia tri"
echo "    docker compose up -d --build"
