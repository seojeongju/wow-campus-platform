/**
 * Page Component
 * Route: /admin/inquiries
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
    return c.render(
        <div class="min-h-screen bg-gray-100 flex">
            {/* Sidebar (Copied from admin-full.tsx and modified) */}
            <aside id="admin-sidebar" class="hidden lg:flex lg:flex-col w-64 bg-gradient-to-b from-blue-900 to-blue-800 shadow-2xl fixed h-screen z-40 overflow-y-auto">
                <div class="p-6 border-b border-blue-700">
                    <a href="/admin" class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <i class="fas fa-shield-alt text-blue-600 text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-white font-bold text-lg">WOW-CAMPUS</span>
                            <span class="text-blue-200 text-xs">관리자 대시보드</span>
                        </div>
                    </a>
                </div>

                <nav class="flex-1 px-4 py-6 space-y-2">
                    {/* Dashboard */}
                    <a href="/admin" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
                        <i class="fas fa-home w-5 text-center"></i>
                        <span class="font-medium">대시보드 홈</span>
                    </a>

                    {/* Inquiries (Active) */}
                    <a href="/admin/inquiries" class="flex items-center space-x-3 px-4 py-3 bg-blue-700 text-white rounded-lg transition-all duration-200 group shadow-lg ring-1 ring-blue-500">
                        <i class="fas fa-comments w-5 text-center"></i>
                        <span class="font-medium">1:1 문의 관리</span>
                    </a>

                    {/* Jobs */}
                    <a href="/jobs" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
                        <i class="fas fa-briefcase w-5 text-center"></i>
                        <span class="font-medium">구인정보 관리</span>
                    </a>

                    {/* Jobseekers */}
                    <a href="/jobseekers" class="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 group">
                        <i class="fas fa-user-tie w-5 text-center"></i>
                        <span class="font-medium">구직정보 관리</span>
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <div class="flex-1 lg:ml-64 min-h-screen">
                <header class="bg-white shadow-md sticky top-0 z-30 border-b border-gray-200">
                    <div class="container mx-auto px-6 py-4 flex items-center justify-between">
                        <h1 class="text-2xl font-bold text-gray-800">1:1 문의 관리</h1>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-500">관리자 모드</span>
                        </div>
                    </div>
                </header>

                <main class="p-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Filters */}
                        <div class="p-6 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
                            <div class="flex gap-4">
                                <select id="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="">전체 상태</option>
                                    <option value="pending">대기중</option>
                                    <option value="in_progress">처리중</option>
                                    <option value="resolved">완료</option>
                                </select>
                                <div class="relative">
                                    <input type="text" id="searchInput" placeholder="검색어 입력..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                            <button onclick="loadInquiries()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-sync-alt mr-2"></i>새로고침
                            </button>
                        </div>

                        {/* Table */}
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                        <th class="py-3 px-6 text-left">ID</th>
                                        <th class="py-3 px-6 text-left">접수일시</th>
                                        <th class="py-3 px-6 text-left">카테고리</th>
                                        <th class="py-3 px-6 text-left">제목</th>
                                        <th class="py-3 px-6 text-left">작성자</th>
                                        <th class="py-3 px-6 text-center">상태</th>
                                        <th class="py-3 px-6 text-center">관리</th>
                                    </tr>
                                </thead>
                                <tbody id="inquiriesTableBody" class="text-gray-600 text-sm font-light">
                                    {/* Rows will be populated here */}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div id="pagination" class="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
                            <span id="totalCount" class="text-sm text-gray-600">Total: 0</span>
                            <div id="paginationButtons" class="flex gap-2"></div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Detail Modal */}
            <div id="detailModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <h3 class="text-xl font-bold text-gray-800">문의 상세 내역</h3>
                        <button onclick="closeDetailModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="p-6 overflow-y-auto flex-1">
                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">작성자</label>
                                <p id="modalName" class="text-gray-900 font-medium"></p>
                                <p id="modalEmail" class="text-sm text-gray-600"></p>
                                <p id="modalPhone" class="text-sm text-gray-600"></p>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">접수 정보</label>
                                <p id="modalDate" class="text-gray-900"></p>
                                <span id="modalCategory" class="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"></span>
                            </div>
                        </div>

                        <div class="mb-6">
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">문의 제목</label>
                            <div id="modalSubject" class="text-lg font-bold text-gray-900 border-b pb-2"></div>
                        </div>

                        <div class="mb-8">
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">문의 내용</label>
                            <div id="modalMessage" class="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-200"></div>
                        </div>

                        <div class="border-t pt-6 bg-yellow-50 -mx-6 px-6 pb-6 rounded-b-xl">
                            <h4 class="font-bold text-yellow-800 mb-4 flex items-center">
                                <i class="fas fa-user-shield mr-2"></i>관리자 처리
                            </h4>
                            <div class="flex gap-4 mb-4">
                                <div class="w-1/3">
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">처리 상태</label>
                                    <select id="modalStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white">
                                        <option value="pending">대기중</option>
                                        <option value="in_progress">처리중</option>
                                        <option value="resolved">완료</option>
                                    </select>
                                </div>
                                <div class="w-2/3">
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">관리자 메모 (내부용)</label>
                                    <input type="text" id="modalAdminNote" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" placeholder="처리 내용 메모..." />
                                </div>
                            </div>
                            <div class="flex justify-end">
                                <button onclick="updateInquiry()" class="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors shadow-sm">
                                    저장하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
        let currentPage = 1;
        let currentInquiryId = null;

        document.addEventListener('DOMContentLoaded', () => {
          loadInquiries();
          
          document.getElementById('statusFilter').addEventListener('change', () => {
            currentPage = 1;
            loadInquiries();
          });
          
          document.getElementById('searchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
              currentPage = 1;
              loadInquiries();
            }
          });
        });

        async function loadInquiries() {
          const status = document.getElementById('statusFilter').value;
          const search = document.getElementById('searchInput').value;
          
          try {
            const params = new URLSearchParams({
              page: currentPage,
              limit: 10,
              ...(status && { status }),
              ...(search && { search })
            });

            const response = await fetch('/api/admin/inquiries?' + params);
            const result = await response.json();

            if (result.success) {
              renderTable(result.data.inquiries);
              renderPagination(result.data);
            } else {
              alert('데이터를 불러오는데 실패했습니다.');
            }
          } catch (error) {
            console.error('Error loading inquiries:', error);
          }
        }

        function renderTable(inquiries) {
          const tbody = document.getElementById('inquiriesTableBody');
          tbody.innerHTML = '';

          if (inquiries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-500">문의 내역이 없습니다.</td></tr>';
            return;
          }

          inquiries.forEach(item => {
            const tr = document.createElement('tr');
            tr.classList.add('border-b', 'border-gray-200', 'hover:bg-gray-50');
            
            const statusColors = {
              'pending': 'bg-red-100 text-red-600',
              'in_progress': 'bg-yellow-100 text-yellow-600',
              'resolved': 'bg-green-100 text-green-600'
            };
            const statusLabels = {
              'pending': '대기중',
              'in_progress': '처리중',
              'resolved': '완료'
            };

            const categoryLabels = {
              'general': '일반 문의',
              'technical': '기술 지원',
              'partnership': '제휴 문의',
              'billing': '결제/환불',
              'other': '기타'
            };

            tr.innerHTML = \`
              <td class="py-3 px-6 whitespace-nowrap">\${item.id}</td>
              <td class="py-3 px-6">\${new Date(item.created_at).toLocaleDateString()}</td>
              <td class="py-3 px-6"><span class="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">\${categoryLabels[item.category] || item.category || '일반'}</span></td>
              <td class="py-3 px-6 font-medium text-gray-800 truncate max-w-xs">\${item.subject}</td>
              <td class="py-3 px-6">
                <div class="flex flex-col">
                  <span class="font-semibold">\${item.name}</span>
                  <span class="text-xs text-gray-500">\${item.email}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-center">
                <span class="py-1 px-3 rounded-full text-xs font-bold \${statusColors[item.status] || 'bg-gray-200'}">
                  \${statusLabels[item.status] || item.status}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <button onclick='openDetailModal(\${JSON.stringify(item).replace(/'/g, "&#39;")})' class="text-blue-500 hover:text-blue-700 font-semibold transform hover:scale-110 transition-transform">
                  <i class="fas fa-edit"></i> 관리
                </button>
              </td>
            \`;
            tbody.appendChild(tr);
          });
        }

        function renderPagination(data) {
          const totalCount = document.getElementById('totalCount');
          totalCount.textContent = 'Total: ' + data.total;
          
          const buttons = document.getElementById('paginationButtons');
          buttons.innerHTML = '';
          
          const totalPages = Math.ceil(data.total / data.limit);
          
          if (totalPages <= 1) return;

          for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = \`px-3 py-1 rounded border \${i === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}\`;
            btn.onclick = () => {
              currentPage = i;
              loadInquiries();
            };
            buttons.appendChild(btn);
          }
        }

        window.openDetailModal = (item) => {
          currentInquiryId = item.id;
          
          document.getElementById('modalName').textContent = item.name;
          document.getElementById('modalEmail').textContent = item.email;
          document.getElementById('modalPhone').textContent = item.phone || '-';
          document.getElementById('modalDate').textContent = new Date(item.created_at).toLocaleString();
          document.getElementById('modalCategory').textContent = item.category || '일반';
          document.getElementById('modalSubject').textContent = item.subject;
          document.getElementById('modalMessage').textContent = item.message;
          
          document.getElementById('modalStatus').value = item.status;
          document.getElementById('modalAdminNote').value = item.admin_note || '';
          
          document.getElementById('detailModal').classList.remove('hidden');
        };

        window.closeDetailModal = () => {
          document.getElementById('detailModal').classList.add('hidden');
          currentInquiryId = null;
        };

        window.updateInquiry = async () => {
          if (!currentInquiryId) return;
          
          const status = document.getElementById('modalStatus').value;
          const adminNote = document.getElementById('modalAdminNote').value;
          
          try {
            const response = await fetch('/api/admin/inquiries/' + currentInquiryId, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status, admin_note: adminNote })
            });
            const result = await response.json();
            
            if (result.success) {
              alert('수정되었습니다.');
              closeDetailModal();
              loadInquiries();
            } else {
              alert('수정 실패: ' + result.error);
            }
          } catch (error) {
            console.error('Update failed:', error);
            alert('오류가 발생했습니다.');
          }
        };
      `}} />
        </div>
    )
}
