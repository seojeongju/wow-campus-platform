# 세션 유지 및 토큰 검증 프로세스 개선 가이드

## 📋 개요

기존의 24시간 고정 만료 시간 JWT 토큰 시스템을 **Refresh Token 패턴**으로 개선하여 보안성과 사용자 경험을 향상시켰습니다.

## 🔄 주요 변경사항

### 1. Access Token + Refresh Token 패턴

- **Access Token**: 15분 만료 (짧은 수명으로 보안 강화)
- **Refresh Token**: 7일 또는 30일 만료 (Remember Me에 따라)
- **자동 갱신**: Access Token 만료 시 Refresh Token으로 자동 갱신

### 2. Remember Me 기능

- 로그인 시 "로그인 상태 유지" 체크박스 선택 가능
- 선택 시: Refresh Token 30일 유지
- 미선택 시: Refresh Token 7일 유지

### 3. 토큰 블랙리스트

- 로그아웃 시 토큰을 블랙리스트에 추가
- 인증 미들웨어에서 블랙리스트 확인
- 무효화된 토큰은 즉시 거부

### 4. 개선된 로그아웃

- 서버 측 토큰 무효화
- 쿠키 명시적 삭제
- Refresh Token 무효화

## 🗄️ 데이터베이스 마이그레이션

### 마이그레이션 실행

```bash
# Cloudflare D1 데이터베이스에 마이그레이션 적용
npx wrangler d1 execute wow-campus-platform-db --file=./migrations/0021_add_refresh_tokens_and_blacklist.sql
```

### 새로 추가된 테이블

#### 1. `refresh_tokens` 테이블
```sql
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  is_revoked INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. `token_blacklist` 테이블
```sql
CREATE TABLE token_blacklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  expires_at DATETIME NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔐 API 엔드포인트 변경사항

### 1. 로그인 (`POST /api/auth/login`)

**요청**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true  // 선택사항
}
```

**응답**:
```json
{
  "success": true,
  "message": "로그인에 성공했습니다!",
  "user": { ... },
  "token": "eyJ...",  // Access Token (15분)
  "refreshToken": "eyJ...",  // Refresh Token (7일 또는 30일)
  "expires_in": 900  // Access Token 만료 시간 (초)
}
```

### 2. 토큰 갱신 (`POST /api/auth/refresh`)

**요청**: 
- Refresh Token은 쿠키에서 자동으로 읽음
- 별도 요청 본문 불필요

**응답**:
```json
{
  "success": true,
  "token": "eyJ...",  // 새 Access Token
  "expires_in": 900
}
```

### 3. 로그아웃 (`POST /api/auth/logout`)

**요청**: 
- Access Token 필요 (Authorization 헤더 또는 쿠키)

**응답**:
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

**동작**:
- Access Token을 블랙리스트에 추가
- Refresh Token 무효화
- 쿠키 삭제

## 💻 클라이언트 측 변경사항

### 자동 토큰 갱신

`getCurrentUser()` 함수가 자동으로 토큰을 갱신합니다:

```javascript
// 토큰이 만료된 경우 자동 갱신
if (payload.exp && Date.now() > payload.exp * 1000) {
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    return await getCurrentUser();
  }
}

// 토큰이 곧 만료되는 경우 (5분 이내) 백그라운드 갱신
if (isTokenExpiringSoon(payload)) {
  refreshAccessToken().catch(err => console.error('백그라운드 토큰 갱신 실패:', err));
}
```

### 로그인 폼

Remember Me 체크박스가 추가되었습니다:

```html
<input type="checkbox" name="rememberMe" />
<span>로그인 상태 유지</span>
```

## 🔒 보안 개선사항

1. **짧은 Access Token 수명**: 15분으로 단축하여 토큰 유출 시 피해 최소화
2. **토큰 블랙리스트**: 로그아웃 시 즉시 토큰 무효화
3. **Refresh Token 회전**: 새 로그인 시 기존 Refresh Token 무효화
4. **HttpOnly 쿠키**: XSS 공격으로부터 토큰 보호
5. **SameSite=Lax**: CSRF 공격 완화

## 📊 성능 고려사항

### DB 조회 최적화

인증 미들웨어에서 매 요청마다:
1. JWT 검증 (서명 확인)
2. 블랙리스트 확인 (DB 조회)
3. 사용자 상태 확인 (DB 조회)

**향후 개선 방안**:
- 사용자 정보 캐싱 (Redis 또는 메모리 캐시)
- 블랙리스트 캐싱
- 배치 처리로 만료된 토큰 정리

## 🧪 테스트 방법

### 1. 로그인 테스트

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","rememberMe":true}'
```

### 2. 토큰 갱신 테스트

```bash
curl -X POST https://your-domain.com/api/auth/refresh \
  -H "Cookie: wowcampus_refresh_token=YOUR_REFRESH_TOKEN" \
  --cookie-jar cookies.txt
```

### 3. 로그아웃 테스트

```bash
curl -X POST https://your-domain.com/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Cookie: wowcampus_token=YOUR_ACCESS_TOKEN"
```

## ⚠️ 주의사항

1. **마이그레이션 필수**: 새 테이블이 없으면 토큰 갱신이 실패합니다.
2. **쿠키 설정**: `Secure` 플래그는 HTTPS에서만 작동합니다.
3. **토큰 정리**: 주기적으로 만료된 토큰을 정리하는 작업을 권장합니다.

## 🔄 롤백 방법

문제 발생 시 이전 버전으로 롤백:

```bash
# Git으로 이전 커밋으로 복원
git checkout <previous-commit-hash>

# 또는 특정 파일만 복원
git checkout <previous-commit-hash> -- src/routes/auth.ts
git checkout <previous-commit-hash> -- src/middleware/auth.ts
git checkout <previous-commit-hash> -- src/utils/auth.ts
```

## 📝 참고 파일

- `src/utils/auth.ts` - JWT 생성/검증, Refresh Token 함수
- `src/routes/auth.ts` - 로그인/로그아웃/갱신 엔드포인트
- `src/middleware/auth.ts` - 인증 미들웨어 (블랙리스트 검증)
- `public/assets/app.js` - 클라이언트 측 자동 갱신 로직
- `migrations/0021_add_refresh_tokens_and_blacklist.sql` - DB 마이그레이션

