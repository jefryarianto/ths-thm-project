#!/usr/bin/env bash
set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }

log "Generating SSH key for CI/CD deployment..."
if [[ -f ~/.ssh/id_ed25519_ci ]]; then
  warn "~/.ssh/id_ed25519_ci already exists. Remove it first to regenerate."
  exit 1
fi

ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_ci -N "" -C "ci-deploy@ths-thm"

log "Adding public key to authorized_keys..."
cat ~/.ssh/id_ed25519_ci.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo ""
echo "========================================"
echo " Add this private key to GitHub Secrets"
echo "========================================"
echo ""
echo " 1. Go to: https://github.com/jefryarianto/ths-thm-project/settings/secrets/actions"
echo " 2. Click 'New repository secret'"
echo " 3. Name:  STAGING_SSH_KEY"
echo " 4. Paste the ENTIRE content below:"
echo ""
cat ~/.ssh/id_ed25519_ci
echo ""
echo "========================================"
echo ""
echo "Also verify these secrets exist:"
echo "  STAGING_HOST   = your VPS IP"
echo "  STAGING_USER   = jefryarianto"
echo "  STAGING_PORT   = 22"
echo "  STAGING_PATH   = /opt/ths-thm"
echo "  STAGING_DOMAIN = api.ths-thm.cloud"
echo ""
log "Done! The private key above is the ONLY copy — save it now."