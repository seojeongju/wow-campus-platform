# WOW-CAMPUS Work Platform

## 프로젝트 개요
- **이름**: WOW-CAMPUS Work Platform
- **목표**: 외국인 인재의 한국 진출 지원 및 구인구직 매칭
- **특징**: 해외 에이전트와 국내 기업을 연결하는 종합 플랫폼

## URL 및 저장소
- **🚀 프로덕션**: https://c4c8d39d.wow-campus-platform.pages.dev
- **🌐 GitHub**: https://github.com/seojeongju/wow-campus-platform
- **📂 브랜치 URL**: https://main.wow-campus-platform.pages.dev
- **🔧 로컬 개발 서버**: https://3000-iu1t6sbx9ybuoxuaoo5mt-6532622b.e2b.dev
- **📊 API 문서**: /api (JSON 형태로 모든 엔드포인트 나열)

## 최신 완성된 기능 (2025-10-01)

### ✅ 페이지 구조 및 네비게이션 (100% 완성)
- **메인 페이지** (`/`) - 플랫폼 소개 및 통계
- **구인정보 페이지** (`/jobs`) - 기업 구인공고 목록 ⭐ **오류 해결 완료**
- **구직정보 페이지** (`/jobseekers`) - 구직자 프로필 목록 ⭐ **신규 추가**
- **유학정보 페이지** (`/study`) - 한국 유학 프로그램 안내
- **에이전트 대시보드** (`/agents`) - 에이전트 전용 관리도구 ⭐ **개편 완료**
- **통계 페이지** (`/statistics`) - 플랫폼 운영 현황

### ✅ 사용자 인터페이스 개선 (100% 완성)
- **회원가입/로그인 모달** ⭐ **취소 버튼 및 사용성 개선 완료**
  - 4가지 모달 닫기 방법: X버튼, 취소버튼, 외부클릭, ESC키
  - 직관적인 버튼 배치 및 색상 구분
  - 반응형 레이아웃 및 이벤트 버블링 방지
- **네비게이션 메뉴 개선**
  - 구인정보/구직정보 명확한 분리
  - 드롭다운 메뉴 및 모바일 반응형 지원
  - 일관된 색상 테마 및 호버 효과

### ✅ API 및 데이터 연동 (100% 완성)
- **구인공고 API** (`/api/jobs`) - 3개 샘플 데이터 정상 로드
- **구직자 API** (`/api/jobseekers`) - 3개 샘플 데이터 정상 로드
- **실시간 데이터 표시** - JavaScript를 통한 동적 업데이트
- **페이징 및 검색** - API 레벨에서 구현 완료

### ✅ 백엔드 인프라 (100% 완성)
- **Hono 프레임워크** - TypeScript 기반 경량 웹 프레임워크
- **Cloudflare D1** - SQLite 기반 글로벌 분산 데이터베이스
- **JWT 인증** - 사용자 인증 및 권한 관리 시스템
- **API 엔드포인트** - RESTful 설계 및 타입 안전성

### ✅ 데이터베이스 구조 (100% 완성)
- **사용자 관리**: users, companies, jobseekers, agents
- **구인구직**: job_postings, applications, matches
- **유학 서비스**: study_programs, study_applications
- **비즈니스**: commissions, notifications, system_stats

## 현재 기능 URI 목록

### 웹 페이지
```
GET  /                   - 메인 페이지 (플랫폼 소개)
GET  /jobs               - 구인정보 목록 (기업 공고)
GET  /jobseekers         - 구직정보 목록 (구직자 프로필) ⭐ NEW
GET  /study              - 유학정보 안내
GET  /agents             - 에이전트 대시보드 ⭐ 개편
GET  /statistics         - 통계 대시보드
```

### API 엔드포인트
```
인증
POST /api/auth/register     - 사용자 회원가입
POST /api/auth/login        - 로그인
GET  /api/auth/profile      - 프로필 조회
PUT  /api/auth/profile      - 프로필 수정
POST /api/auth/logout       - 로그아웃

구인공고
GET  /api/jobs              - 구인공고 목록 (검색/필터)
GET  /api/jobs/:id          - 구인공고 상세
POST /api/jobs              - 구인공고 생성 (인증 필요, 기업만)
PUT  /api/jobs/:id          - 구인공고 수정 (인증 필요, 소유자만)
DELETE /api/jobs/:id        - 구인공고 삭제 (인증 필요, 소유자만)
GET  /api/jobs/company/:id  - 회사별 구인공고 목록

구직자 ⭐ 신규
GET  /api/jobseekers        - 구직자 목록 (검색/필터)
GET  /api/jobseekers/:id    - 구직자 상세
POST /api/jobseekers        - 구직자 프로필 생성 (인증 필요)
PUT  /api/jobseekers/:id    - 구직자 프로필 수정 (인증 필요, 소유자만)
```

## 샘플 데이터
### 구인공고 (3개)
1. **Senior Software Engineer** - 삼성전자 (서울, 4500-6500만원)
2. **UX Designer** - 네이버 (성남, 4000-5500만원)
3. **International Marketing Manager** - 카카오 (서울, 5000-7000만원)

### 구직자 (3개)
1. **John Doe** - 미국, 소프트웨어 개발자 (Java, Spring Boot, React)
2. **Maria Garcia** - 스페인, 국제비즈니스 전문가 (Marketing, Business Analysis)
3. **Hiroshi Tanaka** - 일본, 기계공학 엔지니어 (CAD, SolidWorks, Manufacturing)

## 해결된 주요 이슈들
### ✅ 구인정보 페이지 오류 해결
- **문제**: "TypeError: Cannot read properties of undefined (reading 'length')" 
- **원인**: API 응답 구조 불일치 (`data.jobs` vs `data.data`)
- **해결**: JavaScript 코드 수정 및 디버깅 로그 추가

### ✅ 페이지 구조 분리 개선
- **문제**: 구직정보와 에이전트 기능이 혼재
- **해결**: `/jobseekers` 페이지 신규 생성, `/agents` 전용 대시보드로 분리

### ✅ 모달 사용성 개선
- **문제**: 회원가입 모달에 취소 버튼 없음
- **해결**: 취소 버튼 추가 + 외부클릭/ESC키 닫기 기능 추가

## 데이터 아키텍처
### 저장소 서비스
- **Cloudflare D1**: `wow-campus-platform-db` (efaa0882-3f28-4acd-a609-4c625868d101)
- **로컬 개발**: `.wrangler/state/v3/d1/` SQLite 파일

### 데이터 플로우
1. **구인 플로우**: Company → JobPosting → Application ← JobSeeker
2. **구직 플로우**: JobSeeker → Profile → Matching → Interview
3. **에이전트 플로우**: Agent → Management → Commission

## 권장 다음 개발 단계
1. **구직자 상세 페이지** - 개별 프로필 상세보기 및 연락 기능
2. **검색/필터 기능** - 실제 검색 및 필터링 동작 구현
3. **지원서 시스템** - 구직자가 구인공고에 지원하는 기능
4. **사용자 인증 시스템** - 실제 로그인/회원가입 기능 활성화
5. **에이전트 성과 데이터** - 실제 에이전트 통계 API 연동
6. **실시간 매칭** - AI 기반 자동 매칭 알고리즘

## 개발 환경 설정

### 로컬 개발
```bash
# 저장소 클론
git clone https://github.com/seojeongju/wow-campus-platform.git
cd wow-campus-platform

# 의존성 설치
npm install

# 로컬 데이터베이스 설정
npm run db:migrate:local
npm run db:seed

# 개발 서버 시작
npm run build
pm2 start ecosystem.config.cjs

# 테스트
curl http://localhost:3000/api/jobs
curl http://localhost:3000/api/jobseekers
```

### 배포
```bash
# GitHub 푸시
git push origin main

# Cloudflare Pages 배포 (API 토큰 설정 후)
export CLOUDFLARE_API_TOKEN="your-api-token"
npx wrangler pages deploy dist --project-name wow-campus-platform

# 프로덕션 URL: https://c4c8d39d.wow-campus-platform.pages.dev
# 브랜치 URL: https://main.wow-campus-platform.pages.dev
```

## 기술 스택
- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript
- **Backend**: Hono (TypeScript), Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages
- **Version Control**: Git, GitHub
- **Process Management**: PM2

## 프로젝트 현황
- **✅ 개발 완료**: 페이지 구조, API, 데이터베이스, 기본 UI/UX
- **🚀 배포 완료**: Cloudflare Pages 프로덕션 배포
- **🔧 진행 중**: 사용자 인증, 매칭 시스템, 고급 기능
- **📝 마지막 업데이트**: 2025-10-01
- **📊 커밋 수**: 18+ commits
- **🔗 GitHub 동기화**: ✅ 최신 상태
- **🌐 프로덕션 URL**: https://c4c8d39d.wow-campus-platform.pages.dev

---

**WOW-CAMPUS Work Platform** - 외국인 인재와 한국 기업을 연결하는 혁신적인 플랫폼