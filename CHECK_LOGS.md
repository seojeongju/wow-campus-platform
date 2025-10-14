# 🔍 프로필 저장 오류 디버깅 가이드

## 1. 브라우저 콘솔에서 확인하기

1. **프로필 페이지 접속**
   ```
   https://871c143c.wow-campus-platform.pages.dev/profile
   ```

2. **브라우저 개발자 도구 열기**
   - Windows/Linux: `F12` 또는 `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`

3. **Console 탭으로 이동**

4. **프로필 편집 버튼 클릭**

5. **정보 입력 후 저장 버튼 클릭**

6. **콘솔 로그 확인**
   다음과 같은 로그들이 보일 것입니다:
   ```
   === 프로필 저장 시작 ===
   현재 사용자: {id: 14, email: "wow3d01@wow3d.com", ...}
   토큰 존재 여부: true
   토큰 앞 20자: eyJhbGciOiJIUzI1NiI...
   전송할 프로필 데이터: {...}
   API 요청 시작: POST /api/profile/jobseeker
   응답 상태: 200 OK (또는 오류 상태)
   프로필 저장 응답: {...}
   ```

7. **오류가 있다면 빨간색으로 표시됨**
   ```
   === 프로필 저장 오류 ===
   에러 타입: TypeError
   에러 메시지: Failed to fetch
   전체 에러: {...}
   ```

---

## 2. Network 탭에서 확인하기

1. **개발자 도구의 Network 탭으로 이동**

2. **프로필 저장 시도**

3. **`jobseeker` 요청 찾기**
   - Method: `POST`
   - URL: `/api/profile/jobseeker`

4. **요청 상세 확인**
   - **Headers 탭**: Authorization 헤더가 있는지 확인
   - **Payload 탭**: 전송된 데이터 확인
   - **Response 탭**: 서버 응답 확인

5. **Status Code 확인**
   - `200 OK`: 성공
   - `401 Unauthorized`: 토큰 문제
   - `403 Forbidden`: 권한 문제
   - `500 Internal Server Error`: 서버 오류

---

## 3. Cloudflare 로그 스트리밍 (실시간)

터미널에서 다음 명령어를 실행하면 실시간 로그를 볼 수 있습니다:

```bash
npx wrangler pages deployment tail --project-name wow-campus-platform
```

또는 특정 배포 ID로:

```bash
npx wrangler pages deployment tail --project-name wow-campus-platform --deployment-id 871c143c
```

---

## 4. 예상되는 문제들

### 문제 1: 토큰이 없음
**증상**: "토큰 존재 여부: false"
**원인**: 로그아웃되었거나 토큰이 만료됨
**해결**: 다시 로그인

### 문제 2: CORS 오류
**증상**: "Access to fetch blocked by CORS policy"
**원인**: CORS 설정 문제
**해결**: 백엔드 CORS 설정 수정

### 문제 3: 401 Unauthorized
**증상**: "응답 상태: 401 Unauthorized"
**원인**: 토큰이 만료되었거나 유효하지 않음
**해결**: 다시 로그인

### 문제 4: 500 Internal Server Error
**증상**: "응답 상태: 500 Internal Server Error"
**원인**: 백엔드 코드 오류 (데이터베이스, 쿼리 등)
**해결**: 백엔드 로그 확인 (위의 3번 방법)

### 문제 5: Network Error
**증상**: "에러 타입: TypeError", "Failed to fetch"
**원인**: 네트워크 연결 문제 또는 CORS
**해결**: 네트워크 확인, CORS 설정 확인

---

## 5. 직접 API 테스트

로그인 후 토큰을 얻어서 curl로 테스트:

```bash
# 1. 로그인
curl -X POST "https://871c143c.wow-campus-platform.pages.dev/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wow3d01@wow3d.com","password":"lee2548121!"}' \
  | jq '.token'

# 2. 토큰을 복사한 후 프로필 업데이트
TOKEN="여기에_토큰_붙여넣기"

curl -X POST "https://871c143c.wow-campus-platform.pages.dev/api/profile/jobseeker" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name":"테스트",
    "last_name":"사용자",
    "nationality":"한국",
    "bio":"테스트 바이오"
  }'
```

---

## 6. 제가 확인해야 할 정보

사용자님이 다음 정보를 제공해주시면 정확한 원인을 찾을 수 있습니다:

1. **브라우저 콘솔의 전체 로그** (스크린샷 또는 텍스트)
2. **Network 탭의 요청/응답 상세** (스크린샷)
3. **에러 메시지 전문**
4. **Status Code**

---

## 7. 빠른 테스트

지금 바로 브라우저에서:

1. https://871c143c.wow-campus-platform.pages.dev 접속
2. `F12` 눌러서 콘솔 열기
3. 로그인 (wow3d01@wow3d.com / lee2548121!)
4. 프로필 페이지로 이동
5. 편집 후 저장
6. 콘솔 로그 스크린샷 찍어서 보내주세요!

그러면 정확한 원인을 찾아드리겠습니다! 🔍
