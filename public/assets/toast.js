// Simple Toast Notification Library for WOW-CAMPUS
(function() {
  const toast = {
    success: function(message) {
      showToast(message, 'success');
    },
    error: function(message) {
      showToast(message, 'error');
    },
    warning: function(message) {
      showToast(message, 'warning');
    },
    info: function(message) {
      showToast(message, 'info');
    }
  };

  function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
      document.body.appendChild(container);
    }

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.style.cssText = `
      min-width: 300px;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      line-height: 1.5;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
      transition: opacity 0.3s ease;
    `;

    // Set colors based on type
    const colors = {
      success: { bg: '#10b981', icon: 'fa-check-circle' },
      error: { bg: '#ef4444', icon: 'fa-exclamation-circle' },
      warning: { bg: '#f59e0b', icon: 'fa-exclamation-triangle' },
      info: { bg: '#3b82f6', icon: 'fa-info-circle' }
    };

    const color = colors[type] || colors.info;
    toastEl.style.backgroundColor = color.bg;
    toastEl.style.color = 'white';

    // Add icon and message
    toastEl.innerHTML = `
      <i class="fas ${color.icon}" style="font-size: 20px;"></i>
      <span style="flex: 1; white-space: pre-line;">${escapeHtml(message)}</span>
      <i class="fas fa-times" style="font-size: 16px; opacity: 0.7; cursor: pointer;"></i>
    `;

    // Add click to dismiss
    toastEl.onclick = function() {
      removeToast(toastEl);
    };

    // Add to container
    container.appendChild(toastEl);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(toastEl);
    }, 5000);
  }

  function removeToast(toastEl) {
    toastEl.style.opacity = '0';
    setTimeout(() => {
      toastEl.remove();
      // Remove container if empty
      const container = document.getElementById('toast-container');
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Add CSS animation
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Make toast globally available
  window.toast = toast;
})();
// Force Re-upload
