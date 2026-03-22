/**
 * Page Component
 * Route: /study/undergraduate
 * Original: src/index.tsx lines 8690-9011
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
            <span class="text-gray-900">{t('study.breadcrumb.undergraduate')}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-university text-blue-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{t('study.undergraduate.title')}</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">{t('study.undergraduate.subtitle')}</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Popular Majors */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.undergraduate.popular_majors.title')}</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-laptop-code text-blue-600"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.popular_majors.computer')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.popular_majors.computer_desc')}</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-chart-line text-green-600"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.popular_majors.business')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.popular_majors.business_desc')}</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-cog text-purple-600"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.popular_majors.engineering')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.popular_majors.engineering_desc')}</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-heartbeat text-red-600"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.popular_majors.medical')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.popular_majors.medical_desc')}</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-palette text-yellow-600"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.majors.arts')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.majors.arts_desc')}</p>
              </div>
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                  <i class="fas fa-globe text-indigo-600"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.majors.international')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.majors.international_desc')}</p>
              </div>
            </div>
          </section>

          {/* Admission Requirements */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.undergraduate.admission.title')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">{t('study.undergraduate.admission.academic.title')}</h3>
                <ul class="space-y-3 text-gray-600">
                  <li>• {t('study.undergraduate.admission.academic.high_school')}</li>
                  <li>• {t('study.undergraduate.admission.academic.education')}</li>
                  <li>• {t('study.undergraduate.admission.academic.gpa')}</li>
                  <li>• {t('study.undergraduate.admission.academic.diploma')}</li>
                </ul>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">{t('study.undergraduate.admission.language.title')}</h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded p-3">
                    <strong>{t('study.undergraduate.admission.language.korean_track')}:</strong> {t('study.undergraduate.admission.language.korean_requirement')}
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <strong>{t('study.undergraduate.admission.language.english_track')}:</strong> {t('study.undergraduate.admission.language.english_requirement')}
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">{t('study.undergraduate.admission.documents.title')}</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• {t('study.undergraduate.admission.documents.application')}</li>
                  <li>• {t('study.undergraduate.admission.documents.personal_statement')}</li>
                  <li>• {t('study.undergraduate.admission.documents.study_plan')}</li>
                  <li>• {t('study.undergraduate.admission.documents.recommendation')}</li>
                  <li>• {t('study.undergraduate.admission.documents.passport')}</li>
                  <li>• {t('study.undergraduate.admission.documents.photo')}</li>
                  <li>• {t('study.undergraduate.admission.documents.financial')}</li>
                </ul>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">{t('study.undergraduate.admission.selection.title')}</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• {t('study.undergraduate.admission.selection.document')}</li>
                  <li>• {t('study.undergraduate.admission.selection.interview')}</li>
                  <li>• {t('study.undergraduate.admission.selection.portfolio')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Costs and Scholarships */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.undergraduate.costs.title')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">{t('study.undergraduate.costs.tuition.title')}</h3>
                <div class="space-y-3">
                  <div class="flex justify-between border-b pb-2">
                    <span>{t('study.undergraduate.costs.tuition.admission_fee')}</span>
                    <span class="font-semibold">200만원 ~ 500만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>{t('study.undergraduate.costs.tuition.humanities')}</span>
                    <span class="font-semibold">400만원 ~ 800만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>{t('study.undergraduate.costs.tuition.science')}</span>
                    <span class="font-semibold">500만원 ~ 1,000만원</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span>{t('study.undergraduate.costs.tuition.medical')}</span>
                    <span class="font-semibold">800만원 ~ 1,500만원</span>
                  </div>
                </div>

                <h3 class="text-lg font-semibold mb-4 mt-6 text-blue-600">{t('study.undergraduate.costs.living.title')}</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.costs.living.dormitory')}</span>
                    <span>30만원 ~ 50만원</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.costs.living.food')}</span>
                    <span>30만원 ~ 40만원</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.costs.living.other')}</span>
                    <span>20만원 ~ 30만원</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">{t('study.undergraduate.costs.scholarship.title')}</h3>
                <div class="space-y-4">
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">{t('study.undergraduate.costs.scholarship.gks.title')}</h4>
                    <p class="text-sm text-gray-600 mb-2">{t('study.undergraduate.costs.scholarship.gks.desc')}</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{t('study.undergraduate.costs.scholarship.gks.amount')}</span>
                  </div>
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">{t('study.undergraduate.costs.scholarship.university.title')}</h4>
                    <p class="text-sm text-gray-600 mb-2">{t('study.undergraduate.costs.scholarship.university.desc')}</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{t('study.undergraduate.costs.scholarship.university.amount')}</span>
                  </div>
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2">{t('study.undergraduate.costs.scholarship.exchange.title')}</h4>
                    <p class="text-sm text-gray-600 mb-2">{t('study.undergraduate.costs.scholarship.exchange.desc')}</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{t('study.undergraduate.costs.scholarship.exchange.amount')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Services */}
          <section class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">{t('study.undergraduate.support.title')}</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-user-friends text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.support.mentoring.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.support.mentoring.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-stethoscope text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.support.health.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.support.health.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-briefcase text-yellow-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.support.career.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.support.career.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-calendar-alt text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.undergraduate.support.culture.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.undergraduate.support.culture.desc')}</p>
              </div>
            </div>
          </section>

          {/* Application Timeline */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.undergraduate.timeline.title')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">{t('study.undergraduate.timeline.spring.title')}</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.timeline.spring.application')}:</span>
                    <span class="font-semibold">9월 1일 - 11월 30일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.timeline.spring.review')}:</span>
                    <span class="font-semibold">12월 1일 - 12월 15일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.timeline.spring.interview')}:</span>
                    <span class="font-semibold">12월 20일 - 1월 10일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.timeline.spring.result')}:</span>
                    <span class="font-semibold">1월 20일</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-blue-600">{t('study.undergraduate.timeline.fall.title')}</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.timeline.fall.application')}:</span>
                    <span class="font-semibold">3월 1일 - 5월 31일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.timeline.fall.review')}:</span>
                    <span class="font-semibold">6월 1일 - 6월 15일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.timeline.fall.interview')}:</span>
                    <span class="font-semibold">6월 20일 - 7월 10일</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{t('study.undergraduate.timeline.fall.result')}:</span>
                    <span class="font-semibold">7월 20일</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick={`toast.info('${t('study.undergraduate.actions.coming_soon')}')`} class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mr-4">
              {t('study.undergraduate.actions.apply_now')}
            </button>
            <a href="/study" class="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              {t('study.undergraduate.actions.back')}
            </a>
          </div>
        </div>
      </main>
    </div>
  )

// Graduate Program Detail
}

// Middleware: none
