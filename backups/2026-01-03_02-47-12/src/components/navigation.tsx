/**
 * Common Navigation Component
 * 모든 페이지에서 사용하는 공통 네비게이션 헤더
 */

export const NavigationHeader = () => {
  return (
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <a href="/home" class="flex items-center space-x-3">
            <img src="/images/logo.png" alt="WOW CAMPUS" class="h-12" />
            <span class="text-2xl font-bold text-purple-600">WOW CAMPUS</span>
          </a>
        </div>

        {/* Desktop Navigation Menu */}
        <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
          {/* 동적 메뉴가 여기에 로드됩니다 */}
        </div>

        {/* Desktop Auth Buttons */}
        <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
          {/* 동적 인증 버튼이 여기에 로드됩니다 */}
        </div>

        {/* Mobile Menu Button */}
        <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
          <i class="fas fa-bars text-2xl"></i>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
        <div class="container mx-auto px-4 py-4 space-y-3">
          {/* Mobile Navigation Menu */}
          <div id="mobile-navigation-menu" class="space-y-2">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>

          {/* Mobile Auth Buttons */}
          <div id="mobile-auth-buttons" class="pt-3 border-t border-gray-200">
            {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Navigation Script
 * 네비게이션 초기화 및 동적 메뉴 로드를 위한 스크립트
 */
export const NavigationScript = `
  <script>
    (function() {
      // 모바일 메뉴 토글 초기화
      function initMobileMenuToggle() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
          mobileMenuBtn.addEventListener('click', function() {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
              mobileMenu.classList.remove('hidden');
              mobileMenuBtn.innerHTML = '<i class="fas fa-times text-2xl"></i>';
            } else {
              mobileMenu.classList.add('hidden');
              mobileMenuBtn.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
            }
          });
        }
      }
      
      // DOMContentLoaded 이벤트에서 초기화
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenuToggle);
      } else {
        initMobileMenuToggle();
      }
      
      // index.tsx의 전역 초기화가 실행될 때도 재초기화
      window.addEventListener('wowcampus-init', initMobileMenuToggle);
    })();
  </script>
`;
