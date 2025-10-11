# 🚀 새 창 개발 시작 - 인증 시스템 체크리스트

## ⚡ **5분 빠른 검증** (새 창에서 첫 번째로 할 것)

### **1. 프로덕션 서비스 상태 확인** (30초)
```bash
# 메인 사이트 접속 확인
curl -s -o /dev/null -w "Main: %{http_code}\n" "https://37b7f44e.wow-campus-platform.pages.dev/"
# 예상: Main: 200

# 인증 API 상태 확인  
curl -s -X POST "https://37b7f44e.wow-campus-platform.pages.dev/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"quicktest@test.com","password":"123456","confirmPassword":"123456","name":"퀵테스트","user_type":"jobseeker","location":"서울"}' \
  -w "Register: %{http_code}\n" | tail -1
# 예상: Register: 201 (성공) 또는 409 (이미 존재)
```

### **2. 로컬 개발 환경 복구** (3분)
```bash
# 프로젝트 클론 및 설정
cd /home/user/webapp
git clone https://github.com/seojeongju/wow-campus-platform.git
cd wow-campus-platform  
git checkout genspark_ai_developer

# 의존성 설치 및 빌드
npm install && npm run build

# PM2 서비스 시작
pm2 start ecosystem.config.cjs
```

### **3. 로컬 인증 시스템 검증** (1분)
```bash
# 로컬 서비스 상태 확인
curl -s -o /dev/null -w "Local: %{http_code}\n" "http://localhost:3000/"

# 로컬 인증 API 테스트
curl -s -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"local@test.com","password":"123456","confirmPassword":"123456","name":"로컬테스트","user_type":"jobseeker","location":"서울"}' \
  -w "LocalAuth: %{http_code}\n" | tail -1
# 예상: LocalAuth: 201 또는 409
```

---

## 🔍 **상세 검증 (문제 발생 시)**

### **A. 프로덕션 환경 완전 테스트**
```bash
# 실행: bash <(curl -s https://raw.githubusercontent.com/seojeongju/wow-campus-platform/genspark_ai_developer/test_auth.sh)
# 또는 수동으로:

echo "🔐 프로덕션 인증 시스템 테스트"
PROD_URL="https://37b7f44e.wow-campus-platform.pages.dev"

# 1. 회원가입 테스트
UNIQUE_EMAIL="test$(date +%s)@test.com"
echo "Testing registration with: $UNIQUE_EMAIL"
curl -X POST "$PROD_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$UNIQUE_EMAIL\",\"password\":\"123456\",\"confirmPassword\":\"123456\",\"name\":\"테스트$(date +%s)\",\"user_type\":\"jobseeker\",\"location\":\"서울\"}"

# 2. 기존 사용자 로그인 테스트
echo -e "\nTesting login..."
LOGIN_RESULT=$(curl -s -X POST "$PROD_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}')
echo $LOGIN_RESULT

# 3. JWT 토큰 추출 및 테스트
if [[ "$LOGIN_RESULT" == *"token"* ]]; then
  TOKEN=$(echo "$LOGIN_RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo -e "\nTesting protected API with token..."
  curl -X GET "$PROD_URL/api/jobseekers" \
    -H "Authorization: Bearer $TOKEN"
fi
```

### **B. D1 데이터베이스 상태 확인**
```bash
cd /home/user/webapp/wow-campus-platform

# wrangler.jsonc 설정 확인
cat wrangler.jsonc | grep -A 5 d1_databases

# D1 데이터베이스 목록 확인
export CLOUDFLARE_API_TOKEN="4R-EJC8j3SlbPNc48vZlvH447ICGNiGRzsSI4bS4"
export CLOUDFLARE_ACCOUNT_ID="85c8e953bdefb825af5374f0d66ca5dc"
npx wrangler d1 list

# 데이터베이스 테이블 확인
npx wrangler d1 execute wow-campus-platform-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 🚨 **문제 해결 가이드**

### **문제 1: API 404 오류**
```
# 증상: /api/auth/* 엔드포인트에서 404
# 해결:
cd /home/user/webapp/wow-campus-platform
npm run build
pm2 restart all

# 프로덕션 재배포 (필요시)
npx wrangler pages deploy dist --project-name wow-campus-platform
```

### **문제 2: Database connection failed**
```  
# 증상: 500 오류 또는 DB 연결 실패
# 해결:
# 1. 환경변수 확인
echo $CLOUDFLARE_ACCOUNT_ID
echo $CLOUDFLARE_API_TOKEN

# 2. D1 바인딩 재확인
npx wrangler pages deployment list --project-name wow-campus-platform

# 3. 로컬 DB 초기화 (필요시)
npx wrangler d1 execute wow-campus-platform-db --local --file=seed.sql
```

### **문제 3: JWT 토큰 오류**
```
# 증상: "Invalid token" 또는 인증 실패  
# 해결:
# 1. 토큰 형식 확인 (3개 점으로 구분되어야 함)
echo $TOKEN | cut -d'.' -f1,2,3

# 2. 새 토큰 생성 테스트
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}'

# 3. 토큰 디코딩 (https://jwt.io 사용)
```

---

## 📋 **성공 지표**

새 창에서 이 체크리스트를 통과하면 인증 시스템이 완벽하게 작동합니다:

### **✅ 프로덕션 환경**:
- 메인 페이지: HTTP 200
- 회원가입 API: HTTP 201 또는 409  
- 로그인 API: HTTP 200 + JWT 토큰
- 보호된 API: HTTP 200 (토큰 인증)

### **✅ 로컬 환경**:
- PM2 서비스: online 상태
- 로컬 API: 프로덕션과 동일한 응답
- 빌드 파일: dist/ 디렉토리 존재

### **✅ 데이터베이스**:
- D1 연결: 정상
- 테이블: users, jobseeker_profiles, jobs, companies 존재
- 데이터: 기존 사용자 및 구인정보 존재

---

## 🎯 **즉시 사용 가능한 테스트 데이터**

새 창에서 바로 사용할 수 있는 검증된 테스트 데이터:

### **기존 사용자 (로그인 테스트용)**:
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

### **새 사용자 등록 템플릿**:
```json
{
  "email": "새로운이메일@test.com",
  "password": "123456",
  "confirmPassword": "123456", 
  "name": "테스트 사용자",
  "user_type": "jobseeker",
  "location": "서울"
}
```

---

**🎉 이 체크리스트를 따르면 새 창에서도 인증 시스템 문제없이 개발을 이어갈 수 있습니다!**

**📌 문제 발생 시**: `AUTHENTICATION_VERIFICATION_GUIDE.md` 참조