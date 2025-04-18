/**
 * Shopping tab functionality
 */

// Initialize shopping tab
function initializeShoppingTab() {
  // Elements
  const productNameInput = getElement('product-name');
  const scanBarcodeButton = getElement('scan-barcode');
  const includeTaxCheckbox = getElement('include-tax');
  const taxRateSpan = getElement('tax-rate');
  const productPriceInput = getElement('product-price');
  const productQuantityInput = getElement('product-quantity');
  const decreaseQuantityButton = getElement('decrease-quantity');
  const increaseQuantityButton = getElement('increase-quantity');
  const discountPercentRadio = getElement('discount-percent');
  const discountDirectRadio = getElement('discount-direct');
  const percentOptionsDiv = getElement('percent-options');
  const directAmountDiv = getElement('direct-amount');
  const discountButtons = document.querySelectorAll('.btn-discount');
  const customPercentInput = getElement('custom-percent');
  const discountAmountInput = getElement('discount-amount');
  const finalPriceSpan = getElement('final-price');
  const addToCartButton = getElement('add-to-cart');
  
  // Get settings
  const settings = getSettings();
  taxRateSpan.textContent = settings.taxRate;
  
  // Product search by name
  productNameInput.addEventListener('input', debounce(function() {
    const searchTerm = this.value.trim().toLowerCase();
    if (searchTerm.length > 2) {
      const products = getProducts();
      const matchingProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
      );
      
      if (matchingProducts.length > 0) {
        // Show matching products in a dropdown
        showProductDropdown(matchingProducts, productNameInput);
      }
    }
  }, 300));
  
  // Barcode scanner
  scanBarcodeButton.addEventListener('click', () => {
    openBarcodeScanner((barcode) => {
      // Search for product with matching barcode
      const products = getProducts();
      const product = products.find(p => p.barcode === barcode);
      
      if (product) {
        // Fill form with product details
        fillProductForm(product);
      } else {
        showNotification(`Không tìm thấy sản phẩm với mã barcode: ${barcode}`, 'warning');
      }
    });
  });
  
  // Tax handling
  includeTaxCheckbox.addEventListener('change', updateFinalPrice);
  
  // Price input
  productPriceInput.addEventListener('input', updateFinalPrice);
  
  // Quantity controls
  decreaseQuantityButton.addEventListener('click', () => {
    const currentValue = parseInt(productQuantityInput.value) || 1;
    if (currentValue > 1) {
      productQuantityInput.value = currentValue - 1;
      updateFinalPrice();
    }
  });
  
  increaseQuantityButton.addEventListener('click', () => {
    const currentValue = parseInt(productQuantityInput.value) || 1;
    productQuantityInput.value = currentValue + 1;
    updateFinalPrice();
  });
  
  productQuantityInput.addEventListener('input', () => {
    // Ensure minimum value is 1
    if (parseInt(productQuantityInput.value) < 1) {
      productQuantityInput.value = 1;
    }
    updateFinalPrice();
  });
  
  // Discount type toggle
  discountPercentRadio.addEventListener('change', () => {
    if (discountPercentRadio.checked) {
      percentOptionsDiv.style.display = 'flex';
      directAmountDiv.style.display = 'none';
      updateFinalPrice();
    }
  });
  
  discountDirectRadio.addEventListener('change', () => {
    if (discountDirectRadio.checked) {
      percentOptionsDiv.style.display = 'none';
      directAmountDiv.style.display = 'block';
      updateFinalPrice();
    }
  });
  
  // Discount buttons
  discountButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      discountButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Clear custom percent input
      customPercentInput.value = '';
      
      updateFinalPrice();
    });
  });
  
  // Custom percent input
  customPercentInput.addEventListener('input', () => {
    // Remove active class from discount buttons
    discountButtons.forEach(btn => btn.classList.remove('active'));
    
    updateFinalPrice();
  });
  
  // Direct discount amount
  discountAmountInput.addEventListener('input', updateFinalPrice);
  
  // Add to cart button
  addToCartButton.addEventListener('click', () => {
    const productName = productNameInput.value.trim();
    const productPrice = parseFloat(productPriceInput.value);
    const quantity = parseInt(productQuantityInput.value) || 1;
    
    // Validate inputs
    if (!productName) {
      showNotification('Vui lòng nhập tên sản phẩm', 'error');
      return;
    }
    
    if (isNaN(productPrice) || productPrice <= 0) {
      showNotification('Vui lòng nhập giá hợp lệ', 'error');
      return;
    }
    
    // Get discount
    let discountType, discountValue;
    if (discountPercentRadio.checked) {
      discountType = 'percent';
      
      // Check if a discount button is active
      const activeButton = document.querySelector('.btn-discount.active');
      if (activeButton) {
        discountValue = parseFloat(activeButton.getAttribute('data-value'));
      } else if (customPercentInput.value) {
        discountValue = parseFloat(customPercentInput.value);
      } else {
        discountValue = 0;
      }
    } else {
      discountType = 'direct';
      discountValue = parseFloat(discountAmountInput.value) || 0;
    }
    
    // Calculate final price
    const includeTax = includeTaxCheckbox.checked;
    const taxRate = parseFloat(taxRateSpan.textContent);
    
    const priceWithTax = calculatePriceWithTax(productPrice, includeTax, taxRate);
    const finalPrice = calculateFinalPrice(priceWithTax, discountType, discountValue);
    
    // Create product object
    const product = {
      id: generateId(),
      name: productName,
      price: productPrice,
      quantity: quantity,
      includeTax: includeTax,
      taxRate: taxRate,
      discountType: discountType,
      discountValue: discountValue,
      finalPrice: finalPrice,
      totalPrice: finalPrice * quantity
    };
    
    // Add to cart
    if (addToCart(product)) {
      showNotification('Đã thêm sản phẩm vào giỏ hàng', 'success');
      
      // Reset form
      resetProductForm();
    } else {
      showNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
    }
  });
}

// Update final price based on form inputs
function updateFinalPrice() {
  const productPriceInput = getElement('product-price');
  const includeTaxCheckbox = getElement('include-tax');
  const taxRateSpan = getElement('tax-rate');
  const discountPercentRadio = getElement('discount-percent');
  const customPercentInput = getElement('custom-percent');
  const discountAmountInput = getElement('discount-amount');
  const finalPriceSpan = getElement('final-price');
  const productQuantityInput = getElement('product-quantity');
  
  const price = parseFloat(productPriceInput.value) || 0;
  const quantity = parseInt(productQuantityInput.value) || 1;
  
  if (price <= 0) {
    finalPriceSpan.textContent = formatCurrency(0);
    return;
  }
  
  // Calculate price with tax
  const includeTax = includeTaxCheckbox.checked;
  const taxRate = parseFloat(taxRateSpan.textContent);
  const priceWithTax = calculatePriceWithTax(price, includeTax, taxRate);
  
  // Get discount
  let discountType, discountValue;
  if (discountPercentRadio.checked) {
    discountType = 'percent';
    
    // Check if a discount button is active
    const activeButton = document.querySelector('.btn-discount.active');
    if (activeButton) {
      discountValue = parseFloat(activeButton.getAttribute('data-value'));
    } else if (customPercentInput.value) {
      discountValue = parseFloat(customPercentInput.value);
    } else {
      discountValue = 0;
    }
  } else {
    discountType = 'direct';
    discountValue = parseFloat(discountAmountInput.value) || 0;
  }
  
  // Calculate final price
  const finalPrice = calculateFinalPrice(priceWithTax, discountType, discountValue);
  const totalPrice = finalPrice * quantity;
  
  // Update display
  finalPriceSpan.textContent = formatCurrency(totalPrice);
}

// Show product dropdown for search
function showProductDropdown(products, inputElement) {
  // Create dropdown element
  const dropdown = createElement('div', {
    className: 'product-dropdown'
  });
  
  // Add products to dropdown
  products.forEach(product => {
    const item = createElement('div', {
      className: 'product-dropdown-item',
      onclick: () => {
        fillProductForm(product);
        dropdown.remove();
      }
    }, [
      createElement('div', {
        className: 'product-dropdown-name',
        textContent: product.name
      }),
      createElement('div', {
        className: 'product-dropdown-price',
        textContent: formatCurrency(product.price)
      })
    ]);
    
    dropdown.appendChild(item);
  });
  
  // Position dropdown
  const rect = inputElement.getBoundingClientRect();
  dropdown.style.top = `${rect.bottom}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.width = `${rect.width}px`;
  
  // Add to document
  document.body.appendChild(dropdown);
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function closeDropdown(e) {
    if (!dropdown.contains(e.target) && e.target !== inputElement) {
      dropdown.remove();
      document.removeEventListener('click', closeDropdown);
    }
  });
}

// Fill product form with product details
function fillProductForm(product) {
  const productNameInput = getElement('product-name');
  const includeTaxCheckbox = getElement('include-tax');
  const productPriceInput = getElement('product-price');
  
  productNameInput.value = product.name;
  includeTaxCheckbox.checked = product.includeTax !== undefined ? product.includeTax : true;
  productPriceInput.value = product.price;
  
  updateFinalPrice();
}

// Reset product form
function resetProductForm() {
  const productNameInput = getElement('product-name');
  const productPriceInput = getElement('product-price');
  const productQuantityInput = getElement('product-quantity');
  const discountButtons = document.querySelectorAll('.btn-discount');
  const customPercentInput = getElement('custom-percent');
  const discountAmountInput = getElement('discount-amount');
  
  productNameInput.value = '';
  productPriceInput.value = '';
  productQuantityInput.value = '1';
  
  // Reset discount buttons
  discountButtons.forEach(btn => btn.classList.remove('active'));
  customPercentInput.value = '';
  discountAmountInput.value = '';
  
  updateFinalPrice();
}

// Open barcode scanner
function openBarcodeScanner(onScan) {
  const scannerModal = getElement('barcode-scanner-modal');
  const scannerVideo = getElement('scanner-video');
  const scannerClose = getElement('scanner-close');
  
  // Show modal
  scannerModal.style.display = 'flex';
  
  // Initialize scanner
  let scanner = null;
  
  // Check if browser supports getUserMedia
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(function(stream) {
        scannerVideo.srcObject = stream;
        scannerVideo.play();
        
        // Create a canvas element for capturing video frames
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set up scanning interval
        const scanInterval = setInterval(() => {
          if (scannerVideo.readyState === scannerVideo.HAVE_ENOUGH_DATA) {
            canvas.height = scannerVideo.videoHeight;
            canvas.width = scannerVideo.videoWidth;
            context.drawImage(scannerVideo, 0, 0, canvas.width, canvas.height);
            
            // Here you would normally use a barcode scanning library
            // For this example, we'll simulate a scan after 3 seconds
            if (!scanner) {
              scanner = setTimeout(() => {
                // Simulate barcode detection
                const barcode = 'DEMO' + Math.floor(Math.random() * 1000000);
                
                // Stop video stream
                if (scannerVideo.srcObject) {
                  scannerVideo.srcObject.getTracks().forEach(track => track.stop());
                }
                
                // Close modal
                scannerModal.style.display = 'none';
                
                // Call callback with barcode
                if (typeof onScan === 'function') {
                  onScan(barcode);
                }
                
                clearInterval(scanInterval);
              }, 3000);
            }
          }
        }, 100);
        
        // Close button
        scannerClose.onclick = () => {
          clearInterval(scanInterval);
          clearTimeout(scanner);
          
          // Stop video stream
          if (scannerVideo.srcObject) {
            scannerVideo.srcObject.getTracks().forEach(track => track.stop());
          }
          
          scannerModal.style.display = 'none';
        };
        
        // Close when clicking outside
        scannerModal.onclick = (e) => {
          if (e.target === scannerModal) {
            clearInterval(scanInterval);
            clearTimeout(scanner);
            
            // Stop video stream
            if (scannerVideo.srcObject) {
              scannerVideo.srcObject.getTracks().forEach(track => track.stop());
            }
            
            scannerModal.style.display = 'none';
          }
        };
      })
      .catch(function(error) {
        console.error('Error accessing camera:', error);
        showNotification('Không thể truy cập camera', 'error');
        scannerModal.style.display = 'none';
      });
  } else {
    showNotification('Trình duyệt không hỗ trợ truy cập camera', 'error');
    scannerModal.style.display = 'none';
  }
}
