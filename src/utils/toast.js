/**
 * TOAST NOTIFICATION SYSTEM
 * Real-time user feedback and notifications
 * Supports success, error, warning, and info messages
 */

class ToastService {
  constructor() {
    this.toasts = new Map()
    this.container = null
    this.nextId = 1
    
    // Initialize container
    this.initializeContainer()
  }

  /**
   * Initialize toast container in DOM
   */
  initializeContainer() {
    // Check if container already exists
    let container = document.getElementById('toast-container')
    
    if (!container) {
      container = document.createElement('div')
      container.id = 'toast-container'
      container.className = 'toast-container'
      document.body.appendChild(container)
    }
    
    this.container = container
    this.addStyles()
  }

  /**
   * Add CSS styles for toasts
   */
  addStyles() {
    const styleId = 'toast-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
        pointer-events: none;
      }

      .toast {
        background: white;
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #3b82f6;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        pointer-events: all;
        max-width: 100%;
        word-wrap: break-word;
      }

      .toast.success {
        border-left-color: #22c55e;
      }

      .toast.error {
        border-left-color: #ef4444;
      }

      .toast.warning {
        border-left-color: #f59e0b;
      }

      .toast.info {
        border-left-color: #3b82f6;
      }

      .toast-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .toast.success .toast-icon {
        color: #22c55e;
      }

      .toast.error .toast-icon {
        color: #ef4444;
      }

      .toast.warning .toast-icon {
        color: #f59e0b;
      }

      .toast.info .toast-icon {
        color: #3b82f6;
      }

      .toast-content {
        flex: 1;
        font-size: 0.875rem;
        color: #374151;
        line-height: 1.4;
      }

      .toast-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: #1f2937;
      }

      .toast-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: 4px;
        transition: color 0.2s, background-color 0.2s;
      }

      .toast-close:hover {
        color: #6b7280;
        background-color: #f3f4f6;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .toast.removing {
        animation: slideOut 0.3s ease-out;
      }

      @media (max-width: 768px) {
        .toast-container {
          left: 16px;
          right: 16px;
          max-width: none;
        }
      }
    `
    
    document.head.appendChild(style)
  }

  /**
   * Show a toast notification
   */
  show(message, type = 'info', options = {}) {
    const id = this.nextId++
    const {
      title = null,
      duration = 5000,
      persistent = false,
      action = null
    } = options

    // Create toast element
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    toast.dataset.id = id

    // Get icon for type
    const icon = this.getIcon(type)

    // Build content
    let contentHtml = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `

    toast.innerHTML = contentHtml

    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close')
    closeBtn.addEventListener('click', () => {
      this.remove(id)
    })

    // Add to container
    this.container.appendChild(toast)
    this.toasts.set(id, { element: toast, type, persistent })

    // Auto-remove after duration (unless persistent)
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }

    return id
  }

  /**
   * Remove a toast by ID
   */
  remove(id) {
    const toast = this.toasts.get(id)
    if (!toast) return

    // Add removing animation
    toast.element.classList.add('removing')

    // Remove after animation
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element)
      }
      this.toasts.delete(id)
    }, 300)
  }

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts.forEach((toast, id) => {
      this.remove(id)
    })
  }

  /**
   * Get icon for toast type
   */
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
    return icons[type] || icons.info
  }

  // ==================== CONVENIENCE METHODS ====================

  /**
   * Show success toast
   */
  success(message, options = {}) {
    return this.show(message, 'success', {
      title: 'Success',
      duration: 4000,
      ...options
    })
  }

  /**
   * Show error toast
   */
  error(message, options = {}) {
    return this.show(message, 'error', {
      title: 'Error',
      duration: 6000,
      ...options
    })
  }

  /**
   * Show warning toast
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', {
      title: 'Warning',
      duration: 5000,
      ...options
    })
  }

  /**
   * Show info toast
   */
  info(message, options = {}) {
    return this.show(message, 'info', {
      duration: 4000,
      ...options
    })
  }

  /**
   * Show loading toast (persistent until manually removed)
   */
  loading(message = 'Loading...', options = {}) {
    return this.show(message, 'info', {
      title: 'Loading',
      persistent: true,
      ...options
    })
  }

  // ==================== REAL-TIME SPECIFIC METHODS ====================

  /**
   * Show real-time connection status
   */
  connectionStatus(connected, options = {}) {
    if (connected) {
      return this.success('🔴 Real-time updates enabled', {
        title: 'Connected',
        ...options
      })
    } else {
      return this.error('🔴 Real-time connection lost', {
        title: 'Disconnected',
        persistent: true,
        ...options
      })
    }
  }

  /**
   * Show time tracking notification
   */
  timeTracking(action, data = {}, options = {}) {
    const messages = {
      clock_in: '⏰ Successfully clocked in',
      clock_out: '⏰ Successfully clocked out',
      break_start: '☕ Break started',
      break_end: '▶️ Break ended',
      time_updated: '🔄 Time entry updated'
    }

    const message = messages[action] || `Time tracking: ${action}`
    return this.success(message, {
      title: 'Time Tracking',
      ...options
    })
  }

  /**
   * Show team notification
   */
  teamNotification(action, member, options = {}) {
    const messages = {
      online: `👋 ${member} joined`,
      offline: `👋 ${member} left`,
      clock_in: `⏰ ${member} clocked in`,
      clock_out: `⏰ ${member} clocked out`
    }

    const message = messages[action] || `Team update: ${action}`
    return this.info(message, {
      title: 'Team Activity',
      ...options
    })
  }

  /**
   * Show system alert
   */
  systemAlert(message, severity = 'warning', options = {}) {
    const type = severity === 'critical' ? 'error' : severity
    return this.show(message, type, {
      title: 'System Alert',
      persistent: severity === 'critical',
      ...options
    })
  }
}

// Create singleton instance
const toast = new ToastService()

export { toast }
export default toast