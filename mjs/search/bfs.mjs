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
    let node = null,
        found = false;
    nodeMap.clear();
    while(queue.length) {
        const _i = queue.shift();
        node = nodeMap.has(_i) ? nodeMap.get(_i) : null;
        await update(_i);
        if(_i === _goal) {
            found = true;
            break;
        }
        const abled = getAbled(_i);
        if(abled.length) {
            new Node(_i, node, abled);
            queue.push(...abled);
        }
    }
    if(found) return [...Node.toArr(node), _goal];
    else throw 'Not found.';
};
const nodeMap = new Map;
class Node {
    constructor(value, parent, children){
        this.value = value;
        this.parent = parent;
        for(const i of children) nodeMap.set(i, this);
    }
    static toArr(node){
        const arr = [];
        while(node !== null) {
            arr.unshift(node.value);
            node = node.parent;
        }
        return arr;
    }
}