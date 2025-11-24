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
              <img src="data:image/png;base64,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" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
              <span class="text-xl font-bold text-blue-600">WOW-CAMPUS</span>
            </a>
          </div>

          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>


          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>

          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
            {/* 동적 인증 버튼이 여기에 로드됩니다 */}
          </div>
        </nav>
        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200">
              {/* 동적 네비게이션 메뉴가 여기에 로드됩니다 */}
            </div>
            <div id="mobile-auth-buttons" class="pt-3">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
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
      <script dangerouslySetInnerHTML={{
        __html: `
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
              
              // 대시보드로 이동 (강제 새로고침으로 최신 데이터 표시)
              setTimeout(() => {
                window.location.replace('/dashboard/company');
                // 브라우저 히스토리에 추가하지 않고 이동하여 뒤로가기 방지
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
