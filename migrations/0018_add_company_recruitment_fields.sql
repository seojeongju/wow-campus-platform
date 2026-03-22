-- 구인기업 채용 정보 필드 추가
-- 채용의향서 기반 신규 필드 8개 추가
-- 작성일: 2025-11-13

-- 1. 대표자명 추가 (필수)
ALTER TABLE companies ADD COLUMN representative_name TEXT DEFAULT '';

-- 2. 채용 직종 (JSON 배열)
-- 예: ["3D 설계 엔지니어", "CAD 오퍼레이터", "제품 설계자"]
ALTER TABLE companies ADD COLUMN recruitment_positions TEXT DEFAULT '[]';

-- 3. 채용 인원 (숫자)
ALTER TABLE companies ADD COLUMN recruitment_count INTEGER DEFAULT 0;

-- 4. 근무 형태 (JSON 배열)
-- 예: ["정규직", "계약직", "인턴십"]
ALTER TABLE companies ADD COLUMN employment_types TEXT DEFAULT '[]';

-- 5. 급여 수준 (최소 연봉, 만원 단위)
ALTER TABLE companies ADD COLUMN minimum_salary INTEGER DEFAULT 0;

-- 6. 필수 자격 (JSON 객체)
-- 예: {"certification": "ACU Fusion 자격증", "degree": "학사학위 이상", "korean": "한국어 의사소통 가능"}
ALTER TABLE companies ADD COLUMN required_qualifications TEXT DEFAULT '{}';

-- 7. 지원 사항 (JSON 객체)
-- 예: {"visa_support": true, "korean_education": true, "mentoring": true, "accommodation": true}
ALTER TABLE companies ADD COLUMN support_items TEXT DEFAULT '{}';

-- 8. 채용 일정 (JSON 객체)
-- 예: {"document_screening": "교육 완료 후 1주 이내", "interview": "서류합격자 대상", "final_decision": "면접 후 1주 이내"}
ALTER TABLE companies ADD COLUMN recruitment_schedule TEXT DEFAULT '{}';

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_companies_recruitment_count ON companies(recruitment_count);
CREATE INDEX IF NOT EXISTS idx_companies_minimum_salary ON companies(minimum_salary);
CREATE INDEX IF NOT EXISTS idx_companies_representative ON companies(representative_name);

-- 마이그레이션 완료 확인
-- SELECT sql FROM sqlite_master WHERE type='table' AND name='companies';
