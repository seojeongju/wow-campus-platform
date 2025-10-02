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
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${getNotificationColors(type)}`;
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        ${getNotificationIcon(type)}
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <div class="ml-4 flex-shrink-0 flex">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // 5초 후 자동 제거
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function getNotificationColors(type) {
  const colors = {
    success: 'bg-green-50 border border-green-200 text-green-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800'
  };
  return colors[type] || colors.info;
}

function getNotificationIcon(type) {
  const icons = {
    success: '<i class="fas fa-check-circle text-green-400"></i>',
    error: '<i class="fas fa-exclamation-circle text-red-400"></i>',
    warning: '<i class="fas fa-exclamation-triangle text-yellow-400"></i>',
    info: '<i class="fas fa-info-circle text-blue-400"></i>'
  };
  return icons[type] || icons.info;
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
        const response = await axios.post('/auth/register', userData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    
    async login(credentials) {
      try {
        const response = await axios.post('/auth/login', credentials);
        if (response.data.success && response.data.token) {
          authToken = response.data.token;
          localStorage.setItem('wowcampus_token', authToken);
        }
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    
    async logout() {
      try {
        await axios.post('/auth/logout');
        authToken = null;
        localStorage.removeItem('wowcampus_token');
        return { success: true };
      } catch (error) {
        // 로그아웃은 실패해도 토큰 제거
        authToken = null;
        localStorage.removeItem('wowcampus_token');
        return { success: true };
      }
    },
    
    async getProfile() {
      try {
        const response = await axios.get('/auth/profile');
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
  
  if (currentPath === '/') {
    // 메인 페이지
    loadMainPageData();
    checkLoginStatus();
  } else if (currentPath === '/jobs') {
    // 구인정보 페이지
    loadJobsPage();
    checkLoginStatus(); // 각 페이지에서도 로그인 상태 확인하여 메뉴 제어
    // 페이지 로드 시 기본 구인정보 목록 표시
    setTimeout(() => {
      loadJobListings('');
    }, 500);
  } else if (currentPath === '/jobseekers') {
    // 구직정보 페이지
    loadJobSeekersPage();
    checkLoginStatus();
    // 페이지 로드 시 기본 구직정보 목록 표시
    setTimeout(() => {
      loadJobSeekerListings('');
    }, 500);
  } else if (currentPath === '/study') {
    // 유학정보 페이지
    loadStudyPage();
    checkLoginStatus();
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
function updateLoginUI(user) {
  console.log('로그인 UI 업데이트 시작:', user);
  
  // ID를 사용해 정확한 auth 버튼 컨테이너 선택
  const authButtons = document.getElementById('auth-buttons-container');
  console.log('auth-buttons-container 요소 찾음:', !!authButtons);
  
  if (authButtons) {
    console.log('기존 내용:', authButtons.innerHTML);
    authButtons.innerHTML = `
      <div class="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
        <i class="fas fa-user text-green-600"></i>
        <span class="text-green-800 font-medium">${user.name}님 반갑습니다!</span>
      </div>
      <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
        로그아웃
      </button>
      <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
        <i class="fas fa-bars text-xl"></i>
      </button>
    `;
    console.log('새로운 내용:', authButtons.innerHTML);
    console.log('로그인 UI 업데이트 완료');
    
    // 모바일 메뉴 재초기화
    initMobileMenu();
  } else {
    console.error('auth-buttons-container 요소를 찾을 수 없습니다!');
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
async function handleLogout() {
  try {
    await API.auth.logout();
    showNotification('로그아웃이 완료되었습니다.', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('로그아웃 오류:', error);
    // 로그아웃은 실패해도 클라이언트에서 처리
    authToken = null;
    localStorage.removeItem('wowcampus_token');
    showNotification('로그아웃이 완료되었습니다.', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

// 모바일 메뉴 초기화
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      
      // 아이콘 변경
      const icon = this.querySelector('i');
      if (mobileMenu.classList.contains('hidden')) {
        icon.className = 'fas fa-bars text-xl';
      } else {
        icon.className = 'fas fa-times text-xl';
      }
    });
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
          <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
          <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
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
  
  // 폼 제출 이벤트
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
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
          <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">전화번호 (선택)</label>
          <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">지역</label>
          <select name="region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
            <option value="">지역을 선택해주세요</option>
            <option value="서울">서울</option>
            <option value="경기도">경기도</option>
            <option value="강원도">강원도</option>
            <option value="충청도">충청도</option>
            <option value="경상도">경상도</option>
            <option value="전라도">전라도</option>
            <option value="제주도">제주도</option>
          </select>
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
  
  // 비밀번호 확인 실시간 검증
  const passwordInput = document.getElementById('signup-password');
  const passwordConfirmInput = document.getElementById('signup-password-confirm');
  const messageDiv = document.getElementById('password-match-message');
  const submitButton = modal.querySelector('button[type="submit"]');
  
  function validatePasswordMatch() {
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    
    if (!passwordConfirm) {
      messageDiv.style.display = 'none';
      submitButton.disabled = false;
      return;
    }
    
    if (password === passwordConfirm) {
      messageDiv.textContent = '✓ 비밀번호가 일치합니다';
      messageDiv.className = 'mt-1 text-sm text-green-600';
      messageDiv.style.display = 'block';
      passwordConfirmInput.className = 'w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500';
      submitButton.disabled = false;
    } else {
      messageDiv.textContent = '✗ 비밀번호가 일치하지 않습니다';
      messageDiv.className = 'mt-1 text-sm text-red-600';
      messageDiv.style.display = 'block';
      passwordConfirmInput.className = 'w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500';
      submitButton.disabled = true;
    }
  }
  
  passwordInput.addEventListener('input', validatePasswordMatch);
  passwordConfirmInput.addEventListener('input', validatePasswordMatch);
  
  // 폼 제출 이벤트
  document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

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
    
    if (response.success) {
      showNotification('로그인이 완료되었습니다.', 'success');
      // 올바른 모달 닫기 방법
      const modalElement = event.target.closest('div[id^="loginModal"]');
      if (modalElement) {
        modalElement.remove();
      }
      // 로그인 성공 후 UI 즉시 업데이트
      console.log('로그인 성공 - 토큰 저장됨:', authToken);
      console.log('로그인 성공 - 사용자 정보:', response.user);
      
      if (response.user) {
        updateLoginUI(response.user);
      } else {
        // 사용자 정보가 없으면 다시 가져오기
        setTimeout(() => {
          console.log('사용자 정보 없음 - checkLoginStatus 호출');
          checkLoginStatus();
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
    password: password
  };
  
  try {
    const response = await API.auth.register(userData);
    
    if (response.success) {
      showNotification('회원가입이 완료되었습니다!', 'success');
      
      // 모달 닫기
      const modalElement = event.target.closest('div[id^="signupModal"]');
      if (modalElement) {
        modalElement.remove();
      }
      
      // 자동 로그인 시도
      try {
        const loginResponse = await API.auth.login({
          email: userData.email,
          password: userData.password
        });
        
        if (loginResponse.success) {
          showNotification('자동 로그인 되었습니다!', 'success');
          updateLoginUI(loginResponse.user);
        } else {
          showNotification('자동 로그인에 실패했습니다. 직접 로그인해주세요.', 'warning');
        }
      } catch (loginError) {
        showNotification('자동 로그인에 실패했습니다. 직접 로그인해주세요.', 'warning');
      }
    } else {
      showNotification(response.message || '회원가입에 실패했습니다.', 'error');
    }
  } catch (error) {
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

// 로그인 UI 업데이트
function updateLoginUI(user) {
  // 네비게이션 메뉴도 함께 업데이트
  updateNavigationMenus(user);
  
  // 인증 버튼 컨테이너 찾기
  const authButtons = document.getElementById('auth-buttons-container');
  
  if (!authButtons) {
    // ID가 없다면 class로 찾기 시도
    const authButtonsClass = document.querySelector('.flex.items-center.space-x-3');
    
    if (authButtonsClass && authButtonsClass.innerHTML.includes('로그인')) {
      if (user.user_type === 'jobseeker') {
        authButtonsClass.innerHTML = `
          <span class="text-gray-700">안녕하세요, <strong>${user.name}</strong>님!</span>
          <a href="/dashboard" class="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
            <i class="fas fa-tachometer-alt mr-2"></i>대시보드
          </a>
          <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
            로그아웃
          </button>
          <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
            <i class="fas fa-bars text-xl"></i>
          </button>
        `;
      } else if (user.user_type === 'employer') {
        authButtonsClass.innerHTML = `
          <span class="text-gray-700">안녕하세요, <strong>${user.name}</strong>님!</span>
          <a href="/employer-dashboard" class="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium">
            <i class="fas fa-building mr-2"></i>기업 대시보드
          </a>
          <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
            로그아웃
          </button>
          <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
            <i class="fas fa-bars text-xl"></i>
          </button>
        `;
      } else {
        authButtonsClass.innerHTML = `
          <span class="text-gray-700">안녕하세요, <strong>${user.name}</strong>님!</span>
          <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
            로그아웃
          </button>
          <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
            <i class="fas fa-bars text-xl"></i>
          </button>
        `;
      }
      return;
    }
    console.warn('Auth buttons container not found');
    return;
  }
  
  // 로그인된 상태의 UI로 변경 - 사용자 타입별 대시보드 버튼 추가
  if (user.user_type === 'jobseeker') {
    authButtons.innerHTML = `
      <span class="text-gray-700">안녕하세요, <strong>${user.name}</strong>님!</span>
      <a href="/dashboard" class="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
        <i class="fas fa-tachometer-alt mr-2"></i>대시보드
      </a>
      <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
        로그아웃
      </button>
      <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
        <i class="fas fa-bars text-xl"></i>
      </button>
    `;
  } else if (user.user_type === 'employer') {
    authButtons.innerHTML = `
      <span class="text-gray-700">안녕하세요, <strong>${user.name}</strong>님!</span>
      <a href="/employer-dashboard" class="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium">
        <i class="fas fa-building mr-2"></i>기업 대시보드
      </a>
      <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
        로그아웃
      </button>
      <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
        <i class="fas fa-bars text-xl"></i>
      </button>
    `;
  } else {
    authButtons.innerHTML = `
      <span class="text-gray-700">안녕하세요, <strong>${user.name}</strong>님!</span>
      <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
        로그아웃
      </button>
      <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
        <i class="fas fa-bars text-xl"></i>
      </button>
    `;
  }
}

// 로그아웃 처리
async function handleLogout() {
  try {
    await API.auth.logout();
    showNotification('로그아웃 되었습니다.', 'info');
    
    // 에이전트 메뉴를 다시 표시 (로그아웃 시 모든 메뉴 표시)
    updateNavigationMenus(null);
    
    // UI를 로그아웃 상태로 복원
    const authButtons = document.getElementById('auth-buttons-container') || document.querySelector('.flex.items-center.space-x-3');
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
    }
  } catch (error) {
    showNotification('로그아웃 중 오류가 발생했습니다.', 'error');
  }
}

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

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(checkLoginStatus, 500); // DOM이 완전히 로드된 후 실행
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
    
    // Salary Range
    const salaryRanges = advancedSection.querySelectorAll('input[name="salary_range"]:checked');
    salaryRanges.forEach(input => params.append('salary_range', input.value));
    
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

console.log('WOW-CAMPUS Work Platform JavaScript loaded successfully');