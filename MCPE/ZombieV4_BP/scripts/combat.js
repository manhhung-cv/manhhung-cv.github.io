import { world } from "@minecraft/server";
import { getPlayerData } from "./player.js";

world.afterEvents.entityHurt.subscribe((event)=>{

    const victim=event.hurtEntity;

    if(victim.typeId!="minecraft:player") return;

    const data=getPlayerData(victim);

    if(data.team=="zombie"){

        try{

            victim.addEffect("slowness",20,{

                amplifier:1,

                showParticles:false

            });

        }catch{}

    }

});