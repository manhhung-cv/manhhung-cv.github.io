/**
 * Settings tab functionality
 */

// Initialize settings tab
function initializeSettingsTab() {
  // Elements
  const themeLightButton = getElement('theme-light');
  const themeDarkButton = getElement('theme-dark');
  const themeSystemButton = getElement('theme-system');
  const defaultTaxRateInput = getElement('default-tax-rate');
  const saveSettingsButton = getElement('save-settings');
  
  // Load current settings
  const settings = getSettings();
  
  // Set tax rate
  defaultTaxRateInput.value = settings.taxRate || 8;
  
  // Set active theme button
  const themeButtons = [themeLightButton, themeDarkButton, themeSystemButton];
  themeButtons.forEach(button => button.classList.remove('active'));
  
  if (settings.theme === 'light') {
    themeLightButton.classList.add('active');
  } else if (settings.theme === 'dark') {
    themeDarkButton.classList.add('active');
  } else {
    themeSystemButton.classList.add('active');
  }
  
  // Theme buttons
  themeLightButton.addEventListener('click', () => {
    setTheme('light');
  });
  
  themeDarkButton.addEventListener('click', () => {
    setTheme('dark');
  });
  
  themeSystemButton.addEventListener('click', () => {
    setTheme('system');
  });
  
  // Save settings button
  saveSettingsButton.addEventListener('click', () => {
    saveSettingsChanges();
  });
}

// Set theme
function setTheme(theme) {
  // Update theme buttons
  const themeLightButton = getElement('theme-light');
  const themeDarkButton = getElement('theme-dark');
  const themeSystemButton = getElement('theme-system');
  
  const themeButtons = [themeLightButton, themeDarkButton, themeSystemButton];
  themeButtons.forEach(button => button.classList.remove('active'));
  
  if (theme === 'light') {
    themeLightButton.classList.add('active');
  } else if (theme === 'dark') {
    themeDarkButton.classList.add('active');
  } else {
    themeSystemButton.classList.add('active');
  }
  
  // Apply theme
  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    applyTheme(systemTheme);
  } else {
    applyTheme(theme);
  }
}

// Save settings changes
function saveSettingsChanges() {
  // Get current settings
  const settings = getSettings();
  
  // Get new values
  const taxRate = parseFloat(getElement('default-tax-rate').value) || 8;
  
  let theme = 'light';
  if (getElement('theme-dark').classList.contains('active')) {
    theme = 'dark';
  } else if (getElement('theme-system').classList.contains('active')) {
    theme = 'system';
  }
  
  // Update settings
  const newSettings = {
    ...settings,
    taxRate: taxRate,
    theme: theme
  };
  
  // Save settings
  if (saveSettings(newSettings)) {
    showNotification('Đã lưu cài đặt thành công', 'success');
    
    // Update tax rate display in shopping tab
    const taxRateSpan = getElement('tax-rate');
    if (taxRateSpan) {
      taxRateSpan.textContent = taxRate;
    }
  } else {
    showNotification('Không thể lưu cài đặt', 'error');
  }
}
