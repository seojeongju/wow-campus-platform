/**
 * Page Component
 * Route: /agents
 * Original: src/index.tsx lines 9812-10273
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

      {/* Agents Dashboard Content */}
      <main class="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">환영합니다, <span id="agent-name">{user.name}</span>님!</h1>
              <p class="text-blue-100">인재 매칭 및 관리 대시보드</p>
            </div>
            <div class="text-6xl opacity-20">
              <i class="fas fa-handshake"></i>
            </div>
          </div>
        </div>

        {/* Agent Statistics */}
        <div class="grid md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900" id="stat-jobseekers">0</p>
                <p class="text-gray-600 text-sm">전체 구직자</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-handshake text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900" id="stat-placements">0</p>
                <p class="text-gray-600 text-sm">매칭 성공</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-percentage text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900" id="stat-success-rate">0%</p>
                <p class="text-gray-600 text-sm">성공률</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-coins text-orange-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900" id="stat-commission">0%</p>
                <p class="text-gray-600 text-sm">수수료율</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div class="grid md:grid-cols-3 gap-8">
          {/* Managed Jobseekers */}
          <div class="md:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">관리 구직자 목록</h2>
                <a href="/agents/assign" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                  <i class="fas fa-plus mr-2"></i>구직자 할당
                </a>
              </div>
              
              <div id="managed-jobseekers-list" class="space-y-4">
                {/* Jobseekers list will be loaded here */}
              </div>
              
              <div class="mt-6 text-center">
                <a href="/jobseekers" class="text-blue-600 font-medium hover:underline">
                  모든 구직자 보기 →
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div class="space-y-6">
            {/* Quick Actions */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">빠른 액션</h2>
              <div class="space-y-3">
                <a href="/agents/profile/edit" class="block w-full text-left p-3 border border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <i class="fas fa-user-edit text-blue-600 mr-3"></i>
                  <span class="font-medium text-blue-700">프로필 수정</span>
                </a>
                <a href="/jobseekers" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-search text-blue-600 mr-3"></i>
                  <span class="font-medium">구직자 검색</span>
                </a>
                <a href="/jobs" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-briefcase text-green-600 mr-3"></i>
                  <span class="font-medium">구인공고 보기</span>
                </a>
                <a href="/matching" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-magic text-purple-600 mr-3"></i>
                  <span class="font-medium">AI 매칭</span>
                </a>
              </div>
            </div>
            
            {/* Agent Info */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900">에이전시 정보</h2>
                <a href="/agents/profile/edit" class="text-blue-600 hover:text-blue-700 text-sm">
                  <i class="fas fa-edit"></i>
                </a>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">에이전시:</span>
                  <span class="font-medium" id="agency-name">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">경력:</span>
                  <span class="font-medium" id="experience-years">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">담당 지역:</span>
                  <span class="font-medium" id="primary-regions">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">전문분야:</span>
                  <span class="font-medium" id="service-areas">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">연락처:</span>
                  <span class="font-medium" id="contact-phone">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Agent Dashboard JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 에이전트 대시보드 JavaScript ====================
        
        // 페이지 로드 시 데이터 불러오기
        document.addEventListener('DOMContentLoaded', async () => {
          await loadAgentDashboard();
        });
        
        // 대시보드 데이터 로드
        async function loadAgentDashboard() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              console.error('로그인 토큰이 없습니다.');
              return;
            }
            
            // 에이전트 정보 로드
            await loadAgentInfo();
            
            // 구직자 목록 로드
            await loadManagedJobseekers();
            
            // 통계 로드
            await loadAgentStats();
            
          } catch (error) {
            console.error('대시보드 로드 오류:', error);
          }
        }
        
        // 에이전트 정보 로드
        async function loadAgentInfo() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            // 새로운 agents API 사용
            const response = await fetch('/api/agents/profile', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('에이전트 정보:', result);
            
            if (result.success && result.profile) {
              const profile = result.profile;
              
              // 에이전시 정보 표시
              if (profile.agency_name) {
                document.getElementById('agency-name').textContent = profile.agency_name;
              }
              
              if (profile.experience_years !== null && profile.experience_years !== undefined) {
                document.getElementById('experience-years').textContent = profile.experience_years + '년';
              }
              
              // 담당 지역 표시 (새 필드)
              if (profile.primary_regions && profile.primary_regions.length > 0) {
                const regionMap = {
                  'vietnam': '🇻🇳 베트남',
                  'thailand': '🇹🇭 태국',
                  'philippines': '🇵🇭 필리핀',
                  'uzbekistan': '🇺🇿 우즈베키스탄',
                  'mongolia': '🇲🇳 몽골',
                  'nepal': '🇳🇵 네팔',
                  'myanmar': '🇲🇲 미얀마',
                  'cambodia': '🇰🇭 캄보디아',
                  'indonesia': '🇮🇩 인도네시아',
                  'bangladesh': '🇧🇩 방글라데시',
                  'sri_lanka': '🇱🇰 스리랑카',
                  'other': '🌏 기타'
                };
                const regions = profile.primary_regions.map(r => regionMap[r] || r).join(', ');
                document.getElementById('primary-regions').textContent = regions;
              }
              
              // 전문 분야 표시 (새 필드)
              if (profile.service_areas && profile.service_areas.length > 0) {
                const areaMap = {
                  'manufacturing': '제조업', 'it': 'IT', 'construction': '건설',
                  'agriculture': '농업', 'service': '서비스', 'hospitality': '호텔/관광',
                  'healthcare': '의료', 'education': '교육', 'logistics': '물류',
                  'food': '식음료', 'retail': '유통', 'engineering': '엔지니어링',
                  'other': '기타'
                };
                const areas = profile.service_areas.map(a => areaMap[a] || a).join(', ');
                document.getElementById('service-areas').textContent = areas;
              }
              
              // 연락처 표시
              if (profile.contact_phone) {
                document.getElementById('contact-phone').textContent = profile.contact_phone;
              }
              
              // 통계 정보
              if (profile.total_placements !== null && profile.total_placements !== undefined) {
                document.getElementById('stat-placements').textContent = profile.total_placements;
              }
              
              if (profile.success_rate !== null && profile.success_rate !== undefined) {
                document.getElementById('stat-success-rate').textContent = profile.success_rate + '%';
              }
              
              if (profile.commission_rate !== null && profile.commission_rate !== undefined) {
                document.getElementById('stat-commission').textContent = profile.commission_rate + '%';
              }
            }
            
          } catch (error) {
            console.error('에이전트 정보 로드 오류:', error);
          }
        }
        
        // 관리 구직자 목록 로드 (에이전트에게 할당된 구직자만)
        async function loadManagedJobseekers() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            // 새로운 에이전트 전용 API 사용
            const response = await fetch('/api/agents/jobseekers?limit=10&status=active', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('할당된 구직자 목록:', result);
            
            if (result.success && result.jobseekers) {
              displayJobseekers(result.jobseekers);
              
              // 구직자 수 업데이트
              document.getElementById('stat-jobseekers').textContent = result.pagination?.total || result.jobseekers.length;
            }
            
          } catch (error) {
            console.error('구직자 목록 로드 오류:', error);
          }
        }
        
        // 구직자 목록 표시 (할당 정보 포함)
        function displayJobseekers(jobseekers) {
          const container = document.getElementById('managed-jobseekers-list');
          if (!container) return;
          
          if (jobseekers.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-4xl mb-2"></i>
                <p>할당된 구직자가 없습니다</p>
                <p class="text-sm mt-2">구직자 검색에서 인재를 찾아 할당해보세요!</p>
              </div>
            \`;
            return;
          }
          
          container.innerHTML = jobseekers.map(js => {
            const fullName = \`\${js.first_name || ''} \${js.last_name || ''}\`.trim();
            const skills = js.skills ? (typeof js.skills === 'string' ? JSON.parse(js.skills) : js.skills) : [];
            const skillsText = Array.isArray(skills) ? skills.slice(0, 3).join(', ') : '';
            
            // 할당 정보
            const assignedDate = js.assigned_date ? new Date(js.assigned_date).toLocaleDateString('ko-KR') : '-';
            const assignmentStatus = js.assignment_status || 'active';
            const statusBadge = {
              active: '<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">활성</span>',
              inactive: '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">비활성</span>',
              completed: '<span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">완료</span>'
            }[assignmentStatus] || '';
            
            return \`
              <div class="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center flex-1">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div class="ml-4 flex-1">
                      <div class="flex items-center space-x-2">
                        <h3 class="font-medium text-gray-900">\${fullName || 'Unknown'}</h3>
                        \${statusBadge}
                      </div>
                      <p class="text-gray-600 text-sm">
                        \${js.nationality || '-'} • \${js.experience_years || 0}년 경력
                      </p>
                      \${skillsText ? \`<p class="text-blue-600 text-xs mt-1">\${skillsText}</p>\` : ''}
                      <p class="text-gray-500 text-xs mt-1">할당일: \${assignedDate}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <a href="/jobseekers/\${js.id}" class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors" title="상세보기">
                      <i class="fas fa-eye mr-1"></i>보기
                    </a>
                    <button onclick="unassignJobseeker(\${js.id})" class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors" title="할당 해제">
                      <i class="fas fa-user-times mr-1"></i>해제
                    </button>
                  </div>
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 구직자 할당 해제
        async function unassignJobseeker(jobseekerId) {
          showConfirm({
            title: '할당 해제',
            message: '이 구직자의 할당을 해제하시겠습니까?',
            type: 'warning',
            confirmText: '해제',
            cancelText: '취소',
            onConfirm: async () => {
              try {
                const token = localStorage.getItem('wowcampus_token');
                const response = await fetch(\`/api/agents/jobseekers/\${jobseekerId}/unassign\`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': 'Bearer ' + token
                  }
                });
                
                const result = await response.json();
                
                if (result.success) {
                  toast.success('할당이 해제되었습니다.');
                  await loadManagedJobseekers(); // 목록 새로고침
                  await loadAgentStats(); // 통계 새로고침
                } else {
                  toast.error('할당 해제 실패: ' + (result.error || '알 수 없는 오류'));
                }
              } catch (error) {
                console.error('할당 해제 오류:', error);
                toast.error('할당 해제 중 오류가 발생했습니다.');
              }
            }
          });
        }
        
        // 통계 로드 (새로운 API 사용)
        async function loadAgentStats() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/agents/stats', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('에이전트 통계:', result);
            
            if (result.success && result.stats) {
              const stats = result.stats;
              
              // 통계 업데이트
              if (stats.active_assignments !== undefined) {
                document.getElementById('stat-jobseekers').textContent = stats.active_assignments;
              }
              if (stats.total_placements !== undefined) {
                document.getElementById('stat-placements').textContent = stats.total_placements;
              }
              if (stats.success_rate !== undefined) {
                document.getElementById('stat-success-rate').textContent = stats.success_rate.toFixed(1) + '%';
              }
              if (stats.commission_rate !== undefined) {
                document.getElementById('stat-commission').textContent = stats.commission_rate + '%';
              }
            }
          } catch (error) {
            console.error('통계 로드 오류:', error);
          }
        }
        
        // ==================== 끝: 에이전트 대시보드 JavaScript ====================
      `}}>
      </script>
    </div>
  )

// Agent Jobseeker Assignment Page
}

// Middleware: optionalAuth
