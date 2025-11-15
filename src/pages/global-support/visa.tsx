/**
 * Page Component
 * Route: /support/visa
 * 비자 지원 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
  // 비자 유형별 정보
  const visaTypes = [
    {
      type: 'D-2',
      title: '유학비자 (D-2)',
      description: '대학(원) 정규 과정 재학생',
      features: ['학기 중 주 20시간 아르바이트 가능', '방학 중 시간 제한 없음', '졸업 후 D-10 전환 가능'],
      documents: ['여권', '입학허가서', '재학증명서', '재정증명서', '체류지 입증서류']
    },
    {
      type: 'D-4',
      title: '어학연수비자 (D-4)',
      description: '대학 부설 어학원 연수생',
      features: ['아르바이트 불가 (특별 허가 필요)', '6개월 단위 연장', 'D-2 전환 가능'],
      documents: ['여권', '입학허가서', '재학증명서', '재정증명서', '숙소증명서']
    },
    {
      type: 'D-10',
      title: '구직비자 (D-10)',
      description: '졸업 후 취업 준비생',
      features: ['최대 2년 체류', '시간 제한 없이 아르바이트 가능', 'E-7 전환 가능'],
      documents: ['여권', '졸업증명서', '성적증명서', '구직활동 계획서', '체류지 입증서류']
    },
    {
      type: 'E-7',
      title: '특정활동비자 (E-7)',
      description: '전문인력 취업비자',
      features: ['정규직 취업 가능', '3년 체류 가능', 'F-2 영주권 신청 가능'],
      documents: ['여권', '근로계약서', '학위증명서', '경력증명서', '회사 사업자등록증']
    }
  ];
  
  // 서비스 메뉴
  const serviceMenu = [
    { href: '/global-support/visa', label: '비자 지원', active: true },
    { href: '/global-support/legal', label: '법률 지원', active: false },
    { href: '/global-support/finance', label: '금융 지원', active: false },
    { href: '/global-support/telecom', label: '통신 지원', active: false },
    { href: '/global-support/academic', label: '학업/진로', active: false },
    { href: '/global-support/employment', label: '취업 지원', active: false }
  ];
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABlCAYAAAD3Xd5lAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QsMBR0y8emRNAAAcSJJREFUeNrtfWeYlEUa7amqL3Wa7p4IDAw5m0BUVDBgRkyYc06YI66BNWfMrgGzmAMoZlFRBBGQnMMwOXdPT8cvVdX90T0Iguvu6q7ee/vw9DM8M1256tRbVW8A8sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPP7LIH9m4e81SQKgEEC7FoQAQRhACoB9hPG/qdr9c2oQ0FVaH09VrGrvMOotS1KNoX+Bn/QLFrQ5QrTdsWfP/EzZAi+9+xM8Xk/JTz8tLVqyeLVsj3VAUQz0qCghe+wx0OrVq0tNIpnmZx2zb76z/h/EvY99gcJwqHTZypWFq9euk7H2DhQUBNG7dynZYVBvs0eP7jXxeEKce8r+f3jZ/zErPPH1Ckgpdv6mruGEdocpBjWkIH44NM3CLDLn3VN3+vCh2bXimn1Gb0sS36zEjj2LlZnLai5qEf6jaloTS5mwnZIK3w6w4xt8mdQ9krGWF088ZLtl3zp9AShk39URcV4l5wRKAoYdgtcUtEdBYu7Ubxump18++1fr/npNEh5NVX/aVF1Yt6l1z5RU97U0Y1yE0OIOECmJRBEFDUq+MOTac1S475V0LVotHO48MGbwNvkd+tTbgJS9bb3wfMoKqSmTcBRBAtzLh/j8r61qi62cefHe263Lo1+vQUXAUD5d03hSpRA7Q3JemKawmIcFvZm1e3VteeGiA8eLX2vLxe/OQlBh41YkzX2RYVwSFZaUrMhJbSpKtD2bNALuK1cc/bsnysVX3g8pHK05kh4SS9rjXaGOcgUZ3t6eEpblglEFXi8loTDaTSv2UWlhaPbAngNnn3Li+GgmY9qjRvb4l8q56YEXwV13zy+/mntMNGYJBRQUAplMhgwfsXNy//32fDIeT0ZvueLY38yr77BjQKR1tENCe7vwc0okKE+yHQaWb7j0whOfe3/G13zKIxP/5T4oG3QEdtlp8JBNNZFTTYsqFKq0LAuD+hWIo48c9RznovLqC48HABx50gRIKfesrbaOcRwmHNkGoigg0g8pJQAJwSmkBCgDVB0IBj1kYL8eaTNtvz2ob//GDz75NLbo+1e3qcfDT70PzvmQ6Z98c8bG2igYVcAUP6SIs9Ji+WNTi/lu3dJp/7Qt48+47vQfF9bu5HAPp6oDQUwEvV7Rr1f5c1LKys/evner71/7t8fguKYWibg7NTTFj3akuo8gZKdYIiks2wFjKgI+kKBfiTQ1NHy409D+MVUl7+wwtF/jl1/Pjn05/ak/hLCU/zRhJJMG5bzZJji..." alt="WOW-CAMPUS" class="h-10" />
              <span class="text-xl font-bold text-blue-600">WOW-CAMPUS</span>
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
          
          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3"></div>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200">
              {/* 동적 네비게이션 메뉴가 여기에 로드됩니다 */}
            </div>
            <div id="mobile-auth-buttons" class="pt-3">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div class="mb-6">
          <div class="flex items-center text-sm text-gray-600">
            <a href="/home" class="hover:text-blue-600">홈</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <a href="/global-support" class="hover:text-blue-600">글로벌 지원 센터</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <span class="text-gray-900 font-medium">비자 지원</span>
          </div>
        </div>

        {/* Page Header */}
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <span class="text-4xl">💼</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold mb-2">비자 지원 서비스</h1>
              <p class="text-blue-100">D-2, D-10, E-7 등 각종 비자 상담 및 신청 지원</p>
            </div>
          </div>
        </div>

        {/* Service Navigation Tabs */}
        <div class="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div class="flex flex-wrap gap-2">
            {serviceMenu.map(item => (
              <a 
                href={item.href}
                class={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  item.active 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div class="lg:col-span-2 space-y-8">
            {/* 서비스 소개 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">서비스 소개</h2>
              <div class="prose max-w-none text-gray-600">
                <p class="mb-4">
                  외국인 유학생의 한국 체류를 위한 비자 관련 모든 업무를 지원합니다. 
                  비자 신청부터 연장, 변경까지 전문 상담사가 도와드립니다.
                </p>
                <ul class="space-y-2">
                  <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>비자 유형별 맞춤 상담</span>
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>서류 준비 및 작성 지원</span>
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>출입국관리소 동행 서비스</span>
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>비자 연장/변경 신청 대행</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 비자 유형별 안내 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">비자 유형별 안내</h2>
              <div class="space-y-6">
                {visaTypes.map(visa => (
                  <div class="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <div class="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-2">
                          {visa.type}
                        </div>
                        <h3 class="text-xl font-bold text-gray-900">{visa.title}</h3>
                        <p class="text-gray-600">{visa.description}</p>
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <h4 class="font-semibold text-gray-900 mb-2">주요 특징</h4>
                      <ul class="space-y-1">
                        {visa.features.map(feature => (
                          <li class="flex items-start text-sm text-gray-600">
                            <i class="fas fa-angle-right text-blue-500 mr-2 mt-1"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-2">필요 서류</h4>
                      <div class="flex flex-wrap gap-2">
                        {visa.documents.map(doc => (
                          <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 신청 절차 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">신청 절차</h2>
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">상담 신청</h3>
                    <p class="text-gray-600">온라인/전화/방문 상담 중 선택하여 신청하세요.</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">서류 준비</h3>
                    <p class="text-gray-600">상담사의 안내에 따라 필요 서류를 준비합니다.</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">신청서 작성</h3>
                    <p class="text-gray-600">신청서 작성을 도와드리고 검토합니다.</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">출입국 방문</h3>
                    <p class="text-gray-600">출입국관리소 방문 시 동행 서비스를 제공합니다.</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">결과 확인</h3>
                    <p class="text-gray-600">심사 결과를 확인하고 비자를 발급받습니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
              <div class="space-y-4">
                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span class="font-medium text-gray-900">비자 연장은 언제 신청해야 하나요?</span>
                    <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="p-4 text-gray-600">
                    비자 만료일 4개월 전부터 신청 가능하며, 최소 1개월 전에는 신청하시는 것을 권장드립니다.
                  </div>
                </details>
                
                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span class="font-medium text-gray-900">D-2에서 D-10으로 변경할 수 있나요?</span>
                    <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="p-4 text-gray-600">
                    네, 졸업 후 D-10 구직비자로 변경 가능합니다. 졸업증명서와 구직활동 계획서가 필요합니다.
                  </div>
                </details>
                
                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span class="font-medium text-gray-900">아르바이트 허가는 어떻게 받나요?</span>
                    <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="p-4 text-gray-600">
                    D-2 비자 소지자는 출입국관리소에서 시간제취업허가를 받아야 합니다. 학교 성적증명서와 재학증명서가 필요합니다.
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            {/* 상담 신청 */}
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">상담 신청</h3>
              <div class="space-y-3">
                <button class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <i class="fas fa-calendar-check mr-2"></i>
                  온라인 상담 예약
                </button>
                <button class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <i class="fas fa-phone mr-2"></i>
                  전화 상담
                </button>
                <button class="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                  <i class="fas fa-building mr-2"></i>
                  방문 예약
                </button>
              </div>
              
              <div class="mt-6 pt-6 border-t border-gray-200">
                <h4 class="font-semibold text-gray-900 mb-3">상담 시간</h4>
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span>평일</span>
                    <span class="font-medium">09:00 - 18:00</span>
                  </div>
                  <div class="flex justify-between">
                    <span>토요일</span>
                    <span class="font-medium">09:00 - 13:00</span>
                  </div>
                  <div class="flex justify-between">
                    <span>일요일/공휴일</span>
                    <span class="font-medium text-red-500">휴무</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 pt-6 border-t border-gray-200">
                <h4 class="font-semibold text-gray-900 mb-3">연락처</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center text-gray-600">
                    <i class="fas fa-phone text-blue-500 mr-2"></i>
                    <span>02-1234-5678</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <i class="fas fa-envelope text-blue-500 mr-2"></i>
                    <span>visa@wowcampus.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 관련 서비스 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">관련 서비스</h3>
              <div class="space-y-3">
                <a href="/global-support/legal" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex items-center">
                    <span class="text-2xl mr-3">⚖️</span>
                    <div>
                      <div class="font-medium text-gray-900">법률 지원</div>
                      <div class="text-sm text-gray-600">근로계약, 법률 상담</div>
                    </div>
                  </div>
                </a>
                <a href="/global-support/employment" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex items-center">
                    <span class="text-2xl mr-3">💼</span>
                    <div>
                      <div class="font-medium text-gray-900">취업 지원</div>
                      <div class="text-sm text-gray-600">취업비자 전환</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* 긴급 연락처 */}
            <div class="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 class="text-lg font-bold text-red-900 mb-3 flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                긴급 연락처
              </h3>
              <div class="space-y-2 text-sm">
                <div>
                  <div class="font-semibold text-red-900">출입국외국인청</div>
                  <div class="text-red-700">☎ 1345 (다국어 지원)</div>
                </div>
                <div>
                  <div class="font-semibold text-red-900">��국인종합안내센터</div>
                  <div class="text-red-700">☎ 1345 (24시간)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-gray-800 text-white mt-12 py-8">
        <div class="container mx-auto px-4 text-center">
          <p class="text-gray-400">© 2024 WOW-CAMPUS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
