import { Hono } from 'hono'
import type { Bindings, Variables } from '../types/env'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const BASE_URL = 'https://www.wowcampus.kr'

// 정적 공개 페이지 목록
const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/jobs', changefreq: 'hourly', priority: '0.9' },
  { url: '/jobseekers', changefreq: 'hourly', priority: '0.9' },
  { url: '/study', changefreq: 'weekly', priority: '0.8' },
  { url: '/study/korean', changefreq: 'weekly', priority: '0.8' },
  { url: '/study/undergraduate', changefreq: 'weekly', priority: '0.8' },
  { url: '/study/graduate', changefreq: 'weekly', priority: '0.8' },
  { url: '/universities', changefreq: 'weekly', priority: '0.8' },
  { url: '/global-support', changefreq: 'weekly', priority: '0.7' },
  { url: '/global-support/visa', changefreq: 'weekly', priority: '0.7' },
  { url: '/global-support/legal', changefreq: 'weekly', priority: '0.7' },
  { url: '/global-support/finance', changefreq: 'weekly', priority: '0.7' },
  { url: '/global-support/telecom', changefreq: 'weekly', priority: '0.7' },
  { url: '/global-support/academic', changefreq: 'weekly', priority: '0.7' },
  { url: '/global-support/employment', changefreq: 'weekly', priority: '0.7' },
  { url: '/faq', changefreq: 'weekly', priority: '0.6' },
  { url: '/guide', changefreq: 'weekly', priority: '0.6' },
  { url: '/notice', changefreq: 'daily', priority: '0.6' },
  { url: '/blog', changefreq: 'daily', priority: '0.6' },
  { url: '/contact', changefreq: 'monthly', priority: '0.5' },
  { url: '/support', changefreq: 'monthly', priority: '0.5' },
  { url: '/terms', changefreq: 'monthly', priority: '0.3' },
  { url: '/privacy', changefreq: 'monthly', priority: '0.3' },
  { url: '/cookies', changefreq: 'monthly', priority: '0.3' },
]

// XML 이스케이프
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// GET /sitemap.xml
app.get('/', async (c) => {
  const today = new Date().toISOString().split('T')[0]

  // 동적 구인정보 URL 가져오기 (DB에서)
  let jobUrls: string[] = []
  try {
    if (c.env?.DB) {
      const result = await c.env.DB.prepare(
        `SELECT id FROM jobs WHERE status = 'active' OR status IS NULL ORDER BY created_at DESC LIMIT 200`
      ).all()
      jobUrls = (result.results || []).map((row: any) => `/jobs/${row.id}`)
    }
  } catch (e) {
    console.error('[sitemap] DB 조회 실패:', e)
  }

  // XML 생성
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`

  // 정적 페이지
  for (const page of staticPages) {
    xml += `  <url>\n`
    xml += `    <loc>${escapeXml(BASE_URL + page.url)}</loc>\n`
    xml += `    <lastmod>${today}</lastmod>\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += `  </url>\n`
  }

  // 동적 구인정보 페이지
  for (const url of jobUrls) {
    xml += `  <url>\n`
    xml += `    <loc>${escapeXml(BASE_URL + url)}</loc>\n`
    xml += `    <lastmod>${today}</lastmod>\n`
    xml += `    <changefreq>weekly</changefreq>\n`
    xml += `    <priority>0.7</priority>\n`
    xml += `  </url>\n`
  }

  xml += `</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})

export default app
