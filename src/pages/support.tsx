/**
 * Page Component
 * Route: /support
 * Original: src/index.tsx lines 12974-13049
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  const { t } = c.get('i18n');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
            <a href="/home" class="text-blue-600 hover:text-blue-800">{t('support.back_to_home')}</a>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{t('support.title')}</h1>
          <p class="text-gray-600 text-lg">{t('support.subtitle')}</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-envelope text-2xl text-blue-600"></i>
            </div>
            <h3 class="font-semibold mb-2">{t('support.email.title')}</h3>
            <p class="text-gray-600 mb-4">{t('support.email.address')}</p>
            <a href="mailto:wow3d16@naver.com" class="text-blue-600 hover:text-blue-800">{t('support.email.send')}</a>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-phone text-2xl text-green-600"></i>
            </div>
            <h3 class="font-semibold mb-2">{t('support.phone.title')}</h3>
            <p class="text-gray-600 mb-2">{t('support.phone.seoul')}</p>
            <p class="text-gray-600 mb-4">{t('support.phone.gumi')}</p>
            <span class="text-green-600">{t('support.phone.hours')}</span>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-edit text-2xl text-purple-600"></i>
            </div>
            <h3 class="font-semibold mb-2">{t('support.online.title')}</h3>
            <p class="text-gray-600 mb-4">{t('support.online.description')}</p>
            <a href="/contact" class="text-purple-600 hover:text-purple-800 font-bold">{t('support.online.inquiry')}</a>
          </div>
        </div>

        <div class="bg-white p-8 rounded-lg shadow-sm">
          <h2 class="text-2xl font-bold mb-6">{t('support.faq.title')}</h2>
          <div class="space-y-4">
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">{t('support.faq.signup.question')}</h4>
              <p class="text-gray-600">{t('support.faq.signup.answer')}</p>
            </div>
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">{t('support.faq.job_posting_cost.question')}</h4>
              <p class="text-gray-600">{t('support.faq.job_posting_cost.answer')}</p>
            </div>
            <div class="border-b pb-4">
              <h4 class="font-semibold mb-2">{t('support.faq.visa_support.question')}</h4>
              <p class="text-gray-600">{t('support.faq.visa_support.answer')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
