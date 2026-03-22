/**
 * Login Page - Modern Unified Auth UI
 * Route: /login
 */

import type { Context } from 'hono'
import { LanguageDropdownItems } from '../components/LanguageDropdownItems'

export function LoginPage(c: Context) {
  const { t } = c.get('i18n')
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      </div>

      {/* Language Selector */}
      <div class="absolute top-4 right-4 z-50">
        <div class="relative group">
          <button class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg hover:bg-white/20 transition-all flex items-center space-x-2 text-white border border-white/20">
            <i class="fas fa-globe"></i>
            <span class="text-sm font-medium hidden sm:inline">{t('common.language')}</span>
            <i class="fas fa-chevron-down text-xs"></i>
          </button>
          <div class="absolute top-full right-0 mt-2 w-36 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <LanguageDropdownItems />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div class="max-w-5xl w-full bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 relative z-10">
        <div class="grid md:grid-cols-2 gap-0">
          {/* Left Panel - Branding */}
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-12 flex flex-col justify-center space-y-8 backdrop-blur-sm">
            {/* Logo */}
            <div class="mb-2">
              <div class="bg-white rounded-2xl p-4 inline-block mb-6 shadow-xl shadow-cyan-500/10 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/images/logo_transparent.png"
                  alt="WOW-CAMPUS"
                  class="h-16 w-auto"
                />
              </div>
              <h1 class="text-3xl font-bold text-white mb-2">WOW-CAMPUS</h1>
              <p class="text-cyan-400 font-semibold text-lg">{t('common.platform_slogan') || '외국인 유학생을 위한 취업·유학 플랫폼'}</p>
            </div>

            {/* Description */}
            <div class="space-y-6">
              <p class="text-gray-300 text-lg leading-relaxed">
                {t('auth.platform_desc') || '한국에서의 성공적인 유학과 취업을 위한 모든 것'}
              </p>

              {/* Features */}
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-briefcase text-cyan-400"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold mb-1">{t('auth.feature_jobs') || '채용 정보'}</h3>
                    <p class="text-gray-400 text-sm">{t('auth.feature_jobs_desc') || '외국인 구직자를 환영하는 기업의 채용 공고'}</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-graduation-cap text-purple-400"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold mb-1">{t('auth.feature_study') || '유학 정보'}</h3>
                    <p class="text-gray-400 text-sm">{t('auth.feature_study_desc') || '한국 대학 진학 및 어학연수 정보'}</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user-friends text-blue-400"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold mb-1">{t('auth.feature_agent') || '에이전트 지원'}</h3>
                    <p class="text-gray-400 text-sm">{t('auth.feature_agent_desc') || '전문 에이전트의 맞춤형 유학·취업 상담'}</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <div class="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-chart-line text-emerald-400"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold mb-1">{t('auth.feature_stats') || '통계 및 분석'}</h3>
                    <p class="text-gray-400 text-sm">{t('auth.feature_stats_desc') || '취업 및 유학 트렌드 분석 제공'}</p>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right Panel - Auth Forms */}
          <div class="bg-slate-800/60 backdrop-blur-sm p-8 md:p-12">
            <div class="max-w-md mx-auto">
              {/* Welcome Message */}
              <h2 class="text-3xl font-bold text-white mb-2">{t('auth.welcome') || '환영합니다'}</h2>
              <p class="text-gray-400 mb-8">{t('auth.welcome_desc') || '로그인하여 서비스를 시작하세요'}</p>

              {/* Tab Buttons */}
              <div class="flex space-x-2 mb-8 bg-slate-700/50 p-1 rounded-xl">
                <button
                  id="loginTab"
                  class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-cyan-500 text-white shadow-lg"
                  onclick="switchTab('login')"
                >
                  {t('auth.login_title') || '로그인'}
                </button>
                <button
                  id="signupTab"
                  class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-gray-400 hover:text-white hover:bg-slate-700"
                  onclick="switchTab('signup')"
                >
                  {t('auth.register_button') || '회원가입'}
                </button>
              </div>

              {/* Login Form */}
              <div id="loginForm" class="space-y-6">
                <form id="loginFormElement" class="space-y-5">
                  {/* Email */}
                  <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">{t('auth.email') || '이메일 주소'}</label>
                    <div class="relative">
                      <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="email"
                        name="email"
                        required
                        class="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all outline-none"
                        placeholder={t('auth.email_placeholder') || 'example@email.com'}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">{t('auth.password') || '비밀번호'}</label>
                    <div class="relative">
                      <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="password"
                        name="password"
                        required
                        class="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all outline-none"
                        placeholder={t('auth.password_placeholder') || '••••••••'}
                      />
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center cursor-pointer group">
                      <input type="checkbox" name="rememberMe" class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500" />
                      <span class="ml-2 text-gray-400 group-hover:text-white transition-colors">{t('auth.remember_me') || '로그인 상태 유지'}</span>
                    </label>
                    <button type="button" onclick="showFindPasswordModal()" class="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                      {t('auth.forgot_password') || '비밀번호 찾기'}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    class="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>{t('auth.login_button') || '로그인하기'}</span>
                    <i class="fas fa-arrow-right"></i>
                  </button>
                </form>

                {/* Additional Links */}
                <div class="text-center text-sm">
                  <button type="button" onclick="showFindEmailModal()" class="text-gray-400 hover:text-cyan-400 transition-colors">
                    {t('auth.find_email') || '이메일을 잊으셨나요?'}
                  </button>
                </div>
              </div>

              {/* Signup Form (Hidden by default) */}
              <div id="signupForm" class="space-y-6 hidden">
                <div class="text-center">
                  <p class="text-gray-300 mb-6">{t('auth.select_user_type') || '가입 유형을 선택하세요'}</p>

                  {/* User Type Cards */}
                  <div class="space-y-3">
                    <button
                      onclick="startSignup('jobseeker')"
                      class="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl p-6 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 transition-all group text-left"
                    >
                      <div class="flex items-center space-x-4">
                        <div class="w-14 h-14 bg-green-500/30 rounded-xl flex items-center justify-center group-hover:bg-green-500/40 transition-all">
                          <i class="fas fa-user text-2xl text-green-400"></i>
                        </div>
                        <div>
                          <h3 class="text-lg font-bold text-white mb-1">{t('auth.jobseeker') || '구직자'}</h3>
                          <p class="text-sm text-gray-400">{t('auth.jobseeker_desc') || '일자리를 찾고 계신가요?'}</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onclick="startSignup('company')"
                      class="w-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-2 border-purple-500/50 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all group text-left"
                    >
                      <div class="flex items-center space-x-4">
                        <div class="w-14 h-14 bg-purple-500/30 rounded-xl flex items-center justify-center group-hover:bg-purple-500/40 transition-all">
                          <i class="fas fa-building text-2xl text-purple-400"></i>
                        </div>
                        <div>
                          <h3 class="text-lg font-bold text-white mb-1">{t('auth.company') || '기업'}</h3>
                          <p class="text-sm text-gray-400">{t('auth.company_desc') || '인재를 채용하고 싶으신가요?'}</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onclick="startSignup('agent')"
                      class="w-full bg-gradient-to-r from-blue-500/20 to-sky-500/20 border-2 border-blue-500/50 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all group text-left"
                    >
                      <div class="flex items-center space-x-4">
                        <div class="w-14 h-14 bg-blue-500/30 rounded-xl flex items-center justify-center group-hover:bg-blue-500/40 transition-all">
                          <i class="fas fa-handshake text-2xl text-blue-400"></i>
                        </div>
                        <div>
                          <h3 class="text-lg font-bold text-white mb-1">{t('auth.agent') || '에이전트'}</h3>
                          <p class="text-sm text-gray-400">{t('auth.agent_desc') || '유학생을 지원하고 계신가요?'}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <div class="mt-8 text-center">
                <a href="/" class="text-gray-400 hover:text-white transition-colors inline-flex items-center space-x-2 text-sm">
                  <i class="fas fa-arrow-left"></i>
                  <span>{t('auth.back_to_home') || '홈으로 돌아가기'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scripts */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // Tab Switching
        function switchTab(tab) {
          const loginTab = document.getElementById('loginTab');
          const signupTab = document.getElementById('signupTab');
          const loginForm = document.getElementById('loginForm');
          const signupForm = document.getElementById('signupForm');

          if (tab === 'login') {
            loginTab.className = 'flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-cyan-500 text-white shadow-lg';
            signupTab.className = 'flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-gray-400 hover:text-white hover:bg-slate-700';
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
          } else {
            loginTab.className = 'flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-gray-400 hover:text-white hover:bg-slate-700';
            signupTab.className = 'flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-cyan-500 text-white shadow-lg';
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
          }
        }

        // Start Signup Process
        function startSignup(userType) {
          console.log('Starting signup for:', userType);
          if (typeof showUserTypeSelection === 'function') {
            showUserTypeSelection(userType);
          } else if (typeof window.showSignupModal === 'function') {
            window.showSignupModal();
          }
        }

        // Login Form Submission
        document.addEventListener('DOMContentLoaded', function() {
          const loginFormElement = document.getElementById('loginFormElement');
          if (!loginFormElement) return;

          loginFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const credentials = {
              email: formData.get('email'),
              password: formData.get('password'),
              rememberMe: formData.get('rememberMe') === 'on'
            };
            
            try {
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
              });
              
              const data = await response.json();
              
              if (data.success && data.user) {
                localStorage.setItem('wowcampus_token', data.token);
                localStorage.setItem('wowcampus_user', JSON.stringify(data.user));
                
                if (data.refreshToken) {
                  localStorage.setItem('wowcampus_refresh_token', data.refreshToken);
                }
                
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect') || '/dashboard';
                
                if (typeof showNotification === 'function') {
                  showNotification(\`✨ \${data.user.name}님, 환영합니다!\`, 'success');
                }
                
                setTimeout(() => {
                  window.location.href = redirectUrl + '?t=' + Date.now();
                }, 500);
              } else {
                if (typeof showNotification === 'function') {
                  showNotification(data.message || '로그인에 실패했습니다.', 'error');
                } else {
                  alert(data.message || '로그인에 실패했습니다.');
                }
              }
            } catch (error) {
              console.error('Login error:', error);
              if (typeof showNotification === 'function') {
                showNotification('로그인 중 오류가 발생했습니다.', 'error');
              } else {
                alert('로그인 중 오류가 발생했습니다.');
              }
            }
          });
        });
      `}}></script>
    </div>
  )
}
