# SSL/HTTPS Setup — THS-THM Production Deployment

## Overview

For production deployment, all traffic should be encrypted via HTTPS. This guide covers two approaches:

1. **Let's Encrypt + Certbot** (recommended for self-hosted / VPS)
2. **Reverse proxy with SSL termination** (Cloudflare, Nginx Proxy Manager, etc.)

---

## 1. Let's Encrypt + Certbot (Self-Hosted)

### Prerequisites
- Domain name pointing to your server's public IP
- Port 80 (HTTP) and 443 (HTTPS) open in firewall
- Nginx running on the server

### Step 1: Use Docker SSL Compose (recommended)

This project includes pre-configured SSL files:

| File | Purpose |
|------|---------|
| `infra/docker/nginx.ssl.conf` | HTTPS Nginx config with SSL, HTTP→HTTPS redirect, and proxy rules |
| `infra/docker/docker-compose.ssl.yml` | Docker override that adds certbot container and SSL volumes |

Deploy with:

```bash
# Start services with SSL
cd /opt/ths-thm
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.ssl.yml up -d

# Obtain SSL certificate (first time only)
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.ssl.yml run --rm \
              certbot certonly --webroot -w /var/www/certbot \
              -d admin.ths-thm.example.com -d api.ths-thm.example.com

# Restart Nginx to load new certificate
docker restart ths-thm-nginx
```

### Step 2: Manual Certbot (alternative)

If not using Docker Compose SSL:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

**Obtain certificate:**
```bash
sudo certbot --nginx -d admin.ths-thm.example.com -d api.ths-thm.example.com
```

Certbot will:
1. Verify domain ownership via HTTP challenge
2. Obtain certificate from Let's Encrypt
3. Auto-configure Nginx for HTTPS
4. Set up auto-renewal via systemd timer

### Step 3: Verify Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# With Docker:
docker logs ths-thm-certbot  # certbot auto-renews every 12h
```

### Step 4: Reference Nginx SSL Config

After obtaining certificates:

```bash
# Copy the SSL Nginx config and replace domains
cp infra/docker/nginx.ssl.conf /etc/nginx/conf.d/default.conf
# Edit domains in the file:
sed -i 's/example.com/your-actual-domain.com/g' /etc/nginx/conf.d/default.conf

# Or mount it directly with Docker:
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.ssl.yml up -d
```

See `infra/docker/nginx.ssl.conf` for the full config. It handles:
- **Single-domain with path routing**: `https://admin.example.com/` → web-admin, `/api/` → API
- **Separate subdomains**: `https://admin.example.com/` → web-admin, `https://api.example.com/` → API
- HTTP→HTTPS redirect (301)
- Modern SSL ciphers (TLSv1.2 + TLSv1.3) with security headers
- `/api/` → `/api/v1/` path rewrite (NestJS globalPrefix)
- WebSocket support for Next.js HMR

---

## 2. Cloudflare SSL (Proxy Mode)

For simpler SSL management, use Cloudflare's proxy (orange cloud):

### Setup Steps
1. Add your domain to Cloudflare
2. Set DNS records:
   - `admin` → `A` → `YOUR_SERVER_IP` (Proxied ☁️)
   - `api` → `A` → `YOUR_SERVER_IP` (Proxied ☁️)
3. In Cloudflare SSL/TLS settings:
   - Set SSL to **Full (strict)**
   - Enable **Always Use HTTPS**
   - Enable **Automatic HTTPS Rewrites**

### Nginx Config for Cloudflare

```nginx
# Cloudflare sends HTTPS requests over HTTP to origin
# The real client IP is in CF-Connecting-IP header

server {
    listen 80;
    server_name admin.ths-thm.example.com api.ths-thm.example.com;

    # Only allow Cloudflare IPs (optional)
    # include /etc/nginx/cloudflare-ips.conf;

    real_ip_header CF-Connecting-IP;
    real_ip_recursive on;

    # ... rest of proxy config ...
}
```

---

## 3. Docker with Nginx Proxy Manager

For a GUI-based approach, use [Nginx Proxy Manager](https://nginxproxymanager.com/):

```yaml
# docker-compose.ssl.yml (add to your stack)
version: '3.8'
services:
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "81:81"  # Admin UI
    volumes:
      - nginx_proxy_data:/data
      - nginx_proxy_letsencrypt:/etc/letsencrypt

volumes:
  nginx_proxy_data:
  nginx_proxy_letsencrypt:
```

Then access `http://YOUR_SERVER_IP:81` to set up:
- SSL certificates via Let's Encrypt (built-in)
- Proxy hosts pointing to your services
- Auto-renewal

---

## 4. Environment Updates for HTTPS

After setting up SSL, update these environment variables:

### API (`apps/api/.env` or Docker env)
```env
# Update CORS to allow HTTPS origins
CORS_ORIGIN=https://admin.ths-thm.example.com

# Trust proxy when behind reverse proxy
TRUST_PROXY=1
```

### Web-admin (`apps/web-admin/.env` or Docker env)
```env
# Update API URL to HTTPS
NEXT_PUBLIC_API_URL=https://api.ths-thm.example.com

# Update app name (optional)
NEXT_PUBLIC_APP_NAME=THS-THM Admin
```

---

## 5. Verification Checklist

- [ ] Certificate valid (`openssl s_client -connect admin.ths-thm.example.com:443 -servername admin.ths-thm.example.com`)
- [ ] HTTP→HTTPS redirect works (301)
- [ ] HSTS headers present
- [ ] No mixed content warnings (all resources load over HTTPS)
- [ ] API calls succeed over HTTPS
- [ ] WebSocket connections work (if used)
- [ ] Certificate auto-renewal configured
- [ ] Firewall allows port 443
