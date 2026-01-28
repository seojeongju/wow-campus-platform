
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-pages'
import { HTTPException } from 'hono/http-exception'

import type { Bindings, Variables } from './types/env'
import { renderer } from './renderer'

// Import routes
import authRoutes from './routes/auth'
import jobRoutes from './routes/jobs'
import jobseekersRoutes from './routes/jobseekers'
import agentsRoutes from './routes/agents'
import companiesRoutes from './routes/companies' // New
import adminRoutes from './routes/admin'
import contactRoutes from './routes/contact'
import { matching } from './routes/matching'
import uploadRoutes from './routes/upload'
import profileRoutes from './routes/profile'
import applicationsRoutes from './routes/applications'

// Import new routes (Refactored)
import homeApi from './routes/home'
import documentsApi from './routes/documents'
import universityApi from './routes/university'
// import adminDashboardApi from './routes/admin_dashboard' // Consolidated

import dashboardApi from './routes/dashboard'
import publicApi from './routes/public_api'
import debugRoutes from './routes/debug' // Temporary debug route

// Import middleware
import { corsMiddleware, apiCors } from './middleware/cors'
import { optionalAuth, requireAdmin, authMiddleware, requireAgent, requireCompany } from './middleware/auth'
import { checkPageAccess, requireAdminPage } from './middleware/permissions'
import { i18nMiddleware } from './middleware/i18n'

// Import Pages
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
import { handler as JobCreatePage } from './pages/jobs/create'
import { handler as JobEditPage } from './pages/jobs/edit'
import { handler as JobseekersListPage } from './pages/jobseekers/list'
import { handler as JobseekerDetailPage } from './pages/jobseekers/detail'
import { handler as ApplicationsListPage } from './pages/applications/list'
import { handler as ApplicationDetailPage } from './pages/applications/detail'
import { handler as StudyIndexPage } from './pages/study/index'
import { handler as StudyKoreanPage } from './pages/study/korean'
import { handler as StudyUndergraduatePage } from './pages/study/undergraduate'
import { handler as StudyGraduatePage } from './pages/study/graduate'
import { handler as AgentsDashboardPage } from './pages/agents/dashboard'
import { handler as JobseekerCreatePage } from './pages/agents/jobseeker/create'
import { handler as AgentCreatePage } from './pages/agents/create'
import { handler as CompanyCreatePage } from './pages/companies/create'
import { handler as AgentsAssignPage } from './pages/agents/assign'
import { handler as AgentsProfileEditPage } from './pages/agents/profile-edit'
import { handler as StatisticsPage } from './pages/statistics'
import { handler as ProfilePage } from './pages/profile'
import { handler as CompanyProfilePage } from './pages/profile/company'
import { handler as DashboardIndexPage } from './pages/dashboard/index'
import { handler as DashboardLegacyPage } from './pages/dashboard/legacy'
import { handler as DashboardJobseekerPage } from './pages/dashboard/jobseeker'
// import { handler as DashboardJobseekerDocumentsPage } from './pages/dashboard/jobseeker-documents' // Module not found
import { handler as DashboardCompanyPage } from './pages/dashboard/company'

import { handler as AdminFullPage } from './pages/dashboard/admin-full'
import { handler as AdminInquiriesPage } from './pages/admin/inquiries'
import { handler as GlobalSupportIndexPage } from './pages/global-support/index'
import { handler as GlobalSupportVisaPage } from './pages/global-support/visa'
import { handler as GlobalSupportLegalPage } from './pages/global-support/legal'
import { handler as GlobalSupportFinancePage } from './pages/global-support/finance'
import { handler as GlobalSupportTelecomPage } from './pages/global-support/telecom'
import { handler as GlobalSupportAcademicPage } from './pages/global-support/academic'
import { handler as GlobalSupportEmploymentPage } from './pages/global-support/employment'
import { handler as UniversitiesPage } from './pages/universities'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Global error handler
app.onError((err, c) => {
  console.error('[Global Error Handler] 오류 발생:', err);
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      message: err.message,
      status: err.status
    }, err.status)
  }
  const errorMessage = err instanceof Error ? err.message : 'Internal Server Error'
  return c.json({
    success: false,
    message: errorMessage,
    error: errorMessage,
    path: c.req.path
  }, 500)
})

// Global middleware
app.use('*', logger())
app.use('*', i18nMiddleware)

// Static files serving (Moved from inline strings to static directory)
// Assuming Vite or Cloudflare Workers handles 'public' directory serving.
// We add an explicit static handler for safety in some environments, pointing to root.
// If 'public' dir is the root for static assets:
// @ts-ignore
// CSP Middleware to allow scripts
app.use('*', async (c, next) => {
  await next()
  c.header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src * data: blob:; style-src * 'unsafe-inline';")
})

// 정적 파일 수동 서빙 및 디버깅
app.get('/assets/*', async (c) => {
  // @ts-ignore
  if (!c.env?.ASSETS) {
    console.error('ASSETS binding missing');
    return c.text("Error: ASSETS binding missing in Cloudflare Pages environment", 500);
  }

  // @ts-ignore
  const response = await c.env.ASSETS.fetch(c.req.raw);
  if (response.status === 404) {
    const path = new URL(c.req.url).pathname;
    console.error(`File not found: ${path}`);
    return c.text(`Error: File not found in ASSETS for path: ${path}`, 404);
  }
  return response;
})

app.get('/images/*', async (c) => {
  // @ts-ignore
  if (!c.env?.ASSETS) {
    console.error('ASSETS binding missing');
    return c.text("Error: ASSETS binding missing in Cloudflare Pages environment", 500);
  }

  // @ts-ignore
  const response = await c.env.ASSETS.fetch(c.req.raw);
  if (response.status === 404) {
    const path = new URL(c.req.url).pathname;
    console.error(`File not found: ${path}`);
    return c.text(`Error: File not found in ASSETS for path: ${path}`, 404);
  }
  return response;
})
// Note: In Cloudflare Workers with 'assets' config, this might be redundant or handled by binding.
// But we keep it to ensure /static/app.js is reachable if the platform supports it via this middleware.

// CORS for API routes
app.use('/api/*', apiCors)

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/jobs', jobRoutes)
app.route('/api/jobseekers', jobseekersRoutes)
app.route('/api/companies', companiesRoutes) // New
app.route('/api/agents', agentsRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/contact', contactRoutes)
app.route('/api/matching', matching)
app.route('/api/upload', uploadRoutes)
app.route('/api/profile', profileRoutes)
app.route('/api/applications', applicationsRoutes)

// New Refactored API Routes
app.route('/api/latest-information', homeApi) // GET /api/latest-information
app.route('/api/documents', documentsApi)
app.route('/api/universities', universityApi)
app.route('/api/partner-universities', universityApi)
// Agents API consolidated into agentsRoutes (/api/agents)

// Consolidated admin dashboard stats into adminRoutes (/api/admin)


app.route('/api/dashboard', dashboardApi)
app.route('/api/public', publicApi)
app.route('/api/debug', debugRoutes) // Register debug routes
app.route('/api', homeApi) // For /api/latest-information (defined as /latest-information in homeApi)

// ============================================================
// WEB PAGES (렌더링 - 분리된 컴포넌트 사용)
// ============================================================
// 모든 웹 페이지에 renderer 적용
// API routes must be defined BEFORE this, or exclude them.
// Hono middleware applies to routes defined AFTER it? No, applies to requests matching the path.
// If we use 'app.use', it applies to all subsequent handlers.
// But we defined API routes above.
// So this renderer middleware will apply to routes defined BELOW.
app.use('*', renderer)

// Jobseeker Detail Page - 구직정보 상세보기
app.get('/jobseekers/:id', optionalAuth, JobseekerDetailPage)

// Job Create Page - 구인공고 등록 (기업 전용)
app.get('/jobs/create', ...JobCreatePage)

// Job Edit Page - 구인공고 수정 (기업 전용)
app.get('/jobs/:id/edit', ...JobEditPage)

// Job Detail Page - 구인정보 상세보기  
app.get('/jobs/:id', optionalAuth, JobDetailPage)

// Jobs page
app.get('/jobs', JobsListPage)

// Study page
app.get('/study', StudyIndexPage)

// Universities page
app.get('/universities', UniversitiesPage)

// Study Program Detail Pages
app.get('/study/korean', StudyKoreanPage)
app.get('/study/undergraduate', StudyUndergraduatePage)
app.get('/study/graduate', StudyGraduatePage)

// Job Seekers page (구직정보 보기)
app.get('/jobseekers', optionalAuth, JobseekersListPage)

// Applications List Page - 지원자 목록 (기업 전용)
app.get('/applications/list', authMiddleware, requireCompany, ApplicationsListPage)

// Application Detail Page - 지원자 상세 (기업 전용)
app.get('/applications/:id', authMiddleware, ApplicationDetailPage)

// Agents Dashboard page (에이전트 관리) - 에이전트 전용
app.get('/agents', authMiddleware, requireAgent, AgentsDashboardPage)

// Agent Create Page - 관리자 전용
app.get('/agents/create', ...AgentCreatePage)

// Company Create Page - 관리자 전용
app.get('/companies/create', ...CompanyCreatePage)


// Agent Jobseeker Create Page - 에이전트 전용
app.get('/agents/jobseeker/create', ...JobseekerCreatePage)

// Agent Jobseeker Assignment Page - 에이전트 전용
app.get('/agents/assign', authMiddleware, requireAgent, AgentsAssignPage)

// Agent Profile Edit Page - 에이전트 전용
app.get('/agents/profile/edit', authMiddleware, requireAgent, AgentsProfileEditPage)

// Statistics page
app.get('/statistics', authMiddleware, StatisticsPage)

// Home page (optional auth - allows both logged in and anonymous users) - Now the landing page
app.get('/', optionalAuth, HomePage)
app.get('/home', optionalAuth, HomePage)

// Login/Signup page (public)
app.get('/login', LoginPage)

// Matching page (protected)
app.get('/matching', authMiddleware, MatchingPage)

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

// Terms, Privacy, Cookies pages
app.get('/terms', TermsPage)
app.get('/privacy', PrivacyPage)
app.get('/cookies', CookiesPage)

// Dashboard - Jobseeker
app.get('/dashboard/jobseeker', authMiddleware, DashboardJobseekerPage)

// Profile page
app.get('/profile', authMiddleware, ProfilePage)

// Company Profile page - 기업 전용
app.get('/profile/company', authMiddleware, requireCompany, CompanyProfilePage)

// Support Center - 고객지원 (Customer Support)
// app.get('/support', SupportPage) // Duplicate

// Global Support Center - 글로벌 지원 센터
app.get('/global-support', GlobalSupportIndexPage)
app.get('/global-support/visa', GlobalSupportVisaPage)
app.get('/global-support/legal', GlobalSupportLegalPage)
app.get('/global-support/finance', GlobalSupportFinancePage)
app.get('/global-support/telecom', GlobalSupportTelecomPage)
app.get('/global-support/academic', GlobalSupportAcademicPage)
app.get('/global-support/employment', GlobalSupportEmploymentPage)

// Dashboard - Company - 기업 전용
app.get('/dashboard/company', authMiddleware, requireCompany, DashboardCompanyPage)

// Dashboard - Admin (간단한 버전)


// Admin (전체 버전)
app.get('/admin', authMiddleware, requireAdmin, AdminFullPage)

// Admin Inquiries
app.get('/admin/inquiries', authMiddleware, requireAdmin, AdminInquiriesPage)

// Test upload page removed (no longer needed)

export default app



