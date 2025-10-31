/**
 * Toast Notification System
 * Modern replacement for alert() and confirm()
 */

let toastCounter = 0;
const activeToasts = new Map();

function getToastContainer(position) {
  const containerId = 'toast-container-' + position;
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.cssText = 'position: fixed; z-index: 9999; pointer-events: none; display: flex; flex-direction: column; gap: 12px;';
    
    if (position === 'top-right') container.style.cssText += 'top: 20px; right: 20px;';
    else if (position === 'top-center') container.style.cssText += 'top: 20px; left: 50%; transform: translateX(-50%);';
    else if (position === 'top-left') container.style.cssText += 'top: 20px; left: 20px;';
    
    document.body.appendChild(container);
  }
  
  return container;
}

function getToastStyles(type) {
  const styles = {
    success: { bg: '#10b981', border: '#059669', icon: '✓' },
    error: { bg: '#ef4444', border: '#dc2626', icon: '✕' },
    warning: { bg: '#f59e0b', border: '#d97706', icon: '⚠' },
    info: { bg: '#3b82f6', border: '#2563eb', icon: 'ℹ' }
  };
  return styles[type] || styles.info;
}

function showToast(options) {
  const opts = typeof options === 'string' ? { message: options } : options;
  const { message, type = 'info', duration = 3000, position = 'top-right', closable = true } = opts;
  
  const toastId = 'toast-' + (++toastCounter);
  const styles = getToastStyles(type);
  const container = getToastContainer(position);
  
  const toast = document.createElement('div');
  toast.dataset.toastId = toastId;
  toast.style.cssText = 'pointer-events: auto; background: ' + styles.bg + '; border-left: 4px solid ' + styles.border + '; color: white; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; min-width: 300px; max-width: 500px; opacity: 0; transform: translateX(100px); transition: all 0.3s; font-size: 14px;';
  
  toast.innerHTML = '<span style="font-size: 20px; font-weight: bold;">' + styles.icon + '</span><span style="flex: 1;">' + message + '</span>';
  
  if (closable) {
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'background: none; border: none; color: white; font-size: 24px; cursor: pointer; opacity: 0.7; width: 24px; height: 24px;';
    closeBtn.onclick = () => removeToast(toastId);
    toast.appendChild(closeBtn);
  }
  
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; });
  
  if (duration > 0) {
    activeToasts.set(toastId, setTimeout(() => removeToast(toastId), duration));
  }
}

function removeToast(toastId) {
  const toast = document.querySelector('[data-toast-id="' + toastId + '"]');
  if (!toast) return;
  
  const timeout = activeToasts.get(toastId);
  if (timeout) { clearTimeout(timeout); activeToasts.delete(toastId); }
  
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100px)';
  setTimeout(() => toast.remove(), 300);
}

function showConfirm(options) {
  const { title, message, confirmText = '확인', cancelText = '취소', type = 'warning', onConfirm, onCancel } = options;
  
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
  
  const modal = document.createElement('div');
  modal.style.cssText = 'background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);';
  modal.innerHTML = '<h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #111827;">' + title + '</h3><p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">' + message + '</p>';
  
  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = 'display: flex; gap: 12px; justify-content: flex-end;';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = cancelText;
  cancelBtn.style.cssText = 'padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; cursor: pointer;';
  cancelBtn.onclick = () => { overlay.remove(); if (onCancel) onCancel(); };
  
  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = confirmText;
  const colors = type === 'danger' ? '#ef4444' : '#f59e0b';
  confirmBtn.style.cssText = 'padding: 10px 20px; border: none; background: ' + colors + '; color: white; border-radius: 6px; cursor: pointer;';
  confirmBtn.onclick = () => { overlay.remove(); onConfirm(); };
  
  btnContainer.appendChild(cancelBtn);
  btnContainer.appendChild(confirmBtn);
  modal.appendChild(btnContainer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); if (onCancel) onCancel(); } };
}

const toast = {
  success: (msg, opts) => showToast({ message: msg, type: 'success', ...opts }),
  error: (msg, opts) => showToast({ message: msg, type: 'error', ...opts }),
  warning: (msg, opts) => showToast({ message: msg, type: 'warning', ...opts }),
  info: (msg, opts) => showToast({ message: msg, type: 'info', ...opts })
};

window.showToast = showToast;
window.showConfirm = showConfirm;
window.toast = toast;
