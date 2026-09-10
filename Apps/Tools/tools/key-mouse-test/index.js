import { UI } from '../../js/ui.js';

// =============================================================================
// 0. DYNAMIC THEME ACCENT CONTROLLER
// =============================================================================
const DEFAULT_EMERALD = '#10b981';

export const ThemeKit = {
    getAccentColor: () => {
        return localStorage.getItem('hunqos_accent_color') || 
               localStorage.getItem('hunqos_icon_custom_bg') || 
               DEFAULT_EMERALD;
    },
    applyAccent: (container) => {
        if (!container) return;
        const accent = ThemeKit.getAccentColor();
        container.style.setProperty('--kit-accent', accent);
    }
};

// =============================================================================
// 1. ADAPTIVE ISLAND & TOAST FALLBACK CONTROLLER
// =============================================================================
export const IslandKit = {
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        const isDOMVisible = wrapper && !wrapper.classList.contains('hidden') && window.getComputedStyle(wrapper).display !== 'none';
        return Boolean(isEnabled && isDOMVisible && typeof window.triggerIslandNotification === 'function');
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive()) {
            window.triggerIslandNotification(title, desc, type, duration);
        } else {
            UI.showAlert(title, desc, type, duration);
        }
    }
};

// =============================================================================
// 2. TEMPLATE RENDERER (SEAMLESS EMERALD FLAT)
// =============================================================================
export function template() {
    return `
    <div id="kb-mouse-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #kb-mouse-root {
                --kit-accent: #10b981;
            }
            .bg-accent-theme {
                background-color: var(--kit-accent) !important;
            }
            .text-accent-theme {
                color: var(--kit-accent) !important;
            }
            .border-accent-theme {
                border-color: var(--kit-accent) !important;
            }
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }

            /* --- Responsive Keyboard Layout --- */
            .kb-wrapper { display: flex; gap: 14px; min-width: 820px; }
            .kb-section { display: flex; flex-direction: column; gap: 4px; }
            .kb-main { flex: 15; } 
            .kb-nav { flex: 3; }  
            .kb-numpad { flex: 4; } 

            .kb-row { display: flex; gap: 4px; width: 100%; height: 50px; }
            
            /* Key States */
            .key-btn {
                --k-bg: #f4f4f6; 
                --k-bd: rgba(0, 0, 0, 0.08); 
                --k-cl: #52525b;
            }
            .dark .key-btn {
                --k-bg: #161618; 
                --k-bd: rgba(255, 255, 255, 0.08); 
                --k-cl: #a1a1aa;
            }
            .key-btn.tested {
                --k-bg: color-mix(in srgb, var(--kit-accent) 12%, transparent); 
                --k-bd: color-mix(in srgb, var(--kit-accent) 30%, transparent); 
                --k-cl: var(--kit-accent);
            }
            .key-btn.active {
                --k-bg: var(--kit-accent) !important; 
                --k-bd: var(--kit-accent) !important; 
                --k-cl: #ffffff !important;
                transform: translateY(2px) scale(0.96);
                z-index: 20;
            }

            .key-btn:not(.jis-enter-container):not(.tall-key) { 
                flex: 1; 
                height: 100%;
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                border-radius: 8px; font-size: 12px; font-weight: 600; font-family: monospace;
                background: var(--k-bg); border: 1px solid var(--k-bd); color: var(--k-cl);
                box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
                position: relative;
                overflow: hidden;
                padding: 3px;
                text-align: center;
                line-height: 1.15;
            }
            .dark .key-btn:not(.jis-enter-container):not(.tall-key) { box-shadow: 0 2px 4px rgba(0,0,0,0.25); }
            
            /* Numpad Tall Keys (+ & Enter) */
            .tall-key {
                position: absolute; top: 0; left: 0; right: 0;
                height: calc(200% + 4px);
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                border-radius: 8px; font-size: 13px; font-weight: 600; font-family: monospace;
                background: var(--k-bg); border: 1px solid var(--k-bd); color: var(--k-cl);
                box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                transition: transform 0.08s ease, background 0.15s ease; z-index: 10;
            }
            .dark .tall-key { box-shadow: 0 2px 4px rgba(0,0,0,0.25); }

            /* JIS Enter */
            .jis-enter-container {
                position: absolute; top: 0; right: 0; 
                width: 100%; height: calc(200% + 4px); 
                background: transparent !important; border: none !important; box-shadow: none !important;
                color: var(--k-cl); z-index: 10; transition: transform 0.08s ease;
            }
            .jis-enter-top {
                position: absolute; top: 0; right: 0; left: 0; 
                height: calc(50% - 2px); 
                background: var(--k-bg); border: 1px solid var(--k-bd);
                border-radius: 8px 8px 0 8px; transition: all 0.15s;
            }
            .jis-enter-bottom {
                position: absolute; bottom: 0; right: 0; 
                width: 83.33%; height: calc(50% + 2px); 
                background: var(--k-bg); border: 1px solid var(--k-bd);
                border-radius: 8px 0 8px 8px; transition: all 0.15s;
            }
            .jis-enter-join {
                position: absolute; top: calc(50% - 4px); right: 1px; 
                width: calc(83.33% - 2px); height: 5px;
                background: var(--k-bg); z-index: 2; transition: all 0.15s;
            }

            /* Arrow Columns */
            .key-col { display: flex; flex-direction: column; gap: 4px; height: 100%; }
            .key-col .key-btn { 
                height: 23px !important; 
                flex: unset; 
                padding: 0 !important;
            }
            .key-col-spacer {
                flex: unset; visibility: hidden; height: 23px;
            }

            .f-1 { flex: 1; } .f-1-25 { flex: 1.25; } .f-1-5 { flex: 1.5; } 
            .f-1-75 { flex: 1.75; } .f-2 { flex: 2; } .f-2-25 { flex: 2.25; } 
            .f-2-75 { flex: 2.75; } .f-3-25 { flex: 3.25; } .f-4 { flex: 4; } 
            .f-5-5 { flex: 5.5; } .f-space { flex: 6.25; }
            .key-spacer { flex: 0.5; visibility: hidden; } 

            .key-sub { font-size: 9px; opacity: 0.65; position: absolute; top: 3px; left: 6px; }
            .key-main { margin-top: auto; margin-bottom: auto; display: flex; gap: 4px; align-items: center; }

            /* Mouse Tester */
            .mouse-btn-part { transition: background-color 0.1s ease, transform 0.1s ease; }
            .mouse-active-left { background-color: #3b82f6 !important; }
            .mouse-active-right { background-color: #ef4444 !important; }
            .mouse-active-mid { background-color: var(--kit-accent) !important; transform: translateY(2px); }
            .mouse-active-scroll-up { box-shadow: 0 -8px 0 0 color-mix(in srgb, var(--kit-accent) 40%, transparent) inset; }
            .mouse-active-scroll-down { box-shadow: 0 8px 0 0 color-mix(in srgb, var(--kit-accent) 40%, transparent) inset; }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-6xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Hardware Testing</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Kiểm Tra Bàn Phím & Chuột</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Xác thực tín hiệu phím, chống dập phím (Anti-Ghosting), click chuột và cuộn con lăn thời gian thực.</p>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <button id="reset-btn" class="h-10 px-3.5 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="far fa-trash-can text-xs"></i> Đặt lại
                    </button>
                </div>
            </div>

            <!-- KEYBOARD TESTER CONTAINER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                
                <!-- TOP BAR: SEGMENTED TABS CHO CÁC LAYOUT -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                    <div class="grid grid-cols-5 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-[500px]" id="kb-layout-tabs">
                        <button class="layout-btn active py-1.5 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate" data-layout="macjis">Mac JIS</button>
                        <button class="layout-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-layout="mac">Mac US</button>
                        <button class="layout-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-layout="60">60% Mini</button>
                        <button class="layout-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-layout="tkl">TKL (87)</button>
                        <button class="layout-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate" data-layout="108">Full 108</button>
                    </div>

                    <span class="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 hidden sm:inline">Phát hiện tự động</span>
                </div>

                <!-- KEYBOARD VISUAL RENDER -->
                <div class="w-full overflow-x-auto no-scrollbar pb-2 pt-1 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <div id="keyboard-render-area" class="kb-wrapper mx-auto"></div>
                </div>

                <!-- KEYBOARD STATUS PANELS -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <div class="space-y-2.5">
                        <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Tín hiệu phím cuối</span>
                        <div class="space-y-2">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2.5 flex justify-between items-center">
                                <span class="text-[10px] font-mono text-zinc-400 uppercase">Ký tự (Key)</span>
                                <span id="info-key" class="text-xs font-mono font-bold text-zinc-900 dark:text-white">-</span>
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2.5 flex justify-between items-center">
                                <span class="text-[10px] font-mono text-zinc-400 uppercase">Mã (Code)</span>
                                <span id="info-code" class="text-xs font-mono font-bold text-accent-theme">-</span>
                            </div>
                        </div>

                        <div class="p-3 bg-accent-theme-alpha rounded-[16px] border border-accent-theme/20 flex items-center justify-between">
                            <span class="text-[10px] font-bold text-accent-theme uppercase tracking-wider">Anti-Ghosting</span>
                            <div class="text-sm font-black font-mono text-accent-theme">
                                <span id="ghosting-count">0</span> <span class="text-[10px] font-normal text-zinc-400">phím nhấn cùng lúc</span>
                            </div>
                        </div>
                    </div>

                    <div class="md:col-span-2 flex flex-col h-[180px] space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Lịch sử phím bấm</span>
                            <button id="clear-history" class="text-[10px] font-bold text-zinc-400 hover:text-accent-theme transition-colors">Xóa danh sách</button>
                        </div>

                        <div class="flex-1 overflow-y-auto no-scrollbar bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-2.5">
                            <ul id="key-history-list" class="space-y-1.5">
                                <li class="text-xs font-mono text-zinc-400 italic text-center py-4">Chưa có phím nào được nhấn</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MOUSE TESTER CONTAINER -->
            <div id="mouse-tester-area" class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-mouse text-accent-theme text-sm"></i>
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Kiểm tra chuột (Mouse Tester)</h3>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">Click & Scroll trong khung này</span>
                </div>

                <div class="flex flex-col md:flex-row gap-8 items-center justify-center py-2">
                    
                    <!-- SVG / CSS MOUSE MODEL -->
                    <div id="mouse-model" class="relative w-36 h-56 border-2 border-black/[0.1] dark:border-white/[0.15] rounded-[3rem] flex flex-col items-center p-3 gap-2 shadow-sm bg-[#f2f2f7] dark:bg-black/40">
                        <div class="flex w-full gap-2 h-20">
                            <div id="mouse-left" class="mouse-btn-part flex-1 rounded-tl-[2rem] rounded-bl-xl bg-black/10 dark:bg-white/15"></div>
                            <div id="mouse-mid-container" class="w-8 h-12 mx-auto self-center flex items-center justify-center overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                                <div id="mouse-mid" class="mouse-btn-part w-full h-full rounded-full bg-black/20 dark:bg-white/30"></div>
                            </div>
                            <div id="mouse-right" class="mouse-btn-part flex-1 rounded-tr-[2rem] rounded-br-xl bg-black/10 dark:bg-white/15"></div>
                        </div>
                        <div id="mouse-body" class="mouse-btn-part flex-1 w-full rounded-b-[2rem] bg-black/5 dark:bg-white/10 mt-1 flex flex-col items-center justify-center">
                            <i class="fas fa-arrows-up-down-left-right text-zinc-400 text-xs mb-1"></i>
                        </div>
                    </div>

                    <!-- MOUSE SPECS INFO -->
                    <div class="space-y-2.5 w-full md:w-72">
                        <div class="flex justify-between items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-3">
                            <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase">Nút bấm (Click)</span>
                            <span id="mouse-btn-info" class="text-xs font-mono font-black text-zinc-900 dark:text-white">-</span>
                        </div>
                        <div class="flex justify-between items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-3">
                            <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase">Con lăn (Scroll)</span>
                            <span id="mouse-scroll-info" class="text-xs font-mono font-black text-zinc-900 dark:text-white">-</span>
                        </div>
                        <div class="flex justify-between items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-3">
                            <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase">Tọa độ (Pointer)</span>
                            <span id="mouse-pos-info" class="text-xs font-mono font-black text-accent-theme">X: 0, Y: 0</span>
                        </div>
                    </div>

                </div>
            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#kb-mouse-root') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    // =========================================================================
    // 1. DATA KEYBOARD LAYOUTS
    // =========================================================================
    const kbData = {
        mainRow0: [{c:'⎋ Esc',k:'Escape'},{w:'key-spacer'},{c:'F1',k:'F1'},{c:'F2',k:'F2'},{c:'F3',k:'F3'},{c:'F4',k:'F4'},{w:'key-spacer'},{c:'F5',k:'F5'},{c:'F6',k:'F6'},{c:'F7',k:'F7'},{c:'F8',k:'F8'},{w:'key-spacer'},{c:'F9',k:'F9'},{c:'F10',k:'F10'},{c:'F11',k:'F11'},{c:'F12',k:'F12'}],
        mainRow1: [{s:'~',c:'`',k:'Backquote'},{s:'!',c:'1',k:'Digit1'},{s:'@',c:'2',k:'Digit2'},{s:'#',c:'3',k:'Digit3'},{s:'$',c:'4',k:'Digit4'},{s:'%',c:'5',k:'Digit5'},{s:'^',c:'6',k:'Digit6'},{s:'&',c:'7',k:'Digit7'},{s:'*',c:'8',k:'Digit8'},{s:'(',c:'9',k:'Digit9'},{s:')',c:'0',k:'Digit0'},{s:'_',c:'-',k:'Minus'},{s:'+',c:'=',k:'Equal'},{c:'<i class="fas fa-backspace text-xs"></i>',k:'Backspace',w:'f-2'}],
        mainRow2: [{c:'⇥ Tab',k:'Tab',w:'f-1-5'},{c:'Q',k:'KeyQ'},{c:'W',k:'KeyW'},{c:'E',k:'KeyE'},{c:'R',k:'KeyR'},{c:'T',k:'KeyT'},{c:'Y',k:'KeyY'},{c:'U',k:'KeyU'},{c:'I',k:'KeyI'},{c:'O',k:'KeyO'},{c:'P',k:'KeyP'},{s:'{',c:'[',k:'BracketLeft'},{s:'}',c:']',k:'BracketRight'},{s:'|',c:'\\',k:'Backslash',w:'f-1-5'}],
        mainRow3: [{c:'⇪ Caps',k:'CapsLock',w:'f-1-75'},{c:'A',k:'KeyA'},{c:'S',k:'KeyS'},{c:'D',k:'KeyD'},{c:'F',k:'KeyF'},{c:'G',k:'KeyG'},{c:'H',k:'KeyH'},{c:'J',k:'KeyJ'},{c:'K',k:'KeyK'},{c:'L',k:'KeyL'},{s:':',c:';',k:'Semicolon'},{s:'"',c:"'",k:'Quote'},{c:'↵ Enter',k:'Enter',w:'f-2-25'}],
        mainRow4: [{c:'⇧ Shift',k:'ShiftLeft',w:'f-2-25'},{c:'Z',k:'KeyZ'},{c:'X',k:'KeyX'},{c:'C',k:'KeyC'},{c:'V',k:'KeyV'},{c:'B',k:'KeyB'},{c:'N',k:'KeyN'},{c:'M',k:'KeyM'},{s:'<',c:',',k:'Comma'},{s:'>',c:'.',k:'Period'},{s:'?',c:'/',k:'Slash'},{c:'⇧ Shift',k:'ShiftRight',w:'f-2-75'}],
        mainRow5: [{c:'⌃ Ctrl',k:'ControlLeft',w:'f-1-25'},{c:'<i class="fab fa-windows"></i>',k:'MetaLeft',w:'f-1-25'},{c:'⎇ Alt',k:'AltLeft',w:'f-1-25'},{c:'',k:'Space',w:'f-space'},{c:'⎇ Alt',k:'AltRight',w:'f-1-25'},{c:'<i class="fab fa-windows"></i>',k:'MetaRight',w:'f-1-25'},{c:'<i class="fas fa-bars"></i>',k:'ContextMenu',w:'f-1-25'},{c:'⌃ Ctrl',k:'ControlRight',w:'f-1-25'}],
        
        macUSRow0: [{c:'⎋ esc',k:'Escape',w:'f-1-5'},{c:'F1',k:'F1'},{c:'F2',k:'F2'},{c:'F3',k:'F3'},{c:'F4',k:'F4'},{c:'F5',k:'F5'},{c:'F6',k:'F6'},{c:'F7',k:'F7'},{c:'F8',k:'F8'},{c:'F9',k:'F9'},{c:'F10',k:'F10'},{c:'F11',k:'F11'},{c:'F12',k:'F12'},{c:'<i class="fas fa-fingerprint text-xs"></i>',k:'Power',w:'f-1-5'}],
        macUSRow5: [{c:'🌐 fn',k:'Fn',w:'f-1'},{c:'⌃ ctrl',k:'ControlLeft',w:'f-1'},{c:'⌥ opt',k:'AltLeft',w:'f-1'},{c:'⌘ cmd',k:'MetaLeft',w:'f-1-25'},{c:'',k:'Space',w:'f-5-5'},{c:'⌘ cmd',k:'MetaRight',w:'f-1-25'},{c:'⌥ opt',k:'AltRight',w:'f-1'},{t:'col', w:'f-1', keys: [{t:'spacer'}, {c:'◀',k:'ArrowLeft'}]},{t:'col', w:'f-1', keys: [{c:'▲',k:'ArrowUp'}, {c:'▼',k:'ArrowDown'}]},{t:'col', w:'f-1', keys: [{t:'spacer'}, {c:'▶',k:'ArrowRight'}]}],

        macJisRow0: [{c:'⎋ esc',k:'Escape',w:'f-1-5'},{c:'F1',k:'F1'},{c:'F2',k:'F2'},{c:'F3',k:'F3'},{c:'F4',k:'F4'},{c:'F5',k:'F5'},{c:'F6',k:'F6'},{c:'F7',k:'F7'},{c:'F8',k:'F8'},{c:'F9',k:'F9'},{c:'F10',k:'F10'},{c:'F11',k:'F11'},{c:'F12',k:'F12'},{c:'<i class="fas fa-fingerprint text-xs"></i>',k:'Power',w:'f-1-5'}],
        macJisRow1: [{s:'!',c:'1',k:'Digit1'},{s:'"',c:'2',k:'Digit2'},{s:'#',c:'3',k:'Digit3'},{s:'$',c:'4',k:'Digit4'},{s:'%',c:'5',k:'Digit5'},{s:'&',c:'6',k:'Digit6'},{s:"'",c:'7',k:'Digit7'},{s:'(',c:'8',k:'Digit8'},{s:')',c:'9',k:'Digit9'},{s:'',c:'0',k:'Digit0'},{s:'=',c:'-',k:'Minus'},{s:'~',c:'^',k:'Equal'},{s:'|',c:'¥',k:'IntlYen'},{c:'<i class="fas fa-backspace text-xs"></i>',k:'Backspace',w:'f-2'}],
        macJisRow2: [{c:'⇥ tab',k:'Tab',w:'f-1-5'},{c:'Q',k:'KeyQ'},{c:'W',k:'KeyW'},{c:'E',k:'KeyE'},{c:'R',k:'KeyR'},{c:'T',k:'KeyT'},{c:'Y',k:'KeyY'},{c:'U',k:'KeyU'},{c:'I',k:'KeyI'},{c:'O',k:'KeyO'},{c:'P',k:'KeyP'},{s:'`',c:'@',k:'BracketLeft'},{s:'{',c:'[',k:'BracketRight'},{c:'↵ enter',k:'Enter',w:'f-1-5', type:'jis-enter'}],
        macJisRow3: [{c:'⌃ ctrl',k:'ControlLeft',w:'f-1-75'},{c:'A',k:'KeyA'},{c:'S',k:'KeyS'},{c:'D',k:'KeyD'},{c:'F',k:'KeyF'},{c:'G',k:'KeyG'},{c:'H',k:'KeyH'},{c:'J',k:'KeyJ'},{c:'K',k:'KeyK'},{c:'L',k:'KeyL'},{s:'+',c:';',k:'Semicolon'},{s:'*',c:':',k:'Quote'},{s:'}',c:']',k:'Backslash'},{w:'f-1-25', type:'jis-spacer'}],
        macJisRow4: [{c:'⇧ shift',k:'ShiftLeft',w:'f-2-25'},{c:'Z',k:'KeyZ'},{c:'X',k:'KeyX'},{c:'C',k:'KeyC'},{c:'V',k:'KeyV'},{c:'B',k:'KeyB'},{c:'N',k:'KeyN'},{c:'M',k:'KeyM'},{s:'<',c:',',k:'Comma'},{s:'>',c:'.',k:'Period'},{s:'?',c:'/',k:'Slash'},{s:'_',c:'\\',k:'IntlRo'},{c:'⇧ shift',k:'ShiftRight',w:'f-1-75'}],
        macJisRow5: [{c:'⇪ caps',k:'CapsLock',w:'f-1-25'},{c:'⌥ opt',k:'AltLeft',w:'f-1-25'},{c:'⌘ cmd',k:'MetaLeft',w:'f-1-25'},{c:'英数',k:'Lang2',w:'f-1-25'},{c:'',k:'Space',w:'f-3-25'},{c:'かな',k:'Lang1',w:'f-1-25'},{c:'⌘ cmd',k:'MetaRight',w:'f-1-25'},{c:'🌐 fn',k:'Fn',w:'f-1-25'},{t:'col', w:'f-1', keys: [{t:'spacer'}, {c:'◀',k:'ArrowLeft'}]},{t:'col', w:'f-1', keys: [{c:'▲',k:'ArrowUp'}, {c:'▼',k:'ArrowDown'}]},{t:'col', w:'f-1', keys: [{t:'spacer'}, {c:'▶',k:'ArrowRight'}]}],
        
        navBlock: [
            [{c:'PrtSc',k:'PrintScreen'},{c:'ScrLk',k:'ScrollLock'},{c:'Pause',k:'Pause'}],
            [{c:'Ins',k:'Insert'},{c:'Home',k:'Home'},{c:'PgUp',k:'PageUp'}],
            [{c:'Del',k:'Delete'},{c:'End',k:'End'},{c:'PgDn',k:'PageDown'}],
            [{w:'key-spacer'}],
            [{w:'key-spacer'}],
            [{w:'key-spacer'},{c:'▲',k:'ArrowUp'},{w:'key-spacer'}],
            [{c:'◀',k:'ArrowLeft'},{c:'▼',k:'ArrowDown'},{c:'▶',k:'ArrowRight'}]
        ],
        numpadBlock108: [
            [{c:'Calc',k:'LaunchApplication2'},{c:'Mute',k:'AudioVolumeMute'},{c:'Vol-',k:'AudioVolumeDown'},{c:'Vol+',k:'AudioVolumeUp'}],
            [{c:'Num',k:'NumLock'},{c:'/',k:'NumpadDivide'},{c:'*',k:'NumpadMultiply'},{c:'-',k:'NumpadSubtract'}],
            [{c:'7',k:'Numpad7'},{c:'8',k:'Numpad8'},{c:'9',k:'Numpad9'},{c:'+',k:'NumpadAdd', t:'tall'}], 
            [{c:'4',k:'Numpad4'},{c:'5',k:'Numpad5'},{c:'6',k:'Numpad6'},{w:'key-spacer'}],
            [{c:'1',k:'Numpad1'},{c:'2',k:'Numpad2'},{c:'3',k:'Numpad3'},{c:'↵',k:'NumpadEnter', t:'tall'}],
            [{c:'0',k:'Numpad0',w:'f-2'},{c:'.',k:'NumpadDecimal'},{w:'key-spacer'}]
        ]
    };

    const renderRows = (rows) => rows.map(row => `
        <div class="kb-row">
            ${row.map(k => {
                if (k.type === 'jis-enter') {
                    return `<div class="${k.w || ''}" style="position: relative; height: 100%;">
                        <div class="key-btn jis-enter-container" data-code="${k.k}">
                            <div class="jis-enter-top"></div>
                            <div class="jis-enter-bottom"></div>
                            <div class="jis-enter-join"></div>
                            <span class="key-main" style="position: relative; z-index: 10; margin-top: 14px; font-size: 11px;">${k.c}</span>
                        </div>
                    </div>`;
                }
                if (k.type === 'jis-spacer') return `<div class="${k.w || ''}"></div>`;
                
                if (k.t === 'tall') {
                    return `<div class="${k.w || 'f-1'}" style="position: relative; height: 100%;">
                        <div class="tall-key" data-code="${k.k}">
                            <span class="key-main text-[14px]">${k.c}</span>
                        </div>
                    </div>`;
                }

                if (k.t === 'col') {
                    return `<div class="key-col ${k.w || ''}">
                        ${k.keys.map(subK => {
                            if (subK.t === 'spacer') return `<div class="key-col-spacer"></div>`;
                            return `<div class="key-btn" data-code="${subK.k}"><span class="key-main text-[10px]">${subK.c}</span></div>`;
                        }).join('')}
                    </div>`;
                }

                if(!k.c && !k.k) return `<div class="${k.w || 'key-spacer'}"></div>`;
                
                return `<div class="key-btn ${k.w || ''}" data-code="${k.k}">
                    ${k.s ? `<span class="key-sub">${k.s}</span>` : ''}
                    <span class="key-main ${k.c.includes('Touch ID') ? 'text-[9px]' : ''}">${k.c}</span>
                </div>`;
            }).join('')}
        </div>
    `).join('');

    const layouts = {
        '60': () => `<div class="kb-section kb-main">${renderRows([kbData.mainRow1, kbData.mainRow2, kbData.mainRow3, kbData.mainRow4, kbData.mainRow5])}</div>`,
        'mac': () => `<div class="kb-section kb-main">${renderRows([kbData.macUSRow0, kbData.mainRow1, kbData.mainRow2, kbData.mainRow3, kbData.mainRow4, kbData.macUSRow5])}</div>`,
        'macjis': () => `<div class="kb-section kb-main">${renderRows([kbData.macJisRow0, kbData.macJisRow1, kbData.macJisRow2, kbData.macJisRow3, kbData.macJisRow4, kbData.macJisRow5])}</div>`,
        'tkl': () => `
            <div class="kb-section kb-main">${renderRows([kbData.mainRow0, kbData.mainRow1, kbData.mainRow2, kbData.mainRow3, kbData.mainRow4, kbData.mainRow5])}</div>
            <div class="kb-section kb-nav">${renderRows(kbData.navBlock)}</div>
        `,
        '108': () => `
            <div class="kb-section kb-main">${renderRows([kbData.mainRow0, kbData.mainRow1, kbData.mainRow2, kbData.mainRow3, kbData.mainRow4, kbData.mainRow5])}</div>
            <div class="kb-section kb-nav">${renderRows(kbData.navBlock)}</div>
            <div class="kb-section kb-numpad">${renderRows(kbData.numpadBlock108)}</div>
        `
    };

    const container = _('#keyboard-render-area');
    const testedKeys = new Set();
    const pressedKeys = new Set();

    const applyLayout = (type) => {
        if (!container) return;
        container.innerHTML = layouts[type]();
        testedKeys.forEach(code => {
            hostElement.querySelectorAll(`[data-code="${code}"]`).forEach(el => el.classList.add('tested'));
        });
    };

    // Segmented Tabs Layout Switch
    const activeLayoutClass = 'layout-btn active py-1.5 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center truncate';
    const inactiveLayoutClass = 'layout-btn py-1.5 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center truncate';

    const layoutBtns = $$('.layout-btn');
    layoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            layoutBtns.forEach(b => b.className = inactiveLayoutClass);
            btn.className = activeLayoutClass;
            applyLayout(btn.dataset.layout);
        });
    });

    // =========================================================================
    // 2. KEYBOARD LOGIC
    // =========================================================================
    const elGhosting = _('#ghosting-count');
    const elInfoKey = _('#info-key');
    const elInfoCode = _('#info-code');
    const elHistoryList = _('#key-history-list');

    const updateEventInfo = (e) => {
        let displayKey = e.key === ' ' ? 'Space' : e.key;
        if (elInfoKey) elInfoKey.textContent = displayKey;
        if (elInfoCode) elInfoCode.textContent = e.code;
    };

    const addHistory = (e) => {
        if (!elHistoryList) return;
        const firstChild = elHistoryList.firstElementChild;
        if (firstChild && firstChild.tagName !== 'LI') elHistoryList.innerHTML = ''; 
        
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-2 rounded-[10px] bg-white dark:bg-[#1c1c1e] border border-black/[0.04] dark:border-white/[0.06] text-xs font-mono shadow-sm';
        
        let displayKey = e.key === ' ' ? 'Space' : e.key;
        li.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="min-w-6 h-6 px-1.5 rounded-[6px] bg-[#f2f2f7] dark:bg-black/50 flex items-center justify-center font-bold text-zinc-900 dark:text-white border border-black/[0.04] dark:border-white/[0.06]">${displayKey}</span>
                <span class="text-[11px] text-zinc-400 font-semibold">${e.code}</span>
            </div>
            <span class="text-[10px] text-zinc-400 opacity-60">code: ${e.keyCode}</span>
        `;
        
        elHistoryList.prepend(li);
        if (elHistoryList.children.length > 50) elHistoryList.lastElementChild.remove();
    };

    const toggleKeyVisual = (code, isActive) => {
        const els = hostElement.querySelectorAll(`[data-code="${code}"]`);
        els.forEach(el => {
            if (isActive) {
                el.classList.add('active');
                el.classList.remove('tested');
            } else {
                el.classList.remove('active');
                el.classList.add('tested');
            }
        });
    };

    const onKeyDown = (e) => {
        if (e.isComposing || e.keyCode === 229) {
            pressedKeys.forEach(code => toggleKeyVisual(code, false));
            pressedKeys.clear();
            if (elGhosting) elGhosting.textContent = '0';
            
            if (e.code) {
                testedKeys.add(e.code);
                hostElement.querySelectorAll(`[data-code="${e.code}"]`).forEach(el => el.classList.add('tested'));
            }
            return;
        }

        if (e.code && !e.code.includes('Mouse')) {
            e.preventDefault(); 
            pressedKeys.add(e.code);
            if (elGhosting) elGhosting.textContent = pressedKeys.size;
            testedKeys.add(e.code);
            
            updateEventInfo(e);
            toggleKeyVisual(e.code, true);
            
            if (!e.repeat) addHistory(e);
        }
    };

    const onKeyUp = (e) => {
        if (e.code) {
            pressedKeys.delete(e.code);
            if (elGhosting) elGhosting.textContent = pressedKeys.size;
            toggleKeyVisual(e.code, false);
        }
    };

    const onBlur = () => {
        pressedKeys.forEach(code => toggleKeyVisual(code, false));
        pressedKeys.clear();
        if (elGhosting) elGhosting.textContent = '0';
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    _('#reset-btn')?.addEventListener('click', () => {
        testedKeys.clear();
        pressedKeys.clear();
        if (elGhosting) elGhosting.textContent = '0';
        hostElement.querySelectorAll('[data-code]').forEach(el => el.classList.remove('active', 'tested'));
        IslandKit.notify('Đã đặt lại', 'Trạng thái kiểm tra bàn phím đã được làm mới.', 'info');
    });

    _('#clear-history')?.addEventListener('click', () => {
        if (elHistoryList) {
            elHistoryList.innerHTML = '<li class="text-xs font-mono text-zinc-400 italic text-center py-4">Chưa có phím nào được nhấn</li>';
        }
        if (elInfoKey) elInfoKey.textContent = '-';
        if (elInfoCode) elInfoCode.textContent = '-';
    });

    // =========================================================================
    // 3. MOUSE TESTER LOGIC
    // =========================================================================
    const mouseLeft = _('#mouse-left');
    const mouseMid = _('#mouse-mid');
    const mouseRight = _('#mouse-right');
    const mouseMidContainer = _('#mouse-mid-container');
    const mouseBtnInfo = _('#mouse-btn-info');
    const mouseScrollInfo = _('#mouse-scroll-info');
    const mousePosInfo = _('#mouse-pos-info');

    const onMouseMove = (e) => {
        if (mousePosInfo) mousePosInfo.textContent = `X: ${e.clientX}, Y: ${e.clientY}`;
    };

    const onMouseDown = (e) => {
        if (e.button === 0 && mouseLeft) {
            mouseLeft.classList.add('mouse-active-left');
            if (mouseBtnInfo) {
                mouseBtnInfo.textContent = 'Left Click';
                mouseBtnInfo.className = 'text-xs font-mono font-black text-blue-500';
            }
        }
        if (e.button === 1 && mouseMid) {
            e.preventDefault();
            mouseMid.classList.add('mouse-active-mid');
            if (mouseBtnInfo) {
                mouseBtnInfo.textContent = 'Middle Click';
                mouseBtnInfo.className = 'text-xs font-mono font-black text-accent-theme';
            }
        }
        if (e.button === 2 && mouseRight) {
            mouseRight.classList.add('mouse-active-right');
            if (mouseBtnInfo) {
                mouseBtnInfo.textContent = 'Right Click';
                mouseBtnInfo.className = 'text-xs font-mono font-black text-rose-500';
            }
        }
    };

    const onMouseUp = (e) => {
        if (e.button === 0 && mouseLeft) mouseLeft.classList.remove('mouse-active-left');
        if (e.button === 1 && mouseMid) mouseMid.classList.remove('mouse-active-mid');
        if (e.button === 2 && mouseRight) mouseRight.classList.remove('mouse-active-right');
        
        if (e.buttons === 0 && mouseBtnInfo) {
            mouseBtnInfo.textContent = '-';
            mouseBtnInfo.className = 'text-xs font-mono font-black text-zinc-900 dark:text-white';
        }
    };

    let scrollTimeout;
    const onWheel = (e) => {
        if (e.target.closest('#mouse-tester-area')) {
            e.preventDefault();
        }

        if (e.deltaY > 0) {
            if (mouseScrollInfo) {
                mouseScrollInfo.textContent = 'Scroll Down';
                mouseScrollInfo.className = 'text-xs font-mono font-black text-accent-theme';
            }
            mouseMidContainer?.classList.add('mouse-active-scroll-down');
            mouseMidContainer?.classList.remove('mouse-active-scroll-up');
        } else if (e.deltaY < 0) {
            if (mouseScrollInfo) {
                mouseScrollInfo.textContent = 'Scroll Up';
                mouseScrollInfo.className = 'text-xs font-mono font-black text-accent-theme';
            }
            mouseMidContainer?.classList.add('mouse-active-scroll-up');
            mouseMidContainer?.classList.remove('mouse-active-scroll-down');
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (mouseScrollInfo) {
                mouseScrollInfo.textContent = '-';
                mouseScrollInfo.className = 'text-xs font-mono font-black text-zinc-900 dark:text-white';
            }
            mouseMidContainer?.classList.remove('mouse-active-scroll-up', 'mouse-active-scroll-down');
        }, 150);
    };

    const onContextMenu = (e) => {
        if (e.target.closest('#mouse-tester-area') || e.target.closest('#keyboard-render-area')) {
            e.preventDefault();
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('contextmenu', onContextMenu);

    applyLayout('macjis');
}