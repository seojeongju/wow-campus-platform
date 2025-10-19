# Cloudflare Access 제거 가이드

## 🎯 목표
w-campus.pages.dev 사이트를 공개 접속 가능하도록 Cloudflare Access 보호 제거

## 📝 단계별 진행

### Step 1: Cloudflare Dashboard 접속
1. 브라우저에서 https://dash.cloudflare.com 접속
2. Cloudflare 계정으로 로그인

### Step 2: Zero Trust 섹션 찾기
1. 왼쪽 사이드바에서 **"Zero Trust"** 메뉴 클릭
2. 또는 상단 검색창에서 "Zero Trust" 검색

### Step 3: Access Applications 페이지로 이동
1. Zero Trust 대시보드에서
2. 왼쪽 메뉴: **Access** → **Applications** 선택
3. 또는 직접 URL 접속: https://one.dash.cloudflare.com/[ACCOUNT_ID]/access/apps

### Step 4: w-campus Application 찾기
다음 중 하나의 이름으로 Application이 등록되어 있을 것입니다:
- w-campus
- *.w-campus.pages.dev
- w-campus.pages.dev
- 유사한 이름

### Step 5: Application 삭제
1. 해당 Application 행에서 **3점 메뉴 (⋮)** 또는 **Actions** 클릭
2. **Delete** 선택
3. 확인 대화상자에서 **Delete** 다시 클릭
4. "Application successfully deleted" 메시지 확인

### Step 6: 변경사항 확인 (약 1-5분 소요)
1. 브라우저 시크릿/프라이빗 모드 열기
2. https://16da36a9.w-campus.pages.dev 접속
3. Cloudflare Access 화면 없이 바로 사이트 로딩되는지 확인

---

## 🔍 Alternative: Access Policy 수정 (부분적 공개)

완전 삭제 대신 정책만 수정하고 싶다면:

1. Application 클릭하여 상세 페이지 진입
2. **Policies** 탭 선택
3. 기존 Policy 수정 또는 삭제
4. 새 Policy 추가: "Allow everyone" 또는 특정 이메일만 허용
5. **Save** 클릭

---

## ⚠️ 주의사항

- Access 제거 후 사이트가 **완전히 공개**됩니다
- 민감한 데이터가 있다면 애플리케이션 레벨 인증 사용 권장
- DNS 전파로 인해 즉시 반영되지 않을 수 있음 (최대 5분)

---

## 🆘 문제 해결

### 여전히 Access 화면이 표시되는 경우
1. 브라우저 캐시 완전 삭제
2. 시크릿/프라이빗 모드 사용
3. 5-10분 더 대기
4. 다른 네트워크에서 접속 시도

### Application을 찾을 수 없는 경우
1. 다른 Cloudflare 계정으로 설정되었을 가능성
2. 상단 계정 선택기로 올바른 계정 확인
3. Zero Trust → Settings → Custom Pages에서도 확인

---

## ✅ 완료 확인

다음이 모두 되면 성공:
- [ ] Cloudflare Access 화면이 표시되지 않음
- [ ] https://16da36a9.w-campus.pages.dev 바로 접속됨
- [ ] 메인 페이지가 정상적으로 로딩됨
- [ ] 로그인 없이 구인/구직 정보 확인 가능

