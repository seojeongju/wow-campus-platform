# 🎯 관리자 대시보드 테스트 가이드

**작성일**: 2025-11-13  
**작성자**: AI Development Assistant  
**목적**: 관리자 대시보드 기능 테스트 및 수정

---

## 📋 목차
1. [환경 설정](#환경-설정)
2. [로컬 서버 접속](#로컬-서버-접속)
3. [테스트 계정](#테스트-계정)
4. [테스트 시나리오](#테스트-시나리오)
5. [API 엔드포인트](#api-엔드포인트)
6. [문제 해결](#문제-해결)
7. [수정 방법](#수정-방법)

---

## 🔧 환경 설정

### 현재 상태
- ✅ **프로젝트 위치**: `/home/user/webapp`
- ✅ **빌드 완료**: dist 폴더 생성됨
- ✅ **서버 실행 중**: http://localhost:3000
- ✅ **공개 URL**: https://3000-in0tuahod1mdoj4v8wnrz-5634da27.sandbox.novita.ai

### 주요 파일 위치
```
src/
├── pages/
│   └── dashboard/
│       ├── admin.tsx              # 관리자 대시보드 리다이렉트
│       └── admin-full.tsx         # 관리자 대시보드 전체 UI
├── routes/
│   └── admin.ts                   # 관리자 API 라우트
└── index.tsx                      # 메인 앱 (관리자 라우트 포함)
```

---

## 🌐 로컬 서버 접속

### 접속 URL
**공개 URL**: https://3000-in0tuahod1mdoj4v8wnrz-5634da27.sandbox.novita.ai

### 주요 페이지
- **홈페이지**: `/`
- **관리자 대시보드**: `/admin`
- **관리자 대시보드 (대체)**: `/dashboard/admin`

---

## 🔑 테스트 계정

### 관리자 계정
```
이메일: admin@wowcampus.com
비밀번호: password123
사용자 타입: admin
상태: approved
```

### 기업 계정
```
이메일: hr@samsung.com
비밀번호: company123
사용자 타입: company
상태: approved
```

### 구직자 계정
```
이메일: john.doe@email.com
비밀번호: jobseeker123
사용자 타입: jobseeker
상태: approved
```

---

## ✅ 테스트 시나리오

### 1단계: 로그인 테스트
**목적**: 관리자 계정으로 로그인 확인

**절차**:
1. 공개 URL 접속
2. 우측 상단 "로그인" 버튼 클릭
3. 관리자 계정 입력
   - 이메일: `admin@wowcampus.com`
   - 비밀번호: `password123`
4. "로그인" 버튼 클릭

**예상 결과**:
- ✅ 로그인 성공
- ✅ 홈페이지로 리다이렉트
- ✅ 우측 상단에 "관리자" 이름 표시
- ✅ 네비게이션에 "대시보드" 메뉴 표시

**확인 항목**:
- [ ] 로그인 성공 메시지 표시
- [ ] 사용자 이름 표시
- [ ] 로컬스토리지에 토큰 저장됨 (`wowcampus_token`)

---

### 2단계: 관리자 대시보드 접속
**목적**: 관리자 대시보드 페이지 로딩 확인

**절차**:
1. 로그인 후 `/admin` 경로로 이동
2. 또는 네비게이션에서 "대시보드" 클릭

**예상 결과**:
- ✅ 관리자 대시보드 페이지 로딩
- ✅ 헤더에 "관리자 대시보드" 제목 표시
- ✅ 4개의 통계 카드 표시:
  - 전체 구인정보
  - 전체 구직자
  - 협약 대학교
  - 매칭 성사

**확인 항목**:
- [ ] 페이지 로딩 정상
- [ ] 통계 카드 표시
- [ ] 숫자가 "-" 또는 실제 값으로 표시
- [ ] 카드 클릭 시 상세 정보 토글

---

### 3단계: 통계 카드 테스트
**목적**: 각 통계 카드 클릭 및 상세 정보 확인

#### 3-1. 구인정보 카드
**절차**:
1. "전체 구인정보" 카드 클릭
2. 상세 정보 확장 확인

**예상 결과**:
- ✅ 구인정보 상세 섹션 표시
- ✅ 활성 공고 수 표시
- ✅ 승인 대기 공고 수 표시
- ✅ 마감 공고 수 표시
- ✅ 최근 공고 목록 표시

**확인 항목**:
- [ ] 상세 섹션 애니메이션 동작
- [ ] API 호출 성공 (개발자 도구 네트워크 탭 확인)
- [ ] 데이터 정상 표시
- [ ] "전체 구인정보 보기" 버튼 동작

#### 3-2. 구직자 카드
**절차**:
1. "전체 구직자" 카드 클릭
2. 상세 정보 확장 확인

**예상 결과**:
- ✅ 구직자 상세 섹션 표시
- ✅ 활성 회원 수 표시
- ✅ 승인 대기 회원 수 표시
- ✅ 국가별 분류 (중국, 기타) 표시
- ✅ 최근 구직자 목록 표시

**확인 항목**:
- [ ] 상세 섹션 애니메이션 동작
- [ ] API 호출 성공
- [ ] 데이터 정상 표시
- [ ] "전체 구직자 보기" 버튼 동작

#### 3-3. 협약대학교 카드
**절차**:
1. "협약 대학교" 카드 클릭
2. 상세 정보 확장 확인

**예상 결과**:
- ✅ 협약대학교 상세 섹션 표시
- ✅ 지역별 분류 (서울, 수도권, 지방) 표시
- ✅ 대학교 목록 표시

**확인 항목**:
- [ ] 상세 섹션 애니메이션 동작
- [ ] API 호출 성공
- [ ] 데이터 정상 표시

#### 3-4. 매칭 성사 카드
**절차**:
1. "매칭 성사" 카드 클릭
2. 상세 정보 확장 확인

**예상 결과**:
- ✅ 매칭 성사 상세 섹션 표시
- ✅ 상태별 매칭 수 표시
- ✅ 최근 매칭 목록 표시

**확인 항목**:
- [ ] 상세 섹션 애니메이션 동작
- [ ] API 호출 성공
- [ ] 데이터 정상 표시

---

### 4단계: API 엔드포인트 테스트
**목적**: 브라우저 개발자 도구에서 API 호출 확인

**절차**:
1. F12 키 또는 우클릭 > 검사 > 네트워크 탭
2. 관리자 대시보드 페이지 새로고침
3. API 호출 확인

**예상 API 호출**:
```
GET /api/admin/jobs/stats
GET /api/admin/jobseekers/stats
GET /api/admin/universities/stats
GET /api/admin/matches/stats
```

**확인 항목**:
- [ ] 모든 API 호출 200 OK 응답
- [ ] 응답 데이터 형식 올바름 (JSON)
- [ ] 에러 없음

---

### 5단계: 권한 테스트
**목적**: 관리자가 아닌 계정으로 접근 시 제한 확인

**절차**:
1. 로그아웃
2. 구직자 계정으로 로그인 (`john.doe@email.com` / `jobseeker123`)
3. `/admin` 경로로 직접 접속 시도

**예상 결과**:
- ✅ 접근 거부
- ✅ 에러 메시지 표시 또는 홈페이지로 리다이렉트
- ✅ 403 Forbidden 또는 401 Unauthorized

**확인 항목**:
- [ ] 접근 제한 정상 동작
- [ ] 적절한 에러 메시지
- [ ] 보안 정책 적용됨

---

## 🔌 API 엔드포인트

### 통계 API

#### 1. 구인정보 통계
```http
GET /api/admin/jobs/stats
Authorization: Bearer {token}

Response:
{
  "total": 50,
  "active": 35,
  "pending": 10,
  "closed": 5,
  "recent": [
    {
      "id": 1,
      "title": "소프트웨어 개발자",
      "company_name": "삼성전자",
      "created_at": "2025-11-13"
    }
  ]
}
```

#### 2. 구직자 통계
```http
GET /api/admin/jobseekers/stats
Authorization: Bearer {token}

Response:
{
  "total": 120,
  "active": 100,
  "pending": 15,
  "by_nationality": {
    "중국": 80,
    "기타": 40
  },
  "recent": [
    {
      "id": 1,
      "name": "John Doe",
      "nationality": "중국",
      "created_at": "2025-11-13"
    }
  ]
}
```

#### 3. 협약대학교 통계
```http
GET /api/admin/universities/stats
Authorization: Bearer {token}

Response:
{
  "total": 10,
  "by_region": {
    "서울": 5,
    "수도권": 3,
    "지방": 2
  },
  "list": [
    {
      "id": 1,
      "name": "서울대학교",
      "region": "서울"
    }
  ]
}
```

#### 4. 매칭 성사 통계
```http
GET /api/admin/matches/stats
Authorization: Bearer {token}

Response:
{
  "total": 25,
  "by_status": {
    "성공": 20,
    "진행중": 3,
    "취소": 2
  },
  "recent": [
    {
      "id": 1,
      "jobseeker_name": "John Doe",
      "company_name": "삼성전자",
      "status": "성공",
      "created_at": "2025-11-13"
    }
  ]
}
```

### 사용자 관리 API

#### 5. 사용자 승인
```http
POST /api/admin/users/:id/approve
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "사용자가 승인되었습니다."
}
```

#### 6. 사용자 거부
```http
POST /api/admin/users/:id/reject
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "reason": "거부 사유"
}

Response:
{
  "success": true,
  "message": "사용자가 거부되었습니다."
}
```

---

## 🐛 문제 해결

### 문제 1: 통계 카드에 "-" 표시
**증상**: 카드 숫자가 "-"로 표시되고 실제 값이 로딩되지 않음

**원인**:
- API 호출 실패
- 데이터베이스 연결 문제
- JavaScript 에러

**해결 방법**:
1. 개발자 도구 콘솔 확인
2. 네트워크 탭에서 API 응답 확인
3. API 엔드포인트 테스트:
```bash
# 터미널에서 직접 테스트
curl http://localhost:3000/api/admin/jobs/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 문제 2: 페이지 로딩 안됨
**증상**: 관리자 대시보드 페이지가 로딩되지 않음

**원인**:
- 인증 토큰 없음
- 권한 부족
- 서버 에러

**해결 방법**:
1. 로그인 상태 확인
2. 로컬스토리지에 `wowcampus_token` 확인
3. 관리자 계정으로 로그인했는지 확인

---

### 문제 3: API 호출 403 또는 401 에러
**증상**: API 호출 시 권한 에러

**원인**:
- 토큰 만료
- 관리자 권한 없음
- 인증 미들웨어 문제

**해결 방법**:
1. 다시 로그인
2. 관리자 계정 확인
3. 미들웨어 로그 확인

---

### 문제 4: 상세 정보 토글 안됨
**증상**: 카드 클릭 시 상세 정보가 표시되지 않음

**원인**:
- JavaScript 함수 에러
- DOM 요소 찾기 실패

**해결 방법**:
1. 콘솔에서 JavaScript 에러 확인
2. `toggleStatsDetail()` 함수 정의 확인
3. 스크립트 로딩 순서 확인

---

## 🔧 수정 방법

### UI 수정
**파일**: `src/pages/dashboard/admin-full.tsx`

**예시 - 카드 제목 변경**:
```tsx
// 라인 48 근처
<h1 class="text-3xl font-bold mb-2">관리자 대시보드</h1>
// 변경 →
<h1 class="text-3xl font-bold mb-2">시스템 관리 콘솔</h1>
```

**예시 - 통계 카드 색상 변경**:
```tsx
// 라인 61 근처
<button ... class="... border-t-4 border-blue-500 ...">
// 변경 →
<button ... class="... border-t-4 border-red-500 ...">
```

---

### API 로직 수정
**파일**: `src/routes/admin.ts`

**예시 - 통계 데이터 추가**:
```typescript
// 라인 815 근처
admin.get('/jobs/stats', async (c) => {
  // 기존 쿼리
  const totalJobs = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM job_postings
  `).first();
  
  // 새로운 통계 추가
  const weeklyJobs = await c.env.DB.prepare(`
    SELECT COUNT(*) as count 
    FROM job_postings 
    WHERE created_at >= date('now', '-7 days')
  `).first();
  
  return c.json({
    ...existingData,
    weekly: weeklyJobs.count
  });
});
```

---

### JavaScript 함수 수정
**파일**: `src/pages/dashboard/admin-full.tsx` (스크립트 섹션)

**예시 - 토글 함수 개선**:
```javascript
function toggleStatsDetail(type) {
  // 기존 로직
  const element = document.getElementById(type + 'Detail');
  
  // 개선된 로직 - 애니메이션 추가
  if (element.classList.contains('hidden')) {
    element.classList.remove('hidden');
    element.style.animation = 'fadeIn 0.3s ease-in';
  } else {
    element.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => element.classList.add('hidden'), 300);
  }
}
```

---

### 빌드 및 재배포
수정 후 반드시 빌드하고 서버를 재시작하세요:

```bash
cd /home/user/webapp

# 빌드
npm run build

# 서버 재시작 (기존 프로세스 종료)
# lsof -ti:3000 | xargs kill -9

# 새 서버 시작
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000 \
  --compatibility-date=2024-01-01 \
  --binding DB=wow-campus-platform-db
```

---

## 📊 테스트 결과 기록

### 테스트 체크리스트
- [ ] 1단계: 로그인 테스트 ✅/❌
- [ ] 2단계: 대시보드 접속 ✅/❌
- [ ] 3-1: 구인정보 카드 ✅/❌
- [ ] 3-2: 구직자 카드 ✅/❌
- [ ] 3-3: 협약대학교 카드 ✅/❌
- [ ] 3-4: 매칭 성사 카드 ✅/❌
- [ ] 4단계: API 엔드포인트 ✅/❌
- [ ] 5단계: 권한 테스트 ✅/❌

### 발견된 문제
```
날짜: 2025-11-13
문제 설명:
- 

해결 방법:
- 

상태: [ ] 해결됨 / [ ] 진행중 / [ ] 보류
```

---

## 🔗 유용한 링크

- **로컬 서버**: http://localhost:3000
- **공개 URL**: https://3000-in0tuahod1mdoj4v8wnrz-5634da27.sandbox.novita.ai
- **관리자 대시보드**: https://3000-in0tuahod1mdoj4v8wnrz-5634da27.sandbox.novita.ai/admin
- **GitHub**: https://github.com/seojeongju/wow-campus-platform

---

## 📝 다음 단계

### 우선순위 높음
1. [ ] 통계 API 응답 확인
2. [ ] 상세 정보 토글 기능 테스트
3. [ ] 권한 검증 테스트

### 우선순위 중간
4. [ ] UI/UX 개선사항 확인
5. [ ] 에러 처리 개선
6. [ ] 로딩 상태 표시 개선

### 우선순위 낮음
7. [ ] 차트 시각화 추가
8. [ ] 엑셀 내보내기 기능
9. [ ] 이메일 알림 기능

---

**작성 완료**: 2025-11-13  
**테스트 준비 완료**: ✅  
**서버 상태**: 실행 중  
**다음 작업**: 테스트 시작 및 문제 수정
