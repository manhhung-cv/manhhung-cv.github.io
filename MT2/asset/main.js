// ==========================================
// 1. IMPORT FIREBASE SDK (FIRESTORE)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTnDNOzI-8JYFfrxtJclFxe7vY27PM6FU",
    authDomain: "salon-mt.firebaseapp.com",
    projectId: "salon-mt",
    storageBucket: "salon-mt.firebasestorage.app",
    messagingSenderId: "1086041756251",
    appId: "1:1086041756251:web:5f7c4cc7144cc59be8a57e",
    measurementId: "G-3BV9HNVP29"
};

const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);

// ==========================================
// 2. CẤU HÌNH TĨNH & BIẾN TOÀN CỤC
// ==========================================
const DEFAULT_CONFIG = {
    general: {
        name: "Mai Tây Hair Salon",
        slogan: "Premium Hair Studio",
        rating: "5.0",
        openHours: { status: 1, text: "Mở cửa từ 8h đến 20h", reason: "" },
        version: "v1.0.0"
    },
    contact: {
        phoneDisplay: "0909123456",
        phoneLink: "0909123456",
        zaloLink: "https://zalo.me/0909123456"
    },
    homeFeatures: {
        categories: [
            { icon: "fa-scissors", name: "Cắt" },
            { icon: "fa-fill-drip", name: "Nhuộm" },
            { icon: "fa-wind", name: "Uốn" },
            { icon: "fa-spa", name: "Phục hồi" }
        ]
    }
};

const API_URL = 'https://script.google.com/macros/s/AKfycby7YKcoWqaZ1a5Rf7abzThUDl_G7pPiHVuTdn8xyXdqgz8tE6ZYWutHLjI0-3-t1gsxFQ/exec';
let db = { branches: [], services: [], staff: [] };
let selection = { branch: null, service: null, staff: null, date: null, time: null };
let currentStep = 1;
let countdownInterval;
let appConfig = {}; // Chứa cấu hình đã gộp (Tĩnh + Động)
let currentSlide = 0;
let feedObserver;

// Xuất hàm ra global scope để dùng trực tiếp trong thẻ HTML (onclick, onchange...)
window.switchTab = switchTab;
window.switchBookingSubTab = switchBookingSubTab;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.selectBranch = selectBranch;
window.selectService = selectService;
window.selectStaff = selectStaff;
window.selectDate = selectDate;
window.jumpToToday = jumpToToday;
window.submitBooking = submitBooking;
window.lookupBooking = lookupBooking;
window.cancelBooking = cancelBooking;
window.rateStar = rateStar;
window.submitFeedback = submitFeedback;
window.toggleDescription = toggleDescription;
window.togglePlay = togglePlay;

// ==========================================
// 3. CÁC HÀM XỬ LÝ GIAO DIỆN CHÍNH
// ==========================================

// Hiệu ứng Header khi cuộn
const viewIntro = document.getElementById('view-intro');
if (viewIntro) {
    viewIntro.addEventListener('scroll', function () {
        const dockedHeader = document.getElementById('docked-header');
        if (this.scrollTop > 250) {
            dockedHeader.classList.remove('-translate-y-12', 'opacity-0', 'pointer-events-none');
            dockedHeader.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
        } else {
            dockedHeader.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
            dockedHeader.classList.add('-translate-y-12', 'opacity-0', 'pointer-events-none');
        }
    });
}

function startLoadingAnimation() { }

function finishLoadingAnimation() {
    const loadingDiv = document.getElementById('loading');
    const scissors = document.getElementById('scissorsContainer');
    const slashLine = document.getElementById('slashLine');
    if (!loadingDiv) return;
    scissors.classList.remove('is-normal-cutting');
    scissors.classList.add('is-preparing');
    setTimeout(() => {
        scissors.classList.remove('is-preparing');
        scissors.classList.add('is-snapping');
        slashLine.style.animation = 'slashEffect 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    }, 600);
    setTimeout(() => { loadingDiv.classList.add('page-split-active'); }, 700);
    setTimeout(() => { loadingDiv.style.display = 'none'; loadingDiv.remove(); }, 2000);
}

function renderHeroSlider() {
    const container = document.getElementById('heroSliderContainer');
    const images = appConfig.heroBlock.sliderImages;
    if (!images || images.length === 0) return;
    container.innerHTML = images.map((img, index) => `
            <img src="${img}" id="slide-${index}" alt="Salon Space"
                 class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'}">
        `).join('');

    if (images.length > 1) {
        setInterval(() => {
            document.getElementById(`slide-${currentSlide}`).classList.remove('opacity-100');
            document.getElementById(`slide-${currentSlide}`).classList.add('opacity-0');
            currentSlide = (currentSlide + 1) % images.length;
            document.getElementById(`slide-${currentSlide}`).classList.remove('opacity-0');
            document.getElementById(`slide-${currentSlide}`).classList.add('opacity-100');
        }, 5000);
    }
}

function applyConfig() {
    if (document.getElementById('config-salon-name')) document.getElementById('config-salon-name').innerText = appConfig.general.name;
    if (document.getElementById('config-salon-name-docked')) document.getElementById('config-salon-name-docked').innerText = appConfig.general.name;

    const oh = appConfig.general.openHours;
    const textEl = document.getElementById('config-open-hours');
    const dotEl = textEl?.previousElementSibling;
    if (textEl && dotEl) {
        textEl.innerText = oh.text;
        switch (oh.status) {
            case 1: dotEl.className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"; break;
            case 2: dotEl.className = "w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"; break;
            case 3: dotEl.className = "w-1.5 h-1.5 rounded-full bg-rose-500"; break;
        }
    }

    if (document.getElementById('config-phone-link')) document.getElementById('config-phone-link').href = "tel:" + appConfig.contact.phoneLink;
    if (document.getElementById('config-zalo-link')) document.getElementById('config-zalo-link').href = appConfig.contact.zaloLink;
    if (document.getElementById('config-version')) document.getElementById('config-version').innerText = appConfig.general.version;
}

function renderHomeFeatures() {
    const catContainer = document.getElementById('homeCategories');
    if (catContainer) {
        catContainer.innerHTML = appConfig.homeFeatures.categories.map(cat => `
                <div class="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" onclick="window.switchTab('booking')">
                    <div class="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-800 text-lg">
                        <i class="fa-solid ${cat.icon}"></i>
                    </div>
                    <span class="text-[10px] font-bold text-slate-700">${cat.name}</span>
                </div>
            `).join('');
    }
    const marqueeContainer = document.getElementById('homeMarquee');
    if (marqueeContainer) {
        marqueeContainer.innerHTML = appConfig.homeFeatures.marqueeTexts.map(m => `
                <span class="mx-4 ${m.isHighlight ? 'text-emerald-600 font-black' : 'text-slate-600'}">${m.text}</span>
            `).join('');
    }
}

function renderDynamicHero() {
    const container = document.getElementById('dynamicHeroBlock');
    clearInterval(countdownInterval);
    if (appConfig.heroBlock.isFlashSale) {
        const conf = appConfig.heroBlock.flashSale;
        container.innerHTML = `
                <div class="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_-5px_rgba(0,0,0,0.03)]">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="bg-rose-50 text-rose-500 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">Đặc Quyền Vip</span>
                            <h3 class="text-slate-900 text-lg font-black mt-3 mb-1">${conf.title}</h3>
                        </div>
                        <div class="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center min-w-[70px]">
                            <p class="text-[8px] uppercase tracking-widest font-bold text-slate-400 mb-1">KẾT THÚC</p>
                            <div class="flex items-center justify-center text-slate-900 font-mono text-sm font-bold">
                                <span id="cd-hour">00</span>:<span id="cd-min">00</span>:<span id="cd-sec">00</span>
                            </div>
                        </div>
                    </div>
                    <p class="text-[11px] text-slate-500 font-medium mb-6">${conf.desc}</p>
                    <button onclick="window.switchTab('booking')" class="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-md">
                        ${conf.btnText}
                    </button>
                </div>`;
        startCountdown(conf.endHoursFromNow);
    } else {
        const conf = appConfig.heroBlock.normalBooking;
        container.innerHTML = `
                <div class="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col items-center text-center shadow-[0_8px_30px_-5px_rgba(0,0,0,0.03)]">
                    <i class="fa-regular ${conf.icon} text-3xl text-slate-300 mb-4"></i>
                    <h3 class="text-lg font-black mb-2 text-slate-900">${conf.title}</h3>
                    <p class="text-[11px] text-slate-500 font-medium mb-6">${conf.desc}</p>
                    <button onclick="window.switchTab('booking')" class="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">
                        ${conf.btnText}
                    </button>
                </div>`;
    }
}

function startCountdown(hoursToAdd) {
    const endTime = new Date(new Date().getTime() + hoursToAdd * 60 * 60 * 1000);
    countdownInterval = setInterval(() => {
        const diff = endTime - new Date();
        if (diff > 0) {
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            const hStr = h < 10 ? '0' + h : h;
            const mStr = m < 10 ? '0' + m : m;
            const sStr = s < 10 ? '0' + s : s;

            if (document.getElementById('cd-hour')) document.getElementById('cd-hour').innerText = hStr;
            if (document.getElementById('cd-min')) document.getElementById('cd-min').innerText = mStr;
            if (document.getElementById('cd-sec')) document.getElementById('cd-sec').innerText = sStr;
            if (document.getElementById('di-hour')) document.getElementById('di-hour').innerText = hStr;
            if (document.getElementById('di-min')) document.getElementById('di-min').innerText = mStr;
            if (document.getElementById('di-sec')) document.getElementById('di-sec').innerText = sStr;
        } else { clearInterval(countdownInterval); }
    }, 1000);
}

function renderOffers() {
    document.getElementById('offersContainer').innerHTML = appConfig.offers.map(o => `
            <div class="flex bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div class="w-1/3 bg-gradient-to-br ${o.gradient || 'from-slate-500 to-slate-800'} text-white p-4 flex flex-col justify-center items-center relative shrink-0">
                    <i class="fa-solid ${o.icon || 'fa-gift'} text-2xl mb-2 opacity-90"></i>
                    <span class="text-[9px] font-black uppercase text-center leading-tight">${o.type || 'Ưu đãi'}</span>
                </div>
                <div class="w-2/3 p-5 relative border-l border-dashed border-slate-200">
                    <div class="ticket-cutout-left"></div> <div class="ticket-cutout-right"></div>
                    <h4 class="font-black text-slate-900 text-sm leading-tight mb-1">${o.title || ''}</h4>
                    <p class="text-[10px] text-slate-400 font-medium mb-4">${o.desc || ''}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">MÃ: ${o.code || ''}</span>
                        <button onclick="window.switchTab('booking')" class="text-[9px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest active:scale-95 transition-all">Sử dụng</button>
                    </div>
                </div>
            </div>
        `).join('');
}

function renderFeed() {
    document.getElementById('feedContainer').innerHTML = appConfig.feed.map((f, index) => {
        const mediaHtml = f.isVideo
            ? `<video src="${f.url || f.img}" class="w-full h-full object-cover" loop playsinline muted></video>
                   <div class="play-btn-overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none">
                        <i class="fa-solid fa-play text-white/60 text-7xl drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"></i>
                   </div>`
            : `<img src="${f.img}" class="w-full h-full object-cover">`;

        const fomoTagHtml = f.fomoText ? `
                <div class="flex items-center gap-2 mb-3">
                    <span class="flex items-center bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                        ${f.fomoIcon ? `<i class="fa-solid ${f.fomoIcon} mr-1.5 text-[10px]"></i>` : ''}
                        <span class="text-[9px] font-bold uppercase tracking-widest text-slate-100">${f.fomoText}</span>
                    </span>
                </div>
            ` : '';

        return `
            <div class="feed-item snap-start w-full h-full relative bg-slate-900 flex justify-center items-center overflow-hidden cursor-pointer" onclick="window.togglePlay(this)">
                ${mediaHtml}
                <div class="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none"></div>
                <div class="absolute bottom-[80px] left-5 right-5 text-white z-10 pointer-events-none">
                    ${fomoTagHtml}
                    <h3 class="font-black text-xl mb-1.5 drop-shadow-lg flex items-center gap-1.5 text-white pointer-events-auto">
                        Mai Tây Hair Salon <i class="fa-solid fa-circle-check text-blue-500 text-sm"></i>
                    </h3>
                    <div class="relative mb-5 pointer-events-auto">
                        <p id="desc-${index}" class="text-sm font-medium drop-shadow-md text-slate-200 line-clamp-2 transition-all duration-300">
                            ${f.title} - Tự tin khẳng định phong cách. Sản phẩm chính hãng cao cấp, phục hồi chuyên sâu.
                        </p>
                        <button onclick="window.toggleDescription('desc-${index}', this); event.stopPropagation();" class="text-[11px] font-black text-slate-400 mt-1 hover:text-white uppercase tracking-wider">
                            Xem thêm
                        </button>
                    </div>
                    <button onclick="window.switchTab('booking'); event.stopPropagation();" class="pointer-events-auto w-full flex justify-center items-center gap-2 text-xs font-black bg-white text-slate-900 px-4 py-4 rounded-2xl active:scale-95 transition-transform shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                        <i class="fa-solid fa-calendar-check text-slate-900"></i> GIỮ CHỖ NGAY
                    </button>
                </div>
            </div>
        `}).join('');
    setupVideoAutoplay();
}

function toggleDescription(elementId, btnElement) {
    const descElement = document.getElementById(elementId);
    if (descElement.classList.contains('line-clamp-2')) {
        descElement.classList.remove('line-clamp-2'); btnElement.innerText = 'ẨN BỚT';
    } else {
        descElement.classList.add('line-clamp-2'); btnElement.innerText = 'XEM THÊM';
    }
}

function setupVideoAutoplay() {
    const feedItems = document.querySelectorAll('.feed-item');
    if (feedObserver) feedObserver.disconnect();
    feedObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (video) { entry.isIntersecting ? video.play().catch(e => { }) : video.pause(); }
        });
    }, { root: document.getElementById('feedContainer'), threshold: 0.6 });
    feedItems.forEach(item => feedObserver.observe(item));
}

function togglePlay(element) {
    const video = element.querySelector('video');
    const overlay = element.querySelector('.play-btn-overlay');
    if (video) {
        if (video.paused) { video.play(); overlay.classList.add('opacity-0'); overlay.classList.remove('opacity-100'); }
        else { video.pause(); overlay.classList.remove('opacity-0'); overlay.classList.add('opacity-100'); }
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.view-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + tabName).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active', 'text-slate-900'));
    document.getElementById('nav-' + tabName).classList.add('active');

    if (tabName !== 'feed') document.querySelectorAll('#feedContainer video').forEach(v => v.pause());

    const island = document.getElementById('dynamic-island');
    if (appConfig?.heroBlock?.isFlashSale && tabName !== 'intro') {
        island.classList.remove('max-h-0', 'opacity-0', 'pointer-events-none', 'border-transparent');
        island.classList.add('max-h-[100px]', 'opacity-100', 'pointer-events-auto', 'border-slate-800');
    } else {
        island.classList.remove('max-h-[100px]', 'opacity-100', 'pointer-events-auto', 'border-slate-800');
        island.classList.add('max-h-0', 'opacity-0', 'pointer-events-none', 'border-transparent');
    }

    if (tabName === 'booking') switchBookingSubTab('flow');
    else document.getElementById('bookingAction').classList.add('hidden');
}

function switchBookingSubTab(subTab) {
    document.querySelectorAll('#view-booking .booking-sub-view').forEach(el => el.classList.remove('active'));
    document.getElementById(`booking-${subTab}-container`).classList.add('active');
    document.querySelectorAll('#view-booking .sub-nav-btn').forEach(el => el.classList.remove('active', 'text-slate-900', 'bg-white', 'shadow-sm'));
    document.getElementById(`btn-sub-${subTab}`).classList.add('active', 'text-slate-900', 'bg-white', 'shadow-sm');

    const headerTools = document.getElementById('booking-header-tools');
    if (subTab === 'flow') { headerTools.style.display = 'flex'; updateStepUI(); }
    else { headerTools.style.display = 'none'; document.getElementById('bookingAction').classList.add('hidden'); }
}

// ==========================================
// 4. LOGIC ĐẶT LỊCH QUY TRÌNH GAS
// ==========================================
function renderHomeStaff() {
    const container = document.getElementById('homeStaffList');
    if (!db.staff || db.staff.length === 0) return;
    const validStaff = db.staff.filter(st => st.id !== 'RAN').slice(0, 4);
    container.innerHTML = validStaff.map(st => {
        const avatar = st.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=f1f5f9&color=0f172a&bold=true`;
        return `<div class="shrink-0 w-28 bg-white border border-slate-100 rounded-[1.5rem] p-4 flex flex-col items-center cursor-pointer active:scale-95 transition-transform shadow-[0_4px_20px_-5px_rgba(0,0,0,0.02)]" onclick="window.switchTab('booking')">
                <img src="${avatar}" class="w-16 h-16 rounded-full object-cover mb-3 shadow-sm border border-slate-50">
                <h4 class="text-[11px] font-black text-slate-900 text-center truncate w-full">${st.name}</h4>
                <p class="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">${st.exp} Năm KN</p>
            </div>`;
    }).join('');
}

function renderBranches() {
    document.getElementById('listBranch').innerHTML = db.branches.map(b => {
        const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=0f172a&color=fff&rounded=true&bold=true`;
        return `<label class="card-radio block relative cursor-pointer shadow-sm rounded-3xl"><input type="radio" name="branch" class="hidden" onchange="window.selectBranch('${b.id}')"><div class="border-2 border-transparent rounded-3xl p-4 bg-white flex items-center transition-all"><img src="${logoUrl}" class="w-12 h-12 rounded-full shadow-sm mr-4 border-2 border-slate-50"><div class="flex-1"><h4 class="font-black text-slate-800 text-sm">${b.name}</h4><p class="text-[10px] font-bold text-slate-400 mt-1 max-w-[200px] truncate">${b.address}</p></div><i class="fa-solid fa-circle-check text-xl text-slate-200 check-icon"></i></div></label>`;
    }).join('');
}

function selectBranch(id) {
    selection.branch = db.branches.find(b => b.id === id);
    document.getElementById('listService').innerHTML = db.services.filter(s => s.branchId === 'ALL' || s.branchId === id).map(s => `
            <label class="card-radio block relative cursor-pointer shadow-sm rounded-[1.5rem]"><input type="radio" name="service" class="hidden" onchange="window.selectService('${s.id}')"><div class="border-2 border-transparent rounded-[1.5rem] p-5 bg-white flex justify-between items-center transition-all"><div><h4 class="font-bold text-slate-800 text-sm">${s.name}</h4><p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1"><i class="fa-regular fa-clock mr-1"></i>${s.duration} Phút</p></div><span class="font-black text-slate-900 text-sm bg-slate-50 px-3 py-1.5 rounded-xl">${s.price}k</span></div></label>`).join('');
    nextStep();
}

function selectService(id) {
    selection.service = db.services.find(s => s.id === id);
    document.getElementById('listStaff').innerHTML = db.staff.filter(st => st.branchId === 'ALL' || st.branchId === selection.branch.id).map(st => {
        const avatar = st.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=f1f5f9&color=0f172a&bold=true`;
        return `<label class="card-radio block relative cursor-pointer h-full shadow-sm rounded-[2rem]"><input type="radio" name="staff" class="hidden" onchange="window.selectStaff('${st.id}')"><div class="border-2 border-transparent rounded-[2rem] p-4 bg-white text-center h-full flex flex-col justify-center transition-all"><img src="${avatar}" class="w-14 h-14 rounded-full mx-auto mb-2 object-cover border-2 border-slate-50"><h4 class="font-bold text-slate-900 text-[11px] truncate w-full">${st.name}</h4><p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${st.exp} Năm KN</p></div></label>`;
    }).join('');
    nextStep();
}

function selectStaff(id) { selection.staff = db.staff.find(st => st.id === id); selection.time = null; document.getElementById('timeSlotGrid').innerHTML = ''; nextStep(); }

function renderDateSelector() {
    let html = ''; const tzOffset = new Date().getTimezoneOffset() * 60000; const today = new Date(Date.now() - tzOffset); const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 0; i < 30; i++) {
        let d = new Date(today); d.setDate(today.getDate() + i); const isoDate = d.toISOString().split('T')[0]; const dayName = i === 0 ? 'Hôm nay' : dayNames[d.getDay()];
        html += `<button id="dateBtn-${isoDate}" onclick="window.selectDate('${isoDate}')" class="date-card shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-2xl border border-transparent bg-white shadow-sm transition-all"><span class="text-[9px] font-black uppercase text-slate-400 mb-1">${dayName}</span><span class="text-lg font-black text-slate-800">${d.getDate()}</span></button>`;
    }
    document.getElementById('customDatePicker').innerHTML = html;
}

function jumpToToday() { selectDate(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]); document.getElementById('customDatePicker').scrollTo({ left: 0, behavior: 'smooth' }); }

function selectDate(isoDate) {
    selection.date = isoDate; selection.time = null; document.querySelectorAll('.date-card').forEach(el => el.classList.remove('date-active', 'shadow-md'));
    const btn = document.getElementById(`dateBtn-${isoDate}`); if (btn) { btn.classList.add('date-active', 'shadow-md'); btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }
    fetchTimeSlots();
}

async function fetchTimeSlots() {
    if (!selection.date) return; document.getElementById('timeSlotGrid').innerHTML = ''; document.getElementById('timeLoading').classList.remove('hidden');
    try { const res = await fetch(`${API_URL}?action=getBusy&date=${selection.date}&staffName=${encodeURIComponent(selection.staff.name)}`); const result = await res.json(); generateGrid(result.busySlots || []); }
    catch (e) { generateGrid([]); } document.getElementById('timeLoading').classList.add('hidden');
}

function generateGrid(busySlots) {
    const grid = document.getElementById('timeSlotGrid'); const dur = parseInt(selection.service.duration); const parseTime = str => parseInt(String(str).split(':')[0] || 0) * 60 + parseInt(String(str).split(':')[1] || 0);
    const branch = db.branches.find(b => b.id === selection.branch.id) || { openTime: "08:00", closeTime: "20:00" }; const openMins = parseTime(branch.openTime); const closeMins = parseTime(branch.closeTime);
    const now = new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)); const currentMins = now.getUTCHours() * 60 + now.getUTCMinutes(); const isToday = selection.date === now.toISOString().split('T')[0];
    let html = "";
    for (let m = openMins; m <= closeMins - dur; m += 30) {
        const timeLabel = `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`; const slotStart = new Date(`${selection.date}T${timeLabel}:00+07:00`).getTime(); let isBusy = false;
        if (isToday && m <= currentMins) isBusy = true; for (let busy of busySlots) if (slotStart < busy.end && (slotStart + dur * 60000) > busy.start) isBusy = true;
        html += `<label class="card-radio block ${isBusy ? 'opacity-30 pointer-events-none' : 'cursor-pointer'} shadow-sm rounded-[1rem]"><input type="radio" name="time" class="hidden" onchange="selection.time='${timeLabel}'" ${isBusy ? 'disabled' : ''}><div class="border border-transparent rounded-[1rem] py-3 text-center bg-white transition-all"><span class="font-bold text-xs text-slate-700">${timeLabel}</span></div></label>`;
    }
    grid.innerHTML = html || '<p class="col-span-4 text-center text-xs font-bold text-slate-400 py-4 bg-white rounded-xl">Kín lịch hôm nay</p>';
}

function nextStep() {
    if (currentStep === 1 && !selection.branch) return; if (currentStep === 2 && !selection.service) return; if (currentStep === 3 && !selection.staff) return; if (currentStep === 4 && (!selection.date || !selection.time)) return alert("Vui lòng chọn ngày và giờ.");
    if (currentStep === 5) return document.getElementById('finalForm').dispatchEvent(new Event('submit'));
    if (currentStep === 3 && !selection.date) jumpToToday();
    currentStep++; updateStepUI(); document.getElementById('booking-flow-container').scrollTo(0, 0);
}

function prevStep() { if (currentStep > 1) { currentStep--; updateStepUI(); } }

function updateStepUI() {
    document.querySelectorAll('.step-pane').forEach(el => el.classList.remove('active'));
    document.getElementById(`step${currentStep}`).classList.add('active');
    const dots = document.getElementById('progressDots').children;
    for (let i = 0; i < 5; i++) dots[i].className = i < currentStep ? "w-4 h-2 rounded-full bg-slate-900 transition-all" : "w-2 h-2 rounded-full bg-slate-300";
    document.getElementById('stepCounter').innerText = currentStep;
    document.getElementById('btnBack').style.opacity = currentStep === 1 ? '0' : '1';
    document.getElementById('btnBack').style.pointerEvents = currentStep === 1 ? 'none' : 'auto';
    document.getElementById('bookingAction').classList.toggle('hidden', currentStep === 1);
    if (currentStep === 5) {
        document.getElementById('btnNext').innerText = 'XÁC NHẬN ĐẶT LỊCH'; const dP = selection.date.split('-');
        document.getElementById('sumDate').innerText = `${dP[2]}/${dP[1]}/${dP[0]}`;
        document.getElementById('sumTime').innerText = selection.time;
        document.getElementById('sumService').innerText = selection.service.name;
        document.getElementById('sumStaff').innerText = selection.staff.name;
    } else { document.getElementById('btnNext').innerText = 'TIẾP TỤC'; }
}

async function submitBooking() {
    if (!selection.time) return alert("Vui lòng chọn giờ hẹn."); const btn = document.getElementById('btnNext'); btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG XỬ LÝ'; btn.disabled = true;
    const startTime = new Date(`${selection.date}T${selection.time}:00+07:00`);
    const payload = { action: 'book', data: { branchName: selection.branch.name, serviceName: selection.service.name, staffName: selection.staff.name, startTime: startTime.toISOString(), endTime: new Date(startTime.getTime() + selection.service.duration * 60000).toISOString(), name: document.getElementById('cusName').value, phone: document.getElementById('cusPhone').value, email: document.getElementById('cusEmail').value } };
    try { await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) }); alert("ĐẶT LỊCH THÀNH CÔNG! Hẹn gặp bạn tại Salon."); location.reload(); }
    catch (e) { alert("Lỗi kết nối. Vui lòng thử lại!"); btn.innerText = 'XÁC NHẬN ĐẶT LỊCH'; btn.disabled = false; }
}

async function lookupBooking() {
    const phone = document.getElementById('lookupPhone').value; if (!phone) return; const btn = document.getElementById('btnLookup'); btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    try {
        const res = await fetch(`${API_URL}?action=lookup&phone=${encodeURIComponent(phone)}`); const result = await res.json(); const container = document.getElementById('lookupResults');
        if (!result.bookings || result.bookings.length === 0) container.innerHTML = '<div class="bg-white p-4 rounded-xl text-center text-xs font-bold text-slate-400 uppercase border border-slate-100">Không tìm thấy lịch hẹn nào</div>';
        else container.innerHTML = result.bookings.map(b => `<div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"><p class="text-[9px] font-black text-rose-500 uppercase mb-1"><i class="fa-solid fa-location-dot mr-1"></i>${b.branch}</p><h4 class="font-black text-slate-800 text-base mb-3">${b.service}</h4><div class="bg-slate-50 p-3 rounded-xl flex flex-col gap-2 mb-4"><div class="text-[11px] font-bold text-slate-600"><i class="fa-regular fa-clock mr-2 text-slate-400"></i>${b.timeStr}</div><div class="text-[11px] font-bold text-slate-600"><i class="fa-solid fa-user-tie mr-2 text-slate-400"></i>${b.staff}</div></div><button onclick="window.cancelBooking('${b.eventId}')" class="w-full py-3 text-rose-500 font-bold text-[10px] uppercase tracking-widest bg-white border border-rose-100 rounded-xl shadow-sm active:bg-rose-50 transition-colors">Huỷ Lịch Này</button></div>`).join('');
    } catch (e) { alert("Lỗi tra cứu!"); } finally { btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>'; }
}

async function cancelBooking(id) {
    if (!confirm("Xác nhận huỷ lịch hẹn này?")) return;
    try { await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'cancel', eventId: id }) }); alert("Đã huỷ thành công!"); lookupBooking(); }
    catch (e) { alert("Lỗi huỷ lịch!"); }
}

function rateStar(index) {
    const stars = document.getElementById('starContainer').children; document.getElementById('fbRating').value = index;
    for (let i = 0; i < 5; i++) { if (i < index) { stars[i].classList.add('active', 'text-[#f59e0b]'); stars[i].classList.remove('text-slate-200'); } else { stars[i].classList.remove('active', 'text-[#f59e0b]'); stars[i].classList.add('text-slate-200'); } }
}

async function submitFeedback(e) {
    e.preventDefault(); const btn = document.getElementById('btnSubmitFeedback'); btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG GỬI...'; btn.disabled = true;
    const payload = { action: 'feedback', data: { rating: document.getElementById('fbRating').value, name: document.getElementById('fbName').value, phone: document.getElementById('fbPhone').value, message: document.getElementById('fbMessage').value } };
    try { await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) }); alert("Cảm ơn bạn đã đóng góp ý kiến!"); document.getElementById('nativeFeedbackForm').reset(); rateStar(5); }
    catch (error) { alert("Cảm ơn đóng góp của bạn!"); document.getElementById('nativeFeedbackForm').reset(); } finally { btn.innerHTML = 'GỬI GÓP Ý'; btn.disabled = false; }
}

// ==========================================
// 5. HÀM KHỞI TẠO CHÍNH (GỘP DATA & BÙ TRỪ)
// ==========================================
async function init() {
    startLoadingAnimation();

    try {
        // Bước A: Kéo dữ liệu ĐỘNG từ Firestore
        const docRef = doc(dbFirestore, "configs", "appConfig");
        const docSnap = await getDoc(docRef);
        const firestoreData = docSnap.exists() ? docSnap.data() : {};

        // Bước B: Hợp nhất (Merge) dữ liệu TĨNH và ĐỘNG (Có Fallback chống lỗi)
        appConfig = {
            general: DEFAULT_CONFIG.general,
            contact: DEFAULT_CONFIG.contact,
            heroBlock: {
                isFlashSale: firestoreData?.heroBlock?.isFlashSale || false,
                sliderImages: (firestoreData?.heroBlock?.sliderImages?.length > 0) ? firestoreData.heroBlock.sliderImages : ["./BGMT.jpg"],
                flashSale: firestoreData?.heroBlock?.flashSale || { title: "Giảm 30% Hóa Chất", desc: "Chỉ áp dụng hôm nay", endHoursFromNow: 3, btnText: "GIỮ CHỖ NGAY" },
                normalBooking: { title: "Trải Nghiệm Đẳng Cấp", desc: "Đặt lịch để giữ chỗ ngay hôm nay.", btnText: "ĐẶT LỊCH NGAY", icon: "fa-calendar-check" }
            },
            homeFeatures: {
                categories: DEFAULT_CONFIG.homeFeatures.categories,
                marqueeTexts: (firestoreData?.homeFeatures?.marqueeTexts?.length > 0) ? firestoreData.homeFeatures.marqueeTexts : [{ text: "🎉 Chào mừng bạn đến với hệ thống Mai Tây Hair Salon", isHighlight: true }]
            },
            offers: firestoreData?.offers || [],
            feed: firestoreData?.feed || []
        };

        // Bước C: Render UI ngay lập tức
        applyConfig();
        renderHeroSlider();
        renderDynamicHero();
        renderHomeFeatures();
        renderOffers();
        renderFeed();

        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));
        await minLoadingTime;
        finishLoadingAnimation();

        // Bước D: Tải ngầm hệ thống đặt lịch qua GAS
        fetch(`${API_URL}?action=init`)
            .then(res => res.json())
            .then(data => {
                db = data;
                renderHomeStaff();
                renderBranches();
                renderDateSelector();
            })
            .catch(e => console.error("Lỗi tải ngầm dữ liệu GAS:", e));

    } catch (e) {
        console.error("Lỗi khởi tạo hệ thống:", e);
        finishLoadingAnimation();
    }
}

// Kích hoạt App
init();