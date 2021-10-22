export class Observe {
    constructor(num){
        this.arr = [...Array(num)];
    }
    changed(...arg){
        let flag = false;
        for(const [i, v] of this.arr.entries()) {
            if(v === arg[i]) continue;
            this.arr[i] = v;
            if(!flag) flag = true;
        }
        return flag;
    }
}
