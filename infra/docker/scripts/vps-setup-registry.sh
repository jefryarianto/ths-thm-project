#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

DOCKERHUB_USER="${DOCKERHUB_USER:-jefryarianto}"
VPS_USER="${VPS_USER:-jefryarianto}"
REPO_DIR="/opt/ths-thm"
DOMAIN_API="api.ths-thm.cloud"
DOMAIN_ADMIN="admin.ths-thm.cloud"
DOMAIN_TRAEFIK="traefik.ths-thm.cloud"
TAG="${TAG:-latest}"

if [[ "$(id -u)" -ne 0 ]]; then err "Must run as root. Use: sudo bash $0"; fi

COMPOSE_DIR="$REPO_DIR/infra/docker"
TRAEFIK_DIR="$COMPOSE_DIR/traefik"

mkdir -p "$COMPOSE_DIR" "$TRAEFIK_DIR"

log "========================================"
log " THS-THM VPS Setup (Registry Mode)"
log "========================================"

echo ""
log "1/6 — Install Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
if ! docker compose version &> /dev/null; then
  apt-get update -qq && apt-get install -y -qq docker-compose-plugin
fi
systemctl enable --now docker

apt-get install -y -qq curl ufw
ufw default deny incoming; ufw default allow outgoing
ufw allow 22/tcp; ufw allow 80/tcp; ufw allow 443/tcp
ufw --force enable

if grep -q "^$VPS_USER:" /etc/passwd; then
  usermod -aG docker "$VPS_USER" 2>/dev/null || true
else
  useradd -m -s /bin/bash -G docker "$VPS_USER"
fi

echo ""
log "2/6 — DNS check..."
VPS_IP=$(curl -s https://ifconfig.me)
log "VPS IP: $VPS_IP"
for DOMAIN in "$DOMAIN_API" "$DOMAIN_ADMIN" "$DOMAIN_TRAEFIK"; do
  RESOLVED=$(host "$DOMAIN" 2>/dev/null | awk '/has address/{print $NF}' | head -1)
  if [[ -z "$RESOLVED" ]]; then
    warn "$DOMAIN — cannot resolve (install dnsutils?)"
  elif [[ "$RESOLVED" == "$VPS_IP" ]]; then
    log "$DOMAIN → $RESOLVED OK"
  else
    warn "$DOMAIN → $RESOLVED (expected $VPS_IP)"
  fi
done

echo ""
log "3/6 — Docker networks..."
docker network inspect traefik-network &> /dev/null || docker network create traefik-network
docker network inspect ths-thm-network &> /dev/null || docker network create ths-thm-network

echo ""
log "4/6 — Deploy Traefik..."
cat > "$TRAEFIK_DIR/traefik.yml" <<'YAML'
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true
  websecure:
    address: ":443"
certificatesResolvers:
  letsencrypt:
    acme:
      email: jefryarianto@gmail.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
providers:
  docker:
    exposedByDefault: false
    network: traefik-network
api:
  dashboard: true
  insecure: false
log:
  level: INFO
accessLog: {}
YAML

cat > "$TRAEFIK_DIR/docker-compose.yml" <<'YAML'
services:
  traefik:
    image: traefik:v3.7.4
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - traefik_certs:/letsencrypt
    networks:
      - traefik-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`traefik.ths-thm.cloud`)"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls=true"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
      - "traefik.http.routers.dashboard.service=api@internal"
networks:
  traefik-network:
    name: traefik-network
    external: true
volumes:
  traefik_certs:
YAML

cd "$TRAEFIK_DIR"
docker compose up -d
sleep 5

echo ""
log "5/6 — Pull & deploy application..."

cat > "$COMPOSE_DIR/docker-compose.registry.yml" <<YAML
services:
  postgres:
    image: postgres:16-alpine
    container_name: ths-thm-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ths_thm
      POSTGRES_PASSWORD: ths_thm_secret
      POSTGRES_DB: ths_thm_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ths_thm -d ths_thm_db"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 15s
    networks:
      - ths-thm-network

  valkey:
    image: valkey/valkey:8-alpine
    container_name: ths-thm-valkey
    restart: unless-stopped
    volumes:
      - valkey_data:/data
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - ths-thm-network

  minio:
    image: minio/minio:latest
    container_name: ths-thm-minio
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - ths-thm-network

  api:
    image: ${DOCKERHUB_USER}/ths-thm-api:${TAG}
    container_name: ths-thm-api
    restart: unless-stopped
    environment:
      NODE_ENV: staging
      API_PORT: 4000
      DATABASE_URL: "postgresql://ths_thm:ths_thm_secret@postgres:5432/ths_thm_db?schema=public"
      REDIS_URL: "redis://valkey:6379"
      JWT_SECRET: "staging-jwt-secret-change-in-production"
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
      MINIO_BUCKET: ths-thm-docs
      MINIO_USE_SSL: "false"
    depends_on:
      postgres:
        condition: service_healthy
      valkey:
        condition: service_healthy
      minio:
        condition: service_healthy
    networks:
      - ths-thm-network
      - traefik-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(\`api.ths-thm.cloud\`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls=true"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=4000"

  web-admin:
    image: ${DOCKERHUB_USER}/ths-thm-web-admin:${TAG}
    container_name: ths-thm-web-admin
    restart: unless-stopped
    environment:
      NODE_ENV: staging
      NEXT_PUBLIC_APP_NAME: "THS-THM Admin (Staging)"
    depends_on:
      - api
    networks:
      - ths-thm-network
      - traefik-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.admin.rule=Host(\`admin.ths-thm.cloud\`)"
      - "traefik.http.routers.admin.entrypoints=websecure"
      - "traefik.http.routers.admin.tls=true"
      - "traefik.http.routers.admin.tls.certresolver=letsencrypt"
      - "traefik.http.services.admin.loadbalancer.server.port=3000"

volumes:
  postgres_data:
  valkey_data:
  minio_data:

networks:
  ths-thm-network:
  traefik-network:
    external: true
YAML

cd "$COMPOSE_DIR"

export DOCKERHUB_USER TAG
log "Pulling images from Docker Hub..."
docker compose -f docker-compose.registry.yml pull 2>&1 || warn "Pull had issues, continuing..."

log "Starting services..."
docker compose -f docker-compose.registry.yml up -d --remove-orphans

log "Waiting for services to be healthy..."
for i in $(seq 1 24); do
  if docker compose -f docker-compose.registry.yml ps | grep -qE 'unhealthy|starting'; then
    sleep 5
  else
    break
  fi
done
docker compose -f docker-compose.registry.yml ps

echo ""
log "6/6 — Database migrations + seed..."
sleep 5
docker compose -f docker-compose.registry.yml exec -T api npx prisma migrate deploy
docker compose -f docker-compose.registry.yml exec -T api npx prisma db seed || warn "Seed may already exist"

echo ""
log "========================================"
log " Setup Complete!"
log "========================================"
log " Web Admin:  https://$DOMAIN_ADMIN"
log " API Health: https://$DOMAIN_API/api/v1/health"
log " Traefik:    https://$DOMAIN_TRAEFIK"
log " Login:      admin@ths-thm.org / admin123"
log "========================================"