# Cloudflare Pages 커스텀 도메인 연결 가이드

## 현재 상황
✅ **DNS 설정 완료**: w-campus.com → wow-campus-platform.pages.dev (CNAME)
❌ **Pages 연결 미완료**: Cloudflare Pages 프로젝트에서 커스텀 도메인 미설정

## 해결 방법 (반드시 필요!)

### 1단계: Cloudflare Pages 대시보드 접속
```
https://dash.cloudflare.com
→ Workers & Pages 메뉴
→ wow-campus-platform 프로젝트 클릭
```

### 2단계: Custom Domains 탭으로 이동
프로젝트 상세 페이지에서:
- 상단 탭 중 **"Custom domains"** 클릭
- 현재 연결된 커스텀 도메인 목록 확인

### 3단계: 커스텀 도메인 추가
만약 `w-campus.com`이 목록에 없다면:

1. **"Set up a custom domain"** 버튼 클릭
2. 도메인 입력: `w-campus.com`
3. **"Continue"** 클릭
4. Cloudflare가 DNS 레코드 확인
5. ✅ 표시가 뜨면 **"Activate domain"** 클릭

### 4단계: www 서브도메인도 추가
같은 방법으로:
1. **"Set up a custom domain"** 버튼 클릭
2. 도메인 입력: `www.w-campus.com`
3. 활성화

### 5단계: SSL 인증서 대기
- Cloudflare가 자동으로 SSL 인증서 발급 (1~2분 소요)
- Status가 **"Active"**로 변경될 때까지 대기

## 확인 방법

### Cloudflare Pages 대시보드에서:
Custom domains 목록에 다음이 표시되어야 함:
```
✅ w-campus.com - Active
✅ www.w-campus.com - Active
```

### 브라우저에서 테스트:
```bash
# 5분 후 다시 시도
curl -I https://w-campus.com
# 예상 결과: HTTP/2 200

# 또는 브라우저에서:
https://w-campus.com
```

## 중요 참고사항

### DNS vs Pages 연결의 차이
- **DNS 설정** (✅ 완료): "w-campus.com이 어디를 가리키는가"
- **Pages 연결** (❌ 필요): "Pages가 이 도메인 요청을 받아들이는가"

둘 다 필요합니다!

### 프로덕션 브랜치 확인
커스텀 도메인 추가 시 다음을 확인:
- **Production branch**: `main`
- 커스텀 도메인이 프로덕션 브랜치를 가리키도록 설정

### 문제 해결
만약 "Domain already exists" 오류가 나온다면:
1. 다른 Cloudflare Pages 프로젝트에서 사용 중일 수 있음
2. 해당 프로젝트에서 먼저 제거 후 다시 추가

## 스크린샷 가이드

추가해야 할 화면 예시:
```
Custom domains
┌─────────────────────────────────────┐
│ Set up a custom domain         [버튼] │
├─────────────────────────────────────┤
│ ✅ w-campus.com        Active       │
│ ✅ www.w-campus.com    Active       │
└─────────────────────────────────────┘
```

## 참고 링크
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- Cloudflare Dashboard: https://dash.cloudflare.com
