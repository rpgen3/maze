import {randArr} from 'https://rpgen3.github.io/mylib/export/random.mjs';
export const fallStick = async ({width, height, callback}) => {
    const toI = (x, y) => x + y * width;
    const toXY = i => {
        const x = i % width,
              y = i / width | 0;
        return [x, y];
    };
    const maze = [...Array(width * height).fill(false)];
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
    const arr = [];
    { // 基準となる壁の設置
        const [w, h] = [width, height].map(v => (v >> 1) - 1);
        for(let i = 0; i < h; i++) {
            for(let j = 0; j < w; j++) {
                const xy = [j, i].map(v => v + 1 << 1);
                arr.push(xy);
                await put(toI(...xy));
            }
        }
    }
    // ランダムな方向に倒す(1行目以外は上方向を禁止，既に壁がある方向は禁止)
    for(const xy of arr) {
        const [x, y] = xy,
              a = [[1, 0], [0, 1]];
        if(y === 2) a.push([0, -1]);
        if(!maze[toI(x - 1, y)]) a.push([-1, 0]);
        await put(toI(...randArr(a).map((v, i) => v + xy[i])));
    }
    return maze;
};
