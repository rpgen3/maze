import {randInt, randArr} from 'https://rpgen3.github.io/mylib/export/random.mjs';
const rand = arr => arr[Math.random() * arr.length | 0];
export const dig = async ({width, height, update, updateAll, start = [1, 1]}) => {
    const toI = (x, y) => x + y * width;
    const toXY = i => {
        const x = i % width,
              y = i / width | 0;
        return [x, y];
    };
    const maze = [...Array(width * height).fill(true)];
    const put = async i => {
        maze[i] = false;
        await update(i, false);
    };
    { // 上下の外周を通路に
        const a = width * (height - 1);
        for(let i = 0; i < width; i++) maze[i] = maze[i + a] = false;
    }
    { // 左右の外周を通路に
        const a = width - 1;
        for(let i = 0; i < height; i++) {
            const b = i * width;
            maze[b] = maze[b + a] = false;
        }
    }
    await updateAll(maze);
    // x, yともに奇数となる座標を穴掘り開始座標にする
    for(const [i, v] of start.entries()) if(v % 2 === 0) start[i]++;
    const road = [start]; // 既に2000年前に通過した道
    let unpaved = (width - 1) * (height - 1) / 4 - 1; // 未開の地
    const main = async () => {
        if(!unpaved) { // すべての処理の終わり
            { // 上下の外周を壁に
                const a = width * (height - 1);
                for(let i = 0; i < width; i++) maze[i] = maze[i + a] = true;
            }
            { // 左右の外周を壁に
                const a = width - 1;
                for(let i = 0; i < height; i++) {
                    const b = i * width;
                    maze[b] = maze[b + a] = true;
                }
            }
            await updateAll(maze);
            return maze;
        }
        const idx = randInt(0, road.length - 1),
              xy = toXY(road[idx]);
        road.splice(idx, 1);
        return extend(xy);
    };
    const now = []; // 現在拡張中の壁
    const extend = async ([x, y]) => { // 壁延ばし本処理
        const _i = toI(x, y);
        now.push(_i);
        await put(_i);
        const nexts = [
            [2, 0],
            [-2, 0],
            [0, 2],
            [0, -2]
        ].map(([_x, _y]) => [_x + x, _y + y]).filter(([x, y]) => (x >= 0 && x < width) && (y >= 0 && y < height) && maze[toI(x, y)]);
        if(!nexts.length) return main(); // 四方がすべて現在拡張中の通路の場合
        else {
            if(nexts.length > 1) road.push(toI(x, y));
            const next = randArr(nexts);
            await put(toI(...[x, y].map((v, i) => v + (next[i] - v >> 1)))); // 奇数マス
            unpaved--;
            return extend(next);
        }
    }
    return main();
};
