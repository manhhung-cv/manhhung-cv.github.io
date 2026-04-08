// ==========================================
// CẤU HÌNH FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDlJ3W2Z7wYgx550RG897Gn1Mtlo8mHZtA",
    authDomain: "database-8194f.firebaseapp.com",
    projectId: "database-8194f",
    storageBucket: "database-8194f.firebasestorage.app",
    messagingSenderId: "204852175449",
    appId: "1:204852175449:web:27d5df0244a18026d70748"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Khởi tạo Auth

window._db = db;
window._auth = auth;
window._fsSetDoc = setDoc;
window._fsGetDoc = getDoc;
window._fsDoc = doc;
window._fsCol = collection;
window._fsGetDocs = getDocs;
window._fsQuery = query;
window._fsOrderBy = orderBy;
window._fsDeleteDoc = deleteDoc; // Hàm xóa

window._signIn = signInWithEmailAndPassword;
window._signOut = signOut;
window._onAuthStateChanged = onAuthStateChanged;


