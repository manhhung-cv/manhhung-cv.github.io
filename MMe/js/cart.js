/**
 * Cart tab functionality
 */

// Initialize cart tab
function initializeCartTab() {
  // Elements
  const cartItemsContainer = getElement('cart-items');
  const emptyCartMessage = getElement('empty-cart-message');
  const cartSummary = getElement('cart-summary');
  const cartTotalSpan = getElement('cart-total');
  const checkoutButton = getElement('checkout');
  
  // Load cart items
  loadCartItems();
  
  // Checkout button
  checkoutButton.addEventListener('click', () => {
    openConfirmModal('Xác nhận thanh toán?', () => {
      processCheckout();
    });
  });
}

// Load cart items
function loadCartItems() {
  const cartItemsContainer = getElement('cart-items');
  const emptyCartMessage = getElement('empty-cart-message');
  const cartSummary = getElement('cart-summary');
  const cartTotalSpan = getElement('cart-total');
  
  // Clear container
  cartItemsContainer.innerHTML = '';
  
  // Get cart items
  const cartItems = getCartItems();
  
  if (cartItems.length === 0) {
    // Show empty message
    emptyCartMessage.style.display = 'block';
    cartSummary.style.display = 'none';
    return;
  }
  
  // Hide empty message
  emptyCartMessage.style.display = 'none';
  cartSummary.style.display = 'block';
  
  // Calculate total
  let total = 0;
  
  // Add items to container
  cartItems.forEach(item => {
    const itemElement = createCartItemElement(item);
    cartItemsContainer.appendChild(itemElement);
    
    // Add to total
    total += item.totalPrice;
  });
  
  // Update total
  cartTotalSpan.textContent = formatCurrency(total);
}

// Create cart item element
function createCartItemElement(item) {
  const itemElement = createElement('div', {
    className: 'cart-item',
    id: `cart-item-${item.id}`
  });
  
  // Item info
  const infoDiv = createElement('div', {
    className: 'cart-item-info'
  });
  
  const nameDiv = createElement('div', {
    className: 'cart-item-name',
    textContent: item.name
  });
  
  const priceDiv = createElement('div', {
    className: 'cart-item-price',
    textContent: `${formatCurrency(item.finalPrice)} × ${item.quantity}`
  });
  
  infoDiv.appendChild(nameDiv);
  infoDiv.appendChild(priceDiv);
  
  // Item quantity
  const quantityDiv = createElement('div', {
    className: 'cart-item-quantity'
  });
  
  const decreaseButton = createElement('button', {
    className: 'btn-quantity',
    textContent: '-',
    onclick: () => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))
  });
  
  const quantityInput = createElement('input', {
    type: 'number',
    value: item.quantity,
    min: '1',
    onchange: (e) => {
      const newQuantity = parseInt(e.target.value) || 1;
      updateCartItemQuantity(item.id, newQuantity);
    }
  });
  
  const increaseButton = createElement('button', {
    className: 'btn-quantity',
    textContent: '+',
    onclick: () => updateCartItemQuantity(item.id, item.quantity + 1)
  });
  
  quantityDiv.appendChild(decreaseButton);
  quantityDiv.appendChild(quantityInput);
  quantityDiv.appendChild(increaseButton);
  
  // Item actions
  const actionsDiv = createElement('div', {
    className: 'cart-item-actions'
  });
  
  const totalDiv = createElement('div', {
    className: 'cart-item-total',
    textContent: formatCurrency(item.totalPrice)
  });
  
  const removeButton = createElement('button', {
    className: 'btn-danger',
    textContent: 'Xóa',
    onclick: () => removeCartItem(item.id)
  });
  
  actionsDiv.appendChild(totalDiv);
  actionsDiv.appendChild(removeButton);
  
  // Add all elements to item
  itemElement.appendChild(infoDiv);
  itemElement.appendChild(quantityDiv);
  itemElement.appendChild(actionsDiv);
  
  return itemElement;
}

// Update cart item quantity
function updateCartItemQuantity(itemId, newQuantity) {
  // Get cart items
  const cartItems = getCartItems();
  
  // Find item
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) return;
  
  // Update quantity
  cartItems[itemIndex].quantity = newQuantity;
  
  // Update total price
  cartItems[itemIndex].totalPrice = cartItems[itemIndex].finalPrice * newQuantity;
  
  // Save updated cart
  saveCartItems(cartItems);
  
  // Reload cart items
  loadCartItems();
}

// Remove cart item
function removeCartItem(itemId) {
  // Remove from storage
  if (removeFromCart(itemId)) {
    // Reload cart items
    loadCartItems();
    showNotification('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
  } else {
    showNotification('Không thể xóa sản phẩm khỏi giỏ hàng', 'error');
  }
}

// Process checkout
function processCheckout() {
  // Get cart items
  const cartItems = getCartItems();
  
  if (cartItems.length === 0) {
    showNotification('Giỏ hàng trống', 'error');
    return;
  }
  
  // Calculate total
  let total = 0;
  cartItems.forEach(item => {
    total += item.totalPrice;
  });
  
  // Save purchase to history
  if (savePurchase(cartItems, total)) {
    // Add items to inventory
    cartItems.forEach(item => {
      // Check if item already exists in inventory
      const inventoryItems = getInventoryItems();
      const existingItem = inventoryItems.find(invItem => 
        invItem.name.toLowerCase() === item.name.toLowerCase()
      );
      
      if (existingItem) {
        // Update quantity
        updateInventoryItem(existingItem.id, {
          quantity: (existingItem.quantity || 0) + item.quantity
        });
      } else {
        // Add new item
        addToInventory({
          name: item.name,
          price: item.finalPrice,
          quantity: item.quantity,
          category: 'Chưa phân loại'
        });
      }
    });
    
    // Clear cart
    clearCart();
    
    // Reload cart items
    loadCartItems();
    
    showNotification('Thanh toán thành công', 'success');
  } else {
    showNotification('Không thể xử lý thanh toán', 'error');
  }
}
