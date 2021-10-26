const toP = n => n - 1 >> 1,
      toL = n => (n << 1) + 1;
const swap = (arr, a, b) => {
    const tmp = arr[a];
    arr[a] = arr[b];
    arr[b] = tmp;
};
export class Heap {
    constructor(isMaxHeap){
        this.compare = isMaxHeap ? (a, b) => a.key > b.key : (a, b) => a.key < b.key;
        this.list = [];
    }
    push(key, value){
        const {compare, list} = this;
        list.push(new Node(key, value));
        let n = list.length - 1;
        while(n){
            const i = toP(n);
            if(compare(list[n], list[i])) swap(list, n, i);
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
        let i = 0, j = toL(i);
        while(j < n){
            if (j < n - 1 && compare(list[j + 1], list[j])) j++; // 値の大きい方の子を選ぶ O(n)
            if (compare(list[j], list[i])) swap(list, j, i);
            i = j;
            j = toL(i);
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
