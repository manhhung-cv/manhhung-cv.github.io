import { UI } from '../../js/ui.js';

// ==========================================
// 1. DATABASE & THUẬT TOÁN (CORE ENGINE PUBLIC)
// ==========================================
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

// Dữ liệu mô phỏng 24h (Mỗi array 24 phần tử, từ 00:00 -> 23:00)
const SIM_DB = {
    lion: { 
        name: "Sư Tử (Lion)", 
        icon: "🦁", 
        // Đỉnh cao 8h-11h sáng, sụt mạnh sau 13h, sập nguồn từ 21h. Ngủ sâu từ 22h-4h.
        curve: [5,5,5,10,30,65,85,95,100,100,90,75,55,40,35,40,45,40,30,20,10,5,5,5], 
        foc:   [5,5,5,5,20,60,85,95,100,100,95,70,50,30,25,35,40,35,20,10,5,5,5,5], 
        eng:   [5,5,5,15,40,70,90,100,100,95,85,75,55,40,35,45,50,40,30,15,10,5,5,5], 
        slp:   [95,95,100,95,80,45,15,5,5,5,10,25,45,60,65,55,50,60,75,85,90,95,95,95] 
    },
    bear: { 
        name: "Gấu (Bear)", 
        icon: "🐻", 
        // Chu kỳ theo mặt trời: dậy 7h, đỉnh 10h-14h, sụt nhẹ lúc 15h, tỉnh lại tối, ngủ từ 23h.
        curve: [5,5,5,5,5,15,40,65,85,95,100,100,95,85,65,60,70,75,65,50,35,20,10,5], 
        foc:   [5,5,5,5,5,10,30,60,80,95,100,100,90,75,55,50,65,70,60,40,25,15,5,5], 
        eng:   [5,5,5,5,5,15,35,65,85,90,95,100,95,80,60,65,75,80,70,55,40,20,10,5], 
        slp:   [95,100,100,100,90,75,45,20,5,5,5,5,10,25,40,45,35,25,40,60,75,85,90,95] 
    },
    wolf: { 
        name: "Sói (Wolf)", 
        icon: "🐺", 
        // Sáng lờ đờ, đỉnh nhẹ 12h-14h, đỉnh cao nhất bùng nổ từ 19h-23h đêm. Ngủ muộn sau 1h-2h sáng.
        curve: [45,30,15,5,5,5,10,20,30,45,55,65,75,70,60,65,75,85,95,100,100,95,85,65], 
        foc:   [50,35,15,5,5,5,5,10,20,35,50,65,75,70,55,60,70,80,95,100,100,90,80,60], 
        eng:   [40,25,10,5,5,5,10,20,35,45,60,70,80,75,65,70,80,90,100,100,95,90,85,65], 
        slp:   [45,65,80,95,100,100,90,75,60,45,35,20,15,20,35,30,20,15,5,5,5,10,20,35] 
    },
    dolphin:{ 
        name: "Cá Heo (Dolphin)", 
        icon: "🐬", 
        // Tỉnh táo thất thường, hay mệt mỏi ban ngày, tối não bộ bị kích thích mạnh gây khó ngủ.
        curve: [35,25,20,15,20,35,50,60,65,75,85,80,70,65,70,75,70,75,85,80,65,55,45,40], 
        foc:   [30,20,15,10,15,30,45,55,65,80,90,85,65,60,65,70,65,75,85,75,60,45,35,30], 
        eng:   [35,25,15,15,20,35,50,60,70,75,85,80,75,65,70,75,70,75,80,80,65,50,40,35], 
        slp:   [60,70,75,80,75,55,40,30,20,15,10,15,25,35,30,25,30,25,20,30,45,50,55,60] 
    }
};
const LABELS = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

// ==========================================
// 2. GIAO DIỆN (UI TEMPLATE)
// ==========================================
export function template() {
    return `
        <style>
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; }
            
            .rad-premium { appearance: none; width: 22px; height: 22px; border: 2px solid #d4d4d8; border-radius: 50%; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
            .dark .rad-premium { border-color: #3f3f46; }
            .rad-premium:checked { border-color: #18181b; border-width: 6px; }
            .dark .rad-premium:checked { border-color: #fff; border-width: 6px; }

            .ui-fade-in { animation: fadeIn 0.4s forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

            .chart-col { display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 140px; position: relative; }
            .bar-bio { width: 14px; border-radius: 3px 3px 0 0; background: #10b981; transition: height 0.5s ease; }
            .bar-real { width: 14px; border-radius: 3px 3px 0 0; background: #f43f5e; transition: height 0.5s ease; }
            
            /* Range Custom */
            .flat-range { -webkit-appearance: none; width: 100%; height: 6px; background: #e4e4e7; border-radius: 4px; outline: none; }
            .dark .flat-range { background: #27272a; }
            .flat-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #18181b; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .dark .flat-range::-webkit-slider-thumb { background: #fff; border-color: #18181b; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            <div class="mb-6 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1">Chronotype Master</h2>
                <p class="text-[12px] text-zinc-500 font-medium">Đo lường nhịp sinh học, giả lập trạng thái 24h & thiết kế giấc ngủ triệt tiêu mệt mỏi.</p>
            </div>

            <div id="v-setup" class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 md:p-8 ui-fade-in">
                <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-5">1. Tham số sinh hoạt thực tế</h3>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-1 ring-zinc-900 dark:ring-white">
                        <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Giờ thức dậy hằng ngày</label>
                        <input type="time" id="i-wake" value="07:00" class="w-full bg-transparent border-none outline-none text-base font-black text-zinc-900 dark:text-white p-0">
                    </div>
                    <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-1 ring-zinc-900 dark:ring-white">
                        <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Giờ lên giường đi ngủ</label>
                        <input type="time" id="i-sleep" value="23:30" class="w-full bg-transparent border-none outline-none text-base font-black text-zinc-900 dark:text-white p-0">
                    </div>
                </div>
                <button id="btn-start" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2">Bắt đầu Trắc nghiệm (15 Câu) <i class="fas fa-arrow-right text-xs"></i></button>
            </div>

            <div id="v-quiz" class="hidden ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 md:p-8 ui-fade-in">
                <div class="flex flex-col sm:flex-row justify-between sm:items-end mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest" id="q-count">Câu 1/15</span>
                        <h4 class="text-sm md:text-base font-black text-zinc-900 dark:text-white mt-1 leading-relaxed" id="q-title">Question?</h4>
                    </div>
                    <div class="w-full sm:w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0"><div id="q-bar" class="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-300" style="width:0%"></div></div>
                </div>
                <div id="q-opts" class="space-y-2 min-h-[200px]"></div>
                <div class="mt-4 pt-4 flex">
                    <button id="btn-prev" class="btn-premium px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold text-xs"><i class="fas fa-arrow-left mr-1"></i> Quay lại</button>
                </div>
            </div>

            <div id="v-review" class="hidden ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 md:p-8 ui-fade-in">
                <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Tổng Kết Trắc Nghiệm (Có thể sửa đổi)</h3>
                <div class="max-h-[350px] overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-6" id="review-list">
                    </div>
                <button id="btn-calc" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2"><i class="fas fa-microchip"></i> Xử Lý Dữ Liệu Phân Tích</button>
            </div>

            <div id="v-res" class="hidden space-y-4 ui-fade-in">
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-3xl ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-4">
                        <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Chronotype Gốc</span>
                        <div class="flex items-center gap-2"><span class="text-2xl" id="r-icon">🦁</span><span class="text-sm font-black text-zinc-900 dark:text-white" id="r-name">-</span></div>
                    </div>
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-3xl ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-4">
                        <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Social Jetlag (Lệch pha)</span>
                        <div class="text-xl font-black text-rose-500"><span id="r-jetlag">0.0</span> <span class="text-[10px] text-zinc-500 uppercase">Giờ</span></div>
                    </div>
                    <div class="col-span-2 ui-block bg-white dark:bg-[#0c0c0e] rounded-3xl ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-4 relative overflow-hidden flex flex-col justify-center">
                        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                        <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block relative z-10">Độ Đồng Bộ Sinh Học (CAS)</span>
                        <div class="flex items-center gap-3 relative z-10">
                            <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden"><div id="r-cas-bar" class="h-full bg-emerald-500 transition-all duration-1000" style="width: 0%"></div></div>
                            <span class="text-lg font-black text-emerald-500 shrink-0" id="r-cas-val">0%</span>
                        </div>
                    </div>
                </div>

                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-white mb-1"><i class="fas fa-sliders-h text-zinc-400 mr-1"></i> Bộ Giả Lập Trạng Thái Cơ Thể</h3>
                    <p class="text-[10px] text-zinc-500 mb-4">Kéo thanh trượt để xem 4 chỉ số sinh lý thay đổi theo từng khung giờ trong ngày.</p>
                    
                    <div class="bg-zinc-50 dark:bg-[#121214]/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Thời gian quét:</span>
                            <span class="text-lg font-black text-zinc-900 dark:text-white" id="sim-time-lbl">10:00</span>
                        </div>
                        <input type="range" id="sim-slider" min="0" max="23" value="10" class="flat-range w-full">
                        <div class="flex justify-between text-[8px] font-bold text-zinc-400 mt-1 px-1"><span>00:00</span><span>12:00</span><span>23:00</span></div>
                    </div>

                    <div class="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <div class="flex justify-between text-[10px] font-bold mb-1"><span class="text-zinc-500">Tập trung trí não</span><span class="text-zinc-900 dark:text-white" id="s-foc-val">0%</span></div>
                            <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div id="s-foc-bar" class="h-full bg-indigo-500 transition-all duration-300"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-[10px] font-bold mb-1"><span class="text-zinc-500">Năng lượng thể chất</span><span class="text-zinc-900 dark:text-white" id="s-eng-val">0%</span></div>
                            <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div id="s-eng-bar" class="h-full bg-emerald-500 transition-all duration-300"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-[10px] font-bold mb-1"><span class="text-zinc-500">Tốc độ trao đổi chất</span><span class="text-zinc-900 dark:text-white" id="s-met-val">0%</span></div>
                            <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div id="s-met-bar" class="h-full bg-amber-500 transition-all duration-300"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-[10px] font-bold mb-1"><span class="text-zinc-500">Áp lực ngủ (Melatonin)</span><span class="text-zinc-900 dark:text-white" id="s-slp-val">0%</span></div>
                            <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div id="s-slp-bar" class="h-full bg-slate-500 transition-all duration-300"></div></div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-5">
                        <div class="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                            <h3 class="text-xs font-bold text-zinc-900 dark:text-white">Biểu đồ Năng Lượng (6 mốc)</h3>
                            <div class="flex gap-2 text-[8px] font-bold uppercase"><span class="text-emerald-500">Gốc</span> vs <span class="text-rose-500">Thực Tế</span></div>
                        </div>
                        <div class="w-full flex justify-between items-end px-2" id="dual-bars"></div>
                    </div>
                    
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-5 flex flex-col">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-white mb-2"><i class="fas fa-bed text-indigo-500 mr-1"></i> Tối ưu Giấc Ngủ (90 phút/Chu kỳ)</h3>
                        <p class="text-[10px] text-zinc-500 mb-4 leading-relaxed" id="sleep-txt">Đang phân tích...</p>
                        <div class="mt-auto">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase mb-2 block">Các Khung Giờ Báo Thức Khuyên Dùng:</span>
                            <div class="flex flex-wrap gap-2" id="sleep-slots"></div>
                        </div>
                    </div>
                </div>

                <div class="pt-2"><button id="btn-reset" class="btn-premium w-full md:w-auto md:px-8 py-3 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs block"><i class="fas fa-redo-alt"></i> Phân tích lại từ đầu</button></div>
            </div>
        </div>
    `;
}

// ==========================================
// 3. LOGIC XỬ LÝ (JS INIT)
// ==========================================
export function init() {
    let currQ = 0;
    let selectedAnswers = new Array(QUIZ.length).fill(null); // Lưu đáp án
    let finalBioKey = "bear"; 

    const _ = id => document.getElementById(id);
    
    // Nút điều hướng chính
    _('btn-start').onclick = () => { _('v-setup').classList.add('hidden'); _('v-quiz').classList.remove('hidden'); currQ = 0; renderQ(); };
    _('btn-prev').onclick = () => { if (currQ > 0) { currQ--; renderQ(); } };
    _('btn-calc').onclick = () => processAnalytics();
    _('btn-reset').onclick = () => { _('v-res').classList.add('hidden'); _('v-setup').classList.remove('hidden'); selectedAnswers.fill(null); window.scrollTo(0, 0); };

    // Slider Giả lập trạng thái
    _('sim-slider').oninput = (e) => updateSimulator(parseInt(e.target.value));

    function renderQ() {
        const q = QUIZ[currQ];
        _('q-count').innerText = `Câu ${currQ + 1} / ${QUIZ.length}`;
        _('q-title').innerText = q.q;
        _('q-bar').style.width = `${Math.round(((currQ + 1) / QUIZ.length) * 100)}%`;
        _('btn-prev').disabled = currQ === 0;

        _('q-opts').innerHTML = "";
        q.a.forEach((opt, i) => {
            const isSelected = selectedAnswers[currQ] && JSON.stringify(selectedAnswers[currQ]) === JSON.stringify(opt.s);
            const lbl = document.createElement('label');
            lbl.className = `flex items-center gap-3 p-4 rounded-xl border ${isSelected ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800' : 'border-zinc-200 dark:border-zinc-800'} cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ui-fade-in group`;
            lbl.style.animationDelay = `${i * 20}ms`;
            lbl.innerHTML = `<input type="radio" name="ch-rad" class="rad-premium" ${isSelected ? 'checked' : ''}><span class="text-xs font-semibold ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'} group-hover:text-zinc-900 dark:group-hover:text-white leading-relaxed">${opt.t}</span>`;
            
            lbl.querySelector('input').onchange = () => setTimeout(() => {
                selectedAnswers[currQ] = opt.s;
                if (currQ < QUIZ.length - 1) { 
                    currQ++; 
                    renderQ(); 
                } else { 
                    renderReviewList(); // Xong 15 câu thì mở bảng Review
                }
            }, 150);
            _('q-opts').appendChild(lbl);
        });
    }

    function renderReviewList() {
        _('v-quiz').classList.add('hidden');
        _('v-review').classList.remove('hidden');
        
        const list = _('review-list');
        list.innerHTML = "";
        
        QUIZ.forEach((q, idx) => {
            const ansObj = selectedAnswers[idx];
            let ansText = "Chưa chọn";
            if (ansObj) {
                const opt = q.a.find(o => JSON.stringify(o.s) === JSON.stringify(ansObj));
                if (opt) ansText = opt.t;
            }

            const item = document.createElement('div');
            item.className = "flex justify-between items-start p-3 bg-zinc-50 dark:bg-[#121214]/50 rounded-xl border border-zinc-100 dark:border-zinc-800";
            item.innerHTML = `
                <div class="pr-4">
                    <p class="text-[10px] font-bold text-zinc-900 dark:text-white mb-1">C${idx+1}: ${q.q}</p>
                    <p class="text-[10px] text-zinc-500">${ansText}</p>
                </div>
                <button class="btn-edit text-[9px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg shrink-0">Sửa</button>
            `;
            
            // Nút sửa đưa về lại màn hình câu hỏi tương ứng
            item.querySelector('.btn-edit').onclick = () => {
                currQ = idx;
                _('v-review').classList.add('hidden');
                _('v-quiz').classList.remove('hidden');
                renderQ();
            };
            list.appendChild(item);
        });
    }

    function processAnalytics() {
        // 1. Phân loại DNA Sinh học
        let sc = { lion: 0, bear: 0, wolf: 0, dolphin: 0 };
        selectedAnswers.forEach(a => { if(a) { for (let k in a) sc[k] += a[k]; } });
        finalBioKey = sc.dolphin >= 16 ? "dolphin" : Object.keys(sc).reduce((a, b) => sc[a] > sc[b] ? a : b);
        const bio = SIM_DB[finalBioKey];

        // 2. Thu thập Data Thực tế
        const wH = +_('i-wake').value.split(':')[0], wM = +_('i-wake').value.split(':')[1];
        const sH = +_('i-sleep').value.split(':')[0], sM = +_('i-sleep').value.split(':')[1];

        let end = wH * 60 + wM, start = sH * 60 + sM;
        if (end < start) end += 24 * 60;
        const sleepMins = end - start;

        // 3. Tính Social Jetlag & Điểm CAS
        const optWakes = { lion: 5.5, bear: 7.5, wolf: 9.5, dolphin: 6.5 };
        const jetlag = Math.abs((wH + wM/60) - optWakes[finalBioKey]);
        let cas = Math.max(10, Math.min(100, Math.round(100 - (jetlag * 15) - (sleepMins < 360 ? 15 : 0))));

        // 4. Update KPI
        _('r-icon').innerText = bio.icon;
        _('r-name').innerText = bio.name;
        _('r-jetlag').innerText = jetlag.toFixed(1);
        _('r-cas-val').innerText = `${cas}%`;
        setTimeout(() => { _('r-cas-bar').style.width = `${cas}%`; }, 300);
        
        let cClass = cas >= 80 ? 'bg-emerald-500' : cas >= 50 ? 'bg-amber-500' : 'bg-rose-500';
        let tClass = cas >= 80 ? 'text-emerald-500' : cas >= 50 ? 'text-amber-500' : 'text-rose-500';
        _('r-cas-bar').className = `h-full transition-all duration-1000 ${cClass}`;
        _('r-cas-val').className = `text-lg font-black shrink-0 ${tClass}`;
        _('r-jetlag').className = `text-xl font-black ${jetlag > 1.5 ? 'text-rose-500' : 'text-emerald-500'}`;

        // 5. Dual Chart (Lấy 6 mốc đại diện để hiển thị gọn)
        let barsHTML = "";
        const repHours = [0, 4, 8, 12, 16, 20]; 
        repHours.forEach((h, i) => {
            const bioVal = bio.curve[h];
            let shift = Math.round((wH + wM/60) - optWakes[finalBioKey]);
            let realIdx = h - shift;
            if(realIdx < 0) realIdx += 24;
            if(realIdx >= 24) realIdx -= 24;
            let realVal = bio.curve[realIdx] || 20;

            barsHTML += `
                <div class="flex flex-col items-center group relative flex-1">
                    <div class="absolute -top-7 opacity-0 group-hover:opacity-100 text-[9px] font-black z-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">Gốc: ${bioVal}% | Sống: ${realVal}%</div>
                    <div class="chart-col w-full max-w-[24px] mb-1">
                        <div class="bar-bio" style="height: ${bioVal}%"></div><div class="bar-real" style="height: ${realVal}%"></div>
                    </div>
                    <span class="text-[8px] font-bold text-zinc-400">${LABELS[i]}</span>
                </div>`;
        });
        _('dual-bars').innerHTML = barsHTML;

        // 6. Tối ưu Giấc ngủ 90 phút (+ 14 phút đi vào giấc)
        let isRisk = (sleepMins % 90 > 20 && sleepMins % 90 < 70);
        _('sleep-txt').innerHTML = `Đang ngủ <b>${(sleepMins/60).toFixed(1)}h</b> (${(sleepMins/90).toFixed(1)} chu kỳ). ${isRisk ? '<span class="text-rose-500">Báo thức đang rơi vào vùng ngủ sâu (Deep Sleep), dễ gây đau đầu rã rời khi dậy!</span>' : 'Báo thức khá khớp điểm kết thúc chu kỳ sinh lý (Không bị sương mù não).'}`;
        
        let sleepSlotsHTML = "";
        [4, 5, 6].forEach(cyc => { // Các mốc khuyên dùng: 6h, 7.5h, 9h
            let totalM = start + (cyc * 90) + 14;
            if (totalM >= 24 * 60) totalM -= 24 * 60;
            sleepSlotsHTML += `
                <div class="bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 px-3 py-1.5 rounded-xl text-center flex-1">
                    <div class="text-xs font-black text-zinc-900 dark:text-white">${String(Math.floor(totalM/60)).padStart(2,'0')}:${String(totalM%60).padStart(2,'0')}</div>
                    <div class="text-[8px] font-bold text-zinc-500">${cyc} Chu kỳ</div>
                </div>`;
        });
        _('sleep-slots').innerHTML = sleepSlotsHTML;

        // 7. Chuyển UI & Kích hoạt giả lập
        _('v-review').classList.add('hidden');
        _('v-res').classList.remove('hidden');
        _('sim-slider').value = 10;
        updateSimulator(10);
        
        window.scrollTo(0, 0);
        if(typeof UI !== 'undefined' && UI.showAlert) UI.showAlert('Tính toán xong', 'Hồ sơ 24h đã sẵn sàng.', 'success');
    }

    // Hàm cập nhật Bộ giả lập 24h
    function updateSimulator(hour) {
        _('sim-time-lbl').innerText = `${String(hour).padStart(2, '0')}:00`;
        const metrics = SIM_DB[finalBioKey];
        
        _('s-foc-val').innerText = `${metrics.foc[hour]}%`;
        _('s-foc-bar').style.width = `${metrics.foc[hour]}%`;
        
        _('s-eng-val').innerText = `${metrics.eng[hour]}%`;
        _('s-eng-bar').style.width = `${metrics.eng[hour]}%`;
        
        _('s-met-val').innerText = `${metrics.met[hour]}%`;
        _('s-met-bar').style.width = `${metrics.met[hour]}%`;
        
        _('s-slp-val').innerText = `${metrics.slp[hour]}%`;
        _('s-slp-bar').style.width = `${metrics.slp[hour]}%`;
    }
}