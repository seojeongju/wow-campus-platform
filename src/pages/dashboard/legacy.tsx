/**
 * Page Component
 * Route: /dashboard/legacy
 * Original: src/index.tsx lines 13775-14359
 */

import type { Context } from 'hono'

export const handler = (c: Context) => {
return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/static/logo.png" alt="WOW-CAMPUS" class="h-10 w-auto" />
            </a>
          </div>
          
          <div class="hidden lg:flex items-center space-x-8">
            <a href="/home" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">홈</a>
            <a href="/jobs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구인정보</a>
            <a href="/jobseekers" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">구직정보</a>
            <a href="/study" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">유학정보</a>
            <a href="/dashboard" class="text-blue-600 font-medium">내 대시보드</a>
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            <button onclick="showLoginModal()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              로그인
            </button>
            <button onclick="showSignupModal()" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              회원가입
            </button>
            <button class="lg:hidden p-2 text-gray-600 hover:text-blue-600" id="mobile-menu-btn">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">내 대시보드</h1>
          <p class="text-gray-600">프로필을 관리하고 구직 활동을 진행하세요</p>
        </div>

        {/* Dashboard Grid */}
        <div class="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile Summary */}
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div class="text-center mb-6">
                <div class="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i class="fas fa-user text-2xl text-gray-400" id="profile-avatar"></i>
                </div>
                <h3 class="font-semibold text-lg" id="profile-name">사용자명</h3>
                <p class="text-gray-600 text-sm" id="profile-email">이메일</p>
                <span class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-2" id="profile-status">
                  프로필 완성도: 0%
                </span>
              </div>
              
              <div class="space-y-3">
                <button onclick="showTab('profile')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab active">
                  <i class="fas fa-user mr-3 text-blue-600"></i>
                  <span>기본 정보</span>
                </button>
                <button onclick="showTab('education')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-graduation-cap mr-3 text-green-600"></i>
                  <span>학력 & 경력</span>
                </button>
                <button onclick="showTab('visa')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-passport mr-3 text-purple-600"></i>
                  <span>비자 & 언어</span>
                </button>
                <button onclick="showTab('documents')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-file-upload mr-3 text-orange-600"></i>
                  <span>이력서 & 서류</span>
                </button>
                <button onclick="showTab('applications')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center dashboard-tab">
                  <i class="fas fa-briefcase mr-3 text-red-600"></i>
                  <span>지원 현황</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h4 class="font-semibold mb-4">빠른 액션</h4>
              <div class="space-y-3">
                <button onclick="window.location.href='/jobs'" class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-search mr-2"></i>
                  구인공고 찾기
                </button>
                <button onclick="downloadResume()" class="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">
                  <i class="fas fa-download mr-2"></i>
                  이력서 다운로드
                </button>
                <button onclick="updateProfileCompletion()" class="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors">
                  <i class="fas fa-check-circle mr-2"></i>
                  프로필 완성하기
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div class="lg:col-span-2">
            {/* Profile Tab */}
            <div id="profile-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold">기본 정보</h3>
                <button onclick="toggleProfileEdit()" id="edit-profile-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-edit mr-2"></i>편집
                </button>
              </div>

              <form id="profile-form" class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                    <input type="text" name="first_name" id="first_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled  />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">성</label>
                    <input type="text" name="last_name" id="last_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">국적 *</label>
                    <select name="nationality" id="nationality" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                      <option value="">선택하세요</option>
                      <option value="USA">미국</option>
                      <option value="China">중국</option>
                      <option value="Japan">일본</option>
                      <option value="Vietnam">베트남</option>
                      <option value="Philippines">필리핀</option>
                      <option value="Thailand">태국</option>
                      <option value="India">인도</option>
                      <option value="Other">기타</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                    <input type="date" name="birth_date" id="birth_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">성별</label>
                    <select name="gender" id="gender" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                      <option value="">선택하세요</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                    <input type="tel" name="phone" id="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">현재 거주지 *</label>
                  <select name="current_location" id="current_location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                    <option value="">지역을 선택하세요</option>
                    <option value="서울">서울</option>
                    <option value="경기도">경기도</option>
                    <option value="강원도">강원도</option>
                    <option value="충청도">충청도</option>
                    <option value="경상도">경상도</option>
                    <option value="전라도">전라도</option>
                    <option value="제주도">제주도</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">희망 근무지</label>
                  <select name="preferred_location" id="preferred_location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                    <option value="">희망 지역을 선택하세요</option>
                    <option value="서울">서울</option>
                    <option value="경기도">경기도</option>
                    <option value="강원도">강원도</option>
                    <option value="충청도">충청도</option>
                    <option value="경상도">경상도</option>
                    <option value="전라도">전라도</option>
                    <option value="제주도">제주도</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">희망 연봉 (원)</label>
                  <input type="number" name="salary_expectation" id="salary_expectation" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 35000000" disabled />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                  <textarea name="bio" id="bio" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="자신을 소개해주세요..." disabled></textarea>
                </div>

                <div class="flex space-x-4" id="profile-form-actions" style="display: none;">
                  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                  <button type="button" onclick="cancelProfileEdit()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    취소
                  </button>
                </div>
              </form>
            </div>

            {/* Education Tab */}
            <div id="education-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">학력 & 경력</h3>
              
              <div class="mb-8">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-semibold">학력 정보</h4>
                  <button onclick="addEducation()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <i class="fas fa-plus mr-2"></i>추가
                  </button>
                </div>
                
                <div class="space-y-4" id="education-list">
                  <div class="border rounded-lg p-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">학교명</label>
                        <input type="text" name="school_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 서울대학교" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">전공</label>
                        <input type="text" name="major" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 컴퓨터공학" />
                      </div>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">학위</label>
                        <select name="degree" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">선택하세요</option>
                          <option value="Bachelor">학사</option>
                          <option value="Master">석사</option>
                          <option value="PhD">박사</option>
                          <option value="Associate">전문학사</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">입학년도</label>
                        <input type="number" name="start_year" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="2020" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">졸업년도</label>
                        <input type="number" name="end_year" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="2024" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-semibold">경력 사항</h4>
                  <button onclick="addExperience()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <i class="fas fa-plus mr-2"></i>추가
                  </button>
                </div>
                
                <div class="space-y-4" id="experience-list">
                  <div class="border rounded-lg p-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                        <input type="text" name="company_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 삼성전자" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">직책</label>
                        <input type="text" name="position" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 소프트웨어 엔지니어" />
                      </div>
                    </div>
                    <div class="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                        <input type="date" name="start_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                        <input type="date" name="end_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <label class="flex items-center mt-2">
                          <input type="checkbox" name="current_job" class="mr-2" />
                          <span class="text-sm text-gray-600">현재 재직중</span>
                        </label>
                      </div>
                    </div>
                    <div class="mt-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">담당업무</label>
                      <textarea name="job_description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="주요 담당업무를 설명해주세요..."></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <button onclick="saveEducationAndExperience()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-save mr-2"></i>저장
                </button>
              </div>
            </div>

            {/* Visa & Language Tab */}
            <div id="visa-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">비자 & 언어 정보</h3>
              
              <form id="visa-form" class="space-y-6">
                <div class="border rounded-lg p-6 bg-blue-50">
                  <h4 class="font-semibold text-blue-800 mb-4">
                    <i class="fas fa-passport mr-2"></i>비자 정보
                  </h4>
                  
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">현재 비자 유형 *</label>
                      <select name="visa_status" id="visa_status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">선택하세요</option>
                        <option value="E-7">E-7 (특정활동)</option>
                        <option value="E-9">E-9 (비전문취업)</option>
                        <option value="D-2">D-2 (유학)</option>
                        <option value="D-4">D-4 (일반연수)</option>
                        <option value="D-10">D-10 (구직)</option>
                        <option value="F-2">F-2 (거주)</option>
                        <option value="F-4">F-4 (재외동포)</option>
                        <option value="F-5">F-5 (영주)</option>
                        <option value="F-6">F-6 (결혼이민)</option>
                        <option value="H-2">H-2 (방문취업)</option>
                        <option value="Other">기타</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">비자 만료일</label>
                      <input type="date" name="visa_expiry" id="visa_expiry" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  
                  <div class="mt-4">
                    <label class="flex items-center">
                      <input type="checkbox" name="visa_sponsorship_needed" id="visa_sponsorship_needed" class="mr-2" />
                      <span class="text-sm text-gray-700">비자 스폰서십이 필요합니다</span>
                    </label>
                  </div>
                </div>

                <div class="border rounded-lg p-6 bg-green-50">
                  <h4 class="font-semibold text-green-800 mb-4">
                    <i class="fas fa-language mr-2"></i>언어 능력
                  </h4>
                  
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">한국어 수준 *</label>
                      <select name="korean_level" id="korean_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">선택하세요</option>
                        <option value="beginner">초급 (기초 회화 가능)</option>
                        <option value="elementary">초중급 (간단한 업무 의사소통 가능)</option>
                        <option value="intermediate">중급 (일반적인 업무 의사소통 가능)</option>
                        <option value="advanced">고급 (유창한 의사소통 가능)</option>
                        <option value="native">원어민 수준</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">영어 수준</label>
                      <select name="english_level" id="english_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">선택하세요</option>
                        <option value="beginner">초급</option>
                        <option value="elementary">초중급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                        <option value="native">원어민</option>
                      </select>
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">기타 언어</label>
                    <input type="text" name="other_languages" id="other_languages" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 중국어(고급), 일본어(중급)" />
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">어학 자격증</label>
                    <textarea name="language_certificates" id="language_certificates" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: TOPIK 5급, TOEIC 900점, JLPT N2 등"></textarea>
                  </div>
                </div>

                <div class="border rounded-lg p-6 bg-purple-50">
                  <h4 class="font-semibold text-purple-800 mb-4">
                    <i class="fas fa-tools mr-2"></i>기술 스킬
                  </h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">보유 기술 및 스킬 *</label>
                    <textarea name="skills" id="skills" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: Java, Python, React, MySQL, Photoshop, 등 보유하신 기술과 스킬을 입력해주세요" required></textarea>
                    <p class="text-sm text-gray-600 mt-1">쉼표(,)로 구분하여 입력해주세요</p>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">자격증</label>
                    <textarea name="certifications" id="certifications" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 정보처리기사, AWS Certified, 등 보유하신 자격증을 입력해주세요"></textarea>
                  </div>
                </div>

                <div class="mt-8">
                  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                </div>
              </form>
            </div>

            {/* Documents Tab */}
            <div id="documents-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">이력서 & 서류 관리</h3>
              
              <div class="space-y-8">
                {/* Resume Upload */}
                <div class="border rounded-lg p-6 bg-orange-50">
                  <h4 class="font-semibold text-orange-800 mb-4">
                    <i class="fas fa-file-alt mr-2"></i>이력서
                  </h4>
                  
                  <div class="mb-4" id="current-resume">
                    <p class="text-sm text-gray-600 mb-2">현재 등록된 이력서:</p>
                    <div class="bg-white border border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <i class="fas fa-file-pdf text-3xl text-gray-400 mb-2"></i>
                      <p class="text-gray-500">등록된 이력서가 없습니다</p>
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">새 이력서 업로드</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input type="file" id="resume-upload" accept=".pdf,.doc,.docx" class="hidden" onchange="uploadResume()" />
                      <label for="resume-upload" class="cursor-pointer">
                        <i class="fas fa-cloud-upload-alt text-4xl text-blue-500 mb-4"></i>
                        <p class="text-lg font-medium text-gray-700">파일을 선택하거나 드래그하여 업로드</p>
                        <p class="text-sm text-gray-500 mt-2">PDF, DOC, DOCX 파일만 지원 (최대 5MB)</p>
                      </label>
                    </div>
                  </div>
                  
                  <div class="flex space-x-4">
                    <button onclick="uploadResume()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <i class="fas fa-upload mr-2"></i>이력서 업로드
                    </button>
                    <button onclick="downloadResume()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      <i class="fas fa-download mr-2"></i>다운로드
                    </button>
                  </div>
                </div>

                {/* Portfolio */}
                <div class="border rounded-lg p-6 bg-blue-50">
                  <h4 class="font-semibold text-blue-800 mb-4">
                    <i class="fas fa-briefcase mr-2"></i>포트폴리오 & 작업물
                  </h4>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">포트폴리오 URL</label>
                    <input type="url" name="portfolio_url" id="portfolio_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://myportfolio.com" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                    <input type="url" name="github_url" id="github_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://github.com/username" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input type="url" name="linkedin_url" id="linkedin_url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: https://linkedin.com/in/username" />
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">포트폴리오 파일 업로드</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input type="file" id="portfolio-upload" accept=".pdf,.jpg,.png,.gif,.zip" multiple class="hidden" onchange="uploadPortfolio()" />
                      <label for="portfolio-upload" class="cursor-pointer text-sm text-gray-600">
                        <i class="fas fa-cloud-upload-alt mr-2"></i>포트폴리오 파일 업로드 (여러 파일 가능)
                        <p class="text-xs text-gray-500 mt-1">PDF, JPG, PNG, GIF, ZIP 파일 지원 (각 파일 최대 10MB)</p>
                      </label>
                    </div>
                  </div>
                  
                  <button onclick="savePortfolioLinks()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-save mr-2"></i>저장
                  </button>
                </div>

                {/* Additional Documents */}
                <div class="border rounded-lg p-6 bg-gray-50">
                  <h4 class="font-semibold text-gray-800 mb-4">
                    <i class="fas fa-folder mr-2"></i>추가 서류
                  </h4>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">커버레터</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="cover-letter-upload" accept=".pdf,.doc,.docx" class="hidden" onchange="uploadDocument('cover_letter', 'cover-letter-upload')" />
                        <label for="cover-letter-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>커버레터 업로드
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">학위증명서</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="diploma-upload" accept=".pdf,.jpg,.png" class="hidden" onchange="uploadDocument('diploma', 'diploma-upload')" />
                        <label for="diploma-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>학위증명서 업로드
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">자격증</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input type="file" id="certificates-upload" accept=".pdf,.jpg,.png" multiple class="hidden" onchange="uploadDocument('certificate', 'certificates-upload')" />
                        <label for="certificates-upload" class="cursor-pointer text-sm text-gray-600">
                          <i class="fas fa-plus mr-2"></i>자격증 업로드 (여러 파일 가능)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications Tab */}
            <div id="applications-tab" class="dashboard-content bg-white rounded-lg shadow-sm p-6" style="display: none;">
              <h3 class="text-xl font-semibold mb-6">지원 현황</h3>
              
              <div class="mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-blue-600" id="total-applications">0</div>
                    <div class="text-sm text-blue-600">총 지원</div>
                  </div>
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-yellow-600" id="pending-applications">0</div>
                    <div class="text-sm text-yellow-600">검토중</div>
                  </div>
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-600" id="accepted-applications">0</div>
                    <div class="text-sm text-green-600">합격</div>
                  </div>
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-red-600" id="rejected-applications">0</div>
                    <div class="text-sm text-red-600">불합격</div>
                  </div>
                </div>
              </div>
              
              <div class="space-y-4" id="applications-list">
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-inbox text-4xl mb-4"></i>
                  <p>아직 지원한 공고가 없습니다.</p>
                  <button onclick="window.location.href='/jobs'" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    구인공고 찾아보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )

// 📧 이메일 찾기 API
// 🔐 로그인 API
}

// Middleware: none
