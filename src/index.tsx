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

// Import middleware
import { corsMiddleware, apiCors } from './middleware/cors'

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
              <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이름을 입력해주세요">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="example@email.com">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호</label>
              <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="010-1234-5678 또는 01012345678" maxlength="13">
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
              <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required minlength="6" placeholder="최소 6자 이상">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
              <input type="password" name="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 다시 입력하세요">
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
        { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' }
      ],
      jobseeker: [
        { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
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

// CORS for API routes
app.use('/api/*', apiCors)

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/jobs', jobRoutes)
app.route('/api/jobseekers', jobseekersRoutes)

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
            <button class="text-green-600 font-medium hover:underline">자세히 보기 →</button>
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
            <button class="text-blue-600 font-medium hover:underline">자세히 보기 →</button>
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
            <button class="text-purple-600 font-medium hover:underline">자세히 보기 →</button>
          </div>
        </div>
      </main>
    </div>
  )
})

// Job Seekers page (구직정보 보기)
app.get('/jobseekers', (c) => {
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
            <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">차트 영역</p>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">국가별 구직자 분포</h3>
            <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">차트 영역</p>
            </div>
          </div>
        </div>
      </main>
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
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">WOW-CAMPUS</h1>
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
            <a href="/register" class="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              지금 시작하기 <i class="fas fa-arrow-right ml-2"></i>
            </a>
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
          <h1 class="text-4xl font-bold text-gray-900 mb-4">스마트 매칭 시스템</h1>
          <p class="text-gray-600 text-lg">AI 기반으로 최적의 구인구직 매칭을 제공합니다</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          <div class="bg-white p-8 rounded-lg shadow-sm border">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-robot text-2xl text-purple-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4">AI 매칭 알고리즘</h3>
            <p class="text-gray-600 mb-6">구직자의 기술, 경험, 선호도와 기업의 요구사항을 분석하여 최적의 매칭을 제공합니다.</p>
            <div class="text-center">
              <span class="text-purple-600 font-semibold">개발 중...</span>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-lg shadow-sm border">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-chart-line text-2xl text-green-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4">매칭 성공률</h3>
            <p class="text-gray-600 mb-6">지속적인 학습을 통해 매칭 정확도를 높이고 성공적인 취업을 지원합니다.</p>
            <div class="text-center">
              <span class="text-green-600 font-semibold">곧 출시 예정</span>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <p class="text-gray-500 mb-6">스마트 매칭 시스템은 현재 개발 중입니다.</p>
          <a href="/jobs" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4">
            구인정보 보기
          </a>
          <a href="/jobseekers" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            구직정보 보기
          </a>
        </div>
      </main>
    </div>
  )
})

// Statistics page
app.get('/statistics', (c) => {
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
          <h1 class="text-4xl font-bold text-gray-900 mb-4">플랫폼 통계</h1>
          <p class="text-gray-600 text-lg">WOW-CAMPUS의 실시간 운영 현황을 확인하세요</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-briefcase text-blue-600"></i>
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-2" data-stat="jobs">6</div>
            <div class="text-gray-600">구인공고</div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-green-600"></i>
            </div>
            <div class="text-3xl font-bold text-green-600 mb-2" data-stat="jobseekers">7</div>
            <div class="text-gray-600">구직자</div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-handshake text-purple-600"></i>
            </div>
            <div class="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div class="text-gray-600">성사된 매칭</div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-building text-orange-600"></i>
            </div>
            <div class="text-3xl font-bold text-orange-600 mb-2">3</div>
            <div class="text-gray-600">참여 기업</div>
          </div>
        </div>
        
        <div class="text-center">
          <p class="text-gray-500 mb-6">더 자세한 통계와 분석은 곧 제공될 예정입니다.</p>
          <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            홈으로 돌아가기
          </a>
        </div>
      </main>
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

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Not Found'
  }, 404)
})

export default app
