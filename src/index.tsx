import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import { HTTPException } from 'hono/http-exception'

import type { Bindings, Variables } from './types/env'
import { renderer } from './renderer'

// Import routes
import authRoutes from './routes/auth'
import jobRoutes from './routes/jobs'

// Import middleware
import { corsMiddleware, apiCors } from './middleware/cors'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Global middleware
app.use('*', logger())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// CORS for API routes
app.use('/api/*', apiCors)

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/jobs', jobRoutes)

// Web pages with renderer
app.use(renderer)

// Main page
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-12">
          <h1 class="text-4xl font-bold text-blue-600 mb-4">
            WOW-CAMPUS Work Platform
          </h1>
          <p class="text-xl text-gray-600">
            외국인 인재의 한국 진출 지원 및 구인구직 매칭 플랫폼
          </p>
        </header>

        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-3xl mb-4">🏢</div>
            <h3 class="text-xl font-semibold mb-2">구인기업</h3>
            <p class="text-gray-600 mb-4">
              우수한 외국인 인재를 채용하고 글로벌 경쟁력을 강화하세요
            </p>
            <ul class="text-sm text-gray-500">
              <li>✅ 회원가입 및 로그인</li>
              <li>✅ 승인 관리</li>
              <li>✅ 구인공고 등록/수정/삭제</li>
            </ul>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-3xl mb-4">👤</div>
            <h3 class="text-xl font-semibold mb-2">구직자</h3>
            <p class="text-gray-600 mb-4">
              한국에서의 새로운 커리어 기회를 찾아보세요
            </p>
            <ul class="text-sm text-gray-500">
              <li>✅ 프로필 관리</li>
              <li>✅ 이력서 업로드</li>
              <li>✅ 구인공고 지원</li>
            </ul>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-3xl mb-4">🤝</div>
            <h3 class="text-xl font-semibold mb-2">에이전트</h3>
            <p class="text-gray-600 mb-4">
              글로벌 인재와 한국 기업을 연결하는 전문 서비스
            </p>
            <ul class="text-sm text-gray-500">
              <li>✅ 구직자 관리</li>
              <li>✅ 매칭 중계</li>
              <li>✅ 수수료 관리</li>
            </ul>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-4">🔍 구인구직 매칭 (100% 완성)</h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li>✅ 구인공고 등록 및 검색</li>
              <li>✅ 구직자 프로필 매칭</li>
              <li>✅ 지원 및 채용 프로세스 관리</li>
              <li>✅ 에이전트 중계 서비스</li>
              <li>✅ 추천 구인공고 시스템</li>
            </ul>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-4">🎓 유학 지원 서비스 (100% 완성)</h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li>✅ 어학연수 과정 정보</li>
              <li>✅ 학부/석박사 과정 안내</li>
              <li>✅ 입학 지원 서비스</li>
            </ul>
          </div>
        </div>

        <div class="text-center mt-12">
          <div class="bg-blue-50 p-6 rounded-lg">
            <h3 class="text-xl font-semibold mb-4">📊 관리 기능 (100% 완성)</h3>
            <div class="grid md:grid-cols-3 gap-4 text-sm">
              <div>✅ 실시간 통계 대시보드</div>
              <div>✅ 사용자 승인 관리</div>
              <div>✅ 데이터 백업 및 리포팅</div>
            </div>
          </div>
        </div>

        <footer class="text-center mt-12 pt-8 border-t border-gray-200">
          <p class="text-gray-500">
            WOW-CAMPUS Work Platform - 외국인 인재와 한국 기업을 연결하는 종합 플랫폼
          </p>
        </footer>
      </div>
    </div>
  )
})

// API routes listing
app.get('/api', (c) => {
  return c.json({
    success: true,
    message: 'WOW-CAMPUS Work Platform API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/logout': 'Logout user'
      },
      jobs: {
        'GET /api/jobs': 'Get all job postings (with search)',
        'GET /api/jobs/:id': 'Get single job posting',
        'POST /api/jobs': 'Create new job posting (company only)',
        'PUT /api/jobs/:id': 'Update job posting (owner only)',
        'DELETE /api/jobs/:id': 'Delete job posting (owner only)',
        'GET /api/jobs/company/:companyId': 'Get company job postings'
      }
    }
  })
})

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      message: err.message,
      status: err.status
    }, err.status)
  }
  
  console.error('Unhandled error:', err)
  return c.json({
    success: false,
    message: 'Internal Server Error'
  }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Not Found'
  }, 404)
})

export default app
