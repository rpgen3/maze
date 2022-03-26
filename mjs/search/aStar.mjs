import {Heap} from 'https://rpgen3.github.io/maze/mjs/heap/Heap.mjs';
export const aStar = async ({maze, start, goal, width, height, update, heuristic, dfs = false, giveup = false}) => {
    const toI = (x, y) => x + y * width;
    const toXY = i => {
        const x = i % width,
              y = i / width | 0;
        return [x, y];
    };
    const getAbled = i => {
        const [x, y] = toXY(i);
        const way = [];
        if(x !== 0) way.push([-1, 0]);
        if(x !== width - 1) way.push([1, 0]);
        if(y !== 0) way.push([0, -1]);
        if(y !== height - 1) way.push([0, 1]);
        return way.flatMap(([_x, _y]) => {
            const _i = toI(_x + x, _y + y);
            return maze[_i] || nodeMap.has(_i) ? [] : [_i];
        });
    };
    const _goal = toI(...goal),
          calcH = i => heuristic(...goal, ...toXY(i)),
          nodeMap = new Map,
          heap = new Heap(),
          heapMap = new Map;
    const add = (priority, node) => {
        if(!heapMap.has(priority)) {
            const h = new Heap(dfs);
            heapMap.set(priority, h);
            heap.add(priority, h);
        }
        heapMap.get(priority).add(node.gCost, node);
    };
    const pop = () => {
        const h = heap.first,
              node = h.pop();
        if(!h.length) {
            heap.pop();
            heapMap.delete(node.cost);
        }
        return node;
    };
    {
        const i = toI(...start),
              tmp = new Node(i, null, 0, calcH(i));
        nodeMap.set(i, tmp);
        add(tmp.cost, tmp);
    }
    let found = false,
        min = Infinity;
    while(heap.length) {
        const node = pop(),
              {index, gCost} = node;
        if(giveup) {
            const {hCost} = node;
            if(min < hCost) break;
            min = hCost;
        }
        await update(index);
        if(index === _goal) {
            found = true;
            break;
        }
        const abled = getAbled(index);
        if(!abled.length) continue;
        const g = gCost + 1;
        for(const i of abled) {
            const tmp = new Node(i, node, g, calcH(i));
            nodeMap.set(i, tmp);
            add(tmp.cost, tmp);
        }
    }
    if(found) return Node.toArr(nodeMap.get(_goal));
    else throw 'Not found.';
};
class Node {
    constructor(index, parent, gCost, hCost){
        this.index = index;
        this.parent = parent;
        this.gCost = gCost;
        this.hCost = hCost;
        this.cost = gCost + hCost;
    }
    static toArr(node){
        const arr = [];
        while(node !== null) {
            arr.unshift(node.index);
            node = node.parent;
        }
        return arr;
    }
}
