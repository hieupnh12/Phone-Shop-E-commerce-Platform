#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

USER="${DOCKERHUB_USER:-hieupnh12}"
TAG="${IMAGE_TAG:-latest}"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  USER="${DOCKERHUB_USER:-$USER}"
  TAG="${IMAGE_TAG:-$TAG}"
fi

echo "==> Docker login — user: $USER"
docker login

echo "==> Build..."
docker compose build

echo "==> Push..."
docker push "${USER}/group1-backend:${TAG}"
docker push "${USER}/group1-frontend:${TAG}"

echo "==> Done: ${USER}/group1-backend:${TAG}"
echo "         ${USER}/group1-frontend:${TAG}"
