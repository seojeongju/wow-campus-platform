import type { Context } from 'hono'
import { NavigationHeader } from '../../components/navigation'

export const handler = async (c: Context) => {
  try {
    const user = c.get('user');

    return c.render(
      <div class="min-h-screen bg-gray-50">
        <NavigationHeader />

        <main class="container mx-auto px-4 py-8">
          <div class="mb-8">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">기업 프로필 관리</h1>
                <p class="text-gray-600">채용 정보를 포함한 상세 기업 프로필을 관리하세요</p>
              </div>
              <div class="flex items-center space-x-3">
                <div id="profile-completeness" class="hidden px-4 py-2 bg-blue-50 rounded-lg">
                  <span class="text-sm font-medium text-blue-700">프로필 완성도 <span id="completeness-percent">0</span>%</span>
                </div>
                <a href="/dashboard/company" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <i class="fas fa-arrow-left mr-2"></i>
                  대시보드로
                </a>
              </div>
            </div>
          </div>

          <div class="mb-6 border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button id="tab-view" class="tab-button border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
                <i class="fas fa-eye mr-2"></i>프로필 보기
              </button>
              <button id="tab-edit" class="tab-button border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                <i class="fas fa-edit mr-2"></i>프로필 편집
              </button>
            </nav>
          </div>

          <div id="view-section" class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">기업 프로필을 불러오는 중...</p>
              </div>
            </div>
          </div>

          <div id="edit-section" class="hidden space-y-6">
            <form id="company-profile-form">
              {/* 1. 기본 정보 */}
              <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                  <i class="fas fa-building text-purple-600 mr-3 text-2xl"></i>
                  <span>기본 정보</span>
                </h2>

                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="company_name" class="block text-sm font-medium text-gray-700 mb-2">
                        회사명 <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="회사명을 입력하세요"
                      />
                    </div>

                    <div>
                      <label for="representative_name" class="block text-sm font-medium text-gray-700 mb-2">
                        대표자명 <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="representative_name"
                        name="representative_name"
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="대표자명을 입력하세요"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="business_number" class="block text-sm font-medium text-gray-700 mb-2">
                        사업자등록번호 <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="business_number"
                        name="business_number"
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="000-00-00000"
                      />
                    </div>

                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                        연락처 <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="02-1234-5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                      회사 주소 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="회사 주소를 입력하세요"
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="industry" class="block text-sm font-medium text-gray-700 mb-2">업종</label>
                      <input
                        type="text"
                        id="industry"
                        name="industry"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="예: IT/소프트웨어"
                      />
                    </div>

                    <div>
                      <label for="company_size" class="block text-sm font-medium text-gray-700 mb-2">회사 규모</label>
                      <select
                        id="company_size"
                        name="company_size"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">선택하세요</option>
                        <option value="startup">스타트업 (1-10명)</option>
                        <option value="small">소규모 (11-50명)</option>
                        <option value="medium">중규모 (51-200명)</option>
                        <option value="large">대규모 (201명 이상)</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="website" class="block text-sm font-medium text-gray-700 mb-2">웹사이트</label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="https://www.example.com"
                      />
                    </div>

                    <div>
                      <label for="founded_year" class="block text-sm font-medium text-gray-700 mb-2">설립 연도</label>
                      <input
                        type="number"
                        id="founded_year"
                        name="founded_year"
                        min="1900"
                        max="2030"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="2020"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-2">회사 설명</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="회사의 역사, 업무 내용, 주요 성과를 입력하세요"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* 채용 정보 및 지원 사항 섹션 삭제됨 */}

              {/* 4. 채용 일정 섹션 삭제됨 */}

              <div class="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  id="cancel-btn"
                  class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <i class="fas fa-times mr-2"></i>취소
                </button>
                <button
                  type="submit"
                  class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <i class="fas fa-save mr-2"></i>저장하기
                </button>
              </div>
            </form>
          </div>
        </main>

        <script dangerouslySetInnerHTML={{
          __html: `
          let companyProfile = null;
          
          const initPage = async () => {
            console.log('[Company Profile] Initializing page...');
            await loadCompanyProfile();
            setupTabs();
            setupForm();
          };

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPage);
          } else {
            initPage();
          }
          
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
          

          
          async function loadCompanyProfile() {
            const viewSection = document.getElementById('view-section');
            
            try {
              console.log('[Profile Load] Starting...');
              const token = localStorage.getItem('wowcampus_token');
              if (!token) {
                throw new Error('로그인이 필요합니다.');
              }
              
              console.log('[Profile Load] Fetching data...');
              const response = await fetch('/api/profile/company', {
                headers: {
                  'Authorization': 'Bearer ' + token
                }
              });
              
              console.log('[Profile Load] Response status:', response.status);
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error('[Profile Load] Error response:', errorText);
                throw new Error('HTTP error: ' + response.status);
              }
              
              const result = await response.json();
              console.log('[Profile Load] Data received:', result);
              
              if (result.success && result.profile) {
                companyProfile = result.profile;
                displayCompanyProfile(result.profile);
                fillEditForm(result.profile);
                calculateCompleteness(result.profile);
              } else {
                viewSection.innerHTML = \`
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div class="flex items-center">
                      <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mr-4"></i>
                      <div>
                        <h3 class="font-bold text-gray-900 mb-1">프로필 정보가 없습니다</h3>
                        <p class="text-gray-600">기업 프로필을 등록해주세요</p>
                      </div>
                    </div>
                  </div>
                \`;
              }
            } catch (err) {
              console.error('[Profile Load] Error:', err);
              const errorMsg = err instanceof Error ? err.message : '프로필을 불러오는 중 오류가 발생했습니다.';
              viewSection.innerHTML = \`
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div class="flex items-center">
                    <i class="fas fa-times-circle text-red-500 text-2xl mr-4"></i>
                    <div>
                      <h3 class="font-bold text-gray-900 mb-1">오류 발생</h3>
                      <p class="text-gray-600">\${errorMsg}</p>
                    </div>
                  </div>
                </div>
              \`;
            }
          }
          
          function calculateCompleteness(profile) {
            const requiredFields = [
              'company_name', 'representative_name', 'business_number', 
              'phone', 'address'
            ];
            const optionalFields = [
              'industry', 'company_size', 'website', 'founded_year', 
              'description'
            ];
            
            let filledRequired = 0;
            let filledOptional = 0;
            
            requiredFields.forEach(field => {
              if (profile[field] && profile[field] !== '' && profile[field] !== 0) {
                filledRequired++;
              }
            });
            
            optionalFields.forEach(field => {
              if (profile[field]) {
                const value = profile[field];
                if (typeof value === 'string' && value !== '' && value !== '[]' && value !== '{}') {
                  filledOptional++;
                } else if (typeof value === 'object' && Object.keys(value).length > 0) {
                  filledOptional++;
                }
              }
            });
            
            const totalFields = requiredFields.length + optionalFields.length;
            const totalFilled = filledRequired + filledOptional;
            const percentage = Math.round((totalFilled / totalFields) * 100);
            
            const completenessDiv = document.getElementById('profile-completeness');
            const percentSpan = document.getElementById('completeness-percent');
            
            if (completenessDiv && percentSpan) {
              completenessDiv.classList.remove('hidden');
              percentSpan.textContent = percentage;
              
              if (percentage < 50) {
                completenessDiv.className = 'px-4 py-2 bg-red-50 rounded-lg';
                percentSpan.className = 'text-sm font-medium text-red-700';
              } else if (percentage < 80) {
                completenessDiv.className = 'px-4 py-2 bg-yellow-50 rounded-lg';
                percentSpan.className = 'text-sm font-medium text-yellow-700';
              } else {
                completenessDiv.className = 'px-4 py-2 bg-green-50 rounded-lg';
                percentSpan.className = 'text-sm font-medium text-green-700';
              }
            }
          }
          
          function parseJSON(str) {
            try {
              return typeof str === 'string' ? JSON.parse(str) : str;
            } catch (e) {
              return null;
            }
          }
          
          function displayCompanyProfile(profile) {
            const viewSection = document.getElementById('view-section');
            
            const basicInfo = \`
              <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-building text-purple-600 mr-3"></i>
                  기본 정보
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span class="text-gray-600">회사명:</span> <span class="font-medium">\${profile.company_name || '-'}</span></div>
                  <div><span class="text-gray-600">대표자:</span> <span class="font-medium">\${profile.representative_name || '-'}</span></div>
                  <div><span class="text-gray-600">사업자등록번호:</span> <span class="font-medium">\${profile.business_number || '-'}</span></div>
                  <div><span class="text-gray-600">연락처:</span> <span class="font-medium">\${profile.phone || '-'}</span></div>
                  <div class="md:col-span-2"><span class="text-gray-600">주소:</span> <span class="font-medium">\${profile.address || '-'}</span></div>
                  <div><span class="text-gray-600">업종:</span> <span class="font-medium">\${profile.industry || '-'}</span></div>
                  <div><span class="text-gray-600">회사 규모:</span> <span class="font-medium">\${formatCompanySize(profile.company_size)}</span></div>
                  <div><span class="text-gray-600">웹사이트:</span> <span class="font-medium">\${profile.website ? '<a href="' + profile.website + '" target="_blank" class="text-blue-600 hover:underline">' + profile.website + '</a>' : '-'}</span></div>
                  <div><span class="text-gray-600">설립 연도:</span> <span class="font-medium">\${profile.founded_year || '-'}</span></div>
                </div>
                \${profile.description ? '<div class="mt-4 pt-4 border-t"><div class="text-gray-600 mb-2">회사 설명:</div><div class="text-gray-800">' + profile.description + '</div></div>' : ''}
              </div>
            \`;
            
            viewSection.innerHTML = basicInfo;
          }
          
          function formatCompanySize(size) {
            const sizes = {
              'startup': '스타트업 (1-10명)',
              'small': '소규모 (11-50명)',
              'medium': '중규모 (51-200명)',
              'large': '대규모 (201명 이상)'
            };
            return sizes[size] || '-';
          }
          
          function fillEditForm(profile) {
            // Basic info
            document.getElementById('company_name').value = profile.company_name || '';
            document.getElementById('representative_name').value = profile.representative_name || '';
            document.getElementById('business_number').value = profile.business_number || '';
            document.getElementById('phone').value = profile.phone || '';
            document.getElementById('address').value = profile.address || '';
            document.getElementById('industry').value = profile.industry || '';
            document.getElementById('company_size').value = profile.company_size || '';
            document.getElementById('website').value = profile.website || '';
            document.getElementById('founded_year').value = profile.founded_year || '';
            document.getElementById('description').value = profile.description || '';
            
          }
          
          function setupForm() {
            const form = document.getElementById('company-profile-form');
            const cancelBtn = document.getElementById('cancel-btn');
            
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              await saveCompanyProfile();
            });
            
            cancelBtn.addEventListener('click', () => {
              if (companyProfile) {
                fillEditForm(companyProfile);
              } else {
                form.reset();
              }
              document.getElementById('tab-view').click();
            });
          }
          
          async function saveCompanyProfile() {
            try {
              const form = document.getElementById('company-profile-form');
              const formData = new FormData(form);
              
              const data = {
                company_name: formData.get('company_name'),
                representative_name: formData.get('representative_name'),
                business_number: formData.get('business_number'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                industry: formData.get('industry'),
                company_size: formData.get('company_size'),
                website: formData.get('website'),
                founded_year: formData.get('founded_year'),
                description: formData.get('description')
              };
              
              console.log('[Save Profile] Data:', data);
              
              const token = localStorage.getItem('wowcampus_token');
              const response = await fetch('/api/profile/company', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
              });
              
              const result = await response.json();
              
              if (result.success) {
                alert('프로필이 저장되었습니다');
                await loadCompanyProfile();
                document.getElementById('tab-view').click();
              } else {
                throw new Error((result.message || '저장 실패') + (result.error ? '\\n' + result.error : ''));
              }
            } catch (err) {
              console.error('[Save Profile] Error:', err);
              alert('저장 오류: ' + err.message);
            }
          }
        `}} />
      </div>
    )
  } catch (err) {
    console.error('[Company Profile Page] Error:', err);

    return c.render(
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 class="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p class="text-gray-700 mb-4">페이지를 불러오는 중 오류가 발생했습니다.</p>
          <p class="text-sm text-gray-500">{err instanceof Error ? err.message : '알 수 없는 오류'}</p>
        </div>
      </div>
    );
  }
}
