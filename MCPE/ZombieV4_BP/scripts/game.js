export const GameState={

    LOBBY:0,

    COUNTDOWN:1,

    PLAYING:2,

    ENDING:3

}

export let state=GameState.LOBBY;

export let timer=0;

export function setState(value){

    state=value;

}

export function setTimer(value){

    timer=value;

}

export function tick(){

    if(timer>0){

        timer--;

    }

}