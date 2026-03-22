# 🔍 배포 문제 진단 체크리스트

## 근본 원인 분석

### 현재 상황
- ✅ 로컬 빌드: 성공 (1.8MB 파일 생성)
- ❌ Cloudflare Pages CI: 실패 (entry 모듈을 찾지 못함)
- ❌ `@hono/vite-build/cloudflare-pages`: 22KB만 생성 (의존성 번들링 실패)

### 확인이 필요한 정보

#### 1. Cloudflare Pages 빌드 설정 (대시보드에서 확인)
```
- Build command: ?
- Build output directory: ?
- Root directory: ?
- Node version: ?
- Environment variables: ?
```

#### 2. 실제로 작동하는 Hono 프로젝트의 vite.config.ts
다른 성공한 Hono + Cloudflare Pages 프로젝트가 있다면 그 설정을 공유해주세요.

#### 3. Cloudflare Pages 빌드 로그 전체
특히 다음 부분:
- 작업 디렉토리 경로
- `npm run build` 실행 시 실제 경로
- Vite가 entry를 찾는 시도 과정

#### 4. 프로젝트 구조 확인
현재 프로젝트 루트에서:
- `src/index.tsx` 파일이 실제로 존재하는지
- `package.json`의 `build` 스크립트가 정확한지

## 가능한 해결 방법들

### 방법 1: 절대 경로 대신 상대 경로만 사용
```typescript
build: {
  lib: {
    entry: 'src/index.tsx',  // 절대 경로 없이
    formats: ['es'],
    fileName: () => '_worker.js'
  }
}
```

### 방법 2: @hono/vite-build/cloudflare-pages 플러그인 제대로 설정
```typescript
build({
  entry: 'src/index.tsx',  // 상대 경로
  output: '_worker.js',
  outputDir: 'dist',
  external: [],  // 모든 의존성 번들링
})
```

### 방법 3: rollupOptions.input 사용
```typescript
build: {
  rollupOptions: {
    input: 'src/index.tsx',
    output: {
      file: 'dist/_worker.js',
      format: 'es'
    }
  }
}
```

## 다음 단계

1. Cloudflare Pages 대시보드에서 빌드 설정 스크린샷 공유
2. 성공한 다른 Hono 프로젝트의 vite.config.ts 공유 (있다면)
3. Cloudflare Pages 빌드 로그 전체 공유 (특히 경로 관련 부분)
