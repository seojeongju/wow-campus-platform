/**
 * Page Component
 * Route: /profile
 * Original: src/index.tsx lines 16139-17208
 */

import type { Context } from 'hono'
import { authMiddleware } from '../middleware/auth'

export const handler = async (c: Context) => {
const user = c.get('user');
  
  if (!user || user.user_type !== 'jobseeker') {
    throw new HTTPException(403, { message: '구직자만 접근할 수 있는 페이지입니다.' });
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
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
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
        
        // 페이지 로드 시 문서 목록 로드 및 이벤트 리스너 등록
        document.addEventListener('DOMContentLoaded', () => {
          loadDocuments();
          
          // 파일 선택 버튼 이벤트
          const selectFileBtn = document.getElementById('select-file-btn');
          if (selectFileBtn) {
            selectFileBtn.addEventListener('click', () => {
              document.getElementById('document-file-input').click();
            });
          }
          
          // 파일 input change 이벤트
          const fileInput = document.getElementById('document-file-input');
          if (fileInput) {
            fileInput.addEventListener('change', (event) => {
              handleFileSelect(event);
            });
          }
          
          // 파일 선택 취소 버튼 이벤트
          const clearFileBtn = document.getElementById('clear-file-btn');
          if (clearFileBtn) {
            clearFileBtn.addEventListener('click', () => {
              clearFileSelection();
            });
          }
          
          // 문서 업로드 버튼 이벤트
          const uploadBtn = document.getElementById('upload-document-btn');
          if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
              uploadDocument();
            });
          }
        });
        
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
