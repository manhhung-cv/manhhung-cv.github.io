/**
 * Utility functions for the shopping app
 */

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Calculate price with tax
function calculatePriceWithTax(price, includeTax, taxRate) {
  if (includeTax) {
    return price;
  } else {
    return price * (1 + taxRate / 100);
  }
}

// Calculate final price with discount
function calculateFinalPrice(price, discountType, discountValue) {
  if (discountType === 'percent') {
    return price * (1 - discountValue / 100);
  } else {
    return price - discountValue;
  }
}

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Get element by ID with error handling
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with ID "${id}" not found`);
  }
  return element;
}

// Create element with attributes and children
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = createElement('div', {
    className: `notification ${type}`,
    textContent: message
  });
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }, 10);
}

// Validate form data
function validateForm(data, rules) {
  const errors = {};
  
  Object.entries(rules).forEach(([field, fieldRules]) => {
    if (fieldRules.required && (!data[field] || data[field].toString().trim() === '')) {
      errors[field] = 'Trường này là bắt buộc';
    } else if (fieldRules.min !== undefined && data[field] < fieldRules.min) {
      errors[field] = `Giá trị tối thiểu là ${fieldRules.min}`;
    } else if (fieldRules.max !== undefined && data[field] > fieldRules.max) {
      errors[field] = `Giá trị tối đa là ${fieldRules.max}`;
    } else if (fieldRules.pattern && !fieldRules.pattern.test(data[field])) {
      errors[field] = fieldRules.message || 'Giá trị không hợp lệ';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
