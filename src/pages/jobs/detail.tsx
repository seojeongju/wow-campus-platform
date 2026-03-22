/**
 * Page Component
 * Route: /jobs/:id
 * Original: src/index.tsx lines 7469-7783
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'
import { HTTPException } from 'hono/http-exception'
import { getCurrentTimestamp } from '../../utils/database'

export const handler = async (c: Context) => {
  const jobId = parseInt(c.req.param('id'));
  const { t } = c.get('i18n');
  const lang = c.get('locale') || 'ko';
  const currentUser = c.get('user');
  
  // 1. Fetch job data on server
  const job: any = await c.env.DB.prepare(`
    SELECT jp.*, 
           c.company_name, c.industry, c.company_size, c.address, c.website,
           u.name as company_contact_name, u.email as company_contact_email,
           (SELECT COUNT(*) FROM applications WHERE job_posting_id = jp.id) as applications_count
    FROM job_postings jp
    LEFT JOIN companies c ON jp.company_id = c.id
    LEFT JOIN users u ON c.user_id = u.id
    WHERE jp.id = ? AND (jp.status = 'active' OR jp.status IS NULL)
  `).bind(jobId).first();

  if (!job) {
    return c.render(
      <div class="container mx-auto px-4 py-12 text-center">
        <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{t('jobs.detail.not_found')}</h2>
        <p class="text-gray-600 mb-6">{t('jobs.detail.not_found_desc')}</p>
        <a href="/jobs" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {t('jobs.detail.back_to_list_btn')}
        </a>
      </div>,
      {
        title: `${t('jobs.detail.not_found')} - WOW-CAMPUS`,
        description: t('jobs.detail.not_found_desc')
      }
    );
  }

  // Update view count
  c.executionCtx.waitUntil(
    c.env.DB.prepare(
      'UPDATE job_postings SET views_count = views_count + 1 WHERE id = ?'
    ).bind(jobId).run()
  );

  // Check if current user has applied
  let hasApplied = false;
  if (currentUser && currentUser.user_type === 'jobseeker') {
    const jobseeker = await c.env.DB.prepare(
      'SELECT id FROM jobseekers WHERE user_id = ?'
    ).bind(currentUser.id).first();

    if (jobseeker) {
      const application = await c.env.DB.prepare(
        'SELECT id FROM applications WHERE job_posting_id = ? AND jobseeker_id = ?'
      ).bind(jobId, jobseeker.id).first();
      hasApplied = !!application;
    }
  }

  // 2. Prepare SEO Data
  const seoTitle = `${job.title} | ${job.company_name || 'WOW-CAMPUS'}`;
  const seoDescription = job.description ? job.description.substring(0, 160).replace(/\n/g, ' ') : t('jobs.detail.title');
  
  // 3. Prepare JobPosting Structured Data
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.created_at,
    "validThrough": job.application_deadline || undefined,
    "employmentType": job.job_type === 'full_time' ? 'FULL_TIME' : (job.job_type === 'part_time' ? 'PART_TIME' : 'OTHER'),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name || "WOW-CAMPUS",
      "sameAs": job.website || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "KR"
      }
    },
    "baseSalary": job.salary_min ? {
      "@type": "MonetaryAmount",
      "currency": "KRW",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max || job.salary_min,
        "unitText": "MONTH"
      }
    } : undefined
  };

  // 4. Formatting Utilities for View
  const salaryText = job.salary_min && job.salary_max
    ? (job.salary_min === job.salary_max 
        ? t('jobs.detail.salary_single').replace('{amount}', job.salary_min)
        : t('jobs.detail.salary_range_detail').replace('{min}', String(job.salary_min)).replace('{max}', String(job.salary_max)))
    : (job.salary_min 
        ? t('jobs.detail.salary_min_only').replace('{min}', String(job.salary_min))
        : (job.salary_max 
            ? t('jobs.detail.salary_max_only').replace('{max}', String(job.salary_max))
            : t('jobs.detail.salary_company_policy')));

  let deadlineText = t('jobs.detail.always_recruiting');
  if (job.application_deadline) {
    if (job.application_deadline.match(/^\d{4}-\d{2}-\d{2}/)) {
      deadlineText = new Date(job.application_deadline).toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR');
    } else {
      deadlineText = job.application_deadline;
    }
  }

  const skills = job.skills_required ? (typeof job.skills_required === 'string' ? JSON.parse(job.skills_required) : job.skills_required) : [];
  const visaTypes = job.visa_types ? (typeof job.visa_types === 'string' ? JSON.parse(job.visa_types) : job.visa_types) : [];

  return c.render(
    <main class="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div class="mb-6">
        <a href="/jobs" class="inline-flex items-center text-blue-600 hover:text-blue-800">
          <i class="fas fa-arrow-left mr-2"></i>
          {t('jobs.detail.back_to_list')}
        </a>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-8">
          {/* Header Info */}
          <div class="mb-8 pb-8 border-b border-gray-100">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-3 mb-4">
                  <h1 class="text-3xl font-bold text-gray-900">{job.title}</h1>
                  {job.featured && <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">{t('jobs.detail.recommended_tag')}</span>}
                  {job.visa_sponsorship && <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"><i class="fas fa-passport mr-1"></i>{t('jobs.detail.visa_support_tag')}</span>}
                </div>
                
                <div class="flex items-center gap-2 text-lg text-gray-700 mb-4">
                  <i class="fas fa-building text-blue-600"></i>
                  <span class="font-semibold">{job.company_name || t('jobs.detail.company_name_hidden')}</span>
                </div>
                
                <div class="grid grid-cols-2 md:flex md:flex-wrap gap-4 text-gray-600">
                  <div class="flex items-center"><i class="fas fa-briefcase w-5 text-gray-400 mr-2"></i>{t(`jobs.types.${job.job_type}`) || job.job_type}</div>
                  <div class="flex items-center"><i class="fas fa-map-marker-alt w-5 text-gray-400 mr-2"></i>{job.location}</div>
                  <div class="flex items-center"><i class="fas fa-won-sign w-5 text-gray-400 mr-2"></i>{salaryText}</div>
                  <div class="flex items-center"><i class="fas fa-users w-5 text-gray-400 mr-2"></i>{t('jobs.detail.recruiting').replace('{count}', String(job.positions_available || 1))}</div>
                </div>
              </div>
              
              <div class="flex flex-col gap-3 min-w-[200px]">
                {currentUser ? (
                  hasApplied ? (
                    <button disabled class="w-full px-8 py-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed font-bold flex items-center justify-center">
                      <i class="fas fa-check-circle mr-2"></i>{t('jobs.detail.applied')}
                    </button>
                  ) : (
                    <button id="apply-btn" onclick={`applyForJob(${jobId})`} class="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-bold flex items-center justify-center">
                      <i class="fas fa-paper-plane mr-2"></i>{t('jobs.detail.apply')}
                    </button>
                  )
                ) : (
                  <button id="login-to-apply-btn" onclick="showLoginModal()" class="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-bold flex items-center justify-center">
                    <i class="fas fa-sign-in-alt mr-2"></i>{t('jobs.detail.login_to_apply')}
                  </button>
                )}
                
                <div class="flex justify-around text-xs text-gray-500 px-2">
                  <span><i class="fas fa-eye mr-1"></i>{job.views_count || 0}</span>
                  <span><i class="fas fa-user-friends mr-1"></i>{job.applications_count || 0}</span>
                  <span><i class="fas fa-calendar-alt mr-1"></i>{deadlineText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Details Sections */}
          <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-12">
              {/* Description */}
              <section>
                <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span class="w-1.5 h-8 bg-blue-600 rounded-full mr-3"></span>
                  {t('jobs.detail.job_description')}
                </h2>
                <div class="prose prose-blue max-w-none text-gray-700 bg-gray-50 rounded-xl p-8 leading-relaxed whitespace-pre-wrap">
                  {job.description || <span class="text-gray-400 italic">{t('jobs.detail.no_content')}</span>}
                </div>
              </section>

              {/* Requirements */}
              <section>
                <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span class="w-1.5 h-8 bg-blue-600 rounded-full mr-3"></span>
                  {t('jobs.detail.requirements')}
                </h2>
                <div class="prose prose-blue max-w-none text-gray-700 bg-gray-50 rounded-xl p-8 leading-relaxed whitespace-pre-wrap">
                  {job.requirements || <span class="text-gray-400 italic">{t('jobs.detail.no_content')}</span>}
                </div>
              </section>

              {/* Responsibilities */}
              <section>
                <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span class="w-1.5 h-8 bg-blue-600 rounded-full mr-3"></span>
                  {t('jobs.detail.responsibilities')}
                </h2>
                <div class="prose prose-blue max-w-none text-gray-700 bg-gray-50 rounded-xl p-8 leading-relaxed whitespace-pre-wrap">
                  {job.responsibilities || <span class="text-gray-400 italic">{t('jobs.detail.no_content')}</span>}
                </div>
              </section>

              {/* Benefits */}
              <section>
                <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span class="w-1.5 h-8 bg-blue-600 rounded-full mr-3"></span>
                  {t('jobs.detail.benefits')}
                </h2>
                <div class="prose prose-blue max-w-none text-gray-700 bg-gray-50 rounded-xl p-8 leading-relaxed whitespace-pre-wrap">
                  {job.benefits || <span class="text-gray-400 italic">{t('jobs.detail.no_content')}</span>}
                </div>
              </section>
            </div>

            {/* Sidebar info */}
            <div class="space-y-8">
              <div class="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 class="font-bold text-gray-900 mb-6 flex items-center text-lg">
                  <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                  {t('jobs.detail.recruitment_conditions')}
                </h3>
                <dl class="space-y-4 text-sm">
                  <div class="flex flex-col">
                    <dt class="text-gray-500 mb-1">{t('jobs.detail.job_category')}</dt>
                    <dd class="font-semibold text-gray-900">{job.job_category || '-'}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="text-gray-500 mb-1">{t('jobs.detail.experience_level')}</dt>
                    <dd class="font-semibold text-gray-900">{job.experience_level || t('jobs.detail.experience_any')}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="text-gray-500 mb-1">{t('jobs.detail.education_required')}</dt>
                    <dd class="font-semibold text-gray-900">{job.education_required || t('jobs.detail.education_any')}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="text-gray-500 mb-1">{t('jobs.detail.korean_required')}</dt>
                    <dd class="font-semibold text-gray-900">
                      {job.korean_required 
                        ? <span class="text-red-600"><i class="fas fa-check mr-1"></i>{t('jobs.detail.korean_required_yes')}</span> 
                        : t('jobs.detail.korean_required_no')}
                    </dd>
                  </div>
                </dl>
                
                {skills.length > 0 && (
                  <div class="mt-8">
                    <h4 class="text-gray-500 text-sm mb-3">{t('jobs.detail.skills_required')}</h4>
                    <div class="flex flex-wrap gap-2">
                      {skills.map((skill: string) => (
                        <span class="px-3 py-1 bg-white text-blue-700 text-xs font-medium rounded-full border border-blue-200">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {visaTypes.length > 0 && (
                  <div class="mt-6">
                    <h4 class="text-gray-500 text-sm mb-3">{t('jobs.detail.visa_types')}</h4>
                    <div class="flex flex-wrap gap-2">
                      {visaTypes.map((visa: string) => (
                        <span class="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-200">{visa}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Company Info Box */}
              <div class="bg-white rounded-xl p-6 border border-gray-200">
                <h3 class="font-bold text-gray-900 mb-6 flex items-center text-lg">
                  <i class="fas fa-building text-blue-600 mr-2"></i>
                  {t('jobs.detail.company_info')}
                </h3>
                <div class="space-y-4 text-sm">
                  <div>
                    <p class="text-gray-500 mb-1">{t('jobs.detail.company_name')}</p>
                    <p class="font-bold text-gray-900">{job.company_name || t('jobs.detail.not_disclosed')}</p>
                  </div>
                  {job.industry && (
                    <div>
                      <p class="text-gray-500 mb-1">{t('jobs.detail.industry')}</p>
                      <p class="text-gray-900">{job.industry}</p>
                    </div>
                  )}
                  {job.website && (
                    <div>
                      <p class="text-gray-500 mb-1">{t('jobs.detail.website')}</p>
                      <a href={job.website} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-all">
                        {job.website} <i class="fas fa-external-link-alt text-xs ml-1"></i>
                      </a>
                    </div>
                  )}
                  {job.address && (
                    <div>
                      <p class="text-gray-500 mb-1">{t('jobs.detail.address')}</p>
                      <p class="text-gray-900">{job.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
        const jobId = ${jobId};
        window.locale = '${lang}';
        
        async function applyForJob(jobId) {
          const token = localStorage.getItem('wowcampus_token');
          if (!token) {
            if (typeof showLoginModal === 'function') {
              showLoginModal();
            } else {
              window.location.href = '/login';
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
                  setTimeout(() => location.reload(), 1500);
                  if (window.toast) {
                    window.toast.error(data.message || window.t('jobs.detail.apply_failed'));
                  }
                }
              } catch (error) {
                console.error('Application error:', error);
                if (window.toast) {
                  window.toast.error(window.t('jobs.detail.apply_failed'));
                }
              }
            }
          });
        }
        `
      }} />
    </main>,
    {
      title: seoTitle,
      description: seoDescription,
      jsonLd: jsonLd
    }
  );
};
