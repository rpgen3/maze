export const dfs = async ({maze, start, goal, width, height, update}) => {
    const toI = (x, y) => x + y * width;
    const toXY = i => {
        const x = i % width,
              y = i / width | 0;
        return [x, y];
    };
    const done = [...Array(width * height).fill(false)]; // 既に通った
    const getAbled = i => {
        const [_x, _y] = toXY(i);
        return [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ].flatMap(([a, b]) => {
            const [x, y] = [_x + a, _y + b];
            if(x < 0 || x >= width || y < 0 || y >= height) return [];
            const _i = toI(x, y);
            return maze[_i] || done[_i] || stack.includes(_i) ? [] : [_i];
        });
    };
    const result = [],
          stack = [toI(...start)],
          _goal = toI(...goal);
    while(stack.length) {
        const _i = stack.pop();
        await update(_i);
        if(_i === _goal) break;
        done[_i] = true;
        const abled = getAbled(_i);
        if(abled.length) {
            stack.push(...abled);
            result.push(_i);
        }
        else {
            stack.pop();
            result.pop();
        }
    }
    if(stack.length) result.push(_goal);
    else throw 'Not found.';
    return result;
};
