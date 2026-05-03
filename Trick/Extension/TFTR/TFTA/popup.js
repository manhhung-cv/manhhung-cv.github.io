document.getElementById('btnV1').addEventListener('click', function() { startScraping('V1', 'scraper_v1.js', this); });
document.getElementById('btnPRO').addEventListener('click', function() { startScraping('PRO', 'scraper_pro.js', this); });

async function startScraping(version, scriptFile, btnElement) {
    const limit = document.getElementById('limitInput').value;
    const customNote = document.getElementById('customInput').value;

    // Lấy cấu hình các checkbox
    const options = {
        title: document.getElementById('optTitle').checked,
        tags: document.getElementById('optTags').checked,
        units: document.getElementById('optUnits').checked,
        code: document.getElementById('optCode').checked,
        early: document.getElementById('optEarly').checked,
        quick: document.getElementById('optQuick').checked,
        board: document.getElementById('optBoard').checked,
        augments: document.getElementById('optAugments').checked // Chỉ có ở PRO
    };
    
    btnElement.innerHTML = "⏳ Đang khởi động...";
    document.getElementById('btnV1').disabled = true;
    document.getElementById('btnPRO').disabled = true;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [scriptFile]
    });

    // Truyền thêm options và customNote
    chrome.tabs.sendMessage(tab.id, { 
        action: `start_${version}`, 
        limit: limit,
        options: options,
        customNote: customNote
    }, () => {
        window.close(); 
    });
}