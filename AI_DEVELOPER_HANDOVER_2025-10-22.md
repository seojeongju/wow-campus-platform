# AI Developer Handover Document - 2025-10-22

## 🚨 긴급 작업 필요: 관리자 기능 구현 및 배포

---

## 📋 작업 요약

### ❌ 문제 상황
이전 세션에서 작업한 내용이 **배포되지 않았습니다**. 다음 기능들을 처음부터 다시 구현해야 합니다:

1. **에이전트 추가/수정 폼** - 현재 alert만 표시됨 (구현 필요)
2. **임시 비밀번호 시스템** - 모든 사용자 타입에 대한 비밀번호 재발급 기능 (구현 필요)
3. **관리자 계정 관리** - 관리자 추가/관리 시스템 (구현 필요)

### 🌐 현재 배포 상태
- **배포 URL**: https://534849dc.wow-campus-platform.pages.dev/admin
- **현재 버전**: v=18 (cache version in renderer.tsx)
- **브랜치**: main
- **상태**: 이전 버전 (새 기능 없음)

---

## 🎯 구현해야 할 기능 (우선순위 순)

### 1. ✨ 에이전트 추가/수정 폼 (최우선)

#### 현재 상태:
```typescript
// src/index.tsx - 약 4170줄 근처
function showAddAgentForm() {
  alert('에이전트 추가 기능은 준비 중입니다.');
  // TODO: 에이전트 추가 폼 모달 구현
}

function editAgent(agentId) {
  alert(`에이전트 수정 기능은 준비 중입니다. (ID: ${agentId})`);
  // TODO: 에이전트 수정 폼 모달 구현
}
```

#### 구현 필요 사항:
**폼 필드:**
- 기본 정보:
  - ✅ 에이전시명 (agencyName) - required
  - ✅ 담당자명 (contactName) - required
  - ✅ 이메일 (email) - required
  - ✅ 연락처 (phone) - required
  - ✅ 라이센스 번호 (licenseNumber) - optional
  - ✅ 승인 상태 (approvalStatus) - approved/pending/suspended

- 전문 분야 (specialization) - checkboxes:
  - ✅ 유학
  - ✅ 취업
  - ✅ 비자
  - ✅ 정착지원

- 담당 지역:
  - ✅ 담당 국가 (countriesCovered) - comma-separated input
  - ✅ 구사 언어 (languages) - comma-separated input

- 실적 정보:
  - ✅ 수수료율 (commissionRate) - number, default 10.0
  - ✅ 경력 (experienceYears) - number, default 0
  - ✅ 총 실적 (totalPlacements) - number, default 0
  - ✅ 성공률 (successRate) - number, default 0.0

**API 엔드포인트:**
- `POST /api/agents` - 이미 존재함 (약 5715줄)
- `PUT /api/agents/:id` - 이미 존재함 (약 5801줄)

**주의사항:**
- 폼 모달은 `document.createElement()` 사용
- 수정 폼은 `adminAgentsData` 배열에서 데이터 로드
- 저장 시 임시 비밀번호 생성 필요 (새 에이전트만)
- window 객체에 함수 export 필요

---

### 2. 🔑 임시 비밀번호 생성 시스템

#### 구현 위치:
**1) `src/utils/auth.ts` 파일에 함수 추가:**
```typescript
// 이 함수를 파일 끝에 추가
export function generateTemporaryPassword(length: number = 10): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
```

**2) Agent POST API 수정 (약 5715-5771줄):**
```typescript
app.post('/api/agents', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const data = await c.req.json();
    
    // ✅ 임시 비밀번호 생성 추가
    const { generateTemporaryPassword, hashPassword } = await import('./utils/auth');
    const temporaryPassword = generateTemporaryPassword(10);
    const hashedPassword = await hashPassword(temporaryPassword);
    
    // users 테이블에 사용자 생성 시 hashedPassword 사용
    const userResult = await db.prepare(`
      INSERT INTO users (
        email, password, user_type, status, name, phone, created_at, updated_at
      ) VALUES (?, ?, 'agent', ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      data.email,
      hashedPassword,  // ← 변경: 'temp_password_hash' 대신
      data.approvalStatus || 'approved',
      data.contactName,
      data.phone || ''
    ).run();
    
    // ... agents 테이블 저장 로직 ...
    
    return c.json({
      success: true,
      message: "에이전트가 성공적으로 추가되었습니다.",
      temporaryPassword: temporaryPassword, // ← 추가: 프론트엔드로 반환
      data: { ... }
    });
  } catch (error) {
    // ...
  }
});
```

**3) 비밀번호 재발급 API 추가 (Admin Stats APIs 전, 약 6429줄 전):**
```typescript
// 사용자 임시 비밀번호 재발급 (관리자 전용)
app.post('/api/admin/users/:id/reset-password', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.req.param('id');
    
    const user = await db.prepare('SELECT id, email, name, user_type FROM users WHERE id = ?').bind(userId).first();
    
    if (!user) {
      return c.json({
        success: false,
        message: "사용자를 찾을 수 없습니다."
      }, 404);
    }
    
    const { generateTemporaryPassword, hashPassword } = await import('./utils/auth');
    const temporaryPassword = generateTemporaryPassword(10);
    const hashedPassword = await hashPassword(temporaryPassword);
    
    await db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(hashedPassword, userId).run();
    
    return c.json({
      success: true,
      message: "임시 비밀번호가 재발급되었습니다.",
      temporaryPassword: temporaryPassword,
      email: user.email
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return c.json({
      success: false,
      message: "비밀번호 재발급 중 오류가 발생했습니다."
    }, 500);
  }
});
```

**4) 프론트엔드 함수들 (src/index.tsx, 약 4597줄 근처):**

```typescript
// 임시 비밀번호 표시 모달
function showTemporaryPasswordModal(password, email) {
  const modal = document.createElement('div');
  modal.id = 'tempPasswordModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  modal.innerHTML = `
    <div class="modal-content bg-white rounded-lg max-w-md w-full p-6">
      <div class="text-center mb-6">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <i class="fas fa-check text-green-600 text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">계정 생성 완료!</h2>
        <p class="text-gray-600">임시 비밀번호가 생성되었습니다.</p>
      </div>
      
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div class="flex items-start mb-2">
          <i class="fas fa-exclamation-triangle text-yellow-600 mt-0.5 mr-2"></i>
          <p class="text-sm text-yellow-800 font-medium">보안상 이 비밀번호는 한 번만 표시됩니다!</p>
        </div>
        <p class="text-xs text-yellow-700 ml-6">사용자에게 즉시 전달해주세요.</p>
      </div>
      
      <div class="space-y-3 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <div class="flex items-center bg-gray-50 px-4 py-2 rounded border">
            <span class="flex-1 font-mono text-sm">${email}</span>
            <button onclick="copyToClipboard('${email}')" class="text-indigo-600 hover:text-indigo-800 ml-2" title="복사">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">임시 비밀번호</label>
          <div class="flex items-center bg-gray-50 px-4 py-2 rounded border border-indigo-300">
            <span class="flex-1 font-mono text-lg font-bold text-indigo-600">${password}</span>
            <button onclick="copyToClipboard('${password}')" class="text-indigo-600 hover:text-indigo-800 ml-2" title="복사">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
      
      <button onclick="closeTempPasswordModal()" 
              class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
        확인
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function closeTempPasswordModal() {
  const modal = document.getElementById('tempPasswordModal');
  if (modal) modal.remove();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const tooltip = document.createElement('div');
    tooltip.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    tooltip.innerHTML = '<i class="fas fa-check mr-2"></i>복사되었습니다!';
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 2000);
  }).catch(() => {
    alert('복사에 실패했습니다. 직접 선택하여 복사해주세요.');
  });
}

// 임시 비밀번호 재발급
async function resetUserPassword(userId, userName, userType) {
  if (!confirm(`${userName}님의 임시 비밀번호를 재발급하시겠습니까?\n\n새로운 비밀번호가 생성되며, 기존 비밀번호는 사용할 수 없습니다.`)) {
    return;
  }

  try {
    const token = localStorage.getItem('wowcampus_token');
    if (!token) {
      alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
      return;
    }

    const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      showTemporaryPasswordModal(result.temporaryPassword, result.email);
    } else {
      alert(result.message || '비밀번호 재발급 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('비밀번호 재발급 오류:', error);
    alert('비밀번호 재발급 중 오류가 발생했습니다.');
  }
}
```

**5) 에이전트 테이블에 비밀번호 재발급 버튼 추가 (약 3977줄):**
```typescript
// displayAgentsTable 함수 내부, 액션 버튼 부분
<td class="px-6 py-4">
  <div class="flex space-x-2">
    <button onclick="showAgentModal(${agent.id})" class="text-gray-600 hover:text-gray-900" title="상세보기">
      <i class="fas fa-eye"></i>
    </button>
    <button onclick="editAgent(${agent.id})" class="text-blue-600 hover:text-blue-900" title="수정">
      <i class="fas fa-edit"></i>
    </button>
    <!-- ✅ 이 버튼 추가 -->
    <button onclick="resetUserPassword(${agent.userId}, '${agent.contactName}', 'agent')" class="text-orange-600 hover:text-orange-900" title="임시 비밀번호 재발급">
      <i class="fas fa-key"></i>
    </button>
    <button onclick="deleteAgent(${agent.id})" class="text-red-600 hover:text-red-900" title="삭제">
      <i class="fas fa-trash"></i>
    </button>
  </div>
</td>
```

---

### 3. 👮 관리자 계정 관리 시스템

#### 대시보드 카드 추가 (약 17850줄, Support 카드 전):
```typescript
{/* Card 6: Admin Management */}
<button onclick="showAdminManagement()" class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-300 hover:-translate-y-1 w-full text-left">
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
        <i class="fas fa-user-shield text-white text-2xl"></i>
      </div>
      <span class="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <i class="fas fa-arrow-right text-xl"></i>
      </span>
    </div>
    <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">관리자 관리</h3>
    <p class="text-gray-600 text-sm mb-4">관리자 계정 추가 및 권한 관리</p>
    <div class="flex items-center text-sm text-purple-600 font-medium">
      <span>관리하기</span>
      <i class="fas fa-chevron-right ml-2 group-hover:ml-3 transition-all"></i>
    </div>
  </div>
</button>
```

#### 관리자 관리 섹션 HTML (agentManagement 섹션 다음, 약 18046줄):
```typescript
{/* 관리자 관리 섹션 */}
<div id="adminManagement" class="hidden mb-8">
  <div class="bg-white rounded-lg shadow-sm">
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900">
        <i class="fas fa-user-shield text-purple-600 mr-2"></i>관리자 계정 관리
      </h2>
      <div class="flex space-x-3">
        <button onclick="showAddAdminForm()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <i class="fas fa-plus mr-2"></i>새 관리자 추가
        </button>
        <button onclick="hideAdminManagement()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <i class="fas fa-times mr-2"></i>닫기
        </button>
      </div>
    </div>
    
    <div class="p-6">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody id="adminsTableBody" class="bg-white divide-y divide-gray-200">
            {/* 동적으로 로드됩니다 */}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

#### 관리자 관리 API 엔드포인트 (약 6429줄, Admin Stats APIs 전):
```typescript
// Admin Management APIs - 관리자 계정 관리 API
app.get('/api/admin/admins', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    
    const result = await db.prepare(`
      SELECT id, email, name, phone, status, created_at, updated_at
      FROM users
      WHERE user_type = 'admin'
      ORDER BY created_at DESC
    `).all();
    
    return c.json({
      success: true,
      admins: result.results
    });
  } catch (error) {
    console.error('Admin list fetch error:', error);
    return c.json({
      success: false,
      message: '관리자 목록을 불러오는데 실패했습니다.',
      admins: []
    }, 500);
  }
});

app.post('/api/admin/admins', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const data = await c.req.json();
    
    const { generateTemporaryPassword, hashPassword } = await import('./utils/auth');
    const temporaryPassword = generateTemporaryPassword(12);
    const hashedPassword = await hashPassword(temporaryPassword);
    
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(data.email).first();
    if (existing) {
      return c.json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      }, 400);
    }
    
    const result = await db.prepare(`
      INSERT INTO users (
        email, password, user_type, status, name, phone, created_at, updated_at
      ) VALUES (?, ?, 'admin', 'approved', ?, ?, datetime('now'), datetime('now'))
    `).bind(
      data.email,
      hashedPassword,
      data.name,
      data.phone || ''
    ).run();
    
    return c.json({
      success: true,
      message: "관리자가 성공적으로 추가되었습니다.",
      temporaryPassword: temporaryPassword,
      data: {
        id: result.meta.last_row_id,
        ...data
      }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    return c.json({
      success: false,
      message: "관리자 추가 중 오류가 발생했습니다."
    }, 500);
  }
});

app.put('/api/admin/admins/:id/status', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    await db.prepare(`
      UPDATE users 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ? AND user_type = 'admin'
    `).bind(status, id).run();
    
    return c.json({
      success: true,
      message: "관리자 상태가 변경되었습니다."
    });
  } catch (error) {
    console.error('Admin status update error:', error);
    return c.json({
      success: false,
      message: "상태 변경 중 오류가 발생했습니다."
    }, 500);
  }
});
```

#### 관리자 관리 프론트엔드 함수들 (약 4727줄 전, loadAdminStatistics 전):
```typescript
// 🔐 관리자 관리 함수들
let adminUsersData = [];

function showAdminManagement() {
  document.getElementById('adminManagement').classList.remove('hidden');
  loadAdminsForManagement();
}

function hideAdminManagement() {
  document.getElementById('adminManagement').classList.add('hidden');
}

async function loadAdminsForManagement() {
  try {
    const token = localStorage.getItem('wowcampus_token');
    if (!token) return;

    const response = await fetch('/api/admin/admins', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (result.success) {
      adminUsersData = result.admins;
      displayAdminsTable(result.admins);
    }
  } catch (error) {
    console.error('관리자 목록 로드 오류:', error);
  }
}

function displayAdminsTable(admins) {
  const tbody = document.getElementById('adminsTableBody');
  if (!tbody) return;

  if (admins.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">등록된 관리자가 없습니다.</td></tr>';
    return;
  }

  tbody.innerHTML = admins.map(admin => {
    const statusBadges = {
      'approved': '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">활성</span>',
      'pending': '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">대기</span>',
      'suspended': '<span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">정지</span>'
    };

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <span class="text-white font-bold text-sm">${admin.name.charAt(0)}</span>
            </div>
            <div class="text-sm font-medium text-gray-900">${admin.name}</div>
          </div>
        </td>
        <td class="px-6 py-4 text-sm text-gray-900">${admin.email}</td>
        <td class="px-6 py-4 text-sm text-gray-600">${admin.phone || '-'}</td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Super Admin</span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-600">${new Date(admin.created_at).toLocaleDateString('ko-KR')}</td>
        <td class="px-6 py-4">${statusBadges[admin.status] || statusBadges['approved']}</td>
        <td class="px-6 py-4">
          <div class="flex space-x-2">
            <button onclick="resetUserPassword(${admin.id}, '${admin.name}', 'admin')" class="text-orange-600 hover:text-orange-900" title="임시 비밀번호 재발급">
              <i class="fas fa-key"></i>
            </button>
            <button onclick="toggleAdminStatus(${admin.id}, '${admin.status}')" class="text-blue-600 hover:text-blue-900" title="상태 변경">
              <i class="fas fa-toggle-on"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function showAddAdminForm() {
  const modal = document.createElement('div');
  modal.id = 'adminFormModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.onclick = (e) => {
    if (e.target === modal) closeAdminFormModal();
  };

  modal.innerHTML = `
    <div class="modal-content bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">
          <i class="fas fa-user-shield mr-2 text-purple-600"></i>새 관리자 추가
        </h2>
        <button onclick="closeAdminFormModal()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="addAdminForm" class="p-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <i class="fas fa-exclamation-triangle text-yellow-600 mt-0.5 mr-2"></i>
            <div>
              <p class="text-sm text-yellow-800 font-medium mb-1">관리자 계정 생성 안내</p>
              <p class="text-xs text-yellow-700">관리자는 시스템의 모든 데이터에 접근할 수 있습니다. 신중하게 추가해주세요.</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이름 <span class="text-red-500">*</span></label>
            <input type="text" name="name" required 
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="예: 홍길동">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일 <span class="text-red-500">*</span></label>
            <input type="email" name="email" required 
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="예: admin@example.com">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
            <input type="tel" name="phone" 
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="예: 010-1234-5678">
          </div>
        </div>
        
        <div class="mt-6 pt-6 border-t flex justify-end space-x-3">
          <button type="button" onclick="closeAdminFormModal()" 
                  class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            취소
          </button>
          <button type="submit" 
                  class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <i class="fas fa-save mr-2"></i>저장
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('addAdminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveAdmin(new FormData(e.target));
  });
}

function closeAdminFormModal() {
  const modal = document.getElementById('adminFormModal');
  if (modal) modal.remove();
}

async function saveAdmin(formData) {
  try {
    const token = localStorage.getItem('wowcampus_token');
    if (!token) {
      alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
      return;
    }

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || ''
    };

    if (!data.name || !data.email) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const response = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      showTemporaryPasswordModal(result.temporaryPassword, data.email);
      closeAdminFormModal();
      loadAdminsForManagement();
    } else {
      alert(result.message || '저장 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('관리자 저장 오류:', error);
    alert('저장 중 오류가 발생했습니다.');
  }
}

async function toggleAdminStatus(adminId, currentStatus) {
  const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
  const statusText = newStatus === 'approved' ? '활성화' : '정지';
  
  if (!confirm(`이 관리자를 ${statusText}하시겠습니까?`)) return;

  try {
    const token = localStorage.getItem('wowcampus_token');
    const response = await fetch(`/api/admin/admins/${adminId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();

    if (result.success) {
      alert(`관리자가 ${statusText}되었습니다.`);
      loadAdminsForManagement();
    } else {
      alert(result.message || '상태 변경 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('관리자 상태 변경 오류:', error);
    alert('상태 변경 중 오류가 발생했습니다.');
  }
}
```

---

## 📝 Window 객체 Export (약 18415줄 근처)

모든 함수를 window 객체에 export해야 합니다:

```typescript
// 에이전트 관리
window.showAddAgentForm = showAddAgentForm;
window.editAgent = editAgent;
window.closeAgentFormModal = closeAgentFormModal;
window.saveAgent = saveAgent;

// 임시 비밀번호
window.showTemporaryPasswordModal = showTemporaryPasswordModal;
window.closeTempPasswordModal = closeTempPasswordModal;
window.copyToClipboard = copyToClipboard;
window.resetUserPassword = resetUserPassword;

// 관리자 관리
window.showAdminManagement = showAdminManagement;
window.hideAdminManagement = hideAdminManagement;
window.loadAdminsForManagement = loadAdminsForManagement;
window.displayAdminsTable = displayAdminsTable;
window.showAddAdminForm = showAddAdminForm;
window.closeAdminFormModal = closeAdminFormModal;
window.saveAdmin = saveAdmin;
window.toggleAdminStatus = toggleAdminStatus;
```

---

## 🎨 최종 단계

### 1. 캐시 버전 업데이트
**파일**: `src/renderer.tsx` (약 26줄)

```typescript
// 변경 전
<script src="/static/app.js?v=18"></script>

// 변경 후
<script src="/static/app.js?v=24"></script>
```

### 2. 빌드 및 배포
```bash
cd /home/user/webapp

# 빌드
npm run build

# 배포
npx wrangler pages deploy dist --project-name=wow-campus-platform
```

### 3. 배포 확인
배포 후 다음 URL에서 확인:
- https://534849dc.wow-campus-platform.pages.dev/admin

확인 사항:
- ✅ 에이전트 관리에서 "새 에이전트 추가" 클릭 시 폼 모달 표시
- ✅ 에이전트 수정 버튼 클릭 시 데이터 미리 채워진 폼 표시
- ✅ 에이전트 테이블에 🔑 아이콘 버튼 표시
- ✅ 대시보드에 "관리자 관리" 카드 표시
- ✅ 관리자 관리 클릭 시 관리자 목록 표시

---

## 🚀 작업 순서 요약

1. **auth.ts** - `generateTemporaryPassword()` 함수 추가
2. **Agent POST API** - 임시 비밀번호 생성 및 해시 적용
3. **Password Reset API** - 새 API 엔드포인트 추가
4. **Admin Management APIs** - 3개 엔드포인트 추가
5. **Agent Forms** - showAddAgentForm(), editAgent() 완전 구현
6. **Password Modals** - showTemporaryPasswordModal() 등 함수 추가
7. **Admin Management UI** - HTML 섹션 및 함수들 추가
8. **Window Exports** - 모든 새 함수 export
9. **Cache Version** - v=24로 업데이트
10. **Build & Deploy** - 최종 빌드 및 배포

---

## ⚠️ 주의사항

1. **localStorage 키**: 반드시 `'wowcampus_token'` 사용 (not 'token')
2. **데이터베이스 필드**: snake_case (user_id, agency_name, etc.)
3. **응답 필드**: camelCase로 변환하여 반환 (userId, agencyName, etc.)
4. **모달 close**: 각 모달은 고유한 close 함수 필요
5. **에러 핸들링**: try-catch 블록과 사용자 피드백 필수

---

## 📊 현재 프로젝트 상태

- **Git Branch**: feature/admin-management-complete (새로 생성됨)
- **Base Branch**: main
- **Cache Version**: v=18 (업데이트 필요 → v=24)
- **Cloudflare Project**: wow-campus-platform
- **Database**: D1 (efaa0882-3f28-4acd-a609-4c625868d101)

---

## 📁 주요 파일 위치

- `/home/user/webapp/src/index.tsx` - 메인 애플리케이션 (18,000+ 줄)
- `/home/user/webapp/src/renderer.tsx` - HTML 레이아웃 & 캐시 버전
- `/home/user/webapp/src/utils/auth.ts` - 인증 유틸리티
- `/home/user/webapp/wrangler.jsonc` - Cloudflare 설정

---

## 🎯 예상 소요 시간

- **전체 구현**: 40-50분
- **빌드 & 배포**: 5분
- **테스트 & 검증**: 5-10분
- **총 예상 시간**: 50-65분

---

## ✅ 완료 체크리스트

구현 완료 후 다음을 확인하세요:

- [ ] generateTemporaryPassword() 함수 추가됨
- [ ] Agent POST API에 비밀번호 생성 로직 추가됨
- [ ] Password Reset API 엔드포인트 추가됨
- [ ] Admin Management APIs 3개 추가됨
- [ ] showAddAgentForm() 완전 구현됨
- [ ] editAgent() 완전 구현됨
- [ ] showTemporaryPasswordModal() 추가됨
- [ ] resetUserPassword() 추가됨
- [ ] 관리자 관리 HTML 섹션 추가됨
- [ ] 관리자 관리 함수들 추가됨
- [ ] 모든 함수 window 객체에 export됨
- [ ] 캐시 버전 v=24로 업데이트됨
- [ ] 빌드 성공
- [ ] 배포 성공
- [ ] 프로덕션 사이트에서 모든 기능 작동 확인

---

## 📞 배포 후 확인 URL

https://534849dc.wow-campus-platform.pages.dev/admin

**테스트 시나리오:**
1. 관리자 대시보드 접속
2. "에이전트 관리" 카드 클릭
3. "새 에이전트 추가" 버튼 클릭 → 폼 모달 표시 확인
4. 에이전트 목록에서 수정 버튼 클릭 → 데이터 미리 채워짐 확인
5. 🔑 버튼 클릭 → 비밀번호 재발급 모달 표시 확인
6. "관리자 관리" 카드 클릭 → 관리자 목록 표시 확인
7. "새 관리자 추가" 버튼 클릭 → 폼 모달 표시 확인

---

**Good Luck! 🚀**

새 세션에서 이 문서를 참고하여 작업을 완료해주세요!
