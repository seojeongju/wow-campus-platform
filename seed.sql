-- WOW-CAMPUS Work Platform 테스트 데이터

-- 관리자 사용자 생성 (password: password123)
INSERT OR IGNORE INTO users (email, password_hash, user_type, status, name, phone) VALUES 
  ('admin@wowcampus.com', '5eb5475a711ef49bf95d5841b403c851e1abc5226df2e3a01f5fbef0c0eb223c', 'admin', 'approved', '관리자', '010-0000-0000');

-- 구인기업 사용자 생성 (password: company123)
INSERT OR IGNORE INTO users (email, password_hash, user_type, status, name, phone) VALUES 
  ('hr@samsung.com', '45e31284eb594acc19efab07a2ea68489b91d1f74b0eba1e0f57369971a6b6c8', 'company', 'approved', '삼성전자 인사담당자', '010-1111-1111'),
  ('recruit@naver.com', '45e31284eb594acc19efab07a2ea68489b91d1f74b0eba1e0f57369971a6b6c8', 'company', 'approved', '네이버 채용담당자', '010-2222-2222'),
  ('jobs@kakao.com', '45e31284eb594acc19efab07a2ea68489b91d1f74b0eba1e0f57369971a6b6c8', 'company', 'pending', '카카오 채용팀', '010-3333-3333');

-- 구직자 사용자 생성 (password: jobseeker123)
INSERT OR IGNORE INTO users (email, password_hash, user_type, status, name, phone) VALUES 
  ('john.doe@email.com', '40e0537224af5a0202a212394003ade84a14f9250b4a18d58828c2fa13751823', 'jobseeker', 'approved', 'John Doe', '010-4444-4444'),
  ('maria.garcia@email.com', '40e0537224af5a0202a212394003ade84a14f9250b4a18d58828c2fa13751823', 'jobseeker', 'approved', 'Maria Garcia', '010-5555-5555'),
  ('tanaka.hiroshi@email.com', '40e0537224af5a0202a212394003ade84a14f9250b4a18d58828c2fa13751823', 'jobseeker', 'pending', 'Tanaka Hiroshi', '010-6666-6666');

-- 에이전트 사용자 생성 (password: agent123)
INSERT OR IGNORE INTO users (email, password_hash, user_type, status, name, phone) VALUES 
  ('agent@globalrecruiters.com', 'de74bc23fd034a873d2f1725d31d473f626f514479a4cc6f888482440c6e9942', 'agent', 'approved', '글로벌리크루터스 에이전트', '010-7777-7777'),
  ('contact@asiabridge.com', 'de74bc23fd034a873d2f1725d31d473f626f514479a4cc6f888482440c6e9942', 'agent', 'approved', '아시아브릿지 상담사', '010-8888-8888');

-- 구인기업 상세정보
INSERT OR IGNORE INTO companies (user_id, company_name, business_number, industry, company_size, address, website, description, founded_year, employee_count) VALUES 
  (2, '삼성전자', '123-45-67890', 'IT/전자', 'large', '서울시 강남구', 'https://www.samsung.com', '글로벌 전자기업', 1969, 50000),
  (3, '네이버', '234-56-78901', 'IT/인터넷', 'large', '경기도 성남시', 'https://www.naver.com', '대한민국 대표 인터넷 기업', 1999, 5000),
  (4, '카카오', '345-67-89012', 'IT/모바일', 'large', '경기도 성남시', 'https://www.kakaocorp.com', '모바일 플랫폼 기업', 1995, 4000);

-- 구직자 상세정보
INSERT OR IGNORE INTO jobseekers (user_id, first_name, last_name, nationality, birth_date, gender, visa_status, korean_level, english_level, education_level, major, experience_years, current_location, preferred_location, salary_expectation, skills, bio) VALUES 
  (5, 'John', 'Doe', 'USA', '1995-03-15', 'male', 'F-2', 'intermediate', 'native', 'Bachelor', 'Computer Science', 3, 'Seoul', 'Seoul/Gyeonggi', 45000000, '["Java", "Spring Boot", "React", "MySQL"]', 'Experienced software developer looking for opportunities in Korea'),
  (6, 'Maria', 'Garcia', 'Spain', '1992-07-22', 'female', 'E-7', 'elementary', 'native', 'Master', 'International Business', 5, 'Busan', 'Seoul/Busan', 50000000, '["Marketing", "Business Analysis", "Spanish", "English"]', 'International business professional with strong marketing background'),
  (7, 'Hiroshi', 'Tanaka', 'Japan', '1990-11-08', 'male', 'D-8', 'advanced', 'intermediate', 'Bachelor', 'Mechanical Engineering', 7, 'Tokyo', 'Seoul', 55000000, '["CAD", "SolidWorks", "Manufacturing", "Quality Control"]', 'Experienced mechanical engineer with automotive industry background');

-- 에이전트 상세정보
INSERT OR IGNORE INTO agents (user_id, agency_name, license_number, specialization, commission_rate, countries_covered, languages, experience_years, total_placements, success_rate) VALUES 
  (8, '글로벌리크루터스', 'GR-2020-001', '["IT", "Engineering", "Business"]', 15.00, '["USA", "Canada", "UK", "Australia"]', '["English", "Korean"]', 8, 156, 85.50),
  (9, '아시아브릿지', 'AB-2019-002', '["Healthcare", "Education", "Hospitality"]', 12.00, '["Japan", "China", "Vietnam", "Philippines"]', '["Korean", "Japanese", "Chinese", "English"]', 5, 89, 78.20);

-- 구인공고 샘플
INSERT OR IGNORE INTO job_postings (company_id, title, description, requirements, responsibilities, job_type, job_category, location, salary_min, salary_max, visa_sponsorship, korean_required, experience_level, skills_required, benefits, application_deadline, positions_available) VALUES 
  (1, 'Senior Software Engineer', 'Join our innovative development team to build next-generation mobile applications', 'Bachelor degree in Computer Science or related field, 3+ years experience', 'Develop and maintain mobile applications, collaborate with cross-functional teams', 'full_time', 'Software Development', 'Seoul', 45000000, 65000000, TRUE, FALSE, 'mid', '["Java", "Kotlin", "Android", "Git"]', 'Health insurance, annual bonus, flexible working hours', '2024-12-31', 2),
  (2, 'UX Designer', 'Create intuitive and engaging user experiences for our web and mobile platforms', 'Portfolio demonstrating UX/UI design skills, proficiency in design tools', 'Design user interfaces, conduct user research, create prototypes', 'full_time', 'Design', 'Seongnam', 40000000, 55000000, TRUE, FALSE, 'junior', '["Figma", "Sketch", "Adobe Creative Suite", "Prototyping"]', 'Creative workspace, education support, team dinners', '2024-11-30', 1),
  (3, 'International Marketing Manager', 'Lead our global marketing initiatives and expand into new markets', 'MBA preferred, 5+ years marketing experience, fluent in English', 'Develop marketing strategies, manage international campaigns, analyze market trends', 'full_time', 'Marketing', 'Seoul', 50000000, 70000000, TRUE, TRUE, 'senior', '["Digital Marketing", "Analytics", "Project Management", "English"]', 'Stock options, overseas training, performance bonus', '2024-12-15', 1);

-- 지원 샘플 데이터
INSERT OR IGNORE INTO applications (job_posting_id, jobseeker_id, agent_id, status, cover_letter, applied_at) VALUES 
  (1, 1, 1, 'reviewed', 'I am very interested in this position as it aligns perfectly with my background in mobile development...', '2024-01-15 10:30:00'),
  (2, 2, 2, 'interview_scheduled', 'As a creative professional with strong UX background, I believe I can contribute significantly to your design team...', '2024-01-16 14:20:00'),
  (3, 2, NULL, 'submitted', 'My international business experience and marketing expertise make me an ideal candidate for this role...', '2024-01-17 09:15:00');

-- 매칭 샘플 데이터
INSERT OR IGNORE INTO matches (job_posting_id, jobseeker_id, agent_id, match_score, match_reasons, status) VALUES 
  (1, 1, 1, 92.50, '["Skills match: 95%", "Location preference: 100%", "Experience level: 85%", "Salary expectation: 90%"]', 'applied'),
  (2, 2, 2, 88.20, '["Creative background: 90%", "Language skills: 95%", "Portfolio quality: 85%"]', 'interested'),
  (3, 3, NULL, 76.80, '["Industry experience: 80%", "Language requirement: 95%", "Education level: 70%"]', 'suggested');

-- 유학 과정 샘플
INSERT OR IGNORE INTO study_programs (program_type, institution_name, program_name, description, duration_months, tuition_fee, location, language_requirement, academic_requirement, application_deadline, start_date, capacity) VALUES 
  ('language_course', '서울대학교 언어교육원', '한국어 집중과정', '외국인을 위한 종합적인 한국어 교육 프로그램', 6, 3000000, 'Seoul', 'None', 'High school diploma', '2024-11-30', '2025-03-01', 30),
  ('undergraduate', '연세대학교', 'Global MBA Program', '글로벌 경영 전문가 양성을 위한 MBA 과정', 24, 25000000, 'Seoul', 'TOEFL 100+', 'Bachelor degree', '2024-12-31', '2025-09-01', 50),
  ('graduate', 'KAIST', 'MS in Computer Science', '최첨단 컴퓨터과학 석사과정', 24, 8000000, 'Daejeon', 'TOEFL 90+', 'Bachelor in CS or related', '2024-10-31', '2025-03-01', 25);

-- 유학 지원 샘플
INSERT OR IGNORE INTO study_applications (program_id, jobseeker_id, agent_id, status, documents_submitted, applied_at) VALUES 
  (1, 3, 2, 'accepted', '["Passport", "Academic Transcript", "Language Certificate"]', '2024-01-10 16:00:00'),
  (2, 2, 1, 'under_review', '["CV", "SOP", "Recommendation Letters", "TOEFL Score"]', '2024-01-12 11:30:00'),
  (3, 1, NULL, 'submitted', '["Transcript", "GRE Score", "Research Proposal"]', '2024-01-14 13:45:00');

-- 수수료 샘플
INSERT OR IGNORE INTO commissions (agent_id, application_id, commission_type, amount, percentage, status, due_date) VALUES 
  (1, 1, 'job_placement', 6750000, 15.00, 'pending', '2024-02-15'),
  (2, 2, 'job_placement', 6600000, 12.00, 'approved', '2024-02-16');

-- 시스템 통계 샘플
INSERT OR IGNORE INTO system_stats (stat_date, total_users, total_companies, total_jobseekers, total_agents, active_job_postings, total_applications, successful_placements, total_revenue) VALUES 
  ('2024-01-01', 50, 15, 25, 8, 12, 45, 8, 15000000),
  ('2024-01-15', 67, 18, 32, 10, 18, 67, 12, 22500000),
  ('2024-01-30', 85, 22, 42, 12, 25, 89, 18, 32000000);

-- 알림 샘플
INSERT OR IGNORE INTO notifications (user_id, title, message, type, related_id, related_type) VALUES 
  (5, '지원 완료', 'Senior Software Engineer 포지션에 성공적으로 지원하였습니다.', 'success', 1, 'application'),
  (2, '새로운 지원자', 'UX Designer 포지션에 새로운 지원자가 있습니다.', 'info', 2, 'application'),
  (6, '면접 일정 확정', 'UX Designer 면접이 1월 25일 오후 2시로 확정되었습니다.', 'info', 2, 'application'),
  (8, '수수료 정산', '1월 성과에 대한 수수료 정산이 완료되었습니다.', 'success', 1, 'commission');