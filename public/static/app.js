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
        // 로그인 페이지로 리다이렉트 또는 로그인 모달 표시
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
    },
    
    async updateProfile(profileData) {
      try {
        const response = await axios.put('/auth/profile', profileData);
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
    },
    
    async create(jobData) {
      try {
        const response = await axios.post('/jobs', jobData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    
    async update(id, jobData) {
      try {
        const response = await axios.put(`/jobs/${id}`, jobData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    
    async delete(id) {
      try {
        const response = await axios.delete(`/jobs/${id}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    
    async getByCompany(companyId, params = {}) {
      try {
        const response = await axios.get(`/jobs/company/${companyId}`, { params });
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    }
  }
};

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
  // 현재 페이지에 따른 초기화
  const path = window.location.pathname;
  
  if (path === '/') {
    initHomePage();
  }
  
  // 전역 이벤트 리스너
  setupGlobalEventListeners();
});

function initHomePage() {
  console.log('WOW-CAMPUS Work Platform initialized');
  
  // 최신 구인공고 미리보기 로드
  loadLatestJobs();
  
  // 실시간 통계 업데이트
  loadStatistics();
  
  // 헤더 버튼 이벤트 리스너
  setupHeaderButtons();
}

async function loadLatestJobs() {
  try {
    const response = await API.jobs.getAll({ limit: 2, sort: 'created_at', order: 'desc' });
    if (response.success && response.data.length > 0) {
      displayLatestJobsInSection(response.data);
    }
  } catch (error) {
    console.error('Failed to load latest jobs:', error);
  }
}

async function loadStatistics() {
  try {
    // 실제 통계 데이터 로드
    const [jobsResponse] = await Promise.all([
      API.jobs.getAll({ limit: 1 })
    ]);
    
    if (jobsResponse.success) {
      updateStatistics({
        jobs: jobsResponse.total || 0,
        jobseekers: 14, // 임시 데이터
        reviews: 0,
        resumes: 0
      });
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
}

function displayLatestJobsInSection(jobs) {
  // 최신 구인정보 섹션의 실제 데이터로 업데이트
  const jobsList = document.querySelector('[data-section="latest-jobs"] .space-y-4');
  if (!jobsList) return;
  
  const jobsHtml = jobs.map(job => `
    <div class="border-b pb-4">
      <h4 class="font-semibold text-gray-900">${job.title}</h4>
      <p class="text-sm text-gray-600">${job.job_category} • ${job.experience_level}</p>
      <p class="text-xs text-gray-500 mt-2">${job.company_name}</p>
    </div>
  `).join('');
  
  jobsList.innerHTML = jobsHtml + `
    <div class="text-center">
      <button class="text-blue-600 hover:underline text-sm" onclick="window.location.href='/api/jobs'">
        본 구인정보 보기
      </button>
    </div>
  `;
}

function updateStatistics(stats) {
  const statisticsElements = document.querySelectorAll('[data-stat]');
  
  statisticsElements.forEach(el => {
    const statType = el.dataset.stat;
    if (stats[statType] !== undefined) {
      el.textContent = stats[statType];
    }
  });
}

function setupHeaderButtons() {
  // 로그인 버튼
  const loginBtn = document.querySelector('button:contains("로그인")');
  if (loginBtn) {
    loginBtn.addEventListener('click', showLoginModal);
  }
  
  // 회원가입 버튼
  const signupBtn = document.querySelector('button:contains("회원가입")');  
  if (signupBtn) {
    signupBtn.addEventListener('click', showSignupModal);
  }
  
  // 히어로 섹션 버튼들
  const jobsBtn = document.querySelector('button:contains("구인정보 보기")');
  if (jobsBtn) {
    jobsBtn.addEventListener('click', () => {
      window.location.href = '/api/jobs';
    });
  }
  
  const jobseekersBtn = document.querySelector('button:contains("본 구직자 보기")');
  if (jobseekersBtn) {
    jobseekersBtn.addEventListener('click', () => {
      showNotification('구직자 목록 기능이 곧 추가될 예정입니다.', 'info');
    });
  }
}

function showLoginModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">로그인</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="loginForm" class="space-y-4">
        <div>
          <label class="form-label">이메일</label>
          <input type="email" name="email" class="form-input" required>
        </div>
        
        <div>
          <label class="form-label">비밀번호</label>
          <input type="password" name="password" class="form-input" required>
        </div>
        
        <button type="submit" class="w-full btn-primary">
          로그인
        </button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 폼 제출 이벤트
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function showSignupModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content p-6 max-w-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">회원가입</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="signupForm" class="space-y-4">
        <div>
          <label class="form-label">사용자 유형</label>
          <select name="user_type" class="form-select" required>
            <option value="">선택해주세요</option>
            <option value="company">구인기업</option>
            <option value="jobseeker">구직자</option>
            <option value="agent">에이전트</option>
          </select>
        </div>
        
        <div>
          <label class="form-label">이름</label>
          <input type="text" name="name" class="form-input" required>
        </div>
        
        <div>
          <label class="form-label">이메일</label>
          <input type="email" name="email" class="form-input" required>
        </div>
        
        <div>
          <label class="form-label">전화번호 (선택)</label>
          <input type="tel" name="phone" class="form-input">
        </div>
        
        <div>
          <label class="form-label">비밀번호</label>
          <input type="password" name="password" class="form-input" required>
        </div>
        
        <button type="submit" class="w-full btn-primary">
          회원가입
        </button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 폼 제출 이벤트
  document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

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
      event.target.closest('.modal-overlay').remove();
      // 페이지 새로고침 또는 리다이렉트
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
      event.target.closest('.modal-overlay').remove();
    } else {
      showNotification(response.message || '회원가입에 실패했습니다.', 'error');
    }
  } catch (error) {
    showNotification(error.message || '회원가입 중 오류가 발생했습니다.', 'error');
  }
}

function viewJob(jobId) {
  window.location.href = `/jobs/${jobId}`;
}

function setupGlobalEventListeners() {
  // 검색 폼 처리
  const searchForm = document.getElementById('job-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleJobSearch);
  }
  
  // 모바일 메뉴 토글
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

async function handleJobSearch(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const searchParams = {
    keyword: formData.get('keyword'),
    location: formData.get('location'),
    job_category: formData.get('job_category'),
    job_type: formData.get('job_type')
  };
  
  // 빈 값 제거
  Object.keys(searchParams).forEach(key => {
    if (!searchParams[key]) delete searchParams[key];
  });
  
  // 검색 결과 페이지로 이동
  const queryString = new URLSearchParams(searchParams).toString();
  window.location.href = `/jobs${queryString ? '?' + queryString : ''}`;
}

// 전역 함수들
window.WOWCampus = {
  API,
  showNotification,
  formatDate,
  formatCurrency,
  timeAgo,
  viewJob
};

console.log('WOW-CAMPUS Work Platform JavaScript loaded successfully');