// UI & Navigation Logic
console.log('ui.js loaded');

// 🎯 통합 네비게이션 메뉴 구성 (모든 사용자에게 동일한 단순 링크)
// 중복 선언 방지를 위해 이미 선언되어 있지 않을 때만 생성
if (typeof window.unifiedMenuConfig === 'undefined') {
  window.unifiedMenuConfig = [
    { href: '/jobs', label: '구인정보', icon: 'fas fa-briefcase' },
    { href: '/jobseekers', label: '구직정보', icon: 'fas fa-user-tie' },
    { href: '/matching', label: 'AI스마트매칭', icon: 'fas fa-magic' },
    { href: '/global-support', label: '글로벌지원', icon: 'fas fa-globe' },
    { href: '/support', label: '고객지원', icon: 'fas fa-headset' }
  ];
}

// 🎯 사용자유형별 서비스 드롭다운 메뉴 구성
// 중복 선언 방지
if (typeof window.serviceMenuConfig === 'undefined') {
  window.serviceMenuConfig = {
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
}

// 🎯 통합 네비게이션 메뉴 업데이트 함수 (활성 상태만 업데이트)
function updateNavigationMenu(user = null) {
  // 서버에서 이미 렌더링되므로 활성 상태 버튼만 처리하거나 필요한 경우에만 실행
  const navigationMenu = document.getElementById('navigation-menu-container');
  if (!navigationMenu) return;

  const currentPath = window.location.pathname;
  const links = navigationMenu.querySelectorAll('a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath === href) {
      link.className = 'text-blue-600 font-medium whitespace-nowrap';
    } else {
      link.className = 'text-gray-700 hover:text-blue-600 transition-colors font-medium whitespace-nowrap';
    }
  });
}

// 🎯 서비스 드롭다운 메뉴 업데이트 함수 (메인 페이지용)
function updateServiceDropdownMenu(user = null) {
  // 사용자가 전달되지 않으면 전역 currentUser 사용
  if (!user && window.currentUser) user = window.currentUser;

  // 데스크톱 서비스 드롭다운 메뉴 업데이트
  const serviceDropdown = document.getElementById('service-dropdown-container');
  if (serviceDropdown) {
    const userType = user ? user.user_type : 'guest';
    const serviceMenus = window.serviceMenuConfig[userType] || window.serviceMenuConfig.guest;

    const serviceHtml = serviceMenus.map(menu => `
      <a href="${menu.href}" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
        <i class="${menu.icon} mr-2"></i>${menu.label}
      </a>
    `).join('');

    serviceDropdown.innerHTML = serviceHtml;
  }

  // 모바일 서비스 메뉴 업데이트
  const mobileServiceMenu = document.getElementById('mobile-service-menu-container');
  if (mobileServiceMenu) {
    const userType = user ? user.user_type : 'guest';
    const serviceMenus = window.serviceMenuConfig[userType] || window.serviceMenuConfig.guest;

    const mobileServiceHtml = serviceMenus.map(menu => `
      <a href="${menu.href}" class="block pl-4 py-2 text-gray-600 hover:text-blue-600">
        <i class="${menu.icon} mr-2"></i>${menu.label}
      </a>
    `).join('');

    mobileServiceMenu.innerHTML = mobileServiceHtml;
  }
}

// 📱 모바일 네비게이션 메뉴 업데이트 함수
function updateMobileNavigationMenu() {
  const mobileNavMenu = document.getElementById('mobile-navigation-menu');
  if (!mobileNavMenu) return;

  const currentPath = window.location.pathname;
  const links = mobileNavMenu.querySelectorAll('a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath === href) {
      link.classList.add('text-blue-600', 'bg-blue-50');
      link.classList.remove('text-gray-700');
    } else {
      link.classList.remove('text-blue-600', 'bg-blue-50');
      link.classList.add('text-gray-700');
    }
  });
}

// 🎯 통합된 인증 UI 업데이트 함수
function updateAuthUI(user = null) {
  // 사용자가 전달되지 않으면 전역 currentUser 사용
  if (!user && window.currentUser) user = window.currentUser;

  const i18nDataset = document.getElementById('auth-i18n-data')?.dataset || {};
  const t = window.t || ((k) => null);

  const i18n = {
    login: t('common.login') || i18nDataset.login || '로그인',
    signup: t('common.register') || i18nDataset.signup || '회원가입',
    logout: t('common.logout') || i18nDataset.logout || '로그아웃',
    dashboard: t('common.dashboard') || i18nDataset.dashboard || '대시보드',
    go_to_dashboard: t('common.dashboard') || i18nDataset.go_to_dashboard || '대시보드로 이동'
  };

  console.log('updateAuthUI 호출됨:', user ? `${user.name} (${user.user_type})` : '로그아웃 상태');

  const authButtons = document.getElementById('auth-buttons-container');
  if (!authButtons) {
    return;
  }

  if (user) {
    // 로그인 상태 UI
    const dashboardConfig = {
      jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-tachometer-alt', name: i18n.go_to_dashboard || '대시보드로 이동' },
      company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building', name: i18n.go_to_dashboard || '대시보드로 이동' },
      agent: { link: '/agents', color: 'blue', icon: 'fa-handshake', name: i18n.go_to_dashboard || '대시보드로 이동' },
      admin: { link: '/admin', color: 'red', icon: 'fa-chart-line', name: i18n.go_to_dashboard || '대시보드로 이동' }
    };

    const config = dashboardConfig[user.user_type] || {
      link: '/', color: 'gray', icon: 'fa-home', name: 'Home'
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
        <i class="fas ${config.icon} mr-1"></i>${i18n.dashboard || '내 대시보드'}
      </a>
      <button onclick="handleLogout()" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium" title="${i18n.logout || '로그아웃'}">
        <i class="fas fa-sign-out-alt mr-1"></i>${i18n.logout || '로그아웃'}
      </button>
    `;

    // 윈도우 전역 객체 업데이트
    window.currentUser = user;
    updateNavigationMenu(user);
    updateServiceDropdownMenu(user);
    updateMobileAuthUI(user);

  } else {
    // 로그아웃 상태 UI
    authButtons.innerHTML = `
      <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
        <i class="fas fa-sign-in-alt mr-1"></i>${i18n.login || '로그인'}
      </button>
      <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        <i class="fas fa-user-plus mr-1"></i>${i18n.signup || '회원가입'}
      </button>
    `;

    window.currentUser = null;
    updateNavigationMenu(null);
    updateServiceDropdownMenu(null);
    updateMobileAuthUI(null);
  }
}

// 📱 모바일 메뉴 인증 UI 업데이트
function updateMobileAuthUI(user = null) {
  if (!user && window.currentUser) user = window.currentUser;

  const i18nDataset = document.getElementById('auth-i18n-data')?.dataset || {};
  const t = window.t || ((k) => null);

  const i18n = {
    login: t('common.login') || i18nDataset.login || '로그인',
    signup: t('common.register') || i18nDataset.signup || '회원가입',
    logout: t('common.logout') || i18nDataset.logout || '로그아웃',
    dashboard: t('common.dashboard') || i18nDataset.dashboard || '대시보드'
  };
  const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
  if (!mobileAuthButtons) return;

  if (user) {
    const dashboardConfig = {
      jobseeker: { link: '/dashboard/jobseeker', color: 'green', icon: 'fa-tachometer-alt' },
      company: { link: '/dashboard/company', color: 'purple', icon: 'fa-building' },
      agent: { link: '/agents', color: 'blue', icon: 'fa-handshake' },
      admin: { link: '/admin', color: 'red', icon: 'fa-chart-line' }
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
              <div class="font-semibold text-gray-900 text-sm">${user.name}님</div>
              <div class="text-xs text-gray-600">${getUserTypeLabel(user.user_type)}</div>
            </div>
          </div>
        </div>
        <a href="${config.link}" class="w-full block text-center px-4 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors font-medium mb-2">
          <i class="fas ${config.icon} mr-2"></i>${i18n.dashboard || '내 대시보드'}
        </a>
        <button onclick="handleLogout()" class="w-full px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
          <i class="fas fa-sign-out-alt mr-2"></i>${i18n.logout || '로그아웃'}
        </button>
      </div>
    `;
  } else {
    mobileAuthButtons.innerHTML = `
      <button onclick="showLoginModal()" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium mb-2">
        <i class="fas fa-sign-in-alt mr-2"></i>${i18n.login || '로그인'}
      </button>
      <button onclick="showSignupModal()" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        <i class="fas fa-user-plus mr-2"></i>${i18n.signup || '회원가입'}
      </button>
    `;
  }
}

// 모달 안전하게 닫기 함수
function closeModal(modal) {
  if (modal && modal.parentElement) {
    console.log('모달 닫기');

    // 이벤트 리스너 정리
    if (modal._cleanup) {
      modal._cleanup();
    }

    // 페이지 상호작용 복원
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');

    // 모달 제거
    modal.remove();
  }
}

// 전역에서 모든 모달을 강제로 닫는 함수
function closeAllModals() {
  const allModals = document.querySelectorAll('[id^="signupModal"], [id^="loginModal"], [id^="findEmailModal"], [id^="findPasswordModal"], [id*="userTypeModal"], [id*="completeModal"]');
  allModals.forEach(modal => {
    if (modal._cleanup) {
      modal._cleanup();
    }
    modal.remove();
  });

  // 페이지 상태 복원
  document.body.style.overflow = '';
  document.body.classList.remove('modal-open');
}

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
  // Note: event.target based logic might need check if called directly
  if (typeof event !== 'undefined' && event && event.target) {
    const selectedTab = event.target.closest('.dashboard-tab');
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
  }

  // 탭별 데이터 로드 (함수가 존재하는 경우에만 호출)
  if (tabName === 'profile' && typeof loadProfile === 'function') {
    loadProfile();
  } else if (tabName === 'applications' && typeof loadApplications === 'function') {
    loadApplications();
  }
}
// 📱 모바일 메뉴 토글 초기화 함수
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    // 기존 리스너 제거 방지 및 중복 방지를 위해 간단한 할당 사용
    mobileMenuBtn.onclick = function () {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.innerHTML = '<i class="fas fa-times text-2xl"></i>';
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
      }
    };
  }
}

// 초기화 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
  initMobileMenu();
}
