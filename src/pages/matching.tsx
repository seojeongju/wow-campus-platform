/**
 * Page Component
 * Route: /matching
 * Original: src/index.tsx lines 12346-12973
 */

import type { Context } from 'hono'
import { REGIONS, VISA_TYPES, VISA_SPONSORSHIP_OPTIONS } from '../constants/options'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/jpeg;base64,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" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
            <a href="/home" class="text-blue-600 hover:text-blue-800">← 홈으로 돌아가기</a>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">🤖 AI 스마트 매칭 시스템</h1>
          <p class="text-gray-600 text-lg">인공지능이 분석하는 맞춤형 구인구직 매칭 서비스</p>
          <div class="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <i class="fas fa-check-circle mr-2"></i>
            실시간 서비스 운영 중
          </div>
        </div>

        {/* 매칭 시스템 선택 */}
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          {/* 구직자용 매칭 */}
          <div class="bg-white p-8 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-user-tie text-2xl text-purple-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-center">구직자 매칭</h3>
            <p class="text-gray-600 mb-6 text-center">내 프로필과 가장 잘 맞는 구인공고를 AI가 추천해드립니다</p>
            
            <div class="space-y-4">
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                스킬/경력 기반 매칭 (40점)
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                희망 지역 매칭 (25점)
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                경력 수준 매칭 (20점)
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                비자/급여 매칭 (15점)
              </div>
            </div>
            
            <div class="mt-6">
              {/* 검색 조건 섹션 */}
              <div class="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div class="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                  <i class="fas fa-search mr-2"></i>
                  검색 조건 (하나 이상 선택)
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">이름으로 검색 (선택)</label>
                    <div class="relative">
                      <input 
                        type="text" 
                        id="jobseeker-search" 
                        placeholder="🔍 구직자 이름 입력... (예: John, Maria)" 
                        class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        autocomplete="off"
                        oninput="filterJobseekers(this.value)"
                      />
                      <div id="jobseeker-suggestions" class="hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"></div>
                    </div>
                    <input type="hidden" id="jobseeker-select" value="" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">지역 (선택)</label>
                      <select id="jobseeker-location" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        {REGIONS.map(region => (
                          <option value={region.value}>{region.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">비자 상태 (선택)</label>
                      <select id="jobseeker-visa" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        {VISA_TYPES.map(visa => (
                          <option value={visa.value}>{visa.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 결과 표시 옵션 */}
              <div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <i class="fas fa-sliders-h mr-2"></i>
                  결과 표시 옵션
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">결과 개수</label>
                    <select id="jobseeker-limit" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="5">5개</option>
                      <option value="10" selected>10개</option>
                      <option value="20">20개</option>
                      <option value="50">50개</option>
                      <option value="999">전체</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">최소 점수</label>
                    <select id="jobseeker-minscore" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="0">제한 없음</option>
                      <option value="50" selected>50점 이상</option>
                      <option value="60">60점 이상</option>
                      <option value="70">70점 이상</option>
                      <option value="80">80점 이상</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">정렬</label>
                    <select id="jobseeker-sort" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="score-desc" selected>점수↓</option>
                      <option value="score-asc">점수↑</option>
                      <option value="name-asc">이름↓</option>
                      <option value="name-desc">이름↑</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button id="jobseeker-match-btn" onclick="findJobMatches()" class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                <i class="fas fa-search mr-2"></i>
                맞춤 구인공고 찾기
              </button>
            </div>
          </div>

          {/* 기업용 매칭 */}
          <div class="bg-white p-8 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-building text-2xl text-blue-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-center">기업 매칭</h3>
            <p class="text-gray-600 mb-6 text-center">구인공고 조건에 가장 적합한 구직자를 AI가 추천해드립니다</p>
            
            <div class="space-y-4">
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                요구 스킬 보유도 분석
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                지역 접근성 고려
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                경력 수준 적합성 평가
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                비자 상태/급여 기대치 매칭
              </div>
            </div>
            
            <div class="mt-6">
              {/* 검색 조건 섹션 */}
              <div class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <i class="fas fa-search mr-2"></i>
                  검색 조건 (하나 이상 선택)
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">회사명/포지션으로 검색 (선택)</label>
                    <div class="relative">
                      <input 
                        type="text" 
                        id="job-search" 
                        placeholder="🏢 회사명 또는 포지션 입력... (예: 삼성전자, Software Engineer)" 
                        class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autocomplete="off"
                        oninput="filterJobs(this.value)"
                      />
                      <div id="job-suggestions" class="hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"></div>
                    </div>
                    <input type="hidden" id="job-select" value="" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">지역 (선택)</label>
                      <select id="job-location" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {REGIONS.map(region => (
                          <option value={region.value}>{region.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">비자 요구사항 (선택)</label>
                      <select id="job-visa" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {VISA_SPONSORSHIP_OPTIONS.map(visa => (
                          <option value={visa.value}>{visa.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 결과 표시 옵션 */}
              <div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <i class="fas fa-sliders-h mr-2"></i>
                  결과 표시 옵션
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">결과 개수</label>
                    <select id="job-limit" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="5">5개</option>
                      <option value="10" selected>10개</option>
                      <option value="20">20개</option>
                      <option value="50">50개</option>
                      <option value="999">전체</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">최소 점수</label>
                    <select id="job-minscore" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="0">제한 없음</option>
                      <option value="50" selected>50점 이상</option>
                      <option value="60">60점 이상</option>
                      <option value="70">70점 이상</option>
                      <option value="80">80점 이상</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">정렬</label>
                    <select id="job-sort" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="score-desc" selected>점수↓</option>
                      <option value="score-asc">점수↑</option>
                      <option value="name-asc">이름↓</option>
                      <option value="name-desc">이름↑</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button id="job-match-btn" onclick="findJobseekerMatches()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-search mr-2"></i>
                적합한 구직자 찾기
              </button>
            </div>
          </div>
        </div>

        {/* 매칭 결과 영역 */}
        <div id="matching-results" class="hidden">
          <div class="bg-white rounded-lg shadow-sm border p-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-semibold text-gray-900">
                <i class="fas fa-chart-line text-green-600 mr-2"></i>
                매칭 결과
              </h3>
              <div id="matching-stats" class="text-sm text-gray-600">
                {/* 매칭 통계가 여기에 표시됩니다 */}
              </div>
            </div>
            
            <div id="matches-container">
              {/* 매칭 결과가 여기에 동적으로 로드됩니다 */}
            </div>
            
            <div class="text-center mt-8">
              <button onclick="clearResults()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                결과 지우기
              </button>
            </div>
          </div>
        </div>

        {/* 매칭 통계 */}
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-12">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-semibold mb-2">실시간 매칭 통계</h3>
            <p class="text-blue-100">AI 매칭 시스템의 현재 성과를 확인하세요</p>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6" id="matching-statistics">
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-matches">-</div>
              <div class="text-sm text-blue-100">총 매칭 생성</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-high-score">-</div>
              <div class="text-sm text-blue-100">고점수 매칭 (80+)</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-avg-score">-</div>
              <div class="text-sm text-blue-100">평균 매칭 점수</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-success-rate">-</div>
              <div class="text-sm text-blue-100">매칭 성공률</div>
            </div>
          </div>
        </div>

        {/* 매칭 알고리즘 설명 */}
        <div class="bg-white rounded-lg shadow-sm border p-8">
          <h3 class="text-xl font-semibold mb-6 text-center">
            <i class="fas fa-brain text-purple-600 mr-2"></i>
            AI 매칭 알고리즘 상세
          </h3>
          
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-cogs text-red-600"></i>
              </div>
              <h4 class="font-semibold mb-2">다차원 분석</h4>
              <p class="text-gray-600 text-sm">스킬, 경력, 위치, 비자, 급여 등 5가지 핵심 요소를 종합적으로 분석합니다.</p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-percentage text-yellow-600"></i>
              </div>
              <h4 class="font-semibold mb-2">정확한 점수화</h4>
              <p class="text-gray-600 text-sm">각 요소별 가중치를 적용하여 0-100점의 매칭 점수로 정확하게 평가합니다.</p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-bullseye text-green-600"></i>
              </div>
              <h4 class="font-semibold mb-2">맞춤형 추천</h4>
              <p class="text-gray-600 text-sm">높은 점수부터 정렬하여 가장 적합한 매칭을 우선적으로 추천합니다.</p>
            </div>
          </div>
          
          <div class="mt-8 p-6 bg-gray-50 rounded-lg">
            <div class="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h5 class="font-semibold text-gray-900 mb-3">매칭 기준 상세</h5>
                <ul class="space-y-2 text-gray-600">
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                    <strong>스킬 매칭 (40%):</strong> 요구스킬과 보유스킬 일치도
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <strong>지역 매칭 (25%):</strong> 근무지와 희망지역 접근성
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <strong>경력 매칭 (20%):</strong> 요구경력과 보유경력 적합성
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                    <strong>비자/급여 (15%):</strong> 비자지원 및 급여 기대치
                  </li>
                </ul>
              </div>
              <div>
                <h5 class="font-semibold text-gray-900 mb-3">점수 해석 가이드</h5>
                <ul class="space-y-2 text-gray-600">
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <strong>90-100점:</strong> 완벽한 매칭 (즉시 지원 추천)
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <strong>70-89점:</strong> 우수한 매칭 (적극 지원 권장)
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                    <strong>50-69점:</strong> 양호한 매칭 (검토 후 지원)
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-gray-400 rounded-full mr-3"></span>
                    <strong>50점 미만:</strong> 낮은 매칭 (신중 고려 필요)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* 매칭 시스템 JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // Toast 알림 시스템 (간단한 버전)
        const toast = {
          success: function(message) {
            console.log('[TOAST SUCCESS]', message);
            this.show(message, 'success');
          },
          error: function(message) {
            console.log('[TOAST ERROR]', message);
            this.show(message, 'error');
          },
          warning: function(message) {
            console.log('[TOAST WARNING]', message);
            this.show(message, 'warning');
          },
          info: function(message) {
            console.log('[TOAST INFO]', message);
            this.show(message, 'info');
          },
          show: function(message, type) {
            // 실제 알림은 alert으로 대체 (나중에 개선 가능)
            if (type === 'error') {
              alert('❌ ' + message);
            } else if (type === 'warning') {
              alert('⚠️ ' + message);
            } else if (type === 'success') {
              alert('✅ ' + message);
            } else {
              alert('ℹ️ ' + message);
            }
          }
        };
        
        let currentMatches = [];
        
        // 페이지 로드 시 초기화
        document.addEventListener('DOMContentLoaded', function() {
          loadJobseekers();
          loadJobs();
          loadMatchingStatistics();
        });
        
        // 실제 데이터 저장 변수
        let allJobseekers = [];
        let allJobs = [];
        
        // 구직자 목록 로드 (실제 API 호출)
        async function loadJobseekers() {
          try {
            console.log('[DEBUG] Fetching jobseekers from /api/matching/public/jobseekers');
            const response = await fetch('/api/matching/public/jobseekers?limit=100');
            console.log('[DEBUG] Response status:', response.status);
            console.log('[DEBUG] Response ok:', response.ok);
            
            if (!response.ok) {
              console.error('[DEBUG] HTTP error:', response.status, response.statusText);
              toast.error('구직자 목록을 불러오는데 실패했습니다. (HTTP ' + response.status + ')');
              return;
            }
            
            const result = await response.json();
            console.log('[DEBUG] API Response:', result);
            console.log('[DEBUG] Result success:', result.success);
            console.log('[DEBUG] Result data:', result.data);
            console.log('[DEBUG] Result data type:', typeof result.data);
            console.log('[DEBUG] Result data is array:', Array.isArray(result.data));
            console.log('[DEBUG] Result data length:', result.data ? result.data.length : 0);
            
            if (result.success) {
              allJobseekers = result.data || [];
              console.log('[DEBUG] Total jobseekers loaded:', allJobseekers.length);
              
              if (allJobseekers.length === 0) {
                console.log('[DEBUG] No jobseekers available');
                toast.info('등록된 구직자가 없습니다.');
              } else {
                console.log('[DEBUG] Jobseekers loaded successfully:', allJobseekers.length);
              }
            } else {
              console.error('[DEBUG] API returned success=false');
              toast.error(result.message || '구직자 목록을 불러오는데 실패했습니다.');
            }
          } catch (error) {
            console.error('[DEBUG] Error loading jobseekers:', error);
            console.error('[DEBUG] Error stack:', error.stack);
            toast.error('구직자 목록을 불러오는 중 오류가 발생했습니다: ' + error.message);
          }
        }
        
        // 구인공고 목록 로드 (실제 API 호출)
        async function loadJobs() {
          try {
            console.log('[DEBUG] Fetching jobs from /api/matching/public/jobs');
            const response = await fetch('/api/matching/public/jobs?limit=100');
            console.log('[DEBUG] Response status:', response.status);
            console.log('[DEBUG] Response ok:', response.ok);
            
            if (!response.ok) {
              console.error('[DEBUG] HTTP error:', response.status, response.statusText);
              toast.error('구인공고 목록을 불러오는데 실패했습니다. (HTTP ' + response.status + ')');
              return;
            }
            
            const result = await response.json();
            console.log('[DEBUG] API Response:', result);
            console.log('[DEBUG] Result success:', result.success);
            console.log('[DEBUG] Result data:', result.data);
            console.log('[DEBUG] Result data type:', typeof result.data);
            console.log('[DEBUG] Result data is array:', Array.isArray(result.data));
            console.log('[DEBUG] Result data length:', result.data ? result.data.length : 0);
            
            if (result.success) {
              allJobs = result.data || [];
              console.log('[DEBUG] Total jobs loaded:', allJobs.length);
              
              if (allJobs.length === 0) {
                console.log('[DEBUG] No jobs available');
                toast.info('등록된 구인공고가 없습니다.');
              } else {
                console.log('[DEBUG] Jobs loaded successfully:', allJobs.length);
              }
            } else {
              console.error('[DEBUG] API returned success=false');
              toast.error(result.message || '구인공고 목록을 불러오는데 실패했습니다.');
            }
          } catch (error) {
            console.error('[DEBUG] Error loading jobs:', error);
            console.error('[DEBUG] Error stack:', error.stack);
            toast.error('구인공고 목록을 불러오는 중 오류가 발생했습니다: ' + error.message);
          }
        }
        
        // 매칭 점수 계산과 이유 생성은 백엔드 API에서 처리됨
        
        // 구직자 매칭 찾기 (실제 API 호출)
        async function findJobMatches() {
          const jobseekerId = document.getElementById('jobseeker-select').value;
          const location = document.getElementById('jobseeker-location').value;
          const visa = document.getElementById('jobseeker-visa').value;
          
          console.log('[DEBUG] findJobMatches() called');
          console.log('[DEBUG] - jobseekerId:', jobseekerId);
          console.log('[DEBUG] - location:', location);
          console.log('[DEBUG] - visa:', visa);
          
          // 최소 하나의 조건이 필요
          if (!jobseekerId && !location && !visa) {
            toast.warning('최소 하나의 검색 조건을 선택해주세요.');
            return;
          }
          
          showLoading(true, 'jobseeker');
          
          try {
            let matches = [];
            
            if (jobseekerId) {
              // 특정 구직자 기반 매칭 (기존 로직)
              const url = '/api/matching/jobs/' + jobseekerId;
              console.log('[DEBUG] Fetching URL:', url);
              const response = await fetch(url);
              const result = await response.json();
              
              if (result.success && result.data) {
                matches = result.data.matches || [];
              }
            } else {
              // 조건 기반 전체 검색 (새로운 로직)
              console.log('[DEBUG] Filtering all jobs by conditions');
              matches = allJobs.filter(job => {
                // 지역 필터
                if (location && job.location) {
                  if (!job.location.toLowerCase().includes(location.toLowerCase())) {
                    return false;
                  }
                }
                
                // 비자 필터
                if (visa) {
                  if (visa === 'sponsorship') {
                    if (!job.visa_sponsorship) return false;
                  }
                }
                
                return true;
              }).map(job => ({
                ...job,
                matching_score: 75, // 기본 점수 (실제 구직자 정보 없으므로)
                match_reasons: ['조건 기반 검색']
              }));
            }
            
            console.log('[DEBUG] Total matches found:', matches.length);
            
            const data = {
              matches: matches,
              total_matches: matches.length,
              average_score: matches.length > 0 
                ? Math.round(matches.reduce((sum, m) => sum + m.matching_score, 0) / matches.length)
                : 0
            };
            
            displayMatches(data, 'jobseeker');
            toast.success('매칭 분석이 완료되었습니다!');
          } catch (error) {
            console.error('Error finding job matches:', error);
            toast.error('매칭 분석 중 오류가 발생했습니다.');
          } finally {
            showLoading(false, 'jobseeker');
          }
        }
        
        // 기업 매칭 찾기 (실제 API 호출)
        async function findJobseekerMatches() {
          const jobId = document.getElementById('job-select').value;
          const location = document.getElementById('job-location').value;
          const visa = document.getElementById('job-visa').value;
          
          console.log('[DEBUG] findJobseekerMatches() called');
          console.log('[DEBUG] - jobId:', jobId);
          console.log('[DEBUG] - location:', location);
          console.log('[DEBUG] - visa:', visa);
          
          // 최소 하나의 조건이 필요
          if (!jobId && !location && !visa) {
            toast.warning('최소 하나의 검색 조건을 선택해주세요.');
            return;
          }
          
          showLoading(true, 'job');
          
          try {
            let matches = [];
            
            if (jobId) {
              // 특정 구인공고 기반 매칭 (기존 로직)
              const url = '/api/matching/jobseekers/' + jobId;
              console.log('[DEBUG] Fetching URL:', url);
              const response = await fetch(url);
              const result = await response.json();
              
              if (result.success && result.data) {
                matches = result.data.matches || [];
              }
            } else {
              // 조건 기반 전체 검색 (새로운 로직)
              console.log('[DEBUG] Filtering all jobseekers by conditions');
              matches = allJobseekers.filter(jobseeker => {
                // 지역 필터
                if (location && jobseeker.preferred_location) {
                  if (!jobseeker.preferred_location.toLowerCase().includes(location.toLowerCase())) {
                    return false;
                  }
                }
                
                // 비자 필터
                if (visa) {
                  if (visa === 'sponsorship') {
                    // 비자 스폰서십 필요 없는 사람들 (F-2, F-4, F-5, F-6 보유자)
                    const validVisas = ['F-2', 'F-4', 'F-5', 'F-6'];
                    if (!validVisas.includes(jobseeker.visa_status)) {
                      return false;
                    }
                  } else {
                    // 특정 비자 타입
                    if (jobseeker.visa_status !== visa) {
                      return false;
                    }
                  }
                }
                
                return true;
              }).map(jobseeker => ({
                ...jobseeker,
                matching_score: 75, // 기본 점수 (실제 구인공고 정보 없으므로)
                match_reasons: ['조건 기반 검색']
              }));
            }
            
            console.log('[DEBUG] Total matches found:', matches.length);
            
            const data = {
              matches: matches,
              total_matches: matches.length,
              average_score: matches.length > 0 
                ? Math.round(matches.reduce((sum, m) => sum + m.matching_score, 0) / matches.length)
                : 0
            };
            
            displayMatches(data, 'job');
            toast.success('매칭 분석이 완료되었습니다!');
          } catch (error) {
            console.error('Error finding jobseeker matches:', error);
            toast.error('매칭 분석 중 오류가 발생했습니다.');
          } finally {
            showLoading(false, 'job');
          }
        }
        
        // 매칭 결과 표시
        function displayMatches(data, type) {
          console.log('[DEBUG] displayMatches() called');
          console.log('[DEBUG] - type parameter:', type);
          console.log('[DEBUG] - data:', data);
          console.log('[DEBUG] - matches count:', data.matches ? data.matches.length : 0);
          
          let matches = data.matches || [];
          
          // 사용자 설정 가져오기
          const limitSelect = type === 'jobseeker' ? 'jobseeker-limit' : 'job-limit';
          const minScoreSelect = type === 'jobseeker' ? 'jobseeker-minscore' : 'job-minscore';
          const sortSelect = type === 'jobseeker' ? 'jobseeker-sort' : 'job-sort';
          const locationSelect = type === 'jobseeker' ? 'jobseeker-location' : 'job-location';
          const visaSelect = type === 'jobseeker' ? 'jobseeker-visa' : 'job-visa';
          
          const limit = parseInt(document.getElementById(limitSelect).value);
          const minScore = parseInt(document.getElementById(minScoreSelect).value);
          const sortType = document.getElementById(sortSelect).value;
          const location = document.getElementById(locationSelect).value;
          const visa = document.getElementById(visaSelect).value;
          
          console.log('[DEBUG] User settings:', { limit, minScore, sortType, location, visa });
          
          // 1. 최소 점수 필터링
          if (minScore > 0) {
            matches = matches.filter(m => m.matching_score >= minScore);
            console.log('[DEBUG] After min score filter:', matches.length);
          }
          
          // 1-1. 지역 필터링
          if (location) {
            matches = matches.filter(m => {
              if (type === 'jobseeker') {
                // 구인공고의 location 필터링
                return m.location && m.location.toLowerCase().includes(location.toLowerCase());
              } else {
                // 구직자의 preferred_location 필터링
                const preferredLoc = m.preferred_location || '';
                return preferredLoc.toLowerCase().includes(location.toLowerCase());
              }
            });
            console.log('[DEBUG] After location filter:', matches.length);
          }
          
          // 1-2. 비자 필터링
          if (visa) {
            matches = matches.filter(m => {
              if (type === 'jobseeker') {
                // 구인공고: 비자 스폰서십 또는 구직자 비자 상태
                if (visa === 'sponsorship') {
                  return m.visa_sponsorship === 1 || m.visa_sponsorship === true;
                }
                // 특정 비자 타입 (사실 구인공고에는 해당 없음, 구직자 데이터에서 필터링)
                return true;
              } else {
                // 구직자의 visa_status 필터링
                return m.visa_status && m.visa_status === visa;
              }
            });
            console.log('[DEBUG] After visa filter:', matches.length);
          }
          
          // 2. 정렬
          if (sortType === 'score-desc') {
            matches.sort((a, b) => b.matching_score - a.matching_score);
          } else if (sortType === 'score-asc') {
            matches.sort((a, b) => a.matching_score - b.matching_score);
          } else if (sortType === 'name-asc') {
            matches.sort((a, b) => {
              const nameA = type === 'jobseeker' ? (a.title || '') : (a.name || a.first_name || '');
              const nameB = type === 'jobseeker' ? (b.title || '') : (b.name || b.first_name || '');
              return nameA.localeCompare(nameB);
            });
          } else if (sortType === 'name-desc') {
            matches.sort((a, b) => {
              const nameA = type === 'jobseeker' ? (a.title || '') : (a.name || a.first_name || '');
              const nameB = type === 'jobseeker' ? (b.title || '') : (b.name || b.first_name || '');
              return nameB.localeCompare(nameA);
            });
          }
          console.log('[DEBUG] After sorting:', sortType);
          
          // 3. 결과 개수 제한
          const limitedMatches = limit >= 999 ? matches : matches.slice(0, limit);
          console.log('[DEBUG] Final display count:', limitedMatches.length);
          
          currentMatches = limitedMatches;
          
          const resultsDiv = document.getElementById('matching-results');
          const statsDiv = document.getElementById('matching-stats');
          const containerDiv = document.getElementById('matches-container');
          
          // 결과 타입에 따른 헤더 표시
          console.log('[DEBUG] Determining header based on type:', type);
          const resultTypeHeader = type === 'jobseeker' 
            ? '<div class="mb-6 pb-4 border-b-2 border-purple-200">' +
              '<h3 class="text-2xl font-bold text-purple-600 flex items-center">' +
                '<i class="fas fa-briefcase mr-3"></i>' +
                '추천 구인공고 목록' +
              '</h3>' +
              '<p class="text-sm text-gray-600 mt-2">선택하신 구직자에게 적합한 구인공고입니다</p>' +
              '</div>'
            : '<div class="mb-6 pb-4 border-b-2 border-blue-200">' +
              '<h3 class="text-2xl font-bold text-blue-600 flex items-center">' +
                '<i class="fas fa-users mr-3"></i>' +
                '추천 구직자 목록' +
              '</h3>' +
              '<p class="text-sm text-gray-600 mt-2">선택하신 구인공고에 적합한 구직자입니다</p>' +
              '</div>';
          
          console.log('[DEBUG] Header HTML generated');
          
          // 필터링된 결과 통계 계산
          const filteredTotal = limitedMatches.length;
          const filteredAvg = filteredTotal > 0 
            ? Math.round(limitedMatches.reduce((sum, m) => sum + m.matching_score, 0) / filteredTotal)
            : 0;
          
          // 통계 정보 표시
          statsDiv.innerHTML = 
            '<div class="flex items-center space-x-4 text-sm">' +
              '<span><i class="fas fa-list-ol mr-1"></i>표시: ' + filteredTotal + '개</span>' +
              '<span class="text-gray-400">/ 전체: ' + (data.total_matches || 0) + '개</span>' +
              '<span><i class="fas fa-chart-bar mr-1"></i>평균 ' + filteredAvg + '점</span>' +
              '<span><i class="fas fa-clock mr-1"></i>' + new Date().toLocaleTimeString() + '</span>' +
            '</div>';
          
          // 매칭 결과 표시
          if (currentMatches.length === 0) {
            containerDiv.innerHTML = 
              resultTypeHeader +
              '<div class="text-center py-12">' +
                '<i class="fas fa-search text-6xl text-gray-300 mb-4"></i>' +
                '<h3 class="text-lg font-semibold text-gray-500 mb-2">매칭 결과가 없습니다</h3>' +
                '<p class="text-gray-400">조건을 조정하여 다시 시도해보세요.</p>' +
              '</div>';
          } else {
            // 간단한 매칭 결과 표시
            let resultsHtml = resultTypeHeader + '<div class="space-y-4">';
            
            currentMatches.slice(0, 10).forEach((match, index) => {
              console.log('[DEBUG] Processing match #' + index, match);
              console.log('[DEBUG] - type:', type);
              console.log('[DEBUG] - match.title:', match.title);
              console.log('[DEBUG] - match.name:', match.name);
              console.log('[DEBUG] - match.first_name:', match.first_name);
              console.log('[DEBUG] - match.last_name:', match.last_name);
              console.log('[DEBUG] - match.company_name:', match.company_name);
              
              const scoreColor = match.matching_score >= 90 ? 'text-green-600' : 
                                match.matching_score >= 70 ? 'text-blue-600' : 
                                match.matching_score >= 50 ? 'text-yellow-600' : 'text-gray-600';
              
              let title;
              if (type === 'jobseeker') {
                // 구직자를 위한 구인공고 매칭
                title = match.title + ' - ' + (match.company_name || '회사명 미상');
                console.log('[DEBUG] Jobseeker mode - showing job:', title);
              } else {
                // 기업을 위한 구직자 매칭
                const name = match.name || (match.first_name && match.last_name ? match.first_name + ' ' + match.last_name : '이름 미상');
                title = name + ' (' + (match.nationality || '국적미상') + ')';
                console.log('[DEBUG] Job mode - showing jobseeker:', title);
              }
                
              resultsHtml += 
                '<div class="border rounded-lg p-6 hover:shadow-md transition-shadow">' +
                  '<div class="flex items-center justify-between mb-4">' +
                    '<h4 class="text-lg font-semibold">#' + (index + 1) + ' ' + title + '</h4>' +
                    '<div class="text-right">' +
                      '<div class="text-2xl font-bold ' + scoreColor + '">' + match.matching_score + '점</div>' +
                      '<div class="text-xs text-gray-500">매칭 점수</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="text-sm text-gray-600">' +
                    '<div>매칭 이유: ' + (match.match_reasons ? match.match_reasons.join(', ') : '분석중') + '</div>' +
                  '</div>' +
                '</div>';
            });
            
            resultsHtml += '</div>';
            containerDiv.innerHTML = resultsHtml;
          }
          
          resultsDiv.classList.remove('hidden');
          resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 점수 색상 결정
        function getScoreColor(score) {
          if (score >= 90) return 'text-green-600';
          if (score >= 70) return 'text-blue-600';
          if (score >= 50) return 'text-yellow-600';
          return 'text-gray-600';
        }
        
        // 점수 바 생성
        function getScoreBar(score) {
          const color = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-gray-400';
          return '<div class="flex items-center space-x-2">' +
                   '<span class="text-xs text-gray-500">적합도</span>' +
                   '<div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">' +
                     '<div class="h-full ' + color + '" style="width: ' + Math.min(score, 100) + '%"></div>' +
                   '</div>' +
                   '<span class="text-xs font-medium">' + score + '%</span>' +
                 '</div>';
        }
        
        // 급여 포맷팅
        function formatSalary(min, max) {
          if (!min && !max) return '급여 미상';
          if (min && max) return min + '-' + max + '만원';
          if (min) return min + '만원 이상';
          if (max) return max + '만원 이하';
          return '급여 미상';
        }
        
        // 결과 지우기
        function clearResults() {
          document.getElementById('matching-results').classList.add('hidden');
          document.getElementById('jobseeker-select').value = '';
          document.getElementById('job-select').value = '';
          currentMatches = [];
        }
        
        // 로딩 상태 표시
        function showLoading(show, buttonType) {
          console.log('[DEBUG] showLoading called:', { show, buttonType });
          
          let button;
          let originalText;
          
          if (buttonType === 'jobseeker') {
            button = document.getElementById('jobseeker-match-btn');
            originalText = '<i class="fas fa-search mr-2"></i>맞춤 구인공고 찾기';
          } else if (buttonType === 'job') {
            button = document.getElementById('job-match-btn');
            originalText = '<i class="fas fa-search mr-2"></i>적합한 구직자 찾기';
          }
          
          if (button) {
            button.disabled = show;
            if (show) {
              button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>분석 중...';
            } else {
              button.innerHTML = originalText;
            }
          }
        }
        
        // 매칭 통계 로드 (실제 API 호출)
        async function loadMatchingStatistics() {
          try {
            const response = await fetch('/api/matching/statistics');
            const result = await response.json();
            
            if (result.success && result.data) {
              const stats = result.data;
              document.getElementById('stat-matches').textContent = stats.total_matches || 0;
              document.getElementById('stat-high-score').textContent = stats.high_score_matches || 0;
              document.getElementById('stat-avg-score').textContent = (stats.average_score || 0) + '점';
              document.getElementById('stat-success-rate').textContent = (stats.success_rate || 0) + '%';
            } else {
              // API 실패 시 기본값 표시
              document.getElementById('stat-matches').textContent = '-';
              document.getElementById('stat-high-score').textContent = '-';
              document.getElementById('stat-avg-score').textContent = '-';
              document.getElementById('stat-success-rate').textContent = '-';
            }
          } catch (error) {
            console.error('Error loading statistics:', error);
            // 오류 시 기본값 표시
            document.getElementById('stat-matches').textContent = '-';
            document.getElementById('stat-high-score').textContent = '-';
            document.getElementById('stat-avg-score').textContent = '-';
            document.getElementById('stat-success-rate').textContent = '-';
          }
        }
        
        // 구직자 검색 필터 함수
        function filterJobseekers(searchText) {
          const suggestionsDiv = document.getElementById('jobseeker-suggestions');
          const hiddenInput = document.getElementById('jobseeker-select');
          
          if (!searchText || searchText.trim() === '') {
            suggestionsDiv.classList.add('hidden');
            hiddenInput.value = '';
            return;
          }
          
          const filtered = allJobseekers.filter(jobseeker => {
            const name = jobseeker.name || (jobseeker.first_name + ' ' + jobseeker.last_name);
            const nationality = jobseeker.nationality || '';
            const major = jobseeker.major || '';
            const searchLower = searchText.toLowerCase();
            
            return name.toLowerCase().includes(searchLower) ||
                   nationality.toLowerCase().includes(searchLower) ||
                   major.toLowerCase().includes(searchLower);
          });
          
          if (filtered.length === 0) {
            suggestionsDiv.innerHTML = '<div class="p-3 text-gray-500 text-sm">검색 결과가 없습니다</div>';
            suggestionsDiv.classList.remove('hidden');
            hiddenInput.value = '';
          } else {
            let html = '';
            filtered.slice(0, 10).forEach(jobseeker => {
              const name = jobseeker.name || (jobseeker.first_name + ' ' + jobseeker.last_name);
              const nationality = jobseeker.nationality || '국적미상';
              const major = jobseeker.major || '전공미상';
              
              html += '<div class="p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100" onclick="selectJobseeker(' + jobseeker.id + ', \\'' + name.replace(/'/g, "\\\\'") + '\\', \\'' + nationality.replace(/'/g, "\\\\'") + '\\', \\'' + major.replace(/'/g, "\\\\'") + '\\')">' +
                '<div class="font-medium text-gray-900">' + name + '</div>' +
                '<div class="text-sm text-gray-600">' + nationality + ' • ' + major + '</div>' +
              '</div>';
            });
            
            suggestionsDiv.innerHTML = html;
            suggestionsDiv.classList.remove('hidden');
          }
        }
        
        // 구직자 선택
        function selectJobseeker(id, name, nationality, major) {
          document.getElementById('jobseeker-search').value = name + ' (' + nationality + ') - ' + major;
          document.getElementById('jobseeker-select').value = id;
          document.getElementById('jobseeker-suggestions').classList.add('hidden');
          console.log('[DEBUG] Selected jobseeker:', id, name);
        }
        
        // 구인공고 검색 필터 함수
        function filterJobs(searchText) {
          const suggestionsDiv = document.getElementById('job-suggestions');
          const hiddenInput = document.getElementById('job-select');
          
          if (!searchText || searchText.trim() === '') {
            suggestionsDiv.classList.add('hidden');
            hiddenInput.value = '';
            return;
          }
          
          const filtered = allJobs.filter(job => {
            const title = job.title || '';
            const companyName = job.company_name || '';
            const location = job.location || '';
            const searchLower = searchText.toLowerCase();
            
            return title.toLowerCase().includes(searchLower) ||
                   companyName.toLowerCase().includes(searchLower) ||
                   location.toLowerCase().includes(searchLower);
          });
          
          if (filtered.length === 0) {
            suggestionsDiv.innerHTML = '<div class="p-3 text-gray-500 text-sm">검색 결과가 없습니다</div>';
            suggestionsDiv.classList.remove('hidden');
            hiddenInput.value = '';
          } else {
            let html = '';
            filtered.slice(0, 10).forEach(job => {
              const title = job.title || '제목없음';
              const companyName = job.company_name || '회사명 미상';
              const location = job.location || '위치 미상';
              
              html += '<div class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100" onclick="selectJob(' + job.id + ', \\'' + title.replace(/'/g, "\\\\'") + '\\', \\'' + companyName.replace(/'/g, "\\\\'") + '\\', \\'' + location.replace(/'/g, "\\\\'") + '\\')">' +
                '<div class="font-medium text-gray-900">' + title + '</div>' +
                '<div class="text-sm text-gray-600">' + companyName + ' • ' + location + '</div>' +
              '</div>';
            });
            
            suggestionsDiv.innerHTML = html;
            suggestionsDiv.classList.remove('hidden');
          }
        }
        
        // 구인공고 선택
        function selectJob(id, title, companyName, location) {
          document.getElementById('job-search').value = title + ' - ' + companyName + ' (' + location + ')';
          document.getElementById('job-select').value = id;
          document.getElementById('job-suggestions').classList.add('hidden');
          console.log('[DEBUG] Selected job:', id, title);
        }
        
        // 검색창 외부 클릭 시 자동완성 닫기
        document.addEventListener('click', function(e) {
          if (!e.target.closest('#jobseeker-search') && !e.target.closest('#jobseeker-suggestions')) {
            document.getElementById('jobseeker-suggestions').classList.add('hidden');
          }
          if (!e.target.closest('#job-search') && !e.target.closest('#job-suggestions')) {
            document.getElementById('job-suggestions').classList.add('hidden');
          }
        });
      `}}></script>
    </div>
  )
}
