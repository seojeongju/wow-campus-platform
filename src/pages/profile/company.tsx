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
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABlCAYAAAD3Xd5lAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QsMBR0y8emRNAAAcSJJREFUeNrtfWeYlEUa7amqL3Wa7p4IDAw5m0BUVDBgRkyYc06YI66BNWfMrgGzmAMoZlFRBBGQnMMwOXdPT8cvVdX90T0Iguvu6q7ee/vw9DM8M1256tRbVW8A8sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPP7LIH9m4e81SQKgEEC7FoQAQRhACoB9hPG/qdr9c2oQ0FVaH09VrGrvMOotS1KNoX+Bn/QLFrQ5QrTdsWfP/EzZAi+9+xM8Xk/JTz8tLVqyeLVsj3VAUQz0qCghe+wx0OrVq0tNIpnmZx2zb76z/h/EvY99gcJwqHTZypWFq9euk7H2DhQUBNG7dynZYVBvs0eP7jXxeEKce8r+f3jZ/zErPPH1Ckgpdv6mruGEdocpBjWkIH44NM3CLDLn3VN3+vCh2bXimn1Gb0sS36zEjj2LlZnLai5qEf6jaloTS5mwnZIK3w6w4xt8mdQ9krGWF088ZLtl3zp9AShk39URcV4l5wRKAoYdgtcUtEdBYu7Ubxamp18++1fr/npNEh5NVX/aVF1Yt6l1z5RU97U0Y1yE0OIOECmJRBEFDUq+MOTac1S475V0LVotHO48MGbwNvkd+tTbgJS9bb3wfMoKqSmTcBRBAtzLh/j8r61qi62cefHe263Lo1+vQUXAUD5d03hSpRA7Q3JemKawmIcFvZm1e3VteeGiA8eLX2vLxe/OQlBh41YkzX2RYVwSFZaUrMhJbSpKtD2bNALuK1cc/bsnysVX3g8pHK05kh4SS9rjXaGOcgUZ3t6eEpblglEFXi8loTDaTSv2UWlhaPbAngNnn3Li+GgmY9qjRvb4l8q56YEXwV13zy+/mntMNGYJBRQUAplMhgwfsXNy//32fDIeT0ZvueLY38yr77BjQKR1tENCe7vwc0okKE+yHQaWb7j0whOfe3/G13zKIxP/5T4oG3QEdtlp8JBNNZFTTYsqFKq0LAuD+hWIo48c9RznovLqC48HABx50gRIKfesrbaOcRwmHNkGoigg0g8pJQAJwSmkBCgDVB0IBj1kYL8eaTNtvz2ob//GDz75NLbo+1e3qcfDT70PzvmQ6Z98c8bG2igYVcAUP6SIs9Ji+WNTi/lu3dJp/7Qt48+47vQfF9bu5HAPp6oDQUwEvV7Rr1f5c1LKys/evner71/7t8fguKYWibg7NTTFj3akuo8gZKdYIiks2wFjKgI+kKBfiTQ1NHy409D+MVUl7+wwtF/jl1/Pjn05/ak/hLCU/zRhJJMG5bzZJji... (line truncated)" alt="WOW-CAMPUS" class="h-10" />
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
                    기업 주소 <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-2">
                    {/* 우편번호 */}
                    <div class="flex gap-2">
                      <input 
                        type="text" 
                        id="postcode" 
                        name="postcode"
                        readonly
                        class="w-32 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="우편번호"
                      />
                      <button 
                        type="button" 
                        id="search-address-btn"
                        class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <i class="fas fa-search mr-2"></i>주소 검색
                      </button>
                    </div>
                    {/* 기본 주소 */}
                    <input 
                      type="text" 
                      id="address" 
                      name="address"
                      readonly
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="주소 검색 버튼을 클릭하세요"
                    />
                    {/* 상세 주소 */}
                    <input 
                      type="text" 
                      id="address-detail" 
                      name="address_detail"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="상세주소를 입력하세요 (동, 호수 등)"
                    />
                  </div>
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

            {/* 2. 구인 공고 상세 정보 (Phase 3A - 핵심 필드) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-file-contract text-blue-600 mr-3 text-2xl"></i>
                <span>구인 공고 상세 정보</span>
                <span class="ml-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">UPDATED</span>
              </h2>
              
              <div class="space-y-6">
                {/* E-7 비자 직종 코드 ⭐ 가장 중요! */}
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label for="e7_visa_code" class="block text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <i class="fas fa-star text-yellow-500 mr-2"></i>
                    E-7 비자 직종 코드 <span class="text-red-500 ml-1">*</span>
                    <span class="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">가장 중요!</span>
                  </label>
                  <select 
                    id="e7_visa_code" 
                    name="e7_visa_code"
                    required
                    class="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                  >
                    <option value="">-- E-7 직종을 선택하세요 --</option>
                  </select>
                  <div id="e7_salary_requirement" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 hidden">
                    <i class="fas fa-info-circle mr-2"></i>
                    <span id="e7_salary_text">최소 연봉 요건이 여기에 표시됩니다</span>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">
                    💡 E-7 비자 발급을 위해서는 법무부 지정 직종 코드가 필수입니다
                  </p>
                </div>

                {/* 채용 직무명 (국/영) */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="job_title_ko" class="block text-sm font-medium text-gray-700 mb-2">
                      채용 직무명 (국문) <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="job_title_ko" 
                      name="job_title_ko"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 3D 설계 엔지니어"
                    />
                  </div>
                  <div>
                    <label for="job_title_en" class="block text-sm font-medium text-gray-700 mb-2">
                      채용 직무명 (영문)
                    </label>
                    <input 
                      type="text" 
                      id="job_title_en" 
                      name="job_title_en"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 3D Design Engineer"
                    />
                  </div>
                </div>

                {/* 담당 업무 및 주요 역할 */}
                <div>
                  <label for="job_responsibilities" class="block text-sm font-medium text-gray-700 mb-2">
                    상세 담당 업무 및 주요 역할 <span class="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="job_responsibilities" 
                    name="job_responsibilities"
                    required
                    rows="6"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="구체적인 업무 내용을 상세히 작성해주세요...&#10;&#10;예시:&#10;• 3D CAD 소프트웨어를 활용한 제품 설계&#10;• 설계 도면 작성 및 검토&#10;• 고객 요구사항 분석 및 설계에 반영&#10;• 프로토타입 제작 및 테스트&#10;• 설계 품질 관리 및 개선"
                  ></textarea>
                  <p class="mt-1 text-xs text-gray-500">최소 100자 이상 권장 (현재: <span id="responsibilities_count">0</span>자)</p>
                </div>

                {/* 채용 인원 */}
                <div>
                  <label for="recruitment_count" class="block text-sm font-medium text-gray-700 mb-2">
                    채용 인원 <span class="text-red-500">*</span>
                  </label>
                  <div class="relative w-48">
                    <input 
                      type="number" 
                      id="recruitment_count" 
                      name="recruitment_count" 
                      required
                      min="1"
                      class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                    />
                    <span class="absolute right-4 top-2.5 text-gray-500">명</span>
                  </div>
                </div>

                {/* 급여 범위 (세전) */}
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label class="block text-sm font-medium text-gray-900 mb-3">
                    <i class="fas fa-won-sign text-green-600 mr-2"></i>
                    급여 수준 (세전) <span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="salary_min" class="block text-xs text-gray-600 mb-1">최소 연봉</label>
                      <div class="relative">
                        <input 
                          type="number" 
                          id="salary_min" 
                          name="salary_min"
                          required
                          min="2515"
                          step="100"
                          class="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="2800"
                        />
                        <span class="absolute right-4 top-2.5 text-gray-500">만원</span>
                      </div>
                    </div>
                    <div>
                      <label for="salary_max" class="block text-xs text-gray-600 mb-1">최대 연봉 (선택)</label>
                      <div class="relative">
                        <input 
                          type="number" 
                          id="salary_max" 
                          name="salary_max"
                          min="0"
                          step="100"
                          class="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="3500"
                        />
                        <span class="absolute right-4 top-2.5 text-gray-500">만원</span>
                      </div>
                    </div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">
                    💡 E-7 비자 직종별 최소 연봉 요건을 충족해야 합니다
                  </p>
                </div>

                {/* 계약 형태 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    계약 형태 <span class="text-red-500">*</span>
                  </label>
                  <div class="flex flex-wrap gap-4">
                    <div class="flex items-center">
                      <input type="radio" id="contract_fulltime" name="contract_type" value="정규직" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" required />
                      <label for="contract_fulltime" class="ml-2 text-sm text-gray-700">정규직</label>
                    </div>
                    <div class="flex items-center">
                      <input type="radio" id="contract_contract" name="contract_type" value="계약직" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <label for="contract_contract" class="ml-2 text-sm text-gray-700">계약직</label>
                    </div>
                    <div class="flex items-center">
                      <input type="radio" id="contract_intern" name="contract_type" value="인턴십" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <label for="contract_intern" class="ml-2 text-sm text-gray-700">인턴십</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 외국인 지원 사항 (Phase 3A - 비자 중심) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-green-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-passport text-green-600 mr-3 text-2xl"></i>
                <span>외국인 지원 사항</span>
                <span class="ml-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">UPDATED</span>
              </h2>
              
              <div class="space-y-6">
                {/* E-7 비자 발급/연장 지원 */}
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label class="block text-sm font-medium text-gray-900 mb-3">
                    <i class="fas fa-id-card text-purple-600 mr-2"></i>
                    E-7 비자 발급 및 연장 지원 <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-3">
                    <div class="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
                      <input type="radio" id="visa_full" name="visa_support_level" value="full" class="w-4 h-4 text-purple-600 border-gray-300 mt-1 focus:ring-purple-500" required />
                      <label for="visa_full" class="ml-3 cursor-pointer flex-1">
                        <div class="font-medium text-gray-900">전면 지원</div>
                        <div class="text-sm text-gray-500">비용 전액 회사 부담 + 서류 준비 지원</div>
                      </label>
                    </div>
                    <div class="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
                      <input type="radio" id="visa_partial" name="visa_support_level" value="partial" class="w-4 h-4 text-purple-600 border-gray-300 mt-1 focus:ring-purple-500" />
                      <label for="visa_partial" class="ml-3 cursor-pointer flex-1">
                        <div class="font-medium text-gray-900">부분 지원</div>
                        <div class="text-sm text-gray-500">비용 일부 회사 부담 + 서류 준비 지원</div>
                      </label>
                    </div>
                    <div class="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
                      <input type="radio" id="visa_assistance" name="visa_support_level" value="assistance" class="w-4 h-4 text-purple-600 border-gray-300 mt-1 focus:ring-purple-500" />
                      <label for="visa_assistance" class="ml-3 cursor-pointer flex-1">
                        <div class="font-medium text-gray-900">협조만 제공</div>
                        <div class="text-sm text-gray-500">서류 지원만 (비용은 본인 부담)</div>
                      </label>
                    </div>
                    <div class="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
                      <input type="radio" id="visa_none" name="visa_support_level" value="none" class="w-4 h-4 text-purple-600 border-gray-300 mt-1 focus:ring-purple-500" />
                      <label for="visa_none" class="ml-3 cursor-pointer flex-1">
                        <div class="font-medium text-gray-900">지원 없음</div>
                        <div class="text-sm text-gray-500">비자 관련 지원 제공하지 않음</div>
                      </label>
                    </div>
                  </div>
                  <div class="mt-3">
                    <label for="visa_support_details" class="block text-xs text-gray-600 mb-1">상세 내용 (선택)</label>
                    <textarea 
                      id="visa_support_details" 
                      name="visa_support_details"
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="예: 비자 신청 대행 서비스 이용, 법무사 비용 전액 지원"
                    ></textarea>
                  </div>
                </div>

                {/* 주거 지원 */}
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label class="block text-sm font-medium text-gray-900 mb-3">
                    <i class="fas fa-home text-blue-600 mr-2"></i>
                    주거 지원 <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-3">
                    <div class="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <input type="radio" id="housing_dorm_free" name="housing_support_type" value="dorm_free" class="w-4 h-4 text-blue-600 border-gray-300 mt-1 focus:ring-blue-500" required />
                      <label for="housing_dorm_free" class="ml-3 cursor-pointer flex-1">
                        <div class="font-medium text-gray-900">기숙사 제공 (무료)</div>
                        <div class="text-sm text-gray-500">회사 기숙사 무료 제공</div>
                      </label>
                    </div>
                    <div class="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <input type="radio" id="housing_dorm_paid" name="housing_support_type" value="dorm_paid" class="w-4 h-4 text-blue-600 border-gray-300 mt-1 focus:ring-blue-500" />
                      <label for="housing_dorm_paid" class="ml-3 cursor-pointer flex-1">
                        <div class="font-medium text-gray-900">기숙사 제공 (유료)</div>
                        <div class="text-sm text-gray-500">일부 비용 본인 부담</div>
                      </label>
                    </div>
                    <div class="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <input type="radio" id="housing_allowance" name="housing_support_type" value="allowance" class="w-4 h-4 text-blue-600 border-gray-300 mt-1 focus:ring-blue-500" />
                      <label for="housing_allowance" class="ml-3 cursor-pointer flex-1">
                        <div class="font-medium text-gray-900">주거 지원금</div>
                        <div class="text-sm text-gray-500">월 정액 주거비 지원</div>
                      </label>
                    </div>
                    <div class="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <input type="radio" id="housing_none" name="housing_support_type" value="none" class="w-4 h-4 text-blue-600 border-gray-300 mt-1 focus:ring-blue-500" />
                      <label for="housing_none" class="ml-3 cursor-pointer flex-1">
                        <div class="font-medium text-gray-900">지원 없음</div>
                        <div class="text-sm text-gray-500">주거 관련 지원 제공하지 않음</div>
                      </label>
                    </div>
                  </div>
                  <div class="mt-3" id="housing_amount_field" style="display: none;">
                    <label for="housing_support_amount" class="block text-xs text-gray-600 mb-1">월 지원 금액</label>
                    <div class="relative w-48">
                      <input 
                        type="number" 
                        id="housing_support_amount" 
                        name="housing_support_amount"
                        min="0"
                        class="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                      />
                      <span class="absolute right-3 top-2.5 text-gray-500 text-sm">만원/월</span>
                    </div>
                  </div>
                </div>

                {/* 정착 지원 */}
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-3">
                    <i class="fas fa-user-friends text-orange-600 mr-2"></i>
                    한국 정착 지원 (복수 선택 가능)
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input type="checkbox" id="settlement_korean" name="settlement_support[]" value="korean" class="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="settlement_korean" class="ml-3 text-sm text-gray-700">한국어 교육 지원</label>
                    </div>
                    <div class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input type="checkbox" id="settlement_mentoring" name="settlement_support[]" value="mentoring" class="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="settlement_mentoring" class="ml-3 text-sm text-gray-700">1:1 멘토링 프로그램</label>
                    </div>
                    <div class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input type="checkbox" id="settlement_culture" name="settlement_support[]" value="culture" class="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="settlement_culture" class="ml-3 text-sm text-gray-700">문화 적응 프로그램</label>
                    </div>
                    <div class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input type="checkbox" id="settlement_pickup" name="settlement_support[]" value="pickup" class="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="settlement_pickup" class="ml-3 text-sm text-gray-700">공항 픽업 서비스</label>
                    </div>
                  </div>
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
          await loadE7VisaCodes(); // E-7 코드 먼저 로드
          await loadCompanyProfile();
          setupTabs();
          setupForm();
          setupE7CodeChangeListener();
          setupHousingTypeListener();
          setupResponsibilitiesCounter();
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
        
        // E-7 비자 코드 로드
        async function loadE7VisaCodes() {
          try {
            const response = await fetch('/data/e7-visa-codes.json');
            const data = await response.json();
            const select = document.getElementById('e7_visa_code');
            
            if (!select) return;
            
            data.categories.forEach(category => {
              const optgroup = document.createElement('optgroup');
              optgroup.label = category.name + \` (최소 \${(category.minSalary / 10000).toFixed(0)}만원)\`;
              
              category.subcategories.forEach(sub => {
                sub.jobs.forEach(job => {
                  const option = document.createElement('option');
                  option.value = job.code;
                  option.textContent = \`[\${job.code}] \${job.name}\`;
                  option.dataset.minSalary = category.minSalary;
                  option.dataset.categoryName = category.name;
                  optgroup.appendChild(option);
                });
              });
              
              select.appendChild(optgroup);
            });
          } catch (error) {
            console.error('E-7 코드 로드 실패:', error);
          }
        }
        
        // E-7 코드 변경 리스너
        function setupE7CodeChangeListener() {
          const select = document.getElementById('e7_visa_code');
          const requirementDiv = document.getElementById('e7_salary_requirement');
          const requirementText = document.getElementById('e7_salary_text');
          const salaryMinInput = document.getElementById('salary_min');
          
          if (!select) return;
          
          select.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const minSalary = selectedOption.dataset.minSalary;
            
            if (minSalary && requirementDiv && requirementText) {
              const salaryInManWon = (minSalary / 10000).toFixed(0);
              const salaryInEok = (minSalary / 100000000).toFixed(2);
              
              requirementText.textContent = \`이 직종의 E-7 비자 최소 연봉 요건: \${salaryInManWon}만원 이상 (\${salaryInEok}억원)\`;
              requirementDiv.classList.remove('hidden');
              
              // 최소 급여 필드에 자동 설정
              if (salaryMinInput) {
                salaryMinInput.min = salaryInManWon;
                if (!salaryMinInput.value || parseInt(salaryMinInput.value) < parseInt(salaryInManWon)) {
                  salaryMinInput.value = salaryInManWon;
                }
              }
            } else if (requirementDiv) {
              requirementDiv.classList.add('hidden');
            }
          });
        }
        
        // 주거 지원 타입 리스너
        function setupHousingTypeListener() {
          const radios = document.querySelectorAll('input[name="housing_support_type"]');
          const amountField = document.getElementById('housing_amount_field');
          
          radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
              if (e.target.value === 'dorm_paid' || e.target.value === 'allowance') {
                amountField.style.display = 'block';
              } else {
                amountField.style.display = 'none';
                document.getElementById('housing_support_amount').value = '';
              }
            });
          });
        }
        
        // 담당 업무 글자수 카운터
        function setupResponsibilitiesCounter() {
          const textarea = document.getElementById('job_responsibilities');
          const counter = document.getElementById('responsibilities_count');
          
          if (!textarea || !counter) return;
          
          textarea.addEventListener('input', (e) => {
            counter.textContent = e.target.value.length;
            
            // 100자 미만이면 경고 색상
            if (e.target.value.length < 100) {
              counter.classList.add('text-red-600');
              counter.classList.remove('text-green-600');
            } else {
              counter.classList.add('text-green-600');
              counter.classList.remove('text-red-600');
            }
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
            'required_qualifications', 'support_items'
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
        
        // 주소 파싱 함수 (우편번호 + 기본주소 + 상세주소 분리)
        function parseAddress(fullAddress) {
          if (!fullAddress) {
            return { postcode: '', baseAddress: '', detailAddress: '' };
          }
          
          // 형식: (우편번호) 기본주소 상세주소
          const postcodeMatch = fullAddress.match(/^\((\d{5})\)\s*/);
          
          if (postcodeMatch) {
            const postcode = postcodeMatch[1];
            const remainingAddress = fullAddress.substring(postcodeMatch[0].length);
            
            // 상세주소는 마지막 공백 이후로 가정 (간단한 휴리스틱)
            // 더 정교한 파싱이 필요하면 추가 로직 필요
            const lastSpaceIndex = remainingAddress.lastIndexOf(' ');
            if (lastSpaceIndex > 20) { // 기본주소가 충분히 긴 경우에만 분리
              const baseAddress = remainingAddress.substring(0, lastSpaceIndex);
              const detailAddress = remainingAddress.substring(lastSpaceIndex + 1);
              return { postcode, baseAddress, detailAddress };
            } else {
              return { postcode, baseAddress: remainingAddress, detailAddress: '' };
            }
          } else {
            // 우편번호가 없는 경우 전체를 기본주소로 처리
            return { postcode: '', baseAddress: fullAddress, detailAddress: '' };
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
          
          // 주소 파싱 (우편번호) 기본주소 상세주소)
          if (profile.address) {
            const addressParts = parseAddress(profile.address);
            document.getElementById('postcode').value = addressParts.postcode || '';
            document.getElementById('address').value = addressParts.baseAddress || '';
            document.getElementById('address-detail').value = addressParts.detailAddress || '';
          } else {
            document.getElementById('postcode').value = '';
            document.getElementById('address').value = '';
            document.getElementById('address-detail').value = '';
          }
          
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
        }
        
        // 폼 설정
        function setupForm() {
          const form = document.getElementById('company-profile-form');
          const cancelBtn = document.getElementById('cancel-btn');
          const searchAddressBtn = document.getElementById('search-address-btn');
          
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
          
          // 주소 검색 버튼 이벤트
          searchAddressBtn.addEventListener('click', () => {
            openDaumPostcode();
          });
        }
        
        // Daum 우편번호 검색 API
        function openDaumPostcode() {
          new daum.Postcode({
            oncomplete: function(data) {
              // 선택한 주소 정보를 가져옴
              let addr = ''; // 주소 변수
              let extraAddr = ''; // 참고항목 변수

              // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
              if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                addr = data.roadAddress;
              } else { // 사용자가 지번 주소를 선택했을 경우(J)
                addr = data.jibunAddress;
              }

              // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
              if(data.userSelectedType === 'R'){
                // 법정동명이 있을 경우 추가한다. (법정리는 제외)
                if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                  extraAddr += data.bname;
                }
                // 건물명이 있고, 공동주택일 경우 추가한다.
                if(data.buildingName !== '' && data.apartment === 'Y'){
                  extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
                if(extraAddr !== ''){
                  extraAddr = ' (' + extraAddr + ')';
                }
              }

              // 우편번호와 주소 정보를 해당 필드에 넣는다.
              document.getElementById('postcode').value = data.zonecode;
              document.getElementById('address').value = addr + extraAddr;
              
              // 커서를 상세주소 필드로 이동한다.
              document.getElementById('address-detail').focus();
            }
          }).open();
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
            
            // 정착 지원 (배열)
            const settlementSupport = [];
            document.querySelectorAll('input[name="settlement_support[]"]:checked').forEach(cb => {
              settlementSupport.push(cb.value);
            });
            
            // 전체 주소 조합 (우편번호 + 기본주소 + 상세주소)
            const postcode = formData.get('postcode');
            const baseAddress = formData.get('address');
            const detailAddress = formData.get('address_detail');
            const fullAddress = postcode ? 
              \`(\${postcode}) \${baseAddress}\${detailAddress ? ' ' + detailAddress : ''}\` :
              baseAddress;
            
            // E-7 직종명 가져오기
            const e7Select = document.getElementById('e7_visa_code');
            const e7SelectedOption = e7Select.options[e7Select.selectedIndex];
            const e7JobName = e7SelectedOption ? e7SelectedOption.textContent.replace(/\[.*?\]\s*/, '') : '';
            
            const data = {
              // 기본 정보
              company_name: formData.get('company_name'),
              representative_name: formData.get('representative_name'),
              business_number: formData.get('business_number'),
              phone: formData.get('phone'),
              address: fullAddress,
              industry: formData.get('industry'),
              company_size: formData.get('company_size'),
              website: formData.get('website'),
              founded_year: formData.get('founded_year'),
              description: formData.get('description'),
              
              // Phase 3A - 핵심 필드
              e7_visa_code: formData.get('e7_visa_code'),
              e7_visa_job_name: e7JobName,
              job_title_ko: formData.get('job_title_ko'),
              job_title_en: formData.get('job_title_en'),
              job_responsibilities: formData.get('job_responsibilities'),
              recruitment_count: parseInt(formData.get('recruitment_count')) || 0,
              salary_min: parseInt(formData.get('salary_min')) || 0,
              salary_max: parseInt(formData.get('salary_max')) || 0,
              contract_type: formData.get('contract_type'),
              visa_support_level: formData.get('visa_support_level'),
              visa_support_details: formData.get('visa_support_details'),
              housing_support_type: formData.get('housing_support_type'),
              housing_support_amount: parseInt(formData.get('housing_support_amount')) || 0,
              settlement_support: JSON.stringify(settlementSupport),
              
              // 기존 필드 (호환성 유지)
              minimum_salary: parseInt(formData.get('salary_min')) || 0,
              recruitment_positions: JSON.stringify(positions),
              employment_types: JSON.stringify(employmentTypes),
              required_qualifications: JSON.stringify(qualifications)
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
      
      {/* Daum 우편번호 API */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    </div>
  )
}
