import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { Bindings, Variables } from '../types/env'
import { renderer } from '../renderer'

// Import middleware
import { optionalAuth, requireAdmin, authMiddleware, requireAgent, requireCompany } from '../middleware/auth'
import { checkPageAccess, requireAdminPage } from '../middleware/permissions'

// Import Pages
import { LoginPage } from '../pages/login'
import { handler as ContactPage } from '../pages/contact'
import { handler as FaqPage } from '../pages/faq'
import { handler as GuidePage } from '../pages/guide'
import { handler as NoticePage } from '../pages/notice'
import { handler as BlogPage } from '../pages/blog'
import { handler as TermsPage } from '../pages/terms'
import { handler as PrivacyPage } from '../pages/privacy'
import { handler as CookiesPage } from '../pages/cookies'
import { handler as MatchingPage } from '../pages/matching'
import { handler as SupportPage } from '../pages/support'
import { handler as HomePage } from '../pages/home'

import { handler as JobsListPage } from '../pages/jobs/list'
import { handler as JobDetailPage } from '../pages/jobs/detail'
import { handler as JobCreatePage } from '../pages/jobs/create'
import { handler as JobEditPage } from '../pages/jobs/edit'
import { handler as JobseekersListPage } from '../pages/jobseekers/list'
import { handler as JobseekerDetailPage } from '../pages/jobseekers/detail'
import { handler as ApplicationsListPage } from '../pages/applications/list'
import { handler as ApplicationDetailPage } from '../pages/applications/detail'
import { handler as StudyIndexPage } from '../pages/study/index'
import { handler as StudyKoreanPage } from '../pages/study/korean'
import { handler as StudyUndergraduatePage } from '../pages/study/undergraduate'
import { handler as StudyGraduatePage } from '../pages/study/graduate'
import { handler as UniversityDetailPage } from '../pages/study/detail'
import { handler as AgentsDashboardPage } from '../pages/agents/dashboard'
import { handler as JobseekerCreatePage } from '../pages/agents/jobseeker/create'
import { handler as AgentCreatePage } from '../pages/agents/create'
import { handler as AgentsAssignPage } from '../pages/agents/assign'
import { handler as AgentsProfileEditPage } from '../pages/agents/profile-edit'
import { handler as StatisticsPage } from '../pages/statistics'
import { handler as ProfilePage } from '../pages/profile'
import { handler as CompanyProfilePage } from '../pages/profile/company'
import { handler as DashboardIndexPage } from '../pages/dashboard/index'
import { handler as DashboardLegacyPage } from '../pages/dashboard/legacy'
import { handler as DashboardJobseekerPage } from '../pages/dashboard/jobseeker'
// import { handler as DashboardJobseekerDocumentsPage } from '../pages/dashboard/jobseeker-documents' // Module not found
import { handler as DashboardCompanyPage } from '../pages/dashboard/company'

import { handler as AdminFullPage } from '../pages/dashboard/admin-full'
import { handler as AdminInquiriesPage } from '../pages/admin/inquiries'
import { handler as GlobalSupportIndexPage } from '../pages/global-support/index'
import { handler as GlobalSupportVisaPage } from '../pages/global-support/visa'
import { handler as GlobalSupportLegalPage } from '../pages/global-support/legal'
import { handler as GlobalSupportFinancePage } from '../pages/global-support/finance'
import { handler as GlobalSupportTelecomPage } from '../pages/global-support/telecom'
import { handler as GlobalSupportAcademicPage } from '../pages/global-support/academic'
import { handler as GlobalSupportEmploymentPage } from '../pages/global-support/employment'

const web = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 모든 웹 페이지에 renderer 적용
web.use('*', renderer)

// Root Routes
web.get('/', optionalAuth, HomePage)
web.get('/home', optionalAuth, HomePage)

// Auth Routes
web.get('/login', LoginPage)

// Public Pages
web.get('/contact', ContactPage)
web.get('/faq', FaqPage)
web.get('/guide', GuidePage)
web.get('/notice', NoticePage)
web.get('/support', SupportPage)
web.get('/blog', BlogPage)
web.get('/terms', TermsPage)
web.get('/privacy', PrivacyPage)
web.get('/cookies', CookiesPage)

// Matching
web.get('/matching', MatchingPage)

// Jobs
web.get('/jobs', JobsListPage)
web.get('/jobs/create', ...JobCreatePage) // Spread for multiple middleware if any
web.get('/jobs/:id', optionalAuth, JobDetailPage)
web.get('/jobs/:id/edit', ...JobEditPage)

// Jobseekers
web.get('/jobseekers', optionalAuth, JobseekersListPage)
web.get('/jobseekers/:id', optionalAuth, JobseekerDetailPage)

// Applications (Company only)
web.get('/applications/list', authMiddleware, requireCompany, ApplicationsListPage)
web.get('/applications/:id', authMiddleware, ApplicationDetailPage)

// Study
web.get('/study', StudyIndexPage)
web.get('/study/korean', StudyKoreanPage)
web.get('/study/undergraduate', StudyUndergraduatePage)
web.get('/study/graduate', StudyGraduatePage)
web.get('/university/:id', UniversityDetailPage)

// Agents
web.get('/agents', authMiddleware, requireAgent, AgentsDashboardPage)
web.get('/agents/create', ...AgentCreatePage)
web.get('/agents/jobseeker/create', ...JobseekerCreatePage)
web.get('/agents/assign', authMiddleware, requireAgent, AgentsAssignPage)
web.get('/agents/profile/edit', authMiddleware, requireAgent, AgentsProfileEditPage)

// Statistics
web.get('/statistics', authMiddleware, StatisticsPage)

// Profile
web.get('/profile', authMiddleware, ProfilePage)
web.get('/profile/company', authMiddleware, requireCompany, CompanyProfilePage)

// Dashboard
web.get('/dashboard', authMiddleware, DashboardIndexPage)
web.get('/dashboard/legacy', DashboardLegacyPage)
web.get('/dashboard/jobseeker', authMiddleware, DashboardJobseekerPage)
web.get('/dashboard/company', authMiddleware, requireCompany, DashboardCompanyPage)


// Admin
web.get('/admin', authMiddleware, requireAdmin, AdminFullPage)
web.get('/admin/inquiries', authMiddleware, requireAdmin, AdminInquiriesPage)

// Global Support
web.get('/global-support', GlobalSupportIndexPage)
web.get('/global-support/visa', GlobalSupportVisaPage)
web.get('/global-support/legal', GlobalSupportLegalPage)
web.get('/global-support/finance', GlobalSupportFinancePage)
web.get('/global-support/telecom', GlobalSupportTelecomPage)
web.get('/global-support/academic', GlobalSupportAcademicPage)
web.get('/global-support/employment', GlobalSupportEmploymentPage)

// Test Upload page removed (no longer needed)

export default web
