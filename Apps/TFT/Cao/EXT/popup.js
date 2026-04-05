const units = [
    "Shen", "Morgana", "Bard", "Fiora", "Jhin", "Sona", "Karma", "Blitzcrank", 
    "Rhaast", "Riven", "Summon", "Fizz", "Vex", "Kaisa", "Rammus", "Graves", 
    "Corki", "IvernMinion", "Kindred", "Galio", "AurelionSol", "Akali", "Leblanc", 
    "Aatrox", "Maokai", "Gwen", "Viktor", "Caitlyn", "MasterYi", "TahmKench", 
    "Urgot", "Nunu", "Ornn", "Milio", "Xayah", "Gnar", "MissFortune", "Gragas", 
    "Pyke", "Mordekaiser", "Nami", "Poppy", "Belveth", "Jax", "Leona", "Teemo", 
    "Lissandra", "Zoe", "Zed", "Illaoi", "Samira", "TwistedFate", "Talon", 
    "Reksai", "Lulu", "Veigar", "Pantheon", "Diana", "Nasus", "Chogath", 
    "Aurora", "Briar", "Ezreal", "Jinx"
];

document.getElementById('startBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const results = [];
    
    // Tạo một tab mới để chạy cào dữ liệu
    const tab = await chrome.tabs.create({ url: 'https://www.metatft.com/', active: false });

    for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        status.innerText = `Đang cào (${i + 1}/${units.length}): ${unit}`;
        
        // Điều hướng tab tới trang tướng
        await chrome.tabs.update(tab.id, { url: `https://www.metatft.com/units/${unit}?set=TFTSet17` });

        // Đợi 5 giây để trang load dữ liệu
        await new Promise(r => setTimeout(r, 5000));

        // Thực thi script cào trong tab đó
        const [response] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const rows = document.querySelectorAll('.ItemHolderRow');
                return Array.from(rows).map(row => ({
                    items: Array.from(row.querySelectorAll('.BuildImg img')).map(img => img.alt),
                    avg_place: row.querySelector('.ItemHolderStatAvgPlace .ItemHolderStatNum')?.innerText,
                    win_rate: row.querySelector('.ItemHolderStatNumPercent')?.innerText
                }));
            }
        });

        results.push({ unit, builds: response.result });
    }

    // Tải file xuống sau khi xong
    const blob = new Blob([JSON.stringify(results, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    // Lưu file (Dùng cách tải về trực tiếp)
    const a = document.createElement('a');
    a.href = url;
    a.download = `TFT_Full_Data.json`;
    a.click();

    status.innerText = "Hoàn thành! File đã tải về.";
    chrome.tabs.remove(tab.id); // Đóng tab sau khi xong
});