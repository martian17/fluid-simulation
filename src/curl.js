import {getBuffer64, freeBuffer64} from "./buffer.js";
import {convolve2d64InPlace} from "./convolution.js";


const getComplexPressureMatrix = function(vmap, width, height){
    // vmap: Float64Array[x y :]
    const pmap = getBuffer64(width*height*2);
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            const y0 = (y+height-1)%height;
            const y1 = (y+1)%height;
            const x0 = (x+width-1)%width;
            const x1 = (x+1)%width;
            const idx = (y*width+x)*2;
            const idx_ny = (y0*width+x)*2+1;
            const idx_sy = (y1*width+x)*2+1;
            const idx_wx = (y*width+x0)*2;
            const idx_ex = (y*width+x1)*2;
            const p = vmap[idx_ny]-vmap[idx_sy]+vmap[idx_wx]-vmap[idx_ex];
            pmap[idx] = p;
            pmap[idx+1] = 0;// set imaginary to 0
        }
    }
    return pmap;
}

const dmaps = new Map;
export const getDiversionMatrix = function(width, height){
    const id = width|(height<<16);
    if(dmaps.has(id))return dmaps.get(id);
    // center (tl) has quantity 1, and spreads out
    const dmap = getBuffer64(width*height*2);
    const k = 1/4/3;
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            if(x === 0 && y === 0)continue
            const dy = (y+height/2)%height-height/2;
            const dx = (x+width/2)%width-width/2;
            const r = Math.sqrt(dy*dy+dx*dx);
            const g = k/r;// gradient magnitude
            const idx = (height*y+x)*2;
            dmap[idx+0] = -(g*dx/r);
            dmap[idx+1] = -(g*dy/r);
        }
    }
    dmaps.set(id,dmap);
    for(let i = 0; i < dmap.length; i++){
        dmap[i] = -dmap[i];
    }
    return dmap;
}


export const getCurl = function(vmap, width, height){
    const pmap = getComplexPressureMatrix(vmap, width, height);
    for(let i = 0; i < pmap.length; i++){
        //pmap[i] = 0;
    }
    // pmap: pair(p, imag=0)
    convolve2d64InPlace(pmap,getDiversionMatrix(width,height), width, height);
    // now pmap stores the negative divergence (yay!)
    // extract the curl
    for(let i = 0; i < vmap.length; i+=2){
        vmap[i+0] += pmap[i+0];
        vmap[i+1] += pmap[i+1];
    }
    freeBuffer64(pmap);
    return vmap;
}




