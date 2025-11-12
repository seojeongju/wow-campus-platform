/**
 * Page Component
 * Route: /dashboard/company
 * Original: src/index.tsx lines 17209-17696
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'

export const handler = async (c: Context) => {
const user = c.get('user');
  
  // 인증은 middleware에서 처리됨 (authMiddleware + requireCompany)
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
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
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
      </header>

      {/* 기업 대시보드 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">환영합니다, {user.email} 기업!</h1>
              <p class="text-purple-100">채용 관리 대시보드에서 인재를 찾아보세요</p>
            </div>
            <div class="text-6xl opacity-20">
              <i class="fas fa-building"></i>
            </div>
          </div>
        </div>

        {/* KPI 카드 */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">8</p>
                <p class="text-gray-600 text-sm">진행 중인 공고</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">156</p>
                <p class="text-gray-600 text-sm">총 지원자 수</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-calendar-check text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">23</p>
                <p class="text-gray-600 text-sm">면접 예정</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-user-check text-yellow-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">7</p>
                <p class="text-gray-600 text-sm">채용 완료</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 그리드 */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 채용 공고 관리 */}
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">채용 공고 관리</h2>
                <a href="/jobs/create" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  <i class="fas fa-plus mr-2"></i>새 공고 등록
                </a>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-code text-blue-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">풀스택 개발자 (React/Node.js)</h3>
                      <p class="text-gray-600 text-sm">지원자 45명 • 2024년 10월 8일 등록</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">모집 중</span>
                    <button class="text-gray-500 hover:text-blue-600">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-chart-line text-purple-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">데이터 분석가</h3>
                      <p class="text-gray-600 text-sm">지원자 28명 • 2024년 10월 5일 등록</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">서류 심사</span>
                    <button class="text-gray-500 hover:text-blue-600">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-4 border rounded-lg">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-mobile-alt text-green-600"></i>
                    </div>
                    <div class="ml-4">
                      <h3 class="font-medium text-gray-900">모바일 앱 개발자 (Flutter)</h3>
                      <p class="text-gray-600 text-sm">지원자 32명 • 2024년 10월 3일 등록</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">면접 중</span>
                    <button class="text-gray-500 hover:text-blue-600">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <a href="/jobs/manage" class="text-blue-600 font-medium hover:underline">
                  모든 공고 관리하기 →
                </a>
              </div>
            </div>
          </div>
          
          {/* 빠른 액션 & 인재 추천 */}
          <div class="space-y-6">
            {/* 빠른 액션 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">빠른 액션</h2>
              <div class="space-y-3">
                <a href="/jobs/create" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-plus text-blue-600 mr-3"></i>
                  <span class="font-medium">새 공고 등록</span>
                </a>
                <a href="/jobseekers" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-users text-green-600 mr-3"></i>
                  <span class="font-medium">인재 검색</span>
                </a>
                <a href="/matching" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-magic text-purple-600 mr-3"></i>
                  <span class="font-medium">AI 인재 추천</span>
                </a>
              </div>
            </div>
            
            {/* 추천 인재 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">추천 인재</h2>
              <div class="space-y-3">
                <div class="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900">김민수</p>
                      <p class="text-gray-600 text-sm">React 개발자 • 3년 경력</p>
                      <p class="text-blue-600 text-xs">매칭률 95%</p>
                    </div>
                  </div>
                </div>
                
                <div class="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-green-600"></i>
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900">박지영</p>
                      <p class="text-gray-600 text-sm">데이터 분석가 • 2년 경력</p>
                      <p class="text-green-600 text-xs">매칭률 89%</p>
                    </div>
                  </div>
                </div>
                
                <div class="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-purple-600"></i>
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900">이준호</p>
                      <p class="text-gray-600 text-sm">Flutter 개발자 • 4년 경력</p>
                      <p class="text-purple-600 text-xs">매칭률 92%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <a href="/matching" class="text-blue-600 font-medium hover:underline text-sm">
                  더 많은 인재 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 기업 대시보드 JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 기업 대시보드 JavaScript ====================
        
        // 페이지 로드 시 데이터 불러오기
        document.addEventListener('DOMContentLoaded', async () => {
          await loadCompanyDashboard();
        });
        
        // 대시보드 데이터 로드
        async function loadCompanyDashboard() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              console.error('로그인 토큰이 없습니다.');
              return;
            }
            
            // 기업 정보 로드
            await loadCompanyInfo();
            
            // 구인공고 목록 로드
            await loadCompanyJobs();
            
            // 대시보드 통계 로드
            await loadDashboardStats();
            
          } catch (error) {
            console.error('대시보드 로드 오류:', error);
          }
        }
        
        // 기업 정보 로드
        async function loadCompanyInfo() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/profile/company', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              }
            });
            
            const result = await response.json();
            console.log('기업 정보:', result);
            
            // 기업 정보 표시 (필요시 구현)
            
          } catch (error) {
            console.error('기업 정보 로드 오류:', error);
          }
        }
        
        // 구인공고 목록 로드
        async function loadCompanyJobs() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            // 1. 현재 사용자 정보 가져오기
            const userResponse = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            const userData = await userResponse.json();
            
            if (!userData.success) {
              console.error('사용자 정보 조회 실패');
              return;
            }
            
            console.log('사용자 정보:', userData.user);
            
            // 2. 기업 프로필에서 company_id 가져오기
            if (!userData.profile || !userData.profile.id) {
              console.error('기업 프로필 정보가 없습니다');
              return;
            }
            
            const companyId = userData.profile.id;
            console.log('Company ID:', companyId);
            
            // 3. 기업의 구인공고 조회 (모든 상태 포함)
            const jobsResponse = await fetch(\`/api/jobs/company/\${companyId}?status=all\`, {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const jobsData = await jobsResponse.json();
            console.log('구인공고 응답:', jobsData);
            
            if (jobsData.success && jobsData.jobs) {
              displayCompanyJobs(jobsData.jobs);
            } else {
              // 공고가 없는 경우
              displayCompanyJobs([]);
            }
            
          } catch (error) {
            console.error('구인공고 목록 로드 오류:', error);
          }
        }
        
        // 구인공고 목록 표시
        function displayCompanyJobs(jobs) {
          const container = document.querySelector('.space-y-4');
          if (!container) return;
          
          if (jobs.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-briefcase text-4xl mb-2"></i>
                <p>등록된 구인공고가 없습니다</p>
                <p class="text-sm mt-2">새 공고를 등록해보세요!</p>
              </div>
            \`;
            return;
          }
          
          container.innerHTML = jobs.slice(0, 5).map(job => {
            const statusMap = {
              'active': { label: '모집 중', color: 'green' },
              'closed': { label: '마감', color: 'gray' },
              'draft': { label: '임시저장', color: 'yellow' }
            };
            
            const status = statusMap[job.status] || statusMap['active'];
            const createdDate = new Date(job.created_at).toLocaleDateString('ko-KR');
            
            return \`
              <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-center flex-1">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-briefcase text-blue-600"></i>
                  </div>
                  <div class="ml-4 flex-1">
                    <h3 class="font-medium text-gray-900">\${job.title}</h3>
                    <p class="text-gray-600 text-sm">\${job.location} • \${createdDate}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-3 py-1 bg-\${status.color}-100 text-\${status.color}-800 rounded-full text-sm whitespace-nowrap">
                    \${status.label}
                  </span>
                  <a href="/jobs/\${job.id}/edit" class="text-gray-500 hover:text-blue-600 p-2">
                    <i class="fas fa-edit"></i>
                  </a>
                  <button onclick="deleteJob(\${job.id})" class="text-gray-500 hover:text-red-600 p-2">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 대시보드 통계 로드
        async function loadDashboardStats() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            // 통계 API 호출 (추후 구현)
            
            // 임시: 구인공고 수 업데이트
            const userResponse = await fetch('/api/auth/profile', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const userData = await userResponse.json();
            
            if (userData.success) {
              const jobsResponse = await fetch(\`/api/jobs/company/\${userData.user.id}\`, {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              const jobsData = await jobsResponse.json();
              
              if (jobsData.success) {
                // 진행 중인 공고 수 업데이트
                const activeJobs = jobsData.jobs.filter(j => j.status === 'active');
                updateStatCard(0, activeJobs.length, '진행 중인 공고');
              }
            }
            
          } catch (error) {
            console.error('통계 로드 오류:', error);
          }
        }
        
        // 통계 카드 업데이트
        function updateStatCard(index, value, label) {
          const cards = document.querySelectorAll('.grid.grid-cols-1.md\\\\:grid-cols-4 .bg-white');
          if (cards[index]) {
            const valueElement = cards[index].querySelector('.text-2xl');
            if (valueElement) {
              valueElement.textContent = value;
            }
          }
        }
        
        // 구인공고 삭제
        async function deleteJob(jobId) {
          showConfirm({
            title: '공고 삭제',
            message: '정말로 이 공고를 삭제하시겠습니까?',
            type: 'danger',
            confirmText: '삭제',
            cancelText: '취소',
            onConfirm: async () => {
              try {
                const token = localStorage.getItem('wowcampus_token');
                const response = await fetch(\`/api/jobs/\${jobId}\`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                  }
                });
                
                const result = await response.json();
                
                if (result.success) {
                  toast.success('✅ 공고가 삭제되었습니다.');
                  loadCompanyJobs(); // 목록 새로고침
                } else {
                  toast.error('❌ ' + (result.message || '공고 삭제에 실패했습니다.'));
                }
              } catch (error) {
                console.error('공고 삭제 오류:', error);
                toast.error('❌ 공고 삭제 중 오류가 발생했습니다.');
              }
            }
          });
        }
        
        // ==================== 끝: 기업 대시보드 JavaScript ====================
      `}}>
      </script>
    </div>
  )


// 관리자 전용 대시보드 (관리자 대시보드로 리다이렉트)
}

// Middleware: optionalAuth
