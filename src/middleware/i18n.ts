import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import en from '../locales/en.json'
import ko from '../locales/ko.json'
import ja from '../locales/ja.json'
import vi from '../locales/vi.json'
import zh from '../locales/zh.json'

// Define the type for the translations
type Translations = Record<string, any>

// Extend Hono Variables
declare module 'hono' {
    interface ContextVariableMap {
        locale: string
        t: (key: string) => string
        i18n: {
            language: string
            t: (key: string) => string
        }
    }
}

// 모든 언어 파일을 여기에 추가하면 자동으로 지원됩니다
// 새로운 언어를 추가하려면:
// 1. src/locales/{언어코드}.json 파일 생성 (예: ja.json, zh.json)
// 2. 아래 translations 객체에 추가
// 3. supportedLangs 배열에 언어 코드 추가
const translations: Record<string, Translations> = {
    en,
    ko,
    ja,
    vi,
    zh,
    // 새로운 언어를 추가하려면 여기에 import하고 추가하세요
}

// 지원되는 언어 목록 (자동으로 translations의 키에서 가져올 수도 있지만, 명시적으로 관리하는 것이 더 안전합니다)
const supportedLangs = Object.keys(translations)

// Helper to access nested keys string 'common.login'
const getNestedValue = (obj: any, key: string): string => {
    try {
        const keys = key.split('.')
        let result = obj
        for (const k of keys) {
            if (result === null || result === undefined) {
                return key
            }
            result = result[k]
        }
        return result || key
    } catch (e) {
        return key
    }
}

export const i18nMiddleware = async (c: Context, next: Next) => {
    // 1. Check Query Param ?lang=ko
    let lang = c.req.query('lang')
    let source = 'query'

    // 2. Check Cookie
    if (!lang) {
        lang = getCookie(c, 'app_lang')
        if (lang) source = 'cookie'
    }

    // 3. Check Header
    if (!lang) {
        const acceptLanguage = c.req.header('Accept-Language')
        if (acceptLanguage) {
            source = 'header'
            // Simple parsing for prioritize zh, ko, ja, vi, en
            const headerLangs = acceptLanguage.split(',').map(l => l.split(';')[0].trim().split('-')[0])
            for (const hl of headerLangs) {
                if (supportedLangs.includes(hl)) {
                    lang = hl
                    break
                }
            }
        }
    }

    // Default to 'ko' if not found
    if (!lang) {
        lang = 'ko'
        source = 'default'
    }

    // Validate and sanitize
    let finalLang = String(lang).toLowerCase()
    if (!supportedLangs.includes(finalLang)) {
        // Map zh-cn, zh-tw etc to zh if zh is supported
        if (finalLang.startsWith('zh')) finalLang = 'zh'
        else finalLang = 'ko'
    }

    // Debug Log (will show in server console)
    console.log(`[i18n] Path: ${c.req.path}, Decided: ${finalLang}, Source: ${source}, Cookie: ${getCookie(c, 'app_lang')}, Header: ${c.req.header('Accept-Language')}`)

    // Translation function
    const t = (key: string): string => {
        const dict = translations[finalLang] || translations['ko']
        return getNestedValue(dict, key)
    }

    // Set to context variables
    c.set('locale', finalLang)
    c.set('t', t)
    c.set('i18n', { language: finalLang, t })

    await next()
}
