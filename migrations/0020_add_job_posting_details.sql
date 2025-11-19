-- 구인 공고 상세 정보 및 근로 조건 필드 추가
-- 기존 채용 정보 필드 대체 및 확장
-- 작성일: 2025-11-19

-- ============================================
-- 섹션 2: 구인 공고 상세 정보 (Job Posting Details)
-- ============================================

-- 2.1 채용 직무 정의
ALTER TABLE companies ADD COLUMN job_title_ko TEXT DEFAULT '';  -- 채용 직무명 (국문)
ALTER TABLE companies ADD COLUMN job_title_en TEXT DEFAULT '';  -- 채용 직무명 (영문)
ALTER TABLE companies ADD COLUMN e7_visa_code TEXT DEFAULT '';  -- E-7 비자 직종 코드 (가장 중요!)
ALTER TABLE companies ADD COLUMN e7_visa_job_name TEXT DEFAULT '';  -- E-7 직종명
ALTER TABLE companies ADD COLUMN job_responsibilities TEXT DEFAULT '';  -- 상세 담당 업무 및 주요 역할

-- 2.2 자격 요건
ALTER TABLE companies ADD COLUMN required_degree TEXT DEFAULT '';  -- 필수 학위 (학사/석사/박사/무관)
ALTER TABLE companies ADD COLUMN required_major TEXT DEFAULT '';  -- 필수 전공
ALTER TABLE companies ADD COLUMN required_experience TEXT DEFAULT '';  -- 필수 경력 기간 (신입/1년/3년/5년 이상)
ALTER TABLE companies ADD COLUMN korean_level TEXT DEFAULT '';  -- 한국어 능력 (TOPIK 1-6급)
ALTER TABLE companies ADD COLUMN other_languages TEXT DEFAULT '[]';  -- 기타 언어 (JSON 배열) ["영어", "중국어"]

-- 2.3 근무 조건
ALTER TABLE companies ADD COLUMN contract_type TEXT DEFAULT '';  -- 계약 형태 (정규직/계약직/인턴십)
ALTER TABLE companies ADD COLUMN contract_duration TEXT DEFAULT '';  -- 계약 기간 (계약직인 경우)
ALTER TABLE companies ADD COLUMN working_hours_per_week INTEGER DEFAULT 40;  -- 주당 근무 시간
ALTER TABLE companies ADD COLUMN working_time TEXT DEFAULT '';  -- 근무 시간 (09:00-18:00)
ALTER TABLE companies ADD COLUMN work_schedule TEXT DEFAULT '[]';  -- 휴무 제도 (JSON 배열)
ALTER TABLE companies ADD COLUMN annual_leave TEXT DEFAULT '';  -- 연차 제도
ALTER TABLE companies ADD COLUMN workplace_address TEXT DEFAULT '';  -- 근무지 주소 (실제 근무 장소)

-- ============================================
-- 섹션 3: 근로 조건 및 지원 사항 (Compensation & Benefits)
-- ============================================

-- 3.1 보상 (Compensation)
ALTER TABLE companies ADD COLUMN salary_type TEXT DEFAULT '';  -- 급여 형태 (연봉제/월급제)
ALTER TABLE companies ADD COLUMN salary_min INTEGER DEFAULT 0;  -- 최소 급여 (만원 단위, 세전)
ALTER TABLE companies ADD COLUMN salary_max INTEGER DEFAULT 0;  -- 최대 급여 (만원 단위, 세전)
ALTER TABLE companies ADD COLUMN has_incentive TEXT DEFAULT 'no';  -- 인센티브 여부 (yes/no)
ALTER TABLE companies ADD COLUMN incentive_details TEXT DEFAULT '';  -- 인센티브 상세 내용

-- 3.2 복리후생 (Welfare)
ALTER TABLE companies ADD COLUMN social_insurance TEXT DEFAULT '[]';  -- 4대 보험 (JSON 배열) ["국민연금", "건강보험", "고용보험", "산재보험"]
ALTER TABLE companies ADD COLUMN has_pension TEXT DEFAULT 'no';  -- 퇴직연금 여부
ALTER TABLE companies ADD COLUMN pension_type TEXT DEFAULT '';  -- 퇴직연금 유형 (DC/DB)
ALTER TABLE companies ADD COLUMN welfare_benefits TEXT DEFAULT '[]';  -- 복리후생 (JSON 배열) ["중식제공", "건강검진", "자기계발비"]

-- 3.3 외국인 지원 (Support for Foreigners)
ALTER TABLE companies ADD COLUMN visa_support_level TEXT DEFAULT '';  -- 비자 지원 수준 (전면지원/부분지원/협조만/지원없음)
ALTER TABLE companies ADD COLUMN visa_support_details TEXT DEFAULT '';  -- 비자 지원 상세 내용
ALTER TABLE companies ADD COLUMN housing_support_type TEXT DEFAULT '';  -- 주거 지원 유형 (기숙사무료/기숙사유료/지원금/없음)
ALTER TABLE companies ADD COLUMN housing_support_amount INTEGER DEFAULT 0;  -- 주거 지원 금액 (월, 만원)
ALTER TABLE companies ADD COLUMN settlement_support TEXT DEFAULT '[]';  -- 정착 지원 (JSON 배열) ["한국어교육", "멘토링", "문화적응"]

-- ============================================
-- 인덱스 생성 (검색 성능 향상)
-- ============================================

-- 가장 중요한 필드: E-7 비자 코드
CREATE INDEX IF NOT EXISTS idx_companies_e7_code ON companies(e7_visa_code);

-- 급여 범위 검색
CREATE INDEX IF NOT EXISTS idx_companies_salary_min ON companies(salary_min);
CREATE INDEX IF NOT EXISTS idx_companies_salary_max ON companies(salary_max);

-- 계약 형태 필터링
CREATE INDEX IF NOT EXISTS idx_companies_contract_type ON companies(contract_type);

-- 경력 요구사항 필터링
CREATE INDEX IF NOT EXISTS idx_companies_experience ON companies(required_experience);

-- 비자 지원 수준 필터링
CREATE INDEX IF NOT EXISTS idx_companies_visa_support ON companies(visa_support_level);

-- ============================================
-- 기존 필드와의 관계
-- ============================================

-- 기존 유지 필드:
-- - recruitment_positions (채용 직종) -> job_title_ko/e7_visa_code로 대체 가능
-- - recruitment_count (채용 인원) -> 유지
-- - employment_types (근무 형태) -> contract_type으로 대체 가능
-- - minimum_salary (최소 연봉) -> salary_min으로 대체 가능
-- - required_qualifications (필수 자격) -> 세분화됨 (degree, major, experience, language)
-- - support_items (지원 사항) -> 세분화됨 (visa, housing, settlement)

-- 참고: 기존 필드는 호환성을 위해 유지하되, 새로운 필드를 우선 사용 권장

-- ============================================
-- 마이그레이션 완료 확인
-- ============================================
-- SELECT COUNT(*) as new_columns_count 
-- FROM pragma_table_info('companies') 
-- WHERE name LIKE 'job_%' OR name LIKE 'e7_%' OR name LIKE 'required_%' 
--    OR name LIKE 'salary_%' OR name LIKE 'visa_%' OR name LIKE 'housing_%';
