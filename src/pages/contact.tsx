/**
 * Page Component
 * Route: /contact
 * Original: src/index.tsx lines 13317-13494
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/static/logo.png" alt="WOW-CAMPUS" class="h-10 w-auto" />
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">← 고객지원</a>
              <a href="/home" class="text-blue-600 hover:text-blue-800">홈으로</a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">문의하기</h1>
          <p class="text-gray-600 text-lg">궁금한 사항이나 제안사항을 언제든 보내주세요</p>
        </div>

        <div class="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <h2 class="text-2xl font-bold mb-8">연락처 정보</h2>
            <div class="space-y-6">
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-envelope text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">이메일</h3>
                    <p class="text-gray-600 mb-2">wow3d16@naver.com</p>
                    <p class="text-sm text-gray-500">24시간 접수 가능 / 평균 2시간 내 응답</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-phone text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">전화문의</h3>
                    <div class="space-y-1 mb-2">
                      <p class="text-gray-600"><span class="font-medium text-gray-900">서울:</span> 02-3144-3137</p>
                      <p class="text-gray-600"><span class="font-medium text-gray-900">구미:</span> 054-464-3137</p>
                    </div>
                    <p class="text-sm text-gray-500">평일 09:00~18:00 (점심시간 12:00~13:00 제외)</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-map-marker-alt text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-3">사무소 위치</h3>
                    <div class="space-y-3">
                      <div>
                        <p class="font-medium text-gray-900 mb-1">서울 본사</p>
                        <p class="text-sm text-gray-600">서울시 마포구 독막로 93 상수빌딩 4층</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 mb-1">구미 지사</p>
                        <p class="text-sm text-gray-600">경북 구미시 구미대로 산호대로 253<br/>구미첨단의료기술타워 606호</p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 mb-1">전주 지사</p>
                        <p class="text-sm text-gray-600">전북특별자치도 전주시 덕진구 반룡로 109<br/>테크노빌 A동 207호</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-2xl font-bold mb-8">온라인 문의</h2>
            <form id="contact-form" class="bg-white p-8 rounded-lg shadow-sm space-y-6">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">이름 *</label>
                  <input type="text" name="name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="실명을 입력해주세요" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
                  <input type="tel" name="phone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="010-0000-0000" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">이메일 *</label>
                <input type="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="답변 받을 이메일 주소" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">제목 *</label>
                <input type="text" name="subject" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="문의 제목을 입력해주세요" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">문의 내용 *</label>
                <textarea name="message" required rows="6" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="궁금한 사항을 자세히 적어주세요"></textarea>
              </div>

              <div class="text-center">
                <button type="submit" id="submit-btn" class="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  문의 보내기
                </button>
                <p class="text-sm text-gray-500 mt-3">문의 접수 후 평균 2시간 내에 답변을 드립니다</p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{__html: `
        // Contact form submission
        document.getElementById('contact-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const form = e.target;
          const submitBtn = document.getElementById('submit-btn');
          const formData = new FormData(form);
          
          const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
          };
          
          // Disable submit button
          submitBtn.disabled = true;
          submitBtn.textContent = '전송 중...';
          
          try {
            const response = await fetch('/api/contact/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
              toast.success('✅ ' + result.message);
              form.reset();
            } else {
              toast.error('❌ ' + (result.error || '문의 전송에 실패했습니다.'));
            }
          } catch (error) {
            console.error('Contact form error:', error);
            toast.error('❌ 문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '문의 보내기';
          }
        });
      `}} />
    </div>
  )
}
