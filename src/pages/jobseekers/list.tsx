/**
 * Page Component
 * Route: /jobseekers
 * Original: src/index.tsx lines 9414-9811
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'

export const handler = (c: Context) => {
const user = c.get('user');
  
  // 모든 사용자(로그인/비로그인)에게 페이지를 표시
  // 클라이언트 사이드에서 로그인 상태를 체크하도록 변경
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
            {/* 동적 메뉴가 여기에 로드됩니다 */}
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

      {/* Job Seekers Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">구직정보</h1>
          <p class="text-gray-600 text-lg">우수한 외국인 구직자들의 프로필을 확인하세요</p>
        </div>

        {/* Advanced Search and Filter */}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Basic Search */}
          <div class="grid md:grid-cols-5 gap-4 mb-6">
            <input type="text" id="jobseeker-search-input" placeholder="이름, 기술 스택, 전공 검색" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            <select id="jobseeker-major-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="">전공 전체</option>
              <option value="computer">컴퓨터공학/IT</option>
              <option value="business">경영학</option>
              <option value="design">디자인</option>
              <option value="engineering">공학</option>
              <option value="marketing">마케팅</option>
              <option value="finance">금융/경제</option>
              <option value="languages">어학/문학</option>
              <option value="other">기타</option>
            </select>
            <select id="jobseeker-experience-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="">경력 전체</option>
              <option value="entry">신입 (경력무관)</option>
              <option value="1-2">1-2년</option>
              <option value="3-5">3-5년</option>
              <option value="5+">5년 이상</option>
            </select>
            <select id="jobseeker-location-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="">지역 전체</option>
              <option value="서울">서울</option>
              <option value="경기도">경기도</option>
              <option value="강원도">강원도</option>
              <option value="충청도">충청도</option>
              <option value="경상도">경상도</option>
              <option value="전라도">전라도</option>
              <option value="제주도">제주도</option>
            </select>
            <div class="flex gap-2">
              <button onclick="searchJobSeekers()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex-1">
                <i class="fas fa-search mr-2"></i>검색
              </button>
              <button onclick="toggleAdvancedFilters('jobseeker')" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <i class="fas fa-filter mr-2"></i>고급
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div id="advanced-jobseeker-filters" class="border-t pt-6 hidden">
            <div class="grid lg:grid-cols-3 gap-6">
              {/* Nationality */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">국적</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="china" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">중국</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="vietnam" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">베트남</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="philippines" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">필리핀</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="thailand" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">태국</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="japan" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">일본</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="nationality" value="usa" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">미국</span>
                  </label>
                </div>
              </div>

              {/* Visa Status */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">비자 상태</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="E7" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">E-7 (특정활동)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="E9" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">E-9 (비전문취업)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="F2" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">F-2 (거주)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="F4" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">F-4 (재외동포)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="F5" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">F-5 (영주)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="visa_status" value="D2" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">D-2 (유학)</span>
                  </label>
                </div>
              </div>

              {/* Korean Level */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">한국어 수준</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="beginner" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">초급 (기초 회화)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="elementary" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">초중급 (간단 업무)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="intermediate" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">중급 (일반 업무)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="advanced" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">고급 (유창한 소통)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="korean_level" value="native" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">원어민 수준</span>
                  </label>
                </div>
              </div>

              {/* Location Preference */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">희망 근무지</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="seoul" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">서울</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="gyeonggi" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">경기</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="busan" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">부산</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="daegu" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">대구</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="preferred_location" value="incheon" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">인천</span>
                  </label>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">주요 기술</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="java" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">Java</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="python" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">Python</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="javascript" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">JavaScript</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="react" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">React</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="photoshop" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">Photoshop</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="skills" value="marketing" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">디지털 마케팅</span>
                  </label>
                </div>
              </div>

              {/* Salary Expectation */}
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">희망 연봉</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="2000-2500" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">2,000-2,500만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="2500-3000" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">2,500-3,000만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="3000-3500" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">3,000-3,500만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="3500-4000" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">3,500-4,000만원</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="salary_expectation" value="4000+" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">4,000만원 이상</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center mt-6 pt-4 border-t">
              <button onclick="clearAllFilters('jobseeker')" class="text-gray-600 hover:text-gray-800 text-sm">
                <i class="fas fa-times mr-2"></i>모든 필터 해제
              </button>
              <div class="flex gap-2">
                <button onclick="applyJobSeekerFilters()" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <i class="fas fa-filter mr-2"></i>필터 적용
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          <div id="active-jobseeker-filters" class="mt-4 hidden">
            <div class="flex flex-wrap gap-2">
              <span class="text-sm text-gray-600 mr-2">적용된 필터:</span>
              <div id="active-jobseeker-filters-list" class="flex flex-wrap gap-2">
                {/* Active filter badges will be inserted here */}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-3">
            <button onclick="showProfileModal('create')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <i class="fas fa-plus mr-2"></i>프로필 등록
            </button>
            <button onclick="loadJobSeekers()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <i class="fas fa-refresh mr-2"></i>새로고침
            </button>
          </div>
          <div class="text-sm text-gray-600">
            총 <span id="total-jobseekers">0</span>명의 구직자
          </div>
        </div>

        {/* Job Seekers List */}
        <div class="space-y-6" id="jobseekers-listings">
          <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">구직자 정보를 불러오는 중...</p>
          </div>
        </div>
      </main>

      {/* Profile Management Modal */}
      <div id="profile-modal" class="fixed inset-0 z-50 hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="hideProfileModal()"></div>
        <div class="flex items-center justify-center min-h-screen px-4 py-8">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div class="px-6 py-4 border-b">
              <div class="flex justify-between items-center">
                <h3 id="profile-modal-title" class="text-lg font-semibold text-gray-900">프로필 등록</h3>
                <button onclick="hideProfileModal()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form id="profile-form" class="p-6">
              <input type="hidden" id="profile-id" />
              <input type="hidden" id="profile-user-id" />
              
              {/* User Type Selection */}
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">사용자 유형 *</label>
                <select id="profile-user-type" name="user_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value="">유형을 선택하세요</option>
                  <option value="jobseeker">구직자</option>
                  <option value="company">구인기업</option>
                  <option value="agent">에이전트</option>
                </select>
              </div>

              {/* Dynamic Profile Fields Container */}
              <div id="profile-fields-container">
                {/* Fields will be dynamically generated based on user type */}
              </div>

              <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onclick="hideProfileModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  취소
                </button>
                <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <i class="fas fa-save mr-2"></i>저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Profile Detail View Modal */}
      <div id="profile-detail-modal" class="fixed inset-0 z-50 hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="hideProfileDetailModal()"></div>
        <div class="flex items-center justify-center min-h-screen px-4 py-8">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div class="px-6 py-4 border-b">
              <div class="flex justify-between items-center">
                <h3 id="profile-detail-title" class="text-lg font-semibold text-gray-900">프로필 상세정보</h3>
                <div class="flex gap-2">
                  <button id="profile-detail-edit-btn" onclick="editProfileFromDetail()" class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                    <i class="fas fa-edit mr-1"></i>수정
                  </button>
                  <button onclick="hideProfileDetailModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <div id="profile-detail-content">
                {/* Profile details will be loaded here */}
                <div class="text-center py-12">
                  <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                  <p class="text-gray-600">프로필 정보를 불러오는 중...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Script */}
      <script dangerouslySetInnerHTML={{__html: `
        // 페이지 로드 시 로그인 체크
        document.addEventListener('DOMContentLoaded', function() {
          console.log('구직자 목록 페이지 로드됨');
          
          // URL에 'loggedIn' 파라미터가 있으면 로그인 성공한 것으로 간주
          const urlParams = new URLSearchParams(window.location.search);
          const justLoggedIn = urlParams.get('loggedIn');
          
          if (justLoggedIn === 'true') {
            console.log('✅ 로그인 완료 신호 수신 - 강제로 목록 로딩');
            // URL에서 파라미터 제거 (깔끔하게)
            window.history.replaceState({}, document.title, '/jobseekers');
            // 짧은 지연 후 로딩 (토큰 저장 확실히 완료되도록)
            setTimeout(() => {
              checkLoginAndLoadJobseekers();
            }, 100);
          } else {
            checkLoginAndLoadJobseekers();
          }
        });
        
        // 페이지가 다시 포커스를 받을 때도 체크 (로그인 후 돌아왔을 때)
        window.addEventListener('focus', function() {
          console.log('페이지 포커스 받음 - 로그인 상태 재확인');
          checkLoginAndLoadJobseekers();
        });
        
        // 페이지 가시성 변경 시에도 체크
        document.addEventListener('visibilitychange', function() {
          if (!document.hidden) {
            console.log('페이지 가시성 변경 - 로그인 상태 재확인');
            checkLoginAndLoadJobseekers();
          }
        });

        function checkLoginAndLoadJobseekers() {
          const listContainer = document.getElementById('jobseekers-listings');
          if (!listContainer) {
            console.warn('jobseekers-listings 컨테이너를 찾을 수 없습니다');
            return;
          }

          // 로그인 체크
          const token = localStorage.getItem('wowcampus_token');
          console.log('🔍 토큰 확인:', token ? '있음 ✅' : '없음 ❌');
          
          if (!token) {
            console.log('로그인 토큰 없음 - 로그인 요구 메시지 표시');
            listContainer.innerHTML = \\\`
              <div class="text-center py-12">
                <div class="max-w-md mx-auto">
                  <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-lock text-yellow-600 text-2xl"></i>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h3>
                  <p class="text-gray-600 mb-6">
                    구직자 정보를 확인하려면 먼저 로그인해주세요.<br/>
                    회원이 아니시라면 무료로 회원가입하실 수 있습니다.
                  </p>
                  <div class="space-y-3">
                    <a href="/login?redirect=/jobseekers" class="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center">
                      <i class="fas fa-sign-in-alt mr-2"></i>로그인하기
                    </a>
                    <a href="/login?action=signup&redirect=/jobseekers" class="block w-full px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center">
                      <i class="fas fa-user-plus mr-2"></i>회원가입하기
                    </a>
                  </div>
                </div>
              </div>
            \\\`;
            return;
          }

          // 로그인되어 있으면 기존 loadJobSeekers 함수 호출 (index.tsx에 정의됨)
          console.log('✅ 로그인 상태 확인됨, 구직자 목록 로딩 시도...');
          
          // loadJobSeekers 함수가 준비될 때까지 대기
          function tryLoadJobSeekers(attempts = 0) {
            if (typeof window.loadJobSeekers === 'function') {
              console.log('✅ loadJobSeekers 함수 찾음, 실행 중...');
              window.loadJobSeekers();
            } else if (attempts < 10) {
              console.log(\`⏳ loadJobSeekers 함수 대기 중... (시도 \${attempts + 1}/10)\`);
              setTimeout(() => tryLoadJobSeekers(attempts + 1), 200);
            } else {
              console.error('❌ loadJobSeekers 함수를 찾을 수 없습니다 (10번 시도 후 포기)');
              listContainer.innerHTML = \`
                <div class="text-center py-12">
                  <div class="text-red-600 mb-4">
                    <i class="fas fa-exclamation-triangle text-4xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h3>
                  <p class="text-gray-600 mb-4">구직자 목록을 불러올 수 없습니다.</p>
                  <button onclick="location.reload()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    페이지 새로고침
                  </button>
                </div>
              \`;
            }
          }
          
          tryLoadJobSeekers();
        }
      `}}></script>
    </div>
  )

// Agents Dashboard page (에이전트 관리)
// 에이전트 전용 대시보드
}

// Middleware: optionalAuth
