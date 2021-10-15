const calcEuclid = (x, y, _x, _y) => (_x - x) ** 2 + (_y - y) ** 2;
export const greedyDFS = async ({maze, start, goal, width, height, update}) => {
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
          stack = [_start];
    let node = null,
        found = false;
    nodeMap.clear();
    while(stack.length) {
        const _i = stack.pop();
        await update(_i);
        if(_i === _goal) {
            found = true;
            break;
        }
        const abled = getAbled(_i);
        if(abled.length) {
            const m = new Map;
            for(const v of abled) m.set(v, calcEuclid(...goal, ...toXY(v)));
            const a = [...m].sort((a, b) => (a[1] < b[1] ? -1 : 1)).map(v => v[0]);
            node = new Node(_i, node, a);
            stack.push(...a);
        }
        else {
            node = nodeMap.get(stack[stack.length - 1]);
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
