# 🌐 외부 도메인 연결 가이드 (w-campus.com)

**도메인**: w-campus.com  
**Cloudflare Pages 프로젝트**: wow-campus-platform  
**작성일**: 2025-10-18

---

## 📋 사전 준비 사항

### 필요한 정보
- ✅ 도메인 이름: `w-campus.com`
- ✅ Cloudflare Account ID: `85c8e953bdefb825af5374f0d66ca5dc`
- ✅ Cloudflare Pages 프로젝트: `wow-campus-platform`
- ✅ 현재 배포 URL: `https://356dd41a.wow-campus-platform.pages.dev`

### 필요한 접근 권한
- Cloudflare 대시보드 접근 권한
- 도메인 등록 업체 (레지스트라) 접근 권한

---

## 🚀 Step 1: 도메인을 Cloudflare에 추가

### 1-1. Cloudflare 대시보드 로그인
```
1. https://dash.cloudflare.com/ 접속
2. 로그인
```

### 1-2. 도메인 추가
```
1. 대시보드에서 "Add a Site" 버튼 클릭
2. 도메인 입력: w-campus.com
3. "Add site" 클릭
4. 플랜 선택: Free (무료) 선택
5. "Continue" 클릭
```

### 1-3. DNS 레코드 스캔 대기
```
Cloudflare가 기존 DNS 레코드를 자동으로 스캔합니다.
(약 60초 소요)
```

---

## 🔧 Step 2: 네임서버 변경 (중요!)

### 2-1. Cloudflare 네임서버 확인
Cloudflare가 제공하는 네임서버 2개를 확인하세요:
```
예시:
ns1.cloudflare.com
ns2.cloudflare.com

(실제 값은 Cloudflare 대시보드에서 확인)
```

### 2-2. 도메인 등록 업체에서 네임서버 변경

#### 가비아(Gabia)인 경우:
```
1. https://www.gabia.com 로그인
2. My가비아 → 서비스 관리
3. 도메인 관리 → w-campus.com 선택
4. "네임서버 설정" 클릭
5. "호스팅 네임서버" 선택
6. Cloudflare 네임서버 2개 입력:
   - 1차 네임서버: ns1.cloudflare.com
   - 2차 네임서버: ns2.cloudflare.com
7. "저장" 클릭
```

#### AWS Route 53인 경우:
```
1. AWS Console → Route 53
2. Hosted zones → w-campus.com 선택
3. NS 레코드 수정
4. Cloudflare 네임서버로 변경
```

#### 기타 레지스트라:
```
- GoDaddy
- Namecheap
- 후이즈
등 각 업체의 네임서버 변경 메뉴에서 동일하게 진행
```

### 2-3. 네임서버 변경 확인
```
⚠️ 네임서버 변경은 최대 24-48시간 소요될 수 있습니다.
보통 1-2시간 내에 완료됩니다.

확인 방법:
터미널에서 다음 명령어 실행:
$ nslookup -type=NS w-campus.com

결과에 cloudflare.com이 표시되면 성공!
```

---

## 🔗 Step 3: Cloudflare Pages에 커스텀 도메인 추가

### 3-1. Cloudflare Pages 프로젝트로 이동
```
1. Cloudflare 대시보드
2. Workers & Pages 메뉴 클릭
3. Pages 탭 선택
4. "wow-campus-platform" 프로젝트 클릭
```

### 3-2. Custom Domain 추가
```
1. "Custom domains" 탭 클릭
2. "Set up a custom domain" 버튼 클릭
3. 도메인 입력: w-campus.com
4. "Continue" 클릭
5. DNS 레코드 자동 생성 확인
   - Type: CNAME
   - Name: w-campus.com (또는 @)
   - Content: wow-campus-platform.pages.dev
6. "Activate domain" 클릭
```

### 3-3. www 서브도메인 추가 (선택사항)
```
1. 다시 "Set up a custom domain" 클릭
2. 도메인 입력: www.w-campus.com
3. "Continue" 클릭
4. "Activate domain" 클릭
```

---

## 🛡️ Step 4: SSL/TLS 인증서 설정

### 4-1. SSL 자동 발급 확인
```
1. Cloudflare Pages에서 Custom domains 탭
2. w-campus.com 옆에 "Active" 상태 확인
3. 🔒 자물쇠 아이콘 확인

Cloudflare는 자동으로 무료 SSL 인증서를 발급합니다.
(Let's Encrypt 사용, 약 5-10분 소요)
```

### 4-2. SSL/TLS 모드 확인
```
1. Cloudflare 대시보드 → w-campus.com 사이트
2. SSL/TLS 메뉴 클릭
3. "Overview" 탭에서 확인
4. 권장 설정: "Full (strict)" 선택
```

---

## 🔄 Step 5: DNS 레코드 확인 및 최적화

### 5-1. DNS 레코드 확인
```
1. Cloudflare 대시보드 → w-campus.com
2. DNS 메뉴 클릭
3. "Records" 탭 확인

필수 레코드:
- Type: CNAME
  Name: w-campus.com (또는 @)
  Target: wow-campus-platform.pages.dev
  Proxy status: Proxied (주황색 구름 ☁️)

- Type: CNAME (선택)
  Name: www
  Target: w-campus.com
  Proxy status: Proxied
```

### 5-2. Cloudflare Proxy 활성화
```
⚠️ 중요: "Proxy status"가 "Proxied" (주황색 구름)로 설정되어야 합니다.

장점:
- DDoS 방어
- CDN 캐싱
- 무료 SSL
- 성능 최적화
```

---

## ✅ Step 6: 도메인 연결 확인

### 6-1. 브라우저에서 확인
```
1. https://w-campus.com 접속
2. 정상적으로 페이지 로드 확인
3. 🔒 자물쇠 표시 확인 (SSL 적용)
4. https://www.w-campus.com 접속 (www 포함)
5. 리다이렉션 확인
```

### 6-2. 터미널에서 확인
```bash
# DNS 확인
$ nslookup w-campus.com

# HTTPS 확인
$ curl -I https://w-campus.com

# SSL 인증서 확인
$ curl -vI https://w-campus.com 2>&1 | grep -A 5 "SSL certificate"
```

### 6-3. 온라인 도구로 확인
```
- https://www.whatsmydns.net/ (DNS 전파 확인)
- https://www.ssllabs.com/ssltest/ (SSL 등급 확인)
- https://tools.pingdom.com/ (속도 테스트)
```

---

## 🎨 Step 7: 추가 최적화 설정 (선택사항)

### 7-1. 페이지 규칙 (Page Rules) 설정
```
1. Cloudflare 대시보드 → w-campus.com
2. Rules 메뉴 → Page Rules
3. "Create Page Rule" 클릭

예시 규칙:

규칙 1: www → non-www 리다이렉트
- URL: www.w-campus.com/*
- Setting: Forwarding URL (301 Permanent Redirect)
- Destination URL: https://w-campus.com/$1

규칙 2: HTTP → HTTPS 리다이렉트
- URL: http://w-campus.com/*
- Setting: Always Use HTTPS
```

### 7-2. 캐시 설정
```
1. Caching 메뉴 → Configuration
2. Browser Cache TTL: 4 hours (권장)
3. Caching Level: Standard
```

### 7-3. 보안 설정
```
1. Security 메뉴 → Settings
2. Security Level: Medium (권장)
3. Bot Fight Mode: On
4. Challenge Passage: 30 Minutes
```

---

## 🐛 문제 해결 (Troubleshooting)

### 문제 1: "DNS_PROBE_FINISHED_NXDOMAIN" 오류
```
원인: DNS가 아직 전파되지 않음
해결: 24시간 대기 또는 DNS 캐시 삭제

Windows:
> ipconfig /flushdns

Mac/Linux:
$ sudo dscacheutil -flushcache
$ sudo killall -HUP mDNSResponder
```

### 문제 2: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH" 오류
```
원인: SSL 인증서가 아직 발급되지 않음
해결:
1. Cloudflare Pages → Custom domains 확인
2. "Active" 상태일 때까지 대기 (5-10분)
3. 브라우저 캐시 삭제 후 재시도
```

### 문제 3: "Too many redirects" 오류
```
원인: SSL/TLS 모드 설정 오류
해결:
1. Cloudflare 대시보드 → SSL/TLS
2. 모드를 "Full (strict)"로 변경
3. 5분 대기 후 재시도
```

### 문제 4: 페이지가 로드되지만 스타일이 깨짐
```
원인: 혼합 콘텐츠 (Mixed Content) 오류
해결:
1. Cloudflare 대시보드 → SSL/TLS
2. Edge Certificates 탭
3. "Always Use HTTPS" ON
4. "Automatic HTTPS Rewrites" ON
```

---

## 📊 완료 체크리스트

설정 완료 후 다음 항목을 확인하세요:

- [ ] 1. 도메인이 Cloudflare에 추가됨
- [ ] 2. 네임서버가 Cloudflare로 변경됨
- [ ] 3. Cloudflare Pages에 커스텀 도메인 추가됨
- [ ] 4. DNS 레코드가 올바르게 설정됨
- [ ] 5. SSL 인증서가 발급됨 (🔒 표시)
- [ ] 6. https://w-campus.com 접속 가능
- [ ] 7. https://www.w-campus.com 접속 가능
- [ ] 8. HTTP → HTTPS 리다이렉션 작동
- [ ] 9. www → non-www 리다이렉션 작동 (선택)
- [ ] 10. 모든 페이지가 정상 작동

---

## 🎯 최종 결과

설정 완료 후:
- ✅ **메인 도메인**: https://w-campus.com
- ✅ **www 도메인**: https://www.w-campus.com (리다이렉트)
- ✅ **이전 URL**: https://356dd41a.wow-campus-platform.pages.dev (계속 작동)
- ✅ **SSL**: 무료 Let's Encrypt 인증서
- ✅ **CDN**: Cloudflare 글로벌 네트워크
- ✅ **보안**: DDoS 방어, WAF

---

## 📞 참고 자료

- Cloudflare Pages 문서: https://developers.cloudflare.com/pages/
- Cloudflare DNS 문서: https://developers.cloudflare.com/dns/
- Cloudflare SSL 문서: https://developers.cloudflare.com/ssl/

---

## 💡 추가 팁

### 이메일 설정
도메인으로 이메일을 받으려면:
```
1. Cloudflare 대시보드 → Email
2. Email Routing 설정
3. MX 레코드 자동 생성
4. admin@w-campus.com 등 이메일 주소 생성
```

### 서브도메인 활용
```
- api.w-campus.com (API 서버)
- admin.w-campus.com (관리자 페이지)
- blog.w-campus.com (블로그)
```

---

**작성일**: 2025-10-18  
**작성자**: AI Development Assistant

**도메인 연결 성공을 기원합니다! 🚀**
