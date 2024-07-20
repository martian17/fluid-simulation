import { getCurl, getDiversionMatrix, getComplexPressureMatrix } from "./src/curl.js";
import { getBuffer64, freeBuffer64 } from "./src/buffer.js";
import { toColor } from "./src/color.js";
import { wing } from "./assets.js";


const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const squash = function(val,max){
    return (-2*max)/(1+Math.E**(2/max*val))+max;
}


const stepVelocityField = function(vmap, width, height){
    const vmap1 = getBuffer64(vmap.length);
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            const idx = (y*width+x)*2;
            const vx = vmap[idx+0];
            const vy = vmap[idx+1];
            const x1 = x-vx;
            const y1 = y-vy;

            const x0 = (Math.floor(x1)+width)%width;
            const x2 = (x0+1+width)%width;
            const y0 = (Math.floor(y1)+height)%height;
            const y2 = (y0+1+height)%height;
            const xr = x1-Math.floor(x1);
            const yr = y1-Math.floor(y1);
            // linear interpolation
            //if(Math.random() < 0.001)console.log(x,y,x0,y0);
            const nwvx = vmap[(y0*width+x0)*2+0]
            const nwvy = vmap[(y0*width+x0)*2+1]
            const nevx = vmap[(y0*width+x2)*2+0]
            const nevy = vmap[(y0*width+x2)*2+1]
            const swvx = vmap[(y2*width+x0)*2+0]
            const swvy = vmap[(y2*width+x0)*2+1]
            const sevx = vmap[(y2*width+x2)*2+0]
            const sevy = vmap[(y2*width+x2)*2+1]
            const nvx1 = nwvx*(1-xr)+nevx*(xr);
            const nvy1 = nwvy*(1-xr)+nevy*(xr);
            const svx1 = swvx*(1-xr)+sevx*(xr);
            const svy1 = swvy*(1-xr)+sevy*(xr);
            const vx1 = nvx1*(1-yr)+svx1*(yr);
            const vy1 = nvy1*(1-yr)+svy1*(yr);
            vmap1[idx+0] = vx1;
            vmap1[idx+1] = vy1;
        }
    }
    vmap.set(vmap1);
    freeBuffer64(vmap1);
    return vmap;
};

{
    const width = 512;
    const height = 512;
    const vmap = new Float64Array(width*height*2);
    const airSpeed = 1;
    for(let y = 0; y < 512; y++){
        for(let x = 0; x < 512; x++){
            const idx = (y*width+x)*2;
            vmap[idx+0] = airSpeed;
            vmap[idx+1] = 0;
        }
    }
    vmap[(257*width+200)*2+0] = 0;
    // density map
    const dmap = new Float64Array(width*height*2);// density map
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            const idx = (y*width+x)*2;
            vmap[idx+0] = 0;
            vmap[idx+0] = 0;
        }
    }
    

    //console.log(vmap);
    for(let i = 0;;i++){
        await new Promise(res=>setTimeout(res,20));
        // set borders
        const borderWidth = 50;
        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                if(y > borderWidth && y < height-borderWidth && x > borderWidth && x < width-borderWidth){
                    x += width-borderWidth*2;
                    continue;
                }
                const idx = (y*width+x)*2;
                vmap[idx+0] = 0;
                vmap[idx+0] = 0;
            }
        }

        getCurl(vmap,width,height);
        for(let y = 0; y < height; y++){
            for(let x = 0; x < 50; x++){
                const idx = (y*width+x)*2;
                vmap[idx+0] = airSpeed;
                vmap[idx+1] = 0;
            }
        }
        console.log(i);
        // run twice to get the stable result
        //getCurl(vmap,width,height);
        for(let i = 0; i < 1; i++){
            getCurl(vmap,width,height);
            // painting the plane wing in
            for(let x = 130; x < 130+wing.w; x++){
                for(let y = 230; y < 230+wing.h; y++){
                    const idx = (y*width+x)*2;
                    const widx = ((y-230)*wing.w+(x-130));
                    vmap[idx+0] *= wing.buff[widx];
                    vmap[idx+1] *= wing.buff[widx];
                }
            }
        }
        //displayVectorField(vmap/*getDiversionMatrix(width,height)*/,width,height, 2, 5, 10);
        renderHeatmap(vmap,width,height);
        stepVelocityField(vmap, width, height);
    }
}




// test 1: draw vector field
// {
//     const width = 512;
//     const height = 512
//     const vmap = new Float64Array(width*height*2);
//     for(let y = 0; y < height; y++){
//         for(let x = 0; x < width; x++){
//             const idx = (y*width+x)*2;
//             vmap[idx+0] = 0.2;
//             vmap[idx+1] = y/height*2;
//         }
//     }
//     displayVectorField(vmap,width,height);
// }


