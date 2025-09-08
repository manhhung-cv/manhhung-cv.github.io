// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwata2VqfR7eX2aAPEKL5IhAeT-DCUjdA",
  authDomain: "crm-salon-fb917.firebaseapp.com",
  projectId: "crm-salon-fb917",
  storageBucket: "crm-salon-fb917.firebasestorage.app",
  messagingSenderId: "490391245526",
  appId: "1:490391245526:web:6fb852297533a484ec6f77",
  measurementId: "G-G2BN1VEEGE"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ và export để các tệp khác có thể sử dụng
const auth = firebase.auth();
const db = firebase.firestore();