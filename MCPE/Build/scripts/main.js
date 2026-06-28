import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const playerSettings = new Map();
const undoHistory = new Map();
const redoHistory = new Map();
const playerClipboards = new Map();
const playerSelection = new Map();
const playerCooldowns = new Map();

const ITEM_MENU  = "cs:stick_menu";
const ITEM_COPY1 = "cs:stick_copy1";
const ITEM_COPY2 = "cs:stick_copy2";
const ITEM_PASTE = "cs:stick_paste";

function getSettings(playerId) {
    if (!playerSettings.has(playerId)) {
        playerSettings.set(playerId, { enabled: true, mode: 0, shape: 0, length: 5, width: 5, height: 3, radius: 4 });
    }
    return playerSettings.get(playerId);
}

function saveHistory(playerId, dimension, blockList) {
    if (!undoHistory.has(playerId)) undoHistory.set(playerId, []);
    const history = undoHistory.get(playerId);
    if (history.length >= 10) history.shift();
    history.push(blockList);
    redoHistory.set(playerId, []);
}

function checkCooldown(playerId) {
    const now = Date.now();
    const last = playerCooldowns.get(playerId) || 0;
    if (now - last < 500) return false;
    playerCooldowns.set(playerId, now);
    return true;
}

function openMainMenu(player) {
    const sel = playerSelection.get(player.id) || { p1: null, p2: null };
    const p1Text = sel.p1 ? `(${sel.p1.x}, ${sel.p1.y}, ${sel.p1.z})` : "Chưa chọn";
    const p2Text = sel.p2 ? `(${sel.p2.x}, ${sel.p2.y}, ${sel.p2.z})` : "Chưa chọn";

    new ActionFormData()
        .title("§lSUPER QUICK BUILDER")
        .body(`Vị trí:\n  P1: §e${p1Text}\n  P2: §e${p2Text}`)
        .button("§2Copy Vùng Chọn (P1 -> P2)")
        .button("§3Định Hình Hình Dạng")
        .button("§eLấy Nhanh Tất Cả Gậy [Menu, Copy, Paste]")
        .button("§9Undo")
        .button("§dRedo")
        .show(player).then(res => {
            if (res.canceled) return;
            switch (res.selection) {
                case 0: executeCopyAsync(player, sel.p1, sel.p2); break;
                case 1: openSettingsMenu(player); break;
                case 2: giveQuickBuildSticks(player); break;
                case 3: triggerHistory(player, undoHistory, redoHistory, "Undo"); break;
                case 4: triggerHistory(player, redoHistory, undoHistory, "Redo"); break;
            }
        });
}

function openSettingsMenu(player) {
    const settings = getSettings(player.id);
    new ModalFormData()
        .title("ĐỊNH HÌNH THÔNG SỐ")
        .dropdown("Chế độ", ["Xây dựng", "Copy/Paste", "San phẳng"], settings.mode)
        .dropdown("Hình dạng", ["Hàng thẳng", "Khung hình hộp", "Khối hình hộp", "Cầu rỗng", "Cầu đặc", "Kim tự tháp", "Hàng chéo (Xéo)"], settings.shape)
        .slider("Chiều dài (Hàng chéo / Trục X)", 1, 50, 1, settings.length)
        .slider("Chiều rộng (Trục Z)", 1, 50, 1, settings.width)
        .slider("Chiều Cao (Trục Y)", 1, 50, 1, settings.height)
        .slider("Bán kính", 1, 25, 1, settings.radius)
        .show(player).then(res => {
            if (res.canceled) return;
            [settings.mode, settings.shape, settings.length, settings.width, settings.height, settings.radius] = res.formValues;
            player.sendMessage("§a[Hệ thống] Đã cập nhật cấu hình.");
        });
}

function executeCopyAsync(player, p1, p2) {
    if (!p1 || !p2) return player.sendMessage("§c[Lỗi] Thiếu P1 hoặc P2!");
    player.sendMessage("§aĐang quét vùng chọn...");
    system.runJob((function* () {
        const dim = player.dimension;
        const minX = Math.min(p1.x, p2.x), maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y), maxY = Math.max(p1.y, p2.y);
        const minZ = Math.min(p1.z, p2.z), maxZ = Math.max(p1.z, p2.z);
        const blocksData = [];
        let ops = 0;
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    try {
                        const block = dim.getBlock({ x, y, z });
                        if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:water" && block.typeId !== "minecraft:lava") {
                            blocksData.push({ relX: x - p1.x, relY: y - p1.y, relZ: z - p1.z, typeId: block.typeId });
                        }
                    } catch(e){}
                    if (++ops % 500 === 0) yield; // Tối ưu hóa: Chia nhỏ lượng quét tránh crash
                }
            }
        }
        playerClipboards.set(player.id, blocksData);
        player.sendMessage(`§a[Thành công] Đã lưu ${blocksData.length} block vào bộ nhớ tạm!`);
    })());
}

function executePasteAsync(player, baseLocation) {
    const clipboard = playerClipboards.get(player.id);
    if (!clipboard || clipboard.length === 0) {
        return player.sendMessage("§cBộ nhớ tạm trống! Hãy chọn P1, P2 rồi nhấn Copy.");
    }
    player.sendMessage("§aĐang tiến hành dán công trình...");
    system.runJob((function* () {
        const oldBlocksBackup = [];
        let ops = 0;
        for (const b of clipboard) {
            const targetLoc = { x: baseLocation.x + b.relX, y: baseLocation.y + b.relY, z: baseLocation.z + b.relZ };
            try {
                const currentBlock = player.dimension.getBlock(targetLoc);
                if (currentBlock) oldBlocksBackup.push({ location: targetLoc, typeId: currentBlock.typeId });
            } catch(e){}
            if (++ops % 500 === 0) yield;
        }
        saveHistory(player.id, player.dimension, oldBlocksBackup);
        for (const b of clipboard) {
            const targetLoc = { x: baseLocation.x + b.relX, y: baseLocation.y + b.relY, z: baseLocation.z + b.relZ };
            try {
                const currentBlock = player.dimension.getBlock(targetLoc);
                if (currentBlock) currentBlock.setType(b.typeId);
            } catch(e){}
            if (++ops % 100 === 0) yield; // Tối ưu hóa: Đặt block mượt mà hơn
        }
        player.sendMessage("§a[Thành công] Đã gán thành công!");
    })());
}

function triggerHistory(player, sourceHist, targetHist, actionName) {
    const history = sourceHist.get(player.id);
    if (!history || history.length === 0) return player.sendMessage(`§cKhông còn dữ liệu để thực hiện ${actionName}!`);
    const lastAction = history.pop();
    const targetState = [];
    
    system.runJob((function* () {
        let ops = 0;
        for (const b of lastAction) {
            try {
                const block = player.dimension.getBlock(b.location);
                targetState.push({ location: b.location, typeId: block.typeId });
                block.setType(b.typeId);
            } catch(e){}
            if (++ops % 200 === 0) yield;
        }
        if (!targetHist.has(player.id)) targetHist.set(player.id, []);
        targetHist.get(player.id).push(targetState);
        player.sendMessage(`§aĐã thực hiện xong ${actionName}.`);
    })());
}

function giveQuickBuildSticks(player) {
    const inv = player.getComponent("inventory").container;
    inv.addItem(new ItemStack(ITEM_MENU, 1));
    inv.addItem(new ItemStack(ITEM_COPY1, 1));
    inv.addItem(new ItemStack(ITEM_COPY2, 1));
    inv.addItem(new ItemStack(ITEM_PASTE, 1));
    player.sendMessage("§a[Hệ thống] Đã thêm bộ gậy xây dựng nhanh vào túi đồ!");
}

world.beforeEvents.itemUseOn.subscribe((e) => {
    const player = e.source;
    const item = e.itemStack;
    if (!item) return;

    if ([ITEM_COPY1, ITEM_COPY2, ITEM_PASTE].includes(item.typeId)) {
        e.cancel = true;
        if (!checkCooldown(player.id)) return;
        system.run(() => {
            let sel = playerSelection.get(player.id) || {};
            if (item.typeId === ITEM_COPY1) {
                sel.p1 = e.block.location;
                playerSelection.set(player.id, sel);
                player.sendMessage(`§9[P1] §fĐã chọn vị trí: ${sel.p1.x}, ${sel.p1.y}, ${sel.p1.z}`);
            } else if (item.typeId === ITEM_COPY2) {
                sel.p2 = e.block.location;
                playerSelection.set(player.id, sel);
                player.sendMessage(`§9[P2] §fĐã chọn vị trí: ${sel.p2.x}, ${sel.p2.y}, ${sel.p2.z}`);
            } else if (item.typeId === ITEM_PASTE) {
                executePasteAsync(player, e.block.location);
            }
        });
        return; 
    }

    if (player.isSneaking && item.typeId !== ITEM_MENU) {
        const settings = getSettings(player.id);
        if (!settings.enabled) return;
        
        if (settings.mode === 0 || settings.mode === 2) {
            e.cancel = true;
            if (!checkCooldown(player.id)) return;
            const blockLoc = e.block.location;
            const blockToPlace = item.typeId;
            const view = player.getViewDirection();
            
            let dx = 0; let dz = 0;
            if (Math.abs(view.x) > Math.abs(view.z)) {
                dx = view.x > 0 ? 1 : -1;
            } else {
                dz = view.z > 0 ? 1 : -1;
            }
            
            system.run(() => {
                const blocksToChange = [];
                if (settings.mode === 0) { 
                    if (settings.shape === 0) { 
                        for (let l = 0; l < settings.length; l++) {
                            for (let h = 0; h < settings.height; h++) {
                                blocksToChange.push({ x: blockLoc.x + (l * dx), y: blockLoc.y + h + 1, z: blockLoc.z + (l * dz), customType: blockToPlace });
                            }
                        }
                    } else if (settings.shape === 1 || settings.shape === 2) {
                        for (let x = 0; x < settings.length; x++) {
                            for (let y = 0; y < settings.height; y++) {
                                for (let z = 0; z < settings.width; z++) {
                                    const isEdge = (x === 0 || x === settings.length - 1 || y === 0 || y === settings.height - 1 || z === 0 || z === settings.width - 1);
                                    if (settings.shape === 2 || (settings.shape === 1 && isEdge)) {
                                        blocksToChange.push({ x: blockLoc.x + (x * (dx || 1)), y: blockLoc.y + y + 1, z: blockLoc.z + (z * (dz || 1)), customType: blockToPlace });
                                    }
                                }
                            }
                        }
                    } else if (settings.shape === 3 || settings.shape === 4) {
                        const r = settings.radius;
                        for (let x = -r; x <= r; x++) {
                            for (let y = -r; y <= r; y++) {
                                for (let z = -r; z <= r; z++) {
                                    const d = Math.sqrt(x*x + y*y + z*z);
                                    if (settings.shape === 4 && d <= r) {
                                        blocksToChange.push({ x: blockLoc.x + x, y: blockLoc.y + y + r + 1, z: blockLoc.z + z, customType: blockToPlace });
                                    } else if (settings.shape === 3 && d <= r && d > r - 1.2) {
                                        blocksToChange.push({ x: blockLoc.x + x, y: blockLoc.y + y + r + 1, z: blockLoc.z + z, customType: blockToPlace });
                                    }
                                }
                            }
                        }
                    } else if (settings.shape === 5) {
                        for (let y = 0; y < settings.height; y++) {
                            const size = settings.length - y;
                            if (size < 0) break;
                            for (let x = -size; x <= size; x++) {
                                for (let z = -size; z <= size; z++) {
                                    blocksToChange.push({ x: blockLoc.x + x, y: blockLoc.y + y + 1, z: blockLoc.z + z, customType: blockToPlace });
                                }
                            }
                        }
                    } else if (settings.shape === 6) { 
                        const diagX = view.x >= 0 ? 1 : -1;
                        const diagZ = view.z >= 0 ? 1 : -1;
                        for (let l = 0; l < settings.length; l++) {
                            for (let h = 0; h < settings.height; h++) {
                                blocksToChange.push({ x: blockLoc.x + (l * diagX), y: blockLoc.y + h + 1, z: blockLoc.z + (l * diagZ), customType: blockToPlace });
                            }
                        }
                    }
                } else if (settings.mode === 2) { 
                    // CHẾ ĐỘ SAN PHẲNG: Ép buộc tất cả thành minecraft:air để không lỗi
                    for (let x = -settings.length; x <= settings.length; x++) {
                        for (let y = -settings.height; y <= settings.height; y++) {
                            for (let z = -settings.width; z <= settings.width; z++) {
                                blocksToChange.push({ x: blockLoc.x + x, y: blockLoc.y + y, z: blockLoc.z + z, customType: "minecraft:air" });
                            }
                        }
                    }
                }

                system.runJob((function* () {
                    const oldBlocksBackup = [];
                    let ops = 0;
                    for (const loc of blocksToChange) {
                        try {
                            const b = player.dimension.getBlock(loc);
                            if (b) oldBlocksBackup.push({ location: { x: loc.x, y: loc.y, z: loc.z }, typeId: b.typeId });
                        } catch(e){}
                        if (++ops % 400 === 0) yield; // Phân bổ tải dữ liệu
                    }
                    saveHistory(player.id, player.dimension, oldBlocksBackup);

                    for (const target of blocksToChange) {
                        try {
                            const b = player.dimension.getBlock(target);
                            if (b) b.setType(target.customType);
                        } catch(e){}
                        if (++ops % 100 === 0) yield; // Tối ưu hóa: Đặt chậm hơn tránh tràn Script Job Queue
                    }
                })());
            });
        }
    }
});

world.beforeEvents.itemUse.subscribe((e) => {
    const player = e.source;
    const item = e.itemStack;
    if (!item) return;

    if ([ITEM_MENU, ITEM_COPY1, ITEM_COPY2, ITEM_PASTE].includes(item.typeId)) {
        if (!checkCooldown(player.id)) return;
        
        system.run(() => {
            let sel = playerSelection.get(player.id) || {};
            const pLoc = { x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z) };

            if (item.typeId === ITEM_MENU) {
                openMainMenu(player);
            } else if (item.typeId === ITEM_COPY1) {
                sel.p1 = pLoc;
                playerSelection.set(player.id, sel);
                player.sendMessage(`§9[P1] §fĐã chọn vị trí đứng: ${pLoc.x}, ${pLoc.y}, ${pLoc.z}`);
            } else if (item.typeId === ITEM_COPY2) {
                sel.p2 = pLoc;
                playerSelection.set(player.id, sel);
                player.sendMessage(`§9[P2] §fĐã chọn vị trí đứng: ${pLoc.x}, ${pLoc.y}, ${pLoc.z}`);
            } else if (item.typeId === ITEM_PASTE) {
                executePasteAsync(player, pLoc);
            }
        });
    }
});