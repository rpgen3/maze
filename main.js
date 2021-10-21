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
    let g_maze = [],
        g_w = -1,
        g_h = -1,
        g_unit = -1;
    const toI = (x, y) => x + y * g_w;
    const toXY = i => {
        const x = i % g_w,
              y = i / g_w | 0;
        return [x, y];
    };
    const clearMaze = () => {
        for(const i of g_maze.keys()) g_maze[i] = false;
    };
    addBtn(head, '初期化', () => {
        g_status++;
        [g_w, g_h] = [inputW(), inputH()];
        g_maze = [...Array(g_w * g_h).fill(false)];
        const w = $(window).width();
        g_unit = -1;
        const divide = 0.9 / inputW;
        if(w > 500) g_unit = Math.max(500, w * 0.5) * divide | 0;
        if(g_unit < 5) g_unit = w * divide | 0;
        hCv.find('canvas').prop({
            width: g_w * g_unit,
            height: g_h * g_unit
        });
        drawScale(g_w, g_h);
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
        const maze = [...Array(g_w * g_h).fill(false)],
              [w, h] = [g_w, g_h].map(v => (v >> 1) + 1);
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
            cvMaze.draw(_x, _y, erase);
            g_maze[_x + _y * g_w] = !erase;
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
    const hCv = $('<div>').appendTo(foot).css({
        position: 'relative',
        display: 'inline-block'
    });
    addBtn(foot, '画像として保存', () => {
        const cv = $('<canvas>').prop({
            width: g_w * g_unit,
            height: g_h * g_unit
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
    class Canvas {
        constructor(color){
            this.color = color;
            this.cv = $('<canvas>').appendTo(hCv);
            if(hCv.find('canvas').length > 1) this.cv.css({
                position: 'absolute',
                left: 0,
                top: 0
            });
            this.ctx = this.cv.get(0).getContext('2d');
        }
        draw(x, y, isErase){
            this.ctx.fillStyle = this.color;
            this.ctx[isErase ? 'clearRect' : 'fillRect'](...[x, y, 1, 1].map(v => v * g_unit));
            return this;
        }
        clear(){
            const {width, height} = this.ctx.canvas;
            this.ctx.clearRect(0, 0, width, height);
            return this;
        }
    }
    const cvMaze = new Canvas('rgba(127, 127, 127, 1)'),
          cvUsed = new Canvas('rgba(0, 127, 127, 0.4)'),
          cvRoad = new Canvas('rgba(255, 0, 0, 0.4)'),
          cvStart = new Canvas('rgba(255, 127, 0, 0.8)'),
          cvGoal = new Canvas('rgba(127, 0, 255, 0.8)'),
          cvScale = new Canvas('rgba(0, 0, 0, 0.5)');
    const xyStart = [-1, -1],
          xyGoal = [-1, -1];
    const drawScale = (w, h) => {
        const max = Math.max(w, h),
              [_w, _h] = [w, h].map(v => v * g_unit),
              {ctx, color} = cvScale;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i = -1; i <= max; i++) {
            const _ = i * g_unit;
            if(i <= w) ctx.moveTo(_, 0), ctx.lineTo(_, _h);
            if(i <= h) ctx.moveTo(0, _), ctx.lineTo(_w, _);
        }
        ctx.stroke();
    };
    const lerp = (x, y, _x, _y) => {
        const a = _x - x,
              b = _y - y,
              len = Math.max(...[a, b].map(Math.abs)),
              _a = a / len,
              _b = b / len;
        return [...new Array(len).keys()].map(i => [
            i * _a + x,
            i * _b + y
        ].map(Math.round));
    };
    const xyLast = [-1, -1],
          deltaTime = 100;
    let lastTime = -1;
    cvScale.cv.bind('contextmenu', () => false)
        .on('mousedown mousemove touchstart touchmove', e => {
        e.preventDefault();
        const {clientX, clientY, buttons, which, type, originalEvent} = e;
        let _x = clientX,
            _y = clientY;
        if(type.includes('touch')){
            const {clientX, clientY} = originalEvent.touches[0];
            _x = clientX;
            _y = clientY;
        }
        else if(!which) return;
        const {left, top} = originalEvent.target.getBoundingClientRect(),
              [x, y] = [
                  _x - left,
                  _y - top
              ].map(v => v / g_unit | 0),
              erase = buttons === 2 || eraseFlag();
        if(log.unchanged(x, y, erase)) return;
        switch(inputType()){
            case 0: {
                const now = performance.now();
                for(const [_x, _y] of now - lastTime > deltaTime ? [[x, y]] : lerp(x, y, ...xyLast)) {
                    cvMaze.draw(_x, _y, erase);
                    g_maze[toI(_x, _y)] = !erase;
                }
                xyLast[0] = x;
                xyLast[1] = y;
                lastTime = now;
                break;
            }
            case 1:
                cvStart.clear().draw(x, y, erase);
                if(erase) xyStart[0] = xyStart[1] = -1;
                else {
                    xyStart[0] = x;
                    xyStart[1] = y;
                }
                break;
            case 2:
                cvGoal.clear().draw(x, y, erase);
                if(erase) xyGoal[0] = xyGoal[1] = -1;
                else {
                    xyGoal[0] = x;
                    xyGoal[1] = y;
                }
                break;
        }
    });
    const log = new class {
        constructor(num){
            this.arr = [...Array(num)];
        }
        unchanged(...arg){
            let flag = true;
            for(const [i, v] of this.arr.entries()) {
                if(v === arg[i]) continue;
                this.arr[i] = v;
                if(flag) flag = false;
            }
            return flag;
        }
    }(3);
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
    const makeMaze = async func => {
        const _ = performance.now();
        msg(`start ${rpgen3.getTime()}`);
        const status = ++g_status;
        cvUsed.clear();
        cvRoad.clear();
        cvMaze.clear();
        clearMaze();
        await func({
            width: g_w,
            height: g_h,
            update: async (i, v = true) => {
                if(g_status !== status) throw 'break';
                g_maze[i] = v;
                cvMaze.draw(...toXY(i), !v);
                await wait();
            },
            updateAll: async maze => {
                for(const [i, v] of maze.entries()) {
                    g_maze[i] = v;
                    cvMaze.draw(...toXY(i), !v);
                }
                await wait();
            }
        });
        msg(`finish ${performance.now() - _ | 0}ms`);
    };
    $('<div>').appendTo(body).text('迷路生成');
    addBtn(body, '棒倒し法', () => {
        makeMaze(rpgen4.fellDown);
    });
    addBtn(body, '壁延ばし法', () => {
        makeMaze(rpgen4.extendWall);
    });
    addBtn(body, '穴掘り法', () => {
        makeMaze(rpgen4.dig);
    });
    const search = async (func, weight = [1, 1], giveup = false) => {
        const _ = performance.now();
        msg(`start ${rpgen3.getTime()}`);
        const status = ++g_status;
        cvUsed.clear();
        cvRoad.clear();
        const result = await func({
            maze: g_maze.slice(),
            start: xyStart.slice(),
            goal: xyGoal.slice(),
            width: g_w,
            height: g_h,
            update: async i => {
                if(g_status !== status) throw 'break';
                cvUsed.draw(...toXY(i));
                await wait();
            },
            heuristic: selectHeuristic(),
            weight, giveup
        });
        for(const i of result) {
            if(g_status !== status) throw 'break';
            cvRoad.draw(...toXY(i));
            await wait();
        }
        msg(`finish ${performance.now() - _ | 0}ms`);
    };
    $('<div>').appendTo(body).text('経路探索');
    addBtn(body, '深さ優先探索(DFS)', () => {
        search(rpgen5.dfs);
    });
    addBtn(body, '幅優先探索(BFS)', () => {
        search(rpgen5.bfs);
    });
    addBtn(body, '最良優先探索', () => {
        search(rpgen5.aStar, [0, 1]);
    });
    addBtn(body, 'A*探索', () => {
        search(rpgen5.aStar);
    });
    addBtn(body, '最良優先探索 + A*探索', async () => {
        let status = g_status + 1;
        try {
            await search(rpgen5.aStar, [0, 1], true);
        }
        catch {
            if(status === g_status) await search(rpgen5.aStar);
        }
    });
    addBtn(body, 'A探索', () => {
        search(rpgen5.aStar, aInputs.map(v => v()), isGiveup());
    });
    const aConfig = rpgen3.addInputBool(body, {
        label: 'A探索の設定'
    });
    aConfig.elm.on('change', () => aConfig() ? aH.show() : aH.hide());
    const aH = $('<div>').appendTo(body).hide();
    const aInputs = [
        '現時点までの距離G',
        'ゴールまでの推定値H'
    ].map(label => rpgen3.addInputNum(aH, {
        label,
        value: 1,
        step: 0.1,
        min: 0,
        max: 2
    }));
    const isGiveup = rpgen3.addInputBool(aH, {
        label: '行き詰ったとき探索を諦める'
    });
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
