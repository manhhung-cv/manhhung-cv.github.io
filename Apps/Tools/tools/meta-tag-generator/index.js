import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .mtg-layout { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
            
            /* Form Inputs & Labels */
            .form-group { margin-bottom: 16px; }
            .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-mut); margin-bottom: 6px; }
            
            /* Input Group kèm nút Dán (Paste) */
            .ig { display: flex; width: 100%; }
            .ig .form-control { 
                border-radius: var(--radius) 0 0 var(--radius); border-right: none; 
                flex: 1; padding: 10px 12px; border: 1px solid var(--border); 
                background: var(--bg-main); color: var(--text-main); 
                font-size: 0.95rem; outline: none; transition: 0.2s;
            }
            .ig .form-control:focus { border-color: #3b82f6; }
            .ig .btn-paste { 
                background: var(--bg-sec); border: 1px solid var(--border); 
                border-radius: 0 var(--radius) var(--radius) 0; padding: 0 12px;
                color: var(--text-mut); cursor: pointer; transition: 0.2s;
            }
            .ig .btn-paste:hover { background: var(--border); color: var(--text-main); }
            
            /* Textarea không có nút paste kế bên để giữ form gọn */
            .form-control-alone { 
                width: 100%; padding: 10px 12px; border: 1px solid var(--border); 
                border-radius: var(--radius); background: var(--bg-main); 
                color: var(--text-main); font-size: 0.95rem; outline: none; 
            }

            /* Checkbox Grid (Giữ lại layout Grid) */
            .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }

            /* Tabs */
            .mini-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--border); margin-bottom: 16px; overflow-x: auto; scrollbar-width: none; }
            .mini-tabs::-webkit-scrollbar { display: none; }
            .mini-tab-btn { 
                padding: 8px 16px; background: transparent; border: none; 
                color: var(--text-mut); font-weight: 600; font-size: 0.9rem; 
                cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap;
            }
            .mini-tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }
            .tab-content { display: none; }
            .tab-content.active { display: block; animation: fadeIn 0.3s; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

            /* Preview Wrapper hiển thị cả 4 */
            .preview-container {
                display: flex; flex-direction: column; gap: 24px;
                padding: 20px; background: var(--bg-sec); 
                border-radius: var(--radius); border: 1px solid var(--border);
            }
            .preview-heading { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: var(--text-mut); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }

            /* Google Preview */
            .gg-preview { font-family: Arial, sans-serif; background: var(--bg-main); padding: 16px; border-radius: 8px; border: 1px solid var(--border); }
            .gg-url { font-size: 0.85rem; color: var(--text-main); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
            .gg-url img { width: 16px; height: 16px; border-radius: 50%; background: #ccc; }
            .gg-title { font-size: 1.25rem; color: #1a0dab; text-decoration: none; margin-bottom: 4px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .gg-desc { font-size: 0.85rem; color: var(--text-mut); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            :root[data-theme="dark"] .gg-title { color: #8ab4f8; }

            /* Facebook Preview */
            .fb-preview { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-main); max-width: 100%; }
            .fb-img { width: 100%; height: 235px; object-fit: cover; background: var(--border); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-mut); font-size: 2rem; }
            .fb-content { padding: 10px 12px; }
            .fb-domain { font-size: 0.75rem; color: var(--text-mut); text-transform: uppercase; margin-bottom: 4px; }
            .fb-title { font-size: 1rem; font-weight: 600; margin: 0 0 4px 0; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .fb-desc { font-size: 0.85rem; color: var(--text-mut); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

            /* Twitter Preview */
            .tw-preview { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--bg-main); max-width: 100%; }
            .tw-img { width: 100%; height: 235px; object-fit: cover; background: var(--border); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-mut); font-size: 2rem; }
            .tw-content { padding: 12px; }
            .tw-title { font-size: 0.95rem; font-weight: 600; margin: 0 0 2px 0; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .tw-desc { font-size: 0.9rem; color: var(--text-mut); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px; }
            .tw-domain { font-size: 0.85rem; color: var(--text-mut); display: flex; align-items: center; gap: 4px; }

            @media(min-width: 992px) {
                .mtg-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; align-items: start; }
            }
        </style>

        <div class="flex-between" style="margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <div>
                <h1 class="h1">Meta Tag Generator</h1>
                <p class="text-mut">Tạo thẻ Meta chuẩn SEO. Lưu trữ và xem trước mạnh mẽ.</p>
            </div>
            
            <div class="flex-row" style="gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-ghost btn-sm" id="btn-mt-clear" style="color: #ef4444;"><i class="fas fa-trash-alt"></i> Xóa</button>
                <button class="btn btn-outline btn-sm" id="btn-mt-load"><i class="fas fa-history"></i> Tải Local</button>
                <button class="btn btn-primary btn-sm" id="btn-mt-save"><i class="fas fa-save"></i> Lưu Local</button>
                <button class="btn btn-outline btn-sm" id="btn-mt-export" title="Xuất file JSON"><i class="fas fa-download"></i></button>
                <button class="btn btn-outline btn-sm" id="btn-mt-import-trigger" title="Nhập file JSON"><i class="fas fa-upload"></i></button>
                <input type="file" id="file-mt-import" accept=".json" style="display: none;">
            </div>
        </div>

        <div class="mtg-layout">
            
            <div class="card" style="padding: 20px;">
                <div class="mini-tabs" id="form-tabs">
                    <button class="mini-tab-btn active" data-target="form-basic">Cơ bản (SEO)</button>
                    <button class="mini-tab-btn" data-target="form-og">Open Graph (FB)</button>
                    <button class="mini-tab-btn" data-target="form-tw">Twitter</button>
                    <button class="mini-tab-btn" data-target="form-misc">Nâng cao</button>
                </div>

                <form id="meta-form">
                    <div class="tab-content active" id="form-basic">
                        <div class="form-group">
                            <label class="form-label">Tiêu đề trang (Title) <span class="text-mut" style="font-weight:normal; float:right;" id="cnt-title">0/60</span></label>
                            <div class="ig">
                                <input type="text" class="form-control meta-input" id="in-title" placeholder="VD: Công cụ AIO Tools miễn phí">
                                <button type="button" class="btn-paste" data-target="in-title" title="Dán"><i class="fas fa-paste"></i></button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mô tả (Description) <span class="text-mut" style="font-weight:normal; float:right;" id="cnt-desc">0/160</span></label>
                            <textarea class="form-control-alone meta-input" id="in-desc" rows="3" placeholder="Mô tả ngắn gọn về trang web của bạn (Nên dưới 160 ký tự)..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">URL Trang web (Canonical)</label>
                            <div class="ig">
                                <input type="url" class="form-control meta-input" id="in-url" placeholder="https://example.com/page">
                                <button type="button" class="btn-paste" data-target="in-url" title="Dán"><i class="fas fa-paste"></i></button>
                            </div>
                        </div>
                        <div class="grid-2" style="gap: 16px;">
                            <div class="form-group">
                                <label class="form-label">Từ khóa (Keywords)</label>
                                <div class="ig">
                                    <input type="text" class="form-control meta-input" id="in-keywords" placeholder="công cụ, tiện ích, seo">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tác giả (Author)</label>
                                <div class="ig">
                                    <input type="text" class="form-control meta-input" id="in-author" placeholder="Tên của bạn">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="form-og">
                        <div style="margin-bottom: 12px; font-size: 0.85rem; color: #10b981; background: #10b98115; padding: 8px; border-radius: 4px;">
                            <i class="fas fa-info-circle"></i> Nếu để trống, hệ thống sẽ tự động lấy dữ liệu từ tab "Cơ bản".
                        </div>
                        <div class="form-group">
                            <label class="form-label">OG Title (Tiêu đề FB)</label>
                            <div class="ig">
                                <input type="text" class="form-control meta-input" id="in-og-title" placeholder="Tiêu đề hiển thị trên Facebook">
                                <button type="button" class="btn-paste" data-target="in-og-title"><i class="fas fa-paste"></i></button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">OG Description</label>
                            <textarea class="form-control-alone meta-input" id="in-og-desc" rows="2" placeholder="Mô tả hiển thị trên Facebook..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">OG Image URL (Ảnh bìa chia sẻ)</label>
                            <div class="ig">
                                <input type="url" class="form-control meta-input" id="in-og-img" placeholder="https://example.com/image.jpg">
                                <button type="button" class="btn-paste" data-target="in-og-img"><i class="fas fa-paste"></i></button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">OG Type</label>
                            <select class="form-control-alone meta-input" id="in-og-type">
                                <option value="website">Website</option>
                                <option value="article">Article (Bài viết)</option>
                                <option value="product">Product (Sản phẩm)</option>
                            </select>
                        </div>
                    </div>

                    <div class="tab-content" id="form-tw">
                        <div style="margin-bottom: 12px; font-size: 0.85rem; color: #10b981; background: #10b98115; padding: 8px; border-radius: 4px;">
                            <i class="fas fa-info-circle"></i> Twitter sẽ mượn dữ liệu tab "Cơ bản" nếu bạn để trống.
                        </div>
                        <div class="grid-2" style="gap: 16px;">
                            <div class="form-group">
                                <label class="form-label">Twitter Card Type</label>
                                <select class="form-control-alone meta-input" id="in-tw-card">
                                    <option value="summary_large_image">Summary Large Image</option>
                                    <option value="summary">Summary (Ảnh nhỏ)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Twitter Site (@username)</label>
                                <div class="ig">
                                    <input type="text" class="form-control meta-input" id="in-tw-site" placeholder="@elonmusk">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Twitter Title</label>
                            <div class="ig">
                                <input type="text" class="form-control meta-input" id="in-tw-title" placeholder="Tiêu đề trên Twitter">
                                <button type="button" class="btn-paste" data-target="in-tw-title"><i class="fas fa-paste"></i></button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Twitter Description</label>
                            <textarea class="form-control-alone meta-input" id="in-tw-desc" rows="2" placeholder="Mô tả hiển thị trên Twitter..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Twitter Image URL</label>
                            <div class="ig">
                                <input type="url" class="form-control meta-input" id="in-tw-img" placeholder="https://example.com/twitter-image.jpg">
                                <button type="button" class="btn-paste" data-target="in-tw-img"><i class="fas fa-paste"></i></button>
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="form-misc">
                        <div class="grid-2" style="gap: 16px;">
                            <div class="form-group">
                                <label class="form-label">Charset (Bảng mã)</label>
                                <select class="form-control-alone meta-input" id="in-charset">
                                    <option value="UTF-8">UTF-8</option>
                                    <option value="ISO-8859-1">ISO-8859-1</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Robots (Lập chỉ mục)</label>
                                <select class="form-control-alone meta-input" id="in-robots">
                                    <option value="index, follow">Index, Follow</option>
                                    <option value="noindex, nofollow">Noindex, Nofollow</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Viewport (Hiển thị Responsive)</label>
                            <div class="check-grid">
                                <label class="check-label"><input type="checkbox" class="checkbox meta-input vp-check" value="width=device-width" checked> width=device-width</label>
                                <label class="check-label"><input type="checkbox" class="checkbox meta-input vp-check" value="initial-scale=1.0" checked> initial-scale=1.0</label>
                                <label class="check-label"><input type="checkbox" class="checkbox meta-input vp-check" value="maximum-scale=1.0"> maximum-scale=1.0</label>
                                <label class="check-label"><input type="checkbox" class="checkbox meta-input vp-check" value="user-scalable=no"> user-scalable=no</label>
                            </div>
                        </div>
                        
                        <div class="form-group" style="padding-bottom: 16px; border-bottom: 1px solid var(--border);">
                            <label class="form-label">Chặn tự động nhận diện (Format Detection)</label>
                            <div class="check-grid">
                                <label class="check-label"><input type="checkbox" class="checkbox meta-input fd-check" value="telephone=no"> Chặn SĐT</label>
                                <label class="check-label"><input type="checkbox" class="checkbox meta-input fd-check" value="email=no"> Chặn Email</label>
                                <label class="check-label"><input type="checkbox" class="checkbox meta-input fd-check" value="address=no"> Chặn Địa chỉ</label>
                                <label class="check-label"><input type="checkbox" class="checkbox meta-input fd-check" value="date=no"> Chặn Ngày tháng</label>
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: 16px;">
                            <label class="form-label">Theme Color (Màu trình duyệt)</label>
                            <input type="color" class="form-control-alone meta-input" id="in-theme-color" value="#ffffff" style="padding: 2px 4px; height: 40px; cursor: pointer;">
                        </div>

                        <div style="border-top: 1px solid var(--border); padding-top: 16px;">
                            <label class="form-label" style="color: #3b82f6;"><i class="fab fa-apple"></i> Apple Web App (PWA)</label>
                            <div class="form-group">
                                <label class="form-label">Apple Touch Icon URL</label>
                                <div class="ig">
                                    <input type="url" class="form-control meta-input" id="in-apple-icon" placeholder="https://example.com/apple-icon.png">
                                    <button type="button" class="btn-paste" data-target="in-apple-icon"><i class="fas fa-paste"></i></button>
                                </div>
                            </div>
                            <div class="grid-2" style="gap: 16px;">
                                <div class="form-group">
                                    <label class="form-label">Web App Capable</label>
                                    <select class="form-control-alone meta-input" id="in-apple-capable">
                                        <option value="yes">Yes (Full màn hình)</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Status Bar Style</label>
                                    <select class="form-control-alone meta-input" id="in-apple-status">
                                        <option value="default">Default</option>
                                        <option value="black">Black</option>
                                        <option value="black-translucent">Translucent</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <button class="btn btn-primary" id="btn-mt-copy-main" style="width: 100%; margin-top: 24px; justify-content: center; padding: 12px; font-size: 1.05rem;">
                    <i class="fas fa-code"></i> Sao chép toàn bộ HTML
                </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 20px;">
                
                <div class="preview-container">
                    
                    <div>
                        <div class="preview-heading" style="color: #3b82f6;"><i class="fas fa-file-code"></i> Xem trước mã HTML</div>
                        <textarea id="mt-code-output" class="textarea" rows="10" 
                            style="border: 1px solid var(--border); border-radius: 8px; width: 100%; padding: 16px; background: var(--bg-main); font-family: monospace; font-size: 0.85rem; line-height: 1.6; color: #3b82f6; resize: vertical;" 
                            readonly></textarea>
                    </div>

                    <div>
                        <div class="preview-heading"><i class="fab fa-google" style="color: #ea4335;"></i> Google Search</div>
                        <div class="gg-preview">
                            <div class="gg-url"><img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23888'/></svg>" alt="icon"> <span id="pv-gg-url">example.com</span></div>
                            <div class="gg-title" id="pv-gg-title">Tiêu đề trang web của bạn</div>
                            <div class="gg-desc" id="pv-gg-desc">Mô tả tóm tắt nội dung trang web hiển thị trên kết quả tìm kiếm Google...</div>
                        </div>
                    </div>

                    <div>
                        <div class="preview-heading"><i class="fab fa-facebook" style="color: #1877f2;"></i> Facebook (Open Graph)</div>
                        <div class="fb-preview">
                            <div class="fb-img" id="pv-fb-img-wrap"><i class="fas fa-image"></i></div>
                            <div class="fb-content">
                                <div class="fb-domain" id="pv-fb-domain">EXAMPLE.COM</div>
                                <div class="fb-title" id="pv-fb-title">Tiêu đề trang web hiển thị trên Facebook</div>
                                <div class="fb-desc" id="pv-fb-desc">Mô tả ngắn gọn hấp dẫn người dùng click vào đường link của bạn...</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="preview-heading"><i class="fab fa-twitter" style="color: #1da1f2;"></i> Twitter Card</div>
                        <div class="tw-preview">
                            <div class="tw-img" id="pv-tw-img-wrap"><i class="fas fa-image"></i></div>
                            <div class="tw-content">
                                <div class="tw-title" id="pv-tw-title">Tiêu đề hiển thị trên Twitter Card</div>
                                <div class="tw-desc" id="pv-tw-desc">Mô tả tóm tắt dành cho Twitter. Card này giúp tweet của bạn nổi bật hơn...</div>
                                <div class="tw-domain"><i class="fas fa-link" style="font-size: 0.75rem;"></i> <span id="pv-tw-domain">example.com</span></div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

export function init() {
    // 1. TABS
    const setupTabs = (tabContainerId) => {
        const btns = document.querySelectorAll(`#${tabContainerId} .mini-tab-btn`);
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-target');
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tabContents = btn.closest('.card').querySelectorAll('.tab-content');
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
            });
        });
    };
    setupTabs('form-tabs');

    // 2. LOGIC DÁN NHANH (PASTE BUTTONS)
    document.querySelectorAll('.btn-paste').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            try {
                const text = await navigator.clipboard.readText();
                if (!text) return;
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                targetInput.value = text;
                targetInput.dispatchEvent(new Event('input')); // Cập nhật lại HTML preview
            } catch (err) {
                UI.showAlert('Lỗi', 'Trình duyệt chặn lấy dữ liệu Clipboard. Hãy dán thủ công.', 'error');
            }
        });
    });

    // 3. GENERATE LOGIC
    const inputs = document.querySelectorAll('.meta-input');
    const outCode = document.getElementById('mt-code-output');
    
    const pGgTitle = document.getElementById('pv-gg-title'); const pGgDesc = document.getElementById('pv-gg-desc'); const pGgUrl = document.getElementById('pv-gg-url');
    const pFbTitle = document.getElementById('pv-fb-title'); const pFbDesc = document.getElementById('pv-fb-desc'); const pFbDomain = document.getElementById('pv-fb-domain'); const pFbImgWrap = document.getElementById('pv-fb-img-wrap');
    const pTwTitle = document.getElementById('pv-tw-title'); const pTwDesc = document.getElementById('pv-tw-desc'); const pTwDomain = document.getElementById('pv-tw-domain'); const pTwImgWrap = document.getElementById('pv-tw-img-wrap');
    
    const cntTitle = document.getElementById('cnt-title'); const cntDesc = document.getElementById('cnt-desc');

    const escapeHTML = (str) => str.replace(/"/g, '&quot;');
    const getDomain = (urlStr) => { try { return new URL(urlStr).hostname.replace('www.', ''); } catch (e) { return urlStr ? urlStr : 'example.com'; } };

    // Lấy toàn bộ dữ liệu form (Dùng cho cả generate và Save/Export)
    const getAllData = () => {
        return {
            title: document.getElementById('in-title').value.trim(),
            desc: document.getElementById('in-desc').value.trim(),
            url: document.getElementById('in-url').value.trim(),
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
            fdChecks: Array.from(document.querySelectorAll('.fd-check:checked')).map(cb => cb.value)
        };
    };

    const generateMeta = () => {
        const d = getAllData();

        // Fallback
        const ogTitle = d.ogTitle || d.title;
        const ogDesc = d.ogDesc || d.desc;
        const twTitle = d.twTitle || ogTitle;
        const twDesc = d.twDesc || ogDesc;
        const twImg = d.twImg || d.ogImg;

        // UI Counters
        cntTitle.textContent = `${d.title.length}/60`;
        cntTitle.style.color = d.title.length > 60 ? '#ef4444' : 'var(--text-mut)';
        cntDesc.textContent = `${d.desc.length}/160`;
        cntDesc.style.color = d.desc.length > 160 ? '#ef4444' : 'var(--text-mut)';

        const domainStr = getDomain(d.url);

        // Preview Render
        pGgTitle.textContent = d.title || 'Tiêu đề trang web của bạn';
        pGgDesc.textContent = d.desc || 'Đây là phần mô tả tóm tắt nội dung trang web hiển thị trên Google.';
        pGgUrl.textContent = d.url || 'example.com';

        pFbTitle.textContent = ogTitle || 'Tiêu đề trang web hiển thị trên Facebook';
        pFbDesc.textContent = ogDesc || 'Mô tả ngắn gọn hấp dẫn người dùng...';
        pFbDomain.textContent = domainStr.toUpperCase();
        pFbImgWrap.innerHTML = d.ogImg ? `<img src="${d.ogImg}" style="width:100%;height:100%;object-fit:cover;" onerror="this.outerHTML='<i class=\\'fas fa-image\\'></i>'">` : `<i class="fas fa-image"></i>`;

        pTwTitle.textContent = twTitle || 'Tiêu đề hiển thị trên Twitter Card';
        pTwDesc.textContent = twDesc || 'Mô tả tóm tắt dành cho Twitter...';
        pTwDomain.textContent = domainStr;
        pTwImgWrap.innerHTML = twImg ? `<img src="${twImg}" style="width:100%;height:100%;object-fit:cover;" onerror="this.outerHTML='<i class=\\'fas fa-image\\'></i>'">` : `<i class="fas fa-image"></i>`;

        // Generate HTML
        let html = `\n`;
        html += `<meta charset="${d.charset}">\n`;
        
        // Viewport
        if (d.vpChecks.length > 0) html += `<meta name="viewport" content="${d.vpChecks.join(', ')}">\n`;
        
        if (d.title) html += `<title>${escapeHTML(d.title)}</title>\n`;
        if (d.desc) html += `<meta name="description" content="${escapeHTML(d.desc)}">\n`;
        if (d.kw) html += `<meta name="keywords" content="${escapeHTML(d.kw)}">\n`;
        if (d.author) html += `<meta name="author" content="${escapeHTML(d.author)}">\n`;
        if (d.theme) html += `<meta name="theme-color" content="${d.theme}">\n`;
        
        // Format Detection
        if (d.fdChecks.length > 0) html += `<meta name="format-detection" content="${d.fdChecks.join(', ')}">\n`;
        
        html += `<meta name="robots" content="${d.robots}">\n`;
        if (d.url) html += `<link rel="canonical" href="${d.url}">\n`;
        
        if (ogTitle || ogDesc || d.ogImg || d.url) {
            html += `\n\n`;
            if (d.url) html += `<meta property="og:url" content="${d.url}">\n`;
            html += `<meta property="og:type" content="${d.ogType}">\n`;
            if (ogTitle) html += `<meta property="og:title" content="${escapeHTML(ogTitle)}">\n`;
            if (ogDesc) html += `<meta property="og:description" content="${escapeHTML(ogDesc)}">\n`;
            if (d.ogImg) html += `<meta property="og:image" content="${d.ogImg}">\n`;
        }

        if (twTitle || twDesc || twImg || d.twSite) {
            html += `\n\n`;
            html += `<meta name="twitter:card" content="${d.twCard}">\n`;
            if (d.url) html += `<meta property="twitter:domain" content="${domainStr}">\n`;
            if (d.url) html += `<meta property="twitter:url" content="${d.url}">\n`;
            if (d.twSite) html += `<meta name="twitter:site" content="${escapeHTML(d.twSite)}">\n`;
            if (twTitle) html += `<meta name="twitter:title" content="${escapeHTML(twTitle)}">\n`;
            if (twDesc) html += `<meta name="twitter:description" content="${escapeHTML(twDesc)}">\n`;
            if (twImg) html += `<meta name="twitter:image" content="${twImg}">\n`;
        }

        if (d.appleIcon || d.appleCapable === 'yes') {
            html += `\n\n`;
            if (d.appleCapable === 'yes') {
                html += `<meta name="apple-mobile-web-app-capable" content="yes">\n`;
                html += `<meta name="apple-mobile-web-app-status-bar-style" content="${d.appleStatus}">\n`;
                if (d.title) html += `<meta name="apple-mobile-web-app-title" content="${escapeHTML(d.title)}">\n`;
            }
            if (d.appleIcon) html += `<link rel="apple-touch-icon" href="${d.appleIcon}">\n`;
        }

        outCode.value = html;
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

    // 4. LƯU, TẢI, XUẤT, NHẬP (STORAGE & JSON)
    const STORAGE_KEY = 'aio_meta_tags';

    const applyDataToForm = (data) => {
        if(!data) return;
        const mapping = {
            'in-title': data.title, 'in-desc': data.desc, 'in-url': data.url,
            'in-keywords': data.kw, 'in-author': data.author,
            'in-og-title': data.ogTitle, 'in-og-desc': data.ogDesc, 'in-og-img': data.ogImg, 'in-og-type': data.ogType,
            'in-tw-card': data.twCard, 'in-tw-site': data.twSite, 'in-tw-title': data.twTitle, 'in-tw-desc': data.twDesc, 'in-tw-img': data.twImg,
            'in-charset': data.charset, 'in-robots': data.robots, 'in-theme-color': data.theme,
            'in-apple-icon': data.appleIcon, 'in-apple-capable': data.appleCapable, 'in-apple-status': data.appleStatus
        };
        for (let id in mapping) {
            if (mapping[id] !== undefined && document.getElementById(id)) {
                document.getElementById(id).value = mapping[id];
            }
        }
        
        // Cập nhật state Checkbox
        if (data.vpChecks) {
            document.querySelectorAll('.vp-check').forEach(cb => {
                cb.checked = data.vpChecks.includes(cb.value);
            });
        }
        if (data.fdChecks) {
            document.querySelectorAll('.fd-check').forEach(cb => {
                cb.checked = data.fdChecks.includes(cb.value);
            });
        }
        generateMeta();
    };

    document.getElementById('btn-mt-save').onclick = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getAllData()));
        UI.showAlert('Đã lưu', 'Dữ liệu form đã được lưu vào trình duyệt.', 'success');
    };

    document.getElementById('btn-mt-load').onclick = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            applyDataToForm(JSON.parse(saved));
            UI.showAlert('Đã tải', 'Dữ liệu cũ đã được khôi phục.', 'info');
        } else {
            UI.showAlert('Trống', 'Chưa có dữ liệu nào được lưu trong máy.', 'warning');
        }
    };

    document.getElementById('btn-mt-export').onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getAllData(), null, 4));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = "meta-tags-config.json";
        a.click();
        UI.showAlert('Đã xuất file', 'File meta-tags-config.json đã được tải xuống.', 'success');
    };

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
                UI.showAlert('Thành công', 'Đã nhập cấu hình từ file.', 'success');
            } catch (err) {
                UI.showAlert('Lỗi', 'File JSON không hợp lệ.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    });

    document.getElementById('btn-mt-clear').onclick = () => {
        UI.showConfirm('Làm mới toàn bộ?', 'Bạn có chắc chắn muốn xóa form không?', () => {
            document.getElementById('meta-form').reset();
            document.getElementById('in-theme-color').value = "#ffffff";
            document.querySelectorAll('.vp-check').forEach(cb => cb.checked = (cb.value === 'width=device-width' || cb.value === 'initial-scale=1.0'));
            document.querySelectorAll('.fd-check').forEach(cb => cb.checked = false);
            generateMeta();
            document.querySelector('[data-target="form-basic"]').click();
        });
    };
}