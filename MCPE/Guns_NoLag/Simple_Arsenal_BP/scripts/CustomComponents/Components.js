import { BlockComponentPlayerInteractEvent, ItemComponentUseEvent } from "@minecraft/server";
import * as FirearmsWorkbench from "../UI/FirearmsWorkbenchMessages.js";

/**
 * @typedef {Object} ItemCustomComponent
 * @property {(e: ItemComponentUseEvent) => void} [onUse] - Function triggered when the item is used.
 */

/**
 * @typedef {Object} BlockCustomComponent
 * @property {(e: BlockComponentPlayerInteractEvent) => void} [onPlayerInteract] - Function triggered when the block is interacted with.
 */

/**
 * @typedef {Object} CustomComponent
 * @property {"item"|"block"} type - The type of component.
 * @property {string} name - The component’s unique name.
 * @property {ItemCustomComponent} itemCustomComponent - Custom logic for items (optional).
 * @property {BlockCustomComponent} blockCustomComponent - Custom logic for blocks (optional).
 */

/**
 * A list of custom components for items and blocks.
 * @type {CustomComponent[]}
 */
export const customComponents = [
    //{
    //    type: "item",
    //    name: "yes:on_use",
    //    itemCustomComponent: { onUse: e => { functions.onUse(e); } },
    //    blockCustomComponent: {}
    //},
    {
        type: "block",
        name: "yes:firearms_workbench_interact",
        itemCustomComponent: {},
        blockCustomComponent: { onPlayerInteract: e => { FirearmsWorkbench.onInteract(e); } }
    }
];