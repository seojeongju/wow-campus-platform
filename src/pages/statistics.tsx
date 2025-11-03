/**
 * Page Component
 * Route: /statistics
 * Original: src/index.tsx lines 11082-11726
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../middleware/auth'

export const handler = (c: Context) => {
const user = c.get('user');
  
  // 비로그인 사용자나 관리자가 아닌 사용자는 로그인 유도 페이지 표시
  if (!user || user.user_type !== 'admin') {
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

        {/* 관리자 전용 접근 제한 메시지 */}
        <main class="container mx-auto px-4 py-16">
          <div class="max-w-2xl mx-auto text-center">
            <div class="bg-white rounded-xl shadow-lg p-12">
              {/* 아이콘과 제목 */}
              <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <i class="fas fa-chart-line text-red-600 text-3xl"></i>
              </div>
              
              <h1 class="text-3xl font-bold text-gray-900 mb-4">📊 통계 대시보드</h1>
              <h2 class="text-xl font-semibold text-red-600 mb-6">관리자 전용 페이지입니다</h2>
              
              <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <p class="text-gray-700 text-lg leading-relaxed mb-4">
                  이 페이지는 <strong class="text-red-600">관리자만 접근할 수 있는</strong> 통계 대시보드입니다.<br/>
                  플랫폼의 종합적인 운영 현황과 성과 분석 데이터를 제공합니다.
                </p>
                
                <div class="grid md:grid-cols-2 gap-4 mt-6">
                  <div class="text-left">
                    <h3 class="font-semibold text-gray-900 mb-2">📈 제공되는 통계 정보:</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                      <li>• 실시간 구인/구직 현황</li>
                      <li>• AI스마트매칭 성공률 분석</li>
                      <li>• 지역별/국가별 통계</li>
                      <li>• 월별 활동 추이</li>
                    </ul>
                  </div>
                  <div class="text-left">
                    <h3 class="font-semibold text-gray-900 mb-2">🔐 접근 권한:</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                      <li>• 시스템 관리자</li>
                      <li>• 플랫폼 운영진</li>
                      <li>• 승인된 분석 담당자</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* 로그인 유도 */}
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">관리자 계정으로 로그인해주세요</h3>
                  <div class="space-y-3">
                    <button onclick="showLoginModal()" class="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
                      <i class="fas fa-sign-in-alt mr-3"></i>관리자 로그인
                    </button>
                    <p class="text-sm text-gray-500">
                      관리자 계정이 없으시다면 시스템 관리자에게 문의하세요
                    </p>
                  </div>
                </div>
                
                {/* 대안 페이지 안내 */}
                <div class="border-t border-gray-200 pt-6 mt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 대신 이런 페이지는 어떠세요?</h3>
                  <div class="grid md:grid-cols-3 gap-4">
                    <a href="/jobs" class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-briefcase text-blue-600"></i>
                      </div>
                      <div class="text-left">
                        <p class="font-medium text-gray-900">구인정보</p>
                        <p class="text-xs text-gray-500">최신 채용공고</p>
                      </div>
                    </a>
                    
                    <a href="/jobseekers" class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
                      <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user-tie text-green-600"></i>
                      </div>
                      <div class="text-left">
                        <p class="font-medium text-gray-900">구직정보</p>
                        <p class="text-xs text-gray-500">인재 프로필</p>
                      </div>
                    </a>
                    
                    <a href="/matching" class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
                      <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-magic text-purple-600"></i>
                      </div>
                      <div class="text-left">
                        <p class="font-medium text-gray-900">AI스마트매칭</p>
                        <p class="text-xs text-gray-500">AI스마트매칭</p>
                      </div>
                    </a>
                  </div>
                </div>
                
                <div class="mt-6">
                  <a href="/" class="text-blue-600 hover:text-blue-800 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>메인 페이지로 돌아가기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // 관리자인 경우 정상 통계 페이지 표시
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            
            <div id="auth-buttons-container" class="flex items-center space-x-3">
              {/* 동적 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">📊 실시간 통계 대시보드</h1>
            <p class="text-gray-600 text-lg">플랫폼 운영 현황과 성과를 종합적으로 분석합니다</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <i class="fas fa-circle text-green-500 animate-pulse"></i>
              <span>실시간 업데이트</span>
            </div>
            <select id="period-selector" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="7">최근 7일</option>
              <option value="30" selected>최근 30일</option>
              <option value="90">최근 90일</option>
              <option value="365">1년</option>
            </select>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm font-medium">총 구인공고</p>
                <p class="text-3xl font-bold" id="total-jobs">156</p>
                <div class="flex items-center mt-2">
                  <i class="fas fa-arrow-up text-green-300 mr-1"></i>
                  <span class="text-green-300 text-sm">+12% 이번 달</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-blue-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <i class="fas fa-briefcase text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm font-medium">등록 구직자</p>
                <p class="text-3xl font-bold" id="total-jobseekers">2,348</p>
                <div class="flex items-center mt-2">
                  <i class="fas fa-arrow-up text-green-300 mr-1"></i>
                  <span class="text-green-300 text-sm">+8% 이번 달</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-green-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <i class="fas fa-users text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm font-medium">성공 AI스마트매칭</p>
                <p class="text-3xl font-bold" id="successful-matches">89</p>
                <div class="flex items-center mt-2">
                  <i class="fas fa-arrow-up text-purple-300 mr-1"></i>
                  <span class="text-purple-300 text-sm">+23% 이번 달</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-purple-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <i class="fas fa-handshake text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm font-medium">참여 기업</p>
                <p class="text-3xl font-bold" id="total-companies">47</p>
                <div class="flex items-center mt-2">
                  <i class="fas fa-arrow-up text-orange-300 mr-1"></i>
                  <span class="text-orange-300 text-sm">+15% 이번 달</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-orange-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <i class="fas fa-building text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Charts Section */}
        <div class="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Monthly Trends Chart */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900">월별 활동 추이</h3>
              <div class="flex space-x-2">
                <button class="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md font-medium">구인공고</button>
                <button class="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">구직자</button>
                <button class="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">AI스마트매칭</button>
              </div>
            </div>
            <div class="relative h-80">
              <canvas id="monthly-chart"></canvas>
            </div>
          </div>

          {/* Country Distribution Chart */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900">구직자 국가별 분포</h3>
              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                <i class="fas fa-download mr-1"></i>내보내기
              </button>
            </div>
            <div class="relative h-80">
              <canvas id="country-chart"></canvas>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div class="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Industry Breakdown */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">분야별 구인 현황</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span class="text-gray-700">IT/소프트웨어</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">42</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-16 h-full bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span class="text-gray-700">마케팅/영업</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">28</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-12 h-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <span class="text-gray-700">디자인</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">23</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-10 h-full bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                  <span class="text-gray-700">교육</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">19</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-8 h-full bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <span class="text-gray-700">기타</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-900 font-medium mr-2">44</span>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="w-14 h-full bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Analytics */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">지역별 활동 현황</h3>
            <div class="relative h-64">
              <canvas id="region-chart"></canvas>
            </div>
          </div>

          {/* Performance Metrics */}
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">핵심 성과 지표</h3>
            <div class="space-y-6">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-700">AI스마트매칭 성공률</span>
                  <span class="text-green-600 font-bold">87%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style="width: 87%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-700">사용자 만족도</span>
                  <span class="text-blue-600 font-bold">92%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style="width: 92%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-700">평균 AI스마트매칭 시간</span>
                  <span class="text-purple-600 font-bold">3.2일</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full" style="width: 75%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-700">활성 사용자 비율</span>
                  <span class="text-orange-600 font-bold">78%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full" style="width: 78%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">최근 활동</h3>
            <div class="flex space-x-2">
              <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">전체</button>
              <button class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">AI스마트매칭</button>
              <button class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">신규가입</button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활동</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2분 전</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">새로운 AI스마트매칭 성공</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">김민수 → 삼성전자</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">성공</span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5분 전</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">신규 구인공고 등록</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">네이버 - UX Designer</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">활성</span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12분 전</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">새로운 구직자 가입</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Maria Garcia (스페인)</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">승인대기</span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18분 전</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">AI스마트매칭 분석 완료</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">시스템</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">완료</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Chart.js and Statistics JavaScript */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.js"></script>
      <script dangerouslySetInnerHTML={{__html: `
        // 페이지 로드 시 차트 초기화
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(function() {
            if (typeof Chart !== 'undefined') {
              initializeCharts();
              updateRealTimeData();
              
              // 5초마다 데이터 업데이트
              setInterval(updateRealTimeData, 5000);
            } else {
              console.error('Chart.js not loaded');
            }
          }, 1000);
        });

        // 차트 초기화 함수
        function initializeCharts() {
          // 월별 활동 추이 차트
          const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
          new Chart(monthlyCtx, {
            type: 'line',
            data: {
              labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월'],
              datasets: [{
                label: '구인공고',
                data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 42],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              }, {
                label: '구직자',
                data: [65, 78, 90, 95, 120, 140, 165, 180, 200, 235],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
              }, {
                label: 'AI스마트매칭 성공',
                data: [5, 8, 12, 15, 18, 25, 28, 32, 38, 45],
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }
          });

          // 국가별 분포 차트 (도넛 차트)
          const countryCtx = document.getElementById('country-chart').getContext('2d');
          new Chart(countryCtx, {
            type: 'doughnut',
            data: {
              labels: ['베트남', '중국', '필리핀', '미국', '일본', '태국', '기타'],
              datasets: [{
                data: [380, 290, 235, 180, 145, 120, 98],
                backgroundColor: [
                  '#EF4444',
                  '#F97316', 
                  '#EAB308',
                  '#22C55E',
                  '#06B6D4',
                  '#8B5CF6',
                  '#6B7280'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right'
                }
              }
            }
          });

          // 지역별 현황 차트 (바 차트)
          const regionCtx = document.getElementById('region-chart').getContext('2d');
          new Chart(regionCtx, {
            type: 'bar',
            data: {
              labels: ['서울', '경기', '부산', '대구', '인천', '광주', '대전'],
              datasets: [{
                label: '구인공고',
                data: [85, 42, 28, 18, 15, 12, 10],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }
          });
        }

        // 실시간 데이터 업데이트
        function updateRealTimeData() {
          // KPI 카드 애니메이션 업데이트
          animateValue('total-jobs', 156, 3);
          animateValue('total-jobseekers', 2348, 12);
          animateValue('successful-matches', 89, 2);
          animateValue('total-companies', 47, 1);
        }

        // 숫자 애니메이션 함수
        function animateValue(id, target, variance) {
          const element = document.getElementById(id);
          const current = parseInt(element.textContent);
          const change = Math.floor(Math.random() * variance * 2) - variance;
          const newValue = Math.max(0, current + change);
          
          if (newValue !== current) {
            element.textContent = newValue.toLocaleString();
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
              element.style.transform = 'scale(1)';
            }, 200);
          }
        }

        // 기간 선택 변경 이벤트
        document.getElementById('period-selector').addEventListener('change', function(e) {
          const period = e.target.value;
          console.log('기간 변경:', period + '일');
          // 실제로는 새로운 데이터를 로드하고 차트를 업데이트
        });
      `}}></script>
    </div>
  )

// Main page
}

// Middleware: optionalAuth
