# WOW-CAMPUS 작업 세션 요약
**날짜**: 2025-11-12  
**백업 파일**: `/home/user/wow-campus-backup-2025-11-12.tar.gz` (2.8MB)

---

## 📋 완료된 작업 목록

### 1. ✅ 모바일 메뉴 인증 버튼 수정
- **문제**: 모바일 메뉴의 "내 대시보드", "로그아웃" 버튼이 `/jobs` 페이지에서만 표시됨
- **해결**: `public/static/app.js`에서 `mobile-auth-buttons` 요소 자동 생성 기능 추가
- **커밋**: `5aee6cd`

### 2. ✅ 구인공고 로고 이미지 수정
- **문제**: `/jobs/create` 페이지의 로고가 깨짐 (base64 이미지 문제)
- **해결**: `/logo.png` 파일 참조로 변경
- **커밋**: `0250f6f`

### 3. ✅ 비자 종류 선택 UX 개선
- **문제**: `<select multiple>` 방식이 사용하기 불편함
- **해결**: 스크롤 가능한 체크박스 리스트로 변경 (거주/취업/기타 비자 카테고리별 분류)
- **커밋**: `fb9569f`

### 4. ✅ 구인공고 job_type 한국어 값 지원
- **문제**: 프론트엔드는 한국어('정규직') 전송, DB는 영어('full_time')만 허용
- **해결**: Migration 0012로 DB 스키마를 한국어 값으로 변경
- **커밋**: `bcb59c8`, `5b4a969`, `8f72b19`
- **마이그레이션**: `0012_update_job_type_to_korean.sql`

### 5. ✅ 대시보드 실시간 업데이트
- **문제**: 구인공고 생성 후 대시보드에 반영 안됨
- **해결**: 
  - 페이지 포커스 이벤트로 자동 새로고침 (5초 throttle)
  - `window.location.replace()` 사용으로 강제 새로고침
  - 삭제 후 전체 대시보드 새로고침
- **커밋**: `bb53775`

### 6. ✅ 기업 프로필 보기/수정 기능 추가
- **문제**: 기업이 자신의 프로필을 보고 수정할 수 없음
- **해결**:
  - 새 페이지 생성: `/profile/company` (탭 기반 UI - 보기/수정)
  - API 엔드포인트 추가:
    - `GET /api/profile/company` - 프로필 조회
    - `PUT /api/profile/company` - 프로필 수정
  - 대시보드에 "내 프로필" 빠른 액션 메뉴 추가
- **파일**: `src/pages/profile/company.tsx`, `src/routes/profile.ts`
- **커밋**: `b898196` (PR #28), `5be3e62`

### 7. ✅ Auth Profile API에 ID 필드 추가
- **문제**: 대시보드에서 company_id를 찾을 수 없어 공고 목록 조회 실패
- **해결**: `/api/auth/profile` 응답에 `profile.id` 추가 (company/jobseeker/agent)
- **커밋**: `1aeb353`

### 8. ✅ 홈페이지 최신 정보 실제 데이터로 변경
- **문제**: 최신 구인/구직 정보가 하드코딩되어 있음
- **해결**:
  - 하드코딩 제거 및 로딩 스피너 추가
  - 새 API 엔드포인트: `GET /api/latest-information`
  - 최신 3개 구인공고 및 구직자 정보 자동 로드
- **커밋**: `eacad98`

### 9. ✅ 대시보드 공고 목록 표시 수정
- **문제**: 새 공고 등록 후 대시보드의 "채용 공고 관리"에 표시 안됨
- **해결**: `displayCompanyJobs()` 함수의 선택자를 `.space-y-4`에서 `#jobs-list`로 변경
- **커밋**: `e51d35c`

### 10. ✅ 구인공고 경력/학력 필드 한국어 값 지원
- **문제**: 
  - DB는 `experience_level`에 영어 값('entry', 'junior', 등)만 허용
  - 폼은 한국어 값('신입', '경력 1년 이상', 등) 전송
  - 결과: NULL로 저장되어 상세보기에서 정보 불일치
- **해결**: 
  - Migration 0013으로 CHECK 제약조건 제거
  - 한국어 값 자유롭게 저장 가능하도록 변경
- **커밋**: `52a45a5`
- **마이그레이션**: `0013_update_experience_education_to_korean.sql`

---

## 🗄️ 데이터베이스 마이그레이션 기록

### 적용된 마이그레이션
1. **0010**: `add_visa_types_to_job_postings.sql` - visa_types 컬럼 추가
2. **0012**: `update_job_type_to_korean.sql` - job_type 한국어 값으로 변경
3. **0013**: `update_experience_education_to_korean.sql` - experience_level, education_required 제약조건 제거

### 삭제된 마이그레이션
- **0011**: `add_international_student_fields.sql` - 중복 컬럼 에러로 삭제

---

## 📂 주요 파일 변경

### 새로 생성된 파일
- `src/pages/profile/company.tsx` - 기업 프로필 페이지
- `src/routes/profile.ts` - 프로필 API 라우트
- `migrations/0012_update_job_type_to_korean.sql`
- `migrations/0013_update_experience_education_to_korean.sql`

### 수정된 파일
- `public/static/app.js` - 모바일 인증 버튼 자동 생성
- `src/pages/jobs/create.tsx` - 로고 수정, 비자 체크박스, 한국어 job_type
- `src/pages/dashboard/company.tsx` - 자동 새로고침, 내 프로필 메뉴, 선택자 수정
- `src/routes/auth.ts` - profile API에 id 필드 추가
- `src/routes/jobs.ts` - visa_types 필드 지원
- `src/pages/home.tsx` - 하드코딩 제거, 로딩 상태 추가
- `src/index.tsx` - 라우트 추가 (`/profile/company`, `/api/profile`, `/api/latest-information`)

---

## 🚀 배포 상태

### GitHub Repository
- **URL**: https://github.com/seojeongju/wow-campus-platform
- **브랜치**: main
- **최신 커밋**: `52a45a5` (fix: 구인공고 경력/학력 필드 한국어 값 지원)

### Cloudflare Pages
- **프로젝트**: wow-campus-platform
- **Production URL**: wow-campus-platform.pages.dev
- **상태**: ✅ 배포 완료

### Pull Requests
- **#28**: feat: 기업 프로필 보기 및 수정 기능 추가 (Merged)

---

## 🔧 기술 스택

### Frontend
- **Framework**: Hono (TypeScript)
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6.4.0
- **Build Tool**: Vite

### Backend
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: JWT (localStorage)

### Deployment
- **Hosting**: Cloudflare Pages (Auto-deploy from main branch)
- **Database**: Cloudflare D1
- **Version Control**: GitHub

---

## 📝 주요 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/profile` - 사용자 프로필 조회 (profile.id 포함)

### 구인공고
- `GET /api/jobs` - 공고 목록
- `GET /api/jobs/:id` - 공고 상세
- `POST /api/jobs` - 공고 생성 (기업/관리자)
- `GET /api/jobs/company/:companyId` - 특정 기업의 공고 목록
- `GET /api/latest-information` - 홈페이지용 최신 정보 (최신 3개 공고/구직자)

### 프로필
- `GET /api/profile/company` - 기업 프로필 조회 (기업)
- `PUT /api/profile/company` - 기업 프로필 수정 (기업)
- `POST /api/profile/jobseeker` - 구직자 프로필 수정

---

## 🐛 알려진 이슈 및 제한사항

### 해결됨
- ✅ 모바일 메뉴 인증 버튼 누락
- ✅ 구인공고 로고 깨짐
- ✅ 비자 선택 UX 불편
- ✅ job_type 한국어 값 저장 불가
- ✅ 대시보드 실시간 업데이트 없음
- ✅ 기업 프로필 관리 기능 없음
- ✅ 대시보드에서 company_id 조회 실패
- ✅ 홈페이지 하드코딩된 데이터
- ✅ 대시보드 공고 목록 표시 안됨
- ✅ 구인공고 상세정보 불일치

### 남은 작업
- 기존 구인공고(NULL 값)의 경력/학력 정보 수정 기능
- 구인공고 수정 페이지 (`/jobs/:id/edit`)
- 지원자 관리 기능
- 알림 시스템
- 이메일 인증
- 비밀번호 재설정

---

## 💾 백업 정보

### 로컬 백업
- **파일**: `/home/user/wow-campus-backup-2025-11-12.tar.gz`
- **크기**: 2.8MB
- **내용**: 
  - 소스 코드 (node_modules, .git, .wrangler, dist 제외)
  - 마이그레이션 파일
  - 설정 파일

### 복원 방법
```bash
cd /home/user
tar -xzf wow-campus-backup-2025-11-12.tar.gz
cd webapp
npm install
npx wrangler d1 migrations apply wow-campus-platform-db --local
npm run dev
```

---

## 🔐 중요 환경 정보

### wrangler.toml
- D1 데이터베이스: `wow-campus-platform-db`
- Database ID: `efaa0882-3f28-4acd-a609-4c625868d101`

### Git 설정
- User: seojeongju
- Repository: wow-campus-platform

---

## 📚 다음 세션을 위한 참고사항

### 개발 환경 시작
```bash
cd /home/user/webapp
npm run dev
# 서버: http://localhost:5173 (포트는 가변적)
```

### 데이터베이스 작업
```bash
# 로컬 DB 쿼리
npx wrangler d1 execute wow-campus-platform-db --local --command "SELECT * FROM job_postings;"

# 원격 DB 쿼리
npx wrangler d1 execute wow-campus-platform-db --remote --command "SELECT * FROM job_postings;"

# 마이그레이션 적용
npx wrangler d1 migrations apply wow-campus-platform-db --local
npx wrangler d1 migrations apply wow-campus-platform-db --remote
```

### 배포
```bash
git add -A
git commit -m "커밋 메시지"
git push origin main
# Cloudflare Pages가 자동으로 배포
```

---

## 📞 문제 해결 참고

### 자주 사용하는 명령어
- `git status` - 변경사항 확인
- `git log --oneline -10` - 최근 커밋 확인
- `npm run dev` - 개발 서버 시작
- `npx wrangler pages deployment list --project-name=wow-campus-platform` - 배포 상태 확인

### 주의사항
- 모든 bash 명령은 `cd /home/user/webapp &&` 로 시작
- AI Drive는 느리므로 큰 파일 작업 시 로컬에서 먼저 압축
- 데이터베이스 마이그레이션은 로컬 테스트 후 원격 적용
- 한국어 값을 사용하는 필드: `job_type`, `experience_level`, `education_required`

---

**작업 완료 시각**: 2025-11-12 10:03:44 UTC  
**총 커밋 수**: 10개  
**총 마이그레이션**: 3개 (0010, 0012, 0013)  
**상태**: ✅ 모든 변경사항 배포 완료
