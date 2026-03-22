/**
 * Page Component
 * Route: /dashboard/jobseeker
 * Original: src/index.tsx lines 15879-16138
 */

import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const { t } = c.get('i18n');

  if (!user || user.user_type !== 'jobseeker') {
    throw new HTTPException(403, { message: t('dashboard.jobseeker_page.error_access') });
  }

  // 구직자 관련 데이터 조회
  let dashboardData: {
    applications_count: number;
    profile_views: number;
    interview_offers: number;
    rating: number;
    recent_applications: any[];
    notifications: any[];
  } = {
    applications_count: 0,
    profile_views: 0,
    interview_offers: 0,
    rating: 0,
    recent_applications: [],
    notifications: []
  };
  let documents: Array<{
    id: number;
    document_type: string;
    original_name: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    upload_date: string;
  }> = [];

  try {
    // 1. 먼저 jobseeker ID 조회 (profile_views도 함께)
    const jobseekerRecord = await c.env.DB.prepare(`
      SELECT id, profile_views FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();

    if (jobseekerRecord) {
      const jobseekerId = jobseekerRecord.id;

      // 프로필 조회수 설정 (NULL이면 0으로 명시)
      dashboardData.profile_views = Number(jobseekerRecord.profile_views) || 0;

      // 2. 지원한 공고 수 조회
      const applicationsCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications WHERE jobseeker_id = ?
      `).bind(jobseekerId).first();

      dashboardData.applications_count = applicationsCount?.count || 0;

      // 3. 면접 제안 수 조회 (면접 관련 상태들)
      const interviewCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications 
        WHERE jobseeker_id = ? 
        AND status IN ('interview_scheduled', 'interview_completed', 'offered')
      `).bind(jobseekerId).first();

      dashboardData.interview_offers = interviewCount?.count || 0;

      // 4. 평점 계산 (성공적인 지원 비율)
      const totalApps = dashboardData.applications_count;
      const successApps = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications 
        WHERE jobseeker_id = ? 
        AND status IN ('offered', 'accepted')
      `).bind(jobseekerId).first();

      if (totalApps > 0) {
        const successRate = (successApps?.count || 0) / totalApps;
        dashboardData.rating = Number((successRate * 5).toFixed(1)); // 0~5점 척도
      } else {
        // 지원한 공고가 없으면 평점 0.0으로 표시
        dashboardData.rating = 0;
      }

      // 5. 최근 지원 현황 조회 (회사명, 직무명 포함)
      const recentApplications = await c.env.DB.prepare(`
        SELECT 
          a.id,
          a.job_posting_id,
          a.status,
          a.applied_at,
          jp.title as job_title,
          c.company_name
        FROM applications a
        LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
        LEFT JOIN companies c ON jp.company_id = c.id
        WHERE a.jobseeker_id = ? 
        ORDER BY a.applied_at DESC 
        LIMIT 5
      `).bind(jobseekerId).all();

      dashboardData.recent_applications = recentApplications.results || [];

      // 6. 최근 알림 조회
      const notifications = await c.env.DB.prepare(`
        SELECT 
          id,
          title,
          message,
          type,
          created_at,
          is_read
        FROM notifications 
        WHERE user_id = ?
        ORDER BY created_at DESC 
        LIMIT 5
      `).bind(user.id).all();

      dashboardData.notifications = notifications.results || [];

      // 7. 업로드된 문서 목록 조회
      const docs = await c.env.DB.prepare(`
        SELECT 
          id,
          document_type,
          original_name,
          file_name,
          file_size,
          mime_type,
          upload_date
        FROM documents
        WHERE user_id = ? AND is_active = 1
        ORDER BY upload_date DESC
      `).bind(user.id).all();

      documents = docs.results || [];
    }

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    // 에러가 발생해도 페이지는 표시 (기본 데이터 사용)
  }

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

      {/* 구직자 대시보드 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">{t('dashboard.jobseeker_page.welcome.greeting').replace('{email}', user.email)}</h1>
              <p class="text-green-100">{t('dashboard.jobseeker_page.welcome.subtitle')}</p>
            </div>
            <div class="text-6xl opacity-20">
              <i class="fas fa-user-tie"></i>
            </div>
          </div>
        </div>

        {/* KPI 카드 - 실제 데이터 연동 */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.applications_count ?? 0}</p>
                <p class="text-gray-600 text-sm">{t('dashboard.jobseeker_page.kpi.applications')}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-eye text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.profile_views ?? 0}</p>
                <p class="text-gray-600 text-sm">{t('dashboard.jobseeker_page.kpi.profile_views')}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-handshake text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.interview_offers ?? 0}</p>
                <p class="text-gray-600 text-sm">{t('dashboard.jobseeker_page.kpi.interview_offers')}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-star text-yellow-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.rating?.toFixed(1) ?? '0.0'}</p>
                <p class="text-gray-600 text-sm">{t('dashboard.jobseeker_page.kpi.rating')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 그리드 */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 최근 지원 현황 */}
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">{t('dashboard.jobseeker_page.recent_applications.title')}</h2>
              <div class="space-y-4">
                {dashboardData.recent_applications.length > 0 ? (
                  dashboardData.recent_applications.map((application, index) => {
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
                      submitted: t('dashboard.jobseeker_page.status.submitted'),
                      reviewed: t('dashboard.jobseeker_page.status.reviewed'),
                      interview_scheduled: t('dashboard.jobseeker_page.status.interview_scheduled'),
                      interview_completed: t('dashboard.jobseeker_page.status.interview_completed'),
                      offered: t('dashboard.jobseeker_page.status.offered'),
                      accepted: t('dashboard.jobseeker_page.status.accepted'),
                      rejected: t('dashboard.jobseeker_page.status.rejected'),
                      withdrawn: t('dashboard.jobseeker_page.status.withdrawn')
                    };

                    return (
                      <a
                        href={`/applications/${application.id}`}
                        key={application.id}
                        class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer group"
                      >
                        <div class="flex items-center flex-1">
                          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <i class="fas fa-building text-blue-600"></i>
                          </div>
                          <div class="ml-4">
                            <h3 class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {application.company_name} - {application.job_title}
                            </h3>
                            <p class="text-gray-600 text-sm">{new Date(application.applied_at).toLocaleDateString('ko-KR')} {t('dashboard.jobseeker_page.recent_applications.applied_on')}</p>
                          </div>
                        </div>
                        <span class={`px-3 py-1 rounded-full text-sm ${(statusColors as any)[application.status] || 'bg-gray-100 text-gray-800'}`}>
                          {(statusLabels as any)[application.status] || application.status}
                        </span>
                      </a>
                    )
                  })
                ) : (
                  <div class="text-center py-12">
                    <i class="fas fa-briefcase text-gray-300 text-6xl mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-500 mb-2">{t('dashboard.jobseeker_page.recent_applications.no_applications.title')}</h3>
                    <p class="text-gray-400 mb-6">{t('dashboard.jobseeker_page.recent_applications.no_applications.description')}</p>
                    <a href="/jobs" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-search mr-2"></i>
                      {t('dashboard.jobseeker_page.recent_applications.no_applications.button')}
                    </a>
                  </div>
                )}
              </div>

              <div class="mt-6">
                <a href="/jobs" class="text-blue-600 font-medium hover:underline">
                  {t('dashboard.jobseeker_page.recent_applications.view_more')}
                </a>
              </div>
            </div>
          </div>

          {/* 빠른 액션 & 알림 */}
          <div class="space-y-6">
            {/* 빠른 액션 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">{t('dashboard.jobseeker_page.quick_actions.title')}</h2>
              <div class="space-y-3">
                <a href="/profile" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-user-edit text-blue-600 mr-3"></i>
                  <span class="font-medium">{t('dashboard.jobseeker_page.quick_actions.edit_profile')}</span>
                </a>
                <a href="/jobs" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-search text-green-600 mr-3"></i>
                  <span class="font-medium">{t('dashboard.jobseeker_page.quick_actions.search_jobs')}</span>
                </a>
                <a href="/matching" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-magic text-purple-600 mr-3"></i>
                  <span class="font-medium">{t('dashboard.jobseeker_page.quick_actions.ai_matching')}</span>
                </a>
              </div>
            </div>

            {/* 알림 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">{t('dashboard.jobseeker_page.notifications.title')}</h2>
              <div class="space-y-3">
                {dashboardData.notifications && dashboardData.notifications.length > 0 ? (
                  dashboardData.notifications.map((notif: any) => {
                    const typeColors = {
                      info: 'bg-blue-50 border-blue-200 text-blue-800',
                      success: 'bg-green-50 border-green-200 text-green-800',
                      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                      error: 'bg-red-50 border-red-200 text-red-800'
                    };
                    const textColors = {
                      info: 'text-blue-600',
                      success: 'text-green-600',
                      warning: 'text-yellow-600',
                      error: 'text-red-600'
                    };
                    const timeAgo = (dateStr: string) => {
                      const locale = window.locale || 'ko';
                      const translations = window.translations || {};
                      const t = (key: string) => {
                        const keys = key.split('.');
                        let value = translations[locale] || translations['ko'];
                        for (const k of keys) {
                          if (value && value[k] !== undefined) {
                            value = value[k];
                          } else {
                            return key;
                          }
                        }
                        return value || key;
                      };
                      const diff = Date.now() - new Date(dateStr).getTime();
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const days = Math.floor(hours / 24);
                      if (days > 0) return t('dashboard.jobseeker_page.notifications.time_ago.days_ago').replace('{days}', days.toString());
                      if (hours > 0) return t('dashboard.jobseeker_page.notifications.time_ago.hours_ago').replace('{hours}', hours.toString());
                      return t('dashboard.jobseeker_page.notifications.time_ago.just_now');
                    };

                    return (
                      <div key={notif.id} class={`p-3 border rounded-lg ${(typeColors as any)[notif.type] || typeColors.info}`}>
                        <p class="text-sm font-medium">{notif.message}</p>
                        <p class={`text-xs mt-1 ${(textColors as any)[notif.type] || textColors.info}`}>
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-bell-slash text-gray-300 text-4xl mb-2"></i>
                    <p class="text-sm">{t('dashboard.jobseeker_page.notifications.no_notifications')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Jobseeker Dashboard JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 구직자 대시보드 JavaScript ====================
        
        // 페이지 로드 시 초기화
        (function() {
          // DOMContentLoaded 또는 이미 로드된 경우 즉시 실행
          function initDashboard() {
            console.log('구직자 대시보드 초기화 시작');
            
            // 네비게이션 메뉴 초기화 (common.js의 함수 사용)
            if (typeof setupNavigation !== 'undefined') {
              setupNavigation();
            }
            
            // 인증 버튼 초기화 (auth-init.js의 함수 사용)
            if (typeof restoreLoginState !== 'undefined') {
              restoreLoginState().then(() => {
                console.log('로그인 상태 복원 완료');
              }).catch(err => {
                console.error('로그인 상태 복원 오류:', err);
              });
            }
            
            // 모바일 메뉴 초기화 (ui.js의 함수 사용)
            if (typeof initMobileMenu !== 'undefined') {
              initMobileMenu();
            }
            
            console.log('구직자 대시보드 초기화 완료');
          }
          
          // DOM이 이미 로드된 경우 즉시 실행, 아니면 DOMContentLoaded 대기
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDashboard);
          } else {
            // DOM이 이미 로드된 경우 즉시 실행
            setTimeout(initDashboard, 100);
          }
        })();
      `}} />
    </div>
  )
}

// Middleware: authMiddleware
