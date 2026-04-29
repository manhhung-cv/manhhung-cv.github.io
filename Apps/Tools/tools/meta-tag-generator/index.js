import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Meta Tag Generator</h2>
                    <p class="text-sm text-zinc-500 mt-1">Tạo thẻ Meta chuẩn SEO. Lưu trữ và tạo HTML Boilerplate mạnh mẽ.</p>
                </div>
                
                <div class="flex flex-wrap items-center gap-2">
                    <button class="px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5" id="btn-mt-clear">
                        <i class="fas fa-trash-alt"></i> Xóa
                    </button>
                    <button class="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5" id="btn-mt-load">
                        <i class="fas fa-history"></i> Tải Local
                    </button>
                    <button class="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5" id="btn-mt-save">
                        <i class="fas fa-save"></i> Lưu Local
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs transition-all shadow-sm" id="btn-mt-export" title="Xuất file JSON">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs transition-all shadow-sm" id="btn-mt-import-trigger" title="Nhập file JSON">
                        <i class="fas fa-upload"></i>
                    </button>
                    <input type="file" id="file-mt-import" accept=".json" class="hidden">
                </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                <div class="xl:col-span-5 flex flex-col gap-4">
                    
                    <div class="premium-card bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden flex flex-col">
                        
                        <div class="flex overflow-x-auto hide-scrollbar border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30" id="form-tabs">
                            <button class="mini-tab-btn active px-4 py-3 text-[12px] font-bold text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-all whitespace-nowrap" data-target="form-basic">Cơ bản (SEO)</button>
                            <button class="mini-tab-btn px-4 py-3 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-b-2 border-transparent transition-all whitespace-nowrap" data-target="form-og">Open Graph (FB)</button>
                            <button class="mini-tab-btn px-4 py-3 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-b-2 border-transparent transition-all whitespace-nowrap" data-target="form-tw">Twitter</button>
                            <button class="mini-tab-btn px-4 py-3 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-b-2 border-transparent transition-all whitespace-nowrap" data-target="form-misc">Nâng cao</button>
                            <button class="mini-tab-btn px-4 py-3 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-b-2 border-transparent transition-all whitespace-nowrap" data-target="form-cdn">Tài nguyên</button>
                        </div>

                        <form id="meta-form" class="p-5">
                            
                            <div class="tab-content block animate-in fade-in" id="form-basic">
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between items-center mb-1.5">
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Tiêu đề trang (Title)</label>
                                            <span class="text-[10px] text-zinc-400 font-bold" id="cnt-title">0/60</span>
                                        </div>
                                        <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white transition-all overflow-hidden">
                                            <input type="text" class="meta-input w-full bg-transparent border-none px-3 py-2.5 outline-none text-[13px] font-semibold text-zinc-900 dark:text-white" id="in-title" placeholder="VD: Công cụ AIO Tools miễn phí">
                                            <button type="button" class="btn-paste px-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" data-target="in-title" title="Dán"><i class="fas fa-paste"></i></button>
                                        </div>
                                    </div>

                                    <div>
                                        <div class="flex justify-between items-center mb-1.5">
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Mô tả (Description)</label>
                                            <span class="text-[10px] text-zinc-400 font-bold" id="cnt-desc">0/160</span>
                                        </div>
                                        <textarea class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-[13px] text-zinc-900 dark:text-white resize-y min-h-[80px]" id="in-desc" placeholder="Mô tả ngắn gọn về trang web của bạn (Nên dưới 160 ký tự)..."></textarea>
                                    </div>

                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">URL Trang web</label>
                                            <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-900 transition-all overflow-hidden">
                                                <input type="url" class="meta-input w-full bg-transparent border-none px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-url" placeholder="https://example.com">
                                                <button type="button" class="btn-paste px-2 text-zinc-400 hover:text-zinc-900" data-target="in-url"><i class="fas fa-paste"></i></button>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Favicon URL</label>
                                            <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-900 transition-all overflow-hidden">
                                                <input type="url" class="meta-input w-full bg-transparent border-none px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-favicon" placeholder=".../favicon.ico">
                                                <button type="button" class="btn-paste px-2 text-zinc-400 hover:text-zinc-900" data-target="in-favicon"><i class="fas fa-paste"></i></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Từ khóa</label>
                                            <input type="text" class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-[13px] text-zinc-900 dark:text-white" id="in-keywords" placeholder="seo, tools">
                                        </div>
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Tác giả</label>
                                            <input type="text" class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-[13px] text-zinc-900 dark:text-white" id="in-author" placeholder="Tên của bạn">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tab-content hidden animate-in fade-in" id="form-og">
                                <div class="space-y-4">
                                    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl gap-2">
                                        <span class="text-[11px] text-emerald-600 dark:text-emerald-400"><i class="fas fa-info-circle"></i> Trống sẽ tự mượn tab Cơ bản.</span>
                                        <button type="button" class="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors" id="btn-sync-og">
                                            <i class="fas fa-sync-alt"></i> Điền nhanh
                                        </button>
                                    </div>

                                    <div>
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">OG Title (Tiêu đề FB)</label>
                                        <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-900 transition-all overflow-hidden">
                                            <input type="text" class="meta-input w-full bg-transparent border-none px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-og-title">
                                            <button type="button" class="btn-paste px-3 text-zinc-400 hover:text-zinc-900" data-target="in-og-title"><i class="fas fa-paste"></i></button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">OG Description</label>
                                        <textarea class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-[13px] text-zinc-900 dark:text-white resize-y min-h-[60px]" id="in-og-desc"></textarea>
                                    </div>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">OG Image URL</label>
                                            <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-900 transition-all overflow-hidden">
                                                <input type="url" class="meta-input w-full bg-transparent border-none px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-og-img">
                                                <button type="button" class="btn-paste px-2 text-zinc-400 hover:text-zinc-900" data-target="in-og-img"><i class="fas fa-paste"></i></button>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">OG Type</label>
                                            <select class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-og-type">
                                                <option value="website">Website</option>
                                                <option value="article">Article</option>
                                                <option value="product">Product</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tab-content hidden animate-in fade-in" id="form-tw">
                                <div class="space-y-4">
                                    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-xl gap-2">
                                        <span class="text-[11px] text-blue-600 dark:text-blue-400"><i class="fas fa-info-circle"></i> Trống sẽ tự mượn tab OG / Cơ bản.</span>
                                        <button type="button" class="px-3 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors" id="btn-sync-tw">
                                            <i class="fas fa-sync-alt"></i> Điền nhanh
                                        </button>
                                    </div>

                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Card Type</label>
                                            <select class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-tw-card">
                                                <option value="summary_large_image">Large Image</option>
                                                <option value="summary">Summary</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Site (@user)</label>
                                            <input type="text" class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-[13px] text-zinc-900 dark:text-white" id="in-tw-site" placeholder="@elonmusk">
                                        </div>
                                    </div>

                                    <div>
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Twitter Title</label>
                                        <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-900 transition-all overflow-hidden">
                                            <input type="text" class="meta-input w-full bg-transparent border-none px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-tw-title">
                                            <button type="button" class="btn-paste px-3 text-zinc-400 hover:text-zinc-900" data-target="in-tw-title"><i class="fas fa-paste"></i></button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Twitter Description</label>
                                        <textarea class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-[13px] text-zinc-900 dark:text-white resize-y min-h-[60px]" id="in-tw-desc"></textarea>
                                    </div>
                                    <div>
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Twitter Image URL</label>
                                        <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-900 transition-all overflow-hidden">
                                            <input type="url" class="meta-input w-full bg-transparent border-none px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-tw-img">
                                            <button type="button" class="btn-paste px-3 text-zinc-400 hover:text-zinc-900" data-target="in-tw-img"><i class="fas fa-paste"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tab-content hidden animate-in fade-in" id="form-misc">
                                <div class="space-y-5">
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Charset</label>
                                            <select class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-charset">
                                                <option value="UTF-8">UTF-8</option>
                                                <option value="ISO-8859-1">ISO-8859-1</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Robots</label>
                                            <select class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-robots">
                                                <option value="index, follow">Index, Follow</option>
                                                <option value="noindex, nofollow">Noindex, Nofollow</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-2 block">Viewport (Hiển thị Responsive)</label>
                                        <div class="grid grid-cols-2 gap-2">
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input vp-check rounded text-zinc-900" value="width=device-width" checked> width=device-width</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input vp-check rounded text-zinc-900" value="initial-scale=1.0" checked> initial-scale=1.0</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input vp-check rounded text-zinc-900" value="maximum-scale=1.0"> max-scale=1.0</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input vp-check rounded text-zinc-900" value="user-scalable=no"> user-scalable=no</label>
                                        </div>
                                    </div>

                                    <div class="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-2 block">Format Detection (Chặn nhận diện)</label>
                                        <div class="grid grid-cols-2 gap-2">
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input fd-check rounded text-zinc-900" value="telephone=no"> Chặn SĐT</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input fd-check rounded text-zinc-900" value="email=no"> Chặn Email</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input fd-check rounded text-zinc-900" value="address=no"> Chặn Địa chỉ</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input fd-check rounded text-zinc-900" value="date=no"> Chặn Ngày</label>
                                        </div>
                                    </div>

                                    <div class="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Theme Color</label>
                                        <input type="color" class="meta-input w-16 h-8 rounded cursor-pointer bg-transparent border-none p-0" id="in-theme-color" value="#ffffff">
                                    </div>

                                    <div class="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                        <label class="text-[12px] font-bold text-zinc-900 dark:text-white mb-3 block flex items-center gap-2"><i class="fab fa-apple"></i> Apple Web App</label>
                                        <div class="space-y-3">
                                            <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                                                <input type="url" class="meta-input w-full bg-transparent border-none px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-apple-icon" placeholder="Apple Touch Icon URL">
                                            </div>
                                            <div class="grid grid-cols-2 gap-3">
                                                <select class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-[12px] text-zinc-900 dark:text-white" id="in-apple-capable">
                                                    <option value="yes">Capable: Yes</option>
                                                    <option value="no">Capable: No</option>
                                                </select>
                                                <select class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-[12px] text-zinc-900 dark:text-white" id="in-apple-status">
                                                    <option value="default">Status: Default</option>
                                                    <option value="black">Status: Black</option>
                                                    <option value="black-translucent">Translucent</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tab-content hidden animate-in fade-in" id="form-cdn">
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Ngôn ngữ (Lang)</label>
                                            <input type="text" class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-lang" value="vi" placeholder="vi, en...">
                                        </div>
                                        <div>
                                            <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Web Manifest</label>
                                            <input type="url" class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-[13px] text-zinc-900 dark:text-white" id="in-manifest" placeholder="/manifest.json">
                                        </div>
                                    </div>

                                    <div class="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-2 block">Tích hợp thư viện nhanh (CDN)</label>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input rounded text-zinc-900" id="in-cdn-tailwind"> Tailwind CSS (Script)</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input rounded text-zinc-900" id="in-cdn-bootstrap"> Bootstrap 5</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input rounded text-zinc-900" id="in-cdn-fa"> FontAwesome 6</label>
                                            <label class="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"><input type="checkbox" class="meta-input rounded text-zinc-900" id="in-cdn-jquery"> jQuery 3.6</label>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1.5 block">Thẻ tùy chỉnh (&lt;link&gt;, &lt;script&gt;)</label>
                                        <textarea class="meta-input w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-[12px] font-mono text-zinc-900 dark:text-white resize-y min-h-[80px]" id="in-custom-head" placeholder="Dán thẻ custom của bạn vào đây..."></textarea>
                                    </div>

                                    <div class="p-3 bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                                        <label class="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                                            <input type="checkbox" class="meta-input rounded text-zinc-900 w-4 h-4" id="in-full-html" checked> 
                                            Tạo khung HTML5 (Boilerplate)
                                        </label>
                                        <p class="text-[10px] text-zinc-500 mt-1 ml-6">Tắt tùy chọn này nếu bạn chỉ muốn copy riêng phần thẻ meta để dán vào thẻ &lt;head&gt; có sẵn.</p>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>

                    <button class="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[20px] font-bold text-[14px] transition-all hover:opacity-90 active:scale-95 shadow-md flex items-center justify-center gap-2" id="btn-mt-copy-main">
                        <i class="fas fa-code"></i> SAO CHÉP TOÀN BỘ HTML
                    </button>
                </div>

                <div class="xl:col-span-7 flex flex-col gap-6">
                    
                    <div class="premium-card bg-[#0d1117] dark:bg-zinc-950 rounded-[28px] shadow-xl overflow-hidden flex flex-col border border-zinc-800/50">
                        <div class="flex justify-between items-center px-4 py-3 bg-[#161b22] dark:bg-zinc-900 border-b border-white/10">
                            <div class="flex items-center gap-3">
                                <div class="flex gap-1.5">
                                    <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <span class="text-[11px] font-bold text-zinc-400 ml-2 uppercase tracking-wider flex items-center gap-2"><i class="fas fa-file-code text-blue-500"></i> Mã HTML</span>
                            </div>
                        </div>
                        <div class="p-4 bg-[#0d1117]">
                            <textarea id="mt-code-output" class="w-full h-[300px] bg-transparent text-[13px] font-mono leading-relaxed text-[#c9d1d9] resize-none outline-none custom-scrollbar" readonly spellcheck="false"></textarea>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div class="premium-card bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-4">
                            <h4 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><i class="fab fa-google text-rose-500"></i> Google Search</h4>
                            <div class="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                                <div class="flex items-center gap-2 mb-1.5">
                                    <img id="pv-gg-favicon" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23888'/></svg>" class="w-4 h-4 rounded-full object-cover bg-zinc-200">
                                    <span id="pv-gg-url" class="text-[12px] text-zinc-700 dark:text-zinc-300">example.com</span>
                                </div>
                                <div id="pv-gg-title" class="text-[18px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate mb-1">Tiêu đề trang web</div>
                                <div id="pv-gg-desc" class="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">Mô tả tóm tắt nội dung trang web hiển thị trên kết quả tìm kiếm Google...</div>
                            </div>
                        </div>

                        <div class="premium-card bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-4">
                            <h4 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><i class="fab fa-twitter text-blue-400"></i> Twitter Card</h4>
                            <div class="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-zinc-50 dark:bg-black">
                                <div id="pv-tw-img-wrap" class="w-full aspect-[1.91/1] bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-2xl border-b border-zinc-200 dark:border-zinc-700 overflow-hidden relative">
                                    <i class="fas fa-image"></i>
                                </div>
                                <div class="p-3">
                                    <div id="pv-tw-title" class="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 truncate mb-1">Tiêu đề Twitter</div>
                                    <div id="pv-tw-desc" class="text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-snug mb-1">Mô tả tóm tắt dành cho Twitter...</div>
                                    <div class="text-[12px] text-zinc-400 flex items-center gap-1"><i class="fas fa-link text-[10px]"></i> <span id="pv-tw-domain">example.com</span></div>
                                </div>
                            </div>
                        </div>

                        <div class="md:col-span-2 premium-card bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-4">
                            <h4 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><i class="fab fa-facebook text-blue-600"></i> Facebook (Open Graph)</h4>
                            <div class="max-w-[500px] mx-auto border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#242526]">
                                <div id="pv-fb-img-wrap" class="w-full aspect-[1.91/1] bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-3xl border-b border-zinc-200 dark:border-zinc-700 overflow-hidden relative">
                                    <i class="fas fa-image"></i>
                                </div>
                                <div class="p-3">
                                    <div id="pv-fb-domain" class="text-[11px] text-zinc-500 dark:text-[#b0b3b8] uppercase tracking-wider mb-0.5 truncate">EXAMPLE.COM</div>
                                    <div id="pv-fb-title" class="text-[15px] font-bold text-zinc-900 dark:text-[#e4e6eb] truncate mb-1">Tiêu đề trang web Facebook</div>
                                    <div id="pv-fb-desc" class="text-[13px] text-zinc-500 dark:text-[#b0b3b8] line-clamp-1 leading-snug">Mô tả ngắn gọn hấp dẫn...</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    // ==========================================
    // 0. HỆ THỐNG DIALOG TÙY CHỈNH MINIMAL PREMIUM
    // ==========================================
    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const showDialog = ({ type, title, message, defaultValue = '', okText = 'Đồng ý', cancelText = 'Hủy', onConfirm }) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-200 px-4';
        
        const box = document.createElement('div');
        box.className = 'bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[24px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800';
        
        let inputHTML = '';
        if (type === 'prompt') {
            inputHTML = `<input type="text" id="mtg-dialog-input" value="${escapeHTML(defaultValue)}" class="w-full mt-4 mb-6 px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-900 dark:focus:border-white transition-all text-sm font-semibold text-zinc-900 dark:text-white">`;
        } else {
            inputHTML = `<div class="mb-6"></div>`;
        }

        box.innerHTML = `
            <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-2">${title}</h3>
            <p class="text-sm text-zinc-500 leading-relaxed">${message}</p>
            ${inputHTML}
            <div class="flex justify-end gap-2">
                <button id="mtg-dialog-cancel" class="px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95">${cancelText}</button>
                <button id="mtg-dialog-ok" class="px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all active:scale-95 shadow-md">${okText}</button>
            </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const btnCancel = box.querySelector('#mtg-dialog-cancel');
        const btnOk = box.querySelector('#mtg-dialog-ok');
        const inputEl = box.querySelector('#mtg-dialog-input');

        const closeDialog = () => {
            overlay.classList.add('opacity-0');
            setTimeout(() => document.body.removeChild(overlay), 200);
        };

        btnCancel.onclick = closeDialog;
        overlay.onmousedown = (e) => { if(e.target === overlay) closeDialog(); };

        const confirmAction = () => {
            const val = type === 'prompt' ? inputEl.value : null;
            closeDialog();
            if (onConfirm) onConfirm(val);
        };

        btnOk.onclick = confirmAction;

        if (inputEl) {
            inputEl.focus();
            inputEl.select();
            inputEl.onkeydown = (e) => { if (e.key === 'Enter') confirmAction(); };
        }
    };

    // ==========================================
    // 1. TABS
    // ==========================================
    const tabBtns = document.querySelectorAll('#form-tabs .mini-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            tabBtns.forEach(b => {
                b.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white', 'font-bold');
                b.classList.add('text-zinc-500', 'border-transparent', 'font-medium');
            });
            btn.classList.remove('text-zinc-500', 'border-transparent', 'font-medium');
            btn.classList.add('active', 'text-zinc-900', 'dark:text-white', 'border-zinc-900', 'dark:border-white', 'font-bold');
            
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tc => { tc.classList.remove('block'); tc.classList.add('hidden'); });
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('block');
        });
    });

    // ==========================================
    // 2. PASTE BUTTONS
    // ==========================================
    document.querySelectorAll('.btn-paste').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (!text) return;
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                targetInput.value = text;
                targetInput.dispatchEvent(new Event('input')); 
            } catch (err) {
                UI.showAlert('Lỗi', 'Trình duyệt chặn Clipboard. Hãy dán thủ công.', 'error');
            }
        });
    });

    // ==========================================
    // 3. SYNC BUTTONS
    // ==========================================
    document.getElementById('btn-sync-og').addEventListener('click', () => {
        const titleVal = document.getElementById('in-title').value;
        const descVal = document.getElementById('in-desc').value;
        
        if(!titleVal && !descVal) {
            UI.showAlert('Cảnh báo', 'Tab Cơ bản đang trống.', 'warning');
            return;
        }

        document.getElementById('in-og-title').value = titleVal;
        document.getElementById('in-og-desc').value = descVal;
        
        generateMeta();
        UI.showAlert('Thành công', 'Đã chép sang Open Graph.', 'success');
    });

    document.getElementById('btn-sync-tw').addEventListener('click', () => {
        const ogTitle = document.getElementById('in-og-title').value;
        const ogDesc = document.getElementById('in-og-desc').value;
        const seoTitle = document.getElementById('in-title').value;
        const seoDesc = document.getElementById('in-desc').value;
        const ogImg = document.getElementById('in-og-img').value;

        if(!ogTitle && !ogDesc && !seoTitle && !seoDesc) {
            UI.showAlert('Cảnh báo', 'Chưa có thông tin để copy.', 'warning');
            return;
        }

        document.getElementById('in-tw-title').value = ogTitle || seoTitle;
        document.getElementById('in-tw-desc').value = ogDesc || seoDesc;
        if(ogImg) document.getElementById('in-tw-img').value = ogImg;
        
        generateMeta();
        UI.showAlert('Thành công', 'Đã chép sang Twitter.', 'success');
    });

    // ==========================================
    // 4. GENERATOR LOGIC
    // ==========================================
    const inputs = document.querySelectorAll('.meta-input');
    const outCode = document.getElementById('mt-code-output');
    
    const pGgTitle = document.getElementById('pv-gg-title'); const pGgDesc = document.getElementById('pv-gg-desc'); const pGgUrl = document.getElementById('pv-gg-url'); const pGgFavicon = document.getElementById('pv-gg-favicon');
    const pFbTitle = document.getElementById('pv-fb-title'); const pFbDesc = document.getElementById('pv-fb-desc'); const pFbDomain = document.getElementById('pv-fb-domain'); const pFbImgWrap = document.getElementById('pv-fb-img-wrap');
    const pTwTitle = document.getElementById('pv-tw-title'); const pTwDesc = document.getElementById('pv-tw-desc'); const pTwDomain = document.getElementById('pv-tw-domain'); const pTwImgWrap = document.getElementById('pv-tw-img-wrap');
    
    const cntTitle = document.getElementById('cnt-title'); const cntDesc = document.getElementById('cnt-desc');

    const getDomain = (urlStr) => { try { return new URL(urlStr).hostname.replace('www.', ''); } catch (e) { return urlStr ? urlStr : 'example.com'; } };

    const getAllData = () => {
        return {
            title: document.getElementById('in-title').value.trim(),
            desc: document.getElementById('in-desc').value.trim(),
            url: document.getElementById('in-url').value.trim(),
            favicon: document.getElementById('in-favicon').value.trim(),
            kw: document.getElementById('in-keywords').value.trim(),
            author: document.getElementById('in-author').value.trim(),
            ogTitle: document.getElementById('in-og-title').value.trim(),
            ogDesc: document.getElementById('in-og-desc').value.trim(),
            ogImg: document.getElementById('in-og-img').value.trim(),
            ogType: document.getElementById('in-og-type').value,
            twCard: document.getElementById('in-tw-card').value,
            twSite: document.getElementById('in-tw-site').value.trim(),
            twTitle: document.getElementById('in-tw-title').value.trim(),
            twDesc: document.getElementById('in-tw-desc').value.trim(),
            twImg: document.getElementById('in-tw-img').value.trim(),
            charset: document.getElementById('in-charset').value,
            robots: document.getElementById('in-robots').value,
            theme: document.getElementById('in-theme-color').value,
            appleIcon: document.getElementById('in-apple-icon').value.trim(),
            appleCapable: document.getElementById('in-apple-capable').value,
            appleStatus: document.getElementById('in-apple-status').value,
            vpChecks: Array.from(document.querySelectorAll('.vp-check:checked')).map(cb => cb.value),
            fdChecks: Array.from(document.querySelectorAll('.fd-check:checked')).map(cb => cb.value),
            lang: document.getElementById('in-lang').value.trim() || 'vi',
            manifest: document.getElementById('in-manifest').value.trim(),
            cdnTw: document.getElementById('in-cdn-tailwind').checked,
            cdnBs: document.getElementById('in-cdn-bootstrap').checked,
            cdnFa: document.getElementById('in-cdn-fa').checked,
            cdnJq: document.getElementById('in-cdn-jquery').checked,
            customHead: document.getElementById('in-custom-head').value,
            fullHtml: document.getElementById('in-full-html').checked,
        };
    };

    const generateMeta = () => {
        const d = getAllData();

        const ogTitle = d.ogTitle || d.title;
        const ogDesc = d.ogDesc || d.desc;
        const twTitle = d.twTitle || ogTitle;
        const twDesc = d.twDesc || ogDesc;
        const twImg = d.twImg || d.ogImg;

        cntTitle.textContent = `${d.title.length}/60`;
        cntTitle.className = d.title.length > 60 ? 'text-[10px] font-bold text-rose-500' : 'text-[10px] font-bold text-zinc-400';
        cntDesc.textContent = `${d.desc.length}/160`;
        cntDesc.className = d.desc.length > 160 ? 'text-[10px] font-bold text-rose-500' : 'text-[10px] font-bold text-zinc-400';

        const domainStr = getDomain(d.url);

        pGgTitle.textContent = d.title || 'Tiêu đề trang web của bạn';
        pGgDesc.textContent = d.desc || 'Mô tả tóm tắt nội dung trang web hiển thị trên Google...';
        pGgUrl.textContent = d.url || 'example.com';
        pGgFavicon.src = d.favicon ? d.favicon : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23888'/></svg>";

        pFbTitle.textContent = ogTitle || 'Tiêu đề trang web Facebook';
        pFbDesc.textContent = ogDesc || 'Mô tả ngắn gọn hấp dẫn...';
        pFbDomain.textContent = domainStr.toUpperCase();
        pFbImgWrap.innerHTML = d.ogImg ? `<img src="${escapeHTML(d.ogImg)}" class="w-full h-full object-cover">` : `<i class="fas fa-image"></i>`;

        pTwTitle.textContent = twTitle || 'Tiêu đề Twitter';
        pTwDesc.textContent = twDesc || 'Mô tả tóm tắt dành cho Twitter...';
        pTwDomain.textContent = domainStr;
        pTwImgWrap.innerHTML = twImg ? `<img src="${escapeHTML(twImg)}" class="w-full h-full object-cover">` : `<i class="fas fa-image"></i>`;

        let html = '';
        const ind = d.fullHtml ? '    ' : ''; 
        
        if (d.fullHtml) {
            html += `<!DOCTYPE html>\n<html lang="${d.lang}">\n<head>\n`;
        }

        html += `${ind}<meta charset="${d.charset}">\n`;
        
        if (d.vpChecks.length > 0) html += `${ind}<meta name="viewport" content="${d.vpChecks.join(', ')}">\n`;
        
        if (d.title) html += `${ind}<title>${escapeHTML(d.title)}</title>\n`;
        if (d.desc) html += `${ind}<meta name="description" content="${escapeHTML(d.desc)}">\n`;
        if (d.kw) html += `${ind}<meta name="keywords" content="${escapeHTML(d.kw)}">\n`;
        if (d.author) html += `${ind}<meta name="author" content="${escapeHTML(d.author)}">\n`;
        if (d.theme) html += `${ind}<meta name="theme-color" content="${d.theme}">\n`;
        
        if (d.fdChecks.length > 0) html += `${ind}<meta name="format-detection" content="${d.fdChecks.join(', ')}">\n`;
        
        html += `${ind}<meta name="robots" content="${d.robots}">\n`;
        if (d.url) html += `${ind}<link rel="canonical" href="${escapeHTML(d.url)}">\n`;
        if (d.favicon) html += `${ind}<link rel="icon" href="${escapeHTML(d.favicon)}">\n`;
        if (d.manifest) html += `${ind}<link rel="manifest" href="${escapeHTML(d.manifest)}">\n`;
        
        if (ogTitle || ogDesc || d.ogImg || d.url) {
            html += `\n`;
            if (d.url) html += `${ind}<meta property="og:url" content="${escapeHTML(d.url)}">\n`;
            html += `${ind}<meta property="og:type" content="${d.ogType}">\n`;
            if (ogTitle) html += `${ind}<meta property="og:title" content="${escapeHTML(ogTitle)}">\n`;
            if (ogDesc) html += `${ind}<meta property="og:description" content="${escapeHTML(ogDesc)}">\n`;
            if (d.ogImg) html += `${ind}<meta property="og:image" content="${escapeHTML(d.ogImg)}">\n`;
        }

        if (twTitle || twDesc || twImg || d.twSite) {
            html += `\n`;
            html += `${ind}<meta name="twitter:card" content="${d.twCard}">\n`;
            if (d.url) html += `${ind}<meta property="twitter:domain" content="${domainStr}">\n`;
            if (d.url) html += `${ind}<meta property="twitter:url" content="${escapeHTML(d.url)}">\n`;
            if (d.twSite) html += `${ind}<meta name="twitter:site" content="${escapeHTML(d.twSite)}">\n`;
            if (twTitle) html += `${ind}<meta name="twitter:title" content="${escapeHTML(twTitle)}">\n`;
            if (twDesc) html += `${ind}<meta name="twitter:description" content="${escapeHTML(twDesc)}">\n`;
            if (twImg) html += `${ind}<meta name="twitter:image" content="${escapeHTML(twImg)}">\n`;
        }

        if (d.appleIcon || d.appleCapable === 'yes') {
            html += `\n`;
            if (d.appleCapable === 'yes') {
                html += `${ind}<meta name="apple-mobile-web-app-capable" content="yes">\n`;
                html += `${ind}<meta name="apple-mobile-web-app-status-bar-style" content="${d.appleStatus}">\n`;
                if (d.title) html += `${ind}<meta name="apple-mobile-web-app-title" content="${escapeHTML(d.title)}">\n`;
            }
            if (d.appleIcon) html += `${ind}<link rel="apple-touch-icon" href="${escapeHTML(d.appleIcon)}">\n`;
        }

        if (d.cdnTw || d.cdnBs || d.cdnFa || d.cdnJq || d.customHead) {
            html += `\n${ind}\n`;
            if (d.cdnTw) html += `${ind}<script src="https://cdn.tailwindcss.com"></script>\n`;
            if (d.cdnBs) {
                html += `${ind}<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n`;
                html += `${ind}<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n`;
            }
            if (d.cdnFa) html += `${ind}<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n`;
            if (d.cdnJq) html += `${ind}<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>\n`;
            
            if (d.customHead) {
                const customLines = d.customHead.split('\n');
                customLines.forEach(line => {
                    if (line.trim() !== '') html += `${ind}${line}\n`;
                });
            }
        }

        if (d.fullHtml) {
            html += `</head>\n<body>\n${ind}\n\n</body>\n</html>`;
        }

        outCode.value = html.trim();
    };

    inputs.forEach(inp => inp.addEventListener('input', generateMeta));
    inputs.forEach(inp => inp.addEventListener('change', generateMeta)); 
    generateMeta(); 

    document.getElementById('btn-mt-copy-main').onclick = async () => {
        if (!outCode.value) return;
        try {
            await navigator.clipboard.writeText(outCode.value);
            UI.showAlert('Thành công', 'Mã HTML đã được copy.', 'success');
        } catch (e) {
            outCode.select();
            UI.showAlert('Lỗi', 'Hãy bôi đen và copy thủ công.', 'error');
        }
    };

    // ==========================================
    // 5. LƯU, TẢI, XUẤT, NHẬP (QUẢN LÝ BẢN LƯU)
    // ==========================================
    const STORAGE_KEY = 'aio_meta_tags_profiles';

    const applyDataToForm = (data) => {
        if(!data) return;
        const mapping = {
            'in-title': data.title, 'in-desc': data.desc, 'in-url': data.url, 'in-favicon': data.favicon, 
            'in-keywords': data.kw, 'in-author': data.author,
            'in-og-title': data.ogTitle, 'in-og-desc': data.ogDesc, 'in-og-img': data.ogImg, 'in-og-type': data.ogType,
            'in-tw-card': data.twCard, 'in-tw-site': data.twSite, 'in-tw-title': data.twTitle, 'in-tw-desc': data.twDesc, 'in-tw-img': data.twImg,
            'in-charset': data.charset, 'in-robots': data.robots, 'in-theme-color': data.theme,
            'in-apple-icon': data.appleIcon, 'in-apple-capable': data.appleCapable, 'in-apple-status': data.appleStatus,
            'in-lang': data.lang, 'in-manifest': data.manifest, 'in-custom-head': data.customHead
        };
        for (let id in mapping) {
            if (mapping[id] !== undefined && document.getElementById(id)) {
                document.getElementById(id).value = mapping[id];
            }
        }
        
        if (data.vpChecks) document.querySelectorAll('.vp-check').forEach(cb => cb.checked = data.vpChecks.includes(cb.value));
        if (data.fdChecks) document.querySelectorAll('.fd-check').forEach(cb => cb.checked = data.fdChecks.includes(cb.value));
        
        if (data.cdnTw !== undefined) document.getElementById('in-cdn-tailwind').checked = data.cdnTw;
        if (data.cdnBs !== undefined) document.getElementById('in-cdn-bootstrap').checked = data.cdnBs;
        if (data.cdnFa !== undefined) document.getElementById('in-cdn-fa').checked = data.cdnFa;
        if (data.cdnJq !== undefined) document.getElementById('in-cdn-jquery').checked = data.cdnJq;
        if (data.fullHtml !== undefined) document.getElementById('in-full-html').checked = data.fullHtml;

        generateMeta();
    };

    const getProfiles = () => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
    };

    const saveProfiles = (profiles) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    };

    // LƯU LOCAL
    document.getElementById('btn-mt-save').onclick = () => {
        showDialog({
            type: 'prompt',
            title: 'Lưu bản lưu',
            message: 'Nhập tên cho bản lưu này (VD: Dự án SEO):',
            defaultValue: 'Bản lưu ' + new Date().toLocaleDateString('vi-VN'),
            okText: 'Lưu',
            onConfirm: (name) => {
                if (!name || name.trim() === '') return;

                const profiles = getProfiles();
                const data = getAllData();
                const trimmedName = name.trim();
                
                const existingIndex = profiles.findIndex(p => p.name.toLowerCase() === trimmedName.toLowerCase());
                
                if (existingIndex > -1) {
                    showDialog({
                        type: 'confirm',
                        title: 'Ghi đè bản lưu?',
                        message: `Bản lưu "<b>${escapeHTML(trimmedName)}</b>" đã tồn tại. Bạn có muốn ghi đè lên không?`,
                        okText: 'Ghi đè',
                        onConfirm: () => {
                            profiles[existingIndex].data = data;
                            profiles[existingIndex].updatedAt = Date.now();
                            saveProfiles(profiles);
                            UI.showAlert('Thành công', `Đã cập nhật bản lưu "${trimmedName}".`, 'success');
                        }
                    });
                } else {
                    profiles.push({
                        id: Date.now().toString(),
                        name: trimmedName,
                        data: data,
                        createdAt: Date.now()
                    });
                    saveProfiles(profiles);
                    UI.showAlert('Thành công', `Đã lưu cấu hình mới: "${trimmedName}".`, 'success');
                }
            }
        });
    };

    // TẢI LOCAL (Quản lý)
    document.getElementById('btn-mt-load').onclick = () => {
        let profiles = getProfiles();
        if (profiles.length === 0) {
            UI.showAlert('Trống', 'Chưa có bản lưu nào.', 'warning');
            return;
        }
        
        let modal = document.getElementById('mt-save-mgr-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'mt-save-mgr-modal';
            modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm px-4';
            modal.innerHTML = `
                <div class="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[24px] p-6 shadow-2xl flex flex-col max-h-[80vh] border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
                    <div class="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 class="text-lg font-bold text-zinc-900 dark:text-white m-0">Quản lý Bản lưu Local</h3>
                        <button class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors" id="mt-close-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3" id="mt-profile-list"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('mt-close-modal').onclick = () => { modal.classList.add('hidden'); };
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
        }
        
        const listEl = document.getElementById('mt-profile-list');
        
        const refreshList = () => {
            profiles = getProfiles();
            if (profiles.length === 0) {
                listEl.innerHTML = '<div class="text-center py-8 text-zinc-400 text-sm font-medium">Không còn bản lưu nào.</div>';
                setTimeout(() => { modal.classList.add('hidden'); }, 1500);
                return;
            }
            
            listEl.innerHTML = profiles.reverse().map(p => {
                const d = new Date(p.updatedAt || p.createdAt || Date.now());
                const dateStr = d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' - ' + d.toLocaleDateString('vi-VN');
                return `
                <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-blue-500 transition-colors group">
                    <div class="flex-1 overflow-hidden pr-3">
                        <div class="font-bold text-sm text-zinc-900 dark:text-white truncate">${escapeHTML(p.name)}</div>
                        <div class="text-xs text-zinc-500 mt-1"><i class="far fa-clock"></i> ${dateStr}</div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn-pf-load w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center transition-colors" data-id="${p.id}" title="Tải"><i class="fas fa-upload"></i></button>
                        <button class="btn-pf-rename w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 flex items-center justify-center transition-colors" data-id="${p.id}" title="Đổi tên"><i class="fas fa-edit"></i></button>
                        <button class="btn-pf-del w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 flex items-center justify-center transition-colors" data-id="${p.id}" title="Xóa"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                `;
            }).join('');
            
            // Event Lắng nghe
            document.querySelectorAll('.btn-pf-load').forEach(btn => {
                btn.onclick = () => {
                    const pf = profiles.find(x => x.id === btn.getAttribute('data-id'));
                    if (pf) {
                        applyDataToForm(pf.data);
                        UI.showAlert('Đã tải', `Dữ liệu từ "${pf.name}" đã được khôi phục.`, 'success');
                        modal.classList.add('hidden');
                    }
                };
            });
            
            document.querySelectorAll('.btn-pf-rename').forEach(btn => {
                btn.onclick = () => {
                    const pf = profiles.find(x => x.id === btn.getAttribute('data-id'));
                    if (pf) {
                        showDialog({
                            type: 'prompt',
                            title: 'Đổi tên bản lưu',
                            message: 'Nhập tên mới cho bản lưu:',
                            defaultValue: pf.name,
                            okText: 'Lưu tên',
                            onConfirm: (newName) => {
                                if (newName && newName.trim() !== '' && newName !== pf.name) {
                                    pf.name = newName.trim();
                                    pf.updatedAt = Date.now();
                                    saveProfiles(profiles.reverse());
                                    refreshList();
                                    UI.showAlert('Thành công', 'Đã đổi tên bản lưu.', 'success');
                                }
                            }
                        });
                    }
                };
            });
            
            document.querySelectorAll('.btn-pf-del').forEach(btn => {
                btn.onclick = () => {
                    const pf = profiles.find(x => x.id === btn.getAttribute('data-id'));
                    if (pf) {
                        showDialog({
                            type: 'confirm',
                            title: 'Xóa bản lưu',
                            message: `Bạn có chắc chắn muốn xóa "<b>${escapeHTML(pf.name)}</b>" không?`,
                            okText: 'Xóa',
                            onConfirm: () => {
                                profiles = profiles.filter(x => x.id !== pf.id);
                                saveProfiles(profiles.reverse());
                                refreshList();
                            }
                        });
                    }
                };
            });
        };
        
        refreshList();
        modal.classList.remove('hidden');
    };

    // XUẤT JSON
    document.getElementById('btn-mt-export').onclick = () => {
        const title = document.getElementById('in-title').value.trim() || 'config';
        const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getAllData(), null, 4));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `meta-tags-${safeTitle}.json`;
        a.click();
        UI.showAlert('Đã xuất file', 'Cấu hình đã tải xuống máy.', 'success');
    };

    // NHẬP JSON
    document.getElementById('btn-mt-import-trigger').onclick = () => {
        document.getElementById('file-mt-import').click();
    };
    document.getElementById('file-mt-import').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                applyDataToForm(data);
                UI.showAlert('Thành công', 'Đã nhập dữ liệu từ file.', 'success');
            } catch (err) {
                UI.showAlert('Lỗi', 'File JSON không hợp lệ.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    });

    // XÓA FORM
    document.getElementById('btn-mt-clear').onclick = () => {
        showDialog({
            type: 'confirm',
            title: 'Làm mới toàn bộ?',
            message: 'Bạn có chắc chắn muốn xóa form hiện tại không?',
            okText: 'Làm mới',
            onConfirm: () => {
                document.getElementById('meta-form').reset();
                document.getElementById('in-theme-color').value = "#ffffff";
                document.querySelectorAll('.vp-check').forEach(cb => cb.checked = (cb.value === 'width=device-width' || cb.value === 'initial-scale=1.0'));
                document.querySelectorAll('.fd-check').forEach(cb => cb.checked = false);
                
                document.getElementById('in-cdn-tailwind').checked = false;
                document.getElementById('in-cdn-bootstrap').checked = false;
                document.getElementById('in-cdn-fa').checked = false;
                document.getElementById('in-cdn-jquery').checked = false;
                document.getElementById('in-full-html').checked = true;

                generateMeta();
                document.querySelector('[data-target="form-basic"]').click();
            }
        });
    };
}