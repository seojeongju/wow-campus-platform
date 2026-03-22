
import type { Context } from 'hono'
import { NavigationHeader, NavigationScript } from '../../components/navigation'

export const handler = (c: Context) => {
    const id = c.req.param('id')

    return c.render(
        <div class="min-h-screen bg-gray-50">
            <NavigationHeader />

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Loading State */}
                <div id="loadingState" class="text-center py-12">
                    <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-white">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        대학교 정보를 불러오는 중...
                    </div>
                </div>

                {/* Error State */}
                <div id="errorState" class="hidden text-center py-12">
                    <div class="bg-white rounded-lg shadow-sm p-8 max-w-lg mx-auto">
                        <div class="text-red-500 text-5xl mb-4">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">정보를 찾을 수 없습니다</h2>
                        <p class="text-gray-600 mb-6" id="errorMessage">요청하신 대학교 정보를 불러올 수 없습니다.</p>
                        <a href="/study" class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                            목록으로 돌아가기
                        </a>
                    </div>
                </div>

                {/* Content */}
                <div id="universityContent" class="hidden space-y-8">
                    {/* Header Section */}
                    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                        <div class="px-8 pb-8">
                            <div class="relative flex items-end -mt-12 mb-6">
                                <img id="uniLogo" src="" alt="Logo" class="w-32 h-32 rounded-xl border-4 border-white shadow-md bg-white object-contain p-2" />
                                <div class="ml-6 mb-2">
                                    <div class="flex items-center space-x-2 text-gray-100 mb-1 text-sm">
                                        <span class="bg-blue-800 bg-opacity-50 px-2 py-0.5 rounded backdrop-blur-sm" id="uniRegion"></span>
                                        <span class="bg-blue-800 bg-opacity-50 px-2 py-0.5 rounded backdrop-blur-sm" id="uniPartnership"></span>
                                    </div>
                                    <h1 class="text-3xl font-bold text-gray-900" id="uniName"></h1>
                                    <p class="text-gray-600 font-medium" id="uniEnglishName"></p>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-2 mb-6" id="uniBadges">
                                {/* Badges injected via JS */}
                            </div>

                            <p class="text-gray-700 leading-relaxed text-lg" id="uniDescription"></p>

                            <div class="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100">
                                <a id="uniWebsite" href="#" target="_blank" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <i class="fas fa-globe mr-2 text-gray-400"></i> 웹사이트 방문
                                </a>
                                <div class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100">
                                    <i class="fas fa-envelope mr-2"></i> <span id="uniEmail"></span>
                                </div>
                                <div class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100">
                                    <i class="fas fa-phone mr-2"></i> <span id="uniPhone"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-3 gap-8">
                        {/* Left Column (Overview & Admissions) */}
                        <div class="md:col-span-2 space-y-8">

                            {/* Major & Degrees */}
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-graduation-cap text-blue-600 mr-2"></i> 개설 과정 및 전공
                                </h2>

                                <div class="grid sm:grid-cols-2 gap-4 mb-6">
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <h3 class="font-semibold text-gray-900 mb-2">학위 과정</h3>
                                        <ul class="space-y-2 text-sm text-gray-600" id="uniDegreesList">
                                        </ul>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <h3 class="font-semibold text-gray-900 mb-2">주요 전공</h3>
                                        <div class="flex flex-wrap gap-2" id="uniMajorsList">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admission Requirements */}
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-clipboard-check text-green-600 mr-2"></i> 입학 요건
                                </h2>
                                <div class="space-y-4">
                                    <div class="flex items-start">
                                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                            <span class="text-green-600 font-bold text-sm">KR</span>
                                        </div>
                                        <div class="ml-4">
                                            <h4 class="text-sm font-bold text-gray-900">한국어 능력</h4>
                                            <p class="text-gray-600 mt-1" id="uniKoreanReq"></p>
                                        </div>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                            <span class="text-blue-600 font-bold text-sm">EN</span>
                                        </div>
                                        <div class="ml-4">
                                            <h4 class="text-sm font-bold text-gray-900">영어 능력</h4>
                                            <p class="text-gray-600 mt-1" id="uniEnglishReq"></p>
                                        </div>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                                            <i class="fas fa-tasks text-purple-600 text-xs"></i>
                                        </div>
                                        <div class="ml-4">
                                            <h4 class="text-sm font-bold text-gray-900">기타 요건</h4>
                                            <p class="text-gray-600 mt-1" id="uniOtherReq"></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Campus Life */}
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-university text-indigo-600 mr-2"></i> 캠퍼스 라이프
                                </h2>
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4" id="uniFacilities">
                                    {/* Facilities injected via JS */}
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Sidebar Info) */}
                        <div class="space-y-8">
                            {/* Key Stats */}
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h2 class="text-lg font-bold text-gray-900 mb-4">학교 현황</h2>
                                <div class="space-y-4">
                                    <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <span class="text-gray-500 text-sm">설립연도</span>
                                        <span class="font-medium text-gray-900" id="uniEstablished"></span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <span class="text-gray-500 text-sm">총 재학생</span>
                                        <span class="font-medium text-gray-900" id="uniStudentCount"></span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <span class="text-gray-500 text-sm">유학생</span>
                                        <span class="font-medium text-gray-900" id="uniForeignCount"></span>
                                    </div>
                                </div>
                            </div>

                            {/* Tuition & Scholarships */}
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h2 class="text-lg font-bold text-gray-900 mb-4">등록금 및 장학금</h2>
                                <div class="mb-4">
                                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">학기당 등록금</p>
                                    <p class="text-xl font-bold text-blue-600" id="uniTuition"></p>
                                    <p class="text-xs text-gray-400 mt-1">* 기숙사비: <span id="uniDormFee"></span></p>
                                </div>
                                <div class="pt-4 border-t border-gray-100">
                                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">장학금 혜택</p>
                                    <p class="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100" id="uniScholarship"></p>
                                </div>
                            </div>

                            {/* Admission Schedule */}
                            <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
                                <h2 class="text-lg font-bold mb-4 flex items-center">
                                    <i class="fas fa-calendar-alt mr-2"></i> 모집 시기
                                </h2>
                                <div class="space-y-4">
                                    <div>
                                        <p class="text-blue-100 text-xs uppercase mb-1">봄학기 (1학기)</p>
                                        <p class="font-bold text-lg" id="uniSpringDate"></p>
                                    </div>
                                    <div>
                                        <p class="text-blue-100 text-xs uppercase mb-1">가을학기 (2학기)</p>
                                        <p class="font-bold text-lg" id="uniFallDate"></p>
                                    </div>
                                </div>
                                <div class="mt-6">
                                    <a href="#" id="applyLink" class="block w-full text-center py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm">
                                        입학 상담 신청하기
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                        <h2 class="text-xl font-bold text-gray-900 mb-4">더 궁금한 점이 있으신가요?</h2>
                        <p class="text-gray-600 mb-6">Wow Campus의 전문 에이전트가 상세한 입학 상담을 도와드립니다.</p>
                        <div class="flex justify-center space-x-4">
                            <a href="/contact" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">문의하기</a>
                            <a href="/study" class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">목록으로</a>
                        </div>
                    </div>

                </div>
            </div>

            <div dangerouslySetInnerHTML={{
                __html: `
        <script>
        const universityId = '${id}';
        
        async function loadUniversityDetail() {
            try {
                const response = await fetch('/api/partner-universities/' + universityId);
                const result = await response.json();
                
                if (result.success && result.university) {
                    displayUniversity(result.university);
                } else {
                    showError(result.message || '대학교 정보를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('서버 통신 중 오류가 발생했습니다.');
            }
        }

        function displayUniversity(uni) {
            document.getElementById('loadingState').classList.add('hidden');
            document.getElementById('universityContent').classList.remove('hidden');

            document.getElementById('uniLogo').src = uni.logo;
            document.getElementById('uniName').textContent = uni.name;
            document.getElementById('uniEnglishName').textContent = uni.englishName;
            document.getElementById('uniRegion').textContent = uni.region;
            document.getElementById('uniPartnership').textContent = uni.partnershipType;
            document.getElementById('uniDescription').textContent = uni.description;
            
            // Badges
            const badgesHtml = uni.features.map(f => 
                \`<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">\${f}</span>\`
            ).join('');
            document.getElementById('uniBadges').innerHTML = badgesHtml;

            // Contacts
            if (uni.website) document.getElementById('uniWebsite').href = uni.website;
            document.getElementById('uniEmail').textContent = uni.contactEmail || '비공개';
            document.getElementById('uniPhone').textContent = uni.contactPhone || '비공개';

            // Degrees
            const degreeList = document.getElementById('uniDegreesList');
            if (uni.languageCourse) degreeList.innerHTML += '<li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> 한국어 어학연수 과정</li>';
            if (uni.undergraduateCourse) degreeList.innerHTML += '<li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> 학부 과정 (신입/편입)</li>';
            if (uni.graduateCourse) degreeList.innerHTML += '<li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> 대학원 과정 (석/박사)</li>';

            // Majors
            const majorsHtml = uni.majors.map(m => 
                \`<span class="bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded text-sm">\${m}</span>\`
            ).join('');
            document.getElementById('uniMajorsList').innerHTML = majorsHtml || '<span class="text-gray-500 text-sm">정보 없음</span>';

            // Requirements
            document.getElementById('uniKoreanReq').textContent = uni.koreanRequirement || '문의 필요';
            document.getElementById('uniEnglishReq').textContent = uni.englishRequirement || '해당 없음';
            document.getElementById('uniOtherReq').textContent = uni.admissionRequirement || '없음';

            // Facilities
            const facilitiesContainer = document.getElementById('uniFacilities');
            const facilities = [
                { key: 'dormitory', icon: 'fa-building', label: '기숙사', active: uni.dormitory },
                { key: 'airportPickup', icon: 'fa-plane-arrival', label: '공항 픽업', active: uni.airportPickup },
                { key: 'buddyProgram', icon: 'fa-user-friends', label: '버디 프로그램', active: uni.buddyProgram },
                { key: 'koreanLanguageSupport', icon: 'fa-language', label: '한국어 지원', active: uni.koreanLanguageSupport },
                { key: 'careerSupport', icon: 'fa-briefcase', label: '취업 지원', active: uni.careerSupport },
                { key: 'partTimeWork', icon: 'fa-clock', label: '아르바이트 가능', active: uni.partTimeWork },
            ];
            
            facilities.forEach(item => {
                const div = document.createElement('div');
                div.className = \`p-3 rounded-lg border \${item.active ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100 opacity-50'}\`;
                div.innerHTML = \`
                    <div class="flex items-center">
                        <i class="fas \${item.icon} \${item.active ? 'text-indigo-600' : 'text-gray-400'} mr-3"></i>
                        <span class="\${item.active ? 'text-indigo-900 font-medium' : 'text-gray-500'}">\${item.label}</span>
                    </div>
                \`;
                facilitiesContainer.appendChild(div);
            });

            // Stats
            document.getElementById('uniEstablished').textContent = uni.establishedYear ? uni.establishedYear + '년' : '-';
            document.getElementById('uniStudentCount').textContent = uni.studentCount ? uni.studentCount.toLocaleString() + '명' : '-';
            document.getElementById('uniForeignCount').textContent = uni.foreignStudentCount ? uni.foreignStudentCount.toLocaleString() + '명' : '-';

            // Tuition
            document.getElementById('uniTuition').textContent = uni.tuitionFee || '문의';
            document.getElementById('uniDormFee').textContent = uni.dormitoryFee || '별도 문의';
            document.getElementById('uniScholarship').textContent = uni.scholarships || '장학금 정보 없음';

            // Schedule
            document.getElementById('uniSpringDate').textContent = uni.springAdmission || '미정 (3월 입학)';
            document.getElementById('uniFallDate').textContent = uni.fallAdmission || '미정 (9월 입학)';
        }

        function showError(msg) {
            document.getElementById('loadingState').classList.add('hidden');
            document.getElementById('errorState').classList.remove('hidden');
            document.getElementById('errorMessage').textContent = msg;
        }

        loadUniversityDetail();
        </script>
      `}} />
            <div dangerouslySetInnerHTML={{ __html: NavigationScript }} />
        </div>
    )
}
