# 빠른 시작 가이드 (Quick Start Guide)

## 🚀 새 세션 시작 체크리스트

### 1. 프로젝트 상태 확인
```bash
cd /home/user/webapp
git status
git log --oneline -3
```

### 2. 최신 코드 동기화
```bash
git fetch origin main
git pull origin main
```

### 3. 빌드 테스트
```bash
npm run build
```

---

## 📝 최근 작업 내용 (2025-11-12)

### ✅ 완료된 작업
1. **로고 크기 증가**
   - 변경 전: `h-10` (40px)
   - 변경 후: `h-16 md:h-20` (모바일 64px, 데스크톱 80px)
   - 영향받은 파일: 29개 페이지 컴포넌트

2. **투명 배경 로고 적용**
   - 흰색 배경 → 투명 배경 변환
   - 최적화: 650x304px → 400x187px (38KB)

3. **배포 완료**
   - Cloudflare Pages 자동 배포 성공
   - 프로덕션 URL: https://wow-campus-platform.pages.dev

---

## 🔧 자주 사용하는 명령어

### 개발
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 크기 확인
ls -lh dist/_worker.js
```

### Git 작업
```bash
# 변경사항 확인
git status
git diff

# 커밋 및 푸시
git add .
git commit -m "feat: 작업 내용"
git push origin main

# 원격과 동기화
git fetch origin main
git rebase origin/main
```

### 파일 검색
```bash
# 모든 페이지 파일 목록
find src/pages -name "*.tsx"

# 로고 사용 위치 검색
grep -r "WOW-CAMPUS" src/pages/

# 특정 클래스 검색
grep -r "h-16 md:h-20" src/pages/
```

---

## 🐛 문제 해결

### 빌드 실패 시
```bash
# 1. node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 2. 캐시 정리
npm cache clean --force

# 3. 다시 빌드
npm run build
```

### 로고 크기 조정이 필요한 경우
```bash
# update_logo_sizes_fixed.py 스크립트 사용
python3 update_logo_sizes_fixed.py

# 또는 수동으로 클래스 변경
# 파일: src/pages/*.tsx
# 찾기: class="h-16 md:h-20 w-auto"
# 바꾸기: 원하는 크기 (예: h-20 md:h-24 w-auto)
```

### Merge Conflict 발생 시
```bash
# 로컬 버전 유지 (로고 관련)
git checkout --ours src/pages/*.tsx

# 원격 버전 유지 (기타)
git checkout --theirs <파일명>

# 충돌 해결 후
git add .
git rebase --continue
```

---

## 📊 현재 프로젝트 상태

| 항목 | 상태 |
|------|------|
| 브랜치 | `main` |
| 최신 커밋 | `e631211` |
| 빌드 상태 | ✅ 성공 |
| 배포 상태 | ✅ 성공 |
| 빌드 크기 | 2,952.38 kB |
| 크기 제한 | 3,072 kB (3MB) |
| 여유 공간 | ~120 kB |

---

## 📞 도움이 필요한 경우

### 상세 문서
- `SESSION_SUMMARY.md` - 전체 세션 요약 및 상세 정보
- `README.md` - 프로젝트 전체 설명 (있는 경우)

### 주요 파일 위치
- 로고: `/public/logo.png`, `/public/static/logo.png`
- 페이지: `/src/pages/*.tsx` 및 하위 디렉토리
- 설정: `vite.config.ts`, `package.json`

### Git 히스토리
```bash
# 변경 이력 확인
git log --oneline --graph -10

# 특정 파일 변경 이력
git log --follow -- src/pages/home.tsx

# 이전 버전으로 복구 (주의!)
git reset --hard <커밋해시>
git push origin main --force
```

---

## ✨ 다음 작업을 위한 팁

1. **작업 시작 전**
   - 항상 `git status`로 현재 상태 확인
   - 최신 코드 동기화: `git pull origin main`
   - 빌드 테스트: `npm run build`

2. **작업 중**
   - 자주 커밋하기
   - 명확한 커밋 메시지 작성
   - 빌드 확인 후 푸시

3. **작업 완료 후**
   - 배포 확인: https://wow-campus-platform.pages.dev
   - 세션 요약 업데이트 (필요시)

---

**마지막 업데이트:** 2025-11-12
**다음 세션 준비 완료** ✅
