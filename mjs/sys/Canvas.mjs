import {Observe} from 'https://rpgen3.github.io/maze/mjs/sys/Observe.mjs';
let holder = null,
    unit = 1;
export class Canvas {
    constructor(color){
        this.color = color;
        this.cv = $('<canvas>').appendTo(holder);
        if(holder.find('canvas').length > 1) this.cv.css({
            position: 'absolute',
            left: 0,
            top: 0
        });
        this.ctx = this.cv.get(0).getContext('2d');
    }
    draw(x, y, isErase){
        this.ctx.fillStyle = this.color;
        this.ctx[isErase ? 'clearRect' : 'fillRect'](...[x, y, 1, 1].map(v => v * unit));
        return this;
    }
    clear(){
        const {width, height} = this.ctx.canvas;
        this.ctx.clearRect(0, 0, width, height);
        return this;
    }
    static setHolder(elm){
        holder = elm;
        return this;
    }
    static setUnit(n){
        unit = n;
        return this;
    }
}
export const drawScale = cv => {
    const {width, height} = this.ctx.canvas,
          max = Math.max(width, height),
          [w, h] = [width, height].map(v => v * unit),
          {ctx, color} = cv;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.translate(0.5, 0.5);
    ctx.beginPath();
    for(let i = -1; i <= max; i++) {
        const _ = i * unit;
        if(i <= w) ctx.moveTo(_, 0), ctx.lineTo(_, h);
        if(i <= h) ctx.moveTo(0, _), ctx.lineTo(w, _);
    }
    ctx.stroke();
};
export const onDraw = (cv, callback, isErase = () => false) => cv.cv
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
          ].map(v => v / unit | 0),
          erase = buttons === 2 || isErase();
    if(obs.changed(x, y, erase)) callback(x, y, buttons === 2);
});
const obs = new Observe(3);
