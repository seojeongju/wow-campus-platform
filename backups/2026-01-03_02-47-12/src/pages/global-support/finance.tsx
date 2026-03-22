/**
 * Page Component  
 * Route: /support/finance
 * 금융 지원 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const { t } = c.get('i18n');

  // 서비스 메뉴
  const serviceMenu = [
    { href: '/global-support/visa', label: t('global_support.visa.service_menu.visa'), active: false },
    { href: '/global-support/legal', label: t('global_support.visa.service_menu.legal'), active: false },
    { href: '/global-support/finance', label: t('global_support.visa.service_menu.finance'), active: true },
    { href: '/global-support/telecom', label: t('global_support.visa.service_menu.telecom'), active: false },
    { href: '/global-support/academic', label: t('global_support.visa.service_menu.academic'), active: false },
    { href: '/global-support/employment', label: t('global_support.visa.service_menu.employment'), active: false }
  ];

  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            {/* Logo */}
            <a href="/home" class="flex items-center space-x-3 flex-shrink-0">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8"></div>
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600"><i class="fas fa-bars text-2xl"></i></button>
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3"></div>
        </nav>
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b"></div>
            <div id="mobile-auth-buttons" class="pt-3"></div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8">
        <div class="mb-6">
          <div class="flex items-center text-sm text-gray-600">
            <a href="/home" class="hover:text-blue-600">{t('global_support.finance.page.breadcrumb_home')}</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <a href="/global-support" class="hover:text-blue-600">{t('global_support.finance.page.breadcrumb_global_support')}</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <span class="text-gray-900 font-medium">{t('global_support.finance.page.breadcrumb_finance')}</span>
          </div>
        </div>

        <div class="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center"><div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4"><span class="text-4xl">💳</span></div>
            <div>
              <h1 class="text-3xl font-bold mb-2">{t('global_support.finance.page.title')}</h1>
              <p class="text-green-100">{t('global_support.finance.page.subtitle')}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div class="flex flex-wrap gap-2">
            {serviceMenu.map(item => (
              <a
                href={item.href}
                class={`px-4 py-2 rounded-lg font-medium transition-colors ${item.active
                  ? 'bg-green-600 text-white'
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
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">{t('global_support.finance.services.title')}</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.finance.services.bank_account.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.finance.services.bank_account.item1')}</li>
                    <li>• {t('global_support.finance.services.bank_account.item2')}</li>
                    <li>• {t('global_support.finance.services.bank_account.item3')}</li>
                    <li>• {t('global_support.finance.services.bank_account.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.finance.services.remittance.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.finance.services.remittance.item1')}</li>
                    <li>• {t('global_support.finance.services.remittance.item2')}</li>
                    <li>• {t('global_support.finance.services.remittance.item3')}</li>
                    <li>• {t('global_support.finance.services.remittance.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.finance.services.credit_card.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.finance.services.credit_card.item1')}</li>
                    <li>• {t('global_support.finance.services.credit_card.item2')}</li>
                    <li>• {t('global_support.finance.services.credit_card.item3')}</li>
                    <li>• {t('global_support.finance.services.credit_card.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.finance.services.mobile.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.finance.services.mobile.item1')}</li>
                    <li>• {t('global_support.finance.services.mobile.item2')}</li>
                    <li>• {t('global_support.finance.services.mobile.item3')}</li>
                    <li>• {t('global_support.finance.services.mobile.item4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">{t('global_support.finance.account_opening.title')}</h2>
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.finance.account_opening.step1_title')}</h3>
                    <p class="text-gray-600">{t('global_support.finance.account_opening.step1_desc')}</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.finance.account_opening.step2_title')}</h3>
                    <p class="text-gray-600">{t('global_support.finance.account_opening.step2_desc')}</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.finance.account_opening.step3_title')}</h3>
                    <p class="text-gray-600">{t('global_support.finance.account_opening.step3_desc')}</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{t('global_support.finance.account_opening.step4_title')}</h3>
                    <p class="text-gray-600">{t('global_support.finance.account_opening.step4_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">{t('global_support.finance.sidebar.consultation.title')}</h3>
              <div class="space-y-3">
                <a href="/contact" class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-bold">
                  <i class="fas fa-edit mr-2"></i>
                  {t('global_support.finance.sidebar.consultation.button')}
                </a>
              </div>
              <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-600 mb-4">
                  {t('global_support.finance.sidebar.consultation.description')}
                </p>
                <h4 class="font-semibold mb-3">{t('global_support.finance.sidebar.consultation.recommended_banks_title')}</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>{t('global_support.finance.sidebar.consultation.bank1')}</p>
                  <p>{t('global_support.finance.sidebar.consultation.bank2')}</p>
                  <p>{t('global_support.finance.sidebar.consultation.bank3')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상담 문의 연락처 */}
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-phone-alt text-blue-600 mr-2"></i>
            {t('global_support.finance.contact.title')}
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-start">
              <i class="fas fa-envelope text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.finance.contact.email.label')}</div>
                <a href={`mailto:${t('global_support.finance.contact.email.address')}`} class="text-blue-600 hover:text-blue-800">{t('global_support.finance.contact.email.address')}</a>
              </div>
            </div>
            <div class="flex items-start">
              <i class="fas fa-phone text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.finance.contact.phone.label')}</div>
                <div class="text-gray-700">{t('global_support.finance.contact.phone.seoul')}</div>
                <div class="text-gray-700">{t('global_support.finance.contact.phone.gumi')}</div>
              </div>
            </div>
            <div class="flex items-start">
              <i class="fas fa-clock text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.finance.contact.hours.label')}</div>
                <div class="text-gray-700">{t('global_support.finance.contact.hours.weekday')}</div>
                <div class="text-gray-700">{t('global_support.finance.contact.hours.saturday')}</div>
                <div class="text-red-600">{t('global_support.finance.contact.hours.sunday')}</div>
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
