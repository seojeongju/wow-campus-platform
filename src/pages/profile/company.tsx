/**
 * Company Profile Page - Redesigned
 * Route: /profile/company
 * 채용의향서 기반 8개 신규 필드 포함
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
              <img src="/logo_small.png" alt="WOW-CAMPUS Logo" class="h-8 w-auto" alt="WOW-CAMPUS" class="h-10" />
              <span class="text-xl font-bold text-blue-600">WOW-CAMPUS</span>
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴 */}
          </div>
          
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
            {/* 동적 인증 버튼 */}
          </div>
          
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200"></div>
            <div id="mobile-auth-buttons" class="pt-3"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div class="mb-8">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">기업 프로필 관리</h1>
              <p class="text-gray-600">채용 정보를 포함한 상세 기업 프로필을 관리하세요</p>
            </div>
            <div class="flex items-center space-x-3">
              <div id="profile-completeness" class="hidden px-4 py-2 bg-blue-50 rounded-lg">
                <span class="text-sm font-medium text-blue-700">프로필 완성도: <span id="completeness-percent">0</span>%</span>
              </div>
              <a href="/dashboard/company" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                대시보드로
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
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

        {/* View Section */}
        <div id="view-section" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p class="text-gray-500">기업 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>

        {/* Edit Section */}
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
                      업체명 <span class="text-red-500">*</span>
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

                  <div>
                    <label for="representative_name" class="block text-sm font-medium text-gray-700 mb-2">
                      대표자 <span class="text-red-500">*</span> <span class="text-xs text-blue-600">(신규)</span>
                    </label>
                    <input 
                      type="text" 
                      id="representative_name" 
                      name="representative_name" 
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="예: 홍길동"
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
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="000-00-00000"
                    />
                  </div>

                  <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                      전화번호 <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="02-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                    영업소재지 <span class="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="서울시 강남구 테헤란로 123"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                    기업 소개
                  </label>
                  <textarea 
                    id="description" 
                    name="description"
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="기업의 비전, 사업 내용, 특징 등을 소개해주세요"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 2. 채용 정보 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-user-tie text-blue-600 mr-3 text-2xl"></i>
                <span>채용 정보</span>
                <span class="ml-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">NEW</span>
              </h2>
              
              <div class="space-y-6">
                {/* 채용 직종 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    채용 직종 <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_3d_engineer" name="recruitment_positions[]" value="3D 설계 엔지니어" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_3d_engineer" class="ml-2 text-sm text-gray-700">3D 설계 엔지니어</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_cad_operator" name="recruitment_positions[]" value="CAD 오퍼레이터" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_cad_operator" class="ml-2 text-sm text-gray-700">CAD 오퍼레이터</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_product_designer" name="recruitment_positions[]" value="제품 설계자" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_product_designer" class="ml-2 text-sm text-gray-700">제품 설계자</label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <input type="checkbox" id="pos_other" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_other" class="text-sm text-gray-700">기타:</label>
                      <input type="text" id="pos_other_text" class="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" placeholder="직접 입력" />
                    </div>
                  </div>
                </div>

                {/* 채용 인원 */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="recruitment_count" class="block text-sm font-medium text-gray-700 mb-2">
                      채용 인원 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input 
                        type="number" 
                        id="recruitment_count" 
                        name="recruitment_count" 
                        required
                        min="1"
                        class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1"
                      />
                      <span class="absolute right-4 top-2 text-gray-500">명</span>
                    </div>
                  </div>

                  <div>
                    <label for="minimum_salary" class="block text-sm font-medium text-gray-700 mb-2">
                      최소 연봉 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input 
                        type="number" 
                        id="minimum_salary" 
                        name="minimum_salary" 
                        required
                        min="0"
                        step="100"
                        class="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="3000"
                      />
                      <span class="absolute right-4 top-2 text-gray-500">만원 이상</span>
                    </div>
                  </div>
                </div>

                {/* 근무 형태 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    근무 형태 <span class="text-red-500">*</span>
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_fulltime" name="employment_types[]" value="정규직" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_fulltime" class="ml-2 text-sm text-gray-700">정규직</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_contract" name="employment_types[]" value="계약직" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_contract" class="ml-2 text-sm text-gray-700">계약직</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_intern" name="employment_types[]" value="인턴십" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_intern" class="ml-2 text-sm text-gray-700">인턴십</label>
                    </div>
                  </div>
                </div>

                {/* 필수 자격 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    필수 자격
                  </label>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_acu" name="qualifications[]" value="ACU Fusion 자격증" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_acu" class="ml-2 text-sm text-gray-700">ACU Fusion 자격증</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_degree" name="qualifications[]" value="학사학위 이상" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_degree" class="ml-2 text-sm text-gray-700">학사학위 이상</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_korean" name="qualifications[]" value="한국어 의사소통 가능" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_korean" class="ml-2 text-sm text-gray-700">한국어 의사소통 가능</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 지원 사항 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-green-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-hands-helping text-green-600 mr-3 text-2xl"></i>
                <span>지원 사항</span>
                <span class="ml-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">NEW</span>
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_visa" name="support_items[]" value="visa" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_visa" class="ml-3">
                    <div class="font-medium text-gray-900">E-7-4 비자 신청 협조</div>
                    <div class="text-sm text-gray-500">비자 신청 및 취득 지원</div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_education" name="support_items[]" value="korean_education" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_education" class="ml-3">
                    <div class="font-medium text-gray-900">사내 한국어 교육 지원</div>
                    <div class="text-sm text-gray-500">한국어 교육 프로그램 제공</div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_mentoring" name="support_items[]" value="mentoring" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_mentoring" class="ml-3">
                    <div class="font-medium text-gray-900">멘토링 프로그램 운영</div>
                    <div class="text-sm text-gray-500">1:1 멘토링 지원</div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_accommodation" name="support_items[]" value="accommodation" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_accommodation" class="ml-3">
                    <div class="font-medium text-gray-900">숙소 지원 또는 주거비 보조</div>
                    <div class="text-sm text-gray-500">주거 관련 지원</div>
                  </label>
                </div>
              </div>
            </div>

            {/* 4. 채용 일정 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-orange-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-calendar-check text-orange-600 mr-3 text-2xl"></i>
                <span>채용 일정</span>
                <span class="ml-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">NEW</span>
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label for="schedule_document" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-file-alt text-orange-500 mr-2"></i>서류전형
                  </label>
                  <input 
                    type="text" 
                    id="schedule_document" 
                    name="schedule_document" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="예: 교육 완료 후 1주 이내"
                  />
                </div>

                <div>
                  <label for="schedule_interview" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-comments text-orange-500 mr-2"></i>면접전형
                  </label>
                  <input 
                    type="text" 
                    id="schedule_interview" 
                    name="schedule_interview" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="예: 서류합격자 대상"
                  />
                </div>

                <div>
                  <label for="schedule_final" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-check-circle text-orange-500 mr-2"></i>최종합격 통보
                  </label>
                  <input 
                    type="text" 
                    id="schedule_final" 
                    name="schedule_final" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="예: 면접 후 1주 이내 통보"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 기업 프로필 JavaScript ====================
        
        let companyProfile = null;
        
        // 페이지 로드
        document.addEventListener('DOMContentLoaded', async () => {
          await loadCompanyProfile();
          setupTabs();
          setupForm();
          setupOtherPositionCheckbox();
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
        
        // '기타' 직종 체크박스 설정
        function setupOtherPositionCheckbox() {
          const otherCheckbox = document.getElementById('pos_other');
          const otherText = document.getElementById('pos_other_text');
          
          if (otherCheckbox && otherText) {
            otherCheckbox.addEventListener('change', (e) => {
              if (e.target.checked) {
                otherText.focus();
              } else {
                otherText.value = '';
              }
            });
            
            otherText.addEventListener('input', (e) => {
              if (e.target.value) {
                otherCheckbox.checked = true;
              }
            });
          }
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
              calculateCompleteness(result.profile);
            } else {
              document.getElementById('view-section').innerHTML = \`
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mr-4"></i>
                    <div>
                      <h3 class="font-bold text-gray-900 mb-1">프로필 정보가 없습니다</h3>
                      <p class="text-gray-600">프로필 수정 탭에서 기업 정보를 입력해주세요.</p>
                    </div>
                  </div>
                </div>
              \`;
            }
          } catch (error) {
            console.error('프로필 로드 실패:', error);
            document.getElementById('view-section').innerHTML = \`
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-center">
                  <i class="fas fa-times-circle text-red-500 text-2xl mr-4"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">오류 발생</h3>
                    <p class="text-gray-600">프로필 정보를 불러오는 중 오류가 발생했습니다.</p>
                  </div>
                </div>
              </div>
            \`;
          }
        }
        
        // 프로필 완성도 계산
        function calculateCompleteness(profile) {
          const requiredFields = [
            'company_name', 'representative_name', 'business_number', 
            'phone', 'address', 'recruitment_count', 'minimum_salary'
          ];
          const optionalFields = [
            'industry', 'company_size', 'website', 'founded_year', 
            'description', 'recruitment_positions', 'employment_types',
            'required_qualifications', 'support_items', 'recruitment_schedule'
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
              if (typeof profile[field] === 'string' && profile[field] !== '' && profile[field] !== '[]' && profile[field] !== '{}') {
                filledOptional++;
              } else if (typeof profile[field] === 'object' && Object.keys(profile[field]).length > 0) {
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
            
            // 색상 변경
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
        
        // 프로필 표시 (계속)
        function displayCompanyProfile(profile) {
          const viewSection = document.getElementById('view-section');
          
          // 기본 정보
          let basicInfoHtml = \`
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span class="text-gray-600">업체명:</span> <span class="font-medium">\${profile.company_name || '-'}</span></div>
              <div><span class="text-gray-600">대표자:</span> <span class="font-medium">\${profile.representative_name || '-'}</span> <span class="text-xs text-blue-600">NEW</span></div>
              <div><span class="text-gray-600">사업자등록번호:</span> <span class="font-medium">\${profile.business_number || '-'}</span></div>
              <div><span class="text-gray-600">전화번호:</span> <span class="font-medium">\${profile.phone || '-'}</span></div>
              <div class="md:col-span-2"><span class="text-gray-600">주소:</span> <span class="font-medium">\${profile.address || '-'}</span></div>
              <div><span class="text-gray-600">업종:</span> <span class="font-medium">\${profile.industry || '-'}</span></div>
              <div><span class="text-gray-600">기업 규모:</span> <span class="font-medium">\${formatCompanySize(profile.company_size)}</span></div>
              <div><span class="text-gray-600">웹사이트:</span> <span class="font-medium">\${profile.website ? \`<a href="\${profile.website}" target="_blank" class="text-blue-600 hover:underline">\${profile.website}</a>\` : '-'}</span></div>
              <div><span class="text-gray-600">설립 연도:</span> <span class="font-medium">\${profile.founded_year || '-'}</span></div>
            </div>
            \${profile.description ? \`
              <div class="mt-4 pt-4 border-t">
                <div class="text-gray-600 mb-2">기업 소개:</div>
                <div class="text-gray-800">\${profile.description}</div>
              </div>
            \` : ''}
          \`;
          
          // 채용 정보 (NEW)
          let recruitmentInfoHtml = '';
          if (profile.recruitment_count || profile.recruitment_positions) {
            const positions = parseJSON(profile.recruitment_positions) || [];
            const employmentTypes = parseJSON(profile.employment_types) || [];
            const qualifications = parseJSON(profile.required_qualifications) || {};
            
            recruitmentInfoHtml = \`
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-user-tie text-blue-600 mr-3"></i>
                  채용 정보
                  <span class="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">NEW</span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-gray-600">채용 인원:</span> 
                    <span class="font-medium text-blue-600">\${profile.recruitment_count || 0}명</span>
                  </div>
                  <div>
                    <span class="text-gray-600">최소 연봉:</span> 
                    <span class="font-medium text-green-600">\${profile.minimum_salary || 0}만원 이상</span>
                  </div>
                  \${positions.length > 0 ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">채용 직종:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${positions.map(p => \`<span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">\${p}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}
                  \${employmentTypes.length > 0 ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">근무 형태:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${employmentTypes.map(t => \`<span class="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">\${t}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}
                  \${qualifications.certification || qualifications.degree || qualifications.korean ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">필수 자격:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${qualifications.certification ? \`<span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">\${qualifications.certification}</span>\` : ''}
                        \${qualifications.degree ? \`<span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">\${qualifications.degree}</span>\` : ''}
                        \${qualifications.korean ? \`<span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">\${qualifications.korean}</span>\` : ''}
                      </div>
                    </div>
                  \` : ''}
                </div>
              </div>
            \`;
          }
          
          // 지원 사항 (NEW)
          let supportInfoHtml = '';
          if (profile.support_items) {
            const supportItems = parseJSON(profile.support_items) || {};
            const hasSupport = Object.values(supportItems).some(v => v);
            
            if (hasSupport) {
              supportInfoHtml = \`
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-hands-helping text-green-600 mr-3"></i>
                    지원 사항
                    <span class="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">NEW</span>
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    \${supportItems.visa ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>E-7-4 비자 신청 협조</span>
                      </div>
                    \` : ''}
                    \${supportItems.korean_education ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>사내 한국어 교육 지원</span>
                      </div>
                    \` : ''}
                    \${supportItems.mentoring ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>멘토링 프로그램 운영</span>
                      </div>
                    \` : ''}
                    \${supportItems.accommodation ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>숙소 지원 또는 주거비 보조</span>
                      </div>
                    \` : ''}
                  </div>
                </div>
              \`;
            }
          }
          
          // 채용 일정 (NEW)
          let scheduleInfoHtml = '';
          if (profile.recruitment_schedule) {
            const schedule = parseJSON(profile.recruitment_schedule) || {};
            const hasSchedule = schedule.document_screening || schedule.interview || schedule.final_decision;
            
            if (hasSchedule) {
              scheduleInfoHtml = \`
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-calendar-check text-orange-600 mr-3"></i>
                    채용 일정
                    <span class="ml-3 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">NEW</span>
                  </h3>
                  <div class="space-y-3">
                    \${schedule.document_screening ? \`
                      <div class="flex items-start">
                        <i class="fas fa-file-alt text-orange-500 mr-3 mt-1"></i>
                        <div>
                          <div class="font-medium text-gray-900">서류전형</div>
                          <div class="text-gray-600">\${schedule.document_screening}</div>
                        </div>
                      </div>
                    \` : ''}
                    \${schedule.interview ? \`
                      <div class="flex items-start">
                        <i class="fas fa-comments text-orange-500 mr-3 mt-1"></i>
                        <div>
                          <div class="font-medium text-gray-900">면접전형</div>
                          <div class="text-gray-600">\${schedule.interview}</div>
                        </div>
                      </div>
                    \` : ''}
                    \${schedule.final_decision ? \`
                      <div class="flex items-start">
                        <i class="fas fa-check-circle text-orange-500 mr-3 mt-1"></i>
                        <div>
                          <div class="font-medium text-gray-900">최종합격 통보</div>
                          <div class="text-gray-600">\${schedule.final_decision}</div>
                        </div>
                      </div>
                    \` : ''}
                  </div>
                </div>
              \`;
            }
          }
          
          viewSection.innerHTML = \`
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-building text-purple-600 mr-3"></i>
                기본 정보
              </h3>
              \${basicInfoHtml}
            </div>
            \${recruitmentInfoHtml}
            \${supportInfoHtml}
            \${scheduleInfoHtml}
          \`;
        }
        
        // JSON 파싱 헬퍼
        function parseJSON(str) {
          try {
            return typeof str === 'string' ? JSON.parse(str) : str;
          } catch (e) {
            return null;
          }
        }
        
        // 기업 규모 포맷
        function formatCompanySize(size) {
          const sizes = {
            'startup': '스타트업 (1-10명)',
            'small': '소기업 (11-50명)',
            'medium': '중기업 (51-200명)',
            'large': '대기업 (201명 이상)'
          };
          return sizes[size] || '-';
        }
        
        // 폼 채우기
        function fillEditForm(profile) {
          // 기본 정보
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
          
          // 채용 정보
          document.getElementById('recruitment_count').value = profile.recruitment_count || '';
          document.getElementById('minimum_salary').value = profile.minimum_salary || '';
          
          // 채용 직종
          const positions = parseJSON(profile.recruitment_positions) || [];
          positions.forEach(pos => {
            const checkbox = document.querySelector(\`input[name="recruitment_positions[]"][value="\${pos}"]\`);
            if (checkbox) checkbox.checked = true;
          });
          
          // 근무 형태
          const employmentTypes = parseJSON(profile.employment_types) || [];
          employmentTypes.forEach(type => {
            const checkbox = document.querySelector(\`input[name="employment_types[]"][value="\${type}"]\`);
            if (checkbox) checkbox.checked = true;
          });
          
          // 필수 자격
          const qualifications = parseJSON(profile.required_qualifications) || {};
          if (qualifications) {
            Object.values(qualifications).forEach(qual => {
              const checkbox = document.querySelector(\`input[name="qualifications[]"][value="\${qual}"]\`);
              if (checkbox) checkbox.checked = true;
            });
          }
          
          // 지원 사항
          const supportItems = parseJSON(profile.support_items) || {};
          Object.keys(supportItems).forEach(key => {
            if (supportItems[key]) {
              const checkbox = document.querySelector(\`input[name="support_items[]"][value="\${key}"]\`);
              if (checkbox) checkbox.checked = true;
            }
          });
          
          // 채용 일정
          const schedule = parseJSON(profile.recruitment_schedule) || {};
          document.getElementById('schedule_document').value = schedule.document_screening || '';
          document.getElementById('schedule_interview').value = schedule.interview || '';
          document.getElementById('schedule_final').value = schedule.final_decision || '';
        }
        
        // 폼 설정
        function setupForm() {
          const form = document.getElementById('company-profile-form');
          const cancelBtn = document.getElementById('cancel-btn');
          
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile();
          });
          
          cancelBtn.addEventListener('click', () => {
            if (companyProfile) {
              fillEditForm(companyProfile);
            } else {
              form.reset();
            }
            // 보기 탭으로 전환
            document.getElementById('tab-view').click();
          });
        }
        
        // 프로필 저장
        async function saveProfile() {
          try {
            const formData = new FormData(document.getElementById('company-profile-form'));
            
            // 채용 직종 (배열)
            const positions = [];
            document.querySelectorAll('input[name="recruitment_positions[]"]:checked').forEach(cb => {
              positions.push(cb.value);
            });
            // '기타' 직종 추가
            const otherPosition = document.getElementById('pos_other_text').value;
            if (otherPosition && document.getElementById('pos_other').checked) {
              positions.push(otherPosition);
            }
            
            // 근무 형태 (배열)
            const employmentTypes = [];
            document.querySelectorAll('input[name="employment_types[]"]:checked').forEach(cb => {
              employmentTypes.push(cb.value);
            });
            
            // 필수 자격 (객체)
            const qualifications = {};
            document.querySelectorAll('input[name="qualifications[]"]:checked').forEach(cb => {
              if (cb.value.includes('ACU')) qualifications.certification = cb.value;
              if (cb.value.includes('학사')) qualifications.degree = cb.value;
              if (cb.value.includes('한국어')) qualifications.korean = cb.value;
            });
            
            // 지원 사항 (객체)
            const supportItems = {};
            document.querySelectorAll('input[name="support_items[]"]:checked').forEach(cb => {
              supportItems[cb.value] = true;
            });
            
            // 채용 일정 (객체)
            const schedule = {
              document_screening: document.getElementById('schedule_document').value,
              interview: document.getElementById('schedule_interview').value,
              final_decision: document.getElementById('schedule_final').value
            };
            
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
              description: formData.get('description'),
              recruitment_count: parseInt(formData.get('recruitment_count')) || 0,
              minimum_salary: parseInt(formData.get('minimum_salary')) || 0,
              recruitment_positions: JSON.stringify(positions),
              employment_types: JSON.stringify(employmentTypes),
              required_qualifications: JSON.stringify(qualifications),
              support_items: JSON.stringify(supportItems),
              recruitment_schedule: JSON.stringify(schedule)
            };
            
            console.log('저장할 데이터:', data);
            
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
              if (window.toast) {
                window.toast.success('프로필이 저장되었습니다');
              } else {
                alert('프로필이 저장되었습니다');
              }
              await loadCompanyProfile();
              document.getElementById('tab-view').click();
            } else {
              throw new Error(result.message || '저장 실패');
            }
          } catch (error) {
            console.error('저장 오류:', error);
            if (window.toast) {
              window.toast.error('저장 중 오류가 발생했습니다: ' + error.message);
            } else {
              alert('저장 중 오류가 발생했습니다: ' + error.message);
            }
          }
        }
      `}} />
    </div>
  )
}
