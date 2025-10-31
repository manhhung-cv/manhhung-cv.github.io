let html5QrCode = null;
let availableCameras = [];
const scanResultEl = document.getElementById('scanResult');
const qrEl = document.getElementById('qr-reader');
const focusModeSelect = document.getElementById('focusModeSelect');
const cameraSelect = document.getElementById('cameraSelect'); // optional
const cameraSelectionContainer = document.getElementById('cameraSelectionContainer'); // optional

// Hàm hiển thị toast (tuỳ bạn triển khai)
function showToast(message, type = 'info') {
    console.log(`[${type}] ${message}`);
}

// Callback khi quét QR thành công
function processCheckedOrder(decodedText, decodedResult) {
    scanResultEl.innerText = decodedText;
}

// Hàm start scanner
function startQrScanner() {
    // Dừng scanner cũ nếu đang chạy
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
        html5QrCode = null;
    }
    scanResultEl.innerHTML = '';

    if (!qrEl) {
        showToast("Không tìm thấy vùng quét QR.", "error");
        return;
    }

    if (!html5QrCode) {
        try { html5QrCode = new Html5Qrcode("qr-reader"); }
        catch (e) { 
            console.error(e);
            showToast("Lỗi khởi tạo QR library", "error");
            qrEl.innerHTML = `<p style="color:red;">Không thể khởi tạo</p>`;
            return;
        }
    }

    const focusMode = focusModeSelect ? focusModeSelect.value : "full";

    // Config cơ bản
    const baseConfig = {
        fps: 10,
        videoConstraints: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            advanced: [{ focusMode: "continuous" }, { zoom: 1.1 }]
        }
    };

    if (focusMode === "center") {
        baseConfig.qrbox = (vw, vh) => {
            const edge = Math.min(vw, vh) * 0.6;
            return { width: edge, height: edge };
        };
    }

    // Áp dụng các chế độ lấy nét
    const applyRefocusMode = () => {
        qrEl.onclick = null;
        if (window._refocusTimer) clearInterval(window._refocusTimer);

        // Tap-to-focus
        if (focusMode === "tap") {
            qrEl.onclick = () => {
                if (html5QrCode?.isScanning) {
                    html5QrCode.pause(true);
                    setTimeout(() => html5QrCode.resume(), 150);
                }
            };
        }

        // Auto-refocus
        if (focusMode === "auto-refocus") {
            window._refocusTimer = setInterval(() => {
                if (html5QrCode?.isScanning) {
                    html5QrCode.pause(true);
                    setTimeout(() => html5QrCode.resume(), 100);
                }
            }, 2500);
        }

        // Stop timer khi dừng scanner
        const originalStop = html5QrCode.stop.bind(html5QrCode);
        html5QrCode.stop = () => {
            clearInterval(window._refocusTimer);
            clearInterval(window._zoomTimer);
            return originalStop();
        };
    };

    // Áp dụng zoom
    const setupZoom = () => {
        const videoTrack = html5QrCode._localVideoTrack;
        if (!videoTrack) return;

        const applyZoom = (factor = 1.5) => {
            const capabilities = videoTrack.getCapabilities?.();
            if (!capabilities || !capabilities.zoom) return;
            const settings = videoTrack.getSettings();
            const maxZoom = capabilities.zoom.max || 2;
            const minZoom = capabilities.zoom.min || 1;
            const zoomFactor = Math.min(Math.max(factor, minZoom), maxZoom);
            videoTrack.applyConstraints({ advanced: [{ zoom: zoomFactor }] })
                .catch(err => console.warn("Zoom không áp dụng được:", err));
        };

        // Auto zoom nếu chưa quét được
        window._zoomTimer = setInterval(() => {
            if (!html5QrCode?.isScanning) return;
            if (scanResultEl.innerText === "") applyZoom(1.5);
        }, 2000);

        // Nút Zoom + / -
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        if (zoomInBtn) zoomInBtn.onclick = () => applyZoom(2);
        if (zoomOutBtn) zoomOutBtn.onclick = () => applyZoom(1);
    };

    const startScan = (config, camConfig) => {
        html5QrCode.start(camConfig, config, processCheckedOrder, () => {})
            .then(() => {
                applyRefocusMode();
                setupZoom();
            })
            .catch(err => {
                console.error("Không thể khởi động camera:", err);
                showToast("Đang thử fallback config...", "warning");

                const simpleConfig = { fps: 10 };
                const simpleCamConfig = camConfig;

                html5QrCode.start(simpleCamConfig, simpleConfig, processCheckedOrder, () => {})
                    .then(() => { applyRefocusMode(); setupZoom(); })
                    .catch(finalErr => {
                        console.error(finalErr);
                        showToast("Không thể truy cập camera.", "error");
                        qrEl.innerHTML = `<p style="color:red;padding:10px;">Vui lòng cấp quyền camera</p>`;
                        html5QrCode = null;
                    });
            });
    };

    const initCameraListAndStart = () => {
        Html5Qrcode.getCameras().then(cameras => {
            if (!cameras.length) { showToast("Không tìm thấy camera nào", "error"); return; }
            availableCameras = cameras;

            if (cameras.length > 1 && cameraSelect) {
                cameraSelectionContainer.classList.remove('hidden');
                cameraSelect.innerHTML = cameras.map(cam =>
                    `<option value="${cam.id}">${cam.label || cam.id}</option>`
                ).join('');
                cameraSelect.onchange = startQrScanner;
            } else if (cameraSelectionContainer) {
                cameraSelectionContainer.classList.add('hidden');
            }

            const camConfig = cameraSelect && cameraSelect.value
                ? { deviceId: { exact: cameraSelect.value } }
                : { facingMode: "environment" };

            startScan(baseConfig, camConfig);
        }).catch(err => {
            console.error(err);
            showToast("Không thể truy cập camera", "error");
            qrEl.innerHTML = `<p style="color:red;">Không có quyền camera</p>`;
        });
    };

    if (!availableCameras.length) initCameraListAndStart();
    else {
        const camConfig = cameraSelect && cameraSelect.value
            ? { deviceId: { exact: cameraSelect.value } }
            : { facingMode: "environment" };
        startScan(baseConfig, camConfig);
    }
}
// Gắn onchange cho dropdown focus mode
if (focusModeSelect) focusModeSelect.onchange = startQrScanner;

// Khởi động lần đầu
startQrScanner();
