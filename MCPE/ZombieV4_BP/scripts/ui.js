import { world } from "@minecraft/server";
import { timer } from "./game.js";
import { formatTime } from "./util.js";
import { getPlayerData } from "./player.js";

export function updateHUD(){

    for(const player of world.getPlayers()){

        let human=0;

        let zombie=0;

        for(const p of world.getPlayers()){

            const data=getPlayerData(p);

            if(data.team=="human"){

                human++;

            }else{

                zombie++;

            }

        }

        player.onScreenDisplay.setActionBar(

`§6Zombie V4

§aHuman : ${human}

§cZombie : ${zombie}

§eTime : ${formatTime(timer)}`

        );

    }

}