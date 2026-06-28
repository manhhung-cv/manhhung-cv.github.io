import { Block, BlockPermutation, BlockVolume, Dimension, GameMode, system, World, world } from "@minecraft/server";
import { Vector3 } from "../Math/Vector3";

const Directions = {
    north: "north",
    south: "south",
    west: "west",
    east: "east",
}




//#region plac/breaking
world.beforeEvents.playerInteractWithBlock.subscribe(eventData => {
    if(eventData.itemStack?.typeId !== "yes:firearms_workbench") { return; }
    const player = eventData.player;
    const blockLoc = new Vector3(eventData.block.location.x, eventData.block.location.y+1, eventData.block.location.z);

    const viewDirXZ = new Vector3(player.getViewDirection().x, 0, player.getViewDirection().z);
    const dotX = viewDirXZ.dot(new Vector3(1, 0, 0));
    const dotZ = viewDirXZ.dot(new Vector3(0, 0, 1));
    //when abs(dotX) > abs(dotZ), player is facing X --> test for +-Z blocks
    //when abs(dotZ) > abs(dotX), player is facing Z --> test for +-X blocks
    let direction = Directions.north;
    let testBlocks = [];
    if(dotX > 0 && Math.abs(dotX) > Math.abs(dotZ)) { //Facing north
        direction = Directions.north;
        testBlocks = [new Vector3(blockLoc.x, blockLoc.y, blockLoc.z+1),  //right block
                        new Vector3(blockLoc.x, blockLoc.y, blockLoc.z-1)]; //left block
                        console.log(`north`);
    }
    else if(dotX <= 0 && Math.abs(dotX) > Math.abs(dotZ)) {
        direction = Directions.south;
        testBlocks = [new Vector3(blockLoc.x, blockLoc.y, blockLoc.z-1),  //right block
                        new Vector3(blockLoc.x, blockLoc.y, blockLoc.z+1)]; //left block
                        console.log(`south`);
    }
    else if(dotZ > 0 && Math.abs(dotX) <= Math.abs(dotZ)) {
        direction = Directions.west;
        testBlocks = [new Vector3(blockLoc.x-1, blockLoc.y, blockLoc.z),  //right block
                        new Vector3(blockLoc.x+1, blockLoc.y, blockLoc.z)]; //left block
                        console.log(`west`);
    }
    else {
        direction = Directions.east;
        testBlocks = [new Vector3(blockLoc.x+1, blockLoc.y, blockLoc.z),  //right block
                        new Vector3(blockLoc.x-1, blockLoc.y, blockLoc.z)]; //left block
                        console.log(`east`);
    }
    const placeable = areBlocksAirOrRemovable(player.dimension, testBlocks);
    if(!placeable) {
        eventData.cancel = true;
        return;
    }
});

world.afterEvents.playerPlaceBlock.subscribe(eventData => {
    if(eventData.block.typeId !== "yes:firearms_workbench") { return; }
    const player = eventData.player;
    const blockLoc = eventData.block.location;

    const viewDirXZ = new Vector3(player.getViewDirection().x, 0, player.getViewDirection().z);
    const dotX = viewDirXZ.dot(new Vector3(1, 0, 0));
    const dotZ = viewDirXZ.dot(new Vector3(0, 0, 1));
    //when abs(dotX) > abs(dotZ), player is facing X --> test for +-Z blocks
    //when abs(dotZ) > abs(dotX), player is facing Z --> test for +-X blocks
    let direction = Directions.north;
    let testBlocks = [];
    if(dotX > 0 && Math.abs(dotX) > Math.abs(dotZ)) { //Facing north
        direction = Directions.north;
        testBlocks = [new Vector3(blockLoc.x, blockLoc.y, blockLoc.z+1),  //right block
                        new Vector3(blockLoc.x, blockLoc.y, blockLoc.z-1)]; //left block
                        console.log(`north`);
    }
    else if(dotX <= 0 && Math.abs(dotX) > Math.abs(dotZ)) {
        direction = Directions.south;
        testBlocks = [new Vector3(blockLoc.x, blockLoc.y, blockLoc.z-1),  //right block
                        new Vector3(blockLoc.x, blockLoc.y, blockLoc.z+1)]; //left block
                        console.log(`south`);
    }
    else if(dotZ > 0 && Math.abs(dotX) <= Math.abs(dotZ)) {
        direction = Directions.west;
        testBlocks = [new Vector3(blockLoc.x-1, blockLoc.y, blockLoc.z),  //right block
                        new Vector3(blockLoc.x+1, blockLoc.y, blockLoc.z)]; //left block
                        console.log(`west`);
    }
    else {
        direction = Directions.east;
        testBlocks = [new Vector3(blockLoc.x+1, blockLoc.y, blockLoc.z),  //right block
                        new Vector3(blockLoc.x-1, blockLoc.y, blockLoc.z)]; //left block
                        console.log(`east`);
    }
    let rightDirection = Directions.north;
    let leftDirection  = Directions.north;
    if(direction === Directions.north) {
        rightDirection = Directions.west;
        leftDirection = Directions.east;
    }
    else if(direction === Directions.south) {
        rightDirection = Directions.east;
        leftDirection = Directions.west;
    }
    else if(direction === Directions.west) {
        rightDirection = Directions.north;
        leftDirection = Directions.south;
    }
    else {
        rightDirection = Directions.south;
        leftDirection = Directions.north;
    }
    player.dimension.fillBlocks(new BlockVolume(testBlocks[0], testBlocks[0]), BlockPermutation.resolve('yes:firearms_workbench_side', {'minecraft:cardinal_direction': rightDirection}));
    player.dimension.fillBlocks(new BlockVolume(testBlocks[1], testBlocks[1]), BlockPermutation.resolve('yes:firearms_workbench_side', {'minecraft:cardinal_direction': leftDirection}));

    //console.log(`blockLoc: ${blockLoc.x} ${blockLoc.y} ${blockLoc.z}, left: ${testBlocks[0].x} ${testBlocks[0].y} ${testBlocks[0].z}, right: ${testBlocks[1].x} ${testBlocks[1].y} ${testBlocks[1].z}`);
    let locsArray = [blockLoc];
    testBlocks.forEach(location => {
        locsArray.push(location);
    });
    world.setDynamicProperty(JSON.stringify(blockLoc), JSON.stringify(locsArray));
    testBlocks.forEach(location => {
        world.setDynamicProperty(JSON.stringify(location), JSON.stringify(locsArray));
    });

});


world.beforeEvents.playerBreakBlock.subscribe(eventData => {
    if(eventData.block.typeId !== "yes:firearms_workbench" && eventData.block.typeId !== "yes:firearms_workbench_side") { return; }
    system.run(() => {
        onBreakFirearmsWorkbench(eventData.dimension, eventData.block, eventData.player.getGameMode() === GameMode.creative ? false : true);
    });
});


world.afterEvents.explosion.subscribe(eventData => {
    eventData.getImpactedBlocks().forEach(block => {
        if(block.typeId === "yes:firearms_workbench" || block.typeId === "yes:firearms_workbench_side") {
            onBreakFirearmsWorkbench(eventData.dimension, block, false);
        }
    });
})



/**
 * 
 * @param {Dimension} dimension 
 * @param {Block} block 
 * @param {boolean} shouldDropBlock
 */
function onBreakFirearmsWorkbench(dimension, block, shouldDropBlock) {
    const blockLoc = block.location;
    const blockLocArrayStr = String(world.getDynamicProperty(JSON.stringify(blockLoc)));
    if(blockLocArrayStr === undefined) { return; }
    /**@type {Array<Vector3>} */
    const blockLocArray = JSON.parse(blockLocArrayStr);
    blockLocArray.forEach(loc => {
        if(shouldDropBlock) {
            dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air destroy`);
        }
        else {
            dimension.getBlock(loc)?.setType('air');
        }
        world.setDynamicProperty(JSON.stringify(loc), undefined);
    });
}

/**
 * 
 * @param {Dimension} dimension 
 * @param {Vector3[]} blockLocations 
 * @returns {boolean}
 */
function areBlocksAirOrRemovable(dimension, blockLocations) {
    for(const loc of blockLocations) {
        const block = dimension.getBlock(loc);
        console.log(`${block?.typeId}, ${block?.location.x} ${block?.location.y} ${block?.location.z}`);
        if(block === undefined) { console.error(`tried to query an unloaded location in areBlocksAir(): ${loc.x}, ${loc.y}, ${loc.z}`); return false;}        
        if(!block.isAir && block.typeId !== "minecraft:short_grass" && block.typeId !== "minecraft:tall_grass") { return false; }
    }
    return true;
}
//#endregion