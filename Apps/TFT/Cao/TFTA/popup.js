document.getElementById('btnV1').addEventListener('click', function() { startScraping('V1', 'scraper_v1.js', this); });
document.getElementById('btnPRO').addEventListener('click', function() { startScraping('PRO', 'scraper_pro.js', this); });

async function startScraping(version, scriptFile, btnElement) {
    const limit = document.getElementById('limitInput').value;
    
    btnElement.innerHTML = "⏳ Đang khởi động...";
    document.getElementById('btnV1').disabled = true;
    document.getElementById('btnPRO').disabled = true;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Tiêm đúng file JS riêng biệt tương ứng với phiên bản
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [scriptFile]
    });

    chrome.tabs.sendMessage(tab.id, { action: `start_${version}`, limit: limit }, () => {
        window.close(); 
    });
}