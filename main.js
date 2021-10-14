(async () => {
    const {importAll, getScript, importAllSettled} = await import(`https://rpgen3.github.io/mylib/export/import.mjs`);
    await getScript('https://code.jquery.com/jquery-3.3.1.min.js');
    const $ = window.$;
    const html = $('body').empty().css({
        'text-align': 'center',
        padding: '1em',
        'user-select': 'none'
    });
    const head = $('<div>').appendTo(html),
          body = $('<div>').appendTo(html).hide(),
          foot = $('<div>').appendTo(html).hide();
    const rpgen3 = await importAll([
        'input',
        'util'
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
        g_unit = (w > 300 ? Math.max(300, w * 0.5) : w) / inputW | 0;
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
    const hCv = $('<div>').appendTo(foot).css({
        position: 'relative',
        display: 'inline-block'
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
        }
        clear(){
            const {width, height} = this.ctx.canvas;
            this.ctx.clearRect(0, 0, width, height);
            return this;
        }
    }
    const cvMaze = new Canvas('rgba(0, 0, 255, 1)'),
          cvUsed = new Canvas('rgba(0, 127, 127, 0.5)'),
          cvRoad = new Canvas('rgba(0, 255, 0, 0.5)'),
          cvStart = new Canvas('rgba(255, 0, 0, 0.5)'),
          cvGoal = new Canvas('rgba(127, 0, 127, 0.5)'),
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
    cvScale.cv.bind('contextmenu', () => false).on('mousedown mousemove touchstart touchmove', ({offsetX, offsetY, buttons, which}) => {
        if(!which) return;
        const [x, y] = [offsetX, offsetY].map(v => v / g_unit | 0),
              erase = buttons === 2 || eraseFlag();
        if(log.unchanged(x, y, erase)) return;
        switch(inputType()){
            case 0:
                cvMaze.draw(x, y, erase);
                g_maze[x * y] = !erase;
                break;
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
        value: 20
    });
    let g_status = -1;
    const makeMaze = async func => {
        const _ = performance.now();
        msg(`start ${rpgen3.getTime()}`);
        const status = ++g_status;
        cvMaze.clear();
        clearMaze();
        await func({
            width: g_w,
            height: g_h,
            update: async (i, v = true) => {
                if(g_status !== status) throw 'break';
                g_maze[i] = v;
                cvMaze.draw(...toXY(i), !v);
                await sleep(inputDelay());
            },
            updateAll: async maze => {
                for(const [i, v] of maze.entries()) {
                    g_maze[i] = v;
                    cvMaze.draw(...toXY(i), !v);
                }
                await sleep(inputDelay());
            }
        });
        msg(`finish ${performance.now() - _ | 0}ms`);
    };
    $('<div>').appendTo(body).text('迷路生成');
    addBtn(body, '棒倒し法', () => {
        makeMaze(rpgen4.fallStick);
    });
    addBtn(body, '壁伸ばし法', () => {
        makeMaze(rpgen4.extendWall);
    });
    addBtn(body, '穴掘り法', () => {
        makeMaze(rpgen4.dig);
    });
    const search = async func => {
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
                await sleep(inputDelay());
            }
        });
        for(const i of result) {
            if(g_status !== status) throw 'break';
            cvRoad.draw(...toXY(i));
            await sleep(inputDelay());
        }
        msg(`finish ${performance.now() - _}ms`);
    };
    $('<div>').appendTo(body).text('しらみつぶし探索');
    addBtn(body, '深さ優先探索', () => {
        search(rpgen5.dfs);
    });
    addBtn(body, '幅優先探索', () => {
        search(rpgen5.bfs);
    });
    addBtn(body, 'ダイクストラ法', () => {
        search(rpgen5.dijkstra);
    });
    $('<div>').appendTo(body).text('ヒューリスティック探索');
    addBtn(body, '最良優先探索', () => {
        search(rpgen5.bestFirst);
    });
    addBtn(body, 'A*アルゴリズム', () => {
        search(rpgen5.aStar);
    });
    const rpgen4 = await importAllSettled([
        'fallStick',
        'extendWall',
        'dig'
    ].map(v => `https://rpgen3.github.io/maze/mjs/makeMaze/${v}.mjs`));
    const rpgen5 = await importAllSettled([
        'dfs',
        'bfs',
        'dijkstra',
        'bestFirst',
        'aStar'
    ].map(v => `https://rpgen3.github.io/maze/mjs/search/${v}.mjs`));
})();
