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
        
        // 목업 데이터
        const mockJobseekers = [
          { id: 1, name: '김민수', nationality: '베트남', field: '컴퓨터공학', skills: ['JavaScript', 'React', 'Node.js'], experience_years: 3, preferred_location: '서울/경기', visa_status: 'E-7', salary_expectation: 4000 },
          { id: 2, name: '이지원', nationality: '중국', field: '경영학', skills: ['Marketing', 'Business Analysis', 'Excel'], experience_years: 2, preferred_location: '서울', visa_status: 'F-2', salary_expectation: 3500 },
          { id: 3, name: '박지민', nationality: '필리핀', field: '디자인', skills: ['Photoshop', 'Illustrator', 'UI/UX'], experience_years: 1, preferred_location: '부산', visa_status: 'D-2', salary_expectation: 3000 },
          { id: 4, name: 'John Smith', nationality: '미국', field: '공학', skills: ['Python', 'Machine Learning', 'Data Analysis'], experience_years: 5, preferred_location: '서울', visa_status: 'E-7', salary_expectation: 5000 },
          { id: 5, name: 'Maria Garcia', nationality: '스페인', field: '교육', skills: ['Teaching', 'Spanish', 'English'], experience_years: 4, preferred_location: '대구', visa_status: 'E-2', salary_expectation: 3200 }
        ];
        
        const mockJobs = [
          { id: 1, title: 'Frontend Developer', company_name: '삼성전자', location: '서울', skills_required: ['JavaScript', 'React', 'TypeScript'], experience_level: 'mid', salary_min: 4000, salary_max: 5000, visa_sponsorship: true },
          { id: 2, title: 'Marketing Specialist', company_name: '네이버', location: '경기도', skills_required: ['Marketing', 'Analytics', 'SNS'], experience_level: 'junior', salary_min: 3500, salary_max: 4500, visa_sponsorship: false },
          { id: 3, title: 'UX Designer', company_name: 'LG전자', location: '서울', skills_required: ['UI/UX', 'Figma', 'Photoshop'], experience_level: 'entry', salary_min: 3000, salary_max: 4000, visa_sponsorship: true },
          { id: 4, title: 'Data Scientist', company_name: '카카오', location: '제주도', skills_required: ['Python', 'Machine Learning', 'SQL'], experience_level: 'senior', salary_min: 5000, salary_max: 6000, visa_sponsorship: true },
          { id: 5, title: 'English Teacher', company_name: '한국외대', location: '서울', skills_required: ['Teaching', 'English', 'Education'], experience_level: 'mid', salary_min: 3000, salary_max: 4000, visa_sponsorship: true }
        ];
        
        // 구직자 목록 로드
        function loadJobseekers() {
          const select = document.getElementById('jobseeker-select');
          select.innerHTML = '<option value="">구직자를 선택하세요</option>';
          
          mockJobseekers.forEach(jobseeker => {
            const option = document.createElement('option');
            option.value = jobseeker.id;
            option.textContent = jobseeker.name + ' (' + jobseeker.nationality + ') - ' + jobseeker.field;
            select.appendChild(option);
          });
        }
        
        // 구인공고 목록 로드
        function loadJobs() {
          const select = document.getElementById('job-select');
          select.innerHTML = '<option value="">구인공고를 선택하세요</option>';
          
          mockJobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title + ' - ' + job.company_name + ' (' + job.location + ')';
            select.appendChild(option);
          });
        }
        
        // 매칭 점수 계산 함수
        function calculateMatchingScore(job, jobseeker) {
          let score = 0;
          let maxScore = 100;
          
          // 1. 스킬 매칭 (40점)
          const jobSkills = job.skills_required || [];
          const seekerSkills = jobseeker.skills || [];
          const matchedSkills = jobSkills.filter(skill => 
            seekerSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || 
                                 skill.toLowerCase().includes(s.toLowerCase()))
          );
          const skillScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 40 : 0;
          score += skillScore;
          
          // 2. 위치 매칭 (25점)
          const jobLocation = job.location.toLowerCase();
          const preferredLocations = jobseeker.preferred_location.toLowerCase();
          let locationScore = 0;
          if (preferredLocations.includes(jobLocation) || jobLocation.includes('서울') && preferredLocations.includes('서울')) {
            locationScore = 25;
          } else if ((jobLocation.includes('서울') && preferredLocations.includes('경기')) || 
                     (jobLocation.includes('경기') && preferredLocations.includes('서울'))) {
            locationScore = 15;
          }
          score += locationScore;
          
          // 3. 경력 매칭 (20점)
          const experienceYears = jobseeker.experience_years || 0;
          let experienceScore = 0;
          
          switch (job.experience_level) {
            case 'entry':
              if (experienceYears <= 1) experienceScore = 20;
              else if (experienceYears <= 3) experienceScore = 15;
              else experienceScore = 10;
              break;
            case 'junior':
              if (experienceYears >= 1 && experienceYears <= 3) experienceScore = 20;
              else if (experienceYears <= 5) experienceScore = 15;
              else experienceScore = 10;
              break;
            case 'mid':
              if (experienceYears >= 3 && experienceYears <= 7) experienceScore = 20;
              else if (experienceYears >= 1 && experienceYears <= 10) experienceScore = 15;
              else experienceScore = 10;
              break;
            case 'senior':
              if (experienceYears >= 5) experienceScore = 20;
              else if (experienceYears >= 3) experienceScore = 15;
              else experienceScore = 5;
              break;
            default:
              experienceScore = 10;
          }
          score += experienceScore;
          
          // 4. 비자 스폰서십 (10점)
          if (job.visa_sponsorship) {
            score += 10;
          } else if (['F-2', 'F-5', 'F-6', 'F-4'].includes(jobseeker.visa_status)) {
            score += 10;
          }
          
          // 5. 급여 기대치 (5점)
          if (job.salary_min && job.salary_max && jobseeker.salary_expectation) {
            const avgSalary = (job.salary_min + job.salary_max) / 2;
            const expectation = jobseeker.salary_expectation;
            
            if (expectation >= job.salary_min && expectation <= job.salary_max) {
              score += 5;
            } else if (Math.abs(expectation - avgSalary) / avgSalary <= 0.2) {
              score += 3;
            } else if (Math.abs(expectation - avgSalary) / avgSalary <= 0.4) {
              score += 1;
            }
          }
          
          return Math.round(score);
        }
        
        // 매칭 이유 생성
        function getMatchReasons(job, jobseeker) {
          const reasons = [];
          
          // 스킬 매칭
          const jobSkills = job.skills_required || [];
          const seekerSkills = jobseeker.skills || [];
          const matchedSkills = jobSkills.filter(skill => 
            seekerSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
          );
          if (matchedSkills.length > 0) {
            reasons.push('요구 스킬 매칭: ' + matchedSkills.join(', '));
          }
          
          // 위치 매칭
          if (jobseeker.preferred_location.toLowerCase().includes(job.location.toLowerCase())) {
            reasons.push('희망 근무지역 일치: ' + job.location);
          }
          
          // 경력 매칭
          const exp = jobseeker.experience_years || 0;
          switch (job.experience_level) {
            case 'entry':
              if (exp <= 1) reasons.push('신입/초급 경력 요구사항 충족');
              break;
            case 'junior':
              if (exp >= 1 && exp <= 3) reasons.push('주니어 경력 요구사항 충족');
              break;
            case 'mid':
              if (exp >= 3 && exp <= 7) reasons.push('중급 경력 요구사항 충족');
              break;
            case 'senior':
              if (exp >= 5) reasons.push('시니어 경력 요구사항 충족');
              break;
          }
          
          // 비자 스폰서십
          if (job.visa_sponsorship) {
            reasons.push('비자 스폰서십 제공');
          }
          
          return reasons;
        }
        
        // 구직자 매칭 찾기
        function findJobMatches() {
          const jobseekerId = document.getElementById('jobseeker-select').value;
          
          if (!jobseekerId) {
            toast.warning('구직자를 먼저 선택해주세요.');
            return;
          }
          
          showLoading(true);
          
          setTimeout(() => {
            const jobseeker = mockJobseekers.find(js => js.id == jobseekerId);
            if (!jobseeker) {
              toast.error('구직자를 찾을 수 없습니다.');
              showLoading(false);
              return;
            }
            
            const matchedJobs = mockJobs.map(job => ({
              ...job,
              matching_score: calculateMatchingScore(job, jobseeker),
              match_reasons: getMatchReasons(job, jobseeker)
            })).filter(job => job.matching_score > 0)
              .sort((a, b) => b.matching_score - a.matching_score);
            
            const data = {
              jobseeker: jobseeker,
              matches: matchedJobs,
              total_matches: matchedJobs.length,
              average_score: Math.round(matchedJobs.reduce((sum, job) => sum + job.matching_score, 0) / matchedJobs.length)
            };
            
            displayMatches(data, 'jobseeker');
            showLoading(false);
          }, 1500); // 실제 AI 처리 시뮬레이션
        }
        
        // 기업 매칭 찾기
        function findJobseekerMatches() {
          const jobId = document.getElementById('job-select').value;
          
          if (!jobId) {
            toast.warning('구인공고를 먼저 선택해주세요.');
            return;
          }
          
          showLoading(true);
          
          setTimeout(() => {
            const job = mockJobs.find(j => j.id == jobId);
            if (!job) {
              toast.error('구인공고를 찾을 수 없습니다.');
              showLoading(false);
              return;
            }
            
            const matchedJobseekers = mockJobseekers.map(jobseeker => ({
              ...jobseeker,
              matching_score: calculateMatchingScore(job, jobseeker),
              match_reasons: getMatchReasons(job, jobseeker)
            })).filter(seeker => seeker.matching_score > 0)
              .sort((a, b) => b.matching_score - a.matching_score);
            
            const data = {
              job: job,
              matches: matchedJobseekers,
              total_matches: matchedJobseekers.length,
              average_score: Math.round(matchedJobseekers.reduce((sum, seeker) => sum + seeker.matching_score, 0) / matchedJobseekers.length)
            };
            
            displayMatches(data, 'job');
            showLoading(false);
          }, 1500); // 실제 AI 처리 시뮬레이션
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
        
        // 매칭 통계 로드
        function loadMatchingStatistics() {
          // 목업 통계 데이터
          const totalMatches = mockJobseekers.length * mockJobs.length;
          const highScoreMatches = Math.floor(totalMatches * 0.15);
          const avgScore = 67;
          
          document.getElementById('stat-matches').textContent = totalMatches;
          document.getElementById('stat-high-score').textContent = highScoreMatches;
          document.getElementById('stat-avg-score').textContent = avgScore + '점';
          document.getElementById('stat-success-rate').textContent = '87%';
        }
      `}</script>
    </div>
  )
}
