/**
 * 구직자 문서 관리 페이지
 * Route: /dashboard/jobseeker/documents
 * 파일 업로드, 조회, 다운로드, 삭제 기능
 */

import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
  // 인증 체크
  if (!user || user.user_type !== 'jobseeker') {
    throw new HTTPException(403, { message: '구직자만 접근할 수 있는 페이지입니다.' });
  }

  // 업로드된 문서 목록 조회
  let documents = [];
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        id, 
        document_type, 
        original_name, 
        file_size, 
        mime_type,
        description,
        upload_date,
        created_at
      FROM documents 
      WHERE user_id = ? AND is_active = 1
      ORDER BY upload_date DESC
    `).bind(user.id).all();
    
    documents = result.results || [];
  } catch (error) {
    console.error('문서 목록 조회 오류:', error);
  }

  return c.html(
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>문서 관리 - WOW-CAMPUS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body class="bg-gray-50">
        {/* Header */}
        <header class="bg-white shadow-sm sticky top-0 z-50">
          <nav class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
              {/* Logo */}
              <a href="/" class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">W</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                  <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
                </div>
              </a>

              {/* Navigation */}
              <div class="hidden lg:flex items-center space-x-6">
                <a href="/dashboard/jobseeker" class="text-gray-600 hover:text-blue-600">
                  <i class="fas fa-home mr-2"></i>대시보드
                </a>
                <a href="/dashboard/jobseeker/profile" class="text-gray-600 hover:text-blue-600">
                  <i class="fas fa-user mr-2"></i>프로필
                </a>
                <a href="/dashboard/jobseeker/documents" class="text-blue-600 font-medium">
                  <i class="fas fa-file-alt mr-2"></i>문서 관리
                </a>
              </div>

              {/* User Menu */}
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-600">{user.name}님</span>
                <a href="/" onclick="localStorage.clear(); return true;" class="text-sm text-red-600 hover:text-red-700">
                  <i class="fas fa-sign-out-alt mr-1"></i>로그아웃
                </a>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main class="container mx-auto px-4 py-8 max-w-6xl">
          {/* Page Header */}
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              <i class="fas fa-folder-open text-blue-600 mr-3"></i>
              문서 관리
            </h1>
            <p class="text-gray-600">이력서, 증명서 등의 문서를 업로드하고 관리하세요</p>
          </div>

          {/* Upload Success/Error Messages */}
          <div id="message-container"></div>

          {/* Upload Form */}
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-upload text-green-600 mr-2"></i>
              새 문서 업로드
            </h2>

            <form 
              action="/api/documents/upload" 
              method="POST" 
              enctype="multipart/form-data"
              id="upload-form"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* File Input */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    파일 선택 <span class="text-red-500">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="file" 
                    id="file-input"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    허용 형식: PDF, Word, 이미지 (최대 10MB)
                  </p>
                </div>

                {/* Document Type */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    문서 종류 <span class="text-red-500">*</span>
                  </label>
                  <select 
                    name="documentType" 
                    id="document-type"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="resume">이력서</option>
                    <option value="career">경력증명서</option>
                    <option value="certificate">자격증/증명서</option>
                    <option value="other">기타</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  문서 설명 (선택)
                </label>
                <input 
                  type="text" 
                  name="description"
                  placeholder="예: 2024년 업데이트된 이력서"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                class="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <i class="fas fa-cloud-upload-alt mr-2"></i>
                업로드
              </button>
            </form>
          </div>

          {/* Documents List */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              <i class="fas fa-list text-blue-600 mr-2"></i>
              업로드된 문서 ({documents.length}개)
            </h2>

            {documents.length === 0 ? (
              <div class="text-center py-12 text-gray-500">
                <i class="fas fa-folder-open text-6xl mb-4 text-gray-300"></i>
                <p class="text-lg">업로드된 문서가 없습니다</p>
                <p class="text-sm mt-2">위 양식을 통해 첫 문서를 업로드해보세요</p>
              </div>
            ) : (
              <div class="space-y-3">
                {documents.map((doc: any) => {
                  const typeConfig = {
                    resume: { label: '이력서', icon: 'fa-file-alt', color: 'blue' },
                    career: { label: '경력증명서', icon: 'fa-briefcase', color: 'green' },
                    certificate: { label: '자격증', icon: 'fa-certificate', color: 'purple' },
                    other: { label: '기타', icon: 'fa-file', color: 'gray' }
                  };
                  
                  const config = typeConfig[doc.document_type] || typeConfig.other;
                  const fileSizeKB = (doc.file_size / 1024).toFixed(2);
                  const uploadDate = new Date(doc.upload_date).toLocaleDateString('ko-KR');
                  
                  return (
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center flex-1">
                          <div class={`w-12 h-12 bg-${config.color}-100 rounded-lg flex items-center justify-center mr-4`}>
                            <i class={`fas ${config.icon} text-${config.color}-600 text-xl`}></i>
                          </div>
                          <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-1">
                              <h4 class="font-medium text-gray-900">{doc.original_name}</h4>
                              <span class={`px-2 py-1 bg-${config.color}-100 text-${config.color}-800 text-xs rounded-full`}>
                                {config.label}
                              </span>
                            </div>
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                              <span><i class="fas fa-database mr-1"></i>{fileSizeKB} KB</span>
                              <span><i class="fas fa-calendar mr-1"></i>{uploadDate}</span>
                            </div>
                            {doc.description && (
                              <p class="text-sm text-gray-600 mt-1">{doc.description}</p>
                            )}
                          </div>
                        </div>
                        <div class="flex items-center space-x-2 ml-4">
                          <a 
                            href={`/api/documents/${doc.id}/download`}
                            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="다운로드"
                          >
                            <i class="fas fa-download"></i>
                          </a>
                          <form method="POST" action={`/api/documents/${doc.id}/delete`} style="display: inline;">
                            <button 
                              type="submit"
                              onclick="return confirm('정말 이 문서를 삭제하시겠습니까?')"
                              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer class="bg-white border-t border-gray-200 mt-12 py-6">
          <div class="container mx-auto px-4 text-center text-gray-600 text-sm">
            <p>&copy; 2024 WOW-CAMPUS. All rights reserved.</p>
          </div>
        </footer>

        {/* JavaScript for form handling */}
        <script dangerouslySetInnerHTML={{__html: `
          // Check for URL parameters (success/error messages)
          const urlParams = new URLSearchParams(window.location.search);
          const messageContainer = document.getElementById('message-container');
          
          if (urlParams.get('success') === '1') {
            messageContainer.innerHTML = \`
              <div class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
                <i class="fas fa-check-circle mr-2"></i>
                문서가 성공적으로 업로드되었습니다!
              </div>
            \`;
            // Remove query params from URL
            window.history.replaceState({}, '', window.location.pathname);
          } else if (urlParams.get('error')) {
            const errorMsg = decodeURIComponent(urlParams.get('error'));
            messageContainer.innerHTML = \`
              <div class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                <i class="fas fa-exclamation-circle mr-2"></i>
                \${errorMsg}
              </div>
            \`;
            // Remove query params from URL
            window.history.replaceState({}, '', window.location.pathname);
          }

          // Form validation
          const uploadForm = document.getElementById('upload-form');
          uploadForm.addEventListener('submit', function(e) {
            const fileInput = document.getElementById('file-input');
            const file = fileInput.files[0];
            
            if (!file) {
              e.preventDefault();
              alert('파일을 선택해주세요.');
              return false;
            }
            
            // Check file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
              e.preventDefault();
              alert('파일 크기는 10MB를 초과할 수 없습니다.\\n\\n현재 크기: ' + (file.size / 1024 / 1024).toFixed(2) + ' MB');
              return false;
            }
            
            // Show loading state
            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>업로드 중...';
          });
        `}} />
      </body>
    </html>
  );
};
