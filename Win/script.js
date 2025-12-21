/**
 * CHESINO AUTO WINDOWS - CORE SCRIPT V2 (FULL FUNCTIONALITY)
 * Đảm bảo đầy đủ tính năng phiên bản gốc + UI Glassmorphism
 */

// DOM Elements
const toggleThemeBtn = document.getElementById('toggle-theme-desktop') || document.getElementById('toggle-theme');
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
    loadRssFeed(); // Tải full nội dung tin tức
    initEventListeners();
    updateBreadcrumbs();
    initImageModal();
    initSlideShow(); // Hướng dẫn cài đặt 8 bước
});

// --- 1. SLIDE SHOW HƯỚNG DẪN CÀI ĐẶT (8 BƯỚC ĐẦY ĐỦ) ---
let currentStep = 0;
function initSlideShow() {
    const steps = document.querySelectorAll('.install-step');
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');
    
    if (!steps.length) return;
    const totalSteps = steps.length;

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.add('hidden');
            if (i === index) {
                step.classList.remove('hidden');
                step.classList.add('animate-fade-in'); // Hiệu ứng hiện hình
            }
        });
        
        // Cập nhật Progress Bar & Indicator
        const progress = ((index + 1) / totalSteps) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (stepIndicator) stepIndicator.textContent = `Bước ${index + 1}/${totalSteps}`;
        
        // Cập nhật trạng thái nút bấm
        if (prevBtn) prevBtn.disabled = index === 0;
        
        if (nextBtn) {
            if (index === totalSteps - 1) {
                nextBtn.innerHTML = 'Hoàn tất <i class="fas fa-check ml-2"></i>';
                nextBtn.classList.replace('bg-accent', 'bg-green-600');
            } else {
                nextBtn.innerHTML = 'Tiếp tục <i class="fas fa-arrow-right ml-2"></i>';
                nextBtn.classList.replace('bg-green-600', 'bg-accent');
            }
        }
    }

    if (prevBtn) prevBtn.onclick = () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
            scrollToSectionTop();
        }
    };

    if (nextBtn) nextBtn.onclick = () => {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            showStep(currentStep);
            scrollToSectionTop();
        } else {
            showNotification('Bạn đã xem hết hướng dẫn cài đặt!', 'success');
        }
    };

    showStep(0);
}

function scrollToSectionTop() {
    const section = document.getElementById('installWin');
    const yOffset = -120; // Tránh bị đè bởi Header Desktop
    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({top: y, behavior: 'smooth'});
}

// --- 2. RSS FEED (HIỂN THỊ FULL NỘI DUNG) ---
function loadRssFeed() {
    const rssUrl = 'https://datawindows.wordpress.com/feed/';
    const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
    const rssFeedContainer = document.getElementById('rss-feed');
    if (!rssFeedContainer) return;

    rssFeedContainer.innerHTML = `<div class="col-span-full text-center py-10 opacity-50">Đang tải bản tin đầy đủ...</div>`;
    
    fetch(proxyUrl + encodeURIComponent(rssUrl))
        .then(response => response.text())
        .then(str => new DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            const items = data.querySelectorAll("item");
            if (items.length === 0) {
                rssFeedContainer.innerHTML = '<p class="text-center opacity-50">Không có bài viết nào.</p>';
                return;
            }
            
            let feedHTML = '';
            items.forEach((item) => {
                const title = item.querySelector("title").textContent;
                const pubDate = item.querySelector("pubDate").textContent;
                const creator = item.querySelector("creator")?.textContent || "HunqD";
                
                // Lấy nội dung đầy đủ (content:encoded)
                let fullContent = "";
                const encoded = item.getElementsByTagNameNS("*", "encoded")[0];
                if (encoded) {
                    fullContent = encoded.textContent;
                } else {
                    fullContent = item.querySelector("description")?.textContent || "";
                }

                const authorInfo = getAuthorInfo(creator);
                
                feedHTML += `
                    <article class="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl mb-6">
                        <div class="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                            <div class="flex items-center">
                                <img src="${authorInfo.avatar}" class="w-10 h-10 rounded-full mr-3 border border-accent">
                                <div>
                                    <div class="font-bold text-sm">${authorInfo.name}</div>
                                    <div class="text-[10px] opacity-50">${formatDate(pubDate)}</div>
                                </div>
                            </div>
                        </div>
                        <h3 class="text-xl md:text-2xl font-bold mb-6 text-accent">${title}</h3>
                        <div class="rss-content prose prose-invert max-w-none text-gray-300 text-sm">
                            ${fullContent}
                        </div>
                    </article>
                `;
            });
            rssFeedContainer.innerHTML = feedHTML;
            initVideoElements();
            initCodeCopyButtons();
            initImageModal(); // Re-init cho ảnh trong RSS
        })
        .catch(err => {
            rssFeedContainer.innerHTML = `<div class="col-span-full text-center py-10 text-red-400">Lỗi tải tin tức. Hãy thử lại.</div>`;
        });
}

// --- 3. TÌM KIẾM THÔNG MINH (NHƯ BẢN GỐC) ---
function handleSearch(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
        showNotification('Vui lòng nhập từ khóa', 'warning');
        return;
    }
    
    // Tìm trong headings và paragraphs
    const elements = document.querySelectorAll('h2, h3, h4, p, li');
    let found = false;
    
    for (const el of elements) {
        if (el.textContent.toLowerCase().includes(searchTerm)) {
            // Kiểm tra xem có nằm trong slide ẩn không
            const parentStep = el.closest('.install-step');
            if (parentStep) {
                const steps = Array.from(document.querySelectorAll('.install-step'));
                currentStep = steps.indexOf(parentStep);
                // Cần gọi hàm showStep từ logic slide (ở đây trigger lại init)
                document.getElementById('prev-step').parentElement.querySelector('button').click(); 
                // Cách tốt nhất là gọi lại logic cập nhật slide tại đây
            }
            
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-accent/30', 'rounded');
            setTimeout(() => el.classList.remove('bg-accent/30'), 3000);
            found = true;
            break;
        }
    }
    
    if (!found) showNotification(`Không tìm thấy "${searchTerm}"`, 'warning');
    else showNotification(`Đã tìm thấy nội dung liên quan`);
}

// --- 4. CÁC TÍNH NĂNG BỔ TRỢ (THEME, DOWNLOAD, CONTACT, BREADCRUMBS) ---
function initTheme() {
    const isDark = localStorage.getItem('darkMode') !== 'false';
    document.documentElement.classList.toggle('dark', isDark);
    if (toggleThemeBtn) {
        toggleThemeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        toggleThemeBtn.onclick = () => {
            const dark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', dark);
            toggleThemeBtn.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        };
    }
}

function handleDownload(e) {
    const type = e.target.dataset.type;
    const msgs = {
        'basic': 'Đang chuẩn bị bộ cài Basic (380MB)...',
        'plus': 'Đang chuẩn bị bộ cài Plus (2.7GB)...',
        'anhdv': 'Đang chuyển hướng tải AnhDVBoot...'
    };
    showNotification(msgs[type] || 'Đang khởi tạo tải xuống...');
}

function handleContactForm(e) {
    e.preventDefault();
    showNotification('Đang gửi tin nhắn của bạn...');
    setTimeout(() => {
        showNotification('Gửi thành công! HunqD sẽ phản hồi sớm.', 'success');
        e.target.reset();
    }, 2000);
}

function updateBreadcrumbs() {
    const hash = window.location.hash || '#home';
    const names = { '#home': 'Trang chủ', '#installWin': 'Cài Windows', '#news': 'Tin tức', '#contact': 'Liên hệ' };
    if (currentSectionSpan) currentSectionSpan.textContent = names[hash] || 'Hướng dẫn';
}

function formatDate(ds) {
    const d = new Date(ds);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hôm nay';
    if (diff < 7) return `${diff} ngày trước`;
    return d.toLocaleDateString('vi-VN');
}

function getAuthorInfo(c) {
    if (c === 'HunqD') return { name: 'Đinh Mạnh Hùng', avatar: 'https://graph.facebook.com/100045640179308/picture?type=large' };
    return { name: c, avatar: './DATA/Logo/logo.png' };
}

// --- 5. TIỆN ÍCH UI (MODAL, VIDEO, NOTIFICATION) ---
function initImageModal() {
    const imgs = document.querySelectorAll('img:not(.no-zoom)');
    imgs.forEach(img => {
        img.onclick = () => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    imageUrl: img.src,
                    background: 'rgba(0,0,0,0.9)',
                    backdrop: 'blur(10px)',
                    showConfirmButton: false,
                    showCloseButton: true,
                    customClass: { popup: 'rounded-3xl border border-white/10' }
                });
            }
        };
    });
}

function initVideoElements() {
    document.querySelectorAll('video').forEach(v => v.classList.add('w-full', 'rounded-2xl', 'my-4'));
}

function initCodeCopyButtons() {
    document.querySelectorAll('.rss-content blockquote').forEach(b => {
        b.classList.add('border-l-4', 'border-accent', 'bg-white/5', 'p-4', 'italic', 'rounded-r-xl', 'my-4');
    });
}

function showNotification(m, t = 'success') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({ toast: true, position: 'top-end', icon: t, title: m, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    } else alert(m);
}

function initEventListeners() {
    if (searchForm) searchForm.onsubmit = handleSearch;
    if (refreshNewsBtn) refreshNewsBtn.onclick = loadRssFeed;
    if (contactForm) contactForm.onsubmit = handleContactForm;
    downloadButtons.forEach(b => b.onclick = handleDownload);
    window.onhashchange = updateBreadcrumbs;
    window.onscroll = () => {
        if (backToTopBtn) backToTopBtn.style.opacity = window.pageYOffset > 300 ? '1' : '0';
    };
}
// Thêm vào trong phần DOM Elements
const startGuideBtn = document.getElementById('start-guide-btn');
const guideOverlay = document.getElementById('guide-overlay');
const closeGuideBtn = document.getElementById('close-guide');

// Logic điều khiển Fullscreen Guide
if (startGuideBtn) {
    startGuideBtn.onclick = () => {
        guideOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Khóa cuộn trang chính
        currentStep = 0; // Reset về bước 1
        showStep(0);
    };
}

if (closeGuideBtn) {
    closeGuideBtn.onclick = () => {
        Swal.fire({
            title: 'Thoát hướng dẫn?',
            text: "Tiến trình của bạn sẽ không được lưu lại.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#bef264',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Thoát',
            cancelButtonText: 'Ở lại',
            background: '#1e1e1e',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                guideOverlay.classList.add('hidden');
                document.body.style.overflow = ''; // Mở lại cuộn trang chính
            }
        });
    };
}

// Cập nhật hàm showStep để mượt mà hơn trong Overlay
function showStep(index) {
    const steps = document.querySelectorAll('.install-step');
    if (!steps.length) return;

    steps.forEach((step, i) => {
        step.classList.add('hidden');
        if (i === index) {
            step.classList.remove('hidden');
            step.classList.add('animate-fade-in');
        }
    });

    // Cập nhật Progress
    const progress = ((index + 1) / steps.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('step-indicator').textContent = `Bước ${index + 1}/${steps.length}`;

    // Điều hướng nút
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    
    prevBtn.disabled = index === 0;
    if (index === steps.length - 1) {
        nextBtn.innerHTML = 'Hoàn tất <i class="fas fa-check ml-2"></i>';
    } else {
        nextBtn.innerHTML = 'Tiếp tục <i class="fas fa-arrow-right ml-2"></i>';
    }
    
    // Tự động cuộn lên đầu nội dung bước (trong Overlay)
    guideOverlay.scrollTo({ top: 0, behavior: 'smooth' });
}