# Cloudflare Pages 빌드 설정

## 🚨 중요: Cloudflare 대시보드 빌드 설정

Cloudflare Pages 대시보드에서 다음 설정을 적용해야 합니다:

### 빌드 설정
```
Framework preset: None (또는 Vite)
Build command: npm run build
Build output directory: dist
```

### 환경 변수
```
NODE_VERSION=18
```

### 빌드 프로세스
1. `npm ci` - 의존성 설치
2. `npm run build` - Vite 빌드 실행
3. Vite 플러그인이 자동으로 `public/static/*` 파일을 `dist/static/`로 복사
4. 빌드 결과물이 `dist/` 디렉토리에 생성됨

## 문제 해결

### GitHub 자동 빌드가 404를 반환하는 경우

**증상**: Cloudflare Pages가 GitHub에서 자동 빌드하지만 배포된 사이트가 404 에러

**원인**: 
- Cloudflare 대시보드의 빌드 명령어가 잘못 설정됨
- 빌드 출력 디렉토리가 올바르지 않음  
- Node.js 버전 불일치

**해결방법**:
1. Cloudflare Pages 대시보드 접속
2. 프로젝트 설정 → Build & deployments
3. 빌드 설정 확인 및 수정:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `18` (환경 변수)

### 임시 해결책: 직접 배포

GitHub 자동 빌드가 작동하지 않는 경우, 로컬에서 직접 배포:

```bash
# 빌드 및 배포
npm run build
npx wrangler pages deploy dist --project-name=wow-campus-platform --branch=main
```

또는 단축 명령어:
```bash
npm run deploy:prod
```

## 빌드 검증

로컬에서 빌드가 올바른지 확인:

```bash
# 빌드
npm run build

# dist 폴더 확인
ls -la dist/
ls -la dist/static/

# _worker.js와 static 파일들이 있어야 함
# - dist/_worker.js
# - dist/static/app.js
# - dist/static/style.css
# - dist/_redirects
```

## Vite 설정

`vite.config.ts`에 커스텀 플러그인이 설정되어 있음:
- 빌드 후 `public/static/*` 파일을 `dist/static/`로 자동 복사
- 이는 Cloudflare Pages 빌드에서 public 폴더가 자동으로 처리되지 않는 문제를 해결

## 참고

- Cloudflare Pages 빌드는 `wrangler.jsonc`의 `pages_build_output_dir` 설정을 사용
- Node.js 버전은 `.nvmrc` 파일에 명시됨 (18)
- `package.json`의 `build` 스크립트가 빌드 명령어로 사용됨
