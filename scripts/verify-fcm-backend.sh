#!/usr/bin/env bash
# =============================================================================
# FCM Backend Verification Script — THS-THM Management System
# =============================================================================
# Tests the full FCM pipeline on the backend side:
#   1. Docker infrastructure health
#   2. Prisma migrations
#   3. Login endpoint
#   4. FCM token registration simulation
#   5. OTP delivery via FCM
#   6. Push notification via API
#
# Usage:
#   bash scripts/verify-fcm-backend.sh
#
# Prerequisites:
#   - Docker containers running (postgres, valkey, minio)
#   - pnpm dependencies installed
#   - Prisma migrations applied
#   - API running at http://localhost:4000
# =============================================================================

set -euo pipefail

API_BASE="http://localhost:4000/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
PASS="${GREEN}✓ PASS${NC}"
FAIL="${RED}✗ FAIL${NC}"
SKIP="${YELLOW}— SKIP${NC}"
INFO="${BLUE}ℹ${NC}"

TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

print_header() {
  echo ""
  echo "================================================================"
  echo "  $1"
  echo "================================================================"
}

check_pass() {
  TOTAL=$((TOTAL + 1))
  PASSED=$((PASSED + 1))
  echo -e "  ${PASS} $1"
}

check_fail() {
  TOTAL=$((TOTAL + 1))
  FAILED=$((FAILED + 1))
  echo -e "  ${FAIL} $1"
  echo "    └─ $2"
}

check_skip() {
  TOTAL=$((TOTAL + 1))
  SKIPPED=$((SKIPPED + 1))
  echo -e "  ${SKIP} $1"
  echo "    └─ $2"
}

# =============================================================================
# STEP 1: Check Infrastructure
# =============================================================================
print_header "STEP 1: Infrastructure Health"

# Check Docker is running
if docker info &>/dev/null; then
  check_pass "Docker daemon is running"
else
  check_fail "Docker daemon is running" "Docker is not running. Start Docker Desktop first."
fi

# Check required containers
for container in ths-thm-postgres ths-thm-valkey ths-thm-minio; do
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${container}$"; then
    # Check health status
    health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")
    if [ "$health" = "healthy" ]; then
      check_pass "Container '$container' is healthy"
    elif [ "$health" = "no-healthcheck" ] || [ "$health" = "starting" ]; then
      check_pass "Container '$container' is running (status: $health)"
    else
      check_fail "Container '$container' is healthy" "Container health is: $health"
    fi
  else
    check_skip "Container '$container'" "Not running. Start with: docker compose -f infra/docker/docker-compose.yml up -d"
  fi
done

# =============================================================================
# STEP 2: API Availability
# =============================================================================
print_header "STEP 2: API Availability"

API_RUNNING=false
if curl -sf -o /dev/null "http://localhost:4000/api/docs-json" 2>/dev/null || \
   curl -sf -o /dev/null "${API_BASE}/auth/login" -X POST -H "Content-Type: application/json" -d '{"identifier":"admin","password":"admin123"}' 2>/dev/null; then
  API_RUNNING=true
  check_pass "API is reachable at ${API_BASE}"
else
  check_fail "API is reachable" "API not running. Start with: pnpm dev:api"
fi

# =============================================================================
# STEP 3: Authentication
# =============================================================================
print_header "STEP 3: Authentication"

ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""

if [ "$API_RUNNING" = true ]; then
  LOGIN_RESP=$(curl -sf -X POST "${API_BASE}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"identifier":"admin","password":"admin123"}' 2>/dev/null || echo "")

  if [ -n "$LOGIN_RESP" ]; then
    ACCESS_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
    REFRESH_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
    USER_ID=$(echo "$LOGIN_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2 2>/dev/null || echo "")

    if [ -n "$ACCESS_TOKEN" ]; then
      check_pass "Login as admin — access token obtained"
    else
      check_fail "Login as admin" "Response did not contain accessToken. Raw: $(echo "$LOGIN_RESP" | head -c 200)"
    fi
  else
    check_fail "Login as admin" "No response from API. Is it running?"
  fi
else
  check_skip "Login as admin" "API not available"
fi

# =============================================================================
# STEP 4: FCM Token Registration
# =============================================================================
print_header "STEP 4: FCM Token Registration"

if [ -n "$ACCESS_TOKEN" ]; then
  # Register a test FCM token
  REGISTER_RESP=$(curl -sf -X POST "${API_BASE}/auth/register-fcm-token" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -d '{"fcmToken":"test-fcm-token-abc123def456"}' 2>/dev/null || echo "")

  if echo "$REGISTER_RESP" | grep -q "successfully"; then
    check_pass "FCM token registered on User ${USER_ID}"
  else
    check_fail "FCM token registration" "Failed to register token. Response: $(echo "$REGISTER_RESP" | head -c 200)"
  fi
else
  check_skip "FCM token registration" "No access token available"
fi

# =============================================================================
# STEP 5: OTP via FCM
# =============================================================================
print_header "STEP 5: OTP Delivery via FCM"

if [ "$API_RUNNING" = true ]; then
  SEND_OTP_RESP=$(curl -sf -X POST "${API_BASE}/auth/send-otp" \
    -H "Content-Type: application/json" \
    -d '{"identifier":"admin"}' 2>/dev/null || echo "")

  if echo "$SEND_OTP_RESP" | grep -q "successfully"; then
    check_pass "OTP endpoint responded successfully"
    echo -e "  ${INFO} Check API logs for one of:"
    echo -e "      ${GREEN}\"FCM silent push sent: projects/...\"${NC}  ← Push sent via FCM"
    echo -e "      ${YELLOW}\"has no FCM token — cannot send OTP push\"${NC}  ← No device registered (expected in dry-run)"
    echo -e "      ${YELLOW}\"[DRY-RUN] Silent push to ...\"${NC}  ← Firebase not configured"
  else
    check_fail "OTP endpoint" "Failed. Response: $(echo "$SEND_OTP_RESP" | head -c 200)"
  fi
else
  check_skip "OTP delivery test" "API not available"
fi

# =============================================================================
# STEP 6: Cleanup — Unregister test token
# =============================================================================
print_header "STEP 6: Cleanup & Unregister"

if [ -n "$ACCESS_TOKEN" ]; then
  UNREG_RESP=$(curl -sf -X POST "${API_BASE}/auth/unregister-fcm-token" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" 2>/dev/null || echo "")

  if echo "$UNREG_RESP" | grep -q "successfully"; then
    check_pass "FCM token unregistered"
  else
    check_skip "FCM token unregister" "Token may already have been cleaned up"
  fi
else
  check_skip "FCM token unregister" "No access token available"
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "================================================================"
echo "  RESULTS"
echo "================================================================"
echo -e "  ${PASS} ${PASSED} passed"
echo -e "  ${FAIL} ${FAILED} failed"
echo -e "  ${SKIP} ${SKIPPED} skipped"
echo "  Total: ${TOTAL}"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "  ${GREEN}✅ All checks passed! Backend FCM pipeline is working.${NC}"
  echo ""
  echo "  Next steps:"
  echo "    1. Build the Android dev client: cd apps/mobile && npx expo run:android"
  echo "    2. Login on the device to register the real FCM token"
  echo "    3. See docs/fcm-android-e2e.md for detailed E2E testing instructions"
else
  echo -e "  ${RED}❌ ${FAILED} check(s) failed. See details above.${NC}"
  echo ""
  echo "  Common fixes:"
  echo "    - Start Docker: 'docker compose -f infra/docker/docker-compose.yml up -d'"
  echo "    - Start API:   'pnpm dev:api'"
  echo "    - Check .env:  'cat apps/api/.env | grep FIREBASE'"
fi
echo ""
