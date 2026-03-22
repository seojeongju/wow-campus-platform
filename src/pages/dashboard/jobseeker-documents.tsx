import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const handler = async (c: Context) => {
  const user = c.get('user');
  const { t } = c.get('i18n');

  if (!user || user.user_type !== 'jobseeker') {
    throw new HTTPException(403, { message: t('dashboard.jobseeker_page.error_access') });
  }

  // 문서 목록 조회
  let documents: any[] = [];
  try {
    const docs = await c.env.DB.prepare(`
      SELECT 
        id,
        document_type,
        original_name,
        file_name,
        file_size,
        mime_type,
        upload_date,
        description
      FROM documents
      WHERE user_id = ? AND is_active = 1
      ORDER BY upload_date DESC
    `).bind(user.id).all();

    documents = docs.results || [];
  } catch (error) {
    console.error('Documents fetch error:', error);
  }

  const success = c.req.query('success');
  const error = c.req.query('error');

  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
          </div>

          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴 */}
          </div>

          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3">
            {/* 동적 인증 버튼 */}
          </div>

          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
        </nav>
      </header>

      <main class="container mx-auto px-4 py-8">
        <div class="mb-6">
          <a href="/dashboard/jobseeker" class="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>
            대시보드로 돌아가기
          </a>
        </div>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">서류 관리</h1>
            <p class="text-gray-600">이력서, 자기소개서, 증빙서류 등을 업로드하고 관리하세요.</p>
          </div>
          <button 
            onclick="document.getElementById('upload-modal').classList.remove('hidden')"
            class="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <i class="fas fa-upload mr-2"></i>
            새 문서 업로드
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-8 flex items-center">
            <i class="fas fa-check-circle mr-3 text-xl"></i>
            <span>{success === '1' ? '문서가 성공적으로 업로드되었습니다.' : '문서가 삭제되었습니다.'}</span>
          </div>
        )}
        {error && (
          <div class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8 flex items-center">
            <i class="fas fa-exclamation-circle mr-3 text-xl"></i>
            <span>{decodeURIComponent(error)}</span>
          </div>
        )}

        {/* Documents Table */}
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          {documents.length > 0 ? (
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b">
                    <th class="px-6 py-4 font-semibold text-gray-700">문서 종류</th>
                    <th class="px-6 py-4 font-semibold text-gray-700">파일명</th>
                    <th class="px-6 py-4 font-semibold text-gray-700">용량</th>
                    <th class="px-6 py-4 font-semibold text-gray-700">업로드일</th>
                    <th class="px-6 py-4 font-semibold text-gray-700 text-right">관리</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {doc.document_type === 'resume' ? '이력서' : 
                           doc.document_type === 'portfolio' ? '포트폴리오' : 
                           doc.document_type === 'visa' ? '비자 서류' : '기타'}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <i class={`fas ${doc.mime_type?.includes('pdf') ? 'fa-file-pdf text-red-500' : 'fa-file-alt text-gray-400'} mr-3`}></i>
                          <span class="font-medium text-gray-900 break-all">{doc.original_name}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-gray-500 text-sm">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td class="px-6 py-4 text-gray-500 text-sm">
                        {new Date(doc.upload_date).toLocaleDateString('ko-KR')}
                      </td>
                      <td class="px-6 py-4 text-right space-x-2">
                        <a 
                          href={`/api/documents/${doc.id}/download`}
                          class="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <i class="fas fa-download mr-1"></i>
                          다운로드
                        </a>
                        <form action={`/api/documents/${doc.id}/delete`} method="POST" style="display: inline;" onsubmit="return confirm('정말 삭제하시겠습니까?');">
                          <button 
                            type="submit"
                            class="inline-flex items-center px-3 py-1 bg-white border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <i class="fas fa-trash-alt mr-1"></i>
                            삭제
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div class="p-12 text-center">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-file-upload text-3xl text-gray-400"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">아직 업로드된 문서가 없습니다.</h3>
              <p class="text-gray-500 mb-6">지원에 필요한 이력서와 서류를 업로드해 보세요.</p>
              <button 
                onclick="document.getElementById('upload-modal').classList.remove('hidden')"
                class="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <i class="fas fa-upload mr-2"></i>
                문서 업로드하기
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      <div id="upload-modal" class="hidden fixed inset-0 z-[60] overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onclick="document.getElementById('upload-modal').classList.add('hidden')"></div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-6 pt-6 pb-6 sm:p-8">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">새 문서 업로드</h3>
                <button onclick="document.getElementById('upload-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <form action="/api/documents/upload" method="POST" enctype="multipart/form-data" class="space-y-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">문서 종류</label>
                  <select name="documentType" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    <option value="resume">이력서 (Resume)</option>
                    <option value="portfolio">포트폴리오 (Portfolio)</option>
                    <option value="visa">비자 관련 서류 (Visa Documents)</option>
                    <option value="education">학력 증명 (Education)</option>
                    <option value="other">기타 (Other)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">파일 선택</label>
                  <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer group" onclick="document.getElementById('file-input').click()">
                    <div class="space-y-1 text-center">
                      <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 group-hover:text-blue-500 transition-colors mb-3"></i>
                      <div class="flex text-sm text-gray-600">
                        <span class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          파일 찾기
                        </span>
                        <p class="pl-1">또는 여기로 드래그하세요</p>
                      </div>
                      <p class="text-xs text-gray-500">
                        PDF, Word, JPG, PNG (최대 10MB)
                      </p>
                    </div>
                    <input id="file-input" name="file" type="file" required class="sr-only" onchange="document.getElementById('filename-display').textContent = this.files[0]?.name || ''" />
                  </div>
                  <p id="filename-display" class="mt-2 text-sm text-blue-600 font-medium text-center"></p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">설명 (선택사항)</label>
                  <textarea name="description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="문서에 대한 짧은 설명을 입력하세요..."></textarea>
                </div>

                <div class="flex items-center space-x-3 pt-4">
                  <button type="button" onclick="document.getElementById('upload-modal').classList.add('hidden')" class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    취소
                  </button>
                  <button type="submit" class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">
                    업로드 시작
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
        // 대시보드 스크립트
        (function() {
          function init() {
            if (typeof setupNavigation !== 'undefined') setupNavigation();
            if (typeof initMobileMenu !== 'undefined') initMobileMenu();
            if (typeof restoreLoginState !== 'undefined') restoreLoginState();
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
          } else {
            setTimeout(init, 100);
          }
        })();
      `}} />
    </div>
  )
}
