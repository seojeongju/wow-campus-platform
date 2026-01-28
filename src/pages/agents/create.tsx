/**
 * Page Component
 * Route: /agents/create
 * Description: 관리자가 에이전트를 생성하는 페이지
 */
import type { Context } from 'hono';
import { authMiddleware, requireAdmin } from '../../middleware/auth';

export const handler = [
    authMiddleware,
    requireAdmin,
    async (c: Context) => {
        // Render page
        return c.render(
            <div class="min-h-screen bg-gray-50">
                {/* Header */}
                <header class="bg-white shadow-sm sticky top-0 z-50">
                    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <a href="/admin" class="flex items-center space-x-3">
                                <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-10 md:h-12 w-auto" />
                                <span class="text-xl font-bold text-red-600">관리자 대시보드</span>
                            </a>
                        </div>
                    </nav>
                </header>

                {/* Main Content */}
                <main class="container mx-auto px-4 py-8">
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">에이전트 정보 입력</h1>
                        <p class="text-gray-600">관리자가 직접 에이전트를 등록합니다.</p>
                    </div>

                    <form id="agent-create-form" class="space-y-6">
                        {/* 기본 정보 */}
                        <div class="bg-white rounded-lg shadow-sm p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <i class="fas fa-user-tie text-red-600 mr-2"></i> 기본 정보
                            </h2>
                            <div class="space-y-4">
                                {/* 이름 */}
                                <div>
                                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                                        이름 (담당자명) <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="예: 김철수"
                                    />
                                </div>
                                {/* 연락처 */}
                                <div>
                                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                                        연락처 <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="010-1234-5678 또는 +82-10-1234-5678"
                                    />
                                </div>
                                {/* 이메일 */}
                                <div>
                                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                                        이메일 <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="example@agency.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 에이전시 정보 */}
                        <div class="bg-white rounded-lg shadow-sm p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <i class="fas fa-building text-red-600 mr-2"></i> 에이전시 정보
                            </h2>
                            <div class="space-y-4">
                                {/* 에이전시명 */}
                                <div>
                                    <label for="agency_name" class="block text-sm font-medium text-gray-700 mb-2">
                                        에이전시명 <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="agency_name"
                                        name="agency_name"
                                        required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="예: 와우 에이전시"
                                    />
                                </div>
                                {/* 사업자/라이센스 번호 */}
                                <div>
                                    <label for="license_number" class="block text-sm font-medium text-gray-700 mb-2">
                                        사업자/라이센스 번호
                                    </label>
                                    <input
                                        type="text"
                                        id="license_number"
                                        name="license_number"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="예: 123-45-67890"
                                    />
                                </div>
                                {/* 전문 분야 */}
                                <div>
                                    <label for="specialization" class="block text-sm font-medium text-gray-700 mb-2">
                                        전문 분야
                                    </label>
                                    <input
                                        type="text"
                                        id="specialization"
                                        name="specialization"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="예: IT, 건설, 제조 등"
                                    />
                                </div>
                                {/* 주요 활동 지역 */}
                                <div>
                                    <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                                        주요 활동 지역
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="예: 서울, 경기"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 제출 버튼 */}
                        <div class="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
                            <a href="/admin" class="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                취소
                            </a>
                            <button
                                type="submit"
                                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                <i class="fas fa-check mr-2"></i> 등록
                            </button>
                        </div>
                    </form>
                </main>

                {/* Inline JavaScript */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
            // 폼 제출 처리
            document.getElementById('agent-create-form').addEventListener('submit', async function (e) {
              e.preventDefault();
              const token = localStorage.getItem('wowcampus_token');
              if (!token) {
                if (window.toast) toast.error('❌ 로그인이 필요합니다.');
                else alert('로그인이 필요합니다.');
                window.location.href = '/';
                return;
              }

              const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                agency_name: document.getElementById('agency_name').value.trim(),
                license_number: document.getElementById('license_number').value.trim() || null,
                specialization: document.getElementById('specialization').value.trim() || null,
                location: document.getElementById('location').value.trim() || null,
              };

              // 필수 검증
              if (!formData.name || !formData.phone || !formData.email || !formData.agency_name) {
                if (window.toast) toast.error('❌ 필수 항목을 모두 입력해주세요.');
                else alert('필수 항목을 모두 입력해주세요.');
                return;
              }

              try {
                const res = await fetch('/api/agents/create', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                  },
                  body: JSON.stringify(formData),
                });
                
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || '서버 오류');
                
                if (window.toast) toast.success('✅ 에이전트가 등록되었습니다.');
                else alert('에이전트가 등록되었습니다.');
                
                // Show temp password
                if (data.data && data.data.tempPassword) {
                  alert(\`[중요] 생성된 임시 비밀번호: \${data.data.tempPassword}\\n에이전트에게 전달해주세요.\`);
                }
                
                window.location.href = '/admin';
              } catch (err) {
                console.error(err);
                if (window.toast) toast.error(\`❌ 등록에 실패했습니다: \${err.message}\`);
                else alert(\`등록에 실패했습니다: \${err.message}\`);
              }
            });
            `,
                    }}
                ></script>
            </div>
        );
    },
];
