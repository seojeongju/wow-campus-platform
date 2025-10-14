# 🚀 WOW Campus Platform - Development Handover Document

**백업 생성 시간**: 2025-10-14 03:13:25 UTC  
**마지막 커밋**: 12d3c89 - fix(documents): fix file upload event handlers using addEventListener  
**Git 브랜치**: main  
**백업 파일 위치**: `/home/user/wow-campus-backup-latest.tar.gz`

---

## 📋 프로젝트 개요

**프로젝트명**: WOW-CAMPUS Platform  
**설명**: 외국인 구인구직 및 유학생 지원 플랫폼  
**기술 스택**: 
- Hono (TypeScript Full-Stack Framework)
- Cloudflare Pages + Workers
- Cloudflare D1 Database (SQLite)
- Cloudflare R2 Storage
- Vite Build System

**프로젝트 경로**: `/home/user/webapp`  
**GitHub**: https://github.com/seojeongju/wow-campus-platform

---

## ✅ 완료된 기능 (이번 세션)

### 1. **이력서 및 경력 문서 업로드 기능** ✅
- **커밋**: 73e7588, 12d3c89
- **파일**: 
  - `src/index.tsx` (API 엔드포인트 + UI + JS)
  - `wrangler.jsonc` (R2 바인딩)
  - `migrations/0002_add_documents_table.sql`

#### 구현 사항:
- ✅ R2 버킷 바인딩 (`DOCUMENTS_BUCKET`)
- ✅ documents 테이블 마이그레이션
- ✅ 파일 업로드 API (POST /api/documents/upload)
  - 최대 10MB
  - 지원 형식: PDF, Word, 이미지
- ✅ 문서 목록 조회 API (GET /api/documents)
- ✅ 문서 다운로드 API (GET /api/documents/:id/download)
- ✅ 문서 삭제 API (DELETE /api/documents/:id)
- ✅ 프로필 페이지 UI 추가 (드래그 앤 드롭 스타일)
- ✅ 프론트엔드 JavaScript (addEventListener 방식)
- ✅ 문서 타입별 아이콘 및 색상 구분

#### 문서 타입:
- 이력서 (resume) - 파란색
- 경력증명서 (career) - 초록색
- 자격증/증명서 (certificate) - 보라색
- 기타 (other) - 회색

---

## ⚠️ 알려진 이슈 및 해결 필요 사항

### 1. **프로필 저장 에러** 🔴 CRITICAL
**상태**: 코드 수정 완료, 빌드 및 테스트 필요

**문제**: 
```
D1_ERROR: no such column: name: SQLITE_ERROR
PUT /api/profile/update 500 Internal Server Error
```

**원인**: 
- 프로필 업데이트 API가 jobseekers 테이블의 실제 스키마와 불일치
- 코드에서 `name`, `phone`, `field` 등 존재하지 않는 컬럼 사용
- 실제 테이블: `first_name`, `last_name`, `visa_status`, `education_level` 등

**적용된 수정** (src/index.tsx 라인 3534-3594):
```typescript
// 이름을 first_name/last_name으로 분리
const fullName = body.name || user.name || '';
const nameParts = fullName.trim().split(' ');
const firstName = nameParts[0] || fullName;
const lastName = nameParts.slice(1).join(' ') || firstName;

// 올바른 컬럼명 사용
UPDATE jobseekers SET
  first_name = ?,
  last_name = ?,
  nationality = ?,
  bio = ?,
  visa_status = ?,      // visa_type → visa_status
  korean_level = ?,
  education_level = ?,  // education → education_level
  experience_years = ?,
  skills = ?,
  preferred_location = ?,  // desired_location → preferred_location
  salary_expectation = ?,  // desired_salary → salary_expectation
  updated_at = datetime('now')
WHERE user_id = ?
```

**필요한 조치**:
1. 빌드: `npm run build`
2. 서버 재시작
3. 프로필 저장 테스트
4. 문서 업로드 테스트

---

## 📊 데이터베이스 스키마

### documents 테이블
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  document_type TEXT NOT NULL CHECK(document_type IN ('resume', 'career', 'certificate', 'other')),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  upload_date TEXT NOT NULL DEFAULT (datetime('now')),
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### jobseekers 테이블 주요 컬럼
```
id, user_id, first_name, last_name, nationality, birth_date, gender,
visa_status, korean_level, english_level, education_level, major,
experience_years, resume_url, portfolio_url, current_location,
preferred_location, salary_expectation, available_start_date,
bio, skills, created_at, updated_at
```

**중요**: `name` 컬럼이 없음! `first_name` + `last_name` 사용

---

## 🔧 개발 환경 설정

### 필수 명령어

```bash
# 프로젝트 디렉토리로 이동
cd /home/user/webapp

# 의존성 설치 (필요시)
npm install

# 빌드
npm run build

# 로컬 개발 서버 시작 (포트 자동 조정 필요)
npx wrangler pages dev --port 4000 --ip 0.0.0.0 --d1 wow-campus-platform-db

# 데이터베이스 마이그레이션 적용 (로컬)
npx wrangler d1 migrations apply wow-campus-platform-db --local

# 데이터베이스 쿼리 실행
npx wrangler d1 execute wow-campus-platform-db --local --command="SELECT * FROM documents LIMIT 5;"
```

### 환경 변수
```bash
# .env.local 파일에 정의됨
CLOUDFLARE_API_TOKEN=(hidden)
CLOUDFLARE_ACCOUNT_ID=(hidden)
```

### 바인딩
```javascript
env.DB                    // D1 Database
env.DOCUMENTS_BUCKET      // R2 Bucket (로컬에서는 메모리 스토리지)
```

---

## 🧪 테스트 계정

**이메일**: wow3d01@wow3d.com  
**비밀번호**: lee2548121!  
**타입**: jobseeker  
**User ID**: 10

---

## 📂 주요 파일 구조

```
/home/user/webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 (583KB)
│   ├── routes/            # 라우트 모듈
│   ├── middleware/        # 인증 미들웨어
│   └── utils/             # 유틸리티 함수
├── migrations/
│   ├── 0001_initial_schema.sql       # 초기 스키마
│   └── 0002_add_documents_table.sql  # 문서 테이블
├── dist/                  # 빌드 출력 (자동 생성)
├── .wrangler/             # Wrangler 캐시
├── wrangler.jsonc         # Wrangler 설정
├── package.json           # 의존성
├── tsconfig.json          # TypeScript 설정
└── vite.config.ts         # Vite 설정
```

---

## 🌐 API 엔드포인트

### 인증
- POST `/api/auth/login` - 로그인
- POST `/api/auth/register` - 회원가입
- POST `/api/auth/logout` - 로그아웃

### 프로필
- GET `/profile` - 프로필 페이지
- PUT `/api/profile/update` - 프로필 업데이트 ⚠️ 수정 필요
- GET `/dashboard/jobseeker` - 구직자 대시보드

### 문서 관리 (신규)
- POST `/api/documents/upload` - 문서 업로드
- GET `/api/documents` - 문서 목록 조회
- GET `/api/documents/:id/download` - 문서 다운로드
- DELETE `/api/documents/:id` - 문서 삭제

---

## 🔄 Git 워크플로우

### 최근 커밋 히스토리
```
12d3c89 - fix(documents): fix file upload event handlers using addEventListener
73e7588 - feat(documents): add resume and career document upload feature
7d4abea - ✨ 프로필 편집 기능 완전 개선
16f5def - 🎨 구직자 네비게이션 UI/UX 개선
```

### 브랜치 전략
- **main**: 프로덕션 브랜치
- **genspark_ai_developer**: AI 개발자 작업 브랜치 (이전에 사용)

### 푸시 상태
✅ 모든 변경사항이 원격 저장소에 푸시됨

---

## 🚨 즉시 해결해야 할 작업

### Priority 1: 프로필 저장 에러 수정 ⚠️
```bash
cd /home/user/webapp
npm run build
# 서버 재시작
npx wrangler pages dev --port 4000 --ip 0.0.0.0 --d1 wow-campus-platform-db
# 테스트: 프로필 페이지에서 저장 버튼 클릭
```

**예상 결과**: 500 에러 해결, 프로필 저장 성공

### Priority 2: 문서 업로드 기능 테스트
```bash
# 서버 실행 후
# 1. https://{port}-{sandbox-id}.sandbox.novita.ai 접속
# 2. 로그인 (wow3d01@wow3d.com / lee2548121!)
# 3. 내 대시보드 → 프로필 수정
# 4. 하단으로 스크롤 → "이력서 및 경력 문서" 섹션
# 5. 파일 선택 → 문서 종류 선택 → 업로드
```

**예상 결과**: 파일 업로드 성공, 목록에 표시

---

## 📝 주의사항

### 포트 관리
- 기본 포트 3000, 5000, 8787 등이 충돌할 수 있음
- 사용 가능한 포트로 조정 필요 (예: 4000, 4001 등)
- `--ip 0.0.0.0` 플래그 필수 (외부 접근을 위해)

### 빌드 시간
- 평균 빌드 시간: 1-2초
- esbuild 데드락 발생 시: `killall -9 node esbuild` 후 재시도

### R2 스토리지
- 로컬 개발 환경: 메모리 기반 임시 스토리지
- 프로덕션 배포 전 필수:
  ```bash
  npx wrangler r2 bucket create wow-campus-documents
  ```

### 데이터베이스
- 로컬: `.wrangler/state/v3/d1/` 디렉토리
- 마이그레이션 자동 적용: `--local` 플래그 사용 시
- 원격 배포 시: `--remote` 플래그로 마이그레이션 적용 필요

---

## 🎯 다음 단계 권장 사항

1. **즉시 해결**: 프로필 저장 에러 (코드 수정 완료, 테스트만 필요)
2. **기능 테스트**: 문서 업로드 전체 플로우 검증
3. **UI 개선**: 드래그 앤 드롭 실제 구현 (현재는 디자인만)
4. **에러 핸들링**: 사용자 친화적 에러 메시지
5. **파일 미리보기**: PDF/이미지 미리보기 기능
6. **용량 제한**: 사용자별 저장 용량 관리
7. **보안 강화**: 파일 스캔, 바이러스 체크
8. **프로덕션 배포**: R2 버킷 생성 후 배포

---

## 📞 참고 정보

### Cloudflare 설정
- Account ID: (환경 변수에 저장됨)
- D1 Database ID: efaa0882-3f28-4acd-a609-4c625868d101
- R2 Bucket Name: wow-campus-documents (생성 필요)

### 프로젝트 구조 특징
- **단일 파일 애플리케이션**: src/index.tsx에 모든 로직 포함
- **SSR (Server-Side Rendering)**: TSX로 HTML 생성
- **인라인 JavaScript**: 페이지 내 `<script>` 태그로 포함
- **Tailwind CSS**: CDN 방식 사용

---

## 🔄 백업 복원 방법

```bash
# 홈 디렉토리의 백업 파일에서 복원
cd /home/user
tar -xzf wow-campus-backup-latest.tar.gz -C webapp-restored
cd webapp-restored
npm install
npm run build
```

---

## ✅ 체크리스트 (새 AI 개발자용)

- [ ] 백업 파일 확인: `/home/user/wow-campus-backup-latest.tar.gz`
- [ ] Git 상태 확인: `git status`
- [ ] 마지막 커밋 확인: `git log --oneline -3`
- [ ] 프로필 저장 에러 수정 빌드 및 테스트
- [ ] 문서 업로드 기능 전체 테스트
- [ ] 포트 충돌 확인 및 조정
- [ ] 서버 로그 모니터링

---

**이 문서를 읽은 후 즉시 시작할 수 있습니다!** 🚀

필요한 모든 정보와 컨텍스트가 포함되어 있으며, 코드 수정도 완료되어 있습니다.
