# 로그인 세션 유지 정책 검토 보고서

**작성일**: 2026-01-03  
**검토 대상**: WOW-CAMPUS 플랫폼 인증 및 세션 관리 시스템

---

## 📋 요약

현재 시스템은 **JWT(JSON Web Token) 기반 인증**을 사용하며, **24시간 고정 만료 시간**을 적용하고 있습니다. 자동 토큰 갱신 메커니즘은 없으며, 만료 시 재로그인이 필요합니다.

---

## 🔐 인증 메커니즘

### 1. 토큰 생성 및 만료 시간

**위치**: `src/utils/auth.ts` (37-62줄)

```typescript
const tokenPayload = {
  ...payload,
  iat: now,
  exp: now + (24 * 60 * 60), // 24시간 (86,400초)
};
```

- **만료 시간**: **24시간** (고정)
- **토큰 타입**: JWT (HS256 알고리즘)
- **페이로드 정보**:
  - `userId`: 사용자 ID
  - `email`: 이메일
  - `userType`: 사용자 유형 (company/jobseeker/agent)
  - `name`: 이름
  - `loginAt`: 로그인 시간
  - `iat`: 발급 시간
  - `exp`: 만료 시간

### 2. 쿠키 설정

**위치**: `src/routes/auth.ts` (243-245줄, 416-418줄)

```typescript
c.header('Set-Cookie', 
  `wowcampus_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
);
```

**쿠키 속성**:
- ✅ **HttpOnly**: JavaScript 접근 불가 (XSS 공격 방지)
- ✅ **Secure**: HTTPS에서만 전송 (프로덕션 환경)
- ✅ **SameSite=Lax**: CSRF 공격 완화
- ✅ **Path=/**: 전체 경로에서 사용 가능
- ⏰ **Max-Age=86400**: 24시간 (86,400초)

**쿠키와 JWT 만료 시간 일치**: ✅ 쿠키와 JWT 토큰 모두 24시간으로 동일하게 설정됨

---

## 💾 토큰 저장 방식

### 서버 측
- **HttpOnly 쿠키**: 브라우저가 자동으로 관리
- **쿠키 이름**: `wowcampus_token`

### 클라이언트 측
- **localStorage**: `wowcampus_token` (API 요청용)
- **localStorage**: `wowcampus_user` (사용자 정보 캐시)

**이중 저장 이유**:
- 쿠키: 서버 사이드 렌더링 및 페이지 네비게이션 시 자동 전송
- localStorage: 클라이언트 사이드 JavaScript에서 API 호출 시 사용

---

## 🔍 토큰 검증 프로세스

### 서버 측 검증

**위치**: `src/middleware/auth.ts` (10-58줄)

1. **토큰 추출 우선순위**:
   - 1순위: `Authorization: Bearer <token>` 헤더
   - 2순위: `wowcampus_token` 쿠키

2. **검증 단계**:
   ```typescript
   // 1. JWT 서명 검증
   const payload = await verifyJWT(token, jwtSecret);
   
   // 2. 토큰 만료 확인 (verifyJWT 내부)
   if (payload.exp < Math.floor(Date.now() / 1000)) {
     throw new Error('Token expired');
   }
   
   // 3. 사용자 존재 및 상태 확인
   const user = await c.env.DB.prepare(
     'SELECT id, email, name, user_type, status FROM users WHERE id = ? AND status = ?'
   ).bind(payload.userId, 'approved').first();
   ```

3. **매 요청마다 DB 조회**: 사용자 상태 확인을 위해 매 요청 시 데이터베이스 조회 수행

### 클라이언트 측 검증

**위치**: `public/assets/app.js` (2678-2723줄), `public/assets/js/common.js` (24-72줄)

```javascript
// 토큰 만료 확인
if (payload.exp && Date.now() > payload.exp * 1000) {
  localStorage.removeItem('wowcampus_token');
  localStorage.removeItem('wowcampus_user');
  return null;
}
```

- 클라이언트에서도 만료 시간 확인
- 만료된 토큰은 자동으로 제거

---

## ⚠️ 현재 정책의 특징

### ✅ 장점

1. **보안성**:
   - HttpOnly 쿠키로 XSS 공격 방지
   - Secure 플래그로 HTTPS 강제
   - SameSite=Lax로 CSRF 공격 완화
   - JWT 서명 검증으로 토큰 변조 방지

2. **단순성**:
   - 명확한 만료 시간 (24시간)
   - 복잡한 세션 관리 불필요
   - 서버 상태 저장 불필요 (Stateless)

3. **확장성**:
   - 서버 간 세션 공유 불필요
   - 마이크로서비스 아키텍처에 적합

### ⚠️ 제한사항

1. **자동 갱신 없음**:
   - 토큰 만료 시 자동 갱신 메커니즘 없음
   - 사용자는 24시간 후 재로그인 필요
   - 장시간 작업 중 갑작스러운 로그아웃 가능

2. **고정 만료 시간**:
   - "Remember Me" 기능 없음
   - 모든 사용자에게 동일한 24시간 적용
   - 사용자 선택권 없음

3. **서버 측 세션 무효화 불가**:
   - 로그아웃 시 클라이언트 측에서만 토큰 제거
   - 서버 측 토큰 블랙리스트 없음
   - 토큰이 유출되면 만료될 때까지 유효

4. **매 요청 DB 조회**:
   - 인증 미들웨어에서 매 요청마다 DB 조회
   - 성능에 영향 가능 (캐싱 없음)

5. **이중 저장 관리**:
   - 쿠키와 localStorage 동기화 필요
   - 로그아웃 시 둘 다 제거해야 함

---

## 🔄 로그아웃 프로세스

**위치**: `src/routes/auth.ts` (632-637줄), `public/assets/app.js` (835-850줄)

### 서버 측
```typescript
auth.post('/logout', authMiddleware, async (c) => {
  return c.json({
    success: true,
    message: 'Logged out successfully'
  });
});
```

**문제점**: 
- ❌ 서버 측에서 토큰 무효화 없음
- ❌ 쿠키 삭제 명령 없음
- ❌ 단순히 성공 응답만 반환

### 클라이언트 측
```javascript
async function handleLogout() {
  localStorage.removeItem('wowcampus_token');
  localStorage.removeItem('wowcampus_user');
  // 쿠키는 브라우저가 자동으로 관리하지만 명시적 삭제 없음
  window.location.href = '/home';
}
```

**문제점**:
- ❌ HttpOnly 쿠키는 JavaScript로 삭제 불가
- ❌ 서버에서 쿠키 삭제 명령 필요

---

## 📊 세션 유지 정책 요약

| 항목 | 현재 정책 | 비고 |
|------|----------|------|
| **인증 방식** | JWT (HS256) | Stateless |
| **토큰 만료 시간** | 24시간 (고정) | 86,400초 |
| **쿠키 만료 시간** | 24시간 (고정) | 86,400초 |
| **자동 갱신** | ❌ 없음 | 만료 시 재로그인 필요 |
| **Remember Me** | ❌ 없음 | 모든 사용자 동일 정책 |
| **서버 측 세션** | ❌ 없음 | Stateless 아키텍처 |
| **토큰 무효화** | ❌ 없음 | 로그아웃 시에도 토큰 유효 |
| **DB 조회 빈도** | 매 요청 | 사용자 상태 확인 |
| **보안 수준** | ⭐⭐⭐⭐ 높음 | HttpOnly, Secure, SameSite |

---

## 🎯 개선 제안

### 1. 토큰 자동 갱신 (Refresh Token)

**현재**: Access Token만 사용 (24시간 만료)  
**제안**: Access Token + Refresh Token 패턴

- Access Token: 15분 (짧은 만료 시간)
- Refresh Token: 7일 또는 30일 (긴 만료 시간)
- Access Token 만료 시 Refresh Token으로 자동 갱신

**장점**:
- 사용자 경험 개선 (자동 갱신)
- 보안 강화 (짧은 Access Token 수명)

### 2. Remember Me 기능

**현재**: 모든 사용자 24시간 고정  
**제안**: 사용자 선택에 따른 만료 시간

- 일반 로그인: 24시간
- Remember Me: 7일 또는 30일

### 3. 서버 측 토큰 무효화

**현재**: 로그아웃 시 클라이언트만 제거  
**제안**: 토큰 블랙리스트 또는 Redis 기반 세션 관리

- 로그아웃 시 토큰을 블랙리스트에 추가
- 인증 미들웨어에서 블랙리스트 확인

### 4. 성능 최적화

**현재**: 매 요청마다 DB 조회  
**제안**: 캐싱 도입

- 사용자 정보를 Redis 또는 메모리 캐시에 저장
- TTL 설정으로 자동 만료

### 5. 로그아웃 개선

**현재**: 서버에서 쿠키 삭제 없음  
**제안**: 명시적 쿠키 삭제

```typescript
auth.post('/logout', authMiddleware, async (c) => {
  // 쿠키 삭제 명령
  c.header('Set-Cookie', 
    'wowcampus_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
  );
  return c.json({ success: true });
});
```

---

## 📝 결론

현재 세션 유지 정책은 **보안성과 단순성**에 중점을 둔 설계입니다. JWT 기반 Stateless 인증으로 확장성은 좋지만, **사용자 경험** 측면에서 개선 여지가 있습니다.

**주요 개선 필요 사항**:
1. ✅ 자동 토큰 갱신 메커니즘
2. ✅ Remember Me 기능
3. ✅ 서버 측 토큰 무효화
4. ✅ 로그아웃 시 쿠키 삭제

**현재 상태**: 프로덕션 사용 가능하나, 장기적으로 개선 권장

---

## 📚 참고 파일

- `src/routes/auth.ts` - 로그인/로그아웃 엔드포인트
- `src/middleware/auth.ts` - 인증 미들웨어
- `src/utils/auth.ts` - JWT 생성/검증 유틸리티
- `public/assets/app.js` - 클라이언트 측 토큰 관리

