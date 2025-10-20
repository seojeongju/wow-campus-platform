# w-campus.com 커스텀 도메인 설정 가이드

## 현재 상태
- ✅ **작동 중**: https://61d4dc6d.wow-campus-platform.pages.dev
- ❌ **404 에러**: https://w-campus.com

## 해결 방법

### 1. Cloudflare Pages 대시보드 접속
1. https://dash.cloudflare.com 로그인
2. **Workers & Pages** 메뉴 선택
3. **wow-campus-platform** 프로젝트 선택

### 2. 커스텀 도메인 추가
1. **Custom domains** 탭 클릭
2. **Set up a custom domain** 버튼 클릭
3. 도메인 입력: `w-campus.com`
4. **Continue** 클릭

### 3. DNS 설정 확인
Cloudflare가 자동으로 다음 레코드를 추가합니다:
- **CNAME 레코드**: `w-campus.com` → `wow-campus-platform.pages.dev`
- **CNAME 레코드**: `www.w-campus.com` → `wow-campus-platform.pages.dev`

### 4. SSL/TLS 설정
1. **SSL/TLS** 탭으로 이동
2. 암호화 모드: **Full (strict)** 선택
3. **Always Use HTTPS** 활성화

### 5. 배포 브랜치 확인
커스텀 도메인이 올바른 브랜치(main)를 가리키는지 확인:
- Production branch: `main`
- Production URL: `https://61d4dc6d.wow-campus-platform.pages.dev`

## DNS 전파 대기
DNS 변경사항이 전파되는 데 5~10분 정도 소요될 수 있습니다.

## 확인 방법
```bash
# DNS 레코드 확인
dig w-campus.com
nslookup w-campus.com

# HTTP 상태 확인
curl -I https://w-campus.com
```

## 문제 해결
만약 계속 404가 나온다면:
1. Cloudflare Pages에서 커스텀 도메인이 **Active** 상태인지 확인
2. DNS가 올바르게 설정되었는지 확인 (CNAME)
3. 프로젝트가 올바른 브랜치(main)에 배포되었는지 확인
4. 5~10분 후 다시 시도 (DNS 전파 시간)

## 참고 문서
- https://developers.cloudflare.com/pages/configuration/custom-domains/
