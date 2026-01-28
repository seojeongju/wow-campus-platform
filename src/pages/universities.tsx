/**
 * Universities Page Component
 * Route: /universities
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
  const { t } = c.get('i18n')

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="/home" class="flex items-center space-x-3 flex-shrink-0">
            <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div class="hidden lg:flex items-center space-x-8">
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                {t('common.service')}
                <i class="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <div id="service-dropdown-container" class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {/* 동적 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>
            <a href="/matching" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">{t('common.ai_matching')}</a>
            <a href="/global-support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">{t('common.global_support')}</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">{t('common.customer_support')}</a>
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                {t('common.language')}
                <i class="fas fa-globe ml-1 text-xs"></i>
              </button>
              <div class="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="#" onclick="changeLanguage('ko')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">한국어</a>
                <a href="#" onclick="changeLanguage('en')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">English</a>
                <a href="#" onclick="changeLanguage('ja')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">日本語</a>
                <a href="#" onclick="changeLanguage('vi')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Tiếng Việt</a>
                <a href="#" onclick="changeLanguage('zh')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">中文</a>
              </div>
            </div>
          </div>

          {/* Right Section: Auth Buttons + Mobile Menu Button */}
          <div class="flex items-center space-x-2">
            {/* Auth Buttons - Desktop */}
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
              <a href="/login" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center inline-flex items-center justify-center">
                <i class="fas fa-sign-in-alt mr-2"></i>{t('common.login')}
              </a>
              <a href="/login" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center inline-flex items-center justify-center">
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
            <a href="/global-support" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-globe mr-2 text-blue-600"></i>{t('common.global_support')}
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


      {/* Hero Section */}
      <section class="relative bg-gradient-to-r from-purple-600 to-purple-800 text-white py-20 overflow-hidden" style="background-image: url('/images/university-hero-bg.png'); background-size: cover; background-position: center; background-blend-mode: overlay;">
        <div class="absolute inset-0 bg-purple-900 bg-opacity-60"></div>
        <div class="container mx-auto px-4 relative z-10">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">{t('study.partner_universities.title')}</h1>
          <p class="text-xl opacity-90">{t('study.partner_universities.subtitle')}</p>
        </div>
      </section>

      {/* Filter Section */}
      <section class="bg-white shadow-sm py-6">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row gap-4">
            <select id="region-filter" class="px-4 py-2 border rounded-lg">
              <option value="all">{t('study.partner_universities.region_all')}</option>
              <option value="서울">{t('jobs.locations.seoul')}</option>
              <option value="경기">{t('jobs.locations.gyeonggi')}</option>
              <option value="인천">{t('jobs.locations.incheon')}</option>
              <option value="부산">{t('jobs.locations.busan')}</option>
              <option value="대구">{t('jobs.locations.daegu')}</option>
              <option value="광주">{t('jobs.locations.gwangju')}</option>
              <option value="대전">{t('jobs.locations.daejeon')}</option>
              <option value="울산">{t('jobs.locations.ulsan')}</option>
              <option value="세종">{t('jobs.locations.sejong')}</option>
              <option value="강원">{t('jobs.locations.gangwon')}</option>
              <option value="충북">{t('jobs.locations.chungbuk')}</option>
              <option value="충남">{t('jobs.locations.chungnam')}</option>
              <option value="전북">{t('jobs.locations.jeonbuk')}</option>
              <option value="전남">{t('jobs.locations.jeonnam')}</option>
              <option value="경북">{t('jobs.locations.gyeongbuk')}</option>
              <option value="경남">{t('jobs.locations.gyeongnam')}</option>
              <option value="제주">{t('jobs.locations.jeju')}</option>
            </select>

            <select id="degree-filter" class="px-4 py-2 border rounded-lg">
              <option value="all">{t('study.partner_universities.degree_all')}</option>
              <option value="어학연수">{t('study.partner_universities.language_training')}</option>
              <option value="학부">{t('study.partner_universities.undergraduate')}</option>
              <option value="대학원">{t('study.partner_universities.graduate')}</option>
            </select>

            <button onclick="loadUniversities()" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <i class="fas fa-search mr-2"></i>{t('study.partner_universities.search')}
            </button>
          </div>
        </div>
      </section>

      {/* Universities List */}
      <section class="py-12">
        <div class="container mx-auto px-4">
          <div id="universities-container" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading state */}
            <div class="col-span-full text-center py-12">
              <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
              <p class="text-gray-600">{t('study.partner_universities.loading')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Script to load universities */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // 번역 함수 설정 (renderer.tsx에서 이미 설정되어 있음)
        // window.locale과 window.translations는 renderer.tsx에서 설정됨
        // window.t 함수도 이미 renderer.tsx에서 설정됨
        // 만약 설정되지 않았다면 fallback으로 설정
        if (!window.t) {
          window.t = function(key) {
            const keys = key.split('.');
            let value = window.translations;
            for (const k of keys) {
              if (value && typeof value === 'object') {
                value = value[k];
              } else {
                return key;
              }
            }
            return value || key;
          };
        }
        
        // 배열을 랜덤으로 섞는 함수 (Fisher-Yates 알고리즘)
        function shuffleArray(array) {
          const shuffled = [...array]; // 원본 배열 복사
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        }
        
        async function loadUniversities() {
          const container = document.getElementById('universities-container');
          const regionFilter = document.getElementById('region-filter').value;
          const degreeFilter = document.getElementById('degree-filter').value;
          
          // Show loading
          container.innerHTML = \`
            <div class="col-span-full text-center py-12">
              <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
              <p class="text-gray-600">\${window.t('study.partner_universities.loading')}</p>
            </div>
          \`;
          
          try {
            const params = new URLSearchParams();
            if (regionFilter && regionFilter !== 'all') params.append('region', regionFilter);
            if (degreeFilter && degreeFilter !== 'all') params.append('degree', degreeFilter);
            
            const response = await fetch('/api/universities?' + params.toString());
            const data = await response.json();
            
            if (data.success && data.universities && data.universities.length > 0) {
              // 대학교 리스트를 랜덤으로 섞기
              const shuffledUniversities = shuffleArray(data.universities);
              
              const universitiesHTML = shuffledUniversities.map(uni => \`
                <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                  <div class="flex items-start gap-4 mb-4">
                    <div class="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i class="fas fa-university text-purple-600 text-2xl"></i>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-xl font-bold text-gray-900 mb-1">\${uni.name}</h3>
                      <p class="text-sm text-gray-600">\${uni.englishName || ''}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-2 mb-4">
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-map-marker-alt w-5 text-purple-600"></i>
                      <span>\${uni.region}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-globe w-5 text-purple-600"></i>
                      <a href="\${uni.website}" target="_blank" class="hover:text-purple-600">\${uni.website}</a>
                    </div>
                  </div>
                  
                  <div class="flex flex-wrap gap-2 mb-4">
                    \${uni.languageCourse ? '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">' + window.t('study.partner_universities.language_course') + '</span>' : ''}
                    \${uni.undergraduateCourse ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">' + window.t('study.partner_universities.undergraduate_course') + '</span>' : ''}
                    \${uni.graduateCourse ? '<span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">' + window.t('study.partner_universities.graduate_course') + '</span>' : ''}
                  </div>
                  
                  <p class="text-sm text-gray-700 line-clamp-3 mb-4">\${uni.description || window.t('study.partner_universities.no_description')}</p>
                  
                  <div class="flex gap-2">
                    <button onclick="viewUniversityDetail(\${uni.id})" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                      <i class="fas fa-info-circle mr-1"></i>\${window.t('study.partner_universities.view_details')}
                    </button>
                  </div>
                </div>
              \`).join('');
              
              container.innerHTML = universitiesHTML;
            } else {
              container.innerHTML = \`
                <div class="col-span-full text-center py-12">
                  <i class="fas fa-university text-4xl text-gray-400 mb-4"></i>
                  <p class="text-gray-600">\${window.t('study.partner_universities.no_universities')}</p>
                </div>
              \`;
            }
          } catch (error) {
            console.error('Error loading universities:', error);
            container.innerHTML = \`
              <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <p class="text-red-600">\${window.t('study.partner_universities.load_error')}</p>
              </div>
            \`;
          }
        }
        
        function viewUniversityDetail(id) {
          // For now, just show an alert. Later can navigate to detail page
          alert(window.t('study.partner_universities.detail_coming_soon') + ' ID: ' + id);
        }
        
        // Load universities on page load
        window.addEventListener('DOMContentLoaded', loadUniversities);
      `}}></script>
    </div>
  )
}


