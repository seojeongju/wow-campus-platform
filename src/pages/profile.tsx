/**
 * Page Component
 * Route: /profile
 * Original: src/index.tsx lines 16139-17208
 */

import type { Context } from 'hono'
import { authMiddleware } from '../middleware/auth'

export const handler = async (c: Context) => {
const user = c.get('user');
  
  // 로그인한 모든 사용자 허용 (구직자, 기업, 에이전트, 관리자)
  if (!user) {
    throw new HTTPException(401, { message: '로그인이 필요합니다.' });
  }

  // 구직자 프로필 데이터 조회
  let profileData: any = null;
  
  try {
    const jobseeker = await c.env.DB.prepare(`
      SELECT * FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();
    
    if (jobseeker) {
      profileData = jobseeker;
    }
  } catch (error) {
    console.error('프로필 조회 오류:', error);
  }

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/jpeg;base64,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" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴 */}
          </div>
          
          <div id="auth-buttons-container" class="flex items-center space-x-3">
            {/* 동적 인증 버튼 */}
          </div>
        </nav>
      </header>

      {/* 프로필 편집 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">프로필 관리</h1>
              <p class="text-gray-600">나의 정보를 업데이트하고 채용 기회를 높이세요</p>
            </div>
            <a href="/dashboard/jobseeker" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>
              대시보드로 돌아가기
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 편집 폼 */}
          <div class="lg:col-span-2">
            <form id="profile-edit-form" class="space-y-6">
              {/* 기본 정보 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-user text-blue-600 mr-3"></i>
                  기본 정보
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      이름(First Name) <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="first_name" 
                      id="profile-first-name"
                      value={profileData?.first_name || ''}
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="길동"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      성(Last Name)
                    </label>
                    <input 
                      type="text" 
                      name="last_name" 
                      id="profile-last-name"
                      value={profileData?.last_name || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="홍"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      이메일 <span class="text-gray-400">(변경 불가)</span>
                    </label>
                    <input 
                      type="email" 
                      value={user.email}
                      disabled
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      국적
                    </label>
                    <input 
                      type="text" 
                      name="nationality" 
                      id="profile-nationality"
                      value={profileData?.nationality || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="대한민국"
                    />
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <textarea 
                      name="bio" 
                      id="profile-bio"
                      rows="4"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="간단한 자기소개를 작성해주세요..."
                    >{profileData?.bio || ''}</textarea>
                  </div>
                </div>
              </div>

              {/* 경력 정보 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-briefcase text-green-600 mr-3"></i>
                  경력 정보
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      직무 분야
                    </label>
                    <select 
                      name="skills" 
                      id="profile-skills"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="IT/소프트웨어" selected={profileData?.field === 'IT/소프트웨어'}>IT/소프트웨어</option>
                      <option value="디자인" selected={profileData?.field === '디자인'}>디자인</option>
                      <option value="마케팅/영업" selected={profileData?.field === '마케팅/영업'}>마케팅/영업</option>
                      <option value="제조/생산" selected={profileData?.field === '제조/생산'}>제조/생산</option>
                      <option value="서비스" selected={profileData?.field === '서비스'}>서비스</option>
                      <option value="교육" selected={profileData?.field === '교육'}>교육</option>
                      <option value="헬스케어" selected={profileData?.field === '헬스케어'}>헬스케어</option>
                      <option value="금융" selected={profileData?.field === '금융'}>금융</option>
                      <option value="기타" selected={profileData?.field === '기타'}>기타</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      경력 연수
                    </label>
                    <select 
                      name="experience_years" 
                      id="profile-experience"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="0" selected={profileData?.experience_years === 0}>신입</option>
                      <option value="1" selected={profileData?.experience_years === 1}>1년</option>
                      <option value="2" selected={profileData?.experience_years === 2}>2년</option>
                      <option value="3" selected={profileData?.experience_years === 3}>3년</option>
                      <option value="4" selected={profileData?.experience_years === 4}>4년</option>
                      <option value="5" selected={profileData?.experience_years === 5}>5년</option>
                      <option value="6" selected={profileData?.experience_years >= 6}>6년 이상</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      학력
                    </label>
                    <select 
                      name="education_level" 
                      id="profile-education-level"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="고등학교 졸업" selected={profileData?.education === '고등학교 졸업'}>고등학교 졸업</option>
                      <option value="전문대 재학" selected={profileData?.education === '전문대 재학'}>전문대 재학</option>
                      <option value="전문대 졸업" selected={profileData?.education === '전문대 졸업'}>전문대 졸업</option>
                      <option value="대학교 재학" selected={profileData?.education === '대학교 재학'}>대학교 재학</option>
                      <option value="대학교 졸업" selected={profileData?.education === '대학교 졸업'}>대학교 졸업</option>
                      <option value="석사" selected={profileData?.education === '석사'}>석사</option>
                      <option value="박사" selected={profileData?.education === '박사'}>박사</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      비자 종류
                    </label>
                    <select 
                      name="visa_status" 
                      id="profile-visa-status"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="F-2" selected={profileData?.visa_type === 'F-2'}>F-2 (거주)</option>
                      <option value="F-4" selected={profileData?.visa_type === 'F-4'}>F-4 (재외동포)</option>
                      <option value="F-5" selected={profileData?.visa_type === 'F-5'}>F-5 (영주)</option>
                      <option value="E-7" selected={profileData?.visa_type === 'E-7'}>E-7 (특정활동)</option>
                      <option value="E-9" selected={profileData?.visa_type === 'E-9'}>E-9 (비전문취업)</option>
                      <option value="D-2" selected={profileData?.visa_type === 'D-2'}>D-2 (유학)</option>
                      <option value="D-8" selected={profileData?.visa_type === 'D-8'}>D-8 (기업투자)</option>
                      <option value="D-10" selected={profileData?.visa_type === 'D-10'}>D-10 (구직)</option>
                      <option value="기타" selected={profileData?.visa_type === '기타'}>기타</option>
                    </select>
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      자기소개 / 경력 요약
                    </label>
                    <textarea 
                      name="bio_extended" 
                      id="profile-bio-extended"
                      rows="3"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="주요 경력, 프로젝트 경험, 보유 기술 등을 자유롭게 작성하세요..."
                    >{profileData?.bio || ''}</textarea>
                  </div>
                </div>
              </div>

              {/* 희망 근무 조건 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-map-marker-alt text-purple-600 mr-3"></i>
                  희망 근무 조건
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      희망 지역
                    </label>
                    <select 
                      name="preferred_location" 
                      id="profile-location"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="서울" selected={profileData?.preferred_location === '서울'}>서울</option>
                      <option value="경기도" selected={profileData?.preferred_location === '경기도'}>경기도</option>
                      <option value="인천" selected={profileData?.preferred_location === '인천'}>인천</option>
                      <option value="강원도" selected={profileData?.preferred_location === '강원도'}>강원도</option>
                      <option value="충청도" selected={profileData?.preferred_location === '충청도'}>충청도</option>
                      <option value="경상도" selected={profileData?.preferred_location === '경상도'}>경상도</option>
                      <option value="전라도" selected={profileData?.preferred_location === '전라도'}>전라도</option>
                      <option value="제주도" selected={profileData?.preferred_location === '제주도'}>제주도</option>
                      <option value="전국" selected={profileData?.preferred_location === '전국'}>전국</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      희망 연봉 (만원)
                    </label>
                    <input 
                      type="number" 
                      name="salary_expectation" 
                      id="profile-salary-expectation"
                      value={profileData?.salary_expectation || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: 3500"
                      min="0"
                      step="100"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      한국어 능력 (TOPIK)
                    </label>
                    <select 
                      name="korean_level" 
                      id="profile-korean"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="TOPIK 1급" selected={profileData?.korean_level === 'TOPIK 1급'}>TOPIK 1급 (기초)</option>
                      <option value="TOPIK 2급" selected={profileData?.korean_level === 'TOPIK 2급'}>TOPIK 2급 (초급)</option>
                      <option value="TOPIK 3급" selected={profileData?.korean_level === 'TOPIK 3급'}>TOPIK 3급 (중급)</option>
                      <option value="TOPIK 4급" selected={profileData?.korean_level === 'TOPIK 4급'}>TOPIK 4급 (중상급)</option>
                      <option value="TOPIK 5급" selected={profileData?.korean_level === 'TOPIK 5급'}>TOPIK 5급 (고급)</option>
                      <option value="TOPIK 6급" selected={profileData?.korean_level === 'TOPIK 6급'}>TOPIK 6급 (최상급)</option>
                      <option value="원어민" selected={profileData?.korean_level === '원어민'}>원어민</option>
                      <option value="미응시" selected={profileData?.korean_level === '미응시'}>미응시</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      입사 가능일
                    </label>
                    <input 
                      type="date" 
                      name="available_start_date" 
                      id="profile-start-date"
                      value={profileData?.available_start_date || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 이력서 및 경력 문서 업로드 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-file-upload text-purple-600 mr-3"></i>
                  이력서 및 경력 문서
                </h2>
                
                {/* 업로드 영역 */}
                <div class="mb-6">
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input 
                      type="file" 
                      id="document-file-input" 
                      class="hidden" 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <i class="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-4"></i>
                    <p class="text-lg font-medium text-gray-700 mb-2">파일을 드래그하거나 클릭하여 업로드</p>
                    <p class="text-sm text-gray-500 mb-4">지원 형식: PDF, Word, 이미지 (최대 10MB)</p>
                    <button 
                      type="button"
                      id="select-file-btn"
                      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      파일 선택
                    </button>
                  </div>
                  
                  {/* 선택된 파일 정보 */}
                  <div id="selected-file-info" class="mt-4 hidden">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                          <i class="fas fa-file text-blue-600 mr-3"></i>
                          <div>
                            <p id="file-name" class="font-medium text-gray-900"></p>
                            <p id="file-size" class="text-sm text-gray-500"></p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          id="clear-file-btn"
                          class="text-red-600 hover:text-red-700"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      
                      {/* 문서 타입 선택 */}
                      <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          문서 종류 <span class="text-red-500">*</span>
                        </label>
                        <select 
                          id="document-type" 
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="resume">이력서</option>
                          <option value="career">경력증명서</option>
                          <option value="certificate">자격증/증명서</option>
                          <option value="other">기타</option>
                        </select>
                      </div>
                      
                      {/* 문서 설명 */}
                      <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          문서 설명 (선택)
                        </label>
                        <input 
                          type="text" 
                          id="document-description"
                          placeholder="예: 2024년 업데이트된 이력서"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* 업로드 버튼 */}
                      <button 
                        type="button"
                        id="upload-document-btn"
                        class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <i class="fas fa-upload mr-2"></i>
                        문서 업로드
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 업로드된 문서 목록 */}
                <div>
                  <h3 class="text-lg font-bold text-gray-900 mb-4">업로드된 문서</h3>
                  <div id="documents-list" class="space-y-3">
                    {/* 동적으로 로드됨 */}
                    <div class="text-center py-8 text-gray-500">
                      <i class="fas fa-folder-open text-4xl mb-2"></i>
                      <p>업로드된 문서가 없습니다</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 저장 버튼 */}
              <div class="flex items-center justify-between">
                <button 
                  type="button" 
                  onclick="window.location.href='/dashboard/jobseeker'"
                  class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  id="save-profile-btn"
                  class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <i class="fas fa-save mr-2"></i>
                  프로필 저장
                </button>
              </div>
            </form>
          </div>

          {/* 프로필 완성도 & 팁 */}
          <div class="space-y-6">
            {/* 프로필 완성도 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-4">프로필 완성도</h2>
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl font-bold text-blue-600" id="profile-completion">0%</span>
                  <span class="text-sm text-gray-500">완성됨</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div id="profile-progress-bar" class="bg-blue-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
              </div>
              <p class="text-sm text-gray-600">
                프로필을 완성하면 채용 담당자에게 더 잘 보여집니다!
              </p>
            </div>

            {/* 프로필 작성 팁 */}
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <h2 class="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                프로필 작성 팁
              </h2>
              <ul class="space-y-3 text-sm text-blue-800">
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>구체적인 경력과 프로젝트를 작성하세요</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>보유 스킬을 상세히 나열하세요</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>자기소개는 간결하고 명확하게</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>정확한 비자 정보를 입력하세요</span>
                </li>
              </ul>
            </div>

            {/* 도움말 */}
            <div class="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 class="font-bold text-green-900 mb-2 flex items-center">
                <i class="fas fa-info-circle mr-2"></i>
                도움이 필요하신가요?
              </h3>
              <p class="text-sm text-green-800 mb-4">
                프로필 작성에 어려움이 있으시면 고객센터에 문의하세요.
              </p>
              <a href="/support" class="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-900">
                고객센터 바로가기
                <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* 프로필 데이터를 JavaScript 변수로 전달 */}
      <script dangerouslySetInnerHTML={{__html: `
        window.profileData = ${JSON.stringify(profileData || {})};
      `}} />
      
      {/* 프로필 저장 스크립트 */}
      <script dangerouslySetInnerHTML={{__html: `
        // Toast 알림 함수
        const toast = {
          success: (message, options = {}) => {
            showToast(message, 'success', options.duration || 3000);
          },
          error: (message, options = {}) => {
            showToast(message, 'error', options.duration || 5000);
          },
          info: (message, options = {}) => {
            showToast(message, 'info', options.duration || 3000);
          }
        };
        
        function showToast(message, type, duration) {
          const colors = {
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800'
          };
          
          const icons = {
            success: 'fa-check-circle text-green-600',
            error: 'fa-exclamation-circle text-red-600',
            info: 'fa-info-circle text-blue-600'
          };
          
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 z-50 max-w-md p-4 border rounded-lg shadow-lg ' + colors[type];
          toast.innerHTML = '<div class="flex items-start"><i class="fas ' + icons[type] + ' mr-3 mt-1"></i><div class="flex-1 whitespace-pre-line">' + message + '</div><button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-gray-500 hover:text-gray-700"><i class="fas fa-times"></i></button></div>';
          
          document.body.appendChild(toast);
          
          setTimeout(() => {
            if (toast.parentElement) {
              toast.remove();
            }
          }, duration);
        }
        
        // 프로필 데이터 로드
        function loadProfileData() {
          if (!window.profileData) return;
          
          const data = window.profileData;
          
          // 기본 정보
          const firstNameEl = document.getElementById('profile-first-name');
          const lastNameEl = document.getElementById('profile-last-name');
          const nationalityEl = document.getElementById('profile-nationality');
          const bioEl = document.getElementById('profile-bio');
          
          if (firstNameEl && data.first_name) firstNameEl.value = data.first_name;
          if (lastNameEl && data.last_name) lastNameEl.value = data.last_name;
          if (nationalityEl && data.nationality) nationalityEl.value = data.nationality;
          if (bioEl && data.bio) bioEl.value = data.bio;
          
          // 경력 정보
          const skillsEl = document.getElementById('profile-skills');
          const experienceEl = document.getElementById('profile-experience');
          const educationEl = document.getElementById('profile-education-level');
          const visaEl = document.getElementById('profile-visa-status');
          
          if (skillsEl && data.skills) skillsEl.value = data.skills;
          if (experienceEl && data.experience_years !== undefined) experienceEl.value = data.experience_years;
          if (educationEl && data.education_level) educationEl.value = data.education_level;
          if (visaEl && data.visa_status) visaEl.value = data.visa_status;
          
          // 희망 근무 조건
          const locationEl = document.getElementById('profile-location');
          const salaryEl = document.getElementById('profile-salary-expectation');
          const koreanEl = document.getElementById('profile-korean');
          const startDateEl = document.getElementById('profile-start-date');
          
          if (locationEl && data.preferred_location) locationEl.value = data.preferred_location;
          if (salaryEl && data.salary_expectation) salaryEl.value = data.salary_expectation;
          if (koreanEl && data.korean_level) koreanEl.value = data.korean_level;
          if (startDateEl && data.available_start_date) startDateEl.value = data.available_start_date;
        }
        
        // 프로필 완성도 계산
        function calculateProfileCompletion() {
          const fields = [
            document.getElementById('profile-first-name'),
            document.getElementById('profile-last-name'),
            document.getElementById('profile-nationality'),
            document.getElementById('profile-bio'),
            document.getElementById('profile-skills'),
            document.getElementById('profile-experience'),
            document.getElementById('profile-education-level'),
            document.getElementById('profile-visa-status'),
            document.getElementById('profile-location'),
            document.getElementById('profile-salary-expectation'),
            document.getElementById('profile-korean'),
            document.getElementById('profile-start-date')
          ];
          
          let filledCount = 0;
          fields.forEach(field => {
            if (field && field.value && field.value.trim() !== '') {
              filledCount++;
            }
          });
          
          const percentage = Math.round((filledCount / fields.length) * 100);
          document.getElementById('profile-completion').textContent = percentage + '%';
          document.getElementById('profile-progress-bar').style.width = percentage + '%';
          
          return percentage;
        }
        
        // 페이지 로드 시 데이터 로드 및 완성도 계산
        document.addEventListener('DOMContentLoaded', () => {
          // 현재 로그인 사용자 정보 확인
          const currentUser = window.currentUser;
          const token = localStorage.getItem('wowcampus_token');
          console.log('👤 현재 로그인 사용자:', currentUser);
          console.log('🔑 토큰 존재:', !!token);
          
          if (currentUser) {
            console.log('📋 사용자 상세 정보:', {
              email: currentUser.email,
              name: currentUser.name,
              user_type: currentUser.user_type,
              id: currentUser.id
            });
            
            if (currentUser.user_type !== 'jobseeker') {
              console.warn('⚠️ 경고: 현재 사용자는 구직자가 아닙니다!');
              console.warn('현재 user_type:', currentUser.user_type);
              console.warn('파일 업로드가 제한될 수 있습니다.');
            }
          } else {
            console.warn('⚠️ 로그인 정보를 찾을 수 없습니다.');
          }
          
          loadProfileData();
          calculateProfileCompletion();
          
          // 입력 필드 변경 시 완성도 재계산
          const form = document.getElementById('profile-edit-form');
          if (form) {
            form.addEventListener('input', calculateProfileCompletion);
          }
          
          // 🚀 문서 관리 이벤트 리스너 등록
          console.log('📄 문서 관리 이벤트 리스너 등록 시작...');
          
          // 파일 선택 버튼 이벤트
          const selectFileBtn = document.getElementById('select-file-btn');
          if (selectFileBtn) {
            selectFileBtn.addEventListener('click', () => {
              console.log('🖱️ 파일 선택 버튼 클릭');
              document.getElementById('document-file-input').click();
            });
            console.log('✅ 파일 선택 버튼 이벤트 등록 완료');
          } else {
            console.error('❌ select-file-btn 요소를 찾을 수 없습니다!');
          }
          
          // 파일 input change 이벤트
          const fileInput = document.getElementById('document-file-input');
          if (fileInput) {
            fileInput.addEventListener('change', (event) => {
              console.log('📁 파일 input change 이벤트 발생');
              handleFileSelect(event);
            });
            console.log('✅ 파일 input change 이벤트 등록 완료');
          } else {
            console.error('❌ document-file-input 요소를 찾을 수 없습니다!');
          }
          
          // 파일 선택 취소 버튼 이벤트
          const clearFileBtn = document.getElementById('clear-file-btn');
          if (clearFileBtn) {
            clearFileBtn.addEventListener('click', () => {
              console.log('🗑️ 파일 선택 취소 버튼 클릭');
              clearFileSelection();
            });
            console.log('✅ 파일 선택 취소 버튼 이벤트 등록 완료');
          } else {
            console.warn('⚠️ clear-file-btn 요소를 찾을 수 없습니다 (선택 사항)');
          }
          
          // 문서 업로드 버튼 이벤트
          const uploadBtn = document.getElementById('upload-document-btn');
          if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
              console.log('📤 문서 업로드 버튼 클릭');
              uploadDocument();
            });
            console.log('✅ 문서 업로드 버튼 이벤트 등록 완료');
          } else {
            console.error('❌ upload-document-btn 요소를 찾을 수 없습니다!');
          }
          
          // 문서 목록 로드
          loadDocuments();
          console.log('✅ 모든 문서 관리 이벤트 리스너 등록 완료!');
        });
        
        // 프로필 저장
        document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          
          const saveBtn = document.getElementById('save-profile-btn');
          const originalText = saveBtn.innerHTML;
          saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>저장 중...';
          saveBtn.disabled = true;
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/profile/jobseeker', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            console.log('서버 응답:', result);
            console.log('응답 상태 코드:', response.status);
            
            if (result.success) {
              toast.success('✅ 프로필이 성공적으로 저장되었습니다!');
              window.location.href = '/dashboard/jobseeker';
            } else {
              console.error('저장 실패:', result);
              const errorMsg = result.message || '프로필 저장에 실패했습니다.';
              const errorDetail = result.error || '';
              toast.error('❌ ' + errorMsg + (errorDetail ? '\\n\\n상세: ' + errorDetail : ''));
            }
          } catch (error) {
            console.error('프로필 저장 오류:', error);
            toast.error('❌ 프로필 저장 중 오류가 발생했습니다.\\n\\n오류: ' + error.message);
          } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
          }
        });
        
        // ==================== 문서 관리 JavaScript ====================
        
        // 전역 변수
        let selectedFile = null;
        
        // 문서 목록 로드
        async function loadDocuments() {
          try {
            const response = await fetch('/api/documents', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success && result.documents && result.documents.length > 0) {
              displayDocuments(result.documents);
              setupDocumentListeners();
            } else {
              displayEmptyDocuments();
            }
          } catch (error) {
            console.error('문서 목록 로드 오류:', error);
            displayEmptyDocuments();
          }
        }
        
        // 문서 목록 이벤트 리스너 설정 (이벤트 위임)
        function setupDocumentListeners() {
          // 다운로드 버튼 이벤트 위임
          document.querySelectorAll('.doc-download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const docId = e.currentTarget.getAttribute('data-doc-id');
              const docName = e.currentTarget.getAttribute('data-doc-name');
              downloadDocument(docId, docName);
            });
          });
          
          // 삭제 버튼 이벤트 위임
          document.querySelectorAll('.doc-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const docId = e.currentTarget.getAttribute('data-doc-id');
              deleteDocument(docId);
            });
          });
        }
        
        // 문서 목록 표시
        function displayDocuments(documents) {
          const container = document.getElementById('documents-list');
          
          const documentTypeLabels = {
            'resume': '이력서',
            'career': '경력증명서',
            'certificate': '자격증/증명서',
            'other': '기타'
          };
          
          const documentTypeIcons = {
            'resume': 'fa-file-alt',
            'career': 'fa-briefcase',
            'certificate': 'fa-certificate',
            'other': 'fa-file'
          };
          
          const documentTypeColors = {
            'resume': 'blue',
            'career': 'green',
            'certificate': 'purple',
            'other': 'gray'
          };
          
          container.innerHTML = documents.map(doc => {
            const fileSize = formatFileSize(doc.file_size);
            const uploadDate = new Date(doc.upload_date).toLocaleDateString('ko-KR');
            const typeLabel = documentTypeLabels[doc.document_type] || doc.document_type;
            const typeIcon = documentTypeIcons[doc.document_type] || 'fa-file';
            const typeColor = documentTypeColors[doc.document_type] || 'gray';
            
            return \`
              <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                  <div class="flex items-center flex-1">
                    <div class="w-12 h-12 bg-\${typeColor}-100 rounded-lg flex items-center justify-center mr-4">
                      <i class="fas \${typeIcon} text-\${typeColor}-600 text-xl"></i>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <h4 class="font-medium text-gray-900">\${doc.file_name}</h4>
                        <span class="px-2 py-1 bg-\${typeColor}-100 text-\${typeColor}-800 text-xs rounded-full">
                          \${typeLabel}
                        </span>
                      </div>
                      <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span><i class="fas fa-file-archive mr-1"></i>\${fileSize}</span>
                        <span><i class="fas fa-calendar mr-1"></i>\${uploadDate}</span>
                      </div>
                      \${doc.description ? \`<p class="text-sm text-gray-600 mt-1">\${doc.description}</p>\` : ''}
                    </div>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <button 
                      class="doc-download-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      data-doc-id="\${doc.id}"
                      data-doc-name="\${doc.original_name}"
                      title="다운로드"
                    >
                      <i class="fas fa-download"></i>
                    </button>
                    <button 
                      class="doc-delete-btn p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      data-doc-id="\${doc.id}"
                      title="삭제"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            \`;
          }).join('');
        }
        
        // 빈 문서 목록 표시
        function displayEmptyDocuments() {
          const container = document.getElementById('documents-list');
          container.innerHTML = \`
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-folder-open text-4xl mb-2"></i>
              <p>업로드된 문서가 없습니다</p>
            </div>
          \`;
        }
        
        // 파일 크기 포맷
        function formatFileSize(bytes) {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }
        
        // 파일 선택 핸들러
        function handleFileSelect(event) {
          console.log('📁 handleFileSelect 호출');
          console.log('event.target:', event.target);
          console.log('event.target.files:', event.target ? event.target.files : null);
          console.log('files.length:', event.target && event.target.files ? event.target.files.length : 0);
          
          const files = event.target.files;
          if (!files || files.length === 0) {
            console.warn('⚠️ 선택된 파일 없음');
            selectedFile = null;
            return;
          }
          
          const file = files[0];
          console.log('📄 파일 정보:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified).toLocaleString()
          });
          
          // 파일 크기 체크 (10MB)
          if (file.size > 10 * 1024 * 1024) {
            console.error('❌ 파일 크기 초과:', formatFileSize(file.size));
            toast.error('❌ 파일 크기는 10MB를 초과할 수 없습니다.\\n\\n현재 크기: ' + formatFileSize(file.size));
            event.target.value = '';
            selectedFile = null;
            return;
          }
          
          // 파일 타입 체크
          const allowedTypes = ['application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg', 'image/png', 'image/jpg'];
          
          if (!allowedTypes.includes(file.type)) {
            console.error('❌ 허용되지 않는 파일 형식:', file.type);
            toast.error('❌ 허용되지 않는 파일 형식입니다.\\n\\n허용: PDF, Word, JPG, PNG\\n현재: ' + file.type);
            event.target.value = '';
            selectedFile = null;
            return;
          }
          
          // ✅ 중요: File 객체를 전역 변수에 직접 저장
          selectedFile = file;
          console.log('✅ selectedFile 저장:', {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            isFile: selectedFile instanceof File
          });
          
          // 파일 정보 UI 업데이트
          const fileNameElement = document.getElementById('file-name');
          const fileSizeElement = document.getElementById('file-size');
          const selectedFileInfo = document.getElementById('selected-file-info');
          
          if (fileNameElement) fileNameElement.textContent = file.name;
          if (fileSizeElement) fileSizeElement.textContent = formatFileSize(file.size);
          if (selectedFileInfo) selectedFileInfo.classList.remove('hidden');
          
          console.log('✅ 파일 선택 완료 - UI 업데이트됨');
        }
        
        // 파일 선택 취소
        function clearFileSelection() {
          console.log('🗑️ clearFileSelection 호출');
          
          // 전역 변수 초기화
          selectedFile = null;
          console.log('selectedFile 초기화:', selectedFile);
          
          // input 초기화
          const fileInput = document.getElementById('document-file-input');
          if (fileInput) {
            fileInput.value = '';
            console.log('fileInput.value 초기화됨');
          }
          
          // UI 숨기기
          const selectedFileInfo = document.getElementById('selected-file-info');
          if (selectedFileInfo) {
            selectedFileInfo.classList.add('hidden');
            console.log('파일 정보 UI 숨김');
          }
          
          console.log('✅ 파일 선택 취소 완료');
        }
        
        // 문서 업로드
        async function uploadDocument() {
          console.log('📤 uploadDocument 함수 호출됨');
          
          // 전역 변수에서 파일 가져오기 (우선순위 1)
          let file = selectedFile;
          
          // 전역 변수가 없으면 input에서 직접 가져오기 (우선순위 2)
          if (!file) {
            const fileInput = document.getElementById('document-file-input');
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
              file = fileInput.files[0];
              console.log('📁 input.files에서 파일 가져옴:', file.name);
            }
          } else {
            console.log('📁 selectedFile 변수에서 파일 가져옴:', file.name);
          }
          
          // 파일이 없으면 에러
          if (!file) {
            console.error('❌ 업로드할 파일이 없습니다');
            console.error('selectedFile:', selectedFile);
            console.error('fileInput.files:', document.getElementById('document-file-input')?.files);
            toast.error('❌ 파일을 선택해주세요.\\n\\n1. "파일 선택" 버튼 클릭\\n2. 파일 선택\\n3. "문서 업로드" 버튼 클릭');
            return;
          }
          
          console.log('✅ 업로드할 파일:', {
            name: file.name,
            size: file.size,
            type: file.type,
            isFile: file instanceof File
          });
          
          console.log('📤 업로드할 파일:', {
            name: file.name,
            size: file.size,
            type: file.type
          });
          
          const documentType = document.getElementById('document-type').value;
          const description = document.getElementById('document-description').value;
          
          const uploadBtn = document.getElementById('upload-document-btn');
          const originalText = uploadBtn.innerHTML;
          uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>업로드 중...';
          uploadBtn.disabled = true;
          
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            formData.append('description', description);
            
            const token = localStorage.getItem('wowcampus_token');
            console.log('📡 API 요청 시작:', {
              url: '/api/documents/upload',
              method: 'POST',
              hasToken: !!token,
              documentType: documentType,
              fileSize: file.size
            });
            
            const response = await fetch('/api/documents/upload', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token
              },
              body: formData
            });
            
            console.log('📡 API 응답:', {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok
            });
            
            const result = await response.json();
            console.log('📦 API 결과:', result);
            
            if (result.success) {
              // 성공 메시지 표시
              const successMsg = \`✅ 문서가 성공적으로 업로드되었습니다!\\n\\n📄 파일명: \${file.name}\\n📊 크기: \${formatFileSize(file.size)}\\n📁 유형: \${documentType}\`;
              toast.success(successMsg, { duration: 5000 });
              console.log('✅ 업로드 성공, UI 업데이트 중...');
              clearFileSelection();
              document.getElementById('document-description').value = '';
              // 문서 타입을 기본값으로 리셋
              document.getElementById('document-type').value = 'resume';
              loadDocuments();
            } else {
              console.error('❌ 서버 응답 실패:', result);
              toast.error('❌ ' + (result.message || '문서 업로드에 실패했습니다.'));
            }
          } catch (error) {
            console.error('문서 업로드 오류:', error);
            toast.error('❌ 문서 업로드 중 오류가 발생했습니다.\\n\\n상세: ' + (error.message || '알 수 없는 오류'));
          } finally {
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
          }
        }
        
        // 문서 다운로드
        async function downloadDocument(documentId, fileName) {
          try {
            console.log('📥 다운로드 시작:', fileName);
            
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/documents/\${documentId}/download\`, {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            if (response.ok) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              console.log('✅ 다운로드 완료:', fileName);
              // 다운로드 성공 메시지는 표시하지 않음 (파일 다운로드가 진행되므로)
            } else {
              const result = await response.json();
              toast.error('❌ ' + (result.message || '문서 다운로드에 실패했습니다.'));
            }
          } catch (error) {
            console.error('문서 다운로드 오류:', error);
            toast.error('❌ 문서 다운로드 중 오류가 발생했습니다.\\n\\n상세: ' + (error.message || '알 수 없는 오류'));
          }
        }
        
        // 문서 삭제
        async function deleteDocument(documentId) {
          // 문서 이름 가져오기
          const docElement = document.querySelector(\`[data-doc-id="\${documentId}"]\`);
          const docName = docElement ? docElement.getAttribute('data-doc-name') : '이 문서';
          
          showConfirm({
            title: '문서 삭제',
            message: \`정말로 "\${docName}"을(를) 삭제하시겠습니까?\\n\\n⚠️ 삭제된 문서는 복구할 수 없습니다.\`,
            type: 'danger',
            confirmText: '삭제',
            cancelText: '취소',
            onConfirm: async () => {
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch(\`/api/documents/\${documentId}\`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            
            if (result.success) {
              toast.success('✅ 문서가 성공적으로 삭제되었습니다.');
              loadDocuments();
            } else {
              toast.error('❌ ' + (result.message || '문서 삭제에 실패했습니다.'));
            }
          } catch (error) {
            console.error('문서 삭제 오류:', error);
            toast.error('❌ 문서 삭제 중 오류가 발생했습니다.\\n\\n상세: ' + (error.message || '알 수 없는 오류'));
          }
            }
          });
        }
        
        // ==================== 끝: 문서 관리 JavaScript ====================
      `}}>
      </script>
    </div>
  )
}

// Middleware: authMiddleware
