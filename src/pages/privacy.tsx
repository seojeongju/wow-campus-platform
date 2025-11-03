/**
 * Page Component
 * Route: /privacy
 * Original: src/index.tsx lines 15486-15649
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">W</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-xl text-gray-900">WOW-CAMPUS</span>
                <span class="text-xs text-gray-500">외국인 구인구직 플랫폼</span>
              </div>
            </a>
          </div>
          
          <div class="flex items-center space-x-4">
            <a href="/" class="text-gray-600 hover:text-blue-600 transition-colors">홈으로</a>
          </div>
        </nav>
      </header>

      {/* Privacy Policy Content */}
      <main class="container mx-auto px-4 py-12">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
            
            <div class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">제1조 (개인정보의 처리목적)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-2">(주)와우쓰리디(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                
                <div class="mt-4">
                  <p class="font-medium mb-2">1. 회원 가입 및 관리</p>
                  <p class="mb-4">회원 식별, 회원자격 유지·관리, 서비스 부정이용 방지, 만14세 미만 아동의 개인정보 처리 시 법정대리인의 동의여부 확인, 각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.</p>
                  
                  <p class="font-medium mb-2">2. 구인구직 서비스 제공</p>
                  <p class="mb-4">구인정보 제공, 구직자 정보 제공, AI스마트매칭 서비스 제공, 본인인증, 연령인증, 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산 목적으로 개인정보를 처리합니다.</p>
                  
                  <p class="font-medium mb-2">3. 마케팅 및 광고에의 활용</p>
                  <p class="mb-4">신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계 목적으로 개인정보를 처리합니다.</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium mb-2">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
                  <p class="mb-2">• 회원 가입 및 관리: 회원 탈퇴 시까지</p>
                  <p class="mb-2">• 구인구직 서비스 제공: 서비스 이용 종료 시까지</p>
                  <p class="mb-2">• 계약 또는 청약철회 등에 관한 기록: 5년</p>
                  <p class="mb-2">• 대금결제 및 재화 등의 공급에 관한 기록: 5년</p>
                  <p class="mb-2">• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제3조 (처리하는 개인정보의 항목)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
                
                <div class="space-y-4">
                  <div>
                    <p class="font-medium mb-2">1. 필수항목</p>
                    <p class="mb-2">• 이름, 이메일, 비밀번호, 연락처, 국적, 거주지역</p>
                    <p class="mb-2">• 구직자: 학력, 경력, 희망직종, 비자상태</p>
                    <p class="mb-2">• 기업: 회사명, 사업자등록번호, 담당자 정보</p>
                  </div>
                  
                  <div>
                    <p class="font-medium mb-2">2. 선택항목</p>
                    <p class="mb-2">• 프로필 사진, 자기소개서, 포트폴리오</p>
                  </div>
                  
                  <div>
                    <p class="font-medium mb-2">3. 자동수집항목</p>
                    <p class="mb-2">• IP주소, 쿠키, 서비스 이용기록, 접속 로그</p>
                  </div>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제4조 (개인정보의 제3자 제공)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                
                <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p class="font-medium text-yellow-800 mb-2">AI스마트매칭 서비스의 특성상 다음과 같은 경우 개인정보가 공유될 수 있습니다:</p>
                  <p class="text-yellow-700 mb-2">• 구직자가 구인공고에 지원하는 경우 해당 기업에 제공</p>
                  <p class="text-yellow-700 mb-2">• 기업이 구직자에게 채용제안을 하는 경우 해당 구직자에게 제공</p>
                  <p class="text-yellow-700">• 에이전트가 AI스마트매칭 서비스를 제공하는 경우 관련 당사자에게 제공</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제5조 (개인정보처리의 위탁)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium mb-2">위탁업무 내용 및 수탁자:</p>
                  <p class="mb-2">• 클라우드 서비스: Cloudflare (데이터 저장 및 웹사이트 운영)</p>
                  <p class="mb-2">• 이메일 발송 서비스: (향후 추가 예정)</p>
                  <p>• SMS 발송 서비스: (향후 추가 예정)</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
                
                <div class="space-y-2">
                  <p>1. 개인정보 처리현황 통지요구</p>
                  <p>2. 개인정보 열람요구</p>
                  <p>3. 개인정보 오류 등이 있을 경우 정정·삭제요구</p>
                  <p>4. 개인정보 처리정지요구</p>
                </div>
                
                <p class="mt-4">권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.</p>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제7조 (개인정보의 안전성 확보조치)</h2>
              <div class="text-gray-600 mb-6">
                <p class="mb-4">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
                
                <div class="space-y-2">
                  <p>• 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</p>
                  <p>• 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</p>
                  <p>• 물리적 조치: 전산실, 자료보관실 등의 접근통제</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제8조 (개인정보보호책임자)</h2>
              <div class="text-gray-600 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p class="font-medium mb-2">개인정보보호책임자 연락처:</p>
                  <p class="mb-2">• 성명: 김순희</p>
                  <p class="mb-2">• 이메일: wow3d16@naver.com</p>
                  <p class="mb-2">• 전화번호: 054-464-3137</p>
                  <p>• 처리시간: 평일 09:00 ~ 18:00 (토·일·공휴일 제외)</p>
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-4">제9조 (개인정보 처리방침 변경)</h2>
              <p class="text-gray-600 mb-6">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
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
