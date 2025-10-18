# 에이전트 지역 선택 및 프로필 수정 기능 구현

## 📋 개요

해외 에이전트의 실무 특성을 반영하여 담당 지역 선택 및 프로필 정보 관리 기능을 구현했습니다.

**배포 URL**: https://a072f650.wow-campus-platform.pages.dev

## 🎯 구현된 기능

### 1. 데이터베이스 스키마 확장

#### 새로운 필드 추가 (Migration 0008)
```sql
ALTER TABLE agents ADD COLUMN primary_regions TEXT;      -- 담당 지역 (JSON array)
ALTER TABLE agents ADD COLUMN language_skills TEXT;      -- 언어 능력 (JSON object)
ALTER TABLE agents ADD COLUMN introduction TEXT;         -- 에이전시 소개
ALTER TABLE agents ADD COLUMN contact_phone TEXT;        -- 연락처
ALTER TABLE agents ADD COLUMN contact_email TEXT;        -- 이메일
ALTER TABLE agents ADD COLUMN certifications TEXT;       -- 자격증 (JSON array)
ALTER TABLE agents ADD COLUMN service_areas TEXT;        -- 전문 분야 (JSON array)
```

**필드 설명**:
- `primary_regions`: ["vietnam", "thailand", "philippines"] 형식의 JSON 배열
- `language_skills`: {"korean": "advanced", "english": "intermediate"} 형식
- `service_areas`: ["manufacturing", "it", "construction"] 형식의 JSON 배열

### 2. 담당 지역 리스트

#### 지원 국가/지역 (12개)
| 국가 | Flag | 주요 언어 |
|------|------|-----------|
| 베트남 | 🇻🇳 | Vietnamese, Korean, English |
| 태국 | 🇹🇭 | Thai, Korean, English |
| 필리핀 | 🇵🇭 | Tagalog, English, Korean |
| 우즈베키스탄 | 🇺🇿 | Uzbek, Russian, Korean |
| 몽골 | 🇲🇳 | Mongolian, Korean, English |
| 네팔 | 🇳🇵 | Nepali, English, Korean |
| 미얀마 | 🇲🇲 | Burmese, English, Korean |
| 캄보디아 | 🇰🇭 | Khmer, English, Korean |
| 인도네시아 | 🇮🇩 | Indonesian, English, Korean |
| 방글라데시 | 🇧🇩 | Bengali, English, Korean |
| 스리랑카 | 🇱🇰 | Sinhala, Tamil, English |
| 기타 | 🌏 | - |

**특징**:
- 복수 선택 가능 (여러 국가 담당 가능)
- 국기 이모지로 시각적 표현
- 지역별 주요 언어 정보 포함

### 3. 전문 분야 리스트

#### 서비스 영역 (13개)
- 제조업 (manufacturing)
- IT/소프트웨어 (it)
- 건설 (construction)
- 농업 (agriculture)
- 서비스업 (service)
- 호텔/관광 (hospitality)
- 의료/간병 (healthcare)
- 교육 (education)
- 물류/운송 (logistics)
- 식음료 (food)
- 유통/판매 (retail)
- 엔지니어링 (engineering)
- 기타 (other)

**특징**:
- 복수 선택 가능
- 매칭 시스템에 활용 가능

### 4. 언어 능력 레벨

#### 6단계 평가 시스템
- **모국어** (native): 원어민 수준
- **유창함** (fluent): 완벽한 의사소통 가능
- **상급** (advanced): 업무상 불편 없음
- **중급** (intermediate): 일상 대화 가능
- **초급** (beginner): 기초 회화 가능
- **불가** (none): 구사 불가

**특징**:
- 한국어, 영어 기본 제공
- 추가 언어 동적 입력 가능

## 📁 새로 생성된 파일

### 1. `/src/constants/regions.ts`
```typescript
// 지역, 전문 분야, 언어 레벨 상수 정의
export const AGENT_REGIONS: AgentRegion[] = [...]
export const SERVICE_AREAS = [...]
export const LANGUAGE_LEVELS = [...]

// 헬퍼 함수
export function getRegionLabel(value: string): string
export function getRegionLabels(values: string[]): string
```

**목적**: 
- 코드 중복 방지
- 일관된 레이블 제공
- 타입 안정성 확보

### 2. `/migrations/0008_add_agent_region_and_profile_fields.sql`
데이터베이스 스키마 확장 마이그레이션

## 🔧 API 엔드포인트

### GET `/api/agents/profile`
**목적**: 현재 에이전트의 전체 프로필 조회

**응답 예시**:
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "user_id": 10,
    "agency_name": "Vietnam Talent Agency",
    "license_number": "VTA-2024-001",
    "contact_phone": "+84-123-456-789",
    "contact_email": "contact@vta.com",
    "experience_years": 5,
    "introduction": "베트남 최고의 인재 에이전시...",
    "primary_regions": ["vietnam", "thailand"],
    "service_areas": ["manufacturing", "it"],
    "language_skills": {
      "korean": "advanced",
      "english": "fluent",
      "vietnamese": "native"
    },
    "total_placements": 120,
    "success_rate": 85.5,
    "commission_rate": 12.0
  }
}
```

**특징**:
- JSON 필드 자동 파싱
- 사용자 정보 JOIN
- 에이전트 전용 (인증 필수)

### PUT `/api/agents/profile`
**목적**: 에이전트 프로필 수정

**요청 예시**:
```json
{
  "agency_name": "Updated Agency Name",
  "contact_phone": "+82-10-1234-5678",
  "contact_email": "new@email.com",
  "experience_years": 6,
  "introduction": "새로운 소개 내용...",
  "primary_regions": ["vietnam", "thailand", "philippines"],
  "service_areas": ["it", "manufacturing"],
  "language_skills": {
    "korean": "advanced",
    "english": "fluent"
  }
}
```

**검증 규칙**:
- `agency_name`: 필수, 최소 1자
- `contact_phone`: 필수
- `contact_email`: 필수, 이메일 형식
- `primary_regions`: 최소 1개 필수
- 나머지 필드: 선택 사항

**응답**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": { /* 업데이트된 프로필 */ }
}
```

## 🖥️ 사용자 인터페이스

### 1. 프로필 수정 페이지 (`/agents/profile/edit`)

#### 섹션 구성

**기본 정보**:
- 에이전시명 (필수)
- 라이선스 번호
- 연락처 (필수)
- 이메일 (필수)
- 경력 연수
- 에이전시 소개 (textarea)

**담당 지역** (필수):
- 12개 국가 체크박스
- 국기 이모지와 함께 표시
- 복수 선택 가능
- 최소 1개 이상 필수

**전문 분야**:
- 13개 서비스 영역 체크박스
- 복수 선택 가능

**언어 능력**:
- 한국어 레벨 (select)
- 영어 레벨 (select)
- 추가 언어 동적 입력
  - 언어명 입력 필드
  - 레벨 선택
  - 삭제 버튼

**버튼**:
- 저장 (파란색, 전체 폭)
- 취소 (회색 테두리, /agents로 이동)

#### JavaScript 기능

**폼 로딩**:
```javascript
async function loadProfileData()
  → GET /api/agents/profile
  → 폼에 데이터 자동 채우기
```

**체크박스 상태 복원**:
- 저장된 지역/전문분야 자동 선택
- 언어 능력 select 옵션 설정
- 추가 언어 필드 동적 생성

**언어 필드 관리**:
```javascript
function addLanguageField(langName, langLevel)
  → 새 언어 입력 필드 추가
  → 고유 ID 부여

function removeLanguageField(id)
  → 특정 언어 필드 제거
```

**폼 제출**:
```javascript
form.addEventListener('submit', async (e) => {
  1. 데이터 수집 (체크박스, select, input)
  2. 필수 입력 검증
  3. PUT /api/agents/profile 요청
  4. 성공 시 /agents로 리다이렉트
})
```

**유효성 검증**:
- 에이전시명 필수
- 연락처 필수
- 이메일 필수
- 최소 1개 지역 필수
- 즉시 피드백 (alert)

### 2. 에이전트 대시보드 업데이트

#### 빠른 액션 섹션
```jsx
<a href="/agents/profile/edit" class="border-blue-500 bg-blue-50">
  <i class="fas fa-user-edit text-blue-600"></i>
  프로필 수정 (강조 표시)
</a>
```

**위치**: 빠른 액션 카드 최상단

#### 에이전시 정보 카드 업데이트

**이전**:
- 에이전시명
- 경력
- 전문분야
- 담당국가

**현재**:
- 에이전시명
- 경력
- **담당 지역** (국기 이모지 포함) ✨ NEW
- **전문분야** (service_areas) ✨ NEW
- **연락처** ✨ NEW
- 편집 아이콘 (우상단)

#### 데이터 표시 로직

**담당 지역 매핑**:
```javascript
const regionMap = {
  'vietnam': '🇻🇳 베트남',
  'thailand': '🇹🇭 태국',
  // ...
};
const regions = profile.primary_regions
  .map(r => regionMap[r] || r)
  .join(', ');
```

**전문 분야 매핑**:
```javascript
const areaMap = {
  'manufacturing': '제조업',
  'it': 'IT',
  // ...
};
const areas = profile.service_areas
  .map(a => areaMap[a] || a)
  .join(', ');
```

### 3. 회원가입 폼 업데이트

#### 에이전트 회원가입 시 추가 데이터 수집

**요청 구조**:
```javascript
{
  email: "...",
  password: "...",
  name: "Agency Name",
  user_type: "agent",
  agentData: {
    primary_regions: ["vietnam", "thailand"],
    service_areas: ["manufacturing", "it"],
    language_skills: {
      korean: "intermediate",
      english: "fluent"
    },
    contact_phone: "+84-123-456-789",
    contact_email: "contact@agency.com",
    introduction: "소개 내용..."
  }
}
```

**처리 로직** (`src/routes/auth.ts`):
```typescript
if (user_type === 'agent') {
  const agentData = requestData.agentData || {};
  const primaryRegions = agentData.primary_regions || [];
  // ... 데이터 추출 및 JSON 변환
  
  await DB.prepare(`
    INSERT INTO agents (
      user_id, agency_name, primary_regions,
      language_skills, service_areas, ...
    ) VALUES (?, ?, ?, ?, ?, ...)
  `).bind(...).run();
}
```

## 🔄 데이터 흐름

### 프로필 로드 시퀀스
```
1. 사용자 접속: /agents/profile/edit
2. DOMContentLoaded 이벤트
3. loadProfileData() 호출
   → GET /api/agents/profile
   → 응답: { success: true, profile: {...} }
4. populateForm(profile) 호출
   → 기본 정보 input.value 설정
   → 체크박스 checked 설정
   → select 옵션 selected 설정
   → 추가 언어 필드 동적 생성
5. 사용자 수정 가능 상태
```

### 프로필 저장 시퀀스
```
1. 사용자 폼 작성/수정
2. "저장" 버튼 클릭
3. form submit 이벤트
4. 데이터 수집:
   - input values
   - checked checkboxes → array
   - select values → object
5. 유효성 검증
   ✗ 필수 필드 누락 → alert 표시
   ✓ 모두 충족
6. PUT /api/agents/profile
   - Authorization: Bearer token
   - Body: JSON 데이터
7. 서버 처리:
   - 인증 확인
   - 데이터 검증
   - JSON.stringify() for arrays/objects
   - UPDATE agents SET ...
8. 응답:
   ✓ success → alert + redirect to /agents
   ✗ error → alert with error message
```

## 📊 데이터 구조 예시

### 데이터베이스 저장 형식

**agents 테이블 레코드**:
```sql
id: 1
user_id: 10
agency_name: "Vietnam HR Solutions"
license_number: "VHR-2024-001"
contact_phone: "+84-90-123-4567"
contact_email: "contact@vhr.vn"
experience_years: 7
introduction: "베트남 현지 기반 20년 경력의 전문 에이전시..."
primary_regions: '["vietnam","thailand","cambodia"]'
service_areas: '["manufacturing","construction","hospitality"]'
language_skills: '{"korean":"advanced","english":"fluent","vietnamese":"native"}'
certifications: '[]'
specialization: '["E9비자","건설업","제조업"]'
commission_rate: 12.0
total_placements: 156
success_rate: 88.5
```

### API 응답 형식 (파싱 후)

```json
{
  "id": 1,
  "agency_name": "Vietnam HR Solutions",
  "primary_regions": ["vietnam", "thailand", "cambodia"],
  "service_areas": ["manufacturing", "construction", "hospitality"],
  "language_skills": {
    "korean": "advanced",
    "english": "fluent",
    "vietnamese": "native"
  }
}
```

## 🎨 UI 컴포넌트

### 지역 선택 체크박스
```jsx
<label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
  <input 
    type="checkbox" 
    name="primary_regions" 
    value="vietnam"
    class="mr-3 w-4 h-4 text-blue-600"
  />
  <span class="text-2xl mr-2">🇻🇳</span>
  <span class="font-medium">베트남</span>
</label>
```

**스타일 특징**:
- 전체 라벨 영역 클릭 가능
- hover 시 배경 회색
- 국기 이모지 큰 크기
- 파란색 체크박스

### 언어 능력 필드
```jsx
<div class="flex space-x-3">
  <input 
    type="text" 
    placeholder="언어명 (예: 베트남어)"
    data-lang-name
  />
  <select data-lang-level>
    <option value="native">모국어</option>
    <option value="fluent">유창함</option>
    <!-- ... -->
  </select>
  <button onclick="removeLanguageField(id)">
    <i class="fas fa-times"></i>
  </button>
</div>
```

**동적 추가/제거**:
- "언어 추가" 버튼 클릭 → 새 필드 생성
- X 버튼 → 해당 필드 제거
- 데이터 속성으로 식별 (data-lang-name, data-lang-level)

### 에이전시 정보 카드 (대시보드)
```jsx
<div class="bg-white rounded-lg shadow-sm p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-bold">에이전시 정보</h2>
    <a href="/agents/profile/edit" class="text-blue-600">
      <i class="fas fa-edit"></i>
    </a>
  </div>
  <div class="space-y-3 text-sm">
    <div class="flex justify-between">
      <span class="text-gray-600">담당 지역:</span>
      <span id="primary-regions">🇻🇳 베트남, 🇹🇭 태국</span>
    </div>
    <!-- ... -->
  </div>
</div>
```

## 🧪 테스트 시나리오

### 1. 프로필 최초 작성
1. 에이전트로 로그인
2. 대시보드에서 "프로필 수정" 클릭
3. 모든 필드 작성:
   - 에이전시명: "테스트 에이전시"
   - 연락처: "+82-10-1234-5678"
   - 이메일: "test@agency.com"
   - 지역: 베트남, 태국 체크
   - 전문분야: 제조업, IT 체크
   - 한국어: 상급
   - 영어: 중급
4. "저장" 클릭
5. ✅ 대시보드로 리다이렉트
6. ✅ 정보가 올바르게 표시됨

### 2. 프로필 수정
1. 대시보드에서 "프로필 수정" 클릭
2. ✅ 기존 정보가 폼에 채워져 있음
3. 지역 추가: 필리핀 체크
4. 언어 추가: "베트남어", "유창함"
5. 소개 작성
6. "저장" 클릭
7. ✅ 변경사항 반영됨

### 3. 필수 입력 검증
1. 프로필 수정 페이지 진입
2. 에이전시명 삭제
3. "저장" 클릭
4. ✅ "에이전시명을 입력해주세요" alert
5. 지역 모두 체크 해제
6. "저장" 클릭
7. ✅ "최소 1개 이상의 담당 지역을 선택해주세요" alert

### 4. 대시보드 표시 확인
1. 프로필 작성 완료 후 대시보드 확인
2. ✅ 에이전시 정보 카드에 정보 표시:
   - 담당 지역: 🇻🇳 베트남, 🇹🇭 태국
   - 전문분야: 제조업, IT
   - 연락처: +82-10-1234-5678
3. ✅ 편집 아이콘 표시
4. 편집 아이콘 클릭
5. ✅ 프로필 수정 페이지로 이동

### 5. 언어 필드 동적 관리
1. 프로필 수정 페이지
2. "언어 추가" 클릭
3. ✅ 새 입력 필드 생성
4. "중국어", "초급" 입력
5. 다시 "언어 추가" 클릭
6. ✅ 또 다른 필드 생성
7. "일본어", "중급" 입력
8. 중국어 필드의 X 클릭
9. ✅ 중국어 필드만 제거됨
10. 저장
11. ✅ 일본어만 저장됨

## 🚀 배포 정보

### 마이그레이션 상태
- ✅ Local migration applied (0008)
- ✅ Remote migration applied (0008)
- ✅ 8개 migrations 모두 production 적용됨

### Git 커밋
**Commit**: 953ced8
```
feat: Add agent region selection and profile editing

- Created new migration (0008) for agent region and profile fields
- Added region constants with flags and language mapping
- Enhanced agent signup to collect region and service area data
- Implemented agent profile API endpoints
- Created comprehensive profile edit page
- Updated agent dashboard
```

### 배포
- **Platform**: Cloudflare Pages
- **URL**: https://a072f650.wow-campus-platform.pages.dev
- **Status**: ✅ Live
- **Build**: ✅ Successful (868.65 kB)

## 📈 활용 방안

### 1. 매칭 시스템 개선
```javascript
// 구직자 국적과 에이전트 담당 지역 자동 매칭
function findSuitableAgents(jobseeker) {
  const nationality = jobseeker.nationality; // "Vietnamese"
  
  return agents.filter(agent => 
    agent.primary_regions.includes(
      nationalityToRegion(nationality) // "vietnam"
    )
  );
}
```

### 2. 검색 및 필터링
```sql
-- 특정 지역 담당 에이전트 검색
SELECT * FROM agents 
WHERE primary_regions LIKE '%"vietnam"%'
  AND service_areas LIKE '%"it"%';
```

### 3. 통계 및 분석
```javascript
// 지역별 에이전트 분포
const regionStats = agents.reduce((acc, agent) => {
  agent.primary_regions.forEach(region => {
    acc[region] = (acc[region] || 0) + 1;
  });
  return acc;
}, {});
// { vietnam: 15, thailand: 12, philippines: 10, ... }
```

### 4. 추천 시스템
```javascript
// 구인기업에 적합한 에이전트 추천
function recommendAgents(company, jobPosting) {
  return agents.filter(agent => {
    // 지역 매칭
    const regionMatch = agent.primary_regions.includes(
      jobPosting.target_nationality
    );
    
    // 전문분야 매칭
    const industryMatch = agent.service_areas.includes(
      company.industry
    );
    
    // 언어 능력 확인
    const languageMatch = agent.language_skills.korean 
      && ['advanced', 'fluent', 'native'].includes(
        agent.language_skills.korean
      );
    
    return regionMatch && industryMatch && languageMatch;
  })
  .sort((a, b) => b.success_rate - a.success_rate)
  .slice(0, 5);
}
```

## 🔮 향후 개선 사항

### 1. 고급 검색 기능
- 지역별 에이전트 필터링
- 전문분야별 필터링
- 언어 능력별 필터링
- 성공률/경력 기반 정렬

### 2. 지역별 대시보드
```javascript
// 지역별 성과 분석
GET /api/agents/stats/by-region
→ {
  vietnam: { placements: 50, success_rate: 90% },
  thailand: { placements: 30, success_rate: 85% }
}
```

### 3. 자격증 관리
- 라이선스 파일 업로드
- 만료일 추적
- 갱신 알림

### 4. 다국어 지원
- 각 국가별 언어로 페이지 번역
- 지역 맞춤 콘텐츠

### 5. 자동 매칭 알고리즘
```javascript
// AI 기반 에이전트-구직자 매칭
function smartMatch(jobseeker) {
  const scores = agents.map(agent => ({
    agent,
    score: calculateMatchScore(jobseeker, agent)
  }));
  
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
```

## 📝 주요 변경 사항 요약

| 파일 | 변경 내용 |
|------|----------|
| `migrations/0008_*.sql` | 에이전트 테이블에 7개 컬럼 추가 |
| `src/constants/regions.ts` | 지역, 전문분야, 언어 레벨 상수 정의 (NEW) |
| `src/routes/agents.ts` | 프로필 API 2개 추가 (GET, PUT) |
| `src/routes/auth.ts` | 회원가입 시 에이전트 데이터 수집 로직 추가 |
| `src/index.tsx` | 프로필 수정 페이지 추가 (400+ lines) |
| `src/index.tsx` | 대시보드 정보 표시 업데이트 |

## ✅ 완료 체크리스트

- [x] 데이터베이스 마이그레이션 생성
- [x] 지역/전문분야 상수 정의
- [x] 프로필 조회 API 구현
- [x] 프로필 수정 API 구현
- [x] 회원가입 폼 업데이트
- [x] 프로필 수정 페이지 UI 구현
- [x] 대시보드 정보 표시 업데이트
- [x] 폼 유효성 검증 구현
- [x] 언어 필드 동적 관리 구현
- [x] 로컬 마이그레이션 적용
- [x] 원격 마이그레이션 적용
- [x] 빌드 테스트 완료
- [x] 배포 완료
- [x] GitHub 푸시 완료
- [x] 문서 작성 완료

---

**구현 일자**: 2025-10-18  
**마지막 업데이트**: 2025-10-18  
**상태**: ✅ 완료 및 배포됨
