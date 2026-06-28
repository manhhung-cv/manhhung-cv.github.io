import * as Def from "../Definitions/CraftingDefinition.js";
import { BulletTypes } from "../Definitions/MagazineDefinition.js";



/** @enum {Def.CustomMaterial} */
const CustomMaterials = {
    polishedWoodPlate: {
        itemTypeId: "yes:polished_wood_plate",
        nameNormal: "Polished Wood Plate",
        namePlural: "Polished Wood Plates",
        imagePath: "textures/items/polished_wood_plate",
        icon: "\ue160"
    },
    plasticSheet: {
        itemTypeId: "yes:plastic_sheet",
        nameNormal: "Plastic Sheet",
        namePlural: "Plastic Sheets",
        imagePath: "textures/items/plastic_sheet",
        icon: "\ue161"
    },
    kevlarSheet: {
        itemTypeId: "yes:kevlar_sheet",
        nameNormal: "Kevlar Sheet",
        namePlural: "Kevlar Sheets",
        imagePath: "textures/items/kevlar_sheet",
        icon: "\ue162"
    },
    aluminumIngot: {
        itemTypeId: "yes:aluminum_ingot",
        nameNormal: "Aluminum Ingot",
        namePlural: "Aluminum Ingots",
        imagePath: "textures/items/aluminum_ingot",
        icon: "\ue170"
    },
    steelIngot: {
        itemTypeId: "yes:steel_ingot",
        nameNormal: "Steel Ingot",
        namePlural: "Steel Ingots",
        imagePath: "textures/items/steel_ingot",
        icon: "\ue171"
    },
    titaniumIngot: {
        itemTypeId: "yes:titanium_ingot",
        nameNormal: "Titanium Ingot",
        namePlural: "Titanium Ingots",
        imagePath: "textures/items/titanium_ingot",
        icon: "\ue172"
    },


    copperIngot: {
        itemTypeId: "minecraft:copper_ingot",
        nameNormal: "Copper Ingot",
        namePlural: "Copper Ingots",
        imagePath: "textures/items/copper_ingot",
        icon: "\ue150"
    },
    gunpowder: {
        itemTypeId: "minecraft:gunpowder",
        nameNormal: "Gunpowder",
        namePlural: "Gunpowder",
        imagePath: "textures/items/gunpowder",
        icon: "\ue151"
    },
    ironIngot: {
        itemTypeId: "minecraft:iron_ingot",
        nameNormal: "Iron Ingot",
        namePlural: "Iron Ingots",
        imagePath: "textures/items/iron_ingot",
        icon: "\ue152"
    },

    bullet: {
        itemTypeId: BulletTypes.bullet,
        nameNormal: "Bullet",
        namePlural: "Bullets",
        imagePath: "textures/scripting_ui/ammunition/bullet",
        icon: ""
    },
    shotgunShell: {
        itemTypeId: BulletTypes.shotgunShell,
        nameNormal: "Shotgun Shell",
        namePlural: "Shotgun Shells",
        imagePath: "textures/scripting_ui/ammunition/shotgun_shell",
        icon: ""
    }
}



//Firearm crafting ------------------------------
const ak47Crafting = {
    tag: "yes:ak47",
    name: "AK-47",
    imagePath: "textures/scripting_ui/firearms/ak47",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.polishedWoodPlate,
            amount: 3
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 2
        },
        {
            material: CustomMaterials.steelIngot,
            amount: 3
        }
    ]
}
const akmCrafting = {
    tag: "yes:akm",
    name: "AKM",
    imagePath: "textures/scripting_ui/firearms/akm",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 2
        },
        {
            material: CustomMaterials.steelIngot,
            amount: 6
        }
    ]
}
const m4a1Crafting = {
    tag: "yes:m4a1",
    name: "M4A1",
    imagePath: "textures/scripting_ui/firearms/m4a1",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 4
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 4
        }
    ]
}
const ar15Crafting = {
    tag: "yes:ar15",
    name: "AR-15",
    imagePath: "textures/scripting_ui/firearms/ar15",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.polishedWoodPlate,
            amount: 2
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 3
        },
        {
            material: CustomMaterials.steelIngot,
            amount: 4
        }
    ]
}
const hk417Crafting = {
    tag: "yes:hk417",
    name: "HK417",
    imagePath: "textures/scripting_ui/firearms/hk417",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 3
        },
        {
            material: CustomMaterials.steelIngot,
            amount: 3
        },
        {
            material: CustomMaterials.titaniumIngot,
            amount: 3
        }
    ]
}
const mk13Crafting = {
    tag: "yes:mk13",
    name: "MK13",
    imagePath: "textures/scripting_ui/firearms/mk13",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.polishedWoodPlate,
            amount: 3
        },
        {
            material: CustomMaterials.steelIngot,
            amount: 2
        },
        {
            material: CustomMaterials.titaniumIngot,
            amount: 5
        }
    ]
}
const awmCrafting = {
    tag: "yes:awm",
    name: "AWM",
    imagePath: "textures/scripting_ui/firearms/awm",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.polishedWoodPlate,
            amount: 1
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 12
        },
        {
            material: CustomMaterials.titaniumIngot,
            amount: 2
        }
    ]
}
const p90Crafting = {
    tag: "yes:p90",
    name: "P90",
    imagePath: "textures/scripting_ui/firearms/p90",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 2
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 6
        },
    ]
}
const ump45Crafting = {
    tag: "yes:ump45",
    name: "UMP-45",
    imagePath: "textures/scripting_ui/firearms/ump45",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 2
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 2
        },
        {
            material: CustomMaterials.steelIngot,
            amount: 4
        },
    ]
}
const desertEagleCrafting = {
    tag: "yes:desert_eagle",
    name: "Desert Eagle",
    imagePath: "textures/scripting_ui/firearms/desert_eagle",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.polishedWoodPlate,
            amount: 1
        },
        {
            material: CustomMaterials.steelIngot,
            amount: 3
        },
        {
            material: CustomMaterials.titaniumIngot,
            amount: 1
        }
    ]
}
const remington870Crafting = {
    tag: "yes:remington870",
    name: "Remington 870",
    imagePath: "textures/scripting_ui/firearms/remington870",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.polishedWoodPlate,
            amount: 4
        },
        {
            material: CustomMaterials.steelIngot,
            amount: 4
        }
    ]
}


const ak47 = new Def.Crafting(
    ak47Crafting.tag,
    ak47Crafting.name,
    ak47Crafting.imagePath,
    ak47Crafting.amount,
    ak47Crafting.craftingItems
);
const akm = new Def.Crafting(
    akmCrafting.tag,
    akmCrafting.name,
    akmCrafting.imagePath,
    akmCrafting.amount,
    akmCrafting.craftingItems
);
const m4a1 = new Def.Crafting(
    m4a1Crafting.tag,
    m4a1Crafting.name,
    m4a1Crafting.imagePath,
    m4a1Crafting.amount,
    m4a1Crafting.craftingItems
);
const ar15 = new Def.Crafting(
    ar15Crafting.tag,
    ar15Crafting.name,
    ar15Crafting.imagePath,
    ar15Crafting.amount,
    ar15Crafting.craftingItems
);
const hk417 = new Def.Crafting(
    hk417Crafting.tag,
    hk417Crafting.name,
    hk417Crafting.imagePath,
    hk417Crafting.amount,
    hk417Crafting.craftingItems
);
const mk13 = new Def.Crafting(
    mk13Crafting.tag,
    mk13Crafting.name,
    mk13Crafting.imagePath,
    mk13Crafting.amount,
    mk13Crafting.craftingItems
);
const awm = new Def.Crafting(
    awmCrafting.tag,
    awmCrafting.name,
    awmCrafting.imagePath,
    awmCrafting.amount,
    awmCrafting.craftingItems
);
const p90 = new Def.Crafting(
    p90Crafting.tag,
    p90Crafting.name,
    p90Crafting.imagePath,
    p90Crafting.amount,
    p90Crafting.craftingItems
);
const ump45 = new Def.Crafting(
    ump45Crafting.tag,
    ump45Crafting.name,
    ump45Crafting.imagePath,
    ump45Crafting.amount,
    ump45Crafting.craftingItems
);
const desertEagle = new Def.Crafting(
    desertEagleCrafting.tag,
    desertEagleCrafting.name,
    desertEagleCrafting.imagePath,
    desertEagleCrafting.amount,
    desertEagleCrafting.craftingItems
);
const remington870 = new Def.Crafting(
    remington870Crafting.tag,
    remington870Crafting.name,
    remington870Crafting.imagePath,
    remington870Crafting.amount,
    remington870Crafting.craftingItems
);


//Magazine crafting ------------------------------
const rifleMagazine30Crafting = {
    tag: "yes:rifle_magazine_30",
    name: "Rifle Magazine\n[§q30 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/rifle_30",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 1
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 1
        },
        {
            material: CustomMaterials.bullet,
            amount: 30
        }
    ]
}
const rifleMagazine50Crafting = {
    tag: "yes:rifle_magazine_50",
    name: "Rifle Magazine\n[§q50 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/rifle_50",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 2
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 2
        },
        {
            material: CustomMaterials.bullet,
            amount: 50
        }
    ]
}
const DMRMagazine15Crafting = {
    tag: "yes:marksman_rifle_magazine_15",
    name: "Marksman Rifle Magazine\n[§q15 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/dmr_15",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 1
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 1
        },
        {
            material: CustomMaterials.bullet,
            amount: 15
        }
    ]
}
const SMGMagazine24Crafting = {
    tag: "yes:smg_magazine_24",
    name: "SMG Magazine\n[§q24 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/smg_24",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 1
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 1
        },
        {
            material: CustomMaterials.bullet,
            amount: 24
        }
    ]
}
const P90Magazine50Crafting = {
    tag: "yes:p90_magazine_50",
    name: "P90 Magazine\n[§q50 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/p90_50",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 1
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 2
        },
        {
            material: CustomMaterials.bullet,
            amount: 50
        }
    ]
}
const sniperMagazine3Crafting = {
    tag: "yes:sniper_magazine_3",
    name: "Sniper Magazine\n[§q3 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/sniper_3",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 1
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 1
        },
        {
            material: CustomMaterials.bullet,
            amount: 3
        }
    ]
}
const sniperMagazine6Crafting = {
    tag: "yes:sniper_magazine_6",
    name: "Sniper Magazine\n[§q6 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/sniper_6",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 2
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 2
        },
        {
            material: CustomMaterials.bullet,
            amount: 6
        }
    ]
}
const pistolMagazine8Crafting = {
    tag: "yes:pistol_magazine_8",
    name: "Pistol Magazine\n[§q8 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/pistol_8",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.plasticSheet,
            amount: 1
        },
        {
            material: CustomMaterials.aluminumIngot,
            amount: 1
        },
        {
            material: CustomMaterials.bullet,
            amount: 8
        }
    ]
}
const shotgunMagazine6Crafting = {
    tag: "yes:shotgun_magazine_6",
    name: "Shotgun Shell Batch\n[§q6 Rounds§r]",
    imagePath: "textures/scripting_ui/magazines/shotgun_6",
    amount: 1,
    craftingItems: [
        {
            material: CustomMaterials.shotgunShell,
            amount: 6
        }
    ]
}


const rifleMagazine30 = new Def.Crafting(
    rifleMagazine30Crafting.tag,
    rifleMagazine30Crafting.name,
    rifleMagazine30Crafting.imagePath,
    rifleMagazine30Crafting.amount,
    rifleMagazine30Crafting.craftingItems
);
const rifleMagazine50 = new Def.Crafting(
    rifleMagazine50Crafting.tag,
    rifleMagazine50Crafting.name,
    rifleMagazine50Crafting.imagePath,
    rifleMagazine50Crafting.amount,
    rifleMagazine50Crafting.craftingItems
);
const DMRMagazine15 = new Def.Crafting(
    DMRMagazine15Crafting.tag,
    DMRMagazine15Crafting.name,
    DMRMagazine15Crafting.imagePath,
    DMRMagazine15Crafting.amount,
    DMRMagazine15Crafting.craftingItems
);
const SMGMagazine24 = new Def.Crafting(
    SMGMagazine24Crafting.tag,
    SMGMagazine24Crafting.name,
    SMGMagazine24Crafting.imagePath,
    SMGMagazine24Crafting.amount,
    SMGMagazine24Crafting.craftingItems
);
const P90Magazine50 = new Def.Crafting(
    P90Magazine50Crafting.tag,
    P90Magazine50Crafting.name,
    P90Magazine50Crafting.imagePath,
    P90Magazine50Crafting.amount,
    P90Magazine50Crafting.craftingItems
);
const sniperMagazine3 = new Def.Crafting(
    sniperMagazine3Crafting.tag,
    sniperMagazine3Crafting.name,
    sniperMagazine3Crafting.imagePath,
    sniperMagazine3Crafting.amount,
    sniperMagazine3Crafting.craftingItems
);
const sniperMagazine6 = new Def.Crafting(
    sniperMagazine6Crafting.tag,
    sniperMagazine6Crafting.name,
    sniperMagazine6Crafting.imagePath,
    sniperMagazine6Crafting.amount,
    sniperMagazine6Crafting.craftingItems
);
const pistolMagazine8 = new Def.Crafting(
    pistolMagazine8Crafting.tag,
    pistolMagazine8Crafting.name,
    pistolMagazine8Crafting.imagePath,
    pistolMagazine8Crafting.amount,
    pistolMagazine8Crafting.craftingItems
);
const shotgunMagazine6 = new Def.Crafting(
    shotgunMagazine6Crafting.tag,
    shotgunMagazine6Crafting.name,
    shotgunMagazine6Crafting.imagePath,
    shotgunMagazine6Crafting.amount,
    shotgunMagazine6Crafting.craftingItems
);






const bulletCrafting = {
    tag: "yes:bullet",
    name: "Bullet §r[§qx64§r]",
    imagePath: "textures/scripting_ui/ammunition/bullet",
    amount: 64,
    craftingItems: [
        {
            material: CustomMaterials.ironIngot,
            amount: 1
        },
        {
            material: CustomMaterials.copperIngot,
            amount: 3
        },
        {
            material: CustomMaterials.gunpowder,
            amount: 1
        }
    ]
}

const shotgunShellCrafting = {
    tag: "yes:shotgun_shell",
    name: "Shotgun Shell §r[§qx32§r]",
    imagePath: "textures/scripting_ui/ammunition/shotgun_shell",
    amount: 32,
    craftingItems: [
        {
            material: CustomMaterials.ironIngot,
            amount: 1
        },
        {
            material: CustomMaterials.plasticSheet,
            amount: 1
        },
        {
            material: CustomMaterials.gunpowder,
            amount: 1
        }
    ]
}


const bullet = new Def.Crafting(
    bulletCrafting.tag,
    bulletCrafting.name,
    bulletCrafting.imagePath,
    bulletCrafting.amount,
    bulletCrafting.craftingItems
);
const shotgunShell = new Def.Crafting(
    shotgunShellCrafting.tag,
    shotgunShellCrafting.name,
    shotgunShellCrafting.imagePath,
    shotgunShellCrafting.amount,
    shotgunShellCrafting.craftingItems
);



/** @type {Map<number, Def.Crafting>} */
const FirearmCraftingObjects = new Map();

FirearmCraftingObjects.set(0,  ak47);
FirearmCraftingObjects.set(1,  akm);
FirearmCraftingObjects.set(2,  m4a1);
FirearmCraftingObjects.set(3,  ar15);
FirearmCraftingObjects.set(4,  hk417);
FirearmCraftingObjects.set(5,  mk13);
FirearmCraftingObjects.set(6,  awm);
FirearmCraftingObjects.set(7,  p90);
FirearmCraftingObjects.set(8,  ump45);
FirearmCraftingObjects.set(9,  desertEagle);
FirearmCraftingObjects.set(10, remington870);


/** @type {Map<number, Def.Crafting>} */
const MagazineCraftingObjects = new Map();

MagazineCraftingObjects.set(0,  rifleMagazine30);
MagazineCraftingObjects.set(1,  rifleMagazine50);
MagazineCraftingObjects.set(2,  DMRMagazine15);
MagazineCraftingObjects.set(3,  SMGMagazine24);
MagazineCraftingObjects.set(4,  P90Magazine50);
MagazineCraftingObjects.set(5,  sniperMagazine3);
MagazineCraftingObjects.set(6,  sniperMagazine6);
MagazineCraftingObjects.set(7,  pistolMagazine8);
MagazineCraftingObjects.set(8,  shotgunMagazine6);


/** @type {Map<number, Def.Crafting>} */
const AmmunitionCraftingObjects = new Map();

AmmunitionCraftingObjects.set(0,  bullet);
AmmunitionCraftingObjects.set(1,  shotgunShell);

export { CustomMaterials, FirearmCraftingObjects, MagazineCraftingObjects, AmmunitionCraftingObjects };
