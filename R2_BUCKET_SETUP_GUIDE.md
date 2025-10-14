# 🪣 R2 버킷 설정 가이드

## 📋 현재 상태

파일 업로드 기능을 위한 R2 스토리지가 설정되지 않았습니다. 이로 인해 다음 기능들이 제한됩니다:

### ⚠️ 영향받는 기능
- ❌ 이력서 업로드
- ❌ 포트폴리오 파일 업로드
- ❌ 문서 업로드 (커버레터, 학위증명서, 자격증 등)
- ❌ 프로필 이미지 업로드

### ✅ 정상 작동하는 기능
- ✅ 프로필 페이지 접근
- ✅ 로그인/로그아웃
- ✅ 대시보드
- ✅ 텍스트 기반 프로필 편집
- ✅ 구인공고 조회
- ✅ 구직자 목록 조회

---

## 🛠️ R2 버킷 설정 방법

### 1단계: Cloudflare R2 활성화

1. **Cloudflare 대시보드 접속**
   ```
   https://dash.cloudflare.com/
   ```

2. **계정 선택**
   - Account ID: `85c8e953bdefb825af5374f0d66ca5dc`

3. **R2 섹션으로 이동**
   - 왼쪽 메뉴에서 "R2" 클릭
   - "Enable R2" 버튼 클릭 (처음 사용 시)

4. **R2 요금제 확인**
   - R2는 무료 티어 제공
   - 월 10GB 저장 무료
   - 월 100만 Class A 작업 무료
   - 월 1000만 Class B 작업 무료

---

### 2단계: R2 버킷 생성

#### 방법 A: Cloudflare 대시보드에서 생성 (권장)

1. **버킷 생성**
   - R2 페이지에서 "Create bucket" 클릭
   - 버킷 이름: `wow-campus-documents`
   - 리전: 자동 선택
   - "Create bucket" 클릭

2. **버킷 설정**
   - Public Access: 비활성화 (기본값)
   - CORS 설정: 필요시 나중에 추가

#### 방법 B: Wrangler CLI로 생성

```bash
# Cloudflare API 토큰 설정
export CLOUDFLARE_API_TOKEN="4R-EJC8j3SlbPNc48vZlvH447ICGNiGRzsSI4bS4"

# R2 버킷 생성
npx wrangler r2 bucket create wow-campus-documents

# 버킷 목록 확인
npx wrangler r2 bucket list
```

---

### 3단계: wrangler.jsonc 업데이트

R2 버킷이 생성되면 `wrangler.jsonc` 파일을 업데이트하세요:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "wow-campus-platform",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "wow-campus-platform-db",
      "database_id": "efaa0882-3f28-4acd-a609-4c625868d101"
    }
  ],
  "r2_buckets": [
    {
      "binding": "DOCUMENTS_BUCKET",
      "bucket_name": "wow-campus-documents"
    }
  ]
}
```

---

### 4단계: 재배포

```bash
# 프로젝트 빌드
npm run build

# Cloudflare Pages 배포
export CLOUDFLARE_API_TOKEN="4R-EJC8j3SlbPNc48vZlvH447ICGNiGRzsSI4bS4"
npx wrangler pages deploy dist --project-name wow-campus-platform
```

---

## 🔍 현재 에러 처리

R2 버킷이 설정되지 않은 경우, 사용자에게 다음과 같은 메시지가 표시됩니다:

### 업로드 시도 시
```json
{
  "success": false,
  "message": "파일 업로드 기능이 현재 사용 불가능합니다. R2 스토리지가 설정되지 않았습니다.",
  "error": "R2_BUCKET_NOT_CONFIGURED"
}
```

### 다운로드 시도 시
```json
{
  "success": false,
  "message": "파일 다운로드 기능이 현재 사용 불가능합니다. R2 스토리지가 설정되지 않았습니다.",
  "error": "R2_BUCKET_NOT_CONFIGURED"
}
```

---

## 📊 R2 요금 정보

### 무료 티어 (매월)
- 저장 공간: 10 GB
- Class A 작업: 1,000,000 (업로드, 목록 조회 등)
- Class B 작업: 10,000,000 (다운로드, 메타데이터 읽기 등)

### 유료 요금 (초과 시)
- 저장 공간: $0.015 / GB / 월
- Class A 작업: $4.50 / 백만 요청
- Class B 작업: $0.36 / 백만 요청

### 예상 사용량 (소규모 플랫폼)
- 구직자 100명 × 5MB (이력서) = 500 MB ✅ 무료 범위
- 월 업로드 1,000건 = 1,000 Class A ✅ 무료 범위
- 월 다운로드 10,000건 = 10,000 Class B ✅ 무료 범위

---

## 🔧 문제 해결

### 문제 1: R2 활성화 불가
**증상**: "Please enable R2 through the Cloudflare Dashboard" 오류

**해결**:
1. Cloudflare 대시보드에서 R2 섹션 방문
2. "Enable R2" 버튼 클릭
3. 결제 정보 등록 (무료 티어 사용 시에도 필요)
4. R2 약관 동의

### 문제 2: 버킷 생성 실패
**증상**: "A request to the Cloudflare API failed"

**해결**:
1. API 토큰 권한 확인
   - Account R2 Read 권한
   - Account R2 Write 권한
2. 토큰이 올바른 계정에 연결되어 있는지 확인
3. 토큰이 만료되지 않았는지 확인

### 문제 3: 배포 후에도 업로드 실패
**증상**: R2 버킷 생성 후에도 업로드 오류

**해결**:
1. wrangler.jsonc에 R2 바인딩이 추가되었는지 확인
2. 버킷 이름이 정확한지 확인 (`wow-campus-documents`)
3. 재빌드 및 재배포 필요
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name wow-campus-platform
   ```

---

## 📝 체크리스트

설정 완료 전:
- [ ] Cloudflare 대시보드 접속
- [ ] R2 활성화
- [ ] R2 버킷 생성 (`wow-campus-documents`)
- [ ] wrangler.jsonc 업데이트
- [ ] 프로젝트 재빌드
- [ ] Cloudflare Pages 재배포
- [ ] 파일 업로드 테스트

설정 완료 후:
- [ ] 이력서 업로드 기능 테스트
- [ ] 포트폴리오 업로드 기능 테스트
- [ ] 파일 다운로드 기능 테스트
- [ ] 프로필 이미지 업로드 테스트

---

## 🌐 현재 배포 정보

**최신 배포 URL**: https://3437e497.wow-campus-platform.pages.dev

**변경 사항**:
- R2 버킷 사용 가능 여부 체크 추가
- 적절한 에러 메시지 표시
- 파일 업로드/다운로드 시 graceful error handling

---

## 💡 대안 방법 (R2 없이 사용)

R2를 활성화하지 않고 임시로 사용하려면:

### 옵션 1: 파일 업로드 기능 비활성화
프론트엔드에서 파일 업로드 버튼을 숨기거나 비활성화

### 옵션 2: 외부 스토리지 사용
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

### 옵션 3: Base64로 DB에 저장 (권장하지 않음)
작은 파일(< 1MB)만 가능, 성능 저하 우려

---

## 📞 지원 정보

### Cloudflare 계정
```
Account ID: 85c8e953bdefb825af5374f0d66ca5dc
API Token: WOW-CAMPUS-Dev API token
```

### 프로젝트 정보
```
Project: wow-campus-platform
GitHub: https://github.com/seojeongju/wow-campus-platform
```

---

**작성일**: 2025-10-14  
**작성자**: AI Developer (Claude)  
**상태**: R2 설정 대기 중

🪣 R2 버킷을 설정하면 모든 파일 업로드 기능이 정상 작동합니다!
