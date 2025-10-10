-- 협약 대학교 테이블 생성
CREATE TABLE IF NOT EXISTS universities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_english TEXT,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  region TEXT NOT NULL, -- 서울, 경기도, 부산, 대구, 광주, 대전, 울산, 세종, 강원도, 충청도, 경상도, 전라도, 제주도
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  established_year INTEGER,
  student_count INTEGER,
  international_programs TEXT, -- JSON 형태로 저장
  tuition_info TEXT, -- JSON 형태로 저장 
  scholarship_info TEXT, -- JSON 형태로 저장
  dormitory_available BOOLEAN DEFAULT FALSE,
  language_support BOOLEAN DEFAULT FALSE,
  ranking_domestic INTEGER,
  ranking_international INTEGER,
  specialties TEXT, -- JSON 배열: ["공학", "경영", "IT", "의학", "예술", "인문학"]
  admission_requirements TEXT, -- JSON 형태로 저장
  contact_person TEXT,
  contact_email TEXT,
  partnership_type TEXT DEFAULT 'standard', -- standard, premium, featured
  is_active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 샘플 대학교 데이터 삽입
INSERT INTO universities (
  name, name_english, description, website_url, region, city, address,
  phone, email, established_year, student_count, 
  specialties, dormitory_available, language_support,
  ranking_domestic, partnership_type, is_active, featured
) VALUES 
(
  '서울대학교', 'Seoul National University',
  '대한민국 최고의 국립대학교로 우수한 교육과 연구 환경을 제공합니다.',
  'https://www.snu.ac.kr', '서울', '관악구',
  '서울특별시 관악구 관악로 1',
  '02-880-5114', 'admission@snu.ac.kr', 1946, 28000,
  '["공학", "경영", "의학", "인문학", "자연과학"]', TRUE, TRUE,
  1, 'premium', TRUE, TRUE
),
(
  '연세대학교', 'Yonsei University',
  '1885년 설립된 명문 사립대학교로 국제적 수준의 교육을 제공합니다.',
  'https://www.yonsei.ac.kr', '서울', '서대문구',
  '서울특별시 서대문구 연세로 50',
  '02-2123-2114', 'admission@yonsei.ac.kr', 1885, 26000,
  '["경영", "공학", "의학", "국제학"]', TRUE, TRUE,
  2, 'premium', TRUE, TRUE
),
(
  '고려대학교', 'Korea University',
  '1905년 설립된 명문 사립대학교로 자유, 정의, 진리의 교육이념을 추구합니다.',
  'https://www.korea.ac.kr', '서울', '성북구',
  '서울특별시 성북구 안암로 145',
  '02-3290-1114', 'admission@korea.ac.kr', 1905, 37000,
  '["경영", "공학", "법학", "정치외교학"]', TRUE, TRUE,
  3, 'premium', TRUE, TRUE
),
(
  'KAIST', 'Korea Advanced Institute of Science and Technology',
  '과학기술 특성화 대학원대학교로 세계적 수준의 연구중심 대학입니다.',
  'https://www.kaist.ac.kr', '대전', '유성구',
  '대전광역시 유성구 대학로 291',
  '042-350-2114', 'admission@kaist.ac.kr', 1971, 10000,
  '["공학", "자연과학", "IT", "바이오"]', TRUE, TRUE,
  4, 'premium', TRUE, TRUE
),
(
  '부산대학교', 'Pusan National University',
  '부산지역 대표 국립대학교로 해양과 항만 특성화 교육을 제공합니다.',
  'https://www.pusan.ac.kr', '부산', '금정구',
  '부산광역시 금정구 부산대학로 63번길 2',
  '051-510-1114', 'admission@pusan.ac.kr', 1946, 30000,
  '["공학", "해양과학", "경영", "인문학"]', TRUE, TRUE,
  7, 'standard', TRUE, FALSE
),
(
  '성균관대학교', 'Sungkyunkwan University',
  '600년 전통의 명문대학교로 현대적 교육과 전통을 조화시킵니다.',
  'https://www.skku.edu', '서울', '종로구',
  '서울특별시 종로구 성균관로 25-2',
  '02-760-1114', 'admission@skku.edu', 1398, 31000,
  '["경영", "공학", "IT", "인문학"]', TRUE, TRUE,
  5, 'premium', TRUE, FALSE
),
(
  '한양대학교', 'Hanyang University',
  '실용학문의 전통을 이어가는 공학 명문 사립대학교입니다.',
  'https://www.hanyang.ac.kr', '서울', '성동구',
  '서울특별시 성동구 왕십리로 222',
  '02-2220-0114', 'admission@hanyang.ac.kr', 1939, 25000,
  '["공학", "건축", "경영", "예술"]', TRUE, TRUE,
  6, 'standard', TRUE, FALSE
),
(
  '경희대학교', 'Kyung Hee University',
  '문화와 평화의 창조를 교육이념으로 하는 종합대학교입니다.',
  'https://www.khu.ac.kr', '서울', '동대문구',
  '서울특별시 동대문구 경희대로 26',
  '02-961-0114', 'admission@khu.ac.kr', 1949, 34000,
  '["호텔관광", "국제학", "한의학", "예술"]', TRUE, TRUE,
  8, 'standard', TRUE, FALSE
);

-- 지역별 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_universities_region ON universities(region);
CREATE INDEX IF NOT EXISTS idx_universities_active ON universities(is_active);
CREATE INDEX IF NOT EXISTS idx_universities_featured ON universities(featured);