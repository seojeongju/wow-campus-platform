/**
 * Page Component
 * Route: /study/undergraduate
 * Original: src/index.tsx lines 8690-9011
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
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
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div class="bg-white border-b">
        <div class="container mx-auto px-4 py-3">
          <nav class="flex items-center space-x-2 text-sm">
            <a href="/" class="text-gray-500 hover:text-blue-600">홈</a>
            <span class="text-gray-400">/</span>
            <a href="/study" class="text-gray-500 hover:text-blue-600">유학정보</a>
            <span class="text-gray-400">/</span>
            <span class="text-gray-900">학부 과정</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-university text-blue-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">학부 과정 진학</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">한국의 우수한 대학교에서 학부 과정을 통해 전문 지식을 쌓고 글로벌 인재로 성장하세요</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Popular Majors */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">인기 전공 분야</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-laptop-code text-blue-600"></i>
                </div>
                <h3 class="font-semibold mb-2">컴퓨터공학</h3>
                <p class="text-sm text-gray-600">AI, 소프트웨어 개발, 데이터 사이언스</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-chart-line text-green-600"></i>
                </div>
                <h3 class="font-semibold mb-2">경영학</h3>
                <p class="text-sm text-gray-600">국제경영, 마케팅, 금융, 회계</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-cog text-purple-600"></i>
                </div>
                <h3 class="font-semibold mb-2">공학</h3>
                <p class="text-sm text-gray-600">기계, 전자, 화학, 건축공학</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-heartbeat text-red-600"></i>
                </div>
                <h3 class="font-semibold mb-2">의학/보건</h3>
                <p class="text-sm text-gray-600">의학, 간호학, 약학, 치의학</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-palette text-yellow-600"></i>
                </div>
                <h3 class="font-semibold mb-2">예술/디자인</h3>
                <p class="text-sm text-gray-600">시각디자인, 산업디자인, 미술</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-globe text-indigo-600"></i>
                </div>
                <h3 class="font-semibold mb-2">국제학</h3>
                <p class="text-sm text-gray-600">국제관계학, 한국학, 언어학</p>
              </div>
            </div>
          </section>

          {/* Admission Requirements */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">입학 요건</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">학력 요건</h3>
                <ul class="space-y-3 text-gray-600">
                  <li>• 고등학교 졸업 또는 동등 학력</li>
                  <li>• 국외 12년 교육과정 이수</li>
                  <li>• 성적증명서 (GPA 3.0/4.0 이상 권장)</li>
                  <li>• 졸업증명서 또는 졸업예정증명서</li>
                </ul>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">언어 요건</h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded p-3">
                    <strong>한국어 트랙:</strong> TOPIK 4급 이상
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <strong>영어 트랙:</strong> TOEFL 80+ / IELTS 6.0+
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">필수 서류</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 입학 지원서</li>
                  <li>• 자기소개서 (영문/한글)</li>
                  <li>• 학업계획서</li>
                  <li>• 추천서 2부</li>
                  <li>• 여권 사본</li>
                  <li>• 사진 (규격: 3x4cm)</li>
                  <li>• 재정증명서 (USD 20,000 이상)</li>
                </ul>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">전형 방법</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 서류 심사 (70%)</li>
                  <li>• 면접 또는 필기시험 (30%)</li>
                  <li>• 포트폴리오 (예술 계열)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Costs and Scholarships */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">학비 및 장학금</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">학비 (연간)</h3>
                <div class="space-y-3">
                  <div class="flex justify-between border-b pb-2">
                    <span>입학금 (1회)</span>
                    <span class="font-semibold">200만원 ~ 500만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>인문계열</span>
                    <span class="font-semibold">400만원 ~ 800만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>이공계열</span>
                    <span class="font-semibold">500만원 ~ 1,000만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>의학계열</span>
                    <span class="font-semibold">800만원 ~ 1,500만원</span>
                  </div>
                </div>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">생활비 (월간)</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>기숙사비</span>
                    <span>30만원 ~ 50만원</span>
                  </div>
                  <div class="flex justify-between">
                    <span>식비</span>
                    <span>30만원 ~ 40만원</span>
                  </div>
                  <div class="flex justify-between">
                    <span>기타 생활비</span>
                    <span>20만원 ~ 30만원</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">장학금 종류</h3>
                <div class="space-y-4">
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">정부초청장학금 (GKS)</h4>
                    <p class="text-sm text-gray-600 mb-2">학비 전액 + 생활비 지원</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">월 90만원</span>
                  </div>
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">대학별 장학금</h4>
                    <p class="text-sm text-gray-600 mb-2">성적우수 외국인 특별장학금</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">학비 30-100%</span>
                  </div>
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">교환학생 장학금</h4>
                    <p class="text-sm text-gray-600 mb-2">협정대학 교환학생 지원</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">학비 면제</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Services */}
          <section class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">학생 지원 서비스</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-user-friends text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">멘토링</h3>
                <p class="text-sm text-gray-600">한국 학생과 1:1 멘토-멘티 프로그램</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-stethoscope text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">건강관리</h3>
                <p class="text-sm text-gray-600">교내 보건소 및 의료보험 지원</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-briefcase text-yellow-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">취업 지원</h3>
                <p class="text-sm text-gray-600">이력서 작성부터 면접까지 전방위 지원</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-calendar-alt text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">문화 프로그램</h3>
                <p class="text-sm text-gray-600">한국 문화 체험 및 동아리 활동 지원</p>
              </div>
            </div>
          </section>

          {/* Application Timeline */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">지원 일정 (2024년)</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">봄학기 (3월 입학)</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>서류 접수:</span>
                    <span class="font-semibold">9월 1일 - 11월 30일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>서류 심사:</span>
                    <span class="font-semibold">12월 1일 - 12월 15일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>면접 시험:</span>
                    <span class="font-semibold">12월 20일 - 1월 10일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>합격자 발표:</span>
                    <span class="font-semibold">1월 20일</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">가을학기 (9월 입학)</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>서류 접수:</span>
                    <span class="font-semibold">3월 1일 - 5월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>서류 심사:</span>
                    <span class="font-semibold">6월 1일 - 6월 15일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>면접 시험:</span>
                    <span class="font-semibeld">6월 20일 - 7월 10일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>합격자 발표:</span>
                    <span class="font-semibold">7월 20일</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick="alert('지원 서비스는 준비 중입니다!')" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mr-4">
              지금 지원하기
            </button>
            <a href="/study" class="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              뒤로 가기
            </a>
          </div>
        </div>
      </main>
    </div>
  )

// Graduate Program Detail
}

// Middleware: none
