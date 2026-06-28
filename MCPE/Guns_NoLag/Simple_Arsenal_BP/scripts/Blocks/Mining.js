import { world, BlockPermutation, system, Block, ItemStack, ItemComponentTypes, ItemEnchantableComponent, GameMode, Player, Dimension } from "@minecraft/server";
import { CustomBlockObjects } from "../Lists/CustomBlocksList";
import { PickaxeObjects, EfficiencyObjects, PickaxeTagObjects, noPickaxe, noPickaxeTag } from "../Lists/PickaxesList";
import { ItemUtil, NumberUtil } from "../Utilities";
import { Vector3 } from "../Math/Vector3";


/**
 * 
 * @param {Player} player
 */
export function miningRaycast(player) {
    if(player.getGameMode() !== GameMode.survival) { return; }
    const itemStack = ItemUtil.getSelectedItemStack(player);
    const blockRayCast = player.getBlockFromViewDirection({maxDistance: 12});
    if(blockRayCast !== undefined) {
        const blocks = [blockRayCast.block, blockRayCast.block.above(1)];
        blocks.forEach(block => {
            if(block === undefined) { return; }
            if(itemStack === null) { return; }
            mining(block, itemStack);
        });
    }
}

/**
 * 
 * @param {Block} block 
 * @param {ItemStack} itemStack 
 * @returns 
 */
function mining(block, itemStack) {
    const customBlockObject = CustomBlockObjects.get(block.typeId);
    if(customBlockObject === undefined) { return; }

    let pickaxeObject = PickaxeObjects.get(itemStack.typeId);
    if(pickaxeObject === undefined) {
        //fall back to simple tag checking
        pickaxeObject = noPickaxe;
        let highestLevelTag = noPickaxeTag;
        itemStack.getTags().forEach(tag => {
            if((PickaxeTagObjects.get(tag)?.harvestLevel??-1) > (highestLevelTag?.harvestLevel??-1)) {
                highestLevelTag = PickaxeTagObjects.get(tag)??noPickaxeTag;
            }
        })
        pickaxeObject.speedTag = highestLevelTag.tag;
        if(pickaxeObject.speedTag === "none") {
            //console.warn(`${itemStack.typeId} is not a pickaxe`);
        }
        else {
            console.warn(`Pickaxe ${itemStack.typeId} is not defined but has speed tag of ${pickaxeObject.speedTag}`);
        }
    }

    const enchantable = itemStack.getComponent(ItemComponentTypes.Enchantable);
    let efficiencyLevel = 0;
    if(enchantable instanceof ItemEnchantableComponent) {
        const efficiencyEnchant = enchantable.getEnchantment("efficiency");
        if(efficiencyEnchant) { efficiencyLevel = efficiencyEnchant.level; }
    }

    let efficiencyAdd = EfficiencyObjects.get(efficiencyLevel)?.speedAdd;
    if(efficiencyAdd === undefined) { efficiencyAdd = 0; }

    let speed = pickaxeObject.speed + efficiencyAdd;

    let harvestable = false;
    const blockTag = PickaxeTagObjects.get(customBlockObject.speedTag);
    const pickaxeTag = PickaxeTagObjects.get(pickaxeObject.speedTag);
    if((pickaxeTag?.harvestLevel??-1) >= (blockTag?.harvestLevel??0)) {
        harvestable = true;
    }
    //assumes that undefined custom pickaxes with this tag are strong enough to break this custom block
    else if(pickaxeTag === undefined && itemStack.hasTag("minecraft:is_pickaxe")) {
        
        speed = 8 + efficiencyAdd;
        harvestable = true;
    }

    //console.log(`Pickaxe: ${pickaxeObject.typeId}, block: ${customBlockObject.typeId}, speed: ${speed}, harvestable: ${harvestable}}}`);
    
    if(itemStack.typeId.split(":")[0] !== "minecraft" && itemStack.typeId.split(":")[0] !== "yes") {
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': true, 'yes:speed1': 8+efficiencyAdd, 'yes:speed2': 0, 'yes:speed3': 0, })); //assume that all pickaxes from other addons have a base speed of 8
    }
    else if(!harvestable) {
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': 0, 'yes:speed3': 0, }));
    }
    else if(harvestable && speed <= 15) {
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': speed, 'yes:speed2': 0, 'yes:speed3': 0, }));
    }
    else if(harvestable && speed >= 16 && speed <= 30) {
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': speed, 'yes:speed3': 0, }));
    }
    else if(harvestable && speed >= 31 && speed <= 41) {
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': 0, 'yes:speed3': speed, }));
    }
}

world.beforeEvents.playerBreakBlock.subscribe(eventData => {
    const player = eventData.player;
    if(player.getGameMode() === GameMode.creative || player.getGameMode() === GameMode.spectator) { return; }
    const block = eventData.block;

    const customBlockObject = CustomBlockObjects.get(block.typeId);
    if(customBlockObject === undefined) { return; }


    //console.warn("broke custom block");
    const itemStack = eventData.itemStack;
    if(itemStack === undefined) { return; }
    const blockPremutation = block.permutation;
    const location = block.location;
    const centeredLocation = new Vector3(location.x+0.5, location.y+0.5, location.z+0.5);

    const harvestable = Boolean(blockPremutation.getState(`yes:harvestable`));
    
    const enchantable = itemStack.getComponent(ItemComponentTypes.Enchantable);
    if(!(enchantable instanceof ItemEnchantableComponent)) { return; }
    const silkTouchEnchant = enchantable.getEnchantment("silk_touch");
    let silkTouch = (silkTouchEnchant !== undefined) ? true : false;
    const fortuneEnchant = enchantable.getEnchantment("fortune");
    let fortuneLevel = (fortuneEnchant !== undefined) ? fortuneEnchant.level : 0;

    system.run(() => {
        dropCustomBlockLoot(player.dimension, centeredLocation, customBlockObject, harvestable, silkTouch, fortuneLevel);
    });
});

world.beforeEvents.explosion.subscribe(evenData => {
    const blocks = evenData.getImpactedBlocks();
    const dimension = evenData.dimension;
    blocks.forEach(block => {
        const customBlockObject = CustomBlockObjects.get(block.typeId);
        if(customBlockObject === undefined) { return; }
        
        const location = block.location;
        const centeredLocation = new Vector3(location.x+0.5, location.y+0.5, location.z+0.5);

        system.run(() => {
            dropCustomBlockLoot(dimension, centeredLocation, customBlockObject, true, false, 0);
        });
    });
});



//new Vector3(location.x+0.5, location.y+0.5, location.z+0.5)
/**
 * 
 * @param {Dimension} dimension 
 * @param {Vector3} location
 * @param {import("../Lists/CustomBlocksList").CustomBlock} customBlockObject 
 * @param {boolean} harvestable 
 * @param {boolean} silkTouch 
 * @param {number} fortuneLevel 
 */
function dropCustomBlockLoot(dimension, location, customBlockObject, harvestable, silkTouch, fortuneLevel) {
    if(harvestable && !silkTouch) {
        customBlockObject.loot.forEach(blockLoot => {
            spawnCustomBlockLoot(dimension, location, blockLoot, fortuneLevel);
        });
        const xpDrop = NumberUtil.getRandomInteger(customBlockObject.xpMin, customBlockObject.xpMax);
        for(let i=0; i<xpDrop; i++) {
            dimension.spawnEntity("minecraft:xp_orb", location);
        }
    }
}

/**
 * @param {Dimension} dimension 
 * @param {Vector3} location 
 * @param {import("../Lists/CustomBlocksList").BlockLoot} blockLoot 
 * @param {number} fortuneLevel 
 */
function spawnCustomBlockLoot(dimension, location, blockLoot, fortuneLevel) {
    let multiplier = 1;
    if(blockLoot.affectedByFortune) {   
        switch(fortuneLevel) {
            case 1:
                if(NumberUtil.getRandomInteger(1, 3) === 1) { multiplier = 2; }
                
                break;
            
            case 2:
                if(NumberUtil.getRandomInteger(1, 4) === 1) { multiplier = 2; }
                if(NumberUtil.getRandomInteger(1, 4) === 1) { multiplier = 3; }
                break;
                
            case 3:
                if(NumberUtil.getRandomInteger(1, 5) === 1) { multiplier = 2; }
                if(NumberUtil.getRandomInteger(1, 5) === 1) { multiplier = 3; }
                if(NumberUtil.getRandomInteger(1, 5) === 1) { multiplier = 4; }
                break;
        }
    }
    dimension.spawnItem(new ItemStack(blockLoot.typeId, blockLoot.amount*multiplier), location);
}