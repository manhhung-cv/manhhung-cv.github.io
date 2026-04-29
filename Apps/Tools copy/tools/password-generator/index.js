import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .pg-widget { max-width: 600px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Thanh gạt Chế độ (Segmented Control) */
            .pg-mode-toggle { 
                display: flex; background: var(--bg-sec); border-radius: 30px; 
                padding: 4px; margin-bottom: 20px; border: 1px solid var(--border); 
            }
            .pg-mode-btn { 
                flex: 1; text-align: center; padding: 12px 16px; border-radius: 26px; 
                border: none; background: transparent; color: var(--text-mut); 
                font-weight: 600; cursor: pointer; transition: all 0.3s ease; 
                font-size: 0.95rem; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 8px;
            }
            .pg-mode-btn:hover { color: var(--text-main); }
            .pg-mode-btn.active { background: var(--bg-main); color: #3b82f6; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

            /* Khu vực hiển thị mật khẩu */
            .pg-display-card { 
                background: var(--bg-sec); border: 2px solid var(--border); 
                border-radius: 16px; padding: 20px; margin-bottom: 20px;
                position: relative; transition: border-color 0.3s;
            }
            .pg-display-card:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
            
            .pg-input-row { display: flex; gap: 12px; align-items: center; }
            .pg-input { 
                flex: 1; border: none; background: transparent; font-size: 1.8rem; 
                font-family: 'Courier New', Courier, monospace; font-weight: 700; 
                color: var(--text-main); outline: none; width: 100%; letter-spacing: 2px;
            }
            .pg-input::placeholder { color: var(--text-mut); opacity: 0.4; letter-spacing: 0; font-size: 1.2rem; font-family: var(--font); }
            
            .pg-action-btns { display: flex; gap: 8px; }
            .pg-btn-icon { 
                width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border);
                background: var(--bg-main); color: var(--text-mut); cursor: pointer; 
                display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
                transition: all 0.2s;
            }
            .pg-btn-icon:hover { color: #3b82f6; border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }

            /* Thanh đo độ mạnh */
            .pg-strength-wrapper { margin-top: 16px; }
            .pg-strength-header { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
            .pg-strength-bar-bg { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; display: flex; }
            .pg-strength-bar { height: 100%; width: 0%; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 3px; }
            
            /* Khu vực các Tab nội dung */
            .pg-pane { display: none; animation: fadeIn 0.3s ease; }
            .pg-pane.active { display: block; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

            /* Tab Tạo tự động */
            .pg-slider-card { background: var(--bg-main); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
            .pg-slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .pg-slider-val { font-size: 1.5rem; font-weight: 700; color: #3b82f6; }
            
            .pg-range { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px; background: var(--border); outline: none; cursor: pointer; }
            .pg-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 4px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2); transition: transform 0.1s; }
            .pg-range::-webkit-slider-thumb:hover { transform: scale(1.1); }

            .pg-options-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 24px; }
            @media (min-width: 480px) { .pg-options-grid { grid-template-columns: 1fr 1fr; } }
            
            .pg-toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-sec); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; user-select: none; transition: border-color 0.2s; }
            .pg-toggle-row:hover { border-color: var(--text-mut); }
            .pg-toggle-label { font-weight: 500; color: var(--text-main); font-size: 0.95rem; }
            
            .pg-switch { position: relative; width: 44px; height: 24px; background: var(--border); border-radius: 12px; transition: 0.3s; }
            .pg-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
            input:checked + .pg-switch { background: #3b82f6; }
            input:checked + .pg-switch::after { transform: translateX(20px); }
            input:disabled + .pg-switch { opacity: 0.5; cursor: not-allowed; }

            /* Tab Kiểm tra (Checklist) */
            .pg-criteria { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
            .pg-criteria li { display: flex; align-items: center; gap: 12px; font-size: 1rem; color: var(--text-mut); transition: all 0.3s; font-weight: 500; }
            .pg-criteria li i { font-size: 1.2rem; width: 24px; text-align: center; }
            .pg-criteria li.pass { color: #10b981; }
            
        </style>

        <div class="pg-widget">
            
            <div class="flex-between" style="margin-bottom: 20px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Quản lý Mật Khẩu</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">Sinh mã bảo mật và đánh giá độ mạnh offline.</p>
                </div>
            </div>

            <div class="pg-mode-toggle">
                <button class="pg-mode-btn active" data-target="pane-gen"><i class="fas fa-magic"></i> Tạo tự động</button>
                <button class="pg-mode-btn" data-target="pane-check"><i class="fas fa-shield-check"></i> Kiểm tra cá nhân</button>
            </div>

            <div class="pg-display-card shadow-sm">
                <div class="pg-input-row">
                    <input type="text" class="pg-input" id="pg-output" placeholder="Nhập hoặc tạo mật khẩu...">
                    <div class="pg-action-btns">
                        <button class="pg-btn-icon" id="btn-pg-eye" title="Ẩn/Hiện mật khẩu"><i class="fas fa-eye-slash"></i></button>
                        <button class="pg-btn-icon" id="btn-pg-refresh" title="Tạo mới ngẫu nhiên"><i class="fas fa-sync-alt"></i></button>
                        <button class="pg-btn-icon" id="btn-pg-copy" title="Sao chép" style="color: #10b981; border-color: rgba(16,185,129,0.3);"><i class="fas fa-copy"></i></button>
                    </div>
                </div>
                
                <div class="pg-strength-wrapper">
                    <div class="pg-strength-header">
                        <span style="color: var(--text-mut);">Độ mạnh:</span>
                        <span id="pg-strength-lbl">Đang chờ...</span>
                    </div>
                    <div class="pg-strength-bar-bg">
                        <div class="pg-strength-bar" id="pg-strength-bar"></div>
                    </div>
                </div>
            </div>

            <div id="pane-gen" class="pg-pane active">
                <div class="pg-slider-card shadow-sm">
                    <div class="pg-slider-header">
                        <span style="font-weight: 600; color: var(--text-main);">Độ dài mật khẩu</span>
                        <span class="pg-slider-val"><span id="pg-length-val">16</span> <span style="font-size: 1rem; color: var(--text-mut); font-weight: 500;">ký tự</span></span>
                    </div>
                    <input type="range" class="pg-range" id="pg-length" min="4" max="64" value="16">

                    <div class="pg-options-grid">
                        <label class="pg-toggle-row">
                            <span class="pg-toggle-label">In hoa (A-Z)</span>
                            <input type="checkbox" id="chk-upper" class="pg-chk" style="display:none;" checked>
                            <div class="pg-switch"></div>
                        </label>
                        <label class="pg-toggle-row">
                            <span class="pg-toggle-label">In thường (a-z)</span>
                            <input type="checkbox" id="chk-lower" class="pg-chk" style="display:none;" checked>
                            <div class="pg-switch"></div>
                        </label>
                        <label class="pg-toggle-row">
                            <span class="pg-toggle-label">Chữ số (0-9)</span>
                            <input type="checkbox" id="chk-num" class="pg-chk" style="display:none;" checked>
                            <div class="pg-switch"></div>
                        </label>
                        <label class="pg-toggle-row">
                            <span class="pg-toggle-label">Ký tự đặc biệt (!@#)</span>
                            <input type="checkbox" id="chk-sym" class="pg-chk" style="display:none;" checked>
                            <div class="pg-switch"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div id="pane-check" class="pg-pane">
                <div class="card shadow-sm">
                    <h3 class="h3" style="font-size: 1.1rem; margin-bottom: 16px;">Tiêu chí an toàn</h3>
                    <ul class="pg-criteria">
                        <li id="cr-len"><i class="fas fa-times-circle"></i> Tối thiểu 8 ký tự</li>
                        <li id="cr-up"><i class="fas fa-times-circle"></i> Có ít nhất 1 chữ in hoa (A-Z)</li>
                        <li id="cr-low"><i class="fas fa-times-circle"></i> Có ít nhất 1 chữ in thường (a-z)</li>
                        <li id="cr-num"><i class="fas fa-times-circle"></i> Có ít nhất 1 chữ số (0-9)</li>
                        <li id="cr-sym"><i class="fas fa-times-circle"></i> Có ít nhất 1 ký tự đặc biệt (!@#...)</li>
                    </ul>
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--border); font-size: 0.85rem; color: var(--text-mut);">
                        <i class="fas fa-lock" style="color: #10b981; margin-right: 4px;"></i> <b>An toàn tuyệt đối:</b> Công cụ hoạt động hoàn toàn offline trên thiết bị của bạn. Mật khẩu không bao giờ được gửi đi đâu.
                    </div>
                </div>
            </div>

        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const output = document.getElementById('pg-output');
    const btnRefresh = document.getElementById('btn-pg-refresh');
    const btnCopy = document.getElementById('btn-pg-copy');
    const btnEye = document.getElementById('btn-pg-eye');
    
    const strengthLbl = document.getElementById('pg-strength-lbl');
    const strengthBar = document.getElementById('pg-strength-bar');

    // Chế độ Generate
    const lengthSlider = document.getElementById('pg-length');
    const lengthVal = document.getElementById('pg-length-val');
    const chkUpper = document.getElementById('chk-upper');
    const chkLower = document.getElementById('chk-lower');
    const chkNum = document.getElementById('chk-num');
    const chkSym = document.getElementById('chk-sym');
    const allChks = [chkUpper, chkLower, chkNum, chkSym];

    // Chế độ Check (Criteria)
    const crLen = document.getElementById('cr-len');
    const crUp = document.getElementById('cr-up');
    const crLow = document.getElementById('cr-low');
    const crNum = document.getElementById('cr-num');
    const crSym = document.getElementById('cr-sym');

    let currentMode = 'gen'; // 'gen' hoặc 'check'
    let isPasswordHidden = false;

    // --- Data & Crypto ---
    const CHARS = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', num: '0123456789', sym: '!@#$%^&*()_+~`|}{[]:;?><,./-=' };

    const getSecureRandomChar = (charString) => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return charString[array[0] % charString.length];
    };

    const secureShuffle = (array) => {
        const randArray = new Uint32Array(1);
        for (let i = array.length - 1; i > 0; i--) {
            window.crypto.getRandomValues(randArray);
            const j = randArray[0] % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // --- Core: Generator ---
    const generatePassword = () => {
        if (currentMode !== 'gen') return; // Không tự sinh pass nếu đang ở tab kiểm tra
        
        const length = parseInt(lengthSlider.value);
        let pool = '';
        let mandatoryChars = [];

        if (chkUpper.checked) { pool += CHARS.upper; mandatoryChars.push(getSecureRandomChar(CHARS.upper)); }
        if (chkLower.checked) { pool += CHARS.lower; mandatoryChars.push(getSecureRandomChar(CHARS.lower)); }
        if (chkNum.checked) { pool += CHARS.num; mandatoryChars.push(getSecureRandomChar(CHARS.num)); }
        if (chkSym.checked) { pool += CHARS.sym; mandatoryChars.push(getSecureRandomChar(CHARS.sym)); }

        let passwordArray = [...mandatoryChars];
        for (let i = mandatoryChars.length; i < length; i++) {
            passwordArray.push(getSecureRandomChar(pool));
        }

        output.value = secureShuffle(passwordArray).join('');
        evaluateStrength(output.value);
    };

    // --- Core: Checker ---
    const updateCriteriaUI = (el, isValid) => {
        if (isValid) {
            el.classList.add('pass');
            el.querySelector('i').className = 'fas fa-check-circle';
        } else {
            el.classList.remove('pass');
            el.querySelector('i').className = 'fas fa-times-circle';
        }
    };

    const evaluateStrength = (password) => {
        let score = 0;
        
        // 1. Cập nhật Checklist (Tab Checker)
        const hasLen = password.length >= 8;
        const hasUp = /[A-Z]/.test(password);
        const hasLow = /[a-z]/.test(password);
        const hasNum = /[0-9]/.test(password);
        const hasSym = /[^A-Za-z0-9]/.test(password);

        updateCriteriaUI(crLen, hasLen);
        updateCriteriaUI(crUp, hasUp);
        updateCriteriaUI(crLow, hasLow);
        updateCriteriaUI(crNum, hasNum);
        updateCriteriaUI(crSym, hasSym);

        // 2. Chấm điểm Thanh đo
        if (!password) {
            strengthBar.style.width = '0%';
            strengthLbl.textContent = 'Trống';
            strengthLbl.style.color = 'var(--text-mut)';
            return;
        }

        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        if (hasUp) score += 1;
        if (hasLow) score += 1;
        if (hasNum) score += 1;
        if (hasSym) score += 1;

        let width = '0%', color = '', text = '';

        if (score <= 2) { width = '25%'; color = '#ef4444'; text = 'Rất yếu'; } 
        else if (score <= 4) { width = '50%'; color = '#f59e0b'; text = 'Trung bình'; } 
        else if (score <= 6) { width = '75%'; color = '#10b981'; text = 'Mạnh'; } 
        else { width = '100%'; color = '#3b82f6'; text = 'Rất mạnh (An toàn)'; }

        strengthBar.style.width = width;
        strengthBar.style.backgroundColor = color;
        strengthLbl.textContent = text;
        strengthLbl.style.color = color;
    };

    const enforceCheckboxRule = () => {
        const checkedCount = allChks.filter(chk => chk.checked).length;
        if (checkedCount === 1) {
            allChks.forEach(chk => { if (chk.checked) chk.disabled = true; });
        } else {
            allChks.forEach(chk => chk.disabled = false);
        }
    };

    // --- Bật/Tắt hiển thị Pass ---
    const toggleEye = () => {
        isPasswordHidden = !isPasswordHidden;
        if (isPasswordHidden) {
            output.type = 'password';
            btnEye.innerHTML = '<i class="fas fa-eye"></i>';
            btnEye.style.color = '#3b82f6';
        } else {
            output.type = 'text';
            btnEye.innerHTML = '<i class="fas fa-eye-slash"></i>';
            btnEye.style.color = 'var(--text-mut)';
        }
    };

    // --- Chuyển Tab (Modes) ---
    const modeBtns = document.querySelectorAll('.pg-mode-btn');
    modeBtns.forEach(btn => {
        btn.onclick = () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentMode = btn.dataset.target === 'pane-gen' ? 'gen' : 'check';
            
            document.querySelectorAll('.pg-pane').forEach(p => p.classList.remove('active'));
            document.getElementById(btn.dataset.target).classList.add('active');

            if (currentMode === 'check') {
                // Sang chế độ kiểm tra: Xóa pass, bật chế độ ẩn (password), ẩn nút Tạo Random
                output.value = '';
                btnRefresh.style.display = 'none';
                output.placeholder = 'Nhập mật khẩu của bạn vào đây...';
                if (!isPasswordHidden) toggleEye(); // Bắt buộc ẩn khi check pass thật
                evaluateStrength('');
                output.focus();
            } else {
                // Sang chế độ tạo: Hiện lại nút Random, tắt chế độ ẩn (chuyển về text)
                btnRefresh.style.display = 'flex';
                output.placeholder = 'Nhập hoặc tạo mật khẩu...';
                if (isPasswordHidden) toggleEye(); // Bắt buộc hiện khi tool tự tạo pass
                generatePassword();
            }
        };
    });

    // --- Sự kiện tương tác ---
    lengthSlider.addEventListener('input', (e) => { lengthVal.textContent = e.target.value; generatePassword(); });
    allChks.forEach(chk => { chk.addEventListener('change', () => { enforceCheckboxRule(); generatePassword(); }); });
    
    btnRefresh.addEventListener('click', () => {
        const icon = btnRefresh.querySelector('i');
        icon.style.transform = `rotate(${Math.random() * 360 + 180}deg)`;
        icon.style.transition = 'transform 0.3s ease-out';
        generatePassword();
    });

    btnEye.addEventListener('click', toggleEye);

    btnCopy.addEventListener('click', async () => {
        if (!output.value) return;
        try {
            await navigator.clipboard.writeText(output.value);
            UI.showAlert('Đã chép', 'Mật khẩu đã được lưu vào bộ nhớ đệm.', 'success');
        } catch (err) {
            UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
        }
    });

    output.addEventListener('input', (e) => {
        evaluateStrength(e.target.value);
    });

    // --- Khởi chạy mặc định ---
    enforceCheckboxRule();
    generatePassword();
}