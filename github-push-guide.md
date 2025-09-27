# GitHub 푸시 가이드

## 📦 현재 프로젝트 상태
- ✅ 모든 소스코드 Git 커밋 완료
- ✅ README.md 작성 완료
- ✅ 프로젝트 구조 정리 완료

## 🚀 GitHub에 푸시하는 방법

### 1. GitHub 저장소 생성 후

```bash
# 현재 디렉토리 확인
cd /home/user/webapp

# 원격 저장소 연결
git remote add origin https://github.com/seojeongju/wow-campus-platform.git

# 브랜치 이름 확인 및 변경 (필요시)
git branch -M main

# 코드 푸시
git push -u origin main
```

### 2. 푸시 완료 후 확인사항

- [ ] GitHub에서 모든 파일이 올라갔는지 확인
- [ ] README.md가 정상적으로 표시되는지 확인
- [ ] Cloudflare Pages 연동 설정 (선택사항)

### 3. GitHub Pages 배포 (선택사항)

1. Repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / (root)
4. Save

## 📁 업로드될 주요 파일들

```
wow-campus-platform/
├── src/                 # Hono 백엔드 소스코드
├── public/              # 정적 파일 (CSS, JS)
├── migrations/          # 데이터베이스 스키마
├── README.md           # 프로젝트 문서
├── package.json        # 의존성 설정
├── wrangler.jsonc      # Cloudflare 설정
├── ecosystem.config.cjs # PM2 설정
└── ... (기타 설정 파일들)
```

## 🔗 예상 GitHub URL

- 저장소: https://github.com/seojeongju/wow-campus-platform
- GitHub Pages: https://seojeongju.github.io/wow-campus-platform (설정시)

## ⚠️ 주의사항

1. **API 키 보안**: .env 파일은 .gitignore에 포함되어 있음
2. **데이터베이스**: 로컬 SQLite 파일은 업로드되지 않음 (정상)
3. **node_modules**: .gitignore에 의해 제외됨 (정상)

## 🎯 푸시 후 다음 단계

1. **Cloudflare Pages 연동**: GitHub 저장소와 자동 배포 설정
2. **프로덕션 DB 설정**: Cloudflare D1 데이터베이스 생성
3. **환경변수 설정**: Cloudflare에서 JWT_SECRET 등 설정
4. **커스텀 도메인**: www.wow-campus.com 등 (선택사항)