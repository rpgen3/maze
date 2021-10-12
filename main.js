(async () => {
    const {importAll, getScript} = await import(`https://rpgen3.github.io/mylib/export/import.mjs`);
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
        'input'
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
    const dialog = async str => {
        msg(str);
        await sleep(30);
    };
    const [inputW, inputH] = ['幅', '高さ'].map(label => rpgen3.addInputNum(head,{
        label, save: true,
        step: 2,
        max: 299,
        min: 5,
        value: 49
    }));
    let g_mass = [],
        unit = 0;
    addBtn(head, '初期化', () => {
        const [w, h] = [inputW(), inputH()];
        g_mass = [...Array(w * h).fill(false)];
        unit = $(window).width() / inputW | 0;
        hCv.find('canvas').prop({
            width: w * unit,
            height: h * unit
        });
        drawScale(w, h);
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
            this.ctx[isErase ? 'clearRect' : 'fillRect'](...[x, y, 1, 1].map(v => v * unit));
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
              [_w, _h] = [w, h].map(v => v * unit),
              {ctx, color} = cvScale;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i = -1; i <= max; i++) {
            const _ = i * unit;
            if(i <= w) ctx.moveTo(_, 0), ctx.lineTo(_, _h);
            if(i <= h) ctx.moveTo(0, _), ctx.lineTo(_w, _);
        }
        ctx.stroke();
    };
    cvScale.cv.bind('contextmenu', () => false).on('mousedown mousemove touchstart touchmove', ({offsetX, offsetY, buttons, which}) => {
        if(!which || log.unchanged({offsetX, offsetY, buttons})) return;
        const [x, y] = [offsetX, offsetY].map(v => v / unit | 0),
              erase = buttons === 2 || eraseFlag();
        switch(inputType()){
            case 0:
                cvMaze.draw(x, y, erase);
                g_mass[x * y] = !erase;
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
        constructor(...keys){
            this.keys = keys;
            this.values = new Map;
        }
        unchanged(obj){
            const {keys, values} = this;
            let flag = true;
            for(const k of keys) {
                const v = obj[k];
                if(v === values.get(k)) continue;
                values.set(k, v);
                if(flag) flag = false;
            }
            return flag;
        }
    }('offsetX', 'offsetY', 'buttons');
    const inputDelay = rpgen3.addInputNumber(body, {
        label: '表示の遅延時間[ms]',
        save: true,
        max: 1000,
        value: 300
    });
    $('<div>').appendTo(body).text('迷路生成');
    addBtn(body, '棒倒し法', () => {
    });
    addBtn(body, '壁伸ばし法', () => {
    });
    addBtn(body, '穴掘り法', () => {
    });
    $('<div>').appendTo(body).text('しらみつぶしの探索');
    addBtn(body, '深さ優先探索', () => {
    });
    addBtn(body, '幅優先探索', () => {
    });
    $('<div>').appendTo(body).text('最適経路の探索');
    addBtn(body, '最適探索（ダイクストラ法）', () => {
    });
    addBtn(body, '最良優先探索', () => {
    });
    addBtn(body, 'A*アルゴリズム', () => {
    });
})();
