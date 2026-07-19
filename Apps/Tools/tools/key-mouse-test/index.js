import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
            
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            
            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

            /* --- Responsive Keyboard Layout --- */
            .kb-wrapper { display: flex; gap: 16px; min-width: 820px; } /* Min-width 820px kết hợp với height 54px tạo form vuông 1:1 cho phím thường */
            .kb-section { display: flex; flex-direction: column; gap: 4px; }
            .kb-main { flex: 15; } 
            .kb-nav { flex: 3; }  
            .kb-numpad { flex: 4; } 

            .kb-row { display: flex; gap: 4px; width: 100%; height: 54px; } /* Ép chiều cao cố định để phím base thành vuông */
            
            /* State Đồng bộ & Dark Mode */
            .key-btn {
                --k-bg: #f4f4f5; 
                --k-bd: #e4e4e7; 
                --k-cl: #52525b;
            }
            .dark .key-btn {
                --k-bg: #18181b; 
                --k-bd: #27272a; 
                --k-cl: #a1a1aa;
            }
            .key-btn.tested {
                --k-bg: #ecfdf5; 
                --k-bd: #a7f3d0; 
                --k-cl: #059669;
            }
            .dark .key-btn.tested {
                --k-bg: rgba(16, 185, 129, 0.15); 
                --k-bd: rgba(16, 185, 129, 0.3); 
                --k-cl: #34d399;
            }
            .key-btn.active {
                --k-bg: #10b981 !important; 
                --k-bd: #059669 !important; 
                --k-cl: #fff !important;
                transform: translateY(2px) scale(0.95);
                z-index: 20;
            }
            .dark .key-btn.active {
                --k-bd: #047857 !important;
            }

            /* Style Cơ Bản Phím */
            .key-btn:not(.jis-enter-container):not(.tall-key) { 
                flex: 1; 
                height: 100%; /* Lấp đầy chiều cao 54px của row */
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                border-radius: 8px; font-size: 13px; font-weight: 600;
                background: var(--k-bg); border: 1px solid var(--k-bd); color: var(--k-cl);
                box-shadow: 0 2px 0 rgba(0,0,0,0.02);
                transition: all 0.1s;
                position: relative;
                overflow: hidden;
                padding: 4px;
                text-align: center;
                line-height: 1.2;
            }
            .dark .key-btn:not(.jis-enter-container):not(.tall-key) { box-shadow: 0 2px 0 rgba(0,0,0,0.2); }
            
            /* --- Numpad Tall Keys (+ & Enter) --- */
            .tall-key {
                position: absolute; top: 0; left: 0; right: 0;
                height: calc(200% + 4px); /* Cao gấp 2 lần Row + khoảng cách Gap */
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                border-radius: 8px; font-size: 13px; font-weight: 600;
                background: var(--k-bg); border: 1px solid var(--k-bd); color: var(--k-cl);
                box-shadow: 0 2px 0 rgba(0,0,0,0.02);
                transition: all 0.1s; z-index: 10;
            }
            .dark .tall-key { box-shadow: 0 2px 0 rgba(0,0,0,0.2); }

            /* --- JIS ENTER SHAPE HACK --- */
            .jis-enter-container {
                position: absolute; top: 0; right: 0; 
                width: 100%; height: calc(200% + 4px); 
                background: transparent !important; border: none !important; box-shadow: none !important;
                color: var(--k-cl); z-index: 10; transition: transform 0.1s;
            }
            .jis-enter-top {
                position: absolute; top: 0; right: 0; left: 0; 
                height: calc(50% - 2px); 
                background: var(--k-bg); border: 1px solid var(--k-bd);
                border-radius: 8px 8px 0 8px; transition: all 0.1s;
            }
            .jis-enter-bottom {
                position: absolute; bottom: 0; right: 0; 
                width: 83.33%; height: calc(50% + 2px); 
                background: var(--k-bg); border: 1px solid var(--k-bd);
                border-radius: 8px 0 8px 8px; transition: all 0.1s;
            }
            .jis-enter-join {
                position: absolute; top: calc(50% - 4px); right: 1px; 
                width: calc(83.33% - 2px); height: 5px;
                background: var(--k-bg); z-index: 2; transition: all 0.1s;
            }

            /* --- Cụm phím mũi tên M3 Mac --- */
            .key-col { display: flex; flex-direction: column; gap: 4px; height: 100%; }
            .key-col .key-btn { 
                height: 25px !important; 
                flex: unset; 
                padding: 0 !important;
            }
            .key-col-spacer {
                flex: unset; visibility: hidden; height: 25px;
            }

            /* Tỷ Lệ Vàng (Golden Flex Proportions) đảm bảo tổng bằng 15 Units */
            .f-1 { flex: 1; } .f-1-25 { flex: 1.25; } .f-1-5 { flex: 1.5; } 
            .f-1-75 { flex: 1.75; } .f-2 { flex: 2; } .f-2-25 { flex: 2.25; } 
            .f-2-75 { flex: 2.75; } .f-3-25 { flex: 3.25; } .f-4 { flex: 4; } 
            .f-5-5 { flex: 5.5; } .f-space { flex: 6.25; }
            .key-spacer { flex: 0.5; visibility: hidden; } 

            .key-sub { font-size: 10px; opacity: 0.7; position: absolute; top: 4px; left: 8px; }
            .key-main { margin-top: auto; margin-bottom: auto; display: flex; gap: 6px; align-items: center; }

            #key-history-list li { animation: slideIn 0.2s ease-out; }
            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

            /* --- Mouse Tester Styles --- */
            .mouse-btn-part { transition: all 0.1s; }
            .mouse-active-left { background-color: #3b82f6 !important; }
            .mouse-active-right { background-color: #ef4444 !important; }
            .mouse-active-mid { background-color: #10b981 !important; transform: translateY(2px); }
            .mouse-active-scroll-up { box-shadow: 0 -8px 0 0 rgba(16, 185, 129, 0.4) inset; }
            .mouse-active-scroll-down { box-shadow: 0 8px 0 0 rgba(16, 185, 129, 0.4) inset; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1250px] mx-auto min-h-[600px] pb-10 px-4">
            
            <div class="mb-6 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Kiểm Tra Bàn Phím và Chuột</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Kiểm tra hoạt động của bàn phím và chuột.</p>
            </div>

            <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 md:p-8 ui-fade-in" style="animation-delay: 100ms;">
                
                <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div class="flex flex-wrap gap-2 bg-zinc-50 dark:bg-zinc-800/30 p-1.5 rounded-2xl w-fit">
                        <button class="layout-btn btn-premium px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[11px] font-bold border border-transparent" data-layout="108">108-Key (Full)</button>
                        <button class="layout-btn btn-premium px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[11px] font-bold border border-transparent" data-layout="tkl">TKL (87)</button>
                        <button class="layout-btn btn-premium px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[11px] font-bold border border-transparent" data-layout="60">60% Layout</button>
                        <button class="layout-btn btn-premium px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[11px] font-bold border border-transparent" data-layout="mac">Mac US</button>
                        <button class="layout-btn active btn-premium px-4 py-2 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-[11px] font-bold shadow-sm" data-layout="macjis">Mac JIS</button>
                    </div>
                    <button id="reset-btn" class="btn-premium px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                        <i class="fas fa-trash-alt"></i> Reset Test
                    </button>
                </div>

                <div class="w-full overflow-x-auto custom-scrollbar pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div id="keyboard-render-area" class="kb-wrapper">
                        </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                    <div class="col-span-1 space-y-4">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Event Lần Cuối</h3>
                        <div class="space-y-3">
                            <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-3 flex justify-between items-center ring-1 ring-inset ring-zinc-100 dark:ring-zinc-800">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase">Key</span>
                                <span id="info-key" class="text-sm font-black text-zinc-900 dark:text-white">-</span>
                            </div>
                            <div class="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-3 flex justify-between items-center ring-1 ring-inset ring-zinc-100 dark:ring-zinc-800">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase">Code</span>
                                <span id="info-code" class="text-sm font-black text-zinc-900 dark:text-white">-</span>
                            </div>
                        </div>
                        <div class="mt-4 p-4 bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                            <h4 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Anti-Ghosting</h4>
                            <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">Đang giữ: <strong id="ghosting-count" class="text-emerald-600 dark:text-emerald-400 text-xl ml-1">0</strong></p>
                        </div>
                    </div>

                    <div class="col-span-1 md:col-span-2 flex flex-col h-[230px]">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Lịch sử phím</h3>
                            <button id="clear-history" class="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Xóa</button>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 bg-zinc-50/50 dark:bg-zinc-800/10 rounded-2xl p-2 border border-zinc-100 dark:border-zinc-800/50">
                            <ul id="key-history-list" class="space-y-2">
                                <li class="text-xs text-zinc-400 dark:text-zinc-500 italic text-center mt-4">Chưa có thao tác nào</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div id="mouse-tester-area" class="mt-8 ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 md:p-8 ui-fade-in" style="animation-delay: 200ms;">
                <div class="flex items-center justify-between mb-8">
                    <h3 class="text-lg font-black text-zinc-900 dark:text-white">Mouse Tester</h3>
                    <span class="text-xs font-medium text-zinc-500 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">Test right here</span>
                </div>
                <div class="flex flex-col md:flex-row gap-12 items-center justify-center">
                    
                    <div id="mouse-model" class="relative w-36 h-56 border-[3px] border-zinc-200 dark:border-zinc-700 rounded-[3rem] flex flex-col items-center p-3 gap-2 shadow-sm bg-zinc-50 dark:bg-zinc-800/20">
                        <div class="flex w-full gap-2 h-20">
                            <div id="mouse-left" class="mouse-btn-part flex-1 rounded-tl-[2rem] rounded-bl-xl bg-zinc-200 dark:bg-zinc-700"></div>
                            <div id="mouse-mid-container" class="w-8 h-12 mx-auto self-center flex items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <div id="mouse-mid" class="mouse-btn-part w-full h-full rounded-full bg-zinc-300 dark:bg-zinc-600"></div>
                            </div>
                            <div id="mouse-right" class="mouse-btn-part flex-1 rounded-tr-[2rem] rounded-br-xl bg-zinc-200 dark:bg-zinc-700"></div>
                        </div>
                        <div id="mouse-body" class="mouse-btn-part flex-1 w-full rounded-b-[2rem] bg-zinc-200 dark:bg-zinc-700 mt-1 flex flex-col items-center justify-center opacity-80">
                            <i class="fas fa-arrows-alt text-zinc-400 dark:text-zinc-500 mb-1"></i>
                        </div>
                    </div>

                    <div class="space-y-4 w-full md:w-64">
                        <div class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-4 ring-1 ring-inset ring-zinc-100 dark:ring-zinc-800">
                            <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Click</span>
                            <span id="mouse-btn-info" class="text-sm font-black text-zinc-900 dark:text-white">-</span>
                        </div>
                        <div class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-4 ring-1 ring-inset ring-zinc-100 dark:ring-zinc-800">
                            <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Scroll</span>
                            <span id="mouse-scroll-info" class="text-sm font-black text-zinc-900 dark:text-white">-</span>
                        </div>
                        <div class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-4 ring-1 ring-inset ring-zinc-100 dark:ring-zinc-800">
                            <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Pointer</span>
                            <span id="mouse-pos-info" class="text-[13px] font-black font-mono text-zinc-900 dark:text-white">X: 0, Y: 0</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;
}

export function init() {
    // ==========================================
    // 1. DATA & RENDER KEYBOARD (Đã cập nhật Icon & Tỷ lệ chuẩn)
    // ==========================================
    const kbData = {
        // --- STANDARD ANSI (Main) ---
        mainRow0: [{c:'⎋ Esc',k:'Escape'},{w:'key-spacer'},{c:'F1',k:'F1'},{c:'F2',k:'F2'},{c:'F3',k:'F3'},{c:'F4',k:'F4'},{w:'key-spacer'},{c:'F5',k:'F5'},{c:'F6',k:'F6'},{c:'F7',k:'F7'},{c:'F8',k:'F8'},{w:'key-spacer'},{c:'F9',k:'F9'},{c:'F10',k:'F10'},{c:'F11',k:'F11'},{c:'F12',k:'F12'}],
        mainRow1: [{s:'~',c:'`',k:'Backquote'},{s:'!',c:'1',k:'Digit1'},{s:'@',c:'2',k:'Digit2'},{s:'#',c:'3',k:'Digit3'},{s:'$',c:'4',k:'Digit4'},{s:'%',c:'5',k:'Digit5'},{s:'^',c:'6',k:'Digit6'},{s:'&',c:'7',k:'Digit7'},{s:'*',c:'8',k:'Digit8'},{s:'(',c:'9',k:'Digit9'},{s:')',c:'0',k:'Digit0'},{s:'_',c:'-',k:'Minus'},{s:'+',c:'=',k:'Equal'},{c:'<i class="fas fa-backspace text-sm"></i>',k:'Backspace',w:'f-2'}],
        mainRow2: [{c:'⇥ Tab',k:'Tab',w:'f-1-5'},{c:'Q',k:'KeyQ'},{c:'W',k:'KeyW'},{c:'E',k:'KeyE'},{c:'R',k:'KeyR'},{c:'T',k:'KeyT'},{c:'Y',k:'KeyY'},{c:'U',k:'KeyU'},{c:'I',k:'KeyI'},{c:'O',k:'KeyO'},{c:'P',k:'KeyP'},{s:'{',c:'[',k:'BracketLeft'},{s:'}',c:']',k:'BracketRight'},{s:'|',c:'\\',k:'Backslash',w:'f-1-5'}],
        mainRow3: [{c:'⇪ Caps',k:'CapsLock',w:'f-1-75'},{c:'A',k:'KeyA'},{c:'S',k:'KeyS'},{c:'D',k:'KeyD'},{c:'F',k:'KeyF'},{c:'G',k:'KeyG'},{c:'H',k:'KeyH'},{c:'J',k:'KeyJ'},{c:'K',k:'KeyK'},{c:'L',k:'KeyL'},{s:':',c:';',k:'Semicolon'},{s:'"',c:"'",k:'Quote'},{c:'↵ Enter',k:'Enter',w:'f-2-25'}],
        mainRow4: [{c:'⇧ Shift',k:'ShiftLeft',w:'f-2-25'},{c:'Z',k:'KeyZ'},{c:'X',k:'KeyX'},{c:'C',k:'KeyC'},{c:'V',k:'KeyV'},{c:'B',k:'KeyB'},{c:'N',k:'KeyN'},{c:'M',k:'KeyM'},{s:'<',c:',',k:'Comma'},{s:'>',c:'.',k:'Period'},{s:'?',c:'/',k:'Slash'},{c:'⇧ Shift',k:'ShiftRight',w:'f-2-75'}],
        mainRow5: [{c:'⌃ Ctrl',k:'ControlLeft',w:'f-1-25'},{c:'<i class="fab fa-windows"></i>',k:'MetaLeft',w:'f-1-25'},{c:'⎇ Alt',k:'AltLeft',w:'f-1-25'},{c:'',k:'Space',w:'f-space'},{c:'⎇ Alt',k:'AltRight',w:'f-1-25'},{c:'<i class="fab fa-windows"></i>',k:'MetaRight',w:'f-1-25'},{c:'<i class="fas fa-bars"></i>',k:'ContextMenu',w:'f-1-25'},{c:'⌃ Ctrl',k:'ControlRight',w:'f-1-25'}],
        
        // --- M3 MACBOOK PRO US ---
        macUSRow0: [{c:'⎋ esc',k:'Escape',w:'f-1-5'},{c:'F1',k:'F1'},{c:'F2',k:'F2'},{c:'F3',k:'F3'},{c:'F4',k:'F4'},{c:'F5',k:'F5'},{c:'F6',k:'F6'},{c:'F7',k:'F7'},{c:'F8',k:'F8'},{c:'F9',k:'F9'},{c:'F10',k:'F10'},{c:'F11',k:'F11'},{c:'F12',k:'F12'},{c:'<i class="fas fa-fingerprint"></i>',k:'Power',w:'f-1-5'}],
        macUSRow5: [{c:'🌐 fn',k:'Fn',w:'f-1'},{c:'⌃ ctrl',k:'ControlLeft',w:'f-1'},{c:'⌥ opt',k:'AltLeft',w:'f-1'},{c:'⌘ cmd',k:'MetaLeft',w:'f-1-25'},{c:'',k:'Space',w:'f-5-5'},{c:'⌘ cmd',k:'MetaRight',w:'f-1-25'},{c:'⌥ opt',k:'AltRight',w:'f-1'},{t:'col', w:'f-1', keys: [{t:'spacer'}, {c:'◀',k:'ArrowLeft'}]},{t:'col', w:'f-1', keys: [{c:'▲',k:'ArrowUp'}, {c:'▼',k:'ArrowDown'}]},{t:'col', w:'f-1', keys: [{t:'spacer'}, {c:'▶',k:'ArrowRight'}]}],

        // --- M3 MACBOOK PRO JIS ---
        macJisRow0: [{c:'⎋ esc',k:'Escape',w:'f-1-5'},{c:'F1',k:'F1'},{c:'F2',k:'F2'},{c:'F3',k:'F3'},{c:'F4',k:'F4'},{c:'F5',k:'F5'},{c:'F6',k:'F6'},{c:'F7',k:'F7'},{c:'F8',k:'F8'},{c:'F9',k:'F9'},{c:'F10',k:'F10'},{c:'F11',k:'F11'},{c:'F12',k:'F12'},{c:'<i class="fas fa-fingerprint"></i>',k:'Power',w:'f-1-5'}],
        macJisRow1: [{s:'!',c:'1',k:'Digit1'},{s:'"',c:'2',k:'Digit2'},{s:'#',c:'3',k:'Digit3'},{s:'$',c:'4',k:'Digit4'},{s:'%',c:'5',k:'Digit5'},{s:'&',c:'6',k:'Digit6'},{s:"'",c:'7',k:'Digit7'},{s:'(',c:'8',k:'Digit8'},{s:')',c:'9',k:'Digit9'},{s:'',c:'0',k:'Digit0'},{s:'=',c:'-',k:'Minus'},{s:'~',c:'^',k:'Equal'},{s:'|',c:'¥',k:'IntlYen'},{c:'<i class="fas fa-backspace"></i>',k:'Backspace',w:'f-2'}],
        macJisRow2: [{c:'⇥ tab',k:'Tab',w:'f-1-5'},{c:'Q',k:'KeyQ'},{c:'W',k:'KeyW'},{c:'E',k:'KeyE'},{c:'R',k:'KeyR'},{c:'T',k:'KeyT'},{c:'Y',k:'KeyY'},{c:'U',k:'KeyU'},{c:'I',k:'KeyI'},{c:'O',k:'KeyO'},{c:'P',k:'KeyP'},{s:'`',c:'@',k:'BracketLeft'},{s:'{',c:'[',k:'BracketRight'},{c:'↵ enter',k:'Enter',w:'f-1-5', type:'jis-enter'}],
        macJisRow3: [{c:'⌃ ctrl',k:'ControlLeft',w:'f-1-75'},{c:'A',k:'KeyA'},{c:'S',k:'KeyS'},{c:'D',k:'KeyD'},{c:'F',k:'KeyF'},{c:'G',k:'KeyG'},{c:'H',k:'KeyH'},{c:'J',k:'KeyJ'},{c:'K',k:'KeyK'},{c:'L',k:'KeyL'},{s:'+',c:';',k:'Semicolon'},{s:'*',c:':',k:'Quote'},{s:'}',c:']',k:'Backslash'},{w:'f-1-25', type:'jis-spacer'}],
        macJisRow4: [{c:'⇧ shift',k:'ShiftLeft',w:'f-2-25'},{c:'Z',k:'KeyZ'},{c:'X',k:'KeyX'},{c:'C',k:'KeyC'},{c:'V',k:'KeyV'},{c:'B',k:'KeyB'},{c:'N',k:'KeyN'},{c:'M',k:'KeyM'},{s:'<',c:',',k:'Comma'},{s:'>',c:'.',k:'Period'},{s:'?',c:'/',k:'Slash'},{s:'_',c:'\\',k:'IntlRo'},{c:'⇧ shift',k:'ShiftRight',w:'f-1-75'}],
        macJisRow5: [{c:'⇪ caps',k:'CapsLock',w:'f-1-25'},{c:'⌥ opt',k:'AltLeft',w:'f-1-25'},{c:'⌘ cmd',k:'MetaLeft',w:'f-1-25'},{c:'英数',k:'Lang2',w:'f-1-25'},{c:'',k:'Space',w:'f-3-25'},{c:'かな',k:'Lang1',w:'f-1-25'},{c:'⌘ cmd',k:'MetaRight',w:'f-1-25'},{c:'🌐 fn',k:'Fn',w:'f-1-25'},{t:'col', w:'f-1', keys: [{t:'spacer'}, {c:'◀',k:'ArrowLeft'}]},{t:'col', w:'f-1', keys: [{c:'▲',k:'ArrowUp'}, {c:'▼',k:'ArrowDown'}]},{t:'col', w:'f-1', keys: [{t:'spacer'}, {c:'▶',k:'ArrowRight'}]}],
        
        // --- NAV & 108 NUMPAD ---
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

    const container = document.getElementById('keyboard-render-area');
    const applyLayout = (type) => {
        container.innerHTML = layouts[type]();
        testedKeys.forEach(code => {
            document.querySelectorAll(`[data-code="${code}"]`).forEach(el => el.classList.add('tested'));
        });
    };

    const btns = document.querySelectorAll('.layout-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => {
                b.classList.remove('active', 'bg-white', 'dark:bg-[#121214]', 'border-zinc-200', 'dark:border-zinc-700', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
                b.classList.add('text-zinc-500', 'border-transparent');
            });
            btn.classList.add('active', 'bg-white', 'dark:bg-[#121214]', 'border-zinc-200', 'dark:border-zinc-700', 'text-zinc-900', 'dark:text-white', 'shadow-sm');
            btn.classList.remove('text-zinc-500', 'border-transparent');
            applyLayout(btn.dataset.layout);
        });
    });

    // ==========================================
    // 2. KEYBOARD STATE & EVENTS LOGIC
    // ==========================================
    const pressedKeys = new Set();
    const testedKeys = new Set();
    
    const elGhosting = document.getElementById('ghosting-count');
    const elInfoKey = document.getElementById('info-key');
    const elInfoCode = document.getElementById('info-code');
    const elHistoryList = document.getElementById('key-history-list');

    const updateEventInfo = (e) => {
        let displayKey = e.key === ' ' ? 'Space' : e.key;
        elInfoKey.textContent = displayKey;
        elInfoCode.textContent = e.code;
    };

    const addHistory = (e) => {
        const firstChild = elHistoryList.firstElementChild;
        if(firstChild && firstChild.tagName !== 'LI') elHistoryList.innerHTML = ''; 
        
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800';
        
        let displayKey = e.key === ' ' ? 'Space' : e.key;
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="min-w-8 h-8 px-2 rounded-md bg-white dark:bg-[#121214] flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700">${displayKey}</span>
                <span class="text-[11px] font-medium text-zinc-500">${e.code}</span>
            </div>
            <span class="text-[10px] text-zinc-400 font-mono">cd:${e.keyCode}</span>
        `;
        
        elHistoryList.prepend(li);
        if(elHistoryList.children.length > 50) elHistoryList.lastElementChild.remove();
    };

    const toggleKeyVisual = (code, isActive) => {
        const els = document.querySelectorAll(`[data-code="${code}"]`);
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

    window.addEventListener('keydown', (e) => {
        // [FIX EVKEY/UNIKEY]
        if (e.isComposing || e.keyCode === 229) {
            pressedKeys.forEach(code => toggleKeyVisual(code, false));
            pressedKeys.clear();
            elGhosting.textContent = '0';
            
            if (e.code) {
                testedKeys.add(e.code);
                document.querySelectorAll(`[data-code="${e.code}"]`).forEach(el => el.classList.add('tested'));
            }
            return;
        }

        if (e.code && !e.code.includes('Mouse')) { // Tránh conflict nếu có fake event
            e.preventDefault(); 
            pressedKeys.add(e.code);
            elGhosting.textContent = pressedKeys.size;
            testedKeys.add(e.code);
            
            updateEventInfo(e);
            toggleKeyVisual(e.code, true);
            
            if (!e.repeat) addHistory(e);
        }
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
        if (e.code) {
            pressedKeys.delete(e.code);
            elGhosting.textContent = pressedKeys.size;
            toggleKeyVisual(e.code, false);
        }
    });

    window.addEventListener('blur', () => {
        pressedKeys.forEach(code => toggleKeyVisual(code, false));
        pressedKeys.clear();
        elGhosting.textContent = '0';
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        testedKeys.clear();
        pressedKeys.clear();
        elGhosting.textContent = '0';
        document.querySelectorAll('[data-code]').forEach(el => el.classList.remove('active', 'tested'));
        UI.showAlert('Đã Reset', 'Toàn bộ trạng thái test đã được làm mới.', 'success');
    });

    document.getElementById('clear-history').addEventListener('click', () => {
        elHistoryList.innerHTML = '<li class="text-xs text-zinc-400 dark:text-zinc-500 italic text-center mt-4">Chưa có thao tác nào</li>';
        elInfoKey.textContent = '-'; elInfoCode.textContent = '-';
    });

    // ==========================================
    // 3. MOUSE TESTER LOGIC
    // ==========================================
    const mouseLeft = document.getElementById('mouse-left');
    const mouseMid = document.getElementById('mouse-mid');
    const mouseRight = document.getElementById('mouse-right');
    const mouseMidContainer = document.getElementById('mouse-mid-container');
    const mouseBtnInfo = document.getElementById('mouse-btn-info');
    const mouseScrollInfo = document.getElementById('mouse-scroll-info');
    const mousePosInfo = document.getElementById('mouse-pos-info');
    const mouseTesterArea = document.getElementById('mouse-tester-area');

    // Cập nhật vị trí trỏ chuột
    window.addEventListener('mousemove', (e) => {
        mousePosInfo.textContent = `X: ${e.clientX}, Y: ${e.clientY}`;
    });

    // Xử lý Click
    window.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            mouseLeft.classList.add('mouse-active-left');
            mouseBtnInfo.textContent = 'Left Click';
            mouseBtnInfo.className = 'text-sm font-black text-blue-500';
        }
        if (e.button === 1) {
            e.preventDefault(); // Ngăn auto-scroll behavior
            mouseMid.classList.add('mouse-active-mid');
            mouseBtnInfo.textContent = 'Middle Click';
            mouseBtnInfo.className = 'text-sm font-black text-emerald-500';
        }
        if (e.button === 2) {
            mouseRight.classList.add('mouse-active-right');
            mouseBtnInfo.textContent = 'Right Click';
            mouseBtnInfo.className = 'text-sm font-black text-red-500';
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) mouseLeft.classList.remove('mouse-active-left');
        if (e.button === 1) mouseMid.classList.remove('mouse-active-mid');
        if (e.button === 2) mouseRight.classList.remove('mouse-active-right');
        
        // Reset info view if no buttons held
        if (e.buttons === 0) {
            mouseBtnInfo.textContent = '-';
            mouseBtnInfo.className = 'text-sm font-black text-zinc-900 dark:text-white';
        }
    });

    // Xử lý Scroll
    let scrollTimeout;
    window.addEventListener('wheel', (e) => {
        // Chỉ ngăn chặn scroll trang nếu người dùng cuộn ở trong tester area
        if(e.target.closest('#mouse-tester-area')) {
            e.preventDefault();
        }

        if (e.deltaY > 0) {
            mouseScrollInfo.textContent = 'Scroll Down';
            mouseScrollInfo.className = 'text-sm font-black text-emerald-500';
            mouseMidContainer.classList.add('mouse-active-scroll-down');
            mouseMidContainer.classList.remove('mouse-active-scroll-up');
        } else if (e.deltaY < 0) {
            mouseScrollInfo.textContent = 'Scroll Up';
            mouseScrollInfo.className = 'text-sm font-black text-emerald-500';
            mouseMidContainer.classList.add('mouse-active-scroll-up');
            mouseMidContainer.classList.remove('mouse-active-scroll-down');
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            mouseScrollInfo.textContent = '-';
            mouseScrollInfo.className = 'text-sm font-black text-zinc-900 dark:text-white';
            mouseMidContainer.classList.remove('mouse-active-scroll-up', 'mouse-active-scroll-down');
        }, 150);
    }, { passive: false });

    // Vô hiệu hóa Context Menu (Right Click) ở trang để tiện test Right Click
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Mặc định load layout Mac JIS
    applyLayout('macjis');
}