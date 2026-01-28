/**
 * Landing Page Component
 * Route: / (root)
 * Private site intro page - Login/Signup only
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
  const { t } = c.get('i18n')
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
        <div class="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30 blur-3xl"></div>

        {/* Concentric circles - responsive sizes */}
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] lg:w-[600px] lg:h-[600px] border-2 border-blue-100 rounded-full opacity-30"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] lg:w-[440px] lg:h-[440px] border-2 border-blue-100 rounded-full opacity-40"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] lg:w-[280px] lg:h-[280px] border-2 border-blue-200 rounded-full opacity-50"></div>
      </div>

      {/* Language Toggle */}
      <div class="absolute top-6 right-6 z-50">
        <div class="relative group">
          <button class="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all flex items-center space-x-2 text-gray-700 hover:text-blue-600 border border-white/50">
            <i class="fas fa-globe text-sm"></i>
            <span class="text-sm font-medium">{t('common.language')}</span>
            <i class="fas fa-chevron-down text-xs ml-1"></i>
          </button>
          <div class="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <a href="?lang=ko" onclick="document.cookie='app_lang=ko; path=/; max-age=31536000'; window.location.reload(); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">한국어</a>
            <a href="?lang=en" onclick="document.cookie='app_lang=en; path=/; max-age=31536000'; window.location.reload(); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">English</a>
            <a href="?lang=ja" onclick="document.cookie='app_lang=ja; path=/; max-age=31536000'; window.location.reload(); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">日本語</a>
          </div>
        </div>
      </div>

      {/* Rotating Icons on 3 Concentric Circles */}
      <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Outer circle icons (600px desktop / 280px mobile) - Icons at 30° and 210° */}
        <div class="absolute w-[280px] h-[280px] lg:w-[600px] lg:h-[600px] animate-rotate-slow">
          {/* Icon at 30° (upper right) */}
          <div class="icon-outer-30 w-10 h-10 lg:w-14 lg:h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
            <i class="fas fa-briefcase text-sm lg:text-lg text-blue-500"></i>
          </div>
          {/* Icon at 210° (lower left) */}
          <div class="icon-outer-210 w-10 h-10 lg:w-14 lg:h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
            <i class="fas fa-handshake text-sm lg:text-lg text-purple-500"></i>
          </div>
        </div>

        {/* Middle circle icons (440px desktop / 200px mobile) - Icons at 60° and 240° */}
        <div class="absolute w-[200px] h-[200px] lg:w-[440px] lg:h-[440px] animate-rotate-medium">
          {/* Icon at 60° (upper right) */}
          <div class="icon-middle-60 w-10 h-10 lg:w-14 lg:h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
            <i class="fas fa-passport text-sm lg:text-lg text-green-500"></i>
          </div>
          {/* Icon at 240° (lower left) */}
          <div class="icon-middle-240 w-10 h-10 lg:w-14 lg:h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
            <i class="fas fa-globe-asia text-sm lg:text-lg text-indigo-500"></i>
          </div>
        </div>

        {/* Inner circle icons (280px desktop / 120px mobile) - Icons at 120° and 300° */}
        <div class="absolute w-[120px] h-[120px] lg:w-[280px] lg:h-[280px] animate-rotate-fast">
          {/* Icon at 120° (lower right) */}
          <div class="icon-inner-120 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
            <i class="fas fa-language text-sm lg:text-base text-orange-500"></i>
          </div>
          {/* Icon at 300° (upper left) */}
          <div class="icon-inner-300 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
            <i class="fas fa-award text-sm lg:text-base text-pink-500"></i>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="relative z-10 text-center max-w-2xl w-full px-4">
        {/* Logo */}
        <div class="flex items-center justify-center mb-8 md:mb-12 animate-fadeInUp">
          <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
        </div>

        {/* Main Description */}
        {/* Main Description */}
        <h2 class="text-xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-8 md:mb-12 animate-fadeInUp animation-delay-400 leading-relaxed px-4"
          dangerouslySetInnerHTML={{ __html: t('landing.hero_text') }}>
        </h2>

        {/* Action Buttons */}
        <div class="flex gap-3 md:gap-4 justify-center animate-fadeInUp animation-delay-800">
          <button
            onclick="showLoginModal()"
            class="px-8 md:px-10 py-3 md:py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-medium text-sm md:text-base cursor-pointer border border-gray-200"
          >
            {t('auth.login_title')}
          </button>
          <button
            onclick="showSignupModal()"
            class="px-8 md:px-10 py-3 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium text-sm md:text-base cursor-pointer"
          >
            {t('auth.register_button')}
          </button>
        </div>

        {/* Footer Info */}
        <div class="mt-8 md:mt-12 text-sm md:text-base text-gray-800 animate-fadeInUp animation-delay-1000">
          <p class="mb-20 md:mb-24">{t('landing.footer_text')}</p>

          {/* Feature Icons Section */}
          <div class="flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-8 mt-12 md:mt-16 px-4">
            {/* 구인정보 */}
            <div class="flex flex-col items-center gap-2 group">
              <div class="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-all">
                <i class="fas fa-user-tie text-2xl md:text-3xl text-blue-500"></i>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-700">{t('landing.info_job')}</span>
            </div>

            {/* 구직정보 */}
            <div class="flex flex-col items-center gap-2 group">
              <div class="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-all">
                <i class="fas fa-file-alt text-2xl md:text-3xl text-purple-500"></i>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-700">{t('landing.info_jobseeker')}</span>
            </div>

            {/* 통계 */}
            <div class="flex flex-col items-center gap-2 group">
              <div class="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-all">
                <i class="fas fa-chart-bar text-2xl md:text-3xl text-indigo-500"></i>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-700">{t('landing.info_stats')}</span>
            </div>

            {/* 매칭 */}
            <div class="flex flex-col items-center gap-2 group">
              <div class="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-all">
                <i class="fas fa-cogs text-2xl md:text-3xl text-blue-600"></i>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-700">{t('landing.info_matching')}</span>
            </div>

            {/* 글로벌지원센터 */}
            <div class="flex flex-col items-center gap-2 group">
              <div class="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-all">
                <i class="fas fa-globe text-2xl md:text-3xl text-pink-500"></i>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-700">{t('landing.info_global')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
        
        /* 회전 애니메이션 - 느리게 (외부 원) */}
        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* 회전 애니메이션 - 중간 속도 (중간 원) */
        @keyframes rotate-medium {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        
        /* 회전 애니메이션 - 빠르게 (내부 원) */
        @keyframes rotate-fast {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-rotate-slow {
          animation: rotate-slow 150s linear infinite;
        }
        
        .animate-rotate-medium {
          animation: rotate-medium 120s linear infinite;
        }
        
        .animate-rotate-fast {
          animation: rotate-fast 90s linear infinite;
        }
        
        /* Icon positioning - Outer circle (280px mobile / 600px desktop) */
        /* 30° = cos(30°) = 0.866, sin(30°) = 0.5 */
        .icon-outer-30 {
          position: absolute;
          /* Mobile: radius 140px, Desktop: radius 300px */
          top: calc(50% - 70px);   /* 50% - sin(30°)*140 */
          left: calc(50% + 121.2px); /* 50% + cos(30°)*140 */
          transform: translate(-50%, -50%);
        }
        
        @media (min-width: 1024px) {
          .icon-outer-30 {
            top: calc(50% - 150px);   /* 50% - sin(30°)*300 */
            left: calc(50% + 259.8px); /* 50% + cos(30°)*300 */
          }
        }
        
        /* 210° = cos(210°) = -0.866, sin(210°) = -0.5 */
        .icon-outer-210 {
          position: absolute;
          top: calc(50% + 70px);     /* 50% - sin(210°)*140 */
          left: calc(50% - 121.2px); /* 50% + cos(210°)*140 */
          transform: translate(-50%, -50%);
        }
        
        @media (min-width: 1024px) {
          .icon-outer-210 {
            top: calc(50% + 150px);     /* 50% - sin(210°)*300 */
            left: calc(50% - 259.8px);  /* 50% + cos(210°)*300 */
          }
        }
        
        /* Icon positioning - Middle circle (200px mobile / 440px desktop) */
        /* 60° = cos(60°) = 0.5, sin(60°) = 0.866 */
        .icon-middle-60 {
          position: absolute;
          /* Mobile: radius 100px, Desktop: radius 220px */
          top: calc(50% - 86.6px); /* 50% - sin(60°)*100 */
          left: calc(50% + 50px);  /* 50% + cos(60°)*100 */
          transform: translate(-50%, -50%);
        }
        
        @media (min-width: 1024px) {
          .icon-middle-60 {
            top: calc(50% - 190.5px); /* 50% - sin(60°)*220 */
            left: calc(50% + 110px);   /* 50% + cos(60°)*220 */
          }
        }
        
        /* 240° = cos(240°) = -0.5, sin(240°) = -0.866 */
        .icon-middle-240 {
          position: absolute;
          top: calc(50% + 86.6px);  /* 50% - sin(240°)*100 */
          left: calc(50% - 50px);   /* 50% + cos(240°)*100 */
          transform: translate(-50%, -50%);
        }
        
        @media (min-width: 1024px) {
          .icon-middle-240 {
            top: calc(50% + 190.5px);  /* 50% - sin(240°)*220 */
            left: calc(50% - 110px);   /* 50% + cos(240°)*220 */
          }
        }
        
        /* Icon positioning - Inner circle (120px mobile / 280px desktop) */
        /* 120° = cos(120°) = -0.5, sin(120°) = 0.866 */
        .icon-inner-120 {
          position: absolute;
          /* Mobile: radius 60px, Desktop: radius 140px */
          top: calc(50% - 51.96px); /* 50% - sin(120°)*60 */
          left: calc(50% - 30px);   /* 50% + cos(120°)*60 */
          transform: translate(-50%, -50%);
        }
        
        @media (min-width: 1024px) {
          .icon-inner-120 {
            top: calc(50% - 121.24px); /* 50% - sin(120°)*140 */
            left: calc(50% - 70px);    /* 50% + cos(120°)*140 */
          }
        }
        
        /* 300° = cos(300°) = 0.5, sin(300°) = -0.866 */
        .icon-inner-300 {
          position: absolute;
          top: calc(50% + 51.96px); /* 50% - sin(300°)*60 */
          left: calc(50% + 30px);   /* 50% + cos(300°)*60 */
          transform: translate(-50%, -50%);
        }
        
        @media (min-width: 1024px) {
          .icon-inner-300 {
            top: calc(50% + 121.24px); /* 50% - sin(300°)*140 */
            left: calc(50% + 70px);    /* 50% + cos(300°)*140 */
          }
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
      `}} />
    </div>
  )
}
