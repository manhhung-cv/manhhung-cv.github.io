import { Config } from "./config.js";
import { randomElement } from "./util.js";

export function getCurrentMap(){

    return Config.maps[Config.currentMap];

}

export function setCurrentMap(id){

    const index=Config.maps.findIndex(map=>map.id==id);

    if(index!=-1){

        Config.currentMap=index;

    }

}

export function randomSpawn(){

    const map=getCurrentMap();

    return randomElement(map.spawnPoints);

}

export function teleportPlayer(player){

    const pos=randomSpawn();

    player.teleport({

        x:pos.x,

        y:pos.y,

        z:pos.z

    });

}