/**
 * Page Component
 * Route: /support
 * 글로벌 지원 센터 메인 페이지
 */

import type { Context } from 'hono'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
  // 서비스 카드 데이터
  const services = [
    {
      icon: '💼',
      title: '비자 지원',
      description: 'D-2, D-10, E-7 등 각종 비자 상담 및 신청 지원',
      link: '/support/visa',
      color: 'blue'
    },
    {
      icon: '⚖️',
      title: '법률 지원',
      description: '근로계약, 임대차 계약 등 법률 상담 서비스',
      link: '/support/legal',
      color: 'purple'
    },
    {
      icon: '💳',
      title: '금융 지원',
      description: '은행 계좌 개설, 송금, 신용카드 발급 안내',
      link: '/support/finance',
      color: 'green'
    },
    {
      icon: '📱',
      title: '통신 지원',
      description: '휴대폰 개통, 인터넷 가입, 요금제 비교',
      link: '/support/telecom',
      color: 'orange'
    },
    {
      icon: '🎓',
      title: '학업/진로 상담',
      description: '학업 계획, 진로 설계, 장학금 정보 제공',
      link: '/support/academic',
      color: 'indigo'
    },
    {
      icon: '💼',
      title: '취업 지원',
      description: '이력서 작성, 면접 준비, 취업비자 전환 지원',
      link: '/support/employment',
      color: 'cyan'
    }
  ];
  
  // 긴급 연락처
  const emergencyContacts = [
    { icon: '🚨', title: '긴급전화', number: '112 (경찰) / 119 (소방)', description: '긴급 상황 시' },
    { icon: '🏥', title: '외국인종합안내', number: '1345', description: '24시간 다국어 상담' },
    { icon: '💼', title: '고용노동부', number: '1350', description: '근로 관련 상담' },
    { icon: '🏛️', title: '출입국관리소', number: '1345', description: '비자 관련 문의' }
  ];
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <a href="/home" class="flex items-center space-x-3">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABlCAYAAAD3Xd5lAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QsMBR0y8emRNAAAcSJJREFUeNrtfWeYlEUa7amqL3Wa7p4IDAw5m0BUVDBgRkyYc06YI66BNWfMrgGzmAMoZlFRBBGQnMMwOXdPT8cvVdX90T0Iguvu6q7ee/vw9DM8M1256tRbVW8A8sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPPLII4888sgjjzzyyCOPPP7LIH9m4e81SQKgEEC7FoQAQRhACoB9hPG/qdr9c2oQ0FVaH09VrGrvMOotS1KNoX+Bn/QLFrQ5QrTdsWfP/EzZAi+9+xM8Xk/JTz8tLVqyeLVsj3VAUQz0qCghe+wx0OrVq0tNIpnmZx2zb76z/h/EvY99gcJwqHTZypWFq9euk7H2DhQUBNG7dynZYVBvs0eP7jXxeEKce8r+f3jZ/zErPPH1Ckgpdv6mruGEdocpBjWkIH44NM3CLDLn3VN3+vCh2bXimn1Gb0sS36zEjj2LlZnLai5qEf6jaloTS5mwnZIK3w6w4xt8mdQ9krGWF088ZLtl3zp9AShk39URcV4l5wRKAoYdgtcUtEdBYu7Ubxump18++1fr/npNEh5NVX/aVF1Yt6l1z5RU97U0Y1yE0OIOECmJRBEFDUq+MOTac1S475V0LVotHO48MGbwNvkd+tTbgJS9bb3wfMoKqSmTcBRBAtzLh/j8r61qi62cefHe263Lo1+vQUXAUD5d03hSpRA7Q3JemKawmIcFvZm1e3VteeGiA8eLX2vLxe/OQlBh41YkzX2RYVwSFZaUrMhJbSpKtD2bNALuK1cc/bsnysVX3g8pHK05kh4SS9rjXaGOcgUZ3t6eEpblglEFXi8loTDaTSv2UWlhaPbAngNnn3Li+GgmY9qjRvb4l8q56YEXwV13zy+/mntMNGYJBRQUAplMhgwfsXNy//32fDIeT0ZvueLY38yr77BjQKR1tENCe7vwc0okKE+yHQaWb7j0whOfe3/G13zKIxP/5T4oG3QEdtlp8JBNNZFTTYsqFKq0LAuD+hWIo48c9RznovLqC48HABx50gRIKfesrbaOcRwmHNkGoigg0g8pJQAJwSmkBCgDVB0IBj1kYL8eaTNtvz2ob//GDz75NLbo+1e3qcfDT70PzvmQ6Z98c8bG2igYVcAUP6SIs9Ji+WNTi/lu3dJp/7Qt48+47vQfF9bu5HAPp6oDQUwEvV7Rr1f5c1LKys/evner71/7t8fguKYWibg7NTTFj3akuo8gZKdYIiks2wFjKgI+kKBfiTQ1NHy409D+MVUl7+wwtF/jl1/Pjn05/ak/hLCU/zRhJJMG5bzZJji..." alt="WOW-CAMPUS" class="h-10" />
              <span class="text-xl font-bold text-blue-600">WOW-CAMPUS</span>
            </a>
          </div>
          
          <div id="navigation-menu-container" class="hidden lg:flex items-center space-x-8">
            {/* 동적 메뉴가 여기에 로드됩니다 */}
          </div>
          
          {/* Mobile Menu Button */}
          <button id="mobile-menu-btn" class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
            <i class="fas fa-bars text-2xl"></i>
          </button>
          
          {/* Desktop Auth Buttons */}
          <div id="auth-buttons-container" class="hidden lg:flex items-center space-x-3"></div>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-200">
          <div class="container mx-auto px-4 py-4 space-y-3">
            <div id="mobile-navigation-menu" class="space-y-2 pb-3 border-b border-gray-200">
              {/* 동적 네비게이션 메뉴가 여기에 로드됩니다 */}
            </div>
            <div id="mobile-auth-buttons" class="pt-3">
              {/* 모바일 인증 버튼이 여기에 로드됩니다 */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-12 mb-12 text-center">
          <div class="max-w-3xl mx-auto">
            <div class="text-6xl mb-4">🌏</div>
            <h1 class="text-4xl md:text-5xl font-bold mb-4">글로벌 지원 센터</h1>
            <p class="text-xl text-blue-100 mb-6">
              외국인 유학생을 위한 원스톱 지원 서비스
            </p>
            <p class="text-blue-50">
              비자, 법률, 금융, 통신, 학업, 취업까지<br/>
              한국 생활에 필요한 모든 지원을 한 곳에서 받으세요
            </p>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">제공 서비스</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
              const bgColors = {
                blue: 'bg-blue-50 hover:bg-blue-100',
                purple: 'bg-purple-50 hover:bg-purple-100',
                green: 'bg-green-50 hover:bg-green-100',
                orange: 'bg-orange-50 hover:bg-orange-100',
                indigo: 'bg-indigo-50 hover:bg-indigo-100',
                cyan: 'bg-cyan-50 hover:bg-cyan-100'
              };
              
              const iconColors = {
                blue: 'bg-blue-100',
                purple: 'bg-purple-100',
                green: 'bg-green-100',
                orange: 'bg-orange-100',
                indigo: 'bg-indigo-100',
                cyan: 'bg-cyan-100'
              };
              
              return (
                <a 
                  href={service.link}
                  class={`${bgColors[service.color]} rounded-xl p-6 transition-all duration-200 hover:shadow-lg group cursor-pointer`}
                >
                  <div class={`w-16 h-16 ${iconColors[service.color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span class="text-3xl">{service.icon}</span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p class="text-gray-600 mb-4">{service.description}</p>
                  <div class="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                    자세히 보기
                    <i class="fas fa-arrow-right ml-2"></i>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Access Section */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* 긴급 연락처 */}
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-phone-alt text-red-500 mr-3"></i>
              긴급 연락처
            </h2>
            <div class="space-y-3">
              {emergencyContacts.map(contact => (
                <div class="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span class="text-2xl mr-3">{contact.icon}</span>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-900">{contact.title}</div>
                    <div class="text-blue-600 font-bold text-lg">{contact.number}</div>
                    <div class="text-sm text-gray-600">{contact.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 온라인 상담 신청 */}
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-comments text-blue-500 mr-3"></i>
              온라인 상담
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600">
                전문 상담사가 여러분의 고민을 해결해드립니다.<br/>
                언제든지 편하게 상담을 신청하세요.
              </p>
              
              <div class="grid grid-cols-2 gap-3">
                <button class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <i class="fas fa-calendar-check mr-2"></i>
                  상담 예약
                </button>
                <button class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <i class="fas fa-comment-dots mr-2"></i>
                  실시간 채팅
                </button>
              </div>
              
              <div class="pt-4 border-t border-gray-200">
                <div class="text-sm text-gray-600 mb-2">상담 가능 시간</div>
                <div class="font-semibold text-gray-900">
                  평일: 09:00 - 18:00<br/>
                  토요일: 09:00 - 13:00<br/>
                  <span class="text-red-500">일요일 및 공휴일 휴무</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div class="bg-white rounded-xl shadow-sm p-6 mb-12">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i class="fas fa-question-circle text-purple-500 mr-3"></i>
            자주 묻는 질문
          </h2>
          <div class="space-y-4">
            <details class="group">
              <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <span class="font-medium text-gray-900">비자 연장은 어떻게 하나요?</span>
                <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
              </summary>
              <div class="p-4 text-gray-600">
                비자 연장은 만료일 4개월 전부터 신청 가능합니다. 필요 서류를 준비하여 가까운 출입국관리사무소를 방문하시거나, 
                저희 비자 지원 서비스를 통해 신청을 도와드릴 수 있습니다.
              </div>
            </details>
            
            <details class="group">
              <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <span class="font-medium text-gray-900">은행 계좌는 어떻게 개설하나요?</span>
                <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
              </summary>
              <div class="p-4 text-gray-600">
                외국인등록증, 여권, 학생증을 지참하여 은행을 방문하시면 됩니다. 
                금융 지원 서비스에서 외국인 친화적인 은행과 필요 서류를 자세히 안내해드립니다.
              </div>
            </details>
            
            <details class="group">
              <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <span class="font-medium text-gray-900">아르바이트는 몇 시간까지 가능한가요?</span>
                <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
              </summary>
              <div class="p-4 text-gray-600">
                D-2 비자 소지자는 학기 중 주 20시간, 방학 중에는 제한 없이 아르바이트가 가능합니다. 
                다만, 시간제취업허가를 받아야 하며, 자세한 사항은 법률 지원 서비스에서 안내받으실 수 있습니다.
              </div>
            </details>
            
            <details class="group">
              <summary class="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                <span class="font-medium text-gray-900">졸업 후 취업비자로 전환하려면?</span>
                <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
              </summary>
              <div class="p-4 text-gray-600">
                D-10(구직비자) 또는 E-7(특정활동비자)로 전환할 수 있습니다. 
                취업 지원 서비스에서 비자 전환 절차와 필요 서류를 상세히 안내해드리며, 
                취업 준비부터 비자 신청까지 전 과정을 지원합니다.
              </div>
            </details>
          </div>
          
          <div class="mt-6 text-center">
            <button class="text-blue-600 font-medium hover:underline">
              더 많은 FAQ 보기 →
            </button>
          </div>
        </div>

        {/* Notice Section */}
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-bullhorn text-orange-500 mr-3"></i>
            공지사항
          </h2>
          <div class="space-y-3">
            <div class="flex items-start">
              <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded mr-3 mt-1">중요</span>
              <div class="flex-1">
                <a href="#" class="font-medium text-gray-900 hover:text-blue-600">2024년 비자 정책 변경 안내</a>
                <div class="text-sm text-gray-600">2024.01.15</div>
              </div>
            </div>
            <div class="flex items-start">
              <span class="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded mr-3 mt-1">NEW</span>
              <div class="flex-1">
                <a href="#" class="font-medium text-gray-900 hover:text-blue-600">설날 연휴 상담 운영 안내</a>
                <div class="text-sm text-gray-600">2024.01.20</div>
              </div>
            </div>
            <div class="flex items-start">
              <span class="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded mr-3 mt-1">이벤트</span>
              <div class="flex-1">
                <a href="#" class="font-medium text-gray-900 hover:text-blue-600">신규 회원 무료 상담 이벤트</a>
                <div class="text-sm text-gray-600">2024.01.10</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-gray-800 text-white mt-12 py-8">
        <div class="container mx-auto px-4 text-center">
          <p class="text-gray-400">© 2024 WOW-CAMPUS. All rights reserved.</p>
          <div class="mt-4 flex justify-center space-x-6">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">이용약관</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">고객센터</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
