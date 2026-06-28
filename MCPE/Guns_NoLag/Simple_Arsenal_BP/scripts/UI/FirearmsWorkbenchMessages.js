import { BlockComponentPlayerInteractEvent, Player, system, world } from "@minecraft/server";
import { Vector3 } from "../Math/Vector3";
import { CraftingMessageTypes, CraftingStatesList } from "../Lists/CraftingStatesList.js";
import { AmmunitionCraftingObjects, FirearmCraftingObjects, MagazineCraftingObjects } from "../Lists/CraftingList.js";
import * as ui from "@minecraft/server-ui";
import { Crafting } from "../Definitions/CraftingDefinition.js";

//exported to Customcomponents/Components.js



/**
 * @param {BlockComponentPlayerInteractEvent} eventData 
 */
function onInteract(eventData) {
    const player = eventData.player;
    if(player === undefined) { return; }
    enterSelector(player);
}


function enterSelector(player) {
    /** @type {Promise<ui.ActionFormResponse>}*/
    const resp = CraftingStatesList.SelectorCraftingState.showForm(player);
    resp.then(response => {
        const selection = response.selection;
        if(selection === undefined) { return; }
        switch(selection) {
            case 0:
                enterFirearms(player);
                break;
            case 1:
                enterMagazines(player);
                break;
            case 2:
                enterAmmunition(player);
                break;
            default:
                console.error(`undefined selector crafting state: ${selection}`);
                break;
        }
    });
}

/**
 * @param {Player} player 
 */
function enterFirearms(player) {
    /** @type {Promise<ui.ActionFormResponse>}*/
    const resp = CraftingStatesList.FirearmCraftingState.showForm(player);
    resp.then(response => {
        const selection = response.selection;
        if(response.canceled || selection === undefined) {
            enterSelector(player);
            return;
        }
        const craftingObject = FirearmCraftingObjects.get(selection);
        console.log(`selection: ${selection}, obj: ${craftingObject?.name}`);
        if(craftingObject === undefined) {
            enterSelector(player);
            return;
        }
        craftingConfirmation(player, craftingObject, enterFirearms, true);
    });
}

/**
 * @param {Player} player 
 */
function enterMagazines(player) {
    /** @type {Promise<ui.ActionFormResponse>}*/
    const resp = CraftingStatesList.MagazineCraftingState.showForm(player);
    resp.then(response => {
        const selection = response.selection;
        if(response.canceled || selection === undefined) {
            enterSelector(player);
            return;
        }
        const craftingObject = MagazineCraftingObjects.get(selection);
        console.log(`selection: ${selection}, obj: ${craftingObject?.name}`);
        if(craftingObject === undefined) {
            enterSelector(player);
            return;
        }
        craftingConfirmation(player, craftingObject, enterMagazines, true);
    });
}

/**
 * @param {Player} player 
 */
function enterAmmunition(player) {
    /** @type {Promise<ui.ActionFormResponse>}*/
    const resp = CraftingStatesList.AmmunitionCraftingState.showForm(player);
    resp.then(response => {
        const selection = response.selection;
        if(response.canceled || selection === undefined) {
            enterSelector(player);
            return;
        }
        const craftingObject = AmmunitionCraftingObjects.get(selection);
        console.log(`selection: ${selection}, obj: ${craftingObject?.name}`);
        if(craftingObject === undefined) {
            enterSelector(player);
            return;
        }
        craftingConfirmation(player, craftingObject, enterAmmunition, true);
    });
}


/**
 * @param {Player} player 
 * @param {Crafting} crafingObject 
 * @param {(player: Player) => void} previousStateFunction
 * @param {boolean} stayOnSuccessful - whether to stay in this state if the interaction was successful
 */
function craftingConfirmation(player, crafingObject, previousStateFunction, stayOnSuccessful) {
    /** @type {Promise<ui.ActionFormResponse>}*/
    const resp = CraftingStatesList.ConfirmCraftingState.showForm(player, crafingObject);
    resp.then(response => {
        const selection = response.selection;
        if(response.canceled || selection === undefined) {
            previousStateFunction(player);
            return;
        }
        //Crafing is done through the showForm() function. Nothing needs to be done here if stayOnSuccessful = false
        if(stayOnSuccessful) {
            craftingConfirmation(player, crafingObject, previousStateFunction, stayOnSuccessful);
        }
    });
}

export { onInteract };