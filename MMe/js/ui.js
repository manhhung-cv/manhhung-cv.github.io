/**
 * UI functions for the shopping app
 */

// Tab switching functionality
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding content
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(tabId);
      if (content) {
        content.classList.add('active');
      }
    });
  });
}

// Data tab switching functionality
function initializeDataTabs() {
  const dataTabs = document.querySelectorAll('.data-tab');
  const dataContents = document.querySelectorAll('.data-content');
  
  dataTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      dataTabs.forEach(t => t.classList.remove('active'));
      dataContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding content
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(`${tabId}-data`);
      if (content) {
        content.classList.add('active');
      }
    });
  });
}

// Modal functionality
function openModal(title, content) {
  const modalContainer = getElement('modal-container');
  const modalTitle = getElement('modal-title');
  const modalContent = getElement('modal-content');
  const modalClose = getElement('modal-close');
  
  modalTitle.textContent = title;
  
  // Clear previous content
  modalContent.innerHTML = '';
  
  // Add new content
  if (typeof content === 'string') {
    modalContent.innerHTML = content;
  } else if (content instanceof Node) {
    modalContent.appendChild(content);
  }
  
  // Show modal
  modalContainer.style.display = 'flex';
  
  // Close modal when clicking the close button
  modalClose.onclick = () => {
    modalContainer.style.display = 'none';
  };
  
  // Close modal when clicking outside
  modalContainer.onclick = (e) => {
    if (e.target === modalContainer) {
      modalContainer.style.display = 'none';
    }
  };
  
  return modalContainer;
}

// Confirmation modal
function openConfirmModal(message, onConfirm) {
  const confirmModal = getElement('confirm-modal');
  const confirmMessage = getElement('confirm-message');
  const confirmClose = getElement('confirm-close');
  const confirmCancel = getElement('confirm-cancel');
  const confirmOk = getElement('confirm-ok');
  
  confirmMessage.textContent = message;
  
  // Show modal
  confirmModal.style.display = 'flex';
  
  // Close modal when clicking the close button
  confirmClose.onclick = () => {
    confirmModal.style.display = 'none';
  };
  
  // Cancel button
  confirmCancel.onclick = () => {
    confirmModal.style.display = 'none';
  };
  
  // Confirm button
  confirmOk.onclick = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
    confirmModal.style.display = 'none';
  };
  
  // Close modal when clicking outside
  confirmModal.onclick = (e) => {
    if (e.target === confirmModal) {
      confirmModal.style.display = 'none';
    }
  };
}

// Create form element
function createFormElement(type, id, label, value = '', options = {}) {
  const formGroup = createElement('div', { className: 'form-group' });
  
  if (label) {
    const labelElement = createElement('label', { 
      for: id, 
      textContent: label 
    });
    formGroup.appendChild(labelElement);
  }
  
  let inputElement;
  
  switch (type) {
    case 'text':
    case 'number':
    case 'email':
    case 'password':
      inputElement = createElement('input', {
        type,
        id,
        name: id,
        value,
        ...options
      });
      break;
      
    case 'textarea':
      inputElement = createElement('textarea', {
        id,
        name: id,
        ...options
      }, [value]);
      break;
      
    case 'select':
      inputElement = createElement('select', {
        id,
        name: id,
        ...options
      });
      
      if (options.options) {
        options.options.forEach(opt => {
          const optionElement = createElement('option', {
            value: opt.value,
            textContent: opt.text
          });
          
          if (opt.value === value) {
            optionElement.selected = true;
          }
          
          inputElement.appendChild(optionElement);
        });
      }
      break;
      
    case 'checkbox':
      const checkboxWrapper = createElement('div', { className: 'checkbox-wrapper' });
      
      inputElement = createElement('input', {
        type: 'checkbox',
        id,
        name: id,
        checked: value,
        ...options
      });
      
      const checkboxLabel = createElement('label', {
        for: id,
        textContent: label
      });
      
      checkboxWrapper.appendChild(inputElement);
      checkboxWrapper.appendChild(checkboxLabel);
      
      // Replace the form group with just the checkbox wrapper
      return checkboxWrapper;
      
    default:
      console.error(`Unsupported form element type: ${type}`);
      return null;
  }
  
  formGroup.appendChild(inputElement);
  return formGroup;
}

// Create modal form
function createModalForm(fields, onSubmit) {
  const form = createElement('form', { className: 'modal-form' });
  
  fields.forEach(field => {
    const formElement = createFormElement(
      field.type,
      field.id,
      field.label,
      field.value,
      field.options
    );
    
    if (formElement) {
      form.appendChild(formElement);
    }
  });
  
  // Add buttons
  const buttonsDiv = createElement('div', { className: 'modal-buttons' });
  
  const cancelButton = createElement('button', {
    type: 'button',
    className: 'btn-secondary',
    textContent: 'Hủy',
    onclick: () => {
      const modalContainer = getElement('modal-container');
      modalContainer.style.display = 'none';
    }
  });
  
  const submitButton = createElement('button', {
    type: 'submit',
    className: 'btn-primary',
    textContent: 'Lưu'
  });
  
  buttonsDiv.appendChild(cancelButton);
  buttonsDiv.appendChild(submitButton);
  form.appendChild(buttonsDiv);
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {};
    fields.forEach(field => {
      const element = document.getElementById(field.id);
      if (element) {
        if (field.type === 'checkbox') {
          formData[field.id] = element.checked;
        } else {
          formData[field.id] = element.value;
        }
      }
    });
    
    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    }
  });
  
  return form;
}

// Apply theme
function applyTheme(theme) {
  const body = document.body;
  
  if (theme === 'dark') {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
  
  // Update theme buttons
  const themeButtons = document.querySelectorAll('.btn-theme');
  themeButtons.forEach(button => {
    button.classList.remove('active');
    
    if (
      (button.id === 'theme-light' && theme === 'light') ||
      (button.id === 'theme-dark' && theme === 'dark') ||
      (button.id === 'theme-system' && theme === 'system')
    ) {
      button.classList.add('active');
    }
  });
}

// Get system theme preference
function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Initialize theme
function initializeTheme() {
  const settings = getSettings();
  let theme = settings.theme || 'light';
  
  if (theme === 'system') {
    theme = getSystemTheme();
  }
  
  applyTheme(theme);
  
  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const settings = getSettings();
      if (settings.theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}
