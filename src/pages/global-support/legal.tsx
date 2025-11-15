/**
 * Page Component
 * Route: /support/legal
 * 법률 지원 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header - 동일한 구조 */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABlCAYAAAD3Xd5lAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QsMBR0y8emRNAAAcSJJREFUeNrtfWeYlEUa7amqL3Wa7p4IDAw5m0BUVDBgRkyYc06YI66BNWfMrgGzmAMoZlFRBBGQnMMwOXdPT8cvVdX90T0Iguvu6q7ee/vw9DM8M1256tRbVW8A8sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPP7LIH9m4e81SQKgEEC7FoQAQRhACoB9hPG/qdr9c2oQ0FVaH09VrGrvMOotS1KNoX+Bn/QLFrQ5QrTdsWfP/EzZAi+9+xM8Xk/JTz8tLVqyeLVsj3VAUQz0qCghe+wx0OrVq0tNIpnmZx2zb76z/h/EvY99gcJwqHTZypWFq9euk7H2DhQUBNG7dynZYVBvs0eP7jXxeEKce8r+f3jZ/zErPPH1Ckgpdv6mruGEdocpBjWkIH44NM3CLDLn3VN3+vCh2bXimn1Gb0sS36zEjj2LlZnLai5qEf6jaloTS5mwnZIK3w6w4xt8mdQ9krGWF088ZLtl3zp9AShk39URcV4l5wRKAoYdgtcUtEdBYu7Ubxump18++1fr/npNEh5NVX/aVF1Yt6l1z5RU97U0Y1yE0OIOECmJRBEFDUq+MOTac1S475V0LVotHO48MGbwNvkd+tTbgJS9bb3wfMoKqSmTcBRBAtzLh/j8r61qi62cefHe263Lo1+vQUXAUD5d03hSpRA7Q3JemKawmIcFvZm1e3VteeGiA8eLX2vLxe/OQlBh41YkzX2RYVwSFZaUrMhJbSpKtD2bNALuK1cc/bsnysVX3g8pHK05kh4SS9rjXaGOcgUZ3t6eEpblglEFXi8loTDaTSv2UWlhaPbAngNnn3Li+GgmY9qjRvb4l8q56YEXwV13zy+/mntMNGYJBRQUAplMhgwfsXNy//32fDIeT0ZvueLY38yr77BjQKR1tENCe7vwc0okKE+yHQaWb7j0whOfe3/G13zKIxP/5T4oG3QEdtlp8JBNNZFTTYsqFKq0LAuD+hWIo48c9RznovLqC48HABx50gRIKfesrbaOcRwmHNkGoigg0g8pJQAJwSmkBCgDVB0IBj1kYL8eaTNtvz2ob//GDz75NLbo+1e3qcfDT70PzvmQ6Z98c8bG2igYVcAUP6SIs9Ji+WNTi/lu3dJp/7Qt48+47vQfF9bu5HAPp6oDQUwEvV7Rr1f5c1LKys/evner71/7t8fguKYWibg7NTTFj3akuo8gZKdYIiks2wFjKgI+kKBfiTQ1NHy409D+MVUl7+wwtF/jl1/Pjn05/ak/hLCU/zRhJJMG5bzZJji..." alt="WOW-CAMPUS" class="h-10" />
              <span class="text-xl font-bold text-blue-600">WOW-CAMPUS</span>
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8"></div>
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3"></div>
        </nav>
        
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200"></div>
            <div id="mobile-auth-buttons" class="pt-3"></div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div class="mb-6">
          <div class="flex items-center text-sm text-gray-600">
            <a href="/home" class="hover:text-blue-600">홈</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <a href="/global-support" class="hover:text-blue-600">글로벌 지원 센터</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <span class="text-gray-900 font-medium">법률 지원</span>
          </div>
        </div>

        {/* Page Header */}
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <span class="text-4xl">⚖️</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold mb-2">법률 지원 서비스</h1>
              <p class="text-purple-100">근로계약, 임대차 계약 등 법률 상담 서비스</p>
            </div>
          </div>
        </div>

        {/* Service Navigation Tabs */}
        <div class="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div class="flex flex-wrap gap-2">
            <a href="/global-support/visa" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">비자 지원</a>
            <a href="/global-support/legal" class="px-4 py-2 rounded-lg font-medium bg-purple-600 text-white transition-colors">법률 지원</a>
            <a href="/global-support/finance" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">금융 지원</a>
            <a href="/global-support/telecom" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">통신 지원</a>
            <a href="/global-support/academic" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">학업/진로</a>
            <a href="/global-support/employment" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">취업 지원</a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            {/* 서비스 소개 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">서비스 소개</h2>
              <div class="prose max-w-none text-gray-600">
                <p class="mb-4">
                  외국인 유학생이 한국 생활 중 겪을 수 있는 법률 문제에 대한 전문 상담을 제공합니다.
                </p>
                <ul class="space-y-2">
                  <li class="flex items-start"><i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>근로계약서 검토 및 작성 지원</span></li>
                  <li class="flex items-start"><i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>임대차 계약 관련 상담</span></li>
                  <li class="flex items-start"><i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>노동 분쟁 해결 지원</span></li>
                  <li class="flex items-start"><i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>법률 문서 번역 서비스</span></li>
                </ul>
              </div>
            </div>

            {/* 주요 지원 분야 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">주요 지원 분야</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">📝 근로 관련</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 근로계약서 검토</li>
                    <li>• 임금 체불 문제</li>
                    <li>• 부당해고 상담</li>
                    <li>• 산업재해 처리</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">🏠 주거 관련</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 임대차 계약서 검토</li>
                    <li>• 보증금 반환 문제</li>
                    <li>• 주거 분쟁 해결</li>
                    <li>• 계약 해지 절차</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">⚖️ 민사 관련</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 손해배상 청구</li>
                    <li>• 계약 분쟁</li>
                    <li>• 소액 소송 지원</li>
                    <li>• 조정/중재 신청</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">📋 기타 법률</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 교통사고 처리</li>
                    <li>• 소비자 피해 구제</li>
                    <li>• 학교 관련 문제</li>
                    <li>• 각종 증명서 발급</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
              <div class="space-y-4">
                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <span class="font-medium">아르바이트 임금을 받지 못했어요</span>
                  </summary>
                  <div class="p-4 text-gray-600">
                    고용노동부(☎1350)에 진정을 제기하거나 법률 상담을 통해 임금 청구 소송을 진행할 수 있습니다.
                  </div>
                </details>
                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <span class="font-medium">보증금을 돌려받지 못했어요</span>
                  </summary>
                  <div class="p-4 text-gray-600">
                    계약서와 증빙자료를 준비하여 소액심판이나 민사조정을 신청할 수 있습니다.
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">법률 상담 신청</h3>
              <div class="space-y-3">
                <button class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <i class="fas fa-calendar-check mr-2"></i>무료 상담 신청
                </button>
                <button class="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  <i class="fas fa-phone mr-2"></i>긴급 상담
                </button>
              </div>
              
              <div class="mt-6 pt-6 border-t">
                <h4 class="font-semibold mb-3">무료 법률 상담</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>✓ 초기 상담 무료</p>
                  <p>✓ 다국어 통역 지원</p>
                  <p>✓ 비밀 보장</p>
                </div>
              </div>
            </div>

            <div class="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 class="text-lg font-bold text-red-900 mb-3">
                <i class="fas fa-exclamation-circle mr-2"></i>긴급 연락처
              </h3>
              <div class="space-y-2 text-sm">
                <div><strong>고용노동부</strong><br/>☎ 1350</div>
                <div><strong>법률구조공단</strong><br/>☎ 132</div>
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
