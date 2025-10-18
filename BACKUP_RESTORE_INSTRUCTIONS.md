# 🔄 WOW-CAMPUS 프로젝트 백업 및 복원 가이드

백업 날짜: 2025-10-18
마지막 커밋: 5843a42 - fix: jobs page - fix API response handling and add login/signup redirect functionality

## 📦 백업 내용

### 1. Git 커밋 이력
- 총 5개의 최신 커밋 포함
- 브랜치: main
- 원격 저장소: https://github.com/seojeongju/wow-campus-platform.git

### 2. 프로젝트 구조
```
webapp/
├── src/                    # 소스 코드
│   ├── index.tsx          # 메인 애플리케이션 (15,000+ 줄)
│   ├── routes/            # API 라우트
│   ├── middleware/        # 인증 미들웨어
│   ├── types/             # TypeScript 타입
│   └── utils/             # 유틸리티 함수
├── migrations/            # 데이터베이스 마이그레이션
├── dist/                  # 빌드 결과물
├── node_modules/          # 의존성 패키지
└── 문서 파일들             # 개발 가이드 및 문서
```

### 3. 최근 구현된 기능
1. ✅ 에이전트-구직자 관계 시스템
2. ✅ 에이전트 지역 및 프로필 관리
3. ✅ 회원가입 시 에이전트 선택 기능
4. ✅ 구인정보 페이지 데이터 로딩
5. ✅ 로그인/회원가입 버튼 리다이렉트

### 4. 데이터베이스 스키마
- 9개의 마이그레이션 파일
- 주요 테이블: users, companies, jobseekers, agents, job_postings, applications, matches
- 최신 추가: agent_jobseekers 관계 테이블

## 🔧 복원 방법

### Step 1: GitHub에서 클론 (권장)
```bash
git clone https://github.com/seojeongju/wow-campus-platform.git
cd wow-campus-platform
```

### Step 2: 백업 파일에서 복원 (대체 방법)
```bash
# 압축 파일 압축 해제
tar -xzf wow-campus-backup-2025-10-18.tar.gz
cd webapp

# Git 히스토리 복원
git init
git add .
git commit -m "Restore from backup 2025-10-18"
git remote add origin https://github.com/seojeongju/wow-campus-platform.git
```

### Step 3: 의존성 설치
```bash
npm install
```

### Step 4: 환경 변수 설정
`.env.local` 파일 생성:
```
# Cloudflare 관련 환경 변수는 wrangler.jsonc에서 관리
```

### Step 5: 데이터베이스 마이그레이션
```bash
# 로컬 개발
npm run dev

# 프로덕션 배포
npm run build
npm run deploy
```

## 📊 현재 배포 상태

### Cloudflare Pages 배포
- 최신 배포 URL: https://356dd41a.wow-campus-platform.pages.dev
- 프로젝트 이름: wow-campus-platform
- 브랜치: main

### 데이터베이스
- Cloudflare D1 (SQLite)
- 샘플 데이터 포함:
  - 3개의 구인공고 (삼성전자, 네이버, 카카오)
  - 테스트 사용자 계정들

## 🔑 중요 정보

### API 엔드포인트
```
공개 API:
- GET /api/jobs              # 구인정보 목록
- GET /api/jobseekers        # 구직자 목록  
- GET /api/public/agents     # 에이전트 목록 (회원가입용)

인증 필요:
- POST /api/auth/register    # 회원가입
- POST /api/auth/login       # 로그인
- GET /api/profile/*         # 프로필 조회
- PUT /api/profile/*         # 프로필 수정
```

### 관리자 기능 (구현 대기)
- [ ] 사용자 승인 시스템
- [ ] 통합 대시보드
- [ ] 협약대학교 CRUD
- [ ] 구인공고 관리
- [ ] 통계 및 리포트

## 🚀 다음 개발 세션에서 할 일

1. **관리자 대시보드 구현** (우선순위 높음)
   - 사용자 승인/거부 시스템
   - 통계 대시보드
   - 협약대학교 관리 API

2. **테스트 계정 생성**
   - 관리자 계정
   - 테스트 기업 계정
   - 테스트 구직자 계정

3. **문서화**
   - API 문서 작성
   - 사용자 가이드
   - 배포 가이드

## 📝 참고 문서

프로젝트 루트에 포함된 문서:
- `README.md` - 프로젝트 개요
- `HANDOVER.md` - 인수인계 가이드
- `AUTHENTICATION_VERIFICATION_GUIDE.md` - 인증 테스트
- `AGENT_JOBSEEKER_RELATIONSHIP_IMPLEMENTATION.md` - 에이전트 관계 구현
- `AGENT_REGION_PROFILE_IMPLEMENTATION.md` - 에이전트 프로필 구현

## ⚠️ 주의사항

1. **환경 변수**: Cloudflare 시크릿은 별도 설정 필요
2. **데이터베이스**: D1 마이그레이션은 Cloudflare 대시보드에서 실행
3. **인증**: GitHub 토큰이 만료되면 재설정 필요
4. **로컬 테스트**: `npm run dev`로 로컬 서버 실행 가능

## 🆘 문제 해결

### 빌드 오류
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Git 충돌
```bash
git fetch origin
git reset --hard origin/main
```

### Cloudflare 배포 오류
```bash
npx wrangler pages deploy dist --project-name=wow-campus-platform
```

---

**백업 완료일**: 2025-10-18  
**다음 세션 시작 시**: 이 파일을 먼저 읽어주세요!
