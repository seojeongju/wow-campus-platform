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
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
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
            {/* Mobile Navigation Menu */}
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200">
              {/* 동적 네비게이션 메뉴가 여기에 로드됩니다 */}
            </div>
            
            {/* Mobile Auth Buttons */}
            <div id="mobile-auth-buttons" class="pt-3">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
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
        <div id="kpi-cards" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p id="stat-active-jobs" class="text-2xl font-bold text-gray-900">-</p>
                <p class="text-gray-600 text-sm">진행 중인 공고</p>
              </div>
            </div>
          </div>
          
          <a href="/applications/list" class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer block">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p id="stat-total-applications" class="text-2xl font-bold text-gray-900">-</p>
                <p class="text-gray-600 text-sm">총 지원자 수</p>
              </div>
            </div>
          </a>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p id="stat-total-jobs" class="text-2xl font-bold text-gray-900">-</p>
                <p class="text-gray-600 text-sm">전체 공고</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-eye text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p id="stat-total-views" class="text-2xl font-bold text-gray-900">-</p>
                <p class="text-gray-600 text-sm">총 조회수</p>
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
              
              <div id="jobs-list" class="space-y-4">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>구인공고를 불러오는 중...</p>
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
                <a href="/profile/company" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-user-circle text-orange-600 mr-3"></i>
                  <span class="font-medium">내 프로필</span>
                </a>
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
            
            {/* 최근 지원자 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">최근 지원자</h2>
              <div id="recent-applicants" class="space-y-3">
                <div class="text-center py-4 text-gray-500 text-sm">
                  <i class="fas fa-spinner fa-spin mb-2"></i>
                  <p>지원자 목록을 불러오는 중...</p>
                </div>
              </div>
            </div>
            
            {/* 최근 활동 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">최근 활동</h2>
              <div id="recent-activity" class="space-y-3">
                <div class="text-center py-4 text-gray-500 text-sm">
                  <i class="fas fa-spinner fa-spin mb-2"></i>
                  <p>활동 내역을 불러오는 중...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 기업 대시보드 JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 기업 대시보드 JavaScript ====================
        
        // Toast 알림 유틸리티
        const toast = {
          success: (message) => {
            showToastNotification(message, 'success');
          },
          error: (message) => {
            showToastNotification(message, 'error');
          },
          warning: (message) => {
            showToastNotification(message, 'warning');
          },
          info: (message) => {
            showToastNotification(message, 'info');
          }
        };
        
        function showToastNotification(message, type = 'info') {
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
          \`;
          
          toastEl.innerHTML = \`
            <span style="font-size: 20px; font-weight: bold;">\${style.icon}</span>
            <span style="flex: 1;">\${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; margin: 0;">×</button>
          \`;
          
          document.body.appendChild(toastEl);
          
          setTimeout(() => {
            toastEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toastEl.remove(), 300);
          }, 3000);
        }
        
        // Confirm 다이얼로그 유틸리티
        function showConfirm(options) {
          const { title, message, type = 'warning', confirmText = '확인', cancelText = '취소', onConfirm, onCancel } = options;
          
          const colors = {
            danger: { bg: '#ef4444', hover: '#dc2626' },
            warning: { bg: '#f59e0b', hover: '#d97706' },
            info: { bg: '#3b82f6', hover: '#2563eb' }
          };
          
          const color = colors[type] || colors.warning;
          
          const overlay = document.createElement('div');
          overlay.style.cssText = \`
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-out;
          \`;
          
          const modal = document.createElement('div');
          modal.style.cssText = \`
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          \`;
          
          modal.innerHTML = \`
            <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #111827;">\${title}</h3>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">\${message}</p>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button id="cancel-btn" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">
                \${cancelText}
              </button>
              <button id="confirm-btn" style="padding: 10px 20px; border: none; background: \${color.bg}; color: white; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">
                \${confirmText}
              </button>
            </div>
          \`;
          
          overlay.appendChild(modal);
          document.body.appendChild(overlay);
          
          // 애니메이션 스타일 추가
          if (!document.getElementById('modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = \`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
              @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
            \`;
            document.head.appendChild(style);
          }
          
          modal.querySelector('#cancel-btn').onclick = () => {
            overlay.remove();
            if (onCancel) onCancel();
          };
          
          modal.querySelector('#confirm-btn').onclick = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
          };
          
          overlay.onclick = (e) => {
            if (e.target === overlay) {
              overlay.remove();
              if (onCancel) onCancel();
            }
          };
        }
        
        // 페이지 로드 시 데이터 불러오기
        document.addEventListener('DOMContentLoaded', async () => {
          await loadCompanyDashboard();
        });
        
        // 페이지 포커스 시 데이터 새로고침 (다른 페이지에서 돌아왔을 때)
        let lastFocusTime = Date.now();
        window.addEventListener('focus', async () => {
          const now = Date.now();
          // 5초 이상 지난 경우에만 새로고침 (너무 빈번한 새로고침 방지)
          if (now - lastFocusTime > 5000) {
            console.log('페이지 포커스 감지 - 데이터 새로고침');
            await loadCompanyDashboard();
            lastFocusTime = now;
          }
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
            
            // 최근 활동 로드
            await loadRecentActivity();
            
            // 최근 지원자 로드
            await loadRecentApplicants();
            
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
            
            if (jobsData.success && jobsData.data) {
              displayCompanyJobs(jobsData.data);
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
          const container = document.getElementById('jobs-list');
          if (!container) {
            console.error('jobs-list 컨테이너를 찾을 수 없습니다');
            return;
          }
          
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
              'active': { label: '모집중', color: 'green', icon: 'check-circle' },
              'closed': { label: '마감', color: 'gray', icon: 'times-circle' },
              'draft': { label: '임시저장', color: 'yellow', icon: 'edit' }
            };
            
            const status = statusMap[job.status] || statusMap['active'];
            const createdDate = new Date(job.created_at).toLocaleDateString('ko-KR');
            const isActive = job.status === 'active';
            const isClosed = job.status === 'closed';
            
            // 상태에 따른 버튼 생성
            let actionButtons = '';
            
            if (isActive) {
              // 모집중: 상세보기, 수정, 마감
              actionButtons = \`
                <a href="/jobs/\${job.id}" class="text-gray-500 hover:text-blue-600 p-2" title="상세보기">
                  <i class="fas fa-eye"></i>
                </a>
                <button onclick="editJob(\${job.id})" class="text-gray-500 hover:text-blue-600 p-2" title="수정">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="closeJob(\${job.id})" class="text-gray-500 hover:text-orange-600 p-2" title="마감">
                  <i class="fas fa-pause-circle"></i>
                </button>
              \`;
            } else if (isClosed) {
              // 마감: 상세보기, 재등록, 삭제
              actionButtons = \`
                <a href="/jobs/\${job.id}" class="text-gray-500 hover:text-blue-600 p-2" title="상세보기">
                  <i class="fas fa-eye"></i>
                </a>
                <button onclick="reopenJob(\${job.id})" class="text-gray-500 hover:text-green-600 p-2" title="재등록">
                  <i class="fas fa-redo"></i>
                </button>
                <button onclick="deleteJob(\${job.id})" class="text-gray-500 hover:text-red-600 p-2" title="삭제">
                  <i class="fas fa-trash"></i>
                </button>
              \`;
            } else {
              // 기타 상태: 기본 버튼
              actionButtons = \`
                <a href="/jobs/\${job.id}" class="text-gray-500 hover:text-blue-600 p-2" title="상세보기">
                  <i class="fas fa-eye"></i>
                </a>
                <button onclick="editJob(\${job.id})" class="text-gray-500 hover:text-blue-600 p-2" title="수정">
                  <i class="fas fa-edit"></i>
                </button>
              \`;
            }
            
            return \`
              <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors \${isClosed ? 'opacity-75' : ''}">
                <div class="flex items-center flex-1">
                  <div class="w-12 h-12 bg-\${isActive ? 'blue' : 'gray'}-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-briefcase text-\${isActive ? 'blue' : 'gray'}-600"></i>
                  </div>
                  <div class="ml-4 flex-1">
                    <h3 class="font-medium text-gray-900 \${isClosed ? 'line-through' : ''}">\${job.title}</h3>
                    <p class="text-gray-600 text-sm">\${job.location} • \${createdDate}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-3 py-1 bg-\${status.color}-100 text-\${status.color}-800 rounded-full text-sm whitespace-nowrap flex items-center">
                    <i class="fas fa-\${status.icon} mr-1"></i>
                    \${status.label}
                  </span>
                  \${actionButtons}
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 대시보드 통계 로드
        async function loadDashboardStats() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            // 1. 현재 사용자 정보 가져오기
            const userResponse = await fetch('/api/auth/profile', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const userData = await userResponse.json();
            
            if (!userData.success || !userData.profile || !userData.profile.id) {
              console.error('사용자 프로필 정보를 가져올 수 없습니다');
              return;
            }
            
            const companyId = userData.profile.id;
            console.log('Company ID for stats:', companyId);
            
            // 2. 전체 구인공고 데이터 가져오기 (모든 상태)
            const jobsResponse = await fetch(\`/api/jobs/company/\${companyId}?status=all\`, {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const jobsData = await jobsResponse.json();
            
            if (jobsData.success && jobsData.data) {
              const jobs = jobsData.data;
              
              // 진행 중인 공고 수
              const activeJobs = jobs.filter(j => j.status === 'active');
              document.getElementById('stat-active-jobs').textContent = activeJobs.length;
              
              // 전체 공고 수
              document.getElementById('stat-total-jobs').textContent = jobs.length;
              
              // 총 조회수 계산
              const totalViews = jobs.reduce((sum, job) => sum + (job.views_count || 0), 0);
              document.getElementById('stat-total-views').textContent = totalViews;
              
              // 총 지원자 수 계산 (각 공고의 applications_count 합산)
              let totalApplications = 0;
              
              // 각 공고별로 지원자 수를 가져와서 합산
              for (const job of jobs) {
                try {
                  // 공고 상세 정보에서 applications_count 가져오기
                  const jobDetailResponse = await fetch(\`/api/jobs/\${job.id}\`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                  });
                  const jobDetail = await jobDetailResponse.json();
                  
                  if (jobDetail.success && jobDetail.job && jobDetail.job.applications_count) {
                    totalApplications += jobDetail.job.applications_count;
                  }
                } catch (err) {
                  console.error(\`공고 \${job.id} 지원자 수 조회 실패:\`, err);
                }
              }
              
              document.getElementById('stat-total-applications').textContent = totalApplications;
              
              console.log('통계 업데이트 완료:', {
                activeJobs: activeJobs.length,
                totalJobs: jobs.length,
                totalViews: totalViews,
                totalApplications: totalApplications
              });
              
            } else {
              // 데이터가 없는 경우 0으로 표시
              document.getElementById('stat-active-jobs').textContent = '0';
              document.getElementById('stat-total-applications').textContent = '0';
              document.getElementById('stat-total-jobs').textContent = '0';
              document.getElementById('stat-total-views').textContent = '0';
            }
            
          } catch (error) {
            console.error('통계 로드 오류:', error);
            // 에러 발생 시 0으로 표시
            document.getElementById('stat-active-jobs').textContent = '0';
            document.getElementById('stat-total-applications').textContent = '0';
            document.getElementById('stat-total-jobs').textContent = '0';
            document.getElementById('stat-total-views').textContent = '0';
          }
        }
        
        // 최근 활동 로드
        async function loadRecentActivity() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            // 1. 현재 사용자 정보 가져오기
            const userResponse = await fetch('/api/auth/profile', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const userData = await userResponse.json();
            
            if (!userData.success || !userData.profile || !userData.profile.id) {
              console.error('사용자 프로필 정보를 가져올 수 없습니다');
              return;
            }
            
            const companyId = userData.profile.id;
            
            // 2. 최근 공고 가져오기
            const jobsResponse = await fetch(\`/api/jobs/company/\${companyId}?status=all&limit=5\`, {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const jobsData = await jobsResponse.json();
            
            const activityContainer = document.getElementById('recent-activity');
            
            if (jobsData.success && jobsData.jobs && jobsData.jobs.length > 0) {
              const activities = jobsData.jobs.slice(0, 5).map(job => {
                const date = new Date(job.created_at);
                const timeAgo = getTimeAgo(date);
                
                return \`
                  <div class="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                    <div class="flex items-start">
                      <i class="fas fa-plus-circle text-blue-600 mt-1"></i>
                      <div class="ml-3 flex-1">
                        <p class="text-sm font-medium text-gray-900">\${job.title}</p>
                        <p class="text-xs text-gray-600 mt-1">\${timeAgo} 공고 등록</p>
                      </div>
                    </div>
                  </div>
                \`;
              }).join('');
              
              activityContainer.innerHTML = activities;
            } else {
              activityContainer.innerHTML = \`
                <div class="text-center py-4 text-gray-500 text-sm">
                  <i class="fas fa-inbox mb-2"></i>
                  <p>최근 활동이 없습니다</p>
                </div>
              \`;
            }
            
          } catch (error) {
            console.error('최근 활동 로드 오류:', error);
            const activityContainer = document.getElementById('recent-activity');
            activityContainer.innerHTML = \`
              <div class="text-center py-4 text-gray-500 text-sm">
                <i class="fas fa-exclamation-circle mb-2"></i>
                <p>활동 내역을 불러올 수 없습니다</p>
              </div>
            \`;
          }
        }
        
        // 최근 지원자 로드
        async function loadRecentApplicants() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            // 지원자 목록 가져오기
            const response = await fetch('/api/applications', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await response.json();
            
            if (data.success && data.applications && data.applications.length > 0) {
              const applicants = data.applications.slice(0, 5); // 최근 5명만 표시
              
              document.getElementById('recent-applicants').innerHTML = applicants.map(app => {
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
                const applicantName = \`\${app.first_name || ''} \${app.last_name || ''}\`.trim() || '이름 없음';
                const appliedDate = new Date(app.applied_at).toLocaleDateString('ko-KR');
                
                return \`
                  <a href="/applications/\${app.id}" class="block p-3 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center">
                        <i class="fas fa-user-circle text-gray-400 text-xl mr-3"></i>
                        <div>
                          <p class="font-medium text-gray-900">\${applicantName}</p>
                          <p class="text-xs text-gray-500">\${app.job_title || '직무 없음'}</p>
                        </div>
                      </div>
                      <span class="px-2 py-1 rounded-full text-xs \${statusColor}">\${statusLabel}</span>
                    </div>
                    <div class="text-xs text-gray-500 flex items-center">
                      <i class="fas fa-calendar mr-1"></i>
                      \${appliedDate} 지원
                    </div>
                  </a>
                \`;
              }).join('');
              
            } else {
              document.getElementById('recent-applicants').innerHTML = \`
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-inbox text-gray-300 text-4xl mb-3"></i>
                  <p class="text-sm">아직 지원자가 없습니다</p>
                </div>
              \`;
            }
            
          } catch (error) {
            console.error('지원자 로드 오류:', error);
            document.getElementById('recent-applicants').innerHTML = \`
              <div class="text-center py-4 text-gray-500 text-sm">
                <i class="fas fa-exclamation-circle mb-2"></i>
                <p>지원자 목록을 불러올 수 없습니다</p>
              </div>
            \`;
          }
        }
        
        // 시간 경과 표시 함수
        function getTimeAgo(date) {
          const now = new Date();
          const diffMs = now - date;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          if (diffMins < 60) {
            return \`\${diffMins}분 전\`;
          } else if (diffHours < 24) {
            return \`\${diffHours}시간 전\`;
          } else if (diffDays < 7) {
            return \`\${diffDays}일 전\`;
          } else {
            return date.toLocaleDateString('ko-KR');
          }
        }
        
        // 구인공고 수정
        async function editJob(jobId) {
          // 공고 수정 페이지로 이동
          window.location.href = \`/jobs/\${jobId}/edit\`;
        }
        
        // 구인공고 마감
        async function closeJob(jobId) {
          showConfirm({
            title: '공고 마감',
            message: '이 공고를 마감하시겠습니까?\\n마감 후에도 재등록할 수 있습니다.',
            type: 'warning',
            confirmText: '마감',
            cancelText: '취소',
            onConfirm: async () => {
              try {
                const token = localStorage.getItem('wowcampus_token');
                const response = await fetch(\`/api/jobs/\${jobId}\`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ status: 'closed' })
                });
                
                const result = await response.json();
                
                if (result.success) {
                  toast.success('✅ 공고가 마감되었습니다.');
                  await loadCompanyDashboard();
                } else {
                  toast.error('❌ ' + (result.message || '공고 마감에 실패했습니다.'));
                }
              } catch (error) {
                console.error('공고 마감 오류:', error);
                toast.error('❌ 공고 마감 중 오류가 발생했습니다.');
              }
            }
          });
        }
        
        // 구인공고 재등록
        async function reopenJob(jobId) {
          showConfirm({
            title: '공고 재등록',
            message: '이 공고를 다시 모집중으로 변경하시겠습니까?',
            type: 'success',
            confirmText: '재등록',
            cancelText: '취소',
            onConfirm: async () => {
              try {
                const token = localStorage.getItem('wowcampus_token');
                const response = await fetch(\`/api/jobs/\${jobId}\`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ status: 'active' })
                });
                
                const result = await response.json();
                
                if (result.success) {
                  toast.success('✅ 공고가 재등록되었습니다.');
                  await loadCompanyDashboard();
                } else {
                  toast.error('❌ ' + (result.message || '공고 재등록에 실패했습니다.'));
                }
              } catch (error) {
                console.error('공고 재등록 오류:', error);
                toast.error('❌ 공고 재등록 중 오류가 발생했습니다.');
              }
            }
          });
        }
        
        // 구인공고 삭제 (마감된 공고만)
        async function deleteJob(jobId) {
          showConfirm({
            title: '공고 삭제',
            message: '⚠️ 삭제된 공고는 복구할 수 없습니다.\\n정말로 삭제하시겠습니까?',
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
                  await loadCompanyDashboard();
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
