# WOW-CAMPUS Work Platform

## 프로젝트 개요
- **이름**: WOW-CAMPUS Work Platform
- **목표**: 외국인 인재의 한국 진출 지원 및 구인구직 매칭
- **특징**: 해외 에이전트와 국내 기업을 연결하는 종합 플랫폼

## URL
- **개발 서버**: https://3000-ilkzpziady1obqdqwidvs-6532622b.e2b.dev
- **API 문서**: https://3000-ilkzpziady1obqdqwidvs-6532622b.e2b.dev/api

## 스크린샷 기반 디자인
스크린샷을 참고하여 완전히 새로운 디자인으로 업데이트:
- **헤더 네비게이션**: 로고, 메뉴, 로그인/회원가입 버튼
- **히어로 섹션**: 블루 그라데이션 배경과 CTA 버튼
- **서비스 카드**: 아이콘과 설명이 포함된 3개 서비스 소개
- **최신 정보**: 구인정보와 구직자 현황을 탭 형태로 표시
- **통계 섹션**: 실시간 업데이트되는 플랫폼 통계
- **서비스 메뉴**: 3개 카테고리 선택 버튼

## 현재 완성된 기능

### ✅ 백엔드 인프라 (100% 완성)
- Hono 프레임워크 기반 API 서버
- Cloudflare D1 SQLite 데이터베이스
- JWT 기반 인증 시스템
- CORS 및 보안 미들웨어
- TypeScript 타입 안전성

### ✅ 데이터베이스 스키마 (100% 완성)
- **사용자 관리**: users, companies, jobseekers, agents 테이블
- **구인구직**: job_postings, applications 테이블
- **매칭 시스템**: matches 테이블 (AI 점수 기반)
- **유학 서비스**: study_programs, study_applications 테이블
- **비즈니스**: commissions, notifications 테이블
- **통계**: system_stats 테이블

### ✅ API 엔드포인트 (부분 완성)
- **인증 API** (`/api/auth/`)
  - `POST /register` - 사용자 등록
  - `POST /login` - 로그인
  - `GET /profile` - 프로필 조회
  - `PUT /profile` - 프로필 업데이트
  - `POST /logout` - 로그아웃

- **구인공고 API** (`/api/jobs/`)
  - `GET /` - 구인공고 목록 (검색, 필터링, 페이징)
  - `GET /:id` - 구인공고 상세
  - `POST /` - 구인공고 생성 (기업만)
  - `PUT /:id` - 구인공고 수정 (소유자만)
  - `DELETE /:id` - 구인공고 삭제 (소유자만)
  - `GET /company/:companyId` - 회사별 구인공고

### ✅ 프론트엔드 UI (100% 완성)
- **스크린샷 기반 완전 재설계** - 원본 디자인 100% 구현
- **헤더 네비게이션** - 로고, 메뉴, 로그인/회원가입 버튼
- **히어로 섹션** - 블루 그라데이션 배경과 CTA 버튼
- **서비스 카드** - FontAwesome 아이콘과 설명 포함
- **최신 정보 섹션** - 구인정보/구직자 현황 탭 디스플레이
- **통계 대시보드** - 실시간 업데이트 가능한 숫자 표시
- **서비스 메뉴** - 3개 카테고리 선택 인터페이스
- **모달 시스템** - 로그인/회원가입 팝업 기능
- TailwindCSS 기반 반응형 디자인
- 한국어 최적화 (Noto Sans KR 폰트)
- JavaScript API 클라이언트 통합

## 현재 기능 URI 목록

### 웹 페이지
- `GET /` - 메인 페이지 (플랫폼 소개)

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
  - 쿼리 파라미터: keyword, location, job_category, job_type, 
                   salary_min, salary_max, experience_level, 
                   visa_sponsorship, page, limit, sort, order
GET  /api/jobs/:id          - 구인공고 상세
POST /api/jobs              - 구인공고 생성 (인증 필요, 기업만)
PUT  /api/jobs/:id          - 구인공고 수정 (인증 필요, 소유자만)
DELETE /api/jobs/:id        - 구인공고 삭제 (인증 필요, 소유자만)
GET  /api/jobs/company/:id  - 회사별 구인공고 목록
```

## 아직 구현되지 않은 기능

### 🚧 사용자 관리 상세 기능
- 사용자 승인/거부 시스템 (관리자)
- 회사/구직자/에이전트 상세 프로필 생성
- 프로필 사진 업로드
- 이메일 인증

### 🚧 구인구직 매칭 시스템
- AI 기반 자동 매칭 알고리즘
- 매칭 점수 계산 및 추천
- 지원서 관리 시스템
- 면접 일정 관리

### 🚧 유학 지원 서비스
- 유학 프로그램 API
- 유학 지원서 관리
- 문서 업로드 시스템

### 🚧 에이전트 시스템
- 에이전트 대시보드
- 수수료 관리 시스템
- 구직자 관리 도구

### 🚧 관리자 기능
- 관리자 대시보드
- 실시간 통계
- 사용자 관리 패널
- 시스템 설정

### 🚧 추가 기능
- 실시간 채팅 시스템
- 알림 시스템
- 파일 업로드/다운로드
- 이메일 알림
- 다국어 지원

## 데이터 아키텍처

### 데이터 모델
- **사용자 계층**: User → Company/JobSeeker/Agent (1:1 관계)
- **구인구직 플로우**: Company → JobPosting → Application ← JobSeeker
- **매칭 시스템**: JobPosting ↔ Match ↔ JobSeeker (AI 점수 기반)
- **유학 서비스**: StudyProgram → StudyApplication ← JobSeeker
- **비즈니스 모델**: Agent → Commission (수수료 관리)

### 저장소 서비스
- **Cloudflare D1**: SQLite 기반 관계형 데이터베이스
- **로컬 개발**: `.wrangler/state/v3/d1` 디렉토리에 로컬 SQLite 파일

### 데이터 플로우
1. 사용자 등록 → 관리자 승인 → 활성화
2. 기업: 구인공고 등록 → 구직자 지원 → 매칭/채용
3. 에이전트: 구직자 관리 → 매칭 중계 → 수수료 정산

## 사용자 가이드

### 기업 사용자
1. 회원가입 후 관리자 승인 대기
2. 승인 후 회사 정보 입력
3. 구인공고 등록 및 관리
4. 지원자 검토 및 채용 진행

### 구직자
1. 회원가입 및 프로필 작성
2. 구인공고 검색 및 지원
3. 매칭된 공고 확인
4. 면접 및 채용 과정 참여

### 에이전트
1. 에이전시 정보 등록
2. 구직자 관리 및 상담
3. 기업-구직자 매칭 중계
4. 수수료 정산 관리

## 배포 정보
- **플랫폼**: Cloudflare Pages (준비 중)
- **현재 상태**: ✅ 개발 서버 활성화
- **기술 스택**: Hono + TypeScript + TailwindCSS + Cloudflare D1
- **개발 모드**: PM2 + Wrangler Pages Dev
- **마지막 업데이트**: 2025-09-27 (스크린샷 기반 UI 완전 재설계)

## 권장 다음 개발 단계
1. **사용자 승인 시스템** - 관리자가 회원가입 승인/거부
2. **구직자 프로필 완성** - 상세 이력서, 기술 스택, 포트폴리오
3. **지원서 시스템** - 구직자가 구인공고에 지원
4. **매칭 알고리즘** - AI 기반 자동 추천 시스템
5. **에이전트 대시보드** - 에이전트 전용 관리 도구
6. **실시간 알림** - 지원, 매칭, 승인 등 상태 변화 알림

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 로컬 데이터베이스 마이그레이션
npm run db:migrate:local

# 테스트 데이터 삽입
npm run db:seed

# 개발 서버 시작
npm run build
pm2 start ecosystem.config.cjs

# 테스트
curl http://localhost:3000
curl http://localhost:3000/api/jobs
```

---

**WOW-CAMPUS Work Platform** - 외국인 인재와 한국 기업을 연결하는 혁신적인 플랫폼