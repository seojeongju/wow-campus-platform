/**
 * Page Component
 * Route: /support/visa
 * 비자 지원 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const { t } = c.get('i18n');

  // 비자 유형별 정보
  const visaTypes = [
    {
      type: 'D-2',
      title: t('global_support.visa.visa_types.d2.title'),
      description: t('global_support.visa.visa_types.d2.description'),
      features: [
        t('global_support.visa.visa_types.d2.feature1'),
        t('global_support.visa.visa_types.d2.feature2'),
        t('global_support.visa.visa_types.d2.feature3')
      ],
      documents: [
        t('global_support.visa.visa_types.d2.doc1'),
        t('global_support.visa.visa_types.d2.doc2'),
        t('global_support.visa.visa_types.d2.doc3'),
        t('global_support.visa.visa_types.d2.doc4'),
        t('global_support.visa.visa_types.d2.doc5')
      ]
    },
    {
      type: 'D-4',
      title: t('global_support.visa.visa_types.d4.title'),
      description: t('global_support.visa.visa_types.d4.description'),
      features: [
        t('global_support.visa.visa_types.d4.feature1'),
        t('global_support.visa.visa_types.d4.feature2'),
        t('global_support.visa.visa_types.d4.feature3')
      ],
      documents: [
        t('global_support.visa.visa_types.d4.doc1'),
        t('global_support.visa.visa_types.d4.doc2'),
        t('global_support.visa.visa_types.d4.doc3'),
        t('global_support.visa.visa_types.d4.doc4'),
        t('global_support.visa.visa_types.d4.doc5')
      ]
    },
    {
      type: 'D-10',
      title: t('global_support.visa.visa_types.d10.title'),
      description: t('global_support.visa.visa_types.d10.description'),
      features: [
        t('global_support.visa.visa_types.d10.feature1'),
        t('global_support.visa.visa_types.d10.feature2'),
        t('global_support.visa.visa_types.d10.feature3')
      ],
      documents: [
        t('global_support.visa.visa_types.d10.doc1'),
        t('global_support.visa.visa_types.d10.doc2'),
        t('global_support.visa.visa_types.d10.doc3'),
        t('global_support.visa.visa_types.d10.doc4'),
        t('global_support.visa.visa_types.d10.doc5')
      ]
    },
    {
      type: 'E-7',
      title: t('global_support.visa.visa_types.e7.title'),
      description: t('global_support.visa.visa_types.e7.description'),
      features: [
        t('global_support.visa.visa_types.e7.feature1'),
        t('global_support.visa.visa_types.e7.feature2'),
        t('global_support.visa.visa_types.e7.feature3')
      ],
      documents: [
        t('global_support.visa.visa_types.e7.doc1'),
        t('global_support.visa.visa_types.e7.doc2'),
        t('global_support.visa.visa_types.e7.doc3'),
        t('global_support.visa.visa_types.e7.doc4'),
        t('global_support.visa.visa_types.e7.doc5')
      ]
    }
  ];

  // 서비스 메뉴
  const serviceMenu = [
    { href: '/global-support/visa', label: t('global_support.visa.service_menu.visa'), active: true },
    { href: '/global-support/legal', label: t('global_support.visa.service_menu.legal'), active: false },
    { href: '/global-support/finance', label: t('global_support.visa.service_menu.finance'), active: false },
    { href: '/global-support/telecom', label: t('global_support.visa.service_menu.telecom'), active: false },
    { href: '/global-support/academic', label: t('global_support.visa.service_menu.academic'), active: false },
    { href: '/global-support/employment', label: t('global_support.visa.service_menu.employment'), active: false }
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
        {/* Breadcrumb */}
        <div class="mb-6">
          <div class="flex items-center text-sm text-gray-600">
            <a href="/home" class="hover:text-blue-600">{t('global_support.visa.page.breadcrumb_home')}</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <a href="/global-support" class="hover:text-blue-600">{t('global_support.visa.page.breadcrumb_global_support')}</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <span class="text-gray-900 font-medium">{t('global_support.visa.page.breadcrumb_visa')}</span>
          </div>
        </div>

        {/* Page Header */}
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <span class="text-4xl">💼</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold mb-2">{t('global_support.visa.page.title')}</h1>
              <p class="text-blue-100">{t('global_support.visa.page.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Service Navigation Tabs */}
        <div class="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div class="flex flex-wrap gap-2">
            {serviceMenu.map(item => (
              <a
                href={item.href}
                class={`px-4 py-2 rounded-lg font-medium transition-colors ${item.active
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div class="lg:col-span-2 space-y-8">
            {/* 서비스 소개 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">{t('global_support.visa.service_intro.title')}</h2>
              <div class="prose max-w-none text-gray-600">
                <p class="mb-4">
                  {t('global_support.visa.service_intro.description')}
                </p>
                <ul class="space-y-2">
                  <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>{t('global_support.visa.service_intro.feature1')}</span>
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>{t('global_support.visa.service_intro.feature2')}</span>
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>{t('global_support.visa.service_intro.feature3')}</span>
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>{t('global_support.visa.service_intro.feature4')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 비자 유형별 안내 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">{t('global_support.visa.visa_types.title')}</h2>
              <div class="space-y-6">
                {visaTypes.map(visa => (
                  <div class="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <div class="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-2">
                          {visa.type}
                        </div>
                        <h3 class="text-xl font-bold text-gray-900">{visa.title}</h3>
                        <p class="text-gray-600">{visa.description}</p>
                      </div>
                    </div>

                    <div class="mb-4">
                      <h4 class="font-semibold text-gray-900 mb-2">{t('global_support.visa.visa_types.features_title')}</h4>
                      <ul class="space-y-1">
                        {visa.features.map(feature => (
                          <li class="flex items-start text-sm text-gray-600">
                            <i class="fas fa-angle-right text-blue-500 mr-2 mt-1"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 class="font-semibold text-gray-900 mb-2">{t('global_support.visa.visa_types.documents_title')}</h4>
                      <div class="flex flex-wrap gap-2">
                        {visa.documents.map(doc => (
                          <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 신청 절차 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">{t('global_support.visa.application_process.title')}</h2>
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.visa.application_process.step1_title')}</h3>
                    <p class="text-gray-600">{t('global_support.visa.application_process.step1_desc')}</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.visa.application_process.step2_title')}</h3>
                    <p class="text-gray-600">{t('global_support.visa.application_process.step2_desc')}</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.visa.application_process.step3_title')}</h3>
                    <p class="text-gray-600">{t('global_support.visa.application_process.step3_desc')}</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.visa.application_process.step4_title')}</h3>
                    <p class="text-gray-600">{t('global_support.visa.application_process.step4_desc')}</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.visa.application_process.step5_title')}</h3>
                    <p class="text-gray-600">{t('global_support.visa.application_process.step5_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">{t('global_support.visa.faq.title')}</h2>
              <div class="space-y-4">
                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span class="font-medium text-gray-900">{t('global_support.visa.faq.q1_question')}</span>
                    <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="p-4 text-gray-600">
                    {t('global_support.visa.faq.q1_answer')}
                  </div>
                </details>

                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span class="font-medium text-gray-900">{t('global_support.visa.faq.q2_question')}</span>
                    <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="p-4 text-gray-600">
                    {t('global_support.visa.faq.q2_answer')}
                  </div>
                </details>

                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span class="font-medium text-gray-900">{t('global_support.visa.faq.q3_question')}</span>
                    <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="p-4 text-gray-600">
                    {t('global_support.visa.faq.q3_answer')}
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            {/* 상담 신청 */}
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">{t('global_support.visa.sidebar.consultation.title')}</h3>
              <div class="space-y-3">
                <a href="/contact" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-bold">
                  <i class="fas fa-edit mr-2"></i>
                  {t('global_support.visa.sidebar.consultation.button')}
                </a>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-600 mb-4">
                  {t('global_support.visa.sidebar.consultation.description')}
                </p>
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-clock text-blue-500 mr-2"></i>
                  <span>{t('global_support.visa.sidebar.consultation.hours')}</span>
                </div>
              </div>
            </div>

            {/* 관련 서비스 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">{t('global_support.visa.sidebar.related_services.title')}</h3>
              <div class="space-y-3">
                <a href="/global-support/legal" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex items-center">
                    <span class="text-2xl mr-3">⚖️</span>
                    <div>
                      <div class="font-medium text-gray-900">{t('global_support.visa.sidebar.related_services.legal_title')}</div>
                      <div class="text-sm text-gray-600">{t('global_support.visa.sidebar.related_services.legal_desc')}</div>
                    </div>
                  </div>
                </a>
                <a href="/global-support/employment" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex items-center">
                    <span class="text-2xl mr-3">💼</span>
                    <div>
                      <div class="font-medium text-gray-900">{t('global_support.visa.sidebar.related_services.employment_title')}</div>
                      <div class="text-sm text-gray-600">{t('global_support.visa.sidebar.related_services.employment_desc')}</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* 긴급 연락처 */}
            <div class="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 class="text-lg font-bold text-red-900 mb-3 flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                {t('global_support.visa.sidebar.emergency.title')}
              </h3>
              <div class="space-y-2 text-sm">
                <div>
                  <div class="font-semibold text-red-900">{t('global_support.visa.sidebar.emergency.immigration_title')}</div>
                  <div class="text-red-700">{t('global_support.visa.sidebar.emergency.immigration_number')}</div>
                </div>
                <div>
                  <div class="font-semibold text-red-900">{t('global_support.visa.sidebar.emergency.foreigner_center_title')}</div>
                  <div class="text-red-700">{t('global_support.visa.sidebar.emergency.foreigner_center_number')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-gray-800 text-white mt-12 py-8">
        <div class="container mx-auto px-4 text-center">
          <p class="text-gray-400">© 2024 WOW-CAMPUS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
