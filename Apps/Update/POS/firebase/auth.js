document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const loginError = document.getElementById('login-error');

    // 1. Theo dõi trạng thái đăng nhập của người dùng
    auth.onAuthStateChanged(user => {
        if (user) {
            // Người dùng đã đăng nhập
            console.log("Đã đăng nhập với:", user.email);
            loginScreen.style.display = 'none';
            mainApp.style.display = 'block';
            // Tải dữ liệu ban đầu khi đăng nhập thành công
            syncProductsFromFirebase();
        } else {
            // Người dùng đã đăng xuất hoặc chưa đăng nhập
            console.log("Chưa đăng nhập.");
            loginScreen.style.display = 'flex';
            mainApp.style.display = 'none';
        }
    });

    // 2. Xử lý sự kiện click nút đăng nhập
    loginButton.addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        loginError.textContent = ''; // Xóa thông báo lỗi cũ

        if (!email || !password) {
            loginError.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu.';
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                console.error("Lỗi đăng nhập:", error.code);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    loginError.textContent = 'Email hoặc mật khẩu không chính xác.';
                } else {
                    loginError.textContent = 'Đã có lỗi xảy ra, vui lòng thử lại.';
                }
            });
    });

    // 3. Xử lý sự kiện click nút đăng xuất
    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log('Đăng xuất thành công.');
        });
    });

    // 4. Xử lý quên mật khẩu
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        loginError.textContent = '';

        if (!email) {
            loginError.textContent = 'Vui lòng nhập email của bạn để khôi phục.';
            return;
        }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                Swal.fire('Thành công', `Một email khôi phục mật khẩu đã được gửi đến ${email}.`, 'success');
            })
            .catch(error => {
                console.error("Lỗi gửi email khôi phục:", error);
                loginError.textContent = 'Địa chỉ email không hợp lệ hoặc không tồn tại.';
            });
    });
});