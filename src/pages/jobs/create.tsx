/**
 * Page Component
 * Route: /jobs/create
 * Create new job posting page for companies
 */

import type { Context } from 'hono'
import { authMiddleware, requireCompanyOrAdmin } from '../../middleware/auth'

export const handler = [authMiddleware, requireCompanyOrAdmin, async (c: Context) => {
  const user = c.get('user');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABlCAYAAAD3Xd5lAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QsMBR0y8emRNAAAcSJJREFUeNrtfWeYlEUa7amqL3Wa7p4IDAw5m0BUVDBgRkyYc06YI66BNWfMrgGzmAMoZlFRBBGQnMMwOXdPT8cvVdX90T0Iguvu6q7ee/vw9DM8M1256tRbVW8A8sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPP7LIH9m4e81SQKgEEC7FoQAQRhACoB9hPG/qdr9c2oQ0FVaH09VrGrvMOotS1KNoX+Bn/QLFrQ5QrTdsWfP/EzZAi+9+xM8Xk/JTz8tLVqyeLVsj3VAUQz0qCghe+wx0OrVq0tNIpnmZx2zb76z/h/EvY99gcJwqHTZypWFq9euk7H2DhQUBNG7dynZYVBvs0eP7jXxeEKce8r+f3jZ/zErPPH1Ckgpdv6mruGEdocpBjWkIH44NM3CLDLn3VN3+vCh2bXimn1Gb0sS36zEjj2LlZnLai5qEf6jaloTS5mwnZIK3w6w4xt8mdQ9krGWF088ZLtl3zp9AShk39URcV4l5wRKAoYdgtcUtEdBYu7Ubxump18++1fr/npNEh5NVX/aVF1Yt6l1z5RU97U0Y1yE0OIOECmJRBEFDUq+MOTac1S475V0LVotHO48MGbwNvkd+tTbgJS9bb3wfMoKqSmTcBRBAtzLh/j8r61qi62cefHe263Lo1+vQUXAUD5d03hSpRA7Q3JemKawmIcFvZm1e3VteeGiA8eLX2vLxe/OQlBh41YkzX2RYVwSFZaUrMhJbSpKtD2bNALuK1cc/bsnysVX3g8pHK05kh4SS9rjXaGOcgUZ3t6eEpblglEFXi8loTDaTSv2UWlhaPbAngNnn3Li+GgmY9qjRvb4l8q56YEXwV13zy+/mntMNGYJBRQUAplMhgwfsXNy//32fDIeT0ZvueLY38yr77BjQKR1tENCe7vwc0okKE+yHQaWb7j0whOfe3/G13zKIxP/5T4oG3QEdtlp8JBNNZFTTYsqFKq0LAuD+hWIo48c9RznovLqC48HABx50gRIKfesrbaOcRwmHNkGoigg0g8pJQAJwSmkBCgDVB0IBj1kYL8eaTNtvz2ob//GDz75NLbo+1e3qcfDT70PzvmQ6Z98c8bG2igYVcAUP6SIs9Ji+WNTi/lu3dJp/7Qt48+47vQfF9bu5HAPp6oDQUwEvV7Rr1f5c1LKys/evner71/7t8fguKYWibg7NTTFj3akuo8gZKdYIiks2wFjKgI+kKBfiTQ1NHy409D+MVUl7+wwtF/jl1/Pjn05/ak/hLCU/zRhJJMG5bzZJji... (line truncated)" alt="WOW-CAMPUS" class="h-10" />
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">새 구인공고 등록</h1>
              <p class="text-gray-600">우수한 인재를 찾기 위한 구인공고를 작성해주세요</p>
            </div>
            <a href="/dashboard/company" class="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>
              대시보드로
            </a>
          </div>
        </div>

        {/* Job Creation Form */}
        <form id="job-create-form" class="space-y-6">
          {/* 기본 정보 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <i class="fas fa-info-circle text-blue-600 mr-2"></i>
              기본 정보
            </h2>
            
            <div class="space-y-4">
              {/* 공고 제목 */}
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  공고 제목 <span class="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 풀스택 개발자 (React/Node.js)"
                />
              </div>

              {/* 직무 분야 & 고용 형태 */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="job_category" class="block text-sm font-medium text-gray-700 mb-2">
                    직무 분야 <span class="text-red-500">*</span>
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
                    <option value="고객서비스">고객서비스</option>
                    <option value="제조/생산">제조/생산</option>
                    <option value="물류/유통">물류/유통</option>
                    <option value="교육">교육</option>
                    <option value="의료/제약">의료/제약</option>
                    <option value="금융">금융</option>
                    <option value="건설">건설</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label for="job_type" class="block text-sm font-medium text-gray-700 mb-2">
                    고용 형태 <span class="text-red-500">*</span>
                  </label>
                  <select 
                    id="job_type" 
                    name="job_type" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    <option value="정규직">정규직</option>
                    <option value="계약직">계약직</option>
                    <option value="인턴">인턴</option>
                    <option value="프리랜서">프리랜서</option>
                    <option value="파트타임">파트타임</option>
                  </select>
                </div>
              </div>

              {/* 근무 지역 */}
              <div>
                <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                  근무 지역 <span class="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 서울특별시 강남구"
                />
              </div>

              {/* 경력 요구사항 */}
              <div>
                <label for="experience_level" class="block text-sm font-medium text-gray-700 mb-2">
                  경력 요구사항
                </label>
                <select 
                  id="experience_level" 
                  name="experience_level"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  <option value="신입">신입</option>
                  <option value="경력 1년 이상">경력 1년 이상</option>
                  <option value="경력 3년 이상">경력 3년 이상</option>
                  <option value="경력 5년 이상">경력 5년 이상</option>
                  <option value="경력 10년 이상">경력 10년 이상</option>
                  <option value="경력 무관">경력 무관</option>
                </select>
              </div>

              {/* 학력 요구사항 */}
              <div>
                <label for="education_required" class="block text-sm font-medium text-gray-700 mb-2">
                  학력 요구사항
                </label>
                <select 
                  id="education_required" 
                  name="education_required"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  <option value="학력 무관">학력 무관</option>
                  <option value="고등학교 졸업">고등학교 졸업</option>
                  <option value="전문대 졸업">전문대 졸업</option>
                  <option value="대학교 졸업">대학교 졸업</option>
                  <option value="석사 이상">석사 이상</option>
                </select>
              </div>

              {/* 모집 인원 */}
              <div>
                <label for="positions_available" class="block text-sm font-medium text-gray-700 mb-2">
                  모집 인원
                </label>
                <input 
                  type="number" 
                  id="positions_available" 
                  name="positions_available" 
                  min="1"
                  value="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* 상세 내용 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <i class="fas fa-file-alt text-blue-600 mr-2"></i>
              상세 내용
            </h2>
            
            <div class="space-y-4">
              {/* 직무 설명 */}
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  직무 설명 <span class="text-red-500">*</span>
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  required
                  rows="6"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="담당하실 업무와 직무에 대해 자세히 설명해주세요"
                ></textarea>
              </div>

              {/* 주요 업무 */}
              <div>
                <label for="responsibilities" class="block text-sm font-medium text-gray-700 mb-2">
                  주요 업무
                </label>
                <textarea 
                  id="responsibilities" 
                  name="responsibilities" 
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="주요 업무 내용을 작성해주세요 (선택사항)"
                ></textarea>
              </div>

              {/* 자격 요건 */}
              <div>
                <label for="requirements" class="block text-sm font-medium text-gray-700 mb-2">
                  자격 요건
                </label>
                <textarea 
                  id="requirements" 
                  name="requirements" 
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="필수 자격 요건을 작성해주세요 (선택사항)"
                ></textarea>
              </div>

              {/* 우대 사항 및 혜택 */}
              <div>
                <label for="benefits" class="block text-sm font-medium text-gray-700 mb-2">
                  우대 사항 및 혜택
                </label>
                <textarea 
                  id="benefits" 
                  name="benefits" 
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="우대 사항, 복리후생, 기타 혜택을 작성해주세요 (선택사항)"
                ></textarea>
              </div>
            </div>
          </div>

          {/* 급여 및 조건 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <i class="fas fa-won-sign text-blue-600 mr-2"></i>
              급여 및 조건
            </h2>
            
            <div class="space-y-4">
              {/* 급여 범위 */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="salary_min" class="block text-sm font-medium text-gray-700 mb-2">
                    최소 급여 (만원)
                  </label>
                  <input 
                    type="number" 
                    id="salary_min" 
                    name="salary_min" 
                    min="0"
                    step="1"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 3000 (자유롭게 입력)"
                  />
                </div>

                <div>
                  <label for="salary_max" class="block text-sm font-medium text-gray-700 mb-2">
                    최대 급여 (만원)
                  </label>
                  <input 
                    type="number" 
                    id="salary_max" 
                    name="salary_max" 
                    min="0"
                    step="1"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 5000 (자유롭게 입력)"
                  />
                </div>
              </div>

              {/* 비자 스폰서십 */}
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="visa_sponsorship" 
                  name="visa_sponsorship" 
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label for="visa_sponsorship" class="ml-2 text-sm text-gray-700">
                  비자 스폰서십 가능
                </label>
              </div>

              {/* 한국어 필수 */}
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="korean_required" 
                  name="korean_required" 
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label for="korean_required" class="ml-2 text-sm text-gray-700">
                  한국어 능력 필수
                </label>
              </div>

              {/* 지원 마감일 */}
              <div>
                <label for="application_deadline" class="block text-sm font-medium text-gray-700 mb-2">
                  지원 마감일
                </label>
                <input 
                  type="date" 
                  id="application_deadline" 
                  name="application_deadline"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div class="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
            <a href="/dashboard/company" class="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors">
              취소
            </a>
            <div class="flex space-x-3">
              <button 
                type="button"
                id="save-draft-btn"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <i class="fas fa-save mr-2"></i>
                임시저장
              </button>
              <button 
                type="submit"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <i class="fas fa-check mr-2"></i>
                공고 등록
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 구인공고 등록 JavaScript ====================
        
        // 폼 제출 처리
        document.getElementById('job-create-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          await submitJobPosting('active');
        });
        
        // 임시저장 버튼 처리
        document.getElementById('save-draft-btn').addEventListener('click', async function(e) {
          e.preventDefault();
          await submitJobPosting('draft');
        });
        
        // 구인공고 제출 함수
        async function submitJobPosting(status) {
          try {
            const token = localStorage.getItem('wowcampus_token');
            if (!token) {
              if (window.toast) {
                toast.error('❌ 로그인이 필요합니다.');
              } else {
                alert('로그인이 필요합니다.');
              }
              window.location.href = '/';
              return;
            }
            
            // 폼 데이터 수집
            const formData = {
              title: document.getElementById('title').value.trim(),
              description: document.getElementById('description').value.trim(),
              job_type: document.getElementById('job_type').value,
              job_category: document.getElementById('job_category').value,
              location: document.getElementById('location').value.trim(),
              experience_level: document.getElementById('experience_level').value || null,
              education_required: document.getElementById('education_required').value || null,
              responsibilities: document.getElementById('responsibilities').value.trim() || null,
              requirements: document.getElementById('requirements').value.trim() || null,
              benefits: document.getElementById('benefits').value.trim() || null,
              salary_min: document.getElementById('salary_min').value ? parseInt(document.getElementById('salary_min').value) : null,
              salary_max: document.getElementById('salary_max').value ? parseInt(document.getElementById('salary_max').value) : null,
              visa_sponsorship: document.getElementById('visa_sponsorship').checked,
              korean_required: document.getElementById('korean_required').checked,
              positions_available: parseInt(document.getElementById('positions_available').value) || 1,
              application_deadline: document.getElementById('application_deadline').value || null,
              status: status
            };
            
            // 필수 필드 검증
            if (!formData.title) {
              if (window.toast) {
                toast.error('❌ 공고 제목을 입력해주세요.');
              } else {
                alert('공고 제목을 입력해주세요.');
              }
              document.getElementById('title').focus();
              return;
            }
            
            if (!formData.description) {
              if (window.toast) {
                toast.error('❌ 직무 설명을 입력해주세요.');
              } else {
                alert('직무 설명을 입력해주세요.');
              }
              document.getElementById('description').focus();
              return;
            }
            
            if (!formData.job_type) {
              if (window.toast) {
                toast.error('❌ 고용 형태를 선택해주세요.');
              } else {
                alert('고용 형태를 선택해주세요.');
              }
              document.getElementById('job_type').focus();
              return;
            }
            
            if (!formData.job_category) {
              if (window.toast) {
                toast.error('❌ 직무 분야를 선택해주세요.');
              } else {
                alert('직무 분야를 선택해주세요.');
              }
              document.getElementById('job_category').focus();
              return;
            }
            
            if (!formData.location) {
              if (window.toast) {
                toast.error('❌ 근무 지역을 입력해주세요.');
              } else {
                alert('근무 지역을 입력해주세요.');
              }
              document.getElementById('location').focus();
              return;
            }
            
            // 급여 범위 검증
            if (formData.salary_min && formData.salary_max) {
              if (formData.salary_min > formData.salary_max) {
                if (window.toast) {
                  toast.error('❌ 최소 급여는 최대 급여보다 작아야 합니다.');
                } else {
                  alert('최소 급여는 최대 급여보다 작아야 합니다.');
                }
                return;
              }
            }
            
            console.log('제출할 데이터:', formData);
            console.log('JSON 문자열:', JSON.stringify(formData));
            
            // API 호출
            const response = await fetch('/api/jobs', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            const result = await response.json();
            console.log('API 응답:', result);
            console.log('API 응답 전체:', JSON.stringify(result, null, 2));
            
            if (result.success) {
              if (status === 'draft') {
                if (window.toast) {
                  toast.success('✅ 임시저장되었습니다.');
                } else {
                  alert('임시저장되었습니다.');
                }
              } else {
                if (window.toast) {
                  toast.success('✅ 구인공고가 등록되었습니다!');
                } else {
                  alert('구인공고가 등록되었습니다!');
                }
              }
              
              // 대시보드로 이동
              setTimeout(() => {
                window.location.href = '/dashboard/company';
              }, 1500);
            } else {
              const errorMsg = result.message || '공고 등록에 실패했습니다.';
              const errorDetail = result.error ? '\\n상세: ' + result.error : '';
              if (window.toast) {
                toast.error('❌ ' + errorMsg + errorDetail);
              } else {
                alert('오류: ' + errorMsg + errorDetail);
              }
              console.error('API 에러 상세:', result);
            }
            
          } catch (error) {
            console.error('공고 등록 오류:', error);
            if (window.toast) {
              toast.error('❌ 공고 등록 중 오류가 발생했습니다.');
            } else {
              alert('공고 등록 중 오류가 발생했습니다.');
            }
          }
        }
        
        // 페이지 로드 시 인증 확인
        document.addEventListener('DOMContentLoaded', function() {
          const token = localStorage.getItem('wowcampus_token');
          const userStr = localStorage.getItem('wowcampus_user');
          
          if (!token || !userStr) {
            if (window.toast) {
              toast.error('❌ 로그인이 필요합니다.');
            } else {
              alert('로그인이 필요합니다.');
            }
            window.location.href = '/';
            return;
          }
          
          const user = JSON.parse(userStr);
          if (user.user_type !== 'company' && user.user_type !== 'admin') {
            if (window.toast) {
              toast.error('❌ 구인기업만 접근할 수 있습니다.');
            } else {
              alert('구인기업만 접근할 수 있습니다.');
            }
            window.location.href = '/';
            return;
          }
          
          console.log('구인공고 등록 페이지 로드 완료');
        });
        
        // ==================== 끝: 구인공고 등록 JavaScript ====================
      `}}>
      </script>
    </div>
  )
}];
