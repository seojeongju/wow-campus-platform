# 🚀 WOW Campus - 빠른 시작 가이드

## 📍 현재 상태 (2025-11-13)

✅ **모든 요청 작업 완료**
✅ **프로덕션 배포 완료**
✅ **백업 생성 완료**

## 🔗 중요 링크

- **프로덕션**: https://wow-campus-platform.pages.dev
- **GitHub**: (저장소 URL)
- **Cloudflare Dashboard**: https://dash.cloudflare.com/

## 📦 백업 위치

```
/home/user/wow-campus-backup-2025-11-13-0130.tar.gz (2.8MB)
```

## ⚡ 빠른 명령어

### Git 작업
```bash
cd /home/user/webapp
git status                    # 상태 확인
git log --oneline -10        # 최근 커밋
git pull origin main         # 최신 코드 받기
```

### 개발 서버
```bash
cd /home/user/webapp
npm install                  # 의존성 설치
npm run dev                  # 로컬 개발 서버
```

### 데이터베이스
```bash
cd /home/user/webapp
# 원격 DB 쿼리
wrangler d1 execute wow-campus-platform-db --remote --command "SELECT COUNT(*) FROM job_postings;"

# 로컬 DB
wrangler d1 execute wow-campus-platform-db --local --command "SELECT * FROM users LIMIT 5;"
```

### 배포
```bash
cd /home/user/webapp
git add .
git commit -m "메시지"
git push origin main        # → 자동 배포 (1-2분 소요)
```

## 🔍 최근 해결한 문제

1. **홈페이지 로딩 무한대기** → ✅ 해결 (commit: 6a67963)
2. **API 데이터 조회 실패** → ✅ 해결 (commit: 80ddfa1)

## 📊 데이터베이스 정보

- **이름**: `wow-campus-platform-db`
- **ID**: `efaa0882-3f28-4acd-a609-4c625868d101`
- **데이터**: 구인공고 5개, 구직자 8개, 기업 3개

## 📝 상세 문서

전체 내용은 `SESSION_COMPLETION_SUMMARY.md` 참고

## 🆘 문제 발생 시

```bash
# 로그 확인
cd /home/user/webapp
wrangler tail

# 롤백
git reset --hard <이전커밋>
git push -f origin main
```

---
**업데이트**: 2025-11-13
