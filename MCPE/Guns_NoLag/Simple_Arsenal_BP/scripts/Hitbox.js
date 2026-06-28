import { Entity, Player, system, world } from '@minecraft/server'
import { Vector3 } from './Math/Vector3';

/**
 * 
 * @param {Entity} entity 
 */
function teleportHitboxEntity(entity) {
    const headHitBoxEntity = entity.dimension.getEntities({type: "yes:head_hitbox_entity", closest: 1})[0];
    const intervalId = system.runInterval(() => {
        if(!entity.isValid()) { 
            system.clearRun(intervalId); 
            headHitBoxEntity.remove(); 
            return; 
        }
        const location = entity.getHeadLocation();
        const facingLocation = new Vector3(entity.getHeadLocation().x, entity.getHeadLocation().y, entity.getHeadLocation().z).add(entity.getViewDirection());
        system.runTimeout(() => {
            if(headHitBoxEntity.isValid()) { headHitBoxEntity.teleport(location, { facingLocation: facingLocation}); }
        }, 3);
    });
}

/*
world.afterEvents.entitySpawn.subscribe(eventData => {
    if(eventData.entity.typeId !== "minecraft:husk") { return; }

    const husk = eventData.entity;
    husk.dimension.spawnEntity("yes:head_hitbox_entity", husk.getHeadLocation());
    teleportHitboxEntity(husk);
});
*/


/**
 * 
 * @param {Player} player 
 */
function test(player) {
    console.log(`head x: ${player.getHeadLocation().x}, y: ${player.getHeadLocation().y}, z: ${player.getHeadLocation().z}`);
    console.log(`view x: ${player.getViewDirection().x}, y: ${player.getViewDirection().y}, z: ${player.getViewDirection().z}`);
    const headHitBoxEntity = player.dimension.getEntities({type: "yes:head_hitbox_entity", closest: 1})[0];
    const tpLocation = new Vector3(player.getViewDirection().x*5, player.getViewDirection().y*5, player.getViewDirection().z*5).add(player.getHeadLocation());
    headHitBoxEntity.teleport(tpLocation); 
}

export { teleportHitboxEntity };