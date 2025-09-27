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
}

async function loadLatestJobs() {
  try {
    const response = await API.jobs.getAll({ limit: 6, sort: 'created_at', order: 'desc' });
    if (response.success && response.data.length > 0) {
      displayLatestJobs(response.data);
    }
  } catch (error) {
    console.error('Failed to load latest jobs:', error);
  }
}

function displayLatestJobs(jobs) {
  const container = document.getElementById('latest-jobs');
  if (!container) return;
  
  container.innerHTML = `
    <h3 class="text-2xl font-semibold mb-6 text-center">최신 구인공고</h3>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${jobs.map(job => `
        <div class="bg-white p-6 rounded-lg shadow-md hover-scale cursor-pointer" onclick="viewJob(${job.id})">
          <h4 class="text-lg font-semibold mb-2 text-blue-600">${job.title}</h4>
          <p class="text-gray-600 mb-2">${job.company_name}</p>
          <p class="text-sm text-gray-500 mb-3">${job.location} • ${job.job_type}</p>
          <p class="text-sm text-gray-700 mb-4">${job.description.substring(0, 100)}...</p>
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}</span>
            <span>${timeAgo(job.created_at)}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="text-center mt-8">
      <a href="/jobs" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        모든 구인공고 보기
      </a>
    </div>
  `;
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