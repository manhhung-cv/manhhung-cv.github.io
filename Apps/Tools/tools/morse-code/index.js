import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .mc-layout { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
            .mc-in { order: 1; }
            .mc-out { order: 2; }
            .mc-act { order: 3; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
            .mc-dict { order: 4; }

            /* Khu vực đèn nháy thu nhỏ */
            .light-indicator {
                width: 60px; height: 60px; 
                border-radius: 8px; 
                background-color: #111; 
                transition: background-color 0.05s, box-shadow 0.05s;
                border: 2px solid var(--border);
            }
            
            /* Nút chọn màu nhanh */
            .color-preset {
                width: 28px; height: 28px; 
                border-radius: 4px; 
                border: 1px solid var(--border); 
                cursor: pointer;
                transition: transform 0.1s;
            }
            .color-preset:active { transform: scale(0.9); }
            
            .dict-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 8px; margin-top: 12px;
            }

            /* =============== MODAL ÁNH SÁNG =============== */
            .mc-modal {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(10, 10, 10, 0.95); /* Nền tối mờ */
                backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
                z-index: 9999;
                display: none; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s ease;
            }
            .mc-modal.active { display: flex; opacity: 1; }
            
            /* Đèn vuông to trong Modal */
            .mc-modal-light {
                width: 90%; height: 100%; 
                border-radius: 24px; 
                background-color: #111;
                border: 4px solid #333;
                transition: background-color 0.05s, box-shadow 0.05s;
                margin-bottom: 40px;
            }

            .mc-modal-controls {
                display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
            }

            @media(min-width: 768px) {
                .mc-layout {
                    display: grid; grid-template-columns: 1fr 1fr;
                    grid-template-areas: "in out" "act act" "dict dict"; gap: 20px;
                }
                .mc-in { grid-area: in; } .mc-out { grid-area: out; }
                .mc-act { grid-area: act; margin-top: 8px; } .mc-dict { grid-area: dict; }
                .mc-modal-light { width: 350px; height: 350px; } /* Đèn to hơn trên PC */
            }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Mã Morse (Morse Code)</h1>
                <p class="text-mut">Chuyển đổi, phát âm thanh chuẩn và chớp đèn tín hiệu (Hỗ trợ Modal lặp lại).</p>
            </div>
        </div>

        <div class="mc-layout">
            
            <div class="card mc-in" style="padding: 0; display: flex; flex-direction: column; overflow: hidden;">
                <div class="flex-between" style="padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-sec);">
                    <div class="text-mut" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Đầu vào</div>
                    <div class="flex-row" style="gap: 4px;">
                        <button class="btn btn-ghost" id="mc-paste" title="Dán" style="padding: 4px 8px; font-size: 0.8rem;"><i class="fas fa-paste"></i> Dán</button>
                        <button class="btn btn-ghost" id="mc-clear" title="Xóa" style="padding: 4px 8px; font-size: 0.8rem; color: #ef4444;"><i class="fas fa-trash"></i> Xóa</button>
                    </div>
                </div>
                <textarea id="mc-input" class="textarea" rows="10" 
                    style="border: none; border-radius: 0; flex: 1; padding: 16px; resize: vertical; line-height: 1.6; background: transparent; font-family: monospace; font-size: 1rem;" 
                    placeholder="Nhập văn bản (A-Z, 0-9) hoặc mã Morse (dấu chấm '.', gạch ngang '-') vào đây..."></textarea>
            </div>

            <div class="card mc-out" style="padding: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-sec); border-color: #3b82f640;">
                <div class="flex-between" style="padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-main);">
                    <div class="text-mut" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: #3b82f6;">Kết quả</div>
                    <div class="flex-row" style="gap: 4px;">
                        <button class="btn btn-outline" id="mc-swap" title="Tái sử dụng làm Đầu vào" style="padding: 4px 8px; font-size: 0.75rem;">
                            <i class="fas fa-exchange-alt"></i> Tái sử dụng
                        </button>
                        <button class="btn btn-primary" id="mc-copy" title="Sao chép" style="padding: 4px 12px; font-size: 0.8rem;">
                            <i class="fas fa-copy"></i> Chép
                        </button>
                    </div>
                </div>
                
                <textarea id="mc-output" class="textarea" rows="5" 
                    style="border: none; border-radius: 0; flex: 1; padding: 16px; resize: vertical; line-height: 1.6; background: transparent; cursor: text; font-family: monospace; font-size: 1rem;" 
                    placeholder="Kết quả mã Morse sẽ hiển thị ở đây..." readonly></textarea>
                
                <div style="padding: 12px; border-top: 1px solid var(--border); background: var(--bg-main);">
                    <div class="flex-between" style="margin-bottom: 12px; flex-wrap: wrap; gap: 12px;">
                        <div class="flex-row" style="gap: 8px;">
                            <span class="text-mut" style="font-size: 0.85rem; font-weight: 500; margin-right: 4px;">Màu đèn:</span>
                            <button class="color-preset" data-color="#ffffff" style="background: #ffffff;" title="Trắng"></button>
                            <button class="color-preset" data-color="#10b981" style="background: #10b981;" title="Xanh lá"></button>
                            <button class="color-preset" data-color="#ef4444" style="background: #ef4444;" title="Đỏ"></button>
                            <button class="color-preset" data-color="#eab308" style="background: #eab308;" title="Vàng"></button>
                            <input type="color" id="light-color" value="#ffffff" style="width: 28px; height: 28px; border: none; cursor: pointer; background: transparent; padding: 0; margin-left: 8px;" title="Màu tùy chọn">
                        </div>
                        <button class="btn btn-ghost btn-sm" id="btn-open-modal" title="Phóng to đèn lên toàn màn hình">
                            <i class="fas fa-expand"></i> Phóng to đèn
                        </button>
                    </div>
                    
                    <div class="flex-between" style="align-items: center; gap: 12px; background: var(--bg-sec); padding: 12px; border-radius: var(--radius); border: 1px solid var(--border);">
                        <div id="light-box" class="light-indicator"></div>
                        <div class="flex-row" style="gap: 8px; flex: 1; justify-content: flex-end; flex-wrap: wrap;">
                            <button class="btn btn-outline btn-sm play-btn" id="btn-play-audio" style="flex: 1; min-width: 100px; justify-content: center;"><i class="fas fa-volume-up"></i> Âm thanh</button>
                            <button class="btn btn-outline btn-sm play-btn" id="btn-play-light" style="flex: 1; min-width: 100px; justify-content: center;"><i class="fas fa-lightbulb"></i> Ánh sáng</button>
                            <button class="btn btn-primary btn-sm" id="btn-stop-play" style="display: none; flex: 1; min-width: 100px; justify-content: center; background: #ef4444; border-color: #ef4444;"><i class="fas fa-stop"></i> Dừng phát</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mc-act">
                <button class="btn btn-primary" id="btn-encode" style="padding: 12px 24px; font-size: 1rem; flex: 1; max-width: 250px; justify-content: center;">
                    <i class="fas fa-arrow-right"></i> Mã hóa (Text to Morse)
                </button>
                <button class="btn btn-outline" id="btn-decode" style="padding: 12px 24px; font-size: 1rem; flex: 1; max-width: 250px; justify-content: center;">
                    <i class="fas fa-arrow-left"></i> Giải mã (Morse to Text)
                </button>
            </div>

            <div class="card mc-dict" style="margin-bottom: 24px;">
                <h2 class="h1" style="font-size: 1.1rem; margin-bottom: 4px;"><i class="fas fa-book text-mut"></i> Bảng tra cứu Mã Morse chuẩn</h2>
                <div class="dict-grid" id="dict-grid-container"></div>
            </div>

        </div>

        <div id="mc-modal" class="mc-modal">
            <div style="font-size: 1.2rem; color: rgba(255,255,255,0.7); margin-bottom: 20px; font-weight: 600; letter-spacing: 2px;">TÍN HIỆU ÁNH SÁNG</div>
            
            <div id="mc-modal-light" class="mc-modal-light"></div>
            
            <div class="mc-modal-controls">
                <button class="btn" id="btn-modal-play" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                    <i class="fas fa-play"></i> Phát lại
                </button>
                <button class="btn" id="btn-modal-loop" style="background: transparent; color: white; border: 2px solid rgba(255,255,255,0.5); padding: 12px 24px; border-radius: 8px; font-weight: 600; transition: 0.2s;">
                    <i class="fas fa-sync"></i> Lặp lại: TẮT
                </button>
                <button class="btn" id="btn-modal-close" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
}

export function init() {
    const input = document.getElementById('mc-input');
    const output = document.getElementById('mc-output');

    // Bảng mã
    const MORSE_DICT = {
        "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.",
        "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.",
        "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-", "U": "..-",
        "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--..",
        "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
        "6": "-....", "7": "--...", "8": "---..", "9": "----.",
        ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--", "/": "-..-.", 
        "\"": ".-..-.", "@": ".--.-.", " ": "/"
    };

    const REVERSE_MORSE_DICT = {};
    for (const key in MORSE_DICT) {
        if (key !== " ") REVERSE_MORSE_DICT[MORSE_DICT[key]] = key;
    }

    const renderDictionary = () => {
        const container = document.getElementById('dict-grid-container');
        const keysToRender = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!@/".split('');
        let html = '';
        keysToRender.forEach(char => {
            html += `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; background: var(--bg-sec); border-radius: var(--radius); border: 1px solid var(--border);">
                    <strong style="color: var(--text-main); font-family: monospace; font-size: 1.2rem; margin-bottom: 4px;">${char}</strong>
                    <span style="color: #3b82f6; font-family: monospace; font-size: 1.1rem; letter-spacing: 2px;">${MORSE_DICT[char]}</span>
                </div>
            `;
        });
        container.innerHTML = html;
    };
    renderDictionary();

    const removeVietnameseTones = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    // Hành động cơ bản
    document.getElementById('btn-encode').onclick = () => {
        if (!input.value) return UI.showAlert('Trống', 'Nhập văn bản cần mã hóa.', 'warning');
        let text = removeVietnameseTones(input.value.toUpperCase());
        let morseResult = [];
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (MORSE_DICT[char]) morseResult.push(MORSE_DICT[char]);
            else if (char === '\n') morseResult.push('\n');
        }
        output.value = morseResult.join(' ').replace(/ \n /g, '\n').replace(/\n /g, '\n');
        scrollToOutput();
    };

    document.getElementById('btn-decode').onclick = () => {
        if (!input.value) return UI.showAlert('Trống', 'Nhập mã Morse cần giải mã.', 'warning');
        let morseText = input.value.trim().split('\n');
        let textResult = [];
        for (let line of morseText) {
            let decodedLine = line.split(' ').map(code => {
                if (code === '/' || code === '') return ' '; 
                return REVERSE_MORSE_DICT[code] || '?'; 
            }).join('');
            textResult.push(decodedLine);
        }
        output.value = textResult.join('\n');
        scrollToOutput();
    };

    document.getElementById('mc-copy').onclick = async () => {
        if (!output.value) return UI.showAlert('Trống', 'Không có kết quả.', 'warning');
        try { await navigator.clipboard.writeText(output.value); UI.showAlert('Đã chép', 'Lưu thành công.', 'success'); } 
        catch (e) { UI.showAlert('Lỗi', 'Lỗi sao chép.', 'error'); }
    };
    document.getElementById('mc-paste').onclick = async () => {
        try {
            const text = await navigator.clipboard.readText(); if (!text) return;
            const start = input.selectionStart; input.value = input.value.substring(0, start) + text + input.value.substring(input.selectionEnd);
        } catch (e) { UI.showAlert('Lỗi', 'Trình duyệt chặn Ctrl+V.', 'error'); }
    };
    document.getElementById('mc-clear').onclick = () => { input.value = ''; output.value = ''; };
    document.getElementById('mc-swap').onclick = () => {
        if (!output.value) return; input.value = output.value; output.value = ''; scrollToElement('.mc-in');
    };

    // ==========================================
    // LOGIC TRÌNH PHÁT (AUDIO / LIGHT / MODAL)
    // ==========================================
    let currentPlayId = 0; 
    let audioCtx = null;
    let selectedLightColor = '#ffffff'; 
    let isPlaying = false;
    let isLooping = false;

    // Elements
    const lightBox = document.getElementById('light-box');
    const colorPicker = document.getElementById('light-color');
    const colorPresets = document.querySelectorAll('.color-preset');
    const playBtns = document.querySelectorAll('.play-btn');
    const btnStopPlay = document.getElementById('btn-stop-play');
    
    // Modal Elements
    const modal = document.getElementById('mc-modal');
    const modalLight = document.getElementById('mc-modal-light');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnModalPlay = document.getElementById('btn-modal-play');
    const btnModalLoop = document.getElementById('btn-modal-loop');
    const btnModalClose = document.getElementById('btn-modal-close');

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    colorPicker.addEventListener('input', (e) => { selectedLightColor = e.target.value; });
    colorPresets.forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedLightColor = e.target.dataset.color;
            colorPicker.value = selectedLightColor;
        });
    });

    function playTone(duration) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.value = 700; 
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.005);
        gain.gain.setTargetAtTime(0, audioCtx.currentTime + (duration/1000) - 0.005, 0.005);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + (duration/1000));
    }

    async function playMorse(mode) {
        let text = output.value.trim();
        if (!text || (!text.includes('.') && !text.includes('-'))) {
            return UI.showAlert('Cảnh báo', 'Cần có mã Morse (. và -) để phát.', 'warning');
        }

        currentPlayId++; 
        const playId = currentPlayId;
        const speedUnit = 80; 
        isPlaying = true;

        // UI Cập nhật trạng thái
        if (mode !== 'modal') {
            playBtns.forEach(b => b.style.display = 'none');
            btnStopPlay.style.display = 'inline-flex';
        } else {
            btnModalPlay.innerHTML = '<i class="fas fa-stop"></i> Dừng phát';
            btnModalPlay.style.background = '#ef4444'; // Đổi màu nút sang đỏ
        }

        // Vòng lặp Loop do {...} while()
        do {
            for (let i = 0; i < text.length; i++) {
                if (currentPlayId !== playId) break; // Bị ngắt dừng khẩn cấp
                const char = text[i];
                
                if (char === '.' || char === '-') {
                    const duration = char === '.' ? speedUnit : speedUnit * 3;
                    
                    if (mode === 'audio') playTone(duration);
                    if (mode === 'light') {
                        lightBox.style.backgroundColor = selectedLightColor;
                        lightBox.style.boxShadow = `0 0 30px ${selectedLightColor}`;
                    }
                    if (mode === 'modal') {
                        modalLight.style.backgroundColor = selectedLightColor;
                        modalLight.style.boxShadow = `0 0 100px ${selectedLightColor}`;
                    }
                    
                    await sleep(duration);
                    
                    // Tắt đèn
                    if (mode === 'light') { lightBox.style.backgroundColor = '#111'; lightBox.style.boxShadow = 'none'; }
                    if (mode === 'modal') { modalLight.style.backgroundColor = '#111'; modalLight.style.boxShadow = 'none'; }
                    await sleep(speedUnit); 
                } 
                else if (char === ' ') await sleep(speedUnit * 2); 
                else if (char === '/' || char === '\n') await sleep(speedUnit * 6); 
            }
            
            // Nếu đang bật Loop thì nghỉ 1 đoạn dài trước khi phát lại từ đầu
            if (currentPlayId === playId && isLooping && mode === 'modal') {
                await sleep(speedUnit * 7); 
            }
        } while (currentPlayId === playId && isLooping && mode === 'modal');

        // Khi thoát vòng lặp tự nhiên
        if (currentPlayId === playId) stopPlayback();
    }

    function stopPlayback() {
        currentPlayId++; // Tăng ID để ngắt vòng lặp Promise
        isPlaying = false;
        
        // Trả lại trạng thái tắt đèn
        lightBox.style.backgroundColor = '#111'; lightBox.style.boxShadow = 'none';
        modalLight.style.backgroundColor = '#111'; modalLight.style.boxShadow = 'none';
        
        // Reset nút UI bên ngoài
        playBtns.forEach(b => b.style.display = 'inline-flex');
        btnStopPlay.style.display = 'none';
        
        // Reset nút UI trong Modal
        btnModalPlay.innerHTML = '<i class="fas fa-play"></i> Phát lại';
        btnModalPlay.style.background = '#3b82f6';
    }

    // Gắn sự kiện phát ngoài
    document.getElementById('btn-play-audio').onclick = () => playMorse('audio');
    document.getElementById('btn-play-light').onclick = () => playMorse('light');
    btnStopPlay.onclick = stopPlayback;

    // ==========================================
    // LOGIC MODAL
    // ==========================================
    btnOpenModal.onclick = () => {
        let text = output.value.trim();
        if (!text || (!text.includes('.') && !text.includes('-'))) {
            return UI.showAlert('Cảnh báo', 'Cần có mã Morse trước khi phóng to đèn.', 'warning');
        }
        stopPlayback(); // Dừng tất cả nếu đang phát ngoài
        modal.classList.add('active');
    };

    btnModalClose.onclick = () => {
        stopPlayback();
        modal.classList.remove('active');
    };

    btnModalPlay.onclick = () => {
        if (isPlaying) stopPlayback();
        else playMorse('modal');
    };

    btnModalLoop.onclick = () => {
        isLooping = !isLooping;
        if (isLooping) {
            btnModalLoop.innerHTML = '<i class="fas fa-sync fa-spin"></i> Lặp lại: BẬT';
            btnModalLoop.style.borderColor = '#10b981';
            btnModalLoop.style.color = '#10b981';
        } else {
            btnModalLoop.innerHTML = '<i class="fas fa-sync"></i> Lặp lại: TẮT';
            btnModalLoop.style.borderColor = 'rgba(255,255,255,0.5)';
            btnModalLoop.style.color = 'white';
        }
    };

    function scrollToOutput() { scrollToElement('.mc-out'); }
    function scrollToElement(selector) {
        if (window.innerWidth <= 768) {
            setTimeout(() => { document.querySelector(selector).scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
        }
    }
}