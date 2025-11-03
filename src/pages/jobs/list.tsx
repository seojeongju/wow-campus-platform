/**
 * Page Component
 * Route: /jobs
 * Original: src/index.tsx lines 7784-8241
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
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

        {/* Advanced Search and Filter */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Basic Search */}
          <div class="grid md:grid-cols-4 gap-4 mb-6">
            <input type="text" id="job-search-input" placeholder="회사명, 직무명 검색" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <select id="job-category-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
            <select id="job-location-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">지역 전체</option>
              <option value="서울">서울</option>
              <option value="경기도">경기도</option>
              <option value="강원도">강원도</option>
              <option value="충청도">충청도</option>
              <option value="경상도">경상도</option>
              <option value="전라도">전라도</option>
              <option value="제주도">제주도</option>
            </select>
            <div class="flex gap-2">
              <button onclick="searchJobs()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1">
                <i class="fas fa-search mr-2"></i>검색
              </button>
              <button onclick="toggleAdvancedFilters()" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <i class="fas fa-filter mr-2"></i>고급
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div id="advanced-job-filters" class="border-t pt-6 hidden">
            <div class="grid lg:grid-cols-3 gap-6">
              {/* Employment Type */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">고용형태</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="employment_type" value="fulltime" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">정규직</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="employment_type" value="contract" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">계약직</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="employment_type" value="parttime" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">파트타임</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="employment_type" value="internship" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">인턴십</span>
                  </label>
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">경력요구사항</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="experience_level" value="entry" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">신입 (경력무관)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="experience_level" value="1-3" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">1-3년</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="experience_level" value="3-5" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">3-5년</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="experience_level" value="5+" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">5년 이상</span>
                  </label>
                </div>
              </div>

              {/* Visa Support */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">비자 지원</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_support" value="yes" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">비자 스폰서십 제공</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_support" value="E7" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">E-7 비자 가능</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_support" value="E9" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">E-9 비자 가능</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_support" value="F2" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">F-2 비자 우대</span>
                  </label>
                </div>
              </div>

              {/* Company Size */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">기업규모</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="company_size" value="startup" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">스타트업 (1-50명)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="company_size" value="medium" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">중견기업 (51-300명)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="company_size" value="large" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">대기업 (300명 이상)</span>
                  </label>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">연봉범위 (만원)</h4>
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-sm text-gray-600">최소 연봉</label>
                    <input 
                      type="number" 
                      id="salary-min-input" 
                      placeholder="예: 2000" 
                      min="0" 
                      step="100"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm text-gray-600">최대 연봉</label>
                    <input 
                      type="number" 
                      id="salary-max-input" 
                      placeholder="예: 5000" 
                      min="0" 
                      step="100"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div class="text-xs text-gray-500">
                    <i class="fas fa-info-circle mr-1"></i>
                    빈 칸은 제한 없음을 의미합니다
                  </div>
                </div>
              </div>

              {/* Language Requirements */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">언어요구사항</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="beginner" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">한국어 초급 가능</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="intermediate" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">한국어 중급 필수</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="advanced" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">한국어 고급 필수</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="english_required" value="true" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">영어 가능자 우대</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center mt-6 pt-4 border-t">
              <button onclick="clearAllFilters('job')" class="text-gray-600 hover:text-gray-800 text-sm">
                <i class="fas fa-times mr-2"></i>모든 필터 해제
              </button>
              <div class="flex gap-2">
                <button onclick="applyJobFilters()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-filter mr-2"></i>필터 적용
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          <div id="active-job-filters" class="mt-4 hidden">
            <div class="flex flex-wrap gap-2">
              <span class="text-sm text-gray-600 mr-2">적용된 필터:</span>
              <div id="active-job-filters-list" class="flex flex-wrap gap-2">
                {/* Active filter badges will be inserted here */}
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div class="space-y-6" id="job-listings">
          <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">구인정보를 불러오는 중...</p>
          </div>
        </div>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 구인정보 페이지 JavaScript ====================
        
        let jobsPageCurrentPage = 1;
        let jobsPageCurrentFilters = {};
        
        // 페이지 로드 시 실행 - app.js 이후에 실행되도록 지연
        window.addEventListener('load', async () => {
          console.log('Jobs page JavaScript loaded');
          console.log('Starting to load jobs data...');
          try {
            await loadJobsData();
            console.log('Jobs data load completed');
          } catch (error) {
            console.error('Error in window load handler:', error);
          }
        });
        
        // 구인정보 로드
        async function loadJobsData(page = 1) {
          console.log('loadJobsData called with page:', page);
          try {
            jobsPageCurrentPage = page;
            const params = new URLSearchParams({
              page: page,
              limit: 20,
              ...jobsPageCurrentFilters
            });
            
            console.log('Fetching jobs from API with params:', params.toString());
            const response = await fetch(\`/api/jobs?\${params}\`);
            console.log('API response status:', response.status);
            const result = await response.json();
            console.log('API result:', result);
            
            if (result.success && result.data) {
              console.log('Displaying', result.data.length, 'jobs');
              displayJobs(result.data);
              displayPagination({
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
              });
            } else {
              console.log('No data or unsuccessful response, showing empty state');
              displayEmptyState();
            }
          } catch (error) {
            console.error('구인정보 로드 오류:', error);
            displayErrorState();
          }
        }
        
        // 구인정보 표시
        function displayJobs(jobs) {
          const container = document.getElementById('job-listings');
          if (!container) return;
          
          if (jobs.length === 0) {
            displayEmptyState();
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
                    <span><i class="fas fa-briefcase mr-1"></i>\${job.job_type || '-'}</span>
                    <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.location || '-'}</span>
                    <span><i class="fas fa-won-sign mr-1"></i>\${job.salary_min && job.salary_max ? \`\${job.salary_min/10000}~\${job.salary_max/10000}만원\` : '회사내규'}</span>
                    \${job.visa_sponsorship ? '<span class="text-blue-600"><i class="fas fa-passport mr-1"></i>비자지원</span>' : ''}
                  </div>
                  <div class="flex flex-wrap gap-2">
                    \${job.skills_required ? JSON.parse(job.skills_required).map(skill => \`<span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">\${skill}</span>\`).join('') : ''}
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
        function displayEmptyState() {
          const container = document.getElementById('job-listings');
          if (!container) return;
          
          container.innerHTML = \`
            <div class="text-center py-12 bg-white rounded-lg">
              <i class="fas fa-briefcase text-5xl text-gray-400 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">구인정보가 없습니다</h3>
              <p class="text-gray-600">검색 조건을 변경해보세요</p>
            </div>
          \`;
        }
        
        // 에러 상태 표시
        function displayErrorState() {
          const container = document.getElementById('job-listings');
          if (!container) return;
          
          container.innerHTML = \`
            <div class="text-center py-12 bg-white rounded-lg">
              <i class="fas fa-exclamation-circle text-5xl text-red-400 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
              <p class="text-gray-600 mb-4">구인정보를 불러오는 중 문제가 발생했습니다</p>
              <button onclick="loadJobsData()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                다시 시도
              </button>
            </div>
          \`;
        }
        
        // 페이지네이션 표시
        function displayPagination(pagination) {
          if (!pagination) return;
          // TODO: 페이지네이션 UI 구현
        }
        
        // 검색 실행
        function searchJobs() {
          const keyword = document.getElementById('job-search-input')?.value || '';
          const category = document.getElementById('job-category-filter')?.value || '';
          const location = document.getElementById('job-location-filter')?.value || '';
          
          jobsPageCurrentFilters = {};
          if (keyword) jobsPageCurrentFilters.keyword = keyword;
          if (category) jobsPageCurrentFilters.category = category;
          if (location) jobsPageCurrentFilters.location = location;
          
          loadJobsData(1);
        }
        
        // 고급 필터 토글
        function toggleAdvancedFilters() {
          console.log('🔧 고급 필터 토글 시도...');
          const filters = document.getElementById('advanced-job-filters');
          const button = document.querySelector('button[onclick*="toggleAdvancedFilters"]');
          
          if (filters) {
            const isHidden = filters.classList.contains('hidden');
            filters.classList.toggle('hidden');
            
            // 버튼 색상 변경
            if (button) {
              if (isHidden) {
                button.classList.add('bg-blue-100', 'text-blue-700');
                button.classList.remove('bg-gray-100', 'text-gray-700');
                console.log('✅ 고급 필터 열림');
              } else {
                button.classList.remove('bg-blue-100', 'text-blue-700');
                button.classList.add('bg-gray-100', 'text-gray-700');
                console.log('✅ 고급 필터 닫힘');
              }
            }
          } else {
            console.error('❌ advanced-job-filters 요소를 찾을 수 없습니다');
          }
        }
        
        // 모든 필터 해제
        function clearAllFilters() {
          // 체크박스 해제
          document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
          // 필터 초기화
          jobsPageCurrentFilters = {};
          loadJobsData(1);
        }
        
        // 필터 적용
        function applyJobFilters() {
          // 체크된 필터들 수집
          const employmentTypes = Array.from(document.querySelectorAll('input[name="employment_type"]:checked')).map(cb => cb.value);
          const experienceLevels = Array.from(document.querySelectorAll('input[name="experience_level"]:checked')).map(cb => cb.value);
          const visaSupport = Array.from(document.querySelectorAll('input[name="visa_support"]:checked')).map(cb => cb.value);
          
          if (employmentTypes.length > 0) jobsPageCurrentFilters.employment_type = employmentTypes.join(',');
          if (experienceLevels.length > 0) jobsPageCurrentFilters.experience_level = experienceLevels.join(',');
          if (visaSupport.length > 0) jobsPageCurrentFilters.visa_support = visaSupport.join(',');
          
          loadJobsData(1);
        }
        
        // 로그인/회원가입 모달 함수 - 메인 페이지로 리다이렉트하여 처리
        function showLoginModal() {
          console.log('로그인 모달 호출 - 메인 페이지로 이동');
          // 현재 페이지 경로를 저장하여 로그인 후 돌아올 수 있도록
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/?action=login';
        }
        
        function showSignupModal() {
          console.log('회원가입 모달 호출 - 메인 페이지로 이동');
          // 현재 페이지 경로를 저장하여 회원가입 후 돌아올 수 있도록
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/?action=signup';
        }
        
        // ==================== 끝: 구인정보 페이지 JavaScript ====================
      `}}>
      </script>
    </div>
  )

// Study page
}

// Middleware: none
