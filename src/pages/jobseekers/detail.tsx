/**
 * Page Component
 * Route: /jobseekers/:id
 * Original: src/index.tsx lines 6972-7468
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'

export const handler = async (c: Context) => {
const jobseekerId = c.req.param('id');
  
  return c.render(
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>구직정보 상세보기 - WOW-CAMPUS</title>
        <link rel="stylesheet" href="https://cdn.tailwindcss.com" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="/static/app.js"></script>
      </head>
      <body class="min-h-screen bg-gray-50">
        {/* Header */}
        <header class="bg-white shadow-sm sticky top-0 z-50">
          <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <a href="/" class="flex items-center space-x-3">
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
            <a href="/jobseekers" class="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>
              목록으로 돌아가기
            </a>
          </div>

          {/* Loading State */}
          <div id="loading-state" class="bg-white rounded-lg shadow-sm p-12 text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-green-500 mb-4"></i>
            <p class="text-gray-600">구직자 정보를 불러오는 중...</p>
          </div>

          {/* Error State */}
          <div id="error-state" class="hidden bg-white rounded-lg shadow-sm p-12 text-center">
            <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <p class="text-gray-800 font-semibold mb-2">구직자 정보를 불러올 수 없습니다</p>
            <p id="error-message" class="text-gray-600 mb-4"></p>
            <a href="/jobseekers" class="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              목록으로 돌아가기
            </a>
          </div>

          {/* Jobseeker Detail Content */}
          <div id="jobseeker-detail" class="hidden">
            {/* Main Info Card */}
            <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {/* Header Section with Gradient */}
              <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-8">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h1 id="jobseeker-name" class="text-3xl font-bold mb-2"></h1>
                    <div class="flex items-center space-x-4 text-green-50">
                      <span id="jobseeker-nationality" class="flex items-center">
                        <i class="fas fa-flag mr-2"></i>
                      </span>
                      <span id="jobseeker-age" class="flex items-center">
                        <i class="fas fa-birthday-cake mr-2"></i>
                      </span>
                      <span id="jobseeker-gender" class="flex items-center">
                        <i class="fas fa-user mr-2"></i>
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                      <div id="jobseeker-visa" class="text-sm font-semibold"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Bar */}
              <div class="border-b border-gray-200 bg-gray-50 px-8 py-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div class="text-gray-600 text-sm mb-1">경력</div>
                    <div id="jobseeker-experience" class="text-gray-900 font-semibold"></div>
                  </div>
                  <div>
                    <div class="text-gray-600 text-sm mb-1">학력</div>
                    <div id="jobseeker-education" class="text-gray-900 font-semibold"></div>
                  </div>
                  <div>
                    <div class="text-gray-600 text-sm mb-1">한국어</div>
                    <div id="jobseeker-korean" class="text-gray-900 font-semibold"></div>
                  </div>
                  <div>
                    <div class="text-gray-600 text-sm mb-1">영어</div>
                    <div id="jobseeker-english" class="text-gray-900 font-semibold"></div>
                  </div>
                </div>
              </div>

              {/* Detailed Info */}
              <div class="p-8">
                {/* Bio */}
                <div id="jobseeker-bio-section" class="mb-8 hidden">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">자기소개</h3>
                  <p id="jobseeker-bio" class="text-gray-700 leading-relaxed"></p>
                </div>

                {/* Education & Major */}
                <div class="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">
                      <i class="fas fa-graduation-cap text-green-600 mr-2"></i>학력 사항
                    </h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="mb-2">
                        <span class="text-gray-600 text-sm">최종 학력</span>
                        <p id="jobseeker-education-detail" class="text-gray-900 font-medium"></p>
                      </div>
                      <div id="jobseeker-major-section" class="hidden">
                        <span class="text-gray-600 text-sm">전공</span>
                        <p id="jobseeker-major" class="text-gray-900 font-medium"></p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">
                      <i class="fas fa-briefcase text-green-600 mr-2"></i>경력 사항
                    </h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="mb-2">
                        <span class="text-gray-600 text-sm">총 경력</span>
                        <p id="jobseeker-experience-detail" class="text-gray-900 font-medium"></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div id="jobseeker-skills-section" class="mb-8 hidden">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">
                    <i class="fas fa-tools text-green-600 mr-2"></i>보유 기술
                  </h3>
                  <div id="jobseeker-skills" class="flex flex-wrap gap-2"></div>
                </div>

                {/* Preferences */}
                <div class="grid md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-2">
                      <i class="fas fa-map-marker-alt text-green-600 mr-2"></i>희망 근무지
                    </h3>
                    <p id="jobseeker-preferred-location" class="text-gray-900"></p>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-2">
                      <i class="fas fa-won-sign text-green-600 mr-2"></i>희망 연봉
                    </h3>
                    <p id="jobseeker-salary" class="text-gray-900 font-semibold"></p>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-2">
                      <i class="fas fa-calendar-check text-green-600 mr-2"></i>입사 가능일
                    </h3>
                    <p id="jobseeker-start-date" class="text-gray-900"></p>
                  </div>
                </div>

                {/* Contact Info (Only for authenticated users) */}
                <div id="jobseeker-contact-section" class="hidden border-t pt-8">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-address-card text-green-600 mr-2"></i>연락처 정보
                  </h3>
                  <div class="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <span class="text-gray-600 text-sm">이메일</span>
                      <p id="jobseeker-email" class="text-gray-900 font-medium"></p>
                    </div>
                    <div>
                      <span class="text-gray-600 text-sm">전화번호</span>
                      <p id="jobseeker-phone" class="text-gray-900 font-medium"></p>
                    </div>
                    <div>
                      <span class="text-gray-600 text-sm">현재 거주지</span>
                      <p id="jobseeker-current-location" class="text-gray-900 font-medium"></p>
                    </div>
                  </div>
                </div>

                {/* Documents (Only for authenticated users) */}
                <div id="jobseeker-documents-section" class="hidden border-t pt-8 mt-8">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-file-alt text-green-600 mr-2"></i>첨부 서류
                  </h3>
                  <div class="space-y-3">
                    <div id="jobseeker-resume-link" class="hidden">
                      <a href="#" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <i class="fas fa-file-pdf mr-2"></i>이력서 다운로드
                      </a>
                    </div>
                    <div id="jobseeker-portfolio-link" class="hidden">
                      <a href="#" target="_blank" class="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                        <i class="fas fa-folder mr-2"></i>포트폴리오 보기
                      </a>
                    </div>
                  </div>
                </div>

                {/* Login Required Message */}
                <div id="login-required-message" class="hidden border-t pt-8 mt-8">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <i class="fas fa-lock text-blue-600 text-3xl mb-3"></i>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">로그인이 필요합니다</h4>
                    <p class="text-gray-600 mb-4">구직자의 연락처 정보와 이력서를 확인하려면 로그인이 필요합니다.</p>
                    <button onclick="showLoginModal()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-sign-in-alt mr-2"></i>로그인하기
                    </button>
                  </div>
                </div>

                {/* Application Stats (Only for own profile or admin) */}
                <div id="jobseeker-applications-section" class="hidden border-t pt-8 mt-8">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-paper-plane text-green-600 mr-2"></i>최근 지원 현황
                  </h3>
                  <div id="jobseeker-applications" class="space-y-3">
                    {/* Applications will be loaded here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <script dangerouslySetInnerHTML={{__html: `
          const jobseekerId = ${jobseekerId};
          
          // Load jobseeker detail
          async function loadJobseekerDetail() {
            try {
              const token = localStorage.getItem('token');
              const headers = {};
              if (token) {
                headers['Authorization'] = 'Bearer ' + token;
              }

              const response = await fetch('/api/jobseekers/' + jobseekerId, {
                headers: headers
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to load jobseeker details');
              }

              const jobseeker = data.jobseeker;
              
              // Hide loading, show content
              document.getElementById('loading-state').classList.add('hidden');
              document.getElementById('jobseeker-detail').classList.remove('hidden');

              // Populate basic info
              document.getElementById('jobseeker-name').textContent = 
                jobseeker.first_name + ' ' + jobseeker.last_name;
              
              if (jobseeker.nationality) {
                document.getElementById('jobseeker-nationality').innerHTML = 
                  '<i class="fas fa-flag mr-2"></i>' + jobseeker.nationality;
              }

              if (jobseeker.birth_date) {
                const age = calculateAge(jobseeker.birth_date);
                document.getElementById('jobseeker-age').innerHTML = 
                  '<i class="fas fa-birthday-cake mr-2"></i>' + age + '세';
              }

              if (jobseeker.gender) {
                const genderText = jobseeker.gender === 'male' ? '남성' : 
                                  jobseeker.gender === 'female' ? '여성' : '기타';
                document.getElementById('jobseeker-gender').innerHTML = 
                  '<i class="fas fa-user mr-2"></i>' + genderText;
              }

              if (jobseeker.visa_status) {
                document.getElementById('jobseeker-visa').textContent = jobseeker.visa_status + ' 비자';
              }

              // Quick info
              const experienceYears = jobseeker.experience_years || 0;
              const experienceText = experienceYears === 0 ? '신입' : experienceYears + '년';
              document.getElementById('jobseeker-experience').textContent = experienceText;

              const educationLevels = {
                'high_school': '고등학교 졸업',
                'associate': '전문대 졸업',
                'bachelor': '학사',
                'master': '석사',
                'doctorate': '박사'
              };
              document.getElementById('jobseeker-education').textContent = 
                educationLevels[jobseeker.education_level] || jobseeker.education_level || '미입력';

              const languageLevels = {
                'beginner': '초급',
                'elementary': '초중급',
                'intermediate': '중급',
                'advanced': '고급',
                'native': '원어민'
              };
              document.getElementById('jobseeker-korean').textContent = 
                languageLevels[jobseeker.korean_level] || '미입력';
              document.getElementById('jobseeker-english').textContent = 
                languageLevels[jobseeker.english_level] || '미입력';

              // Bio
              if (jobseeker.bio) {
                document.getElementById('jobseeker-bio').textContent = jobseeker.bio;
                document.getElementById('jobseeker-bio-section').classList.remove('hidden');
              }

              // Education detail
              document.getElementById('jobseeker-education-detail').textContent = 
                educationLevels[jobseeker.education_level] || '미입력';
              
              if (jobseeker.major) {
                document.getElementById('jobseeker-major').textContent = jobseeker.major;
                document.getElementById('jobseeker-major-section').classList.remove('hidden');
              }

              // Experience detail
              document.getElementById('jobseeker-experience-detail').textContent = experienceText;

              // Skills
              if (jobseeker.skills) {
                try {
                  const skills = typeof jobseeker.skills === 'string' ? 
                    JSON.parse(jobseeker.skills) : jobseeker.skills;
                  
                  if (Array.isArray(skills) && skills.length > 0) {
                    const skillsContainer = document.getElementById('jobseeker-skills');
                    skillsContainer.innerHTML = skills.map(skill => 
                      '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">' + skill + '</span>'
                    ).join('');
                    document.getElementById('jobseeker-skills-section').classList.remove('hidden');
                  }
                } catch (e) {
                  console.error('Error parsing skills:', e);
                }
              }

              // Preferences
              document.getElementById('jobseeker-preferred-location').textContent = 
                jobseeker.preferred_location || '협의 가능';
              
              if (jobseeker.salary_expectation) {
                document.getElementById('jobseeker-salary').textContent = 
                  jobseeker.salary_expectation.toLocaleString() + '만원';
              } else {
                document.getElementById('jobseeker-salary').textContent = '협의 가능';
              }

              document.getElementById('jobseeker-start-date').textContent = 
                jobseeker.available_start_date ? formatDate(jobseeker.available_start_date) : '즉시 가능';

              // Contact info (only if not hidden)
              if (jobseeker.email) {
                document.getElementById('jobseeker-email').textContent = jobseeker.email;
                document.getElementById('jobseeker-phone').textContent = jobseeker.phone || '비공개';
                document.getElementById('jobseeker-current-location').textContent = 
                  jobseeker.current_location || '비공개';
                document.getElementById('jobseeker-contact-section').classList.remove('hidden');
              } else if (token) {
                // Logged in but no access to contact info
                // Don't show anything
              } else {
                // Not logged in
                document.getElementById('login-required-message').classList.remove('hidden');
              }

              // Documents
              if (jobseeker.resume_url) {
                const resumeLink = document.querySelector('#jobseeker-resume-link a');
                resumeLink.href = jobseeker.resume_url;
                document.getElementById('jobseeker-resume-link').classList.remove('hidden');
                document.getElementById('jobseeker-documents-section').classList.remove('hidden');
              }

              if (jobseeker.portfolio_url) {
                const portfolioLink = document.querySelector('#jobseeker-portfolio-link a');
                portfolioLink.href = jobseeker.portfolio_url;
                document.getElementById('jobseeker-portfolio-link').classList.remove('hidden');
                document.getElementById('jobseeker-documents-section').classList.remove('hidden');
              }

              // Applications (only for own profile or admin)
              if (data.recent_applications && data.recent_applications.length > 0) {
                const applicationsContainer = document.getElementById('jobseeker-applications');
                applicationsContainer.innerHTML = data.recent_applications.map(app => 
                  '<div class="bg-gray-50 rounded-lg p-4">' +
                    '<div class="flex justify-between items-start mb-2">' +
                      '<div>' +
                        '<h4 class="font-semibold text-gray-900">' + (app.job_title || '제목 없음') + '</h4>' +
                        '<p class="text-sm text-gray-600">' + (app.company_name || '회사명 없음') + '</p>' +
                      '</div>' +
                      '<span class="px-2 py-1 text-xs rounded-full ' + getApplicationStatusClass(app.status) + '">' +
                        getApplicationStatusText(app.status) +
                      '</span>' +
                    '</div>' +
                    '<div class="text-xs text-gray-500">' +
                      '<i class="fas fa-calendar mr-1"></i>' + formatDate(app.applied_at) +
                    '</div>' +
                  '</div>'
                ).join('');
                document.getElementById('jobseeker-applications-section').classList.remove('hidden');
              }

            } catch (error) {
              console.error('Error loading jobseeker:', error);
              document.getElementById('loading-state').classList.add('hidden');
              document.getElementById('error-state').classList.remove('hidden');
              document.getElementById('error-message').textContent = error.message;
            }
          }

          function calculateAge(birthDate) {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            return age;
          }

          function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR');
          }

          function getApplicationStatusClass(status) {
            const classes = {
              'pending': 'bg-yellow-100 text-yellow-800',
              'reviewing': 'bg-blue-100 text-blue-800',
              'accepted': 'bg-green-100 text-green-800',
              'rejected': 'bg-red-100 text-red-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
          }

          function getApplicationStatusText(status) {
            const texts = {
              'pending': '대기중',
              'reviewing': '검토중',
              'accepted': '합격',
              'rejected': '불합격'
            };
            return texts[status] || status;
          }

          // Initialize
          if (window.auth && window.auth.init) {
            window.auth.init();
          }
          loadJobseekerDetail();
        `}}>
        </script>
      </body>
    </html>
  );


// Job Detail Page - 구인정보 상세보기
}

// Middleware: optionalAuth
