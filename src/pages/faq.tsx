/**
 * Page Component
 * Route: /faq
 * Original: src/index.tsx lines 13050-13112
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">← 고객지원</a>
              <a href="/" class="text-blue-600 hover:text-blue-800">홈으로</a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">자주 묻는 질문</h1>
          <p class="text-gray-600 text-lg">(주)와우쓰리디 이용에 관한 궁금한 사항들을 확인해보세요</p>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg mb-3 text-blue-600">Q. 회원가입은 어떻게 하나요?</h3>
            <p class="text-gray-600 mb-2">메인 페이지 우측 상단의 '회원가입' 버튼을 클릭하세요.</p>
            <p class="text-gray-600">구직자, 기업, 에이전트 중 원하는 유형을 선택하고 필요한 정보를 입력하면 됩니다.</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg mb-3 text-blue-600">Q. 외국인 비자 지원이 가능한가요?</h3>
            <p class="text-gray-600">네, 저희 플랫폼의 많은 기업들이 외국인 비자 지원을 제공합니다. 구인공고에서 '비자 지원' 필터를 사용하여 해당 기업들을 찾아보세요.</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg mb-3 text-blue-600">Q. 구인공고 등록은 무료인가요?</h3>
            <p class="text-gray-600">네, 현재 베타 서비스 기간으로 구인공고 등록이 완전 무료입니다. 무제한 공고 등록과 이력서 열람이 가능합니다.</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg mb-3 text-blue-600">Q. 서비스 이용료가 있나요?</h3>
            <p class="text-gray-600">현재 베타 서비스 기간으로 모든 기본 기능이 무료입니다. 정식 서비스 출시 시 요금제가 도입될 예정이며, 사전에 공지해드립니다.</p>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mt-12 text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">찾고 계신 답변이 없나요?</h3>
          <p class="text-gray-600 mb-6">더 자세한 도움이 필요하시면 언제든 연락해주세요</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">문의하기</a>
            <a href="/support" class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">고객지원</a>
          </div>
        </div>
      </main>
    </div>
  )
}
