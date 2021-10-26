const toParent = n => n - 1 >> 1,
      toRoot = n => (n << 1) + 1;
export class Heap {
    #isMaxHeap = false;
    constructor(isMaxHeap){
        this.#isMaxHeap = Boolean(isMaxHeap);
        this.list = [];
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
            const p = toParent(i);
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
            let r = toRoot(i);
            if(r >= n) break;
            else if(r < n - 1 && this.#compare(r + 1, r)) r++;
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
