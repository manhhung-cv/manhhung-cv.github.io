document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadingScreen = document.getElementById('loading-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const authError = document.getElementById('auth-error');

    // Auth Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    // Auth Links
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const showForgotPasswordBtn = document.getElementById('show-forgot-password');
    const backToLoginBtn = document.getElementById('back-to-login');

    // Profile Setup Modal
    const profileSetupModal = document.getElementById('profile-setup-modal');
    const displayNameInput = document.getElementById('display-name');
    const avatarInput = document.getElementById('avatar-input');
    const completeProfileBtn = document.getElementById('complete-profile-btn');

    // App Header
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');

    const allowedDomains = ['@icloud.com', '@gmail.com', '@mhung.site'];
    let currentUser = null;
    let newUser = null; // Dùng để lưu user tạm thời sau khi đăng ký

    // Hàm kiểm tra domain email
    function validateEmailDomain(email) {
        return allowedDomains.some(domain => email.endsWith(domain));
    }

    // Hiển thị lỗi
    function setAuthError(message) {
        authError.textContent = message;
        authError.classList.toggle('hidden', !message);
    }

    // Chuyển đổi form
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        forgotPasswordForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        setAuthError('');
    });
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        forgotPasswordForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        setAuthError('');
    });
    showForgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        forgotPasswordForm.classList.remove('hidden');
        setAuthError('');
    });
    backToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        setAuthError('');
    });

    // Xử lý Đăng ký
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        if (!validateEmailDomain(email)) {
            setAuthError('Email phải thuộc các tên miền: @icloud.com, @gmail.com, hoặc @mhung.site');
            return;
        }

        setAuthError('');
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Đăng ký thành công, lưu user lại và hiển thị modal tạo hồ sơ
                newUser = userCredential.user;
                profileSetupModal.classList.remove('hidden');
                authContainer.classList.add('hidden');
            })
            .catch((error) => {
                setAuthError(error.message);
            });
    });

    // Xử lý Hoàn tất Hồ sơ
    completeProfileBtn.addEventListener('click', () => {
        const displayName = displayNameInput.value;
        const avatar = avatarInput.value; // Emoji hoặc FB UID

        if (!displayName) {
            alert('Vui lòng nhập tên hiển thị.');
            return;
        }

        if (!newUser) {
            alert('Lỗi: Không tìm thấy người dùng.');
            return;
        }

        // Tạo hồ sơ người dùng trong Firestore
        db.collection('users').doc(newUser.uid).set({
            displayName: displayName,
            avatar: avatar,
            email: newUser.email
        })
        .then(() => {
            profileSetupModal.classList.add('hidden');
            // Đã có hồ sơ, tiếp tục vào app (onAuthStateChanged sẽ xử lý)
            // (Không cần làm gì thêm ở đây, onAuthStateChanged sẽ tự động chạy)
            newUser = null; // Xóa user tạm
        })
        .catch((error) => {
            alert(`Lỗi tạo hồ sơ: ${error.message}`);
        });
    });


    // Xử lý Đăng nhập
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        setAuthError('');
        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => {
                setAuthError(error.message);
            });
    });

    // Xử lý Đăng xuất
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // Xử lý Quên mật khẩu
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        setAuthError('');
        auth.sendPasswordResetEmail(email)
            .then(() => {
                setAuthError('Đã gửi link khôi phục. Vui lòng kiểm tra email!');
            })
            .catch((error) => {
                setAuthError(error.message);
            });
    });

    // Trạng thái xác thực thay đổi (CORE FUNCTION)
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Người dùng đã đăng nhập
            // Kiểm tra xem họ đã có hồ sơ trong Firestore chưa
            const userDoc = await db.collection('users').doc(user.uid).get();

            if (!userDoc.exists()) {
                // Người dùng đã đăng nhập (ví dụ: F5 trang) nhưng chưa tạo hồ sơ
                // (Trường hợp này nên được xử lý bởi logic đăng ký, nhưng để dự phòng)
                currentUser = user; // Gán tạm thời
                profileSetupModal.classList.remove('hidden');
                authContainer.classList.add('hidden');
                appContainer.classList.add('hidden');
            } else {
                // Đã đăng nhập VÀ có hồ sơ
                currentUser = { uid: user.uid, ...userDoc.data() };
                
                // Cập nhật UI header
                userName.textContent = currentUser.displayName;
                // Xử lý avatar: Nếu là UID Facebook
                if (currentUser.avatar && /^\d+$/.test(currentUser.avatar)) {
                    userAvatar.innerHTML = `<img src="https://graph.facebook.com/${currentUser.avatar}/picture?type=large" alt="avatar" style="width:30px; height:30px; border-radius:50%;">`;
                } else {
                    userAvatar.textContent = currentUser.avatar || '😊'; // Emoji mặc định
                }

                // Hiển thị ứng dụng
                authContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');
                loadingScreen.classList.add('hidden');
                
                // Tải các chuyến đi (định nghĩa trong app.js)
                if (window.loadUserTrips) {
                    window.loadUserTrips(currentUser.uid);
                }
            }
        } else {
            // Người dùng đã đăng xuất hoặc chưa đăng nhập
            currentUser = null;
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            loadingScreen.classList.add('hidden');
        }
    });

    // Expose currentUser cho các tệp khác
    window.getCurrentUser = () => currentUser;
});