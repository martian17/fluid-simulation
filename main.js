import { getCurl, getDiversionMatrix } from "./src/curl.js";
import { getBuffer64, freeBuffer64 } from "./src/buffer.js";


const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const squash = function(val,max){
    return (-2*max)/(1+Math.E**(2/max*val))+max;
}


const displayVectorField = function(vmap, width, height, spacing = 10, arrowLength = 9, maxMagnitude = 1){
    canvas.width = 500;
    canvas.height = 500*height/width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let sx = 0; sx < canvas.width; sx+=spacing){
        for(let sy = 0; sy < canvas.height; sy+=spacing){
            const x = Math.floor(sx/canvas.width*width);
            const y = Math.floor(sy/canvas.height*height);
            const idx = (y*width+x)*2;
            const vx = vmap[idx+0];
            const vy = vmap[idx+1];
            const magn = Math.sqrt(vx*vx+vy*vy);
            const q = squash(magn,maxMagnitude)/maxMagnitude*arrowLength;

            const sx1 = sx+q*vx/magn;
            const sy1 = sy+q*vy/magn;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx1, sy1);
            ctx.stroke()
        }
    }
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

const wing = await new Promise(res=>{
    const img = new Image();
    const canvas = document.createElement("canvas");
    img.src = "./plane-wing.png";
    img.addEventListener("load",()=>{
        console.log("asdf");
        const width = canvas.width = img.width;
        const height = canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);
        const imgdata = ctx.getImageData(0,0,width, height);
        // trim the image data
        const data = imgdata.data;
        console.log(data);
        let y0 = 0;
        outer1:
        for(; y0 < height; y0++){
            for(let j = 0; j < width; j++){
                const idx = (y0*width+j)*4;
                if(data[idx] < 100)break outer1;
            }
        }
        let y1 = height-1;
        outer2:
        for(; y1 >= y0; y1--){
            for(let j = 0; j < width; j++){
                const idx = (y0*width+j)*4;
                if(data[idx] < 100){
                    y1++;
                    break outer2;
                }
            }
        }
        let x0 = 0;
        outer3:
        for(; x0 < width; x0++){
            for(let i = 0; i < height; i++){
                const idx = (i*width+x0)*4;
                if(data[idx] < 100)break outer3;
            }
        }
        let x1 = width-1;
        outer4:
        for(; x1 >= x0; x1--){
            for(let i = 0; i < height; i++){
                const idx = (i*width+x1)*4;
                if(data[idx] < 100){
                    x1--;
                    break outer4;
                }
            }
        }
        const w = x1-x0;
        const h = y1-y0
        const buff = new Uint8Array(w*h);
        for(let i = 0; i < h; i++){
            for(let j = 0; j < w; j++){
                const y = i+y0;
                const x = j+x0;
                buff[i*w+j] = data[(y*width+x)*4] < 100 ? 0 : 1;
            }
        }
        res({buff, w, h});
    });
});


console.log(wing);


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
    // for(let y = 257; y < 512; y++){
    //     for(let x = 0; x < 512; x++){
    //         const idx = (y*width+x)*2;
    //         vmap[idx+0] = -airSpeed;
    //         vmap[idx+1] = 0;
    //     }
    // }
    vmap[(257*width+200)*2+0] = 0;
    //console.log(vmap);
    for(let i = 0;;i++){
        await new Promise(res=>setTimeout(res,20));

        getCurl(vmap,width,height);
        for(let y = 100; y < 101; y++){
            for(let x = 0; x < 510; x++){
                const idx = (y*width+x)*2;
                vmap[idx+0] = airSpeed;
                vmap[idx+1] = 0;
            }
        }
        for(let y = 400; y < 401; y++){
            for(let x = 0; x < 510; x++){
                const idx = (y*width+x)*2;
                vmap[idx+0] = airSpeed;
                vmap[idx+1] = 0;
            }
        }
        for(let y = 100; y < 400; y++){
            for(let x = 0; x < 50; x++){
                const idx = (y*width+x)*2;
                vmap[idx+0] = airSpeed;
                vmap[idx+1] = 0;
            }
        }
        // for(let y = 230; y < 270; y++){
        //     for(let x = 130; x < 170; x++){
        //         const idx = (y*width+x)*2;
        //         vmap[idx+0] = 0;
        //         vmap[idx+1] = 0;
        //     }
        // }
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
            // for(let y = 230; y < 270; y++){
            //     for(let x = 130; x < 170; x++){
            //         const idx = (y*width+x)*2;
            //         vmap[idx+0] = 0;
            //         vmap[idx+1] = 0;
            //     }
            // }
        }
        displayVectorField(vmap/*getDiversionMatrix(width,height)*/,width,height, 2, 5, 1);
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


