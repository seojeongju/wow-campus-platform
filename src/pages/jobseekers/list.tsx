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
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/jpeg;base64,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" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>
          
          {/* Desktop Navigation Menu */}
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 통합 네비게이션 메뉴 */}
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              <i class="fas fa-briefcase mr-1"></i>구인정보
            </a>
            <a href="/jobseekers" class="text-blue-600 font-medium">
              <i class="fas fa-user-tie mr-1"></i>구직정보
            </a>
            <a href="/matching" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              <i class="fas fa-magic mr-1"></i>AI스마트매칭
            </a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              <i class="fas fa-headset mr-1"></i>고객지원
            </a>
          </div>
          
          <div class="flex items-center space-x-3">
            {/* Auth Buttons */}
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
            <a href="/jobs" class="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              <i class="fas fa-briefcase mr-2"></i>구인정보
            </a>
            <a href="/jobseekers" class="block py-2 px-4 text-blue-600 bg-blue-50 rounded-lg font-medium">
              <i class="fas fa-user-tie mr-2"></i>구직정보
            </a>
            <a href="/matching" class="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              <i class="fas fa-magic mr-2"></i>AI스마트매칭
            </a>
            <a href="/support" class="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              <i class="fas fa-headset mr-2"></i>고객지원
            </a>
            <div class="border-t border-gray-200 pt-3 mt-3" id="mobile-auth-buttons">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
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
              admin: '/dashboard/admin'
            };
            
            const colors = userTypeColors[user.user_type] || userTypeColors.jobseeker;
            const dashboardLink = dashboardLinks[user.user_type] || '/';
            
            authButtons.innerHTML = \`
              <div class="flex items-center space-x-2 \${colors.bg} \${colors.border} px-3 py-2 rounded-lg">
                <i class="fas fa-user \${colors.icon}"></i>
                <span class="\${colors.text} font-medium">\${user.name}님</span>
              </div>
              <a href="\${dashboardLink}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-tachometer-alt mr-1"></i>내 대시보드
              </a>
              <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                <i class="fas fa-sign-out-alt mr-1"></i>로그아웃
              </button>
            \`;
          } else {
            authButtons.innerHTML = \`
              <button onclick="location.href='/?action=login&redirect=/jobseekers'" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                <i class="fas fa-sign-in-alt mr-1"></i>로그인
              </button>
              <button onclick="location.href='/?action=signup&redirect=/jobseekers'" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-user-plus mr-1"></i>회원가입
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
              admin: '/dashboard/admin'
            };
            
            const colorClass = userTypeColors[user.user_type] || userTypeColors.jobseeker;
            const dashboardLink = dashboardLinks[user.user_type] || '/';
            
            mobileAuthButtons.innerHTML = \`
              <div class="py-2 px-4 \${colorClass} rounded-lg mb-2">
                <i class="fas fa-user mr-2"></i>\${user.name}님
              </div>
              <a href="\${dashboardLink}" class="block py-2 px-4 bg-blue-600 text-white rounded-lg text-center mb-2">
                <i class="fas fa-tachometer-alt mr-2"></i>내 대시보드
              </a>
              <button onclick="handleLogout()" class="w-full py-2 px-4 text-red-600 border border-red-600 rounded-lg">
                <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
              </button>
            \`;
          } else {
            mobileAuthButtons.innerHTML = \`
              <a href="/?action=login&redirect=/jobseekers" class="block py-2 px-4 text-blue-600 border border-blue-600 rounded-lg text-center mb-2">
                <i class="fas fa-sign-in-alt mr-2"></i>로그인
              </a>
              <a href="/?action=signup&redirect=/jobseekers" class="block py-2 px-4 bg-blue-600 text-white rounded-lg text-center">
                <i class="fas fa-user-plus mr-2"></i>회원가입
              </a>
            \`;
          }
        }
        
        // 페이지 로드 시 실행
        window.addEventListener('load', () => {
          console.log('✅ 구직정보 페이지 로드됨');
          
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
                <button onclick="location.href='/?action=login&redirect=/jobseekers'" class="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center">
                  <i class="fas fa-sign-in-alt mr-2"></i>로그인하기
                </button>
                <button onclick="location.href='/?action=signup&redirect=/jobseekers'" class="block w-full px-6 py-3 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-center">
                  <i class="fas fa-user-plus mr-2"></i>회원가입하기
                </button>
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
