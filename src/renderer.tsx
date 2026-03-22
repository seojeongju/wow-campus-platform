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
}

// 사이트 기본 설정
const SITE_URL = 'https://www.wowcampus.kr'
const SITE_NAME = 'WOW-CAMPUS'
const DEFAULT_TITLE = '한국 외국인 취업 플랫폼 WOW-CAMPUS | 구인구직·AI매칭·유학 한번에'
const DEFAULT_DESCRIPTION = '외국인을 위한 한국 No.1 취업·유학 플랫폼. E-7 비자·숙련기능인력·고용허가제 정보, AI 스마트매칭, 협약대학교 입학까지 한 번에 해결. 지금 바로 한국 취업을 시작하세요.'
const DEFAULT_KEYWORDS = '외국인 취업, 한국 취업, 외국인 구인구직, E-7 비자, 숙련기능인력, 고용허가제, E-9 비자, 한국 취업 비자, 외국인 채용, 외국인 일자리, 한국 유학, 외국인 유학생, 어학연수, 한국 대학교 입학, AI 매칭, 외국인 채용 플랫폼, wow-campus, 한국어 교육, 외국인 근로자, 취업비자 코리아'
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`

// 네이버/구글 사이트 인증 코드 (환경변수가 없을 경우 빈 문자열)
// 실제 코드: 네이버 서치어드바이저 > 사이트 등록 > 소유확인 메타태그 값
const NAVER_SITE_VERIFICATION = '8205fc7c82d929e7088ed777bebdb0f6bc475c10'
const GOOGLE_SITE_VERIFICATION = '5qIvfYcKXui5HMb44COr9O9JOiFDoNRTOnA_UzrsfTw'

// 지원 언어 목록 (hreflang)
const SUPPORTED_LANGS = ['ko', 'en', 'ja', 'vi', 'zh']

export const renderer = jsxRenderer(({ children, title, description, keywords, jsonLd: pageJsonLd }: any, c) => {
  const lang = c.get('locale') || 'ko'
  const translations = allTranslations[lang] || allTranslations['ko']

  // 페이지별 메타 또는 기본값 사용
  const pageTitle = title || DEFAULT_TITLE
  const pageDescription = description || DEFAULT_DESCRIPTION
  const pageKeywords = keywords || DEFAULT_KEYWORDS

  // 현재 페이지 경로
  const currentPath = new URL(c.req.url).pathname
  const canonicalUrl = `${SITE_URL}${currentPath}`

  // JSON-LD 구조화 데이터 (Organization + WebSite SearchBox)
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'WOW-CAMPUS',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/images/logo.png`,
          width: 200,
          height: 60,
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '02-3144-3137',
            contactType: 'customer support',
            areaServed: 'KR',
            availableLanguage: ['Korean', 'English', 'Japanese', 'Vietnamese', 'Chinese'],
          },
        ],
        sameAs: [
          'https://www.facebook.com/wowcampus.kr',
          'https://www.instagram.com/wowcampus.kr',
          'https://www.linkedin.com/company/wowcampus',
          'https://www.youtube.com/@wowcampus',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'WOW-CAMPUS',
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: ['ko', 'en', 'ja', 'vi', 'zh'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/jobs?keyword={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  // 페이지별 추가 구조화 데이터가 있으면 @graph에 추가
  if (pageJsonLd) {
    if (Array.isArray(pageJsonLd)) {
      jsonLd['@graph'].push(...pageJsonLd)
    } else {
      jsonLd['@graph'].push(pageJsonLd)
    }
  }

  return (
    <html lang={lang}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* === 파비콘 === */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="google" content="notranslate" />

        {/* === 기본 SEO 메타태그 (페이지별 오버라이드 지원) === */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="author" content={SITE_NAME} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* === Canonical URL === */}
        <link rel="canonical" href={canonicalUrl} />

        {/* === hreflang (다국어 SEO) === */}
        {SUPPORTED_LANGS.map((l) => (
          <link
            rel="alternate"
            hreflang={l === 'zh' ? 'zh-Hans' : l}
            href={`${SITE_URL}${currentPath}${currentPath.includes('?') ? '&' : '?'}lang=${l}`}
          />
        ))}
        <link rel="alternate" hreflang="x-default" href={`${SITE_URL}${currentPath}`} />

        {/* === Open Graph (페이스북, 네이버 블로그 공유) === */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:locale" content={lang === 'ko' ? 'ko_KR' : lang === 'ja' ? 'ja_JP' : lang === 'zh' ? 'zh_CN' : lang === 'vi' ? 'vi_VN' : 'en_US'} />

        {/* === Twitter Card === */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:site" content="@wowcampus" />

        {/* === 네이버 서치어드바이저 사이트 인증 === */}
        {NAVER_SITE_VERIFICATION && (
          <meta name="naver-site-verification" content={NAVER_SITE_VERIFICATION} />
        )}

        {/* === 구글 서치콘솔 사이트 인증 === */}
        {GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
        )}

        {/* === 네이버 SNS 공유 최적화 (네이버톡톡/블로그) === */}
        <meta property="og:image:alt" content={`${SITE_NAME} - 외국인 취업·유학 플랫폼`} />

        {/* === JSON-LD 구조화 데이터 === */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* === 번역 데이터 === */}
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
