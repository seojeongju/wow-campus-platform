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
import jobseekersRoutes from './routes/jobseekers'

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
app.route('/api/jobseekers', jobseekersRoutes)

// Web pages with renderer
app.use(renderer)

// Jobs page
app.get('/jobs', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation - Same as main page */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
          </div>
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-blue-600 font-medium">구인정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/agents" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">에이전트</a>
            <a href="/statistics" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">통계</a>
          </div>
          
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
          </div>
        </nav>
      </header>

      {/* Jobs Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">구인정보</h1>
          <p class="text-gray-600 text-lg">외국인 인재를 찾는 기업들의 구인공고를 확인하세요</p>
        </div>

        {/* Search and Filter */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="grid md:grid-cols-4 gap-4">
            <input type="text" placeholder="회사명, 직무 검색" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>직종 전체</option>
              <option>IT/소프트웨어</option>
              <option>제조/생산</option>
              <option>서비스업</option>
            </select>
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>지역 전체</option>
              <option>서울</option>
              <option>경기</option>
              <option>부산</option>
            </select>
            <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <i class="fas fa-search mr-2"></i>검색
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div class="space-y-6" id="job-listings">
          {/* Job listings will be loaded here */}
        </div>
      </main>
    </div>
  )
})

// Study page
app.get('/study', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation - Same structure */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
          </div>
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/study" class="text-green-600 font-medium">유학정보</a>
            <a href="/agents" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">에이전트</a>
            <a href="/statistics" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">통계</a>
          </div>
          
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
          </div>
        </nav>
      </header>

      {/* Study Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">유학정보</h1>
          <p class="text-gray-600 text-lg">한국 대학교 및 어학원 정보를 확인하고 지원하세요</p>
        </div>

        {/* Study Programs Grid */}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-graduation-cap text-green-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">한국어 연수</h3>
            <p class="text-gray-600 mb-4">기초부터 고급까지 체계적인 한국어 교육 프로그램</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• 1급~6급 단계별 교육</li>
              <li>• TOPIK 시험 준비</li>
              <li>• 문화 체험 프로그램</li>
            </ul>
            <button class="text-green-600 font-medium hover:underline">자세히 보기 →</button>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-university text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">학부 과정</h3>
            <p class="text-gray-600 mb-4">한국의 우수한 대학교 학부 과정 진학 지원</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• 입학 준비 컨설팅</li>
              <li>• 장학금 안내</li>
              <li>• 기숙사 배정 지원</li>
            </ul>
            <button class="text-blue-600 font-medium hover:underline">자세히 보기 →</button>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-user-graduate text-purple-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">대학원 과정</h3>
            <p class="text-gray-600 mb-4">석사, 박사 과정 및 연구 프로그램 지원</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• 연구실 매칭</li>
              <li>• 논문 지도 지원</li>
              <li>• 연구비 지원 안내</li>
            </ul>
            <button class="text-purple-600 font-medium hover:underline">자세히 보기 →</button>
          </div>
        </div>
      </main>
    </div>
  )
})

// Job Seekers page (구직정보 보기)
app.get('/jobseekers', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
          </div>
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-green-600 font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/agents" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">에이전트</a>
            <a href="/statistics" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">통계</a>
          </div>
          
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
          </div>
        </nav>
      </header>

      {/* Job Seekers Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">구직정보</h1>
          <p class="text-gray-600 text-lg">우수한 외국인 구직자들의 프로필을 확인하세요</p>
        </div>

        {/* Search and Filter */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="grid md:grid-cols-4 gap-4">
            <input type="text" placeholder="이름, 기술 스택 검색" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>전공 전체</option>
              <option>컴퓨터공학</option>
              <option>경영학</option>
              <option>디자인</option>
            </select>
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>경력 전체</option>
              <option>신입</option>
              <option>1-3년</option>
              <option>3-5년</option>
              <option>5년 이상</option>
            </select>
            <button class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <i class="fas fa-search mr-2"></i>검색
            </button>
          </div>
        </div>

        {/* Job Seekers List */}
        <div class="space-y-6" id="jobseekers-listings">
          {/* Job seekers will be loaded here */}
        </div>
      </main>
    </div>
  )
})

// Agents Dashboard page (에이전트 관리)
app.get('/agents', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
          </div>
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/agents" class="text-purple-600 font-medium">에이전트</a>
            <a href="/statistics" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">통계</a>
          </div>
          
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
          </div>
        </nav>
      </header>

      {/* Agents Dashboard Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">에이전트 대시보드</h1>
          <p class="text-gray-600 text-lg">해외 에이전트 관리 및 성과 분석</p>
        </div>

        {/* Agent Statistics */}
        <div class="grid md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-user-tie text-purple-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-purple-600 mb-2">25</div>
            <div class="text-gray-600 font-medium">등록 에이전트</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-green-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-green-600 mb-2">148</div>
            <div class="text-gray-600 font-medium">관리 구직자</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-handshake text-blue-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-2">89</div>
            <div class="text-gray-600 font-medium">매칭 성공</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-dollar-sign text-orange-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-orange-600 mb-2">$12.5K</div>
            <div class="text-gray-600 font-medium">월 수수료</div>
          </div>
        </div>

        {/* Agent Management Tools */}
        <div class="grid md:grid-cols-2 gap-8">
          {/* Agent Performance */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">에이전트 성과</h2>
              <button class="text-purple-600 text-sm font-medium hover:underline">전체보기</button>
            </div>
            <div class="space-y-4" id="agent-performance-list">
              {/* Agent performance will be loaded here */}
            </div>
          </div>

          {/* Recent Activities */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">최근 활동</h2>
              <button class="text-purple-600 text-sm font-medium hover:underline">전체보기</button>
            </div>
            <div class="space-y-4" id="agent-activities-list">
              {/* Agent activities will be loaded here */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Statistics page  
app.get('/statistics', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
          </div>
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/agents" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">에이전트</a>
            <a href="/statistics" class="text-orange-600 font-medium">통계</a>
          </div>
          
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
          </div>
        </nav>
      </header>

      {/* Statistics Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">통계 대시보드</h1>
          <p class="text-gray-600 text-lg">실시간 플랫폼 운영 현황과 성과를 확인하세요</p>
        </div>

        {/* Main Statistics */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-briefcase text-blue-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-2">4</div>
            <div class="text-gray-600 font-medium">구인공고</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-green-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-green-600 mb-2">14</div>
            <div class="text-gray-600 font-medium">구직자</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-handshake text-purple-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-purple-600 mb-2">7</div>
            <div class="text-gray-600 font-medium">매칭 성공</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-building text-orange-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-orange-600 mb-2">12</div>
            <div class="text-gray-600 font-medium">참여 기업</div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">월별 구인공고 현황</h3>
            <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">차트 영역</p>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">국가별 구직자 분포</h3>
            <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">차트 영역</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

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
                <a href="/jobseekers" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">구직정보 보기</a>
                <a href="/study" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">유학정보 보기</a>
                <a href="/agents" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">에이전트 대시보드</a>
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
              <a href="/jobseekers" class="block pl-4 py-2 text-gray-600 hover:text-green-600">구직정보 보기</a>
              <a href="/study" class="block pl-4 py-2 text-gray-600 hover:text-orange-600">유학정보 보기</a>
              <a href="/agents" class="block pl-4 py-2 text-gray-600 hover:text-purple-600">에이전트 대시보드</a>
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
      <section class="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">WOW-CAMPUS</h1>
          <p class="text-xl md:text-2xl text-blue-600 font-semibold mb-4">외국인을 위한 한국 취업 & 유학 플랫폼</p>
          <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">해외 에이전트와 국내 기업을 연결하여 외국인 인재의 한국 진출을 지원합니다</p>
          
          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/jobs" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              구인정보 보기 →
            </a>
            <a href="/jobseekers" class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              구직정보 보기 →
            </a>
            <a href="/study" class="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
              유학정보 보기 →
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">우리의 서비스</h2>
            <p class="text-gray-600 text-lg">외국인 구직자와 국내 기업을 연결하는 전문 플랫폼</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-handshake text-2xl text-blue-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">구인구직 매칭</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                비자별, 직종별, 지역별 맞춤 매칭 서비스로 최적의 일자리를 찾아드립니다
              </p>
              <a href="/jobs" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                구인정보 보기 <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>

            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-graduation-cap text-2xl text-green-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">유학 지원</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                한국어 연수부터 학위과정까지 전 과정에 대한 체계적 지원을 제공합니다
              </p>
              <a href="/study" class="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors">
                유학정보 보기 <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>

            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-users text-2xl text-purple-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">구직자 관리</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                우수한 외국인 구직자들의 프로필과 경력을 확인하고 매칭하세요
              </p>
              <a href="/jobseekers" class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                구직정보 보기 <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Information Section */}
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">최신 정보</h2>
            <p class="text-gray-600 text-lg">실시간으로 업데이트되는 구인정보와 구직자 정보를 확인하세요</p>
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

      {/* Statistics Dashboard Section */}
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="text-center mb-8">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">WOW-CAMPUS 통계</h2>
              <p class="text-gray-600 text-lg">우리 플랫폼의 현재 현황을 한눈에 확인하세요</p>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-briefcase text-2xl text-blue-600"></i>
                </div>
                <div class="text-4xl font-bold text-blue-600 mb-2" data-stat="jobs">4</div>
                <div class="text-gray-600 font-medium">구인공고</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-users text-2xl text-green-600"></i>
                </div>
                <div class="text-4xl font-bold text-green-600 mb-2" data-stat="jobseekers">14</div>
                <div class="text-gray-600 font-medium">구직자</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-star text-2xl text-purple-600"></i>
                </div>
                <div class="text-4xl font-bold text-purple-600 mb-2" data-stat="reviews">0</div>
                <div class="text-gray-600 font-medium">후기</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-file-alt text-2xl text-orange-600"></i>
                </div>
                <div class="text-4xl font-bold text-orange-600 mb-2" data-stat="resumes">0</div>
                <div class="text-gray-600 font-medium">이력서</div>
              </div>
            </div>
          </div>
          
          {/* Additional Service Items */}
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">구인공고 상세정보</h3>
              <p class="text-gray-600 text-sm mb-4">상세한 구인 조건과 요구사항을 확인하세요</p>
              <a href="/jobs" class="text-blue-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">구직자 상세정보</h3>
              <p class="text-gray-600 text-sm mb-4">구직자의 상세한 프로필과 경력을 확인하세요</p>
              <a href="/jobseekers" class="text-green-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">스마트 매칭 시스템</h3>
              <p class="text-gray-600 text-sm mb-4">AI 기반으로 구직자의 조건과 구인공고를 자동 매칭합니다</p>
              <a href="/matching" class="text-purple-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">유학 프로그램</h3>
              <p class="text-gray-600 text-sm mb-4">한국어 연수부터 학위과정까지 체계적인 유학 지원</p>
              <a href="/study" class="text-orange-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">통계 대시보드</h3>
              <p class="text-gray-600 text-sm mb-4">실시간 플랫폼 운영 현황과 성과를 확인하세요</p>
              <a href="/statistics" class="text-red-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">시작하기</h2>
            <p class="text-gray-600 text-lg">간단한 3단계로 WOW-CAMPUS를 시작하세요</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">1</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">회원가입</h3>
              <p class="text-gray-600 leading-relaxed">
                간단한 정보 입력으로<br/>
                회원가입을 완료하세요
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">2</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">정보 등록</h3>
              <p class="text-gray-600 leading-relaxed">
                구직 또는 구인 정보를<br/>
                등록하고 매칭을 기다리세요
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">3</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">매칭 성공</h3>
              <p class="text-gray-600 leading-relaxed">
                전문 에이전트의 도움으로<br/>
                성공적인 취업 또는 인재 발굴
              </p>
            </div>
          </div>
          
          <div class="text-center mt-12">
            <a href="/register" class="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              지금 시작하기 <i class="fas fa-arrow-right ml-2"></i>
            </a>
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
      },
      jobseekers: {
        'GET /api/jobseekers': 'Get all job seekers (with search)',
        'GET /api/jobseekers/:id': 'Get single job seeker',
        'POST /api/jobseekers': 'Create job seeker profile (authenticated)',
        'PUT /api/jobseekers/:id': 'Update job seeker profile (owner only)'
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
