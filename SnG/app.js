
// Nhập các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Cấu hình Firebase của bạn
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Biến toàn cục
let currentUser = null;
let currentTrip = {
    id: null,
    name: "",
    ownerId: null,
    maxPeople: 0,
    inviteCode: ""
};
let map = null;
let locationMarker = null;
let userIcon = null;
let historyUnsubscribe = null;
let chatUnsubscribe = null;
let localHistoryCache = [];

// DOM Elements
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const forgotPasswordForm = document.getElementById("forgot-password-form");
const tripsView = document.getElementById("trips-view");
const singleTripView = document.getElementById("single-trip-view");
const loadingDiv = document.getElementById("loading");

// Auth elements
const userDisplay = document.getElementById("user-display");
const logoutButton = document.getElementById("logout-button");
const showRegisterLink = document.getElementById("show-register-link");
const showLoginLink = document.getElementById("show-login-link");
const showForgotPassLink = document.getElementById("show-forgot-pass-link");
const backToLoginLink = document.getElementById("back-to-login-link");
const registerPass = document.getElementById("register-password");
const registerConfirmPass = document.getElementById("register-confirm-password");
const registerTogglePass = document.getElementById("register-toggle-pass");

// Trip elements
const createTripForm = document.getElementById("create-trip-form");
const joinTripForm = document.getElementById("join-trip-form");
const tripsList = document.getElementById("trips-list");
const tripNameDisplay = document.getElementById("trip-name-display");
const tripControls = document.getElementById("trip-controls");
const backToTripsButton = document.getElementById("back-to-trips");

// Trip Tabs
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
let activeTab = 'input-tab'; // BỔ SUNG: Theo dõi tab

// Input Tab elements
const addLocationForm = document.getElementById("add-location-form");
const locationAddressInput = document.getElementById("location-address");
const locationPositionInput = document.getElementById("location-position");
const locationPeopleInput = document.getElementById("location-people");
const locationCostInput = document.getElementById("location-cost");
const locationTimeInput = document.getElementById("location-time");
const locationDateInput = document.getElementById("location-date");
const getLocationButton = document.getElementById("get-location-button");
const getCurrentTimeButton = document.getElementById("get-current-time-button");
const mapContainer = document.getElementById("map-container");
const mapSearchResults = document.getElementById("map-search-results");
const mapModeDefault = document.getElementById("map-mode-default");
const mapModeSatellite = document.getElementById("map-mode-satellite");
const mapModeDark = document.getElementById("map-mode-dark");

// History Tab elements
const historyList = document.getElementById("history-list");
const searchHistoryInput = document.getElementById("search-history");
const sortHistorySelect = document.getElementById("sort-history");
const exportTxtButton = document.getElementById("export-txt");
const exportJsonButton = document.getElementById("export-json");
const exportXlsxButton = document.getElementById("export-xlsx");
const copyHistoryButton = document.getElementById("copy-history");

// Chat Tab elements
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

// Stats Tab elements
const statsContent = document.getElementById("stats-content");

// Edit Trip Modal
const editTripModal = document.getElementById("edit-trip-modal");
const editTripForm = document.getElementById("edit-trip-form");
const closeEditTripModal = document.getElementById("close-edit-trip-modal");

// Edit Location Modal
const editLocationModal = document.getElementById("edit-location-modal");
const editLocationForm = document.getElementById("edit-location-form");
const closeEditLocationModal = document.getElementById("close-edit-location-modal");
let editingLocationId = null;

// Account Modal
const accountModal = document.getElementById("account-modal");
const closeAccountModal = document.getElementById("close-account-modal");
const updateProfileForm = document.getElementById("update-profile-form");
const updatePasswordForm = document.getElementById("update-password-form");

// BỔ SUNG: Theme Switcher Elements
const themeSystemBtn = document.getElementById("theme-system");
const themeLightBtn = document.getElementById("theme-light");
const themeDarkBtn = document.getElementById("theme-dark");

// Tile layers cho bản đồ
let tileLayers = {};
let currentTileLayer = null;

// =================================================================
// BỔ SUNG: QUẢN LÝ CHỦ ĐỀ (THEME)
// =================================================================



// =================================================================
// KHỞI TẠO VÀ QUẢN LÝ TRẠNG THÁI
// =================================================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            currentUser = { ...user, ...userDoc.data() };
        } else {
            currentUser = user;
        }

        const fbId = currentUser.facebookId;
        const name = currentUser.name || currentUser.displayName || currentUser.email;

        // BỔ SUNG: Icon dự phòng nếu không có FB ID
        const avatarUrl = fbId
            ? `https://graph.facebook.com/${fbId}/picture?width=9999&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`
            : '';

        const userIconHtml = fbId
            ? `<img src="${avatarUrl}" class="chat-avatar">`
            : `<span class="chat-avatar" style="display: inline-flex; align-items: center; justify-content: center; background-color: var(--input-bg); color: var(--text-color); font-weight: 600;">${name.charAt(0).toUpperCase()}</span>`;

        userDisplay.innerHTML = `${userIconHtml} ${name}`;

        // BỔ SUNG: Tạo userIcon tùy chỉnh
        const iconHtml = fbId
            ? `<img src="${avatarUrl}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid white;">`
            : `<div style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid white; background-color: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600;">${name.charAt(0).toUpperCase()}</div>`;

        userIcon = L.divIcon({
            html: iconHtml,
            className: '', // Bỏ class mặc định của leaflet
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        authContainer.style.display = "none";
        appContainer.style.display = "flex"; // Sửa thành flex

        const savedTripId = localStorage.getItem('currentTripId');

        if (savedTripId) {
            showLoading("Đang tải lại chuyến đi...");
            try {
                const tripDocRef = doc(db, "trips", savedTripId);
                const tripDoc = await getDoc(tripDocRef);

                if (tripDoc.exists()) {
                    openTrip(tripDoc.id, tripDoc.data());
                } else {
                    localStorage.removeItem('currentTripId');
                    showView('trips');
                    loadTrips();
                }
            } catch (error) {
                console.error("Lỗi khôi phục chuyến đi:", error);
                localStorage.removeItem('currentTripId');
                showView('trips');
                loadTrips();
            }
        } else {
            showView('trips');
            loadTrips();
        }

        await handleJoinLinkOnLoad();

    } else {
        currentUser = null;
        authContainer.style.display = "flex"; // Sửa thành flex
        appContainer.style.display = "none";
        setTimeout(() => {
            loadingDiv.style.display = "none";
        }, 10000);
    }
});

function showLoading(message = "Đang tải...") {
    loadingDiv.textContent = message;
    loadingDiv.style.display = "block";
}

function hideLoading() {
    loadingDiv.style.display = "none";
}

function showView(viewName) {
    tripsView.style.display = "none";
    singleTripView.style.display = "none";

    // Ẩn tất cả nội dung chính
    document.querySelectorAll('.main-content').forEach(v => v.style.display = 'none');

    if (viewName === 'trips') {
        tripsView.style.display = "block";
        currentTrip.id = null;
        if (historyUnsubscribe) historyUnsubscribe();
        if (chatUnsubscribe) chatUnsubscribe();
    } else if (viewName === 'singleTrip') {
        singleTripView.style.display = "block";
    }
}

function showTripTab(tabName) {
    tabContents.forEach(content => content.style.display = 'none');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const activeTabContent = document.getElementById(tabName);
    const activeTabButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);

    if (activeTabContent) {
        // SỬA ĐỔI: Tab chat cần layout flex
        if (tabName === 'chat-tab') {
            activeTabContent.style.display = 'flex';
        } else {
            activeTabContent.style.display = 'block';
        }
    }
    if (activeTabButton) {
        activeTabButton.classList.add('active');
    }

    activeTab = tabName;

    if (tabName === 'input-tab' && !map) {
        initMap();
    }

    // SỬA ĐỔI: Cuộn lên đầu khi chuyển tab
    const mainContent = singleTripView.querySelector('.main-content');
    if (mainContent) mainContent.scrollTop = 0;
}

// =================================================================
// CHỨC NĂNG XÁC THỰC (AUTH)
// =================================================================

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value;
    const facebookId = document.getElementById("register-facebook").value;
    const email = document.getElementById("register-email").value;
    const password = registerPass.value;
    const confirmPassword = registerConfirmPass.value;

    const allowedDomains = ["@icloud.com", "@gmail.com", "@mhung.site"];
    if (!allowedDomains.some(domain => email.endsWith(domain))) {
        alert("Email phải có đuôi là @icloud.com, @gmail.com, hoặc @mhung.site");
        return;
    }

    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp!");
        return;
    }

    showLoading("Đang đăng ký...");
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            facebookId: facebookId,
            createdAt: serverTimestamp()
        });

        hideLoading();
        alert("Đăng ký thành công!");
    } catch (error) {
        hideLoading();
        alert("Lỗi đăng ký: " + error.message);
        console.error("Register error:", error);
    }
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    showLoading("Đang đăng nhập...");
    try {
        await signInWithEmailAndPassword(auth, email, password);
        hideLoading();
    } catch (error) {
        hideLoading();
        alert("Lỗi đăng nhập: " + error.message);
        console.error("Login error:", error);
    }
});

logoutButton.addEventListener("click", async () => {
    try {
        localStorage.removeItem('currentTripId');
        await signOut(auth);
    } catch (error) {
        alert("Lỗi đăng xuất: " + error.message);
    }
});

forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value;
    showLoading("Đang gửi email...");
    try {
        await sendPasswordResetEmail(auth, email);
        hideLoading();
        alert("Email đặt lại mật khẩu đã được gửi!");
    } catch (error) {
        hideLoading();
        alert("Lỗi: " + error.message);
    }
});

function togglePasswordVisibility(inputElement) {
    if (inputElement.type === "password") {
        inputElement.type = "text";
    } else {
        inputElement.type = "password";
    }
}
registerTogglePass.addEventListener("click", (e) => {
    e.preventDefault(); // Ngăn form submit
    togglePasswordVisibility(registerPass);
    togglePasswordVisibility(registerConfirmPass);
    // Cập nhật icon
    const icon = e.target.querySelector('i');
    if (registerPass.type === "password") {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
});

showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    forgotPasswordForm.style.display = "none";
    registerForm.style.display = "block";
});
showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
});
showForgotPassLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    forgotPasswordForm.style.display = "block";
});
backToLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    forgotPasswordForm.style.display = "none";
    loginForm.style.display = "block";
});

// =================================================================
// QUẢN LÝ TÀI KHOẢN (Modal)
// =================================================================

userDisplay.addEventListener("click", () => {
    if (!currentUser) return;
    document.getElementById("account-name").value = currentUser.name || currentUser.displayName || '';
    document.getElementById("account-facebook").value = currentUser.facebookId || '';
    updatePasswordForm.reset();
    accountModal.style.display = "flex"; // Sửa thành flex
});

closeAccountModal.onclick = () => { accountModal.style.display = "none"; }

updateProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newName = document.getElementById("account-name").value;
    const newFbId = document.getElementById("account-facebook").value;

    if (!newName) {
        alert("Tên không được để trống.");
        return;
    }

    showLoading("Đang cập nhật...");
    try {
        await updateProfile(auth.currentUser, { displayName: newName });

        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
            name: newName,
            facebookId: newFbId
        });

        currentUser.displayName = newName;
        currentUser.name = newName;
        currentUser.facebookId = newFbId;

        // BỔ SUNG: Cập nhật UI (với icon dự phòng)
        const avatarUrl = newFbId
            ? `https://graph.facebook.com/${newFbId}/picture?width=9999&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`
            : '';

        const userIconHtml = newFbId
            ? `<img src="${avatarUrl}" class="chat-avatar">`
            : `<span class="chat-avatar" style="display: inline-flex; align-items: center; justify-content: center; background-color: var(--input-bg); color: var(--text-color); font-weight: 600;">${newName.charAt(0).toUpperCase()}</span>`;

        userDisplay.innerHTML = `${userIconHtml} ${newName}`;

        // BỔ SUNG: Cập nhật userIcon
        const iconHtml = newFbId
            ? `<img src="${avatarUrl}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid white;">`
            : `<div style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid white; background-color: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600;">${newName.charAt(0).toUpperCase()}</div>`;

        userIcon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        if (locationMarker) {
            locationMarker.setIcon(userIcon);
        }

        hideLoading();
        alert("Cập nhật thông tin thành công!");
        accountModal.style.display = "none";

    } catch (error) {
        hideLoading();
        console.error("Update profile error:", error);
        alert("Lỗi khi cập nhật: " + error.message);
    }
});

updatePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPass = document.getElementById("account-current-pass").value;
    const newPass = document.getElementById("account-new-pass").value;
    const confirmPass = document.getElementById("account-confirm-pass").value;

    if (newPass !== confirmPass) {
        alert("Mật khẩu mới không khớp!");
        return;
    }
    if (!currentPass || !newPass) {
        alert("Vui lòng nhập đủ thông tin.");
        return;
    }

    showLoading("Đang đổi mật khẩu...");
    try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPass);
        await reauthenticateWithCredential(user, credential);

        await updatePassword(user, newPass);

        hideLoading();
        alert("Đổi mật khẩu thành công!");
        accountModal.style.display = "none";

    } catch (error) {
        hideLoading();
        console.error("Update password error:", error);
        alert("Lỗi đổi mật khẩu: " + error.message);
    }
});

// =================================================================
// TAB SHARE&GO (QUẢN LÝ CHUYẾN ĐI)
// =================================================================

function loadTrips() {
    if (!currentUser) return;
    showLoading("Đang tải chuyến đi...");

    const q = query(collection(db, "trips"), where("members", "array-contains", currentUser.uid));

    onSnapshot(q, (snapshot) => {
        tripsList.innerHTML = "";
        if (snapshot.empty) {
            tripsList.innerHTML = "<p>Bạn chưa tham gia chuyến đi nào.</p>";
        }
        snapshot.forEach((doc) => {
            const trip = doc.data();
            const tripElement = document.createElement("div");
            tripElement.className = "card"; // BỔ SUNG: Dùng style card

            // BỔ SUNG: Thêm icon
            tripElement.innerHTML = `
                        <h3><i class="fa-solid fa-route" style="margin-right: 8px; color: var(--primary-color);"></i> ${trip.name}</h3>
                        <p>${trip.description}</p>
                        <p>
                            <i class="fa-solid fa-users" style="margin-right: 8px;"></i> ${trip.maxPeople} người
                            <i class="fa-solid fa-user-tie" style="margin-right: 8px; margin-left: 16px;"></i> ${trip.ownerName || 'Không rõ'}
                        </p>
                        <div class="card-actions"></div>
                    `;

            const actionsDiv = tripElement.querySelector('.card-actions');

            const openButton = document.createElement("button");
            openButton.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i> Mở`;
            openButton.onclick = () => openTrip(doc.id, trip);
            actionsDiv.appendChild(openButton);

            if (currentUser.uid === trip.ownerId) {
                const editButton = document.createElement("button");
                editButton.innerHTML = `<i class="fa-solid fa-pen"></i>`;
                editButton.className = "small secondary"; // BỔ SUNG
                editButton.onclick = (e) => {
                    currentTrip.id = doc.id;
                    currentTrip.ownerId = trip.ownerId;
                    showEditTripModal(trip);
                };

                const deleteButton = document.createElement("button");
                deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
                deleteButton.className = "small secondary"; // BỔ SUNG
                deleteButton.onclick = (e) => {
                    deleteTrip(doc.id, trip.name, trip.ownerId);
                };

                actionsDiv.appendChild(editButton);
                actionsDiv.appendChild(deleteButton);
            }

            tripsList.appendChild(tripElement);
        });
        hideLoading();
    }, (error) => {
        hideLoading();
        console.error("Error loading trips: ", error);
        alert("Không thể tải danh sách chuyến đi.");
    });
}

createTripForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const name = document.getElementById("trip-name").value;
    const description = document.getElementById("trip-description").value;
    const maxPeople = parseInt(document.getElementById("trip-max-people").value, 10);

    if (!name || isNaN(maxPeople) || maxPeople <= 0) {
        alert("Vui lòng nhập tên và số người hợp lệ.");
        return;
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    showLoading("Đang tạo chuyến đi...");
    try {
        await addDoc(collection(db, "trips"), {
            name: name,
            description: description,
            maxPeople: maxPeople,
            ownerId: currentUser.uid,
            ownerName: currentUser.name || currentUser.displayName || currentUser.email,
            members: [currentUser.uid],
            createdAt: serverTimestamp(),
            inviteCode: inviteCode
        });
        hideLoading();
        createTripForm.reset();
    } catch (error) {
        hideLoading();
        console.error("Error creating trip: ", error);
        alert("Lỗi khi tạo chuyến đi.");
    }
});

function openTrip(tripId, tripData) {
    localStorage.setItem('currentTripId', tripId);

    currentTrip.id = tripId;
    currentTrip.name = tripData.name;
    currentTrip.ownerId = tripData.ownerId;
    currentTrip.maxPeople = tripData.maxPeople;
    currentTrip.inviteCode = tripData.inviteCode;

    tripNameDisplay.textContent = `${tripData.name}`;

    tripControls.innerHTML = "";
    if (currentUser.uid === tripData.ownerId) {
        const editButton = document.createElement("button");
        editButton.innerHTML = `<i class="fa-solid fa-pen"></i> Sửa`;
        editButton.className = "secondary";
        editButton.onclick = () => showEditTripModal(tripData);

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i> Xóa`;
        deleteButton.className = "secondary";
        deleteButton.onclick = () => deleteTrip(tripId, tripData.name, tripData.ownerId);

        const addMemberButton = document.createElement("button");
        addMemberButton.innerHTML = `<i class="fa-solid fa-user-plus"></i> Thêm`;
        addMemberButton.className = "secondary";
        addMemberButton.onclick = () => addMemberToTrip(tripId);

        tripControls.appendChild(editButton);
        tripControls.appendChild(deleteButton);
        tripControls.appendChild(addMemberButton);

        const inviteDiv = document.createElement("div");
        inviteDiv.className = "invite-info"; // BỔ SUNG
        const inviteLink = `${window.location.origin}${window.location.pathname}#join=${tripData.inviteCode}`;
        inviteDiv.innerHTML = `
                    <p>
                        <strong><i class="fa-solid fa-key"></i> Mã mời:</strong> ${tripData.inviteCode} 
                    </p>
                    <p>
                        <strong><i class="fa-solid fa-link"></i> Link:</strong> <a href="${inviteLink}" target="_blank">${inviteLink}</a>
                    </p>
                `;
        const changeCodeBtn = document.createElement("button");
        changeCodeBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Đổi mã`;
        changeCodeBtn.className = "secondary";
        changeCodeBtn.onclick = () => changeInviteCode(tripId, tripData.inviteCode);

        tripControls.appendChild(inviteDiv);
        tripControls.appendChild(changeCodeBtn);
    }

    showView('singleTrip');
    showTripTab('input-tab');

    if (historyUnsubscribe) historyUnsubscribe();
    if (chatUnsubscribe) chatUnsubscribe();

    loadHistory(tripId);
    loadChat(tripId);
}

backToTripsButton.addEventListener("click", () => {
    localStorage.removeItem('currentTripId');
    showView('trips');
});

async function addMemberToTrip(tripId) {
    const email = prompt("Nhập email của thành viên muốn thêm:");
    if (!email) return;

    showLoading("Đang tìm và thêm thành viên...");
    try {
        const userQuery = query(collection(db, "users"), where("email", "==", email));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
            hideLoading();
            alert("Không tìm thấy người dùng với email này.");
            return;
        }

        const userToAdd = userSnapshot.docs[0].data();

        const tripRef = doc(db, "trips", tripId);
        await updateDoc(tripRef, {
            members: arrayUnion(userToAdd.uid)
        });

        hideLoading();
        alert(`Đã thêm ${userToAdd.name || userToAdd.email} vào chuyến đi!`);

    } catch (error) {
        hideLoading();
        console.error("Error adding member: ", error);
        alert("Lỗi khi thêm thành viên.");
    }
}

function showEditTripModal(tripData) {
    document.getElementById("edit-trip-name").value = tripData.name;
    document.getElementById("edit-trip-description").value = tripData.description;
    document.getElementById("edit-trip-max-people").value = tripData.maxPeople;
    editTripModal.style.display = "flex"; // Sửa thành flex
}

closeEditTripModal.onclick = () => { editTripModal.style.display = "none"; }

editTripForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (currentUser.uid !== currentTrip.ownerId) return;

    const name = document.getElementById("edit-trip-name").value;
    const description = document.getElementById("edit-trip-description").value;
    const maxPeople = parseInt(document.getElementById("edit-trip-max-people").value, 10);

    if (!name || isNaN(maxPeople) || maxPeople <= 0) {
        alert("Vui lòng nhập thông tin hợp lệ.");
        return;
    }

    showLoading("Đang cập nhật...");
    try {
        const tripRef = doc(db, "trips", currentTrip.id);
        await updateDoc(tripRef, {
            name: name,
            description: description,
            maxPeople: maxPeople
        });

        tripNameDisplay.textContent = `Chuyến đi: ${name}`;
        currentTrip.name = name;
        currentTrip.maxPeople = maxPeople;

        hideLoading();
        editTripModal.style.display = "none";
    } catch (error) {
        hideLoading();
        console.error("Error updating trip: ", error);
        alert("Lỗi khi cập nhật.");
    }
});

async function deleteTrip(tripId, tripName, ownerId) {
    if (currentUser.uid !== ownerId) {
        alert("Bạn không có quyền xóa chuyến đi này.");
        return;
    }

    if (!confirm(`Bạn có chắc muốn xóa chuyến đi "${tripName}"? Hành động này không thể hoàn tác.`)) {
        return;
    }

    showLoading("Đang xóa...");
    try {
        await deleteDoc(doc(db, "trips", tripId));

        if (currentTrip.id === tripId || localStorage.getItem('currentTripId') === tripId) {
            localStorage.removeItem('currentTripId');
            showView('trips');
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        console.error("Error deleting trip: ", error);
        alert("Lỗi khi xóa chuyến đi.");
    }
}

async function changeInviteCode(tripId, oldCode) {
    const newCode = prompt("Nhập mã mời mới (để trống để tạo ngẫu nhiên):", oldCode);
    if (newCode === null) return;

    let finalCode = newCode.trim().toUpperCase();
    if (finalCode === "") {
        finalCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    showLoading("Đang đổi mã...");
    try {
        await updateDoc(doc(db, "trips", tripId), { inviteCode: finalCode });
        hideLoading();
        alert("Đã đổi mã mời thành: " + finalCode);
        openTrip(currentTrip.id, { ...currentTrip, inviteCode: finalCode });
    } catch (error) {
        hideLoading();
        alert("Lỗi khi đổi mã.");
    }
}

joinTripForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const codeInput = document.getElementById("join-code").value;
    joinTripByCode(codeInput);
});

async function handleJoinLinkOnLoad() {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#join=")) {
        const code = hash.substring(6);
        if (code && currentUser) {
            await joinTripByCode(code);
            window.location.hash = "";
        }
    }
}


async function joinTripByCode(codeInput) {
    if (!currentUser) {
        alert("Bạn cần đăng nhập để tham gia.");
        return;
    }

    let code = codeInput.trim();
    if (code.includes("#join=")) {
        code = code.split("#join=")[1].trim();
    }

    if (!code) {
        alert("Vui lòng nhập mã mời.");
        return;
    }

    showLoading("Đang tìm và tham gia...");
    try {
        const q = query(collection(db, "trips"), where("inviteCode", "==", code));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            hideLoading();
            alert("Không tìm thấy chuyến đi với mã này.");
            return;
        }

        const tripDoc = snapshot.docs[0];
        const tripRef = doc(db, "trips", tripDoc.id);
        const tripData = tripDoc.data();

        if (tripData.members && tripData.members.includes(currentUser.uid)) {
            hideLoading();
            alert(`Bạn đã tham gia chuyến đi "${tripData.name}" rồi!`);
            document.getElementById("join-code").value = "";
            return;
        }

        await updateDoc(tripRef, {
            members: arrayUnion(currentUser.uid)
        });

        hideLoading();
        document.getElementById("join-code").value = "";
        alert(`Đã tham gia chuyến đi "${tripData.name}"!`);

    } catch (error) {
        hideLoading();
        console.error("Join trip error:", error);
        alert("Lỗi khi tham gia.");
    }
}

// =================================================================
// TAB 1: NHẬP LIỆU (ĐỊA ĐIỂM)
// =================================================================

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

function initMap() {
    if (map) return;

    mapContainer.style.height = '300px';
    map = L.map('map-container').setView([21.028511, 105.804817], 13);

    tileLayers.default = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tileLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });
    tileLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    });

    currentTileLayer = tileLayers.default;
    currentTileLayer.addTo(map);

    if (!userIcon) {
        // Tạo icon dự phòng nếu onAuthStateChanged chưa chạy xong
        const iconHtml = `<div style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid white; background-color: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600;">?</div>`;
        userIcon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
    }

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        locationPositionInput.value = `${lat}, ${lng}`;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                locationAddressInput.value = data.display_name || `Tọa độ: ${lat}, ${lng}`;
            });

        if (locationMarker) {
            locationMarker.setLatLng(e.latlng);
            locationMarker.setIcon(userIcon);
        } else {
            locationMarker = L.marker(e.latlng, { icon: userIcon }).addTo(map);
        }
        locationMarker.bindPopup("Vị trí đã chọn").openPopup();
    });
}

mapModeDefault.onclick = () => {
    if (map && currentTileLayer !== tileLayers.default) {
        map.removeLayer(currentTileLayer);
        currentTileLayer = tileLayers.default;
        currentTileLayer.addTo(map);
    }
};
mapModeSatellite.onclick = () => {
    if (map && currentTileLayer !== tileLayers.satellite) {
        map.removeLayer(currentTileLayer);
        currentTileLayer = tileLayers.satellite;
        currentTileLayer.addTo(map);
    }
};
mapModeDark.onclick = () => {
    if (map && currentTileLayer !== tileLayers.dark) {
        map.removeLayer(currentTileLayer);
        currentTileLayer = tileLayers.dark;
        currentTileLayer.addTo(map);
    }
};

getLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ định vị.");
        return;
    }
    if (!map) initMap();

    showLoading("Đang định vị...");
    navigator.geolocation.getCurrentPosition((position) => {
        hideLoading();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const latLng = [lat, lng];

        locationPositionInput.value = `${lat}, ${lng}`;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                locationAddressInput.value = data.display_name || `Tọa độ: ${lat}, ${lng}`;
            });

        map.setView(latLng, 16);

        if (locationMarker) {
            locationMarker.setLatLng(latLng);
            locationMarker.setIcon(userIcon);
        } else {
            locationMarker = L.marker(latLng, { icon: userIcon }).addTo(map);
        }
        locationMarker.bindPopup("Vị trí của bạn").openPopup();

    }, (error) => {
        hideLoading();
        alert("Không thể lấy vị trí: " + error.message);
    });
});

const debouncedSearch = debounce(async (query) => {
    if (!query || !map) {
        mapSearchResults.innerHTML = "";
        return;
    }

    mapSearchResults.innerHTML = "<p>Đang tìm...</p>";
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();

        mapSearchResults.innerHTML = "";

        if (data && data.length > 0) {

            data.slice(0, 5).forEach(result => {
                const resultBtn = document.createElement("button");
                resultBtn.textContent = result.display_name;

                resultBtn.onclick = () => {
                    const lat = parseFloat(result.lat);
                    const lng = parseFloat(result.lon);

                    locationAddressInput.value = result.display_name;
                    locationPositionInput.value = `${lat}, ${lng}`;

                    const latLng = [lat, lng];
                    map.setView(latLng, 16);

                    if (locationMarker) {
                        locationMarker.setLatLng(latLng);
                        locationMarker.setIcon(userIcon);
                    } else {
                        locationMarker = L.marker(latLng, { icon: userIcon }).addTo(map);
                    }
                    locationMarker.bindPopup(result.display_name).openPopup();

                    mapSearchResults.innerHTML = "";
                };
                mapSearchResults.appendChild(resultBtn);
            });

        } else {
            mapSearchResults.innerHTML = "<p>Không tìm thấy địa điểm.</p>";
        }
    } catch (error) {
        mapSearchResults.innerHTML = "<p>Lỗi khi tìm kiếm.</p>";
        console.error("Map search error:", error);
    }
}, 500);

locationAddressInput.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
});

document.getElementById("people-decrease").onclick = (e) => {
    e.preventDefault();
    let val = parseInt(locationPeopleInput.value, 10) || 1;
    if (val > 1) locationPeopleInput.value = val - 1;
};
document.getElementById("people-increase").onclick = (e) => {
    e.preventDefault();
    let val = parseInt(locationPeopleInput.value, 10) || 0;
    locationPeopleInput.value = val + 1;
};
document.getElementById("people-max").onclick = (e) => {
    e.preventDefault();
    locationPeopleInput.value = currentTrip.maxPeople;
};
locationPeopleInput.oninput = () => {
    let val = parseInt(locationPeopleInput.value, 10);
    if (isNaN(val) || val < 1) locationPeopleInput.value = 1;
};

const formatter = new Intl.NumberFormat('vi-VN');
locationCostInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\./g, '');
    if (isNaN(value) || value === '') {
        e.target.dataset.raw = '';
        e.target.value = '';
    } else {
        let num = parseInt(value, 10);
        e.target.dataset.raw = num;
        e.target.value = formatter.format(num);
    }
});

locationTimeInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 4) value = value.substring(0, 4);

    if (value.length === 1 && parseInt(value) > 2) {
        value = "0" + value;
    }
    if (value.length === 2) {
        let hh = parseInt(value);
        if (hh > 23) value = "23";
    }
    if (value.length === 3) {
        let mm = parseInt(value.substring(2));
        if (mm > 5) {
            value = value.substring(0, 2) + "0" + value.substring(2);
        } else {
            value = value.substring(0, 2) + ":" + value.substring(2);
        }
    }
    if (value.length === 4) {
        let hh = parseInt(value.substring(0, 2));
        let mm = parseInt(value.substring(2, 4));
        if (hh > 23) hh = 23;
        if (mm > 59) mm = 59;
        value = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    if (value.length <= 2 && e.inputType === 'insertText') {
        let num = parseInt(value);
        if (num > 23 && num <= 59) {
            value = "00:" + String(num).padStart(2, '0');
        } else if (num > 59) {
            value = "00:59";
        }
    }
    e.target.value = value;
});

locationDateInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    const year = new Date().getFullYear();

    if (value.length > 4) value = value.substring(0, 4);

    if (value.length === 1 && parseInt(value) > 3) {
        value = "0" + value;
    }
    if (value.length === 2) {
        let dd = parseInt(value);
        if (dd > 31) value = "31";
    }
    if (value.length === 3) {
        let mm = parseInt(value.substring(2));
        if (mm > 1) {
            value = value.substring(0, 2) + "0" + value.substring(2);
        } else {
            value = value.substring(0, 2) + "/" + value.substring(2);
        }
    }
    if (value.length === 4) {
        let dd = parseInt(value.substring(0, 2));
        let mm = parseInt(value.substring(2, 4));
        if (dd > 31) dd = 31;
        if (mm > 12) mm = 12;
        if (mm === 0) mm = 1;

        value = `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${year}`;
    }
    e.target.value = value;
});

getCurrentTimeButton.addEventListener("click", (e) => {
    e.preventDefault();
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    locationTimeInput.value = `${hours}:${minutes}`;
    locationDateInput.value = `${day}/${month}/${year}`;
});

addLocationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentTrip.id || !currentUser) return;

    const locationName = document.getElementById("location-name").value;
    const address = locationAddressInput.value;
    const position = locationPositionInput.value;

    const numPeople = parseInt(locationPeopleInput.value, 10);
    const cost = parseInt(locationCostInput.dataset.raw || 0, 10);
    const time = locationTimeInput.value;
    let date = locationDateInput.value;
    const rating = document.getElementById("location-rating").value;
    const notes = document.getElementById("location-notes").value;

    if (date.length === 2 && !isNaN(date)) {
        const now = new Date();
        const day = String(date).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        date = `${day}/${month}/${year}`;
    }

    let sortableTime = null;
    try {
        const [day, month, year] = date.split('/');
        const [hours, minutes] = time.split(':');
        sortableTime = new Date(year, month - 1, day, hours, minutes);
    } catch (err) {
        console.warn("Invalid date/time for sorting", err);
        sortableTime = new Date();
    }

    const locationData = {
        tripId: currentTrip.id,
        locationName,
        address,
        position,
        numPeople,
        cost,
        time,
        date,
        rating: parseInt(rating, 10),
        notes,
        createdBy: {
            uid: currentUser.uid,
            name: currentUser.name || currentUser.displayName || currentUser.email
        },
        createdAt: serverTimestamp(),
        sortableTime: sortableTime
    };

    showLoading("Đang thêm địa điểm...");
    try {
        const collectionRef = collection(db, "trips", currentTrip.id, "locations");
        await addDoc(collectionRef, locationData);

        hideLoading();
        addLocationForm.reset();
        locationCostInput.dataset.raw = '';
        locationAddressInput.value = '';
        locationPositionInput.value = '';
        if (locationMarker) {
            map.removeLayer(locationMarker);
            locationMarker = null;
        }

        showTripTab('history-tab');

    } catch (error) {
        hideLoading();
        console.error("Error adding location: ", error);
        alert("Lỗi khi thêm địa điểm.");
    }
});

// =================================================================
// TAB 2: LỊCH SỬ
// =================================================================

function loadHistory(tripId) {
    showLoading("Đang tải lịch sử...");
    const q = query(collection(db, "trips", tripId, "locations"), orderBy("sortableTime", "desc"));

    historyUnsubscribe = onSnapshot(q, (snapshot) => {
        localHistoryCache = [];
        historyList.innerHTML = "";

        if (snapshot.empty) {
            historyList.innerHTML = "<p>Chưa có địa điểm nào được thêm.</p>";
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            localHistoryCache.push(data);
        });

        renderHistory(localHistoryCache);
        calculateAndShowStats(localHistoryCache);
        hideLoading();

    }, (error) => {
        hideLoading();
        console.error("Error loading history: ", error);
    });
}

function renderHistory(dataArray) {
    historyList.innerHTML = "";
    dataArray.forEach(data => {
        const item = document.createElement("div");
        item.className = "card"; // BỔ SUNG

        let costPerPerson = 0;
        if (data.cost > 0 && data.numPeople > 0) {
            costPerPerson = data.cost / data.numPeople;
        }

        // BỔ SUNG: Dùng icon
        item.innerHTML = `
                    <h4>${data.locationName}</h4>
                    <p><strong><i class="fa-solid fa-user-pen" style="width: 20px;"></i></strong> ${data.createdBy.name}</p>
                    <p><strong><i class="fa-solid fa-map-pin" style="width: 20px;"></i></strong> ${data.address || "Không rõ"}</p>
                    <p>
                        <strong><i class="fa-solid fa-map-location-dot" style="width: 20px;"></i></strong> 
                        <a href="https://www.google.com/maps?q=${data.position}" target="_blank">
                            Xem Google Map
                        </a>
                    </p>
                    <p><strong><i class="fa-solid fa-clock" style="width: 20px;"></i></strong> ${data.time} - ${data.date}</p>
                    <p><strong><i class="fa-solid fa-users" style="width: 20px;"></i></strong> ${data.numPeople} người</p>
                    <p><strong><i class="fa-solid fa-money-bill" style="width: 20px;"></i></strong> ${formatter.format(data.cost)} VNĐ</p>
                    <p><strong><i class="fa-solid fa-calculator" style="width: 20px;"></i></strong> ${formatter.format(costPerPerson)} VNĐ/người</p>
                    <p><strong><i class="fa-solid fa-star" style="width: 20px;"></i></strong> ${data.rating} / 5 sao</p>
                    <p><strong><i class="fa-solid fa-note-sticky" style="width: 20px;"></i></strong> ${data.notes || "..."}</p>
                    <div class="card-actions"></div>
                `;

        const actionsDiv = item.querySelector('.card-actions');

        if (currentUser.uid === currentTrip.ownerId || currentUser.uid === data.createdBy.uid) {
            const editBtn = document.createElement("button");
            editBtn.innerHTML = `<i class="fa-solid fa-pen"></i> Sửa`;
            editBtn.className = "secondary";
            editBtn.onclick = () => showEditLocationModal(data);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Xóa`;
            deleteBtn.className = "secondary";
            deleteBtn.onclick = () => deleteHistoryItem(data.id);

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
        }

        const duplicateBtn = document.createElement("button");
        duplicateBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Sao chép`;
        duplicateBtn.className = "secondary";
        duplicateBtn.onclick = () => duplicateHistoryItem(data);

        actionsDiv.appendChild(duplicateBtn);
        historyList.appendChild(item);
    });
}

function showEditLocationModal(data) {
    editingLocationId = data.id;
    document.getElementById("edit-location-name").value = data.locationName;

    // SỬA ĐỔI: Dùng address
    document.getElementById("edit-location-position").value = data.address || data.position; // Input này giờ là "Địa chỉ"

    document.getElementById("edit-location-people").value = data.numPeople;

    const costInput = document.getElementById("edit-location-cost");
    costInput.value = formatter.format(data.cost);
    costInput.dataset.raw = data.cost;

    document.getElementById("edit-location-time").value = data.time;
    document.getElementById("edit-location-date").value = data.date;
    document.getElementById("edit-location-rating").value = data.rating;
    document.getElementById("edit-location-notes").value = data.notes;

    editLocationModal.style.display = "flex"; // Sửa thành flex
}

closeEditLocationModal.onclick = () => { editLocationModal.style.display = "none"; editingLocationId = null; }

document.getElementById("edit-location-cost").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\./g, '');
    if (isNaN(value) || value === '') {
        e.target.dataset.raw = ''; e.target.value = '';
    } else {
        let num = parseInt(value, 10);
        e.target.dataset.raw = num;
        e.target.value = formatter.format(num);
    }
});

editLocationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!editingLocationId || !currentTrip.id) return;

    const address = document.getElementById("edit-location-position").value;

    const locationData = {
        locationName: document.getElementById("edit-location-name").value,
        address: address,
        // position: (Cần thêm input riêng nếu muốn sửa, hiện tại giữ nguyên)
        numPeople: parseInt(document.getElementById("edit-location-people").value, 10),
        cost: parseInt(document.getElementById("edit-location-cost").dataset.raw || 0, 10),
        time: document.getElementById("edit-location-time").value,
        date: document.getElementById("edit-location-date").value,
        rating: parseInt(document.getElementById("edit-location-rating").value, 10),
        notes: document.getElementById("edit-location-notes").value,
    };

    try {
        const [day, month, year] = locationData.date.split('/');
        const [hours, minutes] = locationData.time.split(':');
        locationData.sortableTime = new Date(year, month - 1, day, hours, minutes);
    } catch (err) {
        console.warn("Invalid date/time for sorting");
    }

    showLoading("Đang cập nhật địa điểm...");
    try {
        const docRef = doc(db, "trips", currentTrip.id, "locations", editingLocationId);
        await updateDoc(docRef, locationData);
        hideLoading();
        editLocationModal.style.display = "none";
        editingLocationId = null;
    } catch (error) {
        hideLoading();
        console.error("Error updating location: ", error);
        alert("Lỗi khi cập nhật.");
    }
});

async function deleteHistoryItem(docId) {
    if (!confirm("Bạn có chắc muốn xóa mục này?")) return;

    showLoading("Đang xóa...");
    try {
        await deleteDoc(doc(db, "trips", currentTrip.id, "locations", docId));
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error("Error deleting location: ", error);
        alert("Lỗi khi xóa.");
    }
}

async function duplicateHistoryItem(data) {
    if (!confirm("Bạn có muốn nhân bản mục này?")) return;

    // Xóa ID cũ và cập nhật người tạo/thời gian
    const newData = { ...data }; // Tạo bản sao
    delete newData.id;

    newData.createdBy = {
        uid: currentUser.uid,
        name: currentUser.name || currentUser.displayName || currentUser.email
    };
    newData.createdAt = serverTimestamp();
    newData.sortableTime = new Date(); // Đặt thời gian là hiện tại

    showLoading("Đang sao chép...");
    try {
        const collectionRef = collection(db, "trips", currentTrip.id, "locations");
        await addDoc(collectionRef, newData);
        hideLoading();

        // Chuyển sang tab lịch sử và cuộn xuống
        showTripTab('history-tab');
        setTimeout(() => {
            const mainContent = singleTripView.querySelector('.main-content');
            if (mainContent) mainContent.scrollTop = 0;
        }, 100);

    } catch (error) {
        hideLoading();
        console.error("Error duplicating location: ", error);
        alert("Lỗi khi sao chép.");
    }
}

searchHistoryInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = localHistoryCache.filter(item =>
        item.locationName.toLowerCase().includes(searchTerm) ||
        (item.address && item.address.toLowerCase().includes(searchTerm))
    );
    renderHistory(filteredData);
});

sortHistorySelect.addEventListener("change", (e) => {
    const sortBy = e.target.value;
    let sortedData = [...localHistoryCache];

    switch (sortBy) {
        case "time":
            sortedData.sort((a, b) => {
                const timeA = a.sortableTime ? a.sortableTime.seconds : 0;
                const timeB = b.sortableTime ? b.sortableTime.seconds : 0;
                return timeB - timeA;
            });
            break;
        case "name":
            sortedData.sort((a, b) => a.locationName.localeCompare(b.locationName));
            break;
        case "cost":
            sortedData.sort((a, b) => b.cost - a.cost);
            break;
    }
    renderHistory(sortedData);
});

function getHistoryDataAsString() {
    let text = `LỊCH SỬ CHUYẾN ĐI: ${currentTrip.name}\n\n`;
    localHistoryCache.forEach(data => {
        text += `----------------------------------------\n`;
        text += `Tên: ${data.locationName}\n`;
        text += `Địa chỉ: ${data.address || ""}\n`;
        text += `Người đăng: ${data.createdBy.name}\n`;
        text += `Thời gian: ${data.time} - ${data.date}\n`;
        text += `Số người: ${data.numPeople}\n`;
        text += `Tổng tiền: ${formatter.format(data.cost)} VNĐ\n`;
        text += `Đánh giá: ${data.rating} sao\n`;
        text += `Ghi chú: ${data.notes || ""}\n`;
        text += `\n`;
    });
    return text;
}

exportTxtButton.addEventListener("click", () => {
    const text = getHistoryDataAsString();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `ShareGo_${currentTrip.name}.txt`);
});

exportJsonButton.addEventListener("click", () => {
    // Chuyển đổi Timestamp (nếu có) sang string cho dễ đọc
    const dataToExport = localHistoryCache.map(item => {
        const newItem = { ...item };
        if (newItem.createdAt && newItem.createdAt.seconds) {
            newItem.createdAt = new Date(newItem.createdAt.seconds * 1000).toISOString();
        }
        if (newItem.sortableTime && newItem.sortableTime.seconds) {
            newItem.sortableTime = new Date(newItem.sortableTime.seconds * 1000).toISOString();
        }
        return newItem;
    });

    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    saveAs(blob, `ShareGo_${currentTrip.name}.json`);
});

copyHistoryButton.addEventListener("click", () => {
    const text = getHistoryDataAsString();
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Đã sao chép vào clipboard!");
        }, (err) => {
            alert("Lỗi khi sao chép.");
        });
    } else {
        alert("Trình duyệt không hỗ trợ sao chép.");
    }
});

exportXlsxButton.addEventListener("click", () => {
    const dataToExport = localHistoryCache.map(data => ({
        "Tên địa điểm": data.locationName,
        "Địa chỉ": data.address,
        "Người đăng": data.createdBy.name,
        "Giờ": data.time,
        "Ngày": data.date,
        "Số người": data.numPeople,
        "Tổng tiền": data.cost,
        "Đánh giá (sao)": data.rating,
        "Ghi chú": data.notes,
        "Vị trí (lat,lng)": data.position
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lịch sử");

    XLSX.writeFile(wb, `ShareGo_${currentTrip.name}.xlsx`);
});

// =================================================================
// TAB 3: TIN NHẮN (CHAT)
// =================================================================

function loadChat(tripId) {
    const q = query(collection(db, "trips", tripId, "chat"), orderBy("timestamp", "asc"), where("timestamp", "!=", null));

    chatUnsubscribe = onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = "";
        snapshot.forEach(doc => {
            renderMessage(doc.data(), doc.id);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text === "" || !currentUser || !currentTrip.id) return;

    chatInput.value = "";

    let messageType = 'text';
    let content = text;

    if (text.startsWith("@code ")) {
        messageType = 'code';
        content = text.substring(6);
    } else if (text.startsWith("@c ")) {
        messageType = 'copyable';
        content = text.substring(3);
    }

    try {
        await addDoc(collection(db, "trips", currentTrip.id, "chat"), {
            sender: {
                uid: currentUser.uid,
                name: currentUser.name || currentUser.displayName || currentUser.email,
                facebookId: currentUser.facebookId || null
            },
            content: content,
            type: messageType,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error sending message: ", error);
        chatInput.value = text;
    }
});

function renderMessage(data, docId) {
    const msgDiv = document.createElement("div");

    // BỔ SUNG: Kiểm tra tin nhắn của tôi
    if (data.sender.uid === currentUser.uid) {
        msgDiv.className = "my-message";
    }

    const fbId = data.sender.facebookId;
    const name = data.sender.name;
    const avatarUrl = fbId
        ? `https://graph.facebook.com/${fbId}/picture?width=9999&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`
        : '';

    const avatarHtml = fbId
        ? `<img src="${avatarUrl}" class="chat-avatar">`
        : `<span class="chat-avatar" style="display: inline-flex; align-items: center; justify-content: center; background-color: var(--input-bg); color: var(--text-color); font-weight: 600;">${name.charAt(0).toUpperCase()}</span>`;

    msgDiv.innerHTML = avatarHtml;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const nameStrong = document.createElement("strong");
    nameStrong.textContent = `${data.sender.name}`;
    contentDiv.appendChild(nameStrong);

    switch (data.type) {
        case 'code':
            const p = document.createElement("p");
            p.innerText = "[Xem code HTML bên dưới]";
            contentDiv.appendChild(p);

            const iframe = document.createElement("iframe");
            iframe.style.width = "100%";
            iframe.style.height = "100px";
            iframe.style.border = "1px dashed #ccc";
            iframe.sandbox = "allow-scripts allow-same-origin";
            iframe.srcdoc = data.content;
            contentDiv.appendChild(iframe);
            break;

        case 'copyable':
            const span = document.createElement("span");
            span.textContent = data.content;
            contentDiv.appendChild(span);

            const copyBtn = document.createElement("button");
            copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i>`;
            copyBtn.className = "small secondary";
            copyBtn.style.marginTop = "8px";
            copyBtn.onclick = () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(data.content)
                        .then(() => alert("Đã sao chép!"))
                        .catch(() => alert("Lỗi sao chép!"));
                }
            };
            contentDiv.appendChild(copyBtn);
            break;

        case 'text':
        default:
            const textNode = document.createElement("p");
            textNode.textContent = data.content;
            textNode.style.marginBottom = "0"; // Ghi đè p style
            contentDiv.appendChild(textNode);
            break;
    }

    if (currentUser.uid === data.sender.uid || currentUser.uid === currentTrip.ownerId) {
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        deleteBtn.className = "small secondary";
        deleteBtn.style.marginTop = "8px";
        deleteBtn.onclick = () => deleteChatMessage(docId);
        contentDiv.appendChild(deleteBtn);
    }

    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
}

async function deleteChatMessage(docId) {
    if (!confirm("Bạn có chắc muốn xóa tin nhắn này?")) return;
    try {
        await deleteDoc(doc(db, "trips", currentTrip.id, "chat", docId));
    } catch (error) {
        console.error("Error deleting message:", error);
        alert("Lỗi khi xóa tin nhắn.");
    }
}

// =================================================================
// TAB 4: THỐNG KÊ
// =================================================================

function calculateAndShowStats(dataArray) {
    if (dataArray.length === 0) {
        statsContent.innerHTML = "<p>Chưa có dữ liệu để thống kê.</p>";
        return;
    }

    const totalLocations = dataArray.length;
    const totalCost = dataArray.reduce((sum, item) => sum + item.cost, 0);

    let totalCostPerPersonSum = 0;
    let itemsWithCost = 0;
    let totalRating = 0;
    let itemsWithRating = 0;

    dataArray.forEach(item => {
        if (item.cost > 0 && item.numPeople > 0) {
            totalCostPerPersonSum += (item.cost / item.numPeople);
            itemsWithCost++;
        }
        if (item.rating > 0) {
            totalRating += item.rating;
            itemsWithRating++;
        }
    });

    const avgCostPerPerson = itemsWithCost > 0 ? (totalCostPerPersonSum / itemsWithCost) : 0;
    const avgRating = itemsWithRating > 0 ? (totalRating / itemsWithRating) : 0;

    // BỔ SUNG: Dùng icon
    statsContent.innerHTML = `
                <h3>Thống kê: ${currentTrip.name}</h3>
                <p><strong><i class="fa-solid fa-map-signs" style="width: 20px;"></i> Tổng địa điểm:</strong> ${totalLocations}</p>
                <p><strong><i class="fa-solid fa-wallet" style="width: 20px;"></i> Tổng chi phí:</strong> ${formatter.format(totalCost)} VNĐ</p>
                <p><strong><i class="fa-solid fa-divide" style="width: 20px;"></i> TB chi phí/lần:</strong> ${formatter.format(avgCostPerPerson)} VNĐ/người</p>
                <p><strong><i class="fa-solid fa-star-half-alt" style="width: 20px;"></i> Đánh giá TB:</strong> ${avgRating.toFixed(1)} / 5 sao (${itemsWithRating} lượt)</p>
            `;
}

// =================================================================
// KHỞI CHẠY (Gắn listener)
// =================================================================

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const tabId = button.dataset.tab;
        showTripTab(tabId);
    });
});

// BỔ SUNG: Hiển thị modal bằng flex
[editTripModal, editLocationModal, accountModal].forEach(modal => {
    modal.style.display = 'none'; // Đảm bảo tất cả modal đều ẩn
});
