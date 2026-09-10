import { UI } from '../../js/ui.js';

// =============================================================================
// 0. DYNAMIC THEME ACCENT CONTROLLER
// =============================================================================
const DEFAULT_EMERALD = '#10b981';

export const ThemeKit = {
    getAccentColor: () => {
        return localStorage.getItem('hunqos_accent_color') || 
               localStorage.getItem('hunqos_icon_custom_bg') || 
               DEFAULT_EMERALD;
    },
    applyAccent: (container) => {
        if (!container) return;
        const accent = ThemeKit.getAccentColor();
        container.style.setProperty('--kit-accent', accent);
    }
};

// =============================================================================
// 1. ADAPTIVE ISLAND & TOAST FALLBACK CONTROLLER
// =============================================================================
export const IslandKit = {
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        const isDOMVisible = wrapper && !wrapper.classList.contains('hidden') && window.getComputedStyle(wrapper).display !== 'none';
        return Boolean(isEnabled && isDOMVisible && typeof window.triggerIslandNotification === 'function');
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive()) {
            window.triggerIslandNotification(title, desc, type, duration);
        } else {
            UI.showAlert(title, desc, type, duration);
        }
    }
};

// =============================================================================
// 2. DATABASE & THUẬT TOÁN (CORE ENGINE)
// =============================================================================
const QUIZ = [
    {
        q: "Khi có tiếng động nhỏ lúc đang ngủ, phản ứng của bạn thường là gì?",
        a: [
            { t: "Bừng tỉnh ngay lập tức và cực kỳ khó ngủ lại", s: { dolphin: 5 } },
            { t: "Lơ mơ nhận biết một chút rồi dễ dàng ngủ tiếp", s: { bear: 4 } },
            { t: "Tùy thuộc vào thời điểm (nửa đêm thì tỉnh, gần sáng thì kệ)", s: { wolf: 4 } },
            { t: "Ngủ rất say, gần như không biết gì xung quanh", s: { lion: 4, bear: 2 } }
        ]
    },
    {
        q: "Thời điểm bạn cảm thấy sảng khoái và tỉnh táo nhất trong ngày?",
        a: [
            { t: "Sáng sớm tinh mơ, vừa thức dậy là tràn đầy năng lượng", s: { lion: 5 } },
            { t: "Khoảng giữa buổi sáng đến đầu giờ chiều (10:00 - 14:00)", s: { bear: 5 } },
            { t: "Chiều muộn hoặc tối mịt (sau 18:00 đến đêm muộn)", s: { wolf: 5 } },
            { t: "Tỉnh theo từng đợt ngắn, thường là rất muộn vào ban đêm", s: { dolphin: 4 } }
        ]
    },
    {
        q: "Khi đặt lưng xuống giường sau một ngày dài làm việc:",
        a: [
            { t: "Thư giãn đầu óc, sập nguồn và ngủ được ngay", s: { lion: 4, bear: 2 } },
            { t: "Suy nghĩ vẩn vơ một chút về ngày hôm nay rồi ngủ", s: { bear: 5 } },
            { t: "Tự dưng tỉnh táo hẳn, não bắt đầu nảy số, ra ý tưởng mới", s: { wolf: 5 } },
            { t: "Căng thẳng, lo âu, trằn trọc sợ mình lại bị mất ngủ", s: { dolphin: 5 } }
        ]
    },
    {
        q: "Tần suất bạn bị thức giấc giữa đêm (hoặc khó duy trì giấc ngủ):",
        a: [
            { t: "Hầu như đêm nào cũng tỉnh 1-2 lần rồi trằn trọc", s: { dolphin: 5 } },
            { t: "Ít bị, vì tôi luôn thức thật khuya, mệt lả mới đi ngủ", s: { wolf: 4 } },
            { t: "Thỉnh thoảng có tỉnh nhưng quay lại giấc ngủ rất nhanh", s: { bear: 4 } },
            { t: "Hiếm khi, tôi luôn ngủ một mạch từ đêm tới sáng", s: { lion: 5, bear: 1 } }
        ]
    },
    {
        q: "Nếu được tự do hoàn toàn (ngày nghỉ), bạn muốn thức dậy lúc mấy giờ?",
        a: [
            { t: "Trước 6:00 sáng (không cần báo thức)", s: { lion: 5 } },
            { t: "Từ 6:30 đến 8:30 sáng", s: { bear: 5 } },
            { t: "Từ 9:00 đến 11:00 sáng hoặc muộn hơn", s: { wolf: 5 } },
            { t: "Thất thường, hoàn toàn phụ thuộc vào việc đêm qua có ngủ được không", s: { dolphin: 4 } }
        ]
    },
    {
        q: "Trạng thái của bạn trong 30-45 phút đầu tiên sau khi mở mắt thức dậy:",
        a: [
            { t: "Tỉnh táo 100%, có thể giải quyết ngay việc khó", s: { lion: 5 } },
            { t: "Hơi lờ đờ, cần một tách cà phê hoặc thời gian để khởi động", s: { bear: 5 } },
            { t: "Cực kỳ uể oải, cáu gắt, như một cái xác không hồn", s: { wolf: 5 } },
            { t: "Mệt mỏi về thể xác nhưng đầu óc đã bắt đầu lo nghĩ, quay cuồng", s: { dolphin: 4 } }
        ]
    },
    {
        q: "Đặc điểm hoặc phong cách làm việc nổi bật nhất của bạn là gì?",
        a: [
            { t: "Kỷ luật thép, tư duy chiến lược, thích hoàn thành việc trước thời hạn", s: { lion: 5 } },
            { t: "Chăm chỉ, thích làm việc theo quy trình ổn định, teamwork tốt", s: { bear: 5 } },
            { t: "Sáng tạo, bộc đồng, thích tự do và làm việc theo cảm hứng", s: { wolf: 5 } },
            { t: "Cầu toàn, soi chi tiết, hay tự tạo áp lực và có xu hướng né tránh rủi ro", s: { dolphin: 5 } }
        ]
    },
    {
        q: "Khoảng 14:00 (2 giờ chiều), cơ thể bạn thường rơi vào trạng thái nào?",
        a: [
            { t: "Bắt đầu sụt giảm năng lượng rõ rệt, cần nghỉ ngơi", s: { lion: 5 } },
            { t: "Buồn ngủ rũ mắt, bắt buộc phải chợp mắt 15-30 phút", s: { bear: 5 } },
            { t: "Bình thường, không buồn ngủ, não đang bắt đầu tăng tốc", s: { wolf: 4, dolphin: 2 } },
            { t: "Khá tỉnh táo vì cơ thể đã quen với nhịp mệt mỏi từ sáng", s: { dolphin: 4 } }
        ]
    },
    {
        q: "Khi bị stress hoặc gặp áp lực lớn, thói quen ăn uống của bạn thay đổi thế nào?",
        a: [
            { t: "Hầu như không đổi, vẫn cố ăn đúng giờ để giữ sức khỏe", s: { lion: 5 } },
            { t: "Thèm ăn liên tục, đặc biệt là đồ ngọt hoặc đồ ăn vặt để giải tỏa", s: { bear: 5 } },
            { t: "Xu hướng bỏ bữa ngày nhưng lại thèm ăn muộn, ăn đêm rất nhiều", s: { wolf: 5 } },
            { t: "Chán ăn hoàn toàn, cảm thấy cồn cào ruột gan hoặc mải lo mà quên ăn", s: { dolphin: 5 } }
        ]
    },
    {
        q: "Mức độ nhạy cảm và thói quen sử dụng Caffeine (Cà phê, trà, tăng lực):",
        a: [
            { t: "Ít phụ thuộc, uống chủ yếu vì sở thích chứ cơ thể tự tỉnh được", s: { lion: 4 } },
            { t: "Cần duy trì 1-2 ly vào buổi sáng/trưa để không bị sụp nguồn", s: { bear: 5 } },
            { t: "Buổi sáng cần rất nhiều để mở mắt, nhưng đến tối lại tự động tỉnh", s: { wolf: 4 } },
            { t: "Rất nhạy cảm, uống vào là tim đập nhanh, bồn chồn, thức trắng đêm", s: { dolphin: 5 } }
        ]
    },
    {
        q: "Nếu phải chạy deadline khẩn cấp từ 22:00 đêm đến rạng sáng hôm sau:",
        a: [
            { t: "Bất khả thi, não tôi đã sập nguồn hoàn toàn từ tối", s: { lion: 5 } },
            { t: "Có thể gượng được nhưng phản xạ cực kỳ chậm và uể oải", s: { bear: 4 } },
            { t: "Làm được nhưng hệ thần kinh sẽ bị kích thích mạnh, hôm sau kiệt sức", s: { dolphin: 4 } },
            { t: "Tuyệt vời, đây chính là khung giờ vàng tôi tập trung và thăng hoa nhất", s: { wolf: 5 } }
        ]
    },
    {
        q: "Cơn đói mạnh nhất và cảm giác thèm ăn của bạn thường xuất hiện khi nào?",
        a: [
            { t: "Ngay sau khi thức dậy, bữa sáng đối với tôi là quan trọng nhất", s: { lion: 5 } },
            { t: "Rõ rệt vào giờ ăn trưa và đầu giờ tối", s: { bear: 5 } },
            { t: "Buổi sáng lười ăn, nhưng chiều muộn và đêm muộn lại cực kỳ đói", s: { wolf: 5 } },
            { t: "Thất thường, thường mải suy nghĩ hoặc lo lắng mà quên luôn cảm giác đói", s: { dolphin: 4 } }
        ]
    },
    {
        q: "Vào những ngày cuối tuần, thói quen ngủ của bạn thay đổi thế nào?",
        a: [
            { t: "Giữ nguyên như ngày thường, đồng hồ sinh học của tôi rất cứng nhắc", s: { lion: 5 } },
            { t: "Có thể thức khuya hơn một chút và dậy muộn hơn khoảng 1 tiếng", s: { bear: 5 } },
            { t: "Thức xuyên đêm và ngủ nướng bù tới tận trưa hoặc chiều để trả nợ giấc ngủ", s: { wolf: 5 } },
            { t: "Dù là cuối tuần vẫn trằn trọc khó ngủ, không thể ngủ nướng được", s: { dolphin: 5 } }
        ]
    },
    {
        q: "Bạn tự đánh giá mình là người có xu hướng tính cách như thế nào?",
        a: [
            { t: "Chủ động, thực tế, thích dẫn dắt và có mục tiêu rõ ràng", s: { lion: 4 } },
            { t: "Dễ gần, cởi mở, hướng đến sự hòa hợp và né tránh xung đột", s: { bear: 4 } },
            { t: "Yêu tự do, độc lập, có phần bốc đồng và thích trải nghiệm mới", s: { wolf: 4 } },
            { t: "Nhạy cảm, sâu sắc, hay lo âu, có tư duy logic và phân tích tốt", s: { dolphin: 4 } }
        ]
    },
    {
        q: "Mục đích lớn nhất của bạn khi thực hiện bài trắc nghiệm nhịp sinh học này là gì?",
        a: [
            { t: "Tối ưu hóa các khung giờ vàng buổi sáng để bứt phá hiệu suất", s: { lion: 4 } },
            { t: "Duy trì sức khỏe ổn định, cân bằng giữa công việc và cuộc sống", s: { bear: 4 } },
            { t: "Tìm giải pháp vì tôi luôn cảm thấy kiệt sức vào các ca làm việc buổi sáng", s: { wolf: 4 } },
            { t: "Tìm cách khắc phục tình trạng mệt mỏi kinh niên, mất ngủ và sương mù não", s: { dolphin: 4 } }
        ]
    }
];

const SIM_DB = {
    lion: { 
        name: "Sư Tử (Lion)", 
        icon: "🦁", 
        curve: [5,5,5,10,30,65,85,95,100,100,90,75,55,40,35,40,45,40,30,20,10,5,5,5], 
        foc:   [5,5,5,5,20,60,85,95,100,100,95,70,50,30,25,35,40,35,20,10,5,5,5,5], 
        eng:   [5,5,5,15,40,70,90,100,100,95,85,75,55,40,35,45,50,40,30,15,10,5,5,5],
        met:   [10,10,10,25,50,75,90,95,90,80,75,80,70,55,45,50,55,45,35,20,15,10,10,10],
        slp:   [95,95,100,95,80,45,15,5,5,5,10,25,45,60,65,55,50,60,75,85,90,95,95,95] 
    },
    bear: { 
        name: "Gấu (Bear)", 
        icon: "🐻", 
        curve: [5,5,5,5,5,15,40,65,85,95,100,100,95,85,65,60,70,75,65,50,35,20,10,5], 
        foc:   [5,5,5,5,5,10,30,60,80,95,100,100,90,75,55,50,65,70,60,40,25,15,5,5], 
        eng:   [5,5,5,5,5,15,35,65,85,90,95,100,95,80,60,65,75,80,70,55,40,20,10,5], 
        met:   [10,10,10,10,15,30,55,75,85,90,95,90,80,70,65,70,75,70,55,40,25,15,10,10],
        slp:   [95,100,100,100,90,75,45,20,5,5,5,5,10,25,40,45,35,25,40,60,75,85,90,95] 
    },
    wolf: { 
        name: "Sói (Wolf)", 
        icon: "🐺", 
        curve: [45,30,15,5,5,5,10,20,30,45,55,65,75,70,60,65,75,85,95,100,100,95,85,65], 
        foc:   [50,35,15,5,5,5,5,10,20,35,50,65,75,70,55,60,70,80,95,100,100,90,80,60], 
        eng:   [40,25,10,5,5,5,10,20,35,45,60,70,80,75,65,70,80,90,100,100,95,90,85,65], 
        met:   [25,15,10,10,10,15,20,30,40,50,65,70,75,70,65,70,80,85,90,95,90,80,60,40],
        slp:   [45,65,80,95,100,100,90,75,60,45,35,20,15,20,35,30,20,15,5,5,5,10,20,35] 
    },
    dolphin:{ 
        name: "Cá Heo (Dolphin)", 
        icon: "🐬", 
        curve: [35,25,20,15,20,35,50,60,65,75,85,80,70,65,70,75,70,75,85,80,65,55,45,40], 
        foc:   [30,20,15,10,15,30,45,55,65,80,90,85,65,60,65,70,65,75,85,75,60,45,35,30], 
        eng:   [35,25,15,15,20,35,50,60,70,75,85,80,75,65,70,75,70,75,80,80,65,50,40,35], 
        met:   [20,15,15,15,20,30,45,55,65,70,75,70,65,60,65,70,65,70,75,70,60,45,35,25],
        slp:   [60,70,75,80,75,55,40,30,20,15,10,15,25,35,30,25,30,25,20,30,45,50,55,60] 
    }
};

const LABELS = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

// =============================================================================
// 3. GIAO DIỆN SEAMLESS FLAT (EMERALD ACCENT SYNC)
// =============================================================================
export function template() {
    return `
    <div id="chrono-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #chrono-root-container {
                --kit-accent: #10b981;
            }
            .bg-accent-theme {
                background-color: var(--kit-accent) !important;
            }
            .text-accent-theme {
                color: var(--kit-accent) !important;
            }
            .border-accent-theme {
                border-color: var(--kit-accent) !important;
            }
            .accent-theme-tint {
                accent-color: var(--kit-accent) !important;
            }
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- HEADER -->
            <div class="px-1 space-y-1">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Bio Engine</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Chronotype Master</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Đo lường nhịp sinh học cá nhân, mô phỏng 24h & tối ưu chu kỳ giấc ngủ.</p>
            </div>

            <!-- BƯỚC 1: SETUP GIỜ THỰC TẾ -->
            <div id="v-setup" class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5">
                <div>
                    <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">1. Lịch trình sinh hoạt hiện tại</h3>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">HunqOS sẽ so sánh giờ thực tế của bạn với nhịp sinh học tự nhiên.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3.5 border border-black/[0.04] dark:border-white/[0.06]">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Giờ thức dậy hằng ngày</label>
                        <input type="time" id="i-wake" value="07:00" class="w-full bg-transparent border-none outline-none text-lg font-bold text-zinc-900 dark:text-white cursor-pointer">
                    </div>
                    <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3.5 border border-black/[0.04] dark:border-white/[0.06]">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Giờ lên giường đi ngủ</label>
                        <input type="time" id="i-sleep" value="23:30" class="w-full bg-transparent border-none outline-none text-lg font-bold text-zinc-900 dark:text-white cursor-pointer">
                    </div>
                </div>

                <button id="btn-start" class="w-full h-12 rounded-[16px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
                    Bắt đầu trắc nghiệm (15 câu hỏi) <i class="fas fa-arrow-right text-xs"></i>
                </button>
            </div>

            <!-- BƯỚC 2: TRẮC NGHIỆM -->
            <div id="v-quiz" class="hidden rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5">
                <div class="space-y-3">
                    <div class="flex items-center justify-between text-[11px] font-mono">
                        <span class="text-accent-theme font-bold" id="q-count">Câu 1/15</span>
                        <span class="text-zinc-400" id="q-percent">0%</span>
                    </div>
                    <div class="w-full h-1.5 bg-[#f2f2f7] dark:bg-black/40 rounded-full overflow-hidden">
                        <div id="q-bar" class="h-full bg-accent-theme rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <h3 class="text-sm sm:text-base font-bold text-zinc-900 dark:text-white pt-1 leading-snug" id="q-title">Đang tải...</h3>
                </div>

                <div id="q-opts" class="space-y-2.5"></div>

                <div class="pt-2 flex items-center justify-between border-t border-black/[0.05] dark:border-white/[0.08]">
                    <button id="btn-prev" class="px-4 py-2 rounded-[12px] bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none">
                        <i class="fas fa-arrow-left text-[10px]"></i> Quay lại
                    </button>
                    <span class="text-[11px] text-zinc-400">Chọn 1 đáp án</span>
                </div>
            </div>

            <!-- BƯỚC 3: TỔNG KẾT -->
            <div id="v-review" class="hidden rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tổng kết câu trả lời</h3>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">Kiểm tra lại hoặc sửa trước khi phân tích.</p>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-theme-alpha text-accent-theme font-bold">15 / 15</span>
                </div>

                <div class="max-h-[360px] overflow-y-auto no-scrollbar space-y-2 pr-0.5" id="review-list"></div>

                <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <button id="btn-calc" class="w-full h-12 rounded-[16px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
                        <i class="fas fa-brain text-xs"></i> Khởi chạy phân tích
                    </button>
                </div>
            </div>

            <!-- BƯỚC 4: KẾT QUẢ & DASHBOARD -->
            <div id="v-res" class="hidden space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="rounded-[20px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 shadow-sm flex items-center gap-3.5">
                        <span class="text-3xl" id="r-icon">🦁</span>
                        <div>
                            <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Chronotype gốc</span>
                            <span class="text-sm font-bold text-zinc-900 dark:text-white" id="r-name">-</span>
                        </div>
                    </div>

                    <div class="rounded-[20px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 shadow-sm">
                        <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Social Jetlag (Lệch pha)</span>
                        <div class="text-xl font-black text-rose-500" id="r-jetlag-box">
                            <span id="r-jetlag">0.0</span> <span class="text-[11px] text-zinc-400 font-normal">giờ</span>
                        </div>
                    </div>

                    <div class="rounded-[20px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 shadow-sm flex flex-col justify-between">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Độ đồng bộ (CAS)</span>
                            <span class="text-xs font-bold text-accent-theme font-mono" id="r-cas-val">0%</span>
                        </div>
                        <div class="w-full bg-[#f2f2f7] dark:bg-black/40 h-2 rounded-full overflow-hidden">
                            <div id="r-cas-bar" class="h-full bg-accent-theme rounded-full transition-all duration-1000" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <!-- 24H SIMULATOR -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Giả lập nhịp sinh học 24H</h3>
                            <p class="text-xs text-zinc-500 dark:text-zinc-400">Trượt để quét mức năng lượng và hormone theo từng giờ.</p>
                        </div>
                        <span class="text-sm font-bold font-mono px-3 py-1 rounded-[12px] bg-accent-theme-alpha text-accent-theme" id="sim-time-lbl">10:00</span>
                    </div>

                    <div class="bg-[#f2f2f7] dark:bg-black/40 p-3.5 rounded-[18px] border border-black/[0.04] dark:border-white/[0.06]">
                        <input type="range" id="sim-slider" min="0" max="23" value="10" class="range w-full accent-theme-tint h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer">
                        <div class="flex justify-between text-[10px] font-mono text-zinc-400 mt-1.5 px-0.5">
                            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        <div class="bg-[#f2f2f7] dark:bg-black/40 p-3 rounded-[16px] border border-black/[0.03] dark:border-white/[0.05]">
                            <div class="flex justify-between text-[11px] font-semibold mb-1.5">
                                <span class="text-zinc-600 dark:text-zinc-400">Tập trung trí não</span>
                                <span class="text-zinc-900 dark:text-white font-mono" id="s-foc-val">0%</span>
                            </div>
                            <div class="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div id="s-foc-bar" class="h-full bg-accent-theme rounded-full transition-all duration-200"></div>
                            </div>
                        </div>

                        <div class="bg-[#f2f2f7] dark:bg-black/40 p-3 rounded-[16px] border border-black/[0.03] dark:border-white/[0.05]">
                            <div class="flex justify-between text-[11px] font-semibold mb-1.5">
                                <span class="text-zinc-600 dark:text-zinc-400">Năng lượng thể chất</span>
                                <span class="text-zinc-900 dark:text-white font-mono" id="s-eng-val">0%</span>
                            </div>
                            <div class="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div id="s-eng-bar" class="h-full bg-emerald-500 rounded-full transition-all duration-200"></div>
                            </div>
                        </div>

                        <div class="bg-[#f2f2f7] dark:bg-black/40 p-3 rounded-[16px] border border-black/[0.03] dark:border-white/[0.05]">
                            <div class="flex justify-between text-[11px] font-semibold mb-1.5">
                                <span class="text-zinc-600 dark:text-zinc-400">Trao đổi chất</span>
                                <span class="text-zinc-900 dark:text-white font-mono" id="s-met-val">0%</span>
                            </div>
                            <div class="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div id="s-met-bar" class="h-full bg-amber-500 rounded-full transition-all duration-200"></div>
                            </div>
                        </div>

                        <div class="bg-[#f2f2f7] dark:bg-black/40 p-3 rounded-[16px] border border-black/[0.03] dark:border-white/[0.05]">
                            <div class="flex justify-between text-[11px] font-semibold mb-1.5">
                                <span class="text-zinc-600 dark:text-zinc-400">Áp lực ngủ (Melatonin)</span>
                                <span class="text-zinc-900 dark:text-white font-mono" id="s-slp-val">0%</span>
                            </div>
                            <div class="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div id="s-slp-bar" class="h-full bg-slate-500 rounded-full transition-all duration-200"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DUAL CHARTS & SLEEP ADVISOR -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                        <div class="flex justify-between items-center pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <h3 class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Độ Lệch Pha Thực Tế</h3>
                            <div class="flex gap-2.5 text-[9px] font-semibold">
                                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-sm bg-accent-theme"></span> Gốc</span>
                                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-sm bg-rose-500"></span> Thực tế</span>
                            </div>
                        </div>
                        <div class="w-full flex justify-between items-end h-36 px-1" id="dual-bars"></div>
                    </div>

                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                        <div>
                            <div class="flex items-center gap-1.5 text-accent-theme mb-1">
                                <i class="fas fa-moon text-xs"></i>
                                <h3 class="text-[10px] font-bold uppercase tracking-wider">Chu kỳ ngủ 90 phút</h3>
                            </div>
                            <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed" id="sleep-txt">Đang tính toán...</p>
                        </div>

                        <div class="space-y-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Giờ thức dậy khuyên dùng:</span>
                            <div class="flex gap-2" id="sleep-slots"></div>
                        </div>
                    </div>
                </div>

                <!-- RESET -->
                <div class="pt-2 flex justify-center">
                    <button id="btn-reset" class="px-6 py-2.5 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 font-semibold text-xs active:scale-95 transition-all flex items-center gap-2">
                        <i class="fas fa-rotate-left text-[11px]"></i> Làm lại bài test
                    </button>
                </div>
            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 4. LOGIC KHỞI TẠO (INIT)
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#chrono-root-container') || hostElement;

    // Áp dụng màu chủ đạo từ hệ thống (ThemeKit)
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    let currQ = 0;
    let selectedAnswers = new Array(QUIZ.length).fill(null);
    let finalBioKey = "bear";

    const _ = sel => hostElement.querySelector(sel);

    // Chuyển sang màn hình câu hỏi
    _('#btn-start')?.addEventListener('click', () => {
        _('#v-setup').classList.add('hidden');
        _('#v-quiz').classList.remove('hidden');
        currQ = 0;
        renderQ();
    });

    _('#btn-prev')?.addEventListener('click', () => {
        if (currQ > 0) {
            currQ--;
            renderQ();
        }
    });

    _('#btn-calc')?.addEventListener('click', () => processAnalytics());

    // Đặt lại dữ liệu hoàn toàn tĩnh lặng
    _('#btn-reset')?.addEventListener('click', () => {
        _('#v-res').classList.add('hidden');
        _('#v-setup').classList.remove('hidden');
        selectedAnswers.fill(null);
        hostElement.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Thanh trượt giả lập 24h
    _('#sim-slider')?.addEventListener('input', (e) => {
        updateSimulator(parseInt(e.target.value));
    });

    // Render từng câu hỏi
    function renderQ() {
        const q = QUIZ[currQ];
        _('#q-count').textContent = `Câu ${currQ + 1} / ${QUIZ.length}`;
        _('#q-percent').textContent = `${Math.round(((currQ + 1) / QUIZ.length) * 100)}%`;
        _('#q-title').textContent = q.q;
        _('#q-bar').style.width = `${Math.round(((currQ + 1) / QUIZ.length) * 100)}%`;
        _('#btn-prev').disabled = currQ === 0;

        const optsContainer = _('#q-opts');
        optsContainer.innerHTML = "";

        q.a.forEach((opt) => {
            const isSelected = selectedAnswers[currQ] && JSON.stringify(selectedAnswers[currQ]) === JSON.stringify(opt.s);
            
            const item = document.createElement('div');
            item.className = `p-3.5 rounded-[16px] border transition-all cursor-pointer flex items-center gap-3 ${
                isSelected 
                ? 'bg-accent-theme-alpha border-accent-theme text-zinc-900 dark:text-white shadow-sm'
                : 'bg-[#f2f2f7] dark:bg-black/40 border-black/[0.04] dark:border-white/[0.06] hover:bg-black/5 dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200'
            }`;

            item.innerHTML = `
                <div class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-accent-theme bg-accent-theme' : 'border-zinc-400'
                }">
                    ${isSelected ? '<div class="w-1.5 h-1.5 rounded-full bg-white"></div>' : ''}
                </div>
                <span class="text-xs font-medium leading-relaxed">${opt.t}</span>
            `;

            item.onclick = () => {
                selectedAnswers[currQ] = opt.s;
                setTimeout(() => {
                    if (currQ < QUIZ.length - 1) {
                        currQ++;
                        renderQ();
                    } else {
                        renderReviewList();
                    }
                }, 120);
            };

            optsContainer.appendChild(item);
        });
    }

    // Render danh sách tổng kết
    function renderReviewList() {
        _('#v-quiz').classList.add('hidden');
        _('#v-review').classList.remove('hidden');

        const list = _('#review-list');
        list.innerHTML = "";

        QUIZ.forEach((q, idx) => {
            const ansObj = selectedAnswers[idx];
            let ansText = "Chưa chọn";
            if (ansObj) {
                const opt = q.a.find(o => JSON.stringify(o.s) === JSON.stringify(ansObj));
                if (opt) ansText = opt.t;
            }

            const row = document.createElement('div');
            row.className = "flex justify-between items-start p-3 bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] border border-black/[0.04] dark:border-white/[0.06] gap-3";
            row.innerHTML = `
                <div class="space-y-0.5 pr-2">
                    <p class="text-[11px] font-bold text-zinc-900 dark:text-white">C${idx + 1}: ${q.q}</p>
                    <p class="text-[11px] text-zinc-500 dark:text-zinc-400">${ansText}</p>
                </div>
                <button class="btn-edit text-[10px] font-semibold text-accent-theme hover:underline px-2 py-1 shrink-0">
                    Sửa
                </button>
            `;

            row.querySelector('.btn-edit').onclick = () => {
                currQ = idx;
                _('#v-review').classList.add('hidden');
                _('#v-quiz').classList.remove('hidden');
                renderQ();
            };

            list.appendChild(row);
        });
    }

    // Phân tích và chỉ thông báo IslandKit ở đây
    function processAnalytics() {
        // 1. Phân loại DNA Sinh học
        let sc = { lion: 0, bear: 0, wolf: 0, dolphin: 0 };
        selectedAnswers.forEach(a => { if (a) { for (let k in a) sc[k] += a[k]; } });
        finalBioKey = sc.dolphin >= 16 ? "dolphin" : Object.keys(sc).reduce((a, b) => sc[a] > sc[b] ? a : b);
        const bio = SIM_DB[finalBioKey];

        // 2. Thu thập data thực tế
        const wVal = _('#i-wake').value || "07:00";
        const sVal = _('#i-sleep').value || "23:30";
        const [wH, wM] = wVal.split(':').map(Number);
        const [sH, sM] = sVal.split(':').map(Number);

        let end = wH * 60 + wM, start = sH * 60 + sM;
        if (end < start) end += 24 * 60;
        const sleepMins = end - start;

        // 3. Social Jetlag & Điểm CAS
        const optWakes = { lion: 5.5, bear: 7.5, wolf: 9.5, dolphin: 6.5 };
        const jetlag = Math.abs((wH + wM / 60) - optWakes[finalBioKey]);
        let cas = Math.max(10, Math.min(100, Math.round(100 - (jetlag * 15) - (sleepMins < 360 ? 15 : 0))));

        // 4. Update Header Metrics
        _('#r-icon').textContent = bio.icon;
        _('#r-name').textContent = bio.name;
        _('#r-jetlag').textContent = jetlag.toFixed(1);
        _('#r-cas-val').textContent = `${cas}%`;
        
        const casBar = _('#r-cas-bar');
        casBar.style.width = `${cas}%`;
        casBar.className = `h-full rounded-full transition-all duration-1000 ${
            cas >= 80 ? 'bg-accent-theme' : cas >= 50 ? 'bg-amber-500' : 'bg-rose-500'
        }`;

        _('#r-jetlag-box').className = `text-xl font-black ${jetlag > 1.5 ? 'text-rose-500' : 'text-accent-theme'}`;

        // 5. Dual Chart (6 mốc)
        let barsHTML = "";
        const repHours = [0, 4, 8, 12, 16, 20];
        repHours.forEach((h, i) => {
            const bioVal = bio.curve[h];
            let shift = Math.round((wH + wM / 60) - optWakes[finalBioKey]);
            let realIdx = (h - shift + 24) % 24;
            let realVal = bio.curve[realIdx] || 20;

            barsHTML += `
                <div class="flex flex-col items-center flex-1 group">
                    <div class="w-full flex items-end justify-center gap-1 h-28 mb-1.5">
                        <div class="w-2.5 bg-accent-theme rounded-t-[4px] transition-all duration-500" style="height: ${bioVal}%" title="Gốc: ${bioVal}%"></div>
                        <div class="w-2.5 bg-rose-500 rounded-t-[4px] transition-all duration-500" style="height: ${realVal}%" title="Thực tế: ${realVal}%"></div>
                    </div>
                    <span class="text-[9px] font-mono text-zinc-400">${LABELS[i]}</span>
                </div>
            `;
        });
        _('#dual-bars').innerHTML = barsHTML;

        // 6. Chu kỳ giấc ngủ 90 phút
        let isRisk = (sleepMins % 90 > 20 && sleepMins % 90 < 70);
        _('#sleep-txt').innerHTML = `Đang ngủ <b>${(sleepMins / 60).toFixed(1)}h</b> (${(sleepMins / 90).toFixed(1)} chu kỳ). ${
            isRisk 
            ? '<span class="text-rose-500 font-semibold block mt-1">Báo thức rơi vào vùng ngủ sâu (Deep Sleep), dễ gây mệt mỏi!</span>' 
            : '<span class="text-accent-theme font-semibold block mt-1">Giờ thức dậy khớp điểm kết thúc chu kỳ sinh lý tự nhiên.</span>'
        }`;

        let sleepSlotsHTML = "";
        [4, 5, 6].forEach(cyc => {
            let totalM = start + (cyc * 90) + 14;
            if (totalM >= 24 * 60) totalM -= 24 * 60;
            sleepSlotsHTML += `
                <div class="flex-1 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] py-2 px-1.5 rounded-[14px] text-center">
                    <div class="text-xs font-bold font-mono text-zinc-900 dark:text-white">
                        ${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}
                    </div>
                    <div class="text-[9px] text-zinc-400">${cyc} chu kỳ</div>
                </div>
            `;
        });
        _('#sleep-slots').innerHTML = sleepSlotsHTML;

        // 7. Chuyển sang màn hình kết quả
        _('#v-review').classList.add('hidden');
        _('#v-res').classList.remove('hidden');
        _('#sim-slider').value = 10;
        updateSimulator(10);

        hostElement.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });

        // DUY NHẤT 1 THÔNG BÁO TỔNG KẾT
        IslandKit.notify('Hoàn tất phân tích', `Nhóm sinh học: ${bio.name}`, 'success');
    }

    // Bộ giả lập 24h
    function updateSimulator(hour) {
        _('#sim-time-lbl').textContent = `${String(hour).padStart(2, '0')}:00`;
        const metrics = SIM_DB[finalBioKey];

        _('#s-foc-val').textContent = `${metrics.foc[hour]}%`;
        _('#s-foc-bar').style.width = `${metrics.foc[hour]}%`;

        _('#s-eng-val').textContent = `${metrics.eng[hour]}%`;
        _('#s-eng-bar').style.width = `${metrics.eng[hour]}%`;

        _('#s-met-val').textContent = `${metrics.met[hour]}%`;
        _('#s-met-bar').style.width = `${metrics.met[hour]}%`;

        _('#s-slp-val').textContent = `${metrics.slp[hour]}%`;
        _('#s-slp-bar').style.width = `${metrics.slp[hour]}%`;
    }
}