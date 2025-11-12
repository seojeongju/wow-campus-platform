/**
 * Page Component
 * Route: /
 * Original: src/index.tsx lines 11727-12345
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
return c.render(
    <div class="min-h-screen bg-white">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="/home" class="flex items-center space-x-3 flex-shrink-0">
            <img src="data:image/jpeg;base64,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" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
          </a>
          
          {/* Desktop Navigation */}
          <div class="hidden lg:flex items-center space-x-8">
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                서비스
                <i class="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <div id="service-dropdown-container" class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {/* 동적 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>
            <a href="/statistics" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">통계</a>
            <a href="/matching" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">AI스마트매칭</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                언어
                <i class="fas fa-globe ml-1 text-xs"></i>
              </button>
              <div class="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="#" onclick="changeLanguage('ko')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">한국어</a>
                <a href="#" onclick="changeLanguage('en')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">English</a>
              </div>
            </div>
          </div>
          
          {/* Right Section: Auth Buttons + Mobile Menu Button */}
          <div class="flex items-center space-x-2">
            {/* Auth Buttons - Desktop */}
            <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
              <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                로그인
              </button>
              <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                회원가입
              </button>
            </div>
            
            {/* Mobile Menu Button - Always Visible on Mobile */}
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600 active:text-blue-700" id="mobile-menu-btn">
              <i class="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" class="lg:hidden bg-white border-t border-gray-200 shadow-lg hidden">
          <div class="container mx-auto px-4 py-4 space-y-3">
            {/* Mobile Auth Buttons */}
            <div id="mobile-auth-buttons" class="flex flex-col space-y-2 pb-3 border-b border-gray-200">
              <button onclick="showLoginModal()" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                <i class="fas fa-sign-in-alt mr-2"></i>로그인
              </button>
              <button onclick="showSignupModal()" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-user-plus mr-2"></i>회원가입
              </button>
            </div>
            
            {/* Service Menu */}
            <div class="space-y-2">
              <div class="font-semibold text-gray-900 mb-2 px-2">
                <i class="fas fa-th mr-2 text-blue-600"></i>서비스
              </div>
              <div id="mobile-service-menu-container" class="pl-4 space-y-1">
                {/* 동적 모바일 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>
            
            {/* Main Menu Items */}
            <a href="/statistics" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-chart-bar mr-2 text-blue-600"></i>통계
            </a>
            <a href="/matching" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-magic mr-2 text-blue-600"></i>AI스마트매칭
            </a>
            <a href="/support" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-headset mr-2 text-blue-600"></i>고객지원
            </a>
            
            {/* Language Settings */}
            <div class="pt-3 border-t border-gray-200">
              <div class="font-semibold text-gray-900 mb-2 px-2">
                <i class="fas fa-globe mr-2 text-blue-600"></i>언어 설정
              </div>
              <a href="#" onclick="changeLanguage('ko')" class="block pl-6 py-2 text-gray-600 hover:text-blue-600">한국어</a>
              <a href="#" onclick="changeLanguage('en')" class="block pl-6 py-2 text-gray-600 hover:text-blue-600">English</a>
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
              <h3 class="text-xl font-semibold text-gray-900 mb-4">AI스마트매칭</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                비자별, 직종별, 지역별 맞춤 AI스마트매칭 서비스로 최적의 일자리를 찾아드립니다
              </p>
              <a href="/matching" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                AI스마트매칭 보기 <i class="fas fa-arrow-right ml-2"></i>
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
                우수한 외국인 구직자들의 프로필과 경력을 확인하고 AI스마트매칭하세요
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
                  <h4 class="font-semibold text-gray-900">소프트웨어 개발자</h4>
                  <p class="text-sm text-gray-600">IT/소프트웨어 • 정규직</p>
                  <p class="text-xs text-gray-500 mt-2">삼성전자 • 서울</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">UX/UI 디자이너</h4>
                  <p class="text-sm text-gray-600">디자인 • 정규직</p>
                  <p class="text-xs text-gray-500 mt-2">네이버 • 경기</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">마케팅 매니저</h4>
                  <p class="text-sm text-gray-600">마케팅/영업 • 계약직</p>
                  <p class="text-xs text-gray-500 mt-2">카카오 • 제주</p>
                </div>
                <div class="text-center">
                  <a href="/jobs" class="text-blue-600 hover:underline text-sm font-medium">
                    전체 구인정보 보기
                  </a>
                </div>
              </div>
            </div>

            {/* 최신 구직정보 */}
            <div class="bg-white border rounded-lg overflow-hidden" data-section="latest-jobseekers">
              <div class="bg-green-50 px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">최신 구직정보</h3>
                  <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm">5건</span>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">김민수 (베트남)</h4>
                  <p class="text-sm text-gray-600">IT/소프트웨어 • 3년 경력</p>
                  <p class="text-xs text-gray-500 mt-2">Java, React • 서울 희망</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">이지원 (중국)</h4>
                  <p class="text-sm text-gray-600">마케팅/영업 • 2년 경력</p>
                  <p class="text-xs text-gray-500 mt-2">한국어 고급 • 부산 희망</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">박준영 (필리핀)</h4>
                  <p class="text-sm text-gray-600">디자인 • 신입</p>
                  <p class="text-xs text-gray-500 mt-2">Photoshop, Figma • 경기 희망</p>
                </div>
                <div class="text-center">
                  <a href="/jobseekers" class="text-green-600 hover:underline text-sm font-medium">
                    전체 구직정보 보기
                  </a>
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
              <h3 class="font-semibold text-gray-900 mb-2">AI스마트매칭 시스템</h3>
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
                등록하고 AI스마트매칭을 기다리세요
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">3</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">AI스마트매칭 성공</h3>
              <p class="text-gray-600 leading-relaxed">
                전문 에이전트의 도움으로<br/>
                성공적인 취업 또는 인재 발굴
              </p>
            </div>
          </div>
          
          <div class="text-center mt-12">
            <button onclick="startOnboarding()" class="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors transform hover:scale-105 transition-all duration-200">
              지금 시작하기 <i class="fas fa-rocket ml-2"></i>
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
                체계적인 AI스마트매칭 시스템과 유학 지원 서비스로 성공적인 한국 정착을 돕겠습니다.
              </p>
              
              {/* Contact Info */}
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <i class="fas fa-envelope text-blue-400"></i>
                  <span class="text-gray-300">wow3d16@naver.com</span>
                </div>
                {/* 서울 지역 */}
                <div class="flex items-start space-x-3 mb-4">
                  <i class="fas fa-phone text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-gray-300">
                      <span class="font-medium text-white">서울:</span> 02-3144-3137
                    </div>
                    <div class="text-gray-300">
                      <span class="font-medium text-white">구미:</span> 054-464-3137
                    </div>
                  </div>
                </div>
                
                {/* 서울 사무소 */}
                <div class="flex items-start space-x-3 mb-3">
                  <i class="fas fa-map-marker-alt text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">서울 본사</div>
                    <div class="text-gray-300">서울시 마포구 독막로 93 상수빌딩 4층</div>
                  </div>
                </div>
                
                {/* 구미 사무소 */}
                <div class="flex items-start space-x-3 mb-3">
                  <i class="fas fa-building text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">구미 지사</div>
                    <div class="text-gray-300">경북 구미시 구미대로 산호대로 253<br/>구미첨단의료기술타워 606호</div>
                  </div>
                </div>
                
                {/* 전주 사무소 */}
                <div class="flex items-start space-x-3">
                  <i class="fas fa-building text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">전주 지사</div>
                    <div class="text-gray-300">전북특별자치도 전주시 덕진구 반룡로 109<br/>테크노빌 A동 207호</div>
                  </div>
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
                <li><a href="/matching" class="text-gray-300 hover:text-white transition-colors">AI스마트매칭</a></li>
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
                  <a href="https://www.facebook.com/wowcampus.kr" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors" title="Facebook에서 팔로우하기">
                    <i class="fab fa-facebook-f text-white"></i>
                  </a>
                  <a href="https://www.instagram.com/wowcampus.kr" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors" title="Instagram에서 팔로우하기">
                    <i class="fab fa-instagram text-white"></i>
                  </a>
                  <a href="https://www.linkedin.com/company/wowcampus" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors" title="LinkedIn에서 연결하기">
                    <i class="fab fa-linkedin-in text-white"></i>
                  </a>
                  <a href="https://www.youtube.com/@wowcampus" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors" title="YouTube에서 구독하기">
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
                    id="newsletter-email"
                    placeholder="이메일 주소" 
                    class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button onclick="subscribeNewsletter()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
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
                  <span class="text-gray-300">849-88-01659</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login/Signup Modals */}
      <div id="login-modal" class="fixed inset-0 z-50 hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="hideLoginModal()"></div>
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="px-6 py-4 border-b">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">로그인</h3>
                <button onclick="hideLoginModal()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form id="login-form" class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="이메일을 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                  <input type="password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="비밀번호를 입력하세요" />
                </div>
              </div>
              <div class="mt-6">
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  로그인
                </button>
              </div>
              <div class="mt-4 text-center">
                <button type="button" onclick="hideLoginModal(); showSignupModal();" class="text-blue-600 hover:text-blue-800 text-sm">
                  아직 회원이 아니신가요? 회원가입
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="signup-modal" class="fixed inset-0 z-50 hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="hideSignupModal()"></div>
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
            <div class="px-6 py-4 border-b">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">회원가입</h3>
                <button onclick="hideSignupModal()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form id="signup-form" class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                  <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="이메일을 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 *</label>
                  <input type="password" name="password" required minlength="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="최소 6자 이상" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 *</label>
                  <input type="password" name="confirmPassword" required minlength="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="비밀번호를 다시 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형 *</label>
                  <select name="user_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">선택하세요</option>
                    <option value="jobseeker">구직자</option>
                    <option value="company">구인기업</option>
                    <option value="agent">에이전트</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                  <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="이름을 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                  <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="연락처를 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">지역 *</label>
                  <select name="location" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">지역을 선택하세요</option>
                    <option value="서울">서울</option>
                    <option value="경기도">경기도</option>
                    <option value="강원도">강원도</option>
                    <option value="충청도">충청도</option>
                    <option value="경상도">경상도</option>
                    <option value="전라도">전라도</option>
                    <option value="제주도">제주도</option>
                  </select>
                </div>
              </div>
              <div class="mt-6">
                <button type="submit" id="signup-submit-btn" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  회원가입
                </button>
              </div>
              <div class="mt-4 text-center">
                <button type="button" onclick="hideSignupModal(); showLoginModal();" class="text-blue-600 hover:text-blue-800 text-sm">
                  이미 회원이신가요? 로그인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Script to load real data */}
      <script dangerouslySetInnerHTML={{__html: `
        // Load latest information on page load
        window.addEventListener('DOMContentLoaded', async function() {
          await loadLatestInformation();
        });

        async function loadLatestInformation() {
          try {
            const response = await fetch('/api/latest-information');
            const result = await response.json();
            
            if (result.success && result.data) {
              const { latestJobs, latestJobseekers } = result.data;
              
              // Update jobs section
              if (latestJobs && latestJobs.length > 0) {
                updateJobsSection(latestJobs);
              }
              
              // Update jobseekers section
              if (latestJobseekers && latestJobseekers.length > 0) {
                updateJobseekersSection(latestJobseekers);
              }
            }
          } catch (error) {
            console.error('Error loading latest information:', error);
          }
        }

        function updateJobsSection(jobs) {
          const jobsSection = document.querySelector('[data-section="latest-jobs"] .p-6.space-y-4');
          if (!jobsSection) return;
          
          // Update count badge
          const countBadge = document.querySelector('[data-section="latest-jobs"] .bg-blue-600.text-white');
          if (countBadge) {
            countBadge.textContent = jobs.length + '건';
          }
          
          // Build HTML for jobs
          let jobsHTML = jobs.map(job => \`
            <div class="border-b pb-4">
              <a href="/jobs/\${job.id}" class="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                <h4 class="font-semibold text-gray-900">\${job.title}</h4>
                <p class="text-sm text-gray-600">\${job.category || 'IT/소프트웨어'} • \${job.type || '정규직'}</p>
                <p class="text-xs text-gray-500 mt-2">\${job.company || '회사명 비공개'} • \${job.location || '서울'}</p>
              </a>
            </div>
          \`).join('');
          
          jobsHTML += \`
            <div class="text-center">
              <a href="/jobs" class="text-blue-600 hover:underline text-sm font-medium">
                전체 구인정보 보기
              </a>
            </div>
          \`;
          
          jobsSection.innerHTML = jobsHTML;
        }

        function updateJobseekersSection(jobseekers) {
          const jobseekersSection = document.querySelector('[data-section="latest-jobseekers"] .p-6.space-y-4');
          if (!jobseekersSection) return;
          
          // Update count badge
          const countBadge = document.querySelector('[data-section="latest-jobseekers"] .bg-green-600.text-white');
          if (countBadge) {
            countBadge.textContent = jobseekers.length + '건';
          }
          
          // Build HTML for jobseekers
          let jobseekersHTML = jobseekers.map(js => \`
            <div class="border-b pb-4">
              <div class="-mx-2 px-2 py-2">
                <h4 class="font-semibold text-gray-900">\${js.name} (\${js.nationality})</h4>
                <p class="text-sm text-gray-600">\${js.experience}</p>
                <p class="text-xs text-gray-500 mt-2">\${js.skills} • \${js.location}</p>
              </div>
            </div>
          \`).join('');
          
          jobseekersHTML += \`
            <div class="text-center">
              <a href="/jobseekers" class="text-green-600 hover:underline text-sm font-medium">
                전체 구직정보 보기
              </a>
            </div>
          \`;
          
          jobseekersSection.innerHTML = jobseekersHTML;
        }
      `}}></script>
    </div>
  )
}

// Middleware: none
