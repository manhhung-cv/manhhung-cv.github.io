import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 3px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            /* Nút bấm Premium: Click êm ái, không hover lòe loẹt */
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }

            /* Toggle Switch Phẳng */
            .toggle-premium { appearance: none; width: 32px; height: 18px; background: #e4e4e7; border-radius: 9px; position: relative; cursor: pointer; outline: none; transition: background 0.2s; }
            .dark .toggle-premium { background: #27272a; }
            .toggle-premium::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
            .dark .toggle-premium::after { background: #a1a1aa; }
            .toggle-premium:checked { background: #18181b; }
            .dark .toggle-premium:checked { background: #fff; }
            .toggle-premium:checked::after { transform: translateX(14px); background: #fff; }
            .dark .toggle-premium:checked::after { background: #18181b; }

            /* Checkbox Days dạng Tag */
            .day-tag input { display: none; }
            .day-tag:has(input:checked) div { background: #18181b; color: #fff; border-color: #18181b; }
            .dark .day-tag:has(input:checked) div { background: #fff; color: #18181b; border-color: #fff; }

            /* Radio Mode dạng Switch liền khối */
            .mode-switch input { display: none; }
            .mode-switch:has(input:checked) div { background: #18181b; color: #fff; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .dark .mode-switch:has(input:checked) div { background: #fff; color: #18181b; }

            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
            .is-ringing { animation: blink 1s infinite; color: #18181b !important; }
            .dark .is-ringing { color: #ffffff !important; }
        </style>

        <div class="relative flex flex-col w-full max-w-[540px] mx-auto min-h-[500px]">
            
            <div class="mb-6 px-2">
                <h2 class="text-[22px] font-bold text-zinc-900 dark:text-white tracking-tight leading-none mb-1">Thời Gian</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Bộ tiện ích đo lường & tính toán chuẩn xác.</p>
            </div>

            <div class="flex overflow-x-auto hide-scrollbar gap-2 mb-6 px-2 pb-2">
                <button class="tt-tab active btn-premium px-4 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[12px] font-bold whitespace-nowrap shrink-0" data-target="pane-timer">Đếm ngược</button>
                <button class="tt-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white transition-colors" data-target="pane-stopwatch">Bấm giờ</button>
                <button class="tt-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white transition-colors" data-target="pane-countday">Sự kiện</button>
                <button class="tt-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white transition-colors" data-target="pane-datecalc">Tính ngày</button>
                <button class="tt-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white transition-colors" data-target="pane-timecalc">Tính giờ</button>
                <button class="tt-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white transition-colors" data-target="pane-week">Số tuần</button>
                <button class="tt-tab btn-premium px-4 py-2.5 rounded-full bg-transparent text-zinc-500 text-[12px] font-bold whitespace-nowrap shrink-0 hover:text-zinc-900 dark:hover:text-white transition-colors" data-target="pane-age">Tuổi</button>
            </div>

            <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 shadow-sm overflow-hidden flex flex-col">
                
                <div id="pane-timer" class="tt-pane block animate-in fade-in">
                    <div class="bg-zinc-50/50 dark:bg-transparent px-6 py-12 flex flex-col items-center justify-center border-b border-zinc-100 dark:border-zinc-800/50 relative">
                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 absolute top-6" id="tm-status">Đã sẵn sàng</div>
                        <div class="text-[5.5rem] font-black text-zinc-900 dark:text-white font-mono tracking-tighter leading-none" id="tm-display">25:00</div>
                    </div>
                    
                    <div class="p-6">
                        <div class="grid grid-cols-3 gap-3 mb-6">
                            <div class="relative bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl p-2 flex flex-col items-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Giờ</span>
                                <input type="number" id="tm-h" value="0" min="0" max="99" class="w-full bg-transparent border-none outline-none text-center font-bold text-xl text-zinc-900 dark:text-white p-0">
                            </div>
                            <div class="relative bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl p-2 flex flex-col items-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Phút</span>
                                <input type="number" id="tm-m" value="25" min="0" max="59" class="w-full bg-transparent border-none outline-none text-center font-bold text-xl text-zinc-900 dark:text-white p-0">
                            </div>
                            <div class="relative bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl p-2 flex flex-col items-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Giây</span>
                                <input type="number" id="tm-s" value="0" min="0" max="59" class="w-full bg-transparent border-none outline-none text-center font-bold text-xl text-zinc-900 dark:text-white p-0">
                            </div>
                        </div>

                        <div class="flex justify-center gap-2 mb-8">
                            <button class="btn-premium tm-quick px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold" data-m="1">+1p</button>
                            <button class="btn-premium tm-quick px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold" data-m="5">+5p</button>
                            <button class="btn-premium tm-quick px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold" data-m="15">+15p</button>
                            <button class="btn-premium tm-quick px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold" data-m="25">Pomodoro</button>
                        </div>

                        <div class="flex gap-3">
                            <button id="btn-tm-reset" class="btn-premium w-1/3 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[13px]">Đặt lại</button>
                            <button id="btn-tm-start" class="btn-premium flex-1 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[13px] tracking-wide">BẮT ĐẦU</button>
                        </div>
                    </div>
                </div>

                <div id="pane-stopwatch" class="tt-pane hidden animate-in fade-in flex flex-col h-[520px]">
                    <div class="bg-zinc-50/50 dark:bg-transparent px-6 py-12 flex flex-col items-center justify-center border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
                        <div class="text-[4rem] sm:text-[4.5rem] font-black text-zinc-900 dark:text-white font-mono tracking-tighter leading-none" id="sw-display">00:00<span class="text-2xl text-zinc-400">.00</span></div>
                    </div>
                    
                    <div id="sw-laps" class="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col px-6 py-2">
                        <div class="text-center text-[11px] font-medium text-zinc-400 py-10 opacity-50">Chưa có vòng chạy.</div>
                    </div>

                    <div class="p-6 shrink-0 bg-white dark:bg-[#0c0c0e] border-t border-zinc-100 dark:border-zinc-800/50">
                        <button id="btn-sw-start" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[13px] tracking-wide mb-3">BẮT ĐẦU</button>
                        <div class="flex gap-3">
                            <button id="btn-sw-lap" class="btn-premium flex-1 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[12px] opacity-50 pointer-events-none" disabled>Ghi Vòng</button>
                            <button id="btn-sw-reset" class="btn-premium flex-1 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[12px]">Xóa</button>
                        </div>
                    </div>
                </div>

                <div id="pane-countday" class="tt-pane hidden animate-in fade-in">
                    <div class="bg-zinc-50/50 dark:bg-transparent px-6 py-12 flex flex-col items-center justify-center border-b border-zinc-100 dark:border-zinc-800/50">
                        <div class="text-[3.5rem] font-black text-zinc-900 dark:text-white font-mono tracking-tighter leading-none mb-3 text-center" id="cd-display">0<span class="text-xl text-zinc-400 font-sans font-bold">n</span> 0<span class="text-xl text-zinc-400 font-sans font-bold">g</span></div>
                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest" id="cd-status">Thời gian còn lại</div>
                    </div>

                    <div class="p-6 space-y-6">
                        <div class="bg-zinc-100/50 dark:bg-zinc-800/30 p-4 rounded-2xl">
                            <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Ngày giờ sự kiện</label>
                            <input type="datetime-local" id="cd-target" class="w-full bg-transparent border-none outline-none font-bold text-base text-zinc-900 dark:text-white p-0 cursor-pointer">
                        </div>
                        
                        <div>
                            <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-3 text-center">Hoặc chọn nhanh</label>
                            <div class="flex justify-center flex-wrap gap-2">
                                <button class="btn-premium cd-quick px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold" data-type="newyear">Năm mới</button>
                                <button class="btn-premium cd-quick px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold" data-type="valentine">Valentine</button>
                                <button class="btn-premium cd-quick px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold" data-type="christmas">Giáng sinh</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="pane-datecalc" class="tt-pane hidden animate-in fade-in">
                    <div class="p-6 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                        <div class="flex bg-zinc-100/80 dark:bg-zinc-800/50 rounded-[14px] p-1">
                            <label class="mode-switch flex-1 cursor-pointer">
                                <input type="radio" name="dc-mode" value="diff" checked>
                                <div class="text-center py-2 rounded-xl text-[12px] font-medium text-zinc-500 transition-all">Tính khoảng cách</div>
                            </label>
                            <label class="mode-switch flex-1 cursor-pointer">
                                <input type="radio" name="dc-mode" value="addsub">
                                <div class="text-center py-2 rounded-xl text-[12px] font-medium text-zinc-500 transition-all">Cộng / Trừ ngày</div>
                            </label>
                        </div>
                    </div>

                    <div class="p-6">
                        <div id="dc-mode-diff" class="space-y-5 animate-in fade-in">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Từ ngày</label>
                                    <input type="date" id="dc-start" class="dc-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0">
                                </div>
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Đến ngày</label>
                                    <input type="date" id="dc-end" class="dc-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0">
                                </div>
                            </div>
                            
                            <label class="flex items-center justify-between cursor-pointer py-1">
                                <span class="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">Tính cả ngày cuối (+1)</span>
                                <input type="checkbox" id="dc-inc-last" class="dc-trigger toggle-premium">
                            </label>

                            <div>
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Không đếm các ngày (Nghỉ)</label>
                                <div class="flex gap-1.5 justify-between">
                                    <label class="day-tag flex-1 cursor-pointer"><input type="checkbox" value="1" class="dc-exc dc-trigger"><div class="py-2 rounded-xl text-center text-[11px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 transition-colors">T2</div></label>
                                    <label class="day-tag flex-1 cursor-pointer"><input type="checkbox" value="2" class="dc-exc dc-trigger"><div class="py-2 rounded-xl text-center text-[11px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 transition-colors">T3</div></label>
                                    <label class="day-tag flex-1 cursor-pointer"><input type="checkbox" value="3" class="dc-exc dc-trigger"><div class="py-2 rounded-xl text-center text-[11px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 transition-colors">T4</div></label>
                                    <label class="day-tag flex-1 cursor-pointer"><input type="checkbox" value="4" class="dc-exc dc-trigger"><div class="py-2 rounded-xl text-center text-[11px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 transition-colors">T5</div></label>
                                    <label class="day-tag flex-1 cursor-pointer"><input type="checkbox" value="5" class="dc-exc dc-trigger"><div class="py-2 rounded-xl text-center text-[11px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 transition-colors">T6</div></label>
                                    <label class="day-tag flex-1 cursor-pointer"><input type="checkbox" value="6" class="dc-exc dc-trigger"><div class="py-2 rounded-xl text-center text-[11px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 transition-colors">T7</div></label>
                                    <label class="day-tag flex-1 cursor-pointer"><input type="checkbox" value="0" class="dc-exc dc-trigger"><div class="py-2 rounded-xl text-center text-[11px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 transition-colors">CN</div></label>
                                </div>
                            </div>
                        </div>

                        <div id="dc-mode-add" class="hidden space-y-5 animate-in fade-in">
                            <div class="bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Ngày gốc</label>
                                <input type="date" id="dc-base" class="dc-trigger w-full bg-transparent border-none outline-none text-base font-bold text-zinc-900 dark:text-white p-0">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Thao tác</label>
                                    <select id="dc-op" class="dc-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white appearance-none p-0"><option value="add">Cộng (+) ngày</option><option value="sub">Trừ (-) ngày</option></select>
                                </div>
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Số lượng</label>
                                    <input type="number" id="dc-days" value="30" min="0" class="dc-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <div class="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Kết quả</div>
                        <div class="text-3xl font-black font-mono tracking-tighter" id="dc-res">--</div>
                    </div>
                </div>

                <div id="pane-timecalc" class="tt-pane hidden animate-in fade-in">
                    <div class="p-6 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                        <div class="flex bg-zinc-100/80 dark:bg-zinc-800/50 rounded-[14px] p-1">
                            <label class="mode-switch flex-1 cursor-pointer">
                                <input type="radio" name="tc-mode" value="dur" checked>
                                <div class="text-center py-2 rounded-xl text-[12px] font-medium text-zinc-500 transition-all">Tính khoảng giờ</div>
                            </label>
                            <label class="mode-switch flex-1 cursor-pointer">
                                <input type="radio" name="tc-mode" value="math">
                                <div class="text-center py-2 rounded-xl text-[12px] font-medium text-zinc-500 transition-all">Cộng / Trừ giờ</div>
                            </label>
                        </div>
                    </div>

                    <div class="p-6">
                        <div id="tc-mode-dur" class="space-y-5 animate-in fade-in">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl flex flex-col items-center text-center">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Bắt đầu</label>
                                    <input type="time" id="tc-start" value="08:00" class="tc-trigger bg-transparent border-none outline-none text-2xl font-black font-mono text-zinc-900 dark:text-white p-0 text-center w-full">
                                </div>
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl flex flex-col items-center text-center">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Kết thúc</label>
                                    <input type="time" id="tc-end" value="17:30" class="tc-trigger bg-transparent border-none outline-none text-2xl font-black font-mono text-zinc-900 dark:text-white p-0 text-center w-full">
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                                <label class="flex items-center gap-3 cursor-pointer flex-1">
                                    <input type="checkbox" id="tc-has-brk" class="tc-trigger toggle-premium" checked>
                                    <span class="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">Trừ giờ nghỉ</span>
                                </label>
                                <div class="flex items-center gap-1">
                                    <input type="number" id="tc-brk" value="60" min="0" class="tc-trigger w-12 bg-transparent border-none outline-none text-base font-bold text-right text-zinc-900 dark:text-white p-0 transition-opacity">
                                    <span class="text-[11px] font-bold text-zinc-400">phút</span>
                                </div>
                            </div>
                        </div>

                        <div id="tc-mode-math" class="hidden space-y-5 animate-in fade-in">
                            <div class="bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl flex flex-col items-center text-center">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Giờ gốc</label>
                                <input type="time" id="tc-base" value="10:00" class="tc-trigger bg-transparent border-none outline-none text-2xl font-black font-mono text-zinc-900 dark:text-white p-0 text-center w-full">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Thao tác</label>
                                    <select id="tc-op" class="tc-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white appearance-none p-0"><option value="add">Cộng (+)</option><option value="sub">Trừ (-)</option></select>
                                </div>
                                <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Lượng (H/M)</label>
                                    <div class="flex gap-1">
                                        <input type="number" id="tc-add-h" value="2" min="0" class="tc-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-center text-zinc-900 dark:text-white p-0">
                                        <span class="text-zinc-300 dark:text-zinc-700">:</span>
                                        <input type="number" id="tc-add-m" value="30" min="0" max="59" class="tc-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-center text-zinc-900 dark:text-white p-0">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <div class="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Kết quả</div>
                        <div class="text-[2.5rem] font-black font-mono tracking-tighter leading-none" id="tc-res">--</div>
                        <div class="text-[10px] font-bold opacity-80 mt-1 hidden" id="tc-res-dec"></div>
                    </div>
                </div>

                <div id="pane-week" class="tt-pane hidden animate-in fade-in">
                    <div class="p-6">
                        <div class="bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl mb-8">
                            <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 text-center">Kiểm tra số tuần của ngày</label>
                            <input type="date" id="wk-date" class="w-full bg-transparent border-none outline-none font-bold text-base text-zinc-900 dark:text-white p-0 text-center cursor-pointer">
                        </div>
                        
                        <div class="text-center">
                            <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Ngày này thuộc</div>
                            <div class="text-[4rem] font-black text-zinc-900 dark:text-white font-mono tracking-tighter leading-none mb-4" id="wk-num">Tuần --</div>
                            <div class="text-[13px] font-bold text-zinc-500 mb-2" id="wk-range">--</div>
                            <div class="text-[11px] font-medium text-zinc-400" id="wk-year">--</div>
                        </div>
                    </div>
                </div>

                <div id="pane-age" class="tt-pane hidden animate-in fade-in p-6">
                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Ngày sinh (DOB)</label>
                            <input type="date" id="age-dob" class="age-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0">
                        </div>
                        <div class="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Tính đến</label>
                            <input type="date" id="age-target" class="age-trigger w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0">
                        </div>
                    </div>
                    
                    <div class="text-center mb-8">
                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tuổi chính xác (Sinh <span id="age-wd" class="text-zinc-900 dark:text-white">--</span>)</div>
                        <div class="text-[1.8rem] font-black text-zinc-900 dark:text-white font-mono tracking-tighter leading-tight" id="age-main">--</div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-2">
                        <div class="bg-zinc-50 dark:bg-[#121214] rounded-2xl p-3 flex flex-col items-center"><span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Tháng</span><span class="text-sm font-black font-mono text-zinc-900 dark:text-white" id="age-m">--</span></div>
                        <div class="bg-zinc-50 dark:bg-[#121214] rounded-2xl p-3 flex flex-col items-center"><span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Tuần</span><span class="text-sm font-black font-mono text-zinc-900 dark:text-white" id="age-w">--</span></div>
                        <div class="bg-zinc-50 dark:bg-[#121214] rounded-2xl p-3 flex flex-col items-center"><span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Ngày</span><span class="text-sm font-black font-mono text-zinc-900 dark:text-white" id="age-d">--</span></div>
                        <div class="bg-zinc-50 dark:bg-[#121214] rounded-2xl p-3 flex flex-col items-center"><span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Giờ</span><span class="text-sm font-black font-mono text-zinc-900 dark:text-white" id="age-h">--</span></div>
                        <div class="bg-zinc-50 dark:bg-[#121214] rounded-2xl p-3 flex flex-col items-center"><span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Phút</span><span class="text-sm font-black font-mono text-zinc-900 dark:text-white" id="age-min">--</span></div>
                        <div class="bg-zinc-900 dark:bg-white rounded-2xl p-3 flex flex-col items-center"><span class="text-[9px] font-bold text-white/70 dark:text-black/70 uppercase tracking-widest mb-0.5">Giây (Live)</span><span class="text-sm font-black font-mono text-white dark:text-zinc-900" id="age-sec">--</span></div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    const format2 = (num) => num.toString().padStart(2, '0');
    const todayStr = new Date().toISOString().split('T')[0];

    // --- TABS LOGIC ---
    const tabs = document.querySelectorAll('.tt-tab');
    const panes = document.querySelectorAll('.tt-pane');
    
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => {
                t.classList.remove('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
                t.classList.add('bg-transparent', 'text-zinc-500');
            });
            tab.classList.add('active', 'bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900');
            tab.classList.remove('bg-transparent', 'text-zinc-500');
            
            panes.forEach(p => { p.classList.remove('block'); p.classList.add('hidden'); });
            document.getElementById(tab.dataset.target).classList.remove('hidden');
            document.getElementById(tab.dataset.target).classList.add('block');
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        };
    });

    // --- 1. TIMER ---
    const Timer = {
        h: document.getElementById('tm-h'), m: document.getElementById('tm-m'), s: document.getElementById('tm-s'),
        disp: document.getElementById('tm-display'), stat: document.getElementById('tm-status'),
        btnS: document.getElementById('btn-tm-start'), btnR: document.getElementById('btn-tm-reset'),
        interval: null, total: 0, isRun: false,
        init() {
            this.btnS.onclick = () => this.isRun ? this.pause() : this.start();
            this.btnR.onclick = () => this.reset();
            document.querySelectorAll('.tm-quick').forEach(b => {
                b.onclick = () => { this.reset(); this.h.value = 0; this.m.value = b.dataset.m; this.s.value = 0; this.updateDisp(0, parseInt(b.dataset.m), 0); };
            });
        },
        start() {
            if (this.total <= 0) this.total = (parseInt(this.h.value)||0)*3600 + (parseInt(this.m.value)||0)*60 + (parseInt(this.s.value)||0);
            if (this.total <= 0) return UI.showAlert('Lỗi', 'Đặt thời gian lớn hơn 0.', 'warning');
            
            this.isRun = true;
            this.btnS.textContent = 'TẠM DỪNG'; 
            this.stat.textContent = 'Đang chạy...'; this.disp.classList.remove('is-ringing');
            
            this.interval = setInterval(() => {
                this.total--; this.updateDisp();
                if (this.total <= 0) this.finish();
            }, 1000);
        },
        pause() {
            this.isRun = false; clearInterval(this.interval);
            this.btnS.textContent = 'TIẾP TỤC';
            this.stat.textContent = 'Đã tạm dừng';
        },
        finish() {
            this.pause(); this.btnS.textContent = 'BẮT ĐẦU';
            this.stat.textContent = 'HẾT GIỜ!';
            this.disp.classList.add('is-ringing');
        },
        reset() {
            this.pause(); this.total = 0;
            this.h.value = '0'; this.m.value = '25'; this.s.value = '0';
            this.updateDisp(0, 25, 0);
            this.stat.textContent = 'Đã sẵn sàng';
            this.disp.classList.remove('is-ringing'); this.btnS.textContent = 'BẮT ĐẦU';
        },
        updateDisp(th, tm, ts) {
            let h = th !== undefined ? th : Math.floor(this.total / 3600);
            let m = tm !== undefined ? tm : Math.floor((this.total % 3600) / 60);
            let s = ts !== undefined ? ts : this.total % 60;
            if (h > 0) {
                this.disp.textContent = `${format2(h)}:${format2(m)}:${format2(s)}`;
            } else {
                this.disp.textContent = `${format2(m)}:${format2(s)}`;
            }
        }
    }; Timer.init();

    // --- 2. STOPWATCH ---
    const Sw = {
        disp: document.getElementById('sw-display'), laps: document.getElementById('sw-laps'),
        btnS: document.getElementById('btn-sw-start'), btnL: document.getElementById('btn-sw-lap'), btnR: document.getElementById('btn-sw-reset'),
        startT: 0, elaps: 0, isRun: false, count: 0,
        init() {
            this.btnS.onclick = () => this.isRun ? this.pause() : this.start();
            this.btnL.onclick = () => this.lap();
            this.btnR.onclick = () => this.reset();
        },
        start() {
            this.isRun = true; this.startT = Date.now() - this.elaps;
            this.btnS.textContent = 'TẠM DỪNG';
            this.btnL.disabled = false; this.btnL.classList.remove('opacity-50', 'pointer-events-none');
            const loop = () => { this.elaps = Date.now() - this.startT; this.disp.innerHTML = this.fmt(this.elaps); if(this.isRun) requestAnimationFrame(loop); };
            requestAnimationFrame(loop);
        },
        pause() {
            this.isRun = false; this.btnS.textContent = 'TIẾP TỤC';
            this.btnL.disabled = true; this.btnL.classList.add('opacity-50', 'pointer-events-none');
        },
        lap() {
            this.count++;
            if (this.count === 1) this.laps.innerHTML = '';
            this.laps.insertAdjacentHTML('afterbegin', `<div class="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/50"><span class="text-[11px] font-bold text-zinc-400">Vòng ${format2(this.count)}</span><span class="text-sm font-mono font-bold text-zinc-900 dark:text-white">${this.fmt(this.elaps)}</span></div>`);
        },
        reset() {
            this.pause(); this.elaps = 0; this.count = 0; this.disp.innerHTML = '00:00<span class="text-2xl text-zinc-400">.00</span>';
            this.laps.innerHTML = '<div class="text-center text-[10px] font-medium text-zinc-400 py-10 opacity-50">Chưa có vòng chạy.</div>';
            this.btnS.textContent = 'BẮT ĐẦU';
        },
        fmt(ms) {
            let d = new Date(ms); let h = Math.floor(ms / 3600000); let m = d.getUTCMinutes(); let s = d.getUTCSeconds(); let mil = Math.floor(d.getUTCMilliseconds() / 10);
            if (h > 0) return `${format2(h)}:${format2(m)}:${format2(s)}<span class="text-2xl text-zinc-400">.${format2(mil)}</span>`;
            return `${format2(m)}:${format2(s)}<span class="text-2xl text-zinc-400">.${format2(mil)}</span>`;
        }
    }; Sw.init();

    // --- 3. COUNTDAY ---
    const Cd = {
        inp: document.getElementById('cd-target'), disp: document.getElementById('cd-display'), stat: document.getElementById('cd-status'), intv: null,
        init() {
            let t = new Date(); t.setDate(t.getDate() + 1); t.setHours(0,0,0,0);
            this.inp.value = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            this.inp.onchange = () => this.start();
            document.querySelectorAll('.cd-quick').forEach(b => {
                b.onclick = () => {
                    let y = new Date().getFullYear(); let n = new Date(); let tg;
                    if (b.dataset.type === 'newyear') tg = new Date(y+1, 0, 1);
                    else if (b.dataset.type === 'valentine') { tg = new Date(y, 1, 14); if(tg<n) tg.setFullYear(y+1); }
                    else if (b.dataset.type === 'christmas') { tg = new Date(y, 11, 25); if(tg<n) tg.setFullYear(y+1); }
                    this.inp.value = new Date(tg.getTime() - tg.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    this.start();
                };
            });
            this.start();
        },
        start() {
            clearInterval(this.intv);
            const tg = new Date(this.inp.value).getTime();
            const tick = () => {
                const df = tg - Date.now();
                if (df <= 0 || isNaN(df)) { this.disp.innerHTML = `0<span class="text-xl text-zinc-400 font-sans font-bold">n</span> 0<span class="text-xl text-zinc-400 font-sans font-bold">g</span>`; this.stat.textContent = 'SỰ KIỆN ĐÃ ĐẾN!'; this.stat.className = 'text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white is-ringing'; clearInterval(this.intv); return; }
                const d = Math.floor(df / 86400000); const h = Math.floor((df % 86400000) / 3600000); const m = Math.floor((df % 3600000) / 60000);
                this.disp.innerHTML = `${d}<span class="text-xl text-zinc-400 font-sans font-bold">n</span> ${h}<span class="text-xl text-zinc-400 font-sans font-bold">g</span>`;
                this.stat.textContent = 'Thời gian còn lại'; this.stat.className = 'text-[10px] font-bold text-zinc-400 uppercase tracking-widest';
            };
            tick(); this.intv = setInterval(tick, 1000);
        }
    }; Cd.init();

    // --- 4. DATE CALC ---
    const Dc = {
        init() {
            const rads = document.querySelectorAll('input[name="dc-mode"]');
            const dMode = document.getElementById('dc-mode-diff'); const aMode = document.getElementById('dc-mode-add');
            const s = document.getElementById('dc-start'); const e = document.getElementById('dc-end'); const inc = document.getElementById('dc-inc-last'); const exc = document.querySelectorAll('.dc-exc');
            const b = document.getElementById('dc-base'); const op = document.getElementById('dc-op'); const dys = document.getElementById('dc-days');
            const res = document.getElementById('dc-res');

            s.value = todayStr; let t = new Date(); t.setDate(t.getDate()+30); e.value = t.toISOString().split('T')[0]; b.value = todayStr;

            rads.forEach(r => r.onchange = () => { dMode.classList.toggle('hidden', r.value !== 'diff'); aMode.classList.toggle('hidden', r.value !== 'addsub'); calc(); });
            document.querySelectorAll('.dc-trigger').forEach(i => i.addEventListener('input', calc));

            function calc() {
                const mode = document.querySelector('input[name="dc-mode"]:checked').value;
                if (mode === 'diff') {
                    if (!s.value || !e.value) return res.textContent = '--';
                    let ds = new Date(s.value); ds.setHours(0,0,0,0); let de = new Date(e.value); de.setHours(0,0,0,0);
                    if (ds > de) [ds, de] = [de, ds];
                    let ex = Array.from(exc).filter(c => c.checked).map(c => parseInt(c.value));
                    let count = 0; let cur = new Date(ds);
                    while(cur < de) { if (!ex.includes(cur.getDay())) count++; cur.setDate(cur.getDate() + 1); }
                    if (inc.checked && !ex.includes(de.getDay())) count++;
                    res.innerHTML = `${count} <span class="text-xl text-zinc-400 font-sans font-bold">ngày</span>`;
                } else {
                    if (!b.value || !dys.value) return res.textContent = '--';
                    let base = new Date(b.value); let num = parseInt(dys.value); if(op.value === 'sub') num = -num;
                    base.setDate(base.getDate() + num);
                    res.innerHTML = `<span class="text-2xl tracking-normal">${base.toLocaleDateString('vi-VN')}</span>`;
                }
            }
            calc();
        }
    }; Dc.init();

    // --- 5. TIME CALC ---
    const Tc = {
        init() {
            const rads = document.querySelectorAll('input[name="tc-mode"]');
            const dMode = document.getElementById('tc-mode-dur'); const mMode = document.getElementById('tc-mode-math');
            const s = document.getElementById('tc-start'); const e = document.getElementById('tc-end'); const hB = document.getElementById('tc-has-brk'); const brk = document.getElementById('tc-brk');
            const b = document.getElementById('tc-base'); const op = document.getElementById('tc-op'); const aH = document.getElementById('tc-add-h'); const aM = document.getElementById('tc-add-m');
            const res = document.getElementById('tc-res'); const resD = document.getElementById('tc-res-dec');

            rads.forEach(r => r.onchange = () => { dMode.classList.toggle('hidden', r.value !== 'dur'); mMode.classList.toggle('hidden', r.value !== 'math'); calc(); });
            hB.onchange = () => { brk.disabled = !hB.checked; brk.classList.toggle('opacity-50', !hB.checked); calc(); };
            document.querySelectorAll('.tc-trigger').forEach(i => i.addEventListener('input', calc));

            function calc() {
                const mode = document.querySelector('input[name="tc-mode"]:checked').value;
                if (mode === 'dur') {
                    if (!s.value || !e.value) return res.textContent = '--';
                    let [s1, s2] = s.value.split(':').map(Number); let [e1, e2] = e.value.split(':').map(Number);
                    let bm = hB.checked ? (parseInt(brk.value) || 0) : 0;
                    let m1 = s1*60+s2; let m2 = e1*60+e2; if(m2<m1) m2 += 1440;
                    let tot = m2 - m1 - bm; if (tot < 0) tot = 0;
                    res.innerHTML = `${Math.floor(tot/60)}<span class="text-xl text-zinc-400 font-sans font-bold">g</span> ${tot%60}<span class="text-xl text-zinc-400 font-sans font-bold">p</span>`;
                    resD.textContent = `~ ${(tot/60).toFixed(2)} giờ thập phân`;
                    resD.classList.remove('hidden');
                } else {
                    resD.classList.add('hidden');
                    if (!b.value) return res.textContent = '--';
                    let [b1, b2] = b.value.split(':').map(Number);
                    let h = parseInt(aH.value)||0; let m = parseInt(aM.value)||0;
                    let tot = b1*60+b2; let add = h*60+m;
                    if (op.value === 'add') tot+=add; else tot-=add;
                    tot = ((tot%1440)+1440)%1440;
                    res.textContent = `${format2(Math.floor(tot/60))}:${format2(tot%60)}`;
                }
            }
            calc();
        }
    }; Tc.init();

    // --- 6. WEEK CALC ---
    const Wc = {
        init() {
            const inp = document.getElementById('wk-date'); const rN = document.getElementById('wk-num'); const rR = document.getElementById('wk-range'); const rY = document.getElementById('wk-year');
            inp.value = todayStr;
            const calc = () => {
                if (!inp.value) return; const d = new Date(inp.value);
                let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                let dN = date.getUTCDay() || 7; date.setUTCDate(date.getUTCDate() + 4 - dN);
                let yS = new Date(Date.UTC(date.getUTCFullYear(),0,1));
                let wNo = Math.ceil((((date - yS) / 86400000) + 1)/7);
                let dC = new Date(d); let day = dC.getDay(), df = dC.getDate() - day + (day===0?-6:1);
                let sW = new Date(dC.setDate(df)); let eW = new Date(dC.setDate(sW.getDate()+6));
                
                rN.textContent = `Tuần ${wNo}`;
                rR.textContent = `${sW.toLocaleDateString('vi-VN')} → ${eW.toLocaleDateString('vi-VN')}`;
                
                let d28 = new Date(date.getUTCFullYear(), 11, 28); let d28N = d28.getUTCDay()||7; d28.setUTCDate(d28.getUTCDate()+4-d28N);
                let mxW = Math.ceil((((d28 - new Date(Date.UTC(d28.getUTCFullYear(),0,1))) / 86400000) + 1)/7);
                rY.textContent = `Năm ISO ${date.getUTCFullYear()} có tổng ${mxW} tuần`;
            };
            inp.oninput = calc; calc();
        }
    }; Wc.init();

    // --- 7. AGE CALC ---
    const Ac = {
        init() {
            const dob = document.getElementById('age-dob'); const tg = document.getElementById('age-target');
            const wd = document.getElementById('age-wd'); const mn = document.getElementById('age-main');
            const m = document.getElementById('age-m'); const w = document.getElementById('age-w'); const d = document.getElementById('age-d'); const h = document.getElementById('age-h'); const min = document.getElementById('age-min'); const sec = document.getElementById('age-sec');
            let iv = null; tg.value = todayStr;
            const days = ['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];

            const calc = () => {
                clearInterval(iv); if(!dob.value || !tg.value) return;
                let d1 = new Date(dob.value); let d2 = new Date(tg.value);
                if (d1 > d2) return mn.textContent = '--';
                
                wd.textContent = days[d1.getDay()];
                let y = d2.getFullYear()-d1.getFullYear(); let mo = d2.getMonth()-d1.getMonth(); let da = d2.getDate()-d1.getDate();
                if(da<0){ mo--; da+=new Date(d2.getFullYear(), d2.getMonth(),0).getDate(); }
                if(mo<0){ y--; mo+=12; }
                mn.innerHTML = `${y}<span class="text-lg text-zinc-400 font-sans font-bold mr-1">n</span> ${mo}<span class="text-lg text-zinc-400 font-sans font-bold mr-1">t</span> ${da}<span class="text-lg text-zinc-400 font-sans font-bold">n</span>`;

                const isTdy = tg.value === todayStr;
                const tick = () => {
                    let tgt = isTdy ? Date.now() : d2.getTime(); let df = Math.max(0, tgt - d1.getTime());
                    let ts = Math.floor(df/1000); let tmi = Math.floor(ts/60); let th = Math.floor(tmi/60); let td = Math.floor(th/24); let tw = Math.floor(td/7);
                    let tmo = (d2.getFullYear()-d1.getFullYear())*12 + (d2.getMonth()-d1.getMonth()); if(d2.getDate()<d1.getDate()) tmo--;
                    
                    m.textContent = Math.max(0, tmo).toLocaleString('vi-VN'); w.textContent = tw.toLocaleString('vi-VN'); d.textContent = td.toLocaleString('vi-VN');
                    h.textContent = th.toLocaleString('vi-VN'); min.textContent = tmi.toLocaleString('vi-VN'); sec.textContent = ts.toLocaleString('vi-VN');
                };
                tick(); if(isTdy) iv = setInterval(tick, 1000);
            };
            dob.oninput = calc; tg.oninput = calc;
        }
    }; Ac.init();
}