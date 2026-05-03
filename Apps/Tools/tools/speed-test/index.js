import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* Các style cơ bản từ hệ thống */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .btn-premium { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); user-select: none; cursor: pointer; }
            .btn-premium:active:not(:disabled) { transform: scale(0.97); opacity: 0.9; }
            .btn-premium:disabled { opacity: 0.5; pointer-events: none; cursor: not-allowed; }

            .ui-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }

            /* Hiệu ứng nhấp nháy khi đang test */
            .testing-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

            /* Tuỳ chỉnh Select Dropdown */
            select.flat-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em; }
            .dark select.flat-select { background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); }
        </style>

        <div class="relative flex flex-col w-full max-w-[800px] mx-auto min-h-[600px] pb-10">
            
            <!-- Header -->
            <div class="mb-8 px-2 ui-fade-in text-center flex flex-col items-center">
                <div class="w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <i class="fas fa-tachometer-alt text-xl"></i>
                </div>
                <h2 class="text-[32px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Real Network Speed</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Đo tốc độ và độ trễ thực tế qua kết nối HTTP/TCP Đa luồng.</p>
            </div>

            <div class="space-y-6 ui-fade-in" style="animation-delay: 100ms;">
                
                <!-- Server Selection -->
                <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col items-center justify-center">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <i class="fas fa-server"></i> Chọn máy chủ để Ping
                    </label>
                    <div class="w-full max-w-md bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-1.5 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-shadow relative">
                        <select id="server-select" class="flat-select w-full bg-transparent border-none outline-none pl-4 pr-10 py-3 text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                            <option value="cloudflare">Cloudflare (Đề xuất chuẩn Speedtest)</option>
                            <option value="lol-vn">Game LoL VN (VNG Servers)</option>
                            <option value="lol-asia">Game LoL Asia (Riot Servers)</option>
                            <option value="fast">Fast.com (Netflix CDN)</option>
                        </select>
                    </div>
                    <p class="mt-4 text-[11px] text-zinc-400 text-center px-4 max-w-xl">
                        *Lưu ý: Ping đo bằng HTTP Fetch sẽ cao hơn khoảng 5-15ms so với ping trong Game (ICMP/UDP) do cơ chế bắt tay của TCP/TLS.
                    </p>
                    
                    <!-- Link đối chiếu thực tế -->
                    <a id="server-external-link" href="https://speed.cloudflare.com/" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all">
                        <span>Đối chiếu thực tế tại:</span>
                        <span class="link-text text-zinc-900 dark:text-white underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-2">speed.cloudflare.com</span>
                        <i class="fas fa-external-link-alt text-[10px] ml-0.5"></i>
                    </a>
                </div>

                <!-- Metrics Dashboard -->
                <div class="grid grid-cols-3 gap-4">
                    <!-- Ping -->
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <i class="fas fa-exchange-alt"></i> Ping
                        </div>
                        <div class="flex items-baseline gap-1">
                            <span id="val-ping" class="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">--</span>
                            <span class="text-xs font-bold text-zinc-500">ms</span>
                        </div>
                    </div>

                    <!-- Download -->
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 text-emerald-500">
                            <i class="fas fa-arrow-down"></i> Download
                        </div>
                        <div class="flex items-baseline gap-1">
                            <span id="val-dl" class="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">--</span>
                            <span class="text-xs font-bold text-zinc-500">Mbps</span>
                        </div>
                    </div>

                    <!-- Upload -->
                    <div class="bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 text-blue-500">
                            <i class="fas fa-arrow-up"></i> Upload
                        </div>
                        <div class="flex items-baseline gap-1">
                            <span id="val-ul" class="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">--</span>
                            <span class="text-xs font-bold text-zinc-500">Mbps</span>
                        </div>
                    </div>
                </div>

                <!-- Action Area -->
                <div class="pt-6 flex justify-center">
                    <button id="btn-start-test" class="btn-premium px-12 py-5 rounded-[24px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[15px] tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all flex items-center gap-3">
                        <i class="fas fa-play"></i> BẮT ĐẦU TEST
                    </button>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    const btnStart = document.getElementById('btn-start-test');
    const serverSelect = document.getElementById('server-select');
    
    const valPing = document.getElementById('val-ping');
    const valDl = document.getElementById('val-dl');
    const valUl = document.getElementById('val-ul');

    const externalLink = document.getElementById('server-external-link');
    const externalLinkText = externalLink.querySelector('.link-text');

    let isTesting = false;

    // Cấu hình dữ liệu Web gốc của từng máy chủ cho External Link
    const serverExternalData = {
        'cloudflare': { url: 'https://speed.cloudflare.com/', display: 'speed.cloudflare.com' },
        'lol-vn': { url: 'https://lienminh.vnggames.com/', display: 'lienminh.vnggames.com' },
        'lol-asia': { url: 'https://www.riotgames.com/', display: 'riotgames.com' },
        'fast': { url: 'https://fast.com/', display: 'fast.com' }
    };

    // Lắng nghe sự kiện người dùng đổi máy chủ
    serverSelect.addEventListener('change', (e) => {
        const selectedKey = e.target.value;
        const info = serverExternalData[selectedKey];
        
        if (info) {
            externalLink.href = info.url;
            externalLinkText.textContent = info.display;
            
            // Hiệu ứng chớp tắt nhẹ
            externalLink.classList.remove('opacity-100');
            externalLink.classList.add('opacity-50', 'scale-95');
            setTimeout(() => {
                externalLink.classList.remove('opacity-50', 'scale-95');
                externalLink.classList.add('opacity-100');
            }, 150);
        }
    });

    // Danh sách các URL dùng để đo Ping (Sử dụng các file tĩnh nhỏ)
    const pingEndpoints = {
        'cloudflare': 'https://speed.cloudflare.com/__down?bytes=0',
        'lol-vn': 'https://lienminh.vnggames.com/favicon.ico', 
        'lol-asia': 'https://www.riotgames.com/favicon.ico', 
        'fast': 'https://www.netflix.com/favicon.ico' 
    };

    // Hàm tạo animation chạy số mượt mà
    const animateValue = (obj, start, end, duration, isFloat = false) => {
        return new Promise(resolve => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 4);
                const currentVal = start + easeOut * (end - start);
                
                obj.innerHTML = isFloat ? currentVal.toFixed(1) : Math.floor(currentVal);
                
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    obj.innerHTML = isFloat ? end.toFixed(1) : end;
                    resolve();
                }
            };
            window.requestAnimationFrame(step);
        });
    };

    // 1. Logic Đo Ping Thực Tế
    const measureRealPing = async (serverKey) => {
        const url = pingEndpoints[serverKey];
        const pings = [];
        
        // Lấy mẫu 3 lần để tính trung bình
        for (let i = 0; i < 3; i++) {
            const startTime = performance.now();
            try {
                // Thêm timestamp để chống cache
                await fetch(`${url}?t=${Date.now()}`, { mode: 'no-cors', cache: 'no-store' });
                const endTime = performance.now();
                pings.push(endTime - startTime);
            } catch (e) {
                console.error("Ping error:", e);
            }
        }
        if (pings.length === 0) return 999;
        const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
        
        // Trừ đi khoảng 10ms khấu hao do HTTP Handshake để số sát với ICMP (Game) hơn
        const estimatedIcmpPing = Math.max(1, avgPing - 10);
        return Math.floor(estimatedIcmpPing);
    };

    // 2. Logic Đo Download Thực Tế (Multi-Connection & Time-based)
    const measureRealDownload = async () => {
        const url = 'https://speed.cloudflare.com/__down?bytes=100000000'; // Yêu cầu file 100MB
        const connections = 4; // Mở 4 luồng song song
        const testDuration = 8000; // Đo trong đúng 8 giây rồi ngắt
        
        let totalBytesLoaded = 0;
        const controller = new AbortController();
        const startTime = performance.now();

        const downloadStream = async () => {
            try {
                const response = await fetch(`${url}&t=${Date.now()}_${Math.random()}`, { 
                    signal: controller.signal,
                    cache: 'no-store'
                });
                
                if (!response.ok) return;
                
                const reader = response.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    totalBytesLoaded += value.length; 
                }
            } catch (e) {
                if (e.name !== 'AbortError') console.error("Stream error:", e);
            }
        };

        const streams = [];
        for (let i = 0; i < connections; i++) {
            streams.push(downloadStream());
        }

        await new Promise(resolve => setTimeout(resolve, testDuration));
        controller.abort(); 

        const endTime = performance.now();
        const durationInSeconds = (endTime - startTime) / 1000;
        
        const totalBits = totalBytesLoaded * 8;
        const speedBps = totalBits / durationInSeconds;
        const speedMbps = speedBps / (1024 * 1024);
        
        return speedMbps;
    };

    // 3. Logic Đo Upload Thực Tế
    const measureRealUpload = async () => {
        const url = 'https://speed.cloudflare.com/__up';
        const payloadSize = 5 * 1024 * 1024; // 5MB
        
        const payload = new Uint8Array(payloadSize);
        for (let i = 0; i < payload.length; i++) {
            payload[i] = Math.floor(Math.random() * 256);
        }
        
        const startTime = performance.now();
        
        try {
            await fetch(url, {
                method: 'POST',
                body: payload,
                mode: 'no-cors', // Bỏ qua lỗi CORS khi đẩy file đi
                cache: 'no-store'
            });
            
            const endTime = performance.now();
            const durationInSeconds = (endTime - startTime) / 1000;
            
            const totalBits = payloadSize * 8;
            const speedBps = totalBits / durationInSeconds;
            const speedMbps = speedBps / (1024 * 1024);
            
            return speedMbps;
            
        } catch (e) {
            console.error("Lỗi chi tiết khi đo Upload:", e);
            throw e; 
        }
    };

    // Xử lý sự kiện bấm Bắt Đầu Test
    btnStart.addEventListener('click', async () => {
        if (isTesting) return;
        isTesting = true;

        btnStart.disabled = true;
        btnStart.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> ĐANG TÍNH TOÁN DỮ LIỆU...';
        serverSelect.disabled = true;
        serverSelect.parentElement.classList.add('opacity-50');

        valPing.innerHTML = '--';
        valDl.innerHTML = '--';
        valUl.innerHTML = '--';

        try {
            const selectedServer = serverSelect.value;

            // --- TEST PING ---
            valPing.parentElement.parentElement.classList.add('testing-pulse', 'ring-zinc-900', 'dark:ring-white');
            const realPing = await measureRealPing(selectedServer);
            await animateValue(valPing, 0, realPing, 1000, false);
            valPing.parentElement.parentElement.classList.remove('testing-pulse', 'ring-zinc-900', 'dark:ring-white');
            
            // --- TEST DOWNLOAD ---
            valDl.parentElement.parentElement.classList.add('testing-pulse', 'ring-emerald-500', 'dark:ring-emerald-500');
            const realDownload = await measureRealDownload();
            if (realDownload === 0) throw new Error("CORS or Network Blocked");
            await animateValue(valDl, 0, realDownload, 1500, true); 
            valDl.parentElement.parentElement.classList.remove('testing-pulse', 'ring-emerald-500', 'dark:ring-emerald-500');

            // --- TEST UPLOAD ---
            valUl.parentElement.parentElement.classList.add('testing-pulse', 'ring-blue-500', 'dark:ring-blue-500');
            const realUpload = await measureRealUpload();
            if (realUpload === 0) throw new Error("CORS or Network Blocked");
            await animateValue(valUl, 0, realUpload, 1500, true);
            valUl.parentElement.parentElement.classList.remove('testing-pulse', 'ring-blue-500', 'dark:ring-blue-500');

            if(typeof UI !== 'undefined' && UI.showAlert) {
                UI.showAlert('Hoàn tất', 'Đã đo xong tốc độ mạng thực tế.', 'success');
            } else {
                alert('Hoàn tất bài kiểm tra!');
            }

        } catch (error) {
            console.error("Lỗi chi tiết:", error);
            
            let errorMsg = 'Có lỗi xảy ra khi đo mạng (Vui lòng xem Console F12).';
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                errorMsg = 'Trình duyệt chặn kết nối (Lỗi CORS). Hãy chắc chắn bạn đang chạy code trên Local Server (như Live Server) thay vì mở file trực tiếp.';
            }

            if(typeof UI !== 'undefined' && UI.showAlert) {
                UI.showAlert('Lỗi kết nối', errorMsg, 'error');
            } else {
                alert(errorMsg);
            }
            
            valPing.innerHTML = 'Err';
            valDl.innerHTML = 'Err';
            valUl.innerHTML = 'Err';
        } finally {
            btnStart.disabled = false;
            btnStart.innerHTML = '<i class="fas fa-redo-alt"></i> KIỂM TRA LẠI';
            serverSelect.disabled = false;
            serverSelect.parentElement.classList.remove('opacity-50');
            isTesting = false;
        }
    });

    console.log("Real Speed Test Module Loaded!");
}