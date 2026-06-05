# Staging Server Setup Guide

## Prerequisites

- A Linux server (Ubuntu 22.04+ or Debian 12+) with public IP
- Domain name pointing to the server IP (e.g., `staging.ths-thm.example.com`)
- Docker and Docker Compose installed on the server
- GitHub repository with admin access

---

## 1. Server Preparation

### Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version

# Logout and login again for group changes to take effect
exit
```

### Create deploy directory

```bash
sudo mkdir -p /opt/ths-thm
sudo chown $USER:$USER /opt/ths-thm
```

### Clone repository (initial setup)

```bash
git clone git@github.com:YOUR_ORG/ths-thm-project.git /opt/ths-thm
```

---

## 2. SSH Key for GitHub Actions

Generate a deploy key for CI/CD:

```bash
# On the staging server
ssh-keygen -t ed25519 -C "staging-deploy" -f ~/.ssh/staging_deploy_key
cat ~/.ssh/staging_deploy_key.pub
```

### Add to GitHub

1. Go to **Settings → Deploy Keys** in your repository
2. Click **Add deploy key**
3. Title: `Staging Deploy Key`
4. Paste the public key
5. ✅ **Allow write access** (needed for `git push` from CI - though CI only pulls)

### Add private key to GitHub Secrets

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret | Value |
|--------|-------|
| `STAGING_HOST` | Server IP or domain (e.g., `203.0.113.10`) |
| `STAGING_USER` | SSH username (e.g., `deploy` or `ubuntu`) |
| `STAGING_SSH_KEY` | Content of `~/.ssh/staging_deploy_key` (private key) |
| `STAGING_PORT` | SSH port (default: `22`) |
| `STAGING_PATH` | Deploy directory (e.g., `/opt/ths-thm`) |
| `STAGING_DOMAIN` | Domain for health check (e.g., `staging.ths-thm.example.com`) |
| `STAGING_USE_SSL` | Set to `true` to include SSL compose override in CI/CD deploy |

> **Note:** Set `STAGING_USE_SSL` to `true` only after completing SSL setup (Section 3).
> The CI/CD pipeline conditionally includes `docker-compose.ssl.yml` when this secret is `true`.

---

## 3. SSL Certificate (Let's Encrypt)

After DNS points to the server:

```bash
# SSH into the server
ssh deploy@staging.ths-thm.example.com

# Install certbot
sudo apt install -y certbot

# Obtain certificate
sudo certbot certonly --standalone -d staging.ths-thm.example.com

# Certificate files are at:
# /etc/letsencrypt/live/staging.ths-thm.example.com/fullchain.pem
# /etc/letsencrypt/live/staging.ths-thm.example.com/privkey.pem

# Set up auto-renewal
sudo systemctl enable certbot.timer
sudo certbot renew --dry-run
```

Or use the Docker SSL compose approach (if using Docker on the server):

```bash
cd /opt/ths-thm

# Start services with Let's Encrypt
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.staging.yml \
              -f infra/docker/docker-compose.ssl.yml up -d

# Obtain certificate
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.staging.yml \
              -f infra/docker/docker-compose.ssl.yml run --rm \
              certbot certonly --webroot -w /var/www/certbot \
              -d staging.ths-thm.example.com

# Restart Nginx to pick up certs
docker restart ths-thm-nginx
```

---

## 4. Initial Deploy (Manual)

First-time deploy before CI/CD kicks in. Gunakan script yang sudah teruji:

```bash
cd /opt/ths-thm

# Start services
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.staging.yml up -d

# Run initialization script (waits for API, migrates, seeds, verifies)
bash infra/docker/scripts/staging-init.sh
```

Atau jika ingin manual step-by-step:

```bash
cd /opt/ths-thm

# Start services
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.staging.yml up -d

# Wait for API to be ready
echo "Waiting for API..."
until curl -s http://localhost:4000/api/v1/health; do sleep 2; done

# Run migrations and seed
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.staging.yml exec -T api \
              npx prisma migrate deploy

docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.staging.yml exec -T api \
              npx prisma db seed

# Verify (gunting port API langsung, bukan via Nginx)
curl -s http://localhost:4000/api/v1/health
echo "Staging ready at http://localhost"
```

---

## 5. CI/CD Auto-Deploy

Once GitHub secrets are set, every push to `main` branch will:

1. Run all tests (API, web-admin, E2E)
2. Build API + web-admin
3. SSH into server → `git pull` → `docker compose build` → `docker compose up -d`
4. Health check → verify `/api/v1/health` returns 200

### Manual triggers

You can also manually trigger the deploy from GitHub Actions:

1. Go to **Actions** → **Deploy to Staging**
2. Click **Run workflow** → select branch → **Run**

---

## 6. Verification Checklist

- [ ] Server is accessible via SSH
- [ ] Docker and Docker Compose are installed
- [ ] Repository is cloned at `/opt/ths-thm`
- [ ] GitHub secrets are configured (7 secrets)
- [ ] Initial deploy succeeds (migrations + seed)
- [ ] Health endpoint returns 200
- [ ] Dashboard accessible via browser
- [ ] SSL certificate installed (if using HTTPS)
- [ ] CI/CD auto-deploy works (push to main test)
