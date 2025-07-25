
// The entire JavaScript content provided in the prompt goes here.
// It does not need to be modified as it only manipulates the DOM.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc, Timestamp, setDoc, getDoc, updateDoc, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDmoz4VMGwlLz5lsrYiT6GQZHJlmkN5igo",
    authDomain: "salon-booking-39f42.firebaseapp.com",
    projectId: "salon-booking-39f42",
    storageBucket: "salon-booking-39f42.firebasestorage.app",
    messagingSenderId: "499019851171",
    appId: "1:499019851171:web:9a4731d7d2c5faf1182616",
    measurementId: "G-ZRLC3JQMLZ"
};
const appId = 'default-salon-app-v2';

const VIETNAM_PHONE_REGEX = /^(?:(?:\+84|0084)|0)[235789][0-9]{1,2}[0-9]{7}$/;

let db, auth, isAdmin = false;
let appointmentsColRef, quickBookingsColRef, configDocRef, consultedBookingsColRef;
let salonConfig = {};
let appointmentsListener = null, quickBookingsListener = null, consultedBookingsListener = null;
const ADMIN_UID_FALLBACK = "E9hxk3SkfwgdJRCzapOue4unfRf2";

// DOM Elements
const loginModal = document.getElementById('loginModal');
const showLoginModalButton = document.getElementById('showLoginModalButton');
const closeLoginModalButton = document.getElementById('closeLoginModalButton');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutButton = document.getElementById('logoutButton');
const adminPanel = document.getElementById('adminPanel');
const bookingForm = document.getElementById('bookingForm');
const quickBookingForm = document.getElementById('quickBookingForm');
const adminSettingsForm = document.getElementById('adminSettingsForm');
const bookingDateInput = document.getElementById('bookingDate');
const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const adminAppointmentsSection = document.getElementById('adminAppointmentsSection');
const appointmentsList = document.getElementById('appointmentsList');
const tabBooking = document.getElementById('tab-booking');
const tabMyAppointments = document.getElementById('tab-my-appointments');
const tabQuickBooking = document.getElementById('tab-quick-booking');
const viewBooking = document.getElementById('view-booking');
const viewMyAppointments = document.getElementById('view-my-appointments');
const viewQuickBooking = document.getElementById('view-quick-booking');
const myAppointmentsForm = document.getElementById('myAppointmentsForm');
const myAppointmentsList = document.getElementById('myAppointmentsList');
const exportCsvButton = document.getElementById('exportCsvButton');
const deleteAllButton = document.getElementById('deleteAllButton');
const consultedBookingsList = document.getElementById('consultedBookingsList');
const serviceOptionsContainer = document.getElementById('serviceOptionsContainer');
const contactMethodToggle = document.getElementById('contactMethodToggle');
const privacyPolicyModal = document.getElementById('privacyPolicyModal');
const privacyPolicyLink = document.getElementById('privacyPolicyLink');
const closePrivacyModalButton = document.getElementById('closePrivacyModalButton');
const acceptPrivacyButton = document.getElementById('acceptPrivacyButton');


async function getAntiSpamData() {
    const data = {
        userAgent: navigator.userAgent,
        browser: 'Unknown',
        device: 'Unknown',
        ip: null
    };

    const ua = data.userAgent.toLowerCase();
    if (ua.includes('firefox')) data.browser = 'Firefox';
    else if (ua.includes('chrome')) data.browser = 'Chrome';
    else if (ua.includes('safari')) data.browser = 'Safari';
    else if (ua.includes('edge')) data.browser = 'Edge';
    else if (ua.includes('msie') || ua.includes('trident')) data.browser = 'Internet Explorer';

    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) data.device = 'Mobile';
    else if (ua.includes('tablet') || ua.includes('ipad')) data.device = 'Tablet';
    else data.device = 'Desktop';

    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (response.ok) {
            const ipData = await response.json();
            data.ip = ipData.ip;
        }
    } catch (error) {
        console.warn("Could not fetch IP address for anti-spam.", error);
    }

    return data;
}


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        const basePath = `/artifacts/${appId}/public/data`;
        appointmentsColRef = collection(db, `${basePath}/appointments`);
        quickBookingsColRef = collection(db, `${basePath}/quickBookings`);
        consultedBookingsColRef = collection(db, `${basePath}/consultedBookings`);
        configDocRef = doc(db, `${basePath}/config/salonSettings`);
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        bookingDateInput.value = today.toISOString().slice(0, 10);
        bookingDateInput.min = today.toISOString().slice(0, 10);
        onAuthStateChanged(auth, handleAuthStateChange);
        setupEventListeners();
        feather.replace();
    } catch (error) {
        console.error("Initialization failed:", error);
        Swal.fire('Lỗi Khởi Tạo', 'Không thể tải ứng dụng. Vui lòng thử lại.', 'error');
    }
});

function setupEventListeners() {
    showLoginModalButton.addEventListener('click', () => { loginModal.classList.remove('hidden'); });
    closeLoginModalButton.addEventListener('click', () => { loginModal.classList.add('hidden'); });
    loginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    bookingForm.addEventListener('submit', handleBookingSubmit);
    quickBookingForm.addEventListener('submit', handleQuickBookingSubmit);
    adminSettingsForm.addEventListener('submit', handleAdminSettingsSave);
    bookingDateInput.addEventListener('change', () => {
        document.getElementById('selectedTime').value = '';
        fetchAppointmentsForDate(bookingDateInput.value);
    });
    tabBooking.addEventListener('click', () => switchTab('booking'));
    tabMyAppointments.addEventListener('click', () => switchTab('my-appointments'));
    tabQuickBooking.addEventListener('click', () => switchTab('quick-booking'));
    myAppointmentsForm.addEventListener('submit', handleMyAppointmentsLookup);
    exportCsvButton.addEventListener('click', exportDataToCSV);
    deleteAllButton.addEventListener('click', deleteAllData);
    serviceOptionsContainer.addEventListener('click', handleServiceSelection);

    document.getElementById('phoneNumber').addEventListener('input', () => document.getElementById('phoneNumberError').classList.add('hidden'));
    document.getElementById('myAppointmentsPhone').addEventListener('input', () => document.getElementById('myAppointmentsPhoneError').classList.add('hidden'));

    contactMethodToggle.addEventListener('click', handleContactMethodChange);
    document.getElementById('quickCustomerName').addEventListener('input', () => document.getElementById('quickCustomerNameError').classList.add('hidden'));
    document.getElementById('quickContactInfo').addEventListener('input', () => document.getElementById('quickContactInfoError').classList.add('hidden'));

    privacyPolicyLink.addEventListener('click', (e) => {
        e.preventDefault();
        privacyPolicyModal.classList.remove('hidden');
    });
    const closePrivacyModal = () => privacyPolicyModal.classList.add('hidden');
    closePrivacyModalButton.addEventListener('click', closePrivacyModal);
    acceptPrivacyButton.addEventListener('click', closePrivacyModal);
}

function handleContactMethodChange(e) {
    const button = e.target.closest('.contact-method-btn');
    if (!button) return;

    const method = button.dataset.method;
    document.getElementById('selectedContactMethod').value = method;

    contactMethodToggle.querySelectorAll('.contact-method-btn').forEach(btn => btn.classList.remove('active-method'));
    button.classList.add('active-method');

    const contactInfoInput = document.getElementById('quickContactInfo');
    const contactIcon = document.getElementById('contactIcon');
    const placeholders = {
        phone: 'Nhập số điện thoại',
        facebook: 'Nhập link hoặc tên người dùng Facebook',
        zalo: 'Nhập SĐT hoặc link Zalo'
    };
    const icons = { phone: 'phone', facebook: 'facebook', zalo: 'message-circle' };
    const types = { phone: 'tel', facebook: 'text', zalo: 'text' };

    contactInfoInput.placeholder = placeholders[method];
    contactInfoInput.type = types[method];
    contactInfoInput.value = '';
    contactIcon.setAttribute('data-feather', icons[method]);
    feather.replace();

    document.getElementById('quickContactInfoError').classList.add('hidden');
}

function handleServiceSelection(e) {
    const clickedButton = e.target.closest('.service-option');
    if (!clickedButton) return;

    serviceOptionsContainer.querySelectorAll('.service-selected').forEach(el => el.classList.remove('service-selected'));
    clickedButton.classList.add('service-selected');
    document.getElementById('selectedService').value = clickedButton.dataset.service;
}

function maskInfo(value, type) {
    if (!value) return '';
    if (type === 'name') {
        const parts = value.trim().split(' ');
        if (parts.length > 1) { const lastName = parts[parts.length - 1]; return `${parts[0]}... ${lastName}`; }
        return `${value.charAt(0)}${'*'.repeat(Math.max(0, value.length - 1))}`;
    }
    if (type === 'phone' && value.length > 6) return `${value.substring(0, 3)}****${value.substring(value.length - 3)}`;
    return value;
}

function showModernSuccessNotification(apt) {
    Swal.fire({
        title: 'Đặt Lịch Thành Công!',
        html: `
                    <div class="text-left p-4">
                        <p class="text-lg">Cảm ơn <strong>${apt.name}</strong>!</p>
                        <p>Lịch hẹn của bạn đã được ghi nhận và đang chờ xác nhận.</p>
                        <div class="mt-4 text-left bg-indigo-50 p-3 rounded-lg">
                            <p><strong>Dịch vụ:</strong> ${apt.service}</p>
                            <p><strong>Thời gian:</strong> ${apt.time} - ${apt.date}</p>
                            <p><strong>Mã đặt lịch:</strong> <span class="font-bold text-indigo-600">${apt.bookingId}</span></p>
                        </div>
                        <p class="text-sm text-slate-500 mt-3">Sử dụng SĐT của bạn để tra cứu trong mục "Lịch Hẹn Của Tôi".</p>
                    </div>`,
        icon: 'success',
        confirmButtonTåext: 'Tuyệt vời!',
        cancelButtonText: 'Sao chép mã',
        showCancelButton: true,
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            navigator.clipboard.writeText(apt.bookingId).then(() => {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã sao chép!', showConfirmButton: false, timer: 1500 });
            });
        }
    });
}

async function handleAuthStateChange(user) {
    try {
        const docSnap = await getDoc(configDocRef);
        if (docSnap.exists()) {
            salonConfig = docSnap.data();
        } else {
            salonConfig = { openingTime: "09:00", closingTime: "20:00", maxCapacity: 2, adminUID: ADMIN_UID_FALLBACK };
            if (user && user.uid === ADMIN_UID_FALLBACK) await setDoc(configDocRef, salonConfig);
        }
        if (user && !user.isAnonymous) {
            isAdmin = user.uid === salonConfig.adminUID || user.uid === ADMIN_UID_FALLBACK;
            if (!isAdmin) await handleLogout();
        } else if (user && user.isAnonymous) {
            isAdmin = false;
        } else {
            isAdmin = false; await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Auth state change error:", error);
        isAdmin = false;
    } finally {
        setupUIBasedOnAuth();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    loginError.classList.add('hidden');
    try {
        await signInWithEmailAndPassword(auth, loginForm.email.value, loginForm.password.value);
        loginModal.classList.add('hidden');
        loginForm.reset();
    } catch (error) {
        loginError.textContent = "Email hoặc mật khẩu không đúng.";
        loginError.classList.remove('hidden');
    }
}

async function handleLogout() {
    try { await signOut(auth); } catch (error) { console.error("Logout failed:", error); }
}

function setupUIBasedOnAuth() {
    if (isAdmin) {
        adminPanel.classList.remove('hidden');
        adminAppointmentsSection.classList.remove('hidden');
        showLoginModalButton.classList.add('hidden');
        if (salonConfig.openingTime) adminSettingsForm.openingTime.value = salonConfig.openingTime;
        if (salonConfig.closingTime) adminSettingsForm.closingTime.value = salonConfig.closingTime;
        if (salonConfig.maxCapacity) adminSettingsForm.maxCapacity.value = salonConfig.maxCapacity;
        listenForQuickBookings();
        listenForConsultedBookings();
    } else {
        adminPanel.classList.add('hidden');
        adminAppointmentsSection.classList.add('hidden');
        showLoginModalButton.classList.remove('hidden');
        if (quickBookingsListener) { quickBookingsListener(); quickBookingsListener = null; }
        if (consultedBookingsListener) { consultedBookingsListener(); consultedBookingsListener = null; }
    }
    fetchAppointmentsForDate(bookingDateInput.value);
    feather.replace();
}

function fetchAppointmentsForDate(date) {
    if (appointmentsListener) appointmentsListener();
    const q = query(appointmentsColRef, where("date", "==", date));
    appointmentsListener = onSnapshot(q, (snapshot) => {
        let appointmentsForDay = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTimeSlotsForBooking(appointmentsForDay);
        if (isAdmin) {
            renderAppointmentsList(appointmentsForDay);
        }
    });
}

function renderTimeSlotsForBooking(appointmentsForDay = []) {
    const html = getTimeSlotsHTML(appointmentsForDay);
    timeSlotsContainer.innerHTML = html || `<p class="timeslot-placeholder">Vui lòng chọn ngày để xem khung giờ.</p>`;
    timeSlotsContainer.querySelectorAll('.timeslot:not(.disabled)').forEach(slot => slot.addEventListener('click', handleTimeSlotClick));
}

function getTimeSlotsHTML(appointmentsForDay = []) {
    const { openingTime, closingTime, maxCapacity } = salonConfig;
    if (!openingTime || !closingTime || !maxCapacity) return `<p class="timeslot-error">Admin chưa cài đặt giờ hoạt động.</p>`;
    const selectedDateStr = bookingDateInput.value;
    const now = new Date();
    const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    let currentTime = new Date(`${selectedDateStr}T${openingTime}`);
    const closingDateTime = new Date(`${selectedDateStr}T${closingTime}`);
    let html = '';
    while (currentTime < closingDateTime) {
        const timeStr = currentTime.toTimeString().slice(0, 5);
        const bookingsAtTime = appointmentsForDay.filter(apt => apt.time === timeStr && (apt.status === 'pending' || apt.status === 'confirmed')).length;
        const isFull = bookingsAtTime >= maxCapacity;
        const isPast = selectedDateStr < todayStr || (selectedDateStr === todayStr && timeStr < now.toTimeString().slice(0, 5));
        const isDisabled = isFull || isPast;
        html += `<button type="button" data-time="${timeStr}" class="timeslot ${isDisabled ? 'disabled' : ''}" ${isDisabled ? 'disabled' : ''}>${isFull ? 'Hết chỗ' : timeStr}</button>`;
        currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    return html;
}

function handleTimeSlotClick(e) {
    document.querySelectorAll('.timeslot-selected').forEach(el => el.classList.remove('timeslot-selected'));
    e.currentTarget.classList.add('timeslot-selected');
    document.getElementById('selectedTime').value = e.currentTarget.dataset.time;
}

async function handleBookingSubmit(e) {
    e.preventDefault();

    // MODIFICATION: Check reCAPTCHA
    if (grecaptcha.getResponse().length === 0) {
        return Swal.fire('Xác thực thất bại', 'Vui lòng xác nhận bạn không phải là robot.', 'error');
    }

    const phone = bookingForm.phoneNumber.value.trim();

    if (!VIETNAM_PHONE_REGEX.test(phone)) {
        const errorElement = document.getElementById('phoneNumberError');
        errorElement.textContent = 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.';
        errorElement.classList.remove('hidden');
        return;
    }

    const selectedService = document.getElementById('selectedService').value;
    const selectedTime = document.getElementById('selectedTime').value;

    if (!selectedService) return Swal.fire('Thiếu thông tin', 'Vui lòng chọn một dịch vụ.', 'warning');
    if (!selectedTime) return Swal.fire('Thiếu thông tin', 'Vui lòng chọn một khung giờ còn trống.', 'warning');

    try {
        const q = query(appointmentsColRef, where("phone", "==", phone), where("status", "in", ["pending", "confirmed"]));
        if ((await getDocs(q)).size >= 2) return Swal.fire('Đã đạt giới hạn', 'Bạn đã có 2 lịch hẹn đang hoạt động.', 'error');
    } catch (error) { return Swal.fire('Lỗi', 'Không thể kiểm tra lịch hẹn hiện tại.', 'error'); }

    const spamData = await getAntiSpamData();

    const newAppointment = {
        name: bookingForm.customerName.value.trim(),
        phone,
        service: selectedService,
        date: bookingDateInput.value,
        time: selectedTime,
        createdAt: Timestamp.now(),
        bookingId: `S${Date.now().toString().slice(-6)}`,
        status: 'pending',
        spamCheck: spamData
    };

    try {
        await addDoc(appointmentsColRef, newAppointment);
        showModernSuccessNotification(newAppointment);
        bookingForm.reset();
        document.getElementById('selectedTime').value = '';
        document.getElementById('selectedService').value = '';
        document.querySelectorAll('.timeslot-selected').forEach(el => el.classList.remove('timeslot-selected'));
        document.querySelectorAll('.service-selected').forEach(el => el.classList.remove('service-selected'));
        grecaptcha.reset(); // MODIFICATION: Reset reCAPTCHA
    } catch (error) {
        Swal.fire('Thất Bại', 'Đã có lỗi xảy ra. Vui lòng thử lại.', 'error');
    }
}

async function handleQuickBookingSubmit(e) {
    e.preventDefault();

    // MODIFICATION: Check reCAPTCHA
    if (grecaptcha.getResponse(1).length === 0) { // Check the second widget
        return Swal.fire('Xác thực thất bại', 'Vui lòng xác nhận bạn không phải là robot.', 'error');
    }

    let isValid = true;
    const name = document.getElementById('quickCustomerName').value.trim();
    const contactMethod = document.getElementById('selectedContactMethod').value;
    const contactInfo = document.getElementById('quickContactInfo').value.trim();

    const nameError = document.getElementById('quickCustomerNameError');
    const infoError = document.getElementById('quickContactInfoError');

    if (!name) {
        nameError.textContent = 'Vui lòng nhập tên của bạn.';
        nameError.classList.remove('hidden');
        isValid = false;
    }

    if (!contactInfo) {
        infoError.textContent = 'Vui lòng nhập thông tin liên hệ.';
        infoError.classList.remove('hidden');
        isValid = false;
    } else {
        if (contactMethod === 'phone' && !VIETNAM_PHONE_REGEX.test(contactInfo)) {
            infoError.textContent = 'Số điện thoại không hợp lệ.';
            infoError.classList.remove('hidden');
            isValid = false;
        } else if (contactMethod === 'facebook' && !(contactInfo.includes('facebook.com') || contactInfo.includes('fb.com'))) {
            infoError.textContent = 'Link Facebook không hợp lệ. Cần chứa "facebook.com" hoặc "fb.com".';
            infoError.classList.remove('hidden');
            isValid = false;
        } else if (contactMethod === 'zalo' && !VIETNAM_PHONE_REGEX.test(contactInfo) && !contactInfo.includes('zalo.me')) {
            infoError.textContent = 'Link Zalo hoặc số điện thoại không hợp lệ.';
            infoError.classList.remove('hidden');
            isValid = false;
        }
    }

    if (!isValid) return;

    let processedContactInfo = contactInfo;
    if (contactMethod === 'facebook' || (contactMethod === 'zalo' && contactInfo.includes('zalo.me'))) {
        if (!/^(https?:\/\/)/i.test(processedContactInfo)) {
            processedContactInfo = `https://${processedContactInfo}`;
        }
    }

    const spamData = await getAntiSpamData();

    try {
        const newQuickBooking = {
            name: name,
            contactMethod: contactMethod,
            contactInfo: processedContactInfo,
            createdAt: Timestamp.now(),
            spamCheck: spamData
        };
        await addDoc(quickBookingsColRef, newQuickBooking);
        Swal.fire('Đã Gửi Yêu Cầu', 'Cảm ơn bạn! Tư vấn viên sẽ liên hệ với bạn sớm nhất.', 'success');
        quickBookingForm.reset();
        handleContactMethodChange({ target: contactMethodToggle.querySelector('[data-method="phone"]') });
        grecaptcha.reset(1); // MODIFICATION: Reset the second reCAPTCHA widget
    } catch (error) {
        console.error("Quick booking failed:", error);
        Swal.fire('Thất Bại', 'Không thể gửi yêu cầu. Vui lòng thử lại.', 'error');
    }
}


async function handleAdminSettingsSave(e) {
    e.preventDefault();
    const newConfig = {
        openingTime: adminSettingsForm.openingTime.value, closingTime: adminSettingsForm.closingTime.value,
        maxCapacity: parseInt(adminSettingsForm.maxCapacity.value, 10), adminUID: auth.currentUser.uid
    };
    try {
        await setDoc(configDocRef, newConfig);
        salonConfig = newConfig;
        fetchAppointmentsForDate(bookingDateInput.value);
        Swal.fire('Đã Lưu', 'Cài đặt salon đã được cập nhật.', 'success');
    } catch (error) { Swal.fire('Lỗi', 'Không thể lưu cài đặt.', 'error'); }
}

async function handleMyAppointmentsLookup(e) {
    e.preventDefault();
    const phone = document.getElementById('myAppointmentsPhone').value.trim();
    if (!phone) return;

    if (!VIETNAM_PHONE_REGEX.test(phone)) {
        const errorElement = document.getElementById('myAppointmentsPhoneError');
        errorElement.textContent = 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.';
        errorElement.classList.remove('hidden');
        return;
    }

    myAppointmentsList.innerHTML = `<p class="text-center text-gray-500">Đang tìm kiếm...</p>`;
    try {
        const q = query(appointmentsColRef, where("phone", "==", phone), where("status", "in", ["pending", "confirmed", "rejected"]));
        const snapshot = await getDocs(q);
        const userAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        userAppointments.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        renderMyAppointments(userAppointments);
    } catch (error) {
        console.error("Lookup failed:", error);
        myAppointmentsList.innerHTML = `<p class="text-center text-red-500">Đã có lỗi xảy ra khi tra cứu.</p>`;
    }
}

function renderMyAppointments(appointments) {
    if (appointments.length === 0) {
        myAppointmentsList.innerHTML = `<p class="text-center text-gray-500 p-4">Không tìm thấy lịch hẹn nào với số điện thoại này.</p>`;
        return;
    }
    const statusText = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', rejected: 'Đã từ chối' };
    myAppointmentsList.innerHTML = appointments.map(apt => {
        const canAct = apt.status === 'pending';
        return `
                <div class="appointment-card-user">
                    <div class="apt-view-mode">
                        <div class="appointment-card-header">
                            <p class="appointment-card-name">${maskInfo(apt.name, 'name')}</p>
                            <span class="status-badge status-${apt.status}">${statusText[apt.status] || apt.status}</span>
                        </div>
                        <p class="appointment-card-time">${apt.time} - ${apt.date}</p>
                        <p class="appointment-card-service">${apt.service}</p>
                        <p class="appointment-card-phone">SĐT: ${maskInfo(apt.phone, 'phone')}</p>
                        <div class="appointment-card-actions">
                           <button data-apt='${JSON.stringify(apt)}' class="button-card-action button-edit" ${!canAct ? 'disabled' : ''}>Sửa lịch</button>
                           <button data-id="${apt.id}" class="button-card-action button-cancel" ${!canAct ? 'disabled' : ''}>Hủy lịch</button>
                        </div>
                    </div>
                    <div class="apt-edit-mode hidden form-spacing"></div>
                </div>`;
    }).join('');

    myAppointmentsList.querySelectorAll('.button-edit:not(:disabled)').forEach(btn => btn.addEventListener('click', handleEditAppointmentClick));
    myAppointmentsList.querySelectorAll('.button-cancel:not(:disabled)').forEach(btn => btn.addEventListener('click', handleCancelAppointmentClick));
}

async function handleEditAppointmentClick(e) {
    const aptData = JSON.parse(e.currentTarget.dataset.apt);
    const card = e.target.closest('.appointment-card-user');
    const viewMode = card.querySelector('.apt-view-mode');
    const editMode = card.querySelector('.apt-edit-mode');
    const { value: phone } = await Swal.fire({
        title: 'Xác nhận chủ nhân lịch hẹn', input: 'tel',
        inputLabel: 'Vui lòng nhập SĐT để chỉnh sửa.', showCancelButton: true,
        inputValidator: (value) => !value && 'Bạn cần nhập số điện thoại!'
    });
    if (phone && phone === aptData.phone) {
        editMode.innerHTML = `
                    <div><label class="form-label">Tên khách hàng</label><input type="text" value="${aptData.name}" class="edit-name-input form-input"></div>
                    <div>
                        <label class="form-label">Số điện thoại</label>
                        <input type="tel" value="${aptData.phone}" class="edit-phone-input form-input">
                        <p class="edit-phone-error form-error hidden"></p>
                    </div>
                    <div class="appointment-card-actions">
                        <button data-id="${aptData.id}" class="save-changes-btn button-card-action button-success-inline">Lưu thay đổi</button>
                        <button type="button" class="cancel-edit-btn button-card-action button-secondary-inline">Hủy</button>
                    </div>`;
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');

        const editPhoneInput = editMode.querySelector('.edit-phone-input');
        const editPhoneError = editMode.querySelector('.edit-phone-error');
        editPhoneInput.addEventListener('input', () => editPhoneError.classList.add('hidden'));

        editMode.querySelector('.save-changes-btn').addEventListener('click', async () => {
            const newName = editMode.querySelector('.edit-name-input').value;
            const newPhone = editMode.querySelector('.edit-phone-input').value.trim();

            if (!VIETNAM_PHONE_REGEX.test(newPhone)) {
                editPhoneError.textContent = 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.';
                editPhoneError.classList.remove('hidden');
                return;
            }

            const appointmentRef = doc(db, appointmentsColRef.path, aptData.id);
            await updateDoc(appointmentRef, { name: newName, phone: newPhone });
            Swal.fire('Thành công!', 'Đã cập nhật lịch hẹn.', 'success');
            myAppointmentsForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        });
        editMode.querySelector('.cancel-edit-btn').addEventListener('click', () => {
            editMode.classList.add('hidden'); viewMode.classList.remove('hidden');
        });
    } else if (phone) {
        Swal.fire('Lỗi!', 'Số điện thoại không khớp.', 'error');
    }
}

async function handleCancelAppointmentClick(e) {
    const aptId = e.currentTarget.dataset.id;
    const { isConfirmed } = await Swal.fire({
        title: 'Bạn có chắc chắn?', text: "Bạn sẽ không thể hoàn tác hành động này!",
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6', confirmButtonText: 'Vâng, hủy lịch!', cancelButtonText: 'Không'
    });
    if (isConfirmed) {
        try {
            await updateDoc(doc(db, appointmentsColRef.path, aptId), { status: 'cancelled' });
            Swal.fire('Đã Hủy!', 'Lịch hẹn của bạn đã được hủy.', 'success');
            myAppointmentsForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        } catch { Swal.fire('Lỗi!', 'Không thể hủy lịch hẹn. Vui lòng thử lại.', 'error'); }
    }
}

function renderAppointmentsList(appointmentsForDay) {
    if (!isAdmin) return;
    const statusMap = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', rejected: 'Đã từ chối', cancelled: 'Đã hủy' };
    const classMap = { pending: 'status-pending', confirmed: 'status-confirmed', rejected: 'status-rejected', cancelled: 'status-cancelled' };
    appointmentsList.innerHTML = appointmentsForDay.map(apt => {
        const spamTooltip = apt.spamCheck ? `IP: ${apt.spamCheck.ip || 'N/A'}\nThiết bị: ${apt.spamCheck.device}\nTrình duyệt: ${apt.spamCheck.browser}` : 'Không có dữ liệu spam.';
        return `
                <div class="admin-appointment-card">
                    <div class="admin-appointment-info">
                        <div>
                            <p class="admin-appointment-time-name">${apt.time} - ${apt.name}</p>
                            <p class="admin-appointment-details">${apt.service} | ${apt.phone}</p>
                            <p class="admin-appointment-id">Mã: ${apt.bookingId}</p>
                        </div>
                        <div class="admin-appointment-status-group">
                             <i data-feather="shield" class="icon-shield" title="${spamTooltip}"></i>
                             <span class="status-badge ${classMap[apt.status] || ''}">${statusMap[apt.status] || apt.status}</span>
                        </div>
                    </div>
                    ${apt.status === 'pending' ? `<div class="admin-action-bar">
                        <button class="admin-action-btn admin-confirm-btn" data-action="confirm" data-id="${apt.id}">Xác nhận</button>
                        <button class="admin-action-btn admin-reject-btn" data-action="reject" data-id="${apt.id}">Từ chối</button>
                    </div>` : ''}
                     ${apt.status === 'rejected' && apt.rejectionReason ? `<p class="admin-rejection-reason">Lý do: ${apt.rejectionReason}</p>` : ''}
                </div>`
    }).join('') || `<p class="placeholder-text">Không có lịch hẹn nào.</p>`;
    feather.replace();
}

async function handleAdminAction(e) {
    const { action, id } = e.currentTarget.dataset;
    const appointmentRef = doc(db, appointmentsColRef.path, id);
    if (action === 'confirm') {
        if (confirm('Xác nhận lịch hẹn này?')) await updateDoc(appointmentRef, { status: 'confirmed' });
    } else if (action === 'reject') {
        const reason = prompt('Lý do từ chối:');
        if (reason) await updateDoc(appointmentRef, { status: 'rejected', rejectionReason: reason });
    }
}

function listenForQuickBookings() {
    if (quickBookingsListener) quickBookingsListener();
    quickBookingsListener = onSnapshot(query(quickBookingsColRef), (snapshot) => {
        const requests = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        document.getElementById('quickBookingsList').innerHTML = requests.map(req => {
            const icons = { phone: 'phone', facebook: 'facebook', zalo: 'message-circle' };
            let contactDisplay;
            if (req.contactMethod === 'phone') {
                contactDisplay = `<span class="contact-text">${req.contactInfo}</span>`;
            } else {
                contactDisplay = `<a href="${req.contactInfo}" target="_blank" class="contact-link" title="${req.contactInfo}">${req.contactInfo}</a>`;
            }

            const spamTooltip = req.spamCheck ? `IP: ${req.spamCheck.ip || 'N/A'}\nThiết bị: ${req.spamCheck.device}\nTrình duyệt: ${req.spamCheck.browser}` : 'Không có dữ liệu spam.';

            return `
                    <div class="quick-booking-card">
                        <div>
                            <p class="quick-booking-name">${req.name}</p>
                            <div class="quick-booking-contact">
                                <i data-feather="${icons[req.contactMethod] || 'help-circle'}" class="icon-contact-method"></i>
                                ${contactDisplay}
                            </div>
                        </div>
                        <div class="quick-booking-actions">
                            <i data-feather="shield" class="icon-shield" title="${spamTooltip}"></i>
                            <button class="consulted-btn" data-id="${req.id}" title="Đánh dấu đã tư vấn"><i data-feather="check-circle" class="icon-check"></i></button>
                        </div>
                    </div>`
        }).join('') || `<p class="placeholder-text">Chưa có yêu cầu nào.</p>`;

        document.querySelectorAll('.consulted-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const docId = btn.dataset.id;
                const docRef = doc(db, quickBookingsColRef.path, docId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    await setDoc(doc(consultedBookingsColRef), { ...data, consultedAt: Timestamp.now() });
                    await deleteDoc(docRef);
                }
            });
        });
        feather.replace();
    });
}

function listenForConsultedBookings() {
    if (consultedBookingsListener) consultedBookingsListener();
    consultedBookingsListener = onSnapshot(query(consultedBookingsColRef), (snapshot) => {
        const requests = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.consultedAt.toMillis() - a.createdAt.toMillis());
        consultedBookingsList.innerHTML = requests.map(req => {
            const icons = { phone: 'phone', facebook: 'facebook', zalo: 'message-circle' };
            let contactDisplay;
            if (req.contactMethod === 'phone') {
                contactDisplay = `<span class="contact-text">${req.contactInfo}</span>`;
            } else {
                contactDisplay = `<a href="${req.contactInfo}" target="_blank" class="contact-link" title="${req.contactInfo}">${req.contactInfo}</a>`;
            }
            const spamTooltip = req.spamCheck ? `IP: ${req.spamCheck.ip || 'N/A'}\nThiết bị: ${req.spamCheck.device}\nTrình duyệt: ${req.spamCheck.browser}` : 'Không có dữ liệu spam.';

            return `
                    <div class="consulted-booking-card">
                        <div class="consulted-booking-header">
                            <p class="consulted-booking-name">${req.name}</p>
                            <i data-feather="shield" class="icon-shield-consulted" title="${spamTooltip}"></i>
                        </div>
                        <div class="quick-booking-contact">
                            <i data-feather="${icons[req.contactMethod] || 'help-circle'}" class="icon-contact-method"></i>
                            ${contactDisplay}
                        </div>
                        <p class="consulted-time">Đã tư vấn lúc ${new Date(req.consultedAt.toDate()).toLocaleString('vi-VN')}</p>
                    </div>`
        }).join('') || `<p class="placeholder-text">Chưa có dữ liệu.</p>`;
        feather.replace();
    });
}

async function exportDataToCSV() {
    if (!confirm("Bạn có muốn xuất toàn bộ dữ liệu lịch hẹn ra file CSV không?")) return;
    try {
        const snapshot = await getDocs(query(appointmentsColRef));
        if (snapshot.empty) return Swal.fire('Không có dữ liệu', 'Chưa có lịch hẹn nào để xuất.', 'info');
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "ID,Booking ID,Tên,SĐT,Dịch vụ,Ngày,Giờ,Trạng thái,Lý do từ chối\r\n";
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = [`"${doc.id}"`, `"${data.bookingId || ''}"`, `"${data.name || ''}"`, `"${data.phone || ''}"`, `"${data.service || ''}"`, `"${data.date || ''}"`, `"${data.time || ''}"`, `"${data.status || ''}"`, `"${data.rejectionReason || ''}"`].join(',');
            csvContent += row + "\r\n";
        });
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `danh_sach_lich_hen_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error exporting data: ", error);
        Swal.fire('Lỗi', 'Không thể xuất dữ liệu.', 'error');
    }
}

async function deleteAllData() {
    const { isConfirmed } = await Swal.fire({
        title: 'BẠN CÓ CHẮC KHÔNG?', html: "Hành động này sẽ **XÓA TOÀN BỘ** dữ liệu lịch hẹn. <br>Hành động này <strong>KHÔNG THỂ</strong> hoàn tác.",
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
        confirmButtonText: 'Vâng, tôi hiểu và muốn xóa!', cancelButtonText: 'Hủy'
    });
    if (!isConfirmed) return;
    const { value: confirmationText } = await Swal.fire({
        title: 'Xác nhận lần cuối', input: 'text', inputLabel: 'Vui lòng gõ "DELETE" để xác nhận xóa.',
        showCancelButton: true,
        inputValidator: (value) => (value !== 'DELETE') && 'Bạn phải gõ đúng chữ "DELETE" để xác nhận!'
    });
    if (confirmationText === 'DELETE') {
        try {
            const snapshot = await getDocs(query(appointmentsColRef));
            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => { batch.delete(doc.ref); });
            await batch.commit();
            Swal.fire('Đã Xóa!', 'Toàn bộ dữ liệu lịch hẹn đã được xóa.', 'success');
        } catch (error) {
            console.error("Error deleting data: ", error);
            Swal.fire('Lỗi', 'Không thể xóa dữ liệu.', 'error');
        }
    }
}

function switchTab(tabName) {
    const tabs = { booking: tabBooking, 'my-appointments': tabMyAppointments, 'quick-booking': tabQuickBooking };
    const views = { booking: viewBooking, 'my-appointments': viewMyAppointments, 'quick-booking': viewQuickBooking };
    Object.values(tabs).forEach(t => t.classList.remove('tab-active'));
    Object.values(views).forEach(v => v.classList.add('hidden'));
    tabs[tabName].classList.add('tab-active');
    views[tabName].classList.remove('hidden');
}