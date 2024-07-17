const buffer64Pool = [];
export const getBuffer64 = function(length){
    let pool;
    if(!buffer64Pool[length]){
        pool = buffer64Pool[length] = [];
    }else{
        pool = buffer64Pool[length];
    }
    let buff;
    if(pool.length === 0){
        buff = new Float64Array(length);
    }else{
        buff = pool.pop();
    }
    return buff;
};
export const freeBuffer64 = function(buff){
    let pool;
    const length = buff.length;
    if(!buffer64Pool[length]){
        pool = buffer64Pool[length] = [];
    }else{
        pool = buffer64Pool[length];
    }
    pool.push(buff);
};
