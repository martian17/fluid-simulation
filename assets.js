export const wing = await new Promise(res=>{
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
