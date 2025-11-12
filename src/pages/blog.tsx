/**
 * Page Component
 * Route: /blog
 * Original: src/index.tsx lines 13600-13720
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/home" class="flex items-center space-x-3">
              <img src="https://page.gensparksite.com/v1/base64_upload/f3cddb6e826ad7b227805a64e777ec5e" alt="WOW-CAMPUS" class="h-10 w-auto" />
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
          <h1 class="text-4xl font-bold text-gray-900 mb-4">(주)와우쓰리디 블로그</h1>
          <p class="text-gray-600 text-lg">외국인 구직 활동과 한국 생활에 도움이 되는 유용한 정보를 제공합니다</p>
        </div>

        <div class="max-w-6xl mx-auto">
          <div class="bg-white rounded-lg shadow-sm mb-8">
            <div class="flex flex-wrap border-b">
              <button class="px-6 py-4 border-b-2 border-blue-600 text-blue-600 font-semibold">전체</button>
              <button class="px-6 py-4 text-gray-600 hover:text-blue-600">구직 팁</button>
              <button class="px-6 py-4 text-gray-600 hover:text-blue-600">한국 생활</button>
              <button class="px-6 py-4 text-gray-600 hover:text-blue-600">비자 정보</button>
              <button class="px-6 py-4 text-gray-600 hover:text-blue-600">업계 동향</button>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg overflow-hidden mb-12">
            <div class="md:flex">
              <div class="md:w-1/2 p-8 text-white">
                <div class="mb-4">
                  <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">추천 글</span>
                </div>
                <h2 class="text-3xl font-bold mb-4">한국에서 성공적인 구직을 위한 완벽 가이드</h2>
                <p class="text-blue-100 mb-6">외국인으로서 한국에서 일자리를 찾는 것은 도전적일 수 있습니다. 하지만 올바른 전략과 준비를 통해 성공할 수 있습니다...</p>
                <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">전체 글 읽기 →</button>
              </div>
              <div class="md:w-1/2 bg-gradient-to-br from-blue-400 to-purple-500 p-8 flex items-center justify-center">
                <div class="text-center text-white">
                  <i class="fas fa-briefcase text-6xl mb-4 opacity-80"></i>
                  <p class="text-xl font-semibold">구직 성공률 85%</p>
                  <p class="text-blue-100">가이드 활용 시</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div class="bg-green-100 p-6 text-center">
                <i class="fas fa-lightbulb text-4xl text-green-600 mb-3"></i>
                <span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm">구직 팁</span>
              </div>
              <div class="p-6">
                <h3 class="font-bold text-lg mb-3">면접에서 자주 나오는 질문 TOP 20</h3>
                <p class="text-gray-600 mb-4 text-sm">한국 기업 면접에서 가장 자주 묻는 질문들과 모범 답안을 정리했습니다.</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>10월 9일</span>
                  <span>조회 1,245</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div class="bg-blue-100 p-6 text-center">
                <i class="fas fa-home text-4xl text-blue-600 mb-3"></i>
                <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">한국 생활</span>
              </div>
              <div class="p-6">
                <h3 class="font-bold text-lg mb-3">외국인을 위한 한국 직장 문화 가이드</h3>
                <p class="text-gray-600 mb-4 text-sm">한국의 독특한 직장 문화와 예절에 대해 알아보세요.</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>10월 8일</span>
                  <span>조회 987</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div class="bg-purple-100 p-6 text-center">
                <i class="fas fa-passport text-4xl text-purple-600 mb-3"></i>
                <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">비자 정보</span>
              </div>
              <div class="p-6">
                <h3 class="font-bold text-lg mb-3">E-7 비자 신청 완벽 가이드 2024</h3>
                <p class="text-gray-600 mb-4 text-sm">특정활동 비자(E-7) 신청 절차와 필요 서류를 상세히 안내합니다.</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>10월 7일</span>
                  <span>조회 2,156</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 mt-16 text-center text-white">
            <h3 class="text-2xl font-bold mb-4">📧 뉴스레터 구독</h3>
            <p class="text-gray-300 mb-6">매주 새로운 구직 팁과 유용한 정보를 이메일로 받아보세요</p>
            <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="이메일 주소를 입력하세요" class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">구독하기</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
