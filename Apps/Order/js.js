let html5QrCode = null;
let availableCameras = [];
const scanResultEl = document.getElementById('scanResult');
const cameraSelect = document.getElementById('cameraSelect'); // optional nếu muốn chọn camera
const cameraSelectionContainer = document.getElementById('cameraSelectionContainer'); // optional
const focusModeSelect = document.getElementById('focusModeSelect');
const qrEl = document.getElementById('qr-reader');

// Hàm hiển thị toast (tuỳ bạn triển khai)
function showToast(message, type = 'info') {
    console.log(`[${type}] ${message}`);
}

// Hàm xử lý kết quả QR scan
function processCheckedOrder(decodedText, decodedResult) {
    scanResultEl.innerText = decodedText;
}

// Hàm start scanner
function startQrScanner() {
    // Dừng quét cũ nếu đang chạy
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
        try {
            html5QrCode = new Html5Qrcode("qr-reader");
        } catch (e) {
            console.error(e);
            showToast("Lỗi khởi tạo QR library", "error");
            qrEl.innerHTML = `<p style="color:red;">Không thể khởi tạo</p>`;
            return;
        }
    }

    const focusMode = focusModeSelect ? focusModeSelect.value : "full";

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

    const applyRefocusMode = () => {
        // Xoá callback cũ
        qrEl.onclick = null;
        if (window._refocusTimer) clearInterval(window._refocusTimer);

        if (focusMode === "tap") {
            qrEl.onclick = () => {
                if (html5QrCode?.isScanning) {
                    html5QrCode.pause(true);
                    setTimeout(() => html5QrCode.resume(), 150);
                }
            };
        }

        if (focusMode === "auto-refocus") {
            window._refocusTimer = setInterval(() => {
                if (html5QrCode?.isScanning) {
                    html5QrCode.pause(true);
                    setTimeout(() => html5QrCode.resume(), 100);
                }
            }, 2500);
        }

        const originalStop = html5QrCode.stop.bind(html5QrCode);
        html5QrCode.stop = () => {
            clearInterval(window._refocusTimer);
            return originalStop();
        };
    };

    const startScan = (config, camConfig) => {
        html5QrCode.start(camConfig, config, processCheckedOrder, () => {})
            .then(applyRefocusMode)
            .catch(err => {
                console.error("Không thể khởi động camera:", err);
                showToast("Đang thử fallback config...", "warning");

                const simpleConfig = { fps: 10 };
                const simpleCamConfig = camConfig;

                html5QrCode.start(simpleCamConfig, simpleConfig, processCheckedOrder, () => {})
                    .then(applyRefocusMode)
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
            if (!cameras.length) {
                showToast("Không tìm thấy camera nào", "error");
                return;
            }
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
