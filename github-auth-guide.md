# GitHub 인증 완료 후 실행할 명령어

## 인증 완료 후 바로 실행:

```bash
cd /home/user/webapp
git push -u origin main
```

## 예상 결과:
```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
Delta compression using up to 4 threads
Compressing objects: 100% (38/38), done.
Writing objects: 100% (45/45), 125.67 KiB | 8.38 MiB/s, done.
Total 45 (delta 12), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (12/12), done.
To https://github.com/seojeongju/wow-campus-platform.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## 푸시 완료 후:
- GitHub 저장소: https://github.com/seojeongju/wow-campus-platform
- README.md가 정상 표시되는지 확인
- 모든 파일이 업로드되었는지 확인