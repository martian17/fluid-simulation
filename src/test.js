import { fft64InPlace, ifft64InPlace } from "flat-fft"
import { convolve2d64InPlace, convolveUnsafe } from "./convolution.js"



outer:
for(let i = 0; i < 10; i++){
    const arr = new Float64Array(1024);
    for(let j = 0; j < 1024; j+=2){
        arr[j] = Math.random();
        arr[j+1] = Math.random();
    }
    const arr2 = new Float64Array(1024);
    arr2.set(arr);
    fft64InPlace(arr2);
    ifft64InPlace(arr2);
    for(let i = 0; i < arr.length; i++){
        if(Math.abs(arr[i]-arr2[i]) > 0.0001){
            console.log("fail");
            console.log([arr,arr2]);
            continue outer;
        }
    }
    console.log("success");
}


const printMatrix = function(arr,width){
    arr = arr.map(v=>v<1e-10?0:v)
    let i = 0;
    let res = "";
    while(i < arr.length){
        for(let j = 0; j < width; j++){
            res += arr[i++]+",\t";
        }
        res += "\n";
    }
    console.log(res.slice(0,-1));
}

printMatrix(convolve2d64InPlace(new Float64Array([
    11, 12, 13, 14, 15, 16, 17, 18,
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
]), new Float64Array([
    1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
]),4,4),8);



console.log(convolveUnsafe(new Float64Array([2,3,1,0,0,0,1,3]), new Float64Array([0,0,1,0,0,0,0,0])));
