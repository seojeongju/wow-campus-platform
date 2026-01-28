// 🚀 페이지 로드 시 로그인 상태 복원
// auth.js에 정의된 restoreLoginState 함수를 호출
if (typeof restoreLoginState === 'function') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restoreLoginState);
    } else {
        // DOM이 이미 로드된 경우 즉시 실행
        restoreLoginState();
    }
} else {
    console.error('restoreLoginState function not found in auth.js');
}
