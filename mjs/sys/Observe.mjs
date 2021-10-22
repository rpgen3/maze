export class Observe {
    constructor(num){
        this.arr = [...Array(num)];
    }
    unchanged(...arg){
        let flag = true;
        for(const [i, v] of this.arr.entries()) {
            if(v === arg[i]) continue;
            this.arr[i] = v;
            if(flag) flag = false;
        }
        return flag;
    }
}
