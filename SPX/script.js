const API_KEY = 'asat_a83e301090ad4d189eeec2e345654a08'; 

async function trackOrder() {
    const slug = document.getElementById('carrierSlug').value.trim();
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    const resultContainer = document.getElementById('result-container');
    const timeline = document.getElementById('timeline');
    const errorMsg = document.getElementById('error-msg');
    const btn = document.getElementById('btnTrack');

    // 1. Reset giao diện
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
    timeline.innerHTML = '';
    resultContainer.style.display = 'none';

    // 2. Kiểm tra đầu vào
    if (!slug || !trackingNumber) {
        showError('Vui lòng nhập đầy đủ Hãng vận chuyển (Slug) và Mã vận đơn.');
        return;
    }

    // 3. Hiệu ứng loading
    btn.textContent = 'Đang kết nối...';
    btn.disabled = true;

    try {
        // --- CẤU HÌNH QUAN TRỌNG CHO NO-BACKEND ---
        // Sử dụng cors-anywhere (Proxy này xử lý header tốt hơn corsproxy.io)
        const targetUrl = `https://api.aftership.com/v4/trackings/${slug}/${trackingNumber}`;
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/' + targetUrl;

        console.log(`Đang gọi API: ${targetUrl}`);

        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'aftership-api-key': API_KEY,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest' // Header bắt buộc cho cors-anywhere
            }
        });

        console.log('Response Status:', response.status); // Xem status code ở Console (F12)

        // 4. Xử lý các mã lỗi cụ thể
        if (response.status === 401) {
            throw new Error('API Key không hợp lệ hoặc bị chặn bởi Proxy.');
        }
        if (response.status === 403) {
            throw new Error('Lỗi CORS hoặc bạn chưa kích hoạt Proxy demo.');
        }
        if (response.status === 404) {
            throw new Error(`Không tìm thấy đơn hàng. Kiểm tra lại:\n1. Mã vận đơn: ${trackingNumber}\n2. Hãng vận chuyển: ${slug}`);
        }
        if (response.status === 429) {
            throw new Error('Bạn đã gửi quá nhiều yêu cầu (Rate Limit). Hãy đợi một chút.');
        }
        if (!response.ok) {
            throw new Error(`Lỗi Server AfterShip (Mã: ${response.status})`);
        }

        // 5. Xử lý dữ liệu thành công
        const data = await response.json();
        const tracking = data.data.tracking;
        displayResult(tracking);

    } catch (error) {
        console.error('Chi tiết lỗi:', error);
        
        // Hướng dẫn fix lỗi CORS cho người dùng
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            showError(`⚠️ LỖI CHẶN TRUY CẬP (CORS).
            \nVì không có Backend, bạn cần "xin phép" Proxy tạm thời.
            \nBấm vào link này: https://cors-anywhere.herokuapp.com/corsdemo
            \nSau đó bấm nút "Request temporary access to the demo server" rồi quay lại đây thử lại.`);
        } else {
            showError(error.message);
        }
    } finally {
        btn.textContent = 'Tra cứu ngay';
        btn.disabled = false;
    }
}

function showError(msg) {
    const errorMsg = document.getElementById('error-msg');
    errorMsg.innerText = msg;
    errorMsg.style.display = 'block';
    errorMsg.style.color = 'red';
}

function displayResult(tracking) {
    const resultContainer = document.getElementById('result-container');
    const timeline = document.getElementById('timeline');
    const statusHeader = document.getElementById('shipment-status');
    const lastUpdate = document.getElementById('last-update');

    // Map trạng thái sang tiếng Việt
    const statusMap = {
        'Pending': 'Chờ xử lý',
        'InTransit': 'Đang vận chuyển',
        'OutForDelivery': 'Đang giao hàng',
        'Delivered': 'Giao thành công',
        'Exception': 'Ngoại lệ / Lỗi',
        'Expired': 'Hết hạn',
        'InfoReceived': 'Đã nhận thông tin'
    };
    
    statusHeader.textContent = statusMap[tracking.tag] || tracking.tag;
    statusHeader.style.color = tracking.tag === 'Delivered' ? '#28a745' : '#006eff';
    
    lastUpdate.textContent = `Cập nhật: ${new Date(tracking.updated_at).toLocaleString('vi-VN')}`;

    // Xử lý checkpoints
    const checkpoints = tracking.checkpoints || [];
    timeline.innerHTML = ''; // Xóa cũ

    if (checkpoints.length === 0) {
        timeline.innerHTML = '<p style="text-align:center; color:#666;">Chưa có thông tin hành trình chi tiết.</p>';
    } else {
        checkpoints.reverse().forEach(point => {
            const div = document.createElement('div');
            div.className = 'checkpoint';
            
            const timeString = new Date(point.checkpoint_time).toLocaleString('vi-VN');
            const location = point.location ? ` - ${point.location}` : '';

            div.innerHTML = `
                <div class="checkpoint-info">${point.message}</div>
                <div class="checkpoint-location">${location}</div>
                <div class="checkpoint-time">${timeString}</div>
            `;
            timeline.appendChild(div);
        });
    }

    resultContainer.style.display = 'block';
}