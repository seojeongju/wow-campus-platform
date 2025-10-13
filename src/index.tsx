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
import { optionalAuth, requireAdmin } from './middleware/auth'
import { checkPageAccess, requireAdminPage } from './middleware/permissions'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

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
          jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-user-tie', name: '구직자 대시보드' },
          company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building', name: '기업 대시보드' },
          agent: { link: '/agents', color: 'blue', icon: 'fa-handshake', name: '에이전트 대시보드' },
          admin: { link: '/dashboard/admin', color: 'red', icon: 'fa-chart-line', name: '관리자 대시보드' }
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
          <a href="\${config.link}" class="px-4 py-2 text-\${config.color}-600 border border-\${config.color}-600 rounded-lg hover:bg-\${config.color}-50 transition-colors font-medium" title="\${config.name}">
            <i class="fas \${config.icon} mr-1"></i>대시보드
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
        { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보', icon: 'fas fa-graduation-cap' },
        { href: '/matching', label: 'AI 매칭', icon: 'fas fa-magic' },
        { href: '/dashboard/jobseeker', label: '내 대시보드', icon: 'fas fa-tachometer-alt' }
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
    
    // 구직자 상세 보기 함수 (기본 구현)
    function showJobSeekerDetail(id) {
      console.log(\`구직자 상세보기: \${id}\`);
      alert(\`구직자 ID \${id}의 상세 정보를 표시합니다. (구현 예정)\`);
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
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">거주지역</label>
                <select name="location" required 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
      console.log('프로필 저장 중...');
      
      const user = getCurrentUser();
      if (!user) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      const token = localStorage.getItem('wowcampus_token');
      
      const form = document.getElementById('profile-form');
      const formData = new FormData(form);
      const profileData = {};
      
      // 폼 데이터를 객체로 변환
      for (let [key, value] of formData.entries()) {
        profileData[key] = value;
      }
      
      try {
        const response = await fetch('/api/profile/jobseeker', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileData)
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
          button.innerHTML = '<i class="fas fa-edit mr-2"></i>편집';
          button.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors';
          
          // 프로필 완성도 업데이트
          updateProfileCompletion(profileData);
          
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
          allUniversities = result.data;
          displayUniversities(result.data);
          console.log('협약대학교', result.data.length, '개 로드 완료');
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
                <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-university text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">\${uni.name}</h3>
                  <p class="text-sm text-gray-600">\${uni.englishName}</p>
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
                \${uni.degrees.map(degree => \`
                  <span class="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">\${degree}</span>
                \`).join('')}
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
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-university text-blue-600 text-lg"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">\${uni.name}</h2>
                <p class="text-sm text-gray-600">\${uni.englishName}</p>
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
                <h3 class="text-lg font-semibold mb-3">학비 및 지원</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">학비</span>
                    <span class="font-medium">\${uni.tuitionFee}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">기숙사</span>
                    <span class="font-medium">\${uni.dormitory ? '제공' : '미제공'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">협력 형태</span>
                    <span class="font-medium">\${uni.partnershipType}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">대학 소개</h3>
              <p class="text-gray-600 leading-relaxed">\${uni.description}</p>
            </div>

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

            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">개설 전공</h3>
                <div class="flex flex-wrap gap-2">
                  \${uni.majors.map(major => \`
                    <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">\${major}</span>
                  \`).join('')}
                </div>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold mb-3">학위 과정</h3>
                <div class="flex flex-wrap gap-2">
                  \${uni.degrees.map(degree => \`
                    <span class="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">\${degree}</span>
                  \`).join('')}
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">장학금 정보</h3>
              <div class="grid md:grid-cols-3 gap-3">
                \${uni.scholarships.map(scholarship => \`
                  <div class="p-3 bg-yellow-50 rounded-lg text-center">
                    <span class="text-yellow-700 font-medium">\${scholarship}</span>
                  </div>
                \`).join('')}
              </div>
            </div>

            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-3">연락처</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="flex items-center space-x-3">
                  <i class="fas fa-envelope text-gray-400"></i>
                  <span>\${uni.contactEmail}</span>
                </div>
                <div class="flex items-center space-x-3">
                  <i class="fas fa-phone text-gray-400"></i>
                  <span>\${uni.contactPhone}</span>
                </div>
              </div>
            </div>

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
          let universities = result.data;
          
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

      tbody.innerHTML = universities.map(uni => \`
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <img src="\${uni.logo}" alt="\${uni.name}" class="w-10 h-10 rounded-lg object-cover mr-3">
              <div>
                <div class="text-sm font-medium text-gray-900">\${uni.name}</div>
                <div class="text-sm text-gray-500">\${uni.englishName}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\${uni.region}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\${uni.ranking}위</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <div>\${uni.studentCount.toLocaleString()}명</div>
            <div class="text-xs text-gray-500">외국인 \${uni.foreignStudentCount.toLocaleString()}명</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\${uni.partnershipType}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button onclick="editUniversity(\${uni.id})" class="text-blue-600 hover:text-blue-900">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteUniversity(\${uni.id})" class="text-red-600 hover:text-red-900">
                <i class="fas fa-trash"></i>
              </button>
              <a href="\${uni.website}" target="_blank" class="text-gray-600 hover:text-gray-900">
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          </td>
        </tr>
      \`).join('');
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
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">대학교명 *</label>
                  <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">영문명 *</label>
                  <input type="text" name="englishName" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">지역 *</label>
                  <select name="region" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">선택하세요</option>
                    <option value="서울">서울</option>
                    <option value="경기">경기</option>
                    <option value="대전">대전</option>
                    <option value="부산">부산</option>
                    <option value="대구">대구</option>
                    <option value="광주">광주</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">홈페이지 URL *</label>
                  <input type="url" name="website" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">로고 URL</label>
                  <input type="url" name="logo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">국내 순위</label>
                  <input type="number" name="ranking" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">설립년도</label>
                  <input type="number" name="establishedYear" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">총 재학생 수</label>
                  <input type="number" name="studentCount" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">외국인 학생 수</label>
                  <input type="number" name="foreignStudentCount" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">학비</label>
                  <input type="text" name="tuitionFee" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">협력 형태</label>
                  <input type="text" name="partnershipType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">연락처 이메일</label>
                  <input type="email" name="contactEmail" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">연락처 전화</label>
                  <input type="text" name="contactPhone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="flex items-center">
                  <input type="checkbox" name="dormitory" class="mr-2">
                  <label class="text-sm text-gray-700">기숙사 제공</label>
                </div>
              </div>
              
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">대학 소개</label>
                <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <div class="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">주요 전공 (쉼표로 구분)</label>
                  <input type="text" name="majors" placeholder="공학, 경영학, 의학" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">학위 과정 (쉼표로 구분)</label>
                  <input type="text" name="degrees" placeholder="학부, 대학원" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">주요 특징 (쉼표로 구분)</label>
                <input type="text" name="features" placeholder="세계랭킹 50위, 전액장학금 제공" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">장학금 종류 (쉼표로 구분)</label>
                <input type="text" name="scholarships" placeholder="성적우수장학금, 외국인장학금" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
      const data = {
        name: formData.get('name'),
        englishName: formData.get('englishName'),
        region: formData.get('region'),
        website: formData.get('website'),
        logo: formData.get('logo') || \`https://via.placeholder.com/120x120/1f2937/ffffff?text=\${encodeURIComponent(formData.get('name').charAt(0))}\`,
        ranking: parseInt(formData.get('ranking')) || 0,
        establishedYear: parseInt(formData.get('establishedYear')) || new Date().getFullYear(),
        studentCount: parseInt(formData.get('studentCount')) || 0,
        foreignStudentCount: parseInt(formData.get('foreignStudentCount')) || 0,
        tuitionFee: formData.get('tuitionFee') || '문의',
        partnershipType: formData.get('partnershipType') || '교환학생',
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone'),
        dormitory: formData.get('dormitory') === 'on',
        description: formData.get('description'),
        majors: formData.get('majors').split(',').map(s => s.trim()).filter(s => s),
        degrees: formData.get('degrees').split(',').map(s => s.trim()).filter(s => s),
        features: formData.get('features').split(',').map(s => s.trim()).filter(s => s),
        scholarships: formData.get('scholarships').split(',').map(s => s.trim()).filter(s => s)
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
          form.querySelector('[name="name"]').value = uni.name;
          form.querySelector('[name="englishName"]').value = uni.englishName;
          form.querySelector('[name="region"]').value = uni.region;
          form.querySelector('[name="website"]').value = uni.website;
          form.querySelector('[name="logo"]').value = uni.logo;
          form.querySelector('[name="ranking"]').value = uni.ranking;
          form.querySelector('[name="establishedYear"]').value = uni.establishedYear;
          form.querySelector('[name="studentCount"]').value = uni.studentCount;
          form.querySelector('[name="foreignStudentCount"]').value = uni.foreignStudentCount;
          form.querySelector('[name="tuitionFee"]').value = uni.tuitionFee;
          form.querySelector('[name="partnershipType"]').value = uni.partnershipType;
          form.querySelector('[name="contactEmail"]').value = uni.contactEmail || '';
          form.querySelector('[name="contactPhone"]').value = uni.contactPhone || '';
          form.querySelector('[name="dormitory"]').checked = uni.dormitory;
          form.querySelector('[name="description"]').value = uni.description;
          form.querySelector('[name="majors"]').value = uni.majors.join(', ');
          form.querySelector('[name="degrees"]').value = uni.degrees.join(', ');
          form.querySelector('[name="features"]').value = uni.features.join(', ');
          form.querySelector('[name="scholarships"]').value = uni.scholarships.join(', ');
          
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
      
      const data = {
        name: formData.get('name'),
        englishName: formData.get('englishName'),
        region: formData.get('region'),
        website: formData.get('website'),
        logo: formData.get('logo'),
        ranking: parseInt(formData.get('ranking')) || 0,
        establishedYear: parseInt(formData.get('establishedYear')),
        studentCount: parseInt(formData.get('studentCount')) || 0,
        foreignStudentCount: parseInt(formData.get('foreignStudentCount')) || 0,
        tuitionFee: formData.get('tuitionFee'),
        partnershipType: formData.get('partnershipType'),
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone'),
        dormitory: formData.get('dormitory') === 'on',
        description: formData.get('description'),
        majors: formData.get('majors').split(',').map(s => s.trim()).filter(s => s),
        degrees: formData.get('degrees').split(',').map(s => s.trim()).filter(s => s),
        features: formData.get('features').split(',').map(s => s.trim()).filter(s => s),
        scholarships: formData.get('scholarships').split(',').map(s => s.trim()).filter(s => s)
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

    // 관리자 통계 로드
    async function loadAdminStatistics() {
      try {
        const response = await fetch('/api/statistics');
        const result = await response.json();
        
        if (result.success) {
          document.getElementById('totalJobs').textContent = result.data.jobs;
          document.getElementById('totalJobseekers').textContent = result.data.jobseekers;
          document.getElementById('totalMatches').textContent = result.data.matches;
        }
        
        // 협약대학교 수 계산
        const universitiesResponse = await fetch('/api/partner-universities');
        const universitiesResult = await universitiesResponse.json();
        if (universitiesResult.success) {
          document.getElementById('totalUniversities').textContent = universitiesResult.data.length;
        }
      } catch (error) {
        console.error('통계 로드 오류:', error);
      }
    }



    
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

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/jobs', jobRoutes)
app.route('/api/jobseekers', jobseekersRoutes)
app.route('/api/matching', matching)

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
app.get('/api/partner-universities', (c) => {
  const region = c.req.query('region')
  const major = c.req.query('major') 
  const degree = c.req.query('degree')
  
  // 샘플 데이터 (실제로는 데이터베이스에서 조회)
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
  
  if (degree && degree !== 'all') {
    universities = universities.filter(uni => uni.degrees.includes(degree));
  }
  
  return c.json({
    success: true,
    data: universities
  });
});

// 협약대학교 추가/수정 (관리자 전용)
app.post('/api/partner-universities', optionalAuth, requireAdmin, async (c) => {
  try {
    const data = await c.req.json();
    
    // 여기서 실제로는 데이터베이스에 저장
    // 현재는 샘플 응답만 반환
    return c.json({
      success: true,
      message: "협약대학교가 성공적으로 추가되었습니다.",
      data: {
        id: Math.floor(Math.random() * 1000) + 100,
        ...data
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      message: "협약대학교 추가 중 오류가 발생했습니다."
    }, 500);
  }
});

// 협약대학교 삭제 (관리자 전용)
app.delete('/api/partner-universities/:id', optionalAuth, requireAdmin, (c) => {
  const id = c.req.param('id');
  
  return c.json({
    success: true,
    message: `협약대학교 ID ${id}가 삭제되었습니다.`
  });
});

// 협약대학교 수정 (관리자 전용)  
app.put('/api/partner-universities/:id', optionalAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    return c.json({
      success: true,
      message: `협약대학교 ID ${id}가 수정되었습니다.`,
      data: {
        id: parseInt(id),
        ...data
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      message: "협약대학교 수정 중 오류가 발생했습니다."
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
                <label class="block text-sm font-medium text-gray-700 mb-2">지역</label>
                <select id="regionFilter" onchange="filterUniversities()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">전체 지역</option>
                  <option value="서울">서울</option>
                  <option value="경기">경기</option>
                  <option value="대전">대전</option>
                  <option value="부산">부산</option>
                  <option value="대구">대구</option>
                  <option value="광주">광주</option>
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
                  <option value="학부">학부</option>
                  <option value="대학원">대학원</option>
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
  
  // 비로그인 사용자는 로그인 요구 페이지 표시
  if (!user) {
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

        {/* 로그인 요구 메시지 */}
        <main class="container mx-auto px-4 py-16">
          <div class="max-w-md mx-auto text-center">
            <div class="bg-white rounded-lg shadow-lg p-8">
              <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-lock text-yellow-600 text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
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
        </main>
      </div>
    );
  }
  
  // 로그인 사용자는 정상 페이지 표시
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
                    <p class="text-gray-600 mb-2">info@wow-campus.kr</p>
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
                    <p class="text-gray-600 mb-2">02-1234-5678</p>
                    <p class="text-sm text-gray-500">평일 09:00~18:00 (점심시간 12:00~13:00 제외)</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-comments text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">실시간 채팅</h3>
                    <p class="text-gray-600 mb-3">즉시 답변 가능</p>
                    <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                      채팅 시작하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-2xl font-bold mb-8">온라인 문의</h2>
            <form class="bg-white p-8 rounded-lg shadow-sm space-y-6">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">이름 *</label>
                  <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="실명을 입력해주세요" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
                  <input type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="010-0000-0000" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">이메일 *</label>
                <input type="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="답변 받을 이메일 주소" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">제목 *</label>
                <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="문의 제목을 입력해주세요" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">문의 내용 *</label>
                <textarea required rows="6" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="궁금한 사항을 자세히 적어주세요"></textarea>
              </div>

              <div class="text-center">
                <button type="submit" class="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  문의 보내기
                </button>
                <p class="text-sm text-gray-500 mt-3">문의 접수 후 평균 2시간 내에 답변을 드립니다</p>
              </div>
            </form>
          </div>
        </div>
      </main>
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
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
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
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-language text-2xl text-orange-600"></i>
            </div>
            <h3 class="font-semibold mb-4">한국어 연수</h3>
            <p class="text-gray-600 mb-4">기초부터 고급까지 단계별 한국어 교육 프로그램</p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• 초급/중급/고급 과정</li>
              <li>• TOPIK 시험 준비</li>
              <li>• 문화 적응 프로그램</li>
            </ul>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-graduation-cap text-2xl text-blue-600"></i>
            </div>
            <h3 class="font-semibold mb-4">학부 과정</h3>
            <p class="text-gray-600 mb-4">한국 대학교 학사 학위 취득 프로그램</p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• 공학, 경영, IT 전공</li>
              <li>• 장학금 지원</li>
              <li>• 기숙사 제공</li>
            </ul>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-user-graduate text-2xl text-green-600"></i>
            </div>
            <h3 class="font-semibold mb-4">대학원 과정</h3>
            <p class="text-gray-600 mb-4">석박사 학위 과정 및 연구 지원</p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• 석사/박사 과정</li>
              <li>• 연구비 지원</li>
              <li>• 졸업 후 취업 연계</li>
            </ul>
          </div>
        </div>
        
        <div class="text-center">
          <p class="text-gray-500 mb-6">유학 프로그램에 대한 자세한 정보는 곧 업데이트됩니다.</p>
          <a href="/support" class="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors mr-4">
            상담 받기
          </a>
          <a href="/" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            홈으로 돌아가기
          </a>
        </div>
      </main>
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
app.get('/dashboard/jobseeker', optionalAuth, (c) => {
  const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    throw new HTTPException(403, { message: '구직자만 접근할 수 있는 페이지입니다.' });
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

        {/* KPI 카드 */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">12</p>
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
                <p class="text-2xl font-bold text-gray-900">87</p>
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
                <p class="text-2xl font-bold text-gray-900">5</p>
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
                <p class="text-2xl font-bold text-gray-900">4.8</p>
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
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-building text-blue-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">삼성전자 - 소프트웨어 개발자</h3>
                      <p class="text-gray-600 text-sm">2024년 10월 9일 지원</p>
                    </div>
                  </div>
                  <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">검토 중</span>
                </div>
                
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-building text-purple-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">LG화학 - 화학 엔지니어</h3>
                      <p class="text-gray-600 text-sm">2024년 10월 7일 지원</p>
                    </div>
                  </div>
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">서류 합격</span>
                </div>
                
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-building text-green-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">현대자동차 - 기계 설계</h3>
                      <p class="text-gray-600 text-sm">2024년 10월 5일 지원</p>
                    </div>
                  </div>
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">면접 대기</span>
                </div>
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
    </div>
  )
});

// 관리자 전용 대시보드 (통계 페이지로 리다이렉트)
app.get('/dashboard/admin', optionalAuth, requireAdmin, (c) => {
  return c.redirect('/statistics');
});

// 관리자 대시보드 - 협약대학교 관리 포함
app.get('/admin', optionalAuth, requireAdmin, (c) => {
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
                <span class="text-xs text-gray-500">관리자 대시보드</span>
              </div>
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            {/* 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
      </header>

      <main class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">시스템 관리</h1>
          <p class="text-gray-600">(주)와우쓰리디 플랫폼 관리 도구</p>
        </div>

        {/* 관리 메뉴 */}
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <a href="/statistics" class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-chart-line text-blue-600 text-xl"></i>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">통계 대시보드</h3>
            <p class="text-sm text-gray-600">플랫폼 통계 및 분석</p>
          </a>
          
          <button onclick="showPartnerUniversityManagement()" class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-university text-green-600 text-xl"></i>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">협약대학교 관리</h3>
            <p class="text-sm text-gray-600">대학교 정보 추가/수정/삭제</p>
          </button>
          
          <a href="/jobs" class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-briefcase text-purple-600 text-xl"></i>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">구인정보 관리</h3>
            <p class="text-sm text-gray-600">채용공고 승인 및 관리</p>
          </a>
          
          <a href="/jobseekers" class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-users text-yellow-600 text-xl"></i>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">사용자 관리</h3>
            <p class="text-sm text-gray-600">회원 정보 및 권한 관리</p>
          </a>
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
                    <option value="서울">서울</option>
                    <option value="경기">경기</option>
                    <option value="대전">대전</option>
                    <option value="부산">부산</option>
                    <option value="대구">대구</option>
                    <option value="광주">광주</option>
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
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대학교</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재학생</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">협력형태</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
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
    </div>
  )
})

// 🏠 메인 페이지 라우트  
app.get('/', (c) => {
  return c.html(
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>WOW-CAMPUS Work Platform</title>
        <link rel="stylesheet" href="https://cdn.tailwindcss.com" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="/static/app.js"></script>
      </head>
      <body class="min-h-screen bg-gray-50">
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
              <a href="/" class="text-blue-600 font-medium">홈</a>
              <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
              <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
              <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
              <div class="relative group">
                <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                  서비스 <i class="fas fa-chevron-down ml-1 text-xs"></i>
                </button>
                <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div id="service-dropdown-container">
                    <a href="/jobs" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <i class="fas fa-briefcase mr-2"></i>구인정보 보기
                    </a>
                    <a href="/jobseekers" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <i class="fas fa-user-tie mr-2"></i>구직정보 보기
                    </a>
                    <a href="/study" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <i class="fas fa-graduation-cap mr-2"></i>유학정보 보기
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="auth-buttons-container" class="flex items-center space-x-3">
              <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                <i class="fas fa-sign-in-alt mr-1"></i>로그인
              </button>
              <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-user-plus mr-1"></i>회원가입
              </button>
              <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
                <i class="fas fa-bars text-xl"></i>
              </button>
            </div>
          </nav>
        </header>

        <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
          <div class="container mx-auto px-4 py-24">
            <div class="text-center max-w-4xl mx-auto">
              <h1 class="text-5xl md:text-6xl font-bold mb-6">
                외국인을 위한 <span class="text-yellow-300">스마트</span> 구직 플랫폼
              </h1>
              <p class="text-xl text-blue-100 mb-8 leading-relaxed">
                AI 기반 매칭 시스템으로 당신에게 딱 맞는 일자리를 찾아보세요.<br/>
                한국에서의 새로운 시작을 WOW-CAMPUS와 함께하세요.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onclick="startOnboarding()" class="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors transform hover:scale-105 transition-all duration-200">
                  지금 시작하기 <i class="fas fa-rocket ml-2"></i>
                </button>
                <a href="/jobs" class="bg-white bg-opacity-20 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-30 transition-colors">
                  구인정보 둘러보기 <i class="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section class="py-20 bg-white">
          <div class="container mx-auto px-4">
            <div class="text-center mb-16">
              <h2 class="text-4xl font-bold text-gray-900 mb-4">왜 WOW-CAMPUS인가요?</h2>
              <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                외국인 구직자와 한국 기업을 연결하는 가장 효과적인 플랫폼
              </p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8">
              <div class="text-center p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i class="fas fa-magic text-green-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-4">AI 스마트 매칭</h3>
                <p class="text-gray-600 leading-relaxed">
                  인공지능이 당신의 스킬, 경력, 선호도를 분석하여<br/>
                  가장 적합한 일자리를 추천해드립니다.
                </p>
              </div>
              
              <div class="text-center p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i class="fas fa-globe-asia text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-4">다국어 지원</h3>
                <p class="text-gray-600 leading-relaxed">
                  한국어, 영어, 중국어, 베트남어 등<br/>
                  다양한 언어로 편리하게 이용하세요.
                </p>
              </div>
              
              <div class="text-center p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i class="fas fa-shield-alt text-purple-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-4">신뢰할 수 있는 기업</h3>
                <p class="text-gray-600 leading-relaxed">
                  검증된 한국 기업들과 안전한<br/>
                  채용 프로세스를 보장합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="py-20 bg-gray-50">
          <div class="container mx-auto px-4">
            <div class="text-center mb-16">
              <h2 class="text-4xl font-bold text-gray-900 mb-4">어떻게 시작하나요?</h2>
              <p class="text-xl text-gray-600">간단한 3단계로 시작하세요</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span class="text-3xl font-bold text-white">1</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-4">회원가입</h3>
                <p class="text-gray-600 leading-relaxed">
                  간단한 정보 입력으로<br/>
                  회원가입을 완료하세요
                </p>
              </div>
              
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span class="text-3xl font-bold text-white">2</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-4">프로필 작성</h3>
                <p class="text-gray-600 leading-relaxed">
                  당신의 스킬과 경력을<br/>
                  자세히 입력해주세요
                </p>
              </div>
              
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span class="text-3xl font-bold text-white">3</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-4">매칭 성공</h3>
                <p class="text-gray-600 leading-relaxed">
                  전문 에이전트의 도움으로<br/>
                  성공적인 취업 또는 인재 발굴
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer class="bg-gray-900 text-white">
          <div class="container mx-auto px-4 py-16">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div class="lg:col-span-2">
                <div class="flex items-center space-x-3 mb-6">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-xl">W</span>
                  </div>
                  <div>
                    <div class="font-bold text-2xl">(주)와우쓰리디</div>
                    <div class="text-gray-400">외국인 전문 구인구직 플랫폼</div>
                  </div>
                </div>
                <div class="space-y-3 text-gray-300">
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <div class="font-medium text-white mb-2">본사 (서울)</div>
                      <div class="text-sm">TEL: 02-3144-3137</div>
                    </div>
                    <div>
                      <div class="font-medium text-white mb-2">구미지사</div>
                      <div class="text-sm">TEL: 054-464-3137</div>
                    </div>
                  </div>
                  <div>
                    <div class="font-medium text-white mb-2">전주지사</div>
                    <div class="text-sm">TEL: 063-XXX-XXXX</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="font-semibold text-lg mb-4">서비스</h4>
                <ul class="space-y-2">
                  <li><a href="/jobs" class="text-gray-400 hover:text-white transition-colors">구인정보</a></li>
                  <li><a href="/jobseekers" class="text-gray-400 hover:text-white transition-colors">구직정보</a></li>
                  <li><a href="/study" class="text-gray-400 hover:text-white transition-colors">유학정보</a></li>
                  <li><a href="/matching" class="text-gray-400 hover:text-white transition-colors">AI 매칭</a></li>
                </ul>
              </div>

              <div>
                <h4 class="font-semibold text-lg mb-4">법적 고지</h4>
                <ul class="space-y-2">
                  <li><a href="/terms" class="text-gray-400 hover:text-white transition-colors">서비스 이용약관</a></li>
                  <li><a href="/privacy" class="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a></li>
                  <li><a href="/cookies" class="text-gray-400 hover:text-white transition-colors">쿠키 정책</a></li>
                </ul>
                <div class="mt-4 space-y-2 text-sm text-gray-400">
                  <div>사업자등록번호: 849-88-01659</div>
                  <div>개인정보보호책임자: 김순희</div>
                  <div>이메일: wow3d16@naver.com</div>
                </div>
              </div>
            </div>
            
            <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 (주)와우쓰리디. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              console.log('페이지 초기화 시작');
              
              const user = getCurrentUser();
              console.log('getCurrentUser - 토큰 확인:', user ? '있음' : '없음');
              
              if (user) {
                console.log('로그인된 상태:', user.name);
                updateAuthUI(user);
              } else {
                console.log('로그인되지 않은 상태');
                updateAuthUI(null);
              }
            });
          `
        }}></script>
      </body>
    </html>
  )
})

export default app
