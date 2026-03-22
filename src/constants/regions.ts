/**
 * Agent Region Constants
 * 에이전트가 담당하는 주요 지역 목록
 */

export interface AgentRegion {
  value: string;
  label: string;
  flag: string;
  languages?: string[]; // Common languages in the region
}

export const AGENT_REGIONS: AgentRegion[] = [
  {
    value: 'vietnam',
    label: '베트남',
    flag: '🇻🇳',
    languages: ['Vietnamese', 'Korean', 'English']
  },
  {
    value: 'thailand',
    label: '태국',
    flag: '🇹🇭',
    languages: ['Thai', 'Korean', 'English']
  },
  {
    value: 'philippines',
    label: '필리핀',
    flag: '🇵🇭',
    languages: ['Tagalog', 'English', 'Korean']
  },
  {
    value: 'uzbekistan',
    label: '우즈베키스탄',
    flag: '🇺🇿',
    languages: ['Uzbek', 'Russian', 'Korean']
  },
  {
    value: 'mongolia',
    label: '몽골',
    flag: '🇲🇳',
    languages: ['Mongolian', 'Korean', 'English']
  },
  {
    value: 'nepal',
    label: '네팔',
    flag: '🇳🇵',
    languages: ['Nepali', 'English', 'Korean']
  },
  {
    value: 'myanmar',
    label: '미얀마',
    flag: '🇲🇲',
    languages: ['Burmese', 'English', 'Korean']
  },
  {
    value: 'cambodia',
    label: '캄보디아',
    flag: '🇰🇭',
    languages: ['Khmer', 'English', 'Korean']
  },
  {
    value: 'indonesia',
    label: '인도네시아',
    flag: '🇮🇩',
    languages: ['Indonesian', 'English', 'Korean']
  },
  {
    value: 'bangladesh',
    label: '방글라데시',
    flag: '🇧🇩',
    languages: ['Bengali', 'English', 'Korean']
  },
  {
    value: 'sri_lanka',
    label: '스리랑카',
    flag: '🇱🇰',
    languages: ['Sinhala', 'Tamil', 'English']
  },
  {
    value: 'other',
    label: '기타',
    flag: '🌏',
    languages: []
  }
];

/**
 * Language Proficiency Levels
 */
export const LANGUAGE_LEVELS = [
  { value: 'native', label: '모국어' },
  { value: 'fluent', label: '유창함' },
  { value: 'advanced', label: '상급' },
  { value: 'intermediate', label: '중급' },
  { value: 'beginner', label: '초급' },
  { value: 'none', label: '불가' }
];

/**
 * Agent Service Areas / Specializations
 */
export const SERVICE_AREAS = [
  { value: 'manufacturing', label: '제조업' },
  { value: 'it', label: 'IT/소프트웨어' },
  { value: 'construction', label: '건설' },
  { value: 'agriculture', label: '농업' },
  { value: 'service', label: '서비스업' },
  { value: 'hospitality', label: '호텔/관광' },
  { value: 'healthcare', label: '의료/간병' },
  { value: 'education', label: '교육' },
  { value: 'logistics', label: '물류/운송' },
  { value: 'food', label: '식음료' },
  { value: 'retail', label: '유통/판매' },
  { value: 'engineering', label: '엔지니어링' },
  { value: 'other', label: '기타' }
];

/**
 * Get region label by value
 */
export function getRegionLabel(value: string): string {
  const region = AGENT_REGIONS.find(r => r.value === value);
  return region ? `${region.flag} ${region.label}` : value;
}

/**
 * Get multiple region labels
 */
export function getRegionLabels(values: string[]): string {
  return values
    .map(v => getRegionLabel(v))
    .join(', ');
}

/**
 * Get language level label
 */
export function getLanguageLevelLabel(level: string): string {
  const langLevel = LANGUAGE_LEVELS.find(l => l.value === level);
  return langLevel ? langLevel.label : level;
}

/**
 * Get service area label
 */
export function getServiceAreaLabel(value: string): string {
  const area = SERVICE_AREAS.find(a => a.value === value);
  return area ? area.label : value;
}
