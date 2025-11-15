/**
 * Page Component  
 * Route: /support/telecom
 * 통신 지원 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
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
          <span class="text-gray-900 font-medium">통신 지원</span>
        </div></div>

        <div class="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center"><div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4"><span class="text-4xl">📱</span></div>
            <div><h1 class="text-3xl font-bold mb-2">통신 지원 서비스</h1><p class="text-orange-100">휴대폰 개통, 인터넷 가입, 요금제 비교</p></div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-8"><div class="flex flex-wrap gap-2">
          <a href="/global-support/visa" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">비자 지원</a>
          <a href="/global-support/legal" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">법률 지원</a>
          <a href="/global-support/finance" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">금융 지원</a>
          <a href="/global-support/telecom" class="px-4 py-2 rounded-lg font-medium bg-orange-600 text-white">통신 지원</a>
          <a href="/global-support/academic" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">학업/진로</a>
          <a href="/global-support/employment" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">취업 지원</a>
        </div></div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">제공 서비스</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">📱 휴대폰 개통</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 통신사 비교 및 추천</li>
                    <li>• 요금제 선택 상담</li>
                    <li>• 개통 절차 안내</li>
                    <li>• 유심(USIM) 발급</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">🌐 인터넷</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 인터넷 설치 신청</li>
                    <li>• 와이파이 공유기 설정</li>
                    <li>• 속도별 요금 비교</li>
                    <li>• 결합 상품 할인</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">💰 요금제</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 선불/후불 요금제</li>
                    <li>• 데이터 무제한 상품</li>
                    <li>• 유학생 할인 혜택</li>
                    <li>• 국제전화 요금제</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">🔧 부가서비스</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 번호이동 지원</li>
                    <li>• 로밍 설정</li>
                    <li>• 분실/도난 신고</li>
                    <li>• 명의 변경</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">추천 통신사 및 요금제</h2>
              <div class="space-y-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-bold text-gray-900">SK텔레콤</h3>
                    <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">1위</span>
                  </div>
                  <p class="text-gray-600 mb-2">✓ 가장 넓은 통신망 / ✓ 5G 속도 최고 / ✓ 외국인 전용 요금제</p>
                  <div class="text-sm text-gray-500">월 3만원대부터 ~</div>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-bold text-gray-900">KT</h3>
                    <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">추천</span>
                  </div>
                  <p class="text-gray-600 mb-2">✓ 결합상품 할인 / ✓ 인터넷+TV 패키지 / ✓ 유학생 특별 할인</p>
                  <div class="text-sm text-gray-500">월 2만5천원대부터 ~</div>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-bold text-gray-900">LG U+</h3>
                    <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">가성비</span>
                  </div>
                  <p class="text-gray-600 mb-2">✓ 저렴한 요금 / ✓ 데이터 무제한 / ✓ 국제전화 무료분</p>
                  <div class="text-sm text-gray-500">월 2만원대부터 ~</div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">휴대폰 개통 절차</h2>
              <div class="space-y-4">
                <div class="flex items-start"><div class="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-4">1</div>
                  <div><h3 class="font-semibold text-gray-900">통신사 및 요금제 선택</h3><p class="text-gray-600">상담을 통해 최적의 통신사와 요금제를 선택하세요</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-4">2</div>
                  <div><h3 class="font-semibold text-gray-900">서류 준비</h3><p class="text-gray-600">외국인등록증(또는 여권), 학생증, 은행계좌</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-4">3</div>
                  <div><h3 class="font-semibold text-gray-900">매장 방문 또는 온라인 신청</h3><p class="text-gray-600">통신사 대리점 방문 또는 온라인으로 개통 신청</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-4">4</div>
                  <div><h3 class="font-semibold text-gray-900">개통 완료 및 사용</h3><p class="text-gray-600">유심 수령 후 즉시 사용 가능 (보통 1-2시간)</p></div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">통신 상담</h3>
              <button class="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 mb-3">
                <i class="fas fa-comments mr-2"></i>요금제 추천받기
              </button>
              <div class="mt-6 pt-6 border-t"><h4 class="font-semibold mb-3">필요 서류</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>✓ 외국인등록증 또는 여권</p>
                  <p>✓ 학생증 (학생 할인)</p>
                  <p>✓ 은행 계좌 (자동이체용)</p>
                </div>
              </div>
            </div>

            <div class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 class="text-lg font-bold text-yellow-900 mb-3">
                <i class="fas fa-lightbulb mr-2"></i>알아두세요
              </h3>
              <div class="space-y-2 text-sm text-yellow-800">
                <p>• 외국인은 후불요금제 가입 시 보증금이 필요할 수 있습니다</p>
                <p>• 선불요금제는 보증금 없이 사용 가능합니다</p>
                <p>• 유학생 할인은 학생증 제시 필수</p>
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
