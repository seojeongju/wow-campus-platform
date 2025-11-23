# Node.js 버전 업데이트 가이드

현재 Node.js 버전: v18.20.8
필요한 버전: v20.0.0 이상

## 방법 1: 공식 설치 프로그램 사용 (가장 간단)

1. Node.js 공식 웹사이트 방문
   - https://nodejs.org/en/download/
   
2. LTS (Long Term Support) 버전 다운로드
   - Windows Installer (.msi) 다운로드
   - 권장: v20.x LTS 버전

3. 설치 프로그램 실행
   - 기존 Node.js가 설치되어 있어도 덮어쓰기 설치 가능
   - 설치 마법사의 안내를 따르세요

4. 터미널 재시작 후 버전 확인
   ```powershell
   node --version
   ```

5. 버전이 v20 이상으로 업데이트되었는지 확인 후 배포
   ```powershell
   npm run deploy:prod
   ```

## 방법 2: nvm-windows 사용 (여러 버전 관리가 필요한 경우)

1. nvm-windows 다운로드
   - https://github.com/coreybutler/nvm-windows/releases
   - 최신 `nvm-setup.exe` 다운로드

2. nvm-windows 설치

3. 관리자 권한으로 PowerShell 실행 후:
   ```powershell
   # Node.js 20 설치
   nvm install 20
   
   # Node.js 20 사용
   nvm use 20
   
   # 버전 확인
   node --version
   ```

4. 배포 실행
   ```powershell
   npm run deploy:prod
   ```

## 방법 3: Chocolatey 사용 (Chocolatey가 설치된 경우)

1. 관리자 권한으로 PowerShell 실행

2. 다음 명령어 실행:
   ```powershell
   choco upgrade nodejs-lts
   ```

3. 터미널 재시작 후 버전 확인:
   ```powershell
   node --version
   ```

## 주의사항

- Node.js 버전 업데이트 후에는 **새 터미널을 열어야** 합니다
- 일부 전역 패키지는 재설치가 필요할 수 있습니다
- 프로젝트의 `node_modules`를 삭제하고 재설치하는 것을 권장합니다:
  ```powershell
  Remove-Item -Recurse -Force node_modules
  Remove-Item package-lock.json
  npm install
  ```

## 배포 확인

버전 업데이트 후 배포를 실행하세요:
```powershell
cd wow-campus-platform-main
npm run deploy:prod
```
