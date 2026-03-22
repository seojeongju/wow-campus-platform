/**
 * Page Component  
 * Route: /support/employment
 * 취업 지원 서비스 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const { t } = c.get('i18n');

  // 서비스 메뉴
  const serviceMenu = [
    { href: '/global-support/visa', label: t('global_support.visa.service_menu.visa'), active: false },
    { href: '/global-support/legal', label: t('global_support.visa.service_menu.legal'), active: false },
    { href: '/global-support/finance', label: t('global_support.visa.service_menu.finance'), active: false },
    { href: '/global-support/telecom', label: t('global_support.visa.service_menu.telecom'), active: false },
    { href: '/global-support/academic', label: t('global_support.visa.service_menu.academic'), active: false },
    { href: '/global-support/employment', label: t('global_support.visa.service_menu.employment'), active: true }
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
        {/* Breadcrumb */}
        <div class="mb-6">
          <div class="flex items-center text-sm text-gray-600">
            <a href="/home" class="hover:text-blue-600">{t('global_support.employment.page.breadcrumb_home')}</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <a href="/global-support" class="hover:text-blue-600">{t('global_support.employment.page.breadcrumb_global_support')}</a>
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <span class="text-gray-900 font-medium">{t('global_support.employment.page.breadcrumb_employment')}</span>
          </div>
        </div>

        {/* Page Header */}
        <div class="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-white p-8 mb-8">
          <div class="flex items-center">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <span class="text-4xl">💼</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold mb-2">{t('global_support.employment.page.title')}</h1>
              <p class="text-cyan-100">{t('global_support.employment.page.subtitle')}</p>
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
                  ? 'bg-cyan-600 text-white'
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
            {/* 제공 서비스 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">{t('global_support.employment.services.title')}</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.employment.services.resume.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.employment.services.resume.item1')}</li>
                    <li>• {t('global_support.employment.services.resume.item2')}</li>
                    <li>• {t('global_support.employment.services.resume.item3')}</li>
                    <li>• {t('global_support.employment.services.resume.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.employment.services.interview.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.employment.services.interview.item1')}</li>
                    <li>• {t('global_support.employment.services.interview.item2')}</li>
                    <li>• {t('global_support.employment.services.interview.item3')}</li>
                    <li>• {t('global_support.employment.services.interview.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.employment.services.visa_conversion.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.employment.services.visa_conversion.item1')}</li>
                    <li>• {t('global_support.employment.services.visa_conversion.item2')}</li>
                    <li>• {t('global_support.employment.services.visa_conversion.item3')}</li>
                    <li>• {t('global_support.employment.services.visa_conversion.item4')}</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="font-bold text-gray-900 mb-2">{t('global_support.employment.services.job_info.title')}</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• {t('global_support.employment.services.job_info.item1')}</li>
                    <li>• {t('global_support.employment.services.job_info.item2')}</li>
                    <li>• {t('global_support.employment.services.job_info.item3')}</li>
                    <li>• {t('global_support.employment.services.job_info.item4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 취업 준비 단계 */}
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">{t('global_support.employment.preparation_steps.title')}</h2>
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mr-4">1</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{t('global_support.employment.preparation_steps.step1_title')}</h3>
                    <p class="text-gray-600">{t('global_support.employment.preparation_steps.step1_desc')}</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mr-4">2</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{t('global_support.employment.preparation_steps.step2_title')}</h3>
                    <p class="text-gray-600">{t('global_support.employment.preparation_steps.step2_desc')}</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mr-4">3</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{t('global_support.employment.preparation_steps.step3_title')}</h3>
                    <p class="text-gray-600">{t('global_support.employment.preparation_steps.step3_desc')}</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mr-4">4</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{t('global_support.employment.preparation_steps.step4_title')}</h3>
                    <p class="text-gray-600">{t('global_support.employment.preparation_steps.step4_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 취업 성공률 높이는 TIP */}
            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 class="text-xl font-bold text-blue-900 mb-4">
                <i class="fas fa-rocket mr-2"></i>{t('global_support.employment.success_tips.title')}
              </h3>
              <ul class="space-y-2 text-blue-800">
                <li>{t('global_support.employment.success_tips.tip1')}</li>
                <li>{t('global_support.employment.success_tips.tip2')}</li>
                <li>{t('global_support.employment.success_tips.tip3')}</li>
                <li>{t('global_support.employment.success_tips.tip4')}</li>
                <li>{t('global_support.employment.success_tips.tip5')}</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-4">{t('global_support.employment.sidebar.consultation.title')}</h3>
              <div class="space-y-3">
                <a href="/contact" class="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center font-bold">
                  <i class="fas fa-edit mr-2"></i>
                  {t('global_support.employment.sidebar.consultation.button')}
                </a>
              </div>
              <div class="mt-6 pt-6 border-t">
                <p class="text-sm text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: t('global_support.employment.sidebar.consultation.description') }}></p>
                <h4 class="font-semibold mb-3">{t('global_support.employment.sidebar.consultation.popular_fields_title')}</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>{t('global_support.employment.sidebar.consultation.field1')}</p>
                  <p>{t('global_support.employment.sidebar.consultation.field2')}</p>
                  <p>{t('global_support.employment.sidebar.consultation.field3')}</p>
                  <p>{t('global_support.employment.sidebar.consultation.field4')}</p>
                </div>
              </div>
            </div>

            {/* 무료 서비스 */}
            <div class="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 class="text-lg font-bold text-green-900 mb-3">
                <i class="fas fa-check-circle mr-2"></i>{t('global_support.employment.sidebar.free_services.title')}
              </h3>
              <div class="space-y-2 text-sm text-green-800">
                <p>{t('global_support.employment.sidebar.free_services.item1')}</p>
                <p>{t('global_support.employment.sidebar.free_services.item2')}</p>
                <p>{t('global_support.employment.sidebar.free_services.item3')}</p>
                <p>{t('global_support.employment.sidebar.free_services.item4')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 상담 문의 연락처 */}
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-200 mt-8">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-phone-alt text-blue-600 mr-2"></i>
            {t('global_support.employment.contact.title')}
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-start">
              <i class="fas fa-envelope text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.employment.contact.email.label')}</div>
                <a href={`mailto:${t('global_support.employment.contact.email.address')}`} class="text-blue-600 hover:text-blue-800">{t('global_support.employment.contact.email.address')}</a>
              </div>
            </div>
            <div class="flex items-start">
              <i class="fas fa-phone text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.employment.contact.phone.label')}</div>
                <div class="text-gray-700">{t('global_support.employment.contact.phone.seoul')}</div>
                <div class="text-gray-700">{t('global_support.employment.contact.phone.gumi')}</div>
              </div>
            </div>
            <div class="flex items-start">
              <i class="fas fa-clock text-blue-500 mr-2 mt-1"></i>
              <div>
                <div class="font-semibold text-gray-900">{t('global_support.employment.contact.hours.label')}</div>
                <div class="text-gray-700">{t('global_support.employment.contact.hours.weekday')}</div>
                <div class="text-gray-700">{t('global_support.employment.contact.hours.saturday')}</div>
                <div class="text-red-600">{t('global_support.employment.contact.hours.sunday')}</div>
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
