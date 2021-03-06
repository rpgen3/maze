export class Heap {
    #isMaxHeap;
    #n;
    #d;
    constructor(isMaxHeap = false, n = 1) { // n is a parameter of "d-ary heap".
        this.#isMaxHeap = isMaxHeap;
        this.#n = n;
        this.#d = 2 << n;
        this.list = [];
    }
    #toParent(n) {
        return n - 1 >> this.#n;
    }
    #toRoot(n) {
        return (n << this.#n) + 1;
    }
    #compare(a, b) {
        const {list} = this,
              c = list[a].priority,
              d = list[b].priority;
        return this.#isMaxHeap ? c > d : c < d;
    }
    #swap(a, b) {
        const {list} = this;
        [list[a], list[b]] = [list[b], list[a]];
    }
    get length() {
        return this.list.length;
    }
    get first() {
        return this.list[0].value;
    }
    add(priority, value) {
        const {list, length} = this;
        list.push(new Node(priority, value));
        let i = length;
        while(i){
            const p = this.#toParent(i);
            if(this.#compare(i, p)) this.#swap(i, p);
            i = p;
        }
    }
    #pop() {
        const {list, length} = this,
              n = length - 1;
        if(n === 0) return list.pop();
        else if(n === -1) throw 'queue is empty.';
        const result = list[0];
        list[0] = list.pop();
        let i = 0;
        while(true){
            let r = this.#toRoot(i);
            if(r >= n) break;
            let _i = 0;
            for (let i = 1, max = Math.min(this.#d, n - r); i < max; i++) if(this.#compare(r + i, r + _i)) _i = i;
            r += _i;
            if(this.#compare(r, i)) this.#swap(r, i);
            i = r;
        }
        return result;
    }
    pop() {
        return this.#pop().value;
    }
    *[Symbol.iterator]() {
        while (this.length) yield this.pop();
    }
    *entries() {
        while (this.length) yield this.#pop();
    }
}
class Node {
    constructor(priority, value) {
        this.priority = priority;
        this.value = value;
    }
}
