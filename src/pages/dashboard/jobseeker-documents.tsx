/**
 * 구직자 문서 관리 페이지
 * Route: /dashboard/jobseeker/documents
 * 파일 업로드, 조회, 다운로드, 삭제 기능
 */

import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { verifyJWT } from '../../utils/auth'

export const handler = async (c: Context) => {
  // 토큰 확인 (Authorization 헤더)
  const authHeader = c.req.header('Authorization');
  let token = authHeader?.replace('Bearer ', '');
  
  let user = null;
  if (token) {
    try {
      const payload = await verifyJWT(token, c.env.JWT_SECRET);
      if (payload && payload.userId) {
        const userRecord = await c.env.DB.prepare(
          'SELECT id, email, name, user_type FROM users WHERE id = ?'
        ).bind(payload.userId).first();
        
        if (userRecord) {
          user = userRecord;
        }
      }
    } catch (error) {
      console.error('토큰 검증 실패:', error);
    }
  }
  
  // 인증되지 않은 경우 - 클라이언트 사이드로 리다이렉트
  if (!user) {
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>인증 확인 중...</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .loading { text-align: center; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>인증 확인 중...</p>
  </div>
  <script>
    const token = localStorage.getItem('wowcampus_token');
    if (token) {
      fetch('/api/documents', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          renderPage(data.user, data.documents);
        } else {
          throw new Error(data.message);
        }
      })
      .catch(() => {
        window.location.href = '/?login=1&redirect=' + encodeURIComponent('/dashboard/jobseeker/documents');
      });
    } else {
      window.location.href = '/?login=1&redirect=' + encodeURIComponent('/dashboard/jobseeker/documents');
    }
    
    function renderPage(user, documents) {
      const docsList = documents.length === 0 ? 
        '<p class="text-gray-500 text-center py-8">업로드된 문서가 없습니다.</p>' :
        documents.map(doc => 
          '<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-3">' +
            '<div class="flex items-center space-x-4">' +
              '<i class="fas fa-file-pdf text-red-500 text-2xl"></i>' +
              '<div>' +
                '<h3 class="font-medium text-gray-900">' + doc.original_name + '</h3>' +
                '<p class="text-sm text-gray-600">' + doc.document_type + ' • ' + (doc.file_size / 1024).toFixed(1) + ' KB</p>' +
              '</div>' +
            '</div>' +
            '<div class="flex space-x-2">' +
              '<a href="/api/documents/' + doc.id + '/download" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">' +
                '<i class="fas fa-download"></i>' +
              '</a>' +
              '<button onclick="deleteDoc(' + doc.id + ')" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">' +
                '<i class="fas fa-trash"></i>' +
              '</button>' +
            '</div>' +
          '</div>'
        ).join('');
      
      document.body.innerHTML = 
        '<div class="min-h-screen bg-gray-50">' +
          '<header class="bg-white shadow-sm border-b border-gray-200">' +
            '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">' +
              '<div class="flex justify-between items-center">' +
                '<div>' +
                  '<h1 class="text-2xl font-bold text-gray-900">문서 관리</h1>' +
                  '<p class="text-sm text-gray-600 mt-1">' + user.name + '님의 업로드된 문서를 관리할 수 있습니다.</p>' +
                '</div>' +
                '<a href="/profile" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">' +
                  '<i class="fas fa-arrow-left mr-2"></i>프로필로 돌아가기' +
                '</a>' +
              '</div>' +
            '</div>' +
          '</header>' +
          '<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">' +
            '<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">' +
              '<h2 class="text-lg font-semibold text-gray-900 mb-4">' +
                '<i class="fas fa-upload mr-2 text-blue-600"></i>새 문서 업로드' +
              '</h2>' +
              '<form id="upload-form" enctype="multipart/form-data" class="space-y-4">' +
                '<div>' +
                  '<label class="block text-sm font-medium text-gray-700 mb-2">문서 유형</label>' +
                  '<select name="document_type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                    '<option value="">선택하세요</option>' +
                    '<option value="resume">이력서</option>' +
                    '<option value="certificate">자격증</option>' +
                    '<option value="diploma">학위증명서</option>' +
                    '<option value="passport">여권</option>' +
                    '<option value="visa">비자</option>' +
                    '<option value="other">기타</option>' +
                  '</select>' +
                '</div>' +
                '<div>' +
                  '<label class="block text-sm font-medium text-gray-700 mb-2">파일 선택</label>' +
                  '<input type="file" name="file" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" class="w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                  '<p class="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC, DOCX 파일만 업로드 가능 (최대 10MB)</p>' +
                '</div>' +
                '<div>' +
                  '<label class="block text-sm font-medium text-gray-700 mb-2">설명 (선택사항)</label>' +
                  '<textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>' +
                '</div>' +
                '<button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">' +
                  '<i class="fas fa-upload mr-2"></i>업로드' +
                '</button>' +
              '</form>' +
            '</div>' +
            '<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">' +
              '<h2 class="text-lg font-semibold text-gray-900 mb-4">' +
                '<i class="fas fa-file-alt mr-2 text-green-600"></i>업로드된 문서 목록' +
              '</h2>' +
              '<div id="documents-list">' + docsList + '</div>' +
            '</div>' +
          '</main>' +
        '</div>';
      
      const link1 = document.createElement('link');
      link1.rel = 'stylesheet';
      link1.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link1);
      
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
      
      document.getElementById('upload-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const token = localStorage.getItem('wowcampus_token');
        
        try {
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
          });
          
          const data = await response.json();
          if (data.success) {
            alert('업로드 성공!');
            location.reload();
          } else {
            alert('업로드 실패: ' + data.message);
          }
        } catch (error) {
          alert('업로드 중 오류: ' + error.message);
        }
      });
    }
    
    async function deleteDoc(id) {
      if (!confirm('정말 삭제하시겠습니까?')) return;
      
      const token = localStorage.getItem('wowcampus_token');
      try {
        const response = await fetch('/api/documents/' + id, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        
        const data = await response.json();
        if (data.success) {
          alert('삭제 성공!');
          location.reload();
        } else {
          alert('삭제 실패: ' + data.message);
        }
      } catch (error) {
        alert('삭제 중 오류: ' + error.message);
      }
    }
  </script>
</body>
</html>`;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // 인증된 경우 - 문서 목록 조회하여 렌더링
  // (이 부분은 실행되지 않음 - API를 통해 데이터 가져옴)
  return c.redirect('/dashboard/jobseeker/documents');
}
