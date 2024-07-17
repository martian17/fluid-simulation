// // result to buff1, and preserves buff2
// export const convolve2d = function(buff1, buff2, width, height){
//     const b1 = getBuffer64(height*2);
//     const b2 = getBuffer64(height*2);
//     // first vertical stripes
//     for(let i = 0; i < width*2; i+=2){
//         for(let j = 0; j < height; j++){
//             b1[j+0] = buff1[j*width*2+i+0];
//             b1[j+1] = buff1[j*width*2+i+1];
//         }
//         for(let j = 0; j < height; j++){
//             b2[j+0] = buff2[j*width*2+i+0];
//             b2[j+1] = buff2[j*width*2+i+0];
//         }
//         console.log([...b1],[...b2]);
//         convolve(b1,b2);
//         console.log([...b1],[...b2]);
//         for(let j = 0; j < height; j++){
//             buff1[j*width*2+i+0] = b1[j*2+0];
//             buff1[j*width*2+i+1] = b1[j*2+1];
//         }
//     }
//     // for(let i = 0; i < buff1.length; i++){
//     //     if(buff1[i] !== 0)console.log(i,buff1[i]);
//     // }
//     console.log(buff1,buff2);
//     throw new Error("asdf");
//     freeBuffer64(b1);
//     freeBuffer64(b2);
// 
//     const b3 = getBuffer64(width*2);
//     // then horizontal strips
//     for(let i = 0; i < height; i++){
//         const b1 = buff1.subarray(i*width*2,width*2);
//         // don't destroy the buffer 2
//         const b2 = b3;//buff2.subarray(i*width*2,width*2);
//         b2.set(buff2,i*width*2);
//         convolve(b1,b2);
//     }
//     freeBuffer64(b3);
//     // now the result is stored in buff1
//     // buff2 is preserved
//     return buff1;
// }
