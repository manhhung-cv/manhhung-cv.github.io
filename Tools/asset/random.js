// asset/random.js

document.addEventListener('DOMContentLoaded', () => {
    const randomTool = document.getElementById('random');
    if (!randomTool) return;

    // --- DOM Elements ---
    const numberTabBtn = document.getElementById('number-tab-btn'), nameTabBtn = document.getElementById('name-tab-btn'), settingsTabBtn = document.getElementById('settings-tab-btn');
    const numberContent = document.getElementById('number-content'), nameContent = document.getElementById('name-content'), settingsContent = document.getElementById('settings-content');
    const randomNumberBtn = document.getElementById('random-number-btn'), startNumberInput = document.getElementById('start-number'), endNumberInput = document.getElementById('end-number');
    const numberResultDiv = document.getElementById('number-result'), numberCanvas = document.getElementById('number-canvas'), numberInstruction = document.getElementById('number-instruction');
    const randomNameBtn = document.getElementById('random-name-btn'), nameListTextarea = document.getElementById('name-list');
    const nameResultDiv = document.getElementById('name-result'), nameCanvas = document.getElementById('name-canvas'), nameInstruction = document.getElementById('name-instruction');
    const soundToggle = document.getElementById('sound-toggle'), durationInput = document.getElementById('duration-input'), scratchToggle = document.getElementById('scratch-toggle'), saveFeedback = document.getElementById('save-feedback');
    
    // Sử dụng Modal chung
    const genericModal = document.getElementById('modal-container');
    const modalTitle = genericModal.querySelector('.modal-title');
    const modalBody = genericModal.querySelector('.modal-body');
    const modalFooter = genericModal.querySelector('.modal-footer');
    const confettiContainer = document.getElementById('confetti-container');

    let audioCtx, settings = { sound: true, duration: 0.5, scratch: true };
    let numberScratcher, nameScratcher;
    let confettiInterval;

    // --- Quản lý Âm thanh ---
    function initAudioContext() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    function playSound(type) {
        if (!settings.sound || !audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        if (type === 'tick') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'congrats') {
            const notes = [659.25, 783.99, 1046.50, 1318.51];
            notes.forEach((freq, i) => oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1));
            oscillator.start(); oscillator.stop(audioCtx.currentTime + notes.length * 0.1);
        }
    }

    // --- Quản lý Cài đặt ---
    function saveSettings() {
        settings.sound = soundToggle.checked;
        settings.duration = parseFloat(durationInput.value) || 0.5;
        settings.scratch = scratchToggle.checked;
        localStorage.setItem('randomizerSettings', JSON.stringify(settings));
        saveFeedback.style.opacity = '1';
        setTimeout(() => saveFeedback.style.opacity = '0', 2000);
    }
    function loadSettings() {
        const saved = localStorage.getItem('randomizerSettings');
        if (saved) settings = JSON.parse(saved);
        soundToggle.checked = settings.sound;
        durationInput.value = settings.duration;
        scratchToggle.checked = settings.scratch;
    }
    function updateScratchVisibility() {
        const text = settings.scratch ? ' (cào để xem):' : ':';
        numberInstruction.textContent = 'Kết quả' + text;
        nameInstruction.textContent = 'Người được chọn' + text;
        if (numberScratcher && nameScratcher && !settings.scratch) {
            numberScratcher.clear(); nameScratcher.clear();
        }
    }

    // --- Quản lý Modal & Pháo hoa ---
    function showCongrats(result) {
        modalTitle.textContent = 'Chúc mừng!';
        modalBody.innerHTML = `
            <h2 class="congrats-title">Kết quả là:</h2>
            <div class="modal-result-text">${result}</div>
        `;
        // Ẩn các nút không cần thiết và chỉ hiện nút đóng
        modalFooter.querySelectorAll('button').forEach(btn => btn.style.display = 'none');
        const closeBtn = modalFooter.querySelector('#modal-close-btn-secondary');
        if (closeBtn) closeBtn.style.display = 'inline-block';

        genericModal.classList.add('show');
        playSound('congrats');
        startConfetti();
    }
    function startConfetti() {
        if (!confettiContainer) return;
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];
        confettiInterval = setInterval(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
            confetti.addEventListener('animationend', () => confetti.remove());
            confettiContainer.appendChild(confetti);
        }, 100);
    }
    function stopConfetti() {
        clearInterval(confettiInterval);
        if (confettiContainer) confettiContainer.innerHTML = '';
    }

    // Lắng nghe sự kiện đóng modal chung để dừng pháo hoa
    genericModal.querySelectorAll('.modal-close-btn, #modal-close-btn-secondary').forEach(btn => {
        btn.addEventListener('click', stopConfetti);
    });
    genericModal.addEventListener('click', (e) => {
        if (e.target === genericModal) {
            stopConfetti();
        }
    });
    
    // --- Logic chuyển Tab ---
    const tabs = [{ btn: numberTabBtn, content: numberContent }, { btn: nameTabBtn, content: nameContent }, { btn: settingsTabBtn, content: settingsContent }];
    tabs.forEach(tab => tab.btn?.addEventListener('click', () => {
        tabs.forEach(t => {
            const isActive = t.btn === tab.btn;
            t.btn?.classList.toggle('active', isActive);
            t.content?.classList.toggle('active', isActive);
        });
    }));

    // --- Lớp Scratcher ---
    class Scratcher {
        constructor(canvas, onRevealed) {
            this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.onRevealed = onRevealed;
            this.isDrawing = false; this.isRevealed = true;
            this.resultText = '...';
            this.init();
        }
        init() {
            ['mousedown', 'mousemove', 'mouseup', 'mouseleave'].forEach(evt => this.canvas.addEventListener(evt, this.handleMouse.bind(this)));
            ['touchstart', 'touchmove', 'touchend'].forEach(evt => this.canvas.addEventListener(evt, this.handleTouch.bind(this), { passive: true }));
        }
        handleMouse(e) { if (e.type === 'mousedown') this.start(e); else if (e.type === 'mousemove') this.draw(e); else if (e.type === 'mouseup' || e.type === 'mouseleave') this.stop(); }
        handleTouch(e) { if (e.type === 'touchstart') this.start(e); else if (e.type === 'touchmove') this.draw(e); else if (e.type === 'touchend') this.stop(); }
        getCoords(e) { const rect = this.canvas.getBoundingClientRect(); const touch = e.touches ? e.touches[0] : null; return { x: (touch ? touch.clientX : e.clientX) - rect.left, y: (touch ? touch.clientY : e.clientY) - rect.top }; }
        start(e) { if (!this.isRevealed) this.isDrawing = true; this.draw(e); }
        stop() { this.isDrawing = false; }
        draw(e) {
            if (!this.isDrawing || this.isRevealed) return;
            const { x, y } = this.getCoords(e);
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.beginPath(); this.ctx.arc(x, y, 20, 0, Math.PI * 2); this.ctx.fill();
            this.checkRevealed();
        }
        checkRevealed() {
            const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
            let transparentPixels = 0;
            for (let i = 3; i < data.length; i += 4) { if (data[i] === 0) transparentPixels++; }
            if ((transparentPixels / (this.canvas.width * this.canvas.height)) > 0.6) {
                this.isRevealed = true; this.onRevealed(this.resultText);
            }
        }
        reset(resultText) {
            this.resultText = resultText;
            this.isRevealed = false;
            this.canvas.width = this.canvas.parentElement.clientWidth; this.canvas.height = this.canvas.parentElement.clientHeight;
            this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        clear() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); this.isRevealed = true; }
    }

    // --- Logic chính ---
    function animateResult(element, finalResult, isNumber) {
        initAudioContext();
        let intervalCount = 0;
        const totalDuration = settings.duration * 1000;
        const maxIntervals = Math.max(1, totalDuration / 50);
        const scratcher = isNumber ? numberScratcher : nameScratcher;
        scratcher.clear();

        if (settings.scratch) {
            scratcher.reset(finalResult);
        }

        const animationInterval = setInterval(() => {
            intervalCount++;
            playSound('tick');
            if (intervalCount >= maxIntervals) {
                clearInterval(animationInterval);
                element.textContent = finalResult;
                if (!settings.scratch) showCongrats(finalResult);
            } else {
                if (isNumber) {
                    const min = parseInt(startNumberInput.value, 10), max = parseInt(endNumberInput.value, 10);
                    element.textContent = Math.floor(Math.random() * (max - min + 1)) + min;
                } else {
                    const names = nameListTextarea.value.split('\n').map(name => name.trim()).filter(Boolean);
                    if (names.length > 0) element.textContent = names[Math.floor(Math.random() * names.length)];
                }
            }
        }, 50);
    }

    randomNumberBtn?.addEventListener('click', () => {
        const min = parseInt(startNumberInput.value, 10), max = parseInt(endNumberInput.value, 10);
        if (isNaN(min) || isNaN(max) || min > max) { numberResultDiv.textContent = 'Lỗi'; return; }
        animateResult(numberResultDiv, Math.floor(Math.random() * (max - min + 1)) + min, true);
    });
    randomNameBtn?.addEventListener('click', () => {
        const names = nameListTextarea.value.split('\n').map(name => name.trim()).filter(Boolean);
        if (names.length === 0) { nameResultDiv.textContent = 'Chưa có tên!'; return; }
        animateResult(nameResultDiv, names[Math.floor(Math.random() * names.length)], false);
    });

    // --- Khởi tạo ---
    function initialize() {
        loadSettings();
        [soundToggle, durationInput, scratchToggle].forEach(el => el?.addEventListener('change', () => {
            saveSettings();
            if(el === scratchToggle) updateScratchVisibility();
        }));
        numberScratcher = new Scratcher(numberCanvas, showCongrats);
        nameScratcher = new Scratcher(nameCanvas, showCongrats);
        updateScratchVisibility();
    }
    initialize();
});