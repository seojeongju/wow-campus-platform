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
    <div class="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 blur-3xl animate-float"></div>
        <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
        
        {/* Geometric Shapes */}
        <div class="absolute top-20 right-40 w-32 h-32 border-4 border-white/10 rounded-xl rotate-45 animate-spin-slow"></div>
        <div class="absolute bottom-40 left-32 w-24 h-24 border-4 border-white/10 rounded-full animate-bounce-slow"></div>
        
        {/* Connected Dots Pattern */}
        <svg class="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>

      {/* Main Content */}
      <div class="relative z-10 text-center max-w-2xl w-full">
        {/* Logo */}
        <div class="flex items-center justify-center mb-10 animate-fadeInUp">
          <div class="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl mr-4 border border-white/30">
            <span class="text-white font-bold text-4xl">W</span>
          </div>
          <div class="text-left">
            <h1 class="font-bold text-4xl text-white leading-tight drop-shadow-lg">WOW-CAMPUS</h1>
            <p class="text-sm text-blue-100 leading-tight">외국인 구인구직 플랫폼</p>
          </div>
        </div>

        {/* Main Title */}
        <div class="mb-8 animate-fadeInUp animation-delay-200">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            외국인 근로자와 고용주를 위한
            <br />
            <span class="text-yellow-300">믿을 수 있는 매칭 플랫폼</span>
          </h2>
          <p class="text-lg text-blue-100 leading-relaxed">
            글로벌 인재와 기업을 연결하는 스마트한 솔루션
          </p>
        </div>

        {/* Stats Cards */}
        <div class="grid grid-cols-3 gap-4 mb-10 animate-fadeInUp animation-delay-400">
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div class="text-2xl font-bold text-white mb-1">10K+</div>
            <div class="text-xs text-blue-100">등록 인재</div>
          </div>
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div class="text-2xl font-bold text-white mb-1">5K+</div>
            <div class="text-xs text-blue-100">검증 기업</div>
          </div>
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div class="text-2xl font-bold text-white mb-1">98%</div>
            <div class="text-xs text-blue-100">만족도</div>
          </div>
        </div>

        {/* Member Only Badge */}
        <div class="inline-block px-6 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium mb-8 border border-white/30 animate-fadeInUp animation-delay-600">
          <i class="fas fa-lock mr-2"></i>
          회원 전용 플랫폼
        </div>

        {/* Action Buttons */}
        <div class="space-y-4 animate-fadeInUp animation-delay-800">
          <button 
            onclick="showLoginModal()" 
            class="block w-full px-8 py-5 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 font-bold text-lg cursor-pointer group"
          >
            <i class="fas fa-sign-in-alt mr-2 group-hover:translate-x-1 transition-transform"></i>
            로그인
          </button>
          <button 
            onclick="showSignupModal()" 
            class="block w-full px-8 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl hover:from-yellow-500 hover:to-orange-600 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 font-bold text-lg cursor-pointer group"
          >
            <i class="fas fa-user-plus mr-2 group-hover:scale-110 transition-transform"></i>
            회원가입
          </button>
        </div>

        {/* Features Icons */}
        <div class="mt-12 flex justify-center items-center space-x-8 text-white/60 animate-fadeInUp animation-delay-1000">
          <div class="text-center">
            <i class="fas fa-shield-check text-2xl mb-2"></i>
            <p class="text-xs">안전한 거래</p>
          </div>
          <div class="text-center">
            <i class="fas fa-globe text-2xl mb-2"></i>
            <p class="text-xs">글로벌 매칭</p>
          </div>
          <div class="text-center">
            <i class="fas fa-headset text-2xl mb-2"></i>
            <p class="text-xs">24/7 지원</p>
          </div>
        </div>

        {/* Footer Info */}
        <div class="mt-8 text-sm text-white/50">
          <p>안전하고 검증된 회원만 이용 가능합니다</p>
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20px, -20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, 20px);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: backwards;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: backwards;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: backwards;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
          animation-fill-mode: backwards;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
          animation-fill-mode: backwards;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}} />
    </div>
  )
}
