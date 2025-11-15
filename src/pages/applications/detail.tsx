/**
 * Page Component
 * Route: /applications/:id
 * 지원자 상세 페이지 (구인기업 전용)
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const applicationId = c.req.param('id');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABlCAYAAAD3Xd5lAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QsMBR0y8emRNAAAcSJJREFUeNrtfWeYlEUa7amqL3Wa7p4IDAw5m0BUVDBgRkyYc06YI66BNWfMrgGzmAMoZlFRBBGQnMMwOXdPT8cvVdX90T0Iguvu6q7ee/vw9DM8M1256tRbVW8A8sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPP7LIH9m4e81SQKgEEC7FoQAQRhACoB9hPG/qdr9c2oQ0FVaH09VrGrvMOotS1KNoX+Bn/QLFrQ5QrTdsWfP/EzZAi+9+xM8Xk/JTz8tLVqyeLVsj3VAUQz0qCghe+xx0OrVq0tNIpnmZx2zb76z/h/EvY99gcJwqHTZypWFq9euk7H2DhQUBNG7dynZYVBvs0eP7jXxeEKce8r+f3jZ/zErPPH1Ckgpdv6mruGEdocpBjWkIH44NM3CLDLn3VN3+vCh2bXimn1Gb0sS36zEjj2LlZnLai5qEf6jaloTS5mwnZIK3w6w4xt8mdQ9krGWF088ZLtl3zp9AShk39URcV4l5wRKAoYdgtcUtEdBYu7Ubxoup18++1fr/npNEh5NVX/aVF1Yt6l1z5RU97U0Y1yE0OIOECmJRBEFDUq+MOTac1S475V0LVotHO48MGbwNvkd+tTbgJS9bb3wfMoKqSmTcBRBAtzLh/j8r61qi62cefHe263Lo1+vQUXAUD5d03hSpRA7Q3JemKawmIcFvZm1e3VteeGiA8eLX2vLxe/OQlBh41YkzX2RYVwSFZaUrMhJbSpKtD2bNALuK1cc/bsnysVX3g8pHK05kh4SS9rjXaGOcgUZ3t6eEpblglEFXi8loTDaTSv2UWlhaPbAngNnn3Li+GgmY9qjRvb4l8q56YEXwV13zy+/mntMNGYJBRQUAplMhgwfsXNy//32fDIeT0ZvueLY38yr77BjQKR1tENCe7vwc0okKE+yHQaWb7j0whOfe3/G13zKIxP/5T4oG3QEdtlp8JBNNZFTTYsqFKq0LAuD+hWIo48c9RznovLqC48HABx50gRIKfesrbaOcRwmHNkGoigg0g8pJQAJwSmkBCgDVB0IBj1kYL8eaTNtvz2ob//GDz75NLbo+1e3qcfDT70PzvmQ6Z98c8bG2igYVcAUP6SIs9Ji+WNTi/lu3dJp/7Qt48+47vQfF9bu5HAPp6oDQUwEvV7Rr1f5c1LKys/evner71/7t8fguKYWibg7NTTFj3akuo8gZKdYIiks2wFjKgI+kKBfiTQ1NHy449D+MVUl7+wwtF/jl1/Pjn85/ak/hLCU/zRhJJMG5bzZJji... (line truncated)" alt="WOW CAMPUS" class="h-12" />
              <span class="text-2xl font-bold text-purple-600">WOW CAMPUS</span>
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
          
          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-auth-buttons">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 상단 네비게이션 */}
        <div class="mb-6">
          <a href="/dashboard" class="text-blue-600 hover:underline flex items-center">
            <i class="fas fa-arrow-left mr-2"></i>
            대시보드로 돌아가기
          </a>
        </div>

        {/* 로딩 인디케이터 */}
        <div id="loading-indicator" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p class="text-gray-600">지원자 정보를 불러오는 중...</p>
        </div>

        {/* 지원자 상세 컨텐츠 */}
        <div id="applicant-detail-content" class="hidden">
          {/* 지원자 기본 정보 카드 */}
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center">
                <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-purple-600 text-3xl"></i>
                </div>
                <div class="ml-6">
                  <h1 id="applicant-name" class="text-3xl font-bold text-gray-900 mb-2">-</h1>
                  <div class="flex items-center space-x-4 text-gray-600">
                    <span id="applicant-nationality" class="flex items-center">
                      <i class="fas fa-globe mr-2"></i>-
                    </span>
                    <span id="applicant-korean-level" class="flex items-center">
                      <i class="fas fa-language mr-2"></i>-
                    </span>
                    <span id="applicant-experience" class="flex items-center">
                      <i class="fas fa-briefcase mr-2"></i>-
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 상태 뱃지 */}
              <div id="status-badge-container">
                <span id="status-badge" class="px-4 py-2 rounded-full text-sm font-medium">-</span>
              </div>
            </div>

            {/* 연락처 정보 */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm text-gray-600 mb-1">이메일</p>
                <p id="applicant-email" class="font-medium text-gray-900">-</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">전화번호</p>
                <p id="applicant-phone" class="font-medium text-gray-900">-</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">지원일</p>
                <p id="applied-date" class="font-medium text-gray-900">-</p>
              </div>
            </div>
          </div>

          {/* 그리드 레이아웃 */}
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽 컬럼 - 상세 정보 */}
            <div class="lg:col-span-2 space-y-6">
              {/* 지원 공고 정보 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-briefcase text-blue-600 mr-2"></i>
                  지원 공고
                </h2>
                <div class="space-y-3">
                  <div>
                    <p class="text-sm text-gray-600">공고명</p>
                    <p id="job-title" class="font-medium text-gray-900 text-lg">-</p>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-600">근무지</p>
                      <p id="job-location" class="font-medium text-gray-900">-</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">급여</p>
                      <p id="job-salary" class="font-medium text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 자기소개서 / 커버레터 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-file-alt text-green-600 mr-2"></i>
                  자기소개서
                </h2>
                <div id="cover-letter-content" class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  제출된 자기소개서가 없습니다.
                </div>
              </div>

              {/* 학력 및 경력 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-graduation-cap text-purple-600 mr-2"></i>
                  학력 및 경력
                </h2>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-600">학력</p>
                    <p id="education" class="font-medium text-gray-900">-</p>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-600">학교</p>
                      <p id="school" class="font-medium text-gray-900">-</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">전공</p>
                      <p id="major" class="font-medium text-gray-900">-</p>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">경력</p>
                    <p id="experience-years" class="font-medium text-gray-900">-</p>
                  </div>
                </div>
              </div>

              {/* 스킬 및 자격증 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-award text-orange-600 mr-2"></i>
                  스킬 및 자격증
                </h2>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-600 mb-2">보유 스킬</p>
                    <div id="skills-tags" class="flex flex-wrap gap-2">
                      <span class="text-gray-500 text-sm">등록된 스킬이 없습니다</span>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 mb-2">자격증</p>
                    <div id="certifications-list" class="text-gray-700">
                      등록된 자격증이 없습니다
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 mb-2">언어 능력</p>
                    <div id="languages-list" class="text-gray-700">
                      등록된 언어 능력이 없습니다
                    </div>
                  </div>
                </div>
              </div>

              {/* 자기소개 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-user-circle text-indigo-600 mr-2"></i>
                  자기소개
                </h2>
                <div id="bio-content" class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  등록된 자기소개가 없습니다.
                </div>
              </div>
            </div>

            {/* 오른쪽 컬럼 - 액션 및 추가 정보 */}
            <div class="space-y-6">
              {/* 상태 변경 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">지원 상태 관리</h3>
                <div class="space-y-3">
                  <button onclick="updateStatus('reviewed')" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-check mr-2"></i>검토 중으로 변경
                  </button>
                  <button onclick="updateStatus('interview_scheduled')" class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <i class="fas fa-calendar mr-2"></i>면접 예정으로 변경
                  </button>
                  <button onclick="updateStatus('offered')" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <i class="fas fa-thumbs-up mr-2"></i>합격 제안
                  </button>
                  <button onclick="updateStatus('rejected')" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <i class="fas fa-times mr-2"></i>불합격 처리
                  </button>
                </div>
              </div>

              {/* 추가 정보 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">추가 정보</h3>
                <div class="space-y-3 text-sm">
                  <div>
                    <p class="text-gray-600">생년월일</p>
                    <p id="birth-date" class="font-medium text-gray-900">-</p>
                  </div>
                  <div>
                    <p class="text-gray-600">성별</p>
                    <p id="gender" class="font-medium text-gray-900">-</p>
                  </div>
                  <div>
                    <p class="text-gray-600">주소</p>
                    <p id="address" class="font-medium text-gray-900">-</p>
                  </div>
                  <div>
                    <p class="text-gray-600">취업 가능 여부</p>
                    <p id="work-eligibility" class="font-medium text-gray-900">-</p>
                  </div>
                  <div>
                    <p class="text-gray-600">비자 상태</p>
                    <p id="visa-status" class="font-medium text-gray-900">-</p>
                  </div>
                  <div>
                    <p class="text-gray-600">입사 가능일</p>
                    <p id="available-start-date" class="font-medium text-gray-900">-</p>
                  </div>
                  <div>
                    <p class="text-gray-600">희망 급여</p>
                    <p id="expected-salary" class="font-medium text-gray-900">-</p>
                  </div>
                </div>
              </div>

              {/* 빠른 액션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">빠른 액션</h3>
                <div class="space-y-2">
                  <a id="contact-email-btn" href="#" class="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <i class="fas fa-envelope mr-2"></i>이메일 보내기
                  </a>
                  <a id="contact-phone-btn" href="#" class="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <i class="fas fa-phone mr-2"></i>전화하기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        <div id="error-message" class="hidden text-center py-12">
          <i class="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p id="error-text" class="text-gray-600 mb-4">지원자 정보를 불러올 수 없습니다.</p>
          <a href="/dashboard" class="text-blue-600 hover:underline">대시보드로 돌아가기</a>
        </div>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // Application ID from URL
        const applicationId = '${applicationId}';
        
        // Toast 알림 유틸리티
        function showToast(message, type = 'info') {
          const colors = {
            success: { bg: '#10b981', border: '#059669', icon: '✓' },
            error: { bg: '#ef4444', border: '#dc2626', icon: '✕' },
            warning: { bg: '#f59e0b', border: '#d97706', icon: '⚠' },
            info: { bg: '#3b82f6', border: '#2563eb', icon: 'ℹ' }
          };
          
          const style = colors[type] || colors.info;
          
          const toastEl = document.createElement('div');
          toastEl.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            background: \${style.bg};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            border-left: 4px solid \${style.border};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
          \`;
          
          toastEl.innerHTML = \`
            <span style="font-size: 20px; font-weight: bold;">\${style.icon}</span>
            <span style="flex: 1;">\${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
          \`;
          
          document.body.appendChild(toastEl);
          
          setTimeout(() => {
            toastEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toastEl.remove(), 300);
          }, 3000);
        }
        
        // 페이지 로드 시 데이터 불러오기
        document.addEventListener('DOMContentLoaded', async () => {
          await loadApplicationDetail();
        });
        
        // 지원자 상세 정보 로드
        async function loadApplicationDetail() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              showError('로그인이 필요합니다.');
              setTimeout(() => window.location.href = '/login', 2000);
              return;
            }
            
            const response = await fetch(\`/api/applications/\${applicationId}\`, {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const data = await response.json();
            
            if (!data.success) {
              showError(data.message || '지원자 정보를 불러올 수 없습니다.');
              return;
            }
            
            displayApplicationDetail(data.application);
            
          } catch (error) {
            console.error('지원자 정보 로드 오류:', error);
            showError('지원자 정보를 불러오는 중 오류가 발생했습니다.');
          }
        }
        
        // 지원자 상세 정보 표시
        function displayApplicationDetail(app) {
          // 로딩 숨기고 컨텐츠 표시
          document.getElementById('loading-indicator').classList.add('hidden');
          document.getElementById('applicant-detail-content').classList.remove('hidden');
          
          // 기본 정보
          const fullName = \`\${app.first_name || ''} \${app.last_name || ''}\`.trim() || '이름 없음';
          document.getElementById('applicant-name').textContent = fullName;
          document.getElementById('applicant-nationality').innerHTML = \`<i class="fas fa-globe mr-2"></i>\${app.nationality || '-'}\`;
          document.getElementById('applicant-korean-level').innerHTML = \`<i class="fas fa-language mr-2"></i>한국어 \${app.korean_level || '-'}\`;
          document.getElementById('applicant-experience').innerHTML = \`<i class="fas fa-briefcase mr-2"></i>경력 \${app.experience_years || '0'}년\`;
          
          // 연락처
          document.getElementById('applicant-email').textContent = app.email || '-';
          document.getElementById('applicant-phone').textContent = app.phone || '-';
          document.getElementById('applied-date').textContent = new Date(app.applied_at).toLocaleDateString('ko-KR');
          
          // 상태 뱃지
          const statusColors = {
            submitted: 'bg-yellow-100 text-yellow-800',
            reviewed: 'bg-blue-100 text-blue-800',
            interview_scheduled: 'bg-purple-100 text-purple-800',
            interview_completed: 'bg-purple-200 text-purple-900',
            offered: 'bg-green-100 text-green-800',
            accepted: 'bg-green-200 text-green-900',
            rejected: 'bg-red-100 text-red-800',
            withdrawn: 'bg-gray-100 text-gray-800'
          };
          
          const statusLabels = {
            submitted: '지원 완료',
            reviewed: '검토 중',
            interview_scheduled: '면접 예정',
            interview_completed: '면접 완료',
            offered: '합격 제안',
            accepted: '최종 합격',
            rejected: '불합격',
            withdrawn: '지원 취소'
          };
          
          const statusColor = statusColors[app.status] || 'bg-gray-100 text-gray-800';
          const statusLabel = statusLabels[app.status] || app.status;
          document.getElementById('status-badge').textContent = statusLabel;
          document.getElementById('status-badge').className = \`px-4 py-2 rounded-full text-sm font-medium \${statusColor}\`;
          
          // 공고 정보
          document.getElementById('job-title').textContent = app.job_title || '-';
          document.getElementById('job-location').textContent = app.job_location || '-';
          
          const salaryText = app.salary_min && app.salary_max 
            ? \`\${app.salary_min.toLocaleString()}원 ~ \${app.salary_max.toLocaleString()}원\`
            : '협의';
          document.getElementById('job-salary').textContent = salaryText;
          
          // 자기소개서
          if (app.cover_letter) {
            document.getElementById('cover-letter-content').textContent = app.cover_letter;
          }
          
          // 학력 및 경력
          document.getElementById('education').textContent = app.education || '-';
          document.getElementById('school').textContent = app.school || '-';
          document.getElementById('major').textContent = app.major || '-';
          document.getElementById('experience-years').textContent = app.experience_years ? \`\${app.experience_years}년\` : '-';
          
          // 스킬
          if (app.skills) {
            try {
              const skills = typeof app.skills === 'string' ? JSON.parse(app.skills) : app.skills;
              if (Array.isArray(skills) && skills.length > 0) {
                document.getElementById('skills-tags').innerHTML = skills.map(skill => 
                  \`<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">\${skill}</span>\`
                ).join('');
              }
            } catch (e) {
              console.error('스킬 파싱 오류:', e);
            }
          }
          
          // 자격증
          if (app.certifications) {
            try {
              const certs = typeof app.certifications === 'string' ? JSON.parse(app.certifications) : app.certifications;
              if (Array.isArray(certs) && certs.length > 0) {
                document.getElementById('certifications-list').innerHTML = certs.map(cert => 
                  \`<div class="flex items-start mb-2"><i class="fas fa-certificate text-orange-600 mr-2 mt-1"></i><span>\${cert}</span></div>\`
                ).join('');
              }
            } catch (e) {
              console.error('자격증 파싱 오류:', e);
            }
          }
          
          // 언어
          if (app.languages) {
            try {
              const langs = typeof app.languages === 'string' ? JSON.parse(app.languages) : app.languages;
              if (Array.isArray(langs) && langs.length > 0) {
                document.getElementById('languages-list').innerHTML = langs.map(lang => 
                  \`<div class="flex items-start mb-2"><i class="fas fa-language text-green-600 mr-2 mt-1"></i><span>\${lang}</span></div>\`
                ).join('');
              }
            } catch (e) {
              console.error('언어 파싱 오류:', e);
            }
          }
          
          // 자기소개
          if (app.bio) {
            document.getElementById('bio-content').textContent = app.bio;
          }
          
          // 추가 정보
          document.getElementById('birth-date').textContent = app.birth_date ? new Date(app.birth_date).toLocaleDateString('ko-KR') : '-';
          document.getElementById('gender').textContent = app.gender === 'male' ? '남성' : app.gender === 'female' ? '여성' : '-';
          document.getElementById('address').textContent = app.address || '-';
          document.getElementById('work-eligibility').textContent = app.work_eligibility || '-';
          document.getElementById('visa-status').textContent = app.visa_status || '-';
          document.getElementById('available-start-date').textContent = app.available_start_date ? new Date(app.available_start_date).toLocaleDateString('ko-KR') : '-';
          document.getElementById('expected-salary').textContent = app.expected_salary ? \`\${parseInt(app.expected_salary).toLocaleString()}원\` : '-';
          
          // 연락처 링크
          if (app.email) {
            document.getElementById('contact-email-btn').href = \`mailto:\${app.email}\`;
          }
          if (app.phone) {
            document.getElementById('contact-phone-btn').href = \`tel:\${app.phone}\`;
          }
        }
        
        // 상태 업데이트
        async function updateStatus(newStatus) {
          const statusLabels = {
            submitted: '지원 완료',
            reviewed: '검토 중',
            interview_scheduled: '면접 예정',
            interview_completed: '면접 완료',
            offered: '합격 제안',
            accepted: '최종 합격',
            rejected: '불합격',
            withdrawn: '지원 취소'
          };
          
          const confirmMessage = \`지원 상태를 "\${statusLabels[newStatus]}"(으)로 변경하시겠습니까?\`;
          
          if (!confirm(confirmMessage)) {
            return;
          }
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            const response = await fetch(\`/api/applications/\${applicationId}\`, {
              method: 'PATCH',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: newStatus })
            });
            
            const data = await response.json();
            
            if (data.success) {
              showToast('✅ 지원 상태가 변경되었습니다.', 'success');
              // 페이지 새로고침
              setTimeout(() => window.location.reload(), 1000);
            } else {
              showToast('❌ ' + (data.message || '상태 변경에 실패했습니다.'), 'error');
            }
            
          } catch (error) {
            console.error('상태 변경 오류:', error);
            showToast('❌ 상태 변경 중 오류가 발생했습니다.', 'error');
          }
        }
        
        // 에러 표시
        function showError(message) {
          document.getElementById('loading-indicator').classList.add('hidden');
          document.getElementById('error-message').classList.remove('hidden');
          document.getElementById('error-text').textContent = message;
        }
        
        // CSS 애니메이션
        if (!document.getElementById('toast-animations')) {
          const style = document.createElement('style');
          style.id = 'toast-animations';
          style.textContent = \`
            @keyframes slideInRight {
              from { transform: translateX(100px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(100px); opacity: 0; }
            }
          \`;
          document.head.appendChild(style);
        }
      `}}>
      </script>
    </div>
  )
}
