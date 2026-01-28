/**
 * Page Component
 * Route: /jobs/:id
 * Original: src/index.tsx lines 7469-7783
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'

export const handler = async (c: Context) => {
  const jobId = c.req.param('id');
  const { t } = c.get('i18n');
  const lang = c.get('locale') || 'ko';
  
  // Get translations from i18n middleware (already loaded)
  // We'll inject them via script tag, so we need to read the files
  // But to avoid build issues, we'll use a different approach
  // The translations will be injected via the script tag using the locale
  
  return c.render(
    <html lang={lang}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t('jobs.detail.title')} - WOW-CAMPUS</title>
        <link rel="stylesheet" href="https://cdn.tailwindcss.com" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="/static/app.js"></script>
      </head>
      <body class="min-h-screen bg-gray-50">
        {/* Header */}
        <header class="bg-white shadow-sm sticky top-0 z-50">
          <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <a href="/home" class="flex items-center space-x-3">
                <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
              </a>
            </div>
            
            <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
              {/* 동적 메뉴 */}
            </div>
            
                      
          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
          
          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
              <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                {t('common.login')}
              </button>
              <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                {t('common.register')}
              </button>
            </div>
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
          {/* Back Button */}
          <div class="mb-6">
            <a href="/jobs" class="inline-flex items-center text-blue-600 hover:text-blue-800">
              <i class="fas fa-arrow-left mr-2"></i>
              {t('jobs.detail.back_to_list')}
            </a>
          </div>

          {/* Job Detail Container */}
          <div id="job-detail-container" class="bg-white rounded-lg shadow-sm">
            {/* Loading State */}
            <div class="p-12 text-center">
              <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p class="text-gray-600">{t('jobs.detail.loading')}</p>
            </div>
          </div>
        </main>

        <script dangerouslySetInnerHTML={{
          __html: `
          const jobId = ${jobId};
          window.locale = '${lang}';
          // Translations should already be injected by renderer
          // If not, define a fallback
          if (!window.translations) {
            console.warn('Translations not loaded by renderer');
            window.translations = {};
          }
          // Ensure window.t function exists
          if (!window.t) {
            window.t = function(key) {
              const keys = key.split('.');
              let value = window.translations;
              for (const k of keys) {
                value = value && value[k];
              }
              return value || key;
            };
          }
          
          // Define toast and showConfirm functions inline to avoid loading issues
          if (!window.toast) {
            window.toast = {
              success: (msg) => {
                const div = document.createElement('div');
                div.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                div.textContent = msg;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 3000);
              },
              error: (msg) => {
                const div = document.createElement('div');
                div.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                div.textContent = msg;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 3000);
              }
            };
          }
          
          if (!window.showConfirm) {
            window.showConfirm = function({ title, message, confirmText = window.t('common.confirm'), cancelText = window.t('common.cancel'), onConfirm, onCancel }) {
              // Create modal elements
              const overlay = document.createElement('div');
              overlay.id = 'confirm-modal';
              overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
              
              const modal = document.createElement('div');
              modal.className = 'bg-white rounded-lg shadow-xl max-w-md w-full p-6';
              
              const header = document.createElement('div');
              header.className = 'mb-4';
              
              const titleEl = document.createElement('h3');
              titleEl.className = 'text-xl font-bold text-gray-900 mb-2';
              titleEl.textContent = title;
              
              const messageEl = document.createElement('p');
              messageEl.className = 'text-gray-600';
              messageEl.textContent = message;
              
              header.appendChild(titleEl);
              header.appendChild(messageEl);
              
              const buttons = document.createElement('div');
              buttons.className = 'flex justify-end gap-3';
              
              const cancelBtn = document.createElement('button');
              cancelBtn.id = 'confirm-cancel';
              cancelBtn.className = 'px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors';
              cancelBtn.textContent = cancelText;
              
              const confirmBtn = document.createElement('button');
              confirmBtn.id = 'confirm-ok';
              confirmBtn.className = 'px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors';
              confirmBtn.textContent = confirmText;
              
              buttons.appendChild(cancelBtn);
              buttons.appendChild(confirmBtn);
              
              modal.appendChild(header);
              modal.appendChild(buttons);
              overlay.appendChild(modal);
              document.body.appendChild(overlay);
              
              const closeModal = () => {
                if (overlay && overlay.parentNode) {
                  overlay.parentNode.removeChild(overlay);
                }
              };
              
              confirmBtn.addEventListener('click', () => {
                closeModal();
                if (onConfirm) onConfirm();
              });
              
              cancelBtn.addEventListener('click', () => {
                closeModal();
                if (onCancel) onCancel();
              });
              
              overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                  closeModal();
                  if (onCancel) onCancel();
                }
              });
            };
          }
          
          // Load job detail on page load
          window.addEventListener('DOMContentLoaded', async function() {
            await loadJobDetail(jobId);
          });
          
          async function loadJobDetail(jobId) {
            const container = document.getElementById('job-detail-container');
            const token = localStorage.getItem('wowcampus_token');
            
            try {
              // Fetch job detail
              const response = await fetch('/api/jobs/' + jobId, {
                headers: token ? {
                  'Authorization': 'Bearer ' + token
                } : {}
              });
              
              const data = await response.json();
              
              if (!data.success || !data.job) {
                container.innerHTML = \`
                  <div class="p-12 text-center">
                    <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">\${window.t('jobs.detail.not_found')}</h2>
                    <p class="text-gray-600 mb-6">\${window.t('jobs.detail.not_found_desc')}</p>
                    <a href="/jobs" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      \${window.t('jobs.detail.back_to_list_btn')}
                    </a>
                  </div>
                \`;
                return;
              }
              
              const job = data.job;
              const hasApplied = data.has_applied || false;
              
              // Parse skills if JSON string
              let skills = [];
              if (job.skills_required) {
                try {
                  skills = typeof job.skills_required === 'string' 
                    ? JSON.parse(job.skills_required) 
                    : job.skills_required;
                } catch (e) {
                  skills = [];
                }
              }
              
              // Parse visa types if JSON string
              let visaTypes = [];
              if (job.visa_types) {
                try {
                  visaTypes = typeof job.visa_types === 'string' 
                    ? JSON.parse(job.visa_types) 
                    : job.visa_types;
                } catch (e) {
                  visaTypes = [];
                }
              }
              
              // Format salary (stored in 만원 units)
              const salaryText = job.salary_min && job.salary_max
                ? (job.salary_min === job.salary_max 
                    ? window.t('jobs.detail.salary_single').replace('{amount}', job.salary_min)
                    : window.t('jobs.detail.salary_range_detail').replace('{min}', job.salary_min).replace('{max}', job.salary_max))
                : (job.salary_min 
                    ? window.t('jobs.detail.salary_min_only').replace('{min}', job.salary_min)
                    : (job.salary_max 
                        ? window.t('jobs.detail.salary_max_only').replace('{max}', job.salary_max)
                        : window.t('jobs.detail.salary_company_policy')));
              
              // Format deadline
              let deadlineText = window.t('jobs.detail.always_recruiting');
              if (job.application_deadline) {
                // Check if it's a date or text
                if (job.application_deadline.match(/^\\d{4}-\\d{2}-\\d{2}/)) {
                  // It's a date
                  deadlineText = new Date(job.application_deadline).toLocaleDateString(window.locale === 'en' ? 'en-US' : 'ko-KR');
                } else {
                  // It's text (e.g., "상시모집", "채용시 마감")
                  deadlineText = job.application_deadline;
                }
              }
              
              // Render job detail
              container.innerHTML = \`
                <div class="p-8">
                  <!-- Company & Title -->
                  <div class="mb-8">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-3">
                          <h1 class="text-3xl font-bold text-gray-900">\${job.title}</h1>
                          \${job.featured ? '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">' + window.t('jobs.detail.recommended_tag') + '</span>' : ''}
                          \${job.visa_sponsorship ? '<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"><i class="fas fa-passport mr-1"></i>' + window.t('jobs.detail.visa_support_tag') + '</span>' : ''}
                        </div>
                        <div class="flex items-center gap-2 text-lg text-gray-700 mb-2">
                          <i class="fas fa-building text-blue-600"></i>
                          <span class="font-semibold">\${job.company_name || window.t('jobs.detail.company_name_hidden')}</span>
                        </div>
                        <div class="flex flex-wrap gap-4 text-gray-600">
                          <span><i class="fas fa-briefcase mr-1"></i>\${job.job_type}</span>
                          <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.location}</span>
                          <span><i class="fas fa-won-sign mr-1"></i>\${salaryText}</span>
                          <span><i class="fas fa-users mr-1"></i>\${window.t('jobs.detail.recruiting').replace('{count}', job.positions_available || 1)}</span>
                        </div>
                      </div>
                      
                      <!-- Apply Button -->
                      <div class="ml-6">
                        \${token ? (
                          hasApplied 
                            ? '<button disabled class="px-8 py-4 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"><i class="fas fa-check mr-2"></i>' + window.t('jobs.detail.applied') + '</button>'
                            : '<button onclick="applyForJob(' + job.id + ')" class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><i class="fas fa-paper-plane mr-2"></i>' + window.t('jobs.detail.apply') + '</button>'
                        ) : '<button onclick="showLoginModal()" class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><i class="fas fa-sign-in-alt mr-2"></i>' + window.t('jobs.detail.login_to_apply') + '</button>'}
                      </div>
                    </div>
                    
                    <!-- Stats -->
                    <div class="flex gap-6 text-sm text-gray-500 pt-4 border-t">
                      <span><i class="fas fa-eye mr-1"></i>\${window.t('jobs.detail.views').replace('{count}', job.views_count || 0)}</span>
                      <span><i class="fas fa-users mr-1"></i>\${window.t('jobs.detail.applicants').replace('{count}', job.applications_count || 0)}</span>
                      <span><i class="fas fa-calendar-alt mr-1"></i>\${window.t('jobs.detail.deadline').replace('{date}', deadlineText)}</span>
                    </div>
                  </div>

                  <!-- Job Description -->
                  <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <i class="fas fa-file-alt text-blue-600 mr-2"></i>
                      \${window.t('jobs.detail.job_description')}
                    </h2>
                    <div class="bg-white border border-gray-200 rounded-lg p-6">
                      <div class="text-gray-700" style="white-space: pre-wrap; line-height: 1.8; text-indent: 0;">
                        \${job.description || '<span class="text-gray-400 italic">' + window.t('jobs.detail.no_content') + '</span>'}
                      </div>
                    </div>
                  </div>

                  <!-- Requirements -->
                  <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <i class="fas fa-clipboard-check text-blue-600 mr-2"></i>
                      \${window.t('jobs.detail.requirements')}
                    </h2>
                    <div class="bg-white border border-gray-200 rounded-lg p-6">
                      <div class="text-gray-700" style="white-space: pre-wrap; line-height: 1.8; text-indent: 0;">
                        \${job.requirements || '<span class="text-gray-400 italic">' + window.t('jobs.detail.no_content') + '</span>'}
                      </div>
                    </div>
                  </div>

                  <!-- Responsibilities -->
                  <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <i class="fas fa-tasks text-blue-600 mr-2"></i>
                      \${window.t('jobs.detail.responsibilities')}
                    </h2>
                    <div class="bg-white border border-gray-200 rounded-lg p-6">
                      <div class="text-gray-700" style="white-space: pre-wrap; line-height: 1.8; text-indent: 0;">
                        \${job.responsibilities || '<span class="text-gray-400 italic">' + window.t('jobs.detail.no_content') + '</span>'}
                      </div>
                    </div>
                  </div>

                  <!-- Skills Required -->
                  <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <i class="fas fa-code text-blue-600 mr-2"></i>
                      \${window.t('jobs.detail.skills_required')}
                    </h2>
                    <div class="bg-white border border-gray-200 rounded-lg p-6">
                      \${skills.length > 0 ? \`
                        <div class="flex flex-wrap gap-2">
                          \${skills.map(skill => \`<span class="px-4 py-2 bg-blue-50 text-blue-700 rounded-full">\${skill}</span>\`).join('')}
                        </div>
                      \` : '<span class="text-gray-400 italic">' + window.t('jobs.detail.no_content') + '</span>'}
                    </div>
                  </div>

                  <!-- Benefits -->
                  <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <i class="fas fa-gift text-blue-600 mr-2"></i>
                      \${window.t('jobs.detail.benefits')}
                    </h2>
                    <div class="bg-white border border-gray-200 rounded-lg p-6">
                      <div class="text-gray-700" style="white-space: pre-wrap; line-height: 1.8; text-indent: 0;">
                        \${job.benefits || '<span class="text-gray-400 italic">' + window.t('jobs.detail.no_content') + '</span>'}
                      </div>
                    </div>
                  </div>

                  <!-- Additional Info -->
                  <div class="bg-gray-50 rounded-lg p-6 mb-8">
                    <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                      \${window.t('jobs.detail.recruitment_conditions')}
                    </h2>
                    <div class="grid md:grid-cols-2 gap-6">
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.employment_type')}</div>
                        <div class="flex-1 text-gray-900">\${job.job_type || '-'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.job_category')}</div>
                        <div class="flex-1 text-gray-900">\${job.job_category || '-'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.experience_level')}</div>
                        <div class="flex-1 text-gray-900">\${job.experience_level || '<span class="text-gray-400">' + window.t('jobs.detail.experience_any') + '</span>'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.education_required')}</div>
                        <div class="flex-1 text-gray-900">\${job.education_required || '<span class="text-gray-400">' + window.t('jobs.detail.education_any') + '</span>'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.work_location')}</div>
                        <div class="flex-1 text-gray-900">\${job.location || '-'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.salary')}</div>
                        <div class="flex-1 text-gray-900">\${salaryText}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.recruitment_count')}</div>
                        <div class="flex-1 text-gray-900">\${job.positions_available || 1}\${window.t('jobs.detail.people')}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.deadline_label')}</div>
                        <div class="flex-1 text-gray-900">\${job.application_deadline || '<span class="text-gray-400">' + window.t('jobs.detail.undecided') + '</span>'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.korean_required')}</div>
                        <div class="flex-1">
                          \${job.korean_required 
                            ? '<span class="px-2 py-1 bg-red-100 text-red-700 text-sm rounded">' + window.t('jobs.detail.korean_required_yes') + '</span>' 
                            : '<span class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">' + window.t('jobs.detail.korean_required_no') + '</span>'}
                        </div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.visa_support_label')}</div>
                        <div class="flex-1">
                          \${job.visa_sponsorship 
                            ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"><i class="fas fa-check mr-1"></i>' + window.t('jobs.detail.visa_support_yes') + '</span>' 
                            : '<span class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">' + window.t('jobs.detail.visa_support_no') + '</span>'}
                        </div>
                      </div>
                      \${visaTypes.length > 0 ? \`
                        <div class="flex items-start md:col-span-2">
                          <div class="w-32 font-semibold text-gray-700">\${window.t('jobs.detail.visa_types')}</div>
                          <div class="flex-1">
                            <div class="flex flex-wrap gap-2">
                              \${visaTypes.map(visa => \`<span class="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">\${visa}</span>\`).join('')}
                            </div>
                          </div>
                        </div>
                      \` : ''}
                    </div>
                  </div>

                  <!-- Company Info -->
                  <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <i class="fas fa-building text-blue-600 mr-2"></i>
                      \${window.t('jobs.detail.company_info')}
                    </h2>
                    <div class="space-y-4">
                      <div class="flex items-start">
                        <div class="w-24 font-semibold text-gray-700">\${window.t('jobs.detail.company_name')}</div>
                        <div class="flex-1 text-gray-900">\${job.company_name || '<span class="text-gray-400">' + window.t('jobs.detail.not_disclosed') + '</span>'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-24 font-semibold text-gray-700">\${window.t('jobs.detail.industry')}</div>
                        <div class="flex-1 text-gray-900">\${job.industry || '<span class="text-gray-400">' + window.t('jobs.detail.no_content') + '</span>'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-24 font-semibold text-gray-700">\${window.t('jobs.detail.company_size')}</div>
                        <div class="flex-1 text-gray-900">\${job.company_size || '<span class="text-gray-400">' + window.t('jobs.detail.no_content') + '</span>'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-24 font-semibold text-gray-700">\${window.t('jobs.detail.address')}</div>
                        <div class="flex-1 text-gray-900">\${job.address || '<span class="text-gray-400">' + window.t('jobs.detail.no_content') + '</span>'}</div>
                      </div>
                      <div class="flex items-start">
                        <div class="w-24 font-semibold text-gray-700">\${window.t('jobs.detail.website')}</div>
                        <div class="flex-1">
                          \${job.website 
                            ? \`<a href="\${job.website}" target="_blank" class="text-blue-600 hover:underline"><i class="fas fa-external-link-alt mr-1"></i>\${job.website}</a>\`
                            : '<span class="text-gray-400">' + window.t('jobs.detail.no_content') + '</span>'}
                        </div>
                      </div>
                      \${job.company_contact_email ? \`
                        <div class="flex items-start">
                          <div class="w-24 font-semibold text-gray-700">\${window.t('jobs.detail.contact_person')}</div>
                          <div class="flex-1">
                            <p class="text-gray-900">\${job.company_contact_name || '-'}</p>
                            <p class="text-gray-600 text-sm"><i class="fas fa-envelope mr-1"></i>\${job.company_contact_email}</p>
                          </div>
                        </div>
                      \` : ''}
                    </div>
                  </div>
                </div>
              \`;
              
            } catch (error) {
              console.error('Error loading job detail:', error);
              container.innerHTML = \`
                <div class="p-12 text-center">
                  <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
                  <p class="text-gray-600 mb-6">구인정보를 불러오는 중 문제가 발생했습니다.</p>
                  <button onclick="loadJobDetail(\${jobId})" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    다시 시도
                  </button>
                </div>
              \`;
            }
          }
          
          // Apply for job function
          async function applyForJob(jobId) {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              if (typeof showLoginModal === 'function') {
                showLoginModal();
              } else {
                window.location.href = '/';
              }
              return;
            }
            
            window.showConfirm({
              title: window.t('jobs.detail.apply_confirm_title'),
              message: window.t('jobs.detail.apply_confirm_message'),
              type: 'info',
              confirmText: window.t('jobs.detail.apply_confirm_btn'),
              cancelText: window.t('common.cancel'),
              onConfirm: async () => {
                try {
                  const response = await fetch('/api/applications', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ job_posting_id: jobId })
                  });
                  
                  const data = await response.json();
                  
                  if (data.success) {
                    if (window.toast) {
                      window.toast.success(window.t('jobs.detail.apply_success'));
                    }
                    location.reload();
                  } else {
                    if (window.toast) {
                      window.toast.error(window.t('jobs.detail.apply_error') + ': ' + (data.message || window.t('jobs.detail.apply_error_unknown')));
                    }
                  }
                } catch (error) {
                  console.error('Apply error:', error);
                  if (window.toast) {
                    window.toast.error(window.t('jobs.detail.apply_error_occurred'));
                  }
                }
              }
            });
          }
          
          // Make applyForJob available globally
          window.applyForJob = applyForJob;
        `}}></script>
      </body>
    </html>
  );


// Jobs page
}

// Middleware: optionalAuth
