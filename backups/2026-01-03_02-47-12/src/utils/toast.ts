/**
 * Toast Notification System
 * Modern replacement for alert() and confirm() with better UX
 */

export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'
  closable?: boolean
  onClose?: () => void
}

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel?: () => void
}

interface ToastElement extends HTMLElement {
  dataset: {
    toastId: string
  }
}

let toastCounter = 0
const activeToasts = new Map<string, NodeJS.Timeout>()

/**
 * Get or create toast container
 */
function getToastContainer(position: string): HTMLElement {
  const containerId = `toast-container-${position}`
  let container = document.getElementById(containerId)
  
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.className = `toast-container toast-${position}`
    container.style.cssText = getContainerStyles(position)
    document.body.appendChild(container)
  }
  
  return container
}

/**
 * Get container styles based on position
 */
function getContainerStyles(position: string): string {
  const baseStyles = `
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `
  
  const positions: Record<string, string> = {
    'top-right': 'top: 20px; right: 20px;',
    'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
    'top-left': 'top: 20px; left: 20px;',
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);',
    'bottom-left': 'bottom: 20px; left: 20px;'
  }
  
  return baseStyles + (positions[position] || positions['top-right'])
}

/**
 * Get toast styles based on type
 */
function getToastStyles(type: string): { bg: string; border: string; icon: string } {
  const styles: Record<string, { bg: string; border: string; icon: string }> = {
    success: {
      bg: '#10b981',
      border: '#059669',
      icon: '✓'
    },
    error: {
      bg: '#ef4444',
      border: '#dc2626',
      icon: '✕'
    },
    warning: {
      bg: '#f59e0b',
      border: '#d97706',
      icon: '⚠'
    },
    info: {
      bg: '#3b82f6',
      border: '#2563eb',
      icon: 'ℹ'
    }
  }
  
  return styles[type] || styles.info
}

/**
 * Create toast element
 */
function createToastElement(options: ToastOptions): ToastElement {
  const {
    message,
    type = 'info',
    closable = true
  } = options
  
  const toastId = `toast-${++toastCounter}`
  const styles = getToastStyles(type)
  
  const toast = document.createElement('div') as ToastElement
  toast.className = `toast toast-${type}`
  toast.dataset.toastId = toastId
  toast.style.cssText = `
    pointer-events: auto;
    background: ${styles.bg};
    border-left: 4px solid ${styles.border};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    max-width: 500px;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
  `
  
  // Icon
  const icon = document.createElement('span')
  icon.style.cssText = `
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
  `
  icon.textContent = styles.icon
  toast.appendChild(icon)
  
  // Message
  const messageEl = document.createElement('span')
  messageEl.style.cssText = 'flex: 1;'
  messageEl.textContent = message
  toast.appendChild(messageEl)
  
  // Close button
  if (closable) {
    const closeBtn = document.createElement('button')
    closeBtn.innerHTML = '×'
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      line-height: 1;
      padding: 0;
      margin: 0;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1'
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7'
    closeBtn.onclick = () => removeToast(toastId)
    toast.appendChild(closeBtn)
  }
  
  return toast
}

/**
 * Remove toast with animation
 */
function removeToast(toastId: string) {
  const toast = document.querySelector(`[data-toast-id="${toastId}"]`) as HTMLElement
  if (!toast) return
  
  // Clear timeout if exists
  const timeout = activeToasts.get(toastId)
  if (timeout) {
    clearTimeout(timeout)
    activeToasts.delete(toastId)
  }
  
  // Fade out animation
  toast.style.opacity = '0'
  toast.style.transform = 'translateX(100px)'
  
  setTimeout(() => {
    toast.remove()
    
    // Clean up empty containers
    const container = toast.parentElement
    if (container && container.children.length === 0) {
      container.remove()
    }
  }, 300)
}

/**
 * Show toast notification
 */
export function showToast(options: ToastOptions): void {
  const {
    duration = 3000,
    position = 'top-right',
    onClose
  } = options
  
  const container = getToastContainer(position)
  const toast = createToastElement(options)
  const toastId = toast.dataset.toastId
  
  container.appendChild(toast)
  
  // Trigger fade-in animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  })
  
  // Auto dismiss
  if (duration > 0) {
    const timeout = setTimeout(() => {
      removeToast(toastId)
      if (onClose) onClose()
    }, duration)
    
    activeToasts.set(toastId, timeout)
  }
}

/**
 * Show confirmation dialog
 */
export function showConfirm(options: ConfirmOptions): void {
  const {
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    type = 'warning',
    onConfirm,
    onCancel
  } = options
  
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
  `
  
  const modal = document.createElement('div')
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: slideUp 0.3s ease-out;
  `
  
  // Title
  const titleEl = document.createElement('h3')
  titleEl.textContent = title
  titleEl.style.cssText = `
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `
  modal.appendChild(titleEl)
  
  // Message
  const messageEl = document.createElement('p')
  messageEl.textContent = message
  messageEl.style.cssText = `
    margin: 0 0 24px 0;
    font-size: 14px;
    line-height: 1.5;
    color: #6b7280;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `
  modal.appendChild(messageEl)
  
  // Buttons
  const buttonContainer = document.createElement('div')
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  `
  
  // Cancel button
  const cancelBtn = document.createElement('button')
  cancelBtn.textContent = cancelText
  cancelBtn.style.cssText = `
    padding: 10px 20px;
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `
  cancelBtn.onmouseover = () => {
    cancelBtn.style.background = '#f9fafb'
  }
  cancelBtn.onmouseout = () => {
    cancelBtn.style.background = 'white'
  }
  cancelBtn.onclick = () => {
    overlay.remove()
    if (onCancel) onCancel()
  }
  buttonContainer.appendChild(cancelBtn)
  
  // Confirm button
  const confirmBtn = document.createElement('button')
  confirmBtn.textContent = confirmText
  
  const confirmColors: Record<string, { bg: string; hover: string }> = {
    danger: { bg: '#ef4444', hover: '#dc2626' },
    warning: { bg: '#f59e0b', hover: '#d97706' },
    info: { bg: '#3b82f6', hover: '#2563eb' }
  }
  
  const colors = confirmColors[type] || confirmColors.warning
  
  confirmBtn.style.cssText = `
    padding: 10px 20px;
    border: none;
    background: ${colors.bg};
    color: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `
  confirmBtn.onmouseover = () => {
    confirmBtn.style.background = colors.hover
  }
  confirmBtn.onmouseout = () => {
    confirmBtn.style.background = colors.bg
  }
  confirmBtn.onclick = () => {
    overlay.remove()
    onConfirm()
  }
  buttonContainer.appendChild(confirmBtn)
  
  modal.appendChild(buttonContainer)
  overlay.appendChild(modal)
  
  // Add CSS animations
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
  document.head.appendChild(style)
  
  document.body.appendChild(overlay)
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove()
      if (onCancel) onCancel()
    }
  })
  
  // Close on Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove()
      if (onCancel) onCancel()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
}

/**
 * Convenience methods
 */
export const toast = {
  success: (message: string, options?: Partial<ToastOptions>) => {
    showToast({ message, type: 'success', ...options })
  },
  error: (message: string, options?: Partial<ToastOptions>) => {
    showToast({ message, type: 'error', ...options })
  },
  warning: (message: string, options?: Partial<ToastOptions>) => {
    showToast({ message, type: 'warning', ...options })
  },
  info: (message: string, options?: Partial<ToastOptions>) => {
    showToast({ message, type: 'info', ...options })
  }
}
