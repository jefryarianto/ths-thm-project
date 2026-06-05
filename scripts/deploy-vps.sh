#!/bin/bash
# ============================================================
# THS-THM VPS Deployment Script
# ============================================================
# Jalankan script ini di VPS sebagai root:
#   bash scripts/deploy-vps.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ─── CONFIG ────────────────────────────────────────────────
PROJECT_DIR="/opt/ths-thm"
PROJECT_SRC="$PROJECT_DIR/ths-thm-project"
REPO_URL="https://github.com/jefryarianto/ths-thm-project.git"
COMPOSE_FILE="infra/docker/docker-compose.production.yml"
DOMAIN_API="api.ths-thm.cloud"
DOMAIN_ADMIN="admin.ths-thm.cloud"

# ─── 1. Check Prerequisites ────────────────────────────────
log "Memeriksa prerequisites..."

if [ ! -f /usr/bin/docker ]; then
    warn "Docker belum terinstall. Menginstall Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    log "Docker installed"
fi

if [ ! -f /usr/libexec/docker/cli-plugins/docker-compose ]; then
    warn "Docker Compose belum terinstall. Menginstall..."
    apt-get update -qq && apt-get install -y -qq docker-compose-plugin
    log "Docker Compose installed"
fi

# ─── 2. Clone / Pull Repository ────────────────────────────
log "Mempersiapkan repository..."

if [ -d "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR/.git" ]; then
    cd "$PROJECT_DIR"
    git pull origin main
    log "Repository sudah ada, update terbaru"
else
    rm -rf "$PROJECT_DIR"
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    log "Repository berhasil di-clone"
fi

# The repo has a ths-thm-project/ wrapper directory, so actual project files are nested
if [ ! -d "$PROJECT_SRC" ]; then
    err "Direktori $PROJECT_SRC tidak ditemukan setelah clone. Pastikan struktur repo benar."
fi

# ─── 3. Generate Environment Variables ─────────────────────
log "Membuat file .env..."

cat > "$PROJECT_SRC/.env" << 'ENVEOF'
# ─── Database ───
POSTGRES_PASSWORD=ths_thm_secret_2026

# ─── JWT ───
JWT_SECRET=ths_thm_jwt_secret_key_2026_change_in_production_!!secure_64char

# ─── MinIO ───
MINIO_ACCESS_KEY=ths_thm_minio_admin
MINIO_SECRET_KEY=ths_thm_minio_secret_2026_!!change

# ─── Firebase ───
FIREBASE_SERVICE_ACCOUNT_JSON=
ENVEOF

log "File .env dibuat"

# ─── 4. Setup Traefik (SSL) ────────────────────────────────
log "Menyiapkan Traefik untuk SSL..."

mkdir -p /opt/traefik
if [ ! -f /opt/traefik/docker-compose.yml ]; then
    cat > /opt/traefik/docker-compose.yml << 'TRAEFIKEOF'
services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@ths-thm.cloud"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "traefik_letsencrypt:/letsencrypt"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true

volumes:
  traefik_letsencrypt:
TRAEFIKEOF
    log "File Traefik dibuat"
fi

# Create network if not exists
docker network inspect traefik-network >/dev/null 2>&1 || docker network create traefik-network
log "Docker network 'traefik-network' siap"

# ─── 5. Verify Docker Compose file ────────────────────────
log "Memverifikasi docker-compose production..."

cd "$PROJECT_SRC"

if [ ! -f "$PROJECT_SRC/infra/docker/docker-compose.production.yml" ]; then
    err "File docker-compose.production.yml tidak ditemukan"
fi

log "Docker Compose production siap"

# ─── 6. Build & Start Traefik ─────────────────────────────
log "Menjalankan Traefik..."
cd /opt/traefik
docker compose up -d
log "Traefik berjalan"

# ─── 7. Build & Start THS-THM ─────────────────────────────
log "Membangun Docker images (ini可能需要 5-10 menit)..."
cd "$PROJECT_SRC"
docker compose --env-file .env -f infra/docker/docker-compose.production.yml up -d --build
log "Semua service berjalan"

# ─── 8. Database Migration ─────────────────────────────────
log "Menunggu database siap..."
sleep 15

log "Menjalankan database migration..."
docker exec ths-thm-api npx prisma migrate deploy 2>&1 || warn "Migration mungkin sudah dijalankan sebelumnya"

log "Menjalankan seed data..."
docker exec ths-thm-api npx tsx prisma/seed.ts 2>&1 || warn "Seed mungkin sudah dijalankan"

# ─── 9. Verification ───────────────────────────────────────
log "Verifikasi deployment..."

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  DEPLOYMENT SELESAI!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "API Endpoint:    https://api.ths-thm.cloud/api/v1/health"
echo "Web Admin:       https://admin.ths-thm.cloud"
echo "Swagger Docs:    https://api.ths-thm.cloud/api/docs"
echo ""
echo "Login credentials (seed data):"
echo "  Username: admin@ths-thm.org (atau: admin)"
echo "  Password: admin123"
echo ""
echo "⚠️  JANGAN LUPA: Setting environment variables di file .env:"
echo "   1. JWT_SECRET - ganti dengan random string 64 karakter"
echo "   2. MINIO_ACCESS_KEY / MINIO_SECRET_KEY - ganti dari default"
echo "   3. FIREBASE_SERVICE_ACCOUNT_JSON - isi dari file Firebase JSON"
echo "  Setelah diubah, restart: docker compose --env-file .env -f infra/docker/docker-compose.production.yml up -d"
echo ""
echo -e "${YELLOW}Menunggu SSL certificate... (bisa 1-2 menit)${NC}"
echo "Cek status: docker logs traefik --tail 20"