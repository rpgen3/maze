import {Heap} from 'https://rpgen3.github.io/maze/mjs/Heap.mjs';
export const aStar = async ({maze, start, goal, width, height, update, heuristic, weight = [1, 1], giveup = false}) => {
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
    const _start = toI(...start),
          _goal = toI(...goal),
          [wG, wH] = weight,
          calcH = i => heuristic(...goal, ...toXY(i)) * wH,
          nodeMap = new Map,
          heap = new Heap();
    nodeMap.set(_start, new Node(_start, null, 0, calcH(_start)));
    heap.push(0, _start);
    let found = false,
        min = Infinity;
    while(heap.list.length) {
        const node = heap.pop(),
              {index, gCost, cost} = node;
        if(giveup) {
            if(min < cost) throw 'Not found.';
            min = cost;
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
            const tmp = new Node(i, node, g * wG, calcH(i));
            nodeMap.set(i, tmp);
            heap.push(tmp.cost, i);
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
