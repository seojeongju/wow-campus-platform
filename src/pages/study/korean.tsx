/**
 * Page Component
 * Route: /study/korean
 * Original: src/index.tsx lines 8428-8689
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
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
            <a href="/home" class="text-gray-500 hover:text-blue-600">홈</a>
            <span class="text-gray-400">/</span>
            <a href="/study" class="text-gray-500 hover:text-blue-600">유학정보</a>
            <span class="text-gray-400">/</span>
            <span class="text-gray-900">한국어 연수</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-graduation-cap text-green-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">한국어 연수 프로그램</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">기초부터 고급까지 체계적인 한국어 교육으로 한국 생활과 학업의 기초를 다져보세요</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Program Overview */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">프로그램 개요</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-3 text-green-600">교육 과정</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• <strong>1급-2급:</strong> 기초 한국어 (발음, 기본 문법)</li>
                  <li>• <strong>3급-4급:</strong> 중급 한국어 (일상 회화, 문서 작성)</li>
                  <li>• <strong>5급-6급:</strong> 고급 한국어 (학술 토론, 전문 용어)</li>
                  <li>• <strong>특별반:</strong> TOPIK 시험 준비반</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-3 text-green-600">수업 방식</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 소규모 클래스 (15명 이하)</li>
                  <li>• 원어민 강사 수업</li>
                  <li>• 말하기, 듣기, 읽기, 쓰기 통합 교육</li>
                  <li>• 문화 체험 프로그램 병행</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Course Schedule */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">수업 일정</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">정규 학기</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><strong>봄학기:</strong> 3월 - 5월</li>
                  <li><strong>여름학기:</strong> 6월 - 8월</li>
                  <li><strong>가을학기:</strong> 9월 - 11월</li>
                  <li><strong>겨울학기:</strong> 12월 - 2월</li>
                </ul>
              </div>
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">수업 시간</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><strong>오전반:</strong> 09:00 - 13:00</li>
                  <li><strong>오후반:</strong> 14:00 - 18:00</li>
                  <li><strong>주당:</strong> 20시간 (월-금)</li>
                  <li><strong>학기당:</strong> 200시간</li>
                </ul>
              </div>
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">특별 프로그램</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 한국 문화 체험</li>
                  <li>• 현장 학습</li>
                  <li>• 언어교환 프로그램</li>
                  <li>• 한국 학생과의 멘토링</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Fees and Requirements */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">지원 정보</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">수강료</h3>
                <div class="space-y-3">
                  <div class="flex justify-between border-b pb-2">
                    <span>등록비</span>
                    <span class="font-semibold">50,000원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>학기당 수강료</span>
                    <span class="font-semibold">1,200,000원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>교재비</span>
                    <span class="font-semibold">100,000원</span>
                  </div>
                  <div class="flex justify-between font-bold text-lg">
                    <span>총 비용 (1학기)</span>
                    <span class="text-green-600">1,350,000원</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">지원 자격</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 고등학교 졸업 이상 학력</li>
                  <li>• 만 18세 이상</li>
                  <li>• 한국어 학습 의지가 있는 외국인</li>
                  <li>• 기본적인 영어 의사소통 가능자</li>
                </ul>
                
                <h3 class="text-lg font-semibold mb-4 mt-6 text-green-600">필요 서류</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• 지원서 및 자기소개서</li>
                  <li>• 최종 학력 증명서</li>
                  <li>• 여권 사본</li>
                  <li>• 사진 (3x4cm, 2매)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">프로그램 혜택</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-certificate text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">수료증 발급</h3>
                <p class="text-sm text-gray-600">한국 대학교에서 인정하는 공식 수료증</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-home text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">기숙사 제공</h3>
                <p class="text-sm text-gray-600">안전하고 편리한 교내 기숙사 우선 배정</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-users text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">멘토링</h3>
                <p class="text-sm text-gray-600">한국 학생들과의 1:1 언어교환</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-graduation-cap text-yellow-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">진학 지원</h3>
                <p class="text-sm text-gray-600">한국 대학 진학을 위한 상담 및 지원</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">문의 및 지원</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">연락처</h3>
                <div class="space-y-3">
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-phone text-gray-400 w-5"></i>
                    <span>+82-2-1234-5678</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-envelope text-gray-400 w-5"></i>
                    <span>korean@wow-campus.com</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-map-marker-alt text-gray-400 w-5"></i>
                    <span>서울특별시 강남구 테헤란로 123</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">지원 일정</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>봄학기 지원 마감:</span>
                    <span class="font-semibold">1월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>여름학기 지원 마감:</span>
                    <span class="font-semibold">4월 30일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>가을학기 지원 마감:</span>
                    <span class="font-semibold">7월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>겨울학기 지원 마감:</span>
                    <span class="font-semibold">10월 31일</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick="toast.info('지원 서비스는 준비 중입니다!')" class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold mr-4">
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

// Undergraduate Program Detail
}

// Middleware: none
