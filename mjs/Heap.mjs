const toParent = n => n - 1 >> 1,
      toChild = n => (n << 1) + 1;
export class Heap {
    #isMaxHeap = false;
    constructor(isMaxHeap){
        this.#isMaxHeap = Boolean(isMaxHeap);
        this.list = [];
    }
    #compare(a, b){
        const {list} = this,
              c = list[a].key,
              d = list[b].key;
        return this.#isMaxHeap ? c > d : c < d;
    }
    #swap(a, b){
        const {list} = this;
        [list[a], list[b]] = [list[b], list[a]];
    }
    push(key, value){
        const {list} = this;
        list.push(new Node(key, value));
        let i = list.length - 1;
        while(i){
            const p = toParent(i);
            if(this.#compare(i, p)) this.#swap(i, p);
            i = p;
        }
    }
    pop(){
        const {list} = this,
              n = list.length - 1;
        if(n === 0) return list.pop().value;
        else if(n === -1) throw 'queue is empty.';
        const result = list[0];
        list[0] = list.pop();
        let i = 0;
        while(true){
            let c = toChild(i);
            if(c >= n) break;
            else if (c < n - 1 && this.#compare(c + 1, c)) c++;
            if (this.#compare(c, i)) this.#swap(c, i);
            i = c;
        }
        return result.value;
    }
}
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
