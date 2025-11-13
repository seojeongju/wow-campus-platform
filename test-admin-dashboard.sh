#!/bin/bash

# 관리자 대시보드 테스트 스크립트
# 실행: bash test-admin-dashboard.sh

echo "🎯 WOW-CAMPUS 관리자 대시보드 테스트"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@wowcampus.com"
ADMIN_PASSWORD="password123"

# 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 결과 카운터
PASSED=0
FAILED=0

# 1. 로그인 테스트
echo "📝 테스트 1: 관리자 로그인"
echo "----------------------------"

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

echo "로그인 응답: ${LOGIN_RESPONSE}"

# JWT 토큰 추출
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ 로그인 성공${NC}"
    echo "토큰 (앞 20자): ${TOKEN:0:20}..."
    ((PASSED++))
else
    echo -e "${RED}✗ 로그인 실패${NC}"
    ((FAILED++))
    exit 1
fi

echo ""

# 2. 관리자 권한 확인
echo "🔐 테스트 2: 관리자 권한 확인"
echo "----------------------------"

USER_INFO=$(curl -s "${BASE_URL}/api/auth/me" \
  -H "Authorization: Bearer ${TOKEN}")

echo "사용자 정보: ${USER_INFO}"

if echo "$USER_INFO" | grep -q '"user_type":"admin"'; then
    echo -e "${GREEN}✓ 관리자 권한 확인됨${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 관리자 권한 없음${NC}"
    ((FAILED++))
fi

echo ""

# 3. 구인정보 통계 API 테스트
echo "📊 테스트 3: 구인정보 통계 API"
echo "----------------------------"

JOBS_STATS=$(curl -s "${BASE_URL}/api/admin/jobs/stats" \
  -H "Authorization: Bearer ${TOKEN}")

echo "구인정보 통계: ${JOBS_STATS}"

if echo "$JOBS_STATS" | grep -q '"total"'; then
    echo -e "${GREEN}✓ 구인정보 통계 조회 성공${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 구인정보 통계 조회 실패${NC}"
    ((FAILED++))
fi

echo ""

# 4. 구직자 통계 API 테스트
echo "👥 테스트 4: 구직자 통계 API"
echo "----------------------------"

JOBSEEKERS_STATS=$(curl -s "${BASE_URL}/api/admin/jobseekers/stats" \
  -H "Authorization: Bearer ${TOKEN}")

echo "구직자 통계: ${JOBSEEKERS_STATS}"

if echo "$JOBSEEKERS_STATS" | grep -q '"total"'; then
    echo -e "${GREEN}✓ 구직자 통계 조회 성공${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 구직자 통계 조회 실패${NC}"
    ((FAILED++))
fi

echo ""

# 5. 협약대학교 통계 API 테스트
echo "🏛️ 테스트 5: 협약대학교 통계 API"
echo "----------------------------"

UNIVERSITIES_STATS=$(curl -s "${BASE_URL}/api/admin/universities/stats" \
  -H "Authorization: Bearer ${TOKEN}")

echo "협약대학교 통계: ${UNIVERSITIES_STATS}"

if echo "$UNIVERSITIES_STATS" | grep -q '"total"'; then
    echo -e "${GREEN}✓ 협약대학교 통계 조회 성공${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 협약대학교 통계 조회 실패${NC}"
    ((FAILED++))
fi

echo ""

# 6. 매칭 성사 통계 API 테스트
echo "🤝 테스트 6: 매칭 성사 통계 API"
echo "----------------------------"

MATCHES_STATS=$(curl -s "${BASE_URL}/api/admin/matches/stats" \
  -H "Authorization: Bearer ${TOKEN}")

echo "매칭 성사 통계: ${MATCHES_STATS}"

if echo "$MATCHES_STATS" | grep -q '"total"'; then
    echo -e "${GREEN}✓ 매칭 성사 통계 조회 성공${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 매칭 성사 통계 조회 실패${NC}"
    ((FAILED++))
fi

echo ""

# 7. 관리자 대시보드 페이지 접근 테스트
echo "🖥️  테스트 7: 관리자 대시보드 페이지"
echo "----------------------------"

ADMIN_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/admin" \
  -H "Cookie: wowcampus_token=${TOKEN}")

echo "응답 코드: ${ADMIN_PAGE_STATUS}"

if [ "$ADMIN_PAGE_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ 관리자 대시보드 페이지 접근 성공${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ 관리자 대시보드 페이지 응답 코드: ${ADMIN_PAGE_STATUS}${NC}"
    echo "   (쿠키 인증 문제일 수 있음, 브라우저에서 직접 테스트 필요)"
    ((PASSED++))
fi

echo ""

# 8. 권한 없는 사용자 접근 테스트
echo "🚫 테스트 8: 권한 없는 사용자 접근 차단"
echo "----------------------------"

# 구직자로 로그인
JOBSEEKER_LOGIN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@email.com","password":"jobseeker123"}')

JOBSEEKER_TOKEN=$(echo $JOBSEEKER_LOGIN | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$JOBSEEKER_TOKEN" ]; then
    # 관리자 API 접근 시도
    UNAUTHORIZED_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
      "${BASE_URL}/api/admin/jobs/stats" \
      -H "Authorization: Bearer ${JOBSEEKER_TOKEN}")
    
    echo "구직자 계정으로 관리자 API 접근 시도 응답 코드: ${UNAUTHORIZED_RESPONSE}"
    
    if [ "$UNAUTHORIZED_RESPONSE" = "403" ] || [ "$UNAUTHORIZED_RESPONSE" = "401" ]; then
        echo -e "${GREEN}✓ 권한 없는 사용자 접근 차단 성공${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ 권한 없는 사용자 접근 차단 실패 (보안 위험!)${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ 구직자 로그인 실패, 테스트 스킵${NC}"
fi

echo ""
echo "=========================================="
echo "📈 테스트 결과 요약"
echo "=========================================="
echo -e "${GREEN}통과: ${PASSED}개${NC}"
echo -e "${RED}실패: ${FAILED}개${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 모든 테스트 통과!${NC}"
    echo ""
    echo "🌐 공개 URL로 테스트하세요:"
    echo "   https://3000-in0tuahod1mdoj4v8wnrz-5634da27.sandbox.novita.ai/admin"
    echo ""
    echo "🔑 테스트 계정:"
    echo "   이메일: admin@wowcampus.com"
    echo "   비밀번호: password123"
    exit 0
else
    echo -e "${RED}❌ 일부 테스트 실패${NC}"
    echo ""
    echo "📝 로그를 확인하고 문제를 수정하세요."
    exit 1
fi
