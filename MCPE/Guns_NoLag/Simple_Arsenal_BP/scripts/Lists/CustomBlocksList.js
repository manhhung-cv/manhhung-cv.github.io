
/**
 * @typedef {Object} CustomBlock 
 * @property {string} typeId
 * @property {string} speedTag
 * @property {number} xpMin
 * @property {number} xpMax
 * @property {BlockLoot[]} loot
 */

/**
 * @typedef {Object} BlockLoot 
 * @property {string} typeId
 * @property {number} amount
 * @property {boolean} affectedByFortune
 */


/**
 * @type {Array<CustomBlock>}
 */
const customBlocks = [
    {
        typeId: "yes:aluminum_ore",
        speedTag: "iron_pick_diggable",
        xpMin: 0,
        xpMax: 3,
        loot: [
            {
                typeId: "yes:raw_aluminum",
                amount: 1,
                affectedByFortune: true
            }
        ]
    },
    {
        typeId: "yes:deepslate_aluminum_ore",
        speedTag: "iron_pick_diggable",
        xpMin: 0,
        xpMax: 4,
        loot: [
            {
                typeId: "yes:raw_aluminum",
                amount: 1,
                affectedByFortune: true
            }
        ]
    },
    {
        typeId: "yes:deepslate_titanium_ore",
        speedTag: "diamond_pick_diggable",
        xpMin: 10,
        xpMax: 15,
        loot: [
            {
                typeId: "yes:raw_titanium",
                amount: 1,
                affectedByFortune: true
            }
        ]
    }
]

/** @type {Map<string, CustomBlock>} */
const CustomBlockObjects = new Map();
customBlocks.forEach(customBlock => {
    CustomBlockObjects.set(customBlock.typeId, customBlock);
});


export { CustomBlockObjects };