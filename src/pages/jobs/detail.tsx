/**
 * Page Component
 * Route: /jobs/:id
 * Original: src/index.tsx lines 7469-7783
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'

export const handler = async (c: Context) => {
const jobId = c.req.param('id');
  
  return c.render(
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>구인정보 상세보기 - WOW-CAMPUS</title>
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
                <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">W</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                  <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
                </div>
              </a>
            </div>
            
            <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
              {/* 동적 메뉴 */}
            </div>
            
            <div id="auth-buttons-container" class="flex items-center space-x-3">
              <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                로그인
              </button>
              <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                회원가입
              </button>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main class="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div class="mb-6">
            <a href="/jobs" class="inline-flex items-center text-blue-600 hover:text-blue-800">
              <i class="fas fa-arrow-left mr-2"></i>
              구인정보 목록으로 돌아가기
            </a>
          </div>

          {/* Job Detail Container */}
          <div id="job-detail-container" class="bg-white rounded-lg shadow-sm">
            {/* Loading State */}
            <div class="p-12 text-center">
              <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p class="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </main>

        <script dangerouslySetInnerHTML={{__html: `
          const jobId = ${jobId};
          
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
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">구인정보를 찾을 수 없습니다</h2>
                    <p class="text-gray-600 mb-6">요청하신 구인정보가 존재하지 않거나 삭제되었습니다.</p>
                    <a href="/jobs" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      구인정보 목록으로
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
              
              // Format salary
              const salaryText = job.salary_min && job.salary_max
                ? \`\${(job.salary_min/10000).toFixed(0)}~\${(job.salary_max/10000).toFixed(0)}만원\`
                : '회사내규';
              
              // Format deadline
              const deadlineText = job.application_deadline 
                ? new Date(job.application_deadline).toLocaleDateString('ko-KR')
                : '상시채용';
              
              // Render job detail
              container.innerHTML = \`
                <div class="p-8">
                  <!-- Company & Title -->
                  <div class="mb-8">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-3">
                          <h1 class="text-3xl font-bold text-gray-900">\${job.title}</h1>
                          \${job.featured ? '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">추천</span>' : ''}
                          \${job.visa_sponsorship ? '<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"><i class="fas fa-passport mr-1"></i>비자지원</span>' : ''}
                        </div>
                        <div class="flex items-center gap-2 text-lg text-gray-700 mb-2">
                          <i class="fas fa-building text-blue-600"></i>
                          <span class="font-semibold">\${job.company_name || '회사명 미공개'}</span>
                        </div>
                        <div class="flex flex-wrap gap-4 text-gray-600">
                          <span><i class="fas fa-briefcase mr-1"></i>\${job.job_type}</span>
                          <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.location}</span>
                          <span><i class="fas fa-won-sign mr-1"></i>\${salaryText}</span>
                          <span><i class="fas fa-users mr-1"></i>모집 \${job.positions_available || 1}명</span>
                        </div>
                      </div>
                      
                      <!-- Apply Button -->
                      <div class="ml-6">
                        \${token ? (
                          hasApplied 
                            ? '<button disabled class="px-8 py-4 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"><i class="fas fa-check mr-2"></i>지원 완료</button>'
                            : '<button onclick="applyForJob(' + job.id + ')" class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><i class="fas fa-paper-plane mr-2"></i>지원하기</button>'
                        ) : '<button onclick="showLoginModal()" class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><i class="fas fa-sign-in-alt mr-2"></i>로그인하고 지원하기</button>'}
                      </div>
                    </div>
                    
                    <!-- Stats -->
                    <div class="flex gap-6 text-sm text-gray-500 pt-4 border-t">
                      <span><i class="fas fa-eye mr-1"></i>조회 \${job.views_count || 0}회</span>
                      <span><i class="fas fa-users mr-1"></i>지원자 \${job.applications_count || 0}명</span>
                      <span><i class="fas fa-calendar-alt mr-1"></i>마감일: \${deadlineText}</span>
                    </div>
                  </div>

                  <!-- Job Description -->
                  <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">채용 공고</h2>
                    <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                      \${job.description}
                    </div>
                  </div>

                  <!-- Requirements -->
                  \${job.requirements ? \`
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">자격 요건</h2>
                      <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        \${job.requirements}
                      </div>
                    </div>
                  \` : ''}

                  <!-- Responsibilities -->
                  \${job.responsibilities ? \`
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">주요 업무</h2>
                      <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        \${job.responsibilities}
                      </div>
                    </div>
                  \` : ''}

                  <!-- Skills Required -->
                  \${skills.length > 0 ? \`
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">필요 기술</h2>
                      <div class="flex flex-wrap gap-2">
                        \${skills.map(skill => \`<span class="px-4 py-2 bg-blue-50 text-blue-700 rounded-full">\${skill}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}

                  <!-- Benefits -->
                  \${job.benefits ? \`
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">복리후생</h2>
                      <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        \${job.benefits}
                      </div>
                    </div>
                  \` : ''}

                  <!-- Additional Info -->
                  <div class="bg-gray-50 rounded-lg p-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">추가 정보</h2>
                    <div class="grid md:grid-cols-2 gap-4 text-gray-700">
                      <div>
                        <span class="font-semibold">직무 분야:</span>
                        <span class="ml-2">\${job.job_category}</span>
                      </div>
                      <div>
                        <span class="font-semibold">경력:</span>
                        <span class="ml-2">\${job.experience_level || '경력무관'}</span>
                      </div>
                      <div>
                        <span class="font-semibold">학력:</span>
                        <span class="ml-2">\${job.education_required || '학력무관'}</span>
                      </div>
                      <div>
                        <span class="font-semibold">한국어:</span>
                        <span class="ml-2">\${job.korean_required ? '필수' : '선택'}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Company Info -->
                  \${job.company_name ? \`
                    <div class="mt-8 pt-8 border-t">
                      <h2 class="text-xl font-bold text-gray-900 mb-4">기업 정보</h2>
                      <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i class="fas fa-building text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex-1">
                          <h3 class="text-lg font-semibold text-gray-900 mb-2">\${job.company_name}</h3>
                          \${job.industry ? \`<p class="text-gray-600 mb-1"><i class="fas fa-industry mr-2"></i>\${job.industry}</p>\` : ''}
                          \${job.company_size ? \`<p class="text-gray-600 mb-1"><i class="fas fa-users mr-2"></i>\${job.company_size}</p>\` : ''}
                          \${job.website ? \`<p class="text-gray-600"><i class="fas fa-globe mr-2"></i><a href="\${job.website}" target="_blank" class="text-blue-600 hover:underline">\${job.website}</a></p>\` : ''}
                        </div>
                      </div>
                    </div>
                  \` : ''}
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
              showLoginModal();
              return;
            }
            
            showConfirm({
              title: '지원 확인',
              message: '이 채용공고에 지원하시겠습니까?',
              type: 'info',
              confirmText: '지원하기',
              cancelText: '취소',
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
                    toast.success('지원이 완료되었습니다!');
                    location.reload();
                  } else {
                    toast.error('지원 실패: ' + (data.message || '알 수 없는 오류'));
                  }
                } catch (error) {
                  console.error('Apply error:', error);
                  toast.error('지원 중 오류가 발생했습니다.');
                }
              }
            });
          }
        `}}></script>
      </body>
    </html>
  );


// Jobs page
}

// Middleware: optionalAuth
