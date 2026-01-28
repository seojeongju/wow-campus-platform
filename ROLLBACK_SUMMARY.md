# 🔄 롤백 요약 및 정리

## 📅 롤백 정보
- **롤백 시점**: 23일 전 (2026-01-05 경)
- **현재 상태**: 이전에 작동하던 설정으로 복원됨

## ❌ 실패한 시도들 (제거됨)

### 시도한 방법들
1. ❌ `@hono/vite-build/cloudflare-pages` 플러그인 사용
   - 문제: CI에서 22KB만 생성 (의존성 번들링 실패)
   - 로컬: 1.4MB 생성
   - CI: 22KB만 생성

2. ❌ `lib` 모드 + 상대 경로 `'src/index.tsx'`
   - 문제: CI에서 "Could not resolve entry module" 오류
   - 로컬: 성공
   - CI: 실패

3. ❌ `lib` 모드 + `resolve(__dirname, 'src/index.tsx')`
   - 문제: CI에서 경로 해석 실패
   - 로컬: 성공
   - CI: 실패

4. ❌ `process.cwd()` 사용
   - 문제: CI 환경에서 작동하지 않음

5. ❌ `rollupOptions.input`만 사용 (lib 모드 없이)
   - 문제: CI에서 entry 모듈을 찾지 못함

## ✅ 이전에 성공했던 설정 (참고)

### 성공한 배포 기록
- **2025-10-14**: 빌드 성공 (775.18 kB, 61 modules)
- **2025-10-13**: 배포 성공

### 성공했던 빌드 결과
```
✓ 61 modules transformed.
dist/_worker.js  775.18 kB │ gzip: 123.95 kB
✓ built in 1.84s
```

## 🔍 현재 상태 확인 필요

롤백 후 현재 `vite.config.ts` 설정을 확인하고, 이전에 작동했던 설정과 비교해야 합니다.

## 📋 다음 단계

1. 현재 `vite.config.ts` 확인
2. 이전에 성공했던 커밋의 `vite.config.ts` 확인
3. 작동하는 설정으로 복원
