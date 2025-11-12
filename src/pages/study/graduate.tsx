/**
 * Page Component
 * Route: /study/graduate
 * Original: src/index.tsx lines 9012-9413
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
              <img src="/static/logo.png" alt="WOW-CAMPUS" class="h-10 w-auto" />
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
            <span class="text-gray-900">대학원 과정</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-user-graduate text-purple-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">대학원 과정 진학</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">한국의 연구 중심 대학에서 석사, 박사 과정을 통해 전문 연구자로 성장하세요</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Program Types */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">과정 종류</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-graduation-cap text-blue-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">석사 과정</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• 수업연한: 2년</li>
                  <li>• 최소학점: 24학점</li>
                  <li>• 논문 또는 종합시험</li>
                  <li>• 연구 프로젝트 수행</li>
                </ul>
              </div>
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-user-graduate text-purple-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">박사 과정</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• 수업연한: 3년</li>
                  <li>• 최소학점: 36학점</li>
                  <li>• 박사논문 필수</li>
                  <li>• 독창적 연구 수행</li>
                </ul>
              </div>
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-flask text-green-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">석박사 통합</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• 수업연한: 5년</li>
                  <li>• 최소학점: 60학점</li>
                  <li>• 연속 과정 수행</li>
                  <li>• 장기 연구 프로젝트</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Research Areas */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">주요 연구 분야</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">이공계열</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">전자공학</h4>
                    <p class="text-xs text-gray-600">AI, IoT, 반도체</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">컴퓨터과학</h4>
                    <p class="text-xs text-gray-600">머신러닝, 빅데이터</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">생명공학</h4>
                    <p class="text-xs text-gray-600">유전공학, 의료기술</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">신소재</h4>
                    <p class="text-xs text-gray-600">나노기술, 에너지</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">인문사회계열</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">국제관계학</h4>
                    <p class="text-xs text-gray-600">외교, 안보정책</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">경영학</h4>
                    <p class="text-xs text-gray-600">전략, 마케팅</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">한국학</h4>
                    <p class="text-xs text-gray-600">역사, 문화연구</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">교육학</h4>
                    <p class="text-xs text-gray-600">교육정책, 교육공학</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Admission Process */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">입학 전형</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">지원 자격</h3>
                
                <div class="mb-6">
                  <h4 class="font-semibold mb-2">석사 과정</h4>
                  <ul class="space-y-1 text-gray-600 text-sm">
                    <li>• 학사학위 소지자 (4년제 대학 졸업)</li>
                    <li>• GPA 3.0/4.0 이상 (또는 B학점 이상)</li>
                    <li>• 관련 전공 또는 동등한 학력</li>
                  </ul>
                </div>
                
                <div class="mb-6">
                  <h4 class="font-semibold mb-2">박사 과정</h4>
                  <ul class="space-y-1 text-gray-600 text-sm">
                    <li>• 석사학위 소지자</li>
                    <li>• 연구계획서 및 연구 경력</li>
                    <li>• 지도교수 사전 승낙 (권장)</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-semibold mb-2">언어 요건</h4>
                  <div class="space-y-2 text-sm">
                    <div class="bg-purple-50 rounded p-2">
                      <strong>한국어 과정:</strong> TOPIK 5급 이상
                    </div>
                    <div class="bg-purple-50 rounded p-2">
                      <strong>영어 과정:</strong> TOEFL 90+ / IELTS 6.5+
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">전형 요소</h3>
                
                <div class="space-y-4">
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                      서류 심사 (50%)
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• 성적증명서</li>
                      <li>• 연구계획서</li>
                      <li>• 추천서</li>
                    </ul>
                  </div>
                  
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                      면접 시험 (30%)
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• 연구 계획 발표</li>
                      <li>• 전공 지식 질의응답</li>
                      <li>• 영어 또는 한국어 면접</li>
                    </ul>
                  </div>
                  
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                      필기 시험 (20%)
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• 전공 필기시험</li>
                      <li>• 연구방법론 (박사 과정)</li>
                      <li>• 일부 학과에서 실시</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Funding and Scholarships */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">연구비 및 장학금</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-green-600">정부 지원</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">BK21 프로그램</h4>
                    <p class="text-xs text-gray-600 mb-1">우수 연구 프로그램 지원</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">석사 월 100만원</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">GKS 대학원</h4>
                    <p class="text-xs text-gray-600 mb-1">정부초청 장학생</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">전액 + 생활비</span>
                  </div>
                </div>
              </div>
              
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-blue-600">대학 지원</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">연구조교 (RA)</h4>
                    <p class="text-xs text-gray-600 mb-1">연구 프로젝트 참여</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">월 80-150만원</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">교육조교 (TA)</h4>
                    <p class="text-xs text-gray-600 mb-1">학부 수업 보조</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">월 50-80만원</span>
                  </div>
                </div>
              </div>
              
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-purple-600">기타 지원</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">연구재단 과제</h4>
                    <p class="text-xs text-gray-600 mb-1">개별 연구비 지원</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">과제별 상이</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">산학협력 프로젝트</h4>
                    <p class="text-xs text-gray-600 mb-1">기업 연계 연구</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">프로젝트별</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Research Support */}
          <section class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">연구 지원 시설</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-microscope text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">첨단 연구실</h3>
                <p class="text-sm text-gray-600">최신 장비와 기술이 완비된 전문 연구실</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-book-open text-indigo-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">도서관 시설</h3>
                <p class="text-sm text-gray-600">24시간 이용 가능한 전자자료 및 논문 DB</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-laptop text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">컴퓨팅 자원</h3>
                <p class="text-sm text-gray-600">고성능 서버 및 클라우드 컴퓨팅 지원</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-globe text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">국제 교류</h3>
                <p class="text-sm text-gray-600">해외 대학과의 공동연구 및 교환 프로그램</p>
              </div>
            </div>
          </section>

          {/* Career Prospects */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">졸업 후 진로</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">학계 진출</h3>
                <ul class="space-y-3">
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-chalkboard-teacher text-gray-400 mt-1"></i>
                    <div>
                      <strong>대학교수</strong>
                      <p class="text-sm text-gray-600">국내외 대학 교수직, 박사후연구원</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-flask text-gray-400 mt-1"></i>
                    <div>
                      <strong>연구원</strong>
                      <p class="text-sm text-gray-600">정부출연연구소, 기업연구소 선임연구원</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-graduation-cap text-gray-400 mt-1"></i>
                    <div>
                      <strong>박사후과정</strong>
                      <p class="text-sm text-gray-600">해외 명문대학 포스닥 연구원</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">산업계 진출</h3>
                <ul class="space-y-3">
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-building text-gray-400 mt-1"></i>
                    <div>
                      <strong>대기업</strong>
                      <p class="text-sm text-gray-600">삼성, LG, 현대 등 연구개발 부서</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-lightbulb text-gray-400 mt-1"></i>
                    <div>
                      <strong>창업</strong>
                      <p class="text-sm text-gray-600">기술창업, 스타트업 창립 및 CTO</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-chart-line text-gray-400 mt-1"></i>
                    <div>
                      <strong>컨설팅</strong>
                      <p class="text-sm text-gray-600">전문 컨설턴트, 정책 개발 전문가</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick="toast.info('지원 서비스는 준비 중입니다!')" class="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold mr-4">
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

// Job Seekers page (구직정보 보기)
// 구직자 페이지 - 로그인 사용자만 접근 가능
}

// Middleware: none
