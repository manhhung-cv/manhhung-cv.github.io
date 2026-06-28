/**
 * @typedef {Object} Pickaxe
 * @property {string} typeId
 * @property {number} speed
 * @property {string} speedTag
 */

/**
 * @type {Array<Pickaxe>}
 */
const pickaxes = [
    {
        typeId:  "minecraft:wooden_pickaxe",
        speed: 2,
        speedTag: "wooden_pick_diggable"
    },
    {
        typeId:  "minecraft:stone_pickaxe",
        speed: 4,
        speedTag: "stone_pick_diggable"
    },
    {
        typeId:  "minecraft:iron_pickaxe",
        speed: 6,
        speedTag: "iron_pick_diggable"
    },
    {
        typeId:  "minecraft:diamond_pickaxe",
        speed: 8,
        speedTag: "diamond_pick_diggable"
    },
    {
        typeId:  "minecraft:netherite_pickaxe",
        speed: 9,
        speedTag: "netherite_pick_diggable"
    },
    {
        typeId:  "minecraft:golden_pickaxe",
        speed: 12,
        speedTag: "golden_pick_diggable"
    }
]

/**
 * @typedef {Object} Efficiency
 * @property {number} level
 * @property {number} speedAdd
 */

/**
 * @type {Array<Efficiency>}
 */
const efficiencies = [
    {
        level: 1,
        speedAdd: 2
    },
    {
        level: 2,
        speedAdd: 5
    },
    {
        level: 3,
        speedAdd: 10
    },
    {
        level: 4,
        speedAdd: 17
    },
    {
        level: 5,
        speedAdd: 26
    }
];


/**
 * @typedef {Object} PickaxeTag
 * @property {string} tag
 * @property {number} harvestLevel - A higher level will encompass all levels that are lower. 
 * For example, `wooden_pick_diggable` has a level of `0` and `netherite_pick_diggable` has a level of 5
 */

/**
 * @type {Array<PickaxeTag>}
 */
const pickaxeTags = [
    {
        tag: "wooden_pick_diggable",
        harvestLevel: 0
    },
    {
        tag: "stone_pick_diggable",
        harvestLevel: 1
    },
    {
        tag: "golden_pick_diggable",
        harvestLevel: 2
    },
    {
        tag: "iron_pick_diggable",
        harvestLevel: 3
    },
    {
        tag: "diamond_pick_diggable",
        harvestLevel: 4
    },
    {
        tag: "netherite_pick_diggable",
        harvestLevel: 5
    }
]


/** @type {Map<string, Pickaxe>} */
const PickaxeObjects = new Map();
/** @type {Map<number, Efficiency>} */
const EfficiencyObjects = new Map();
/** @type {Map<string, PickaxeTag>} */
const PickaxeTagObjects = new Map();

pickaxes.forEach(pickaxe => {
    PickaxeObjects.set(pickaxe.typeId, pickaxe);
});
efficiencies.forEach(efficiency => {
    EfficiencyObjects.set(efficiency.level, efficiency);
});
pickaxeTags.forEach(pickaxeTag => {
    PickaxeTagObjects.set(pickaxeTag.tag, pickaxeTag);
});



/** @type {Pickaxe} */
const noPickaxe = {
    typeId:  "none",
    speed: 0,
    speedTag: "none"
}

/** @type {PickaxeTag} */
const noPickaxeTag = {
    tag: "none",
    harvestLevel: -1
}

export { PickaxeObjects, EfficiencyObjects, PickaxeTagObjects, noPickaxe, noPickaxeTag };
