# 🚀 다음 세션 시작 가이드

> **최종 업데이트**: 2025-11-14 03:30 UTC

---

## ⚡ 빠른 시작 (30초)

```bash
cd /home/user/webapp
git pull origin main
git log --oneline -10
```

---

## 🎯 현재 작업 중 (IMPORTANT!)

### 📱 모바일 메뉴 통일 작업 진행 중

**목표**: 모든 대시보드(구인기업/구직자/에이전트)에 통일된 모바일 메뉴 추가

**현재 상태**:
- ✅ 메인 페이지(`/`): 모바일 메뉴 있음 (대시보드 버튼 + 로그아웃 포함)
- ✅ 관리자 대시보드(`/admin`): 데스크톱 전용 (모바일 메뉴 불필요)
- ❌ 구인기업 대시보드(`/dashboard/company`): 모바일 메뉴 없음 **← 작업 필요**
- ❌ 구직자 대시보드(`/dashboard/jobseeker`): 모바일 메뉴 없음 **← 작업 필요**  
- ❌ 에이전트 대시보드(`/agents`): 모바일 메뉴 없음 **← 작업 필요**

**작업 계획**:
1. `src/pages/dashboard/company.tsx` - 모바일 메뉴 추가
2. `src/pages/dashboard/jobseeker.tsx` - 모바일 메뉴 추가
3. 에이전트 대시보드 페이지 찾아서 - 모바일 메뉴 추가

**참조 코드** (메인 페이지 모바일 메뉴):
- `src/index.tsx` 라인 283-336: `updateMobileAuthUI()` 함수
- `src/index.tsx` 라인 1322-1361: `updateMobileAuthButtons()` 함수 (통일됨)
- `src/index.tsx` 라인 1400-1424: 모바일 메뉴 토글 로직

**필요한 HTML 구조**:
```html
{/* Mobile Menu Button */}
<button id="mobile-menu-btn" class="lg:hidden ...">
  <i class="fas fa-bars text-2xl"></i>
</button>

{/* Mobile Menu */}
<div id="mobile-menu" class="hidden lg:hidden ...">
  <div id="mobile-auth-buttons">
    {/* 동적으로 로드됨 */}
  </div>
</div>
```

---

## 📖 최근 완료된 작업 (오늘)

### ✅ 완료된 수정사항

1. **모바일 메뉴 통일** (메인 페이지)
   - `updateMobileAuthButtons()` 함수를 `updateMobileAuthUI()`와 동일하게 수정
   - 대시보드 버튼 추가
   - 커밋: `2c029cd`

2. **협약대학교 URL 입력 개선**
   - `http://` 자동 추가 기능 (프론트엔드 + 백엔드)
   - 브라우저 validation 우회 (`type="url"` → `type="text"`)
   - 커밋: `e4d3e62`

3. **설립년도 자동 입력 수정**
   - 빈 값을 현재 연도 대신 `null`로 저장
   - 프론트엔드 + 백엔드 모두 수정
   - 커밋: `1f38c24`, `74c7ee7`

4. **사용자 일시정지 실시간 반영**
   - 메인 페이지 최신 구직정보에서 일시정지 사용자 제외
   - 구직정보/구인정보 페이지에서도 제외
   - 커밋: `54063b1`, `0ffb459`

5. **관리자 대시보드 닫기 버튼 개선**
   - 사용자 관리 섹션 닫기 기능 추가 (`hidden` 클래스 토글)
   - 협약대학교, 에이전트 관리도 동일하게 수정
   - 커밋: `a3a7c70`, `71ab7d8`

### 📦 최신 배포
- **URL**: https://603c95f4.wow-campus-platform.pages.dev
- **커밋**: `71ab7d8`
- **상태**: ✅ 정상 작동

---

## 🔐 로그인 정보

### 관리자 계정
```
이메일: admin@w-campus.com
비밀번호: admin123
```

또는

```
이메일: admin@wowcampus.com
비밀번호: password123
```

**관리자 페이지**: https://w-campus.com/admin

---

## 🛠️ 개발 명령어

### Git 작업
```bash
# 상태 확인
git status
git log --oneline -10

# 최신 코드 받기
git pull origin main

# 변경사항 커밋
git add .
git commit -m "feat: 설명"
git push origin main
```

### 빌드 & 배포
```bash
# 빌드
cd /home/user/webapp && npm run build

# 배포
cd /home/user/webapp && npx wrangler pages deploy dist --project-name=wow-campus-platform --branch=main
```

---

## 📁 주요 파일 위치

### Frontend
```
src/
├── index.tsx                           # 메인 로직 + 모바일 메뉴 함수들
├── pages/
│   ├── landing.tsx                     # 랜딩 페이지
│   └── dashboard/
│       ├── admin-full.tsx              # 관리자 대시보드
│       ├── company.tsx                 # 구인기업 대시보드 ← 작업 필요!
│       └── jobseeker.tsx               # 구직자 대시보드 ← 작업 필요!
├── routes/
│   ├── admin.ts                        # 관리자 API
│   ├── auth.ts                         # 인증 API
│   ├── jobs.ts                         # 구인정보 API
│   └── jobseekers.ts                   # 구직정보 API
└── utils/
    └── database.ts                     # DB 유틸 (buildJobSearchQuery 수정됨)
```

---

## 💡 다음 작업 (계속)

### High Priority 🔴
1. **모바일 메뉴 통일 완료** ← **현재 작업 중!**
   - `src/pages/dashboard/company.tsx` 수정
   - `src/pages/dashboard/jobseeker.tsx` 수정
   - 에이전트 대시보드 수정

2. **모바일 테스트**
   - 각 대시보드에서 모바일 메뉴 작동 확인
   - 대시보드 버튼 링크 확인
   - 로그아웃 기능 확인

---

## 🔗 유용한 링크

### 프로덕션
- **메인**: https://w-campus.com
- **관리자**: https://w-campus.com/admin
- **최신 배포**: https://603c95f4.wow-campus-platform.pages.dev

### GitHub
- **저장소**: https://github.com/seojeongju/wow-campus-platform
- **최근 커밋**: https://github.com/seojeongju/wow-campus-platform/commits/main

---

## 🚨 주의사항

### 모바일 메뉴 추가 시
1. ⚠️ **헤더 구조 확인**: 기존 `auth-buttons-container`에 `hidden lg:flex` 추가
2. ⚠️ **모바일 버튼 추가**: `<button id="mobile-menu-btn">` 추가
3. ⚠️ **모바일 메뉴 컨테이너**: `<div id="mobile-menu">` 추가
4. ⚠️ **인증 버튼 영역**: `<div id="mobile-auth-buttons">` 추가
5. ⚠️ **JavaScript 로직**: 페이지 로드 시 `updateMobileAuthUI()` 호출 필요

### Git 작업 시
1. ⚠️ **항상 최신 코드 받기**: `git pull origin main`
2. ⚠️ **커밋 전 빌드 테스트**: `npm run build`
3. ⚠️ **의미있는 커밋 메시지** 작성

---

## ✅ 다음 세션 시작 체크리스트

- [ ] `cd /home/user/webapp` 실행
- [ ] `git pull origin main` 실행
- [ ] 이 문서 읽기
- [ ] `git log --oneline -10` 확인
- [ ] **모바일 메뉴 통일 작업 계속** ← 여기서 시작!

---

## 🎉 작업 재개 준비 완료!

**다음 작업**: 
1. `src/pages/dashboard/company.tsx` 파일 열기
2. 헤더에 모바일 메뉴 HTML 추가
3. 빌드 & 테스트
4. jobseeker, agent도 동일하게 처리

**화이팅!** 🚀

---

**최종 업데이트**: 2025-11-14 03:30 UTC  
**작성자**: AI Developer  
**현재 작업**: 모바일 메뉴 통일 (진행 중)  
**버전**: v2.0
