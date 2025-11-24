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
                            <a href="/dashboard/admin" class="flex items-center space-x-3">
                                <img src="data:image/png;base64,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" alt="WOW-CAMPUS" class="h-10 md:h-12 w-auto" />
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
                                        placeholder="010-1234-5678"
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
                            <a href="/dashboard/admin" class="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors">
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
                
                window.location.href = '/dashboard/admin';
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
