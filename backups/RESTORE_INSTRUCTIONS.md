# 복원 가이드

## 문제 발생 시 복원 방법

### 방법 1: Git을 사용한 복원 (권장)

```bash
# 현재 변경사항을 모두 취소하고 백업 시점으로 복원
git reset --hard <백업_커밋_해시>

# 또는 특정 파일만 복원
git checkout <백업_커밋_해시> -- src/middleware/i18n.ts
git checkout <백업_커밋_해시> -- src/renderer.tsx
```

### 방법 2: 백업 파일을 사용한 복원

```bash
# 백업 파일에서 복원
copy backups\before-new-language\i18n.ts.bak src\middleware\i18n.ts
copy backups\before-new-language\renderer.tsx.bak src\renderer.tsx

# 추가된 언어 파일 삭제 (선택사항)
del src\locales\ja.json
```

### 방법 3: 수동 복원

1. `src/middleware/i18n.ts`에서 추가된 언어 관련 코드 제거:
   - `import <언어> from '../locales/<언어>.json'` 삭제
   - `translations` 객체에서 해당 언어 제거

2. `src/renderer.tsx`에서 추가된 언어 관련 코드 제거:
   - `import <언어> from './locales/<언어>.json'` 삭제
   - `allTranslations` 객체에서 해당 언어 제거

3. `src/locales/<언어>.json` 파일 삭제 (선택사항)

## 백업 정보

### 일본어 추가 전 백업
- **백업 커밋**: `ea39d21` - "Backup: Save current state before adding new language"
- **백업 날짜**: 2026-01-03
- **백업 파일 위치**: `backups/before-new-language/`

### 일본어 번역 완료 후 백업
- **백업 커밋**: `638364b` - "Add missing Japanese translations: police, fire, online_consultation.button"
- **백업 날짜**: 2026-01-03
- **상태**: 일본어 번역 완료, 모든 `en.json` 키 번역됨
- **지원 언어**: 한국어(ko), 영어(en), 일본어(ja)

## 다음 언어 추가 시 참고사항

1. 현재 상태를 백업 커밋으로 저장
2. `docs/ADD_NEW_LANGUAGE.md` 가이드 참고
3. 새로운 언어 파일 생성 및 번역
4. `src/middleware/i18n.ts` 및 `src/renderer.tsx` 수정
5. 언어 선택 UI 업데이트 (선택사항)
