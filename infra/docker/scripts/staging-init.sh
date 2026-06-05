#!/bin/bash
# Staging initialization script
# Run this after starting the staging services for the first time:
#   docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.staging.yml up -d
#   bash infra/docker/scripts/staging-init.sh

set -e

echo "=== THS-THM Staging Initialization ==="

# Wait for API to be ready
echo "Waiting for API to be ready..."
until curl -s http://localhost:4000/api/v1/health > /dev/null 2>&1; do
  sleep 2
done
echo "API is ready!"

# Run Prisma migrations
echo "Running database migrations..."
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.staging.yml exec -T api npx prisma migrate deploy
echo "Migrations applied!"

# Seed database
echo "Seeding database..."
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.staging.yml exec -T api npx prisma db seed
echo "Database seeded!"

# Verify
echo "Verifying setup..."
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.staging.yml ps

echo ""
echo "=== Staging Ready! ==="
echo "Access: http://localhost"
echo "API:    http://localhost/api"
echo "Docs:   http://localhost/docs"
echo "MinIO:  http://localhost:9001 (admin:minioadmin)"
echo ""
echo "Login: admin / admin123"
