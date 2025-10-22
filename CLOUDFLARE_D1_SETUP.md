# Cloudflare Pages D1 데이터베이스 바인딩 설정

## 🚨 현재 문제
```
Cannot read properties of undefined (reading 'DB')
```

**원인**: Cloudflare Pages에서 D1 데이터베이스 바인딩이 설정되지 않음

## ✅ 해결 방법

### 1. Cloudflare Dashboard 접속
https://dash.cloudflare.com

### 2. Pages 프로젝트로 이동
- 좌측 메뉴: **Pages** 클릭
- **wow-campus-platform** 프로젝트 선택

### 3. Settings 탭 이동
- 상단 탭에서 **Settings** 클릭
- 좌측 메뉴에서 **Functions** 클릭

### 4. D1 Database Bindings 추가
1. **D1 database bindings** 섹션 찾기
2. **Add binding** 버튼 클릭
3. 다음 정보 입력:
   - **Variable name**: `DB`
   - **D1 database**: `wow-campus-platform-db` 선택
4. **Save** 버튼 클릭

### 5. R2 Bucket Bindings 추가 (이미 설정되어 있을 수 있음)
1. **R2 bucket bindings** 섹션 찾기
2. **Add binding** 버튼 클릭
3. 다음 정보 입력:
   - **Variable name**: `DOCUMENTS_BUCKET`
   - **R2 bucket**: `wow-campus-documents` 선택
4. **Save** 버튼 클릭

### 6. 재배포 (자동으로 진행될 수 있음)
설정 저장 후 자동으로 재배포됩니다. 또는:
```bash
npm run deploy
```

## 🔍 확인 방법

### 방법 1: DB 테스트 버튼
1. https://w-campus.com/admin 접속
2. 관리자 로그인
3. "사용자 관리" 클릭
4. **"DB 테스트"** 버튼 클릭
5. 성공 메시지 확인

### 방법 2: API 직접 호출
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://w-campus.com/api/admin/test-db
```

## 📋 예상 결과

### 성공 시:
```json
{
  "success": true,
  "data": {
    "dbBinding": "OK",
    "usersCount": 10,
    "tables": [...],
    "sampleUser": {...}
  }
}
```

### 실패 시 (바인딩 없음):
```json
{
  "success": false,
  "error": "Database binding is not configured"
}
```

## 🎯 D1 데이터베이스가 없는 경우

### D1 데이터베이스 생성
```bash
# 1. D1 데이터베이스 생성
npx wrangler d1 create wow-campus-platform-db

# 출력에서 database_id 확인:
# database_id = "efaa0882-3f28-4acd-a609-4c625868d101"

# 2. 마이그레이션 실행
npx wrangler d1 execute wow-campus-platform-db --remote --file=./migrations/0001_initial_schema.sql
npx wrangler d1 execute wow-campus-platform-db --remote --file=./migrations/0002_add_documents_table.sql
# ... (모든 마이그레이션 파일 실행)

# 또는 한 번에:
for file in migrations/*.sql; do
  echo "Executing $file..."
  npx wrangler d1 execute wow-campus-platform-db --remote --file="$file"
done
```

## 🔐 관리자 계정 생성

D1 데이터베이스에 관리자 계정이 없다면:

```bash
# SQL 파일 생성: create_admin.sql
# INSERT INTO users (email, password_hash, user_type, name, status, created_at, updated_at)
# VALUES (
#   'admin@w-campus.com',
#   '$2a$10$...해시된비밀번호...',
#   'admin',
#   'System Admin',
#   'approved',
#   datetime('now'),
#   datetime('now')
# );

# 실행
npx wrangler d1 execute wow-campus-platform-db --remote --file=./create_admin.sql
```

## 📚 참고 자료
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [D1 Database Bindings](https://developers.cloudflare.com/pages/platform/functions/bindings/#d1-databases)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
