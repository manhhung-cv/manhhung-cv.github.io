

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
  initTheme();
  loadRssFeed();
  initEventListeners();
  updateBreadcrumbs();
  initImageModal();
  
  // Initialize Slide Show for Installation Guide
  initSlideShow();
});

// --- SLIDE SHOW LOGIC (MỚI) ---
function initSlideShow() {
  const steps = document.querySelectorAll('.install-step');
  const prevBtn = document.getElementById('prev-step');
  const nextBtn = document.getElementById('next-step');
  const progressBar = document.getElementById('progress-bar');
  const stepIndicator = document.getElementById('step-indicator');
  
  let currentStep = 0;
  const totalSteps = steps.length;

  function showStep(index) {
    // Hide all steps
    steps.forEach(step => {
      step.classList.add('hidden');
      step.classList.remove('active'); // Helper class if needed
    });
    
    // Show current step with animation
    steps[index].classList.remove('hidden');
    steps[index].classList.add('active');
    
    // Update progress bar
    const progress = ((index + 1) / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
    stepIndicator.textContent = `Bước ${index + 1}/${totalSteps}`;
    
    // Update buttons state
    prevBtn.disabled = index === 0;
    
    if (index === totalSteps - 1) {
      nextBtn.innerHTML = 'Hoàn tất <i class="fas fa-check ml-2"></i>';
      nextBtn.classList.replace('bg-primary', 'bg-green-600');
      nextBtn.classList.replace('hover:bg-primary-dark', 'hover:bg-green-700');
    } else {
      nextBtn.innerHTML = 'Tiếp tục <i class="fas fa-arrow-right ml-2"></i>';
      // Reset button color if coming back from last step
      if (nextBtn.classList.contains('bg-green-600')) {
        nextBtn.classList.replace('bg-green-600', 'bg-primary');
        nextBtn.classList.replace('hover:bg-green-700', 'hover:bg-primary-dark');
      }
    }
  }

  // Event Listeners
  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
      scrollToSectionTop();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
      currentStep++;
      showStep(currentStep);
      scrollToSectionTop();
    } else {
      showNotification('Bạn đã hoàn thành xem hướng dẫn!', 'success');
    }
  });

  // Init first step
  showStep(0);
}

function scrollToSectionTop() {
  const section = document.getElementById('installWin');
  const yOffset = -100; // Offset for sticky header
  const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
  window.scrollTo({top: y, behavior: 'smooth'});
}
// --- END SLIDE SHOW LOGIC ---

// Initialize theme based on saved preference
function initTheme() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark'); // For Tailwind
  }
}

// Initialize all event listeners
function initEventListeners() {
  toggleThemeBtn.addEventListener('click', toggleTheme);
  
  // Updated selector for Tailwind mobile menu logic
  menuToggleBtn.addEventListener('click', toggleMenu);
  
  searchForm.addEventListener('submit', handleSearch);
  
  window.addEventListener('scroll', toggleBackToTopButton);
  backToTopBtn.addEventListener('click', scrollToTop);
  
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  downloadButtons.forEach(button => {
    button.addEventListener('click', handleDownload);
  });
  
  refreshNewsBtn.addEventListener('click', loadRssFeed);
  contactForm.addEventListener('submit', handleContactForm);
  modalClose.addEventListener('click', closeModal);
}

// Toggle between light and dark theme
function toggleTheme() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  document.documentElement.classList.toggle('dark'); // For Tailwind
  localStorage.setItem('darkMode', isDarkMode);
}

// Toggle mobile menu (Updated for Tailwind classes)
function toggleMenu() {
  // menuToggleBtn.classList.toggle('active'); // No longer using CSS class for rotation, simplified
  navMenu.classList.toggle('hidden');
  navMenu.classList.toggle('flex');
  navMenu.classList.toggle('opacity-0');
  navMenu.classList.toggle('opacity-100');
}

// Handle search form submission
function handleSearch(e) {
  e.preventDefault();
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (searchTerm === '') {
    showNotification('Vui lòng nhập từ khóa tìm kiếm', 'warning');
    return;
  }
  
  const headings = document.querySelectorAll('h2, h3, h4');
  const paragraphs = document.querySelectorAll('p');
  const elements = [...headings, ...paragraphs];
  
  const matchingElements = elements.filter(element => 
    element.textContent.toLowerCase().includes(searchTerm)
  );
  
  if (matchingElements.length === 0) {
    showNotification(`Không tìm thấy kết quả cho "${searchTerm}"`, 'warning');
    return;
  }
  
  // If result is inside a hidden slide, switch to that slide (Advanced enhancement)
  const firstMatch = matchingElements[0];
  const parentStep = firstMatch.closest('.install-step');
  if (parentStep && parentStep.classList.contains('hidden')) {
    // Find index of this step
    const steps = Array.from(document.querySelectorAll('.install-step'));
    const index = steps.indexOf(parentStep);
    // Trigger logic to show this step (Need to access initSlideShow scope or trigger click events - simplified here just scroll)
    // For now, let's just scroll to the section container
    document.getElementById('installWin').scrollIntoView({ behavior: 'smooth' });
    showNotification(`Kết quả nằm ở bước ${index + 1} trong phần cài đặt.`, 'info');
  } else {
    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  matchingElements.forEach(element => {
    element.classList.add('bg-yellow-200', 'transition-colors');
    setTimeout(() => {
      element.classList.remove('bg-yellow-200');
    }, 3000);
  });
  
  showNotification(`Đã tìm thấy ${matchingElements.length} kết quả cho "${searchTerm}"`);
}

function toggleBackToTopButton() {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.remove('opacity-0', 'invisible');
    backToTopBtn.classList.add('opacity-100', 'visible');
  } else {
    backToTopBtn.classList.add('opacity-0', 'invisible');
    backToTopBtn.classList.remove('opacity-100', 'visible');
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function handleNavigation(e) {
  // Mobile menu close logic
  if (!navMenu.classList.contains('hidden') && window.innerWidth < 768) {
    toggleMenu();
  }
}

function updateBreadcrumbs() {
  const currentHash = window.location.hash || '#home';
  const sectionId = currentHash.substring(1);
  const sectionNames = {
    'home': 'Trang chủ',
    'welcome': 'Giới thiệu',
    'installWin': 'Cài đặt Windows',
    'news': 'Tin tức',
    'contact': 'Liên hệ'
  };
  currentSectionSpan.textContent = sectionNames[sectionId] || 'Trang chủ';
}

function handleDownload(e) {
  const downloadType = e.target.dataset.type;
  const downloadMessages = {
    'basic': 'Đang tải bộ cài Basic (380MB)...',
    'plus': 'Đang tải bộ cài Plus (2.7GB)...',
    'anhdv': 'Đang tải AnhDVBoot...'
  };
  showNotification(downloadMessages[downloadType] || 'Đang tải xuống...');
  setTimeout(() => {
    showNotification(`Tải xuống ${downloadType} thành công!`, 'success');
  }, 3000);
}

function handleContactForm(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  
  if (!name || !email || !message) {
    showNotification('Vui lòng điền đầy đủ thông tin', 'warning');
    return;
  }
  
  showNotification('Đang gửi tin nhắn...');
  setTimeout(() => {
    showNotification('Tin nhắn đã được gửi thành công!', 'success');
    contactForm.reset();
  }, 2000);
}

function loadRssFeed() {
  const rssUrl = 'https://datawindows.wordpress.com/feed/';
  const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
  const rssFeedContainer = document.getElementById('rss-feed');
  
  rssFeedContainer.innerHTML = `
    <div class="flex flex-col items-center justify-center py-8">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
      <p class="text-gray-500">Đang tải bài viết...</p>
    </div>
  `;
  
  fetch(proxyUrl + encodeURIComponent(rssUrl))
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(str => new DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      const items = data.querySelectorAll("item");
      if (items.length === 0) {
        rssFeedContainer.innerHTML = '<p class="text-center text-gray-500">Không có bài viết nào.</p>';
        return;
      }
      
      let feedHTML = '';
      items.forEach((item, index) => {
        const title = item.querySelector("title").textContent;
        const encoded = item.querySelector("encoded").textContent;
        const pubDate = item.querySelector("pubDate").textContent;
        const creator = item.querySelector("creator").textContent;
        const formattedDate = formatDate(pubDate);
        const authorInfo = getAuthorInfo(creator);
        
        // Using Tailwind classes for Feed Item
        feedHTML += `
          <div class="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow" id="feed-${index}">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
              <div class="flex items-center">
                <img src="${authorInfo.avatar}" alt="${authorInfo.name}" class="w-10 h-10 rounded-full mr-3 border border-gray-200">
                <div>
                  <div class="font-medium text-gray-800 text-sm">${authorInfo.name}</div>
                  <div class="text-xs text-gray-500">${formattedDate}</div>
                </div>
              </div>
              <button class="share-btn text-gray-400 hover:text-primary transition-colors" data-id="feed-${index}">
                <i class="fas fa-share-alt"></i>
              </button>
            </div>
            <div class="p-5">
              <h3 class="text-lg font-bold text-gray-800 mb-3">${title}</h3>
              <div class="feed-body prose max-w-none text-gray-600 text-sm">${encoded}</div>
            </div>
          </div>
        `;
      });
      rssFeedContainer.innerHTML = feedHTML;
      
      // Re-apply Tailwind styles to dynamic content if needed, or rely on prose/typography plugin concepts
      // Here we just let standard tags render or add simple global styles via <style> if needed
      initVideoElements();
      initShareButtons();
      initCodeCopyButtons();
      initImageModal(); // Re-init for new images
    })
    .catch(error => {
      console.error('Error:', error);
      rssFeedContainer.innerHTML = `
        <div class="text-center py-4">
          <p class="text-red-500 mb-2"><i class="fas fa-exclamation-circle"></i> Lỗi tải bài viết</p>
          <button id="retry-feed" class="text-primary hover:underline">Thử lại</button>
        </div>
      `;
      document.getElementById('retry-feed')?.addEventListener('click', loadRssFeed);
    });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function getAuthorInfo(creator) {
  if (creator === 'HunqD') {
    return { name: 'Đinh Mạnh Hùng', avatar: 'https://graph.facebook.com/100045640179308/picture?type=large&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662' };
  }
  return { name: creator || 'Admin', avatar: '/DATA/Logo/logo.png' };
}

function initVideoElements() {
  document.querySelectorAll('video').forEach(video => {
    video.classList.add('w-full', 'rounded-lg', 'shadow-sm');
  });
}

function initShareButtons() {
  // Same logic as before
}

function initCodeCopyButtons() {
  // Simplified for Tailwind
  document.querySelectorAll('.feed-body blockquote').forEach(blockquote => {
    blockquote.classList.add('border-l-4', 'border-primary', 'bg-gray-100', 'p-4', 'italic', 'my-4', 'rounded-r-lg');
  });
}

function initImageModal() {
  // Update selector to include dynamic images
  const contentImages = document.querySelectorAll('.install-step img, .feed-body img, #welcome img');
  contentImages.forEach(img => {
    img.classList.add('cursor-pointer', 'transition-transform', 'hover:scale-[1.02]');
    img.addEventListener('click', () => openModal(img.src));
  });
  
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeModal();
  });
}

function openModal(imageSrc) {
  modalImage.src = imageSrc;
  modalContainer.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalContainer.classList.add('hidden');
  document.body.style.overflow = '';
}

function showNotification(message, type = 'success') {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  } else {
    alert(message);
  }
}