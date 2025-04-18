/**
 * Data tab functionality
 */

// Initialize data tab
function initializeDataTab() {
  // Elements
  const dataTabs = document.querySelectorAll('.data-tab');
  const dataContents = document.querySelectorAll('.data-content');
  const addProductButton = getElement('add-product-data');
  const productsTable = getElement('products-table');
  const emptyProductsMessage = getElement('empty-products-message');
  const purchaseHistory = getElement('purchase-history');
  const emptyHistoryMessage = getElement('empty-history-message');
  
  // Initialize data tabs
  initializeDataTabs();
  
  // Add product button
  addProductButton.addEventListener('click', () => {
    openProductModal();
  });
  
  // Load products
  loadProducts();
  
  // Load purchase history
  loadPurchaseHistory();
}

// Load products
function loadProducts() {
  const productsTable = getElement('products-table');
  const emptyProductsMessage = getElement('empty-products-message');
  
  // Clear table
  productsTable.innerHTML = '';
  
  // Get products
  const products = getProducts();
  
  if (products.length === 0) {
    // Show empty message
    emptyProductsMessage.style.display = 'block';
    productsTable.style.display = 'none';
    return;
  }
  
  // Hide empty message
  emptyProductsMessage.style.display = 'none';
  productsTable.style.display = 'table';
  
  // Create table header
  const tableHeader = createElement('thead');
  const headerRow = createElement('tr');
  
  const headers = ['Tên sản phẩm', 'Mã barcode', 'Giá', 'Thao tác'];
  headers.forEach(header => {
    const th = createElement('th', {
      textContent: header
    });
    headerRow.appendChild(th);
  });
  
  tableHeader.appendChild(headerRow);
  productsTable.appendChild(tableHeader);
  
  // Create table body
  const tableBody = createElement('tbody');
  
  products.forEach(product => {
    const row = createElement('tr');
    
    // Product name and description
    const nameCell = createElement('td');
    const nameDiv = createElement('div', {
      className: 'product-name',
      textContent: product.name
    });
    
    if (product.description) {
      const descDiv = createElement('div', {
        className: 'product-description',
        textContent: product.description
      });
      nameCell.appendChild(nameDiv);
      nameCell.appendChild(descDiv);
    } else {
      nameCell.appendChild(nameDiv);
    }
    
    // Barcode
    const barcodeCell = createElement('td', {
      textContent: product.barcode || '-'
    });
    
    // Price
    const priceCell = createElement('td', {
      textContent: formatCurrency(product.price)
    });
    
    // Actions
    const actionsCell = createElement('td', {
      className: 'product-actions'
    });
    
    const editButton = createElement('button', {
      className: 'btn-primary',
      textContent: 'Sửa',
      onclick: () => openProductModal(product)
    });
    
    const deleteButton = createElement('button', {
      className: 'btn-danger',
      textContent: 'Xóa',
      onclick: () => {
        openConfirmModal('Bạn có chắc chắn muốn xóa sản phẩm này?', () => {
          removeProduct(product.id);
        });
      }
    });
    
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
    
    // Add cells to row
    row.appendChild(nameCell);
    row.appendChild(barcodeCell);
    row.appendChild(priceCell);
    row.appendChild(actionsCell);
    
    // Add row to table
    tableBody.appendChild(row);
  });
  
  productsTable.appendChild(tableBody);
}

// Open product modal
function openProductModal(product = null) {
  const title = product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới';
  
  // Create form fields
  const fields = [
    {
      type: 'text',
      id: 'product-modal-name',
      label: 'Tên sản phẩm *',
      value: product ? product.name : '',
      options: { required: true }
    },
    {
      type: 'text',
      id: 'product-modal-barcode',
      label: 'Mã barcode',
      value: product ? product.barcode : ''
    },
    {
      type: 'textarea',
      id: 'product-modal-description',
      label: 'Mô tả',
      value: product ? product.description : ''
    },
    {
      type: 'number',
      id: 'product-modal-price',
      label: 'Giá *',
      value: product ? product.price : '',
      options: { min: 0, step: 0.01, required: true }
    },
    {
      type: 'checkbox',
      id: 'product-modal-include-tax',
      label: 'Đã bao gồm thuế',
      value: product ? product.includeTax : true
    }
  ];
  
  // Create form
  const form = createModalForm(fields, (formData) => {
    // Process form data
    const productData = {
      name: formData['product-modal-name'],
      barcode: formData['product-modal-barcode'],
      description: formData['product-modal-description'],
      price: parseFloat(formData['product-modal-price']) || 0,
      includeTax: formData['product-modal-include-tax']
    };
    
    // Validate
    if (!productData.name) {
      showNotification('Vui lòng nhập tên sản phẩm', 'error');
      return;
    }
    
    if (productData.price <= 0) {
      showNotification('Vui lòng nhập giá hợp lệ', 'error');
      return;
    }
    
    // Get products
    const products = getProducts();
    
    if (product) {
      // Update existing product
      const updatedProducts = products.map(p => {
        if (p.id === product.id) {
          return {
            ...p,
            ...productData,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
      
      if (saveProducts(updatedProducts)) {
        showNotification('Đã cập nhật sản phẩm thành công', 'success');
        loadProducts();
      } else {
        showNotification('Không thể cập nhật sản phẩm', 'error');
      }
    } else {
      // Add new product
      const newProduct = {
        id: generateId(),
        ...productData,
        createdAt: new Date().toISOString()
      };
      
      products.push(newProduct);
      
      if (saveProducts(products)) {
        showNotification('Đã thêm sản phẩm mới thành công', 'success');
        loadProducts();
      } else {
        showNotification('Không thể thêm sản phẩm mới', 'error');
      }
    }
    
    // Close modal
    const modalContainer = getElement('modal-container');
    modalContainer.style.display = 'none';
  });
  
  // Open modal with form
  openModal(title, form);
}

// Remove product
function removeProduct(productId) {
  // Get products
  const products = getProducts();
  
  // Remove product
  const updatedProducts = products.filter(p => p.id !== productId);
  
  // Save updated products
  if (saveProducts(updatedProducts)) {
    showNotification('Đã xóa sản phẩm thành công', 'success');
    loadProducts();
  } else {
    showNotification('Không thể xóa sản phẩm', 'error');
  }
}

// Load purchase history
function loadPurchaseHistory() {
  const purchaseHistory = getElement('purchase-history');
  const emptyHistoryMessage = getElement('empty-history-message');
  
  // Clear container
  purchaseHistory.innerHTML = '';
  
  // Get purchase history
  const history = getPurchaseHistory();
  
  if (history.length === 0) {
    // Show empty message
    emptyHistoryMessage.style.display = 'block';
    purchaseHistory.style.display = 'none';
    return;
  }
  
  // Hide empty message
  emptyHistoryMessage.style.display = 'none';
  purchaseHistory.style.display = 'flex';
  
  // Sort by date (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Add items to container
  sortedHistory.forEach(purchase => {
    const purchaseElement = createPurchaseElement(purchase);
    purchaseHistory.appendChild(purchaseElement);
  });
}

// Create purchase element
function createPurchaseElement(purchase) {
  const purchaseElement = createElement('div', {
    className: 'purchase-item',
    id: `purchase-${purchase.id}`
  });
  
  // Purchase header
  const headerDiv = createElement('div', {
    className: 'purchase-header'
  });
  
  const idDiv = createElement('div', {
    className: 'purchase-id',
    textContent: `Đơn hàng #${purchase.id.slice(0, 8)}`
  });
  
  const dateDiv = createElement('div', {
    className: 'purchase-date',
    textContent: new Date(purchase.date).toLocaleString('vi-VN')
  });
  
  headerDiv.appendChild(idDiv);
  headerDiv.appendChild(dateDiv);
  
  // Purchase total
  const totalDiv = createElement('div', {
    className: 'purchase-total',
    textContent: formatCurrency(purchase.total)
  });
  
  // Purchase products
  const productsDiv = createElement('div', {
    className: 'purchase-products'
  });
  
  const productsTitle = createElement('h4', {
    textContent: 'Sản phẩm:'
  });
  
  productsDiv.appendChild(productsTitle);
  
  purchase.items.forEach(item => {
    const productDiv = createElement('div', {
      className: 'purchase-product'
    });
    
    const productName = createElement('div', {
      className: 'purchase-product-name',
      textContent: `${item.name} x${item.quantity}`
    });
    
    const productPrice = createElement('div', {
      className: 'purchase-product-price',
      textContent: formatCurrency(item.totalPrice)
    });
    
    productDiv.appendChild(productName);
    productDiv.appendChild(productPrice);
    
    productsDiv.appendChild(productDiv);
  });
  
  // Add all elements to purchase
  purchaseElement.appendChild(headerDiv);
  purchaseElement.appendChild(totalDiv);
  purchaseElement.appendChild(productsDiv);
  
  return purchaseElement;
}
