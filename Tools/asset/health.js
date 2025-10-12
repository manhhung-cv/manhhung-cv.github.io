// asset/health-calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const healthTool = document.getElementById('health-calculator');
    if (!healthTool) return;

    // DOM Elements
    const genderBtns = healthTool.querySelectorAll('.gender-btn');
    const ageInput = healthTool.querySelector('#age');
    const weightInput = healthTool.querySelector('#weight');
    const heightInput = healthTool.querySelector('#height');
    const calculateBtn = healthTool.querySelector('#calculate-health-btn');
    const bmiValueEl = healthTool.querySelector('#bmi-value');
    const bmiCategoryEl = healthTool.querySelector('#bmi-category');
    const bmiIndicator = healthTool.querySelector('#bmi-indicator');
    const bmrValueEl = healthTool.querySelector('#bmr-value');
    const tdeeValueEl = healthTool.querySelector('#tdee-value');
    const bmiResultCard = healthTool.querySelector('#bmi-result-card');
    const bmrResultCard = healthTool.querySelector('#bmr-result-card');

    let selectedGender = 'male';

    genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            genderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGender = btn.dataset.gender;
        });
    });

    calculateBtn.addEventListener('click', () => {
        const age = parseInt(ageInput.value);
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        const activityLevel = parseFloat(healthTool.querySelector('input[name="activity"]:checked').value);

        if (!age || !weight || !height) {
            alert('Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        // 1. Calculate BMI
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        bmiValueEl.textContent = bmi.toFixed(1);
        
        let bmiCategory = '';
        let indicatorPosition = 0;
        if (bmi < 18.5) { bmiCategory = 'Gầy'; indicatorPosition = 10; }
        else if (bmi < 24.9) { bmiCategory = 'Bình thường'; indicatorPosition = 37; }
        else if (bmi < 29.9) { bmiCategory = 'Thừa cân'; indicatorPosition = 62; }
        else { bmiCategory = 'Béo phì'; indicatorPosition = 85; }
        bmiCategoryEl.textContent = bmiCategory;
        bmiIndicator.style.left = `${indicatorPosition}%`;

        // 2. Calculate BMR (Mifflin-St Jeor Equation)
        let bmr = 0;
        if (selectedGender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        bmrValueEl.textContent = Math.round(bmr).toLocaleString();

        // 3. Calculate TDEE
        const tdee = bmr * activityLevel;
        tdeeValueEl.textContent = Math.round(tdee).toLocaleString();

        // Show result cards
        bmiResultCard.classList.remove('hidden');
        bmrResultCard.classList.remove('hidden');
    });
});