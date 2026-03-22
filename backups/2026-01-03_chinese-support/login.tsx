/**
 * Login Page
 * Route: /login
 * 원본: src/index.tsx 라인 13216-13314
 */

import type { Context } from 'hono'

export function LoginPage(c: Context) {
  const { t } = c.get('i18n')
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 relative">
      {/* Language Selector - Top Right */}
      <div class="absolute top-4 right-4 z-50">
        <div class="relative group">
          <button class="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-2 text-gray-700 hover:text-blue-600 border border-gray-200">
            <i class="fas fa-globe text-sm"></i>
            <span class="text-sm font-medium hidden sm:inline">{t('common.language')}</span>
            <i class="fas fa-chevron-down text-xs"></i>
          </button>
          <div class="absolute top-full right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <a href="?lang=ko" onclick="document.cookie='app_lang=ko; path=/; max-age=31536000'; window.location.reload(); return false;" class="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">한국어</a>
            <a href="?lang=en" onclick="document.cookie='app_lang=en; path=/; max-age=31536000'; window.location.reload(); return false;" class="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">English</a>
            <a href="?lang=ja" onclick="document.cookie='app_lang=ja; path=/; max-age=31536000'; window.location.reload(); return false;" class="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">日本語</a>
            <a href="?lang=vi" onclick="document.cookie='app_lang=vi; path=/; max-age=31536000'; window.location.reload(); return false;" class="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Tiếng Việt</a>
            <a href="?lang=zh" onclick="document.cookie='app_lang=zh; path=/; max-age=31536000'; window.location.reload(); return false;" class="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">中文</a>
          </div>
        </div>
      </div>

      <div class="max-w-md w-full">
        {/* Logo and Title */}
        <div class="text-center mb-8">
          <a href="/" class="inline-flex items-center space-x-3 mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-white font-bold text-2xl">W</span>
            </div>
            <span class="font-bold text-3xl text-gray-900">WOW-CAMPUS</span>
          </a>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{t('auth.login_title')}</h1>
          <p class="text-gray-600">{t('auth.welcome_message')}</p>
        </div>

        {/* Login Form */}
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <form id="loginForm" class="space-y-6">
            {/* Email */}
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-envelope mr-2 text-blue-600"></i>{t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('auth.email_placeholder')}
              />
            </div>

            {/* Password */}
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-lock mr-2 text-blue-600"></i>{t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('auth.password_placeholder')}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input type="checkbox" name="rememberMe" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span class="ml-2 text-sm text-gray-600">{t('auth.remember_me')}</span>
              </label>
              <a href="#" class="text-sm text-blue-600 hover:text-blue-700">{t('auth.forgot_password')}</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              <i class="fas fa-sign-in-alt mr-2"></i>{t('auth.login_button')}
            </button>
          </form>

          {/* Divider */}
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">{t('auth.or')}</span>
            </div>
          </div>

          {/* Register Link */}
          <div class="text-center">
            <p class="text-gray-600 mb-4">{t('auth.no_account')}</p>
            <a
              href="/dashboard"
              class="inline-block w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <i class="fas fa-user-plus mr-2"></i>{t('auth.register_button')}
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div class="text-center mt-6">
          <a href="/" class="text-gray-600 hover:text-gray-900">
            <i class="fas fa-arrow-left mr-2"></i>{t('auth.back_to_home')}
          </a>
        </div>
      </div>

      {/* Login Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const rememberMe = formData.get('rememberMe') === 'on' || formData.get('rememberMe') === 'true';
          const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: rememberMe
          };
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              credentials: 'include', // 쿠키 포함
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
              console.log('✅ 로그인 성공!', data);
              
              // 토큰 저장
              console.log('💾 토큰 저장 중...', data.token);
              localStorage.setItem('wowcampus_token', data.token);
              localStorage.setItem('wowcampus_user', JSON.stringify(data.user));
              
              // Refresh Token도 저장 (선택사항)
              if (data.refreshToken) {
                localStorage.setItem('wowcampus_refresh_token', data.refreshToken);
              }
              
              // 저장 확인
              const savedToken = localStorage.getItem('wowcampus_token');
              console.log('✅ 토큰 저장 확인:', savedToken ? '성공' : '실패');
              
              // redirect 파라미터 확인
              const urlParams = new URLSearchParams(window.location.search);
              const redirectUrl = urlParams.get('redirect');
              console.log('🔄 리디렉션 URL:', redirectUrl || '/dashboard');
              
              // 성공 알림
              if (typeof showNotification === 'function') {
                showNotification(\`✨ \${data.user.name}님, 다시 만나서 반가워요!\`, 'success');
              } else {
                alert(\`✨ \${data.user.name}님, 다시 만나서 반가워요!\`);
              }
              
              // 리디렉션 (완전히 새로 로드)
              setTimeout(() => {
                console.log('🚀 페이지 이동 시작...');
                const targetUrl = redirectUrl || '/dashboard';
                
                // location.href로 완전히 새로운 페이지 로드
                console.log('🔄 대상 URL:', targetUrl);
                
                // 먼저 토큰이 제대로 저장되었는지 재확인
                const verifyToken = localStorage.getItem('wowcampus_token');
                console.log('🔐 토큰 재확인:', verifyToken ? '존재함 ✅' : '없음 ❌');
                
                if (verifyToken) {
                  // 강제로 페이지를 완전히 새로 로드 (캐시 무시)
                  window.location.href = targetUrl + '?t=' + Date.now();
                } else {
                  console.error('❌ 토큰 저장 실패! 다시 시도해주세요.');
                  alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                }
              }, 500);
              
            } else {
              console.error('❌ 로그인 실패:', data);
              if (typeof showNotification === 'function') {
                showNotification(data.message || '로그인에 실패했습니다.', 'error');
              } else {
                alert(data.message || '로그인에 실패했습니다.');
              }
            }
          } catch (error) {
            console.error('❌ 로그인 오류:', error);
            if (typeof showNotification === 'function') {
              showNotification('로그인 중 오류가 발생했습니다.', 'error');
            } else {
              alert('로그인 중 오류가 발생했습니다.');
            }
          }
        });
      `}}></script>
    </div>
  )
}
