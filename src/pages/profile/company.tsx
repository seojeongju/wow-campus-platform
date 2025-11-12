/**
 * Page Component
 * Route: /profile/company
 * Company profile view and edit page
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/logo.png" alt="WOW-CAMPUS" class="h-10" />
              <span class="text-xl font-bold text-blue-600">WOW-CAMPUS</span>
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

      {/* 프로필 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">기업 프로필</h1>
              <p class="text-gray-600">기업 정보를 관리하고 채용 경쟁력을 높이세요</p>
            </div>
            <a href="/dashboard/company" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>
              대시보드로
            </a>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button id="tab-view" class="tab-button border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
              <i class="fas fa-eye mr-2"></i>프로필 보기
            </button>
            <button id="tab-edit" class="tab-button border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              <i class="fas fa-edit mr-2"></i>프로필 수정
            </button>
          </nav>
        </div>

        {/* 프로필 보기 탭 */}
        <div id="view-section" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p class="text-gray-500">기업 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>

        {/* 프로필 수정 탭 */}
        <div id="edit-section" class="hidden space-y-6">
          <form id="company-profile-form">
            {/* 기본 정보 */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <i class="fas fa-building text-purple-600 mr-3"></i>
                기본 정보
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label for="company_name" class="block text-sm font-medium text-gray-700 mb-2">
                    기업명 <span class="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="company_name" 
                    name="company_name" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: (주)우와캠퍼스"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="business_number" class="block text-sm font-medium text-gray-700 mb-2">
                      사업자 등록번호
                    </label>
                    <input 
                      type="text" 
                      id="business_number" 
                      name="business_number"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="000-00-00000"
                    />
                  </div>

                  <div>
                    <label for="industry" class="block text-sm font-medium text-gray-700 mb-2">
                      업종
                    </label>
                    <input 
                      type="text" 
                      id="industry" 
                      name="industry"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="예: IT/소프트웨어"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="company_size" class="block text-sm font-medium text-gray-700 mb-2">
                      기업 규모
                    </label>
                    <select 
                      id="company_size" 
                      name="company_size"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">선택하세요</option>
                      <option value="startup">스타트업 (1-10명)</option>
                      <option value="small">소기업 (11-50명)</option>
                      <option value="medium">중기업 (51-200명)</option>
                      <option value="large">대기업 (201명 이상)</option>
                    </select>
                  </div>

                  <div>
                    <label for="founded_year" class="block text-sm font-medium text-gray-700 mb-2">
                      설립 연도
                    </label>
                    <input 
                      type="number" 
                      id="founded_year" 
                      name="founded_year"
                      min="1900"
                      max="2030"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="2020"
                    />
                  </div>
                </div>

                <div>
                  <label for="website" class="block text-sm font-medium text-gray-700 mb-2">
                    웹사이트
                  </label>
                  <input 
                    type="url" 
                    id="website" 
                    name="website"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://www.example.com"
                  />
                </div>

                <div>
                  <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                    주소
                  </label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="서울시 강남구 테헤란로 123"
                  />
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                    기업 소개
                  </label>
                  <textarea 
                    id="description" 
                    name="description"
                    rows="5"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="기업의 비전, 사업 내용, 특징 등을 소개해주세요"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div class="flex justify-end space-x-4">
              <button 
                type="button" 
                id="cancel-btn"
                class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button 
                type="submit"
                class="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <i class="fas fa-save mr-2"></i>저장
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 기업 프로필 JavaScript ====================
        
        let companyProfile = null;
        
        // 페이지 로드
        document.addEventListener('DOMContentLoaded', async () => {
          await loadCompanyProfile();
          setupTabs();
          setupForm();
        });
        
        // 탭 설정
        function setupTabs() {
          const viewTab = document.getElementById('tab-view');
          const editTab = document.getElementById('tab-edit');
          const viewSection = document.getElementById('view-section');
          const editSection = document.getElementById('edit-section');
          
          viewTab.addEventListener('click', () => {
            viewTab.classList.add('border-purple-600', 'text-purple-600');
            viewTab.classList.remove('border-transparent', 'text-gray-500');
            editTab.classList.remove('border-purple-600', 'text-purple-600');
            editTab.classList.add('border-transparent', 'text-gray-500');
            
            viewSection.classList.remove('hidden');
            editSection.classList.add('hidden');
          });
          
          editTab.addEventListener('click', () => {
            editTab.classList.add('border-purple-600', 'text-purple-600');
            editTab.classList.remove('border-transparent', 'text-gray-500');
            viewTab.classList.remove('border-purple-600', 'text-purple-600');
            viewTab.classList.add('border-transparent', 'text-gray-500');
            
            editSection.classList.remove('hidden');
            viewSection.classList.add('hidden');
          });
        }
        
        // 기업 프로필 로드
        async function loadCompanyProfile() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/profile/company', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('기업 프로필:', result);
            
            if (result.success && result.profile) {
              companyProfile = result.profile;
              displayCompanyProfile(result.profile);
              fillEditForm(result.profile);
            }
          } catch (error) {
            console.error('프로필 로드 오류:', error);
          }
        }
        
        // 프로필 표시
        function displayCompanyProfile(profile) {
          const viewSection = document.getElementById('view-section');
          
          const companySizeMap = {
            'startup': '스타트업 (1-10명)',
            'small': '소기업 (11-50명)',
            'medium': '중기업 (51-200명)',
            'large': '대기업 (201명 이상)'
          };
          
          viewSection.innerHTML = \`
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-start justify-between mb-6">
                <div class="flex items-center">
                  <div class="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-building text-purple-600 text-3xl"></i>
                  </div>
                  <div class="ml-4">
                    <h2 class="text-2xl font-bold text-gray-900">\${profile.company_name}</h2>
                    <p class="text-gray-600">\${profile.industry || '업종 미등록'}</p>
                  </div>
                </div>
                <button onclick="document.getElementById('tab-edit').click()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <i class="fas fa-edit mr-2"></i>수정
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">사업자 등록번호</h3>
                  <p class="text-gray-900">\${profile.business_number || '미등록'}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">기업 규모</h3>
                  <p class="text-gray-900">\${companySizeMap[profile.company_size] || '미등록'}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">설립 연도</h3>
                  <p class="text-gray-900">\${profile.founded_year || '미등록'}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">직원 수</h3>
                  <p class="text-gray-900">\${profile.employee_count || '미등록'}</p>
                </div>
                
                <div class="md:col-span-2">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">웹사이트</h3>
                  <p class="text-gray-900">
                    \${profile.website ? \`<a href="\${profile.website}" target="_blank" class="text-blue-600 hover:underline">\${profile.website}</a>\` : '미등록'}
                  </p>
                </div>
                
                <div class="md:col-span-2">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">주소</h3>
                  <p class="text-gray-900">\${profile.address || '미등록'}</p>
                </div>
                
                <div class="md:col-span-2">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">기업 소개</h3>
                  <p class="text-gray-900 whitespace-pre-wrap">\${profile.description || '기업 소개가 등록되지 않았습니다.'}</p>
                </div>
              </div>
            </div>
          \`;
        }
        
        // 수정 폼 채우기
        function fillEditForm(profile) {
          document.getElementById('company_name').value = profile.company_name || '';
          document.getElementById('business_number').value = profile.business_number || '';
          document.getElementById('industry').value = profile.industry || '';
          document.getElementById('company_size').value = profile.company_size || '';
          document.getElementById('founded_year').value = profile.founded_year || '';
          document.getElementById('website').value = profile.website || '';
          document.getElementById('address').value = profile.address || '';
          document.getElementById('description').value = profile.description || '';
        }
        
        // 폼 설정
        function setupForm() {
          const form = document.getElementById('company-profile-form');
          const cancelBtn = document.getElementById('cancel-btn');
          
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveCompanyProfile();
          });
          
          cancelBtn.addEventListener('click', () => {
            fillEditForm(companyProfile);
            document.getElementById('tab-view').click();
          });
        }
        
        // 프로필 저장
        async function saveCompanyProfile() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            const formData = {
              company_name: document.getElementById('company_name').value.trim(),
              business_number: document.getElementById('business_number').value.trim() || null,
              industry: document.getElementById('industry').value.trim() || null,
              company_size: document.getElementById('company_size').value || null,
              founded_year: document.getElementById('founded_year').value ? parseInt(document.getElementById('founded_year').value) : null,
              website: document.getElementById('website').value.trim() || null,
              address: document.getElementById('address').value.trim() || null,
              description: document.getElementById('description').value.trim() || null
            };
            
            if (!formData.company_name) {
              toast.error('❌ 기업명은 필수입니다.');
              return;
            }
            
            const response = await fetch('/api/profile/company', {
              method: 'PUT',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
              toast.success('✅ 프로필이 저장되었습니다.');
              await loadCompanyProfile();
              document.getElementById('tab-view').click();
            } else {
              toast.error('❌ ' + (result.message || '저장에 실패했습니다.'));
            }
          } catch (error) {
            console.error('프로필 저장 오류:', error);
            toast.error('❌ 저장 중 오류가 발생했습니다.');
          }
        }
      `}} />
    </div>
  );
};
