/**
 * Page Component
 * Route: /notice
 * Original: src/index.tsx lines 13495-13599
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
          <h1 class="text-4xl font-bold text-gray-900 mb-4">공지사항</h1>
          <p class="text-gray-600 text-lg">(주)와우쓰리디의 최신 소식과 중요한 안내사항을 확인하세요</p>
        </div>

        <div class="max-w-4xl mx-auto space-y-4">
          <div class="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
            <div class="flex items-center mb-3">
              <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">중요</span>
              <span class="bg-red-500 text-white px-2 py-1 rounded text-xs">필독</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">[중요] (주)와우쓰리디 베타 서비스 정식 오픈 안내</h3>
            <p class="text-gray-600 mb-3">안녕하세요. (주)와우쓰리디 베타 서비스가 2024년 12월 1일부로 정식 서비스로 전환됩니다. 베타 기간 동안 이용해주신 모든 분들께 감사드리며...</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-11</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 1,247</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-3">
              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">업데이트</span>
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">NEW</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">AI스마트매칭 알고리즘 개선 및 새로운 필터 기능 추가</h3>
            <p class="text-gray-600 mb-3">더욱 정확한 AI스마트매칭을 위해 AI 알고리즘을 업데이트했습니다. 새로운 필터 옵션으로 원하는 조건의 공고를 더 쉽게 찾을 수 있습니다.</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-10</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 892</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-3">
              <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">이벤트</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">신규 회원 가입 이벤트 - 프리미엄 기능 1개월 무료!</h3>
            <p class="text-gray-600 mb-3">10월 한 달간 신규 가입 회원에게 프리미엄 기능을 무료로 제공합니다. 이 기회를 놓치지 마세요!</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-08</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 1,156</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-3">
              <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">점검</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">정기 시스템 점검 안내 (10월 15일 새벽 2시~4시)</h3>
            <p class="text-gray-600 mb-3">서비스 품질 향상을 위한 정기 점검이 진행됩니다. 점검 시간 동안 서비스 이용에 제한이 있을 수 있습니다.</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-05</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 445</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-3">
              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mr-3">기능 추가</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">모바일 앱 출시 및 푸시 알림 기능 도입</h3>
            <p class="text-gray-600 mb-3">(주)와우쓰리디 모바일 앱이 출시되었습니다! 이제 언제 어디서나 편리하게 구인구직 활동을 할 수 있습니다.</p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="fas fa-calendar mr-2"></i>
              <span>2024-10-03</span>
              <i class="fas fa-eye ml-4 mr-2"></i>
              <span>조회수 2,134</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
