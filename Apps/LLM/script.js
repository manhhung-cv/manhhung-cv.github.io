const studentIdInput = document.getElementById('studentId');
const btnSearch = document.getElementById('btnSearch');
const systemSelect = document.getElementById('systemSelect');
const extraParamsInput = document.getElementById('extraParams');
const btnToggleSettings = document.getElementById('btnToggleSettings');
const advancedSettings = document.getElementById('advancedSettings');

const statusContainer = document.getElementById('statusContainer');
const statusIcon = document.getElementById('statusIcon');
const statusMessage = document.getElementById('statusMessage');

const studentSelectionContainer = document.getElementById('studentSelectionContainer');
const studentSelectDropdown = document.getElementById('studentSelectDropdown');
const btnConfirmStudent = document.getElementById('btnConfirmStudent');

const resultContainer = document.getElementById('resultContainer');
const studentInfoContainer = document.getElementById('studentInfoContainer');
const gradesTableContainer = document.getElementById('gradesTableContainer');
const captureTarget = document.getElementById('captureTarget');

const toggleCompact = document.getElementById('toggleCompact');
const btnDownloadExcel = document.getElementById('btnDownloadExcel');
const btnDownloadPdf = document.getElementById('btnDownloadPdf');

const btnDevJson = document.getElementById('btnDevJson');
const btnDevHtml = document.getElementById('btnDevHtml');
const devDataView = document.getElementById('devDataView');
const devCodeBlock = document.getElementById('devCodeBlock');
const btnCloseDev = document.getElementById('btnCloseDev');
const btnCopyDev = document.getElementById('btnCopyDev');

let globalRawHtml = '';
let globalJsonData = [];

const BASE_TARGET_URL = "http://congthongtin.lilama2.edu.vn/Pages/Sims/SubjectMarkOfStudent.aspx";
const PROXY_URL = "https://cors-proxy.year-tucking-0v.workers.dev/";

// Xử lý ẩn/hiện input khi đổi Hệ đào tạo
systemSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        extraParamsInput.classList.remove('hidden');
        extraParamsInput.value = ''; 
    } else {
        extraParamsInput.classList.add('hidden');
    }
});

btnToggleSettings.addEventListener('click', () => advancedSettings.classList.toggle('hidden'));

toggleCompact.addEventListener('change', (e) => {
    if (e.target.checked) resultContainer.classList.add('table-compact');
    else resultContainer.classList.remove('table-compact');
});

studentIdInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') btnSearch.click();
});

btnDevJson.addEventListener('click', () => { devDataView.classList.remove('hidden'); devCodeBlock.textContent = JSON.stringify(globalJsonData, null, 2); devCodeBlock.className = 'p-4 overflow-x-auto text-xs font-mono text-yellow-300 max-h-64'; });
btnDevHtml.addEventListener('click', () => { devDataView.classList.remove('hidden'); devCodeBlock.textContent = globalRawHtml; devCodeBlock.className = 'p-4 overflow-x-auto text-xs font-mono text-green-400 max-h-64'; });
btnCloseDev.addEventListener('click', () => devDataView.classList.add('hidden'));

btnCopyDev.addEventListener('click', () => {
    const textToCopy = devCodeBlock.textContent;
    try { navigator.clipboard.writeText(textToCopy).then(() => alertMessageBox('Đã copy!')).catch(err => fallbackCopyTextToClipboard(textToCopy)); } 
    catch (err) { fallbackCopyTextToClipboard(textToCopy); }
});

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); alertMessageBox('Đã copy!'); } catch (err) { alertMessageBox('Trình duyệt không hỗ trợ copy.', 'error'); }
    document.body.removeChild(textArea);
}

function alertMessageBox(msg, type = 'success') {
    const box = document.createElement('div');
    box.className = `fixed bottom-4 right-4 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-500 z-50 font-medium ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`;
    box.textContent = msg;
    document.body.appendChild(box);
    setTimeout(() => { box.style.opacity = '0'; setTimeout(() => document.body.removeChild(box), 500); }, 3000);
}

// ==========================================
// HÀM TIỆN ÍCH: CHUYỂN ĐỔI TIẾNG VIỆT KHÔNG DẤU
// ==========================================
function removeVietnameseTones(str) {
    if (!str) return "";
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

// ==========================================
// TẢI XUỐNG PDF (Khắc phục hoàn toàn lỗi cắt chữ, tự căn lề, bỏ dấu tên file)
// ==========================================
// ==========================================
// TẢI XUỐNG PDF (Kỹ thuật Off-Screen Clone - Chuẩn 100% trên Mobile & PC)
// ==========================================
btnDownloadPdf.addEventListener('click', async () => {
    if (typeof captureTarget === 'undefined' || !captureTarget) return;
    const originalTable = captureTarget.querySelector('table');
    if (!originalTable) { alertMessageBox("Không có dữ liệu bảng điểm để xuất PDF.", "error"); return; }

    const originalContent = btnDownloadPdf.innerHTML;
    btnDownloadPdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang xử lý PDF...';
    btnDownloadPdf.disabled = true;

    // 1. TẠO VÙNG CHỨA ẢO (OFF-SCREEN)
    // Nằm ngoài màn hình, không bị ảnh hưởng bởi kích thước điện thoại
    const offScreenContainer = document.createElement('div');
    offScreenContainer.style.position = 'absolute';
    offScreenContainer.style.top = '-9999px';
    offScreenContainer.style.left = '-9999px';
    offScreenContainer.style.width = '1450px'; // Chiều rộng cố định, đủ to để chứa full bảng
    offScreenContainer.style.background = 'white';
    offScreenContainer.style.padding = '20px';
    offScreenContainer.style.zIndex = '-1';

    // 2. NHÂN BẢN GIAO DIỆN HIỆN TẠI
    const cloneTarget = captureTarget.cloneNode(true);
    
    // Gỡ bỏ mọi class gây tràn/ẩn (overflow) trên BẢN SAO
    const clippingElements = cloneTarget.querySelectorAll('.overflow-hidden, .overflow-x-auto, .table-compact');
    clippingElements.forEach(el => {
        el.classList.remove('overflow-hidden', 'overflow-x-auto', 'table-compact');
    });

    // Ép các bảng bên trong bản sao bung hết 100% của 1450px
    const tables = cloneTarget.querySelectorAll('table');
    tables.forEach(t => {
        t.style.setProperty('width', '100%', 'important');
        t.style.setProperty('max-width', '100%', 'important');
    });

    // Gắn bản sao vào vùng chứa ảo, sau đó gắn vào body
    offScreenContainer.appendChild(cloneTarget);
    document.body.appendChild(offScreenContainer);

    // 3. Cho DOM thời gian render bản sao
    await new Promise(resolve => setTimeout(resolve, 500));

    // 4. Xử lý tên file
    const studentVal = (typeof studentIdInput !== 'undefined' && studentIdInput && studentIdInput.value) ? studentIdInput.value.trim() : '';
    let currentSearch = studentVal;
    if (typeof removeVietnameseTones === 'function') {
        currentSearch = removeVietnameseTones(studentVal);
    }
    currentSearch = currentSearch.replace(/[^a-zA-Z0-9_\-]/g, '_') || 'Data';
    const filename = `Bang_Diem_${currentSearch}.pdf`;

    // 5. Cấu hình html2pdf chụp cái BẢN SAO ẢO
    const opt = {
        margin:       [10, 5, 10, 5], 
        filename:     filename,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true,
            logging: false,
            windowWidth: 1450,
            width: 1450
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak:    { mode: ['css', 'legacy'] }
    };

    try {
        await html2pdf().set(opt).from(cloneTarget).save();
        alertMessageBox("Đã lưu bảng điểm thành PDF đầy đủ 100%!", "success");
    } catch (err) {
        alertMessageBox("Lỗi khi tải PDF: " + err.message, "error");
    } finally {
        // 6. DỌN DẸP SAU KHI CHỤP XONG
        document.body.removeChild(offScreenContainer);
        btnDownloadPdf.innerHTML = originalContent;
        btnDownloadPdf.disabled = false;
    }
});

// Tải Excel
btnDownloadExcel.addEventListener('click', () => {
    if (typeof gradesTableContainer === 'undefined' || !gradesTableContainer) return;
    const originalTable = gradesTableContainer.querySelector('table');
    if (!originalTable) { alertMessageBox("Không có dữ liệu bảng điểm.", "error"); return; }
    
    const clonedTable = originalTable.cloneNode(true);
    clonedTable.querySelectorAll('button, input, select, svg, script, style, .no-print, .empty-cell').forEach(el => el.remove());
    clonedTable.querySelectorAll('*').forEach(el => el.removeAttribute('style'));
    const cleanTableHtml = clonedTable.outerHTML;

    const excelHeader = [
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">',
        '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Bang_Diem</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->',
        '<style>table { border-collapse: collapse; width: 100%; font-family: Arial; font-size: 13px; } th, td { border: 0.5pt solid #000; padding: 6px; text-align: center; } th { background-color: #dbeafe; font-weight: bold; } .Learning_GroupRow { background-color: #f3f4f6; font-weight: bold; text-align: left; }</style>',
        '</head><body>'
    ].join('\n');

    const excelFullContent = excelHeader + '\n' + cleanTableHtml + '\n</body></html>';
    const blob = new Blob(['\uFEFF' + excelFullContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bang_Diem_${studentIdInput.value.replace(/[^a-zA-Z0-9_\-]/g, '_') || 'Data'}.xls`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
});

function showStatus(type, message) {
    statusContainer.classList.remove('hidden', 'bg-red-50', 'bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'text-red-700', 'text-blue-700', 'text-green-700', 'text-yellow-700', 'border-red-200', 'border-blue-200', 'border-green-200', 'border-yellow-200');
    if (type === 'loading') { statusContainer.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-200'); statusIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-lg"></i>'; } 
    else if (type === 'error') { statusContainer.classList.add('bg-red-50', 'text-red-700', 'border-red-200'); statusIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation text-lg"></i>'; } 
    else if (type === 'success') { statusContainer.classList.add('bg-green-50', 'text-green-700', 'border-green-200'); statusIcon.innerHTML = '<i class="fa-solid fa-circle-check text-lg"></i>'; } 
    else if (type === 'warning') { statusContainer.classList.add('bg-yellow-50', 'text-yellow-700', 'border-yellow-200'); statusIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-lg"></i>'; }
    statusMessage.innerHTML = message;
}

function hideStatus() { statusContainer.classList.add('hidden'); }

function getFullUrl(searchValue) {
    let extraParams = systemSelect.value;
    if (extraParams === 'custom') {
        extraParams = extraParamsInput.value.trim();
    }
    return `${PROXY_URL}${BASE_TARGET_URL}${extraParams ? `?${extraParams}&code=${encodeURIComponent(searchValue)}` : `?code=${encodeURIComponent(searchValue)}`}`;
}

btnSearch.addEventListener('click', () => {
    const searchValue = studentIdInput.value.trim();
    if (!searchValue) return showStatus('error', 'Vui lòng nhập Mã sinh viên hoặc Họ tên.');
    resultContainer.classList.add('hidden'); studentSelectionContainer.classList.add('hidden'); devDataView.classList.add('hidden');
    globalRawHtml = ''; globalJsonData = [];
    fetchDataAndProcess(searchValue, false);
});

btnConfirmStudent.addEventListener('click', () => {
    const selectedId = studentSelectDropdown.value;
    if (!selectedId) return;
    studentSelectionContainer.classList.add('hidden');
    fetchDataAndProcess(selectedId, true); 
});

async function fetchDataAndProcess(searchValue, forceRender = false) {
    showStatus('loading', 'Đang xử lý dữ liệu...');
    btnSearch.disabled = true;
    try {
        const response = await fetch(getFullUrl(searchValue), { method: 'GET', headers: { 'Accept': 'text/html' } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        globalRawHtml = await response.text();
        const doc = new DOMParser().parseFromString(globalRawHtml, 'text/html');
        const contentDiv = doc.getElementById('ctl00_cphMain_SubjectMarkOfStudent1_SubjectMarkOfStudent1_udpContent');
        if (!contentDiv) return showStatus('error', 'Không tìm thấy dữ liệu.');

        if (!forceRender) {
            const selectElement = doc.getElementById('ctl00_cphMain_SubjectMarkOfStudent1_SubjectMarkOfStudent1_ddlStudentID');
            if (selectElement && selectElement.options.length > 2) {
                return await handleMultipleStudents(Array.from(selectElement.options).filter(opt => opt.value !== "")); 
            }
        }
        processAndRenderGrades(contentDiv);
    } catch (error) {
        showStatus('error', `Lỗi kết nối: ${error.message}`);
    } finally {
        btnSearch.disabled = false;
    }
}

async function handleMultipleStudents(options) {
    showStatus('loading', `Tìm thấy ${options.length} sinh viên...`);
    studentSelectDropdown.innerHTML = '<option value="">Đang tải...</option>';
    studentSelectionContainer.classList.remove('hidden');
    
    const results = await Promise.all(options.map(async (opt) => {
        try {
            const res = await fetch(getFullUrl(opt.value));
            if (res.ok) {
                const tempDoc = new DOMParser().parseFromString(await res.text(), 'text/html');
                const textContent = tempDoc.querySelector('table[width="800px"]')?.innerText || '';
                const name = textContent.match(/Họ tên:\s*(.*?)(Ngày sinh|$)/)?.[1].trim() || opt.value;
                return { id: opt.value, text: `${name} - ${opt.value}` };
            }
        } catch (e) {}
        return { id: opt.value, text: opt.value };
    }));
    
    studentSelectDropdown.innerHTML = results.map(r => `<option value="${r.id}">${r.text}</option>`).join('');
    hideStatus();
}

function processAndRenderGrades(contentDiv) {
    const infoTableOriginal = contentDiv.querySelector('table[width="800px"]');
    if (infoTableOriginal) {
        const cloneInfo = infoTableOriginal.cloneNode(true);
        cloneInfo.removeAttribute('width');
        cloneInfo.className = 'student-info-table';
        studentInfoContainer.innerHTML = ''; studentInfoContainer.appendChild(cloneInfo);
    }

    const learningContentDiv = contentDiv.querySelector('.Learning_Content');
    if (learningContentDiv) {
        const tables = learningContentDiv.querySelectorAll('table');
        gradesTableContainer.innerHTML = ''; globalJsonData = []; 

        tables.forEach((table, index) => {
            const clonedTable = table.cloneNode(true);
            clonedTable.style.width = "100%";
            
            let headers = [];
            let tableJsonData = []; 

            const rows = clonedTable.querySelectorAll('tr');
            rows.forEach((row, rowIndex) => {
                let rowData = [];
                const cols = row.querySelectorAll('td, th');

                if (row.classList.contains('Learning_Header') || (rowIndex === 0 && row.querySelectorAll('th').length > 0)) {
                    cols.forEach(col => headers.push(col.innerText.trim()));
                }

                cols.forEach((col, colIndex) => {
                    const cellText = col.innerText.trim();
                    rowData.push(cellText);
                    col.removeAttribute('style');

                    if (headers[colIndex] && !row.classList.contains('Learning_Header') && !row.classList.contains('Learning_GroupRow')) {
                        col.setAttribute('data-label', headers[colIndex]);
                        if (cellText === '') {
                            col.classList.add('empty-cell');
                        }
                    }

                    if (/^\d+(\.\d+)?$/.test(cellText) && cellText.length < 5) {
                        const num = parseFloat(cellText);
                        if (!isNaN(num)) {
                            if (num < 5.0) col.classList.add('text-red-600', 'font-bold');
                            else if (num >= 8.0) col.classList.add('text-green-600', 'font-bold');
                            else if (num >= 7.0) col.classList.add('text-blue-600', 'font-semibold');
                        }
                    }
                });
                tableJsonData.push(rowData);
            });

            globalJsonData.push({ tableIndex: index + 1, data: tableJsonData });
            if (index > 0) gradesTableContainer.appendChild(document.createElement('br'));
            gradesTableContainer.appendChild(clonedTable);
        });

        showStatus('success', 'Tải và trích xuất dữ liệu thành công!');
        resultContainer.classList.remove('hidden');
    }
}