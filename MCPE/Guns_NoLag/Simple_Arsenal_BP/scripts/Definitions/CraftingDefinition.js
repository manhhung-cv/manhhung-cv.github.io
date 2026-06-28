
import { Player } from "@minecraft/server";
import { FormResponse } from "@minecraft/server-ui";

class CraftingState {

    /**
     * 
     * @param {string} type 
     * @param {(player: Player, craftingObject?: Crafting) => Promise<FormResponse>} showForm
     * @param {null | ((player: Player) => void)} onEnter 
     * @param {null | ((player: Player) => void)} onExit 
     */
    constructor(type, showForm, onEnter = null, onExit = null) {
        this.type = type;
        this.showForm = showForm;
        this.onEnter = onEnter;
        this.onExit = onExit;
    }
}



/**
 * @typedef {Object} CustomMaterial
 * @property {string} itemTypeId
 * @property {string} nameNormal
 * @property {string} namePlural
 * @property {string} imagePath
 * @property {string} icon
 */

/**
 * @typedef {Object} CustomMaterialDefinition
 * @property {CustomMaterial} material
 * @property {number} amount
 */

class CraftingItem {

    /**
     * 
     * @param {CustomMaterial} customMaterial
     * @param {number} amount 
     */
    constructor(customMaterial, amount) {
        /**@type {string} */
        this.itemTypeId = customMaterial.itemTypeId;
        /**@type {string} */
        this.nameNormal = customMaterial.nameNormal;
        /**@type {string} */
        this.namePlural = customMaterial.namePlural;
        /**@type {string} */
        this.imagePath = customMaterial.imagePath;
        /**@type {string} */
        this.icon = customMaterial.icon;
        this.amount = amount;
    }
}

class Crafting {

    /**
     * 
     * @param {string} tag 
     * @param {string} name 
     * @param {string} imagePath 
     * @param {number} amount
     * @param {CustomMaterialDefinition[]} materialDefinition 
     */
    constructor(tag, name, imagePath, amount, materialDefinition) {
        this.tag = tag;
        this.name = name;
        this.imagePath = imagePath;
        this.amount = amount;
        /** @type {CraftingItem[]} */
        this.craftingItems = [];
        materialDefinition.forEach(def => {
            this.craftingItems.push(new CraftingItem(def.material, def.amount));
        });
    }
}

export { CraftingState, CraftingItem, Crafting };