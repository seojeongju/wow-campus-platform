/**
 * Page Component
 * Route: /
 * Original: src/index.tsx lines 11727-12345
 */

import type { Context } from 'hono'
import { LanguageDropdownItems } from '../components/LanguageDropdownItems'

export const handler = (c: Context) => {
  const { t } = c.get('i18n')
  return c.render(
    <div class="min-h-screen bg-white">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="/home" class="flex items-center space-x-3 flex-shrink-0">
            <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div class="hidden lg:flex items-center space-x-8">
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                {t('common.service')}
                <i class="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <div id="service-dropdown-container" class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {/* 동적 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>
            <a href="/matching" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">{t('common.ai_matching')}</a>
            <a href="/global-support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">{t('common.global_support')}</a>
            <a href="/support" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">{t('common.customer_support')}</a>
            <div class="relative group">
              <button class="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center">
                {t('common.language')}
                <i class="fas fa-globe ml-1 text-xs"></i>
              </button>
              <div class="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <LanguageDropdownItems />
              </div>
            </div>
          </div>

          {/* Right Section: Auth Buttons + Mobile Menu Button */}
          <div class="flex items-center space-x-2">
            {/* Auth Buttons - Desktop */}
            <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
              <a href="/login" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                {t('common.login')}
              </a>
              <a href="/login" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                {t('common.register')}
              </a>
            </div>

            {/* Mobile Menu Button - Always Visible on Mobile */}
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600 active:text-blue-700" id="mobile-menu-btn">
              <i class="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div id="mobile-menu" class="lg:hidden bg-white border-t border-gray-200 shadow-lg hidden">
          <div class="container mx-auto px-4 py-4 space-y-3">
            {/* Mobile Auth Buttons */}
            <div id="mobile-auth-buttons" class="flex flex-col space-y-2 pb-3 border-b border-gray-200">
              <a href="/login" class="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center">
                <i class="fas fa-sign-in-alt mr-2"></i>{t('common.login')}
              </a>
              <a href="/login" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center">
                <i class="fas fa-user-plus mr-2"></i>{t('common.register')}
              </a>
            </div>

            {/* Service Menu */}
            <div class="space-y-2">
              <div class="font-semibold text-gray-900 mb-2 px-2">
                <i class="fas fa-th mr-2 text-blue-600"></i>{t('common.service')}
              </div>
              <div id="mobile-service-menu-container" class="pl-4 space-y-1">
                {/* 동적 모바일 서비스 메뉴가 여기에 로드됩니다 */}
              </div>
            </div>

            {/* Main Menu Items */}
            <a href="/matching" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-magic mr-2 text-blue-600"></i>{t('common.ai_matching')}
            </a>
            <a href="/global-support" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-globe mr-2 text-blue-600"></i>{t('common.global_support')}
            </a>
            <a href="/support" class="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              <i class="fas fa-headset mr-2 text-blue-600"></i>{t('common.customer_support')}
            </a>

            {/* Language Settings */}
            <div class="pt-3 border-t border-gray-200">
              <div class="font-semibold text-gray-900 mb-2 px-2">
                <i class="fas fa-globe mr-2 text-blue-600"></i>{t('common.language')}
              </div>
              <LanguageDropdownItems />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section class="relative bg-blue-900 py-32 overflow-hidden" style="background-image: url('/images/home-hero-bg.png'); background-size: cover; background-position: center; background-attachment: fixed;">
        {/* Overlay for readability */}
        <div class="absolute inset-0 bg-blue-950 opacity-60"></div>

        <div class="container mx-auto px-4 text-center relative z-10">
          <h1 class="text-6xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">WOW-CAMPUS</h1>
          <p class="text-2xl md:text-3xl text-cyan-400 font-bold mb-6 drop-shadow-md">{t('home.hero_subtitle')}</p>
          <p class="text-xl text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed">{t('home.hero_description')}</p>

          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/jobs" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {t('home.btn_jobs')}
            </a>
            <a href="/jobseekers" class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              {t('home.btn_jobseekers')}
            </a>
            <a href="/study" class="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
              {t('home.btn_study')}
            </a>
            <a href="/universities" class="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              {t('home.btn_universities')}
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.services_title')}</h2>
            <p class="text-gray-600 text-lg">{t('home.services_subtitle')}</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-handshake text-2xl text-blue-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">{t('home.aimatching_title')}</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                {t('home.aimatching_desc')}
              </p>
              <a href="/matching" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                {t('home.aimatching_link')} <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>

            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-graduation-cap text-2xl text-green-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">{t('home.study_title')}</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                {t('home.study_desc')}
              </p>
              <a href="/study" class="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors">
                {t('home.study_link')} <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>

            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-users text-2xl text-purple-600"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">{t('home.jobseeker_title')}</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                {t('home.jobseeker_desc')}
              </p>
              <a href="/jobseekers" class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                {t('home.jobseeker_link')} <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Information Section */}
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.latest_title')}</h2>
            <p class="text-gray-600 text-lg">{t('home.latest_subtitle')}</p>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            {/* 최신 구인정보 */}
            <div class="bg-white border rounded-lg overflow-hidden" data-section="latest-jobs">
              <div class="bg-blue-50 px-6 py-4 border-b">
                <h3 class="font-semibold text-gray-900">{t('home.latest_jobs')}</h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p class="text-sm">{t('home.latest_jobs_loading')}</p>
                </div>
              </div>
            </div>

            {/* 최신 구직정보 */}
            <div class="bg-white border rounded-lg overflow-hidden" data-section="latest-jobseekers">
              <div class="bg-green-50 px-6 py-4 border-b">
                <h3 class="font-semibold text-gray-900">{t('home.latest_jobseekers')}</h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p class="text-sm">{t('home.latest_jobseekers_loading')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Dashboard Section */}
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="text-center mb-8">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.stats_title')}</h2>
              <p class="text-gray-600 text-lg">{t('home.stats_subtitle')}</p>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-briefcase text-2xl text-blue-600"></i>
                </div>
                <div class="text-4xl font-bold text-blue-600 mb-2" data-stat="jobs">4</div>
                <div class="text-gray-600 font-medium">{t('home.stat_jobs')}</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-users text-2xl text-green-600"></i>
                </div>
                <div class="text-4xl font-bold text-green-600 mb-2" data-stat="jobseekers">14</div>
                <div class="text-gray-600 font-medium">{t('home.stat_jobseekers')}</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-star text-2xl text-purple-600"></i>
                </div>
                <div class="text-4xl font-bold text-purple-600 mb-2" data-stat="reviews">0</div>
                <div class="text-gray-600 font-medium">{t('home.stat_reviews')}</div>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-file-alt text-2xl text-orange-600"></i>
                </div>
                <div class="text-4xl font-bold text-orange-600 mb-2" data-stat="resumes">0</div>
                <div class="text-gray-600 font-medium">{t('home.stat_resumes')}</div>
              </div>
            </div>
          </div>

          {/* Additional Service Items */}
          <div class="mt-12">
            {/* Top row: 3 cards */}
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{t('home.detail_job_title')}</h3>
                <p class="text-gray-600 text-sm mb-4">{t('home.detail_job_desc')}</p>
                <a href="/jobs" class="text-blue-600 text-sm font-medium hover:underline">{t('home.detail_job_link')}</a>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{t('home.detail_js_title')}</h3>
                <p class="text-gray-600 text-sm mb-4">{t('home.detail_js_desc')}</p>
                <a href="/jobseekers" class="text-green-600 text-sm font-medium hover:underline">{t('home.detail_js_link')}</a>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{t('home.ai_sys_title')}</h3>
                <p class="text-gray-600 text-sm mb-4">{t('home.ai_sys_desc')}</p>
                <a href="/matching" class="text-purple-600 text-sm font-medium hover:underline">{t('home.ai_sys_link')}</a>
              </div>
            </div>
            {/* Bottom row: 2 cards centered */}
            <div class="flex flex-col md:flex-row justify-center gap-6">
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{t('home.study_prog_title')}</h3>
                <p class="text-gray-600 text-sm mb-4">{t('home.study_prog_desc')}</p>
                <a href="/study" class="text-orange-600 text-sm font-medium hover:underline">{t('home.study_prog_link')}</a>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{t('home.dash_title')}</h3>
                <p class="text-gray-600 text-sm mb-4">{t('home.dash_desc')}</p>
                <a href="/statistics" class="text-red-600 text-sm font-medium hover:underline">{t('home.dash_link')}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.step_title')}</h2>
            <p class="text-gray-600 text-lg">{t('home.step_subtitle')}</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">1</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">{t('home.step1_title')}</h3>
              <div class="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.step1_desc') }} />
            </div>

            <div class="text-center">
              <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">2</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">{t('home.step2_title')}</h3>
              <div class="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.step2_desc') }} />
            </div>

            <div class="text-center">
              <div class="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-3xl font-bold text-white">3</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">{t('home.step3_title')}</h3>
              <div class="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.step3_desc') }} />
            </div>
          </div>

          <div class="text-center mt-12">
            <button onclick="startOnboarding()" class="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors transform hover:scale-105 transition-all duration-200">
              {t('home.step_btn')} <i class="fas fa-rocket ml-2"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="bg-gray-900 text-white">
        <div class="container mx-auto px-4 py-16">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Company Info */}
            <div class="lg:col-span-2">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-xl">W</span>
                </div>
                <div>
                  <div class="font-bold text-2xl">WOW-CAMPUS</div>
                  <div class="text-gray-400 text-sm">Korea Job & Study Platform</div>
                </div>
              </div>
              <p class="text-gray-300 mb-6 leading-relaxed">
                {t('footer.description')}
              </p>

              {/* Contact Info */}
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <i class="fas fa-envelope text-blue-400"></i>
                  <span class="text-gray-300">wow3d16@naver.com</span>
                </div>
                {/* 전화번호 */}
                <div class="flex items-start space-x-3 mb-4">
                  <i class="fas fa-phone text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-gray-300">
                      <span class="font-medium text-white">{t('footer.phone_seoul')}:</span> 02-3144-3137
                    </div>
                    <div class="text-gray-300">
                      <span class="font-medium text-white">{t('footer.phone_gumi')}:</span> 054-464-3137
                    </div>
                  </div>
                </div>

                {/* 서울 사무소 */}
                <div class="flex items-start space-x-3 mb-3">
                  <i class="fas fa-map-marker-alt text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">{t('footer.office_seoul')}</div>
                    <div class="text-gray-300">{t('footer.office_seoul_addr')}</div>
                  </div>
                </div>

                {/* 구미 사무소 */}
                <div class="flex items-start space-x-3 mb-3">
                  <i class="fas fa-building text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">{t('footer.office_gumi')}</div>
                    <div class="text-gray-300">{t('footer.office_gumi_addr')}</div>
                  </div>
                </div>

                {/* 전주 사무소 */}
                <div class="flex items-start space-x-3">
                  <i class="fas fa-building text-blue-400 mt-1"></i>
                  <div>
                    <div class="text-white font-medium mb-1">{t('footer.office_jeonju')}</div>
                    <div class="text-gray-300">{t('footer.office_jeonju_addr')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 class="font-semibold text-lg mb-6">{t('common.customer_support')}</h3>
              <ul class="space-y-3">
                <li><a href="/faq" class="text-gray-300 hover:text-white transition-colors">{t('common.faq')}</a></li>
                <li><a href="/guide" class="text-gray-300 hover:text-white transition-colors">{t('common.guide')}</a></li>
                <li><a href="/contact" class="text-gray-300 hover:text-white transition-colors">{t('common.contact')}</a></li>
                <li><a href="/notice" class="text-gray-300 hover:text-white transition-colors">{t('common.notice')}</a></li>
                <li><a href="/blog" class="text-gray-300 hover:text-white transition-colors">{t('common.blog')}</a></li>
              </ul>
            </div>
          </div>

          {/* Social Links & Newsletter */}
          <div class="border-t border-gray-800 mt-12 pt-8">
            <div class="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Social Links */}
              <div class="flex items-center space-x-6">
                <span class="text-gray-400 font-medium">{t('footer.follow')}:</span>
                <div class="flex space-x-4">
                  <a href="https://www.facebook.com/wowcampus.kr" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors" title={t('footer.follow_facebook')}>
                    <i class="fab fa-facebook-f text-white"></i>
                  </a>
                  <a href="https://www.instagram.com/wowcampus.kr" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors" title={t('footer.follow_instagram')}>
                    <i class="fab fa-instagram text-white"></i>
                  </a>
                  <a href="https://www.linkedin.com/company/wowcampus" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors" title={t('footer.follow_linkedin')}>
                    <i class="fab fa-linkedin-in text-white"></i>
                  </a>
                  <a href="https://www.youtube.com/@wowcampus" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors" title={t('footer.follow_youtube')}>
                    <i class="fab fa-youtube text-white"></i>
                  </a>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div class="flex items-center space-x-3">
                <span class="text-gray-400 font-medium">{t('footer.newsletter')}:</span>
                <div class="flex">
                  <input
                    type="email"
                    id="newsletter-email"
                    placeholder={t('home.newsletter_placeholder')}
                    class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button onclick="subscribeNewsletter()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div class="border-t border-gray-800 mt-8 pt-8">
            <div class="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div class="text-gray-400 text-sm">
                © 2024 WOW-CAMPUS. {t('footer.rights')}
              </div>
              <div class="flex items-center space-x-6 text-sm">
                <a href="/terms" class="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</a>
                <a href="/privacy" class="text-gray-400 hover:text-white transition-colors">{t('footer.privacy')}</a>
                <a href="/cookies" class="text-gray-400 hover:text-white transition-colors">{t('footer.cookies')}</a>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-400">{t('footer.biz_num')}:</span>
                  <span class="text-gray-300">849-88-01659</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login/Signup Modals have been replaced by dynamic modals in app.js */}

      {/* Script to load real data */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // 로그인 체크 함수
        function checkAuthAndRedirect(event, href) {
          // 로그인 상태 확인
          const token = localStorage.getItem('wowcampus_token');
          const currentUser = window.currentUser;
          
          // 로그인하지 않은 경우
          if (!token && !currentUser) {
            event.preventDefault();
            event.stopPropagation();
            
            // 번역 메시지 가져오기
            const locale = window.locale || 'ko';
            const translations = window.translations || {};
            const message = translations.common?.members_only || '회원전용페이지입니다. 로그인해주세요';
            
            // 알림 표시
            alert(message);
            
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';
            return false;
          }
          
          // 로그인한 경우 정상적으로 이동
          return true;
        }
        
        // 모든 메뉴 링크에 로그인 체크 적용
        window.setupAuthCheckForLinks = function() {
          // 허용된 경로 목록 (로그인 없이 접근 가능)
          const publicPaths = ['/login', '/', '/home', '/contact', '/faq', '/guide', '/notice', '/blog', '/terms', '/privacy', '/cookies', '/support'];
          
          // 모든 링크에 이벤트 리스너 추가
          document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            
            // 공개 경로는 제외
            if (publicPaths.some(path => href === path || href.startsWith(path + '#'))) {
              return;
            }
            
            // 외부 링크는 제외
            if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
              return;
            }
            
            // 이미 이벤트 리스너가 추가된 경우 제외 (중복 방지)
            if (link.dataset.authCheckAdded) {
              return;
            }
            
            link.dataset.authCheckAdded = 'true';
            link.addEventListener('click', function(event) {
              checkAuthAndRedirect(event, href);
            });
          });
        };
        
        // Load latest information on page load
        window.addEventListener('DOMContentLoaded', async function() {
          // 메뉴 링크에 로그인 체크 적용
          setupAuthCheckForLinks();
          
          // 동적으로 추가되는 링크를 위해 MutationObserver 사용
          const observer = new MutationObserver(function(mutations) {
            setupAuthCheckForLinks();
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          await loadLatestInformation();
          await loadStatistics();
          
          // URL 파라미터 확인하여 회원가입 모달 자동 열기
          const urlParams = new URLSearchParams(window.location.search);
          const registerType = urlParams.get('register');
          
          if (registerType) {
            // register 파라미터가 있을 때는 startOnboarding()을 호출하지 않고
            // 직접 회원가입 모달을 열어서 관리자도 회원가입 모달을 볼 수 있도록 함
            setTimeout(() => {
              // startOnboarding() 대신 직접 회원가입 모달 열기
              if (typeof showSignupModal === 'function') {
                showSignupModal();
                // 사용자 유형 선택을 건너뛰고 바로 해당 유형 회원가입 폼 표시
                setTimeout(() => {
                  if (typeof selectUserType === 'function') {
                    if (registerType === 'company') {
                      selectUserType('company');
                    } else if (registerType === 'jobseeker') {
                      selectUserType('jobseeker');
                    } else if (registerType === 'agent') {
                      selectUserType('agent');
                    }
                  }
                }, 300);
              } else if (typeof startOnboarding === 'function') {
                // showSignupModal이 없으면 startOnboarding 사용 (fallback)
                startOnboarding();
                setTimeout(() => {
                  if (typeof selectUserType === 'function') {
                    if (registerType === 'company') {
                      selectUserType('company');
                    } else if (registerType === 'jobseeker') {
                      selectUserType('jobseeker');
                    } else if (registerType === 'agent') {
                      selectUserType('agent');
                    }
                  }
                }, 300);
              }
            }, 500);
          }
        });

        async function loadLatestInformation() {
          try {
            const response = await fetch('/api/latest-information');
            const result = await response.json();
            
            console.log('Latest information response:', result);
            
            if (result.success && result.data) {
              const { latestJobs, latestJobseekers } = result.data;
              
              // Update jobs section
              if (latestJobs && latestJobs.length > 0) {
                updateJobsSection(latestJobs);
              } else {
                // Show "no data" message
                const jobsSection = document.querySelector('[data-section="latest-jobs"] .p-6.space-y-4');
                if (jobsSection) {
                  jobsSection.innerHTML = \`
                    <div class="text-center py-8 text-gray-500">
                      <i class="fas fa-briefcase text-3xl mb-2"></i>
                      <p>등록된 구인공고가 없습니다</p>
                    </div>
                  \`;
                }
              }
              
              // Update jobseekers section
              if (latestJobseekers && latestJobseekers.length > 0) {
                updateJobseekersSection(latestJobseekers);
              } else {
                // Show "no data" message
                const jobseekersSection = document.querySelector('[data-section="latest-jobseekers"] .p-6.space-y-4');
                if (jobseekersSection) {
                  jobseekersSection.innerHTML = \`
                    <div class="text-center py-8 text-gray-500">
                      <i class="fas fa-users text-3xl mb-2"></i>
                      <p>등록된 구직자가 없습니다</p>
                    </div>
                  \`;
                }
              }
            } else {
              // API error - show error message
              showErrorMessages();
            }
          } catch (error) {
            console.error('Error loading latest information:', error);
            showErrorMessages();
          }
        }
        
        function showErrorMessages() {
          const jobsSection = document.querySelector('[data-section="latest-jobs"] .p-6.space-y-4');
          const jobseekersSection = document.querySelector('[data-section="latest-jobseekers"] .p-6.space-y-4');
          
          const errorHTML = \`
            <div class="text-center py-8 text-red-500">
              <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
              <p>데이터를 불러올 수 없습니다</p>
            </div>
          \`;
          
          if (jobsSection) jobsSection.innerHTML = errorHTML;
          if (jobseekersSection) jobseekersSection.innerHTML = errorHTML;
        }

        function updateJobsSection(jobs) {
          const jobsSection = document.querySelector('[data-section="latest-jobs"] .p-6.space-y-4');
          if (!jobsSection) return;
          
          // Count badge is removed - no need to update it
          
          // Build HTML for jobs
          let jobsHTML = jobs.map(job => \`
            <div class="border-b pb-4">
              <a href="/jobs/\${job.id}" class="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                <h4 class="font-semibold text-gray-900">\${job.title}</h4>
                <p class="text-sm text-gray-600">\${job.category || 'IT/소프트웨어'} • \${job.type || '정규직'}</p>
                <p class="text-xs text-gray-500 mt-2">\${job.company || '회사명 비공개'} • \${job.location || '서울'}</p>
              </a>
            </div>
          \`).join('');
          
          jobsHTML += \`
            <div class="text-center">
              <a href="/jobs" class="text-blue-600 hover:underline text-sm font-medium">
                전체 구인정보 보기
              </a>
            </div>
          \`;
          
          jobsSection.innerHTML = jobsHTML;
        }

        function updateJobseekersSection(jobseekers) {
          const jobseekersSection = document.querySelector('[data-section="latest-jobseekers"] .p-6.space-y-4');
          if (!jobseekersSection) return;
          
          // Count badge is removed - no need to update it
          
          // Build HTML for jobseekers
          let jobseekersHTML = jobseekers.map(js => \`
            <div class="border-b pb-4">
              <div class="-mx-2 px-2 py-2">
                <h4 class="font-semibold text-gray-900">\${js.name} (\${js.nationality})</h4>
                <p class="text-sm text-gray-600">\${js.experience}</p>
                <p class="text-xs text-gray-500 mt-2">\${js.skills} • \${js.location}</p>
              </div>
            </div>
          \`).join('');
          
          jobseekersHTML += \`
            <div class="text-center">
              <a href="/jobseekers" class="text-green-600 hover:underline text-sm font-medium">
                전체 구직정보 보기
              </a>
            </div>
          \`;
          
          jobseekersSection.innerHTML = jobseekersHTML;
        }
      `}}></script>
    </div>
  )
}

// Middleware: none

