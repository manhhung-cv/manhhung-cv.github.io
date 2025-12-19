// // --- CHATBOT SYSTEM BY HUNQSTORE ---

// // 1. Hàm mở/đóng cửa sổ chat
// window.toggleChat = () => {
//     const win = document.getElementById('chat-window');
//     win.classList.toggle('opacity-0');
//     win.classList.toggle('pointer-events-none');
//     win.classList.toggle('translate-y-10');
// };

// // 2. Hàm gửi tin nhắn nhanh (Sửa lỗi undefined của Hùng)
// window.sendQuickMsg = (msg) => {
//     const input = document.getElementById('chat-input');
//     input.value = msg;
//     window.handleChat(); // Gọi hàm xử lý chat
// };

// // 3. Hàm thêm tin nhắn vào màn hình chat
// const addMessage = (text, isBot = true, html = null) => {
//     const area = document.getElementById('chat-messages');
//     const msgDiv = document.createElement('div');
//     msgDiv.className = `flex gap-2 ${isBot ? '' : 'flex-row-reverse'} fade-in mb-4`;
    
//     msgDiv.innerHTML = `
//         <div class="w-8 h-8 rounded-lg ${isBot ? 'bg-brand-500' : 'bg-zinc-600'} text-white flex items-center justify-center shrink-0">
//             <i class="fa-solid ${isBot ? 'fa-robot' : 'fa-user'} text-[10px]"></i>
//         </div>
//         <div class="${isBot ? 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200' : 'bg-brand-600 text-white'} p-3 rounded-2xl shadow-sm text-xs max-w-[80%]">
//             ${html ? html : text}
//         </div>
//     `;
//     area.appendChild(msgDiv);
//     area.scrollTop = area.scrollHeight; // Tự động cuộn xuống cuối
// };

// // 4. Hàm xử lý khi người dùng gửi tin nhắn
// window.handleChat = async () => {
//     const input = document.getElementById('chat-input');
//     const msg = input.value.trim().toLowerCase();
//     if (!msg) return;

//     addMessage(input.value, false); // Hiện tin nhắn của khách
//     input.value = '';

//     setTimeout(() => {
//         // Lọc từ khóa tìm kiếm sản phẩm
//         const keywords = msg.replace(/mua|tìm|có|bán|giá|nhiêu|cái|loại/g, '').trim();

//         if (msg.includes('hướng dẫn') || msg.includes('cách dùng')) {
//             addMessage(null, true, `
//                 <p class="font-bold mb-1 underline">Hướng dẫn mua hàng:</p>
//                 <p>1. Chọn sản phẩm yêu thích.</p>
//                 <p>2. Bấm "Mua ngay" để vào giỏ hàng.</p>
//                 <p>3. Thanh toán qua QR và chờ Admin duyệt đơn.</p>
//             `);
//         } else if (msg.includes('admin') || msg.includes('liên hệ')) {
//             addMessage(`Bạn có thể liên hệ trực tiếp với Admin qua mục Hồ sơ hoặc Facebook cá nhân nhé!`);
//         } else if (keywords.length >= 2) {
//             searchAndAsk(keywords);
//         } else {
//             addMessage("Tôi có thể giúp bạn tìm sản phẩm (VD: 'Netflix') hoặc hướng dẫn mua hàng.");
//         }
//     }, 600);
// };

// // 5. Hàm dò tìm sản phẩm và hỏi lại khách
// const searchAndAsk = (keyword) => {
//     // Sử dụng window.products để lấy dữ liệu từ main.js
//     const matches = window.products.filter(p => 
//         p.name.toLowerCase().includes(keyword) || 
//         p.category.toLowerCase().includes(keyword)
//     ).slice(0, 3);

//     if (matches.length > 0) {
//         let html = `<p class="mb-2">Tôi tìm thấy <b>${matches.length}</b> kết quả cho <b>"${keyword}"</b>:</p>`;
        
//         matches.forEach(p => {
//             html += `
//                 <div class="bg-gray-100 dark:bg-black/40 p-3 rounded-xl border border-brand-500/20 mb-2">
//                     <div class="flex justify-between items-center mb-1">
//                         <span class="font-bold text-[11px]">${p.name}</span>
//                         <span class="text-[10px] text-brand-600 font-bold">${window.formatMoney(p.price)}</span>
//                     </div>
//                     <button onclick="window.addToCartFromChat('${p.id}')" 
//                             class="w-full py-2 bg-brand-600 text-white rounded-lg font-bold text-[9px] active:scale-95 transition-all shadow-sm">
//                         THÊM VÀO GIỎ HÀNG
//                     </button>
//                 </div>
//             `;
//         });
//         addMessage(null, true, html);
//     } else {
//         addMessage(`Không tìm thấy sản phẩm nào chứa từ "${keyword}".`);
//     }
// };

// // 6. Hàm thêm vào giỏ hàng từ Chat
// window.addToCartFromChat = (pid) => {
//     // Lấy thông tin sản phẩm từ window.products
//     const p = window.products.find(x => x.id === pid);
    
//     if (p) {
//         // Kiểm tra và thêm vào giỏ hàng toàn cục
//         const exists = window.cart.find(i => i.id === p.id);
//         if (exists) {
//             exists.qty++;
//         } else {
//             window.cart.push({ ...p, qty: 1 });
//         }
        
//         // Cập nhật giao diện giỏ hàng trên Header
//         window.updateCartUI();
        
//         // Gọi showToast từ window để không còn lỗi
//         window.showToast(`Đã thêm ${p.name} vào giỏ hàng`, true);
        
//         // Bot nhắn tin xác nhận (Yêu cầu mới của Hùng)
//         setTimeout(() => {
//             addMessage(`Tuyệt vời! Tôi đã thêm sản phẩm <b>${p.name}</b> vào giỏ hàng cho bạn rồi nhé. Bạn có muốn tìm thêm gì nữa không? 🛒`);
//         }, 400);
//     }
// };