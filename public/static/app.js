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
  } else if (currentPath === '/study') {
    // 유학정보 페이지
    loadStudyPage();
  } else if (currentPath === '/agents') {
    // 에이전트 페이지
    loadAgentsPage();
  } else if (currentPath === '/statistics') {
    // 통계 페이지
    loadStatisticsPage();
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

// 로그인 상태 확인
function checkLoginStatus() {
  console.log('checkLoginStatus: {token: ' + !!authToken + ', user: {}, hasId: false}');
  
  if (authToken) {
    console.log('로그인 상태 - UI 업데이트');
    // 로그인된 상태
    // UI 업데이트 로직
  } else {
    console.log('로그아웃 상태 - UI 업데이트');
    // 로그아웃된 상태
    // UI 업데이트 로직
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
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">로그인</h2>
        <button onclick="this.closest('div[class*=\"fixed\"]').remove()" class="text-gray-500 hover:text-gray-700">
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
        
        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          로그인
        </button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 폼 제출 이벤트
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// 회원가입 모달 표시
function showSignupModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
        <button onclick="this.closest('div[class*=\"fixed\"]').remove()" class="text-gray-500 hover:text-gray-700">
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
          <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
          <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
        </div>
        
        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          회원가입
        </button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
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
  
  try {
    const response = await API.auth.login(credentials);
    
    if (response.success) {
      showNotification('로그인이 완료되었습니다.', 'success');
      event.target.closest('div[class*="fixed"]').remove();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showNotification(response.message || '로그인에 실패했습니다.', 'error');
    }
  } catch (error) {
    showNotification(error.message || '로그인 중 오류가 발생했습니다.', 'error');
  }
}

// 회원가입 처리
async function handleSignup(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const userData = {
    user_type: formData.get('user_type'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password')
  };
  
  try {
    const response = await API.auth.register(userData);
    
    if (response.success) {
      showNotification('회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.', 'success');
      event.target.closest('div[class*="fixed"]').remove();
    } else {
      showNotification(response.message || '회원가입에 실패했습니다.', 'error');
    }
  } catch (error) {
    showNotification(error.message || '회원가입 중 오류가 발생했습니다.', 'error');
  }
}

// 전역 함수들
window.WOWCampus = {
  API,
  showNotification,
  formatDate,
  formatCurrency,
  timeAgo,
  viewJobDetail,
  viewJobSeekerDetail
};

console.log('WOW-CAMPUS Work Platform JavaScript loaded successfully');