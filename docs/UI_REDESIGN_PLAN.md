# 기업 프로필 UI 재설계 계획서

## 현재 상황
- 파일: `src/pages/profile/company.tsx` (1050줄)
- 섹션 2: 채용 정보 (라인 281-398)
- 섹션 3: 지원 사항 (라인 400-441)

## 변경 계획

### 섹션 2: 구인 공고 상세 정보 (NEW)

```tsx
{/* 2. 구인 공고 상세 정보 */}
<div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
  <h2>구인 공고 상세 정보</h2>
  
  {/* 2.1 채용 직무 정의 */}
  <div class="bg-gray-50 rounded-lg p-4 mb-6">
    <h3>2.1 채용 직무 정의</h3>
    
    {/* 직무명 (국/영) */}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="text" id="job_title_ko" placeholder="예: 3D 설계 엔지니어" />
      <input type="text" id="job_title_en" placeholder="예: 3D Design Engineer" />
    </div>
    
    {/* E-7 비자 직종 코드 ⭐ 가장 중요! */}
    <div>
      <label>E-7 비자 직종 코드 ⭐</label>
      <select id="e7_visa_code" class="searchable">
        <option value="">-- 직종을 선택하세요 --</option>
        <optgroup label="E-7-1 전문인력">
          <option value="E-7-1-01-001">소프트웨어 개발자</option>
          <option value="E-7-1-01-002">시스템 분석가</option>
          ...
        </optgroup>
      </select>
      <div id="salary_requirement" class="text-sm text-blue-600 mt-2">
        최소 연봉 요건: 4,405만원 이상
      </div>
    </div>
    
    {/* 담당 업무 */}
    <textarea id="job_responsibilities" rows="6"></textarea>
  </div>
  
  {/* 2.2 자격 요건 */}
  <div class="bg-gray-50 rounded-lg p-4 mb-6">
    <h3>2.2 자격 요건</h3>
    
    {/* 학위 */}
    <select id="required_degree">
      <option value="bachelor">학사 이상</option>
      <option value="master">석사 이상</option>
      <option value="phd">박사 이상</option>
      <option value="none">무관</option>
    </select>
    
    {/* 전공 */}
    <input type="text" id="required_major" />
    
    {/* 경력 */}
    <select id="required_experience">
      <option value="entry">신입 가능</option>
      <option value="1year">1년 이상</option>
      <option value="3year">3년 이상</option>
      <option value="5year">5년 이상</option>
    </select>
    
    {/* 한국어 능력 */}
    <select id="korean_level">
      <option value="topik1">TOPIK 1급</option>
      <option value="topik2">TOPIK 2급</option>
      <option value="topik3">TOPIK 3급 이상</option>
      <option value="topik4">TOPIK 4급 이상</option>
      <option value="topik5">TOPIK 5급 이상</option>
      <option value="topik6">TOPIK 6급</option>
      <option value="none">무관</option>
    </select>
    
    {/* 기타 언어 */}
    <div class="flex gap-4">
      <label><input type="checkbox" name="other_languages" value="english" /> 영어</label>
      <label><input type="checkbox" name="other_languages" value="chinese" /> 중국어</label>
      <label><input type="checkbox" name="other_languages" value="japanese" /> 일본어</label>
    </div>
  </div>
  
  {/* 2.3 근무 조건 */}
  <div class="bg-gray-50 rounded-lg p-4">
    <h3>2.3 근무 조건</h3>
    
    {/* 계약 형태 */}
    <div class="flex gap-4">
      <label><input type="radio" name="contract_type" value="fulltime" /> 정규직</label>
      <label><input type="radio" name="contract_type" value="contract" /> 계약직</label>
      <label><input type="radio" name="contract_type" value="intern" /> 인턴십</label>
    </div>
    
    {/* 계약 기간 (조건부) */}
    <input type="text" id="contract_duration" placeholder="예: 1년 (연장 가능)" />
    
    {/* 근무 시간 */}
    <div class="grid grid-cols-3 gap-4">
      <input type="number" id="working_hours_per_week" value="40" />
      <input type="text" id="working_time" placeholder="09:00-18:00" />
      <input type="text" id="annual_leave" placeholder="연차 15일" />
    </div>
    
    {/* 근무지 주소 */}
    <div>
      <button type="button" id="search_workplace_address">주소 검색</button>
      <input type="text" id="workplace_address" readonly />
    </div>
  </div>
</div>
```

### 섹션 3: 근로 조건 및 지원 사항 (NEW)

```tsx
{/* 3. 근로 조건 및 지원 사항 */}
<div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-green-500">
  <h2>근로 조건 및 지원 사항</h2>
  
  {/* 3.1 보상 */}
  <div class="bg-gray-50 rounded-lg p-4 mb-6">
    <h3>3.1 보상 (Compensation)</h3>
    
    {/* 급여 형태 */}
    <div class="flex gap-4">
      <label><input type="radio" name="salary_type" value="annual" /> 연봉제</label>
      <label><input type="radio" name="salary_type" value="monthly" /> 월급제</label>
    </div>
    
    {/* 급여 범위 */}
    <div class="grid grid-cols-2 gap-4">
      <input type="number" id="salary_min" placeholder="최소" />
      <input type="number" id="salary_max" placeholder="최대" />
    </div>
    <div class="text-sm text-gray-500">단위: 만원 (세전)</div>
    
    {/* 인센티브 */}
    <div>
      <label><input type="radio" name="has_incentive" value="yes" /> 있음</label>
      <label><input type="radio" name="has_incentive" value="no" /> 없음</label>
      <textarea id="incentive_details" placeholder="인센티브 상세 내용"></textarea>
    </div>
  </div>
  
  {/* 3.2 복리후생 */}
  <div class="bg-gray-50 rounded-lg p-4 mb-6">
    <h3>3.2 복리후생 (Welfare)</h3>
    
    {/* 4대 보험 */}
    <div class="grid grid-cols-2 gap-4">
      <label><input type="checkbox" name="social_insurance" value="pension" /> 국민연금</label>
      <label><input type="checkbox" name="social_insurance" value="health" /> 건강보험</label>
      <label><input type="checkbox" name="social_insurance" value="employment" /> 고용보험</label>
      <label><input type="checkbox" name="social_insurance" value="industrial" /> 산재보험</label>
    </div>
    
    {/* 퇴직연금 */}
    <div>
      <label><input type="checkbox" name="has_pension" value="yes" /> 퇴직연금</label>
      <select id="pension_type">
        <option value="DC">DC형</option>
        <option value="DB">DB형</option>
      </select>
    </div>
    
    {/* 복지 */}
    <div class="grid grid-cols-2 gap-4">
      <label><input type="checkbox" name="welfare_benefits" value="meal" /> 중식 제공</label>
      <label><input type="checkbox" name="welfare_benefits" value="health_check" /> 건강 검진</label>
      <label><input type="checkbox" name="welfare_benefits" value="education" /> 자기계발비</label>
      <label><input type="checkbox" name="welfare_benefits" value="event" /> 경조사 지원</label>
    </div>
  </div>
  
  {/* 3.3 외국인 지원 */}
  <div class="bg-gray-50 rounded-lg p-4">
    <h3>3.3 외국인 지원 (Support for Foreigners)</h3>
    
    {/* 비자 지원 */}
    <div>
      <label>E-7 비자 발급/연장 지원</label>
      <div class="flex flex-col gap-2">
        <label><input type="radio" name="visa_support_level" value="full" /> 전면 지원 (비용 전액)</label>
        <label><input type="radio" name="visa_support_level" value="partial" /> 부분 지원 (비용 일부)</label>
        <label><input type="radio" name="visa_support_level" value="assistance" /> 협조만 제공 (서류 지원)</label>
        <label><input type="radio" name="visa_support_level" value="none" /> 지원 없음</label>
      </div>
      <textarea id="visa_support_details"></textarea>
    </div>
    
    {/* 주거 지원 */}
    <div>
      <label>주거 지원</label>
      <div class="flex flex-col gap-2">
        <label><input type="radio" name="housing_support_type" value="dorm_free" /> 기숙사 제공 (무료)</label>
        <label><input type="radio" name="housing_support_type" value="dorm_paid" /> 기숙사 제공 (유료)</label>
        <label><input type="radio" name="housing_support_type" value="allowance" /> 주거 지원금</label>
        <label><input type="radio" name="housing_support_type" value="none" /> 지원 없음</label>
      </div>
      <input type="number" id="housing_support_amount" placeholder="금액 (만원/월)" />
    </div>
    
    {/* 정착 지원 */}
    <div>
      <label>한국 정착 지원</label>
      <div class="grid grid-cols-2 gap-4">
        <label><input type="checkbox" name="settlement_support" value="korean" /> 한국어 교육</label>
        <label><input type="checkbox" name="settlement_support" value="mentoring" /> 1:1 멘토링</label>
        <label><input type="checkbox" name="settlement_support" value="culture" /> 문화 적응 프로그램</label>
        <label><input type="checkbox" name="settlement_support" value="pickup" /> 공항 픽업</label>
      </div>
    </div>
  </div>
</div>
```

## JavaScript 함수 추가 필요

### 1. E-7 코드 로딩
```javascript
async function loadE7VisaCodes() {
  const response = await fetch('/data/e7-visa-codes.json');
  const data = await response.json();
  populateE7Select(data);
}
```

### 2. 동적 옵션 생성
```javascript
function populateE7Select(data) {
  const select = document.getElementById('e7_visa_code');
  data.categories.forEach(category => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category.name;
    category.subcategories.forEach(sub => {
      sub.jobs.forEach(job => {
        const option = document.createElement('option');
        option.value = job.code;
        option.textContent = `[${job.code}] ${job.name}`;
        option.dataset.minSalary = category.minSalary;
        optgroup.appendChild(option);
      });
    });
    select.appendChild(optgroup);
  });
}
```

### 3. 연봉 요건 자동 표시
```javascript
document.getElementById('e7_visa_code').addEventListener('change', (e) => {
  const selectedOption = e.target.options[e.target.selectedIndex];
  const minSalary = selectedOption.dataset.minSalary;
  if (minSalary) {
    const salaryText = (minSalary / 10000).toFixed(0);
    document.getElementById('salary_requirement').textContent = 
      `최소 연봉 요건: ${salaryText}만원 이상 (${(minSalary / 10000000).toFixed(2)}억원)`;
    document.getElementById('salary_min').min = salaryText;
  }
});
```

### 4. 조건부 필드 표시
```javascript
document.querySelectorAll('input[name="contract_type"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const durationField = document.getElementById('contract_duration');
    if (e.target.value === 'contract' || e.target.value === 'intern') {
      durationField.parentElement.classList.remove('hidden');
      durationField.required = true;
    } else {
      durationField.parentElement.classList.add('hidden');
      durationField.required = false;
    }
  });
});
```

## 데이터 저장 형식

```javascript
const profileData = {
  // 2.1 채용 직무 정의
  job_title_ko: '3D 설계 엔지니어',
  job_title_en: '3D Design Engineer',
  e7_visa_code: 'E-7-1-02-001',
  e7_visa_job_name: '기계 설계 엔지니어',
  job_responsibilities: '...',
  
  // 2.2 자격 요건
  required_degree: 'bachelor',
  required_major: '기계공학, 산업공학',
  required_experience: '3year',
  korean_level: 'topik3',
  other_languages: JSON.stringify(['english', 'chinese']),
  
  // 2.3 근무 조건
  contract_type: 'fulltime',
  working_hours_per_week: 40,
  working_time: '09:00-18:00',
  annual_leave: '연차 15일',
  workplace_address: '서울 강남구...',
  
  // 3.1 보상
  salary_type: 'annual',
  salary_min: 4500,
  salary_max: 5500,
  has_incentive: 'yes',
  incentive_details: '...',
  
  // 3.2 복리후생
  social_insurance: JSON.stringify(['pension', 'health', 'employment', 'industrial']),
  has_pension: 'yes',
  pension_type: 'DC',
  welfare_benefits: JSON.stringify(['meal', 'health_check']),
  
  // 3.3 외국인 지원
  visa_support_level: 'full',
  visa_support_details: '...',
  housing_support_type: 'dorm_free',
  housing_support_amount: 0,
  settlement_support: JSON.stringify(['korean', 'mentoring'])
};
```

## 구현 순서

1. ✅ E-7 코드 JSON 파일 생성
2. ✅ 데이터베이스 마이그레이션
3. ⏳ 프론트엔드 HTML 교체 (섹션 2, 3)
4. ⏳ JavaScript 함수 추가
5. ⏳ 백엔드 API 수정
6. ⏳ 테스트 및 배포
