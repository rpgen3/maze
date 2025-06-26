(async () => {
    const {importAll, getScript, importAllSettled} = await import(`https://rpgen3.github.io/mylib/export/import.mjs`);
    await getScript('https://code.jquery.com/jquery-3.3.1.min.js');
    const $ = window.$;
    const html = $('body').empty().css({
        'text-align': 'center',
        padding: '1em',
        'user-select': 'none'
    });
    const head = $('<dl>').appendTo(html),
          body = $('<dl>').appendTo(html).hide(),
          foot = $('<dl>').appendTo(html).hide();
    const rpgen3 = await importAll([
        'input',
        'util',
        'random'
    ].map(v => `https://rpgen3.github.io/mylib/export/${v}.mjs`));
    const {LayeredCanvas, lerp} = await importAll([
        'LayeredCanvas',
        'lerp'
    ].map(v => `https://rpgen3.github.io/maze/mjs/sys/${v}.mjs`));
    $('<div>').appendTo(head).text('経路探索');
    const addBtn = (h, ttl, func) => $('<button>').appendTo(h).text(ttl).on('click', func);
    const msg = (() => {
        const elm = $('<div>').appendTo(body);
        return (str, isError) => $('<span>').appendTo(elm.empty()).text(str).css({
            color: isError ? 'red' : 'blue',
            backgroundColor: isError ? 'pink' : 'lightblue'
        });
    })();
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const [inputW, inputH] = ['幅', '高さ'].map(label => rpgen3.addInputNum(head,{
        label, save: true,
        step: 2,
        max: 299,
        min: 5,
        value: 25
    }));
    let g_maze = [];
    const {toI, toXY} = LayeredCanvas;
    addBtn(head, '初期化', () => {
        g_status++;
        const [width, height] = [inputW(), inputH()];
        g_maze = [...Array(width * height).fill(false)];
        const w = $(window).width();
        let unit = -1;
        const divide = 0.9 / width;
        if(w > 500) unit = Math.max(500, w * 0.5) * divide | 0;
        if(unit < 5) unit = w * divide | 0;
        LayeredCanvas.resize({width, height, unit});
        cvScale.drawScale();
        body.add(foot).show();
    });
    const inputType = rpgen3.addSelect(foot, {
        label: 'パレット',
        list: {
            '迷路': 0,
            'スタート': 1,
            'ゴール': 2
        }
    });
    const eraseFlag = rpgen3.addInputBool(foot, {
        label: '消しゴム'
    });
    const hideScale = rpgen3.addInputBool(foot, {
        label: '目盛りを非表示'
    });
    hideScale.elm.on('change', () => cvScale.cv.css('opacity', Number(!hideScale())));
    const hMacro = $('<div>').appendTo(foot);
    addBtn(hMacro, '拡大', () => {
        const {width, height} = LayeredCanvas,
              maze = [...Array(width * height).fill(false)],
              [w, h] = [width, height].map(v => (v >> 1) + 1);
        cvMaze.clear();
        for(let y = 0; y < h; y++) {
            for(let x = 0; x < w; x++) {
                const i = toI(x, y),
                      v = g_maze[i];
                if(!v) continue;
                const way = [[0,0]],
                      a = x < w - 1,
                      b = y < h - 1;
                if(a) way.push([1, 0]);
                if(b) way.push([0, 1]);
                if(a && b) way.push([1, 1]);
                const [x2, y2] = [x, y].map(v => v << 1);
                for(const [a, b] of way) {
                    const [x, y] = [x2 + a, y2 + b];
                    maze[toI(x, y)] = v;
                    cvMaze.draw(x, y);
                }
            }
        }
        for(const [i, v] of maze.entries()) g_maze[i] = v;
    });
    addBtn(hMacro, '線を引く', () => {
        const erase = eraseFlag();
        for(const [_x, _y] of lerp(...new Array(2).fill().flatMap(() => toXY(rpgen3.randInt(0, g_maze.length - 1))))) {
            if(erase) cvMaze.erase(_x, _y);
            else cvMaze.draw(_x, _y);
            g_maze[toI(_x, _y)] = !erase;
        }
    });
    addBtn(hMacro, 'ランダム座標', () => {
        const list = g_maze.flatMap((v, i) => v ? [] : [i]);
        for(const v of [xyStart, xyGoal]) {
            const idx = rpgen3.randInt(0, list.length - 1),
                  _i = list[idx];
            list.splice(idx, 1);
            [v[0], v[1]] = toXY(_i);
        }
        cvStart.clear().draw(...xyStart);
        cvGoal.clear().draw(...xyGoal);
    });
    LayeredCanvas.init($('<div>').appendTo(foot));
    addBtn($('<div>').appendTo(foot), '画像として保存', () => {
        const {width, height} = cvScale.ctx.canvas,
              sub = hideScale() ? 1 : 0,
              cv = $('<canvas>').prop({
                  width: width - sub,
                  height: height - sub
              }),
              ctx = cv.get(0).getContext('2d');
        for(const {cv} of [
            cvMaze,
            cvUsed,
            cvRoad,
            cvStart,
            cvGoal,
            hideScale() ? [] : cvScale
        ].flat()) ctx.drawImage(cv.get(0), 0, 0);
        $('<a>').attr({
            href: cv.get(0).toDataURL(),
            download: 'maze.png'
        }).get(0).click();
    });
    addBtn($('<div>').appendTo(foot), '文字列として保存', () => {
        const width = inputW();
        let arr = [];
        for (let i = 0; i < g_maze.length; i += width) {
            arr.push(g_maze.slice(i, i + width).map(v => v ? 1 : 0).join(''));
        }
        prompt('出力', arr.join('\n'));
    });
    const cvMaze = new LayeredCanvas('rgba(127, 127, 127, 1)'),
          cvUsed = new LayeredCanvas('rgba(0, 127, 127, 0.4)'),
          cvRoad = new LayeredCanvas('rgba(255, 0, 0, 0.4)'),
          cvStart = new LayeredCanvas('rgba(255, 127, 0, 0.8)'),
          cvGoal = new LayeredCanvas('rgba(127, 0, 255, 0.8)'),
          cvScale = new LayeredCanvas('rgba(0, 0, 0, 1)');
    const xyStart = [-1, -1],
          xyGoal = [-1, -1];
    {
        const xyLast = [-1, -1],
              deltaTime = 100;
        let lastTime = -1;
        cvScale.onDraw((x, y, erase) => {
            switch(inputType()){
                case 0: {
                    const now = performance.now();
                    for(const [_x, _y] of now - lastTime > deltaTime ? [[x, y]] : lerp(x, y, ...xyLast)) {
                        if(erase) cvMaze.erase(_x, _y);
                        else cvMaze.draw(_x, _y);
                        g_maze[toI(_x, _y)] = !erase;
                    }
                    xyLast[0] = x;
                    xyLast[1] = y;
                    lastTime = now;
                    break;
                }
                case 1:
                    cvStart.clear();
                    if(erase) {
                        cvStart.erase(x, y);
                        xyStart[0] = xyStart[1] = -1;
                    }
                    else {
                        cvStart.draw(x, y);
                        xyStart[0] = x;
                        xyStart[1] = y;
                    }
                    break;
                case 2:
                    cvGoal.clear();
                    if(erase) {
                        cvGoal.erase(x, y);
                        xyGoal[0] = xyGoal[1] = -1;
                    }
                    else {
                        cvGoal.draw(x, y);
                        xyGoal[0] = x;
                        xyGoal[1] = y;
                    }
                    break;
            }
        }, () => eraseFlag());
    }
    const inputDelay = rpgen3.addInputNum(body, {
        label: '表示の遅延時間[ms]',
        save: true,
        max: 100,
        min: 0,
        value: 20
    });
    const wait = () => {
        const d = inputDelay();
        if(d) return sleep(d);
    };
    let g_status = -1;
    const makeMaze = async (name, func) => {
        msg(`start ${name}`);
        const status = ++g_status;
        cvUsed.clear();
        cvRoad.clear();
        cvMaze.clear();
        for(const i of g_maze.keys()) g_maze[i] = false;
        const {width, height} = LayeredCanvas;
        await func({
            width, height,
            update: async (i, v = true) => {
                if(g_status !== status) throw 'break';
                g_maze[i] = v;
                const [x, y] = toXY(i);
                if(v) cvMaze.draw(x, y);
                else cvMaze.erase(x, y);
                await wait();
            },
            updateAll: async maze => {
                for(const [i, v] of maze.entries()) {
                    g_maze[i] = v;
                    const [x, y] = toXY(i);
                    if(v) cvMaze.draw(x, y);
                    else cvMaze.erase(x, y);
                }
                await wait();
            }
        });
        msg(`finish ${name}`);
    };
    $('<div>').appendTo(body).text('迷路生成');
    const add = (name, func) => addBtn(body, name, () => func(name));
    add('棒倒し法', name => {
        makeMaze(name, rpgen4.fellDown);
    });
    add('壁延ばし法', name => {
        makeMaze(name, rpgen4.extendWall);
    });
    add('穴掘り法', name => {
        makeMaze(name, rpgen4.dig);
    });
    const search = async (name, func, dfs = false, giveup = false) => {
        msg(`start ${name}`);
        const status = ++g_status;
        cvUsed.clear();
        cvRoad.clear();
        let count = 0;
        const {width, height} = LayeredCanvas;
        const result = await func({
            maze: g_maze.slice(),
            start: xyStart.slice(),
            goal: xyGoal.slice(),
            update: async i => {
                if(g_status !== status) throw 'break';
                cvUsed.draw(...toXY(i));
                await wait();
                count++;
            },
            heuristic: selectHeuristic(),
            width, height, dfs, giveup
        });
        for(const i of result) {
            if(g_status !== status) throw 'break';
            cvRoad.draw(...toXY(i));
            await wait();
        }
        msg(`finish ${name} 走査数:${count}/${g_maze.length} 最短距離:${result.length}`);
    };
    $('<div>').appendTo(body).text('経路探索');
    add('深さ優先探索(DFS)', name => {
        search(name, rpgen5.dfs);
    });
    add('幅優先探索(BFS)', name => {
        search(name, rpgen5.bfs);
    });
    add('A*探索', name => {
        search(name, rpgen5.aStar);
    });
    add('弱いA探索 + A*探索', async name => {
        let status = g_status + 1;
        try {
            await search(name, rpgen5.aStar, true, true);
        }
        catch {
            if(status === g_status) await search(name, rpgen5.aStar);
        }
    });
    add('カスタムA探索', name => {
        search(name, rpgen5.aStar, ...aInputs.map(v => v()));
    });
    const aConfig = rpgen3.addInputBool(body, {
        label: 'カスタムA探索の設定'
    });
    aConfig.elm.on('change', () => aConfig() ? aH.show() : aH.hide());
    const aH = $('<div>').appendTo(body).hide();
    const aInputs = [
        'tie-breakをgCostが高い順にする（DFSっぽく）',
        '最小のhCostが無くなれば探索を断念する（弱い探索）'
    ].map(label => rpgen3.addInputBool(aH, {
        label,
        save: true
    }));
    const selectHeuristic = (() => {
        const calcMinkowski = (x, y, _x, _y) => (Math.abs(_x - x) ** p + Math.abs(_y - y) ** p) ** (1 / p);
        const f = rpgen3.addSelect(body, {
            label: 'ヒューリスティック関数',
            save: true,
            list: {
                'マンハッタン距離': (x, y, _x, _y) => Math.abs(_x - x) + Math.abs(_y - y),
                'ユークリッド距離': (x, y, _x, _y) => Math.sqrt((_x - x) ** 2 + (_y - y) ** 2),
                'チェビシェフ距離': (x, y, _x, _y) => Math.max(_x - x, _y - y),
                'ミンコフスキー距離': calcMinkowski
            }
        });
        const h = $('<div>').appendTo(body).empty();
        f.elm.on('change', () => f() === calcMinkowski ? h.show() : h.hide()).trigger('change');
        const p = rpgen3.addInputNum(h, {
            label: 'P',
            save: true,
            min: -3,
            max: 3,
            step: 0.1,
            value: -1
        });
        return f;
    })();
    const rpgen4 = await importAllSettled([
        'fellDown',
        'extendWall',
        'dig'
    ].map(v => `https://rpgen3.github.io/maze/mjs/makeMaze/${v}.mjs`));
    const rpgen5 = await importAllSettled([
        'dfs',
        'bfs',
        'aStar'
    ].map(v => `https://rpgen3.github.io/maze/mjs/search/${v}.mjs`));
})();
