/**
 * Page Component  
 * Route: /support/employment
 * 취업 지원 서비스 페이지
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
          <a href="/support" class="hover:text-blue-600">글로벌 지원 센터</a><i class="fas fa-chevron-right mx-2 text-xs"></i>
          <span class="text-gray-900 font-medium">취업 지원</span>
        </div></div>

        <div class="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center"><div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4"><span class="text-4xl">💼</span></div>
            <div><h1 class="text-3xl font-bold mb-2">취업 지원 서비스</h1><p class="text-cyan-100">이력서 작성, 면접 준비, 취업비자 전환 지원</p></div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-8"><div class="flex flex-wrap gap-2">
          <a href="/support/visa" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">비자 지원</a>
          <a href="/support/legal" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">법률 지원</a>
          <a href="/support/finance" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">금융 지원</a>
          <a href="/support/telecom" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">통신 지원</a>
          <a href="/support/academic" class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">학업/진로</a>
          <a href="/support/employment" class="px-4 py-2 rounded-lg font-medium bg-cyan-600 text-white">취업 지원</a>
        </div></div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">제공 서비스</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">📝 이력서/자소서</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 이력서 작성법</li>
                    <li>• 자기소개서 첨삭</li>
                    <li>• 포트폴리오 제작</li>
                    <li>• 한국어 문서 검토</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">🎯 면접 준비</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 모의 면접</li>
                    <li>• 면접 질문 예상</li>
                    <li>• 답변 연습</li>
                    <li>• 면접 매너 교육</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">💼 비자 전환</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• D-10 구직비자</li>
                    <li>• E-7 취업비자</li>
                    <li>• 서류 준비 지원</li>
                    <li>• 신청 절차 안내</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">🏢 취업 정보</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 외국인 채용 기업</li>
                    <li>• 취업 박람회 정보</li>
                    <li>• 인턴십 기회</li>
                    <li>• 멘토링 연결</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">취업 준비 단계</h2>
              <div class="space-y-4">
                <div class="flex items-start"><div class="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mr-4">1</div>
                  <div><h3 class="font-semibold text-gray-900">취업 목표 설정</h3><p class="text-gray-600">희망 직종, 회사, 연봉 등 구체적 목표 수립</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mr-4">2</div>
                  <div><h3 class="font-semibold text-gray-900">이력서/자소서 작성</h3><p class="text-gray-600">전문가의 첨삭을 받아 완성도 높은 서류 준비</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mr-4">3</div>
                  <div><h3 class="font-semibold text-gray-900">면접 준비</h3><p class="text-gray-600">모의 면접으로 실전 감각 익히기</p></div>
                </div>
                <div class="flex items-start"><div class="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mr-4">4</div>
                  <div><h3 class="font-semibold text-gray-900">비자 전환 준비</h3><p class="text-gray-600">취업 확정 시 비자 변경 절차 진행</p></div>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 class="text-xl font-bold text-blue-900 mb-4">
                <i class="fas fa-rocket mr-2"></i>취업 성공률 높이는 TIP
              </h3>
              <ul class="space-y-2 text-blue-800">
                <li>✓ 한국어 능력 향상 (TOPIK 5급 이상 목표)</li>
                <li>✓ 인턴십/아르바이트 경험 쌓기</li>
                <li>✓ 네트워킹 행사 적극 참여</li>
                <li>✓ 자격증 취득 (직무 관련)</li>
                <li>✓ 한국 기업 문화 이해</li>
              </ul>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">취업 상담</h3>
              <button class="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 mb-3">
                <i class="fas fa-user-tie mr-2"></i>취업 컨설팅 신청
              </button>
              <div class="mt-6 pt-6 border-t"><h4 class="font-semibold mb-3">인기 취업 분야</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>✓ IT/소프트웨어</p>
                  <p>✓ 무역/해외영업</p>
                  <p>✓ 제조/생산관리</p>
                  <p>✓ 호텔/관광</p>
                </div>
              </div>
            </div>

            <div class="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 class="text-lg font-bold text-green-900 mb-3">
                <i class="fas fa-check-circle mr-2"></i>무료 서비스
              </h3>
              <div class="space-y-2 text-sm text-green-800">
                <p>• 이력서 기본 템플릿 제공</p>
                <p>• 취업 정보 뉴스레터</p>
                <p>• 온라인 취업 세미나</p>
                <p>• 취업 관련 Q&A</p>
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
