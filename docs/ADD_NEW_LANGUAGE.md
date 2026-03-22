# 새로운 언어 추가 가이드

이 가이드는 WOW-CAMPUS 플랫폼에 새로운 언어를 추가하는 방법을 설명합니다.

## 🎯 간단한 방법 (3단계)

새로운 언어를 추가하려면 **단 3단계**만 수행하면 됩니다:

### 1단계: 번역 파일 생성
`src/locales/` 디렉토리에 새로운 언어 파일을 생성합니다.

예: 일본어를 추가하려면
```bash
# ko.json을 복사하여 ja.json 생성
cp src/locales/ko.json src/locales/ja.json
```

그리고 `ja.json` 파일의 모든 값들을 일본어로 번역합니다.

### 2단계: 미들웨어에 추가
`src/middleware/i18n.ts` 파일을 열고:

```typescript
// 1. 파일 상단에 import 추가
import ja from '../locales/ja.json'

// 2. translations 객체에 추가
const translations: Record<string, Translations> = {
    en,
    ko,
    ja,  // 새로 추가
}
```

### 3단계: 렌더러에 추가
`src/renderer.tsx` 파일을 열고:

```typescript
// 1. 파일 상단에 import 추가
import ja from './locales/ja.json'

// 2. allTranslations 객체에 추가
const allTranslations: Record<string, any> = {
  en,
  ko,
  ja,  // 새로 추가
}
```

### 4단계 (선택사항): 언어 선택 UI 추가
각 페이지의 언어 선택 드롭다운에 새로운 언어 옵션을 추가합니다.

예: `src/pages/home.tsx`의 언어 선택 부분에 추가
```tsx
<a href="#" onclick="changeLanguage('ja')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">日本語</a>
```

## ✅ 완료!

이제 새로운 언어가 추가되었습니다. 빌드하고 배포하면 됩니다.

## 📝 주의사항

1. **모든 키 번역**: 모든 번역 키를 번역해야 합니다. 누락된 키는 키 이름 자체가 표시됩니다.
2. **JSON 구조 일치**: 번역 파일의 구조는 `ko.json`과 정확히 일치해야 합니다.
3. **빌드 테스트**: 새로운 언어를 추가한 후 반드시 빌드 테스트를 수행하세요.

## 🔄 자동화 개선 (향후 계획)

현재는 2개 파일만 수정하면 되지만, 향후 다음과 같이 개선할 수 있습니다:
- 언어 파일을 자동으로 감지하여 import
- 지원 언어 목록을 동적으로 생성
- 번역 누락 감지 도구

## 📋 예시: 일본어 추가 전체 과정

1. `src/locales/ja.json` 생성 (ko.json 복사 후 번역)
2. `src/middleware/i18n.ts`에 `import ja from '../locales/ja.json'` 추가
3. `translations` 객체에 `ja,` 추가
4. `src/renderer.tsx`에 `import ja from './locales/ja.json'` 추가
5. `allTranslations` 객체에 `ja,` 추가
6. 각 페이지의 언어 선택 UI에 일본어 옵션 추가 (선택사항)

**총 수정 파일: 2개 (필수) + N개 (언어 선택 UI, 선택사항)**
