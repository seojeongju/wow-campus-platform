/**
 * Page Component
 * Route: /agents/jobseeker/create
 * Description: 에이전트가 구직 정보를 입력하는 페이지
 */
import type { Context } from 'hono';
import { authMiddleware, requireAgent } from '../../../middleware/auth';

export const handler = [
    authMiddleware,
    requireAgent,
    async (c: Context) => {
        const user = c.get('user');
        // Render page
        return c.render(
            <div class="min-h-screen bg-gray-50">
                {/* Header */}
                <header class="bg-white shadow-sm sticky top-0 z-50">
                    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <a href={user.user_type === 'admin' ? "/admin" : "/agents/dashboard"} class="flex items-center space-x-3">
                                <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-10 md:h-12 w-auto" />
                                <span class={`text-xl font-bold ${user.user_type === 'admin' ? 'text-red-600' : 'text-blue-600'}`}>
                                    {user.user_type === 'admin' ? '관리자 대시보드' : '에이전트 대시보드'}
                                </span>
                            </a>
                        </div>
                    </nav>
                </header>

                {/* Main Content */}
                <main class="container mx-auto px-4 py-8">
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">구직 정보 입력</h1>
                        <p class="text-gray-600">{user.user_type === 'admin' ? '관리자가 직접 구직자를 등록합니다.' : '에이전트가 직접 구직자를 등록합니다.'}</p>
                    </div>

                    <form id="jobseeker-create-form" class="space-y-6">
                        {/* 기본 정보 */}
                        <div class="bg-white rounded-lg shadow-sm p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <i class="fas fa-user text-blue-600 mr-2"></i> 기본 정보
                            </h2>
                            <div class="space-y-4">
                                {/* 이름 */}
                                <div>
                                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                                        이름 <span class="text-red-500">*</span>
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
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="example@domain.com"
                                    />
                                </div>
                                {/* 희망 직무 분야 */}
                                <div>
                                    <label for="job_category" class="block text-sm font-medium text-gray-700 mb-2">
                                        희망 직무 분야 <span class="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="job_category"
                                        name="job_category"
                                        required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="IT/개발">IT/개발</option>
                                        <option value="디자인">디자인</option>
                                        <option value="마케팅">마케팅</option>
                                        <option value="영업">영업</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                                <div id="job_category_other_input" class="hidden mt-2">
                                    <input
                                        type="text"
                                        id="job_category_other_text"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="직무 분야를 입력하세요 (예: 법률/법무, 연구개발 등)"
                                    />
                                </div>
                                {/* 자기소개 */}
                                <div>
                                    <label for="self_introduction" class="block text-sm font-medium text-gray-700 mb-2">
                                        자기소개 <span class="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="self_introduction"
                                        name="self_introduction"
                                        required
                                        rows={6}
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="본인의 강점, 경력 등을 자유롭게 작성해주세요."
                                    ></textarea>
                                </div>
                                {/* 경력 (선택) */}
                                <div>
                                    <label for="experience" class="block text-sm font-medium text-gray-700 mb-2">
                                        경력 (선택)
                                    </label>
                                    <textarea
                                        id="experience"
                                        name="experience"
                                        rows={4}
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="예: 3년 차 웹 프론트엔드 개발자"
                                    ></textarea>
                                </div>
                                {/* 학력 (선택) */}
                                <div>
                                    <label for="education" class="block text-sm font-medium text-gray-700 mb-2">
                                        학력 (선택)
                                    </label>
                                    <textarea
                                        id="education"
                                        name="education"
                                        rows={4}
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="예: 한국대학교 컴퓨터공학과 졸업"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 제출 버튼 */}
                        <div class="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
                            <a href="/agents/dashboard" class="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors">
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
            // 직무 분야 "기타" 선택 시 입력 필드 표시
            function setupJobCategoryOther() {
              const sel = document.getElementById('job_category');
              const other = document.getElementById('job_category_other_input');
              sel.addEventListener('change', function () {
                if (this.value === '기타') other.classList.remove('hidden');
                else other.classList.add('hidden');
              });
            }

            // 폼 제출 처리
            document.getElementById('jobseeker-create-form').addEventListener('submit', async function (e) {
              e.preventDefault();
              const token = localStorage.getItem('wowcampus_token');
              if (!token) {
                if (window.toast) toast.error('로그인이 필요합니다.');
                else alert('로그인이 필요합니다.');
                window.location.href = '/';
                return;
              }

              // 직무 분야 "기타" 처리
              let jobCategory = document.getElementById('job_category').value;
              if (jobCategory === '기타') {
                const other = document.getElementById('job_category_other_text').value.trim();
                if (other) jobCategory = other;
              }

              const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                job_category: jobCategory,
                self_introduction: document.getElementById('self_introduction').value.trim(),
                experience: document.getElementById('experience').value.trim() || null,
                education: document.getElementById('education').value.trim() || null,
              };

              // 필수 검증
              if (!formData.name || !formData.phone || !formData.email || !formData.job_category) {
                if (window.toast) toast.error('필수 항목을 모두 입력해주세요.');
                else alert('필수 항목을 모두 입력해주세요.');
                return;
              }

              try {
                const res = await fetch('/api/agents/jobseekers/create', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                  },
                  body: JSON.stringify(formData),
                });
                
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || '서버 오류');
                
                if (window.toast) toast.success('구직 정보가 등록되었습니다.');
                else alert('구직 정보가 등록되었습니다.');
                
                // Show temp password
                if (data.data && data.data.tempPassword) {
                  alert('[중요] 생성된 임시 비밀번호: ' + data.data.tempPassword + '\\n구직자에게 전달해주세요.');
                }

                window.location.href = '/agents/dashboard';
              } catch (err) {
                    console.error(err);
                if (window.toast) toast.error('등록에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
                else alert('등록에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
              }
            });

                // 초기화
                setupJobCategoryOther();
                `,
                    }}
                ></script>
            </div >,
        );
    },
];
