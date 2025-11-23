# Personal Access Token 방법

## 1. GitHub에서 토큰 생성:
1. GitHub.com → 우상단 프로필 클릭 → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" 클릭
4. 권한 선택:
   - ✅ repo (Full control of private repositories)
   - ✅ workflow (Update GitHub Action workflows)
5. "Generate token" 클릭
6. **토큰 복사** (한 번만 보여줌!)

## 2. 토큰으로 푸시:
```bash
cd /home/user/webapp

# 토큰을 URL에 포함해서 원격 저장소 설정
git remote set-url origin https://YOUR_TOKEN@github.com/seojeongju/wow-campus-platform.git

# 푸시 실행
git push -u origin main
```

## 주의사항:
- YOUR_TOKEN 부분을 실제 토큰으로 바꾸세요
- 토큰은 안전하게 보관하세요