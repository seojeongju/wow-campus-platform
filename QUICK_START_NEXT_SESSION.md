# 🚀 다음 세션 빠른 시작 가이드

## 📍 현재 상태 (2025-11-13 - 최종 업데이트)

### ✅ 정상 작동
- 사용자 관리 (승인/거부/수정/삭제/일시정지) ✅
- 협약대학교 관리 (CRUD + 모달) ✅  
- 에이전트 관리 (CRUD + 모달) ✅
- 토스트 알림 시스템 ✅
- 관리자 로그인 ✅
- **랜딩 페이지 기능 아이콘 섹션** ✅ (NEW!)

### 📦 최신 배포
- **URL**: https://w-campus.com
- **최신 배포**: https://ff893b97.wow-campus-platform.pages.dev
- **커밋**: `7b30938`
- **날짜**: 2025-11-13 08:45 UTC

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

> 💡 자세한 정보는 `ADMIN_CREDENTIALS.md` 참조 (로컬 파일만 존재)

---

## ⚡ 즉시 시작하기

### 1. 환경 확인
```bash
cd /home/user/webapp
pwd  # 현재 위치 확인
git status  # Git 상태 확인
git log --oneline -5  # 최근 커밋 확인
```

### 2. 최신 코드 받기
```bash
git pull origin main
npm install  # 의존성 업데이트 (필요시)
```

### 3. 로컬 개발
```bash
npm run build
npx wrangler pages dev dist
```

### 4. 배포
```bash
npm run build
npx wrangler pages deploy dist --project-name=wow-campus-platform --commit-dirty=true
```

---

## 🎯 우선순위 작업

### High Priority 🔴
1. **비밀번호 해싱 개선**
   - 현재: SHA-256 + Salt
   - 권장: bcrypt 또는 Argon2
   - 파일: `src/utils/auth.ts`

2. **사용자 삭제 상태 추가**
   - 현재: status = 'rejected' (임시)
   - 목표: status = 'deleted' 지원
   - 필요: 마이그레이션 파일 생성

### Medium Priority 🟡
3. **에러 로깅 시스템**
4. **API 응답 캐싱**
5. **데이터베이스 인덱스 최적화**

### Low Priority 🟢
6. **UI/UX 개선**
7. **다국어 지원 (i18n)**
8. **모바일 최적화**

---

## 📂 주요 파일 위치

### Frontend
```
src/
├── index.tsx                              # 메인 JavaScript (5000+ lines)
│   ├── Line 60-179: Toast 시스템
│   ├── Line 5379-5398: Window 함수 등록
│   └── Line 5429-5450: Admin 페이지 초기화
│
└── pages/dashboard/
    └── admin-full.tsx                     # 관리자 대시보드 HTML
        ├── Line 445-456: 사용자 관리 헤더
        ├── Line 790: 삭제 모달 버튼
        └── Line 833: 일시정지 모달 버튼
```

### Backend
```
src/routes/
└── admin.ts                               # 관리자 API
    ├── Line 611-647: DELETE /users/:id
    ├── Line 653-714: POST /users/:id/toggle-status
    └── Line 430-510: PUT /users/:id
```

### Database
```
migrations/
└── 0001_initial_schema.sql                # 초기 스키마
    └── Line 10: status CHECK constraint
```

---

## 🔧 자주 사용하는 명령어

### Git
```bash
# 변경사항 확인
git status
git diff

# 커밋
git add .
git commit -m "fix: description"
git push origin main

# 히스토리
git log --oneline -10
git show <commit-hash>
```

### 데이터베이스
```bash
# 로컬 DB
npx wrangler d1 execute wow-campus-platform-db \
  --command "SELECT * FROM users WHERE user_type = 'admin'"

# 프로덕션 DB (주의!)
npx wrangler d1 execute wow-campus-platform-db --remote \
  --command "SELECT COUNT(*) as total FROM users"
```

### 빌드 & 배포
```bash
# 빠른 배포
npm run build && npx wrangler pages deploy dist \
  --project-name=wow-campus-platform --commit-dirty=true

# 배포 목록 확인
npx wrangler pages deployment list --project-name=wow-campus-platform
```

---

## 🐛 문제 해결

### 문제: 함수가 작동하지 않음
```javascript
// 브라우저 콘솔에서 확인
console.log(window.loadPendingUsers);  // undefined면 문제
console.log(window.toast);  // toast 확인

// Window 함수 목록 확인
Object.keys(window).filter(k => k.startsWith('load') || k.startsWith('show'))
```

### 문제: 빌드 에러
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 삭제
rm -rf dist .wrangler
```

### 문제: 배포 실패
```bash
# 로그인 확인
npx wrangler whoami

# 프로젝트 확인
npx wrangler pages project list
```

---

## 📚 참고 문서

### 이 저장소
- **최신 세션**: `SESSION_COMPLETE_2025-11-13_LANDING_ICONS.md` ⭐ (이 문서 먼저 읽기!)
- **세션 요약**: `SESSION_SUMMARY_2025-11-13.md`
- **백업 문서**: `BACKUP_FEATURE_ICONS_2025-11-13.md`
- **배포 상태**: `DEPLOYMENT_STATUS_2025-11-13_FINAL.md`
- **관리자 계정**: `ADMIN_CREDENTIALS.md` (로컬 전용)
- **README**: `README.md`

### 외부 링크
- Hono 문서: https://hono.dev/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Tailwind CSS: https://tailwindcss.com/

---

## 💾 데이터베이스 스키마 요약

### users 테이블
```sql
status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'))
-- ⚠️ 'deleted'는 현재 지원 안 됨!
```

### 주요 컬럼
- `id`: INTEGER PRIMARY KEY
- `email`: TEXT UNIQUE NOT NULL
- `password_hash`: TEXT NOT NULL (SHA-256)
- `user_type`: 'company' | 'jobseeker' | 'agent' | 'admin'
- `status`: 'pending' | 'approved' | 'rejected' | 'suspended'
- `name`, `phone`, `profile_image_url`
- `created_at`, `updated_at`, `last_login_at`

---

## 🎨 코딩 컨벤션

### 커밋 메시지
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
refactor: 리팩토링
style: 코드 포맷팅
test: 테스트 추가
chore: 빌드/설정 변경
```

### 함수 이름
```javascript
// ✅ Good
function loadPendingUsers() { }
function hideUserManagement() { }
window.showUniversityModal = showUniversityModal;

// ❌ Bad  
function load_pending_users() { }
function HideUserManagement() { }
```

### 에러 처리
```javascript
try {
  const result = await apiCall();
  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }
} catch (error) {
  console.error('Error:', error);
  toast.error('오류가 발생했습니다.');
}
```

---

## ⚠️ 주의사항

1. **프로덕션 DB 변경 시**
   - 반드시 `--remote` 플래그 사용
   - 쿼리 테스트는 로컬에서 먼저
   - 백업 없이 DELETE/UPDATE 금지

2. **배포 전**
   - 로컬 빌드 테스트 필수
   - Git 커밋 먼저
   - 브라우저 콘솔에서 에러 확인

3. **보안**
   - `ADMIN_CREDENTIALS.md`는 절대 커밋 금지
   - 비밀번호는 문서에만 기록
   - API 토큰 노출 주의

---

## 📞 트러블슈팅 체크리스트

### 배포 후 작동 안 함
- [ ] 브라우저 캐시 삭제 (Ctrl+Shift+R)
- [ ] 시크릿 모드로 테스트
- [ ] 최신 배포 URL 확인
- [ ] 콘솔 에러 확인

### 모달 버튼 작동 안 함  
- [ ] Window 함수 등록 확인
- [ ] onclick에 window. 접두사 확인
- [ ] 브라우저 콘솔에서 함수 존재 확인

### 토스트 안 뜸
- [ ] `/static/toast.js` 로딩 확인
- [ ] `window.toast` 객체 존재 확인
- [ ] 네트워크 탭에서 toast.js 200 OK 확인

---

## 🎉 시작 준비 완료!

모든 정보가 준비되었습니다. 

**다음 세션 시작 명령어**:
```bash
cd /home/user/webapp
git pull origin main
git log --oneline -5
```

**테스트 사이트**: https://w-campus.com/admin

**Happy Coding! 🚀**

---

**마지막 업데이트**: 2025-11-13 06:25 UTC
