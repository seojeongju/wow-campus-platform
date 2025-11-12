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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle Background with Concentric Circles */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient blob top right */}
        <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30 blur-3xl"></div>
        
        {/* Concentric circles */}
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-2 border-blue-100 rounded-full opacity-30"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-blue-100 rounded-full opacity-40"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-2 border-blue-200 rounded-full opacity-50"></div>
      </div>

      {/* Floating Icon Cards */}
      <div class="absolute inset-0 pointer-events-none">
        {/* Top Center - User Icon */}
        <div class="absolute top-24 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-float">
          <i class="fas fa-user-cog text-2xl text-gray-400"></i>
        </div>
        
        {/* Top Right - Settings */}
        <div class="absolute top-32 right-32 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-float-delayed">
          <i class="fas fa-cog text-xl text-gray-400"></i>
        </div>
        
        {/* Left - Delivery */}
        <div class="absolute top-1/2 left-20 transform -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-float">
          <i class="fas fa-shipping-fast text-2xl text-gray-400"></i>
        </div>
        
        {/* Right - Restaurant */}
        <div class="absolute top-1/2 right-20 transform -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-float-delayed">
          <i class="fas fa-utensils text-2xl text-gray-400"></i>
        </div>
        
        {/* Bottom Center - Building */}
        <div class="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-float">
          <i class="fas fa-building text-2xl text-gray-400"></i>
        </div>
      </div>

      {/* Main Content */}
      <div class="relative z-10 text-center max-w-2xl w-full">
        {/* Main Title */}
        <div class="mb-12 animate-fadeInUp">
          <p class="text-lg md:text-xl text-gray-700 mb-4">외국인 구인 구직 잘하는 방법</p>
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">WOW-CAMPUS</span>
          </h1>
        </div>

        {/* Question */}
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-12 animate-fadeInUp animation-delay-200">
          어떤 도움이 필요하세요?
        </h2>

        {/* Action Buttons */}
        <div class="flex gap-4 justify-center animate-fadeInUp animation-delay-800">
          <button 
            onclick="showLoginModal()" 
            class="px-10 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-medium text-base cursor-pointer border border-gray-200"
          >
            로그인
          </button>
          <button 
            onclick="showSignupModal()" 
            class="px-10 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium text-base cursor-pointer"
          >
            회원가입
          </button>
        </div>

        {/* Footer Info */}
        <div class="mt-12 text-sm text-gray-500 animate-fadeInUp animation-delay-1000">
          <p>안전하고 검증된 회원만 이용 가능합니다</p>
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: backwards;
        }
        
        .animation-delay-800 {
          animation-delay: 0.3s;
          animation-fill-mode: backwards;
        }
        
        .animation-delay-1000 {
          animation-delay: 0.4s;
          animation-fill-mode: backwards;
        }
      `}} />
    </div>
  )
}
