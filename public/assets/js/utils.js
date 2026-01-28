// Utility Functions
console.log('utils.js loaded');

function getUserTypeLabel(userType) {
  const i18n = document.getElementById('auth-i18n-data')?.dataset;
  if (!i18n) {
    const labels = {
      jobseeker: '구직자',
      company: '구인기업',
      agent: '에이전트',
      admin: '관리자'
    };
    return labels[userType] || '사용자';
  }

  const labels = {
    jobseeker: i18n.jobseeker,
    company: i18n.company,
    agent: i18n.agent,
    admin: i18n.admin
  };
  return labels[userType] || i18n.user || 'User';
}

// 💬 알림 표시 함수
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${getNotificationColors(type)}`;
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        ${getNotificationIcon(type)}
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <div class="ml-4 flex-shrink-0 flex">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // 5초 후 자동 제거
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function getNotificationColors(type) {
  const colors = {
    success: 'bg-green-50 border border-green-200 text-green-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800'
  };
  return colors[type] || colors.info;
}

function getNotificationIcon(type) {
  const icons = {
    success: '<i class="fas fa-check-circle text-green-400"></i>',
    error: '<i class="fas fa-exclamation-circle text-red-400"></i>',
    warning: '<i class="fas fa-exclamation-triangle text-yellow-400"></i>',
    info: '<i class="fas fa-info-circle text-blue-400"></i>'
  };
  return icons[type] || icons.info;
}
