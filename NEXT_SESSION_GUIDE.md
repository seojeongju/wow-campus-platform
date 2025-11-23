# 🚀 다음 개발 세션 시작 가이드

**작성일**: 2025-10-18  
**현재 버전**: v1.1 - Admin Dashboard Implementation  
**다음 세션 시작 전 필독 문서**

---

## 📋 시작 전 체크리스트

### ✅ 필수 확인 사항
- [ ] GitHub 저장소 접근 가능
- [ ] Cloudflare 계정 로그인
- [ ] 개발 환경 준비 (Node.js, npm)
- [ ] 최신 코드 pull 완료
- [ ] 이 문서를 끝까지 읽음

---

## 🔄 프로젝트 재개 절차

### 1️⃣ 저장소 클론 (새 환경인 경우)

```bash
# GitHub에서 클론
git clone https://github.com/seojeongju/wow-campus-platform.git
cd wow-campus-platform

# 최신 상태 확인
git status
git log --oneline -5
```

### 2️⃣ 기존 환경 업데이트 (기존 환경인 경우)

```bash
# 프로젝트 디렉토리로 이동
cd /home/user/webapp/wow-campus-platform

# 최신 코드 가져오기
git fetch origin main
git pull origin main

# 상태 확인
git log --oneline -5
git status
```

### 3️⃣ 의존성 설치 및 빌드

```bash
# Node 모듈 설치
npm install

# 프로젝트 빌드
npm run build

# 빌드 성공 확인 (909KB worker.js)
ls -lh dist/
```

### 4️⃣ 개발 서버 실행

```bash
# Vite 개발 서버 시작
npm run dev

# 또는 PM2로 백그라운드 실행
pm2 start ecosystem.config.cjs
pm2 logs

# 서버 접속 확인
curl http://localhost:5173
```

### 5️⃣ 환경 변수 확인

```bash
# .env.local 파일 확인
cat .env.local

# 필요한 변수:
# CLOUDFLARE_API_TOKEN=4R-EJC8j3SlbPNc48vZlvH447ICGNiGRzsSI4bS4
# CLOUDFLARE_ACCOUNT_ID=85c8e953bdefb825af5374f0d66ca5dc
```

---

## 📚 현재 프로젝트 상태

### ✅ 완료된 기능

#### 인증 시스템 (100%)
- 로그인/회원가입
- JWT 토큰 인증
- 사용자 타입별 권한
- 프로필 관리

#### 관리자 대시보드 (100%) ⭐ **최신**
- **사용자 승인 시스템**: 가입 승인/거부
- **통계 대시보드**: 실시간 플랫폼 통계
- **협약대학교 관리**: CRUD 작업
- **15개 관리자 API**: 완전한 관리 기능

#### 구인/구직 시스템 (90%)
- 구인공고 CRUD
- 구직자 프로필 관리
- 검색 및 필터링
- 대시보드

#### 에이전트 시스템 (85%)
- 에이전트 프로필
- 구직자 배정
- 지역 관리

### 🔨 진행 중/미완료 기능

#### 매칭 시스템 (30%)
- ⚠️ 기본 구조만 있음
- 🔨 AI 매칭 알고리즘 필요
- 🔨 매칭 점수 계산 필요

#### 통계/분석 (70%)
- ✅ 기본 통계 완성
- ⚠️ 차트 시각화 없음
- 🔨 트렌드 분석 필요

#### 알림 시스템 (0%)
- 🔨 이메일 알림 미구현
- 🔨 실시간 알림 미구현
- 🔨 푸시 알림 미구현

---

## 🎯 권장 다음 작업 (우선순위별)

### Priority 1: 즉시 시작 가능 ⭐

#### 1. 이메일 알림 시스템
**예상 시간**: 4-6시간  
**난이도**: 중간  
**설명**: 사용자 승인/거부 시 자동 이메일 발송

**작업 내용**:
```typescript
// src/utils/email.ts 생성
- SendGrid 또는 Resend API 통합
- 이메일 템플릿 작성
- 승인/거부 이메일 발송 함수

// src/routes/admin.ts 수정
- approveUser 함수에 이메일 발송 추가
- rejectUser 함수에 이메일 발송 추가
```

**필요한 것**:
- 이메일 서비스 API 키 (SendGrid, Resend, etc.)
- 이메일 템플릿 디자인
- 환경 변수 설정

#### 2. 활동 로그 시스템
**예상 시간**: 3-4시간  
**난이도**: 쉬움  
**설명**: 모든 관리자 액션 기록

**작업 내용**:
```sql
-- migrations/0011_create_activity_logs_table.sql
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT
);
```

```typescript
// src/utils/activityLog.ts
export async function logActivity(...)
```

#### 3. 차트 시각화
**예상 시간**: 4-5시간  
**난이도**: 중간  
**설명**: Chart.js로 통계 차트 추가

**작업 내용**:
```html
<!-- Chart.js CDN 추가 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- 차트 구현 -->
- 사용자 증가 추세 (라인 차트)
- 사용자 타입 분포 (파이 차트)
- 지역별 분포 (바 차트)
```

### Priority 2: 기능 확장

#### 4. 고급 검색 시스템
**예상 시간**: 5-6시간  
**난이도**: 중간  
**설명**: 복합 조건 검색 및 저장된 필터

#### 5. 매칭 시스템 구현
**예상 시간**: 10-12시간  
**난이도**: 어려움  
**설명**: AI 기반 자동 매칭 알고리즘

#### 6. 데이터 내보내기
**예상 시간**: 3-4시간  
**난이도**: 쉬움  
**설명**: CSV/Excel 다운로드 기능

### Priority 3: 성능 및 최적화

#### 7. 캐싱 시스템
**예상 시간**: 4-5시간  
**난이도**: 중간  
**설명**: Cloudflare KV를 이용한 캐싱

#### 8. 이미지 업로드
**예상 시간**: 5-6시간  
**난이도**: 중간  
**설명**: Cloudflare R2를 이용한 이미지 저장

---

## 📖 주요 파일 구조

### 새로 추가된 파일 (최신)
```
src/
└── routes/
    └── admin.ts              # 관리자 API (700+ 줄)

migrations/
└── 0010_create_universities_table.sql

문서/
├── ADMIN_DASHBOARD_IMPLEMENTATION.md
├── DEPLOYMENT_COMPLETE_2025-10-18.md
└── NEXT_SESSION_GUIDE.md (이 파일)
```

### 핵심 파일 위치
```
src/
├── index.tsx                 # 메인 앱 (15,000+ 줄)
├── routes/
│   ├── auth.ts              # 인증 API
│   ├── jobs.ts              # 구인공고 API
│   ├── jobseekers.ts        # 구직자 API
│   ├── agents.ts            # 에이전트 API
│   ├── admin.ts             # 관리자 API ⭐ 최신
│   └── matching.ts          # 매칭 시스템
├── middleware/
│   ├── auth.ts              # 인증 미들웨어
│   ├── cors.ts              # CORS 설정
│   └── permissions.ts       # 권한 체크
└── utils/
    ├── auth.ts              # JWT 유틸
    └── database.ts          # DB 유틸
```

---

## 🔌 API 엔드포인트 빠른 참조

### 관리자 API (최신)
```
GET    /api/admin/users              # 전체 사용자
GET    /api/admin/users/pending      # 승인 대기
GET    /api/admin/users/:id          # 사용자 상세
POST   /api/admin/users/:id/approve  # 승인
POST   /api/admin/users/:id/reject   # 거부
POST   /api/admin/users/:id/suspend  # 정지
POST   /api/admin/users/:id/activate # 활성화
PUT    /api/admin/users/:id          # 수정
DELETE /api/admin/users/:id          # 삭제
GET    /api/admin/statistics         # 통계
GET    /api/admin/analytics          # 분석
GET    /api/admin/universities       # 대학교 목록
POST   /api/admin/universities       # 대학교 추가
PUT    /api/admin/universities/:id   # 대학교 수정
DELETE /api/admin/universities/:id   # 대학교 삭제
```

### 인증 API
```
POST /api/auth/register  # 회원가입
POST /api/auth/login     # 로그인
GET  /api/auth/profile   # 프로필 조회
```

### 구인/구직 API
```
GET  /api/jobs           # 구인공고 목록
POST /api/jobs           # 구인공고 생성
GET  /api/jobseekers     # 구직자 목록
```

---

## 🧪 빠른 테스트 방법

### 로컬 개발 서버 테스트
```bash
# 1. 서버 시작
npm run dev

# 2. API 테스트
curl http://localhost:5173/api

# 3. 관리자 로그인
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wowcampus.com","password":"password123"}'

# 4. 관리자 API 테스트
TOKEN="받은_토큰"
curl http://localhost:5173/api/admin/statistics \
  -H "Authorization: Bearer $TOKEN"
```

### 프로덕션 테스트
```bash
# 브라우저에서 접속
https://8a539b1c.wow-campus-platform.pages.dev

# 관리자 로그인
Email: admin@wowcampus.com
Password: password123

# 관리자 페이지 접속
https://8a539b1c.wow-campus-platform.pages.dev/admin
```

---

## 🐛 문제 해결

### 문제 1: 빌드 오류
```bash
# 해결 방법
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 문제 2: Git 충돌
```bash
# 해결 방법
git fetch origin main
git reset --hard origin/main
npm install
npm run build
```

### 문제 3: 개발 서버 실행 안됨
```bash
# 포트 확인
lsof -i :5173

# 프로세스 종료
kill -9 <PID>

# 다시 시작
npm run dev
```

### 문제 4: 데이터베이스 오류
```bash
# 로컬 DB 리셋
npm run db:reset

# 원격 마이그레이션 재실행
npm run db:migrate:remote
```

---

## 📝 개발 워크플로우

### 새 기능 개발 시
```bash
# 1. 브랜치 생성
git checkout -b feature/new-feature-name

# 2. 개발 진행
# ... 코드 작성 ...

# 3. 테스트
npm run build
npm run dev

# 4. 커밋
git add .
git commit -m "feat: Add new feature description"

# 5. 원격 푸시
git push origin feature/new-feature-name

# 6. Pull Request 생성
gh pr create --title "feat: New feature" --body "Description"
```

### PR 머지 후
```bash
# main 브랜치로 전환
git checkout main

# 최신 코드 pull
git pull origin main

# 배포
npm run build
npm run deploy:prod
```

---

## 🔑 중요 정보

### 테스트 계정
```
관리자: admin@wowcampus.com / password123
기업: hr@samsung.com / company123
구직자: john.doe@email.com / jobseeker123
에이전트: agent@globalrecruiters.com / agent123
```

### 환경 변수
```bash
CLOUDFLARE_API_TOKEN=4R-EJC8j3SlbPNc48vZlvH447ICGNiGRzsSI4bS4
CLOUDFLARE_ACCOUNT_ID=85c8e953bdefb825af5374f0d66ca5dc
```

### 배포 URL
```
프로덕션: https://8a539b1c.wow-campus-platform.pages.dev
GitHub: https://github.com/seojeongju/wow-campus-platform
```

---

## 📚 참고 문서

### 필수 문서 (순서대로 읽기)
1. **README.md** - 프로젝트 전체 개요
2. **PROJECT_STATUS_2025-10-18.md** - 현재 프로젝트 상태
3. **ADMIN_DASHBOARD_IMPLEMENTATION.md** - 관리자 기능 상세
4. **DEPLOYMENT_COMPLETE_2025-10-18.md** - 배포 완료 보고서
5. **NEXT_SESSION_GUIDE.md** - 이 문서

### 추가 참고 문서
- `BACKUP_RESTORE_INSTRUCTIONS.md` - 백업 및 복원
- `AUTHENTICATION_VERIFICATION_GUIDE.md` - 인증 테스트
- `AGENT_JOBSEEKER_RELATIONSHIP_IMPLEMENTATION.md` - 에이전트 관계
- `AGENT_REGION_PROFILE_IMPLEMENTATION.md` - 에이전트 프로필

---

## 🎯 세션 목표 설정 템플릿

### 새 세션 시작 시 목표 정하기
```
세션 시작일: ____년 __월 __일
목표 완료 시간: __ 시간
주요 목표: _________________

✅ To-Do:
[ ] 목표 1: _______________
[ ] 목표 2: _______________
[ ] 목표 3: _______________

완료 기준:
- [ ] 코드 빌드 성공
- [ ] 테스트 통과
- [ ] 문서 업데이트
- [ ] 커밋 및 PR 생성
- [ ] 배포 완료 (선택)
```

---

## 💡 팁과 권장사항

### 개발 팁
1. **작은 단위로 커밋**: 기능별로 나눠서 커밋
2. **테스트 우선**: 코드 작성 전 테스트 시나리오 작성
3. **문서화**: 새로운 기능은 즉시 문서화
4. **에러 처리**: 모든 API에 포괄적인 에러 처리

### 성능 팁
1. **인덱스 활용**: 자주 검색하는 컬럼에 인덱스 추가
2. **쿼리 최적화**: 불필요한 조인 제거
3. **캐싱 고려**: 자주 조회되는 데이터는 캐싱
4. **페이지네이션**: 대량 데이터는 페이징 처리

### 보안 팁
1. **인증 검증**: 모든 민감한 API에 인증 필수
2. **입력 검증**: 사용자 입력 항상 검증
3. **SQL 인젝션 방지**: 파라미터화된 쿼리 사용
4. **XSS 방지**: 사용자 입력 이스케이프

---

## 🚀 준비 완료!

### 시작하기 전 최종 체크
- [ ] 이 문서를 끝까지 읽었나요?
- [ ] 최신 코드를 pull 받았나요?
- [ ] 개발 서버가 정상 작동하나요?
- [ ] 다음에 할 작업을 정했나요?
- [ ] 필요한 문서를 확인했나요?

### 모두 체크했다면...
🎉 **이제 개발을 시작하세요!**

```bash
# 개발 서버 시작
cd /home/user/webapp/wow-campus-platform
npm run dev

# 새 터미널에서 작업
git checkout -b feature/your-new-feature
code .
```

---

## 📞 도움이 필요하면

### 문제 발생 시
1. 문서 확인: 위 "문제 해결" 섹션
2. GitHub Issues 검색
3. 백업 복원: `BACKUP_RESTORE_INSTRUCTIONS.md`

### 추가 정보
- GitHub: https://github.com/seojeongju/wow-campus-platform
- 배포 URL: https://8a539b1c.wow-campus-platform.pages.dev

---

**작성일**: 2025-10-18  
**작성자**: AI Development Assistant  
**버전**: 1.0

🚀 **행운을 빕니다! 훌륭한 개발 되세요!**
