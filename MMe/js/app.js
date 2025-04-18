/**
 * Main application initialization
 */

// Initialize application
function initializeApp() {
  // Initialize storage
  initializeStorage();
  
  // Initialize UI components
  initializeTabs();
  initializeTheme();
  
  // Initialize tab functionality
  initializeShoppingTab();
  initializeCartTab();
  initializeInventoryTab();
  initializeDataTab();
  initializeSettingsTab();
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
