/**
 * Page Component
 * Route: /support
 * Original: src/index.tsx lines 12974-13049
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/static/logo.png" alt="WOW-CAMPUS" class="h-10 w-auto" />
            </a>
            <a href="/home" class="text-blue-600 hover:text-blue-800">← 홈으로 돌아가기</a>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">고객지원</h1>
          <p class="text-gray-600 text-lg">궁금한 사항이나 도움이 필요하시면 언제든 연락주세요</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-envelope text-2xl text-blue-600"></i>
            </div>
            <h3 class="font-semibold mb-2">이메일 문의</h3>
            <p class="text-gray-600 mb-4">wow3d16@naver.com</p>
            <a href="mailto:wow3d16@naver.com" class="text-blue-600 hover:text-blue-800">이메일 보내기</a>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-phone text-2xl text-green-600"></i>
            </div>
            <h3 class="font-semibold mb-2">전화 문의</h3>
            <p class="text-gray-600 mb-2">서울: 02-3144-3137</p>
            <p class="text-gray-600 mb-4">구미: 054-464-3137</p>
            <span class="text-green-600">평일 09:00~18:00</span>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-comments text-2xl text-purple-600"></i>
            </div>
            <h3 class="font-semibold mb-2">실시간 채팅</h3>
            <p class="text-gray-600 mb-4">즉시 답변</p>
            <button class="text-purple-600 hover:text-purple-800">채팅 시작하기</button>
          </div>
        </div>
        
        <div class="bg-white p-8 rounded-lg shadow-sm">
          <h2 class="text-2xl font-bold mb-6">자주 묻는 질문</h2>
          <div class="space-y-4">
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">회원가입은 어떻게 하나요?</h4>
              <p class="text-gray-600">메인 페이지의 '회원가입' 버튼을 클릭하여 간단한 정보를 입력하면 됩니다.</p>
            </div>
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">구인공고 등록 비용이 있나요?</h4>
              <p class="text-gray-600">현재 베타 서비스 기간으로 무료로 이용하실 수 있습니다.</p>
            </div>
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">외국인 비자 지원이 가능한가요?</h4>
              <p class="text-gray-600">네, 저희 플랫폼의 많은 기업들이 외국인 비자 지원을 제공합니다.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
