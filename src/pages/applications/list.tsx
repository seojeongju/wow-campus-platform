/**
 * Page Component
 * Route: /applications/list
 * 전체 지원자 목록 페이지 (구인기업 전용)
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
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
        <div class="flex items-center justify-between mb-6">
          <div>
            <a href="/dashboard" class="text-blue-600 hover:underline flex items-center mb-2">
              <i class="fas fa-arrow-left mr-2"></i>
              대시보드로 돌아가기
            </a>
            <h1 class="text-3xl font-bold text-gray-900">지원자 목록</h1>
            <p class="text-gray-600 mt-2">우리 회사에 지원한 모든 지원자를 확인하세요</p>
          </div>
        </div>

        {/* 필터 및 검색 바 */}
        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 상태 필터 */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">지원 상태</label>
              <select id="status-filter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">전체</option>
                <option value="submitted">지원 완료</option>
                <option value="reviewed">검토 중</option>
                <option value="interview_scheduled">면접 예정</option>
                <option value="interview_completed">면접 완료</option>
                <option value="offered">합격 제안</option>
                <option value="accepted">최종 합격</option>
                <option value="rejected">불합격</option>
              </select>
            </div>
            
            {/* 공고 필터 */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">채용 공고</label>
              <select id="job-filter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">전체 공고</option>
                {/* 동적으로 로드됩니다 */}
              </select>
            </div>
            
            {/* 정렬 */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">정렬</label>
              <select id="sort-filter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="recent">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="name">이름순</option>
              </select>
            </div>
            
            {/* 검색 */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input 
                type="text" 
                id="search-input" 
                placeholder="이름으로 검색..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 통계 요약 */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <p class="text-sm text-gray-600 mb-1">전체 지원자</p>
            <p id="stat-total" class="text-2xl font-bold text-gray-900">-</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4">
            <p class="text-sm text-gray-600 mb-1">검토 대기</p>
            <p id="stat-submitted" class="text-2xl font-bold text-yellow-600">-</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4">
            <p class="text-sm text-gray-600 mb-1">면접 진행</p>
            <p id="stat-interview" class="text-2xl font-bold text-purple-600">-</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4">
            <p class="text-sm text-gray-600 mb-1">합격 제안</p>
            <p id="stat-offered" class="text-2xl font-bold text-green-600">-</p>
          </div>
        </div>

        {/* 지원자 목록 */}
        <div class="bg-white rounded-lg shadow-sm">
          {/* 로딩 인디케이터 */}
          <div id="loading-indicator" class="p-8 text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
            <p class="text-gray-600">지원자 목록을 불러오는 중...</p>
          </div>

          {/* 지원자 테이블 */}
          <div id="applicants-table" class="hidden overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지원자</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지원 공고</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">경력</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지원일</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody id="applicants-tbody" class="bg-white divide-y divide-gray-200">
                {/* 동적으로 로드됩니다 */}
              </tbody>
            </table>
          </div>

          {/* 빈 상태 */}
          <div id="empty-state" class="hidden p-12 text-center">
            <i class="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
            <p class="text-gray-600 text-lg mb-2">지원자가 없습니다</p>
            <p class="text-gray-500 text-sm">조건에 맞는 지원자를 찾을 수 없습니다</p>
          </div>
        </div>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        let allApplications = [];
        let filteredApplications = [];
        
        // Toast 알림
        function showToast(message, type = 'info') {
          const colors = {
            success: { bg: '#10b981', icon: '✓' },
            error: { bg: '#ef4444', icon: '✕' },
            info: { bg: '#3b82f6', icon: 'ℹ' }
          };
          
          const style = colors[type] || colors.info;
          const toast = document.createElement('div');
          toast.style.cssText = \`
            position: fixed; top: 20px; right: 20px;
            background: \${style.bg}; color: white;
            padding: 16px 24px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000; display: flex; align-items: center; gap: 12px;
            animation: slideIn 0.3s ease-out;
          \`;
          toast.innerHTML = \`
            <span style="font-size: 20px; font-weight: bold;">\${style.icon}</span>
            <span>\${message}</span>
          \`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
        
        // 페이지 로드
        document.addEventListener('DOMContentLoaded', async () => {
          await loadApplications();
          setupFilters();
        });
        
        // 지원자 목록 로드
        async function loadApplications() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              showToast('로그인이 필요합니다.', 'error');
              setTimeout(() => window.location.href = '/login', 2000);
              return;
            }
            
            const response = await fetch('/api/applications', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            
            const data = await response.json();
            
            if (data.success && data.applications) {
              allApplications = data.applications;
              filteredApplications = [...allApplications];
              
              displayApplications(filteredApplications);
              updateStats(filteredApplications);
              populateJobFilter(filteredApplications);
              
            } else {
              showEmpty();
            }
            
          } catch (error) {
            console.error('지원자 목록 로드 오류:', error);
            showToast('지원자 목록을 불러올 수 없습니다.', 'error');
            showEmpty();
          }
        }
        
        // 지원자 표시
        function displayApplications(applications) {
          const loadingEl = document.getElementById('loading-indicator');
          const tableEl = document.getElementById('applicants-table');
          const emptyEl = document.getElementById('empty-state');
          const tbodyEl = document.getElementById('applicants-tbody');
          
          loadingEl.classList.add('hidden');
          
          if (applications.length === 0) {
            tableEl.classList.add('hidden');
            emptyEl.classList.remove('hidden');
            return;
          }
          
          emptyEl.classList.add('hidden');
          tableEl.classList.remove('hidden');
          
          const statusColors = {
            submitted: 'bg-yellow-100 text-yellow-800',
            reviewed: 'bg-blue-100 text-blue-800',
            interview_scheduled: 'bg-purple-100 text-purple-800',
            interview_completed: 'bg-purple-200 text-purple-900',
            offered: 'bg-green-100 text-green-800',
            accepted: 'bg-green-200 text-green-900',
            rejected: 'bg-red-100 text-red-800'
          };
          
          const statusLabels = {
            submitted: '지원 완료',
            reviewed: '검토 중',
            interview_scheduled: '면접 예정',
            interview_completed: '면접 완료',
            offered: '합격 제안',
            accepted: '최종 합격',
            rejected: '불합격'
          };
          
          tbodyEl.innerHTML = applications.map(app => {
            const fullName = \`\${app.first_name || ''} \${app.last_name || ''}\`.trim() || '이름 없음';
            const statusColor = statusColors[app.status] || 'bg-gray-100 text-gray-800';
            const statusLabel = statusLabels[app.status] || app.status;
            const appliedDate = new Date(app.applied_at).toLocaleDateString('ko-KR');
            const experience = app.experience_years ? \`\${app.experience_years}년\` : '신입';
            
            return \`
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <i class="fas fa-user text-purple-600"></i>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">\${fullName}</div>
                      <div class="text-sm text-gray-500">\${app.email || '-'}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">\${app.job_title || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">\${experience}</div>
                  <div class="text-sm text-gray-500">\${app.korean_level || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full \${statusColor}">
                    \${statusLabel}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  \${appliedDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href="/applications/\${app.id}" class="text-blue-600 hover:text-blue-900">
                    상세보기
                  </a>
                </td>
              </tr>
            \`;
          }).join('');
        }
        
        // 통계 업데이트
        function updateStats(applications) {
          const total = applications.length;
          const submitted = applications.filter(a => a.status === 'submitted').length;
          const interview = applications.filter(a => 
            a.status === 'interview_scheduled' || a.status === 'interview_completed'
          ).length;
          const offered = applications.filter(a => 
            a.status === 'offered' || a.status === 'accepted'
          ).length;
          
          document.getElementById('stat-total').textContent = total;
          document.getElementById('stat-submitted').textContent = submitted;
          document.getElementById('stat-interview').textContent = interview;
          document.getElementById('stat-offered').textContent = offered;
        }
        
        // 공고 필터 채우기
        function populateJobFilter(applications) {
          const jobFilter = document.getElementById('job-filter');
          const uniqueJobs = [...new Set(applications.map(a => a.job_title))].filter(Boolean);
          
          jobFilter.innerHTML = '<option value="">전체 공고</option>' + 
            uniqueJobs.map(job => \`<option value="\${job}">\${job}</option>\`).join('');
        }
        
        // 필터 설정
        function setupFilters() {
          const statusFilter = document.getElementById('status-filter');
          const jobFilter = document.getElementById('job-filter');
          const sortFilter = document.getElementById('sort-filter');
          const searchInput = document.getElementById('search-input');
          
          const applyFilters = () => {
            let filtered = [...allApplications];
            
            // 상태 필터
            const status = statusFilter.value;
            if (status) {
              filtered = filtered.filter(a => a.status === status);
            }
            
            // 공고 필터
            const job = jobFilter.value;
            if (job) {
              filtered = filtered.filter(a => a.job_title === job);
            }
            
            // 검색
            const search = searchInput.value.toLowerCase();
            if (search) {
              filtered = filtered.filter(a => {
                const name = \`\${a.first_name || ''} \${a.last_name || ''}\`.toLowerCase();
                return name.includes(search);
              });
            }
            
            // 정렬
            const sort = sortFilter.value;
            if (sort === 'recent') {
              filtered.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
            } else if (sort === 'oldest') {
              filtered.sort((a, b) => new Date(a.applied_at) - new Date(b.applied_at));
            } else if (sort === 'name') {
              filtered.sort((a, b) => {
                const nameA = \`\${a.first_name || ''} \${a.last_name || ''}\`;
                const nameB = \`\${b.first_name || ''} \${b.last_name || ''}\`;
                return nameA.localeCompare(nameB);
              });
            }
            
            filteredApplications = filtered;
            displayApplications(filtered);
            updateStats(filtered);
          };
          
          statusFilter.addEventListener('change', applyFilters);
          jobFilter.addEventListener('change', applyFilters);
          sortFilter.addEventListener('change', applyFilters);
          searchInput.addEventListener('input', applyFilters);
        }
        
        // 빈 상태 표시
        function showEmpty() {
          document.getElementById('loading-indicator').classList.add('hidden');
          document.getElementById('applicants-table').classList.add('hidden');
          document.getElementById('empty-state').classList.remove('hidden');
          
          document.getElementById('stat-total').textContent = '0';
          document.getElementById('stat-submitted').textContent = '0';
          document.getElementById('stat-interview').textContent = '0';
          document.getElementById('stat-offered').textContent = '0';
        }
        
        // CSS 애니메이션
        if (!document.getElementById('list-animations')) {
          const style = document.createElement('style');
          style.id = 'list-animations';
          style.textContent = '@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
          document.head.appendChild(style);
        }
      `}}>
      </script>
    </div>
  )
}
