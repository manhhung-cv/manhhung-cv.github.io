// Main JavaScript file for Chesino Auto Windows website

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// DOM Elements
const toggleThemeBtn = document.getElementById('toggle-theme');
const menuToggleBtn = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const backToTopBtn = document.getElementById('back-to-top');
const currentSectionSpan = document.getElementById('current-section');
const downloadButtons = document.querySelectorAll('.download-btn');
const refreshNewsBtn = document.getElementById('refresh-news');
const contactForm = document.getElementById('contact-form');
const modalContainer = document.getElementById('modal-container');
const modalClose = document.querySelector('.modal-close');
const modalImage = document.getElementById('modal-image');

// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
  // Check for saved theme preference
  initTheme();
  
  // Load RSS feed
  loadRssFeed();
  
  // Initialize all event listeners
  initEventListeners();
  
  // Update breadcrumbs based on current section
  updateBreadcrumbs();
  
  // Initialize image modal functionality
  initImageModal();
});

// Initialize theme based on saved preference
function initTheme() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
}

// Initialize all event listeners
function initEventListeners() {
  // Theme toggle
  toggleThemeBtn.addEventListener('click', toggleTheme);
  
  // Mobile menu toggle
  menuToggleBtn.addEventListener('click', toggleMenu);
  
  // Search form
  searchForm.addEventListener('submit', handleSearch);
  
  // Back to top button
  window.addEventListener('scroll', toggleBackToTopButton);
  backToTopBtn.addEventListener('click', scrollToTop);
  
  // Navigation links
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  // Download buttons
  downloadButtons.forEach(button => {
    button.addEventListener('click', handleDownload);
  });
  
  // Refresh news button
  refreshNewsBtn.addEventListener('click', loadRssFeed);
  
  // Contact form
  contactForm.addEventListener('submit', handleContactForm);
  
  // Modal close button
  modalClose.addEventListener('click', closeModal);
}

// Toggle between light and dark theme
function toggleTheme() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  
  // Show notification
  // showNotification(isDarkMode ? 'Đã chuyển sang chế độ tối' : 'Đã chuyển sang chế độ sáng');
}

// Toggle mobile menu
function toggleMenu() {
  menuToggleBtn.classList.toggle('active');
  navMenu.classList.toggle('active');
}

// Handle search form submission
function handleSearch(e) {
  e.preventDefault();
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (searchTerm === '') {
    showNotification('Vui lòng nhập từ khóa tìm kiếm', 'warning');
    return;
  }
  
  // Get all headings and paragraphs
  const headings = document.querySelectorAll('h2, h3, h4');
  const paragraphs = document.querySelectorAll('p');
  
  // Combine elements to search through
  const elements = [...headings, ...paragraphs];
  
  // Filter elements containing the search term
  const matchingElements = elements.filter(element => 
    element.textContent.toLowerCase().includes(searchTerm)
  );
  
  if (matchingElements.length === 0) {
    showNotification(`Không tìm thấy kết quả cho "${searchTerm}"`, 'warning');
    return;
  }
  
  // Scroll to the first matching element
  matchingElements[0].scrollIntoView({ behavior: 'smooth' });
  
  // Highlight the matching elements temporarily
  matchingElements.forEach(element => {
    element.classList.add('search-highlight');
    setTimeout(() => {
      element.classList.remove('search-highlight');
    }, 3000);
  });
  
  showNotification(`Đã tìm thấy ${matchingElements.length} kết quả cho "${searchTerm}"`);
}

// Toggle back to top button visibility
function toggleBackToTopButton() {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

// Scroll to top of the page
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Handle navigation link clicks
function handleNavigation(e) {
  // Remove active class from all links
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to clicked link
  e.target.classList.add('active');
  
  // Update breadcrumbs
  const sectionId = e.target.getAttribute('href').substring(1);
  updateBreadcrumbsWithSection(sectionId);
  
  // Close mobile menu if open
  if (navMenu.classList.contains('active')) {
    toggleMenu();
  }
}

// Update breadcrumbs based on current section
function updateBreadcrumbs() {
  // Get current hash from URL or default to 'home'
  const currentHash = window.location.hash || '#home';
  const sectionId = currentHash.substring(1);
  
  updateBreadcrumbsWithSection(sectionId);
  
  // Set active class on corresponding nav link
  document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.getAttribute('href') === currentHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Update breadcrumbs with specific section
function updateBreadcrumbsWithSection(sectionId) {
  // Map section IDs to display names
  const sectionNames = {
    'home': 'Trang chủ',
    'welcome': 'Giới thiệu',
    'installWin': 'Cài đặt Windows',
    'news': 'Tin tức',
    'contact': 'Liên hệ'
  };
  
  // Update current section text
  currentSectionSpan.textContent = sectionNames[sectionId] || 'Trang chủ';
}

// Handle download button clicks
function handleDownload(e) {
  const downloadType = e.target.dataset.type;
  
  // Map download types to messages
  const downloadMessages = {
    'basic': 'Đang tải bộ cài Basic (380MB)...',
    'plus': 'Đang tải bộ cài Plus (2.7GB)...',
    'anhdv': 'Đang tải AnhDVBoot...'
  };
  
  showNotification(downloadMessages[downloadType] || 'Đang tải xuống...');
  
  // Simulate download (in a real scenario, this would redirect to actual download URL)
  setTimeout(() => {
    showNotification(`Tải xuống ${downloadType} thành công!`, 'success');
  }, 3000);
}

// Handle contact form submission
function handleContactForm(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  
  if (!name || !email || !message) {
    showNotification('Vui lòng điền đầy đủ thông tin', 'warning');
    return;
  }
  
  // In a real scenario, this would send data to a server
  showNotification('Đang gửi tin nhắn...');
  
  setTimeout(() => {
    showNotification('Tin nhắn đã được gửi thành công!', 'success');
    contactForm.reset();
  }, 2000);
}

// Load RSS feed from WordPress
function loadRssFeed() {
  const rssUrl = 'https://datawindows.wordpress.com/feed/';
  const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
  const rssFeedContainer = document.getElementById('rss-feed');
  
  // Show loading spinner
  rssFeedContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Đang tải bài viết...</p>
    </div>
  `;
  
  fetch(proxyUrl + encodeURIComponent(rssUrl))
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(str => new DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      const items = data.querySelectorAll("item");
      
      if (items.length === 0) {
        rssFeedContainer.innerHTML = '<p>Không có bài viết nào.</p>';
        return;
      }
      
      let feedHTML = '';
      
      items.forEach((item, index) => {
        const title = item.querySelector("title").textContent;
        const encoded = item.querySelector("encoded").textContent;
        const pubDate = item.querySelector("pubDate").textContent;
        const creator = item.querySelector("creator").textContent;
        
        // Format date
        const formattedDate = formatDate(pubDate);
        
        // Get author info
        const authorInfo = getAuthorInfo(creator);
        
        feedHTML += `
          <div class="feed-item" id="feed-${index}">
            <div class="feed-header">
              <div class="feed-author">
                <img src="${authorInfo.avatar}" alt="${authorInfo.name}" class="author-avatar">
                <div class="author-info">
                  <div class="author-name">${authorInfo.name}</div>
                  <div class="post-date">${formattedDate}</div>
                </div>
              </div>
              <button class="btn-icon share-btn" data-id="feed-${index}">
                <i class="fas fa-share-alt"></i>
              </button>
            </div>
            <div class="feed-content">
              <h3>${title}</h3>
              <div class="feed-body">${encoded}</div>
            </div>
          </div>
        `;
      });
      
      rssFeedContainer.innerHTML = feedHTML;
      
      // Initialize video elements
      initVideoElements();
      
      // Initialize share buttons
      initShareButtons();
      
      // Initialize code copy buttons
      initCodeCopyButtons();
    })
    .catch(error => {
      console.error('Error loading RSS feed:', error);
      rssFeedContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i>
          <p>Không thể tải bài viết. Vui lòng thử lại sau.</p>
        </div>
        <button class="btn btn-primary" id="retry-feed">Thử lại</button>
      `;
      
      document.getElementById('retry-feed').addEventListener('click', loadRssFeed);
    });
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes <= 0 ? 'Vừa xong' : `${diffMinutes} phút trước`;
    }
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    const daysOfWeek = ["Chủ Nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `${dayOfWeek}. ${day}/${month}/${year}`;
  }
}

// Get author information
function getAuthorInfo(creator) {
  if (creator === 'HunqD') {
    return {
      name: 'Đinh Mạnh Hùng',
      avatar: 'https://graph.facebook.com/100045640179308/picture?type=large&amp;access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662'
    };
  } else {
    return {
      name: creator || 'Không rõ',
      avatar: '/DATA/Logo/logo.png'
    };
  }
}

// Initialize video elements
function initVideoElements() {
  const videos = document.querySelectorAll('video');
  
  videos.forEach(video => {
    // Add playsinline attribute for better mobile experience
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('playsinline', '');
    
    // Add click event to play/pause
    video.addEventListener('click', function() {
      // Pause all other videos
      videos.forEach(otherVideo => {
        if (otherVideo !== video) {
          otherVideo.pause();
        }
      });
      
      // Toggle play/pause for clicked video
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  });
}

// Initialize share buttons
function initShareButtons() {
  const shareButtons = document.querySelectorAll('.share-btn');
  
  shareButtons.forEach(button => {
    button.addEventListener('click', function() {
      const feedId = button.dataset.id;
      const currentUrl = window.location.href.split('#')[0];
      const shareUrl = `${currentUrl}#${feedId}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Chesino Auto Windows',
          text: 'Xem bài viết này trên Chesino Auto Windows',
          url: shareUrl
        })
          .then(() => console.log('Chia sẻ thành công'))
          .catch(error => console.error('Lỗi chia sẻ:', error));
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            showNotification('Đã sao chép liên kết vào clipboard');
          })
          .catch(err => {
            console.error('Không thể sao chép: ', err);
            showNotification('Không thể sao chép liên kết', 'error');
          });
      }
    });
  });
}

// Initialize code copy buttons
function initCodeCopyButtons() {
  const blockquotes = document.querySelectorAll('.feed-body blockquote');

  blockquotes.forEach(blockquote => {
    const blockquoteDIV = document.createElement('div');
    blockquoteDIV.classList.add('blockquoteDIV');

    const container = document.createElement('div');
    container.classList.add('copy-container');

    const copyButton = document.createElement('button');
    copyButton.classList.add('btn', 'btn-secondary');
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';

    copyButton.addEventListener('click', () => {
      const textToCopy = blockquote.textContent;

      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          showNotification('Đã sao chép vào clipboard');
        })
        .catch(err => {
          console.error('Không thể sao chép: ', err);
          showNotification('Không thể sao chép văn bản', 'error');
        });
    });

    container.appendChild(copyButton);
    blockquoteDIV.appendChild(blockquote.cloneNode(true)); // Sao chép blockquote để giữ nguyên
    blockquoteDIV.appendChild(container);

    blockquote.parentNode.replaceChild(blockquoteDIV, blockquote); // Thay thế blockquote bằng blockquoteDIV
  });
}


// Initialize image modal functionality
function initImageModal() {
  // Get all images in the content
  const contentImages = document.querySelectorAll('.image-container img');
  
  contentImages.forEach(img => {
    img.addEventListener('click', function() {
      openModal(img.src);
    });
  });
  
  // Close modal when clicking outside the image
  modalContainer.addEventListener('click', function(e) {
    if (e.target === modalContainer) {
      closeModal();
    }
  });
}

// Open image modal
function openModal(imageSrc) {
  modalImage.src = imageSrc;
  modalContainer.classList.add('active');
  
  // Prevent body scrolling when modal is open
  document.body.style.overflow = 'hidden';
}

// Close image modal
function closeModal() {
  modalContainer.classList.remove('active');
  
  // Re-enable body scrolling
  document.body.style.overflow = '';
}

// Show notification using SweetAlert2
function showNotification(message, type = 'success') {
  if (typeof Swal !== 'undefined') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    
    Toast.fire({
      icon: type,
      title: message
    });
  } else {
    // Fallback if SweetAlert2 is not available
    alert(message);
  }
}

// Add CSS class for search highlighting
const style = document.createElement('style');
style.textContent = `
 
`;

document.head.appendChild(style);
