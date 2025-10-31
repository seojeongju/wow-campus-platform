/**
 * Page Component
 * Route: /agents/profile/edit
 * Original: src/index.tsx lines 10612-11081
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'

export const handler = async (c: Context) => {
const user = c.get('user');
  
  // 에이전트가 아닌 경우 접근 제한
  if (!user || user.user_type !== 'agent') {
    throw new HTTPException(403, { message: '에이전트만 접근할 수 있는 페이지입니다.' });
  }
  
  // 지역 리스트 정의
  const regions = [
    { value: 'vietnam', label: '베트남', flag: '🇻🇳' },
    { value: 'thailand', label: '태국', flag: '🇹🇭' },
    { value: 'philippines', label: '필리핀', flag: '🇵🇭' },
    { value: 'uzbekistan', label: '우즈베키스탄', flag: '🇺🇿' },
    { value: 'mongolia', label: '몽골', flag: '🇲🇳' },
    { value: 'nepal', label: '네팔', flag: '🇳🇵' },
    { value: 'myanmar', label: '미얀마', flag: '🇲🇲' },
    { value: 'cambodia', label: '캄보디아', flag: '🇰🇭' },
    { value: 'indonesia', label: '인도네시아', flag: '🇮🇩' },
    { value: 'bangladesh', label: '방글라데시', flag: '🇧🇩' },
    { value: 'sri_lanka', label: '스리랑카', flag: '🇱🇰' },
    { value: 'other', label: '기타', flag: '🌏' }
  ];
  
  const serviceAreas = [
    { value: 'manufacturing', label: '제조업' },
    { value: 'it', label: 'IT/소프트웨어' },
    { value: 'construction', label: '건설' },
    { value: 'agriculture', label: '농업' },
    { value: 'service', label: '서비스업' },
    { value: 'hospitality', label: '호텔/관광' },
    { value: 'healthcare', label: '의료/간병' },
    { value: 'education', label: '교육' },
    { value: 'logistics', label: '물류/운송' },
    { value: 'food', label: '식음료' },
    { value: 'retail', label: '유통/판매' },
    { value: 'engineering', label: '엔지니어링' },
    { value: 'other', label: '기타' }
  ];
  
  const languageLevels = [
    { value: 'native', label: '모국어' },
    { value: 'fluent', label: '유창함' },
    { value: 'advanced', label: '상급' },
    { value: 'intermediate', label: '중급' },
    { value: 'beginner', label: '초급' },
    { value: 'none', label: '불가' }
  ];
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">프로필 수정</span>
              </div>
            </a>
          </div>
          <div id="auth-buttons-container" class="flex items-center space-x-3"></div>
        </nav>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div class="mb-6">
          <a href="/agents" class="text-blue-600 hover:underline">
            <i class="fas fa-arrow-left mr-2"></i>에이전트 대시보드로 돌아가기
          </a>
        </div>

        {/* Page Title */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">프로필 수정</h1>
          <p class="text-gray-600">에이전시 정보를 업데이트하세요</p>
        </div>

        {/* Profile Form */}
        <form id="profile-edit-form" class="space-y-6">
          {/* 기본 정보 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-building text-blue-600 mr-2"></i>기본 정보
            </h2>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  에이전시명 <span class="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="agency_name" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="회사명 입력"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  라이선스 번호
                </label>
                <input 
                  type="text" 
                  id="license_number"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="사업자등록번호 등"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  연락처 <span class="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id="contact_phone"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+82-10-1234-5678"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  이메일 <span class="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="contact_email"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@agency.com"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  경력 연수
                </label>
                <input 
                  type="number" 
                  id="experience_years"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                에이전시 소개
              </label>
              <textarea 
                id="introduction"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="에이전시의 강점, 특징, 주요 실적 등을 소개해주세요..."></textarea>
            </div>
          </div>

          {/* 담당 지역 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-globe-asia text-blue-600 mr-2"></i>담당 지역 <span class="text-red-500">*</span>
            </h2>
            <p class="text-sm text-gray-600 mb-4">주요 활동 지역을 선택해주세요 (복수 선택 가능)</p>
            
            <div class="grid md:grid-cols-3 gap-3">
              {regions.map(region => (
                <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="primary_regions" 
                    value={region.value}
                    class="mr-3 w-4 h-4 text-blue-600"
                  />
                  <span class="text-2xl mr-2">{region.flag}</span>
                  <span class="font-medium">{region.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 전문 분야 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-briefcase text-blue-600 mr-2"></i>전문 분야
            </h2>
            <p class="text-sm text-gray-600 mb-4">주요 서비스 분야를 선택해주세요 (복수 선택 가능)</p>
            
            <div class="grid md:grid-cols-3 gap-3">
              {serviceAreas.map(area => (
                <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="service_areas" 
                    value={area.value}
                    class="mr-3 w-4 h-4 text-blue-600"
                  />
                  <span class="font-medium">{area.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 언어 능력 */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-language text-blue-600 mr-2"></i>언어 능력
            </h2>
            
            <div class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">한국어</label>
                  <select id="lang_korean" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">선택하세요</option>
                    {languageLevels.map(level => (
                      <option value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">영어</label>
                  <select id="lang_english" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">선택하세요</option>
                    {languageLevels.map(level => (
                      <option value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div id="additional-languages" class="space-y-3">
                {/* Additional language fields will be added here */}
              </div>
              
              <button 
                type="button" 
                onclick="addLanguageField()" 
                class="text-blue-600 hover:text-blue-700 font-medium text-sm">
                <i class="fas fa-plus mr-1"></i>언어 추가
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div class="flex space-x-4">
            <button 
              type="submit" 
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
              <i class="fas fa-save mr-2"></i>저장
            </button>
            <a 
              href="/agents" 
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg text-center">
              취소
            </a>
          </div>
        </form>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 프로필 수정 JavaScript ====================
        
        let additionalLangCount = 0;
        
        // 페이지 로드 시 프로필 정보 불러오기
        document.addEventListener('DOMContentLoaded', async () => {
          await loadProfileData();
        });
        
        // 프로필 데이터 로드
        async function loadProfileData() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/agents/profile', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            
            const result = await response.json();
            if (result.success && result.profile) {
              populateForm(result.profile);
            }
          } catch (error) {
            console.error('프로필 로드 오류:', error);
            alert('프로필 정보를 불러오는데 실패했습니다.');
          }
        }
        
        // 폼에 데이터 채우기
        function populateForm(profile) {
          document.getElementById('agency_name').value = profile.agency_name || '';
          document.getElementById('license_number').value = profile.license_number || '';
          document.getElementById('contact_phone').value = profile.contact_phone || '';
          document.getElementById('contact_email').value = profile.contact_email || '';
          document.getElementById('experience_years').value = profile.experience_years || '';
          document.getElementById('introduction').value = profile.introduction || '';
          
          // 체크박스 - 담당 지역
          if (profile.primary_regions && Array.isArray(profile.primary_regions)) {
            profile.primary_regions.forEach(region => {
              const checkbox = document.querySelector(\`input[name="primary_regions"][value="\${region}"]\`);
              if (checkbox) checkbox.checked = true;
            });
          }
          
          // 체크박스 - 전문 분야
          if (profile.service_areas && Array.isArray(profile.service_areas)) {
            profile.service_areas.forEach(area => {
              const checkbox = document.querySelector(\`input[name="service_areas"][value="\${area}"]\`);
              if (checkbox) checkbox.checked = true;
            });
          }
          
          // 언어 능력
          if (profile.language_skills) {
            const skills = typeof profile.language_skills === 'string' 
              ? JSON.parse(profile.language_skills) 
              : profile.language_skills;
            
            if (skills.korean) document.getElementById('lang_korean').value = skills.korean;
            if (skills.english) document.getElementById('lang_english').value = skills.english;
            
            // 추가 언어
            Object.keys(skills).forEach(lang => {
              if (lang !== 'korean' && lang !== 'english') {
                addLanguageField(lang, skills[lang]);
              }
            });
          }
        }
        
        // 언어 필드 추가
        function addLanguageField(langName = '', langLevel = '') {
          const container = document.getElementById('additional-languages');
          const fieldId = 'lang_' + (++additionalLangCount);
          
          const fieldHTML = \`
            <div class="flex space-x-3" id="lang-field-\${additionalLangCount}">
              <input 
                type="text" 
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="언어명 (예: 베트남어)"
                value="\${langName}"
                data-lang-name
              />
              <select class="flex-1 px-4 py-2 border border-gray-300 rounded-lg" data-lang-level>
                <option value="">수준 선택</option>
                <option value="native" \${langLevel === 'native' ? 'selected' : ''}>모국어</option>
                <option value="fluent" \${langLevel === 'fluent' ? 'selected' : ''}>유창함</option>
                <option value="advanced" \${langLevel === 'advanced' ? 'selected' : ''}>상급</option>
                <option value="intermediate" \${langLevel === 'intermediate' ? 'selected' : ''}>중급</option>
                <option value="beginner" \${langLevel === 'beginner' ? 'selected' : ''}>초급</option>
              </select>
              <button 
                type="button" 
                onclick="removeLanguageField(\${additionalLangCount})"
                class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <i class="fas fa-times"></i>
              </button>
            </div>
          \`;
          
          container.insertAdjacentHTML('beforeend', fieldHTML);
        }
        
        // 언어 필드 제거
        function removeLanguageField(id) {
          const field = document.getElementById('lang-field-' + id);
          if (field) field.remove();
        }
        
        // 폼 제출
        document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            
            // 데이터 수집
            const formData = {
              agency_name: document.getElementById('agency_name').value.trim(),
              license_number: document.getElementById('license_number').value.trim(),
              contact_phone: document.getElementById('contact_phone').value.trim(),
              contact_email: document.getElementById('contact_email').value.trim(),
              experience_years: parseInt(document.getElementById('experience_years').value) || 0,
              introduction: document.getElementById('introduction').value.trim(),
              primary_regions: Array.from(document.querySelectorAll('input[name="primary_regions"]:checked')).map(cb => cb.value),
              service_areas: Array.from(document.querySelectorAll('input[name="service_areas"]:checked')).map(cb => cb.value),
              language_skills: {}
            };
            
            // 필수 입력 검증
            if (!formData.agency_name) {
              alert('에이전시명을 입력해주세요.');
              return;
            }
            if (!formData.contact_phone) {
              alert('연락처를 입력해주세요.');
              return;
            }
            if (!formData.contact_email) {
              alert('이메일을 입력해주세요.');
              return;
            }
            if (formData.primary_regions.length === 0) {
              alert('최소 1개 이상의 담당 지역을 선택해주세요.');
              return;
            }
            
            // 언어 능력 수집
            const koreanLevel = document.getElementById('lang_korean').value;
            const englishLevel = document.getElementById('lang_english').value;
            if (koreanLevel) formData.language_skills.korean = koreanLevel;
            if (englishLevel) formData.language_skills.english = englishLevel;
            
            // 추가 언어
            document.querySelectorAll('#additional-languages > div').forEach(field => {
              const langName = field.querySelector('[data-lang-name]').value.trim();
              const langLevel = field.querySelector('[data-lang-level]').value;
              if (langName && langLevel) {
                formData.language_skills[langName.toLowerCase()] = langLevel;
              }
            });
            
            // API 요청
            const response = await fetch('/api/agents/profile', {
              method: 'PUT',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('프로필이 성공적으로 업데이트되었습니다!');
              window.location.href = '/agents';
            } else {
              alert('프로필 업데이트 실패: ' + (result.error || '알 수 없는 오류'));
            }
          } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
          }
        });
        
        // ==================== 끝: 프로필 수정 JavaScript ====================
      `}}>
      </script>
    </div>
  )

// Statistics page - 관리자 전용 페이지
}

// Middleware: optionalAuth
