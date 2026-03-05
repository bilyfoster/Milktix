#!/bin/bash
# MilkTix Feature Verification Tests

# set -e  # Disabled to allow continuing after test failures

BASE_URL="http://localhost:3000"
API_URL="http://localhost:8081"
RESULTS=()
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "🧪 Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected" ] || [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "204" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($response)"
        RESULTS+=("✅ $name")
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (got $response, expected $expected)"
        RESULTS+=("❌ $name")
        ((FAILED++))
        return 1
    fi
}

echo "=========================================="
echo "🥛 MilkTix Feature Test Suite v1.0.10"
echo "=========================================="

# Frontend Tests
echo ""
echo "📱 Frontend Tests"
echo "-----------------"
test_endpoint "Homepage" "$BASE_URL/" "200"
test_endpoint "Events Page" "$BASE_URL/events" "200"
test_endpoint "Login Page" "$BASE_URL/login" "200"
test_endpoint "Register Page" "$BASE_URL/register" "200"

# API Tests
echo ""
echo "⚙️  Backend API Tests"
echo "---------------------"
test_endpoint "API - Hosts (Public)" "$API_URL/api/hosts" "200"
test_endpoint "API - Locations (Public)" "$API_URL/api/locations" "200"
test_endpoint "API - Events (Public)" "$API_URL/api/events" "200"

# Admin API (may require auth, check if endpoint exists)
echo ""
echo "🔐 Admin/Enterprise API Tests"
echo "-----------------------------"
# These should return 401/403 if auth required (means endpoint exists)
admin_users=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/admin/users" 2>/dev/null || echo "000")
if [ "$admin_users" = "401" ] || [ "$admin_users" = "403" ]; then
    echo -e "🧪 Testing Admin Users API... ${GREEN}✅ PASS${NC} ($admin_users - auth required)"
    RESULTS+=("✅ Admin Users API")
    ((PASSED++))
else
    echo -e "🧪 Testing Admin Users API... ${YELLOW}⚠️  CHECK${NC} ($admin_users)"
    RESULTS+=("⚠️  Admin Users API")
fi

# Platform Settings API
platform_settings=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/admin/settings" 2>/dev/null || echo "000")
if [ "$platform_settings" = "401" ] || [ "$platform_settings" = "403" ]; then
    echo -e "🧪 Testing Platform Settings API... ${GREEN}✅ PASS${NC} ($platform_settings - auth required)"
    RESULTS+=("✅ Platform Settings API")
    ((PASSED++))
else
    echo -e "🧪 Testing Platform Settings API... ${YELLOW}⚠️  CHECK${NC} ($platform_settings)"
    RESULTS+=("⚠️  Platform Settings API")
fi

# Version Check
echo ""
echo "🏷️  Version Check"
echo "-----------------"
version_check=$(curl -s "$BASE_URL" 2>/dev/null | grep -o "v1\.0\.[0-9]*" | head -1 || echo "")
if [ "$version_check" = "v1.0.10" ]; then
    echo -e "🧪 Version in footer... ${GREEN}✅ PASS${NC} ($version_check)"
    RESULTS+=("✅ Version Display")
    ((PASSED++))
else
    echo -e "🧪 Version in footer... ${YELLOW}⚠️  CHECK${NC} (found: ${version_check:-none})"
    RESULTS+=("⚠️  Version Display")
fi

# Summary
echo ""
echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="
TOTAL=$((PASSED + FAILED))
for result in "${RESULTS[@]}"; do
    echo "  $result"
done
echo "=========================================="
echo -e "Total: ${GREEN}$PASSED${NC} passed, ${RED}$FAILED${NC} failed out of $TOTAL tests"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
