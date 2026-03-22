/**
 * Page Component
 * Route: /agents/assign
 * Original: src/index.tsx lines 10274-10611
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'

export const handler = async (c: Context) => {
  const user = c.get('user');

  // 인증은 middleware에서 처리됨 (authMiddleware + requireAgent)

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>

          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>

          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>

          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200">
              {/* 동적 네비게이션 메뉴가 여기에 로드됩니다 */}
            </div>
            <div id="mobile-auth-buttons" class="pt-3">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
      </header>

      {/* Assignment Page Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div class="mb-6">
          <a href="/agents" class="text-blue-600 hover:underline">
            <i class="fas fa-arrow-left mr-2"></i>에이전트 대시보드로 돌아가기
          </a>
        </div>

        {/* Page Title */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">나의 구직자</h1>
          <p class="text-gray-600">나에게 할당된 구직자 목록을 확인하세요</p>
        </div>

        {/* Search and Filter */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <select
                id="status-filter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="active">활성 상태</option>
                <option value="all">전체</option>
                <option value="inactive">비활성</option>
                <option value="completed">완료</option>
              </select>
            </div>
            <button
              onclick="filterJobseekers()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <i class="fas fa-filter mr-2"></i>필터 적용
            </button>
          </div>
        </div>

        {/* Assigned Jobseekers List */}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">할당된 구직자 목록</h2>

          <div id="available-jobseekers-list" class="space-y-4 mb-6">
            {/* Jobseekers list will be loaded here */}
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
              <p>로딩 중...</p>
            </div>
          </div>

          {/* Pagination */}
          <div id="pagination-container" class="flex items-center justify-between pt-6 border-t">
            {/* Pagination controls will be loaded here */}
          </div>
        </div>

        {/* Find Jobseeker Section */}
        <div class="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4">새로운 구직자 찾기</h2>
          <p class="text-gray-600 mb-4">아직 담당자가 없는 구직자를 검색하여 할당할 수 있습니다.</p>

          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="flex-1">
              <input
                type="text"
                id="jobseeker-search"
                placeholder="이름, 이메일 또는 전화번호로 검색..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onkeypress="if(event.key === 'Enter') searchJobseekers()"
              />
            </div>
            <button
              onclick="searchJobseekers()"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              <i class="fas fa-search mr-2"></i>검색
            </button>
          </div>

          <div id="search-results-list" class="space-y-4">
            {/* Search results will be loaded here */}
          </div>
        </div>
      </main>

      {/* Assignment Modal */}
      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // ==================== 구직자 할당 페이지 JavaScript ====================
        
        let currentPage = 1;
        let currentSearch = '';
        let selectedJobseekerId = null;
        
        // 페이지 로드 시 실행
        document.addEventListener('DOMContentLoaded', async () => {
          await loadAssignedJobseekers(1, 'active');
        });
        
        // 필터 실행
        async function filterJobseekers() {
          const status = document.getElementById('status-filter').value;
          currentPage = 1;
          await loadAssignedJobseekers(1, status);
        }
        
        // 할당된 구직자 목록 로드
        async function loadAssignedJobseekers(page = 1, status = 'active') {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              console.error('토큰이 없습니다. 로그인이 필요합니다.');
              toast.warning('로그인이 필요합니다.');
              window.location.href = '/';
              return;
            }
            
            let url = \`/api/agents/jobseekers?page=\${page}&limit=20&status=\${status}\`;
            
            console.log('요청 URL:', url);
            
            const response = await fetch(url, {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            console.log('응답 상태:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('서버 응답 오류:', response.status, errorText);
              throw new Error(\`서버 오류: \${response.status}\`);
            }
            
            const result = await response.json();
            console.log('할당된 구직자:', result);
            
            if (result.success) {
              displayAssignedJobseekers(result.jobseekers || []);
              displayPagination(result.pagination);
              currentPage = page;
            } else {
              console.error('API 오류:', result.error);
              const container = document.getElementById('available-jobseekers-list');
              if (container) {
                container.innerHTML = \`
                  <div class="text-center py-12 text-red-500">
                    <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
                    <p class="text-lg font-medium">목록을 불러올 수 없습니다</p>
                    <p class="text-sm mt-2">\${result.error || '알 수 없는 오류'}</p>
                    <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                      다시 시도
                    </button>
                  </div>
                \`;
              }
            }
          } catch (error) {
            console.error('구직자 목록 로드 오류:', error);
            const container = document.getElementById('available-jobseekers-list');
            if (container) {
              container.innerHTML = \`
                <div class="text-center py-12 text-red-500">
                  <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
                  <p class="text-lg font-medium">오류가 발생했습니다</p>
                  <p class="text-sm mt-2">\${error.message || '구직자 목록을 불러오는 중 오류가 발생했습니다.'}</p>
                  <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    다시 시도
                  </button>
                </div>
              \`;
            }
          }
        }
        
        // 할당된 구직자 목록 표시
        function displayAssignedJobseekers(jobseekers) {
          const container = document.getElementById('available-jobseekers-list');
          if (!container) return;
          
          if (jobseekers.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-12 text-gray-500">
                <i class="fas fa-user-slash text-5xl mb-4"></i>
                <p class="text-lg font-medium">할당된 구직자가 없습니다</p>
                <p class="text-sm mt-2">아직 나에게 할당된 구직자가 없습니다.</p>
              </div>
            \`;
            return;
          }
          
          container.innerHTML = jobseekers.map(js => {
            const fullName = \`\${js.first_name || ''} \${js.last_name || ''}\`.trim();
            const skills = js.skills ? (typeof js.skills === 'string' ? JSON.parse(js.skills) : js.skills) : [];
            const skillsText = Array.isArray(skills) ? skills.slice(0, 4).join(', ') : '';
            const koreanLevel = js.korean_level || '-';
            const assignedDate = js.assigned_date ? new Date(js.assigned_date).toLocaleDateString('ko-KR') : '-';
            const statusBadge = js.assignment_status === 'active' ? 
              '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">활성</span>' :
              js.assignment_status === 'completed' ?
              '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">완료</span>' :
              '<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">비활성</span>';
            
            return \`
              <div class="p-4 border rounded-lg hover:border-blue-300 transition-all">
                <div class="flex items-start justify-between">
                  <div class="flex items-start flex-1">
                    <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i class="fas fa-user text-white text-xl"></i>
                    </div>
                    <div class="ml-4 flex-1">
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-lg text-gray-900">\${fullName || 'Unknown'}</h3>
                        \${statusBadge}
                      </div>
                      <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span><i class="fas fa-calendar mr-1"></i>할당일: \${assignedDate}</span>
                        <span><i class="fas fa-flag mr-1"></i>\${js.nationality || '-'}</span>
                        <span><i class="fas fa-briefcase mr-1"></i>\${js.experience_years || 0}년 경력</span>
                        <span><i class="fas fa-language mr-1"></i>한국어: \${koreanLevel}</span>
                      </div>
                      \${skillsText ? \`
                        <div class="mt-2">
                          <p class="text-xs text-gray-500 mb-1">주요 스킬:</p>
                          <p class="text-sm text-blue-600 font-medium">\${skillsText}</p>
                        </div>
                      \` : ''}
                      \${js.assignment_notes ? \`
                        <p class="text-sm text-gray-600 mt-2">
                          <i class="fas fa-sticky-note mr-1"></i>메모: \${js.assignment_notes}
                        </p>
                      \` : ''}
                    </div>
                  </div>
                  <div class="flex flex-col space-y-2 ml-4">
                    <a 
                      href="/jobseekers/\${js.id}" 
                      class="px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap">
                      <i class="fas fa-eye mr-1"></i>상세보기
                    </a>
                    \${js.assignment_status === 'active' ? \`
                      <button 
                        onclick="updateAssignmentStatus(\${js.assignment_id}, 'completed')" 
                        class="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm whitespace-nowrap">
                        <i class="fas fa-check mr-1"></i>완료처리
                      </button>
                    \` : ''}
                  </div>
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 페이지네이션 표시
        function displayPagination(pagination) {
          const container = document.getElementById('pagination-container');
          if (!container || !pagination) return;
          
          const { page, totalPages, total } = pagination;
          
          if (totalPages <= 1) {
            container.innerHTML = \`<p class="text-sm text-gray-600">전체 \${total}명</p>\`;
            return;
          }
          
          const status = document.getElementById('status-filter')?.value || 'active';
          let paginationHTML = \`
            <div class="flex items-center space-x-2">
              <button 
                onclick="loadAssignedJobseekers(\${page - 1}, '\${status}')" 
                \${page <= 1 ? 'disabled' : ''}
                class="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="text-sm text-gray-600">
                \${page} / \${totalPages} 페이지 (전체 \${total}명)
              </span>
              <button 
                onclick="loadAssignedJobseekers(\${page + 1}, '\${status}')" 
                \${page >= totalPages ? 'disabled' : ''}
                class="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          \`;
          
          container.innerHTML = paginationHTML;
        }
        
        // 할당 상태 업데이트 (완료 처리)
        async function updateAssignmentStatus(assignmentId, newStatus) {
          showConfirm({
            title: '상태 변경',
            message: '이 구직자를 완료 상태로 변경하시겠습니까?',
            type: 'info',
            confirmText: '변경',
            cancelText: '취소',
            onConfirm: async () => {
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            const response = await fetch(\`/api/agents/assignments/\${assignmentId}\`, {
              method: 'PATCH',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: newStatus })
            });
            
            const result = await response.json();
            
            if (result.success) {
              toast.success('상태가 성공적으로 변경되었습니다!');
              // 목록 새로고침
              const status = document.getElementById('status-filter')?.value || 'active';
              await loadAssignedJobseekers(currentPage, status);
            } else {
              toast.error('상태 변경 실패: ' + (result.error || '알 수 없는 오류'));
            }
            toast.error('상태 변경 중 오류가 발생했습니다.');
          }
            }
          });
        }

        // 구직자 검색
        async function searchJobseekers() {
          const query = document.getElementById('jobseeker-search').value.trim();
          if (!query) {
            toast.warning('검색어를 입력해주세요.');
            return;
          }
          
          const container = document.getElementById('search-results-list');
          container.innerHTML = \`
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p>검색 중...</p>
            </div>
          \`;
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/agents/available-jobseekers?q=\${encodeURIComponent(query)}\`, {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            
            const result = await response.json();
            
            if (result.success) {
              displaySearchResults(result.jobseekers || []);
            } else {
              container.innerHTML = \`<p class="text-center text-red-500 py-4">오류: \${result.error}</p>\`;
            }
          } catch (error) {
            console.error('검색 오류:', error);
            container.innerHTML = \`<p class="text-center text-red-500 py-4">검색 중 오류가 발생했습니다.</p>\`;
          }
        }
        
        // 검색 결과 표시
        function displaySearchResults(jobseekers) {
          const container = document.getElementById('search-results-list');
          
          if (jobseekers.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-8 text-gray-500">
                <p>검색 결과가 없습니다.</p>
              </div>
            \`;
            return;
          }
          
          container.innerHTML = jobseekers.map(js => \`
            <div class="p-4 border rounded-lg hover:border-blue-300 transition-all bg-gray-50">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold text-gray-900">\${js.name}</h3>
                  <p class="text-sm text-gray-600">\${js.email} | \${js.phone}</p>
                  <div class="flex gap-2 mt-1 text-xs text-gray-500">
                    <span>\${js.nationality || '-'}</span>
                    <span>경력 \${js.experience_years || 0}년</span>
                  </div>
                </div>
                <button 
                  onclick="assignJobseeker(\${js.id}, '\${js.name}')"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  <i class="fas fa-plus mr-1"></i>할당
                </button>
              </div>
            </div>
          \`).join('');
        }
        
        // 구직자 할당
        async function assignJobseeker(jobseekerId, name) {
          showConfirm({
            title: '구직자 할당',
            message: \`'\${name}' 구직자를 담당하시겠습니까?\`,
            type: 'info',
            confirmText: '할당',
            cancelText: '취소',
            onConfirm: async () => {
              try {
                const token = localStorage.getItem('wowcampus_token');
                const response = await fetch(\`/api/agents/jobseekers/\${jobseekerId}/assign\`, {
                  method: 'POST',
                  headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ notes: '직접 검색하여 할당함' })
                });
                
                const result = await response.json();
                
                if (result.success) {
                  toast.success('구직자가 성공적으로 할당되었습니다!');
                  // 목록 새로고침 & 검색 결과 초기화
                  document.getElementById('jobseeker-search').value = '';
                  document.getElementById('search-results-list').innerHTML = '';
                  loadAssignedJobseekers(1, 'active');
                } else {
                  toast.error('할당 실패: ' + (result.error || '알 수 없는 오류'));
                }
              } catch (error) {
                console.error('할당 오류:', error);
                toast.error('할당 중 오류가 발생했습니다.');
              }
            }
          });
        }

        // ==================== 끝: 구직자 할당 페이지 JavaScript ====================
      `}}>
      </script>
    </div >
  )

  // Agent Profile Edit Page
}

// Middleware: optionalAuth
