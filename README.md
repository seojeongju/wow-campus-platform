# WOW-CAMPUS 외국인 구인구직 플랫폼

외국인 인재를 위한 한국 취업 및 구직 플랫폼

## 🚀 빠른 시작

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/seojeongju/wow-campus-platform.git
cd wow-campus-platform

# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
```

### 배포

```bash
# Cloudflare Pages에 배포
npm run deploy
```

## 📋 현재 상태 (2025-11-03)

### ✅ 완료된 기능

- **인증 시스템**: 로그인/회원가입, 자동 로그인 복원
- **통합 네비게이션**: 모든 사용자에게 일관된 메뉴
- **구인정보 페이지**: 필터 시스템, 카드 리스트, 페이지네이션
- **구직정보 페이지**: 로그인 필수, 필터 시스템, 상세보기
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원

### 🔄 다음 단계

1. **구직자 대시보드** 개선
2. **기업 대시보드** 개선
3. **에이전트 대시보드** 구현
4. **관리자 대시보드** 구현

자세한 내용은 [PROJECT_STATUS.md](./PROJECT_STATUS.md) 참고

## 🛠️ 기술 스택

- **프레임워크**: Hono (TypeScript)
- **배포**: Cloudflare Pages
- **데이터베이스**: Cloudflare D1
- **스타일**: Tailwind CSS
- **빌드**: Vite

## 📂 프로젝트 구조

```
src/
├── index.tsx              # 메인 애플리케이션
├── pages/                 # 페이지 컴포넌트
│   ├── jobs/             # 구인정보
│   ├── jobseekers/       # 구직정보
│   ├── dashboard/        # 대시보드
│   └── ...
└── api/                   # API 엔드포인트
    ├── auth/             # 인증
    ├── jobs/             # 구인정보
    └── jobseekers/       # 구직정보
```

## 🔧 개발 가이드

### 커밋 메시지 규칙

```
<type>(<scope>): <subject>

types:
  - feat: 새로운 기능
  - fix: 버그 수정
  - docs: 문서 변경
  - style: 코드 스타일 변경
  - refactor: 리팩토링
  - test: 테스트 추가/수정
  - chore: 빌드/설정 변경
```

### 코드 스타일

- TypeScript 사용
- Tailwind CSS 우선
- 컴포넌트별 독립성 유지
- 명확한 주석 작성

## 📦 백업 및 복원

### 백업 생성

```bash
cd /home/user
tar --exclude='webapp/node_modules' --exclude='webapp/dist' --exclude='webapp/.git' \
    -czf webapp-backup-$(date +%Y-%m-%d).tar.gz webapp/
```

### 백업 복원

```bash
cd /home/user
tar -xzf webapp-backup-YYYY-MM-DD.tar.gz
cd webapp
npm install
npm run deploy
```

## 🌐 배포 URL

- **최신 배포**: https://2804d3e2.wow-campus-platform.pages.dev
- **프로덕션**: https://wow-campus-platform.pages.dev

## 📞 연락처

- **GitHub**: https://github.com/seojeongju/wow-campus-platform
- **Issues**: https://github.com/seojeongju/wow-campus-platform/issues

## 📄 라이센스

이 프로젝트는 비공개 프로젝트입니다.

---

**현재 버전**: 1.0.0 (안정 버전)  
**마지막 업데이트**: 2025-11-03  
**다음 작업**: 대시보드 기능 개선
