/**
 * Page Component
 * Route: /support/legal
 * 법률 지원 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const { t } = c.get('i18n');

  // 서비스 메뉴
  const serviceMenu = [
    { href: '/global-support/visa', label: t('global_support.visa.service_menu.visa'), active: false },
    { href: '/global-support/legal', label: t('global_support.visa.service_menu.legal'), active: true },
    { href: '/global-support/finance', label: t('global_support.visa.service_menu.finance'), active: false },
    { href: '/global-support/telecom', label: t('global_support.visa.service_menu.telecom'), active: false },
    { href: '/global-support/academic', label: t('global_support.visa.service_menu.academic'), active: false },
    { href: '/global-support/employment', label: t('global_support.visa.service_menu.employment'), active: false }
  ];

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header - 동일한 구조 */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            {/* Logo */}
            <a href="/home" class="flex items-center space-x-3 flex-shrink-0">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>

          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8"></div>
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3"></div>
        </nav>

        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200"></div>
            <div id="mobile-auth-buttons" class="pt-3"></div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div class="mb-6">
          <div class="flex items-center text-sm text-gray-600">
            <a href="/home" class="hover:text-blue-600">{t('global_support.legal.page.breadcrumb_home')}</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <a href="/global-support" class="hover:text-blue-600">{t('global_support.legal.page.breadcrumb_global_support')}</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <span class="text-gray-900 font-medium">{t('global_support.legal.page.breadcrumb_legal')}</span>
          </div>
        </div>

        {/* Page Header */}
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <span class="text-4xl">⚖️</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold mb-2">{t('global_support.legal.page.title')}</h1>
              <p class="text-purple-100">{t('global_support.legal.page.subtitle')}</p>
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
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            {/* 서비스 소개 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">{t('global_support.legal.service_intro.title')}</h2>
              <div class="prose max-w-none text-gray-600">
                <p class="mb-4">
                  {t('global_support.legal.service_intro.description')}
                </p>
                <ul class="space-y-2">
                  <li class="flex items-start"><i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>{t('global_support.legal.service_intro.feature1')}</span></li>
                  <li class="flex items-start"><i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>{t('global_support.legal.service_intro.feature2')}</span></li>
                  <li class="flex items-start"><i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>{t('global_support.legal.service_intro.feature3')}</span></li>
                  <li class="flex items-start"><i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>{t('global_support.legal.service_intro.feature4')}</span></li>
                </ul>
              </div>
            </div>

            {/* 주요 지원 분야 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">{t('global_support.legal.support_areas.title')}</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.legal.support_areas.labor.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.legal.support_areas.labor.item1')}</li>
                    <li>• {t('global_support.legal.support_areas.labor.item2')}</li>
                    <li>• {t('global_support.legal.support_areas.labor.item3')}</li>
                    <li>• {t('global_support.legal.support_areas.labor.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.legal.support_areas.housing.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.legal.support_areas.housing.item1')}</li>
                    <li>• {t('global_support.legal.support_areas.housing.item2')}</li>
                    <li>• {t('global_support.legal.support_areas.housing.item3')}</li>
                    <li>• {t('global_support.legal.support_areas.housing.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.legal.support_areas.civil.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.legal.support_areas.civil.item1')}</li>
                    <li>• {t('global_support.legal.support_areas.civil.item2')}</li>
                    <li>• {t('global_support.legal.support_areas.civil.item3')}</li>
                    <li>• {t('global_support.legal.support_areas.civil.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.legal.support_areas.other.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.legal.support_areas.other.item1')}</li>
                    <li>• {t('global_support.legal.support_areas.other.item2')}</li>
                    <li>• {t('global_support.legal.support_areas.other.item3')}</li>
                    <li>• {t('global_support.legal.support_areas.other.item4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">{t('global_support.legal.faq.title')}</h2>
              <div class="space-y-4">
                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span class="font-medium text-gray-900">{t('global_support.legal.faq.q1_question')}</span>
                    <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="p-4 text-gray-600">
                    {t('global_support.legal.faq.q1_answer')}
                  </div>
                </details>
                <details class="group">
                  <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span class="font-medium text-gray-900">{t('global_support.legal.faq.q2_question')}</span>
                    <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="p-4 text-gray-600">
                    {t('global_support.legal.faq.q2_answer')}
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">{t('global_support.legal.sidebar.consultation.title')}</h3>
              <div class="space-y-3">
                <a href="/contact" class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-bold">
                  <i class="fas fa-edit mr-2"></i>
                  {t('global_support.legal.sidebar.consultation.button')}
                </a>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-600 mb-4">
                  {t('global_support.legal.sidebar.consultation.description')}
                </p>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>{t('global_support.legal.sidebar.consultation.benefit1')}</p>
                  <p>{t('global_support.legal.sidebar.consultation.benefit2')}</p>
                  <p>{t('global_support.legal.sidebar.consultation.benefit3')}</p>
                </div>
              </div>
            </div>

            <div class="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 class="text-lg font-bold text-red-900 mb-3 flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                {t('global_support.legal.sidebar.emergency.title')}
              </h3>
              <div class="space-y-2 text-sm">
                <div>
                  <div class="font-semibold text-red-900">{t('global_support.legal.sidebar.emergency.labor_title')}</div>
                  <div class="text-red-700">{t('global_support.legal.sidebar.emergency.labor_number')}</div>
                </div>
                <div>
                  <div class="font-semibold text-red-900">{t('global_support.legal.sidebar.emergency.legal_aid_title')}</div>
                  <div class="text-red-700">{t('global_support.legal.sidebar.emergency.legal_aid_number')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상담 문의 연락처 */}
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-phone-alt text-blue-600 mr-2"></i>
            {t('global_support.legal.contact.title')}
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-start">
              <i class="fas fa-envelope text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.legal.contact.email.label')}</div>
                <a href={`mailto:${t('global_support.legal.contact.email.address')}`} class="text-blue-600 hover:text-blue-800">{t('global_support.legal.contact.email.address')}</a>
              </div>
            </div>
            <div class="flex items-start">
              <i class="fas fa-phone text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.legal.contact.phone.label')}</div>
                <div class="text-gray-700">{t('global_support.legal.contact.phone.seoul')}</div>
                <div class="text-gray-700">{t('global_support.legal.contact.phone.gumi')}</div>
              </div>
            </div>
            <div class="flex items-start">
              <i class="fas fa-clock text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.legal.contact.hours.label')}</div>
                <div class="text-gray-700">{t('global_support.legal.contact.hours.weekday')}</div>
                <div class="text-gray-700">{t('global_support.legal.contact.hours.saturday')}</div>
                <div class="text-red-600">{t('global_support.legal.contact.hours.sunday')}</div>
              </div>
            </div>
          </div>
        </div>


      </main>

      <footer class="bg-gray-800 text-white mt-12 py-8">
        <div class="container mx-auto px-4 text-center">
          <p class="text-gray-400">© 2024 WOW-CAMPUS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
