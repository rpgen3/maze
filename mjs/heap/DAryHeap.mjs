export class DAryHeap {
    #isMaxHeap = false;
    #n = 1;
    #d = 4;
    constructor(isMaxHeap, n = 1){
        this.#isMaxHeap = Boolean(isMaxHeap);
        this.#n = n;
        this.#d = 2 << n;
        this.list = [];
    }
    #toParent(n){
        return n - 1 >> this.#n;
    }
    #toRoot(n){
        return (n << this.#n) + 1;
    }
    #compare(a, b){
        const {list} = this,
              c = list[a].priority,
              d = list[b].priority;
        return this.#isMaxHeap ? c > d : c < d;
    }
    #swap(a, b){
        const {list} = this;
        [list[a], list[b]] = [list[b], list[a]];
    }
    get length(){
        return this.list.length;
    }
    push(priority, value){
        const {list, length} = this;
        list.push(new Node(priority, value));
        let i = length;
        while(i){
            const p = this.#toParent(i);
            if(this.#compare(i, p)) this.#swap(i, p);
            i = p;
        }
    }
    pop(){
        const {list, length} = this,
              n = length - 1;
        if(n === 0) return list.pop().value;
        else if(n === -1) throw 'queue is empty.';
        const result = list[0];
        list[0] = list.pop();
        let i = 0;
        while(true){
            let r = this.#toRoot(i);
            if(r >= n) break;
            let _i = 0;
            for(let i = 1, max = Math.min(this.#d, n - r); i < max; i++) if(this.#compare(r + i, r + _i)) _i = i;
            r += _i;
            if(this.#compare(r, i)) this.#swap(r, i);
            i = r;
        }
        return result.value;
    }
}
class Node {
    constructor(priority, value) {
        this.priority = priority;
        this.value = value;
    }
}
