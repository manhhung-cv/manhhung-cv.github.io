// js/db.js
const DB_NAME = 'HunqOS_DB';
const DB_STORE = 'settings';
let dbInstance = null;

export function openOSDatabase() {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(DB_STORE)) {
                db.createObjectStore(DB_STORE);
            }
        };
        req.onsuccess = (e) => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        req.onerror = () => reject(req.error);
    });
}

export async function saveWallpaperToDB(val) {
    try {
        const db = await openOSDatabase();
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(val, 'system_wallpaper');
    } catch (e) {
        localStorage.setItem('hunqos_custom_wp', val || '');
    }
}

export async function getWallpaperFromDB() {
    try {
        const db = await openOSDatabase();
        return new Promise((resolve) => {
            const tx = db.transaction(DB_STORE, 'readonly');
            const req = tx.objectStore(DB_STORE).get('system_wallpaper');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    } catch (e) {
        return localStorage.getItem('hunqos_custom_wp') || null;
    }
}

export function resetDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
    try {
        indexedDB.deleteDatabase(DB_NAME);
    } catch (e) {}
}