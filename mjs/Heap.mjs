const toParent = n => n - 1 >> 1,
      toChild = n => (n << 1) + 1;
export class Heap {
    constructor(isMaxHeap){
        this.compare = isMaxHeap ? (a, b) => a.key > b.key : (a, b) => a.key < b.key;
        this.list = [];
    }
    #swap(a, b){
        const {list} = this;
        [list[a], list[b]] = [list[b], list[a]];
    }
    push(key, value){
        const {compare, list} = this;
        list.push(new Node(key, value));
        let n = list.length - 1;
        while(n){
            const i = toParent(n);
            if(compare(list[n], list[i])) this.#swap(n, i);
            n = i;
        }
    }
    pop(){
        const {compare, list} = this;
        let n = list.length - 1;
        if(n === 0) return list.pop().value;
        else if(n === -1) throw 'queue is empty.';
        const result = list[0];
        list[0] = list.pop();
        let i = 0, j = toChild(i);
        while(j < n){
            if (j < n - 1 && compare(list[j + 1], list[j])) j++; // 値の大きい方の子を選ぶ O(n)
            if (compare(list[j], list[i])) this.#swap(j, i);
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
