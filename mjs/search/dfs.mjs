export const dfs = async ({maze, start, goal, width, height, update}) => {
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
            return maze[_i] || mapRoad.has(_i) || stack.includes(_i) ? [] : [_i];
        });
    };
    const _start = toI(...start),
          _goal = toI(...goal),
          stack = [_start];
    let node = null,
        found = false;
    mapRoad.clear();
    while(stack.length) {
        const _i = stack.pop();
        await update(_i);
        if(_i === _goal) {
            found = true;
            break;
        }
        const abled = getAbled(_i);
        if(abled.length) {
            node = new Road(_i, node, abled);
            stack.push(...abled);
        }
        else {
            node = mapRoad.get(node.value);
        }
    }
    if(found) return [...Road.toArr(node), _goal];
    else throw 'Not found.';
};
const mapRoad = new Map;
class Road {
    constructor(value, parent, children){
        this.value = value;
        this.parent = parent;
        for(const i of children) mapRoad.set(i, this);
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
