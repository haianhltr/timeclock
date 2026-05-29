#!/usr/bin/env bash
# Smoke-test a deployed environment by hitting key endpoints with no auth.
# Proves the app started + routing works. Adapted from habit-tracking-1
# for the public-read model — / and /api/list-like-routes should be 200,
# not 307 redirects.
#
# Usage:
#   ./scripts/smoke.sh https://clockin.randomstuffs.org
#
# Exits non-zero on any failed check.

set -u
BASE="${1:-}"
if [ -z "$BASE" ]; then
  echo "usage: $0 <base-url>" >&2
  exit 2
fi
BASE="${BASE%/}"

pass=0
fail=0

check() {
  local name="$1" expected="$2" url="$3"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$actual" = "$expected" ]; then
    printf "  ✓ %-40s %s\n" "$name" "$actual"
    pass=$((pass + 1))
  else
    printf "  ✗ %-40s expected %s, got %s\n" "$name" "$expected" "$actual"
    fail=$((fail + 1))
  fi
}

echo "Smoke-testing $BASE"

# Liveness: /api/health is the shallow check (no DB, no auth).
check "GET /api/health"      200 "$BASE/api/health"
# Body shape — confirm JSON, not an HTML error page.
status=$(curl -s "$BASE/api/health" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p')
if [ "$status" = "ok" ]; then
  printf "  ✓ %-40s status=ok\n" "/api/health body"
  pass=$((pass + 1))
else
  printf "  ✗ %-40s expected status=ok, got '%s'\n" "/api/health body" "$status"
  fail=$((fail + 1))
fi

# Readiness: /api/ready hits the DB. If this fails the app can't serve real requests.
check "GET /api/ready"       200 "$BASE/api/ready"

# Public read: / should render (NOT redirect to /login like habit-tracking-1).
check "GET / (public read)"  200 "$BASE/"

# Login page should render.
check "GET /login"           200 "$BASE/login"

# Unauth WRITE → 401 JSON. Replace with a real write route once it exists.
# Example: check "POST /api/entries (unauth)" 401 "$BASE/api/entries"

echo
echo "passed: $pass · failed: $fail"
[ "$fail" -eq 0 ]
