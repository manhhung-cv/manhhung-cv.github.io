export function random(min,max){

    return Math.floor(Math.random()*(max-min+1))+min;

}

export function randomElement(array){

    return array[random(0,array.length-1)];

}

export function formatTime(sec){

    const m=Math.floor(sec/60);

    const s=sec%60;

    return `${m}:${s.toString().padStart(2,"0")}`;

}