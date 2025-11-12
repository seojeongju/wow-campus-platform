/**
 * Page Component
 * Route: /study
 * Original: src/index.tsx lines 8242-8427
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation - Same structure */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/logo.jpg" alt="WOW-CAMPUS" class="h-10 w-auto" />
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
              <i class="fas fa-bars text-xl"></i>
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
            <a href="/study/korean" class="text-green-600 font-medium hover:underline">자세히 보기 →</a>
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
            <a href="/study/undergraduate" class="text-blue-600 font-medium hover:underline">자세히 보기 →</a>
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
            <a href="/study/graduate" class="text-purple-600 font-medium hover:underline">자세히 보기 →</a>
          </div>
        </div>

        {/* Partner Universities Section - 협약대학교 */}
        <div class="mt-20">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">협약 대학교</h2>
            <p class="text-gray-600 text-lg">(주)와우쓰리디와 협약을 맺은 우수한 한국 대학교들을 만나보세요</p>
          </div>

          {/* Filter Controls */}
          <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div class="grid md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">지역 (시·도)</label>
                <select id="regionFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">전체 지역</option>
                  <option value="서울특별시">서울특별시</option>
                  <option value="부산광역시">부산광역시</option>
                  <option value="대구광역시">대구광역시</option>
                  <option value="인천광역시">인천광역시</option>
                  <option value="광주광역시">광주광역시</option>
                  <option value="대전광역시">대전광역시</option>
                  <option value="울산광역시">울산광역시</option>
                  <option value="세종특별자치시">세종특별자치시</option>
                  <option value="경기도">경기도</option>
                  <option value="강원특별자치도">강원특별자치도</option>
                  <option value="충청북도">충청북도</option>
                  <option value="충청남도">충청남도</option>
                  <option value="전북특별자치도">전북특별자치도</option>
                  <option value="전라남도">전라남도</option>
                  <option value="경상북도">경상북도</option>
                  <option value="경상남도">경상남도</option>
                  <option value="제주특별자치도">제주특별자치도</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">전공 분야</label>
                <select id="majorFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">전체 전공</option>
                  <option value="공학">공학</option>
                  <option value="경영학">경영학</option>
                  <option value="의학">의학</option>
                  <option value="자연과학">자연과학</option>
                  <option value="인문학">인문학</option>
                  <option value="사회과학">사회과학</option>
                  <option value="예술">예술</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">학위 과정</label>
                <select id="degreeFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">전체 과정</option>
                  <option value="어학연수">어학연수 (한국어)</option>
                  <option value="학부">학부과정 (학사)</option>
                  <option value="대학원">대학원과정 (석·박사)</option>
                </select>
              </div>
              <div class="flex items-end">
                <button onclick="resetFilters()" class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  필터 초기화
                </button>
              </div>
            </div>
          </div>

          {/* Universities Grid */}
          <div id="universitiesContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 대학교 리스트가 여기에 동적으로 로드됩니다 */}
          </div>

          {/* Loading State */}
          <div id="loadingState" class="text-center py-8">
            <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-white">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              협약대학교 정보를 불러오는 중...
            </div>
          </div>

          {/* Empty State */}
          <div id="emptyState" class="text-center py-12 hidden">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-university text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p class="text-gray-600 mb-4">다른 조건으로 검색해보세요</p>
            <button onclick="resetFilters()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              전체 보기
            </button>
          </div>
        </div>
      </main>
    </div>
  )

// Study Program Detail Pages
// Korean Language Course Detail
}

// Middleware: none
