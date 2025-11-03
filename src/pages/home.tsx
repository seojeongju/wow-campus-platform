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
          
          {/* Auth Buttons */}
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
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
              <div id="mobile-service-menu-container">
                {/* 동적 모바일 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>
            <a href="/statistics" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">통계</a>
            <a href="/matching" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">AI스마트매칭</a>
            <a href="/support" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">고객지원</a>
            <div class="pt-4 border-t border-gray-200">
              <div class="font-semibold text-gray-900 mb-2">언어 설정</div>
              <a href="#" onclick="changeLanguage('ko')" class="block pl-4 py-2 text-gray-600">한국어</a>
              <a href="#" onclick="changeLanguage('en')" class="block pl-4 py-2 text-gray-600">English</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section class="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">(주)와우쓰리디</h1>
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
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">(주)와우쓰리디 통계</h2>
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
            <p class="text-gray-600 text-lg">간단한 3단계로 (주)와우쓰리디를 시작하세요</p>
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
                  <div class="font-bold text-2xl">(주)와우쓰리디</div>
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
                © 2024 (주)와우쓰리디. All rights reserved.
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
