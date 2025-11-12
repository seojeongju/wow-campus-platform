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
                  
                  {/* 기타 선택 시 직접 입력 */}
                  <div id="job_category_other_input" class="hidden mt-2">
                    <input 
                      type="text" 
                      id="job_category_other_text" 
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="직무 분야를 입력하세요 (예: 법률/법무, 연구개발 등)"
                    />
                  </div>
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
                    <option value="파트타임">파트타임</option>
                    <option value="인턴">인턴</option>
                    <option value="프리랜서">프리랜서</option>
                  </select>
                </div>
              </div>

              {/* 근무 지역 */}
              <div>
                <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                  근무 지역 <span class="text-red-500">*</span>
                </label>
                <select 
                  id="location" 
                  name="location" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  <option value="서울특별시">서울특별시</option>
                  <option value="부산광역시">부산광역시</option>
                  <option value="대구광역시">대구광역시</option>
                  <option value="인천광역시">인천광역시</option>
                  <option value="광주광역시">광주광역시</option>
                  <option value="대전광역시">대전광역시</option>
                  <option value="울산광역시">울산광역시</option>
                  <option value="세종특별자치시">세종특별자치시</option>
                  <option value="경기도">경기도</option>
                  <option value="강원도">강원도</option>
                  <option value="충청북도">충청북도</option>
                  <option value="충청남도">충청남도</option>
                  <option value="전라북도">전라북도</option>
                  <option value="전라남도">전라남도</option>
                  <option value="경상북도">경상북도</option>
                  <option value="경상남도">경상남도</option>
                  <option value="제주특별자치도">제주특별자치도</option>
                </select>
                
                {/* 상세 주소 입력 (선택) */}
                <input 
                  type="text" 
                  id="location_detail" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                  placeholder="상세 주소 (선택사항, 예: 강남구 테헤란로)"
                />
              </div>

              {/* 비자 종류 선택 */}
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  지원 가능한 비자 종류
                  <span class="text-xs text-gray-500 ml-2">(복수 선택 가능)</span>
                </label>
                <div class="border border-gray-300 rounded-lg p-4" style="max-height: 200px; overflow-y: auto;">
                  {/* 거주 비자 */}
                  <div class="mb-3">
                    <div class="text-sm font-semibold text-gray-600 mb-2">거주 비자</div>
                    <div class="space-y-2">
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="F-2" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">F-2 (거주)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="F-4" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">F-4 (재외동포)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="F-5" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">F-5 (영주)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="F-6" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">F-6 (결혼이민)</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* 취업 비자 */}
                  <div class="mb-3">
                    <div class="text-sm font-semibold text-gray-600 mb-2">취업 비자</div>
                    <div class="space-y-2">
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-1" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-1 (교수)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-2" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-2 (회화지도)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-3" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-3 (연구)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-4" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-4 (기술지도)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-5" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-5 (전문직업)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-6" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-6 (예술흥행)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-7" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-7 (특정활동)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-9" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-9 (비전문취업)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="E-10" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">E-10 (선원취업)</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* 기타 비자 */}
                  <div>
                    <div class="text-sm font-semibold text-gray-600 mb-2">기타 비자</div>
                    <div class="space-y-2">
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="D-2" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">D-2 (유학)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="D-4" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">D-4 (일반연수)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="D-8" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">D-8 (기업투자)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="D-9" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">D-9 (무역경영)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="D-10" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">D-10 (구직)</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" name="visa_type" value="H-2" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="ml-2 text-sm text-gray-700">H-2 (방문취업)</span>
                      </label>
                    </div>
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  외국인 지원자가 소지해야 하는 비자 종류를 선택하세요. 선택하지 않으면 모든 비자 허용으로 간주됩니다.
                </p>
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
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  지원 마감일
                </label>
                
                {/* 마감일 유형 선택 */}
                <div class="flex gap-4 mb-3">
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      name="deadline_type" 
                      value="date"
                      id="deadline_type_date"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked
                    />
                    <span class="ml-2 text-sm text-gray-700">날짜 지정</span>
                  </label>
                  
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      name="deadline_type" 
                      value="text"
                      id="deadline_type_text"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">직접 입력</span>
                  </label>
                  
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      name="deadline_type" 
                      value="always"
                      id="deadline_type_always"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">상시모집</span>
                  </label>
                </div>
                
                {/* 날짜 선택 입력 */}
                <div id="deadline_date_input" class="deadline-input">
                  <input 
                    type="date" 
                    id="application_deadline_date" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* 직접 입력 */}
                <div id="deadline_text_input" class="deadline-input hidden">
                  <input 
                    type="text" 
                    id="application_deadline_text" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 2024년 12월 31일까지, 채용 시 마감, 00명 채용 시"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    자유롭게 마감 조건을 입력하세요
                  </p>
                </div>
                
                {/* 상시모집 안내 */}
                <div id="deadline_always_input" class="deadline-input hidden">
                  <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-sm text-blue-800">
                      <i class="fas fa-info-circle mr-2"></i>
                      "상시모집"으로 표시됩니다
                    </p>
                  </div>
                </div>
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
        
        // 직무 분야 "기타" 선택 시 입력 필드 표시
        function setupJobCategoryOther() {
          const jobCategorySelect = document.getElementById('job_category');
          const otherInput = document.getElementById('job_category_other_input');
          
          jobCategorySelect.addEventListener('change', function() {
            if (this.value === '기타') {
              otherInput.classList.remove('hidden');
            } else {
              otherInput.classList.add('hidden');
            }
          });
        }
        
        // 마감일 유형 전환 처리
        function setupDeadlineTypeSwitch() {
          const deadlineTypes = document.querySelectorAll('input[name="deadline_type"]');
          const dateInput = document.getElementById('deadline_date_input');
          const textInput = document.getElementById('deadline_text_input');
          const alwaysInput = document.getElementById('deadline_always_input');
          
          deadlineTypes.forEach(radio => {
            radio.addEventListener('change', function() {
              // 모든 입력 숨기기
              dateInput.classList.add('hidden');
              textInput.classList.add('hidden');
              alwaysInput.classList.add('hidden');
              
              // 선택된 유형의 입력만 표시
              if (this.value === 'date') {
                dateInput.classList.remove('hidden');
              } else if (this.value === 'text') {
                textInput.classList.remove('hidden');
              } else if (this.value === 'always') {
                alwaysInput.classList.remove('hidden');
              }
            });
          });
        }
        
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
            // 직무 분야 처리 (기타 선택 시 직접 입력 값 사용)
            let jobCategory = document.getElementById('job_category').value;
            if (jobCategory === '기타') {
              const otherText = document.getElementById('job_category_other_text').value.trim();
              if (otherText) {
                jobCategory = otherText;
              }
            }
            
            // 근무 지역 처리 (시/도 + 상세주소)
            const locationRegion = document.getElementById('location').value;
            const locationDetail = document.getElementById('location_detail').value.trim();
            const fullLocation = locationDetail ? \`\${locationRegion} \${locationDetail}\` : locationRegion;
            
            // 비자 종류 처리 (체크박스에서 수집)
            const visaCheckboxes = document.querySelectorAll('input[name="visa_type"]:checked');
            const selectedVisas = Array.from(visaCheckboxes).map(cb => cb.value);
            
            // 마감일 처리
            let applicationDeadline = null;
            const deadlineType = document.querySelector('input[name="deadline_type"]:checked').value;
            
            if (deadlineType === 'date') {
              const dateValue = document.getElementById('application_deadline_date').value;
              applicationDeadline = dateValue && dateValue.trim() !== '' ? dateValue : null;
            } else if (deadlineType === 'text') {
              const textValue = document.getElementById('application_deadline_text').value;
              applicationDeadline = textValue && textValue.trim() !== '' ? textValue.trim() : null;
            } else if (deadlineType === 'always') {
              applicationDeadline = '상시모집';
            }
            
            const formData = {
              title: document.getElementById('title').value.trim(),
              description: document.getElementById('description').value.trim(),
              job_type: document.getElementById('job_type').value,
              job_category: jobCategory,
              location: fullLocation,
              experience_level: document.getElementById('experience_level').value || null,
              education_required: document.getElementById('education_required').value || null,
              responsibilities: document.getElementById('responsibilities').value.trim() || null,
              requirements: document.getElementById('requirements').value.trim() || null,
              benefits: document.getElementById('benefits').value.trim() || null,
              salary_min: document.getElementById('salary_min').value ? parseInt(document.getElementById('salary_min').value) : null,
              salary_max: document.getElementById('salary_max').value ? parseInt(document.getElementById('salary_max').value) : null,
              visa_sponsorship: document.getElementById('visa_sponsorship').checked,
              visa_types: selectedVisas.length > 0 ? selectedVisas : null,
              korean_required: document.getElementById('korean_required').checked,
              positions_available: parseInt(document.getElementById('positions_available').value) || 1,
              application_deadline: applicationDeadline,
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
            
            // 직무 분야 "기타" 선택 시 직접 입력 검증
            if (document.getElementById('job_category').value === '기타' && !document.getElementById('job_category_other_text').value.trim()) {
              if (window.toast) {
                toast.error('❌ 기타 직무 분야를 입력해주세요.');
              } else {
                alert('기타 직무 분야를 입력해주세요.');
              }
              document.getElementById('job_category_other_text').focus();
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
          
          // 직무 분야 "기타" 선택 이벤트 리스너 설정
          setupJobCategoryOther();
          
          // 마감일 유형 전환 이벤트 리스너 설정
          setupDeadlineTypeSwitch();
          
          console.log('구인공고 등록 페이지 로드 완료');
        });
        
        // ==================== 끝: 구인공고 등록 JavaScript ====================
      `}}>
      </script>
    </div>
  )
}];
