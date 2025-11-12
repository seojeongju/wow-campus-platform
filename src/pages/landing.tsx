/**
 * Landing Page Component
 * Route: / (root)
 * Private site intro page - Login/Signup only
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
  // Check if user is already logged in
  const token = c.req.header('Cookie')?.match(/auth_token=([^;]+)/)?.[1]
  
  // If logged in, redirect to /home
  if (token) {
    return c.redirect('/home')
  }

  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      {/* Subtle background decoration */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div class="relative z-10 text-center max-w-md w-full">
        {/* Logo */}
        <div class="flex items-center justify-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
            <span class="text-white font-bold text-3xl">W</span>
          </div>
          <div class="text-left">
            <h1 class="font-bold text-3xl text-gray-900 leading-tight">WOW-CAMPUS</h1>
            <p class="text-sm text-gray-600 leading-tight">외국인 구인구직 플랫폼</p>
          </div>
        </div>

        {/* Description */}
        <div class="mb-12">
          <p class="text-lg text-gray-700 mb-2">
            외국인 근로자와 고용주를 위한
          </p>
          <p class="text-lg text-gray-700 font-semibold">
            믿을 수 있는 매칭 플랫폼
          </p>
        </div>

        {/* Member Only Badge */}
        <div class="inline-block px-6 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
          <i class="fas fa-lock mr-2"></i>
          회원 전용 플랫폼
        </div>

        {/* Action Buttons */}
        <div class="space-y-4">
          <button 
            onclick="showLoginModal()" 
            class="block w-full px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg cursor-pointer"
          >
            로그인
          </button>
          <button 
            onclick="showSignupModal()" 
            class="block w-full px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold text-lg cursor-pointer"
          >
            회원가입
          </button>
        </div>

        {/* Footer Info */}
        <div class="mt-12 text-sm text-gray-500">
          <p>안전하고 검증된 회원만 이용 가능합니다</p>
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}} />
    </div>
  )
}
