/**
 * Page Component
 * Route: /jobs
 * 구인정보 페이지 - 새로운 필터 시스템
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
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

      {/* Jobs Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">구인정보</h1>
          <p class="text-gray-600 text-lg">외국인 인재를 찾는 기업들의 구인공고를 확인하세요</p>
        </div>

        {/* Filter Section */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Basic Filters */}
          <div class="grid md:grid-cols-4 gap-4">
            <input 
              type="text" 
              id="keyword-input" 
              placeholder="회사명, 직무명 검색" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select 
              id="category-select" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">직종 전체</option>
              <option value="IT">IT/소프트웨어</option>
              <option value="manufacturing">제조/생산</option>
              <option value="service">서비스업</option>
              <option value="finance">금융/보험</option>
              <option value="education">교육</option>
              <option value="healthcare">의료/보건</option>
              <option value="design">디자인</option>
              <option value="marketing">마케팅/영업</option>
            </select>
            <select 
              id="location-select" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">지역 전체</option>
              <option value="서울">서울</option>
              <option value="경기도">경기도</option>
              <option value="인천">인천</option>
              <option value="부산">부산</option>
              <option value="대구">대구</option>
              <option value="광주">광주</option>
              <option value="대전">대전</option>
              <option value="울산">울산</option>
              <option value="세종">세종</option>
              <option value="강원도">강원도</option>
              <option value="충청도">충청도</option>
              <option value="경상도">경상도</option>
              <option value="전라도">전라도</option>
              <option value="제주도">제주도</option>
            </select>
            <div class="flex gap-2">
              <button 
                onclick="applyFilters()" 
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
              >
                <i class="fas fa-search mr-2"></i>검색
              </button>
              <button 
                onclick="toggleAdvancedFilters()" 
                id="advanced-filter-btn"
                class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <i class="fas fa-filter mr-2"></i>고급
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div id="advanced-filters" class="hidden mt-6 pt-6 border-t">
            <div class="grid md:grid-cols-3 gap-6">
              {/* Experience Level */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">경력</h4>
                <div class="space-y-2">
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="" checked class="mr-2" />
                    <span class="text-sm text-gray-700">전체</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="entry" class="mr-2" />
                    <span class="text-sm text-gray-700">신입</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="1-3" class="mr-2" />
                    <span class="text-sm text-gray-700">1-3년</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="3-5" class="mr-2" />
                    <span class="text-sm text-gray-700">3-5년</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="experience" value="5+" class="mr-2" />
                    <span class="text-sm text-gray-700">5년 이상</span>
                  </label>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">연봉 (만원)</h4>
                <div class="space-y-3">
                  <div>
                    <label class="text-sm text-gray-600">최소</label>
                    <input 
                      type="number" 
                      id="salary-min" 
                      placeholder="예: 3000" 
                      min="0" 
                      step="100"
                      class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">최대</label>
                    <input 
                      type="number" 
                      id="salary-max" 
                      placeholder="예: 5000" 
                      min="0" 
                      step="100"
                      class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Visa Support */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">비자 지원</h4>
                <div class="space-y-2">
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="sponsorship" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">비자 스폰서십</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="E7" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">E-7 비자</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="E9" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">E-9 비자</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="H2" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">H-2 비자</span>
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
                <i class="fas fa-redo mr-2"></i>초기화
              </button>
              <button 
                onclick="applyFilters()" 
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i class="fas fa-check mr-2"></i>적용
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div class="flex justify-between items-center mb-6">
          <div class="text-sm text-gray-600">
            총 <span id="total-count" class="font-semibold text-gray-900">0</span>개의 구인공고
          </div>
        </div>

        {/* Job Listings */}
        <div id="job-listings" class="space-y-6">
          <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">구인정보를 불러오는 중...</p>
          </div>
        </div>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 구인정보 페이지 JavaScript ====================
        
        let currentPage = 1;
        let currentFilters = {};
        
        // 페이지 로드 시 실행
        window.addEventListener('load', () => {
          console.log('✅ 구인정보 페이지 로드됨');
          
          // 🔐 로그인 상태 복원 (전역 함수 호출 시도)
          if (typeof restoreLoginState === 'function') {
            console.log('restoreLoginState 함수 호출 시작');
            restoreLoginState();
          } else {
            console.warn('restoreLoginState 함수를 찾을 수 없습니다. 직접 복원 시도...');
            // 전역 함수가 없으면 직접 복원
            const token = localStorage.getItem('wowcampus_token');
            const userStr = localStorage.getItem('wowcampus_user');
            if (token && userStr) {
              try {
                const user = JSON.parse(userStr);
                window.currentUser = user;
                console.log('로그인 상태 복원됨:', user.name);
                // 인증 UI 업데이트
                if (typeof updateAuthUI === 'function') {
                  updateAuthUI(user);
                }
              } catch (error) {
                console.error('로그인 상태 복원 실패:', error);
              }
            }
          }
          
          // 통합 네비게이션 메뉴 업데이트 (전역 함수 사용)
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
            const params = new URLSearchParams({
              page: page,
              limit: 20,
              ...currentFilters
            });
            
            const response = await fetch(\`/api/jobs?\${params}\`);
            const result = await response.json();
            
            if (result.success && result.data) {
              displayJobs(result.data, result.total);
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
        function displayJobs(jobs, total) {
          const container = document.getElementById('job-listings');
          const countEl = document.getElementById('total-count');
          
          if (countEl) countEl.textContent = total || jobs.length;
          
          if (jobs.length === 0) {
            displayEmpty();
            return;
          }
          
          container.innerHTML = jobs.map(job => \`
            <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-xl font-bold text-gray-900">\${job.title}</h3>
                    \${job.featured ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">추천</span>' : ''}
                  </div>
                  <p class="text-lg text-gray-700 mb-3">\${job.company_name || '회사명 미표시'}</p>
                  <div class="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                    <span><i class="fas fa-briefcase mr-1"></i>\${job.job_type || '정규직'}</span>
                    <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.location || '서울'}</span>
                    <span><i class="fas fa-won-sign mr-1"></i>\${job.salary_min && job.salary_max ? \`\${job.salary_min/10000}~\${job.salary_max/10000}만원\` : '면접 후 결정'}</span>
                    \${job.visa_sponsorship ? '<span class="text-blue-600"><i class="fas fa-passport mr-1"></i>비자지원</span>' : ''}
                  </div>
                </div>
                <div class="ml-4">
                  <a href="/jobs/\${job.id}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                    상세보기
                  </a>
                </div>
              </div>
            </div>
          \`).join('');
        }
        
        // 빈 상태 표시
        function displayEmpty() {
          const container = document.getElementById('job-listings');
          const countEl = document.getElementById('total-count');
          if (countEl) countEl.textContent = '0';
          
          container.innerHTML = \`
            <div class="text-center py-12 bg-white rounded-lg">
              <i class="fas fa-briefcase text-5xl text-gray-400 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">구인정보가 없습니다</h3>
              <p class="text-gray-600">다른 검색 조건으로 시도해보세요</p>
            </div>
          \`;
        }
        
        // 에러 상태 표시
        function displayError() {
          const container = document.getElementById('job-listings');
          container.innerHTML = \`
            <div class="text-center py-12 bg-white rounded-lg">
              <i class="fas fa-exclamation-circle text-5xl text-red-400 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
              <p class="text-gray-600 mb-4">잠시 후 다시 시도해주세요</p>
              <button onclick="loadJobs()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                다시 시도
              </button>
            </div>
          \`;
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
      </script>
    </div>
  )
}

// Middleware: none
