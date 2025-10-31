/**
 * Page Component
 * Route: /dashboard/jobseeker
 * Original: src/index.tsx lines 15879-16138
 */

import type { Context } from 'hono'
import { authMiddleware } from '../middleware/auth'

export const handler = async (c: Context) => {
const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    throw new HTTPException(403, { message: '구직자만 접근할 수 있는 페이지입니다.' });
  }

  // 구직자 관련 데이터 조회
  let dashboardData = {
    applications_count: 0,
    profile_views: 87, // 기본값
    interview_offers: 0,
    rating: 4.8, // 기본값
    recent_applications: [],
    notifications: []
  };

  try {
    // 1. 먼저 jobseeker ID 조회
    const jobseekerRecord = await c.env.DB.prepare(`
      SELECT id FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();

    if (jobseekerRecord) {
      const jobseekerId = jobseekerRecord.id;

      // 2. 지원한 공고 수 조회 (간단한 쿼리)
      const applicationsCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications WHERE jobseeker_id = ?
      `).bind(jobseekerId).first();

      dashboardData.applications_count = applicationsCount?.count || 0;

      // 3. 면접 제안 수 조회  
      const interviewCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications 
        WHERE jobseeker_id = ? AND status = 'interview'
      `).bind(jobseekerId).first();

      dashboardData.interview_offers = interviewCount?.count || 0;

      // 4. 최근 지원 현황 조회 (기본 데이터만)
      const recentApplications = await c.env.DB.prepare(`
        SELECT id, status, applied_at FROM applications 
        WHERE jobseeker_id = ? 
        ORDER BY applied_at DESC 
        LIMIT 5
      `).bind(jobseekerId).all();

      dashboardData.recent_applications = recentApplications.results || [];
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
            <a href="/" class="flex items-center space-x-3">
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

      {/* 구직자 대시보드 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">안녕하세요, {user.email}님!</h1>
              <p class="text-green-100">구직자 대시보드에서 나의 활동을 관리하세요</p>
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
                <p class="text-2xl font-bold text-gray-900">{dashboardData.applications_count}</p>
                <p class="text-gray-600 text-sm">지원한 공고</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-eye text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.profile_views}</p>
                <p class="text-gray-600 text-sm">프로필 조회수</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-handshake text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.interview_offers}</p>
                <p class="text-gray-600 text-sm">면접 제안</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-star text-yellow-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{dashboardData.rating}</p>
                <p class="text-gray-600 text-sm">평점</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 그리드 */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 최근 지원 현황 */}
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">최근 지원 현황</h2>
              <div class="space-y-4">
                {dashboardData.recent_applications.length > 0 ? (
                  dashboardData.recent_applications.map((application, index) => {
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      reviewing: 'bg-blue-100 text-blue-800', 
                      interview: 'bg-purple-100 text-purple-800',
                      accepted: 'bg-green-100 text-green-800',
                      rejected: 'bg-red-100 text-red-800'
                    };
                    
                    const statusLabels = {
                      pending: '검토 대기',
                      reviewing: '검토 중',
                      interview: '면접 대기', 
                      accepted: '합격',
                      rejected: '불합격'
                    };
                    
                    return (
                      <div key={application.id} class="flex items-center justify-between p-4 border rounded-lg">
                        <div class="flex items-center">
                          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-building text-blue-600"></i>
                          </div>
                          <div class="ml-4">
                            <h3 class="font-medium text-gray-900">{application.company_name} - {application.job_title}</h3>
                            <p class="text-gray-600 text-sm">{new Date(application.applied_at).toLocaleDateString('ko-KR')} 지원</p>
                          </div>
                        </div>
                        <span class={`px-3 py-1 rounded-full text-sm ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[application.status] || application.status}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div class="text-center py-12">
                    <i class="fas fa-briefcase text-gray-300 text-6xl mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-500 mb-2">아직 지원한 공고가 없습니다</h3>
                    <p class="text-gray-400 mb-6">맞춤 구인공고를 찾아 지원해보세요!</p>
                    <a href="/jobs" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-search mr-2"></i>
                      구인공고 찾기
                    </a>
                  </div>
                )}
              </div>
              
              <div class="mt-6">
                <a href="/jobs" class="text-blue-600 font-medium hover:underline">
                  더 많은 구인공고 보기 →
                </a>
              </div>
            </div>
          </div>
          
          {/* 빠른 액션 & 알림 */}
          <div class="space-y-6">
            {/* 빠른 액션 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">빠른 액션</h2>
              <div class="space-y-3">
                <a href="/profile" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-user-edit text-blue-600 mr-3"></i>
                  <span class="font-medium">프로필 수정</span>
                </a>
                <a href="/jobs" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-search text-green-600 mr-3"></i>
                  <span class="font-medium">구인공고 검색</span>
                </a>
                <a href="/matching" class="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <i class="fas fa-magic text-purple-600 mr-3"></i>
                  <span class="font-medium">AI 매칭</span>
                </a>
              </div>
            </div>
            
            {/* 알림 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">최근 알림</h2>
              <div class="space-y-3">
                <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p class="text-blue-800 text-sm font-medium">새로운 매칭 결과가 있습니다!</p>
                  <p class="text-blue-600 text-xs mt-1">2시간 전</p>
                </div>
                <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p class="text-green-800 text-sm font-medium">LG화학 서류 합격 축하합니다</p>
                  <p class="text-green-600 text-xs mt-1">1일 전</p>
                </div>
                <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p class="text-yellow-800 text-sm font-medium">프로필을 업데이트해보세요</p>
                  <p class="text-yellow-600 text-xs mt-1">3일 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )


// 🎨 프로필 편집 페이지 (구직자 전용)
}

// Middleware: authMiddleware
