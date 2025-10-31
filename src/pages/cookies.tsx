/**
 * Page Component
 * Route: /cookies
 * Original: src/index.tsx lines 15650-15878
 */

import type { Context } from 'hono'

export function handler(c: Context) {
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
          
          <div class="flex items-center space-x-4">
            <a href="/" class="text-gray-600 hover:text-blue-600 transition-colors">홈으로</a>
          </div>
        </nav>
      </header>

      {/* Cookie Policy Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">쿠키 정책</h1>
            
            <div class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">쿠키란 무엇인가요?</h2>
              <p class="text-gray-600 mb-6">
                쿠키(Cookie)는 웹사이트를 방문할 때 웹사이트에서 이용자의 브라우저에 저장하는 작은 텍스트 파일입니다. 
                쿠키는 웹사이트가 이용자의 컴퓨터나 모바일 기기를 식별하고, 이용자의 환경설정을 저장하며, 
                웹사이트 이용 경험을 개선하는 데 사용됩니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">(주)와우쓰리디에서 사용하는 쿠키</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">저희 (주)와우쓰리디는 다음과 같은 목적으로 쿠키를 사용합니다:</p>
                
                <div class="space-y-6">
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-blue-800 mb-2">1. 필수 쿠키 (Essential Cookies)</h3>
                    <p class="text-blue-700 mb-2">웹사이트의 기본 기능을 제공하기 위해 반드시 필요한 쿠키입니다.</p>
                    <div class="text-sm text-blue-600">
                      <p>• 로그인 상태 유지</p>
                      <p>• 보안 설정</p>
                      <p>• 세션 관리</p>
                      <p>• 언어 설정</p>
                    </div>
                  </div>
                  
                  <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-green-800 mb-2">2. 기능성 쿠키 (Functional Cookies)</h3>
                    <p class="text-green-700 mb-2">웹사이트의 향상된 기능과 개인화된 서비스를 제공하는 쿠키입니다.</p>
                    <div class="text-sm text-green-600">
                      <p>• 사용자 환경설정 저장</p>
                      <p>• 검색 기록 및 필터 설정</p>
                      <p>• 지역 설정</p>
                      <p>• 다크모드/라이트모드 설정</p>
                    </div>
                  </div>
                  
                  <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-yellow-800 mb-2">3. 분석 쿠키 (Analytics Cookies)</h3>
                    <p class="text-yellow-700 mb-2">웹사이트 이용 현황을 분석하고 서비스 개선에 활용하는 쿠키입니다.</p>
                    <div class="text-sm text-yellow-600">
                      <p>• 페이지 방문 통계</p>
                      <p>• 사용자 행동 분석</p>
                      <p>• 성능 모니터링</p>
                      <p>• 오류 추적</p>
                    </div>
                  </div>
                  
                  <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-purple-800 mb-2">4. 마케팅 쿠키 (Marketing Cookies)</h3>
                    <p class="text-purple-700 mb-2">개인화된 광고와 마케팅 콘텐츠를 제공하는 쿠키입니다.</p>
                    <div class="text-sm text-purple-600">
                      <p>• 맞춤형 광고</p>
                      <p>• 리타게팅</p>
                      <p>• 소셜미디어 연동</p>
                      <p>• 이메일 마케팅</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">사용 중인 구체적인 쿠키</h2>
              <div class="text-gray-600 mb-6">
                <div class="overflow-x-auto">
                  <table class="min-w-full border-collapse border border-gray-300">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="border border-gray-300 px-4 py-2 text-left">쿠키명</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">목적</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">보관기간</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">유형</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">wowcampus_token</td>
                        <td class="border border-gray-300 px-4 py-2">로그인 인증 토큰</td>
                        <td class="border border-gray-300 px-4 py-2">24시간</td>
                        <td class="border border-gray-300 px-4 py-2">필수</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">user_preferences</td>
                        <td class="border border-gray-300 px-4 py-2">사용자 설정 저장</td>
                        <td class="border border-gray-300 px-4 py-2">1년</td>
                        <td class="border border-gray-300 px-4 py-2">기능성</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">language_setting</td>
                        <td class="border border-gray-300 px-4 py-2">언어 설정</td>
                        <td class="border border-gray-300 px-4 py-2">1년</td>
                        <td class="border border-gray-300 px-4 py-2">기능성</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">session_id</td>
                        <td class="border border-gray-300 px-4 py-2">세션 관리</td>
                        <td class="border border-gray-300 px-4 py-2">브라우저 종료 시</td>
                        <td class="border border-gray-300 px-4 py-2">필수</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 px-4 py-2">analytics_data</td>
                        <td class="border border-gray-300 px-4 py-2">웹사이트 이용 분석</td>
                        <td class="border border-gray-300 px-4 py-2">2년</td>
                        <td class="border border-gray-300 px-4 py-2">분석</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">쿠키 관리 방법</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">이용자는 쿠키 설정을 통해 쿠키의 허용, 차단, 삭제를 선택할 수 있습니다:</p>
                
                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 class="font-semibold mb-2">브라우저별 쿠키 설정 방법:</h3>
                  <div class="space-y-2 text-sm">
                    <p><strong>Chrome:</strong> 설정 → 고급 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</p>
                    <p><strong>Firefox:</strong> 환경설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터</p>
                    <p><strong>Safari:</strong> 환경설정 → 개인정보 → 쿠키 및 웹사이트 데이터</p>
                    <p><strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한 → 쿠키 및 저장된 데이터</p>
                  </div>
                </div>
                
                <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
                  <p class="text-amber-800 font-medium mb-2">⚠️ 주의사항</p>
                  <p class="text-amber-700">필수 쿠키를 차단하면 웹사이트의 일부 기능이 정상적으로 작동하지 않을 수 있습니다. 특히 로그인 기능과 개인화된 서비스 이용에 제한이 있을 수 있습니다.</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제3자 쿠키</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">저희 웹사이트는 다음과 같은 제3자 서비스를 이용하며, 이들 서비스에서 쿠키를 설정할 수 있습니다:</p>
                
                <div class="space-y-3">
                  <div class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p class="font-medium">Google Analytics</p>
                      <p class="text-sm text-gray-500">웹사이트 이용 통계 분석</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p class="font-medium">Cloudflare</p>
                      <p class="text-sm text-gray-500">웹사이트 보안 및 성능 최적화</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p class="font-medium">소셜미디어 플러그인</p>
                      <p class="text-sm text-gray-500">Facebook, LinkedIn, Twitter 연동</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">쿠키 정책 변경</h2>
              <p class="text-gray-600 mb-6">
                본 쿠키 정책은 법률 변경이나 서비스 개선에 따라 수정될 수 있습니다. 
                중요한 변경사항이 있는 경우 웹사이트를 통해 사전에 공지하겠습니다. 
                정책 변경 후에도 웹사이트를 계속 이용하시면 변경된 정책에 동의하는 것으로 간주됩니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">문의하기</h2>
              <div class="bg-blue-50 p-4 rounded-lg mb-6">
                <p class="text-blue-800 mb-2">쿠키 정책에 대한 문의사항이 있으시면 아래 연락처로 문의해주세요:</p>
                <div class="text-blue-700 text-sm space-y-1">
                  <p>• 이메일: wow3d16@naver.com</p>
                  <p>• 전화: 054-464-3137</p>
                  <p>• 운영시간: 평일 09:00~18:00 (토·일·공휴일 제외)</p>
                </div>
              </div>

              <div class="mt-12 pt-8 border-t border-gray-200">
                <p class="text-sm text-gray-500">시행일자: 2024년 1월 1일</p>
                <p class="text-sm text-gray-500">최근 업데이트: 2024년 10월 11일</p>
                <p class="text-sm text-gray-500">(주)와우쓰리디 플랫폼</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
