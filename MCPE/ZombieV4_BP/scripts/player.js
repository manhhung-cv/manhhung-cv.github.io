const data=new Map();

export function getPlayerData(player){

    if(!data.has(player.id)){

        data.set(player.id,{

            team:"human",

            dead:false,

            boss:false,

            kills:0,

            deaths:0,

            money:0

        });

    }

    return data.get(player.id);

}

export function resetPlayer(player){

    data.set(player.id,{

        team:"human",

        dead:false,

        boss:false,

        kills:0,

        deaths:0,

        money:0

    });

}