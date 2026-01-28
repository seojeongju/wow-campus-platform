# 🚀 자동 배포 설정 가이드

## ✅ 완료된 작업

GitHub Actions 워크플로우 파일이 생성되었습니다:
- `.github/workflows/deploy.yml`

## 🔧 필수 설정: GitHub Secrets

워크플로우가 작동하려면 GitHub 저장소에 다음 Secrets를 설정해야 합니다.

### 1. GitHub 저장소 Secrets 설정

1. **GitHub 저장소 접속**
   - https://github.com/seojeongju/wow-campus-platform

2. **Settings 메뉴로 이동**
   - 저장소 상단의 **Settings** 탭 클릭

3. **Secrets and variables → Actions로 이동**
   - 좌측 메뉴에서 **Secrets and variables**
   - **Actions** 선택

4. **필수 Secrets 추가**

   클릭 **New repository secret** 버튼을 클릭하여 다음 두 개의 Secret을 추가:

   #### Secret 1: `CLOUDFLARE_API_TOKEN`
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Cloudflare API 토큰
   - **참고**: Cloudflare Dashboard에서 생성한 API 토큰

   #### Secret 2: `CLOUDFLARE_ACCOUNT_ID`
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: `85c8e953bdefb825af5374f0d66ca5dc`
   - **참고**: 문서에서 확인한 Account ID

### 2. Cloudflare API 토큰 생성 (필요한 경우)

Cloudflare API 토큰이 없다면:

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com/profile/api-tokens

2. **API 토큰 생성**
   - **Create Token** 클릭
   - **Create Custom Token** 선택

3. **권한 설정**
   - **Account** → `Cloudflare Pages` → `Edit` 권한 추가
   - **Account** → `Account` → `Read` 권한 추가 (선택)

4. **계정 리소스 선택**
   - **Account Resources** → `Include - All accounts` 선택

5. **토큰 생성**
   - **Continue to summary** → **Create Token**
   - 생성된 토큰을 복사 (한 번만 보여짐!)

6. **GitHub Secrets에 추가**
   - 위의 4번 단계에서 `CLOUDFLARE_API_TOKEN`으로 추가

## 📋 워크플로우 동작 방식

### 자동 트리거 조건

1. **main 브랜치에 push**
   - `git push origin main` 실행 시 자동 배포

2. **수동 실행**
   - GitHub Actions 탭에서 **Run workflow** 버튼 클릭

### 배포 프로세스

1. ✅ 코드 체크아웃
2. ✅ Node.js 18 환경 설정
3. ✅ 의존성 설치 (`npm ci`)
4. ✅ 프로덕션 빌드 (`npm run build`)
5. ✅ Cloudflare Pages 배포 (`dist` 폴더)

### 예상 배포 시간

- **전체 프로세스**: 약 3-5분
- **빌드 시간**: 약 2-3분
- **배포 시간**: 약 1-2분

## 🔍 배포 상태 확인

### GitHub Actions에서 확인

1. **GitHub 저장소 → Actions 탭**
2. 최신 워크플로우 실행 확인
3. 각 단계별 로그 확인

### Cloudflare Dashboard에서 확인

1. **https://dash.cloudflare.com**
2. **Workers & Pages** → **wow-campus-platform** 선택
3. 최신 배포 확인

## ⚠️ 주의사항

1. **Secrets 설정 필수**
   - Secrets가 설정되지 않으면 배포가 실패합니다
   - Secrets는 저장소 소유자만 설정할 수 있습니다

2. **빌드 실패 시**
   - Actions 탭에서 빌드 로그 확인
   - 로컬에서 `npm run build` 실행하여 확인

3. **배포 실패 시**
   - Cloudflare API 토큰 권한 확인
   - Account ID 확인

## 🎯 다음 단계

1. ✅ GitHub Secrets 설정 (위의 1번 단계)
2. ✅ 이 워크플로우 파일을 커밋하고 푸시
3. ✅ main 브랜치에 푸시하여 자동 배포 테스트

## 📝 참고 자료

- [Cloudflare Pages Actions 문서](https://github.com/cloudflare/pages-action)
- [GitHub Secrets 설정 가이드](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

