/**
 * Page Component
 * Route: /companies/create
 * Description: 관리자 전용 - 기업 정보 직접 등록 페이지
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
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">기업 정보 입력</h1>
                        <p class="text-gray-600">관리자가 직접 기업 계정을 생성하고 정보를 등록합니다.</p>
                    </div>

                    <form id="company-create-form" class="space-y-6">
                        {/* 기본 정보 */}
                        <div class="bg-white rounded-lg shadow-sm p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <i class="fas fa-user-circle text-blue-600 mr-2"></i> 계정 정보
                            </h2>
                            <div class="space-y-4">
                                {/* 이름 */}
                                <div>
                                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                                        담당자 이름 <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="예: 홍길동"
                                    />
                                </div>
                                {/* 이메일 */}
                                <div>
                                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                                        이메일 (아이디) <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="company@example.com"
                                    />
                                </div>
                                {/* 연락처 */}
                                <div>
                                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                                        담당자 연락처
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="010-1234-5678 또는 +82-10-1234-5678"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 기업 정보 */}
                        <div class="bg-white rounded-lg shadow-sm p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <i class="fas fa-building text-blue-600 mr-2"></i> 기업 정보
                            </h2>
                            <div class="space-y-4">
                                {/* 회사명 */}
                                <div>
                                    <label for="company_name" class="block text-sm font-medium text-gray-700 mb-2">
                                        회사명 (법인명) <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        name="company_name"
                                        required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="(주)와우캠퍼스"
                                    />
                                </div>
                                {/* 사업자등록번호 */}
                                <div>
                                    <label for="business_number" class="block text-sm font-medium text-gray-700 mb-2">
                                        사업자등록번호 (10자리)
                                    </label>
                                    <input
                                        type="text"
                                        id="business_number"
                                        name="business_number"
                                        maxLength={10}
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="1234567890"
                                    />
                                </div>
                                {/* 주소 */}
                                <div>
                                    <label for="company_address" class="block text-sm font-medium text-gray-700 mb-2">
                                        회사 주소
                                    </label>
                                    <input
                                        type="text"
                                        id="company_address"
                                        name="company_address"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="서울시 강남구..."
                                    />
                                </div>
                                {/* 업종 */}
                                <div>
                                    <label for="industry" class="block text-sm font-medium text-gray-700 mb-2">
                                        업종
                                    </label>
                                    <select
                                        id="industry"
                                        name="industry"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="IT/소프트웨어">IT/소프트웨어</option>
                                        <option value="제조업">제조업</option>
                                        <option value="건설업">건설업</option>
                                        <option value="서비스업">서비스업</option>
                                        <option value="교육">교육</option>
                                        <option value="유통/무역">유통/무역</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                                {/* 웹사이트 */}
                                <div>
                                    <label for="website" class="block text-sm font-medium text-gray-700 mb-2">
                                        웹사이트 (URL)
                                    </label>
                                    <input
                                        type="url"
                                        id="website"
                                        name="website"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com"
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
                                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
            document.getElementById('company-create-form').addEventListener('submit', async function (e) {
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
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim() || '',
                company_name: document.getElementById('company_name').value.trim(),
                business_number: document.getElementById('business_number').value.trim() || '',
                company_address: document.getElementById('company_address').value.trim() || '',
                industry: document.getElementById('industry').value || '기타',
                website: document.getElementById('website').value.trim() || ''
              };

              // 필수 검증
              if (!formData.name || !formData.email || !formData.company_name) {
                if (window.toast) toast.error('❌ 필수 항목을 입력해주세요.');
                else alert('필수 항목을 입력해주세요.');
                return;
              }

              try {
                const res = await fetch('/api/companies', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                  },
                  body: JSON.stringify(formData),
                });
                
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.message || '서버 오류');
                
                if (window.toast) toast.success('✅ 기업이 등록되었습니다.');
                else alert('기업이 등록되었습니다.');
                
                // Show temp password if returned
                if (data.data && data.data.tempPassword) {
                  alert(\`[중요] 생성된 임시 비밀번호: \${data.data.tempPassword}\\n담당자에게 전달해주세요.\`);
                }
                
                window.location.href = '/admin';
              } catch (err) {
                console.error(err);
                if (window.toast) toast.error(\`❌ 등록 실패: \${err.message}\`);
                else alert(\`등록 실패: \${err.message}\`);
              }
            });
            `,
                    }}
                ></script>
            </div>
        );
    },
];
