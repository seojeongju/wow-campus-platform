#!/usr/bin/env python3
"""
새로운 index.tsx 생성
- 라인 1-6968: 원본 유지 (static assets, API routes)
- 라인 6969-19463: 페이지 import 및 라우팅으로 교체
- 라인 19464: export default 유지
"""

from pathlib import Path

def read_lines(filepath, start, end):
    """파일에서 특정 라인 범위를 읽습니다"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        return ''.join(lines[start - 1:end])

def generate_page_imports():
    """페이지 import 문 생성"""
    return """// ============================================================
// PAGE COMPONENTS (분리된 페이지 컴포넌트)
// ============================================================
import { LoginPage } from './pages/login'
import { handler as ContactPage } from './pages/contact'
import { handler as FaqPage } from './pages/faq'
import { handler as GuidePage } from './pages/guide'
import { handler as NoticePage } from './pages/notice'
import { handler as BlogPage } from './pages/blog'
import { handler as TermsPage } from './pages/terms'
import { handler as PrivacyPage } from './pages/privacy'
import { handler as CookiesPage } from './pages/cookies'
import { handler as MatchingPage } from './pages/matching'
import { handler as SupportPage } from './pages/support'
import { handler as HomePage } from './pages/home'
import { handler as JobsListPage } from './pages/jobs/list'
import { handler as JobDetailPage } from './pages/jobs/detail'
import { handler as JobseekersListPage } from './pages/jobseekers/list'
import { handler as JobseekerDetailPage } from './pages/jobseekers/detail'
import { handler as StudyIndexPage } from './pages/study/index'
import { handler as StudyKoreanPage } from './pages/study/korean'
import { handler as StudyUndergraduatePage } from './pages/study/undergraduate'
import { handler as StudyGraduatePage } from './pages/study/graduate'
import { handler as AgentsDashboardPage } from './pages/agents/dashboard'
import { handler as AgentsAssignPage } from './pages/agents/assign'
import { handler as AgentsProfileEditPage } from './pages/agents/profile-edit'
import { handler as StatisticsPage } from './pages/statistics'
import { handler as ProfilePage } from './pages/profile'
import { handler as DashboardIndexPage } from './pages/dashboard/index'
import { handler as DashboardLegacyPage } from './pages/dashboard/legacy'
import { handler as DashboardJobseekerPage } from './pages/dashboard/jobseeker'
import { handler as DashboardCompanyPage } from './pages/dashboard/company'
import { handler as DashboardAdminPage } from './pages/dashboard/admin'
import { handler as AdminFullPage } from './pages/dashboard/admin-full'
"""

def generate_page_routes():
    """페이지 라우팅 코드 생성"""
    return """
// ============================================================
// WEB PAGES (렌더링 - 분리된 컴포넌트 사용)
// ============================================================
// 모든 웹 페이지에 renderer 적용
app.use('*', renderer)

// Jobseeker Detail Page - 구직정보 상세보기
app.get('/jobseekers/:id', optionalAuth, JobseekerDetailPage)

// Job Detail Page - 구인정보 상세보기  
app.get('/jobs/:id', optionalAuth, JobDetailPage)

// Jobs page
app.get('/jobs', JobsListPage)

// Study page
app.get('/study', StudyIndexPage)

// Study Program Detail Pages
app.get('/study/korean', StudyKoreanPage)
app.get('/study/undergraduate', StudyUndergraduatePage)
app.get('/study/graduate', StudyGraduatePage)

// Job Seekers page (구직정보 보기)
app.get('/jobseekers', optionalAuth, JobseekersListPage)

// Agents Dashboard page (에이전트 관리)
app.get('/agents', optionalAuth, AgentsDashboardPage)

// Agent Jobseeker Assignment Page
app.get('/agents/assign', optionalAuth, AgentsAssignPage)

// Agent Profile Edit Page
app.get('/agents/profile/edit', optionalAuth, AgentsProfileEditPage)

// Statistics page
app.get('/statistics', optionalAuth, StatisticsPage)

// Home page
app.get('/', HomePage)

// Matching page
app.get('/matching', MatchingPage)

// Support page
app.get('/support', SupportPage)

// FAQ page
app.get('/faq', FaqPage)

// Guide page
app.get('/guide', GuidePage)

// Login page
app.get('/login', LoginPage)

// Contact page
app.get('/contact', ContactPage)

// Notice page
app.get('/notice', NoticePage)

// Blog page
app.get('/blog', BlogPage)

// API Documentation page (간단한 JSON 응답)
app.get('/api', (c) => {
  return c.json({
    message: 'WOW-CAMPUS API Documentation',
    endpoints: {
      auth: '/api/auth/*',
      jobs: '/api/jobs/*',
      jobseekers: '/api/jobseekers/*',
      agents: '/api/agents/*',
      admin: '/api/admin/*',
      contact: '/api/contact',
      matching: '/api/matching',
      upload: '/api/upload/*'
    }
  })
})

// Dashboard pages
app.get('/dashboard', authMiddleware, DashboardIndexPage)
app.get('/dashboard/legacy', DashboardLegacyPage)

// TODO: 원본에서 복사 필요 (라인 14360-15357)
// - POST /api/auth/login
// - POST /api/auth/register
// - POST /api/auth/find-email
// - POST /api/auth/find-password
// - GET /api/profile/:userId
// - POST /api/profile
// - GET /api/profiles
// - GET /api/profile/jobseeker
// - POST /api/upload/resume
// - POST /api/upload/portfolio
// - POST /api/upload/document

// Terms, Privacy, Cookies pages
app.get('/terms', TermsPage)
app.get('/privacy', PrivacyPage)
app.get('/cookies', CookiesPage)

// Dashboard - Jobseeker
app.get('/dashboard/jobseeker', authMiddleware, DashboardJobseekerPage)

// Profile page
app.get('/profile', authMiddleware, ProfilePage)

// Dashboard - Company
app.get('/dashboard/company', optionalAuth, DashboardCompanyPage)

// Dashboard - Admin (간단한 버전)
app.get('/dashboard/admin', optionalAuth, requireAdmin, DashboardAdminPage)

// Admin (전체 버전)
app.get('/admin', optionalAuth, requireAdmin, AdminFullPage)

// Test upload page (개발용)
app.get('/test-upload.html', async (c) => {
  const html = await Deno.readTextFile('./test-upload.html')
  return c.html(html)
})
"""

def main():
    print("🚀 새로운 index.tsx 생성 중...\n")
    
    source_file = Path('src/index.tsx')
    output_file = Path('src/index.new.tsx')
    
    if not source_file.exists():
        print("❌ src/index.tsx 파일을 찾을 수 없습니다.")
        return
    
    print("📖 원본 파일 읽는 중...")
    
    # 1. 라인 1-6968 읽기 (static assets, API routes)
    print("   - 라인 1-6968: Static assets & API routes")
    header_section = read_lines(source_file, 1, 6968)
    
    # 2. 페이지 imports 생성
    print("   - 페이지 import 문 생성")
    page_imports = generate_page_imports()
    
    # 3. 페이지 라우팅 생성
    print("   - 페이지 라우팅 코드 생성")
    page_routes = generate_page_routes()
    
    # 4. Export default (라인 19464)
    print("   - 라인 19464: export default")
    footer_section = read_lines(source_file, 19464, 19464)
    
    # 5. 전체 결합
    print("\n📝 새 파일 생성 중...")
    new_content = header_section + page_imports + page_routes + "\n" + footer_section
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ 생성 완료: {output_file}")
    print(f"\n📊 통계:")
    print(f"   - 원본 라인 수: 19,464")
    print(f"   - 새 파일 라인 수: ~{len(new_content.split(chr(10)))}")
    print(f"   - 감소: ~{19464 - len(new_content.split(chr(10)))} 라인")
    print(f"\n💡 다음 단계:")
    print(f"   1. src/index.new.tsx 내용 검토")
    print(f"   2. TODO 주석 부분 원본에서 복사")
    print(f"   3. mv src/index.new.tsx src/index.tsx")
    print(f"   4. npm run build 실행")

if __name__ == '__main__':
    main()
