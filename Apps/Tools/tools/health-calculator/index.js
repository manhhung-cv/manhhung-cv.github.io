import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .hc-layout { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
            @media (min-width: 992px) { .hc-layout { display: grid; grid-template-columns: 1fr 1fr; align-items: start; } }
            
            .hc-sticky { position: sticky; top: 80px; }

            /* Tab Giới tính */
            .gender-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
            .gender-btn {
                flex: 1; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius);
                background: var(--bg-sec); cursor: pointer; text-align: center;
                font-family: var(--font); font-size: 1rem; color: var(--text-mut); font-weight: 500;
                transition: all 0.2s;
            }
            .gender-btn:hover { border-color: var(--text-main); color: var(--text-main); }
            .gender-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
            .gender-btn i { margin-right: 6px; }

            /* Nhóm Radio tùy chỉnh cho Mức độ vận động */
            .act-group { display: flex; flex-direction: column; gap: 8px; }
            .act-label { 
                display: flex; align-items: flex-start; gap: 12px;
                padding: 12px 16px; border: 1px solid var(--border); 
                border-radius: var(--radius); cursor: pointer; 
                background: var(--bg-sec); transition: all 0.2s;
                user-select: none;
            }
            .act-label:hover { border-color: var(--text-mut); }
            .act-label.active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
            .act-label input[type="radio"] { 
                margin-top: 4px; cursor: pointer; width: 16px; height: 16px; accent-color: #3b82f6;
            }
            .act-title { font-weight: 600; color: var(--text-main); font-size: 0.95rem; margin-bottom: 2px; }
            .act-desc { font-size: 0.85rem; color: var(--text-mut); line-height: 1.4; }

            /* Hiển thị Kết quả */
            .res-box { 
                background: var(--bg-main); border: 1px solid var(--border); 
                border-radius: var(--radius); padding: 20px; text-align: center; 
                margin-bottom: 16px; transition: all 0.3s;
            }
            .res-title { font-size: 0.9rem; color: var(--text-mut); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
            .res-value { font-size: 2.5rem; font-weight: 700; color: var(--text-main); line-height: 1.1; margin-bottom: 4px; }
            .res-sub { font-size: 0.9rem; color: var(--text-mut); }
            
            /* Thước đo BMI */
            .bmi-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 16px; margin-bottom: 8px; }
            .bmi-segment { height: 100%; transition: opacity 0.2s; }
            .bmi-segment:not(.active) { opacity: 0.2; }
            
            .seg-blue { background: #3b82f6; flex: 1.85; } /* < 18.5 */
            .seg-green { background: #10b981; flex: 0.44; } /* 18.5 - 22.9 */
            .seg-orange { background: #f59e0b; flex: 0.2; } /* 23 - 24.9 */
            .seg-red { background: #ef4444; flex: 1.51; } /* >= 25 */

            .bmi-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-mut); }
            
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .stat-box { background: var(--bg-main); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; text-align: center; }
        </style>

        <div class="flex-between" style="margin-bottom: 24px;">
            <div>
                <h1 class="h1">Tính chỉ số Sức khỏe</h1>
                <p class="text-mut">Đánh giá BMI (Chuẩn Châu Á), BMR và lượng Calo cần thiết mỗi ngày.</p>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-hc-reset" style="color: #ef4444;">
                <i class="fas fa-redo"></i> Đặt lại
            </button>
        </div>

        <div class="hc-layout">
            
            <div class="card" style="padding: 24px;">
                
                <div class="form-group">
                    <label class="form-label">Giới tính</label>
                    <div class="gender-tabs">
                        <button class="gender-btn active" data-gender="male"><i class="fas fa-mars"></i> Nam</button>
                        <button class="gender-btn" data-gender="female"><i class="fas fa-venus"></i> Nữ</button>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Tuổi (Năm)</label>
                        <input type="number" class="input hc-input" id="in-age" placeholder="VD: 25" min="1" max="120">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Chiều cao (cm)</label>
                        <input type="number" class="input hc-input" id="in-height" placeholder="VD: 170" min="50" max="250">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Cân nặng (kg)</label>
                    <input type="number" class="input hc-input" id="in-weight" placeholder="VD: 65" min="10" max="300" step="0.1">
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Mức độ vận động</label>
                    <div class="act-group">
                        <label class="act-label">
                            <input type="radio" name="activity" value="1.2" class="hc-radio">
                            <div>
                                <div class="act-title">Ít vận động</div>
                                <div class="act-desc">Việc văn phòng, không tập thể dục</div>
                            </div>
                        </label>
                        <label class="act-label">
                            <input type="radio" name="activity" value="1.375" class="hc-radio">
                            <div>
                                <div class="act-title">Vận động nhẹ</div>
                                <div class="act-desc">Tập thể dục 1-3 ngày/tuần</div>
                            </div>
                        </label>
                        <label class="act-label active">
                            <input type="radio" name="activity" value="1.55" class="hc-radio" checked>
                            <div>
                                <div class="act-title">Vận động vừa</div>
                                <div class="act-desc">Tập thể dục 3-5 ngày/tuần</div>
                            </div>
                        </label>
                        <label class="act-label">
                            <input type="radio" name="activity" value="1.725" class="hc-radio">
                            <div>
                                <div class="act-title">Vận động nhiều</div>
                                <div class="act-desc">Tập thể dục 6-7 ngày/tuần</div>
                            </div>
                        </label>
                        <label class="act-label">
                            <input type="radio" name="activity" value="1.9" class="hc-radio">
                            <div>
                                <div class="act-title">Vận động rất nhiều</div>
                                <div class="act-desc">Công việc nặng, tập luyện 2 lần/ngày</div>
                            </div>
                        </label>
                    </div>
                </div>

            </div>

            <div class="hc-sticky">
                <div class="card" style="padding: 24px; background: var(--bg-sec);">
                    
                    <div class="res-box" id="box-bmi">
                        <div class="res-title">Chỉ số BMI (Chuẩn Châu Á)</div>
                        <div class="res-value" id="res-bmi-score">--</div>
                        <div class="res-sub" id="res-bmi-text" style="font-weight: 600;">Nhập thông tin để tính toán</div>
                        
                        <div class="bmi-bar">
                            <div class="bmi-segment seg-blue" id="seg-1"></div>
                            <div class="bmi-segment seg-green" id="seg-2"></div>
                            <div class="bmi-segment seg-orange" id="seg-3"></div>
                            <div class="bmi-segment seg-red" id="seg-4"></div>
                        </div>
                        <div class="bmi-labels">
                            <span>Gầy</span>
                            <span>Chuẩn</span>
                            <span>Thừa cân</span>
                            <span>Béo phì</span>
                        </div>
                    </div>

                    <div class="stat-grid">
                        <div class="stat-box">
                            <div class="res-title" title="Total Daily Energy Expenditure">Calo Duy Trì (TDEE)</div>
                            <div class="res-value" id="res-tdee" style="font-size: 1.8rem;">--</div>
                            <div class="res-sub">kcal / ngày</div>
                        </div>
                        
                        <div class="stat-box">
                            <div class="res-title" title="Basal Metabolic Rate">Trao Đổi Chất (BMR)</div>
                            <div class="res-value" id="res-bmr" style="font-size: 1.8rem; color: var(--text-mut);">--</div>
                            <div class="res-sub">kcal / ngày</div>
                        </div>
                    </div>
                    
                    <div class="text-mut" style="font-size: 0.8rem; text-align: center; margin-top: 16px;">
                        * Dựa trên công thức Mifflin-St Jeor. Để giảm cân, hãy ăn ít hơn mức TDEE khoảng 300-500 kcal.
                    </div>

                </div>
            </div>

        </div>
    `;
}

export function init() {
    // --- DOM Elements ---
    const genderBtns = document.querySelectorAll('.gender-btn');
    const inputAge = document.getElementById('in-age');
    const inputHeight = document.getElementById('in-height');
    const inputWeight = document.getElementById('in-weight');
    
    // Elements của nhóm Radio vận động
    const actLabels = document.querySelectorAll('.act-label');
    const actRadios = document.querySelectorAll('.hc-radio');
    
    const resBmiScore = document.getElementById('res-bmi-score');
    const resBmiText = document.getElementById('res-bmi-text');
    const resTdee = document.getElementById('res-tdee');
    const resBmr = document.getElementById('res-bmr');
    const segments = [
        document.getElementById('seg-1'),
        document.getElementById('seg-2'),
        document.getElementById('seg-3'),
        document.getElementById('seg-4')
    ];

    let gender = 'male';

    // --- LOGIC TÍNH TOÁN ---
    const calculate = () => {
        const age = parseFloat(inputAge.value);
        const heightCm = parseFloat(inputHeight.value);
        const weightKg = parseFloat(inputWeight.value);
        
        // Lấy giá trị của Radio đang được chọn (checked)
        const checkedRadio = document.querySelector('.hc-radio:checked');
        const activityMulti = checkedRadio ? parseFloat(checkedRadio.value) : 1.55;

        // Reset nếu thiếu dữ liệu
        if (isNaN(age) || isNaN(heightCm) || isNaN(weightKg) || age <= 0 || heightCm <= 0 || weightKg <= 0) {
            resBmiScore.textContent = '--';
            resBmiText.textContent = 'Nhập thông tin để tính toán';
            resBmiText.style.color = 'var(--text-mut)';
            resTdee.textContent = '--';
            resBmr.textContent = '--';
            segments.forEach(seg => seg.classList.remove('active'));
            return;
        }

        // 1. Tính BMI: Cân nặng(kg) / Chiều cao(m)^2
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        const roundedBmi = (Math.round(bmi * 10) / 10).toFixed(1);
        resBmiScore.textContent = roundedBmi;

        // Đánh giá BMI theo chuẩn Châu Á - Thái Bình Dương (WHO Asia-Pacific)
        segments.forEach(seg => seg.classList.remove('active'));
        if (bmi < 18.5) {
            resBmiText.textContent = 'Gầy (Thiếu cân)';
            resBmiText.style.color = '#3b82f6';
            segments[0].classList.add('active');
        } else if (bmi >= 18.5 && bmi < 23) {
            resBmiText.textContent = 'Khỏe mạnh (Bình thường)';
            resBmiText.style.color = '#10b981';
            segments[1].classList.add('active');
        } else if (bmi >= 23 && bmi < 25) {
            resBmiText.textContent = 'Tiền béo phì (Thừa cân)';
            resBmiText.style.color = '#f59e0b';
            segments[2].classList.add('active');
        } else {
            resBmiText.textContent = 'Béo phì';
            resBmiText.style.color = '#ef4444';
            segments[3].classList.add('active');
        }

        // 2. Tính BMR (Công thức Mifflin-St Jeor)
        let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }
        resBmr.textContent = Math.round(bmr).toLocaleString();

        // 3. Tính TDEE (Nhu cầu Calo hàng ngày)
        const tdee = bmr * activityMulti;
        resTdee.textContent = Math.round(tdee).toLocaleString();
    };

    // --- SỰ KIỆN LẮNG NGHE ---
    
    // Đổi giới tính
    genderBtns.forEach(btn => {
        btn.onclick = () => {
            genderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gender = btn.dataset.gender;
            calculate();
        };
    });

    // Cập nhật giao diện khi chọn Radio Mức độ vận động
    actRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            actLabels.forEach(lbl => lbl.classList.remove('active')); // Xóa active cũ
            e.target.closest('.act-label').classList.add('active'); // Thêm active mới
            calculate(); // Tính lại
        });
    });

    // Bắt sự kiện gõ chữ vào các ô input
    document.querySelectorAll('.hc-input').forEach(el => {
        el.addEventListener('input', calculate);
    });

    // Đặt lại (Reset) toàn bộ form
    document.getElementById('btn-hc-reset').onclick = () => {
        genderBtns[0].click(); // Trở về Nam
        inputAge.value = '';
        inputHeight.value = '';
        inputWeight.value = '';
        
        // Trở về mức Vận động vừa (Index 2)
        actRadios[2].checked = true;
        actRadios[2].dispatchEvent(new Event('change')); // Bắn event để tự động cập nhật viền màu xanh
        
        calculate();
        inputAge.focus();
    };
}