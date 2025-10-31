/**
 * Page Component
 * Route: /matching
 * Original: src/index.tsx lines 12346-12973
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
            </a>
            <a href="/" class="text-blue-600 hover:text-blue-800">← 홈으로 돌아가기</a>
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
                스킬 & 경력 기반 매칭 (40점)
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
                비자 & 급여 매칭 (15점)
              </div>
            </div>
            
            <div class="mt-6">
              <select id="jobseeker-select" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">구직자를 선택하세요</option>
              </select>
              <button onclick="findJobMatches()" class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
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
                비자 상태 & 급여 기대치 매칭
              </div>
            </div>
            
            <div class="mt-6">
              <select id="job-select" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">구인공고를 선택하세요</option>
              </select>
              <button onclick="findJobseekerMatches()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
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
                    <strong>비자&급여 (15%):</strong> 비자지원 및 급여 기대치
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
      <script>{`
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
              
              const select = document.getElementById('jobseeker-select');
              select.innerHTML = '<option value="">구직자를 선택하세요</option>';
              
              if (allJobseekers.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = '등록된 구직자가 없습니다';
                option.disabled = true;
                select.appendChild(option);
                console.log('[DEBUG] No jobseekers available');
                toast.info('등록된 구직자가 없습니다.');
              } else {
                allJobseekers.forEach(jobseeker => {
                  const option = document.createElement('option');
                  option.value = jobseeker.id;
                  const name = jobseeker.name || (jobseeker.first_name + ' ' + jobseeker.last_name);
                  const nationality = jobseeker.nationality || '국적미상';
                  const major = jobseeker.major || '전공미상';
                  option.textContent = name + ' (' + nationality + ') - ' + major;
                  select.appendChild(option);
                  console.log('[DEBUG] Added option:', option.textContent);
                });
                console.log('[DEBUG] Dropdown updated successfully with', allJobseekers.length, 'options');
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
              
              const select = document.getElementById('job-select');
              select.innerHTML = '<option value="">구인공고를 선택하세요</option>';
              
              if (allJobs.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = '등록된 구인공고가 없습니다';
                option.disabled = true;
                select.appendChild(option);
                console.log('[DEBUG] No jobs available');
                toast.info('등록된 구인공고가 없습니다.');
              } else {
                allJobs.forEach(job => {
                  const option = document.createElement('option');
                  option.value = job.id;
                  option.textContent = job.title + ' - ' + job.company_name + ' (' + job.location + ')';
                  select.appendChild(option);
                  console.log('[DEBUG] Added option:', option.textContent);
                });
                console.log('[DEBUG] Dropdown updated successfully with', allJobs.length, 'options');
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
          
          if (!jobseekerId) {
            toast.warning('구직자를 먼저 선택해주세요.');
            return;
          }
          
          showLoading(true);
          
          try {
            const response = await fetch('/api/matching/jobs/' + jobseekerId);
            const result = await response.json();
            
            if (result.success && result.data) {
              displayMatches(result.data, 'jobseeker');
              toast.success('매칭 분석이 완료되었습니다!');
            } else {
              toast.error(result.message || '매칭 분석에 실패했습니다.');
            }
          } catch (error) {
            console.error('Error finding job matches:', error);
            toast.error('매칭 분석 중 오류가 발생했습니다.');
          } finally {
            showLoading(false);
          }
        }
        
        // 기업 매칭 찾기 (실제 API 호출)
        async function findJobseekerMatches() {
          const jobId = document.getElementById('job-select').value;
          
          if (!jobId) {
            toast.warning('구인공고를 먼저 선택해주세요.');
            return;
          }
          
          showLoading(true);
          
          try {
            const response = await fetch('/api/matching/jobseekers/' + jobId);
            const result = await response.json();
            
            if (result.success && result.data) {
              displayMatches(result.data, 'job');
              toast.success('매칭 분석이 완료되었습니다!');
            } else {
              toast.error(result.message || '매칭 분석에 실패했습니다.');
            }
          } catch (error) {
            console.error('Error finding jobseeker matches:', error);
            toast.error('매칭 분석 중 오류가 발생했습니다.');
          } finally {
            showLoading(false);
          }
        }
        
        // 매칭 결과 표시
        function displayMatches(data, type) {
          currentMatches = data.matches || [];
          
          const resultsDiv = document.getElementById('matching-results');
          const statsDiv = document.getElementById('matching-stats');
          const containerDiv = document.getElementById('matches-container');
          
          // 통계 정보 표시
          statsDiv.innerHTML = 
            '<div class="flex items-center space-x-4 text-sm">' +
              '<span><i class="fas fa-list-ol mr-1"></i>총 ' + (data.total_matches || 0) + '개</span>' +
              '<span><i class="fas fa-chart-bar mr-1"></i>평균 ' + (data.average_score || 0) + '점</span>' +
              '<span><i class="fas fa-clock mr-1"></i>' + new Date().toLocaleTimeString() + '</span>' +
            '</div>';
          
          // 매칭 결과 표시
          if (currentMatches.length === 0) {
            containerDiv.innerHTML = 
              '<div class="text-center py-12">' +
                '<i class="fas fa-search text-6xl text-gray-300 mb-4"></i>' +
                '<h3 class="text-lg font-semibold text-gray-500 mb-2">매칭 결과가 없습니다</h3>' +
                '<p class="text-gray-400">조건을 조정하여 다시 시도해보세요.</p>' +
              '</div>';
          } else {
            // 간단한 매칭 결과 표시
            let resultsHtml = '<div class="space-y-4">';
            
            currentMatches.slice(0, 10).forEach((match, index) => {
              const scoreColor = match.matching_score >= 90 ? 'text-green-600' : 
                                match.matching_score >= 70 ? 'text-blue-600' : 
                                match.matching_score >= 50 ? 'text-yellow-600' : 'text-gray-600';
              
              const title = type === 'jobseeker' 
                ? match.title + ' - ' + (match.company_name || '회사명 미상')
                : match.name + ' (' + (match.nationality || '국적미상') + ')';
                
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
        function showLoading(show) {
          // 간단한 로딩 표시 (실제로는 더 정교한 UI 사용)
          const buttons = document.querySelectorAll('button[onclick^="find"]');
          buttons.forEach(btn => {
            btn.disabled = show;
            if (show) {
              btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>분석 중...';
            } else {
              btn.innerHTML = btn.innerHTML.includes('구인공고') 
                ? '<i class="fas fa-search mr-2"></i>맞춤 구인공고 찾기'
                : '<i class="fas fa-search mr-2"></i>적합한 구직자 찾기';
            }
          });
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
      `}</script>
    </div>
  )
}
