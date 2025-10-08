// Import các thư viện Firebase cần thiết
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCqUaI__8udllforW6CSCvd6f8_UCLY3CE",
    authDomain: "famibank-c7bfb.firebaseapp.com",
    projectId: "famibank-c7bfb",
    storageBucket: "famibank-c7bfb.appspot.com",
    messagingSenderId: "2439107217721",
    appId: "1:2439107217721:web:e3f52cb495c1bdf35dd588"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Lấy instance của Messaging
const messaging = firebase.messaging();

// Service worker sẽ tự động xử lý các thông báo nền từ đây