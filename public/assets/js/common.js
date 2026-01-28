// Global State Management & Token Utilities
console.log('common.js loaded');

// 전역 변수 초기화
var authToken = localStorage.getItem('wowcampus_token');
window.currentUser = null;

// JWT 토큰 디코딩 함수
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('JWT 파싱 오류:', error);
        return null;
    }
}

// 현재 사용자 정보 가져오기 (토큰 검증 포함)
function getCurrentUser() {
    const token = localStorage.getItem('wowcampus_token');
    // console.log('getCurrentUser - 토큰 확인:', token ? '존재함' : '없음');

    if (!token) {
        return null;
    }

    try {
        // JWT 토큰 디코딩
        const payload = parseJWT(token);

        if (!payload) {
            console.log('JWT 페이로드 파싱 실패');
            localStorage.removeItem('wowcampus_token');
            localStorage.removeItem('wowcampus_user');
            return null;
        }

        // 토큰 만료 확인 (exp는 초 단위)
        if (payload.exp && Date.now() > payload.exp * 1000) {
            console.log('토큰이 만료되었습니다');
            localStorage.removeItem('wowcampus_token');
            localStorage.removeItem('wowcampus_user');
            return null;
        }

        // JWT 페이로드에서 사용자 정보 추출 (또는 localStorage 'wowcampus_user'와 병합 가능하나, 토큰이 진실)
        // Legacy app.js logic constructed user from payload:
        const user = {
            id: payload.userId,
            email: payload.email,
            name: payload.name,
            user_type: payload.userType,
            exp: payload.exp,
            iat: payload.iat
        };

        // Update global state
        window.currentUser = user;
        return user;

    } catch (error) {
        console.error('토큰 파싱 오류:', error);
        localStorage.removeItem('wowcampus_token');
        localStorage.removeItem('wowcampus_user');
        return null;
    }
}

// 🌐 언어 변경 함수
function changeLanguage(lang) {
    console.log('언어 변경:', lang);
    localStorage.setItem('wowcampus_language', lang);

    // 서버 사이드 렌더링을 위해 쿠키 설정 (365일)
    document.cookie = `app_lang=${lang}; path=/; max-age=31536000`;

    // 현재 언어를 임시로 변경하여 메시지 표시
    const currentLocale = window.locale || 'ko';
    const translations = window.translations || {};

    // 언어 변경 메시지 (간단한 메시지 사용)
    let msg = '';
    if (lang === 'ko') {
        msg = '한국어로 변경되었습니다';
    } else if (lang === 'ja') {
        msg = '日本語に変更されました';
    } else if (lang === 'vi') {
        msg = 'Đã chuyển sang Tiếng Việt';
    } else if (lang === 'zh') {
        msg = '已切换到中文';
    } else {
        msg = 'Language changed to English';
    }

    // 간단한 토스트 메시지
    if (typeof window.showNotification === 'function') {
        window.showNotification(msg, 'success');
    } else if (window.toast) {
        window.toast.success(msg);
    } else {
        alert(msg);
    }

    // 페이지 새로고침 (실제 다국어 적용을 위해)
    setTimeout(() => {
        // 'lang' 쿼리 파라미터가 있으면 제거하여 쿠키/설정이 우선시되도록 함
        const url = new URL(window.location.href);
        if (url.searchParams.has('lang')) {
            url.searchParams.delete('lang');
            window.location.href = url.toString();
        } else {
            window.location.reload();
        }
    }, 500);
}

// 전역 노출
window.changeLanguage = changeLanguage;
