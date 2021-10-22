import {Observe} from 'https://rpgen3.github.io/maze/mjs/sys/Observe.mjs';
let g_elm = null,
    g_unit = -1,
    g_w = -1,
    g_h = -1;
export class LayeredCanvas {
    constructor(color){
        this.color = color;
        this.cv = $('<canvas>').appendTo(g_elm).css({
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
    onDraw(callback, isErase){
        onDraw(this, callback, isErase);
    }
    drawScale(){
        drawScale(this);
    }
    static init(elm){
        g_elm = elm.css({
            position: 'relative',
            display: 'inline-block'
        }).empty().append($('<canvas>'));
        return this;
    }
    static update(unit, w, h){
        g_elm.find('canvas').prop({
            width: w * unit + 1,
            height: h * unit + 1
        });
        g_unit = unit;
        g_w = w;
        g_h = h;
        return this;
    }
}
const onDraw = (cv, callback, isErase = () => false) => cv.cv
.bind('contextmenu', () => false)
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
          erase = buttons === 2 || isErase();
    if(obs.changed(x, y, erase)) callback(x, y, erase);
});
const obs = new Observe(3);
const drawScale = cv => {
    const max = Math.max(g_w, g_h),
          [w, h] = [g_w, g_h].map(v => v * g_unit),
          {ctx, color} = cv;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.translate(0.5, 0.5);
    ctx.beginPath();
    for(let i = -1; i <= max; i++) {
        const _ = i * g_unit;
        if(i <= w) ctx.moveTo(_, 0), ctx.lineTo(_, h);
        if(i <= h) ctx.moveTo(0, _), ctx.lineTo(w, _);
    }
    ctx.stroke();
};
