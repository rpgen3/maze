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
