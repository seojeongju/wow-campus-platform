/**
 * Page Component
 * Route: /profile
 * Original: src/index.tsx lines 16139-17208
 */

import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { authMiddleware } from '../middleware/auth'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const { t } = c.get('i18n');

  // 로그인한 모든 사용자 허용 (구직자, 기업, 에이전트, 관리자)
  if (!user) {
    throw new HTTPException(401, { message: t('profile.error_login_required') });
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
    console.error(t('profile.error_fetch'), error);
  }

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>

          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴 */}
          </div>

          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
            {/* 동적 인증 버튼 */}
          </div>

          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            {/* Mobile Navigation Menu */}
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200">
              {/* 동적 네비게이션 메뉴가 여기에 로드됩니다 */}
            </div>

            {/* Mobile Auth Buttons */}
            <div id="mobile-auth-buttons" class="pt-3">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
      </header>

      {/* 프로필 편집 메인 컨텐츠 */}
      <main class="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{t('profile.page.title')}</h1>
              <p class="text-gray-600">{t('profile.page.subtitle')}</p>
            </div>
            <a href="/dashboard/jobseeker" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>
              {t('profile.page.back_to_dashboard')}
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
                  {t('profile.page.sections.basic_info.title')}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.basic_info.first_name')} <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="profile-first-name"
                      value={profileData?.first_name || ''}
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('profile.page.sections.basic_info.placeholders.first_name')}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.basic_info.last_name')}
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="profile-last-name"
                      value={profileData?.last_name || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('profile.page.sections.basic_info.placeholders.last_name')}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.basic_info.email')} <span class="text-gray-400">{t('profile.page.sections.basic_info.email_readonly')}</span>
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
                      {t('profile.page.sections.basic_info.nationality')}
                    </label>
                    <select
                      name="nationality"
                      id="profile-nationality"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('profile.page.sections.basic_info.select_placeholder')}</option>
                      {[
                        { value: '베트남', key: 'vietnam' },
                        { value: '태국', key: 'thailand' },
                        { value: '중국', key: 'china' },
                        { value: '필리핀', key: 'philippines' },
                        { value: '네팔', key: 'nepal' },
                        { value: '우즈베키스탄', key: 'uzbekistan' },
                        { value: '캄보디아', key: 'cambodia' },
                        { value: '라오스', key: 'laos' },
                        { value: '미얀마', key: 'myanmar' },
                        { value: '인도네시아', key: 'indonesia' },
                        { value: '기타', key: 'other' }
                      ].map((nat) => (
                        <option value={nat.value} selected={profileData?.nationality === nat.value}>{t(`profile.page.sections.basic_info.nationalities.${nat.key}`)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.basic_info.birth_date')}
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      id="profile-birth-date"
                      value={profileData?.birth_date || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.basic_info.gender')}
                    </label>
                    <select
                      name="gender"
                      id="profile-gender"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('profile.page.sections.basic_info.select_placeholder')}</option>
                      <option value="male" selected={profileData?.gender === 'male'}>{t('profile.page.sections.basic_info.gender.male')}</option>
                      <option value="female" selected={profileData?.gender === 'female'}>{t('profile.page.sections.basic_info.gender.female')}</option>
                      <option value="other" selected={profileData?.gender === 'other'}>{t('profile.page.sections.basic_info.gender.other')}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.basic_info.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="profile-phone"
                      value={profileData?.phone || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('profile.page.sections.basic_info.placeholders.phone')}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.basic_info.current_location')}
                    </label>
                    <div class="space-y-2">
                      <select
                        id="profile-current-location-region"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">{t('profile.page.sections.basic_info.placeholders.location_region')}</option>
                        {[
                          { value: '서울특별시', key: 'seoul' },
                          { value: '부산광역시', key: 'busan' },
                          { value: '대구광역시', key: 'daegu' },
                          { value: '인천광역시', key: 'incheon' },
                          { value: '광주광역시', key: 'gwangju' },
                          { value: '대전광역시', key: 'daejeon' },
                          { value: '울산광역시', key: 'ulsan' },
                          { value: '세종특별자치시', key: 'sejong' },
                          { value: '경기도', key: 'gyeonggi' },
                          { value: '강원특별자치도', key: 'gangwon' },
                          { value: '충청북도', key: 'chungbuk' },
                          { value: '충청남도', key: 'chungnam' },
                          { value: '전북특별자치도', key: 'jeonbuk' },
                          { value: '전라남도', key: 'jeonnam' },
                          { value: '경상북도', key: 'gyeongbuk' },
                          { value: '경상남도', key: 'gyeongnam' },
                          { value: '제주특별자치도', key: 'jeju' }
                        ].map((region) => (
                          <option value={region.value}>{t(`profile.page.sections.basic_info.regions.${region.key}`)}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        id="profile-current-location-detail"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('profile.page.sections.basic_info.placeholders.location_detail')}
                      />
                      <input type="hidden" name="current_location" id="profile-current-location" />
                    </div>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.basic_info.bio')}
                    </label>
                    <textarea
                      name="bio"
                      id="profile-bio"
                      rows={4}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('profile.page.sections.basic_info.placeholders.bio')}
                    >{profileData?.bio || ''}</textarea>
                  </div>
                </div>
              </div>

              {/* 경력 정보 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-briefcase text-green-600 mr-3"></i>
                  {t('profile.page.sections.career_info.title')}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.career_info.field')}
                    </label>
                    <select
                      name="skills"
                      id="profile-skills"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('profile.page.sections.basic_info.select_placeholder')}</option>
                      {[
                        { value: 'IT/소프트웨어', key: 'it' },
                        { value: '디자인', key: 'design' },
                        { value: '마케팅/영업', key: 'marketing' },
                        { value: '제조/생산', key: 'manufacturing' },
                        { value: '서비스', key: 'service' },
                        { value: '교육', key: 'education' },
                        { value: '헬스케어', key: 'healthcare' },
                        { value: '금융', key: 'finance' },
                        { value: '기타', key: 'other' }
                      ].map((field) => (
                        <option value={field.value} selected={profileData?.field === field.value}>{t(`profile.page.sections.career_info.fields.${field.key}`)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.career_info.experience_years')}
                    </label>
                    <select
                      name="experience_years"
                      id="profile-experience"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="0" selected={profileData?.experience_years === 0}>{t('profile.page.sections.career_info.experience.newbie')}</option>
                      {[1, 2, 3, 4, 5].map((year) => (
                        <option value={year} selected={profileData?.experience_years === year}>{t('profile.page.sections.career_info.experience.year').replace('{years}', year.toString())}</option>
                      ))}
                      <option value="6" selected={profileData?.experience_years >= 6}>{t('profile.page.sections.career_info.experience.years_plus')}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.career_info.education_level')}
                    </label>
                    <select
                      name="education_level"
                      id="profile-education-level"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('profile.page.sections.basic_info.select_placeholder')}</option>
                      <option value="high_school" selected={profileData?.education_level === 'high_school'}>{t('profile.page.sections.career_info.education.high_school')}</option>
                      <option value="associate" selected={profileData?.education_level === 'associate'}>{t('profile.page.sections.career_info.education.associate')}</option>
                      <option value="bachelor" selected={profileData?.education_level === 'bachelor'}>{t('profile.page.sections.career_info.education.bachelor')}</option>
                      <option value="master" selected={profileData?.education_level === 'master'}>{t('profile.page.sections.career_info.education.master')}</option>
                      <option value="doctorate" selected={profileData?.education_level === 'doctorate'}>{t('profile.page.sections.career_info.education.doctorate')}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.career_info.major')}
                    </label>
                    <input
                      type="text"
                      name="major"
                      id="profile-major"
                      value={profileData?.major || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('profile.page.sections.career_info.placeholders.major')}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.career_info.visa_status')}
                    </label>
                    <select
                      name="visa_status"
                      id="profile-visa-status"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('profile.page.sections.basic_info.select_placeholder')}</option>
                      <option value="F-2" selected={profileData?.visa_type === 'F-2'}>{t('profile.page.sections.career_info.visa_types.f2')}</option>
                      <option value="F-4" selected={profileData?.visa_type === 'F-4'}>{t('profile.page.sections.career_info.visa_types.f4')}</option>
                      <option value="F-5" selected={profileData?.visa_type === 'F-5'}>{t('profile.page.sections.career_info.visa_types.f5')}</option>
                      <option value="E-7" selected={profileData?.visa_type === 'E-7'}>{t('profile.page.sections.career_info.visa_types.e7')}</option>
                      <option value="E-9" selected={profileData?.visa_type === 'E-9'}>{t('profile.page.sections.career_info.visa_types.e9')}</option>
                      <option value="D-2" selected={profileData?.visa_type === 'D-2'}>{t('profile.page.sections.career_info.visa_types.d2')}</option>
                      <option value="D-8" selected={profileData?.visa_type === 'D-8'}>{t('profile.page.sections.career_info.visa_types.d8')}</option>
                      <option value="D-10" selected={profileData?.visa_type === 'D-10'}>{t('profile.page.sections.career_info.visa_types.d10')}</option>
                      <option value="기타" selected={profileData?.visa_type === '기타'}>{t('profile.page.sections.career_info.visa_types.other')}</option>
                    </select>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.career_info.bio_extended')}
                    </label>
                    <textarea
                      name="bio_extended"
                      id="profile-bio-extended"
                      rows={3}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('profile.page.sections.career_info.placeholders.bio_extended')}
                    >{profileData?.bio || ''}</textarea>
                  </div>
                </div>
              </div>

              {/* 희망 근무 조건 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-map-marker-alt text-purple-600 mr-3"></i>
                  {t('profile.page.sections.work_preferences.title')}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.work_preferences.preferred_location')}
                    </label>
                    <select
                      name="preferred_location"
                      id="profile-location"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('profile.page.sections.basic_info.select_placeholder')}</option>
                      {[
                        { value: '서울특별시', key: 'seoul' },
                        { value: '부산광역시', key: 'busan' },
                        { value: '대구광역시', key: 'daegu' },
                        { value: '인천광역시', key: 'incheon' },
                        { value: '광주광역시', key: 'gwangju' },
                        { value: '대전광역시', key: 'daejeon' },
                        { value: '울산광역시', key: 'ulsan' },
                        { value: '세종특별자치시', key: 'sejong' },
                        { value: '경기도', key: 'gyeonggi' },
                        { value: '강원특별자치도', key: 'gangwon' },
                        { value: '충청북도', key: 'chungbuk' },
                        { value: '충청남도', key: 'chungnam' },
                        { value: '전북특별자치도', key: 'jeonbuk' },
                        { value: '전라남도', key: 'jeonnam' },
                        { value: '경상북도', key: 'gyeongbuk' },
                        { value: '경상남도', key: 'gyeongnam' },
                        { value: '제주특별자치도', key: 'jeju' }
                      ].map((region) => {
                        const isSelected = profileData?.preferred_location === region.value || 
                          (region.value === '서울특별시' && profileData?.preferred_location === '서울') ||
                          (region.value === '부산광역시' && profileData?.preferred_location === '부산') ||
                          (region.value === '대구광역시' && profileData?.preferred_location === '대구') ||
                          (region.value === '인천광역시' && profileData?.preferred_location === '인천') ||
                          (region.value === '광주광역시' && profileData?.preferred_location === '광주') ||
                          (region.value === '대전광역시' && profileData?.preferred_location === '대전') ||
                          (region.value === '울산광역시' && profileData?.preferred_location === '울산') ||
                          (region.value === '세종특별자치시' && profileData?.preferred_location === '세종') ||
                          (region.value === '경기도' && profileData?.preferred_location === '경기') ||
                          (region.value === '강원특별자치도' && (profileData?.preferred_location === '강원도' || profileData?.preferred_location === '강원')) ||
                          (region.value === '충청북도' && profileData?.preferred_location === '충북') ||
                          (region.value === '충청남도' && profileData?.preferred_location === '충남') ||
                          (region.value === '전북특별자치도' && (profileData?.preferred_location === '전라북도' || profileData?.preferred_location === '전북')) ||
                          (region.value === '전라남도' && profileData?.preferred_location === '전남') ||
                          (region.value === '경상북도' && profileData?.preferred_location === '경북') ||
                          (region.value === '경상남도' && profileData?.preferred_location === '경남') ||
                          (region.value === '제주특별자치도' && (profileData?.preferred_location === '제주도' || profileData?.preferred_location === '제주'));
                        return (
                          <option value={region.value} selected={isSelected}>{t(`profile.page.sections.basic_info.regions.${region.key}`)}</option>
                        );
                      })}
                      <option value="전국" selected={profileData?.preferred_location === '전국'}>{t('profile.page.sections.work_preferences.location_nationwide')}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.work_preferences.salary_expectation')}
                    </label>
                    <input
                      type="number"
                      name="salary_expectation"
                      id="profile-salary-expectation"
                      value={profileData?.salary_expectation || ''}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('profile.page.sections.work_preferences.placeholders.salary')}
                      min={0}
                      step={100}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.work_preferences.korean_level')}
                    </label>
                    <select
                      name="korean_level"
                      id="profile-korean"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('profile.page.sections.basic_info.select_placeholder')}</option>
                      <option value="TOPIK 1급" selected={profileData?.korean_level === 'TOPIK 1급'}>{t('profile.page.sections.work_preferences.korean_levels.topik1')}</option>
                      <option value="TOPIK 2급" selected={profileData?.korean_level === 'TOPIK 2급'}>{t('profile.page.sections.work_preferences.korean_levels.topik2')}</option>
                      <option value="TOPIK 3급" selected={profileData?.korean_level === 'TOPIK 3급'}>{t('profile.page.sections.work_preferences.korean_levels.topik3')}</option>
                      <option value="TOPIK 4급" selected={profileData?.korean_level === 'TOPIK 4급'}>{t('profile.page.sections.work_preferences.korean_levels.topik4')}</option>
                      <option value="TOPIK 5급" selected={profileData?.korean_level === 'TOPIK 5급'}>{t('profile.page.sections.work_preferences.korean_levels.topik5')}</option>
                      <option value="TOPIK 6급" selected={profileData?.korean_level === 'TOPIK 6급'}>{t('profile.page.sections.work_preferences.korean_levels.topik6')}</option>
                      <option value="미응시" selected={profileData?.korean_level === '미응시'}>{t('profile.page.sections.work_preferences.korean_levels.none')}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.work_preferences.english_level')}
                    </label>
                    <select
                      name="english_level"
                      id="profile-english"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('profile.page.sections.basic_info.select_placeholder')}</option>
                      <option value="beginner" selected={profileData?.english_level === 'beginner'}>{t('profile.page.sections.work_preferences.english_levels.beginner')}</option>
                      <option value="elementary" selected={profileData?.english_level === 'elementary'}>{t('profile.page.sections.work_preferences.english_levels.elementary')}</option>
                      <option value="intermediate" selected={profileData?.english_level === 'intermediate'}>{t('profile.page.sections.work_preferences.english_levels.intermediate')}</option>
                      <option value="advanced" selected={profileData?.english_level === 'advanced'}>{t('profile.page.sections.work_preferences.english_levels.advanced')}</option>
                      <option value="native" selected={profileData?.english_level === 'native'}>{t('profile.page.sections.work_preferences.english_levels.native')}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.page.sections.work_preferences.available_start_date')}
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

              {/* 문서 관리 섹션 */}
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-file-alt text-gray-600 mr-3"></i>
                  {t('profile.page.sections.documents.title')}
                </h2>

                <div class="space-y-6">
                  {/* 이력서 업로드 */}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{t('profile.page.sections.documents.resume.label')}</label>
                    <div class="flex items-center space-x-3">
                      <input type="file" id="resume-upload" accept=".pdf,.doc,.docx" class="hidden" />
                      <button type="button" onclick="document.getElementById('resume-upload').click()"
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center transition-colors">
                        <i class="fas fa-upload mr-2"></i> {t('profile.page.sections.documents.resume.select_file')}
                      </button>
                      <span id="resume-file-name" class="text-sm text-gray-500">{t('profile.page.sections.documents.resume.no_file')}</span>
                      <button type="button" id="btn-upload-resume" onclick="uploadDetails('resume')" class="hidden px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">{t('profile.page.sections.documents.resume.upload')}</button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{t('profile.page.sections.documents.resume.note')}</p>
                  </div>

                  {/* 포트폴리오 업로드 */}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{t('profile.page.sections.documents.portfolio.label')}</label>
                    <div class="flex items-center space-x-3">
                      <input type="file" id="portfolio-upload" accept=".pdf,.doc,.docx,.jpg,.png" multiple class="hidden" />
                      <button type="button" onclick="document.getElementById('portfolio-upload').click()"
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center transition-colors">
                        <i class="fas fa-images mr-2"></i> {t('profile.page.sections.documents.portfolio.select_file')}
                      </button>
                      <span id="portfolio-file-count" class="text-sm text-gray-500">{t('profile.page.sections.documents.portfolio.no_file')}</span>
                      <button type="button" id="btn-upload-portfolio" onclick="uploadDetails('portfolio')" class="hidden px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">{t('profile.page.sections.documents.portfolio.upload')}</button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{t('profile.page.sections.documents.portfolio.note')}</p>
                  </div>

                  {/* 문서 목록 */}
                  <div id="document-list-container" class="mt-4">
                    <h3 class="text-sm font-medium text-gray-700 mb-2">{t('profile.page.sections.documents.uploaded.title')}</h3>
                    <ul id="document-list" class="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-gray-50">
                      <li class="p-4 text-center text-gray-500 text-sm">{t('profile.page.sections.documents.uploaded.loading')}</li>
                    </ul>
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
                  {t('profile.page.actions.cancel')}
                </button>
                <button
                  type="submit"
                  id="save-profile-btn"
                  class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <i class="fas fa-save mr-2"></i>
                  {t('profile.page.actions.save')}
                </button>
              </div>
            </form>
          </div>

          {/* 프로필 완성도 & 팁 */}
          <div class="space-y-6">
            {/* 프로필 완성도 */}
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-4">{t('profile.page.completion.title')}</h2>
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl font-bold text-blue-600" id="profile-completion">0%</span>
                  <span class="text-sm text-gray-500">{t('profile.page.completion.completed')}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div id="profile-progress-bar" class="bg-blue-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
              </div>
              <p class="text-sm text-gray-600">
                {t('profile.page.completion.description')}
              </p>
            </div>

            {/* 프로필 작성 팁 */}
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <h2 class="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                {t('profile.page.tips.title')}
              </h2>
              <ul class="space-y-3 text-sm text-blue-800">
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>{t('profile.page.tips.tip1')}</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>{t('profile.page.tips.tip2')}</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>{t('profile.page.tips.tip3')}</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
                  <span>{t('profile.page.tips.tip4')}</span>
                </li>
              </ul>
            </div>

            {/* 도움말 */}
            <div class="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 class="font-bold text-green-900 mb-2 flex items-center">
                <i class="fas fa-info-circle mr-2"></i>
                {t('profile.page.help.title')}
              </h3>
              <p class="text-sm text-green-800 mb-4">
                {t('profile.page.help.description')}
              </p>
              <a href="/support" class="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-900">
                {t('profile.page.help.link')}
                <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* 프로필 데이터를 JavaScript 변수로 전달 */}
      <script dangerouslySetInnerHTML={{
        __html: `
        window.profileData = ${JSON.stringify(profileData || {})};
      `}} />

      {/* 프로필 저장 스크립트 */}
      <script dangerouslySetInnerHTML={{
        __html: `
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
          const birthDateEl = document.getElementById('profile-birth-date');
          const genderEl = document.getElementById('profile-gender');
          const phoneEl = document.getElementById('profile-phone');
          const currentLocationEl = document.getElementById('profile-current-location');
          const bioEl = document.getElementById('profile-bio');
          
          if (firstNameEl && data.first_name) firstNameEl.value = data.first_name;
          if (lastNameEl && data.last_name) lastNameEl.value = data.last_name;
          if (nationalityEl && data.nationality) nationalityEl.value = data.nationality;
          if (birthDateEl && data.birth_date) birthDateEl.value = data.birth_date;
          if (genderEl && data.gender) genderEl.value = data.gender;
          if (phoneEl && data.phone) phoneEl.value = data.phone;
          // if (currentLocationEl && data.current_location) currentLocationEl.value = data.current_location; // Removed old logic
          
          // Handle Split Current Location
          if (data.current_location) {
             const regionEl = document.getElementById('profile-current-location-region');
             const detailEl = document.getElementById('profile-current-location-detail');
             
             let foundRegion = false;
             if (regionEl) {
                 // 1. Try exact full name match
                 for (let i = 0; i < regionEl.options.length; i++) {
                     const regionVal = regionEl.options[i].value;
                     if (regionVal && data.current_location.startsWith(regionVal)) {
                         regionEl.value = regionVal;
                         if (detailEl) {
                             detailEl.value = data.current_location.substring(regionVal.length).trim();
                         }
                         foundRegion = true;
                         break;
                     }
                 }
                 // 2. Try legacy short name match
                 if (!foundRegion) {
                     const regionMap = {
                         '서울': '서울특별시', '부산': '부산광역시', '대구': '대구광역시', '인천': '인천광역시',
                         '광주': '광주광역시', '대전': '대전광역시', '울산': '울산광역시', '세종': '세종특별자치시',
                         '경기': '경기도', '강원': '강원특별자치도', '충북': '충청북도', '충남': '충청남도',
                         '전북': '전북특별자치도', '전남': '전라남도', '경북': '경상북도', '경남': '경상남도',
                         '제주': '제주특별자치도', '강원도': '강원특별자치도', '전라북도': '전북특별자치도'
                     };
                     for (const [short, full] of Object.entries(regionMap)) {
                         if (data.current_location.startsWith(short)) {
                              regionEl.value = full;
                              if (detailEl) {
                                 detailEl.value = data.current_location.substring(short.length).trim();
                              }
                              foundRegion = true;
                              break;
                         }
                     }
                 }
                 
                 // 3. Fallback: Put everything in detail if no region match
                 if (!foundRegion && detailEl) {
                     detailEl.value = data.current_location;
                 }
             }
          }
          if (bioEl && data.bio) bioEl.value = data.bio;
          
          // 경력 정보
          const skillsEl = document.getElementById('profile-skills');
          const experienceEl = document.getElementById('profile-experience');
          const educationEl = document.getElementById('profile-education-level');
          const majorEl = document.getElementById('profile-major');
          const visaEl = document.getElementById('profile-visa-status');
          
          if (skillsEl && data.skills) skillsEl.value = data.skills;
          if (experienceEl && data.experience_years !== undefined) experienceEl.value = data.experience_years;
          if (educationEl && data.education_level) educationEl.value = data.education_level;
          if (majorEl && data.major) majorEl.value = data.major;
          if (visaEl && data.visa_status) visaEl.value = data.visa_status;
          
          // 희망 근무 조건
          const locationEl = document.getElementById('profile-location');
          const salaryEl = document.getElementById('profile-salary-expectation');
          const koreanEl = document.getElementById('profile-korean');
          const englishEl = document.getElementById('profile-english');
          const startDateEl = document.getElementById('profile-start-date');
          
          if (locationEl && data.preferred_location) locationEl.value = data.preferred_location;
          if (salaryEl && data.salary_expectation) salaryEl.value = data.salary_expectation;
          if (koreanEl && data.korean_level) koreanEl.value = data.korean_level;
          if (englishEl && data.english_level) englishEl.value = data.english_level;
          if (startDateEl && data.available_start_date) startDateEl.value = data.available_start_date;
        }
        
        // 프로필 완성도 계산
        function calculateProfileCompletion() {
          const fields = [
            document.getElementById('profile-first-name'),
            document.getElementById('profile-last-name'),
            document.getElementById('profile-nationality'),
            document.getElementById('profile-birth-date'),
            document.getElementById('profile-gender'),
            document.getElementById('profile-phone'),
            document.getElementById('profile-current-location-region'),
            // document.getElementById('profile-current-location-detail'), // Detail is optional? Or required? Let's check region mostly.
            // document.getElementById('profile-current-location'), // Removed
            document.getElementById('profile-bio'),
            document.getElementById('profile-skills'),
            document.getElementById('profile-experience'),
            document.getElementById('profile-education-level'),
            document.getElementById('profile-major'),
            document.getElementById('profile-visa-status'),
            document.getElementById('profile-location'),
            document.getElementById('profile-salary-expectation'),
            document.getElementById('profile-korean'),
            document.getElementById('profile-english'),
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
          
          // 문서 관리 기능 제거됨 (파일 업로드 기능 미작동으로 인한 삭제)
        });
        
        // 프로필 저장
        document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          
          // Combine current_location
          const regionEl = document.getElementById('profile-current-location-region');
          const detailEl = document.getElementById('profile-current-location-detail');
          if (regionEl) {
              const combinedLocation = regionEl.value + (detailEl && detailEl.value ? ' ' + detailEl.value : '');
              formData.set('current_location', combinedLocation);
          }

          const data = Object.fromEntries(formData.entries());
          
          const saveBtn = document.getElementById('save-profile-btn');
          const originalText = saveBtn.innerHTML;
          const translations = window.translations || {};
          const t = (key) => {
            const keys = key.split('.');
            let value = translations;
            for (const k of keys) {
              if (value && value[k] !== undefined) {
                value = value[k];
              } else {
                return key;
              }
            }
            return value || key;
          };
          saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>' + t('profile.page.actions.saving');
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
              toast.success(t('profile.page.messages.save_success'));
              window.location.href = '/dashboard/jobseeker';
            } else {
              console.error('저장 실패:', result);
              const errorMsg = result.message || t('profile.page.messages.save_failed');
              const errorDetail = result.error || '';
              toast.error('❌ ' + errorMsg + (errorDetail ? '\\n\\n상세: ' + errorDetail : ''));
            }
          } catch (error) {
            console.error('프로필 저장 오류:', error);
            toast.error(t('profile.page.messages.save_error') + '\\n\\n오류: ' + error.message);
          } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
          }
        });
        
        // 문서 관리 JavaScript
        async function loadDocuments() {
          const container = document.getElementById('document-list');
          if (!container) return;
          
          const translations = window.translations || {};
          const t = (key) => {
            const keys = key.split('.');
            let value = translations;
            for (const k of keys) {
              if (value && value[k] !== undefined) {
                value = value[k];
              } else {
                return key;
              }
            }
            return value || key;
          };
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/upload/list', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const result = await response.json();
            
            if (result.success && result.data && result.data.files) {
              if (result.data.files.length === 0) {
                container.innerHTML = '<li class="p-4 text-center text-gray-500 text-sm">' + t('profile.page.sections.documents.uploaded.empty') + '</li>';
                return;
              }
              
              container.innerHTML = result.data.files.map(file => {
                const date = new Date(file.uploadedAt).toLocaleDateString();
                const size = (file.size / 1024 / 1024).toFixed(2);
                const isResume = file.filename.includes('/resumes/');
                const typeLabel = isResume ? t('profile.page.sections.documents.uploaded.type_resume') : t('profile.page.sections.documents.uploaded.type_portfolio');
                
                return \`
                  <li class="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div class="flex items-center space-x-3 overflow-hidden">
                      <div class="flex-shrink-0 w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                        <i class="fas \${isResume ? 'fa-file-alt' : 'fa-file-image'}"></i>
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">\${file.originalName || file.filename.split('/').pop()}</p>
                        <p class="text-xs text-gray-500">\${typeLabel} · \${size} MB · \${date}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 flex-shrink-0">
                      <a href="\${file.url}" target="_blank" class="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded text-xs">
                        <i class="fas fa-download mr-1"></i> \${t('profile.page.sections.documents.uploaded.download')}
                      </a>
                      <button type="button" onclick="deleteDocument('\${file.filename}')" class="p-1 px-2 text-red-600 hover:bg-red-50 rounded text-xs">
                        <i class="fas fa-trash-alt mr-1"></i> \${t('profile.page.sections.documents.uploaded.delete')}
                      </button>
                    </div>
                  </li>
                \`;
              }).join('');
            } else {
              container.innerHTML = '<li class="p-4 text-center text-red-500 text-sm">' + t('profile.page.sections.documents.uploaded.error') + '</li>';
            }
          } catch (e) {
            console.error('문서 로드 오류:', e);
            container.innerHTML = '<li class="p-4 text-center text-red-500 text-sm">' + t('profile.page.sections.documents.uploaded.error_general') + '</li>';
          }
        }

        async function uploadDetails(type) {
          const translations = window.translations || {};
          const t = (key) => {
            const keys = key.split('.');
            let value = translations;
            for (const k of keys) {
              if (value && value[k] !== undefined) {
                value = value[k];
              } else {
                return key;
              }
            }
            return value || key;
          };
          
          const inputId = type === 'resume' ? 'resume-upload' : 'portfolio-upload';
          const input = document.getElementById(inputId);
          const files = input.files;
          
          if (!files || files.length === 0) {
            toast.error(t('profile.page.messages.select_file'));
            return;
          }
          
          const btnId = 'btn-upload-' + type;
          const btn = document.getElementById(btnId);
          const originalText = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          btn.disabled = true;
          
          try {
            const token = localStorage.getItem('wowcampus_token');
            const formData = new FormData();
            
            if (type === 'resume') {
                formData.append('resume', files[0]);
            } else {
                for (let i=0; i<files.length; i++) {
                    formData.append('portfolio', files[i]);
                }
            }
            
            const response = await fetch('/api/upload/' + type, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success(type === 'resume' ? t('profile.page.messages.upload_success_resume') : t('profile.page.messages.upload_success_portfolio'));
                input.value = '';
                if (type === 'resume') document.getElementById('resume-file-name').textContent = t('profile.page.sections.documents.resume.no_file');
                else document.getElementById('portfolio-file-count').textContent = t('profile.page.sections.documents.portfolio.no_file');
                document.getElementById(btnId).classList.add('hidden');
                loadDocuments();
            } else {
                toast.error(result.message || t('profile.page.messages.upload_failed'));
            }
          } catch(e) {
            console.error('업로드 오류:', e);
            toast.error(t('profile.page.messages.upload_error'));
          } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }
        }

        async function deleteDocument(filename) {
            const translations = window.translations || {};
            const t = (key) => {
              const keys = key.split('.');
              let value = translations;
              for (const k of keys) {
                if (value && value[k] !== undefined) {
                  value = value[k];
                } else {
                  return key;
                }
              }
              return value || key;
            };
            
            if (!confirm(t('profile.page.messages.delete_confirm'))) return;
            
            try {
                const token = localStorage.getItem('wowcampus_token');
                // 파일명에 슬래시나 특수문자가 포함될 수 있으므로 인코딩 필요
                const response = await fetch('/api/upload/' + encodeURIComponent(filename), {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const result = await response.json();
                
                if (result.success) {
                    toast.success(t('profile.page.messages.delete_success'));
                    loadDocuments();
                } else {
                    toast.error(result.message || t('profile.page.messages.delete_failed'));
                }
            } catch(e) {
                console.error('삭제 오류:', e);
                toast.error(t('profile.page.messages.delete_error'));
            }
        }
        
        // 전역 함수로 등록
        window.uploadDetails = uploadDetails;
        window.deleteDocument = deleteDocument;

        document.addEventListener('DOMContentLoaded', () => {
            const translations = window.translations || {};
            const t = (key) => {
              const keys = key.split('.');
              let value = translations;
              for (const k of keys) {
                if (value && value[k] !== undefined) {
                  value = value[k];
                } else {
                  return key;
                }
              }
              return value || key;
            };
            
            const resumeInput = document.getElementById('resume-upload');
            if (resumeInput) {
                resumeInput.addEventListener('change', function() {
                    const fileName = this.files[0] ? this.files[0].name : t('profile.page.sections.documents.resume.no_file');
                    document.getElementById('resume-file-name').textContent = fileName;
                    const btn = document.getElementById('btn-upload-resume');
                    if (this.files.length > 0) btn.classList.remove('hidden');
                    else btn.classList.add('hidden');
                });
            }
            
            const portfolioInput = document.getElementById('portfolio-upload');
            if (portfolioInput) {
                portfolioInput.addEventListener('change', function() {
                    const count = this.files.length;
                    const text = count > 0 ? t('profile.page.sections.documents.portfolio.files_selected').replace('{count}', count.toString()) : t('profile.page.sections.documents.portfolio.no_file');
                    document.getElementById('portfolio-file-count').textContent = text;
                    const btn = document.getElementById('btn-upload-portfolio');
                    if (count > 0) btn.classList.remove('hidden');
                    else btn.classList.add('hidden');
                });
            }
            
            // 문서 목록 로드
            setTimeout(loadDocuments, 1000);
        });
      `}}>
      </script>
    </div>
  )
}

// Middleware: authMiddleware
