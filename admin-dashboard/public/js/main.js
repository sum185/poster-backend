// ===== Main JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
  // Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
      createOverlay();
    });
  }
  
  // Create overlay for mobile sidebar
  function createOverlay() {
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
      
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
      });
    }
    overlay.classList.toggle('show', sidebar.classList.contains('show'));
  }
  
  // Close sidebar on link click (mobile)
  const sidebarLinks = sidebar?.querySelectorAll('.nav-link');
  sidebarLinks?.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth < 992) {
        sidebar.classList.remove('show');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('show');
      }
    });
  });
  
  // Auto-dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
  
  // Tooltip initialization
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Popover initialization
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function(popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
  
  // Form validation enhancement
  const forms = document.querySelectorAll('.needs-validation');
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
  
  // Confirm delete buttons
  const deleteButtons = document.querySelectorAll('[data-confirm]');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const message = this.getAttribute('data-confirm') || 'Are you sure?';
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });
  
  // Active nav link based on current URL
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
  
  // Table row click (for redirect)
  const clickableRows = document.querySelectorAll('tr[data-href]');
  clickableRows.forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function(e) {
      // Don't navigate if clicking on button/link
      if (e.target.closest('button, a, .btn')) return;
      window.location.href = this.getAttribute('data-href');
    });
  });
  
  // Search input debounce
  const searchInputs = document.querySelectorAll('[data-search]');
  searchInputs.forEach(input => {
    let debounceTimer;
    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      const targetSelector = this.getAttribute('data-search');
      const targets = document.querySelectorAll(targetSelector);
      const searchTerm = this.value.toLowerCase();
      
      debounceTimer = setTimeout(() => {
        targets.forEach(target => {
          const text = target.textContent.toLowerCase();
          target.style.display = text.includes(searchTerm) ? '' : 'none';
        });
      }, 300);
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('[data-search]');
      if (searchInput) searchInput.focus();
    }
    
    // Escape to close modals/sidebar
    if (e.key === 'Escape') {
      if (sidebar?.classList.contains('show')) {
        sidebar.classList.remove('show');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('show');
      }
    }
  });
  
  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth >= 992) {
        sidebar?.classList.remove('show');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('show');
      }
    }, 250);
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Copy to clipboard functionality
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', function() {
      const text = this.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="bi bi-check"></i> Copied!';
        this.classList.add('btn-success');
        this.classList.remove('btn-outline-secondary');
        setTimeout(() => {
          this.innerHTML = originalText;
          this.classList.remove('btn-success');
          this.classList.add('btn-outline-secondary');
        }, 2000);
      });
    });
  });
});

// Utility Functions
const Utils = {
  // Format number with commas
  formatNumber: (num) => {
    return new Intl.NumberFormat().format(num);
  },
  
  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  // Format date
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
  },
  
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  
  // Show toast notification
  showToast: (message, type = 'info') => {
    const toastContainer = document.getElementById('toastContainer') || Utils.createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const bgClass = {
      'success': 'bg-success',
      'error': 'bg-danger',
      'warning': 'bg-warning',
      'info': 'bg-info'
    }[type] || 'bg-info';
    
    const icon = {
      'success': 'bi-check-circle',
      'error': 'bi-x-circle',
      'warning': 'bi-exclamation-triangle',
      'info': 'bi-info-circle'
    }[type] || 'bi-info-circle';
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast ${bgClass} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <div class="toast-header">
        <i class="bi ${icon} me-2"></i>
        <strong class="me-auto">Notification</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  },
  
  createToastContainer: () => {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
  },
  
  // Confirm dialog with promise
  confirm: (message) => {
    return new Promise((resolve) => {
      if (confirm(message)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
};

// Export for use in other scripts
window.Utils = Utils;