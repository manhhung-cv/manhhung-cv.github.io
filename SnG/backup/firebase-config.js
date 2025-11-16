// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBQOcwUdtv1quQ1UWV8oaGY6kIUwITlSos",
    authDomain: "sharengo-hunq.firebaseapp.com",
    projectId: "sharengo-hunq",
    storageBucket: "sharengo-hunq.firebasestorage.app",
    messagingSenderId: "20454542571",
    appId: "1:20454542571:web:8021a519b26f9be30882ae",
    measurementId: "G-T0XNLVWXYV"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const auth = firebase.auth();
const db = firebase.firestore();

// (Chúng ta sẽ sử dụng Storage sau này để tải ảnh đại diện nếu cần)
// const storage = firebase.storage();