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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col items-center px-4 relative overflow-hidden">

      {/* ======================  
           Subtle Background 
      ====================== */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30 blur-3xl"></div>

        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] lg:w-[600px] lg:h-[600px] border-2 border-blue-100 rounded-full opacity-30"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] lg:w-[440px] lg:h-[440px] border-2 border-blue-100 rounded-full opacity-40"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] lg:w-[280px] lg:h-[280px] border-2 border-blue-200 rounded-full opacity-50"></div>
      </div>

      {/* ======================  
           Center Hero Section 
      ====================== */}
      <div class="flex flex-col items-center text-center z-10 pt-20 pb-16">

        {/* Logo */}
        <div class="w-20 h-20 lg:w-28 lg:h-28 mb-8">
          <img
            src="/images/logo.png"
            alt="WOW Campus Logo"
            class="w-full h-full object-contain drop-shadow-xl"
          />
        </div>

        {/* Main Description */}
        <h2 class="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-800 leading-snug drop-shadow-sm animate-fadeInUp">
          글로벌 인재와 기업을 연결하는  
          <span class="text-blue-600"> 스마트 매칭 플랫폼</span>
        </h2>

        {/* Action Buttons */}
        <div class="flex gap-3 mt-8 animate-fadeInUp animation-delay-700">
          <a href="/login" class="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition">
            로그인
          </a>
          <a href="/signup" class="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md hover:bg-white transition">
            회원가입
          </a>
        </div>
      </div>

      {/* ======================  
          Safety Text (Hero Bottom)
      ====================== */}
      <div class="mt-4 text-gray-600 text-sm md:text-base">
        안전하고 검증된 회원만 이용 가능합니다.
      </div>

      {/* ======================  
           BELOW HERO — 5 ICON MENUS  
      ====================== */}
      <section class="w-full flex justify-center mt-10">
        <div class="scale-90 md:scale-75 lg:scale-75 origin-top w-full max-w-6xl px-6">

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">

            {/* 구인정보 */}
            <div class="flex flex-col items-center p-4 bg-white rounded-xl shadow-md">
              <div class="w-10 h-10 flex items-center justify-center rounded-full mb-2 bg-blue-100">
                <svg width="20" height="20" fill="#3B82F6" viewBox="0 0 24 24">
                  <path d="M4 7h16v2H4V7zm0 4h16v2H4v-2zm0 4h10v2H4v-2z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800">구인정보</p>
            </div>

            {/* 구직정보 */}
            <div class="flex flex-col items-center p-4 bg-white rounded-xl shadow-md">
              <div class="w-10 h-10 flex items-center justify-center rounded-full mb-2 bg-blue-100">
                <svg width="20" height="20" fill="#3B82F6" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800">구직정보</p>
            </div>

            {/* 통계 */}
            <div class="flex flex-col items-center p-4 bg-white rounded-xl shadow-md">
              <div class="w-10 h-10 flex items-center justify-center rounded-full mb-2 bg-purple-100">
                <svg width="20" height="20" fill="#7C3AED" viewBox="0 0 24 24">
                  <path d="M4 22h4V10H4v12zm6 0h4V4h-4v18zm6 0h4V14h-4v8z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800">통계</p>
            </div>

            {/* AI 스마트매칭 */}
            <div class="flex flex-col items-center p-4 bg-white rounded-xl shadow-md">
              <div class="w-10 h-10 flex items-center justify-center rounded-full mb-2 bg-blue-100">
                <svg width="20" height="20" fill="#3B82F6" viewBox="0 0 24 24">
                  <path d="M12 2a4 4 0 00-4 4v1H6a2 2 0 00-2 2v6a6 6 0 006 6h4a6 6 0 006-6V9a2 2 0 00-2-2h-2V6a4 4 0 00-4-4z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800">AI 스마트매칭</p>
            </div>

            {/* 글로벌지원센터 */}
            <div class="flex flex-col items-center p-4 bg-white rounded-xl shadow-md">
              <div class="w-10 h-10 flex items-center justify-center rounded-full mb-2 bg-purple-100">
                <svg width="20" height="20" fill="#7C3AED" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17.9V13h4.9c-.4 3-1.9 5.2-4.9 6.9zM6.1 13H11v6.9c-3-1.7-4.5-3.9-4.9-6.9zM11 10H6.1C6.5 7 8 4.8 11 3.1V10zm2-6.9c3 1.7 4.5 3.9 4.9 6.9H13V3.1z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800">글로벌지원센터</p>
            </div>

          </div>
        </div>
      </section>

      {/* ======================  
         GLASSMORPHISM GLOBAL FOOTER  
      ====================== */}
      <footer class="w-full flex justify-center mt-14 mb-12 px-6">
        <div class="
          w-full max-w-4xl text-center 
          bg-white/40 backdrop-blur-md 
          border border-white/60 
          rounded-2xl shadow-md 
          py-5 px-4 
          text-gray-700 text-sm md:text-base
        ">
          안전하고 검증된 회원만 이용 가능합니다.
        </div>
      </footer>

    </div>
  )
}
