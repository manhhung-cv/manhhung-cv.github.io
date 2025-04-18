/**
 * Storage functions for the shopping app
 */

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'shopping_app_products',
  CART: 'shopping_app_cart',
  INVENTORY: 'shopping_app_inventory',
  PURCHASE_HISTORY: 'shopping_app_purchase_history',
  SETTINGS: 'shopping_app_settings'
};

// Default settings
const DEFAULT_SETTINGS = {
  taxRate: 8,
  theme: 'light'
};

// Get data from localStorage
function getFromStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error getting data from localStorage: ${error}`);
    return defaultValue;
  }
}

// Save data to localStorage
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to localStorage: ${error}`);
    return false;
  }
}

// Get products
function getProducts() {
  return getFromStorage(STORAGE_KEYS.PRODUCTS);
}

// Save products
function saveProducts(products) {
  return saveToStorage(STORAGE_KEYS.PRODUCTS, products);
}

// Get cart items
function getCartItems() {
  return getFromStorage(STORAGE_KEYS.CART);
}

// Save cart items
function saveCartItems(items) {
  return saveToStorage(STORAGE_KEYS.CART, items);
}

// Add item to cart
function addToCart(product) {
  const cart = getCartItems();
  
  // Check if product already exists in cart
  const existingItemIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingItemIndex !== -1) {
    // Update quantity if product already exists
    cart[existingItemIndex].quantity += product.quantity;
    cart[existingItemIndex].finalPrice = product.finalPrice;
  } else {
    // Add new product to cart
    cart.push({
      ...product,
      addedAt: new Date().toISOString()
    });
  }
  
  return saveCartItems(cart);
}

// Remove item from cart
function removeFromCart(productId) {
  const cart = getCartItems();
  const updatedCart = cart.filter(item => item.id !== productId);
  return saveCartItems(updatedCart);
}

// Update cart item quantity
function updateCartItemQuantity(productId, quantity) {
  const cart = getCartItems();
  const updatedCart = cart.map(item => {
    if (item.id === productId) {
      return {
        ...item,
        quantity: quantity
      };
    }
    return item;
  });
  
  return saveCartItems(updatedCart);
}

// Clear cart
function clearCart() {
  return saveCartItems([]);
}

// Get inventory items
function getInventoryItems() {
  return getFromStorage(STORAGE_KEYS.INVENTORY);
}

// Save inventory items
function saveInventoryItems(items) {
  return saveToStorage(STORAGE_KEYS.INVENTORY, items);
}

// Add item to inventory
function addToInventory(item) {
  const inventory = getInventoryItems();
  
  // Add new item with unique ID
  const newItem = {
    ...item,
    id: item.id || generateId(),
    createdAt: new Date().toISOString()
  };
  
  inventory.push(newItem);
  return saveInventoryItems(inventory);
}

// Update inventory item
function updateInventoryItem(itemId, updatedItem) {
  const inventory = getInventoryItems();
  const updatedInventory = inventory.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        ...updatedItem,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });
  
  return saveInventoryItems(updatedInventory);
}

// Remove item from inventory
function removeFromInventory(itemId) {
  const inventory = getInventoryItems();
  const updatedInventory = inventory.filter(item => item.id !== itemId);
  return saveInventoryItems(updatedInventory);
}

// Get purchase history
function getPurchaseHistory() {
  return getFromStorage(STORAGE_KEYS.PURCHASE_HISTORY);
}

// Save purchase to history
function savePurchase(cartItems, total) {
  const history = getPurchaseHistory();
  
  const purchase = {
    id: generateId(),
    date: new Date().toISOString(),
    items: cartItems,
    total: total
  };
  
  history.push(purchase);
  return saveToStorage(STORAGE_KEYS.PURCHASE_HISTORY, history);
}

// Get settings
function getSettings() {
  return getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

// Save settings
function saveSettings(settings) {
  return saveToStorage(STORAGE_KEYS.SETTINGS, {
    ...DEFAULT_SETTINGS,
    ...settings
  });
}

// Get categories from inventory
function getCategories() {
  const inventory = getInventoryItems();
  const categories = new Set();
  
  inventory.forEach(item => {
    if (item.category) {
      categories.add(item.category);
    }
  });
  
  return Array.from(categories);
}

// Initialize storage with default data if empty
function initializeStorage() {
  // Check if settings exist, if not create default
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveSettings(DEFAULT_SETTINGS);
  }
  
  // Initialize empty arrays for other storage if they don't exist
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    saveProducts([]);
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.CART)) {
    saveCartItems([]);
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
    saveInventoryItems([]);
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.PURCHASE_HISTORY)) {
    saveToStorage(STORAGE_KEYS.PURCHASE_HISTORY, []);
  }
}
