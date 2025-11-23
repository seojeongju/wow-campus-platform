/**
 * Page Component  
 * Route: /support/academic
 * 학업/진로 상담 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/logo_small.png" alt="WOW-CAMPUS" class="h-10" />
              <span class="text-xl font-bold text-blue-600">WOW-CAMPUS</span>
            </a>
          </div>
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8"></div>
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600"><i class="fas fa-bars text-2xl"></i></button>
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3"></div>
        </nav>
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b"></div>
            <div id="mobile-auth-buttons" class="pt-3"></div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8">
        <div class="mb-6"><div class="flex items-center text-sm text-gray-600">
          <a href="/home" class="hover:text-blue-600">홈</a><i class="fas fa-chevron-right mx-2 text-xs"></i>
          <a href="/global-support" class="hover:text-blue-600">글로벌 지원 센터</a><i class="fas fa-chevron-right mx-2 text-xs"></i>
          <span class="text-gray-900 font-medium">학업/진로 상담</span>
        </div></div>

        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center"><div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4"><span class="text-4xl">🎓</span></div>
            <div><h1 class="text-3xl font-bold mb-2">학업/진로 상담 서비스</h1><p class="text-indigo-100">학업 계획, 진로 설계, 장학금 정보 제공</p></div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-8"><div class="flex flex-wrap gap-2">
          <a href="/global-support/visa" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">비자 지원</a>
          <a href="/global-support/legal" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">법률 지원</a>
          <a href="/global-support/finance" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">금융 지원</a>
          <a href="/global-support/telecom" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">통신 지원</a>
          <a href="/global-support/academic" class="px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white">학업/진로</a>
          <a href="/global-support/employment" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">취업 지원</a>
        </div></div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">제공 서비스</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">📚 학업 상담</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 전공 선택 조언</li>
                    <li>• 학점 관리 팁</li>
                    <li>• 수강 신청 가이드</li>
                    <li>• 대학원 진학 상담</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">🎯 진로 설계</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 직업 적성 검사</li>
                    <li>• 경력 개발 로드맵</li>
                    <li>• 멘토링 프로그램</li>
                    <li>• 진로 워크샵</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">💰 장학금</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 장학금 정보 안내</li>
                    <li>• 신청 절차 지원</li>
                    <li>• 서류 작성 도움</li>
                    <li>• 면접 준비 코칭</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">🏆 자격증</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 취득 추천 자격증</li>
                    <li>• 시험 일정 안내</li>
                    <li>• 공부 방법 조언</li>
                    <li>• 스터디 그룹 연결</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">장학금 종류</h2>
              <div class="space-y-4">
                <div class="border-l-4 border-indigo-500 pl-4">
                  <h3 class="font-bold text-gray-900">학교 장학금</h3>
                  <p class="text-gray-600">성적우수, 근로, 봉사, 리더십 장학금</p>
                </div>
                <div class="border-l-4 border-purple-500 pl-4">
                  <h3 class="font-bold text-gray-900">정부 장학금</h3>
                  <p class="text-gray-600">국가장학금, GKS, TOPIK 우수자 장학금</p>
                </div>
                <div class="border-l-4 border-pink-500 pl-4">
                  <h3 class="font-bold text-gray-900">외부 장학금</h3>
                  <p class="text-gray-600">재단 장학금, 기업 장학금, 지자체 장학금</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">상담 신청</h3>
              <button class="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mb-3">
                <i class="fas fa-calendar-check mr-2"></i>1:1 상담 예약
              </button>
              <div class="mt-6 pt-6 border-t"><h4 class="font-semibold mb-3">상담 분야</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>✓ 학업 계획</p>
                  <p>✓ 진로 고민</p>
                  <p>✓ 장학금 신청</p>
                  <p>✓ 대학원 진학</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      
            {/* 상담 문의 연락처 */}
            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-phone-alt text-blue-600 mr-2"></i>
                상담 문의
              </h3>
              <div class="space-y-3 text-sm">
                <div class="flex items-start">
                  <i class="fas fa-envelope text-blue-500 mr-2 mt-1"></i>
                  <div>
                    <div class="font-semibold text-gray-900">이메일</div>
                    <a href="mailto:wow3d16@naver.com" class="text-blue-600 hover:text-blue-800">wow3d16@naver.com</a>
                  </div>
                </div>
                <div class="flex items-start">
                  <i class="fas fa-phone text-blue-500 mr-2 mt-1"></i>
                  <div>
                    <div class="font-semibold text-gray-900">전화 문의</div>
                    <div class="text-gray-700">서울: 02-3144-3137</div>
                    <div class="text-gray-700">구미: 054-464-3137</div>
                  </div>
                </div>
                <div class="flex items-start">
                  <i class="fas fa-clock text-blue-500 mr-2 mt-1"></i>
                  <div>
                    <div class="font-semibold text-gray-900">상담 시간</div>
                    <div class="text-gray-700">평일: 09:00 - 18:00</div>
                    <div class="text-gray-700">토요일: 09:00 - 13:00</div>
                    <div class="text-red-600">일요일 및 공휴일 휴무</div>
                  </div>
                </div>
              </div>
            </div>


      </main>

      <footer class="bg-gray-800 text-white mt-12 py-8">
        <div class="container mx-auto px-4 text-center">
          <p class="text-gray-400">© 2024 WOW-CAMPUS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
