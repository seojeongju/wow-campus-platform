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
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABlCAYAAAD3Xd5lAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QsMBR0y8emRNAAAcSJJREFUeNrtfWeYlEUa7amqL3Wa7p4IDAw5m0BUVDBgRkyYc06YI66BNWfMrgGzmAMoZlFRBBGQnMMwOXdPT8cvVdX90T0Iguvu6q7ee/vw9DM8M1256tRbVW8A8sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPP7LIH9m4e81SQKgEEC7FoQAQRhACoB9hPG/qdr9c2oQ0FVaH09VrGrvMOotS1KNoX+Bn/QLFrQ5QrTdsWfP/EzZAi+9+xM8Xk/JTz8tLVqyeLVsj3VAUQz0qCghe+xx0OrVq0tNIpnmZx2zb76z/h/EvY99gcJwqHTZypWFq9euk7H2DhQUBNG7dynZYVBvs0eP7jXxeEKce8r+f3jZ/zErPPH1Ckgpdv6mruGEdocpBjWkIH44NM3CLDLn3VN3+vCh2bXimn1Gb0sS36zEjj2LlZnLai5qEf6jaloTS5mwnZIK3w6w4xt8mdQ9krGWF088ZLtl3zp9AShk39URcV4l5wRKAoYdgtcUtEdBYu7Ubxoup18++1fr/npNEh5NVX/aVF1Yt6l1z5RU97U0Y1yE0OIOECmJRBEFDUq+MOTac1S475V0LVotHO48MGbwNvkd+tTbgJS9bb3wfMoKqSmTcBRBAtzLh/j8r61qi62cefHe263Lo1+vQUXAUD5d03hSpRA7Q3JemKawmIcFvZm1e3VteeGiA8eLX2vLxe/OQlBh41YkzX2RYVwSFZaUrMhJbSpKtD2bNALuK1cc/bsnysVX3g8pHK05kh4SS9rjXaGOcgUZ3t6eEpblglEFXi8loTDaTSv2UWlhaPbAngNnn3Li+GgmY9qjRvb4l8q56YEXwV13zy+/mntMNGYJBRQUAplMhgwfsXNy//32fDIeT0ZvueLY38yr77BjQKR1tENCe7vwc0okKE+yHQaWb7j0whOfe3/G13zKIxP/5T4oG3QEdtlp8JBNNZFTTYsqFKq0LAuD+hWIo48c9RznovLqC48HABx50gRIKfesrbaOcRwmHNkGoigg0g8pJQAJwSmkBCgDVB0IBj1kYL8eaTNtvz2ob//GDz75NLbo+1e3qcfDT70PzvmQ6Z98c8bG2igYVcAUP6SIs9Ji+WNTi/lu3dJp/7Qt48+47vQfF9bu5HAPp6oDQUwEvV7Rr1f5c1LKys/evner71/7t8fguKYWibg7NTTFj3akuo8gZKdYIiks2wFjKgI+kKBfiTQ1NHy449D+MVUl7+wwtF/jl1/Pjn85/ak/hLCU/zRhJJMG5bzZJji... (line truncated)" alt="WOW CAMPUS" class="h-12" />
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
