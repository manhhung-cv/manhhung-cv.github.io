import { CATEGORIES as CONFIG_CATEGORIES, TOOLS } from './config.js';
import { UI } from './ui.js';

const appContent = document.getElementById('app-content');
const breadcrumbsNav = document.getElementById('breadcrumbs');

// ==========================================
// 0. TỰ ĐỘNG KHỞI TẠO DANH MỤC TỪ TOOLS
// ==========================================
// Clone mảng CATEGORIES từ config để có thể tự động bổ sung
const CATEGORIES = [...CONFIG_CATEGORIES];
const existingCatIds = CATEGORIES.map(c => c.id);

// Duyệt qua tất cả công cụ, nếu thấy catId mới thì tự động tạo danh mục
TOOLS.forEach(tool => {
    if (!existingCatIds.includes(tool.catId)) {
        CATEGORIES.push({
            id: tool.catId,
            name: tool.catId.charAt(0).toUpperCase() + tool.catId.slice(1), // Viết hoa chữ đầu (vd: 'finance' -> 'Finance')
            icon: 'fas fa-folder', // Icon mặc định cho danh mục mới
            desc: 'Danh mục tự động sinh'
        });
        existingCatIds.push(tool.catId);
    }
});

// ==========================================
// 1. QUẢN LÝ GIAO DIỆN (THEME SÁNG/TỐI)
// ==========================================
const themes = ['system', 'light', 'dark'];
const themeIcons = { 'system': 'fa-desktop', 'light': 'fa-sun', 'dark': 'fa-moon' };
let currentThemeIndex = themes.indexOf(localStorage.getItem('theme') || 'system');

function applyTheme(theme) {
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    document.getElementById('theme-toggle').innerHTML = `<i class="fas ${themeIcons[theme]}"></i>`;
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
});

// Lắng nghe hệ điều hành đổi màu
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themes[currentThemeIndex] === 'system') applyTheme('system');
});
applyTheme(themes[currentThemeIndex]); // Khởi chạy theme lúc đầu


// ==========================================
// 2. HỆ THỐNG ROUTER (ĐIỀU HƯỚNG & LAZY LOAD)
// ==========================================
async function handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [type, id] = hash.split('/'); // Tách loại (c: category, t: tool) và ID

    // Hiệu ứng loading tối giản
    appContent.innerHTML = '<div style="color: var(--text-mut); margin-top: 40px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-circle-notch fa-spin"></i> Đang tải...</div>';

   try {
        if (!type || hash === 'home') {
            renderBreadcrumbs([]);
            renderHome(); 
        } else if (type === 'c') {
            const category = CATEGORIES.find(c => c.id === id);
            if (!category) throw new Error('Không tìm thấy danh mục');

            renderBreadcrumbs([{ name: category.name, link: `#c/${id}` }]);
            renderCategoryTools(id, category.name);
        } else if (type === 't') {
            const tool = TOOLS.find(t => t.id === id);
            if (!tool) throw new Error('Không tìm thấy công cụ');

            const category = CATEGORIES.find(c => c.id === tool.catId);
            renderBreadcrumbs([
                { name: category.name, link: `#c/${category.id}` },
                { name: tool.name, link: null }
            ]);

            // Tải động file JS của công cụ tương ứng
            const module = await import(`../tools/${id}/index.js`);
            appContent.innerHTML = module.template();
            if (module.init) module.init();
        }
    } catch (error) {
        // Giữ lại Breadcrumbs để người dùng không bị mất phương hướng
        renderBreadcrumbs([{ name: 'Lỗi 404', link: null }]);
        
        appContent.innerHTML = `
            <div class="card" style="border-color: var(--text-main); margin-top: 40px;">
                <h1 class="h1"><i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i> Lỗi 404</h1>
                <p class="text-mut">${error.message}</p>
                <a href="#home" class="btn btn-outline" style="margin-top: 16px;">Về trang chủ</a>
            </div>`;
    }
}

function renderBreadcrumbs(pathArray) {
    if (pathArray.length === 0) {
        breadcrumbsNav.innerHTML = '';
        return;
    }
    let html = `<a href="#home"><i class="fas fa-home"></i></a>`;
    pathArray.forEach(item => {
        html += `/`;
        if (item.link) html += `<a href="${item.link}">${item.name}</a>`;
        else html += `<span style="color: var(--text-main); font-weight: 500;">${item.name}</span>`;
    });
    breadcrumbsNav.innerHTML = html;
}

// Render Giao diện Trang chủ (Danh mục & Tất cả công cụ)
function renderHome() {
    let html = `
        <div class="h1" style="margin-bottom: 16px;">Khám phá công cụ</div>
        
        <div class="tabs" id="home-tabs">
            <button class="tab-btn active" data-target="tab-all-tools">Tất cả công cụ (${TOOLS.length})</button>
            <button class="tab-btn" data-target="tab-categories">Danh mục</button>
        </div>

        <div class="tab-pane" id="tab-categories">
            <div class="bento-grid">
    `;

    // Render Danh mục (Tab 1) - Bây giờ CATEGORIES đã bao gồm cả các mục tự sinh
    CATEGORIES.forEach(cat => {
        const toolCount = TOOLS.filter(t => t.catId === cat.id).length;
        html += `
            <a href="#c/${cat.id}" class="tool-card">
                <i class="${cat.icon}" style="font-size: 1.8rem; color: var(--text-main); margin-bottom: 8px;"></i>
                <h3>${cat.name}</h3>
                <p>${cat.desc}</p>
                <span class="badge" style="margin-top: auto; align-self: flex-start;">${toolCount} công cụ</span>
            </a>
        `;
    });

    html += `
            </div>
        </div>

        <div class="tab-pane active" id="tab-all-tools">
            <div class="bento-grid">
    `;

    // 1. Lấy danh sách yêu thích từ LocalStorage
    const favs = JSON.parse(localStorage.getItem('favTools') || '[]');

    // 2. Sắp xếp mảng TOOLS: công cụ nào được yêu thích (có trong favs) thì đưa lên đầu
    const sortedTools = [...TOOLS].sort((a, b) => {
        const aFav = favs.includes(a.id) ? 1 : 0;
        const bFav = favs.includes(b.id) ? 1 : 0;
        return bFav - aFav; 
    });

    // 3. Render Tất cả công cụ đã sắp xếp (Tab 2)
    sortedTools.forEach(tool => {
        const isFav = favs.includes(tool.id);
        html += `
            <a href="#t/${tool.id}" class="tool-card">
                <div class="flex-between" style="margin-bottom: 8px;">
                    <div class="flex-row">
                        <i class="${tool.icon}" style="font-size: 1.2rem; color: var(--text-main);"></i>
                        <h3>${tool.name}</h3>
                    </div>
                    <span class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, '${tool.id}')" title="Yêu thích">
                        <i class="${isFav ? 'fas' : 'far'} fa-star"></i>
                    </span>
                </div>
                <p>${tool.desc}</p>
            </a>
        `;
    });

    html += `
            </div>
        </div>
    `;

    appContent.innerHTML = html;

    // Logic xử lý khi click chuyển Tab
    const tabBtns = document.querySelectorAll('#home-tabs .tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#home-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#app-content .tab-pane').forEach(p => p.classList.remove('active'));

            const targetId = e.target.getAttribute('data-target');
            e.target.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Render danh sách công cụ trong một danh mục
function renderCategoryTools(catId, catName) {
    const catTools = TOOLS.filter(t => t.catId === catId);
    let html = `
        <div style="margin-bottom: 24px;">
            <div class="h1">${catName}</div>
            <p class="text-mut">Chọn công cụ bên dưới để bắt đầu</p>
        </div>
        <div class="bento-grid">`;

    if (catTools.length === 0) {
        html += `<p class="text-mut">Chưa có công cụ nào trong danh mục này.</p>`;
    } else {
        const favs = JSON.parse(localStorage.getItem('favTools') || '[]');
        
        const sortedCatTools = [...catTools].sort((a, b) => {
            const aFav = favs.includes(a.id) ? 1 : 0;
            const bFav = favs.includes(b.id) ? 1 : 0;
            return bFav - aFav;
        });

        sortedCatTools.forEach(tool => {
            const isFav = favs.includes(tool.id);
            html += `
                <a href="#t/${tool.id}" class="tool-card">
                    <div class="flex-between" style="margin-bottom: 8px;">
                        <div class="flex-row">
                            <i class="${tool.icon}" style="font-size: 1.2rem; color: var(--text-main);"></i>
                            <h3>${tool.name}</h3>
                        </div>
                        <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, '${tool.id}')">
                            <i class="${isFav ? 'fas' : 'far'} fa-star"></i>
                        </button>
                    </div>
                    <p>${tool.desc}</p>
                </a>
            `;
        });
    }
    appContent.innerHTML = html + `</div>`;
}


// ==========================================
// 3. LOGIC COMMAND PALETTE (TÌM KIẾM NHANH)
// ==========================================
const cmdPalette = document.getElementById('cmd-palette');
const cmdInput = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');
const shortcutHint = document.getElementById('shortcut-hint');

// Nhận diện hệ điều hành để hiển thị phím tắt
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.includes('Mac');
if (shortcutHint) {
    shortcutHint.textContent = isMac ? '⌘/' : 'Ctrl F';
}

function toggleCmd() {
    cmdPalette.classList.toggle('hidden');
    if (!cmdPalette.classList.contains('hidden')) {
        cmdInput.focus();
        cmdInput.value = '';
        renderCmdResults(TOOLS); 
    }
}

function renderCmdResults(results) {
    if (results.length === 0) {
        cmdResults.innerHTML = `<li style="padding: 16px; text-align: center; color: var(--text-mut);">Không tìm thấy công cụ nào</li>`;
        return;
    }
    cmdResults.innerHTML = results.map(tool => `
        <li class="cmd-item">
            <a href="#t/${tool.id}" onclick="document.getElementById('cmd-palette').classList.add('hidden')">
                <i class="${tool.icon}" style="width: 24px; color: var(--text-mut);"></i>
                <span>${tool.name}</span>
            </a>
        </li>
    `).join('');
}

// Lọc kết quả khi gõ phím
cmdInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = TOOLS.filter(t => t.name.toLowerCase().includes(keyword));
    renderCmdResults(filtered);
});

// Đóng khi click ra ngoài vùng nền mờ
cmdPalette.addEventListener('click', (e) => {
    if (e.target === cmdPalette) {
        toggleCmd();
    }
});

// Xử lý phím tắt
document.addEventListener('keydown', (e) => {
    const isModifier = e.ctrlKey || e.metaKey;
    const isKeyMatch = e.key.toLowerCase() === 'f' || e.key === '/';

    if (isModifier && isKeyMatch) {
        e.preventDefault(); 
        toggleCmd();
    }

    if (e.key === 'Escape' && !cmdPalette.classList.contains('hidden')) {
        toggleCmd();
    }
});

document.getElementById('open-cmd').addEventListener('click', toggleCmd);
document.getElementById('close-cmd').addEventListener('click', toggleCmd);

// Khởi chạy Router lần đầu khi load trang và lắng nghe thay đổi URL
window.addEventListener('hashchange', handleRoute);
handleRoute();

// ==========================================
// QUẢN LÝ YÊU THÍCH (FAVORITES)
// ==========================================
window.toggleFavorite = function(e, toolId) {
    e.preventDefault();   
    e.stopPropagation();  

    let favs = JSON.parse(localStorage.getItem('favTools') || '[]');
    let isAdded = false;
    
    const tool = TOOLS.find(t => t.id === toolId);
    const toolName = tool ? tool.name : 'Công cụ';

    if (favs.includes(toolId)) {
        favs = favs.filter(id => id !== toolId);
        isAdded = false;
    } else {
        favs.push(toolId);
        isAdded = true;
    }
    
    localStorage.setItem('favTools', JSON.stringify(favs));
    
    if (isAdded) {
        UI.showAlert('Đã yêu thích', `Đã thêm <b>${toolName}</b> lên đầu danh sách.`, 'success');
    } else {
        UI.showAlert('Bỏ yêu thích', `Đã xóa <b>${toolName}</b> khỏi danh sách yêu thích.`, 'info');
    }

    handleRoute(); 
};