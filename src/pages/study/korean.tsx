/**
 * Page Component
 * Route: /study/korean
 * Original: src/index.tsx lines 8428-8689
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
  const { t } = c.get('i18n');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              {t('common.login')}
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {t('common.register')}
            </button>
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div class="bg-white border-b">
        <div class="container mx-auto px-4 py-3">
          <nav class="flex items-center space-x-2 text-sm">
            <a href="/home" class="text-gray-500 hover:text-blue-600">{t('study.breadcrumb.home')}</a>
            <span class="text-gray-400">/</span>
            <a href="/study" class="text-gray-500 hover:text-blue-600">{t('study.breadcrumb.study')}</a>
            <span class="text-gray-400">/</span>
            <span class="text-gray-900">{t('study.breadcrumb.korean')}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-graduation-cap text-green-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{t('study.korean_language.title')} {t('common.program')}</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">{t('study.korean_language.subtitle')}</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Program Overview */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.korean_language.title')} {t('common.overview')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-3 text-green-600">{t('study.korean_language.class_method.title')}</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• {t('study.korean_language.features.level_1_2')}</li>
                  <li>• {t('study.korean_language.features.level_3_4')}</li>
                  <li>• {t('study.korean_language.features.level_5_6')}</li>
                  <li>• {t('study.korean_language.features.special')}</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-3 text-green-600">{t('study.korean_language.class_method.title')}</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• {t('study.korean_language.class_method.small_class')}</li>
                  <li>• {t('study.korean_language.class_method.native_teacher')}</li>
                  <li>• {t('study.korean_language.class_method.integrated')}</li>
                  <li>• {t('study.korean_language.class_method.culture')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Course Schedule */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.korean_language.schedule.title')}</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">{t('study.korean_language.schedule.regular')}</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><strong>{t('study.korean_language.schedule.spring').split(':')[0]}:</strong> {t('study.korean_language.schedule.spring').split(':')[1]}</li>
                  <li><strong>{t('study.korean_language.schedule.summer').split(':')[0]}:</strong> {t('study.korean_language.schedule.summer').split(':')[1]}</li>
                  <li><strong>{t('study.korean_language.schedule.fall').split(':')[0]}:</strong> {t('study.korean_language.schedule.fall').split(':')[1]}</li>
                  <li><strong>{t('study.korean_language.schedule.winter').split(':')[0]}:</strong> {t('study.korean_language.schedule.winter').split(':')[1]}</li>
                </ul>
              </div>
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">{t('study.korean_language.schedule.class_time')}</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><strong>{t('study.korean_language.schedule.morning')}:</strong> 09:00 - 13:00</li>
                  <li><strong>{t('study.korean_language.schedule.afternoon')}:</strong> 14:00 - 18:00</li>
                  <li><strong>{t('study.korean_language.schedule.per_week')}:</strong> 20 {t('study.korean_language.schedule.hours')} (월-금)</li>
                  <li><strong>{t('study.korean_language.schedule.per_semester')}:</strong> 200 {t('study.korean_language.schedule.hours')}</li>
                </ul>
              </div>
              <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">{t('study.korean_language.schedule.special_program')}</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• {t('study.korean_language.schedule.culture_experience')}</li>
                  <li>• {t('study.korean_language.schedule.field_trip')}</li>
                  <li>• {t('study.korean_language.schedule.language_exchange')}</li>
                  <li>• {t('study.korean_language.schedule.mentoring')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Fees and Requirements */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.korean_language.application.title')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">{t('study.korean_language.application.tuition')}</h3>
                <div class="space-y-3">
                  <div class="flex justify-between border-b pb-2">
                    <span>{t('study.korean_language.application.registration_fee')}</span>
                    <span class="font-semibold">50,000원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>{t('study.korean_language.application.tuition_per_semester')}</span>
                    <span class="font-semibold">1,200,000원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>{t('study.korean_language.application.textbook_fee')}</span>
                    <span class="font-semibold">100,000원</span>
                  </div>
                  <div class="flex justify-between font-bold text-lg">
                    <span>{t('study.korean_language.application.total_cost')}</span>
                    <span class="text-green-600">1,350,000원</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">{t('study.korean_language.application.qualifications.title')}</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• {t('study.korean_language.application.qualifications.education')}</li>
                  <li>• {t('study.korean_language.application.qualifications.age')}</li>
                  <li>• {t('study.korean_language.application.qualifications.motivation')}</li>
                  <li>• {t('study.korean_language.application.qualifications.english')}</li>
                </ul>
                
                <h3 class="text-lg font-semibold mb-4 mt-6 text-green-600">{t('study.korean_language.application.documents.title')}</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• {t('study.korean_language.application.documents.application')}</li>
                  <li>• {t('study.korean_language.application.documents.diploma')}</li>
                  <li>• {t('study.korean_language.application.documents.passport')}</li>
                  <li>• {t('study.korean_language.application.documents.photo')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">{t('study.korean_language.benefits.title')}</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-certificate text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.korean_language.benefits.certificate.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.korean_language.benefits.certificate.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-home text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.korean_language.benefits.dormitory.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.korean_language.benefits.dormitory.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-users text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.korean_language.benefits.mentoring.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.korean_language.benefits.mentoring.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-graduation-cap text-yellow-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.korean_language.benefits.advancement.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.korean_language.benefits.advancement.desc')}</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.korean_language.contact.title')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">{t('study.korean_language.contact.contact_info')}</h3>
                <div class="space-y-3">
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-phone text-gray-400 w-5"></i>
                    <span>{t('study.korean_language.contact.phone')}</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-envelope text-gray-400 w-5"></i>
                    <span>{t('study.korean_language.contact.email')}</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-map-marker-alt text-gray-400 w-5"></i>
                    <span>{t('study.korean_language.contact.address')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-green-600">{t('study.korean_language.contact.deadline.title')}</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>{t('study.korean_language.contact.deadline.spring')}:</span>
                    <span class="font-semibold">1월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.korean_language.contact.deadline.summer')}:</span>
                    <span class="font-semibold">4월 30일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.korean_language.contact.deadline.fall')}:</span>
                    <span class="font-semibold">7월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.korean_language.contact.deadline.winter')}:</span>
                    <span class="font-semibold">10월 31일</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick={`toast.info('${t('study.korean_language.actions.coming_soon')}')`} class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold mr-4">
              {t('study.korean_language.actions.apply_now')}
            </button>
            <a href="/study" class="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              {t('study.korean_language.actions.back')}
            </a>
          </div>
        </div>
      </main>
    </div>
  )

// Undergraduate Program Detail
}

// Middleware: none
