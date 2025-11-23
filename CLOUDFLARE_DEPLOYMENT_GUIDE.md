# WOW-CAMPUS Cloudflare Pages 배포 가이드

## 🚀 즉시 배포 가능한 상태

### ✅ 준비 완료된 요소들
- GitHub 레포지토리: https://github.com/seojeongju/wow-campus-platform
- 빌드 파일: `dist/` 폴더 준비 완료
- 모든 기능: JWT 인증, 프로필 수정, 대시보드 완전 구현

## 📋 배포 방법 (2가지 옵션)

### 방법 1: Cloudflare Dashboard 수동 배포 (권장)

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com/login
   - 계정: jayseo36@gmail.com

2. **Pages 프로젝트 생성**
   - Pages > Create a project
   - Connect to Git > GitHub
   - Repository: seojeongju/wow-campus-platform 선택

3. **빌드 설정**
   ```
   Framework preset: None
   Build command: npm run build  
   Build output directory: dist
   Root directory: /
   ```

4. **환경 변수 설정**
   ```
   NODE_VERSION=18
   ```

### 방법 2: Wrangler CLI 배포

올바른 권한을 가진 API 토큰으로 다시 시도:

```bash
# API 토큰 권한 확인 필요 (Cloudflare Pages:Edit 권한)
export CLOUDFLARE_API_TOKEN=새로운_API_토큰
wrangler pages deploy dist --project-name wow-campus-platform
```

## 🔧 필요한 API 토큰 권한

Cloudflare API 토큰에는 다음 권한이 필요합니다:
- **Cloudflare Pages:Edit**
- **Account:Read** 
- **Zone:Read** (도메인 연결 시)

## 📊 배포 후 확인사항

1. **기본 기능 테스트**
   - 홈페이지 로드 확인
   - 회원가입/로그인 테스트
   - 대시보드 접근 확인

2. **JWT 자동 로그인 테스트**
   - 회원가입 후 자동 로그인 확인
   - 브라우저 새로고침 시 인증 상태 유지 확인

3. **프로필 수정 테스트**
   - /profile 페이지 접근 확인
   - 프로필 정보 수정 및 저장 테스트

## 🌐 예상 배포 URL

배포 완료 후 다음과 같은 URL에서 접근 가능:
- Production: https://wow-campus-platform.pages.dev
- Custom Domain: (설정 시) https://wowcampus.com

## ⚙️ 환경별 설정

### Production 환경변수
```
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

### 데이터베이스 연결
- Cloudflare D1 데이터베이스: wow-campus-platform-db
- 이미 설정된 wrangler.jsonc 구성 사용

## 🔄 CI/CD 자동 배포

GitHub Actions를 통한 자동 배포 설정:

1. **Secrets 설정**
   - CLOUDFLARE_API_TOKEN
   - CLOUDFLARE_ACCOUNT_ID

2. **자동 배포 트리거**
   - main 브랜치 push 시
   - Pull Request merge 시

## 💡 배포 후 다음 단계

1. **도메인 연결** (선택사항)
2. **SSL 인증서** 자동 설정
3. **성능 최적화** 확인
4. **모니터링** 설정
5. **추가 기능 개발** 시작

---

**현재 상태**: 모든 코드가 GitHub에 백업되었으며, 빌드 파일이 준비되어 즉시 배포 가능한 상태입니다.
