// --- 1. DỮ LIỆU GỐC DEFAULT (ĐÃ CHUẨN HOÁ SẠCH) ---
const RAW_DEFAULT_LINKS = [
    {
        link: "https://www.curseforge.com/minecraft-bedrock/texture-packs/the-ty-els-vietnamese-language-pack",
        title: "Gói Tiếng Việt The Ty Els",
        category: "addon",
        description: "Gói dịch tiếng Việt cho Minecraft Bedrock Edition, giúp người chơi trải nghiệm game bằng ngôn ngữ Việt Nam.",
        instructions: "Cài đặt gói tài nguyên vào mục Resource Packs."
    },
    {
        link: "https://www.curseforge.com/minecraft-bedrock/addons/dls-vanilla-waypoints",
        title: "DLS Vanilla Waypoints",
        category: "addon",
        instructions: "Chế tạo Waypoint Compass bằng la bàn và đá đỏ để lưu tọa độ dịch chuyển tức thời."
    },
    {
        link: "https://www.curseforge.com/minecraft-bedrock/addons/morph-into-mobs",
        title: "Morph Into Mobs",
        category: "addon",
        instructions: "Tiêu diệt quái vật để nhận khả năng biến hình thành chúng."
    },
    {
        link: "https://www.curseforge.com/minecraft-bedrock/texture-packs/xiaoboost-ultimate",
        title: "XiaoBoost Ultimate FPS",
        category: "mod",
        description: "Giảm lag, tăng FPS cho Minecraft Bedrock Edition trên thiết bị di động và máy tính bảng."
    },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/dta-one-block-made-by-dta-mc", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/squid-game-daniye", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/texture-packs/fps-optimizer-fps-boost", category: "mod" },
    { link: "https://www.curseforge.com/minecraft-bedrock/texture-packs/prizma-pbr-deferred-pack", category: "mod" },
    { link: "https://www.curseforge.com/minecraft-bedrock/texture-packs/realsource-realistic-pack", category: "mod" },
    { link: "https://www.curseforge.com/minecraft-bedrock/texture-packs/bare-bones-be", category: "mod" },
    { link: "https://www.curseforge.com/minecraft-bedrock/texture-packs/poggy-s-luminous-dreams-deferred-renderer-shader-pack-beta", category: "mod" },
    { link: "https://www.curseforge.com/minecraft-bedrock/texture-packs/the-ty-els-settings-overlay-ui-pack", category: "mod" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/more-body-actions-pickup-carry-cf", category: "addon" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/multiplayer-waypoint-system-cf", category: "addon" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/rise-and-survive", category: "addon" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/ape-one-block-wars", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/ultimate-pvp-map-one-click-kits-crystal-mace-spear", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/granny-samtiaka", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/ocean-one-block", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/lethalcraft", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/battle-mini-game", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/multiplayer-one-block", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/survival-100-days-bakuthebuilder", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/survival-island-achievements-on", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/all-in-one-map-v2-50-games-bot-pvp-mlg-races-boss", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/subow", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/playmate-bedrock-port-100-accurate-to-original", category: "addon" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/cuackys-house-hide-and-seek", category: "map" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/mecha-chameleon" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/hidden-blocks-unhider-addon" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/rise-and-survive" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/the-dream-blockball-ultimate" },
    { link: "https://www.curseforge.com/minecraft-bedrock/maps/kit-pvp-map-multiplayer-game" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/sky-drop-battle-royale-simulator-add-on" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/monster-invasion" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/keepinventory" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/skybound" },
    { link: "https://www.curseforge.com/minecraft-bedrock/addons/tree-capitator-achievement-friendly-tree-chopper" },
    { link: "" },
    { link: "" },
];

// Hàm bóc tách metadata từ URL chuẩn
function parseCurseforgeMetaFromUrl(url) {
    try {
        const parsed = new URL(url);
        const segments = parsed.pathname.split('/').filter(Boolean);
        let category = 'addon';
        let slug = 'addon';

        if (segments.length >= 3) {
            const rawCat = segments[1].toLowerCase();
            if (rawCat.includes('map')) category = 'map';
            else if (rawCat.includes('texture') || rawCat.includes('mod') || rawCat.includes('shader')) category = 'mod';
            else category = 'addon';
            slug = segments[2];
        } else if (segments.length === 2) {
            slug = segments[1];
        } else if (segments.length === 1) {
            slug = segments[0];
        }
        const readableTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return { link: url, slug, category, defaultTitle: readableTitle };
    } catch (e) {
        return { link: url, slug: 'curseforge-pack', category: 'addon', defaultTitle: 'CurseForge Resource' };
    }
}

// Chuẩn hoá mọi phần tử đầu vào về dạng object hoàn chỉnh
function normalizeRawLinks(list) {
    return list
        .map(item => {
            let url = '';
            let customProps = {};
            if (typeof item === 'string') {
                url = item.trim();
            } else if (item && typeof item === 'object' && item.link) {
                url = item.link.trim();
                customProps = item;
            }
            if (!url || !url.startsWith('http')) return null;

            const meta = parseCurseforgeMetaFromUrl(url);
            return {
                link: url,
                slug: meta.slug,
                title: customProps.title || meta.defaultTitle,
                category: customProps.category || meta.category,
                description: customProps.description || `Tài nguyên Minecraft: ${meta.defaultTitle}`,
                instructions: customProps.instructions || "",
                cover: customProps.cover || `https://placehold.co/240x240/0c0f18/f59e0b?text=${encodeURIComponent(meta.slug.substring(0, 4))}`,
                author: customProps.author || (url.includes('curseforge.com') ? 'CurseForge' : 'Tác giả'),
                files: customProps.files || []
            };
        })
        .filter(Boolean);
}

// --- 2. INDEXEDDB ENGINE ---
const DB_NAME = 'MCPE_Cosmos_DB';
const DB_VERSION = 1;
const STORE_RESOURCES = 'resources';
const STORE_TRANSLATIONS = 'translations';

let dbInstance = null;

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_RESOURCES)) {
                db.createObjectStore(STORE_RESOURCES, { keyPath: 'link' });
            }
            if (!db.objectStoreNames.contains(STORE_TRANSLATIONS)) {
                db.createObjectStore(STORE_TRANSLATIONS, { keyPath: 'link' });
            }
        };
        req.onsuccess = (e) => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        req.onerror = (e) => reject("Không thể mở IndexedDB: " + e.target.error);
    });
}

async function idbGet(storeName, key) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
}

async function idbPut(storeName, value) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(value);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbGetAll(storeName) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

async function idbClear(storeName) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

async function idbCount(storeName) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
    });
}

// --- 3. BIẾN TOÀN CỤC & TIỆN ÍCH ---
let resourceItems = [];
const DEFAULT_PROXY = "https://bold-night.year-tucking-0v.workers.dev/";
let currentProxy = localStorage.getItem('cf_proxy_url') || DEFAULT_PROXY;
let proxyMethod = localStorage.getItem('cf_proxy_method') || 'query';

let activeItem = null;
let activeTranslation = null;
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'newest';
let favorites = JSON.parse(localStorage.getItem('mcpe_cosmic_favs') || '[]');

let isTranslatedAll = false;
let isTranslatingAll = false;
const backgroundQueue = [];
let isBackgroundProcessing = false;

function triggerHaptic() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
    }
}

function isCurseforgeUrl(url) {
    return typeof url === 'string' && url.includes('curseforge.com');
}

function buildProxyUrl(targetUrl, method = proxyMethod) {
    const cleanProxy = currentProxy.endsWith('/') ? currentProxy : currentProxy + '/';
    if (method === 'query') {
        return `${cleanProxy}?url=${encodeURIComponent(targetUrl)}`;
    } else {
        return `${cleanProxy}${targetUrl.replace(/^https?:\/\//, '')}`;
    }
}

function updateProxyBadgeText() {
    const badge = document.getElementById('proxyStatusBadge');
    if (!badge) return;
    try {
        const u = new URL(currentProxy);
        badge.textContent = u.hostname.split('.')[0] || 'Proxy';
    } catch (e) {
        badge.textContent = 'Proxy';
    }
}

// --- 4. ENGINE CÀO MẠNG QUA PROXY & CẬP NHẬT DB ---
async function fetchCurseforgeResourceOnline(itemOrUrl) {
    const targetUrl = typeof itemOrUrl === 'string' ? itemOrUrl : itemOrUrl.link;
    const isCF = isCurseforgeUrl(targetUrl);
    const meta = parseCurseforgeMetaFromUrl(targetUrl);

    const existingRecord = await idbGet(STORE_RESOURCES, targetUrl);

    const record = {
        link: targetUrl,
        slug: meta.slug,
        title: (existingRecord && existingRecord.title && !existingRecord.title.includes('CurseForge Resource'))
            ? existingRecord.title
            : meta.defaultTitle,
        category: (existingRecord && existingRecord.category) ? existingRecord.category : meta.category,
        version: "1.21+",
        fileSize: (existingRecord && existingRecord.fileSize) ? existingRecord.fileSize : "Tự do",
        fileType: ".mcaddon",
        author: isCF ? "CurseForge" : "Tác giả",
        authorUrl: targetUrl,
        cover: (existingRecord && existingRecord.cover && !existingRecord.cover.includes('placehold.co'))
            ? existingRecord.cover
            : `https://placehold.co/600x400/0c0f18/f59e0b?text=${encodeURIComponent(meta.defaultTitle)}`,
        description: (existingRecord && existingRecord.description && !existingRecord.description.includes('Đang tải'))
            ? existingRecord.description
            : `Tài nguyên Minecraft Bedrock: ${meta.defaultTitle}.`,
        instructions: existingRecord?.instructions || "",
        downloadUrl: existingRecord?.downloadUrl || "",
        files: (existingRecord && existingRecord.files && existingRecord.files.length > 0) ? existingRecord.files : [],
        lastUpdated: Date.now()
    };

    if (!isCF) {
        const fileName = targetUrl.split('/').pop().split('?')[0] || `${meta.slug}.mcaddon`;
        record.files = [{
            id: 'custom_direct',
            displayName: record.title,
            fileName: fileName.includes('.') ? fileName : `${fileName}.mcaddon`,
            fileLength: 0,
            releaseType: 'Direct',
            gameVersions: ['Bedrock 1.21+'],
            downloadUrl: targetUrl,
            date: 'Mới'
        }];
        await idbPut(STORE_RESOURCES, record);
        return record;
    }

    const proxyUrl = buildProxyUrl(targetUrl);
    try {
        const response = await fetch(proxyUrl, {
            headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml,application/json' }
        });

        if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const json = await response.json();
                const p = json.data || json;
                if (p.name) record.title = p.name;
                if (p.summary) record.description = p.summary;
                if (p.logo?.url || p.avatarUrl) record.cover = p.logo?.url || p.avatarUrl;
                if (p.authors && p.authors[0]) record.author = p.authors[0].name;
                if (p.latestFiles) {
                    record.files = p.latestFiles.map(f => ({
                        id: f.id,
                        displayName: f.displayName || f.fileName,
                        fileName: f.fileName,
                        fileLength: f.fileLength || 0,
                        releaseType: f.releaseType === 1 ? 'Release' : 'Beta',
                        gameVersions: f.gameVersions || ['Bedrock'],
                        downloadUrl: f.downloadUrl || `https://www.curseforge.com/api/v1/mods/${p.id || f.modId}/files/${f.id}/download`,
                        date: f.fileDate ? new Date(f.fileDate).toLocaleDateString('vi-VN') : 'Mới'
                    }));
                }
            } else {
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const nextDataEl = doc.getElementById('__NEXT_DATA__');
                if (nextDataEl) {
                    try {
                        const nextData = JSON.parse(nextDataEl.textContent);
                        const pageProps = nextData?.props?.pageProps;
                        const project = pageProps?.project || pageProps?.mod || pageProps?.initialData?.project;

                        if (project) {
                            if (project.name) record.title = project.name;
                            if (project.summary) record.description = project.summary;
                            if (project.avatarUrl || project.logo?.url) record.cover = project.avatarUrl || project.logo?.url;
                            if (project.authors?.[0]) record.author = project.authors[0].name || record.author;
                        }

                        const rawFiles = pageProps?.files || pageProps?.initialData?.files || project?.latestFiles || [];
                        if (Array.isArray(rawFiles) && rawFiles.length > 0) {
                            record.files = rawFiles.map(f => ({
                                id: f.id,
                                displayName: f.displayName || f.fileName || `${meta.slug}.mcaddon`,
                                fileName: f.fileName || `${meta.slug}.mcaddon`,
                                fileLength: f.fileLength || 0,
                                releaseType: f.releaseType === 1 ? 'Release' : 'Beta',
                                gameVersions: f.gameVersions || ['Bedrock'],
                                downloadUrl: f.downloadUrl || `https://www.curseforge.com/api/v1/mods/${project?.id || f.modId}/files/${f.id}/download`,
                                date: f.fileDate ? new Date(f.fileDate).toLocaleDateString('vi-VN') : 'Mới'
                            }));
                        }
                    } catch (e) { }
                }

                const ogTitle = doc.querySelector('meta[property="og:title"]');
                if (ogTitle && ogTitle.content) {
                    record.title = ogTitle.content.split('-')[0].trim();
                }
                const ogDesc = doc.querySelector('meta[property="og:description"]');
                if (ogDesc && ogDesc.content) record.description = ogDesc.content;
                const ogImg = doc.querySelector('meta[property="og:image"]');
                if (ogImg && ogImg.content) record.cover = ogImg.content;
            }
        }
    } catch (err) {
        console.warn(`Lỗi bóc tách mạng link ${targetUrl}:`, err);
    }

    if (!record.files || record.files.length === 0) {
        record.files = [{
            id: 'latest',
            displayName: `${record.title} (Bản mới)`,
            fileName: `${meta.slug}.mcaddon`,
            fileLength: 0,
            releaseType: 'Release',
            gameVersions: ['Bedrock 1.21+'],
            downloadUrl: `${targetUrl}/download`,
            date: 'Mới'
        }];
    }

    await idbPut(STORE_RESOURCES, record);
    return record;
}

// --- 5. HÀNG ĐỢI LAZY INGESTION ---
function enqueueBackgroundSync(link) {
    if (backgroundQueue.includes(link)) return;
    backgroundQueue.push(link);
    processBackgroundSync();
}

async function processBackgroundSync() {
    if (isBackgroundProcessing || backgroundQueue.length === 0) {
        updateStorageModalStats();
        return;
    }
    isBackgroundProcessing = true;
    updateStorageModalStats();

    const link = backgroundQueue.shift();
    try {
        const fresh = await fetchCurseforgeResourceOnline(link);
        updateCardInDOM(fresh);

        const idx = resourceItems.findIndex(i => i.link === fresh.link);
        if (idx !== -1) {
            resourceItems[idx] = fresh;
        }
        updateRealStats();
        updateDbBadge();
    } catch (err) {
        console.warn("Lỗi lazy sync link:", link, err);
    }

    setTimeout(() => {
        isBackgroundProcessing = false;
        processBackgroundSync();
    }, 300);
}

function updateCardInDOM(item) {
    const safeId = encodeURIComponent(item.link);
    const cardEl = document.querySelector(`[data-card-link="${safeId}"]`);
    if (!cardEl) return;

    const imgEl = cardEl.querySelector('.card-img');
    if (imgEl && item.cover && !imgEl.src.includes(item.cover)) {
        imgEl.src = item.cover;
    }
    const titleEl = cardEl.querySelector('.card-title');
    if (titleEl) {
        titleEl.textContent = item.title;
    }
    const descEl = cardEl.querySelector('.card-desc');
    if (descEl) {
        descEl.textContent = item.description;
    }
    const authorEl = cardEl.querySelector('.card-author');
    if (authorEl) {
        authorEl.textContent = item.author;
    }
}

// --- 6. CORE: ĐỒNG BỘ JS VÀO INDEXEDDB ---
async function syncDatabaseFromJS() {
    const cachedRecords = await idbGetAll(STORE_RESOURCES);
    const cachedMap = new Map(cachedRecords.map(item => [item.link, item]));

    // Chuẩn hóa toàn bộ link từ file JS
    const cleanRawItems = normalizeRawLinks(RAW_DEFAULT_LINKS);

    // Link thêm từ modal thủ công
    const customLinks = JSON.parse(localStorage.getItem('mcpe_custom_added_links') || '[]');
    const existingLinks = new Set(cleanRawItems.map(i => i.link));

    customLinks.forEach(link => {
        if (!existingLinks.has(link)) {
            const meta = parseCurseforgeMetaFromUrl(link);
            cleanRawItems.push({
                link,
                slug: meta.slug,
                title: meta.defaultTitle,
                category: meta.category,
                description: `Tài nguyên: ${meta.defaultTitle}`,
                cover: `https://placehold.co/240x240/0c0f18/f59e0b?text=${encodeURIComponent(meta.slug.substring(0, 4))}`,
                author: 'Tác giả',
                files: []
            });
            existingLinks.add(link);
        }
    });

    const combinedItems = [];
    const missingOrIncompleteQueue = [];
    let newItemsCount = 0;

    for (const rawItem of cleanRawItems) {
        if (cachedMap.has(rawItem.link)) {
            const cached = cachedMap.get(rawItem.link);
            const isMissingDetails = !cached.files || cached.files.length === 0 || !cached.cover || cached.cover.includes('placehold.co');

            if (isMissingDetails && isCurseforgeUrl(rawItem.link)) {
                missingOrIncompleteQueue.push(rawItem.link);
            }
            // Đảm bảo không bị mất category
            if (!cached.category) cached.category = rawItem.category;
            combinedItems.push(cached);
        } else {
            // MỤC MỚI: Đưa vào DB ngay lập tức
            newItemsCount++;
            const placeholder = {
                link: rawItem.link,
                slug: rawItem.slug,
                title: rawItem.title,
                category: rawItem.category || 'addon',
                version: "1.21+",
                fileSize: "Tự do",
                fileType: ".mcaddon",
                author: rawItem.author,
                authorUrl: rawItem.link,
                cover: rawItem.cover,
                description: rawItem.description,
                instructions: rawItem.instructions || "",
                files: [],
                lastUpdated: Date.now()
            };

            await idbPut(STORE_RESOURCES, placeholder);
            combinedItems.push(placeholder);
            missingOrIncompleteQueue.push(rawItem.link);
        }
    }

    resourceItems = combinedItems;
    renderItemsGrid();
    updateDbBadge();

    if (missingOrIncompleteQueue.length > 0) {
        missingOrIncompleteQueue.forEach(link => enqueueBackgroundSync(link));
        if (newItemsCount > 0) {
            showToast(`Đã đồng bộ ${newItemsCount} tài nguyên mới vào DB!`, 'info');
        }
    }
}

async function checkInitialSetupRequired() {
    const count = await idbCount(STORE_RESOURCES);
    if (count === 0) {
        document.getElementById('initialSetupModal').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    } else {
        await syncDatabaseFromJS();
    }
}

async function startInitialDownloadPackage(packageType) {
    const progressBox = document.getElementById('initialDownloadProgressBox');
    const statusText = document.getElementById('initialProgressStatus');
    const percentText = document.getElementById('initialProgressPercent');
    const progressBar = document.getElementById('initialProgressBar');

    progressBox.classList.remove('hidden');

    let targetList = normalizeRawLinks(RAW_DEFAULT_LINKS);
    if (packageType === 'basic') {
        targetList = targetList.slice(0, 50);
    }

    const total = targetList.length;
    showToast(`Đang nạp dữ liệu khởi tạo (${total} mục)...`, 'info');

    for (let i = 0; i < total; i++) {
        const item = targetList[i];
        statusText.textContent = `Đang nạp (${i + 1}/${total}): ${item.title}`;
        const pct = Math.round(((i + 1) / total) * 100);
        percentText.textContent = `${pct}%`;
        progressBar.style.width = `${pct}%`;

        await fetchCurseforgeResourceOnline(item.link);
        await new Promise(r => setTimeout(r, 100));
    }

    localStorage.setItem('mcpe_db_initialized', 'true');
    showToast("Đã thiết lập cơ sở dữ liệu thành công!", "success");

    setTimeout(() => {
        document.getElementById('initialSetupModal').classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        syncDatabaseFromJS();
    }, 500);
}

async function syncMissingResourcesFromBackground(notifyUser = false) {
    await syncDatabaseFromJS();
    if (notifyUser && backgroundQueue.length === 0) {
        showToast("Dữ liệu IndexedDB đã khớp hoàn toàn với file JS!", "success");
    }
}

// --- 7. TÍNH NĂNG DỊCH THUẬT VÀ CACHE DB ---
async function translateWithGoogle(text, targetLang = 'vi') {
    if (!text || !text.trim()) return text;
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    try {
        const res = await fetch(googleUrl);
        if (!res.ok) throw new Error("Direct translate error");
        const json = await res.json();
        if (json && json[0]) return json[0].map(item => item[0]).join('');
    } catch (errDirect) {
        try {
            const proxiedGoogle = buildProxyUrl(googleUrl);
            const resProxy = await fetch(proxiedGoogle);
            const jsonProxy = await resProxy.json();
            if (jsonProxy && jsonProxy[0]) return jsonProxy[0].map(item => item[0]).join('');
        } catch (errProxy) {
            throw new Error("Không thể kết nối máy chủ Google Dịch.");
        }
    }
    return text;
}

async function toggleTranslateAll() {
    if (isTranslatingAll) return;
    const btnText = document.getElementById('translateAllBtnText');
    const progressBadge = document.getElementById('translateAllProgress');

    if (isTranslatedAll) {
        isTranslatedAll = false;
        btnText.textContent = "Dịch toàn bộ";
        progressBadge.classList.add('hidden');
        syncDatabaseFromJS();
        showToast("Đã khôi phục ngôn ngữ gốc", "info");
        return;
    }

    isTranslatingAll = true;
    btnText.textContent = "Đang dịch...";
    progressBadge.classList.remove('hidden');

    const total = resourceItems.length;
    let current = 0;

    for (const item of resourceItems) {
        current++;
        progressBadge.textContent = `${current}/${total}`;

        let translation = await idbGet(STORE_TRANSLATIONS, item.link);
        if (!translation) {
            try {
                const rawTitle = item.title;
                const rawDesc = item.description || `Tài nguyên: ${rawTitle}`;
                const [viTitle, viDesc] = await Promise.all([
                    translateWithGoogle(rawTitle),
                    translateWithGoogle(rawDesc)
                ]);
                translation = { link: item.link, title: viTitle, desc: viDesc };
                await idbPut(STORE_TRANSLATIONS, translation);
            } catch (e) {
                console.warn("Lỗi dịch link:", item.link);
            }
            await new Promise(r => setTimeout(r, 60));
        }

        const cardEl = document.querySelector(`[data-card-link="${encodeURIComponent(item.link)}"]`);
        if (cardEl && translation) {
            const titleEl = cardEl.querySelector('.card-title');
            const descEl = cardEl.querySelector('.card-desc');
            if (titleEl) titleEl.textContent = translation.title;
            if (descEl) descEl.textContent = translation.desc;
        }
    }

    isTranslatingAll = false;
    isTranslatedAll = true;
    btnText.textContent = "Bản gốc";
    progressBadge.textContent = "Hoàn tất";
    showToast("Đã dịch toàn bộ sang tiếng Việt!", "success");
}

async function toggleGoogleTranslation() {
    if (!activeItem) return;

    const btnText = document.getElementById('translateBtnText');
    const stateBadge = document.getElementById('translationStateBadge');
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDescription');

    if (activeTranslation) {
        titleEl.textContent = activeTranslation.originalTitle;
        descEl.textContent = activeTranslation.originalDesc;
        btnText.textContent = "Dịch tiếng Việt";
        stateBadge.textContent = "Ngôn ngữ gốc";
        activeTranslation = null;
        showToast("Đã khôi phục ngôn ngữ gốc", "info");
        return;
    }

    let cachedTrans = await idbGet(STORE_TRANSLATIONS, activeItem.link);
    if (cachedTrans) {
        activeTranslation = {
            originalTitle: activeItem.title,
            originalDesc: activeItem.description,
            viTitle: cachedTrans.title,
            viDesc: cachedTrans.desc
        };
        titleEl.textContent = cachedTrans.title;
        descEl.textContent = cachedTrans.desc;
        btnText.textContent = "Bản gốc";
        stateBadge.textContent = "Đã dịch Google (Từ DB)";
        return;
    }

    btnText.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Đang dịch...`;
    try {
        const [transTitle, transDesc] = await Promise.all([
            translateWithGoogle(activeItem.title),
            translateWithGoogle(activeItem.description)
        ]);

        await idbPut(STORE_TRANSLATIONS, { link: activeItem.link, title: transTitle, desc: transDesc });

        activeTranslation = {
            originalTitle: activeItem.title,
            originalDesc: activeItem.description,
            viTitle: transTitle,
            viDesc: transDesc
        };

        titleEl.textContent = transTitle;
        descEl.textContent = transDesc;
        btnText.textContent = "Bản gốc";
        stateBadge.textContent = "Đã dịch Google";
        showToast("Đã dịch và lưu vào DB!", "success");
    } catch (e) {
        showToast(e.message || "Lỗi khi dịch", "error");
        btnText.textContent = "Dịch tiếng Việt";
    }
}

// --- 8. RENDER VIEW & THỐNG KÊ ---
function renderItemsGrid() {
    const grid = document.getElementById('itemsGrid');
    const emptyState = document.getElementById('emptyState');
    const resultCount = document.getElementById('resultCount');

    if (resourceItems.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        resultCount.textContent = '0';
        updateRealStats();
        return;
    }

    emptyState.classList.add('hidden');

    const cardsHtml = resourceItems.map(item => {
        const safeId = encodeURIComponent(item.link);
        const isCF = isCurseforgeUrl(item.link);

        if (currentCategory !== 'all' && item.category !== currentCategory) return '';

        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim();
            const mTitle = (item.title || '').toLowerCase().includes(q);
            const mAuthor = (item.author || '').toLowerCase().includes(q);
            const mDesc = (item.description || '').toLowerCase().includes(q);
            if (!mTitle && !mAuthor && !mDesc) return '';
        }

        const isFav = favorites.includes(item.link);
        let catBadge = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        if (item.category === 'map') catBadge = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (item.category === 'mod') catBadge = 'text-sky-400 bg-sky-500/10 border-sky-500/20';

        return `
            <div class="flat-card p-3 flex flex-col justify-between group" data-card-link="${safeId}">
                <div class="flex items-start gap-2.5">
                    <div onclick="openDetailModal('${safeId}'); triggerHaptic();" 
                        class="relative w-20 h-20 rounded-lg overflow-hidden bg-[#060810] flex-shrink-0 cursor-pointer border border-white/[0.08]">
                        <img src="${item.cover}" alt="${item.title}" 
                            class="card-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy" onerror="this.src='https://placehold.co/200x200/0c0f18/f59e0b?text=MCPE'">
                        <span class="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[8px] ${isCF ? 'text-emerald-400 border border-emerald-500/20' : 'text-sky-400 border border-sky-500/20'}">
                            ${isCF ? 'CF' : 'DIRECT'}
                        </span>
                    </div>

                    <div class="flex-1 min-w-0 flex flex-col justify-between min-h-[5rem]">
                        <div>
                            <div class="flex items-center justify-between gap-1 mb-1">
                                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${catBadge}">
                                    ${item.category}
                                </span>
                                <button onclick="toggleFavorite('${safeId}'); triggerHaptic();" 
                                    class="p-1 text-zinc-500 hover:text-red-400 active:scale-90 transition-all" title="Yêu thích">
                                    <i class="fa-${isFav ? 'solid text-red-500' : 'regular'} fa-heart text-[12px]"></i>
                                </button>
                            </div>
                            <h3 onclick="openDetailModal('${safeId}'); triggerHaptic();" 
                                class="card-title text-xs font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-2 leading-tight" title="${item.title}">
                                ${item.title}
                            </h3>
                        </div>

                        <div class="flex items-center justify-between gap-1.5 pt-1.5">
                            <span class="card-author text-[10px] text-zinc-400 truncate max-w-[80px]" title="${item.author}">
                                ${item.author}
                            </span>
                            <button onclick="quickDownloadItem('${safeId}'); triggerHaptic();" 
                                class="btn-flat-primary px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 whitespace-nowrap active:scale-95">
                                <i class="fa-solid fa-download text-[9px]"></i> Tải về
                            </button>
                        </div>
                    </div>
                </div>

                <div class="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[11px]">
                    <p class="card-desc text-zinc-400 line-clamp-1 flex-1 font-light" title="${item.description}">
                        ${item.description}
                    </p>
                    <button onclick="openDetailModal('${safeId}'); triggerHaptic();" 
                        class="text-amber-400 hover:text-amber-300 text-[10px] font-semibold flex items-center gap-1 whitespace-nowrap">
                        <span>Chi tiết</span>
                        <i class="fa-solid fa-chevron-right text-[8px]"></i>
                    </button>
                </div>
            </div>
            `;
    }).filter(Boolean);

    grid.innerHTML = cardsHtml.join('');
    resultCount.textContent = cardsHtml.length;
    updateRealStats();
}

async function updateDbBadge() {
    const count = await idbCount(STORE_RESOURCES);
    const badge = document.getElementById('dbCacheStatusBadge');
    if (badge) badge.textContent = `DB: ${count}`;
}

function updateRealStats() {
    const mapCount = resourceItems.filter(i => i.category === 'map').length;
    const addonCount = resourceItems.filter(i => i.category === 'addon').length;
    const modCount = resourceItems.filter(i => i.category === 'mod').length;

    document.getElementById('statLinksCount').textContent = resourceItems.length;
    document.getElementById('statAddons').textContent = addonCount;
    document.getElementById('statMaps').textContent = mapCount;
    document.getElementById('statMods').textContent = modCount;

    document.getElementById('badgeCatAll').textContent = resourceItems.length;
    document.getElementById('badgeCatAddon').textContent = addonCount;
    document.getElementById('badgeCatMap').textContent = mapCount;
    document.getElementById('badgeCatMod').textContent = modCount;

    const badge = document.getElementById('headerFavCount');
    if (badge) badge.textContent = favorites.length;
    const mobileBadge = document.getElementById('mobileFavBadge');
    if (mobileBadge) mobileBadge.textContent = favorites.length;
}

// --- 9. MODAL QUẢN LÝ BỘ NHỚ ---
async function openStorageModal() {
    await updateStorageModalStats();
    document.getElementById('storageModal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeStorageModal() {
    document.getElementById('storageModal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

async function updateStorageModalStats() {
    const resCount = await idbCount(STORE_RESOURCES);
    const transCount = await idbCount(STORE_TRANSLATIONS);

    const countEl = document.getElementById('storageCachedCount');
    const transEl = document.getElementById('storageTranslationCount');
    const queueEl = document.getElementById('storageQueueStatus');

    if (countEl) countEl.textContent = `${resCount} mục`;
    if (transEl) transEl.textContent = `${transCount} mục`;
    if (queueEl) {
        queueEl.textContent = isBackgroundProcessing ? `Đang xử lý (${backgroundQueue.length})` : 'Sẵn sàng';
        queueEl.className = isBackgroundProcessing ? 'font-mono text-amber-400 font-bold' : 'font-mono text-emerald-400 font-bold';
    }
}

async function clearIndexedDBCache() {
    if (!confirm("Bạn có chắc chắn muốn xóa sạch toàn bộ IndexedDB? Dữ liệu sẽ nạp lại từ đầu.")) return;
    await idbClear(STORE_RESOURCES);
    await idbClear(STORE_TRANSLATIONS);
    localStorage.removeItem('mcpe_db_initialized');
    localStorage.removeItem('mcpe_custom_added_links');
    showToast("Đã xóa sạch bộ nhớ IndexedDB!", "info");
    closeStorageModal();
    location.reload();
}

async function triggerManualFullRebuild() {
    closeStorageModal();
    document.getElementById('initialSetupModal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

// --- 10. MODAL CHI TIẾT ---
async function openDetailModal(encodedLink) {
    const targetUrl = decodeURIComponent(encodedLink);
    const modal = document.getElementById('detailModal');

    activeTranslation = null;
    document.getElementById('translateBtnText').textContent = "Dịch tiếng Việt";
    document.getElementById('translationStateBadge').textContent = "Ngôn ngữ gốc";

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    let item = await idbGet(STORE_RESOURCES, targetUrl);
    if (!item) {
        item = resourceItems.find(i => i.link === targetUrl) || { link: targetUrl };
    }
    activeItem = item;

    document.getElementById('modalCover').src = item.cover || 'https://placehold.co/600x400/0c0f18/f59e0b?text=MCPE';
    document.getElementById('modalCategoryBadge').textContent = (item.category || 'ADDON').toUpperCase();
    document.getElementById('modalFileSize').textContent = item.fileSize || 'Sẵn sàng';
    document.getElementById('modalTitle').textContent = item.title || 'Đang cập nhật';
    document.getElementById('modalAuthor').textContent = item.author || 'CurseForge';
    document.getElementById('modalAuthorLink').href = item.link;
    document.getElementById('modalDescription').textContent = item.description || 'Chưa có mô tả chi tiết.';

    const customGuideBox = document.getElementById('customInstructionsBox');
    const customGuideText = document.getElementById('customInstructionsText');
    if (item.instructions && item.instructions.trim()) {
        customGuideText.textContent = item.instructions.trim();
        customGuideBox.classList.remove('hidden');
    } else {
        customGuideBox.classList.add('hidden');
    }

    updateModalFavIcon();
    switchModalTab('desc');
    renderModalFiles(item);

    if (!item.files || item.files.length === 0) {
        fetchCurseforgeResourceOnline(item).then(updatedItem => {
            if (activeItem && activeItem.link === updatedItem.link) {
                activeItem = updatedItem;
                renderModalFiles(updatedItem);
                document.getElementById('modalCover').src = updatedItem.cover;
                document.getElementById('modalTitle').textContent = updatedItem.title;
                document.getElementById('modalDescription').textContent = updatedItem.description;
                updateCardInDOM(updatedItem);
            }
        });
    }
}

function renderModalFiles(item) {
    const filesContainer = document.getElementById('proxyFilesContainer');
    const loading = document.getElementById('proxyLoading');
    const errorNotice = document.getElementById('proxyErrorNotice');
    const extractorBadge = document.getElementById('extractorBadge');
    const fallbackBtn = document.getElementById('fallbackRawLinkBtn');

    loading.classList.add('hidden');
    errorNotice.classList.add('hidden');
    fallbackBtn.href = item.link;

    if (!item.files || item.files.length === 0) {
        extractorBadge.textContent = 'Link gốc';
        filesContainer.classList.add('hidden');
        errorNotice.classList.remove('hidden');
        return;
    }

    filesContainer.classList.remove('hidden');
    const isCF = isCurseforgeUrl(item.link);
    extractorBadge.textContent = isCF ? `${item.files.length} tệp (IndexedDB)` : 'Tải trực tiếp (Nguồn riêng)';

    filesContainer.innerHTML = item.files.map(f => {
        const downloadDirect = isCF ? buildProxyUrl(f.downloadUrl) : f.downloadUrl;
        const sizeText = f.fileLength ? (f.fileLength / (1024 * 1024)).toFixed(1) + ' MB' : (item.fileSize || 'Tự do');

        return `
            <div class="p-2 rounded-lg bg-[#060810] border border-white/[0.08] flex items-center justify-between gap-2">
                <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[8px] px-1 py-0.2 rounded uppercase font-mono ${isCF ? 'text-emerald-400 bg-emerald-500/10' : 'text-sky-400 bg-sky-500/10'}">${f.releaseType || 'File'}</span>
                        <h5 class="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-xs">${f.displayName}</h5>
                    </div>
                    <div class="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>${f.fileName}</span>
                        <span>•</span>
                        <span class="text-amber-300">${sizeText}</span>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <button onclick="copyToClipboardText('${f.downloadUrl}'); triggerHaptic();" class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 text-xs" title="Sao chép link">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <a href="${downloadDirect}" target="_blank" rel="noopener noreferrer" class="btn-flat-primary px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                        <i class="fa-solid fa-download text-[9px]"></i> ${isCF ? 'Tải tệp' : 'Tải trực tiếp'}
                    </a>
                </div>
            </div>
            `;
    }).join('');
}

function quickDownloadItem(encodedLink) {
    const targetUrl = decodeURIComponent(encodedLink);
    const item = resourceItems.find(i => i.link === targetUrl);
    const isCF = isCurseforgeUrl(targetUrl);

    if (item && item.files && item.files.length > 0) {
        const file = item.files[0];
        const finalUrl = isCF ? buildProxyUrl(file.downloadUrl) : file.downloadUrl;
        showToast(`Đang mở tải: ${file.displayName || file.fileName}...`, 'info');
        window.open(finalUrl, '_blank');
    } else {
        openDetailModal(encodedLink);
    }
}

function startDownloadProcess() {
    if (!activeItem) return;
    const isCF = isCurseforgeUrl(activeItem.link);
    const directTarget = activeItem.downloadUrl || activeItem.files?.[0]?.downloadUrl;

    if (directTarget) {
        const finalTarget = isCF ? buildProxyUrl(directTarget) : directTarget;
        showToast(`Đang chuyển hướng tải...`, 'info');
        window.open(finalTarget, '_blank');
    } else {
        window.open(activeItem.link, '_blank');
    }
}

function switchModalTab(tab) {
    const descContent = document.getElementById('tabContentDesc');
    const installContent = document.getElementById('tabContentInstall');
    const descBtn = document.getElementById('tabBtnDesc');
    const installBtn = document.getElementById('tabBtnInstall');

    if (tab === 'desc') {
        descContent.classList.remove('hidden');
        installContent.classList.add('hidden');
        descBtn.className = "px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30";
        installBtn.className = "px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white";
    } else {
        descContent.classList.add('hidden');
        installContent.classList.remove('hidden');
        installBtn.className = "px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30";
        descBtn.className = "px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white";
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    activeItem = null;
    activeTranslation = null;
}

// --- 11. THÊM TÀI NGUYÊN THỦ CÔNG ---
async function handleResourceSubmit(e) {
    e.preventDefault();
    const link = document.getElementById('modalLinkInput').value.trim();
    if (!link) return;

    await saveNewCustomResource(link);
    closeSubmitModal();
}

async function handleQuickAddLink(e) {
    e.preventDefault();
    const input = document.getElementById('quickLinkInput');
    const link = input.value.trim();
    if (!link) return;

    await saveNewCustomResource(link);
    input.value = '';
}

async function saveNewCustomResource(link) {
    let stored = JSON.parse(localStorage.getItem('mcpe_custom_added_links') || '[]');
    if (!stored.includes(link)) {
        stored.unshift(link);
    }
    localStorage.setItem('mcpe_custom_added_links', JSON.stringify(stored));

    showToast("Đang bóc tách & lưu vào IndexedDB...", "info");
    await fetchCurseforgeResourceOnline(link);
    await syncDatabaseFromJS();
    showToast("Đã lưu tài nguyên thành công!", "success");
}

// --- 12. RƯƠNG YÊU THÍCH ---
function toggleFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (modal.classList.contains('hidden')) {
        renderFavoritesList();
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    } else {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

function toggleFavorite(encodedLink) {
    const link = decodeURIComponent(encodedLink);
    const idx = favorites.indexOf(link);
    if (idx > -1) {
        favorites.splice(idx, 1);
        showToast("Đã xóa khỏi rương", "info");
    } else {
        favorites.push(link);
        showToast("Đã thêm vào rương!", "success");
    }
    localStorage.setItem('mcpe_cosmic_favs', JSON.stringify(favorites));
    updateRealStats();
    renderItemsGrid();
    if (activeItem && activeItem.link === link) updateModalFavIcon();
    if (!document.getElementById('favoritesModal').classList.contains('hidden')) renderFavoritesList();
}

function toggleFavoriteFromModal() {
    if (!activeItem) return;
    toggleFavorite(encodeURIComponent(activeItem.link));
}

function updateModalFavIcon() {
    const btn = document.getElementById('modalFavBtn');
    if (!btn || !activeItem) return;
    const isFav = favorites.includes(activeItem.link);
    btn.innerHTML = `<i class="fa-${isFav ? 'solid text-red-500' : 'regular'} fa-heart text-xs"></i>`;
}

function renderFavoritesList() {
    const list = document.getElementById('favoritesList');
    const favItems = resourceItems.filter(i => favorites.includes(i.link));
    if (favItems.length === 0) {
        list.innerHTML = `<div class="py-12 text-center text-zinc-500 text-xs">Rương đồ hiện đang trống.</div>`;
        return;
    }
    list.innerHTML = favItems.map(item => {
        const safeId = encodeURIComponent(item.link);
        return `
            <div class="p-2 rounded-lg bg-[#060810] border border-white/5 flex items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2 min-w-0 cursor-pointer" onclick="toggleFavoritesModal(); openDetailModal('${safeId}'); triggerHaptic();">
                    <img src="${item.cover}" class="w-8 h-8 rounded object-cover flex-shrink-0" onerror="this.src='https://placehold.co/80x80/0c0f18/f59e0b?text=MCPE'">
                    <div class="min-w-0">
                        <h4 class="font-bold text-white truncate text-[11px]">${item.title}</h4>
                    </div>
                </div>
                <button onclick="toggleFavorite('${safeId}'); triggerHaptic();" class="p-1 text-red-400 hover:text-red-300">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
            `;
    }).join('');
}

function clearAllFavorites() {
    favorites = [];
    localStorage.setItem('mcpe_cosmic_favs', JSON.stringify(favorites));
    updateRealStats();
    renderFavoritesList();
    renderItemsGrid();
    if (activeItem) updateModalFavIcon();
    showToast("Đã dọn sạch rương", "info");
}

// --- 13. TIỆN ÍCH LỌC VÀ TÌM KIẾM ---
function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        const active = btn.getAttribute('data-cat') === cat;
        btn.className = active
            ? "category-btn active px-3 py-1.5 rounded-lg bg-white/5 border border-amber-500/40 text-amber-400 font-semibold flex items-center gap-1.5 whitespace-nowrap"
            : "category-btn px-3 py-1.5 rounded-lg bg-transparent border border-white/5 text-zinc-400 hover:text-white font-medium flex items-center gap-1.5 whitespace-nowrap";
    });
    renderItemsGrid();
}

function syncSearch(val) {
    searchQuery = val;
    const d = document.getElementById('desktopSearchInput');
    const m = document.getElementById('mobileSearchInput');
    if (d && d.value !== val) d.value = val;
    if (m && m.value !== val) m.value = val;
    renderItemsGrid();
}

function focusMobileSearch() {
    const m = document.getElementById('mobileSearchInput');
    if (m) {
        m.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => m.focus(), 250);
    }
}

function handleSort(val) {
    currentSort = val;
    if (val === 'title') {
        resourceItems.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else {
        resourceItems.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
    }
    renderItemsGrid();
}

function resetFilters() {
    currentCategory = 'all';
    searchQuery = '';
    document.getElementById('desktopSearchInput').value = '';
    const m = document.getElementById('mobileSearchInput');
    if (m) m.value = '';
    setCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSubmitModal() {
    document.getElementById('submitModal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeSubmitModal() {
    document.getElementById('submitModal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function openProxyConfigModal() {
    document.getElementById('configProxyUrlInput').value = currentProxy;
    document.getElementById('configProxyMethodSelect').value = proxyMethod;
    document.getElementById('proxyConfigModal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeProxyConfigModal() {
    document.getElementById('proxyConfigModal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function saveProxyConfig() {
    const val = document.getElementById('configProxyUrlInput').value.trim();
    if (!val) return showToast("Địa chỉ không được để trống", "error");
    currentProxy = val;
    proxyMethod = document.getElementById('configProxyMethodSelect').value;
    localStorage.setItem('cf_proxy_url', currentProxy);
    localStorage.setItem('cf_proxy_method', proxyMethod);
    updateProxyBadgeText();
    closeProxyConfigModal();
    showToast("Đã lưu cấu hình Proxy!", "success");
}

function resetProxyConfig() {
    currentProxy = DEFAULT_PROXY;
    proxyMethod = 'query';
    localStorage.removeItem('cf_proxy_url');
    localStorage.removeItem('cf_proxy_method');
    updateProxyBadgeText();
    closeProxyConfigModal();
    showToast("Đã đặt lại mặc định", "info");
}

function copyToClipboardText(text) {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    try {
        document.execCommand('copy');
        showToast("Đã sao chép liên kết!", "success");
    } catch (e) {
        showToast("Không thể sao chép", "error");
    }
    document.body.removeChild(dummy);
}

async function copyShareLink() {
    if (!activeItem) return;
    if (navigator.share) {
        try {
            await navigator.share({
                title: activeItem.title,
                text: `Tải ${activeItem.title} cho Minecraft Bedrock:`,
                url: activeItem.link
            });
            return;
        } catch (err) { }
    }
    copyToClipboardText(activeItem.link);
}

async function pasteFromClipboard() {
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text) {
                document.getElementById('quickLinkInput').value = text;
                showToast("Đã dán link!", "success");
                return;
            }
        }
        showToast("Hãy nhấn giữ để Dán link", "info");
    } catch (err) {
        showToast("Hãy nhấn giữ để Dán link", "info");
    }
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    toastMsg.textContent = msg;
    if (type === 'success') toastIcon.className = 'fa-solid fa-circle-check text-amber-400';
    else if (type === 'error') toastIcon.className = 'fa-solid fa-triangle-exclamation text-red-400';
    else toastIcon.className = 'fa-solid fa-circle-info text-sky-400';

    toast.classList.remove('translate-y-16', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        toast.classList.add('translate-y-16', 'opacity-0', 'pointer-events-none');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 2300);
}

function initStarfieldCanvas() {
    const canvas = document.getElementById('starfieldCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const count = window.innerWidth < 768 ? 16 : 32;
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 1.1 + 0.3,
            speedY: (Math.random() * 0.12 + 0.04),
            opacity: Math.random() * 0.4 + 0.15,
            color: Math.random() > 0.4 ? '#f59e0b' : '#38bdf8'
        });
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        for (let s of stars) {
            s.y += s.speedY;
            if (s.y > h) s.y = 0;
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.opacity;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// --- 14. KHỞI CHẠY HỆ THỐNG ---
window.addEventListener('DOMContentLoaded', async () => {
    updateProxyBadgeText();
    initStarfieldCanvas();

    // 1. Mở IndexedDB
    await openDatabase();

    // 2. Chạy so khớp ngay lập tức giữa RAW_DEFAULT_LINKS và IndexedDB
    await checkInitialSetupRequired();

    // Phím tắt ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDetailModal();
            closeSubmitModal();
            closeProxyConfigModal();
            closeStorageModal();
            document.getElementById('favoritesModal').classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });
});