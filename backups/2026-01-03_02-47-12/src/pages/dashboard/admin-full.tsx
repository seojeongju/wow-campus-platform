/**
 * Page Component
 * Route: /admin
 * Original: src/index.tsx lines 17702-19210
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../../middleware/auth'

export const handler = async (c: Context) => {
  const user = c.get('user');

  return c.render(
    <div class="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar - 고정 사이드바 */}
      <aside id="admin-sidebar" class="hidden lg:flex lg:flex-col w-64 bg-gradient-to-b from-blue-900 to-blue-800 shadow-2xl fixed h-screen z-40 overflow-y-auto">
        {/* Logo Section */}
        <div class="p-6 border-b border-blue-700">
          <a href="/admin" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <i class="fas fa-shield-alt text-blue-600 text-xl"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-white font-bold text-lg">WOW-CAMPUS</span>
              <span class="text-blue-200 text-xs">관리자 대시보드</span>
            </div>
          </a>
        </div>

        {/* Navigation Menu */}
        <nav class="flex-1 px-4 py-6 space-y-2">
          {/* 대시보드 홈 */}
          <a href="/admin" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-home w-5 text-center"></i>
            <span class="font-medium">대시보드 홈</span>
          </a>

          {/* 통계 대시보드 */}
          <a href="/statistics" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-chart-line w-5 text-center"></i>
            <span class="font-medium">통계 대시보드</span>
          </a>

          {/* 구분선 */}
          <div class="border-t border-blue-700 my-4"></div>

          {/* 사용자 승인 관리 */}
          <button id="btn-showUserManagement" onclick="showUserManagement()" class="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group text-left">
            <i class="fas fa-user-check w-5 text-center"></i>
            <span class="font-medium flex-1">사용자 승인</span>
            <span id="pendingBadgeSidebar" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">0</span>
          </button>

          {/* 구인정보 관리 */}
          <a href="/jobs" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-briefcase w-5 text-center"></i>
            <span class="font-medium">구인정보 관리</span>
          </a>

          {/* 구직정보 관리 */}
          <a href="/jobseekers" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-user-tie w-5 text-center"></i>
            <span class="font-medium">구직정보 관리</span>
          </a>

          {/* 협약대학교 관리 */}
          <button onclick="showPartnerUniversityManagement()" class="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group text-left">
            <i class="fas fa-university w-5 text-center"></i>
            <span class="font-medium">협약대학교 관리</span>
          </button>

          {/* 에이전트 관리 */}
          <button onclick="showAgentManagement()" class="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group text-left">
            <i class="fas fa-handshake w-5 text-center"></i>
            <span class="font-medium">에이전트 관리</span>
          </button>

          {/* 1:1 문의 관리 */}
          <a href="/admin/inquiries" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-comments w-5 text-center"></i>
            <span class="font-medium">1:1 문의 관리</span>
          </a>

          {/* 구분선 */}
          <div class="border-t border-blue-700 my-4"></div>

          {/* 빠른 작업 */}
          <div class="px-4 py-2">
            <p class="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">빠른 작업</p>
          </div>

          {/* 구인 정보 입력 */}
          <a href="/jobs/create" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-plus w-5 text-center"></i>
            <span class="font-medium">구인 정보 입력</span>
          </a>

          {/* 구직 정보 입력 */}
          <a href="/agents/jobseeker/create" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-user-plus w-5 text-center"></i>
            <span class="font-medium">구직 정보 입력</span>
          </a>

          {/* 구직자 정보 입력 */}
          <a href="/home?register=jobseeker" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-user-edit w-5 text-center"></i>
            <span class="font-medium">구직자 정보 입력</span>
          </a>

          {/* 에이전트 정보 입력 */}
          <a href="/agents/create" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-user-tie w-5 text-center"></i>
            <span class="font-medium">에이전트 정보 입력</span>
          </a>

          {/* 기업 정보 입력 */}
          <a href="/home?register=company" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-building w-5 text-center"></i>
            <span class="font-medium">기업 정보 입력</span>
          </a>

          {/* 구분선 */}
          <div class="border-t border-blue-700 my-4"></div>

          {/* 고객 지원 */}
          <a href="/support" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
            <i class="fas fa-headset w-5 text-center"></i>
            <span class="font-medium">고객 지원</span>
          </a>
        </nav>

        {/* Bottom Section - User Info */}
        <div class="p-4 border-t border-blue-700">
          <div class="flex items-center space-x-3 px-4 py-3">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium text-sm truncate" id="adminUserName">관리자</p>
              <p class="text-blue-200 text-xs truncate">시스템 관리자</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div id="mobile-sidebar-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onclick="toggleMobileSidebar()"></div>

      {/* Mobile Sidebar */}
      <aside id="mobile-sidebar" class="hidden lg:hidden fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 shadow-2xl z-40 overflow-y-auto transform -translate-x-full transition-transform duration-300">
        {/* Mobile sidebar content - same as desktop */}
        <div class="p-6 border-b border-blue-700">
          <div class="flex items-center justify-between">
            <a href="/admin" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <i class="fas fa-shield-alt text-blue-600 text-xl"></i>
              </div>
              <div class="flex flex-col">
                <span class="text-white font-bold text-lg">WOW-CAMPUS</span>
                <span class="text-blue-200 text-xs">관리자 대시보드</span>
              </div>
            </a>
            <button onclick="toggleMobileSidebar()" class="text-white hover:text-blue-200">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2">
          <a href="/admin" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-home w-5 text-center"></i>
            <span class="font-medium">대시보드 홈</span>
          </a>
          <a href="/statistics" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-chart-line w-5 text-center"></i>
            <span class="font-medium">통계 대시보드</span>
          </a>
          <div class="border-t border-blue-700 my-4"></div>
          <button id="btn-showUserManagement-mobile" onclick="showUserManagement(); toggleMobileSidebar();" class="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 text-left">
            <i class="fas fa-user-check w-5 text-center"></i>
            <span class="font-medium flex-1">사용자 승인</span>
            <span id="pendingBadgeMobile" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">0</span>
          </button>
          <a href="/jobs" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-briefcase w-5 text-center"></i>
            <span class="font-medium">구인정보 관리</span>
          </a>
          <a href="/jobseekers" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-user-tie w-5 text-center"></i>
            <span class="font-medium">구직정보 관리</span>
          </a>
          <button onclick="showPartnerUniversityManagement(); toggleMobileSidebar();" class="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 text-left">
            <i class="fas fa-university w-5 text-center"></i>
            <span class="font-medium">협약대학교 관리</span>
          </button>
          <button onclick="showAgentManagement(); toggleMobileSidebar();" class="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 text-left">
            <i class="fas fa-handshake w-5 text-center"></i>
            <span class="font-medium">에이전트 관리</span>
          </button>
          <a href="/admin/inquiries" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-comments w-5 text-center"></i>
            <span class="font-medium">1:1 문의 관리</span>
          </a>
          <div class="border-t border-blue-700 my-4"></div>
          <div class="px-4 py-2">
            <p class="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">빠른 작업</p>
          </div>
          <a href="/jobs/create" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-plus w-5 text-center"></i>
            <span class="font-medium">구인 정보 입력</span>
          </a>
          <a href="/agents/jobseeker/create" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-user-plus w-5 text-center"></i>
            <span class="font-medium">구직 정보 입력</span>
          </a>
          <a href="/home?register=jobseeker" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-user-edit w-5 text-center"></i>
            <span class="font-medium">구직자 정보 입력</span>
          </a>
          <a href="/agents/create" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-user-tie w-5 text-center"></i>
            <span class="font-medium">에이전트 정보 입력</span>
          </a>
          <a href="/home?register=company" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-building w-5 text-center"></i>
            <span class="font-medium">기업 정보 입력</span>
          </a>
          <div class="border-t border-blue-700 my-4"></div>
          <a href="/support" onclick="toggleMobileSidebar()" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            <i class="fas fa-headset w-5 text-center"></i>
            <span class="font-medium">고객 지원</span>
          </a>
        </nav>
        <div class="p-4 border-t border-blue-700">
          <div class="flex items-center space-x-3 px-4 py-3">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium text-sm truncate" id="adminUserNameMobile">관리자</p>
              <p class="text-blue-200 text-xs truncate">시스템 관리자</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div class="flex-1 lg:ml-64 min-h-screen">
        {/* Simplified Header Navigation */}
        <header class="bg-white shadow-md sticky top-0 z-50 border-b-2 border-blue-100">
          <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <a href="/home" class="flex items-center space-x-3 group">
                <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
              </a>
            </div>

            {/* Simplified Navigation - Only Main Menu Items */}
            <div class="hidden lg:flex items-center space-x-4">
              <a href="/jobs" class="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">
                <i class="fas fa-briefcase mr-2"></i>구인정보
              </a>
              <a href="/jobseekers" class="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">
                <i class="fas fa-user-tie mr-2"></i>구직정보
              </a>
              <a href="/study" class="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">
                <i class="fas fa-graduation-cap mr-2"></i>유학정보
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
              {/* 인증 버튼이 여기에 로드됩니다 */}
            </div>

            {/* Mobile Sidebar Toggle Button */}
            <button onclick="toggleMobileSidebar()" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
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

        <main class="container mx-auto px-4 py-8">
          {/* Welcome Banner */}
          <div class="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold mb-2">관리자 대시보드</h1>
                <p class="text-blue-100">WOW-CAMPUS 플랫폼 시스템 관리</p>
              </div>
              <div class="hidden md:block">
                <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <i class="fas fa-shield-alt text-5xl text-white"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards - Now Clickable! */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button onclick="toggleStatsDetail('jobs')" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 cursor-pointer hover:-translate-y-1 text-left w-full">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 font-medium mb-1">전체 구인정보</p>
                  <p class="text-3xl font-bold text-gray-900" id="totalJobs">-</p>
                  <p class="text-xs text-blue-600 mt-2">
                    <i class="fas fa-arrow-up mr-1"></i>활성 공고
                  </p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <i class="fas fa-briefcase text-white text-2xl"></i>
                </div>
              </div>
              <div class="mt-3 text-xs text-blue-500 flex items-center justify-center">
                <i class="fas fa-chevron-down mr-1"></i>
                <span>클릭하여 상세보기</span>
              </div>
            </button>

            <button onclick="toggleStatsDetail('jobseekers')" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-green-500 cursor-pointer hover:-translate-y-1 text-left w-full">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 font-medium mb-1">전체 구직자</p>
                  <p class="text-3xl font-bold text-gray-900" id="totalJobseekers">-</p>
                  <p class="text-xs text-green-600 mt-2">
                    <i class="fas fa-user-check mr-1"></i>등록 회원
                  </p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <i class="fas fa-users text-white text-2xl"></i>
                </div>
              </div>
              <div class="mt-3 text-xs text-green-500 flex items-center justify-center">
                <i class="fas fa-chevron-down mr-1"></i>
                <span>클릭하여 상세보기</span>
              </div>
            </button>

            <button onclick="toggleStatsDetail('universities')" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-purple-500 cursor-pointer hover:-translate-y-1 text-left w-full">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 font-medium mb-1">협약 대학교</p>
                  <p class="text-3xl font-bold text-gray-900" id="totalUniversities">-</p>
                  <p class="text-xs text-purple-600 mt-2">
                    <i class="fas fa-handshake mr-1"></i>파트너십
                  </p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <i class="fas fa-university text-white text-2xl"></i>
                </div>
              </div>
              <div class="mt-3 text-xs text-purple-500 flex items-center justify-center">
                <i class="fas fa-chevron-down mr-1"></i>
                <span>클릭하여 상세보기</span>
              </div>
            </button>

            <button onclick="toggleStatsDetail('matches')" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-yellow-500 cursor-pointer hover:-translate-y-1 text-left w-full">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 font-medium mb-1">매칭 성사</p>
                  <p class="text-3xl font-bold text-gray-900" id="totalMatches">-</p>
                  <p class="text-xs text-yellow-600 mt-2">
                    <i class="fas fa-star mr-1"></i>성공 케이스
                  </p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <i class="fas fa-handshake text-white text-2xl"></i>
                </div>
              </div>
              <div class="mt-3 text-xs text-yellow-500 flex items-center justify-center">
                <i class="fas fa-chevron-down mr-1"></i>
                <span>클릭하여 상세보기</span>
              </div>
            </button>
          </div>

          {/* Stats Detail Sections */}
          <div id="statsDetailContainer" class="mb-8">
            {/* 구인정보 상세 */}
            <div id="jobsDetail" class="hidden bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-blue-500 mb-6 transition-all duration-300">
              <div class="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900">
                  <i class="fas fa-briefcase text-blue-600 mr-2"></i>
                  구인정보 상세
                </h3>
                <button onclick="toggleStatsDetail('jobs')" class="text-gray-500 hover:text-gray-700 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
              <div class="p-6">
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                  <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">활성 공고</p>
                    <p class="text-2xl font-bold text-blue-600" id="activeJobsCount">-</p>
                  </div>
                  <div class="bg-green-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">승인 대기</p>
                    <p class="text-2xl font-bold text-green-600" id="pendingJobsCount">-</p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">마감 공고</p>
                    <p class="text-2xl font-bold text-gray-600" id="closedJobsCount">-</p>
                  </div>
                </div>
                <div id="recentJobsList" class="space-y-3">
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>최근 공고를 불러오는 중...</p>
                  </div>
                </div>
                <div class="mt-6 text-center">
                  <a href="/jobs" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <span>전체 구인정보 보기</span>
                    <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* 구직자 상세 */}
            <div id="jobseekersDetail" class="hidden bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-green-500 mb-6 transition-all duration-300">
              <div class="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-green-100 flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900">
                  <i class="fas fa-users text-green-600 mr-2"></i>
                  구직자 상세
                </h3>
                <button onclick="toggleStatsDetail('jobseekers')" class="text-gray-500 hover:text-gray-700 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
              <div class="p-6">
                <div class="grid md:grid-cols-4 gap-4 mb-6">
                  <div class="bg-green-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">활성 회원</p>
                    <p class="text-2xl font-bold text-green-600" id="activeJobseekersCount">-</p>
                  </div>
                  <div class="bg-yellow-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">승인 대기</p>
                    <p class="text-2xl font-bold text-yellow-600" id="pendingJobseekersCount">-</p>
                  </div>
                  <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">중국</p>
                    <p class="text-2xl font-bold text-blue-600" id="chinaJobseekersCount">-</p>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">기타 국가</p>
                    <p class="text-2xl font-bold text-purple-600" id="otherJobseekersCount">-</p>
                  </div>
                </div>
                <div id="recentJobseekersList" class="space-y-3">
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>최근 구직자를 불러오는 중...</p>
                  </div>
                </div>
                <div class="mt-6 text-center">
                  <a href="/jobseekers" class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    <span>전체 구직자 보기</span>
                    <i class="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* 협약대학교 상세 */}
            <div id="universitiesDetail" class="hidden bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-purple-500 mb-6 transition-all duration-300">
              <div class="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-purple-100 flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900">
                  <i class="fas fa-university text-purple-600 mr-2"></i>
                  협약 대학교 상세
                </h3>
                <button onclick="toggleStatsDetail('universities')" class="text-gray-500 hover:text-gray-700 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
              <div class="p-6">
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                  <div class="bg-purple-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">서울 지역</p>
                    <p class="text-2xl font-bold text-purple-600" id="seoulUnivCount">-</p>
                  </div>
                  <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">수도권</p>
                    <p class="text-2xl font-bold text-blue-600" id="metropolitanUnivCount">-</p>
                  </div>
                  <div class="bg-indigo-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">지방</p>
                    <p class="text-2xl font-bold text-indigo-600" id="regionalUnivCount">-</p>
                  </div>
                </div>
                <div id="universitiesList" class="space-y-3">
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>협약 대학교를 불러오는 중...</p>
                  </div>
                </div>
                <div class="mt-6 text-center">
                  <button onclick="showPartnerUniversityManagement()" class="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    <span>대학교 관리하기</span>
                    <i class="fas fa-cog ml-2"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* 매칭 성사 상세 */}
            <div id="matchesDetail" class="hidden bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-yellow-500 mb-6 transition-all duration-300">
              <div class="bg-gradient-to-r from-yellow-50 to-white px-6 py-4 border-b border-yellow-100 flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900">
                  <i class="fas fa-handshake text-yellow-600 mr-2"></i>
                  매칭 성사 상세
                </h3>
                <button onclick="toggleStatsDetail('matches')" class="text-gray-500 hover:text-gray-700 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
              <div class="p-6">
                <div class="grid md:grid-cols-4 gap-4 mb-6">
                  <div class="bg-yellow-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">이번 달</p>
                    <p class="text-2xl font-bold text-yellow-600" id="thisMonthMatches">-</p>
                  </div>
                  <div class="bg-green-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">진행 중</p>
                    <p class="text-2xl font-bold text-green-600" id="inProgressMatches">-</p>
                  </div>
                  <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">완료</p>
                    <p class="text-2xl font-bold text-blue-600" id="completedMatches">-</p>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">성공률</p>
                    <p class="text-2xl font-bold text-purple-600" id="successRate">-%</p>
                  </div>
                </div>
                <div id="recentMatchesList" class="space-y-3">
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>최근 매칭을 불러오는 중...</p>
                  </div>
                </div>
                <div class="mt-6 text-center">
                  <a href="/statistics" class="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                    <span>상세 통계 보기</span>
                    <i class="fas fa-chart-line ml-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>


          {/* 사용자 승인 관리 섹션 */}
          <div id="userManagementSection" class="mb-8 scroll-mt-4 transition-all duration-300 hidden">
            <div class="bg-white rounded-lg shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900">
                  <i class="fas fa-users text-yellow-600 mr-2"></i>
                  사용자 관리
                </h2>
                <button onclick="hideUserManagement()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  닫기
                </button>
              </div>

              {/* 탭 메뉴 */}
              <div class="border-b border-gray-200">
                <div class="flex space-x-4 px-6">
                  <button id="pendingTab" onclick="switchUserTab('pending')" class="px-4 py-3 text-sm font-medium text-yellow-600 border-b-2 border-yellow-600">
                    <i class="fas fa-clock mr-2"></i>승인 대기 <span id="pendingTabCount" class="ml-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">0</span>
                  </button>
                  <button id="allUsersTab" onclick="switchUserTab('all')" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                    <i class="fas fa-users mr-2"></i>전체 사용자
                  </button>
                  <button id="jobseekersTab" onclick="switchUserTab('jobseekers')" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                    <i class="fas fa-user-tie mr-2"></i>구직자
                  </button>
                  <button id="employersTab" onclick="switchUserTab('employers')" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                    <i class="fas fa-building mr-2"></i>구인자
                  </button>
                  <button id="agentsTab" onclick="switchUserTab('agents')" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                    <i class="fas fa-handshake mr-2"></i>에이전트
                  </button>
                </div>
              </div>

              <div class="p-6">
                {/* 승인 대기 섹션 */}
                <div id="pendingUsersContent" class="space-y-4">
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                    <p>로딩 중...</p>
                  </div>
                </div>

                {/* 전체 사용자 섹션 */}
                <div id="allUsersContent" class="hidden">
                  {/* 검색 및 필터 */}
                  <div class="mb-6 space-y-4">
                    {/* 기본 필터 */}
                    <div class="grid md:grid-cols-4 gap-4">
                      <input type="text" id="searchUsers" placeholder="이름, 이메일 검색..."
                        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <select id="userStatusFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">전체 상태</option>
                        <option value="approved">승인됨</option>
                        <option value="pending">대기중</option>
                        <option value="rejected">거절됨</option>
                        <option value="suspended">정지됨</option>
                      </select>
                      <select id="userTypeFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">전체 유형</option>
                        <option value="jobseeker">구직자</option>
                        <option value="employer">구인자</option>
                        <option value="agent">에이전트</option>
                      </select>
                      <button onclick="loadAllUsers()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-search mr-2"></i>검색
                      </button>
                    </div>

                    {/* 고급 필터 - 구직자 */}
                    <div id="jobseekerAdvancedFilters" class="hidden bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-blue-900">
                          <i class="fas fa-filter mr-2"></i>구직자 고급 필터
                        </h4>
                        <button onclick="resetAdvancedFilters()" class="text-sm text-blue-600 hover:text-blue-800">
                          <i class="fas fa-redo mr-1"></i>초기화
                        </button>
                      </div>
                      <div class="grid md:grid-cols-3 gap-3">
                        <select id="nationalityFilter" class="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">국적 (전체)</option>
                          <option value="Korea">한국</option>
                          <option value="China">중국</option>
                          <option value="Vietnam">베트남</option>
                          <option value="Philippines">필리핀</option>
                          <option value="Thailand">태국</option>
                          <option value="Indonesia">인도네시아</option>
                          <option value="India">인도</option>
                          <option value="USA">네팔</option>
                          <option value="Other">기타</option>
                        </select>
                        <select id="visaStatusFilter" class="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">비자 상태 (전체)</option>
                          <option value="F-4">F-4 (재외동포)</option>
                          <option value="F-5">F-5 (영주)</option>
                          <option value="E-7">E-7 (특정활동)</option>
                          <option value="E-9">E-9 (비전문취업)</option>
                          <option value="H-2">H-2 (방문취업)</option>
                          <option value="D-10">D-10 (구직)</option>
                          <option value="Other">기타</option>
                        </select>
                        <select id="koreanLevelFilter" class="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">한국어 수준 (전체)</option>
                          <option value="beginner">TOPIK1급</option>
                          <option value="elementary">TOPIK2급</option>
                          <option value="intermediate">TOPIK3급</option>
                          <option value="advanced">TOPIK4급</option>
                          <option value="native">TOPIK5급</option>
                          <option value="native">TOPIK6급</option>
                          <option value="native">미응시</option>
                        </select>
                        <select id="educationLevelFilter" class="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">학력 (전체)</option>
                          <option value="high_school">고등학교</option>
                          <option value="associate">전문학사</option>
                          <option value="bachelor">학사</option>
                          <option value="master">석사</option>
                          <option value="doctorate">박사</option>
                        </select>
                        <select id="experienceYearsFilter" class="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">경력 (전체)</option>
                          <option value="0">신입</option>
                          <option value="1">1년</option>
                          <option value="2">2년</option>
                          <option value="3">3년</option>
                          <option value="5">5년 이상</option>
                          <option value="10">10년 이상</option>
                        </select>
                        <input type="text" id="preferredLocationFilter" placeholder="희망 지역"
                          class="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                      </div>
                    </div>

                    {/* 고급 필터 - 구인자/기업 */}
                    <div id="employerAdvancedFilters" class="hidden bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-purple-900">
                          <i class="fas fa-filter mr-2"></i>기업 고급 필터
                        </h4>
                        <button onclick="resetAdvancedFilters()" class="text-sm text-purple-600 hover:text-purple-800">
                          <i class="fas fa-redo mr-1"></i>초기화
                        </button>
                      </div>
                      <div class="grid md:grid-cols-3 gap-3">
                        <select id="companySizeFilter" class="px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                          <option value="">기업 규모 (전체)</option>
                          <option value="startup">스타트업 (1-10명)</option>
                          <option value="small">소기업 (11-50명)</option>
                          <option value="medium">중기업 (51-300명)</option>
                          <option value="large">대기업 (300명 이상)</option>
                        </select>
                        <input type="text" id="industryFilter" placeholder="산업 분야 (예: IT, 제조)"
                          class="px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
                        <input type="text" id="addressFilter" placeholder="회사 위치"
                          class="px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
                      </div>
                    </div>

                    {/* 고급 필터 - 에이전트 */}
                    <div id="agentAdvancedFilters" class="hidden bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-indigo-900">
                          <i class="fas fa-filter mr-2"></i>에이전트 고급 필터
                        </h4>
                        <button onclick="resetAdvancedFilters()" class="text-sm text-indigo-600 hover:text-indigo-800">
                          <i class="fas fa-redo mr-1"></i>초기화
                        </button>
                      </div>
                      <div class="grid md:grid-cols-3 gap-3">
                        <input type="text" id="specializationFilter" placeholder="전문 분야 (예: IT, 제조)"
                          class="px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                        <input type="text" id="languagesFilter" placeholder="지원 언어 (예: Korean, English)"
                          class="px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                        <input type="text" id="countriesCoveredFilter" placeholder="대상 국가"
                          class="px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* 사용자 목록 테이블 */}
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                        </tr>
                      </thead>
                      <tbody id="allUsersTableBody" class="bg-white divide-y divide-gray-200">
                        {/* 동적으로 로드됩니다 */}
                      </tbody>
                    </table>
                  </div>

                  {/* 페이지네이션 */}
                  <div id="usersPagination" class="mt-6 flex items-center justify-between">
                    <div class="text-sm text-gray-700">
                      총 <span id="totalUsersCount">0</span>명의 사용자
                    </div>
                    <div id="paginationButtons" class="flex space-x-2">
                      {/* 동적으로 생성됩니다 */}
                    </div>
                  </div>
                </div>

                {/* 구직자 섹션 */}
                <div id="jobseekersContent" class="hidden">
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                    <p>로딩 중...</p>
                  </div>
                </div>

                {/* 구인자 섹션 */}
                <div id="employersContent" class="hidden">
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                    <p>로딩 중...</p>
                  </div>
                </div>

                {/* 에이전트 섹션 */}
                <div id="agentsContent" class="hidden">
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                    <p>로딩 중...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 사용자 수정 모달 */}
          <div id="editUserModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h3 class="text-xl font-bold text-gray-900">
                  <i class="fas fa-user-edit text-blue-600 mr-2"></i>사용자 정보 수정
                </h3>
                <button onclick="closeEditUserModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <div class="p-6">
                <form id="editUserForm" class="space-y-6">
                  <input type="hidden" id="editUserId" />

                  {/* 기본 정보 */}
                  <div class="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h4 class="font-semibold text-gray-900 mb-3">기본 정보</h4>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" id="editUserEmail" disabled
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                      <p class="mt-1 text-xs text-gray-500">이메일은 수정할 수 없습니다</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                      <input type="text" id="editUserName" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                      <input type="tel" id="editUserPhone"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="010-1234-5678" />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
                      <input type="text" id="editUserType" disabled
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                      <p class="mt-1 text-xs text-gray-500">사용자 유형은 수정할 수 없습니다</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">계정 상태 *</label>
                      <select id="editUserStatus" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="approved">승인됨</option>
                        <option value="pending">대기중</option>
                        <option value="rejected">거절됨</option>
                        <option value="suspended">정지됨</option>
                      </select>
                    </div>
                  </div>

                  {/* 비밀번호 관리 */}
                  <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-3">
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
                      <i class="fas fa-key text-yellow-600 mr-2"></i>비밀번호 관리
                    </h4>
                    <p class="text-sm text-gray-600 mb-3">
                      사용자가 비밀번호를 잊은 경우 임시 비밀번호를 생성할 수 있습니다.
                    </p>
                    <button type="button" onclick="generateTempPassword()"
                      class="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                      <i class="fas fa-sync-alt mr-2"></i>임시 비밀번호 생성
                    </button>
                    <div id="tempPasswordDisplay" class="hidden mt-3 p-4 bg-white border-2 border-yellow-400 rounded-lg">
                      <p class="text-sm font-medium text-gray-700 mb-2">생성된 임시 비밀번호:</p>
                      <div class="flex items-center space-x-2">
                        <input type="text" id="tempPasswordValue" readonly
                          class="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg font-bold text-center" />
                        <button type="button" onclick="copyTempPassword()"
                          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                      <p class="text-xs text-red-600 mt-2">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        이 비밀번호를 반드시 사용자에게 안전하게 전달하세요. 다시 확인할 수 없습니다.
                      </p>
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div class="flex space-x-3 pt-4 border-t border-gray-200">
                    <button type="submit" class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      <i class="fas fa-save mr-2"></i>저장
                    </button>
                    <button type="button" onclick="closeEditUserModal()"
                      class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                      취소
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* 사용자 삭제 확인 모달 */}
          <div id="deleteUserModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-xl font-bold text-gray-900 flex items-center">
                  <i class="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                  사용자 삭제 확인
                </h3>
              </div>

              <div class="p-6">
                <div class="mb-6">
                  <p class="text-gray-700 mb-4">
                    정말로 <strong id="deleteUserName" class="text-red-600"></strong>님의 계정을 삭제하시겠습니까?
                  </p>
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="flex">
                      <i class="fas fa-exclamation-circle text-red-600 mt-1 mr-3"></i>
                      <div class="text-sm text-red-800">
                        <p class="font-semibold mb-2">주의사항:</p>
                        <ul class="list-disc ml-4 space-y-1">
                          <li>삭제된 계정은 복구할 수 없습니다</li>
                          <li>사용자의 모든 데이터가 제거됩니다</li>
                          <li>관련된 지원서, 공고 정보도 영향을 받습니다</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex space-x-3">
                  <button id="confirmDeleteBtn" onclick="if(window.executeDeleteUser) window.executeDeleteUser(); else toast.error('잠시 후 다시 시도해주세요.');"
                    class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    <i class="fas fa-trash-alt mr-2"></i>삭제
                  </button>
                  <button onclick="closeDeleteUserModal()"
                    class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 사용자 상태 토글 확인 모달 */}
          <div id="toggleStatusModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-xl font-bold text-gray-900 flex items-center">
                  <i id="toggleStatusIcon" class="fas fa-exclamation-circle text-orange-600 mr-2"></i>
                  <span id="toggleStatusTitle">사용자 상태 변경 확인</span>
                </h3>
              </div>

              <div class="p-6">
                <div class="mb-6">
                  <p class="text-gray-700 mb-4">
                    <strong id="toggleUserName" class="text-blue-600"></strong>님의 계정을
                    <strong id="toggleActionText" class="text-orange-600"></strong>하시겠습니까?
                  </p>
                  <div id="toggleStatusWarning" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex">
                      <i class="fas fa-info-circle text-yellow-600 mt-1 mr-3"></i>
                      <div class="text-sm text-yellow-800">
                        <p class="font-semibold mb-2">변경 사항:</p>
                        <ul class="list-disc ml-4 space-y-1" id="toggleStatusEffects">
                          {/* 동적으로 채워짐 */}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex space-x-3">
                  <button id="confirmToggleBtn" onclick="if(window.executeToggleUserStatus) window.executeToggleUserStatus(); else toast.error('잠시 후 다시 시도해주세요.');"
                    class="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                    <i id="confirmToggleIcon" class="fas fa-pause-circle mr-2"></i>
                    <span id="confirmToggleText">일시정지</span>
                  </button>
                  <button onclick="closeToggleStatusModal()"
                    class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 협약대학교 관리 섹션 */}
          <div id="partnerUniversityManagement" class="mb-8 scroll-mt-4 transition-all duration-300 hidden">
            <div class="bg-white rounded-lg shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900">협약대학교 관리</h2>
                <div class="flex space-x-3">
                  <button onclick="showAddUniversityForm()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-plus mr-2"></i>새 대학교 추가
                  </button>
                  <button onclick="hidePartnerUniversityManagement()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    닫기
                  </button>
                </div>
              </div>

              <div class="p-6">
                {/* 검색 및 필터 */}
                <div class="mb-6">
                  <div class="grid md:grid-cols-4 gap-4">
                    <input type="text" id="searchUniversity" placeholder="대학교명 검색..."
                      class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select id="adminRegionFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">전체 지역</option>
                      <option value="서울특별시">서울특별시</option>
                      <option value="부산광역시">부산광역시</option>
                      <option value="대구광역시">대구광역시</option>
                      <option value="인천광역시">인천광역시</option>
                      <option value="광주광역시">광주광역시</option>
                      <option value="대전광역시">대전광역시</option>
                      <option value="울산광역시">울산광역시</option>
                      <option value="세종특별자치시">세종특별자치시</option>
                      <option value="경기도">경기도</option>
                      <option value="강원특별자치도">강원특별자치도</option>
                      <option value="충청북도">충청북도</option>
                      <option value="충청남도">충청남도</option>
                      <option value="전북특별자치도">전북특별자치도</option>
                      <option value="전라남도">전라남도</option>
                      <option value="경상북도">경상북도</option>
                      <option value="경상남도">경상남도</option>
                      <option value="제주특별자치도">제주특별자치도</option>
                    </select>
                    <button onclick="loadUniversitiesForAdmin()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-search mr-2"></i>검색
                    </button>
                    <button onclick="exportUniversitiesData()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <i class="fas fa-download mr-2"></i>내보내기
                    </button>
                  </div>
                </div>

                {/* 대학교 목록 테이블 */}
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교명</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">모집과정</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주요정보</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">서비스</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                      </tr>
                    </thead>
                    <tbody id="universitiesTableBody" class="bg-white divide-y divide-gray-200">
                      {/* 동적으로 로드됩니다 */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 에이전트 관리 섹션 */}
          <div id="agentManagement" class="mb-8 scroll-mt-4 transition-all duration-300 hidden">
            <div class="bg-white rounded-lg shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900">에이전트 관리</h2>
                <div class="flex space-x-3">
                  <button onclick="showAddAgentForm()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <i class="fas fa-plus mr-2"></i>새 에이전트 추가
                  </button>
                  <button onclick="hideAgentManagement()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    닫기
                  </button>
                </div>
              </div>

              <div class="p-6">
                {/* 검색 및 필터 */}
                <div class="mb-6">
                  <div class="grid md:grid-cols-4 gap-4">
                    <input type="text" id="searchAgent" placeholder="에이전시명 또는 담당자명 검색..."
                      class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <select id="agentSpecializationFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="all">전체 전문분야</option>
                      <option value="유학">유학</option>
                      <option value="취업">취업</option>
                      <option value="비자">비자</option>
                      <option value="정착지원">정착지원</option>
                    </select>
                    <select id="agentStatusFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="all">전체 상태</option>
                      <option value="approved">승인</option>
                      <option value="pending">대기</option>
                      <option value="suspended">정지</option>
                    </select>
                    <button onclick="loadAgentsForAdmin()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      <i class="fas fa-search mr-2"></i>검색
                    </button>
                  </div>
                </div>

                {/* 에이전트 목록 테이블 */}
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">에이전시명</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전문분야</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실적정보</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가지표</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                      </tr>
                    </thead>
                    <tbody id="agentsTableBody" class="bg-white divide-y divide-gray-200">
                      {/* 동적으로 로드됩니다 */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>

        <script dangerouslySetInnerHTML={{
          __html: `
        // 즉시 실행되는 테스트
                <p class="text-sm mt-2">\${error.message}</p>
              </div>
            \`;
          }
        }
        
        // 승인 대기 사용자 목록 표시
        function displayPendingUsers(users) {
          const container = document.getElementById('pendingUsersContent');
          if (!container) return;
          
          if (users.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-12 bg-gray-50 rounded-lg">
                <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
                <p class="text-lg font-semibold text-gray-900">승인 대기 중인 사용자가 없습니다</p>
                <p class="text-sm text-gray-600 mt-2">모든 사용자가 승인되었습니다.</p>
              </div>
            \`;
            return;
          }
          
          const tableRows = users.map(user => {
            const userTypeLabel = {
              'jobseeker': '구직자',
              'company': '기업',
              'agent': '에이전트'
            }[user.user_type] || user.user_type;
            
            const userTypeColor = {
              'jobseeker': 'green',
              'company': 'blue',
              'agent': 'purple'
            }[user.user_type] || 'gray';
            
            return \`
              <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">\${user.name || '이름 없음'}</div>
                  <div class="text-sm text-gray-500">\${user.email}</div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs font-medium bg-\${userTypeColor}-100 text-\${userTypeColor}-700">
                    \${userTypeLabel}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  \${new Date(user.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  \${user.phone || '-'}
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    대기중
                  </span>
                </td>
              </tr>
            \`;
          }).join('');
          
          container.innerHTML = \`
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">사용자</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">유형</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">가입일</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">연락처</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">상태</th>
                  </tr>
                </thead>
                <tbody>
                  \${tableRows}
                </tbody>
              </table>
            </div>
            <p class="text-xs text-gray-500 mt-3">* 승인/거절은 '전체 사용자' 탭에서 진행해주세요.</p>
          \`;
        }
        
        // 사용자 승인
        async function approveUser(userId) {
          console.log('[사용자 관리] approveUser 호출됨:', userId);
          if (!confirm('이 사용자를 승인하시겠습니까?')) {
            return;
          }
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
              return;
            }
            
            const response = await fetch(\`/api/admin/users/\${userId}/approve\`, {
              method: 'POST',
              headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
              }
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert(result.message || '사용자가 승인되었습니다.');
              loadPendingUsers();
              loadAdminStatistics(); // 통계도 업데이트
            } else {
              alert(result.message || '사용자 승인에 실패했습니다.');
            }
          } catch (error) {
            console.error('[사용자 관리] approveUser 오류:', error);
            alert('사용자 승인 중 오류가 발생했습니다.');
          }
        }
        
        // 사용자 거부
        async function rejectUser(userId) {
          console.log('[사용자 관리] rejectUser 호출됨:', userId);
          const reason = prompt('거부 사유를 입력해주세요:');
          if (reason === null || !reason.trim()) {
            return;
          }
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
              return;
            }
            
            const response = await fetch(\`/api/admin/users/\${userId}/reject\`, {
              method: 'POST',
              headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reason: reason.trim() })
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert(result.message || '사용자가 거부되었습니다.');
              loadPendingUsers();
              loadAdminStatistics(); // 통계도 업데이트
            } else {
              alert(result.message || '사용자 거부에 실패했습니다.');
            }
          } catch (error) {
            console.error('[사용자 관리] rejectUser 오류:', error);
            alert('사용자 거부 중 오류가 발생했습니다.');
          }
        }
        
        // 탭 전환
        function switchUserTab(tab) {
          console.log('[사용자 관리] switchUserTab 호출됨:', tab);
          
          // 모든 탭 버튼 스타일 초기화
          document.querySelectorAll('[id$="Tab"]').forEach(btn => {
            btn.classList.remove('text-yellow-600', 'border-yellow-600');
            btn.classList.add('text-gray-500', 'border-transparent');
          });
          
          // 선택된 탭 활성화
          const activeTab = document.getElementById(tab + 'Tab');
          if (activeTab) {
            activeTab.classList.remove('text-gray-500', 'border-transparent');
            activeTab.classList.add('text-yellow-600', 'border-yellow-600');
          }
          
          // 모든 콘텐츠 숨기기
          ['pendingUsersContent', 'allUsersContent', 'jobseekersContent', 'employersContent', 'agentsContent'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
          });
          
          // 선택된 탭 콘텐츠 표시 및 데이터 로드
          if (tab === 'pending') {
            const el = document.getElementById('pendingUsersContent');
            if (el) {
              el.classList.remove('hidden');
              loadPendingUsers();
            }
          } else if (tab === 'all') {
            const el = document.getElementById('allUsersContent');
            if (el) {
              el.classList.remove('hidden');
              if (typeof loadAllUsers === 'function') loadAllUsers();
            }
          } else if (tab === 'jobseekers') {
            const el = document.getElementById('jobseekersContent');
            if (el) {
              el.classList.remove('hidden');
              if (typeof loadUsersByType === 'function') loadUsersByType('jobseeker');
            }
          } else if (tab === 'employers') {
            const el = document.getElementById('employersContent');
            if (el) {
              el.classList.remove('hidden');
              if (typeof loadUsersByType === 'function') loadUsersByType('company');
            }
          } else if (tab === 'agents') {
            const el = document.getElementById('agentsContent');
            if (el) {
              el.classList.remove('hidden');
              if (typeof loadUsersByType === 'function') loadUsersByType('agent');
            }
          }
        }
        
        // 전체 사용자 목록 로드
        async function loadAllUsers() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              console.error('인증 토큰이 없습니다.');
              return;
            }
            
            const searchTerm = document.getElementById('searchUsers')?.value || '';
            const statusFilter = document.getElementById('userStatusFilter')?.value || '';
            const typeFilter = document.getElementById('userTypeFilter')?.value || '';
            
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('user_type', typeFilter);
            params.append('page', '1');
            params.append('limit', '50');
            
            const response = await fetch(\`/api/admin/users?\${params}\`, {
              headers: {
                'Authorization': \`Bearer \${token}\`
              }
            });
            
            if (!response.ok) {
              throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            
            const result = await response.json();
            
            if (result.success) {
              displayAllUsers(result.data.users || [], result.data.total || 0);
            } else {
              throw new Error(result.message || '데이터를 불러오는데 실패했습니다.');
            }
          } catch (error) {
            console.error('Failed to load all users:', error);
            const container = document.getElementById('allUsersTableBody');
            if (container) {
              container.innerHTML = \`
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>사용자 목록을 불러오는데 실패했습니다.</p>
                  </td>
                </tr>
              \`;
            }
          }
        }
        
        // 전체 사용자 목록 표시
        function displayAllUsers(users, total) {
          const container = document.getElementById('allUsersTableBody');
          const totalCountEl = document.getElementById('totalUsersCount');
          
          if (totalCountEl) totalCountEl.textContent = total;
          
          if (!container) return;
          
          if (users.length === 0) {
            container.innerHTML = \`
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  <i class="fas fa-users text-4xl mb-4"></i>
                  <p class="text-lg font-semibold">사용자가 없습니다</p>
                </td>
              </tr>
            \`;
            return;
          }
          
          container.innerHTML = users.map(user => {
            const userTypeLabel = {
              'jobseeker': '구직자',
              'company': '기업',
              'agent': '에이전트',
              'admin': '관리자'
            }[user.user_type] || user.user_type;
            
            const statusLabel = {
              'approved': '승인됨',
              'pending': '대기중',
              'rejected': '거절됨',
              'suspended': '정지됨'
            }[user.status] || user.status;
            
            const statusColor = {
              'approved': 'green',
              'pending': 'yellow',
              'rejected': 'red',
              'suspended': 'gray'
            }[user.status] || 'gray';
            
            return \`
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-user text-gray-600"></i>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">\${user.name || '이름 없음'}</div>
                      <div class="text-sm text-gray-500">\${user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    \${userTypeLabel}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-\${statusColor}-100 text-\${statusColor}-800">
                    \${statusLabel}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  \${new Date(user.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button onclick="editUser(\${user.id})" class="text-blue-600 hover:text-blue-900">
                      <i class="fas fa-edit"></i>
                    </button>
                    \${user.status === 'pending' ? \`
                    <button onclick="approveUser(\${user.id})" class="text-green-600 hover:text-green-900">
                      <i class="fas fa-check"></i>
                    </button>
                    <button onclick="rejectUser(\${user.id})" class="text-red-600 hover:text-red-900">
                      <i class="fas fa-times"></i>
                    </button>
                    \` : ''}
                    \${user.status === 'approved' ? \`
                    <button onclick="toggleUserStatus(\${user.id})" class="text-yellow-600 hover:text-yellow-900" title="일시정지">
                      <i class="fas fa-pause"></i>
                    </button>
                    \` : ''}
                    \${user.status === 'pending' && user.status !== 'approved' ? \`
                    <button onclick="toggleUserStatus(\${user.id})" class="text-green-600 hover:text-green-900" title="승인">
                      <i class="fas fa-play"></i>
                    </button>
                    \` : ''}
                  </div>
                </td>
              </tr>
            \`;
          }).join('');
        }
        
        // 사용자 유형별 로드
        async function loadUsersByType(userType) {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              console.error('인증 토큰이 없습니다.');
              return;
            }
            
            const params = new URLSearchParams();
            params.append('user_type', userType);
            params.append('page', '1');
            params.append('limit', '50');
            
            const response = await fetch(\`/api/admin/users?\${params}\`, {
              headers: {
                'Authorization': \`Bearer \${token}\`
              }
            });
            
            if (!response.ok) {
              throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            
            const result = await response.json();
            
            if (result.success) {
              const containerId = userType === 'jobseeker' ? 'jobseekersContent' :
                                 userType === 'company' ? 'employersContent' :
                                 'agentsContent';
              displayUsersByType(result.data.users || [], containerId, userType);
            } else {
              throw new Error(result.message || '데이터를 불러오는데 실패했습니다.');
            }
          } catch (error) {
            console.error('Failed to load users by type:', error);
          }
        }
        
        // 사용자 유형별 표시
        function displayUsersByType(users, containerId, userType) {
          const container = document.getElementById(containerId);
          if (!container) return;
          
          if (users.length === 0) {
            container.innerHTML = \`
              <div class="text-center py-12 bg-gray-50 rounded-lg">
                <i class="fas fa-users text-4xl text-gray-400 mb-4"></i>
                <p class="text-lg font-semibold text-gray-900">등록된 사용자가 없습니다</p>
              </div>
            \`;
            return;
          }
          
          container.innerHTML = \`
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  \${users.map(user => {
                    const statusLabel = {
                      'approved': '승인됨',
                      'pending': '대기중',
                      'rejected': '거절됨',
                      'suspended': '정지됨'
                    }[user.status] || user.status;
                    
                    const statusColor = {
                      'approved': 'green',
                      'pending': 'yellow',
                      'rejected': 'red',
                      'suspended': 'gray'
                    }[user.status] || 'gray';
                    
                    return \`
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                          <div class="flex items-center">
                            <div class="text-sm font-medium text-gray-900">\${user.name || '이름 없음'}</div>
                            <div class="ml-2 text-sm text-gray-500">\${user.email}</div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-\${statusColor}-100 text-\${statusColor}-800">
                            \${statusLabel}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500">
                          \${new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </td>
                        <td class="px-6 py-4 text-sm font-medium">
                          <div class="flex space-x-2">
                            \${user.status === 'pending' ? \`
                            <button onclick="approveUser(\${user.id})" class="text-green-600 hover:text-green-900">
                              <i class="fas fa-check"></i>
                            </button>
                            <button onclick="rejectUser(\${user.id})" class="text-red-600 hover:text-red-900">
                              <i class="fas fa-times"></i>
                            </button>
                            \` : ''}
                          </div>
                        </td>
                      </tr>
                    \`;
                  }).join('')}
                </tbody>
        }
        
        // 사용자 정보 저장
        async function saveUserEdit(event) {
          event.preventDefault();
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              alert('인증 토큰이 없습니다.');
              return;
            }
            
            const userId = document.getElementById('editUserId').value;
            const formData = {
              name: document.getElementById('editUserName').value,
              phone: document.getElementById('editUserPhone').value,
              status: document.getElementById('editUserStatus').value
            };
            
            const response = await fetch(\`/api/admin/users/\${userId}\`, {
              method: 'PUT',
              headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('사용자 정보가 수정되었습니다.');
              closeEditUserModal();
              // 목록 새로고침
              if (currentUserTab === 'pending') {
                loadPendingUsers();
              } else if (currentUserTab === 'all') {
                loadAllUsers();
              }
            } else {
              alert(result.message || '사용자 정보 수정에 실패했습니다.');
            }
          } catch (error) {
            console.error('Failed to save user:', error);
            alert('사용자 정보 수정 중 오류가 발생했습니다.');
          }
        }
        
        // 임시 비밀번호 생성
        function generateTempPassword() {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let password = '';
          for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          
          document.getElementById('tempPasswordValue').value = password;
          document.getElementById('tempPasswordDisplay').classList.remove('hidden');
        }
        
        function copyTempPassword() {
          const passwordInput = document.getElementById('tempPasswordValue');
          passwordInput.select();
          document.execCommand('copy');
          alert('임시 비밀번호가 클립보드에 복사되었습니다.');
        }
        

        
        // 협약대학교 관리 섹션으로 스크롤
        function showPartnerUniversityManagement() {
          const section = document.getElementById('partnerUniversityManagement');
          
          if (section) {
            // 섹션 표시
            section.classList.remove('hidden');
            
            // 부드러운 스크롤
            section.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
            
            // 섹션 하이라이트 효과
            highlightSection(section);
          }
        }
        
        // 에이전트 관리 섹션으로 스크롤
        function showAgentManagement() {
          const section = document.getElementById('agentManagement');
          
          if (section) {
            // 섹션 표시
            section.classList.remove('hidden');
            
            // 에이전트 데이터 로드
            if (typeof loadAgentsForAdmin === 'function') {
              loadAgentsForAdmin();
            }
            
            // 부드러운 스크롤
            section.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
            
            // 섹션 하이라이트 효과
            highlightSection(section);
          }
        }
        
        function hideAgentManagement() {
          const section = document.getElementById('agentManagement');
          if (section) {
            // 섹션 숨기기
            section.classList.add('hidden');
          }
          
          // 대시보드 상단으로 스크롤
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function hidePartnerUniversityManagement() {
          const section = document.getElementById('partnerUniversityManagement');
          if (section) {
            // 섹션 숨기기
            section.classList.add('hidden');
          }
          
          // 대시보드 상단으로 스크롤
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // 사용자 관리 섹션 표시
        function showUserManagement() {
          const section = document.getElementById('userManagementSection');
          if (section) {
            // 섹션 표시
            section.classList.remove('hidden');
            
            // 모바일 사이드바 닫기
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
              if (typeof window.toggleMobileSidebar === 'function') {
                window.toggleMobileSidebar();
              }
            }
            
            // 부드러운 스크롤
            setTimeout(() => {
              section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              
              // 섹션 하이라이트 효과
              if (typeof highlightSection === 'function') {
                highlightSection(section);
              }
            }, 100);
            
            // 기본적으로 승인 대기 탭 활성화 및 데이터 로드
            setTimeout(() => {
              if (typeof switchUserTab === 'function') {
                switchUserTab('pending');
              } else if (typeof loadPendingUsers === 'function') {
                // 탭 UI 업데이트
                document.querySelectorAll('[id$="Tab"]').forEach(btn => {
                  btn.classList.remove('text-yellow-600', 'border-yellow-600');
                  btn.classList.add('text-gray-500', 'border-transparent');
                });
                const pendingTab = document.getElementById('pendingTab');
                if (pendingTab) {
                  pendingTab.classList.remove('text-gray-500', 'border-transparent');
                  pendingTab.classList.add('text-yellow-600', 'border-yellow-600');
                }
                // 콘텐츠 표시
                document.getElementById('pendingUsersContent')?.classList.remove('hidden');
                loadPendingUsers();
              }
            }, 200);
          }
        }
        
        // 사용자 관리 섹션 숨기기
        function hideUserManagement() {
          const section = document.getElementById('userManagementSection');
          if (section) {
            // 섹션 숨기기
            section.classList.add('hidden');
          }
          
          // 대시보드 상단으로 스크롤
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // 섹션 하이라이트 효과
        function highlightSection(section) {
          if (!section) return;
          
          // 기존 하이라이트 제거
          document.querySelectorAll('.section-highlighted').forEach(el => {
            el.classList.remove('section-highlighted');
          });
          
          // 새 하이라이트 추가
          section.classList.add('section-highlighted');
          
          // 3초 후 하이라이트 제거
          setTimeout(() => {
            section.classList.remove('section-highlighted');
          }, 3000);
        }
        
        // 통계 카드 클릭 시 스크롤 (통계 섹션은 항상 상단에 있으므로 맨 위로)
        function scrollToStatistics() {
          window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          });
        }
        
        // 통계 상세 토글 함수
        let currentOpenDetail = null;
        
        function toggleStatsDetail(type) {
          const detailSections = {
            'jobs': document.getElementById('jobsDetail'),
            'jobseekers': document.getElementById('jobseekersDetail'),
            'universities': document.getElementById('universitiesDetail'),
            'matches': document.getElementById('matchesDetail')
          };
          
          const targetSection = detailSections[type];
          
          // 같은 섹션 클릭 시 닫기
          if (currentOpenDetail === type) {
            targetSection.classList.add('hidden');
            currentOpenDetail = null;
            return;
          }
          
          // 모든 섹션 숨기기
          Object.values(detailSections).forEach(section => {
            if (section) section.classList.add('hidden');
          });
          
          // 선택한 섹션 표시
          if (targetSection) {
            targetSection.classList.remove('hidden');
            currentOpenDetail = type;
            
            // 부드러운 스크롤
            setTimeout(() => {
              targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
            
            // 데이터 로드
            loadStatsDetailData(type);
          }
        }
        
        // 통계 상세 데이터 로드
        async function loadStatsDetailData(type) {
          const token = localStorage.getItem('wowcampus_token');
          
          try {
            switch(type) {
              case 'jobs':
                await loadJobsDetail(token);
                break;
              case 'jobseekers':
                await loadJobseekersDetail(token);
                break;
              case 'universities':
                await loadUniversitiesDetail(token);
                break;
              case 'matches':
                await loadMatchesDetail(token);
                break;
            }
          } catch (error) {
            console.error('Failed to load detail data:', error);
          }
        }
        
        // 구인정보 상세 로드
        async function loadJobsDetail(token) {
          try {
            const response = await fetch('/api/admin/jobs/stats', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // 통계 업데이트
              document.getElementById('activeJobsCount').textContent = data.active || 0;
              document.getElementById('pendingJobsCount').textContent = data.pending || 0;
              document.getElementById('closedJobsCount').textContent = data.closed || 0;
              
              // 최근 공고 목록
              const listContainer = document.getElementById('recentJobsList');
              if (data.recentJobs && data.recentJobs.length > 0) {
                listContainer.innerHTML = data.recentJobs.slice(0, 5).map(job => \`
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">\${job.title}</h4>
                      <p class="text-sm text-gray-600 mt-1">\${job.company} • \${job.location}</p>
                      <p class="text-xs text-gray-500 mt-1">\${new Date(job.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium \${
                      job.status === 'active' ? 'bg-green-100 text-green-700' :
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }">\${job.status === 'active' ? '활성' : job.status === 'pending' ? '대기' : '마감'}</span>
                  </div>
                \`).join('');
              } else {
                listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 구인정보가 없습니다.</p>';
              }
            }
          } catch (error) {
            console.error('Failed to load jobs detail:', error);
            document.getElementById('recentJobsList').innerHTML = 
              '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
          }
        }
        
        // 구직자 상세 로드
        async function loadJobseekersDetail(token) {
          try {
            const response = await fetch('/api/admin/jobseekers/stats', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // 통계 업데이트
              document.getElementById('activeJobseekersCount').textContent = data.active || 0;
              document.getElementById('pendingJobseekersCount').textContent = data.pending || 0;
              document.getElementById('chinaJobseekersCount').textContent = data.china || 0;
              document.getElementById('otherJobseekersCount').textContent = data.other || 0;
              
              // 최근 구직자 목록
              const listContainer = document.getElementById('recentJobseekersList');
              if (data.recentJobseekers && data.recentJobseekers.length > 0) {
                listContainer.innerHTML = data.recentJobseekers.slice(0, 5).map(js => \`
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">\${js.name}</h4>
                      <p class="text-sm text-gray-600 mt-1">\${js.nationality} • \${js.education || '정보없음'}</p>
                      <p class="text-xs text-gray-500 mt-1">\${new Date(js.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium \${
                      js.status === 'approved' ? 'bg-green-100 text-green-700' :
                      js.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }">\${js.status === 'approved' ? '승인' : js.status === 'pending' ? '대기' : '거부'}</span>
                  </div>
                \`).join('');
              } else {
                listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 구직자가 없습니다.</p>';
              }
            }
          } catch (error) {
            console.error('Failed to load jobseekers detail:', error);
            document.getElementById('recentJobseekersList').innerHTML = 
              '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
          }
        }
        
        // 협약대학교 상세 로드
        async function loadUniversitiesDetail(token) {
          try {
            const response = await fetch('/api/admin/universities/stats', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // 지역별 통계 처리
              const regionCounts = {
                seoul: 0,
                metropolitan: 0,
                regional: 0
              };
              
              if (data.regionalStats) {
                data.regionalStats.forEach(stat => {
                  if (stat.region === '서울') {
                    regionCounts.seoul = stat.count;
                  } else if (['인천', '경기'].includes(stat.region)) {
                    regionCounts.metropolitan += stat.count;
                  } else {
                    regionCounts.regional += stat.count;
                  }
                });
              }
              
              // 통계 업데이트
              document.getElementById('seoulUnivCount').textContent = regionCounts.seoul;
              document.getElementById('metropolitanUnivCount').textContent = regionCounts.metropolitan;
              document.getElementById('regionalUnivCount').textContent = regionCounts.regional;
              
              // 대학교 목록
              const listContainer = document.getElementById('universitiesList');
              if (data.recentUniversities && data.recentUniversities.length > 0) {
                listContainer.innerHTML = data.recentUniversities.map(univ => {
                  const partnershipLabel = univ.partnership_type === 'mou' ? 'MOU' : 
                                          univ.partnership_type === 'partnership' ? '파트너십' : '협약';
                  
                  return \`
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">\${univ.name}</h4>
                        <p class="text-sm text-gray-600 mt-1">\${univ.region} • \${univ.english_name || ''}</p>
                        \${univ.student_count ? \`<p class="text-xs text-gray-500 mt-1">재학생: \${univ.student_count.toLocaleString()}명 \${univ.foreign_student_count ? \`(외국인: \${univ.foreign_student_count.toLocaleString()})\` : ''}</p>\` : ''}
                      </div>
                      <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">\${partnershipLabel}</span>
                    </div>
                  \`;
                }).join('');
              } else {
                listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">등록된 협약대학교가 없습니다.</p>';
              }
            }
          } catch (error) {
            console.error('Failed to load universities detail:', error);
            document.getElementById('universitiesList').innerHTML = 
              '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
          }
        }
        
        // 매칭 상세 로드
        async function loadMatchesDetail(token) {
          try {
            const response = await fetch('/api/admin/matches/stats', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // 통계 업데이트
              document.getElementById('thisMonthMatches').textContent = data.thisMonth || 0;
              document.getElementById('inProgressMatches').textContent = data.inProgress || 0;
              document.getElementById('completedMatches').textContent = data.completed || 0;
              document.getElementById('successRate').textContent = data.successRate ? data.successRate.toFixed(1) + '%' : '0%';
              
              // 최근 매칭 목록
              const listContainer = document.getElementById('recentMatchesList');
              if (data.recentMatches && data.recentMatches.length > 0) {
                listContainer.innerHTML = data.recentMatches.map(match => \`
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">\${match.job_title || '직무 정보 없음'}</h4>
                      <p class="text-sm text-gray-600 mt-1">\${match.jobseeker_name || '구직자'} • 매칭점수: \${match.match_score || 0}점</p>
                      <p class="text-xs text-gray-500 mt-1">\${new Date(match.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium \${
                      match.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                      match.status === 'interested' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }">\${
                      match.status === 'applied' ? '지원완료' :
                      match.status === 'interested' ? '관심' : 
                      match.status === 'viewed' ? '확인' : '제안'
                    }</span>
                  </div>
                \`).join('');
              } else {
                listContainer.innerHTML = '<p class="text-center text-gray-500 py-8">매칭 내역이 없습니다.</p>';
              }
            }
          } catch (error) {
            console.error('Failed to load matches detail:', error);
            document.getElementById('recentMatchesList').innerHTML = 
              '<p class="text-center text-red-500 py-8">데이터를 불러오는데 실패했습니다.</p>';
          }
        }
        
        // 스크롤 네비게이션을 위한 CSS 스타일 추가
        function addScrollNavigationStyles() {
          const styleId = 'scroll-navigation-styles';
          if (document.getElementById(styleId)) return; // 이미 추가됨
          
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = \`
            /* 스크롤 오프셋 (고정 헤더를 고려) */
            .scroll-mt-4 {
              scroll-margin-top: 1rem;
            }
            
            /* 섹션 하이라이트 효과 */
            .section-highlighted {
              animation: sectionHighlight 3s ease-in-out;
              border-left: 4px solid #3B82F6;
              padding-left: 1rem;
            }
            
            @keyframes sectionHighlight {
              0% {
                background-color: rgba(59, 130, 246, 0.1);
                transform: translateX(-4px);
              }
              15% {
                background-color: rgba(59, 130, 246, 0.15);
                transform: translateX(0);
              }
              100% {
                background-color: transparent;
                transform: translateX(0);
              }
            }
            
            /* 부드러운 스크롤 */
            html {
              scroll-behavior: smooth;
            }
            
            /* 섹션 간 구분을 위한 추가 스타일 */
            #userManagementSection,
            #partnerUniversityManagement,
            #agentManagement {
              border-radius: 0.5rem;
              transition: all 0.3s ease;
            }
          \`;
          document.head.appendChild(style);
        }
        
        // 페이지 로드 시 스타일 추가
        if (typeof window !== 'undefined') {
          addScrollNavigationStyles();
        }
        
        // ==================== 누락된 함수 구현 ====================
        
        // 대시보드 통계 로드
        async function loadAdminStatistics() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) return;
            
            const response = await fetch('/api/admin/statistics', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                const { users, jobs, universities, matches } = result.data;
                
                // 통계 카드 업데이트
                document.getElementById('totalJobs').textContent = jobs.total || 0;
                document.getElementById('totalJobseekers').textContent = users.byType.find(t => t.user_type === 'jobseeker')?.count || 0;
                document.getElementById('totalUniversities').textContent = universities.total || 0;
                document.getElementById('totalMatches').textContent = matches.successful || 0;
                
                // 사이드바 배지 업데이트
                const pendingCount = users.pendingApprovals || 0;
                const sidebarBadge = document.getElementById('pendingBadgeSidebar');
                const mobileBadge = document.getElementById('pendingBadgeMobile');
                const tabBadge = document.getElementById('pendingTabCount');
                
                if (sidebarBadge) sidebarBadge.textContent = pendingCount;
                if (mobileBadge) mobileBadge.textContent = pendingCount;
                if (tabBadge) tabBadge.textContent = pendingCount;
              }
            }
          } catch (error) {
            console.error('Failed to load admin statistics:', error);
          }
        }

        // 승인 대기 사용자 로드
        async function loadPendingUsers() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) return;
            
            const container = document.getElementById('pendingUsersContent');
            if (!container) return;
            
            container.innerHTML = \`
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                <p>로딩 중...</p>
              </div>
            \`;
            
            const response = await fetch('/api/admin/users/pending', {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                const users = result.data.pendingUsers || [];
                
                if (users.length === 0) {
                  container.innerHTML = \`
                    <div class="text-center py-12 bg-gray-50 rounded-lg">
                      <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
                      <p class="text-lg font-semibold text-gray-900">승인 대기 중인 사용자가 없습니다</p>
                      <p class="text-gray-500 mt-2">모든 가입 신청이 처리되었습니다.</p>
                    </div>
                  \`;
                  return;
                }
                
                const tableRows = users.map(user => {
                  const userTypeLabel = {
                    'jobseeker': '구직자',
                    'company': '기업',
                    'agent': '에이전트'
                  }[user.user_type] || user.user_type;
                  
                  const userTypeColor = {
                    'jobseeker': 'green',
                    'company': 'blue',
                    'agent': 'purple'
                  }[user.user_type] || 'gray';
                  
                  return \`
                    <tr class="hover:bg-gray-50 border-b border-gray-100">
                      <td class="px-4 py-3">
                        <div class="font-medium text-gray-900">\${user.name || '이름 없음'}</div>
                        <div class="text-sm text-gray-500">\${user.email}</div>
                      </td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded text-xs font-medium bg-\${userTypeColor}-100 text-\${userTypeColor}-700">
                          \${userTypeLabel}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-500">
                        \${new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-500">
                        \${user.phone || '-'}
                      </td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          대기중
                        </span>
                      </td>
                    </tr>
                  \`;
                }).join('');
                
                container.innerHTML = \`
                  <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">사용자</th>
                          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">유형</th>
                          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">가입일</th>
                          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">연락처</th>
                          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        \${tableRows}
                      </tbody>
                    </table>
                  </div>
                  <p class="text-xs text-gray-500 mt-3">* 승인/거절은 '전체 사용자' 탭에서 진행해주세요.</p>
                \`;
              }
            }
          } catch (error) {
            console.error('Failed to load pending users:', error);
            const container = document.getElementById('pendingUsersContent');
            if (container) {
              container.innerHTML = \`
                <div class="text-center py-8 text-red-500">
                  <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                  <p>데이터를 불러오는데 실패했습니다.</p>
                </div>
              \`;
            }
          }
        }

        // 사용자 승인
        async function approveUser(userId) {
          if (!confirm('이 사용자를 승인하시겠습니까?')) return;
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/admin/users/\${userId}/approve\`, {
              method: 'POST',
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert(result.message);
              loadPendingUsers();
              loadAdminStatistics(); // 배지 업데이트를 위해 통계 다시 로드
            } else {
              alert(result.message || '사용자 승인에 실패했습니다.');
            }
          } catch (error) {
            console.error('Approve user error:', error);
            alert('오류가 발생했습니다.');
          }
        }

        // 사용자 거절
        async function rejectUser(userId) {
          const reason = prompt('거절 사유를 입력해주세요:');
          if (reason === null) return; // 취소
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/admin/users/\${userId}/reject\`, {
              method: 'POST',
              headers: { 
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reason })
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert(result.message);
              loadPendingUsers();
              loadAdminStatistics();
            } else {
              alert(result.message || '사용자 거절에 실패했습니다.');
            }
          } catch (error) {
            console.error('Reject user error:', error);
            alert('오류가 발생했습니다.');
          }
        }

        // 전체 사용자 로드
        async function loadAllUsers(page = 1) {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) return;
            
            const tbody = document.getElementById('allUsersTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = \`
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>로딩 중...</p>
                </td>
              </tr>
            \`;
            
            // 필터 값 가져오기
            const search = document.getElementById('searchUsers')?.value || '';
            const status = document.getElementById('userStatusFilter')?.value || '';
            const type = document.getElementById('userTypeFilter')?.value || '';
            
            const params = new URLSearchParams({
              page: page.toString(),
              limit: '20',
              search,
              status,
              user_type: type
            });
            
            const response = await fetch(\`/api/admin/users?\${params}\`, {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                const { users, total, totalPages } = result.data;
                
                document.getElementById('totalUsersCount').textContent = total;
                
                if (users.length === 0) {
                  tbody.innerHTML = \`
                    <tr>
                      <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  \`;
                  return;
                }
                
                tbody.innerHTML = users.map(user => {
                  const statusLabel = {
                    'approved': '승인됨',
                    'pending': '대기중',
                    'rejected': '거절됨',
                    'suspended': '정지됨'
                  }[user.status] || user.status;
                  
                  const statusColor = {
                    'approved': 'green',
                    'pending': 'yellow',
                    'rejected': 'red',
                    'suspended': 'gray'
                  }[user.status] || 'gray';

                  const userTypeLabel = {
                    'jobseeker': '구직자',
                    'company': '기업',
                    'agent': '에이전트',
                    'admin': '관리자'
                  }[user.user_type] || user.user_type;
                  
                  return \`
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <div class="text-sm font-medium text-gray-900">\${user.name}</div>
                          <div class="ml-2 text-sm text-gray-500">\${user.email}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500">
                        \${userTypeLabel}
                      </td>
                      <td class="px-6 py-4">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-\${statusColor}-100 text-\${statusColor}-800">
                          \${statusLabel}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500">
                        \${new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td class="px-6 py-4 text-sm font-medium">
                        <button onclick="editUser(\${user.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                          <i class="fas fa-edit"></i>
                        </button>
                        \${user.status === 'pending' ? \`
                          <button onclick="approveUser(\${user.id})" class="text-green-600 hover:text-green-900 mr-3" title="승인">
                            <i class="fas fa-check"></i>
                          </button>
                        \` : ''}
                      </td>
                    </tr>
                  \`;
                }).join('');
                
                // 페이지네이션 업데이트
                updatePagination(page, totalPages);
              }
            }
          } catch (error) {
            console.error('Failed to load all users:', error);
          }
        }

        // 페이지네이션 업데이트
        function updatePagination(currentPage, totalPages) {
          const container = document.getElementById('paginationButtons');
          if (!container) return;
          
          let html = '';
          
          // 이전 버튼
          html += \`
            <button onclick="loadAllUsers(\${Math.max(1, currentPage - 1)})" 
              class="px-3 py-1 rounded border \${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}"
              \${currentPage === 1 ? 'disabled' : ''}>
              <i class="fas fa-chevron-left"></i>
            </button>
          \`;
          
          // 페이지 번호 (최대 5개 표시)
          let startPage = Math.max(1, currentPage - 2);
          let endPage = Math.min(totalPages, startPage + 4);
          if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
          }
          
          for (let i = startPage; i <= endPage; i++) {
            html += \`
              <button onclick="loadAllUsers(\${i})" 
                class="px-3 py-1 rounded border \${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                \${i}
              </button>
            \`;
          }
          
          // 다음 버튼
          html += \`
            <button onclick="loadAllUsers(\${Math.min(totalPages, currentPage + 1)})" 
              class="px-3 py-1 rounded border \${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}"
              \${currentPage === totalPages ? 'disabled' : ''}>
              <i class="fas fa-chevron-right"></i>
            </button>
          \`;
          
          container.innerHTML = html;
        }

        // 탭 전환
        let currentUserTab = 'pending';
        function switchUserTab(tabName) {
          currentUserTab = tabName;
          
          // 탭 스타일 업데이트
          const tabs = ['pending', 'all', 'jobseekers', 'employers', 'agents'];
          tabs.forEach(tab => {
            const btn = document.getElementById(\`\${tab}Tab\`);
            const content = document.getElementById(\`\${tab === 'all' ? 'allUsers' : tab}UsersContent\`) || 
                           document.getElementById(\`\${tab}Content\`);
            
            if (btn) {
              if (tab === tabName) {
                btn.classList.remove('text-gray-500', 'border-transparent');
                btn.classList.add('text-blue-600', 'border-blue-600');
                if (tab === 'pending') {
                   btn.classList.remove('text-blue-600', 'border-blue-600');
                   btn.classList.add('text-yellow-600', 'border-yellow-600');
                }
              } else {
                btn.classList.remove('text-blue-600', 'border-blue-600', 'text-yellow-600', 'border-yellow-600');
                btn.classList.add('text-gray-500', 'border-transparent');
              }
            }
            
            if (content) {
              content.classList.add('hidden');
            }
          });
          
          // 선택된 콘텐츠 표시 및 데이터 로드
          if (tabName === 'pending') {
            document.getElementById('pendingUsersContent').classList.remove('hidden');
            loadPendingUsers();
          } else if (tabName === 'all') {
            document.getElementById('allUsersContent').classList.remove('hidden');
            loadAllUsers();
          } else if (tabName === 'jobseekers') {
            document.getElementById('jobseekersContent').classList.remove('hidden');
            loadUsersByType('jobseeker');
          } else if (tabName === 'employers') {
            document.getElementById('employersContent').classList.remove('hidden');
            loadUsersByType('company');
          } else if (tabName === 'agents') {
            document.getElementById('agentsContent').classList.remove('hidden');
            loadUsersByType('agent');
          }
        }
        
        // 사용자 수정 모달 열기
        async function editUser(userId) {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/admin/users/\${userId}\`, {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                const user = result.data;
                
                // 폼 필드 채우기
                const form = document.getElementById('editUserForm');
                if (form) {
                  // hidden input for userId
                  let idInput = form.querySelector('input[name="userId"]');
                  if (!idInput) {
                    idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'userId';
                    form.appendChild(idInput);
                  }
                  idInput.value = user.id;
                  
                  if (form.elements['name']) form.elements['name'].value = user.name;
                  if (form.elements['email']) form.elements['email'].value = user.email;
                  if (form.elements['status']) form.elements['status'].value = user.status;
                  if (form.elements['user_type']) form.elements['user_type'].value = user.user_type;
                  
                  // 모달 표시
                  const modal = document.getElementById('editUserModal');
                  if (modal) {
                    modal.classList.remove('hidden');
                  }
                }
              }
            }
          } catch (error) {
            console.error('Failed to load user details:', error);
            alert('사용자 정보를 불러오는데 실패했습니다.');
          }
        }
        
        // 사용자 수정 모달 닫기
        function closeEditUserModal() {
          const modal = document.getElementById('editUserModal');
          if (modal) {
            modal.classList.add('hidden');
          }
        }
        
        // 사용자 정보 저장
        async function saveUserEdit(e) {
          e.preventDefault();
          
          const form = e.target;
          const userId = form.querySelector('input[name="userId"]').value;
          
          const data = {
            name: form.elements['name'].value,
            email: form.elements['email'].value,
            status: form.elements['status'].value,
            user_type: form.elements['user_type'].value
          };
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/admin/users/\${userId}\`, {
              method: 'PUT',
              headers: { 
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('사용자 정보가 수정되었습니다.');
              closeEditUserModal();
              loadAllUsers(); // 목록 새로고침
            } else {
              alert(result.message || '사용자 정보 수정에 실패했습니다.');
            }
          } catch (error) {
            console.error('Failed to save user:', error);
            alert('오류가 발생했습니다.');
          }
        }
        
        // 전역 함수 할당은 스크립트 끝에서 수행
        
        // 초기화 함수
        function initDashboard() {
          console.log('=== 대시보드 초기화 시작 ===');
          
          const editUserForm = document.getElementById('editUserForm');
          if (editUserForm) {
            if (!editUserForm.getAttribute('data-listener-attached')) {
              editUserForm.addEventListener('submit', saveUserEdit);
              editUserForm.setAttribute('data-listener-attached', 'true');
            }
          }
          
          // 검색 입력 필드 엔터키 이벤트
          const searchUsersInput = document.getElementById('searchUsers');
          if (searchUsersInput && !searchUsersInput.getAttribute('data-listener-attached')) {
            searchUsersInput.addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                e.preventDefault();
                loadAllUsers();
              }
            });
            searchUsersInput.setAttribute('data-listener-attached', 'true');
          }
          
          // 사용자 승인 버튼 이벤트 리스너 추가
          const btnShowUserManagement = document.getElementById('btn-showUserManagement');
          if (btnShowUserManagement) {
            // 중복 등록 방지
            if (!btnShowUserManagement.getAttribute('data-listener-attached')) {
              btnShowUserManagement.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('[사용자 관리] 사용자 승인 버튼 클릭됨 (데스크톱)');
                if (typeof showUserManagement === 'function') {
                  showUserManagement();
                } else {
                  console.error('showUserManagement 함수를 찾을 수 없습니다.');
                }
              });
              btnShowUserManagement.setAttribute('data-listener-attached', 'true');
              console.log('[사용자 관리] 데스크톱 버튼 이벤트 리스너 등록 완료');
            }
          } else {
            console.warn('[사용자 관리] 데스크톱 버튼을 찾을 수 없습니다.');
          }
          
          const btnShowUserManagementMobile = document.getElementById('btn-showUserManagement-mobile');
          if (btnShowUserManagementMobile) {
            if (!btnShowUserManagementMobile.getAttribute('data-listener-attached')) {
              btnShowUserManagementMobile.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('[사용자 관리] 사용자 승인 버튼 클릭됨 (모바일)');
                if (typeof showUserManagement === 'function') {
                  showUserManagement();
                }
                if (typeof toggleMobileSidebar === 'function') {
                  toggleMobileSidebar();
                }
              });
              btnShowUserManagementMobile.setAttribute('data-listener-attached', 'true');
              console.log('[사용자 관리] 모바일 버튼 이벤트 리스너 등록 완료');
            }
          } else {
            console.warn('[사용자 관리] 모바일 버튼을 찾을 수 없습니다.');
          }
          
          console.log('=== 대시보드 초기화 완료 ===');
          
          // 초기 통계 데이터 로드
          if (typeof loadAdminStatistics === 'function') {
            loadAdminStatistics();
          } else {
            console.error('loadAdminStatistics 함수를 찾을 수 없습니다.');
          }
        }

        // DOMContentLoaded 이벤트 리스너 등록 및 즉시 실행 확인
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initDashboard);
        } else {
          initDashboard();
        }
        
        // 유학정보 페이지 함수들
        window.showUniversityModal = showUniversityModal;
        window.closeUniversityModal = closeUniversityModal;
        window.filterUniversities = filterUniversities;
        window.resetFilters = resetFilters;
        
        // 관리자 대학교 관리 함수들
        window.editUniversity = editUniversity;
        window.deleteUniversity = deleteUniversity;
        window.showAddUniversityForm = showAddUniversityForm;
        window.closeUniversityForm = closeUniversityForm;
        window.saveUniversity = saveUniversity;
        window.loadUniversitiesForAdmin = loadUniversitiesForAdmin;
        window.exportUniversitiesData = exportUniversitiesData;
        
        // 에이전트 관리 함수들
        window.showAgentManagement = showAgentManagement;
        window.hideAgentManagement = hideAgentManagement;
        window.loadAgentsForAdmin = loadAgentsForAdmin;
        window.displayAgentsTable = displayAgentsTable;
        window.showAgentModal = showAgentModal;
        window.closeAgentModal = closeAgentModal;
        window.deleteAgent = deleteAgent;
        window.showAddAgentForm = function() {
          window.location.href = '/agents/create';
        };
        window.editAgent = editAgent;
        
        // 모바일 사이드바 토글 함수
        function toggleMobileSidebar() {
          const mobileSidebar = document.getElementById('mobile-sidebar');
          const overlay = document.getElementById('mobile-sidebar-overlay');
          
          if (mobileSidebar && overlay) {
            const isHidden = mobileSidebar.classList.contains('-translate-x-full');
            if (isHidden) {
              mobileSidebar.classList.remove('-translate-x-full');
              overlay.classList.remove('hidden');
              document.body.style.overflow = 'hidden';
            } else {
              mobileSidebar.classList.add('-translate-x-full');
              overlay.classList.add('hidden');
              document.body.style.overflow = '';
            }
          }
        }
        
        window.toggleMobileSidebar = toggleMobileSidebar;
        
        // ==================== 모든 함수를 window에 할당 ====================
        window.loadAdminStatistics = loadAdminStatistics;
        window.loadPendingUsers = loadPendingUsers;
        window.approveUser = approveUser;
        window.rejectUser = rejectUser;
        window.switchUserTab = switchUserTab;
        window.loadAllUsers = loadAllUsers;
        window.editUser = editUser;
        window.closeEditUserModal = closeEditUserModal;
        window.saveUserEdit = saveUserEdit;
        
        console.log('[관리자 대시보드] 모든 함수 window 할당 완료');
        console.log('  - loadAdminStatistics:', typeof window.loadAdminStatistics);
        console.log('  - showUserManagement:', typeof window.showUserManagement);
        console.log('  - loadPendingUsers:', typeof window.loadPendingUsers);
        console.log('  - approveUser:', typeof window.approveUser);
        console.log('  - rejectUser:', typeof window.rejectUser);
        console.log('  - switchUserTab:', typeof window.switchUserTab);
        
        // 스크립트 실행 완료 확인
        console.log('[관리자 대시보드] 스크립트 실행 완료');
        
        // 즉시 통계 로드 시도 (DOM이 준비되지 않았을 수도 있음)
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            console.log('[관리자 대시보드] DOMContentLoaded - 통계 로드 시작');
            if (typeof window.loadAdminStatistics === 'function') {
              window.loadAdminStatistics();
            }
          });
        } else {
          // DOM이 이미 로드된 경우 즉시 실행
          console.log('[관리자 대시보드] DOM 이미 로드됨 - 통계 로드 시작');
          setTimeout(function() {
            if (typeof window.loadAdminStatistics === 'function') {
              window.loadAdminStatistics();
            }
          }, 100);
        }
        
        // 스크립트 실행 완료 확인
        console.log('[관리자 대시보드] 스크립트 실행 완료 - 모든 함수 정의됨');
      `}}>
        </script>
      </div>
    </div>
  )

  // Test upload page route
}

// Middleware: optionalAuth, requireAdmin
