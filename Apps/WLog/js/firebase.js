// js/firebase.js
import { firebaseConfig } from './config.js';
import { customAlert, customConfirm } from './ui.js';

let db, auth, googleProvider;
export let currentUser = null;

export const initFirebase = (onAuthChange) => {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();

        auth.onAuthStateChanged(user => {
            currentUser = user;
            onAuthChange(user);
        });
    } catch (error) { 
        console.log("Firebase chưa được cấu hình đúng:", error); 
    }
};

export const loginGoogle = async () => {
    if (!auth) return await customAlert("Vui lòng cấu hình Firebase Config.");
    auth.signInWithPopup(googleProvider).catch(async err => await customAlert(err.message, "Lỗi"));
};

export const loginEmail = async (email, pass) => {
    if (!auth) return await customAlert("Vui lòng cấu hình Firebase Config.");
    if (!email || !pass) return await customAlert('Vui lòng nhập Email và Mật khẩu.');

    auth.signInWithEmailAndPassword(email, pass).catch(async err => {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            if (await customConfirm("Tài khoản không tồn tại. Bạn muốn ĐĂNG KÝ mới?")) {
                auth.createUserWithEmailAndPassword(email, pass).catch(async e => await customAlert(e.message, "Lỗi"));
            }
        } else await customAlert(err.message, "Lỗi");
    });
};

export const resetPassword = async (email) => {
    if (!auth) return { success: false, message: "Vui lòng cấu hình Firebase Config." };
    if (!email) return { success: false, message: "Vui lòng nhập Email của bạn vào ô đăng nhập trước." };
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (err) {
        if (err.code === 'auth/user-not-found') return { success: false, message: "Tài khoản này chưa được đăng ký." };
        return { success: false, message: err.message };
    }
};

export const logout = () => { if (auth) auth.signOut(); };

export const createCloudBackup = async (name, data, isAuto = false) => {
    if (!db || !currentUser || !navigator.onLine) return false;
    try {
        const userBackupsRef = db.collection('users').doc(currentUser.uid).collection('backups');
        if (isAuto) await userBackupsRef.doc('auto_backup').set(data);
        else await userBackupsRef.add(data);
        return true;
    } catch (err) { return false; }
};

export const getCloudBackups = async () => {
    if (!db || !currentUser) return null;
    try {
        const snap = await db.collection('users').doc(currentUser.uid).collection('backups').get();
        let backups = [];
        snap.forEach(doc => { backups.push({ id: doc.id, ...doc.data() }); });
        return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) { return null; }
};

export const getCloudBackupById = async (docId) => {
    if (!db || !currentUser) return null;
    const doc = await db.collection('users').doc(currentUser.uid).collection('backups').doc(docId).get();
    return doc.exists ? doc.data() : null;
};

export const deleteCloudBackupById = async (docId) => {
    if (!db || !currentUser) return false;
    await db.collection('users').doc(currentUser.uid).collection('backups').doc(docId).delete();
    return true;
};