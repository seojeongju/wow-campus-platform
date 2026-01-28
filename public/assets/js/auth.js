// Authentication Logic
console.log('auth.js loaded');

const getAuthI18n = () => {
  const i18nDataset = document.getElementById('auth-i18n-data')?.dataset || {};
  const t = window.t || ((k) => null);

  // Helper to get value from t, dataset, or return undefined (to let fallback handle it)
  const getVal = (key, dataKey) => t(key) || i18nDataset[dataKey];

  return {
    ...i18nDataset,
    login: getVal('common.login', 'login'),
    email: getVal('auth.email', 'email'),
    emailPlaceholder: getVal('auth.email_placeholder', 'emailPlaceholder'),
    password: getVal('auth.password', 'password'),
    passwordPlaceholder: getVal('auth.password_placeholder', 'passwordPlaceholder'),
    cancel: getVal('common.cancel', 'cancel'),
    findEmail: getVal('auth.find_email', 'findEmail'),
    findPassword: getVal('auth.find_password', 'findPassword'),
    loginSuccess: getVal('auth.login_success', 'loginSuccess'),
    loginFail: t('auth.login_fail') || 'Login Failed',
    logoutSuccess: getVal('auth.logout_success', 'logoutSuccess'),
    errorOccurred: getVal('auth.error_occurred', 'errorOccurred'),

    jobseeker: getVal('auth.jobseeker', 'jobseeker'),
    company: getVal('auth.company', 'company'),
    agent: getVal('auth.agent', 'agent'),

    jobseekerDesc: t('auth.jobseeker_desc'),
    companyDesc: t('auth.company_desc'),
    agentDesc: t('auth.agent_desc'),

    skip: t('auth.signup_later') || i18nDataset.skip,
    onboardingTitle: t('auth.signup_welcome') || i18nDataset.onboardingTitle,
    onboardingSubtitle: t('auth.signup_desc') || i18nDataset.onboardingSubtitle,

    joinNow: t('auth.create_account') || i18nDataset.joinNow,
    joinOther: t('auth.signup_later') || i18nDataset.joinOther, // Use similar key if needed
    alreadyHaveAccount: t('auth.no_account') || i18nDataset.alreadyHaveAccount, // This key might be "Don't have account?"
    loginLink: t('common.login') || i18nDataset.loginLink,

    name: t('auth.name'),
    phone: t('auth.phone'),
    nationality: t('jobseeker.nationality'),
    visaStatus: t('jobseeker.visa_status'),
    koreanLevel: t('jobseeker.korean_level'),
    desiredJob: t('jobseeker.desired_job'), // check key

    // Add other specific keys as needed by auth.js logic
    companyName: t('jobs.detail.company_name'),
    businessNumber: t('auth.business_number'), // might need to add this
    companyAddress: t('jobs.detail.address'),
    industry: t('jobs.detail.industry'),
  };
};
const authI18n = getAuthI18n();

// 🔐 로그인 상태 복원
function restoreLoginState() {
  const token = localStorage.getItem('wowcampus_token');
  const userStr = localStorage.getItem('wowcampus_user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);

      // 유효하지 않은 사용자 데이터 체크 (필수 필드 확인)
      if (!user || !user.id || !user.user_type) {
        throw new Error('Invalid user data');
      }

      // common.js의 변수 업데이트
      window.authToken = token;
      window.currentUser = user;

      // ui.js의 함수 호출
      if (typeof updateAuthUI === 'function') {
        updateAuthUI(user);
      }
      console.log('로그인 상태 복원됨:', user.name);
    } catch (error) {
      console.warn('로그인 상태 복원 실패 (불완전한 데이터):', error);
      localStorage.removeItem('wowcampus_token');
      localStorage.removeItem('wowcampus_user');
      window.currentUser = null;
      window.authToken = null;
      if (typeof updateAuthUI === 'function') {
        updateAuthUI(null);
      }
    }
  } else {
    // 명시적 초기화
    window.currentUser = null;
    window.authToken = null;
    if (typeof updateAuthUI === 'function') {
      updateAuthUI(null);
    }
  }
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

// 모달 공통 이벤트 설정 (닫기 버튼, ESC, 외부 클릭)
function setupModalEvents(modal) {
  // ESC 키로 모달 닫기
  const handleEscape = function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal(modal);
    }
  };
  document.addEventListener('keydown', handleEscape, true);

  // 닫기 버튼 이벤트
  const closeBtn = modal.querySelector('.close-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      closeModal(modal);
    }, true);
  }

  // 취소 버튼 이벤트
  const cancelBtn = modal.querySelector('.cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function (event) {
      event.preventDefault();
      closeModal(modal);
    }, true);
  }

  // 외부 클릭 닫기 (이벤트 버블링 차단 포함)
  modal.addEventListener('click', function (event) {
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent && !modalContent.contains(event.target)) {
      // 외부 클릭 시 아무 동작 안함 (기존 로직 유지)
      // If strict blocking is needed:
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // 모달 정리 함수
  modal._cleanup = function () {
    document.removeEventListener('keydown', handleEscape, true);
  };
}


// 🔐 로그인 처리
async function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const credentials = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (data.success && data.user) {
      // 토큰 및 사용자 정보 저장
      window.authToken = data.token;
      localStorage.setItem('wowcampus_token', data.token);
      localStorage.setItem('wowcampus_user', JSON.stringify(data.user));
      window.currentUser = data.user;

      // 모달 닫기
      const modalElement = event.target.closest('div[id^="loginModal"]');
      if (modalElement) closeModal(modalElement);

      // UI 업데이트
      const welcomeMsg = (authI18n.loginSuccess || '반갑습니다, {name}님!').replace('{name}', data.user.name);
      showNotification(welcomeMsg, 'success');
      if (typeof updateAuthUI === 'function') updateAuthUI(data.user);

      // 리다이렉트
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      setTimeout(() => {
        window.location.href = redirectUrl || '/home';
      }, 500);

    } else {
      showNotification(data.message || authI18n.loginFail || '로그인에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    showNotification(authI18n.errorOccurred || '로그인 중 오류가 발생했습니다.', 'error');
  }
}

// 🚪 로그아웃 처리
async function handleLogout() {
  try {
    // 로컬 데이터 정리
    window.authToken = null;
    localStorage.removeItem('wowcampus_token');
    localStorage.removeItem('wowcampus_user');
    window.currentUser = null;

    showNotification(authI18n.logoutSuccess || '👋 안전하게 로그아웃되었습니다.', 'success');

    if (typeof updateAuthUI === 'function') updateAuthUI(null);

    setTimeout(() => {
      window.location.href = '/';
    }, 500);

  } catch (error) {
    console.error('로그아웃 에러:', error);
  }
}

// 📝 회원가입 모달 표시
function showSignupModal() {
  console.log('회원가입 모달 호출');
  startOnboarding();
}

// 🚀 스마트 온보딩 플로우 시스템
function startOnboarding() {
  const urlParams = new URLSearchParams(window.location.search);
  const registerType = urlParams.get('register');

  if (registerType) {
    const validTypes = ['company', 'jobseeker', 'agent'];
    if (validTypes.includes(registerType)) {
      showSignupForm(registerType);
      return;
    }
  }

  const user = window.currentUser;

  // 로그인되어 있고 유효한 user_type이 있는 경우에만 리다이렉트
  if (user && user.user_type) {
    const dashboardUrls = {
      jobseeker: '/dashboard/jobseeker',
      company: '/dashboard/company',
      agent: '/agents',
      admin: '/admin'
    };

    // user_type에 맞는 대시보드가 있거나, 알 수 없는 타입이면 홈으로(안전장치)
    // 하지만 가입하려는 의도가 있을 수 있으므로 startOnboarding 호출 시점에서는 신중해야 함.
    // 여기서는 '이미 로그인된 사용자가 가입 버튼을 누른 경우'로 간주하여 대시보드로 보냄.
    const redirectUrl = dashboardUrls[user.user_type];
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
  }

  showUserTypeSelection();
}

// 1단계: 사용자 유형 선택 모달
function showUserTypeSelection() {
  const existingModal = document.querySelector('[id*="Modal"]');
  if (existingModal) existingModal.remove();

  const modalId = 'userTypeModal_' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 flex items-center justify-center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in" onclick="closeOnboardingModal('${modalId}')"></div>
    <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 m-4 max-w-4xl w-full animate-scale-in relative z-10 max-h-[90vh] overflow-y-auto" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
      <div class="text-center mb-8 sm:mb-10">
        <h2 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">${authI18n.onboardingTitle || '어떤 목적으로 방문하셨나요?'}</h2>
        <p class="text-base sm:text-lg text-gray-600">${authI18n.onboardingSubtitle || '서비스를 맞춤화하기 위해 사용자 유형을 선택해주세요'}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-10">
        <div class="group user-type-card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-green-500 hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95" onclick="selectUserType('jobseeker')">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i class="fas fa-user text-white text-2xl"></i>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3">${authI18n.jobseeker || '구직자'}</h3>
            <p class="text-gray-600 text-sm sm:text-base leading-relaxed">${authI18n.jobseekerDesc || '일자리를 찾고 있는 외국인 구직자'}</p>
          </div>
        </div>
        <div class="group user-type-card bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-purple-500 hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95" onclick="selectUserType('company')">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i class="fas fa-building text-white text-2xl"></i>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3">${authI18n.company || '기업/채용담당자'}</h3>
            <p class="text-gray-600 text-sm sm:text-base leading-relaxed">${authI18n.companyDesc || '외국인 인재를 채용하려는 기업'}</p>
          </div>
        </div>
        <div class="group user-type-card bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-blue-500 hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95" onclick="selectUserType('agent')">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i class="fas fa-handshake text-white text-2xl"></i>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3">${authI18n.agent || '에이전트'}</h3>
            <p class="text-gray-600 text-sm sm:text-base leading-relaxed">${authI18n.agentDesc || '구인구직 중개 전문가'}</p>
          </div>
        </div>
      </div>
      <div class="text-center">
        <button onclick="closeOnboardingModal('${modalId}')" class="px-8 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-medium transition-all duration-200 active:scale-95">${authI18n.skip || '나중에 하기'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// 사용자 유형 선택 처리
function selectUserType(userType) {
  closeOnboardingModal();
  setTimeout(() => {
    showSignupForm(userType);
  }, 100);
}

// 2단계: 맞춤형 회원가입 폼 표시
function showSignupForm(userType) {
  const modalId = 'signupModal_' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 flex items-center justify-center';
  modal.style.zIndex = '9999';

  // 최신 번역 데이터 가져오기
  const i18n = getAuthI18n();

  // 유형별 타이틀 및 색상
  const typeConfig = {
    jobseeker: { title: (i18n.jobseeker || '구직자') + ' ' + (i18n.signup || '회원가입'), color: 'green', icon: 'fa-user' },
    company: { title: (i18n.company || '기업') + ' ' + (i18n.signup || '회원가입'), color: 'purple', icon: 'fa-building' },
    agent: { title: (i18n.agent || '에이전트') + ' ' + (i18n.signup || '회원가입'), color: 'blue', icon: 'fa-handshake' }
  };
  const config = typeConfig[userType] || typeConfig.jobseeker;

  // 유형별 추가 필드 생성
  const getTypeSpecificFields = (type) => {
    if (type === 'jobseeker') {
      return `
        <div class="border-t pt-4 mt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3"><i class="fas fa-info-circle mr-2"></i>${authI18n.jobseeker || '구직자'} 정보</h3>
          <div class="space-y-3">
            <select name="nationality" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">국적 선택 *</option>
              <option value="베트남">베트남</option>
              <option value="필리핀">필리핀</option>
              <option value="인도네시아">인도네시아</option>
              <option value="네팔">네팔</option>
              <option value="우즈베키스탄">우즈베키스탄</option>
              <option value="캄보디아">캄보디아</option>
              <option value="미얀마">미얀마</option>
              <option value="태국">태국</option>
              <option value="중국">중국</option>
              <option value="몽골">몽골</option>
              <option value="기타">기타</option>
            </select>
            <select name="visa_status" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">비자 상태 *</option>
              <option value="D-4">D-4 (유학)</option>
              <option value="D-10">D-10 (구직)</option>
              <option value="E-7">E-7 (특정활동)</option>
              <option value="E-9">E-9 (비전문취업)</option>
              <option value="F-2">F-2 (거주)</option>
              <option value="F-4">F-4 (재외동포)</option>
              <option value="F-5">F-5 (영주)</option>
              <option value="F-6">F-6 (결혼이민)</option>
              <option value="H-2">H-2 (방문취업)</option>
              <option value="기타">기타</option>
            </select>
            <select name="korean_level" class="w-full px-3 py-2 border rounded-lg">
              <option value="">한국어 수준</option>
              <option value="없음">TOPIK 없음</option>
              <option value="1급">TOPIK 1급</option>
              <option value="2급">TOPIK 2급</option>
              <option value="3급">TOPIK 3급</option>
              <option value="4급">TOPIK 4급</option>
              <option value="5급">TOPIK 5급</option>
              <option value="6급">TOPIK 6급</option>
            </select>
            <input type="text" name="desired_job" class="w-full px-3 py-2 border rounded-lg" placeholder="희망 직종 (예: 제조업, IT)">
          </div>
        </div>
        <div class="mt-4">
          <select name="agent_id" id="agent-select-${userType}" class="w-full px-3 py-2 border rounded-lg">
            <option value="">담당 에이전트 선택 (선택사항)</option>
          </select>
        </div>
      `;
    } else if (type === 'company') {
      return `
        <div class="border-t pt-4 mt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3"><i class="fas fa-building mr-2"></i>${authI18n.company || '기업'} 정보</h3>
          <div class="space-y-3">
            <input type="text" name="company_name" required class="w-full px-3 py-2 border rounded-lg" placeholder="회사명 *">
            <input type="text" name="business_number" required class="w-full px-3 py-2 border rounded-lg" placeholder="사업자등록번호 (10자리) *" maxlength="10" pattern="[0-9]{10}">
            <input type="text" name="company_address" required class="w-full px-3 py-2 border rounded-lg" placeholder="회사 주소 *">
            <select name="industry" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">업종 선택 *</option>
              <option value="제조업">제조업</option>
              <option value="건설업">건설업</option>
              <option value="IT/소프트웨어">IT/소프트웨어</option>
              <option value="서비스업">서비스업</option>
              <option value="요식업">요식업</option>
              <option value="농축산업">농축산업</option>
              <option value="물류/운송">물류/운송</option>
              <option value="의료/복지">의료/복지</option>
              <option value="기타">기타</option>
            </select>
            <input type="text" name="department" class="w-full px-3 py-2 border rounded-lg" placeholder="담당 부서/직책">
            <select name="company_size" class="w-full px-3 py-2 border rounded-lg">
              <option value="">회사 규모</option>
              <option value="1-10">1-10명</option>
              <option value="11-50">11-50명</option>
              <option value="51-100">51-100명</option>
              <option value="101-300">101-300명</option>
              <option value="300+">300명 이상</option>
            </select>
          </div>
        </div>
      `;
    } else if (type === 'agent') {
      return `
        <div class="border-t pt-4 mt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3"><i class="fas fa-handshake mr-2"></i>${authI18n.agent || '에이전시'} 정보</h3>
          <div class="space-y-3">
            <input type="text" name="agency_name" required class="w-full px-3 py-2 border rounded-lg" placeholder="에이전시명 *">
            <input type="text" name="business_number" class="w-full px-3 py-2 border rounded-lg" placeholder="사업자등록번호 (10자리) (선택)" maxlength="10">
            <div class="text-xs text-gray-500 mb-1">전문분야 (복수선택 가능) *</div>
            <div class="flex flex-wrap gap-2">
              <label class="flex items-center text-sm"><input type="checkbox" name="specialty" value="어학연수" class="mr-1"> 어학연수</label>
              <label class="flex items-center text-sm"><input type="checkbox" name="specialty" value="취업알선" class="mr-1"> 취업알선</label>
              <label class="flex items-center text-sm"><input type="checkbox" name="specialty" value="비자대행" class="mr-1"> 비자대행</label>
              <label class="flex items-center text-sm"><input type="checkbox" name="specialty" value="유학상담" class="mr-1"> 유학상담</label>
            </div>
            <input type="text" name="target_countries" class="w-full px-3 py-2 border rounded-lg" placeholder="주요 취급 국가 (예: 베트남, 필리핀)">
            <input type="text" name="license_number" class="w-full px-3 py-2 border rounded-lg" placeholder="직업소개 허가번호 (선택)">
            <textarea name="agency_description" class="w-full px-3 py-2 border rounded-lg" rows="2" placeholder="에이전시 소개 (선택)"></textarea>
          </div>
        </div>
      `;
    }
    return '';
  };

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in" onclick="closeOnboardingModal('${modalId}')"></div>
    <div class="bg-white rounded-xl shadow-2xl p-4 sm:p-6 m-4 max-w-lg w-full animate-scale-in relative z-10 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-${config.color}-100 rounded-full flex items-center justify-center mr-3">
            <i class="fas ${config.icon} text-${config.color}-600"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-900">${config.title}</h2>
        </div>
        <button onclick="closeOnboardingModal('${modalId}')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="onboarding-signup-form" onsubmit="handleOnboardingSignup(event, '${userType}')">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-user mr-2"></i>${i18n.basicInfo || '기본 정보'}</h3>
          <input type="email" name="email" required autocomplete="off" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent" placeholder="${i18n.email || '이메일'} *">
          <div class="grid grid-cols-2 gap-2">
            <input type="password" name="password" required autocomplete="new-password" class="w-full px-3 py-2 border rounded-lg" placeholder="${i18n.password || '비밀번호'} *" minlength="8">
            <input type="password" name="confirmPassword" required autocomplete="new-password" class="w-full px-3 py-2 border rounded-lg" placeholder="${i18n.confirmPassword || '비밀번호 확인'} *">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <input type="text" name="name" required class="w-full px-3 py-2 border rounded-lg" placeholder="${authI18n.name || '이름'} *">
            <input type="tel" name="phone" required class="w-full px-3 py-2 border rounded-lg" placeholder="${authI18n.phone || '휴대폰'} *">
          </div>
          ${userType !== 'jobseeker' ? `
          <select name="location" required class="w-full px-3 py-2 border rounded-lg">
            <option value="">지역 선택 *</option>
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
          ` : ''}
          
          ${getTypeSpecificFields(userType)}
          
          <div class="border-t pt-4 mt-4">
            <label class="flex items-start text-sm text-gray-600">
              <input type="checkbox" name="agree_terms" required class="mr-2 mt-1">
              <span><a href="/terms" class="text-blue-600 underline" target="_blank">${authI18n.terms || '이용약관'}</a> 및 <a href="/privacy" class="text-blue-600 underline" target="_blank">${authI18n.privacy || '개인정보처리방침'}</a>${authI18n.agreeSuffix || '에 동의합니다.'} *</span>
            </label>
          </div>
        </div>
        
        <div class="mt-6 space-y-3">
          <button type="submit" class="w-full bg-${config.color}-600 text-white py-3 rounded-lg font-semibold hover:bg-${config.color}-700 transition-colors">
            <i class="fas fa-user-plus mr-2"></i>${authI18n.joinNow || '가입하기'}
          </button>
          <button type="button" onclick="closeOnboardingModal('${modalId}'); setTimeout(showUserTypeSelection, 100);" class="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <i class="fas fa-arrow-left mr-2"></i>${authI18n.joinOther || '다른 유형으로 가입'}
          </button>
        </div>
      </form>
      
      <div class="text-center mt-4 text-sm text-gray-500">
        ${authI18n.alreadyHaveAccount || '이미 계정이 있으신가요?'} <button onclick="closeOnboardingModal('${modalId}'); showLoginModal();" class="text-blue-600 font-medium hover:underline">${authI18n.loginLink || '로그인'}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 구직자인 경우 에이전트 목록 로드
  if (userType === 'jobseeker') {
    loadAvailableAgents(userType);
  }
}

// 온보딩 회원가입 처리
async function handleOnboardingSignup(event, userType) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  // 기본 정보
  const userData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    user_type: userType,
    name: formData.get('name'),
    phone: formData.get('phone'),
    location: formData.get('location')
  };

  // 유형별 추가 필드
  if (userType === 'jobseeker') {
    userData.nationality = formData.get('nationality');
    userData.visa_status = formData.get('visa_status');
    userData.korean_level = formData.get('korean_level') || '';
    userData.desired_job = formData.get('desired_job') || '';
    const agentId = formData.get('agent_id');
    if (agentId) userData.agent_id = parseInt(agentId);
  } else if (userType === 'company') {
    userData.company_name = formData.get('company_name');
    userData.business_number = formData.get('business_number');
    userData.company_address = formData.get('company_address');
    userData.industry = formData.get('industry');
    userData.department = formData.get('department') || '';
    userData.company_size = formData.get('company_size') || '';
  } else if (userType === 'agent') {
    userData.agency_name = formData.get('agency_name');
    userData.business_number = formData.get('business_number');
    // specialty는 체크박스로 복수선택
    const specialties = formData.getAll('specialty');
    userData.specialty = specialties.join(', ');
    userData.target_countries = formData.get('target_countries') || '';
    userData.license_number = formData.get('license_number') || '';
    userData.agency_description = formData.get('agency_description') || '';
  }

  if (userData.password !== userData.confirmPassword) {
    showNotification('비밀번호가 일치하지 않습니다.', 'error');
    return;
  }

  if (userData.password.length < 8) {
    showNotification('비밀번호는 8자 이상이어야 합니다.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (data.success) {
      if (data.token) {
        localStorage.setItem('wowcampus_token', data.token);
        window.authToken = data.token;
        window.currentUser = data.user;
        if (typeof updateAuthUI === 'function') updateAuthUI(data.user);
      }
      closeOnboardingModal();
      showOnboardingComplete(userType, data.user);
    } else {
      showNotification(data.message || authI18n.registerFail || '회원가입 실패', 'error');
    }
  } catch (error) {
    console.error('회원가입 오류:', error);
    showNotification(authI18n.errorOccurred || '오류가 발생했습니다.', 'error');
  }
}

// 온보딩 완료 및 다음 단계 안내
function showOnboardingComplete(userType, user) {
  const modalId = 'completeModal_' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in"></div>
    <div class="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full animate-scale-in relative z-10">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">${authI18n.completeTitle || '가입 완료!'}</h2>
        <p class="text-gray-600">${(authI18n.completeMsg || '환영합니다, {name}님.').replace('{name}', user.name)}</p>
      </div>
      <div class="text-center">
        <button onclick="goToDashboard()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mb-3">${authI18n.go_to_dashboard || authI18n.dashboard || '대시보드로 이동'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// 에이전트 목록 로드
async function loadAvailableAgents(userType) {
  try {
    const response = await fetch('/api/public/agents');
    if (!response.ok) return;
    const result = await response.json();
    if (result.success && result.agents) {
      const select = document.getElementById(`agent-select-${userType}`);
      if (select) {
        result.agents.forEach(agent => {
          const option = document.createElement('option');
          option.value = agent.id;
          option.textContent = agent.agency_name || agent.user_name;
          select.appendChild(option);
        });
      }
    }
  } catch (e) { console.error(e); }
}

// 온보딩 모달 닫기 Helper
function closeOnboardingModal(modalId = null) {
  if (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
  } else {
    document.querySelectorAll('[id*="Modal"]').forEach(modal => modal.remove());
  }
}

// 이메일 찾기 모달
function showFindEmailModal() {
  const modalId = 'findEmailModal_' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center';

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in" onclick="closeOnboardingModal('${modalId}')"></div>
    <div class="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full animate-scale-in relative z-10" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center">
            <i class="fas fa-envelope mr-3 text-blue-500" style="-webkit-text-fill-color: initial; background: none;"></i>
            ${authI18n.findEmail || '이메일 찾기'}
          </h2>
          <p class="text-sm text-gray-500 mt-1">가입 정보를 입력해주세요</p>
        </div>
        <button onclick="closeOnboardingModal('${modalId}')" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200">
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>
      
      <form id="findEmailForm" onsubmit="handleFindEmailSubmit(event, '${modalId}')">
        <div class="space-y-5">
          <p class="text-sm text-gray-600 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <i class="fas fa-info-circle mr-2"></i>${authI18n.findEmailDesc || '가입 시 등록한 이름과 휴대폰 번호를 입력하시면 이메일을 찾아드립니다.'}
          </p>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <i class="fas fa-user text-blue-500 mr-2"></i>
              ${authI18n.name || '이름'}
            </label>
            <input type="text" name="name" required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none" placeholder="${authI18n.name || '가입 시 등록한 이름'}">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <i class="fas fa-mobile-alt text-blue-500 mr-2"></i>
              ${authI18n.phone || '휴대폰 번호'}
            </label>
            <input type="tel" name="phone" required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none" placeholder="예: 010-1234-5678 또는 +82-10-1234-5678">
          </div>
        </div>
        
        <div id="findEmailResult" class="mt-5 hidden">
          <div class="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 shadow-sm">
            <p class="text-sm text-gray-700 mb-2 font-medium">${authI18n.foundEmailPrefix || '가입된 이메일:'}</p>
            <p id="foundEmail" class="text-xl font-bold text-blue-600 bg-white px-4 py-2 rounded-lg"></p>
          </div>
        </div>
        
        <div class="mt-8 space-y-3">
          <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2">
            <i class="fas fa-search"></i>
            <span>${authI18n.findEmail || '이메일 찾기'}</span>
          </button>
          <button type="button" onclick="closeOnboardingModal('${modalId}'); showLoginModal();" class="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 active:scale-[0.98] transition-all duration-200">
            ${authI18n.backToLogin || '로그인으로 돌아가기'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

// 이메일 찾기 처리
async function handleFindEmailSubmit(event, modalId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const name = formData.get('name');
  const phone = formData.get('phone');

  try {
    const response = await fetch('/api/auth/find-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });

    const result = await response.json();

    if (result.success && result.email) {
      // 이메일 찾기 성공
      const resultDiv = document.getElementById('findEmailResult');
      const emailSpan = document.getElementById('foundEmail');
      if (resultDiv && emailSpan) {
        // 이메일 일부 마스킹 (예: te***@example.com)
        const maskedEmail = maskEmail(result.email);
        emailSpan.textContent = maskedEmail;
        resultDiv.classList.remove('hidden');
      }
    } else {
      showNotification(result.message || '일치하는 회원 정보가 없습니다.', 'error');
    }
  } catch (error) {
    console.error('이메일 찾기 오류:', error);
    showNotification(authI18n.errorOccurred || '오류가 발생했습니다. 다시 시도해주세요.', 'error');
  }
}

// 이메일 마스킹 함수
function maskEmail(email) {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  const visible = localPart.substring(0, 2);
  const masked = '*'.repeat(Math.min(localPart.length - 2, 5));
  return `${visible}${masked}@${domain}`;
}

// 비밀번호 찾기 모달
function showFindPasswordModal() {
  const modalId = 'findPasswordModal_' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center';

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in" onclick="closeOnboardingModal('${modalId}')"></div>
    <div class="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full animate-scale-in relative z-10" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center">
            <i class="fas fa-key mr-3 text-orange-500" style="-webkit-text-fill-color: initial; background: none;"></i>
            ${authI18n.findPassword || '비밀번호 찾기'}
          </h2>
          <p class="text-sm text-gray-500 mt-1">임시 비밀번호를 발급받으세요</p>
        </div>
        <button onclick="closeOnboardingModal('${modalId}')" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200">
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>
      
      <form id="findPasswordForm" onsubmit="handleFindPasswordSubmit(event, '${modalId}')">
        <div class="space-y-5">
          <p class="text-sm text-gray-600 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <i class="fas fa-info-circle mr-2"></i>${authI18n.findPasswordDesc || '가입한 이메일과 휴대폰 번호를 입력하시면 임시 비밀번호가 발급됩니다.'}
          </p>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <i class="fas fa-envelope text-orange-500 mr-2"></i>
              ${authI18n.email || '이메일'}
            </label>
            <input type="email" name="email" required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200 outline-none" placeholder="${authI18n.emailPlaceholder || '가입한 이메일 주소'}">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <i class="fas fa-mobile-alt text-orange-500 mr-2"></i>
              ${authI18n.phone || '휴대폰 번호'}
            </label>
            <input type="tel" name="phone" required class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200 outline-none" placeholder="예: 010-1234-5678 또는 +82-10-1234-5678">
          </div>
        </div>
        
        <div id="findPasswordResult" class="mt-5 hidden">
          <div class="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 shadow-sm">
            <p class="text-sm text-gray-700 mb-3 font-medium flex items-center">
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              ${authI18n.foundPasswordPrefix || '임시 비밀번호가 발급되었습니다:'}
            </p>
            <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-orange-300">
              <code id="tempPassword" class="flex-1 text-lg font-mono font-bold text-orange-600 text-center"></code>
              <button type="button" onclick="copyTempPasswordToClipboard()" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-1">
                <i class="fas fa-copy text-sm"></i>
                <span class="text-sm">${authI18n.copy || '복사'}</span>
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-3 bg-yellow-50 border border-yellow-200 p-2 rounded">
              <i class="fas fa-exclamation-triangle text-yellow-600 mr-1"></i>
              ${authI18n.passwordChangeAlert || '⚠️ 로그인 후 반드시 비밀번호를 변경해주세요.'}
            </p>
          </div>
        </div>
        
        <div class="mt-8 space-y-3">
          <button type="submit" class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2">
            <i class="fas fa-paper-plane"></i>
            <span>${authI18n.findPassword || '임시 비밀번호 발급'}</span>
          </button>
          <button type="button" onclick="closeOnboardingModal('${modalId}'); showLoginModal();" class="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 active:scale-[0.98] transition-all duration-200">
            ${authI18n.backToLogin || '로그인으로 돌아가기'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

// 비밀번호 찾기 처리
async function handleFindPasswordSubmit(event, modalId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const email = formData.get('email');
  const phone = formData.get('phone');

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone })
    });

    const result = await response.json();

    if (result.success && result.temp_password) {
      // 임시 비밀번호 발급 성공
      const resultDiv = document.getElementById('findPasswordResult');
      const passwordSpan = document.getElementById('tempPassword');
      if (resultDiv && passwordSpan) {
        passwordSpan.textContent = result.temp_password;
        resultDiv.classList.remove('hidden');
        form.querySelector('button[type="submit"]').disabled = true;
        form.querySelector('button[type="submit"]').classList.add('opacity-50');
      }
    } else {
      showNotification(result.message || '일치하는 회원 정보가 없습니다.', 'error');
    }
  } catch (error) {
    console.error('비밀번호 찾기 오류:', error);
    showNotification(authI18n.errorOccurred || '오류가 발생했습니다. 다시 시도해주세요.', 'error');
  }
}

// 임시 비밀번호 클립보드 복사
function copyTempPasswordToClipboard() {
  const passwordEl = document.getElementById('tempPassword');
  if (passwordEl) {
    navigator.clipboard.writeText(passwordEl.textContent).then(() => {
      showNotification(authI18n.copySuccess || '임시 비밀번호가 복사되었습니다.', 'success');
    }).catch(() => {
      showNotification(authI18n.copyFail || '복사에 실패했습니다.', 'error');
    });
  }
}

// Navigation Helpers (Global)
function goToDashboard(url = null) {
  if (url) window.location.href = url;
  else {
    const user = window.currentUser;
    if (user) {
      const dashboards = {
        jobseeker: '/dashboard/jobseeker',
        company: '/dashboard/company',
        agent: '/agents',
        admin: '/admin'
      };
      window.location.href = dashboards[user.user_type] || '/';
    } else window.location.href = '/';
  }
}
function goToProfile() { window.location.href = '/profile'; }
function goToJobs() { window.location.href = '/jobs'; }
function goToJobseekers() { window.location.href = '/jobseekers'; }
function goToMatching() { window.location.href = '/matching'; }
function goToJobPost() { window.location.href = '/jobs/create'; }

// 📧 이메일 찾기 처리 (레거시 호출용)
function handleFindEmail(event) {
  if (event) event.preventDefault();
  showFindEmailModal();
}

// 🔒 비밀번호 찾기 처리 (레거시 호출용)
function handleFindPassword(event) {
  if (event) event.preventDefault();
  showFindPasswordModal();
}

// 전역 스코프에 노출
window.handleFindEmail = handleFindEmail;
window.handleFindPassword = handleFindPassword;
window.showFindEmailModal = showFindEmailModal;
window.showFindPasswordModal = showFindPasswordModal;
window.handleFindEmailSubmit = handleFindEmailSubmit;
window.handleFindPasswordSubmit = handleFindPasswordSubmit;
window.copyTempPasswordToClipboard = copyTempPasswordToClipboard;

