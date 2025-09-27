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
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">W</span>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
              <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div class="hidden lg:flex items-center space-x-8">
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                서비스
                <i class="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="/jobs" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">구인정보 보기</a>
                <a href="/study" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">유학정보 보기</a>
                <a href="/agents" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">에이전트 관리</a>
              </div>
            </div>
            <a href="/statistics" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">통계</a>
            <a href="/matching" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">매칭 시스템</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                언어
                <i class="fas fa-globe ml-1 text-xs"></i>
              </button>
              <div class="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">한국어</a>
                <a href="#" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">English</a>
              </div>
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
            
            {/* Mobile Menu Button */}
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" class="lg:hidden bg-white border-t border-gray-200 hidden">
          <div class="container mx-auto px-4 py-4 space-y-4">
            <div class="space-y-2">
              <div class="font-semibold text-gray-900 mb-2">서비스</div>
              <a href="/jobs" class="block pl-4 py-2 text-gray-600 hover:text-blue-600">구인정보 보기</a>
              <a href="/study" class="block pl-4 py-2 text-gray-600 hover:text-blue-600">유학정보 보기</a>
              <a href="/agents" class="block pl-4 py-2 text-gray-600 hover:text-blue-600">에이전트 관리</a>
            </div>
            <a href="/statistics" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">통계</a>
            <a href="/matching" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">매칭 시스템</a>
            <a href="/support" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">고객지원</a>
            <div class="pt-4 border-t border-gray-200">
              <div class="font-semibold text-gray-900 mb-2">언어 설정</div>
              <a href="#" class="block pl-4 py-2 text-gray-600">한국어</a>
              <a href="#" class="block pl-4 py-2 text-gray-600">English</a>
            </div>
          </div>
        </div>
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

      {/* Footer */}
      <footer class="bg-gray-900 text-white">
        <div class="container mx-auto px-4 py-16">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div class="lg:col-span-2">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-xl">W</span>
                </div>
                <div>
                  <div class="font-bold text-2xl">WOW-CAMPUS</div>
                  <div class="text-gray-400 text-sm">외국인 구인구직 및 유학생 지원플랫폼</div>
                </div>
              </div>
              <p class="text-gray-300 mb-6 leading-relaxed">
                해외 에이전트와 국내 기업을 연결하여 외국인 인재의 한국 진출을 지원하는 전문 플랫폼입니다. 
                체계적인 매칭 시스템과 유학 지원 서비스로 성공적인 한국 정착을 돕겠습니다.
              </p>
              
              {/* Contact Info */}
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <i class="fas fa-envelope text-blue-400"></i>
                  <span class="text-gray-300">info@wow-campus.kr</span>
                </div>
                <div class="flex items-center space-x-3">
                  <i class="fas fa-phone text-blue-400"></i>
                  <span class="text-gray-300">02-1234-5678</span>
                </div>
                <div class="flex items-center space-x-3">
                  <i class="fas fa-map-marker-alt text-blue-400"></i>
                  <span class="text-gray-300">서울특별시 강남구 테헤란로 123</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 class="font-semibold text-lg mb-6">서비스</h3>
              <ul class="space-y-3">
                <li><a href="/jobs" class="text-gray-300 hover:text-white transition-colors">구인정보</a></li>
                <li><a href="/study" class="text-gray-300 hover:text-white transition-colors">유학지원</a></li>
                <li><a href="/agents" class="text-gray-300 hover:text-white transition-colors">에이전트</a></li>
                <li><a href="/matching" class="text-gray-300 hover:text-white transition-colors">스마트 매칭</a></li>
                <li><a href="/statistics" class="text-gray-300 hover:text-white transition-colors">통계 대시보드</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 class="font-semibold text-lg mb-6">고객지원</h3>
              <ul class="space-y-3">
                <li><a href="/faq" class="text-gray-300 hover:text-white transition-colors">자주 묻는 질문</a></li>
                <li><a href="/guide" class="text-gray-300 hover:text-white transition-colors">이용가이드</a></li>
                <li><a href="/contact" class="text-gray-300 hover:text-white transition-colors">문의하기</a></li>
                <li><a href="/notice" class="text-gray-300 hover:text-white transition-colors">공지사항</a></li>
                <li><a href="/blog" class="text-gray-300 hover:text-white transition-colors">블로그</a></li>
              </ul>
            </div>
          </div>

          {/* Social Links & Newsletter */}
          <div class="border-t border-gray-800 mt-12 pt-8">
            <div class="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Social Links */}
              <div class="flex items-center space-x-6">
                <span class="text-gray-400 font-medium">팔로우하기:</span>
                <div class="flex space-x-4">
                  <a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <i class="fab fa-facebook-f text-white"></i>
                  </a>
                  <a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <i class="fab fa-instagram text-white"></i>
                  </a>
                  <a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <i class="fab fa-linkedin-in text-white"></i>
                  </a>
                  <a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <i class="fab fa-youtube text-white"></i>
                  </a>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div class="flex items-center space-x-3">
                <span class="text-gray-400 font-medium">뉴스레터:</span>
                <div class="flex">
                  <input 
                    type="email" 
                    placeholder="이메일 주소" 
                    class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div class="border-t border-gray-800 mt-8 pt-8">
            <div class="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div class="text-gray-400 text-sm">
                © 2024 WOW-CAMPUS. All rights reserved.
              </div>
              <div class="flex items-center space-x-6 text-sm">
                <a href="/terms" class="text-gray-400 hover:text-white transition-colors">이용약관</a>
                <a href="/privacy" class="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
                <a href="/cookies" class="text-gray-400 hover:text-white transition-colors">쿠키 정책</a>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-400">사업자등록번호:</span>
                  <span class="text-gray-300">123-45-67890</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
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
