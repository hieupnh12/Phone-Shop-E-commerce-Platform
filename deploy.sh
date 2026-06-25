#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-35.221.155.202}"
VPS_USER="${VPS_USER:?Dat VPS_USER trong .env — tren GCP la user ban tao VM, khong phai root}"
REMOTE_DIR="${REMOTE_DIR:-~/group_1}"

echo "==> Deploy group_1 to ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}"

if [ ! -f .env ]; then
  echo "Chua co file .env. Chay: cp .env.example .env && sua gia tri"
  exit 1
fi

echo "==> Upload source code..."
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${REMOTE_DIR}"
rsync -avz --delete \
  --exclude node_modules \
  --exclude target \
  --exclude .git \
  --exclude frontend/build \
  --exclude backend/uploads \
  --exclude backend/logs \
  ./ "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

echo "==> Build and start containers on VPS..."
ssh "${VPS_USER}@${VPS_HOST}" "cd ${REMOTE_DIR} && docker compose down && docker compose up -d --build"

echo "==> Done. App: http://maclenin.io.vn/"
echo "    API:  http://maclenin.io.vn/phoneShop/"
