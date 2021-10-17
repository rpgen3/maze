export const bfs = async ({maze, start, goal, width, height, update}) => {
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
          queue = [_start];
    let found = false;
    nodeMap.clear();
    new Node(_start, null);
    while(queue.length) {
        const _i = queue.shift(),
              node = nodeMap.get(_i);
        await update(_i);
        if(_i === _goal) {
            found = true;
            break;
        }
        const abled = getAbled(_i);
        if(!abled.length) continue;
        for(const i of abled) {
            new Node(i, node);
            queue.push(i);
        }
    }
    if(found) return Node.toArr(nodeMap.get(_goal));
    else throw 'Not found.';
};
const nodeMap = new Map;
class Node {
    constructor(index, parent){
        this.index = index;
        this.parent = parent;
        nodeMap.set(index, this);
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
