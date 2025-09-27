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
    <div class="min-h-screen bg-white">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span class="text-white font-bold text-sm">W</span>
            </div>
            <span class="font-bold text-lg text-gray-900">WOW-CAMPUS</span>
          </div>
          
          <div class="hidden md:flex items-center space-x-8">
            <a href="/jobs" class="text-gray-600 hover:text-blue-600 transition-colors">구인 정보 보기</a>
            <a href="/jobseekers" class="text-gray-600 hover:text-blue-600 transition-colors">구직자</a>
            <a href="/reviews" class="text-gray-600 hover:text-blue-600 transition-colors">후기 게시판</a>
          </div>
          
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              로그인
            </button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              회원가입
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-4">WOW-CAMPUS</h1>
          <p class="text-xl mb-2">외국인들을 위한 급급 급급 취업 & 유학 통합플랫폼</p>
          <p class="text-lg mb-8 opacity-90">해외 에이전트와 국내 구직자 연결하는 외국인 대학의 등록 한국통 제공됩니다</p>
          
          <div class="flex justify-center space-x-4">
            <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              구인정보 보기
            </button>
            <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              본 구직자 보기
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">우리의 서비스</h2>
            <p class="text-gray-600">전문적 구인구직 관련 기업을 연결하는 통합 플랫폼</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-lg shadow-sm text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-handshake text-2xl text-blue-600"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4">구인구직 매칭</h3>
              <p class="text-gray-600 mb-6">
                다양한 직종의 전문 인재를 찾고 계신가요?
                모든 직업에 대한 최고 수준의 인재를
                전문 에이전트가 연결해드립니다
              </p>
              <button class="text-blue-600 font-semibold hover:underline">
                구인정보 보기 →
              </button>
            </div>

            <div class="bg-white p-8 rounded-lg shadow-sm text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-graduation-cap text-2xl text-green-600"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4">유학 지원</h3>
              <p class="text-gray-600 mb-6">
                한국의 뛰어난 대학교와 어학원들을
                연결하여 더 나은 전문적 양성의 기회를
                제공합니다
              </p>
              <button class="text-green-600 font-semibold hover:underline">
                유학지원 보기 →
              </button>
            </div>

            <div class="bg-white p-8 rounded-lg shadow-sm text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-user-tie text-2xl text-purple-600"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4">에이전트 관리</h3>
              <p class="text-gray-600 mb-6">
                구인 에이전트를 위한 지원 및 정보 전달
                통합 에이전트 통계자료
              </p>
              <button class="text-purple-600 font-semibold hover:underline">
                관리자 등록 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Information Section */}
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">최신 정보</h2>
            <p class="text-gray-600">실시간으로 업데이트되는 구인공고와 구직자 정보를 확인하세요</p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8">
            {/* 최신 구인정보 */}
            <div class="bg-white border rounded-lg overflow-hidden" data-section="latest-jobs">
              <div class="bg-blue-50 px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">최신 구인정보</h3>
                  <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">3건</span>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">팀 구성원</h4>
                  <p class="text-sm text-gray-600">Software • Engineer</p>
                  <p class="text-xs text-gray-500 mt-2">삼성전자</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">디자이너</h4>
                  <p class="text-sm text-gray-600">UX/UI • Designer</p>
                  <p class="text-xs text-gray-500 mt-2">네이버</p>
                </div>
                <div class="text-center">
                  <button class="text-blue-600 hover:underline text-sm">
                    본 구인정보 보기
                  </button>
                </div>
              </div>
            </div>

            {/* 구직자 현황 */}
            <div class="bg-white border rounded-lg overflow-hidden">
              <div class="bg-green-50 px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">구직자 현황</h3>
                  <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm">NEW</span>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">네이버 • 서울</h4>
                  <p class="text-sm text-gray-600">Software • Beginner</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">특화 서비스 • 대전</h4>
                  <p class="text-sm text-gray-600">Software • Beginner</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">네이버 • 경기</h4>
                  <p class="text-sm text-gray-600">Software • Beginner</p>
                </div>
                <div class="text-center">
                  <button class="text-green-600 hover:underline text-sm">
                    본 구직자 목록 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">WOW-CAMPUS 통계</h2>
          <p class="text-gray-600 mb-12">실시간으로 업데이트 되는 플랫폼 이용 통계입니다</p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div class="text-4xl font-bold text-blue-600 mb-2" data-stat="jobs">4</div>
              <div class="text-gray-600">등록 구인공고</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-green-600 mb-2" data-stat="jobseekers">14</div>
              <div class="text-gray-600">등록 구직자</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-purple-600 mb-2" data-stat="reviews">0</div>
              <div class="text-gray-600">신청 후기</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-orange-600 mb-2" data-stat="resumes">0</div>
              <div class="text-gray-600">현재 인재이력</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Menu Section */}
      <section class="py-16">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">서비스 메뉴</h2>
          <p class="text-gray-600 mb-12">목적에 맞게 선택해보세요</p>
          
          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button class="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              일반 서비스
            </button>
            <button class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              유학 서비스
            </button>
            <button class="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              전문가 서비스
            </button>
          </div>
        </div>
      </section>
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
