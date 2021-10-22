export const lerp = (x, y, _x, _y) => {
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
