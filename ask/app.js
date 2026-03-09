import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- 1. CẤU HÌNH FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBf0upZAUW_mUnRoUbTXIh6VmuCQSOJZQo",
  authDomain: "hunq-ask.firebaseapp.com",
  projectId: "hunq-ask",
  storageBucket: "hunq-ask.firebasestorage.app",
  messagingSenderId: "789230722932",
  appId: "1:789230722932:web:c5d2528abb8eaa98665621",
  measurementId: "G-FZ46P86K2Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Khởi tạo Auth

// Hàm tạo mã ngẫu nhiên 5 ký tự (Ví dụ: K9A2Z)
function generateTrackingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// --- 2. XỬ LÝ GỬI TIN NHẮN (TRANG CHỦ) ---
const qnaForm = document.getElementById('qnaForm');
if (qnaForm) {
    qnaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        
        // Kiểm tra reCAPTCHA (Đảm bảo bạn đã load thư viện grecaptcha)
        if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length === 0) {
            alert("Vui lòng xác nhận bạn không phải robot."); 
            return;
        }

        submitBtn.disabled = true; 
        submitBtn.innerText = 'Đang gửi...';

        try {
            const isAnonymous = document.getElementById('anonymousToggle').checked;
            const nameVal = document.getElementById('senderName').value.trim();
            const messageVal = document.getElementById('message').value.trim();
            const visibilityElement = document.querySelector('input[name="visibility"]:checked');
            const visibility = visibilityElement ? visibilityElement.value : 'public';
            
            // Sinh mã code nếu là tin nhắn riêng tư
            const trackingCode = visibility === 'private' ? generateTrackingCode() : null;

            const payload = {
                message: messageVal,
                senderName: isAnonymous ? "Ẩn danh" : (nameVal || "Ẩn danh"),
                isAnonymous: isAnonymous,
                visibility: visibility,          
                trackingCode: trackingCode,      
                status: 'pending',               
                reply: null,
                metadata: {
                    userAgent: navigator.userAgent,
                    ipAddress: "127.0.0.1" // Tạm thời để tĩnh nếu chưa dùng Cloud Functions
                },
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, "messages"), payload);

            // Xử lý sau khi gửi thành công
            if (visibility === 'private') {
                document.getElementById('trackingCodeDisplay').innerText = trackingCode;
                document.getElementById('successModal').classList.remove('hidden');
            } else {
                alert("Đã gửi câu hỏi công khai thành công!");
            }

            qnaForm.reset();
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

        } catch (error) {
            console.error("Lỗi khi gửi tin:", error);
            alert("Lỗi khi lưu dữ liệu. Hãy kiểm tra lại kết nối hoặc Security Rules.");
        } finally {
            submitBtn.disabled = false; 
            submitBtn.innerText = 'Gửi tin nhắn';
        }
    });
}

// --- 3. XỬ LÝ TAB HỎI ĐÁP (Load dữ liệu) ---
async function loadPublicQnA() {
    const feed = document.getElementById('qnaFeed');
    if (!feed) return;

    feed.innerHTML = '<div class="text-center text-zinc-500 py-4 text-sm"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải...</div>';
    
    try {
        const q = query(collection(db, "messages"), where("visibility", "==", "public"), where("status", "==", "answered"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            feed.innerHTML = '<div class="text-center text-zinc-500 py-10 text-sm">Chưa có câu hỏi công khai nào được trả lời.</div>';
            return;
        }

        // Tối ưu: Gom HTML lại rồi render 1 lần để tránh giật lag
        let htmlContent = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            htmlContent += `
                <div class="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 mb-4">
                    <p class="text-white text-sm font-medium mb-3">Q: ${data.message}</p>
                    <div class="bg-zinc-800/50 p-4 rounded-xl border-l-2 border-rose-500">
                        <p class="text-zinc-300 text-sm">A: ${data.reply}</p>
                    </div>
                </div>`;
        });
        feed.innerHTML = htmlContent;

    } catch (error) { 
        console.error("Lỗi tải câu hỏi:", error); 
        feed.innerHTML = '<div class="text-rose-500 text-center py-4">Đã xảy ra lỗi khi tải dữ liệu.</div>';
    }
}

// Ghi đè hàm switchTab hiện tại an toàn
if (typeof window.switchTab === 'function') {
    window.switchTab = (function(originalSwitchTab) {
        return function(tabId) {
            originalSwitchTab(tabId);
            if (tabId === 'qna') loadPublicQnA();
            if (tabId === 'admin') loadAdminInbox(); 
        }
    })(window.switchTab);
}

// Hàm tìm kiếm bằng mã code (Tra cứu riêng tư)
window.searchPrivateMsg = async function() {
    const searchInput = document.getElementById('searchInput');
    const code = searchInput ? searchInput.value.trim().toUpperCase() : '';
    
    if (code.length !== 5) { 
        alert("Mã tra cứu phải gồm 5 ký tự."); 
        return; 
    }
    
    const feed = document.getElementById('qnaFeed');
    feed.innerHTML = '<div class="text-center text-zinc-500 py-4 text-sm"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tìm kiếm...</div>';

    try {
        const q = query(collection(db, "messages"), where("trackingCode", "==", code));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            feed.innerHTML = `<div class="text-rose-400 text-center py-4 text-sm">Không tìm thấy mã ${code}.</div>`;
        } else {
            const data = snap.docs[0].data();
            if (data.status === 'pending') {
                feed.innerHTML = `<div class="bg-zinc-900 p-4 rounded-xl border border-amber-500/30 text-amber-400 text-sm">Câu hỏi của bạn đang chờ Admin trả lời...</div>`;
            } else {
                feed.innerHTML = `
                <div class="bg-zinc-900/50 p-5 rounded-2xl border border-emerald-500/30">
                    <span class="text-xs text-emerald-500 mb-2 inline-block">Mã: ${code}</span>
                    <p class="text-white text-sm font-medium mb-3">Q: ${data.message}</p>
                    <div class="bg-zinc-800/50 p-4 rounded-xl border-l-2 border-emerald-500">
                        <p class="text-zinc-300 text-sm">A: ${data.reply}</p>
                    </div>
                </div>`;
            }
        }
    } catch (error) { 
        console.error(error); 
    }
};

// --- 4. TÍNH NĂNG ADMIN CƠ BẢN ---
let currentSelectedDocId = null;

async function loadAdminInbox() {
    const inbox = document.getElementById('adminInbox');
    if (!inbox) return;

    inbox.innerHTML = '<div class="text-center text-zinc-500 text-sm">Đang tải hộp thư...</div>';
    
    try {
        const q = query(collection(db, "messages"), where("status", "==", "pending"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            inbox.innerHTML = '<p class="text-zinc-500 text-sm text-center">Không có tin nhắn mới.</p>';
            return;
        }

        let htmlContent = '';
        snap.forEach(doc => {
            const data = doc.data();
            const isPrivate = data.visibility === 'private';
            const tagColor = isPrivate ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400';
            const tagText = isPrivate ? 'Riêng tư' : 'Công khai';
            
            // Ép chuỗi an toàn khi truyền vào onclick
            const safeMessage = data.message.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            htmlContent += `
            <div onclick="selectMessage('${doc.id}', '${safeMessage}', '${data.senderName}', '${data.visibility}')" 
                 class="bg-zinc-900/50 p-4 rounded-xl border border-white/5 cursor-pointer hover:border-white/20 transition-all mb-3">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-semibold ${tagColor} px-2 py-1 rounded">${tagText}</span>
                    <span class="text-xs text-zinc-500">${data.senderName}</span>
                </div>
                <p class="text-white text-sm line-clamp-2">${data.message}</p>
            </div>`;
        });
        inbox.innerHTML = htmlContent;

    } catch (error) { 
        console.error("Lỗi tải hộp thư Admin:", error); 
    }
}

window.selectMessage = function(docId, message, author, visibility) {
    currentSelectedDocId = docId;
    document.getElementById('activeMessage').classList.remove('hidden');
    document.getElementById('adminMsgContent').innerText = message;
    
    const tag = document.getElementById('adminMsgType');
    const isPrivate = visibility === 'private';
    tag.innerText = isPrivate ? 'Riêng tư' : 'Công khai';
    tag.className = isPrivate 
        ? 'text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded mb-2 inline-block' 
        : 'text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded mb-2 inline-block';
    
    // Cập nhật dữ liệu vào Canva template
    const canvasText = document.getElementById('canvas-text');
    const canvasAuthor = document.getElementById('canvas-author');
    if (canvasText) canvasText.innerText = `"${message}"`;
    if (canvasAuthor) canvasAuthor.innerText = `- ${author} -`;
}

window.submitReply = async function() {
    if (!currentSelectedDocId) return alert("Vui lòng chọn 1 tin nhắn để trả lời.");
    
    const replyInput = document.getElementById('adminReplyInput');
    const replyText = replyInput.value.trim();
    if (!replyText) return;

    try {
        const msgRef = doc(db, "messages", currentSelectedDocId);
        await updateDoc(msgRef, {
            reply: replyText,
            status: 'answered',
            repliedAt: serverTimestamp()
        });
        
        alert("Đã trả lời thành công!");
        replyInput.value = '';
        document.getElementById('activeMessage').classList.add('hidden');
        currentSelectedDocId = null;
        loadAdminInbox(); // Tải lại danh sách
        
    } catch (error) { 
        console.error("Lỗi trả lời:", error); 
        alert("Lỗi khi đăng câu trả lời. Vui lòng kiểm tra quyền Admin."); 
    }
}

// --- 5. TÍNH NĂNG TẠO ẢNH ĐỂ ĐĂNG FACEBOOK ---
window.exportImage = function(size) {
    if (!currentSelectedDocId) return alert("Vui lòng chọn 1 câu hỏi bên trái trước khi tải ảnh.");
    if (typeof html2canvas === 'undefined') return alert("Thư viện html2canvas chưa được tải.");
    
    const template = document.getElementById('canvas-template');
    
    if (size === 'square') { 
        template.style.width = '1080px'; template.style.height = '1080px';
    } else if (size === 'story') { 
        template.style.width = '1080px'; template.style.height = '1920px';
    } else if (size === 'rect') { 
        template.style.width = '1200px'; template.style.height = '630px';
    }

    html2canvas(template, {
        backgroundColor: '#09090b',
        scale: 2 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `QnA_${size}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error("Lỗi tạo ảnh:", err);
        alert("Có lỗi xảy ra khi tạo ảnh.");
    });
}

// --- 6. XỬ LÝ ĐĂNG NHẬP ADMIN ---

// Hàm đăng nhập
window.adminLogin = async function(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Đăng nhập thành công!", userCredential.user.uid);
        alert("Đăng nhập Admin thành công!");
        loadAdminInbox(); // Đăng nhập xong thì gọi lại hàm tải hộp thư
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        alert("Sai email hoặc mật khẩu!");
    }
}

// Hàm đăng xuất
window.adminLogout = async function() {
    try {
        await signOut(auth);
        alert("Đã đăng xuất!");
        document.getElementById('adminInbox').innerHTML = ''; // Xóa rỗng hộp thư
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
}

// Lắng nghe trạng thái đăng nhập (để biết ai đang online)
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Admin đang đăng nhập với UID:", user.uid);
        // Ở đây bạn có thể dùng JS để ẩn form đăng nhập và hiện Tab Admin lên
    } else {
        console.log("Chưa đăng nhập.");
        // Ở đây bạn dùng JS để hiện form đăng nhập, ẩn Tab Admin đi
    }
});