# ⚡ 도메인 연결 빠른 가이드 (w-campus.com)

## 🎯 5단계로 완료하기

### Step 1: Cloudflare에 도메인 추가 (5분)
1. https://dash.cloudflare.com 접속
2. "Add a Site" → `w-campus.com` 입력
3. Free 플랜 선택 → Continue

### Step 2: 네임서버 변경 (중요!) 
**Cloudflare에서 제공하는 네임서버 2개를 복사**
```
예: ns1.cloudflare.com, ns2.cloudflare.com
```

**도메인 등록 업체(가비아, GoDaddy 등)에서:**
- 네임서버 설정 메뉴로 이동
- Cloudflare 네임서버 2개 입력
- 저장

⏱️ **대기 시간**: 1-24시간 (보통 1-2시간)

### Step 3: Cloudflare Pages에 커스텀 도메인 추가 (2분)
```
1. Cloudflare 대시보드
2. Workers & Pages → Pages 탭
3. wow-campus-platform 클릭
4. Custom domains 탭
5. "Set up a custom domain" 버튼
6. w-campus.com 입력 → Continue
7. Activate domain
```

### Step 4: SSL 확인 (5-10분 자동)
- Cloudflare가 자동으로 무료 SSL 인증서 발급
- Custom domains에서 "Active" 상태 확인
- 🔒 자물쇠 아이콘 표시되면 완료

### Step 5: 접속 테스트
```
✅ https://w-campus.com 접속
✅ 페이지 정상 로드 확인
✅ 🔒 자물쇠 표시 확인
```

---

## 🐛 빠른 문제해결

### DNS 오류 (NXDOMAIN)
- **원인**: DNS 전파 중
- **해결**: 24시간 대기

### SSL 오류
- **원인**: 인증서 발급 중
- **해결**: 10분 대기 후 재시도

### "Too many redirects"
- **원인**: SSL 설정 오류
- **해결**: Cloudflare → SSL/TLS → "Full (strict)" 선택

---

## 📊 완료 체크리스트

- [ ] Cloudflare에 도메인 추가
- [ ] 네임서버 변경
- [ ] Pages에 커스텀 도메인 추가
- [ ] SSL 활성화 확인
- [ ] https://w-campus.com 접속 가능

**완료 시간**: 약 30분 (네임서버 전파 제외)

---

**상세 가이드**: `DOMAIN_SETUP_GUIDE.md` 참조
