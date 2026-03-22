/**
 * Page Component
 * Route: /study
 * Original: src/index.tsx lines 8242-8427
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
  const { t } = c.get('i18n');

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation - Same structure */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>

          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>

          {/* Right Section: Auth Buttons + Mobile Menu Button */}
          <div class="flex items-center space-x-2">
            {/* Auth Buttons - Desktop */}
            {/* Desktop Language Selector */}
            <div class="hidden lg:block relative group mr-4">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                <i class="fas fa-globe mr-1"></i>
                {t('common.language')}
              </button>
              <div class="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <a href="#" onclick="changeLanguage('ko')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">한국어</a>
                <a href="#" onclick="changeLanguage('en')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">English</a>
                <a href="#" onclick="changeLanguage('ja')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">日本語</a>
                <a href="#" onclick="changeLanguage('vi')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Tiếng Việt</a>
              </div>
            </div>
            <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
              <a href="/login" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                {t('common.login')}
              </a>
              <a href="/login" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                {t('common.register')}
              </a>
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
              <a href="/login" onclick="toggleMobileMenu();" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center inline-flex items-center justify-center">
                <i class="fas fa-sign-in-alt mr-2"></i>{t('common.login')}
              </a>
              <a href="/login" onclick="toggleMobileMenu();" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center inline-flex items-center justify-center">
                <i class="fas fa-user-plus mr-2"></i>{t('common.register')}
              </a>
            </div>

            {/* Service Menu */}
            <div class="space-y-2">
              <div class="font-semibold text-gray-900 mb-2 px-2">
                <i class="fas fa-th mr-2 text-blue-600"></i>{t('common.service')}
              </div>
              <div id="mobile-service-menu-container" class="pl-4 space-y-1">
                {/* 동적 모바일 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>

            {/* Main Menu Items */}
            <a href="/matching" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-magic mr-2 text-blue-600"></i>{t('common.ai_matching')}
            </a>
            <a href="/support" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-headset mr-2 text-blue-600"></i>{t('common.customer_support')}
            </a>

            {/* Language Settings */}
            <div class="pt-3 border-t border-gray-200">
              <div class="font-semibold text-gray-900 mb-2 px-2">
                <i class="fas fa-globe mr-2 text-blue-600"></i>{t('common.language')}
              </div>
              <a href="#" onclick="changeLanguage('ko')" class="block pl-6 py-2 text-gray-600 hover:text-blue-600">한국어</a>
              <a href="#" onclick="changeLanguage('en')" class="block pl-6 py-2 text-gray-600 hover:text-blue-600">English</a>
              <a href="#" onclick="changeLanguage('ja')" class="block pl-6 py-2 text-gray-600 hover:text-blue-600">日本語</a>
              <a href="#" onclick="changeLanguage('vi')" class="block pl-6 py-2 text-gray-600 hover:text-blue-600">Tiếng Việt</a>
            </div>
          </div>
        </div>
      </header>

      {/* Study Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{t('study.title')}</h1>
          <p class="text-gray-600 text-lg">{t('study.subtitle')}</p>
          <p class="text-gray-600 text-lg">{t('study.subtitle_note')}</p>
        </div>

        {/* Study Programs Grid */}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-graduation-cap text-green-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">{t('study.korean_language.title')}</h3>
            <p class="text-gray-600 mb-4">{t('study.korean_language.subtitle')}</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• {t('study.korean_language.features.level_1_2')}</li>
              <li>• {t('study.korean_language.features.level_3_4')}</li>
              <li>• {t('study.korean_language.features.special')}</li>
            </ul>
            <a href="/study/korean" class="text-green-600 font-medium hover:underline">{t('study.korean_language.view_detail')}</a>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-university text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">{t('study.undergraduate.title')}</h3>
            <p class="text-gray-600 mb-4">{t('study.undergraduate.subtitle')}</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• {t('study.undergraduate.features.consulting')}</li>
              <li>• {t('study.undergraduate.features.scholarship')}</li>
              <li>• {t('study.undergraduate.features.dormitory')}</li>
            </ul>
            <a href="/study/undergraduate" class="text-blue-600 font-medium hover:underline">{t('study.undergraduate.view_detail')}</a>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-user-graduate text-purple-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">{t('study.graduate.title')}</h3>
            <p class="text-gray-600 mb-4">{t('study.graduate.subtitle')}</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• {t('study.graduate.program_types.master.title')}</li>
              <li>• {t('study.graduate.program_types.phd.title')}</li>
              <li>• {t('study.graduate.program_types.integrated.title')}</li>
            </ul>
            <a href="/study/graduate" class="text-purple-600 font-medium hover:underline">{t('study.graduate.view_detail')}</a>
          </div>
        </div>

        {/* Partner Universities Section - 협약대학교 */}
        <div class="mt-20">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">{t('study.partner_universities.title')}</h2>
            <p class="text-gray-600 text-lg">{t('study.partner_universities.subtitle')}</p>
          </div>

          {/* Filter Controls */}
          <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div class="grid md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{t('study.partner_universities.region')}</label>
                <select id="regionFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t('study.partner_universities.region_all')}</option>
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
                <label class="block text-sm font-medium text-gray-700 mb-2">{t('study.partner_universities.major_field')}</label>
                <select id="majorFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t('study.partner_universities.major_all')}</option>
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
                <label class="block text-sm font-medium text-gray-700 mb-2">{t('study.partner_universities.degree_program')}</label>
                <select id="degreeFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t('study.partner_universities.degree_all')}</option>
                  <option value="어학연수">{t('study.partner_universities.language_training')}</option>
                  <option value="학부">{t('study.partner_universities.undergraduate')}</option>
                  <option value="대학원">{t('study.partner_universities.graduate')}</option>
                </select>
              </div>
              <div class="flex items-end">
                <button onclick="resetFilters()" class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  {t('study.partner_universities.reset_filter')}
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
              {t('study.partner_universities.loading')}
            </div>
          </div>

          {/* Empty State */}
          <div id="emptyState" class="text-center py-12 hidden">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-university text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2" id="empty-title">{t('study.partner_universities.no_results')}</h3>
            <p class="text-gray-600 mb-4" id="empty-desc">{t('study.partner_universities.no_results_desc')}</p>
            <button onclick="resetFilters()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t('study.partner_universities.view_all')}
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
