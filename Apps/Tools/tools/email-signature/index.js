import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Tạo Chữ ký Email</h2>
                    <p class="text-sm text-zinc-500 mt-1">Thiết kế chữ ký chuẩn Minimal Premium cho Gmail, Outlook.</p>
                </div>
                <button id="btn-es-reset" class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center shadow-sm" title="Khôi phục mặc định">
                    <i class="fas fa-undo-alt text-sm"></i>
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <div class="lg:col-span-5 premium-card bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col overflow-hidden relative">
                    
                    <div class="flex items-center border-b border-zinc-100 dark:border-zinc-800 p-2 gap-1 bg-zinc-50/50 dark:bg-zinc-950/30">
                        <button class="es-tab-btn active flex-1 py-2 text-[13px] font-bold rounded-xl text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-sm transition-all border border-zinc-200/50 dark:border-zinc-700/50" data-tab="es-info">
                            Thông tin
                        </button>
                        <button class="es-tab-btn flex-1 py-2 text-[13px] font-medium rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all border border-transparent" data-tab="es-links">
                            Liên kết
                        </button>
                        <button class="es-tab-btn flex-1 py-2 text-[13px] font-medium rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all border border-transparent" data-tab="es-design">
                            Thiết kế
                        </button>
                    </div>

                    <div class="p-5 sm:p-6">
                        
                        <div id="es-info" class="es-tab-content space-y-4 block">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Họ & Tên</label>
                                    <input type="text" id="es-in-name" class="es-input w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-semibold text-zinc-900 dark:text-white">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Chức vụ</label>
                                    <input type="text" id="es-in-title" class="es-input w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-medium text-zinc-900 dark:text-white">
                                </div>
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Công ty / Tổ chức</label>
                                <input type="text" id="es-in-company" class="es-input w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-medium text-zinc-900 dark:text-white">
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Điện thoại</label>
                                    <input type="tel" id="es-in-phone" class="es-input w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-medium text-zinc-900 dark:text-white">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email</label>
                                    <input type="email" id="es-in-email" class="es-input w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-medium text-zinc-900 dark:text-white">
                                </div>
                            </div>
                        </div>

                        <div id="es-links" class="es-tab-content space-y-4 hidden animate-in fade-in slide-in-from-bottom-2">
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Link Avatar (Hình ảnh)</label>
                                <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all">
                                    <i class="fas fa-image text-zinc-400 text-xs w-5 text-center"></i>
                                    <input type="url" id="es-in-avatar" class="es-input flex-1 bg-transparent border-none px-2 py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="https://...">
                                </div>
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Website / Portfolio</label>
                                <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all">
                                    <i class="fas fa-globe text-zinc-400 text-xs w-5 text-center"></i>
                                    <input type="url" id="es-in-website" class="es-input flex-1 bg-transparent border-none px-2 py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="https://hunq.online">
                                </div>
                            </div>
                            
                            <hr class="border-zinc-200 dark:border-zinc-800 my-4">

                            <div class="space-y-3">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Mạng xã hội (Bật/Tắt qua Link)</label>
                                
                                <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                                    <i class="fab fa-facebook text-zinc-400 text-sm w-5 text-center"></i>
                                    <input type="url" id="es-in-fb" class="es-input flex-1 bg-transparent border-none px-2 py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="Link Facebook">
                                </div>
                                
                                <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all">
                                    <i class="fab fa-twitter text-zinc-400 text-sm w-5 text-center"></i>
                                    <input type="url" id="es-in-x" class="es-input flex-1 bg-transparent border-none px-2 py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="Link X (Twitter)">
                                </div>

                                <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-600/50 transition-all">
                                    <i class="fab fa-linkedin text-zinc-400 text-sm w-5 text-center"></i>
                                    <input type="url" id="es-in-li" class="es-input flex-1 bg-transparent border-none px-2 py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="Link LinkedIn">
                                </div>

                                <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-pink-500/50 transition-all">
                                    <i class="fab fa-tiktok text-zinc-400 text-sm w-5 text-center"></i>
                                    <input type="url" id="es-in-tk" class="es-input flex-1 bg-transparent border-none px-2 py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="Link TikTok">
                                </div>

                                <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all">
                                    <i class="fab fa-github text-zinc-400 text-sm w-5 text-center"></i>
                                    <input type="url" id="es-in-gh" class="es-input flex-1 bg-transparent border-none px-2 py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="Link GitHub">
                                </div>

                                <div class="flex items-center gap-2">
                                    <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all w-1/3">
                                        <input type="text" id="es-in-other-name" class="es-input w-full bg-transparent border-none py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="Vd: Zalo">
                                    </div>
                                    <div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all flex-1">
                                        <i class="fas fa-link text-zinc-400 text-xs w-5 text-center"></i>
                                        <input type="url" id="es-in-other-url" class="es-input flex-1 bg-transparent border-none px-2 py-2.5 outline-none text-sm font-medium text-zinc-900 dark:text-white" placeholder="URL nền tảng khác">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="es-design" class="es-tab-content space-y-6 hidden animate-in fade-in slide-in-from-bottom-2">
                            <div class="space-y-3">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Màu Điểm Nhấn (Accent Color)</label>
                                <div class="flex flex-wrap gap-3">
                                    <button class="es-color-btn w-8 h-8 rounded-full shadow-sm ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900 transition-all" style="background-color: #09090b;" data-color="#09090b"></button>
                                    <button class="es-color-btn w-8 h-8 rounded-full shadow-sm transition-all" style="background-color: #2563eb;" data-color="#2563eb"></button>
                                    <button class="es-color-btn w-8 h-8 rounded-full shadow-sm transition-all" style="background-color: #059669;" data-color="#059669"></button>
                                    <button class="es-color-btn w-8 h-8 rounded-full shadow-sm transition-all" style="background-color: #ea580c;" data-color="#ea580c"></button>
                                    <div class="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm ml-2">
                                        <input type="color" id="es-custom-color" class="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" value="#09090b" title="Chọn màu tùy chỉnh">
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Mẫu (Template)</label>
                                <div class="grid grid-cols-2 gap-3">
                                    <button class="es-tpl-btn active px-3 py-3 rounded-xl border-2 border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold transition-all flex flex-col items-start gap-1" data-tpl="premium">
                                        <div class="flex items-center gap-2"><i class="fas fa-star text-blue-500"></i> Premium</div>
                                        <span class="text-[10px] font-normal opacity-70 text-left">Hiện đại, Cân đối</span>
                                    </button>
                                    <button class="es-tpl-btn px-3 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 text-sm font-bold transition-all flex flex-col items-start gap-1" data-tpl="corporate">
                                        <div class="flex items-center gap-2"><i class="fas fa-briefcase text-emerald-500"></i> Corporate</div>
                                        <span class="text-[10px] font-normal opacity-70 text-left">Doanh nghiệp</span>
                                    </button>
                                    <button class="es-tpl-btn px-3 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 text-sm font-bold transition-all flex flex-col items-start gap-1" data-tpl="elegant">
                                        <div class="flex items-center gap-2"><i class="fas fa-gem text-amber-500"></i> Elegant</div>
                                        <span class="text-[10px] font-normal opacity-70 text-left">Canh giữa, Sang trọng</span>
                                    </button>
                                    <button class="es-tpl-btn px-3 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 text-sm font-bold transition-all flex flex-col items-start gap-1" data-tpl="minimal">
                                        <div class="flex items-center gap-2"><i class="fas fa-align-left text-zinc-400"></i> Minimal</div>
                                        <span class="text-[10px] font-normal opacity-70 text-left">Tối giản, Text thuần</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-7 space-y-4 lg:sticky lg:top-[70px]">
                    
                    <div class="premium-card bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-1.5 overflow-hidden">
                        <div class="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center bg-zinc-50 dark:bg-zinc-950/30 rounded-t-[26px]">
                            <div class="flex gap-1.5 mr-4">
                                <div class="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div>
                                <div class="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div>
                                <div class="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20"></div>
                            </div>
                            <span class="text-[11px] font-semibold text-zinc-400 flex-1 text-center pr-10">Bản xem trước (Live Preview)</span>
                        </div>
                        
                        <div class="p-6 md:p-8 bg-white min-h-[220px] flex items-center justify-start overflow-x-auto rounded-b-[26px] selection:bg-blue-100 selection:text-black">
                            <div id="es-preview-box" class="w-full">
                                </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button id="btn-es-copy-visual" class="py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 group">
                            <i class="fas fa-copy"></i> SAO CHÉP GIAO DIỆN
                        </button>
                        <button id="btn-es-copy-html" class="py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm">
                            <i class="fas fa-code"></i> SAO CHÉP HTML
                        </button>
                    </div>
                    <p class="text-[11px] text-zinc-500 text-center px-4 leading-relaxed">Nhấp <strong class="text-zinc-700 dark:text-zinc-300">Sao chép Giao diện</strong>, mở Cài đặt Gmail > Chữ ký, dán (Ctrl+V) và lưu lại.</p>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    let state = {
        name: 'Đinh Mạnh Hùng',
        title: 'Mechatronics Engineer',
        company: 'Hunq AIO Workspace',
        phone: '+81 90 1234 5678',
        email: 'contact@hunq.online',
        website: 'https://hunq.online',
        avatar: 'https://i.ibb.co/V3QzKxB/avatar.png',
        
        // Social Links state
        fb: '',
        x: 'https://x.com/hunq',
        li: 'https://linkedin.com/in/hunq',
        tk: '',
        gh: 'https://github.com/hunq',
        otherName: 'Zalo',
        otherUrl: 'https://zalo.me/',
        
        color: '#09090b', 
        template: 'premium'
    };

    if (document.documentElement.classList.contains('dark')) state.color = '#2563eb'; 

    const inputs = {
        name: document.getElementById('es-in-name'),
        title: document.getElementById('es-in-title'),
        company: document.getElementById('es-in-company'),
        phone: document.getElementById('es-in-phone'),
        email: document.getElementById('es-in-email'),
        website: document.getElementById('es-in-website'),
        avatar: document.getElementById('es-in-avatar'),
        fb: document.getElementById('es-in-fb'),
        x: document.getElementById('es-in-x'),
        li: document.getElementById('es-in-li'),
        tk: document.getElementById('es-in-tk'),
        gh: document.getElementById('es-in-gh'),
        otherName: document.getElementById('es-in-other-name'),
        otherUrl: document.getElementById('es-in-other-url')
    };
    
    const colorBtns = document.querySelectorAll('.es-color-btn');
    const customColorPicker = document.getElementById('es-custom-color');
    const tplBtns = document.querySelectorAll('.es-tpl-btn');
    const tabBtns = document.querySelectorAll('.es-tab-btn');
    const tabContents = document.querySelectorAll('.es-tab-content');
    
    const previewBox = document.getElementById('es-preview-box');
    const btnCopyVisual = document.getElementById('btn-es-copy-visual');
    const btnCopyHtml = document.getElementById('btn-es-copy-html');
    const btnReset = document.getElementById('btn-es-reset');

    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => {
                b.classList.remove('active', 'bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'text-zinc-900', 'dark:text-white', 'font-bold', 'border-zinc-200/50', 'dark:border-zinc-700/50');
                b.classList.add('text-zinc-500', 'font-medium', 'border-transparent');
            });
            btn.classList.remove('text-zinc-500', 'font-medium', 'border-transparent');
            btn.classList.add('active', 'bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'text-zinc-900', 'dark:text-white', 'font-bold', 'border-zinc-200/50', 'dark:border-zinc-700/50');
            
            tabContents.forEach(c => c.classList.replace('block', 'hidden'));
            document.getElementById(btn.dataset.tab).classList.replace('hidden', 'block');
        };
    });

    // --- CẤU HÌNH ICON MẠNG XÃ HỘI ---
    const ICON_BASE = {
        fb: 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png',
        x: 'https://cdn-icons-png.flaticon.com/512/11262/11262828.png',
        li: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
        tk: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
        gh: 'https://cdn-icons-png.flaticon.com/512/733/733553.png'
    };

    const renderSocialsTable = (color, align = 'left') => {
        let tds = '';
        ['fb', 'x', 'li', 'tk', 'gh'].forEach(key => {
            if (state[key]) {
                tds += `<td style="padding-right: 8px;"><a href="${state[key]}"><img src="${ICON_BASE[key]}" width="20" height="20" alt="${key}" style="display: block; border: 0;"></a></td>`;
            }
        });
        
        // Nền tảng khác (Render ra text)
        if (state.otherName && state.otherUrl) {
            tds += `<td style="padding-right: 8px; vertical-align: middle;"><a href="${state.otherUrl}" style="color: ${color}; font-size: 11px; font-weight: bold; text-decoration: none; font-family: sans-serif; letter-spacing: 0.5px; text-transform: uppercase;">${state.otherName}</a></td>`;
        }

        if (!tds) return '';
        
        const tableAlign = align === 'center' ? 'margin: 12px auto 0 auto;' : 'margin-top: 12px;';
        
        return `
        <table cellpadding="0" cellspacing="0" border="0" style="${tableAlign} padding-top: 12px; border-top: 1px solid #f4f4f5;">
            <tr>${tds}</tr>
        </table>
        `;
    };

    const generateHTML = () => {
        const c = state.color;
        const cleanWebsite = state.website ? state.website.replace(/^https?:\/\//, '') : '';

        if (state.template === 'premium') {
            return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #3f3f46; background: #ffffff;">
                <tr>
                    ${state.avatar ? `
                    <td style="padding-right: 24px; border-right: 2px solid ${c}; vertical-align: top;">
                        <img src="${state.avatar}" alt="${state.name}" width="96" height="96" style="border-radius: 50%; display: block; object-fit: cover;">
                    </td>` : ''}
                    <td style="padding-left: ${state.avatar ? '24px' : '0'}; vertical-align: top;">
                        <h2 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #18181b; letter-spacing: -0.5px;">${state.name}</h2>
                        ${(state.title || state.company) ? `
                        <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: ${c}; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${state.title} ${state.title && state.company ? `<span style="color: #e4e4e7; margin: 0 4px;">|</span>` : ''} <span style="color: #71717a; font-weight: 500;">${state.company}</span>
                        </p>` : ''}
                        
                        <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 1.6; color: #52525b;">
                            ${state.phone ? `<tr><td style="padding-right: 12px; padding-bottom: 2px;"><strong style="color: #18181b;">P.</strong></td><td style="padding-bottom: 2px;">${state.phone}</td></tr>` : ''}
                            ${state.email ? `<tr><td style="padding-right: 12px; padding-bottom: 2px;"><strong style="color: #18181b;">E.</strong></td><td style="padding-bottom: 2px;"><a href="mailto:${state.email}" style="color: #52525b; text-decoration: none;">${state.email}</a></td></tr>` : ''}
                            ${state.website ? `<tr><td style="padding-right: 12px; padding-bottom: 2px;"><strong style="color: #18181b;">W.</strong></td><td style="padding-bottom: 2px;"><a href="${state.website}" style="color: #52525b; text-decoration: none;">${cleanWebsite}</a></td></tr>` : ''}
                        </table>
                        
                        ${renderSocialsTable(c, 'left')}
                    </td>
                </tr>
            </table>`;
        } 
        else if (state.template === 'corporate') {
            return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; color: #333333; background: #ffffff;">
                <tr>
                    ${state.avatar ? `
                    <td style="padding-right: 20px; vertical-align: middle;">
                        <img src="${state.avatar}" alt="${state.name}" width="90" height="90" style="border-radius: 8px; display: block; object-fit: cover;">
                    </td>` : ''}
                    <td style="padding-left: ${state.avatar ? '20px' : '0'}; border-left: 3px solid ${c}; vertical-align: middle;">
                        <h2 style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: #111111;">${state.name}</h2>
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: ${c};">${state.title}${state.title && state.company ? ' / ' : ''}${state.company}</p>
                        
                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #555555;">
                            ${state.phone ? `<strong style="color:#111;">M:</strong> ${state.phone}<br>` : ''}
                            ${state.email ? `<strong style="color:#111;">E:</strong> <a href="mailto:${state.email}" style="color: #555; text-decoration: none;">${state.email}</a><br>` : ''}
                            ${state.website ? `<strong style="color:#111;">W:</strong> <a href="${state.website}" style="color: #555; text-decoration: none;">${cleanWebsite}</a>` : ''}
                        </p>
                        ${renderSocialsTable(c, 'left')}
                    </td>
                </tr>
            </table>`;
        }
        else if (state.template === 'elegant') {
            return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: Georgia, serif; font-size: 14px; color: #444444; text-align: center; width: 100%; max-width: 400px; background: #ffffff;">
                <tr>
                    <td style="padding-bottom: 16px;">
                        ${state.avatar ? `<img src="${state.avatar}" alt="${state.name}" width="80" height="80" style="border-radius: 50%; display: inline-block; object-fit: cover; margin-bottom: 12px; border: 2px solid ${c}; padding: 2px;">` : ''}
                        <h2 style="margin: 0 0 4px 0; font-size: 22px; font-weight: normal; color: #111111;">${state.name}</h2>
                        <p style="margin: 0; font-size: 13px; font-style: italic; color: ${c};">${state.title}${state.company ? ` &bull; ${state.company}` : ''}</p>
                    </td>
                </tr>
                <tr>
                    <td style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 12px 0;">
                        <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #666666;">
                            ${state.phone ? `${state.phone} &nbsp;|&nbsp; ` : ''}
                            ${state.email ? `<a href="mailto:${state.email}" style="color: #666; text-decoration: none;">${state.email}</a>` : ''}
                            ${state.website ? ` &nbsp;|&nbsp; <a href="${state.website}" style="color: #666; text-decoration: none;">${cleanWebsite}</a>` : ''}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 12px;">
                        ${renderSocialsTable(c, 'center')}
                    </td>
                </tr>
            </table>`;
        }
        else {
            return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #52525b; line-height: 1.6; background: #ffffff;">
                <tr>
                    <td style="padding-bottom: 10px;">
                        <h2 style="margin: 0 0 2px 0; font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: -0.3px;">${state.name}</h2>
                        ${(state.title || state.company) ? `
                        <p style="margin: 0; color: ${c}; font-weight: 600;">${state.title} <span style="color: #a1a1aa; font-weight: 400;">@</span> ${state.company}</p>` : ''}
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 10px; border-top: 1px solid #e4e4e7;">
                        ${state.phone ? `<span style="color: #18181b; font-weight: 700;">T</span> &nbsp;${state.phone} &nbsp;&nbsp;&nbsp;` : ''}
                        ${state.email ? `<span style="color: #18181b; font-weight: 700;">E</span> &nbsp;<a href="mailto:${state.email}" style="color: #52525b; text-decoration: none;">${state.email}</a> <br>` : ''}
                        ${state.website ? `<span style="color: #18181b; font-weight: 700;">W</span> &nbsp;<a href="${state.website}" style="color: #52525b; text-decoration: none;">${cleanWebsite}</a>` : ''}
                        ${renderSocialsTable(c, 'left')}
                    </td>
                </tr>
            </table>`;
        }
    };

    const updatePreview = () => {
        previewBox.innerHTML = generateHTML();
    };

    const syncInputToState = () => {
        for (let key in inputs) {
            state[key] = inputs[key].value;
        }
        updatePreview();
    };

    const syncStateToInput = () => {
        for (let key in inputs) {
            inputs[key].value = state[key];
        }
        
        colorBtns.forEach(b => {
            if (b.dataset.color === state.color) b.classList.add('ring-2', 'ring-offset-2', 'ring-zinc-400', 'dark:ring-offset-zinc-900');
            else b.classList.remove('ring-2', 'ring-offset-2', 'ring-zinc-400', 'dark:ring-offset-zinc-900');
        });
        
        tplBtns.forEach(b => {
            if (b.dataset.tpl === state.template) {
                b.classList.replace('border-zinc-200', 'border-zinc-900');
                b.classList.replace('dark:border-zinc-800', 'dark:border-white');
                b.classList.replace('bg-white', 'bg-zinc-50');
                b.classList.replace('dark:bg-zinc-900', 'dark:bg-zinc-800');
                b.classList.replace('text-zinc-500', 'text-zinc-900');
                b.classList.add('dark:text-white');
            } else {
                b.classList.replace('border-zinc-900', 'border-zinc-200');
                b.classList.replace('dark:border-white', 'dark:border-zinc-800');
                b.classList.replace('bg-zinc-50', 'bg-white');
                b.classList.replace('dark:bg-zinc-800', 'dark:bg-zinc-900');
                b.classList.replace('text-zinc-900', 'text-zinc-500');
                b.classList.remove('dark:text-white');
            }
        });
        
        updatePreview();
    };

    for (let key in inputs) {
        inputs[key].addEventListener('input', syncInputToState);
    }

    colorBtns.forEach(btn => {
        btn.onclick = () => {
            state.color = btn.dataset.color;
            customColorPicker.value = state.color;
            syncStateToInput();
        };
    });

    customColorPicker.addEventListener('input', (e) => {
        state.color = e.target.value;
        syncStateToInput();
    });

    tplBtns.forEach(btn => {
        btn.onclick = () => {
            state.template = btn.dataset.tpl;
            syncStateToInput();
        };
    });

    btnCopyVisual.onclick = () => {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(previewBox);
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            document.execCommand('copy');
            UI.showAlert('Tuyệt vời!', 'Giao diện đã được chép. Mở cài đặt chữ ký Gmail và ấn Ctrl+V (hoặc Cmd+V) để dán.', 'success', 5000);
        } catch (err) {
            UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép định dạng này.', 'error');
        }
        selection.removeAllRanges();
    };

    btnCopyHtml.onclick = async () => {
        try {
            await navigator.clipboard.writeText(generateHTML());
            UI.showAlert('Đã chép HTML', 'Mã nguồn thẻ <table> đã lưu vào bộ nhớ tạm.', 'info');
        } catch (err) {
            UI.showAlert('Lỗi', 'Không thể chép mã HTML', 'error');
        }
    };

    btnReset.onclick = () => {
        UI.showConfirm('Khôi phục mặc định', 'Bạn có chắc muốn xóa tất cả thông tin vừa nhập?', () => {
            state = {
                name: '', title: '', company: '', phone: '', email: '', website: '', avatar: '',
                fb: '', x: '', li: '', tk: '', gh: '', otherName: '', otherUrl: '',
                color: '#09090b', template: 'premium'
            };
            syncStateToInput();
        });
    };

    syncStateToInput();
}