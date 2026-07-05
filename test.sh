#!/bin/bash
set -e
BASE="http://localhost:5173"
COOKIE_JAR=/tmp/st-cookies.txt
PASS=0
FAIL=0

ok()   { PASS=$((PASS+1)); echo "  ✅ $1"; }
fail() { FAIL=$((FAIL+1)); echo "  ❌ $1: $2"; }
req() {
    local method=$1 path=$2 data=$3 desc=$4
    local args=(-s -X "$method" -o /tmp/st-resp.txt -w '%{http_code}' -b "$COOKIE_JAR" -c "$COOKIE_JAR")
    if [ -n "$data" ]; then args+=(-H 'Content-Type: application/json' -d "$data"); fi
    local code
    code=$(curl "${args[@]}" "$BASE$path" 2>/dev/null || echo "000")
    local body; body=$(cat /tmp/st-resp.txt 2>/dev/null)
    if [ "$code" = "200" ] || [ "$code" = "204" ]; then
        ok "$desc ($code)"
    else
        fail "$desc" "HTTP $code: $body"
    fi
}

echo "=== Smoke Tests ==="
echo ""

# 1. Ping
req GET /api/ping '' 'Ping'

# 2. Create user
req POST /api/users/create '{"handle":"smoke","name":"Smoke Tester","password":"test123"}' 'Create user'

# 3. Login
req POST /api/users/login '{"handle":"smoke","password":"test123"}' 'Login'

# 4. Get me
req GET /api/users/me '' 'Get me'

# 5. List users
req GET /api/users/list '' 'List users'

# 6. Create character
req POST /api/characters/create '{"name":"Alice","description":"A test character","personality":"Friendly","first_mes":"Hello!","scenario":"Testing"}' 'Create character'

# 7. Get characters
req GET /api/characters/all '' 'Get all characters'

# 8. Save settings
req POST /api/settings/save '{"theme":"dark","language":"zh"}' 'Save settings'

# 9. Get settings
req GET /api/settings/get '' 'Get settings'

# 10. Get CSRF
req GET /csrf-token '' 'CSRF token'

# 11. Extensions discover (stub)
req GET /api/extensions/discover '' 'Extensions discover'

# 12. Extensions install (stub, expects 501)
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"name":"test"}' -b "$COOKIE_JAR" "$BASE/api/extensions/install" 2>/dev/null || echo "000")
if [ "$code" = "501" ]; then
    ok "Extensions install returns 501 ($code)"
else
    fail "Extensions install" "Expected 501, got $code"
fi

# 13. Write secret
req POST /api/secrets/write '{"key":"test_key","value":"test_value"}' 'Write secret'

# 14. Read secret back
req POST /api/secrets/read '{"key":"test_key"}' 'Read secret'

# 15. Change password
req POST /api/users/change-password '{"currentPassword":"test123","newPassword":"newpass456"}' 'Change password'

# 16. Login with new password
req POST /api/users/login '{"handle":"smoke","password":"newpass456"}' 'Login with new password'

# 17. Logout
req POST /api/users/logout '' 'Logout'

# 18. Backups list (stub)
req GET /api/backups/list '' 'Backups list'

# 19. Backups create (stub, expects 501)
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -b "$COOKIE_JAR" "$BASE/api/backups/create" 2>/dev/null || echo "000")
if [ "$code" = "501" ]; then ok "Backups create returns 501 ($code)"; else fail "Backups create" "Expected 501, got $code"; fi

# 20. Data maid report
req POST /api/data-maid/report '{}' 'Data maid report'

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
exit $FAIL
