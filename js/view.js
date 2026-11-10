import * as Config from "./config.js"

export const View = (() => {
    const BAR_COLOR = "#1a1a1a";
    let _scale = 1;
    let _offsetX = 0;
    let _offsetY = 0;

    function resize(loop) {
        const width = loop.canvas.width
        const height = loop.canvas.height
        const ctx = loop.ctx
        _scale = Math.min(width / Config.WORLD_WIDTH, height / Config.WORLD_HEIGHT);
        _offsetX = Math.floor((width - Config.WORLD_WIDTH * _scale) / 2);
        _offsetY = Math.floor((height - Config.WORLD_HEIGHT * _scale) / 2);
    }

    function begin(loop) {
        const ctx = loop.ctx
        ctx.save();
        ctx.translate(_offsetX, _offsetY);
        ctx.scale(_scale, _scale);
        ctx.fillStyle = "#ffffff"
        ctx.beginPath();
        ctx.rect(0, 0, Config.WORLD_WIDTH, Config.WORLD_HEIGHT);
        ctx.fill();
    }

    function end(loop) {
        const width = loop.canvas.width
        const height = loop.canvas.height
        const ctx = loop.ctx
        ctx.restore();
        ctx.fillStyle = BAR_COLOR;
        ctx.beginPath();
        const right = _offsetX + Config.WORLD_WIDTH * _scale;
        const bottom = _offsetY + Config.WORLD_HEIGHT * _scale;
        if (_offsetX > 0) {
            ctx.rect(0, 0, _offsetX, height);
            ctx.rect(right, 0, width - right, height);
        }
        if (_offsetY > 0) {
            ctx.rect(0, 0, width, _offsetY);
            ctx.rect(0, bottom, width, height - bottom);
        }
        ctx.fill();
    }

    function toWorld(screenX, screenY) {
        return [(screenX - _offsetX) / _scale, (screenY - _offsetY) / _scale];
    }

    return { resize, begin, end, toWorld, get scale() { return _scale; } };
})();
