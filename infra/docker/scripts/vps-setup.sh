#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

VPS_USER="${VPS_USER:-jefryarianto}"
REPO_DIR="/opt/ths-thm"
REPO_URL="https://github.com/jefryarianto/ths-thm-project.git"
DOMAIN_API="api.ths-thm.cloud"
DOMAIN_ADMIN="admin.ths-thm.cloud"
DOMAIN_TRAEFIK="traefik.ths-thm.cloud"

log "========================================"
log " THS-THM VPS Setup (from scratch)"
log "========================================"
log "User:     $VPS_USER"
log "Repo:     $REPO_DIR"
log "Domains:  $DOMAIN_API, $DOMAIN_ADMIN"
log "========================================"

if [[ "$(id -u)" -ne 0 ]]; then
  err "Must run as root. Use: sudo bash $0"
fi

echo ""
log "Phase 1/5 — Installing system packages..."

apt-get update -qq
apt-get install -y -qq ca-certificates curl git ufw

if ! command -v docker &> /dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
else
  log "Docker already installed"
fi

if ! docker compose version &> /dev/null; then
  log "Installing docker-compose plugin..."
  apt-get install -y -qq docker-compose-plugin
fi

log "Enable + start Docker..."
systemctl enable --now docker

log "Setup firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
log "Phase 2/5 — DNS check..."

VPS_IP=$(curl -s https://ifconfig.me || curl -s https://icanhazip.com)
log "VPS public IP: $VPS_IP"

for DOMAIN in "$DOMAIN_API" "$DOMAIN_ADMIN" "$DOMAIN_TRAEFIK"; do
  RESOLVED=$(dig +short "$DOMAIN" A 2>/dev/null || nslookup "$DOMAIN" 2>/dev/null | awk '/Address: /{print $2}' | tail -1)
  if [[ -z "$RESOLVED" ]]; then
    warn "Cannot resolve $DOMAIN. Install dnsutils: apt-get install -y dnsutils"
    warn "Make sure $DOMAIN DNS A record points to $VPS_IP before continuing"
  elif [[ "$RESOLVED" == "$VPS_IP" ]]; then
    log "$DOMAIN → $RESOLVED OK"
  else
    warn "$DOMAIN → $RESOLVED (expected $VPS_IP). Update your DNS A record."
  fi
done

echo ""
log "Phase 3/5 — Deploy Traefik (reverse proxy + Let's Encrypt)..."

if grep -q "^$VPS_USER:" /etc/passwd; then
  usermod -aG docker "$VPS_USER" 2>/dev/null || true
  log "Added $VPS_USER to docker group"
else
  useradd -m -s /bin/bash -G docker "$VPS_USER"
  log "Created user $VPS_USER"
fi

docker network inspect traefik-network &> /dev/null || docker network create traefik-network
docker network inspect ths-thm-network &> /dev/null || docker network create ths-thm-network

TRAEFIK_DIR="$REPO_DIR/infra/docker/traefik"
if [[ -d "$REPO_DIR" ]]; then
  cd "$REPO_DIR"; git fetch origin main; git reset --hard origin/main
else
  git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$TRAEFIK_DIR"
docker compose up -d
sleep 5
docker compose ps

echo ""
log "Phase 4/5 — Deploy application stack..."

COMPOSE_FILES="-f $REPO_DIR/infra/docker/docker-compose.yml -f $REPO_DIR/infra/docker/docker-compose.staging.yml"
cd "$REPO_DIR"

log "Building images (this takes a few minutes)..."
docker compose $COMPOSE_FILES build --pull 2>&1 | tail -5

log "Starting services..."
docker compose $COMPOSE_FILES up -d --remove-orphans

log "Waiting for services to be healthy..."
for i in $(seq 1 30); do
  if docker compose $COMPOSE_FILES ps | grep -q 'unhealthy\|starting'; then
    sleep 5
  else
    break
  fi
done

docker compose $COMPOSE_FILES ps

echo ""
log "Phase 5/5 — Database migrations + seed..."

sleep 5
log "Running Prisma migrations..."
docker compose $COMPOSE_FILES exec -T api npx prisma migrate deploy

log "Seeding database..."
docker compose $COMPOSE_FILES exec -T api npx prisma db seed || warn "Seed may have already been applied, continuing..."

echo ""
log "========================================"
log " Health Checks"
log "========================================"

sleep 5

check_url() {
  local URL="$1"
  local LABEL="$2"
  local CODE
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 "$URL" 2>/dev/null || echo "000")
  if [[ "$CODE" == "200" ]]; then
    log "$LABEL → $URL ($CODE OK)"
  else
    warn "$LABEL → $URL (HTTP $CODE — may need a moment for TLS certificate)"
  fi
}

check_url "https://$DOMAIN_API/api/v1/health" "API Health"
check_url "https://$DOMAIN_ADMIN" "Web Admin"
check_url "https://$DOMAIN_TRAEFIK" "Traefik Dashboard"

echo ""
log "========================================"
log " Setup Complete!"
log "========================================"
log ""
log " URL:"
log "   Web Admin:      https://$DOMAIN_ADMIN"
log "   API Health:     https://$DOMAIN_API/api/v1/health"
log "   Traefik:        https://$DOMAIN_TRAEFIK"
log ""
log " Credentials:"
log "   Admin Login:    admin@ths-thm.org / admin123"
log ""
log " Manage:"
log "   cd $REPO_DIR"
log "   docker compose $COMPOSE_FILES ps"
log "   docker compose $COMPOSE_FILES logs -f [service]"
log ""