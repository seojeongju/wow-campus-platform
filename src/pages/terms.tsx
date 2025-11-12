/**
 * Page Component
 * Route: /terms
 * Original: src/index.tsx lines 15358-15485
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/logo.jpg" alt="WOW-CAMPUS" class="h-10 w-auto" />
            </a>
          </div>
          
          <div class="flex items-center space-x-4">
            <a href="/home" class="text-gray-600 hover:text-blue-600 transition-colors">홈으로</a>
          </div>
        </nav>
      </header>

      {/* Terms Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
            
            <div class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">제1조 (목적)</h2>
              <p class="text-gray-600 mb-6">
                이 약관은 (주)와우쓰리디(이하 "회사")가 운영하는 외국인 구인구직 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제2조 (용어의 정의)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. "서비스"라 함은 회사가 제공하는 외국인 구인구직 AI스마트매칭 플랫폼을 의미합니다.</p>
                <p class="mb-2">2. "이용자"라 함은 이 약관에 따라 회사가 제공하는 서비스를 받는 자를 의미합니다.</p>
                <p class="mb-2">3. "구직자"라 함은 구직 정보를 등록하고 취업을 희망하는 외국인을 의미합니다.</p>
                <p class="mb-2">4. "기업"이라 함은 구인 정보를 등록하고 외국인 인재 채용을 희망하는 회사를 의미합니다.</p>
                <p class="mb-2">5. "에이전트"라 함은 구인구직 AI스마트매칭을 중개하는 인력소개업체를 의미합니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제3조 (약관의 효력 및 변경)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</p>
                <p class="mb-2">2. 회사는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지됩니다.</p>
                <p class="mb-2">3. 변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제4조 (서비스의 제공 및 변경)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 회사는 다음과 같은 서비스를 제공합니다:</p>
                <div class="ml-4">
                  <p class="mb-2">- 외국인 구인구직 AI스마트매칭 서비스</p>
                  <p class="mb-2">- 구인공고 등록 및 조회 서비스</p>
                  <p class="mb-2">- 구직자 프로필 등록 및 관리 서비스</p>
                  <p class="mb-2">- 에이전트 중개 서비스</p>
                  <p class="mb-2">- 기타 회사가 정하는 서비스</p>
                </div>
                <p class="mb-2">2. 회사는 서비스 향상을 위해 서비스의 내용을 추가, 변경, 삭제할 수 있습니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제5조 (회원가입)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 서비스 이용을 희망하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</p>
                <p class="mb-2">2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 자가 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:</p>
                <div class="ml-4">
                  <p class="mb-2">- 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</p>
                  <p class="mb-2">- 등록 내용에 허위, 기재누락, 오기가 있는 경우</p>
                  <p class="mb-2">- 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제6조 (개인정보보호)</h2>
              <p class="text-gray-600 mb-6">
                회사는 이용자의 개인정보 보호를 위해 개인정보처리방침을 수립·공시하고 이를 준수합니다. 
                자세한 내용은 개인정보처리방침을 참조하시기 바랍니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제7조 (이용자의 의무)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 이용자는 다음 행위를 하여서는 안 됩니다:</p>
                <div class="ml-4">
                  <p class="mb-2">- 신청 또는 변경 시 허위내용의 등록</p>
                  <p class="mb-2">- 타인의 정보 도용</p>
                  <p class="mb-2">- 회사가 게시한 정보의 변경</p>
                  <p class="mb-2">- 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</p>
                  <p class="mb-2">- 회사나 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</p>
                  <p class="mb-2">- 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제8조 (서비스 이용의 제한)</h2>
              <p class="text-gray-600 mb-6">
                회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 
                경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
              </p>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제9조 (면책조항)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">1. 회사는 천재지변, 전쟁 및 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 대한 책임이 면제됩니다.</p>
                <p class="mb-2">2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                <p class="mb-2">3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제10조 (분쟁해결)</h2>
              <p class="text-gray-600 mb-6">
                이 약관에 명시되지 않은 사항은 대한민국의 관계 법령과 상관례에 따라 처리하며, 
                서비스 이용으로 발생한 분쟁에 대해 소송이 필요한 경우 민사소송법상의 관할법원에 제기합니다.
              </p>

              <div class="mt-12 pt-8 border-t border-gray-200">
                <p class="text-sm text-gray-500">시행일자: 2024년 1월 1일</p>
                <p class="text-sm text-gray-500">(주)와우쓰리디 플랫폼</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
