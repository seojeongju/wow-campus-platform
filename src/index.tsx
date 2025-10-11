import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import { HTTPException } from 'hono/http-exception'

import type { Bindings, Variables } from './types/env'
import { renderer } from './renderer'

// Import routes
import authRoutes from './routes/auth'
import jobRoutes from './routes/jobs'
import jobseekersRoutes from './routes/jobseekers'
import { matching } from './routes/matching'

// Import middleware
import { corsMiddleware, apiCors } from './middleware/cors'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 🔐 사용자 권한 레벨 정의
const USER_LEVELS = {
  GUEST: 0,      // 비로그인 사용자
  JOBSEEKER: 1,  // 구직자
  STUDENT: 1,    // 유학생 (구직자와 동일 레벨)
  COMPANY: 2,    // 기업
  AGENT: 3,      // 에이전트
  ADMIN: 4       // 관리자
} as const

// 사용자 타입별 권한 매핑
const USER_TYPE_TO_LEVEL = {
  guest: USER_LEVELS.GUEST,
  jobseeker: USER_LEVELS.JOBSEEKER,
  student: USER_LEVELS.STUDENT,
  company: USER_LEVELS.COMPANY,
  agent: USER_LEVELS.AGENT,
  admin: USER_LEVELS.ADMIN
} as const

// 🛡️ 권한 체크 미들웨어
const requireAuth = (minLevel: number = USER_LEVELS.JOBSEEKER) => {
  return async (c: any, next: any) => {
    // 개발 환경에서는 임시로 권한 체크 통과 (실제로는 JWT 토큰 검증)
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token && minLevel > USER_LEVELS.GUEST) {
      // 로그인이 필요한 페이지인 경우 로그인 페이지로 리디렉션
      return c.redirect('/?login=required')
    }
    
    // 임시로 사용자 정보 설정 (실제로는 JWT에서 파싱)
    c.set('user', {
      id: 'temp_user',
      email: 'temp@example.com',
      user_type: 'jobseeker',
      level: USER_TYPE_TO_LEVEL.jobseeker
    })
    
    const user = c.get('user')
    if (user && user.level < minLevel) {
      return c.json({ error: 'Access Denied - Insufficient permissions' }, 403)
    }
    
    await next()
  }
}

// 🎯 권한별 접근 가능 라우트 정의
const ROUTE_PERMISSIONS = {
  // 게스트 (레벨 0) - 모든 사용자 접근 가능
  PUBLIC: [
    '/', '/about', '/features', '/statistics', '/study',
    '/faq', '/guide', '/contact', '/notice', '/blog'
  ],
  
  // 구직자 (레벨 1) 이상
  JOBSEEKER: [
    '/jobseekers', '/jobseekers/profile', '/jobseekers/applications',
    '/jobs/apply', '/matching/jobseeker'
  ],
  
  // 유학생 (레벨 1) 이상
  STUDENT: [
    '/study', '/study/programs', '/study/applications', '/study/profile',
    '/matching/student', '/study/guide', '/study/visa', '/study/scholarship'
  ],
  
  // 기업 (레벨 2) 이상  
  COMPANY: [
    '/jobs/post', '/jobs/manage', '/jobs/applicants',
    '/matching/company', '/company/dashboard'
  ],
  
  // 에이전트 (레벨 3) 이상
  AGENT: [
    '/agents', '/agents/dashboard', '/agents/clients',
    '/matching/agent', '/consulting'
  ],
  
  // 관리자 (레벨 4)
  ADMIN: [
    '/admin', '/admin/users', '/admin/content',
    '/admin/statistics', '/admin/settings'
  ]
}

// 🔍 사용자별 기능 접근 권한 체크 함수
const hasPermission = (userLevel: number, requiredLevel: number): boolean => {
  return userLevel >= requiredLevel
}

// 🎨 사용자별 UI 컴포넌트 렌더링 함수
const renderUserSpecificUI = (userType: string = 'guest') => {
  const level = USER_TYPE_TO_LEVEL[userType as keyof typeof USER_TYPE_TO_LEVEL] || USER_LEVELS.GUEST
  
  return {
    showJobApplications: level >= USER_LEVELS.JOBSEEKER,
    showJobPosting: level >= USER_LEVELS.COMPANY,
    showAgentTools: level >= USER_LEVELS.AGENT,
    showAdminPanel: level >= USER_LEVELS.ADMIN,
    canViewDetailedJobInfo: level >= USER_LEVELS.JOBSEEKER,
    canContactCompanies: level >= USER_LEVELS.JOBSEEKER,
    canPostJobs: level >= USER_LEVELS.COMPANY,
    canManageUsers: level >= USER_LEVELS.ADMIN,
    userLevel: level,
    userType: userType
  }
}

// Global middleware
app.use('*', logger())

// Static files serving - temporarily return placeholder for development
app.get('/static/app.js', (c) => {
  const jsContent = `
    // WOW-CAMPUS App.js - Inline version for development
    console.log('App.js loaded successfully!');
    
    // 🔐 인증 관련 전역 변수
    let authToken = localStorage.getItem('wowcampus_token');
    
    // 🎯 통합된 인증 UI 업데이트 함수
    function updateAuthUI(user = null) {
      console.log('updateAuthUI 호출됨:', user ? \`\${user.name} (\${user.user_type})\` : '로그아웃 상태');
      
      const authButtons = document.getElementById('auth-buttons-container');
      if (!authButtons) {
        console.warn('auth-buttons-container를 찾을 수 없습니다');
        return;
      }
      
      if (user) {
        // 로그인 상태 UI
        console.log(\`\${user.name}님 로그인 상태로 UI 업데이트\`);
        
        const dashboardConfig = {
          jobseeker: { link: '/jobseekers', color: 'green', icon: 'fa-user-tie', name: '구직자 대시보드' },
          company: { link: '/jobs', color: 'purple', icon: 'fa-building', name: '기업 대시보드' },
          agent: { link: '/agents', color: 'blue', icon: 'fa-handshake', name: '에이전트 대시보드' },
          admin: { link: '/statistics', color: 'red', icon: 'fa-chart-line', name: '관리자 대시보드' }
        };
        
        const config = dashboardConfig[user.user_type] || { 
          link: '/', color: 'gray', icon: 'fa-home', name: '메인 페이지' 
        };
        
        const userTypeColors = {
          jobseeker: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
          company: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
          agent: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
          admin: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' }
        };
        
        const userColors = userTypeColors[user.user_type] || userTypeColors.jobseeker;
        
        authButtons.innerHTML = '' +
          '<div class="flex items-center space-x-2 ' + userColors.bg + ' ' + userColors.border + ' px-3 py-2 rounded-lg">' +
            '<i class="fas fa-user ' + userColors.icon + '"></i>' +
            '<span class="' + userColors.text + ' font-medium">' + user.name + '님</span>' +
            '<span class="text-xs ' + userColors.text + ' opacity-75">(' + getUserTypeLabel(user.user_type) + ')</span>' +
          '</div>' +
          '<a href="' + config.link + '" class="px-4 py-2 text-' + config.color + '-600 border border-' + config.color + '-600 rounded-lg hover:bg-' + config.color + '-50 transition-colors font-medium" title="' + config.name + '">' +
            '<i class="fas ' + config.icon + ' mr-1"></i>대시보드' +
          '</a>' +
          '<button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium" title="로그아웃">' +
            '<i class="fas fa-sign-out-alt mr-1"></i>로그아웃' +
          '</button>';
        
        window.currentUser = user;
        
        // 동적 메뉴 업데이트
        updateNavigationMenu(user);
        
        // 서비스 드롭다운 메뉴 업데이트 (메인 페이지용)
        updateServiceDropdownMenu(user);
        
        console.log('로그인 UI 업데이트 완료');
        
      } else {
        // 로그아웃 상태 UI
        console.log('로그아웃 상태로 UI 업데이트');
        
        authButtons.innerHTML = \`
          <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            <i class="fas fa-sign-in-alt mr-1"></i>로그인
          </button>
          <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <i class="fas fa-user-plus mr-1"></i>회원가입
          </button>
        \`;
        
        window.currentUser = null;
        
        // 동적 메뉴를 게스트 상태로 업데이트
        updateNavigationMenu(null);
        
        // 서비스 드롭다운 메뉴를 게스트 상태로 업데이트
        updateServiceDropdownMenu(null);
        
        console.log('로그아웃 UI 업데이트 완료');
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
    
    // 🔐 로그인 모달 표시
    function showLoginModal() {
      console.log('로그인 모달 호출됨');
      
      // 기존 모달이 있으면 제거
      const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"]');
      if (existingModal) {
        existingModal.remove();
      }
      
      const modalId = 'loginModal_' + Date.now();
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
      modal.style.zIndex = '9999'; // 매우 높은 z-index
      modal.innerHTML = \`
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">로그인</h2>
            <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form id="loginForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이메일을 입력하세요" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 입력하세요" />
            </div>
            
            <div class="flex space-x-3">
              <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                취소
              </button>
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                로그인
              </button>
            </div>
            
{/* 아이디/비밀번호 찾기 링크 */}
            <div class="mt-4 text-center text-sm">
              <div class="flex justify-center space-x-4">
                <button type="button" class="find-email-btn text-blue-600 hover:text-blue-800 underline">
                  이메일 찾기
                </button>
                <span class="text-gray-400">|</span>
                <button type="button" class="find-password-btn text-blue-600 hover:text-blue-800 underline">
                  비밀번호 찾기
                </button>
              </div>
            </div>
          </form>
        </div>
      \`;
      
      // 페이지 스크롤 및 상호작용 비활성화
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      document.body.appendChild(modal);
      
      // 모든 클릭 이벤트 완전 차단 (모달 외부)
      const stopAllEvents = function(event) {
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent.contains(event.target)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      };
      
      // 강력한 이벤트 차단 - 캡처링과 버블링 단계 모두에서 차단
      document.addEventListener('click', stopAllEvents, true);
      document.addEventListener('mousedown', stopAllEvents, true);
      document.addEventListener('mouseup', stopAllEvents, true);
      document.addEventListener('touchstart', stopAllEvents, true);
      document.addEventListener('touchend', stopAllEvents, true);
      
      // ESC 키로 모달 닫기
      const handleEscape = function(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeModal(modal);
        }
      };
      document.addEventListener('keydown', handleEscape, true);
      
      // 닫기 버튼 이벤트 - 직접 이벤트 리스너 추가
      const closeBtn = modal.querySelector('.close-modal-btn');
      closeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
      }, true);
      
      // 취소 버튼 이벤트 - 직접 이벤트 리스너 추가
      const cancelBtn = modal.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
      }, true);
      
      // 폼 제출 이벤트
      const loginForm = document.getElementById('loginForm');
      loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleLogin(event);
      }, true);
      
      // 이메일 찾기 버튼 이벤트
      const findEmailBtn = modal.querySelector('.find-email-btn');
      findEmailBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
        showFindEmailModal();
      }, true);
      
      // 비밀번호 찾기 버튼 이벤트
      const findPasswordBtn = modal.querySelector('.find-password-btn');
      findPasswordBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
        showFindPasswordModal();
      }, true);
      
      // 모달 정리 함수
      modal._cleanup = function() {
        document.removeEventListener('keydown', handleEscape, true);
        document.removeEventListener('click', stopAllEvents, true);
        document.removeEventListener('mousedown', stopAllEvents, true);
        document.removeEventListener('mouseup', stopAllEvents, true);
        document.removeEventListener('touchstart', stopAllEvents, true);
        document.removeEventListener('touchend', stopAllEvents, true);
        
        // 페이지 스크롤 및 상호작용 복원
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      };
      
      // 첫 번째 입력 필드에 포커스
      setTimeout(() => {
        const firstInput = modal.querySelector('input[name="email"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
    
    // 📝 회원가입 모달 표시  
    function showSignupModal() {
      console.log('회원가입 모달 호출됨');
      
      // 기존 모달이 있으면 제거
      const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"]');
      if (existingModal) {
        existingModal.remove();
      }
      
      const modalId = 'signupModal_' + Date.now();
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
      modal.style.zIndex = '9999'; // 매우 높은 z-index
      modal.innerHTML = \`
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
            <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form id="signupForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
              <select name="user_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">사용자 유형을 선택해주세요</option>
                <option value="jobseeker">구직자 (일자리를 찾고 있어요)</option>
                <option value="company">기업 (인재를 채용하고 싶어요)</option>
                <option value="agent">에이전트 (매칭 서비스를 제공해요)</option>
                <option value="student">유학생 (한국에서 공부하고 싶어요)</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이름을 입력해주세요" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="example@email.com" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호</label>
              <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="010-1234-5678 또는 01012345678" maxlength="13" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">지역</label>
              <select name="location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
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
              <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required minlength="6" placeholder="최소 6자 이상" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
              <input type="password" name="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 다시 입력하세요" />
            </div>
            
            <div class="flex space-x-3">
              <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                취소
              </button>
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                회원가입
              </button>
            </div>
          </form>
        </div>
      \`;
      
      // 페이지 스크롤 및 상호작용 비활성화
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      document.body.appendChild(modal);
      
      // 모든 클릭 이벤트 완전 차단 (모달 외부)
      const stopAllEvents = function(event) {
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent.contains(event.target)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      };
      
      // 강력한 이벤트 차단 - 캡처링과 버블링 단계 모두에서 차단
      document.addEventListener('click', stopAllEvents, true);
      document.addEventListener('mousedown', stopAllEvents, true);
      document.addEventListener('mouseup', stopAllEvents, true);
      document.addEventListener('touchstart', stopAllEvents, true);
      document.addEventListener('touchend', stopAllEvents, true);
      
      // ESC 키로 모달 닫기
      const handleEscape = function(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeModal(modal);
        }
      };
      document.addEventListener('keydown', handleEscape, true);
      
      // 닫기 버튼 이벤트 - 직접 이벤트 리스너 추가
      const closeBtn = modal.querySelector('.close-modal-btn');
      closeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
      }, true);
      
      // 취소 버튼 이벤트 - 직접 이벤트 리스너 추가
      const cancelBtn = modal.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
      }, true);
      
      // 폼 제출 이벤트
      const signupForm = document.getElementById('signupForm');
      signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleSignup(event);
      }, true);
      
      // 모달 정리 함수
      modal._cleanup = function() {
        document.removeEventListener('keydown', handleEscape, true);
        document.removeEventListener('click', stopAllEvents, true);
        document.removeEventListener('mousedown', stopAllEvents, true);
        document.removeEventListener('mouseup', stopAllEvents, true);
        document.removeEventListener('touchstart', stopAllEvents, true);
        document.removeEventListener('touchend', stopAllEvents, true);
        
        // 페이지 스크롤 및 상호작용 복원
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      };
      
      // 첫 번째 입력 필드에 포커스
      setTimeout(() => {
        const firstInput = modal.querySelector('select[name="user_type"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
    
    // 모달 안전하게 닫기 함수
    function closeModal(modal) {
      if (modal && modal.parentElement) {
        console.log('모달 닫기 시작');
        
        // 이벤트 리스너 정리
        if (modal._cleanup) {
          modal._cleanup();
        }
        
        // 페이지 상호작용 복원
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        
        // 모달 제거
        modal.remove();
        
        console.log('모달 닫기 완료');
      }
    }
    
    // 전역에서 모든 모달을 강제로 닫는 함수 (비상용)
    function closeAllModals() {
      const allModals = document.querySelectorAll('[id^="signupModal"], [id^="loginModal"], [id^="findEmailModal"], [id^="findPasswordModal"]');
      allModals.forEach(modal => {
        if (modal._cleanup) {
          modal._cleanup();
        }
        modal.remove();
      });
      
      // 페이지 상태 복원
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      
      console.log('모든 모달 강제 닫기 완료');
    }
    
    // 📧 이메일 찾기 모달 표시
    function showFindEmailModal() {
      console.log('이메일 찾기 모달 호출됨');
      
      // 기존 모달이 있으면 제거
      const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"], [id^="findEmailModal"], [id^="findPasswordModal"]');
      if (existingModal) {
        existingModal.remove();
      }
      
      const modalId = 'findEmailModal_' + Date.now();
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
      modal.style.zIndex = '9999';
      modal.innerHTML = \`
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">이메일 찾기</h2>
            <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="mb-4 text-sm text-gray-600">
            <p>가입 시 입력한 이름과 연락처를 입력하시면 이메일을 찾아드립니다.</p>
          </div>
          
          <form id="findEmailForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="가입 시 사용한 이름을 입력하세요" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
              <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="가입 시 사용한 연락처를 입력하세요" />
            </div>
            
            <div class="flex space-x-3">
              <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                취소
              </button>
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                이메일 찾기
              </button>
            </div>
            
            <div class="mt-4 text-center">
              <button type="button" class="back-to-login-btn text-blue-600 hover:text-blue-800 underline text-sm">
                로그인으로 돌아가기
              </button>
            </div>
          </form>
        </div>
      \`;
      
      // 페이지 스크롤 및 상호작용 비활성화
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      document.body.appendChild(modal);
      
      // 모든 클릭 이벤트 완전 차단 (모달 외부)
      const stopAllEvents = function(event) {
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent.contains(event.target)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      };
      
      // 강력한 이벤트 차단
      document.addEventListener('click', stopAllEvents, true);
      document.addEventListener('mousedown', stopAllEvents, true);
      document.addEventListener('mouseup', stopAllEvents, true);
      document.addEventListener('touchstart', stopAllEvents, true);
      document.addEventListener('touchend', stopAllEvents, true);
      
      // ESC 키로 모달 닫기
      const handleEscape = function(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeModal(modal);
        }
      };
      document.addEventListener('keydown', handleEscape, true);
      
      // 닫기 버튼 이벤트
      const closeBtn = modal.querySelector('.close-modal-btn');
      closeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
      }, true);
      
      // 취소 버튼 이벤트
      const cancelBtn = modal.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
      }, true);
      
      // 로그인으로 돌아가기 버튼
      const backToLoginBtn = modal.querySelector('.back-to-login-btn');
      backToLoginBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
        showLoginModal();
      }, true);
      
      // 폼 제출 이벤트
      const findEmailForm = document.getElementById('findEmailForm');
      findEmailForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleFindEmail(event);
      }, true);
      
      // 모달 정리 함수
      modal._cleanup = function() {
        document.removeEventListener('keydown', handleEscape, true);
        document.removeEventListener('click', stopAllEvents, true);
        document.removeEventListener('mousedown', stopAllEvents, true);
        document.removeEventListener('mouseup', stopAllEvents, true);
        document.removeEventListener('touchstart', stopAllEvents, true);
        document.removeEventListener('touchend', stopAllEvents, true);
        
        // 페이지 스크롤 및 상호작용 복원
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      };
      
      // 첫 번째 입력 필드에 포커스
      setTimeout(() => {
        const firstInput = modal.querySelector('input[name="name"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
    
    // 🔑 비밀번호 찾기 모달 표시
    function showFindPasswordModal() {
      console.log('비밀번호 찾기 모달 호출됨');
      
      // 기존 모달이 있으면 제거
      const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"], [id^="findEmailModal"], [id^="findPasswordModal"]');
      if (existingModal) {
        existingModal.remove();
      }
      
      const modalId = 'findPasswordModal_' + Date.now();
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
      modal.style.zIndex = '9999';
      modal.innerHTML = \`
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">비밀번호 찾기</h2>
            <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="mb-4 text-sm text-gray-600">
            <p>가입 시 사용한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
          </div>
          
          <form id="findPasswordForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="가입 시 사용한 이메일을 입력하세요" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="가입 시 사용한 이름을 입력하세요" />
            </div>
            
            <div class="flex space-x-3">
              <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                취소
              </button>
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                비밀번호 재설정
              </button>
            </div>
            
            <div class="mt-4 text-center">
              <button type="button" class="back-to-login-btn text-blue-600 hover:text-blue-800 underline text-sm">
                로그인으로 돌아가기
              </button>
            </div>
          </form>
        </div>
      \`;
      
      // 페이지 스크롤 및 상호작용 비활성화
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      document.body.appendChild(modal);
      
      // 모든 클릭 이벤트 완전 차단 (모달 외부)
      const stopAllEvents = function(event) {
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent.contains(event.target)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      };
      
      // 강력한 이벤트 차단
      document.addEventListener('click', stopAllEvents, true);
      document.addEventListener('mousedown', stopAllEvents, true);
      document.addEventListener('mouseup', stopAllEvents, true);
      document.addEventListener('touchstart', stopAllEvents, true);
      document.addEventListener('touchend', stopAllEvents, true);
      
      // ESC 키로 모달 닫기
      const handleEscape = function(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeModal(modal);
        }
      };
      document.addEventListener('keydown', handleEscape, true);
      
      // 닫기 버튼 이벤트
      const closeBtn = modal.querySelector('.close-modal-btn');
      closeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
      }, true);
      
      // 취소 버튼 이벤트
      const cancelBtn = modal.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
      }, true);
      
      // 로그인으로 돌아가기 버튼
      const backToLoginBtn = modal.querySelector('.back-to-login-btn');
      backToLoginBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal(modal);
        showLoginModal();
      }, true);
      
      // 폼 제출 이벤트
      const findPasswordForm = document.getElementById('findPasswordForm');
      findPasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleFindPassword(event);
      }, true);
      
      // 모달 정리 함수
      modal._cleanup = function() {
        document.removeEventListener('keydown', handleEscape, true);
        document.removeEventListener('click', stopAllEvents, true);
        document.removeEventListener('mousedown', stopAllEvents, true);
        document.removeEventListener('mouseup', stopAllEvents, true);
        document.removeEventListener('touchstart', stopAllEvents, true);
        document.removeEventListener('touchend', stopAllEvents, true);
        
        // 페이지 스크롤 및 상호작용 복원
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      };
      
      // 첫 번째 입력 필드에 포커스
      setTimeout(() => {
        const firstInput = modal.querySelector('input[name="email"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
    
    // 🔐 로그인 처리
    async function handleLogin(event) {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
      };
      
      console.log('로그인 시도:', credentials);
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        console.log('로그인 API 응답:', data);
        
        if (data.success && data.user) {
          // 토큰 저장
          authToken = data.token;
          localStorage.setItem('wowcampus_token', authToken);
          localStorage.setItem('wowcampus_user', JSON.stringify(data.user));
          
          // 모달 닫기
          const modalElement = event.target.closest('div[id^="loginModal"]');
          if (modalElement) {
            closeModal(modalElement);
          }
          
          // 성공 메시지 및 UI 업데이트
          showNotification(\`✨ \${data.user.name}님, 다시 만나서 반가워요!\`, 'success');
          updateAuthUI(data.user);
          
        } else {
          console.error('로그인 실패:', data.message);
          showNotification(data.message || '로그인에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('로그인 오류:', error);
        showNotification('로그인 중 오류가 발생했습니다.', 'error');
      }
    }
    
    // 📝 회원가입 처리
    async function handleSignup(event) {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
      
      // 비밀번호 일치 검증
      if (password !== confirmPassword) {
        showNotification('비밀번호가 일치하지 않습니다.', 'error');
        return;
      }
      
      // 휴대폰 번호 유효성 검증
      const phone = formData.get('phone');
      if (phone) {
        // 하이픈 제거 후 숫자만 추출
        const cleanPhone = phone.replace(/[-\s]/g, '');
        // 한국 휴대폰 번호 패턴: 01X로 시작하고 10~11자리
        const phonePattern = /^01[016789][0-9]{7,8}$/;
        
        if (!phonePattern.test(cleanPhone)) {
          showNotification('올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678 또는 01012345678)', 'error');
          return;
        }
      }
      
      const userData = {
        user_type: formData.get('user_type'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: phone ? phone.replace(/[-\s]/g, '') : '', // 휴대폰 번호 정규화 (하이픈 제거)
        location: formData.get('location'),
        password: password,
        confirmPassword: confirmPassword
      };
      
      try {
        console.log('회원가입 시작:', userData);
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        console.log('회원가입 응답:', data);
        
        if (data.success) {
          // 성공 메시지 표시
          showNotification('🎉 회원가입이 완료되었습니다!', 'success');
          
          // 모달 닫기
          const modalElement = event.target.closest('div[id^="signupModal"]');
          if (modalElement) {
            closeModal(modalElement);
          }
          
          // 자동 로그인 시도
          setTimeout(async () => {
            try {
              const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: userData.email,
                  password: userData.password
                })
              });
              
              const loginData = await loginResponse.json();
              
              if (loginData.success && loginData.user) {
                authToken = loginData.token;
                localStorage.setItem('wowcampus_token', authToken);
                localStorage.setItem('wowcampus_user', JSON.stringify(loginData.user));
                
                showNotification(\`✨ \${loginData.user.name}님, 환영합니다!\`, 'success');
                updateAuthUI(loginData.user);
              }
            } catch (loginError) {
              console.error('자동 로그인 에러:', loginError);
              showNotification('자동 로그인에 실패했습니다. 직접 로그인해주세요.', 'warning');
            }
          }, 1000);
          
        } else {
          showNotification(data.message || '회원가입에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('회원가입 에러:', error);
        showNotification(error.message || '회원가입 중 오류가 발생했습니다.', 'error');
      }
    }
    
    // 🚪 로그아웃 처리
    async function handleLogout() {
      try {
        console.log('로그아웃 시작');
        
        // 로컬 데이터 정리
        authToken = null;
        localStorage.removeItem('wowcampus_token');
        localStorage.removeItem('wowcampus_user');
        window.currentUser = null;
        
        // 성공 메시지
        showNotification('👋 안전하게 로그아웃되었습니다.', 'success');
        
        // UI를 로그아웃 상태로 복원
        updateAuthUI(null);
        
      } catch (error) {
        console.error('로그아웃 에러:', error);
        showNotification('로그아웃 중 오류가 발생했습니다.', 'error');
      }
    }
    
    // 📧 이메일 찾기 처리
    async function handleFindEmail(event) {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const findData = {
        name: formData.get('name'),
        phone: formData.get('phone')
      };
      
      console.log('이메일 찾기 시도:', findData);
      
      try {
        const response = await fetch('/api/auth/find-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(findData)
        });
        
        const data = await response.json();
        console.log('이메일 찾기 응답:', data);
        
        if (data.success) {
          // 모달 닫기
          const modalElement = event.target.closest('div[id^="findEmailModal"]');
          if (modalElement) {
            closeModal(modalElement);
          }
          
          // 성공 메시지와 함께 이메일 표시
          showNotification(\`📧 찾은 이메일: \${data.email}\`, 'success');
          
          // 로그인 모달로 돌아가기 (선택사항)
          setTimeout(() => {
            showLoginModal();
          }, 2000);
          
        } else {
          showNotification(data.message || '일치하는 정보를 찾을 수 없습니다.', 'error');
        }
      } catch (error) {
        console.error('이메일 찾기 오류:', error);
        showNotification('이메일 찾기 중 오류가 발생했습니다.', 'error');
      }
    }
    
    // 🔑 비밀번호 찾기 처리
    async function handleFindPassword(event) {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const findData = {
        email: formData.get('email'),
        name: formData.get('name')
      };
      
      console.log('비밀번호 찾기 시도:', findData);
      
      try {
        const response = await fetch('/api/auth/find-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(findData)
        });
        
        const data = await response.json();
        console.log('비밀번호 찾기 응답:', data);
        
        if (data.success) {
          // 모달 닫기
          const modalElement = event.target.closest('div[id^="findPasswordModal"]');
          if (modalElement) {
            closeModal(modalElement);
          }
          
          // 성공 메시지 표시
          showNotification('✉️ 비밀번호 재설정 링크를 이메일로 보내드렸습니다.', 'success');
          
          // 로그인 모달로 돌아가기 (선택사항)
          setTimeout(() => {
            showLoginModal();
          }, 2000);
          
        } else {
          showNotification(data.message || '일치하는 정보를 찾을 수 없습니다.', 'error');
        }
      } catch (error) {
        console.error('비밀번호 찾기 오류:', error);
        showNotification('비밀번호 찾기 중 오류가 발생했습니다.', 'error');
      }
    }
    
    // 💬 알림 표시 함수
    function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = \`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm \${getNotificationColors(type)}\`;
      notification.innerHTML = \`
        <div class="flex items-center">
          <div class="flex-shrink-0">
            \${getNotificationIcon(type)}
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">\${message}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      \`;
      
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
    
    // 🔄 로그인 상태 복원
    function restoreLoginState() {
      const token = localStorage.getItem('wowcampus_token');
      const userStr = localStorage.getItem('wowcampus_user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          authToken = token;
          window.currentUser = user;
          updateAuthUI(user);
          console.log('로그인 상태 복원됨:', user.name);
        } catch (error) {
          console.error('로그인 상태 복원 실패:', error);
          localStorage.removeItem('wowcampus_token');
          localStorage.removeItem('wowcampus_user');
          updateAuthUI(null);
        }
      } else {
        updateAuthUI(null);
      }
    }
    
    // 🎯 사용자 유형별 메뉴 구성
    const menuConfig = {
      guest: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' },
        { href: '/statistics', label: '통계', icon: 'fas fa-chart-line' }
      ],
      jobseeker: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' },
        { href: '/statistics', label: '통계', icon: 'fas fa-chart-line' }
      ],
      company: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' },
        { href: '/statistics', label: '통계', icon: 'fas fa-chart-line' }
      ],
      agent: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' },
        { href: '/agents', label: '에이전트', icon: 'fas fa-handshake' },
        { href: '/statistics', label: '통계', icon: 'fas fa-chart-line' }
      ],
      admin: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' },
        { href: '/agents', label: '에이전트', icon: 'fas fa-handshake' },
        { href: '/statistics', label: '통계', icon: 'fas fa-chart-line' },
        { href: '/admin', label: '관리자', icon: 'fas fa-cog' }
      ]
    };
    
    // 🎯 사용자 유형별 서비스 드롭다운 메뉴 구성
    const serviceMenuConfig = {
      guest: [
        { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보 보기', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' }
      ],
      jobseeker: [
        { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보 보기', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' }
      ],
      company: [
        { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보 보기', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' }
      ],
      agent: [
        { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보 보기', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' },
        { href: '/agents', label: '에이전트 대시보드', icon: 'fas fa-handshake' }
      ],
      admin: [
        { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보 보기', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' },
        { href: '/agents', label: '에이전트 대시보드', icon: 'fas fa-handshake' }
      ]
    };
    
    // 🎯 동적 메뉴 생성 및 업데이트 함수
    function updateNavigationMenu(user = null) {
      console.log('updateNavigationMenu 호출됨:', user ? \`\${user.name} (\${user.user_type})\` : '비로그인 상태');
      
      const navigationMenu = document.getElementById('navigation-menu-container');
      if (!navigationMenu) {
        console.warn('navigation-menu-container를 찾을 수 없습니다');
        return;
      }
      
      // 사용자 유형 결정
      const userType = user ? user.user_type : 'guest';
      const menus = menuConfig[userType] || menuConfig.guest;
      
      // 현재 경로 확인
      const currentPath = window.location.pathname;
      
      // 메뉴 HTML 생성
      const menuHtml = menus.map(menu => {
        const isActive = currentPath === menu.href;
        const activeClass = isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600 transition-colors font-medium';
        
        return '' +
          '<a href="' + menu.href + '" class="' + activeClass + '">' +
            '<i class="' + menu.icon + ' mr-1"></i>' + menu.label +
          '</a>';
      }).join('');
      
      navigationMenu.innerHTML = menuHtml;
      
      console.log(\`\${userType} 유형의 메뉴로 업데이트 완료 (메뉴 \${menus.length}개)\`);
    }
    
    // 🎯 서비스 드롭다운 메뉴 업데이트 함수 (메인 페이지용)
    function updateServiceDropdownMenu(user = null) {
      console.log('updateServiceDropdownMenu 호출됨:', user ? \`\${user.name} (\${user.user_type})\` : '비로그인 상태');
      
      // 데스크톱 서비스 드롭다운 메뉴 업데이트
      const serviceDropdown = document.getElementById('service-dropdown-container');
      if (serviceDropdown) {
        const userType = user ? user.user_type : 'guest';
        const serviceMenus = serviceMenuConfig[userType] || serviceMenuConfig.guest;
        
        const serviceHtml = serviceMenus.map(menu => \`
          <a href="\${menu.href}" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
            <i class="\${menu.icon} mr-2"></i>\${menu.label}
          </a>
        \`).join('');
        
        serviceDropdown.innerHTML = serviceHtml;
        console.log(\`데스크톱 서비스 메뉴 업데이트 완료 (메뉴 \${serviceMenus.length}개)\`);
      }
      
      // 모바일 서비스 메뉴 업데이트
      const mobileServiceMenu = document.getElementById('mobile-service-menu-container');
      if (mobileServiceMenu) {
        const userType = user ? user.user_type : 'guest';
        const serviceMenus = serviceMenuConfig[userType] || serviceMenuConfig.guest;
        
        const mobileServiceHtml = serviceMenus.map(menu => \`
          <a href="\${menu.href}" class="block pl-4 py-2 text-gray-600 hover:text-blue-600">
            <i class="\${menu.icon} mr-2"></i>\${menu.label}
          </a>
        \`).join('');
        
        mobileServiceMenu.innerHTML = mobileServiceHtml;
        console.log(\`모바일 서비스 메뉴 업데이트 완료 (메뉴 \${serviceMenus.length}개)\`);
      }
    }
    
    // 📱 DOM 로드 완료 후 실행
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOMContentLoaded - WOW-CAMPUS 초기화 중...');
      
      // 로그인 상태 복원
      restoreLoginState();
      
      // 동적 메뉴 초기화
      const currentUser = window.currentUser;
      updateNavigationMenu(currentUser);
      
      // 서비스 드롭다운 메뉴 초기화 (메인 페이지용)
      updateServiceDropdownMenu(currentUser);
      
      // 구직자 목록 자동 로딩 (jobseekers 페이지인 경우)
      if (window.location.pathname === '/jobseekers' && typeof loadJobSeekers === 'function') {
        console.log('구직자 목록 자동 로딩 시작...');
        setTimeout(() => {
          loadJobSeekers();
        }, 500);
      }
      
      console.log('WOW-CAMPUS 초기화 완료!');
    });
    
    // 🔍 구직자 목록 로딩 함수
    async function loadJobSeekers() {
      console.log('구직자 목록 로딩 시작...');
      
      const listContainer = document.getElementById('jobseekers-listings');
      if (!listContainer) {
        console.warn('jobseekers-listings 컨테이너를 찾을 수 없습니다');
        return;
      }
      
      // 로딩 표시
      listContainer.innerHTML = \`
        <div class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600">구직자 정보를 불러오는 중...</p>
        </div>
      \`;
      
      try {
        const response = await fetch('/api/jobseekers?limit=20&offset=0', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': \`Bearer \${authToken}\` })
          }
        });
        
        const data = await response.json();
        console.log('구직자 목록 API 응답:', data);
        
        if (data.success && data.data) {
          const jobseekers = data.data;
          
          if (jobseekers.length === 0) {
            listContainer.innerHTML = \`
              <div class="text-center py-12">
                <i class="fas fa-user-slash text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">등록된 구직자가 없습니다.</p>
              </div>
            \`;
            return;
          }
          
          // 구직자 목록 생성 (임시로 간단화하여 오류 방지)
          const jobseekersHtml = jobseekers.map(jobseeker => {
            return '<div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">' +
              '<div class="flex items-start justify-between mb-4">' +
                '<div class="flex items-center space-x-3">' +
                  '<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">' +
                    '<i class="fas fa-user text-green-600 text-xl"></i>' +
                  '</div>' +
                  '<div>' +
                    '<h3 class="text-lg font-semibold text-gray-900">' + (jobseeker.name || '구직자') + '</h3>' +
                    '<div class="flex items-center space-x-2 text-sm text-gray-600">' +
                      '<span>' + (jobseeker.nationality || '정보없음') + '</span>' +
                      '<span>•</span>' +
                      '<span>' + (jobseeker.experience || '경력정보없음') + '</span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="mb-4">' +
                '<div class="text-sm text-gray-600 mb-2">' +
                  '<strong>전공/분야:</strong> ' + (jobseeker.major || jobseeker.field || '정보없음') +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('');
          
          listContainer.innerHTML = jobseekersHtml;
          console.log(\`구직자 목록 로딩 완료: \${jobseekers.length}명\`);
          
        } else {
          throw new Error(data.message || '구직자 목록을 불러올 수 없습니다.');
        }
        
      } catch (error) {
        console.error('구직자 목록 로딩 오류:', error);
        listContainer.innerHTML = \`
          <div class="text-center py-12">
            <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <p class="text-red-600">구직자 목록을 불러올 수 없습니다.</p>
            <button onclick="loadJobSeekers()" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              다시 시도
            </button>
          </div>
        \`;
      }
    }
    
    // 헬퍼 함수들
    function getFlagIcon(nationality) {
      const flags = {
        '중국': '🇨🇳', '베트남': '🇻🇳', '필리핀': '🇵🇭', '태국': '🇹🇭', 
        '일본': '🇯🇵', '미국': '🇺🇸', '인도네시아': '🇮🇩', '캄보디아': '🇰🇭'
      };
      return flags[nationality] || '🌏';
    }
    
    function getVisaStatusBadge(visaStatus) {
      const colors = {
        'E7': 'bg-blue-100 text-blue-800', 'E9': 'bg-green-100 text-green-800',
        'F2': 'bg-purple-100 text-purple-800', 'F4': 'bg-orange-100 text-orange-800',
        'F5': 'bg-red-100 text-red-800', 'D2': 'bg-yellow-100 text-yellow-800'
      };
      const colorClass = colors[visaStatus] || 'bg-gray-100 text-gray-800';
      return visaStatus ? \`<span class="px-2 py-1 rounded-full text-xs font-medium \${colorClass}">\${visaStatus}</span>\` : '';
    }
    
    function getKoreanLevelBadge(koreanLevel) {
      const levels = {
        'beginner': '초급', 'elementary': '초중급', 'intermediate': '중급',
        'advanced': '고급', 'native': '원어민'
      };
      const label = levels[koreanLevel] || koreanLevel;
      return label ? \`<span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">한국어 \${label}</span>\` : '';
    }
    
    // 구직자 상세 보기 함수 (기본 구현)
    function showJobSeekerDetail(id) {
      console.log(\`구직자 상세보기: \${id}\`);
      alert(\`구직자 ID \${id}의 상세 정보를 표시합니다. (구현 예정)\`);
    }
    
    // 🎯 구직자 대시보드 관련 함수들
    
    // 탭 전환 함수
    function showTab(tabName) {
      console.log('탭 전환:', tabName);
      
      // 모든 탭 컨텐츠 숨기기
      const contents = document.querySelectorAll('.dashboard-content');
      contents.forEach(content => {
        content.style.display = 'none';
      });
      
      // 모든 탭 버튼 비활성화
      const tabs = document.querySelectorAll('.dashboard-tab');
      tabs.forEach(tab => {
        tab.classList.remove('active');
      });
      
      // 선택된 탭 컨텐츠 표시
      const selectedContent = document.getElementById(\`\${tabName}-tab\`);
      if (selectedContent) {
        selectedContent.style.display = 'block';
      }
      
      // 선택된 탭 버튼 활성화
      const selectedTab = event?.target?.closest('.dashboard-tab');
      if (selectedTab) {
        selectedTab.classList.add('active');
      }
      
      // 탭별 데이터 로드
      if (tabName === 'profile') {
        loadProfile();
      } else if (tabName === 'applications') {
        loadApplications();
      }
    }
    
    // 프로필 편집 토글
    function toggleProfileEdit() {
      const form = document.getElementById('profile-form');
      const inputs = form.querySelectorAll('input, select, textarea');
      const button = document.getElementById('edit-profile-btn');
      
      const isEditing = !inputs[0].disabled;
      
      if (isEditing) {
        // 저장 모드 → 편집 모드로 전환
        saveProfile();
      } else {
        // 편집 모드 활성화
        inputs.forEach(input => {
          input.disabled = false;
        });
        button.innerHTML = '<i class="fas fa-save mr-2"></i>저장';
        button.className = 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors';
      }
    }
    
    // 프로필 로드
    async function loadProfile() {
      console.log('프로필 정보 로드 중...');
      
      const user = getCurrentUser();
      if (!user) {
        console.error('인증 토큰이 없습니다');
        return;
      }
      
      const token = localStorage.getItem('wowcampus_token');
      
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log('프로필 로드 응답:', data);
        
        if (data.success && data.user) {
          // 사용자 기본 정보와 프로필 정보를 합쳐서 전달
          const combinedData = {
            ...data.user,
            ...data.profile
          };
          fillProfileForm(combinedData);
          updateProfileCompletion(combinedData);
        } else {
          console.error('프로필 로드 실패:', data.message || '프로필 데이터가 없습니다');
          showNotification('프로필 정보를 불러올 수 없습니다.', 'error');
        }
        
      } catch (error) {
        console.error('프로필 로드 오류:', error);
        showNotification('프로필 로드 중 오류가 발생했습니다.', 'error');
      }
    }
    
    // 프로필 폼 채우기 (개선된 버전)
    function fillProfileForm(profileData) {
      console.log('프로필 폼 채우기:', profileData);
      
      // 기본 사용자 정보 필드들
      const basicFields = ['name', 'phone', 'email'];
      // 구직자 프로필 필드들  
      const profileFields = [
        'first_name', 'last_name', 'nationality', 'birth_date', 'gender',
        'visa_status', 'korean_level', 'english_level', 'education_level',
        'major', 'experience_years', 'current_location', 'preferred_location',
        'salary_expectation', 'bio', 'skills', 'resume_url', 'portfolio_url'
      ];
      
      // 기본 정보 채우기
      basicFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && profileData[field] !== null && profileData[field] !== undefined) {
          element.value = profileData[field];
        }
      });
      
      // 프로필 정보 채우기
      profileFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && profileData[field] !== null && profileData[field] !== undefined) {
          if (element.type === 'checkbox') {
            element.checked = profileData[field];
          } else if (element.tagName === 'SELECT') {
            element.value = profileData[field];
          } else {
            element.value = profileData[field];
          }
        }
      });
      
      // skills가 JSON 문자열인 경우 파싱
      const skillsElement = document.getElementById('skills');
      if (skillsElement && profileData.skills) {
        try {
          if (typeof profileData.skills === 'string') {
            const skillsArray = JSON.parse(profileData.skills);
            skillsElement.value = Array.isArray(skillsArray) ? skillsArray.join(', ') : profileData.skills;
          } else {
            skillsElement.value = profileData.skills;
          }
        } catch (e) {
          skillsElement.value = profileData.skills;
        }
      }
      
      // 프로필 사이드바 업데이트
      updateProfileSidebar(profileData);
      
      console.log('✅ 프로필 폼 채우기 완료');
    }
    
    // 프로필 사이드바 업데이트
    function updateProfileSidebar(profileData) {
      const nameElement = document.getElementById('profile-name');
      const emailElement = document.getElementById('profile-email');
      
      if (nameElement && profileData.first_name) {
        const fullName = \`\${profileData.first_name} \${profileData.last_name || ''}\`.trim();
        nameElement.textContent = fullName || '사용자명';
      }
      
      if (emailElement && window.currentUser) {
        emailElement.textContent = window.currentUser.email || '이메일';
      }
    }
    
    // 프로필 저장 (개선된 버전)
    async function saveProfile() {
      console.log('프로필 저장 중...');
      
      const user = getCurrentUser();
      if (!user) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      const token = localStorage.getItem('wowcampus_token');
      
      const form = document.getElementById('profile-form');
      const formData = new FormData(form);
      
      // 기본 사용자 정보와 프로필 정보 분리
      const basicData = {};
      const profileData = {};
      
      // 폼 데이터를 적절한 카테고리로 분류
      for (let [key, value] of formData.entries()) {
        if (value && value.trim && value.trim() !== '') {
          if (['name', 'phone'].includes(key)) {
            basicData[key] = value.trim();
          } else {
            profileData[key] = value.trim();
          }
        }
      }
      
      // skills 처리 (콤마로 분리된 문자열을 JSON 배열로 변환)
      if (profileData.skills) {
        const skillsArray = profileData.skills.split(',').map(s => s.trim()).filter(s => s);
        profileData.skills = JSON.stringify(skillsArray);
      }
      
      const updatePayload = {
        ...basicData,
        profile_data: profileData
      };
      
      console.log('전송할 데이터:', updatePayload);
      
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });
        
        const data = await response.json();
        console.log('프로필 저장 응답:', data);
        
        if (data.success) {
          showNotification('프로필이 성공적으로 저장되었습니다!', 'success');
          
          // 편집 모드 종료
          const inputs = form.querySelectorAll('input, select, textarea');
          inputs.forEach(input => {
            input.disabled = true;
          });
          
          const button = document.getElementById('edit-profile-btn');
          if (button) {
            button.innerHTML = '<i class="fas fa-edit mr-2"></i>편집';
            button.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors';
          }
          
          // 프로필 완성도 업데이트
          updateProfileCompletion({ ...basicData, ...profileData });
          
          // 현재 사용자 정보 업데이트
          if (window.currentUser) {
            window.currentUser = { ...window.currentUser, ...basicData };
          }
          
        } else {
          showNotification(data.message || '프로필 저장에 실패했습니다.', 'error');
        }
        
      } catch (error) {
        console.error('프로필 저장 오류:', error);
        showNotification('서버 오류가 발생했습니다.', 'error');
      }
    }
    
    // 이력서 업로드
    async function uploadResume() {
      console.log('이력서 업로드 함수 호출');
      
      const input = document.getElementById('resume-upload');
      const file = input?.files[0];
      
      if (!file) {
        showNotification('파일을 선택해 주세요.', 'warning');
        return;
      }
      
      const user = getCurrentUser();
      if (!user) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      const token = localStorage.getItem('wowcampus_token');
      
      const formData = new FormData();
      formData.append('resume', file);
      
      try {
        showNotification('이력서 업로드 중...', 'info');
        
        const response = await fetch('/api/upload/resume', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`
          },
          body: formData
        });
        
        const data = await response.json();
        console.log('이력서 업로드 응답:', data);
        
        if (data.success) {
          showNotification('이력서가 성공적으로 업로드되었습니다!', 'success');
          updateResumeDisplay(data.data);
        } else {
          showNotification(data.message || '이력서 업로드에 실패했습니다.', 'error');
        }
        
      } catch (error) {
        console.error('이력서 업로드 오류:', error);
        showNotification('서버 오류가 발생했습니다.', 'error');
      }
    }
    
    // 포트폴리오 업로드
    async function uploadPortfolio() {
      console.log('포트폴리오 업로드 함수 호출');
      
      const input = document.getElementById('portfolio-upload');
      const files = input?.files;
      
      if (!files || files.length === 0) {
        showNotification('파일을 선택해 주세요.', 'warning');
        return;
      }
      
      const user = getCurrentUser();
      if (!user) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      const token = localStorage.getItem('wowcampus_token');
      
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('portfolio', files[i]);
      }
      
      try {
        showNotification('포트폴리오 업로드 중...', 'info');
        
        const response = await fetch('/api/upload/portfolio', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`
          },
          body: formData
        });
        
        const data = await response.json();
        console.log('포트폴리오 업로드 응답:', data);
        
        if (data.success) {
          showNotification(\`포트폴리오 \${data.data.length}개 파일이 업로드되었습니다!\`, 'success');
          updatePortfolioDisplay(data.data);
        } else {
          showNotification(data.message || '포트폴리오 업로드에 실패했습니다.', 'error');
        }
        
      } catch (error) {
        console.error('포트폴리오 업로드 오류:', error);
        showNotification('서버 오류가 발생했습니다.', 'error');
      }
    }
    
    // 문서 업로드 (커버레터, 학위증명서, 자격증)
    async function uploadDocument(documentType, inputId) {
      console.log(\`\${documentType} 업로드 함수 호출\`);
      
      const input = document.getElementById(inputId);
      const file = input?.files[0];
      
      if (!file) {
        showNotification('파일을 선택해 주세요.', 'warning');
        return;
      }
      
      const user = getCurrentUser();
      if (!user) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      const token = localStorage.getItem('wowcampus_token');
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      try {
        showNotification('문서 업로드 중...', 'info');
        
        const response = await fetch('/api/upload/document', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`
          },
          body: formData
        });
        
        const data = await response.json();
        console.log(\`\${documentType} 업로드 응답:\`, data);
        
        if (data.success) {
          showNotification('문서가 성공적으로 업로드되었습니다!', 'success');
          updateDocumentDisplay(documentType, data.data);
        } else {
          showNotification(data.message || '문서 업로드에 실패했습니다.', 'error');
        }
        
      } catch (error) {
        console.error(\`\${documentType} 업로드 오류:\`, error);
        showNotification('서버 오류가 발생했습니다.', 'error');
      }
    }
    
    // 포트폴리오 링크 저장
    async function savePortfolioLinks() {
      console.log('포트폴리오 링크 저장');
      
      const portfolioUrl = document.getElementById('portfolio_url')?.value;
      const githubUrl = document.getElementById('github_url')?.value;
      const linkedinUrl = document.getElementById('linkedin_url')?.value;
      
      const linkData = {
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl
      };
      
      const user = getCurrentUser();
      if (!user) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      const token = localStorage.getItem('wowcampus_token');
      
      try {
        const response = await fetch('/api/profile/jobseeker', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(linkData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          showNotification('포트폴리오 링크가 저장되었습니다!', 'success');
        } else {
          showNotification(data.message || '저장에 실패했습니다.', 'error');
        }
        
      } catch (error) {
        console.error('포트폴리오 링크 저장 오류:', error);
        showNotification('서버 오류가 발생했습니다.', 'error');
      }
    }
    
    // 이력서 다운로드
    function downloadResume() {
      console.log('이력서 다운로드');
      // TODO: 실제 이력서 다운로드 구현
      showNotification('이력서 다운로드 기능이 곧 제공됩니다.', 'info');
    }
    
    // 지원 현황 로드
    function loadApplications() {
      console.log('지원 현황 로드');
      // TODO: 실제 지원 현황 로드 구현
      
      // Mock 데이터로 UI 업데이트
      document.getElementById('total-applications').textContent = '0';
      document.getElementById('pending-applications').textContent = '0';
      document.getElementById('accepted-applications').textContent = '0';
      document.getElementById('rejected-applications').textContent = '0';
    }
    
    // 프로필 완성도 업데이트
    function updateProfileCompletion(profileData = null) {
      if (!profileData) {
        // 현재 폼에서 데이터 가져오기
        const form = document.getElementById('profile-form');
        if (form) {
          const formData = new FormData(form);
          profileData = {};
          for (let [key, value] of formData.entries()) {
            profileData[key] = value;
          }
        }
      }
      
      if (!profileData) return;
      
      // 필수 필드들
      const essentialFields = ['first_name', 'nationality', 'phone', 'education_level', 'korean_level'];
      const optionalFields = ['last_name', 'birth_date', 'gender', 'address', 'school_name', 'major', 'skills'];
      
      let completedEssential = 0;
      let completedOptional = 0;
      
      essentialFields.forEach(field => {
        if (profileData[field] && profileData[field].trim() !== '') {
          completedEssential++;
        }
      });
      
      optionalFields.forEach(field => {
        if (profileData[field] && profileData[field].trim() !== '') {
          completedOptional++;
        }
      });
      
      // 완성도 계산 (필수 80%, 선택 20%)
      const essentialPercent = (completedEssential / essentialFields.length) * 80;
      const optionalPercent = (completedOptional / optionalFields.length) * 20;
      const totalPercent = Math.round(essentialPercent + optionalPercent);
      
      // UI 업데이트
      const statusElement = document.getElementById('profile-status');
      if (statusElement) {
        statusElement.textContent = \`프로필 완성도: \${totalPercent}%\`;
        
        if (totalPercent >= 80) {
          statusElement.className = 'inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-2';
        } else if (totalPercent >= 50) {
          statusElement.className = 'inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-2';
        } else {
          statusElement.className = 'inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mt-2';
        }
      }
      
      console.log(\`프로필 완성도: \${totalPercent}% (필수: \${completedEssential}/\${essentialFields.length}, 선택: \${completedOptional}/\${optionalFields.length})\`);
    }
    
    // UI 업데이트 헬퍼 함수들
    function updateResumeDisplay(fileData) {
      console.log('이력서 업로드 완료:', fileData);
      // TODO: UI에 업로드된 파일 정보 표시
    }
    
    function updatePortfolioDisplay(filesData) {
      console.log('포트폴리오 업로드 완료:', filesData);
      // TODO: UI에 업로드된 파일들 정보 표시
    }
    
    function updateDocumentDisplay(documentType, fileData) {
      console.log(\`\${documentType} 업로드 완료:\`, fileData);
      // TODO: UI에 업로드된 문서 정보 표시
    }
    
    // 🚀 페이지 로드 시 초기화
    function initializePage() {
      console.log('페이지 초기화 시작');
      
      // 현재 사용자 정보 확인
      const user = getCurrentUser();
      
      if (user) {
        console.log('로그인된 사용자:', user);
        
        // 전역 변수에 사용자 정보 저장
        window.currentUser = user;
        
        // 사용자 정보로 UI 업데이트
        updateAuthUI(user);
        
        // 현재 페이지가 대시보드인 경우 (구직자는 /jobseekers 경로도 포함)
        const isDashboard = window.location.pathname === '/dashboard' || 
                           (window.location.pathname === '/jobseekers' && user.user_type === 'jobseeker');
        
        if (isDashboard) {
          // 구직자인 경우에만 프로필 로드
          if (user.user_type === 'jobseeker') {
            console.log('구직자 대시보드 - 프로필 정보 로드 시작');
            // 페이지가 완전히 로드된 후 프로필 로드
            setTimeout(() => {
              loadProfile();
            }, 500);
          }
          
          // 첫 번째 탭 활성화 (프로필 탭)
          setTimeout(() => {
            showTab('profile');
          }, 100);
        }
        
      } else {
        console.log('로그인되지 않은 상태');
        
        // 로그아웃 상태로 UI 업데이트
        updateAuthUI(null);
      }
    }
    
    // 대시보드 전용 초기화 (기존 함수명 유지)
    function initializeDashboard() {
      return initializePage();
    }
    
    // DOM 로드 완료 시 초기화 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializePage);
    } else {
      initializePage();
    }
    
    // 🔧 구직자 목록 페이지 관련 함수들
    
    // JWT 토큰 디코딩 함수 (간단한 방식)
    function parseJWT(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('JWT 파싱 오류:', error);
        return null;
      }
    }
    
    // 현재 사용자 정보 가져오기 (전역 함수)
    function getCurrentUser() {
      const token = localStorage.getItem('wowcampus_token');
      console.log('getCurrentUser - 토큰 확인:', token ? '존재함' : '없음');
      
      if (!token) {
        console.log('getCurrentUser - 토큰이 없음');
        return null;
      }
      
      try {
        // JWT 토큰 디코딩
        const payload = parseJWT(token);
        console.log('getCurrentUser - JWT 페이로드:', payload);
        
        if (!payload) {
          console.log('JWT 페이로드 파싱 실패');
          localStorage.removeItem('wowcampus_token');
          return null;
        }
        
        // 토큰 만료 확인 (exp는 초 단위, Date.now()는 밀리초 단위)
        if (payload.exp && Date.now() > payload.exp * 1000) {
          console.log('토큰이 만료되었습니다');
          localStorage.removeItem('wowcampus_token');
          return null;
        }
        
        // JWT 페이로드에서 사용자 정보 추출
        const user = {
          id: payload.userId,
          email: payload.email,
          name: payload.name,
          user_type: payload.userType,
          exp: payload.exp,
          iat: payload.iat
        };
        
        console.log('getCurrentUser - 추출된 사용자 정보:', user);
        return user;
        
      } catch (error) {
        console.error('토큰 파싱 오류:', error);
        localStorage.removeItem('wowcampus_token');
        return null;
      }
    }
    
    // 프로필 등록 모달 표시
    function showProfileModal(mode = 'create', profileId = null) {
      console.log('프로필 모달 표시:', mode, profileId);
      console.log('localStorage에 저장된 토큰:', localStorage.getItem('wowcampus_token'));
      
      // 현재 사용자 정보 확인
      const user = getCurrentUser();
      
      if (!user) {
        console.log('사용자가 로그인되어 있지 않음');
        showNotification('프로필 등록을 위해서는 로그인이 필요합니다.', 'warning');
        setTimeout(() => {
          showLoginModal();
        }, 1500);
        return;
      }
      
      console.log('현재 로그인된 사용자:', user);
      console.log('사용자 타입:', user.user_type);
      
      // 구직자만 프로필 등록 가능 (구직자 페이지에서)
      if (user.user_type !== 'jobseeker') {
        console.log('구직자가 아님, 접근 거부');
        showNotification('구직자만 이 기능을 사용할 수 있습니다.', 'warning');
        return;
      }
      
      // 대시보드로 리다이렉트
      console.log('구직자 확인됨, 대시보드로 이동');
      showNotification('구직자 대시보드로 이동합니다...', 'info');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
    
    // 프로필 모달 숨기기
    function hideProfileModal() {
      const modal = document.getElementById('profile-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    }
    
    // 프로필 상세보기 모달 숨기기
    function hideProfileDetailModal() {
      const modal = document.getElementById('profile-detail-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    }
    
    // 프로필 상세보기에서 편집으로 전환
    function editProfileFromDetail() {
      console.log('프로필 편집 모드로 전환');
      
      // 현재 사용자 정보 확인
      const user = getCurrentUser();
      
      if (!user) {
        showNotification('편집을 위해서는 로그인이 필요합니다.', 'warning');
        setTimeout(() => {
          showLoginModal();
        }, 1500);
        return;
      }
      
      if (user.user_type !== 'jobseeker') {
        showNotification('구직자만 프로필을 편집할 수 있습니다.', 'warning');
        return;
      }
      
      // 대시보드로 이동
      hideProfileDetailModal();
      showNotification('구직자 대시보드로 이동합니다...', 'info');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
    
    // 고급 필터 토글
    function toggleAdvancedFilters(type = 'job') {
      console.log('고급 필터 토글:', type);
      
      const filterId = type === 'jobseeker' ? 'advanced-jobseeker-filters' : 'advanced-job-filters';
      const filterElement = document.getElementById(filterId);
      
      if (filterElement) {
        filterElement.classList.toggle('hidden');
      }
    }
    
    // 구직자 검색
    function searchJobSeekers() {
      console.log('구직자 검색 실행');
      
      const searchInput = document.getElementById('jobseeker-search-input')?.value || '';
      const majorFilter = document.getElementById('jobseeker-major-filter')?.value || '';
      const experienceFilter = document.getElementById('jobseeker-experience-filter')?.value || '';
      const locationFilter = document.getElementById('jobseeker-location-filter')?.value || '';
      
      console.log('검색 조건:', {
        search: searchInput,
        major: majorFilter,
        experience: experienceFilter,
        location: locationFilter
      });
      
      // 구직자 목록을 다시 로드 (검색 조건 포함)
      loadJobSeekers({
        search: searchInput,
        major: majorFilter,
        experience: experienceFilter,
        location: locationFilter
      });
    }
    
    // 구직자 필터 적용
    function applyJobSeekerFilters() {
      console.log('구직자 필터 적용');
      
      // 체크박스에서 선택된 값들 수집
      const filters = {};
      
      // 국적 필터
      const nationalityChecked = Array.from(document.querySelectorAll('input[name="nationality"]:checked')).map(cb => cb.value);
      if (nationalityChecked.length > 0) {
        filters.nationality = nationalityChecked;
      }
      
      // 비자 상태 필터
      const visaChecked = Array.from(document.querySelectorAll('input[name="visa_status"]:checked')).map(cb => cb.value);
      if (visaChecked.length > 0) {
        filters.visa_status = visaChecked;
      }
      
      // 한국어 수준 필터
      const koreanChecked = Array.from(document.querySelectorAll('input[name="korean_level"]:checked')).map(cb => cb.value);
      if (koreanChecked.length > 0) {
        filters.korean_level = koreanChecked;
      }
      
      console.log('적용된 필터:', filters);
      
      // 구직자 목록을 다시 로드 (필터 포함)
      loadJobSeekers(filters);
      
      // 고급 필터 숨기기
      toggleAdvancedFilters('jobseeker');
    }
    
    // 모든 필터 해제
    function clearAllFilters(type = 'jobseeker') {
      console.log('모든 필터 해제:', type);
      
      // 모든 체크박스 해제
      const checkboxes = document.querySelectorAll(\`input[type="checkbox"]\`);
      checkboxes.forEach(cb => {
        cb.checked = false;
      });
      
      // 셀렉트 박스 초기화
      if (type === 'jobseeker') {
        const selects = ['jobseeker-major-filter', 'jobseeker-experience-filter', 'jobseeker-location-filter'];
        selects.forEach(selectId => {
          const select = document.getElementById(selectId);
          if (select) {
            select.value = '';
          }
        });
        
        // 검색 입력 필드 초기화
        const searchInput = document.getElementById('jobseeker-search-input');
        if (searchInput) {
          searchInput.value = '';
        }
      }
      
      // 구직자 목록 새로 로드
      loadJobSeekers();
    }
    
    console.log('📱 WOW-CAMPUS JavaScript 로드 완료 (프로필 기능 + 구직자 페이지 기능 포함)');
  `;
  
  c.header('Content-Type', 'application/javascript; charset=utf-8')
  c.header('Cache-Control', 'no-cache')
  return c.body(jsContent)
})

app.get('/static/style.css', (c) => {
  const cssContent = `
    /* WOW-CAMPUS Custom Styles */
    .container { 
      max-width: 1200px; 
    }
    
    .fade-in { 
      animation: fadeIn 0.5s ease-in; 
    }
    
    @keyframes fadeIn { 
      from { opacity: 0; } 
      to { opacity: 1; } 
    }
    
    .hover-scale { 
      transition: transform 0.2s; 
    }
    
    .hover-scale:hover { 
      transform: scale(1.02); 
    }
    
    /* 모달 스타일 */
    .modal-backdrop {
      backdrop-filter: blur(4px);
    }
    
    /* 모달 안정성을 위한 CSS */
    .modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 9999 !important;
      pointer-events: auto !important;
    }
    
    .modal-content {
      pointer-events: auto !important;
      position: relative !important;
      z-index: 10000 !important;
    }
    
    /* 모달이 열렸을 때 body 스타일 */
    body.modal-open {
      overflow: hidden !important;
      position: fixed !important;
      width: 100% !important;
      height: 100% !important;
    }
    
    /* 모달 외부 요소들 비활성화 */
    body.modal-open > *:not(.modal-overlay) {
      pointer-events: none !important;
      user-select: none !important;
    }
    
    /* 모달 애니메이션 */
    .modal-overlay {
      animation: modalFadeIn 0.2s ease-out;
    }
    
    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-content {
      animation: modalSlideIn 0.2s ease-out;
    }
    
    @keyframes modalSlideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    /* 버튼 호버 효과 */
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    }
    
    /* 알림 애니메이션 */
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .notification {
      animation: slideIn 0.3s ease-out;
    }
  `;
  
  c.header('Content-Type', 'text/css; charset=utf-8')
  c.header('Cache-Control', 'no-cache')
  return c.body(cssContent)
})

// Logo serving route
app.get('/wow-campus-logo.png', (c) => {
  // Since we're using a worker, we need to serve the logo manually
  // In a real deployment, this would read from the file system or CDN
  // For now, redirect to a fallback or serve inline base64
  c.header('Content-Type', 'image/png')
  c.header('Cache-Control', 'public, max-age=31536000')
  
  // Return 404 for now - in production this would serve the actual file
  return c.notFound() 
})

// CORS for API routes
app.use('/api/*', apiCors)

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/jobs', jobRoutes)
app.route('/api/jobseekers', jobseekersRoutes)
app.route('/api/matching', matching)

// Additional API endpoints for frontend functionality
app.get('/api/statistics', (c) => {
  return c.json({
    success: true,
    data: {
      jobs: 4,
      jobseekers: 14,
      reviews: 0,
      resumes: 0,
      matches: 7,
      companies: 12
    }
  })
})

// 월별 구인공고 현황 차트 데이터
app.get('/api/charts/monthly-jobs', (c) => {
  return c.json({
    success: true,
    data: {
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월'],
      data: [5, 8, 12, 15, 18, 22, 25, 28, 32, 35]
    }
  })
})

// 국가별 구직자 분포 차트 데이터
app.get('/api/charts/country-distribution', (c) => {
  return c.json({
    success: true,
    data: {
      labels: ['베트남', '중국', '필리핀', '태국', '일본', '미국', '러시아', '기타'],
      data: [35, 28, 18, 15, 12, 8, 6, 4]
    }
  })
})

// 비자 유형별 분포 차트 데이터
app.get('/api/charts/visa-types', (c) => {
  return c.json({
    success: true,
    data: {
      labels: ['E-7 (특정활동)', 'F-2 (거주)', 'D-2 (유학)', 'F-4 (재외동포)', 'E-9 (비전문취업)'],
      data: [45, 25, 15, 10, 5]
    }
  })
})

// 월별 매칭 성공률 차트 데이터
app.get('/api/charts/matching-rate', (c) => {
  return c.json({
    success: true,
    data: {
      labels: ['6월', '7월', '8월', '9월', '10월'],
      data: [65, 72, 78, 84, 89]
    }
  })
})

// 업종별 구인공고 차트 데이터
app.get('/api/charts/industry-jobs', (c) => {
  return c.json({
    success: true,
    data: {
      labels: ['IT/소프트웨어', '제조업', '서비스업', '건설업', '의료/헬스케어'],
      data: [28, 22, 18, 12, 8]
    }
  })
})

// ====== AI MATCHING ALGORITHM API ENDPOINTS ======

// 구직자를 위한 AI 매칭 - 적합한 구인공고 추천
app.get('/api/matching/jobs-for-jobseeker', (c) => {
  const userId = c.req.query('userId') || '1'  // 실제로는 JWT에서 추출
  const limit = parseInt(c.req.query('limit') || '10')
  
  // 가상의 구직자 데이터 (실제로는 DB에서 조회)
  const jobseekerProfile = {
    id: userId,
    name: "이민수",
    nationality: "베트남",
    skills: ["JavaScript", "React", "Node.js", "Python"],
    experience: 3, // 년수
    education: "대학교 졸업",
    preferredLocation: "서울",
    preferredSalary: 3500,
    koreanLevel: "중급",
    visa: "E-7"
  }
  
  // 가상의 구인공고 데이터
  const allJobs = [
    {
      id: 1, title: "프론트엔드 개발자", company: "테크스타트업A", location: "서울", 
      salary: 3800, skills: ["JavaScript", "React", "Vue.js"], experience: 2, visa: "E-7"
    },
    {
      id: 2, title: "풀스택 개발자", company: "IT기업B", location: "경기", 
      salary: 4200, skills: ["JavaScript", "Node.js", "React"], experience: 3, visa: "E-7"
    },
    {
      id: 3, title: "백엔드 개발자", company: "스타트업C", location: "서울", 
      salary: 3600, skills: ["Python", "Django", "PostgreSQL"], experience: 2, visa: "E-7"
    },
    {
      id: 4, title: "모바일 앱 개발자", company: "앱개발회사D", location: "부산", 
      salary: 3200, skills: ["React Native", "JavaScript"], experience: 1, visa: "E-7"
    },
    {
      id: 5, title: "데이터 분석가", company: "빅데이터회사E", location: "서울", 
      salary: 4000, skills: ["Python", "SQL", "Machine Learning"], experience: 2, visa: "E-7"
    }
  ]
  
  // AI 매칭 알고리즘 - 점수 계산
  const matchedJobs = allJobs.map(job => {
    let score = 0
    
    // 1. 스킬 매칭 (40점 만점)
    const skillMatch = job.skills.filter(skill => jobseekerProfile.skills.includes(skill)).length
    const skillScore = Math.min((skillMatch / job.skills.length) * 40, 40)
    score += skillScore
    
    // 2. 경력 매칭 (25점 만점)
    const expDiff = Math.abs(job.experience - jobseekerProfile.experience)
    const expScore = Math.max(25 - expDiff * 5, 0)
    score += expScore
    
    // 3. 지역 매칭 (20점 만점)
    const locationScore = job.location.includes(jobseekerProfile.preferredLocation) ? 20 : 
                         (job.location === "경기" && jobseekerProfile.preferredLocation === "서울") ? 10 : 5
    score += locationScore
    
    // 4. 급여 매칭 (10점 만점) 
    const salaryDiff = Math.abs(job.salary - jobseekerProfile.preferredSalary)
    const salaryScore = Math.max(10 - (salaryDiff / 100), 0)
    score += salaryScore
    
    // 5. 비자 매칭 (5점 만점)
    const visaScore = job.visa === jobseekerProfile.visa ? 5 : 0
    score += visaScore
    
    return {
      ...job,
      matchScore: Math.round(score),
      matchPercentage: Math.round((score / 100) * 100),
      reasons: [
        skillMatch > 0 ? `${skillMatch}개 스킬 매치` : null,
        expDiff <= 1 ? "경력 수준 적합" : null,
        job.location.includes(jobseekerProfile.preferredLocation) ? "선호 지역" : null,
        salaryDiff <= 200 ? "희망 급여 범위" : null
      ].filter(Boolean)
    }
  })
  
  // 점수순으로 정렬하고 상위 결과 반환
  const topMatches = matchedJobs
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
  
  return c.json({
    success: true,
    data: {
      jobseeker: jobseekerProfile,
      matches: topMatches,
      algorithm: {
        version: "1.0",
        factors: {
          skills: "40%",
          experience: "25%", 
          location: "20%",
          salary: "10%",
          visa: "5%"
        }
      }
    }
  })
})

// 기업을 위한 AI 매칭 - 적합한 구직자 추천
app.get('/api/matching/jobseekers-for-company', (c) => {
  const jobId = c.req.query('jobId') || '1'
  const limit = parseInt(c.req.query('limit') || '10')
  
  // 가상의 구인공고 데이터
  const jobPosting = {
    id: jobId,
    title: "프론트엔드 개발자",
    company: "테크스타트업A",
    location: "서울",
    salary: 3800,
    skills: ["JavaScript", "React", "Vue.js"],
    experience: 2,
    visa: "E-7"
  }
  
  // 가상의 구직자 데이터
  const allJobseekers = [
    {
      id: 1, name: "이민수", nationality: "베트남", skills: ["JavaScript", "React", "Node.js"],
      experience: 3, location: "서울", salary: 3500, koreanLevel: "중급", visa: "E-7"
    },
    {
      id: 2, name: "왕리화", nationality: "중국", skills: ["JavaScript", "Vue.js", "CSS"],
      experience: 2, location: "서울", salary: 3600, koreanLevel: "고급", visa: "E-7"
    },
    {
      id: 3, name: "존스미스", nationality: "미국", skills: ["React", "TypeScript", "Redux"],
      experience: 4, location: "경기", salary: 4000, koreanLevel: "중급", visa: "E-7"
    },
    {
      id: 4, name: "마리아", nationality: "필리핀", skills: ["JavaScript", "Angular", "Python"],
      experience: 1, location: "서울", salary: 3200, koreanLevel: "초급", visa: "E-9"
    },
    {
      id: 5, name: "사토시", nationality: "일본", skills: ["JavaScript", "React", "Vue.js"],
      experience: 2, location: "서울", salary: 3700, koreanLevel: "고급", visa: "E-7"
    }
  ]
  
  // AI 매칭 알고리즘 - 구직자 점수 계산
  const matchedJobseekers = allJobseekers.map(jobseeker => {
    let score = 0
    
    // 1. 스킬 매칭 (35점 만점)
    const skillMatch = jobPosting.skills.filter(skill => jobseeker.skills.includes(skill)).length
    const skillScore = Math.min((skillMatch / jobPosting.skills.length) * 35, 35)
    score += skillScore
    
    // 2. 경력 매칭 (25점 만점) 
    const expDiff = Math.abs(jobPosting.experience - jobseeker.experience)
    const expScore = Math.max(25 - expDiff * 5, 0)
    score += expScore
    
    // 3. 지역 매칭 (15점 만점)
    const locationScore = jobseeker.location === jobPosting.location ? 15 : 
                         (jobseeker.location === "경기" && jobPosting.location === "서울") ? 8 : 3
    score += locationScore
    
    // 4. 급여 적합성 (10점 만점)
    const salaryDiff = jobPosting.salary - jobseeker.salary
    const salaryScore = salaryDiff >= 0 ? Math.min(10, salaryDiff / 50) : Math.max(0, 10 + salaryDiff / 100)
    score += salaryScore
    
    // 5. 한국어 실력 (10점 만점)
    const koreanScore = jobseeker.koreanLevel === "고급" ? 10 : 
                       jobseeker.koreanLevel === "중급" ? 7 : 4
    score += koreanScore
    
    // 6. 비자 매칭 (5점 만점)
    const visaScore = jobseeker.visa === jobPosting.visa ? 5 : 0
    score += visaScore
    
    return {
      ...jobseeker,
      matchScore: Math.round(score),
      matchPercentage: Math.round((score / 100) * 100),
      reasons: [
        skillMatch > 0 ? `${skillMatch}개 스킬 보유` : null,
        expDiff <= 1 ? "적합한 경력" : null,
        jobseeker.location === jobPosting.location ? "같은 지역" : null,
        jobseeker.koreanLevel === "고급" ? "한국어 고급" : null
      ].filter(Boolean)
    }
  })
  
  // 점수순 정렬 후 반환
  const topMatches = matchedJobseekers
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
  
  return c.json({
    success: true,
    data: {
      jobPosting: jobPosting,
      matches: topMatches,
      algorithm: {
        version: "1.0",
        factors: {
          skills: "35%",
          experience: "25%",
          location: "15%", 
          salary: "10%",
          korean: "10%",
          visa: "5%"
        }
      }
    }
  })
})

// 전체 매칭 성공률 통계
app.get('/api/matching/success-rate', (c) => {
  return c.json({
    success: true,
    data: {
      overall: {
        rate: 87.3,
        totalMatches: 1247,
        successfulMatches: 1089,
        trend: "+5.2% from last month"
      },
      byCategory: [
        { category: "IT/소프트웨어", rate: 92.1, matches: 423 },
        { category: "제조업", rate: 84.7, matches: 298 },
        { category: "서비스업", rate: 89.2, matches: 186 },
        { category: "건설업", rate: 81.3, matches: 167 },
        { category: "의료/헬스케어", rate: 94.5, matches: 173 }
      ],
      byExperience: [
        { level: "신입 (0-1년)", rate: 76.8, matches: 234 },
        { level: "초급 (1-3년)", rate: 88.4, matches: 456 },
        { level: "중급 (3-5년)", rate: 91.7, matches: 387 },
        { level: "고급 (5년+)", rate: 95.2, matches: 170 }
      ],
      byNationality: [
        { country: "베트남", rate: 89.1, matches: 387 },
        { country: "중국", rate: 91.3, matches: 298 },
        { country: "필리핀", rate: 84.6, matches: 201 },
        { country: "태국", rate: 86.7, matches: 156 },
        { country: "기타", rate: 88.9, matches: 205 }
      ],
      monthlyTrend: [
        { month: "2024-06", rate: 82.1 },
        { month: "2024-07", rate: 84.3 },
        { month: "2024-08", rate: 86.8 },
        { month: "2024-09", rate: 85.4 },
        { month: "2024-10", rate: 87.3 }
      ]
    }
  })
})

// 개별 매칭 추천 실행
app.post('/api/matching/recommend', async (c) => {
  const { userId, userType, filters } = await c.req.json()
  
  // 실시간 매칭 처리 시뮬레이션
  setTimeout(() => {
    console.log(`Processing AI matching for ${userType} user: ${userId}`)
  }, 100)
  
  const getRedirectUrl = (type: string) => {
    switch(type) {
      case 'jobseeker': return '/matching/jobseeker'
      case 'company': return '/matching/company'
      case 'student': return '/matching/student'
      case 'agent': return '/matching/agent'
      default: return '/matching'
    }
  }
  
  return c.json({
    success: true,
    data: {
      message: "AI 매칭 분석이 완료되었습니다",
      processingTime: "0.8초", 
      matchId: `match_${Date.now()}`,
      redirect: getRedirectUrl(userType)
    }
  })
})

// 유학생을 위한 AI 매칭 - 적합한 대학 및 프로그램 추천
app.get('/api/matching/universities-for-student', (c) => {
  const userId = c.req.query('userId') || '1'
  const limit = parseInt(c.req.query('limit') || '10')
  
  // 가상의 유학생 데이터 (실제로는 DB에서 조회)
  const studentProfile = {
    id: userId,
    name: "김유학",
    nationality: "베트남",
    desiredField: "컴퓨터공학",
    educationLevel: "bachelor", // language, bachelor, master, phd
    koreanLevel: "중급",
    budget: 800, // 만원 (학기당)
    preferredLocation: "서울",
    gpa: 3.5,
    languageScores: {
      topik: 4,
      ielts: 6.5
    }
  }
  
  // 가상의 대학 프로그램 데이터
  const allPrograms = [
    {
      id: 1, university: "서울대학교", program: "컴퓨터공학과", location: "서울",
      tuition: 420, scholarshipRate: 80, koreanRequired: "중급", gpaRequired: 3.0,
      fields: ["컴퓨터공학", "소프트웨어", "AI"], level: "bachelor"
    },
    {
      id: 2, university: "연세대학교", program: "컴퓨터과학과", location: "서울", 
      tuition: 450, scholarshipRate: 70, koreanRequired: "고급", gpaRequired: 3.2,
      fields: ["컴퓨터과학", "빅데이터", "AI"], level: "bachelor"
    },
    {
      id: 3, university: "고려대학교", program: "소프트웨어학과", location: "서울",
      tuition: 440, scholarshipRate: 75, koreanRequired: "중급", gpaRequired: 3.1,
      fields: ["소프트웨어", "게임개발", "앱개발"], level: "bachelor"
    },
    {
      id: 4, university: "경희대학교", program: "컴퓨터공학과", location: "서울",
      tuition: 380, scholarshipRate: 85, koreanRequired: "중급", gpaRequired: 2.8,
      fields: ["컴퓨터공학", "정보보안", "네트워크"], level: "bachelor"
    },
    {
      id: 5, university: "부산대학교", program: "컴퓨터공학과", location: "부산",
      tuition: 320, scholarshipRate: 90, koreanRequired: "초급", gpaRequired: 2.5,
      fields: ["컴퓨터공학", "IoT", "임베디드"], level: "bachelor"
    }
  ]
  
  // AI 매칭 알고리즘 - 유학생-대학 프로그램 점수 계산
  const matchedPrograms = allPrograms.map(program => {
    let score = 0
    
    // 1. 전공 분야 매칭 (35점 만점)
    const fieldMatch = program.fields.some(field => field.includes(studentProfile.desiredField) || studentProfile.desiredField.includes(field))
    const fieldScore = fieldMatch ? 35 : 10
    score += fieldScore
    
    // 2. 학업 수준 매칭 (25점 만점)
    const levelScore = program.level === studentProfile.educationLevel ? 25 : 10
    score += levelScore
    
    // 3. 지역 선호도 (15점 만점)
    const locationScore = program.location.includes(studentProfile.preferredLocation) ? 15 : 
                         (program.location === "부산" && studentProfile.preferredLocation === "서울") ? 8 : 5
    score += locationScore
    
    // 4. 학비 적합성 (10점 만점)
    const tuitionDiff = Math.abs(program.tuition - studentProfile.budget)
    const tuitionScore = Math.max(10 - (tuitionDiff / 50), 0)
    score += tuitionScore
    
    // 5. 한국어 수준 (10점 만점)
    const koreanScore = (program.koreanRequired === "초급" && studentProfile.koreanLevel !== "초급") ? 10 :
                       (program.koreanRequired === studentProfile.koreanLevel) ? 8 : 5
    score += koreanScore
    
    // 6. GPA 요구사항 (5점 만점)
    const gpaScore = studentProfile.gpa >= program.gpaRequired ? 5 : 0
    score += gpaScore
    
    return {
      ...program,
      matchScore: Math.round(score),
      matchPercentage: Math.round((score / 100) * 100),
      reasons: [
        fieldMatch ? "전공 분야 매치" : null,
        program.level === studentProfile.educationLevel ? "학위 과정 적합" : null,
        program.location.includes(studentProfile.preferredLocation) ? "선호 지역" : null,
        tuitionDiff <= 100 ? "학비 범위 적합" : null,
        program.scholarshipRate >= 70 ? "장학금 기회 우수" : null
      ].filter(Boolean)
    }
  })
  
  // 점수순으로 정렬하고 상위 결과 반환
  const topMatches = matchedPrograms
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
  
  return c.json({
    success: true,
    data: {
      student: studentProfile,
      matches: topMatches,
      algorithm: {
        version: "1.0",
        factors: {
          major: "35%",
          level: "25%",
          location: "15%",
          tuition: "10%",
          korean: "10%",
          gpa: "5%"
        }
      }
    }
  })
})

// 매칭 피드백 저장 
app.post('/api/matching/feedback', async (c) => {
  const { matchId, rating, feedback } = await c.req.json()
  
  // 피드백 저장 로직 (실제로는 DB에 저장)
  console.log(`Match feedback saved: ${matchId}, Rating: ${rating}`)
  
  return c.json({
    success: true,
    message: "피드백이 성공적으로 저장되었습니다. AI 알고리즘 개선에 활용됩니다."
  })
})

app.get('/api/latest-information', (c) => {
  return c.json({
    success: true,
    data: {
      latestJobs: [
        {
          id: 1,
          title: "소프트웨어 개발자",
          category: "IT/소프트웨어",
          type: "정규직",
          company: "삼성전자",
          location: "서울"
        },
        {
          id: 2,
          title: "UX/UI 디자이너",
          category: "디자인",
          type: "정규직",
          company: "네이버",
          location: "경기"
        },
        {
          id: 3,
          title: "마케팅 매니저",
          category: "마케팅/영업",
          type: "계약직",
          company: "카카오",
          location: "제주"
        }
      ],
      latestJobseekers: [
        {
          id: 1,
          name: "김민수",
          nationality: "베트남",
          field: "IT/소프트웨어",
          experience: "3년 경력",
          skills: "Java, React",
          location: "서울 희망"
        },
        {
          id: 2,
          name: "이지원",
          nationality: "중국",
          field: "마케팅/영업",
          experience: "2년 경력",
          skills: "한국어 고급",
          location: "부산 희망"
        },
        {
          id: 3,
          name: "박준영",
          nationality: "필리핀",
          field: "디자인",
          experience: "신입",
          skills: "Photoshop, Figma",
          location: "경기 희망"
        }
      ]
    }
  })
})

app.post('/api/newsletter', async (c) => {
  const body = await c.req.json()
  const { email } = body
  
  // Basic email validation
  if (!email || !email.includes('@')) {
    return c.json({ success: false, message: '유효한 이메일 주소를 입력해주세요.' }, 400)
  }
  
  // Simulate newsletter subscription
  return c.json({ 
    success: true, 
    message: '뉴스레터 구독이 완료되었습니다!' 
  })
})

// Web pages with renderer
app.use(renderer)

// Jobs page
app.get('/jobs', (c) => {
  // 🔐 사용자 권한 정보 가져오기
  const userType = c.req.query('user') || 'guest'
  const userPermissions = renderUserSpecificUI(userType)
  
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
                <h4 class="font-semibold text-gray-900 mb-3">연봉범위</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_range" value="2000-3000" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">2,000-3,000만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_range" value="3000-4000" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">3,000-4,000만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_range" value="4000-5000" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">4,000-5,000만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_range" value="5000+" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm text-gray-700">5,000만원 이상</span>
                  </label>
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
          {/* Job listings will be loaded here */}
        </div>
      </main>
    </div>
  )
})


// Job Seekers page (구직정보 보기)
app.get('/jobseekers', (c) => {
  // 🔐 사용자 권한 정보 가져오기 (URL 파라미터로 시뮬레이션)
  const userType = c.req.query('user') || 'guest'
  const userPermissions = renderUserSpecificUI(userType)
  
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

        {/* Advanced Search and Filter */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Basic Search */}
          <div class="grid md:grid-cols-5 gap-4 mb-6">
            <input type="text" id="jobseeker-search-input" placeholder="이름, 기술 스택, 전공 검색" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            <select id="jobseeker-major-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
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
            <select id="jobseeker-experience-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="">경력 전체</option>
              <option value="entry">신입 (경력무관)</option>
              <option value="1-2">1-2년</option>
              <option value="3-5">3-5년</option>
              <option value="5+">5년 이상</option>
            </select>
            <select id="jobseeker-location-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
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
              <button onclick="searchJobSeekers()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex-1">
                <i class="fas fa-search mr-2"></i>검색
              </button>
              <button onclick="toggleAdvancedFilters('jobseeker')" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <i class="fas fa-filter mr-2"></i>고급
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div id="advanced-jobseeker-filters" class="border-t pt-6 hidden">
            <div class="grid lg:grid-cols-3 gap-6">
              {/* Nationality */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">국적</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="china" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">중국</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="vietnam" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">베트남</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="philippines" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">필리핀</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="thailand" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">태국</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="japan" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">일본</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="usa" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">미국</span>
                  </label>
                </div>
              </div>

              {/* Visa Status */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">비자 상태</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="E7" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">E-7 (특정활동)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="E9" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">E-9 (비전문취업)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="F2" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">F-2 (거주)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="F4" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">F-4 (재외동포)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="F5" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">F-5 (영주)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="D2" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">D-2 (유학)</span>
                  </label>
                </div>
              </div>

              {/* Korean Level */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">한국어 수준</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="beginner" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">초급 (기초 회화)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="elementary" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">초중급 (간단 업무)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="intermediate" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">중급 (일반 업무)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="advanced" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">고급 (유창한 소통)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="native" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">원어민 수준</span>
                  </label>
                </div>
              </div>

              {/* Location Preference */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">희망 근무지</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="seoul" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">서울</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="gyeonggi" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">경기</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="busan" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">부산</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="daegu" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">대구</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="incheon" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">인천</span>
                  </label>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">주요 기술</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="java" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">Java</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="python" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">Python</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="javascript" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">JavaScript</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="react" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">React</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="photoshop" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">Photoshop</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="marketing" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">디지털 마케팅</span>
                  </label>
                </div>
              </div>

              {/* Salary Expectation */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">희망 연봉</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="2000-2500" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">2,000-2,500만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="2500-3000" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">2,500-3,000만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="3000-3500" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">3,000-3,500만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="3500-4000" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">3,500-4,000만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="4000+" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">4,000만원 이상</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center mt-6 pt-4 border-t">
              <button onclick="clearAllFilters('jobseeker')" class="text-gray-600 hover:text-gray-800 text-sm">
                <i class="fas fa-times mr-2"></i>모든 필터 해제
              </button>
              <div class="flex gap-2">
                <button onclick="applyJobSeekerFilters()" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <i class="fas fa-filter mr-2"></i>필터 적용
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          <div id="active-jobseeker-filters" class="mt-4 hidden">
            <div class="flex flex-wrap gap-2">
              <span class="text-sm text-gray-600 mr-2">적용된 필터:</span>
              <div id="active-jobseeker-filters-list" class="flex flex-wrap gap-2">
                {/* Active filter badges will be inserted here */}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-3">
            <button onclick="showProfileModal('create')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <i class="fas fa-plus mr-2"></i>프로필 등록
            </button>
            <button onclick="loadJobSeekers()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <i class="fas fa-refresh mr-2"></i>새로고침
            </button>
          </div>
          <div class="text-sm text-gray-600">
            총 <span id="total-jobseekers">0</span>명의 구직자
          </div>
        </div>

        {/* Job Seekers List */}
        <div class="space-y-6" id="jobseekers-listings">
          <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">구직자 정보를 불러오는 중...</p>
          </div>
        </div>
      </main>

      {/* Profile Management Modal */}
      <div id="profile-modal" class="fixed inset-0 z-50 hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="hideProfileModal()"></div>
        <div class="flex items-center justify-center min-h-screen px-4 py-8">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div class="px-6 py-4 border-b">
              <div class="flex justify-between items-center">
                <h3 id="profile-modal-title" class="text-lg font-semibold text-gray-900">프로필 등록</h3>
                <button onclick="hideProfileModal()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form id="profile-form" class="p-6">
              <input type="hidden" id="profile-id" />
              <input type="hidden" id="profile-user-id" />
              
              {/* User Type Selection */}
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형 *</label>
                <select id="profile-user-type" name="user_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value="">유형을 선택하세요</option>
                  <option value="jobseeker">구직자</option>
                  <option value="company">구인기업</option>
                  <option value="agent">에이전트</option>
                </select>
              </div>

              {/* Dynamic Profile Fields Container */}
              <div id="profile-fields-container">
                {/* Fields will be dynamically generated based on user type */}
              </div>

              <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onclick="hideProfileModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  취소
                </button>
                <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <i class="fas fa-save mr-2"></i>저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Profile Detail View Modal */}
      <div id="profile-detail-modal" class="fixed inset-0 z-50 hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="hideProfileDetailModal()"></div>
        <div class="flex items-center justify-center min-h-screen px-4 py-8">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div class="px-6 py-4 border-b">
              <div class="flex justify-between items-center">
                <h3 id="profile-detail-title" class="text-lg font-semibold text-gray-900">프로필 상세정보</h3>
                <div class="flex gap-2">
                  <button id="profile-detail-edit-btn" onclick="editProfileFromDetail()" class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                    <i class="fas fa-edit mr-1"></i>수정
                  </button>
                  <button onclick="hideProfileDetailModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <div id="profile-detail-content">
                {/* Profile details will be loaded here */}
                <div class="text-center py-12">
                  <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                  <p class="text-gray-600">프로필 정보를 불러오는 중...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Agents Dashboard page (에이전트 관리)
app.get('/agents', (c) => {
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

      {/* Agents Dashboard Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">에이전트 대시보드</h1>
          <p class="text-gray-600 text-lg">해외 에이전트 관리 및 성과 분석</p>
        </div>

        {/* Agent Statistics */}
        <div class="grid md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-user-tie text-purple-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-purple-600 mb-2">25</div>
            <div class="text-gray-600 font-medium">등록 에이전트</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-green-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-green-600 mb-2">148</div>
            <div class="text-gray-600 font-medium">관리 구직자</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-handshake text-blue-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-2">89</div>
            <div class="text-gray-600 font-medium">매칭 성공</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-dollar-sign text-orange-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-orange-600 mb-2">$12.5K</div>
            <div class="text-gray-600 font-medium">월 수수료</div>
          </div>
        </div>

        {/* Agent Management Tools */}
        <div class="grid md:grid-cols-2 gap-8">
          {/* Agent Performance */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">에이전트 성과</h2>
              <button class="text-purple-600 text-sm font-medium hover:underline">전체보기</button>
            </div>
            <div class="space-y-4" id="agent-performance-list">
              {/* Agent performance will be loaded here */}
            </div>
          </div>

          {/* Recent Activities */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">최근 활동</h2>
              <button class="text-purple-600 text-sm font-medium hover:underline">전체보기</button>
            </div>
            <div class="space-y-4" id="agent-activities-list">
              {/* Agent activities will be loaded here */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Statistics page  
app.get('/statistics', (c) => {
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
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/agents" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">에이전트</a>
            <a href="/statistics" class="text-orange-600 font-medium">통계</a>
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

      {/* Statistics Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">통계 대시보드</h1>
          <p class="text-gray-600 text-lg">실시간 플랫폼 운영 현황과 성과를 확인하세요</p>
        </div>

        {/* Main Statistics */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-briefcase text-blue-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-2">4</div>
            <div class="text-gray-600 font-medium">구인공고</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-green-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-green-600 mb-2">14</div>
            <div class="text-gray-600 font-medium">구직자</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-handshake text-purple-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-purple-600 mb-2">7</div>
            <div class="text-gray-600 font-medium">매칭 성공</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-building text-orange-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-orange-600 mb-2">12</div>
            <div class="text-gray-600 font-medium">참여 기업</div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">월별 구인공고 현황</h3>
            <div class="h-64 relative">
              <canvas id="monthlyJobsChart" class="w-full h-full"></canvas>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">국가별 구직자 분포</h3>
            <div class="h-64 relative">
              <canvas id="countryDistributionChart" class="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div class="grid md:grid-cols-3 gap-8 mt-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">비자 유형별 분포</h3>
            <div class="h-48 relative">
              <canvas id="visaTypeChart" class="w-full h-full"></canvas>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">월별 매칭 성공률</h3>
            <div class="h-48 relative">
              <canvas id="matchingRateChart" class="w-full h-full"></canvas>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">업종별 구인공고</h3>
            <div class="h-48 relative">
              <canvas id="industryJobsChart" class="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div class="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">실시간 플랫폼 현황</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-blue-600">156</div>
              <div class="text-sm text-gray-600">총 지원자</div>
            </div>
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-green-600">89</div>
              <div class="text-sm text-gray-600">면접 진행</div>
            </div>
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-purple-600">34</div>
              <div class="text-sm text-gray-600">최종 합격</div>
            </div>
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-orange-600">67%</div>
              <div class="text-sm text-gray-600">만족도</div>
            </div>
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-red-600">23</div>
              <div class="text-sm text-gray-600">활성 에이전트</div>
            </div>
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-indigo-600">8.4</div>
              <div class="text-sm text-gray-600">평균 점수</div>
            </div>
          </div>
        </div>

        {/* Chart Script */}
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          {`
          // Chart.js 초기화 및 차트 생성
          document.addEventListener('DOMContentLoaded', function() {
            initializeCharts();
          });

          async function initializeCharts() {
            try {
              // 차트 데이터 로드
              const monthlyJobsData = await fetch('/api/charts/monthly-jobs').then(r => r.json());
              const countryData = await fetch('/api/charts/country-distribution').then(r => r.json());
              const visaData = await fetch('/api/charts/visa-types').then(r => r.json());
              const matchingData = await fetch('/api/charts/matching-rate').then(r => r.json());
              const industryData = await fetch('/api/charts/industry-jobs').then(r => r.json());

              // 월별 구인공고 현황 차트 (라인 차트)
              const monthlyJobsCtx = document.getElementById('monthlyJobsChart').getContext('2d');
              new Chart(monthlyJobsCtx, {
                type: 'line',
                data: {
                  labels: monthlyJobsData.labels,
                  datasets: [{
                    label: '구인공고 수',
                    data: monthlyJobsData.data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }
              });

              // 국가별 구직자 분포 차트 (도넛 차트)
              const countryCtx = document.getElementById('countryDistributionChart').getContext('2d');
              new Chart(countryCtx, {
                type: 'doughnut',
                data: {
                  labels: countryData.labels,
                  datasets: [{
                    data: countryData.data,
                    backgroundColor: [
                      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
                      '#EF4444', '#06B6D4', '#84CC16', '#F97316'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 12
                        }
                      }
                    }
                  }
                }
              });

              // 비자 유형별 분포 차트 (파이 차트)
              const visaCtx = document.getElementById('visaTypeChart').getContext('2d');
              new Chart(visaCtx, {
                type: 'pie',
                data: {
                  labels: visaData.labels,
                  datasets: [{
                    data: visaData.data,
                    backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 11 }
                      }
                    }
                  }
                }
              });

              // 월별 매칭 성공률 차트 (바 차트)
              const matchingCtx = document.getElementById('matchingRateChart').getContext('2d');
              new Chart(matchingCtx, {
                type: 'bar',
                data: {
                  labels: matchingData.labels,
                  datasets: [{
                    label: '매칭 성공률 (%)',
                    data: matchingData.data,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    },
                    x: { grid: { display: false } }
                  }
                }
              });

              // 업종별 구인공고 차트 (수평 바 차트)
              const industryCtx = document.getElementById('industryJobsChart').getContext('2d');
              new Chart(industryCtx, {
                type: 'bar',
                data: {
                  labels: industryData.labels,
                  datasets: [{
                    data: industryData.data,
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)', 
                      'rgba(139, 92, 246, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                      'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 
                      'rgb(139, 92, 246)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)'
                    ],
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    },
                    y: { grid: { display: false } }
                  }
                }
              });

            } catch (error) {
              console.error('차트 로드 실패:', error);
            }
          }
          `}
        </script>
      </main>
    </div>
  )
})

// Main page
app.get('/', (c) => {
  // 🔐 사용자 권한 정보 가져오기 (임시로 쿼리 파라미터로 사용자 타입 시뮬레이션)
  const userType = c.req.query('user') || 'guest'
  const userPermissions = renderUserSpecificUI(userType)
  
  return c.render(
    <div class="min-h-screen bg-white">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
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
          
          {/* Desktop Navigation */}
          <div class="hidden lg:flex items-center space-x-8">
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                서비스
                <i class="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <div id="service-dropdown-container" class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {/* 동적 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>
            <a href="/statistics" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">통계</a>
            <a href="/matching" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">매칭 시스템</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                언어
                <i class="fas fa-globe ml-1 text-xs"></i>
              </button>
              <div class="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="#" onclick="changeLanguage('ko')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">한국어</a>
                <a href="#" onclick="changeLanguage('en')" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">English</a>
              </div>
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
            
            {/* Mobile Menu Button */}
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" class="lg:hidden bg-white border-t border-gray-200 hidden">
          <div class="container mx-auto px-4 py-4 space-y-4">
            <div class="space-y-2">
              <div class="font-semibold text-gray-900 mb-2">서비스</div>
              <div id="mobile-service-menu-container">
                {/* 동적 모바일 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>
            <a href="/statistics" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">통계</a>
            <a href="/matching" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">매칭 시스템</a>
            <a href="/support" class="block py-2 text-gray-600 hover:text-blue-600 font-medium">고객지원</a>
            <div class="pt-4 border-t border-gray-200">
              <div class="font-semibold text-gray-900 mb-2">언어 설정</div>
              <a href="#" onclick="changeLanguage('ko')" class="block pl-4 py-2 text-gray-600">한국어</a>
              <a href="#" onclick="changeLanguage('en')" class="block pl-4 py-2 text-gray-600">English</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - 사용자별 맞춤형 컨텐츠 */}
      <section class="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">WOW-CAMPUS</h1>
          
          {/* 🎯 사용자 타입별 맞춤형 메시지 */}
          {userType === 'guest' && (
            <>
              <p class="text-xl md:text-2xl text-blue-600 font-semibold mb-4">외국인을 위한 한국 취업 & 유학 플랫폼</p>
              <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">해외 에이전트와 국내 기업을 연결하여 외국인 인재의 한국 진출을 지원합니다</p>
            </>
          )}
          
          {userType === 'jobseeker' && (
            <>
              <p class="text-xl md:text-2xl text-green-600 font-semibold mb-4">🎯 맞춤형 일자리를 찾아보세요</p>
              <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">AI 매칭으로 당신에게 딱 맞는 기업을 추천해드립니다</p>
            </>
          )}
          
          {userType === 'company' && (
            <>
              <p class="text-xl md:text-2xl text-purple-600 font-semibold mb-4">🏢 우수한 외국인 인재를 찾으세요</p>
              <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">검증된 해외 에이전트를 통해 최적의 인재를 빠르게 채용하세요</p>
            </>
          )}
          
          {userType === 'agent' && (
            <>
              <p class="text-xl md:text-2xl text-blue-600 font-semibold mb-4">🤝 전문 매칭 서비스로 성과를 높이세요</p>
              <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">체계적인 관리 도구와 분석 리포트로 더 나은 결과를 만들어보세요</p>
            </>
          )}
          
          {userType === 'student' && (
            <>
              <p class="text-xl md:text-2xl text-orange-600 font-semibold mb-4">🎓 성공적인 한국 유학을 시작하세요</p>
              <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">한국어 연수부터 학위 취득까지 체계적인 유학 지원을 받으세요</p>
            </>
          )}
          
          {userType === 'admin' && (
            <>
              <p class="text-xl md:text-2xl text-red-600 font-semibold mb-4">⚙️ 플랫폼 관리 대시보드</p>
              <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">전체 시스템 현황과 사용자 관리 기능을 확인하세요</p>
            </>
          )}
          
          {/* 🔗 사용자별 액션 버튼 */}
          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {userType === 'guest' && (
              <>
                <a href="/jobs" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  구인정보 보기 →
                </a>
                <a href="/jobseekers" class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  구직정보 보기 →
                </a>
                <a href="/study" class="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                  유학정보 보기 →
                </a>
              </>
            )}
            
            {userType === 'jobseeker' && (
              <>
                <a href="/jobseekers/profile" class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  <i class="fas fa-user mr-2"></i>내 프로필 관리
                </a>
                <a href="/jobs" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <i class="fas fa-search mr-2"></i>일자리 찾기
                </a>
                <a href="/matching/jobseeker" class="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  <i class="fas fa-magic mr-2"></i>AI 매칭
                </a>
              </>
            )}
            
            {userType === 'company' && (
              <>
                <a href="/jobs/post" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <i class="fas fa-plus mr-2"></i>채용공고 등록
                </a>
                <a href="/jobs/manage" class="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  <i class="fas fa-briefcase mr-2"></i>채용 관리
                </a>
                <a href="/matching/company" class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  <i class="fas fa-users mr-2"></i>인재 추천
                </a>
              </>
            )}
            
            {userType === 'agent' && (
              <>
                <a href="/agents/dashboard" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <i class="fas fa-chart-line mr-2"></i>대시보드
                </a>
                <a href="/agents/clients" class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  <i class="fas fa-handshake mr-2"></i>클라이언트 관리
                </a>
                <a href="/matching/agent" class="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  <i class="fas fa-magic mr-2"></i>매칭 관리
                </a>
              </>
            )}
            
            {userType === 'student' && (
              <>
                <a href="/study/programs" class="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                  <i class="fas fa-graduation-cap mr-2"></i>유학 프로그램
                </a>
                <a href="/study/profile" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <i class="fas fa-user-edit mr-2"></i>내 프로필 관리
                </a>
                <a href="/matching/student" class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  <i class="fas fa-university mr-2"></i>대학 매칭
                </a>
              </>
            )}
            
            {userType === 'admin' && (
              <>
                <a href="/admin/users" class="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  <i class="fas fa-users-cog mr-2"></i>사용자 관리
                </a>
                <a href="/admin/statistics" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <i class="fas fa-chart-bar mr-2"></i>통계 및 분석
                </a>
                <a href="/admin/settings" class="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                  <i class="fas fa-cog mr-2"></i>시스템 설정
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Services Section - 사용자별 맞춤형 서비스 */}
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            {userType === 'guest' && (
              <>
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">우리의 서비스</h2>
                <p class="text-gray-600 text-lg">외국인 구직자와 국내 기업을 연결하는 전문 플랫폼</p>
              </>
            )}
            
            {userType === 'jobseeker' && (
              <>
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">구직자 맞춤 서비스</h2>
                <p class="text-gray-600 text-lg">당신의 성공적인 취업을 위한 전문 지원 서비스</p>
              </>
            )}
            
            {userType === 'company' && (
              <>
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">기업 채용 솔루션</h2>
                <p class="text-gray-600 text-lg">우수한 외국인 인재 채용을 위한 전문 서비스</p>
              </>
            )}
            
            {userType === 'agent' && (
              <>
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">에이전트 전용 도구</h2>
                <p class="text-gray-600 text-lg">전문적인 매칭과 관리를 위한 체계적 솔루션</p>
              </>
            )}
            
            {userType === 'student' && (
              <>
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">유학생 지원 서비스</h2>
                <p class="text-gray-600 text-lg">성공적인 한국 유학을 위한 전문 지원과 관리 서비스</p>
              </>
            )}
            
            {userType === 'admin' && (
              <>
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">관리자 도구</h2>
                <p class="text-gray-600 text-lg">플랫폼 전체 관리와 모니터링 기능</p>
              </>
            )}
          </div>
          
          {/* 🎯 사용자별 맞춤형 서비스 카드 */}
          <div class="grid md:grid-cols-3 gap-8">
            {/* Guest 사용자 - 일반적인 서비스 소개 */}
            {userType === 'guest' && (
              <>
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-handshake text-2xl text-blue-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">구인구직 매칭</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    비자별, 직종별, 지역별 맞춤 매칭 서비스로 최적의 일자리를 찾아드립니다
                  </p>
                  <a href="/jobs" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    구인정보 보기 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-graduation-cap text-2xl text-green-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">유학 지원</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    한국어 연수부터 학위과정까지 전 과정에 대한 체계적 지원을 제공합니다
                  </p>
                  <a href="/study" class="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors">
                    유학정보 보기 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-users text-2xl text-purple-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">구직자 관리</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    우수한 외국인 구직자들의 프로필과 경력을 확인하고 매칭하세요
                  </p>
                  <a href="/jobseekers" class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                    구직정보 보기 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </>
            )}
            
            {/* 구직자용 서비스 */}
            {userType === 'jobseeker' && (
              <>
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-user-edit text-2xl text-green-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">프로필 관리</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    이력서, 자기소개서, 포트폴리오를 체계적으로 관리하고 기업에게 어필하세요
                  </p>
                  <a href="/jobseekers/profile" class="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors">
                    프로필 관리 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-search text-2xl text-blue-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">일자리 검색</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    당신의 조건에 맞는 일자리를 찾고 바로 지원해보세요
                  </p>
                  <a href="/jobs" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    일자리 찾기 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-magic text-2xl text-purple-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">AI 매칭</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    AI가 분석한 당신에게 딱 맞는 기업들을 추천받으세요
                  </p>
                  <a href="/matching/jobseeker" class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                    매칭 받기 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </>
            )}
            
            {/* 기업용 서비스 */}
            {userType === 'company' && (
              <>
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-plus-circle text-2xl text-blue-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">채용공고 등록</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    우수한 외국인 인재를 찾기 위한 상세한 채용공고를 등록하세요
                  </p>
                  <a href="/jobs/post" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    공고 등록 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-briefcase text-2xl text-purple-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">채용 관리</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    지원자 관리부터 면접 일정까지 체계적으로 관리하세요
                  </p>
                  <a href="/jobs/manage" class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                    채용 관리 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-users text-2xl text-green-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">인재 추천</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    AI가 분석한 귀사에 적합한 우수 인재를 추천받으세요
                  </p>
                  <a href="/matching/company" class="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors">
                    인재 추천 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </>
            )}
            
            {/* 에이전트용 서비스 */}
            {userType === 'agent' && (
              <>
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-chart-line text-2xl text-blue-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">성과 대시보드</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    매칭 성공률, 수수료 현황 등을 실시간으로 확인하세요
                  </p>
                  <a href="/agents/dashboard" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    대시보드 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-handshake text-2xl text-green-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">클라이언트 관리</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    구직자와 기업 클라이언트를 체계적으로 관리하고 상담하세요
                  </p>
                  <a href="/agents/clients" class="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors">
                    클라이언트 관리 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-magic text-2xl text-purple-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">매칭 관리</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    전문적인 매칭 서비스로 더 높은 성공률을 달성하세요
                  </p>
                  <a href="/matching/agent" class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                    매칭 관리 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </>
            )}
            
            {/* 관리자용 서비스 */}
            {userType === 'admin' && (
              <>
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-users-cog text-2xl text-red-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">사용자 관리</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    전체 사용자 계정과 권한을 체계적으로 관리하세요
                  </p>
                  <a href="/admin/users" class="inline-flex items-center text-red-600 font-semibold hover:text-red-800 transition-colors">
                    사용자 관리 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-chart-bar text-2xl text-blue-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">통계 및 분석</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    플랫폼 전체의 상세 통계와 분석 리포트를 확인하세요
                  </p>
                  <a href="/admin/statistics" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    통계 분석 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-cog text-2xl text-gray-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">시스템 설정</h3>
                  <p class="text-gray-600 mb-6 leading-relaxed">
                    플랫폼의 각종 설정과 정책을 관리하세요
                  </p>
                  <a href="/admin/settings" class="inline-flex items-center text-gray-600 font-semibold hover:text-gray-800 transition-colors">
                    시스템 설정 <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Latest Information Section */}
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">최신 정보</h2>
            <p class="text-gray-600 text-lg">실시간으로 업데이트되는 구인정보와 구직자 정보를 확인하세요</p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8">
            {/* 최신 구인정보 */}
            <div class="bg-white border rounded-lg overflow-hidden" data-section="latest-jobs">
              <div class="bg-blue-50 px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">최신 구인정보</h3>
                  <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">3건</span>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">소프트웨어 개발자</h4>
                  <p class="text-sm text-gray-600">IT/소프트웨어 • 정규직</p>
                  <p class="text-xs text-gray-500 mt-2">삼성전자 • 서울</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">UX/UI 디자이너</h4>
                  <p class="text-sm text-gray-600">디자인 • 정규직</p>
                  <p class="text-xs text-gray-500 mt-2">네이버 • 경기</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">마케팅 매니저</h4>
                  <p class="text-sm text-gray-600">마케팅/영업 • 계약직</p>
                  <p class="text-xs text-gray-500 mt-2">카카오 • 제주</p>
                </div>
                <div class="text-center">
                  <a href="/jobs" class="text-blue-600 hover:underline text-sm font-medium">
                    전체 구인정보 보기
                  </a>
                </div>
              </div>
            </div>

            {/* 최신 구직정보 */}
            <div class="bg-white border rounded-lg overflow-hidden" data-section="latest-jobseekers">
              <div class="bg-green-50 px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">최신 구직정보</h3>
                  <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm">5건</span>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">김민수 (베트남)</h4>
                  <p class="text-sm text-gray-600">IT/소프트웨어 • 3년 경력</p>
                  <p class="text-xs text-gray-500 mt-2">Java, React • 서울 희망</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">이지원 (중국)</h4>
                  <p class="text-sm text-gray-600">마케팅/영업 • 2년 경력</p>
                  <p class="text-xs text-gray-500 mt-2">한국어 고급 • 부산 희망</p>
                </div>
                <div class="border-b pb-4">
                  <h4 class="font-semibold text-gray-900">박준영 (필리핀)</h4>
                  <p class="text-sm text-gray-600">디자인 • 신입</p>
                  <p class="text-xs text-gray-500 mt-2">Photoshop, Figma • 경기 희망</p>
                </div>
                <div class="text-center">
                  <a href="/jobseekers" class="text-green-600 hover:underline text-sm font-medium">
                    전체 구직정보 보기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Dashboard Section */}
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="text-center mb-8">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">WOW-CAMPUS 통계</h2>
              <p class="text-gray-600 text-lg">우리 플랫폼의 현재 현황을 한눈에 확인하세요</p>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-briefcase text-2xl text-blue-600"></i>
                </div>
                <div class="text-4xl font-bold text-blue-600 mb-2" data-stat="jobs">4</div>
                <div class="text-gray-600 font-medium">구인공고</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-users text-2xl text-green-600"></i>
                </div>
                <div class="text-4xl font-bold text-green-600 mb-2" data-stat="jobseekers">14</div>
                <div class="text-gray-600 font-medium">구직자</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-star text-2xl text-purple-600"></i>
                </div>
                <div class="text-4xl font-bold text-purple-600 mb-2" data-stat="reviews">0</div>
                <div class="text-gray-600 font-medium">후기</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-file-alt text-2xl text-orange-600"></i>
                </div>
                <div class="text-4xl font-bold text-orange-600 mb-2" data-stat="resumes">0</div>
                <div class="text-gray-600 font-medium">이력서</div>
              </div>
            </div>
          </div>
          
          {/* Additional Service Items */}
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">구인공고 상세정보</h3>
              <p class="text-gray-600 text-sm mb-4">상세한 구인 조건과 요구사항을 확인하세요</p>
              <a href="/jobs" class="text-blue-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">구직자 상세정보</h3>
              <p class="text-gray-600 text-sm mb-4">구직자의 상세한 프로필과 경력을 확인하세요</p>
              <a href="/jobseekers" class="text-green-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">스마트 매칭 시스템</h3>
              <p class="text-gray-600 text-sm mb-4">AI 기반으로 구직자의 조건과 구인공고를 자동 매칭합니다</p>
              <a href="/matching" class="text-purple-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">유학 프로그램</h3>
              <p class="text-gray-600 text-sm mb-4">한국어 연수부터 학위과정까지 체계적인 유학 지원</p>
              <a href="/study" class="text-orange-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">통계 대시보드</h3>
              <p class="text-gray-600 text-sm mb-4">실시간 플랫폼 운영 현황과 성과를 확인하세요</p>
              <a href="/statistics" class="text-red-600 text-sm font-medium hover:underline">보기 →</a>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">시작하기</h2>
            <p class="text-gray-600 text-lg">간단한 3단계로 WOW-CAMPUS를 시작하세요</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">1</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">회원가입</h3>
              <p class="text-gray-600 leading-relaxed">
                간단한 정보 입력으로<br/>
                회원가입을 완료하세요
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">2</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">정보 등록</h3>
              <p class="text-gray-600 leading-relaxed">
                구직 또는 구인 정보를<br/>
                등록하고 매칭을 기다리세요
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">3</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">매칭 성공</h3>
              <p class="text-gray-600 leading-relaxed">
                전문 에이전트의 도움으로<br/>
                성공적인 취업 또는 인재 발굴
              </p>
            </div>
          </div>
          
          <div class="text-center mt-12">
            <button onclick="showGetStartedModal()" class="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              지금 시작하기 <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="bg-gray-900 text-white">
        <div class="container mx-auto px-4 py-16">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div class="lg:col-span-2">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-xl">W</span>
                </div>
                <div>
                  <div class="font-bold text-2xl">WOW-CAMPUS</div>
                  <div class="text-gray-400 text-sm">외국인 구인구직 및 유학생 지원플랫폼</div>
                </div>
              </div>
              <p class="text-gray-300 mb-6 leading-relaxed">
                해외 에이전트와 국내 기업을 연결하여 외국인 인재의 한국 진출을 지원하는 전문 플랫폼입니다. 
                체계적인 매칭 시스템과 유학 지원 서비스로 성공적인 한국 정착을 돕겠습니다.
              </p>
              
              {/* Contact Info */}
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <i class="fas fa-envelope text-blue-400"></i>
                  <span class="text-gray-300">info@wow-campus.kr</span>
                </div>
                <div class="flex items-center space-x-3">
                  <i class="fas fa-phone text-blue-400"></i>
                  <span class="text-gray-300">02-1234-5678</span>
                </div>
                <div class="flex items-center space-x-3">
                  <i class="fas fa-map-marker-alt text-blue-400"></i>
                  <span class="text-gray-300">서울특별시 강남구 테헤란로 123</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 class="font-semibold text-lg mb-6">서비스</h3>
              <ul class="space-y-3">
                <li><a href="/jobs" class="text-gray-300 hover:text-white transition-colors">구인정보</a></li>
                <li><a href="/study" class="text-gray-300 hover:text-white transition-colors">유학지원</a></li>
                <li><a href="/agents" class="text-gray-300 hover:text-white transition-colors">에이전트</a></li>
                <li><a href="/matching" class="text-gray-300 hover:text-white transition-colors">스마트 매칭</a></li>
                <li><a href="/statistics" class="text-gray-300 hover:text-white transition-colors">통계 대시보드</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 class="font-semibold text-lg mb-6">고객지원</h3>
              <ul class="space-y-3">
                <li><a href="/faq" class="text-gray-300 hover:text-white transition-colors">자주 묻는 질문</a></li>
                <li><a href="/guide" class="text-gray-300 hover:text-white transition-colors">이용가이드</a></li>
                <li><a href="/contact" class="text-gray-300 hover:text-white transition-colors">문의하기</a></li>
                <li><a href="/notice" class="text-gray-300 hover:text-white transition-colors">공지사항</a></li>
                <li><a href="/blog" class="text-gray-300 hover:text-white transition-colors">블로그</a></li>
              </ul>
            </div>
          </div>

          {/* Social Links & Newsletter */}
          <div class="border-t border-gray-800 mt-12 pt-8">
            <div class="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Social Links */}
              <div class="flex items-center space-x-6">
                <span class="text-gray-400 font-medium">팔로우하기:</span>
                <div class="flex space-x-4">
                  <a href="https://www.facebook.com/wowcampus.kr" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors" title="Facebook에서 팔로우하기">
                    <i class="fab fa-facebook-f text-white"></i>
                  </a>
                  <a href="https://www.instagram.com/wowcampus.kr" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors" title="Instagram에서 팔로우하기">
                    <i class="fab fa-instagram text-white"></i>
                  </a>
                  <a href="https://www.linkedin.com/company/wowcampus" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors" title="LinkedIn에서 연결하기">
                    <i class="fab fa-linkedin-in text-white"></i>
                  </a>
                  <a href="https://www.youtube.com/@wowcampus" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors" title="YouTube에서 구독하기">
                    <i class="fab fa-youtube text-white"></i>
                  </a>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div class="flex items-center space-x-3">
                <span class="text-gray-400 font-medium">뉴스레터:</span>
                <div class="flex">
                  <input 
                    type="email" 
                    id="newsletter-email"
                    placeholder="이메일 주소" 
                    class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button onclick="subscribeNewsletter()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div class="border-t border-gray-800 mt-8 pt-8">
            <div class="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div class="text-gray-400 text-sm">
                © 2024 WOW-CAMPUS. All rights reserved.
              </div>
              <div class="flex items-center space-x-6 text-sm">
                <a href="/terms" class="text-gray-400 hover:text-white transition-colors">이용약관</a>
                <a href="/privacy" class="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
                <a href="/cookies" class="text-gray-400 hover:text-white transition-colors">쿠키 정책</a>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-400">사업자등록번호:</span>
                  <span class="text-gray-300">123-45-67890</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login/Signup Modals */}
      <div id="login-modal" class="fixed inset-0 z-50 hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="hideLoginModal()"></div>
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="px-6 py-4 border-b">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">로그인</h3>
                <button onclick="hideLoginModal()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form id="login-form" class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="이메일을 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                  <input type="password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="비밀번호를 입력하세요" />
                </div>
              </div>
              <div class="mt-6">
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  로그인
                </button>
              </div>
              <div class="mt-4 text-center">
                <button type="button" onclick="hideLoginModal(); showSignupModal();" class="text-blue-600 hover:text-blue-800 text-sm">
                  아직 회원이 아니신가요? 회원가입
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="signup-modal" class="fixed inset-0 z-50 hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="hideSignupModal()"></div>
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
            <div class="px-6 py-4 border-b">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">회원가입</h3>
                <button onclick="hideSignupModal()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form id="signup-form" class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                  <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="이메일을 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 *</label>
                  <input type="password" name="password" required minlength="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="최소 6자 이상" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 *</label>
                  <input type="password" name="confirmPassword" required minlength="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="비밀번호를 다시 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형 *</label>
                  <select name="user_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">선택하세요</option>
                    <option value="jobseeker">구직자</option>
                    <option value="company">구인기업</option>
                    <option value="agent">에이전트</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                  <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="이름을 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                  <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="연락처를 입력하세요" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">지역 *</label>
                  <select name="location" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">지역을 선택하세요</option>
                    <option value="서울">서울</option>
                    <option value="경기도">경기도</option>
                    <option value="강원도">강원도</option>
                    <option value="충청도">충청도</option>
                    <option value="경상도">경상도</option>
                    <option value="전라도">전라도</option>
                    <option value="제주도">제주도</option>
                  </select>
                </div>
              </div>
              <div class="mt-6">
                <button type="submit" id="signup-submit-btn" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  회원가입
                </button>
              </div>
              <div class="mt-4 text-center">
                <button type="button" onclick="hideSignupModal(); showLoginModal();" class="text-blue-600 hover:text-blue-800 text-sm">
                  이미 회원이신가요? 로그인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Authentication JavaScript - Direct Implementation */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Authentication JavaScript loading...');
            
            // Helper function to get user type label
            function getUserTypeLabel(userType) {
              const labels = {
                jobseeker: '구직자',
                company: '구인기업', 
                agent: '에이전트',
                admin: '관리자'
              };
              return labels[userType] || '사용자';
            }
            
            // 🔐 로그인 모달 표시
            function showLoginModal() {
              console.log('로그인 모달 호출됨');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"]');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modalId = 'loginModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999'; // 매우 높은 z-index
              modal.innerHTML = \`
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">로그인</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
                      <i class="fas fa-times text-xl"></i>
                    </button>
                  </div>
                  
                  <form id="loginForm" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이메일을 입력하세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 입력하세요" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        로그인
                      </button>
                    </div>
                    
        {/* 아이디/비밀번호 찾기 링크 */}
                    <div class="mt-4 text-center text-sm">
                      <div class="flex justify-center space-x-4">
                        <button type="button" class="find-email-btn text-blue-600 hover:text-blue-800 underline">
                          이메일 찾기
                        </button>
                        <span class="text-gray-400">|</span>
                        <button type="button" class="find-password-btn text-blue-600 hover:text-blue-800 underline">
                          비밀번호 찾기
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              \`;
              
              // 페이지 스크롤 및 상호작용 비활성화
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              
              document.body.appendChild(modal);
              
              // 모든 클릭 이벤트 완전 차단 (모달 외부)
              const stopAllEvents = function(event) {
                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent.contains(event.target)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              
              // 강력한 이벤트 차단 - 캡처링과 버블링 단계 모두에서 차단
              document.addEventListener('click', stopAllEvents, true);
              document.addEventListener('mousedown', stopAllEvents, true);
              document.addEventListener('mouseup', stopAllEvents, true);
              document.addEventListener('touchstart', stopAllEvents, true);
              document.addEventListener('touchend', stopAllEvents, true);
              
              // ESC 키로 모달 닫기
              const handleEscape = function(event) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }
              };
              document.addEventListener('keydown', handleEscape, true);
              
              // 닫기 버튼 이벤트 - 직접 이벤트 리스너 추가
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 취소 버튼 이벤트 - 직접 이벤트 리스너 추가
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 폼 제출 이벤트
              const loginForm = document.getElementById('loginForm');
              loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleLogin(event);
              }, true);
              
              // 이메일 찾기 버튼 이벤트
              const findEmailBtn = modal.querySelector('.find-email-btn');
              findEmailBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
                showFindEmailModal();
              }, true);
              
              // 비밀번호 찾기 버튼 이벤트
              const findPasswordBtn = modal.querySelector('.find-password-btn');
              findPasswordBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
                showFindPasswordModal();
              }, true);
              
              // 모달 정리 함수
              modal._cleanup = function() {
                document.removeEventListener('keydown', handleEscape, true);
                document.removeEventListener('click', stopAllEvents, true);
                document.removeEventListener('mousedown', stopAllEvents, true);
                document.removeEventListener('mouseup', stopAllEvents, true);
                document.removeEventListener('touchstart', stopAllEvents, true);
                document.removeEventListener('touchend', stopAllEvents, true);
                
                // 페이지 스크롤 및 상호작용 복원
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
              };
              
              // 첫 번째 입력 필드에 포커스
              setTimeout(() => {
                const firstInput = modal.querySelector('input[name="email"]');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
            
            // 📝 회원가입 모달 표시  
            function showSignupModal() {
              console.log('회원가입 모달 호출됨');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"]');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modalId = 'signupModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999'; // 매우 높은 z-index
              modal.innerHTML = \`
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
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
                      <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이름을 입력해주세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="example@email.com" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호</label>
                      <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="010-1234-5678 또는 01012345678" maxlength="13" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">지역</label>
                      <select name="location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
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
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required minlength="6" placeholder="최소 6자 이상" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                      <input type="password" name="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 다시 입력하세요" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        회원가입
                      </button>
                    </div>
                  </form>
                </div>
              \`;
              
              // 페이지 스크롤 및 상호작용 비활성화
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              
              document.body.appendChild(modal);
              
              // 모든 클릭 이벤트 완전 차단 (모달 외부)
              const stopAllEvents = function(event) {
                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent.contains(event.target)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              
              // 강력한 이벤트 차단 - 캡처링과 버블링 단계 모두에서 차단
              document.addEventListener('click', stopAllEvents, true);
              document.addEventListener('mousedown', stopAllEvents, true);
              document.addEventListener('mouseup', stopAllEvents, true);
              document.addEventListener('touchstart', stopAllEvents, true);
              document.addEventListener('touchend', stopAllEvents, true);
              
              // ESC 키로 모달 닫기
              const handleEscape = function(event) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }
              };
              document.addEventListener('keydown', handleEscape, true);
              
              // 닫기 버튼 이벤트 - 직접 이벤트 리스너 추가
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 취소 버튼 이벤트 - 직접 이벤트 리스너 추가
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 폼 제출 이벤트
              const signupForm = document.getElementById('signupForm');
              signupForm.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleSignup(event);
              }, true);
              
              // 모달 정리 함수
              modal._cleanup = function() {
                document.removeEventListener('keydown', handleEscape, true);
                document.removeEventListener('click', stopAllEvents, true);
                document.removeEventListener('mousedown', stopAllEvents, true);
                document.removeEventListener('mouseup', stopAllEvents, true);
                document.removeEventListener('touchstart', stopAllEvents, true);
                document.removeEventListener('touchend', stopAllEvents, true);
                
                // 페이지 스크롤 및 상호작용 복원
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
              };
              
              // 첫 번째 입력 필드에 포커스
              setTimeout(() => {
                const firstInput = modal.querySelector('select[name="user_type"]');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
            
            // 모달 안전하게 닫기 함수
            function closeModal(modal) {
              if (modal && modal.parentElement) {
                console.log('모달 닫기 시작');
                
                // 이벤트 리스너 정리
                if (modal._cleanup) {
                  modal._cleanup();
                }
                
                // 페이지 상호작용 복원
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
                
                // 모달 제거
                modal.remove();
                
                console.log('모달 닫기 완료');
              }
            }
            
            // 전역에서 모든 모달을 강제로 닫는 함수 (비상용)
            function closeAllModals() {
              const allModals = document.querySelectorAll('[id^="signupModal"], [id^="loginModal"], [id^="findEmailModal"], [id^="findPasswordModal"]');
              allModals.forEach(modal => {
                if (modal._cleanup) {
                  modal._cleanup();
                }
                modal.remove();
              });
              
              // 페이지 상태 복원
              document.body.style.overflow = '';
              document.body.classList.remove('modal-open');
              
              console.log('모든 모달 강제 닫기 완료');
            }
            
            // Dummy functions for compatibility
            function showFindEmailModal() {
              alert('이메일 찾기 기능은 개발 중입니다.');
            }
            
            function showFindPasswordModal() {
              alert('비밀번호 찾기 기능은 개발 중입니다.');
            }
            
            function handleLogin(event) {
              const form = event.target;
              const formData = new FormData(form);
              const email = formData.get('email');
              const password = formData.get('password');
              
              console.log('로그인 시도:', { email, password: '***' });
              alert('로그인 기능은 백엔드 연동 후 구현 예정입니다.');
            }
            
            function handleSignup(event) {
              const form = event.target;
              const formData = new FormData(form);
              const data = {};
              for (let [key, value] of formData.entries()) {
                data[key] = value;
              }
              
              console.log('회원가입 시도:', data);
              alert('회원가입 기능은 백엔드 연동 후 구현 예정입니다.');
            }
            
            // Make functions available globally
            window.showLoginModal = showLoginModal;
            window.showSignupModal = showSignupModal;
            window.closeModal = closeModal;
            window.closeAllModals = closeAllModals;
            
            // Initialize service dropdown menu for homepage
            document.addEventListener('DOMContentLoaded', function() {
              console.log('Initializing homepage service dropdown menu...');
              
              // Service menu configuration with updated structure
              const serviceMenuConfig = {
                guest: [
                  { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
                  { href: '/jobseekers', label: '구직정보 보기', icon: 'fas fa-user-tie' },
                  { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' }
                ]
              };
              
              // Update service dropdown menu
              function updateServiceDropdownMenu() {
                const serviceDropdown = document.getElementById('service-dropdown-container');
                if (serviceDropdown) {
                  const serviceMenus = serviceMenuConfig.guest;
                  
                  const serviceHtml = serviceMenus.map(menu => \`
                    <a href="\${menu.href}" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <i class="\${menu.icon} mr-2"></i>\${menu.label}
                    </a>
                  \`).join('');
                  
                  serviceDropdown.innerHTML = serviceHtml;
                  console.log('Desktop service menu updated with', serviceMenus.length, 'items');
                }
                
                // Update mobile service menu
                const mobileServiceMenu = document.getElementById('mobile-service-menu-container');
                if (mobileServiceMenu) {
                  const serviceMenus = serviceMenuConfig.guest;
                  
                  const mobileServiceHtml = serviceMenus.map(menu => \`
                    <a href="\${menu.href}" class="block pl-4 py-2 text-gray-600 hover:text-blue-600">
                      <i class="\${menu.icon} mr-2"></i>\${menu.label}
                    </a>
                  \`).join('');
                  
                  mobileServiceMenu.innerHTML = mobileServiceHtml;
                  console.log('Mobile service menu updated with', serviceMenus.length, 'items');
                }
              }
              
              // Initialize service menu
              updateServiceDropdownMenu();
              
              // Mobile menu toggle
              const mobileMenuBtn = document.getElementById('mobile-menu-btn');
              const mobileMenu = document.getElementById('mobile-menu');
              
              if (mobileMenuBtn && mobileMenu) {
                mobileMenuBtn.addEventListener('click', function() {
                  mobileMenu.classList.toggle('hidden');
                });
              }
              
              console.log('Homepage initialization complete!');
            });
            
            // 🚀 시작하기 모달 및 온보딩 시스템
            
            // 시작하기 모달 표시 (사용자 유형 선택)
            function showGetStartedModal() {
              console.log('시작하기 모달 호출됨');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('[id^="getStartedModal"]');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modalId = 'getStartedModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = '' +
                '<div class="bg-white rounded-lg p-8 max-w-lg w-full mx-4 modal-content" style="position: relative; z-index: 10000;">' +
                  '<div class="flex justify-between items-center mb-6">' +
                    '<h2 class="text-2xl font-bold text-gray-900">시작하기</h2>' +
                    '<button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">' +
                      '<i class="fas fa-times text-xl"></i>' +
                    '</button>' +
                  '</div>' +
                  '' +
                  '<div class="text-center mb-6">' +
                    '<p class="text-gray-600">어떤 유형의 사용자이신가요? 맞춤형 온보딩을 제공해드립니다.</p>' +
                  '</div>' +
                  '' +
                  '<div class="grid grid-cols-2 gap-4">' +
                    '<!-- 구직자 -->' +
                    '<button onclick="startOnboarding(&quot;jobseeker&quot;)" class="group relative p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:border-green-300 hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-105">' +
                      '<div class="text-center">' +
                        '<div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                          '<i class="fas fa-user-tie text-2xl text-white"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-semibold text-green-800 mb-2">구직자</h3>' +
                        '<p class="text-sm text-green-600">외국인 구직자 • 일자리를 찾고 있어요</p>' +
                      '</div>' +
                      '<div class="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>' +
                    '</button>' +
                    '' +
                    '<!-- 기업 -->' +
                    '<button onclick="startOnboarding(&quot;company&quot;)" class="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-105">' +
                      '<div class="text-center">' +
                        '<div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                          '<i class="fas fa-building text-2xl text-white"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-semibold text-blue-800 mb-2">기업</h3>' +
                        '<p class="text-sm text-blue-600">구인 기업 • 인재를 채용하고 싶어요</p>' +
                      '</div>' +
                      '<div class="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>' +
                    '</button>' +
                    '' +
                    '<!-- 에이전트 -->' +
                    '<button onclick="startOnboarding(&quot;agent&quot;)" class="group relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 transform hover:scale-105">' +
                      '<div class="text-center">' +
                        '<div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                          '<i class="fas fa-handshake text-2xl text-white"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-semibold text-purple-800 mb-2">에이전트</h3>' +
                        '<p class="text-sm text-purple-600">유학/취업 에이전트 • 매칭 서비스를 제공해요</p>' +
                      '</div>' +
                      '<div class="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>' +
                    '</button>' +
                    '' +
                    '<!-- 유학생 -->' +
                    '<button onclick="startOnboarding(&quot;student&quot;)" class="group relative p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg hover:border-orange-300 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 transform hover:scale-105">' +
                      '<div class="text-center">' +
                        '<div class="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                          '<i class="fas fa-graduation-cap text-2xl text-white"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-semibold text-orange-800 mb-2">유학생</h3>' +
                        '<p class="text-sm text-orange-600">한국 유학 희망자 • 한국에서 공부하고 싶어요</p>' +
                      '</div>' +
                      '<div class="absolute inset-0 bg-orange-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>' +
                    '</button>' +
                  '</div>' +
                  '' +
                  '<div class="mt-6 text-center">' +
                    '<button onclick="closeModal(this.closest(&quot;.modal-overlay&quot;))" class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors">' +
                      '나중에 하기' +
                    '</button>' +
                  '</div>' +
                '</div>';
              
              // 페이지 스크롤 비활성화
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              
              document.body.appendChild(modal);
              
              // 모달 외부 클릭 차단
              const stopAllEvents = function(event) {
                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent.contains(event.target)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              
              document.addEventListener('click', stopAllEvents, true);
              document.addEventListener('mousedown', stopAllEvents, true);
              document.addEventListener('mouseup', stopAllEvents, true);
              
              // ESC 키로 모달 닫기
              const handleEscape = function(event) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }
              };
              document.addEventListener('keydown', handleEscape, true);
              
              // 닫기 버튼 이벤트
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 모달 정리 함수
              modal._cleanup = function() {
                document.removeEventListener('keydown', handleEscape, true);
                document.removeEventListener('click', stopAllEvents, true);
                document.removeEventListener('mousedown', stopAllEvents, true);
                document.removeEventListener('mouseup', stopAllEvents, true);
                
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
              };
            }
            
            // 온보딩 시작 함수
            function startOnboarding(userType) {
              console.log('온보딩 시작:', userType);
              
              // 현재 모달 닫기
              const currentModal = document.querySelector('[id^="getStartedModal"]');
              if (currentModal) {
                closeModal(currentModal);
              }
              
              // 사용자 유형을 localStorage에 저장
              localStorage.setItem('wowcampus_onboarding_type', userType);
              
              // 사용자 유형별 메시지 설정
              const userTypeConfig = {
                jobseeker: {
                  title: '구직자 온보딩',
                  message: '좋은 일자리를 찾기 위한 첫걸음을 시작해보세요!',
                  color: 'green',
                  icon: 'fas fa-user-tie',
                  nextAction: '구직자 회원가입'
                },
                company: {
                  title: '기업 온보딩',
                  message: '우수한 외국인 인재를 찾아 성공적인 채용을 경험하세요!',
                  color: 'blue',
                  icon: 'fas fa-building',
                  nextAction: '기업 회원가입'
                },
                agent: {
                  title: '에이전트 온보딩',
                  message: '전문적인 매칭 서비스로 높은 성과를 달성해보세요!',
                  color: 'purple',
                  icon: 'fas fa-handshake',
                  nextAction: '에이전트 회원가입'
                },
                student: {
                  title: '유학생 온보딩',
                  message: '한국에서의 성공적인 유학 생활을 시작해보세요!',
                  color: 'orange',
                  icon: 'fas fa-graduation-cap',
                  nextAction: '유학생 회원가입'
                }
              };
              
              const config = userTypeConfig[userType] || userTypeConfig.jobseeker;
              
              // 진행 상황 표시 모달
              showOnboardingProgress(config, userType);
            }
            
            // 온보딩 진행 상황 모달
            function showOnboardingProgress(config, userType) {
              const modalId = 'onboardingProgressModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = '' +
                '<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">' +
                  '<div class="text-center">' +
                    '<div class="w-20 h-20 bg-' + config.color + '-600 rounded-full flex items-center justify-center mx-auto mb-6">' +
                      '<i class="' + config.icon + ' text-3xl text-white"></i>' +
                    '</div>' +
                    '' +
                    '<h2 class="text-2xl font-bold text-gray-900 mb-4">' + config.title + '</h2>' +
                    '<p class="text-gray-600 mb-6">' + config.message + '</p>' +
                    '' +
                    '<div class="space-y-4 mb-8">' +
                      '<div class="flex items-center text-left">' +
                        '<div class="w-8 h-8 bg-' + config.color + '-600 rounded-full flex items-center justify-center mr-3">' +
                          '<i class="fas fa-check text-white text-sm"></i>' +
                        '</div>' +
                        '<span class="text-gray-800">사용자 유형 선택 완료</span>' +
                      '</div>' +
                      '' +
                      '<div id="progress-step-2" class="flex items-center text-left opacity-50">' +
                        '<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">' +
                          '<span class="text-white text-sm font-bold">2</span>' +
                        '</div>' +
                        '<span class="text-gray-600">회원가입 및 프로필 작성</span>' +
                      '</div>' +
                      '' +
                      '<div id="progress-step-3" class="flex items-center text-left opacity-50">' +
                        '<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">' +
                          '<span class="text-white text-sm font-bold">3</span>' +
                        '</div>' +
                        '<span class="text-gray-600">서비스 이용 시작</span>' +
                      '</div>' +
                    '</div>' +
                    '' +
                    '<button onclick="showOnboardingSignupModal(&quot;' + userType + '&quot;)" class="w-full bg-' + config.color + '-600 text-white py-3 px-6 rounded-lg hover:bg-' + config.color + '-700 transition-colors font-medium">' +
                      config.nextAction + ' <i class="fas fa-arrow-right ml-2"></i>' +
                    '</button>' +
                    '' +
                    '<button onclick="closeModal(this.closest(&quot;.modal-overlay&quot;))" class="mt-3 text-gray-500 hover:text-gray-700 text-sm">' +
                      '나중에 하기' +
                    '</button>' +
                  '</div>' +
                '</div>';
              
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              document.body.appendChild(modal);
              
              // 애니메이션 효과로 2단계 활성화
              setTimeout(() => {
                const step2 = document.getElementById('progress-step-2');
                if (step2) {
                  step2.classList.remove('opacity-50');
                  const circle = step2.querySelector('div');
                  circle.className = 'w-8 h-8 bg-' + config.color + '-600 rounded-full flex items-center justify-center mr-3';
                  circle.innerHTML = '<i class="fas fa-spinner fa-spin text-white text-sm"></i>';
                }
              }, 1000);
              
              // 기본 모달 이벤트 설정
              setupModalEvents(modal);
            }
            
            // 온보딩 회원가입 모달
            function showOnboardingSignupModal(userType) {
              console.log('온보딩 회원가입 모달:', userType);
              
              // 현재 모달 닫기
              const currentModal = document.querySelector('[id^="onboardingProgressModal"]');
              if (currentModal) {
                closeModal(currentModal);
              }
              
              const userTypeConfig = {
                jobseeker: {
                  title: '구직자 회원가입',
                  subtitle: '꿈의 직장을 찾기 위한 첫걸음',
                  color: 'green',
                  icon: 'fas fa-user-tie',
                  fields: [
                    { name: 'desired_job', label: '희망 직종', type: 'text', placeholder: '예: 소프트웨어 개발자, 마케팅 담당자' },
                    { name: 'experience_level', label: '경력 수준', type: 'select', options: [
                      { value: 'entry', label: '신입 (경력 무관)' },
                      { value: '1-3', label: '1-3년' },
                      { value: '3-5', label: '3-5년' },
                      { value: '5+', label: '5년 이상' }
                    ]},
                    { name: 'skills', label: '주요 기술/스킬', type: 'text', placeholder: '예: Java, Python, 디자인, 마케팅' }
                  ]
                },
                company: {
                  title: '기업 회원가입',
                  subtitle: '우수한 인재와의 만남을 시작하세요',
                  color: 'blue',
                  icon: 'fas fa-building',
                  fields: [
                    { name: 'company_name', label: '회사명', type: 'text', placeholder: '회사명을 입력하세요' },
                    { name: 'business_type', label: '업종', type: 'select', options: [
                      { value: 'IT', label: 'IT/소프트웨어' },
                      { value: 'manufacturing', label: '제조업' },
                      { value: 'service', label: '서비스업' },
                      { value: 'finance', label: '금융업' },
                      { value: 'education', label: '교육업' },
                      { value: 'other', label: '기타' }
                    ]},
                    { name: 'company_size', label: '기업 규모', type: 'select', options: [
                      { value: 'startup', label: '스타트업 (1-50명)' },
                      { value: 'medium', label: '중견기업 (51-300명)' },
                      { value: 'large', label: '대기업 (300명 이상)' }
                    ]}
                  ]
                },
                agent: {
                  title: '에이전트 회원가입',
                  subtitle: '전문 매칭 서비스 제공자로 시작하세요',
                  color: 'purple',
                  icon: 'fas fa-handshake',
                  fields: [
                    { name: 'agency_name', label: '에이전시명', type: 'text', placeholder: '에이전시명을 입력하세요' },
                    { name: 'specialization', label: '전문 분야', type: 'select', options: [
                      { value: 'IT', label: 'IT 인재' },
                      { value: 'manufacturing', label: '제조업 인재' },
                      { value: 'service', label: '서비스업 인재' },
                      { value: 'all', label: '전 분야' }
                    ]},
                    { name: 'experience_years', label: '에이전트 경력', type: 'select', options: [
                      { value: '1', label: '1년 미만' },
                      { value: '1-3', label: '1-3년' },
                      { value: '3-5', label: '3-5년' },
                      { value: '5+', label: '5년 이상' }
                    ]}
                  ]
                },
                student: {
                  title: '유학생 회원가입',
                  subtitle: '한국에서의 성공적인 학업을 시작하세요',
                  color: 'orange',
                  icon: 'fas fa-graduation-cap',
                  fields: [
                    { name: 'study_field', label: '희망 전공', type: 'text', placeholder: '예: 컴퓨터공학, 경영학, 한국어학' },
                    { name: 'education_level', label: '학위 과정', type: 'select', options: [
                      { value: 'language', label: '어학연수' },
                      { value: 'bachelor', label: '학사 과정' },
                      { value: 'master', label: '석사 과정' },
                      { value: 'phd', label: '박사 과정' }
                    ]},
                    { name: 'korean_level', label: '한국어 수준', type: 'select', options: [
                      { value: 'beginner', label: '초급' },
                      { value: 'intermediate', label: '중급' },
                      { value: 'advanced', label: '고급' },
                      { value: 'native', label: '원어민 수준' }
                    ]}
                  ]
                }
              };
              
              const config = userTypeConfig[userType] || userTypeConfig.jobseeker;
              
              const modalId = 'onboardingSignupModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              
              // 추가 필드 HTML 생성
              const additionalFields = config.fields.map(field => {
                if (field.type === 'select') {
                  const options = field.options.map(opt => 
                    '<option value="' + opt.value + '">' + opt.label + '</option>'
                  ).join('');
                  return '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">' + field.label + '</label>' +
                      '<select name="' + field.name + '" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required>' +
                        '<option value="">선택해주세요</option>' +
                        options +
                      '</select>' +
                    '</div>';
                } else {
                  return '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">' + field.label + '</label>' +
                      '<input type="' + field.type + '" name="' + field.name + '" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" placeholder="' + field.placeholder + '" required />' +
                    '</div>';
                }
              }).join('');
              
              modal.innerHTML = '' +
                '<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content max-h-screen overflow-y-auto" style="position: relative; z-index: 10000;">' +
                  '<div class="flex justify-between items-center mb-6">' +
                    '<div class="flex items-center">' +
                      '<div class="w-10 h-10 bg-' + config.color + '-600 rounded-full flex items-center justify-center mr-3">' +
                        '<i class="' + config.icon + ' text-white"></i>' +
                      '</div>' +
                      '<div>' +
                        '<h2 class="text-xl font-bold text-gray-900">' + config.title + '</h2>' +
                        '<p class="text-sm text-gray-600">' + config.subtitle + '</p>' +
                      '</div>' +
                    '</div>' +
                    '<button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">' +
                      '<i class="fas fa-times text-xl"></i>' +
                    '</button>' +
                  '</div>' +
                  '' +
                  '<form id="onboardingSignupForm" class="space-y-4">' +
                    '<input type="hidden" name="user_type" value="' + userType + '" />' +
                    '' +
                    '<!-- 기본 정보 -->' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>' +
                      '<input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required placeholder="이름을 입력하세요" />' +
                    '</div>' +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>' +
                      '<input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required placeholder="example@email.com" />' +
                    '</div>' +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>' +
                      '<input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" placeholder="010-1234-5678" />' +
                    '</div>' +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">지역 *</label>' +
                      '<select name="location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required>' +
                        '<option value="">지역을 선택하세요</option>' +
                        '<option value="서울">서울</option>' +
                        '<option value="경기도">경기도</option>' +
                        '<option value="강원도">강원도</option>' +
                        '<option value="충청도">충청도</option>' +
                        '<option value="경상도">경상도</option>' +
                        '<option value="전라도">전라도</option>' +
                        '<option value="제주도">제주도</option>' +
                      '</select>' +
                    '</div>' +
                    '' +
                    '<!-- 사용자 유형별 추가 필드 -->' +
                    additionalFields +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 *</label>' +
                      '<input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required minlength="6" placeholder="최소 6자 이상" />' +
                    '</div>' +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 *</label>' +
                      '<input type="password" name="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required placeholder="비밀번호를 다시 입력하세요" />' +
                    '</div>' +
                    '' +
                    '<div class="flex space-x-3 mt-6">' +
                      '<button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">' +
                        '취소' +
                      '</button>' +
                      '<button type="submit" class="flex-1 bg-' + config.color + '-600 text-white py-2 px-4 rounded-lg hover:bg-' + config.color + '-700 transition-colors">' +
                        '가입 완료' +
                      '</button>' +
                    '</div>' +
                  '</form>' +
                '</div>';
              
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              document.body.appendChild(modal);
              
              // 모달 이벤트 설정
              setupModalEvents(modal);
              
              // 폼 제출 이벤트
              const signupForm = document.getElementById('onboardingSignupForm');
              signupForm.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleOnboardingSignup(event, userType);
              }, true);
              
              // 첫 번째 입력 필드에 포커스
              setTimeout(() => {
                const firstInput = modal.querySelector('input[name="name"]');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
            
            // 온보딩 회원가입 처리
            function handleOnboardingSignup(event, userType) {
              console.log('온보딩 회원가입 처리:', userType);
              
              const formData = new FormData(event.target);
              const password = formData.get('password');
              const confirmPassword = formData.get('confirmPassword');
              
              // 비밀번호 확인
              if (password !== confirmPassword) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
              }
              
              // 폼 데이터 수집
              const userData = {};
              for (let [key, value] of formData.entries()) {
                if (value.trim()) {
                  userData[key] = value.trim();
                }
              }
              
              console.log('온보딩 회원가입 데이터:', userData);
              
              // 현재 모달 닫기
              const currentModal = event.target.closest('.modal-overlay');
              if (currentModal) {
                closeModal(currentModal);
              }
              
              // 성공 모달 표시
              showOnboardingSuccess(userType, userData);
            }
            
            // 온보딩 성공 모달
            function showOnboardingSuccess(userType, userData) {
              const userTypeConfig = {
                jobseeker: {
                  title: '구직자 가입 완료!',
                  message: '이제 맞춤형 일자리 추천을 받아보세요',
                  color: 'green',
                  icon: 'fas fa-check-circle',
                  nextSteps: [
                    '프로필을 완성하여 더 나은 매칭 받기',
                    '관심 있는 구인공고 탐색하기',
                    'AI 매칭 시스템으로 맞춤 추천 받기'
                  ],
                  primaryAction: { text: '구직자 대시보드로 이동', url: '/jobseekers' },
                  secondaryAction: { text: '구인정보 둘러보기', url: '/jobs' }
                },
                company: {
                  title: '기업 가입 완료!',
                  message: '우수한 외국인 인재를 찾아보세요',
                  color: 'blue',
                  icon: 'fas fa-check-circle',
                  nextSteps: [
                    '첫 번째 채용공고 등록하기',
                    '구직자 프로필 탐색하기',
                    '맞춤 인재 추천 받기'
                  ],
                  primaryAction: { text: '채용공고 등록하기', url: '/jobs/post' },
                  secondaryAction: { text: '구직자 찾아보기', url: '/jobseekers' }
                },
                agent: {
                  title: '에이전트 가입 완료!',
                  message: '전문 매칭 서비스를 시작하세요',
                  color: 'purple',
                  icon: 'fas fa-check-circle',
                  nextSteps: [
                    '에이전트 대시보드 설정하기',
                    '클라이언트 관리 시스템 익히기',
                    '매칭 성과 추적하기'
                  ],
                  primaryAction: { text: '에이전트 대시보드', url: '/agents' },
                  secondaryAction: { text: '매칭 시스템 보기', url: '/matching' }
                },
                student: {
                  title: '유학생 가입 완료!',
                  message: '한국 유학 정보를 확인해보세요',
                  color: 'orange',
                  icon: 'fas fa-check-circle',
                  nextSteps: [
                    '유학 프로그램 정보 확인하기',
                    '한국어 학습 리소스 탐색하기',
                    '유학생 커뮤니티 참여하기'
                  ],
                  primaryAction: { text: '유학정보 보기', url: '/study' },
                  secondaryAction: { text: '홈으로 이동', url: '/' }
                }
              };
              
              const config = userTypeConfig[userType] || userTypeConfig.jobseeker;
              
              const modalId = 'onboardingSuccessModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              
              const nextStepsHtml = config.nextSteps.map(step => 
                '<div class="flex items-start text-left mb-2">' +
                  '<i class="fas fa-arrow-right text-' + config.color + '-600 mt-1 mr-3"></i>' +
                  '<span class="text-gray-700 text-sm">' + step + '</span>' +
                '</div>'
              ).join('');
              
              modal.innerHTML = '' +
                '<div class="bg-white rounded-lg p-8 max-w-lg w-full mx-4 modal-content" style="position: relative; z-index: 10000;">' +
                  '<div class="text-center mb-6">' +
                    '<div class="w-20 h-20 bg-' + config.color + '-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                      '<i class="' + config.icon + ' text-3xl text-white"></i>' +
                    '</div>' +
                    '' +
                    '<h2 class="text-2xl font-bold text-gray-900 mb-2">' + config.title + '</h2>' +
                    '<p class="text-gray-600">' + config.message + '</p>' +
                  '</div>' +
                  '' +
                  '<div class="bg-gray-50 rounded-lg p-4 mb-6">' +
                    '<h3 class="font-semibold text-gray-900 mb-3">다음 단계</h3>' +
                    nextStepsHtml +
                  '</div>' +
                  '' +
                  '<div class="space-y-3">' +
                    '<button onclick="window.location.href=&quot;' + config.primaryAction.url + '&quot;" class="w-full bg-' + config.color + '-600 text-white py-3 px-6 rounded-lg hover:bg-' + config.color + '-700 transition-colors font-medium">' +
                      config.primaryAction.text +
                    '</button>' +
                    '' +
                    '<button onclick="window.location.href=&quot;' + config.secondaryAction.url + '&quot;" class="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">' +
                      config.secondaryAction.text +
                    '</button>' +
                    '' +
                    '<button onclick="closeModal(this.closest(&quot;.modal-overlay&quot;))" class="w-full text-gray-500 hover:text-gray-700 py-2 text-sm">' +
                      '나중에 하기' +
                    '</button>' +
                  '</div>' +
                '</div>';
              
              document.body.appendChild(modal);
              
              // 기본 모달 이벤트 설정
              setupModalEvents(modal);
              
              // 온보딩 완료 추적
              localStorage.setItem('wowcampus_onboarding_completed', 'true');
              localStorage.setItem('wowcampus_user_type', userType);
            }
            
            // 모달 공통 이벤트 설정 헬퍼 함수
            function setupModalEvents(modal) {
              // 페이지 스크롤 비활성화
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              
              // 모달 외부 클릭 차단
              const stopAllEvents = function(event) {
                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent.contains(event.target)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              
              document.addEventListener('click', stopAllEvents, true);
              document.addEventListener('mousedown', stopAllEvents, true);
              document.addEventListener('mouseup', stopAllEvents, true);
              
              // ESC 키로 모달 닫기
              const handleEscape = function(event) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }
              };
              document.addEventListener('keydown', handleEscape, true);
              
              // 닫기 버튼 이벤트
              const closeBtn = modal.querySelector('.close-modal-btn');
              if (closeBtn) {
                closeBtn.addEventListener('click', function(event) {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }, true);
              }
              
              // 취소 버튼 이벤트
              const cancelBtn = modal.querySelector('.cancel-btn');
              if (cancelBtn) {
                cancelBtn.addEventListener('click', function(event) {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }, true);
              }
              
              // 모달 정리 함수
              modal._cleanup = function() {
                document.removeEventListener('keydown', handleEscape, true);
                document.removeEventListener('click', stopAllEvents, true);
                document.removeEventListener('mousedown', stopAllEvents, true);
                document.removeEventListener('mouseup', stopAllEvents, true);
                
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
              };
            }
            
            // 전역 함수로 등록
            window.showGetStartedModal = showGetStartedModal;
            window.startOnboarding = startOnboarding;
            window.showOnboardingSignupModal = showOnboardingSignupModal;
            
            console.log('Authentication system loaded successfully!');
          </script>
        `
      }}></div>
      
    </div>
  )
})

// Matching System page
app.get('/matching', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
            <a href="/" class="text-blue-600 hover:text-blue-800">← 홈으로 돌아가기</a>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">스마트 매칭 시스템</h1>
          <p class="text-gray-600 text-lg">AI 기반으로 최적의 구인구직 매칭을 제공합니다</p>
        </div>
        
        {/* 실시간 매칭 성공률 대시보드 */}
        <div class="bg-white p-8 rounded-lg shadow-sm border mb-12">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-chart-line text-3xl text-white"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">실시간 매칭 성공률</h2>
            <div id="overall-success-rate" class="text-4xl font-bold text-green-600 mb-2">87.3%</div>
            <p class="text-gray-600">총 1,247건의 매칭 중 1,089건 성공</p>
            <div class="text-sm text-green-600 font-medium mt-2">
              <i class="fas fa-arrow-up mr-1"></i>지난 달 대비 +5.2% 상승
            </div>
          </div>
          
          {/* 상세 성공률 통계 */}
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 mb-1">92.1%</div>
              <div class="text-sm text-gray-600">IT/소프트웨어</div>
              <div class="text-xs text-gray-500">423건 매칭</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 mb-1">89.2%</div>
              <div class="text-sm text-gray-600">서비스업</div>
              <div class="text-xs text-gray-500">186건 매칭</div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600 mb-1">84.7%</div>
              <div class="text-sm text-gray-600">제조업</div>
              <div class="text-xs text-gray-500">298건 매칭</div>
            </div>
          </div>
        </div>
        
        {/* AI 매칭 알고리즘 및 인터페이스 */}
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          <div class="bg-white p-8 rounded-lg shadow-sm border">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-robot text-2xl text-purple-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4">AI 매칭 알고리즘</h3>
            <p class="text-gray-600 mb-6">구직자의 기술, 경험, 선호도와 기업의 요구사항을 분석하여 최적의 매칭을 제공합니다.</p>
            
            {/* 알고리즘 요소 표시 */}
            <div class="space-y-3 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">기술 스킬 매칭</span>
                <span class="text-sm font-semibold text-purple-600">40%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">경력 수준</span>
                <span class="text-sm font-semibold text-purple-600">25%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">지역 선호도</span>
                <span class="text-sm font-semibold text-purple-600">20%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">급여 조건</span>
                <span class="text-sm font-semibold text-purple-600">10%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">비자 유형</span>
                <span class="text-sm font-semibold text-purple-600">5%</span>
              </div>
            </div>
            
            <button onclick="startMatching('jobseeker')" class="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              <i class="fas fa-search mr-2"></i>구직자용 AI 매칭 시작
            </button>
          </div>
          
          <div class="bg-white p-8 rounded-lg shadow-sm border">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-users text-2xl text-green-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4">기업용 인재 추천</h3>
            <p class="text-gray-600 mb-6">기업의 채용 조건에 맞는 최적의 외국인 인재를 AI가 추천합니다.</p>
            
            {/* 기업용 알고리즘 요소 */}
            <div class="space-y-3 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">기술 보유도</span>
                <span class="text-sm font-semibold text-green-600">35%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">경력 적합성</span>
                <span class="text-sm font-semibold text-green-600">25%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">지역 접근성</span>
                <span class="text-sm font-semibold text-green-600">15%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">한국어 실력</span>
                <span class="text-sm font-semibold text-green-600">10%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">급여 조건</span>
                <span class="text-sm font-semibold text-green-600">10%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">비자 상태</span>
                <span class="text-sm font-semibold text-green-600">5%</span>
              </div>
            </div>
            
            <button onclick="startMatching('company')" class="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
              <i class="fas fa-building mr-2"></i>기업용 AI 매칭 시작
            </button>
          </div>
        </div>
        
        {/* 매칭 결과 표시 영역 */}
        <div id="matching-results" class="hidden bg-white p-8 rounded-lg shadow-sm border mb-12">
          <div id="results-content">
            {/* 매칭 결과가 여기에 동적으로 로드됩니다 */}
          </div>
        </div>
        
        {/* 추가 정보 및 링크 */}
        <div class="text-center bg-gray-100 p-8 rounded-lg">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">더 많은 정보가 필요하신가요?</h3>
          <p class="text-gray-600 mb-6">AI 매칭 시스템과 함께 전체 구인구직 정보도 확인해보세요.</p>
          <div class="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a href="/jobs" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <i class="fas fa-briefcase mr-2"></i>전체 구인정보 보기
            </a>
            <a href="/jobseekers" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              <i class="fas fa-users mr-2"></i>전체 구직자 정보 보기
            </a>
            <a href="/statistics" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              <i class="fas fa-chart-bar mr-2"></i>상세 통계 보기
            </a>
          </div>
        </div>
      </main>
      
      {/* Matching System JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Matching system JavaScript loading...');
            
            // 전역 변수
            let matchingInProgress = false;
            
            // 성공률 데이터 로드 및 표시
            async function loadSuccessRate() {
              try {
                const response = await fetch('/api/matching/success-rate');
                const data = await response.json();
                
                if (data.success) {
                  const overallRate = document.getElementById('overall-success-rate');
                  if (overallRate) {
                    overallRate.textContent = data.data.overall.rate + '%';
                  }
                }
              } catch (error) {
                console.error('성공률 로드 실패:', error);
              }
            }
            
            // AI 매칭 시작 함수
            async function startMatching(userType) {
              if (matchingInProgress) return;
              
              matchingInProgress = true;
              console.log('Starting matching for:', userType);
              
              // 로딩 상태 표시
              showMatchingLoader(userType);
              
              try {
                // 매칭 요청 보내기
                const response = await fetch('/api/matching/recommend', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    userId: 'demo_user_' + Date.now(),
                    userType: userType,
                    filters: {}
                  })
                });
                
                const result = await response.json();
                
                if (result.success) {
                  // 실제 매칭 결과 로드
                  await loadMatchingResults(userType);
                } else {
                  throw new Error(result.message || '매칭 요청 실패');
                }
                
              } catch (error) {
                console.error('매칭 오류:', error);
                showMatchingError(error.message);
              } finally {
                matchingInProgress = false;
              }
            }
            
            // 로딩 상태 표시
            function showMatchingLoader(userType) {
              const resultsDiv = document.getElementById('matching-results');
              const contentDiv = document.getElementById('results-content');
              
              const userTypeText = userType === 'jobseeker' ? '구직자' : '기업';
              
              contentDiv.innerHTML = 
                '<div class="text-center py-12">' +
                  '<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">' +
                    '<div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>' +
                  '</div>' +
                  '<h3 class="text-xl font-semibold text-gray-900 mb-4">AI 매칭 분석 중...</h3>' +
                  '<p class="text-gray-600 mb-2">' + userTypeText + '용 최적화된 매칭을 진행하고 있습니다</p>' +
                  '<p class="text-sm text-gray-500">잠시만 기다려주세요 (약 1-2초 소요)</p>' +
                '</div>';
                
              resultsDiv.classList.remove('hidden');
              resultsDiv.scrollIntoView({ behavior: 'smooth' });
            }
            
            // 매칭 결과 로드 및 표시
            async function loadMatchingResults(userType) {
              try {
                let endpoint = userType === 'jobseeker' 
                  ? '/api/matching/jobs-for-jobseeker'
                  : '/api/matching/jobseekers-for-company';
                  
                const response = await fetch(endpoint + '?limit=5');
                const data = await response.json();
                
                if (data.success) {
                  displayMatchingResults(data.data, userType);
                } else {
                  throw new Error('매칭 결과 로드 실패');
                }
                
              } catch (error) {
                console.error('매칭 결과 로드 오류:', error);
                showMatchingError('매칭 결과를 불러오는데 실패했습니다.');
              }
            }
            
            // 매칭 결과 표시
            function displayMatchingResults(data, userType) {
              const contentDiv = document.getElementById('results-content');
              const isJobseeker = userType === 'jobseeker';
              const matches = data.matches || [];
              
              let html = '<div class="space-y-6">';
              
              // 헤더
              html += '<div class="text-center mb-8">';
              html += '<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">';
              html += '<i class="fas fa-check-circle text-2xl text-green-600"></i>';
              html += '</div>';
              html += '<h3 class="text-2xl font-bold text-gray-900 mb-2">매칭 완료!</h3>';
              html += '<p class="text-gray-600">' + (isJobseeker ? '추천 구인공고' : '추천 구직자') + ' ' + matches.length + '개를 찾았습니다</p>';
              html += '</div>';
              
              // 매칭 결과 목록
              html += '<div class="grid gap-4">';
              
              matches.forEach((match, index) => {
                const percentage = match.matchPercentage || 0;
                const barColor = percentage >= 90 ? 'bg-green-500' : 
                               percentage >= 75 ? 'bg-blue-500' : 
                               percentage >= 60 ? 'bg-yellow-500' : 'bg-gray-500';
                
                html += '<div class="bg-gray-50 p-6 rounded-lg border hover:shadow-md transition-shadow">';
                html += '<div class="flex justify-between items-start mb-4">';
                
                if (isJobseeker) {
                  // 구직자용 - 구인공고 표시
                  html += '<div class="flex-1">';
                  html += '<h4 class="text-lg font-semibold text-gray-900 mb-1">' + match.title + '</h4>';
                  html += '<p class="text-gray-600 mb-2">' + match.company + ' • ' + match.location + '</p>';
                  html += '<p class="text-sm text-gray-500">급여: ' + match.salary + '만원 • 경력: ' + match.experience + '년 • 비자: ' + match.visa + '</p>';
                  html += '</div>';
                } else {
                  // 기업용 - 구직자 표시
                  html += '<div class="flex-1">';
                  html += '<h4 class="text-lg font-semibold text-gray-900 mb-1">' + match.name + '</h4>';
                  html += '<p class="text-gray-600 mb-2">' + match.nationality + ' • ' + match.location + ' • ' + match.koreanLevel + '</p>';
                  html += '<p class="text-sm text-gray-500">경력: ' + match.experience + '년 • 희망급여: ' + match.salary + '만원 • 비자: ' + match.visa + '</p>';
                  html += '</div>';
                }
                
                // 매칭 점수
                html += '<div class="text-center ml-6">';
                html += '<div class="text-2xl font-bold text-' + (percentage >= 90 ? 'green' : percentage >= 75 ? 'blue' : 'yellow') + '-600 mb-1">' + percentage + '%</div>';
                html += '<div class="text-xs text-gray-500">매칭률</div>';
                html += '</div>';
                html += '</div>';
                
                // 매칭 이유
                if (match.reasons && match.reasons.length > 0) {
                  html += '<div class="mb-4">';
                  html += '<div class="text-sm font-medium text-gray-700 mb-2">매칭 이유:</div>';
                  html += '<div class="flex flex-wrap gap-2">';
                  match.reasons.forEach(reason => {
                    html += '<span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">' + reason + '</span>';
                  });
                  html += '</div>';
                  html += '</div>';
                }
                
                // 매칭률 진행바
                html += '<div class="mb-4">';
                html += '<div class="flex justify-between text-sm text-gray-600 mb-1">';
                html += '<span>매칭 적합도</span>';
                html += '<span>' + percentage + '%</span>';
                html += '</div>';
                html += '<div class="w-full bg-gray-200 rounded-full h-2">';
                html += '<div class="' + barColor + ' h-2 rounded-full transition-all duration-500" style="width: ' + percentage + '%"></div>';
                html += '</div>';
                html += '</div>';
                
                // 액션 버튼
                html += '<div class="flex space-x-3">';
                if (isJobseeker) {
                  html += '<button onclick="applyToJob(' + match.id + ')" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">';
                  html += '<i class="fas fa-paper-plane mr-2"></i>지원하기';
                  html += '</button>';
                  html += '<button onclick="viewJobDetails(' + match.id + ')" class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm">';
                  html += '<i class="fas fa-eye mr-2"></i>상세보기';
                  html += '</button>';
                } else {
                  html += '<button onclick="contactJobseeker(' + match.id + ')" class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm">';
                  html += '<i class="fas fa-envelope mr-2"></i>연락하기';
                  html += '</button>';
                  html += '<button onclick="viewProfile(' + match.id + ')" class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm">';
                  html += '<i class="fas fa-user mr-2"></i>프로필 보기';
                  html += '</button>';
                }
                html += '</div>';
                
                html += '</div>'; // 매칭 카드 끝
              });
              
              html += '</div>'; // grid 끝
              
              // 하단 액션 버튼들
              html += '<div class="text-center mt-8 pt-6 border-t border-gray-200">';
              html += '<div class="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">';
              html += '<button onclick="startMatching(&quot;' + userType + '&quot;)" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">';
              html += '<i class="fas fa-refresh mr-2"></i>새로운 매칭 실행';
              html += '</button>';
              html += '<button onclick="provideFeedback()" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">';
              html += '<i class="fas fa-comment mr-2"></i>매칭 피드백';
              html += '</button>';
              html += '</div>';
              html += '</div>';
              
              html += '</div>'; // 전체 끝
              
              contentDiv.innerHTML = html;
            }
            
            // 오류 표시
            function showMatchingError(message) {
              const contentDiv = document.getElementById('results-content');
              contentDiv.innerHTML = 
                '<div class="text-center py-12">' +
                  '<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">' +
                    '<i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>' +
                  '</div>' +
                  '<h3 class="text-xl font-semibold text-gray-900 mb-4">매칭 실패</h3>' +
                  '<p class="text-gray-600 mb-6">' + message + '</p>' +
                  '<button onclick="location.reload()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">' +
                    '다시 시도하기' +
                  '</button>' +
                '</div>';
            }
            
            // 액션 함수들
            function applyToJob(jobId) {
              alert('구인공고 #' + jobId + '에 지원하기 기능은 개발 중입니다.');
            }
            
            function viewJobDetails(jobId) {
              alert('구인공고 #' + jobId + ' 상세보기 기능은 개발 중입니다.');
            }
            
            function contactJobseeker(jobseekerId) {
              alert('구직자 #' + jobseekerId + '에게 연락하기 기능은 개발 중입니다.');
            }
            
            function viewProfile(jobseekerId) {
              alert('구직자 #' + jobseekerId + ' 프로필 보기 기능은 개발 중입니다.');
            }
            
            function provideFeedback() {
              const feedback = prompt('매칭 결과에 대한 피드백을 남겨주세요:');
              if (feedback) {
                fetch('/api/matching/feedback', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    matchId: 'match_' + Date.now(),
                    rating: 4,
                    feedback: feedback
                  })
                }).then(() => {
                  alert('피드백이 저장되었습니다. 감사합니다!');
                }).catch(error => {
                  console.error('피드백 저장 오류:', error);
                  alert('피드백 저장 중 오류가 발생했습니다.');
                });
              }
            }
            
            // 전역 함수로 등록
            window.startMatching = startMatching;
            window.applyToJob = applyToJob;
            window.viewJobDetails = viewJobDetails;
            window.contactJobseeker = contactJobseeker;
            window.viewProfile = viewProfile;
            window.provideFeedback = provideFeedback;
            
            // 페이지 로드시 초기화
            document.addEventListener('DOMContentLoaded', function() {
              console.log('Matching system initialized');
              loadSuccessRate();
            });
            
            console.log('Matching system JavaScript loaded successfully!');
          </script>
        `
      }}></div>
      
    </div>
  )
})


// Support page
app.get('/support', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
            <a href="/" class="text-blue-600 hover:text-blue-800">← 홈으로 돌아가기</a>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">고객지원</h1>
          <p class="text-gray-600 text-lg">궁금한 사항이나 도움이 필요하시면 언제든 연락주세요</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-envelope text-2xl text-blue-600"></i>
            </div>
            <h3 class="font-semibold mb-2">이메일 문의</h3>
            <p class="text-gray-600 mb-4">info@wow-campus.kr</p>
            <a href="mailto:info@wow-campus.kr" class="text-blue-600 hover:text-blue-800">이메일 보내기</a>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-phone text-2xl text-green-600"></i>
            </div>
            <h3 class="font-semibold mb-2">전화 문의</h3>
            <p class="text-gray-600 mb-4">02-1234-5678</p>
            <span class="text-green-600">평일 09:00~18:00</span>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-comments text-2xl text-purple-600"></i>
            </div>
            <h3 class="font-semibold mb-2">실시간 채팅</h3>
            <p class="text-gray-600 mb-4">즉시 답변</p>
            <button class="text-purple-600 hover:text-purple-800">채팅 시작하기</button>
          </div>
        </div>
        
        <div class="bg-white p-8 rounded-lg shadow-sm">
          <h2 class="text-2xl font-bold mb-6">자주 묻는 질문</h2>
          <div class="space-y-4">
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">회원가입은 어떻게 하나요?</h4>
              <p class="text-gray-600">메인 페이지의 '회원가입' 버튼을 클릭하여 간단한 정보를 입력하면 됩니다.</p>
            </div>
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">구인공고 등록 비용이 있나요?</h4>
              <p class="text-gray-600">현재 베타 서비스 기간으로 무료로 이용하실 수 있습니다.</p>
            </div>
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">외국인 비자 지원이 가능한가요?</h4>
              <p class="text-gray-600">네, 저희 플랫폼의 많은 기업들이 외국인 비자 지원을 제공합니다.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Study page
app.get('/study', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
            <a href="/" class="text-blue-600 hover:text-blue-800">← 홈으로 돌아가기</a>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">한국 유학 프로그램</h1>
          <p class="text-gray-600 text-lg">한국어 연수부터 학위과정까지 체계적인 유학 지원을 제공합니다</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-language text-2xl text-orange-600"></i>
            </div>
            <h3 class="font-semibold mb-4">한국어 연수</h3>
            <p class="text-gray-600 mb-4">기초부터 고급까지 단계별 한국어 교육 프로그램</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-6">
              <li>• 초급/중급/고급 과정</li>
              <li>• TOPIK 시험 준비</li>
              <li>• 문화 적응 프로그램</li>
            </ul>
            <button onclick="showProgramDetails('language')" class="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
              자세히 보기
            </button>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-graduation-cap text-2xl text-blue-600"></i>
            </div>
            <h3 class="font-semibold mb-4">학부 과정</h3>
            <p class="text-gray-600 mb-4">한국 대학교 학사 학위 취득 프로그램</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-6">
              <li>• 공학, 경영, IT 전공</li>
              <li>• 장학금 지원</li>
              <li>• 기숙사 제공</li>
            </ul>
            <button onclick="showProgramDetails('undergraduate')" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              자세히 보기
            </button>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-user-graduate text-2xl text-green-600"></i>
            </div>
            <h3 class="font-semibold mb-4">대학원 과정</h3>
            <p class="text-gray-600 mb-4">석박사 학위 과정 및 연구 지원</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-6">
              <li>• 석사/박사 과정</li>
              <li>• 연구비 지원</li>
              <li>• 졸업 후 취업 연계</li>
            </ul>
            <button onclick="showProgramDetails('graduate')" class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              자세히 보기
            </button>
          </div>
        </div>
        
        {/* 협약 대학교 섹션 */}
        <div class="mt-16">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">협약 대학교</h2>
            <p class="text-gray-600 text-lg">WOW-CAMPUS와 협약을 맺은 우수한 한국 대학교들을 소개합니다</p>
          </div>
          
          {/* 대학교 필터 */}
          <div class="mb-8">
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="grid md:grid-cols-4 gap-4 mb-4">
{/* 지역 선택 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">지역</label>
                  <select id="region-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="applyFilters()">
                    <option value="all">전체 지역</option>
                    <option value="서울">서울</option>
                    <option value="경기도">경기도</option>
                    <option value="부산">부산</option>
                    <option value="대전">대전</option>
                    <option value="대구">대구</option>
                    <option value="인천">인천</option>
                    <option value="광주">광주</option>
                    <option value="울산">울산</option>
                    <option value="강원도">강원도</option>
                    <option value="충청북도">충청북도</option>
                    <option value="충청남도">충청남도</option>
                    <option value="전라북도">전라북도</option>
                    <option value="전라남도">전라남도</option>
                    <option value="경상북도">경상북도</option>
                    <option value="경상남도">경상남도</option>
                    <option value="제주도">제주도</option>
                  </select>
                </div>
                
{/* 대학 유형 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">대학 유형</label>
                  <select id="type-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="applyFilters()">
                    <option value="all">전체</option>
                    <option value="국립">국립대학교</option>
                    <option value="사립">사립대학교</option>
                    <option value="공립">공립대학교</option>
                  </select>
                </div>
                
{/* 학과 분야 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">주요 분야</label>
                  <select id="field-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="applyFilters()">
                    <option value="all">전체 분야</option>
                    <option value="공학">공학</option>
                    <option value="경영">경영학</option>
                    <option value="인문">인문학</option>
                    <option value="사회">사회과학</option>
                    <option value="자연">자연과학</option>
                    <option value="의학">의학</option>
                    <option value="예술">예술</option>
                    <option value="교육">교육학</option>
                    <option value="법학">법학</option>
                    <option value="농업">농업</option>
                  </select>
                </div>
                
{/* 검색 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">대학명 검색</label>
                  <div class="relative">
                    <input 
                      type="text" 
                      id="search-input" 
                      placeholder="대학교 이름을 입력하세요" 
                      class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onkeyup="debounceSearch()"
                    />
                    <button class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600" onclick="applyFilters()">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
              
{/* 필터 초기화 버튼 */}
              <div class="flex justify-between items-center">
                <div class="text-sm text-gray-600">
                  <span id="filter-results-count">전체 대학교를 표시하는 중...</span>
                </div>
                <button 
                  onclick="resetFilters()" 
                  class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i class="fas fa-undo mr-1"></i>필터 초기화
                </button>
              </div>
            </div>
          </div>
          
          {/* 협약 대학교 목록 */}
          <div id="universities-container">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold text-gray-900">🏫 협약 대학교</h3>
              <div class="flex items-center space-x-4">
{/* 정렬 옵션 */}
                <div class="flex items-center space-x-2">
                  <label class="text-sm text-gray-600">정렬:</label>
                  <select id="sort-select" class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="applyFilters()">
                    <option value="name">이름순</option>
                    <option value="region">지역순</option>
                    <option value="featured">특별협약 우선</option>
                  </select>
                </div>
                
{/* 보기 형태 */}
                <div class="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button id="grid-view-btn" onclick="setViewMode('grid')" class="px-3 py-1 text-sm rounded bg-white text-gray-900 shadow-sm">
                    <i class="fas fa-th mr-1"></i>카드형
                  </button>
                  <button id="list-view-btn" onclick="setViewMode('list')" class="px-3 py-1 text-sm rounded text-gray-600 hover:text-gray-900">
                    <i class="fas fa-list mr-1"></i>목록형
                  </button>
                </div>
              </div>
            </div>
            
            <div id="universities-list" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 대학교 목록이 여기에 로드됩니다 */}
            </div>
            
            {/* 로딩 표시 */}
            <div id="universities-loading" class="text-center py-8 hidden">
              <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-white">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                대학교 정보를 불러오는 중...
              </div>
            </div>
            
            {/* 더 보기 버튼 */}
            <div class="text-center mt-8">
              <button id="load-more-universities" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors hidden">
                더 많은 대학교 보기
              </button>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-16">
          <a href="/support" class="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors mr-4">
            유학 상담 받기
          </a>
          <a href="/" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            홈으로 돌아가기
          </a>
        </div>
        
        {/* 프로그램 상세 정보 모달 */}
        <div id="program-detail-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
          <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 id="modal-title" class="text-2xl font-bold text-gray-900"></h2>
                  <button onclick="closeProgramDetails()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
                
                <div id="modal-content" class="space-y-6">
                  {/* 동적으로 내용이 채워짐 */}
                </div>
                
                <div class="mt-8 pt-6 border-t border-gray-200">
                  <div class="flex justify-center space-x-4">
                    <a href="/support" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      상담 신청하기
                    </a>
                    <button onclick="closeProgramDetails()" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* 간단한 스크립트를 JSX 방식으로 추가 */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          console.log('대학교 목록 로딩 시작');
          
          fetch('/api/universities')
            .then(function(response) { return response.json(); })
            .then(function(data) {
              console.log('데이터 받음:', data.data.length, '개');
              
              if (data.success && data.data) {
                // 전체 데이터 저장
                allUniversities = data.data;
                
                // 초기 표시
                displayUniversities(allUniversities);
                
                console.log('필터링 시스템 준비 완료');
              }
            })
            .catch(function(error) {
              console.error('로딩 실패:', error);
            });
        });
        
        // 전체 대학교 데이터를 저장할 변수
        var allUniversities = [];
        var currentViewMode = 'grid';
        var searchTimeout;
        
        // 필터 적용 함수 (API 요청 방식)
        window.applyFilters = function() {
          console.log('필터 적용 시작');
          
          var regionFilter = document.getElementById('region-select').value;
          var typeFilter = document.getElementById('type-select').value;
          var fieldFilter = document.getElementById('field-select').value;
          var searchText = document.getElementById('search-input').value.trim();
          var sortFilter = document.getElementById('sort-select').value;
          
          console.log('필터 조건:', { regionFilter, typeFilter, fieldFilter, searchText, sortFilter });
          
          // API 요청 URL 구성
          var params = new URLSearchParams();
          if (regionFilter !== 'all') params.append('region', regionFilter);
          if (typeFilter !== 'all') params.append('type', typeFilter);
          if (fieldFilter !== 'all') params.append('field', fieldFilter);
          if (searchText) params.append('search', searchText);
          if (sortFilter) params.append('sort', sortFilter);
          params.append('limit', '20');
          
          var url = '/api/universities?' + params.toString();
          console.log('API 요청:', url);
          
          // 로딩 표시
          document.getElementById('filter-results-count').textContent = '필터링 중...';
          
          fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
              console.log('필터 결과:', data.data.length + '개 대학교');
              
              if (data.success && data.data) {
                allUniversities = data.data; // 현재 필터된 결과 저장
                displayUniversities(data.data);
              } else {
                displayUniversities([]);
              }
            })
            .catch(function(error) {
              console.error('필터 적용 실패:', error);
              document.getElementById('filter-results-count').textContent = '필터 적용 실패';
            });
        };
        
        // 필터 초기화 함수
        window.resetFilters = function() {
          console.log('필터 초기화');
          
          document.getElementById('region-select').value = 'all';
          document.getElementById('type-select').value = 'all';
          document.getElementById('field-select').value = 'all';
          document.getElementById('search-input').value = '';
          
          displayUniversities(allUniversities);
        };
        
        // 검색 디바운스 함수
        window.debounceSearch = function() {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(function() {
            window.applyFilters();
          }, 500);
        };
        
        // 뷰 모드 전환 함수
        window.setViewMode = function(mode) {
          console.log('뷰 모드 변경:', mode);
          currentViewMode = mode;
          
          var gridBtn = document.getElementById('grid-view-btn');
          var listBtn = document.getElementById('list-view-btn');
          var container = document.getElementById('universities-list');
          
          if (mode === 'grid') {
            gridBtn.className = 'px-3 py-1 text-sm rounded bg-white text-gray-900 shadow-sm';
            listBtn.className = 'px-3 py-1 text-sm rounded text-gray-600 hover:text-gray-900';
            container.className = 'grid md:grid-cols-2 lg:grid-cols-3 gap-6';
          } else {
            listBtn.className = 'px-3 py-1 text-sm rounded bg-white text-gray-900 shadow-sm';
            gridBtn.className = 'px-3 py-1 text-sm rounded text-gray-600 hover:text-gray-900';
            container.className = 'space-y-4';
          }
          
          // 현재 필터된 데이터로 다시 표시
          window.applyFilters();
        };
        
        // 프로그램 상세 정보 데이터
        var programsData = {
          language: {
            title: '한국어 연수 프로그램',
            icon: 'fas fa-language',
            color: 'orange',
            description: '체계적인 한국어 교육을 통해 한국 생활과 학업에 필요한 언어 능력을 기르는 프로그램입니다.',
            programs: [
              {
                name: '집중 한국어 과정',
                duration: '6개월',
                cost: '2,800,000원/학기',
                description: '주 20시간의 집중적인 한국어 교육',
                features: ['말하기, 듣기, 읽기, 쓰기 종합 교육', '소규모 클래스 (최대 15명)', '개인별 맞춤 피드백']
              },
              {
                name: '일반 한국어 과정',
                duration: '1년',
                cost: '2,200,000원/학기',
                description: '주 15시간의 체계적인 한국어 교육',
                features: ['단계별 수준별 교육', '문화 체험 프로그램 포함', 'TOPIK 시험 대비반 운영']
              }
            ],
            requirements: {
              academic: '고등학교 졸업 이상',
              language: '한국어 능력 무관 (초급부터 고급까지)',
              documents: ['여권', '최종학력증명서', '건강진단서'],
              age: '만 18세 이상'
            },
            scholarships: [
              {
                name: '언어연수 장학금',
                coverage: '등록금 30% 할인',
                requirements: '성적 우수자, 출석률 90% 이상'
              }
            ]
          },
          undergraduate: {
            title: '학부 정규 과정',
            icon: 'fas fa-graduation-cap',
            color: 'blue',
            description: '한국의 우수한 대학에서 학사 학위를 취득하며 전문 지식과 글로벌 역량을 함양하는 4년제 프로그램입니다.',
            programs: [
              {
                name: '공학 학사 과정',
                duration: '4년',
                cost: '4,200,000원/학기',
                description: '컴퓨터공학, 전자공학, 기계공학 등 다양한 공학 전공',
                features: ['최신 실험실 및 장비 이용', '산업체 인턴십 프로그램', '글로벌 교환학생 기회']
              },
              {
                name: '경영 학사 과정',
                duration: '4년',
                cost: '3,800,000원/학기',
                description: '국제경영, 마케팅, 재무 등 경영 전 분야',
                features: ['케이스 스터디 중심 교육', '기업 멘토링 프로그램', '창업 지원 프로그램']
              },
              {
                name: 'IT 학사 과정',
                duration: '4년',
                cost: '4,000,000원/학기',
                description: '소프트웨어 개발, 데이터 사이언스, 인공지능 전공',
                features: ['실무 프로젝트 중심 교육', 'IT 기업 취업 연계', '최신 기술 트렌드 교육']
              }
            ],
            requirements: {
              academic: '고등학교 졸업 또는 이에 준하는 학력',
              language: 'TOPIK 4급 이상 또는 TOEFL iBT 80점 이상',
              documents: ['고등학교 졸업증명서', '성적증명서', '자기소개서', '학업계획서', '추천서 2부'],
              gpa: '고등학교 GPA 3.0 이상 (4.0 만점 기준)'
            },
            scholarships: [
              {
                name: 'Global Korea Scholarship (GKS)',
                coverage: '등록금 100% + 생활비 월 900,000원',
                requirements: 'TOPIK 5급 이상, 우수한 학업 성적'
              },
              {
                name: '대학 자체 장학금',
                coverage: '등록금 50%',
                requirements: 'TOPIK 4급 이상, GPA 3.5 이상 유지'
              }
            ]
          },
          graduate: {
            title: '대학원 과정',
            icon: 'fas fa-user-graduate',
            color: 'green',
            description: '석사 및 박사 학위를 통해 전문 연구 능력을 기르고 학문적 깊이를 더하는 고급 과정입니다.',
            programs: [
              {
                name: '석사 과정',
                duration: '2년',
                cost: '4,800,000원/학기',
                description: '전공 분야의 깊이 있는 연구와 논문 작성',
                features: ['지도교수 1:1 멘토링', '연구 프로젝트 참여', '국제 학술대회 발표 기회']
              },
              {
                name: '박사 과정',
                duration: '3-4년',
                cost: '5,200,000원/학기',
                description: '독창적 연구를 통한 박사 학위 취득',
                features: ['연구비 지원', 'TA/RA 근무 기회', '해외 연구기관 교류']
              },
              {
                name: '석박사 통합과정',
                duration: '4-5년',
                cost: '5,000,000원/학기',
                description: '석사와 박사를 연계한 통합 연구 과정',
                features: ['연속적인 연구 진행', '조기 연구 시작 가능', '통합 커리큘럼']
              }
            ],
            requirements: {
              academic: '학사 학위 소지자 (석사의 경우) 또는 석사 학위 소지자 (박사의 경우)',
              language: 'TOPIK 5급 이상 또는 TOEFL iBT 100점 이상',
              documents: ['학위증명서', '성적증명서', '연구계획서', '자기소개서', '추천서 3부'],
              gpa: '학부 GPA 3.3 이상 (4.0 만점 기준)'
            },
            scholarships: [
              {
                name: '연구 장학금',
                coverage: '등록금 100% + 연구비 지원',
                requirements: '우수한 연구 계획서, 지도교수 추천'
              },
              {
                name: 'BK21 장학금',
                coverage: '등록금 50% + 생활비 지원',
                requirements: '해당 분야 우수 연구팀 소속'
              }
            ]
          }
        };
        
        // 대학교 표시 함수
        function displayUniversities(universities) {
          var html = '';
          
          for (var i = 0; i < universities.length; i++) {
            var uni = universities[i];
            
            if (currentViewMode === 'list') {
              // 목록형 보기
              html += '<div class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">';
              html += '<div class="flex-1">';
              html += '<div class="flex items-center space-x-4">';
              html += '<div>';
              html += '<h3 class="text-lg font-semibold text-gray-900">' + uni.name + '</h3>';
              if (uni.name_english) html += '<p class="text-sm text-gray-600">' + uni.name_english + '</p>';
              html += '</div>';
              if (uni.featured) html += '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">⭐ 특별협약</span>';
              html += '</div>';
              html += '<div class="text-right">';
              html += '<p class="text-sm text-gray-500 mb-2">' + uni.region + ' ' + uni.city + '</p>';
              html += '<a href="' + uni.website_url + '" target="_blank" class="text-blue-600 text-sm hover:text-blue-800">자세히 보기</a>';
              html += '</div>';
              html += '</div>';
              html += '</div>';
            } else {
              // 카드형 보기 (기존)
              html += '<div class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">';
              html += '<div class="mb-4">';
              html += '<h3 class="text-lg font-semibold text-gray-900 mb-1">' + uni.name + '</h3>';
              if (uni.name_english) html += '<p class="text-sm text-gray-600 mb-2">' + uni.name_english + '</p>';
              html += '<div class="flex items-center space-x-2 flex-wrap gap-1">';
              html += '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">';
              html += '<i class="fas fa-map-marker-alt mr-1"></i>' + uni.region + ' ' + uni.city;
              html += '</span>';
              if (uni.featured) html += '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">⭐ 특별협약</span>';
              html += '</div>';
              html += '</div>';
              html += '<p class="text-gray-600 text-sm mb-4 line-clamp-2">' + (uni.description || '') + '</p>';
              html += '<div class="space-y-2 mb-4">';
              if (uni.established_year) html += '<div class="flex items-center text-sm text-gray-600"><i class="fas fa-calendar-alt mr-2 w-3"></i>설립: ' + uni.established_year + '년</div>';
              if (uni.student_count) html += '<div class="flex items-center text-sm text-gray-600"><i class="fas fa-users mr-2 w-3"></i>학생수: ' + uni.student_count.toLocaleString() + '명</div>';
              html += '</div>';
              html += '<div class="flex items-center justify-between">';
              html += '<div class="flex space-x-2 flex-wrap">';
              if (uni.dormitory_available) html += '<span class="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"><i class="fas fa-bed mr-1"></i>기숙사</span>';
              if (uni.language_support) html += '<span class="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 text-orange-800"><i class="fas fa-language mr-1"></i>언어지원</span>';
              html += '</div>';
              html += '<a href="' + uni.website_url + '" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium">';
              html += '자세히 보기 <i class="fas fa-external-link-alt ml-1"></i>';
              html += '</a>';
              html += '</div>';
              html += '</div>';
            }
          }
          
          document.getElementById('universities-list').innerHTML = html;
          document.getElementById('filter-results-count').textContent = '총 ' + universities.length + '개의 협약 대학교';
        }
        
        // 프로그램 상세 정보 데이터
        var programsData = {
          language: {
            title: '한국어 연수 프로그램',
            icon: 'fas fa-language',
            color: 'orange',
            description: '체계적인 단계별 한국어 교육으로 한국 생활과 학업에 필요한 언어 능력을 기릅니다.',
            duration: '6개월 ~ 1년',
            cost: '300만원 ~ 450만원/학기',
            features: [
              '초급부터 고급까지 단계별 교육',
              'TOPIK 시험 대비 집중 과정',
              '한국 문화 체험 프로그램',
              '1:1 개별 지도',
              '기숙사 우선 배정'
            ],
            benefits: [
              '대학 진학 시 우선 선발',
              '기숙사 우선 배정',
              '학비 할인 혜택 (10-30%)',
              '문화 체험 프로그램 참여',
              '한국 학생과의 언어 교환 프로그램'
            ],
            requirements: [
              '고등학교 졸업 이상',
              '여권 및 비자 서류',
              '건강진단서',
              '은행 잔고증명서 (1만 달러 이상)',
              '한국어 능력 무관 (초급부터 가능)'
            ],
            scholarships: [
              { name: '정부초청장학금 (GKS)', coverage: '학비 100% + 생활비 90만원/월' },
              { name: '대학 자체 장학금', coverage: '학비 30-50% 할인' },
              { name: '성적우수장학금', coverage: '다음 학기 학비 50% 할인' }
            ]
          },
          undergraduate: {
            title: '학부 정규 과정',
            icon: 'fas fa-graduation-cap',
            color: 'blue',
            description: '한국의 우수한 대학교에서 4년제 학사 학위를 취득하며 전문 지식과 실무 경험을 쌓을 수 있습니다.',
            duration: '4년 (8학기)',
            cost: '400만원 ~ 800만원/학기',
            features: [
              '공학, 경영, IT 등 다양한 전공',
              '영어 및 한국어 이중 언어 교육',
              '글로벌 인턴십 프로그램',
              '기숙사 4년간 보장',
              '졸업 후 구직비자 지원'
            ],
            benefits: [
              '졸업 후 구직비자(D-10) 자동 발급',
              '한국 기업 취업 시 E-7 비자 지원',
              '기숙사 4년간 보장',
              '한국어-영어 이중언어 교육',
              '글로벌 인턴십 프로그램'
            ],
            requirements: [
              'TOPIK 4급 이상 또는 TOEFL 80점 이상',
              '고등학교 졸업증명서 (영문)',
              '고등학교 성적증명서 (GPA 3.0 이상)',
              '자기소개서 및 학업계획서',
              '추천서 2부'
            ],
            scholarships: [
              { name: 'Global Korea Scholarship (GKS)', coverage: '등록금 100% + 생활비 90만원/월' },
              { name: '대학 우수학생 장학금', coverage: '등록금 50-100%' },
              { name: '외국인 특별 장학금', coverage: '등록금 30%' }
            ]
          },
          graduate: {
            title: '대학원 과정',
            icon: 'fas fa-user-graduate',
            color: 'green',
            description: '석사 및 박사 학위 과정을 통해 전문 연구 능력을 기르고 한국의 첨단 기술과 학문을 배웁니다.',
            duration: '석사 2년, 박사 3-4년',
            cost: '석사 450만원/학기, 박사 500만원/학기',
            features: [
              '석사/박사 학위 과정',
              '연구비 및 장학금 지원',
              'TA/RA 활동 기회',
              '국제 학회 참가 지원',
              '산학협력 프로젝트 참여'
            ],
            benefits: [
              '졸업 후 교수요원(E-1) 또는 연구원(E-3) 비자 지원',
              '한국 대기업 연구소 우선 채용',
              'TA/RA 활동을 통한 연구 경험',
              '국제 학회 발표 기회',
              '산학 협력 프로젝트 참여'
            ],
            requirements: [
              'TOPIK 5급 이상 또는 TOEFL 90점 이상',
              '학사 학위증명서 (영문)',
              '대학 성적증명서 (GPA 3.5 이상)',
              '연구계획서 (5-10페이지)',
              '추천서 3부 (지도교수 포함)'
            ],
            scholarships: [
              { name: 'BK21 FOUR 장학금', coverage: '등록금 100% + 연구비 월 150만원' },
              { name: '정부초청장학금 (GKS)', coverage: '등록금 100% + 생활비 100만원/월' },
              { name: 'TA/RA 장학금', coverage: '등록금 50-100% + 활동비' }
            ]
          }
        };
        
        // 프로그램 상세 정보 모달 열기
        window.showProgramDetails = function(programType) {
          var program = programsData[programType];
          if (!program) return;
          
          var modal = document.getElementById('program-detail-modal');
          var title = document.getElementById('modal-title');
          var content = document.getElementById('modal-content');
          
          title.innerHTML = '<i class="' + program.icon + ' text-' + program.color + '-600 mr-3"></i>' + program.title;
          
          var html = '';
          
          // 개요 섹션
          html += '<div class="bg-' + program.color + '-50 p-6 rounded-lg mb-6">';
          html += '<h3 class="text-lg font-semibold text-' + program.color + '-800 mb-3">프로그램 개요</h3>';
          html += '<p class="text-gray-700 mb-4">' + program.description + '</p>';
          html += '<div class="grid md:grid-cols-2 gap-4 text-sm">';
          html += '<div><strong>수업 기간:</strong> ' + program.duration + '</div>';
          html += '<div><strong>학비:</strong> ' + program.cost + '</div>';
          html += '</div>';
          html += '</div>';
          
          // 특징 및 프로그램 내용
          html += '<div class="mb-6">';
          html += '<h3 class="text-lg font-semibold text-gray-900 mb-4">프로그램 특징</h3>';
          html += '<div class="grid gap-3">';
          for (var i = 0; i < program.features.length; i++) {
            html += '<div class="flex items-center space-x-2">';
            html += '<i class="fas fa-check-circle text-' + program.color + '-600"></i>';
            html += '<span>' + program.features[i] + '</span>';
            html += '</div>';
          }
          html += '</div>';
          html += '</div>';
          
          // 혜택 섹션
          html += '<div class="mb-6">';
          html += '<h3 class="text-lg font-semibold text-gray-900 mb-4">주요 혜택</h3>';
          html += '<div class="grid md:grid-cols-2 gap-3">';
          for (var i = 0; i < program.benefits.length; i++) {
            html += '<div class="flex items-center space-x-2">';
            html += '<i class="fas fa-star text-yellow-500"></i>';
            html += '<span>' + program.benefits[i] + '</span>';
            html += '</div>';
          }
          html += '</div>';
          html += '</div>';
          
          // 입학 요건
          html += '<div class="mb-6">';
          html += '<h3 class="text-lg font-semibold text-gray-900 mb-4">입학 요건</h3>';
          html += '<div class="grid gap-2">';
          for (var i = 0; i < program.requirements.length; i++) {
            html += '<div class="flex items-center space-x-2">';
            html += '<i class="fas fa-clipboard-check text-' + program.color + '-600"></i>';
            html += '<span>' + program.requirements[i] + '</span>';
            html += '</div>';
          }
          html += '</div>';
          html += '</div>';
          
          // 장학금 정보
          html += '<div>';
          html += '<h3 class="text-lg font-semibold text-gray-900 mb-4">장학금 정보</h3>';
          html += '<div class="space-y-3">';
          for (var i = 0; i < program.scholarships.length; i++) {
            var scholarship = program.scholarships[i];
            html += '<div class="border rounded-lg p-4 bg-yellow-50">';
            html += '<h4 class="font-semibold text-yellow-800 mb-1">' + scholarship.name + '</h4>';
            html += '<p class="text-' + program.color + '-700 font-medium">' + scholarship.coverage + '</p>';
            html += '</div>';
          }
          html += '</div>';
          html += '</div>';
          
          content.innerHTML = html;
          modal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        };
        
        // 프로그램 상세 정보 모달 닫기
        window.closeProgramDetails = function() {
          var modal = document.getElementById('program-detail-modal');
          modal.classList.add('hidden');
          document.body.style.overflow = 'auto';
        };
        
        // 모달 외부 클릭 시 닫기
        document.getElementById('program-detail-modal').addEventListener('click', function(e) {
          if (e.target === this) {
            closeProgramDetails();
          }
        });
      ` }} />

    </div>
  )
})

// API routes listing
app.get('/api', (c) => {
  return c.json({
    success: true,
    message: 'WOW-CAMPUS Work Platform API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/logout': 'Logout user',
        'POST /api/auth/find-email': 'Find user email by name and phone',
        'POST /api/auth/find-password': 'Send password reset email'
      },
      jobs: {
        'GET /api/jobs': 'Get all job postings (with search)',
        'GET /api/jobs/:id': 'Get single job posting',
        'POST /api/jobs': 'Create new job posting (company only)',
        'PUT /api/jobs/:id': 'Update job posting (owner only)',
        'DELETE /api/jobs/:id': 'Delete job posting (owner only)',
        'GET /api/jobs/company/:companyId': 'Get company job postings'
      },
      jobseekers: {
        'GET /api/jobseekers': 'Get all job seekers (with search)',
        'GET /api/jobseekers/:id': 'Get single job seeker',
        'POST /api/jobseekers': 'Create job seeker profile (authenticated)',
        'PUT /api/jobseekers/:id': 'Update job seeker profile (owner only)'
      },
      universities: {
        'GET /api/universities': 'Get all partner universities (with region filter)',
        'GET /api/universities/:id': 'Get single university details',
        'POST /api/universities': 'Create university (admin only)',
        'PUT /api/universities/:id': 'Update university (admin only)',
        'DELETE /api/universities/:id': 'Delete university (admin only)'
      }
    }
  })
})

// Jobseeker Dashboard page
app.get('/dashboard', (c) => {
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
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/dashboard" class="text-blue-600 font-medium">내 대시보드</a>
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

      {/* Dashboard Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">내 대시보드</h1>
          <p class="text-gray-600">프로필을 관리하고 구직 활동을 진행하세요</p>
        </div>

        {/* Dashboard Grid */}
        <div class="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile Summary */}
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div class="text-center mb-6">
                <div class="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i class="fas fa-user text-2xl text-gray-400" id="profile-avatar"></i>
                </div>
                <h3 class="font-semibold text-lg" id="profile-name">사용자명</h3>
                <p class="text-gray-600 text-sm" id="profile-email">이메일</p>
                <span class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-2" id="profile-status">
                  프로필 완성도: 0%
                </span>
              </div>
              
              <div class="space-y-3">
                <button onclick="showTab('profile')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab active">
                  <i class="fas fa-user mr-3 text-blue-600"></i>
                  <span>기본 정보</span>
                </button>
                <button onclick="showTab('education')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-graduation-cap mr-3 text-green-600"></i>
                  <span>학력 & 경력</span>
                </button>
                <button onclick="showTab('visa')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-passport mr-3 text-purple-600"></i>
                  <span>비자 & 언어</span>
                </button>
                <button onclick="showTab('documents')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-file-upload mr-3 text-orange-600"></i>
                  <span>이력서 & 서류</span>
                </button>
                <button onclick="showTab('applications')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-briefcase mr-3 text-red-600"></i>
                  <span>지원 현황</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h4 class="font-semibold mb-4">빠른 액션</h4>
              <div class="space-y-3">
                <button onclick="window.location.href='/jobs'" class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-search mr-2"></i>
                  구인공고 찾기
                </button>
                <button onclick="downloadResume()" class="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">
                  <i class="fas fa-download mr-2"></i>
                  이력서 다운로드
                </button>
                <button onclick="updateProfileCompletion()" class="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors">
                  <i class="fas fa-check-circle mr-2"></i>
                  프로필 완성하기
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div class="lg:col-span-2">
            {/* Profile Tab */}
            <div id="profile-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold">기본 정보</h3>
                <button onclick="toggleProfileEdit()" id="edit-profile-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-edit mr-2"></i>편집
                </button>
              </div>

              <form id="profile-form" class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                    <input type="text" name="first_name" id="first_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled  />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">성</label>
                    <input type="text" name="last_name" id="last_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">국적 *</label>
                    <select name="nationality" id="nationality" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                      <option value="">선택하세요</option>
                      <option value="USA">미국</option>
                      <option value="China">중국</option>
                      <option value="Japan">일본</option>
                      <option value="Vietnam">베트남</option>
                      <option value="Philippines">필리핀</option>
                      <option value="Thailand">태국</option>
                      <option value="India">인도</option>
                      <option value="Other">기타</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                    <input type="date" name="birth_date" id="birth_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">성별</label>
                    <select name="gender" id="gender" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                      <option value="">선택하세요</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                    <input type="tel" name="phone" id="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">현재 거주지 *</label>
                  <select name="current_location" id="current_location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                    <option value="">지역을 선택하세요</option>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">희망 근무지</label>
                  <select name="preferred_location" id="preferred_location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                    <option value="">희망 지역을 선택하세요</option>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">희망 연봉 (원)</label>
                  <input type="number" name="salary_expectation" id="salary_expectation" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 35000000" disabled />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                  <textarea name="bio" id="bio" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="자신을 소개해주세요..." disabled></textarea>
                </div>

                <div class="flex space-x-4" id="profile-form-actions" style="display: none;">
                  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                  <button type="button" onclick="cancelProfileEdit()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    취소
                  </button>
                </div>
              </form>
            </div>

            {/* Education Tab */}
            <div id="education-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">학력 & 경력</h3>
              
              <div class="mb-8">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-semibold">학력 정보</h4>
                  <button onclick="addEducation()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <i class="fas fa-plus mr-2"></i>추가
                  </button>
                </div>
                
                <div class="space-y-4" id="education-list">
                  <div class="border rounded-lg p-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">학교명</label>
                        <input type="text" name="school_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 서울대학교" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">전공</label>
                        <input type="text" name="major" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 컴퓨터공학" />
                      </div>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">학위</label>
                        <select name="degree" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">선택하세요</option>
                          <option value="Bachelor">학사</option>
                          <option value="Master">석사</option>
                          <option value="PhD">박사</option>
                          <option value="Associate">전문학사</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">입학년도</label>
                        <input type="number" name="start_year" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="2020" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">졸업년도</label>
                        <input type="number" name="end_year" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="2024" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-semibold">경력 사항</h4>
                  <button onclick="addExperience()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <i class="fas fa-plus mr-2"></i>추가
                  </button>
                </div>
                
                <div class="space-y-4" id="experience-list">
                  <div class="border rounded-lg p-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                        <input type="text" name="company_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 삼성전자" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">직책</label>
                        <input type="text" name="position" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 소프트웨어 엔지니어" />
                      </div>
                    </div>
                    <div class="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                        <input type="date" name="start_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                        <input type="date" name="end_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <label class="flex items-center mt-2">
                          <input type="checkbox" name="current_job" class="mr-2" />
                          <span class="text-sm text-gray-600">현재 재직중</span>
                        </label>
                      </div>
                    </div>
                    <div class="mt-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">담당업무</label>
                      <textarea name="job_description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="주요 담당업무를 설명해주세요..."></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <button onclick="saveEducationAndExperience()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-save mr-2"></i>저장
                </button>
              </div>
            </div>

            {/* Visa & Language Tab */}
            <div id="visa-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">비자 & 언어 정보</h3>
              
              <form id="visa-form" class="space-y-6">
                <div class="border rounded-lg p-6 bg-blue-50">
                  <h4 class="font-semibold text-blue-800 mb-4">
                    <i class="fas fa-passport mr-2"></i>비자 정보
                  </h4>
                  
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">현재 비자 유형 *</label>
                      <select name="visa_status" id="visa_status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">선택하세요</option>
                        <option value="E-7">E-7 (특정활동)</option>
                        <option value="E-9">E-9 (비전문취업)</option>
                        <option value="D-2">D-2 (유학)</option>
                        <option value="D-4">D-4 (일반연수)</option>
                        <option value="D-10">D-10 (구직)</option>
                        <option value="F-2">F-2 (거주)</option>
                        <option value="F-4">F-4 (재외동포)</option>
                        <option value="F-5">F-5 (영주)</option>
                        <option value="F-6">F-6 (결혼이민)</option>
                        <option value="H-2">H-2 (방문취업)</option>
                        <option value="Other">기타</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비자 만료일</label>
                      <input type="date" name="visa_expiry" id="visa_expiry" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  
                  <div class="mt-4">
                    <label class="flex items-center">
                      <input type="checkbox" name="visa_sponsorship_needed" id="visa_sponsorship_needed" class="mr-2" />
                      <span class="text-sm text-gray-700">비자 스폰서십이 필요합니다</span>
                    </label>
                  </div>
                </div>

                <div class="border rounded-lg p-6 bg-green-50">
                  <h4 class="font-semibold text-green-800 mb-4">
                    <i class="fas fa-language mr-2"></i>언어 능력
                  </h4>
                  
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">한국어 수준 *</label>
                      <select name="korean_level" id="korean_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">선택하세요</option>
                        <option value="beginner">초급 (기초 회화 가능)</option>
                        <option value="elementary">초중급 (간단한 업무 의사소통 가능)</option>
                        <option value="intermediate">중급 (일반적인 업무 의사소통 가능)</option>
                        <option value="advanced">고급 (유창한 의사소통 가능)</option>
                        <option value="native">원어민 수준</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">영어 수준</label>
                      <select name="english_level" id="english_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">선택하세요</option>
                        <option value="beginner">초급</option>
                        <option value="elementary">초중급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                        <option value="native">원어민</option>
                      </select>
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">기타 언어</label>
                    <input type="text" name="other_languages" id="other_languages" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 중국어(고급), 일본어(중급)" />
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">어학 자격증</label>
                    <textarea name="language_certificates" id="language_certificates" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: TOPIK 5급, TOEIC 900점, JLPT N2 등"></textarea>
                  </div>
                </div>

                <div class="border rounded-lg p-6 bg-purple-50">
                  <h4 class="font-semibold text-purple-800 mb-4">
                    <i class="fas fa-tools mr-2"></i>기술 스킬
                  </h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">보유 기술 및 스킬 *</label>
                    <textarea name="skills" id="skills" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: Java, Python, React, MySQL, Photoshop, 등 보유하신 기술과 스킬을 입력해주세요" required></textarea>
                    <p class="text-sm text-gray-600 mt-1">쉼표(,)로 구분하여 입력해주세요</p>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">자격증</label>
                    <textarea name="certifications" id="certifications" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 정보처리기사, AWS Certified, 등 보유하신 자격증을 입력해주세요"></textarea>
                  </div>
                </div>

                <div class="mt-8">
                  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                </div>
              </form>
            </div>

            {/* Documents Tab */}
            <div id="documents-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">이력서 & 서류 관리</h3>
              
              <div class="space-y-8">
                {/* Resume Upload */}
                <div class="border rounded-lg p-6 bg-orange-50">
                  <h4 class="font-semibold text-orange-800 mb-4">
                    <i class="fas fa-file-alt mr-2"></i>이력서
                  </h4>
                  
                  <div class="mb-4" id="current-resume">
                    <p class="text-sm text-gray-600 mb-2">현재 등록된 이력서:</p>
                    <div class="bg-white border border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <i class="fas fa-file-pdf text-3xl text-gray-400 mb-2"></i>
                      <p class="text-gray-500">등록된 이력서가 없습니다</p>
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">새 이력서 업로드</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input type="file" id="resume-upload" accept=".pdf,.doc,.docx" class="hidden" onchange="uploadResume()" />
                      <label for="resume-upload" class="cursor-pointer">
                        <i class="fas fa-cloud-upload-alt text-4xl text-blue-500 mb-4"></i>
                        <p class="text-lg font-medium text-gray-700">파일을 선택하거나 드래그하여 업로드</p>
                        <p class="text-sm text-gray-500 mt-2">PDF, DOC, DOCX 파일만 지원 (최대 5MB)</p>
                      </label>
                    </div>
                  </div>
                  
                  <div class="flex space-x-4">
                    <button onclick="uploadResume()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-upload mr-2"></i>이력서 업로드
                    </button>
                    <button onclick="downloadResume()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      <i class="fas fa-download mr-2"></i>다운로드
                    </button>
                  </div>
                </div>

                {/* Portfolio */}
                <div class="border rounded-lg p-6 bg-blue-50">
                  <h4 class="font-semibold text-blue-800 mb-4">
                    <i class="fas fa-briefcase mr-2"></i>포트폴리오 & 작업물
                  </h4>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">포트폴리오 URL</label>
                    <input type="url" name="portfolio_url" id="portfolio_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://myportfolio.com" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                    <input type="url" name="github_url" id="github_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://github.com/username" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input type="url" name="linkedin_url" id="linkedin_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://linkedin.com/in/username" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">포트폴리오 파일 업로드</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input type="file" id="portfolio-upload" accept=".pdf,.jpg,.png,.gif,.zip" multiple class="hidden" onchange="uploadPortfolio()" />
                      <label for="portfolio-upload" class="cursor-pointer text-sm text-gray-600">
                        <i class="fas fa-cloud-upload-alt mr-2"></i>포트폴리오 파일 업로드 (여러 파일 가능)
                        <p class="text-xs text-gray-500 mt-1">PDF, JPG, PNG, GIF, ZIP 파일 지원 (각 파일 최대 10MB)</p>
                      </label>
                    </div>
                  </div>
                  
                  <button onclick="savePortfolioLinks()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                </div>

                {/* Additional Documents */}
                <div class="border rounded-lg p-6 bg-gray-50">
                  <h4 class="font-semibold text-gray-800 mb-4">
                    <i class="fas fa-folder mr-2"></i>추가 서류
                  </h4>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">커버레터</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="cover-letter-upload" accept=".pdf,.doc,.docx" class="hidden" onchange="uploadDocument('cover_letter', 'cover-letter-upload')" />
                        <label for="cover-letter-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>커버레터 업로드
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">학위증명서</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="diploma-upload" accept=".pdf,.jpg,.png" class="hidden" onchange="uploadDocument('diploma', 'diploma-upload')" />
                        <label for="diploma-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>학위증명서 업로드
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">자격증</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="certificates-upload" accept=".pdf,.jpg,.png" multiple class="hidden" onchange="uploadDocument('certificate', 'certificates-upload')" />
                        <label for="certificates-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>자격증 업로드 (여러 파일 가능)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications Tab */}
            <div id="applications-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">지원 현황</h3>
              
              <div class="mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-blue-600" id="total-applications">0</div>
                    <div class="text-sm text-blue-600">총 지원</div>
                  </div>
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-yellow-600" id="pending-applications">0</div>
                    <div class="text-sm text-yellow-600">검토중</div>
                  </div>
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-600" id="accepted-applications">0</div>
                    <div class="text-sm text-green-600">합격</div>
                  </div>
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-red-600" id="rejected-applications">0</div>
                    <div class="text-sm text-red-600">불합격</div>
                  </div>
                </div>
              </div>
              
              <div class="space-y-4" id="applications-list">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-inbox text-4xl mb-4"></i>
                  <p>아직 지원한 공고가 없습니다.</p>
                  <button onclick="window.location.href='/jobs'" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    구인공고 찾아보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      message: err.message,
      status: err.status
    }, err.status)
  }
  
  console.error('Unhandled error:', err)
  return c.json({
    success: false,
    message: 'Internal Server Error'
  }, 500)
})

// 📧 이메일 찾기 API
// 🔐 로그인 API
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    console.log('로그인 시도:', { email })
    
    if (!email || !password) {
      return c.json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      }, 400)
    }
    
    // TODO: 실제 데이터베이스에서 사용자 인증
    // 현재는 mock 데이터로 테스트
    const mockUsers = [
      { 
        id: 1,
        email: 'jobseeker@test.com', 
        password: '123456',
        name: '김구직',
        user_type: 'jobseeker',
        phone: '010-1111-2222',
        location: '서울'
      },
      { 
        id: 2,
        email: 'company@test.com', 
        password: '123456',
        name: '테크회사',
        user_type: 'company',
        phone: '02-1234-5678',
        location: '서울'
      },
      { 
        id: 3,
        email: 'agent@test.com', 
        password: '123456',
        name: '김에이전트',
        user_type: 'agent',
        phone: '010-9999-8888',
        location: '부산'
      }
    ]
    
    const user = mockUsers.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return c.json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      }, 401)
    }
    
    // JWT 토큰 생성 (실제로는 JWT 라이브러리 사용)
    // 현재는 간단한 토큰 구조로 테스트
    const token = btoa(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      user_type: user.user_type,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24시간
    }))
    
    // 사용자 정보 (비밀번호 제외)
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      user_type: user.user_type,
      phone: user.phone,
      location: user.location
    }
    
    console.log('로그인 성공:', userInfo)
    
    return c.json({
      success: true,
      message: '로그인에 성공했습니다.',
      token,
      user: userInfo
    })
    
  } catch (error) {
    console.error('로그인 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 👤 회원가입 API
app.post('/api/auth/register', async (c) => {
  try {
    const userData = await c.req.json()
    
    console.log('회원가입 시도:', { ...userData, password: '***' })
    
    const { email, password, confirmPassword, user_type, name, phone, location } = userData
    
    // 필수 필드 검증
    if (!email || !password || !user_type || !name) {
      return c.json({
        success: false,
        message: '필수 정보를 모두 입력해주세요.'
      }, 400)
    }
    
    // 비밀번호 확인
    if (password !== confirmPassword) {
      return c.json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.'
      }, 400)
    }
    
    // 이메일 형식 검증
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return c.json({
        success: false,
        message: '올바른 이메일 형식을 입력해주세요.'
      }, 400)
    }
    
    // 휴대폰 번호 검증 (한국 번호 형식)
    if (phone) {
      const cleanPhone = phone.replace(/[-\s]/g, '')
      const phonePattern = /^01[016789][0-9]{7,8}$/
      if (!phonePattern.test(cleanPhone)) {
        return c.json({
          success: false,
          message: '올바른 휴대폰 번호 형식을 입력해주세요.'
        }, 400)
      }
    }
    
    // TODO: 실제 데이터베이스에 사용자 저장
    // 현재는 성공 응답만 반환
    const newUser = {
      id: Date.now(),
      email,
      name,
      user_type,
      phone,
      location,
      created_at: new Date().toISOString()
    }
    
    console.log('회원가입 성공:', newUser)
    
    return c.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: newUser
    })
    
  } catch (error) {
    console.error('회원가입 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

app.post('/api/auth/find-email', async (c) => {
  try {
    const { name, phone } = await c.req.json()
    
    console.log('이메일 찾기 요청:', { name, phone })
    
    if (!name || !phone) {
      return c.json({
        success: false,
        message: '이름과 연락처를 입력해주세요.'
      }, 400)
    }
    
    // TODO: 실제 데이터베이스에서 사용자 검색
    // 현재는 mock 데이터로 테스트
    const mockUsers = [
      { name: '김민수', phone: '010-1234-5678', email: 'kim@example.com' },
      { name: '이지원', phone: '010-2345-6789', email: 'lee@example.com' },
      { name: '박준영', phone: '010-3456-7890', email: 'park@example.com' }
    ]
    
    // 휴대폰 번호 포맷 정규화 (하이픈 제거 후 비교)
    const normalizePhone = (phoneNumber) => phoneNumber.replace(/[-\s]/g, '')
    
    const foundUser = mockUsers.find(user => 
      user.name === name && normalizePhone(user.phone) === normalizePhone(phone)
    )
    
    if (foundUser) {
      // 이메일의 일부를 마스킹하여 보안 향상
      const maskedEmail = foundUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      
      return c.json({
        success: true,
        message: '이메일을 찾았습니다.',
        email: maskedEmail,
        fullEmail: foundUser.email // 실제로는 보내지 않아야 함 (테스트용)
      })
    } else {
      return c.json({
        success: false,
        message: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.'
      }, 404)
    }
    
  } catch (error) {
    console.error('이메일 찾기 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 🔑 비밀번호 찾기 API
app.post('/api/auth/find-password', async (c) => {
  try {
    const { email, name } = await c.req.json()
    
    console.log('비밀번호 찾기 요청:', { email, name })
    
    if (!email || !name) {
      return c.json({
        success: false,
        message: '이메일과 이름을 입력해주세요.'
      }, 400)
    }
    
    // TODO: 실제 데이터베이스에서 사용자 검색
    // 현재는 mock 데이터로 테스트
    const mockUsers = [
      { name: '김민수', email: 'kim@example.com' },
      { name: '이지원', email: 'lee@example.com' },
      { name: '박준영', email: 'park@example.com' }
    ]
    
    const foundUser = mockUsers.find(user => 
      user.email === email && user.name === name
    )
    
    if (foundUser) {
      // TODO: 실제로는 이메일 발송 로직 구현
      // - 비밀번호 재설정 토큰 생성
      // - 이메일 템플릿으로 발송
      // - 토큰 만료 시간 설정 (예: 1시간)
      
      console.log('비밀번호 재설정 이메일 발송됨:', email)
      
      return c.json({
        success: true,
        message: '비밀번호 재설정 링크를 이메일로 보내드렸습니다.',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // 마스킹된 이메일
      })
    } else {
      return c.json({
        success: false,
        message: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.'
      }, 404)
    }
    
  } catch (error) {
    console.error('비밀번호 찾기 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 👤 사용자 프로필 조회 API
app.get('/api/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    if (!userId) {
      return c.json({
        success: false,
        message: '사용자 ID가 필요합니다.'
      }, 400)
    }
    
    // TODO: 실제 데이터베이스에서 프로필 조회
    // 현재는 Mock 데이터로 테스트
    const mockProfiles = {
      '1': {
        id: 1,
        user_type: 'jobseeker',
        name: '김민수',
        email: 'kim@example.com',
        phone: '01012345678',
        location: '서울',
        profile: {
          birth_date: '1995-03-15',
          gender: 'male',
          nationality: '베트남',
          visa_status: 'E-7',
          career_level: '신입',
          desired_job: '소프트웨어 개발자',
          desired_salary: 35000000,
          skills: 'Java, Spring, React',
          languages: '한국어(중급), 영어(고급)',
          education_level: '학사',
          major: '컴퓨터공학'
        }
      },
      '2': {
        id: 2,
        user_type: 'company',
        name: '이지원',
        email: 'lee@example.com',
        phone: '01023456789',
        location: '경기도',
        profile: {
          company_name: '테크스타트업',
          business_type: 'IT/소프트웨어',
          employee_count: '10-50명',
          established_year: 2020,
          website: 'https://techstartup.co.kr',
          description: '혁신적인 기술로 세상을 바꾸는 스타트업입니다.',
          address: '경기도 성남시 분당구 판교로 123',
          benefits: '4대보험, 퇴직금, 식대지원, 교육비지원'
        }
      },
      '3': {
        id: 3,
        user_type: 'agent',
        name: '박준영',
        email: 'park@example.com',
        phone: '01034567890',
        location: '부산',
        profile: {
          agency_name: '글로벌인재센터',
          license_number: 'LA-2023-001',
          specialization: 'IT/엔지니어링',
          experience_years: 5,
          service_area: '부산, 울산, 경남',
          languages_supported: '한국어, 영어, 중국어',
          success_rate: 85,
          business_phone: '051-123-4567',
          office_address: '부산시 해운대구 센텀중앙로 123'
        }
      }
    }
    
    const userProfile = mockProfiles[userId]
    
    if (userProfile) {
      return c.json({
        success: true,
        data: userProfile
      })
    } else {
      return c.json({
        success: false,
        message: '사용자 프로필을 찾을 수 없습니다.'
      }, 404)
    }
    
  } catch (error) {
    console.error('프로필 조회 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 📝 사용자 프로필 등록/수정 API
app.post('/api/profile', async (c) => {
  try {
    const profileData = await c.req.json()
    
    console.log('프로필 데이터 수신:', profileData)
    
    const { user_id, user_type, profile, id } = profileData
    
    if (!user_id || !user_type || !profile) {
      return c.json({
        success: false,
        message: '필수 정보가 누락되었습니다.'
      }, 400)
    }
    
    // 사용자 유형별 필수 필드 검증
    const requiredFields = {
      jobseeker: ['desired_job'],
      company: ['company_name', 'business_type'],
      agent: ['agency_name', 'specialization']
    }
    
    const required = requiredFields[user_type] || []
    const missingFields = required.filter(field => !profile[field])
    
    if (missingFields.length > 0) {
      return c.json({
        success: false,
        message: `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`
      }, 400)
    }
    
    // Mock 데이터 (프로필 조회 API와 동일)
    const mockProfiles = {
      '1': {
        id: 1,
        user_type: 'jobseeker',
        name: '김민수',
        email: 'kim@example.com',
        phone: '01012345678',
        location: '서울',
        profile: {
          birth_date: '1995-03-15',
          gender: 'male',
          nationality: '베트남',
          visa_status: 'E-7',
          career_level: '신입',
          desired_job: '소프트웨어 개발자',
          desired_salary: 35000000,
          skills: 'Java, Spring, React',
          languages: '한국어(중급), 영어(고급)',
          education_level: '학사',
          major: '컴퓨터공학'
        }
      }
    }
    
    // 수정 모드인지 확인 (ID가 있으면 수정, 없으면 생성)
    const isUpdate = id && mockProfiles[id.toString()]
    
    // TODO: 실제 데이터베이스에 저장
    // 현재는 Mock 응답
    let savedProfile
    
    if (isUpdate) {
      // 기존 프로필 업데이트
      const existingProfile = mockProfiles[id.toString()]
      savedProfile = {
        ...existingProfile,
        user_type,
        profile: {
          ...existingProfile.profile,
          ...profile
        },
        updated_at: new Date().toISOString()
      }
      
      // 이름이 프로필에 있으면 최상위로 이동
      if (profile.name) {
        savedProfile.name = profile.name
        delete savedProfile.profile.name
      }
      
      // Mock 환경에서는 실제 업데이트 없이 응답만 생성
      // mockProfiles[id.toString()] = savedProfile
      
      console.log('프로필 수정 완료:', savedProfile)
      
      return c.json({
        success: true,
        message: '프로필이 성공적으로 수정되었습니다.',
        data: savedProfile
      })
    } else {
      // 새 프로필 생성
      const newId = Date.now()
      savedProfile = {
        id: newId,
        user_id,
        user_type,
        name: profile.name || '사용자',
        email: `user${newId}@example.com`,
        phone: profile.phone || '',
        location: profile.location || '서울',
        profile: { ...profile },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 이름을 프로필에서 제거 (최상위에 있음)
      if (savedProfile.profile.name) {
        delete savedProfile.profile.name
      }
      
      // Mock 환경에서는 실제 저장 없이 응답만 생성
      // mockProfiles[newId.toString()] = savedProfile
      
      console.log('프로필 생성 완료:', savedProfile)
      
      return c.json({
        success: true,
        message: '프로필이 성공적으로 등록되었습니다.',
        data: savedProfile
      })
    }
    
  } catch (error) {
    console.error('프로필 저장 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 📋 프로필 목록 조회 API (사용자 유형별)
app.get('/api/profiles', async (c) => {
  try {
    const { user_type, page = 1, limit = 10, search } = c.req.query()
    
    console.log('프로필 목록 조회:', { user_type, page, limit, search })
    
    // TODO: 실제 데이터베이스에서 프로필 목록 조회
    // 현재는 Mock 데이터로 테스트
    const mockProfileList = [
      {
        id: 1,
        name: '김민수',
        user_type: 'jobseeker',
        location: '서울',
        profile: {
          desired_job: '소프트웨어 개발자',
          career_level: '신입',
          nationality: '베트남',
          skills: 'Java, Spring, React'
        },
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: '이지원',
        user_type: 'jobseeker',
        location: '경기도',
        profile: {
          desired_job: '마케팅 매니저',
          career_level: '경력 2년',
          nationality: '중국',
          skills: '디지털 마케팅, SNS 운영'
        },
        created_at: '2024-01-14T15:20:00Z'
      },
      {
        id: 3,
        name: '박준영',
        user_type: 'jobseeker',
        location: '부산',
        profile: {
          desired_job: 'UX/UI 디자이너',
          career_level: '신입',
          nationality: '필리핀',
          skills: 'Figma, Photoshop, Sketch'
        },
        created_at: '2024-01-13T09:45:00Z'
      }
    ]
    
    // 사용자 유형 필터링
    let filteredProfiles = mockProfileList
    if (user_type) {
      filteredProfiles = mockProfileList.filter(profile => profile.user_type === user_type)
    }
    
    // 검색 필터링
    if (search) {
      filteredProfiles = filteredProfiles.filter(profile => 
        profile.name.includes(search) || 
        profile.profile.desired_job?.includes(search) ||
        profile.profile.company_name?.includes(search)
      )
    }
    
    // 페이지네이션
    const startIndex = (parseInt(page) - 1) * parseInt(limit)
    const endIndex = startIndex + parseInt(limit)
    const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex)
    
    return c.json({
      success: true,
      data: paginatedProfiles,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(filteredProfiles.length / parseInt(limit)),
        total_items: filteredProfiles.length,
        items_per_page: parseInt(limit)
      }
    })
    
  } catch (error) {
    console.error('프로필 목록 조회 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 🔧 구직자 프로필 저장 API
app.post('/api/profile/jobseeker', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, message: '인증이 필요합니다.' }, 401)
    }

    const token = authHeader.substring(7)
    let user
    try {
      user = JSON.parse(atob(token))
    } catch {
      return c.json({ success: false, message: '유효하지 않은 토큰입니다.' }, 401)
    }

    if (user.user_type !== 'jobseeker') {
      return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403)
    }

    const profileData = await c.req.json()
    
    // 프로필 데이터 유효성 검사
    if (!profileData.first_name || !profileData.nationality) {
      return c.json({
        success: false,
        message: '필수 정보가 누락되었습니다. (이름, 국적)'
      }, 400)
    }

    // Mock 프로필 저장 (실제로는 데이터베이스에 저장)
    const profileId = `profile_${user.id}_${Date.now()}`
    const savedProfile = {
      id: profileId,
      user_id: user.id,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('구직자 프로필 저장:', savedProfile)

    return c.json({
      success: true,
      message: '프로필이 성공적으로 저장되었습니다.',
      data: savedProfile
    })

  } catch (error) {
    console.error('프로필 저장 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 🔍 구직자 프로필 조회 API
app.get('/api/profile/jobseeker', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, message: '인증이 필요합니다.' }, 401)
    }

    const token = authHeader.substring(7)
    let user
    try {
      user = JSON.parse(atob(token))
    } catch {
      return c.json({ success: false, message: '유효하지 않은 토큰입니다.' }, 401)
    }

    // Mock 프로필 데이터 (실제로는 데이터베이스에서 조회)
    const mockProfile = {
      id: `profile_${user.id}`,
      user_id: user.id,
      first_name: user.user_type === 'jobseeker' ? user.name : '',
      last_name: '',
      nationality: user.user_type === 'jobseeker' ? 'Vietnam' : '',
      birth_date: '',
      gender: '',
      phone: user.phone || '',
      address: user.location || '',
      // 학력 정보
      education_level: '',
      school_name: '',
      major: '',
      graduation_date: '',
      gpa: '',
      // 경력 정보
      work_experience: '',
      company_name: '',
      position: '',
      work_period: '',
      job_description: '',
      skills: '',
      // 비자 및 언어 정보
      visa_type: '',
      visa_expiry: '',
      korean_level: '',
      english_level: '',
      other_languages: '',
      // 파일 정보
      resume_file: '',
      portfolio_files: [],
      cover_letter_file: '',
      diploma_file: '',
      certificate_files: [],
      // 포트폴리오 링크
      portfolio_url: '',
      github_url: '',
      linkedin_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return c.json({
      success: true,
      data: mockProfile
    })

  } catch (error) {
    console.error('프로필 조회 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 📁 파일 업로드 API (Resume)
app.post('/api/upload/resume', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, message: '인증이 필요합니다.' }, 401)
    }

    const token = authHeader.substring(7)
    let user
    try {
      user = JSON.parse(atob(token))
    } catch {
      return c.json({ success: false, message: '유효하지 않은 토큰입니다.' }, 401)
    }

    if (user.user_type !== 'jobseeker') {
      return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403)
    }

    const formData = await c.req.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return c.json({ success: false, message: '파일이 선택되지 않았습니다.' }, 400)
    }

    // 파일 유효성 검사
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        message: 'PDF, DOC, DOCX 파일만 업로드 가능합니다.'
      }, 400)
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return c.json({
        success: false,
        message: '파일 크기는 5MB 이하여야 합니다.'
      }, 400)
    }

    // Mock 파일 저장 (실제로는 Cloudflare R2나 다른 스토리지에 저장)
    const fileId = `resume_${user.id}_${Date.now()}_${file.name}`
    const savedFile = {
      id: fileId,
      user_id: user.id,
      original_name: file.name,
      file_type: file.type,
      file_size: file.size,
      upload_url: `/uploads/resumes/${fileId}`,
      uploaded_at: new Date().toISOString()
    }

    console.log('이력서 파일 업로드:', savedFile)

    return c.json({
      success: true,
      message: '이력서가 성공적으로 업로드되었습니다.',
      data: savedFile
    })

  } catch (error) {
    console.error('이력서 업로드 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 📁 파일 업로드 API (Portfolio)
app.post('/api/upload/portfolio', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, message: '인증이 필요합니다.' }, 401)
    }

    const token = authHeader.substring(7)
    let user
    try {
      user = JSON.parse(atob(token))
    } catch {
      return c.json({ success: false, message: '유효하지 않은 토큰입니다.' }, 401)
    }

    if (user.user_type !== 'jobseeker') {
      return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403)
    }

    const formData = await c.req.formData()
    const files = formData.getAll('portfolio') as File[]

    if (!files || files.length === 0) {
      return c.json({ success: false, message: '파일이 선택되지 않았습니다.' }, 400)
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip']
    const maxSize = 10 * 1024 * 1024 // 10MB per file
    const savedFiles = []

    for (const file of files) {
      // 파일 유효성 검사
      if (!allowedTypes.includes(file.type)) {
        return c.json({
          success: false,
          message: 'PDF, JPG, PNG, GIF, ZIP 파일만 업로드 가능합니다.'
        }, 400)
      }

      if (file.size > maxSize) {
        return c.json({
          success: false,
          message: '각 파일의 크기는 10MB 이하여야 합니다.'
        }, 400)
      }

      // Mock 파일 저장
      const fileId = `portfolio_${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`
      const savedFile = {
        id: fileId,
        user_id: user.id,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        upload_url: `/uploads/portfolios/${fileId}`,
        uploaded_at: new Date().toISOString()
      }

      savedFiles.push(savedFile)
    }

    console.log('포트폴리오 파일 업로드:', savedFiles)

    return c.json({
      success: true,
      message: `포트폴리오 파일 ${savedFiles.length}개가 성공적으로 업로드되었습니다.`,
      data: savedFiles
    })

  } catch (error) {
    console.error('포트폴리오 업로드 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 📁 기타 서류 업로드 API
app.post('/api/upload/document', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, message: '인증이 필요합니다.' }, 401)
    }

    const token = authHeader.substring(7)
    let user
    try {
      user = JSON.parse(atob(token))
    } catch {
      return c.json({ success: false, message: '유효하지 않은 토큰입니다.' }, 401)
    }

    if (user.user_type !== 'jobseeker') {
      return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403)
    }

    const formData = await c.req.formData()
    const file = formData.get('document') as File
    const documentType = formData.get('type') as string // 'cover_letter', 'diploma', 'certificate'

    if (!file) {
      return c.json({ success: false, message: '파일이 선택되지 않았습니다.' }, 400)
    }

    if (!documentType) {
      return c.json({ success: false, message: '문서 타입이 지정되지 않았습니다.' }, 400)
    }

    // 파일 유효성 검사
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        message: 'PDF, DOC, DOCX, JPG, PNG 파일만 업로드 가능합니다.'
      }, 400)
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return c.json({
        success: false,
        message: '파일 크기는 5MB 이하여야 합니다.'
      }, 400)
    }

    // Mock 파일 저장
    const fileId = `${documentType}_${user.id}_${Date.now()}_${file.name}`
    const savedFile = {
      id: fileId,
      user_id: user.id,
      document_type: documentType,
      original_name: file.name,
      file_type: file.type,
      file_size: file.size,
      upload_url: `/uploads/documents/${fileId}`,
      uploaded_at: new Date().toISOString()
    }

    console.log('문서 파일 업로드:', savedFile)

    return c.json({
      success: true,
      message: '문서가 성공적으로 업로드되었습니다.',
      data: savedFile
    })

  } catch (error) {
    console.error('문서 업로드 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 🎓 Universities API - 협약 대학교 관련 API 엔드포인트들

// 협약 대학교 목록 조회 (지역별 필터링 지원)
app.get('/api/universities', async (c) => {
  try {
    const region = c.req.query('region')
    const featured = c.req.query('featured')
    const type = c.req.query('type') // university_type
    const field = c.req.query('field') // specialties
    const search = c.req.query('search') // name search
    const sort = c.req.query('sort') || 'name'
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    
    // Mock 데이터베이스 - 실제로는 D1 데이터베이스에서 가져옵니다
    const mockUniversities = [
      {
        id: 1,
        name: '서울대학교',
        name_english: 'Seoul National University',
        description: '대한민국 최고의 국립대학교로 우수한 교육과 연구 환경을 제공합니다.',
        website_url: 'https://www.snu.ac.kr',
        region: '서울',
        city: '관악구',
        address: '서울특별시 관악구 관악로 1',
        phone: '02-880-5114',
        email: 'admission@snu.ac.kr',
        established_year: 1946,
        student_count: 28000,
        specialties: ['공학', '경영', '의학', '인문학', '자연과학'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 1,
        university_type: '국립',
        partnership_type: 'premium',
        is_active: true,
        featured: true,
        logo_url: '/static/images/universities/snu.png'
      },
      {
        id: 2,
        name: '연세대학교',
        name_english: 'Yonsei University',
        description: '1885년 설립된 명문 사립대학교로 국제적 수준의 교육을 제공합니다.',
        website_url: 'https://www.yonsei.ac.kr',
        region: '서울',
        city: '서대문구',
        address: '서울특별시 서대문구 연세로 50',
        phone: '02-2123-2114',
        email: 'admission@yonsei.ac.kr',
        established_year: 1885,
        student_count: 26000,
        specialties: ['경영', '공학', '의학', '국제학'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 2,
        university_type: '사립',
        partnership_type: 'premium',
        is_active: true,
        featured: true,
        logo_url: '/static/images/universities/yonsei.png'
      },
      {
        id: 3,
        name: '고려대학교',
        name_english: 'Korea University',
        description: '1905년 설립된 명문 사립대학교로 자유, 정의, 진리의 교육이념을 추구합니다.',
        website_url: 'https://www.korea.ac.kr',
        region: '서울',
        city: '성북구',
        address: '서울특별시 성북구 안암로 145',
        phone: '02-3290-1114',
        email: 'admission@korea.ac.kr',
        established_year: 1905,
        student_count: 37000,
        specialties: ['경영', '공학', '법학', '정치외교학'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 3,
        university_type: '사립',
        partnership_type: 'premium',
        is_active: true,
        featured: true,
        logo_url: '/static/images/universities/korea.png'
      },
      {
        id: 4,
        name: 'KAIST',
        name_english: 'Korea Advanced Institute of Science and Technology',
        description: '과학기술 특성화 대학원대학교로 세계적 수준의 연구중심 대학입니다.',
        website_url: 'https://www.kaist.ac.kr',
        region: '대전',
        city: '유성구',
        address: '대전광역시 유성구 대학로 291',
        phone: '042-350-2114',
        email: 'admission@kaist.ac.kr',
        established_year: 1971,
        student_count: 10000,
        specialties: ['공학', '자연과학', 'IT', '바이오'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 4,
        university_type: '국립',
        partnership_type: 'premium',
        is_active: true,
        featured: true,
        logo_url: '/static/images/universities/kaist.png'
      },
      {
        id: 5,
        name: '부산대학교',
        name_english: 'Pusan National University',
        description: '부산지역 대표 국립대학교로 해양과 항만 특성화 교육을 제공합니다.',
        website_url: 'https://www.pusan.ac.kr',
        region: '부산',
        city: '금정구',
        address: '부산광역시 금정구 부산대학로 63번길 2',
        phone: '051-510-1114',
        email: 'admission@pusan.ac.kr',
        established_year: 1946,
        student_count: 30000,
        specialties: ['공학', '해양과학', '경영', '인문학'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 7,
        university_type: '국립',
        partnership_type: 'standard',
        is_active: true,
        featured: false,
        logo_url: '/static/images/universities/pusan.png'
      },
      {
        id: 6,
        name: '성균관대학교',
        name_english: 'Sungkyunkwan University',
        description: '600년 전통의 명문대학교로 현대적 교육과 전통을 조화시킵니다.',
        website_url: 'https://www.skku.edu',
        region: '서울',
        city: '종로구',
        address: '서울특별시 종로구 성균관로 25-2',
        phone: '02-760-1114',
        email: 'admission@skku.edu',
        established_year: 1398,
        student_count: 31000,
        specialties: ['경영', '공학', 'IT', '인문학'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 5,
        university_type: '사립',
        partnership_type: 'premium',
        is_active: true,
        featured: false,
        logo_url: '/static/images/universities/skku.png'
      },
      {
        id: 7,
        name: '경희대학교',
        name_english: 'Kyung Hee University',
        description: '세계적 수준의 교육과 연구로 인류사회에 기여하는 대학입니다.',
        website_url: 'https://www.khu.ac.kr',
        region: '서울',
        city: '동대문구',
        address: '서울특별시 동대문구 경희대로 26',
        phone: '02-961-0114',
        email: 'admission@khu.ac.kr',
        established_year: 1949,
        student_count: 34000,
        specialties: ['경영', '인문학', '예술', '의학', '국제학'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 8,
        university_type: '사립',
        partnership_type: 'standard',
        is_active: true,
        featured: false,
        logo_url: '/static/images/universities/khu.png'
      },
      {
        id: 8,
        name: '전남대학교',
        name_english: 'Chonnam National University',
        description: '호남지역 대표 국립대학교로 지역사회와 함께 발전하는 대학입니다.',
        website_url: 'https://www.jnu.ac.kr',
        region: '광주',
        city: '북구',
        address: '광주광역시 북구 용봉로 77',
        phone: '062-530-1114',
        email: 'admission@jnu.ac.kr',
        established_year: 1952,
        student_count: 25000,
        specialties: ['공학', '농업', '의학', '인문학', '사회과학'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 10,
        university_type: '국립',
        partnership_type: 'standard',
        is_active: true,
        featured: false,
        logo_url: '/static/images/universities/jnu.png'
      },
      {
        id: 9,
        name: '인하대학교',
        name_english: 'Inha University',
        description: '공학과 경영 분야의 우수한 교육으로 산업발전에 기여하는 대학입니다.',
        website_url: 'https://www.inha.ac.kr',
        region: '인천',
        city: '미추홀구',
        address: '인천광역시 미추홀구 인하로 100',
        phone: '032-860-7114',
        email: 'admission@inha.ac.kr',
        established_year: 1954,
        student_count: 22000,
        specialties: ['공학', '경영', 'IT', '물류', '항공'],
        dormitory_available: true,
        language_support: true,
        ranking_domestic: 12,
        university_type: '사립',
        partnership_type: 'standard',
        is_active: true,
        featured: false,
        logo_url: '/static/images/universities/inha.png'
      }
    ]
    
    // 필터링 적용
    let filteredUniversities = mockUniversities.filter(uni => uni.is_active)
    
    // 지역 필터
    if (region && region !== 'all') {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.region === region
      )
    }
    
    // 대학 유형 필터
    if (type && type !== 'all') {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.university_type === type
      )
    }
    
    // 전공 분야 필터
    if (field && field !== 'all') {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.specialties && uni.specialties.some(specialty => 
          specialty.includes(field)
        )
      )
    }
    
    // 검색어 필터
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.name.toLowerCase().includes(searchLower) || 
        (uni.name_english && uni.name_english.toLowerCase().includes(searchLower))
      )
    }
    
    // 특별협약 필터
    if (featured === 'true') {
      filteredUniversities = filteredUniversities.filter(uni => uni.featured)
    }
    
    // 정렬
    filteredUniversities.sort((a, b) => {
      if (sort === 'featured') {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return a.ranking_domestic - b.ranking_domestic
      } else if (sort === 'region') {
        const regionCompare = a.region.localeCompare(b.region, 'ko')
        if (regionCompare !== 0) return regionCompare
        return a.ranking_domestic - b.ranking_domestic
      } else { // name
        return a.name.localeCompare(b.name, 'ko')
      }
    })
    
    // 페이지네이션
    const total = filteredUniversities.length
    const universities = filteredUniversities.slice(offset, offset + limit)
    
    return c.json({
      success: true,
      data: universities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
    
  } catch (error) {
    console.error('협약 대학교 조회 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 특정 대학교 상세 정보 조회
app.get('/api/universities/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    // Mock 데이터 - 실제로는 데이터베이스에서 조회
    const mockUniversity = {
      id: 1,
      name: '서울대학교',
      name_english: 'Seoul National University',
      description: '대한민국 최고의 국립대학교로 우수한 교육과 연구 환경을 제공합니다.',
      website_url: 'https://www.snu.ac.kr',
      region: '서울',
      city: '관악구',
      address: '서울특별시 관악구 관악로 1',
      phone: '02-880-5114',
      email: 'admission@snu.ac.kr',
      established_year: 1946,
      student_count: 28000,
      specialties: ['공학', '경영', '의학', '인문학', '자연과학'],
      dormitory_available: true,
      language_support: true,
      ranking_domestic: 1,
      partnership_type: 'premium',
      is_active: true,
      featured: true,
      logo_url: '/static/images/universities/snu.png',
      international_programs: [
        {
          name: '한국어 연수 프로그램',
          duration: '6개월~1년',
          cost: '3,000,000원/학기',
          description: '외국인 학생을 위한 체계적인 한국어 교육'
        },
        {
          name: '학부 정규 과정',
          duration: '4년',
          cost: '4,000,000원/학기',
          description: '다양한 전공의 학사 학위 과정'
        },
        {
          name: '대학원 과정',
          duration: '2-4년',
          cost: '4,500,000원/학기',
          description: '석사 및 박사 학위 과정'
        }
      ],
      scholarship_info: [
        {
          name: 'Global Korea Scholarship',
          coverage: '등록금 100% + 생활비',
          requirements: 'TOPIK 4급 이상, GPA 3.0 이상'
        },
        {
          name: 'SNU Excellence Scholarship',
          coverage: '등록금 50%',
          requirements: 'TOPIK 3급 이상, 추천서 필요'
        }
      ],
      admission_requirements: {
        language: 'TOPIK 3급 이상 또는 영어 TOEFL 80점 이상',
        academic: '고등학교 졸업증명서, 성적증명서',
        documents: ['자기소개서', '학업계획서', '추천서 2부'],
        deadlines: {
          spring: '2024년 11월 30일',
          fall: '2024년 5월 31일'
        }
      }
    }
    
    if (id !== mockUniversity.id) {
      return c.json({
        success: false,
        message: '해당 대학교를 찾을 수 없습니다.'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: mockUniversity
    })
    
  } catch (error) {
    console.error('대학교 상세 정보 조회 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 협약 대학교 생성 (관리자 전용)
app.post('/api/universities', requireAuth(USER_LEVELS.ADMIN), async (c) => {
  try {
    const body = await c.req.json()
    const {
      name, name_english, description, website_url, region, city, address,
      phone, email, established_year, student_count, specialties,
      dormitory_available, language_support, partnership_type
    } = body
    
    // 필수 필드 검증
    if (!name || !region || !website_url) {
      return c.json({
        success: false,
        message: '필수 필드가 누락되었습니다. (name, region, website_url)'
      }, 400)
    }
    
    // Mock 생성 - 실제로는 데이터베이스에 저장
    const newUniversity = {
      id: Date.now(), // Mock ID
      name,
      name_english: name_english || '',
      description: description || '',
      website_url,
      region,
      city: city || '',
      address: address || '',
      phone: phone || '',
      email: email || '',
      established_year: established_year || null,
      student_count: student_count || null,
      specialties: specialties || [],
      dormitory_available: dormitory_available || false,
      language_support: language_support || false,
      partnership_type: partnership_type || 'standard',
      is_active: true,
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('새 협약 대학교 생성:', newUniversity)
    
    return c.json({
      success: true,
      message: '협약 대학교가 성공적으로 등록되었습니다.',
      data: newUniversity
    }, 201)
    
  } catch (error) {
    console.error('협약 대학교 생성 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 협약 대학교 수정 (관리자 전용)
app.put('/api/universities/:id', requireAuth(USER_LEVELS.ADMIN), async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    
    // Mock 업데이트 - 실제로는 데이터베이스에서 업데이트
    const updatedUniversity = {
      id,
      ...body,
      updated_at: new Date().toISOString()
    }
    
    console.log('협약 대학교 수정:', updatedUniversity)
    
    return c.json({
      success: true,
      message: '협약 대학교 정보가 성공적으로 수정되었습니다.',
      data: updatedUniversity
    })
    
  } catch (error) {
    console.error('협약 대학교 수정 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// 협약 대학교 삭제 (관리자 전용)
app.delete('/api/universities/:id', requireAuth(USER_LEVELS.ADMIN), async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    // Mock 삭제 - 실제로는 데이터베이스에서 is_active를 false로 설정
    console.log('협약 대학교 삭제:', id)
    
    return c.json({
      success: true,
      message: '협약 대학교가 성공적으로 삭제되었습니다.'
    })
    
  } catch (error) {
    console.error('협약 대학교 삭제 오류:', error)
    return c.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// Contact page (문의하기)
app.get('/contact', (c) => {
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
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <a href="/contact" class="text-blue-600 font-medium">문의하기</a>
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

      {/* Contact Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">문의하기</h1>
          <p class="text-gray-600 text-lg">궁금한 사항이나 도움이 필요하시면 언제든 연락주세요</p>
        </div>
        
        <div class="max-w-6xl mx-auto">
          <div class="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div class="bg-white rounded-lg shadow-sm border p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">온라인 문의</h2>
              
              <form id="contact-form" class="space-y-6">
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                    <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="이름을 입력하세요" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                    <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="example@email.com" />
                  </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                    <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="010-1234-5678" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">문의 유형</label>
                    <select name="inquiry_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="general">일반 문의</option>
                      <option value="jobseeker">구직자 문의</option>
                      <option value="company">기업 문의</option>
                      <option value="agent">에이전트 문의</option>
                      <option value="technical">기술지원</option>
                      <option value="partnership">제휴 문의</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                  <input type="text" name="subject" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="문의 제목을 입력하세요" />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">문의 내용 *</label>
                  <textarea name="message" required rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="궁금한 내용을 상세히 작성해 주세요"></textarea>
                </div>
                
                <div class="flex items-center space-x-3">
                  <input type="checkbox" id="privacy-agree" name="privacy_agree" required class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label for="privacy-agree" class="text-sm text-gray-700">개인정보 수집 및 이용에 동의합니다</label>
                </div>
                
                <button type="submit" class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <i class="fas fa-paper-plane mr-2"></i>문의 보내기
                </button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div class="space-y-8">
              {/* Contact Methods */}
              <div class="bg-white rounded-lg shadow-sm border p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">연락처 정보</h2>
                
                <div class="space-y-6">
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-envelope text-blue-600"></i>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">이메일</h3>
                      <p class="text-gray-600 mt-1">info@wow-campus.kr</p>
                      <p class="text-sm text-gray-500 mt-1">일반 문의 및 상담 (답변: 24시간 이내)</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-phone text-green-600"></i>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">전화</h3>
                      <p class="text-gray-600 mt-1">02-1234-5678</p>
                      <p class="text-sm text-gray-500 mt-1">평일 09:00~18:00 (점심시간 12:00~13:00 제외)</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-map-marker-alt text-purple-600"></i>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">주소</h3>
                      <p class="text-gray-600 mt-1">서울시 강남구 테헤란로 123</p>
                      <p class="text-gray-600">WOW-CAMPUS 빌딩 5층</p>
                      <p class="text-sm text-gray-500 mt-1">방문 상담 시 사전 예약 필수</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-comments text-orange-600"></i>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">실시간 채팅</h3>
                      <p class="text-gray-600 mt-1">홈페이지 우하단 채팡버튼</p>
                      <p class="text-sm text-gray-500 mt-1">평일 09:00~18:00 실시간 상담 가능</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Business Hours */}
              <div class="bg-blue-50 rounded-lg p-6">
                <h3 class="font-semibold text-gray-900 mb-4">운영 시간</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">평일</span>
                    <span class="text-gray-900 font-medium">09:00 - 18:00</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">점심시간</span>
                    <span class="text-gray-900 font-medium">12:00 - 13:00</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">주말 및 공휴일</span>
                    <span class="text-red-600 font-medium">휴무</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div class="bg-white rounded-lg shadow-sm border p-6">
                <h3 class="font-semibold text-gray-900 mb-4">빠른 도움말</h3>
                <div class="space-y-3">
                  <a href="/faq" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex items-center space-x-3">
                      <i class="fas fa-question-circle text-blue-600"></i>
                      <span class="font-medium">자주 묻는 질문</span>
                    </div>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                  </a>
                  <a href="/guide" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex items-center space-x-3">
                      <i class="fas fa-book text-green-600"></i>
                      <span class="font-medium">이용가이드</span>
                    </div>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                  </a>
                  <a href="/support" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex items-center space-x-3">
                      <i class="fas fa-headset text-purple-600"></i>
                      <span class="font-medium">고객지원 센터</span>
                    </div>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Contact JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Contact page JavaScript loading...');
            
            document.addEventListener('DOMContentLoaded', function() {
              const contactForm = document.getElementById('contact-form');
              
              if (contactForm) {
                contactForm.addEventListener('submit', function(event) {
                  event.preventDefault();
                  
                  const formData = new FormData(event.target);
                  const data = {};
                  for (let [key, value] of formData.entries()) {
                    data[key] = value;
                  }
                  
                  console.log('문의 내용:', data);
                  
                  // 실제 서버로 전송 전 알림
                  alert('문의가 접수되었습니다. 24시간 이내에 답변드리겠습니다.');
                  
                  // 폼 초기화
                  event.target.reset();
                });
              }
              
              console.log('Contact page initialized');
            });
            
            console.log('Contact page JavaScript loaded successfully!');
          </script>
        `
      }}></div>
      
      {/* Authentication JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Authentication JavaScript loading...');
            
            // 🔐 로그인 모달 표시
            function showLoginModal() {
              console.log('로그인 모달 호출됨');
              
              const modalId = 'loginModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = \`
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">로그인</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700">
                      <i class="fas fa-times text-xl"></i>
                    </button>
                  </div>
                  
                  <form id="loginForm" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이메일을 입력하세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 입력하세요" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        로그인
                      </button>
                    </div>
                  </form>
                </div>
              \`;
              
              document.body.style.overflow = 'hidden';
              document.body.appendChild(modal);
              
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function() {
                closeModal(modal);
              });
            }
            
            // 📝 회원가입 모달 표시  
            function showSignupModal() {
              console.log('회원가입 모달 호출됨');
              
              const modalId = 'signupModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = \`
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700">
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
                      <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이름을 입력해주세요" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        회원가입
                      </button>
                    </div>
                  </form>
                </div>
              \`;
              
              document.body.style.overflow = 'hidden';
              document.body.appendChild(modal);
              
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function() {
                closeModal(modal);
              });
            }
            
            // 모달 닫기 함수
            function closeModal(modal) {
              if (modal && modal.parentElement) {
                document.body.style.overflow = '';
                modal.remove();
              }
            }
            
            // Make functions available globally
            window.showLoginModal = showLoginModal;
            window.showSignupModal = showSignupModal;
            window.closeModal = closeModal;
            
            console.log('Authentication system loaded successfully!');
          </script>
        `
      }}></div>
      
    </div>
  )
})

// Notice page (공지사항)
app.get('/notice', (c) => {
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
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <a href="/notice" class="text-blue-600 font-medium">공지사항</a>
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
          </div>
        </nav>
      </header>

      {/* Notice Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">공지사항</h1>
          <p class="text-gray-600 text-lg">WOW-CAMPUS의 중요한 소식과 업데이트 정보를 확인하세요</p>
        </div>
        
        <div class="max-w-4xl mx-auto space-y-6">
          {/* Important Notice */}
          <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div class="flex items-center mb-3">
              <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              <span class="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">중요</span>
              <span class="ml-3 text-gray-500 text-sm">2024.10.10</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">시스템 점검 안내</h3>
            <p class="text-gray-600 leading-relaxed">
              10월 15일 (일) 02:00 ~ 06:00 시스템 점검으로 인해 서비스 이용이 제한될 예정입니다. 
              대량 데이터 백업 및 보안 업데이트가 진행될 예정이니 양해 부탁드립니다.
            </p>
          </div>
          
          {/* Notice List */}
          <div class="bg-white rounded-lg shadow-sm border">
            <div class="p-6 border-b">
              <h2 class="text-xl font-semibold text-gray-900">전체 공지사항</h2>
            </div>
            
            <div class="divide-y divide-gray-200">
              {/* Notice Item 1 */}
              <div class="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onclick="toggleNoticeDetail(this)">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-2">일반</span>
                      <span class="text-gray-500 text-sm">2024.10.08</span>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-1">새로운 AI 매칭 시스템 도입 안내</h3>
                    <p class="text-gray-600">보다 정밀한 매칭을 위한 AI 시스템이 도입되었습니다.</p>
                  </div>
                  <i class="fas fa-chevron-down text-gray-400 transform transition-transform notice-chevron"></i>
                </div>
                <div class="notice-detail mt-4 hidden">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-gray-700 leading-relaxed mb-3">
                      안녕하세요, WOW-CAMPUS입니다. 고객님들의 더 나은 서비스 이용을 위해 
                      새로운 AI 매칭 시스템을 도입하게 되었습니다.
                    </p>
                    <h4 class="font-medium text-gray-900 mb-2">주요 개선 사항:</h4>
                    <ul class="list-disc list-inside text-gray-700 space-y-1">
                      <li>더 정밀한 직무 매칭 알고리즘</li>
                      <li>개인 선호도 및 경력 분석 기능 강화</li>
                      <li>실시간 지원 현황 모니터링</li>
                      <li>기업과 구직자 모두에게 도움이 되는 매칭 시스템</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Notice Item 2 */}
              <div class="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onclick="toggleNoticeDetail(this)">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium mr-2">업데이트</span>
                      <span class="text-gray-500 text-sm">2024.10.05</span>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-1">모바일 앱 개선 및 새로운 기능 추가</h3>
                    <p class="text-gray-600">사용자 편의성을 높인 모바일 앱 업데이트가 완료되었습니다.</p>
                  </div>
                  <i class="fas fa-chevron-down text-gray-400 transform transition-transform notice-chevron"></i>
                </div>
                <div class="notice-detail mt-4 hidden">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-gray-700 leading-relaxed mb-3">
                      WOW-CAMPUS 모바일 앱이 더욱 편리하게 개선되었습니다.
                    </p>
                    <h4 class="font-medium text-gray-900 mb-2">새로운 기능:</h4>
                    <ul class="list-disc list-inside text-gray-700 space-y-1">
                      <li>실시간 알림 기능</li>
                      <li>오프라인 모드에서 이력서 작성 가능</li>
                      <li>개선된 검색 및 필터 기능</li>
                      <li>빠른 앱 로딩 속도</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Notice Item 3 */}
              <div class="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onclick="toggleNoticeDetail(this)">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium mr-2">이벤트</span>
                      <span class="text-gray-500 text-sm">2024.10.01</span>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-1">가을 이벤트: 성공적인 취업 스토리 공모전</h3>
                    <p class="text-gray-600">성공적인 취업 스토리를 공유하고 풀한 상금을 받아가세요!</p>
                  </div>
                  <i class="fas fa-chevron-down text-gray-400 transform transition-transform notice-chevron"></i>
                </div>
                <div class="notice-detail mt-4 hidden">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-gray-700 leading-relaxed mb-3">
                      WOW-CAMPUS를 통해 성공적으로 취업하신 분들의 스토리를 모집합니다.
                    </p>
                    <h4 class="font-medium text-gray-900 mb-2">참여 조건:</h4>
                    <ul class="list-disc list-inside text-gray-700 space-y-1">
                      <li>WOW-CAMPUS를 통해 취업 성공하신 분</li>
                      <li>진실하고 구체적인 스토리 (최소 500자)</li>
                      <li>사진 및 영상 첸부 가능</li>
                    </ul>
                    <p class="text-gray-700 mt-3">
                      <strong>상금:</strong> 1등 50만원, 2등 30만원, 3등 20만원<br />
                      <strong>마감:</strong> 2024년 10월 31일
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Notice JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Notice page JavaScript loading...');
            
            function toggleNoticeDetail(element) {
              const detail = element.querySelector('.notice-detail');
              const chevron = element.querySelector('.notice-chevron');
              
              if (detail.classList.contains('hidden')) {
                detail.classList.remove('hidden');
                chevron.classList.add('rotate-180');
              } else {
                detail.classList.add('hidden');
                chevron.classList.remove('rotate-180');
              }
            }
            
            // Make functions globally available
            window.toggleNoticeDetail = toggleNoticeDetail;
            
            document.addEventListener('DOMContentLoaded', function() {
              console.log('Notice page initialized');
            });
            
            console.log('Notice page JavaScript loaded successfully!');
          </script>
        `
      }}></div>
      
      {/* Authentication JavaScript - Same as other pages */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            function showLoginModal() {
              alert('로그인 기능은 개발 중입니다.');
            }
            
            function showSignupModal() {
              alert('회원가입 기능은 개발 중입니다.');
            }
            
            window.showLoginModal = showLoginModal;
            window.showSignupModal = showSignupModal;
          </script>
        `
      }}></div>
      
    </div>
  )
})

// Blog page (블로그)
app.get('/blog', (c) => {
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
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <a href="/blog" class="text-blue-600 font-medium">블로그</a>
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
          </div>
        </nav>
      </header>

      {/* Blog Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">WOW-CAMPUS 블로그</h1>
          <p class="text-gray-600 text-lg">취업 정보, 유학 가이드, 성공 스토리를 공유합니다</p>
        </div>
        
        {/* Featured Post */}
        <div class="max-w-6xl mx-auto mb-12">
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="md:flex">
              <div class="md:w-1/2">
                <div class="h-64 md:h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <i class="fas fa-image text-6xl text-blue-400"></i>
                </div>
              </div>
              <div class="md:w-1/2 p-8">
                <div class="flex items-center mb-4">
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">특집</span>
                  <span class="ml-3 text-gray-500 text-sm">2024.10.08</span>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-4">한국 취업 성공 가이드: 외국인을 위한 완벽 준비법</h2>
                <p class="text-gray-600 mb-4 leading-relaxed">
                  한국에서 성공적인 취업을 위해 알아야 할 모든 것! 비자 준비부터 면접 팁, 그리고 실제 업무 적응까지 실전 경험을 바탕으로 성공 노하우를 공개합니다.
                </p>
                <a href="#" class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  자세히 읽기 <i class="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blog Categories */}
        <div class="max-w-6xl mx-auto mb-8">
          <div class="flex flex-wrap justify-center gap-4">
            <button onclick="showBlogCategory('all')" class="blog-category-btn bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium" data-category="all">
              전체
            </button>
            <button onclick="showBlogCategory('job-tips')" class="blog-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="job-tips">
              취업 팁
            </button>
            <button onclick="showBlogCategory('study-abroad')" class="blog-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="study-abroad">
              유학 정보
            </button>
            <button onclick="showBlogCategory('success-story')" class="blog-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="success-story">
              성공 스토리
            </button>
            <button onclick="showBlogCategory('company-info')" class="blog-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="company-info">
              기업 정보
            </button>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div class="max-w-6xl mx-auto">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="blog-posts-container">
            
            {/* Job Tips Posts */}
            <article class="blog-post bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow" data-category="job-tips">
              <div class="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <i class="fas fa-briefcase text-4xl text-green-500"></i>
              </div>
              <div class="p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">취업 팁</span>
                  <span class="ml-2 text-gray-500 text-sm">2024.10.05</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">이력서 작성의 모든 것</h3>
                <p class="text-gray-600 text-sm mb-4">외국인 구직자를 위한 한국식 이력서 작성법과 핵심 포인트를 알아보세요.</p>
                <a href="#" class="text-blue-600 hover:text-blue-800 text-sm font-medium">더 읽기 →</a>
              </div>
            </article>
            
            <article class="blog-post bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow" data-category="job-tips">
              <div class="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <i class="fas fa-comments text-4xl text-blue-500"></i>
              </div>
              <div class="p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">취업 팁</span>
                  <span class="ml-2 text-gray-500 text-sm">2024.10.03</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">면접 성공 비법</h3>
                <p class="text-gray-600 text-sm mb-4">한국 기업 면접의 특징과 준비 방법, 예상 질문과 답변 예시를 알아보세요.</p>
                <a href="#" class="text-blue-600 hover:text-blue-800 text-sm font-medium">더 읽기 →</a>
              </div>
            </article>
            
            {/* Study Abroad Posts */}
            <article class="blog-post bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow" data-category="study-abroad">
              <div class="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <i class="fas fa-graduation-cap text-4xl text-purple-500"></i>
              </div>
              <div class="p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">유학 정보</span>
                  <span class="ml-2 text-gray-500 text-sm">2024.10.01</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">한국 대학 입학 가이드</h3>
                <p class="text-gray-600 text-sm mb-4">외국인 전형부터 장학금 신청까지, 한국 대학 입학의 A부터 Z까지.</p>
                <a href="#" class="text-blue-600 hover:text-blue-800 text-sm font-medium">더 읽기 →</a>
              </div>
            </article>
            
            <article class="blog-post bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow" data-category="study-abroad">
              <div class="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <i class="fas fa-language text-4xl text-orange-500"></i>
              </div>
              <div class="p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">유학 정보</span>
                  <span class="ml-2 text-gray-500 text-sm">2024.09.28</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">한국어 학습 노하우</h3>
                <p class="text-gray-600 text-sm mb-4">빠른 시간 내에 한국어 실력을 늘릴 수 있는 효과적인 학습 방법을 공개합니다.</p>
                <a href="#" class="text-blue-600 hover:text-blue-800 text-sm font-medium">더 읽기 →</a>
              </div>
            </article>
            
            {/* Success Stories */}
            <article class="blog-post bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow" data-category="success-story">
              <div class="h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <i class="fas fa-star text-4xl text-yellow-500"></i>
              </div>
              <div class="p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">성공 스토리</span>
                  <span class="ml-2 text-gray-500 text-sm">2024.09.25</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">마리아의 삼성전자 취업 성공기</h3>
                <p class="text-gray-600 text-sm mb-4">마리아가 필리핀에서 한국으로 와서 삼성전자에 취업한 실제 이야기를 들어보세요.</p>
                <a href="#" class="text-blue-600 hover:text-blue-800 text-sm font-medium">더 읽기 →</a>
              </div>
            </article>
            
            {/* Company Info */}
            <article class="blog-post bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow" data-category="company-info">
              <div class="h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <i class="fas fa-building text-4xl text-red-500"></i>
              </div>
              <div class="p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">기업 정보</span>
                  <span class="ml-2 text-gray-500 text-sm">2024.09.20</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">외국인 친화적인 IT 기업 TOP 10</h3>
                <p class="text-gray-600 text-sm mb-4">외국인 직원을 적극 채용하고 지원하는 한국의 대표 IT 기업들을 소개합니다.</p>
                <a href="#" class="text-blue-600 hover:text-blue-800 text-sm font-medium">더 읽기 →</a>
              </div>
            </article>
          </div>
          
          {/* Load More Button */}
          <div class="text-center mt-12">
            <button class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <i class="fas fa-plus mr-2"></i>더 많은 글 보기
            </button>
          </div>
        </div>
      </main>

      {/* Blog JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Blog page JavaScript loading...');
            
            function showBlogCategory(category) {
              console.log('Showing blog category:', category);
              
              // Update button states
              const buttons = document.querySelectorAll('.blog-category-btn');
              buttons.forEach(btn => {
                const btnCategory = btn.getAttribute('data-category');
                if (btnCategory === category) {
                  btn.classList.remove('bg-gray-200', 'text-gray-700');
                  btn.classList.add('bg-blue-600', 'text-white');
                } else {
                  btn.classList.remove('bg-blue-600', 'text-white');
                  btn.classList.add('bg-gray-200', 'text-gray-700');
                }
              });
              
              // Show/hide blog posts
              const blogPosts = document.querySelectorAll('.blog-post');
              blogPosts.forEach(post => {
                const postCategory = post.getAttribute('data-category');
                if (category === 'all' || postCategory === category) {
                  post.style.display = 'block';
                } else {
                  post.style.display = 'none';
                }
              });
            }
            
            // Make functions globally available
            window.showBlogCategory = showBlogCategory;
            
            // Initialize
            document.addEventListener('DOMContentLoaded', function() {
              console.log('Blog page initialized');
              showBlogCategory('all');
            });
            
            console.log('Blog page JavaScript loaded successfully!');
          </script>
        `
      }}></div>
      
      {/* Authentication JavaScript - Simplified */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            function showLoginModal() {
              alert('로그인 기능은 개발 중입니다.');
            }
            
            function showSignupModal() {
              alert('회원가입 기능은 개발 중입니다.');
            }
            
            window.showLoginModal = showLoginModal;
            window.showSignupModal = showSignupModal;
          </script>
        `
      }}></div>
      
    </div>
  )
})

// Guide page (이용가이드)
app.get('/guide', (c) => {
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
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <a href="/guide" class="text-blue-600 font-medium">이용가이드</a>
            <a href="/faq" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">FAQ</a>
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

      {/* Guide Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">이용가이드</h1>
          <p class="text-gray-600 text-lg">WOW-CAMPUS를 효과적으로 이용하는 방법을 단계별로 안내합니다</p>
        </div>
        
        {/* Guide Categories */}
        <div class="mb-8">
          <div class="flex flex-wrap justify-center gap-4">
            <button onclick="showGuideCategory('all')" class="guide-category-btn bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium" data-category="all">
              전체 가이드
            </button>
            <button onclick="showGuideCategory('getting-started')" class="guide-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="getting-started">
              시작하기
            </button>
            <button onclick="showGuideCategory('jobseeker')" class="guide-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="jobseeker">
              구직자 가이드
            </button>
            <button onclick="showGuideCategory('company')" class="guide-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="company">
              기업 가이드
            </button>
            <button onclick="showGuideCategory('agent')" class="guide-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="agent">
              에이전트 가이드
            </button>
          </div>
        </div>

        {/* Guide Items */}
        <div class="max-w-6xl mx-auto space-y-8" id="guide-container">
          
          {/* 시작하기 가이드 */}
          <div class="guide-item" data-category="getting-started">
            <div class="bg-white rounded-lg shadow-sm border p-8">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <i class="fas fa-play text-blue-600 text-xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">시작하기</h2>
              </div>
              
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">1단계: 회원가입</h3>
                  <div class="space-y-3">
                    <div class="flex items-start space-x-3">
                      <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
                      <p class="text-gray-600">홈페이지 상단의 '회원가입' 버튼 클릭</p>
                    </div>
                    <div class="flex items-start space-x-3">
                      <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
                      <p class="text-gray-600">사용자 유형 선택 (구직자/기업/에이전트/유학생)</p>
                    </div>
                    <div class="flex items-start space-x-3">
                      <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
                      <p class="text-gray-600">필수 정보 입력 및 이메일 인증</p>
                    </div>
                    <div class="flex items-start space-x-3">
                      <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
                      <p class="text-gray-600">회원가입 완료 및 로그인</p>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">2단계: 프로필 설정</h3>
                  <div class="space-y-3">
                    <div class="flex items-start space-x-3">
                      <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
                      <p class="text-gray-600">대시보드에서 '기본 정보' 탭 클릭</p>
                    </div>
                    <div class="flex items-start space-x-3">
                      <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
                      <p class="text-gray-600">프로필 사진 및 개인정보 입력</p>
                    </div>
                    <div class="flex items-start space-x-3">
                      <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
                      <p class="text-gray-600">학력, 경력, 비자 정보 등록</p>
                    </div>
                    <div class="flex items-start space-x-3">
                      <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
                      <p class="text-gray-600">프로필 완성도 100% 달성</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 구직자 가이드 */}
          <div class="guide-item" data-category="jobseeker">
            <div class="bg-white rounded-lg shadow-sm border p-8">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <i class="fas fa-user-tie text-green-600 text-xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">구직자 이용가이드</h2>
              </div>
              
              <div class="space-y-8">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">📝 이력서 작성</h3>
                  <div class="bg-gray-50 rounded-lg p-6">
                    <div class="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 class="font-medium text-gray-900 mb-3">이력서 작성 팁</h4>
                        <ul class="space-y-2 text-sm text-gray-600">
                          <li>• 사진은 명함사진으로 최근 6개월 이내 촬영</li>
                          <li>• 경력사항은 시간순으로 상세히 기재</li>
                          <li>• 자격증 및 어학능력 정확히 명시</li>
                          <li>• 한국어와 영어 버전 모두 준비</li>
                        </ul>
                      </div>
                      <div>
                        <h4 class="font-medium text-gray-900 mb-3">자기소개서 작성법</h4>
                        <ul class="space-y-2 text-sm text-gray-600">
                          <li>• 지원동기와 포부 명확히 작성</li>
                          <li>• 한국에서의 계획과 목표 제시</li>
                          <li>• 구체적인 사례와 수치로 성과 어필</li>
                          <li>• 기업 문화와 업무에 대한 이해도 표현</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 구인공고 찾기 및 지원</h3>
                  <div class="bg-blue-50 rounded-lg p-6">
                    <div class="space-y-4">
                      <div class="flex items-start space-x-3">
                        <i class="fas fa-search text-blue-600 mt-1"></i>
                        <div>
                          <h4 class="font-medium text-gray-900">검색 및 필터링</h4>
                          <p class="text-sm text-gray-600 mt-1">지역, 직무, 경력, 비자 유형 등 다양한 조건으로 검색하여 적합한 공고를 찾아보세요.</p>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3">
                        <i class="fas fa-heart text-red-500 mt-1"></i>
                        <div>
                          <h4 class="font-medium text-gray-900">관심 공고 저장</h4>
                          <p class="text-sm text-gray-600 mt-1">관심 있는 공고는 '좋아요' 버튼을 눌러 저장하고 나중에 다시 확인할 수 있습니다.</p>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3">
                        <i class="fas fa-paper-plane text-green-600 mt-1"></i>
                        <div>
                          <h4 class="font-medium text-gray-900">지원서 제출</h4>
                          <p class="text-sm text-gray-600 mt-1">이력서와 자기소개서를 완성한 후 '지원하기' 버튼을 클릭하여 제출하세요.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 기업 가이드 */}
          <div class="guide-item" data-category="company">
            <div class="bg-white rounded-lg shadow-sm border p-8">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <i class="fas fa-building text-purple-600 text-xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">기업 이용가이드</h2>
              </div>
              
              <div class="space-y-8">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">📎 구인공고 등록</h3>
                  <div class="bg-purple-50 rounded-lg p-6">
                    <div class="space-y-4">
                      <div class="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 class="font-medium text-gray-900 mb-3">공고 작성 요령</h4>
                          <ul class="space-y-2 text-sm text-gray-600">
                            <li>• 직무 내용과 자격 요건 구체적 명시</li>
                            <li>• 근무 조건 및 복리후생 상세 기재</li>
                            <li>• 비자 지원 여부 및 지원 범위 명시</li>
                            <li>• 어학 능력 요구사항 정확히 제시</li>
                          </ul>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900 mb-3">효과적인 채용 방법</h4>
                          <ul class="space-y-2 text-sm text-gray-600">
                            <li>• 정기적으로 공고 내용 업데이트</li>
                            <li>• 지원자에게 빠른 피드백 제공</li>
                            <li>• 면접 일정 사전 공지 및 안내</li>
                            <li>• 옵션 서비스를 통한 전문 지원</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">📄 지원자 관리</h3>
                  <div class="bg-gray-50 rounded-lg p-6">
                    <div class="space-y-4">
                      <div class="flex items-start space-x-3">
                        <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
                        <div>
                          <h4 class="font-medium text-gray-900">지원서 검토 및 평가</h4>
                          <p class="text-sm text-gray-600 mt-1">대시보드에서 지원자 이력서를 확인하고 평점을 매겨 체계적으로 관리하세요.</p>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3">
                        <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
                        <div>
                          <h4 class="font-medium text-gray-900">면접 일정 조율</h4>
                          <p class="text-sm text-gray-600 mt-1">적합한 지원자에게 면접 일정을 제안하고, 온라인 또는 오프라인 면접을 진행하세요.</p>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3">
                        <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
                        <div>
                          <h4 class="font-medium text-gray-900">채용 진행 및 비자 지원</h4>
                          <p class="text-sm text-gray-600 mt-1">최종 채용 결정 후 비자 발급에 필요한 서류를 준비하고 지원하세요.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 에이전트 가이드 */}
          <div class="guide-item" data-category="agent">
            <div class="bg-white rounded-lg shadow-sm border p-8">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <i class="fas fa-handshake text-orange-600 text-xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">에이전트 이용가이드</h2>
              </div>
              
              <div class="space-y-8">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">🌐 에이전트 등록 및 인증</h3>
                  <div class="bg-orange-50 rounded-lg p-6">
                    <div class="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 class="font-medium text-gray-900 mb-3">등록 요구사항</h4>
                        <ul class="space-y-2 text-sm text-gray-600">
                          <li>• 해외 현지 인재 모집 경험 1년 이상</li>
                          <li>• 관련 기관 또는 네트워크 보유</li>
                          <li>• 사업자 등록증 또는 관련 자격증</li>
                          <li>• 한국어 중급 이상 소통 가능</li>
                        </ul>
                      </div>
                      <div>
                        <h4 class="font-medium text-gray-900 mb-3">심사 절차</h4>
                        <ul class="space-y-2 text-sm text-gray-600">
                          <li>• 온라인 신청서 작성 및 서류 제출</li>
                          <li>• 1차 서류 심사 및 자격 검증</li>
                          <li>• 2차 온라인 면접 및 역량 평가</li>
                          <li>• 최종 승인 및 에이전트 등록 완료</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">💼 에이전트 업무 가이드</h3>
                  <div class="bg-gray-50 rounded-lg p-6">
                    <div class="space-y-4">
                      <div class="flex items-start space-x-3">
                        <i class="fas fa-users text-orange-600 mt-1"></i>
                        <div>
                          <h4 class="font-medium text-gray-900">인재 모집 및 선별</h4>
                          <p class="text-sm text-gray-600 mt-1">현지에서 우수한 인재를 발굴하고 기본 자격 요건을 충족하는지 사전 검증하세요.</p>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3">
                        <i class="fas fa-file-alt text-orange-600 mt-1"></i>
                        <div>
                          <h4 class="font-medium text-gray-900">서류 검토 및 준비</h4>
                          <p class="text-sm text-gray-600 mt-1">지원자의 이력서, 학력증명서, 어학능력 증명서 등을 검토하고 번역 지원하세요.</p>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3">
                        <i class="fas fa-chart-line text-orange-600 mt-1"></i>
                        <div>
                          <h4 class="font-medium text-gray-900">매칭 및 성과 관리</h4>
                          <p class="text-sm text-gray-600 mt-1">기업과 지원자 간 매칭을 진행하고 채용 성과에 따라 수수료를 정산받으세요.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources Section */}
        <div class="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">추가 도움말</h2>
            <p class="text-gray-600">더 자세한 도움이 필요하시다면 언제든 문의해 주세요</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg p-6 text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-question-circle text-blue-600 text-2xl"></i>
              </div>
              <h3 class="font-semibold mb-2">FAQ</h3>
              <p class="text-sm text-gray-600 mb-4">자주 묻는 질문을 통해 빠른 답을 찾아보세요</p>
              <a href="/faq" class="text-blue-600 hover:text-blue-800 font-medium">FAQ 보기 →</a>
            </div>
            
            <div class="bg-white rounded-lg p-6 text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-headset text-green-600 text-2xl"></i>
              </div>
              <h3 class="font-semibold mb-2">고객지원</h3>
              <p class="text-sm text-gray-600 mb-4">1:1 맞춤 상담으로 문제를 해결해 드립니다</p>
              <a href="/support" class="text-green-600 hover:text-green-800 font-medium">상담하기 →</a>
            </div>
            
            <div class="bg-white rounded-lg p-6 text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-envelope text-purple-600 text-2xl"></i>
              </div>
              <h3 class="font-semibold mb-2">직접 문의</h3>
              <p class="text-sm text-gray-600 mb-4">이메일로 직접 문의하고 답변을 받으세요</p>
              <a href="mailto:info@wow-campus.kr" class="text-purple-600 hover:text-purple-800 font-medium">이메일 보내기 →</a>
            </div>
          </div>
        </div>
      </main>

      {/* Guide JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Guide page JavaScript loading...');
            
            function showGuideCategory(category) {
              console.log('Showing guide category:', category);
              
              // Update button states
              const buttons = document.querySelectorAll('.guide-category-btn');
              buttons.forEach(btn => {
                const btnCategory = btn.getAttribute('data-category');
                if (btnCategory === category) {
                  btn.classList.remove('bg-gray-200', 'text-gray-700');
                  btn.classList.add('bg-blue-600', 'text-white');
                } else {
                  btn.classList.remove('bg-blue-600', 'text-white');
                  btn.classList.add('bg-gray-200', 'text-gray-700');
                }
              });
              
              // Show/hide guide items
              const guideItems = document.querySelectorAll('.guide-item');
              guideItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (category === 'all' || itemCategory === category) {
                  item.style.display = 'block';
                } else {
                  item.style.display = 'none';
                }
              });
            }
            
            // Make functions globally available
            window.showGuideCategory = showGuideCategory;
            
            // Initialize
            document.addEventListener('DOMContentLoaded', function() {
              console.log('Guide page initialized');
              showGuideCategory('all');
            });
            
            console.log('Guide page JavaScript loaded successfully!');
          </script>
        `
      }}></div>
      
      {/* Authentication JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Authentication JavaScript loading...');
            
            // Helper function to get user type label
            function getUserTypeLabel(userType) {
              const labels = {
                jobseeker: '구직자',
                company: '구인기업', 
                agent: '에이전트',
                admin: '관리자'
              };
              return labels[userType] || '사용자';
            }
            
            // 🔐 로그인 모달 표시
            function showLoginModal() {
              console.log('로그인 모달 호출됨');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"]');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modalId = 'loginModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = \`
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">로그인</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
                      <i class="fas fa-times text-xl"></i>
                    </button>
                  </div>
                  
                  <form id="loginForm" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이메일을 입력하세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 입력하세요" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        로그인
                      </button>
                    </div>
                  </form>
                </div>
              \`;
              
              document.body.style.overflow = 'hidden';
              document.body.appendChild(modal);
              
              // 닫기 버튼 이벤트
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              // 취소 버튼 이벤트
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              // 폼 제출 이벤트
              const loginForm = modal.querySelector('#loginForm');
              loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleLogin(event);
              });
            }
            
            // 📝 회원가입 모달 표시  
            function showSignupModal() {
              console.log('회원가입 모달 호출됨');
              
              const modalId = 'signupModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = \`
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700">
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
                      <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이름을 입력해주세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="example@email.com" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required minlength="6" placeholder="최소 6자 이상" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        회원가입
                      </button>
                    </div>
                  </form>
                </div>
              \`;
              
              document.body.style.overflow = 'hidden';
              document.body.appendChild(modal);
              
              // 닫기 버튼 이벤트
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              // 취소 버튼 이벤트
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              // 폼 제출 이벤트
              const signupForm = modal.querySelector('#signupForm');
              signupForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleSignup(event);
              });
            }
            
            // 모달 닫기 함수
            function closeModal(modal) {
              if (modal && modal.parentElement) {
                document.body.style.overflow = '';
                modal.remove();
              }
            }
            
            function handleLogin(event) {
              const form = event.target;
              const formData = new FormData(form);
              const email = formData.get('email');
              const password = formData.get('password');
              
              console.log('로그인 시도:', { email, password: '***' });
              alert('로그인 기능은 백엔드 연동 후 구현 예정입니다.');
            }
            
            function handleSignup(event) {
              const form = event.target;
              const formData = new FormData(form);
              const data = {};
              for (let [key, value] of formData.entries()) {
                data[key] = value;
              }
              
              console.log('회원가입 시도:', data);
              alert('회원가입 기능은 백엔드 연동 후 구현 예정입니다.');
            }
            
            // Make functions available globally
            window.showLoginModal = showLoginModal;
            window.showSignupModal = showSignupModal;
            window.closeModal = closeModal;
            
            console.log('Authentication system loaded successfully!');
          </script>
        `
      }}></div>
      
    </div>
  )
})

// FAQ page (자주 묻는 질문)
app.get('/faq', (c) => {
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
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <a href="/faq" class="text-blue-600 font-medium">FAQ</a>
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

      {/* FAQ Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">자주 묻는 질문</h1>
          <p class="text-gray-600 text-lg">WOW-CAMPUS 이용에 관한 궁금한 점들을 확인해보세요</p>
        </div>
        
        {/* FAQ Categories */}
        <div class="mb-8">
          <div class="flex flex-wrap justify-center gap-4">
            <button onclick="showFAQCategory('all')" class="faq-category-btn bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium" data-category="all">
              전체
            </button>
            <button onclick="showFAQCategory('jobseeker')" class="faq-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="jobseeker">
              구직자
            </button>
            <button onclick="showFAQCategory('company')" class="faq-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="company">
              기업
            </button>
            <button onclick="showFAQCategory('agent')" class="faq-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="agent">
              에이전트
            </button>
            <button onclick="showFAQCategory('study')" class="faq-category-btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium" data-category="study">
              유학
            </button>
          </div>
        </div>

        {/* FAQ Items */}
        <div class="max-w-4xl mx-auto space-y-4" id="faq-container">
          
          {/* 구직자 관련 FAQ */}
          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="jobseeker">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">회원가입은 어떻게 하나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">홈페이지 상단의 '회원가입' 버튼을 클릭하여 사용자 유형(구직자/기업/에이전트)을 선택하고 필요한 정보를 입력하시면 됩니다. 이메일 인증 후 바로 서비스를 이용할 수 있습니다.</p>
            </div>
          </div>

          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="jobseeker">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">이력서는 어떻게 작성하나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">로그인 후 대시보드에서 '이력서 & 서류' 탭을 통해 이력서를 작성할 수 있습니다. 한국어와 영어 버전을 모두 지원하며, 템플릿을 제공하여 쉽게 작성할 수 있습니다.</p>
            </div>
          </div>

          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="jobseeker">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">비자 준비는 어떻게 해야 하나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">취업 비자(E-7)나 특정 활동 비자(E-7) 등이 필요합니다. 채용 확정 후 기업에서 비자 발급에 필요한 서류를 지원해드리며, 자세한 절차는 고객지원팀에 문의해 주세요.</p>
            </div>
          </div>

          {/* 기업 관련 FAQ */}
          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="company">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">구인공고는 어떻게 등록하나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">기업 회원으로 가입 후 대시보드에서 '구인공고 등록' 메뉴를 통해 공고를 등록할 수 있습니다. 직무, 자격 요건, 근무 조건 등을 상세히 입력하여 적합한 인재를 찾아보세요.</p>
            </div>
          </div>

          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="company">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">외국인 채용 시 주의사항이 있나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">외국인 채용 시 비자 상태 확인, 한국어 능력 평가, 문화적 차이 이해 등이 중요합니다. 또한 고용허가제, E-7 비자 등 관련 법규를 준수해야 합니다. 자세한 가이드는 기업 대시보드에서 확인할 수 있습니다.</p>
            </div>
          </div>

          {/* 에이전트 관련 FAQ */}
          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="agent">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">에이전트로 등록하려면 어떤 자격이 필요한가요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">해외 현지에서 인재 모집 경험이 있거나 관련 네트워크를 보유한 분들이 지원할 수 있습니다. 에이전트 등록 시 사업자 등록증, 경력 증명서 등의 서류 심사를 거쳐 승인됩니다.</p>
            </div>
          </div>

          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="agent">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">수수료는 어떻게 정해지나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">성공적인 매칭 시 약정된 수수료를 지급합니다. 수수료율은 직종과 채용 조건에 따라 다르며, 계약 시 명시됩니다. 자세한 수수료 정책은 에이전트 대시보드에서 확인할 수 있습니다.</p>
            </div>
          </div>

          {/* 유학 관련 FAQ */}
          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="study">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">한국어 연수 프로그램은 어떤 것들이 있나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">초급부터 고급까지 단계별 한국어 교육 프로그램을 제공합니다. TOPIK 시험 준비 과정, 문화 적응 프로그램 등도 포함되어 있으며, 온라인과 오프라인 수업을 모두 지원합니다.</p>
            </div>
          </div>

          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="study">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">장학금 지원은 어떻게 받을 수 있나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">성적 우수자, 특기자, 저소득층 등을 대상으로 다양한 장학금 프로그램을 운영합니다. 지원 자격과 절차는 유학 정보 페이지에서 확인하거나 상담을 통해 안내받을 수 있습니다.</p>
            </div>
          </div>

          {/* 일반적인 FAQ */}
          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="general">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">서비스 이용료가 있나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed">기본적인 서비스 이용은 무료입니다. 구직자 회원가입, 구인공고 열람, 지원 등은 모두 무료로 제공됩니다. 프리미엄 서비스나 추가 지원 서비스는 별도 요금이 있을 수 있습니다.</p>
            </div>
          </div>

          <div class="faq-item bg-white rounded-lg shadow-sm border" data-category="general">
            <button class="w-full text-left p-6 flex items-center justify-between focus:outline-none" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900">문의사항이 있을 때는 어떻게 연락하나요?</span>
              <i class="fas fa-chevron-down text-gray-500 transform transition-transform"></i>
            </button>
            <div class="faq-answer p-6 pt-0 text-gray-600 hidden">
              <p class="leading-relaxed mb-4">다양한 방법으로 연락할 수 있습니다:</p>
              <ul class="space-y-2">
                <li>• <strong>이메일:</strong> info@wow-campus.kr</li>
                <li>• <strong>전화:</strong> 02-1234-5678 (평일 09:00~18:00)</li>
                <li>• <strong>고객지원 페이지:</strong> <a href="/support" class="text-blue-600 hover:underline">지원 센터</a></li>
                <li>• <strong>실시간 채팅:</strong> 홈페이지 우하단 채팅 버튼</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div class="mt-16 text-center bg-blue-50 rounded-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">더 궁금한 점이 있으신가요?</h2>
          <p class="text-gray-600 mb-6">FAQ에서 답을 찾지 못하셨다면 언제든 문의해 주세요</p>
          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/support" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <i class="fas fa-headset mr-2"></i>고객지원 센터
            </a>
            <a href="mailto:info@wow-campus.kr" class="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              <i class="fas fa-envelope mr-2"></i>이메일 문의
            </a>
          </div>
        </div>
      </main>

      {/* FAQ JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('FAQ page JavaScript loading...');
            
            function showFAQCategory(category) {
              console.log('Showing FAQ category:', category);
              
              // Update button states
              const buttons = document.querySelectorAll('.faq-category-btn');
              buttons.forEach(btn => {
                const btnCategory = btn.getAttribute('data-category');
                if (btnCategory === category) {
                  btn.classList.remove('bg-gray-200', 'text-gray-700');
                  btn.classList.add('bg-blue-600', 'text-white');
                } else {
                  btn.classList.remove('bg-blue-600', 'text-white');
                  btn.classList.add('bg-gray-200', 'text-gray-700');
                }
              });
              
              // Show/hide FAQ items
              const faqItems = document.querySelectorAll('.faq-item');
              faqItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (category === 'all' || itemCategory === category || itemCategory === 'general') {
                  item.style.display = 'block';
                } else {
                  item.style.display = 'none';
                }
              });
            }
            
            function toggleFAQ(button) {
              const faqItem = button.parentElement;
              const answer = faqItem.querySelector('.faq-answer');
              const icon = button.querySelector('i');
              
              if (answer.classList.contains('hidden')) {
                answer.classList.remove('hidden');
                icon.classList.add('rotate-180');
              } else {
                answer.classList.add('hidden');
                icon.classList.remove('rotate-180');
              }
            }
            
            // Make functions globally available
            window.showFAQCategory = showFAQCategory;
            window.toggleFAQ = toggleFAQ;
            
            // Initialize
            document.addEventListener('DOMContentLoaded', function() {
              console.log('FAQ page initialized');
              showFAQCategory('all');
            });
            
            console.log('FAQ page JavaScript loaded successfully!');
          </script>
        `
      }}></div>
      
      {/* Authentication JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('Authentication JavaScript loading...');
            
            // Helper function to get user type label
            function getUserTypeLabel(userType) {
              const labels = {
                jobseeker: '구직자',
                company: '구인기업', 
                agent: '에이전트',
                admin: '관리자'
              };
              return labels[userType] || '사용자';
            }
            
            // 🔐 로그인 모달 표시
            function showLoginModal() {
              console.log('로그인 모달 호출됨');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"]');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modalId = 'loginModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = \`
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">로그인</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
                      <i class="fas fa-times text-xl"></i>
                    </button>
                  </div>
                  
                  <form id="loginForm" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이메일을 입력하세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 입력하세요" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        로그인
                      </button>
                    </div>
                  </form>
                </div>
              \`;
              
              document.body.style.overflow = 'hidden';
              document.body.appendChild(modal);
              
              // 닫기 버튼 이벤트
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              // 취소 버튼 이벤트
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              // 폼 제출 이벤트
              const loginForm = modal.querySelector('#loginForm');
              loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleLogin(event);
              });
            }
            
            // 📝 회원가입 모달 표시  
            function showSignupModal() {
              console.log('회원가입 모달 호출됨');
              
              const modalId = 'signupModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = \`
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700">
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
                      <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이름을 입력해주세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="example@email.com" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required minlength="6" placeholder="최소 6자 이상" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        회원가입
                      </button>
                    </div>
                  </form>
                </div>
              \`;
              
              document.body.style.overflow = 'hidden';
              document.body.appendChild(modal);
              
              // 닫기 버튼 이벤트
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              // 취소 버튼 이벤트
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function() {
                closeModal(modal);
              });
              
              // 폼 제출 이벤트
              const signupForm = modal.querySelector('#signupForm');
              signupForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleSignup(event);
              });
            }
            
            // 모달 닫기 함수
            function closeModal(modal) {
              if (modal && modal.parentElement) {
                document.body.style.overflow = '';
                modal.remove();
              }
            }
            
            function handleLogin(event) {
              const form = event.target;
              const formData = new FormData(form);
              const email = formData.get('email');
              const password = formData.get('password');
              
              console.log('로그인 시도:', { email, password: '***' });
              alert('로그인 기능은 백엔드 연동 후 구현 예정입니다.');
            }
            
            function handleSignup(event) {
              const form = event.target;
              const formData = new FormData(form);
              const data = {};
              for (let [key, value] of formData.entries()) {
                data[key] = value;
              }
              
              console.log('회원가입 시도:', data);
              alert('회원가입 기능은 백엔드 연동 후 구현 예정입니다.');
            }
            
            // Make functions available globally
            window.showLoginModal = showLoginModal;
            window.showSignupModal = showSignupModal;
            window.closeModal = closeModal;
            
            console.log('Authentication system loaded successfully!');
          </script>
        `
      }}></div>
      
      {/* 🔐 권한별 UI 관리 JavaScript */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            console.log('권한 시스템 JavaScript 로딩...');
            
            // 🔐 권한별 동적 UI 관리
            const USER_LEVELS = {
              GUEST: 0,
              JOBSEEKER: 1,
              COMPANY: 2,
              AGENT: 3,
              ADMIN: 4
            };
            
            const USER_TYPE_TO_LEVEL = {
              guest: USER_LEVELS.GUEST,
              jobseeker: USER_LEVELS.JOBSEEKER,
              company: USER_LEVELS.COMPANY,
              agent: USER_LEVELS.AGENT,
              admin: USER_LEVELS.ADMIN
            };
            
            // 🎯 사용자별 서비스 메뉴 설정
            function updateServiceDropdown(userType = 'guest') {
              console.log('Updating service dropdown for:', userType);
              const dropdownContainer = document.getElementById('service-dropdown-container');
              const mobileMenuContainer = document.getElementById('mobile-service-menu-container');
              
              if (!dropdownContainer || !mobileMenuContainer) {
                console.log('Service dropdown containers not found');
                return;
              }
              
              let menuItems = [];
              
              switch(userType) {
                case 'jobseeker':
                  menuItems = [
                    { href: '/jobseekers/profile', icon: 'fa-user', text: '내 프로필 관리', color: 'green' },
                    { href: '/jobs', icon: 'fa-search', text: '일자리 찾기', color: 'blue' },
                    { href: '/matching/jobseeker', icon: 'fa-magic', text: 'AI 매칭', color: 'purple' },
                    { href: '/jobseekers/applications', icon: 'fa-file-alt', text: '지원 현황', color: 'orange' }
                  ];
                  break;
                  
                case 'company':
                  menuItems = [
                    { href: '/jobs/post', icon: 'fa-plus', text: '채용공고 등록', color: 'blue' },
                    { href: '/jobs/manage', icon: 'fa-briefcase', text: '채용 관리', color: 'purple' },
                    { href: '/matching/company', icon: 'fa-users', text: '인재 추천', color: 'green' },
                    { href: '/company/dashboard', icon: 'fa-chart-bar', text: '기업 대시보드', color: 'indigo' }
                  ];
                  break;
                  
                case 'agent':
                  menuItems = [
                    { href: '/agents/dashboard', icon: 'fa-chart-line', text: '성과 대시보드', color: 'blue' },
                    { href: '/agents/clients', icon: 'fa-handshake', text: '클라이언트 관리', color: 'green' },
                    { href: '/matching/agent', icon: 'fa-magic', text: '매칭 관리', color: 'purple' },
                    { href: '/consulting', icon: 'fa-comments', text: '상담 서비스', color: 'orange' }
                  ];
                  break;
                  
                case 'admin':
                  menuItems = [
                    { href: '/admin/users', icon: 'fa-users-cog', text: '사용자 관리', color: 'red' },
                    { href: '/admin/statistics', icon: 'fa-chart-bar', text: '통계 분석', color: 'blue' },
                    { href: '/admin/content', icon: 'fa-file-text', text: '콘텐츠 관리', color: 'green' },
                    { href: '/admin/settings', icon: 'fa-cog', text: '시스템 설정', color: 'gray' }
                  ];
                  break;
                  
                default: // guest
                  menuItems = [
                    { href: '/jobs', icon: 'fa-briefcase', text: '구인정보', color: 'blue' },
                    { href: '/jobseekers', icon: 'fa-users', text: '구직정보', color: 'green' },
                    { href: '/study', icon: 'fa-graduation-cap', text: '유학정보', color: 'orange' },
                    { href: '/agents', icon: 'fa-handshake', text: '에이전트', color: 'purple' }
                  ];
              }
              
              // Desktop dropdown 업데이트
              const desktopMenu = menuItems.map(item => 
                \`<a href="\${item.href}" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-\${item.color}-600 transition-colors">
                  <i class="fas \${item.icon} mr-2 text-\${item.color}-500"></i>\${item.text}
                </a>\`
              ).join('');
              
              dropdownContainer.innerHTML = desktopMenu;
              
              // Mobile menu 업데이트
              const mobileMenu = menuItems.map(item => 
                \`<a href="\${item.href}" class="block pl-4 py-2 text-gray-600 hover:text-\${item.color}-600 transition-colors">
                  <i class="fas \${item.icon} mr-2 text-\${item.color}-500"></i>\${item.text}
                </a>\`
              ).join('');
              
              mobileMenuContainer.innerHTML = mobileMenu;
              
              console.log(\`Service dropdown updated with \${menuItems.length} items for \${userType}\`);
            }
            
            // 🔄 페이지 로드 시 초기화
            document.addEventListener('DOMContentLoaded', function() {
              console.log('권한별 UI 초기화 중...');
              
              // URL 파라미터에서 사용자 타입 확인 (테스트용)
              const urlParams = new URLSearchParams(window.location.search);
              const userType = urlParams.get('user') || 'guest';
              
              console.log('Current user type:', userType);
              updateServiceDropdown(userType);
              
              // 사용자 권한 알림 (테스트용)
              const userLevel = USER_TYPE_TO_LEVEL[userType] || USER_LEVELS.GUEST;
              console.log(\`사용자 권한 레벨: \${userLevel} (타입: \${userType})\`);
              
              // 테스트용 권한 변경 안내
              if (userType === 'guest') {
                console.log('🎯 테스트 가능한 권한별 URL:');
                console.log('- 구직자: /?user=jobseeker');
                console.log('- 기업: /?user=company'); 
                console.log('- 에이전트: /?user=agent');
                console.log('- 관리자: /?user=admin');
              }
            });
            
            // 🚀 "시작하기" 사용자 유형 선택 모달
            function showGetStartedModal() {
              console.log('사용자 유형 선택 모달 표시');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('#get-started-modal');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modal = document.createElement('div');
              modal.id = 'get-started-modal';
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
              modal.innerHTML = \`
                <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i class="fas fa-rocket text-2xl text-white"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">어떤 서비스를 원하시나요?</h2>
                    <p class="text-gray-600">당신에게 맞는 서비스를 선택하고 WOW-CAMPUS를 시작해보세요</p>
                  </div>
                  
                  <div class="grid md:grid-cols-2 gap-6 mb-8">
{/* 구직자 옵션 */}
                    <div onclick="startOnboarding('jobseeker')" class="group p-8 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
                      <div class="text-center">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">👤</div>
                        <h3 class="font-bold text-xl mb-3 text-gray-900">일자리를 찾고 있어요</h3>
                        <p class="text-gray-600 mb-4">한국에서 일할 기회를 찾고 계신가요?</p>
                        <div class="text-sm text-blue-600 font-medium">
                          ✓ 맞춤형 일자리 추천 ✓ AI 매칭 서비스 ✓ 이력서 관리
                        </div>
                      </div>
                    </div>
                    
{/* 기업 옵션 */}
                    <div onclick="startOnboarding('company')" class="group p-8 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
                      <div class="text-center">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
                        <h3 class="font-bold text-xl mb-3 text-gray-900">인재를 채용하고 싶어요</h3>
                        <p class="text-gray-600 mb-4">우수한 외국인 직원을 찾고 계신가요?</p>
                        <div class="text-sm text-purple-600 font-medium">
                          ✓ 채용공고 등록 ✓ 인재 추천 서비스 ✓ 지원자 관리
                        </div>
                      </div>
                    </div>
                    
{/* 에이전트 옵션 */}
                    <div onclick="startOnboarding('agent')" class="group p-8 border-2 border-green-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
                      <div class="text-center">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🤝</div>
                        <h3 class="font-bold text-xl mb-3 text-gray-900">매칭 서비스를 제공해요</h3>
                        <p class="text-gray-600 mb-4">전문 에이전트로 활동하고 싶으신가요?</p>
                        <div class="text-sm text-green-600 font-medium">
                          ✓ 클라이언트 관리 ✓ 성과 분석 ✓ 수수료 정산
                        </div>
                      </div>
                    </div>
                    
{/* 유학생 옵션 */}
                    <div onclick="startOnboarding('student')" class="group p-8 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
                      <div class="text-center">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                        <h3 class="font-bold text-xl mb-3 text-gray-900">한국 유학을 계획해요</h3>
                        <p class="text-gray-600 mb-4">한국에서 공부하고 싶으신가요?</p>
                        <div class="text-sm text-orange-600 font-medium">
                          ✓ 맞춤 프로그램 추천 ✓ 전문 상담 ✓ 지원서류 도움
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-center">
                    <button onclick="closeGetStartedModal()" class="px-8 py-3 text-gray-500 hover:text-gray-700 transition-colors font-medium">
                      <i class="fas fa-times mr-2"></i>나중에 하기
                    </button>
                  </div>
                </div>
              \`;
              
              document.body.appendChild(modal);
              document.body.style.overflow = 'hidden';
              
              // 모달 외부 클릭 시 닫기
              modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                  closeGetStartedModal();
                }
              });
              
              // ESC 키로 닫기
              const handleEscape = function(e) {
                if (e.key === 'Escape') {
                  closeGetStartedModal();
                  document.removeEventListener('keydown', handleEscape);
                }
              };
              document.addEventListener('keydown', handleEscape);
            }
            
            // 🔄 온보딩 플로우 시작
            function startOnboarding(userType) {
              console.log('온보딩 시작:', userType);
              
              closeGetStartedModal();
              
              // 선택된 사용자 타입을 localStorage에 저장
              localStorage.setItem('selected_user_type', userType);
              
              switch(userType) {
                case 'jobseeker':
                  showOnboardingMessage('구직자', '👤', 'green', function() {
                    showSignupModal(userType);
                  });
                  break;
                  
                case 'company':
                  showOnboardingMessage('기업', '🏢', 'purple', function() {
                    showSignupModal(userType);
                  });
                  break;
                  
                case 'agent':
                  showOnboardingMessage('에이전트', '🤝', 'blue', function() {
                    window.location.href = '/agents?user=agent';
                  });
                  break;
                  
                case 'student':
                  showOnboardingMessage('유학생', '🎓', 'orange', function() {
                    window.location.href = '/study?user=student';
                  });
                  break;
              }
            }
            
            // 🎉 온보딩 시작 메시지 표시
            function showOnboardingMessage(userTypeName, icon, color, callback) {
              const messageModal = document.createElement('div');
              messageModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
              messageModal.innerHTML = \`
                <div class="bg-white rounded-2xl p-10 max-w-md w-full mx-4 text-center animate-pulse">
                  <div class="text-8xl mb-6">\${icon}</div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-4">\${userTypeName} 온보딩을 시작합니다!</h2>
                  <p class="text-gray-600 mb-6">잠시만 기다려주세요...</p>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-\${color}-600 h-2 rounded-full transition-all duration-1000" style="width: 0%"></div>
                  </div>
                </div>
              \`;
              
              document.body.appendChild(messageModal);
              
              // 프로그레스 바 애니메이션
              setTimeout(() => {
                const progressBar = messageModal.querySelector('div[style*="width"]');
                if (progressBar) {
                  progressBar.style.width = '100%';
                }
              }, 100);
              
              // 2초 후 다음 단계로
              setTimeout(() => {
                messageModal.remove();
                if (callback) callback();
              }, 2000);
            }
            
            // 모달 닫기 함수들
            function closeGetStartedModal() {
              const modal = document.querySelector('#get-started-modal');
              if (modal) {
                modal.remove();
                document.body.style.overflow = '';
              }
            }
            
            // Make functions available globally
            window.updateServiceDropdown = updateServiceDropdown;
            window.USER_LEVELS = USER_LEVELS;
            window.USER_TYPE_TO_LEVEL = USER_TYPE_TO_LEVEL;
            window.showGetStartedModal = showGetStartedModal;
            window.startOnboarding = startOnboarding;
            window.closeGetStartedModal = closeGetStartedModal;
            
            console.log('🔐 권한 시스템 및 온보딩 시스템 로드 완료!');
          </script>
        `
      }}></div>
      
    </div>
  )
})

// 🔐 권한별 전용 페이지 라우트들

// 구직자 프로필 관리 페이지 (레벨 1 이상)
app.get('/jobseekers/profile', requireAuth(USER_LEVELS.JOBSEEKER), (c) => {
  const userType = c.req.query('user') || 'jobseeker'
  const userPermissions = renderUserSpecificUI(userType)
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <h1 class="text-2xl font-bold text-gray-900">
            <i class="fas fa-user text-green-600 mr-3"></i>내 프로필 관리
          </h1>
          <p class="text-gray-600 mt-2">구직자 전용 - 프로필과 이력서를 관리하세요</p>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">프로필 관리 기능</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="p-4 border rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">
                <i class="fas fa-edit text-blue-600 mr-2"></i>이력서 작성
              </h3>
              <p class="text-gray-600">경력, 학력, 자격증 정보를 입력하세요</p>
            </div>
            <div class="p-4 border rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">
                <i class="fas fa-folder text-purple-600 mr-2"></i>포트폴리오 관리
              </h3>
              <p class="text-gray-600">작업물과 프로젝트를 등록하세요</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// 기업 채용공고 등록 페이지 (레벨 2 이상)
app.get('/jobs/post', requireAuth(USER_LEVELS.COMPANY), (c) => {
  const userType = c.req.query('user') || 'company'
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <h1 class="text-2xl font-bold text-gray-900">
            <i class="fas fa-plus text-blue-600 mr-3"></i>채용공고 등록
          </h1>
          <p class="text-gray-600 mt-2">기업 전용 - 새로운 채용공고를 등록하세요</p>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">채용공고 작성</h2>
          <div class="space-y-4">
            <div class="p-4 border rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">
                <i class="fas fa-briefcase text-blue-600 mr-2"></i>직무 정보
              </h3>
              <p class="text-gray-600">직무명, 담당업무, 요구사항을 입력하세요</p>
            </div>
            <div class="p-4 border rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">
                <i class="fas fa-won-sign text-green-600 mr-2"></i>근무 조건
              </h3>
              <p class="text-gray-600">급여, 근무시간, 복리후생을 설정하세요</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// 에이전트 대시보드 페이지 (레벨 3 이상)
app.get('/agents/dashboard', requireAuth(USER_LEVELS.AGENT), (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <h1 class="text-2xl font-bold text-gray-900">
            <i class="fas fa-chart-line text-blue-600 mr-3"></i>에이전트 대시보드
          </h1>
          <p class="text-gray-600 mt-2">에이전트 전용 - 성과 현황과 클라이언트를 관리하세요</p>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold text-gray-900 mb-2">
              <i class="fas fa-handshake text-blue-600 mr-2"></i>매칭 성공률
            </h3>
            <div class="text-3xl font-bold text-blue-600">85%</div>
            <p class="text-gray-600 text-sm">이번 달 성과</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold text-gray-900 mb-2">
              <i class="fas fa-users text-green-600 mr-2"></i>관리 클라이언트
            </h3>
            <div class="text-3xl font-bold text-green-600">24</div>
            <p class="text-gray-600 text-sm">활성 클라이언트 수</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold text-gray-900 mb-2">
              <i class="fas fa-won-sign text-purple-600 mr-2"></i>이번 달 수수료
            </h3>
            <div class="text-3xl font-bold text-purple-600">₩2.1M</div>
            <p class="text-gray-600 text-sm">총 수수료 수입</p>
          </div>
        </div>
      </main>
    </div>
  )
})

// 관리자 사용자 관리 페이지 (레벨 4)
app.get('/admin/users', requireAuth(USER_LEVELS.ADMIN), (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <h1 class="text-2xl font-bold text-gray-900">
            <i class="fas fa-users-cog text-red-600 mr-3"></i>사용자 관리
          </h1>
          <p class="text-gray-600 mt-2">관리자 전용 - 전체 사용자 계정을 관리하세요</p>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">사용자 현황</h2>
          <div class="grid md:grid-cols-4 gap-4">
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-blue-600">156</div>
              <div class="text-sm text-gray-600">전체 사용자</div>
            </div>
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-green-600">89</div>
              <div class="text-sm text-gray-600">구직자</div>
            </div>
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-purple-600">42</div>
              <div class="text-sm text-gray-600">기업</div>
            </div>
            <div class="text-center p-4 border rounded">
              <div class="text-2xl font-bold text-orange-600">12</div>
              <div class="text-sm text-gray-600">에이전트</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// 이용약관 페이지
app.get('/terms', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <div class="font-bold text-xl text-gray-900">WOW-CAMPUS</div>
                <div class="text-gray-500 text-sm">서비스 이용약관</div>
              </div>
            </div>
            <a href="/" class="text-blue-600 hover:text-blue-700 font-medium">← 메인페이지로</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">WOW-CAMPUS 서비스 이용약관</h1>
          
          <div class="prose max-w-none">
            <div class="mb-8 p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-2"><strong>시행일:</strong> 2024년 1월 1일</p>
              <p class="text-sm text-gray-600"><strong>최종 수정일:</strong> 2024년 10월 10일</p>
            </div>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                본 약관은 WOW-CAMPUS(이하 "회사")가 제공하는 외국인 구인구직 및 유학 지원 서비스(이하 "서비스")의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제2조 (정의)</h2>
              <div class="space-y-3">
                <div class="pl-4 border-l-4 border-blue-200">
                  <p class="text-gray-700"><strong>1. "서비스"</strong>란 회사가 제공하는 외국인 구인구직 매칭, 유학 지원, 에이전트 연결 등의 모든 서비스를 의미합니다.</p>
                </div>
                <div class="pl-4 border-l-4 border-blue-200">
                  <p class="text-gray-700"><strong>2. "이용자"</strong>란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.</p>
                </div>
                <div class="pl-4 border-l-4 border-blue-200">
                  <p class="text-gray-700"><strong>3. "회원"</strong>란 회사에 개인정보를 제공하여 회원등록을 한 자로서 회사의 정보를 지속적으로 제공받으며 서비스를 이용할 수 있는 자를 의미합니다.</p>
                </div>
                <div class="pl-4 border-l-4 border-blue-200">
                  <p class="text-gray-700"><strong>4. "구직자"</strong>란 취업을 희망하는 외국인으로 본 서비스에 가입한 회원을 의미합니다.</p>
                </div>
                <div class="pl-4 border-l-4 border-blue-200">
                  <p class="text-gray-700"><strong>5. "기업"</strong>이란 외국인 인재 채용을 희망하는 국내 기업으로 본 서비스에 가입한 회원을 의미합니다.</p>
                </div>
                <div class="pl-4 border-l-4 border-blue-200">
                  <p class="text-gray-700"><strong>6. "에이전트"</strong>란 구직자와 기업 간의 매칭을 중개하는 전문 업체나 개인으로 본 서비스에 가입한 회원을 의미합니다.</p>
                </div>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
              <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">
                  1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 
                     약관이 변경되는 경우 변경된 약관의 적용일자 및 변경사유를 명시하여 현행약관과 함께 
                     서비스의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  3. 회원은 변경된 약관에 동의하지 않을 경우 회원탈퇴를 요청할 수 있으며, 
                     변경된 약관의 효력 발생일 이후에도 서비스를 계속 이용할 경우 약관의 변경사항에 동의한 것으로 간주됩니다.
                </p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제4조 (회원가입 및 계정관리)</h2>
              <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">
                  1. 회원가입은 이용자가 본 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 
                     회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  2. 회원은 자신의 계정정보에 대한 관리책임을 가지며, 타인에게 자신의 계정을 이용하게 해서는 안됩니다.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  3. 회원은 회원가입 시 등록한 정보에 변동이 있을 경우 즉시 수정해야 하며, 
                     수정하지 않아 발생하는 문제의 책임은 회원에게 있습니다.
                </p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제5조 (서비스의 제공)</h2>
              <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">
                  회사는 다음과 같은 서비스를 제공합니다:
                </p>
                <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>외국인 구직자와 국내 기업 간의 매칭 서비스</li>
                  <li>한국 유학 정보 제공 및 지원 서비스</li>
                  <li>에이전트 연결 및 중개 서비스</li>
                  <li>채용 정보 및 구직 정보 게시 서비스</li>
                  <li>온라인 상담 및 문의 서비스</li>
                  <li>기타 회사가 추가로 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
                </ul>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제6조 (개인정보 보호)</h2>
              <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">
                  1. 회사는 이용자의 개인정보 보호를 매우 중요하게 생각하며, 개인정보보호법 등 관련 법령을 준수합니다.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  2. 개인정보의 수집, 이용, 보관, 처리에 관한 자세한 사항은 별도의 
                  <a href="/privacy" class="text-blue-600 hover:text-blue-700 underline">개인정보처리방침</a>에 따릅니다.
                </p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제7조 (이용자의 의무)</h2>
              <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">이용자는 다음 행위를 하여서는 안됩니다:</p>
                <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>신청 또는 변경 시 허위내용의 등록</li>
                  <li>타인의 정보도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                </ul>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제8조 (서비스 이용제한)</h2>
              <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">
                  회사는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우 
                  경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
                </p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제9조 (면책조항)</h2>
              <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">
                  1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 
                     서비스 제공에 관한 책임이 면제됩니다.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  3. 회사는 구직자와 기업, 에이전트 간의 거래에서 발생하는 분쟁에 대해 중재 의무를 지지 않으며, 
                     이로 인한 손해를 배상할 책임을 지지 않습니다.
                </p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제10조 (준거법 및 분쟁해결)</h2>
              <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">
                  1. 본 약관은 대한민국 법령에 의하여 규정되고 이행됩니다.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  2. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 전속관할법원으로 합니다.
                </p>
              </div>
            </section>

            <div class="mt-12 p-6 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">문의하기</h3>
              <p class="text-gray-700 mb-4">
                본 약관에 대한 문의사항이 있으시면 아래 연락처로 문의해주세요.
              </p>
              <div class="space-y-2 text-sm text-gray-600">
                <div><strong>회사명:</strong> WOW-CAMPUS</div>
                <div><strong>이메일:</strong> legal@wow-campus.kr</div>
                <div><strong>전화:</strong> 02-1234-5678</div>
                <div><strong>주소:</strong> 서울특별시 강남구 테헤란로 123</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-gray-900 text-white py-8 mt-16">
        <div class="container mx-auto px-4 text-center">
          <div class="flex items-center justify-center space-x-6 text-sm">
            <a href="/terms" class="text-blue-400 hover:text-blue-300">이용약관</a>
            <a href="/privacy" class="text-gray-400 hover:text-white">개인정보처리방침</a>
            <a href="/cookies" class="text-gray-400 hover:text-white">쿠키 정책</a>
          </div>
          <div class="text-gray-400 text-sm mt-4">
            © 2024 WOW-CAMPUS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
})

// 개인정보처리방침 페이지
app.get('/privacy', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <div class="font-bold text-xl text-gray-900">WOW-CAMPUS</div>
                <div class="text-gray-500 text-sm">개인정보처리방침</div>
              </div>
            </div>
            <a href="/" class="text-blue-600 hover:text-blue-700 font-medium">← 메인페이지로</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">개인정보처리방침</h1>
          
          <div class="prose max-w-none">
            <div class="mb-8 p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-2"><strong>시행일:</strong> 2024년 1월 1일</p>
              <p class="text-sm text-gray-600"><strong>최종 수정일:</strong> 2024년 10월 10일</p>
            </div>

            <div class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 class="text-lg font-semibold text-red-800 mb-2">📋 법적 근거</h3>
              <p class="text-sm text-red-700">
                본 개인정보처리방침은 「개인정보보호법」 제29조, 같은 법 시행령 제30조 제1항, 
                개인정보 안전성확보조치 기준(개인정보보호위원회고시 제2023-6호) 제7조 제1항 및 제4항에 따라 작성되었습니다.
              </p>
            </div>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제1조 개인정보의 수집 및 이용목적</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                WOW-CAMPUS(이하 "회사")는 「개인정보보호법」 제15조, 제17조, 제18조, 제22조, 제23조에 따라 
                다음의 목적을 위하여 개인정보를 처리합니다:
              </p>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="p-4 bg-blue-50 rounded-lg">
                  <h4 class="font-semibold text-blue-900 mb-2">서비스 제공</h4>
                  <ul class="text-sm text-blue-800 space-y-1">
                    <li>• 회원가입 및 회원관리</li>
                    <li>• 구인구직 매칭 서비스 제공</li>
                    <li>• 유학 정보 제공 및 상담</li>
                    <li>• 본인확인 및 인증서비스</li>
                  </ul>
                </div>
                <div class="p-4 bg-green-50 rounded-lg">
                  <h4 class="font-semibold text-green-900 mb-2">고객지원</h4>
                  <ul class="text-sm text-green-800 space-y-1">
                    <li>• 고객상담 및 문의사항 처리</li>
                    <li>• 불만처리 등 민원처리</li>
                    <li>• 고지사항 전달</li>
                    <li>• 분쟁조정을 위한 기록보존</li>
                  </ul>
                </div>
                <div class="p-4 bg-purple-50 rounded-lg">
                  <h4 class="font-semibold text-purple-900 mb-2">마케팅 활용</h4>
                  <ul class="text-sm text-purple-800 space-y-1">
                    <li>• 신규 서비스 개발 및 맞춤서비스 제공</li>
                    <li>• 이벤트 및 광고성 정보 제공</li>
                    <li>• 인구통계학적 특성에 따른 서비스 제공</li>
                    <li>• 서비스의 유효성 확인</li>
                  </ul>
                </div>
                <div class="p-4 bg-orange-50 rounded-lg">
                  <h4 class="font-semibold text-orange-900 mb-2">법령준수</h4>
                  <ul class="text-sm text-orange-800 space-y-1">
                    <li>• 법령 및 약관 위반행위 대응</li>
                    <li>• 서비스 이용기록 보존</li>
                    <li>• 통계작성 및 학술연구</li>
                    <li>• 관련 법령에 따른 의무이행</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제2조 수집하는 개인정보 항목</h2>
              <div class="space-y-6">
                <div class="p-4 border border-blue-300 rounded-lg">
                  <h3 class="font-semibold text-blue-900 mb-3">📋 필수수집항목</h3>
                  <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">회원가입 시</h4>
                      <ul class="text-gray-700 space-y-1">
                        <li>• 성명, 이메일주소, 비밀번호</li>
                        <li>• 휴대폰번호, 생년월일</li>
                        <li>• 국적, 비자상태</li>
                        <li>• 사용자 유형(구직자/기업/에이전트)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">서비스 이용 시</h4>
                      <ul class="text-gray-700 space-y-1">
                        <li>• 은행계좌정보(결제 시)</li>
                        <li>• 신용카드정보(결제 시)</li>
                        <li>• 주소정보(배송 시)</li>
                        <li>• IP주소, 접속로그</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="p-4 border border-green-300 rounded-lg">
                  <h3 class="font-semibold text-green-900 mb-3">✅ 선택수집항목</h3>
                  <div class="text-sm text-gray-700 grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">프로필 정보</h4>
                      <ul class="space-y-1">
                        <li>• 프로필사진</li>
                        <li>• 자기소개</li>
                        <li>• 관심분야</li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">경력정보</h4>
                      <ul class="space-y-1">
                        <li>• 학력사항</li>
                        <li>• 경력사항</li>
                        <li>• 자격증</li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">기타</h4>
                      <ul class="space-y-1">
                        <li>• 포트폴리오</li>
                        <li>• 추천서</li>
                        <li>• 어학점수</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="p-4 border border-yellow-300 rounded-lg">
                  <h3 class="font-semibold text-yellow-900 mb-3">🔍 자동수집항목</h3>
                  <div class="text-sm text-gray-700">
                    <p class="mb-2">서비스 이용과정에서 자동으로 생성되어 수집되는 정보:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4">
                      <li>IP주소, MAC주소, 쿠키(Cookie)</li>
                      <li>방문일시, 서비스 이용기록, 접속로그</li>
                      <li>브라우저 종류 및 OS, 방문 페이지</li>
                      <li>불량 이용기록, 부정이용기록</li>
                      <li>기기정보(모바일 기기의 고유식별정보 등)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제3조 개인정보의 처리 및 보유기간</h2>
              <p class="text-gray-700 leading-relaxed mb-6">
                회사는 「개인정보보호법」 제21조에 따라 개인정보를 수집·이용목적으로 명시한 범위 내에서 
                처리하며, 처리목적이 달성되면 지체없이 개인정보를 파기합니다.
              </p>
              
              <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border border-gray-300 px-4 py-3 text-left">정보구분</th>
                      <th class="border border-gray-300 px-4 py-3 text-left">보유기간</th>
                      <th class="border border-gray-300 px-4 py-3 text-left">관련법령</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm">
                    <tr>
                      <td class="border border-gray-300 px-4 py-3">회원정보</td>
                      <td class="border border-gray-300 px-4 py-3">회원탈퇴 시까지</td>
                      <td class="border border-gray-300 px-4 py-3">개인정보보호법</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-300 px-4 py-3">계약 또는 청약철회 등에 관한 기록</td>
                      <td class="border border-gray-300 px-4 py-3">5년</td>
                      <td class="border border-gray-300 px-4 py-3">전자상거래법</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-3">대금결제 및 재화 등의 공급에 관한 기록</td>
                      <td class="border border-gray-300 px-4 py-3">5년</td>
                      <td class="border border-gray-300 px-4 py-3">전자상거래법</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-300 px-4 py-3">소비자 불만 또는 분쟁처리에 관한 기록</td>
                      <td class="border border-gray-300 px-4 py-3">3년</td>
                      <td class="border border-gray-300 px-4 py-3">전자상거래법</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-3">웹사이트 방문기록</td>
                      <td class="border border-gray-300 px-4 py-3">3개월</td>
                      <td class="border border-gray-300 px-4 py-3">통신비밀보호법</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제4조 개인정보의 안전성 확보조치</h2>
              <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <h3 class="font-semibold text-blue-900 mb-2">🔐 법적 근거</h3>
                <p class="text-sm text-blue-800 mb-2">
                  「개인정보보호법」 제29조, 같은 법 시행령 제30조 제1항, 
                  개인정보 안전성확보조치 기준(개인정보보호위원회고시 제2023-6호) 제7조 제1항·제4항
                </p>
                <p class="text-sm text-blue-800">
                  <strong>암호화 의무:</strong> 정보통신망을 통하여 개인정보 또는 인증정보를 송·수신하는 경우에는 
                  이를 안전한 알고리즘으로 암호화하여야 합니다.
                </p>
              </div>

              <div class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="p-4 border rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                      <span class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
                      암호화 조치
                    </h4>
                    <ul class="text-sm text-gray-700 space-y-2">
                      <li>• <strong>비밀번호:</strong> SHA-256 단방향 암호화</li>
                      <li>• <strong>전송구간:</strong> SSL/TLS 1.3 암호화</li>
                      <li>• <strong>저장구간:</strong> AES-256 암호화</li>
                      <li>• <strong>주요정보:</strong> 개별 암호화 키 적용</li>
                      <li>• <strong>인증정보:</strong> JWT 토큰 암호화</li>
                    </ul>
                  </div>

                  <div class="p-4 border rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                      <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
                      접근통제
                    </h4>
                    <ul class="text-sm text-gray-700 space-y-2">
                      <li>• <strong>접근권한:</strong> 최소권한 원칙 적용</li>
                      <li>• <strong>관리자 계정:</strong> 2단계 인증(2FA)</li>
                      <li>• <strong>접속기록:</strong> 실시간 모니터링</li>
                      <li>• <strong>비인가 접근:</strong> 자동 차단 시스템</li>
                      <li>• <strong>권한변경:</strong> 승인절차 필수</li>
                    </ul>
                  </div>

                  <div class="p-4 border rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                      <span class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-2">3</span>
                      물리적 보안
                    </h4>
                    <ul class="text-sm text-gray-700 space-y-2">
                      <li>• <strong>서버실:</strong> 출입통제 및 CCTV 설치</li>
                      <li>• <strong>보안카드:</strong> 권한자만 출입 가능</li>
                      <li>• <strong>클라우드:</strong> Cloudflare 보안인증</li>
                      <li>• <strong>백업:</strong> 암호화된 원격지 보관</li>
                      <li>• <strong>장비:</strong> 정기점검 및 보안패치</li>
                    </ul>
                  </div>

                  <div class="p-4 border rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                      <span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm mr-2">4</span>
                      기술적 보안
                    </h4>
                    <ul class="text-sm text-gray-700 space-y-2">
                      <li>• <strong>방화벽:</strong> 24시간 침입탐지시스템</li>
                      <li>• <strong>보안패치:</strong> 정기 업데이트 실시</li>
                      <li>• <strong>백신프로그램:</strong> 실시간 악성코드 차단</li>
                      <li>• <strong>로그분석:</strong> 이상행위 모니터링</li>
                      <li>• <strong>취약점점검:</strong> 분기별 보안진단</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제5조 개인정보의 제3자 제공</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                회사는 원칙적으로 정보주체의 개인정보를 수집·이용 목적으로 명시한 범위 내에서 처리하며, 
                다음의 경우에 한하여 개인정보를 제3자에게 제공합니다.
              </p>
              
              <div class="space-y-4">
                <div class="p-4 border-l-4 border-red-400 bg-red-50">
                  <h4 class="font-semibold text-red-900 mb-2">법적 제공 사유 (개인정보보호법 제17조)</h4>
                  <ul class="text-sm text-red-800 space-y-1">
                    <li>1. 정보주체로부터 별도의 동의를 받은 경우</li>
                    <li>2. 법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
                    <li>3. 정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
                  </ul>
                </div>

                <div class="p-4 border border-gray-300 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-2">제3자 제공 현황</h4>
                  <div class="text-sm text-gray-700">
                    <p class="mb-2"><strong>현재 운영 중인 제3자 제공:</strong></p>
                    <div class="bg-gray-100 p-3 rounded">
                      <p class="text-center text-gray-600">제3자 제공 중인 개인정보가 없습니다.</p>
                      <p class="text-center text-xs text-gray-500 mt-1">
                        향후 제3자 제공이 필요한 경우 사전에 동의를 받겠습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제6조 정보주체의 권리·의무 및 행사방법</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                「개인정보보호법」 제35조~제37조에 따라 정보주체는 회사에 대해 언제든지 
                다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              </p>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div class="p-4 bg-blue-50 rounded-lg">
                  <h4 class="font-semibold text-blue-900 mb-3">📋 정보주체의 권리</h4>
                  <ul class="text-sm text-blue-800 space-y-2">
                    <li>• 개인정보 처리현황 통지요구</li>
                    <li>• 개인정보 열람요구</li>
                    <li>• 개인정보 정정·삭제요구</li>
                    <li>• 개인정보 처리정지요구</li>
                    <li>• 손해배상청구</li>
                  </ul>
                </div>

                <div class="p-4 bg-green-50 rounded-lg">
                  <h4 class="font-semibold text-green-900 mb-3">⚡ 권리행사 방법</h4>
                  <ul class="text-sm text-green-800 space-y-2">
                    <li>• <strong>온라인:</strong> 홈페이지 마이페이지</li>
                    <li>• <strong>이메일:</strong> privacy@wow-campus.kr</li>
                    <li>• <strong>전화:</strong> 02-1234-5678</li>
                    <li>• <strong>우편:</strong> 개인정보보호담당부서</li>
                    <li>• <strong>처리기간:</strong> 요청일로부터 10일 이내</li>
                  </ul>
                </div>
              </div>
              
              <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 class="font-semibold text-yellow-900 mb-2">⚠️ 권리행사 제한사유</h4>
                <ul class="text-sm text-yellow-800 space-y-1">
                  <li>• 법령에서 금지하거나 제한하는 경우</li>
                  <li>• 다른 사람의 생명·신체를 해할 우려가 있거나 다른 사람의 재산과 그 밖의 이익을 부당하게 침해할 우려가 있는 경우</li>
                  <li>• 공공기관이 개인정보를 처리하는 경우로서 법령 등에서 금지하거나 제한하는 경우</li>
                </ul>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">제7조 개인정보 자동 수집 장치의 설치·운영 및 거부</h2>
              <div class="space-y-4">
                <div class="p-4 bg-blue-50 rounded-lg">
                  <h4 class="font-semibold text-blue-900 mb-2">🍪 쿠키(Cookie) 운영 방침</h4>
                  <p class="text-sm text-blue-800 mb-2">
                    회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
                  </p>
                  <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 class="font-medium text-blue-900 mb-1">쿠키 설정 거부 방법</h5>
                      <ul class="text-blue-700 space-y-1">
                        <li>• Chrome: 설정 → 개인정보 및 보안 → 쿠키</li>
                        <li>• Firefox: 설정 → 개인 정보 및 보안</li>
                        <li>• Safari: 환경설정 → 개인 정보 보호</li>
                        <li>• Edge: 설정 → 쿠키 및 사이트 권한</li>
                      </ul>
                    </div>
                    <div>
                      <h5 class="font-medium text-blue-900 mb-1">쿠키 거부 시 영향</h5>
                      <ul class="text-blue-700 space-y-1">
                        <li>• 로그인 상태 유지 불가</li>
                        <li>• 맞춤형 서비스 이용 제한</li>
                        <li>• 일부 기능 이용 불가</li>
                        <li>• 개인화 설정 저장 불가</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">제8조 개인정보보호책임자 및 담당부서</h2>
                <p class="text-gray-700 leading-relaxed mb-4">
                  「개인정보보호법」 제31조에 따라 개인정보의 처리에 관한 업무를 총괄해서 책임지고, 
                  개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.
                </p>
                
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="p-6 border border-blue-300 rounded-lg bg-blue-50">
                    <h4 class="font-semibold text-blue-900 mb-4 flex items-center">
                      <i class="fas fa-user-shield mr-2"></i>
                      개인정보보호책임자
                    </h4>
                    <div class="space-y-2 text-sm">
                      <div><strong>성명:</strong> 김개인정보</div>
                      <div><strong>직책:</strong> 개인정보보호책임자</div>
                      <div><strong>연락처:</strong> 02-1234-5678</div>
                      <div><strong>이메일:</strong> privacy@wow-campus.kr</div>
                      <div><strong>팩스:</strong> 02-1234-5679</div>
                    </div>
                  </div>

                  <div class="p-6 border border-green-300 rounded-lg bg-green-50">
                    <h4 class="font-semibold text-green-900 mb-4 flex items-center">
                      <i class="fas fa-users mr-2"></i>
                      개인정보보호 담당부서
                    </h4>
                    <div class="space-y-2 text-sm">
                      <div><strong>부서명:</strong> 개인정보보호팀</div>
                      <div><strong>담당자:</strong> 박담당자</div>
                      <div><strong>연락처:</strong> 02-1234-5680</div>
                      <div><strong>이메일:</strong> privacy-team@wow-campus.kr</div>
                      <div><strong>주소:</strong> 서울특별시 강남구 테헤란로 123</div>
                    </div>
                  </div>
                </div>

                <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p class="text-sm text-gray-700">
                    <strong>📞 개인정보 침해신고센터:</strong> (privacy.go.kr / 국번없이 182)<br/>
                    <strong>📞 대검찰청 사이버수사과:</strong> (spo.go.kr / 국번없이 1301)<br/>
                    <strong>📞 경찰청 사이버안전국:</strong> (cyberbureau.police.go.kr / 국번없이 182)
                  </p>
                </div>
              </section>

              <section class="mb-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">제9조 개인정보 처리방침의 변경</h2>
                <div class="space-y-4">
                  <div class="p-4 border-l-4 border-blue-400 bg-blue-50">
                    <h4 class="font-semibold text-blue-900 mb-2">방침 변경 고지</h4>
                    <p class="text-sm text-blue-800">
                      이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                      변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                    </p>
                  </div>

                  <div class="p-4 border border-gray-300 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-2">📅 개정이력</h4>
                    <div class="text-sm text-gray-700">
                      <table class="w-full border-collapse border border-gray-300 mt-2">
                        <thead class="bg-gray-100">
                          <tr>
                            <th class="border border-gray-300 px-3 py-2 text-left">버전</th>
                            <th class="border border-gray-300 px-3 py-2 text-left">시행일자</th>
                            <th class="border border-gray-300 px-3 py-2 text-left">변경사항</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="border border-gray-300 px-3 py-2">v1.0</td>
                            <td class="border border-gray-300 px-3 py-2">2024.01.01</td>
                            <td class="border border-gray-300 px-3 py-2">최초 제정</td>
                          </tr>
                          <tr class="bg-gray-50">
                            <td class="border border-gray-300 px-3 py-2">v2.0</td>
                            <td class="border border-gray-300 px-3 py-2">2024.10.10</td>
                            <td class="border border-gray-300 px-3 py-2">개인정보보호법 제29조 준수 및 암호화 조치 강화</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              <div class="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <i class="fas fa-shield-alt text-white text-xl"></i>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-blue-900 mb-3">개인정보보호 문의 및 신고</h3>
                    <p class="text-sm text-blue-800 mb-4">
                      개인정보 처리와 관련한 문의사항이나 개인정보 침해신고, 권리행사 등이 필요하시면 언제든지 연락해 주세요.
                    </p>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                      <div class="space-y-2 text-sm">
                        <div class="flex items-center space-x-2">
                          <i class="fas fa-envelope text-blue-600"></i>
                          <span><strong>이메일:</strong> privacy@wow-campus.kr</span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <i class="fas fa-phone text-blue-600"></i>
                          <span><strong>전화:</strong> 02-1234-5678 (평일 09:00~18:00)</span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <i class="fas fa-fax text-blue-600"></i>
                          <span><strong>팩스:</strong> 02-1234-5679</span>
                        </div>
                      </div>
                      <div class="space-y-2 text-sm">
                        <div class="flex items-center space-x-2">
                          <i class="fas fa-map-marker-alt text-blue-600"></i>
                          <span><strong>주소:</strong> 서울특별시 강남구 테헤란로 123</span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <i class="fas fa-clock text-blue-600"></i>
                          <span><strong>처리시간:</strong> 요청일로부터 10일 이내 처리</span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <i class="fas fa-calendar text-blue-600"></i>
                          <span><strong>최종수정일:</strong> 2024년 10월 10일</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

      {/* Footer */}
      <footer class="bg-gray-900 text-white py-8 mt-16">
        <div class="container mx-auto px-4 text-center">
          <div class="flex items-center justify-center space-x-6 text-sm">
            <a href="/terms" class="text-gray-400 hover:text-white">이용약관</a>
            <a href="/privacy" class="text-blue-400 hover:text-blue-300">개인정보처리방침</a>
            <a href="/cookies" class="text-gray-400 hover:text-white">쿠키 정책</a>
          </div>
          <div class="text-gray-400 text-sm mt-4">
            © 2024 WOW-CAMPUS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
})

// 쿠키 정책 페이지
app.get('/cookies', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <div class="font-bold text-xl text-gray-900">WOW-CAMPUS</div>
                <div class="text-gray-500 text-sm">쿠키 정책</div>
              </div>
            </div>
            <a href="/" class="text-blue-600 hover:text-blue-700 font-medium">← 메인페이지로</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">쿠키 정책</h1>
          
          <div class="prose max-w-none">
            <div class="mb-8 p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-2"><strong>시행일:</strong> 2024년 1월 1일</p>
              <p class="text-sm text-gray-600"><strong>최종 수정일:</strong> 2024년 10월 10일</p>
            </div>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">쿠키란 무엇인가요?</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                쿠키는 웹사이트를 방문할 때 브라우저에 저장되는 작은 텍스트 파일입니다. 
                쿠키를 통해 웹사이트는 사용자의 행동을 기억하고, 더 나은 사용자 경험을 제공할 수 있습니다.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">우리가 사용하는 쿠키의 종류</h2>
              
              <div class="space-y-6">
                <div class="p-4 border rounded-lg">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">1. 필수 쿠키</h3>
                  <p class="text-gray-700 mb-2">웹사이트 기본 기능에 꼭 필요한 쿠키입니다.</p>
                  <ul class="list-disc list-inside text-sm text-gray-600 ml-4">
                    <li>로그인 상태 유지</li>
                    <li>장바구니 내용 보관</li>
                    <li>보안 및 사이트 기능</li>
                  </ul>
                </div>

                <div class="p-4 border rounded-lg">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">2. 성능 쿠키</h3>
                  <p class="text-gray-700 mb-2">웹사이트 사용 방식을 분석하여 성능을 개선하는 데 사용됩니다.</p>
                  <ul class="list-disc list-inside text-sm text-gray-600 ml-4">
                    <li>Google Analytics</li>
                    <li>페이지 방문 통계</li>
                    <li>사용자 행동 분석</li>
                  </ul>
                </div>

                <div class="p-4 border rounded-lg">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">3. 기능 쿠키</h3>
                  <p class="text-gray-700 mb-2">사용자 맞춤 기능을 제공하기 위해 사용됩니다.</p>
                  <ul class="list-disc list-inside text-sm text-gray-600 ml-4">
                    <li>언어 설정 기억</li>
                    <li>지역 설정 기억</li>
                    <li>사용자 선호도 저장</li>
                  </ul>
                </div>

                <div class="p-4 border rounded-lg">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">4. 마케팅 쿠키</h3>
                  <p class="text-gray-700 mb-2">개인화된 광고를 제공하기 위해 사용됩니다.</p>
                  <ul class="list-disc list-inside text-sm text-gray-600 ml-4">
                    <li>맞춤형 광고</li>
                    <li>광고 효과 측정</li>
                    <li>소셜 미디어 연동</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">쿠키 관리 방법</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                대부분의 웹 브라우저는 쿠키 설정을 관리할 수 있는 기능을 제공합니다:
              </p>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-2">Chrome</h4>
                  <p class="text-sm text-gray-600">설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-2">Firefox</h4>
                  <p class="text-sm text-gray-600">설정 → 개인 정보 및 보안 → 쿠키 및 사이트 데이터</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-2">Safari</h4>
                  <p class="text-sm text-gray-600">환경설정 → 개인 정보 보호 → 쿠키 차단</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-2">Edge</h4>
                  <p class="text-sm text-gray-600">설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터</p>
                </div>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">쿠키 차단 시 영향</h2>
              <div class="bg-yellow-50 p-4 rounded-lg">
                <p class="text-gray-700 mb-2">
                  <strong>⚠️ 주의:</strong> 필수 쿠키를 차단하면 다음과 같은 문제가 발생할 수 있습니다:
                </p>
                <ul class="list-disc list-inside text-sm text-gray-600 ml-4">
                  <li>로그인 상태가 유지되지 않음</li>
                  <li>일부 기능이 정상적으로 작동하지 않음</li>
                  <li>사용자 설정이 저장되지 않음</li>
                  <li>개인화된 서비스 이용 불가</li>
                </ul>
              </div>
            </section>

            <div class="mt-12 p-6 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">문의하기</h3>
              <p class="text-gray-700 mb-4">
                쿠키 정책에 대한 문의사항이 있으시면 아래 연락처로 문의해주세요.
              </p>
              <div class="space-y-2 text-sm text-gray-600">
                <div><strong>이메일:</strong> privacy@wow-campus.kr</div>
                <div><strong>전화:</strong> 02-1234-5678</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-gray-900 text-white py-8 mt-16">
        <div class="container mx-auto px-4 text-center">
          <div class="flex items-center justify-center space-x-6 text-sm">
            <a href="/terms" class="text-gray-400 hover:text-white">이용약관</a>
            <a href="/privacy" class="text-gray-400 hover:text-white">개인정보처리방침</a>
            <a href="/cookies" class="text-blue-400 hover:text-blue-300">쿠키 정책</a>
          </div>
          <div class="text-gray-400 text-sm mt-4">
            © 2024 WOW-CAMPUS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
})

// 권한 거부 페이지
app.get('/access-denied', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-lock text-2xl text-red-600"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
        <p class="text-gray-600 mb-6">
          이 페이지에 접근하기 위해서는 로그인이 필요하거나 충분한 권한이 필요합니다.
        </p>
        <div class="space-y-3">
          <a href="/" class="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            메인페이지로 돌아가기
          </a>
          <button onclick="showLoginModal()" class="block w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
            로그인하기
          </button>
        </div>
      </div>
    </div>
  )
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Not Found'
  }, 404)
})

export default app
