export const toColor = function(v){
    if(v > 1)v = 1;
    if(v < 0)v = 0;
    const r = v*256;
    const g = Math.cos((v-0.5)*4)*255;
    //const g = (0.5-Math.abs(v-0.5))*2*256;
    const b = (1-v)*256;
    const a = 255;
    return [r,g,b,a];
};


// class ColorConverter{
// 
//     r(v){
//     }
//     g(v){
//     }
//     b(v){
//     }
// }
