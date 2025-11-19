# Phase 4C: 프로덕션 배포 가이드

## 📋 개요

Phase 1-4B를 완료한 후 프로덕션 환경에 안전하게 배포하기 위한 단계별 가이드입니다.

**배포 대상:**
- E-7 비자 직종 코드 시스템 (87개 직종)
- 구인 공고 상세 정보 UI (Section 2 재설계)
- 외국인 지원 사항 UI (Section 3 재설계)
- 백엔드 API 14개 필드 지원
- 데이터베이스 29개 새 컬럼

---

## ⚠️ 배포 전 필수 확인사항

### 1. 로컬 테스트 완료
- [ ] `docs/PHASE_4B_TEST_CHECKLIST.md`의 모든 테스트 통과
- [ ] 프론트엔드 UI 정상 동작 확인
- [ ] 백엔드 API 정상 동작 확인
- [ ] E-7 코드 검증 로직 동작 확인

### 2. 코드 리뷰 완료
- [ ] Pull Request #31 리뷰 완료
- [ ] 모든 리뷰 코멘트 해결
- [ ] main 브랜치로 머지 준비 완료

### 3. 백업 계획 수립
- [ ] 프로덕션 데이터베이스 백업 방법 확인
- [ ] 롤백 계획 수립
- [ ] 배포 실패 시 복구 절차 준비

---

## 🗓️ 배포 일정 계획

### 권장 배포 시간
- **시간대:** 사용자 트래픽이 적은 시간 (예: 새벽 2-4시)
- **요일:** 평일 (월-목) - 문제 발생 시 즉시 대응 가능
- **소요 시간:** 약 30분 ~ 1시간 예상

### 배포 체크리스트
```
[ ] 배포 시작 시간: ____년 __월 __일 __시 __분
[ ] 데이터베이스 백업 완료 시간: ____시 __분
[ ] 마이그레이션 완료 시간: ____시 __분
[ ] Cloudflare 배포 완료 시간: ____시 __분
[ ] 프로덕션 검증 완료 시간: ____시 __분
[ ] 배포 종료 시간: ____시 __분
```

---

## 📦 Phase 4C-1: 프로덕션 데이터베이스 백업

### 1-1. Cloudflare D1 데이터베이스 백업

#### 옵션 A: Wrangler CLI를 통한 백업 (권장)
```bash
# 1. 프로덕션 데이터베이스 확인
wrangler d1 list

# 2. 현재 데이터베이스 전체 내보내기
wrangler d1 export wow-campus-db --remote --output="backups/wow-campus-db-$(date +%Y%m%d-%H%M%S).sql"

# 3. companies 테이블만 백업 (선택적)
wrangler d1 execute wow-campus-db --remote --command=".dump companies" > backups/companies-backup-$(date +%Y%m%d-%H%M%S).sql

# 4. 백업 파일 확인
ls -lh backups/
```

#### 옵션 B: SQL 쿼리를 통한 데이터 백업
```bash
# companies 테이블 데이터 조회 및 저장
wrangler d1 execute wow-campus-db --remote --command="SELECT * FROM companies" --json > backups/companies-data-$(date +%Y%m%d-%H%M%S).json

# 중요 데이터 확인
cat backups/companies-data-*.json | jq '.[] | {id, company_name, representative_name}'
```

### 1-2. 백업 검증
```bash
# 백업 파일 크기 확인
ls -lh backups/*.sql

# 백업 파일 내용 확인 (처음 50줄)
head -50 backups/wow-campus-db-*.sql

# companies 테이블 레코드 수 확인
grep -c "INSERT INTO companies" backups/companies-backup-*.sql
```

### 1-3. 백업 파일 안전 저장
```bash
# 로컬에 백업 복사본 저장
cp backups/*.sql ~/safe-backups/

# (선택) 클라우드 스토리지에 업로드
# aws s3 cp backups/ s3://your-bucket/wow-campus-backups/ --recursive
# gcloud storage cp backups/* gs://your-bucket/wow-campus-backups/
```

---

## 🔄 Phase 4C-2: 프로덕션 마이그레이션 실행

### 2-1. 마이그레이션 파일 검증

#### 로컬에서 마이그레이션 SQL 재확인
```bash
# 마이그레이션 파일 내용 확인
cat migrations/0020_add_job_posting_details.sql

# 구문 검사 (로컬 D1에서 dry-run)
wrangler d1 execute wow-campus-db --local --file=./migrations/0020_add_job_posting_details.sql --preview
```

#### 마이그레이션 SQL 요약
```sql
-- 총 29개 컬럼 추가:
-- Section 2: 구인 공고 상세 (14개)
-- Section 3: 근로조건 및 지원사항 (15개)

-- 인덱스 2개 추가:
-- - idx_companies_e7_code (e7_visa_code)
-- - idx_companies_salary_min (salary_min)
```

### 2-2. 프로덕션 마이그레이션 실행

⚠️ **주의:** 이 명령은 프로덕션 데이터베이스를 변경합니다!

```bash
# 1. 마이그레이션 실행 (백업 후에만 실행!)
wrangler d1 execute wow-campus-db --remote --file=./migrations/0020_add_job_posting_details.sql

# 2. 실행 결과 확인
# 성공 메시지: "Executed ... statements in ... seconds"
```

### 2-3. 마이그레이션 검증

```bash
# 1. 새 컬럼 추가 확인
wrangler d1 execute wow-campus-db --remote --command="PRAGMA table_info(companies)" --json | jq '.[] | select(.name | startswith("e7_") or startswith("job_") or startswith("salary_") or startswith("contract_") or startswith("visa_") or startswith("housing_") or startswith("settlement_"))'

# 2. 인덱스 생성 확인
wrangler d1 execute wow-campus-db --remote --command="SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='companies'" --json

# 3. 기존 데이터 무결성 확인
wrangler d1 execute wow-campus-db --remote --command="SELECT COUNT(*) as total FROM companies" --json

# 4. 새 컬럼 기본값 확인
wrangler d1 execute wow-campus-db --remote --command="SELECT id, company_name, e7_visa_code, salary_min FROM companies LIMIT 5" --json
```

### 2-4. 마이그레이션 롤백 준비 (문제 발생 시)

```sql
-- 롤백 SQL 준비 (필요시 실행)
-- 주의: 새로 추가된 데이터는 손실됨

-- 29개 컬럼 삭제
ALTER TABLE companies DROP COLUMN e7_visa_code;
ALTER TABLE companies DROP COLUMN e7_visa_job_name;
ALTER TABLE companies DROP COLUMN job_title_ko;
ALTER TABLE companies DROP COLUMN job_title_en;
ALTER TABLE companies DROP COLUMN job_responsibilities;
-- ... (나머지 컬럼들)

-- 인덱스 삭제
DROP INDEX IF EXISTS idx_companies_e7_code;
DROP INDEX IF EXISTS idx_companies_salary_min;
```

---

## 🚀 Phase 4C-3: Cloudflare Workers 배포

### 3-1. 프로덕션 빌드

```bash
# 1. 의존성 설치 확인
npm install

# 2. TypeScript 타입 체크 (선택)
npx tsc --noEmit

# 3. 프로덕션 빌드 실행
npm run build

# 4. 빌드 결과 확인
ls -lh dist/
```

### 3-2. Wrangler 설정 확인

```bash
# wrangler.toml 프로덕션 설정 확인
cat wrangler.toml | grep -A 5 "\[env.production\]"

# 데이터베이스 바인딩 확인
cat wrangler.toml | grep -A 3 "d1_databases"
```

### 3-3. Cloudflare Workers 배포

```bash
# 1. 프로덕션 환경에 배포
npm run deploy
# 또는
wrangler deploy --env production

# 2. 배포 성공 메시지 확인
# "Published wow-campus-platform (v1.x.x)"
# "  https://wow-campus-platform.your-domain.workers.dev"

# 3. 배포된 버전 확인
wrangler deployments list --env production
```

### 3-4. 정적 에셋 배포 확인

```bash
# E-7 코드 JSON 파일이 배포되었는지 확인
curl -I https://your-domain.workers.dev/data/e7-visa-codes.json

# 응답 확인: 200 OK
```

---

## ✅ Phase 4C-4: 프로덕션 검증

### 4-1. API 엔드포인트 테스트

#### GET /api/profile/company 테스트
```bash
# 1. 인증 토큰 준비 (브라우저에서 localStorage 확인)
TOKEN="your-jwt-token-here"

# 2. GET 요청
curl -X GET https://your-domain.workers.dev/api/profile/company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq

# 3. 새 필드 확인
# - e7_visa_code
# - job_title_ko
# - salary_min
# - visa_support_level
# - housing_support_type
# - settlement_support
```

#### PUT /api/profile/company 테스트
```bash
# 1. 테스트 데이터 준비
cat > test-profile.json << 'EOF'
{
  "company_name": "테스트 회사",
  "representative_name": "홍길동",
  "e7_visa_code": "E-7-1-01-001",
  "e7_visa_job_name": "소프트웨어 개발자",
  "job_title_ko": "백엔드 개발자",
  "job_title_en": "Backend Developer",
  "job_responsibilities": "Node.js, TypeScript를 활용한 백엔드 API 개발 및 데이터베이스 설계. 100자 이상 작성하여 요건을 충족합니다. 추가 설명이 여기에 들어갑니다.",
  "recruitment_count": 2,
  "salary_min": 4405,
  "salary_max": 6000,
  "contract_type": "정규직",
  "visa_support_level": "full",
  "visa_support_details": "비자 신청 전 과정 지원",
  "housing_support_type": "dorm_free",
  "housing_support_amount": 0,
  "settlement_support": "[\"korean\",\"mentoring\"]"
}
EOF

# 2. PUT 요청
curl -X PUT https://your-domain.workers.dev/api/profile/company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-profile.json | jq

# 3. 성공 응답 확인
# {"success": true, "message": "프로필이 성공적으로 수정되었습니다."}
```

#### E-7 검증 로직 테스트
```bash
# 1. 잘못된 E-7 코드 테스트
curl -X PUT https://your-domain.workers.dev/api/profile/company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"테스트","representative_name":"홍길동","e7_visa_code":"INVALID-CODE"}' | jq

# 예상 응답: {"success": false, "message": "E-7 비자 직종 코드 형식이 올바르지 않습니다."}

# 2. 최소 연봉 미달 테스트
curl -X PUT https://your-domain.workers.dev/api/profile/company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"테스트","representative_name":"홍길동","e7_visa_code":"E-7-1-01-001","salary_min":4000}' | jq

# 예상 응답: {"success": false, "message": "E-7 비자 E-7-1-01-001 직종은 최소 연봉 4405만원 이상이어야 합니다."}
```

### 4-2. 프론트엔드 UI 테스트

#### 브라우저 테스트 체크리스트
```
[ ] 1. 프로덕션 URL 접속: https://your-domain.workers.dev
[ ] 2. 기업 계정 로그인
[ ] 3. 프로필 페이지 접근: /profile/company
[ ] 4. E-7 코드 드롭다운 로드 확인
[ ] 5. E-7 코드 선택 시 최소 연봉 자동 표시 확인
[ ] 6. 직무 내용 글자수 카운터 동작 확인
[ ] 7. 주거 지원 유형 선택 시 금액 필드 표시/숨김 확인
[ ] 8. 정착 지원 다중 선택 가능 확인
[ ] 9. 폼 저장 성공 확인
[ ] 10. 저장된 데이터 로드 확인 (페이지 새로고침)
```

#### 브라우저 개발자 도구 확인
```
[ ] Console 탭: JavaScript 에러 없음
[ ] Network 탭: /data/e7-visa-codes.json 로드 성공 (200 OK)
[ ] Network 탭: PUT /api/profile/company 성공 (200 OK)
[ ] Application 탭: localStorage에 JWT 토큰 존재
```

### 4-3. 데이터베이스 검증

```bash
# 1. 새로 저장된 데이터 확인
wrangler d1 execute wow-campus-db --remote --command="SELECT id, company_name, e7_visa_code, job_title_ko, salary_min, contract_type FROM companies ORDER BY updated_at DESC LIMIT 5" --json | jq

# 2. E-7 코드 분포 확인
wrangler d1 execute wow-campus-db --remote --command="SELECT e7_visa_code, COUNT(*) as count FROM companies WHERE e7_visa_code != '' GROUP BY e7_visa_code" --json | jq

# 3. 최소 연봉 분포 확인
wrangler d1 execute wow-campus-db --remote --command="SELECT 
  CASE 
    WHEN salary_min >= 4405 THEN 'E-7-1 (4405+)'
    WHEN salary_min >= 2600 THEN 'E-7-4 (2600-4404)'
    WHEN salary_min >= 2515 THEN 'E-7-2/3 (2515-2599)'
    ELSE 'Under minimum'
  END as salary_range,
  COUNT(*) as count
FROM companies 
WHERE salary_min > 0 
GROUP BY salary_range" --json | jq
```

### 4-4. 성능 모니터링

```bash
# 1. Cloudflare Workers 로그 확인
wrangler tail --env production

# 2. 응답 시간 측정
time curl -X GET https://your-domain.workers.dev/api/profile/company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" > /dev/null

# 예상: < 1초

# 3. E-7 JSON 파일 로드 시간 측정
time curl -X GET https://your-domain.workers.dev/data/e7-visa-codes.json > /dev/null

# 예상: < 500ms
```

---

## 🐛 Phase 4C-5: 문제 해결 (Troubleshooting)

### 문제 1: E-7 JSON 파일 로드 실패

**증상:**
```
GET /data/e7-visa-codes.json => 404 Not Found
```

**해결 방법:**
```bash
# 1. public/ 디렉토리 확인
ls -lh public/data/e7-visa-codes.json

# 2. wrangler.toml에 정적 에셋 설정 확인
cat wrangler.toml | grep -A 3 "assets"

# 3. 재배포
npm run deploy
```

### 문제 2: API 에러 - 새 필드 저장 실패

**증상:**
```json
{"success": false, "message": "프로필 수정에 실패했습니다."}
```

**해결 방법:**
```bash
# 1. Cloudflare Workers 로그 확인
wrangler tail --env production

# 2. 데이터베이스 컬럼 존재 확인
wrangler d1 execute wow-campus-db --remote --command="PRAGMA table_info(companies)" --json | grep e7_visa_code

# 3. 마이그레이션 재실행 (필요시)
wrangler d1 execute wow-campus-db --remote --file=./migrations/0020_add_job_posting_details.sql
```

### 문제 3: E-7 검증 로직 동작 안 함

**증상:**
- 최소 연봉 미달인데도 저장 성공

**해결 방법:**
```bash
# 1. 배포된 코드 확인
curl https://your-domain.workers.dev/ | grep "e7_visa_code"

# 2. 로컬 코드와 비교
grep -A 20 "E-7 visa code validation" src/routes/profile.ts

# 3. 재빌드 및 재배포
npm run build
npm run deploy
```

### 문제 4: 프론트엔드 JavaScript 에러

**증상:**
- 브라우저 콘솔에 JavaScript 에러

**해결 방법:**
```bash
# 1. 브라우저 캐시 클리어
# Ctrl+Shift+R (강력 새로고침)

# 2. Service Worker 삭제 (해당되는 경우)
# Application > Service Workers > Unregister

# 3. 소스맵 확인
curl https://your-domain.workers.dev/assets/company.js.map

# 4. 재배포
npm run build
npm run deploy
```

---

## 📊 Phase 4C-6: 배포 완료 보고서

### 배포 완료 체크리스트

```
✅ 배포 전 확인
[ ] 로컬 테스트 완료
[ ] 코드 리뷰 완료
[ ] 백업 계획 수립

✅ 데이터베이스 작업
[ ] 프로덕션 DB 백업 완료
[ ] 마이그레이션 실행 완료
[ ] 마이그레이션 검증 완료
[ ] 새 컬럼 확인 완료
[ ] 인덱스 생성 확인

✅ Cloudflare 배포
[ ] 프로덕션 빌드 성공
[ ] Workers 배포 완료
[ ] 정적 에셋 배포 확인

✅ 프로덕션 검증
[ ] GET API 테스트 통과
[ ] PUT API 테스트 통과
[ ] E-7 검증 로직 동작 확인
[ ] 프론트엔드 UI 동작 확인
[ ] 데이터베이스 데이터 확인
[ ] 성능 모니터링 정상

✅ 최종 확인
[ ] 모든 기능 정상 동작
[ ] 에러 로그 없음
[ ] 사용자 피드백 수집 준비
```

### 배포 결과 요약

```
배포 일시: ____년 __월 __일 __시 __분
배포 담당자: ___________
배포 브랜치: genspark_ai_developer
배포 커밋: 0f395fb

변경 사항:
- 새 데이터베이스 컬럼: 29개
- 새 API 필드: 14개
- E-7 비자 직종 코드: 87개
- 새 JavaScript 함수: 6개

배포 성공 여부: [ ] 성공  [ ] 실패

문제 발생 사항: (없으면 "없음" 기재)
___________________________________________

배포 완료 시간: ____시 __분
총 소요 시간: _____분
```

---

## 🔄 Phase 4C-7: 롤백 절차 (문제 발생 시)

### 즉시 롤백이 필요한 경우

#### 1. 이전 Workers 버전으로 롤백
```bash
# 1. 이전 배포 버전 확인
wrangler deployments list --env production

# 2. 이전 버전으로 롤백
wrangler rollback --message "Rolling back due to production issue" --env production

# 3. 롤백 확인
curl https://your-domain.workers.dev/api/health
```

#### 2. 데이터베이스 롤백 (중대한 문제 발생 시)
```bash
# ⚠️ 주의: 이 작업은 새로 추가된 데이터를 손실시킵니다!

# 1. 백업 파일 확인
ls -lh backups/wow-campus-db-*.sql

# 2. 백업에서 복원
wrangler d1 execute wow-campus-db --remote --file="backups/wow-campus-db-YYYYMMDD-HHMMSS.sql"

# 3. 데이터 복원 확인
wrangler d1 execute wow-campus-db --remote --command="SELECT COUNT(*) FROM companies" --json
```

### 부분 롤백 (마이그레이션만 되돌리기)
```bash
# 29개 컬럼 제거 (준비된 롤백 SQL 실행)
wrangler d1 execute wow-campus-db --remote --file="migrations/0020_rollback.sql"
```

---

## 📞 Phase 4C-8: 사후 지원

### 모니터링 항목

#### 1주일 동안 모니터링
```
[ ] 일 1회: Cloudflare Workers 로그 확인
[ ] 일 1회: 에러 발생 건수 확인
[ ] 일 1회: API 응답 시간 확인
[ ] 일 1회: 데이터베이스 성능 확인
[ ] 주 1회: 사용자 피드백 수집
```

#### 주요 메트릭
```
- API 에러율: < 1%
- API 응답 시간: < 1초
- E-7 코드 선택 오류: 0건
- 최소 연봉 검증 실패: 정상 (의도된 차단)
```

### 사용자 지원

#### FAQ 준비
```
Q: E-7 비자 직종 코드를 어떻게 선택하나요?
A: "E-7 비자 직종 코드" 드롭다운에서 업무와 일치하는 직종을 선택하세요.

Q: 최소 연봉이 자동으로 설정되는 이유는?
A: E-7 비자 카테고리별로 법적 최소 연봉 요건이 있어 자동으로 설정됩니다.

Q: 주거 지원 금액을 입력할 수 없어요.
A: "무료 기숙사" 또는 "지원 없음"을 선택하면 금액 입력 필드가 숨겨집니다.
   "유료 기숙사" 또는 "주거비 지원"을 선택하면 금액을 입력할 수 있습니다.
```

---

## 🎉 배포 완료!

Phase 4C 배포를 완료하셨습니다! 🚀

### 다음 단계
1. ✅ 모니터링 지속
2. 📊 사용자 피드백 수집
3. 🔄 Phase 3B 준비 (상세 필드 추가)
4. 📈 성능 최적화 검토

---

**문서 버전:** 1.0  
**작성일:** 2024-11-19  
**작성자:** GenSpark AI Developer  
**마지막 업데이트:** Phase 4B 완료 시점
