import {randInt, randArr} from 'https://rpgen3.github.io/mylib/export/random.mjs';
const rand = arr => arr[Math.random() * arr.length | 0];
export const extendWall = async ({width, height, callback}) => {
    const toI = (x, y) => x + y * width;
    const toXY = i => {
        const x = i % width,
              y = i / width | 0;
        return [x, y];
    };
    const maze = [...Array(width * height).fiil(false)];
    const put = async i => {
        maze[i] = true;
        await callback(i);
    };
    { // 上下の外周を壁に
        const a = width * (height - 1);
        for(let i = 0; i < width; i++) {
            await put(i);
            await put(i + a);
        }
    }
    { // 左右の外周を壁に
        const a = width - 1;
        for(let i = 0; i < height; i++) {
            const b = i * width;
            await put(b);
            await put(b + a);
        }
    }
    // x, yともに偶数となる座標を壁伸ばし開始座標(候補)としてリストアップ
    const unused = [];
    {
        const [w, h] = [width, height].map(v => (v >> 1) - 1);
        for(let i = 0; i < h; i++) {
            for(let j = 0; j < w; j++) {
                unused.push([j, i].map(v => v + 1 << 1));
            }
        }
    }
    const stack = [];
    const main = async () => {
        if(!unused.length) return maze; // すべての処理の終わり
        const idx = randInt(0, unused.length - 1),
              xy = unused[idx];
        unused.splice(idx, 1);
        if(!maze[toI(...xy)]){ // 通路の場合のみ
            while(stack.length) stack.pop();
            return extend(xy);
        }
        else return main();
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
        ].map(([_x, _y]) => [_x + x, _y + y]).filter(([x, y]) => !now.includes(toI(x, y)));
        if(!nexts.length) return extend(stack.pop()); // 四方がすべて現在拡張中の壁の場合
        else {
            const next = randArr(nexts);
            await put(...[x, y].map((v, i) => v + (next[i] - v) >> 1), -1); // 奇数マス
            {
                if(maze[toI(...next)]) { // 壁の場合
                    while(now.length) now.pop();
                    return main();
                }
            }
            // 通路の場合
            stack.push([x, y]);
            return extend(next);
        }
    }
    return main();
};
