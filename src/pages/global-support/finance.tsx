/**
 * Page Component  
 * Route: /support/finance
 * 금융 지원 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABlCAYAAAD3Xd5lAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QsMBR0y8emRNAAAcSJJREFUeNrtfWeYlEUa7amqL3Wa7p4IDAw5m0BUVDBgRkyYc06YI66BNWfMrgGzmAMoZlFRBBGQnMMwOXdPT8cvVdX90T0Iguvu6q7ee/vw9DM8M1256tRbVW8A8sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPP7LIH9m4e81SQKgEEC7FoQAQRhACoB9hPG/qdr9c2oQ0FVaH09VrGrvMOotS1KNoX+Bn/QLFrQ5QrTdsWfP/EzZAi+9+xM8Xk/JTz8tLVqyeLVsj3VAUQz0qCghe+wx0OrVq0tNIpnmZx2zb76z/h/EvY99gcJwqHTZypWFq9euk7H2DhQUBNG7dynZYVBvs0eP7jXxeEKce8r+f3jZ/zErPPH1Ckgpdv6mruGEdocpBjWkIH44NM3CLDLn3VN3+vCh2bXimn1Gb0sS36zEjj2LlZnLai5qEf6jaloTS5mwnZIK3w6w4xt8mdQ9krGWF088ZLtl3zp9AShk39URcV4l5wRKAoYdgtcUtEdBYu7Ubxump18++1fr/npNEh5NVX/aVF1Yt6l1z5RU97U0Y1yE0OIOECmJRBEFDUq+MOTac1S475V0LVotHO48MGbwNvkd+tTbgJS9bb3wfMoKqSmTcBRBAtzLh/j8r61qi62cefHe263Lo1+vQUXAUD5d03hSpRA7Q3JemKawmIcFvZm1e3VteeGiA8eLX2vLxe/OQlBh41YkzX2RYVwSFZaUrMhJbSpKtD2bNALuK1cc/bsnysVX3g8pHK05kh4SS9rjXaGOcgUZ3t6eEpblglEFXi8loTDaTSv2UWlhaPbAngNnn3Li+GgmY9qjRvb4l8q56YEXwV13zy+/mntMNGYJBRQUAplMhgwfsXNy//32fDIeT0ZvueLY38yr77BjQKR1tENCe7vwc0okKE+yHQaWb7j0whOfe3/G13zKIxP/5T4oG3QEdtlp8JBNNZFTTYsqFKq0LAuD+hWIo48c9RznovLqC48HABx50gRIKfesrbaOcRwmHNkGoigg0g8pJQAJwSmkBCgDVB0IBj1kYL8eaTNtvz2ob//GDz75NLbo+1e3qcfDT70PzvmQ6Z98c8bG2igYVcAUP6SIs9Ji+WNTi/lu3dJp/7Qt48+47vQfF9bu5HAPp6oDQUwEvV7Rr1f5c1LKys/evner71/7t8fguKYWibg7NTTFj3akuo8gZKdYIiks2wFjKgI+kKBfiTQ1NHy409D+MVUl7+wwtF/jl1/Pjn05/ak/hLCU/zRhJJMG5bzZJji..." alt="WOW-CAMPUS" class="h-10" />
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
          <span class="text-gray-900 font-medium">금융 지원</span>
        </div></div>

        <div class="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center"><div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4"><span class="text-4xl">💳</span></div>
            <div><h1 class="text-3xl font-bold mb-2">금융 지원 서비스</h1><p class="text-green-100">은행 계좌 개설, 송금, 신용카드 발급 안내</p></div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-8"><div class="flex flex-wrap gap-2">
          <a href="/global-support/visa" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">비자 지원</a>
          <a href="/global-support/legal" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">법률 지원</a>
          <a href="/global-support/finance" class="px-4 py-2 rounded-lg font-medium bg-green-600 text-white">금융 지원</a>
          <a href="/global-support/telecom" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">통신 지원</a>
          <a href="/global-support/academic" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">학업/진로</a>
          <a href="/global-support/employment" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">취업 지원</a>
        </div></div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">제공 서비스</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">🏦 은행 계좌</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 은행 계좌 개설 안내</li>
                    <li>• 외국인 친화 은행 추천</li>
                    <li>• 필요 서류 안내</li>
                    <li>• 인터넷뱅킹 설정</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">💰 송금 서비스</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 해외 송금 방법</li>
                    <li>• 송금 수수료 비교</li>
                    <li>• 환율 우대 혜택</li>
                    <li>• 빠른 송금 서비스</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">💳 신용카드</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 체크카드 발급</li>
                    <li>• 신용카드 발급 조건</li>
                    <li>• 카드 혜택 비교</li>
                    <li>• 교통카드 연결</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">📱 모바일 금융</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 카카오페이 설정</li>
                    <li>• 토스 사용법</li>
                    <li>• 네이버페이 연결</li>
                    <li>• 간편결제 안내</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">은행 계좌 개설 절차</h2>
              <div class="space-y-4">
                <div class="flex items-start"><div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">1</div>
                  <div><h3 class="font-semibold text-gray-900">은행 선택</h3><p class="text-gray-600">외국인 서비스가 좋은 은행을 추천해드립니다</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">2</div>
                  <div><h3 class="font-semibold text-gray-900">서류 준비</h3><p class="text-gray-600">외국인등록증, 여권, 학생증, 휴대폰</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">3</div>
                  <div><h3 class="font-semibold text-gray-900">은행 방문</h3><p class="text-gray-600">예약 없이 방문 가능 (통역 서비스 동행 가능)</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">4</div>
                  <div><h3 class="font-semibold text-gray-900">계좌 개설 완료</h3><p class="text-gray-600">통장 및 체크카드 발급 (즉시 또는 1주일 내)</p></div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">금융 상담</h3>
              <button class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-3">
                <i class="fas fa-comments mr-2"></i>무료 상담 신청
              </button>
              <div class="mt-6 pt-6 border-t"><h4 class="font-semibold mb-3">추천 은행</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>✓ 신한은행 (외국인 특화)</p>
                  <p>✓ 우리은행 (글로벌 서비스)</p>
                  <p>✓ 국민은행 (지점 많음)</p>
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
