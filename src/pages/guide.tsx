/**
 * Page Component
 * Route: /guide
 * Original: src/index.tsx lines 13113-13215
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/logo.jpg" alt="WOW-CAMPUS" class="h-10 w-auto" />
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">← 고객지원</a>
              <a href="/home" class="text-blue-600 hover:text-blue-800">홈으로</a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">이용가이드</h1>
          <p class="text-gray-600 text-lg">(주)와우쓰리디를 효과적으로 이용하는 방법을 알아보세요</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-user-tie text-blue-600 text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">구직자 가이드</h2>
            </div>
            <div class="space-y-4">
              <div class="border-l-4 border-blue-500 pl-4">
                <h3 class="font-semibold mb-2">1. 회원가입 및 프로필 설정</h3>
                <p class="text-gray-600 text-sm">구직자로 가입하고 상세 프로필을 작성하세요</p>
              </div>
              <div class="border-l-4 border-blue-500 pl-4">
                <h3 class="font-semibold mb-2">2. 이력서 업로드</h3>
                <p class="text-gray-600 text-sm">한국어와 영어 이력서를 모두 준비하세요</p>
              </div>
              <div class="border-l-4 border-blue-500 pl-4">
                <h3 class="font-semibold mb-2">3. 채용공고 검색 및 지원</h3>
                <p class="text-gray-600 text-sm">필터를 활용해 맞는 공고를 찾고 지원하세요</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-8">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-building text-green-600 text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">기업 가이드</h2>
            </div>
            <div class="space-y-4">
              <div class="border-l-4 border-green-500 pl-4">
                <h3 class="font-semibold mb-2">1. 기업 회원가입</h3>
                <p class="text-gray-600 text-sm">기업 정보와 담당자 정보를 정확히 입력하세요</p>
              </div>
              <div class="border-l-4 border-green-500 pl-4">
                <h3 class="font-semibold mb-2">2. 구인공고 작성</h3>
                <p class="text-gray-600 text-sm">상세한 채용 정보로 우수한 인재를 유치하세요</p>
              </div>
              <div class="border-l-4 border-green-500 pl-4">
                <h3 class="font-semibold mb-2">3. 지원자 관리</h3>
                <p class="text-gray-600 text-sm">AI스마트매칭 시스템을 활용해 최적의 후보자를 찾으세요</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 성공적인 구직 활동을 위한 팁</h3>
          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <h4 class="font-semibold mb-4 text-orange-600">📈 프로필 최적화</h4>
              <ul class="space-y-2 text-gray-700">
                <li>✓ 프로필 완성도 80% 이상 유지</li>
                <li>✓ 정기적인 정보 업데이트</li>
                <li>✓ 전문성을 보여줄 수 있는 키워드 사용</li>
                <li>✓ 정직하고 구체적인 정보 입력</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold mb-4 text-red-600">🎯 지원 전략</h4>
              <ul class="space-y-2 text-gray-700">
                <li>✓ AI스마트매칭도 70% 이상 공고에 집중</li>
                <li>✓ 기업 정보 사전 조사</li>
                <li>✓ 맞춤형 자기소개서 작성</li>
                <li>✓ 적극적인 네트워킹 활동</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
