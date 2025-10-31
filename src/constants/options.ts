/**
 * 공통 옵션 상수
 * 모든 페이지에서 일관되게 사용되는 드롭다운 옵션들
 */

// 대한민국 행정구역 (시/도 단위)
export const REGIONS = [
  { value: '', label: '전체 지역' },
  { value: 'Seoul', label: '서울특별시' },
  { value: 'Busan', label: '부산광역시' },
  { value: 'Daegu', label: '대구광역시' },
  { value: 'Incheon', label: '인천광역시' },
  { value: 'Gwangju', label: '광주광역시' },
  { value: 'Daejeon', label: '대전광역시' },
  { value: 'Ulsan', label: '울산광역시' },
  { value: 'Sejong', label: '세종특별자치시' },
  { value: 'Gyeonggi', label: '경기도' },
  { value: 'Gangwon', label: '강원도' },
  { value: 'Chungbuk', label: '충청북도' },
  { value: 'Chungnam', label: '충청남도' },
  { value: 'Jeonbuk', label: '전라북도' },
  { value: 'Jeonnam', label: '전라남도' },
  { value: 'Gyeongbuk', label: '경상북도' },
  { value: 'Gyeongnam', label: '경상남도' },
  { value: 'Jeju', label: '제주특별자치도' }
] as const;

// 비자 종류 (외국인 체류자격)
export const VISA_TYPES = [
  { value: '', label: '전체' },
  // 거주 비자
  { value: 'F-2', label: 'F-2 (거주)', category: '거주' },
  { value: 'F-4', label: 'F-4 (재외동포)', category: '거주' },
  { value: 'F-5', label: 'F-5 (영주)', category: '거주' },
  { value: 'F-6', label: 'F-6 (결혼이민)', category: '거주' },
  // 취업 비자
  { value: 'E-1', label: 'E-1 (교수)', category: '취업' },
  { value: 'E-2', label: 'E-2 (회화지도)', category: '취업' },
  { value: 'E-3', label: 'E-3 (연구)', category: '취업' },
  { value: 'E-4', label: 'E-4 (기술지도)', category: '취업' },
  { value: 'E-5', label: 'E-5 (전문직업)', category: '취업' },
  { value: 'E-6', label: 'E-6 (예술흥행)', category: '취업' },
  { value: 'E-7', label: 'E-7 (특정활동)', category: '취업' },
  { value: 'E-9', label: 'E-9 (비전문취업)', category: '취업' },
  { value: 'E-10', label: 'E-10 (선원취업)', category: '취업' },
  // 기타
  { value: 'D-2', label: 'D-2 (유학)', category: '기타' },
  { value: 'D-4', label: 'D-4 (일반연수)', category: '기타' },
  { value: 'D-8', label: 'D-8 (기업투자)', category: '기타' },
  { value: 'D-9', label: 'D-9 (무역경영)', category: '기타' },
  { value: 'D-10', label: 'D-10 (구직)', category: '기타' },
  { value: 'H-2', label: 'H-2 (방문취업)', category: '기타' }
] as const;

// 비자 스폰서십 옵션 (기업 매칭용)
export const VISA_SPONSORSHIP_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'sponsorship', label: '비자 스폰서십 제공' },
  ...VISA_TYPES.slice(1) // '전체' 제외한 모든 비자 타입
] as const;

// 경력 수준
export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: '신입 (0-1년)' },
  { value: 'junior', label: '주니어 (1-3년)' },
  { value: 'mid', label: '중급 (3-5년)' },
  { value: 'senior', label: '시니어 (5년 이상)' }
] as const;

// 고용 형태
export const JOB_TYPES = [
  { value: 'full-time', label: '정규직' },
  { value: 'contract', label: '계약직' },
  { value: 'part-time', label: '파트타임' },
  { value: 'freelance', label: '프리랜서' },
  { value: 'internship', label: '인턴십' }
] as const;

// 직무 카테고리
export const JOB_CATEGORIES = [
  { value: 'development', label: '개발/IT' },
  { value: 'design', label: '디자인' },
  { value: 'marketing', label: '마케팅/광고' },
  { value: 'sales', label: '영업/제휴' },
  { value: 'management', label: '경영/기획' },
  { value: 'hr', label: '인사/총무' },
  { value: 'finance', label: '재무/회계' },
  { value: 'service', label: '서비스' },
  { value: 'production', label: '생산/제조' },
  { value: 'education', label: '교육' },
  { value: 'other', label: '기타' }
] as const;

// Helper 함수들
export const getRegionLabel = (value: string): string => {
  const region = REGIONS.find(r => r.value === value);
  return region ? region.label : value;
};

export const getVisaLabel = (value: string): string => {
  const visa = VISA_TYPES.find(v => v.value === value);
  return visa ? visa.label : value;
};
