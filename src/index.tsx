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
import uploadRoutes from './routes/upload'
import profileRoutes from './routes/profile'

// Import middleware
import { corsMiddleware, apiCors } from './middleware/cors'
import { optionalAuth, requireAdmin, authMiddleware, requireAgent, requireCompany } from './middleware/auth'
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

// Logo file serving using base64 data
import { LOGO_BASE64 } from './logo-data'

app.get('/logo.png', (c) => {
  // Return base64 data directly as HTML img tag redirect
  return c.html(`<html><head><meta http-equiv="refresh" content="0;url=${LOGO_BASE64}"></head></html>`)
})

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
        
        // 모바일 메뉴 인증 UI 업데이트
        updateMobileAuthUI(user);
        
        console.log('로그인 UI 업데이트 완료 (데스크톱 + 모바일)');
        
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
    
    // 📱 모바일 메뉴 인증 UI 업데이트
    function updateMobileAuthUI(user = null) {
      const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
      if (!mobileAuthButtons) {
        console.log('mobile-auth-buttons 컨테이너를 찾을 수 없음 (현재 페이지에 없을 수 있음)');
        return;
      }
      
      if (user) {
        // 로그인 상태
        const dashboardConfig = {
          jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-tachometer-alt' },
          company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building' },
          agent: { link: '/agents', color: 'blue', icon: 'fa-handshake' },
          admin: { link: '/dashboard/admin', color: 'red', icon: 'fa-chart-line' }
        };
        
        const config = dashboardConfig[user.user_type] || { link: '/', color: 'gray', icon: 'fa-home' };
        
        mobileAuthButtons.innerHTML = \`
          <div class="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-sm">\${user.name.charAt(0)}</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 text-sm">\${user.name}</div>
                  <div class="text-xs text-gray-600">\${getUserTypeLabel(user.user_type)}</div>
                </div>
              </div>
            </div>
            <a href="\${config.link}" class="w-full block text-center px-4 py-2 bg-\${config.color}-600 text-white rounded-lg hover:bg-\${config.color}-700 transition-colors font-medium mb-2">
              <i class="fas \${config.icon} mr-2"></i>내 대시보드
            </a>
            <button onclick="handleLogout()" class="w-full px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
              <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
            </button>
          </div>
        \`;
        console.log('모바일 인증 UI: 로그인 상태로 업데이트');
      } else {
        // 비로그인 상태
        mobileAuthButtons.innerHTML = \`
          <button onclick="showLoginModal()" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium mb-2">
            <i class="fas fa-sign-in-alt mr-2"></i>로그인
          </button>
          <button onclick="showSignupModal()" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <i class="fas fa-user-plus mr-2"></i>회원가입
          </button>
        \`;
        console.log('모바일 인증 UI: 비로그인 상태로 업데이트');
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
          
          // redirect 파라미터가 있으면 해당 페이지로 이동
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirect');
          if (redirectUrl) {
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 500); // 성공 메시지를 보여주고 이동
          } else {
            // redirect 파라미터가 없으면 홈으로 이동
            setTimeout(() => {
              window.location.href = '/home';
            }, 1000);
          }
          
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
                
                // redirect 파라미터가 있으면 해당 페이지로 이동, 없으면 홈으로
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');
                setTimeout(() => {
                  window.location.href = redirectUrl || '/home';
                }, 1000); // 성공 메시지를 보여주고 이동
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
        
        // 랜딩 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
        
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
    
    // 🎯 통합 네비게이션 메뉴 구성 (모든 사용자에게 동일한 단순 링크)
    const unifiedMenuConfig = [
      { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
      { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
      { href: '/matching', label: 'AI스마트매칭', icon: 'fas fa-magic' },
      { href: '/support', label: '고객지원', icon: 'fas fa-headset' }
    ];
    
    // 🎯 사용자 유형별 서비스 드롭다운 메뉴 구성
    const serviceMenuConfig = {
      guest: [
        { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
        { href: '/jobseekers', label: '구직정보 보기', icon: 'fas fa-user-tie' },
        { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' }
      ],
      jobseeker: [
        { href: '/jobseekers', label: '구직정보 찾기', icon: 'fas fa-user-tie' },
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
    
    // 🎯 통합 네비게이션 메뉴 업데이트 함수 (모든 사용자에게 동일한 메뉴)
    function updateNavigationMenu(user = null) {
      console.log('updateNavigationMenu 호출됨:', user ? \`\${user.name} (\${user.user_type})\` : '비로그인 상태');
      
      const navigationMenu = document.getElementById('navigation-menu-container');
      if (!navigationMenu) {
        console.warn('navigation-menu-container를 찾을 수 없습니다');
        return;
      }
      
      const currentPath = window.location.pathname;
      
      // 통합 메뉴 HTML 생성 (모든 사용자에게 동일한 단순 링크)
      const menuHtml = unifiedMenuConfig.map(menu => {
        const isActive = currentPath === menu.href;
        const activeClass = isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600 transition-colors font-medium';
        return \`
          <a href="\${menu.href}" class="\${activeClass}">
            <i class="\${menu.icon} mr-1"></i>\${menu.label}
          </a>
        \`;
      }).join('');
      
      navigationMenu.innerHTML = menuHtml;
      
      console.log('통합 네비게이션 메뉴 업데이트 완료 (모든 사용자 동일 - 구인정보, 구직정보, AI스마트매칭, 고객지원)');
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
    
    // 📱 모바일 인증 버튼 업데이트 함수
    function updateMobileAuthButtons() {
      const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
      if (!mobileAuthButtons) return;
      
      const user = window.currentUser;
      
      if (user) {
        // 로그인 상태: 사용자 정보와 로그아웃 버튼 표시
        mobileAuthButtons.innerHTML = \`
          <div class="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">\${user.name.charAt(0)}</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">\${user.name}</div>
                  <div class="text-xs text-gray-600">\${getUserTypeLabel(user.user_type)}</div>
                </div>
              </div>
              <button onclick="logout()" class="text-sm text-red-600 hover:text-red-700 font-medium">
                로그아웃
              </button>
            </div>
          </div>
        \`;
        console.log('모바일 인증 버튼: 로그인 상태로 업데이트');
      } else {
        // 비로그인 상태: 로그인/회원가입 버튼 표시
        mobileAuthButtons.innerHTML = \`
          <button onclick="showLoginModal()" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            <i class="fas fa-sign-in-alt mr-2"></i>로그인
          </button>
          <button onclick="showSignupModal()" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <i class="fas fa-user-plus mr-2"></i>회원가입
          </button>
        \`;
        console.log('모바일 인증 버튼: 비로그인 상태로 업데이트');
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
      
      // 📱 모바일 메뉴 토글 기능 초기화
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
          const isHidden = mobileMenu.classList.contains('hidden');
          
          if (isHidden) {
            // 메뉴 열기
            mobileMenu.classList.remove('hidden');
            mobileMenuBtn.innerHTML = '<i class="fas fa-times text-2xl"></i>';
            console.log('모바일 메뉴 열림');
            
            // 모바일 인증 버튼 업데이트
            updateMobileAuthButtons();
          } else {
            // 메뉴 닫기
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
            console.log('모바일 메뉴 닫힘');
          }
        });
        
        console.log('모바일 메뉴 토글 기능 초기화 완료');
      }
      
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
              <div class="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md cursor-pointer" onclick="showJobSeekerDetail(\${jobseeker.id})">
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
                
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center space-x-4 text-gray-500">
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
                  <button onclick="event.stopPropagation(); showJobSeekerDetail(\${jobseeker.id})" class="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                    자세히 보기 <i class="fas fa-arrow-right ml-1"></i>
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
        <div class="bg-white rounded-xl shadow-2xl p-4 sm:p-8 m-4 max-w-4xl w-full animate-scale-in relative z-10 max-h-[90vh] overflow-y-auto">
          <div class="text-center mb-6 sm:mb-8">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-blue-600 text-xl sm:text-2xl"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">어떤 목적으로 방문하셨나요?</h2>
            <p class="text-sm sm:text-base text-gray-600">서비스를 맞춤화하기 위해 사용자 유형을 선택해주세요</p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div class="user-type-card border-2 border-gray-200 rounded-lg p-4 sm:p-6 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-200 active:scale-95" 
                 onclick="selectUserType('jobseeker')">
              <div class="text-center">
                <div class="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i class="fas fa-user-tie text-green-600 text-xl sm:text-2xl"></i>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">구직자</h3>
                <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">일자리를 찾고 있는 외국인 구직자</p>
                <ul class="text-gray-600 text-xs space-y-1 text-left">
                  <li>• 맞춤 구인정보 추천</li>
                  <li>• AI스마트매칭 서비스</li>
                  <li>• 이력서 관리</li>
                  <li>• 면접 준비 지원</li>
                </ul>
              </div>
            </div>
            
            <div class="user-type-card border-2 border-gray-200 rounded-lg p-4 sm:p-6 cursor-pointer hover:border-purple-500 hover:shadow-lg transition-all duration-200 active:scale-95"
                 onclick="selectUserType('company')">
              <div class="text-center">
                <div class="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i class="fas fa-building text-purple-600 text-xl sm:text-2xl"></i>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">기업/채용담당자</h3>
                <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">외국인 인재를 채용하려는 기업</p>
                <ul class="text-gray-600 text-xs space-y-1 text-left">
                  <li>• 구인공고 등록</li>
                  <li>• AI 인재 추천</li>
                  <li>• 지원자 관리</li>
                  <li>• 채용 현황 분석</li>
                </ul>
              </div>
            </div>
            
            <div class="user-type-card border-2 border-gray-200 rounded-lg p-4 sm:p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200 active:scale-95"
                 onclick="selectUserType('agent')">
              <div class="text-center">
                <div class="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i class="fas fa-handshake text-blue-600 text-xl sm:text-2xl"></i>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">에이전트</h3>
                <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">구인구직 중개 전문가</p>
                <ul class="text-gray-600 text-xs space-y-1 text-left">
                  <li>• 클라이언트 관리</li>
                  <li>• AI스마트매칭 중개 서비스</li>
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
        <div class="bg-white rounded-xl shadow-2xl p-4 sm:p-8 m-4 max-w-md w-full animate-scale-in relative z-10 max-h-[90vh] overflow-y-auto">
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
        toast.error('비밀번호가 일치하지 않습니다.');
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
          toast.error(data.message || '회원가입 중 오류가 발생했습니다.');
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;
        }
      } catch (error) {
        console.error('회원가입 오류:', error);
        toast.error('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
        
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
            { icon: 'fa-magic', text: 'AI스마트매칭 시작하기', action: 'goToMatching' }
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
            { icon: 'fa-magic', text: 'AI스마트매칭 서비스', action: 'goToMatching' },
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
          toast.success('협약대학교가 성공적으로 추가되었습니다!');
          closeUniversityForm();
          loadUniversitiesForAdmin();
        } else {
          toast.error('오류가 발생했습니다: ' + result.message);
        }
      } catch (error) {
        console.error('저장 오류:', error);
        toast.error('저장 중 오류가 발생했습니다.');
      }
    }

    // 대학교 삭제
    async function deleteUniversity(id) {
      showConfirm({
        title: '대학교 삭제',
        message: '정말로 이 대학교를 삭제하시겠습니까?',
        type: 'danger',
        onConfirm: async () => {
      
      try {
        const response = await fetch(\`/api/partner-universities/\${id}\`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
          toast.success('대학교가 삭제되었습니다.');
          loadUniversitiesForAdmin();
        }
      } catch (error) {
        console.error('삭제 오류:', error);
        toast.error('삭제 중 오류가 발생했습니다.');
      }
        }
      });
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
          toast.success('협약대학교 정보가 수정되었습니다!');
          closeUniversityForm();
          loadUniversitiesForAdmin();
        } else {
          toast.error('오류가 발생했습니다: ' + result.message);
        }
      } catch (error) {
        console.error('수정 오류:', error);
        toast.error('수정 중 오류가 발생했습니다.');
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
      showConfirm({
        title: '에이전트 삭제',
        message: '정말로 이 에이전트를 삭제하시겠습니까?',
        type: 'danger',
        confirmText: '삭제',
        cancelText: '취소',
        onConfirm: async () => {
          try {
            const response = await fetch(\`/api/agents/\${agentId}\`, {
              method: 'DELETE',
              headers: {
                'Authorization': \`Bearer \${localStorage.getItem('wowcampus_token')}\`
              }
            });

            const result = await response.json();
            
            if (result.success) {
              toast.success('에이전트가 삭제되었습니다.');
              loadAgentsForAdmin();
            } else {
              toast.error('에이전트 삭제에 실패했습니다: ' + result.message);
            }
          } catch (error) {
            console.error('에이전트 삭제 오류:', error);
            toast.error('에이전트 삭제 중 오류가 발생했습니다.');
          }
        }
      });
    }

    // 에이전트 추가 폼 표시 (임시 구현)
    function showAddAgentForm() {
      toast.info('에이전트 추가 기능은 준비 중입니다.');
      // TODO: 에이전트 추가 폼 모달 구현
    }

    // 에이전트 수정 (임시 구현)
    function editAgent(agentId) {
      toast.info(\`에이전트 수정 기능은 준비 중입니다. (ID: \${agentId})\`);
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
        
        // DOM 요소들을 함수 시작 부분에서 미리 가져오기
        const totalJobsEl = document.getElementById('totalJobs');
        const totalJobseekersEl = document.getElementById('totalJobseekers');
        const totalMatchesEl = document.getElementById('totalMatches');
        const totalUniversitiesEl = document.getElementById('totalUniversities');
        
        const response = await fetch('/api/admin/statistics', {
          headers: {
            'Authorization': \`Bearer \${token}\`
          }
        });
        const result = await response.json();
        
        if (result.success) {
          if (totalJobsEl && result.data.jobs) {
            totalJobsEl.textContent = result.data.jobs.total || 0;
          }
          if (totalJobseekersEl && result.data.users) {
            const jobseekers = result.data.users.byType.find(u => u.user_type === 'jobseeker');
            totalJobseekersEl.textContent = jobseekers ? jobseekers.count : 0;
          }
          if (totalMatchesEl && result.data.matches) {
            // 성공한 매칭 수 표시 (accepted applications)
            totalMatchesEl.textContent = result.data.matches.successful || 0;
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
        'company': '구인자',
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
                <button onclick="if(window.approveUser) window.approveUser('\${user.id}', '\${user.name}'); else toast.error('함수가 로드되지 않았습니다.');" 
                        class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm">
                  <i class="fas fa-check mr-1"></i>승인
                </button>
                <button onclick="if(window.rejectUser) window.rejectUser('\${user.id}', '\${user.name}'); else toast.error('함수가 로드되지 않았습니다.');" 
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
      showConfirm({
        title: '사용자 승인',
        message: \`\${userName}님의 가입을 승인하시겠습니까?\`,
        type: 'info',
        confirmText: '승인',
        cancelText: '취소',
        onConfirm: async () => {
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
              toast.success(result.message);
              loadPendingUsers(); // 목록 새로고침
              loadAdminStatistics(); // 통계 업데이트
            } else {
              toast.error('승인 실패: ' + result.message);
            }
          } catch (error) {
            console.error('승인 오류:', error);
            toast.error('승인 중 오류가 발생했습니다.');
          }
        }
      });
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
          toast.success(result.message);
          loadPendingUsers(); // 목록 새로고침
        } else {
          toast.error('거부 실패: ' + result.message);
        }
      } catch (error) {
        console.error('거부 오류:', error);
        toast.error('거부 중 오류가 발생했습니다.');
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
          // 고급 필터 숨기기
          hideAllAdvancedFilters();
          loadPendingUsers();
        } else {
          // 전체 사용자, 구직자, 구인자, 에이전트 탭
          activeButton.className = 'px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600';
          if (allUsersContent) allUsersContent.classList.remove('hidden');
          // tabName을 데이터베이스 user_type 값으로 매핑
          let userType = null;
          if (tabName === 'jobseekers') userType = 'jobseeker';
          else if (tabName === 'employers') userType = 'company';
          else if (tabName === 'agents') userType = 'agent';
          
          // 고급 필터 표시/숨기기
          toggleAdvancedFilters(tabName);
          
          loadAllUsers(1, userType);
        }
      }
    }
    
    // 고급 필터 표시/숨기기
    function toggleAdvancedFilters(tabName) {
      const jobseekerFilters = document.getElementById('jobseekerAdvancedFilters');
      const employerFilters = document.getElementById('employerAdvancedFilters');
      const agentFilters = document.getElementById('agentAdvancedFilters');
      
      // 모든 필터 숨기기
      if (jobseekerFilters) jobseekerFilters.classList.add('hidden');
      if (employerFilters) employerFilters.classList.add('hidden');
      if (agentFilters) agentFilters.classList.add('hidden');
      
      // 선택된 탭에 맞는 필터 표시
      if (tabName === 'jobseekers' && jobseekerFilters) {
        jobseekerFilters.classList.remove('hidden');
      } else if (tabName === 'employers' && employerFilters) {
        employerFilters.classList.remove('hidden');
      } else if (tabName === 'agents' && agentFilters) {
        agentFilters.classList.remove('hidden');
      }
      
      // 이벤트 리스너 초기화 (필터가 표시될 때마다)
      if (window.initAdvancedFilterListeners) {
        window.initAdvancedFilterListeners();
      }
    }
    
    // 모든 고급 필터 숨기기
    function hideAllAdvancedFilters() {
      const jobseekerFilters = document.getElementById('jobseekerAdvancedFilters');
      const employerFilters = document.getElementById('employerAdvancedFilters');
      const agentFilters = document.getElementById('agentAdvancedFilters');
      
      if (jobseekerFilters) jobseekerFilters.classList.add('hidden');
      if (employerFilters) employerFilters.classList.add('hidden');
      if (agentFilters) agentFilters.classList.add('hidden');
    }
    
    // 고급 필터 초기화
    function resetAdvancedFilters() {
      // 구직자 필터 초기화
      const nationalityFilter = document.getElementById('nationalityFilter');
      const visaStatusFilter = document.getElementById('visaStatusFilter');
      const koreanLevelFilter = document.getElementById('koreanLevelFilter');
      const educationLevelFilter = document.getElementById('educationLevelFilter');
      const experienceYearsFilter = document.getElementById('experienceYearsFilter');
      const preferredLocationFilter = document.getElementById('preferredLocationFilter');
      
      if (nationalityFilter) nationalityFilter.value = '';
      if (visaStatusFilter) visaStatusFilter.value = '';
      if (koreanLevelFilter) koreanLevelFilter.value = '';
      if (educationLevelFilter) educationLevelFilter.value = '';
      if (experienceYearsFilter) experienceYearsFilter.value = '';
      if (preferredLocationFilter) preferredLocationFilter.value = '';
      
      // 구인자/기업 필터 초기화
      const companySizeFilter = document.getElementById('companySizeFilter');
      const industryFilter = document.getElementById('industryFilter');
      const addressFilter = document.getElementById('addressFilter');
      
      if (companySizeFilter) companySizeFilter.value = '';
      if (industryFilter) industryFilter.value = '';
      if (addressFilter) addressFilter.value = '';
      
      // 에이전트 필터 초기화
      const specializationFilter = document.getElementById('specializationFilter');
      const languagesFilter = document.getElementById('languagesFilter');
      const countriesCoveredFilter = document.getElementById('countriesCoveredFilter');
      
      if (specializationFilter) specializationFilter.value = '';
      if (languagesFilter) languagesFilter.value = '';
      if (countriesCoveredFilter) countriesCoveredFilter.value = '';
      
      // 검색 재실행
      loadAllUsers(1, currentUserType);
    }
    
    // 고급 필터 자동 검색 이벤트 설정 (전역 함수로 선언하여 초기화 시 호출)
    window.initAdvancedFilterListeners = function() {
      // 구직자 필터
      const filterIds = [
        'nationalityFilter', 'visaStatusFilter', 'koreanLevelFilter', 
        'educationLevelFilter', 'experienceYearsFilter',
        'companySizeFilter', 'specializationFilter'
      ];
      
      filterIds.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element && !element.dataset.listenerAdded) {
          element.addEventListener('change', () => {
            loadAllUsers(1, currentUserType);
          });
          element.dataset.listenerAdded = 'true';
        }
      });
      
      // 텍스트 입력 필터 (디바운스 적용)
      const textFilterIds = ['preferredLocationFilter', 'industryFilter', 'addressFilter', 
                             'languagesFilter', 'countriesCoveredFilter'];
      
      let debounceTimer;
      textFilterIds.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element && !element.dataset.listenerAdded) {
          element.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              loadAllUsers(1, currentUserType);
            }, 500); // 500ms 디바운스
          });
          element.dataset.listenerAdded = 'true';
        }
      });
    };
    
    // 페이지 로드 시 이벤트 리스너 초기화
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (window.initAdvancedFilterListeners) {
          window.initAdvancedFilterListeners();
        }
      }, 100);
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
        
        // 고급 필터 - 구직자
        const nationality = document.getElementById('nationalityFilter')?.value || '';
        const visaStatus = document.getElementById('visaStatusFilter')?.value || '';
        const koreanLevel = document.getElementById('koreanLevelFilter')?.value || '';
        const educationLevel = document.getElementById('educationLevelFilter')?.value || '';
        const experienceYears = document.getElementById('experienceYearsFilter')?.value || '';
        const preferredLocation = document.getElementById('preferredLocationFilter')?.value || '';
        
        // 고급 필터 - 구인자/기업
        const companySize = document.getElementById('companySizeFilter')?.value || '';
        const industry = document.getElementById('industryFilter')?.value || '';
        const address = document.getElementById('addressFilter')?.value || '';
        
        // 고급 필터 - 에이전트
        const specialization = document.getElementById('specializationFilter')?.value || '';
        const languages = document.getElementById('languagesFilter')?.value || '';
        const countriesCovered = document.getElementById('countriesCoveredFilter')?.value || '';
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(search && { search }),
          ...(status && { status }),
          ...(typeFilter && { user_type: typeFilter }),
          // 구직자 필터
          ...(nationality && { nationality }),
          ...(visaStatus && { visa_status: visaStatus }),
          ...(koreanLevel && { korean_level: koreanLevel }),
          ...(educationLevel && { education_level: educationLevel }),
          ...(experienceYears && { experience_years: experienceYears }),
          ...(preferredLocation && { preferred_location: preferredLocation }),
          // 구인자/기업 필터
          ...(companySize && { company_size: companySize }),
          ...(industry && { industry }),
          ...(address && { address }),
          // 에이전트 필터
          ...(specialization && { specialization }),
          ...(languages && { languages }),
          ...(countriesCovered && { countries_covered: countriesCovered })
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
                <button onclick="if(window.openEditUserModal) window.openEditUserModal('\${user.id}'); else toast.error('잠시 후 다시 시도해주세요.');" 
                        class="text-blue-600 hover:text-blue-900 mr-2 transition-colors">
                  <i class="fas fa-edit"></i> 수정
                </button>
                \${user.status === 'approved' ? \`
                  <button onclick="if(window.confirmToggleUserStatus) window.confirmToggleUserStatus('\${user.id}', '\${user.name}', '\${user.status}'); else toast.error('잠시 후 다시 시도해주세요.');" 
                          class="text-orange-600 hover:text-orange-900 mr-2 transition-colors"
                          title="일시정지">
                    <i class="fas fa-pause-circle"></i> 일시정지
                  </button>
                \` : user.status === 'pending' ? \`
                  <button onclick="if(window.confirmToggleUserStatus) window.confirmToggleUserStatus('\${user.id}', '\${user.name}', '\${user.status}'); else toast.error('잠시 후 다시 시도해주세요.');" 
                          class="text-green-600 hover:text-green-900 mr-2 transition-colors"
                          title="활성화">
                    <i class="fas fa-play-circle"></i> 활성화
                  </button>
                \` : ''}
                <button onclick="if(window.confirmDeleteUser) window.confirmDeleteUser('\${user.id}', '\${user.name}'); else toast.error('잠시 후 다시 시도해주세요.');" 
                        class="text-red-600 hover:text-red-900 transition-colors">
                  <i class="fas fa-trash-alt"></i> 삭제
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
        toast.error('사용자 정보를 불러오는데 실패했습니다.');
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
      
      showConfirm({
        title: '임시 비밀번호 생성',
        message: '이 사용자의 임시 비밀번호를 생성하시겠습니까? 기존 비밀번호는 사용할 수 없게 됩니다.',
        type: 'warning',
        confirmText: '생성',
        cancelText: '취소',
        onConfirm: async () => {
      
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
          toast.success(\`임시 비밀번호가 생성되었습니다: \${result.data.tempPassword}\n\n이 비밀번호를 반드시 사용자에게 안전하게 전달하세요.\`, { duration: 10000 });
        } else {
          toast.error('임시 비밀번호 생성 실패: ' + result.message);
        }
      } catch (error) {
        console.error('임시 비밀번호 생성 오류:', error);
        toast.error('임시 비밀번호 생성 중 오류가 발생했습니다.');
      }
        }
      });
    }
    
    // 임시 비밀번호 복사
    function copyTempPassword() {
      const passwordInput = document.getElementById('tempPasswordValue');
      passwordInput.select();
      document.execCommand('copy');
      toast.success('임시 비밀번호가 클립보드에 복사되었습니다!');
    }
    
    // 사용자 삭제 확인 모달 열기
    let deleteUserId = null;
    
    function confirmDeleteUser(userId, userName) {
      deleteUserId = userId;
      document.getElementById('deleteUserName').textContent = userName;
      document.getElementById('deleteUserModal').classList.remove('hidden');
    }
    
    // 사용자 삭제 확인 모달 닫기
    function closeDeleteUserModal() {
      deleteUserId = null;
      document.getElementById('deleteUserModal').classList.add('hidden');
    }
    
    // 사용자 삭제 실행
    async function executeDeleteUser() {
      if (!deleteUserId) return;
      
      const confirmBtn = document.getElementById('confirmDeleteBtn');
      const originalText = confirmBtn.innerHTML;
      
      try {
        // 버튼 비활성화 및 로딩 표시
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>삭제 중...';
        
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(\`/api/admin/users/\${deleteUserId}\`, {
          method: 'DELETE',
          headers: {
            'Authorization': \`Bearer \${token}\`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success('사용자가 삭제되었습니다.');
          closeDeleteUserModal();
          // 목록 새로고침
          loadAllUsers(currentUserPage, currentUserType);
          loadPendingUsers(); // 대기 목록도 새로고침
        } else {
          toast.error('삭제 실패: ' + result.message);
        }
      } catch (error) {
        console.error('사용자 삭제 오류:', error);
        toast.error('사용자 삭제 중 오류가 발생했습니다.');
      } finally {
        // 버튼 복구
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalText;
      }
    }
    
    // === 사용자 상태 토글 관련 함수 ===
    let toggleUserId = null;
    let toggleUserStatus = null;
    
    // 사용자 상태 토글 확인 모달 열기
    function confirmToggleUserStatus(userId, userName, currentStatus) {
      toggleUserId = userId;
      toggleUserStatus = currentStatus;
      
      const modal = document.getElementById('toggleStatusModal');
      const titleIcon = document.getElementById('toggleStatusIcon');
      const title = document.getElementById('toggleStatusTitle');
      const userNameEl = document.getElementById('toggleUserName');
      const actionText = document.getElementById('toggleActionText');
      const effectsList = document.getElementById('toggleStatusEffects');
      const warningBox = document.getElementById('toggleStatusWarning');
      const confirmBtn = document.getElementById('confirmToggleBtn');
      const confirmIcon = document.getElementById('confirmToggleIcon');
      const confirmText = document.getElementById('confirmToggleText');
      
      userNameEl.textContent = userName;
      
      if (currentStatus === 'approved') {
        // approved → pending (일시정지)
        titleIcon.className = 'fas fa-pause-circle text-orange-600 mr-2';
        title.textContent = '계정 일시정지 확인';
        actionText.textContent = '일시정지';
        actionText.className = 'text-orange-600';
        warningBox.className = 'bg-orange-50 border border-orange-200 rounded-lg p-4';
        warningBox.querySelector('.fa-info-circle').className = 'fas fa-exclamation-triangle text-orange-600 mt-1 mr-3';
        warningBox.querySelector('.text-sm').className = 'text-sm text-orange-800';
        effectsList.innerHTML = \`
          <li>사용자의 구인/구직 정보가 <strong>공개 페이지에 노출되지 않습니다</strong></li>
          <li>사용자는 로그인할 수 있지만, 정보는 숨겨집니다</li>
          <li>언제든 다시 활성화할 수 있습니다</li>
        \`;
        confirmBtn.className = 'flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium';
        confirmIcon.className = 'fas fa-pause-circle mr-2';
        confirmText.textContent = '일시정지';
      } else if (currentStatus === 'pending') {
        // pending → approved (활성화)
        titleIcon.className = 'fas fa-play-circle text-green-600 mr-2';
        title.textContent = '계정 활성화 확인';
        actionText.textContent = '활성화';
        actionText.className = 'text-green-600';
        warningBox.className = 'bg-green-50 border border-green-200 rounded-lg p-4';
        warningBox.querySelector('.fas').className = 'fas fa-check-circle text-green-600 mt-1 mr-3';
        warningBox.querySelector('.text-sm').className = 'text-sm text-green-800';
        effectsList.innerHTML = \`
          <li>사용자의 구인/구직 정보가 <strong>공개 페이지에 정상적으로 노출됩니다</strong></li>
          <li>사용자는 모든 기능을 정상적으로 사용할 수 있습니다</li>
          <li>승인 시각과 승인자 정보가 기록됩니다</li>
        \`;
        confirmBtn.className = 'flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium';
        confirmIcon.className = 'fas fa-play-circle mr-2';
        confirmText.textContent = '활성화';
      }
      
      modal.classList.remove('hidden');
    }
    
    // 사용자 상태 토글 확인 모달 닫기
    function closeToggleStatusModal() {
      toggleUserId = null;
      toggleUserStatus = null;
      document.getElementById('toggleStatusModal').classList.add('hidden');
    }
    
    // 사용자 상태 토글 실행
    async function executeToggleUserStatus() {
      if (!toggleUserId) return;
      
      const confirmBtn = document.getElementById('confirmToggleBtn');
      const originalText = confirmBtn.innerHTML;
      
      try {
        // 버튼 비활성화 및 로딩 표시
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>처리 중...';
        
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(\`/api/admin/users/\${toggleUserId}/toggle-status\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success(result.message);
          closeToggleStatusModal();
          // 목록 새로고침
          loadAllUsers(currentUserPage, currentUserType);
          loadPendingUsers(); // 대기 목록도 새로고침
        } else {
          toast.error('상태 변경 실패: ' + result.message);
        }
      } catch (error) {
        console.error('사용자 상태 토글 오류:', error);
        toast.error('사용자 상태 변경 중 오류가 발생했습니다.');
      } finally {
        // 버튼 복구
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalText;
      }
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
          toast.success('사용자 정보가 수정되었습니다.');
          closeEditUserModal();
          loadAllUsers(currentUserPage, currentUserType); // 목록 새로고침
          if (status === 'approved' || status === 'rejected') {
            loadPendingUsers(); // 대기 목록도 새로고침
          }
        } else {
          toast.error('수정 실패: ' + result.message);
        }
      } catch (error) {
        console.error('사용자 수정 오류:', error);
        toast.error('사용자 수정 중 오류가 발생했습니다.');
      }
    });
    
    // 데이터베이스 연결 테스트
    async function testDatabaseConnection() {
      try {
        const token = localStorage.getItem('wowcampus_token');
        if (!token) {
          toast.warning('로그인이 필요합니다.');
          return;
        }
        
        console.log('🧪 Testing database connection...');
        
        const response = await fetch('/api/admin/test-db', {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        
        const result = await response.json();
        
        console.log('🔍 DB Test Result:', result);
        
        if (result.success) {
          toast.success('✅ 데이터베이스 연결 성공!\\n\\n' +
                '- DB 바인딩: OK\\n' +
                '- 사용자 수: ' + result.data.usersCount + '\\n' +
                '- 테이블 수: ' + result.data.tables.length + '\\n' +
                '- 샘플 사용자: ' + (result.data.sampleUser ? result.data.sampleUser.email : 'None') + '\\n\\n' +
                '자세한 내용은 콘솔을 확인하세요.', { duration: 8000 });
        } else {
          toast.error('❌ 데이터베이스 오류:\\n\\n' + result.error + '\\n\\n자세한 내용은 콘솔을 확인하세요.', { duration: 8000 });
        }
      } catch (error) {
        console.error('❌ DB test failed:', error);
        toast.error('데이터베이스 테스트 중 오류가 발생했습니다. 콘솔을 확인하세요.');
      }
    }
    
    // 헬퍼 함수들
    // 전역 함수로 노출
    window.testDatabaseConnection = testDatabaseConnection;
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
    window.confirmDeleteUser = confirmDeleteUser;
    window.closeDeleteUserModal = closeDeleteUserModal;
    window.executeDeleteUser = executeDeleteUser;
    window.confirmToggleUserStatus = confirmToggleUserStatus;
    window.closeToggleStatusModal = closeToggleStatusModal;
    window.executeToggleUserStatus = executeToggleUserStatus;
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
app.route('/api/upload', uploadRoutes)
app.route('/api/profile', profileRoutes)

// Latest information API for home page
app.get('/api/latest-information', async (c) => {
  try {
    // Get latest 3 job postings
    const latestJobs = await c.env.DB.prepare(`
      SELECT 
        jp.id,
        jp.title,
        jp.job_type,
        jp.job_category,
        jp.location,
        c.company_name
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.status = 'active'
      ORDER BY jp.created_at DESC
      LIMIT 3
    `).all();
    
    // Get latest 3 jobseekers (no status column in jobseekers table)
    const latestJobseekers = await c.env.DB.prepare(`
      SELECT 
        js.id,
        js.first_name,
        js.last_name,
        js.nationality,
        js.experience_years,
        js.skills,
        js.preferred_location,
        js.bio
      FROM jobseekers js
      ORDER BY js.created_at DESC
      LIMIT 3
    `).all();
    
    // Format job data
    const formattedJobs = latestJobs.results.map((job: any) => ({
      id: job.id,
      title: job.title,
      type: job.job_type,
      category: job.job_category,
      location: job.location,
      company: job.company_name || '회사명 비공개'
    }));
    
    // Format jobseeker data
    const formattedJobseekers = latestJobseekers.results.map((js: any) => ({
      id: js.id,
      name: `${js.first_name || ''} ${js.last_name || ''}`.trim() || '이름 비공개',
      nationality: js.nationality || '국적 비공개',
      experience: js.experience_years ? `${js.experience_years}년 경력` : '신입',
      skills: js.skills || '스킬 정보 없음',
      location: js.preferred_location || '지역 미정',
      bio: js.bio
    }));
    
    return c.json({
      success: true,
      data: {
        latestJobs: formattedJobs,
        latestJobseekers: formattedJobseekers
      }
    });
  } catch (error) {
    console.error('Latest information API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    return c.json({
      success: false,
      message: 'Failed to fetch latest information',
      error: errorMessage
    }, 500);
  }
})

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
  
  console.log('📤 문서 업로드 API 호출됨');
  console.log('👤 사용자 정보:', {
    id: user?.id,
    email: user?.email,
    name: user?.name,
    user_type: user?.user_type
  });
  
  // 로그인한 모든 사용자 허용 (구직자, 기업, 에이전트, 관리자)
  if (!user) {
    console.error('❌ 로그인되지 않은 사용자');
    return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
  }

  try {
    const formData = await c.req.formData();
    console.log('📦 FormData 파싱 완료');
    
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const description = formData.get('description') as string || '';
    
    console.log('📄 업로드 요청 정보:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      documentType: documentType,
      description: description
    });

    if (!file) {
      console.error('❌ 파일이 FormData에 없음');
      return c.json({ success: false, message: '파일이 제공되지 않았습니다.' }, 400);
    }

    // 파일 크기 제한 (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    console.log('📊 파일 크기 체크:', {
      size: file.size,
      maxSize: MAX_FILE_SIZE,
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });
    
    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ 파일 크기 초과');
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
    
    console.log('🔍 MIME 타입 체크:', {
      fileType: file.type,
      isAllowed: allowedTypes.includes(file.type)
    });
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ 허용되지 않는 파일 형식:', file.type);
      return c.json({ 
        success: false, 
        message: `허용되지 않는 파일 형식입니다. (${file.type})\nPDF, Word, 이미지 파일만 업로드 가능합니다.` 
      }, 400);
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const storageFileName = `${timestamp}_${randomStr}.${fileExt}`;
    
    console.log('📝 스토리지 파일명 생성:', storageFileName);

    // 파일 데이터 읽기
    const fileBuffer = await file.arrayBuffer();
    console.log('✅ 파일 데이터 읽기 완료:', fileBuffer.byteLength, 'bytes');
    
    // R2 버킷 사용 가능 여부 확인
    const hasR2 = !!c.env.DOCUMENTS_BUCKET;
    console.log('💾 스토리지 방식:', hasR2 ? 'R2 버킷' : 'Base64 DB 저장');
    
    let result;
    if (hasR2) {
      // R2 스토리지 사용
      const storageKey = `documents/${user.id}/${storageFileName}`;
      console.log('☁️ R2 업로드 시작:', storageKey);
      
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
      console.log('✅ R2 업로드 완료');

      // 데이터베이스에 메타데이터 저장 (R2 사용 시)
      console.log('💿 DB에 메타데이터 저장 중...');
      result = await c.env.DB.prepare(`
        INSERT INTO documents (
          user_id, document_type, file_name, original_name, 
          file_size, mime_type, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        documentType,
        storageKey,  // storage_key를 file_name에 저장
        file.name,
        file.size,
        file.type,
        description
      ).run();
      console.log('✅ DB 저장 완료, document_id:', result.meta.last_row_id);
    } else {
      // Base64로 데이터베이스에 저장 (R2 없을 때)
      console.log('🔄 Base64 인코딩 중...');
      const base64Data = Buffer.from(fileBuffer).toString('base64');
      console.log('✅ Base64 인코딩 완료:', base64Data.length, 'chars');
      
      console.log('💿 DB에 파일 데이터 저장 중...');
      
      // file_data 컬럼이 있는지 먼저 확인
      try {
        result = await c.env.DB.prepare(`
          INSERT INTO documents (
            user_id, document_type, file_name, original_name, 
            file_size, mime_type, file_data, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          user.id,
          documentType,
          `base64_${storageFileName}`,  // file_name에 고유값 저장
          file.name,
          file.size,
          file.type,
          base64Data,
          description
        ).run();
        console.log('✅ DB 저장 완료 (file_data 사용), document_id:', result.meta.last_row_id);
      } catch (error) {
        // file_data 컬럼이 없으면 기본 컬럼만 사용
        console.warn('⚠️ file_data 컬럼 없음, 메타데이터만 저장');
        result = await c.env.DB.prepare(`
          INSERT INTO documents (
            user_id, document_type, file_name, original_name, 
            file_size, mime_type, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          user.id,
          documentType,
          `base64_${storageFileName}`,
          file.name,
          file.size,
          file.type,
          description
        ).run();
        console.log('✅ DB 저장 완료 (메타데이터만), document_id:', result.meta.last_row_id);
      }
    }

    console.log('🎉 문서 업로드 성공!');
    
    // 리다이렉트 with success message
    return c.redirect('/dashboard/jobseeker/documents?success=1');

  } catch (error) {
    console.error('❌❌❌ 문서 업로드 오류 발생 ❌❌❌');
    console.error('오류 타입:', error?.constructor?.name);
    console.error('오류 메시지:', error instanceof Error ? error.message : String(error));
    console.error('전체 오류 객체:', error);
    if (error instanceof Error && error.stack) {
      console.error('스택 트레이스:', error.stack);
    }
    
    // 리다이렉트 with error message
    const errorMsg = encodeURIComponent(
      error instanceof Error ? error.message : '문서 업로드 중 오류가 발생했습니다.'
    );
    return c.redirect(`/dashboard/jobseeker/documents?error=${errorMsg}`);
  }
});

// 문서 목록 조회 API
app.get('/api/documents', authMiddleware, async (c) => {
  const user = c.get('user');
  
  // 로그인한 모든 사용자 허용
  if (!user) {
    return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type
      },
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
  
  // 로그인한 모든 사용자 허용
  if (!user) {
    return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
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
// 문서 삭제 핸들러 (공통 로직)
const handleDocumentDelete = async (c: any) => {
  const user = c.get('user');
  const documentId = c.req.param('id');
  
  // 로그인한 모든 사용자 허용
  if (!user) {
    return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
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

    return { success: true };

  } catch (error) {
    console.error('문서 삭제 오류:', error);
    throw error;
  }
};

// DELETE 방식 (API용)
app.delete('/api/documents/:id', authMiddleware, async (c) => {
  try {
    await handleDocumentDelete(c);
    return c.json({
      success: true,
      message: '문서가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: '문서 삭제 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// POST 방식 (Form용)
app.post('/api/documents/:id/delete', authMiddleware, async (c) => {
  try {
    await handleDocumentDelete(c);
    return c.redirect('/dashboard/jobseeker/documents?success=delete');
  } catch (error) {
    const errorMsg = encodeURIComponent('문서 삭제 중 오류가 발생했습니다.');
    return c.redirect(`/dashboard/jobseeker/documents?error=${errorMsg}`);
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

app.get('/api/latest-information', async (c) => {
  try {
    // Fetch latest 3 job postings with company name
    const latestJobs = await c.env.DB.prepare(`
      SELECT 
        jp.id, 
        jp.title, 
        jp.job_category as category, 
        jp.job_type as type, 
        c.company_name as company, 
        jp.location
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.status = 'open'
      ORDER BY jp.created_at DESC
      LIMIT 3
    `).all()

    // Fetch latest 5 jobseekers (only public profiles) - changed from 3 to 5
    const latestJobseekers = await c.env.DB.prepare(`
      SELECT 
        u.id,
        js.first_name || ' ' || js.last_name as name,
        js.nationality,
        js.experience_years,
        js.preferred_location as location,
        js.skills
      FROM users u
      JOIN jobseekers js ON u.id = js.user_id
      WHERE u.status = 'approved'
      ORDER BY js.created_at DESC
      LIMIT 5
    `).all()

    // Format jobseekers data
    const formattedJobseekers = latestJobseekers.results.map((js: any) => {
      let skills = []
      try {
        skills = typeof js.skills === 'string' ? JSON.parse(js.skills) : (js.skills || [])
      } catch (e) {
        skills = []
      }
      
      const experienceText = js.experience_years === 0 ? '신입' : `${js.experience_years}년 경력`
      const skillsText = Array.isArray(skills) && skills.length > 0 
        ? skills.slice(0, 3).join(', ') 
        : '기술 미입력'
      
      return {
        id: js.id,
        name: js.name,
        nationality: js.nationality || '국적 미입력',
        experience: experienceText,
        skills: skillsText,
        location: js.location ? `${js.location} 희망` : '지역 무관'
      }
    })

    return c.json({
      success: true,
      data: {
        latestJobs: latestJobs.results,
        latestJobseekers: formattedJobseekers
      }
    })
  } catch (error) {
    console.error('Error fetching latest information:', error)
    return c.json({
      success: false,
      message: '최신 정보를 불러오는 중 오류가 발생했습니다.'
    }, 500)
  }
})

// Public API for matching page - Get jobseekers list
app.get('/api/matching/public/jobseekers', async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '100'), 100)
    
    const jobseekers = await c.env.DB.prepare(`
      SELECT 
        js.id,
        js.first_name,
        js.last_name,
        js.nationality,
        js.experience_years,
        js.major,
        js.skills,
        js.preferred_location,
        js.salary_expectation,
        js.visa_status
      FROM jobseekers js
      LEFT JOIN users u ON js.user_id = u.id
      WHERE u.status = 'approved' OR u.status IS NULL
      ORDER BY js.created_at DESC
      LIMIT ?
    `).bind(limit).all()
    
    return c.json({
      success: true,
      data: jobseekers.results
    })
  } catch (error) {
    console.error('Error fetching jobseekers for matching:', error)
    return c.json({
      success: false,
      message: '구직자 목록을 불러오는 중 오류가 발생했습니다.'
    }, 500)
  }
})

// Public API for matching page - Get jobs list
app.get('/api/matching/public/jobs', async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '100'), 100)
    
    const jobs = await c.env.DB.prepare(`
      SELECT 
        jp.id,
        jp.title,
        c.company_name,
        jp.location,
        jp.job_type,
        jp.job_category,
        jp.skills_required,
        jp.experience_level,
        jp.salary_min,
        jp.salary_max,
        jp.visa_sponsorship
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.status = 'active'
      ORDER BY jp.created_at DESC
      LIMIT ?
    `).bind(limit).all()
    
    return c.json({
      success: true,
      data: jobs.results
    })
  } catch (error) {
    console.error('Error fetching jobs for matching:', error)
    return c.json({
      success: false,
      message: '구인공고 목록을 불러오는 중 오류가 발생했습니다.'
    }, 500)
  }
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

// ============================================================
// PAGE COMPONENTS (분리된 페이지 컴포넌트)
// ============================================================
import { LoginPage } from './pages/login'
import { handler as ContactPage } from './pages/contact'
import { handler as FaqPage } from './pages/faq'
import { handler as GuidePage } from './pages/guide'
import { handler as NoticePage } from './pages/notice'
import { handler as BlogPage } from './pages/blog'
import { handler as TermsPage } from './pages/terms'
import { handler as PrivacyPage } from './pages/privacy'
import { handler as CookiesPage } from './pages/cookies'
import { handler as MatchingPage } from './pages/matching'
import { handler as SupportPage } from './pages/support'
import { handler as HomePage } from './pages/home'
import { handler as LandingPage } from './pages/landing'
import { handler as JobsListPage } from './pages/jobs/list'
import { handler as JobDetailPage } from './pages/jobs/detail'
import { handler as JobCreatePage } from './pages/jobs/create'
import { handler as JobEditPage } from './pages/jobs/edit'
import { handler as JobseekersListPage } from './pages/jobseekers/list'
import { handler as JobseekerDetailPage } from './pages/jobseekers/detail'
import { handler as StudyIndexPage } from './pages/study/index'
import { handler as StudyKoreanPage } from './pages/study/korean'
import { handler as StudyUndergraduatePage } from './pages/study/undergraduate'
import { handler as StudyGraduatePage } from './pages/study/graduate'
import { handler as AgentsDashboardPage } from './pages/agents/dashboard'
import { handler as AgentsAssignPage } from './pages/agents/assign'
import { handler as AgentsProfileEditPage } from './pages/agents/profile-edit'
import { handler as StatisticsPage } from './pages/statistics'
import { handler as ProfilePage } from './pages/profile'
import { handler as CompanyProfilePage } from './pages/profile/company'
import { handler as DashboardIndexPage } from './pages/dashboard/index'
import { handler as DashboardLegacyPage } from './pages/dashboard/legacy'
import { handler as DashboardJobseekerPage } from './pages/dashboard/jobseeker'
import { handler as DashboardJobseekerDocumentsPage } from './pages/dashboard/jobseeker-documents'
import { handler as DashboardCompanyPage } from './pages/dashboard/company'
import { handler as DashboardAdminPage } from './pages/dashboard/admin'
import { handler as AdminFullPage } from './pages/dashboard/admin-full'

// ============================================================
// WEB PAGES (렌더링 - 분리된 컴포넌트 사용)
// ============================================================
// 모든 웹 페이지에 renderer 적용
app.use('*', renderer)

// Jobseeker Detail Page - 구직정보 상세보기
app.get('/jobseekers/:id', optionalAuth, JobseekerDetailPage)

// Job Create Page - 구인공고 등록 (기업 전용)
app.get('/jobs/create', ...JobCreatePage)

// Job Edit Page - 구인공고 수정 (기업 전용)
app.get('/jobs/:id/edit', ...JobEditPage)

// Job Detail Page - 구인정보 상세보기  
app.get('/jobs/:id', optionalAuth, JobDetailPage)

// Jobs page
app.get('/jobs', JobsListPage)

// Study page
app.get('/study', StudyIndexPage)

// Study Program Detail Pages
app.get('/study/korean', StudyKoreanPage)
app.get('/study/undergraduate', StudyUndergraduatePage)
app.get('/study/graduate', StudyGraduatePage)

// Job Seekers page (구직정보 보기)
app.get('/jobseekers', optionalAuth, JobseekersListPage)

// Agents Dashboard page (에이전트 관리) - 에이전트 전용
app.get('/agents', authMiddleware, requireAgent, AgentsDashboardPage)

// Agent Jobseeker Assignment Page - 에이전트 전용
app.get('/agents/assign', authMiddleware, requireAgent, AgentsAssignPage)

// Agent Profile Edit Page - 에이전트 전용
app.get('/agents/profile/edit', authMiddleware, requireAgent, AgentsProfileEditPage)

// Statistics page
app.get('/statistics', authMiddleware, StatisticsPage)

// Landing page (public)
app.get('/', LandingPage)

// Home page (protected)
app.get('/home', authMiddleware, HomePage)

// Matching page (protected)
app.get('/matching', authMiddleware, MatchingPage)

// Support page
app.get('/support', SupportPage)

// FAQ page
app.get('/faq', FaqPage)

// Guide page
app.get('/guide', GuidePage)

// Login page
app.get('/login', LoginPage)

// Contact page
app.get('/contact', ContactPage)

// Notice page
app.get('/notice', NoticePage)

// Blog page
app.get('/blog', BlogPage)

// API Documentation page (간단한 JSON 응답)
app.get('/api', (c) => {
  return c.json({
    message: 'WOW-CAMPUS API Documentation',
    endpoints: {
      auth: '/api/auth/*',
      jobs: '/api/jobs/*',
      jobseekers: '/api/jobseekers/*',
      agents: '/api/agents/*',
      admin: '/api/admin/*',
      contact: '/api/contact',
      matching: '/api/matching',
      upload: '/api/upload/*'
    }
  })
})

// Dashboard pages
app.get('/dashboard', authMiddleware, DashboardIndexPage)
app.get('/dashboard/legacy', DashboardLegacyPage)

// TODO: 원본에서 복사 필요 (라인 14360-15357)
// - POST /api/auth/login
// - POST /api/auth/register
// - POST /api/auth/find-email
// - POST /api/auth/find-password
// - GET /api/profile/:userId
// - POST /api/profile
// - GET /api/profiles
// - GET /api/profile/jobseeker
// - POST /api/upload/resume
// - POST /api/upload/portfolio
// - POST /api/upload/document

// Terms, Privacy, Cookies pages
app.get('/terms', TermsPage)
app.get('/privacy', PrivacyPage)
app.get('/cookies', CookiesPage)

// Dashboard - Jobseeker
// 더 구체적인 경로를 먼저 등록해야 함
// documents 페이지는 자체적으로 인증 체크 및 리다이렉트 처리
// app.get('/dashboard/jobseeker/documents', DashboardJobseekerDocumentsPage) // Removed - use profile page instead
// app.post('/dashboard/jobseeker/documents', DashboardJobseekerDocumentsPage)
app.get('/dashboard/jobseeker', authMiddleware, DashboardJobseekerPage)

// Profile page
app.get('/profile', authMiddleware, ProfilePage)

// Company Profile page - 기업 전용
app.get('/profile/company', authMiddleware, requireCompany, CompanyProfilePage)

// Dashboard - Company - 기업 전용
app.get('/dashboard/company', authMiddleware, requireCompany, DashboardCompanyPage)

// Dashboard - Admin (간단한 버전)
app.get('/dashboard/admin', authMiddleware, requireAdmin, DashboardAdminPage)

// Admin (전체 버전)
app.get('/admin', authMiddleware, requireAdmin, AdminFullPage)

// Test upload page (개발용)
app.get('/test-upload.html', async (c) => {
  const html = await Deno.readTextFile('./test-upload.html')
  return c.html(html)
})

export default app
