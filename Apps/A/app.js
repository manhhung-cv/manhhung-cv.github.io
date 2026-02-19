const loadedTools = {};
const appContent = document.getElementById('app-content');
const loader = document.getElementById('loader');

// Elements cho Menu & Search
const navButtons = document.querySelectorAll('#nav-menu button');
const menuItems = document.querySelectorAll('#nav-menu li');
const searchInput = document.getElementById('tool-search');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileSearchBtn = document.getElementById('mobile-search-btn');

// --- 1. CHỨC NĂNG TÌM KIẾM NHANH ---
searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    
    menuItems.forEach(li => {
        // Lấy text trong button (bỏ qua icon)
        const text = li.textContent.toLowerCase();
        if (text.includes(keyword)) {
            li.style.display = 'block';
        } else {
            li.style.display = 'none';
        }
    });
});

// --- 2. CHỨC NĂNG OFF-CANVAS MENU (MOBILE) ---
function toggleMenu() {
    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        // Tự động focus vào ô tìm kiếm khi mở menu trên mobile
        setTimeout(() => searchInput.focus(), 300);
    }
}

// Lắng nghe sự kiện bật/tắt menu trên mobile
if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
if(mobileSearchBtn) mobileSearchBtn.addEventListener('click', toggleMenu);
// Bấm ra ngoài mờ đen sẽ tự động đóng menu
if(overlay) overlay.addEventListener('click', toggleMenu);


// --- 3. CHỨC NĂNG TẢI CÔNG CỤ (LAZY LOAD) ---
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const toolName = btn.getAttribute('data-tool');
        
        // Đổi màu menu active
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Đóng sidebar tự động nếu đang dùng Mobile
        if (window.innerWidth <= 768) {
            toggleMenu();
        }

        loadTool(toolName);
    });
});

function loadTool(toolName) {
    appContent.innerHTML = ''; 
    loader.classList.remove('hidden');

    if (loadedTools[toolName]) {
        setTimeout(() => {
            window[`render_${toolName}`](appContent);
            loader.classList.add('hidden');
        }, 150);
    } else {
        const script = document.createElement('script');
        script.src = `tools/${toolName}.js`;
        
        script.onload = () => {
            loadedTools[toolName] = true;
            if (typeof window[`render_${toolName}`] === 'function') {
                setTimeout(() => {
                    window[`render_${toolName}`](appContent);
                    loader.classList.add('hidden');
                }, 150);
            } else {
                appContent.innerHTML = `<p style="color:red; text-align:center;">Lỗi: Không tìm thấy hàm render cho ${toolName}.</p>`;
                loader.classList.add('hidden');
            }
        };

        script.onerror = () => {
            appContent.innerHTML = `<p style="color:red; text-align:center;">Lỗi: File JS ${toolName}.js chưa tồn tại.</p>`;
            loader.classList.add('hidden');
        };

        document.body.appendChild(script);
    }
}