import { jsxRenderer } from 'hono/jsx-renderer'
import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import vi from './locales/vi.json'
import zh from './locales/zh.json'

// 모든 언어 파일을 여기에 추가하면 자동으로 지원됩니다
const allTranslations: Record<string, any> = {
  en,
  ko,
  ja,
  vi,
  zh,
  // 새로운 언어를 추가하려면 여기에 import하고 추가하세요
}

export const renderer = jsxRenderer(({ children }, c) => {
  const lang = c.get('locale') || 'ko'
  // 지원되는 언어가 아니면 기본 언어(ko) 사용
  const translations = allTranslations[lang] || allTranslations['ko']

  return (
    <html lang={lang}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google" content="notranslate" />
        <title>WOW-CAMPUS Work Platform</title>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.locale = '${lang}';
            window.translations = ${JSON.stringify(translations)};
            window.t = function(key) {
              const keys = key.split('.');
              let value = window.translations;
              for (const k of keys) {
                value = value && value[k];
              }
              return value || key;
            };
          `
        }} />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/assets/style.css" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            .container { max-width: 1200px; }
            .fade-in { animation: fadeIn 0.5s ease-in; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .hover-scale { transition: transform 0.2s; }
            .hover-scale:hover { transform: scale(1.02); }
          `
        }} />
      </head>
      <body class="bg-gray-50 text-gray-900 notranslate">
        {children}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/assets/toast.js"></script>
        <script src="/assets/js/common.js"></script>
        <script src="/assets/js/utils.js"></script>
        <script src="/assets/js/ui.js"></script>
        <script src="/assets/js/auth.js"></script>
        <script src="/assets/js/auth-init.js"></script>
        <script src="/assets/statistics.js"></script>
      </body>
    </html>
  )
})
