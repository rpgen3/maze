export const aStar = async ({maze, start, goal, width, height, update, heuristic}) => {
    const toI = (x, y) => x + y * width;
    const toXY = i => {
        const x = i % width,
              y = i / width | 0;
        return [x, y];
    };
    const getMin = () => {
        let _cost = Infinity,
            _i = -1,
            _node = null;
        for(const [i, v] of openList.entries()) {
            const node = nodeMap.get(v),
                  {cost} = node;
            if(_cost <= cost) continue;
            _cost = cost;
            _i = i;
            _node = node;
        }
        openList.splice(_i, 1);
        closeList.push(_i);
        return _node;
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
            return maze[_i] ? [] : [_i];
        });
    };
    const calcH = i => heuristic(...goal, ...toXY(i));
    const _start = toI(...start),
          _goal = toI(...goal);
    const openList = [_start],
          closeList = [];
    nodeMap.clear();
    nodeMap.set(_start, new Node(_start, null, 0, calcH(_start)));
    let found = false;
    while(openList.length) {
        const node = getMin(),
              {index, gCost} = node;
        await update(index);
        if(index === _goal) {
            found = true;
            break;
        }
        const abled = getAbled(index);
        if(abled.length) {
            const g = gCost + 1;
            for(const i of abled) {
                const last = nodeMap.get(i),
                      h = last ? last.hCost : calcH(i),
                      _node = new Node(i, node, g, h);
                if(last && last.cost <= _node.cost) continue;
                nodeMap.set(i, _node);
                openList.push(i);
            }
        }
    }
    if(found) return [...Node.toArr(nodeMap.get(_goal)), _goal];
    else throw 'Not found.';
};
const nodeMap = new Map;
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
