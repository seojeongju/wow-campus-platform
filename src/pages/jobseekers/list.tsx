/**
 * Page Component
 * Route: /jobseekers
 * 구직정보 페이지 - 새로운 필터 시스템
 */

import type { Context } from 'hono'
import { optionalAuth } from '../middleware/auth'

export const handler = (c: Context) => {
  const user = c.get('user');
  
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

      {/* Job Seekers Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">구직정보</h1>
          <p class="text-gray-600 text-lg">우수한 외국인 구직자들의 프로필을 확인하세요</p>
        </div>

        {/* Filter Section */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Basic Filters */}
          <div class="grid md:grid-cols-4 gap-4">
            <input 
              type="text" 
              id="keyword-input" 
              placeholder="이름, 기술, 전공 검색" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <select 
              id="major-select" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">전공 전체</option>
              <option value="computer">컴퓨터공학/IT</option>
              <option value="business">경영학</option>
              <option value="design">디자인</option>
              <option value="engineering">공학</option>
              <option value="marketing">마케팅</option>
              <option value="finance">금융/경제</option>
              <option value="languages">어학/문학</option>
              <option value="other">기타</option>
            </select>
            <select 
              id="location-select" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">희망 지역 전체</option>
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
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex-1"
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
                    <input type="radio" name="experience" value="1-2" class="mr-2" />
                    <span class="text-sm text-gray-700">1-2년</span>
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

              {/* Nationality */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">국적</h4>
                <div class="space-y-2">
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="nationality" value="china" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">중국</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="nationality" value="vietnam" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">베트남</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="nationality" value="philippines" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">필리핀</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="nationality" value="thailand" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">태국</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="nationality" value="other" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">기타</span>
                  </label>
                </div>
              </div>

              {/* Visa Status */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">비자 상태</h4>
                <div class="space-y-2">
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="E7" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">E-7 (특정활동)</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="E9" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">E-9 (비전문)</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="F2" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">F-2 (거주)</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="F4" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">F-4 (재외동포)</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" name="visa" value="H2" class="mr-2 rounded" />
                    <span class="text-sm text-gray-700">H-2 (방문취업)</span>
                  </label>
                </div>
              </div>

              {/* Korean Level */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">한국어 수준</h4>
                <div class="space-y-2">
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="korean" value="" checked class="mr-2" />
                    <span class="text-sm text-gray-700">전체</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="korean" value="beginner" class="mr-2" />
                    <span class="text-sm text-gray-700">초급</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="korean" value="intermediate" class="mr-2" />
                    <span class="text-sm text-gray-700">중급</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="korean" value="advanced" class="mr-2" />
                    <span class="text-sm text-gray-700">고급</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" name="korean" value="fluent" class="mr-2" />
                    <span class="text-sm text-gray-700">유창</span>
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
                class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <i class="fas fa-check mr-2"></i>적용
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div class="flex justify-between items-center mb-6">
          <div class="text-sm text-gray-600">
            총 <span id="total-count" class="font-semibold text-gray-900">0</span>명의 구직자
          </div>
        </div>

        {/* Job Seekers List */}
        <div id="jobseeker-listings" class="space-y-6">
          <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">구직자 정보를 불러오는 중...</p>
          </div>
        </div>
      </main>

      {/* Server-side user info */}
      <script dangerouslySetInnerHTML={{__html: `
        window.__SERVER_USER__ = ${user ? JSON.stringify(user) : 'null'};
      `}}></script>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 구직정보 페이지 JavaScript ====================
        
        let currentPage = 1;
        let currentFilters = {};
        
        // 페이지 로드 시 실행
        window.addEventListener('load', () => {
          console.log('✅ 구직정보 페이지 로드됨');
          checkLoginAndLoad();
        });
        
        // 로그인 체크 및 로드
        function checkLoginAndLoad() {
          const serverUser = window.__SERVER_USER__;
          const token = localStorage.getItem('wowcampus_token');
          const isLoggedIn = serverUser || token;
          
          if (!isLoggedIn) {
            displayLoginRequired();
            return;
          }
          
          loadJobSeekers();
        }
        
        // 로그인 필요 메시지
        function displayLoginRequired() {
          const container = document.getElementById('jobseeker-listings');
          container.innerHTML = \`
            <div class="text-center py-12 bg-white rounded-lg">
              <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-lock text-yellow-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h3>
              <p class="text-gray-600 mb-6">
                구직자 정보를 확인하려면 먼저 로그인해주세요.
              </p>
              <div class="space-y-3 max-w-sm mx-auto">
                <a href="/login?redirect=/jobseekers" class="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center">
                  <i class="fas fa-sign-in-alt mr-2"></i>로그인하기
                </a>
                <a href="/login?action=signup&redirect=/jobseekers" class="block w-full px-6 py-3 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-center">
                  <i class="fas fa-user-plus mr-2"></i>회원가입하기
                </a>
              </div>
            </div>
          \`;
        }
        
        // 구직정보 로드
        async function loadJobSeekers(page = 1) {
          try {
            currentPage = page;
            const params = new URLSearchParams({
              page: page,
              limit: 20,
              ...currentFilters
            });
            
            const response = await fetch(\`/api/jobseekers?\${params}\`);
            const result = await response.json();
            
            if (result.success && result.data) {
              displayJobSeekers(result.data, result.total);
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
          const major = document.getElementById('major-select').value;
          const location = document.getElementById('location-select').value;
          const experience = document.querySelector('input[name="experience"]:checked')?.value;
          const korean = document.querySelector('input[name="korean"]:checked')?.value;
          const nationalityChecked = Array.from(document.querySelectorAll('input[name="nationality"]:checked')).map(cb => cb.value);
          const visaChecked = Array.from(document.querySelectorAll('input[name="visa"]:checked')).map(cb => cb.value);
          
          currentFilters = {};
          if (keyword) currentFilters.keyword = keyword;
          if (major) currentFilters.major = major;
          if (location) currentFilters.location = location;
          if (experience) currentFilters.experience = experience;
          if (korean) currentFilters.korean_level = korean;
          if (nationalityChecked.length > 0) currentFilters.nationality = nationalityChecked.join(',');
          if (visaChecked.length > 0) currentFilters.visa = visaChecked.join(',');
          
          console.log('🔍 필터 적용:', currentFilters);
          loadJobSeekers(1);
        }
        
        // 필터 초기화
        function clearFilters() {
          document.getElementById('keyword-input').value = '';
          document.getElementById('major-select').value = '';
          document.getElementById('location-select').value = '';
          document.querySelector('input[name="experience"][value=""]').checked = true;
          document.querySelector('input[name="korean"][value=""]').checked = true;
          document.querySelectorAll('input[name="nationality"]').forEach(cb => cb.checked = false);
          document.querySelectorAll('input[name="visa"]').forEach(cb => cb.checked = false);
          
          currentFilters = {};
          loadJobSeekers(1);
        }
        
        // 고급 필터 토글
        function toggleAdvancedFilters() {
          const filters = document.getElementById('advanced-filters');
          const button = document.getElementById('advanced-filter-btn');
          
          if (filters.classList.contains('hidden')) {
            filters.classList.remove('hidden');
            button.classList.add('bg-green-100', 'text-green-700');
            button.classList.remove('bg-gray-100', 'text-gray-700');
          } else {
            filters.classList.add('hidden');
            button.classList.remove('bg-green-100', 'text-green-700');
            button.classList.add('bg-gray-100', 'text-gray-700');
          }
        }
        
        // 구직자 표시
        function displayJobSeekers(jobseekers, total) {
          const container = document.getElementById('jobseeker-listings');
          const countEl = document.getElementById('total-count');
          
          if (countEl) countEl.textContent = total || jobseekers.length;
          
          if (jobseekers.length === 0) {
            displayEmpty();
            return;
          }
          
          container.innerHTML = jobseekers.map(js => \`
            <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" 
                 onclick="location.href='/jobseekers/\${js.id}'">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <h3 class="text-xl font-bold text-gray-900">\${js.name || '익명'}</h3>
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">\${js.nationality || '외국인'}</span>
                  </div>
                  <p class="text-gray-700 mb-3">\${js.major || '전공 미기재'} | \${js.experience_years ? js.experience_years + '년 경력' : '신입'}</p>
                  <div class="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                    <span><i class="fas fa-map-marker-alt mr-1"></i>\${js.preferred_location || '지역 무관'}</span>
                    <span><i class="fas fa-language mr-1"></i>한국어 \${js.korean_level || '초급'}</span>
                    <span><i class="fas fa-id-card mr-1"></i>\${js.visa_status || '비자 미기재'}</span>
                  </div>
                </div>
                <button 
                  onclick="event.stopPropagation(); location.href='/jobseekers/\${js.id}'" 
                  class="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  자세히 보기
                </button>
              </div>
            </div>
          \`).join('');
        }
        
        // 빈 상태 표시
        function displayEmpty() {
          const container = document.getElementById('jobseeker-listings');
          const countEl = document.getElementById('total-count');
          if (countEl) countEl.textContent = '0';
          
          container.innerHTML = \`
            <div class="text-center py-12 bg-white rounded-lg">
              <i class="fas fa-user-tie text-5xl text-gray-400 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">구직자가 없습니다</h3>
              <p class="text-gray-600">다른 검색 조건으로 시도해보세요</p>
            </div>
          \`;
        }
        
        // 에러 상태 표시
        function displayError() {
          const container = document.getElementById('jobseeker-listings');
          container.innerHTML = \`
            <div class="text-center py-12 bg-white rounded-lg">
              <i class="fas fa-exclamation-circle text-5xl text-red-400 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
              <p class="text-gray-600 mb-4">잠시 후 다시 시도해주세요</p>
              <button onclick="loadJobSeekers()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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
        window.loadJobSeekers = loadJobSeekers;
        window.applyFilters = applyFilters;
        window.clearFilters = clearFilters;
        window.toggleAdvancedFilters = toggleAdvancedFilters;
        
        // ==================== 끝: 구직정보 페이지 JavaScript ====================
      `}}></script>
    </div>
  )
}

// Middleware: optionalAuth
