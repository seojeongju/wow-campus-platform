// WOW-CAMPUS App.js
console.log('App.js loaded from static file!');

// 번역 헬퍼 함수
const t = (key) => window.t ? window.t(key) : key;

// 전역 함수 선언 (함수 정의 전에 미리 선언하여 즉시 사용 가능하도록)


// 🔐 인증 관련 전역 변수
let authToken = localStorage.getItem('wowcampus_token');

// 🎯 통합된 인증 UI 업데이트 함수
function updateAuthUI(user = null) {
  console.log('updateAuthUI 호출됨:', user ? `${user.name || 'Unknown'} (${user.user_type || 'unknown'})` : '로그아웃 상태');

  const authButtons = document.getElementById('auth-buttons-container');
  if (!authButtons) {
    console.warn('auth-buttons-container를 찾을 수 없습니다');
    return;
  }

  if (user && user.name) {
    // 로그인 상태 UI
    console.log(`${user.name}님 로그인 상태로 UI 업데이트`);

    const dashboardConfig = {
      jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-tachometer-alt', name: t('dashboard.jobseeker') },
      company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building', name: t('dashboard.company') },
      agent: { link: '/agents', color: 'blue', icon: 'fa-handshake', name: t('dashboard.agent') },
      admin: { link: '/admin', color: 'red', icon: 'fa-chart-line', name: t('dashboard.admin') }
    };

    const config = dashboardConfig[user.user_type] || {
      link: '/', color: 'gray', icon: 'fa-home', name: t('common.home')
    };

    const userTypeColors = {
      jobseeker: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
      company: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
      agent: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
      admin: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' }
    };

    const userColors = userTypeColors[user.user_type] || userTypeColors.jobseeker;

    authButtons.innerHTML = `
      <div class="flex items-center space-x-2 ${userColors.bg} ${userColors.border} px-3 py-2 rounded-lg">
        <i class="fas fa-user ${userColors.icon}"></i>
        <span class="${userColors.text} font-medium">${user.name}님</span>
        <span class="text-xs ${userColors.text} opacity-75">(${getUserTypeLabel(user.user_type)})</span>
      </div>
      <a href="${config.link}" class="px-4 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors font-medium" title="${config.name}">
        <i class="fas ${config.icon} mr-1"></i>${t('dashboard.my_dashboard')}
      </a>
      <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium" title="${t('common.logout')}">
        <i class="fas fa-sign-out-alt mr-1"></i>${t('common.logout')}
      </button>
    `;

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

    authButtons.innerHTML = `
      <a href="/login" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium inline-flex items-center">
        <i class="fas fa-sign-in-alt mr-1"></i>${t('auth.login_title')}
      </a>
      <a href="/login" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center">
        <i class="fas fa-user-plus mr-1"></i>${t('auth.register_button')}
      </a>
    `;

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

  if (user && user.name) {
    // 로그인 상태
    const dashboardConfig = {
      jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-tachometer-alt' },
      company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building' },
      agent: { link: '/agents', color: 'blue', icon: 'fa-handshake' },
      admin: { link: '/admin', color: 'red', icon: 'fa-chart-line' }
    };

    const config = dashboardConfig[user.user_type] || { link: '/', color: 'gray', icon: 'fa-home' };
    const userInitial = user.name && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : '?';

    mobileAuthButtons.innerHTML = `
      <div class="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">${userInitial}</span>
            </div>
            <div>
              <div class="font-semibold text-gray-900 text-sm">${user.name || 'User'}</div>
              <div class="text-xs text-gray-600">${getUserTypeLabel(user.user_type)}</div>
            </div>
          </div>
        </div>
        <a href="${config.link}" class="w-full block text-center px-4 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors font-medium mb-2">
          <i class="fas ${config.icon} mr-2"></i>${t('dashboard.my_dashboard')}
        </a>
        <button onclick="handleLogout()" class="w-full px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
          <i class="fas fa-sign-out-alt mr-2"></i>${t('common.logout')}
        </button>
      </div>
    `;
    console.log('모바일 인증 UI: 로그인 상태로 업데이트');
  } else {
    // 비로그인 상태
    mobileAuthButtons.innerHTML = `
      <a href="/login" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium mb-2 text-center inline-flex items-center justify-center">
        <i class="fas fa-sign-in-alt mr-2"></i>${t('auth.login_title')}
      </a>
      <a href="/login" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center inline-flex items-center justify-center">
        <i class="fas fa-user-plus mr-2"></i>${t('auth.register_button')}
      </a>
    `;
    console.log('모바일 인증 UI: 비로그인 상태로 업데이트');
  }
}

// 사용자 타입 라벨 반환 헬퍼 함수
function getUserTypeLabel(userType) {
  const labels = {
    jobseeker: t('auth.jobseeker'),
    company: t('auth.company'),
    agent: t('auth.agent'),
    admin: t('auth.admin')
  };
  return labels[userType] || 'User';
}

// 🔐 로그인 모달 표시 → 로그인 페이지로 리다이렉트
function showLoginModal() {
  console.log('로그인 페이지로 리다이렉트');

  // 현재 페이지를 redirect 파라미터로 저장
  const currentPath = window.location.pathname + window.location.search;
  const redirectParam = currentPath !== '/' && currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : '';

  // /login 페이지로 이동
  window.location.href = `/login${redirectParam}`;
}

// 전역 함수 즉시 할당 (함수 정의 직후)
window.showLoginModal = showLoginModal;

// 📝 회원가입 모달 표시 - 로그인 페이지로 리다이렉트
function showSignupModal() {
  console.log('회원가입 버튼 클릭 - 로그인 페이지로 이동');
  window.location.href = '/login';
}

// 전역 함수 즉시 할당
window.showSignupModal = showSignupModal;

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

// 전역 함수 즉시 할당
window.closeModal = closeModal;

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
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">${t('auth.find_email')}</h2>
        <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="mb-4 text-sm text-gray-600">
        <p>${t('auth.find_email_desc')}</p>
      </div>

      <form id="findEmailForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">${t('auth.name')}</label>
          <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="${t('auth.real_name_placeholder')}">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">${t('auth.phone')}</label>
          <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="${t('auth.input_phone_placeholder')}">
        </div>

        <div class="flex space-x-3">
          <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
            ${t('common.cancel')}
          </button>
          <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            ${t('auth.find_email')}
          </button>
        </div>

        <div class="mt-4 text-center">
          <button type="button" class="back-to-login-btn text-blue-600 hover:text-blue-800 underline text-sm">
            ${t('auth.back_to_login')}
          </button>
        </div>
      </form>
    </div>
  `;

  // 페이지 스크롤 및 상호작용 비활성화
  document.body.style.overflow = 'hidden';
  document.body.classList.add('modal-open');

  document.body.appendChild(modal);

  // 모든 클릭 이벤트 완전 차단 (모달 외부)
  const stopAllEvents = function (event) {
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
  const handleEscape = function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeModal(modal);
    }
  };
  document.addEventListener('keydown', handleEscape, true);

  // 닫기 버튼 이벤트
  const closeBtn = modal.querySelector('.close-modal-btn');
  closeBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeModal(modal);
  }, true);

  // 취소 버튼 이벤트
  const cancelBtn = modal.querySelector('.cancel-btn');
  cancelBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeModal(modal);
  }, true);

  // 로그인으로 돌아가기 버튼
  const backToLoginBtn = modal.querySelector('.back-to-login-btn');
  backToLoginBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeModal(modal);
    showLoginModal();
  }, true);

  // 폼 제출 이벤트
  const findEmailForm = document.getElementById('findEmailForm');
  findEmailForm.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();
    handleFindEmail(event);
  }, true);

  // 모달 정리 함수
  modal._cleanup = function () {
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
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">${t('auth.find_password')}</h2>
        <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="mb-4 text-sm text-gray-600">
        <p>${t('auth.find_password_desc')}</p>
      </div>

      <form id="findPasswordForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">${t('auth.email')}</label>
          <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="${t('auth.email_placeholder')}">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">${t('auth.name')}</label>
          <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="${t('auth.real_name_placeholder')}">
        </div>

        <div class="flex space-x-3">
          <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
            ${t('common.cancel')}
          </button>
          <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            ${t('auth.reset_password')}
          </button>
        </div>

        <div class="mt-4 text-center">
          <button type="button" class="back-to-login-btn text-blue-600 hover:text-blue-800 underline text-sm">
            ${t('auth.back_to_login')}
          </button>
        </div>
      </form>
    </div>
  `;

  // 페이지 스크롤 및 상호작용 비활성화
  document.body.style.overflow = 'hidden';
  document.body.classList.add('modal-open');

  document.body.appendChild(modal);

  // 모든 클릭 이벤트 완전 차단 (모달 외부)
  const stopAllEvents = function (event) {
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
  const handleEscape = function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeModal(modal);
    }
  };
  document.addEventListener('keydown', handleEscape, true);

  // 닫기 버튼 이벤트
  const closeBtn = modal.querySelector('.close-modal-btn');
  closeBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeModal(modal);
  }, true);

  // 취소 버튼 이벤트
  const cancelBtn = modal.querySelector('.cancel-btn');
  cancelBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeModal(modal);
  }, true);

  // 로그인으로 돌아가기 버튼
  const backToLoginBtn = modal.querySelector('.back-to-login-btn');
  backToLoginBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeModal(modal);
    showLoginModal();
  }, true);

  // 폼 제출 이벤트
  const findPasswordForm = document.getElementById('findPasswordForm');
  findPasswordForm.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();
    handleFindPassword(event);
  }, true);

  // 모달 정리 함수
  modal._cleanup = function () {
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
  const rememberMe = formData.get('rememberMe') === 'on' || formData.get('rememberMe') === 'true';
  const credentials = {
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: rememberMe
  };

  console.log('로그인 시도:', credentials);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    console.log('로그인 API 응답:', data);

    if (data.success && data.user) {
      // Access Token 저장
      authToken = data.token;
      localStorage.setItem('wowcampus_token', authToken);
      localStorage.setItem('wowcampus_user', JSON.stringify(data.user));

      // Refresh Token도 저장 (선택사항, 쿠키에도 있지만)
      if (data.refreshToken) {
        localStorage.setItem('wowcampus_refresh_token', data.refreshToken);
      }

      // 모달 닫기
      const modalElement = event.target.closest('div[id^="loginModal"]');
      if (modalElement) {
        closeModal(modalElement);
      }

      // 성공 메시지 및 UI 업데이트
      showNotification(`✨ ${data.user.name}님, 다시 만나서 반가워요!`, 'success');
      updateAuthUI(data.user);

      // redirect 파라미터가 있으면 해당 페이지로 이동
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500); // 성공 메시지를 보여주고 이동
      } else {
        // redirect 파라미터가 없으면 홈 페이지로 이동
        setTimeout(() => {
          window.location.href = '/home';
        }, 500);
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

  // 전화번호 유효성 검증 (국제 전화번호 포함)
  const phone = formData.get('phone');
  if (phone) {
    // 허용 문자: 숫자, +, -, 공백, 괄호
    const phonePattern = /^[\d\s+\-()]+$/;
    
    // 최소 7자리, 최대 20자리 (국제 전화번호 포함)
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const digitCount = cleanPhone.replace(/\+/g, '').length;
    
    if (!phonePattern.test(phone)) {
      showNotification('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678, +82-10-1234-5678, +1-555-123-4567)', 'error');
      return;
    }
    
    if (digitCount < 7 || digitCount > 20) {
      showNotification('전화번호는 7자리 이상 20자리 이하여야 합니다.', 'error');
      return;
    }
  }

  const userData = {
    user_type: formData.get('user_type'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: phone ? phone.trim() : '', // 전화번호 (국제 형식 포함, 원본 유지)
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

            showNotification(`✨ ${t('messages.welcome').replace('{name}', loginData.user.name)}`, 'success');
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

    // 먼저 로컬 데이터 정리 (즉시 UI 업데이트)
    clearAuthData();
    updateAuthUI(null);

    // 서버에 로그아웃 요청 (토큰 무효화)
    const token = localStorage.getItem('wowcampus_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.warn('로그아웃 API 호출 실패:', error);
        // API 호출 실패해도 로컬 데이터는 이미 정리됨
      }
    }

    // 쿠키도 명시적으로 삭제 시도 (서버에서 삭제하지만 클라이언트에서도 확인)
    document.cookie = 'wowcampus_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'wowcampus_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    // 성공 메시지
    showNotification(`👋 ${t('messages.logout')}`, 'success');

    // 랜딩 페이지로 리다이렉트 (캐시 무시)
    setTimeout(() => {
      window.location.href = '/?logout=' + Date.now();
    }, 300);

  } catch (error) {
    console.error('로그아웃 에러:', error);
    // 에러가 발생해도 데이터는 정리
    clearAuthData();
    updateAuthUI(null);
    showNotification('로그아웃 중 오류가 발생했습니다.', 'error');
    // 에러 발생 시에도 리다이렉트
    setTimeout(() => {
      window.location.href = '/?logout=' + Date.now();
    }, 500);
  }
}

// 전역 함수 즉시 할당
window.handleLogout = handleLogout;

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
      showNotification(`📧 찾은 이메일: ${data.email}`, 'success');

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

// 🔄 로그인 상태 복원
async function restoreLoginState() {
  const token = localStorage.getItem('wowcampus_token');
  const userStr = localStorage.getItem('wowcampus_user');

  if (token && userStr) {
    try {
      // 토큰 유효성 검증
      const payload = parseJWT(token);
      if (!payload) {
        console.log('토큰 파싱 실패 - 로그아웃 처리');
        clearAuthData();
        updateAuthUI(null);
        return;
      }

      // 토큰 만료 확인
      if (payload.exp && Date.now() > payload.exp * 1000) {
        console.log('토큰 만료됨 - 자동 갱신 시도');
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          console.log('토큰 갱신 실패 - 로그아웃 처리');
          clearAuthData();
          updateAuthUI(null);
          return;
        }
        // 갱신 성공 시 다시 확인
        const newToken = localStorage.getItem('wowcampus_token');
        if (newToken) {
          const newPayload = parseJWT(newToken);
          if (newPayload) {
            const user = {
              id: newPayload.userId,
              email: newPayload.email,
              name: newPayload.name,
              user_type: newPayload.userType
            };
            authToken = newToken;
            window.currentUser = user;
            updateAuthUI(user);
            console.log('로그인 상태 복원됨 (갱신 후):', user.name);
            return;
          }
        }
        clearAuthData();
        updateAuthUI(null);
        return;
      }

      const user = JSON.parse(userStr);

      // 사용자 정보 유효성 검증
      if (!user || !user.name) {
        console.warn('사용자 정보가 유효하지 않음:', user);
        clearAuthData();
        updateAuthUI(null);
        return;
      }

      authToken = token;
      window.currentUser = user;
      updateAuthUI(user);
      console.log('로그인 상태 복원됨:', user.name);
    } catch (error) {
      console.error('로그인 상태 복원 실패:', error);
      clearAuthData();
      updateAuthUI(null);
    }
  } else {
    // 토큰이 없으면 모든 인증 데이터 정리
    clearAuthData();
    updateAuthUI(null);
  }
}

// 인증 데이터 정리 헬퍼 함수
function clearAuthData() {
  authToken = null;
  localStorage.removeItem('wowcampus_token');
  localStorage.removeItem('wowcampus_refresh_token');
  localStorage.removeItem('wowcampus_user');
  window.currentUser = null;
}

// 🎯 통합 네비게이션 메뉴 구성 (모든 사용자에게 동일한 단순 링크)
const unifiedMenuConfig = [
  { href: '/jobs', label: t('menu.jobs'), icon: 'fas fa-briefcase' },
  { href: '/jobseekers', label: t('menu.jobseekers'), icon: 'fas fa-user-tie' },
  { href: '/matching', label: t('menu.matching'), icon: 'fas fa-magic' },
  { href: '/global-support', label: t('menu.global'), icon: 'fas fa-globe' },
  { href: '/support', label: t('menu.customer'), icon: 'fas fa-headset' }
];

// 🎯 사용자 유형별 서비스 드롭다운 메뉴 구성
const serviceMenuConfig = {
  guest: [
    { href: '/jobs', label: t('menu.view_jobs'), icon: 'fas fa-briefcase' },
    { href: '/jobseekers', label: t('menu.view_jobseekers'), icon: 'fas fa-user-tie' },
    { href: '/study', label: t('menu.view_study'), icon: 'fas fa-graduation-cap' }
  ],
  jobseeker: [
    { href: '/jobseekers', label: t('menu.find_jobseekers'), icon: 'fas fa-user-tie' },
    { href: '/jobs', label: t('menu.find_jobs'), icon: 'fas fa-briefcase' },
    { href: '/matching', label: t('menu.matching'), icon: 'fas fa-magic' }
  ],
  company: [
    { href: '/jobs', label: t('menu.view_jobs'), icon: 'fas fa-briefcase' },
    { href: '/jobseekers', label: t('menu.view_jobseekers'), icon: 'fas fa-user-tie' },
    { href: '/study', label: t('menu.view_study'), icon: 'fas fa-graduation-cap' }
  ],
  agent: [
    { href: '/jobs', label: t('menu.view_jobs'), icon: 'fas fa-briefcase' },
    { href: '/jobseekers', label: t('menu.view_jobseekers'), icon: 'fas fa-user-tie' },
    { href: '/study', label: t('menu.view_study'), icon: 'fas fa-graduation-cap' },
    { href: '/agents', label: t('menu.agent_dash'), icon: 'fas fa-handshake' }
  ],
  admin: [
    { href: '/jobs', label: t('menu.view_jobs'), icon: 'fas fa-briefcase' },
    { href: '/jobseekers', label: t('menu.view_jobseekers'), icon: 'fas fa-user-tie' },
    { href: '/study', label: t('menu.view_study'), icon: 'fas fa-graduation-cap' },
    { href: '/agents', label: t('menu.agent_dash'), icon: 'fas fa-handshake' }
  ]
};

// 🎯 통합 네비게이션 메뉴 업데이트 함수 (사용자 타입에 따라 메뉴 필터링)
function updateNavigationMenu(user = null) {
  console.log('updateNavigationMenu 호출됨:', user ? `${user.name} (${user.user_type})` : '비로그인 상태');

  const navigationMenu = document.getElementById('navigation-menu-container');
  if (!navigationMenu) {
    console.warn('navigation-menu-container를 찾을 수 없습니다');
    return;
  }

  const currentPath = window.location.pathname;

  // 중복 실행 방지
  if (navigationMenu.dataset.updated === 'true' && navigationMenu.innerHTML.trim() !== '') {
    console.log('네비게이션 메뉴가 이미 업데이트되었습니다.');
    return;
  }

  // 기본 메뉴 구성
  let menus = [...unifiedMenuConfig];

  // 관리자만 통계 메뉴 추가
  if (user && user.user_type === 'admin') {
    menus.push({ href: '/statistics', label: t('menu.statistics'), icon: 'fas fa-chart-bar' });
  }

  // 통합 메뉴 HTML 생성
  const menuHtml = menus.map(menu => {
    const isActive = currentPath === menu.href;
    const activeClass = isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600 transition-colors font-medium';
    return `
      <a href="${menu.href}" class="${activeClass}">
        <i class="${menu.icon} mr-1"></i>${menu.label}
      </a>
    `;
  }).join('');

  navigationMenu.innerHTML = menuHtml;
  navigationMenu.dataset.updated = 'true';

  console.log(`통합 네비게이션 메뉴 업데이트 완료 (${user ? user.user_type : 'guest'} - 메뉴 ${menus.length}개)`);
}

// 🎯 서비스 드롭다운 메뉴 업데이트 함수 (메인 페이지용)
function updateServiceDropdownMenu(user = null) {
  console.log('updateServiceDropdownMenu 호출됨:', user ? `${user.name} (${user.user_type})` : '비로그인 상태');

  // 데스크톱 서비스 드롭다운 메뉴 업데이트
  const serviceDropdown = document.getElementById('service-dropdown-container');
  if (serviceDropdown) {
    const userType = user ? user.user_type : 'guest';
    const serviceMenus = serviceMenuConfig[userType] || serviceMenuConfig.guest;

    const serviceHtml = serviceMenus.map(menu => `
      <a href="${menu.href}" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
        <i class="${menu.icon} mr-2"></i>${menu.label}
      </a>
    `).join('');

    serviceDropdown.innerHTML = serviceHtml;
    console.log(`데스크톱 서비스 메뉴 업데이트 완료 (메뉴 ${serviceMenus.length}개)`);

    // 동적으로 생성된 링크에 로그인 체크 적용
    if (typeof setupAuthCheckForLinks === 'function') {
      setTimeout(() => setupAuthCheckForLinks(), 100);
    }
  }

  // 모바일 서비스 메뉴 업데이트
  const mobileServiceMenu = document.getElementById('mobile-service-menu-container');
  if (mobileServiceMenu) {
    const userType = user ? user.user_type : 'guest';
    const serviceMenus = serviceMenuConfig[userType] || serviceMenuConfig.guest;

    const mobileServiceHtml = serviceMenus.map(menu => `
      <a href="${menu.href}" class="block pl-4 py-2 text-gray-600 hover:text-blue-600">
        <i class="${menu.icon} mr-2"></i>${menu.label}
      </a>
    `).join('');

    mobileServiceMenu.innerHTML = mobileServiceHtml;
    console.log(`모바일 서비스 메뉴 업데이트 완료 (메뉴 ${serviceMenus.length}개)`);

    // 동적으로 생성된 링크에 로그인 체크 적용
    if (typeof setupAuthCheckForLinks === 'function') {
      setTimeout(() => setupAuthCheckForLinks(), 100);
    }
  }
}

// 📱 모바일 인증 버튼 업데이트 함수
function updateMobileAuthButtons() {
  const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
  if (!mobileAuthButtons) return;

  const user = window.currentUser;

  if (user) {
    // 로그인 상태: 사용자 정보, 대시보드, 로그아웃 버튼 표시
    const dashboardConfig = {
      jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-tachometer-alt' },
      company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building' },
      agent: { link: '/agents', color: 'blue', icon: 'fa-handshake' },
      admin: { link: '/dashboard/admin', color: 'red', icon: 'fa-chart-line' }
    };

    const config = dashboardConfig[user.user_type] || { link: '/', color: 'gray', icon: 'fa-home' };

    mobileAuthButtons.innerHTML = `
      <div class="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">${user.name.charAt(0)}</span>
            </div>
            <div>
              <div class="font-semibold text-gray-900 text-sm">${user.name}</div>
              <div class="text-xs text-gray-600">${getUserTypeLabel(user.user_type)}</div>
            </div>
          </div>
        </div>
        <a href="${config.link}" class="w-full block text-center px-4 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors font-medium mb-2">
          <i class="fas ${config.icon} mr-2"></i>내 대시보드
        </a>
        <button onclick="handleLogout()" class="w-full px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
          <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
        </button>
      </div>
    `;
    console.log('모바일 인증 버튼: 로그인 상태로 업데이트 (대시보드 포함)');
  } else {
    // 비로그인 상태: 로그인/회원가입 버튼 표시
    mobileAuthButtons.innerHTML = `
      <button onclick="showLoginModal()" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium mb-2">
        <i class="fas fa-sign-in-alt mr-2"></i>로그인
      </button>
      <button onclick="showSignupModal()" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        <i class="fas fa-user-plus mr-2"></i>회원가입
      </button>
    `;
    console.log('모바일 인증 버튼: 비로그인 상태로 업데이트');
  }
}

// 📱 DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', async function () {
  console.log('DOMContentLoaded - WOW-CAMPUS 초기화 중...');

  // URL에 logout 파라미터가 있으면 인증 데이터 정리
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('logout')) {
    console.log('로그아웃 파라미터 감지 - 인증 데이터 정리');
    clearAuthData();
    updateAuthUI(null);
    // URL에서 logout 파라미터 제거
    const newUrl = window.location.pathname + (window.location.search.replace(/[?&]logout=[^&]*/, '').replace(/^&/, '?') || '');
    window.history.replaceState({}, '', newUrl);
    return;
  }

  // 로그인 상태 복원
  await restoreLoginState();

  // URL 파라미터 체크 - 로그인/회원가입 요청 처리
  const action = urlParams.get('action');
  if (action === 'login') {
    console.log('URL에서 로그인 요청 감지');
    setTimeout(() => showLoginModal(), 500);
  } else if (action === 'signup') {
    console.log('URL에서 회원가입 요청 감지');
    setTimeout(() => showSignupModal(), 500);
  }

  // 동적 메뉴 초기화 (restoreLoginState에서 이미 updateAuthUI가 호출되어 window.currentUser가 설정됨)
  const currentUser = window.currentUser;
  if (currentUser && currentUser.name) {
    updateNavigationMenu(currentUser);
    updateServiceDropdownMenu(currentUser);
  } else {
    updateNavigationMenu(null);
    updateServiceDropdownMenu(null);
  }

  // 📱 모바일 네비게이션 메뉴 업데이트 함수
  function updateMobileNavigationMenu() {
    const mobileNavMenu = document.getElementById('mobile-navigation-menu');
    if (!mobileNavMenu) {
      console.warn('mobile-navigation-menu를 찾을 수 없습니다');
      return;
    }

    const currentPath = window.location.pathname;
    const currentUser = window.currentUser;

    // 기본 메뉴 구성
    let menus = [...unifiedMenuConfig];

    // 관리자만 통계 메뉴 추가
    if (currentUser && currentUser.user_type === 'admin') {
      menus.push({ href: '/statistics', label: t('menu.statistics'), icon: 'fas fa-chart-bar' });
    }

    // 통합 메뉴 HTML 생성 (모바일용)
    const mobileMenuHtml = menus.map(menu => {
      const isActive = currentPath === menu.href;
      const activeClass = isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700';
      return `
        <a href="${menu.href}" class="block px-4 py-3 rounded-lg ${activeClass} hover:bg-gray-50 transition-colors">
          <i class="${menu.icon} mr-3"></i>${menu.label}
        </a>
      `;
    }).join('');

    mobileNavMenu.innerHTML = mobileMenuHtml;
    console.log('모바일 네비게이션 메뉴 업데이트 완료');
  }

  // 📱 모바일 메뉴 토글 기능 초기화
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      const isHidden = mobileMenu.classList.contains('hidden');

      if (isHidden) {
        // 메뉴 열기
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.innerHTML = '<i class="fas fa-times text-2xl"></i>';
        console.log('모바일 메뉴 열림');

        // 모바일 네비게이션 메뉴 업데이트
        updateMobileNavigationMenu();

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
    listContainer.innerHTML = `
        <div class="text-center py-12">
          <div class="max-w-md mx-auto">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-lock text-yellow-600 text-2xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">${t('auth.login_required_title')}</h3>
            <p class="text-gray-600 mb-6">
              ${t('auth.login_required_desc')}
            </p>
            <div class="space-y-3">
              <button onclick="showLoginModal()" class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-sign-in-alt mr-2"></i>${t('auth.login_btn')}
              </button>
              <button onclick="showSignupModal()" class="w-full px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                <i class="fas fa-user-plus mr-2"></i>${t('auth.signup_btn')}
              </button>
            </div>
          </div>
        </div>
      `;
    return;
  }

  // 로딩 표시
  listContainer.innerHTML = `
    <div class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-600">${t('jobseeker.list_loading')}</p>
    </div>
  `;

  try {
    const response = await authenticatedFetch('/api/jobseekers?limit=20&offset=0', {
      method: 'GET'
    });

    // 응답 상태 확인
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
      console.error('구직자 목록 API 오류:', response.status, errorData);

      if (response.status === 401) {
        console.log('인증 실패 - 로그인 필요');
        listContainer.innerHTML = `
          <div class="text-center py-12">
            <div class="max-w-md mx-auto">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-exclamation-circle text-red-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">${t('auth.auth_expired')}</h3>
              <p class="text-gray-600 mb-6">
                ${t('auth.re_login_desc')}
              </p>
              <button onclick="localStorage.removeItem('wowcampus_token'); localStorage.removeItem('wowcampus_user'); showLoginModal();" 
                      class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-sign-in-alt mr-2"></i>${t('auth.re_login_btn')}
              </button>
            </div>
          </div>
        `;
        return;
      }

      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('구직자 목록 API 응답:', data);

    // 응답 구조 처리 (여러 형태 지원)
    let jobseekers = null;
    if (data.success) {
      // {success: true, data: [...], total: ..., page: ..., limit: ...} 형태 (페이지네이션)
      if (data.data && Array.isArray(data.data)) {
        jobseekers = data.data;
      } else if (data.jobseekers && Array.isArray(data.jobseekers)) {
        jobseekers = data.jobseekers;
      } else if (data.results && Array.isArray(data.results)) {
        jobseekers = data.results;
      }
    } else if (Array.isArray(data)) {
      // 직접 배열 형태
      jobseekers = data;
    } else if (data.jobseekers && Array.isArray(data.jobseekers)) {
      // {jobseekers: [...]} 형태
      jobseekers = data.jobseekers;
    } else if (data.data && Array.isArray(data.data)) {
      // {data: [...]} 형태
      jobseekers = data.data;
    }

    console.log('추출된 구직자 데이터:', jobseekers);

    if (jobseekers && Array.isArray(jobseekers)) {

      if (jobseekers.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-12">
            <i class="fas fa-user-slash text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">${t('home.latest_jobseekers_empty')}</p>
          </div>
        `;
        return;
      }

      // 구직자 목록 생성
      const jobseekersHtml = jobseekers.map(jobseeker => {
        const flagIcon = getFlagIcon(jobseeker.nationality);
        const visaStatus = getVisaStatusBadge(jobseeker.visa_status);
        const koreanLevel = getKoreanLevelBadge(jobseeker.korean_level);

        return `
          <div class="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md cursor-pointer" onclick="showJobSeekerDetail(${jobseeker.id})">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-green-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">${jobseeker.name}</h3>
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <span class="flex items-center">
                      ${flagIcon}
                      <span class="ml-1">${jobseeker.nationality || t('jobseeker.no_info')}</span>
                    </span>
                    <span>•</span>
                    <span>${jobseeker.experience || t('jobseeker.no_exp')}</span>
                  </div>
                </div>
              </div>
              <div class="flex flex-col space-y-2">
                ${visaStatus}
                ${koreanLevel}
              </div>
            </div>

            <div class="mb-4">
              <div class="text-sm text-gray-600 mb-2">
                <strong>전공/분야:</strong> ${jobseeker.major || jobseeker.field || '정보없음'}
              </div>
              ${jobseeker.skills ? `
                <div class="flex flex-wrap gap-1 mb-2">
                  ${jobseeker.skills.split(',').slice(0, 4).map(skill =>
          `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${skill.trim()}</span>`
        ).join('')}
                </div>
              ` : ''}
              ${jobseeker.introduction ? `
                <p class="text-sm text-gray-700 line-clamp-2">${jobseeker.introduction}</p>
              ` : ''}
            </div>

            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center space-x-4 text-gray-500">
                ${jobseeker.location ? `
                  <span class="flex items-center">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    ${jobseeker.location}
                  </span>
                ` : ''}
                ${jobseeker.salary_expectation ? `
                  <span class="flex items-center">
                    <i class="fas fa-won-sign mr-1"></i>
                    ${jobseeker.salary_expectation}
                  </span>
                ` : ''}
              </div>
              <button onclick="event.stopPropagation(); showJobSeekerDetail(${jobseeker.id})" class="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                ${t('common.view_details')} <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      listContainer.innerHTML = jobseekersHtml;
      console.log(`구직자 목록 로딩 완료: ${jobseekers.length}명`);

    } else {
      throw new Error(data.message || '구직자 목록을 불러올 수 없습니다.');
    }

  } catch (error) {
    console.error('구직자 목록 로딩 오류:', error);
    listContainer.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
        <p class="text-red-600">구직자 목록을 불러올 수 없습니다.</p>
        <button onclick="loadJobSeekers()" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          다시 시도
        </button>
      </div>
    `;
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
  return visaStatus ? `<span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">${visaStatus}</span>` : '';
}

function getKoreanLevelBadge(koreanLevel) {
  const levels = {
    'beginner': '초급', 'elementary': '초중급', 'intermediate': '중급',
    'advanced': '고급', 'native': '원어민'
  };
  const label = levels[koreanLevel] || koreanLevel;
  return label ? `<span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">한국어 ${label}</span>` : '';
}

// 구직자 상세 보기 함수 - 상세 페이지로 이동
function showJobSeekerDetail(id) {
  console.log(`구직자 상세보기: ${id}`);
  window.location.href = `/jobseekers/${id}`;
}

// 🚀 스마트 온보딩 플로우 시스템

// 메인 온보딩 시작 함수
function startOnboarding() {
  console.log('🚀 온보딩 플로우 시작');

  // URL 파라미터 확인 - register 파라미터가 있으면 리다이렉트하지 않음
  const urlParams = new URLSearchParams(window.location.search);
  const registerType = urlParams.get('register');

  // register 파라미터가 있으면 사용자 유형 선택 모달을 건너뛰고 바로 해당 유형의 회원가입 폼 표시
  if (registerType) {
    console.log('register 파라미터가 있어서 바로 회원가입 폼을 표시합니다:', registerType);
    // 유효한 사용자 유형인지 확인
    const validTypes = ['company', 'jobseeker', 'agent'];
    if (validTypes.includes(registerType)) {
      // 바로 해당 유형의 회원가입 폼 표시
      showSignupForm(registerType);
      return;
    }
  }

  // 이미 로그인된 사용자인지 확인
  const user = getCurrentUser();
  if (user) {
    // register 파라미터가 없으면 기존대로 대시보드로 이동
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

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in" onclick="closeOnboardingModal('${modalId}')"></div>
    <div class="bg-white rounded-xl shadow-2xl p-4 sm:p-8 m-4 max-w-4xl w-full animate-scale-in relative z-10 max-h-[90vh] overflow-y-auto">
      <div class="text-center mb-6 sm:mb-8">
        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-users text-blue-600 text-xl sm:text-2xl"></i>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">${t('onboarding.title')}</h2>
        <p class="text-sm sm:text-base text-gray-600">${t('onboarding.subtitle')}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="user-type-card border-2 border-gray-200 rounded-lg p-4 sm:p-6 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-200 active:scale-95" 
             onclick="selectUserType('jobseeker')">
          <div class="text-center">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <i class="fas fa-user-tie text-green-600 text-xl sm:text-2xl"></i>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">${t('auth.jobseeker')}</h3>
            <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">${t('onboarding.jobseeker_desc')}</p>
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
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">${t('auth.company')}</h3>
            <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">${t('onboarding.company_desc')}</p>
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
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">${t('auth.agent')}</h3>
            <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">${t('onboarding.agent_desc')}</p>
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
        <button onclick="closeOnboardingModal('${modalId}')" 
                class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mr-4">
          ${t('onboarding.do_later')}
        </button>
        <p class="text-xs text-gray-500 mt-4">${t('onboarding.change_later_desc')}</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 애니메이션을 위한 스타일 추가
  if (!document.querySelector('#onboarding-styles')) {
    const style = document.createElement('style');
    style.id = 'onboarding-styles';
    style.textContent = `
      .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      .animate-scale-in { animation: scaleIn 0.3s ease-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      .user-type-card:hover { transform: translateY(-4px); }
    `;
    document.head.appendChild(style);
  }
}

// 사용자 유형 선택 처리
function selectUserType(userType) {
  console.log('선택된 사용자 유형:', userType);

  // event가 있으면 카드 하이라이트 처리 (이벤트 핸들러에서 호출된 경우)
  if (typeof event !== 'undefined' && event && event.currentTarget) {
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
  } else {
    // event가 없으면 바로 회원가입 폼 표시 (직접 호출된 경우)
    console.log('직접 호출됨 - 바로 회원가입 폼 표시');
    // 기존 온보딩 모달이 있으면 닫기
    const existingModal = document.querySelector('[id*="userTypeModal"]');
    if (existingModal) {
      closeOnboardingModal();
    }
    // 바로 회원가입 폼 표시
    setTimeout(() => {
      showSignupForm(userType);
    }, 100);
  }
}

// 2단계: 맞춤형 회원가입 폼 표시
function showSignupForm(userType) {
  console.log('2단계: 회원가입 폼 표시 - 유형:', userType);

  const userTypeLabels = {
    jobseeker: t('auth.jobseeker'),
    company: t('auth.company'),
    agent: t('auth.agent')
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

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in" onclick="closeOnboardingModal('${modalId}')"></div>
    <div class="bg-white rounded-xl shadow-2xl p-4 sm:p-8 m-4 max-w-md w-full animate-scale-in relative z-10 max-h-[90vh] overflow-y-auto">
      <div class="text-center mb-6">
        <div class="inline-flex items-center ${colors.bg} ${colors.text} px-4 py-2 rounded-full text-sm font-medium mb-4">
          <i class="fas fa-user mr-2"></i>${label} ${t('auth.register_button')}
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">${t('auth.signup_welcome')}</h2>
        <p class="text-gray-600 text-sm">${t('auth.signup_desc')}</p>
      </div>

      <form id="onboarding-signup-form" onsubmit="handleOnboardingSignup(event, '${userType}')">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${t('auth.email')}</label>
            <input type="email" name="email" required 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="${t('auth.email_placeholder')}">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${t('auth.password')}</label>
            <input type="password" name="password" required minlength="6"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="${t('auth.password_min_length')}">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${t('auth.password_confirm')}</label>
            <input type="password" name="confirmPassword" required minlength="6"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="${t('auth.password_confirm_placeholder')}">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${t('auth.name')}</label>
            <input type="text" name="name" required 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="${t('auth.real_name_placeholder')}">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${t('auth.phone')}</label>
            <input type="tel" name="phone" required 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="${t('auth.input_phone_placeholder')}">
          </div>

          ${userType !== 'agent' ? `
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ${t('auth.agent_select_label')}
            </label>
            <select name="agent_id" id="agent-select-${userType}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">${t('auth.no_agent')}</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">${t('auth.agent_select_help')}</p>
          </div>
          ` : ''}

          ${userType !== 'jobseeker' ? `
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ${userType === 'agent' ? t('auth.activity_area') : t('auth.residence')}
            </label>
            <select name="location" required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              ${userType === 'agent' ? `
                <option value="">${t('auth.select_region')}</option>
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
              ` : `
                <option value="">${t('auth.select_region')}</option>
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
              `}
            </select>
          </div>
          ` : ''}
        </div>

        <div class="mt-6">
          <button type="submit" 
                  class="w-full ${colors.button} text-white py-3 rounded-lg font-semibold transition-colors">
            <i class="fas fa-user-plus mr-2"></i>${t('auth.create_account')}
          </button>
        </div>

        <div class="mt-4 text-center">
          <button type="button" onclick="closeOnboardingModal('${modalId}')" 
                  class="text-gray-600 hover:text-gray-800 text-sm">
            ${t('auth.signup_later')}
          </button>
        </div>
      </form>
    </div>
  `;

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
      const select = document.getElementById(`agent-select-${userType}`);
      console.log('Select 요소:', select);

      if (select) {
        result.agents.forEach(agent => {
          const option = document.createElement('option');
          option.value = agent.id;
          const regions = Array.isArray(agent.primary_regions) ? agent.primary_regions.join(', ') : '';
          option.textContent = `${agent.agency_name || agent.user_name}${regions ? ' - ' + regions : ''}`;
          select.appendChild(option);
        });
        console.log(`${result.agents.length}개의 에이전트 옵션 추가됨`);
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
    toast.error(t('auth.password_mismatch'));
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
    submitButton.innerHTML = `<i class="fas fa-user-plus mr-2"></i>${t('auth.create_account')}`;
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

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in"></div>
    <div class="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full animate-scale-in relative z-10">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-check text-green-600 text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">${info.title}</h2>
        <p class="text-gray-600">${info.description}</p>
      </div>

      <div class="space-y-3 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">다음 단계를 진행해보세요:</h3>
        ${info.nextSteps.map(step => `
          <button onclick="${step.action}()" 
                  class="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <i class="fas ${step.icon} text-blue-600"></i>
            </div>
            <span class="font-medium text-gray-900">${step.text}</span>
            <i class="fas fa-arrow-right ml-auto text-gray-400"></i>
          </button>
        `).join('')}
      </div>

      <div class="text-center">
        <button onclick="goToDashboard('${info.dashboard}')" 
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3">
          <i class="fas fa-tachometer-alt mr-2"></i>대시보드로 이동
        </button>
        <button onclick="closeOnboardingModal('${modalId}')" 
                class="text-gray-600 hover:text-gray-800 text-sm">
          나중에 둘러보기
        </button>
      </div>
    </div>
  `;

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
  const selectedContent = document.getElementById(`${tabName}-tab`);
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

  const user = await getCurrentUser();
  if (!user) {
    console.error('인증 토큰이 없습니다');
    showNotification('로그인이 필요합니다.', 'error');
    return;
  }

  try {
    const response = await authenticatedFetch('/api/profile/jobseeker', {
      method: 'GET'
    });

    const data = await response.json();
    console.log('프로필 로드 응답:', data);

    if (data.success) {
      fillProfileForm(data.data);
      updateProfileCompletion(data.data);
    } else {
      console.error('프로필 로드 실패:', data.message);
      if (response.status === 401) {
        showNotification('인증이 만료되었습니다. 다시 로그인해주세요.', 'error');
      } else {
        showNotification(data.message || '프로필 로드에 실패했습니다.', 'error');
      }
    }

  } catch (error) {
    console.error('프로필 로드 오류:', error);
    showNotification(error.message || '프로필 로드 중 오류가 발생했습니다.', 'error');
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
    const fullName = `${profileData.first_name} ${profileData.last_name || ''}`.trim();
    nameElement.textContent = fullName || '사용자명';
  }

  if (emailElement && window.currentUser) {
    emailElement.textContent = window.currentUser.email || '이메일';
  }
}

// 프로필 저장
async function saveProfile() {
  console.log('=== 프로필 저장 시작 ===');

  const user = await getCurrentUser();
  console.log('현재 사용자:', user);

  if (!user) {
    showNotification('로그인이 필요합니다.', 'error');
    return;
  }

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

    const response = await authenticatedFetch('/api/profile/jobseeker', {
      method: 'POST',
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

  const user = await getCurrentUser();
  if (!user) {
    showNotification('로그인이 필요합니다.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('resume', file);

  try {
    showNotification('이력서 업로드 중...', 'info');

    const response = await authenticatedFetch('/api/upload/resume', {
      method: 'POST',
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

  const user = await getCurrentUser();
  if (!user) {
    showNotification('로그인이 필요합니다.', 'error');
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('portfolio', files[i]);
  }

  try {
    showNotification('포트폴리오 업로드 중...', 'info');

    const response = await authenticatedFetch('/api/upload/portfolio', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('포트폴리오 업로드 응답:', data);

    if (data.success) {
      showNotification(`포트폴리오 ${data.data.length}개 파일이 업로드되었습니다!`, 'success');
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
  console.log(`${documentType} 업로드 함수 호출`);

  const input = document.getElementById(inputId);
  const file = input?.files[0];

  if (!file) {
    showNotification('파일을 선택해 주세요.', 'warning');
    return;
  }

  const user = await getCurrentUser();
  if (!user) {
    showNotification('로그인이 필요합니다.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('document', file);
  formData.append('type', documentType);

  try {
    showNotification('문서 업로드 중...', 'info');

    const response = await authenticatedFetch('/api/upload/document', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log(`${documentType} 업로드 응답:`, data);

    if (data.success) {
      showNotification('문서가 성공적으로 업로드되었습니다!', 'success');
      updateDocumentDisplay(documentType, data.data);
    } else {
      showNotification(data.message || '문서 업로드에 실패했습니다.', 'error');
    }

  } catch (error) {
    console.error(`${documentType} 업로드 오류:`, error);
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

  const user = await getCurrentUser();
  if (!user) {
    showNotification('로그인이 필요합니다.', 'error');
    return;
  }

  try {
    const response = await authenticatedFetch('/api/profile/jobseeker', {
      method: 'POST',
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
    statusElement.textContent = `프로필 완성도: ${totalPercent}%`;

    if (totalPercent >= 80) {
      statusElement.className = 'inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-2';
    } else if (totalPercent >= 50) {
      statusElement.className = 'inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-2';
    } else {
      statusElement.className = 'inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mt-2';
    }
  }

  console.log(`프로필 완성도: ${totalPercent}% (필수: ${completedEssential}/${essentialFields.length}, 선택: ${completedOptional}/${optionalFields.length})`);
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
  console.log(`${documentType} 업로드 완료:`, fileData);
  // TODO: UI에 업로드된 문서 정보 표시
}

// 🚀 페이지 로드 시 초기화
async function initializePage() {
  console.log('페이지 초기화 시작');

  // restoreLoginState()가 이미 호출되었으므로 window.currentUser 확인
  // 또는 getCurrentUser()를 await로 호출
  let user = window.currentUser;

  if (!user) {
    user = await getCurrentUser();
    if (user) {
      window.currentUser = user;
    }
  }

  if (user && user.name) {
    console.log('로그인된 사용자:', user);

    // 전역 변수에 사용자 정보 저장 (이미 설정되었을 수 있음)
    window.currentUser = user;

    // 사용자 정보로 UI 업데이트 (restoreLoginState에서 이미 호출되었을 수 있지만 다시 확인)
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
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 파싱 오류:', error);
    return null;
  }
}

// 토큰 자동 갱신 함수
async function refreshAccessToken() {
  try {
    console.log('토큰 자동 갱신 시도...');
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success && data.token) {
      // 새 토큰을 localStorage에 저장
      localStorage.setItem('wowcampus_token', data.token);
      authToken = data.token;
      console.log('토큰 갱신 성공');
      return true;
    } else {
      console.warn('토큰 갱신 실패:', data.message);
      // Refresh Token도 만료된 경우 로그아웃 처리
      handleLogout();
      return false;
    }
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    handleLogout();
    return false;
  }
}

// 🔄 인증이 필요한 API 호출 래퍼 (자동 토큰 갱신 및 재시도)
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('wowcampus_token');

  // 기본 헤더 설정 (FormData인 경우 Content-Type을 설정하지 않음)
  const headers = { ...options.headers };

  // FormData가 아닌 경우에만 Content-Type 설정
  if (!(options.body instanceof FormData)) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  // 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 첫 번째 시도
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  // 401 에러 발생 시 토큰 갱신 후 재시도
  if (response.status === 401) {
    console.log('401 에러 발생 - 토큰 갱신 시도');
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // 새 토큰으로 재시도
      const newToken = localStorage.getItem('wowcampus_token');
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        console.log('토큰 갱신 후 재시도');
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include'
        });
      }
    } else {
      // 토큰 갱신 실패 - 로그아웃 처리됨
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
  }

  return response;
}

// 토큰이 곧 만료되는지 확인 (5분 이내)
function isTokenExpiringSoon(payload) {
  if (!payload || !payload.exp) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = payload.exp - now;
  return timeRemaining > 0 && timeRemaining < 5 * 60; // 5분 이내
}

// 현재 사용자 정보 가져오기 (전역 함수) - 자동 갱신 포함
async function getCurrentUser() {
  // 먼저 localStorage에서 사용자 정보 확인 (더 빠르고 안정적)
  const userStr = localStorage.getItem('wowcampus_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const token = localStorage.getItem('wowcampus_token');

      // 토큰이 있으면 토큰 유효성도 확인
      if (token) {
        const payload = parseJWT(token);
        if (payload && payload.exp && Date.now() < payload.exp * 1000) {
          // 토큰이 유효하면 사용자 정보 반환
          console.log('getCurrentUser - localStorage에서 사용자 정보 반환:', user.name);
          return user;
        }
      }

      // 토큰이 없거나 만료되었지만 사용자 정보는 있으면 반환 (restoreLoginState에서 처리)
      console.log('getCurrentUser - localStorage에서 사용자 정보 반환 (토큰 확인 필요):', user.name);
      return user;
    } catch (error) {
      console.error('getCurrentUser - 사용자 정보 파싱 실패:', error);
    }
  }

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
      console.log('토큰이 만료되었습니다. 자동 갱신 시도...');
      // 만료된 경우 자동 갱신 시도
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // 갱신 성공 시 재귀 호출
        return await getCurrentUser();
      }
      return null;
    }

    // 토큰이 곧 만료되는 경우 (5분 이내) 자동 갱신
    if (isTokenExpiringSoon(payload)) {
      console.log('토큰이 곧 만료됩니다. 자동 갱신 시도...');
      // 백그라운드에서 갱신 (비동기)
      refreshAccessToken().catch(err => console.error('백그라운드 토큰 갱신 실패:', err));
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
  const checkboxes = document.querySelectorAll(`input[type="checkbox"]`);
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
    const response = await fetch(`/api/partner-universities?${params}`);
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

// 배열을 랜덤으로 섞는 함수 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
  const shuffled = [...array]; // 원본 배열 복사
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

  // 대학교 리스트를 랜덤으로 섞기
  const shuffledUniversities = shuffleArray(universities);

  emptyState.classList.add('hidden');
  container.innerHTML = shuffledUniversities.map(uni => `
    <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold text-2xl">${uni.name.charAt(0)}</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">${uni.name}</h3>
              <p class="text-sm text-gray-600">${uni.englishName || ''}</p>
              <div class="flex items-center mt-1">
                <i class="fas fa-map-marker-alt text-gray-400 text-xs mr-1"></i>
                <span class="text-xs text-gray-500">${uni.region}</span>
                <span class="mx-2 text-gray-300">|</span>
                <div class="flex items-center">
                  <i class="fas fa-star text-yellow-400 text-xs mr-1"></i>
                  <span class="text-xs text-gray-500">국내 ${uni.ranking}위</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-sm text-gray-600 mb-4 line-clamp-2">${uni.description}</p>

        <div class="mb-4">
          <div class="flex flex-wrap gap-1 mb-2">
            ${uni.majors.slice(0, 3).map(major => `
              <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">${major}</span>
            `).join('')}
            ${uni.majors.length > 3 ? `<span class="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">+${uni.majors.length - 3}개</span>` : ''}
          </div>
          <div class="flex flex-wrap gap-1">
            ${uni.languageCourse ? '<span class="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">어학연수</span>' : ''}
            ${uni.undergraduateCourse ? '<span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">학부과정</span>' : ''}
            ${uni.graduateCourse ? '<span class="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">대학원과정</span>' : ''}
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-users text-gray-400 w-4 mr-2"></i>
            <span>재학생 ${uni.studentCount.toLocaleString()}명 (외국인 ${uni.foreignStudentCount.toLocaleString()}명)</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-won-sign text-gray-400 w-4 mr-2"></i>
            <span>${uni.tuitionFee}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-handshake text-gray-400 w-4 mr-2"></i>
            <span>${uni.partnershipType}</span>
          </div>
        </div>

        <div class="border-t pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button onclick="showUniversityModal(${uni.id})" 
                      class="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                상세보기
              </button>
              <a href="${uni.website}" target="_blank" 
                 class="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors inline-flex items-center">
                홈페이지 <i class="fas fa-external-link-alt ml-1 text-xs"></i>
              </a>
            </div>
            ${uni.dormitory ? '<i class="fas fa-home text-green-500 text-sm" title="기숙사 제공"></i>' : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
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

  modal.innerHTML = `
    <div class="modal-content bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-xl">${uni.name.charAt(0)}</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">${uni.name}</h2>
            <p class="text-sm text-gray-600">${uni.englishName || ''}</p>
          </div>
        </div>
        <button onclick="if(window.closeUniversityModal) window.closeUniversityModal();" class="text-gray-400 hover:text-gray-600">
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
                <span class="font-medium">${uni.establishedYear}년</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">위치</span>
                <span class="font-medium">${uni.region}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">국내 순위</span>
                <span class="font-medium">${uni.ranking}위</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">총 재학생</span>
                <span class="font-medium">${uni.studentCount.toLocaleString()}명</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">외국인 학생</span>
                <span class="font-medium">${uni.foreignStudentCount.toLocaleString()}명</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-3">학비 및 비용</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">등록금</span>
                <span class="font-medium">${uni.tuitionFee || '문의'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">기숙사비</span>
                <span class="font-medium">${uni.dormitoryFee || '문의'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">기숙사</span>
                <span class="font-medium">${uni.dormitory ? '제공' : '미제공'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">협력 형태</span>
                <span class="font-medium">${uni.partnershipType || '교환학생'}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">대학 소개</h3>
          <p class="text-gray-600 leading-relaxed">${uni.description}</p>
        </div>

        ${uni.features && uni.features.length > 0 ? `
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">주요 특징</h3>
          <div class="grid md:grid-cols-2 gap-2">
            ${uni.features.map(feature => `
              <div class="flex items-center space-x-2">
                <i class="fas fa-check text-green-500"></i>
                <span class="text-gray-600">${feature}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-lg font-semibold mb-3">개설 전공</h3>
            <div class="flex flex-wrap gap-2">
              ${uni.majors && uni.majors.length > 0 ? uni.majors.map(major => `
                <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">${major}</span>
              `).join('') : '<span class="text-gray-400 text-sm">정보 없음</span>'}
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-3">모집 과정</h3>
            <div class="flex flex-wrap gap-2">
              ${uni.languageCourse ? '<span class="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">어학연수</span>' : ''}
              ${uni.undergraduateCourse ? '<span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">학부과정</span>' : ''}
              ${uni.graduateCourse ? '<span class="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">대학원과정</span>' : ''}
            </div>
          </div>
        </div>

        ${uni.scholarships ? `
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">장학금 정보</h3>
          <div class="p-4 bg-yellow-50 rounded-lg">
            <p class="text-yellow-900">${uni.scholarships}</p>
          </div>
        </div>
        ` : ''}

        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-lg font-semibold mb-3">지원 요건</h3>
            <div class="space-y-2">
              ${uni.koreanRequirement ? `
                <div class="flex items-start space-x-2">
                  <i class="fas fa-language text-blue-500 mt-1"></i>
                  <div>
                    <span class="text-sm font-medium text-gray-700">한국어: </span>
                    <span class="text-sm text-gray-600">${uni.koreanRequirement}</span>
                  </div>
                </div>
              ` : ''}
              ${uni.englishRequirement ? `
                <div class="flex items-start space-x-2">
                  <i class="fas fa-globe text-green-500 mt-1"></i>
                  <div>
                    <span class="text-sm font-medium text-gray-700">영어: </span>
                    <span class="text-sm text-gray-600">${uni.englishRequirement}</span>
                  </div>
                </div>
              ` : ''}
              ${uni.admissionRequirement ? `
                <div class="flex items-start space-x-2">
                  <i class="fas fa-clipboard-check text-purple-500 mt-1"></i>
                  <div>
                    <span class="text-sm font-medium text-gray-700">기타: </span>
                    <span class="text-sm text-gray-600">${uni.admissionRequirement}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-3">지원 서비스</h3>
            <div class="grid grid-cols-2 gap-2">
              ${uni.dormitory ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">기숙사</span></div>' : ''}
              ${uni.airportPickup ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">공항 픽업</span></div>' : ''}
              ${uni.buddyProgram ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">버디 프로그램</span></div>' : ''}
              ${uni.koreanLanguageSupport ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">한국어 지원</span></div>' : ''}
              ${uni.careerSupport ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">취업 지원</span></div>' : ''}
              ${uni.partTimeWork ? '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-500"></i><span class="text-sm text-gray-600">아르바이트</span></div>' : ''}
            </div>
          </div>
        </div>

        ${(uni.springAdmission || uni.fallAdmission) ? `
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">모집 일정</h3>
          <div class="grid md:grid-cols-2 gap-4">
            ${uni.springAdmission ? `
              <div class="p-4 bg-green-50 rounded-lg">
                <div class="font-medium text-green-900 mb-1">봄 학기 (3월)</div>
                <div class="text-sm text-green-700">${uni.springAdmission}</div>
              </div>
            ` : ''}
            ${uni.fallAdmission ? `
              <div class="p-4 bg-orange-50 rounded-lg">
                <div class="font-medium text-orange-900 mb-1">가을 학기 (9월)</div>
                <div class="text-sm text-orange-700">${uni.fallAdmission}</div>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        ${(uni.contactEmail || uni.contactPhone || uni.address) ? `
        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold mb-3">연락처 및 위치</h3>
          <div class="space-y-3">
            ${uni.address ? `
              <div class="flex items-start space-x-3">
                <i class="fas fa-map-marker-alt text-gray-400 mt-1"></i>
                <span class="text-gray-700">${uni.address}</span>
              </div>
            ` : ''}
            ${uni.contactEmail ? `
              <div class="flex items-center space-x-3">
                <i class="fas fa-envelope text-gray-400"></i>
                <a href="mailto:${uni.contactEmail}" class="text-blue-600 hover:underline">${uni.contactEmail}</a>
              </div>
            ` : ''}
            ${uni.contactPhone ? `
              <div class="flex items-center space-x-3">
                <i class="fas fa-phone text-gray-400"></i>
                <a href="tel:${uni.contactPhone}" class="text-blue-600 hover:underline">${uni.contactPhone}</a>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <div class="mt-6 pt-6 border-t flex justify-center space-x-4">
          <a href="${uni.website}" target="_blank" 
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
  `;

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
  // 다른 섹션 숨기기
  ['userManagementSection', 'agentManagement', 'statsDetailContainer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  loadUniversitiesForAdmin();
  // 스크롤 이동
  setTimeout(() => {
    document.getElementById('partnerUniversityManagement').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
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

    const response = await fetch(`/api/partner-universities?${params}`);
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
    const tuitionInfo = uni.tuitionFee ? `${parseInt(uni.tuitionFee).toLocaleString()}원/학기` : '문의 필요';

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

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
              <span class="text-white font-bold text-lg">${uni.name.charAt(0)}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-gray-900">${uni.name}</div>
              <div class="text-xs text-gray-500">${uni.englishName || ''}</div>
              <div class="text-xs text-gray-500 mt-0.5">
                <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>${uni.region}
              </div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex flex-wrap gap-1">
            ${courseBadges || '<span class="text-xs text-gray-400">정보 없음</span>'}
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm">
            <div class="text-gray-900 font-medium">${tuitionInfo}</div>
            <div class="text-xs text-gray-500 mt-1" title="${uni.scholarshipInfo || ''}">${scholarshipSummary}</div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex space-x-2 text-lg">
            ${services}
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex space-x-2">
            <button onclick="if(window.showUniversityModal) window.showUniversityModal(${uni.id}); else toast.error('잠시 후 다시 시도해주세요.');" class="text-gray-600 hover:text-gray-900" title="상세보기">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="if(window.editUniversity) window.editUniversity(${uni.id}); else toast.error('잠시 후 다시 시도해주세요.');" class="text-blue-600 hover:text-blue-900" title="수정">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="if(window.deleteUniversity) window.deleteUniversity(${uni.id}); else toast.error('잠시 후 다시 시도해주세요.');" class="text-red-600 hover:text-red-900" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 대학교 추가 폼 표시
function showAddUniversityForm() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.onclick = (e) => {
    if (e.target === modal) closeUniversityForm();
  };

  modal.innerHTML = `
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
                <label class="block text-sm font-medium text-gray-700 mb-2">홈페이지 URL * <span class="text-xs text-gray-500">(http:// 생략 가능)</span></label>
                <input type="text" name="website" required placeholder="www.example.ac.kr" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                <select name="koreanRequirement" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">선택하세요</option>
                  <option value="무관">무관</option>
                  <option value="TOPIK 1급">TOPIK 1급</option>
                  <option value="TOPIK 2급">TOPIK 2급</option>
                  <option value="TOPIK 3급">TOPIK 3급</option>
                  <option value="TOPIK 4급">TOPIK 4급</option>
                  <option value="TOPIK 5급">TOPIK 5급</option>
                  <option value="TOPIK 6급">TOPIK 6급</option>
                </select>
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
  `;

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

  // 웹사이트 URL 자동 보정
  let websiteUrl = formData.get('website') || '';
  if (websiteUrl && !websiteUrl.toLowerCase().startsWith('http://') && !websiteUrl.toLowerCase().startsWith('https://')) {
    websiteUrl = 'https://' + websiteUrl;
  }

  const data = {
    // 기본 정보
    name: formData.get('name'),
    englishName: formData.get('englishName'),
    region: formData.get('region'),
    address: formData.get('address') || '',
    website: websiteUrl,
    logo: `https://via.placeholder.com/120x120/1f2937/ffffff?text=${encodeURIComponent(formData.get('name').charAt(0))}`,
    establishedYear: formData.get('establishedYear') ? parseInt(formData.get('establishedYear')) : null,
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
    const response = await authenticatedFetch('/api/partner-universities', {
      method: 'POST',
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
        const response = await fetch(`/api/partner-universities/${id}`, {
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

  // 웹사이트 URL 자동 보정
  let websiteUrl = formData.get('website') || '';
  if (websiteUrl && !websiteUrl.toLowerCase().startsWith('http://') && !websiteUrl.toLowerCase().startsWith('https://')) {
    websiteUrl = 'https://' + websiteUrl;
  }

  const data = {
    // 기본 정보
    name: formData.get('name'),
    englishName: formData.get('englishName'),
    region: formData.get('region'),
    address: formData.get('address') || '',
    website: websiteUrl,
    logo: `https://via.placeholder.com/120x120/1f2937/ffffff?text=${encodeURIComponent(formData.get('name').charAt(0))}`,
    establishedYear: formData.get('establishedYear') ? parseInt(formData.get('establishedYear')) : null,
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
    const response = await fetch(`/api/partner-universities/${id}`, {
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
      `"${uni.name}","${uni.englishName}","${uni.region}",${uni.ranking},${uni.studentCount},${uni.foreignStudentCount},"${uni.tuitionFee}","${uni.partnershipType}","${uni.website}"`
    ).join("\\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `협약대학교_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 🤝 에이전트 관리 함수들
let adminAgentsData = [];

// 에이전트 관리 섹션 표시/숨김
function showAgentManagement() {
  document.getElementById('agentManagement').classList.remove('hidden');
  // 다른 섹션 숨기기
  ['userManagementSection', 'partnerUniversityManagement', 'statsDetailContainer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  loadAgentsForAdmin();
  // 스크롤 이동
  setTimeout(() => {
    document.getElementById('agentManagement').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
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

    const response = await fetch(`/api/agents?${params}`);
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
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}">${spec}</span>`;
    }).join(' ');

    const moreBadge = agent.specialization.length > 3 ?
      `<span class="text-xs text-gray-400">+${agent.specialization.length - 3}</span>` : '';

    // 실적 정보
    const placementsInfo = `총 ${agent.totalPlacements}건`;
    const commissionInfo = `수수료 ${agent.commissionRate}%`;

    // 평가 지표
    const successRate = `<i class="fas fa-star text-yellow-500 mr-1"></i>${agent.successRate}%`;
    const countriesCount = `<i class="fas fa-globe text-blue-500 mr-1"></i>${agent.countriesCovered.length}개국`;
    const experienceYears = `<i class="fas fa-briefcase text-gray-500 mr-1"></i>${agent.experienceYears}년`;

    // 승인 상태 배지
    const statusBadges = {
      'approved': '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">승인</span>',
      'pending': '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">대기</span>',
      'suspended': '<span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">정지</span>'
    };
    const statusBadge = statusBadges[agent.approvalStatus] || '';

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
              <span class="text-white font-bold text-lg">${agent.agencyName.charAt(0)}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-gray-900">${agent.agencyName}</div>
              <div class="text-xs text-gray-500">${agent.contactName}</div>
              <div class="text-xs text-gray-400 mt-0.5">${agent.email}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex flex-wrap gap-1">
            ${specializationBadges || '<span class="text-xs text-gray-400">정보 없음</span>'}
            ${moreBadge}
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm">
            <div class="text-gray-900 font-medium">${placementsInfo}</div>
            <div class="text-xs text-gray-500 mt-1">${commissionInfo}</div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm space-y-1">
            <div>${successRate}</div>
            <div>${countriesCount} • ${experienceYears}</div>
            <div class="mt-1">${statusBadge}</div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex space-x-2">
            <button onclick="if(window.showAgentModal) window.showAgentModal(${agent.id}); else toast.error('잠시 후 다시 시도해주세요.');" class="text-gray-600 hover:text-gray-900" title="상세보기">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="if(window.editAgent) window.editAgent(${agent.id}); else toast.error('잠시 후 다시 시도해주세요.');" class="text-blue-600 hover:text-blue-900" title="수정">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="if(window.deleteAgent) window.deleteAgent(${agent.id}); else toast.error('잠시 후 다시 시도해주세요.');" class="text-red-600 hover:text-red-900" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
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
    return `<span class="px-3 py-1 ${colorClass} rounded-full text-sm">${spec}</span>`;
  }).join(' ');

  const countriesBadges = agent.countriesCovered.map(country =>
    `<span class="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm">${country}</span>`
  ).join(' ');

  const languagesBadges = agent.languages.map(lang =>
    `<span class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">${lang}</span>`
  ).join(' ');

  modal.innerHTML = `
    <div class="modal-content bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-xl">${agent.agencyName.charAt(0)}</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">${agent.agencyName}</h2>
            <p class="text-sm text-gray-600">${agent.contactName}</p>
          </div>
        </div>
        <button onclick="if(window.closeAgentModal) window.closeAgentModal();" class="text-gray-400 hover:text-gray-600">
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
                <span class="font-medium">${agent.licenseNumber || '없음'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">경력</span>
                <span class="font-medium">${agent.experienceYears}년</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">이메일</span>
                <span class="font-medium text-sm">${agent.email}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">연락처</span>
                <span class="font-medium">${agent.phone || '없음'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">승인 상태</span>
                <span class="font-medium">${agent.approvalStatus === 'approved' ? '✅ 승인' : agent.approvalStatus === 'pending' ? '⏳ 대기' : '❌ 정지'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-3">실적 정보</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">총 배치 건수</span>
                <span class="font-medium text-blue-600">${agent.totalPlacements}건</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">성공률</span>
                <span class="font-medium text-green-600">${agent.successRate}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">수수료율</span>
                <span class="font-medium">${agent.commissionRate}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">담당 국가</span>
                <span class="font-medium">${agent.countriesCovered.length}개국</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">전문 분야</h3>
          <div class="flex flex-wrap gap-2">
            ${specializationBadges || '<span class="text-gray-400 text-sm">정보 없음</span>'}
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">담당 국가</h3>
          <div class="flex flex-wrap gap-2">
            ${countriesBadges || '<span class="text-gray-400 text-sm">정보 없음</span>'}
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">구사 언어</h3>
          <div class="flex flex-wrap gap-2">
            ${languagesBadges || '<span class="text-gray-400 text-sm">정보 없음</span>'}
          </div>
        </div>

        <div class="mt-6 pt-6 border-t flex justify-center space-x-4">
          <button onclick="if(window.editAgent && window.closeAgentModal) { window.editAgent(${agent.id}); window.closeAgentModal(); }" 
                  class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <i class="fas fa-edit mr-2"></i>수정
          </button>
          <button onclick="if(window.closeAgentModal) window.closeAgentModal();" 
                  class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  `;

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
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('wowcampus_token')}`
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
  toast.info(`에이전트 수정 기능은 준비 중입니다. (ID: ${agentId})`);
}

function getUserTypeLabel(type) {
  const labels = {
    'jobseeker': '구직자',
    'company': '구인자',
    'agent': '에이전트',
    'admin': '관리자'
  };
  return labels[type] || type;
}

function showUserManagement() {
  console.log('showUserManagement 호출됨');
  const userSection = document.getElementById('userManagementSection');
  if (userSection) {
    userSection.classList.remove('hidden');
    // 다른 섹션들 숨기기
    ['agentManagement', 'partnerUniversityManagement', 'statsDetailContainer'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    // 탭 전환 및 데이터 로드
    if (typeof window.switchUserTab === 'function') {
      window.switchUserTab('pending');
    } else {
      console.warn('switchUserTab 함수를 찾을 수 없어 loadPendingUsers를 직접 호출합니다.');
      loadPendingUsers();
    }

    // 스크롤 이동
    setTimeout(() => {
      userSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  } else {
    console.error('userManagementSection 요소를 찾을 수 없습니다.');
  }
}

function hideUserManagement() {
  const userSection = document.getElementById('userManagementSection');
  if (userSection) {
    userSection.classList.add('hidden');
  }
}

// 통계 데이터 로드
async function loadAdminStatistics() {
  console.log('loadAdminStatistics 호출됨');
  try {
    const token = localStorage.getItem('wowcampus_token');
    if (!token) {
      console.error('인증 토큰 없음');
      return;
    }

    const response = await authenticatedFetch('/api/admin/statistics', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('통계 데이터 수신:', result);

    if (result.success) {
      const data = result.data;

      // 데이터 매핑
      const totalJobs = data.jobs?.total || 0;
      const activeJobs = data.jobs?.active || 0;

      // 구직자 수 계산
      let totalJobseekers = 0;
      if (data.users && data.users.byType) {
        const jobseekerStats = data.users.byType.find(s => s.user_type === 'jobseeker');
        if (jobseekerStats) {
          totalJobseekers = jobseekerStats.count;
        }
      }
      const newJobseekers = 0; // API 미제공

      const totalMatches = data.matches?.total || 0;
      const pendingMatches = data.matches?.successful || 0; // 성공 케이스

      const totalUniversities = data.universities?.total || 0;
      const activeUniversities = 0;

      // 통계 카드 업데이트
      updateStatCard('totalJobs', totalJobs, activeJobs);
      updateStatCard('totalJobseekers', totalJobseekers, newJobseekers);
      updateStatCard('totalMatches', totalMatches, pendingMatches);
      updateStatCard('totalUniversities', totalUniversities, activeUniversities);

      // 승인 대기 사용자 수 업데이트 (사이드바 뱃지 등)
      const pendingCount = data.users?.pendingApprovals || 0;
      const badge = document.getElementById('pendingBadgeSidebar');
      if (badge) {
        if (pendingCount > 0) {
          badge.textContent = pendingCount.toString();
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }
    } else {
      console.error('통계 데이터 로드 실패:', result.message);
      toast.error('통계 데이터를 불러오는데 실패했습니다.');
    }
  } catch (error) {
    console.error('통계 로딩 오류:', error);
    // UI에 에러 표시
    ['totalJobs', 'totalJobseekers', 'totalMatches', 'totalUniversities'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '-';
    });
  }
}

function updateStatCard(elementId, value, subValue) {
  const element = document.getElementById(elementId);
  if (element) {
    // 애니메이션 효과와 함께 숫자 업데이트
    animateValue(element, 0, value, 1000);
  }

  // 서브 값 업데이트 (예: 신규, 활성 등)
  const subElement = document.getElementById(`${elementId}Sub`);
  if (subElement && subValue !== undefined) {
    subElement.textContent = `+${subValue}`;
  }
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

async function loadPendingUsers() {
  console.log('[src/index.tsx] loadPendingUsers 호출됨');
  const container = document.getElementById('pendingUsersContent');
  if (!container) {
    console.warn('[src/index.tsx] pendingUsersContent 컨테이너를 찾을 수 없음');
    return;
  }

  // 로딩 스피너 표시
  container.innerHTML = `
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  `;

  try {
    const token = localStorage.getItem('wowcampus_token');
    if (!token) {
      console.error('[src/index.tsx] 인증 토큰 없음');
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
          <p>로그인이 필요합니다.</p>
        </div>
      `;
      toast.error('로그인이 필요합니다.');
      return;
    }

    console.log('[src/index.tsx] 승인 대기 사용자 API 호출 시작');
    const response = await authenticatedFetch('/api/admin/users/pending', {
      method: 'GET'
    });

    console.log('[src/index.tsx] API 응답 상태:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[src/index.tsx] API 응답 데이터:', result);

    if (result.success) {
      const users = result.data.pendingUsers || result.data.users || [];

      // 사이드바 뱃지 업데이트
      const badge = document.getElementById('pendingBadgeSidebar');
      if (badge) {
        if (users.length > 0) {
          badge.textContent = users.length;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }

      if (users.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="text-gray-400 mb-3">
              <i class="fas fa-check-circle text-4xl"></i>
            </div>
            <p class="text-gray-500">승인 대기 중인 사용자가 없습니다.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${users.map(user => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                    ${user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900">${user.name}</h3>
                    <p class="text-sm text-gray-500">${user.email}</p>
                  </div>
                </div>
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${user.user_type === 'jobseeker' ? 'bg-green-100 text-green-800' :
          user.user_type === 'company' ? 'bg-purple-100 text-purple-800' :
            user.user_type === 'agent' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
        }">
                  ${getUserTypeLabel(user.user_type)}
                </span>
              </div>

              <div class="space-y-2 mb-6">
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-calendar-alt w-5 text-gray-400"></i>
                  <span>가입일: ${new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                ${user.phone ? `
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-phone w-5 text-gray-400"></i>
                  <span>${user.phone}</span>
                </div>
                ` : ''}
              </div>

              <div class="flex space-x-2 pt-4 border-t border-gray-100">
                <button onclick="approveUser(${user.id}, '${user.name}')" 
                        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                  <i class="fas fa-check mr-1"></i> 승인
                </button>
                <button onclick="rejectUser(${user.id}, '${user.name}')" 
                        class="flex-1 bg-white text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition-colors text-sm font-medium">
                  <i class="fas fa-times mr-1"></i> 거절
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>데이터 로드 실패: ${result.message}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('[src/index.tsx] 승인 대기 사용자 로딩 오류:', error);
    container.innerHTML = `
      <div class="text-center py-8 text-red-500">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p>오류가 발생했습니다.</p>
        <button onclick="loadPendingUsers()" class="mt-2 text-blue-600 hover:underline">다시 시도</button>
      </div>
    `;
  }
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

async function approveUser(userId, userName) {
  showConfirm({
    title: '사용자 승인',
    message: `${userName}님의 가입을 승인하시겠습니까?`,
    type: 'info',
    confirmText: '승인',
    cancelText: '취소',
    onConfirm: async () => {
      try {
        const response = await authenticatedFetch(`/api/admin/users/${userId}/approve`, {
          method: 'POST'
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
  const reason = prompt(`${userName}님의 가입을 거부하는 이유를 입력하세요:`);
  if (!reason) return;

  try {
    const response = await authenticatedFetch(`/api/admin/users/${userId}/reject`, {
      method: 'POST',
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
    const button = document.getElementById(`${tab}Tab`) || document.getElementById(`${tab}UsersTab`);
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
  const activeButton = document.getElementById(`${tabName}Tab`) || document.getElementById(`${tabName}UsersTab`);

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
window.initAdvancedFilterListeners = function () {
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

    const response = await authenticatedFetch(`/api/admin/users?${params}`, {
      method: 'GET'
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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

      tbody.innerHTML = result.data.users.map(user => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                ${user.name.charAt(0).toUpperCase()}
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">${user.name}</div>
                <div class="text-sm text-gray-500">${user.email}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.user_type === 'jobseeker' ? 'bg-green-100 text-green-800' :
          user.user_type === 'employer' ? 'bg-purple-100 text-purple-800' :
            user.user_type === 'agent' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
        }">
              ${getUserTypeLabel(user.user_type)}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'approved' ? 'bg-green-100 text-green-800' :
          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            user.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
        }">
              ${getStatusLabel(user.status)}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${new Date(user.created_at).toLocaleDateString('ko-KR')}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button onclick="if(window.openEditUserModal) window.openEditUserModal('${user.id}'); else toast.error('잠시 후 다시 시도해주세요.');" 
                    class="text-blue-600 hover:text-blue-900 mr-2 transition-colors">
              <i class="fas fa-edit"></i> 수정
            </button>
            ${user.status === 'approved' ? `
              <button onclick="if(window.confirmToggleUserStatus) window.confirmToggleUserStatus('${user.id}', '${user.name}', '${user.status}'); else toast.error('잠시 후 다시 시도해주세요.');" 
                      class="text-orange-600 hover:text-orange-900 mr-2 transition-colors"
                      title="일시정지">
                <i class="fas fa-pause-circle"></i> 일시정지
              </button>
            ` : user.status === 'pending' ? `
              <button onclick="if(window.confirmToggleUserStatus) window.confirmToggleUserStatus('${user.id}', '${user.name}', '${user.status}'); else toast.error('잠시 후 다시 시도해주세요.');" 
                      class="text-green-600 hover:text-green-900 mr-2 transition-colors"
                      title="활성화">
                <i class="fas fa-play-circle"></i> 활성화
              </button>
            ` : ''}
            <button onclick="if(window.confirmDeleteUser) window.confirmDeleteUser('${user.id}', '${user.name}'); else toast.error('잠시 후 다시 시도해주세요.');" 
                    class="text-red-600 hover:text-red-900 transition-colors">
              <i class="fas fa-trash-alt"></i> 삭제
            </button>
          </td>
        </tr>
      `).join('');

      // 페이지네이션 업데이트
      document.getElementById('totalUsersCount').textContent = result.data.total;
      updatePagination(result.data.total, result.data.page, result.data.limit);
    } else {
      const tbody = document.getElementById('allUsersTableBody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500">오류: ${result.message || '데이터를 불러올 수 없습니다.'}</td></tr>`;
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
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-2"></i>
            <p class="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
            <p class="text-gray-500 text-sm mt-2">${error.message || '알 수 없는 오류'}</p>
            <button onclick="loadAllUsers(currentUserPage, currentUserType)" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              다시 시도
            </button>
          </td>
        </tr>
      `;
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
    html += `<button onclick="loadAllUsers(${currentPage - 1}, currentUserType)" class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">이전</button>`;
  }

  // 페이지 번호
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    html += `<button onclick="loadAllUsers(${i}, currentUserType)" class="px-3 py-2 ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'} rounded-lg transition-colors">${i}</button>`;
  }

  // 다음 버튼
  if (currentPage < totalPages) {
    html += `<button onclick="loadAllUsers(${currentPage + 1}, currentUserType)" class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">다음</button>`;
  }

  container.innerHTML = html;
}

// 사용자 수정 모달 열기
async function openEditUserModal(userId) {
  try {
    const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
      method: 'GET'
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
        const response = await authenticatedFetch(`/api/admin/users/${userId}/reset-password`, {
          method: 'POST'
        });
        const result = await response.json();

        if (result.success) {
          document.getElementById('tempPasswordValue').value = result.data.tempPassword;
          document.getElementById('tempPasswordDisplay').classList.remove('hidden');
          toast.success(`임시 비밀번호가 생성되었습니다: ${result.data.tempPassword}\n\n이 비밀번호를 반드시 사용자에게 안전하게 전달하세요.`, { duration: 10000 });
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

    const response = await authenticatedFetch(`/api/admin/users/${deleteUserId}`, {
      method: 'DELETE'
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
    effectsList.innerHTML = `
      <li>사용자의 구인/구직 정보가 <strong>공개 페이지에 노출되지 않습니다</strong></li>
      <li>사용자는 로그인할 수 있지만, 정보는 숨겨집니다</li>
      <li>언제든 다시 활성화할 수 있습니다</li>
    `;
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
    effectsList.innerHTML = `
      <li>사용자의 구인/구직 정보가 <strong>공개 페이지에 정상적으로 노출됩니다</strong></li>
      <li>사용자는 모든 기능을 정상적으로 사용할 수 있습니다</li>
      <li>승인 시각과 승인자 정보가 기록됩니다</li>
    `;
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

    const response = await authenticatedFetch(`/api/admin/users/${toggleUserId}/toggle-status`, {
      method: 'POST'
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
document.getElementById('editUserForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userId = document.getElementById('editUserId').value;
  const name = document.getElementById('editUserName').value;
  const phone = document.getElementById('editUserPhone').value;
  const status = document.getElementById('editUserStatus').value;

  try {
    const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
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

    const response = await authenticatedFetch('/api/admin/test-db', {
      method: 'GET'
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

// University management functions
window.showUniversityModal = showUniversityModal;
window.closeUniversityModal = closeUniversityModal;
window.editUniversity = editUniversity;
window.deleteUniversity = deleteUniversity;
window.showAddUniversityForm = showAddUniversityForm;
window.closeUniversityForm = closeUniversityForm;
window.showPartnerUniversityManagement = showPartnerUniversityManagement;
window.hidePartnerUniversityManagement = hidePartnerUniversityManagement;
window.loadUniversitiesForAdmin = loadUniversitiesForAdmin;
window.exportUniversitiesData = exportUniversitiesData;

// Agent management functions
window.showAgentModal = showAgentModal;
window.closeAgentModal = closeAgentModal;
window.editAgent = editAgent;
window.deleteAgent = deleteAgent;
window.showAddAgentForm = showAddAgentForm;
window.showAgentManagement = showAgentManagement;
window.hideAgentManagement = hideAgentManagement;

// Auth functions - 중복 방지 (함수 정의 직후에 이미 할당됨)
if (typeof handleLogout !== 'undefined' && !window.handleLogout) window.handleLogout = handleLogout;
if (typeof showLoginModal !== 'undefined' && !window.showLoginModal) window.showLoginModal = showLoginModal;
if (typeof showSignupModal !== 'undefined' && !window.showSignupModal) window.showSignupModal = showSignupModal;
if (typeof showFindEmailModal !== 'undefined' && !window.showFindEmailModal) window.showFindEmailModal = showFindEmailModal;
if (typeof showFindPasswordModal !== 'undefined' && !window.showFindPasswordModal) window.showFindPasswordModal = showFindPasswordModal;
if (typeof closeModal !== 'undefined' && !window.closeModal) window.closeModal = closeModal;
window.startOnboarding = startOnboarding;
window.handleOnboardingSignup = handleOnboardingSignup;
window.handleLogin = handleLogin;
window.handleFindEmail = handleFindEmail;
window.handleFindPassword = handleFindPassword;
window.showUserManagement = showUserManagement;
window.loadPendingUsers = loadPendingUsers;
window.loadAdminStatistics = loadAdminStatistics;




// 페이지별 초기화
if (window.location.pathname === '/study') {
  console.log('유학정보 페이지 - 협약대학교 데이터 로딩 예약');
  document.addEventListener('DOMContentLoaded', function () {
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

// Admin 페이지 초기화
if (window.location.pathname === '/admin') {
  console.log('관리자 페이지 - 승인 대기 사용자 로딩');
  document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded - 승인 대기 컨테이너 확인');
    const container = document.getElementById('pendingUsersContent');
    if (container) {
      console.log('승인 대기 컨테이너 발견 - 데이터 로딩 시작');
      loadPendingUsers();
    } else {
      console.warn('승인 대기 컨테이너를 찾을 수 없습니다');
    }
    // 통계 데이터 로드
    loadAdminStatistics();
  });

  // 페이지가 이미 로드된 경우를 위한 즉시 실행
  setTimeout(() => {
    const container = document.getElementById('pendingUsersContent');
    if (container) {
      console.log('페이지 로드 완료 후 승인 대기 사용자 로딩');
      loadPendingUsers();
    }
    // 통계 데이터 로드
    loadAdminStatistics();
  }, 500);
}

// 필터링 및 리셋 함수를 전역으로 노출
window.filterUniversities = function () {
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

window.resetFilters = function () {
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

window.showUniversityDetail = function (universityId) {
  console.log('대학교 상세보기:', universityId);
  showUniversityModal(universityId);
};

console.log('📱 WOW-CAMPUS JavaScript 로드 완료 (프로필 기능 + 구직자 페이지 기능 + 협약대학교 기능 + 관리자 기능 포함)');
/* Force Re-upload */

// 🌐 언어 변경 함수

