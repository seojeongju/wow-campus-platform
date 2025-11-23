# 🚨 구인기업 필드 수정 시 발생 가능한 문제점 분석

## 📄 문서 분석 결과

### 채용의향서에 포함된 필드
1. **업체명** (company_name) - ✅ 기존 존재
2. **전화번호** (phone) - ✅ users 테이블에 존재
3. **사업자등록번호** (business_number) - ✅ 기존 존재
4. **대표자** (representative_name) - ❌ **신규 필요**
5. **영업소재지** (address) - ✅ 기존 존재
6. **채용 직종** (recruitment_position) - ❌ **신규 필요**
7. **채용 인원** (recruitment_count) - ❌ **신규 필요**
8. **근무 형태** (employment_type) - ❌ **신규 필요** (정규직/계약직/인턴십)
9. **급여 수준** (salary_level) - ⚠️ **부분적 존재** (현재는 job_postings에만)
10. **필수 자격** (required_qualifications) - ❌ **신규 필요**
11. **지원 사항** (support_items) - ❌ **신규 필요** (비자/교육/멘토링/숙소)
12. **채용 일정** (recruitment_schedule) - ❌ **신규 필요**

---

## ⚠️ 주요 문제점

### 🔴 Critical Issues (즉시 해결 필요)

#### 1. **데이터베이스 스키마 변경 필요**
**문제**:
- 현재 `companies` 테이블에 없는 12개 필드 중 8개가 신규 필드
- 기존 데이터와 충돌 가능성

**영향**:
```sql
-- 기존 companies 테이블 구조
CREATE TABLE companies (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  company_name TEXT,          -- ✅ 존재
  business_number TEXT,       -- ✅ 존재
  industry TEXT,              -- ✅ 존재
  company_size TEXT,          -- ✅ 존재
  address TEXT,               -- ✅ 존재
  website TEXT,               -- ✅ 존재
  description TEXT,           -- ✅ 존재
  founded_year INTEGER,       -- ✅ 존재
  employee_count INTEGER      -- ✅ 존재
  -- ❌ 다음 필드들이 없음:
  -- representative_name
  -- recruitment_positions
  -- recruitment_count
  -- employment_types
  -- required_qualifications
  -- support_items
  -- recruitment_schedule
);
```

**해결 방법**:
- 마이그레이션 파일 생성 필요
- 기존 데이터 보존 전략 필요
- 프로덕션 DB 백업 필수

---

#### 2. **기존 등록 기업 데이터 처리**
**문제**:
- 현재 등록된 기업들은 새 필드 값이 없음
- NULL 값 또는 기본값 처리 필요

**영향**:
- 기존 기업 프로필 페이지 에러 가능
- 관리자 페이지 목록에서 표시 오류

**해결 방법**:
```sql
-- 기본값 설정 필요
ALTER TABLE companies ADD COLUMN representative_name TEXT DEFAULT '';
ALTER TABLE companies ADD COLUMN recruitment_positions TEXT DEFAULT '[]'; -- JSON
ALTER TABLE companies ADD COLUMN recruitment_count INTEGER DEFAULT 0;
```

---

#### 3. **JSON 필드 처리 복잡도**
**문제**:
- 일부 필드는 배열 형태 (채용 직종, 지원 사항, 채용 일정)
- SQLite는 네이티브 JSON 지원 제한적

**영향**:
```javascript
// 예상 데이터 구조
{
  recruitment_positions: ['3D 설계 엔지니어', 'CAD 오퍼레이터', '제품 설계자'],
  support_items: {
    visa_support: true,
    korean_education: true,
    mentoring: true,
    accommodation: true
  },
  recruitment_schedule: {
    document_screening: '교육 완료 후 1주 이내',
    interview: '서류합격자 대상',
    final_decision: '면접 후 1주 이내'
  }
}
```

**해결 방법**:
- JSON.stringify/JSON.parse 사용
- 프론트엔드에서 파싱 로직 추가
- 에러 처리 강화

---

### 🟡 Medium Issues (중요하지만 즉시 치명적이진 않음)

#### 4. **API 엔드포인트 변경**
**문제**:
- 기존 `/api/companies` 엔드포인트 응답 구조 변경
- 프론트엔드에서 호출하는 모든 곳 수정 필요

**영향되는 파일**:
```
src/routes/admin.ts         - 관리자 API
src/routes/company.ts        - 기업 API (존재 시)
src/index.tsx                - 메인 로직
src/pages/dashboard/         - 대시보드 페이지들
```

**해결 방법**:
- API 버전 관리 (v1, v2)
- 하위 호환성 유지
- 점진적 마이그레이션

---

#### 5. **폼 유효성 검증 추가**
**문제**:
- 새 필드에 대한 유효성 검증 로직 없음
- 필수/선택 필드 구분 필요

**필수 필드**:
```javascript
const requiredFields = [
  'company_name',           // 업체명
  'business_number',        // 사업자등록번호
  'representative_name',    // 대표자 (신규)
  'address',               // 영업소재지
  'recruitment_positions', // 채용 직종 (신규)
  'recruitment_count',     // 채용 인원 (신규)
  'employment_type'        // 근무 형태 (신규)
];
```

**해결 방법**:
- 프론트엔드 유효성 검증
- 백엔드 유효성 검증
- 사용자 친화적 에러 메시지

---

#### 6. **UI/UX 변경 범위**
**문제**:
- 기업 등록 폼 대폭 수정
- 상세보기 페이지 레이아웃 변경
- 관리자 페이지 테이블 컬럼 추가

**영향**:
```
[ 현재 ]                    [ 수정 후 ]
┌────────────────┐          ┌────────────────────────┐
│ 기본 정보      │          │ 기본 정보 (기존)      │
│ - 업체명       │          │ - 업체명              │
│ - 사업자번호   │   →      │ - 사업자번호          │
│ - 주소         │          │ - 대표자 (신규)       │
│ - 업종         │          │ - 주소                │
└────────────────┘          │                        │
                            │ 채용 정보 (신규 섹션) │
                            │ - 채용 직종           │
                            │ - 채용 인원           │
                            │ - 근무 형태           │
                            │ - 급여 수준           │
                            │                        │
                            │ 지원 사항 (신규 섹션) │
                            │ - 비자 지원           │
                            │ - 교육 지원           │
                            │ - 멘토링              │
                            │ - 숙소 지원           │
                            └────────────────────────┘
```

**해결 방법**:
- 단계적 UI 개선
- 기존 페이지와 분리된 새 페이지 생성 고려
- 사용자 테스트

---

### 🟢 Low Issues (알아두면 좋음)

#### 7. **성능 영향**
**문제**:
- 테이블 크기 증가
- JSON 파싱 오버헤드
- 쿼리 복잡도 증가

**예상 영향**:
- 페이지 로딩 시간 10-20% 증가 가능
- 데이터베이스 크기 30% 증가 예상

**해결 방법**:
- 인덱스 최적화
- 필요한 필드만 SELECT
- 캐싱 전략

---

#### 8. **하위 호환성**
**문제**:
- 기존 기업 사용자들이 새 필드 입력 안 함
- 불완전한 프로필 문제

**해결 방법**:
- 프로필 완성도 표시 (예: 60%)
- 필드 입력 유도 UI
- 선택적 필드로 설정

---

#### 9. **다국어 지원**
**문제**:
- 채용 직종, 지원 사항 등의 텍스트가 한국어로 고정
- 국제 플랫폼 확장 시 문제

**해결 방법**:
- i18n 준비
- 코드값 사용 (예: 'full_time' → '정규직')

---

## 📋 수정 전 필수 체크리스트

### 1. 데이터베이스 작업
- [ ] 프로덕션 DB 백업
- [ ] 마이그레이션 파일 작성
- [ ] 로컬 DB에서 마이그레이션 테스트
- [ ] 롤백 계획 수립

### 2. 코드 작업
- [ ] API 엔드포인트 수정
- [ ] 프론트엔드 폼 수정
- [ ] 유효성 검증 추가
- [ ] 에러 처리 강화

### 3. 테스트
- [ ] 새 기업 등록 테스트
- [ ] 기존 기업 데이터 표시 테스트
- [ ] 관리자 페이지 테스트
- [ ] 모바일 반응형 테스트

### 4. 배포
- [ ] 스테이징 환경 배포
- [ ] 프로덕션 배포 전 공지
- [ ] 점진적 롤아웃 (가능하면)
- [ ] 모니터링 설정

---

## 🎯 권장 수정 전략

### Option 1: 단계적 접근 (추천) ✅
```
Phase 1: 필수 필드만 추가
- representative_name (대표자)
- recruitment_count (채용 인원)

Phase 2: 채용 정보 추가
- recruitment_positions (채용 직종)
- employment_type (근무 형태)
- salary_level (급여 수준)

Phase 3: 지원 사항 추가
- support_items (JSON)
- recruitment_schedule (JSON)

Phase 4: 선택 필드 추가
- required_qualifications
```

**장점**:
- 리스크 분산
- 각 단계별 테스트 가능
- 문제 발생 시 롤백 용이

**단점**:
- 시간 소요
- 여러 번의 배포 필요

---

### Option 2: 한 번에 추가 (빠르지만 위험)
```
1. 모든 필드 한 번에 추가
2. 마이그레이션 실행
3. 전체 테스트
4. 배포
```

**장점**:
- 빠른 완료
- 한 번의 배포

**단점**:
- 높은 리스크
- 문제 발생 시 큰 영향
- 롤백 어려움

---

## 🔒 데이터 보존 전략

### 프로덕션 DB 백업
```bash
# 현재 DB 백업
npx wrangler d1 export wow-campus-platform-db --remote \
  --output backup_before_company_fields_$(date +%Y%m%d).sql

# 로컬 테스트 DB 생성
npx wrangler d1 create wow-campus-platform-db-test
```

### 롤백 계획
```sql
-- 롤백용 SQL (새 컬럼 제거)
ALTER TABLE companies DROP COLUMN representative_name;
ALTER TABLE companies DROP COLUMN recruitment_positions;
-- ... (나머지 필드들)
```

---

## 📊 예상 작업 규모

### 수정 필요 파일
```
🔴 Critical (즉시 수정 필요)
├── migrations/0002_add_company_fields.sql     (신규)
├── src/routes/admin.ts                        (수정)
└── src/pages/dashboard/admin-full.tsx         (수정)

🟡 Medium (중요)
├── src/index.tsx                              (수정)
├── src/routes/company.ts                      (신규/수정)
└── src/pages/company/                         (신규/수정)

🟢 Low (선택적)
├── 문서 파일들                                (업데이트)
└── 테스트 파일들                              (신규)
```

### 예상 작업 시간
- **최소 (필수 필드만)**: 2-3시간
- **전체 (모든 필드)**: 4-6시간
- **테스트 & 배포**: 1-2시간

**총 예상**: 5-9시간

---

## ⚡ 즉시 시작 가능한 작업

### 1. 리스크 없는 준비 작업
```bash
# 백업 생성
cd /home/user/webapp

# 문서 검토
cat migrations/0001_initial_schema.sql

# 브랜치 생성
git checkout -b feature/company-recruitment-fields
```

### 2. 마이그레이션 파일 작성 (실행 X)
```sql
-- migrations/0002_add_company_recruitment_fields.sql
-- 작성만 하고 실행은 승인 후
```

### 3. 프로토타입 폼 작성
- 새 페이지에서 테스트
- 기존 시스템 영향 없음

---

## 🤔 의사결정 질문

수정을 진행하기 전에 다음을 확인해주세요:

1. **모든 필드를 한 번에 추가할까요, 아니면 단계적으로 추가할까요?**
   - 추천: 단계적 접근 (Phase 1부터)

2. **기존 등록된 기업들도 새 필드를 입력하도록 강제할까요?**
   - 추천: 선택적, 프로필 완성도 표시

3. **JSON 필드를 사용할까요, 아니면 별도 테이블로 분리할까요?**
   - 추천: JSON (간단하고 유연함)

4. **언제 배포할까요?**
   - 추천: 스테이징 테스트 후 주말 또는 새벽 시간

---

## ✅ 결론

### 권장사항
1. **Phase 1부터 시작** (필수 필드만)
2. **프로덕션 DB 백업 필수**
3. **로컬/스테이징 철저히 테스트**
4. **점진적 배포**

### 다음 단계
사용자 확인이 필요합니다:
- 수정 범위 결정
- 배포 일정 결정
- 리스크 수용 여부 확인

**준비되면 작업을 시작하겠습니다!** 🚀

---

**작성일**: 2025-11-13  
**작성자**: AI Developer  
**문서 버전**: v1.0
