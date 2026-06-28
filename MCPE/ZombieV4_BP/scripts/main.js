import { world, system } from "@minecraft/server";

import { tick } from "./game.js";

import { getPlayerData } from "./player.js";

world.afterEvents.playerSpawn.subscribe((event)=>{

    getPlayerData(event.player);

});

system.runInterval(()=>{

    tick();

},20);

world.sendMessage("§aZombie V4 Loaded");

import "./event.js";
import "./combat.js";

import { updateHUD } from "./ui.js";

system.runInterval(()=>{

    tick();

    updateHUD();

},20);