/**
 * Page Component
 * Route: /matching
 * Original: src/index.tsx lines 12346-12973
 */

import type { Context } from 'hono'
import { REGIONS, VISA_TYPES, VISA_SPONSORSHIP_OPTIONS } from '../constants/options'
import ko from '../locales/ko.json'
import en from '../locales/en.json'

export function handler(c: Context) {
  const { t } = c.get('i18n');
  const lang = c.get('locale') || 'ko';
  const translations = lang === 'en' ? en : ko;
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
            <a href="/home" class="text-blue-600 hover:text-blue-800">{t('matching.back_to_home')}</a>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{t('matching.title')}</h1>
          <p class="text-gray-600 text-lg">{t('matching.subtitle')}</p>
          <div class="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <i class="fas fa-check-circle mr-2"></i>
            {t('matching.status')}
          </div>
        </div>

        {/* 매칭 시스템 선택 */}
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          {/* 구직자용 매칭 */}
          <div class="bg-white p-8 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-user-tie text-2xl text-purple-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-center">{t('matching.jobseeker.title')}</h3>
            <p class="text-gray-600 mb-6 text-center">{t('matching.jobseeker.description')}</p>
            
            <div class="space-y-4">
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {t('matching.jobseeker.skill_match')}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {t('matching.jobseeker.location_match')}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {t('matching.jobseeker.experience_match')}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {t('matching.jobseeker.visa_salary_match')}
              </div>
            </div>
            
            <div class="mt-6">
              {/* 검색 조건 섹션 */}
              <div class="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div class="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                  <i class="fas fa-search mr-2"></i>
                  {t('matching.jobseeker.search_conditions')}
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">{t('matching.jobseeker.search_by_name')}</label>
                    <div class="relative">
                      <input 
                        type="text" 
                        id="jobseeker-search" 
                        placeholder={t('matching.jobseeker.search_placeholder')}
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
                      <label class="text-xs text-gray-600 mb-1 block">{t('matching.jobseeker.location')}</label>
                      <select id="jobseeker-location" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        {REGIONS.map(region => (
                          <option value={region.value}>{region.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">{t('matching.jobseeker.visa_status')}</label>
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
                  {t('matching.jobseeker.result_options')}
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">{t('matching.jobseeker.result_count')}</label>
                    <select id="jobseeker-limit" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="5">{t('matching.jobseeker.count_5')}</option>
                      <option value="10" selected>{t('matching.jobseeker.count_10')}</option>
                      <option value="20">{t('matching.jobseeker.count_20')}</option>
                      <option value="50">{t('matching.jobseeker.count_50')}</option>
                      <option value="999">{t('matching.jobseeker.count_all')}</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">{t('matching.jobseeker.min_score')}</label>
                    <select id="jobseeker-minscore" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="0">{t('matching.jobseeker.no_limit')}</option>
                      <option value="50" selected>{t('matching.jobseeker.score_50')}</option>
                      <option value="60">{t('matching.jobseeker.score_60')}</option>
                      <option value="70">{t('matching.jobseeker.score_70')}</option>
                      <option value="80">{t('matching.jobseeker.score_80')}</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">{t('matching.jobseeker.sort')}</label>
                    <select id="jobseeker-sort" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="score-desc" selected>{t('matching.jobseeker.sort_score_desc')}</option>
                      <option value="score-asc">{t('matching.jobseeker.sort_score_asc')}</option>
                      <option value="name-asc">{t('matching.jobseeker.sort_name_asc')}</option>
                      <option value="name-desc">{t('matching.jobseeker.sort_name_desc')}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button id="jobseeker-match-btn" onclick="findJobMatches()" class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                <i class="fas fa-search mr-2"></i>
                {t('matching.jobseeker.find_jobs')}
              </button>
            </div>
          </div>

          {/* 기업용 매칭 */}
          <div class="bg-white p-8 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-building text-2xl text-blue-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-center">{t('matching.company.title')}</h3>
            <p class="text-gray-600 mb-6 text-center">{t('matching.company.description')}</p>
            
            <div class="space-y-4">
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {t('matching.company.skill_analysis')}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {t('matching.company.location_access')}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {t('matching.company.experience_fit')}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {t('matching.company.visa_salary')}
              </div>
            </div>
            
            <div class="mt-6">
              {/* 검색 조건 섹션 */}
              <div class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <i class="fas fa-search mr-2"></i>
                  {t('matching.company.search_conditions')}
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">{t('matching.company.search_by_company')}</label>
                    <div class="relative">
                      <input 
                        type="text" 
                        id="job-search" 
                        placeholder={t('matching.company.search_placeholder')}
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
                      <label class="text-xs text-gray-600 mb-1 block">{t('matching.company.location')}</label>
                      <select id="job-location" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {REGIONS.map(region => (
                          <option value={region.value}>{region.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">{t('matching.company.visa_requirement')}</label>
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
                  {t('matching.company.result_options')}
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">{t('matching.company.result_count')}</label>
                    <select id="job-limit" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="5">{t('matching.company.count_5')}</option>
                      <option value="10" selected>{t('matching.company.count_10')}</option>
                      <option value="20">{t('matching.company.count_20')}</option>
                      <option value="50">{t('matching.company.count_50')}</option>
                      <option value="999">{t('matching.company.count_all')}</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">{t('matching.company.min_score')}</label>
                    <select id="job-minscore" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="0">{t('matching.company.no_limit')}</option>
                      <option value="50" selected>{t('matching.company.score_50')}</option>
                      <option value="60">{t('matching.company.score_60')}</option>
                      <option value="70">{t('matching.company.score_70')}</option>
                      <option value="80">{t('matching.company.score_80')}</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">{t('matching.company.sort')}</label>
                    <select id="job-sort" class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="score-desc" selected>{t('matching.company.sort_score_desc')}</option>
                      <option value="score-asc">{t('matching.company.sort_score_asc')}</option>
                      <option value="name-asc">{t('matching.company.sort_name_asc')}</option>
                      <option value="name-desc">{t('matching.company.sort_name_desc')}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button id="job-match-btn" onclick="findJobseekerMatches()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <i class="fas fa-search mr-2"></i>
                {t('matching.company.find_jobseekers')}
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
                {t('matching.results.title')}
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
                {t('matching.results.clear')}
              </button>
            </div>
          </div>
        </div>

        {/* 매칭 통계 */}
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-12">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-semibold mb-2">{t('matching.statistics.title')}</h3>
            <p class="text-blue-100">{t('matching.statistics.description')}</p>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6" id="matching-statistics">
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-matches">-</div>
              <div class="text-sm text-blue-100">{t('matching.statistics.total_matches')}</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-high-score">-</div>
              <div class="text-sm text-blue-100">{t('matching.statistics.high_score')}</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-avg-score">-</div>
              <div class="text-sm text-blue-100">{t('matching.statistics.avg_score')}</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2" id="stat-success-rate">-</div>
              <div class="text-sm text-blue-100">{t('matching.statistics.success_rate')}</div>
            </div>
          </div>
        </div>

        {/* 매칭 알고리즘 설명 */}
        <div class="bg-white rounded-lg shadow-sm border p-8">
          <h3 class="text-xl font-semibold mb-6 text-center">
            <i class="fas fa-brain text-purple-600 mr-2"></i>
            {t('matching.algorithm.title')}
          </h3>
          
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-cogs text-red-600"></i>
              </div>
              <h4 class="font-semibold mb-2">{t('matching.algorithm.multidimensional.title')}</h4>
              <p class="text-gray-600 text-sm">{t('matching.algorithm.multidimensional.desc')}</p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-percentage text-yellow-600"></i>
              </div>
              <h4 class="font-semibold mb-2">{t('matching.algorithm.scoring.title')}</h4>
              <p class="text-gray-600 text-sm">{t('matching.algorithm.scoring.desc')}</p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-bullseye text-green-600"></i>
              </div>
              <h4 class="font-semibold mb-2">{t('matching.algorithm.recommendation.title')}</h4>
              <p class="text-gray-600 text-sm">{t('matching.algorithm.recommendation.desc')}</p>
            </div>
          </div>
          
          <div class="mt-8 p-6 bg-gray-50 rounded-lg">
            <div class="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h5 class="font-semibold text-gray-900 mb-3">{t('matching.algorithm.criteria.title')}</h5>
                <ul class="space-y-2 text-gray-600">
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                    <strong>{t('matching.algorithm.criteria.skill')}</strong>
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <strong>{t('matching.algorithm.criteria.location')}</strong>
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <strong>{t('matching.algorithm.criteria.experience')}</strong>
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                    <strong>{t('matching.algorithm.criteria.visa_salary')}</strong>
                  </li>
                </ul>
              </div>
              <div>
                <h5 class="font-semibold text-gray-900 mb-3">{t('matching.algorithm.score_guide.title')}</h5>
                <ul class="space-y-2 text-gray-600">
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <strong>{t('matching.algorithm.score_guide.perfect')}</strong>
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <strong>{t('matching.algorithm.score_guide.excellent')}</strong>
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                    <strong>{t('matching.algorithm.score_guide.good')}</strong>
                  </li>
                  <li class="flex items-center">
                    <span class="w-3 h-3 bg-gray-400 rounded-full mr-3"></span>
                    <strong>{t('matching.algorithm.score_guide.low')}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* 매칭 시스템 JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // Inject locale and translations
        window.locale = '${lang}';
        window.translations = ${JSON.stringify(translations)};
        window.t = function(key) {
          const keys = key.split('.');
          let value = window.translations;
          for (const k of keys) {
            value = value && value[k];
          }
          return value || key;
        };
      `}}></script>
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
              toast.error(window.t('matching.messages.loading_jobseekers_error') + ' (HTTP ' + response.status + ')');
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
                toast.info(window.t('matching.messages.no_jobseekers'));
              } else {
                console.log('[DEBUG] Jobseekers loaded successfully:', allJobseekers.length);
              }
            } else {
              console.error('[DEBUG] API returned success=false');
              toast.error(result.message || window.t('matching.messages.loading_jobseekers_error'));
            }
          } catch (error) {
            console.error('[DEBUG] Error loading jobseekers:', error);
            console.error('[DEBUG] Error stack:', error.stack);
            toast.error(window.t('matching.messages.loading_jobseekers_error') + ': ' + error.message);
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
              toast.error(window.t('matching.messages.loading_jobs_error') + ' (HTTP ' + response.status + ')');
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
                toast.info(window.t('matching.messages.no_jobs'));
              } else {
                console.log('[DEBUG] Jobs loaded successfully:', allJobs.length);
              }
            } else {
              console.error('[DEBUG] API returned success=false');
              toast.error(result.message || window.t('matching.messages.loading_jobs_error'));
            }
          } catch (error) {
            console.error('[DEBUG] Error loading jobs:', error);
            console.error('[DEBUG] Error stack:', error.stack);
            toast.error(window.t('matching.messages.loading_jobs_error') + ': ' + error.message);
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
            toast.warning(window.t('matching.messages.no_conditions'));
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
                match_reasons: [window.t('matching.messages.condition_based')]
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
            toast.success(window.t('matching.messages.analysis_complete'));
          } catch (error) {
            console.error('Error finding job matches:', error);
            toast.error(window.t('matching.messages.analysis_error'));
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
            toast.warning(window.t('matching.messages.no_conditions'));
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
                match_reasons: [window.t('matching.messages.condition_based')]
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
            toast.success(window.t('matching.messages.analysis_complete'));
          } catch (error) {
            console.error('Error finding jobseeker matches:', error);
            toast.error(window.t('matching.messages.analysis_error'));
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
                window.t('matching.results.recommended_jobs') +
              '</h3>' +
              '<p class="text-sm text-gray-600 mt-2">' + window.t('matching.results.recommended_jobs_desc') + '</p>' +
              '</div>'
            : '<div class="mb-6 pb-4 border-b-2 border-blue-200">' +
              '<h3 class="text-2xl font-bold text-blue-600 flex items-center">' +
                '<i class="fas fa-users mr-3"></i>' +
                window.t('matching.results.recommended_jobseekers') +
              '</h3>' +
              '<p class="text-sm text-gray-600 mt-2">' + window.t('matching.results.recommended_jobseekers_desc') + '</p>' +
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
              '<span><i class="fas fa-list-ol mr-1"></i>' + window.t('matching.results.displaying') + ': ' + filteredTotal + '</span>' +
              '<span class="text-gray-400">/ ' + window.t('matching.results.total') + ': ' + (data.total_matches || 0) + '</span>' +
              '<span><i class="fas fa-chart-bar mr-1"></i>' + window.t('matching.results.average') + ' ' + filteredAvg + '</span>' +
              '<span><i class="fas fa-clock mr-1"></i>' + new Date().toLocaleTimeString() + '</span>' +
            '</div>';
          
          // 매칭 결과 표시
          if (currentMatches.length === 0) {
            containerDiv.innerHTML = 
              resultTypeHeader +
              '<div class="text-center py-12">' +
                '<i class="fas fa-search text-6xl text-gray-300 mb-4"></i>' +
                '<h3 class="text-lg font-semibold text-gray-500 mb-2">' + window.t('matching.results.no_results') + '</h3>' +
                '<p class="text-gray-400">' + window.t('matching.results.no_results_desc') + '</p>' +
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
                title = match.title + ' - ' + (match.company_name || window.t('matching.results.company_unknown'));
                console.log('[DEBUG] Jobseeker mode - showing job:', title);
              } else {
                // 기업을 위한 구직자 매칭
                const name = match.name || (match.first_name && match.last_name ? match.first_name + ' ' + match.last_name : window.t('matching.results.name_unknown'));
                title = name + ' (' + (match.nationality || window.t('matching.results.nationality_unknown')) + ')';
                console.log('[DEBUG] Job mode - showing jobseeker:', title);
              }
                
              resultsHtml += 
                '<div class="border rounded-lg p-6 hover:shadow-md transition-shadow">' +
                  '<div class="flex items-center justify-between mb-4">' +
                    '<h4 class="text-lg font-semibold">#' + (index + 1) + ' ' + title + '</h4>' +
                    '<div class="text-right">' +
                      '<div class="text-2xl font-bold ' + scoreColor + '">' + match.matching_score + '</div>' +
                      '<div class="text-xs text-gray-500">' + window.t('matching.results.matching_score') + '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="text-sm text-gray-600">' +
                    '<div>' + window.t('matching.results.match_reasons') + ': ' + (match.match_reasons ? match.match_reasons.join(', ') : window.t('matching.results.analyzing_reason')) + '</div>' +
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
            originalText = '<i class="fas fa-search mr-2"></i>' + window.t('matching.jobseeker.find_jobs');
          } else if (buttonType === 'job') {
            button = document.getElementById('job-match-btn');
            originalText = '<i class="fas fa-search mr-2"></i>' + window.t('matching.company.find_jobseekers');
          }
          
          if (button) {
            button.disabled = show;
            if (show) {
              button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>' + window.t('matching.jobseeker.analyzing');
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
              document.getElementById('stat-avg-score').textContent = (stats.average_score || 0);
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
            suggestionsDiv.innerHTML = '<div class="p-3 text-gray-500 text-sm">' + window.t('matching.messages.no_search_results') + '</div>';
            suggestionsDiv.classList.remove('hidden');
            hiddenInput.value = '';
          } else {
            let html = '';
            filtered.slice(0, 10).forEach(jobseeker => {
              const name = jobseeker.name || (jobseeker.first_name + ' ' + jobseeker.last_name);
              const nationality = jobseeker.nationality || window.t('matching.results.nationality_unknown');
              const major = jobseeker.major || window.t('matching.results.major_unknown');
              
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
            suggestionsDiv.innerHTML = '<div class="p-3 text-gray-500 text-sm">' + window.t('matching.messages.no_search_results') + '</div>';
            suggestionsDiv.classList.remove('hidden');
            hiddenInput.value = '';
          } else {
            let html = '';
            filtered.slice(0, 10).forEach(job => {
              const title = job.title || window.t('matching.results.title_unknown');
              const companyName = job.company_name || window.t('matching.results.company_unknown');
              const location = job.location || window.t('matching.results.location_unknown');
              
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
