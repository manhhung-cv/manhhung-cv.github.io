import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            /* Kế thừa toàn bộ style từ UI Kit */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            .rad-premium { appearance: none; width: 22px; height: 22px; border: 2px solid #d4d4d8; border-radius: 50%; position: relative; cursor: pointer; transition: all 0.2s; background: transparent; flex-shrink: 0; }
            .dark .rad-premium { border-color: #3f3f46; }
            .rad-premium:checked { border-color: #18181b; border-width: 6px; }
            .dark .rad-premium:checked { border-color: #fff; border-width: 6px; }

            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

            /* Format số tiền Input */
            .input-money { font-variant-numeric: tabular-nums; }
            
            /* Modal Animation & Styles */
            .modal-overlay { opacity: 0; pointer-events: none; transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .modal-overlay.active { opacity: 1; pointer-events: auto; }
            .modal-content { transform: scale(0.95) translateY(10px); opacity: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .modal-overlay.active .modal-content { transform: scale(1) translateY(0); opacity: 1; }
            
            /* Typography cho nội dung Vùng */
            .region-content { font-size: 13px; line-height: 1.6; }
            .region-content b { display: block; font-size: 14px; margin-top: 16px; margin-bottom: 4px; color: #18181b; font-weight: 900; }
            .dark .region-content b { color: #ffffff; }
            .region-content .text-primary { font-size: 15px; margin-bottom: 16px; color: #18181b; }
            .dark .region-content .text-primary { color: #fff; }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Gross/Net Calculator</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Công cụ tính toán lương chuẩn xác với giao diện Minimal Premium.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start ui-fade-in" style="animation-delay: 100ms;">
                
                <!-- Bảng Nhập Liệu -->
                <div class="lg:col-span-5 space-y-6">
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Thông số tính toán</h3>
                        
                        <div class="space-y-5">
                            <!-- Thu nhập -->
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Thu nhập (VND)</label>
                                <div class="flex items-center">
                                    <input type="text" id="salary-input" class="input-money w-full bg-transparent border-none outline-none text-lg font-black text-zinc-900 dark:text-white p-0 placeholder-zinc-400" placeholder="VD: 25,000,000">
                                    <span class="text-xs font-bold text-zinc-400">VNĐ</span>
                                </div>
                            </div>

                            <!-- Mức lương đóng bảo hiểm -->
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Lương đóng bảo hiểm</label>
                                <div class="flex flex-col gap-4 mb-1">
                                    <label class="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="radio" name="ins-type" value="official" class="rad-premium" checked>
                                        <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Trên mức lương chính thức</span>
                                    </label>
                                    <label class="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="radio" name="ins-type" value="custom" class="rad-premium">
                                        <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Nhập số khác</span>
                                    </label>
                                </div>
                                <div id="custom-ins-wrapper" class="hidden mt-3 flex items-center focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all bg-white dark:bg-zinc-800/40 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700/50">
                                    <input type="text" id="custom-ins-input" class="input-money w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 placeholder-zinc-400" placeholder="Nhập mức lương đóng BH...">
                                    <span class="text-xs font-bold text-zinc-400">VNĐ</span>
                                </div>
                            </div>

                            <!-- Người phụ thuộc -->
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Số người phụ thuộc</label>
                                <div class="flex items-center">
                                    <input type="number" id="dependents-input" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 placeholder-zinc-400" min="0" value="0">
                                    <span class="text-xs font-bold text-zinc-400">Người</span>
                                </div>
                            </div>

                            <!-- Vùng -->
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4">
                                <div class="flex items-center justify-between mb-4">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vùng áp dụng</label>
                                    <button id="btn-open-regions" class="btn-premium text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                        <i class="fas fa-info-circle"></i> Tra cứu khu vực
                                    </button>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <label class="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="radio" name="region" value="1" class="rad-premium" checked>
                                        <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Vùng I</span>
                                    </label>
                                    <label class="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="radio" name="region" value="2" class="rad-premium">
                                        <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Vùng II</span>
                                    </label>
                                    <label class="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="radio" name="region" value="3" class="rad-premium">
                                        <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Vùng III</span>
                                    </label>
                                    <label class="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="radio" name="region" value="4" class="rad-premium">
                                        <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Vùng IV</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-3 pt-2">
                                <button id="btn-calc-net" class="btn-premium flex-1 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20 dark:shadow-white/10">
                                    Gross <i class="fas fa-arrow-right"></i> Net
                                </button>
                                <button id="btn-calc-gross" class="btn-premium flex-1 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#121214] text-zinc-900 dark:text-white font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    Net <i class="fas fa-arrow-right"></i> Gross
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bảng Kết Quả -->
                <div class="lg:col-span-7 space-y-6">
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 h-full flex flex-col">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Chi tiết diễn giải</h3>
                        
                        <div id="result-placeholder" class="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <i class="fas fa-money-check-alt text-4xl text-zinc-300 dark:text-zinc-700 mb-3"></i>
                            <p class="text-sm font-medium text-zinc-500">Nhập thông tin và chọn công thức tính để xem kết quả.</p>
                        </div>

                        <div id="result-content" class="hidden flex-1 flex-col animate-in fade-in">
                            <!-- Tổng quan -->
                            <div class="flex gap-4 mb-6 p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <div class="flex-1">
                                    <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Lương Gross</div>
                                    <div id="res-gross" class="text-xl font-black text-zinc-900 dark:text-white input-money">0</div>
                                </div>
                                <div class="w-px bg-zinc-200 dark:bg-zinc-700"></div>
                                <div class="flex-1 text-right">
                                    <div class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Lương Net</div>
                                    <div id="res-net" class="text-xl font-black text-emerald-600 dark:text-emerald-400 input-money">0</div>
                                </div>
                            </div>

                            <!-- Bảng Breakdown -->
                            <div class="w-full overflow-x-auto custom-scrollbar border border-zinc-200 dark:border-zinc-800 rounded-2xl flex-1">
                                <table class="w-full text-left border-collapse">
                                    <tbody class="text-sm font-medium text-zinc-700 dark:text-zinc-300 divide-y divide-zinc-200 dark:divide-zinc-800">
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td class="p-3 pl-4">Bảo hiểm xã hội (8%)</td>
                                            <td class="p-3 pr-4 text-right input-money text-red-500" id="res-bhxh">- 0</td>
                                        </tr>
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td class="p-3 pl-4">Bảo hiểm y tế (1.5%)</td>
                                            <td class="p-3 pr-4 text-right input-money text-red-500" id="res-bhyt">- 0</td>
                                        </tr>
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td class="p-3 pl-4">Bảo hiểm thất nghiệp (1%)</td>
                                            <td class="p-3 pr-4 text-right input-money text-red-500" id="res-bhtn">- 0</td>
                                        </tr>
                                        <tr class="bg-zinc-50 dark:bg-zinc-800/20">
                                            <td class="p-3 pl-4 font-bold">Thu nhập trước thuế</td>
                                            <td class="p-3 pr-4 text-right input-money font-bold text-zinc-900 dark:text-white" id="res-tntt">0</td>
                                        </tr>
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td class="p-3 pl-4">Giảm trừ gia cảnh (Bản thân)</td>
                                            <td class="p-3 pr-4 text-right input-money text-zinc-500">- 11,000,000</td>
                                        </tr>
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td class="p-3 pl-4">Giảm trừ phụ thuộc</td>
                                            <td class="p-3 pr-4 text-right input-money text-zinc-500" id="res-pt">- 0</td>
                                        </tr>
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td class="p-3 pl-4">Thuế thu nhập cá nhân (TNCN)</td>
                                            <td class="p-3 pr-4 text-right input-money text-red-500" id="res-tax">- 0</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <!-- Modal Chú Thích Vùng -->
            <div id="modal-regions" class="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm p-4">
                <div class="modal-content relative w-full max-w-3xl bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 flex flex-col max-h-[85vh] shadow-2xl">
                    <div class="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
                        <h3 class="text-lg font-black text-zinc-900 dark:text-white">Chú thích Vùng áp dụng</h3>
                        <button id="btn-close-regions" class="btn-premium w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center hover:text-zinc-900 dark:hover:text-white"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="p-6 overflow-y-auto custom-scrollbar region-content text-zinc-600 dark:text-zinc-400 flex-1">
                        <!-- Content HTML tra cứu vùng -->
                        <p class="text-primary"><strong>Danh mục địa bàn cấp xã áp dụng mức lương tối thiểu (áp dụng từ 01/01/2026):</strong></p> 
                        <b>1. Thành phố Hà Nội</b><br>
                        - Vùng I, gồm các phường Hoàn Kiếm, Cửa Nam, Ba Đình, Ngọc Hà, Giảng Võ, Hai Bà Trưng, Vĩnh Tuy, Bạch Mai, Đống Đa, Kim Liên, Văn Miếu - Quốc Tử Giám, Láng, Ô Chợ Dừa, Hồng Hà, Lĩnh Nam, Hoàng Mai, Vĩnh Hưng, Tương Mai, Định Công, Hoàng Liệt, Yên Sở, Thanh Xuân, Khương Đình, Phương Liệt, Cầu Giấy, Nghĩa Đô, Yên Hoà, Tây Hồ, Phú Thượng, Tây Tựu, Phú Diễn, Xuân Đỉnh, Đông Ngạc, Thượng Cát, Từ Liêm, Xuân Phương, Tây Mỗ, Đại Mỗ, Long Biên, Bồ Đề, Việt Hưng, Phúc Lợi, Hà Đông, Dương Nội, Yên Nghĩa, Phú Lương, Kiến Hưng, Thanh Liệt, Chương Mỹ, Sơn Tây, Tùng Thiện và các xã Thanh Trì, Đại Thanh, Nam Phù, Ngọc Hồi, Thượng Phúc, Thường Tín, Chương Dương, Hồng Vân, Phú Xuyên, Thanh Oai, Bình Minh, Tam Hưng, Dân Hòa, Phú Nghĩa, Xuân Mai, Trần Phú, Hoà Phú, Quảng Bị, Yên Bài, Đoài Phương, Thạch Thất, Hạ Bằng, Tây Phương, Hoà Lạc, Yên Xuân, Quốc Oai, Hưng Đạo, Kiều Phú, Phú Cát, Hoài Đức, Dương Hoà, Sơn Đồng, An Khánh, Gia Lâm, Thuận An, Bát Tràng, Phù Đổng, Thư Lâm, Đông Anh, Phúc Thịnh, Thiên Lộc, Vĩnh Thanh, Mê Linh, Yên Lãng, Tiến Thắng, Quang Minh, Sóc Sơn, Đa Phúc, Nội Bài, Trung Giã, Kim Anh, Ô Diên, Liên Minh.<br>
                        - Vùng II, gồm các xã, phường còn lại.<br> <br> 
                        <b>2. Tỉnh Cao Bằng</b><br>
                        - Vùng III, gồm các phường Thục Phán, Nùng Trí Cao, Tân Giang.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>3. Tỉnh Tuyên Quang</b><br>
                        - Vùng III, gồm các phường Mỹ Lâm, Minh Xuân, Nông Tiến, An Tường, Bình Thuận, Hà Giang 1, Hà Giang 2 và xã Ngọc Đường.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>4. Tỉnh Điện Biên</b><br>
                        - Vùng III, gồm các phường Điện Biên Phủ, Mường Thanh và xã Mường Phăng, Nà Tấu.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>5. Tỉnh Lai Châu</b><br>
                        - Vùng III, gồm các phường Tân Phong, Đoàn Kết.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>6. Tỉnh Sơn La</b><br>
                        - Vùng III, gồm các phường Tô Hiệu, Chiềng An, Chiềng Cơi, Chiềng Sinh.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>7. Tỉnh Lào Cai</b><br>
                        - Vùng II, gồm các phường Cam Đường, Lào Cai và các xã Cốc San, Hợp Thành, Gia Phú.<br>
                        - Vùng III, gồm các phường Văn Phú, Yên Bái, Nam Cường, Âu Lâu, Sa Pa và các xã Phong Hải, Xuân Quang, Bảo Thắng, Tằng Loỏng, Mường Bo, Bản Hồ, Tả Phìn, Tả Van, Ngũ Chỉ Sơn.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>8. Tỉnh Thái Nguyên</b><br>
                        - Vùng II, gồm các phường Phan Đình Phùng, Linh Sơn, Tích Lương, Gia Sàng, Quyết Thắng, Quan Triều, Phổ Yên, Vạn Xuân, Trung Thành, Phúc Thuận, Sông Công, Bá Xuyên, Bách Quang và các xã Tân Cương, Đại Phúc, Thành Công.<br>
                        - Vùng III, gồm các phường Đức Xuân, Bắc Kạn và các xã Đại Từ, Đức Lương, Phú Thịnh, La Bằng, Phú Lạc, An Khánh, Quân Chu, Vạn Phú, Phú Xuyên, Phú Bình, Tân Thành, Điềm Thụy, Kha Sơn, Tân Khánh, Đồng Hỷ, Quang Sơn, Trại Cau, Nam Hòa, Văn Hán, Văn Lăng, Phú Lương, Vô Tranh, Yên Trạch, Hợp Thành, Phong Quang.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>9. Tỉnh Lạng Sơn</b><br>
                        - Vùng III, gồm các phường Tam Thanh, Lương Văn Tri, Kỳ Lừa, Đông Kinh.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>10. Tỉnh Quảng Ninh</b><br>
                        - Vùng I, gồm các phường An Sinh, Đông Triều, Bình Khê, Mạo Khê, Hoàng Quế, Yên Tử, Vàng Danh, Uông Bí, Đông Mai, Hiệp Hoà, Quảng Yên, Hà An, Phong Cốc, Liên Hoà, Tuần Châu, Việt Hưng, Bãi Cháy, Hà Tu, Hà Lầm, Cao Xanh, Hồng Gai, Hạ Long, Hoành Bồ, Móng Cái 1, Móng Cái 2, Móng Cái 3 và các xã Quảng La, Thống Nhất, Hải Sơn, Hải Ninh, Vĩnh Thực.<br>
                        - Vùng II, gồm các phường Mông Dương, Quang Hanh, Cẩm Phả, Cửa Ông và xã Hải Hòa.<br>
                        - Vùng III, gồm các xã Tiên Yên, Điền Xá, Đông Ngũ, Hải Lạng, Quảng Tân, Đầm Hà, Quảng Hà, Đường Hoa, Quảng Đức, Cái Chiên và đặc khu Vân Đồn.<br>
                        - Vùng IV, gồm các xã, phường và đặc khu còn lại.<br> <br> 
                        <b>11. Tỉnh Bắc Ninh</b><br>
                        - Vùng II, gồm các phường Kinh Bắc, Võ Cường, Vũ Ninh, Hạp Lĩnh, Nam Sơn, Từ Sơn, Tam Sơn, Đồng Nguyên, Phù Khê, Thuận Thành, Mão Điền, Trạm Lộ, Trí Quả, Song Liễu, Ninh Xá, Quế Võ, Phương Liễu, Nhân Hoà, Đào Viên, Bồng Lai, Tự Lan, Việt Yên, Nếnh, Vân Hà, Bắc Giang, Đa Mai, Tiền Phong, Tân An, Yên Dũng, Tân Tiến, Cảnh Thuỵ và các xã Chi Lăng, Phù Lãng, Yên Phong, Văn Môn, Tam Giang, Yên Trung, Tam Đa, Tiên Du, Liên Bão, Tân Chi, Đại Đồng, Phật Tích, Gia Bình, Nhân Thắng, Đại Lai, Cao Đức, Đông Cứu, Lương Tài, Lâm Thao, Trung Chính, Trung Kênh, Đồng Việt.<br>
                        - Vùng III, gồm các xã Lạng Giang, Mỹ Thái, Kép, Tân Dĩnh, Tiên Lục, Tân Yên, Ngọc Thiện, Nhã Nam, Phúc Hòa, Quang Trung, Hợp Thịnh, Hiệp Hòa, Hoàng Vân, Xuân Cẩm.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>12. Tỉnh Phú Thọ</b><br>
                        - Vùng II, gồm các phường Việt Trì, Nông Trang, Thanh Miếu, Vân Phú, Vĩnh Phúc, Vĩnh Yên, Phúc Yên, Xuân Hòa, Hòa Bình, Kỳ Sơn, Tân Hòa, Thống Nhất và các xã Hy Cương, Yên Lạc, Tề Lỗ, Liên Châu, Tam Hồng, Nguyệt Đức, Bình Nguyên, Xuân Lãng, Bình Xuyên, Bình Tuyền, Lương Sơn, Cao Dương, Liên Sơn, Thịnh Minh.<br>
                        - Vùng III, gồm các phường Phong Châu, Phú Thọ, Âu Cơ và các xã Lâm Thao, Xuân Lũng, Phùng Nguyên, Bản Nguyên, Phù Ninh, Dân Chủ, Phú Mỹ, Trạm Thản, Bình Phú, Thanh Ba, Quảng Yên, Hoàng Cương, Đông Thành, Chí Tiên, Liên Minh, Tam Nông, Thọ Văn, Vạn Xuân, Hiền Quan, Tam Sơn, Sông Lô, Hải Lựu, Yên Lãng, Lập Thạch, Tiên Lữ, Thái Hòa, Liên Hòa, Hợp Lý, Sơn Đông, Tam Đảo, Đại Đình, Đạo Trù, Tam Dương, Hội Thịnh, Hoàng An, Tam Dương Bắc, Vĩnh Tường, Thổ Tang, Vĩnh Hưng, Vĩnh An, Vĩnh Phú, Vĩnh Thành.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br> <br> 
                        <b>13. Thành phố Hải Phòng</b><br>
                        - Vùng I, gồm các phường Thuỷ Nguyên, Thiên Hương, Hoà Bình, Nam Triệu, Bạch Đằng, Lưu Kiếm, Lê Ích Mộc, Hồng Bàng, Hồng An, Ngô Quyền, Gia Viên, Lê Chân, An Biên, Hải An, Đông Hải, Kiến An, Phù Liễn, Nam Đồ Sơn, Đồ Sơn, Hưng Đạo, Dương Kinh, An Dương, An Hải, An Phong, Hải Dương, Lê Thanh Nghị, Việt Hoà, Thành Đông, Nam Đồng, Tân Hưng, Thạch Khôi, Tứ Minh, Ái Quốc, Chu Văn An, Chí Linh, Trần Hưng Đạo, Nguyễn Trãi, Trần Nhân Tông, Lê Đại Hành, Kinh Môn, Nguyễn Đại Năng, Trần Liễu, Bắc An Phụ, Phạm Sư Mạnh, Nhị Chiểu; các xã An Hưng, An Khánh, An Quang, An Trường, An Lão, Kiến Thuỵ, Kiến Minh, Kiến Hải, Kiến Hưng, Nghi Dương, Quyết Thắng, Tiên Lãng, Tân Minh, Tiên Minh, Chấn Hưng, Hùng Thắng, Vĩnh Bảo, Nguyễn Bỉnh Khiêm, Vĩnh Am, Vĩnh Hải, Vĩnh Hoà, Vĩnh Thuận, Vĩnh Thịnh, Việt Khê, Nam An Phụ, Nam Sách, Thái Tân, Hợp Tiến, Trần Phú, An Phú, Cẩm Giang, Cẩm Giàng, Tuệ Tĩnh, Mao Điền, Kẻ Sặt, Bình Giang, Đường An, Thượng Hồng, Gia Lộc, Yết Kiêu, Gia Phúc, Trường Tân, Tứ Kỳ, Tân Kỳ, Đại Sơn, Chí Minh, Lạc Phượng, Nguyên Giáp, Nguyễn Lương Bằng, Phú Thái, Lai Khê, An Thành, Kim Thành và đặc khu Cát Hải.<br>
                        - Vùng II, gồm các xã Thanh Hà, Hà Tây, Hà Bắc, Hà Nam, Hà Đông, Ninh Giang, Vĩnh Lại, Khúc Thừa Dụ, Tân An, Hồng Châu, Thanh Miện, Bắc Thanh Miện, Nam Thanh Miện, Hải Hưng và đặc khu Bạch Long Vĩ.<br>
                        - Vùng III, gồm các xã, phường còn lại.<br><br> 
                        <b>14. Tỉnh Hưng Yên</b><br>
                        - Vùng II, gồm các phường Phố Hiến, Sơn Nam, Hồng Châu, Mỹ Hào, Đường Hào, Thượng Hồng, Thái Bình, Trần Lãm, Trần Hưng Đạo, Trà Lý, Vũ Phúc và các xã Tân Hưng, Yên Mỹ, Việt Yên, Hoàn Long, Nguyễn Văn Linh, Như Quỳnh, Lạc Đạo, Đại Đồng, Nghĩa Trụ, Phụng Công, Văn Giang, Mễ Sở.<br>
                        - Vùng III, gồm các xã Hoàng Hoa Thám, Tiên Lữ, Tiên Hoa, Quang Hưng, Đoàn Đào, Tiên Tiến, Tống Trân, Lương Bằng, Nghĩa Dân, Hiệp Cường, Đức Hợp, Ân Thi, Xuân Trúc, Phạm Ngũ Lão, Nguyễn Trãi, Hồng Quang, Khoái Châu, Triệu Việt Vương, Việt Tiến, Chí Minh, Châu Ninh, Thái Thụy, Đông Thụy Anh, Bắc Thụy Anh, Thụy Anh, Nam Thụy Anh, Bắc Thái Ninh, Thái Ninh, Đông Thái Ninh, Nam Thái Ninh, Tây Thái Ninh, Tây Thụy Anh, Tiền Hải, Tây Tiền Hải, Ái Quốc, Đồng Châu, Đông Tiền Hải, Nam Cường, Hưng Phú, Nam Tiền Hải.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>15. Tỉnh Ninh Bình</b><br>
                        - Vùng II, gồm các phường Tây Hoa Lư, Hoa Lư, Nam Hoa Lư, Đông Hoa Lư, Nam Định, Thiên Trường, Đông A, Vị Khê, Thành Nam, Trường Thi, Hồng Quang, Mỹ Lộc.<br>
                        - Vùng III, gồm các phường Tam Điệp, Yên Sơn, Trung Sơn, Yên Thắng, Hà Nam, Phủ Lý, Phù Vân, Châu Sơn, Liêm Tuyền, Duy Tiên, Duy Tân, Đồng Văn, Duy Hà, Tiên Sơn, Lê Hồ, Nguyễn Úy, Lý Thường Kiệt, Kim Thanh, Tam Chúc, Kim Bảng và các xã Gia Viễn, Đại Hoàng, Gia Hưng, Gia Phong, Gia Vân, Gia Trấn, Yên Khánh, Khánh Nhạc, Khánh Thiện, Khánh Hội, Khánh Trung, Nam Trực, Nam Minh, Nam Đồng, Nam Ninh, Nam Hồng, Minh Tân, Hiển Khánh, Vụ Bản, Liên Minh, Ý Yên, Yên Đồng, Yên Cường, Vạn Thắng, Vũ Dương, Tân Minh, Phong Doanh, Cổ Lễ, Ninh Giang, Cát Thành, Trực Ninh, Quang Hưng, Minh Thái, Ninh Cường, Xuân Trường, Xuân Hưng, Xuân Giang, Xuân Hồng, Hải Hậu, Hải Anh, Hải Tiến, Hải Hưng, Hải An, Hải Quang, Hải Xuân, Hải Thịnh, Giao Minh, Giao Hòa, Giao Thủy, Giao Phúc, Giao Hưng, Giao Bình, Giao Ninh, Đồng Thịnh, Nghĩa Hưng, Nghĩa Sơn, Hồng Phong, Quỹ Nhất, Nghĩa Lâm, Rạng Đông.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>16. Tỉnh Thanh Hóa</b><br>
                        - Vùng II, gồm các phường Hạc Thành, Quảng Phú, Đông Quang, Đông Sơn, Đông Tiến, Hàm Rồng, Nguyệt Viên, Sầm Sơn, Nam Sầm Sơn, Bỉm Sơn, Quang Trung, Ngọc Sơn, Tân Dân, Hải Lĩnh, Tĩnh Gia, Đào Duy Từ, Hải Bình, Trúc Lâm, Nghi Sơn và các xã Trường Lâm, Các Sơn.<br>
                        - Vùng III, gồm các xã Hà Trung, Tống Sơn, Hà Long, Hoạt Giang, Lĩnh Toại, Triệu Lộc, Đông Thành, Hậu Lộc, Hoa Lộc, Vạn Lộc, Nga Sơn, Nga Thắng, Hồ Vương, Tân Tiến, Nga An, Ba Đình, Hoằng Hóa, Hoằng Tiến, Hoằng Thanh, Hoằng Lộc, Hoằng Châu, Hoằng Sơn, Hoằng Phú, Hoằng Giang, Lưu Vệ, Quảng Yên, Quảng Ngọc, Quảng Ninh, Quảng Bình, Tiên Trang, Quảng Chính, Nông Cống, Thắng Lợi, Trung Chính, Trường Văn, Thăng Bình, Tượng Lĩnh, Công Chính, Thiệu Hóa, Thiệu Quang, Thiệu Tiến, Thiệu Toán, Thiệu Trung, Yên Định, Yên Trường, Yên Phú, Quý Lộc, Yên Ninh, Định Tân, Định Hòa, Thọ Xuân, Thọ Long, Xuân Hòa, Sao Vàng, Lam Sơn, Thọ Lập, Xuân Tín, Xuân Lập, Vĩnh Lộc, Tây Đô, Biện Thượng, Triệu Sơn, Thọ Bình, Thọ Ngọc, Thọ Phú, Hợp Tiến, An Nông, Tân Ninh, Đồng Tiến.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>17. Tỉnh Nghệ An</b><br>
                        - Vùng II, gồm các phường Hoàng Mai, Tân Mai, Trường Vinh, Thành Vinh, Vinh Hưng, Vinh Phú, Vinh Lộc, Cửa Lò và các xã Hưng Nguyên, Yên Trung, Hưng Nguyên Nam, Lam Thành, Nghi Lộc, Phúc Lộc, Đông Lộc, Trung Lộc, Thần Lĩnh, Hải Lộc, Văn Kiều.<br>
                        - Vùng III, gồm các phường Quỳnh Mai, Thái Hòa, Tây Hiếu và các xã Diễn Châu, Đức Châu, Quảng Châu, Hải Châu, Tân Châu, An Châu, Minh Châu, Hùng Châu, Đô Lương, Bạch Ngọc, Văn Hiến, Bạch Hà, Thuần Trung, Lương Sơn, Vạn An, Nam Đàn, Đại Huệ, Thiên Nhẫn, Kim Liên, Nghĩa Đàn, Nghĩa Thọ, Nghĩa Lâm, Nghĩa Mai, Nghĩa Hưng, Nghĩa Khánh, Nghĩa Lộc, Quỳnh Lưu, Quỳnh Văn, Quỳnh Anh, Quỳnh Tam, Quỳnh Phú, Quỳnh Sơn, Quỳnh Thắng, Đông Hiếu, Yên Thành, Quan Thành, Hợp Minh, Vân Tụ, Vân Du, Quang Đồng, Giai Lạc, Bình Minh, Đông Thành.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>18. Tỉnh Hà Tĩnh</b><br>
                        - Vùng III, gồm các phường Sông Trí, Hải Ninh, Hoành Sơn, Vũng Áng, Thành Sen, Trần Phú, Hà Huy Tập và các xã Thạch Lạc, Đồng Tiến, Thạch Khê, Cẩm Bình, Kỳ Hoa.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>19. Tỉnh Quảng Trị</b><br>
                        - Vùng II, gồm các phường Đồng Hới, Đồng Thuận, Đồng Sơn, Đông Hà, Nam Đông Hà.<br>
                        - Vùng III, gồm các phường Quảng Trị, Ba Đồn, Bắc Gianh và các xã Nam Gianh, Nam Ba Đồn, Tân Gianh, Trung Thuần, Quảng Trạch, Hòa Trạch, Phú Trạch, Phong Nha, Bắc Trạch, Đông Trạch, Hoàn Lão, Bố Trạch, Nam Trạch, Quảng Ninh, Ninh Châu, Trường Ninh, Lệ Thủy, Cam Hồng, Sen Ngư, Tân Mỹ, Trường Phú, Lệ Ninh, Đồng Lê, Vĩnh Linh, Cửa Tùng, Bến Quan, Cửa Việt, Gio Linh, Cam Lộ, Khe Sanh, Lao Bảo, Triệu Phong, Hướng Hiệp, Diên Sanh.<br>
                        - Vùng IV, gồm các xã, phường và đặc khu còn lại.<br><br> 
                        <b>20. Thành phố Huế</b><br>
                        - Vùng II, gồm các phường Thuận An, Hóa Châu, Mỹ Thượng, Vỹ Dạ, Thuận Hóa, An Cựu, Thủy Xuân, Kim Long, Hương An, Phú Xuân, Dương Nỗ.<br>
                        - Vùng III, gồm các phường Phong Điền, Phong Thái, Phong Dinh, Phong Phú, Phong Quảng, Hương Trà, Kim Trà, Hương Thuỷ, Phú Bài, Thanh Thủy và các xã Đan Điền, Quảng Điền, Bình Điền, Phú Vinh, Phú Hồ, Phú Vang, Vinh Lộc, Hưng Lộc, Lộc An, Phú Lộc, Chân Mây - Lăng Cô, Long Quảng, Nam Đông, Khe Tre.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>21. Thành phố Đà Nẵng</b><br>
                        - Vùng II, gồm các phường Hải Châu, Hòa Cường, Thanh Khê, An Khê, An Hải, Sơn Trà, Ngũ Hành Sơn, Hòa Khánh, Hải Vân, Liên Chiểu, Cẩm Lệ, Hòa Xuân, Tam Kỳ, Quảng Phú, Hương Trà, Bàn Thạch, Hội An, Hội An Đông, Hội An Tây và các xã Hòa Vang, Hòa Tiến, Bà Nà, Tân Hiệp và đặc khu Hoàng Sa.<br>
                        - Vùng III, gồm các phường Điện Bàn, Điện Bàn Đông, An Thắng, Điện Bàn Bắc và các xã Núi Thành, Tam Mỹ, Tam Anh, Đức Phú, Tam Xuân, Tam Hải, Tây Hồ, Chiên Đàn, Phú Ninh, Thăng Bình, Thăng An, Thăng Trường, Thăng Điền, Thăng Phú, Đồng Dương, Quế Sơn Trung, Quế Sơn, Xuân Phú, Nông Sơn, Quế Phước, Duy Nghĩa, Nam Phước, Duy Xuyên, Thu Bồn, Điện Bàn Tây, Gò Nổi, Đại Lộc, Hà Nha, Thượng Đức, Vu Gia, Phú Thuận.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>22. Tỉnh Quảng Ngãi</b><br>
                        - Vùng III, gồm các phường Trương Quang Trọng, Cẩm Thành, Nghĩa Lộ, Kon Tum, Đăk Cấm, Đăk Bla và các xã Tịnh Khê, An Phú, Bình Minh, Bình Chương, Bình Sơn, Vạn Tường, Đông Sơn, Trường Giang, Ba Gia, Sơn Tịnh, Thọ Phong, Ngọk Bay, Ia Chim, Đăk Rơ Wa, Đăk Pxi, Đăk Mar, Đăk Ui, Đăk Hà, Ngọk Réo.<br>
                        - Vùng IV, gồm các xã, phường và đặc khu còn lại.<br><br> 
                        <b>23. Tỉnh Gia Lai</b><br>
                        - Vùng III, gồm các phường Quy Nhơn, Quy Nhơn Đông, Quy Nhơn Tây, Quy Nhơn Nam, Quy Nhơn Bắc, Pleiku, Hội Phú, Thống Nhất, Diên Hồng, An Phú và các xã Biển Hồ, Gào.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>24. Tỉnh Khánh Hòa</b><br>
                        - Vùng II, gồm các phường Nha Trang, Bắc Nha Trang, Tây Nha Trang, Nam Nha Trang, Bắc Cam Ranh, Cam Ranh, Cam Linh, Ba Ngòi, Ninh Hòa, Đông Ninh Hòa, Hòa Thắng, Phan Rang, Đông Hải, Ninh Chử, Bảo An, Đô Vinh và các xã Nam Cam Ranh, Bắc Ninh Hòa, Tân Định, Nam Ninh Hòa, Tây Ninh Hòa, Hòa Trí, Thuận Bắc, Công Hải.<br>
                        - Vùng III, gồm các xã Đại Lãnh, Tu Bông, Vạn Thắng, Vạn Ninh, Vạn Hưng, Diên Khánh, Diên Lạc, Diên Điền, Suối Hiệp, Diên Thọ, Diên Lâm, Cam Lâm, Suối Dầu, Cam Hiệp, Cam An, Ninh Phước, Phước Hữu, Phước Hậu, Phước Dinh, Ninh Hải, Xuân Hải, Vĩnh Hải, Ninh Sơn, Lâm Sơn, Anh Dũng, Mỹ Sơn, Thuận Nam, Cà Ná, Phước Hà.<br>
                        - Vùng IV, gồm các xã, phường và đặc khu còn lại.<br><br> 
                        <b>25. Tỉnh Đắk Lắk</b><br>
                        - Vùng III, gồm các phường Buôn Ma Thuột, Tân An, Tân Lập, Xuân Đài, Sông Cầu, Thành Nhất, Ea Kao, Tuy Hòa, Phú Yên, Bình Kiến, Đông Hòa, Hòa Hiệp và các xã Hòa Phú, Xuân Thọ, Xuân Cảnh, Xuân Lộc, Hòa Xuân.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>26. Tỉnh Lâm Đồng</b><br>
                        - Vùng II, gồm các phường Xuân Hương - Đà Lạt, Cam Ly - Đà Lạt, Lâm Viên - Đà Lạt, Xuân Trường - Đà Lạt, Lang Biang - Đà Lạt, 1 Bảo Lộc, 2 Bảo Lộc, 3 Bảo Lộc, B' Lao, Hàm Thắng, Bình Thuận, Mũi Né, Phú Thủy, Phan Thiết, Tiến Thành và xã Tuyên Quang.<br>
                        - Vùng III, gồm các phường La Gi, Phước Hội, Bắc Gia Nghĩa, Nam Gia Nghĩa, Đông Gia Nghĩa và các xã Hiệp Thạnh, Đức Trọng, Tân Hội, Tà Hine, Tà Năng, Đinh Văn Lâm Hà, Di Linh, Hòa Ninh, Hòa Bắc, Đinh Trang Thượng, Bảo Thuận, Sơn Điền, Gia Hiệp, Tân Hải, Đông Giang, La Dạ, Hàm Thuận Bắc, Hàm Thuận, Hồng Sơn, Hàm Liêm, Hàm Thạnh, Hàm Kiệm, Tân Thành, Hàm Thuận Nam, Tân Lập, Ninh Gia.<br>
                        - Vùng IV, gồm các xã, phường và đặc khu còn lại.<br><br> 
                        <b>27. Tỉnh Đồng Nai</b><br>
                        - Vùng I, gồm các phường Biên Hòa, Trấn Biên, Tam Hiệp, Long Bình, Trảng Dài, Hố Nai, Long Hưng, Bình Lộc, Bảo Vinh, Xuân Lập, Long Khánh, Hàng Gòn, Tân Triều, Phước Tân, Tam Phước và các xã Đại Phước, Nhơn Trạch, Phước An, Phước Thái, Long Phước, Bình An, Long Thành, An Phước, An Viễn, Bình Minh, Trảng Bom, Bàu Hàm, Hưng Thịnh, Dầu Giây, Gia Kiệm, Thống Nhất, Xuân Đường, Xuân Đông, Xuân Định, Xuân Phú, Xuân Lộc, Xuân Hòa, Xuân Thành, Xuân Bắc, Trị An, Tân An, Phú Lý.<br>
                        - Vùng II, gồm các phường Minh Hưng, Chơn Thành, Đồng Xoài, Bình Phước và các xã Xuân Quế, Cẩm Mỹ, Sông Ray, La Ngà, Định Quán, Phú Vinh, Phú Hòa, Tà Lài, Nam Cát Tiên, Tân Phú, Phú Lâm, Nha Bích, Tân Quan, Thuận Lợi, Đồng Tâm, Tân Lợi, Đồng Phú, Đak Lua, Thanh Sơn.<br>
                        - Vùng III, gồm các phường Bình Long, An Lộc, Phước Bình, Phước Long và các xã Tân Hưng, Tân Khai, Minh Đức, Lộc Thành, Lộc Ninh, Lộc Hưng, Lộc Tấn, Lộc Thạnh, Lộc Quang, Tân Tiến, Bình Tân, Long Hà, Phú Riềng, Phú Trung.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>28. Thành phố Hồ Chí Minh</b><br>
                        - Vùng I, gồm các phường Sài Gòn, Tân Định, Bến Thành, Cầu Ông Lãnh, Bàn Cờ, Xuân Hoà, Nhiêu Lộc, Xóm Chiếu, Khánh Hội, Vĩnh Hội, Chợ Quán, An Đông, Chợ Lớn, Bình Tây, Bình Phú, Bình Tiên, Phú Lâm, Tân Thuận, Phú Thuận, Tân Mỹ, Tân Hưng, Chánh Hưng, Phú Định, Bình Đông, Diên Hồng, Vườn Lài, Hoà Hưng, Minh Phụng, Bình Thới, Hoà Bình, Phú Thọ, Đông Hưng Thuận, Trung Mỹ Tây, Tân Thới Hiệp, Thới An, An Phú Đông, An Lạc, Tân Tạo, Bình Tân, Bình Trị Đông, Bình Hưng Hoà, Gia Định, Bình Thạnh, Bình Lợi Trung, Thạnh Mỹ Tây, Bình Quới, Hạnh Thông, An Nhơn, Gò Vấp, An Hội Đông, Thông Tây Hội, An Hội Tây, Đức Nhuận, Cầu Kiệu, Phú Nhuận, Tân Sơn Hoà, Tân Sơn Nhất, Tân Hoà, Bảy Hiền, Tân Bình, Tân Sơn, Tân Thạnh, Tân Sơn Nhì, Phú Thọ Hoà, Tân Phú, Phú Thạnh, Hiệp Bình, Thủ Đức, Tam Bình, Linh Xuân, Tăng Nhơn Phú, Long Bình, Long Phước, Long Trường, Cát Lái, Bình Trưng, Phước Long, An Khánh, Đông Hoà, Dĩ An, Tân Đông Hiệp, An Phú, Bình Hoà, Lái Thiêu, Thuận An, Thuận Giao, Thủ Dầu Một, Phú Lợi, Chánh Hiệp, Bình Dương, Hoà Lợi, Thới Hoà, Phú An, Tây Nam, Long Nguyên, Bến Cát, Chánh Phú Hoà, Vĩnh Tân, Bình Cơ, Tân Uyên, Tân Hiệp, Tân Khánh, Vũng Tàu, Tam Thắng, Rạch Dừa, Phước Thắng, Tân Hải, Tân Phước, Phú Mỹ, Tân Thành và các xã Vĩnh Lộc, Tân Vĩnh Lộc, Bình Lợi, Tân Nhựt Bình Chánh, Hưng Long, Bình Hưng, Củ Chi, Tân An Hội, Thái Mỹ, An Nhơn Tây, Nhuận Đức, Phú Hoà Đông, Bình Mỹ, Đông Thạnh, Hóc Môn, Xuân Thới Sơn, Bà Điểm, Nhà Bè, Hiệp Phước, Thường Tân, Bắc Tân Uyên, Phú Giáo, Phước Hoà, Phước Thành, An Long, Trừ Văn Thố, Bàu Bàng, Long Hoà, Thanh An, Dầu Tiếng, Minh Thạnh, Long Sơn, Châu Pha.<br>
                        - Vùng II, gồm các phường Bà Rịa, Long Hương, Tam Long và các xã Bình Khánh, An Thới Đông, Cần Giờ, Thạnh An; các xã Kim Long, Châu Đức, Ngãi Giao, Nghĩa Thành, Long Hải, Long Điền và đặc khu Côn Đảo.<br>
                        - Vùng III, gồm các xã, phường và đặc khu còn lại.<br><br> 
                        <b>29. Tỉnh Tây Ninh</b><br>
                        - Vùng I, gồm các phường Long An, Tân An, Khánh Hậu và các xã An Ninh, Hiệp Hòa, Hậu Nghĩa, Hòa Khánh, Đức Lập, Mỹ Hạnh, Đức Hòa, Thạnh Lợi, Bình Đức, Lương Hòa, Bến Lức, Mỹ Yên, Phước Lý, Mỹ Lộc, Cần Giuộc, Phước Vĩnh Tây, Tân Tập.<br>
                        - Vùng II, gồm các phường Kiến Tường, Tân Ninh, Bình Minh, Ninh Thạnh, Long Hoa, Hòa Thành, Thanh Điền, Trảng Bàng, An Tịnh, Gò Dầu, Gia Lộc và các xã Tuyên Thạnh, Bình Hiệp, Thủ Thừa, Mỹ An, Mỹ Thạnh, Tân Long, Long Cang, Rạch Kiến, Mỹ Lệ, Tân Lân, Cần Đước, Long Hựu, Hưng Thuận, Phước Chỉ, Thạnh Đức, Phước Thạnh, Truông Mít, Nhựt Tảo.<br>
                        - Vùng III, gồm các xã Bình Thành, Thạnh Phước, Thạnh Hoá, Tân Tây, Mỹ Quý, Đông Thành, Đức Huệ, Vàm Cỏ, Tân Trụ, Thuận Mỹ, An Lục Long, Tầm Vu, Vĩnh Công, Lộc Ninh, Cầu Khởi, Dương Minh Châu, Tân Đông, Tân Châu, Tân Phú, Tân Hội, Tân Thành, Tân Hoà, Tân Lập, Tân Biên, Thạnh Bình, Trà Vong, Phước Vinh, Hoà Hội, Ninh Điền, Châu Thành, Hảo Đước, Long Chữ, Long Thuận, Bến Cầu.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>30. Tỉnh Đồng Tháp</b><br>
                        - Vùng II, gồm các phường Mỹ Tho, Đạo Thạnh, Mỹ Phong, Thới Sơn, Trung An và các xã Tân Hương, Châu Thành, Long Hưng, Long Định, Vĩnh Kim, Kim Sơn, Bình Trưng.<br>
                        - Vùng III, gồm các phường Gò Công, Long Thuận, Sơn Qui, Bình Xuân, Mỹ Phước Tây, Thanh Hòa, Cai Lậy, Nhị Quý, An Bình, Hồng Ngự, Thường Lạc, Cao Lãnh, Mỹ Ngãi, Mỹ Trà, Sa Đéc và các xã Tân Phú, Tân Phước 1, Tân Phước 2, Tân Phước 3, Hưng Thạnh, Mỹ Tịnh An, Lương Hòa Lạc, Tân Thuận Bình, Chợ Gạo, An Thạnh Thủy, Bình Ninh, Tân Dương.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>31. Tỉnh Vĩnh Long</b><br>
                        - Vùng II, gồm các phường Thanh Đức, Long Châu, Phước Hậu, Tân Hạnh, Tân Ngãi, Bình Minh, Cái Vồn, Đông Thành, An Hội, Phú Khương, Bến Tre, Sơn Đông, Phú Tân, Long Đức, Trà Vinh, Nguyệt Hóa, Hòa Thuận và các xã Phú Túc, Giao Long, Tiên Thủy, Tân Phú.<br>
                        - Vùng III, gồm các phường Duyên Hải, Trường Long Hòa và các xã Cái Nhum, Tân Long Hội, Nhơn Phú, Bình Phước, An Bình, Long Hồ, Phú Quới, Đồng Khởi, Mỏ Cày, Thành Thới, An Định, Hương Mỹ, Tân Thủy, Bảo Thạnh, Ba Tri, Tân Xuân, Mỹ Chánh Hòa, An Ngãi Trung, An Hiệp, Thới Thuận, Thạnh Phước, Bình Đại, Thạnh Trị, Lộc Thuận, Châu Hưng, Phú Thuận, Long Hữu, Hưng Nhượng.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>32. Tỉnh An Giang</b><br>
                        - Vùng II, gồm các phường Long Xuyên, Bình Đức, Mỹ Thới, Châu Đốc, Vĩnh Tế, Vĩnh Thông, Rạch Giá, Hà Tiên, Tô Châu; các xã Mỹ Hòa Hưng, Tiên Hải và các đặc khu Phú Quốc, Thổ Châu.<br>
                        - Vùng III, gồm các phường Tân Châu, Long Phú; các xã Tân An, Châu Phong, Vĩnh Xương, Châu Phú, Mỹ Đức, Vĩnh Thạnh Trung, Bình Mỹ, Thạnh Mỹ Tây, An Châu, Bình Hòa, Cần Đăng, Vĩnh Hanh, Vĩnh An, Thoại Sơn, Óc Eo, Định Mỹ, Phú Hòa, Vĩnh Trạch, Tây Phú, Thạnh Lộc, Châu Thành, Bình An, Hòa Điền, Kiên Lương, Sơn Hải, Hòn Nghệ và đặc khu Kiên Hải.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>33. Thành phố Cần Thơ</b><br>
                        - Vùng II, gồm các phường Phú Lợi, Mỹ Xuyên, Ninh Kiều, Cái Khế, Tân An, An Bình, Thới An Đông, Bình Thủy, Long Tuyền, Cái Răng, Hưng Phú, Ô Môn, Thới Long, Phước Thới, Trung Nhứt, Thốt Nốt, Thuận Hưng, Tân Lộc, Sóc Trăng.<br>
                        - Vùng III, gồm các phường Vị Thanh, Vị Tân, Đại Thành, Ngã Bảy, Vĩnh Phước, Vĩnh Châu, Khánh Hòa, Ngã Năm, Mỹ Quới và các xã Tân Long, Phong Điền, Nhơn Ái, Trường Long, Thới Lai, Đông Thuận, Trường Xuân, Trường Thành, Cờ Đỏ, Đông Hiệp, Thạnh Phú, Thới Hưng, Trung Hưng, Vĩnh Thạnh, Vĩnh Trinh, Thạnh An, Thạnh Quới, Hỏa Lựu, Thạnh Xuân, Tân Hòa, Trường Long Tây, Châu Thành, Đông Phước, Phú Hữu, Vĩnh Hải, Lai Hòa.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br><br> 
                        <b>34. Tỉnh Cà Mau</b><br>
                        - Vùng II, gồm các phường An Xuyên, Lý Văn Lâm, Tân Thành, Hòa Thành, Bạc Liêu, Vĩnh Trạch, Hiệp Thành.<br>
                        - Vùng III, gồm các phường Giá Rai, Láng Tròn và các xã U Minh, Nguyễn Phích, Khánh Lâm, Khánh An, Khánh Bình, Đá Bạc, Khánh Hưng, Sông Đốc, Trần Văn Thời, Đất Mới, Năm Căn, Tam Giang, Lương Thế Trân, Hưng Mỹ, Cái Nước, Tân Hưng, Phú Mỹ, Phong Thạnh, Hòa Bình, Vĩnh Mỹ, Vĩnh Hậu.<br>
                        - Vùng IV, gồm các xã, phường còn lại.<br>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    // Cấu hình Hằng số (Cập nhật mức lương cơ sở mới nhất)
    const BASE_SALARY = 2340000; 
    const REGION_MIN = { 
        1: 4960000, 
        2: 4410000, 
        3: 3860000, 
        4: 3450000 
    };
    const PERSONAL_DEDUCTION = 11000000;
    const DEPENDENT_DEDUCTION = 4400000;

    const salaryInput = document.getElementById('salary-input');
    const dependentsInput = document.getElementById('dependents-input');
    const btnNet = document.getElementById('btn-calc-net');
    const btnGross = document.getElementById('btn-calc-gross');
    
    // Elements cho Tùy chọn Mức lương bảo hiểm
    const insTypeRadios = document.querySelectorAll('input[name="ins-type"]');
    const customInsWrapper = document.getElementById('custom-ins-wrapper');
    const customInsInput = document.getElementById('custom-ins-input');

    // Logic Tùy chọn mức bảo hiểm
    insTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customInsWrapper.classList.remove('hidden');
            } else {
                customInsWrapper.classList.add('hidden');
                customInsInput.value = '';
            }
        });
    });

    // Format Input Money chung
    const handleMoneyInput = function(e) {
        let value = this.value.replace(/[^0-9]/g, '');
        if (value !== '') {
            this.value = parseInt(value, 10).toLocaleString('en-US');
        }
    };
    salaryInput.addEventListener('input', handleMoneyInput);
    customInsInput.addEventListener('input', handleMoneyInput);

    const formatVND = (num) => Math.round(num).toLocaleString('en-US');

    // Thuế TNCN lũy tiến
    const calculatePIT = (taxableIncome) => {
        if (taxableIncome <= 0) return 0;
        if (taxableIncome <= 5000000) return taxableIncome * 0.05;
        if (taxableIncome <= 10000000) return taxableIncome * 0.1 - 250000;
        if (taxableIncome <= 18000000) return taxableIncome * 0.15 - 750000;
        if (taxableIncome <= 32000000) return taxableIncome * 0.2 - 1650000;
        if (taxableIncome <= 52000000) return taxableIncome * 0.25 - 3250000;
        if (taxableIncome <= 80000000) return taxableIncome * 0.3 - 5850000;
        return taxableIncome * 0.35 - 9850000;
    };

    const getFormValues = () => {
        const salaryStr = salaryInput.value.replace(/[^0-9]/g, '');
        const salary = parseInt(salaryStr, 10) || 0;
        const dependents = parseInt(dependentsInput.value, 10) || 0;
        const region = parseInt(document.querySelector('input[name="region"]:checked').value, 10);
        
        const insType = document.querySelector('input[name="ins-type"]:checked').value;
        let customInsSalary = 0;
        if (insType === 'custom') {
            customInsSalary = parseInt(customInsInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        }

        return { salary, dependents, region, insType, customInsSalary };
    };

    const renderResult = (data) => {
        document.getElementById('result-placeholder').classList.add('hidden');
        document.getElementById('result-content').classList.remove('hidden');
        document.getElementById('result-content').classList.add('flex');

        document.getElementById('res-gross').innerText = formatVND(data.gross);
        document.getElementById('res-net').innerText = formatVND(data.net);
        document.getElementById('res-bhxh').innerText = `- ${formatVND(data.bhxh)}`;
        document.getElementById('res-bhyt').innerText = `- ${formatVND(data.bhyt)}`;
        document.getElementById('res-bhtn').innerText = `- ${formatVND(data.bhtn)}`;
        document.getElementById('res-tntt').innerText = formatVND(data.tntt);
        document.getElementById('res-pt').innerText = `- ${formatVND(data.dependents * DEPENDENT_DEDUCTION)}`;
        document.getElementById('res-tax').innerText = `- ${formatVND(data.tax)}`;
    };

    // Tính Gross sang Net
    const calcGrossToNet = () => {
        const { salary: gross, dependents, region, insType, customInsSalary } = getFormValues();
        if (gross === 0) {
            UI.showAlert('Thiếu thông tin', 'Vui lòng nhập mức thu nhập hợp lệ.', 'error');
            return;
        }

        let insSalaryForCalc = gross;
        if (insType === 'custom') {
            insSalaryForCalc = customInsSalary;
        }

        const maxInsurBase = BASE_SALARY * 20;
        const maxUnempBase = REGION_MIN[region] * 20;

        const bhxh = Math.min(insSalaryForCalc, maxInsurBase) * 0.08;
        const bhyt = Math.min(insSalaryForCalc, maxInsurBase) * 0.015;
        const bhtn = Math.min(insSalaryForCalc, maxUnempBase) * 0.01;
        const insuranceTotal = bhxh + bhyt + bhtn;

        const tntt = gross - insuranceTotal;
        const deductions = PERSONAL_DEDUCTION + (dependents * DEPENDENT_DEDUCTION);
        const taxableIncome = Math.max(0, tntt - deductions);
        const tax = calculatePIT(taxableIncome);
        const net = gross - insuranceTotal - tax;

        renderResult({ gross, net, bhxh, bhyt, bhtn, tntt, dependents, tax });
    };

    // Tính Net sang Gross 
    const calcNetToGross = () => {
        const { salary: targetNet, dependents, region, insType, customInsSalary } = getFormValues();
        if (targetNet === 0) {
            UI.showAlert('Thiếu thông tin', 'Vui lòng nhập mức thu nhập hợp lệ.', 'error');
            return;
        }

        let minGross = targetNet;
        let maxGross = targetNet * 3; 
        let currentGross = 0;
        let diff = 0;
        let bestResult = null;

        // Binary search để tìm ngược Gross
        for (let i = 0; i < 50; i++) {
            currentGross = (minGross + maxGross) / 2;
            
            let insSalaryForCalc = currentGross;
            if (insType === 'custom') {
                insSalaryForCalc = customInsSalary; // Nếu là tự nhập, mức đóng bảo hiểm cố định
            }

            const maxInsurBase = BASE_SALARY * 20;
            const maxUnempBase = REGION_MIN[region] * 20;

            const bhxh = Math.min(insSalaryForCalc, maxInsurBase) * 0.08;
            const bhyt = Math.min(insSalaryForCalc, maxInsurBase) * 0.015;
            const bhtn = Math.min(insSalaryForCalc, maxUnempBase) * 0.01;
            const insuranceTotal = bhxh + bhyt + bhtn;

            const tntt = currentGross - insuranceTotal;
            const deductions = PERSONAL_DEDUCTION + (dependents * DEPENDENT_DEDUCTION);
            const taxableIncome = Math.max(0, tntt - deductions);
            const tax = calculatePIT(taxableIncome);
            const calculatedNet = currentGross - insuranceTotal - tax;

            diff = calculatedNet - targetNet;
            
            bestResult = { gross: currentGross, net: calculatedNet, bhxh, bhyt, bhtn, tntt, dependents, tax };

            if (Math.abs(diff) < 1) break; 
            
            if (diff > 0) {
                maxGross = currentGross;
            } else {
                minGross = currentGross;
            }
        }

        renderResult(bestResult);
    };

    btnNet.addEventListener('click', calcGrossToNet);
    btnGross.addEventListener('click', calcNetToGross);

    // Xử lý logic Modal Vùng
    const modalRegions = document.getElementById('modal-regions');
    const btnOpenRegions = document.getElementById('btn-open-regions');
    const btnCloseRegions = document.getElementById('btn-close-regions');

    const openModal = () => modalRegions.classList.add('active');
    const closeModal = () => modalRegions.classList.remove('active');

    btnOpenRegions.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
    
    btnCloseRegions.addEventListener('click', closeModal);
    
    // Đóng khi click ngoài mảng modal
    modalRegions.addEventListener('click', (e) => {
        if (e.target === modalRegions) closeModal();
    });
}