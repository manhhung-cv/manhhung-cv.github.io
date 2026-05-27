import { UI } from '../../js/ui.js';

// --- BỘ CÂU HỎI TIÊU CHUẨN CỦA CHRONOTYPE (PHÙ HỢP CHO MỌI ĐỐI TƯỢNG) ---
const STANDARDIZED_QUIZ = [
    { id: 1, title: "Nếu có tiếng động nhỏ hoặc ánh sáng lọt vào phòng ngủ ban đêm, phản ứng của bạn là:",
      options: [
        { text: "Bừng tỉnh ngay lập tức, thính ngủ và rất trằn trọc để ngủ lại", score: { dolphin: 4 } },
        { text: "Có nhận biết lơ mơ nhưng dễ dàng chìm vào giấc ngủ lại", score: { bear: 3 } },
        { text: "Tùy thuộc vào việc lúc đó là nửa đêm hay đã gần sáng", score: { wolf: 3 } },
        { text: "Ngủ rất say, gần như không biết gì cho đến sáng", score: { lion: 4, bear: 1 } }
      ] },
    { id: 2, title: "Khi đặt lưng xuống giường sau một ngày dài, trạng thái tâm trí bạn thường:",
      options: [
        { text: "Thư giãn, trống rỗng và sập nguồn, chìm vào giấc ngủ rất nhanh", score: { lion: 4, bear: 1 } },
        { text: "Suy nghĩ vẩn vơ một chút về các sự kiện trong ngày rồi ngủ", score: { bear: 4 } },
        { text: "Tỉnh táo hẳn lên, nhiều ý tưởng xuất hiện hoặc muốn lướt điện thoại", score: { wolf: 4, dolphin: 1 } },
        { text: "Liên tục lo lắng, căng thẳng, rà soát lại các lỗi lầm hoặc sợ mất ngủ", score: { dolphin: 4 } }
      ] },
    { id: 3, title: "Tần suất thức giấc giữa đêm (gián đoạn giấc ngủ) của bạn như thế nào?",
      options: [
        { text: "Gần như đêm nào cũng tỉnh giấc ít nhất 1-2 lần và khó ngủ lại", score: { dolphin: 4 } },
        { text: "Tôi thức rất khuya nên khi đã ngủ thì ít khi bị tỉnh giữa chừng", score: { wolf: 3 } },
        { text: "Thỉnh thoảng tỉnh giấc theo nhu cầu sinh lý rồi lại ngủ tiếp ngay", score: { bear: 4 } },
        { text: "Hiếm khi, tôi luôn ngủ một mạch trọn vẹn từ đêm tới sáng", score: { lion: 4, bear: 1 } }
      ] },
    { id: 4, title: "Xu hướng tính cách nổi bật nhất của bạn trong đời sống và công việc là:",
      options: [
        { text: "Tính kỷ luật cao, thích lên kế hoạch chi tiết và hoàn thành việc từ sớm", score: { lion: 4, bear: 1 } },
        { text: "Coi trọng sự cân bằng, hòa đồng, thích làm việc theo quy trình ổn định", score: { bear: 4 } },
        { text: "Sáng tạo, thích tự do, có xu hướng làm việc theo cảm hứng bộc phát", score: { wolf: 4 } },
        { text: "Chủ nghĩa hoàn hảo, cực kỳ chi tiết, hay lo xa và dễ bị căng thẳng", score: { dolphin: 4 } }
      ] },
    { id: 5, title: "Khi rơi vào trạng thái áp lực lớn hoặc stress, thói quen ăn uống của bạn ra sao?",
      options: [
        { text: "Vẫn cố gắng ăn uống đúng giờ, đủ bữa để bảo toàn năng lượng", score: { lion: 4, bear: 1 } },
        { text: "Thèm ăn các món ngọt, đồ ăn vặt hoặc đồ nhiều dầu mỡ", score: { bear: 4, wolf: 1 } },
        { text: "Có xu hướng ăn rất nhiều vào ban đêm hoặc ăn muộn", score: { wolf: 4 } },
        { text: "Chán ăn hoàn toàn, cồn cào ruột gan hoặc hay quên bữa", score: { dolphin: 4 } }
      ] },
    { id: 6, title: "Nếu không có bất kỳ ràng buộc nào về công việc/học tập, bạn muốn dậy lúc mấy giờ?",
      options: [
        { text: "Trước 6:00 sáng", score: { lion: 4 } },
        { text: "Từ 6:30 đến 8:00 sáng", score: { bear: 4, lion: 1 } },
        { text: "Từ 8:30 đến 10:30 sáng hoặc muộn hơn", score: { wolf: 4 } },
        { text: "Không cố định, xáo trộn tùy thuộc vào chất lượng giấc ngủ đêm trước", score: { dolphin: 3, wolf: 1 } }
      ] },
    { id: 7, title: "Trạng thái cơ thể và tinh thần của bạn trong 30-45 phút đầu tiên sau khi thức dậy:",
      options: [
        { text: "Tỉnh táo 100%, tràn đầy năng lượng và có thể làm việc nặng được ngay", score: { lion: 4, bear: 1 } },
        { text: "Hơi lờ đờ, cần một chút thời gian khởi động hoặc uống nước để tỉnh táo", score: { bear: 4 } },
        { text: "Cực kỳ uể oải, kiệt sức, có cảm giác cáu gắt nếu phải dậy sớm", score: { wolf: 4 } },
        { text: "Mệt mỏi về thể chất nhưng trí não đã lập tức căng thẳng suy nghĩ", score: { dolphin: 4 } }
      ] },
    { id: 8, title: "Vào khoảng thời gian đầu giờ chiều (tầm 14:00), cơ thể bạn thường thế nào?",
      options: [
        { text: "Năng lượng sụt giảm mạnh, bắt đầu thấy mệt mỏi rõ rệt", score: { lion: 4, bear: 1 } },
        { text: "Buồn ngủ dữ dội, rất thèm hoặc bắt buộc phải chợp mắt một lúc", score: { bear: 4 } },
        { text: "Hoàn toàn bình thường, phong độ trí não vẫn đang lên từ từ", score: { wolf: 4, dolphin: 1 } },
        { text: "Khá tỉnh táo do cơ thể đã vượt qua trạng thái mệt mỏi ban sáng", score: { dolphin: 3 } }
      ] },
    { id: 9, title: "Thời điểm bạn cảm thấy tư duy sắc bén nhất để xử lý các công việc phức tạp là:",
      options: [
        { text: "Sáng sớm tinh mọc (Từ 7:00 đến 10:00 sáng)", score: { lion: 4, bear: 1 } },
        { text: "Giữa ngày (Từ 10:00 sáng đến 14:00 chiều)", score: { bear: 4 } },
        { text: "Chiều muộn đến đêm khuya (Từ 17:00 chiều đến tối mịt)", score: { wolf: 4 } },
        { text: "Phân bổ thành từng đợt ngắn, đôi khi là lúc nửa đêm", score: { dolphin: 4 } }
      ] },
    { id: 10, title: "Mức độ nhạy cảm và phụ thuộc của bạn vào chất kích thích (Trà, Cà phê):",
      options: [
        { text: "Thỉnh thoảng dùng, tôi có thể tự tỉnh táo tốt mà không cần phụ thuộc", score: { lion: 4, bear: 1 } },
        { text: "Cần 1-2 ly cố định vào sáng hoặc trưa để duy trì hiệu suất", score: { bear: 4 } },
        { text: "Cần lượng lớn vào ban sáng để tỉnh, nhưng chiều tối lại tự bật năng lượng", score: { wolf: 4 } },
        { text: "Cực kỳ nhạy cảm, uống vào dễ bị cồn cào, tim đập nhanh và mất ngủ", score: { dolphin: 4 } }
      ] },
    { id: 11, title: "Nếu bắt buộc phải xử lý một công việc khẩn cấp kéo dài từ 22:00 đêm đến rạng sáng:",
      options: [
        { text: "Bất khả thi, cơ thể tôi đã cạn kiệt và sập nguồn hoàn toàn", score: { lion: 4, bear: 1 } },
        { text: "Có thể gượng được nhưng đầu óc mệt mỏi, phản xạ rất chậm", score: { bear: 4 } },
        { text: "Xử lý được nhưng hệ thần kinh sẽ bị kích thích mạnh, gây mất ngủ sau đó", score: { dolphin: 4 } },
        { text: "Rất thoải mái, đây là khung giờ tôi hoạt động thăng hoa nhất", score: { wolf: 4 } }
      ] },
    { id: 12, title: "Cơn đói và nhu cầu nạp năng lượng của bạn xuất hiện mạnh nhất vào lúc nào?",
      options: [
        { text: "Ngay khi vừa thức dậy, bữa sáng là bắt buộc đối với tôi", score: { lion: 4, bear: 1 } },
        { text: "Rõ rệt vào giữa trưa và đầu buổi tối (Theo đúng nhịp sinh hoạt chung)", score: { bear: 4 } },
        { text: "Sáng và trưa ăn rất ít, nhưng tối muộn và đêm lại cực kỳ thèm ăn", score: { wolf: 4 } },
        { text: "Thất thường, đôi khi tập trung làm việc quên luôn cả cảm giác đói", score: { dolphin: 4 } }
      ] },
    { id: 13, title: "Vào ngày nghỉ cuối tuần, thói quen ngủ của bạn so với ngày thường thay đổi ra sao?",
      options: [
        { text: "Hầu như không đổi, đồng hồ sinh học của tôi cực kỳ cứng nhắc", score: { lion: 4, bear: 1 } },
        { text: "Thức khuya hơn một chút và dậy muộn hơn tầm 1 tiếng", score: { bear: 4 } },
        { text: "Ngủ nướng bù đến tận trưa hoặc chiều để giải tỏa mệt mỏi", score: { wolf: 4 } },
        { text: "Vẫn khó ngủ và thức giấc sớm, không cải thiện được thời gian ngủ", score: { dolphin: 4 } }
      ] },
    { id: 14, title: "Thời lượng giấc ngủ khiến bạn cảm thấy thỏa mãn và khỏe khoắn nhất là:",
      options: [
        { text: "Chỉ cần 6 - 7 tiếng, ngủ nhiều hơn làm cơ thể tôi bị nặng nề, nhức đầu", score: { lion: 4, dolphin: 1 } },
        { text: "Bắt buộc phải đủ 8 tiếng, thiếu một chút là ngày hôm sau uể oải ngay", score: { bear: 4 } },
        { text: "Có thể ngủ liên tục 9 - 10 tiếng nếu không bị ai gọi dậy", score: { wolf: 4 } },
        { text: "Rất hiếm khi ngủ được trọn vẹn một mạch dài mà không bị đứt đoạn", score: { dolphin: 4 } }
      ] },
    { id: 15, title: "Vấn đề lớn nhất về năng lượng bạn đang muốn giải quyết hiện tại là gì?",
      options: [
        { text: "Tìm cách tối ưu hóa hiệu suất làm việc để trở nên vượt trội", score: { lion: 3, bear: 1 } },
        { text: "Xây dựng lịch trình sinh hoạt cân bằng, bảo vệ sức khỏe lâu dài", score: { bear: 4 } },
        { text: "Tìm hiểu lý do tại sao tôi luôn kiệt sức và mất tập trung ban sáng", score: { wolf: 4 } },
        { text: "Khắc phục tình trạng lo âu, ngủ chập chờn và thường xuyên mệt mỏi", score: { dolphin: 4 } }
      ] }
];

const CHRONO_DB = {
    lion: { name: "Sư Tử (Lion)", icon: "🦁", desc: "Dậy sớm bẩm sinh, năng lượng bùng nổ mạnh mẽ vào bình minh và sụt giảm nhanh sau khi hoàng hôn buông xuống.", curve: [40, 80, 100, 90, 70, 50, 30, 15, 5, 5, 10, 20], metrics: { focus: [10, 40, 95, 100, 80, 50, 30, 20, 5, 5, 5, 5], energy: [30, 85, 100, 90, 70, 60, 40, 25, 10, 5, 5, 10], metabolism: [10, 50, 90, 85, 80, 60, 40, 20, 10, 5, 5, 5], sleep: [90, 40, 5, 5, 10, 25, 45, 65, 85, 95, 100, 95] } },
    bear: { name: "Gấu (Bear)", icon: "🐻", desc: "Hoạt động chuẩn xác theo chu kỳ mặt trời. Đạt đỉnh phong độ vào giữa sáng và có vùng trũng mệt mỏi đầu giờ chiều.", curve: [10, 40, 85, 100, 75, 55, 65, 75, 45, 20, 5, 5], metrics: { focus: [5, 20, 75, 100, 80, 50, 65, 75, 50, 25, 10, 5], energy: [10, 45, 85, 95, 70, 55, 70, 80, 45, 20, 5, 5], metabolism: [5, 20, 60, 90, 85, 70, 60, 50, 30, 15, 5, 5], sleep: [95, 60, 10, 5, 15, 35, 40, 50, 70, 85, 95, 100] } },
    wolf: { name: "Sói (Wolf)", icon: "🐺", desc: "Cú đêm chính hiệu. Năng lượng tăng tiến rất chậm vào buổi sáng nhưng bùng nổ cực hạn sau 18:00 tối.", curve: [5, 5, 20, 45, 65, 80, 95, 100, 80, 60, 40, 15], metrics: { focus: [5, 5, 15, 45, 60, 75, 95, 100, 85, 65, 40, 15], energy: [5, 10, 25, 50, 65, 80, 90, 100, 75, 55, 35, 15], metabolism: [5, 5, 15, 35, 65, 85, 90, 80, 60, 45, 25, 10], sleep: [100, 90, 70, 45, 25, 10, 5, 5, 20, 45, 70, 90] } },
    dolphin: { name: "Cá Heo (Dolphin)", icon: "🐬", desc: "Hệ thần kinh nhạy cảm, giấc ngủ nông và dễ lo âu. Năng lượng phân bổ thành từng đợt sóng ngắn.", curve: [20, 45, 70, 50, 80, 55, 75, 50, 60, 30, 15, 10], metrics: { focus: [15, 35, 75, 50, 85, 55, 80, 45, 60, 30, 15, 10], energy: [20, 50, 65, 50, 75, 60, 70, 50, 55, 30, 15, 10], metabolism: [10, 30, 60, 65, 80, 70, 60, 45, 30, 15, 10, 10], sleep: [85, 65, 35, 25, 20, 35, 40, 55, 70, 85, 90, 90] } }
};

export function template() {
    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; }
            
            .rad-premium { appearance: none; width: 20px; height: 20px; border: 2px solid #d4d4d8; border-radius: 50%; position: relative; cursor: pointer; transition: all 0.2s; background: transparent; flex-shrink: 0; }
            .dark .rad-premium { border-color: #3f3f46; }
            .rad-premium:checked { border-color: #18181b; border-width: 6px; }
            .dark .rad-premium:checked { border-color: #fff; border-width: 6px; }

            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }

            /* Grid Chart Bars */
            .dual-chart-col { display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 160px; position: relative; }
            .bar-biological { width: 12px; border-radius: 3px 3px 0 0; background: #10b981; transition: height 0.5s ease; }
            .bar-lifestyle { width: 12px; border-radius: 3px 3px 0 0; background: #f43f5e; transition: height 0.5s ease; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[650px] pb-10">
            
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Chronotype & Sleep Optimizer</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Hệ thống phân tích đồng hồ sinh học chuẩn y khoa và cấu trúc giấc ngủ theo chu kỳ sinh học.</p>
            </div>

            <div id="view-setup" class="space-y-6 ui-fade-in">
                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 md:p-8">
                    <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-6">1. Bản đồ thời gian thực tế của bạn</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-all">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Giờ bạn thức dậy thực tế vào ngày làm việc</label>
                            <input type="time" id="input-wake" value="06:30" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 cursor-pointer">
                        </div>
                        <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-1 ring-zinc-900 dark:ring-white transition-all">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Giờ bạn lên giường đi ngủ hằng đêm</label>
                            <input type="time" id="input-sleep" value="23:30" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 cursor-pointer">
                        </div>
                    </div>

                    <button id="btn-go-quiz" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                        Bắt đầu bài kiểm tra chuẩn (15 câu) <i class="fas fa-list-ol text-xs"></i>
                    </button>
                </div>
            </div>

            <div id="view-quiz" class="hidden ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 md:p-8 ui-fade-in">
                <div class="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                    <div>
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest" id="quiz-step-label">Câu hỏi 1 / 15</span>
                        <h4 class="text-base font-black text-zinc-900 dark:text-white mt-1" id="quiz-question-text">Đang tải câu hỏi...</h4>
                    </div>
                    <span class="text-xs font-black text-zinc-400 shrink-0 ml-4" id="quiz-percent">0%</span>
                </div>

                <div id="quiz-options-slot" class="space-y-3 min-h-[200px]"></div>

                <div class="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
                    <button id="btn-quiz-back" class="btn-premium px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold text-xs flex items-center gap-2">
                        <i class="fas fa-arrow-left text-[10px]"></i> Câu trước
                    </button>
                    <span class="text-[10px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">Biological Rhythms Scale</span>
                </div>
            </div>

            <div id="view-result" class="hidden space-y-6 ui-fade-in">
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-emerald-500/20 p-6 flex flex-col items-center text-center relative overflow-hidden">
                        <div class="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
                        <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Chronotype Gốc (DNA)</span>
                        <div class="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-2xl mb-2" id="lbl-bio-icon">🐻</div>
                        <h4 class="text-base font-black text-zinc-900 dark:text-white" id="lbl-bio-name">-</h4>
                        <p class="text-[11px] font-medium text-zinc-400 mt-2 leading-relaxed" id="lbl-bio-desc">-</p>
                    </div>

                    <div class="flex flex-col justify-center items-center text-center p-4">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Mức độ lệch pha xã hội</span>
                        <div class="text-2xl font-black text-zinc-900 dark:text-white"><span id="lbl-jetlag-hours">0.0</span> Giờ</div>
                        <div class="w-full h-px bg-zinc-100 dark:bg-zinc-800/80 my-3"></div>
                        <p class="text-[11px] font-bold" id="lbl-jetlag-status">-</p>
                    </div>

                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-rose-500/20 p-6 flex flex-col items-center text-center relative overflow-hidden">
                        <div class="absolute top-0 inset-x-0 h-1 bg-rose-500"></div>
                        <span class="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-3">Nhịp Sinh Hoạt Thực Tế</span>
                        <div class="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-2xl mb-2" id="lbl-real-icon">🐺</div>
                        <h4 class="text-base font-black text-zinc-900 dark:text-white" id="lbl-real-name">-</h4>
                        <p class="text-[11px] font-medium text-zinc-400 mt-2 leading-relaxed" id="lbl-real-desc">-</p>
                    </div>
                </div>

                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 class="text-sm font-bold text-zinc-900 dark:text-white">Bản đồ xung đột năng lượng 24h</h3>
                            <p class="text-[11px] text-zinc-400 mt-0.5">Xác định các điểm gãy năng lượng khi cơ thể bị ép hoạt động lệch múi giờ sinh học.</p>
                        </div>
                        <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider shrink-0">
                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span><span class="text-zinc-500">Nhịp Gốc</span></div>
                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span><span class="text-zinc-500">Nhịp Sống</span></div>
                        </div>
                    </div>

                    <div class="w-full overflow-x-auto hide-scrollbar">
                        <div class="min-w-[650px] flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800 pb-2 px-2" id="chart-bars-slot"></div>
                    </div>
                </div>

                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                    <div class="mb-4">
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-white">2. Bộ giả lập chỉ số cơ thể 24h</h3>
                        <p class="text-[11px] text-zinc-400 mt-0.5">Kéo thanh trượt để quét và kiểm tra phản ứng sinh học của các cơ quan nội tạng tại mốc giờ đó.</p>
                    </div>

                    <div class="bg-zinc-50 dark:bg-[#121214]/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Thời gian quét giả lập:</span>
                            <span class="text-xl font-black text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 px-3 py-0.5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700" id="lbl-sim-time">10:00</span>
                        </div>
                        <input type="range" id="slider-sim-time" min="0" max="23" value="10" class="flat-range">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-[11px] font-bold mb-1"><span class="text-zinc-500">Độ tập trung trí não</span><span id="val-sim-focus">0%</span></div>
                                <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div id="bar-sim-focus" class="bg-zinc-900 dark:bg-white h-full rounded-full" style="width: 0%"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between text-[11px] font-bold mb-1"><span class="text-zinc-500">Năng lượng thể chất</span><span id="val-sim-energy">0%</span></div>
                                <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div id="bar-sim-energy" class="bg-zinc-900 dark:bg-white h-full rounded-full" style="width: 0%"></div></div>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-[11px] font-bold mb-1"><span class="text-zinc-500">Tốc độ trao đổi chất / Tiêu hóa</span><span id="val-sim-metabolism">0%</span></div>
                                <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div id="bar-sim-metabolism" class="bg-zinc-900 dark:bg-white h-full rounded-full" style="width: 0%"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between text-[11px] font-bold mb-1"><span class="text-zinc-500">Áp lực ngủ (Tích tụ Melatonin)</span><span id="val-sim-sleep">0%</span></div>
                                <div class="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div id="bar-sim-sleep" class="bg-zinc-900 dark:bg-white h-full rounded-full" style="width: 0%"></div></div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-[#121214]/50 border border-zinc-100 dark:border-zinc-800 text-xs font-medium text-zinc-500 leading-relaxed" id="lbl-sim-coach"></div>
                </div>

                <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                    <div class="flex items-center gap-2.5 mb-4">
                        <div class="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs"><i class="fas fa-bed"></i></div>
                        <h4 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Giải pháp tối ưu giấc ngủ (Triệt tiêu mệt mỏi)</h4>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div class="space-y-2">
                            <h5 class="font-bold text-zinc-800 dark:text-zinc-200">Phân tích cấu trúc giấc ngủ hiện tại:</h5>
                            <p class="text-xs text-zinc-500 leading-relaxed" id="lbl-sleep-analysis">Đang tính toán...</p>
                        </div>
                        <div class="space-y-2">
                            <h5 class="font-bold text-zinc-800 dark:text-zinc-200">Khung giờ thức dậy tối ưu (Dựa trên chu kỳ 90 phút):</h5>
                            <div class="flex flex-wrap gap-2" id="slot-sleep-suggestions"></div>
                            <p class="text-[11px] text-zinc-400 mt-1 italic">Lưu ý: Đã cộng thêm 14 phút trung bình để cơ thể chính thức chìm vào giấc ngủ sâu.</p>
                        </div>
                    </div>
                </div>

                <div class="pt-2 flex justify-center">
                    <button id="btn-reset-tool" class="btn-premium px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center gap-2">
                        <i class="fas fa-redo-alt text-[10px]"></i> Tiến hành đo lường lại từ đầu
                    </button>
                </div>
            </div>

        </div>
    `;
}

export function init() {
    let activeQuestionIdx = 0;
    let userQuizAnswers = [];

    // Mapping Views
    const viewSetup = document.getElementById('view-setup');
    const viewQuiz = document.getElementById('view-quiz');
    const viewResult = document.getElementById('view-result');

    // Mapping Controls
    const btnGoQuiz = document.getElementById('btn-go-quiz');
    const btnQuizBack = document.getElementById('btn-quiz-back');
    const btnResetTool = document.getElementById('btn-reset-tool');
    const sliderSimTime = document.getElementById('slider-sim-time');

    // Wizard Nodes
    const quizStepLabel = document.getElementById('quiz-step-label');
    const quizQuestionText = document.getElementById('quiz-question-text');
    const quizPercent = document.getElementById('quiz-percent');
    const quizOptionsSlot = document.getElementById('quiz-options-slot');

    if (btnGoQuiz) {
        btnGoQuiz.onclick = () => {
            viewSetup.classList.add('hidden');
            viewQuiz.classList.remove('hidden');
            activeQuestionIdx = 0;
            userQuizAnswers = [];
            renderQuizStep();
        };
    }

    if (btnQuizBack) {
        btnQuizBack.onclick = () => {
            if (activeQuestionIdx > 0) {
                activeQuestionIdx--;
                userQuizAnswers.pop();
                renderQuizStep();
            }
        };
    }

    if (btnResetTool) {
        btnResetTool.onclick = () => {
            viewResult.classList.add('hidden');
            viewSetup.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    if (sliderSimTime) {
        sliderSimTime.oninput = (e) => {
            updateLiveSimulation(parseInt(e.target.value));
        };
    }

    // --- RENDER WIZARD FLOW ---
    function renderQuizStep() {
        const q = STANDARDIZED_QUIZ[activeQuestionIdx];
        const total = STANDARDIZED_QUIZ.length;
        const completePercent = Math.round(((activeQuestionIdx + 1) / total) * 100);

        if (quizStepLabel) quizStepLabel.innerText = `Câu hỏi ${activeQuestionIdx + 1} / ${total}`;
        if (quizQuestionText) quizQuestionText.innerText = q.title;
        if (quizPercent) quizPercent.innerText = `${completePercent}%`;
        if (btnQuizBack) btnQuizBack.disabled = (activeQuestionIdx === 0);

        if (quizOptionsSlot) {
            quizOptionsSlot.innerHTML = "";
            q.options.forEach((opt, idx) => {
                const row = document.createElement('label');
                row.className = "flex items-center gap-3.5 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ui-fade-in group";
                row.style.animationDelay = `${idx * 30}ms`;

                row.innerHTML = `
                    <input type="radio" name="chrono-opt" class="rad-premium">
                    <span class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">${opt.text}</span>
                `;

                row.querySelector('input').onchange = () => {
                    setTimeout(() => {
                        userQuizAnswers.push(opt.score);
                        if (activeQuestionIdx < total - 1) {
                            activeQuestionIdx++;
                            renderQuizStep();
                        } else {
                            processBiometricCalculation();
                        }
                    }, 150);
                };

                quizOptionsSlot.appendChild(row);
            });
        }
    }

    // --- BIOMETRIC & SLEEP ENGINE CALCULATION ---
    function processBiometricCalculation() {
        let finalScores = { lion: 0, bear: 0, wolf: 0, dolphin: 0 };
        userQuizAnswers.forEach(ans => {
            for (let type in ans) {
                finalScores[type] += ans[type];
            }
        });

        // Thuật toán phân tầng chuẩn lâm sàng: Lọc nhóm Cá Heo trước
        let bioKey = "bear";
        if (finalScores.dolphin >= 16) {
            bioKey = "dolphin";
        } else {
            const triad = { lion: finalScores.lion, bear: finalScores.bear, wolf: finalScores.wolf };
            bioKey = Object.keys(triad).reduce((a, b) => triad[a] > triad[b] ? a : b);
        }

        // Đọc dữ liệu cài đặt lịch trình thực tế
        const wakeTimeStr = document.getElementById('input-wake').value;
        const sleepTimeStr = document.getElementById('input-sleep').value;
        
        const wakeH = parseInt(wakeTimeStr.split(':')[0]);
        const wakeM = parseInt(wakeTimeStr.split(':')[1]);
        const sleepH = parseInt(sleepTimeStr.split(':')[0]);
        const sleepM = parseInt(sleepTimeStr.split(':')[1]);

        // Tính tổng thời gian ngủ thực tế bằng phút
        let startMinutes = sleepH * 60 + sleepM;
        let endMinutes = wakeH * 60 + wakeM;
        if (endMinutes < startMinutes) endMinutes += 24 * 60; // Bù cung giờ qua đêm
        const totalSleepDurationMin = endMinutes - startMinutes;

        // Phân loại Lifestyle Type thực tế dựa trên mốc thời gian cứng
        let realKey = "bear";
        if (wakeH < 6) realKey = "lion";
        else if (wakeH >= 9 || sleepH === 0 || sleepH > 1) realKey = "wolf";
        if (totalSleepDurationMin < 360) realKey = "dolphin"; // Ngủ quá ít, hệ thần kinh kiệt quệ

        // Tính toán Social Jetlag
        const optimalWakeMatrix = { lion: 5.5, bear: 7.5, wolf: 9.5, dolphin: 6.5 };
        const jetlagDelta = Math.abs((wakeH + wakeM/60) - optimalWakeMatrix[bioKey]).toFixed(1);

        // --- BẮT ĐẦU RENDER DASHBOARD ---
        window.calculatedBioKey = bioKey; // Lưu biến tạm phục vụ bộ giả lập slider
        const bioProf = CHRONO_DB[bioKey];
        const realProf = CHRONO_DB[realKey];

        document.getElementById('lbl-bio-icon').innerText = bioProf.icon;
        document.getElementById('lbl-bio-name').innerText = bioProf.name;
        document.getElementById('lbl-bio-desc').innerText = bioProf.desc;

        document.getElementById('lbl-real-icon').innerText = realProf.icon;
        document.getElementById('lbl-real-name').innerText = realProf.name;
        
        let realText = `Lịch trình thực tế đang ép cơ thể chạy theo nhịp sinh hoạt hệ ${realProf.name}.`;
        if (bioKey !== realKey) realText += " Sự bất đối xứng này tạo áp lực lớn lên tế bào não.";
        document.getElementById('lbl-real-desc').innerText = realText;

        document.getElementById('lbl-jetlag-hours').innerText = jetlagDelta;
        const jetlagStatus = document.getElementById('lbl-jetlag-status');
        if (jetlagDelta > 1.5) {
            jetlagStatus.innerText = "Lệch pha sinh lý nghiêm trọng";
            jetlagStatus.className = "text-[11px] font-black text-rose-500 uppercase tracking-wider";
        } else {
            jetlagStatus.innerText = "Trạng thái thích nghi an toàn";
            jetlagStatus.className = "text-[11px] font-black text-emerald-500 uppercase tracking-wider";
        }

        // Render Bars Chart Kép
        const chartSlot = document.getElementById('chart-bars-slot');
        if (chartSlot) {
            chartSlot.innerHTML = "";
            TIME_LABELS.forEach((timeLabel, index) => {
                let biologicalVal = bioProf.curve[index] || 10;
                
                // Giả lập đường cong thực tế bị tịnh tiến dựa theo độ lệch giờ thức dậy
                let shift = Math.round((wakeH + wakeM/60) - optimalWakeMatrix[bioKey]);
                let virtualIdx = index - Math.floor(shift / 2);
                let lifestyleVal = 15;
                if (virtualIdx >= 0 && virtualIdx < realProf.curve.length) {
                    lifestyleVal = realProf.curve[virtualIdx];
                }

                chartSlot.insertAdjacentHTML('beforeend', `
                    <div class="flex flex-col items-center group relative flex-1">
                        <div class="absolute -top-7 opacity-0 group-hover:opacity-100 text-[9px] font-black transition-opacity whitespace-nowrap z-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-1.5 py-0.5 rounded shadow-sm">
                            Gốc: ${biologicalVal}% | Sống: ${lifestyleVal}%
                        </div>
                        <div class="dual-chart-col w-full max-w-[32px] mb-2">
                            <div class="bar-biological" style="height: ${biologicalVal}%"></div>
                            <div class="bar-lifestyle" style="height: ${lifestyleVal}%"></div>
                        </div>
                        <span class="text-[9px] font-bold text-zinc-400 tracking-tighter">${timeLabel}</span>
                    </div>
                `);
            });
        }

        // --- THUẬT TOÁN TỐI ƯU HÓA GIẤC NGỦ CHU KỲ 90 PHÚT ---
        const sleepAnalysisEl = document.getElementById('lbl-sleep-analysis');
        const suggestionsSlot = document.getElementById('slot-sleep-suggestions');
        
        const currentCycles = (totalSleepDurationMin / 90).toFixed(1);
        const isInteriaRisk = (totalSleepDurationMin % 90 > 20 && totalSleepDurationMin % 90 < 70);

        let analysisNotes = `Bạn đang ngủ tổng cộng <b>${(totalSleepDurationMin/60).toFixed(1)} tiếng</b> (Tương đương khoảng <b>${currentCycles} chu kỳ</b>). `;
        if (isInteriaRisk) {
            analysisNotes += `Báo thức của bạn đang đặt rơi đúng vào <i>giai đoạn Giấc ngủ sâu (Deep Sleep)</i>. Đây là lý do chính gây ra hiện tượng <b>Quán tính giấc ngủ (Sleep Inertia)</b>, khiến bạn thức dậy bị đau đầu, mệt mỏi rã rời dù ngủ nhiều tiếng.`;
        } else {
            analysisNotes += `Thời điểm báo thức khá sát với điểm kết thúc chu kỳ. Hiện tượng uể oải đầu ngày của bạn chủ yếu do độ lệch sinh lý xã hội gây nên chứ không phải do cấu trúc giấc ngủ.`;
        }
        sleepAnalysisEl.innerHTML = analysisNotes;

        // Tính toán các mốc thức dậy tối ưu từ giờ đi ngủ
        if (suggestionsSlot) {
            suggestionsSlot.innerHTML = "";
            const cycleOptions = [4, 5, 6]; // Khuyên dùng 4 chu kỳ (6 tiếng), 5 chu kỳ (7.5 tiếng) hoặc 6 chu kỳ (9 tiếng)
            
            cycleOptions.forEach(cycles => {
                const targetDurationMin = (cycles * 90) + 14; // Cộng 14 phút ngủ loãng
                let suggestionMinutes = (sleepH * 60 + sleepM) + targetDurationMin;
                if (suggestionMinutes >= 24 * 60) suggestionMinutes -= 24 * 60;

                const finalH = Math.floor(suggestionMinutes / 60).toString().padStart(2, '0');
                const finalM = (suggestionMinutes % 60).toString().padStart(2, '0');

                suggestionsSlot.insertAdjacentHTML('beforeend', `
                    <div class="bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700 px-3 py-2 rounded-xl text-center min-w-[90px]">
                        <div class="text-xs font-black text-zinc-900 dark:text-white">${finalH}:${finalM}</div>
                        <div class="text-[9px] font-bold text-zinc-400 mt-0.5">${cycles} Chu kỳ (${(targetDurationMin/60).toFixed(1)}h)</div>
                    </div>
                `);
            });
        }

        // Kích hoạt view kết quả, đồng bộ mốc slider lúc 10h sáng
        viewQuiz.classList.add('hidden');
        viewResult.classList.remove('hidden');
        if (sliderSimTime) sliderSimTime.value = 10;
        updateLiveSimulation(10);

        if (typeof UI !== 'undefined' && UI.showAlert) {
            UI.showAlert('Tính toán xong', 'Hệ thống đã cập nhật giải pháp tối ưu cơ thể.', 'success');
        }
    }

    // --- BỘ GIẢ LẬP TRẠNG THÁI CƠ THỂ 24H LIVE SIMULATOR ---
    function updateLiveSimulation(hour) {
        document.getElementById('lbl-sim-time').innerText = `${hour.toString().padStart(2, '0')}:00`;
        
        const activeKey = window.calculatedBioKey || "bear";
        const prof = CHRONO_DB[activeKey];
        if (!prof || !prof.metrics) return;

        // Lấy thông số từ ma trận dữ liệu
        const focus = prof.metrics.focus[hour];
        const energy = prof.metrics.energy[hour];
        const metabolism = prof.metrics.metabolism[hour];
        const sleep = prof.metrics.sleep[hour];

        // Cập nhật thanh giao diện UI Kit
        document.getElementById('val-sim-focus').innerText = `${focus}%`;
        document.getElementById('bar-sim-focus').style.width = `${focus}%`;
        document.getElementById('val-sim-energy').innerText = `${energy}%`;
        document.getElementById('bar-sim-energy').style.width = `${energy}%`;
        document.getElementById('val-sim-metabolism').innerText = `${metabolism}%`;
        document.getElementById('bar-sim-metabolism').style.width = `${metabolism}%`;
        document.getElementById('val-sim-sleep').innerText = `${sleep}%`;
        document.getElementById('bar-sim-sleep').style.width = `${sleep}%`;

        // Tạo chuỗi phân tích huấn luyện viên động
        let coachMessage = "";
        if (sleep > 85) {
            coachMessage = `Cơ thể đang tràn ngập Melatonin. Nhiệt độ lõi cơ thể hạ xuống thấp nhất. Hệ thần kinh chuyển dịch hoàn toàn vào trạng thái đóng băng để dọn dẹp độc tố tế bào. Tuyệt đối không nạp thức ăn hay tiếp xúc màn hình.`;
        } else if (focus >= 95) {
            coachMessage = `Trạng thái đỉnh cao tư duy siêu cấp (Hyper-focus)! Cortisol đạt ngưỡng lý tưởng, năng lượng tinh thần sắc bén nhất. Thích hợp để bẻ gãy các vấn đề kiến trúc khó, học kiến thức mới hoặc giải quyết công việc áp lực cao.`;
        } else if (energy >= 90 && metabolism >= 75) {
            coachMessage = `Thể lực dồi dào, sức bền cơ bắp đạt đỉnh và hệ tiêu hóa vận hành mạnh mẽ nhất. Đây là mốc thời gian vàng để vận động cường độ cao, tập thể thao hoặc nạp bữa ăn chính có hàm lượng dinh dưỡng cao nhất.`;
        } else if (energy <= 55 && sleep > 25 && sleep < 60) {
            coachMessage = `Vùng trũng suy giảm sinh lý thường niên. Sức bền sụt giảm, não bộ phát tín hiệu mệt mỏi nhẹ. Tránh xử lý việc quan trọng, không nên ép não làm việc. Hãy đứng dậy đi tản bộ 10 phút hoặc uống một cốc nước ấm.`;
        } else {
            coachMessage = `Trạng thái hoạt động ổn định ổn định. Hệ thần kinh sẵn sàng cho các công việc giao tiếp xã hội, hội họp, lên kế hoạch tổng quan hoặc dọn dẹp hệ thống dữ liệu nhẹ nhàng.`;
        }

        document.getElementById('lbl-sim-coach').innerHTML = `<b>Phân tích trạng thái lúc ${hour}h:</b> ${coachMessage}`;
    }
}