import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .rand-wrapper { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
            @media (min-width: 992px) { 
                .rand-wrapper { display: grid; grid-template-columns: 1.1fr 0.9fr; align-items: start; } 
            }
            
            .rand-sticky { position: sticky; top: 80px; }

            .rand-toggle { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
            .rand-toggle-box {
                width: 44px; height: 24px; background: var(--border); border-radius: 12px;
                position: relative; transition: background 0.3s;
            }
            .rand-toggle-box::after {
                content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
                background: #fff; border-radius: 50%; transition: transform 0.3s;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .rand-toggle input:checked + .rand-toggle-box { background: #10b981; }
            .rand-toggle input:checked + .rand-toggle-box::after { transform: translateX(20px); }
            .rand-toggle-text { font-size: 0.95rem; color: var(--text-main); font-weight: 500; }

            .rand-textarea { 
                width: 100%; height: 120px; resize: vertical; padding: 12px;
                border: 1px solid var(--border); border-radius: var(--radius);
                background: var(--bg-sec); color: var(--text-main); font-family: var(--font);
                font-size: 1rem; outline: none; transition: border-color 0.2s;
            }
            .rand-textarea:focus { border-color: #3b82f6; }

            .engine-group { display: flex; gap: 8px; margin-top: 8px; }
            .engine-label { 
                flex: 1; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius);
                background: var(--bg-sec); cursor: pointer; text-align: center;
                transition: all 0.2s; font-size: 0.9rem; font-weight: 500; color: var(--text-mut);
            }
            .engine-label input { display: none; }
            .engine-label:hover { border-color: var(--text-main); }
            .engine-label:has(input:checked) { background: rgba(59, 130, 246, 0.05); border-color: #3b82f6; color: #3b82f6; }

            .btn-generate { 
                width: 100%; padding: 18px; font-size: 1.25rem; font-weight: 700; 
                border-radius: var(--radius); margin-top: 24px; text-transform: uppercase;
                letter-spacing: 1px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                transition: all 0.2s;
            }
            .btn-generate:active { transform: scale(0.98); box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3); }

            .res-container { 
                background: var(--bg-sec); border: 1px solid var(--border); 
                border-radius: var(--radius); padding: 30px 20px; text-align: center;
                min-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center;
            }
            
            .res-box { 
                font-size: 4rem; font-weight: 800; color: #3b82f6; line-height: 1.2;
                word-wrap: break-word; max-width: 100%; text-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }
            .res-box.rolling { 
                animation: blurText 0.1s infinite alternate; 
                opacity: 0.7; filter: blur(1px); 
                font-family: 'Courier New', Courier, monospace; /* Ép font để giống ma trận hacker */
                letter-spacing: 4px;
            }
            @keyframes blurText { from { transform: translateY(-2px); } to { transform: translateY(2px); } }

            .res-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
            .res-badge { 
                background: var(--bg-main); border: 2px solid #3b82f6; color: #3b82f6;
                padding: 12px 20px; border-radius: 30px; font-size: 1.5rem; font-weight: 700;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Ngẫu Nhiên (Randomizer)</h1>
                <p class="text-mut">Quay số, bốc thăm tên với độ ngẫu nhiên cao.</p>
            </div>
        </div>

        <div class="rand-wrapper">
            
            <div class="card" style="padding: 24px;">
                
                <div class="tabs" id="rand-tabs" style="margin-bottom: 20px;">
                    <button class="tab-btn active" data-mode="number"><i class="fas fa-dice"></i> Quay số</button>
                    <button class="tab-btn" data-mode="name"><i class="fas fa-users"></i> Chọn tên</button>
                </div>

                <div id="pane-number" class="rand-pane">
                    <div class="grid-2">
                        <div class="form-group">
                            <label class="form-label">Giá trị Nhỏ nhất (Min)</label>
                            <input type="number" class="input" id="num-min" value="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Giá trị Lớn nhất (Max)</label>
                            <input type="number" class="input" id="num-max" value="100">
                        </div>
                    </div>
                </div>

                <div id="pane-name" class="rand-pane" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">Danh sách tên (Mỗi tên 1 dòng hoặc cách nhau dấu phẩy)</label>
                        <textarea class="rand-textarea" id="name-list" placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C..."></textarea>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 8px;">
                    <label class="form-label">Số lượng kết quả cần quay</label>
                    <input type="number" class="input" id="rand-qty" value="1" min="1" max="100">
                </div>

                <label class="rand-toggle" style="margin-bottom: 20px;">
                    <input type="checkbox" id="rand-duplicate" style="display: none;">
                    <div class="rand-toggle-box"></div>
                    <div class="rand-toggle-text">Cho phép quay trùng lặp (Duplicate)</div>
                </label>

                <div class="divider"></div>

                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Thuật toán ngẫu nhiên (Engine)</label>
                    <div class="engine-group">
                        <label class="engine-label" title="Dùng hàm Math.random() của trình duyệt">
                            <input type="radio" name="engine" value="math" checked>
                            <i class="fas fa-bolt"></i> Tiêu chuẩn
                        </label>
                        <label class="engine-label" title="Dùng Crypto API để chống thiên vị tuyệt đối">
                            <input type="radio" name="engine" value="crypto">
                            <i class="fas fa-shield-alt"></i> Bảo mật (Crypto)
                        </label>
                    </div>
                </div>

                <button class="btn btn-primary btn-generate" id="btn-generate">
                    <i class="fas fa-play"></i> QUAY NGẪU NHIÊN
                </button>

            </div>

            <div class="rand-sticky">
                <div class="card" style="padding: 24px;">
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <h3 class="h3" style="font-size: 1.1rem; margin: 0;">Kết Quả</h3>
                        <button class="btn btn-ghost btn-sm" id="btn-copy-res" title="Sao chép kết quả">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    
                    <div class="res-container" id="res-display">
                        <div class="text-mut" style="font-size: 4rem; opacity: 0.2;"><i class="fas fa-question-circle"></i></div>
                        <div class="text-mut" style="margin-top: 16px;">Nhấn nút QUAY để xem kết quả</div>
                    </div>
                </div>
            </div>

        </div>
    `;
}

export function init() {
    const tabs = document.querySelectorAll('#rand-tabs .tab-btn');
    const panes = {
        'number': document.getElementById('pane-number'),
        'name': document.getElementById('pane-name')
    };
    
    const numMin = document.getElementById('num-min');
    const numMax = document.getElementById('num-max');
    const nameList = document.getElementById('name-list');
    
    const randQty = document.getElementById('rand-qty');
    const randDup = document.getElementById('rand-duplicate');
    const btnGenerate = document.getElementById('btn-generate');
    const resDisplay = document.getElementById('res-display');
    const btnCopy = document.getElementById('btn-copy-res');

    let currentMode = 'number';
    let isRolling = false;
    let finalResultsForCopy = [];

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentMode = tab.dataset.mode;
            Object.values(panes).forEach(p => p.style.display = 'none');
            panes[currentMode].style.display = 'block';
            
            btnGenerate.innerHTML = currentMode === 'number' ? '<i class="fas fa-dice"></i> QUAY SỐ' : '<i class="fas fa-users"></i> CHỌN TÊN';
        };
    });
    
    const getRandomInt = (min, max, engine) => {
        if (engine === 'math') {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            const range = max - min + 1;
            const maxSafe = Math.floor(4294967296 / range) * range; 
            const array = new Uint32Array(1);
            let randomValue;
            do {
                window.crypto.getRandomValues(array);
                randomValue = array[0];
            } while (randomValue >= maxSafe); 
            return min + (randomValue % range);
        }
    };

    const shuffleArray = (array, engine) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = getRandomInt(0, i, engine);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const generateResults = () => {
        const qty = parseInt(randQty.value) || 1;
        const allowDup = randDup.checked;
        const engine = document.querySelector('input[name="engine"]:checked').value;
        let results = [];

        if (currentMode === 'number') {
            const min = parseInt(numMin.value);
            const max = parseInt(numMax.value);
            
            if (isNaN(min) || isNaN(max) || min > max) {
                UI.showAlert('Lỗi', 'Giá trị Min/Max không hợp lệ.', 'error');
                return null;
            }
            if (!allowDup && qty > (max - min + 1)) {
                UI.showAlert('Lỗi', 'Số lượng yêu cầu lớn hơn phạm vi số (khi không cho phép trùng lặp).', 'error');
                return null;
            }

            if (allowDup) {
                for(let i = 0; i < qty; i++) results.push(getRandomInt(min, max, engine));
            } else {
                let pool = [];
                for(let i = min; i <= max; i++) pool.push(i);
                pool = shuffleArray(pool, engine);
                results = pool.slice(0, qty);
            }
        } 
        else if (currentMode === 'name') {
            const rawNames = nameList.value.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
            
            if (rawNames.length === 0) {
                UI.showAlert('Lỗi', 'Vui lòng nhập ít nhất 1 tên.', 'warning');
                return null;
            }
            if (!allowDup && qty > rawNames.length) {
                UI.showAlert('Lỗi', 'Số lượng yêu cầu lớn hơn số tên đã nhập (khi không cho phép trùng lặp).', 'error');
                return null;
            }

            if (allowDup) {
                for(let i = 0; i < qty; i++) {
                    const rIndex = getRandomInt(0, rawNames.length - 1, engine);
                    results.push(rawNames[rIndex]);
                }
            } else {
                let pool = shuffleArray(rawNames, engine);
                results = pool.slice(0, qty);
            }
        }

        return results;
    };

    const renderResults = (results) => {
        finalResultsForCopy = results;
        if (results.length === 1) {
            resDisplay.innerHTML = `<div class="res-box">${results[0]}</div>`;
        } else {
            let html = '<div class="res-grid">';
            results.forEach((res, idx) => {
                html += `<div class="res-badge" style="animation-delay: ${idx * 0.05}s">${res}</div>`;
            });
            html += '</div>';
            resDisplay.innerHTML = html;
        }
    };

    const animateRoll = (finalResults) => {
        isRolling = true;
        btnGenerate.disabled = true;
        btnGenerate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG TÌM...';
        
        let ticks = 0;
        const maxTicks = 15; // Số khung hình nhấp nháy
        
        // Bảng ký tự lộn xộn dùng để tạo hiệu ứng Hacker
        const hackerChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~';
        
        const interval = setInterval(() => {
            ticks++;
            
            // Xây dựng chuỗi ký tự ảo
            let fakeData = '';
            // Nếu quay số thì chuỗi ngắn hơn (4 ký tự), quay chữ thì chuỗi dài hơn (7 ký tự)
            const len = currentMode === 'number' ? 10 : 7; 
            for (let i = 0; i < len; i++) {
                fakeData += hackerChars.charAt(Math.floor(Math.random() * hackerChars.length));
            }
            
            resDisplay.innerHTML = `<div class="res-box ">${fakeData}</div>`;
            
            if (ticks >= maxTicks) {
                clearInterval(interval);
                isRolling = false;
                btnGenerate.disabled = false;
                btnGenerate.innerHTML = currentMode === 'number' ? '<i class="fas fa-dice"></i> QUAY SỐ' : '<i class="fas fa-users"></i> CHỌN TÊN';
                renderResults(finalResults);
            }
        }, 50); // Nháy mỗi 50ms
    };

    btnGenerate.onclick = () => {
        if (isRolling) return;
        const results = generateResults();
        if (results) animateRoll(results);
    };

    btnCopy.onclick = async () => {
        if (finalResultsForCopy.length === 0) return UI.showAlert('Thông báo', 'Chưa có kết quả để chép.', 'warning');
        try {
            await navigator.clipboard.writeText(finalResultsForCopy.join('\n'));
            UI.showAlert('Đã chép', 'Kết quả đã được sao chép vào bộ nhớ đệm.', 'success');
        } catch (e) {
            UI.showAlert('Lỗi', 'Không thể chép dữ liệu.', 'error');
        }
    };
}