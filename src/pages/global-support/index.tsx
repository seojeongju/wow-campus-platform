/**
 * Page Component
 * Route: /support
 * 글로벌 지원 센터 메인 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const { t } = c.get('i18n');

  // 서비스 카드 데이터
  const services = [
    {
      icon: '💼',
      title: t('global_support.services.visa.title'),
      description: t('global_support.services.visa.description'),
      link: '/global-support/visa',
      color: 'blue'
    },
    {
      icon: '⚖️',
      title: t('global_support.services.legal.title'),
      description: t('global_support.services.legal.description'),
      link: '/global-support/legal',
      color: 'purple'
    },
    {
      icon: '💳',
      title: t('global_support.services.finance.title'),
      description: t('global_support.services.finance.description'),
      link: '/global-support/finance',
      color: 'green'
    },
    {
      icon: '📱',
      title: t('global_support.services.telecom.title'),
      description: t('global_support.services.telecom.description'),
      link: '/global-support/telecom',
      color: 'orange'
    },
    {
      icon: '🎓',
      title: t('global_support.services.academic.title'),
      description: t('global_support.services.academic.description'),
      link: '/global-support/academic',
      color: 'indigo'
    },
    {
      icon: '💼',
      title: t('global_support.services.employment.title'),
      description: t('global_support.services.employment.description'),
      link: '/global-support/employment',
      color: 'cyan'
    }
  ];

  // 긴급 연락처
  const emergencyContacts = [
    { icon: '🚨', title: t('global_support.emergency_contacts.emergency.title'), number: t('global_support.emergency_contacts.emergency.number'), description: t('global_support.emergency_contacts.emergency.description') },
    { icon: '🏥', title: t('global_support.emergency_contacts.foreigner_guide.title'), number: t('global_support.emergency_contacts.foreigner_guide.number'), description: t('global_support.emergency_contacts.foreigner_guide.description') },
    { icon: '💼', title: t('global_support.emergency_contacts.labor.title'), number: t('global_support.emergency_contacts.labor.number'), description: t('global_support.emergency_contacts.labor.description') },
    { icon: '🏛️', title: t('global_support.emergency_contacts.immigration.title'), number: t('global_support.emergency_contacts.immigration.number'), description: t('global_support.emergency_contacts.immigration.description') }
  ];

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            {/* Logo */}
            <a href="/home" class="flex items-center space-x-3 flex-shrink-0">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>

          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>

          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>

          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3"></div>
        </nav>

        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200">
              {/* 동적 네비게이션 메뉴가 여기에 로드됩니다 */}
            </div>
            <div id="mobile-auth-buttons" class="pt-3">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div class="relative bg-blue-900 rounded-3xl overflow-hidden mb-12 py-20 px-12 text-center shadow-2xl" style="background-image: url('/images/global-support-hero-bg.png'); background-size: cover; background-position: center;">
          {/* Professional Overlay */}
          <div class="absolute inset-0 bg-blue-950 opacity-50"></div>

          <div class="max-w-4xl mx-auto relative z-10">
            <h1 class="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">{t('global_support.title')}</h1>
            <p class="text-2xl md:text-3xl text-cyan-300 font-bold mb-8 drop-shadow-md">
              {t('global_support.subtitle')}
            </p>
            <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20 inline-block max-w-2xl">
              <p class="text-gray-100 text-lg md:text-xl font-medium leading-relaxed" dangerouslySetInnerHTML={{__html: t('global_support.description')}}>
              </p>
            </div>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{t('global_support.services.title')}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
              const bgColors = {
                blue: 'bg-blue-50 hover:bg-blue-100',
                purple: 'bg-purple-50 hover:bg-purple-100',
                green: 'bg-green-50 hover:bg-green-100',
                orange: 'bg-orange-50 hover:bg-orange-100',
                indigo: 'bg-indigo-50 hover:bg-indigo-100',
                cyan: 'bg-cyan-50 hover:bg-cyan-100'
              };

              const iconColors = {
                blue: 'bg-blue-100',
                purple: 'bg-purple-100',
                green: 'bg-green-100',
                orange: 'bg-orange-100',
                indigo: 'bg-indigo-100',
                cyan: 'bg-cyan-100'
              };

              return (
                <a
                  href={service.link}
                  class={`${bgColors[service.color as keyof typeof bgColors]} rounded-xl p-6 transition-all duration-200 hover:shadow-lg group cursor-pointer`}
                >
                  <div class={`w-16 h-16 ${iconColors[service.color as keyof typeof iconColors]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span class="text-3xl">{service.icon}</span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p class="text-gray-600 mb-4">{service.description}</p>
                  <div class="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                    {t('global_support.services.view_detail')}
                    <i class="fas fa-arrow-right ml-2"></i>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Access Section */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* 긴급 연락처 */}
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-phone-alt text-red-500 mr-3"></i>
              {t('global_support.emergency_contacts.title')}
            </h2>
            <div class="space-y-3">
              {emergencyContacts.map(contact => (
                <div class="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span class="text-2xl mr-3">{contact.icon}</span>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-900">{contact.title}</div>
                    <div class="text-blue-600 font-bold text-lg">{contact.number}</div>
                    <div class="text-sm text-gray-600">{contact.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 온라인 상담 신청 */}
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-comments text-blue-500 mr-3"></i>
              {t('global_support.online_consultation.title')}
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600" dangerouslySetInnerHTML={{__html: t('global_support.online_consultation.description')}}>
              </p>

              <div class="grid grid-cols-1 gap-3">
                <a href="/contact" class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-bold">
                  <i class="fas fa-edit mr-2"></i>
                  {t('global_support.online_consultation.inquiry')}
                </a>
              </div>

              <div class="pt-4 border-t border-gray-200 space-y-3">
                <div>
                  <div class="text-sm text-gray-600 mb-1">{t('global_support.online_consultation.email')}</div>
                  <a href="mailto:wow3d16@naver.com" class="font-semibold text-blue-600 hover:text-blue-800">wow3d16@naver.com</a>
                </div>

                <div>
                  <div class="text-sm text-gray-600 mb-1">{t('global_support.online_consultation.phone')}</div>
                  <div class="font-semibold text-gray-900">
                    {t('global_support.online_consultation.seoul')}: 02-3144-3137<br />
                    {t('global_support.online_consultation.gumi')}: 054-464-3137
                  </div>
                </div>

                <div>
                  <div class="text-sm text-gray-600 mb-1">{t('global_support.online_consultation.hours')}</div>
                  <div class="font-semibold text-gray-900">
                    {t('global_support.online_consultation.weekday')}<br />
                    {t('global_support.online_consultation.saturday')}<br />
                    <span class="text-red-500">{t('global_support.online_consultation.sunday')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div class="bg-white rounded-xl shadow-sm p-6 mb-12">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i class="fas fa-question-circle text-purple-500 mr-3"></i>
            {t('global_support.faq.title')}
          </h2>
          <div class="space-y-4">
            <details class="group">
              <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <span class="font-medium text-gray-900">{t('global_support.faq.visa_extension.question')}</span>
                <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
              </summary>
              <div class="p-4 text-gray-600">
                {t('global_support.faq.visa_extension.answer')}
              </div>
            </details>

            <details class="group">
              <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <span class="font-medium text-gray-900">{t('global_support.faq.bank_account.question')}</span>
                <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
              </summary>
              <div class="p-4 text-gray-600">
                {t('global_support.faq.bank_account.answer')}
              </div>
            </details>

            <details class="group">
              <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <span class="font-medium text-gray-900">{t('global_support.faq.part_time.question')}</span>
                <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
              </summary>
              <div class="p-4 text-gray-600">
                {t('global_support.faq.part_time.answer')}
              </div>
            </details>

            <details class="group">
              <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <span class="font-medium text-gray-900">{t('global_support.faq.visa_conversion.question')}</span>
                <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
              </summary>
              <div class="p-4 text-gray-600">
                {t('global_support.faq.visa_conversion.answer')}
              </div>
            </details>
          </div>

          <div class="mt-6 text-center">
            <button class="text-blue-600 font-medium hover:underline">
              {t('global_support.faq.view_more')}
            </button>
          </div>
        </div>

        {/* Notice Section */}
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-bullhorn text-orange-500 mr-3"></i>
            {t('global_support.notice.title')}
          </h2>
          <div class="space-y-3">
            <div class="flex items-start">
              <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded mr-3 mt-1">{t('global_support.notice.important')}</span>
              <div class="flex-1">
                <a href="#" class="font-medium text-gray-900 hover:text-blue-600">2024년 비자 정책 변경 안내</a>
                <div class="text-sm text-gray-600">2024.01.15</div>
              </div>
            </div>
            <div class="flex items-start">
              <span class="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded mr-3 mt-1">{t('global_support.notice.new')}</span>
              <div class="flex-1">
                <a href="#" class="font-medium text-gray-900 hover:text-blue-600">설날 연휴 상담 운영 안내</a>
                <div class="text-sm text-gray-600">2024.01.20</div>
              </div>
            </div>
            <div class="flex items-start">
              <span class="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded mr-3 mt-1">{t('global_support.notice.event')}</span>
              <div class="flex-1">
                <a href="#" class="font-medium text-gray-900 hover:text-blue-600">신규 회원 무료 상담 이벤트</a>
                <div class="text-sm text-gray-600">2024.01.10</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-gray-800 text-white mt-12 py-8">
        <div class="container mx-auto px-4 text-center">
          <p class="text-gray-400">© 2024 WOW-CAMPUS. All rights reserved.</p>
          <div class="mt-4 flex justify-center space-x-6">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">이용약관</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">고객센터</a>
          </div>
        </div>
      </footer>
    </div>,
    {
      title: "글로벌 지원 센터 | WOW-CAMPUS",
      description: "비자, 법률, 금융, 통신 등 외국인의 한국 생활에 필요한 모든 지원 서비스를 한 곳에서 확인하세요."
    }
  );
};
