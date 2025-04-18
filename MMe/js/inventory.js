/**
 * Inventory tab functionality
 */

// Initialize inventory tab
function initializeInventoryTab() {
  // Elements
  const addInventoryButton = getElement('add-inventory-item');
  const categoryFilter = getElement('category-filter');
  const inventoryItemsContainer = getElement('inventory-items');
  const emptyInventoryMessage = getElement('empty-inventory-message');
  
  // Add inventory item button
  addInventoryButton.addEventListener('click', () => {
    openInventoryItemModal();
  });
  
  // Category filter
  categoryFilter.addEventListener('change', () => {
    loadInventoryItems();
  });
  
  // Load inventory items
  loadInventoryItems();
  
  // Load categories
  loadCategories();
}

// Load inventory items
function loadInventoryItems() {
  const inventoryItemsContainer = getElement('inventory-items');
  const emptyInventoryMessage = getElement('empty-inventory-message');
  const categoryFilter = getElement('category-filter');
  
  // Clear container
  inventoryItemsContainer.innerHTML = '';
  
  // Get inventory items
  const inventoryItems = getInventoryItems();
  
  // Filter by category
  const selectedCategory = categoryFilter.value;
  const filteredItems = selectedCategory === 'all' 
    ? inventoryItems 
    : inventoryItems.filter(item => item.category === selectedCategory);
  
  if (filteredItems.length === 0) {
    // Show empty message
    emptyInventoryMessage.style.display = 'block';
    return;
  }
  
  // Hide empty message
  emptyInventoryMessage.style.display = 'none';
  
  // Add items to container
  filteredItems.forEach(item => {
    const itemElement = createInventoryItemElement(item);
    inventoryItemsContainer.appendChild(itemElement);
  });
}

// Create inventory item element
function createInventoryItemElement(item) {
  const itemElement = createElement('div', {
    className: 'inventory-item',
    id: `inventory-item-${item.id}`
  });
  
  // Item header
  const headerDiv = createElement('div', {
    className: 'inventory-item-header'
  });
  
  const nameDiv = createElement('div', {
    className: 'inventory-item-name',
    textContent: item.name
  });
  
  const categoryDiv = createElement('div', {
    className: 'inventory-item-category',
    textContent: item.category || 'Chưa phân loại'
  });
  
  headerDiv.appendChild(nameDiv);
  headerDiv.appendChild(categoryDiv);
  
  // Item details
  const detailsDiv = createElement('div', {
    className: 'inventory-item-details'
  });
  
  // Quantity
  const quantityDiv = createElement('div', {
    className: 'inventory-item-detail'
  });
  
  const quantityLabel = createElement('strong', {
    textContent: 'Số lượng: '
  });
  
  const quantityValue = createElement('span', {
    textContent: item.quantity || 0
  });
  
  quantityDiv.appendChild(quantityLabel);
  quantityDiv.appendChild(quantityValue);
  
  // Price
  const priceDiv = createElement('div', {
    className: 'inventory-item-detail'
  });
  
  const priceLabel = createElement('strong', {
    textContent: 'Giá: '
  });
  
  const priceValue = createElement('span', {
    textContent: formatCurrency(item.price || 0)
  });
  
  priceDiv.appendChild(priceLabel);
  priceDiv.appendChild(priceValue);
  
  // Date added
  const dateDiv = createElement('div', {
    className: 'inventory-item-detail'
  });
  
  const dateLabel = createElement('strong', {
    textContent: 'Ngày thêm: '
  });
  
  const dateValue = createElement('span', {
    textContent: new Date(item.createdAt).toLocaleDateString('vi-VN')
  });
  
  dateDiv.appendChild(dateLabel);
  dateDiv.appendChild(dateValue);
  
  detailsDiv.appendChild(quantityDiv);
  detailsDiv.appendChild(priceDiv);
  detailsDiv.appendChild(dateDiv);
  
  // Item actions
  const actionsDiv = createElement('div', {
    className: 'inventory-item-actions'
  });
  
  const editButton = createElement('button', {
    className: 'btn-primary',
    textContent: 'Sửa',
    onclick: () => openInventoryItemModal(item)
  });
  
  const deleteButton = createElement('button', {
    className: 'btn-danger',
    textContent: 'Xóa',
    onclick: () => {
      openConfirmModal('Bạn có chắc chắn muốn xóa mục này?', () => {
        removeInventoryItem(item.id);
      });
    }
  });
  
  actionsDiv.appendChild(editButton);
  actionsDiv.appendChild(deleteButton);
  
  // Add all elements to item
  itemElement.appendChild(headerDiv);
  itemElement.appendChild(detailsDiv);
  itemElement.appendChild(actionsDiv);
  
  return itemElement;
}

// Open inventory item modal
function openInventoryItemModal(item = null) {
  const title = item ? 'Chỉnh sửa đồ' : 'Thêm đồ mới';
  
  // Get categories for dropdown
  const categories = getCategories();
  const categoryOptions = [
    { value: 'Chưa phân loại', text: 'Chưa phân loại' },
    ...categories.map(category => ({ value: category, text: category }))
  ];
  
  // Add "New category" option
  categoryOptions.push({ value: 'new', text: '+ Thêm danh mục mới' });
  
  // Create form fields
  const fields = [
    {
      type: 'text',
      id: 'inventory-name',
      label: 'Tên',
      value: item ? item.name : '',
      options: { required: true }
    },
    {
      type: 'number',
      id: 'inventory-quantity',
      label: 'Số lượng',
      value: item ? item.quantity : 1,
      options: { min: 0, step: 1 }
    },
    {
      type: 'number',
      id: 'inventory-price',
      label: 'Giá',
      value: item ? item.price : '',
      options: { min: 0, step: 0.01 }
    },
    {
      type: 'select',
      id: 'inventory-category',
      label: 'Danh mục',
      value: item ? item.category : 'Chưa phân loại',
      options: { options: categoryOptions }
    },
    {
      type: 'text',
      id: 'inventory-new-category',
      label: 'Danh mục mới',
      value: '',
      options: { style: 'display: none;' }
    }
  ];
  
  // Create form
  const form = createModalForm(fields, (formData) => {
    // Process form data
    const itemData = {
      name: formData['inventory-name'],
      quantity: parseInt(formData['inventory-quantity']) || 0,
      price: parseFloat(formData['inventory-price']) || 0,
      category: formData['inventory-category'] === 'new' 
        ? formData['inventory-new-category'] 
        : formData['inventory-category']
    };
    
    if (item) {
      // Update existing item
      if (updateInventoryItem(item.id, itemData)) {
        showNotification('Đã cập nhật thành công', 'success');
        loadInventoryItems();
        loadCategories();
      } else {
        showNotification('Không thể cập nhật mục', 'error');
      }
    } else {
      // Add new item
      if (addToInventory(itemData)) {
        showNotification('Đã thêm mục mới thành công', 'success');
        loadInventoryItems();
        loadCategories();
      } else {
        showNotification('Không thể thêm mục mới', 'error');
      }
    }
    
    // Close modal
    const modalContainer = getElement('modal-container');
    modalContainer.style.display = 'none';
  });
  
  // Open modal with form
  const modal = openModal(title, form);
  
  // Add event listener for category select
  const categorySelect = getElement('inventory-category');
  const newCategoryField = getElement('inventory-new-category');
  const newCategoryLabel = document.querySelector('label[for="inventory-new-category"]');
  
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'new') {
      newCategoryField.style.display = 'block';
      newCategoryLabel.style.display = 'block';
    } else {
      newCategoryField.style.display = 'none';
      newCategoryLabel.style.display = 'none';
    }
  });
}

// Remove inventory item
function removeInventoryItem(itemId) {
  // Remove from storage
  if (removeFromInventory(itemId)) {
    // Reload inventory items
    loadInventoryItems();
    showNotification('Đã xóa mục thành công', 'success');
  } else {
    showNotification('Không thể xóa mục', 'error');
  }
}

// Load categories
function loadCategories() {
  const categoryFilter = getElement('category-filter');
  
  // Get categories
  const categories = getCategories();
  
  // Save current selection
  const currentSelection = categoryFilter.value;
  
  // Clear options except "All"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  
  // Add categories
  categories.forEach(category => {
    const option = createElement('option', {
      value: category,
      textContent: category
    });
    
    categoryFilter.appendChild(option);
  });
  
  // Restore selection if possible
  if (currentSelection && Array.from(categoryFilter.options).some(opt => opt.value === currentSelection)) {
    categoryFilter.value = currentSelection;
  }
}
