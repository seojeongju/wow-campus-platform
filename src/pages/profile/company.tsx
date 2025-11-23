/**
 * Company Profile Page - Redesigned
 * Route: /profile/company
 * 채용?�향??기반 8�??�규 ?�드 ?�함
 */

import type { Context } from 'hono'
import { NavigationHeader } from '../../components/navigation'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <NavigationHeader />

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div class="mb-8">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">기업 ?�로??관�?/h1>
              <p class="text-gray-600">채용 ?�보�??�함???�세 기업 ?�로?�을 관리하?�요</p>
            </div>
            <div class="flex items-center space-x-3">
              <div id="profile-completeness" class="hidden px-4 py-2 bg-blue-50 rounded-lg">
                <span class="text-sm font-medium text-blue-700">?�로???�성?? <span id="completeness-percent">0</span>%</span>
              </div>
              <a href="/dashboard/company" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                ?�?�보?�로
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button id="tab-view" class="tab-button border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
              <i class="fas fa-eye mr-2"></i>?�로??보기
            </button>
            <button id="tab-edit" class="tab-button border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              <i class="fas fa-edit mr-2"></i>?�로???�정
            </button>
          </nav>
        </div>

        {/* View Section */}
        <div id="view-section" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p class="text-gray-500">기업 ?�보�?불러?�는 �?..</p>
            </div>
          </div>
        </div>

        {/* Edit Section */}
        <div id="edit-section" class="hidden space-y-6">
          <form id="company-profile-form">
            {/* 1. 기본 ?�보 */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-building text-purple-600 mr-3 text-2xl"></i>
                <span>기본 ?�보</span>
              </h2>
              
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="company_name" class="block text-sm font-medium text-gray-700 mb-2">
                      ?�체�?<span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="company_name" 
                      name="company_name" 
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="?? (�??��?캠퍼??
                    />
                  </div>

                  <div>
                    <label for="representative_name" class="block text-sm font-medium text-gray-700 mb-2">
                      ?�?�자 <span class="text-red-500">*</span> <span class="text-xs text-blue-600">(?�규)</span>
                    </label>
                    <input 
                      type="text" 
                      id="representative_name" 
                      name="representative_name" 
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="?? ?�길??
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="business_number" class="block text-sm font-medium text-gray-700 mb-2">
                      ?�업?�등록번??<span class="text-red-500">*</span>
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
                      ?�화번호 <span class="text-red-500">*</span>
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
                    ?�업?�재지 <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-2">
                    <div class="flex gap-2">
                      <input 
                        type="text" 
                        id="postcode" 
                        name="postcode"
                        readonly
                        class="w-32 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="?�편번호"
                      />
                      <button 
                        type="button"
                        onclick="execDaumPostcode()"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ?�편번호 찾기
                      </button>
                    </div>
                    <input 
                      type="text" 
                      id="address" 
                      name="address"
                      readonly
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="주소 (?�편번호 찾기 버튼???�릭?�세??"
                    />
                    <input 
                      type="text" 
                      id="detailAddress" 
                      name="detailAddress"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="?�세주소 (건물�? ???�수 ??"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="industry" class="block text-sm font-medium text-gray-700 mb-2">
                      ?�종
                    </label>
                    <input 
                      type="text" 
                      id="industry" 
                      name="industry"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="?? IT/?�프?�웨??
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
                      <option value="">?�택?�세??/option>
                      <option value="startup">?��??�업 (1-10�?</option>
                      <option value="small">?�기??(11-50�?</option>
                      <option value="medium">중기??(51-200�?</option>
                      <option value="large">?�기업 (201�??�상)</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="website" class="block text-sm font-medium text-gray-700 mb-2">
                      ?�사?�트
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
                      ?�립 ?�도
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
                    기업 ?�개
                  </label>
                  <textarea 
                    id="description" 
                    name="description"
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="기업??비전, ?�업 ?�용, ?�징 ?�을 ?�개?�주?�요"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 2. 채용 ?�보 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-user-tie text-blue-600 mr-3 text-2xl"></i>
                <span>채용 ?�보</span>
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
                      <input type="checkbox" id="pos_tech_it" name="recruitment_positions[]" value="기술 �?IT 분야 (Technology & IT)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_tech_it" class="ml-2 text-sm text-gray-700">기술 �?IT 분야 (Technology & IT)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_marketing_sales" name="recruitment_positions[]" value="마�???�??�업 분야 (Marketing & Sales)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_marketing_sales" class="ml-2 text-sm text-gray-700">마�???�??�업 분야 (Marketing & Sales)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_rnd" name="recruitment_positions[]" value="?�구 �?개발 분야 (R&D)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_rnd" class="ml-2 text-sm text-gray-700">?�구 �?개발 분야 (R&D)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_other_prof" name="recruitment_positions[]" value="기�? ?�문 분야 (Other Professional Fields)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_other_prof" class="ml-2 text-sm text-gray-700">기�? ?�문 분야 (Other Professional Fields)</label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <input type="checkbox" id="pos_other" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_other" class="text-sm text-gray-700">기�?-직접기입:</label>
                      <input type="text" id="pos_other_text" class="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" placeholder="직접 ?�력" />
                    </div>
                  </div>
                </div>

                {/* 비자 종류 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    비자 종류 <span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_e7" name="visa_types[]" value="E-7 (?�정?�동)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_e7" class="ml-2 text-sm text-gray-700">E-7 (?�정?�동)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_e9" name="visa_types[]" value="E-9 (비전문취??" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_e9" class="ml-2 text-sm text-gray-700">E-9 (비전문취??</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_h2" name="visa_types[]" value="H-2 (방문취업)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_h2" class="ml-2 text-sm text-gray-700">H-2 (방문취업)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_f2" name="visa_types[]" value="F-2 (거주)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_f2" class="ml-2 text-sm text-gray-700">F-2 (거주)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_f4" name="visa_types[]" value="F-4 (?�외?�포)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_f4" class="ml-2 text-sm text-gray-700">F-4 (?�외?�포)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_f5" name="visa_types[]" value="F-5 (?�주)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_f5" class="ml-2 text-sm text-gray-700">F-5 (?�주)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_f6" name="visa_types[]" value="F-6 (결혼?��?)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_f6" class="ml-2 text-sm text-gray-700">F-6 (결혼?��?)</label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <input type="checkbox" id="visa_other" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_other" class="text-sm text-gray-700">기�?:</label>
                      <input type="text" id="visa_other_text" class="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" placeholder="직접 ?�력" />
                    </div>
                  </div>
                </div>

                {/* 채용 ?�원 */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="recruitment_count" class="block text-sm font-medium text-gray-700 mb-2">
                      채용 ?�원 <span class="text-red-500">*</span>
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
                      <span class="absolute right-4 top-2 text-gray-500">�?/span>
                    </div>
                  </div>

                  <div>
                    <label for="minimum_salary" class="block text-sm font-medium text-gray-700 mb-2">
                      최소 ?�봉 <span class="text-red-500">*</span>
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
                      <span class="absolute right-4 top-2 text-gray-500">만원 ?�상</span>
                    </div>
                  </div>
                </div>

                {/* 근무 ?�태 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    근무 ?�태 <span class="text-red-500">*</span>
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_fulltime" name="employment_types[]" value="?�규�? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_fulltime" class="ml-2 text-sm text-gray-700">?�규�?/label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_contract" name="employment_types[]" value="계약�? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_contract" class="ml-2 text-sm text-gray-700">계약�?/label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_intern" name="employment_types[]" value="?�턴?? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_intern" class="ml-2 text-sm text-gray-700">?�턴??/label>
                    </div>
                  </div>
                </div>

                {/* ?�수 ?�격 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    ?�수 ?�격
                  </label>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_acu" name="qualifications[]" value="ACU Fusion ?�격�? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_acu" class="ml-2 text-sm text-gray-700">ACU Fusion ?�격�?/label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_degree" name="qualifications[]" value="?�사?�위 ?�상" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_degree" class="ml-2 text-sm text-gray-700">?�사?�위 ?�상</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_korean" name="qualifications[]" value="?�국???�사?�통 가?? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_korean" class="ml-2 text-sm text-gray-700">?�국???�사?�통 가??/label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 지???�항 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-green-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-hands-helping text-green-600 mr-3 text-2xl"></i>
                <span>지???�항</span>
                <span class="ml-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">NEW</span>
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_visa" name="support_items[]" value="visa" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_visa" class="ml-3">
                    <div class="font-medium text-gray-900">E-7-4 비자 ?�청 ?�조</div>
                    <div class="text-sm text-gray-500">비자 ?�청 �?취득 지??/div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_education" name="support_items[]" value="korean_education" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_education" class="ml-3">
                    <div class="font-medium text-gray-900">?�내 ?�국??교육 지??/div>
                    <div class="text-sm text-gray-500">?�국??교육 ?�로그램 ?�공</div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_mentoring" name="support_items[]" value="mentoring" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_mentoring" class="ml-3">
                    <div class="font-medium text-gray-900">멘토�??�로그램 ?�영</div>
                    <div class="text-sm text-gray-500">1:1 멘토�?지??/div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_accommodation" name="support_items[]" value="accommodation" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_accommodation" class="ml-3">
                    <div class="font-medium text-gray-900">?�소 지???�는 주거�?보조</div>
                    <div class="text-sm text-gray-500">주거 관??지??/div>
                  </label>
                </div>
              </div>
            </div>

            {/* 4. 채용 ?�정 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-orange-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-calendar-check text-orange-600 mr-3 text-2xl"></i>
                <span>채용 ?�정</span>
                <span class="ml-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">NEW</span>
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label for="schedule_document" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-file-alt text-orange-500 mr-2"></i>?�류?�형
                  </label>
                  <input 
                    type="text" 
                    id="schedule_document" 
                    name="schedule_document" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="?? 교육 ?�료 ??1�??�내"
                  />
                </div>

                <div>
                  <label for="schedule_interview" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-comments text-orange-500 mr-2"></i>면접?�형
                  </label>
                  <input 
                    type="text" 
                    id="schedule_interview" 
                    name="schedule_interview" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="?? ?�류?�격???�??
                  />
                </div>

                <div>
                  <label for="schedule_final" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-check-circle text-orange-500 mr-2"></i>최종?�격 ?�보
                  </label>
                  <input 
                    type="text" 
                    id="schedule_final" 
                    name="schedule_final" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="?? 면접 ??1�??�내 ?�보"
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
                <i class="fas fa-save mr-2"></i>?�?�하�?              </button>
            </div>
          </form>
        </div>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 기업 ?�로??JavaScript ====================
        
        let companyProfile = null;
        
        // ?�이지 로드
        document.addEventListener('DOMContentLoaded', async () => {
          await loadCompanyProfile();
          setupTabs();
          setupForm();
          setupOtherPositionCheckbox();
          setupOtherVisaCheckbox();
        });
        
        // ???�정
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
        
        // '기�?' 직종 체크박스 ?�정
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
        
        // '기�?' 비자 체크박스 ?�정
        function setupOtherVisaCheckbox() {
          const otherCheckbox = document.getElementById('visa_other');
          const otherText = document.getElementById('visa_other_text');
          
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
        
        // 기업 ?�로??로드
        async function loadCompanyProfile() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/profile/company', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('기업 ?�로??', result);
            
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
                      <h3 class="font-bold text-gray-900 mb-1">?�로???�보가 ?�습?�다</h3>
                      <p class="text-gray-600">?�로???�정 ??��??기업 ?�보�??�력?�주?�요.</p>
                    </div>
                  </div>
                </div>
              \`;
            }
          } catch (error) {
            console.error('?�로??로드 ?�패:', error);
            document.getElementById('view-section').innerHTML = \`
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-center">
                  <i class="fas fa-times-circle text-red-500 text-2xl mr-4"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">?�류 발생</h3>
                    <p class="text-gray-600">?�로???�보�?불러?�는 �??�류가 발생?�습?�다.</p>
                  </div>
                </div>
              </div>
            \`;
          }
        }
        
        // ?�로???�성??계산
        function calculateCompleteness(profile) {
          const requiredFields = [
            'company_name', 'representative_name', 'business_number', 
            'phone', 'address', 'recruitment_count', 'minimum_salary'
          ];
          const optionalFields = [
            'industry', 'company_size', 'website', 'founded_year', 
            'description', 'recruitment_positions', 'employment_types',
            'required_qualifications', 'support_items', 'visa_types'
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
            
            // ?�상 변�?            if (percentage < 50) {
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
        
        // ?�로???�시 (계속)
        function displayCompanyProfile(profile) {
          const viewSection = document.getElementById('view-section');
          
          // 기본 ?�보
          let basicInfoHtml = \`
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span class="text-gray-600">?�체�?</span> <span class="font-medium">\${profile.company_name || '-'}</span></div>
              <div><span class="text-gray-600">?�?�자:</span> <span class="font-medium">\${profile.representative_name || '-'}</span> <span class="text-xs text-blue-600">NEW</span></div>
              <div><span class="text-gray-600">?�업?�등록번??</span> <span class="font-medium">\${profile.business_number || '-'}</span></div>
              <div><span class="text-gray-600">?�화번호:</span> <span class="font-medium">\${profile.phone || '-'}</span></div>
              <div class="md:col-span-2"><span class="text-gray-600">주소:</span> <span class="font-medium">\${profile.address || '-'}</span></div>
              <div><span class="text-gray-600">?�종:</span> <span class="font-medium">\${profile.industry || '-'}</span></div>
              <div><span class="text-gray-600">기업 규모:</span> <span class="font-medium">\${formatCompanySize(profile.company_size)}</span></div>
              <div><span class="text-gray-600">?�사?�트:</span> <span class="font-medium">\${profile.website ? \`<a href="\${profile.website}" target="_blank" class="text-blue-600 hover:underline">\${profile.website}</a>\` : '-'}</span></div>
              <div><span class="text-gray-600">?�립 ?�도:</span> <span class="font-medium">\${profile.founded_year || '-'}</span></div>
            </div>
            \${profile.description ? \`
              <div class="mt-4 pt-4 border-t">
                <div class="text-gray-600 mb-2">기업 ?�개:</div>
                <div class="text-gray-800">\${profile.description}</div>
              </div>
            \` : ''}
          \`;
          
          // 채용 ?�보 (NEW)
          let recruitmentInfoHtml = '';
          if (profile.recruitment_count || profile.recruitment_positions) {
            const positions = parseJSON(profile.recruitment_positions) || [];
            const employmentTypes = parseJSON(profile.employment_types) || [];
            const qualifications = parseJSON(profile.required_qualifications) || {};
            const visaTypes = parseJSON(profile.visa_types) || [];
            
            recruitmentInfoHtml = \`
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-user-tie text-blue-600 mr-3"></i>
                  채용 ?�보
                  <span class="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">NEW</span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-gray-600">채용 ?�원:</span> 
                    <span class="font-medium text-blue-600">\${profile.recruitment_count || 0}�?/span>
                  </div>
                  <div>
                    <span class="text-gray-600">최소 ?�봉:</span> 
                    <span class="font-medium text-green-600">\${profile.minimum_salary || 0}만원 ?�상</span>
                  </div>
                  \${positions.length > 0 ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">채용 직종:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${positions.map(p => \`<span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">\${p}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}
                  \${visaTypes.length > 0 ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">비자 종류:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${visaTypes.map(v => \`<span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">\${v}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}
                  \${employmentTypes.length > 0 ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">근무 ?�태:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${employmentTypes.map(t => \`<span class="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">\${t}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}
                  \${qualifications.certification || qualifications.degree || qualifications.korean ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">?�수 ?�격:</span>
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
          
          // 지???�항 (NEW)
          let supportInfoHtml = '';
          if (profile.support_items) {
            const supportItems = parseJSON(profile.support_items) || {};
            const hasSupport = Object.values(supportItems).some(v => v);
            
            if (hasSupport) {
              supportInfoHtml = \`
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-hands-helping text-green-600 mr-3"></i>
                    지???�항
                    <span class="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">NEW</span>
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    \${supportItems.visa ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>E-7-4 비자 ?�청 ?�조</span>
                      </div>
                    \` : ''}
                    \${supportItems.korean_education ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>?�내 ?�국??교육 지??/span>
                      </div>
                    \` : ''}
                    \${supportItems.mentoring ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>멘토�??�로그램 ?�영</span>
                      </div>
                    \` : ''}
                    \${supportItems.accommodation ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>?�소 지???�는 주거�?보조</span>
                      </div>
                    \` : ''}
                  </div>
                </div>
              \`;
            }
          }
          
          // 채용?�정 ?�드 ??��??(2025-11-19)
          let scheduleInfoHtml = '';
          
          viewSection.innerHTML = \`
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-building text-purple-600 mr-3"></i>
                기본 ?�보
              </h3>
              \${basicInfoHtml}
            </div>
            \${recruitmentInfoHtml}
            \${supportInfoHtml}
            \${scheduleInfoHtml}
          \`;
        }
        
        // JSON ?�싱 ?�퍼
        function parseJSON(str) {
          try {
            return typeof str === 'string' ? JSON.parse(str) : str;
          } catch (e) {
            return null;
          }
        }
        
        // 기업 규모 ?�맷
        function formatCompanySize(size) {
          const sizes = {
            'startup': '?��??�업 (1-10�?',
            'small': '?�기??(11-50�?',
            'medium': '중기??(51-200�?',
            'large': '?�기업 (201�??�상)'
          };
          return sizes[size] || '-';
        }
        
        // ??채우�?        function fillEditForm(profile) {
          // 기본 ?�보
          document.getElementById('company_name').value = profile.company_name || '';
          document.getElementById('representative_name').value = profile.representative_name || '';
          document.getElementById('business_number').value = profile.business_number || '';
          document.getElementById('phone').value = profile.phone || '';
          // 주소 ?�싱 (?�식: [?�편번호] 주소 ?�세주소)
          const fullAddress = profile.address || '';
          const postcodeMatch = fullAddress.match(/\[(\d{5})\]/);
          const postcode = postcodeMatch ? postcodeMatch[1] : '';
          let addressWithoutPostcode = fullAddress.replace(/\[\d{5}\]\s*/, '');
          
          // 마�?�?공백??기�??�로 ?�세주소 분리 (간단??방법)
          const lastSpaceIndex = addressWithoutPostcode.lastIndexOf(' ');
          let mainAddress = addressWithoutPostcode;
          let detailAddress = '';
          
          if (lastSpaceIndex > 0 && addressWithoutPostcode.length - lastSpaceIndex < 50) {
            mainAddress = addressWithoutPostcode.substring(0, lastSpaceIndex);
            detailAddress = addressWithoutPostcode.substring(lastSpaceIndex + 1);
          }
          
          document.getElementById('postcode').value = postcode;
          document.getElementById('address').value = mainAddress;
          document.getElementById('detailAddress').value = detailAddress;
          document.getElementById('industry').value = profile.industry || '';
          document.getElementById('company_size').value = profile.company_size || '';
          document.getElementById('website').value = profile.website || '';
          document.getElementById('founded_year').value = profile.founded_year || '';
          document.getElementById('description').value = profile.description || '';
          
          // 채용 ?�보
          document.getElementById('recruitment_count').value = profile.recruitment_count || '';
          document.getElementById('minimum_salary').value = profile.minimum_salary || '';
          
          // 채용 직종
          const positions = parseJSON(profile.recruitment_positions) || [];
          positions.forEach(pos => {
            const checkbox = document.querySelector(\`input[name="recruitment_positions[]"][value="\${pos}"]\`);
            if (checkbox) checkbox.checked = true;
          });
          
          // 근무 ?�태
          const employmentTypes = parseJSON(profile.employment_types) || [];
          employmentTypes.forEach(type => {
            const checkbox = document.querySelector(\`input[name="employment_types[]"][value="\${type}"]\`);
            if (checkbox) checkbox.checked = true;
          });
          
          // ?�수 ?�격
          const qualifications = parseJSON(profile.required_qualifications) || {};
          if (qualifications) {
            Object.values(qualifications).forEach(qual => {
              const checkbox = document.querySelector(\`input[name="qualifications[]"][value="\${qual}"]\`);
              if (checkbox) checkbox.checked = true;
            });
          }
          
          // 지???�항
          const supportItems = parseJSON(profile.support_items) || {};
          Object.keys(supportItems).forEach(key => {
            if (supportItems[key]) {
              const checkbox = document.querySelector(\`input[name="support_items[]"][value="\${key}"]\`);
              if (checkbox) checkbox.checked = true;
            }
          });
          
          // 비자 종류
          const visaTypes = parseJSON(profile.visa_types) || [];
          visaTypes.forEach(visa => {
            const checkbox = document.querySelector(\`input[name="visa_types[]"][value="\${visa}"]\`);
            if (checkbox) checkbox.checked = true;
          });
          
          // 채용 일정
          const schedule = parseJSON(profile.recruitment_schedule) || {};
          if (document.getElementById('schedule_document')) {
            document.getElementById('schedule_document').value = schedule.document || '';
          }
          if (document.getElementById('schedule_interview')) {
            document.getElementById('schedule_interview').value = schedule.interview || '';
          }
          if (document.getElementById('schedule_final')) {
            document.getElementById('schedule_final').value = schedule.final || '';
          }
        }
        
        // ???�정
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
            // 보기 ??���??�환
            document.getElementById('tab-view').click();
          });
        }
        
        // ?�로???�??        async function saveProfile() {
          try {
            const formData = new FormData(document.getElementById('company-profile-form'));
            
            // 채용 직종 (배열)
            const positions = [];
            document.querySelectorAll('input[name="recruitment_positions[]"]:checked').forEach(cb => {
              positions.push(cb.value);
            });
            // '기�?' 직종 추�?
            const otherPosition = document.getElementById('pos_other_text').value;
            if (otherPosition && document.getElementById('pos_other').checked) {
              positions.push(otherPosition);
            }
            
            // 근무 ?�태 (배열)
            const employmentTypes = [];
            document.querySelectorAll('input[name="employment_types[]"]:checked').forEach(cb => {
              employmentTypes.push(cb.value);
            });
            
            // ?�수 ?�격 (객체)
            const qualifications = {};
            document.querySelectorAll('input[name="qualifications[]"]:checked').forEach(cb => {
              if (cb.value.includes('ACU')) qualifications.certification = cb.value;
              if (cb.value.includes('?�사')) qualifications.degree = cb.value;
              if (cb.value.includes('?�국??)) qualifications.korean = cb.value;
            });
            
            // 지???�항 (객체)
            const supportItems = {};
            document.querySelectorAll('input[name="support_items[]"]:checked').forEach(cb => {
              supportItems[cb.value] = true;
            });
            
            // 비자 종류 (배열)
            const visaTypes = [];
            document.querySelectorAll('input[name="visa_types[]"]:checked').forEach(cb => {
              visaTypes.push(cb.value);
            });
            // '기�?' 비자 추�?
            const otherVisa = document.getElementById('visa_other_text').value;
            if (otherVisa && document.getElementById('visa_other').checked) {
              visaTypes.push(otherVisa);
            }
            
            const postcode = formData.get('postcode') || '';
            const address = formData.get('address') || '';
            const detailAddress = formData.get('detailAddress') || '';
            const fullAddress = '[' + postcode + '] ' + address + ' ' + detailAddress;
            
            // 채용 일정 (객체)
            const recruitmentSchedule = {
              document: formData.get('schedule_document') || '',
              interview: formData.get('schedule_interview') || '',
              final: formData.get('schedule_final') || ''
            };
            
            const data = {
              company_name: formData.get('company_name'),
              representative_name: formData.get('representative_name'),
              business_number: formData.get('business_number'),
              phone: formData.get('phone'),
              address: fullAddress.trim(),
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
              visa_types: JSON.stringify(visaTypes),
              recruitment_schedule: JSON.stringify(recruitmentSchedule)
            };
            
            console.log('?�?�할 ?�이??', data);
            
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
                window.toast.success('?�로?�이 ?�?�되?�습?�다');
              } else {
                alert('?�로?�이 ?�?�되?�습?�다');
              }
              await loadCompanyProfile();
              document.getElementById('tab-view').click();
            } else {
              throw new Error(result.message || '?�???�패');
            }
          } catch (error) {
            console.error('?�???�류:', error);
            if (window.toast) {
              window.toast.error('?�??�??�류가 발생?�습?�다: ' + error.message);
            } else {
              alert('?�??�??�류가 발생?�습?�다: ' + error.message);
            }
          }
        }
        
        // Daum ?�편번호 API ?�행
        function execDaumPostcode() {
          new daum.Postcode({
            oncomplete: function(data) {
              // ?�편번호?� 주소 ?�보�??�력
              document.getElementById('postcode').value = data.zonecode;
              
              let addr = ''; // 주소 변??              
              // ?�용?��? ?�택??주소 ?�?�에 ?�라 ?�당 주소 값을 가?�온??              if (data.userSelectedType === 'R') { // ?�로�?주소
                addr = data.roadAddress;
              } else { // 지�?주소
                addr = data.jibunAddress;
              }
              
              // 주소 ?�보�??�당 ?�드???�는??              document.getElementById('address').value = addr;
              
              // 커서�??�세주소 ?�드�??�동
              document.getElementById('detailAddress').focus();
            }
          }).open();
        }
      `}} />
      
      {/* Daum ?�편번호 ?�비???�크립트 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    </div>
  )
}
