            console.log('Authentication JavaScript loading...');
            
            // Helper function to get user type label
            function getUserTypeLabel(userType) {
              const labels = {
                jobseeker: '구직자',
                company: '구인기업', 
                agent: '에이전트',
                admin: '관리자'
              };
              return labels[userType] || '사용자';
            }
            
            // 🔐 로그인 모달 표시
            function showLoginModal() {
              console.log('로그인 모달 호출됨');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"]');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modalId = 'loginModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999'; // 매우 높은 z-index
              modal.innerHTML = `
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">로그인</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
                      <i class="fas fa-times text-xl"></i>
                    </button>
                  </div>
                  
                  <form id="loginForm" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이메일을 입력하세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 입력하세요" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        로그인
                      </button>
                    </div>
                    
                    <!-- 아이디/비밀번호 찾기 링크 -->
                    <div class="mt-4 text-center text-sm">
                      <div class="flex justify-center space-x-4">
                        <button type="button" class="find-email-btn text-blue-600 hover:text-blue-800 underline">
                          이메일 찾기
                        </button>
                        <span class="text-gray-400">|</span>
                        <button type="button" class="find-password-btn text-blue-600 hover:text-blue-800 underline">
                          비밀번호 찾기
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              `;
              
              // 페이지 스크롤 및 상호작용 비활성화
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              
              document.body.appendChild(modal);
              
              // 모든 클릭 이벤트 완전 차단 (모달 외부)
              const stopAllEvents = function(event) {
                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent.contains(event.target)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              
              // 강력한 이벤트 차단 - 캡처링과 버블링 단계 모두에서 차단
              document.addEventListener('click', stopAllEvents, true);
              document.addEventListener('mousedown', stopAllEvents, true);
              document.addEventListener('mouseup', stopAllEvents, true);
              document.addEventListener('touchstart', stopAllEvents, true);
              document.addEventListener('touchend', stopAllEvents, true);
              
              // ESC 키로 모달 닫기
              const handleEscape = function(event) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }
              };
              document.addEventListener('keydown', handleEscape, true);
              
              // 닫기 버튼 이벤트 - 직접 이벤트 리스너 추가
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 취소 버튼 이벤트 - 직접 이벤트 리스너 추가
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 폼 제출 이벤트
              const loginForm = document.getElementById('loginForm');
              loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleLogin(event);
              }, true);
              
              // 이메일 찾기 버튼 이벤트
              const findEmailBtn = modal.querySelector('.find-email-btn');
              findEmailBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
                showFindEmailModal();
              }, true);
              
              // 비밀번호 찾기 버튼 이벤트
              const findPasswordBtn = modal.querySelector('.find-password-btn');
              findPasswordBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
                showFindPasswordModal();
              }, true);
              
              // 모달 정리 함수
              modal._cleanup = function() {
                document.removeEventListener('keydown', handleEscape, true);
                document.removeEventListener('click', stopAllEvents, true);
                document.removeEventListener('mousedown', stopAllEvents, true);
                document.removeEventListener('mouseup', stopAllEvents, true);
                document.removeEventListener('touchstart', stopAllEvents, true);
                document.removeEventListener('touchend', stopAllEvents, true);
                
                // 페이지 스크롤 및 상호작용 복원
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
              };
              
              // 첫 번째 입력 필드에 포커스
              setTimeout(() => {
                const firstInput = modal.querySelector('input[name="email"]');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
            
            // 📝 회원가입 모달 표시  
            function showSignupModal() {
              console.log('회원가입 모달 호출됨');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('[id^="signupModal"], [id^="loginModal"]');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modalId = 'signupModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999'; // 매우 높은 z-index
              modal.innerHTML = `
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
                    <button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">
                      <i class="fas fa-times text-xl"></i>
                    </button>
                  </div>
                  
                  <form id="signupForm" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
                      <select name="user_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">선택해주세요</option>
                        <option value="company">구인기업</option>
                        <option value="jobseeker">구직자</option>
                        <option value="agent">에이전트</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
                      <input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="이름을 입력해주세요" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="example@email.com" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호</label>
                      <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="010-1234-5678 또는 01012345678" maxlength="13" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">지역</label>
                      <select name="location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">지역을 선택해주세요</option>
                        <option value="서울">서울</option>
                        <option value="경기도">경기도</option>
                        <option value="강원도">강원도</option>
                        <option value="충청도">충청도</option>
                        <option value="경상도">경상도</option>
                        <option value="전라도">전라도</option>
                        <option value="제주도">제주도</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                      <input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required minlength="6" placeholder="최소 6자 이상" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                      <input type="password" name="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required placeholder="비밀번호를 다시 입력하세요" />
                    </div>
                    
                    <div class="flex space-x-3">
                      <button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        취소
                      </button>
                      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        회원가입
                      </button>
                    </div>
                  </form>
                </div>
              `;
              
              // 페이지 스크롤 및 상호작용 비활성화
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              
              document.body.appendChild(modal);
              
              // 모든 클릭 이벤트 완전 차단 (모달 외부)
              const stopAllEvents = function(event) {
                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent.contains(event.target)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              
              // 강력한 이벤트 차단 - 캡처링과 버블링 단계 모두에서 차단
              document.addEventListener('click', stopAllEvents, true);
              document.addEventListener('mousedown', stopAllEvents, true);
              document.addEventListener('mouseup', stopAllEvents, true);
              document.addEventListener('touchstart', stopAllEvents, true);
              document.addEventListener('touchend', stopAllEvents, true);
              
              // ESC 키로 모달 닫기
              const handleEscape = function(event) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }
              };
              document.addEventListener('keydown', handleEscape, true);
              
              // 닫기 버튼 이벤트 - 직접 이벤트 리스너 추가
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 취소 버튼 이벤트 - 직접 이벤트 리스너 추가
              const cancelBtn = modal.querySelector('.cancel-btn');
              cancelBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 폼 제출 이벤트
              const signupForm = document.getElementById('signupForm');
              signupForm.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleSignup(event);
              }, true);
              
              // 모달 정리 함수
              modal._cleanup = function() {
                document.removeEventListener('keydown', handleEscape, true);
                document.removeEventListener('click', stopAllEvents, true);
                document.removeEventListener('mousedown', stopAllEvents, true);
                document.removeEventListener('mouseup', stopAllEvents, true);
                document.removeEventListener('touchstart', stopAllEvents, true);
                document.removeEventListener('touchend', stopAllEvents, true);
                
                // 페이지 스크롤 및 상호작용 복원
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
              };
              
              // 첫 번째 입력 필드에 포커스
              setTimeout(() => {
                const firstInput = modal.querySelector('select[name="user_type"]');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
            
            // 모달 안전하게 닫기 함수
            function closeModal(modal) {
              if (modal && modal.parentElement) {
                console.log('모달 닫기 시작');
                
                // 이벤트 리스너 정리
                if (modal._cleanup) {
                  modal._cleanup();
                }
                
                // 페이지 상호작용 복원
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
                
                // 모달 제거
                modal.remove();
                
                console.log('모달 닫기 완료');
              }
            }
            
            // 전역에서 모든 모달을 강제로 닫는 함수 (비상용)
            function closeAllModals() {
              const allModals = document.querySelectorAll('[id^="signupModal"], [id^="loginModal"], [id^="findEmailModal"], [id^="findPasswordModal"]');
              allModals.forEach(modal => {
                if (modal._cleanup) {
                  modal._cleanup();
                }
                modal.remove();
              });
              
              // 페이지 상태 복원
              document.body.style.overflow = '';
              document.body.classList.remove('modal-open');
              
              console.log('모든 모달 강제 닫기 완료');
            }
            
            // Dummy functions for compatibility
            function showFindEmailModal() {
              alert('이메일 찾기 기능은 개발 중입니다.');
            }
            
            function showFindPasswordModal() {
              alert('비밀번호 찾기 기능은 개발 중입니다.');
            }
            
            function handleLogin(event) {
              const form = event.target;
              const formData = new FormData(form);
              const email = formData.get('email');
              const password = formData.get('password');
              
              console.log('로그인 시도:', { email, password: '***' });
              alert('로그인 기능은 백엔드 연동 후 구현 예정입니다.');
            }
            
            function handleSignup(event) {
              const form = event.target;
              const formData = new FormData(form);
              const data = {};
              for (let [key, value] of formData.entries()) {
                data[key] = value;
              }
              
              console.log('회원가입 시도:', data);
              alert('회원가입 기능은 백엔드 연동 후 구현 예정입니다.');
            }
            
            // Make functions available globally
            window.showLoginModal = showLoginModal;
            window.showSignupModal = showSignupModal;
            window.closeModal = closeModal;
            window.closeAllModals = closeAllModals;
            
            // Initialize service dropdown menu for homepage
            document.addEventListener('DOMContentLoaded', function() {
              console.log('Initializing homepage service dropdown menu...');
              
              // Service menu configuration with updated structure
              const serviceMenuConfig = {
                guest: [
                  { href: '/jobs', label: '구인정보 보기', icon: 'fas fa-briefcase' },
                  { href: '/jobseekers', label: '구직정보 보기', icon: 'fas fa-user-tie' },
                  { href: '/study', label: '유학정보 보기', icon: 'fas fa-graduation-cap' }
                ]
              };
              
              // Update service dropdown menu
              function updateServiceDropdownMenu() {
                const serviceDropdown = document.getElementById('service-dropdown-container');
                if (serviceDropdown) {
                  const serviceMenus = serviceMenuConfig.guest;
                  
                  const serviceHtml = serviceMenus.map(menu => `
                    <a href="${menu.href}" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <i class="${menu.icon} mr-2"></i>${menu.label}
                    </a>
                  `).join('');
                  
                  serviceDropdown.innerHTML = serviceHtml;
                  console.log('Desktop service menu updated with', serviceMenus.length, 'items');
                }
                
                // Update mobile service menu
                const mobileServiceMenu = document.getElementById('mobile-service-menu-container');
                if (mobileServiceMenu) {
                  const serviceMenus = serviceMenuConfig.guest;
                  
                  const mobileServiceHtml = serviceMenus.map(menu => `
                    <a href="${menu.href}" class="block pl-4 py-2 text-gray-600 hover:text-blue-600">
                      <i class="${menu.icon} mr-2"></i>${menu.label}
                    </a>
                  `).join('');
                  
                  mobileServiceMenu.innerHTML = mobileServiceHtml;
                  console.log('Mobile service menu updated with', serviceMenus.length, 'items');
                }
              }
              
              // Initialize service menu
              updateServiceDropdownMenu();
              
              // Mobile menu toggle
              const mobileMenuBtn = document.getElementById('mobile-menu-btn');
              const mobileMenu = document.getElementById('mobile-menu');
              
              if (mobileMenuBtn && mobileMenu) {
                mobileMenuBtn.addEventListener('click', function() {
                  mobileMenu.classList.toggle('hidden');
                });
              }
              
              console.log('Homepage initialization complete!');
            });
            
            // 🚀 시작하기 모달 및 온보딩 시스템
            
            // 시작하기 모달 표시 (사용자 유형 선택)
            function showGetStartedModal() {
              console.log('시작하기 모달 호출됨');
              
              // 기존 모달이 있으면 제거
              const existingModal = document.querySelector('[id^="getStartedModal"]');
              if (existingModal) {
                existingModal.remove();
              }
              
              const modalId = 'getStartedModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = '' +
                '<div class="bg-white rounded-lg p-8 max-w-lg w-full mx-4 modal-content" style="position: relative; z-index: 10000;">' +
                  '<div class="flex justify-between items-center mb-6">' +
                    '<h2 class="text-2xl font-bold text-gray-900">시작하기</h2>' +
                    '<button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">' +
                      '<i class="fas fa-times text-xl"></i>' +
                    '</button>' +
                  '</div>' +
                  '' +
                  '<div class="text-center mb-6">' +
                    '<p class="text-gray-600">어떤 유형의 사용자이신가요? 맞춤형 온보딩을 제공해드립니다.</p>' +
                  '</div>' +
                  '' +
                  '<div class="grid grid-cols-2 gap-4">' +
                    '<!-- 구직자 -->' +
                    '<button onclick="startOnboarding(&quot;jobseeker&quot;)" class="group relative p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:border-green-300 hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-105">' +
                      '<div class="text-center">' +
                        '<div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                          '<i class="fas fa-user-tie text-2xl text-white"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-semibold text-green-800 mb-2">구직자</h3>' +
                        '<p class="text-sm text-green-600">일자리를 찾고 있어요</p>' +
                      '</div>' +
                      '<div class="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>' +
                    '</button>' +
                    '' +
                    '<!-- 기업 -->' +
                    '<button onclick="startOnboarding(&quot;company&quot;)" class="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-105">' +
                      '<div class="text-center">' +
                        '<div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                          '<i class="fas fa-building text-2xl text-white"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-semibold text-blue-800 mb-2">기업</h3>' +
                        '<p class="text-sm text-blue-600">인재를 채용하고 싶어요</p>' +
                      '</div>' +
                      '<div class="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>' +
                    '</button>' +
                    '' +
                    '<!-- 에이전트 -->' +
                    '<button onclick="startOnboarding(&quot;agent&quot;)" class="group relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 transform hover:scale-105">' +
                      '<div class="text-center">' +
                        '<div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                          '<i class="fas fa-handshake text-2xl text-white"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-semibold text-purple-800 mb-2">에이전트</h3>' +
                        '<p class="text-sm text-purple-600">매칭 서비스를 제공해요</p>' +
                      '</div>' +
                      '<div class="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>' +
                    '</button>' +
                    '' +
                    '<!-- 유학생 -->' +
                    '<button onclick="startOnboarding(&quot;student&quot;)" class="group relative p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg hover:border-orange-300 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 transform hover:scale-105">' +
                      '<div class="text-center">' +
                        '<div class="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                          '<i class="fas fa-graduation-cap text-2xl text-white"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-semibold text-orange-800 mb-2">유학생</h3>' +
                        '<p class="text-sm text-orange-600">한국에서 공부하고 싶어요</p>' +
                      '</div>' +
                      '<div class="absolute inset-0 bg-orange-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>' +
                    '</button>' +
                  '</div>' +
                  '' +
                  '<div class="mt-6 text-center">' +
                    '<button onclick="closeModal(this.closest(&quot;.modal-overlay&quot;))" class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors">' +
                      '나중에 하기' +
                    '</button>' +
                  '</div>' +
                '</div>';
              
              // 페이지 스크롤 비활성화
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              
              document.body.appendChild(modal);
              
              // 모달 외부 클릭 차단
              const stopAllEvents = function(event) {
                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent.contains(event.target)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              
              document.addEventListener('click', stopAllEvents, true);
              document.addEventListener('mousedown', stopAllEvents, true);
              document.addEventListener('mouseup', stopAllEvents, true);
              
              // ESC 키로 모달 닫기
              const handleEscape = function(event) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }
              };
              document.addEventListener('keydown', handleEscape, true);
              
              // 닫기 버튼 이벤트
              const closeBtn = modal.querySelector('.close-modal-btn');
              closeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                closeModal(modal);
              }, true);
              
              // 모달 정리 함수
              modal._cleanup = function() {
                document.removeEventListener('keydown', handleEscape, true);
                document.removeEventListener('click', stopAllEvents, true);
                document.removeEventListener('mousedown', stopAllEvents, true);
                document.removeEventListener('mouseup', stopAllEvents, true);
                
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
              };
            }
            
            // 온보딩 시작 함수
            function startOnboarding(userType) {
              console.log('온보딩 시작:', userType);
              
              // 현재 모달 닫기
              const currentModal = document.querySelector('[id^="getStartedModal"]');
              if (currentModal) {
                closeModal(currentModal);
              }
              
              // 사용자 유형을 localStorage에 저장
              localStorage.setItem('wowcampus_onboarding_type', userType);
              
              // 사용자 유형별 메시지 설정
              const userTypeConfig = {
                jobseeker: {
                  title: '구직자 온보딩',
                  message: '좋은 일자리를 찾기 위한 첫걸음을 시작해보세요!',
                  color: 'green',
                  icon: 'fas fa-user-tie',
                  nextAction: '구직자 회원가입'
                },
                company: {
                  title: '기업 온보딩',
                  message: '우수한 외국인 인재를 찾아 성공적인 채용을 경험하세요!',
                  color: 'blue',
                  icon: 'fas fa-building',
                  nextAction: '기업 회원가입'
                },
                agent: {
                  title: '에이전트 온보딩',
                  message: '전문적인 매칭 서비스로 높은 성과를 달성해보세요!',
                  color: 'purple',
                  icon: 'fas fa-handshake',
                  nextAction: '에이전트 회원가입'
                },
                student: {
                  title: '유학생 온보딩',
                  message: '한국에서의 성공적인 유학 생활을 시작해보세요!',
                  color: 'orange',
                  icon: 'fas fa-graduation-cap',
                  nextAction: '유학생 회원가입'
                }
              };
              
              const config = userTypeConfig[userType] || userTypeConfig.jobseeker;
              
              // 진행 상황 표시 모달
              showOnboardingProgress(config, userType);
            }
            
            // 온보딩 진행 상황 모달
            function showOnboardingProgress(config, userType) {
              const modalId = 'onboardingProgressModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              modal.innerHTML = '' +
                '<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content" style="position: relative; z-index: 10000;">' +
                  '<div class="text-center">' +
                    '<div class="w-20 h-20 bg-' + config.color + '-600 rounded-full flex items-center justify-center mx-auto mb-6">' +
                      '<i class="' + config.icon + ' text-3xl text-white"></i>' +
                    '</div>' +
                    '' +
                    '<h2 class="text-2xl font-bold text-gray-900 mb-4">' + config.title + '</h2>' +
                    '<p class="text-gray-600 mb-6">' + config.message + '</p>' +
                    '' +
                    '<div class="space-y-4 mb-8">' +
                      '<div class="flex items-center text-left">' +
                        '<div class="w-8 h-8 bg-' + config.color + '-600 rounded-full flex items-center justify-center mr-3">' +
                          '<i class="fas fa-check text-white text-sm"></i>' +
                        '</div>' +
                        '<span class="text-gray-800">사용자 유형 선택 완료</span>' +
                      '</div>' +
                      '' +
                      '<div id="progress-step-2" class="flex items-center text-left opacity-50">' +
                        '<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">' +
                          '<span class="text-white text-sm font-bold">2</span>' +
                        '</div>' +
                        '<span class="text-gray-600">회원가입 및 프로필 작성</span>' +
                      '</div>' +
                      '' +
                      '<div id="progress-step-3" class="flex items-center text-left opacity-50">' +
                        '<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">' +
                          '<span class="text-white text-sm font-bold">3</span>' +
                        '</div>' +
                        '<span class="text-gray-600">서비스 이용 시작</span>' +
                      '</div>' +
                    '</div>' +
                    '' +
                    '<button onclick="showOnboardingSignupModal(&quot;' + userType + '&quot;)" class="w-full bg-' + config.color + '-600 text-white py-3 px-6 rounded-lg hover:bg-' + config.color + '-700 transition-colors font-medium">' +
                      config.nextAction + ' <i class="fas fa-arrow-right ml-2"></i>' +
                    '</button>' +
                    '' +
                    '<button onclick="closeModal(this.closest(&quot;.modal-overlay&quot;))" class="mt-3 text-gray-500 hover:text-gray-700 text-sm">' +
                      '나중에 하기' +
                    '</button>' +
                  '</div>' +
                '</div>';
              
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              document.body.appendChild(modal);
              
              // 애니메이션 효과로 2단계 활성화
              setTimeout(() => {
                const step2 = document.getElementById('progress-step-2');
                if (step2) {
                  step2.classList.remove('opacity-50');
                  const circle = step2.querySelector('div');
                  circle.className = 'w-8 h-8 bg-' + config.color + '-600 rounded-full flex items-center justify-center mr-3';
                  circle.innerHTML = '<i class="fas fa-spinner fa-spin text-white text-sm"></i>';
                }
              }, 1000);
              
              // 기본 모달 이벤트 설정
              setupModalEvents(modal);
            }
            
            // 온보딩 회원가입 모달
            function showOnboardingSignupModal(userType) {
              console.log('온보딩 회원가입 모달:', userType);
              
              // 현재 모달 닫기
              const currentModal = document.querySelector('[id^="onboardingProgressModal"]');
              if (currentModal) {
                closeModal(currentModal);
              }
              
              const userTypeConfig = {
                jobseeker: {
                  title: '구직자 회원가입',
                  subtitle: '꿈의 직장을 찾기 위한 첫걸음',
                  color: 'green',
                  icon: 'fas fa-user-tie',
                  fields: [
                    { name: 'desired_job', label: '희망 직종', type: 'text', placeholder: '예: 소프트웨어 개발자, 마케팅 담당자' },
                    { name: 'experience_level', label: '경력 수준', type: 'select', options: [
                      { value: 'entry', label: '신입 (경력 무관)' },
                      { value: '1-3', label: '1-3년' },
                      { value: '3-5', label: '3-5년' },
                      { value: '5+', label: '5년 이상' }
                    ]},
                    { name: 'skills', label: '주요 기술/스킬', type: 'text', placeholder: '예: Java, Python, 디자인, 마케팅' }
                  ]
                },
                company: {
                  title: '기업 회원가입',
                  subtitle: '우수한 인재와의 만남을 시작하세요',
                  color: 'blue',
                  icon: 'fas fa-building',
                  fields: [
                    { name: 'company_name', label: '회사명', type: 'text', placeholder: '회사명을 입력하세요' },
                    { name: 'business_type', label: '업종', type: 'select', options: [
                      { value: 'IT', label: 'IT/소프트웨어' },
                      { value: 'manufacturing', label: '제조업' },
                      { value: 'service', label: '서비스업' },
                      { value: 'finance', label: '금융업' },
                      { value: 'education', label: '교육업' },
                      { value: 'other', label: '기타' }
                    ]},
                    { name: 'company_size', label: '기업 규모', type: 'select', options: [
                      { value: 'startup', label: '스타트업 (1-50명)' },
                      { value: 'medium', label: '중견기업 (51-300명)' },
                      { value: 'large', label: '대기업 (300명 이상)' }
                    ]}
                  ]
                },
                agent: {
                  title: '에이전트 회원가입',
                  subtitle: '전문 매칭 서비스 제공자로 시작하세요',
                  color: 'purple',
                  icon: 'fas fa-handshake',
                  fields: [
                    { name: 'agency_name', label: '에이전시명', type: 'text', placeholder: '에이전시명을 입력하세요' },
                    { name: 'specialization', label: '전문 분야', type: 'select', options: [
                      { value: 'IT', label: 'IT 인재' },
                      { value: 'manufacturing', label: '제조업 인재' },
                      { value: 'service', label: '서비스업 인재' },
                      { value: 'all', label: '전 분야' }
                    ]},
                    { name: 'experience_years', label: '에이전트 경력', type: 'select', options: [
                      { value: '1', label: '1년 미만' },
                      { value: '1-3', label: '1-3년' },
                      { value: '3-5', label: '3-5년' },
                      { value: '5+', label: '5년 이상' }
                    ]}
                  ]
                },
                student: {
                  title: '유학생 회원가입',
                  subtitle: '한국에서의 성공적인 학업을 시작하세요',
                  color: 'orange',
                  icon: 'fas fa-graduation-cap',
                  fields: [
                    { name: 'study_field', label: '희망 전공', type: 'text', placeholder: '예: 컴퓨터공학, 경영학, 한국어학' },
                    { name: 'education_level', label: '학위 과정', type: 'select', options: [
                      { value: 'language', label: '어학연수' },
                      { value: 'bachelor', label: '학사 과정' },
                      { value: 'master', label: '석사 과정' },
                      { value: 'phd', label: '박사 과정' }
                    ]},
                    { name: 'korean_level', label: '한국어 수준', type: 'select', options: [
                      { value: 'beginner', label: '초급' },
                      { value: 'intermediate', label: '중급' },
                      { value: 'advanced', label: '고급' },
                      { value: 'native', label: '원어민 수준' }
                    ]}
                  ]
                }
              };
              
              const config = userTypeConfig[userType] || userTypeConfig.jobseeker;
              
              const modalId = 'onboardingSignupModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              
              // 추가 필드 HTML 생성
              const additionalFields = config.fields.map(field => {
                if (field.type === 'select') {
                  const options = field.options.map(opt => 
                    '<option value="' + opt.value + '">' + opt.label + '</option>'
                  ).join('');
                  return '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">' + field.label + '</label>' +
                      '<select name="' + field.name + '" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required>' +
                        '<option value="">선택해주세요</option>' +
                        options +
                      '</select>' +
                    '</div>';
                } else {
                  return '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">' + field.label + '</label>' +
                      '<input type="' + field.type + '" name="' + field.name + '" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" placeholder="' + field.placeholder + '" required />' +
                    '</div>';
                }
              }).join('');
              
              modal.innerHTML = '' +
                '<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 modal-content max-h-screen overflow-y-auto" style="position: relative; z-index: 10000;">' +
                  '<div class="flex justify-between items-center mb-6">' +
                    '<div class="flex items-center">' +
                      '<div class="w-10 h-10 bg-' + config.color + '-600 rounded-full flex items-center justify-center mr-3">' +
                        '<i class="' + config.icon + ' text-white"></i>' +
                      '</div>' +
                      '<div>' +
                        '<h2 class="text-xl font-bold text-gray-900">' + config.title + '</h2>' +
                        '<p class="text-sm text-gray-600">' + config.subtitle + '</p>' +
                      '</div>' +
                    '</div>' +
                    '<button type="button" class="close-modal-btn text-gray-500 hover:text-gray-700" style="z-index: 10001;">' +
                      '<i class="fas fa-times text-xl"></i>' +
                    '</button>' +
                  '</div>' +
                  '' +
                  '<form id="onboardingSignupForm" class="space-y-4">' +
                    '<input type="hidden" name="user_type" value="' + userType + '" />' +
                    '' +
                    '<!-- 기본 정보 -->' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>' +
                      '<input type="text" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required placeholder="이름을 입력하세요" />' +
                    '</div>' +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>' +
                      '<input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required placeholder="example@email.com" />' +
                    '</div>' +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>' +
                      '<input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" placeholder="010-1234-5678" />' +
                    '</div>' +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">지역 *</label>' +
                      '<select name="location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required>' +
                        '<option value="">지역을 선택하세요</option>' +
                        '<option value="서울">서울</option>' +
                        '<option value="경기도">경기도</option>' +
                        '<option value="강원도">강원도</option>' +
                        '<option value="충청도">충청도</option>' +
                        '<option value="경상도">경상도</option>' +
                        '<option value="전라도">전라도</option>' +
                        '<option value="제주도">제주도</option>' +
                      '</select>' +
                    '</div>' +
                    '' +
                    '<!-- 사용자 유형별 추가 필드 -->' +
                    additionalFields +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 *</label>' +
                      '<input type="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required minlength="6" placeholder="최소 6자 이상" />' +
                    '</div>' +
                    '' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 *</label>' +
                      '<input type="password" name="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-' + config.color + '-500 focus:border-' + config.color + '-500" required placeholder="비밀번호를 다시 입력하세요" />' +
                    '</div>' +
                    '' +
                    '<div class="flex space-x-3 mt-6">' +
                      '<button type="button" class="cancel-btn flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">' +
                        '취소' +
                      '</button>' +
                      '<button type="submit" class="flex-1 bg-' + config.color + '-600 text-white py-2 px-4 rounded-lg hover:bg-' + config.color + '-700 transition-colors">' +
                        '가입 완료' +
                      '</button>' +
                    '</div>' +
                  '</form>' +
                '</div>';
              
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              document.body.appendChild(modal);
              
              // 모달 이벤트 설정
              setupModalEvents(modal);
              
              // 폼 제출 이벤트
              const signupForm = document.getElementById('onboardingSignupForm');
              signupForm.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleOnboardingSignup(event, userType);
              }, true);
              
              // 첫 번째 입력 필드에 포커스
              setTimeout(() => {
                const firstInput = modal.querySelector('input[name="name"]');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
            
            // 온보딩 회원가입 처리
            function handleOnboardingSignup(event, userType) {
              console.log('온보딩 회원가입 처리:', userType);
              
              const formData = new FormData(event.target);
              const password = formData.get('password');
              const confirmPassword = formData.get('confirmPassword');
              
              // 비밀번호 확인
              if (password !== confirmPassword) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
              }
              
              // 폼 데이터 수집
              const userData = {};
              for (let [key, value] of formData.entries()) {
                if (value.trim()) {
                  userData[key] = value.trim();
                }
              }
              
              console.log('온보딩 회원가입 데이터:', userData);
              
              // 현재 모달 닫기
              const currentModal = event.target.closest('.modal-overlay');
              if (currentModal) {
                closeModal(currentModal);
              }
              
              // 성공 모달 표시
              showOnboardingSuccess(userType, userData);
            }
            
            // 온보딩 성공 모달
            function showOnboardingSuccess(userType, userData) {
              const userTypeConfig = {
                jobseeker: {
                  title: '구직자 가입 완료!',
                  message: '이제 맞춤형 일자리 추천을 받아보세요',
                  color: 'green',
                  icon: 'fas fa-check-circle',
                  nextSteps: [
                    '프로필을 완성하여 더 나은 매칭 받기',
                    '관심 있는 구인공고 탐색하기',
                    'AI 매칭 시스템으로 맞춤 추천 받기'
                  ],
                  primaryAction: { text: '구직자 대시보드로 이동', url: '/jobseekers' },
                  secondaryAction: { text: '구인정보 둘러보기', url: '/jobs' }
                },
                company: {
                  title: '기업 가입 완료!',
                  message: '우수한 외국인 인재를 찾아보세요',
                  color: 'blue',
                  icon: 'fas fa-check-circle',
                  nextSteps: [
                    '첫 번째 채용공고 등록하기',
                    '구직자 프로필 탐색하기',
                    '맞춤 인재 추천 받기'
                  ],
                  primaryAction: { text: '채용공고 등록하기', url: '/jobs/post' },
                  secondaryAction: { text: '구직자 찾아보기', url: '/jobseekers' }
                },
                agent: {
                  title: '에이전트 가입 완료!',
                  message: '전문 매칭 서비스를 시작하세요',
                  color: 'purple',
                  icon: 'fas fa-check-circle',
                  nextSteps: [
                    '에이전트 대시보드 설정하기',
                    '클라이언트 관리 시스템 익히기',
                    '매칭 성과 추적하기'
                  ],
                  primaryAction: { text: '에이전트 대시보드', url: '/agents' },
                  secondaryAction: { text: '매칭 시스템 보기', url: '/matching' }
                },
                student: {
                  title: '유학생 가입 완료!',
                  message: '한국 유학 정보를 확인해보세요',
                  color: 'orange',
                  icon: 'fas fa-check-circle',
                  nextSteps: [
                    '유학 프로그램 정보 확인하기',
                    '한국어 학습 리소스 탐색하기',
                    '유학생 커뮤니티 참여하기'
                  ],
                  primaryAction: { text: '유학정보 보기', url: '/study' },
                  secondaryAction: { text: '홈으로 이동', url: '/' }
                }
              };
              
              const config = userTypeConfig[userType] || userTypeConfig.jobseeker;
              
              const modalId = 'onboardingSuccessModal_' + Date.now();
              const modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay';
              modal.style.zIndex = '9999';
              
              const nextStepsHtml = config.nextSteps.map(step => 
                '<div class="flex items-start text-left mb-2">' +
                  '<i class="fas fa-arrow-right text-' + config.color + '-600 mt-1 mr-3"></i>' +
                  '<span class="text-gray-700 text-sm">' + step + '</span>' +
                '</div>'
              ).join('');
              
              modal.innerHTML = '' +
                '<div class="bg-white rounded-lg p-8 max-w-lg w-full mx-4 modal-content" style="position: relative; z-index: 10000;">' +
                  '<div class="text-center mb-6">' +
                    '<div class="w-20 h-20 bg-' + config.color + '-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                      '<i class="' + config.icon + ' text-3xl text-white"></i>' +
                    '</div>' +
                    '' +
                    '<h2 class="text-2xl font-bold text-gray-900 mb-2">' + config.title + '</h2>' +
                    '<p class="text-gray-600">' + config.message + '</p>' +
                  '</div>' +
                  '' +
                  '<div class="bg-gray-50 rounded-lg p-4 mb-6">' +
                    '<h3 class="font-semibold text-gray-900 mb-3">다음 단계</h3>' +
                    nextStepsHtml +
                  '</div>' +
                  '' +
                  '<div class="space-y-3">' +
                    '<button onclick="window.location.href=&quot;' + config.primaryAction.url + '&quot;" class="w-full bg-' + config.color + '-600 text-white py-3 px-6 rounded-lg hover:bg-' + config.color + '-700 transition-colors font-medium">' +
                      config.primaryAction.text +
                    '</button>' +
                    '' +
                    '<button onclick="window.location.href=&quot;' + config.secondaryAction.url + '&quot;" class="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">' +
                      config.secondaryAction.text +
                    '</button>' +
                    '' +
                    '<button onclick="closeModal(this.closest(&quot;.modal-overlay&quot;))" class="w-full text-gray-500 hover:text-gray-700 py-2 text-sm">' +
                      '나중에 하기' +
                    '</button>' +
                  '</div>' +
                '</div>';
              
              document.body.appendChild(modal);
              
              // 기본 모달 이벤트 설정
              setupModalEvents(modal);
              
              // 온보딩 완료 추적
              localStorage.setItem('wowcampus_onboarding_completed', 'true');
              localStorage.setItem('wowcampus_user_type', userType);
            }
            
            // 모달 공통 이벤트 설정 헬퍼 함수
            function setupModalEvents(modal) {
              // 페이지 스크롤 비활성화
              document.body.style.overflow = 'hidden';
              document.body.classList.add('modal-open');
              
              // 모달 외부 클릭 차단
              const stopAllEvents = function(event) {
                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent.contains(event.target)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              
              document.addEventListener('click', stopAllEvents, true);
              document.addEventListener('mousedown', stopAllEvents, true);
              document.addEventListener('mouseup', stopAllEvents, true);
              
              // ESC 키로 모달 닫기
              const handleEscape = function(event) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }
              };
              document.addEventListener('keydown', handleEscape, true);
              
              // 닫기 버튼 이벤트
              const closeBtn = modal.querySelector('.close-modal-btn');
              if (closeBtn) {
                closeBtn.addEventListener('click', function(event) {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }, true);
              }
              
              // 취소 버튼 이벤트
              const cancelBtn = modal.querySelector('.cancel-btn');
              if (cancelBtn) {
                cancelBtn.addEventListener('click', function(event) {
                  event.preventDefault();
                  event.stopPropagation();
                  closeModal(modal);
                }, true);
              }
              
              // 모달 정리 함수
              modal._cleanup = function() {
                document.removeEventListener('keydown', handleEscape, true);
                document.removeEventListener('click', stopAllEvents, true);
                document.removeEventListener('mousedown', stopAllEvents, true);
                document.removeEventListener('mouseup', stopAllEvents, true);
                
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
              };
            }
            
            // 전역 함수로 등록
            window.showGetStartedModal = showGetStartedModal;
            window.startOnboarding = startOnboarding;
            window.showOnboardingSignupModal = showOnboardingSignupModal;
            
            console.log('Authentication system loaded successfully!');
