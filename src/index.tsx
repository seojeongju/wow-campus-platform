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
import agentsRoutes from './routes/agents'
import adminRoutes from './routes/admin'
import contactRoutes from './routes/contact'
import { matching } from './routes/matching'

// Import middleware
import { corsMiddleware, apiCors } from './middleware/cors'
import { optionalAuth, requireAdmin, authMiddleware } from './middleware/auth'
import { checkPageAccess, requireAdminPage } from './middleware/permissions'

// Import auth utilities
import { createJWT } from './utils/auth'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Global error handler - MUST be defined before routes
app.onError((err, c) => {
  console.error('Global error handler caught:', err);
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
          jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-tachometer-alt', name: '내 대시보드 - 지원현황 및 통계' },
          company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building', name: '기업 대시보드 - 채용관리' },
          agent: { link: '/agents', color: 'blue', icon: 'fa-handshake', name: '에이전트 대시보드 - 매칭관리' },
          admin: { link: '/dashboard/admin', color: 'red', icon: 'fa-chart-line', name: '관리자 대시보드 - 시스템 관리' }
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
        
        authButtons.innerHTML = \`
          <div class="flex items-center space-x-2 \${userColors.bg} \${userColors.border} px-3 py-2 rounded-lg">
            <i class="fas fa-user \${userColors.icon}"></i>
            <span class="\${userColors.text} font-medium">\${user.name}님</span>
            <span class="text-xs \${userColors.text} opacity-75">(\${getUserTypeLabel(user.user_type)})</span>
          </div>
          <a href="\${config.link}" class="px-4 py-2 bg-\${config.color}-600 text-white rounded-lg hover:bg-\${config.color}-700 transition-colors font-medium" title="\${config.name}">
            <i class="fas \${config.icon} mr-1"></i>내 대시보드
          </a>
          <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium" title="로그아웃">
            <i class="fas fa-sign-out-alt mr-1"></i>로그아웃
          </button>
        \`;
        
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
              <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이메일을 입력하세요">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 입력하세요">
            </div>
            
            <div class="flex space-x-3">
              <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                취소
              </button>
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                로그인
              </button>
            </div>
            
            <!-- 아이디/비밀번호 찾기 링크 -->
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
    
    // 📝 회원가입 모달 표시 - "지금 시작하기" 스타일 사용자 유형 선택 플로우
    function showSignupModal() {
      console.log('회원가입 모달 호출됨 - 스마트 온보딩 플로우 시작');
      
      // "지금 시작하기"와 동일한 사용자 유형 선택 플로우 사용
      startOnboarding();
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
              <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="가입 시 사용한 이름을 입력하세요">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
              <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="가입 시 사용한 연락처를 입력하세요">
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
              <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="가입 시 사용한 이메일을 입력하세요">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="가입 시 사용한 이름을 입력하세요">
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
        { href: '/matching', label: '매칭 시스템', icon: 'fas fa-magic' }
      ],
      jobseeker: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/dashboard/jobseeker', label: '내 대시보드', icon: 'fas fa-tachometer-alt' },
        { href: '/jobs', label: '구인정보 찾기', icon: 'fas fa-briefcase' },
        { href: '/matching', label: 'AI 매칭', icon: 'fas fa-magic' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' }
      ],
      company: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '인재검색', icon: 'fas fa-users' },
        { href: '/matching', label: 'AI 인재추천', icon: 'fas fa-magic' },
        { href: '/dashboard/company', label: '채용관리', icon: 'fas fa-building' }
      ],
      agent: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' },
        { href: '/agents', label: '에이전트', icon: 'fas fa-handshake' },
        { href: '/matching', label: 'AI 매칭', icon: 'fas fa-magic' }
      ],
      admin: [
        { href: '/', label: '홈', icon: 'fas fa-home' },
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' },
        { href: '/agents', label: '에이전트', icon: 'fas fa-handshake' },
        { href: '/matching', label: '매칭 관리', icon: 'fas fa-magic' },
        { href: '/statistics', label: '통계 대시보드', icon: 'fas fa-chart-line' },
        { href: '/admin', label: '시스템 관리', icon: 'fas fa-cog' }
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
        { href: '/dashboard/jobseeker', label: '내 대시보드', icon: 'fas fa-tachometer-alt' },
        { href: '/jobs', label: '구인정보 찾기', icon: 'fas fa-briefcase' },
        { href: '/matching', label: 'AI 매칭', icon: 'fas fa-magic' }
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
        
        return \`
          <a href="\${menu.href}" class="\${activeClass}">
            <i class="\${menu.icon} mr-1"></i>\${menu.label}
          </a>
        \`;
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
      
      // URL 파라미터 체크 - 로그인/회원가입 요청 처리
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      if (action === 'login') {
        console.log('URL에서 로그인 요청 감지');
        setTimeout(() => showLoginModal(), 500);
      } else if (action === 'signup') {
        console.log('URL에서 회원가입 요청 감지');
        setTimeout(() => showSignupModal(), 500);
      }
      
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
      
      // 로그인 체크
      const token = localStorage.getItem('wowcampus_token');
      if (!token) {
        console.log('로그인 토큰 없음 - 로그인 요구 메시지 표시');
        listContainer.innerHTML = \`
          <div class="text-center py-12">
            <div class="max-w-md mx-auto">
              <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-lock text-yellow-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h3>
              <p class="text-gray-600 mb-6">
                구직자 정보를 확인하려면 먼저 로그인해주세요.<br/>
                회원이 아니시라면 무료로 회원가입하실 수 있습니다.
              </p>
              <div class="space-y-3">
                <button onclick="showLoginModal()" class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <i class="fas fa-sign-in-alt mr-2"></i>로그인하기
                </button>
                <button onclick="showSignupModal()" class="w-full px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                  <i class="fas fa-user-plus mr-2"></i>회원가입하기
                </button>
              </div>
            </div>
          </div>
        \`;
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
            'Authorization': \`Bearer \${token}\`
          }
        });
        
        const data = await response.json();
        console.log('구직자 목록 API 응답:', data);
        
        // 401 Unauthorized - 로그인 필요
        if (response.status === 401) {
          console.log('인증 실패 - 로그인 필요');
          listContainer.innerHTML = \`
            <div class="text-center py-12">
              <div class="max-w-md mx-auto">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i class="fas fa-exclamation-circle text-red-600 text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">인증이 만료되었습니다</h3>
                <p class="text-gray-600 mb-6">
                  다시 로그인해주세요.
                </p>
                <button onclick="localStorage.removeItem('wowcampus_token'); localStorage.removeItem('wowcampus_user'); showLoginModal();" 
                        class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <i class="fas fa-sign-in-alt mr-2"></i>다시 로그인하기
                </button>
              </div>
            </div>
          \`;
          return;
        }
        
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
          
          // 구직자 목록 생성
          const jobseekersHtml = jobseekers.map(jobseeker => {
            const flagIcon = getFlagIcon(jobseeker.nationality);
            const visaStatus = getVisaStatusBadge(jobseeker.visa_status);
            const koreanLevel = getKoreanLevelBadge(jobseeker.korean_level);
            
            return \`
              <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="showJobSeekerDetail(\${jobseeker.id})">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">\${jobseeker.name}</h3>
                      <div class="flex items-center space-x-2 text-sm text-gray-600">
                        <span class="flex items-center">
                          \${flagIcon}
                          <span class="ml-1">\${jobseeker.nationality || '정보없음'}</span>
                        </span>
                        <span>•</span>
                        <span>\${jobseeker.experience || '경력정보없음'}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col space-y-2">
                    \${visaStatus}
                    \${koreanLevel}
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="text-sm text-gray-600 mb-2">
                    <strong>전공/분야:</strong> \${jobseeker.major || jobseeker.field || '정보없음'}
                  </div>
                  \${jobseeker.skills ? \`
                    <div class="flex flex-wrap gap-1 mb-2">
                      \${jobseeker.skills.split(',').slice(0, 4).map(skill => 
                        \`<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">\${skill.trim()}</span>\`
                      ).join('')}
                    </div>
                  \` : ''}
                  \${jobseeker.introduction ? \`
                    <p class="text-sm text-gray-700 line-clamp-2">\${jobseeker.introduction}</p>
                  \` : ''}
                </div>
                
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center space-x-4">
                    \${jobseeker.location ? \`
                      <span class="flex items-center">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        \${jobseeker.location}
                      </span>
                    \` : ''}
                    \${jobseeker.salary_expectation ? \`
                      <span class="flex items-center">
                        <i class="fas fa-won-sign mr-1"></i>
                        \${jobseeker.salary_expectation}
                      </span>
                    \` : ''}
                  </div>
                  <button class="text-green-600 hover:text-green-800 font-medium" onclick="event.stopPropagation(); showJobSeekerDetail(\${jobseeker.id})">
                    자세히 보기 →
                  </button>
                </div>
              </div>
            \`;
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
    
    // 구직자 상세 보기 함수 - 상세 페이지로 이동
    function showJobSeekerDetail(id) {
      console.log(\`구직자 상세보기: \${id}\`);
      window.location.href = \`/jobseekers/\${id}\`;
    }
    
    // 🚀 스마트 온보딩 플로우 시스템
    
    // 메인 온보딩 시작 함수
    function startOnboarding() {
      console.log('🚀 온보딩 플로우 시작');
      
      // 이미 로그인된 사용자인지 확인
      const user = getCurrentUser();
      if (user) {
        // 로그인된 사용자는 해당 대시보드로 이동
        const dashboardUrls = {
          jobseeker: '/dashboard/jobseeker',
          company: '/dashboard/company', 
          agent: '/agents',
          admin: '/dashboard/admin'
        };
        const url = dashboardUrls[user.user_type] || '/';
        window.location.href = url;
        return;
      }
      
      // 비로그인 사용자는 사용자 유형 선택부터 시작
      showUserTypeSelection();
    }
    
    // 1단계: 사용자 유형 선택 모달
    function showUserTypeSelection() {
      console.log('1단계: 사용자 유형 선택 표시');
      
      // 기존 모달 제거
      const existingModal = document.querySelector('[id*="Modal"]');
      if (existingModal) existingModal.remove();
      
      const modalId = 'userTypeModal_' + Date.now();
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
      
      modal.innerHTML = \`
        <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in" onclick="closeOnboardingModal('\${modalId}')"></div>
        <div class="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-4xl w-full animate-scale-in relative z-10">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-blue-600 text-2xl"></i>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">어떤 목적으로 방문하셨나요?</h2>
            <p class="text-gray-600">서비스를 맞춤화하기 위해 사용자 유형을 선택해주세요</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="user-type-card border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-200" 
                 onclick="selectUserType('jobseeker')">
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-user-tie text-green-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">구직자</h3>
                <p class="text-gray-600 text-sm mb-4">일자리를 찾고 있는 외국인 구직자</p>
                <ul class="text-gray-600 text-xs space-y-1">
                  <li>• 맞춤 구인정보 추천</li>
                  <li>• AI 매칭 서비스</li>
                  <li>• 이력서 관리</li>
                  <li>• 면접 준비 지원</li>
                </ul>
              </div>
            </div>
            
            <div class="user-type-card border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-purple-500 hover:shadow-lg transition-all duration-200"
                 onclick="selectUserType('company')">
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-building text-purple-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">기업/채용담당자</h3>
                <p class="text-gray-600 text-sm mb-4">외국인 인재를 채용하려는 기업</p>
                <ul class="text-gray-600 text-xs space-y-1">
                  <li>• 구인공고 등록</li>
                  <li>• AI 인재 추천</li>
                  <li>• 지원자 관리</li>
                  <li>• 채용 현황 분석</li>
                </ul>
              </div>
            </div>
            
            <div class="user-type-card border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                 onclick="selectUserType('agent')">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-handshake text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">에이전트</h3>
                <p class="text-gray-600 text-sm mb-4">구인구직 중개 전문가</p>
                <ul class="text-gray-600 text-xs space-y-1">
                  <li>• 클라이언트 관리</li>
                  <li>• 매칭 중개 서비스</li>
                  <li>• 수수료 관리</li>
                  <li>• 성과 분석</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="text-center">
            <button onclick="closeOnboardingModal('\${modalId}')" 
                    class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mr-4">
              나중에 하기
            </button>
            <p class="text-xs text-gray-500 mt-4">언제든지 프로필에서 변경할 수 있습니다</p>
          </div>
        </div>
      \`;
      
      document.body.appendChild(modal);
      
      // 애니메이션을 위한 스타일 추가
      if (!document.querySelector('#onboarding-styles')) {
        const style = document.createElement('style');
        style.id = 'onboarding-styles';
        style.textContent = \`
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          .animate-scale-in { animation: scaleIn 0.3s ease-out; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          .user-type-card:hover { transform: translateY(-4px); }
        \`;
        document.head.appendChild(style);
      }
    }
    
    // 사용자 유형 선택 처리
    function selectUserType(userType) {
      console.log('선택된 사용자 유형:', userType);
      
      // 선택된 카드 하이라이트
      document.querySelectorAll('.user-type-card').forEach(card => {
        card.classList.remove('border-green-500', 'border-purple-500', 'border-blue-500', 'bg-blue-50');
      });
      
      const selectedCard = event.currentTarget;
      const colors = {
        jobseeker: 'border-green-500 bg-green-50',
        company: 'border-purple-500 bg-purple-50', 
        agent: 'border-blue-500 bg-blue-50'
      };
      
      selectedCard.className = selectedCard.className.replace(/border-\\w+-\\d+/g, '') + ' ' + colors[userType];
      
      // 1초 후 다음 단계로
      setTimeout(() => {
        closeOnboardingModal();
        showSignupForm(userType);
      }, 800);
    }
    
    // 2단계: 맞춤형 회원가입 폼 표시
    function showSignupForm(userType) {
      console.log('2단계: 회원가입 폼 표시 - 유형:', userType);
      
      const userTypeLabels = {
        jobseeker: '구직자',
        company: '기업 담당자',
        agent: '에이전트'
      };
      
      const userTypeColors = {
        jobseeker: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', button: 'bg-green-600 hover:bg-green-700' },
        company: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500', button: 'bg-purple-600 hover:bg-purple-700' },
        agent: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500', button: 'bg-blue-600 hover:bg-blue-700' }
      };
      
      const colors = userTypeColors[userType];
      const label = userTypeLabels[userType];
      
      const modalId = 'signupModal_' + Date.now();
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
      
      modal.innerHTML = \`
        <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in" onclick="closeOnboardingModal('\${modalId}')"></div>
        <div class="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-md w-full animate-scale-in relative z-10 max-h-screen overflow-y-auto">
          <div class="text-center mb-6">
            <div class="inline-flex items-center \${colors.bg} \${colors.text} px-4 py-2 rounded-full text-sm font-medium mb-4">
              <i class="fas fa-user mr-2"></i>\${label} 회원가입
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">환영합니다!</h2>
            <p class="text-gray-600 text-sm">기본 정보를 입력해주세요</p>
          </div>
          
          <form id="onboarding-signup-form" onsubmit="handleOnboardingSignup(event, '\${userType}')">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input type="email" name="email" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="이메일을 입력하세요">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input type="password" name="password" required minlength="6"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="6자 이상 입력하세요">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                <input type="password" name="confirmPassword" required minlength="6"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="비밀번호를 다시 입력하세요">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input type="text" name="name" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="실명을 입력하세요">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input type="tel" name="phone" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="010-1234-5678">
              </div>
              
              \${userType !== 'agent' ? \`
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  담당 에이전트 (선택사항)
                </label>
                <select name="agent_id" id="agent-select-\${userType}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">에이전트 없음</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">에이전트가 구직/채용 활동을 도와드립니다</p>
              </div>
              \` : ''}
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  \${userType === 'agent' ? '주요 활동 지역' : '거주지역'}
                </label>
                <select name="location" required 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  \${userType === 'agent' ? \`
                    <option value="">지역을 선택하세요</option>
                    <option value="vietnam">🇻🇳 베트남</option>
                    <option value="thailand">🇹🇭 태국</option>
                    <option value="philippines">🇵🇭 필리핀</option>
                    <option value="uzbekistan">🇺🇿 우즈베키스탄</option>
                    <option value="mongolia">🇲🇳 몽골</option>
                    <option value="nepal">🇳🇵 네팔</option>
                    <option value="myanmar">🇲🇲 미얀마</option>
                    <option value="cambodia">🇰🇭 캄보디아</option>
                    <option value="indonesia">🇮🇩 인도네시아</option>
                    <option value="bangladesh">🇧🇩 방글라데시</option>
                    <option value="sri_lanka">🇱🇰 스리랑카</option>
                    <option value="other">🌏 기타</option>
                  \` : \`
                    <option value="">지역을 선택하세요</option>
                    <option value="서울">서울특별시</option>
                    <option value="경기">경기도</option>
                    <option value="인천">인천광역시</option>
                    <option value="부산">부산광역시</option>
                    <option value="대구">대구광역시</option>
                    <option value="광주">광주광역시</option>
                    <option value="대전">대전광역시</option>
                    <option value="울산">울산광역시</option>
                    <option value="강원">강원도</option>
                    <option value="충북">충청북도</option>
                    <option value="충남">충청남도</option>
                    <option value="전북">전라북도</option>
                    <option value="전남">전라남도</option>
                    <option value="경북">경상북도</option>
                    <option value="경남">경상남도</option>
                    <option value="제주">제주특별자치도</option>
                  \`}
                </select>
              </div>
            </div>
            
            <div class="mt-6">
              <button type="submit" 
                      class="w-full \${colors.button} text-white py-3 rounded-lg font-semibold transition-colors">
                <i class="fas fa-user-plus mr-2"></i>계정 생성하기
              </button>
            </div>
            
            <div class="mt-4 text-center">
              <button type="button" onclick="closeOnboardingModal('\${modalId}')" 
                      class="text-gray-600 hover:text-gray-800 text-sm">
                나중에 가입하기
              </button>
            </div>
          </form>
        </div>
      \`;
      
      document.body.appendChild(modal);
      
      // 에이전트가 아닌 경우, 에이전트 목록 로드
      if (userType !== 'agent') {
        loadAvailableAgents(userType);
      }
    }
    
    // 사용 가능한 에이전트 목록 로드
    async function loadAvailableAgents(userType) {
      try {
        console.log('에이전트 목록 로드 시작...');
        const response = await fetch('/api/public/agents');
        console.log('응답 상태:', response.status);
        
        if (!response.ok) {
          console.error('에이전트 목록 로드 실패:', response.status);
          return;
        }
        
        const result = await response.json();
        console.log('에이전트 목록:', result);
        
        if (result.success && result.agents && result.agents.length > 0) {
          const select = document.getElementById(\`agent-select-\${userType}\`);
          console.log('Select 요소:', select);
          
          if (select) {
            result.agents.forEach(agent => {
              const option = document.createElement('option');
              option.value = agent.id;
              const regions = Array.isArray(agent.primary_regions) ? agent.primary_regions.join(', ') : '';
              option.textContent = \`\${agent.agency_name || agent.user_name}\${regions ? ' - ' + regions : ''}\`;
              select.appendChild(option);
            });
            console.log(\`\${result.agents.length}개의 에이전트 옵션 추가됨\`);
          } else {
            console.error('Select 요소를 찾을 수 없음');
          }
        } else {
          console.warn('에이전트 목록이 비어있음');
        }
      } catch (error) {
        console.error('에이전트 목록 로드 오류:', error);
      }
    }
    
    // 온보딩 회원가입 처리
    async function handleOnboardingSignup(event, userType) {
      event.preventDefault();
      console.log('온보딩 회원가입 처리:', userType);
      
      const form = event.target;
      const formData = new FormData(form);
      const userData = {
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        user_type: userType,
        name: formData.get('name'),
        phone: formData.get('phone'),
        location: formData.get('location')
      };
      
      // 에이전트 선택 (선택사항)
      const agentId = formData.get('agent_id');
      if (agentId) {
        userData.agent_id = parseInt(agentId);
      }
      
      // 비밀번호 확인
      if (userData.password !== userData.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      try {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>가입 중...';
        submitButton.disabled = true;
        
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log('회원가입 성공:', data);
          
          // 🎫 자동 로그인: JWT 토큰 저장
          if (data.token) {
            localStorage.setItem('wowcampus_token', data.token);
            console.log('🔐 자동 로그인 완료 - 토큰 저장됨');
            
            // 전역 사용자 상태 업데이트
            window.currentUser = data.user;
            
            // UI 상태 업데이트 (로그인 상태로 변경)
            updateAuthUI();
            updateNavigationMenu();
          }
          
          closeOnboardingModal();
          
          // 3단계: 온보딩 완료 및 다음 단계 안내
          showOnboardingComplete(userType, data.user);
        } else {
          alert(data.message || '회원가입 중 오류가 발생했습니다.');
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;
        }
      } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
        
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-user-plus mr-2"></i>계정 생성하기';
        submitButton.disabled = false;
      }
    }
    
    // 3단계: 온보딩 완료 및 다음 단계 안내
    function showOnboardingComplete(userType, user) {
      console.log('3단계: 온보딩 완료 표시');
      
      const userTypeInfo = {
        jobseeker: {
          title: '구직자 계정이 생성되었습니다!',
          description: '이제 맞춤형 구인정보를 받아보실 수 있습니다.',
          nextSteps: [
            { icon: 'fa-user-edit', text: '프로필 작성하기', action: 'goToProfile' },
            { icon: 'fa-search', text: '구인공고 찾아보기', action: 'goToJobs' },
            { icon: 'fa-magic', text: 'AI 매칭 시작하기', action: 'goToMatching' }
          ],
          dashboard: '/dashboard/jobseeker'
        },
        company: {
          title: '기업 계정이 생성되었습니다!', 
          description: '이제 우수한 외국인 인재를 찾아보실 수 있습니다.',
          nextSteps: [
            { icon: 'fa-plus', text: '구인공고 등록하기', action: 'goToJobPost' },
            { icon: 'fa-users', text: '인재 검색하기', action: 'goToJobseekers' },
            { icon: 'fa-chart-line', text: '채용 현황 보기', action: 'goToDashboard' }
          ],
          dashboard: '/dashboard/company'
        },
        agent: {
          title: '에이전트 계정이 생성되었습니다!',
          description: '이제 구인구직 중개 서비스를 시작하실 수 있습니다.',
          nextSteps: [
            { icon: 'fa-handshake', text: '클라이언트 관리', action: 'goToAgents' },
            { icon: 'fa-magic', text: '매칭 서비스', action: 'goToMatching' },
            { icon: 'fa-chart-bar', text: '성과 분석', action: 'goToDashboard' }
          ],
          dashboard: '/agents'
        }
      };
      
      const info = userTypeInfo[userType];
      
      const modalId = 'completeModal_' + Date.now();
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
      
      modal.innerHTML = \`
        <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in"></div>
        <div class="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full animate-scale-in relative z-10">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-check text-green-600 text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">\${info.title}</h2>
            <p class="text-gray-600">\${info.description}</p>
          </div>
          
          <div class="space-y-3 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">다음 단계를 진행해보세요:</h3>
            \${info.nextSteps.map(step => \`
              <button onclick="\${step.action}()" 
                      class="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <i class="fas \${step.icon} text-blue-600"></i>
                </div>
                <span class="font-medium text-gray-900">\${step.text}</span>
                <i class="fas fa-arrow-right ml-auto text-gray-400"></i>
              </button>
            \`).join('')}
          </div>
          
          <div class="text-center">
            <button onclick="goToDashboard('\${info.dashboard}')" 
                    class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3">
              <i class="fas fa-tachometer-alt mr-2"></i>대시보드로 이동
            </button>
            <button onclick="closeOnboardingModal('\${modalId}')" 
                    class="text-gray-600 hover:text-gray-800 text-sm">
              나중에 둘러보기
            </button>
          </div>
        </div>
      \`;
      
      document.body.appendChild(modal);
    }
    
    // 온보딩 모달 닫기
    function closeOnboardingModal(modalId = null) {
      if (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
      } else {
        document.querySelectorAll('[id*="Modal"]').forEach(modal => modal.remove());
      }
    }
    
    // 온보딩 완료 후 액션 함수들
    function goToProfile() { window.location.href = '/profile'; }
    function goToJobs() { window.location.href = '/jobs'; }
    function goToJobseekers() { window.location.href = '/jobseekers'; }
    function goToMatching() { window.location.href = '/matching'; }
    function goToJobPost() { window.location.href = '/jobs/create'; }
    function goToAgents() { window.location.href = '/agents'; }
    function goToDashboard(url = null) { 
      if (url) {
        window.location.href = url;
      } else {
        const user = getCurrentUser();
        if (user) {
          const dashboards = {
            jobseeker: '/dashboard/jobseeker',
            company: '/dashboard/company',
            agent: '/agents',
            admin: '/dashboard/admin'
          };
          window.location.href = dashboards[user.user_type] || '/';
        } else {
          window.location.href = '/';
        }
      }
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
        const response = await fetch('/api/profile/jobseeker', {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log('프로필 로드 응답:', data);
        
        if (data.success) {
          fillProfileForm(data.data);
          updateProfileCompletion(data.data);
        } else {
          console.error('프로필 로드 실패:', data.message);
        }
        
      } catch (error) {
        console.error('프로필 로드 오류:', error);
      }
    }
    
    // 프로필 폼 채우기
    function fillProfileForm(profileData) {
      console.log('프로필 폼 채우기:', profileData);
      
      const fields = [
        'first_name', 'last_name', 'nationality', 'birth_date', 'gender', 
        'phone', 'address', 'education_level', 'school_name', 'major', 
        'graduation_date', 'gpa', 'work_experience', 'company_name', 
        'position', 'work_period', 'job_description', 'skills',
        'visa_type', 'visa_expiry', 'korean_level', 'english_level', 
        'other_languages', 'portfolio_url', 'github_url', 'linkedin_url'
      ];
      
      fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && profileData[field]) {
          element.value = profileData[field];
        }
      });
      
      // 프로필 사이드바 업데이트
      updateProfileSidebar(profileData);
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
    
    // 프로필 저장
    async function saveProfile() {
      console.log('=== 프로필 저장 시작 ===');
      
      const user = getCurrentUser();
      console.log('현재 사용자:', user);
      
      if (!user) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      const token = localStorage.getItem('wowcampus_token');
      console.log('토큰 존재 여부:', !!token);
      console.log('토큰 앞 20자:', token ? token.substring(0, 20) + '...' : 'null');
      
      const form = document.getElementById('profile-form');
      const formData = new FormData(form);
      const profileData = {};
      
      // 폼 데이터를 객체로 변환
      for (let [key, value] of formData.entries()) {
        profileData[key] = value;
      }
      
      console.log('전송할 프로필 데이터:', JSON.stringify(profileData, null, 2));
      
      try {
        console.log('API 요청 시작: POST /api/profile/jobseeker');
        
        const response = await fetch('/api/profile/jobseeker', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileData)
        });
        
        console.log('응답 상태:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('프로필 저장 응답:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          showNotification('프로필이 성공적으로 저장되었습니다!', 'success');
          
          // 편집 모드 종료
          const inputs = form.querySelectorAll('input, select, textarea');
          inputs.forEach(input => {
            input.disabled = true;
          });
          
          const button = document.getElementById('edit-profile-btn');
          button.innerHTML = '<i class="fas fa-edit mr-2"></i>편집';
          button.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors';
          
          // 프로필 완성도 업데이트
          updateProfileCompletion(profileData);
          
        } else {
          showNotification(data.message || '프로필 저장에 실패했습니다.', 'error');
        }
        
      } catch (error) {
        console.error('=== 프로필 저장 오류 ===');
        console.error('에러 타입:', error.constructor.name);
        console.error('에러 메시지:', error.message);
        console.error('전체 에러:', error);
        showNotification('프로필 업데이트 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'error');
      }
      
      console.log('=== 프로필 저장 종료 ===');
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
        
        // 현재 페이지가 대시보드인 경우
        if (window.location.pathname === '/dashboard') {
          // 구직자인 경우에만 프로필 로드
          if (user.user_type === 'jobseeker') {
            loadProfile();
          }
          
          // 첫 번째 탭 활성화
          showTab('profile');
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

    // 🏛️ 협약대학교 관련 함수들
    let allUniversities = [];
    let currentFilters = { region: 'all', major: 'all', degree: 'all' };

    // 협약대학교 데이터 로드
    async function loadPartnerUniversities() {
      console.log('협약대학교 데이터 로딩 시작...');
      try {
        showLoadingState();
        const params = new URLSearchParams(currentFilters);
        const response = await fetch(\`/api/partner-universities?\${params}\`);
        const result = await response.json();
        
        console.log('협약대학교 API 응답:', result);
        
        if (result.success) {
          allUniversities = result.universities;
          displayUniversities(result.universities);
          console.log('협약대학교', result.universities.length, '개 로드 완료');
        } else {
          console.error('협약대학교 데이터 로드 실패:', result.message);
          showEmptyState();
        }
      } catch (error) {
        console.error('협약대학교 데이터 로드 오류:', error);
        showEmptyState();
      } finally {
        hideLoadingState();
      }
    }

    // 대학교 리스트 표시
    function displayUniversities(universities) {
      const container = document.getElementById('universitiesContainer');
      const emptyState = document.getElementById('emptyState');
      
      if (!container) return;

      if (universities.length === 0) {
        showEmptyState();
        return;
      }

      emptyState.classList.add('hidden');
      container.innerHTML = universities.map(uni => \`
        <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-white font-bold text-2xl">\${uni.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">\${uni.name}</h3>
                  <p class="text-sm text-gray-600">\${uni.englishName || ''}</p>
                  <div class="flex items-center mt-1">
                    <i class="fas fa-map-marker-alt text-gray-400 text-xs mr-1"></i>
                    <span class="text-xs text-gray-500">\${uni.region}</span>
                    <span class="mx-2 text-gray-300">|</span>
                    <div class="flex items-center">
                      <i class="fas fa-star text-yellow-400 text-xs mr-1"></i>
                      <span class="text-xs text-gray-500">국내 \${uni.ranking}위</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">\${uni.description}</p>
            
            <div class="mb-4">
              <div class="flex flex-wrap gap-1 mb-2">
                \${uni.majors.slice(0, 3).map(major => \`
                  <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">\${major}</span>
                \`).join('')}
                \${uni.majors.length > 3 ? \`<span class="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">+\${uni.majors.length - 3}개</span>\` : ''}
              </div>
              <div class="flex flex-wrap gap-1">
                \${uni.languageCourse ? '<span class="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">어학연수</span>' : ''}
                \${uni.undergraduateCourse ? '<span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">학부과정</span>' : ''}
                \${uni.graduateCourse ? '<span class="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">대학원과정</span>' : ''}
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-users text-gray-400 w-4 mr-2"></i>
                <span>재학생 \${uni.studentCount.toLocaleString()}명 (외국인 \${uni.foreignStudentCount.toLocaleString()}명)</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-won-sign text-gray-400 w-4 mr-2"></i>
                <span>\${uni.tuitionFee}</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-handshake text-gray-400 w-4 mr-2"></i>
                <span>\${uni.partnershipType}</span>
              </div>
            </div>

            <div class="border-t pt-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <button onclick="showUniversityModal(\${uni.id})" 
                          class="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                    상세보기
                  </button>
                  <a href="\${uni.website}" target="_blank" 
                     class="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors inline-flex items-center">
                    홈페이지 <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                  </a>
                </div>
                \${uni.dormitory ? '<i class="fas fa-home text-green-500 text-sm" title="기숙사 제공"></i>' : ''}
              </div>
            </div>
          </div>
        </div>
      \`).join('');
    }

    // 필터링 함수
    async function filterUniversities() {
      const regionFilter = document.getElementById('regionFilter')?.value || 'all';
      const majorFilter = document.getElementById('majorFilter')?.value || 'all';
      const degreeFilter = document.getElementById('degreeFilter')?.value || 'all';

      currentFilters = {
        region: regionFilter,
        major: majorFilter,
        degree: degreeFilter
      };

      showLoadingState();
      await loadPartnerUniversities();
    }

    // 필터 초기화
    function resetFilters() {
      document.getElementById('regionFilter').value = 'all';
      document.getElementById('majorFilter').value = 'all';
      document.getElementById('degreeFilter').value = 'all';
      
      currentFilters = { region: 'all', major: 'all', degree: 'all' };
      filterUniversities();
    }

    // 로딩 상태 표시/숨김
    function showLoadingState() {
      const loading = document.getElementById('loadingState');
      const container = document.getElementById('universitiesContainer');
      const empty = document.getElementById('emptyState');
      
      if (loading) loading.classList.remove('hidden');
      if (container) container.innerHTML = '';
      if (empty) empty.classList.add('hidden');
    }

    function hideLoadingState() {
      const loading = document.getElementById('loadingState');
      if (loading) loading.classList.add('hidden');
    }

    function showEmptyState() {
      const empty = document.getElementById('emptyState');
      const container = document.getElementById('universitiesContainer');
      
      if (container) container.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
    }

    // 대학교 상세보기 모달
    function showUniversityModal(universityId) {
      const uni = allUniversities.find(u => u.id === universityId);
      if (!uni) return;

      const modal = document.createElement('div');
      modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      modal.onclick = (e) => {
        if (e.target === modal) closeUniversityModal();
      };

      modal.innerHTML = \`
        <div class="modal-content bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-xl">\${uni.name.charAt(0)}</span>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">\${uni.name}</h2>
                <p class="text-sm text-gray-600">\${uni.englishName || ''}</p>
              </div>
            </div>
            <button onclick="closeUniversityModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="p-6">
            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">기본 정보</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">설립년도</span>
                    <span class="font-medium">\${uni.establishedYear}년</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">위치</span>
                    <span class="font-medium">\${uni.region}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">국내 순위</span>
                    <span class="font-medium">\${uni.ranking}위</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">총 재학생</span>
                    <span class="font-medium">\${uni.studentCount.toLocaleString()}명</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">외국인 학생</span>
                    <span class="font-medium">\${uni.foreignStudentCount.toLocaleString()}명</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold mb-3">학비 및 비용</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">등록금</span>
                    <span class="font-medium">\${uni.tuitionFee || '문의'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">기숙사비</span>
                    <span class="font-medium">\${uni.dormitoryFee || '문의'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">기숙사</span>
                    <span class="font-medium">\${uni.dormitory ? '제공' : '미제공'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">협력 형태</span>
                    <span class="font-medium">\${uni.partnershipType || '교환학생'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">대학 소개</h3>
              <p class="text-gray-600 leading-relaxed">\${uni.description}</p>
            </div>

            \${uni.features && uni.features.length > 0 ? \`
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">주요 특징</h3>
              <div class="grid md:grid-cols-2 gap-2">
                \${uni.features.map(feature => \`
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-check text-green-500"></i>
                    <span class="text-gray-600">\${feature}</span>
                  </div>
                \`).join('')}
              </div>
            </div>
            \` : ''}

            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">개설 전공</h3>
                <div class="flex flex-wrap gap-2">
                  \${uni.majors && uni.majors.length > 0 ? uni.majors.map(major => \`
                    <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">\${major}</span>
                  \`).join('') : '<span class="text-gray-400 text-sm">정보 없음</span>'}
                </div>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold mb-3">모집 과정</h3>
                <div class="flex flex-wrap gap-2">
                  \${uni.languageCourse ? '<span class="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">어학연수</span>' : ''}
                  \${uni.undergraduateCourse ? '<span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">학부과정</span>' : ''}
                  \${uni.graduateCourse ? '<span class="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">대학원과정</span>' : ''}
                </div>
              </div>
            </div>

            \${uni.scholarships ? \`
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">장학금 정보</h3>
              <div class="p-4 bg-yellow-50 rounded-lg">
                <p class="text-yellow-900">\${uni.scholarships}</p>
              </div>
            </div>
            \` : ''}

            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">지원 요건</h3>
                <div class="space-y-2">
                  \${uni.koreanRequirement ? \`
                    <div class="flex items-start space-x-2">
                      <i class="fas fa-language text-blue-500 mt-1"></i>
                      <div>
                        <span class="text-sm font-medium text-gray-700">한국어: </span>
                        <span class="text-sm text-gray-600">\${uni.koreanRequirement}</span>
                      </div>
                    </div>
                  \` : ''}
                  \${uni.englishRequirement ? \`
                    <div class="flex items-start space-x-2">
                      <i class="fas fa-globe text-green-500 mt-1"></i>
                      <div>
                        <span class="text-sm font-medium text-gray-700">영어: </span>
                        <span class="text-sm text-gray-600">\${uni.englishRequirement}</span>
                      </div>
                    </div>
                  \` : ''}
                  \${uni.admissionRequirement ? \`
                    <div class="flex items-start space-x-2">
                      <i class="fas fa-clipboard-check text-purple-500 mt-1"></i>
                      <div>
                        <span class="text-sm font-medium text-gray-700">기타: </span>
                        <span class="text-sm text-gray-600">\${uni.admissionRequirement}</span>
                      </div>
                    </div>
                  \` : ''}
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-3">지원 서비스</h3>
                <div class="grid grid-cols-2 gap-2">
                  \${uni.dormitory ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">기숙사</span></div>' : ''}
                  \${uni.airportPickup ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">공항 픽업</span></div>' : ''}
                  \${uni.buddyProgram ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">버디 프로그램</span></div>' : ''}
                  \${uni.koreanLanguageSupport ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">한국어 지원</span></div>' : ''}
                  \${uni.careerSupport ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">취업 지원</span></div>' : ''}
                  \${uni.partTimeWork ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">아르바이트</span></div>' : ''}
                </div>
              </div>
            </div>

            \${(uni.springAdmission || uni.fallAdmission) ? \`
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">모집 일정</h3>
              <div class="grid md:grid-cols-2 gap-4">
                \${uni.springAdmission ? \`
                  <div class="p-4 bg-green-50 rounded-lg">
                    <div class="font-medium text-green-900 mb-1">봄 학기 (3월)</div>
                    <div class="text-sm text-green-700">\${uni.springAdmission}</div>
                  </div>
                \` : ''}
                \${uni.fallAdmission ? \`
                  <div class="p-4 bg-orange-50 rounded-lg">
                    <div class="font-medium text-orange-900 mb-1">가을 학기 (9월)</div>
                    <div class="text-sm text-orange-700">\${uni.fallAdmission}</div>
                  </div>
                \` : ''}
              </div>
            </div>
            \` : ''}

            \${(uni.contactEmail || uni.contactPhone || uni.address) ? \`
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-3">연락처 및 위치</h3>
              <div class="space-y-3">
                \${uni.address ? \`
                  <div class="flex items-start space-x-3">
                    <i class="fas fa-map-marker-alt text-gray-400 mt-1"></i>
                    <span class="text-gray-700">\${uni.address}</span>
                  </div>
                \` : ''}
                \${uni.contactEmail ? \`
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-envelope text-gray-400"></i>
                    <a href="mailto:\${uni.contactEmail}" class="text-blue-600 hover:underline">\${uni.contactEmail}</a>
                  </div>
                \` : ''}
                \${uni.contactPhone ? \`
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-phone text-gray-400"></i>
                    <a href="tel:\${uni.contactPhone}" class="text-blue-600 hover:underline">\${uni.contactPhone}</a>
                  </div>
                \` : ''}
              </div>
            </div>
            \` : ''}

            <div class="mt-6 pt-6 border-t flex justify-center space-x-4">
              <a href="\${uni.website}" target="_blank" 
                 class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                <i class="fas fa-external-link-alt mr-2"></i>
                공식 홈페이지 방문
              </a>
              <button onclick="closeUniversityModal()" 
                      class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                닫기
              </button>
            </div>
          </div>
        </div>
      \`;

      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
    }

    function closeUniversityModal() {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        document.body.removeChild(modal);
        document.body.classList.remove('modal-open');
      }
    }

    // 🏛️ 관리자 대시보드 - 협약대학교 관리 함수들
    let adminUniversitiesData = [];

    // 협약대학교 관리 섹션 표시/숨김
    function showPartnerUniversityManagement() {
      document.getElementById('partnerUniversityManagement').classList.remove('hidden');
      loadUniversitiesForAdmin();
      loadAdminStatistics();
    }

    function hidePartnerUniversityManagement() {
      document.getElementById('partnerUniversityManagement').classList.add('hidden');
    }

    // 관리자용 대학교 데이터 로드
    async function loadUniversitiesForAdmin() {
      try {
        const search = document.getElementById('searchUniversity')?.value || '';
        const region = document.getElementById('adminRegionFilter')?.value || '';
        
        const params = new URLSearchParams();
        if (region) params.append('region', region);
        
        const response = await fetch(\`/api/partner-universities?\${params}\`);
        const result = await response.json();
        
        if (result.success) {
          let universities = result.universities;
          
          // 검색어 필터링
          if (search) {
            universities = universities.filter(uni => 
              uni.name.toLowerCase().includes(search.toLowerCase()) ||
              uni.englishName.toLowerCase().includes(search.toLowerCase())
            );
          }
          
          adminUniversitiesData = universities;
          displayUniversitiesTable(universities);
        }
      } catch (error) {
        console.error('관리자 대학교 데이터 로드 오류:', error);
      }
    }

    // 대학교 테이블 표시
    function displayUniversitiesTable(universities) {
      const tbody = document.getElementById('universitiesTableBody');
      if (!tbody) return;

      tbody.innerHTML = universities.map(uni => {
        // 모집과정 배지 생성
        const courseBadges = [
          uni.languageCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">어학연수</span>' : '',
          uni.undergraduateCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">학부과정</span>' : '',
          uni.graduateCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">대학원과정</span>' : ''
        ].filter(Boolean).join(' ');

        // 학비 정보
        const tuitionInfo = uni.tuitionFee ? \`\${parseInt(uni.tuitionFee).toLocaleString()}원/학기\` : '문의 필요';
        
        // 장학금 요약
        const scholarshipSummary = uni.scholarshipInfo ? 
          (uni.scholarshipInfo.length > 30 ? uni.scholarshipInfo.substring(0, 30) + '...' : uni.scholarshipInfo) : 
          '정보 없음';

        // 서비스 아이콘
        const services = [
          uni.dormitory ? '<i class="fas fa-home text-blue-600" title="기숙사"></i>' : '<i class="fas fa-home text-gray-300" title="기숙사 없음"></i>',
          uni.airportPickup ? '<i class="fas fa-plane text-blue-600" title="공항픽업"></i>' : '<i class="fas fa-plane text-gray-300" title="공항픽업 없음"></i>',
          uni.buddyProgram ? '<i class="fas fa-users text-blue-600" title="버디프로그램"></i>' : '<i class="fas fa-users text-gray-300" title="버디프로그램 없음"></i>',
          uni.careerSupport ? '<i class="fas fa-briefcase text-blue-600" title="취업지원"></i>' : '<i class="fas fa-briefcase text-gray-300" title="취업지원 없음"></i>'
        ].join(' ');

        return \`
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-white font-bold text-lg">\${uni.name.charAt(0)}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-gray-900">\${uni.name}</div>
                  <div class="text-xs text-gray-500">\${uni.englishName || ''}</div>
                  <div class="text-xs text-gray-500 mt-0.5">
                    <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>\${uni.region}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                \${courseBadges || '<span class="text-xs text-gray-400">정보 없음</span>'}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm">
                <div class="text-gray-900 font-medium">\${tuitionInfo}</div>
                <div class="text-xs text-gray-500 mt-1" title="\${uni.scholarshipInfo || ''}">\${scholarshipSummary}</div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex space-x-2 text-lg">
                \${services}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button onclick="showUniversityModal(\${uni.id})" class="text-gray-600 hover:text-gray-900" title="상세보기">
                  <i class="fas fa-eye"></i>
                </button>
                <button onclick="editUniversity(\${uni.id})" class="text-blue-600 hover:text-blue-900" title="수정">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUniversity(\${uni.id})" class="text-red-600 hover:text-red-900" title="삭제">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // 대학교 추가 폼 표시
    function showAddUniversityForm() {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      modal.onclick = (e) => {
        if (e.target === modal) closeUniversityForm();
      };

      modal.innerHTML = \`
        <div class="modal-content bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <form id="universityForm" onsubmit="saveUniversity(event)">
            <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">새 협약대학교 추가</h2>
              <button type="button" onclick="closeUniversityForm()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="p-6">
              <!-- 기본 정보 섹션 -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-university text-blue-600 mr-2"></i>
                  기본 정보
                </h3>
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">대학교명 *</label>
                    <input type="text" name="name" required placeholder="예: 청암대학교" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">영문명 *</label>
                    <input type="text" name="englishName" required placeholder="CHEONGAM UNIVERSITY" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">지역 (시·도) *</label>
                    <select name="region" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">선택하세요</option>
                      <option value="서울특별시">서울특별시</option>
                      <option value="부산광역시">부산광역시</option>
                      <option value="대구광역시">대구광역시</option>
                      <option value="인천광역시">인천광역시</option>
                      <option value="광주광역시">광주광역시</option>
                      <option value="대전광역시">대전광역시</option>
                      <option value="울산광역시">울산광역시</option>
                      <option value="세종특별자치시">세종특별자치시</option>
                      <option value="경기도">경기도</option>
                      <option value="강원특별자치도">강원특별자치도</option>
                      <option value="충청북도">충청북도</option>
                      <option value="충청남도">충청남도</option>
                      <option value="전북특별자치도">전북특별자치도</option>
                      <option value="전라남도">전라남도</option>
                      <option value="경상북도">경상북도</option>
                      <option value="경상남도">경상남도</option>
                      <option value="제주특별자치도">제주특별자치도</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">상세 주소</label>
                    <input type="text" name="address" placeholder="예: 순창군 순창읍 청암로 113" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">홈페이지 URL *</label>
                    <input type="url" name="website" required placeholder="https://www.example.ac.kr" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">국제교류 담당자 이메일</label>
                    <input type="email" name="contactEmail" placeholder="international@example.ac.kr" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">국제교류 담당자 전화</label>
                    <input type="text" name="contactPhone" placeholder="02-1234-5678" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">설립년도</label>
                    <input type="number" name="establishedYear" placeholder="1998" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                </div>
              </div>

              <!-- 모집 과정 섹션 -->
              <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-graduation-cap text-blue-600 mr-2"></i>
                  모집 과정
                </h3>
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="flex items-center">
                    <input type="checkbox" name="languageCourse" id="languageCourse" class="w-4 h-4 text-blue-600 mr-3">
                    <label for="languageCourse" class="text-sm font-medium text-gray-700">어학과정</label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" name="undergraduateCourse" id="undergraduateCourse" class="w-4 h-4 text-blue-600 mr-3">
                    <label for="undergraduateCourse" class="text-sm font-medium text-gray-700">학부과정 (학사)</label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" name="graduateCourse" id="graduateCourse" class="w-4 h-4 text-blue-600 mr-3">
                    <label for="graduateCourse" class="text-sm font-medium text-gray-700">대학원과정 (석·박사)</label>
                  </div>
                </div>
              </div>

              <!-- 학비 및 장학금 섹션 -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-money-bill-wave text-green-600 mr-2"></i>
                  학비 및 장학금
                </h3>
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">연간 학비 (학부)</label>
                    <input type="text" name="tuitionFee" placeholder="예: 4,000,000원 ~ 6,000,000원" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">기숙사비 (월)</label>
                    <input type="text" name="dormitoryFee" placeholder="예: 300,000원 ~ 500,000원" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">장학금 제도</label>
                    <textarea name="scholarships" rows="3" placeholder="예: 성적장학금 (30~100%), 한국어능력우수장학금, TOPIK 6급 전액장학금" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>
                </div>
              </div>

              <!-- 지원 요건 섹션 -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-clipboard-check text-purple-600 mr-2"></i>
                  지원 요건
                </h3>
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">한국어 능력 요구사항</label>
                    <input type="text" name="koreanRequirement" placeholder="예: TOPIK 3급 이상" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">영어 능력 요구사항</label>
                    <input type="text" name="englishRequirement" placeholder="예: TOEFL 80점 또는 IELTS 6.0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">기타 지원 요건</label>
                    <textarea name="admissionRequirement" rows="2" placeholder="예: 고등학교 졸업 이상, 최근 3년 이내 성적증명서" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>
                </div>
              </div>

              <!-- 편의시설 및 지원 섹션 -->
              <div class="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-hands-helping text-green-600 mr-2"></i>
                  편의시설 및 지원
                </h3>
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="flex items-center">
                    <input type="checkbox" name="dormitory" id="dormitory" class="w-4 h-4 text-green-600 mr-3">
                    <label for="dormitory" class="text-sm font-medium text-gray-700">기숙사 제공</label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" name="airportPickup" id="airportPickup" class="w-4 h-4 text-green-600 mr-3">
                    <label for="airportPickup" class="text-sm font-medium text-gray-700">공항 픽업 서비스</label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" name="buddyProgram" id="buddyProgram" class="w-4 h-4 text-green-600 mr-3">
                    <label for="buddyProgram" class="text-sm font-medium text-gray-700">버디 프로그램</label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" name="koreanLanguageSupport" id="koreanLanguageSupport" class="w-4 h-4 text-green-600 mr-3">
                    <label for="koreanLanguageSupport" class="text-sm font-medium text-gray-700">한국어 무료 강좌</label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" name="careerSupport" id="careerSupport" class="w-4 h-4 text-green-600 mr-3">
                    <label for="careerSupport" class="text-sm font-medium text-gray-700">취업 지원</label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" name="partTimeWork" id="partTimeWork" class="w-4 h-4 text-green-600 mr-3">
                    <label for="partTimeWork" class="text-sm font-medium text-gray-700">아르바이트 알선</label>
                  </div>
                </div>
              </div>

              <!-- 학생 정보 -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-users text-indigo-600 mr-2"></i>
                  학생 정보
                </h3>
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">총 재학생 수</label>
                    <input type="number" name="studentCount" placeholder="8000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">외국인 학생 수</label>
                    <input type="number" name="foreignStudentCount" placeholder="500" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                </div>
              </div>
              
              <!-- 대학 소개 및 특징 -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-info-circle text-orange-600 mr-2"></i>
                  대학 소개 및 특징
                </h3>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">대학 소개</label>
                  <textarea name="description" rows="4" placeholder="외국인 유학생을 위한 대학 소개를 작성해주세요..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">주요 특징 (쉼표로 구분)</label>
                  <input type="text" name="features" placeholder="예: 다국어 수업 지원, 문화체험 프로그램, 산학협력 강화" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <!-- 전공 및 학과 -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-book text-pink-600 mr-2"></i>
                  전공 및 학과
                </h3>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">주요 전공 (쉼표로 구분)</label>
                  <textarea name="majors" rows="2" placeholder="예: 경영학, 컴퓨터공학, 국제통상학, 호텔관광경영학, 한국어학" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
              </div>

              <!-- 모집 일정 -->
              <div class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-calendar-alt text-yellow-600 mr-2"></i>
                  모집 일정
                </h3>
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">봄학기 모집기간</label>
                    <input type="text" name="springAdmission" placeholder="예: 11월 ~ 1월" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">가을학기 모집기간</label>
                    <input type="text" name="fallAdmission" placeholder="예: 5월 ~ 7월" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                </div>
              </div>

              <!-- 협력 정보 -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-handshake text-teal-600 mr-2"></i>
                  협력 정보
                </h3>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">협력 형태</label>
                  <select name="partnershipType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="교환학생">교환학생</option>
                    <option value="정규입학">정규입학</option>
                    <option value="복수학위">복수학위</option>
                    <option value="편입">편입</option>
                    <option value="어학연수">어학연수</option>
                    <option value="전체">전체</option>
                  </select>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t flex justify-end space-x-4">
                <button type="button" onclick="closeUniversityForm()" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  취소
                </button>
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  저장
                </button>
              </div>
            </div>
          </form>
        </div>
      \`;

      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
    }

    // 대학교 폼 닫기
    function closeUniversityForm() {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        document.body.removeChild(modal);
        document.body.classList.remove('modal-open');
      }
    }

    // 대학교 정보 저장
    async function saveUniversity(event) {
      event.preventDefault();
      
      const form = event.target;
      const formData = new FormData(form);
      
      // 배열 필드들을 처리
      const majorsText = formData.get('majors') || '';
      const featuresText = formData.get('features') || '';
      
      const data = {
        // 기본 정보
        name: formData.get('name'),
        englishName: formData.get('englishName'),
        region: formData.get('region'),
        address: formData.get('address') || '',
        website: formData.get('website'),
        logo: \`https://via.placeholder.com/120x120/1f2937/ffffff?text=\${encodeURIComponent(formData.get('name').charAt(0))}\`,
        establishedYear: parseInt(formData.get('establishedYear')) || new Date().getFullYear(),
        contactEmail: formData.get('contactEmail') || '',
        contactPhone: formData.get('contactPhone') || '',
        
        // 모집 과정
        languageCourse: formData.get('languageCourse') === 'on',
        undergraduateCourse: formData.get('undergraduateCourse') === 'on',
        graduateCourse: formData.get('graduateCourse') === 'on',
        
        // 학비 및 장학금
        tuitionFee: formData.get('tuitionFee') || '문의',
        dormitoryFee: formData.get('dormitoryFee') || '문의',
        scholarships: formData.get('scholarships') || '',
        
        // 지원 요건
        koreanRequirement: formData.get('koreanRequirement') || '',
        englishRequirement: formData.get('englishRequirement') || '',
        admissionRequirement: formData.get('admissionRequirement') || '',
        
        // 편의시설 및 지원
        dormitory: formData.get('dormitory') === 'on',
        airportPickup: formData.get('airportPickup') === 'on',
        buddyProgram: formData.get('buddyProgram') === 'on',
        koreanLanguageSupport: formData.get('koreanLanguageSupport') === 'on',
        careerSupport: formData.get('careerSupport') === 'on',
        partTimeWork: formData.get('partTimeWork') === 'on',
        
        // 학생 정보
        studentCount: parseInt(formData.get('studentCount')) || 0,
        foreignStudentCount: parseInt(formData.get('foreignStudentCount')) || 0,
        
        // 대학 소개 및 특징
        description: formData.get('description') || '',
        features: featuresText.split(',').map(s => s.trim()).filter(s => s),
        
        // 전공 및 학과
        majors: majorsText.split(',').map(s => s.trim()).filter(s => s),
        
        // 모집 일정
        springAdmission: formData.get('springAdmission') || '',
        fallAdmission: formData.get('fallAdmission') || '',
        
        // 협력 정보
        partnershipType: formData.get('partnershipType') || '교환학생',
        
        // 호환성을 위한 기존 필드 (사용하지 않지만 API 호환성 유지)
        ranking: 0,
        degrees: []
      };

      try {
        const response = await fetch('/api/partner-universities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
          alert('협약대학교가 성공적으로 추가되었습니다!');
          closeUniversityForm();
          loadUniversitiesForAdmin();
        } else {
          alert('오류가 발생했습니다: ' + result.message);
        }
      } catch (error) {
        console.error('저장 오류:', error);
        alert('저장 중 오류가 발생했습니다.');
      }
    }

    // 대학교 삭제
    async function deleteUniversity(id) {
      if (!confirm('정말로 이 대학교를 삭제하시겠습니까?')) return;
      
      try {
        const response = await fetch(\`/api/partner-universities/\${id}\`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
          alert('대학교가 삭제되었습니다.');
          loadUniversitiesForAdmin();
        }
      } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }

    // 대학교 수정
    function editUniversity(id) {
      const uni = adminUniversitiesData.find(u => u.id === id);
      if (!uni) return;
      
      // 수정 폼 표시 (추가 폼과 동일하지만 값이 미리 채워짐)
      showAddUniversityForm();
      
      // 폼에 기존 값 채우기
      setTimeout(() => {
        const form = document.getElementById('universityForm');
        if (form) {
          // 기본 정보
          form.querySelector('[name="name"]').value = uni.name || '';
          form.querySelector('[name="englishName"]').value = uni.englishName || '';
          form.querySelector('[name="region"]').value = uni.region || '';
          form.querySelector('[name="address"]').value = uni.address || '';
          form.querySelector('[name="website"]').value = uni.website || '';
          form.querySelector('[name="establishedYear"]').value = uni.establishedYear || '';
          form.querySelector('[name="contactEmail"]').value = uni.contactEmail || '';
          form.querySelector('[name="contactPhone"]').value = uni.contactPhone || '';
          
          // 모집 과정
          form.querySelector('[name="languageCourse"]').checked = uni.languageCourse || false;
          form.querySelector('[name="undergraduateCourse"]').checked = uni.undergraduateCourse || false;
          form.querySelector('[name="graduateCourse"]').checked = uni.graduateCourse || false;
          
          // 학비 및 장학금
          form.querySelector('[name="tuitionFee"]').value = uni.tuitionFee || '';
          form.querySelector('[name="dormitoryFee"]').value = uni.dormitoryFee || '';
          form.querySelector('[name="scholarships"]').value = uni.scholarships || '';
          
          // 지원 요건
          form.querySelector('[name="koreanRequirement"]').value = uni.koreanRequirement || '';
          form.querySelector('[name="englishRequirement"]').value = uni.englishRequirement || '';
          form.querySelector('[name="admissionRequirement"]').value = uni.admissionRequirement || '';
          
          // 편의시설 및 지원
          form.querySelector('[name="dormitory"]').checked = uni.dormitory || false;
          form.querySelector('[name="airportPickup"]').checked = uni.airportPickup || false;
          form.querySelector('[name="buddyProgram"]').checked = uni.buddyProgram || false;
          form.querySelector('[name="koreanLanguageSupport"]').checked = uni.koreanLanguageSupport || false;
          form.querySelector('[name="careerSupport"]').checked = uni.careerSupport || false;
          form.querySelector('[name="partTimeWork"]').checked = uni.partTimeWork || false;
          
          // 학생 정보
          form.querySelector('[name="studentCount"]').value = uni.studentCount || '';
          form.querySelector('[name="foreignStudentCount"]').value = uni.foreignStudentCount || '';
          
          // 대학 소개 및 특징
          form.querySelector('[name="description"]').value = uni.description || '';
          form.querySelector('[name="features"]').value = Array.isArray(uni.features) ? uni.features.join(', ') : '';
          
          // 전공 및 학과
          form.querySelector('[name="majors"]').value = Array.isArray(uni.majors) ? uni.majors.join(', ') : '';
          
          // 모집 일정
          form.querySelector('[name="springAdmission"]').value = uni.springAdmission || '';
          form.querySelector('[name="fallAdmission"]').value = uni.fallAdmission || '';
          
          // 협력 정보
          form.querySelector('[name="partnershipType"]').value = uni.partnershipType || '교환학생';
          
          // 폼 제출을 수정으로 변경
          form.onsubmit = (e) => updateUniversity(e, id);
          document.querySelector('.modal-content h2').textContent = '협약대학교 수정';
        }
      }, 100);
    }

    // 대학교 정보 수정
    async function updateUniversity(event, id) {
      event.preventDefault();
      
      // saveUniversity와 동일한 로직이지만 PUT 메서드 사용
      const form = event.target;
      const formData = new FormData(form);
      
      const majorsText = formData.get('majors') || '';
      const featuresText = formData.get('features') || '';
      
      const data = {
        // 기본 정보
        name: formData.get('name'),
        englishName: formData.get('englishName'),
        region: formData.get('region'),
        address: formData.get('address') || '',
        website: formData.get('website'),
        logo: \`https://via.placeholder.com/120x120/1f2937/ffffff?text=\${encodeURIComponent(formData.get('name').charAt(0))}\`,
        establishedYear: parseInt(formData.get('establishedYear')) || new Date().getFullYear(),
        contactEmail: formData.get('contactEmail') || '',
        contactPhone: formData.get('contactPhone') || '',
        
        // 모집 과정
        languageCourse: formData.get('languageCourse') === 'on',
        undergraduateCourse: formData.get('undergraduateCourse') === 'on',
        graduateCourse: formData.get('graduateCourse') === 'on',
        
        // 학비 및 장학금
        tuitionFee: formData.get('tuitionFee') || '문의',
        dormitoryFee: formData.get('dormitoryFee') || '문의',
        scholarships: formData.get('scholarships') || '',
        
        // 지원 요건
        koreanRequirement: formData.get('koreanRequirement') || '',
        englishRequirement: formData.get('englishRequirement') || '',
        admissionRequirement: formData.get('admissionRequirement') || '',
        
        // 편의시설 및 지원
        dormitory: formData.get('dormitory') === 'on',
        airportPickup: formData.get('airportPickup') === 'on',
        buddyProgram: formData.get('buddyProgram') === 'on',
        koreanLanguageSupport: formData.get('koreanLanguageSupport') === 'on',
        careerSupport: formData.get('careerSupport') === 'on',
        partTimeWork: formData.get('partTimeWork') === 'on',
        
        // 학생 정보
        studentCount: parseInt(formData.get('studentCount')) || 0,
        foreignStudentCount: parseInt(formData.get('foreignStudentCount')) || 0,
        
        // 대학 소개 및 특징
        description: formData.get('description') || '',
        features: featuresText.split(',').map(s => s.trim()).filter(s => s),
        
        // 전공 및 학과
        majors: majorsText.split(',').map(s => s.trim()).filter(s => s),
        
        // 모집 일정
        springAdmission: formData.get('springAdmission') || '',
        fallAdmission: formData.get('fallAdmission') || '',
        
        // 협력 정보
        partnershipType: formData.get('partnershipType') || '교환학생',
        
        // 호환성을 위한 기존 필드
        ranking: 0,
        degrees: []
      };

      try {
        const response = await fetch(\`/api/partner-universities/\${id}\`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
          alert('협약대학교 정보가 수정되었습니다!');
          closeUniversityForm();
          loadUniversitiesForAdmin();
        } else {
          alert('오류가 발생했습니다: ' + result.message);
        }
      } catch (error) {
        console.error('수정 오류:', error);
        alert('수정 중 오류가 발생했습니다.');
      }
    }

    // 데이터 내보내기
    function exportUniversitiesData() {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "대학교명,영문명,지역,순위,재학생수,외국인학생수,학비,협력형태,홈페이지\\n" +
        adminUniversitiesData.map(uni => 
          \`"\${uni.name}","\${uni.englishName}","\${uni.region}",\${uni.ranking},\${uni.studentCount},\${uni.foreignStudentCount},"\${uni.tuitionFee}","\${uni.partnershipType}","\${uni.website}"\`
        ).join("\\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", \`협약대학교_\${new Date().toISOString().slice(0,10)}.csv\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // 🤝 에이전트 관리 함수들
    let adminAgentsData = [];

    // 에이전트 관리 섹션 표시/숨김
    function showAgentManagement() {
      document.getElementById('agentManagement').classList.remove('hidden');
      loadAgentsForAdmin();
    }

    function hideAgentManagement() {
      document.getElementById('agentManagement').classList.add('hidden');
    }

    // 관리자용 에이전트 데이터 로드
    async function loadAgentsForAdmin() {
      try {
        const search = document.getElementById('searchAgent')?.value || '';
        const specialization = document.getElementById('agentSpecializationFilter')?.value || 'all';
        const status = document.getElementById('agentStatusFilter')?.value || 'all';
        
        const params = new URLSearchParams();
        if (specialization !== 'all') params.append('specialization', specialization);
        if (status !== 'all') params.append('status', status);
        
        const response = await fetch(\`/api/agents?\${params}\`);
        const result = await response.json();
        
        if (result.success) {
          let agents = result.agents;
          
          // 검색어 필터링
          if (search) {
            agents = agents.filter(agent => 
              agent.agencyName.toLowerCase().includes(search.toLowerCase()) ||
              agent.contactName.toLowerCase().includes(search.toLowerCase()) ||
              agent.email.toLowerCase().includes(search.toLowerCase())
            );
          }
          
          adminAgentsData = agents;
          displayAgentsTable(agents);
        }
      } catch (error) {
        console.error('관리자 에이전트 데이터 로드 오류:', error);
      }
    }

    // 에이전트 테이블 표시
    function displayAgentsTable(agents) {
      const tbody = document.getElementById('agentsTableBody');
      if (!tbody) return;

      tbody.innerHTML = agents.map(agent => {
        // 전문분야 배지 생성
        const specializationBadges = agent.specialization.slice(0, 3).map(spec => {
          const colors = {
            '유학': 'bg-blue-100 text-blue-800',
            '취업': 'bg-green-100 text-green-800',
            '비자': 'bg-purple-100 text-purple-800',
            '정착지원': 'bg-yellow-100 text-yellow-800'
          };
          const colorClass = colors[spec] || 'bg-gray-100 text-gray-800';
          return \`<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium \${colorClass}">\${spec}</span>\`;
        }).join(' ');
        
        const moreBadge = agent.specialization.length > 3 ? 
          \`<span class="text-xs text-gray-400">+\${agent.specialization.length - 3}</span>\` : '';

        // 실적 정보
        const placementsInfo = \`총 \${agent.totalPlacements}건\`;
        const commissionInfo = \`수수료 \${agent.commissionRate}%\`;
        
        // 평가 지표
        const successRate = \`<i class="fas fa-star text-yellow-500 mr-1"></i>\${agent.successRate}%\`;
        const countriesCount = \`<i class="fas fa-globe text-blue-500 mr-1"></i>\${agent.countriesCovered.length}개국\`;
        const experienceYears = \`<i class="fas fa-briefcase text-gray-500 mr-1"></i>\${agent.experienceYears}년\`;
        
        // 승인 상태 배지
        const statusBadges = {
          'approved': '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">승인</span>',
          'pending': '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">대기</span>',
          'suspended': '<span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">정지</span>'
        };
        const statusBadge = statusBadges[agent.approvalStatus] || '';

        return \`
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-white font-bold text-lg">\${agent.agencyName.charAt(0)}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-gray-900">\${agent.agencyName}</div>
                  <div class="text-xs text-gray-500">\${agent.contactName}</div>
                  <div class="text-xs text-gray-400 mt-0.5">\${agent.email}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                \${specializationBadges || '<span class="text-xs text-gray-400">정보 없음</span>'}
                \${moreBadge}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm">
                <div class="text-gray-900 font-medium">\${placementsInfo}</div>
                <div class="text-xs text-gray-500 mt-1">\${commissionInfo}</div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm space-y-1">
                <div>\${successRate}</div>
                <div>\${countriesCount} • \${experienceYears}</div>
                <div class="mt-1">\${statusBadge}</div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button onclick="showAgentModal(\${agent.id})" class="text-gray-600 hover:text-gray-900" title="상세보기">
                  <i class="fas fa-eye"></i>
                </button>
                <button onclick="editAgent(\${agent.id})" class="text-blue-600 hover:text-blue-900" title="수정">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteAgent(\${agent.id})" class="text-red-600 hover:text-red-900" title="삭제">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // 에이전트 상세 모달 표시
    function showAgentModal(agentId) {
      const agent = adminAgentsData.find(a => a.id === agentId);
      if (!agent) return;

      const modal = document.createElement('div');
      modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      modal.onclick = (e) => {
        if (e.target === modal) closeAgentModal();
      };

      const specializationBadges = agent.specialization.map(spec => {
        const colors = {
          '유학': 'bg-blue-50 text-blue-700',
          '취업': 'bg-green-50 text-green-700',
          '비자': 'bg-purple-50 text-purple-700',
          '정착지원': 'bg-yellow-50 text-yellow-700'
        };
        const colorClass = colors[spec] || 'bg-gray-50 text-gray-700';
        return \`<span class="px-3 py-1 \${colorClass} rounded-full text-sm">\${spec}</span>\`;
      }).join(' ');

      const countriesBadges = agent.countriesCovered.map(country => 
        \`<span class="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm">\${country}</span>\`
      ).join(' ');

      const languagesBadges = agent.languages.map(lang => 
        \`<span class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">\${lang}</span>\`
      ).join(' ');

      modal.innerHTML = \`
        <div class="modal-content bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-xl">\${agent.agencyName.charAt(0)}</span>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">\${agent.agencyName}</h2>
                <p class="text-sm text-gray-600">\${agent.contactName}</p>
              </div>
            </div>
            <button onclick="closeAgentModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="p-6">
            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">기본 정보</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">라이센스 번호</span>
                    <span class="font-medium">\${agent.licenseNumber || '없음'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">경력</span>
                    <span class="font-medium">\${agent.experienceYears}년</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">이메일</span>
                    <span class="font-medium text-sm">\${agent.email}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">연락처</span>
                    <span class="font-medium">\${agent.phone || '없음'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">승인 상태</span>
                    <span class="font-medium">\${agent.approvalStatus === 'approved' ? '✅ 승인' : agent.approvalStatus === 'pending' ? '⏳ 대기' : '❌ 정지'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold mb-3">실적 정보</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">총 배치 건수</span>
                    <span class="font-medium text-blue-600">\${agent.totalPlacements}건</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">성공률</span>
                    <span class="font-medium text-green-600">\${agent.successRate}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">수수료율</span>
                    <span class="font-medium">\${agent.commissionRate}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">담당 국가</span>
                    <span class="font-medium">\${agent.countriesCovered.length}개국</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">전문 분야</h3>
              <div class="flex flex-wrap gap-2">
                \${specializationBadges || '<span class="text-gray-400 text-sm">정보 없음</span>'}
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">담당 국가</h3>
              <div class="flex flex-wrap gap-2">
                \${countriesBadges || '<span class="text-gray-400 text-sm">정보 없음</span>'}
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">구사 언어</h3>
              <div class="flex flex-wrap gap-2">
                \${languagesBadges || '<span class="text-gray-400 text-sm">정보 없음</span>'}
              </div>
            </div>

            <div class="mt-6 pt-6 border-t flex justify-center space-x-4">
              <button onclick="editAgent(\${agent.id}); closeAgentModal();" 
                      class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <i class="fas fa-edit mr-2"></i>수정
              </button>
              <button onclick="closeAgentModal()" 
                      class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                닫기
              </button>
            </div>
          </div>
        </div>
      \`;

      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
    }

    function closeAgentModal() {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        document.body.removeChild(modal);
        document.body.classList.remove('modal-open');
      }
    }

    // 에이전트 삭제
    async function deleteAgent(agentId) {
      if (!confirm('정말로 이 에이전트를 삭제하시겠습니까?')) {
        return;
      }

      try {
        const response = await fetch(\`/api/agents/\${agentId}\`, {
          method: 'DELETE',
          headers: {
            'Authorization': \`Bearer \${localStorage.getItem('wowcampus_token')}\`
          }
        });

        const result = await response.json();
        
        if (result.success) {
          alert('에이전트가 삭제되었습니다.');
          loadAgentsForAdmin();
        } else {
          alert('에이전트 삭제에 실패했습니다: ' + result.message);
        }
      } catch (error) {
        console.error('에이전트 삭제 오류:', error);
        alert('에이전트 삭제 중 오류가 발생했습니다.');
      }
    }

    // 에이전트 추가 폼 표시 (임시 구현)
    function showAddAgentForm() {
      alert('에이전트 추가 기능은 준비 중입니다.');
      // TODO: 에이전트 추가 폼 모달 구현
    }

    // 에이전트 수정 (임시 구현)
    function editAgent(agentId) {
      alert(\`에이전트 수정 기능은 준비 중입니다. (ID: \${agentId})\`);
      // TODO: 에이전트 수정 폼 모달 구현
    }

    // 관리자 통계 로드
    async function loadAdminStatistics() {
      try {
        const token = localStorage.getItem('wowcampus_token');
        if (!token) {
          console.warn('인증 토큰 없음');
          return;
        }
        
        const response = await fetch('/api/admin/statistics', {
          headers: {
            'Authorization': \`Bearer \${token}\`
          }
        });
        const result = await response.json();
        
        if (result.success) {
          const totalJobsEl = document.getElementById('totalJobs');
          const totalJobseekersEl = document.getElementById('totalJobseekers');
          const totalMatchesEl = document.getElementById('totalMatches');
          const totalUniversitiesEl = document.getElementById('totalUniversities');
          
          if (totalJobsEl && result.data.jobs) {
            totalJobsEl.textContent = result.data.jobs.total || 0;
          }
          if (totalJobseekersEl && result.data.users) {
            const jobseekers = result.data.users.byType.find(u => u.user_type === 'jobseeker');
            totalJobseekersEl.textContent = jobseekers ? jobseekers.count : 0;
          }
          if (totalMatchesEl) {
            totalMatchesEl.textContent = '0'; // TODO: implement matches count
          }
        }
        
        // 협약대학교 수 계산
        const universitiesResponse = await fetch('/api/admin/universities', {
          headers: {
            'Authorization': \`Bearer \${token}\`
          }
        });
        const universitiesResult = await universitiesResponse.json();
        if (universitiesResult.success && totalUniversitiesEl) {
          totalUniversitiesEl.textContent = universitiesResult.data.count || 0;
        }
      } catch (error) {
        console.error('통계 로드 오류:', error);
      }
    }
    
    // 관리자 - 사용자 관리 기능
    // 헬퍼 함수들
    function getUserTypeLabel(type) {
      const labels = {
        'jobseeker': '구직자',
        'employer': '구인자',
        'agent': '에이전트',
        'admin': '관리자'
      };
      return labels[type] || type;
    }
    
    function getStatusLabel(status) {
      const labels = {
        'approved': '승인됨',
        'pending': '대기중',
        'rejected': '거절됨',
        'suspended': '정지됨',
        'deleted': '삭제됨'
      };
      return labels[status] || status;
    }
    
    async function loadPendingUsers() {
      const container = document.getElementById('pendingUsersContent');
      if (!container) return;
      
      try {
        const token = localStorage.getItem('wowcampus_token');
        if (!token) {
          container.innerHTML = '<p class="text-red-500 text-center py-8">로그인이 필요합니다.</p>';
          return;
        }
        
        const response = await fetch('/api/admin/users/pending', {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // 대기 중인 사용자 수 업데이트
          const countBadge = document.getElementById('pendingTabCount');
          if (countBadge) {
            countBadge.textContent = result.data.count || 0;
          }
          
          // pendingBadge도 업데이트 (메인 카드의 배지)
          const mainBadge = document.getElementById('pendingBadge');
          if (mainBadge) {
            mainBadge.textContent = result.data.count || 0;
          }
          
          if (result.data.count === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">승인 대기 중인 사용자가 없습니다.</p>';
            return;
          }
          
          container.innerHTML = result.data.pendingUsers.map(user => \`
            <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-semibold text-lg">\${user.name}</h4>
                  <p class="text-sm text-gray-600">\${user.email}</p>
                  <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">\${getUserTypeLabel(user.user_type)}</span>
                </div>
                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">대기중</span>
              </div>
              <div class="text-sm text-gray-600 mb-3">
                <p>연락처: \${user.phone || '미제공'}</p>
                <p>가입일: \${new Date(user.created_at).toLocaleDateString('ko-KR')}</p>
                \${user.additional_info ? \`<p>추가정보: \${user.additional_info}</p>\` : ''}
              </div>
              <div class="flex space-x-2">
                <button onclick="approveUser('\${user.id}', '\${user.name}')" 
                        class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm">
                  <i class="fas fa-check mr-1"></i>승인
                </button>
                <button onclick="rejectUser('\${user.id}', '\${user.name}')" 
                        class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm">
                  <i class="fas fa-times mr-1"></i>거부
                </button>
              </div>
            </div>
          \`).join('');
        } else {
          container.innerHTML = \`<p class="text-red-500 text-center py-8">오류: \${result.message || '데이터를 불러올 수 없습니다.'}</p>\`;
        }
      } catch (error) {
        console.error('대기 중인 사용자 로드 오류:', error);
        container.innerHTML = \`
          <div class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-2"></i>
            <p class="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
            <p class="text-gray-500 text-sm mt-2">\${error.message || '알 수 없는 오류'}</p>
            <button onclick="loadPendingUsers()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              다시 시도
            </button>
          </div>
        \`;
      }
    }
    
    async function approveUser(userId, userName) {
      if (!confirm(\`\${userName}님의 가입을 승인하시겠습니까?\`)) return;
      
      try {
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(\`/api/admin/users/\${userId}/approve\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        if (result.success) {
          alert(result.message);
          loadPendingUsers(); // 목록 새로고침
          loadAdminStatistics(); // 통계 업데이트
        } else {
          alert('승인 실패: ' + result.message);
        }
      } catch (error) {
        console.error('승인 오류:', error);
        alert('승인 중 오류가 발생했습니다.');
      }
    }
    
    async function rejectUser(userId, userName) {
      const reason = prompt(\`\${userName}님의 가입을 거부하는 이유를 입력하세요:\`);
      if (!reason) return;
      
      try {
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(\`/api/admin/users/\${userId}/reject\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        });
        
        const result = await response.json();
        if (result.success) {
          alert(result.message);
          loadPendingUsers(); // 목록 새로고침
        } else {
          alert('거부 실패: ' + result.message);
        }
      } catch (error) {
        console.error('거부 오류:', error);
        alert('거부 중 오류가 발생했습니다.');
      }
    }
    
    // 사용자 관리 탭 전환
    function switchUserTab(tabName) {
      // 모든 탭 버튼 비활성화
      const tabs = ['pending', 'all', 'jobseekers', 'employers', 'agents'];
      tabs.forEach(tab => {
        const button = document.getElementById(\`\${tab}Tab\`) || document.getElementById(\`\${tab}UsersTab\`);
        if (button) {
          button.className = 'px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300';
        }
      });
      
      // 콘텐츠 영역 숨기기
      const pendingContent = document.getElementById('pendingUsersContent');
      const allUsersContent = document.getElementById('allUsersContent');
      if (pendingContent) pendingContent.classList.add('hidden');
      if (allUsersContent) allUsersContent.classList.add('hidden');
      
      // 선택된 탭 활성화
      const activeButton = document.getElementById(\`\${tabName}Tab\`) || document.getElementById(\`\${tabName}UsersTab\`);
      
      if (activeButton) {
        if (tabName === 'pending') {
          // 승인 대기 탭
          activeButton.className = 'px-4 py-3 text-sm font-medium text-yellow-600 border-b-2 border-yellow-600';
          if (pendingContent) pendingContent.classList.remove('hidden');
          loadPendingUsers();
        } else {
          // 전체 사용자, 구직자, 구인자, 에이전트 탭
          activeButton.className = 'px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600';
          if (allUsersContent) allUsersContent.classList.remove('hidden');
          // tabName에 따라 필터링
          const userType = tabName === 'all' ? null : tabName;
          loadAllUsers(1, userType);
        }
      }
    }
    
    // 전체 사용자 로드
    let currentUserPage = 1;
    let currentUserType = null;
    
    async function loadAllUsers(page = 1, userType = null) {
      try {
        currentUserPage = page;
        currentUserType = userType;
        
        const token = localStorage.getItem('wowcampus_token');
        if (!token) return;
        
        const search = document.getElementById('searchUsers')?.value || '';
        const status = document.getElementById('userStatusFilter')?.value || '';
        const typeFilter = document.getElementById('userTypeFilter')?.value || userType || '';
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(search && { search }),
          ...(status && { status }),
          ...(typeFilter && { user_type: typeFilter })
        });
        
        const response = await fetch(\`/api/admin/users?\${params}\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        
        console.log('API 응답 상태:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          url: response.url
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 오류 응답:', errorText);
          throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        
        const result = await response.json();
        console.log('API 응답 데이터:', result);
        
        if (result.success) {
          const tbody = document.getElementById('allUsersTableBody');
          if (!tbody) return;
          
          if (result.data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">사용자가 없습니다.</td></tr>';
            return;
          }
          
          tbody.innerHTML = result.data.users.map(user => \`
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    \${user.name.charAt(0).toUpperCase()}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">\${user.name}</div>
                    <div class="text-sm text-gray-500">\${user.email}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
                  user.user_type === 'jobseeker' ? 'bg-green-100 text-green-800' :
                  user.user_type === 'employer' ? 'bg-purple-100 text-purple-800' :
                  user.user_type === 'agent' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-gray-100 text-gray-800'
                }">
                  \${getUserTypeLabel(user.user_type)}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
                  user.status === 'approved' ? 'bg-green-100 text-green-800' :
                  user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  user.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }">
                  \${getStatusLabel(user.status)}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                \${new Date(user.created_at).toLocaleDateString('ko-KR')}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openEditUserModal('\${user.id}')" 
                        class="text-blue-600 hover:text-blue-900 mr-3">
                  <i class="fas fa-edit"></i> 수정
                </button>
              </td>
            </tr>
          \`).join('');
          
          // 페이지네이션 업데이트
          document.getElementById('totalUsersCount').textContent = result.data.total;
          updatePagination(result.data.total, result.data.page, result.data.limit);
        } else {
          const tbody = document.getElementById('allUsersTableBody');
          if (tbody) {
            tbody.innerHTML = \`<tr><td colspan="5" class="px-6 py-8 text-center text-red-500">오류: \${result.message || '데이터를 불러올 수 없습니다.'}</td></tr>\`;
          }
        }
      } catch (error) {
        console.error('사용자 로드 오류 상세:', {
          error,
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        const tbody = document.getElementById('allUsersTableBody');
        if (tbody) {
          tbody.innerHTML = \`
            <tr>
              <td colspan="5" class="px-6 py-8 text-center">
                <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-2"></i>
                <p class="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
                <p class="text-gray-500 text-sm mt-2">\${error.message || '알 수 없는 오류'}</p>
                <button onclick="loadAllUsers(currentUserPage, currentUserType)" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  다시 시도
                </button>
              </td>
            </tr>
          \`;
        }
      }
    }
    
    function updatePagination(total, currentPage, limit) {
      const totalPages = Math.ceil(total / limit);
      const container = document.getElementById('paginationButtons');
      if (!container) return;
      
      let html = '';
      
      // 이전 버튼
      if (currentPage > 1) {
        html += \`<button onclick="loadAllUsers(\${currentPage - 1}, currentUserType)" class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">이전</button>\`;
      }
      
      // 페이지 번호
      for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        html += \`<button onclick="loadAllUsers(\${i}, currentUserType)" class="px-3 py-2 \${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'} rounded-lg transition-colors">\${i}</button>\`;
      }
      
      // 다음 버튼
      if (currentPage < totalPages) {
        html += \`<button onclick="loadAllUsers(\${currentPage + 1}, currentUserType)" class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">다음</button>\`;
      }
      
      container.innerHTML = html;
    }
    
    // 사용자 수정 모달 열기
    async function openEditUserModal(userId) {
      try {
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(\`/api/admin/users/\${userId}\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        const result = await response.json();
        
        if (result.success) {
          const user = result.data.user;
          document.getElementById('editUserId').value = user.id;
          document.getElementById('editUserEmail').value = user.email;
          document.getElementById('editUserName').value = user.name;
          document.getElementById('editUserPhone').value = user.phone || '';
          document.getElementById('editUserType').value = getUserTypeLabel(user.user_type);
          document.getElementById('editUserStatus').value = user.status;
          
          // 임시 비밀번호 표시 숨기기
          document.getElementById('tempPasswordDisplay').classList.add('hidden');
          
          document.getElementById('editUserModal').classList.remove('hidden');
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        alert('사용자 정보를 불러오는데 실패했습니다.');
      }
    }
    
    // 사용자 수정 모달 닫기
    function closeEditUserModal() {
      document.getElementById('editUserModal').classList.add('hidden');
      document.getElementById('editUserForm').reset();
      document.getElementById('tempPasswordDisplay').classList.add('hidden');
    }
    
    // 임시 비밀번호 생성
    async function generateTempPassword() {
      const userId = document.getElementById('editUserId').value;
      if (!userId) return;
      
      if (!confirm('이 사용자의 임시 비밀번호를 생성하시겠습니까? 기존 비밀번호는 사용할 수 없게 됩니다.')) {
        return;
      }
      
      try {
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(\`/api/admin/users/\${userId}/reset-password\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        
        if (result.success) {
          document.getElementById('tempPasswordValue').value = result.data.tempPassword;
          document.getElementById('tempPasswordDisplay').classList.remove('hidden');
          alert(\`임시 비밀번호가 생성되었습니다: \${result.data.tempPassword}\n\n이 비밀번호를 반드시 사용자에게 안전하게 전달하세요.\`);
        } else {
          alert('임시 비밀번호 생성 실패: ' + result.message);
        }
      } catch (error) {
        console.error('임시 비밀번호 생성 오류:', error);
        alert('임시 비밀번호 생성 중 오류가 발생했습니다.');
      }
    }
    
    // 임시 비밀번호 복사
    function copyTempPassword() {
      const passwordInput = document.getElementById('tempPasswordValue');
      passwordInput.select();
      document.execCommand('copy');
      alert('임시 비밀번호가 클립보드에 복사되었습니다!');
    }
    
    // 사용자 정보 수정 폼 제출
    document.getElementById('editUserForm')?.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const userId = document.getElementById('editUserId').value;
      const name = document.getElementById('editUserName').value;
      const phone = document.getElementById('editUserPhone').value;
      const status = document.getElementById('editUserStatus').value;
      
      try {
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(\`/api/admin/users/\${userId}\`, {
          method: 'PUT',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, phone, status })
        });
        const result = await response.json();
        
        if (result.success) {
          alert('사용자 정보가 수정되었습니다.');
          closeEditUserModal();
          loadAllUsers(currentUserPage, currentUserType); // 목록 새로고침
          if (status === 'approved' || status === 'rejected') {
            loadPendingUsers(); // 대기 목록도 새로고침
          }
        } else {
          alert('수정 실패: ' + result.message);
        }
      } catch (error) {
        console.error('사용자 수정 오류:', error);
        alert('사용자 수정 중 오류가 발생했습니다.');
      }
    });
    
    // 헬퍼 함수들
    // 전역 함수로 노출
    window.loadPendingUsers = loadPendingUsers;
    window.approveUser = approveUser;
    window.rejectUser = rejectUser;
    window.loadAdminStatistics = loadAdminStatistics;
    window.switchUserTab = switchUserTab;
    window.loadAllUsers = loadAllUsers;
    window.openEditUserModal = openEditUserModal;
    window.closeEditUserModal = closeEditUserModal;
    window.generateTempPassword = generateTempPassword;
    window.copyTempPassword = copyTempPassword;
    window.getUserTypeLabel = getUserTypeLabel;
    window.getStatusLabel = getStatusLabel;



    
    // 페이지별 초기화
    if (window.location.pathname === '/study') {
      console.log('유학정보 페이지 - 협약대학교 데이터 로딩 예약');
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded - 협약대학교 컨테이너 확인');
        const container = document.getElementById('universitiesContainer');
        if (container) {
          console.log('협약대학교 컨테이너 발견 - 데이터 로딩 시작');
          loadPartnerUniversities();
        } else {
          console.warn('협약대학교 컨테이너를 찾을 수 없습니다');
        }
      });
      
      // 페이지가 이미 로드된 경우를 위한 즉시 실행
      setTimeout(() => {
        const container = document.getElementById('universitiesContainer');
        if (container && container.innerHTML === '') {
          console.log('페이지 로드 완료 후 협약대학교 데이터 로딩');
          loadPartnerUniversities();
        }
      }, 1000);
    }

    // 필터링 및 리셋 함수를 전역으로 노출
    window.filterUniversities = function() {
      console.log('필터 적용 중...');
      const regionFilter = document.getElementById('regionFilter');
      const majorFilter = document.getElementById('majorFilter');
      const degreeFilter = document.getElementById('degreeFilter');
      
      if (!regionFilter || !majorFilter || !degreeFilter) {
        console.error('필터 요소를 찾을 수 없습니다');
        return;
      }
      
      currentFilters = {
        region: regionFilter.value,
        major: majorFilter.value,
        degree: degreeFilter.value
      };
      
      console.log('적용된 필터:', currentFilters);
      loadPartnerUniversities();
    };

    window.resetFilters = function() {
      console.log('필터 초기화');
      const regionFilter = document.getElementById('regionFilter');
      const majorFilter = document.getElementById('majorFilter');
      const degreeFilter = document.getElementById('degreeFilter');
      
      if (regionFilter) regionFilter.value = 'all';
      if (majorFilter) majorFilter.value = 'all';
      if (degreeFilter) degreeFilter.value = 'all';
      
      currentFilters = { region: 'all', major: 'all', degree: 'all' };
      loadPartnerUniversities();
    };

    window.showUniversityDetail = function(universityId) {
      console.log('대학교 상세보기:', universityId);
      showUniversityModal(universityId);
    };

    console.log('📱 WOW-CAMPUS JavaScript 로드 완료 (프로필 기능 + 구직자 페이지 기능 + 협약대학교 기능 + 관리자 기능 포함)');
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

// CORS for API routes
app.use('/api/*', apiCors)

// 🌍 공개 API: 에이전트 목록 조회 (회원가입용) - MUST be before /api/agents route
app.get('/api/public/agents', async (c) => {
  try {
    // Get all active agents with their basic info
    const agentsQuery = `
      SELECT 
        a.id,
        a.agency_name,
        a.primary_regions,
        a.experience_years,
        u.name as user_name,
        u.email
      FROM agents a
      INNER JOIN users u ON a.user_id = u.id
      WHERE u.status = 'approved'
      ORDER BY a.agency_name ASC
    `;

    const result = await c.env.DB.prepare(agentsQuery).all();
    
    // Parse JSON fields
    const agents = (result.results || []).map((agent: any) => ({
      id: agent.id,
      agency_name: agent.agency_name,
      user_name: agent.user_name,
      primary_regions: agent.primary_regions ? JSON.parse(agent.primary_regions as string) : [],
      experience_years: agent.experience_years
    }));

    return c.json({
      success: true,
      agents
    });
  } catch (error) {
    console.error('Error fetching agents list:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch agents list' 
    }, 500);
  }
})

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/jobs', jobRoutes)
app.route('/api/jobseekers', jobseekersRoutes)
app.route('/api/agents', agentsRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/contact', contactRoutes)
app.route('/api/matching', matching)

// 🎨 프로필 업데이트 API (POST)
app.post('/api/profile/jobseeker', authMiddleware, async (c) => {
  console.log('=== POST /api/profile/jobseeker 요청 받음 ===');
  
  const user = c.get('user');
  console.log('인증된 사용자:', user);
  
  if (!user || user.user_type !== 'jobseeker') {
    console.error('권한 없음:', { user, user_type: user?.user_type });
    return c.json({ success: false, message: '구직자만 프로필을 수정할 수 있습니다.' }, 403);
  }

  let body: any = null;
  try {
    body = await c.req.json();
    console.log('받은 데이터:', JSON.stringify(body, null, 2));
    
    // 데이터 검증 및 정리
    const cleanData = {
      first_name: body.first_name || '',
      last_name: body.last_name || '',
      nationality: body.nationality || null,
      bio: body.bio || null,
      experience_years: body.experience_years ? parseInt(body.experience_years) : 0,
      education_level: body.education_level || null,
      visa_status: body.visa_status || null,
      skills: body.skills || null,
      preferred_location: body.preferred_location || null,
      salary_expectation: body.salary_expectation ? parseInt(body.salary_expectation) : null,
      korean_level: body.korean_level || null,
      available_start_date: body.available_start_date || null
    };
    
    console.log('정리된 데이터:', JSON.stringify(cleanData, null, 2));
    
    // 먼저 기존 jobseeker 레코드 확인
    const existingJobseeker = await c.env.DB.prepare(`
      SELECT id FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();
    
    if (existingJobseeker) {
      // 기존 레코드 업데이트
      await c.env.DB.prepare(`
        UPDATE jobseekers SET
          first_name = ?,
          last_name = ?,
          nationality = ?,
          bio = ?,
          experience_years = ?,
          education_level = ?,
          visa_status = ?,
          skills = ?,
          preferred_location = ?,
          salary_expectation = ?,
          korean_level = ?,
          available_start_date = ?,
          updated_at = datetime('now')
        WHERE user_id = ?
      `).bind(
        cleanData.first_name,
        cleanData.last_name,
        cleanData.nationality,
        cleanData.bio,
        cleanData.experience_years,
        cleanData.education_level,
        cleanData.visa_status,
        cleanData.skills,
        cleanData.preferred_location,
        cleanData.salary_expectation,
        cleanData.korean_level,
        cleanData.available_start_date,
        user.id
      ).run();
    } else {
      // 새 레코드 생성
      await c.env.DB.prepare(`
        INSERT INTO jobseekers (
          user_id, first_name, last_name, nationality, bio,
          experience_years, education_level, visa_status, skills, 
          preferred_location, salary_expectation, korean_level,
          available_start_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        user.id,
        cleanData.first_name,
        cleanData.last_name,
        cleanData.nationality,
        cleanData.bio,
        cleanData.experience_years,
        cleanData.education_level,
        cleanData.visa_status,
        cleanData.skills,
        cleanData.preferred_location,
        cleanData.salary_expectation,
        cleanData.korean_level,
        cleanData.available_start_date
      ).run();
    }
    
    // users 테이블의 이름도 업데이트
    if (cleanData.first_name || cleanData.last_name) {
      const fullName = `${cleanData.first_name} ${cleanData.last_name}`.trim();
      if (fullName) {
        await c.env.DB.prepare(`
          UPDATE users SET name = ? WHERE id = ?
        `).bind(fullName, user.id).run();
        console.log('users 테이블 이름 업데이트 완료:', fullName);
      }
    }
    
    console.log('프로필 업데이트 성공!');
    return c.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
    });
    
  } catch (error) {
    console.error('=== POST 백엔드 프로필 업데이트 오류 ===');
    console.error('사용자 ID:', user?.id);
    console.error('요청 본문:', body);
    console.error('에러 상세:', error);
    console.error('에러 스택:', error instanceof Error ? error.stack : 'N/A');
    
    return c.json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

// 🎨 프로필 업데이트 API (PUT - 기존 호환성)
app.put('/api/profile/update', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    return c.json({ success: false, message: '구직자만 프로필을 수정할 수 있습니다.' }, 403);
  }

  try {
    const body = await c.req.json();
    
    // 먼저 기존 jobseeker 레코드 확인
    const existingJobseeker = await c.env.DB.prepare(`
      SELECT id FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();
    
    if (existingJobseeker) {
      // 기존 레코드 업데이트
      await c.env.DB.prepare(`
        UPDATE jobseekers SET
          name = ?,
          phone = ?,
          nationality = ?,
          bio = ?,
          field = ?,
          experience_years = ?,
          education = ?,
          visa_type = ?,
          skills = ?,
          preferred_location = ?,
          desired_salary = ?,
          korean_level = ?,
          job_status = ?,
          updated_at = datetime('now')
        WHERE user_id = ?
      `).bind(
        body.name || user.name,
        body.phone || null,
        body.nationality || null,
        body.bio || null,
        body.field || null,
        parseInt(body.experience_years) || 0,
        body.education || null,
        body.visa_type || null,
        body.skills || null,
        body.preferred_location || null,
        parseInt(body.desired_salary) || null,
        body.korean_level || null,
        body.job_status || '구직중',
        user.id
      ).run();
    } else {
      // 새 레코드 생성
      await c.env.DB.prepare(`
        INSERT INTO jobseekers (
          user_id, name, phone, nationality, bio, field, 
          experience_years, education, visa_type, skills, 
          preferred_location, desired_salary, korean_level, job_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        user.id,
        body.name || user.name,
        body.phone || null,
        body.nationality || null,
        body.bio || null,
        body.field || null,
        parseInt(body.experience_years) || 0,
        body.education || null,
        body.visa_type || null,
        body.skills || null,
        body.preferred_location || null,
        parseInt(body.desired_salary) || null,
        body.korean_level || null,
        body.job_status || '구직중'
      ).run();
    }
    
    // users 테이블의 이름도 업데이트
    if (body.name && body.name !== user.name) {
      await c.env.DB.prepare(`
        UPDATE users SET name = ? WHERE id = ?
      `).bind(body.name, user.id).run();
    }
    
    return c.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
    });
    
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return c.json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==================== 문서 관리 API ====================

// 문서 업로드 API
app.post('/api/documents/upload', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    return c.json({ success: false, message: '구직자만 문서를 업로드할 수 있습니다.' }, 403);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const description = formData.get('description') as string || '';

    if (!file) {
      return c.json({ success: false, message: '파일이 제공되지 않았습니다.' }, 400);
    }

    // 파일 크기 제한 (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return c.json({ success: false, message: '파일 크기는 10MB를 초과할 수 없습니다.' }, 400);
    }

    // 허용된 MIME 타입 체크
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return c.json({ 
        success: false, 
        message: '허용되지 않는 파일 형식입니다. PDF, Word, 이미지 파일만 업로드 가능합니다.' 
      }, 400);
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const storageFileName = `${timestamp}_${randomStr}.${fileExt}`;

    // 파일 데이터 읽기
    const fileBuffer = await file.arrayBuffer();
    
    // R2 버킷 사용 가능 여부 확인
    let result;
    if (c.env.DOCUMENTS_BUCKET) {
      // R2 스토리지 사용
      const storageKey = `documents/${user.id}/${storageFileName}`;
      
      await c.env.DOCUMENTS_BUCKET.put(storageKey, fileBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          originalName: file.name,
          uploadedBy: user.id.toString(),
          uploadDate: new Date().toISOString(),
        },
      });

      // 데이터베이스에 메타데이터 저장 (R2 사용 시)
      result = await c.env.DB.prepare(`
        INSERT INTO documents (
          user_id, document_type, file_name, original_name, 
          file_size, mime_type, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        documentType,
        storageFileName,
        file.name,
        file.size,
        file.type,
        description
      ).run();
    } else {
      // Base64로 데이터베이스에 저장 (R2 없을 때)
      const base64Data = Buffer.from(fileBuffer).toString('base64');
      
      result = await c.env.DB.prepare(`
        INSERT INTO documents (
          user_id, document_type, file_name, original_name, 
          file_size, mime_type, file_data, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        documentType,
        storageFileName,
        file.name,
        file.size,
        file.type,
        base64Data,
        description
      ).run();
    }

    return c.json({
      success: true,
      message: '문서가 성공적으로 업로드되었습니다.',
      document: {
        id: result.meta.last_row_id,
        fileName: file.name,
        fileSize: file.size,
        documentType: documentType,
        uploadDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('문서 업로드 오류:', error);
    return c.json({
      success: false,
      message: '문서 업로드 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 문서 목록 조회 API
app.get('/api/documents', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403);
  }

  try {
    const documents = await c.env.DB.prepare(`
      SELECT 
        id, document_type, file_name, original_name, 
        file_size, mime_type, upload_date, description, is_active
      FROM documents
      WHERE user_id = ? AND is_active = 1
      ORDER BY upload_date DESC
    `).bind(user.id).all();

    return c.json({
      success: true,
      documents: documents.results || []
    });

  } catch (error) {
    console.error('문서 목록 조회 오류:', error);
    return c.json({
      success: false,
      message: '문서 목록 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 문서 다운로드 API
app.get('/api/documents/:id/download', authMiddleware, async (c) => {
  const user = c.get('user');
  const documentId = c.req.param('id');
  
  if (!user || user.user_type !== 'jobseeker') {
    return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403);
  }

  try {
    // 문서 정보 조회
    const document = await c.env.DB.prepare(`
      SELECT * FROM documents 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `).bind(documentId, user.id).first();

    if (!document) {
      return c.json({ success: false, message: '문서를 찾을 수 없습니다.' }, 404);
    }

    // R2 또는 Base64에서 파일 가져오기
    let fileData;
    
    if (document.file_data) {
      // Base64에서 파일 가져오기
      const base64Data = document.file_data as string;
      const buffer = Buffer.from(base64Data, 'base64');
      fileData = buffer;
    } else if (c.env.DOCUMENTS_BUCKET && document.file_name) {
      // R2에서 파일 가져오기
      const storageKey = `documents/${user.id}/${document.file_name}`;
      const file = await c.env.DOCUMENTS_BUCKET.get(storageKey);
      
      if (!file) {
        return c.json({ success: false, message: '파일을 찾을 수 없습니다.' }, 404);
      }
      
      fileData = await file.arrayBuffer();
    } else {
      return c.json({ 
        success: false, 
        message: '파일 데이터를 찾을 수 없습니다.' 
      }, 404);
    }

    // 파일 다운로드 응답
    return new Response(fileData, {
      headers: {
        'Content-Type': document.mime_type as string,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(document.original_name as string)}"`,
        'Content-Length': document.file_size?.toString() || '0',
      },
    });

  } catch (error) {
    console.error('문서 다운로드 오류:', error);
    return c.json({
      success: false,
      message: '문서 다운로드 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 문서 삭제 API (소프트 삭제)
app.delete('/api/documents/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const documentId = c.req.param('id');
  
  if (!user || user.user_type !== 'jobseeker') {
    return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403);
  }

  try {
    // 문서 소유권 확인
    const document = await c.env.DB.prepare(`
      SELECT id FROM documents 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `).bind(documentId, user.id).first();

    if (!document) {
      return c.json({ success: false, message: '문서를 찾을 수 없습니다.' }, 404);
    }

    // 소프트 삭제 (is_active = 0)
    await c.env.DB.prepare(`
      UPDATE documents 
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).bind(documentId, user.id).run();

    return c.json({
      success: true,
      message: '문서가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('문서 삭제 오류:', error);
    return c.json({
      success: false,
      message: '문서 삭제 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==================== 끝: 문서 관리 API ====================

// 구직자 대시보드 API
app.get('/api/dashboard/jobseeker', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403);
  }

  try {
    // 구직자 ID 조회
    const jobseeker = await c.env.DB.prepare(`
      SELECT id FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();

    if (!jobseeker) {
      return c.json({ success: false, message: '구직자 프로필을 찾을 수 없습니다.' }, 404);
    }

    // 대시보드 데이터 조회
    const [applicationsCount, interviewCount, recentApplications] = await Promise.all([
      // 지원한 공고 수
      c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications WHERE jobseeker_id = ?
      `).bind(jobseeker.id).first(),
      
      // 면접 제안 수
      c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications 
        WHERE jobseeker_id = ? AND status = 'interview'
      `).bind(jobseeker.id).first(),
      
      // 최근 지원 현황
      c.env.DB.prepare(`
        SELECT 
          a.id,
          a.status,
          a.applied_at,
          j.title as job_title,
          j.location,
          c.company_name
        FROM applications a
        JOIN job_postings j ON a.job_posting_id = j.id
        JOIN companies c ON j.company_id = c.id  
        WHERE a.jobseeker_id = ?
        ORDER BY a.applied_at DESC
        LIMIT 5
      `).bind(jobseeker.id).all()
    ]);

    return c.json({
      success: true,
      data: {
        applications_count: applicationsCount?.count || 0,
        profile_views: 87, // 추후 구현
        interview_offers: interviewCount?.count || 0, 
        rating: 4.8, // 추후 구현
        recent_applications: recentApplications.results || []
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return c.json({ success: false, message: '대시보드 데이터 조회 실패' }, 500);
  }
});

// Additional API endpoints for frontend functionality - 관리자 전용 API
app.get('/api/statistics', optionalAuth, requireAdmin, (c) => {
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

// Partner Universities API - 협약대학교 관리
// 협약대학교 목록 조회 (필터링 지원)
app.get('/api/partner-universities', async (c) => {
  try {
    const db = c.env.DB;
    const region = c.req.query('region');
    const major = c.req.query('major');
    const degree = c.req.query('degree');
    
    // 데이터베이스에서 대학교 목록 조회
    let query = 'SELECT * FROM universities';
    const conditions = [];
    const params = [];
    
    if (region && region !== 'all') {
      conditions.push('region = ?');
      params.push(region);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY name';
    
    const result = await db.prepare(query).bind(...params).all();
    
    // 데이터 변환 (DB 컬럼명을 camelCase로 변환)
    let universities = result.results.map((uni: any) => ({
      id: uni.id,
      name: uni.name,
      englishName: uni.english_name,
      region: uni.region,
      address: uni.address,
      logo: `https://via.placeholder.com/120x120/1f2937/ffffff?text=${encodeURIComponent(uni.name.charAt(0))}`,
      website: uni.website,
      establishedYear: uni.established_year,
      contactEmail: uni.contact_email,
      contactPhone: uni.contact_phone,
      
      // 모집 과정
      languageCourse: Boolean(uni.language_course),
      undergraduateCourse: Boolean(uni.undergraduate_course),
      graduateCourse: Boolean(uni.graduate_course),
      
      // 학비 및 장학금
      tuitionFee: uni.tuition_fee,
      dormitoryFee: uni.dormitory_fee,
      scholarships: uni.scholarships,
      
      // 지원 요건
      koreanRequirement: uni.korean_requirement,
      englishRequirement: uni.english_requirement,
      admissionRequirement: uni.admission_requirement,
      
      // 편의시설 및 지원
      dormitory: Boolean(uni.dormitory),
      airportPickup: Boolean(uni.airport_pickup),
      buddyProgram: Boolean(uni.buddy_program),
      koreanLanguageSupport: Boolean(uni.korean_language_support),
      careerSupport: Boolean(uni.career_support),
      partTimeWork: Boolean(uni.part_time_work),
      
      // 학생 정보
      studentCount: uni.student_count,
      foreignStudentCount: uni.foreign_student_count,
      
      // 대학 소개
      description: uni.description,
      features: uni.features ? uni.features.split(',').map((f: string) => f.trim()) : [],
      majors: uni.majors ? uni.majors.split(',').map((m: string) => m.trim()) : [],
      
      // 모집 일정
      springAdmission: uni.spring_admission,
      fallAdmission: uni.fall_admission,
      
      // 협력 정보
      partnershipType: uni.partnership_type,
      
      // 호환성을 위한 기존 필드
      ranking: uni.ranking || 0,
      degrees: []
    }));
    
    // 클라이언트 측 필터링 (major, degree)
    if (major && major !== 'all') {
      universities = universities.filter((uni: any) => 
        uni.majors.some((m: string) => m.includes(major))
      );
    }
    
    if (degree && degree !== 'all') {
      universities = universities.filter((uni: any) => {
        if (degree === '어학연수') {
          return uni.languageCourse;
        } else if (degree === '학부') {
          return uni.undergraduateCourse;
        } else if (degree === '대학원') {
          return uni.graduateCourse;
        }
        return true;
      });
    }
    
    return c.json({
      success: true,
      universities: universities
    });
  } catch (error) {
    console.error('University list error:', error);
    // 에러 발생 시 샘플 데이터 반환
    let universities = [
    {
      id: 1,
      name: "서울대학교",
      englishName: "Seoul National University",
      region: "서울",
      logo: "https://via.placeholder.com/120x120/1f2937/ffffff?text=SNU",
      website: "https://www.snu.ac.kr",
      ranking: 1,
      majors: ["공학", "자연과학", "인문학", "사회과학", "의학"],
      degrees: ["학부", "대학원"],
      description: "대한민국 최고의 국립종합대학교로 모든 학문 분야에서 세계적 수준의 교육과 연구를 제공합니다.",
      features: ["QS 세계대학랭킹 29위", "노벨상 수상자 배출", "전액장학금 제공", "영어강의 40% 이상"],
      establishedYear: 1946,
      studentCount: 28000,
      foreignStudentCount: 4200,
      tuitionFee: "학기당 300-500만원",
      scholarships: ["GKS 정부장학생", "성적우수장학금", "외국인특별장학금"],
      dormitory: true,
      partnershipType: "교환학생 및 복수학위",
      contactEmail: "international@snu.ac.kr",
      contactPhone: "+82-2-880-5114"
    },
    {
      id: 2,
      name: "연세대학교",
      englishName: "Yonsei University", 
      region: "서울",
      logo: "https://via.placeholder.com/120x120/003d82/ffffff?text=YU",
      website: "https://www.yonsei.ac.kr",
      ranking: 2,
      majors: ["경영학", "공학", "의학", "국제학", "자연과학"],
      degrees: ["학부", "대학원"],
      description: "1885년 설립된 대한민국 최초의 현대식 고등교육기관으로 국제화 교육의 선두주자입니다.",
      features: ["QS 세계대학랭킹 76위", "언더우드국제대학 운영", "100% 영어강의", "글로벌 네트워크"],
      establishedYear: 1885,
      studentCount: 38000,
      foreignStudentCount: 6800,
      tuitionFee: "학기당 400-600만원",
      scholarships: ["연세장학금", "국제학생장학금", "성적장학금"],
      dormitory: true,
      partnershipType: "복수학위 및 교환학생",
      contactEmail: "oia@yonsei.ac.kr",
      contactPhone: "+82-2-2123-3927"
    },
    {
      id: 3,
      name: "고려대학교",
      englishName: "Korea University",
      region: "서울", 
      logo: "https://via.placeholder.com/120x120/8b0000/ffffff?text=KU",
      website: "https://www.korea.ac.kr",
      ranking: 3,
      majors: ["경영학", "법학", "공학", "정치외교학", "언론정보학"],
      degrees: ["학부", "대학원"],
      description: "1905년 개교한 사립종합대학교로 자유정신과 실학이념을 바탕으로 창의적 인재를 양성합니다.",
      features: ["QS 세계대학랭킹 79위", "KUBS 경영대학 세계적 명성", "강력한 동문네트워크", "취업률 전국 1위"],
      establishedYear: 1905,
      studentCount: 37000,
      foreignStudentCount: 5100,
      tuitionFee: "학기당 350-550만원", 
      scholarships: ["고려장학금", "외국인우수학생장학금", "교환학생장학금"],
      dormitory: true,
      partnershipType: "학점교환 및 복수학위",
      contactEmail: "intl@korea.ac.kr",
      contactPhone: "+82-2-3290-1152"
    },
    {
      id: 4,
      name: "KAIST",
      englishName: "Korea Advanced Institute of Science and Technology",
      region: "대전",
      logo: "https://via.placeholder.com/120x120/0066cc/ffffff?text=KAIST",
      website: "https://www.kaist.ac.kr", 
      ranking: 4,
      majors: ["전자공학", "컴퓨터과학", "기계공학", "화학공학", "바이오공학"],
      degrees: ["학부", "대학원"],
      description: "과학기술 분야 세계 최고 수준의 연구중심대학으로 혁신적인 기술개발을 선도합니다.",
      features: ["QS 세계대학랭킹 공학분야 12위", "전액장학금 지원", "100% 영어강의", "창업 인큐베이팅"],
      establishedYear: 1971,
      studentCount: 10000,
      foreignStudentCount: 2800,
      tuitionFee: "전액장학금 지원",
      scholarships: ["KAIST 장학금", "연구조교 지원", "정부장학금"],
      dormitory: true,
      partnershipType: "연구협력 및 교환학생",
      contactEmail: "iao@kaist.ac.kr", 
      contactPhone: "+82-42-350-2351"
    },
    {
      id: 5,
      name: "성균관대학교",
      englishName: "Sungkyunkwan University",
      region: "경기",
      logo: "https://via.placeholder.com/120x120/004225/ffffff?text=SKKU",
      website: "https://www.skku.ac.kr",
      ranking: 5,
      majors: ["경영학", "공학", "의학", "인문학", "자연과학"],
      degrees: ["학부", "대학원"],
      description: "620여 년의 전통을 자랑하는 명문대학으로 현대적 교육과 전통의 조화를 추구합니다.",
      features: ["QS 세계대학랭킹 88위", "삼성과의 산학협력", "글로벌 프로그램", "우수한 취업률"],
      establishedYear: 1398,
      studentCount: 32000,
      foreignStudentCount: 4500,
      tuitionFee: "학기당 400-650만원",
      scholarships: ["성균관장학금", "글로벌장학금", "성적우수장학금"],
      dormitory: true,
      partnershipType: "교환학생 및 어학연수",
      contactEmail: "intl@skku.edu",
      contactPhone: "+82-31-299-4114"
    },
    {
      id: 6,
      name: "부산대학교", 
      englishName: "Pusan National University",
      region: "부산",
      logo: "https://via.placeholder.com/120x120/2c5aa0/ffffff?text=PNU",
      website: "https://www.pusan.ac.kr",
      ranking: 6,
      majors: ["해양학", "공학", "의학", "경영학", "인문학"],
      degrees: ["학부", "대학원"],
      description: "영남지역 거점 국립대학교로 해양과학과 조선해양공학 분야에서 특화된 교육을 제공합니다.",
      features: ["해양과학 분야 국내 1위", "저렴한 등록금", "우수한 연구환경", "국제교류 활발"],
      establishedYear: 1946,
      studentCount: 26000,
      foreignStudentCount: 2100,
      tuitionFee: "학기당 200-400만원",
      scholarships: ["국가장학금", "외국인장학금", "성적장학금"],
      dormitory: true,
      partnershipType: "교환학생",
      contactEmail: "oia@pusan.ac.kr",
      contactPhone: "+82-51-510-1286"
    }
    ];
    
    // 필터링 적용
    if (region && region !== 'all') {
      universities = universities.filter(uni => uni.region === region);
    }
    
    if (major && major !== 'all') {
      universities = universities.filter(uni => uni.majors.includes(major));
    }
    
    return c.json({
      success: true,
      universities: universities
    });
  }
});

// 협약대학교 추가 (관리자 전용)
app.post('/api/partner-universities', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const data = await c.req.json();
    
    // 데이터베이스에 저장
    const result = await db.prepare(`
      INSERT INTO universities (
        name, english_name, region, address, website, established_year,
        contact_email, contact_phone,
        language_course, undergraduate_course, graduate_course,
        tuition_fee, dormitory_fee, scholarships,
        korean_requirement, english_requirement, admission_requirement,
        dormitory, airport_pickup, buddy_program, korean_language_support,
        career_support, part_time_work,
        student_count, foreign_student_count,
        description, features, majors,
        spring_admission, fall_admission,
        partnership_type, ranking,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        datetime('now'), datetime('now')
      )
    `).bind(
      data.name,
      data.englishName,
      data.region,
      data.address || '',
      data.website,
      data.establishedYear || new Date().getFullYear(),
      data.contactEmail || '',
      data.contactPhone || '',
      data.languageCourse ? 1 : 0,
      data.undergraduateCourse ? 1 : 0,
      data.graduateCourse ? 1 : 0,
      data.tuitionFee || '',
      data.dormitoryFee || '',
      data.scholarships || '',
      data.koreanRequirement || '',
      data.englishRequirement || '',
      data.admissionRequirement || '',
      data.dormitory ? 1 : 0,
      data.airportPickup ? 1 : 0,
      data.buddyProgram ? 1 : 0,
      data.koreanLanguageSupport ? 1 : 0,
      data.careerSupport ? 1 : 0,
      data.partTimeWork ? 1 : 0,
      data.studentCount || 0,
      data.foreignStudentCount || 0,
      data.description || '',
      Array.isArray(data.features) ? data.features.join(', ') : '',
      Array.isArray(data.majors) ? data.majors.join(', ') : '',
      data.springAdmission || '',
      data.fallAdmission || '',
      data.partnershipType || '교환학생',
      data.ranking || 0
    ).run();
    
    return c.json({
      success: true,
      message: "협약대학교가 성공적으로 추가되었습니다.",
      data: {
        id: result.meta.last_row_id,
        ...data
      }
    });
  } catch (error) {
    console.error('University creation error:', error);
    return c.json({
      success: false,
      message: "협약대학교 추가 중 오류가 발생했습니다."
    }, 500);
  }
});

// 협약대학교 삭제 (관리자 전용)
app.delete('/api/partner-universities/:id', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    await db.prepare('DELETE FROM universities WHERE id = ?').bind(id).run();
    
    return c.json({
      success: true,
      message: `협약대학교가 삭제되었습니다.`
    });
  } catch (error) {
    console.error('University deletion error:', error);
    return c.json({
      success: false,
      message: "협약대학교 삭제 중 오류가 발생했습니다."
    }, 500);
  }
});

// 협약대학교 수정 (관리자 전용)  
app.put('/api/partner-universities/:id', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const data = await c.req.json();
    
    await db.prepare(`
      UPDATE universities SET
        name = ?,
        english_name = ?,
        region = ?,
        address = ?,
        website = ?,
        established_year = ?,
        contact_email = ?,
        contact_phone = ?,
        language_course = ?,
        undergraduate_course = ?,
        graduate_course = ?,
        tuition_fee = ?,
        dormitory_fee = ?,
        scholarships = ?,
        korean_requirement = ?,
        english_requirement = ?,
        admission_requirement = ?,
        dormitory = ?,
        airport_pickup = ?,
        buddy_program = ?,
        korean_language_support = ?,
        career_support = ?,
        part_time_work = ?,
        student_count = ?,
        foreign_student_count = ?,
        description = ?,
        features = ?,
        majors = ?,
        spring_admission = ?,
        fall_admission = ?,
        partnership_type = ?,
        ranking = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.name,
      data.englishName,
      data.region,
      data.address || '',
      data.website,
      data.establishedYear || new Date().getFullYear(),
      data.contactEmail || '',
      data.contactPhone || '',
      data.languageCourse ? 1 : 0,
      data.undergraduateCourse ? 1 : 0,
      data.graduateCourse ? 1 : 0,
      data.tuitionFee || '',
      data.dormitoryFee || '',
      data.scholarships || '',
      data.koreanRequirement || '',
      data.englishRequirement || '',
      data.admissionRequirement || '',
      data.dormitory ? 1 : 0,
      data.airportPickup ? 1 : 0,
      data.buddyProgram ? 1 : 0,
      data.koreanLanguageSupport ? 1 : 0,
      data.careerSupport ? 1 : 0,
      data.partTimeWork ? 1 : 0,
      data.studentCount || 0,
      data.foreignStudentCount || 0,
      data.description || '',
      Array.isArray(data.features) ? data.features.join(', ') : '',
      Array.isArray(data.majors) ? data.majors.join(', ') : '',
      data.springAdmission || '',
      data.fallAdmission || '',
      data.partnershipType || '교환학생',
      data.ranking || 0,
      id
    ).run();
    
    return c.json({
      success: true,
      message: `협약대학교가 수정되었습니다.`,
      data: {
        id: parseInt(id),
        ...data
      }
    });
  } catch (error) {
    console.error('University update error:', error);
    return c.json({
      success: false,
      message: "협약대학교 수정 중 오류가 발생했습니다."
    }, 500);
  }
});

// Agents API - 에이전트 관리
// 에이전트 목록 조회 (필터링 지원)
app.get('/api/agents', async (c) => {
  try {
    const db = c.env.DB;
    const region = c.req.query('region');
    const specialization = c.req.query('specialization');
    const status = c.req.query('status');
    
    // users 테이블과 agents 테이블 조인하여 조회
    let query = `
      SELECT 
        a.*,
        u.email,
        u.name as contact_name,
        u.phone,
        u.status as approval_status,
        u.created_at as registered_at
      FROM agents a
      JOIN users u ON a.user_id = u.id
      WHERE u.user_type = 'agent'
    `;
    const conditions = [];
    const params = [];
    
    if (status && status !== 'all') {
      conditions.push('u.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const result = await db.prepare(query).bind(...params).all();
    
    // 데이터 변환
    let agents = result.results.map((agent: any) => ({
      id: agent.id,
      userId: agent.user_id,
      agencyName: agent.agency_name,
      contactName: agent.contact_name,
      email: agent.email,
      phone: agent.phone,
      licenseNumber: agent.license_number,
      specialization: agent.specialization ? JSON.parse(agent.specialization) : [],
      commissionRate: agent.commission_rate,
      countriesCovered: agent.countries_covered ? JSON.parse(agent.countries_covered) : [],
      languages: agent.languages ? JSON.parse(agent.languages) : [],
      experienceYears: agent.experience_years,
      totalPlacements: agent.total_placements,
      successRate: agent.success_rate,
      approvalStatus: agent.approval_status,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
      registeredAt: agent.registered_at
    }));
    
    // 클라이언트 측 필터링 (specialization)
    if (specialization && specialization !== 'all') {
      agents = agents.filter((agent: any) => 
        agent.specialization.includes(specialization)
      );
    }
    
    return c.json({
      success: true,
      agents: agents
    });
  } catch (error) {
    console.error('Agents fetch error:', error);
    return c.json({
      success: false,
      message: '에이전트 목록을 불러오는데 실패했습니다.',
      agents: []
    }, 500);
  }
});

// 에이전트 추가 (관리자 전용)
app.post('/api/agents', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const data = await c.req.json();
    
    // 먼저 users 테이블에 사용자 생성
    const userResult = await db.prepare(`
      INSERT INTO users (
        email, password_hash, user_type, status, name, phone, created_at, updated_at
      ) VALUES (?, ?, 'agent', 'approved', ?, ?, datetime('now'), datetime('now'))
    `).bind(
      data.email,
      'temp_password_hash', // 임시 비밀번호 (추후 이메일로 변경 링크 발송)
      data.contactName,
      data.phone || ''
    ).run();
    
    const userId = userResult.meta.last_row_id;
    
    // agents 테이블에 상세 정보 저장
    const agentResult = await db.prepare(`
      INSERT INTO agents (
        user_id, agency_name, license_number, specialization,
        commission_rate, countries_covered, languages,
        experience_years, total_placements, success_rate,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      userId,
      data.agencyName,
      data.licenseNumber || '',
      JSON.stringify(data.specialization || []),
      data.commissionRate || 10.0,
      JSON.stringify(data.countriesCovered || []),
      JSON.stringify(data.languages || []),
      data.experienceYears || 0,
      data.totalPlacements || 0,
      data.successRate || 0.0
    ).run();
    
    return c.json({
      success: true,
      message: "에이전트가 성공적으로 추가되었습니다.",
      data: {
        id: agentResult.meta.last_row_id,
        userId: userId,
        ...data
      }
    });
  } catch (error) {
    console.error('Agent creation error:', error);
    return c.json({
      success: false,
      message: "에이전트 추가 중 오류가 발생했습니다."
    }, 500);
  }
});

// 에이전트 삭제 (관리자 전용)
app.delete('/api/agents/:id', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // agents 테이블에서 user_id 조회
    const agent = await db.prepare('SELECT user_id FROM agents WHERE id = ?').bind(id).first();
    
    if (agent) {
      // users 테이블에서 삭제 (CASCADE로 agents도 자동 삭제)
      await db.prepare('DELETE FROM users WHERE id = ?').bind(agent.user_id).run();
    }
    
    return c.json({
      success: true,
      message: `에이전트가 삭제되었습니다.`
    });
  } catch (error) {
    console.error('Agent deletion error:', error);
    return c.json({
      success: false,
      message: "에이전트 삭제 중 오류가 발생했습니다."
    }, 500);
  }
});

// 에이전트 수정 (관리자 전용)
app.put('/api/agents/:id', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const data = await c.req.json();
    
    // agents 테이블에서 user_id 조회
    const agent = await db.prepare('SELECT user_id FROM agents WHERE id = ?').bind(id).first();
    
    if (!agent) {
      return c.json({
        success: false,
        message: "에이전트를 찾을 수 없습니다."
      }, 404);
    }
    
    // users 테이블 업데이트
    await db.prepare(`
      UPDATE users SET
        name = ?,
        email = ?,
        phone = ?,
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.contactName,
      data.email,
      data.phone || '',
      data.approvalStatus || 'approved',
      agent.user_id
    ).run();
    
    // agents 테이블 업데이트
    await db.prepare(`
      UPDATE agents SET
        agency_name = ?,
        license_number = ?,
        specialization = ?,
        commission_rate = ?,
        countries_covered = ?,
        languages = ?,
        experience_years = ?,
        total_placements = ?,
        success_rate = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.agencyName,
      data.licenseNumber || '',
      JSON.stringify(data.specialization || []),
      data.commissionRate || 10.0,
      JSON.stringify(data.countriesCovered || []),
      JSON.stringify(data.languages || []),
      data.experienceYears || 0,
      data.totalPlacements || 0,
      data.successRate || 0.0,
      id
    ).run();
    
    return c.json({
      success: true,
      message: `에이전트가 수정되었습니다.`,
      data: {
        id: parseInt(id),
        ...data
      }
    });
  } catch (error) {
    console.error('Agent update error:', error);
    return c.json({
      success: false,
      message: "에이전트 수정 중 오류가 발생했습니다."
    }, 500);
  }
});

// Admin Stats Detail APIs - 관리자 통계 상세 API
// 구인정보 통계 상세
app.get('/api/admin/jobs/stats', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    
    // 상태별 집계
    const stats = await db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM job_postings
      GROUP BY status
    `).all();
    
    const statsMap = stats.results.reduce((acc: any, row: any) => {
      acc[row.status] = row.count;
      return acc;
    }, {});
    
    // 최근 공고 조회
    const recentJobs = await db.prepare(`
      SELECT 
        j.id,
        j.title,
        j.location,
        j.status,
        j.created_at,
        c.company_name as company
      FROM job_postings j
      LEFT JOIN companies c ON j.company_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 10
    `).all();
    
    return c.json({
      success: true,
      active: statsMap.active || 0,
      pending: statsMap.draft || 0,
      closed: statsMap.closed || 0,
      recentJobs: recentJobs.results
    });
  } catch (error) {
    console.error('Jobs stats error:', error);
    return c.json({
      success: false,
      active: 0,
      pending: 0,
      closed: 0,
      recentJobs: []
    }, 500);
  }
});

// 구직자 통계 상세
app.get('/api/admin/jobseekers/stats', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    
    // 상태별 구직자 집계
    const activeCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE user_type = 'jobseeker' AND status = 'approved'
    `).first();
    
    const pendingCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE user_type = 'jobseeker' AND status = 'pending'
    `).first();
    
    // 국적별 집계
    const chinaCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM jobseekers j
      JOIN users u ON j.user_id = u.id
      WHERE j.nationality = '중국' AND u.status = 'approved'
    `).first();
    
    const totalApproved = activeCount?.count || 0;
    const otherCount = totalApproved - (chinaCount?.count || 0);
    
    // 최근 가입자
    const recentJobseekers = await db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        j.nationality,
        j.korean_level
      FROM users u
      LEFT JOIN jobseekers j ON u.id = j.user_id
      WHERE u.user_type = 'jobseeker'
      ORDER BY u.created_at DESC
      LIMIT 10
    `).all();
    
    return c.json({
      success: true,
      active: totalApproved,
      pending: pendingCount?.count || 0,
      china: chinaCount?.count || 0,
      other: otherCount,
      recentJobseekers: recentJobseekers.results
    });
  } catch (error) {
    console.error('Jobseekers stats error:', error);
    return c.json({
      success: false,
      active: 0,
      pending: 0,
      china: 0,
      other: 0,
      recentJobseekers: []
    }, 500);
  }
});

// 협약대학교 통계 상세
app.get('/api/admin/universities/stats', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    
    // 지역별 집계
    const seoulCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM universities
      WHERE region = '서울특별시'
    `).first();
    
    const metropolitanCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM universities
      WHERE region IN ('서울특별시', '경기도', '인천광역시')
    `).first();
    
    const totalCount = await db.prepare(`
      SELECT COUNT(*) as count FROM universities
    `).first();
    
    const regionalCount = (totalCount?.count || 0) - (metropolitanCount?.count || 0);
    
    // 전체 대학교 목록
    const universities = await db.prepare(`
      SELECT 
        id, name, english_name, region,
        language_course, undergraduate_course, graduate_course
      FROM universities
      ORDER BY name
      LIMIT 20
    `).all();
    
    return c.json({
      success: true,
      seoul: seoulCount?.count || 0,
      metropolitan: metropolitanCount?.count || 0,
      regional: regionalCount,
      universities: universities.results.map((uni: any) => ({
        id: uni.id,
        name: uni.name,
        englishName: uni.english_name,
        region: uni.region,
        languageCourse: Boolean(uni.language_course),
        undergraduateCourse: Boolean(uni.undergraduate_course),
        graduateCourse: Boolean(uni.graduate_course)
      }))
    });
  } catch (error) {
    console.error('Universities stats error:', error);
    return c.json({
      success: false,
      seoul: 0,
      metropolitan: 0,
      regional: 0,
      universities: []
    }, 500);
  }
});

// 매칭 통계 상세
app.get('/api/admin/matches/stats', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    
    // 이번 달 매칭
    const thisMonthMatches = await db.prepare(`
      SELECT COUNT(*) as count
      FROM matches
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).first();
    
    // 진행 중 매칭
    const inProgressMatches = await db.prepare(`
      SELECT COUNT(*) as count
      FROM matches
      WHERE status IN ('suggested', 'viewed', 'interested')
    `).first();
    
    // 완료된 매칭
    const completedMatches = await db.prepare(`
      SELECT COUNT(*) as count
      FROM matches
      WHERE status = 'applied'
    `).first();
    
    // 최근 매칭
    const recentMatches = await db.prepare(`
      SELECT 
        m.id,
        m.match_score,
        m.status,
        m.created_at,
        j.title as job_title,
        u.name as jobseeker_name
      FROM matches m
      LEFT JOIN job_postings j ON m.job_posting_id = j.id
      LEFT JOIN jobseekers js ON m.jobseeker_id = js.id
      LEFT JOIN users u ON js.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 10
    `).all();
    
    const total = (thisMonthMatches?.count || 0) + (completedMatches?.count || 0);
    const successRate = total > 0 ? Math.round((completedMatches?.count || 0) / total * 100) : 0;
    
    return c.json({
      success: true,
      thisMonth: thisMonthMatches?.count || 0,
      inProgress: inProgressMatches?.count || 0,
      completed: completedMatches?.count || 0,
      successRate: successRate,
      recentMatches: recentMatches.results
    });
  } catch (error) {
    console.error('Matches stats error:', error);
    return c.json({
      success: false,
      thisMonth: 0,
      inProgress: 0,
      completed: 0,
      successRate: 0,
      recentMatches: []
    }, 500);
  }
});

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
// Jobseeker Detail Page - 구직정보 상세보기
app.get('/jobseekers/:id', optionalAuth, (c) => {
  const jobseekerId = c.req.param('id');
  
  return c.render(
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>구직정보 상세보기 - WOW-CAMPUS</title>
        <link rel="stylesheet" href="https://cdn.tailwindcss.com" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="/static/app.js"></script>
      </head>
      <body class="min-h-screen bg-gray-50">
        {/* Header */}
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
              {/* 동적 메뉴 */}
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

        {/* Main Content */}
        <main class="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div class="mb-6">
            <a href="/jobseekers" class="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>
              목록으로 돌아가기
            </a>
          </div>

          {/* Loading State */}
          <div id="loading-state" class="bg-white rounded-lg shadow-sm p-12 text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-green-500 mb-4"></i>
            <p class="text-gray-600">구직자 정보를 불러오는 중...</p>
          </div>

          {/* Error State */}
          <div id="error-state" class="hidden bg-white rounded-lg shadow-sm p-12 text-center">
            <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <p class="text-gray-800 font-semibold mb-2">구직자 정보를 불러올 수 없습니다</p>
            <p id="error-message" class="text-gray-600 mb-4"></p>
            <a href="/jobseekers" class="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              목록으로 돌아가기
            </a>
          </div>

          {/* Jobseeker Detail Content */}
          <div id="jobseeker-detail" class="hidden">
            {/* Main Info Card */}
            <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {/* Header Section with Gradient */}
              <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-8">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h1 id="jobseeker-name" class="text-3xl font-bold mb-2"></h1>
                    <div class="flex items-center space-x-4 text-green-50">
                      <span id="jobseeker-nationality" class="flex items-center">
                        <i class="fas fa-flag mr-2"></i>
                      </span>
                      <span id="jobseeker-age" class="flex items-center">
                        <i class="fas fa-birthday-cake mr-2"></i>
                      </span>
                      <span id="jobseeker-gender" class="flex items-center">
                        <i class="fas fa-user mr-2"></i>
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                      <div id="jobseeker-visa" class="text-sm font-semibold"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Bar */}
              <div class="border-b border-gray-200 bg-gray-50 px-8 py-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div class="text-gray-600 text-sm mb-1">경력</div>
                    <div id="jobseeker-experience" class="text-gray-900 font-semibold"></div>
                  </div>
                  <div>
                    <div class="text-gray-600 text-sm mb-1">학력</div>
                    <div id="jobseeker-education" class="text-gray-900 font-semibold"></div>
                  </div>
                  <div>
                    <div class="text-gray-600 text-sm mb-1">한국어</div>
                    <div id="jobseeker-korean" class="text-gray-900 font-semibold"></div>
                  </div>
                  <div>
                    <div class="text-gray-600 text-sm mb-1">영어</div>
                    <div id="jobseeker-english" class="text-gray-900 font-semibold"></div>
                  </div>
                </div>
              </div>

              {/* Detailed Info */}
              <div class="p-8">
                {/* Bio */}
                <div id="jobseeker-bio-section" class="mb-8 hidden">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">자기소개</h3>
                  <p id="jobseeker-bio" class="text-gray-700 leading-relaxed"></p>
                </div>

                {/* Education & Major */}
                <div class="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">
                      <i class="fas fa-graduation-cap text-green-600 mr-2"></i>학력 사항
                    </h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="mb-2">
                        <span class="text-gray-600 text-sm">최종 학력</span>
                        <p id="jobseeker-education-detail" class="text-gray-900 font-medium"></p>
                      </div>
                      <div id="jobseeker-major-section" class="hidden">
                        <span class="text-gray-600 text-sm">전공</span>
                        <p id="jobseeker-major" class="text-gray-900 font-medium"></p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">
                      <i class="fas fa-briefcase text-green-600 mr-2"></i>경력 사항
                    </h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="mb-2">
                        <span class="text-gray-600 text-sm">총 경력</span>
                        <p id="jobseeker-experience-detail" class="text-gray-900 font-medium"></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div id="jobseeker-skills-section" class="mb-8 hidden">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">
                    <i class="fas fa-tools text-green-600 mr-2"></i>보유 기술
                  </h3>
                  <div id="jobseeker-skills" class="flex flex-wrap gap-2"></div>
                </div>

                {/* Preferences */}
                <div class="grid md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-2">
                      <i class="fas fa-map-marker-alt text-green-600 mr-2"></i>희망 근무지
                    </h3>
                    <p id="jobseeker-preferred-location" class="text-gray-900"></p>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-2">
                      <i class="fas fa-won-sign text-green-600 mr-2"></i>희망 연봉
                    </h3>
                    <p id="jobseeker-salary" class="text-gray-900 font-semibold"></p>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-2">
                      <i class="fas fa-calendar-check text-green-600 mr-2"></i>입사 가능일
                    </h3>
                    <p id="jobseeker-start-date" class="text-gray-900"></p>
                  </div>
                </div>

                {/* Contact Info (Only for authenticated users) */}
                <div id="jobseeker-contact-section" class="hidden border-t pt-8">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-address-card text-green-600 mr-2"></i>연락처 정보
                  </h3>
                  <div class="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <span class="text-gray-600 text-sm">이메일</span>
                      <p id="jobseeker-email" class="text-gray-900 font-medium"></p>
                    </div>
                    <div>
                      <span class="text-gray-600 text-sm">전화번호</span>
                      <p id="jobseeker-phone" class="text-gray-900 font-medium"></p>
                    </div>
                    <div>
                      <span class="text-gray-600 text-sm">현재 거주지</span>
                      <p id="jobseeker-current-location" class="text-gray-900 font-medium"></p>
                    </div>
                  </div>
                </div>

                {/* Documents (Only for authenticated users) */}
                <div id="jobseeker-documents-section" class="hidden border-t pt-8 mt-8">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-file-alt text-green-600 mr-2"></i>첨부 서류
                  </h3>
                  <div class="space-y-3">
                    <div id="jobseeker-resume-link" class="hidden">
                      <a href="#" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <i class="fas fa-file-pdf mr-2"></i>이력서 다운로드
                      </a>
                    </div>
                    <div id="jobseeker-portfolio-link" class="hidden">
                      <a href="#" target="_blank" class="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                        <i class="fas fa-folder mr-2"></i>포트폴리오 보기
                      </a>
                    </div>
                  </div>
                </div>

                {/* Login Required Message */}
                <div id="login-required-message" class="hidden border-t pt-8 mt-8">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <i class="fas fa-lock text-blue-600 text-3xl mb-3"></i>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">로그인이 필요합니다</h4>
                    <p class="text-gray-600 mb-4">구직자의 연락처 정보와 이력서를 확인하려면 로그인이 필요합니다.</p>
                    <button onclick="showLoginModal()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-sign-in-alt mr-2"></i>로그인하기
                    </button>
                  </div>
                </div>

                {/* Application Stats (Only for own profile or admin) */}
                <div id="jobseeker-applications-section" class="hidden border-t pt-8 mt-8">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-paper-plane text-green-600 mr-2"></i>최근 지원 현황
                  </h3>
                  <div id="jobseeker-applications" class="space-y-3">
                    {/* Applications will be loaded here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <script dangerouslySetInnerHTML={{__html: `
          const jobseekerId = ${jobseekerId};
          
          // Load jobseeker detail
          async function loadJobseekerDetail() {
            try {
              const token = localStorage.getItem('token');
              const headers = {};
              if (token) {
                headers['Authorization'] = 'Bearer ' + token;
              }

              const response = await fetch('/api/jobseekers/' + jobseekerId, {
                headers: headers
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to load jobseeker details');
              }

              const jobseeker = data.jobseeker;
              
              // Hide loading, show content
              document.getElementById('loading-state').classList.add('hidden');
              document.getElementById('jobseeker-detail').classList.remove('hidden');

              // Populate basic info
              document.getElementById('jobseeker-name').textContent = 
                jobseeker.first_name + ' ' + jobseeker.last_name;
              
              if (jobseeker.nationality) {
                document.getElementById('jobseeker-nationality').innerHTML = 
                  '<i class="fas fa-flag mr-2"></i>' + jobseeker.nationality;
              }

              if (jobseeker.birth_date) {
                const age = calculateAge(jobseeker.birth_date);
                document.getElementById('jobseeker-age').innerHTML = 
                  '<i class="fas fa-birthday-cake mr-2"></i>' + age + '세';
              }

              if (jobseeker.gender) {
                const genderText = jobseeker.gender === 'male' ? '남성' : 
                                  jobseeker.gender === 'female' ? '여성' : '기타';
                document.getElementById('jobseeker-gender').innerHTML = 
                  '<i class="fas fa-user mr-2"></i>' + genderText;
              }

              if (jobseeker.visa_status) {
                document.getElementById('jobseeker-visa').textContent = jobseeker.visa_status + ' 비자';
              }

              // Quick info
              const experienceYears = jobseeker.experience_years || 0;
              const experienceText = experienceYears === 0 ? '신입' : experienceYears + '년';
              document.getElementById('jobseeker-experience').textContent = experienceText;

              const educationLevels = {
                'high_school': '고등학교 졸업',
                'associate': '전문대 졸업',
                'bachelor': '학사',
                'master': '석사',
                'doctorate': '박사'
              };
              document.getElementById('jobseeker-education').textContent = 
                educationLevels[jobseeker.education_level] || jobseeker.education_level || '미입력';

              const languageLevels = {
                'beginner': '초급',
                'elementary': '초중급',
                'intermediate': '중급',
                'advanced': '고급',
                'native': '원어민'
              };
              document.getElementById('jobseeker-korean').textContent = 
                languageLevels[jobseeker.korean_level] || '미입력';
              document.getElementById('jobseeker-english').textContent = 
                languageLevels[jobseeker.english_level] || '미입력';

              // Bio
              if (jobseeker.bio) {
                document.getElementById('jobseeker-bio').textContent = jobseeker.bio;
                document.getElementById('jobseeker-bio-section').classList.remove('hidden');
              }

              // Education detail
              document.getElementById('jobseeker-education-detail').textContent = 
                educationLevels[jobseeker.education_level] || '미입력';
              
              if (jobseeker.major) {
                document.getElementById('jobseeker-major').textContent = jobseeker.major;
                document.getElementById('jobseeker-major-section').classList.remove('hidden');
              }

              // Experience detail
              document.getElementById('jobseeker-experience-detail').textContent = experienceText;

              // Skills
              if (jobseeker.skills) {
                try {
                  const skills = typeof jobseeker.skills === 'string' ? 
                    JSON.parse(jobseeker.skills) : jobseeker.skills;
                  
                  if (Array.isArray(skills) && skills.length > 0) {
                    const skillsContainer = document.getElementById('jobseeker-skills');
                    skillsContainer.innerHTML = skills.map(skill => 
                      '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">' + skill + '</span>'
                    ).join('');
                    document.getElementById('jobseeker-skills-section').classList.remove('hidden');
                  }
                } catch (e) {
                  console.error('Error parsing skills:', e);
                }
              }

              // Preferences
              document.getElementById('jobseeker-preferred-location').textContent = 
                jobseeker.preferred_location || '협의 가능';
              
              if (jobseeker.salary_expectation) {
                document.getElementById('jobseeker-salary').textContent = 
                  jobseeker.salary_expectation.toLocaleString() + '만원';
              } else {
                document.getElementById('jobseeker-salary').textContent = '협의 가능';
              }

              document.getElementById('jobseeker-start-date').textContent = 
                jobseeker.available_start_date ? formatDate(jobseeker.available_start_date) : '즉시 가능';

              // Contact info (only if not hidden)
              if (jobseeker.email) {
                document.getElementById('jobseeker-email').textContent = jobseeker.email;
                document.getElementById('jobseeker-phone').textContent = jobseeker.phone || '비공개';
                document.getElementById('jobseeker-current-location').textContent = 
                  jobseeker.current_location || '비공개';
                document.getElementById('jobseeker-contact-section').classList.remove('hidden');
              } else if (token) {
                // Logged in but no access to contact info
                // Don't show anything
              } else {
                // Not logged in
                document.getElementById('login-required-message').classList.remove('hidden');
              }

              // Documents
              if (jobseeker.resume_url) {
                const resumeLink = document.querySelector('#jobseeker-resume-link a');
                resumeLink.href = jobseeker.resume_url;
                document.getElementById('jobseeker-resume-link').classList.remove('hidden');
                document.getElementById('jobseeker-documents-section').classList.remove('hidden');
              }

              if (jobseeker.portfolio_url) {
                const portfolioLink = document.querySelector('#jobseeker-portfolio-link a');
                portfolioLink.href = jobseeker.portfolio_url;
                document.getElementById('jobseeker-portfolio-link').classList.remove('hidden');
                document.getElementById('jobseeker-documents-section').classList.remove('hidden');
              }

              // Applications (only for own profile or admin)
              if (data.recent_applications && data.recent_applications.length > 0) {
                const applicationsContainer = document.getElementById('jobseeker-applications');
                applicationsContainer.innerHTML = data.recent_applications.map(app => 
                  '<div class="bg-gray-50 rounded-lg p-4">' +
                    '<div class="flex justify-between items-start mb-2">' +
                      '<div>' +
                        '<h4 class="font-semibold text-gray-900">' + (app.job_title || '제목 없음') + '</h4>' +
                        '<p class="text-sm text-gray-600">' + (app.company_name || '회사명 없음') + '</p>' +
                      '</div>' +
                      '<span class="px-2 py-1 text-xs rounded-full ' + getApplicationStatusClass(app.status) + '">' +
                        getApplicationStatusText(app.status) +
                      '</span>' +
                    '</div>' +
                    '<div class="text-xs text-gray-500">' +
                      '<i class="fas fa-calendar mr-1"></i>' + formatDate(app.applied_at) +
                    '</div>' +
                  '</div>'
                ).join('');
                document.getElementById('jobseeker-applications-section').classList.remove('hidden');
              }

            } catch (error) {
              console.error('Error loading jobseeker:', error);
              document.getElementById('loading-state').classList.add('hidden');
              document.getElementById('error-state').classList.remove('hidden');
              document.getElementById('error-message').textContent = error.message;
            }
          }

          function calculateAge(birthDate) {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            return age;
          }

          function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR');
          }

          function getApplicationStatusClass(status) {
            const classes = {
              'pending': 'bg-yellow-100 text-yellow-800',
              'reviewing': 'bg-blue-100 text-blue-800',
              'accepted': 'bg-green-100 text-green-800',
              'rejected': 'bg-red-100 text-red-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
          }

          function getApplicationStatusText(status) {
            const texts = {
              'pending': '대기중',
              'reviewing': '검토중',
              'accepted': '합격',
              'rejected': '불합격'
            };
            return texts[status] || status;
          }

          // Initialize
          if (window.auth && window.auth.init) {
            window.auth.init();
          }
          loadJobseekerDetail();
        `}}>
        </script>
      </body>
    </html>
  );
});

// Job Detail Page - 구인정보 상세보기
app.get('/jobs/:id', optionalAuth, (c) => {
  const jobId = c.req.param('id');
  
  return c.render(
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>구인정보 상세보기 - WOW-CAMPUS</title>
        <link rel="stylesheet" href="https://cdn.tailwindcss.com" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="/static/app.js"></script>
      </head>
      <body class="min-h-screen bg-gray-50">
        {/* Header */}
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
              {/* 동적 메뉴 */}
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

        {/* Main Content */}
        <main class="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div class="mb-6">
            <a href="/jobs" class="inline-flex items-center text-blue-600 hover:text-blue-800">
              <i class="fas fa-arrow-left mr-2"></i>
              구인정보 목록으로 돌아가기
            </a>
          </div>

          {/* Job Detail Container */}
          <div id="job-detail-container" class="bg-white rounded-lg shadow-sm">
            {/* Loading State */}
            <div class="p-12 text-center">
              <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p class="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </main>

        <script dangerouslySetInnerHTML={{__html: `
          const jobId = ${jobId};
          
          // Load job detail on page load
          window.addEventListener('DOMContentLoaded', async function() {
            await loadJobDetail(jobId);
          });
          
          async function loadJobDetail(jobId) {
            const container = document.getElementById('job-detail-container');
            const token = localStorage.getItem('wowcampus_token');
            
            try {
              // Fetch job detail
              const response = await fetch('/api/jobs/' + jobId, {
                headers: token ? {
                  'Authorization': 'Bearer ' + token
                } : {}
              });
              
              const data = await response.json();
              
              if (!data.success || !data.job) {
                container.innerHTML = \`
                  <div class="p-12 text-center">
                    <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">구인정보를 찾을 수 없습니다</h2>
                    <p class="text-gray-600 mb-6">요청하신 구인정보가 존재하지 않거나 삭제되었습니다.</p>
                    <a href="/jobs" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      구인정보 목록으로
                    </a>
                  </div>
                \`;
                return;
              }
              
              const job = data.job;
              const hasApplied = data.has_applied || false;
              
              // Parse skills if JSON string
              let skills = [];
              if (job.skills_required) {
                try {
                  skills = typeof job.skills_required === 'string' 
                    ? JSON.parse(job.skills_required) 
                    : job.skills_required;
                } catch (e) {
                  skills = [];
                }
              }
              
              // Format salary
              const salaryText = job.salary_min && job.salary_max
                ? \`\${(job.salary_min/10000).toFixed(0)}~\${(job.salary_max/10000).toFixed(0)}만원\`
                : '회사내규';
              
              // Format deadline
              const deadlineText = job.application_deadline 
                ? new Date(job.application_deadline).toLocaleDateString('ko-KR')
                : '상시채용';
              
              // Render job detail
              container.innerHTML = \`
                <div class="p-8">
                  <!-- Company & Title -->
                  <div class="mb-8">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-3">
                          <h1 class="text-3xl font-bold text-gray-900">\${job.title}</h1>
                          \${job.featured ? '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">추천</span>' : ''}
                          \${job.visa_sponsorship ? '<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"><i class="fas fa-passport mr-1"></i>비자지원</span>' : ''}
                        </div>
                        <div class="flex items-center gap-2 text-lg text-gray-700 mb-2">
                          <i class="fas fa-building text-blue-600"></i>
                          <span class="font-semibold">\${job.company_name || '회사명 미공개'}</span>
                        </div>
                        <div class="flex flex-wrap gap-4 text-gray-600">
                          <span><i class="fas fa-briefcase mr-1"></i>\${job.job_type}</span>
                          <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.location}</span>
                          <span><i class="fas fa-won-sign mr-1"></i>\${salaryText}</span>
                          <span><i class="fas fa-users mr-1"></i>모집 \${job.positions_available || 1}명</span>
                        </div>
                      </div>
                      
                      <!-- Apply Button -->
                      <div class="ml-6">
                        \${token ? (
                          hasApplied 
                            ? '<button disabled class="px-8 py-4 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"><i class="fas fa-check mr-2"></i>지원 완료</button>'
                            : '<button onclick="applyForJob(' + job.id + ')" class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><i class="fas fa-paper-plane mr-2"></i>지원하기</button>'
                        ) : '<button onclick="showLoginModal()" class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><i class="fas fa-sign-in-alt mr-2"></i>로그인하고 지원하기</button>'}
                      </div>
                    </div>
                    
                    <!-- Stats -->
                    <div class="flex gap-6 text-sm text-gray-500 pt-4 border-t">
                      <span><i class="fas fa-eye mr-1"></i>조회 \${job.views_count || 0}회</span>
                      <span><i class="fas fa-users mr-1"></i>지원자 \${job.applications_count || 0}명</span>
                      <span><i class="fas fa-calendar-alt mr-1"></i>마감일: \${deadlineText}</span>
                    </div>
                  </div>

                  <!-- Job Description -->
                  <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">채용 공고</h2>
                    <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                      \${job.description}
                    </div>
                  </div>

                  <!-- Requirements -->
                  \${job.requirements ? \`
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">자격 요건</h2>
                      <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        \${job.requirements}
                      </div>
                    </div>
                  \` : ''}

                  <!-- Responsibilities -->
                  \${job.responsibilities ? \`
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">주요 업무</h2>
                      <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        \${job.responsibilities}
                      </div>
                    </div>
                  \` : ''}

                  <!-- Skills Required -->
                  \${skills.length > 0 ? \`
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">필요 기술</h2>
                      <div class="flex flex-wrap gap-2">
                        \${skills.map(skill => \`<span class="px-4 py-2 bg-blue-50 text-blue-700 rounded-full">\${skill}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}

                  <!-- Benefits -->
                  \${job.benefits ? \`
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">복리후생</h2>
                      <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        \${job.benefits}
                      </div>
                    </div>
                  \` : ''}

                  <!-- Additional Info -->
                  <div class="bg-gray-50 rounded-lg p-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">추가 정보</h2>
                    <div class="grid md:grid-cols-2 gap-4 text-gray-700">
                      <div>
                        <span class="font-semibold">직무 분야:</span>
                        <span class="ml-2">\${job.job_category}</span>
                      </div>
                      <div>
                        <span class="font-semibold">경력:</span>
                        <span class="ml-2">\${job.experience_level || '경력무관'}</span>
                      </div>
                      <div>
                        <span class="font-semibold">학력:</span>
                        <span class="ml-2">\${job.education_required || '학력무관'}</span>
                      </div>
                      <div>
                        <span class="font-semibold">한국어:</span>
                        <span class="ml-2">\${job.korean_required ? '필수' : '선택'}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Company Info -->
                  \${job.company_name ? \`
                    <div class="mt-8 pt-8 border-t">
                      <h2 class="text-xl font-bold text-gray-900 mb-4">기업 정보</h2>
                      <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i class="fas fa-building text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex-1">
                          <h3 class="text-lg font-semibold text-gray-900 mb-2">\${job.company_name}</h3>
                          \${job.industry ? \`<p class="text-gray-600 mb-1"><i class="fas fa-industry mr-2"></i>\${job.industry}</p>\` : ''}
                          \${job.company_size ? \`<p class="text-gray-600 mb-1"><i class="fas fa-users mr-2"></i>\${job.company_size}</p>\` : ''}
                          \${job.website ? \`<p class="text-gray-600"><i class="fas fa-globe mr-2"></i><a href="\${job.website}" target="_blank" class="text-blue-600 hover:underline">\${job.website}</a></p>\` : ''}
                        </div>
                      </div>
                    </div>
                  \` : ''}
                </div>
              \`;
              
            } catch (error) {
              console.error('Error loading job detail:', error);
              container.innerHTML = \`
                <div class="p-12 text-center">
                  <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
                  <p class="text-gray-600 mb-6">구인정보를 불러오는 중 문제가 발생했습니다.</p>
                  <button onclick="loadJobDetail(\${jobId})" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    다시 시도
                  </button>
                </div>
              \`;
            }
          }
          
          // Apply for job function
          async function applyForJob(jobId) {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              showLoginModal();
              return;
            }
            
            if (!confirm('이 채용공고에 지원하시겠습니까?')) {
              return;
            }
            
            try {
              const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ job_posting_id: jobId })
              });
              
              const data = await response.json();
              
              if (data.success) {
                alert('지원이 완료되었습니다!');
                location.reload();
              } else {
                alert('지원 실패: ' + (data.message || '알 수 없는 오류'));
              }
            } catch (error) {
              console.error('Apply error:', error);
              alert('지원 중 오류가 발생했습니다.');
            }
          }
        `}}></script>
      </body>
    </html>
  );
});

// Jobs page
app.get('/jobs', (c) => {
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
          const filters = document.getElementById('advanced-job-filters');
          if (filters) {
            filters.classList.toggle('hidden');
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
})

// Study page
app.get('/study', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation - Same structure */}
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

      {/* Study Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">유학정보</h1>
          <p class="text-gray-600 text-lg">한국 대학교 및 어학원 정보를 확인하고 지원하세요</p>
        </div>

        {/* Study Programs Grid */}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-graduation-cap text-green-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">한국어 연수</h3>
            <p class="text-gray-600 mb-4">기초부터 고급까지 체계적인 한국어 교육 프로그램</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• 1급~6급 단계별 교육</li>
              <li>• TOPIK 시험 준비</li>
              <li>• 문화 체험 프로그램</li>
            </ul>
            <a href="/study/korean" class="text-green-600 font-medium hover:underline">자세히 보기 →</a>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-university text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">학부 과정</h3>
            <p class="text-gray-600 mb-4">한국의 우수한 대학교 학부 과정 진학 지원</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• 입학 준비 컨설팅</li>
              <li>• 장학금 안내</li>
              <li>• 기숙사 배정 지원</li>
            </ul>
            <a href="/study/undergraduate" class="text-blue-600 font-medium hover:underline">자세히 보기 →</a>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-user-graduate text-purple-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">대학원 과정</h3>
            <p class="text-gray-600 mb-4">석사, 박사 과정 및 연구 프로그램 지원</p>
            <ul class="text-sm text-gray-600 space-y-1 mb-4">
              <li>• 연구실 매칭</li>
              <li>• 논문 지도 지원</li>
              <li>• 연구비 지원 안내</li>
            </ul>
            <a href="/study/graduate" class="text-purple-600 font-medium hover:underline">자세히 보기 →</a>
          </div>
        </div>

        {/* Partner Universities Section - 협약대학교 */}
        <div class="mt-20">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">협약 대학교</h2>
            <p class="text-gray-600 text-lg">(주)와우쓰리디와 협약을 맺은 우수한 한국 대학교들을 만나보세요</p>
          </div>

          {/* Filter Controls */}
          <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div class="grid md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">지역 (시·도)</label>
                <select id="regionFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">전체 지역</option>
                  <option value="서울특별시">서울특별시</option>
                  <option value="부산광역시">부산광역시</option>
                  <option value="대구광역시">대구광역시</option>
                  <option value="인천광역시">인천광역시</option>
                  <option value="광주광역시">광주광역시</option>
                  <option value="대전광역시">대전광역시</option>
                  <option value="울산광역시">울산광역시</option>
                  <option value="세종특별자치시">세종특별자치시</option>
                  <option value="경기도">경기도</option>
                  <option value="강원특별자치도">강원특별자치도</option>
                  <option value="충청북도">충청북도</option>
                  <option value="충청남도">충청남도</option>
                  <option value="전북특별자치도">전북특별자치도</option>
                  <option value="전라남도">전라남도</option>
                  <option value="경상북도">경상북도</option>
                  <option value="경상남도">경상남도</option>
                  <option value="제주특별자치도">제주특별자치도</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">전공 분야</label>
                <select id="majorFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">전체 전공</option>
                  <option value="공학">공학</option>
                  <option value="경영학">경영학</option>
                  <option value="의학">의학</option>
                  <option value="자연과학">자연과학</option>
                  <option value="인문학">인문학</option>
                  <option value="사회과학">사회과학</option>
                  <option value="예술">예술</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">학위 과정</label>
                <select id="degreeFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">전체 과정</option>
                  <option value="어학연수">어학연수 (한국어)</option>
                  <option value="학부">학부과정 (학사)</option>
                  <option value="대학원">대학원과정 (석·박사)</option>
                </select>
              </div>
              <div class="flex items-end">
                <button onclick="resetFilters()" class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  필터 초기화
                </button>
              </div>
            </div>
          </div>

          {/* Universities Grid */}
          <div id="universitiesContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 대학교 리스트가 여기에 동적으로 로드됩니다 */}
          </div>

          {/* Loading State */}
          <div id="loadingState" class="text-center py-8">
            <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-white">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              협약대학교 정보를 불러오는 중...
            </div>
          </div>

          {/* Empty State */}
          <div id="emptyState" class="text-center py-12 hidden">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-university text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p class="text-gray-600 mb-4">다른 조건으로 검색해보세요</p>
            <button onclick="resetFilters()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              전체 보기
            </button>
          </div>
        </div>
      </main>
    </div>
  )
})

// Study Program Detail Pages
// Korean Language Course Detail
app.get('/study/korean', (c) => {
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

      {/* Breadcrumb */}
      <div class="bg-white border-b">
        <div class="container mx-auto px-4 py-3">
          <nav class="flex items-center space-x-2 text-sm">
            <a href="/" class="text-gray-500 hover:text-blue-600">홈</a>
            <span class="text-gray-400">/</span>
            <a href="/study" class="text-gray-500 hover:text-blue-600">유학정보</a>
            <span class="text-gray-400">/</span>
            <span class="text-gray-900">한국어 연수</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-graduation-cap text-green-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">한국어 연수 프로그램</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">기초부터 고급까지 체계적인 한국어 교육으로 한국 생활과 학업의 기초를 다져보세요</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Program Overview */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">프로그램 개요</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-3 text-green-600">교육 과정</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• <strong>1급-2급:</strong> 기초 한국어 (발음, 기본 문법)</li>
                  <li>• <strong>3급-4급:</strong> 중급 한국어 (일상 회화, 문서 작성)</li>
                  <li>• <strong>5급-6급:</strong> 고급 한국어 (학술 토론, 전문 용어)</li>
                  <li>• <strong>특별반:</strong> TOPIK 시험 준비반</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-3 text-green-600">수업 방식</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 소규모 클래스 (15명 이하)</li>
                  <li>• 원어민 강사 수업</li>
                  <li>• 말하기, 듣기, 읽기, 쓰기 통합 교육</li>
                  <li>• 문화 체험 프로그램 병행</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Course Schedule */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">수업 일정</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">정규 학기</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><strong>봄학기:</strong> 3월 - 5월</li>
                  <li><strong>여름학기:</strong> 6월 - 8월</li>
                  <li><strong>가을학기:</strong> 9월 - 11월</li>
                  <li><strong>겨울학기:</strong> 12월 - 2월</li>
                </ul>
              </div>
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">수업 시간</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><strong>오전반:</strong> 09:00 - 13:00</li>
                  <li><strong>오후반:</strong> 14:00 - 18:00</li>
                  <li><strong>주당:</strong> 20시간 (월-금)</li>
                  <li><strong>학기당:</strong> 200시간</li>
                </ul>
              </div>
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">특별 프로그램</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 한국 문화 체험</li>
                  <li>• 현장 학습</li>
                  <li>• 언어교환 프로그램</li>
                  <li>• 한국 학생과의 멘토링</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Fees and Requirements */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">지원 정보</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">수강료</h3>
                <div class="space-y-3">
                  <div class="flex justify-between border-b pb-2">
                    <span>등록비</span>
                    <span class="font-semibold">50,000원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>학기당 수강료</span>
                    <span class="font-semibold">1,200,000원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>교재비</span>
                    <span class="font-semibold">100,000원</span>
                  </div>
                  <div class="flex justify-between font-bold text-lg">
                    <span>총 비용 (1학기)</span>
                    <span class="text-green-600">1,350,000원</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">지원 자격</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 고등학교 졸업 이상 학력</li>
                  <li>• 만 18세 이상</li>
                  <li>• 한국어 학습 의지가 있는 외국인</li>
                  <li>• 기본적인 영어 의사소통 가능자</li>
                </ul>
                
                <h3 class="text-lg font-semibold mb-4 mt-6 text-green-600">필요 서류</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 지원서 및 자기소개서</li>
                  <li>• 최종 학력 증명서</li>
                  <li>• 여권 사본</li>
                  <li>• 사진 (3x4cm, 2매)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">프로그램 혜택</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-certificate text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">수료증 발급</h3>
                <p class="text-sm text-gray-600">한국 대학교에서 인정하는 공식 수료증</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-home text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">기숙사 제공</h3>
                <p class="text-sm text-gray-600">안전하고 편리한 교내 기숙사 우선 배정</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-users text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">멘토링</h3>
                <p class="text-sm text-gray-600">한국 학생들과의 1:1 언어교환</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-graduation-cap text-yellow-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">진학 지원</h3>
                <p class="text-sm text-gray-600">한국 대학 진학을 위한 상담 및 지원</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">문의 및 지원</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">연락처</h3>
                <div class="space-y-3">
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-phone text-gray-400 w-5"></i>
                    <span>+82-2-1234-5678</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-envelope text-gray-400 w-5"></i>
                    <span>korean@wow-campus.com</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-map-marker-alt text-gray-400 w-5"></i>
                    <span>서울특별시 강남구 테헤란로 123</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">지원 일정</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>봄학기 지원 마감:</span>
                    <span class="font-semibold">1월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>여름학기 지원 마감:</span>
                    <span class="font-semibold">4월 30일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>가을학기 지원 마감:</span>
                    <span class="font-semibold">7월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>겨울학기 지원 마감:</span>
                    <span class="font-semibold">10월 31일</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick="alert('지원 서비스는 준비 중입니다!')" class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold mr-4">
              지금 지원하기
            </button>
            <a href="/study" class="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              뒤로 가기
            </a>
          </div>
        </div>
      </main>
    </div>
  )
})

// Undergraduate Program Detail
app.get('/study/undergraduate', (c) => {
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

      {/* Breadcrumb */}
      <div class="bg-white border-b">
        <div class="container mx-auto px-4 py-3">
          <nav class="flex items-center space-x-2 text-sm">
            <a href="/" class="text-gray-500 hover:text-blue-600">홈</a>
            <span class="text-gray-400">/</span>
            <a href="/study" class="text-gray-500 hover:text-blue-600">유학정보</a>
            <span class="text-gray-400">/</span>
            <span class="text-gray-900">학부 과정</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-university text-blue-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">학부 과정 진학</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">한국의 우수한 대학교에서 학부 과정을 통해 전문 지식을 쌓고 글로벌 인재로 성장하세요</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Popular Majors */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">인기 전공 분야</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-laptop-code text-blue-600"></i>
                </div>
                <h3 class="font-semibold mb-2">컴퓨터공학</h3>
                <p class="text-sm text-gray-600">AI, 소프트웨어 개발, 데이터 사이언스</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-chart-line text-green-600"></i>
                </div>
                <h3 class="font-semibold mb-2">경영학</h3>
                <p class="text-sm text-gray-600">국제경영, 마케팅, 금융, 회계</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-cog text-purple-600"></i>
                </div>
                <h3 class="font-semibold mb-2">공학</h3>
                <p class="text-sm text-gray-600">기계, 전자, 화학, 건축공학</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-heartbeat text-red-600"></i>
                </div>
                <h3 class="font-semibold mb-2">의학/보건</h3>
                <p class="text-sm text-gray-600">의학, 간호학, 약학, 치의학</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-palette text-yellow-600"></i>
                </div>
                <h3 class="font-semibold mb-2">예술/디자인</h3>
                <p class="text-sm text-gray-600">시각디자인, 산업디자인, 미술</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-globe text-indigo-600"></i>
                </div>
                <h3 class="font-semibold mb-2">국제학</h3>
                <p class="text-sm text-gray-600">국제관계학, 한국학, 언어학</p>
              </div>
            </div>
          </section>



          {/* Admission Requirements */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">입학 요건</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">학력 요건</h3>
                <ul class="space-y-3 text-gray-600">
                  <li>• 고등학교 졸업 또는 동등 학력</li>
                  <li>• 국외 12년 교육과정 이수</li>
                  <li>• 성적증명서 (GPA 3.0/4.0 이상 권장)</li>
                  <li>• 졸업증명서 또는 졸업예정증명서</li>
                </ul>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">언어 요건</h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded p-3">
                    <strong>한국어 트랙:</strong> TOPIK 4급 이상
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <strong>영어 트랙:</strong> TOEFL 80+ / IELTS 6.0+
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">필수 서류</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 입학 지원서</li>
                  <li>• 자기소개서 (영문/한글)</li>
                  <li>• 학업계획서</li>
                  <li>• 추천서 2부</li>
                  <li>• 여권 사본</li>
                  <li>• 사진 (규격: 3x4cm)</li>
                  <li>• 재정증명서 (USD 20,000 이상)</li>
                </ul>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">전형 방법</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 서류 심사 (70%)</li>
                  <li>• 면접 또는 필기시험 (30%)</li>
                  <li>• 포트폴리오 (예술 계열)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Costs and Scholarships */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">학비 및 장학금</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">학비 (연간)</h3>
                <div class="space-y-3">
                  <div class="flex justify-between border-b pb-2">
                    <span>입학금 (1회)</span>
                    <span class="font-semibold">200만원 ~ 500만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>인문계열</span>
                    <span class="font-semibold">400만원 ~ 800만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>이공계열</span>
                    <span class="font-semibold">500만원 ~ 1,000만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>의학계열</span>
                    <span class="font-semibold">800만원 ~ 1,500만원</span>
                  </div>
                </div>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">생활비 (월간)</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>기숙사비</span>
                    <span>30만원 ~ 50만원</span>
                  </div>
                  <div class="flex justify-between">
                    <span>식비</span>
                    <span>30만원 ~ 40만원</span>
                  </div>
                  <div class="flex justify-between">
                    <span>기타 생활비</span>
                    <span>20만원 ~ 30만원</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">장학금 종류</h3>
                <div class="space-y-4">
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">정부초청장학금 (GKS)</h4>
                    <p class="text-sm text-gray-600 mb-2">학비 전액 + 생활비 지원</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">월 90만원</span>
                  </div>
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">대학별 장학금</h4>
                    <p class="text-sm text-gray-600 mb-2">성적우수 외국인 특별장학금</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">학비 30-100%</span>
                  </div>
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">교환학생 장학금</h4>
                    <p class="text-sm text-gray-600 mb-2">협정대학 교환학생 지원</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">학비 면제</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Services */}
          <section class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">학생 지원 서비스</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-user-friends text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">멘토링</h3>
                <p class="text-sm text-gray-600">한국 학생과 1:1 멘토-멘티 프로그램</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-stethoscope text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">건강관리</h3>
                <p class="text-sm text-gray-600">교내 보건소 및 의료보험 지원</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-briefcase text-yellow-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">취업 지원</h3>
                <p class="text-sm text-gray-600">이력서 작성부터 면접까지 전방위 지원</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-calendar-alt text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">문화 프로그램</h3>
                <p class="text-sm text-gray-600">한국 문화 체험 및 동아리 활동 지원</p>
              </div>
            </div>
          </section>

          {/* Application Timeline */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">지원 일정 (2024년)</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">봄학기 (3월 입학)</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>서류 접수:</span>
                    <span class="font-semibold">9월 1일 - 11월 30일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>서류 심사:</span>
                    <span class="font-semibold">12월 1일 - 12월 15일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>면접 시험:</span>
                    <span class="font-semibold">12월 20일 - 1월 10일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>합격자 발표:</span>
                    <span class="font-semibold">1월 20일</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">가을학기 (9월 입학)</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>서류 접수:</span>
                    <span class="font-semibold">3월 1일 - 5월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>서류 심사:</span>
                    <span class="font-semibold">6월 1일 - 6월 15일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>면접 시험:</span>
                    <span class="font-semibeld">6월 20일 - 7월 10일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>합격자 발표:</span>
                    <span class="font-semibold">7월 20일</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick="alert('지원 서비스는 준비 중입니다!')" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mr-4">
              지금 지원하기
            </button>
            <a href="/study" class="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              뒤로 가기
            </a>
          </div>
        </div>
      </main>
    </div>
  )
})

// Graduate Program Detail
app.get('/study/graduate', (c) => {
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

      {/* Breadcrumb */}
      <div class="bg-white border-b">
        <div class="container mx-auto px-4 py-3">
          <nav class="flex items-center space-x-2 text-sm">
            <a href="/" class="text-gray-500 hover:text-blue-600">홈</a>
            <span class="text-gray-400">/</span>
            <a href="/study" class="text-gray-500 hover:text-blue-600">유학정보</a>
            <span class="text-gray-400">/</span>
            <span class="text-gray-900">대학원 과정</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-user-graduate text-purple-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">대학원 과정 진학</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">한국의 연구 중심 대학에서 석사, 박사 과정을 통해 전문 연구자로 성장하세요</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Program Types */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">과정 종류</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-graduation-cap text-blue-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">석사 과정</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• 수업연한: 2년</li>
                  <li>• 최소학점: 24학점</li>
                  <li>• 논문 또는 종합시험</li>
                  <li>• 연구 프로젝트 수행</li>
                </ul>
              </div>
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-user-graduate text-purple-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">박사 과정</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• 수업연한: 3년</li>
                  <li>• 최소학점: 36학점</li>
                  <li>• 박사논문 필수</li>
                  <li>• 독창적 연구 수행</li>
                </ul>
              </div>
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-flask text-green-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">석박사 통합</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• 수업연한: 5년</li>
                  <li>• 최소학점: 60학점</li>
                  <li>• 연속 과정 수행</li>
                  <li>• 장기 연구 프로젝트</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Research Areas */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">주요 연구 분야</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">이공계열</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">전자공학</h4>
                    <p class="text-xs text-gray-600">AI, IoT, 반도체</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">컴퓨터과학</h4>
                    <p class="text-xs text-gray-600">머신러닝, 빅데이터</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">생명공학</h4>
                    <p class="text-xs text-gray-600">유전공학, 의료기술</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">신소재</h4>
                    <p class="text-xs text-gray-600">나노기술, 에너지</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">인문사회계열</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">국제관계학</h4>
                    <p class="text-xs text-gray-600">외교, 안보정책</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">경영학</h4>
                    <p class="text-xs text-gray-600">전략, 마케팅</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">한국학</h4>
                    <p class="text-xs text-gray-600">역사, 문화연구</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">교육학</h4>
                    <p class="text-xs text-gray-600">교육정책, 교육공학</p>
                  </div>
                </div>
              </div>
            </div>
          </section>



          {/* Admission Process */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">입학 전형</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">지원 자격</h3>
                
                <div class="mb-6">
                  <h4 class="font-semibold mb-2">석사 과정</h4>
                  <ul class="space-y-1 text-gray-600 text-sm">
                    <li>• 학사학위 소지자 (4년제 대학 졸업)</li>
                    <li>• GPA 3.0/4.0 이상 (또는 B학점 이상)</li>
                    <li>• 관련 전공 또는 동등한 학력</li>
                  </ul>
                </div>
                
                <div class="mb-6">
                  <h4 class="font-semibold mb-2">박사 과정</h4>
                  <ul class="space-y-1 text-gray-600 text-sm">
                    <li>• 석사학위 소지자</li>
                    <li>• 연구계획서 및 연구 경력</li>
                    <li>• 지도교수 사전 승낙 (권장)</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-semibold mb-2">언어 요건</h4>
                  <div class="space-y-2 text-sm">
                    <div class="bg-purple-50 rounded p-2">
                      <strong>한국어 과정:</strong> TOPIK 5급 이상
                    </div>
                    <div class="bg-purple-50 rounded p-2">
                      <strong>영어 과정:</strong> TOEFL 90+ / IELTS 6.5+
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">전형 요소</h3>
                
                <div class="space-y-4">
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                      서류 심사 (50%)
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• 성적증명서</li>
                      <li>• 연구계획서</li>
                      <li>• 추천서</li>
                    </ul>
                  </div>
                  
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                      면접 시험 (30%)
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• 연구 계획 발표</li>
                      <li>• 전공 지식 질의응답</li>
                      <li>• 영어 또는 한국어 면접</li>
                    </ul>
                  </div>
                  
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                      필기 시험 (20%)
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• 전공 필기시험</li>
                      <li>• 연구방법론 (박사 과정)</li>
                      <li>• 일부 학과에서 실시</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Funding and Scholarships */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">연구비 및 장학금</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-green-600">정부 지원</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">BK21 프로그램</h4>
                    <p class="text-xs text-gray-600 mb-1">우수 연구 프로그램 지원</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">석사 월 100만원</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">GKS 대학원</h4>
                    <p class="text-xs text-gray-600 mb-1">정부초청 장학생</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">전액 + 생활비</span>
                  </div>
                </div>
              </div>
              
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-blue-600">대학 지원</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">연구조교 (RA)</h4>
                    <p class="text-xs text-gray-600 mb-1">연구 프로젝트 참여</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">월 80-150만원</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">교육조교 (TA)</h4>
                    <p class="text-xs text-gray-600 mb-1">학부 수업 보조</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">월 50-80만원</span>
                  </div>
                </div>
              </div>
              
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-purple-600">기타 지원</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">연구재단 과제</h4>
                    <p class="text-xs text-gray-600 mb-1">개별 연구비 지원</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">과제별 상이</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">산학협력 프로젝트</h4>
                    <p class="text-xs text-gray-600 mb-1">기업 연계 연구</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">프로젝트별</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Research Support */}
          <section class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">연구 지원 시설</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-microscope text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">첨단 연구실</h3>
                <p class="text-sm text-gray-600">최신 장비와 기술이 완비된 전문 연구실</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-book-open text-indigo-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">도서관 시설</h3>
                <p class="text-sm text-gray-600">24시간 이용 가능한 전자자료 및 논문 DB</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-laptop text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">컴퓨팅 자원</h3>
                <p class="text-sm text-gray-600">고성능 서버 및 클라우드 컴퓨팅 지원</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-globe text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">국제 교류</h3>
                <p class="text-sm text-gray-600">해외 대학과의 공동연구 및 교환 프로그램</p>
              </div>
            </div>
          </section>

          {/* Career Prospects */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">졸업 후 진로</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">학계 진출</h3>
                <ul class="space-y-3">
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-chalkboard-teacher text-gray-400 mt-1"></i>
                    <div>
                      <strong>대학교수</strong>
                      <p class="text-sm text-gray-600">국내외 대학 교수직, 박사후연구원</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-flask text-gray-400 mt-1"></i>
                    <div>
                      <strong>연구원</strong>
                      <p class="text-sm text-gray-600">정부출연연구소, 기업연구소 선임연구원</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-graduation-cap text-gray-400 mt-1"></i>
                    <div>
                      <strong>박사후과정</strong>
                      <p class="text-sm text-gray-600">해외 명문대학 포스닥 연구원</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">산업계 진출</h3>
                <ul class="space-y-3">
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-building text-gray-400 mt-1"></i>
                    <div>
                      <strong>대기업</strong>
                      <p class="text-sm text-gray-600">삼성, LG, 현대 등 연구개발 부서</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-lightbulb text-gray-400 mt-1"></i>
                    <div>
                      <strong>창업</strong>
                      <p class="text-sm text-gray-600">기술창업, 스타트업 창립 및 CTO</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-chart-line text-gray-400 mt-1"></i>
                    <div>
                      <strong>컨설팅</strong>
                      <p class="text-sm text-gray-600">전문 컨설턴트, 정책 개발 전문가</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick="alert('지원 서비스는 준비 중입니다!')" class="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold mr-4">
              지금 지원하기
            </button>
            <a href="/study" class="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              뒤로 가기
            </a>
          </div>
        </div>
      </main>
    </div>
  )
})

// Job Seekers page (구직정보 보기)
// 구직자 페이지 - 로그인 사용자만 접근 가능  
app.get('/jobseekers', optionalAuth, (c) => {
  const user = c.get('user');
  
  // 모든 사용자(로그인/비로그인)에게 페이지를 표시
  // 클라이언트 사이드에서 로그인 상태를 체크하도록 변경
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
// 에이전트 전용 대시보드
app.get('/agents', optionalAuth, (c) => {
  const user = c.get('user');
  
  // 에이전트가 아닌 경우 접근 제한
  if (!user || user.user_type !== 'agent') {
    throw new HTTPException(403, { message: '에이전트만 접근할 수 있는 페이지입니다.' });
  }
  
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
                <span class="text-xs text-gray-500">에이전트 대시보드</span>
              </div>
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
      </header>

      {/* Agents Dashboard Content */}
      <main class="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">환영합니다, <span id="agent-name">{user.name}</span>님!</h1>
              <p class="text-blue-100">인재 매칭 및 관리 대시보드</p>
            </div>
            <div class="text-6xl opacity-20">
              <i class="fas fa-handshake"></i>
            </div>
          </div>
        </div>

        {/* Agent Statistics */}
        <div class="grid md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900" id="stat-jobseekers">0</p>
                <p class="text-gray-600 text-sm">전체 구직자</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-handshake text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900" id="stat-placements">0</p>
                <p class="text-gray-600 text-sm">매칭 성공</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-percentage text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900" id="stat-success-rate">0%</p>
                <p class="text-gray-600 text-sm">성공률</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-coins text-orange-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900" id="stat-commission">0%</p>
                <p class="text-gray-600 text-sm">수수료율</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div class="grid md:grid-cols-3 gap-8">
          {/* Managed Jobseekers */}
          <div class="md:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">관리 구직자 목록</h2>
                <a href="/agents/assign" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                  <i class="fas fa-plus mr-2"></i>구직자 할당
                </a>
              </div>
              
              <div id="managed-jobseekers-list" class="space-y-4">
                {/* Jobseekers list will be loaded here */}
              </div>
              
              <div class="mt-6 text-center">
                <a href="/jobseekers" class="text-blue-600 font-medium hover:underline">
                  모든 구직자 보기 →
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div class="space-y-6">
            {/* Quick Actions */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">빠른 액션</h2>
              <div class="space-y-3">
                <a href="/agents/profile/edit" class="block w-full text-left p-3 border border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <i class="fas fa-user-edit text-blue-600 mr-3"></i>
                  <span class="font-medium text-blue-700">프로필 수정</span>
                </a>
                <a href="/jobseekers" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-search text-blue-600 mr-3"></i>
                  <span class="font-medium">구직자 검색</span>
                </a>
                <a href="/jobs" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-briefcase text-green-600 mr-3"></i>
                  <span class="font-medium">구인공고 보기</span>
                </a>
                <a href="/matching" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-magic text-purple-600 mr-3"></i>
                  <span class="font-medium">AI 매칭</span>
                </a>
              </div>
            </div>
            
            {/* Agent Info */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900">에이전시 정보</h2>
                <a href="/agents/profile/edit" class="text-blue-600 hover:text-blue-700 text-sm">
                  <i class="fas fa-edit"></i>
                </a>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">에이전시:</span>
                  <span class="font-medium" id="agency-name">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">경력:</span>
                  <span class="font-medium" id="experience-years">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">담당 지역:</span>
                  <span class="font-medium" id="primary-regions">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">전문분야:</span>
                  <span class="font-medium" id="service-areas">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">연락처:</span>
                  <span class="font-medium" id="contact-phone">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Agent Dashboard JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 에이전트 대시보드 JavaScript ====================
        
        // 페이지 로드 시 데이터 불러오기
        document.addEventListener('DOMContentLoaded', async () => {
          await loadAgentDashboard();
        });
        
        // 대시보드 데이터 로드
        async function loadAgentDashboard() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              console.error('로그인 토큰이 없습니다.');
              return;
            }
            
            // 에이전트 정보 로드
            await loadAgentInfo();
            
            // 구직자 목록 로드
            await loadManagedJobseekers();
            
            // 통계 로드
            await loadAgentStats();
            
          } catch (error) {
            console.error('대시보드 로드 오류:', error);
          }
        }
        
        // 에이전트 정보 로드
        async function loadAgentInfo() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            // 새로운 agents API 사용
            const response = await fetch('/api/agents/profile', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('에이전트 정보:', result);
            
            if (result.success && result.profile) {
              const profile = result.profile;
              
              // 에이전시 정보 표시
              if (profile.agency_name) {
                document.getElementById('agency-name').textContent = profile.agency_name;
              }
              
              if (profile.experience_years !== null && profile.experience_years !== undefined) {
                document.getElementById('experience-years').textContent = profile.experience_years + '년';
              }
              
              // 담당 지역 표시 (새 필드)
              if (profile.primary_regions && profile.primary_regions.length > 0) {
                const regionMap = {
                  'vietnam': '🇻🇳 베트남',
                  'thailand': '🇹🇭 태국',
                  'philippines': '🇵🇭 필리핀',
                  'uzbekistan': '🇺🇿 우즈베키스탄',
                  'mongolia': '🇲🇳 몽골',
                  'nepal': '🇳🇵 네팔',
                  'myanmar': '🇲🇲 미얀마',
                  'cambodia': '🇰🇭 캄보디아',
                  'indonesia': '🇮🇩 인도네시아',
                  'bangladesh': '🇧🇩 방글라데시',
                  'sri_lanka': '🇱🇰 스리랑카',
                  'other': '🌏 기타'
                };
                const regions = profile.primary_regions.map(r => regionMap[r] || r).join(', ');
                document.getElementById('primary-regions').textContent = regions;
              }
              
              // 전문 분야 표시 (새 필드)
              if (profile.service_areas && profile.service_areas.length > 0) {
                const areaMap = {
                  'manufacturing': '제조업', 'it': 'IT', 'construction': '건설',
                  'agriculture': '농업', 'service': '서비스', 'hospitality': '호텔/관광',
                  'healthcare': '의료', 'education': '교육', 'logistics': '물류',
                  'food': '식음료', 'retail': '유통', 'engineering': '엔지니어링',
                  'other': '기타'
                };
                const areas = profile.service_areas.map(a => areaMap[a] || a).join(', ');
                document.getElementById('service-areas').textContent = areas;
              }
              
              // 연락처 표시
              if (profile.contact_phone) {
                document.getElementById('contact-phone').textContent = profile.contact_phone;
              }
              
              // 통계 정보
              if (profile.total_placements !== null && profile.total_placements !== undefined) {
                document.getElementById('stat-placements').textContent = profile.total_placements;
              }
              
              if (profile.success_rate !== null && profile.success_rate !== undefined) {
                document.getElementById('stat-success-rate').textContent = profile.success_rate + '%';
              }
              
              if (profile.commission_rate !== null && profile.commission_rate !== undefined) {
                document.getElementById('stat-commission').textContent = profile.commission_rate + '%';
              }
            }
            
          } catch (error) {
            console.error('에이전트 정보 로드 오류:', error);
          }
        }
        
        // 관리 구직자 목록 로드 (에이전트에게 할당된 구직자만)
        async function loadManagedJobseekers() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            // 새로운 에이전트 전용 API 사용
            const response = await fetch('/api/agents/jobseekers?limit=10&status=active', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('할당된 구직자 목록:', result);
            
            if (result.success && result.jobseekers) {
              displayJobseekers(result.jobseekers);
              
              // 구직자 수 업데이트
              document.getElementById('stat-jobseekers').textContent = result.pagination?.total || result.jobseekers.length;
            }
            
          } catch (error) {
            console.error('구직자 목록 로드 오류:', error);
          }
        }
        
        // 구직자 목록 표시 (할당 정보 포함)
        function displayJobseekers(jobseekers) {
          const container = document.getElementById('managed-jobseekers-list');
          if (!container) return;
          
          if (jobseekers.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-4xl mb-2"></i>
                <p>할당된 구직자가 없습니다</p>
                <p class="text-sm mt-2">구직자 검색에서 인재를 찾아 할당해보세요!</p>
              </div>
            \`;
            return;
          }
          
          container.innerHTML = jobseekers.map(js => {
            const fullName = \`\${js.first_name || ''} \${js.last_name || ''}\`.trim();
            const skills = js.skills ? (typeof js.skills === 'string' ? JSON.parse(js.skills) : js.skills) : [];
            const skillsText = Array.isArray(skills) ? skills.slice(0, 3).join(', ') : '';
            
            // 할당 정보
            const assignedDate = js.assigned_date ? new Date(js.assigned_date).toLocaleDateString('ko-KR') : '-';
            const assignmentStatus = js.assignment_status || 'active';
            const statusBadge = {
              active: '<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">활성</span>',
              inactive: '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">비활성</span>',
              completed: '<span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">완료</span>'
            }[assignmentStatus] || '';
            
            return \`
              <div class="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center flex-1">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div class="ml-4 flex-1">
                      <div class="flex items-center space-x-2">
                        <h3 class="font-medium text-gray-900">\${fullName || 'Unknown'}</h3>
                        \${statusBadge}
                      </div>
                      <p class="text-gray-600 text-sm">
                        \${js.nationality || '-'} • \${js.experience_years || 0}년 경력
                      </p>
                      \${skillsText ? \`<p class="text-blue-600 text-xs mt-1">\${skillsText}</p>\` : ''}
                      <p class="text-gray-500 text-xs mt-1">할당일: \${assignedDate}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <a href="/jobseekers/\${js.id}" class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors" title="상세보기">
                      <i class="fas fa-eye mr-1"></i>보기
                    </a>
                    <button onclick="unassignJobseeker(\${js.id})" class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors" title="할당 해제">
                      <i class="fas fa-user-times mr-1"></i>해제
                    </button>
                  </div>
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 구직자 할당 해제
        async function unassignJobseeker(jobseekerId) {
          if (!confirm('이 구직자의 할당을 해제하시겠습니까?')) {
            return;
          }
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/agents/jobseekers/\${jobseekerId}/unassign\`, {
              method: 'DELETE',
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('할당이 해제되었습니다.');
              await loadManagedJobseekers(); // 목록 새로고침
              await loadAgentStats(); // 통계 새로고침
            } else {
              alert('할당 해제 실패: ' + (result.error || '알 수 없는 오류'));
            }
          } catch (error) {
            console.error('할당 해제 오류:', error);
            alert('할당 해제 중 오류가 발생했습니다.');
          }
        }
        
        // 통계 로드 (새로운 API 사용)
        async function loadAgentStats() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/agents/stats', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('에이전트 통계:', result);
            
            if (result.success && result.stats) {
              const stats = result.stats;
              
              // 통계 업데이트
              if (stats.active_assignments !== undefined) {
                document.getElementById('stat-jobseekers').textContent = stats.active_assignments;
              }
              if (stats.total_placements !== undefined) {
                document.getElementById('stat-placements').textContent = stats.total_placements;
              }
              if (stats.success_rate !== undefined) {
                document.getElementById('stat-success-rate').textContent = stats.success_rate.toFixed(1) + '%';
              }
              if (stats.commission_rate !== undefined) {
                document.getElementById('stat-commission').textContent = stats.commission_rate + '%';
              }
            }
          } catch (error) {
            console.error('통계 로드 오류:', error);
          }
        }
        
        // ==================== 끝: 에이전트 대시보드 JavaScript ====================
      `}}>
      </script>
    </div>
  )
})

// Agent Jobseeker Assignment Page
app.get('/agents/assign', optionalAuth, (c) => {
  const user = c.get('user');
  
  // 에이전트가 아닌 경우 접근 제한
  if (!user || user.user_type !== 'agent') {
    throw new HTTPException(403, { message: '에이전트만 접근할 수 있는 페이지입니다.' });
  }
  
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
                <span class="text-xs text-gray-500">구직자 할당</span>
              </div>
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
      </header>

      {/* Assignment Page Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div class="mb-6">
          <a href="/agents" class="text-blue-600 hover:underline">
            <i class="fas fa-arrow-left mr-2"></i>에이전트 대시보드로 돌아가기
          </a>
        </div>

        {/* Page Title */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">나의 구직자</h1>
          <p class="text-gray-600">나에게 할당된 구직자 목록을 확인하세요</p>
        </div>

        {/* Search and Filter */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <select 
                id="status-filter" 
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="active">활성 상태</option>
                <option value="all">전체</option>
                <option value="inactive">비활성</option>
                <option value="completed">완료</option>
              </select>
            </div>
            <button 
              onclick="filterJobseekers()" 
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <i class="fas fa-filter mr-2"></i>필터 적용
            </button>
          </div>
        </div>

        {/* Assigned Jobseekers List */}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">할당된 구직자 목록</h2>
          
          <div id="available-jobseekers-list" class="space-y-4 mb-6">
            {/* Jobseekers list will be loaded here */}
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
              <p>로딩 중...</p>
            </div>
          </div>

          {/* Pagination */}
          <div id="pagination-container" class="flex items-center justify-between pt-6 border-t">
            {/* Pagination controls will be loaded here */}
          </div>
        </div>
      </main>

      {/* Assignment Modal */}
      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 구직자 할당 페이지 JavaScript ====================
        
        let currentPage = 1;
        let currentSearch = '';
        let selectedJobseekerId = null;
        
        // 페이지 로드 시 실행
        document.addEventListener('DOMContentLoaded', async () => {
          await loadAssignedJobseekers(1, 'active');
        });
        
        // 필터 실행
        async function filterJobseekers() {
          const status = document.getElementById('status-filter').value;
          currentPage = 1;
          await loadAssignedJobseekers(1, status);
        }
        
        // 할당된 구직자 목록 로드
        async function loadAssignedJobseekers(page = 1, status = 'active') {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              console.error('토큰이 없습니다. 로그인이 필요합니다.');
              alert('로그인이 필요합니다.');
              window.location.href = '/';
              return;
            }
            
            let url = \`/api/agents/jobseekers?page=\${page}&limit=20&status=\${status}\`;
            
            console.log('요청 URL:', url);
            
            const response = await fetch(url, {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            console.log('응답 상태:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('서버 응답 오류:', response.status, errorText);
              throw new Error(\`서버 오류: \${response.status}\`);
            }
            
            const result = await response.json();
            console.log('할당된 구직자:', result);
            
            if (result.success) {
              displayAssignedJobseekers(result.jobseekers || []);
              displayPagination(result.pagination);
              currentPage = page;
            } else {
              console.error('API 오류:', result.error);
              const container = document.getElementById('available-jobseekers-list');
              if (container) {
                container.innerHTML = \`
                  <div class="text-center py-12 text-red-500">
                    <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
                    <p class="text-lg font-medium">목록을 불러올 수 없습니다</p>
                    <p class="text-sm mt-2">\${result.error || '알 수 없는 오류'}</p>
                    <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                      다시 시도
                    </button>
                  </div>
                \`;
              }
            }
          } catch (error) {
            console.error('구직자 목록 로드 오류:', error);
            const container = document.getElementById('available-jobseekers-list');
            if (container) {
              container.innerHTML = \`
                <div class="text-center py-12 text-red-500">
                  <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
                  <p class="text-lg font-medium">오류가 발생했습니다</p>
                  <p class="text-sm mt-2">\${error.message || '구직자 목록을 불러오는 중 오류가 발생했습니다.'}</p>
                  <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    다시 시도
                  </button>
                </div>
              \`;
            }
          }
        }
        
        // 할당된 구직자 목록 표시
        function displayAssignedJobseekers(jobseekers) {
          const container = document.getElementById('available-jobseekers-list');
          if (!container) return;
          
          if (jobseekers.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-12 text-gray-500">
                <i class="fas fa-user-slash text-5xl mb-4"></i>
                <p class="text-lg font-medium">할당된 구직자가 없습니다</p>
                <p class="text-sm mt-2">아직 나에게 할당된 구직자가 없습니다.</p>
              </div>
            \`;
            return;
          }
          
          container.innerHTML = jobseekers.map(js => {
            const fullName = \`\${js.first_name || ''} \${js.last_name || ''}\`.trim();
            const skills = js.skills ? (typeof js.skills === 'string' ? JSON.parse(js.skills) : js.skills) : [];
            const skillsText = Array.isArray(skills) ? skills.slice(0, 4).join(', ') : '';
            const koreanLevel = js.korean_level || '-';
            const assignedDate = js.assigned_date ? new Date(js.assigned_date).toLocaleDateString('ko-KR') : '-';
            const statusBadge = js.assignment_status === 'active' ? 
              '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">활성</span>' :
              js.assignment_status === 'completed' ?
              '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">완료</span>' :
              '<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">비활성</span>';
            
            return \`
              <div class="p-4 border rounded-lg hover:border-blue-300 transition-all">
                <div class="flex items-start justify-between">
                  <div class="flex items-start flex-1">
                    <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i class="fas fa-user text-white text-xl"></i>
                    </div>
                    <div class="ml-4 flex-1">
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-lg text-gray-900">\${fullName || 'Unknown'}</h3>
                        \${statusBadge}
                      </div>
                      <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span><i class="fas fa-calendar mr-1"></i>할당일: \${assignedDate}</span>
                        <span><i class="fas fa-flag mr-1"></i>\${js.nationality || '-'}</span>
                        <span><i class="fas fa-briefcase mr-1"></i>\${js.experience_years || 0}년 경력</span>
                        <span><i class="fas fa-language mr-1"></i>한국어: \${koreanLevel}</span>
                      </div>
                      \${skillsText ? \`
                        <div class="mt-2">
                          <p class="text-xs text-gray-500 mb-1">주요 스킬:</p>
                          <p class="text-sm text-blue-600 font-medium">\${skillsText}</p>
                        </div>
                      \` : ''}
                      \${js.assignment_notes ? \`
                        <p class="text-sm text-gray-600 mt-2">
                          <i class="fas fa-sticky-note mr-1"></i>메모: \${js.assignment_notes}
                        </p>
                      \` : ''}
                    </div>
                  </div>
                  <div class="flex flex-col space-y-2 ml-4">
                    <a 
                      href="/jobseekers/\${js.id}" 
                      class="px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap">
                      <i class="fas fa-eye mr-1"></i>상세보기
                    </a>
                    \${js.assignment_status === 'active' ? \`
                      <button 
                        onclick="updateAssignmentStatus(\${js.assignment_id}, 'completed')" 
                        class="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm whitespace-nowrap">
                        <i class="fas fa-check mr-1"></i>완료처리
                      </button>
                    \` : ''}
                  </div>
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 페이지네이션 표시
        function displayPagination(pagination) {
          const container = document.getElementById('pagination-container');
          if (!container || !pagination) return;
          
          const { page, totalPages, total } = pagination;
          
          if (totalPages <= 1) {
            container.innerHTML = \`<p class="text-sm text-gray-600">전체 \${total}명</p>\`;
            return;
          }
          
          const status = document.getElementById('status-filter')?.value || 'active';
          let paginationHTML = \`
            <div class="flex items-center space-x-2">
              <button 
                onclick="loadAssignedJobseekers(\${page - 1}, '\${status}')" 
                \${page <= 1 ? 'disabled' : ''}
                class="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="text-sm text-gray-600">
                \${page} / \${totalPages} 페이지 (전체 \${total}명)
              </span>
              <button 
                onclick="loadAssignedJobseekers(\${page + 1}, '\${status}')" 
                \${page >= totalPages ? 'disabled' : ''}
                class="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          \`;
          
          container.innerHTML = paginationHTML;
        }
        
        // 할당 상태 업데이트 (완료 처리)
        async function updateAssignmentStatus(assignmentId, newStatus) {
          if (!confirm('이 구직자를 완료 상태로 변경하시겠습니까?')) {
            return;
          }
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            const response = await fetch(\`/api/agents/assignments/\${assignmentId}\`, {
              method: 'PATCH',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: newStatus })
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('상태가 성공적으로 변경되었습니다!');
              // 목록 새로고침
              const status = document.getElementById('status-filter')?.value || 'active';
              await loadAssignedJobseekers(currentPage, status);
            } else {
              alert('상태 변경 실패: ' + (result.error || '알 수 없는 오류'));
            }
          } catch (error) {
            console.error('상태 변경 오류:', error);
            alert('상태 변경 중 오류가 발생했습니다.');
          }
        }
        
        // ==================== 끝: 구직자 할당 페이지 JavaScript ====================
      `}}>
      </script>
    </div>
  )
})

// Agent Profile Edit Page
app.get('/agents/profile/edit', optionalAuth, (c) => {
  const user = c.get('user');
  
  // 에이전트가 아닌 경우 접근 제한
  if (!user || user.user_type !== 'agent') {
    throw new HTTPException(403, { message: '에이전트만 접근할 수 있는 페이지입니다.' });
  }
  
  // 지역 리스트 정의
  const regions = [
    { value: 'vietnam', label: '베트남', flag: '🇻🇳' },
    { value: 'thailand', label: '태국', flag: '🇹🇭' },
    { value: 'philippines', label: '필리핀', flag: '🇵🇭' },
    { value: 'uzbekistan', label: '우즈베키스탄', flag: '🇺🇿' },
    { value: 'mongolia', label: '몽골', flag: '🇲🇳' },
    { value: 'nepal', label: '네팔', flag: '🇳🇵' },
    { value: 'myanmar', label: '미얀마', flag: '🇲🇲' },
    { value: 'cambodia', label: '캄보디아', flag: '🇰🇭' },
    { value: 'indonesia', label: '인도네시아', flag: '🇮🇩' },
    { value: 'bangladesh', label: '방글라데시', flag: '🇧🇩' },
    { value: 'sri_lanka', label: '스리랑카', flag: '🇱🇰' },
    { value: 'other', label: '기타', flag: '🌏' }
  ];
  
  const serviceAreas = [
    { value: 'manufacturing', label: '제조업' },
    { value: 'it', label: 'IT/소프트웨어' },
    { value: 'construction', label: '건설' },
    { value: 'agriculture', label: '농업' },
    { value: 'service', label: '서비스업' },
    { value: 'hospitality', label: '호텔/관광' },
    { value: 'healthcare', label: '의료/간병' },
    { value: 'education', label: '교육' },
    { value: 'logistics', label: '물류/운송' },
    { value: 'food', label: '식음료' },
    { value: 'retail', label: '유통/판매' },
    { value: 'engineering', label: '엔지니어링' },
    { value: 'other', label: '기타' }
  ];
  
  const languageLevels = [
    { value: 'native', label: '모국어' },
    { value: 'fluent', label: '유창함' },
    { value: 'advanced', label: '상급' },
    { value: 'intermediate', label: '중급' },
    { value: 'beginner', label: '초급' },
    { value: 'none', label: '불가' }
  ];
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">프로필 수정</span>
              </div>
            </a>
          </div>
          <div id="auth-buttons-container" class="flex items-center space-x-3"></div>
        </nav>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div class="mb-6">
          <a href="/agents" class="text-blue-600 hover:underline">
            <i class="fas fa-arrow-left mr-2"></i>에이전트 대시보드로 돌아가기
          </a>
        </div>

        {/* Page Title */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">프로필 수정</h1>
          <p class="text-gray-600">에이전시 정보를 업데이트하세요</p>
        </div>

        {/* Profile Form */}
        <form id="profile-edit-form" class="space-y-6">
          {/* 기본 정보 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-building text-blue-600 mr-2"></i>기본 정보
            </h2>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  에이전시명 <span class="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="agency_name" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="회사명 입력"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  라이선스 번호
                </label>
                <input 
                  type="text" 
                  id="license_number"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="사업자등록번호 등"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  연락처 <span class="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id="contact_phone"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+82-10-1234-5678"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  이메일 <span class="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="contact_email"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@agency.com"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  경력 연수
                </label>
                <input 
                  type="number" 
                  id="experience_years"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                에이전시 소개
              </label>
              <textarea 
                id="introduction"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="에이전시의 강점, 특징, 주요 실적 등을 소개해주세요..."></textarea>
            </div>
          </div>

          {/* 담당 지역 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-globe-asia text-blue-600 mr-2"></i>담당 지역 <span class="text-red-500">*</span>
            </h2>
            <p class="text-sm text-gray-600 mb-4">주요 활동 지역을 선택해주세요 (복수 선택 가능)</p>
            
            <div class="grid md:grid-cols-3 gap-3">
              {regions.map(region => (
                <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="primary_regions" 
                    value={region.value}
                    class="mr-3 w-4 h-4 text-blue-600"
                  />
                  <span class="text-2xl mr-2">{region.flag}</span>
                  <span class="font-medium">{region.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 전문 분야 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-briefcase text-blue-600 mr-2"></i>전문 분야
            </h2>
            <p class="text-sm text-gray-600 mb-4">주요 서비스 분야를 선택해주세요 (복수 선택 가능)</p>
            
            <div class="grid md:grid-cols-3 gap-3">
              {serviceAreas.map(area => (
                <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="service_areas" 
                    value={area.value}
                    class="mr-3 w-4 h-4 text-blue-600"
                  />
                  <span class="font-medium">{area.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 언어 능력 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-language text-blue-600 mr-2"></i>언어 능력
            </h2>
            
            <div class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">한국어</label>
                  <select id="lang_korean" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">선택하세요</option>
                    {languageLevels.map(level => (
                      <option value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">영어</label>
                  <select id="lang_english" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">선택하세요</option>
                    {languageLevels.map(level => (
                      <option value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div id="additional-languages" class="space-y-3">
                {/* Additional language fields will be added here */}
              </div>
              
              <button 
                type="button" 
                onclick="addLanguageField()" 
                class="text-blue-600 hover:text-blue-700 font-medium text-sm">
                <i class="fas fa-plus mr-1"></i>언어 추가
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div class="flex space-x-4">
            <button 
              type="submit" 
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
              <i class="fas fa-save mr-2"></i>저장
            </button>
            <a 
              href="/agents" 
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg text-center">
              취소
            </a>
          </div>
        </form>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 프로필 수정 JavaScript ====================
        
        let additionalLangCount = 0;
        
        // 페이지 로드 시 프로필 정보 불러오기
        document.addEventListener('DOMContentLoaded', async () => {
          await loadProfileData();
        });
        
        // 프로필 데이터 로드
        async function loadProfileData() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/agents/profile', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            
            const result = await response.json();
            if (result.success && result.profile) {
              populateForm(result.profile);
            }
          } catch (error) {
            console.error('프로필 로드 오류:', error);
            alert('프로필 정보를 불러오는데 실패했습니다.');
          }
        }
        
        // 폼에 데이터 채우기
        function populateForm(profile) {
          document.getElementById('agency_name').value = profile.agency_name || '';
          document.getElementById('license_number').value = profile.license_number || '';
          document.getElementById('contact_phone').value = profile.contact_phone || '';
          document.getElementById('contact_email').value = profile.contact_email || '';
          document.getElementById('experience_years').value = profile.experience_years || '';
          document.getElementById('introduction').value = profile.introduction || '';
          
          // 체크박스 - 담당 지역
          if (profile.primary_regions && Array.isArray(profile.primary_regions)) {
            profile.primary_regions.forEach(region => {
              const checkbox = document.querySelector(\`input[name="primary_regions"][value="\${region}"]\`);
              if (checkbox) checkbox.checked = true;
            });
          }
          
          // 체크박스 - 전문 분야
          if (profile.service_areas && Array.isArray(profile.service_areas)) {
            profile.service_areas.forEach(area => {
              const checkbox = document.querySelector(\`input[name="service_areas"][value="\${area}"]\`);
              if (checkbox) checkbox.checked = true;
            });
          }
          
          // 언어 능력
          if (profile.language_skills) {
            const skills = typeof profile.language_skills === 'string' 
              ? JSON.parse(profile.language_skills) 
              : profile.language_skills;
            
            if (skills.korean) document.getElementById('lang_korean').value = skills.korean;
            if (skills.english) document.getElementById('lang_english').value = skills.english;
            
            // 추가 언어
            Object.keys(skills).forEach(lang => {
              if (lang !== 'korean' && lang !== 'english') {
                addLanguageField(lang, skills[lang]);
              }
            });
          }
        }
        
        // 언어 필드 추가
        function addLanguageField(langName = '', langLevel = '') {
          const container = document.getElementById('additional-languages');
          const fieldId = 'lang_' + (++additionalLangCount);
          
          const fieldHTML = \`
            <div class="flex space-x-3" id="lang-field-\${additionalLangCount}">
              <input 
                type="text" 
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="언어명 (예: 베트남어)"
                value="\${langName}"
                data-lang-name
              />
              <select class="flex-1 px-4 py-2 border border-gray-300 rounded-lg" data-lang-level>
                <option value="">수준 선택</option>
                <option value="native" \${langLevel === 'native' ? 'selected' : ''}>모국어</option>
                <option value="fluent" \${langLevel === 'fluent' ? 'selected' : ''}>유창함</option>
                <option value="advanced" \${langLevel === 'advanced' ? 'selected' : ''}>상급</option>
                <option value="intermediate" \${langLevel === 'intermediate' ? 'selected' : ''}>중급</option>
                <option value="beginner" \${langLevel === 'beginner' ? 'selected' : ''}>초급</option>
              </select>
              <button 
                type="button" 
                onclick="removeLanguageField(\${additionalLangCount})"
                class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <i class="fas fa-times"></i>
              </button>
            </div>
          \`;
          
          container.insertAdjacentHTML('beforeend', fieldHTML);
        }
        
        // 언어 필드 제거
        function removeLanguageField(id) {
          const field = document.getElementById('lang-field-' + id);
          if (field) field.remove();
        }
        
        // 폼 제출
        document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            // 데이터 수집
            const formData = {
              agency_name: document.getElementById('agency_name').value.trim(),
              license_number: document.getElementById('license_number').value.trim(),
              contact_phone: document.getElementById('contact_phone').value.trim(),
              contact_email: document.getElementById('contact_email').value.trim(),
              experience_years: parseInt(document.getElementById('experience_years').value) || 0,
              introduction: document.getElementById('introduction').value.trim(),
              primary_regions: Array.from(document.querySelectorAll('input[name="primary_regions"]:checked')).map(cb => cb.value),
              service_areas: Array.from(document.querySelectorAll('input[name="service_areas"]:checked')).map(cb => cb.value),
              language_skills: {}
            };
            
            // 필수 입력 검증
            if (!formData.agency_name) {
              alert('에이전시명을 입력해주세요.');
              return;
            }
            if (!formData.contact_phone) {
              alert('연락처를 입력해주세요.');
              return;
            }
            if (!formData.contact_email) {
              alert('이메일을 입력해주세요.');
              return;
            }
            if (formData.primary_regions.length === 0) {
              alert('최소 1개 이상의 담당 지역을 선택해주세요.');
              return;
            }
            
            // 언어 능력 수집
            const koreanLevel = document.getElementById('lang_korean').value;
            const englishLevel = document.getElementById('lang_english').value;
            if (koreanLevel) formData.language_skills.korean = koreanLevel;
            if (englishLevel) formData.language_skills.english = englishLevel;
            
            // 추가 언어
            document.querySelectorAll('#additional-languages > div').forEach(field => {
              const langName = field.querySelector('[data-lang-name]').value.trim();
              const langLevel = field.querySelector('[data-lang-level]').value;
              if (langName && langLevel) {
                formData.language_skills[langName.toLowerCase()] = langLevel;
              }
            });
            
            // API 요청
            const response = await fetch('/api/agents/profile', {
              method: 'PUT',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('프로필이 성공적으로 업데이트되었습니다!');
              window.location.href = '/agents';
            } else {
              alert('프로필 업데이트 실패: ' + (result.error || '알 수 없는 오류'));
            }
          } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
          }
        });
        
        // ==================== 끝: 프로필 수정 JavaScript ====================
      `}}>
      </script>
    </div>
  )
})

// Statistics page - 관리자 전용 페이지
app.get('/statistics', optionalAuth, (c) => {
  const user = c.get('user');
  
  // 비로그인 사용자나 관리자가 아닌 사용자는 로그인 유도 페이지 표시
  if (!user || user.user_type !== 'admin') {
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

        {/* 관리자 전용 접근 제한 메시지 */}
        <main class="container mx-auto px-4 py-16">
          <div class="max-w-2xl mx-auto text-center">
            <div class="bg-white rounded-xl shadow-lg p-12">
              {/* 아이콘과 제목 */}
              <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <i class="fas fa-chart-line text-red-600 text-3xl"></i>
              </div>
              
              <h1 class="text-3xl font-bold text-gray-900 mb-4">📊 통계 대시보드</h1>
              <h2 class="text-xl font-semibold text-red-600 mb-6">관리자 전용 페이지입니다</h2>
              
              <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <p class="text-gray-700 text-lg leading-relaxed mb-4">
                  이 페이지는 <strong class="text-red-600">관리자만 접근할 수 있는</strong> 통계 대시보드입니다.<br/>
                  플랫폼의 종합적인 운영 현황과 성과 분석 데이터를 제공합니다.
                </p>
                
                <div class="grid md:grid-cols-2 gap-4 mt-6">
                  <div class="text-left">
                    <h3 class="font-semibold text-gray-900 mb-2">📈 제공되는 통계 정보:</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                      <li>• 실시간 구인/구직 현황</li>
                      <li>• 매칭 성공률 분석</li>
                      <li>• 지역별/국가별 통계</li>
                      <li>• 월별 활동 추이</li>
                    </ul>
                  </div>
                  <div class="text-left">
                    <h3 class="font-semibold text-gray-900 mb-2">🔐 접근 권한:</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                      <li>• 시스템 관리자</li>
                      <li>• 플랫폼 운영진</li>
                      <li>• 승인된 분석 담당자</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* 로그인 유도 */}
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">관리자 계정으로 로그인해주세요</h3>
                  <div class="space-y-3">
                    <button onclick="showLoginModal()" class="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
                      <i class="fas fa-sign-in-alt mr-3"></i>관리자 로그인
                    </button>
                    <p class="text-sm text-gray-500">
                      관리자 계정이 없으시다면 시스템 관리자에게 문의하세요
                    </p>
                  </div>
                </div>
                
                {/* 대안 페이지 안내 */}
                <div class="border-t border-gray-200 pt-6 mt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 대신 이런 페이지는 어떠세요?</h3>
                  <div class="grid md:grid-cols-3 gap-4">
                    <a href="/jobs" class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-briefcase text-blue-600"></i>
                      </div>
                      <div class="text-left">
                        <p class="font-medium text-gray-900">구인정보</p>
                        <p class="text-xs text-gray-500">최신 채용공고</p>
                      </div>
                    </a>
                    
                    <a href="/jobseekers" class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
                      <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user-tie text-green-600"></i>
                      </div>
                      <div class="text-left">
                        <p class="font-medium text-gray-900">구직정보</p>
                        <p class="text-xs text-gray-500">인재 프로필</p>
                      </div>
                    </a>
                    
                    <a href="/matching" class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
                      <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-magic text-purple-600"></i>
                      </div>
                      <div class="text-left">
                        <p class="font-medium text-gray-900">AI 매칭</p>
                        <p class="text-xs text-gray-500">스마트 매칭</p>
                      </div>
                    </a>
                  </div>
                </div>
                
                <div class="mt-6">
                  <a href="/" class="text-blue-600 hover:text-blue-800 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>메인 페이지로 돌아가기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // 관리자인 경우 정상 통계 페이지 표시
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            
            <div id="auth-buttons-container" class="flex items-center space-x-3">
              {/* 동적 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">📊 실시간 통계 대시보드</h1>
            <p class="text-gray-600 text-lg">플랫폼 운영 현황과 성과를 종합적으로 분석합니다</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <i class="fas fa-circle text-green-500 animate-pulse"></i>
              <span>실시간 업데이트</span>
            </div>
            <select id="period-selector" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="7">최근 7일</option>
              <option value="30" selected>최근 30일</option>
              <option value="90">최근 90일</option>
              <option value="365">1년</option>
            </select>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm font-medium">총 구인공고</p>
                <p class="text-3xl font-bold" id="total-jobs">156</p>
                <div class="flex items-center mt-2">
                  <i class="fas fa-arrow-up text-green-300 mr-1"></i>
                  <span class="text-green-300 text-sm">+12% 이번 달</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-blue-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <i class="fas fa-briefcase text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm font-medium">등록 구직자</p>
                <p class="text-3xl font-bold" id="total-jobseekers">2,348</p>
                <div class="flex items-center mt-2">
                  <i class="fas fa-arrow-up text-green-300 mr-1"></i>
                  <span class="text-green-300 text-sm">+8% 이번 달</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-green-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <i class="fas fa-users text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm font-medium">성공 매칭</p>
                <p class="text-3xl font-bold" id="successful-matches">89</p>
                <div class="flex items-center mt-2">
                  <i class="fas fa-arrow-up text-purple-300 mr-1"></i>
                  <span class="text-purple-300 text-sm">+23% 이번 달</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-purple-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <i class="fas fa-handshake text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm font-medium">참여 기업</p>
                <p class="text-3xl font-bold" id="total-companies">47</p>
                <div class="flex items-center mt-2">
                  <i class="fas fa-arrow-up text-orange-300 mr-1"></i>
                  <span class="text-orange-300 text-sm">+15% 이번 달</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-orange-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <i class="fas fa-building text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Charts Section */}
        <div class="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Monthly Trends Chart */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900">월별 활동 추이</h3>
              <div class="flex space-x-2">
                <button class="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md font-medium">구인공고</button>
                <button class="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">구직자</button>
                <button class="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">매칭</button>
              </div>
            </div>
            <div class="relative h-80">
              <canvas id="monthly-chart"></canvas>
            </div>
          </div>

          {/* Country Distribution Chart */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900">구직자 국가별 분포</h3>
              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                <i class="fas fa-download mr-1"></i>내보내기
              </button>
            </div>
            <div class="relative h-80">
              <canvas id="country-chart"></canvas>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div class="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Industry Breakdown */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">분야별 구인 현황</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span class="text-gray-700">IT/소프트웨어</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">42</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-16 h-full bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span class="text-gray-700">마케팅/영업</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">28</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-12 h-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <span class="text-gray-700">디자인</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">23</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-10 h-full bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                  <span class="text-gray-700">교육</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">19</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-8 h-full bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <span class="text-gray-700">기타</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">44</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-14 h-full bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Analytics */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">지역별 활동 현황</h3>
            <div class="relative h-64">
              <canvas id="region-chart"></canvas>
            </div>
          </div>

          {/* Performance Metrics */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">핵심 성과 지표</h3>
            <div class="space-y-6">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-700">매칭 성공률</span>
                  <span class="text-green-600 font-bold">87%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style="width: 87%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-700">사용자 만족도</span>
                  <span class="text-blue-600 font-bold">92%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style="width: 92%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-700">평균 매칭 시간</span>
                  <span class="text-purple-600 font-bold">3.2일</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full" style="width: 75%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-700">활성 사용자 비율</span>
                  <span class="text-orange-600 font-bold">78%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full" style="width: 78%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">최근 활동</h3>
            <div class="flex space-x-2">
              <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">전체</button>
              <button class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">매칭</button>
              <button class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">신규가입</button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활동</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2분 전</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">새로운 매칭 성공</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">김민수 → 삼성전자</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">성공</span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5분 전</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">신규 구인공고 등록</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">네이버 - UX Designer</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">활성</span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12분 전</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">새로운 구직자 가입</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Maria Garcia (스페인)</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">승인대기</span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18분 전</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">AI 매칭 분석 완료</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">시스템</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">완료</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Chart.js and Statistics JavaScript */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.js"></script>
      <script dangerouslySetInnerHTML={{__html: `
        // 페이지 로드 시 차트 초기화
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(function() {
            if (typeof Chart !== 'undefined') {
              initializeCharts();
              updateRealTimeData();
              
              // 5초마다 데이터 업데이트
              setInterval(updateRealTimeData, 5000);
            } else {
              console.error('Chart.js not loaded');
            }
          }, 1000);
        });

        // 차트 초기화 함수
        function initializeCharts() {
          // 월별 활동 추이 차트
          const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
          new Chart(monthlyCtx, {
            type: 'line',
            data: {
              labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월'],
              datasets: [{
                label: '구인공고',
                data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 42],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              }, {
                label: '구직자',
                data: [65, 78, 90, 95, 120, 140, 165, 180, 200, 235],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
              }, {
                label: '매칭 성공',
                data: [5, 8, 12, 15, 18, 25, 28, 32, 38, 45],
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
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

          // 국가별 분포 차트 (도넛 차트)
          const countryCtx = document.getElementById('country-chart').getContext('2d');
          new Chart(countryCtx, {
            type: 'doughnut',
            data: {
              labels: ['베트남', '중국', '필리핀', '미국', '일본', '태국', '기타'],
              datasets: [{
                data: [380, 290, 235, 180, 145, 120, 98],
                backgroundColor: [
                  '#EF4444',
                  '#F97316', 
                  '#EAB308',
                  '#22C55E',
                  '#06B6D4',
                  '#8B5CF6',
                  '#6B7280'
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
                  display: true,
                  position: 'right'
                }
              }
            }
          });

          // 지역별 현황 차트 (바 차트)
          const regionCtx = document.getElementById('region-chart').getContext('2d');
          new Chart(regionCtx, {
            type: 'bar',
            data: {
              labels: ['서울', '경기', '부산', '대구', '인천', '광주', '대전'],
              datasets: [{
                label: '구인공고',
                data: [85, 42, 28, 18, 15, 12, 10],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
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
                    color: 'rgba(0, 0, 0, 0.05)'
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
        }

        // 실시간 데이터 업데이트
        function updateRealTimeData() {
          // KPI 카드 애니메이션 업데이트
          animateValue('total-jobs', 156, 3);
          animateValue('total-jobseekers', 2348, 12);
          animateValue('successful-matches', 89, 2);
          animateValue('total-companies', 47, 1);
        }

        // 숫자 애니메이션 함수
        function animateValue(id, target, variance) {
          const element = document.getElementById(id);
          const current = parseInt(element.textContent);
          const change = Math.floor(Math.random() * variance * 2) - variance;
          const newValue = Math.max(0, current + change);
          
          if (newValue !== current) {
            element.textContent = newValue.toLocaleString();
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
              element.style.transform = 'scale(1)';
            }, 200);
          }
        }

        // 기간 선택 변경 이벤트
        document.getElementById('period-selector').addEventListener('change', function(e) {
          const period = e.target.value;
          console.log('기간 변경:', period + '일');
          // 실제로는 새로운 데이터를 로드하고 차트를 업데이트
        });
      `}}></script>
    </div>
  )
})

// Main page
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-white">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">W</span>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
              <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
            </div>
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

      {/* Hero Section */}
      <section class="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">(주)와우쓰리디</h1>
          <p class="text-xl md:text-2xl text-blue-600 font-semibold mb-4">외국인을 위한 한국 취업 & 유학 플랫폼</p>
          <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">해외 에이전트와 국내 기업을 연결하여 외국인 인재의 한국 진출을 지원합니다</p>
          
          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/jobs" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              구인정보 보기 →
            </a>
            <a href="/jobseekers" class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              구직정보 보기 →
            </a>
            <a href="/study" class="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
              유학정보 보기 →
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">우리의 서비스</h2>
            <p class="text-gray-600 text-lg">외국인 구직자와 국내 기업을 연결하는 전문 플랫폼</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
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
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">(주)와우쓰리디 통계</h2>
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
            <p class="text-gray-600 text-lg">간단한 3단계로 (주)와우쓰리디를 시작하세요</p>
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
            <button onclick="startOnboarding()" class="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors transform hover:scale-105 transition-all duration-200">
              지금 시작하기 <i class="fas fa-rocket ml-2"></i>
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
                  <div class="font-bold text-2xl">(주)와우쓰리디</div>
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
                  <span class="text-gray-300">wow3d16@naver.com</span>
                </div>
                {/* 서울 지역 */}
                <div class="flex items-start space-x-3 mb-4">
                  <i class="fas fa-phone text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-gray-300">
                      <span class="font-medium text-white">서울:</span> 02-3144-3137
                    </div>
                    <div class="text-gray-300">
                      <span class="font-medium text-white">구미:</span> 054-464-3137
                    </div>
                  </div>
                </div>
                
                {/* 서울 사무소 */}
                <div class="flex items-start space-x-3 mb-3">
                  <i class="fas fa-map-marker-alt text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">서울 본사</div>
                    <div class="text-gray-300">서울시 마포구 독막로 93 상수빌딩 4층</div>
                  </div>
                </div>
                
                {/* 구미 사무소 */}
                <div class="flex items-start space-x-3 mb-3">
                  <i class="fas fa-building text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">구미 지사</div>
                    <div class="text-gray-300">경북 구미시 구미대로 산호대로 253<br/>구미첨단의료기술타워 606호</div>
                  </div>
                </div>
                
                {/* 전주 사무소 */}
                <div class="flex items-start space-x-3">
                  <i class="fas fa-building text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">전주 지사</div>
                    <div class="text-gray-300">전북특별자치도 전주시 덕진구 반룡로 109<br/>테크노빌 A동 207호</div>
                  </div>
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
                © 2024 (주)와우쓰리디. All rights reserved.
              </div>
              <div class="flex items-center space-x-6 text-sm">
                <a href="/terms" class="text-gray-400 hover:text-white transition-colors">이용약관</a>
                <a href="/privacy" class="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
                <a href="/cookies" class="text-gray-400 hover:text-white transition-colors">쿠키 정책</a>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-400">사업자등록번호:</span>
                  <span class="text-gray-300">849-88-01659</span>
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
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            <a href="/" class="text-blue-600 hover:text-blue-800">← 홈으로 돌아가기</a>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">🤖 AI 스마트 매칭 시스템</h1>
          <p class="text-gray-600 text-lg">인공지능이 분석하는 맞춤형 구인구직 매칭 서비스</p>
          <div class="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <i class="fas fa-check-circle mr-2"></i>
            실시간 서비스 운영 중
          </div>
        </div>

        {/* 매칭 시스템 선택 */}
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          {/* 구직자용 매칭 */}
          <div class="bg-white p-8 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-user-tie text-2xl text-purple-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-center">구직자 매칭</h3>
            <p class="text-gray-600 mb-6 text-center">내 프로필과 가장 잘 맞는 구인공고를 AI가 추천해드립니다</p>
            
            <div class="space-y-4">
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                스킬 & 경력 기반 매칭 (40점)
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                희망 지역 매칭 (25점)
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                경력 수준 매칭 (20점)
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                비자 & 급여 매칭 (15점)
              </div>
            </div>
            
            <div class="mt-6">
              <select id="jobseeker-select" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">구직자를 선택하세요</option>
              </select>
              <button onclick="findJobMatches()" class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                <i class="fas fa-search mr-2"></i>
                맞춤 구인공고 찾기
              </button>
            </div>
          </div>

          {/* 기업용 매칭 */}
          <div class="bg-white p-8 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-building text-2xl text-blue-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-center">기업 매칭</h3>
            <p class="text-gray-600 mb-6 text-center">구인공고 조건에 가장 적합한 구직자를 AI가 추천해드립니다</p>
            
            <div class="space-y-4">
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                요구 스킬 보유도 분석
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                지역 접근성 고려
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                경력 수준 적합성 평가
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                비자 상태 & 급여 기대치 매칭
              </div>
            </div>
            
            <div class="mt-6">
              <select id="job-select" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">구인공고를 선택하세요</option>
              </select>
              <button onclick="findJobseekerMatches()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-search mr-2"></i>
                적합한 구직자 찾기
              </button>
            </div>
          </div>
        </div>

        {/* 매칭 결과 영역 */}
        <div id="matching-results" class="hidden">
          <div class="bg-white rounded-lg shadow-sm border p-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-semibold text-gray-900">
                <i class="fas fa-chart-line text-green-600 mr-2"></i>
                매칭 결과
              </h3>
              <div id="matching-stats" class="text-sm text-gray-600">
                {/* 매칭 통계가 여기에 표시됩니다 */}
              </div>
            </div>
            
            <div id="matches-container">
              {/* 매칭 결과가 여기에 동적으로 로드됩니다 */}
            </div>
            
            <div class="text-center mt-8">
              <button onclick="clearResults()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                결과 지우기
              </button>
            </div>
          </div>
        </div>

        {/* 매칭 통계 */}
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-12">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-semibold mb-2">실시간 매칭 통계</h3>
            <p class="text-blue-100">AI 매칭 시스템의 현재 성과를 확인하세요</p>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6" id="matching-statistics">
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-matches">-</div>
              <div class="text-sm text-blue-100">총 매칭 생성</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-high-score">-</div>
              <div class="text-sm text-blue-100">고점수 매칭 (80+)</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-avg-score">-</div>
              <div class="text-sm text-blue-100">평균 매칭 점수</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-success-rate">-</div>
              <div class="text-sm text-blue-100">매칭 성공률</div>
            </div>
          </div>
        </div>

        {/* 매칭 알고리즘 설명 */}
        <div class="bg-white rounded-lg shadow-sm border p-8">
          <h3 class="text-xl font-semibold mb-6 text-center">
            <i class="fas fa-brain text-purple-600 mr-2"></i>
            AI 매칭 알고리즘 상세
          </h3>
          
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-cogs text-red-600"></i>
              </div>
              <h4 class="font-semibold mb-2">다차원 분석</h4>
              <p class="text-gray-600 text-sm">스킬, 경력, 위치, 비자, 급여 등 5가지 핵심 요소를 종합적으로 분석합니다.</p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-percentage text-yellow-600"></i>
              </div>
              <h4 class="font-semibold mb-2">정확한 점수화</h4>
              <p class="text-gray-600 text-sm">각 요소별 가중치를 적용하여 0-100점의 매칭 점수로 정확하게 평가합니다.</p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-bullseye text-green-600"></i>
              </div>
              <h4 class="font-semibold mb-2">맞춤형 추천</h4>
              <p class="text-gray-600 text-sm">높은 점수부터 정렬하여 가장 적합한 매칭을 우선적으로 추천합니다.</p>
            </div>
          </div>
          
          <div class="mt-8 p-6 bg-gray-50 rounded-lg">
            <div class="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h5 class="font-semibold text-gray-900 mb-3">매칭 기준 상세</h5>
                <ul class="space-y-2 text-gray-600">
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                    <strong>스킬 매칭 (40%):</strong> 요구스킬과 보유스킬 일치도
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <strong>지역 매칭 (25%):</strong> 근무지와 희망지역 접근성
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <strong>경력 매칭 (20%):</strong> 요구경력과 보유경력 적합성
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                    <strong>비자&급여 (15%):</strong> 비자지원 및 급여 기대치
                  </li>
                </ul>
              </div>
              <div>
                <h5 class="font-semibold text-gray-900 mb-3">점수 해석 가이드</h5>
                <ul class="space-y-2 text-gray-600">
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <strong>90-100점:</strong> 완벽한 매칭 (즉시 지원 추천)
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <strong>70-89점:</strong> 우수한 매칭 (적극 지원 권장)
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                    <strong>50-69점:</strong> 양호한 매칭 (검토 후 지원)
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-gray-400 rounded-full mr-3"></span>
                    <strong>50점 미만:</strong> 낮은 매칭 (신중 고려 필요)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* 매칭 시스템 JavaScript */}
      <script>{`
        let currentMatches = [];
        
        // 페이지 로드 시 초기화
        document.addEventListener('DOMContentLoaded', function() {
          loadJobseekers();
          loadJobs();
          loadMatchingStatistics();
        });
        
        // 목업 데이터
        const mockJobseekers = [
          { id: 1, name: '김민수', nationality: '베트남', field: '컴퓨터공학', skills: ['JavaScript', 'React', 'Node.js'], experience_years: 3, preferred_location: '서울/경기', visa_status: 'E-7', salary_expectation: 4000 },
          { id: 2, name: '이지원', nationality: '중국', field: '경영학', skills: ['Marketing', 'Business Analysis', 'Excel'], experience_years: 2, preferred_location: '서울', visa_status: 'F-2', salary_expectation: 3500 },
          { id: 3, name: '박지민', nationality: '필리핀', field: '디자인', skills: ['Photoshop', 'Illustrator', 'UI/UX'], experience_years: 1, preferred_location: '부산', visa_status: 'D-2', salary_expectation: 3000 },
          { id: 4, name: 'John Smith', nationality: '미국', field: '공학', skills: ['Python', 'Machine Learning', 'Data Analysis'], experience_years: 5, preferred_location: '서울', visa_status: 'E-7', salary_expectation: 5000 },
          { id: 5, name: 'Maria Garcia', nationality: '스페인', field: '교육', skills: ['Teaching', 'Spanish', 'English'], experience_years: 4, preferred_location: '대구', visa_status: 'E-2', salary_expectation: 3200 }
        ];
        
        const mockJobs = [
          { id: 1, title: 'Frontend Developer', company_name: '삼성전자', location: '서울', skills_required: ['JavaScript', 'React', 'TypeScript'], experience_level: 'mid', salary_min: 4000, salary_max: 5000, visa_sponsorship: true },
          { id: 2, title: 'Marketing Specialist', company_name: '네이버', location: '경기도', skills_required: ['Marketing', 'Analytics', 'SNS'], experience_level: 'junior', salary_min: 3500, salary_max: 4500, visa_sponsorship: false },
          { id: 3, title: 'UX Designer', company_name: 'LG전자', location: '서울', skills_required: ['UI/UX', 'Figma', 'Photoshop'], experience_level: 'entry', salary_min: 3000, salary_max: 4000, visa_sponsorship: true },
          { id: 4, title: 'Data Scientist', company_name: '카카오', location: '제주도', skills_required: ['Python', 'Machine Learning', 'SQL'], experience_level: 'senior', salary_min: 5000, salary_max: 6000, visa_sponsorship: true },
          { id: 5, title: 'English Teacher', company_name: '한국외대', location: '서울', skills_required: ['Teaching', 'English', 'Education'], experience_level: 'mid', salary_min: 3000, salary_max: 4000, visa_sponsorship: true }
        ];
        
        // 구직자 목록 로드
        function loadJobseekers() {
          const select = document.getElementById('jobseeker-select');
          select.innerHTML = '<option value="">구직자를 선택하세요</option>';
          
          mockJobseekers.forEach(jobseeker => {
            const option = document.createElement('option');
            option.value = jobseeker.id;
            option.textContent = jobseeker.name + ' (' + jobseeker.nationality + ') - ' + jobseeker.field;
            select.appendChild(option);
          });
        }
        
        // 구인공고 목록 로드
        function loadJobs() {
          const select = document.getElementById('job-select');
          select.innerHTML = '<option value="">구인공고를 선택하세요</option>';
          
          mockJobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title + ' - ' + job.company_name + ' (' + job.location + ')';
            select.appendChild(option);
          });
        }
        
        // 매칭 점수 계산 함수
        function calculateMatchingScore(job, jobseeker) {
          let score = 0;
          let maxScore = 100;
          
          // 1. 스킬 매칭 (40점)
          const jobSkills = job.skills_required || [];
          const seekerSkills = jobseeker.skills || [];
          const matchedSkills = jobSkills.filter(skill => 
            seekerSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || 
                                 skill.toLowerCase().includes(s.toLowerCase()))
          );
          const skillScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 40 : 0;
          score += skillScore;
          
          // 2. 위치 매칭 (25점)
          const jobLocation = job.location.toLowerCase();
          const preferredLocations = jobseeker.preferred_location.toLowerCase();
          let locationScore = 0;
          if (preferredLocations.includes(jobLocation) || jobLocation.includes('서울') && preferredLocations.includes('서울')) {
            locationScore = 25;
          } else if ((jobLocation.includes('서울') && preferredLocations.includes('경기')) || 
                     (jobLocation.includes('경기') && preferredLocations.includes('서울'))) {
            locationScore = 15;
          }
          score += locationScore;
          
          // 3. 경력 매칭 (20점)
          const experienceYears = jobseeker.experience_years || 0;
          let experienceScore = 0;
          
          switch (job.experience_level) {
            case 'entry':
              if (experienceYears <= 1) experienceScore = 20;
              else if (experienceYears <= 3) experienceScore = 15;
              else experienceScore = 10;
              break;
            case 'junior':
              if (experienceYears >= 1 && experienceYears <= 3) experienceScore = 20;
              else if (experienceYears <= 5) experienceScore = 15;
              else experienceScore = 10;
              break;
            case 'mid':
              if (experienceYears >= 3 && experienceYears <= 7) experienceScore = 20;
              else if (experienceYears >= 1 && experienceYears <= 10) experienceScore = 15;
              else experienceScore = 10;
              break;
            case 'senior':
              if (experienceYears >= 5) experienceScore = 20;
              else if (experienceYears >= 3) experienceScore = 15;
              else experienceScore = 5;
              break;
            default:
              experienceScore = 10;
          }
          score += experienceScore;
          
          // 4. 비자 스폰서십 (10점)
          if (job.visa_sponsorship) {
            score += 10;
          } else if (['F-2', 'F-5', 'F-6', 'F-4'].includes(jobseeker.visa_status)) {
            score += 10;
          }
          
          // 5. 급여 기대치 (5점)
          if (job.salary_min && job.salary_max && jobseeker.salary_expectation) {
            const avgSalary = (job.salary_min + job.salary_max) / 2;
            const expectation = jobseeker.salary_expectation;
            
            if (expectation >= job.salary_min && expectation <= job.salary_max) {
              score += 5;
            } else if (Math.abs(expectation - avgSalary) / avgSalary <= 0.2) {
              score += 3;
            } else if (Math.abs(expectation - avgSalary) / avgSalary <= 0.4) {
              score += 1;
            }
          }
          
          return Math.round(score);
        }
        
        // 매칭 이유 생성
        function getMatchReasons(job, jobseeker) {
          const reasons = [];
          
          // 스킬 매칭
          const jobSkills = job.skills_required || [];
          const seekerSkills = jobseeker.skills || [];
          const matchedSkills = jobSkills.filter(skill => 
            seekerSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
          );
          if (matchedSkills.length > 0) {
            reasons.push('요구 스킬 매칭: ' + matchedSkills.join(', '));
          }
          
          // 위치 매칭
          if (jobseeker.preferred_location.toLowerCase().includes(job.location.toLowerCase())) {
            reasons.push('희망 근무지역 일치: ' + job.location);
          }
          
          // 경력 매칭
          const exp = jobseeker.experience_years || 0;
          switch (job.experience_level) {
            case 'entry':
              if (exp <= 1) reasons.push('신입/초급 경력 요구사항 충족');
              break;
            case 'junior':
              if (exp >= 1 && exp <= 3) reasons.push('주니어 경력 요구사항 충족');
              break;
            case 'mid':
              if (exp >= 3 && exp <= 7) reasons.push('중급 경력 요구사항 충족');
              break;
            case 'senior':
              if (exp >= 5) reasons.push('시니어 경력 요구사항 충족');
              break;
          }
          
          // 비자 스폰서십
          if (job.visa_sponsorship) {
            reasons.push('비자 스폰서십 제공');
          }
          
          return reasons;
        }
        
        // 구직자 매칭 찾기
        function findJobMatches() {
          const jobseekerId = document.getElementById('jobseeker-select').value;
          
          if (!jobseekerId) {
            alert('구직자를 먼저 선택해주세요.');
            return;
          }
          
          showLoading(true);
          
          setTimeout(() => {
            const jobseeker = mockJobseekers.find(js => js.id == jobseekerId);
            if (!jobseeker) {
              alert('구직자를 찾을 수 없습니다.');
              showLoading(false);
              return;
            }
            
            const matchedJobs = mockJobs.map(job => ({
              ...job,
              matching_score: calculateMatchingScore(job, jobseeker),
              match_reasons: getMatchReasons(job, jobseeker)
            })).filter(job => job.matching_score > 0)
              .sort((a, b) => b.matching_score - a.matching_score);
            
            const data = {
              jobseeker: jobseeker,
              matches: matchedJobs,
              total_matches: matchedJobs.length,
              average_score: Math.round(matchedJobs.reduce((sum, job) => sum + job.matching_score, 0) / matchedJobs.length)
            };
            
            displayMatches(data, 'jobseeker');
            showLoading(false);
          }, 1500); // 실제 AI 처리 시뮬레이션
        }
        
        // 기업 매칭 찾기
        function findJobseekerMatches() {
          const jobId = document.getElementById('job-select').value;
          
          if (!jobId) {
            alert('구인공고를 먼저 선택해주세요.');
            return;
          }
          
          showLoading(true);
          
          setTimeout(() => {
            const job = mockJobs.find(j => j.id == jobId);
            if (!job) {
              alert('구인공고를 찾을 수 없습니다.');
              showLoading(false);
              return;
            }
            
            const matchedJobseekers = mockJobseekers.map(jobseeker => ({
              ...jobseeker,
              matching_score: calculateMatchingScore(job, jobseeker),
              match_reasons: getMatchReasons(job, jobseeker)
            })).filter(seeker => seeker.matching_score > 0)
              .sort((a, b) => b.matching_score - a.matching_score);
            
            const data = {
              job: job,
              matches: matchedJobseekers,
              total_matches: matchedJobseekers.length,
              average_score: Math.round(matchedJobseekers.reduce((sum, seeker) => sum + seeker.matching_score, 0) / matchedJobseekers.length)
            };
            
            displayMatches(data, 'job');
            showLoading(false);
          }, 1500); // 실제 AI 처리 시뮬레이션
        }
        
        // 매칭 결과 표시
        function displayMatches(data, type) {
          currentMatches = data.matches || [];
          
          const resultsDiv = document.getElementById('matching-results');
          const statsDiv = document.getElementById('matching-stats');
          const containerDiv = document.getElementById('matches-container');
          
          // 통계 정보 표시
          statsDiv.innerHTML = 
            '<div class="flex items-center space-x-4 text-sm">' +
              '<span><i class="fas fa-list-ol mr-1"></i>총 ' + (data.total_matches || 0) + '개</span>' +
              '<span><i class="fas fa-chart-bar mr-1"></i>평균 ' + (data.average_score || 0) + '점</span>' +
              '<span><i class="fas fa-clock mr-1"></i>' + new Date().toLocaleTimeString() + '</span>' +
            '</div>';
          
          // 매칭 결과 표시
          if (currentMatches.length === 0) {
            containerDiv.innerHTML = 
              '<div class="text-center py-12">' +
                '<i class="fas fa-search text-6xl text-gray-300 mb-4"></i>' +
                '<h3 class="text-lg font-semibold text-gray-500 mb-2">매칭 결과가 없습니다</h3>' +
                '<p class="text-gray-400">조건을 조정하여 다시 시도해보세요.</p>' +
              '</div>';
          } else {
            // 간단한 매칭 결과 표시
            let resultsHtml = '<div class="space-y-4">';
            
            currentMatches.slice(0, 10).forEach((match, index) => {
              const scoreColor = match.matching_score >= 90 ? 'text-green-600' : 
                                match.matching_score >= 70 ? 'text-blue-600' : 
                                match.matching_score >= 50 ? 'text-yellow-600' : 'text-gray-600';
              
              const title = type === 'jobseeker' 
                ? match.title + ' - ' + (match.company_name || '회사명 미상')
                : match.name + ' (' + (match.nationality || '국적미상') + ')';
                
              resultsHtml += 
                '<div class="border rounded-lg p-6 hover:shadow-md transition-shadow">' +
                  '<div class="flex items-center justify-between mb-4">' +
                    '<h4 class="text-lg font-semibold">#' + (index + 1) + ' ' + title + '</h4>' +
                    '<div class="text-right">' +
                      '<div class="text-2xl font-bold ' + scoreColor + '">' + match.matching_score + '점</div>' +
                      '<div class="text-xs text-gray-500">매칭 점수</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="text-sm text-gray-600">' +
                    '<div>매칭 이유: ' + (match.match_reasons ? match.match_reasons.join(', ') : '분석중') + '</div>' +
                  '</div>' +
                '</div>';
            });
            
            resultsHtml += '</div>';
            containerDiv.innerHTML = resultsHtml;
          }
          
          resultsDiv.classList.remove('hidden');
          resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 점수 색상 결정
        function getScoreColor(score) {
          if (score >= 90) return 'text-green-600';
          if (score >= 70) return 'text-blue-600';
          if (score >= 50) return 'text-yellow-600';
          return 'text-gray-600';
        }
        
        // 점수 바 생성
        function getScoreBar(score) {
          const color = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-gray-400';
          return '<div class="flex items-center space-x-2">' +
                   '<span class="text-xs text-gray-500">적합도</span>' +
                   '<div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">' +
                     '<div class="h-full ' + color + '" style="width: ' + Math.min(score, 100) + '%"></div>' +
                   '</div>' +
                   '<span class="text-xs font-medium">' + score + '%</span>' +
                 '</div>';
        }
        
        // 급여 포맷팅
        function formatSalary(min, max) {
          if (!min && !max) return '급여 미상';
          if (min && max) return min + '-' + max + '만원';
          if (min) return min + '만원 이상';
          if (max) return max + '만원 이하';
          return '급여 미상';
        }
        
        // 결과 지우기
        function clearResults() {
          document.getElementById('matching-results').classList.add('hidden');
          document.getElementById('jobseeker-select').value = '';
          document.getElementById('job-select').value = '';
          currentMatches = [];
        }
        
        // 로딩 상태 표시
        function showLoading(show) {
          // 간단한 로딩 표시 (실제로는 더 정교한 UI 사용)
          const buttons = document.querySelectorAll('button[onclick^="find"]');
          buttons.forEach(btn => {
            btn.disabled = show;
            if (show) {
              btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>분석 중...';
            } else {
              btn.innerHTML = btn.innerHTML.includes('구인공고') 
                ? '<i class="fas fa-search mr-2"></i>맞춤 구인공고 찾기'
                : '<i class="fas fa-search mr-2"></i>적합한 구직자 찾기';
            }
          });
        }
        
        // 매칭 통계 로드
        function loadMatchingStatistics() {
          // 목업 통계 데이터
          const totalMatches = mockJobseekers.length * mockJobs.length;
          const highScoreMatches = Math.floor(totalMatches * 0.15);
          const avgScore = 67;
          
          document.getElementById('stat-matches').textContent = totalMatches;
          document.getElementById('stat-high-score').textContent = highScoreMatches;
          document.getElementById('stat-avg-score').textContent = avgScore + '점';
          document.getElementById('stat-success-rate').textContent = '87%';
        }
      `}</script>
    </div>
  )
})

// Statistics page

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
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
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
            <p class="text-gray-600 mb-4">wow3d16@naver.com</p>
            <a href="mailto:wow3d16@naver.com" class="text-blue-600 hover:text-blue-800">이메일 보내기</a>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-phone text-2xl text-green-600"></i>
            </div>
            <h3 class="font-semibold mb-2">전화 문의</h3>
            <p class="text-gray-600 mb-2">서울: 02-3144-3137</p>
            <p class="text-gray-600 mb-4">구미: 054-464-3137</p>
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

// FAQ page - 자주 묻는 질문  
app.get('/faq', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">← 고객지원</a>
              <a href="/" class="text-blue-600 hover:text-blue-800">홈으로</a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">자주 묻는 질문</h1>
          <p class="text-gray-600 text-lg">(주)와우쓰리디 이용에 관한 궁금한 사항들을 확인해보세요</p>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg mb-3 text-blue-600">Q. 회원가입은 어떻게 하나요?</h3>
            <p class="text-gray-600 mb-2">메인 페이지 우측 상단의 '회원가입' 버튼을 클릭하세요.</p>
            <p class="text-gray-600">구직자, 기업, 에이전트 중 원하는 유형을 선택하고 필요한 정보를 입력하면 됩니다.</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg mb-3 text-blue-600">Q. 외국인 비자 지원이 가능한가요?</h3>
            <p class="text-gray-600">네, 저희 플랫폼의 많은 기업들이 외국인 비자 지원을 제공합니다. 구인공고에서 '비자 지원' 필터를 사용하여 해당 기업들을 찾아보세요.</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg mb-3 text-blue-600">Q. 구인공고 등록은 무료인가요?</h3>
            <p class="text-gray-600">네, 현재 베타 서비스 기간으로 구인공고 등록이 완전 무료입니다. 무제한 공고 등록과 이력서 열람이 가능합니다.</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg mb-3 text-blue-600">Q. 서비스 이용료가 있나요?</h3>
            <p class="text-gray-600">현재 베타 서비스 기간으로 모든 기본 기능이 무료입니다. 정식 서비스 출시 시 요금제가 도입될 예정이며, 사전에 공지해드립니다.</p>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mt-12 text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">찾고 계신 답변이 없나요?</h3>
          <p class="text-gray-600 mb-6">더 자세한 도움이 필요하시면 언제든 연락해주세요</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">문의하기</a>
            <a href="/support" class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">고객지원</a>
          </div>
        </div>
      </main>
    </div>
  )
})

// Guide page - 이용가이드
app.get('/guide', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">← 고객지원</a>
              <a href="/" class="text-blue-600 hover:text-blue-800">홈으로</a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">이용가이드</h1>
          <p class="text-gray-600 text-lg">(주)와우쓰리디를 효과적으로 이용하는 방법을 알아보세요</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-user-tie text-blue-600 text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">구직자 가이드</h2>
            </div>
            <div class="space-y-4">
              <div class="border-l-4 border-blue-500 pl-4">
                <h3 class="font-semibold mb-2">1. 회원가입 및 프로필 설정</h3>
                <p class="text-gray-600 text-sm">구직자로 가입하고 상세 프로필을 작성하세요</p>
              </div>
              <div class="border-l-4 border-blue-500 pl-4">
                <h3 class="font-semibold mb-2">2. 이력서 업로드</h3>
                <p class="text-gray-600 text-sm">한국어와 영어 이력서를 모두 준비하세요</p>
              </div>
              <div class="border-l-4 border-blue-500 pl-4">
                <h3 class="font-semibold mb-2">3. 채용공고 검색 및 지원</h3>
                <p class="text-gray-600 text-sm">필터를 활용해 맞는 공고를 찾고 지원하세요</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-8">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-building text-green-600 text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">기업 가이드</h2>
            </div>
            <div class="space-y-4">
              <div class="border-l-4 border-green-500 pl-4">
                <h3 class="font-semibold mb-2">1. 기업 회원가입</h3>
                <p class="text-gray-600 text-sm">기업 정보와 담당자 정보를 정확히 입력하세요</p>
              </div>
              <div class="border-l-4 border-green-500 pl-4">
                <h3 class="font-semibold mb-2">2. 구인공고 작성</h3>
                <p class="text-gray-600 text-sm">상세한 채용 정보로 우수한 인재를 유치하세요</p>
              </div>
              <div class="border-l-4 border-green-500 pl-4">
                <h3 class="font-semibold mb-2">3. 지원자 관리</h3>
                <p class="text-gray-600 text-sm">매칭 시스템을 활용해 최적의 후보자를 찾으세요</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 성공적인 구직 활동을 위한 팁</h3>
          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <h4 class="font-semibold mb-4 text-orange-600">📈 프로필 최적화</h4>
              <ul class="space-y-2 text-gray-700">
                <li>✓ 프로필 완성도 80% 이상 유지</li>
                <li>✓ 정기적인 정보 업데이트</li>
                <li>✓ 전문성을 보여줄 수 있는 키워드 사용</li>
                <li>✓ 정직하고 구체적인 정보 입력</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold mb-4 text-red-600">🎯 지원 전략</h4>
              <ul class="space-y-2 text-gray-700">
                <li>✓ 매칭도 70% 이상 공고에 집중</li>
                <li>✓ 기업 정보 사전 조사</li>
                <li>✓ 맞춤형 자기소개서 작성</li>
                <li>✓ 적극적인 네트워킹 활동</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Contact page - 문의하기
app.get('/contact', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">← 고객지원</a>
              <a href="/" class="text-blue-600 hover:text-blue-800">홈으로</a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">문의하기</h1>
          <p class="text-gray-600 text-lg">궁금한 사항이나 제안사항을 언제든 보내주세요</p>
        </div>

        <div class="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <h2 class="text-2xl font-bold mb-8">연락처 정보</h2>
            <div class="space-y-6">
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-envelope text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">이메일</h3>
                    <p class="text-gray-600 mb-2">wow3d16@naver.com</p>
                    <p class="text-sm text-gray-500">24시간 접수 가능 / 평균 2시간 내 응답</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-phone text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">전화문의</h3>
                    <div class="space-y-1 mb-2">
                      <p class="text-gray-600"><span class="font-medium text-gray-900">서울:</span> 02-3144-3137</p>
                      <p class="text-gray-600"><span class="font-medium text-gray-900">구미:</span> 054-464-3137</p>
                    </div>
                    <p class="text-sm text-gray-500">평일 09:00~18:00 (점심시간 12:00~13:00 제외)</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-map-marker-alt text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-3">사무소 위치</h3>
                    <div class="space-y-3">
                      <div>
                        <p class="font-medium text-gray-900 mb-1">서울 본사</p>
                        <p class="text-sm text-gray-600">서울시 마포구 독막로 93 상수빌딩 4층</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 mb-1">구미 지사</p>
                        <p class="text-sm text-gray-600">경북 구미시 구미대로 산호대로 253<br/>구미첨단의료기술타워 606호</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 mb-1">전주 지사</p>
                        <p class="text-sm text-gray-600">전북특별자치도 전주시 덕진구 반룡로 109<br/>테크노빌 A동 207호</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-2xl font-bold mb-8">온라인 문의</h2>
            <form id="contact-form" class="bg-white p-8 rounded-lg shadow-sm space-y-6">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">이름 *</label>
                  <input type="text" name="name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="실명을 입력해주세요" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
                  <input type="tel" name="phone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="010-0000-0000" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">이메일 *</label>
                <input type="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="답변 받을 이메일 주소" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">제목 *</label>
                <input type="text" name="subject" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="문의 제목을 입력해주세요" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">문의 내용 *</label>
                <textarea name="message" required rows="6" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="궁금한 사항을 자세히 적어주세요"></textarea>
              </div>

              <div class="text-center">
                <button type="submit" id="submit-btn" class="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  문의 보내기
                </button>
                <p class="text-sm text-gray-500 mt-3">문의 접수 후 평균 2시간 내에 답변을 드립니다</p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{__html: `
        // Contact form submission
        document.getElementById('contact-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const form = e.target;
          const submitBtn = document.getElementById('submit-btn');
          const formData = new FormData(form);
          
          const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
          };
          
          // Disable submit button
          submitBtn.disabled = true;
          submitBtn.textContent = '전송 중...';
          
          try {
            const response = await fetch('/api/contact/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('✅ ' + result.message);
              form.reset();
            } else {
              alert('❌ ' + (result.error || '문의 전송에 실패했습니다.'));
            }
          } catch (error) {
            console.error('Contact form error:', error);
            alert('❌ 문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '문의 보내기';
          }
        });
      `}} />
    </div>
  )
})

// Notice page - 공지사항
app.get('/notice', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">← 고객지원</a>
              <a href="/" class="text-blue-600 hover:text-blue-800">홈으로</a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">공지사항</h1>
          <p class="text-gray-600 text-lg">(주)와우쓰리디의 최신 소식과 중요한 안내사항을 확인하세요</p>
        </div>

        <div class="max-w-4xl mx-auto space-y-4">
          <div class="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
            <div class="flex items-center mb-3">
              <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">중요</span>
              <span class="bg-red-500 text-white px-2 py-1 rounded text-xs">필독</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">[중요] (주)와우쓰리디 베타 서비스 정식 오픈 안내</h3>
            <p class="text-gray-600 mb-3">안녕하세요. (주)와우쓰리디 베타 서비스가 2024년 12월 1일부로 정식 서비스로 전환됩니다. 베타 기간 동안 이용해주신 모든 분들께 감사드리며...</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-11</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 1,247</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-3">
              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">업데이트</span>
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">NEW</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">매칭 알고리즘 개선 및 새로운 필터 기능 추가</h3>
            <p class="text-gray-600 mb-3">더욱 정확한 매칭을 위해 AI 알고리즘을 업데이트했습니다. 새로운 필터 옵션으로 원하는 조건의 공고를 더 쉽게 찾을 수 있습니다.</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-10</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 892</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-3">
              <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">이벤트</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">신규 회원 가입 이벤트 - 프리미엄 기능 1개월 무료!</h3>
            <p class="text-gray-600 mb-3">10월 한 달간 신규 가입 회원에게 프리미엄 기능을 무료로 제공합니다. 이 기회를 놓치지 마세요!</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-08</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 1,156</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-3">
              <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">점검</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">정기 시스템 점검 안내 (10월 15일 새벽 2시~4시)</h3>
            <p class="text-gray-600 mb-3">서비스 품질 향상을 위한 정기 점검이 진행됩니다. 점검 시간 동안 서비스 이용에 제한이 있을 수 있습니다.</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-05</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 445</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-3">
              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">기능 추가</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">모바일 앱 출시 및 푸시 알림 기능 도입</h3>
            <p class="text-gray-600 mb-3">(주)와우쓰리디 모바일 앱이 출시되었습니다! 이제 언제 어디서나 편리하게 구인구직 활동을 할 수 있습니다.</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-03</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 2,134</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Blog page - 블로그
app.get('/blog', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">← 고객지원</a>
              <a href="/" class="text-blue-600 hover:text-blue-800">홈으로</a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">(주)와우쓰리디 블로그</h1>
          <p class="text-gray-600 text-lg">외국인 구직 활동과 한국 생활에 도움이 되는 유용한 정보를 제공합니다</p>
        </div>

        <div class="max-w-6xl mx-auto">
          <div class="bg-white rounded-lg shadow-sm mb-8">
            <div class="flex flex-wrap border-b">
              <button class="px-6 py-4 border-b-2 border-blue-600 text-blue-600 font-semibold">전체</button>
              <button class="px-6 py-4 text-gray-600 hover:text-blue-600">구직 팁</button>
              <button class="px-6 py-4 text-gray-600 hover:text-blue-600">한국 생활</button>
              <button class="px-6 py-4 text-gray-600 hover:text-blue-600">비자 정보</button>
              <button class="px-6 py-4 text-gray-600 hover:text-blue-600">업계 동향</button>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg overflow-hidden mb-12">
            <div class="md:flex">
              <div class="md:w-1/2 p-8 text-white">
                <div class="mb-4">
                  <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">추천 글</span>
                </div>
                <h2 class="text-3xl font-bold mb-4">한국에서 성공적인 구직을 위한 완벽 가이드</h2>
                <p class="text-blue-100 mb-6">외국인으로서 한국에서 일자리를 찾는 것은 도전적일 수 있습니다. 하지만 올바른 전략과 준비를 통해 성공할 수 있습니다...</p>
                <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">전체 글 읽기 →</button>
              </div>
              <div class="md:w-1/2 bg-gradient-to-br from-blue-400 to-purple-500 p-8 flex items-center justify-center">
                <div class="text-center text-white">
                  <i class="fas fa-briefcase text-6xl mb-4 opacity-80"></i>
                  <p class="text-xl font-semibold">구직 성공률 85%</p>
                  <p class="text-blue-100">가이드 활용 시</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div class="bg-green-100 p-6 text-center">
                <i class="fas fa-lightbulb text-4xl text-green-600 mb-3"></i>
                <span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm">구직 팁</span>
              </div>
              <div class="p-6">
                <h3 class="font-bold text-lg mb-3">면접에서 자주 나오는 질문 TOP 20</h3>
                <p class="text-gray-600 mb-4 text-sm">한국 기업 면접에서 가장 자주 묻는 질문들과 모범 답안을 정리했습니다.</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>10월 9일</span>
                  <span>조회 1,245</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div class="bg-blue-100 p-6 text-center">
                <i class="fas fa-home text-4xl text-blue-600 mb-3"></i>
                <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">한국 생활</span>
              </div>
              <div class="p-6">
                <h3 class="font-bold text-lg mb-3">외국인을 위한 한국 직장 문화 가이드</h3>
                <p class="text-gray-600 mb-4 text-sm">한국의 독특한 직장 문화와 예절에 대해 알아보세요.</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>10월 8일</span>
                  <span>조회 987</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div class="bg-purple-100 p-6 text-center">
                <i class="fas fa-passport text-4xl text-purple-600 mb-3"></i>
                <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">비자 정보</span>
              </div>
              <div class="p-6">
                <h3 class="font-bold text-lg mb-3">E-7 비자 신청 완벽 가이드 2024</h3>
                <p class="text-gray-600 mb-4 text-sm">특정활동 비자(E-7) 신청 절차와 필요 서류를 상세히 안내합니다.</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>10월 7일</span>
                  <span>조회 2,156</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 mt-16 text-center text-white">
            <h3 class="text-2xl font-bold mb-4">📧 뉴스레터 구독</h3>
            <p class="text-gray-300 mb-6">매주 새로운 구직 팁과 유용한 정보를 이메일로 받아보세요</p>
            <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="이메일 주소를 입력하세요" class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">구독하기</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Study page

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
      }
    }
  })
})

// Dashboard redirect based on user type
app.get('/dashboard', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    throw new HTTPException(401, { message: '로그인이 필요합니다.' });
  }
  
  // Redirect to appropriate dashboard based on user type
  const dashboardUrls = {
    jobseeker: '/dashboard/jobseeker',
    company: '/dashboard/company',
    agent: '/dashboard/admin',
    admin: '/dashboard/admin'
  };
  
  const redirectUrl = dashboardUrls[user.user_type] || '/dashboard/jobseeker';
  return c.redirect(redirectUrl);
});

// Jobseeker Dashboard page
app.get('/dashboard/legacy', (c) => {
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
    
    // 실제 데이터베이스에 사용자 저장
    const { hashPassword } = await import('./utils/auth');
    const hashedPassword = await hashPassword(password);
    const currentTime = new Date().toISOString();
    
    // 이메일 중복 확인
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      return c.json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      }, 400);
    }
    
    // 사용자 생성
    const insertResult = await c.env.DB.prepare(`
      INSERT INTO users (
        email, password, name, user_type, phone, location,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      email.trim().toLowerCase(),
      hashedPassword,
      name.trim(),
      user_type,
      phone || null,
      location || null,
      'approved', // 자동 승인
      currentTime,
      currentTime
    ).run();
    
    if (!insertResult.success || !insertResult.meta?.last_row_id) {
      return c.json({
        success: false,
        message: '회원가입 중 오류가 발생했습니다.'
      }, 500);
    }
    
    const userId = insertResult.meta.last_row_id;
    
    // 사용자 유형별 프로필 생성
    try {
      if (user_type === 'jobseeker') {
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || name.trim();
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await c.env.DB.prepare(`
          INSERT INTO jobseekers (
            user_id, first_name, last_name, current_location,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(userId, firstName, lastName, location, currentTime, currentTime).run();
        
      } else if (user_type === 'company') {
        await c.env.DB.prepare(`
          INSERT INTO companies (
            user_id, company_name, address,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?)
        `).bind(userId, name.trim(), location, currentTime, currentTime).run();
      }
    } catch (profileError) {
      console.error('프로필 생성 오류:', profileError);
      // 프로필 생성 실패는 치명적이지 않음
    }
    
    // 생성된 사용자 정보 조회
    const createdUser = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, phone, location, status, created_at FROM users WHERE id = ?'
    ).bind(userId).first();
    
    console.log('회원가입 성공:', createdUser);
    
    // JWT 토큰 생성 (자동 로그인용)
    const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
    const token = await createJWT({
      userId: createdUser.id,
      email: createdUser.email,
      userType: createdUser.user_type,
      name: createdUser.name,
      loginAt: currentTime
    }, jwtSecret);
    
    // 🍪 Set JWT token as HttpOnly cookie for browser navigation
    c.header('Set-Cookie', 
      `wowcampus_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
    );
    
    return c.json({
      success: true,
      message: '회원가입이 완료되었습니다!',
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        user_type: createdUser.user_type,
        phone: createdUser.phone,
        location: createdUser.location,
        status: createdUser.status
      },
      token: token  // 자동 로그인을 위한 JWT 토큰
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

// Terms of Service page
app.get('/terms', (c) => {
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
          
          <div class="flex items-center space-x-4">
            <a href="/" class="text-gray-600 hover:text-blue-600 transition-colors">홈으로</a>
          </div>
        </nav>
      </header>

      {/* Terms Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
            
            <div class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">제1조 (목적)</h2>
              <p class="text-gray-600 mb-6">
                이 약관은 (주)와우쓰리디(이하 "회사")가 운영하는 외국인 구인구직 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제2조 (용어의 정의)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. "서비스"라 함은 회사가 제공하는 외국인 구인구직 매칭 플랫폼을 의미합니다.</p>
                <p class="mb-2">2. "이용자"라 함은 이 약관에 따라 회사가 제공하는 서비스를 받는 자를 의미합니다.</p>
                <p class="mb-2">3. "구직자"라 함은 구직 정보를 등록하고 취업을 희망하는 외국인을 의미합니다.</p>
                <p class="mb-2">4. "기업"이라 함은 구인 정보를 등록하고 외국인 인재 채용을 희망하는 회사를 의미합니다.</p>
                <p class="mb-2">5. "에이전트"라 함은 구인구직 매칭을 중개하는 인력소개업체를 의미합니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제3조 (약관의 효력 및 변경)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</p>
                <p class="mb-2">2. 회사는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지됩니다.</p>
                <p class="mb-2">3. 변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제4조 (서비스의 제공 및 변경)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 회사는 다음과 같은 서비스를 제공합니다:</p>
                <div class="ml-4">
                  <p class="mb-2">- 외국인 구인구직 매칭 서비스</p>
                  <p class="mb-2">- 구인공고 등록 및 조회 서비스</p>
                  <p class="mb-2">- 구직자 프로필 등록 및 관리 서비스</p>
                  <p class="mb-2">- 에이전트 중개 서비스</p>
                  <p class="mb-2">- 기타 회사가 정하는 서비스</p>
                </div>
                <p class="mb-2">2. 회사는 서비스 향상을 위해 서비스의 내용을 추가, 변경, 삭제할 수 있습니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제5조 (회원가입)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 서비스 이용을 희망하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</p>
                <p class="mb-2">2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 자가 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:</p>
                <div class="ml-4">
                  <p class="mb-2">- 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</p>
                  <p class="mb-2">- 등록 내용에 허위, 기재누락, 오기가 있는 경우</p>
                  <p class="mb-2">- 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제6조 (개인정보보호)</h2>
              <p class="text-gray-600 mb-6">
                회사는 이용자의 개인정보 보호를 위해 개인정보처리방침을 수립·공시하고 이를 준수합니다. 
                자세한 내용은 개인정보처리방침을 참조하시기 바랍니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제7조 (이용자의 의무)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 이용자는 다음 행위를 하여서는 안 됩니다:</p>
                <div class="ml-4">
                  <p class="mb-2">- 신청 또는 변경 시 허위내용의 등록</p>
                  <p class="mb-2">- 타인의 정보 도용</p>
                  <p class="mb-2">- 회사가 게시한 정보의 변경</p>
                  <p class="mb-2">- 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</p>
                  <p class="mb-2">- 회사나 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</p>
                  <p class="mb-2">- 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제8조 (서비스 이용의 제한)</h2>
              <p class="text-gray-600 mb-6">
                회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 
                경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제9조 (면책조항)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 회사는 천재지변, 전쟁 및 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 대한 책임이 면제됩니다.</p>
                <p class="mb-2">2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                <p class="mb-2">3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제10조 (분쟁해결)</h2>
              <p class="text-gray-600 mb-6">
                이 약관에 명시되지 않은 사항은 대한민국의 관계 법령과 상관례에 따라 처리하며, 
                서비스 이용으로 발생한 분쟁에 대해 소송이 필요한 경우 민사소송법상의 관할법원에 제기합니다.
              </p>

              <div class="mt-12 pt-8 border-t border-gray-200">
                <p class="text-sm text-gray-500">시행일자: 2024년 1월 1일</p>
                <p class="text-sm text-gray-500">(주)와우쓰리디 플랫폼</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Privacy Policy page
app.get('/privacy', (c) => {
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
          
          <div class="flex items-center space-x-4">
            <a href="/" class="text-gray-600 hover:text-blue-600 transition-colors">홈으로</a>
          </div>
        </nav>
      </header>

      {/* Privacy Policy Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
            
            <div class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">제1조 (개인정보의 처리목적)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">(주)와우쓰리디(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                
                <div class="mt-4">
                  <p class="font-medium mb-2">1. 회원 가입 및 관리</p>
                  <p class="mb-4">회원 식별, 회원자격 유지·관리, 서비스 부정이용 방지, 만14세 미만 아동의 개인정보 처리 시 법정대리인의 동의여부 확인, 각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.</p>
                  
                  <p class="font-medium mb-2">2. 구인구직 서비스 제공</p>
                  <p class="mb-4">구인정보 제공, 구직자 정보 제공, 매칭 서비스 제공, 본인인증, 연령인증, 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산 목적으로 개인정보를 처리합니다.</p>
                  
                  <p class="font-medium mb-2">3. 마케팅 및 광고에의 활용</p>
                  <p class="mb-4">신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계 목적으로 개인정보를 처리합니다.</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium mb-2">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
                  <p class="mb-2">• 회원 가입 및 관리: 회원 탈퇴 시까지</p>
                  <p class="mb-2">• 구인구직 서비스 제공: 서비스 이용 종료 시까지</p>
                  <p class="mb-2">• 계약 또는 청약철회 등에 관한 기록: 5년</p>
                  <p class="mb-2">• 대금결제 및 재화 등의 공급에 관한 기록: 5년</p>
                  <p class="mb-2">• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제3조 (처리하는 개인정보의 항목)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
                
                <div class="space-y-4">
                  <div>
                    <p class="font-medium mb-2">1. 필수항목</p>
                    <p class="mb-2">• 이름, 이메일, 비밀번호, 연락처, 국적, 거주지역</p>
                    <p class="mb-2">• 구직자: 학력, 경력, 희망직종, 비자상태</p>
                    <p class="mb-2">• 기업: 회사명, 사업자등록번호, 담당자 정보</p>
                  </div>
                  
                  <div>
                    <p class="font-medium mb-2">2. 선택항목</p>
                    <p class="mb-2">• 프로필 사진, 자기소개서, 포트폴리오</p>
                  </div>
                  
                  <div>
                    <p class="font-medium mb-2">3. 자동수집항목</p>
                    <p class="mb-2">• IP주소, 쿠키, 서비스 이용기록, 접속 로그</p>
                  </div>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제4조 (개인정보의 제3자 제공)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                
                <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p class="font-medium text-yellow-800 mb-2">구인구직 매칭 서비스의 특성상 다음과 같은 경우 개인정보가 공유될 수 있습니다:</p>
                  <p class="text-yellow-700 mb-2">• 구직자가 구인공고에 지원하는 경우 해당 기업에 제공</p>
                  <p class="text-yellow-700 mb-2">• 기업이 구직자에게 채용제안을 하는 경우 해당 구직자에게 제공</p>
                  <p class="text-yellow-700">• 에이전트가 매칭 서비스를 제공하는 경우 관련 당사자에게 제공</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제5조 (개인정보처리의 위탁)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium mb-2">위탁업무 내용 및 수탁자:</p>
                  <p class="mb-2">• 클라우드 서비스: Cloudflare (데이터 저장 및 웹사이트 운영)</p>
                  <p class="mb-2">• 이메일 발송 서비스: (향후 추가 예정)</p>
                  <p>• SMS 발송 서비스: (향후 추가 예정)</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
                
                <div class="space-y-2">
                  <p>1. 개인정보 처리현황 통지요구</p>
                  <p>2. 개인정보 열람요구</p>
                  <p>3. 개인정보 오류 등이 있을 경우 정정·삭제요구</p>
                  <p>4. 개인정보 처리정지요구</p>
                </div>
                
                <p class="mt-4">권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제7조 (개인정보의 안전성 확보조치)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
                
                <div class="space-y-2">
                  <p>• 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</p>
                  <p>• 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</p>
                  <p>• 물리적 조치: 전산실, 자료보관실 등의 접근통제</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제8조 (개인정보보호책임자)</h2>
              <div class="text-gray-600 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p class="font-medium mb-2">개인정보보호책임자 연락처:</p>
                  <p class="mb-2">• 성명: 김순희</p>
                  <p class="mb-2">• 이메일: wow3d16@naver.com</p>
                  <p class="mb-2">• 전화번호: 054-464-3137</p>
                  <p>• 처리시간: 평일 09:00 ~ 18:00 (토·일·공휴일 제외)</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제9조 (개인정보 처리방침 변경)</h2>
              <p class="text-gray-600 mb-6">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>

              <div class="mt-12 pt-8 border-t border-gray-200">
                <p class="text-sm text-gray-500">시행일자: 2024년 1월 1일</p>
                <p class="text-sm text-gray-500">(주)와우쓰리디 플랫폼</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Cookie Policy page
app.get('/cookies', (c) => {
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
          
          <div class="flex items-center space-x-4">
            <a href="/" class="text-gray-600 hover:text-blue-600 transition-colors">홈으로</a>
          </div>
        </nav>
      </header>

      {/* Cookie Policy Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">쿠키 정책</h1>
            
            <div class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">쿠키란 무엇인가요?</h2>
              <p class="text-gray-600 mb-6">
                쿠키(Cookie)는 웹사이트를 방문할 때 웹사이트에서 이용자의 브라우저에 저장하는 작은 텍스트 파일입니다. 
                쿠키는 웹사이트가 이용자의 컴퓨터나 모바일 기기를 식별하고, 이용자의 환경설정을 저장하며, 
                웹사이트 이용 경험을 개선하는 데 사용됩니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">(주)와우쓰리디에서 사용하는 쿠키</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">저희 (주)와우쓰리디는 다음과 같은 목적으로 쿠키를 사용합니다:</p>
                
                <div class="space-y-6">
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-blue-800 mb-2">1. 필수 쿠키 (Essential Cookies)</h3>
                    <p class="text-blue-700 mb-2">웹사이트의 기본 기능을 제공하기 위해 반드시 필요한 쿠키입니다.</p>
                    <div class="text-sm text-blue-600">
                      <p>• 로그인 상태 유지</p>
                      <p>• 보안 설정</p>
                      <p>• 세션 관리</p>
                      <p>• 언어 설정</p>
                    </div>
                  </div>
                  
                  <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-green-800 mb-2">2. 기능성 쿠키 (Functional Cookies)</h3>
                    <p class="text-green-700 mb-2">웹사이트의 향상된 기능과 개인화된 서비스를 제공하는 쿠키입니다.</p>
                    <div class="text-sm text-green-600">
                      <p>• 사용자 환경설정 저장</p>
                      <p>• 검색 기록 및 필터 설정</p>
                      <p>• 지역 설정</p>
                      <p>• 다크모드/라이트모드 설정</p>
                    </div>
                  </div>
                  
                  <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-yellow-800 mb-2">3. 분석 쿠키 (Analytics Cookies)</h3>
                    <p class="text-yellow-700 mb-2">웹사이트 이용 현황을 분석하고 서비스 개선에 활용하는 쿠키입니다.</p>
                    <div class="text-sm text-yellow-600">
                      <p>• 페이지 방문 통계</p>
                      <p>• 사용자 행동 분석</p>
                      <p>• 성능 모니터링</p>
                      <p>• 오류 추적</p>
                    </div>
                  </div>
                  
                  <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-purple-800 mb-2">4. 마케팅 쿠키 (Marketing Cookies)</h3>
                    <p class="text-purple-700 mb-2">개인화된 광고와 마케팅 콘텐츠를 제공하는 쿠키입니다.</p>
                    <div class="text-sm text-purple-600">
                      <p>• 맞춤형 광고</p>
                      <p>• 리타게팅</p>
                      <p>• 소셜미디어 연동</p>
                      <p>• 이메일 마케팅</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">사용 중인 구체적인 쿠키</h2>
              <div class="text-gray-600 mb-6">
                <div class="overflow-x-auto">
                  <table class="min-w-full border-collapse border border-gray-300">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="border border-gray-300 px-4 py-2 text-left">쿠키명</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">목적</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">보관기간</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">유형</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">wowcampus_token</td>
                        <td class="border border-gray-300 px-4 py-2">로그인 인증 토큰</td>
                        <td class="border border-gray-300 px-4 py-2">24시간</td>
                        <td class="border border-gray-300 px-4 py-2">필수</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">user_preferences</td>
                        <td class="border border-gray-300 px-4 py-2">사용자 설정 저장</td>
                        <td class="border border-gray-300 px-4 py-2">1년</td>
                        <td class="border border-gray-300 px-4 py-2">기능성</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">language_setting</td>
                        <td class="border border-gray-300 px-4 py-2">언어 설정</td>
                        <td class="border border-gray-300 px-4 py-2">1년</td>
                        <td class="border border-gray-300 px-4 py-2">기능성</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">session_id</td>
                        <td class="border border-gray-300 px-4 py-2">세션 관리</td>
                        <td class="border border-gray-300 px-4 py-2">브라우저 종료 시</td>
                        <td class="border border-gray-300 px-4 py-2">필수</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">analytics_data</td>
                        <td class="border border-gray-300 px-4 py-2">웹사이트 이용 분석</td>
                        <td class="border border-gray-300 px-4 py-2">2년</td>
                        <td class="border border-gray-300 px-4 py-2">분석</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">쿠키 관리 방법</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">이용자는 쿠키 설정을 통해 쿠키의 허용, 차단, 삭제를 선택할 수 있습니다:</p>
                
                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 class="font-semibold mb-2">브라우저별 쿠키 설정 방법:</h3>
                  <div class="space-y-2 text-sm">
                    <p><strong>Chrome:</strong> 설정 → 고급 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</p>
                    <p><strong>Firefox:</strong> 환경설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터</p>
                    <p><strong>Safari:</strong> 환경설정 → 개인정보 → 쿠키 및 웹사이트 데이터</p>
                    <p><strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한 → 쿠키 및 저장된 데이터</p>
                  </div>
                </div>
                
                <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
                  <p class="text-amber-800 font-medium mb-2">⚠️ 주의사항</p>
                  <p class="text-amber-700">필수 쿠키를 차단하면 웹사이트의 일부 기능이 정상적으로 작동하지 않을 수 있습니다. 특히 로그인 기능과 개인화된 서비스 이용에 제한이 있을 수 있습니다.</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제3자 쿠키</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">저희 웹사이트는 다음과 같은 제3자 서비스를 이용하며, 이들 서비스에서 쿠키를 설정할 수 있습니다:</p>
                
                <div class="space-y-3">
                  <div class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p class="font-medium">Google Analytics</p>
                      <p class="text-sm text-gray-500">웹사이트 이용 통계 분석</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p class="font-medium">Cloudflare</p>
                      <p class="text-sm text-gray-500">웹사이트 보안 및 성능 최적화</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p class="font-medium">소셜미디어 플러그인</p>
                      <p class="text-sm text-gray-500">Facebook, LinkedIn, Twitter 연동</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">쿠키 정책 변경</h2>
              <p class="text-gray-600 mb-6">
                본 쿠키 정책은 법률 변경이나 서비스 개선에 따라 수정될 수 있습니다. 
                중요한 변경사항이 있는 경우 웹사이트를 통해 사전에 공지하겠습니다. 
                정책 변경 후에도 웹사이트를 계속 이용하시면 변경된 정책에 동의하는 것으로 간주됩니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">문의하기</h2>
              <div class="bg-blue-50 p-4 rounded-lg mb-6">
                <p class="text-blue-800 mb-2">쿠키 정책에 대한 문의사항이 있으시면 아래 연락처로 문의해주세요:</p>
                <div class="text-blue-700 text-sm space-y-1">
                  <p>• 이메일: wow3d16@naver.com</p>
                  <p>• 전화: 054-464-3137</p>
                  <p>• 운영시간: 평일 09:00~18:00 (토·일·공휴일 제외)</p>
                </div>
              </div>

              <div class="mt-12 pt-8 border-t border-gray-200">
                <p class="text-sm text-gray-500">시행일자: 2024년 1월 1일</p>
                <p class="text-sm text-gray-500">최근 업데이트: 2024년 10월 11일</p>
                <p class="text-sm text-gray-500">(주)와우쓰리디 플랫폼</p>
              </div>
            </div>
          </div>
        </div>
      </main>
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

// 🎯 사용자별 맞춤 대시보드 라우트

// 구직자 전용 대시보드
app.get('/dashboard/jobseeker', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    throw new HTTPException(403, { message: '구직자만 접근할 수 있는 페이지입니다.' });
  }

  // 구직자 관련 데이터 조회
  let dashboardData = {
    applications_count: 0,
    profile_views: 87, // 기본값
    interview_offers: 0,
    rating: 4.8, // 기본값
    recent_applications: [],
    notifications: []
  };

  try {
    // 1. 먼저 jobseeker ID 조회
    const jobseekerRecord = await c.env.DB.prepare(`
      SELECT id FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();

    if (jobseekerRecord) {
      const jobseekerId = jobseekerRecord.id;

      // 2. 지원한 공고 수 조회 (간단한 쿼리)
      const applicationsCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications WHERE jobseeker_id = ?
      `).bind(jobseekerId).first();

      dashboardData.applications_count = applicationsCount?.count || 0;

      // 3. 면접 제안 수 조회  
      const interviewCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications 
        WHERE jobseeker_id = ? AND status = 'interview'
      `).bind(jobseekerId).first();

      dashboardData.interview_offers = interviewCount?.count || 0;

      // 4. 최근 지원 현황 조회 (기본 데이터만)
      const recentApplications = await c.env.DB.prepare(`
        SELECT id, status, applied_at FROM applications 
        WHERE jobseeker_id = ? 
        ORDER BY applied_at DESC 
        LIMIT 5
      `).bind(jobseekerId).all();

      dashboardData.recent_applications = recentApplications.results || [];
    }

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    // 에러가 발생해도 페이지는 표시 (기본 데이터 사용)
  }
  
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
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
      </header>

      {/* 구직자 대시보드 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">안녕하세요, {user.email}님!</h1>
              <p class="text-green-100">구직자 대시보드에서 나의 활동을 관리하세요</p>
            </div>
            <div class="text-6xl opacity-20">
              <i class="fas fa-user-tie"></i>
            </div>
          </div>
        </div>

        {/* KPI 카드 - 실제 데이터 연동 */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.applications_count}</p>
                <p class="text-gray-600 text-sm">지원한 공고</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-eye text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.profile_views}</p>
                <p class="text-gray-600 text-sm">프로필 조회수</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-handshake text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.interview_offers}</p>
                <p class="text-gray-600 text-sm">면접 제안</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-star text-yellow-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.rating}</p>
                <p class="text-gray-600 text-sm">평점</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 그리드 */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 최근 지원 현황 */}
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">최근 지원 현황</h2>
              <div class="space-y-4">
                {dashboardData.recent_applications.length > 0 ? (
                  dashboardData.recent_applications.map((application, index) => {
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      reviewing: 'bg-blue-100 text-blue-800', 
                      interview: 'bg-purple-100 text-purple-800',
                      accepted: 'bg-green-100 text-green-800',
                      rejected: 'bg-red-100 text-red-800'
                    };
                    
                    const statusLabels = {
                      pending: '검토 대기',
                      reviewing: '검토 중',
                      interview: '면접 대기', 
                      accepted: '합격',
                      rejected: '불합격'
                    };
                    
                    return (
                      <div key={application.id} class="flex items-center justify-between p-4 border rounded-lg">
                        <div class="flex items-center">
                          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-building text-blue-600"></i>
                          </div>
                          <div class="ml-4">
                            <h3 class="font-medium text-gray-900">{application.company_name} - {application.job_title}</h3>
                            <p class="text-gray-600 text-sm">{new Date(application.applied_at).toLocaleDateString('ko-KR')} 지원</p>
                          </div>
                        </div>
                        <span class={`px-3 py-1 rounded-full text-sm ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[application.status] || application.status}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div class="text-center py-12">
                    <i class="fas fa-briefcase text-gray-300 text-6xl mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-500 mb-2">아직 지원한 공고가 없습니다</h3>
                    <p class="text-gray-400 mb-6">맞춤 구인공고를 찾아 지원해보세요!</p>
                    <a href="/jobs" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-search mr-2"></i>
                      구인공고 찾기
                    </a>
                  </div>
                )}
              </div>
              
              <div class="mt-6">
                <a href="/jobs" class="text-blue-600 font-medium hover:underline">
                  더 많은 구인공고 보기 →
                </a>
              </div>
            </div>
          </div>
          
          {/* 빠른 액션 & 알림 */}
          <div class="space-y-6">
            {/* 빠른 액션 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">빠른 액션</h2>
              <div class="space-y-3">
                <a href="/profile" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-user-edit text-blue-600 mr-3"></i>
                  <span class="font-medium">프로필 수정</span>
                </a>
                <a href="/jobs" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-search text-green-600 mr-3"></i>
                  <span class="font-medium">구인공고 검색</span>
                </a>
                <a href="/matching" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-magic text-purple-600 mr-3"></i>
                  <span class="font-medium">AI 매칭</span>
                </a>
              </div>
            </div>
            
            {/* 알림 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">최근 알림</h2>
              <div class="space-y-3">
                <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p class="text-blue-800 text-sm font-medium">새로운 매칭 결과가 있습니다!</p>
                  <p class="text-blue-600 text-xs mt-1">2시간 전</p>
                </div>
                <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p class="text-green-800 text-sm font-medium">LG화학 서류 합격 축하합니다</p>
                  <p class="text-green-600 text-xs mt-1">1일 전</p>
                </div>
                <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p class="text-yellow-800 text-sm font-medium">프로필을 업데이트해보세요</p>
                  <p class="text-yellow-600 text-xs mt-1">3일 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
});

// 🎨 프로필 편집 페이지 (구직자 전용)
app.get('/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    throw new HTTPException(403, { message: '구직자만 접근할 수 있는 페이지입니다.' });
  }

  // 구직자 프로필 데이터 조회
  let profileData: any = null;
  
  try {
    const jobseeker = await c.env.DB.prepare(`
      SELECT * FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();
    
    if (jobseeker) {
      profileData = jobseeker;
    }
  } catch (error) {
    console.error('프로필 조회 오류:', error);
  }

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
            {/* 동적 메뉴 */}
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            {/* 동적 인증 버튼 */}
          </div>
        </nav>
      </header>

      {/* 프로필 편집 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">프로필 관리</h1>
              <p class="text-gray-600">나의 정보를 업데이트하고 채용 기회를 높이세요</p>
            </div>
            <a href="/dashboard/jobseeker" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>
              대시보드로 돌아가기
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 편집 폼 */}
          <div class="lg:col-span-2">
            <form id="profile-edit-form" class="space-y-6">
              {/* 기본 정보 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-user text-blue-600 mr-3"></i>
                  기본 정보
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      이름(First Name) <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="first_name" 
                      id="profile-first-name"
                      value={profileData?.first_name || ''}
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="길동"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      성(Last Name)
                    </label>
                    <input 
                      type="text" 
                      name="last_name" 
                      id="profile-last-name"
                      value={profileData?.last_name || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="홍"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      이메일 <span class="text-gray-400">(변경 불가)</span>
                    </label>
                    <input 
                      type="email" 
                      value={user.email}
                      disabled
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      국적
                    </label>
                    <input 
                      type="text" 
                      name="nationality" 
                      id="profile-nationality"
                      value={profileData?.nationality || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="대한민국"
                    />
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <textarea 
                      name="bio" 
                      id="profile-bio"
                      rows="4"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="간단한 자기소개를 작성해주세요..."
                    >{profileData?.bio || ''}</textarea>
                  </div>
                </div>
              </div>

              {/* 경력 정보 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-briefcase text-green-600 mr-3"></i>
                  경력 정보
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      직무 분야
                    </label>
                    <select 
                      name="skills" 
                      id="profile-skills"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="IT/소프트웨어" selected={profileData?.field === 'IT/소프트웨어'}>IT/소프트웨어</option>
                      <option value="디자인" selected={profileData?.field === '디자인'}>디자인</option>
                      <option value="마케팅/영업" selected={profileData?.field === '마케팅/영업'}>마케팅/영업</option>
                      <option value="제조/생산" selected={profileData?.field === '제조/생산'}>제조/생산</option>
                      <option value="서비스" selected={profileData?.field === '서비스'}>서비스</option>
                      <option value="교육" selected={profileData?.field === '교육'}>교육</option>
                      <option value="헬스케어" selected={profileData?.field === '헬스케어'}>헬스케어</option>
                      <option value="금융" selected={profileData?.field === '금융'}>금융</option>
                      <option value="기타" selected={profileData?.field === '기타'}>기타</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      경력 연수
                    </label>
                    <select 
                      name="experience_years" 
                      id="profile-experience"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="0" selected={profileData?.experience_years === 0}>신입</option>
                      <option value="1" selected={profileData?.experience_years === 1}>1년</option>
                      <option value="2" selected={profileData?.experience_years === 2}>2년</option>
                      <option value="3" selected={profileData?.experience_years === 3}>3년</option>
                      <option value="4" selected={profileData?.experience_years === 4}>4년</option>
                      <option value="5" selected={profileData?.experience_years === 5}>5년</option>
                      <option value="6" selected={profileData?.experience_years >= 6}>6년 이상</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      학력
                    </label>
                    <select 
                      name="education_level" 
                      id="profile-education-level"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="고등학교 졸업" selected={profileData?.education === '고등학교 졸업'}>고등학교 졸업</option>
                      <option value="전문대 재학" selected={profileData?.education === '전문대 재학'}>전문대 재학</option>
                      <option value="전문대 졸업" selected={profileData?.education === '전문대 졸업'}>전문대 졸업</option>
                      <option value="대학교 재학" selected={profileData?.education === '대학교 재학'}>대학교 재학</option>
                      <option value="대학교 졸업" selected={profileData?.education === '대학교 졸업'}>대학교 졸업</option>
                      <option value="석사" selected={profileData?.education === '석사'}>석사</option>
                      <option value="박사" selected={profileData?.education === '박사'}>박사</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      비자 종류
                    </label>
                    <select 
                      name="visa_status" 
                      id="profile-visa-status"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="F-2" selected={profileData?.visa_type === 'F-2'}>F-2 (거주)</option>
                      <option value="F-4" selected={profileData?.visa_type === 'F-4'}>F-4 (재외동포)</option>
                      <option value="F-5" selected={profileData?.visa_type === 'F-5'}>F-5 (영주)</option>
                      <option value="E-7" selected={profileData?.visa_type === 'E-7'}>E-7 (특정활동)</option>
                      <option value="E-9" selected={profileData?.visa_type === 'E-9'}>E-9 (비전문취업)</option>
                      <option value="D-2" selected={profileData?.visa_type === 'D-2'}>D-2 (유학)</option>
                      <option value="D-8" selected={profileData?.visa_type === 'D-8'}>D-8 (기업투자)</option>
                      <option value="D-10" selected={profileData?.visa_type === 'D-10'}>D-10 (구직)</option>
                      <option value="기타" selected={profileData?.visa_type === '기타'}>기타</option>
                    </select>
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      자기소개 / 경력 요약
                    </label>
                    <textarea 
                      name="bio_extended" 
                      id="profile-bio-extended"
                      rows="3"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="주요 경력, 프로젝트 경험, 보유 기술 등을 자유롭게 작성하세요..."
                    >{profileData?.bio || ''}</textarea>
                  </div>
                </div>
              </div>

              {/* 희망 근무 조건 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-map-marker-alt text-purple-600 mr-3"></i>
                  희망 근무 조건
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      희망 지역
                    </label>
                    <select 
                      name="preferred_location" 
                      id="profile-location"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="서울" selected={profileData?.preferred_location === '서울'}>서울</option>
                      <option value="경기도" selected={profileData?.preferred_location === '경기도'}>경기도</option>
                      <option value="인천" selected={profileData?.preferred_location === '인천'}>인천</option>
                      <option value="강원도" selected={profileData?.preferred_location === '강원도'}>강원도</option>
                      <option value="충청도" selected={profileData?.preferred_location === '충청도'}>충청도</option>
                      <option value="경상도" selected={profileData?.preferred_location === '경상도'}>경상도</option>
                      <option value="전라도" selected={profileData?.preferred_location === '전라도'}>전라도</option>
                      <option value="제주도" selected={profileData?.preferred_location === '제주도'}>제주도</option>
                      <option value="전국" selected={profileData?.preferred_location === '전국'}>전국</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      희망 연봉 (만원)
                    </label>
                    <input 
                      type="number" 
                      name="salary_expectation" 
                      id="profile-salary-expectation"
                      value={profileData?.salary_expectation || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: 3500"
                      min="0"
                      step="100"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      한국어 능력 (TOPIK)
                    </label>
                    <select 
                      name="korean_level" 
                      id="profile-korean"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="TOPIK 1급" selected={profileData?.korean_level === 'TOPIK 1급'}>TOPIK 1급 (기초)</option>
                      <option value="TOPIK 2급" selected={profileData?.korean_level === 'TOPIK 2급'}>TOPIK 2급 (초급)</option>
                      <option value="TOPIK 3급" selected={profileData?.korean_level === 'TOPIK 3급'}>TOPIK 3급 (중급)</option>
                      <option value="TOPIK 4급" selected={profileData?.korean_level === 'TOPIK 4급'}>TOPIK 4급 (중상급)</option>
                      <option value="TOPIK 5급" selected={profileData?.korean_level === 'TOPIK 5급'}>TOPIK 5급 (고급)</option>
                      <option value="TOPIK 6급" selected={profileData?.korean_level === 'TOPIK 6급'}>TOPIK 6급 (최상급)</option>
                      <option value="원어민" selected={profileData?.korean_level === '원어민'}>원어민</option>
                      <option value="미응시" selected={profileData?.korean_level === '미응시'}>미응시</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      입사 가능일
                    </label>
                    <input 
                      type="date" 
                      name="available_start_date" 
                      id="profile-start-date"
                      value={profileData?.available_start_date || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 이력서 및 경력 문서 업로드 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-file-upload text-purple-600 mr-3"></i>
                  이력서 및 경력 문서
                </h2>
                
                {/* 업로드 영역 */}
                <div class="mb-6">
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input 
                      type="file" 
                      id="document-file-input" 
                      class="hidden" 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <i class="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-4"></i>
                    <p class="text-lg font-medium text-gray-700 mb-2">파일을 드래그하거나 클릭하여 업로드</p>
                    <p class="text-sm text-gray-500 mb-4">지원 형식: PDF, Word, 이미지 (최대 10MB)</p>
                    <button 
                      type="button"
                      id="select-file-btn"
                      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      파일 선택
                    </button>
                  </div>
                  
                  {/* 선택된 파일 정보 */}
                  <div id="selected-file-info" class="mt-4 hidden">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                          <i class="fas fa-file text-blue-600 mr-3"></i>
                          <div>
                            <p id="file-name" class="font-medium text-gray-900"></p>
                            <p id="file-size" class="text-sm text-gray-500"></p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          id="clear-file-btn"
                          class="text-red-600 hover:text-red-700"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      
                      {/* 문서 타입 선택 */}
                      <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          문서 종류 <span class="text-red-500">*</span>
                        </label>
                        <select 
                          id="document-type" 
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="resume">이력서</option>
                          <option value="career">경력증명서</option>
                          <option value="certificate">자격증/증명서</option>
                          <option value="other">기타</option>
                        </select>
                      </div>
                      
                      {/* 문서 설명 */}
                      <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          문서 설명 (선택)
                        </label>
                        <input 
                          type="text" 
                          id="document-description"
                          placeholder="예: 2024년 업데이트된 이력서"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* 업로드 버튼 */}
                      <button 
                        type="button"
                        id="upload-document-btn"
                        class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <i class="fas fa-upload mr-2"></i>
                        문서 업로드
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 업로드된 문서 목록 */}
                <div>
                  <h3 class="text-lg font-bold text-gray-900 mb-4">업로드된 문서</h3>
                  <div id="documents-list" class="space-y-3">
                    {/* 동적으로 로드됨 */}
                    <div class="text-center py-8 text-gray-500">
                      <i class="fas fa-folder-open text-4xl mb-2"></i>
                      <p>업로드된 문서가 없습니다</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 저장 버튼 */}
              <div class="flex items-center justify-between">
                <button 
                  type="button" 
                  onclick="window.location.href='/dashboard/jobseeker'"
                  class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  id="save-profile-btn"
                  class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <i class="fas fa-save mr-2"></i>
                  프로필 저장
                </button>
              </div>
            </form>
          </div>

          {/* 프로필 완성도 & 팁 */}
          <div class="space-y-6">
            {/* 프로필 완성도 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-4">프로필 완성도</h2>
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl font-bold text-blue-600" id="profile-completion">0%</span>
                  <span class="text-sm text-gray-500">완성됨</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div id="profile-progress-bar" class="bg-blue-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
              </div>
              <p class="text-sm text-gray-600">
                프로필을 완성하면 채용 담당자에게 더 잘 보여집니다!
              </p>
            </div>

            {/* 프로필 작성 팁 */}
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <h2 class="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                프로필 작성 팁
              </h2>
              <ul class="space-y-3 text-sm text-blue-800">
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>구체적인 경력과 프로젝트를 작성하세요</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>보유 스킬을 상세히 나열하세요</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>자기소개는 간결하고 명확하게</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>정확한 비자 정보를 입력하세요</span>
                </li>
              </ul>
            </div>

            {/* 도움말 */}
            <div class="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 class="font-bold text-green-900 mb-2 flex items-center">
                <i class="fas fa-info-circle mr-2"></i>
                도움이 필요하신가요?
              </h3>
              <p class="text-sm text-green-800 mb-4">
                프로필 작성에 어려움이 있으시면 고객센터에 문의하세요.
              </p>
              <a href="/support" class="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-900">
                고객센터 바로가기
                <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* 프로필 데이터를 JavaScript 변수로 전달 */}
      <script dangerouslySetInnerHTML={{__html: `
        window.profileData = ${JSON.stringify(profileData || {})};
      `}} />
      
      {/* 프로필 저장 스크립트 */}
      <script dangerouslySetInnerHTML={{__html: `
        // 프로필 데이터 로드
        function loadProfileData() {
          if (!window.profileData) return;
          
          const data = window.profileData;
          
          // 기본 정보
          const firstNameEl = document.getElementById('profile-first-name');
          const lastNameEl = document.getElementById('profile-last-name');
          const nationalityEl = document.getElementById('profile-nationality');
          const bioEl = document.getElementById('profile-bio');
          
          if (firstNameEl && data.first_name) firstNameEl.value = data.first_name;
          if (lastNameEl && data.last_name) lastNameEl.value = data.last_name;
          if (nationalityEl && data.nationality) nationalityEl.value = data.nationality;
          if (bioEl && data.bio) bioEl.value = data.bio;
          
          // 경력 정보
          const skillsEl = document.getElementById('profile-skills');
          const experienceEl = document.getElementById('profile-experience');
          const educationEl = document.getElementById('profile-education-level');
          const visaEl = document.getElementById('profile-visa-status');
          
          if (skillsEl && data.skills) skillsEl.value = data.skills;
          if (experienceEl && data.experience_years !== undefined) experienceEl.value = data.experience_years;
          if (educationEl && data.education_level) educationEl.value = data.education_level;
          if (visaEl && data.visa_status) visaEl.value = data.visa_status;
          
          // 희망 근무 조건
          const locationEl = document.getElementById('profile-location');
          const salaryEl = document.getElementById('profile-salary-expectation');
          const koreanEl = document.getElementById('profile-korean');
          const startDateEl = document.getElementById('profile-start-date');
          
          if (locationEl && data.preferred_location) locationEl.value = data.preferred_location;
          if (salaryEl && data.salary_expectation) salaryEl.value = data.salary_expectation;
          if (koreanEl && data.korean_level) koreanEl.value = data.korean_level;
          if (startDateEl && data.available_start_date) startDateEl.value = data.available_start_date;
        }
        
        // 프로필 완성도 계산
        function calculateProfileCompletion() {
          const fields = [
            document.getElementById('profile-first-name'),
            document.getElementById('profile-last-name'),
            document.getElementById('profile-nationality'),
            document.getElementById('profile-bio'),
            document.getElementById('profile-skills'),
            document.getElementById('profile-experience'),
            document.getElementById('profile-education-level'),
            document.getElementById('profile-visa-status'),
            document.getElementById('profile-location'),
            document.getElementById('profile-salary-expectation'),
            document.getElementById('profile-korean'),
            document.getElementById('profile-start-date')
          ];
          
          let filledCount = 0;
          fields.forEach(field => {
            if (field && field.value && field.value.trim() !== '') {
              filledCount++;
            }
          });
          
          const percentage = Math.round((filledCount / fields.length) * 100);
          document.getElementById('profile-completion').textContent = percentage + '%';
          document.getElementById('profile-progress-bar').style.width = percentage + '%';
          
          return percentage;
        }
        
        // 페이지 로드 시 데이터 로드 및 완성도 계산
        document.addEventListener('DOMContentLoaded', () => {
          loadProfileData();
          calculateProfileCompletion();
          
          // 입력 필드 변경 시 완성도 재계산
          const form = document.getElementById('profile-edit-form');
          if (form) {
            form.addEventListener('input', calculateProfileCompletion);
          }
        });
        
        // 프로필 저장
        document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          
          const saveBtn = document.getElementById('save-profile-btn');
          const originalText = saveBtn.innerHTML;
          saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>저장 중...';
          saveBtn.disabled = true;
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/profile/jobseeker', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            console.log('서버 응답:', result);
            console.log('응답 상태 코드:', response.status);
            
            if (result.success) {
              alert('✅ 프로필이 성공적으로 저장되었습니다!');
              window.location.href = '/dashboard/jobseeker';
            } else {
              console.error('저장 실패:', result);
              const errorMsg = result.message || '프로필 저장에 실패했습니다.';
              const errorDetail = result.error || '';
              alert('❌ ' + errorMsg + (errorDetail ? '\\n\\n상세: ' + errorDetail : ''));
            }
          } catch (error) {
            console.error('프로필 저장 오류:', error);
            alert('❌ 프로필 저장 중 오류가 발생했습니다.\\n\\n오류: ' + error.message);
          } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
          }
        });
        
        // ==================== 문서 관리 JavaScript ====================
        
        // 전역 변수
        let selectedFile = null;
        
        // 페이지 로드 시 문서 목록 로드 및 이벤트 리스너 등록
        document.addEventListener('DOMContentLoaded', () => {
          loadDocuments();
          
          // 파일 선택 버튼 이벤트
          const selectFileBtn = document.getElementById('select-file-btn');
          if (selectFileBtn) {
            selectFileBtn.addEventListener('click', () => {
              document.getElementById('document-file-input').click();
            });
          }
          
          // 파일 input change 이벤트
          const fileInput = document.getElementById('document-file-input');
          if (fileInput) {
            fileInput.addEventListener('change', (event) => {
              handleFileSelect(event);
            });
          }
          
          // 파일 선택 취소 버튼 이벤트
          const clearFileBtn = document.getElementById('clear-file-btn');
          if (clearFileBtn) {
            clearFileBtn.addEventListener('click', () => {
              clearFileSelection();
            });
          }
          
          // 문서 업로드 버튼 이벤트
          const uploadBtn = document.getElementById('upload-document-btn');
          if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
              uploadDocument();
            });
          }
        });
        
        // 문서 목록 로드
        async function loadDocuments() {
          try {
            const response = await fetch('/api/documents', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success && result.documents && result.documents.length > 0) {
              displayDocuments(result.documents);
              setupDocumentListeners();
            } else {
              displayEmptyDocuments();
            }
          } catch (error) {
            console.error('문서 목록 로드 오류:', error);
            displayEmptyDocuments();
          }
        }
        
        // 문서 목록 이벤트 리스너 설정 (이벤트 위임)
        function setupDocumentListeners() {
          // 다운로드 버튼 이벤트 위임
          document.querySelectorAll('.doc-download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const docId = e.currentTarget.getAttribute('data-doc-id');
              const docName = e.currentTarget.getAttribute('data-doc-name');
              downloadDocument(docId, docName);
            });
          });
          
          // 삭제 버튼 이벤트 위임
          document.querySelectorAll('.doc-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const docId = e.currentTarget.getAttribute('data-doc-id');
              deleteDocument(docId);
            });
          });
        }
        
        // 문서 목록 표시
        function displayDocuments(documents) {
          const container = document.getElementById('documents-list');
          
          const documentTypeLabels = {
            'resume': '이력서',
            'career': '경력증명서',
            'certificate': '자격증/증명서',
            'other': '기타'
          };
          
          const documentTypeIcons = {
            'resume': 'fa-file-alt',
            'career': 'fa-briefcase',
            'certificate': 'fa-certificate',
            'other': 'fa-file'
          };
          
          const documentTypeColors = {
            'resume': 'blue',
            'career': 'green',
            'certificate': 'purple',
            'other': 'gray'
          };
          
          container.innerHTML = documents.map(doc => {
            const fileSize = formatFileSize(doc.file_size);
            const uploadDate = new Date(doc.upload_date).toLocaleDateString('ko-KR');
            const typeLabel = documentTypeLabels[doc.document_type] || doc.document_type;
            const typeIcon = documentTypeIcons[doc.document_type] || 'fa-file';
            const typeColor = documentTypeColors[doc.document_type] || 'gray';
            
            return \`
              <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                  <div class="flex items-center flex-1">
                    <div class="w-12 h-12 bg-\${typeColor}-100 rounded-lg flex items-center justify-center mr-4">
                      <i class="fas \${typeIcon} text-\${typeColor}-600 text-xl"></i>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <h4 class="font-medium text-gray-900">\${doc.file_name}</h4>
                        <span class="px-2 py-1 bg-\${typeColor}-100 text-\${typeColor}-800 text-xs rounded-full">
                          \${typeLabel}
                        </span>
                      </div>
                      <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span><i class="fas fa-file-archive mr-1"></i>\${fileSize}</span>
                        <span><i class="fas fa-calendar mr-1"></i>\${uploadDate}</span>
                      </div>
                      \${doc.description ? \`<p class="text-sm text-gray-600 mt-1">\${doc.description}</p>\` : ''}
                    </div>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <button 
                      class="doc-download-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      data-doc-id="\${doc.id}"
                      data-doc-name="\${doc.original_name}"
                      title="다운로드"
                    >
                      <i class="fas fa-download"></i>
                    </button>
                    <button 
                      class="doc-delete-btn p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      data-doc-id="\${doc.id}"
                      title="삭제"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 빈 문서 목록 표시
        function displayEmptyDocuments() {
          const container = document.getElementById('documents-list');
          container.innerHTML = \`
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-folder-open text-4xl mb-2"></i>
              <p>업로드된 문서가 없습니다</p>
            </div>
          \`;
        }
        
        // 파일 크기 포맷
        function formatFileSize(bytes) {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }
        
        // 파일 선택 핸들러
        function handleFileSelect(event) {
          console.log('📁 handleFileSelect 호출됨');
          console.log('event.target:', event.target);
          console.log('event.target.files:', event.target.files);
          
          const file = event.target.files[0];
          if (!file) {
            console.warn('⚠️ 선택된 파일 없음');
            return;
          }
          
          console.log('📄 파일 정보:', {
            name: file.name,
            size: file.size,
            type: file.type
          });
          
          // 파일 크기 체크 (10MB)
          if (file.size > 10 * 1024 * 1024) {
            alert('❌ 파일 크기는 10MB를 초과할 수 없습니다.\\n\\n현재 크기: ' + formatFileSize(file.size));
            event.target.value = '';
            selectedFile = null;
            return;
          }
          
          // 파일 타입 체크
          const allowedTypes = ['application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg', 'image/png', 'image/jpg'];
          
          if (!allowedTypes.includes(file.type)) {
            alert('❌ 허용되지 않는 파일 형식입니다.\\n\\n허용 형식: PDF, Word, 이미지 (JPG, PNG)\\n현재 파일: ' + file.type);
            event.target.value = '';
            selectedFile = null;
            return;
          }
          
          // 전역 변수에 파일 저장
          selectedFile = file;
          console.log('✅ selectedFile 변수에 파일 저장됨:', selectedFile);
          
          // 파일 정보 표시
          const fileNameElement = document.getElementById('file-name');
          const fileSizeElement = document.getElementById('file-size');
          const selectedFileInfo = document.getElementById('selected-file-info');
          
          if (fileNameElement) fileNameElement.textContent = file.name;
          if (fileSizeElement) fileSizeElement.textContent = formatFileSize(file.size);
          if (selectedFileInfo) selectedFileInfo.classList.remove('hidden');
          
          console.log('✅ 파일 선택 완료:', {
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            selectedFileVariable: selectedFile ? 'SET' : 'NULL'
          });
        }
        
        // 파일 선택 취소
        function clearFileSelection() {
          console.log('🗑️ 파일 선택 취소');
          selectedFile = null;
          
          const fileInput = document.getElementById('document-file-input');
          if (fileInput) fileInput.value = '';
          
          const selectedFileInfo = document.getElementById('selected-file-info');
          if (selectedFileInfo) selectedFileInfo.classList.add('hidden');
          
          console.log('✅ 파일 선택 취소 완료');
        }
        
        // 문서 업로드
        async function uploadDocument() {
          // 디버깅: 파일 입력 요소 확인
          const fileInput = document.getElementById('document-file-input');
          console.log('파일 입력 요소:', fileInput);
          console.log('files 속성:', fileInput ? fileInput.files : 'null');
          console.log('files 길이:', fileInput && fileInput.files ? fileInput.files.length : 0);
          console.log('selectedFile 변수:', selectedFile);
          
          // selectedFile 대신 input에서 직접 파일 가져오기
          let file = null;
          
          // 방법 1: input.files 에서 가져오기
          if (fileInput && fileInput.files && fileInput.files.length > 0) {
            file = fileInput.files[0];
            console.log('✅ input.files에서 파일 찾음:', file.name);
          }
          // 방법 2: selectedFile 변수에서 가져오기
          else if (selectedFile) {
            file = selectedFile;
            console.log('✅ selectedFile 변수에서 파일 찾음:', file.name);
          }
          
          if (!file) {
            console.error('❌ 파일을 찾을 수 없습니다.');
            alert('❌ 파일을 선택해주세요.\\n\\n파일 선택 버튼을 다시 클릭하여 파일을 선택해주세요.');
            return;
          }
          
          console.log('📤 업로드할 파일:', {
            name: file.name,
            size: file.size,
            type: file.type
          });
          
          const documentType = document.getElementById('document-type').value;
          const description = document.getElementById('document-description').value;
          
          const uploadBtn = document.getElementById('upload-document-btn');
          const originalText = uploadBtn.innerHTML;
          uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>업로드 중...';
          uploadBtn.disabled = true;
          
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            formData.append('description', description);
            
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/documents/upload', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token
              },
              body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
              // 성공 메시지 표시
              const successMsg = \`✅ 문서가 성공적으로 업로드되었습니다!\\n\\n📄 파일명: \${file.name}\\n📊 크기: \${formatFileSize(file.size)}\\n📁 유형: \${documentType}\`;
              alert(successMsg);
              clearFileSelection();
              document.getElementById('document-description').value = '';
              // 문서 타입을 기본값으로 리셋
              document.getElementById('document-type').value = 'resume';
              loadDocuments();
            } else {
              alert('❌ ' + (result.message || '문서 업로드에 실패했습니다.'));
            }
          } catch (error) {
            console.error('문서 업로드 오류:', error);
            alert('❌ 문서 업로드 중 오류가 발생했습니다.\\n\\n상세: ' + (error.message || '알 수 없는 오류'));
          } finally {
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
          }
        }
        
        // 문서 다운로드
        async function downloadDocument(documentId, fileName) {
          try {
            console.log('📥 다운로드 시작:', fileName);
            
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/documents/\${documentId}/download\`, {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            if (response.ok) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              console.log('✅ 다운로드 완료:', fileName);
              // 다운로드 성공 메시지는 표시하지 않음 (파일 다운로드가 진행되므로)
            } else {
              const result = await response.json();
              alert('❌ ' + (result.message || '문서 다운로드에 실패했습니다.'));
            }
          } catch (error) {
            console.error('문서 다운로드 오류:', error);
            alert('❌ 문서 다운로드 중 오류가 발생했습니다.\\n\\n상세: ' + (error.message || '알 수 없는 오류'));
          }
        }
        
        // 문서 삭제
        async function deleteDocument(documentId) {
          // 문서 이름 가져오기
          const docElement = document.querySelector(\`[data-doc-id="\${documentId}"]\`);
          const docName = docElement ? docElement.getAttribute('data-doc-name') : '이 문서';
          
          if (!confirm(\`정말로 "\${docName}"을(를) 삭제하시겠습니까?\\n\\n⚠️ 삭제된 문서는 복구할 수 없습니다.\`)) {
            return;
          }
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/documents/\${documentId}\`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('✅ 문서가 성공적으로 삭제되었습니다.');
              loadDocuments();
            } else {
              alert('❌ ' + (result.message || '문서 삭제에 실패했습니다.'));
            }
          } catch (error) {
            console.error('문서 삭제 오류:', error);
            alert('❌ 문서 삭제 중 오류가 발생했습니다.\\n\\n상세: ' + (error.message || '알 수 없는 오류'));
          }
        }
        
        // ==================== 끝: 문서 관리 JavaScript ====================
      `}}>
      </script>
    </div>
  );
});

// 기업 전용 대시보드  
app.get('/dashboard/company', optionalAuth, (c) => {
  const user = c.get('user');
  
  if (!user || user.user_type !== 'company') {
    throw new HTTPException(403, { message: '기업 사용자만 접근할 수 있는 페이지입니다.' });
  }
  
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
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
      </header>

      {/* 기업 대시보드 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">환영합니다, {user.email} 기업!</h1>
              <p class="text-purple-100">채용 관리 대시보드에서 인재를 찾아보세요</p>
            </div>
            <div class="text-6xl opacity-20">
              <i class="fas fa-building"></i>
            </div>
          </div>
        </div>

        {/* KPI 카드 */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">8</p>
                <p class="text-gray-600 text-sm">진행 중인 공고</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">156</p>
                <p class="text-gray-600 text-sm">총 지원자 수</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-calendar-check text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">23</p>
                <p class="text-gray-600 text-sm">면접 예정</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-user-check text-yellow-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">7</p>
                <p class="text-gray-600 text-sm">채용 완료</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 그리드 */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 채용 공고 관리 */}
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">채용 공고 관리</h2>
                <a href="/jobs/create" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  <i class="fas fa-plus mr-2"></i>새 공고 등록
                </a>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-code text-blue-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">풀스택 개발자 (React/Node.js)</h3>
                      <p class="text-gray-600 text-sm">지원자 45명 • 2024년 10월 8일 등록</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">모집 중</span>
                    <button class="text-gray-500 hover:text-blue-600">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-chart-line text-purple-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">데이터 분석가</h3>
                      <p class="text-gray-600 text-sm">지원자 28명 • 2024년 10월 5일 등록</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">서류 심사</span>
                    <button class="text-gray-500 hover:text-blue-600">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-mobile-alt text-green-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">모바일 앱 개발자 (Flutter)</h3>
                      <p class="text-gray-600 text-sm">지원자 32명 • 2024년 10월 3일 등록</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">면접 중</span>
                    <button class="text-gray-500 hover:text-blue-600">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <a href="/jobs/manage" class="text-blue-600 font-medium hover:underline">
                  모든 공고 관리하기 →
                </a>
              </div>
            </div>
          </div>
          
          {/* 빠른 액션 & 인재 추천 */}
          <div class="space-y-6">
            {/* 빠른 액션 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">빠른 액션</h2>
              <div class="space-y-3">
                <a href="/jobs/create" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-plus text-blue-600 mr-3"></i>
                  <span class="font-medium">새 공고 등록</span>
                </a>
                <a href="/jobseekers" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-users text-green-600 mr-3"></i>
                  <span class="font-medium">인재 검색</span>
                </a>
                <a href="/matching" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-magic text-purple-600 mr-3"></i>
                  <span class="font-medium">AI 인재 추천</span>
                </a>
              </div>
            </div>
            
            {/* 추천 인재 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">추천 인재</h2>
              <div class="space-y-3">
                <div class="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900">김민수</p>
                      <p class="text-gray-600 text-sm">React 개발자 • 3년 경력</p>
                      <p class="text-blue-600 text-xs">매칭률 95%</p>
                    </div>
                  </div>
                </div>
                
                <div class="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-green-600"></i>
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900">박지영</p>
                      <p class="text-gray-600 text-sm">데이터 분석가 • 2년 경력</p>
                      <p class="text-green-600 text-xs">매칭률 89%</p>
                    </div>
                  </div>
                </div>
                
                <div class="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-purple-600"></i>
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900">이준호</p>
                      <p class="text-gray-600 text-sm">Flutter 개발자 • 4년 경력</p>
                      <p class="text-purple-600 text-xs">매칭률 92%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <a href="/matching" class="text-blue-600 font-medium hover:underline text-sm">
                  더 많은 인재 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 기업 대시보드 JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 기업 대시보드 JavaScript ====================
        
        // 페이지 로드 시 데이터 불러오기
        document.addEventListener('DOMContentLoaded', async () => {
          await loadCompanyDashboard();
        });
        
        // 대시보드 데이터 로드
        async function loadCompanyDashboard() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              console.error('로그인 토큰이 없습니다.');
              return;
            }
            
            // 기업 정보 로드
            await loadCompanyInfo();
            
            // 구인공고 목록 로드
            await loadCompanyJobs();
            
            // 대시보드 통계 로드
            await loadDashboardStats();
            
          } catch (error) {
            console.error('대시보드 로드 오류:', error);
          }
        }
        
        // 기업 정보 로드
        async function loadCompanyInfo() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/profile/company', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              }
            });
            
            const result = await response.json();
            console.log('기업 정보:', result);
            
            // 기업 정보 표시 (필요시 구현)
            
          } catch (error) {
            console.error('기업 정보 로드 오류:', error);
          }
        }
        
        // 구인공고 목록 로드
        async function loadCompanyJobs() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            // 1. 현재 사용자 정보 가져오기
            const userResponse = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            const userData = await userResponse.json();
            
            if (!userData.success) {
              console.error('사용자 정보 조회 실패');
              return;
            }
            
            console.log('사용자 정보:', userData.user);
            
            // 2. 기업 프로필에서 company_id 가져오기
            if (!userData.profile || !userData.profile.id) {
              console.error('기업 프로필 정보가 없습니다');
              return;
            }
            
            const companyId = userData.profile.id;
            console.log('Company ID:', companyId);
            
            // 3. 기업의 구인공고 조회 (모든 상태 포함)
            const jobsResponse = await fetch(\`/api/jobs/company/\${companyId}?status=all\`, {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const jobsData = await jobsResponse.json();
            console.log('구인공고 응답:', jobsData);
            
            if (jobsData.success && jobsData.jobs) {
              displayCompanyJobs(jobsData.jobs);
            } else {
              // 공고가 없는 경우
              displayCompanyJobs([]);
            }
            
          } catch (error) {
            console.error('구인공고 목록 로드 오류:', error);
          }
        }
        
        // 구인공고 목록 표시
        function displayCompanyJobs(jobs) {
          const container = document.querySelector('.space-y-4');
          if (!container) return;
          
          if (jobs.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-briefcase text-4xl mb-2"></i>
                <p>등록된 구인공고가 없습니다</p>
                <p class="text-sm mt-2">새 공고를 등록해보세요!</p>
              </div>
            \`;
            return;
          }
          
          container.innerHTML = jobs.slice(0, 5).map(job => {
            const statusMap = {
              'active': { label: '모집 중', color: 'green' },
              'closed': { label: '마감', color: 'gray' },
              'draft': { label: '임시저장', color: 'yellow' }
            };
            
            const status = statusMap[job.status] || statusMap['active'];
            const createdDate = new Date(job.created_at).toLocaleDateString('ko-KR');
            
            return \`
              <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-center flex-1">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-briefcase text-blue-600"></i>
                  </div>
                  <div class="ml-4 flex-1">
                    <h3 class="font-medium text-gray-900">\${job.title}</h3>
                    <p class="text-gray-600 text-sm">\${job.location} • \${createdDate}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-3 py-1 bg-\${status.color}-100 text-\${status.color}-800 rounded-full text-sm whitespace-nowrap">
                    \${status.label}
                  </span>
                  <a href="/jobs/\${job.id}/edit" class="text-gray-500 hover:text-blue-600 p-2">
                    <i class="fas fa-edit"></i>
                  </a>
                  <button onclick="deleteJob(\${job.id})" class="text-gray-500 hover:text-red-600 p-2">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 대시보드 통계 로드
        async function loadDashboardStats() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            // 통계 API 호출 (추후 구현)
            
            // 임시: 구인공고 수 업데이트
            const userResponse = await fetch('/api/auth/profile', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const userData = await userResponse.json();
            
            if (userData.success) {
              const jobsResponse = await fetch(\`/api/jobs/company/\${userData.user.id}\`, {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              const jobsData = await jobsResponse.json();
              
              if (jobsData.success) {
                // 진행 중인 공고 수 업데이트
                const activeJobs = jobsData.jobs.filter(j => j.status === 'active');
                updateStatCard(0, activeJobs.length, '진행 중인 공고');
              }
            }
            
          } catch (error) {
            console.error('통계 로드 오류:', error);
          }
        }
        
        // 통계 카드 업데이트
        function updateStatCard(index, value, label) {
          const cards = document.querySelectorAll('.grid.grid-cols-1.md\\\\:grid-cols-4 .bg-white');
          if (cards[index]) {
            const valueElement = cards[index].querySelector('.text-2xl');
            if (valueElement) {
              valueElement.textContent = value;
            }
          }
        }
        
        // 구인공고 삭제
        async function deleteJob(jobId) {
          if (!confirm('정말로 이 공고를 삭제하시겠습니까?')) {
            return;
          }
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/jobs/\${jobId}\`, {
              method: 'DELETE',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              }
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('✅ 공고가 삭제되었습니다.');
              loadCompanyJobs(); // 목록 새로고침
            } else {
              alert('❌ ' + (result.message || '공고 삭제에 실패했습니다.'));
            }
          } catch (error) {
            console.error('공고 삭제 오류:', error);
            alert('❌ 공고 삭제 중 오류가 발생했습니다.');
          }
        }
        
        // ==================== 끝: 기업 대시보드 JavaScript ====================
      `}}>
      </script>
    </div>
  )
});

// 관리자 전용 대시보드 (관리자 대시보드로 리다이렉트)
app.get('/dashboard/admin', optionalAuth, requireAdmin, (c) => {
  return c.redirect('/admin');
});

// 관리자 대시보드 - 협약대학교 관리 포함
app.get('/admin', optionalAuth, requireAdmin, (c) => {
  const user = c.get('user');
  
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Simplified Header Navigation */}
      <header class="bg-white shadow-md sticky top-0 z-50 border-b-2 border-blue-100">
        <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3 group">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span class="text-white font-bold text-xl">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-blue-600 font-medium">Admin Dashboard</span>
              </div>
            </a>
          </div>
          
          {/* Simplified Navigation - Only Main Menu Items */}
          <div class="hidden lg:flex items-center space-x-4">
            <a href="/jobs" class="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">
              <i class="fas fa-briefcase mr-2"></i>구인정보
            </a>
            <a href="/jobseekers" class="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">
              <i class="fas fa-user-tie mr-2"></i>구직정보
            </a>
            <a href="/study" class="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">
              <i class="fas fa-graduation-cap mr-2"></i>유학정보
            </a>
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            {/* 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
      </header>

      <main class="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div class="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">관리자 대시보드</h1>
              <p class="text-blue-100">WOW-CAMPUS 플랫폼 시스템 관리</p>
            </div>
            <div class="hidden md:block">
              <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <i class="fas fa-shield-alt text-5xl text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards - Now Clickable! */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button onclick="toggleStatsDetail('jobs')" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 cursor-pointer hover:-translate-y-1 text-left w-full">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">전체 구인정보</p>
                <p class="text-3xl font-bold text-gray-900" id="totalJobs">-</p>
                <p class="text-xs text-blue-600 mt-2">
                  <i class="fas fa-arrow-up mr-1"></i>활성 공고
                </p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i class="fas fa-briefcase text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-3 text-xs text-blue-500 flex items-center justify-center">
              <i class="fas fa-chevron-down mr-1"></i>
              <span>클릭하여 상세보기</span>
            </div>
          </button>
          
          <button onclick="toggleStatsDetail('jobseekers')" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-green-500 cursor-pointer hover:-translate-y-1 text-left w-full">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">전체 구직자</p>
                <p class="text-3xl font-bold text-gray-900" id="totalJobseekers">-</p>
                <p class="text-xs text-green-600 mt-2">
                  <i class="fas fa-user-check mr-1"></i>등록 회원
                </p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i class="fas fa-users text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-3 text-xs text-green-500 flex items-center justify-center">
              <i class="fas fa-chevron-down mr-1"></i>
              <span>클릭하여 상세보기</span>
            </div>
          </button>
          
          <button onclick="toggleStatsDetail('universities')" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-purple-500 cursor-pointer hover:-translate-y-1 text-left w-full">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">협약 대학교</p>
                <p class="text-3xl font-bold text-gray-900" id="totalUniversities">-</p>
                <p class="text-xs text-purple-600 mt-2">
                  <i class="fas fa-handshake mr-1"></i>파트너십
                </p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i class="fas fa-university text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-3 text-xs text-purple-500 flex items-center justify-center">
              <i class="fas fa-chevron-down mr-1"></i>
              <span>클릭하여 상세보기</span>
            </div>
          </button>
          
          <button onclick="toggleStatsDetail('matches')" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-yellow-500 cursor-pointer hover:-translate-y-1 text-left w-full">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">매칭 성사</p>
                <p class="text-3xl font-bold text-gray-900" id="totalMatches">-</p>
                <p class="text-xs text-yellow-600 mt-2">
                  <i class="fas fa-star mr-1"></i>성공 케이스
                </p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i class="fas fa-handshake text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-3 text-xs text-yellow-500 flex items-center justify-center">
              <i class="fas fa-chevron-down mr-1"></i>
              <span>클릭하여 상세보기</span>
            </div>
          </button>
        </div>

        {/* Stats Detail Sections */}
        <div id="statsDetailContainer" class="mb-8">
          {/* 구인정보 상세 */}
          <div id="jobsDetail" class="hidden bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-blue-500 mb-6 transition-all duration-300">
            <div class="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-blue-100 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                <i class="fas fa-briefcase text-blue-600 mr-2"></i>
                구인정보 상세
              </h3>
              <button onclick="toggleStatsDetail('jobs')" class="text-gray-500 hover:text-gray-700 transition-colors">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">활성 공고</p>
                  <p class="text-2xl font-bold text-blue-600" id="activeJobsCount">-</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">승인 대기</p>
                  <p class="text-2xl font-bold text-green-600" id="pendingJobsCount">-</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">마감 공고</p>
                  <p class="text-2xl font-bold text-gray-600" id="closedJobsCount">-</p>
                </div>
              </div>
              <div id="recentJobsList" class="space-y-3">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>최근 공고를 불러오는 중...</p>
                </div>
              </div>
              <div class="mt-6 text-center">
                <a href="/jobs" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <span>전체 구인정보 보기</span>
                  <i class="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </div>

          {/* 구직자 상세 */}
          <div id="jobseekersDetail" class="hidden bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-green-500 mb-6 transition-all duration-300">
            <div class="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-green-100 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                <i class="fas fa-users text-green-600 mr-2"></i>
                구직자 상세
              </h3>
              <button onclick="toggleStatsDetail('jobseekers')" class="text-gray-500 hover:text-gray-700 transition-colors">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-4 gap-4 mb-6">
                <div class="bg-green-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">활성 회원</p>
                  <p class="text-2xl font-bold text-green-600" id="activeJobseekersCount">-</p>
                </div>
                <div class="bg-yellow-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">승인 대기</p>
                  <p class="text-2xl font-bold text-yellow-600" id="pendingJobseekersCount">-</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">중국</p>
                  <p class="text-2xl font-bold text-blue-600" id="chinaJobseekersCount">-</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">기타 국가</p>
                  <p class="text-2xl font-bold text-purple-600" id="otherJobseekersCount">-</p>
                </div>
              </div>
              <div id="recentJobseekersList" class="space-y-3">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>최근 구직자를 불러오는 중...</p>
                </div>
              </div>
              <div class="mt-6 text-center">
                <a href="/jobseekers" class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  <span>전체 구직자 보기</span>
                  <i class="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </div>

          {/* 협약대학교 상세 */}
          <div id="universitiesDetail" class="hidden bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-purple-500 mb-6 transition-all duration-300">
            <div class="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-purple-100 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                <i class="fas fa-university text-purple-600 mr-2"></i>
                협약 대학교 상세
              </h3>
              <button onclick="toggleStatsDetail('universities')" class="text-gray-500 hover:text-gray-700 transition-colors">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div class="bg-purple-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">서울 지역</p>
                  <p class="text-2xl font-bold text-purple-600" id="seoulUnivCount">-</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">수도권</p>
                  <p class="text-2xl font-bold text-blue-600" id="metropolitanUnivCount">-</p>
                </div>
                <div class="bg-indigo-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">지방</p>
                  <p class="text-2xl font-bold text-indigo-600" id="regionalUnivCount">-</p>
                </div>
              </div>
              <div id="universitiesList" class="space-y-3">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>협약 대학교를 불러오는 중...</p>
                </div>
              </div>
              <div class="mt-6 text-center">
                <button onclick="showPartnerUniversityManagement()" class="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  <span>대학교 관리하기</span>
                  <i class="fas fa-cog ml-2"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 매칭 성사 상세 */}
          <div id="matchesDetail" class="hidden bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-yellow-500 mb-6 transition-all duration-300">
            <div class="bg-gradient-to-r from-yellow-50 to-white px-6 py-4 border-b border-yellow-100 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                <i class="fas fa-handshake text-yellow-600 mr-2"></i>
                매칭 성사 상세
              </h3>
              <button onclick="toggleStatsDetail('matches')" class="text-gray-500 hover:text-gray-700 transition-colors">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-4 gap-4 mb-6">
                <div class="bg-yellow-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">이번 달</p>
                  <p class="text-2xl font-bold text-yellow-600" id="thisMonthMatches">-</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">진행 중</p>
                  <p class="text-2xl font-bold text-green-600" id="inProgressMatches">-</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">완료</p>
                  <p class="text-2xl font-bold text-blue-600" id="completedMatches">-</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">성공률</p>
                  <p class="text-2xl font-bold text-purple-600" id="successRate">-%</p>
                </div>
              </div>
              <div id="recentMatchesList" class="space-y-3">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>최근 매칭을 불러오는 중...</p>
                </div>
              </div>
              <div class="mt-6 text-center">
                <a href="/statistics" class="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                  <span>상세 통계 보기</span>
                  <i class="fas fa-chart-line ml-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Management Cards */}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            <i class="fas fa-cogs text-blue-600 mr-2"></i>주요 관리 기능
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Statistics Dashboard */}
            <a href="/statistics" class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300 hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <i class="fas fa-chart-line text-white text-2xl"></i>
                  </div>
                  <span class="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-arrow-right text-xl"></i>
                  </span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">통계 대시보드</h3>
                <p class="text-gray-600 text-sm mb-4">실시간 플랫폼 통계 및 데이터 분석을 확인하세요</p>
                <div class="flex items-center text-sm text-blue-600 font-medium">
                  <span>자세히 보기</span>
                  <i class="fas fa-chevron-right ml-2 group-hover:ml-3 transition-all"></i>
                </div>
              </div>
            </a>

            {/* Card 2: User Management */}
            <button onclick="showUserManagement()" class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left overflow-hidden border border-gray-100 hover:border-yellow-300 hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <i class="fas fa-user-check text-white text-2xl"></i>
                  </div>
                  <div class="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full" id="pendingBadge">
                    0
                  </div>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">사용자 승인</h3>
                <p class="text-gray-600 text-sm mb-4">회원 가입 승인 및 사용자 관리</p>
                <div class="flex items-center text-sm text-yellow-600 font-medium">
                  <span>관리하기</span>
                  <i class="fas fa-chevron-right ml-2 group-hover:ml-3 transition-all"></i>
                </div>
              </div>
            </button>

            {/* Card 3: University Management */}
            <button onclick="showPartnerUniversityManagement()" class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left overflow-hidden border border-gray-100 hover:border-green-300 hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <i class="fas fa-university text-white text-2xl"></i>
                  </div>
                  <span class="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-arrow-right text-xl"></i>
                  </span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">협약대학교 관리</h3>
                <p class="text-gray-600 text-sm mb-4">대학교 정보 추가, 수정 및 삭제</p>
                <div class="flex items-center text-sm text-green-600 font-medium">
                  <span>관리하기</span>
                  <i class="fas fa-chevron-right ml-2 group-hover:ml-3 transition-all"></i>
                </div>
              </div>
            </button>

            {/* Card 4: Job Management */}
            <a href="/jobs" class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-300 hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <i class="fas fa-briefcase text-white text-2xl"></i>
                  </div>
                  <span class="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-arrow-right text-xl"></i>
                  </span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">구인정보 관리</h3>
                <p class="text-gray-600 text-sm mb-4">채용공고 승인 및 관리</p>
                <div class="flex items-center text-sm text-purple-600 font-medium">
                  <span>자세히 보기</span>
                  <i class="fas fa-chevron-right ml-2 group-hover:ml-3 transition-all"></i>
                </div>
              </div>
            </a>

            {/* Card 5: Agent Management */}
            <button onclick="showAgentManagement()" class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left overflow-hidden border border-gray-100 hover:border-indigo-300 hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <i class="fas fa-handshake text-white text-2xl"></i>
                  </div>
                  <span class="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-arrow-right text-xl"></i>
                  </span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">에이전트 관리</h3>
                <p class="text-gray-600 text-sm mb-4">에이전트 승인 및 실적 관리</p>
                <div class="flex items-center text-sm text-indigo-600 font-medium">
                  <span>관리하기</span>
                  <i class="fas fa-chevron-right ml-2 group-hover:ml-3 transition-all"></i>
                </div>
              </div>
            </button>

            {/* Card 6: Support & Contact */}
            <a href="/support" class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-pink-300 hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <i class="fas fa-headset text-white text-2xl"></i>
                  </div>
                  <span class="text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-arrow-right text-xl"></i>
                  </span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">고객 지원</h3>
                <p class="text-gray-600 text-sm mb-4">문의사항 확인 및 고객 응대</p>
                <div class="flex items-center text-sm text-pink-600 font-medium">
                  <span>자세히 보기</span>
                  <i class="fas fa-chevron-right ml-2 group-hover:ml-3 transition-all"></i>
                </div>
              </div>
            </a>
          </div>
        </div>
        
        {/* 사용자 승인 관리 섹션 */}
        <div id="userManagementSection" class="hidden mb-8">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">
                <i class="fas fa-users text-yellow-600 mr-2"></i>
                사용자 관리
              </h2>
              <button onclick="hideUserManagement()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <i class="fas fa-times mr-2"></i>닫기
              </button>
            </div>
            
            {/* 탭 메뉴 */}
            <div class="border-b border-gray-200">
              <div class="flex space-x-4 px-6">
                <button id="pendingTab" onclick="switchUserTab('pending')" class="px-4 py-3 text-sm font-medium text-yellow-600 border-b-2 border-yellow-600">
                  <i class="fas fa-clock mr-2"></i>승인 대기 <span id="pendingTabCount" class="ml-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">0</span>
                </button>
                <button id="allUsersTab" onclick="switchUserTab('all')" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  <i class="fas fa-users mr-2"></i>전체 사용자
                </button>
                <button id="jobseekersTab" onclick="switchUserTab('jobseekers')" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  <i class="fas fa-user-tie mr-2"></i>구직자
                </button>
                <button id="employersTab" onclick="switchUserTab('employers')" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  <i class="fas fa-building mr-2"></i>구인자
                </button>
                <button id="agentsTab" onclick="switchUserTab('agents')" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  <i class="fas fa-handshake mr-2"></i>에이전트
                </button>
              </div>
            </div>
            
            <div class="p-6">
              {/* 승인 대기 섹션 */}
              <div id="pendingUsersContent" class="space-y-4">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                  <p>로딩 중...</p>
                </div>
              </div>
              
              {/* 전체 사용자 섹션 */}
              <div id="allUsersContent" class="hidden">
                {/* 검색 및 필터 */}
                <div class="mb-6">
                  <div class="grid md:grid-cols-4 gap-4">
                    <input type="text" id="searchUsers" placeholder="이름, 이메일 검색..." 
                           class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select id="userStatusFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">전체 상태</option>
                      <option value="approved">승인됨</option>
                      <option value="pending">대기중</option>
                      <option value="rejected">거절됨</option>
                      <option value="suspended">정지됨</option>
                    </select>
                    <select id="userTypeFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">전체 유형</option>
                      <option value="jobseeker">구직자</option>
                      <option value="employer">구인자</option>
                      <option value="agent">에이전트</option>
                    </select>
                    <button onclick="loadAllUsers()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-search mr-2"></i>검색
                    </button>
                  </div>
                </div>
                
                {/* 사용자 목록 테이블 */}
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody id="allUsersTableBody" class="bg-white divide-y divide-gray-200">
                      {/* 동적으로 로드됩니다 */}
                    </tbody>
                  </table>
                </div>
                
                {/* 페이지네이션 */}
                <div id="usersPagination" class="mt-6 flex items-center justify-between">
                  <div class="text-sm text-gray-700">
                    총 <span id="totalUsersCount">0</span>명의 사용자
                  </div>
                  <div id="paginationButtons" class="flex space-x-2">
                    {/* 동적으로 생성됩니다 */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 사용자 수정 모달 */}
        <div id="editUserModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 class="text-xl font-bold text-gray-900">
                <i class="fas fa-user-edit text-blue-600 mr-2"></i>사용자 정보 수정
              </h3>
              <button onclick="closeEditUserModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="p-6">
              <form id="editUserForm" class="space-y-6">
                <input type="hidden" id="editUserId" />
                
                {/* 기본 정보 */}
                <div class="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h4 class="font-semibold text-gray-900 mb-3">기본 정보</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <input type="email" id="editUserEmail" disabled 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                    <p class="mt-1 text-xs text-gray-500">이메일은 수정할 수 없습니다</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                    <input type="text" id="editUserName" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                    <input type="tel" id="editUserPhone" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           placeholder="010-1234-5678" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
                    <input type="text" id="editUserType" disabled 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                    <p class="mt-1 text-xs text-gray-500">사용자 유형은 수정할 수 없습니다</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">계정 상태 *</label>
                    <select id="editUserStatus" required 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="approved">승인됨</option>
                      <option value="pending">대기중</option>
                      <option value="rejected">거절됨</option>
                      <option value="suspended">정지됨</option>
                    </select>
                  </div>
                </div>
                
                {/* 비밀번호 관리 */}
                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-3">
                  <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
                    <i class="fas fa-key text-yellow-600 mr-2"></i>비밀번호 관리
                  </h4>
                  <p class="text-sm text-gray-600 mb-3">
                    사용자가 비밀번호를 잊은 경우 임시 비밀번호를 생성할 수 있습니다.
                  </p>
                  <button type="button" onclick="generateTempPassword()" 
                          class="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                    <i class="fas fa-sync-alt mr-2"></i>임시 비밀번호 생성
                  </button>
                  <div id="tempPasswordDisplay" class="hidden mt-3 p-4 bg-white border-2 border-yellow-400 rounded-lg">
                    <p class="text-sm font-medium text-gray-700 mb-2">생성된 임시 비밀번호:</p>
                    <div class="flex items-center space-x-2">
                      <input type="text" id="tempPasswordValue" readonly 
                             class="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg font-bold text-center" />
                      <button type="button" onclick="copyTempPassword()" 
                              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                    <p class="text-xs text-red-600 mt-2">
                      <i class="fas fa-exclamation-triangle mr-1"></i>
                      이 비밀번호를 반드시 사용자에게 안전하게 전달하세요. 다시 확인할 수 없습니다.
                    </p>
                  </div>
                </div>
                
                {/* 버튼 */}
                <div class="flex space-x-3 pt-4 border-t border-gray-200">
                  <button type="submit" class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                  <button type="button" onclick="closeEditUserModal()" 
                          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 협약대학교 관리 섹션 */}
        <div id="partnerUniversityManagement" class="hidden mb-8">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">협약대학교 관리</h2>
              <div class="flex space-x-3">
                <button onclick="showAddUniversityForm()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-plus mr-2"></i>새 대학교 추가
                </button>
                <button onclick="hidePartnerUniversityManagement()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  닫기
                </button>
              </div>
            </div>
            
            <div class="p-6">
              {/* 검색 및 필터 */}
              <div class="mb-6">
                <div class="grid md:grid-cols-4 gap-4">
                  <input type="text" id="searchUniversity" placeholder="대학교명 검색..." 
                         class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select id="adminRegionFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">전체 지역</option>
                    <option value="서울특별시">서울특별시</option>
                    <option value="부산광역시">부산광역시</option>
                    <option value="대구광역시">대구광역시</option>
                    <option value="인천광역시">인천광역시</option>
                    <option value="광주광역시">광주광역시</option>
                    <option value="대전광역시">대전광역시</option>
                    <option value="울산광역시">울산광역시</option>
                    <option value="세종특별자치시">세종특별자치시</option>
                    <option value="경기도">경기도</option>
                    <option value="강원특별자치도">강원특별자치도</option>
                    <option value="충청북도">충청북도</option>
                    <option value="충청남도">충청남도</option>
                    <option value="전북특별자치도">전북특별자치도</option>
                    <option value="전라남도">전라남도</option>
                    <option value="경상북도">경상북도</option>
                    <option value="경상남도">경상남도</option>
                    <option value="제주특별자치도">제주특별자치도</option>
                  </select>
                  <button onclick="loadUniversitiesForAdmin()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-search mr-2"></i>검색
                  </button>
                  <button onclick="exportUniversitiesData()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <i class="fas fa-download mr-2"></i>내보내기
                  </button>
                </div>
              </div>

              {/* 대학교 목록 테이블 */}
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교명</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">모집과정</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주요정보</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">서비스</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                    </tr>
                  </thead>
                  <tbody id="universitiesTableBody" class="bg-white divide-y divide-gray-200">
                    {/* 동적으로 로드됩니다 */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 에이전트 관리 섹션 */}
        <div id="agentManagement" class="hidden mb-8">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">에이전트 관리</h2>
              <div class="flex space-x-3">
                <button onclick="showAddAgentForm()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <i class="fas fa-plus mr-2"></i>새 에이전트 추가
                </button>
                <button onclick="hideAgentManagement()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  닫기
                </button>
              </div>
            </div>
            
            <div class="p-6">
              {/* 검색 및 필터 */}
              <div class="mb-6">
                <div class="grid md:grid-cols-4 gap-4">
                  <input type="text" id="searchAgent" placeholder="에이전시명 또는 담당자명 검색..." 
                         class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <select id="agentSpecializationFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="all">전체 전문분야</option>
                    <option value="유학">유학</option>
                    <option value="취업">취업</option>
                    <option value="비자">비자</option>
                    <option value="정착지원">정착지원</option>
                  </select>
                  <select id="agentStatusFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="all">전체 상태</option>
                    <option value="approved">승인</option>
                    <option value="pending">대기</option>
                    <option value="suspended">정지</option>
                  </select>
                  <button onclick="loadAgentsForAdmin()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <i class="fas fa-search mr-2"></i>검색
                  </button>
                </div>
              </div>

              {/* 에이전트 목록 테이블 */}
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">에이전시명</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전문분야</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실적정보</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가지표</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                    </tr>
                  </thead>
                  <tbody id="agentsTableBody" class="bg-white divide-y divide-gray-200">
                    {/* 동적으로 로드됩니다 */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 통계 요약 */}
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">전체 구인정보</p>
                <p class="text-2xl font-semibold text-gray-900" id="totalJobs">-</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600"></i>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">전체 구직자</p>
                <p class="text-2xl font-semibold text-gray-900" id="totalJobseekers">-</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-green-600"></i>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">협약 대학교</p>
                <p class="text-2xl font-semibold text-gray-900" id="totalUniversities">-</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-university text-purple-600"></i>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">매칭 성사</p>
                <p class="text-2xl font-semibold text-gray-900" id="totalMatches">-</p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-handshake text-yellow-600"></i>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <script dangerouslySetInnerHTML={{__html: `
        // 관리자 대시보드 초기화
        document.addEventListener('DOMContentLoaded', function() {
          console.log('관리자 대시보드 로드됨');
          
          // 통계 로드
          if (typeof loadAdminStatistics === 'function') {
            loadAdminStatistics();
          }
          
          // 인증 확인 및 UI 업데이트
          if (typeof checkAuthAndUpdateUI === 'function') {
            checkAuthAndUpdateUI();
          }
        });
        
        // 사용자 관리 섹션 표시/숨김
        function showUserManagement() {
          const section = document.getElementById('userManagementSection');
          const universitySection = document.getElementById('partnerUniversityManagement');
          
          if (section) {
            section.classList.remove('hidden');
            if (typeof loadPendingUsers === 'function') {
              loadPendingUsers();
            }
          }
          if (universitySection) {
            universitySection.classList.add('hidden');
          }
        }
        
        function hideUserManagement() {
          const section = document.getElementById('userManagementSection');
          if (section) {
            section.classList.add('hidden');
          }
        }
        
        // 협약대학교 관리 섹션 표시/숨김
        function showPartnerUniversityManagement() {
          const section = document.getElementById('partnerUniversityManagement');
          const userSection = document.getElementById('userManagementSection');
          
          if (section) {
            section.classList.remove('hidden');
          }
          if (userSection) {
            userSection.classList.add('hidden');
          }
        }
        
        function hidePartnerUniversityManagement() {
          const section = document.getElementById('partnerUniversityManagement');
          if (section) {
            section.classList.add('hidden');
          }
        }
        
        // 통계 상세 토글 함수
        let currentOpenDetail = null;
        
        function toggleStatsDetail(type) {
          const detailSections = {
            'jobs': document.getElementById('jobsDetail'),
            'jobseekers': document.getElementById('jobseekersDetail'),
            'universities': document.getElementById('universitiesDetail'),
            'matches': document.getElementById('matchesDetail')
          };
          
          const targetSection = detailSections[type];
          
          // 같은 섹션 클릭 시 닫기
          if (currentOpenDetail === type) {
            targetSection.classList.add('hidden');
            currentOpenDetail = null;
            return;
          }
          
          // 모든 섹션 숨기기
          Object.values(detailSections).forEach(section => {
            if (section) section.classList.add('hidden');
          });
          
          // 선택한 섹션 표시
          if (targetSection) {
            targetSection.classList.remove('hidden');
            currentOpenDetail = type;
            
            // 부드러운 스크롤
            setTimeout(() => {
              targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
            
            // 데이터 로드
            loadStatsDetailData(type);
          }
        }
        
        // 통계 상세 데이터 로드
        async function loadStatsDetailData(type) {
          const token = localStorage.getItem('wowcampus_token');
          
          try {
            switch(type) {
              case 'jobs':
                await loadJobsDetail(token);
                break;
              case 'jobseekers':
                await loadJobseekersDetail(token);
                break;
              case 'universities':
                await loadUniversitiesDetail(token);
                break;
              case 'matches':
                await loadMatchesDetail(token);
                break;
            }
          } catch (error) {
            console.error('Failed to load detail data:', error);
          }
        }
        
        // 구인정보 상세 로드
        async function loadJobsDetail(token) {
          try {
            const response = await fetch('/api/admin/jobs/stats', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // 통계 업데이트
              document.getElementById('activeJobsCount').textContent = data.active || 0;
              document.getElementById('pendingJobsCount').textContent = data.pending || 0;
              document.getElementById('closedJobsCount').textContent = data.closed || 0;
              
              // 최근 공고 목록
              const listContainer = document.getElementById('recentJobsList');
              if (data.recentJobs && data.recentJobs.length > 0) {
                listContainer.innerHTML = data.recentJobs.slice(0, 5).map(job => \`
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">\${job.title}</h4>
                      <p class="text-sm text-gray-600 mt-1">\${job.company} • \${job.location}</p>
                      <p class="text-xs text-gray-500 mt-1">\${new Date(job.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium \${
                      job.status === 'active' ? 'bg-green-100 text-green-700' :
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }">\${job.status === 'active' ? '활성' : job.status === 'pending' ? '대기' : '마감'}</span>
                  </div>
                \`).join('');
              } else {
                listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 구인정보가 없습니다.</p>';
              }
            }
          } catch (error) {
            console.error('Failed to load jobs detail:', error);
            document.getElementById('recentJobsList').innerHTML = 
              '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
          }
        }
        
        // 구직자 상세 로드
        async function loadJobseekersDetail(token) {
          try {
            const response = await fetch('/api/admin/jobseekers/stats', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // 통계 업데이트
              document.getElementById('activeJobseekersCount').textContent = data.active || 0;
              document.getElementById('pendingJobseekersCount').textContent = data.pending || 0;
              document.getElementById('chinaJobseekersCount').textContent = data.china || 0;
              document.getElementById('otherJobseekersCount').textContent = data.other || 0;
              
              // 최근 구직자 목록
              const listContainer = document.getElementById('recentJobseekersList');
              if (data.recentJobseekers && data.recentJobseekers.length > 0) {
                listContainer.innerHTML = data.recentJobseekers.slice(0, 5).map(js => \`
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">\${js.name}</h4>
                      <p class="text-sm text-gray-600 mt-1">\${js.nationality} • \${js.education || '정보없음'}</p>
                      <p class="text-xs text-gray-500 mt-1">\${new Date(js.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium \${
                      js.status === 'approved' ? 'bg-green-100 text-green-700' :
                      js.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }">\${js.status === 'approved' ? '승인' : js.status === 'pending' ? '대기' : '거부'}</span>
                  </div>
                \`).join('');
              } else {
                listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 구직자가 없습니다.</p>';
              }
            }
          } catch (error) {
            console.error('Failed to load jobseekers detail:', error);
            document.getElementById('recentJobseekersList').innerHTML = 
              '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
          }
        }
        
        // 협약대학교 상세 로드
        async function loadUniversitiesDetail(token) {
          try {
            const response = await fetch('/api/admin/universities/stats', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // 지역별 통계 처리
              const regionCounts = {
                seoul: 0,
                metropolitan: 0,
                regional: 0
              };
              
              if (data.regionalStats) {
                data.regionalStats.forEach(stat => {
                  if (stat.region === '서울') {
                    regionCounts.seoul = stat.count;
                  } else if (['인천', '경기'].includes(stat.region)) {
                    regionCounts.metropolitan += stat.count;
                  } else {
                    regionCounts.regional += stat.count;
                  }
                });
              }
              
              // 통계 업데이트
              document.getElementById('seoulUnivCount').textContent = regionCounts.seoul;
              document.getElementById('metropolitanUnivCount').textContent = regionCounts.metropolitan;
              document.getElementById('regionalUnivCount').textContent = regionCounts.regional;
              
              // 대학교 목록
              const listContainer = document.getElementById('universitiesList');
              if (data.recentUniversities && data.recentUniversities.length > 0) {
                listContainer.innerHTML = data.recentUniversities.map(univ => {
                  const partnershipLabel = univ.partnership_type === 'mou' ? 'MOU' : 
                                          univ.partnership_type === 'partnership' ? '파트너십' : '협약';
                  
                  return \`
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">\${univ.name}</h4>
                        <p class="text-sm text-gray-600 mt-1">\${univ.region} • \${univ.english_name || ''}</p>
                        \${univ.student_count ? \`<p class="text-xs text-gray-500 mt-1">재학생: \${univ.student_count.toLocaleString()}명 \${univ.foreign_student_count ? \`(외국인: \${univ.foreign_student_count.toLocaleString()})\` : ''}</p>\` : ''}
                      </div>
                      <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">\${partnershipLabel}</span>
                    </div>
                  \`;
                }).join('');
              } else {
                listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 협약대학교가 없습니다.</p>';
              }
            }
          } catch (error) {
            console.error('Failed to load universities detail:', error);
            document.getElementById('universitiesList').innerHTML = 
              '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
          }
        }
        
        // 매칭 상세 로드
        async function loadMatchesDetail(token) {
          try {
            const response = await fetch('/api/admin/matches/stats', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // 통계 업데이트
              document.getElementById('thisMonthMatches').textContent = data.thisMonth || 0;
              document.getElementById('inProgressMatches').textContent = data.inProgress || 0;
              document.getElementById('completedMatches').textContent = data.completed || 0;
              document.getElementById('successRate').textContent = data.successRate ? data.successRate.toFixed(1) + '%' : '0%';
              
              // 최근 매칭 목록
              const listContainer = document.getElementById('recentMatchesList');
              if (data.recentMatches && data.recentMatches.length > 0) {
                listContainer.innerHTML = data.recentMatches.map(match => \`
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">\${match.job_title || '직무 정보 없음'}</h4>
                      <p class="text-sm text-gray-600 mt-1">\${match.jobseeker_name || '구직자'} • 매칭점수: \${match.match_score || 0}점</p>
                      <p class="text-xs text-gray-500 mt-1">\${new Date(match.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium \${
                      match.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                      match.status === 'interested' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }">\${
                      match.status === 'applied' ? '지원완료' :
                      match.status === 'interested' ? '관심' : 
                      match.status === 'viewed' ? '확인' : '제안'
                    }</span>
                  </div>
                \`).join('');
              } else {
                listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">매칭 내역이 없습니다.</p>';
              }
            }
          } catch (error) {
            console.error('Failed to load matches detail:', error);
            document.getElementById('recentMatchesList').innerHTML = 
              '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
          }
        }
        
        // 전역 함수로 노출
        window.toggleStatsDetail = toggleStatsDetail;
        window.showUserManagement = showUserManagement;
        window.hideUserManagement = hideUserManagement;
        window.showPartnerUniversityManagement = showPartnerUniversityManagement;
        window.hidePartnerUniversityManagement = hidePartnerUniversityManagement;
        
        // 유학정보 페이지 함수들
        window.showUniversityModal = showUniversityModal;
        window.closeUniversityModal = closeUniversityModal;
        window.filterUniversities = filterUniversities;
        window.resetFilters = resetFilters;
        
        // 관리자 대학교 관리 함수들
        window.editUniversity = editUniversity;
        window.deleteUniversity = deleteUniversity;
        window.showAddUniversityForm = showAddUniversityForm;
        window.closeUniversityForm = closeUniversityForm;
        window.saveUniversity = saveUniversity;
        window.loadUniversitiesForAdmin = loadUniversitiesForAdmin;
        window.exportUniversitiesData = exportUniversitiesData;
        
        // 에이전트 관리 함수들
        window.showAgentManagement = showAgentManagement;
        window.hideAgentManagement = hideAgentManagement;
        window.loadAgentsForAdmin = loadAgentsForAdmin;
        window.displayAgentsTable = displayAgentsTable;
        window.showAgentModal = showAgentModal;
        window.closeAgentModal = closeAgentModal;
        window.deleteAgent = deleteAgent;
        window.showAddAgentForm = showAddAgentForm;
        window.editAgent = editAgent;
      `}}>
      </script>
    </div>
  )
})


export default app
