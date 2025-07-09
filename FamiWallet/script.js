document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    // Nút đăng xuất không có trong UI mới, nhưng logic có thể giữ lại nếu cần
    // const logoutBtn = document.getElementById('logout-btn');

    // === CHỨC NĂNG CHUYỂN ĐỔI FORM ===
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // === MÔ PHỎNG ĐĂNG NHẬP / ĐĂNG KÝ ===
    // Trong thực tế, bạn sẽ gọi API ở đây
    
    const handleLogin = (e) => {
        e.preventDefault(); // Ngăn form gửi đi
        console.log('Đang xử lý đăng nhập...');
        
        // Mô phỏng đăng nhập thành công
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
    };

    const handleRegister = (e) => {
        e.preventDefault(); // Ngăn form gửi đi
        console.log('Đang xử lý đăng ký...');
        
        // Mô phỏng đăng ký thành công và tự động đăng nhập
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
    };
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Nếu bạn thêm nút đăng xuất, có thể dùng hàm này
    /*
    logoutBtn.addEventListener('click', () => {
       // Mô phỏng đăng xuất
       appContainer.classList.add('hidden');
       authContainer.classList.remove('hidden');
       
       // Đảm bảo form đăng nhập được hiển thị khi quay lại
       registerForm.classList.add('hidden');
       loginForm.classList.remove('hidden');
    });
    */
});
