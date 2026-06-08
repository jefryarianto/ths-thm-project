#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=${1:-/opt/ths-thm}
COMPOSE_FILES="-f infra/docker/docker-compose.yml -f infra/docker/docker-compose.staging.yml"

echo ">>> Pulling latest code..."
cd "$REPO_DIR"
git fetch origin main
git reset --hard origin/main

echo ">>> Building images on VPS (no GHCR needed)..."
docker compose $COMPOSE_FILES build --pull

echo ">>> Restarting services..."
docker compose $COMPOSE_FILES up -d --remove-orphans

echo ">>> Pruning old images..."
docker system prune -f

echo ">>> Checking running containers..."
docker compose $COMPOSE_FILES ps

echo ">>> Done! Check logs with:"
echo "    docker compose $COMPOSE_FILES logs -f"
