const toParent = n => n - 1 >> 1,
      toChild = n => (n << 1) + 1;
export class Heap {
    #isMaxHeap = false;
    constructor(isMaxHeap){
        this.#isMaxHeap = Boolean(isMaxHeap);
        this.list = [];
    }
    #compare(a, b){
        const {list} = this;
        return this.#isMaxHeap ? list[a].key > list[b].key : list[a].key < list[b].key;
    }
    #swap(a, b){
        const {list} = this;
        [list[a], list[b]] = [list[b], list[a]];
    }
    push(key, value){
        const {list} = this;
        list.push(new Node(key, value));
        let n = list.length - 1;
        while(n){
            const i = toParent(n);
            if(this.#compare(n, i)) this.#swap(n, i);
            n = i;
        }
    }
    pop(){
        const {list} = this;
        let n = list.length - 1;
        if(n === 0) return list.pop().value;
        else if(n === -1) throw 'queue is empty.';
        const result = list[0];
        list[0] = list.pop();
        let i = 0, j = toChild(i);
        while(j < n){
            if (j < n - 1 && this.#compare(j + 1, j)) j++; // 値の大きい方の子を選ぶ O(n)
            if (this.#compare(j, i)) this.#swap(j, i);
            i = j;
            j = toChild(i);
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
