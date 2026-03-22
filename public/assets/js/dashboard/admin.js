console.log('Admin Dashboard script loaded');

// 전역 변수
let adminUniversitiesData = [];
let adminAgentsData = [];
let currentUserPage = 1;
let currentUserType = null;

// ============================================================
// 🛠️ 유틸리티 함수 (Toast, Confirm, Logout)
// ============================================================

if (!window.toast) {
  window.toast = {
    success: (msg) => {
      const div = document.createElement('div');
      div.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
      div.textContent = msg;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 3000);
    },
    error: (msg) => {
      const div = document.createElement('div');
      div.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
      div.textContent = msg;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 3000);
    },
    info: (msg) => {
      const div = document.createElement('div');
      div.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
      div.textContent = msg;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 3000);
    }
  };
}

if (!window.showConfirm) {
  window.showConfirm = function ({ title, message, type = 'info', confirmText = '확인', cancelText = '취소', onConfirm, onCancel }) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4';

    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200';

    modal.innerHTML = `
      <h3 class="text-xl font-bold text-gray-900 mb-2">\${title}</h3>
      <p class="text-gray-600 mb-6">\${message}</p>
      <div class="flex justify-end gap-3">
        <button id="confirm-cancel" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">\${cancelText}</button>
        <button id="confirm-ok" class="px-4 py-2 text-white \${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg transition-colors">\${confirmText}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();

    overlay.querySelector('#confirm-ok').onclick = () => { close(); if (onConfirm) onConfirm(); };
    overlay.querySelector('#confirm-cancel').onclick = () => { close(); if (onCancel) onCancel(); };
    overlay.onclick = (e) => { if (e.target === overlay) { close(); if (onCancel) onCancel(); } };
  };
}

if (!window.handleLogout) {
  window.handleLogout = function () {
    localStorage.removeItem('wowcampus_token');
    localStorage.removeItem('wowcampus_user');
    document.cookie = 'token=; Max-Age=0; path=/;';
    window.location.href = '/';
  };
}

// ============================================================
// 📊 통계 및 대시보드 로직
// ============================================================

// 통계 데이터 로드
async function loadAdminStatistics() {
  console.log('loadAdminStatistics 호출됨');
  try {
    const token = localStorage.getItem('wowcampus_token');
    if (!token) {
      console.error('인증 토큰 없음');
      return;
    }

    const response = await fetch('/api/admin/statistics', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      console.error('인증 실패: 401 Unauthorized');
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      handleLogout();
      return;
    }

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

// ============================================================
// 👥 사용자 관리 로직
// ============================================================

function showUserManagement(initialTab = 'pending') {
  console.log('showUserManagement 호출됨, initialTab:', initialTab);
  const userSection = document.getElementById('userManagementSection');
  if (userSection) {
    userSection.classList.remove('hidden');
    // 다른 섹션들 숨기기
    ['agentManagement', 'partnerUniversityManagement', 'statsDetailContainer', 'jobManagement', 'jobSeekerManagement'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    // 탭 전환 및 데이터 로드
    if (typeof window.switchUserTab === 'function') {
      window.switchUserTab(initialTab);
    } else {
      console.warn('switchUserTab 함수를 찾을 수 없어 loadPendingUsers를 직접 호출합니다.');
      // Fallback: If asking for pending, load pending. Otherwise try loading all.
      if (initialTab === 'pending') loadPendingUsers();
      else loadAllUsers();
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

async function loadPendingUsers() {
  console.log('[loadPendingUsers] 호출됨');
  const container = document.getElementById('pendingUsersContent');
  if (!container) {
    console.warn('pendingUsersContent 컨테이너를 찾을 수 없음');
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
      console.error('인증 토큰 없음');
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
          <p>로그인이 필요합니다.</p>
        </div>
      `;
      toast.error('로그인이 필요합니다.');
      return;
    }

    const response = await fetch('/api/admin/users/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

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
    console.error('승인 대기 사용자 로딩 오류:', error);
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

function getUserTypeLabel(type) {
  const labels = {
    'jobseeker': '구직자',
    'company': '기업',
    'agent': '에이전트',
    'admin': '관리자'
  };
  return labels[type] || type;
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
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(`/api/admin/users/${userId}/approve`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
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
  const reason = prompt(`${userName}님의 가입을 거부하는 이유를 입력하세요:`);
  if (!reason) return;

  try {
    const token = localStorage.getItem('wowcampus_token');
    const response = await fetch(`/api/admin/users/${userId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
  // 모든 필터 value 초기화
  [
    'nationalityFilter', 'visaStatusFilter', 'koreanLevelFilter', 'educationLevelFilter', 'experienceYearsFilter', 'preferredLocationFilter',
    'companySizeFilter', 'industryFilter', 'addressFilter',
    'specializationFilter', 'languagesFilter', 'countriesCoveredFilter'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // 검색 재실행
  loadAllUsers(1, currentUserType);
}

// 고급 필터 자동 검색 이벤트 설정
window.initAdvancedFilterListeners = function () {
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

async function loadAllUsers(page = 1, userType = null) {
  try {
    currentUserPage = page;
    currentUserType = userType;

    const token = localStorage.getItem('wowcampus_token');
    if (!token) return;

    const search = document.getElementById('searchUsers')?.value || '';
    const status = document.getElementById('userStatusFilter')?.value || '';
    const typeFilter = document.getElementById('userTypeFilter')?.value || userType || '';

    // 고급 필터 값 수집 (존재하는 경우에만)
    const filters = {};
    if (document.getElementById('nationalityFilter')?.value) filters.nationality = document.getElementById('nationalityFilter').value;
    if (document.getElementById('visaStatusFilter')?.value) filters.visa_status = document.getElementById('visaStatusFilter').value;
    // ... 기타 필터들 (간략화를 위해 생략, 실제 구현 필요)

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search }),
      ...(status && { status }),
      ...(typeFilter && { user_type: typeFilter }),
      ...filters
    });

    const response = await fetch(`/api/admin/users?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('allUsersTableBody');
      if (!tbody) return;

      if (result.data.users.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              <div class="flex flex-col items-center justify-center">
                <i class="fas fa-search text-3xl mb-3 text-gray-300"></i>
                <p>검색 결과가 없습니다.</p>
              </div>
            </td>
          </tr>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
      }

      tbody.innerHTML = result.data.users.map(user => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold mr-3 text-xs">
                ${user.name.charAt(0)}
              </div>
              <div class="text-sm font-medium text-gray-900">${user.name}</div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.user_type === 'jobseeker' ? 'bg-green-100 text-green-800' :
          user.user_type === 'company' ? 'bg-purple-100 text-purple-800' :
            user.user_type === 'agent' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
        }">
              ${getUserTypeLabel(user.user_type)}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'approved' ? 'bg-green-100 text-green-800' :
          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
        }">
              ${getStatusLabel(user.status)}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${new Date(user.created_at).toLocaleDateString()}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button onclick="editUser(${user.id})" class="text-indigo-600 hover:text-indigo-900 mr-3" title="수정">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="toggleUserStatus(${user.id}, '${user.status}')" class="${user.status === 'suspended' ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'} mr-3" title="${user.status === 'suspended' ? '활성화' : '정지'}">
              <i class="fas ${user.status === 'suspended' ? 'fa-play' : 'fa-ban'}"></i>
            </button>
            <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');

      renderPagination(result.data.pagination);
    }
  } catch (error) {
    console.error('사용자 목록 로딩 오류:', error);
    toast.error('사용자 목록을 불러오는데 실패했습니다.');
  }
}

function renderPagination(pagination) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const { currentPage, totalPages } = pagination;
  let html = '';

  // 이전 버튼
  html += `
    <button onclick="loadAllUsers(${currentPage - 1}, '${currentUserType || ''}')" 
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}"
            ${currentPage === 1 ? 'disabled' : ''}>
      <span class="sr-only">이전</span>
      <i class="fas fa-chevron-left h-5 w-5"></i>
    </button>
  `;

  // 페이지 번호
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        html += `
          <button onclick="loadAllUsers(${i}, '${currentUserType || ''}')" 
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === i ? 'text-blue-600 bg-blue-50 border-blue-500 z-10' : 'text-gray-700 hover:bg-gray-50'}">
            ${i}
          </button>
        `;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        html += `<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>`;
      }
    } else {
      html += `
        <button onclick="loadAllUsers(${i}, '${currentUserType || ''}')" 
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === i ? 'text-blue-600 bg-blue-50 border-blue-500 z-10' : 'text-gray-700 hover:bg-gray-50'}">
          ${i}
        </button>
      `;
    }
  }

  // 다음 버튼
  html += `
    <button onclick="loadAllUsers(${currentPage + 1}, '${currentUserType || ''}')" 
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}"
            ${currentPage === totalPages ? 'disabled' : ''}>
      <span class="sr-only">다음</span>
      <i class="fas fa-chevron-right h-5 w-5"></i>
    </button>
  `;

  container.innerHTML = html;
}

// ============================================================
// 💼 에이전트 관리 로직 (Admin)
// ============================================================

function showAgentManagement() {
  document.getElementById('agentManagement').classList.remove('hidden');
  ['userManagementSection', 'partnerUniversityManagement', 'statsDetailContainer', 'jobManagement', 'jobSeekerManagement'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  loadAgentsForAdmin();
  setTimeout(() => {
    document.getElementById('agentManagement').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function hideAgentManagement() {
  document.getElementById('agentManagement').classList.add('hidden');
}

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

function displayAgentsTable(agents) {
  const tbody = document.getElementById('agentsTableBody');
  if (!tbody) return;

  tbody.innerHTML = agents.map(agent => {
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

    const placementsInfo = `총 ${agent.totalPlacements}건`;
    const commissionInfo = `수수료 ${agent.commissionRate}%`;
    const successRate = `<i class="fas fa-star text-yellow-500 mr-1"></i>${agent.successRate}%`;
    const countriesCount = `<i class="fas fa-globe text-blue-500 mr-1"></i>${agent.countriesCovered.length}개국`;
    const experienceYears = `<i class="fas fa-briefcase text-gray-500 mr-1"></i>${agent.experienceYears}년`;

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

function showAddAgentForm() {
  toast.info('에이전트 추가 기능은 준비 중입니다.');
}

function editAgent(agentId) {
  toast.info(`에이전트 수정 기능은 준비 중입니다. (ID: ${agentId})`);
}

// ============================================================
// 🏛️ 협약대학교 관리 로직 (Admin)
// ============================================================

function showPartnerUniversityManagement() {
  document.getElementById('partnerUniversityManagement').classList.remove('hidden');
  ['userManagementSection', 'agentManagement', 'statsDetailContainer', 'jobManagement', 'jobSeekerManagement'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  loadUniversitiesForAdmin();
  setTimeout(() => {
    document.getElementById('partnerUniversityManagement').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function hidePartnerUniversityManagement() {
  document.getElementById('partnerUniversityManagement').classList.add('hidden');
}

// 페이지네이션 상태
let universityCurrentPage = 1;
const universityItemsPerPage = 10;
let universityTotalPages = 1;

async function loadUniversitiesForAdmin(page = 1) {
  universityCurrentPage = page;

  try {
    const search = document.getElementById('searchUniversity')?.value || '';
    const region = document.getElementById('adminRegionFilter')?.value || '';

    const params = new URLSearchParams();
    // Region filter is handled client-side now for complex groups
    // if (region) params.append('region', region);

    const response = await fetch(`/api/partner-universities?${params}`);
    const result = await response.json();

    if (result.success) {
      let universities = result.universities;

      if (search) {
        universities = universities.filter(uni =>
          uni.name.toLowerCase().includes(search.toLowerCase()) ||
          (uni.englishName && uni.englishName.toLowerCase().includes(search.toLowerCase()))
        );
      }

      if (region) {
        if (region === '서울권') {
          universities = universities.filter(uni => uni.region === '서울특별시');
        } else if (region === '수도권') {
          universities = universities.filter(uni => ['경기도', '인천광역시'].includes(uni.region));
        } else if (region === '지방권') {
          universities = universities.filter(uni => !['서울특별시', '경기도', '인천광역시'].includes(uni.region));
        } else {
          universities = universities.filter(uni => uni.region === region);
        }
      }

      adminUniversitiesData = universities;

      // 페이지네이션 계산
      const totalItems = universities.length;
      universityTotalPages = Math.ceil(totalItems / universityItemsPerPage);

      // 현재 페이지 데이터 추출
      const startIdx = (universityCurrentPage - 1) * universityItemsPerPage;
      const endIdx = startIdx + universityItemsPerPage;
      const paginatedUniversities = universities.slice(startIdx, endIdx);

      displayUniversitiesTable(paginatedUniversities, totalItems);
      displayUniversityPagination();
    }
  } catch (error) {
    console.error('관리자 대학교 데이터 로드 오류:', error);
  }
}

// 페이지네이션 UI 렌더링
function displayUniversityPagination() {
  const container = document.getElementById('universityPagination');
  if (!container) return;

  if (universityTotalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let paginationHTML = '<div class="flex items-center justify-center gap-2 mt-4">';

  // 이전 버튼
  paginationHTML += `
    <button onclick="loadUniversitiesForAdmin(${universityCurrentPage - 1})" 
      class="px-3 py-2 rounded-lg ${universityCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border'}"
      ${universityCurrentPage === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  // 페이지 번호
  const maxVisiblePages = 5;
  let startPage = Math.max(1, universityCurrentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(universityTotalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationHTML += `<button onclick="loadUniversitiesForAdmin(1)" class="px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border">1</button>`;
    if (startPage > 2) {
      paginationHTML += '<span class="px-2 text-gray-500">...</span>';
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button onclick="loadUniversitiesForAdmin(${i})" 
        class="px-3 py-2 rounded-lg ${i === universityCurrentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}">
        ${i}
      </button>
    `;
  }

  if (endPage < universityTotalPages) {
    if (endPage < universityTotalPages - 1) {
      paginationHTML += '<span class="px-2 text-gray-500">...</span>';
    }
    paginationHTML += `<button onclick="loadUniversitiesForAdmin(${universityTotalPages})" class="px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border">${universityTotalPages}</button>`;
  }

  // 다음 버튼
  paginationHTML += `
    <button onclick="loadUniversitiesForAdmin(${universityCurrentPage + 1})" 
      class="px-3 py-2 rounded-lg ${universityCurrentPage === universityTotalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border'}"
      ${universityCurrentPage === universityTotalPages ? 'disabled' : ''}>
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  paginationHTML += '</div>';
  container.innerHTML = paginationHTML;
}

function displayUniversitiesTable(universities, totalCount) {
  const tbody = document.getElementById('universitiesTableBody');
  if (!tbody) return;

  // 총 개수 표시
  const countEl = document.getElementById('universityTotalCount');
  if (countEl) {
    countEl.textContent = `총 ${totalCount || universities.length}개`;
  }

  tbody.innerHTML = universities.map(uni => {
    const courseBadges = [
      uni.languageCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">어학연수</span>' : '',
      uni.undergraduateCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">학부과정</span>' : '',
      uni.graduateCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">대학원과정</span>' : ''
    ].filter(Boolean).join(' ');

    // 학비 정보 - NaN 방지
    let tuitionInfo = '문의 또는 정보없음';
    if (uni.tuitionFee) {
      const parsed = parseInt(uni.tuitionFee);
      if (!isNaN(parsed) && parsed > 0) {
        tuitionInfo = `${parsed.toLocaleString()}원/학기`;
      } else if (typeof uni.tuitionFee === 'string' && uni.tuitionFee.trim()) {
        tuitionInfo = uni.tuitionFee;
      }
    }

    // 장학금 요약
    const scholarshipSummary = uni.scholarships ?
      (uni.scholarships.length > 30 ? uni.scholarships.substring(0, 30) + '...' : uni.scholarships) :
      '정보 없음';

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
            <div class="text-xs text-gray-500 mt-1" title="${uni.scholarships || ''}">${scholarshipSummary}</div>
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
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-university text-blue-600 mr-2"></i> 기본 정보
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

          <div class="mb-6 mx-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-graduation-cap text-blue-600 mr-2"></i> 모집 과정
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

          <!-- 학비 및 장학금 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-won-sign text-green-600 mr-2"></i> 학비 및 장학금
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">학비 (학기당)</label>
                <input type="text" name="tuitionFee" placeholder="예: 300만원" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">기숙사비 (월)</label>
                <input type="text" name="dormitoryFee" placeholder="예: 30만원" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">장학금 정보</label>
                <textarea name="scholarships" rows="2" placeholder="예: 성적우수장학금 50%, 외국인특별장학금 등" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            </div>
          </div>

          <!-- 지원 요건 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-clipboard-check text-purple-600 mr-2"></i> 지원 요건
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">한국어 요건</label>
                <input type="text" name="koreanRequirement" placeholder="예: TOPIK 3급 이상" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">영어 요건</label>
                <input type="text" name="englishRequirement" placeholder="예: TOEFL 80 이상" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">기타 입학 요건</label>
                <textarea name="admissionRequirement" rows="2" placeholder="예: 고등학교 졸업 이상, 면접 필수 등" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            </div>
          </div>

          <!-- 편의시설 및 지원 서비스 -->
          <div class="mb-6 mx-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-concierge-bell text-green-600 mr-2"></i> 편의시설 및 지원 서비스
            </h3>
            <div class="grid md:grid-cols-3 gap-4">
              <div class="flex items-center">
                <input type="checkbox" name="dormitory" id="dormitory" class="w-4 h-4 text-green-600 mr-3">
                <label for="dormitory" class="text-sm font-medium text-gray-700">기숙사</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" name="airportPickup" id="airportPickup" class="w-4 h-4 text-green-600 mr-3">
                <label for="airportPickup" class="text-sm font-medium text-gray-700">공항픽업</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" name="buddyProgram" id="buddyProgram" class="w-4 h-4 text-green-600 mr-3">
                <label for="buddyProgram" class="text-sm font-medium text-gray-700">버디프로그램</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" name="koreanLanguageSupport" id="koreanLanguageSupport" class="w-4 h-4 text-green-600 mr-3">
                <label for="koreanLanguageSupport" class="text-sm font-medium text-gray-700">한국어지원</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" name="careerSupport" id="careerSupport" class="w-4 h-4 text-green-600 mr-3">
                <label for="careerSupport" class="text-sm font-medium text-gray-700">취업지원</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" name="partTimeWork" id="partTimeWork" class="w-4 h-4 text-green-600 mr-3">
                <label for="partTimeWork" class="text-sm font-medium text-gray-700">아르바이트 지원</label>
              </div>
            </div>
          </div>

          <!-- 학생 정보 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-users text-indigo-600 mr-2"></i> 학생 정보
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">총 재학생 수</label>
                <input type="number" name="studentCount" placeholder="예: 5000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">외국인 유학생 수</label>
                <input type="number" name="foreignStudentCount" placeholder="예: 500" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
          </div>

          <!-- 대학 소개 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-info-circle text-blue-600 mr-2"></i> 대학 소개
            </h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">대학 소개</label>
              <textarea name="description" rows="3" placeholder="대학교 소개 및 특징을 입력하세요" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">주요 특징 (쉼표로 구분)</label>
              <input type="text" name="features" placeholder="예: 국제교류 우수, 취업률 높음, 장학금 풍부" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">주요 전공 (쉼표로 구분)</label>
              <input type="text" name="majors" placeholder="예: 경영학, 컴퓨터공학, 한국어학" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <!-- 모집 일정 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-calendar-alt text-orange-600 mr-2"></i> 모집 일정
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">봄학기 모집</label>
                <input type="text" name="springAdmission" placeholder="예: 10월~12월" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">가을학기 모집</label>
                <input type="text" name="fallAdmission" placeholder="예: 4월~6월" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
          </div>

          <!-- 협력 형태 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-handshake text-teal-600 mr-2"></i> 협력 형태
            </h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">협력 유형</label>
              <select name="partnershipType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="교환학생">교환학생</option>
                <option value="복수학위">복수학위</option>
                <option value="정규입학">정규입학</option>
                <option value="어학연수">어학연수</option>
                <option value="기타">기타</option>
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

function closeUniversityForm() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    document.body.removeChild(modal);
    document.body.classList.remove('modal-open');
  }
}

async function saveUniversity(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const featuresText = formData.get('features') || '';
  const majorsText = formData.get('majors') || '';

  // 전체 필드 데이터
  const data = {
    name: formData.get('name'),
    englishName: formData.get('englishName'),
    region: formData.get('region'),
    address: formData.get('address') || '',
    website: formData.get('website'),
    contactEmail: formData.get('contactEmail') || '',
    contactPhone: formData.get('contactPhone') || '',
    establishedYear: formData.get('establishedYear') || null,

    // 모집 과정
    languageCourse: formData.get('languageCourse') === 'on',
    undergraduateCourse: formData.get('undergraduateCourse') === 'on',
    graduateCourse: formData.get('graduateCourse') === 'on',

    // 학비 및 장학금
    tuitionFee: formData.get('tuitionFee') || '',
    dormitoryFee: formData.get('dormitoryFee') || '',
    scholarships: formData.get('scholarships') || '',

    // 지원 요건
    koreanRequirement: formData.get('koreanRequirement') || '',
    englishRequirement: formData.get('englishRequirement') || '',
    admissionRequirement: formData.get('admissionRequirement') || '',

    // 편의시설 및 서비스
    dormitory: formData.get('dormitory') === 'on',
    airportPickup: formData.get('airportPickup') === 'on',
    buddyProgram: formData.get('buddyProgram') === 'on',
    koreanLanguageSupport: formData.get('koreanLanguageSupport') === 'on',
    careerSupport: formData.get('careerSupport') === 'on',
    partTimeWork: formData.get('partTimeWork') === 'on',

    // 학생 정보
    studentCount: parseInt(formData.get('studentCount')) || 0,
    foreignStudentCount: parseInt(formData.get('foreignStudentCount')) || 0,

    // 대학 소개
    description: formData.get('description') || '',
    features: featuresText.split(',').map(s => s.trim()).filter(s => s),
    majors: majorsText.split(',').map(s => s.trim()).filter(s => s),

    // 모집 일정
    springAdmission: formData.get('springAdmission') || '',
    fallAdmission: formData.get('fallAdmission') || '',

    // 협력 형태
    partnershipType: formData.get('partnershipType') || '교환학생',
    ranking: 0,
  };

  try {
    const response = await fetch('/api/partner-universities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

async function deleteUniversity(id) {
  showConfirm({
    title: '대학교 삭제',
    message: '정말로 이 대학교를 삭제하시겠습니까?',
    type: 'danger',
    onConfirm: async () => {
      try {
        const response = await fetch(`/api/partner-universities/${id}`, { method: 'DELETE' });
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


function showUniversityModal(id) {
  const uni = adminUniversitiesData.find(u => u.id === id);
  if (!uni) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.onclick = (e) => {
    if (e.target === modal) closeUniversityModal();
  };

  const courseBadges = [
    uni.languageCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">어학연수</span>' : '',
    uni.undergraduateCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">학부과정</span>' : '',
    uni.graduateCourse ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">대학원과정</span>' : ''
  ].filter(Boolean).join(' ');

  const services = [
    uni.dormitory ? '<div class="flex items-center text-sm text-gray-700"><i class="fas fa-check text-green-500 mr-2"></i>기숙사</div>' : '<div class="flex items-center text-sm text-gray-400"><i class="fas fa-times text-gray-300 mr-2"></i>기숙사</div>',
    uni.airportPickup ? '<div class="flex items-center text-sm text-gray-700"><i class="fas fa-check text-green-500 mr-2"></i>공항픽업</div>' : '<div class="flex items-center text-sm text-gray-400"><i class="fas fa-times text-gray-300 mr-2"></i>공항픽업</div>',
    uni.buddyProgram ? '<div class="flex items-center text-sm text-gray-700"><i class="fas fa-check text-green-500 mr-2"></i>버디프로그램</div>' : '<div class="flex items-center text-sm text-gray-400"><i class="fas fa-times text-gray-300 mr-2"></i>버디프로그램</div>',
    uni.careerSupport ? '<div class="flex items-center text-sm text-gray-700"><i class="fas fa-check text-green-500 mr-2"></i>취업지원</div>' : '<div class="flex items-center text-sm text-gray-400"><i class="fas fa-times text-gray-300 mr-2"></i>취업지원</div>'
  ].join('');

  modal.innerHTML = `
    <div class="modal-content bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">${uni.name}</h2>
        <button onclick="closeUniversityModal()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <div class="p-6 space-y-6">
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-1">${uni.englishName || ''}</h3>
                <p class="text-sm text-gray-600"><i class="fas fa-map-marker-alt mr-1"></i> ${uni.region} ${uni.address ? ' - ' + uni.address : ''}</p>
                 ${uni.website ? `<a href="${uni.website.startsWith('http') ? uni.website : 'http://' + uni.website}" target="_blank" class="text-blue-600 hover:underline text-sm mt-1 inline-block"><i class="fas fa-external-link-alt mr-1"></i> 웹사이트 방문</a>` : ''}
            </div>
             <div class="text-right">
                <p class="text-xs text-gray-500">설립: ${uni.establishedYear || '-'}년</p>
            </div>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">모집 과정</h4>
            <div class="flex flex-wrap gap-2">
                ${courseBadges || '<span class="text-sm text-gray-500">정보 없음</span>'}
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
             <div>
                <h4 class="font-medium text-gray-900 mb-2">주요 서비스</h4>
                <div class="space-y-1">
                    ${services}
                </div>
            </div>
            <div>
                 <h4 class="font-medium text-gray-900 mb-2">연락처 정보</h4>
                 <div class="space-y-2 text-sm">
                    <p><span class="text-gray-500 w-16 inline-block">이메일:</span> ${uni.contactEmail || '-'}</p>
                    <p><span class="text-gray-500 w-16 inline-block">전화:</span> ${uni.contactPhone || '-'}</p>
                 </div>
            </div>
        </div>
        
        <div class="border-t pt-4">
             <h4 class="font-medium text-gray-900 mb-2">장학금 정보</h4>
             <p class="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-100">
                ${uni.scholarshipInfo || '등록된 장학금 정보가 없습니다.'}
             </p>
        </div>
        
        <div class="border-t pt-4 text-right">
             <button onclick="editUniversity(${uni.id}); closeUniversityModal();" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <i class="fas fa-edit mr-2"></i>정보 수정
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

function editUniversity(id) {
  const uni = adminUniversitiesData.find(u => u.id === id);
  if (!uni) return;

  showAddUniversityForm();

  // Wait for modal to be added to DOM
  setTimeout(() => {
    const form = document.getElementById('universityForm');
    if (!form) return;

    // Change title
    form.querySelector('h2').textContent = '협약대학교 수정';

    // Add hidden ID field
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.name = 'id';
    idInput.value = uni.id;
    form.appendChild(idInput);

    // Populate fields - 기본 정보
    if (form.elements.name) form.elements.name.value = uni.name || '';
    if (form.elements.englishName) form.elements.englishName.value = uni.englishName || '';
    if (form.elements.region) form.elements.region.value = uni.region || '';
    if (form.elements.address) form.elements.address.value = uni.address || '';
    if (form.elements.website) form.elements.website.value = uni.website || '';
    if (form.elements.contactEmail) form.elements.contactEmail.value = uni.contactEmail || '';
    if (form.elements.contactPhone) form.elements.contactPhone.value = uni.contactPhone || '';
    if (form.elements.establishedYear) form.elements.establishedYear.value = uni.establishedYear || '';

    // 모집 과정 체크박스
    if (form.elements.languageCourse) form.elements.languageCourse.checked = uni.languageCourse;
    if (form.elements.undergraduateCourse) form.elements.undergraduateCourse.checked = uni.undergraduateCourse;
    if (form.elements.graduateCourse) form.elements.graduateCourse.checked = uni.graduateCourse;

    // 학비 및 장학금
    if (form.elements.tuitionFee) form.elements.tuitionFee.value = uni.tuitionFee || '';
    if (form.elements.dormitoryFee) form.elements.dormitoryFee.value = uni.dormitoryFee || '';
    if (form.elements.scholarships) form.elements.scholarships.value = uni.scholarships || '';

    // 지원 요건
    if (form.elements.koreanRequirement) form.elements.koreanRequirement.value = uni.koreanRequirement || '';
    if (form.elements.englishRequirement) form.elements.englishRequirement.value = uni.englishRequirement || '';
    if (form.elements.admissionRequirement) form.elements.admissionRequirement.value = uni.admissionRequirement || '';

    // 편의시설 체크박스
    if (form.elements.dormitory) form.elements.dormitory.checked = uni.dormitory;
    if (form.elements.airportPickup) form.elements.airportPickup.checked = uni.airportPickup;
    if (form.elements.buddyProgram) form.elements.buddyProgram.checked = uni.buddyProgram;
    if (form.elements.koreanLanguageSupport) form.elements.koreanLanguageSupport.checked = uni.koreanLanguageSupport;
    if (form.elements.careerSupport) form.elements.careerSupport.checked = uni.careerSupport;
    if (form.elements.partTimeWork) form.elements.partTimeWork.checked = uni.partTimeWork;

    // 학생 정보
    if (form.elements.studentCount) form.elements.studentCount.value = uni.studentCount || '';
    if (form.elements.foreignStudentCount) form.elements.foreignStudentCount.value = uni.foreignStudentCount || '';

    // 대학 소개
    if (form.elements.description) form.elements.description.value = uni.description || '';
    if (form.elements.features) form.elements.features.value = Array.isArray(uni.features) ? uni.features.join(', ') : '';
    if (form.elements.majors) form.elements.majors.value = Array.isArray(uni.majors) ? uni.majors.join(', ') : '';

    // 모집 일정
    if (form.elements.springAdmission) form.elements.springAdmission.value = uni.springAdmission || '';
    if (form.elements.fallAdmission) form.elements.fallAdmission.value = uni.fallAdmission || '';

    // 협력 형태
    if (form.elements.partnershipType) form.elements.partnershipType.value = uni.partnershipType || '교환학생';

    // Update save handler to handle update
    form.onsubmit = async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      const featuresText = formData.get('features') || '';
      const majorsText = formData.get('majors') || '';

      // Read all fields from form
      const data = {
        id: uni.id,
        name: formData.get('name'),
        englishName: formData.get('englishName'),
        region: formData.get('region'),
        address: formData.get('address') || '',
        website: formData.get('website'),
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone'),
        establishedYear: formData.get('establishedYear'),

        // Checkboxes - 모집 과정
        languageCourse: formData.get('languageCourse') === 'on',
        undergraduateCourse: formData.get('undergraduateCourse') === 'on',
        graduateCourse: formData.get('graduateCourse') === 'on',

        // 학비 및 장학금
        tuitionFee: formData.get('tuitionFee') || '',
        dormitoryFee: formData.get('dormitoryFee') || '',
        scholarships: formData.get('scholarships') || '',

        // 지원 요건
        koreanRequirement: formData.get('koreanRequirement') || '',
        englishRequirement: formData.get('englishRequirement') || '',
        admissionRequirement: formData.get('admissionRequirement') || '',

        // 편의시설/서비스 체크박스
        dormitory: formData.get('dormitory') === 'on',
        airportPickup: formData.get('airportPickup') === 'on',
        buddyProgram: formData.get('buddyProgram') === 'on',
        koreanLanguageSupport: formData.get('koreanLanguageSupport') === 'on',
        careerSupport: formData.get('careerSupport') === 'on',
        partTimeWork: formData.get('partTimeWork') === 'on',

        // 학생 정보
        studentCount: parseInt(formData.get('studentCount')) || 0,
        foreignStudentCount: parseInt(formData.get('foreignStudentCount')) || 0,

        // 대학 소개
        description: formData.get('description') || '',
        features: featuresText.split(',').map(s => s.trim()).filter(s => s),
        majors: majorsText.split(',').map(s => s.trim()).filter(s => s),

        // 모집 일정
        springAdmission: formData.get('springAdmission') || '',
        fallAdmission: formData.get('fallAdmission') || '',

        // 협력 형태
        partnershipType: formData.get('partnershipType') || '교환학생',
        ranking: uni.ranking || 0,
      };

      try {
        const response = await fetch(`/api/partner-universities/${uni.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
          toast.success('협약대학교 정보가 수정되었습니다.');
          closeUniversityForm();
          loadUniversitiesForAdmin();
        } else {
          toast.error('수정 실패: ' + result.message);
        }
      } catch (error) {
        console.error('수정 오류:', error);
        toast.error('수정 중 오류가 발생했습니다.');
      }
    };
  }, 50);
}

function exportUniversitiesData() {
  // CSV 내보내기 로직
  const csvContent = "data:text/csv;charset=utf-8," +
    "대학교명,영문명,지역,순위,재학생수,외국인학생수,학비,협력형태,홈페이지\\n" +
    adminUniversitiesData.map(uni =>
      `"${uni.name}","${uni.englishName}","${uni.region}",${uni.ranking || 0},${uni.studentCount || 0},${uni.foreignStudentCount || 0},"${uni.tuitionFee}","${uni.partnershipType}","${uni.website}"`
    ).join("\\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `협약대학교_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



// ============================================================
// 👥 상세 사용자 관리 로직 (수정/삭제/상태변경)
// ============================================================

async function editUser(userId) {
  try {
    const token = localStorage.getItem('wowcampus_token');
    const response = await fetch(`/api/admin/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        const user = result.data.user;
        const profile = result.data.profile;

        const form = document.getElementById('editUserForm');
        if (form) {
          let idInput = form.querySelector('input[name="userId"]');
          if (!idInput) {
            idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.name = 'userId';
            form.appendChild(idInput);
          }
          idInput.value = user.id;

          if (form.elements['name']) form.elements['name'].value = user.name;
          if (form.elements['email']) form.elements['email'].value = user.email;
          if (form.elements['status']) form.elements['status'].value = user.status;
          if (form.elements['user_type']) form.elements['user_type'].value = user.user_type;

          // Jobseeker Specific Fields
          const jobFields = document.getElementById('editJobseekerFields');
          if (jobFields) {
            if (user.user_type === 'jobseeker' && profile) {
              jobFields.classList.remove('hidden');
              // Populate
              if (document.getElementById('editJobMajor')) document.getElementById('editJobMajor').value = profile.major || '';
              if (document.getElementById('editJobEducation')) document.getElementById('editJobEducation').value = profile.education_level || '';
              if (document.getElementById('editJobNationality')) document.getElementById('editJobNationality').value = profile.nationality || '';
              if (document.getElementById('editJobVisa')) document.getElementById('editJobVisa').value = profile.visa_status || '';
              if (document.getElementById('editJobKorean')) document.getElementById('editJobKorean').value = profile.korean_level || '';
              if (document.getElementById('editJobExperience')) document.getElementById('editJobExperience').value = profile.experience_years || 0;
              if (document.getElementById('editJobBio')) document.getElementById('editJobBio').value = profile.bio || '';
            } else {
              jobFields.classList.add('hidden');
            }
          }

          if (!form.dataset.listenerAttached) {
            form.addEventListener('submit', saveUserEdit);
            form.dataset.listenerAttached = 'true';
          }

          const modal = document.getElementById('editUserModal');
          if (modal) modal.classList.remove('hidden');
        }
      }
    }
  } catch (error) {
    console.error('Failed to load user details:', error);
    toast.error('사용자 정보를 불러오는데 실패했습니다.');
  }
}

function closeEditUserModal() {
  const modal = document.getElementById('editUserModal');
  if (modal) modal.classList.add('hidden');
}

async function saveUserEdit(e) {
  e.preventDefault();
  const form = e.target;
  const userId = form.querySelector('input[name="userId"]').value;

  const data = {
    name: form.elements['name'].value,
    email: form.elements['email'].value,
    status: form.elements['status'].value,
    user_type: form.elements['user_type'].value
  };

  // Collect Jobseeker Data if visible
  const jobFields = document.getElementById('editJobseekerFields');
  if (jobFields && !jobFields.classList.contains('hidden')) {
    data.major = document.getElementById('editJobMajor').value;
    data.education_level = document.getElementById('editJobEducation').value;
    data.nationality = document.getElementById('editJobNationality').value;
    data.visa_status = document.getElementById('editJobVisa').value;
    data.korean_level = document.getElementById('editJobKorean').value;
    data.experience_years = document.getElementById('editJobExperience').value;
    data.bio = document.getElementById('editJobBio').value;
  }

  try {
    const token = localStorage.getItem('wowcampus_token');
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.success) {
      toast.success('사용자 정보가 수정되었습니다.');
      closeEditUserModal();
      loadAllUsers(currentUserPage);
    } else {
      toast.error(result.message || '수정 실패');
    }
  } catch (error) {
    console.error('Failed to save user:', error);
    toast.error('오류가 발생했습니다.');
  }
}

async function toggleUserStatus(userId, currentStatus) {
  const newStatus = currentStatus === 'suspended' ? 'approved' : 'suspended';
  const actionText = newStatus === 'suspended' ? '정지' : '활성화';

  showConfirm({
    title: `사용자 ${actionText}`,
    message: `정말로 이 사용자를 ${actionText} 하시겠습니까?`,
    type: newStatus === 'suspended' ? 'warning' : 'info',
    onConfirm: async () => {
      try {
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(`/api/admin/users/${userId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();
        if (result.success) {
          toast.success(`사용자가 ${actionText} 되었습니다.`);
          loadAllUsers(currentUserPage);
        } else {
          toast.error(result.message || '상태 변경 실패');
        }
      } catch (e) {
        console.error(e);
        toast.error('오류 발생');
      }
    }
  });
}

function deleteUser(userId) {
  showConfirm({
    title: '사용자 삭제',
    message: '정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    type: 'danger',
    confirmText: '삭제',
    onConfirm: async () => {
      try {
        const token = localStorage.getItem('wowcampus_token');
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          toast.success('사용자가 삭제되었습니다.');
          loadAllUsers(currentUserPage);
        } else {
          toast.error(result.message || '삭제 실패');
        }
      } catch (e) {
        console.error(e);
        toast.error('오류 발생');
      }
    }
  });
}

// ============================================================
// 📊 통계 상세 로직
// ============================================================

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
    if (targetSection) targetSection.classList.add('hidden');
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
    setTimeout(() => {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    loadStatsDetailData(type);
  }
}

async function loadStatsDetailData(type) {
  const token = localStorage.getItem('wowcampus_token');
  try {
    switch (type) {
      case 'jobs': await loadJobsDetail(token); break;
      case 'jobseekers': await loadJobseekersDetail(token); break;
      case 'universities': await loadUniversitiesDetail(token); break;
      case 'matches': await loadMatchesDetail(token); break;
    }
  } catch (error) {
    console.error('Failed to load detail data:', error);
  }
}

async function loadJobsDetail(token) {
  try {
    const response = await fetch('/api/admin/jobs/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();

      // 통계 업데이트
      if (document.getElementById('activeJobsCount')) document.getElementById('activeJobsCount').textContent = data.active || 0;
      if (document.getElementById('pendingJobsCount')) document.getElementById('pendingJobsCount').textContent = data.pending || 0;
      if (document.getElementById('closedJobsCount')) document.getElementById('closedJobsCount').textContent = data.closed || 0;

      // 최근 공고 목록
      const listContainer = document.getElementById('recentJobsList');
      if (listContainer) {
        if (data.recentJobs && data.recentJobs.length > 0) {
          listContainer.innerHTML = data.recentJobs.slice(0, 5).map(job => `
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">${job.title}</h4>
                  <p class="text-sm text-gray-600 mt-1">${job.company} • ${job.location}</p>
                  <p class="text-xs text-gray-500 mt-1">${new Date(job.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' :
              job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
            }">${job.status === 'active' ? '활성' : job.status === 'pending' ? '대기' : '마감'}</span>
              </div>
            `).join('');
        } else {
          listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 구인정보가 없습니다.</p>';
        }
      }
    }
  } catch (error) {
    console.error('Failed to load jobs detail:', error);
    const listContainer = document.getElementById('recentJobsList');
    if (listContainer) listContainer.innerHTML = '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
  }
}

async function loadJobseekersDetail(token) {
  try {
    const response = await fetch('/api/admin/jobseekers/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();

      // 통계 업데이트
      if (document.getElementById('activeJobseekersCount')) document.getElementById('activeJobseekersCount').textContent = data.active || 0;
      if (document.getElementById('pendingJobseekersCount')) document.getElementById('pendingJobseekersCount').textContent = data.pending || 0;
      if (document.getElementById('chinaJobseekersCount')) document.getElementById('chinaJobseekersCount').textContent = data.china || 0;
      if (document.getElementById('otherJobseekersCount')) document.getElementById('otherJobseekersCount').textContent = data.other || 0;

      // 최근 구직자 목록
      const listContainer = document.getElementById('recentJobseekersList');
      if (listContainer) {
        if (data.recentJobseekers && data.recentJobseekers.length > 0) {
          listContainer.innerHTML = data.recentJobseekers.slice(0, 5).map(js => `
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">${js.name}</h4>
                  <p class="text-sm text-gray-600 mt-1">${js.nationality} • ${js.education || '정보없음'}</p>
                  <p class="text-xs text-gray-500 mt-1">${new Date(js.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${js.status === 'approved' ? 'bg-green-100 text-green-700' :
              js.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
            }">${js.status === 'approved' ? '승인' : js.status === 'pending' ? '대기' : '거부'}</span>
              </div>
            `).join('');
        } else {
          listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 구직자가 없습니다.</p>';
        }
      }
    }
  } catch (error) {
    console.error('Failed to load jobseekers detail:', error);
    const listContainer = document.getElementById('recentJobseekersList');
    if (listContainer) listContainer.innerHTML = '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
  }
}

async function loadUniversitiesDetail(token) {
  try {
    const response = await fetch('/api/admin/universities/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();

      // 지역별 통계 처리
      const regionCounts = { seoul: 0, metropolitan: 0, regional: 0 };

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
      if (document.getElementById('seoulUnivCount')) document.getElementById('seoulUnivCount').textContent = regionCounts.seoul;
      if (document.getElementById('metropolitanUnivCount')) document.getElementById('metropolitanUnivCount').textContent = regionCounts.metropolitan;
      if (document.getElementById('regionalUnivCount')) document.getElementById('regionalUnivCount').textContent = regionCounts.regional;

      // 대학교 목록
      const listContainer = document.getElementById('universitiesList');
      if (listContainer) {
        if (data.recentUniversities && data.recentUniversities.length > 0) {
          listContainer.innerHTML = data.recentUniversities.map(univ => {
            const partnershipLabel = univ.partnership_type === 'mou' ? 'MOU' :
              univ.partnership_type === 'partnership' ? '파트너십' : '협약';

            return `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${univ.name}</h4>
                    <p class="text-sm text-gray-600 mt-1">${univ.region} • ${univ.english_name || ''}</p>
                    ${univ.student_count ? `<p class="text-xs text-gray-500 mt-1">재학생: ${univ.student_count.toLocaleString()}명 ${univ.foreign_student_count ? `(외국인: ${univ.foreign_student_count.toLocaleString()})` : ''}</p>` : ''}
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">${partnershipLabel}</span>
                </div>
              `;
          }).join('');
        } else {
          listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 협약대학교가 없습니다.</p>';
        }
      }
    }
  } catch (error) {
    console.error('Failed to load universities detail:', error);
    const listContainer = document.getElementById('universitiesList');
    if (listContainer) listContainer.innerHTML = '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
  }
}

async function loadMatchesDetail(token) {
  try {
    const response = await fetch('/api/admin/matches/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();

      // 통계 업데이트
      if (document.getElementById('thisMonthMatches')) document.getElementById('thisMonthMatches').textContent = data.thisMonth || 0;
      if (document.getElementById('inProgressMatches')) document.getElementById('inProgressMatches').textContent = data.inProgress || 0;
      if (document.getElementById('completedMatches')) document.getElementById('completedMatches').textContent = data.completed || 0;
      if (document.getElementById('successRate')) document.getElementById('successRate').textContent = data.successRate ? data.successRate.toFixed(1) + '%' : '0%';

      // 최근 매칭 목록
      const listContainer = document.getElementById('recentMatchesList');
      if (listContainer) {
        if (data.recentMatches && data.recentMatches.length > 0) {
          listContainer.innerHTML = data.recentMatches.map(match => `
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">${match.job_title || '직무 정보 없음'}</h4>
                  <p class="text-sm text-gray-600 mt-1">${match.jobseeker_name || '구직자'} • 매칭점수: ${match.match_score || 0}점</p>
                  <p class="text-xs text-gray-500 mt-1">${new Date(match.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${match.status === 'applied' ? 'bg-blue-100 text-blue-700' :
              match.status === 'interested' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
            }">${match.status === 'applied' ? '지원완료' :
              match.status === 'interested' ? '관심' :
                match.status === 'viewed' ? '확인' : '제안'
            }</span>
              </div>
            `).join('');
        } else {
          listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">매칭 내역이 없습니다.</p>';
        }
      }
    }
  } catch (error) {
    console.error('Failed to load matches detail:', error);
    const listContainer = document.getElementById('recentMatchesList');
    if (listContainer) listContainer.innerHTML = '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
  }
}

function addScrollNavigationStyles() {
  const styleId = 'scroll-navigation-styles';
  if (document.getElementById(styleId)) return; // 이미 추가됨

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* 스크롤 오프셋 (고정 헤더를 고려) */
    .scroll-mt-4 {
      scroll-margin-top: 1rem;
    }
    
    /* 섹션 하이라이트 효과 */
    .section-highlighted {
      animation: sectionHighlight 3s ease-in-out;
      border-left: 4px solid #3B82F6;
      padding-left: 1rem;
    }
    
    @keyframes sectionHighlight {
      0% {
        background-color: rgba(59, 130, 246, 0.1);
        transform: translateX(-4px);
      }
      15% {
        background-color: rgba(59, 130, 246, 0.15);
        transform: translateX(0);
      }
      100% {
        background-color: transparent;
        transform: translateX(0);
      }
    }
    
    /* 부드러운 스크롤 */
    html {
      scroll-behavior: smooth;
    }
    
    /* 섹션 간 구분을 위한 추가 스타일 */
    #userManagementSection,
    #partnerUniversityManagement,
    #agentManagement {
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }
  `;
  document.head.appendChild(style);
}

// Ensure styles are added
if (typeof window !== 'undefined') {
  addScrollNavigationStyles();
}



function scrollToStatistics() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 모바일 사이드바 토글 함수
function toggleMobileSidebar() {
  const mobileSidebar = document.getElementById('mobile-sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');

  if (mobileSidebar && overlay) {
    const isHidden = mobileSidebar.classList.contains('-translate-x-full');
    if (isHidden) {
      mobileSidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      mobileSidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
}

// Admin Dashboard Init
function initializeAdminDashboard() {
  console.log('Admin Dashboard Initialized');

  // 검색 입력 필드 엔터키 이벤트
  const searchUsersInput = document.getElementById('searchUsers');
  if (searchUsersInput && !searchUsersInput.dataset.listenerAttached) {
    searchUsersInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        loadAllUsers();
      }
    });
    searchUsersInput.dataset.listenerAttached = 'true';
  }

  // 사용자 승인 버튼 이벤트 리스너 추가 (데스크탑)
  const btnShowUserManagement = document.getElementById('btn-showUserManagement');
  if (btnShowUserManagement && !btnShowUserManagement.dataset.listenerAttached) {
    btnShowUserManagement.addEventListener('click', function (e) {
      e.preventDefault();
      showUserManagement();
    });
    btnShowUserManagement.dataset.listenerAttached = 'true';
  }

  // 사용자 승인 버튼 이벤트 리스너 추가 (모바일)
  const btnShowUserManagementMobile = document.getElementById('btn-showUserManagement-mobile');
  if (btnShowUserManagementMobile && !btnShowUserManagementMobile.dataset.listenerAttached) {
    btnShowUserManagementMobile.addEventListener('click', function (e) {
      e.preventDefault();
      showUserManagement();
      toggleMobileSidebar();
    });
    btnShowUserManagementMobile.dataset.listenerAttached = 'true';
  }

  loadAdminStatistics();

  // 초기 탭 로드
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  const editUserId = params.get('editUserId');

  if (tab === 'users' || (!tab && editUserId)) {
    // If editUserId is present, show 'all' tab directly. Otherwise default to pending.
    const initialTab = editUserId ? 'all' : 'pending';
    showUserManagement(initialTab);

    // If editUserId is present, open edit modal
    if (editUserId) {
      console.log('Auto-opening edit modal for:', editUserId);

      // Wait a bit for DOM to be ready inside showUserManagement
      setTimeout(() => {
        console.log('Calling editUser now for:', editUserId);
        editUser(editUserId);
      }, 800);
    }
  } else if (tab === 'agents') {
    showAgentManagement();
  } else if (tab === 'universities') {
    showPartnerUniversityManagement();
  } else if (tab === 'jobs') {
    showJobManagement();
  }
}

// ============================================================
// 📋 구인공고 관리 (Admin Job Management)
// ============================================================

let adminJobsData = [];
let jobCurrentPage = 1;
const jobItemsPerPage = 10;
let jobTotalPages = 1;

function showJobManagement() {
  // 다른 섹션 숨기기
  document.getElementById('userManagementSection')?.classList.add('hidden');
  document.getElementById('partnerUniversityManagement')?.classList.add('hidden');
  document.getElementById('agentManagement')?.classList.add('hidden');
  document.getElementById('jobSeekerManagement')?.classList.add('hidden');

  // 구인공고 관리 섹션 표시
  document.getElementById('jobManagement')?.classList.remove('hidden');
  loadJobsForAdmin();

  setTimeout(() => {
    document.getElementById('jobManagement')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function hideJobManagement() {
  document.getElementById('jobManagement')?.classList.add('hidden');
}

async function loadJobsForAdmin(page = 1) {
  jobCurrentPage = page;
  const token = localStorage.getItem('wowcampus_token');

  try {
    const search = document.getElementById('searchJob')?.value || '';
    const status = document.getElementById('jobStatusFilter')?.value || '';

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', '100');

    const response = await fetch(`/api/jobs?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (result.success) {
      let jobs = result.data || [];

      // 검색어 필터
      if (search) {
        jobs = jobs.filter(job =>
          job.title?.toLowerCase().includes(search.toLowerCase()) ||
          job.company_name?.toLowerCase().includes(search.toLowerCase())
        );
      }

      adminJobsData = jobs;

      // 페이지네이션
      const totalItems = jobs.length;
      jobTotalPages = Math.ceil(totalItems / jobItemsPerPage);

      const startIdx = (jobCurrentPage - 1) * jobItemsPerPage;
      const endIdx = startIdx + jobItemsPerPage;
      const paginatedJobs = jobs.slice(startIdx, endIdx);

      displayJobsTable(paginatedJobs, totalItems);
      displayJobPagination();
    }
  } catch (error) {
    console.error('구인공고 로드 오류:', error);
    toast.error('구인공고 목록을 불러오는데 실패했습니다.');
  }
}

function displayJobsTable(jobs, totalCount) {
  const tbody = document.getElementById('jobsTableBody');
  if (!tbody) return;

  const countEl = document.getElementById('jobTotalCount');
  if (countEl) {
    countEl.textContent = `총 ${totalCount || jobs.length}개`;
  }

  if (jobs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
          <i class="fas fa-inbox text-4xl mb-4"></i>
          <p>등록된 구인공고가 없습니다.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = jobs.map(job => {
    const statusBadge = {
      'active': '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">진행중</span>',
      'draft': '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">임시저장</span>',
      'closed': '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">마감</span>'
    }[job.status] || '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">알수없음</span>';

    const salaryInfo = job.salary_min && job.salary_max
      ? `${(job.salary_min / 10000).toFixed(0)}~${(job.salary_max / 10000).toFixed(0)}만원`
      : '협의';

    const createdDate = job.created_at ? new Date(job.created_at).toLocaleDateString('ko-KR') : '-';

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4">
          <div class="text-sm font-medium text-gray-900">${job.title || '제목 없음'}</div>
          <div class="text-xs text-gray-500">${job.job_category || ''} · ${job.job_type || ''}</div>
          <div class="text-xs text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${job.location || ''}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900">${job.company_name || '회사 정보 없음'}</div>
          <div class="text-xs text-gray-500">${job.industry || ''}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900">${salaryInfo}</div>
        </td>
        <td class="px-6 py-4">${statusBadge}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${createdDate}</td>
        <td class="px-6 py-4">
          <div class="flex space-x-2">
            <button onclick="editJob(${job.id})" class="text-blue-600 hover:text-blue-900" title="수정">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteJob(${job.id})" class="text-red-600 hover:text-red-900" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function displayJobPagination() {
  const container = document.getElementById('jobPagination');
  if (!container || jobTotalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '<div class="flex items-center justify-center gap-2">';

  // 이전 버튼
  html += `<button onclick="loadJobsForAdmin(${jobCurrentPage - 1})" 
    class="px-3 py-2 rounded-lg ${jobCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border'}"
    ${jobCurrentPage === 1 ? 'disabled' : ''}>
    <i class="fas fa-chevron-left"></i>
  </button>`;

  // 페이지 번호
  for (let i = 1; i <= Math.min(jobTotalPages, 5); i++) {
    html += `<button onclick="loadJobsForAdmin(${i})" 
      class="px-3 py-2 rounded-lg ${i === jobCurrentPage ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}">
      ${i}
    </button>`;
  }

  // 다음 버튼
  html += `<button onclick="loadJobsForAdmin(${jobCurrentPage + 1})" 
    class="px-3 py-2 rounded-lg ${jobCurrentPage === jobTotalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border'}"
    ${jobCurrentPage === jobTotalPages ? 'disabled' : ''}>
    <i class="fas fa-chevron-right"></i>
  </button>`;

  html += '</div>';
  container.innerHTML = html;
}


function openJobModal(jobData = null) {
  const isEdit = !!jobData;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

  // Track where the mouse down occurred
  let isMouseDownOnOverlay = false;

  modal.onmousedown = (e) => {
    isMouseDownOnOverlay = e.target === modal;
  };

  modal.onclick = (e) => {
    // Only close if both mousedown and click (mouseup) happened on the overlay
    if (e.target === modal && isMouseDownOnOverlay) {
      closeJobForm();
    }
    isMouseDownOnOverlay = false; // Reset
  };

  const title = isEdit ? '구인공고 수정' : '새 구인공고 등록';
  const icon = isEdit ? 'fa-edit' : 'fa-plus-circle';
  const btnText = isEdit ? '수정' : '등록';

  // Helper for safe value
  const val = (key) => jobData ? (jobData[key] || '') : '';
  const sel = (key, opt) => (jobData && jobData[key] === opt) ? 'selected' : '';
  const chk = (key) => (jobData && !!jobData[key]) ? 'checked' : '';

  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
        <h3 class="text-xl font-semibold text-gray-900"><i class="fas ${icon} mr-2 text-green-600"></i>${title}</h3>
        <button onclick="closeJobForm()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="jobForm" onsubmit="saveJob(event)" class="p-6">
        ${isEdit ? `<input type="hidden" name="id" value="${jobData.id}">` : ''}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">공고 제목 *</label>
            <input type="text" name="title" required class="w-full px-3 py-2 border rounded-lg" placeholder="예: 외국인 생산직 채용" value="${val('title')}">
          </div>
          
          <div class="md:col-span-2 border-t pt-4 mt-2">
            <h4 class="text-sm font-semibold text-gray-700 mb-3"><i class="fas fa-building mr-2"></i>회사 정보</h4>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">회사명 *</label>
            <input type="text" name="company_name" required class="w-full px-3 py-2 border rounded-lg" placeholder="회사명 입력" value="${val('company_name')}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">업종</label>
            <select name="company_industry" class="w-full px-3 py-2 border rounded-lg">
              <option value="">선택</option>
              <option value="제조업" ${sel('company_industry', '제조업') || sel('industry', '제조업')}>제조업</option>
              <option value="건설업" ${sel('company_industry', '건설업') || sel('industry', '건설업')}>건설업</option>
              <option value="IT/소프트웨어" ${sel('company_industry', 'IT/소프트웨어') || sel('industry', 'IT/소프트웨어')}>IT/소프트웨어</option>
              <option value="서비스업" ${sel('company_industry', '서비스업') || sel('industry', '서비스업')}>서비스업</option>
              <option value="요식업" ${sel('company_industry', '요식업') || sel('industry', '요식업')}>요식업</option>
              <option value="농축산업" ${sel('company_industry', '농축산업') || sel('industry', '농축산업')}>농축산업</option>
              <option value="물류/운송" ${sel('company_industry', '물류/운송') || sel('industry', '물류/운송')}>물류/운송</option>
              <option value="기타" ${sel('company_industry', '기타') || sel('industry', '기타')}>기타</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">회사 주소</label>
            <input type="text" name="company_address" class="w-full px-3 py-2 border rounded-lg" placeholder="근무지 주소" value="${val('company_address') || val('address') || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">회사 규모</label>
            <select name="company_size" class="w-full px-3 py-2 border rounded-lg">
              <option value="">선택</option>
              <option value="1-10" ${sel('company_size', '1-10')}>1-10명</option>
              <option value="11-50" ${sel('company_size', '11-50') || sel('company_size', 'small')}>11-50명</option>
              <option value="51-100" ${sel('company_size', '51-100') || sel('company_size', 'medium')}>51-100명</option>
              <option value="101-300" ${sel('company_size', '101-300')}>101-300명</option>
              <option value="300+" ${sel('company_size', '300+') || sel('company_size', 'large')}>300명 이상</option>
            </select>
          </div>
          
          <div class="md:col-span-2 border-t pt-4 mt-2">
            <h4 class="text-sm font-semibold text-gray-700 mb-3"><i class="fas fa-briefcase mr-2"></i>채용 정보</h4>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">직무 분류 *</label>
            <select name="job_category" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">선택</option>
              <option value="제조/생산" ${sel('job_category', '제조/생산')}>제조/생산</option>
              <option value="건설/현장" ${sel('job_category', '건설/현장')}>건설/현장</option>
              <option value="요식/서비스" ${sel('job_category', '요식/서비스')}>요식/서비스</option>
              <option value="IT/개발" ${sel('job_category', 'IT/개발')}>IT/개발</option>
              <option value="사무/관리" ${sel('job_category', '사무/관리')}>사무/관리</option>
              <option value="물류/운송" ${sel('job_category', '물류/운송')}>물류/운송</option>
              <option value="농축산" ${sel('job_category', '농축산')}>농축산</option>
              <option value="기타" ${sel('job_category', '기타')}>기타</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">고용 형태 *</label>
            <select name="job_type" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">선택</option>
              <option value="정규직" ${sel('job_type', '정규직')}>정규직</option>
              <option value="계약직" ${sel('job_type', '계약직')}>계약직</option>
              <option value="파트타임" ${sel('job_type', '파트타임')}>파트타임</option>
              <option value="인턴" ${sel('job_type', '인턴')}>인턴</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">근무지 *</label>
            <input type="text" name="location" required class="w-full px-3 py-2 border rounded-lg" placeholder="예: 경기도 안산시" value="${val('location')}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">모집인원</label>
            <input type="number" name="positions_available" class="w-full px-3 py-2 border rounded-lg" value="${val('positions_available') || 1}" min="1">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">최소 급여 (원)</label>
            <input type="number" name="salary_min" class="w-full px-3 py-2 border rounded-lg" placeholder="예: 2000000" value="${val('salary_min')}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">최대 급여 (원)</label>
            <input type="number" name="salary_max" class="w-full px-3 py-2 border rounded-lg" placeholder="예: 3000000" value="${val('salary_max')}">
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">상세 설명 *</label>
            <textarea name="description" required rows="4" class="w-full px-3 py-2 border rounded-lg" placeholder="직무 내용, 근무 조건 등을 상세히 기재해주세요">${val('description')}</textarea>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">자격 요건</label>
            <textarea name="requirements" rows="3" class="w-full px-3 py-2 border rounded-lg" placeholder="필요한 자격 요건을 기재해주세요">${val('requirements')}</textarea>
          </div>
          
          <div class="md:col-span-2 border-t pt-4 mt-2">
            <h4 class="text-sm font-semibold text-gray-700 mb-3"><i class="fas fa-passport mr-2"></i>비자 및 기타</h4>
          </div>
          <div>
            <label class="flex items-center text-sm">
              <input type="checkbox" name="visa_sponsorship" class="mr-2" ${chk('visa_sponsorship')}>
              비자 스폰서십 제공
            </label>
          </div>
          <div>
            <label class="flex items-center text-sm">
              <input type="checkbox" name="korean_required" class="mr-2" ${chk('korean_required')}>
              한국어 필수
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">경력 요구</label>
            <select name="experience_level" class="w-full px-3 py-2 border rounded-lg">
              <option value="">무관</option>
              <option value="신입" ${sel('experience_level', '신입') || sel('experience_level', 'entry')}>신입</option>
              <option value="1-3년" ${sel('experience_level', '1-3년') || sel('experience_level', 'junior')}>1-3년</option>
              <option value="3-5년" ${sel('experience_level', '3-5년') || sel('experience_level', 'mid')}>3-5년</option>
              <option value="5년 이상" ${sel('experience_level', '5년 이상') || sel('experience_level', 'senior')}>5년 이상</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">공고 상태</label>
            <select name="status" class="w-full px-3 py-2 border rounded-lg">
              <option value="active" ${sel('status', 'active')}>진행중</option>
              <option value="draft" ${sel('status', 'draft')}>임시저장</option>
              <option value="closed" ${sel('status', 'closed')}>마감</option>
            </select>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" onclick="closeJobForm()" class="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">취소</button>
          <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <i class="fas fa-save mr-2"></i>${btnText}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

function showAddJobForm() {
  openJobModal();
}

function closeJobForm() {
  document.querySelector('.modal-overlay')?.remove();
}

async function saveJob(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const token = localStorage.getItem('wowcampus_token');

  const data = {
    title: formData.get('title'),
    company_name: formData.get('company_name'),
    company_industry: formData.get('company_industry') || null,
    company_address: formData.get('company_address') || null,
    company_size: formData.get('company_size') || null,
    job_category: formData.get('job_category'),
    job_type: formData.get('job_type'),
    location: formData.get('location'),
    positions_available: parseInt(formData.get('positions_available')) || 1,
    salary_min: parseInt(formData.get('salary_min')) || null,
    salary_max: parseInt(formData.get('salary_max')) || null,
    description: formData.get('description'),
    requirements: formData.get('requirements') || null,
    visa_sponsorship: formData.get('visa_sponsorship') === 'on',
    korean_required: formData.get('korean_required') === 'on',
    experience_level: formData.get('experience_level') || null,
    status: formData.get('status') || 'active'
  };

  const idValue = formData.get('id');
  const isEdit = !!idValue;

  try {
    const url = isEdit ? `/api/jobs/${idValue}` : '/api/jobs';
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      toast.success(isEdit ? '구인공고가 수정되었습니다!' : '구인공고가 성공적으로 등록되었습니다!');
      closeJobForm();
      loadJobsForAdmin();
    } else {
      toast.error('오류: ' + (result.message || (isEdit ? '수정 실패' : '등록 실패')));
    }
  } catch (error) {
    console.error(isEdit ? '구인공고 수정 오류:' : '구인공고 저장 오류:', error);
    toast.error('오류가 발생했습니다.');
  }
}

async function editJob(id) {
  const job = adminJobsData.find(j => j.id === id);
  if (!job) {
    toast.error('공고 정보를 찾을 수 없습니다.');
    return;
  }
  openJobModal(job);
}

async function deleteJob(id) {
  if (!confirm('이 구인공고를 삭제하시겠습니까?')) return;

  const token = localStorage.getItem('wowcampus_token');

  try {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (result.success) {
      toast.success('구인공고가 삭제되었습니다.');
      loadJobsForAdmin();
    } else {
      toast.error('삭제 실패: ' + (result.message || ''));
    }
  } catch (error) {
    console.error('구인공고 삭제 오류:', error);
    toast.error('삭제 중 오류가 발생했습니다.');
  }
}

// 전역 노출
window.showJobManagement = showJobManagement;
window.hideJobManagement = hideJobManagement;
window.loadJobsForAdmin = loadJobsForAdmin;
window.showAddJobForm = showAddJobForm;
window.closeJobForm = closeJobForm;
window.saveJob = saveJob;
window.editJob = editJob;
window.deleteJob = deleteJob;

// ============================================================
// 🧑‍💼 구직자 정보 관리 (Job Seeker Management)
// ============================================================

let jobSeekerCurrentPage = 1;
const jobSeekerItemsPerPage = 20;
let jobSeekerTotalPages = 1;

function showJobSeekerManagement() {
  // Hide other sections
  document.getElementById('userManagementSection')?.classList.add('hidden');
  document.getElementById('partnerUniversityManagement')?.classList.add('hidden');
  document.getElementById('statsDetailContainer')?.classList.add('hidden');
  document.getElementById('agentManagement')?.classList.add('hidden');
  document.getElementById('jobManagement')?.classList.add('hidden');

  // Show
  document.getElementById('jobSeekerManagement')?.classList.remove('hidden');

  loadJobSeekersForAdmin();

  setTimeout(() => {
    document.getElementById('jobSeekerManagement')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function hideJobSeekerManagement() {
  document.getElementById('jobSeekerManagement')?.classList.add('hidden');
}

async function loadJobSeekersForAdmin(page = 1) {
  jobSeekerCurrentPage = page;
  const token = localStorage.getItem('wowcampus_token');

  try {
    const search = document.getElementById('searchJobSeeker')?.value || '';
    const nationality = document.getElementById('jobSeekerNationalityFilter')?.value || '';
    const status = document.getElementById('jobSeekerStatusFilter')?.value || 'all';

    const params = new URLSearchParams();
    params.append('user_type', 'jobseeker');
    params.append('page', page.toString());
    params.append('limit', jobSeekerItemsPerPage.toString());

    if (search) params.append('search', search);
    if (nationality) params.append('nationality', nationality);
    if (status !== 'all') params.append('status', status);

    const response = await fetch(`/api/admin/users?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (result.success) {
      const users = result.data.users || [];
      const total = result.data.pagination?.totalItems || 0;
      jobSeekerTotalPages = result.data.pagination?.totalPages || 1;

      displayJobSeekersTable(users, total);
      displayJobSeekerPagination();
    } else {
      toast.error('구직자 목록 로드 실패: ' + (result.message || ''));
    }
  } catch (error) {
    console.error('구직자 데이터 로드 오류:', error);
    toast.error('구직자 목록을 불러오는데 실패했습니다.');
  }
}

function displayJobSeekersTable(users, totalCount) {
  const tbody = document.getElementById('jobSeekersTableBody');
  if (!tbody) return;

  const countEl = document.getElementById('jobSeekerTotalCount');
  if (countEl) {
    countEl.textContent = `총 ${totalCount}명`;
  }

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
          <i class="fas fa-user-slash text-4xl mb-4"></i>
          <p>등록된 구직자가 없습니다.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => {
    const statusStyles = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'suspended': 'bg-gray-100 text-gray-800'
    };
    const statusLabels = {
      'approved': '승인됨',
      'pending': '대기중',
      'rejected': '반려됨',
      'suspended': '정지됨'
    };
    const statusClass = statusStyles[user.status] || 'bg-gray-100 text-gray-800';
    const statusText = statusLabels[user.status] || user.status;
    const nationality = user.nationality || '-';
    // const visa = user.visa_status || '-'; // Assuming user object might not implement this yet fully in backend response w/o join details known.
    // If backend returns joined fields as properties of user object:
    const visa = user.visa_status || '-';
    const location = user.preferred_location || '-';

    const createdDate = new Date(user.created_at).toLocaleDateString('ko-KR');

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-6 py-4">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
              ${user.name.charAt(0)}
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">${user.name}</div>
              <div class="text-xs text-gray-500">${user.email}</div>
              ${user.phone ? `<div class="text-xs text-gray-400">${user.phone}</div>` : ''}
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900">${nationality}</div>
          <div class="text-xs text-gray-500">${visa}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900">${location}</div>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 text-xs rounded-full ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-500">
          ${createdDate}
        </td>
        <td class="px-6 py-4">
          <div class="flex space-x-2">
            <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-900" title="수정">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function displayJobSeekerPagination() {
  const container = document.getElementById('jobSeekerPagination');
  if (!container || jobSeekerTotalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '<div class="flex items-center justify-center gap-2">';

  html += `<button onclick="loadJobSeekersForAdmin(${jobSeekerCurrentPage - 1})" 
    class="px-3 py-2 rounded-lg ${jobSeekerCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border'}"
    ${jobSeekerCurrentPage === 1 ? 'disabled' : ''}>
    <i class="fas fa-chevron-left"></i>
  </button>`;

  for (let i = 1; i <= Math.min(jobSeekerTotalPages, 5); i++) {
    html += `<button onclick="loadJobSeekersForAdmin(${i})" 
      class="px-3 py-2 rounded-lg ${i === jobSeekerCurrentPage ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}">
      ${i}
    </button>`;
  }

  html += `<button onclick="loadJobSeekersForAdmin(${jobSeekerCurrentPage + 1})" 
    class="px-3 py-2 rounded-lg ${jobSeekerCurrentPage === jobSeekerTotalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border'}"
    ${jobSeekerCurrentPage === jobSeekerTotalPages ? 'disabled' : ''}>
    <i class="fas fa-chevron-right"></i>
  </button>`;

  html += '</div>';
  container.innerHTML = html;
}

// Global exports for Job Seeker Management
window.showJobSeekerManagement = showJobSeekerManagement;
window.hideJobSeekerManagement = hideJobSeekerManagement;
window.loadJobSeekersForAdmin = loadJobSeekersForAdmin;

// Global exports for Admin Dashboard
window.loadAdminStatistics = loadAdminStatistics;
window.showUserManagement = showUserManagement;
window.hideUserManagement = hideUserManagement;
window.loadPendingUsers = loadPendingUsers;
window.approveUser = approveUser;
window.rejectUser = rejectUser;
window.switchUserTab = switchUserTab;
window.loadAllUsers = loadAllUsers;
window.showAgentManagement = showAgentManagement;
window.hideAgentManagement = hideAgentManagement;
window.loadAgentsForAdmin = loadAgentsForAdmin;
window.deleteAgent = deleteAgent;
window.editAgent = editAgent;
window.showPartnerUniversityManagement = showPartnerUniversityManagement;
window.hidePartnerUniversityManagement = hidePartnerUniversityManagement;
window.loadUniversitiesForAdmin = loadUniversitiesForAdmin;
window.editUser = editUser;
window.closeEditUserModal = closeEditUserModal;
window.saveUserEdit = saveUserEdit;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.toggleStatsDetail = toggleStatsDetail;
window.scrollToStatistics = scrollToStatistics;
window.toggleMobileSidebar = toggleMobileSidebar;
// window.loadUsersByType = loadUsersByType; // Removed as it is not defined
window.deleteUniversity = deleteUniversity;
window.saveUniversity = saveUniversity;
window.closeUniversityForm = closeUniversityForm;
window.showAddUniversityForm = showAddUniversityForm;
window.editUniversity = editUniversity;
window.showUniversityModal = showUniversityModal;
window.closeUniversityModal = closeUniversityModal;

window.showAgentModal = showAgentModal;
window.closeAgentModal = closeAgentModal;
window.showAddAgentForm = showAddAgentForm;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdminDashboard);
} else {
  initializeAdminDashboard();
}
