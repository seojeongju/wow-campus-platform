// WOW-CAMPUS Work Platform Frontend JavaScript

// API 기본 설정
const API_BASE_URL = '/api';
let authToken = localStorage.getItem('wowcampus_token');

// Axios 기본 설정
if (axios) {
  axios.defaults.baseURL = API_BASE_URL;
  
  // Request interceptor - 모든 요청에 토큰 추가
  axios.interceptors.request.use((config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });
  
  // Response interceptor - 토큰 만료 처리
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('wowcampus_token');
        authToken = null;
        showNotification('세션이 만료되었습니다. 다시 로그인해주세요.', 'warning');
      }
      return Promise.reject(error);
    }
  );
}

// 유틸리티 함수들
// Toast 시스템 사용 (toast.js에서 로드됨)
function showNotification(message, type = 'info') {
  // 새로운 Toast 시스템으로 교체
  if (window.toast) {
    window.toast[type](message);
  } else {
    // Toast 시스템이 로드되지 않은 경우 fallback
    console.warn('Toast system not loaded, using console:', message);
    if (type === 'error') {
      console.error(message);
    } else {
      console.log(`[${type.toUpperCase()}]`, message);
    }
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount, currency = 'KRW') {
  if (!amount) return '협의';
  
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  
  return formatDate(dateString);
}

// API 래퍼 함수들
const API = {
  // 인증 관련
  auth: {
    async register(userData) {
      try {
        const response = await axios.post('/api/auth/register', userData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    
    async login(credentials) {
      try {
        const response = await axios.post('/api/auth/login', credentials);
        console.log('로그인 API 응답:', response.data);
        
        if (response.data.success && response.data.token) {
          authToken = response.data.token;
          localStorage.setItem('wowcampus_token', authToken);
          
          // 사용자 정보도 localStorage에 저장
          if (response.data.user) {
            localStorage.setItem('wowcampus_user', JSON.stringify(response.data.user));
          }
          
          console.log('토큰 저장 완료:', authToken);
        }
        return response.data;
      } catch (error) {
        console.error('로그인 에러:', error);
        throw error.response?.data || error;
      }
    },
    
    async logout() {
      try {
        await axios.post('/api/auth/logout');
      } catch (error) {
        console.log('서버 로그아웃 호출 실패 (정상):', error.message);
      } finally {
        // 로컬 데이터 정리 - 실패 여부와 관계없이 실행
        authToken = null;
        localStorage.removeItem('wowcampus_token');
        localStorage.removeItem('wowcampus_user');
        window.currentUser = null;
        console.log('로컬 토큰 및 사용자 정보 정리 완료');
        return { success: true };
      }
    },
    
    async getProfile() {
      try {
        const response = await axios.get('/api/auth/profile');
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    }
  },
  
  // 구인공고 관련
  jobs: {
    async getAll(params = {}) {
      try {
        const response = await axios.get('/jobs', { params });
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    
    async getById(id) {
      try {
        const response = await axios.get(`/jobs/${id}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    }
  },
  
  // 구직자 관련
  jobseekers: {
    async getAll(params = {}) {
      try {
        const response = await axios.get('/jobseekers', { params });
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    }
  }
};

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded - Initializing WOW-CAMPUS');
  
  // 현재 페이지에 따른 초기화
  const currentPath = window.location.pathname;
  
  if (currentPath === '/' || currentPath === '/home') {
    // 메인 페이지 또는 홈 페이지
    if (currentPath === '/') {
      loadMainPageData();
    }
    restoreLoginState();
  } else if (currentPath === '/jobs') {
    // 구인정보 페이지
    loadJobsPage();
    restoreLoginState(); // 각 페이지에서도 로그인 상태 확인하여 메뉴 제어
    // 페이지 로드 시 기본 구인정보 목록 표시
    setTimeout(() => {
      loadJobListings('');
    }, 500);
  } else if (currentPath === '/jobseekers') {
    // 구직정보 페이지
    loadJobSeekersPage();
    restoreLoginState();
    // 페이지 로드 시 기본 구직정보 목록 표시
    setTimeout(() => {
      loadJobSeekerListings('');
    }, 500);
  } else if (currentPath === '/study') {
    // 유학정보 페이지
    loadStudyPage();
    restoreLoginState();
  } else if (currentPath === '/agents') {
    // 에이전트 대시보드 페이지
    loadAgentsPage();
    checkLoginStatus();
  } else if (currentPath === '/statistics') {
    // 통계 페이지
    loadStatisticsPage();
    checkLoginStatus();
  } else if (currentPath === '/dashboard') {
    // 구직자 대시보드 페이지
    checkLoginStatus();
    loadUserProfile();
  } else {
    // 기타 모든 페이지 (매칭, 지원, FAQ 등)
    restoreLoginState();
  }
  
  // 전역 이벤트 리스너
  setupGlobalEventListeners();
  
  // 모바일 메뉴 초기화
  initMobileMenu();
});

// 메인 페이지 데이터 로드
async function loadMainPageData() {
  console.log('app.js: 메인페이지 데이터 로딩 시작...');
  
  try {
    // 구인정보 로드
    console.log('Loading job listings... Page: 1');
    console.log('구인정보 API 호출: /api/jobs?page=1&limit=10');
    
    const jobsResponse = await fetch('/api/jobs?page=1&limit=10');
    const jobsData = await jobsResponse.json();
    
    console.log('Jobs data received: ' + (jobsData.success ? jobsData.data?.length || 0 : 0) + ' items, Page: 1');
    console.log('받은 구인정보 데이터: ', jobsData.data || []);
    
    console.log('app.js: 구인정보 API 응답:', jobsData);
    updateJobCount(jobsData.success ? (jobsData.total || jobsData.data?.length || 0) : 0);
    console.log('app.js: 구인정보 카운트 업데이트:', jobsData.success ? (jobsData.total || jobsData.data?.length || 0) : 0);
    
    // 최신 구인정보 카드 업데이트
    updateLatestJobsCard(jobsData.success ? (jobsData.total || jobsData.data?.length || 0) : 0);
    
    // 구직자 정보 로드
    console.log('Loading job seekers... Page: 1');
    console.log('구직자 API 호출: /api/jobseekers?page=1&limit=10');
    
    const jobSeekersResponse = await fetch('/api/jobseekers?page=1&limit=10');
    const jobSeekersData = await jobSeekersResponse.json();
    
    console.log('JobSeekers data received: ' + (jobSeekersData.success ? (jobSeekersData.total || jobSeekersData.data?.length || 0) : 0) + ' items, Page: 1');
    console.log('받은 구직자 데이터: ', jobSeekersData.data?.slice(0, 2) || []);
    
    console.log('app.js: 구직자 API 응답:', jobSeekersData);
    console.log('Debug - jobSeekersData.success:', jobSeekersData.success);
    console.log('Debug - jobSeekersData.total:', jobSeekersData.total);
    console.log('Debug - jobSeekersData.data.length:', jobSeekersData.data?.length);
    const jobSeekersCount = jobSeekersData.success ? (jobSeekersData.total || jobSeekersData.data?.length || 0) : 0;
    console.log('Debug - final count:', jobSeekersCount);
    updateJobSeekerCount(jobSeekersCount);
    console.log('app.js: 구직자 카운트 업데이트:', jobSeekersCount);
    
    // 최신 구직정보 카드 업데이트
    updateLatestJobSeekersCard(jobSeekersCount);
    
    console.log('통계 로딩 시작...');
    
    console.log('app.js: 메인페이지 데이터 로딩 완료');
  } catch (error) {
    console.error('메인페이지 데이터 로딩 오류:', error);
  }
}

// 구인정보 카운트 업데이트
function updateJobCount(count) {
  const jobCountElements = document.querySelectorAll('[data-stat="jobs"]');
  jobCountElements.forEach(el => {
    animateCounter(el, count);
  });
}

// 구직자 카운트 업데이트
function updateJobSeekerCount(count) {
  const jobSeekerCountElements = document.querySelectorAll('[data-stat="jobseekers"]');
  jobSeekerCountElements.forEach(el => {
    animateCounter(el, count);
  });
}

// 카운터 애니메이션
function animateCounter(element, targetValue) {
  const duration = 1000;
  const start = 0;
  const startTime = performance.now();
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentValue = Math.floor(progress * targetValue);
    element.textContent = currentValue.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }
  
  requestAnimationFrame(updateCounter);
}

// 최신 구인정보 카드 업데이트
function updateLatestJobsCard(count) {
  const latestJobsSection = document.querySelector('[data-section="latest-jobs"]');
  if (latestJobsSection) {
    const countBadge = latestJobsSection.querySelector('.bg-blue-600');
    if (countBadge) {
      countBadge.textContent = count + '건';
    }
  }
}

// 최신 구직정보 카드 업데이트
function updateLatestJobSeekersCard(count) {
  const latestJobSeekersSection = document.querySelector('[data-section="latest-jobseekers"]');
  if (latestJobSeekersSection) {
    const countBadge = latestJobSeekersSection.querySelector('.bg-green-600');
    if (countBadge) {
      countBadge.textContent = count + '건';
    }
  }
}

// 로그인 상태 확인
async function checkLoginStatus() {
  console.log('checkLoginStatus: {token: ' + !!authToken + ', user: {}, hasId: ' + !!authToken + '}');
  
  if (authToken) {
    try {
      // 토큰으로 사용자 정보 가져오기
      const response = await API.auth.getProfile();
      console.log('프로필 API 응답:', response);
      
      if (response.success && response.user) {
        console.log('로그인 상태 - UI 업데이트');
        updateLoginUI(response.user);
      } else {
        console.log('토큰이 유효하지 않음 - 로그아웃 처리');
        authToken = null;
        localStorage.removeItem('wowcampus_token');
        updateLogoutUI();
      }
    } catch (error) {
      console.log('프로필 가져오기 실패:', error);
      authToken = null;
      localStorage.removeItem('wowcampus_token');
      updateLogoutUI();
    }
  } else {
    console.log('로그아웃 상태 - UI 업데이트');
    updateLogoutUI();
  }
}

// 로그인 상태 UI 업데이트
// 페이지 로드 시 로그인 상태 복원
function restoreLoginState() {
  console.log('🔄 restoreLoginState 함수 시작');
  const token = localStorage.getItem('wowcampus_token');
  const userStr = localStorage.getItem('wowcampus_user');
  
  console.log('토큰 존재:', !!token);
  console.log('사용자 정보 존재:', !!userStr);
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('✅ 사용자 정보 파싱 성공:', user);
      authToken = token;
      window.currentUser = user;
      
      console.log('🎨 updateAuthUI 호출 전');
      updateAuthUI(user); // 새로운 통합 함수 사용
      console.log('🎨 updateAuthUI 호출 후');
      
      loadServiceMenus(); // 서비스 메뉴 로드
      console.log('✅ 로그인 상태 복원 완료:', user.name);
    } catch (error) {
      console.error('❌ 로그인 상태 복원 실패:', error);
      console.error('에러 스택:', error.stack);
      // 손상된 데이터 정리
      localStorage.removeItem('wowcampus_token');
      localStorage.removeItem('wowcampus_user');
      updateAuthUI(null); // 로그아웃 상태로 UI 업데이트
      loadServiceMenus(); // 서비스 메뉴 로드
    }
  } else {
    console.log('ℹ️ 토큰 없음 - 로그아웃 상태로 UI 업데이트');
    // 토큰이 없으면 로그아웃 상태 UI
    updateAuthUI(null);
    loadServiceMenus(); // 서비스 메뉴 로드
  }
}

// 서비스 메뉴 로드 (데스크탑 드롭다운 + 모바일 메뉴)
function loadServiceMenus() {
  const serviceMenuItems = [
    { href: '/jobs', icon: 'fa-briefcase', text: '구인정보', color: 'blue' },
    { href: '/jobseekers', icon: 'fa-users', text: '구직정보', color: 'green' },
    { href: '/study', icon: 'fa-graduation-cap', text: '유학정보', color: 'purple' }
  ];
  
  // 데스크탑 드롭다운 메뉴
  const desktopContainer = document.getElementById('service-dropdown-container');
  if (desktopContainer) {
    desktopContainer.innerHTML = serviceMenuItems.map(item => 
      `<a href="${item.href}" class="block px-4 py-3 text-sm text-gray-700 hover:bg-${item.color}-50 hover:text-${item.color}-600 transition-colors">
        <i class="fas ${item.icon} mr-2 text-${item.color}-500"></i>${item.text}
      </a>`
    ).join('');
  }
  
  // 모바일 메뉴
  const mobileContainer = document.getElementById('mobile-service-menu-container');
  if (mobileContainer) {
    mobileContainer.innerHTML = serviceMenuItems.map(item => 
      `<a href="${item.href}" class="block py-2 px-2 text-gray-600 hover:text-${item.color}-600 hover:bg-${item.color}-50 rounded transition-colors">
        <i class="fas ${item.icon} mr-2 text-${item.color}-500"></i>${item.text}
      </a>`
    ).join('');
  }
}

// 로그아웃 상태 UI 업데이트 
function updateLogoutUI() {
  console.log('로그아웃 UI 업데이트');
  
  // ID를 사용해 정확한 auth 버튼 컨테이너 선택
  const authButtons = document.getElementById('auth-buttons-container');
  
  if (authButtons) {
    authButtons.innerHTML = `
      <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
        로그인
      </button>
      <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        회원가입
      </button>
      <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
        <i class="fas fa-bars text-xl"></i>
      </button>
    `;
    
    // 모바일 메뉴 재초기화
    initMobileMenu();
  }
}

// 로그아웃 처리
// 첫 번째 handleLogout 함수 제거됨 - 중복 제거

// 모바일 메뉴 초기화
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    // 기존 이벤트 리스너 제거를 위해 onclick 방식 사용
    mobileMenuBtn.onclick = function() {
      console.log('📱 모바일 메뉴 버튼 클릭');
      mobileMenu.classList.toggle('hidden');
      
      // 아이콘 변경
      const icon = this.querySelector('i');
      if (mobileMenu.classList.contains('hidden')) {
        icon.className = 'fas fa-bars text-2xl';
        console.log('메뉴 닫힘');
      } else {
        icon.className = 'fas fa-times text-2xl';
        console.log('메뉴 열림');
      }
    };
  }
}

// 구인정보 페이지 로드
async function loadJobsPage() {
  console.log('Loading jobs page...');
  
  try {
    const response = await fetch('/api/jobs?page=1&limit=20');
    console.log('Jobs API response status:', response.status);
    
    const data = await response.json();
    console.log('Jobs API response data:', data);
    
    if (data.success) {
      console.log('Jobs data.data:', data.data);
      console.log('Jobs data.data length:', data.data.length);
      displayJobListings(data.data);
    } else {
      console.error('API returned success=false:', data);
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    showNotification('구인정보를 불러오는 중 오류가 발생했습니다.', 'error');
  }
}

// 구인정보 목록 표시
function displayJobListings(jobs) {
  console.log('displayJobListings called with jobs:', jobs);
  console.log('jobs length:', jobs ? jobs.length : 'undefined');
  
  const container = document.getElementById('job-listings');
  console.log('Container found:', !!container);
  if (!container) {
    console.error('job-listings container not found!');
    return;
  }
  
  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-briefcase text-gray-300 text-6xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">등록된 구인정보가 없습니다</h3>
        <p class="text-gray-500">새로운 구인정보가 등록되면 알려드리겠습니다.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = jobs.map(job => `
    <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">${job.title}</h3>
          <p class="text-blue-600 font-medium">${job.company_name || '회사명'}</p>
        </div>
        <div class="text-right">
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            ${job.employment_type || '정규직'}
          </span>
        </div>
      </div>
      
      <div class="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
        <div class="flex items-center">
          <i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>
          ${job.location || '서울'}
        </div>
        <div class="flex items-center">
          <i class="fas fa-won-sign mr-2 text-gray-400"></i>
          ${job.salary || '협의'}
        </div>
        <div class="flex items-center">
          <i class="fas fa-clock mr-2 text-gray-400"></i>
          ${formatDate(job.created_at)}
        </div>
      </div>
      
      <p class="text-gray-700 mb-4 line-clamp-2">
        ${job.description || '구인정보 상세 내용입니다.'}
      </p>
      
      <div class="flex justify-between items-center">
        <div class="flex flex-wrap gap-2">
          ${(job.required_skills || '').split(',').slice(0, 3).map(skill => 
            skill.trim() ? `<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">${skill.trim()}</span>` : ''
          ).join('')}
        </div>
        <button onclick="viewJobDetail(${job.id})" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          자세히 보기
        </button>
      </div>
    </div>
  `).join('');
}

// 유학정보 페이지 로드
function loadStudyPage() {
  console.log('Loading study page...');
  // 유학정보 페이지 관련 로직
}

// 에이전트 페이지 로드
async function loadAgentsPage() {
  console.log('Loading agents page...');
  
  try {
    const response = await fetch('/api/jobseekers?page=1&limit=20');
    const data = await response.json();
    
    if (data.success) {
      displayJobSeekersList(data.jobseekers);
    }
  } catch (error) {
    console.error('Error loading job seekers:', error);
    showNotification('구직자 정보를 불러오는 중 오류가 발생했습니다.', 'error');
  }
}

// 구직자 목록 표시
function displayJobSeekersList(jobSeekers) {
  const container = document.getElementById('jobseekers-list');
  if (!container) return;
  
  if (jobSeekers.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-users text-gray-300 text-4xl mb-4"></i>
        <p class="text-gray-500">등록된 구직자가 없습니다.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = jobSeekers.map(seeker => `
    <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 mb-2">${seeker.name}</h4>
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">국적:</span> ${seeker.nationality || '미정'}
            </div>
            <div>
              <span class="font-medium">희망직종:</span> ${seeker.desired_position || '미정'}
            </div>
            <div>
              <span class="font-medium">경력:</span> ${seeker.experience_years || '0'}년
            </div>
            <div>
              <span class="font-medium">언어:</span> ${seeker.languages || '미정'}
            </div>
          </div>
        </div>
        <div class="ml-4">
          <button onclick="viewJobSeekerDetail(${seeker.id})" class="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
            상세보기
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// 통계 페이지 로드
async function loadStatisticsPage() {
  console.log('Loading statistics page...');
  
  try {
    const [jobsResponse, jobSeekersResponse] = await Promise.all([
      fetch('/api/jobs?page=1&limit=1'),
      fetch('/api/jobseekers?page=1&limit=1')
    ]);
    
    const jobsData = await jobsResponse.json();
    const jobSeekersData = await jobSeekersResponse.json();
    
    // 통계 업데이트
    updateStatistics({
      jobs: jobsData.success ? jobsData.total || jobsData.jobs?.length || 0 : 0,
      jobseekers: jobSeekersData.success ? jobSeekersData.pagination?.total || jobSeekersData.jobseekers?.length || 0 : 0,
      matches: 7,  // 임시값
      companies: 12  // 임시값
    });
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

// 통계 업데이트
function updateStatistics(stats) {
  const elements = {
    jobs: document.querySelector('[data-stat="jobs"]'),
    jobseekers: document.querySelector('[data-stat="jobseekers"]'), 
    matches: document.querySelector('[data-stat="matches"]'),
    companies: document.querySelector('[data-stat="companies"]')
  };
  
  Object.keys(elements).forEach(key => {
    if (elements[key]) {
      animateCounter(elements[key], stats[key] || 0);
    }
  });
}

// 구인정보 상세 보기
function viewJobDetail(jobId) {
  console.log('Viewing job detail:', jobId);
  showNotification('구인정보 상세보기 기능은 준비 중입니다.', 'info');
}

// 구직자 상세 보기
function viewJobSeekerDetail(seekerId) {
  console.log('Viewing job seeker detail:', seekerId);
  showNotification('구직자 상세보기 기능은 준비 중입니다.', 'info');
}

// 전역 이벤트 리스너 설정
function setupGlobalEventListeners() {
  // 모바일 메뉴 외부 클릭시 닫기
  document.addEventListener('click', (e) => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenu && mobileMenuBtn && 
        !mobileMenu.contains(e.target) && 
        !mobileMenuBtn.contains(e.target)) {
      mobileMenu.classList.add('hidden');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) icon.className = 'fas fa-bars text-xl';
    }
  });
  
  // 로그인/회원가입 버튼 이벤트
  document.addEventListener('click', (e) => {
    if (e.target.textContent && e.target.textContent.includes('로그인')) {
      showLoginModal();
    }
    if (e.target.textContent && e.target.textContent.includes('회원가입')) {
      showSignupModal();
    }
  });
}

// 로그인 모달 표시
function showLoginModal() {
  const modalId = 'loginModal_' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">로그인</h2>
        <button onclick="document.getElementById('${modalId}').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="loginForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input type="email" name="email" id="login-email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이메일을 입력하세요">
          <div id="login-email-message" class="mt-1 text-sm" style="display: none;"></div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
          <input type="password" name="password" id="login-password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 입력하세요">
          <div id="login-password-message" class="mt-1 text-sm" style="display: none;"></div>
        </div>
        
        <div class="flex space-x-3">
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
            취소
          </button>
          <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            로그인
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 모달 외부 클릭 시 닫기
  modal.addEventListener('click', function() {
    modal.remove();
  });
  
  // ESC 키로 모달 닫기
  const handleKeyDown = function(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  
  // 로그인 폼 실시간 검증 설정
  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  const loginEmailMessage = document.getElementById('login-email-message');
  const loginPasswordMessage = document.getElementById('login-password-message');
  const loginSubmitButton = modal.querySelector('button[type="submit"]');
  
  function validateLoginEmail() {
    const email = loginEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email.length === 0) {
      showValidationMessage(loginEmailMessage, loginEmailInput, '이메일을 입력해주세요.', 'error');
      return false;
    } else if (!emailRegex.test(email)) {
      showValidationMessage(loginEmailMessage, loginEmailInput, '올바른 이메일 형식을 입력해주세요.', 'error');
      return false;
    } else {
      loginEmailMessage.style.display = 'none';
      resetInputStyle(loginEmailInput);
      return true;
    }
  }
  
  function validateLoginPassword() {
    const password = loginPasswordInput.value;
    
    if (password.length === 0) {
      showValidationMessage(loginPasswordMessage, loginPasswordInput, '비밀번호를 입력해주세요.', 'error');
      return false;
    } else {
      loginPasswordMessage.style.display = 'none';
      resetInputStyle(loginPasswordInput);
      return true;
    }
  }
  
  function validateLoginForm() {
    const isEmailValid = validateLoginEmail();
    const isPasswordValid = validateLoginPassword();
    const isFormValid = isEmailValid && isPasswordValid;
    
    loginSubmitButton.disabled = !isFormValid;
    return isFormValid;
  }
  
  // 로그인 폼 이벤트 리스너
  loginEmailInput.addEventListener('blur', validateLoginEmail);
  loginEmailInput.addEventListener('input', validateLoginForm);
  loginPasswordInput.addEventListener('blur', validateLoginPassword);
  loginPasswordInput.addEventListener('input', validateLoginForm);
  
  // 폼 제출 이벤트
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    if (!validateLoginForm()) {
      e.preventDefault();
      showNotification('입력 정보를 확인해주세요.', 'error');
      return false;
    }
    handleLogin(e);
  });
}

// 회원가입 모달 표시
function showSignupModal() {
  const modalId = 'signupModal_' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
        <button onclick="document.getElementById('${modalId}').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="signupForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
          <select name="user_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
            <option value="">선택해주세요</option>
            <option value="company">구인기업</option>
            <option value="jobseeker">구직자</option>
            <option value="agent">에이전트</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <input type="text" name="name" id="signup-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이름을 입력해주세요">
          <div id="name-validation-message" class="mt-1 text-sm" style="display: none;"></div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input type="email" name="email" id="signup-email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="example@email.com">
          <div id="email-validation-message" class="mt-1 text-sm" style="display: none;"></div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">전화번호 (선택)</label>
          <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">지역</label>
          <select name="location" id="signup-location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
            <option value="">지역을 선택해주세요</option>
            <option value="서울">서울</option>
            <option value="경기도">경기도</option>
            <option value="강원도">강원도</option>
            <option value="충청도">충청도</option>
            <option value="경상도">경상도</option>
            <option value="전라도">전라도</option>
            <option value="제주도">제주도</option>
          </select>
          <div id="location-validation-message" class="mt-1 text-sm" style="display: none;"></div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
          <input type="password" name="password" id="signup-password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required minlength="6" placeholder="최소 6자 이상">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
          <input type="password" name="password_confirm" id="signup-password-confirm" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 다시 입력하세요">
          <div id="password-match-message" class="mt-1 text-sm" style="display: none;"></div>
        </div>
        
        <div class="flex space-x-3">
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
            취소
          </button>
          <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            회원가입
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 모달 외부 클릭 시 닫기
  modal.addEventListener('click', function() {
    modal.remove();
  });
  
  // ESC 키로 모달 닫기
  const handleKeyDown = function(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  
  // 실시간 폼 검증 설정
  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const locationSelect = document.getElementById('signup-location');
  const passwordInput = document.getElementById('signup-password');
  const passwordConfirmInput = document.getElementById('signup-password-confirm');
  const submitButton = modal.querySelector('button[type="submit"]');
  
  // 검증 메시지 요소들
  const nameMessage = document.getElementById('name-validation-message');
  const emailMessage = document.getElementById('email-validation-message');
  const locationMessage = document.getElementById('location-validation-message');
  const passwordMessage = document.getElementById('password-match-message');
  
  // 📝 실시간 유효성 검증 함수들
  function validateName() {
    const name = nameInput.value.trim();
    let isValid = true;
    
    if (name.length === 0) {
      showValidationMessage(nameMessage, nameInput, '이름을 입력해주세요.', 'error');
      isValid = false;
    } else if (name.length > 100) {
      showValidationMessage(nameMessage, nameInput, '이름은 100자 이하여야 합니다.', 'error');
      isValid = false;
    } else {
      showValidationMessage(nameMessage, nameInput, '✓ 사용 가능한 이름입니다.', 'success');
    }
    
    return isValid;
  }
  
  function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;
    
    if (email.length === 0) {
      showValidationMessage(emailMessage, emailInput, '이메일을 입력해주세요.', 'error');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showValidationMessage(emailMessage, emailInput, '올바른 이메일 형식을 입력해주세요.', 'error');
      isValid = false;
    } else {
      showValidationMessage(emailMessage, emailInput, '✓ 사용 가능한 이메일 형식입니다.', 'success');
    }
    
    return isValid;
  }
  
  function validateLocation() {
    const location = locationSelect.value;
    let isValid = true;
    
    if (!location) {
      showValidationMessage(locationMessage, locationSelect, '지역을 선택해주세요.', 'error');
      isValid = false;
    } else {
      showValidationMessage(locationMessage, locationSelect, '✓ 지역이 선택되었습니다.', 'success');
    }
    
    return isValid;
  }
  
  function validatePassword() {
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    let isValid = true;
    
    if (!passwordConfirm) {
      passwordMessage.style.display = 'none';
      resetInputStyle(passwordConfirmInput);
      return true;
    }
    
    if (password.length < 6) {
      showValidationMessage(passwordMessage, passwordConfirmInput, '비밀번호는 최소 6자 이상이어야 합니다.', 'error');
      isValid = false;
    } else if (password !== passwordConfirm) {
      showValidationMessage(passwordMessage, passwordConfirmInput, '✗ 비밀번호가 일치하지 않습니다.', 'error');
      isValid = false;
    } else {
      showValidationMessage(passwordMessage, passwordConfirmInput, '✓ 비밀번호가 일치합니다.', 'success');
    }
    
    return isValid;
  }
  
  // 📋 폼 전체 검증
  function validateForm() {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isLocationValid = validateLocation();
    const isPasswordValid = validatePassword();
    
    const isFormValid = isNameValid && isEmailValid && isLocationValid && isPasswordValid;
    submitButton.disabled = !isFormValid;
    
    return isFormValid;
  }
  
  // 🎨 UI 헬퍼 함수들
  function showValidationMessage(messageElement, inputElement, message, type) {
    if (!messageElement || !inputElement) return;
    
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    if (type === 'success') {
      messageElement.className = 'mt-1 text-sm text-green-600';
      inputElement.className = 'w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500';
    } else {
      messageElement.className = 'mt-1 text-sm text-red-600';
      inputElement.className = 'w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500';
    }
  }
  
  function resetInputStyle(inputElement) {
    if (inputElement) {
      inputElement.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    }
  }
  
  // 🎧 이벤트 리스너 등록
  nameInput.addEventListener('blur', validateName);
  nameInput.addEventListener('input', () => {
    if (nameInput.value.length > 0) validateName();
  });
  
  emailInput.addEventListener('blur', validateEmail);
  emailInput.addEventListener('input', () => {
    if (emailInput.value.length > 0) validateEmail();
  });
  
  locationSelect.addEventListener('change', validateLocation);
  
  passwordInput.addEventListener('input', () => {
    if (passwordConfirmInput.value.length > 0) validatePassword();
  });
  
  passwordConfirmInput.addEventListener('input', validatePassword);
  passwordConfirmInput.addEventListener('blur', validatePassword);
  
  // 제출 전 최종 검증
  document.getElementById('signupForm').addEventListener('submit', function(e) {
    if (!validateForm()) {
      e.preventDefault();
      showNotification('입력 정보를 다시 확인해주세요.', 'error');
      return false;
    }
  });
  
  // 폼 제출 이벤트
  document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

// 전역 스코프에 모달 함수들 노출 (HTML onclick에서 접근 가능하도록)
window.showLoginModal = showLoginModal;
window.showSignupModal = showSignupModal;

// 로그인 처리
async function handleLogin(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const credentials = {
    email: formData.get('email'),
    password: formData.get('password')
  };
  
  console.log('로그인 시도:', credentials);
  
  try {
    const response = await API.auth.login(credentials);
    console.log('로그인 API 응답:', response);
    
    if (response.success && response.user) {
      // 모달 먼저 닫기
      const modalElement = event.target.closest('div[id^="loginModal"]');
      if (modalElement) {
        modalElement.remove();
      }
      
      // 환영 메시지 표시
      showNotification(`✨ ${response.user.name}님, 다시 만나서 반가워요!`, 'success');
      
      // UI 즉시 업데이트 - 새로운 통합 함수 사용
      console.log('로그인 성공 - 토큰 저장됨:', authToken);
      console.log('로그인 성공 - 사용자 정보:', response.user);
      updateAuthUI(response.user);
      
      // 메인 페이지라면 데이터 새로고침
      if (window.location.pathname === '/') {
        setTimeout(() => {
          loadMainPageData();
        }, 500);
      }
      
      // 구인정보 상세 페이지라면 페이지 새로고침하여 버튼 업데이트
      if (window.location.pathname.startsWith('/jobs/') && window.loadJobDetail) {
        const jobId = window.location.pathname.split('/').pop();
        setTimeout(() => {
          window.loadJobDetail(jobId);
        }, 500);
      }
      
      // 구직자 상세 페이지라면 페이지 새로고침
      if (window.location.pathname.startsWith('/jobseekers/') && window.loadJobseekerDetail) {
        setTimeout(() => {
          window.loadJobseekerDetail();
        }, 500);
      }
      
    } else {
      console.error('로그인 실패:', response.message);
      showNotification(response.message || '로그인에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    // error가 객체인 경우 더 자세한 정보 추출
    let errorMessage = '로그인 중 오류가 발생했습니다.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    showNotification(errorMessage, 'error');
  }
}

// 회원가입 처리
async function handleSignup(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const password = formData.get('password');
  const passwordConfirm = formData.get('password_confirm');
  
  // 비밀번호 일치 검증
  if (password !== passwordConfirm) {
    showNotification('비밀번호가 일치하지 않습니다.', 'error');
    return;
  }
  
  // 비밀번호 길이 검증
  if (password.length < 6) {
    showNotification('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
    return;
  }
  
  const userData = {
    user_type: formData.get('user_type'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    location: formData.get('location'), // 수정: region -> location (API와 일치)
    password: password,
    confirmPassword: passwordConfirm // 추가: API에서 요구하는 confirmPassword 필드
  };
  
  try {
    console.log('회원가입 시작:', userData);
    const response = await API.auth.register(userData);
    console.log('회원가입 응답:', response);
    
    if (response.success) {
      // 먼저 성공 메시지 표시
      showNotification('🎉 회원가입이 완료되었습니다!', 'success');
      
      // 모달 닫기
      const modalElement = event.target.closest('div[id^="signupModal"]');
      if (modalElement) {
        modalElement.remove();
      }
      
      // 1초 후 자동 로그인 시도
      setTimeout(async () => {
        try {
          showNotification('자동 로그인 중...', 'info');
          console.log('자동 로그인 시도:', userData.email);
          
          const loginResponse = await API.auth.login({
            email: userData.email,
            password: userData.password
          });
          
          console.log('자동 로그인 응답:', loginResponse);
          
          if (loginResponse.success && loginResponse.user) {
            showNotification(`✨ ${loginResponse.user.name}님, 환영합니다!`, 'success');
            updateAuthUI(loginResponse.user);
            
            // 통계 데이터 새로고침 (새 사용자 반영)
            if (window.location.pathname === '/') {
              setTimeout(() => {
                loadMainPageData();
              }, 500);
            }
          } else {
            showNotification('자동 로그인에 실패했습니다. 직접 로그인해주세요.', 'warning');
          }
        } catch (loginError) {
          console.error('자동 로그인 에러:', loginError);
          showNotification('자동 로그인에 실패했습니다. 직접 로그인해주세요.', 'warning');
        }
      }, 1000);
      
    } else {
      showNotification(response.message || '회원가입에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('회원가입 에러:', error);
    showNotification(error.message || '회원가입 중 오류가 발생했습니다.', 'error');
  }
}

// 구직정보 페이지 로드
async function loadJobSeekersPage() {
  console.log('Loading job seekers page...');
  
  try {
    const response = await fetch('/api/jobseekers?page=1&limit=20');
    console.log('Job Seekers API response status:', response.status);
    
    const data = await response.json();
    console.log('Job Seekers API response data:', data);
    
    if (data.success) {
      console.log('Job Seekers data.data:', data.data);
      console.log('Job Seekers data.data length:', data.data.length);
      displayJobSeekersListings(data.data);
    } else {
      console.error('API returned success=false:', data);
    }
  } catch (error) {
    console.error('Error loading job seekers:', error);
    showNotification('구직정보를 불러오는 중 오류가 발생했습니다.', 'error');
  }
}

// 구직자 목록 표시
function displayJobSeekersListings(jobseekers) {
  console.log('displayJobSeekersListings called with jobseekers:', jobseekers);
  console.log('jobseekers length:', jobseekers ? jobseekers.length : 'undefined');
  
  const container = document.getElementById('jobseekers-listings');
  console.log('Job seekers container found:', !!container);
  if (!container) {
    console.error('jobseekers-listings container not found!');
    return;
  }
  
  if (jobseekers.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-user-friends text-gray-300 text-6xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">등록된 구직자가 없습니다</h3>
        <p class="text-gray-500">새로운 구직자가 등록되면 알려드리겠습니다.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = jobseekers.map(jobseeker => `
    <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-gray-400 text-xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-1">${jobseeker.name || '이름 미공개'}</h3>
            <p class="text-green-600 font-medium">${jobseeker.nationality || '국적 미공개'}</p>
            <p class="text-gray-600 text-sm">${jobseeker.age || '연령 미공개'}세 • ${jobseeker.gender === 'male' ? '남성' : jobseeker.gender === 'female' ? '여성' : '성별 미공개'}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            ${jobseeker.experience_level === 'entry' ? '신입' : jobseeker.experience_level === 'junior' ? '주니어' : jobseeker.experience_level === 'mid' ? '중급' : jobseeker.experience_level === 'senior' ? '시니어' : '경력 미공개'}
          </span>
        </div>
      </div>
      
      <div class="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
        <div class="flex items-center">
          <i class="fas fa-graduation-cap mr-2 text-gray-400"></i>
          ${jobseeker.education || '학력 미공개'}
        </div>
        <div class="flex items-center">
          <i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>
          ${jobseeker.location || '희망지역 미공개'}
        </div>
        <div class="flex items-center">
          <i class="fas fa-language mr-2 text-gray-400"></i>
          ${jobseeker.korean_level || '한국어 수준 미공개'}
        </div>
      </div>
      
      <div class="mb-4">
        <p class="text-gray-700 line-clamp-2">${jobseeker.bio || '자기소개가 등록되지 않았습니다.'}</p>
      </div>
      
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          <i class="fas fa-clock mr-1"></i>
          등록일: ${new Date(jobseeker.created_at).toLocaleDateString('ko-KR')}
        </div>
        <div class="space-x-2">
          <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
            <i class="fas fa-eye mr-1"></i>프로필 보기
          </button>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <i class="fas fa-envelope mr-1"></i>연락하기
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// 네비게이션 메뉴 업데이트 (사용자 타입에 따른 메뉴 제어)
function updateNavigationMenus(user) {
  // 에이전트 및 통계 메뉴 요소들 찾기
  const agentLinks = document.querySelectorAll('a[href="/agents"]');
  const statisticsLinks = document.querySelectorAll('a[href="/statistics"]');
  
  // 구직자나 구인기업인 경우 에이전트 관련 메뉴 숨김
  if (user && (user.user_type === 'jobseeker' || user.user_type === 'employer')) {
    agentLinks.forEach(link => {
      link.style.display = 'none';
    });
    statisticsLinks.forEach(link => {
      link.style.display = 'none';
    });
  } else {
    // 에이전트나 관리자인 경우 메뉴 표시
    agentLinks.forEach(link => {
      link.style.display = '';
    });
    statisticsLinks.forEach(link => {
      link.style.display = '';
    });
  }
}

// 🎯 통합된 인증 UI 업데이트 함수 (기존 함수들을 대체)
function updateAuthUI(user = null) {
  console.log('🎨 updateAuthUI 호출됨:', user ? `${user.name} (${user.user_type})` : '로그아웃 상태');
  
  try {
    // 인증 버튼 컨테이너 찾기
    const authButtons = document.getElementById('auth-buttons-container');
    if (!authButtons) {
      console.warn('⚠️ auth-buttons-container를 찾을 수 없습니다');
      return;
    }
    console.log('✅ auth-buttons-container 찾음');
    
    if (user) {
      // 🔐 로그인 상태 UI 업데이트
      console.log(`🔐 ${user.name}님 로그인 상태로 UI 업데이트 시작`);
      
      // 네비게이션 메뉴 업데이트
      console.log('📋 updateNavigationMenus 호출 시작');
      try {
        updateNavigationMenus(user);
        console.log('✅ updateNavigationMenus 완료');
      } catch (navError) {
        console.error('❌ updateNavigationMenus 에러:', navError);
      }
    
    // 사용자 타입에 따른 대시보드 링크 설정
    const dashboardConfig = {
      jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-user-tie', name: '내 대시보드' },
      company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building', name: '기업 대시보드' },
      agent: { link: '/agents', color: 'blue', icon: 'fa-handshake', name: '에이전트 대시보드' },
      admin: { link: '/admin', color: 'red', icon: 'fa-chart-line', name: '관리자 대시보드' }
    };
    
    const config = dashboardConfig[user.user_type] || { 
      link: '/', color: 'gray', icon: 'fa-home', name: '메인 페이지' 
    };
    
    // 사용자 타입에 따른 배지 색상
    const userTypeColors = {
      jobseeker: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
      company: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
      agent: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
      admin: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' }
    };
    
    const userColors = userTypeColors[user.user_type] || userTypeColors.jobseeker;
    
    // 로그인 상태 UI 렌더링 (Desktop)
    authButtons.innerHTML = `
      <div class="flex items-center space-x-2 ${userColors.bg} ${userColors.border} px-3 py-2 rounded-lg">
        <i class="fas fa-user ${userColors.icon}"></i>
        <span class="${userColors.text} font-medium">${user.name}님</span>
        <span class="text-xs ${userColors.text} opacity-75">(${getUserTypeLabel(user.user_type)})</span>
      </div>
      <a href="${config.link}" class="px-4 py-2 text-${config.color}-600 border border-${config.color}-600 rounded-lg hover:bg-${config.color}-50 transition-colors font-medium" title="${config.name}">
        <i class="fas ${config.icon} mr-1"></i>대시보드
      </a>
      <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium" title="로그아웃">
        <i class="fas fa-sign-out-alt mr-1"></i>로그아웃
      </button>
    `;
    
    // 모바일 메뉴 업데이트 - 사용자 타입별 하드코딩된 색상 사용
    let mobileAuthButtons = document.getElementById('mobile-auth-buttons');
    console.log('🔍 mobile-auth-buttons 요소 찾기 시도...');
    console.log('mobile-auth-buttons 요소:', mobileAuthButtons);
    console.log('mobile-auth-buttons 존재 여부:', !!mobileAuthButtons);
    
    // mobile-auth-buttons가 없으면 mobile-menu 안에 만들기
    if (!mobileAuthButtons) {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        console.log('✅ mobile-menu 찾음, mobile-auth-buttons 생성 시작');
        mobileAuthButtons = document.createElement('div');
        mobileAuthButtons.id = 'mobile-auth-buttons';
        mobileAuthButtons.className = 'border-t border-gray-200 pt-3 mt-3';
        mobileMenu.appendChild(mobileAuthButtons);
        console.log('✅ mobile-auth-buttons 요소 생성 완료');
      } else {
        console.warn('⚠️ mobile-menu 요소도 찾을 수 없습니다');
      }
    }
    
    if (mobileAuthButtons) {
      console.log('✅ 모바일 인증 버튼 요소 발견! 로그인 상태로 업데이트 시작');
      // 사용자 타입별 버튼 색상 (Tailwind purge 방지를 위해 하드코딩)
      let dashboardButtonClasses = '';
      if (user.user_type === 'jobseeker') {
        dashboardButtonClasses = 'w-full px-4 py-3 text-green-600 bg-green-50 border border-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-center block';
      } else if (user.user_type === 'company') {
        dashboardButtonClasses = 'w-full px-4 py-3 text-purple-600 bg-purple-50 border border-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium text-center block';
      } else if (user.user_type === 'agent') {
        dashboardButtonClasses = 'w-full px-4 py-3 text-blue-600 bg-blue-50 border border-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-center block';
      } else if (user.user_type === 'admin') {
        dashboardButtonClasses = 'w-full px-4 py-3 text-red-600 bg-red-50 border border-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-center block';
      } else {
        dashboardButtonClasses = 'w-full px-4 py-3 text-gray-600 bg-gray-50 border border-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-center block';
      }
      
      mobileAuthButtons.innerHTML = `
        <div class="flex items-center justify-between p-3 ${userColors.bg} ${userColors.border} rounded-lg border">
          <div class="flex items-center space-x-2">
            <i class="fas fa-user ${userColors.icon}"></i>
            <div>
              <div class="${userColors.text} font-semibold">${user.name}님</div>
              <div class="text-xs ${userColors.text} opacity-75">${getUserTypeLabel(user.user_type)}</div>
            </div>
          </div>
        </div>
        <a href="${config.link}" class="${dashboardButtonClasses}">
          <i class="fas ${config.icon} mr-2"></i>${config.name}
        </a>
        <button id="mobile-logout-btn" class="w-full px-4 py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
          <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
        </button>
      `;
      
      // 로그아웃 버튼에 이벤트 리스너 추가
      setTimeout(() => {
        const logoutBtn = document.getElementById('mobile-logout-btn');
        if (logoutBtn) {
          console.log('✅ 모바일 로그아웃 버튼에 이벤트 리스너 추가');
          logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('🔴 모바일 로그아웃 버튼 클릭됨');
            try {
              await handleLogout();
              // 로그아웃 후 모바일 메뉴 닫기
              const mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu) {
                mobileMenu.classList.add('hidden');
              }
            } catch (error) {
              console.error('모바일 로그아웃 에러:', error);
            }
          });
        } else {
          console.error('❌ mobile-logout-btn을 찾을 수 없습니다');
        }
      }, 100);
    } else {
      console.error('❌ mobile-auth-buttons 요소를 찾을 수 없습니다');
    }
    }
    
    // 전역 변수에 사용자 정보 저장
    window.currentUser = user;
    
    console.log('로그인 UI 업데이트 완료 (데스크탑 + 모바일)');
    
  } else {
    // 🚪 로그아웃 상태 UI 업데이트
    console.log('로그아웃 상태로 UI 업데이트');
    
    // 네비게이션 메뉴 복원 (모든 메뉴 표시)
    updateNavigationMenus(null);
    
    // 로그아웃 상태 UI 렌더링 (Desktop)
    authButtons.innerHTML = `
      <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
        <i class="fas fa-sign-in-alt mr-1"></i>로그인
      </button>
      <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        <i class="fas fa-user-plus mr-1"></i>회원가입
      </button>
    `;
    
    // 모바일 메뉴 업데이트
    let mobileAuthButtons = document.getElementById('mobile-auth-buttons');
    console.log('mobile-auth-buttons 요소 찾음 (로그아웃):', !!mobileAuthButtons);
    
    // mobile-auth-buttons가 없으면 mobile-menu 안에 만들기
    if (!mobileAuthButtons) {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        console.log('✅ mobile-menu 찾음, mobile-auth-buttons 생성 시작 (로그아웃)');
        mobileAuthButtons = document.createElement('div');
        mobileAuthButtons.id = 'mobile-auth-buttons';
        mobileAuthButtons.className = 'border-t border-gray-200 pt-3 mt-3';
        mobileMenu.appendChild(mobileAuthButtons);
        console.log('✅ mobile-auth-buttons 요소 생성 완료 (로그아웃)');
      } else {
        console.warn('⚠️ mobile-menu 요소도 찾을 수 없습니다 (로그아웃)');
      }
    }
    
    if (mobileAuthButtons) {
      console.log('모바일 인증 버튼: 로그아웃 상태로 업데이트');
      mobileAuthButtons.innerHTML = `
        <button id="mobile-login-btn" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
          <i class="fas fa-sign-in-alt mr-2"></i>로그인
        </button>
        <button id="mobile-signup-btn" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <i class="fas fa-user-plus mr-2"></i>회원가입
        </button>
      `;
      
      // 로그인/회원가입 버튼에 이벤트 리스너 추가
      setTimeout(() => {
        const loginBtn = document.getElementById('mobile-login-btn');
        const signupBtn = document.getElementById('mobile-signup-btn');
        
        if (loginBtn) {
          console.log('✅ 모바일 로그인 버튼에 이벤트 리스너 추가');
          loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔵 모바일 로그인 버튼 클릭됨');
            showLoginModal();
            // 모바일 메뉴 닫기
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
              mobileMenu.classList.add('hidden');
            }
          });
        }
        
        if (signupBtn) {
          console.log('✅ 모바일 회원가입 버튼에 이벤트 리스너 추가');
          signupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🟢 모바일 회원가입 버튼 클릭됨');
            showSignupModal();
            // 모바일 메뉴 닫기
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
              mobileMenu.classList.add('hidden');
            }
          });
        }
      }, 100);
    }
    
    // 전역 변수 초기화
    window.currentUser = null;
    
    console.log('✅ 로그아웃 UI 업데이트 완료 (데스크탑 + 모바일)');
  }
  
  // 모바일 메뉴 재초기화
  console.log('📱 initMobileMenu 호출');
  initMobileMenu();
  console.log('✅ updateAuthUI 함수 완료');
  
  } catch (error) {
    console.error('❌❌❌ updateAuthUI 함수에서 치명적 에러 발생:', error);
    console.error('에러 스택:', error.stack);
  }
}

// 사용자 타입 라벨 반환 헬퍼 함수
function getUserTypeLabel(userType) {
  const labels = {
    jobseeker: '구직자',
    company: '구인기업', 
    agent: '에이전트',
    admin: '관리자'
  };
  return labels[userType] || '사용자';
}

// 기존 함수들을 새로운 통합 함수로 교체
function updateLoginUI(user) {
  console.log('updateLoginUI 호출됨 - updateAuthUI로 위임');
  updateAuthUI(user);
}

function updateLogoutUI() {
  console.log('updateLogoutUI 호출됨 - updateAuthUI로 위임');
  updateAuthUI(null);
}
// 이전 함수 잔여 부분 제거됨

// 로그아웃 처리
// 로그아웃 처리 - 통합 및 개선된 버전
async function handleLogout() {
  try {
    console.log('로그아웃 시작');
    
    // API 호출
    await API.auth.logout();
    
    // 성공 메시지
    showNotification('👋 안전하게 로그아웃되었습니다.', 'success');
    
    // 네비게이션 메뉴 복원 (로그아웃 시 모든 메뉴 표시)
    updateNavigationMenus(null);
    
    // UI를 로그아웃 상태로 복원
    updateAuthUI(null); // 통합 함수 사용
    console.log('로그아웃 UI 복원 완료');
    
    // 메인 페이지라면 데이터 새로고침
    if (window.location.pathname === '/') {
      setTimeout(() => {
        loadMainPageData();
      }, 500);
    }
    
  } catch (error) {
    console.error('로그아웃 에러:', error);
    showNotification('로그아웃 중 오류가 발생했습니다.', 'error');
  }
}

// 전역 스코프에 handleLogout 노출 (모바일 메뉴 onclick에서 접근 가능하도록)
window.handleLogout = handleLogout;

// 로그인 상태 확인
async function checkLoginStatus() {
  if (authToken) {
    try {
      const response = await API.auth.getProfile();
      if (response.success) {
        updateLoginUI(response.user);
      } else {
        localStorage.removeItem('wowcampus_token');
        authToken = null;
      }
    } catch (error) {
      localStorage.removeItem('wowcampus_token');
      authToken = null;
    }
  }
}

// 페이지 로드 시 로그인 상태 확인 및 복원
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOMContentLoaded - 페이지 로드 시작');
  console.log('📱 모바일 메뉴 요소 확인:', {
    'mobile-menu': !!document.getElementById('mobile-menu'),
    'mobile-auth-buttons': !!document.getElementById('mobile-auth-buttons'),
    'mobile-menu-btn': !!document.getElementById('mobile-menu-btn')
  });
  
  // 로그인 상태 복원
  restoreLoginState();
  
  // 서비스 메뉴 로드
  loadServiceMenus();
  
  // 메인 페이지 데이터 로드
  if (window.location.pathname === '/' || window.location.pathname === '/home') {
    loadMainPageData();
  }
  
  console.log('✅ 페이지 초기화 완료');
});

// 대시보드 탭 관리
function showTab(tabName) {
  // 모든 탭 숨기기
  const tabs = document.querySelectorAll('.dashboard-content');
  tabs.forEach(tab => tab.style.display = 'none');
  
  // 모든 탭 버튼 비활성화
  const tabButtons = document.querySelectorAll('.dashboard-tab');
  tabButtons.forEach(button => button.classList.remove('active'));
  
  // 선택된 탭 표시
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
  
  // 선택된 탭 버튼 활성화
  const selectedButton = document.querySelector(`button[onclick="showTab('${tabName}')"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }
  
  // 탭별 초기화 로직
  if (tabName === 'profile') {
    loadUserProfile();
  } else if (tabName === 'applications') {
    loadApplications();
  }
}

// 프로필 편집 토글
function toggleProfileEdit() {
  const form = document.getElementById('profile-form');
  const inputs = form.querySelectorAll('input, select, textarea');
  const editBtn = document.getElementById('edit-profile-btn');
  const formActions = document.getElementById('profile-form-actions');
  
  const isDisabled = inputs[0].disabled;
  
  inputs.forEach(input => {
    input.disabled = !isDisabled;
  });
  
  if (isDisabled) {
    editBtn.innerHTML = '<i class="fas fa-times mr-2"></i>취소';
    formActions.style.display = 'flex';
  } else {
    editBtn.innerHTML = '<i class="fas fa-edit mr-2"></i>편집';
    formActions.style.display = 'none';
  }
}

// 프로필 편집 취소
function cancelProfileEdit() {
  toggleProfileEdit();
  loadUserProfile(); // 원래 데이터로 복원
}

// 사용자 프로필 로드
async function loadUserProfile() {
  try {
    const response = await API.auth.getProfile();
    if (response.success) {
      const user = response.user;
      const profile = response.profile;
      
      // 기본 정보 업데이트
      document.getElementById('profile-name').textContent = user.name;
      document.getElementById('profile-email').textContent = user.email;
      
      // 프로필 폼 데이터 설정
      if (profile) {
        document.getElementById('first_name').value = profile.first_name || '';
        document.getElementById('last_name').value = profile.last_name || '';
        document.getElementById('nationality').value = profile.nationality || '';
        document.getElementById('birth_date').value = profile.birth_date || '';
        document.getElementById('gender').value = profile.gender || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('current_location').value = profile.current_location || '';
        document.getElementById('preferred_location').value = profile.preferred_location || '';
        document.getElementById('salary_expectation').value = profile.salary_expectation || '';
        document.getElementById('bio').value = profile.bio || '';
        
        // 비자 정보
        document.getElementById('visa_status').value = profile.visa_status || '';
        document.getElementById('visa_expiry').value = profile.visa_expiry || '';
        document.getElementById('visa_sponsorship_needed').checked = profile.visa_sponsorship_needed || false;
        
        // 언어 정보
        document.getElementById('korean_level').value = profile.korean_level || '';
        document.getElementById('english_level').value = profile.english_level || '';
        document.getElementById('other_languages').value = profile.other_languages || '';
        document.getElementById('language_certificates').value = profile.language_certificates || '';
        
        // 기술 정보
        document.getElementById('skills').value = profile.skills || '';
        document.getElementById('certifications').value = profile.certifications || '';
        
        // 포트폴리오 링크
        document.getElementById('portfolio_url').value = profile.portfolio_url || '';
        document.getElementById('github_url').value = profile.github_url || '';
        document.getElementById('linkedin_url').value = profile.linkedin_url || '';
        
        // 프로필 완성도 계산
        updateProfileCompletion();
      }
    }
  } catch (error) {
    showNotification('프로필 정보를 불러오는데 실패했습니다.', 'error');
  }
}

// 프로필 완성도 업데이트
function updateProfileCompletion() {
  const requiredFields = [
    'first_name', 'nationality', 'current_location', 
    'visa_status', 'korean_level', 'skills'
  ];
  
  let completedFields = 0;
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && field.value.trim()) {
      completedFields++;
    }
  });
  
  const completionRate = Math.round((completedFields / requiredFields.length) * 100);
  const statusElement = document.getElementById('profile-status');
  
  statusElement.textContent = `프로필 완성도: ${completionRate}%`;
  statusElement.className = `inline-block px-2 py-1 text-xs rounded-full mt-2 ${
    completionRate >= 80 ? 'bg-green-100 text-green-800' :
    completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800'
  }`;
}

// 프로필 저장
document.addEventListener('DOMContentLoaded', function() {
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const profileData = {
        name: formData.get('first_name') + ' ' + (formData.get('last_name') || ''),
        phone: formData.get('phone'),
        profile_data: {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          nationality: formData.get('nationality'),
          birth_date: formData.get('birth_date'),
          gender: formData.get('gender'),
          current_location: formData.get('current_location'),
          preferred_location: formData.get('preferred_location'),
          salary_expectation: formData.get('salary_expectation'),
          bio: formData.get('bio')
        }
      };
      
      try {
        const response = await API.auth.updateProfile(profileData);
        if (response.success) {
          showNotification('프로필이 성공적으로 업데이트되었습니다.', 'success');
          toggleProfileEdit();
          updateProfileCompletion();
        }
      } catch (error) {
        showNotification('프로필 업데이트에 실패했습니다.', 'error');
      }
    });
  }
  
  // 비자 폼 처리
  const visaForm = document.getElementById('visa-form');
  if (visaForm) {
    visaForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const visaData = {
        profile_data: {
          visa_status: formData.get('visa_status'),
          visa_expiry: formData.get('visa_expiry'),
          visa_sponsorship_needed: formData.get('visa_sponsorship_needed') === 'on',
          korean_level: formData.get('korean_level'),
          english_level: formData.get('english_level'),
          other_languages: formData.get('other_languages'),
          language_certificates: formData.get('language_certificates'),
          skills: formData.get('skills'),
          certifications: formData.get('certifications')
        }
      };
      
      try {
        const response = await API.auth.updateProfile(visaData);
        if (response.success) {
          showNotification('비자 및 언어 정보가 저장되었습니다.', 'success');
          updateProfileCompletion();
        }
      } catch (error) {
        showNotification('저장에 실패했습니다.', 'error');
      }
    });
  }
});

// API에 updateProfile 함수 추가
API.auth.updateProfile = async function(profileData) {
  try {
    const response = await axios.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 학력 추가
function addEducation() {
  showNotification('학력 추가 기능은 곧 구현될 예정입니다.', 'info');
}

// 경력 추가
function addExperience() {
  showNotification('경력 추가 기능은 곧 구현될 예정입니다.', 'info');
}

// 학력/경력 저장
function saveEducationAndExperience() {
  showNotification('학력/경력 저장 기능은 곧 구현될 예정입니다.', 'info');
}

// 포트폴리오 링크 저장
function savePortfolioLinks() {
  const portfolioData = {
    profile_data: {
      portfolio_url: document.getElementById('portfolio_url').value,
      github_url: document.getElementById('github_url').value,
      linkedin_url: document.getElementById('linkedin_url').value
    }
  };
  
  API.auth.updateProfile(portfolioData)
    .then(response => {
      if (response.success) {
        showNotification('포트폴리오 링크가 저장되었습니다.', 'success');
      }
    })
    .catch(error => {
      showNotification('저장에 실패했습니다.', 'error');
    });
}

// 이력서 업로드 처리
function handleResumeUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // 파일 크기 체크 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    showNotification('파일 크기는 10MB를 초과할 수 없습니다.', 'error');
    return;
  }
  
  // 파일 형식 체크
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    showNotification('PDF, DOC, DOCX 파일만 업로드 가능합니다.', 'error');
    return;
  }
  
  showNotification('이력서 업로드 기능은 곧 구현될 예정입니다.', 'info');
}

// 이력서 생성
function generateResume() {
  showNotification('자동 이력서 생성 기능은 곧 구현될 예정입니다.', 'info');
}

// 이력서 다운로드
function downloadResume() {
  showNotification('이력서 다운로드 기능은 곧 구현될 예정입니다.', 'info');
}

// 지원 현황 로드
function loadApplications() {
  // 임시 데이터
  document.getElementById('total-applications').textContent = '0';
  document.getElementById('pending-applications').textContent = '0';
  document.getElementById('accepted-applications').textContent = '0';
  document.getElementById('rejected-applications').textContent = '0';
}

// 페이지 로드 시 대시보드 초기화
if (window.location.pathname === '/dashboard') {
  document.addEventListener('DOMContentLoaded', function() {
    showTab('profile');
  });
}

// CSS 스타일 추가
const dashboardStyles = `
<style>
.dashboard-tab.active {
  background-color: #EBF8FF;
  color: #2B6CB0;
  border-left: 3px solid #3182CE;
}

.dashboard-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

input:disabled, select:disabled, textarea:disabled {
  background-color: #F7FAFC;
  cursor: not-allowed;
}

.file-upload-hover {
  border-color: #3182CE !important;
  background-color: #EBF8FF !important;
}
</style>
`;

// 스타일 추가
if (window.location.pathname === '/dashboard') {
  document.head.insertAdjacentHTML('beforeend', dashboardStyles);
}

// 전역 함수들
// Advanced Filter Functions

// Toggle advanced filters visibility
function toggleAdvancedFilters(type = 'job') {
  const advancedFilters = document.getElementById(type === 'job' ? 'advanced-job-filters' : 'advanced-jobseeker-filters');
  if (advancedFilters) {
    const isHidden = advancedFilters.classList.contains('hidden');
    if (isHidden) {
      advancedFilters.classList.remove('hidden');
    } else {
      advancedFilters.classList.add('hidden');
    }
  }
}

// Search Jobs
function searchJobs() {
  const searchInput = document.getElementById('job-search-input');
  const categoryFilter = document.getElementById('job-category-filter');
  const locationFilter = document.getElementById('job-location-filter');
  
  const params = new URLSearchParams();
  
  if (searchInput?.value) params.append('search', searchInput.value);
  if (categoryFilter?.value) params.append('category', categoryFilter.value);
  if (locationFilter?.value) params.append('location', locationFilter.value);
  
  // Add salary range filters
  const salaryMinInput = document.getElementById('salary-min-input');
  const salaryMaxInput = document.getElementById('salary-max-input');
  
  if (salaryMinInput?.value) {
    const salaryMin = parseInt(salaryMinInput.value) * 10000; // Convert 만원 to 원
    params.append('salary_min', salaryMin);
  }
  if (salaryMaxInput?.value) {
    const salaryMax = parseInt(salaryMaxInput.value) * 10000; // Convert 만원 to 원
    params.append('salary_max', salaryMax);
  }
  
  console.log('Searching jobs with params:', params.toString());
  loadJobListings(params.toString());
}

// Search Job Seekers
function searchJobSeekers() {
  const searchInput = document.getElementById('jobseeker-search-input');
  const majorFilter = document.getElementById('jobseeker-major-filter');
  const experienceFilter = document.getElementById('jobseeker-experience-filter');
  const locationFilter = document.getElementById('jobseeker-location-filter');
  
  const params = new URLSearchParams();
  
  if (searchInput?.value) params.append('search', searchInput.value);
  if (majorFilter?.value) params.append('major', majorFilter.value);
  if (experienceFilter?.value) params.append('experience', experienceFilter.value);
  if (locationFilter?.value) params.append('location', locationFilter.value);
  
  console.log('Searching job seekers with params:', params.toString());
  loadJobSeekerListings(params.toString());
}

// Apply Job Filters
function applyJobFilters() {
  const params = new URLSearchParams();
  
  // Get basic filters
  const searchInput = document.getElementById('job-search-input');
  const categoryFilter = document.getElementById('job-category-filter');
  const locationFilter = document.getElementById('job-location-filter');
  
  if (searchInput?.value) params.append('search', searchInput.value);
  if (categoryFilter?.value) params.append('category', categoryFilter.value);
  if (locationFilter?.value) params.append('location', locationFilter.value);
  
  // Get advanced filters
  const advancedSection = document.getElementById('advanced-job-filters');
  if (advancedSection && !advancedSection.classList.contains('hidden')) {
    // Employment Type
    const employmentTypes = advancedSection.querySelectorAll('input[name="employment_type"]:checked');
    employmentTypes.forEach(input => params.append('employment_type', input.value));
    
    // Experience Level
    const experienceLevels = advancedSection.querySelectorAll('input[name="experience_level"]:checked');
    experienceLevels.forEach(input => params.append('experience_level', input.value));
    
    // Visa Support
    const visaSupports = advancedSection.querySelectorAll('input[name="visa_support"]:checked');
    visaSupports.forEach(input => params.append('visa_support', input.value));
    
    // Company Size
    const companySizes = advancedSection.querySelectorAll('input[name="company_size"]:checked');
    companySizes.forEach(input => params.append('company_size', input.value));
    
    // Salary Range - Use input fields instead of checkboxes
    const salaryMinInput = document.getElementById('salary-min-input');
    const salaryMaxInput = document.getElementById('salary-max-input');
    
    if (salaryMinInput?.value) {
      const salaryMin = parseInt(salaryMinInput.value) * 10000; // Convert 만원 to 원
      params.append('salary_min', salaryMin);
    }
    if (salaryMaxInput?.value) {
      const salaryMax = parseInt(salaryMaxInput.value) * 10000; // Convert 만원 to 원
      params.append('salary_max', salaryMax);
    }
    
    // Korean Level
    const koreanLevels = advancedSection.querySelectorAll('input[name="korean_level"]:checked');
    koreanLevels.forEach(input => params.append('korean_level', input.value));
    
    // English Required
    const englishRequired = advancedSection.querySelectorAll('input[name="english_required"]:checked');
    englishRequired.forEach(input => params.append('english_required', input.value));
  }
  
  console.log('Applying job filters with params:', params.toString());
  loadJobListings(params.toString());
  updateActiveFilters('job', params);
}

// Apply Job Seeker Filters
function applyJobSeekerFilters() {
  const params = new URLSearchParams();
  
  // Get basic filters
  const searchInput = document.getElementById('jobseeker-search-input');
  const majorFilter = document.getElementById('jobseeker-major-filter');
  const experienceFilter = document.getElementById('jobseeker-experience-filter');
  
  if (searchInput?.value) params.append('search', searchInput.value);
  if (majorFilter?.value) params.append('major', majorFilter.value);
  if (experienceFilter?.value) params.append('experience', experienceFilter.value);
  
  // Get advanced filters
  const advancedSection = document.getElementById('advanced-jobseeker-filters');
  if (advancedSection && !advancedSection.classList.contains('hidden')) {
    // Nationality
    const nationalities = advancedSection.querySelectorAll('input[name="nationality"]:checked');
    nationalities.forEach(input => params.append('nationality', input.value));
    
    // Visa Status
    const visaStatuses = advancedSection.querySelectorAll('input[name="visa_status"]:checked');
    visaStatuses.forEach(input => params.append('visa_status', input.value));
    
    // Korean Level
    const koreanLevels = advancedSection.querySelectorAll('input[name="korean_level"]:checked');
    koreanLevels.forEach(input => params.append('korean_level', input.value));
    
    // Preferred Location
    const preferredLocations = advancedSection.querySelectorAll('input[name="preferred_location"]:checked');
    preferredLocations.forEach(input => params.append('preferred_location', input.value));
    
    // Skills
    const skills = advancedSection.querySelectorAll('input[name="skills"]:checked');
    skills.forEach(input => params.append('skills', input.value));
    
    // Salary Expectation
    const salaryExpectations = advancedSection.querySelectorAll('input[name="salary_expectation"]:checked');
    salaryExpectations.forEach(input => params.append('salary_expectation', input.value));
  }
  
  console.log('Applying job seeker filters with params:', params.toString());
  loadJobSeekerListings(params.toString());
  updateActiveFilters('jobseeker', params);
}

// Clear All Filters
function clearAllFilters(type) {
  // Clear basic filters
  if (type === 'job') {
    const searchInput = document.getElementById('job-search-input');
    const categoryFilter = document.getElementById('job-category-filter');
    const locationFilter = document.getElementById('job-location-filter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (locationFilter) locationFilter.value = '';
    
    // Clear advanced filters
    const advancedSection = document.getElementById('advanced-job-filters');
    if (advancedSection) {
      const checkboxes = advancedSection.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => checkbox.checked = false);
      
      // Clear salary range inputs
      const salaryMinInput = document.getElementById('salary-min-input');
      const salaryMaxInput = document.getElementById('salary-max-input');
      if (salaryMinInput) salaryMinInput.value = '';
      if (salaryMaxInput) salaryMaxInput.value = '';
    }
    
    loadJobListings('');
  } else {
    const searchInput = document.getElementById('jobseeker-search-input');
    const majorFilter = document.getElementById('jobseeker-major-filter');
    const experienceFilter = document.getElementById('jobseeker-experience-filter');
    const locationFilter = document.getElementById('jobseeker-location-filter');
    
    if (searchInput) searchInput.value = '';
    if (majorFilter) majorFilter.value = '';
    if (experienceFilter) experienceFilter.value = '';
    if (locationFilter) locationFilter.value = '';
    
    // Clear advanced filters
    const advancedSection = document.getElementById('advanced-jobseeker-filters');
    if (advancedSection) {
      const checkboxes = advancedSection.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => checkbox.checked = false);
    }
    
    loadJobSeekerListings('');
  }
  
  // Hide active filters
  const activeFiltersSection = document.getElementById(type === 'job' ? 'active-job-filters' : 'active-jobseeker-filters');
  if (activeFiltersSection) {
    activeFiltersSection.classList.add('hidden');
  }
}

// Update Active Filters Display
function updateActiveFilters(type, params) {
  const activeFiltersSection = document.getElementById(type === 'job' ? 'active-job-filters' : 'active-jobseeker-filters');
  const activeFiltersList = document.getElementById(type === 'job' ? 'active-job-filters-list' : 'active-jobseeker-filters-list');
  
  if (!activeFiltersList) return;
  
  activeFiltersList.innerHTML = '';
  
  const filterLabels = {
    // Job filters
    employment_type: { fulltime: '정규직', contract: '계약직', parttime: '파트타임', internship: '인턴십' },
    experience_level: { entry: '신입', '1-3': '1-3년', '3-5': '3-5년', '5+': '5년 이상' },
    visa_support: { yes: '비자 스폰서십', E7: 'E-7 비자', E9: 'E-9 비자', F2: 'F-2 비자' },
    company_size: { startup: '스타트업', medium: '중견기업', large: '대기업' },
    salary_range: { '2000-3000': '2,000-3,000만원', '3000-4000': '3,000-4,000만원', '4000-5000': '4,000-5,000만원', '5000+': '5,000만원 이상' },
    korean_level: { beginner: '한국어 초급', intermediate: '한국어 중급', advanced: '한국어 고급' },
    
    // Job seeker filters
    nationality: { china: '중국', vietnam: '베트남', philippines: '필리핀', thailand: '태국', japan: '일본', usa: '미국' },
    visa_status: { E7: 'E-7 비자', E9: 'E-9 비자', F2: 'F-2 비자', F4: 'F-4 비자', F5: 'F-5 비자', D2: 'D-2 비자' },
    preferred_location: { '서울': '서울', '경기도': '경기도', '강원도': '강원도', '충청도': '충청도', '경상도': '경상도', '전라도': '전라도', '제주도': '제주도' },
    skills: { java: 'Java', python: 'Python', javascript: 'JavaScript', react: 'React', photoshop: 'Photoshop', marketing: '디지털 마케팅' },
    salary_expectation: { '2000-2500': '2,000-2,500만원', '2500-3000': '2,500-3,000만원', '3000-3500': '3,000-3,500만원', '3500-4000': '3,500-4,000만원', '4000+': '4,000만원 이상' }
  };
  
  let hasFilters = false;
  
  for (const [key, value] of params) {
    if (key === 'search' && value) {
      hasFilters = true;
      const badge = createFilterBadge(`검색: ${value}`, () => removeActiveFilter(type, key, value));
      activeFiltersList.appendChild(badge);
    } else if (filterLabels[key] && filterLabels[key][value]) {
      hasFilters = true;
      const badge = createFilterBadge(filterLabels[key][value], () => removeActiveFilter(type, key, value));
      activeFiltersList.appendChild(badge);
    }
  }
  
  if (hasFilters) {
    activeFiltersSection.classList.remove('hidden');
  } else {
    activeFiltersSection.classList.add('hidden');
  }
}

// Create Filter Badge
function createFilterBadge(text, onRemove) {
  const badge = document.createElement('span');
  badge.className = 'inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full';
  badge.innerHTML = `
    ${text}
    <button type="button" class="ml-1 inline-flex items-center p-0.5 text-blue-400 hover:text-blue-600">
      <i class="fas fa-times text-xs"></i>
    </button>
  `;
  
  const removeBtn = badge.querySelector('button');
  removeBtn.addEventListener('click', onRemove);
  
  return badge;
}

// Remove Active Filter
function removeActiveFilter(type, key, value) {
  // Find and uncheck the corresponding filter
  const filterSection = document.getElementById(type === 'job' ? 'advanced-job-filters' : 'advanced-jobseeker-filters');
  
  if (key === 'search') {
    const searchInput = document.getElementById(type === 'job' ? 'job-search-input' : 'jobseeker-search-input');
    if (searchInput) searchInput.value = '';
  } else if (key === 'category' || key === 'location' || key === 'major' || key === 'experience') {
    const select = document.getElementById(`${type === 'job' ? 'job' : 'jobseeker'}-${key}-filter`);
    if (select) select.value = '';
  } else if (filterSection) {
    const checkbox = filterSection.querySelector(`input[name="${key}"][value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  }
  
  // Reapply filters
  if (type === 'job') {
    applyJobFilters();
  } else {
    applyJobSeekerFilters();
  }
}

// Load Job Listings (placeholder function)
function loadJobListings(queryString) {
  console.log('Loading job listings with query:', queryString);
  // This function would make an API call to load filtered job listings
  // For now, just log the query string
  
  // Add sample job listings with detail buttons for testing
  displayJobListings([
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "삼성전자",
      location: "서울",
      type: "정규직",
      salary: "4,000-5,000만원",
      experience: "3-5년",
      posted_date: "2024-01-15",
      description: "Join our innovative development team to build next-generation mobile applications"
    },
    {
      id: 2,
      title: "UX Designer",
      company: "네이버",
      location: "경기도",
      type: "정규직", 
      salary: "3,500-4,500만원",
      experience: "2-4년",
      posted_date: "2024-01-12",
      description: "Create intuitive and engaging user experiences for our web and mobile platforms"
    },
    {
      id: 3,
      title: "Marketing Specialist",
      company: "LG전자",
      location: "충청도",
      type: "계약직", 
      salary: "3,000-4,000만원",
      experience: "1-3년",
      posted_date: "2024-01-10",
      description: "Lead digital marketing campaigns and brand strategy"
    },
    {
      id: 4,
      title: "Production Engineer",
      company: "현대자동차",
      location: "경상도",
      type: "정규직", 
      salary: "3,500-4,000만원",
      experience: "2-5년",
      posted_date: "2024-01-08",
      description: "Manage production processes and quality control"
    },
    {
      id: 5,
      title: "Hotel Manager",
      company: "제주신라호텔",
      location: "제주도",
      type: "정규직", 
      salary: "3,200-4,200만원",
      experience: "3-7년",
      posted_date: "2024-01-05",
      description: "Oversee hotel operations and guest services"
    },
    {
      id: 6,
      title: "Forest Ranger",
      company: "국립공원관리공단",
      location: "강원도",
      type: "계약직", 
      salary: "2,800-3,500만원",
      experience: "1-3년",
      posted_date: "2024-01-03",
      description: "Manage national park facilities and visitor services"
    }
  ]);
}

// Load Job Seeker Listings (placeholder function)  
function loadJobSeekerListings(queryString) {
  console.log('Loading job seeker listings with query:', queryString);
  // This function would make an API call to load filtered job seeker listings
  // For now, just log the query string
  
  // Add sample job seeker listings with detail buttons for testing
  displayJobSeekerListings([
    {
      id: 1,
      name: "김민수",
      nationality: "베트남",
      major: "컴퓨터공학",
      experience: "3년",
      korean_level: "고급",
      skills: "Java, React, Python",
      visa_status: "E-7",
      location: "서울",
      salary_expectation: "3,500만원"
    },
    {
      id: 2,
      name: "이지원", 
      nationality: "중국",
      major: "경영학",
      experience: "2년",
      korean_level: "중급",
      skills: "마케팅, SNS, Excel",
      visa_status: "F-2",
      location: "경기도",
      salary_expectation: "3,000만원"
    },
    {
      id: 3,
      name: "박지민", 
      nationality: "필리핀",
      major: "디자인",
      experience: "1년",
      korean_level: "초중급",
      skills: "Photoshop, Illustrator, UI/UX",
      visa_status: "D-2",
      location: "충청도",
      salary_expectation: "2,800만원"
    },
    {
      id: 4,
      name: "최준호", 
      nationality: "태국",
      major: "공학",
      experience: "4년",
      korean_level: "고급",
      skills: "AutoCAD, SolidWorks, 품질관리",
      visa_status: "E-7",
      location: "경상도",
      salary_expectation: "3,800만원"
    },
    {
      id: 5,
      name: "정수연", 
      nationality: "일본",
      major: "어학/문학",
      experience: "2년",
      korean_level: "원어민 수준",
      skills: "번역, 통역, 일본어",
      visa_status: "F-4",
      location: "전라도",
      salary_expectation: "3,200만원"
    },
    {
      id: 6,
      name: "강은미", 
      nationality: "미국",
      major: "금융/경제",
      experience: "신입",
      korean_level: "중급",
      skills: "Excel, 재무분석, 영어",
      visa_status: "D-2",
      location: "제주도",
      salary_expectation: "3,000만원"
    },
    {
      id: 7,
      name: "윤성호", 
      nationality: "러시아",
      major: "환경공학",
      experience: "3년",
      korean_level: "중급",
      skills: "환경분석, GIS, 러시아어",
      visa_status: "E-7",
      location: "강원도",
      salary_expectation: "3,400만원"
    }
  ]);
}

// Display Job Listings with Detail Buttons
function displayJobListings(jobs) {
  const container = document.getElementById('job-listings');
  if (!container) return;
  
  container.innerHTML = '';
  
  jobs.forEach(job => {
    const jobCard = document.createElement('div');
    jobCard.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow';
    jobCard.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">${job.title}</h3>
          <p class="text-lg text-gray-700 mb-1">
            <i class="fas fa-building mr-2 text-blue-600"></i>${job.company}
          </p>
          <div class="flex flex-wrap gap-3 text-sm text-gray-600">
            <span><i class="fas fa-map-marker-alt mr-1"></i>${job.location}</span>
            <span><i class="fas fa-clock mr-1"></i>${job.type}</span>
            <span><i class="fas fa-won-sign mr-1"></i>${job.salary}</span>
            <span><i class="fas fa-user-tie mr-1"></i>${job.experience}</span>
          </div>
        </div>
        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          ${formatDate(job.posted_date)}
        </span>
      </div>
      <p class="text-gray-600 mb-4">${job.description}</p>
      <div class="flex justify-between items-center">
        <div class="flex gap-2">
          <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">비자 지원</span>
          <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">외국인 환영</span>
        </div>
        <button onclick="showJobDetail(${job.id})" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <i class="fas fa-eye mr-2"></i>자세히 보기
        </button>
      </div>
    `;
    container.appendChild(jobCard);
  });
}

// Display Job Seeker Listings with Detail Buttons
function displayJobSeekerListings(jobseekers) {
  const container = document.getElementById('jobseekers-listings');
  if (!container) return;
  
  container.innerHTML = '';
  
  jobseekers.forEach(person => {
    const personCard = document.createElement('div');
    personCard.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow';
    personCard.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-lg">${person.name.charAt(0)}</span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-1">
              ${person.name} <span class="text-sm text-gray-500">(${person.nationality})</span>
            </h3>
            <div class="flex flex-wrap gap-3 text-sm text-gray-600">
              <span><i class="fas fa-graduation-cap mr-1"></i>${person.major}</span>
              <span><i class="fas fa-briefcase mr-1"></i>${person.experience} 경력</span>
              <span><i class="fas fa-language mr-1"></i>한국어 ${person.korean_level}</span>
            </div>
          </div>
        </div>
        <div class="text-right">
          <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            ${person.visa_status}
          </span>
        </div>
      </div>
      <div class="mb-4">
        <p class="text-gray-600 mb-2">
          <strong>보유 기술:</strong> ${person.skills}
        </p>
        <div class="flex flex-wrap gap-3 text-sm text-gray-600">
          <span><i class="fas fa-map-marker-alt mr-1"></i>희망 근무지: ${person.location}</span>
          <span><i class="fas fa-won-sign mr-1"></i>희망 연봉: ${person.salary_expectation}</span>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex gap-2">
          <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">즉시 근무 가능</span>
          <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">이력서 등록</span>
        </div>
        <button onclick="showJobSeekerDetail(${person.id})" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <i class="fas fa-user mr-2"></i>프로필 보기
        </button>
      </div>
    `;
    container.appendChild(personCard);
  });
}

// Show Job Detail Modal
function showJobDetail(jobId) {
  console.log('Opening job detail for ID:', jobId);
  
  // Sample job data - in real app, this would be fetched from API
  const jobData = {
    1: {
      id: 1,
      title: "Senior Software Engineer",
      company: "삼성전자",
      location: "서울 서초구",
      type: "정규직",
      salary: "4,000-5,000만원",
      experience: "3-5년 경력",
      posted_date: "2024-01-15",
      deadline: "2024-02-15",
      description: "혁신적인 모바일 애플리케이션을 개발하는 팀에 합류하세요. 차세대 기술을 활용하여 사용자 경험을 향상시키는 프로젝트에 참여할 수 있습니다.",
      requirements: [
        "Java, Kotlin 개발 경험 3년 이상",
        "Android 또는 iOS 앱 개발 경험",
        "REST API 연동 경험",
        "Git 버전 관리 시스템 사용 경험",
        "팀 협업 및 커뮤니케이션 능력"
      ],
      preferred: [
        "컴퓨터공학 또는 관련 전공 학사 이상",
        "영어 또는 한국어 비즈니스 레벨",
        "클라우드 서비스 (AWS, Azure) 경험",
        "외국인 근로자 환영"
      ],
      benefits: [
        "4대보험 + 퇴직연금",
        "연차 15일 + 리프레시 휴가",
        "교육비 지원 (연 200만원)",
        "비자 스폰서십 지원",
        "유연 근무제",
        "점심 식대 지원"
      ],
      visa_support: true,
      korean_required: "중급",
      contact: {
        email: "hr@samsung.com",
        phone: "02-1234-5678"
      }
    },
    2: {
      id: 2,
      title: "UX Designer",
      company: "네이버",
      location: "경기 성남시",
      type: "정규직",
      salary: "3,500-4,500만원",
      experience: "2-4년 경력",
      posted_date: "2024-01-12",
      deadline: "2024-02-10",
      description: "사용자 중심의 디자인으로 웹과 모바일 플랫폼의 사용자 경험을 개선하는 역할을 맡게 됩니다.",
      requirements: [
        "UX/UI 디자인 경력 2년 이상",
        "Figma, Adobe Creative Suite 능숙",
        "사용자 리서치 및 분석 경험",
        "프로토타이핑 경험",
        "웹/모바일 디자인 이해"
      ],
      preferred: [
        "디자인 관련 전공 우대",
        "한국어 중급 이상",
        "포트폴리오 필수",
        "다국적 팀 근무 경험"
      ],
      benefits: [
        "4대보험 + 건강검진",
        "자유로운 휴가 사용",
        "최신 디자인 툴 제공",
        "비자 연장 지원",
        "재택근무 가능",
        "카페테리아 무료 이용"
      ],
      visa_support: true,
      korean_required: "중급",
      contact: {
        email: "design-team@naver.com",
        phone: "031-1234-5678"
      }
    }
  };
  
  const job = jobData[jobId];
  if (!job) {
    showNotification('구인정보를 찾을 수 없습니다.', 'error');
    return;
  }
  
  createJobDetailModal(job);
}

// Show Job Seeker Detail Modal
function showJobSeekerDetail(personId) {
  console.log('Opening job seeker detail for ID:', personId);
  
  // Sample job seeker data - in real app, this would be fetched from API
  const jobSeekerData = {
    1: {
      id: 1,
      name: "김민수",
      nationality: "베트남",
      age: 28,
      gender: "남성",
      major: "컴퓨터공학",
      education: "학사 (호치민 공과대학)",
      experience: "3년",
      korean_level: "고급 (TOPIK 5급)",
      english_level: "중급",
      skills: "Java, React, Python, MySQL, Git",
      visa_status: "E-7 (특정활동)",
      visa_expiry: "2025-06-30",
      location: "서울시 강남구",
      preferred_location: "서울/경기",
      salary_expectation: "3,500만원",
      bio: "안녕하세요! 베트남에서 온 소프트웨어 개발자 김민수입니다. 한국에서 3년간 웹 개발 경험을 쌓았으며, 새로운 기술 학습에 열정적입니다.",
      work_experience: [
        {
          company: "테크스타트업",
          position: "주니어 개발자",
          period: "2021-2023",
          description: "React 기반 웹 애플리케이션 개발"
        },
        {
          company: "IT솔루션",
          position: "개발자",
          period: "2023-현재",
          description: "Java Spring 기반 백엔드 API 개발"
        }
      ],
      certifications: [
        "정보처리기사 (2022)",
        "TOPIK 5급 (2023)",
        "AWS Solutions Architect Associate (2023)"
      ],
      portfolio_url: "https://github.com/kimminsu",
      contact: {
        email: "kimminsu@email.com",
        phone: "010-1234-5678"
      }
    },
    2: {
      id: 2,
      name: "이지원",
      nationality: "중국",
      age: 25,
      gender: "여성",
      major: "경영학 (마케팅 전공)",
      education: "학사 (북경대학교)",
      experience: "2년",
      korean_level: "중급 (TOPIK 4급)",
      english_level: "고급",
      skills: "디지털 마케팅, SNS 운영, Google Analytics, Photoshop, Excel",
      visa_status: "F-2 (거주)",
      visa_expiry: "2026-12-31",
      location: "부산시 해운대구",
      preferred_location: "부산/대구",
      salary_expectation: "3,000만원",
      bio: "중국에서 온 마케팅 전문가 이지원입니다. 디지털 마케팅과 브랜드 관리에 관심이 많으며, 한중 양국의 문화를 잘 이해하고 있습니다.",
      work_experience: [
        {
          company: "마케팅에이전시",
          position: "마케팅 어시스턴트",
          period: "2022-2023",
          description: "SNS 콘텐츠 기획 및 운영"
        },
        {
          company: "이커머스 회사",
          position: "디지털 마케터",
          period: "2023-현재",
          description: "온라인 광고 캠페인 기획 및 성과 분석"
        }
      ],
      certifications: [
        "Google Analytics 인증 (2023)",
        "Facebook Blueprint 인증 (2023)",
        "TOPIK 4급 (2023)"
      ],
      portfolio_url: "https://portfolio.jiwon.com",
      contact: {
        email: "jiwon.lee@email.com",
        phone: "010-9876-5432"
      }
    }
  };
  
  const person = jobSeekerData[personId];
  if (!person) {
    showNotification('구직자 정보를 찾을 수 없습니다.', 'error');
    return;
  }
  
  createJobSeekerDetailModal(person);
}

// Create Job Detail Modal
function createJobDetailModal(job) {
  // Remove existing modal if any
  const existingModal = document.getElementById('job-detail-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'job-detail-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-start mb-6">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h2 class="text-2xl font-bold text-gray-900">${job.title}</h2>
              ${job.visa_support ? '<span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">비자 지원</span>' : ''}
            </div>
            <div class="flex items-center space-x-4 text-gray-600">
              <span class="text-lg font-semibold text-blue-600">
                <i class="fas fa-building mr-2"></i>${job.company}
              </span>
              <span><i class="fas fa-map-marker-alt mr-1"></i>${job.location}</span>
              <span><i class="fas fa-clock mr-1"></i>${job.type}</span>
            </div>
          </div>
          <button onclick="closeModal('job-detail-modal')" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Key Info -->
        <div class="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${job.salary}</div>
            <div class="text-sm text-gray-600">연봉</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">${job.experience}</div>
            <div class="text-sm text-gray-600">경력</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">~${formatDate(job.deadline)}</div>
            <div class="text-sm text-gray-600">마감일</div>
          </div>
        </div>
        
        <!-- Description -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">회사 소개 및 업무 내용</h3>
          <p class="text-gray-700 leading-relaxed">${job.description}</p>
        </div>
        
        <!-- Requirements -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">지원 자격</h3>
          <ul class="space-y-2">
            ${job.requirements.map(req => `<li class="flex items-start space-x-2"><i class="fas fa-check text-green-600 mt-1"></i><span class="text-gray-700">${req}</span></li>`).join('')}
          </ul>
        </div>
        
        <!-- Preferred -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">우대 사항</h3>
          <ul class="space-y-2">
            ${job.preferred.map(pref => `<li class="flex items-start space-x-2"><i class="fas fa-star text-yellow-500 mt-1"></i><span class="text-gray-700">${pref}</span></li>`).join('')}
          </ul>
        </div>
        
        <!-- Benefits -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">복리후생</h3>
          <div class="grid md:grid-cols-2 gap-3">
            ${job.benefits.map(benefit => `<div class="flex items-center space-x-2"><i class="fas fa-gift text-purple-600"></i><span class="text-gray-700">${benefit}</span></div>`).join('')}
          </div>
        </div>
        
        <!-- Language Requirement -->
        <div class="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">
            <i class="fas fa-language text-yellow-600 mr-2"></i>언어 요구사항
          </h3>
          <p class="text-gray-700">한국어 ${job.korean_required} 이상 (외국인 근로자 지원 환영)</p>
        </div>
        
        <!-- Contact -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">연락처</h3>
          <div class="space-y-2">
            <div class="flex items-center space-x-3">
              <i class="fas fa-envelope text-gray-600"></i>
              <span class="text-gray-700">${job.contact.email}</span>
            </div>
            <div class="flex items-center space-x-3">
              <i class="fas fa-phone text-gray-600"></i>
              <span class="text-gray-700">${job.contact.phone}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex gap-4 pt-4 border-t">
          <button onclick="applyToJob(${job.id})" class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            <i class="fas fa-paper-plane mr-2"></i>지원하기
          </button>
          <button onclick="bookmarkJob(${job.id})" class="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
            <i class="fas fa-bookmark mr-2"></i>관심공고
          </button>
          <button onclick="shareJob(${job.id})" class="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
            <i class="fas fa-share mr-2"></i>공유
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal('job-detail-modal');
    }
  });
}

// Create Job Seeker Detail Modal  
function createJobSeekerDetailModal(person) {
  // Remove existing modal if any
  const existingModal = document.getElementById('jobseeker-detail-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'jobseeker-detail-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-2xl">${person.name.charAt(0)}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h2 class="text-2xl font-bold text-gray-900">${person.name}</h2>
                <span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">${person.nationality}</span>
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">${person.visa_status}</span>
              </div>
              <div class="flex items-center space-x-4 text-gray-600">
                <span><i class="fas fa-graduation-cap mr-1"></i>${person.major}</span>
                <span><i class="fas fa-briefcase mr-1"></i>${person.experience} 경력</span>
                <span><i class="fas fa-map-marker-alt mr-1"></i>${person.location}</span>
              </div>
            </div>
          </div>
          <button onclick="closeModal('jobseeker-detail-modal')" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Key Info -->
        <div class="grid md:grid-cols-4 gap-4 mb-6 p-4 bg-green-50 rounded-lg">
          <div class="text-center">
            <div class="text-lg font-bold text-green-600">${person.age}세</div>
            <div class="text-sm text-gray-600">나이</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-blue-600">${person.korean_level}</div>
            <div class="text-sm text-gray-600">한국어</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-purple-600">${person.salary_expectation}</div>
            <div class="text-sm text-gray-600">희망연봉</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-orange-600">${formatDate(person.visa_expiry)}</div>
            <div class="text-sm text-gray-600">비자만료</div>
          </div>
        </div>
        
        <!-- Bio -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">자기소개</h3>
          <p class="text-gray-700 leading-relaxed">${person.bio}</p>
        </div>
        
        <!-- Skills -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">보유 기술</h3>
          <div class="flex flex-wrap gap-2">
            ${person.skills.split(', ').map(skill => `<span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">${skill}</span>`).join('')}
          </div>
        </div>
        
        <!-- Education -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">학력</h3>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center space-x-3">
              <i class="fas fa-university text-gray-600"></i>
              <span class="font-medium">${person.education}</span>
            </div>
          </div>
        </div>
        
        <!-- Work Experience -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">경력 사항</h3>
          <div class="space-y-4">
            ${person.work_experience.map(exp => `
              <div class="border rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-semibold text-gray-900">${exp.position}</h4>
                  <span class="text-sm text-gray-500">${exp.period}</span>
                </div>
                <p class="text-blue-600 font-medium mb-2">${exp.company}</p>
                <p class="text-gray-700">${exp.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Certifications -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">자격증 및 인증</h3>
          <ul class="space-y-2">
            ${person.certifications.map(cert => `<li class="flex items-start space-x-2"><i class="fas fa-certificate text-yellow-500 mt-1"></i><span class="text-gray-700">${cert}</span></li>`).join('')}
          </ul>
        </div>
        
        <!-- Language Skills -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">
            <i class="fas fa-language text-blue-600 mr-2"></i>언어 능력
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <span class="font-medium">한국어:</span> ${person.korean_level}
            </div>
            <div>
              <span class="font-medium">영어:</span> ${person.english_level}
            </div>
          </div>
        </div>
        
        <!-- Portfolio -->
        ${person.portfolio_url ? `
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">포트폴리오</h3>
          <a href="${person.portfolio_url}" target="_blank" class="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800">
            <i class="fas fa-external-link-alt"></i>
            <span>온라인 포트폴리오 보기</span>
          </a>
        </div>
        ` : ''}
        
        <!-- Contact -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">연락처</h3>
          <div class="space-y-2">
            <div class="flex items-center space-x-3">
              <i class="fas fa-envelope text-gray-600"></i>
              <span class="text-gray-700">${person.contact.email}</span>
            </div>
            <div class="flex items-center space-x-3">
              <i class="fas fa-phone text-gray-600"></i>
              <span class="text-gray-700">${person.contact.phone}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex gap-4 pt-4 border-t">
          <button onclick="contactJobSeeker(${person.id})" class="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold">
            <i class="fas fa-envelope mr-2"></i>연락하기
          </button>
          <button onclick="bookmarkJobSeeker(${person.id})" class="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
            <i class="fas fa-bookmark mr-2"></i>관심구직자
          </button>
          <button onclick="shareJobSeeker(${person.id})" class="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
            <i class="fas fa-share mr-2"></i>공유
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal('jobseeker-detail-modal');
    }
  });
}

// Close Modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

// Action Functions (placeholders)
function applyToJob(jobId) {
  showNotification('지원이 완료되었습니다!', 'success');
  closeModal('job-detail-modal');
}

function bookmarkJob(jobId) {
  showNotification('관심공고에 추가되었습니다.', 'success');
}

function shareJob(jobId) {
  showNotification('공고가 공유되었습니다.', 'info');
}

function contactJobSeeker(personId) {
  showNotification('연락 요청이 전송되었습니다.', 'success');
  closeModal('jobseeker-detail-modal');
}

function bookmarkJobSeeker(personId) {
  showNotification('관심구직자에 추가되었습니다.', 'success');
}

function shareJobSeeker(personId) {
  showNotification('구직자 정보가 공유되었습니다.', 'info');
}

window.WOWCampus = {
  API,
  showNotification,
  formatDate,
  formatCurrency,
  timeAgo,
  viewJobDetail,
  viewJobSeekerDetail,
  loadJobSeekersPage,
  displayJobSeekersListings,
  updateLoginUI,
  handleLogout,
  checkLoginStatus,
  showTab,
  toggleProfileEdit,
  loadUserProfile,
  updateProfileCompletion,
  // New filter functions
  toggleAdvancedFilters,
  searchJobs,
  searchJobSeekers,
  applyJobFilters,
  applyJobSeekerFilters,
  clearAllFilters,
  removeActiveFilter,
  // New detail view functions
  showJobDetail,
  showJobSeekerDetail,
  closeModal
};

// Mobile Menu Toggle Function
function toggleMobileMenu() {
  console.log('📱 toggleMobileMenu 함수 호출됨');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  
  if (!mobileMenu) {
    console.error('❌ mobile-menu 요소를 찾을 수 없습니다');
    return;
  }
  
  if (mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.remove('hidden');
    console.log('✅ 모바일 메뉴 열림');
    // Change hamburger to X icon
    if (mobileMenuBtn) {
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-times text-2xl';
      }
    }
  } else {
    mobileMenu.classList.add('hidden');
    console.log('✅ 모바일 메뉴 닫힘');
    // Change X back to hamburger icon
    if (mobileMenuBtn) {
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-bars text-2xl';
      }
    }
  }
}

// 전역 스코프에 toggleMobileMenu 노출 (HTML onclick에서 접근 가능하도록)
window.toggleMobileMenu = toggleMobileMenu;

// Load Statistics Data for Main Page
async function loadStatisticsData() {
  try {
    // Get total counts from APIs
    const [jobsResponse, jobseekersResponse] = await Promise.all([
      API.jobs.getAll('', 1000), // Get all jobs for count
      API.jobseekers.getAll('', 1000) // Get all jobseekers for count
    ]);
    
    // Update statistics counters
    if (jobsResponse.success) {
      updateStatCounter('jobs', jobsResponse.data.length);
    }
    
    if (jobseekersResponse.success) {
      updateStatCounter('jobseekers', jobseekersResponse.data.length);
    }
    
    // For now, reviews and resumes remain 0 since we don't have those APIs yet
    updateStatCounter('reviews', 0);
    updateStatCounter('resumes', 0);
    
  } catch (error) {
    console.error('Failed to load statistics data:', error);
  }
}

// Update individual statistic counter with animation
function updateStatCounter(statType, count) {
  const statElement = document.querySelector(`[data-stat="${statType}"]`);
  if (!statElement) return;
  
  const startCount = parseInt(statElement.textContent) || 0;
  const endCount = count;
  const duration = 2000; // 2 seconds animation
  const startTime = Date.now();
  
  function animate() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentCount = Math.round(startCount + (endCount - startCount) * easeOutQuart);
    
    statElement.textContent = currentCount;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

// Newsletter Subscription Function
async function subscribeNewsletter() {
  const emailInput = document.getElementById('newsletter-email');
  if (!emailInput) return;
  
  const email = emailInput.value.trim();
  if (!email) {
    showNotification('이메일 주소를 입력해주세요.', 'error');
    return;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
    return;
  }
  
  try {
    // For now, just simulate newsletter subscription
    // In a real application, this would call an API endpoint
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Show success message
    showNotification('뉴스레터 구독이 완료되었습니다! 감사합니다.', 'success');
    
    // Clear the input
    emailInput.value = '';
    
    // Optional: Store subscription in localStorage for demo purposes
    const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
    if (!subscriptions.includes(email)) {
      subscriptions.push(email);
      localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
    }
    
  } catch (error) {
    console.error('Newsletter subscription failed:', error);
    showNotification('구독 처리 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
  }
}

// Language Change Function
function changeLanguage(lang) {
  // Prevent default link behavior
  event.preventDefault();
  
  // Store language preference
  localStorage.setItem('preferred_language', lang);
  
  // Simple language switching (for demo purposes)
  if (lang === 'en') {
    showNotification('Language changed to English. Full translation coming soon!', 'info');
  } else {
    showNotification('언어가 한국어로 변경되었습니다.', 'success');
  }
  
  // In a real application, you would:
  // 1. Load translated content from a language file
  // 2. Update all text elements on the page
  // 3. Possibly redirect to a localized version of the site
  
  console.log(`Language changed to: ${lang}`);
}

// Load saved language preference on page load
function loadLanguagePreference() {
  const savedLang = localStorage.getItem('preferred_language');
  if (savedLang) {
    console.log(`Loaded saved language preference: ${savedLang}`);
    // Apply the saved language (implementation would depend on your i18n setup)
  }
}

// Add Enter key support for newsletter input
document.addEventListener('DOMContentLoaded', function() {
  const newsletterInput = document.getElementById('newsletter-email');
  if (newsletterInput) {
    newsletterInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        subscribeNewsletter();
      }
    });
  }
  
  // Load language preference
  loadLanguagePreference();
});

// Load Latest Information for Main Page
async function loadLatestInformation() {
  try {
    // Load latest jobs
    const jobsResponse = await API.jobs.getAll('', 3); // Get latest 3 jobs
    if (jobsResponse.success && jobsResponse.data.length > 0) {
      updateLatestJobsSection(jobsResponse.data);
    }
    
    // Load latest jobseekers
    const jobseekersResponse = await API.jobseekers.getAll('', 3); // Get latest 3 jobseekers
    if (jobseekersResponse.success && jobseekersResponse.data.length > 0) {
      updateLatestJobseekersSection(jobseekersResponse.data);
    }
  } catch (error) {
    console.error('Failed to load latest information:', error);
  }
}

// Update Latest Jobs Section
function updateLatestJobsSection(jobs) {
  const latestJobsSection = document.querySelector('[data-section="latest-jobs"] .p-6.space-y-4');
  if (!latestJobsSection) return;
  
  // Keep the last "전체 구인정보 보기" link
  const viewAllLink = latestJobsSection.querySelector('.text-center:last-child');
  
  // Clear existing content but keep structure
  latestJobsSection.innerHTML = '';
  
  // Add new job listings
  jobs.forEach((job, index) => {
    const isLastItem = index === jobs.length - 1;
    const jobElement = document.createElement('div');
    jobElement.className = isLastItem ? 'pb-4' : 'border-b pb-4';
    jobElement.innerHTML = `
      <h4 class="font-semibold text-gray-900">${job.title}</h4>
      <p class="text-sm text-gray-600">${job.category || 'IT/소프트웨어'} • ${job.employment_type || '정규직'}</p>
      <p class="text-xs text-gray-500 mt-2">${job.company_name || job.company} • ${job.location}</p>
    `;
    latestJobsSection.appendChild(jobElement);
  });
  
  // Re-add the "전체 구인정보 보기" link
  if (viewAllLink) {
    latestJobsSection.appendChild(viewAllLink);
  } else {
    const linkElement = document.createElement('div');
    linkElement.className = 'text-center';
    linkElement.innerHTML = '<a href="/jobs" class="text-blue-600 hover:underline text-sm font-medium">전체 구인정보 보기</a>';
    latestJobsSection.appendChild(linkElement);
  }
  
  // Update count badge
  const countBadge = document.querySelector('[data-section="latest-jobs"] .bg-blue-600.text-white');
  if (countBadge) {
    countBadge.textContent = `${jobs.length}건`;
  }
}

// Update Latest Jobseekers Section  
function updateLatestJobseekersSection(jobseekers) {
  const latestJobseekersSection = document.querySelector('[data-section="latest-jobseekers"] .p-6.space-y-4');
  if (!latestJobseekersSection) return;
  
  // Keep the last "전체 구직정보 보기" link
  const viewAllLink = latestJobseekersSection.querySelector('.text-center:last-child');
  
  // Clear existing content but keep structure
  latestJobseekersSection.innerHTML = '';
  
  // Add new jobseeker listings
  jobseekers.forEach((person, index) => {
    const isLastItem = index === jobseekers.length - 1;
    const personElement = document.createElement('div');
    personElement.className = isLastItem ? 'pb-4' : 'border-b pb-4';
    personElement.innerHTML = `
      <h4 class="font-semibold text-gray-900">${person.first_name} ${person.last_name || ''} (${person.nationality})</h4>
      <p class="text-sm text-gray-600">${person.major || 'IT/소프트웨어'} • ${person.experience_years || '3'}년 경력</p>
      <p class="text-xs text-gray-500 mt-2">${person.skills || 'Java, React'} • ${person.preferred_location || person.current_location} 희망</p>
    `;
    latestJobseekersSection.appendChild(personElement);
  });
  
  // Re-add the "전체 구직정보 보기" link
  if (viewAllLink) {
    latestJobseekersSection.appendChild(viewAllLink);
  } else {
    const linkElement = document.createElement('div');
    linkElement.className = 'text-center';
    linkElement.innerHTML = '<a href="/jobseekers" class="text-green-600 hover:underline text-sm font-medium">전체 구직정보 보기</a>';
    latestJobseekersSection.appendChild(linkElement);
  }
  
  // Update count badge
  const countBadge = document.querySelector('[data-section="latest-jobseekers"] .bg-green-600.text-white');
  if (countBadge) {
    countBadge.textContent = `${jobseekers.length}건`;
  }
}

// Add mobile menu toggle event listener on page load
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // Close mobile menu when clicking on links
  const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        toggleMobileMenu();
      }
    });
  });
  
  // Load latest information if on main page
  if (window.location.pathname === '/') {
    loadLatestInformation();
    loadStatisticsData();
  }
});

// ===== LOGIN/SIGNUP MODAL FUNCTIONS =====

// 로그인 모달 표시
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // 폼 초기화
    const form = document.getElementById('login-form');
    if (form) {
      form.reset();
    }
  }
}

// 로그인 모달 숨기기
function hideLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

// 회원가입 모달 표시
function showSignupModal() {
  const modal = document.getElementById('signup-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // 폼 초기화
    const form = document.getElementById('signup-form');
    if (form) {
      form.reset();
    }
  }
}

// 회원가입 모달 숨기기
function hideSignupModal() {
  const modal = document.getElementById('signup-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

// 모달 관련 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
  // 기존 코드...
  
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      hideLoginModal();
      hideSignupModal();
    }
  });
  
  // 로그인 폼 처리
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // 회원가입 폼 처리
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
    
    // 비밀번호 확인 실시간 검증
    const passwordField = signupForm.querySelector('input[name="password"]');
    const confirmPasswordField = signupForm.querySelector('input[name="confirmPassword"]');
    const submitBtn = document.getElementById('signup-submit-btn');
    
    if (passwordField && confirmPasswordField && submitBtn) {
      function validatePasswords() {
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        
        if (confirmPassword && password !== confirmPassword) {
          confirmPasswordField.style.borderColor = '#f87171';
          confirmPasswordField.style.backgroundColor = '#fef2f2';
          submitBtn.disabled = true;
          submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
          confirmPasswordField.style.borderColor = '#d1d5db';
          confirmPasswordField.style.backgroundColor = 'white';
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }
      
      passwordField.addEventListener('input', validatePasswords);
      confirmPasswordField.addEventListener('input', validatePasswords);
    }
  }
});

// 로그인 처리 함수
async function handleLogin(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const loginData = {
    email: formData.get('email'),
    password: formData.get('password')
  };
  
  console.log('🔐 로그인 시도:', { email: loginData.email });
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    console.log('🔐 로그인 API 응답:', data);
    
    if (data.success && data.token && data.user) {
      // 사용자 정보와 토큰 저장
      saveUserToStorage(data.token, data.user);
      
      // UI 업데이트
      updateNavigationMenu();
      updateAuthButtons();
      
      // 성공 메시지
      showNotification(`환영합니다, ${data.user.name}님! (${getUserTypeLabel(data.user.user_type)})`, 'success');
      
      // 모달 닫기
      hideLoginModal();
      
      // 사용자 유형에 따른 리다이렉트
      setTimeout(() => {
        switch (data.user.user_type) {
          case 'jobseeker':
            if (window.location.pathname === '/') {
              window.location.href = '/jobseekers';
            }
            break;
          case 'company':
            if (window.location.pathname === '/') {
              window.location.href = '/jobs';
            }
            break;
          case 'agent':
            if (window.location.pathname === '/') {
              window.location.href = '/agents';
            }
            break;
          default:
            // 기본적으로는 현재 페이지 유지
            break;
        }
      }, 1500);
      
    } else {
      // 토큰 저장
      localStorage.setItem('wowcampus_token', data.token);
      authToken = data.token;
      
      // 모달 닫기
      hideLoginModal();
      
      // 성공 메시지
      showNotification('로그인되었습니다!', 'success');
      
      // UI 업데이트
      updateAuthUI();
      
      // 페이지 새로고침 (선택적)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } else {
      showNotification(data.message || '로그인에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('로그인 중 오류가 발생했습니다.', 'error');
  }
}

// 회원가입 처리 함수
async function handleSignup(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const signupData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    name: formData.get('name'),
    phone: formData.get('phone'),
    location: formData.get('location'),
    user_type: formData.get('user_type')
  };
  
  // 비밀번호 확인
  if (signupData.password !== signupData.confirmPassword) {
    showNotification('비밀번호가 일치하지 않습니다.', 'error');
    return;
  }
  
  // 비밀번호 길이 확인
  if (signupData.password.length < 6) {
    showNotification('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
    return;
  }
  
  console.log('📝 회원가입 시도:', { ...signupData, password: '***', confirmPassword: '***' });
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });
    
    const data = await response.json();
    console.log('📝 회원가입 API 응답:', data);
    
    if (data.success) {
      // 모달 닫기
      hideSignupModal();
      
      // 성공 메시지
      showNotification('회원가입이 완료되었습니다! 로그인해주세요.', 'success');
      
      // 로그인 모달 표시
      setTimeout(() => {
        showLoginModal();
        // 이메일 자동 입력
        const emailField = document.querySelector('#login-form input[name="email"]');
        if (emailField) {
          emailField.value = signupData.email;
        }
      }, 1500);
      
    } else {
      showNotification(data.message || '회원가입에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showNotification('회원가입 중 오류가 발생했습니다.', 'error');
  }
}

// ====================================
// 권한 기반 메뉴 시스템
// ====================================

// 사용자 유형별 메뉴 구성
const menuConfig = {
  guest: [
    { href: '/', label: '홈', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/jobs', label: '구인정보', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/jobseekers', label: '구직정보', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/study', label: '유학정보', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/statistics', label: '통계', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' }
  ],
  jobseeker: [
    { href: '/', label: '홈', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/jobs', label: '구인정보', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/jobseekers', label: '구직정보', class: 'text-green-600 font-medium' },
    { href: '/dashboard', label: '내 프로필', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/applications', label: '지원현황', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/statistics', label: '통계', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' }
  ],
  company: [
    { href: '/', label: '홈', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/jobseekers', label: '구직정보', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/jobs/manage', label: '채용공고 관리', class: 'text-blue-600 font-medium' },
    { href: '/applications/manage', label: '지원자 관리', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/dashboard', label: '기업 정보', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/statistics', label: '통계', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' }
  ],
  agent: [
    { href: '/', label: '홈', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/jobs', label: '구인정보', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/jobseekers', label: '구직정보', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/agents', label: '에이전트 대시보드', class: 'text-purple-600 font-medium' },
    { href: '/matching', label: '매칭 관리', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' },
    { href: '/statistics', label: '통계', class: 'text-gray-700 hover:text-blue-600 transition-colors font-medium' }
  ]
}

// 현재 사용자 정보 (전역 변수)
let currentUser = null

// 로그인 상태 확인 및 사용자 정보 로드
function loadUserFromStorage() {
  const token = localStorage.getItem('wowcampus_token')
  const userInfo = localStorage.getItem('wowcampus_user')
  
  if (token && userInfo) {
    try {
      // 간단한 토큰 검증 (실제로는 서버에서 검증해야 함)
      const tokenData = JSON.parse(atob(token))
      const now = Date.now()
      
      if (tokenData.exp && tokenData.exp > now) {
        currentUser = JSON.parse(userInfo)
        return currentUser
      } else {
        // 토큰 만료
        clearUserFromStorage()
        return null
      }
    } catch (error) {
      console.error('토큰 파싱 오류:', error)
      clearUserFromStorage()
      return null
    }
  }
  
  return null
}

// 로컬 스토리지에서 사용자 정보 제거
function clearUserFromStorage() {
  localStorage.removeItem('wowcampus_token')
  localStorage.removeItem('wowcampus_user')
  currentUser = null
}

// 사용자 정보를 로컬 스토리지에 저장
function saveUserToStorage(token, user) {
  localStorage.setItem('wowcampus_token', token)
  localStorage.setItem('wowcampus_user', JSON.stringify(user))
  currentUser = user
}

// 동적 메뉴 생성
function generateMenuHTML(userType = 'guest', currentPath = '/') {
  const menus = menuConfig[userType] || menuConfig.guest
  
  return menus.map(menu => {
    // 현재 페이지 활성화 상태 확인
    const isActive = currentPath === menu.href
    let cssClass = menu.class
    
    if (isActive) {
      // 현재 페이지는 활성 상태로 표시
      if (userType === 'jobseeker' && menu.href === '/jobseekers') {
        cssClass = 'text-green-600 font-medium'
      } else if (userType === 'company' && menu.href.includes('jobs')) {
        cssClass = 'text-blue-600 font-medium'
      } else if (userType === 'agent' && menu.href === '/agents') {
        cssClass = 'text-purple-600 font-medium'
      } else {
        cssClass = 'text-blue-600 font-medium'
      }
    }
    
    return `<a href="${menu.href}" class="${cssClass}">${menu.label}</a>`
  }).join('')
}

// 네비게이션 메뉴 업데이트
function updateNavigationMenu() {
  const user = loadUserFromStorage()
  const userType = user ? user.user_type : 'guest'
  const currentPath = window.location.pathname
  
  // 모든 페이지의 네비게이션 메뉴 찾기
  const navMenus = document.querySelectorAll('.nav-menu-container')
  
  navMenus.forEach(navMenu => {
    navMenu.innerHTML = generateMenuHTML(userType, currentPath)
  })
  
  console.log(`📋 Navigation updated for user type: ${userType}`)
}

// 인증 버튼 업데이트
function updateAuthButtons() {
  const user = loadUserFromStorage()
  const authContainer = document.getElementById('auth-buttons-container')
  
  if (!authContainer) return
  
  if (user) {
    // 로그인 상태: 사용자 메뉴 표시
    authContainer.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-br ${getUserTypeColor(user.user_type)} rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-sm">${user.name ? user.name[0] : 'U'}</span>
          </div>
          <span class="text-gray-700 font-medium">${user.name}</span>
          <span class="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">${getUserTypeLabel(user.user_type)}</span>
        </div>
        <button onclick="logout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
          로그아웃
        </button>
      </div>
    `
  } else {
    // 비로그인 상태: 로그인/회원가입 버튼 표시
    authContainer.innerHTML = `
      <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
        로그인
      </button>
      <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        회원가입
      </button>
    `
  }
}

// 사용자 유형별 색상 반환
function getUserTypeColor(userType) {
  switch (userType) {
    case 'jobseeker': return 'from-green-500 to-green-600'
    case 'company': return 'from-blue-500 to-blue-600'
    case 'agent': return 'from-purple-500 to-purple-600'
    default: return 'from-gray-500 to-gray-600'
  }
}

// 사용자 유형 라벨 반환
function getUserTypeLabel(userType) {
  switch (userType) {
    case 'jobseeker': return '구직자'
    case 'company': return '기업'
    case 'agent': return '에이전트'
    default: return '게스트'
  }
}

// 로그아웃 처리
function logout() {
  clearUserFromStorage()
  updateNavigationMenu()
  updateAuthButtons()
  showNotification('로그아웃되었습니다.', 'success')
  
  // 홈으로 리다이렉트
  if (window.location.pathname !== '/') {
    window.location.href = '/'
  }
}

// ====================================
// 프로필 관리 기능
// ====================================

// 구직자 목록 로드
async function loadJobSeekers(page = 1, limit = 10) {
  console.log('🚀 loadJobSeekers function called with:', { page, limit });
  
  try {
    const params = new URLSearchParams({
      user_type: 'jobseeker',
      page: page.toString(),
      limit: limit.toString()
    });
    
    console.log('📡 Making API request to:', `/api/profiles?${params}`);
    const response = await axios.get(`/api/profiles?${params}`);
    const { data, pagination } = response.data;
    
    displayJobSeekers(data, pagination);
    updateTotalCount(pagination.total_items);
  } catch (error) {
    console.error('Error loading job seekers:', error);
    showNotification('구직자 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    
    // Show empty state
    const container = document.getElementById('jobseekers-listings');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600">구직자 정보를 불러올 수 없습니다.</p>
          <button onclick="loadJobSeekers()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-refresh mr-2"></i>다시 시도
          </button>
        </div>
      `;
    }
  }
}

// 구직자 목록 표시
function displayJobSeekers(jobseekers, pagination) {
  const container = document.getElementById('jobseekers-listings');
  if (!container) return;
  
  if (!jobseekers || jobseekers.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-users text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">등록된 구직자가 없습니다.</p>
        <button onclick="showProfileModal('create')" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <i class="fas fa-plus mr-2"></i>첫 구직자 등록하기
        </button>
      </div>
    `;
    return;
  }
  
  const jobseekersHTML = jobseekers.map(jobseeker => {
    const profile = jobseeker.profile || {};
    
    return `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center mb-3">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4">
                <span class="text-white font-bold text-lg">${jobseeker.name ? jobseeker.name[0] : 'U'}</span>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">${jobseeker.name || '이름 없음'}</h3>
                <div class="flex items-center text-sm text-gray-600 mt-1">
                  <i class="fas fa-map-marker-alt mr-1"></i>
                  <span>${jobseeker.location || '위치 없음'}</span>
                  ${profile.nationality ? `<span class="ml-3"><i class="fas fa-flag mr-1"></i>${profile.nationality}</span>` : ''}
                </div>
              </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4 mb-4">
              ${profile.desired_job ? `
                <div>
                  <span class="text-sm font-medium text-gray-500">희망 직무</span>
                  <p class="text-gray-900">${profile.desired_job}</p>
                </div>
              ` : ''}
              
              ${profile.career_level ? `
                <div>
                  <span class="text-sm font-medium text-gray-500">경력</span>
                  <p class="text-gray-900">${profile.career_level}</p>
                </div>
              ` : ''}
              
              ${profile.skills ? `
                <div class="md:col-span-2">
                  <span class="text-sm font-medium text-gray-500">기술 스택</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    ${profile.skills.split(',').map(skill => 
                      `<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">${skill.trim()}</span>`
                    ).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <div class="text-xs text-gray-500 mb-3">
              등록일: ${jobseeker.created_at ? new Date(jobseeker.created_at).toLocaleDateString('ko-KR') : '알 수 없음'}
            </div>
          </div>
          
          <div class="flex flex-col gap-2 ml-4">
            <button onclick="viewProfile(${jobseeker.id})" class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
              <i class="fas fa-eye mr-1"></i>상세보기
            </button>
            <button onclick="editProfile(${jobseeker.id}, '${jobseeker.user_type}')" class="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors">
              <i class="fas fa-edit mr-1"></i>수정
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = jobseekersHTML;
}

// 총 개수 업데이트
function updateTotalCount(total) {
  const totalElement = document.getElementById('total-jobseekers');
  if (totalElement) {
    totalElement.textContent = total;
  }
}

// 프로필 모달 표시
function showProfileModal(mode, profileId = null) {
  const modal = document.getElementById('profile-modal');
  const title = document.getElementById('profile-modal-title');
  const form = document.getElementById('profile-form');
  
  if (!modal || !title || !form) return;
  
  // 모달 제목 설정
  if (mode === 'create') {
    title.textContent = '프로필 등록';
    form.reset();
  } else if (mode === 'edit') {
    title.textContent = '프로필 수정';
    // TODO: 기존 프로필 데이터 로드
  }
  
  // 모달 표시
  modal.classList.remove('hidden');
  
  // 이벤트 리스너 설정
  setupProfileFormListeners();
}

// 프로필 모달 숨김
function hideProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// 프로필 폼 이벤트 리스너 설정
function setupProfileFormListeners() {
  const userTypeSelect = document.getElementById('profile-user-type');
  const form = document.getElementById('profile-form');
  
  // 사용자 유형 변경 시 필드 업데이트
  if (userTypeSelect) {
    userTypeSelect.addEventListener('change', function() {
      updateProfileFields(this.value);
    });
  }
  
  // 폼 제출 처리
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }
}

// 프로필 필드 동적 생성
function updateProfileFields(userType) {
  const container = document.getElementById('profile-fields-container');
  if (!container) return;
  
  let fieldsHTML = '';
  
  if (userType === 'jobseeker') {
    fieldsHTML = `
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
          <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="이름을 입력하세요">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">희망 직무 *</label>
          <input type="text" name="desired_job" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="예: 소프트웨어 개발자">
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
          <input type="date" name="birth_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">성별</label>
          <select name="gender" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="">선택하세요</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">국적</label>
          <input type="text" name="nationality" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="예: 베트남">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비자 상태</label>
          <select name="visa_status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="">선택하세요</option>
            <option value="E-7">E-7 (특정활동)</option>
            <option value="E-9">E-9 (비전문취업)</option>
            <option value="F-2">F-2 (거주)</option>
            <option value="F-4">F-4 (재외동포)</option>
            <option value="F-5">F-5 (영주)</option>
            <option value="D-2">D-2 (유학)</option>
          </select>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">경력 수준</label>
          <select name="career_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="">선택하세요</option>
            <option value="신입">신입</option>
            <option value="경력 1년">경력 1년</option>
            <option value="경력 2년">경력 2년</option>
            <option value="경력 3년">경력 3년</option>
            <option value="경력 5년 이상">경력 5년 이상</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">한국어 수준</label>
          <select name="korean_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="">선택하세요</option>
            <option value="초급">초급 (기초 회화)</option>
            <option value="초중급">초중급 (간단 업무)</option>
            <option value="중급">중급 (일반 업무)</option>
            <option value="고급">고급 (유창한 소통)</option>
            <option value="원어민 수준">원어민 수준</option>
          </select>
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">기술 스택</label>
        <textarea name="skills" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="예: Java, Spring, React, MySQL (쉼표로 구분)"></textarea>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
        <textarea name="introduction" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="자신을 간략히 소개해주세요"></textarea>
      </div>
    `;
  } else if (userType === 'company') {
    fieldsHTML = `
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">회사명 *</label>
          <input type="text" name="company_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="회사명을 입력하세요">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">업종 *</label>
          <select name="business_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">선택하세요</option>
            <option value="IT/소프트웨어">IT/소프트웨어</option>
            <option value="제조업">제조업</option>
            <option value="서비스업">서비스업</option>
            <option value="건설업">건설업</option>
            <option value="유통업">유통업</option>
            <option value="금융업">금융업</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">직원 수</label>
          <select name="employee_count" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">선택하세요</option>
            <option value="1-10명">1-10명</option>
            <option value="11-50명">11-50명</option>
            <option value="51-100명">51-100명</option>
            <option value="101-300명">101-300명</option>
            <option value="300명 이상">300명 이상</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">설립년도</label>
          <input type="number" name="established_year" min="1900" max="2024" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="2020">
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">웹사이트</label>
        <input type="url" name="website" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://company.com">
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">복리후생</label>
        <textarea name="benefits" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 4대보험, 연차, 자유로운 출퇴근, 교육지원"></textarea>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">회사 소개</label>
        <textarea name="company_description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="회사에 대해 소개해주세요"></textarea>
      </div>
    `;
  } else if (userType === 'agent') {
    fieldsHTML = `
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">에이전시명 *</label>
          <input type="text" name="agency_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="에이전시명을 입력하세요">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">전문분야 *</label>
          <select name="specialization" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <option value="">선택하세요</option>
            <option value="IT/기술직">IT/기술직</option>
            <option value="제조업">제조업</option>
            <option value="서비스업">서비스업</option>
            <option value="의료/간병">의료/간병</option>
            <option value="농업/어업">농업/어업</option>
            <option value="유학/교육">유학/교육</option>
          </select>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">사업자등록번호</label>
          <input type="text" name="license_number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="123-45-67890">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">경력 연수</label>
          <select name="experience_years" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <option value="">선택하세요</option>
            <option value="1년 미만">1년 미만</option>
            <option value="1-3년">1-3년</option>
            <option value="3-5년">3-5년</option>
            <option value="5-10년">5-10년</option>
            <option value="10년 이상">10년 이상</option>
          </select>
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">서비스 지역</label>
        <input type="text" name="service_area" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="예: 베트남, 중국, 태국">
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">에이전시 소개</label>
        <textarea name="agency_description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="에이전시와 서비스에 대해 소개해주세요"></textarea>
      </div>
    `;
  }
  
  container.innerHTML = fieldsHTML;
}

// 프로필 폼 제출 처리
async function handleProfileSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const userType = formData.get('user_type');
  
  if (!userType) {
    showNotification('사용자 유형을 선택해주세요.', 'error');
    return;
  }
  
  // 수정 모드인지 확인
  const profileId = document.getElementById('profile-id')?.value;
  const userId = document.getElementById('profile-user-id')?.value;
  const isEditMode = profileId && userId;
  
  // 프로필 데이터 구성
  const profileData = {
    user_id: userId || `user_${Date.now()}`, // 수정 시 기존 user_id, 생성 시 새로운 ID
    user_type: userType,
    profile: {}
  };
  
  // 수정 모드라면 ID 포함
  if (isEditMode) {
    profileData.id = parseInt(profileId);
  }
  
  // 폼 데이터를 프로필 객체로 변환
  for (let [key, value] of formData.entries()) {
    if (key !== 'user_type' && value.trim() !== '') {
      profileData.profile[key] = value.trim();
    }
  }
  
  try {
    const response = await axios.post('/profile', profileData);
    
    if (response.data.success) {
      const message = isEditMode ? 
        '프로필이 성공적으로 수정되었습니다.' : 
        '프로필이 성공적으로 등록되었습니다.';
      
      showNotification(message, 'success');
      hideProfileModal();
      
      // 구직자 목록 새로고침 (구직자 페이지인 경우)
      if (window.location.pathname === '/jobseekers') {
        loadJobSeekers();
      }
    } else {
      showNotification(response.data.message || '프로필 저장에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('Profile save error:', error);
    showNotification('프로필 저장 중 오류가 발생했습니다.', 'error');
  }
}

// 전역 변수 - 현재 보고 있는 프로필 정보 저장
let currentProfileData = null;

// 프로필 상세보기
async function viewProfile(profileId) {
  try {
    const response = await axios.get(`/profile/${profileId}`);
    
    if (response.data.success) {
      currentProfileData = response.data.data;
      showProfileDetailModal(currentProfileData);
    } else {
      showNotification('프로필을 불러올 수 없습니다.', 'error');
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showNotification('프로필 불러오기 중 오류가 발생했습니다.', 'error');
  }
}

// 프로필 상세보기 모달 표시
function showProfileDetailModal(profileData) {
  const modal = document.getElementById('profile-detail-modal');
  const title = document.getElementById('profile-detail-title');
  const content = document.getElementById('profile-detail-content');
  const editBtn = document.getElementById('profile-detail-edit-btn');
  
  if (!modal || !title || !content) return;
  
  // 제목 설정
  title.textContent = `${profileData.name || '사용자'} 프로필`;
  
  // 수정 버튼에 데이터 설정
  if (editBtn) {
    editBtn.setAttribute('data-profile-id', profileData.id);
    editBtn.setAttribute('data-user-type', profileData.user_type);
  }
  
  // 프로필 내용 생성
  content.innerHTML = generateProfileDetailHTML(profileData);
  
  // 모달 표시
  modal.classList.remove('hidden');
}

// 프로필 상세정보 HTML 생성
function generateProfileDetailHTML(profile) {
  const userTypeLabels = {
    jobseeker: '구직자',
    company: '구인기업', 
    agent: '에이전트'
  };
  
  let detailHTML = `
    <div class="mb-8">
      <div class="flex items-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br ${getProfileGradient(profile.user_type)} rounded-full flex items-center justify-center mr-4">
          <span class="text-white font-bold text-2xl">${profile.name ? profile.name[0] : 'U'}</span>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">${profile.name || '이름 없음'}</h2>
          <div class="flex items-center text-gray-600 mt-1">
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-3">
              ${userTypeLabels[profile.user_type] || profile.user_type}
            </span>
            ${profile.location ? `<i class="fas fa-map-marker-alt mr-1"></i><span>${profile.location}</span>` : ''}
          </div>
        </div>
      </div>
      
      <div class="text-xs text-gray-500 mb-6">
        등록일: ${profile.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric', month: 'long', day: 'numeric', 
          hour: '2-digit', minute: '2-digit'
        }) : '알 수 없음'}
      </div>
    </div>
  `;
  
  if (profile.user_type === 'jobseeker') {
    detailHTML += generateJobseekerDetail(profile.profile || {});
  } else if (profile.user_type === 'company') {
    detailHTML += generateCompanyDetail(profile.profile || {});
  } else if (profile.user_type === 'agent') {
    detailHTML += generateAgentDetail(profile.profile || {});
  }
  
  return detailHTML;
}

// 구직자 상세정보 생성
function generateJobseekerDetail(profile) {
  return `
    <div class="grid lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">기본 정보</h3>
        
        ${profile.desired_job ? `
          <div class="bg-green-50 p-4 rounded-lg">
            <label class="block text-sm font-medium text-green-800 mb-1">희망 직무</label>
            <p class="text-green-900 font-semibold">${profile.desired_job}</p>
          </div>
        ` : ''}
        
        ${profile.birth_date ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">생년월일</label>
            <p class="text-gray-900">${new Date(profile.birth_date).toLocaleDateString('ko-KR')}</p>
          </div>
        ` : ''}
        
        ${profile.gender ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">성별</label>
            <p class="text-gray-900">${profile.gender}</p>
          </div>
        ` : ''}
        
        ${profile.nationality ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">국적</label>
            <p class="text-gray-900 flex items-center">
              <i class="fas fa-flag mr-2"></i>${profile.nationality}
            </p>
          </div>
        ` : ''}
        
        ${profile.visa_status ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">비자 상태</label>
            <p class="text-gray-900">${profile.visa_status}</p>
          </div>
        ` : ''}
      </div>
      
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">경력 및 능력</h3>
        
        ${profile.career_level ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">경력 수준</label>
            <p class="text-gray-900">${profile.career_level}</p>
          </div>
        ` : ''}
        
        ${profile.korean_level ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">한국어 수준</label>
            <p class="text-gray-900">${profile.korean_level}</p>
          </div>
        ` : ''}
        
        ${profile.skills ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-2">기술 스택</label>
            <div class="flex flex-wrap gap-2">
              ${profile.skills.split(',').map(skill => 
                `<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">${skill.trim()}</span>`
              ).join('')}
            </div>
          </div>
        ` : ''}
        
        ${profile.introduction ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-2">자기소개</label>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-900 leading-relaxed">${profile.introduction.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 회사 상세정보 생성
function generateCompanyDetail(profile) {
  return `
    <div class="grid lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">회사 정보</h3>
        
        ${profile.company_name ? `
          <div class="bg-blue-50 p-4 rounded-lg">
            <label class="block text-sm font-medium text-blue-800 mb-1">회사명</label>
            <p class="text-blue-900 font-semibold text-lg">${profile.company_name}</p>
          </div>
        ` : ''}
        
        ${profile.business_type ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">업종</label>
            <p class="text-gray-900">${profile.business_type}</p>
          </div>
        ` : ''}
        
        ${profile.employee_count ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">직원 수</label>
            <p class="text-gray-900 flex items-center">
              <i class="fas fa-users mr-2"></i>${profile.employee_count}
            </p>
          </div>
        ` : ''}
        
        ${profile.established_year ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">설립년도</label>
            <p class="text-gray-900">${profile.established_year}년</p>
          </div>
        ` : ''}
        
        ${profile.website ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">웹사이트</label>
            <p class="text-gray-900">
              <a href="${profile.website}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline flex items-center">
                <i class="fas fa-external-link-alt mr-2"></i>${profile.website}
              </a>
            </p>
          </div>
        ` : ''}
      </div>
      
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">추가 정보</h3>
        
        ${profile.benefits ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-2">복리후생</label>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-900 leading-relaxed">${profile.benefits.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        ` : ''}
        
        ${profile.company_description ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-2">회사 소개</label>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-900 leading-relaxed">${profile.company_description.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 에이전트 상세정보 생성
function generateAgentDetail(profile) {
  return `
    <div class="grid lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">에이전시 정보</h3>
        
        ${profile.agency_name ? `
          <div class="bg-purple-50 p-4 rounded-lg">
            <label class="block text-sm font-medium text-purple-800 mb-1">에이전시명</label>
            <p class="text-purple-900 font-semibold text-lg">${profile.agency_name}</p>
          </div>
        ` : ''}
        
        ${profile.specialization ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">전문분야</label>
            <p class="text-gray-900">${profile.specialization}</p>
          </div>
        ` : ''}
        
        ${profile.license_number ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">사업자등록번호</label>
            <p class="text-gray-900 font-mono">${profile.license_number}</p>
          </div>
        ` : ''}
        
        ${profile.experience_years ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">경력 연수</label>
            <p class="text-gray-900 flex items-center">
              <i class="fas fa-calendar-alt mr-2"></i>${profile.experience_years}
            </p>
          </div>
        ` : ''}
        
        ${profile.service_area ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">서비스 지역</label>
            <p class="text-gray-900 flex items-center">
              <i class="fas fa-globe mr-2"></i>${profile.service_area}
            </p>
          </div>
        ` : ''}
      </div>
      
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">추가 정보</h3>
        
        ${profile.agency_description ? `
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-2">에이전시 소개</label>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-900 leading-relaxed">${profile.agency_description.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 프로필 유형별 그라데이션 색상 반환
function getProfileGradient(userType) {
  switch (userType) {
    case 'jobseeker': return 'from-green-500 to-green-600';
    case 'company': return 'from-blue-500 to-blue-600';
    case 'agent': return 'from-purple-500 to-purple-600';
    default: return 'from-gray-500 to-gray-600';
  }
}

// 프로필 상세보기 모달 숨김
function hideProfileDetailModal() {
  const modal = document.getElementById('profile-detail-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  currentProfileData = null;
}

// 상세보기에서 수정 모드로 전환
function editProfileFromDetail() {
  if (!currentProfileData) return;
  
  hideProfileDetailModal();
  editProfile(currentProfileData.id, currentProfileData.user_type);
}

// 프로필 수정 (개선된 버전)
async function editProfile(profileId, userType) {
  try {
    const response = await axios.get(`/profile/${profileId}`);
    
    if (response.data.success) {
      const profileData = response.data.data;
      showProfileModal('edit', profileData);
      populateProfileForm(profileData);
    } else {
      showNotification('프로필을 불러올 수 없습니다.', 'error');
    }
  } catch (error) {
    console.error('Error loading profile for edit:', error);
    showNotification('프로필 불러오기 중 오류가 발생했습니다.', 'error');
  }
}

// 프로필 폼에 기존 데이터 채우기
function populateProfileForm(profileData) {
  if (!profileData) return;
  
  // 기본 정보 설정
  const userTypeSelect = document.getElementById('profile-user-type');
  if (userTypeSelect) {
    userTypeSelect.value = profileData.user_type;
    // 유저 타입 변경 이벤트 트리거
    userTypeSelect.dispatchEvent(new Event('change'));
  }
  
  // 숨겨진 필드들 설정
  const profileIdField = document.getElementById('profile-id');
  const userIdField = document.getElementById('profile-user-id');
  if (profileIdField) profileIdField.value = profileData.id;
  if (userIdField) userIdField.value = profileData.user_id;
  
  // 폼 필드들이 생성될 때까지 잠시 대기
  setTimeout(() => {
    const profile = profileData.profile || {};
    
    // 모든 폼 필드에 값 채우기
    Object.keys(profile).forEach(key => {
      const field = document.querySelector(`[name="${key}"]`);
      if (field && profile[key]) {
        field.value = profile[key];
      }
    });
    
    // 이름은 profile 객체가 아닌 최상위에 있을 수 있음
    if (profileData.name) {
      const nameField = document.querySelector('[name="name"]');
      if (nameField) nameField.value = profileData.name;
    }
  }, 100);
}

// 페이지 로드 시 구직자 목록 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 Current page path:', window.location.pathname);
  
  // 구직자 페이지인 경우 목록 로드
  if (window.location.pathname === '/jobseekers') {
    console.log('📋 Jobseekers page detected, loading profiles...');
    loadJobSeekers();
  } else {
    console.log('ℹ️ Not jobseekers page, skipping profile load');
  }
});

console.log('WOW-CAMPUS Work Platform JavaScript loaded successfully');