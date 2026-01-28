console.log('Jobseeker Dashboard script loaded');

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
    `;
        return;
    }

    // 로딩 표시
    listContainer.innerHTML = `
    <div class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-600">구직자 정보를 불러오는 중...</p>
    </div>
  `;

    try {
        const response = await fetch('/api/jobseekers?limit=20&offset=0', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('구직자 목록 API 응답:', data);

        // 401 Unauthorized - 로그인 필요
        if (response.status === 401) {
            console.log('인증 실패 - 로그인 필요');
            listContainer.innerHTML = `
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
      `;
            return;
        }

        if (data.success && data.data) {
            const jobseekers = data.data;

            if (jobseekers.length === 0) {
                listContainer.innerHTML = `
          <div class="text-center py-12">
            <i class="fas fa-user-slash text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">등록된 구직자가 없습니다.</p>
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
                      <span class="ml-1">${jobseeker.nationality || '정보없음'}</span>
                    </span>
                    <span>•</span>
                    <span>${jobseeker.experience || '경력정보없음'}</span>
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
                자세히 보기 <i class="fas fa-arrow-right ml-1"></i>
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
                'Authorization': `Bearer ${token}`,
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
                'Authorization': `Bearer ${token}`,
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
                'Authorization': `Bearer ${token}`
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
                'Authorization': `Bearer ${token}`
            },
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
                'Authorization': `Bearer ${token}`
            },
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
                'Authorization': `Bearer ${token}`,
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
