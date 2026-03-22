/**
 * Page Component
 * Route: /jobs
 * 구인정보 페이지 - 새로운 필터 시스템
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const { t } = c.get('i18n')

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>

          {/* Desktop Navigation Menu */}
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 통합 네비게이션 메뉴 */}
            <a href="/jobs" class="text-blue-600 font-medium">
              <i class="fas fa-briefcase mr-1"></i>{t('common.jobs')}
            </a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              <i class="fas fa-user-tie mr-1"></i>{t('common.jobseekers')}
            </a>
            <a href="/matching" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              <i class="fas fa-magic mr-1"></i>{t('common.ai_matching')}
            </a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              <i class="fas fa-headset mr-1"></i>{t('common.customer_support')}
            </a>
          </div>

          <div class="flex items-center space-x-3">
            {/* Auth Buttons */}
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
                <a href="#" onclick="changeLanguage('zh')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">中文</a>
              </div>
            </div>
            <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
              {/* 인증 버튼이 JavaScript로 동적 로드됩니다 */}
              <div class="flex items-center space-x-3">
                <div class="animate-pulse bg-gray-200 h-10 w-20 rounded-lg"></div>
                <div class="animate-pulse bg-gray-200 h-10 w-24 rounded-lg"></div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button id="mobile-menu-btn" class="lg:hidden p-2 text-gray-600 hover:text-blue-600">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            {/* Mobile Navigation Menu */}
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200">
              {/* 동적 네비게이션 메뉴가 여기에 로드됩니다 */}
            </div>

            {/* Mobile Auth Buttons */}
            <a href="/jobs" class="block py-2 px-4 text-blue-600 bg-blue-50 rounded-lg font-medium">
              <i class="fas fa-briefcase mr-2"></i>{t('common.jobs')}
            </a>
            <a href="/jobseekers" class="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              <i class="fas fa-user-tie mr-2"></i>{t('common.jobseekers')}
            </a>
            <a href="/matching" class="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              <i class="fas fa-magic mr-2"></i>{t('common.ai_matching')}
            </a>
            <a href="/support" class="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              <i class="fas fa-headset mr-2"></i>{t('common.customer_support')}
            </a>
            <div class="border-t border-gray-200 pt-3 mt-3" id="mobile-auth-buttons">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>

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

      {/* Jobs Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{t('jobs.title')}</h1>
          <p class="text-gray-600 text-lg">{t('jobs.subtitle')}</p>
        </div>

        {/* Filter Section */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Basic Filters */}
          <div class="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              id="keyword-input"
              placeholder={t('jobs.search_placeholder')}
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              id="category-select"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('jobs.category_all')}</option>
              <option value="IT">{t('jobs.categories.IT')}</option>
              <option value="manufacturing">{t('jobs.categories.manufacturing')}</option>
              <option value="service">{t('jobs.categories.service')}</option>
              <option value="finance">{t('jobs.categories.finance')}</option>
              <option value="education">{t('jobs.categories.education')}</option>
              <option value="healthcare">{t('jobs.categories.healthcare')}</option>
              <option value="design">{t('jobs.categories.design')}</option>
              <option value="marketing">{t('jobs.categories.marketing')}</option>
            </select>
            <select
              id="location-select"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('jobs.location_all')}</option>
              <option value="서울특별시">{t('jobs.locations.seoul')}</option>
              <option value="부산광역시">{t('jobs.locations.busan')}</option>
              <option value="대구광역시">{t('jobs.locations.daegu')}</option>
              <option value="인천광역시">{t('jobs.locations.incheon')}</option>
              <option value="광주광역시">{t('jobs.locations.gwangju')}</option>
              <option value="대전광역시">{t('jobs.locations.daejeon')}</option>
              <option value="울산광역시">{t('jobs.locations.ulsan')}</option>
              <option value="세종특별자치시">{t('jobs.locations.sejong')}</option>
              <option value="경기도">{t('jobs.locations.gyeonggi')}</option>
              <option value="강원특별자치도">{t('jobs.locations.gangwon')}</option>
              <option value="충청북도">{t('jobs.locations.chungbuk')}</option>
              <option value="충청남도">{t('jobs.locations.chungnam')}</option>
              <option value="전북특별자치도">{t('jobs.locations.jeonbuk')}</option>
              <option value="전라남도">{t('jobs.locations.jeonnam')}</option>
              <option value="경상북도">{t('jobs.locations.gyeongbuk')}</option>
              <option value="경상남도">{t('jobs.locations.gyeongnam')}</option>
              <option value="제주특별자치도">{t('jobs.locations.jeju')}</option>
              <option value="전국">{t('jobs.locations.nationwide')}</option>
              <option value="해외">{t('jobs.locations.overseas')}</option>
            </select>
            <div class="flex gap-2">
              <button
                onclick="applyFilters()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
              >
                <i class="fas fa-search mr-2"></i>{t('jobs.btn_search')}
              </button>
              <button
                onclick="toggleAdvancedFilters()"
                id="advanced-filter-btn"
                class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <i class="fas fa-filter mr-2"></i>{t('jobs.btn_advanced')}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div id="advanced-filters" class="hidden mt-6 pt-6 border-t">
            <div class="grid md:grid-cols-3 gap-6">
              {/* Experience Level */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">{t('jobs.experience')}</h4>
                <div class="space-y-2">
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="" checked class="mr-2" />
                    <span class="text-sm text-gray-700">{t('jobs.exp_all')}</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="entry" class="mr-2" />
                    <span class="text-sm text-gray-700">{t('jobs.exp_entry')}</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="1-3" class="mr-2" />
                    <span class="text-sm text-gray-700">{t('jobs.exp_1_3')}</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="3-5" class="mr-2" />
                    <span class="text-sm text-gray-700">{t('jobs.exp_3_5')}</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="5+" class="mr-2" />
                    <span class="text-sm text-gray-700">{t('jobs.exp_5_plus')}</span>
                  </label>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">{t('jobs.salary')}</h4>
                <div class="space-y-3">
                  <div>
                    <label class="text-sm text-gray-600">{t('jobs.salary_min')}</label>
                    <input
                      type="number"
                      id="salary-min"
                      placeholder={t('jobs.salary_placeholder_min')}
                      min="0"
                      step="100"
                      class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">{t('jobs.salary_max')}</label>
                    <input
                      type="number"
                      id="salary-max"
                      placeholder={t('jobs.salary_placeholder_max')}
                      min="0"
                      step="100"
                      class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Visa Support */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">{t('jobs.visa_support')}</h4>
                <div class="space-y-2">
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="sponsorship" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">{t('jobs.visa_sponsorship')}</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="E7" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">{t('jobs.visa_e7')}</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="E9" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">{t('jobs.visa_e9')}</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="H2" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">{t('jobs.visa_h2')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div class="flex justify-between items-center mt-6 pt-4 border-t">
              <button
                onclick="clearFilters()"
                class="text-gray-600 hover:text-gray-800 text-sm"
              >
                <i class="fas fa-redo mr-2"></i>{t('jobs.btn_clear')}
              </button>
              <button
                onclick="applyFilters()"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i class="fas fa-check mr-2"></i>{t('jobs.btn_apply')}
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div class="flex justify-between items-center mb-6">
          <div class="text-sm text-gray-600" id="total-count">
            {/* 카운트는 데이터 로드 후 JavaScript로 업데이트됩니다 */}
          </div>
        </div>

        {/* Job Listings */}
        <div id="job-listings" class="space-y-6">
          <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">{t('jobs.loading')}</p>
          </div>
        </div>

        {/* Pagination */}
        <div id="pagination-container" class="mt-8 flex justify-center">
          {/* 페이지네이션이 여기에 동적으로 로드됩니다 */}
        </div>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // ==================== 구인정보 페이지 JavaScript ====================
        
        let currentPage = 1;
        let currentFilters = {};
        
        // 🔐 로컬 인증 UI 업데이트 함수
        function updateAuthUI(user = null) {
          console.log('updateAuthUI 호출:', user ? \`\${user.name} (\${user.user_type})\` : '비로그인');
          
          const authButtons = document.getElementById('auth-buttons-container');
          if (!authButtons) return;
          
          if (user) {
            const userTypeColors = {
              jobseeker: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
              company: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
              agent: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
              admin: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' }
            };
            
            const dashboardLinks = {
              jobseeker: '/dashboard/jobseeker',
              company: '/dashboard/company',
              agent: '/agents',
              admin: '/admin'
            };
            
            const colors = userTypeColors[user.user_type] || userTypeColors.jobseeker;
            const dashboardLink = dashboardLinks[user.user_type] || '/';
            
            authButtons.innerHTML = \`
              <div class="flex items-center space-x-2 \${colors.bg} \${colors.border} px-3 py-2 rounded-lg">
                <i class="fas fa-user \${colors.icon}"></i>
                <span class="\${colors.text} font-medium">\${user.name}\${window.t('common.name_suffix')}</span>
              </div>
              <a href="\${dashboardLink}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-tachometer-alt mr-1"></i>\${window.t('dashboard.my_dashboard')}
              </a>
              <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                <i class="fas fa-sign-out-alt mr-1"></i>\${window.t('common.logout')}
              </button>
            \`;
          } else {
            authButtons.innerHTML = \`
              <button onclick="location.href='/?action=login&redirect=/jobs'" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                <i class="fas fa-sign-in-alt mr-1"></i>\${window.t('common.login')}
              </button>
              <button onclick="location.href='/?action=signup&redirect=/jobs'" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-user-plus mr-1"></i>\${window.t('common.register')}
              </button>
            \`;
          }
        }
        
        // 🚪 로그아웃 핸들러
        function handleLogout() {
          localStorage.removeItem('wowcampus_token');
          localStorage.removeItem('wowcampus_user');
          window.currentUser = null;
          window.location.href = '/';
        }
        
        // 📱 모바일 메뉴 토글
        function toggleMobileMenu() {
          const mobileMenu = document.getElementById('mobile-menu');
          const menuBtn = document.getElementById('mobile-menu-btn');
          
          if (mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.remove('hidden');
            menuBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
          } else {
            mobileMenu.classList.add('hidden');
            menuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
          }
        }
        
        // 📱 모바일 인증 UI 업데이트
        function updateMobileAuthUI(user = null) {
          const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
          if (!mobileAuthButtons) return;
          
          if (user) {
            const userTypeColors = {
              jobseeker: 'bg-green-50 text-green-800',
              company: 'bg-purple-50 text-purple-800',
              agent: 'bg-blue-50 text-blue-800',
              admin: 'bg-red-50 text-red-800'
            };
            
            const dashboardLinks = {
              jobseeker: '/dashboard/jobseeker',
              company: '/dashboard/company',
              agent: '/agents',
              admin: '/admin'
            };
            
            const colorClass = userTypeColors[user.user_type] || userTypeColors.jobseeker;
            const dashboardLink = dashboardLinks[user.user_type] || '/';
            
            mobileAuthButtons.innerHTML = \`
              <div class="py-2 px-4 \${colorClass} rounded-lg mb-2">
                <i class="fas fa-user mr-2"></i>\${user.name}\${window.t('common.name_suffix')}
              </div>
              <a href="\${dashboardLink}" class="block py-2 px-4 bg-blue-600 text-white rounded-lg text-center mb-2">
                <i class="fas fa-tachometer-alt mr-2"></i>\${window.t('dashboard.my_dashboard')}
              </a>
              <button onclick="handleLogout()" class="w-full py-2 px-4 text-red-600 border border-red-600 rounded-lg">
                <i class="fas fa-sign-out-alt mr-2"></i>\${window.t('common.logout')}
              </button>
            \`;
          } else {
            mobileAuthButtons.innerHTML = \`
              <a href="/?action=login&redirect=/jobs" class="block py-2 px-4 text-blue-600 border border-blue-600 rounded-lg text-center mb-2">
                <i class="fas fa-sign-in-alt mr-2"></i>\${window.t('common.login')}
              </a>
              <a href="/?action=signup&redirect=/jobs" class="block py-2 px-4 bg-blue-600 text-white rounded-lg text-center">
                <i class="fas fa-user-plus mr-2"></i>\${window.t('common.register')}
              </a>
            \`;
          }
        }
        
        // 페이지 로드 시 실행
        window.addEventListener('load', () => {
          console.log('✅ 구인정보 페이지 로드됨');
          
          // 🔐 로그인 상태 복원
          const token = localStorage.getItem('wowcampus_token');
          const userStr = localStorage.getItem('wowcampus_user');
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              window.currentUser = user;
              console.log('로그인 상태 복원됨:', user.name);
              updateAuthUI(user);
              updateMobileAuthUI(user);
            } catch (error) {
              console.error('로그인 상태 복원 실패:', error);
              updateAuthUI(null);
              updateMobileAuthUI(null);
            }
          } else {
            updateAuthUI(null);
            updateMobileAuthUI(null);
          }
          
          // 📱 모바일 메뉴 버튼 이벤트
          const mobileMenuBtn = document.getElementById('mobile-menu-btn');
          if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
          }
          
          // 통합 네비게이션 메뉴 업데이트
          if (typeof updateNavigationMenu === 'function') {
            const user = window.currentUser || null;
            updateNavigationMenu(user);
          }
          
          loadJobs();
        });
        
        // 구인정보 로드
        async function loadJobs(page = 1) {
          try {
            currentPage = page;
            
            // 페이지 상단으로 스크롤
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // limit을 명시적으로 10으로 설정
            const limit = 10;
            const params = new URLSearchParams({
              page: String(page),
              limit: String(limit)
            });
            
            // 필터 추가
            Object.keys(currentFilters).forEach(key => {
              if (currentFilters[key] !== undefined && currentFilters[key] !== null && currentFilters[key] !== '') {
                params.append(key, String(currentFilters[key]));
              }
            });
            
            console.log('🔍 API 요청 파라미터:', params.toString());
            
            const response = await fetch(\`/api/jobs?\${params.toString()}\`);
            const result = await response.json();
            
            console.log('📊 API 응답:', { 
              success: result.success, 
              dataCount: result.data?.length || 0, 
              total: result.total, 
              totalPages: result.totalPages,
              page: result.page,
              limit: result.limit
            });
            
            if (result.success && result.data) {
              const total = result.total || 0;
              const totalPages = result.totalPages || Math.ceil(total / 10) || 1;
              console.log('✅ 페이지네이션 데이터:', { total, totalPages, page, dataCount: result.data.length });
              displayJobs(result.data, total, page, totalPages);
            } else {
              displayEmpty();
            }
          } catch (error) {
            console.error('로드 오류:', error);
            displayError();
          }
        }
        
        // 필터 적용
        function applyFilters() {
          const keyword = document.getElementById('keyword-input').value.trim();
          const category = document.getElementById('category-select').value;
          const location = document.getElementById('location-select').value;
          const experience = document.querySelector('input[name="experience"]:checked')?.value;
          const salaryMin = document.getElementById('salary-min')?.value;
          const salaryMax = document.getElementById('salary-max')?.value;
          const visaChecked = Array.from(document.querySelectorAll('input[name="visa"]:checked')).map(cb => cb.value);
          
          currentFilters = {};
          if (keyword) currentFilters.keyword = keyword;
          if (category) currentFilters.category = category;
          if (location) currentFilters.location = location;
          if (experience) currentFilters.experience = experience;
          if (salaryMin) currentFilters.salary_min = salaryMin;
          if (salaryMax) currentFilters.salary_max = salaryMax;
          if (visaChecked.length > 0) currentFilters.visa = visaChecked.join(',');
          
          console.log('🔍 필터 적용:', currentFilters);
          loadJobs(1);
        }
        
        // 필터 초기화
        function clearFilters() {
          document.getElementById('keyword-input').value = '';
          document.getElementById('category-select').value = '';
          document.getElementById('location-select').value = '';
          document.querySelector('input[name="experience"][value=""]').checked = true;
          if (document.getElementById('salary-min')) document.getElementById('salary-min').value = '';
          if (document.getElementById('salary-max')) document.getElementById('salary-max').value = '';
          document.querySelectorAll('input[name="visa"]').forEach(cb => cb.checked = false);
          
          currentFilters = {};
          loadJobs(1);
        }
        
        // 고급 필터 토글
        function toggleAdvancedFilters() {
          const filters = document.getElementById('advanced-filters');
          const button = document.getElementById('advanced-filter-btn');
          
          if (filters.classList.contains('hidden')) {
            filters.classList.remove('hidden');
            button.classList.add('bg-blue-100', 'text-blue-700');
            button.classList.remove('bg-gray-100', 'text-gray-700');
          } else {
            filters.classList.add('hidden');
            button.classList.remove('bg-blue-100', 'text-blue-700');
            button.classList.add('bg-gray-100', 'text-gray-700');
          }
        }
        
        // 구인정보 표시
        function displayJobs(jobs, total, currentPage, totalPages) {
          const container = document.getElementById('job-listings');
          const countEl = document.getElementById('total-count');
          if (countEl) {
            const countText = window.t('jobs.total_count').replace('{count}', '<span class="font-semibold text-gray-900">' + (total || jobs.length) + '</span>');
            countEl.innerHTML = countText;
          }
          
          if (jobs.length === 0) {
            displayEmpty();
            displayPagination(1, 1, 0);
            return;
          }
          
          container.innerHTML = jobs.map(function(job) {
            const recTag = job.featured ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">' + window.t('jobs.recommended') + '</span>' : '';
            const compName = job.company_name || window.t('jobs.no_company_name');
            const jType = job.job_type || window.t('jobs.job_type_fulltime');
            const loc = job.location || 'Seoul';
            const sText = job.salary_min && job.salary_max ? window.t('jobs.salary_range').replace('{min}', job.salary_min/10000).replace('{max}', job.salary_max/10000) : window.t('jobs.salary_after_interview');
            const vTag = job.visa_sponsorship ? '<span class="text-blue-600"><i class="fas fa-passport mr-1"></i>' + window.t('jobs.visa_support_tag') + '</span>' : '';
            const vDetail = window.t('jobs.view_detail');

            let html = '<div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">';
            html += '<div class="flex items-start justify-between">';
            html += '<div class="flex-1">';
            html += '<div class="flex items-center gap-2 mb-2">';
            html += '<h3 class="text-xl font-bold text-gray-900">' + job.title + '</h3>';
            html += recTag;
            html += '</div>';
            html += '<p class="text-lg text-gray-700 mb-3">' + compName + '</p>';
            html += '<div class="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">';
            html += '<span><i class="fas fa-briefcase mr-1"></i>' + jType + '</span>';
            html += '<span><i class="fas fa-map-marker-alt mr-1"></i>' + loc + '</span>';
            html += '<span><i class="fas fa-won-sign mr-1"></i>' + sText + '</span>';
            html += vTag;
            html += '</div></div>';
            html += '<div class="ml-4">';
            html += '<a href="/jobs/' + job.id + '" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">';
            html += vDetail;
            html += '</a></div></div></div>';
            return html;
          }).join('');
          
          // 페이지네이션 표시
          displayPagination(currentPage, totalPages, total);
        }
        
        // 페이지네이션 표시
        function displayPagination(currentPage, totalPages, total) {
          const container = document.getElementById('pagination-container');
          if (!container) {
            console.error('페이지네이션 컨테이너를 찾을 수 없습니다');
            return;
          }
          
          console.log('📄 페이지네이션 표시:', { currentPage, totalPages, total });
          
          if (totalPages <= 1) {
            container.innerHTML = '';
            return;
          }
          
          const limit = 10;
          const startItem = (currentPage - 1) * limit + 1;
          const endItem = Math.min(currentPage * limit, total);
          
          let html = '<div class="flex flex-col items-center gap-4">';
          
          // 결과 정보
          html += '<div class="text-sm text-gray-600">';
          html += window.t('jobs.pagination.showing') + ' ' + startItem + ' ' + window.t('jobs.pagination.to') + ' ' + endItem + ' ' + window.t('jobs.pagination.of') + ' ' + total + ' ' + window.t('jobs.pagination.results');
          html += '</div>';
          
          // 페이지네이션 버튼
          html += '<div class="flex items-center gap-2">';
          
          // 이전 버튼
          html += '<button onclick="loadJobs(' + (currentPage - 1) + ')" ';
          html += 'class="px-4 py-2 rounded-lg border border-gray-300 ' + (currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50') + '" ';
          html += (currentPage === 1 ? 'disabled' : '') + '>';
          html += '<i class="fas fa-chevron-left mr-1"></i>' + window.t('jobs.pagination.prev');
          html += '</button>';
          
          // 페이지 번호
          const maxVisiblePages = 5;
          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
          
          if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
          }
          
          if (startPage > 1) {
            html += '<button onclick="loadJobs(1)" class="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">1</button>';
            if (startPage > 2) {
              html += '<span class="px-2 text-gray-400">...</span>';
            }
          }
          
          for (let i = startPage; i <= endPage; i++) {
            html += '<button onclick="loadJobs(' + i + ')" ';
            html += 'class="px-4 py-2 rounded-lg border ' + (i === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50') + '">';
            html += i;
            html += '</button>';
          }
          
          if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
              html += '<span class="px-2 text-gray-400">...</span>';
            }
            html += '<button onclick="loadJobs(' + totalPages + ')" class="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">' + totalPages + '</button>';
          }
          
          // 다음 버튼
          html += '<button onclick="loadJobs(' + (currentPage + 1) + ')" ';
          html += 'class="px-4 py-2 rounded-lg border border-gray-300 ' + (currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50') + '" ';
          html += (currentPage === totalPages ? 'disabled' : '') + '>';
          html += window.t('jobs.pagination.next') + ' <i class="fas fa-chevron-right ml-1"></i>';
          html += '</button>';
          
          html += '</div>';
          html += '</div>';
          
          container.innerHTML = html;
        }
        
        // 빈 상태 표시
        function displayEmpty() {
          const container = document.getElementById('job-listings');
          const countEl = document.getElementById('total-count');
          if (countEl) countEl.innerHTML = window.t('jobs.total_count').replace('{count}', '0');
          
          let html = '<div class="text-center py-12 bg-white rounded-lg">';
          html += '<i class="fas fa-briefcase text-5xl text-gray-400 mb-4"></i>';
          html += '<h3 class="text-xl font-semibold text-gray-900 mb-2">' + window.t('jobs.empty') + '</h3>';
          html += '<p class="text-gray-600">' + window.t('jobs.empty_desc') + '</p>';
          html += '</div>';
          container.innerHTML = html;
          
          // 페이지네이션 숨기기
          displayPagination(1, 1, 0);
        }
        
        // 에러 상태 표시
        function displayError() {
          const container = document.getElementById('job-listings');
          let html = '<div class="text-center py-12 bg-white rounded-lg">';
          html += '<i class="fas fa-exclamation-circle text-5xl text-red-400 mb-4"></i>';
          html += '<h3 class="text-xl font-semibold text-gray-900 mb-2">' + window.t('jobs.error') + '</h3>';
          html += '<p class="text-gray-600 mb-4">' + window.t('jobs.error_desc') + '</p>';
          html += '<button onclick="loadJobs()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">';
          html += window.t('jobs.btn_retry');
          html += '</button></div>';
          container.innerHTML = html;
          
          // 페이지네이션 숨기기
          displayPagination(1, 1, 0);
        }
        
        // 로그인/회원가입 모달
        function showLoginModal() {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/?action=login';
        }
        
        function showSignupModal() {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/?action=signup';
        }
        
        // 글로벌 함수 노출
        window.loadJobs = loadJobs;
        window.applyFilters = applyFilters;
        window.clearFilters = clearFilters;
        window.toggleAdvancedFilters = toggleAdvancedFilters;
        
        // ==================== 끝: 구인정보 페이지 JavaScript ====================
      `}}>
      </script >
    </div >,
    {
      title: '구인정보 · 채용공고 | WOW-CAMPUS - 외국인 취업포털',
      description: '한국 내 외국인 채용공고, 구인정보를 찾아보세요. 제조업, 서비스업, IT 등 다양한 분야의 외국인 취업 기회. WOW-CAMPUS에서 취업 AI 매칭 서비스를 이용하세요.',
      keywords: '외국인 채용, 외국인 구인, 한국 취업, 외국인 일자리, 제조업 채용, 서비스업 채용, E7비자 채용',
    }
  )
}

// Middleware: none
