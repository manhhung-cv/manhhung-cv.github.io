export const Config = {

    countdown: 15,

    gameTime: 180,

    zombieHP: 120,

    humanHP: 20,

    bossHP: 500,

    lobby: {
        x: 0,
        y: 5,
        z: 0
    },

    currentMap: 0,

    maps: [

        {

            id: 1,

            name: "Trạm Phát Sóng",

            center: {
                x:145,
                y:64,
                z:-210
            },

            spawnPoints: [

                {x:130,y:64,z:-200},

                {x:150,y:64,z:-205},

                {x:165,y:64,z:-215},

                {x:140,y:64,z:-230}

            ]

        }

    ]

}