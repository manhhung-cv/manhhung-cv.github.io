import { world } from "@minecraft/server";
import { getPlayerData, resetPlayer } from "./player.js";

/*
 * Khởi tạo dữ liệu khi người chơi vào game
 */
world.afterEvents.playerSpawn.subscribe((event) => {

    const player = event.player;

    getPlayerData(player);

});

/*
 * Reset dữ liệu khi rời game
 * (Có thể mở rộng nếu API phiên bản của bạn hỗ trợ playerLeave)
 */

/*
 * Sự kiện chat dành cho debug
 */

world.beforeEvents.chatSend.subscribe((event)=>{

    const msg=event.message;

    if(msg=="!reset"){

        resetPlayer(event.sender);

        event.sender.sendMessage("§aPlayer Data Reset");

        event.cancel=true;

    }

});