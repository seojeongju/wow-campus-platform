/**
 * Page Component
 * Route: /study/graduate
 * Original: src/index.tsx lines 9012-9413
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
            <span class="text-gray-900">{t('study.breadcrumb.graduate')}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-user-graduate text-purple-600 text-3xl"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{t('study.graduate.title')}</h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">{t('study.graduate.subtitle')}</p>
        </div>

        {/* Content Sections */}
        <div class="max-w-4xl mx-auto space-y-12">
          {/* Program Types */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.graduate.program_types.title')}</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-graduation-cap text-blue-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">{t('study.graduate.program_types.master.title')}</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• {t('study.graduate.program_types.master.duration')}</li>
                  <li>• {t('study.graduate.program_types.master.credits')}</li>
                  <li>• {t('study.graduate.program_types.master.thesis')}</li>
                  <li>• {t('study.graduate.program_types.master.research')}</li>
                </ul>
              </div>
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-user-graduate text-purple-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">{t('study.graduate.program_types.phd.title')}</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• {t('study.graduate.program_types.phd.duration')}</li>
                  <li>• {t('study.graduate.program_types.phd.credits')}</li>
                  <li>• {t('study.graduate.program_types.phd.thesis')}</li>
                  <li>• {t('study.graduate.program_types.phd.research')}</li>
                </ul>
              </div>
              <div class="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-flask text-green-600 text-xl"></i>
                </div>
                <h3 class="text-xl font-semibold mb-3">{t('study.graduate.program_types.integrated.title')}</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• {t('study.graduate.program_types.integrated.duration')}</li>
                  <li>• {t('study.graduate.program_types.integrated.credits')}</li>
                  <li>• {t('study.graduate.integrated.continuous')}</li>
                  <li>• {t('study.graduate.integrated.long_term')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Research Areas */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.graduate.research_areas.title')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">{t('study.graduate.research_areas.science.title')}</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.research_areas.science.electronics.title')}</h4>
                    <p class="text-xs text-gray-600">{t('study.graduate.research_areas.science.electronics.desc')}</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.research_areas.science.computer.title')}</h4>
                    <p class="text-xs text-gray-600">{t('study.graduate.research_areas.science.computer.desc')}</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.research_areas.science.biotech.title')}</h4>
                    <p class="text-xs text-gray-600">{t('study.graduate.research_areas.science.biotech.desc')}</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.research_areas.science.materials.title')}</h4>
                    <p class="text-xs text-gray-600">{t('study.graduate.research_areas.science.materials.desc')}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">{t('study.graduate.research_areas.humanities.title')}</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.research_areas.humanities.international.title')}</h4>
                    <p class="text-xs text-gray-600">{t('study.graduate.research_areas.humanities.international.desc')}</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.research_areas.humanities.business.title')}</h4>
                    <p class="text-xs text-gray-600">{t('study.graduate.research_areas.humanities.business.desc')}</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.research_areas.humanities.korean_studies.title')}</h4>
                    <p class="text-xs text-gray-600">{t('study.graduate.research_areas.humanities.korean_studies.desc')}</p>
                  </div>
                  <div class="bg-gray-50 rounded p-3">
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.research_areas.humanities.education.title')}</h4>
                    <p class="text-xs text-gray-600">{t('study.graduate.research_areas.humanities.education.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Admission Process */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.graduate.admission.title')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">{t('study.graduate.admission.qualifications.title')}</h3>
                
                <div class="mb-6">
                  <h4 class="font-semibold mb-2">{t('study.graduate.admission.qualifications.master.title')}</h4>
                  <ul class="space-y-1 text-gray-600 text-sm">
                    <li>• {t('study.graduate.admission.qualifications.master.bachelor')}</li>
                    <li>• {t('study.graduate.admission.qualifications.master.gpa')}</li>
                    <li>• {t('study.graduate.admission.qualifications.master.major')}</li>
                  </ul>
                </div>
                
                <div class="mb-6">
                  <h4 class="font-semibold mb-2">{t('study.graduate.admission.qualifications.phd.title')}</h4>
                  <ul class="space-y-1 text-gray-600 text-sm">
                    <li>• {t('study.graduate.admission.qualifications.phd.master')}</li>
                    <li>• {t('study.graduate.admission.qualifications.phd.research_plan')}</li>
                    <li>• {t('study.graduate.admission.qualifications.phd.advisor')}</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-semibold mb-2">{t('study.graduate.admission.qualifications.language.title')}</h4>
                  <div class="space-y-2 text-sm">
                    <div class="bg-purple-50 rounded p-2">
                      <strong>{t('study.graduate.admission.qualifications.language.korean')}:</strong> {t('study.graduate.admission.qualifications.language.korean_requirement')}
                    </div>
                    <div class="bg-purple-50 rounded p-2">
                      <strong>{t('study.graduate.admission.qualifications.language.english')}:</strong> {t('study.graduate.admission.qualifications.language.english_requirement')}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">{t('study.graduate.admission.selection.title')}</h3>
                
                <div class="space-y-4">
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                      {t('study.graduate.admission.selection.document.title')}
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• {t('study.graduate.admission.selection.document.transcript')}</li>
                      <li>• {t('study.graduate.admission.selection.document.research_plan')}</li>
                      <li>• {t('study.graduate.admission.selection.document.recommendation')}</li>
                    </ul>
                  </div>
                  
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                      {t('study.graduate.admission.selection.interview.title')}
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• {t('study.graduate.admission.selection.interview.presentation')}</li>
                      <li>• {t('study.graduate.admission.selection.interview.qna')}</li>
                      <li>• {t('study.graduate.admission.selection.interview.language')}</li>
                    </ul>
                  </div>
                  
                  <div class="border rounded p-4">
                    <h4 class="font-semibold mb-2 flex items-center">
                      <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                      {t('study.graduate.admission.selection.written.title')}
                    </h4>
                    <ul class="text-sm text-gray-600 ml-10">
                      <li>• {t('study.graduate.admission.selection.written.major')}</li>
                      <li>• {t('study.graduate.admission.selection.written.methodology')}</li>
                      <li>• {t('study.graduate.admission.selection.written.optional')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Funding and Scholarships */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.graduate.funding.title')}</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-green-600">{t('study.graduate.funding.government.title')}</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.funding.government.bk21.title')}</h4>
                    <p class="text-xs text-gray-600 mb-1">{t('study.graduate.funding.government.bk21.desc')}</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{t('study.graduate.funding.government.bk21.amount')}</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.funding.government.gks.title')}</h4>
                    <p class="text-xs text-gray-600 mb-1">{t('study.graduate.funding.government.gks.desc')}</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{t('study.graduate.funding.government.gks.amount')}</span>
                  </div>
                </div>
              </div>
              
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-blue-600">{t('study.graduate.funding.university.title')}</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.funding.university.ra.title')}</h4>
                    <p class="text-xs text-gray-600 mb-1">{t('study.graduate.funding.university.ra.desc')}</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{t('study.graduate.funding.university.ra.amount')}</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.funding.university.ta.title')}</h4>
                    <p class="text-xs text-gray-600 mb-1">{t('study.graduate.funding.university.ta.desc')}</p>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{t('study.graduate.funding.university.ta.amount')}</span>
                  </div>
                </div>
              </div>
              
              <div class="border rounded-lg p-6">
                <h3 class="font-semibold text-lg mb-4 text-purple-600">{t('study.graduate.funding.other.title')}</h3>
                <div class="space-y-3">
                  <div>
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.funding.other.research.title')}</h4>
                    <p class="text-xs text-gray-600 mb-1">{t('study.graduate.funding.other.research.desc')}</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{t('study.graduate.funding.other.research.amount')}</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm mb-1">{t('study.graduate.funding.other.industry.title')}</h4>
                    <p class="text-xs text-gray-600 mb-1">{t('study.graduate.funding.other.industry.desc')}</p>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{t('study.graduate.funding.other.industry.amount')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Research Support */}
          <section class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">{t('study.graduate.facilities.title')}</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-microscope text-purple-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.graduate.facilities.lab.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.graduate.facilities.lab.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-book-open text-indigo-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.graduate.facilities.library.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.graduate.facilities.library.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-laptop text-blue-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.graduate.facilities.computing.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.graduate.facilities.computing.desc')}</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-globe text-green-600 text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">{t('study.graduate.facilities.international.title')}</h3>
                <p class="text-sm text-gray-600">{t('study.graduate.facilities.international.desc')}</p>
              </div>
            </div>
          </section>

          {/* Career Prospects */}
          <section class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold mb-6">{t('study.graduate.career.title')}</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">{t('study.graduate.career.academia.title')}</h3>
                <ul class="space-y-3">
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-chalkboard-teacher text-gray-400 mt-1"></i>
                    <div>
                      <strong>{t('study.graduate.career.academia.professor.title')}</strong>
                      <p class="text-sm text-gray-600">{t('study.graduate.career.academia.professor.desc')}</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-flask text-gray-400 mt-1"></i>
                    <div>
                      <strong>{t('study.graduate.career.academia.researcher.title')}</strong>
                      <p class="text-sm text-gray-600">{t('study.graduate.career.academia.researcher.desc')}</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-graduation-cap text-gray-400 mt-1"></i>
                    <div>
                      <strong>{t('study.graduate.career.academia.postdoc.title')}</strong>
                      <p class="text-sm text-gray-600">{t('study.graduate.career.academia.postdoc.desc')}</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4 text-purple-600">{t('study.graduate.career.industry.title')}</h3>
                <ul class="space-y-3">
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-building text-gray-400 mt-1"></i>
                    <div>
                      <strong>{t('study.graduate.career.industry.corporation.title')}</strong>
                      <p class="text-sm text-gray-600">{t('study.graduate.career.industry.corporation.desc')}</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-lightbulb text-gray-400 mt-1"></i>
                    <div>
                      <strong>{t('study.graduate.career.industry.startup.title')}</strong>
                      <p class="text-sm text-gray-600">{t('study.graduate.career.industry.startup.desc')}</p>
                    </div>
                  </li>
                  <li class="flex items-start space-x-3">
                    <i class="fas fa-chart-line text-gray-400 mt-1"></i>
                    <div>
                      <strong>{t('study.graduate.career.industry.consulting.title')}</strong>
                      <p class="text-sm text-gray-600">{t('study.graduate.career.industry.consulting.desc')}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div class="text-center">
            <button onclick={`toast.info('${t('study.graduate.actions.coming_soon')}')`} class="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold mr-4">
              {t('study.graduate.actions.apply_now')}
            </button>
            <a href="/study" class="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              {t('study.graduate.actions.back')}
            </a>
          </div>
        </div>
      </main>
    </div>
  )

// Job Seekers page (구직정보 보기)
// 구직자 페이지 - 로그인 사용자만 접근 가능
}

// Middleware: none
