import {fft64InPlace, ifft64InPlace} from "flat-fft";
import {getBuffer64, freeBuffer64} from "./buffer.js";

// store result in buff1, and destroy buff2 (fft result)
export const convolveUnsafe = function(buff1, buff2){
    if(!(buff1 instanceof Float64Array))throw new Error("Expected float 64 array");
    fft64InPlace(buff1);
    fft64InPlace(buff2);
    // output to buff1
    for(let i = 0; i < buff1.length; i+=2){
        const r1 = buff1[i];
        const r2 = buff2[i];
        const i1 = buff1[i+1];
        const i2 = buff2[i+1];
        buff1[i] = r1*r2-i1*i2;
        buff1[i+1] = r1*i2+r2*i1;
    }
    ifft64InPlace(buff1);
    return buff1;
};


export const fft2d64InPlace = function(buff, width, height){
    const w2 = width*2;
    const h2 = height*2;
    const column = getBuffer64(h2);
    for(let i = 0; i < w2; i+=2){
        for(let j = 0; j < h2; j+=2){
            column[j+0] = buff[j*width+i+0];
            column[j+1] = buff[j*width+i+1];
        }
        fft64InPlace(column);
        for(let j = 0; j < h2; j+=2){
            buff[j*width+i+0] = column[j+0];
            buff[j*width+i+1] = column[j+1];
        }
    }
    for(let i = 0; i < height; i++){
        fft64InPlace(buff.subarray(i*w2, (i+1)*w2));
    }
    freeBuffer64(column);
    return buff;
};

export const ifft2d64InPlace = function(buff, width, height){
    const w2 = width*2;
    const h2 = height*2;
    const column = getBuffer64(h2);
    for(let i = 0; i < height; i++){
        ifft64InPlace(buff.subarray(i*w2, (i+1)*w2));
    }
    for(let i = 0; i < w2; i+=2){
        for(let j = 0; j < h2; j+=2){
            column[j+0] = buff[j*width+i+0];
            column[j+1] = buff[j*width+i+1];
        }
        ifft64InPlace(column);
        for(let j = 0; j < h2; j+=2){
            buff[j*width+i+0] = column[j+0];
            buff[j*width+i+1] = column[j+1];
        }
    }
    freeBuffer64(column);
    return buff;
};

// result to buff1, and preserve buff2
export const convolve2d64InPlace = function(buff1, _buff2, width, height){
    const buff2 = getBuffer64(_buff2.length);
    buff2.set(_buff2);
    fft2d64InPlace(buff1, width, height);
    fft2d64InPlace(buff2, width, height);
    for(let i = 0; i < buff1.length; i+=2){
        const r1 = buff1[i];
        const r2 = buff2[i];
        const i1 = buff1[i+1];
        const i2 = buff2[i+1];
        buff1[i] = r1*r2-i1*i2;
        buff1[i+1] = (r1*i2+r2*i1);
    }
    ifft2d64InPlace(buff1, width, height);
    freeBuffer64(buff2);
    return buff1;
}

